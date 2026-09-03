#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseRouteRegistrySource } from './route-source-parser.mjs';

const root = process.cwd();
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const strict = args.includes('--strict');
const requestedScope = (args.find(arg => arg.startsWith('--scope=')) || '--scope=changed').slice('--scope='.length);
const appRoot = path.join(root, 'wego-app');
const libraryRoot = path.join(root, '.codex/skills/wego-design');
const report = {
  root: '.',
  mode: strict ? 'strict' : 'baseline',
  scope: requestedScope,
  errors: [],
  warnings: [],
  info: [],
  metrics: {
    changedFiles: 0,
    validatedScenes: 0,
    validatedIterations: 0,
    conditionalToolTests: 0
  }
};

function add(severity, code, message, file = null) {
  const bucket = severity === 'warning' ? 'warnings' : severity === 'info' ? 'info' : 'errors';
  report[bucket].push({
    code,
    message,
    file: file ? path.relative(root, file).replaceAll(path.sep, '/') : null
  });
}

function relative(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function requireFiles(files) {
  for (const file of files) {
    if (!exists(file)) add('error', 'required.missing', `缺少运行所需文件：${file}`, path.join(root, file));
  }
}

function gitNames(args) {
  const result = spawnSync('git', ['-c', 'core.quotepath=false', ...args], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    add('error', 'git.diff_failed', (result.stderr || result.stdout || '无法读取 Git 变更').trim());
    return [];
  }
  return (result.stdout || '').split('\n').map(item => item.trim()).filter(Boolean);
}

function changedFiles() {
  return [...new Set([
    ...gitNames(['diff', '--name-only']),
    ...gitNames(['diff', '--cached', '--name-only']),
    ...gitNames(['ls-files', '--others', '--exclude-standard'])
  ])].sort();
}

const changed = changedFiles();
const changedSet = new Set(changed);
report.metrics.changedFiles = changed.length;

function changedSome(predicate) {
  return changed.some(predicate);
}

function runNode(script, scriptArgs, code, file = script) {
  if (!exists(script)) {
    add('error', 'required.missing', `缺少运行所需文件：${script}`, path.join(root, script));
    return false;
  }
  const result = spawnSync(process.execPath, [script, ...scriptArgs], { cwd: root, encoding: 'utf8' });
  if (result.status === 0) return true;
  const output = (result.stderr || result.stdout || `${script} 执行失败`).trim();
  add('error', code, output, path.join(root, file));
  return false;
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
  } catch (error) {
    add('error', 'json.invalid', `${relativePath} 无法解析：${error.message}`, path.join(root, relativePath));
    return null;
  }
}

function checkSkillFlow() {
  const workflowFiles = [
    'AGENTS.md',
    '.codex/skills/README.md',
    '.codex/skills/wego-product/SKILL.md',
    '.codex/skills/wego-product/references/iteration-workflow.md',
    '.codex/skills/wego-product/references/scope-and-boundaries.md',
    '.codex/skills/wego-design/SKILL.md',
    '.codex/skills/wego-design/references/interaction-prototype-design.md',
    '.codex/skills/wego-design/references/library-map.md',
    '.codex/skills/wego-design/references/scene-contract.md',
    '.codex/skills/wego-uxsystem-iterate/SKILL.md',
    '.codex/skills/wego-uxsystem-iterate/references/sync-matrix.md',
    '.codex/skills/wego-github-delivery/SKILL.md',
    '.codex/skills/wego-github-delivery/references/github-delivery-rules.md'
  ];
  requireFiles(workflowFiles);
  for (const file of workflowFiles.filter(exists)) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const link = match[1].trim();
      if (!link || /^(?:[a-z]+:|#|\/)/i.test(link)) continue;
      const target = path.resolve(path.dirname(path.join(root, file)), link.split('#')[0]);
      if (!fs.existsSync(target)) add('error', 'workflow.link_missing', `工作流引用不存在：${link}`, path.join(root, file));
    }
  }
}

function checkSkillAdapters() {
  const sourceRoot = path.join(root, '.codex/skills');
  const adapters = ['.trae/skills', '.codebuddy/skills'];
  if (!fs.existsSync(sourceRoot)) {
    add('error', 'skills.source_missing', '缺少技能权威源目录：.codex/skills', sourceRoot);
    return;
  }

  const sourceSkills = fs.readdirSync(sourceRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();

  for (const adapter of adapters) {
    const adapterRoot = path.join(root, adapter);
    if (!fs.existsSync(adapterRoot)) {
      add('error', 'skills.adapter_missing', `缺少技能适配器目录：${adapter}`, adapterRoot);
      continue;
    }

    // 整目录符号链接方案：适配器目录本身就是指向 .codex/skills 的符号链接，子项即权威源本体，逐项校验跳过。
    if (fs.lstatSync(adapterRoot).isSymbolicLink()) {
      try {
        if (fs.realpathSync(adapterRoot) !== fs.realpathSync(sourceRoot)) {
          add('error', 'skills.adapter_target', `${adapter} 整目录符号链接未指向 .codex/skills`, adapterRoot);
        }
      } catch {
        add('error', 'skills.adapter_target', `${adapter} 的整目录符号链接无效`, adapterRoot);
      }
      continue;
    }

    const adapterEntries = new Set(fs.readdirSync(adapterRoot));
    for (const skill of sourceSkills) {
      const source = path.join(sourceRoot, skill);
      const target = path.join(adapterRoot, skill);
      let stat;
      try {
        stat = fs.lstatSync(target);
      } catch {
        add('error', 'skills.adapter_link_missing', `${adapter} 未链接权威技能：${skill}`, target);
        continue;
      }
      if (!stat.isSymbolicLink()) {
        add('error', 'skills.adapter_not_link', `${adapter}/${skill} 必须是指向权威源的符号链接`, target);
        continue;
      }
      try {
        if (fs.realpathSync(target) !== fs.realpathSync(source)) {
          add('error', 'skills.adapter_target', `${adapter}/${skill} 未指向 .codex/skills/${skill}`, target);
        }
      } catch {
        add('error', 'skills.adapter_target', `${adapter}/${skill} 的符号链接无效`, target);
      }
    }

    for (const entry of adapterEntries) {
      if (!sourceSkills.includes(entry)) {
        add('error', 'skills.adapter_extra', `${adapter} 存在不属于 .codex/skills 的额外资源：${entry}`, path.join(adapterRoot, entry));
      }
    }
  }
}

function checkWorkflowContracts() {
  runNode('scripts/iteration-record.mjs', ['test'], 'workflow.iteration_test');
  runNode('scripts/validate-scene-iteration-binding.mjs', ['test'], 'workflow.iteration_binding_test');
  runNode('scripts/resolve-delivery-unit.mjs', ['test'], 'workflow.delivery_intake_test');
  runNode('scripts/build-routes.mjs', ['--check'], 'workflow.routes_check');
}

const systemRuntimePrefixes = [
  '.codex/skills/wego-design/assets/',
  '.codex/skills/wego-design/components/',
  '.codex/skills/wego-design/preview/',
  '.codex/skills/wego-design/runtime/',
  '.codex/skills/wego-design/ui_kits/'
];
const systemRuntimeFiles = new Set([
  '.codex/skills/wego-design/colors_and_type.css',
  '.codex/skills/wego-design/components.css',
  '.codex/skills/wego-design/css.json',
  '.codex/skills/wego-design/iconfont.css',
  '.codex/skills/wego-design/library-consumption.json',
  '.codex/skills/wego-design/metadata.json',
  '.codex/skills/wego-design/page-layers.json',
  '.codex/skills/wego-design/scaffold.css',
  '.codex/skills/wego-design/uikit-plan.json'
]);
const isSystemRuntimeFile = file => systemRuntimeFiles.has(file) || systemRuntimePrefixes.some(prefix => file.startsWith(prefix));
const systemRuntimeChanged = changedSome(isSystemRuntimeFile);
const isDeployLibraryFile = file => (
  file.startsWith('.codex/skills/wego-design/assets/')
  || [
    '.codex/skills/wego-design/colors_and_type.css',
    '.codex/skills/wego-design/components.css',
    '.codex/skills/wego-design/iconfont.css'
  ].includes(file)
);

function checkSystemMetadata() {
  requireFiles(['.codex/skills/wego-design/metadata.json']);
  if (!exists('.codex/skills/wego-design/metadata.json')) return;
  const metadata = readJson('.codex/skills/wego-design/metadata.json');
  if (metadata && (!Number.isInteger(metadata.version) || metadata.version < 1)) {
    add('error', 'metadata.version', 'metadata.version 必须为正整数', path.join(libraryRoot, 'metadata.json'));
  }
  if (systemRuntimeChanged && !changedSet.has('.codex/skills/wego-design/metadata.json')) {
    add('error', 'metadata.version_required', '设计系统运行时源变化时必须同步递增 metadata.version', path.join(libraryRoot, 'metadata.json'));
  }
}

// runtime/ 只允许设计系统通用组件运行时：允许集合由 components/*.json 的 slug 派生，
// 组件迭代新增时自动放行（无需改守卫）；业务文件（发布产品/帮卖/走查等）必须归属 wego-app/js 与 wego-app/css。
function checkDesignRuntimeBoundary() {
  const runtimeDir = path.join(libraryRoot, 'runtime');
  if (!fs.existsSync(runtimeDir) || !fs.statSync(runtimeDir).isDirectory()) return;
  const componentsDir = path.join(libraryRoot, 'components');
  const componentSlugs = new Set();
  if (fs.existsSync(componentsDir) && fs.statSync(componentsDir).isDirectory()) {
    for (const entry of fs.readdirSync(componentsDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.json') || entry.name === 'index.json') continue;
      try {
        const data = JSON.parse(fs.readFileSync(path.join(componentsDir, entry.name), 'utf8'));
        if (data && typeof data.slug === 'string') componentSlugs.add(data.slug);
      } catch { /* 单个组件文件解析失败不阻断守卫，交由组件契约校验处理 */ }
    }
  }
  for (const entry of fs.readdirSync(runtimeDir, { withFileTypes: true })) {
    const base = entry.name.replace(/\.(js|css|json)$/i, '');
    if (!componentSlugs.has(base)) {
      add('error', 'runtime.business_file',
        `runtime/ 只允许设计系统通用组件运行时（允许集合由 components/*.json 的 slug 派生），业务文件应归属 wego-app/js 或 wego-app/css：${entry.name}`,
        path.join(runtimeDir, entry.name));
    }
  }
}

function checkLibrarySync() {
  runNode('scripts/sync-wego-app-lib.mjs', ['--check', '--json'], 'app.lib_out_of_sync', 'wego-app/lib');
}

function appRoutes() {
  const routesFile = path.join(appRoot, 'js/routes.js');
  if (!fs.existsSync(routesFile)) {
    add('error', 'required.missing', '缺少 wego-app/js/routes.js', routesFile);
    return [];
  }
  try {
    return parseRouteRegistrySource(fs.readFileSync(routesFile, 'utf8'));
  } catch (error) {
    add('error', 'app.routes_invalid', error.message, routesFile);
    return [];
  }
}

function sceneNameFromRoute(record) {
  return record.scene || /^scenes\/[^/]+\/([^/]+)\/scene\.js$/.exec(record.script || '')?.[1] || null;
}

// 场景名 → 分类目录相对路径（如 '开单' → 'bcg/开单'），通过扫描目录解析
function resolveSceneRelPath(scene) {
  const scenesRoot = path.join(appRoot, 'scenes');
  if (!fs.existsSync(scenesRoot)) return null;
  for (const category of fs.readdirSync(scenesRoot, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const candidate = path.join(scenesRoot, category.name, scene);
    if (fs.existsSync(candidate)) return `${category.name}/${scene}`;
  }
  return null;
}

function sceneDirectories() {
  const scenesRoot = path.join(appRoot, 'scenes');
  if (!fs.existsSync(scenesRoot)) return [];
  const scenes = [];
  for (const category of fs.readdirSync(scenesRoot, { withFileTypes: true })) {
    if (!category.isDirectory() || category.name.startsWith('_')) continue;
    const categoryRoot = path.join(scenesRoot, category.name);
    for (const entry of fs.readdirSync(categoryRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
      if (['scene.js', 'scene.css'].some(file => fs.existsSync(path.join(categoryRoot, entry.name, file)))) {
        scenes.push(entry.name);
      }
    }
  }
  return scenes.sort();
}

function checkAppHost(requireSceneCoverage = false) {
  requireFiles(['wego-app/index.html', 'wego-app/js/app.js', 'wego-app/js/routes.js']);
  if (!exists('wego-app/index.html') || !exists('wego-app/js/app.js') || !exists('wego-app/js/routes.js')) return [];
  const index = fs.readFileSync(path.join(appRoot, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(appRoot, 'js/app.js'), 'utf8');
  for (const marker of ['data-host-shell="true"', 'data-scene-layer', 'data-overlay-layer']) {
    if (!index.includes(marker)) add('error', 'app.host_missing', `唯一宿主缺少 ${marker}`, path.join(appRoot, 'index.html'));
  }
  if (!app.includes('window.WegoApp') || !app.includes('registerScene')) {
    add('error', 'app.registration_missing', 'App 宿主必须提供 window.WegoApp.registerScene', path.join(appRoot, 'js/app.js'));
  }
  const routes = appRoutes();
  const routedScenes = new Set();
  for (const route of routes) {
    const scene = sceneNameFromRoute(route);
    if (scene) routedScenes.add(scene);
    for (const asset of [route.script, route.style, route.entry?.icon].filter(Boolean)) {
      const target = path.join(appRoot, asset);
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        add('error', 'app.route_asset_missing', `路由 ${route.routeId} 引用了不存在的资源：${asset}`, target);
      }
    }
  }
  if (requireSceneCoverage) {
    for (const scene of sceneDirectories()) {
      const rel = resolveSceneRelPath(scene);
      if (!routedScenes.has(scene)) add('error', 'app.scene_unrouted', `场景 ${scene} 没有 routes.js 路由`, rel ? path.join(appRoot, rel) : path.join(appRoot, 'scenes', scene));
    }
  }
  return [...routedScenes].sort();
}

function checkBusinessComponents() {
  // 业务组件（library-consumption.json#/businessComponentRegistry）一旦在 runtime/ 权威源创建，
  // 必须在 index.html 全局加载其 css 与 lib/js 脚本，否则场景经 WegoApp.open{Component} 消费会静默失败。
  const consumptionFile = '.codex/skills/wego-design/library-consumption.json';
  const consumption = exists(consumptionFile) ? readJson(consumptionFile) : null;
  const registry = consumption?.businessComponentRegistry || [];
  if (!registry.length) return;
  const indexPath = path.join(appRoot, 'index.html');
  if (!fs.existsSync(indexPath)) return;
  const index = fs.readFileSync(indexPath, 'utf8');
  for (const bc of registry) {
    const sourceJs = path.join(libraryRoot, 'runtime', `${bc.slug}.js`);
    if (!fs.existsSync(sourceJs)) continue; // 组件尚未在权威源创建，跳过
    for (const asset of bc.load || []) {
      if (!index.includes(asset)) {
        add('error', 'business_component.not_loaded', `业务组件 ${bc.slug}（${bc.api}）未在 index.html 全局加载：${asset}`, indexPath);
      }
    }
  }
}

function sceneFromChangedPath(file) {
  const match = /^wego-app\/scenes\/[^/]+\/([^/]+)\/(.+)$/.exec(file);
  if (!match || match[2].startsWith('_iterations/')) return null;
  return match[1];
}

function recordSceneValidatorResult(result, { code, label, scene = null, file = null }) {
  let details = null;
  try { details = JSON.parse(result.stdout || '{}'); } catch { /* 使用原始输出。 */ }
  for (const warning of details?.warnings || []) {
    add(
      'warning',
      warning.code || 'scene.warning',
      `${warning.scene ? `场景 ${warning.scene}：` : scene ? `场景 ${scene}：` : ''}${warning.message || '验证建议'}`,
      warning.file ? path.resolve(root, warning.file) : file
    );
  }
  if (result.status === 0) return details;
  const messages = (details?.errors || []).map(item => (
    `${item.scene ? `${item.scene}：` : ''}${item.message || ''}`
  )).filter(Boolean);
  add(
    'error',
    code,
    `${scene ? `场景 ${scene} ` : ''}未通过${label}验证：${messages.join('；') || (result.stderr || result.stdout || '未知错误').trim()}`,
    file
  );
  return details;
}

function validateScenes(scenes) {
  requireFiles(['scripts/validate-scene-contract.mjs']);
  const staticAvailable = exists('scripts/validate-scene-contract.mjs');
  const targets = [...new Set(scenes)].sort();
  for (const scene of targets) {
    const rel = resolveSceneRelPath(scene);
    if (!rel) continue;
    const directory = path.join(appRoot, rel);
    if (!fs.existsSync(directory)) continue;
    const missing = ['scene.js', 'scene.css'].filter(file => !fs.existsSync(path.join(directory, file)));
    if (missing.length) {
      add('error', 'scene.file_missing', `场景 ${scene} 缺少 ${missing.join('、')}`, directory);
      continue;
    }
    report.metrics.validatedScenes += 1;
    if (staticAvailable) {
      const contract = spawnSync(process.execPath, [
        'scripts/validate-scene-contract.mjs',
        relative(directory),
        '--json'
      ], { cwd: root, encoding: 'utf8' });
      recordSceneValidatorResult(contract, {
        code: 'scene.contract_failed',
        label: '静态',
        scene,
        file: directory
      });
    }
  }
}

function iterationFilesForScenes(scenes) {
  const records = [];
  for (const scene of scenes) {
    const rel = resolveSceneRelPath(scene);
    if (!rel) continue;
    const iterationsRoot = path.join(appRoot, rel, '_iterations');
    if (!fs.existsSync(iterationsRoot)) continue;
    const visit = directory => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) visit(target);
        else if (entry.isFile() && entry.name === 'iteration.json') records.push(relative(target));
      }
    };
    visit(iterationsRoot);
  }
  return records;
}

function checkIterations({ all = false, scenes = [], explicitFiles = [] } = {}) {
  if (all) {
    if (runNode('scripts/iteration-record.mjs', ['check'], 'iteration.check')) {
      const recordsRoot = path.join(appRoot, 'scenes');
      const count = fs.existsSync(recordsRoot)
        ? sceneDirectories().flatMap(scene => iterationFilesForScenes([scene])).length
        : 0;
      report.metrics.validatedIterations += count;
    }
    return;
  }
  const records = [...new Set([
    ...explicitFiles.filter(file => exists(file)),
    ...iterationFilesForScenes(scenes)
  ])].sort();
  for (const file of records) {
    if (runNode('scripts/iteration-record.mjs', ['check', '--file', file], 'iteration.check', file)) {
      report.metrics.validatedIterations += 1;
    }
  }
}

function conditionalToolTests() {
  const mappings = [
    {
      matches: file => ['scripts/iteration-record.mjs', 'scripts/route-source-parser.mjs'].includes(file),
      script: 'scripts/iteration-record.mjs',
      args: ['test'],
      code: 'iteration.test'
    },
    {
      matches: file => file === 'scripts/validate-scene-iteration-binding.mjs',
      script: 'scripts/validate-scene-iteration-binding.mjs',
      args: ['test'],
      code: 'iteration_binding.test'
    },
    {
      matches: file => ['scripts/sync-wego-app-lib.mjs', 'scripts/test-sync-wego-app-lib.mjs'].includes(file),
      script: 'scripts/test-sync-wego-app-lib.mjs',
      args: [],
      code: 'sync.test'
    },
    {
      matches: file => ['scripts/validate-scene-contract.mjs', 'scripts/scene-source-parser.mjs', 'scripts/test-scene-contract-tools.mjs'].includes(file),
      script: 'scripts/test-scene-contract-tools.mjs',
      args: [],
      code: 'scene_contract.test'
    },
    {
      matches: file => ['wego-app/js/scroll-layout.js', 'scripts/test-scroll-layout.mjs'].includes(file),
      script: 'scripts/test-scroll-layout.mjs',
      args: [],
      code: 'scroll_layout.test'
    },
    {
      matches: file => file === 'scripts/cleanup-task-artifacts.mjs',
      script: 'scripts/cleanup-task-artifacts.mjs',
      args: ['test', '--json'],
      code: 'cleanup.test'
    }
  ];
  for (const mapping of mappings) {
    if (!changedSome(mapping.matches)) continue;
    report.metrics.conditionalToolTests += 1;
    runNode(mapping.script, mapping.args, mapping.code);
  }
}

function runChangedScope() {
  const syncChanged = changedSome(file => (
    isDeployLibraryFile(file)
    || file.startsWith('wego-app/lib/')
    || file === 'scripts/sync-wego-app-lib.mjs'
  ));
  if (systemRuntimeChanged) checkSystemMetadata();
  if (syncChanged) checkLibrarySync();

  const hostChanged = changedSome(file => ['wego-app/index.html', 'wego-app/js/app.js', 'wego-app/js/routes.js'].includes(file));
  let routedScenes = [];
  if (hostChanged) routedScenes = checkAppHost(changedSet.has('wego-app/js/routes.js'));

  const changedScenes = changed.map(sceneFromChangedPath).filter(Boolean);
  const targetScenes = changedSet.has('wego-app/js/routes.js')
    ? [...new Set([...changedScenes, ...routedScenes])]
    : changedScenes;
  validateScenes(targetScenes);
  if (targetScenes.length) {
    runNode('scripts/validate-scene-iteration-binding.mjs', [...targetScenes, '--json'], 'scene.iteration_unbound');
  }

  const explicitIterationFiles = changed.filter(file => /\/_iterations\/[^/]+\/iteration\.json$/.test(file));
  const iterationImplementationChanged = changedSet.has('scripts/iteration-record.mjs') || changedSet.has('scripts/route-source-parser.mjs');
  checkIterations({
    all: changedSet.has('wego-app/js/routes.js') || iterationImplementationChanged,
    scenes: targetScenes,
    explicitFiles: explicitIterationFiles
  });
  checkBusinessComponents();
  conditionalToolTests();
}

function runSystemScope() {
  checkSystemMetadata();
  checkLibrarySync();
  checkWorkflowContracts();
}

function runFullScope() {
  checkSystemMetadata();
  checkLibrarySync();
  checkWorkflowContracts();
  checkAppHost(true);
  validateScenes(sceneDirectories());
  runNode('scripts/validate-scene-iteration-binding.mjs', ['--all', '--json'], 'scene.iteration_unbound');
  checkIterations({ all: true });
  checkBusinessComponents();
}

function main() {
  if (!['changed', 'system', 'full'].includes(requestedScope)) {
    add('error', 'args.scope', `未知范围：${requestedScope}`);
  } else {
    checkSkillFlow();
    checkSkillAdapters();
    checkDesignRuntimeBoundary();
    if (requestedScope === 'changed') runChangedScope();
    else if (requestedScope === 'system') runSystemScope();
    else runFullScope();
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ ...report, ok: report.errors.length === 0 }, null, 2));
  } else {
    console.log(report.errors.length ? 'wego-design 守门验证失败' : 'wego-design 守门验证通过');
    for (const item of report.errors) console.error(`- [${item.code}] ${item.file || ''} ${item.message}`);
    for (const item of report.warnings) console.warn(`- [${item.code}] ${item.file || ''} ${item.message}`);
  }
  process.exit(report.errors.length ? 1 : 0);
}

main();
