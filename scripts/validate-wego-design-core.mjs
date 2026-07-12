#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const requestedScope = (args.find(arg => arg.startsWith('--scope=')) || '--scope=changed').slice('--scope='.length);
const strict = args.includes('--strict');
const libraryRoot = path.join(root, '.codex/skills/wego-design');
const appRoot = path.join(root, 'wego-app');
const report = { root: '.codex/skills/wego-design', mode: strict ? 'strict' : 'baseline', scope: requestedScope, errors: [], warnings: [], info: [], metrics: {} };

function add(severity, code, message, file = null) {
  report[severity === 'warning' ? 'warnings' : severity === 'info' ? 'info' : 'errors'].push({ code, message, file: file ? path.relative(root, file).replaceAll(path.sep, '/') : null });
}

function exists(relative) { return fs.existsSync(path.join(root, relative)); }
function read(relative) { return fs.readFileSync(path.join(root, relative), 'utf8'); }
function readJson(relative) {
  try { return JSON.parse(read(relative)); }
  catch (error) { add('error', 'json.invalid', `${relative} 无法解析：${error.message}`, path.join(root, relative)); return null; }
}
function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(target));
    else if (entry.isFile()) files.push(target);
  }
  return files;
}
function changedFiles() {
  const tracked = spawnSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' });
  const untracked = spawnSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' });
  return [...new Set(`${tracked.stdout || ''}\n${untracked.stdout || ''}`.split('\n').map(item => item.trim()).filter(Boolean))];
}
function cssVars(source) { return new Set([...source.matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1])); }
function rawColors(source) { return [...new Set([...source.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(/g)].map(match => match[0]))]; }
function compareTrees(source, target, relative = '') {
  const sourcePath = path.join(source, relative);
  const targetPath = path.join(target, relative);
  if (!fs.existsSync(sourcePath) || !fs.existsSync(targetPath)) return false;
  const sourceEntries = fs.readdirSync(sourcePath, { withFileTypes: true });
  const targetEntries = fs.readdirSync(targetPath, { withFileTypes: true });
  if (sourceEntries.length !== targetEntries.length) return false;
  for (const sourceEntry of sourceEntries) {
    const targetEntry = targetEntries.find(entry => entry.name === sourceEntry.name);
    if (!targetEntry || sourceEntry.isDirectory() !== targetEntry.isDirectory()) return false;
    const child = path.join(relative, sourceEntry.name);
    if (sourceEntry.isDirectory()) { if (!compareTrees(source, target, child)) return false; }
    else if (!fs.readFileSync(path.join(source, child)).equals(fs.readFileSync(path.join(target, child)))) return false;
  }
  return true;
}

function checkRequiredFiles() {
  const required = [
    '.codex/skills/wego-product/SKILL.md',
    '.codex/skills/wego-design/SKILL.md',
    '.codex/skills/wego-uxsystem-iterate/SKILL.md',
    '.codex/skills/wego-design/colors_and_type.css',
    '.codex/skills/wego-design/components.css',
    '.codex/skills/wego-design/components/index.json',
    '.codex/skills/wego-design/library-consumption.json',
    '.codex/skills/wego-design/uikit-plan.json',
    'wego-app/index.html',
    'wego-app/js/app.js',
    'wego-app/js/routes.js',
    'scripts/iteration-record.mjs',
    'scripts/validate-component-contract-parity.mjs',
    'scripts/validate-skill-entry-boundary.mjs',
    'scripts/validate-scene-contract.mjs',
    'scripts/extract-design-decisions.mjs',
    'scripts/test-scene-contract-tools.mjs'
  ];
  for (const relative of required) if (!exists(relative)) add('error', 'required.missing', `缺少当前工作流必需文件：${relative}`, path.join(root, relative));
  for (const removed of ['.codex/skills/wego-ux', '.codex/skills/wego-tests', '.codex/skills/wego-design/specs', 'docs/specs', 'scripts/specs.mjs', 'scripts/specs-core.mjs']) {
    if (exists(removed)) add('error', 'legacy.path_present', `已删除路径仍存在：${removed}`, path.join(root, removed));
  }
}

function checkLibrarySchema() {
  const index = readJson('.codex/skills/wego-design/components/index.json');
  const plan = readJson('.codex/skills/wego-design/uikit-plan.json');
  const consumption = readJson('.codex/skills/wego-design/library-consumption.json');
  const metadata = readJson('.codex/skills/wego-design/metadata.json');
  if (!index || !plan || !consumption || !metadata) return;
  if (index.schemaVersion !== 4 || index.componentContractSchemaVersion !== 4) add('error', 'library.component_schema', '组件索引必须使用 schemaVersion 4', path.join(libraryRoot, 'components/index.json'));
  if (plan.schemaVersion !== 4 || consumption.schemaVersion !== 4) add('error', 'library.schema', 'UI Kit 与消费契约必须使用 schemaVersion 4', libraryRoot);
  if (!Number.isInteger(metadata.version) || metadata.version < 1) add('error', 'library.version', 'metadata.version 必须为正整数', path.join(libraryRoot, 'metadata.json'));
  const slugs = new Set((index.components || []).map(item => item.slug));
  report.metrics.registeredComponents = slugs.size;
  for (const component of index.components || []) {
    const contract = path.join(libraryRoot, 'components', `${component.slug}.json`);
    const preview = path.join(libraryRoot, component.preview || '');
    if (!fs.existsSync(contract)) add('error', 'component.contract_missing', `缺少组件契约：${component.slug}`, contract);
    if (!fs.existsSync(preview)) add('error', 'component.preview_missing', `缺少组件 Preview：${component.slug}`, preview);
  }
  for (const kit of plan.uiKits || []) {
    for (const relative of [kit.entry, kit.qualityReport]) if (!relative || !fs.existsSync(path.join(libraryRoot, relative))) add('error', 'uikit.file_missing', `UI Kit 文件缺失：${relative}`, path.join(libraryRoot, relative || ''));
  }
}

function checkNoLegacyRuntimeReferences() {
  const roots = [path.join(root, 'AGENTS.md'), path.join(root, 'README.md'), path.join(root, '.codex/skills'), path.join(root, 'scripts')];
  const files = roots.flatMap(target => fs.existsSync(target) && fs.statSync(target).isDirectory() ? listFiles(target) : fs.existsSync(target) ? [target] : []);
  const runtime = files.filter(file => /\.(?:md|json|mjs|js|ya?ml|css|html)$/.test(file));
  const guardFiles = new Set([
    path.join(root, 'scripts/validate-wego-design-core.mjs'),
    path.join(root, 'scripts/validate-component-contract-parity.mjs'),
    path.join(root, 'scripts/validate-skill-entry-boundary.mjs')
  ]);
  const checks = [
    { code: 'legacy.skill_reference', pattern: /wego-ux(?!system-iterate)|wego-tests/ },
    { code: 'legacy.spec_reference', pattern: /(?:^|["'`])(?:docs\/)?specs\/|scripts\/specs(?:-core)?\.mjs|specs\.mjs/ },
    { code: 'legacy.design_plan', pattern: /design_plan(?:\.json)?/ },
    { code: 'legacy.interaction_spec', pattern: /interaction[_-]spec(?:\.json)?/ },
    { code: 'legacy.scene_html', pattern: /scenes\/\{route_id\}\/index\.html|scene\.html 若存在/ }
  ];
  for (const file of runtime) {
    if (guardFiles.has(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    for (const check of checks) if (check.pattern.test(content)) add('error', check.code, '存在已删除的运行时规则或路径', file);
  }
}

function checkHistoricalPlanMarkers() {
  const plans = path.join(root, 'docs/plans');
  if (!fs.existsSync(plans)) return;
  const currentPlan = 'wego-design-workflow-final-plan.md';
  const stalePattern = /design[_-]plan|wego-ux(?!system-iterate)|wego-tests|specs(?:\/|\.mjs)|acceptance_report/;
  const tracked = spawnSync('git', ['ls-files', 'docs/plans'], { cwd: root, encoding: 'utf8' });
  const files = (tracked.stdout || '').split('\n').map(item => item.trim()).filter(item => item.endsWith('.md')).map(item => path.basename(item));
  for (const file of files.filter(name => name !== currentPlan)) {
    const target = path.join(plans, file);
    const content = fs.readFileSync(target, 'utf8');
    if (stalePattern.test(content) && !content.slice(0, 600).includes('历史归档文档')) add('error', 'history.plan_unmarked', `旧工作流计划必须明确标记为历史归档：${file}`, target);
  }
}

function checkAppHost() {
  const index = read('wego-app/index.html');
  const app = read('wego-app/js/app.js');
  const routes = read('wego-app/js/routes.js');
  for (const required of ['data-host-shell="true"', 'data-scene-layer', 'data-overlay-layer']) if (!index.includes(required)) add('error', 'app.host_missing', `唯一宿主缺少 ${required}`, path.join(appRoot, 'index.html'));
  if (!app.includes('window.WegoApp') || !app.includes('registerScene')) add('error', 'app.registration_missing', 'App 宿主必须提供 window.WegoApp.registerScene', path.join(appRoot, 'js/app.js'));
  if (!routes.includes('window.WEGO_APP_ROUTES')) add('error', 'app.routes_missing', 'routes.js 必须初始化 window.WEGO_APP_ROUTES', path.join(appRoot, 'js/routes.js'));
  const scenesPath = path.join(appRoot, 'scenes');
  const scenes = fs.existsSync(scenesPath) ? fs.readdirSync(scenesPath, { withFileTypes: true }).filter(entry => entry.isDirectory() && !entry.name.startsWith('_')).map(entry => entry.name) : [];
  report.metrics.scenes = scenes.length;
  for (const scene of scenes) {
    const dir = path.join(scenesPath, scene);
    for (const file of ['scene.js', 'scene.css', 'design-decisions.json']) if (!fs.existsSync(path.join(dir, file))) add('error', 'scene.file_missing', `场景 ${scene} 缺少 ${file}`, path.join(dir, file));
    if (!fs.existsSync(path.join(dir, 'scene.js')) || !fs.existsSync(path.join(dir, 'scene.css'))) continue;
    const js = fs.readFileSync(path.join(dir, 'scene.js'), 'utf8');
    const css = fs.readFileSync(path.join(dir, 'scene.css'), 'utf8');
    if (!js.includes('window.WegoApp.registerScene')) add('error', 'scene.register_missing', `场景 ${scene} 未注册 registerScene`, path.join(dir, 'scene.js'));
    if (!js.includes('data-surface-id') || !js.includes('data-route-id') || !js.includes('data-page-pattern')) add('error', 'scene.annotation_missing', `场景 ${scene} 缺少根设计标注`, path.join(dir, 'scene.js'));
    if (rawColors(`${js}\n${css}`).length) add('error', 'scene.raw_color', `场景 ${scene} 含硬编码颜色`, dir);
    const validation = spawnSync(process.execPath, ['scripts/validate-scene-contract.mjs', path.relative(root, dir), '--json'], { cwd: root, encoding: 'utf8' });
    if (validation.status !== 0) {
      let details;
      try { details = JSON.parse(validation.stdout || '{}'); }
      catch { details = { errors: [{ message: validation.stderr || validation.stdout || '场景合同检查失败' }] }; }
      add('error', 'scene.contract_failed', `场景 ${scene} 未通过场景合同：${(details.errors || []).map(item => item.message).join('；')}`, dir);
    }
  }
}

function checkLibrarySync() {
  const targets = ['colors_and_type.css', 'components.css', 'iconfont.css'];
  for (const name of targets) {
    const source = path.join(libraryRoot, name);
    const copy = path.join(appRoot, 'lib', name);
    if (!fs.existsSync(copy) || !fs.readFileSync(source).equals(fs.readFileSync(copy))) add('error', 'app.lib_out_of_sync', `wego-app/lib/${name} 与设计系统源不同步`, copy);
  }
  if (!compareTrees(path.join(libraryRoot, 'assets'), path.join(appRoot, 'lib/assets'))) add('error', 'app.assets_out_of_sync', 'wego-app/lib/assets 与设计系统源不同步', path.join(appRoot, 'lib/assets'));
}

function checkIteration() {
  const result = spawnSync(process.execPath, ['scripts/iteration-record.mjs', 'check'], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) add('error', 'iteration.check', (result.stderr || result.stdout || '迭代检查失败').trim(), path.join(root, 'scripts/iteration-record.mjs'));
  const tests = spawnSync(process.execPath, ['scripts/iteration-record.mjs', 'test'], { cwd: root, encoding: 'utf8' });
  if (tests.status !== 0) add('error', 'iteration.test', (tests.stderr || tests.stdout || '迭代脚本测试失败').trim(), path.join(root, 'scripts/iteration-record.mjs'));
}

function checkSceneContractTools() {
  const tests = spawnSync(process.execPath, ['scripts/test-scene-contract-tools.mjs'], { cwd: root, encoding: 'utf8' });
  if (tests.status !== 0) add('error', 'scene_contract.test', (tests.stderr || tests.stdout || '场景合同工具测试失败').trim(), path.join(root, 'scripts/test-scene-contract-tools.mjs'));
}

function checkSkillEntryBoundary() {
  const result = spawnSync(process.execPath, ['scripts/validate-skill-entry-boundary.mjs'], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) add('error', 'skill_entry.check', (result.stderr || result.stdout || '技能入口校验失败').trim(), path.join(root, 'scripts/validate-skill-entry-boundary.mjs'));
}

function checkMetadataVersion() {
  const changed = changedFiles();
  const systemChanged = changed.some(file => file.startsWith('.codex/skills/wego-design/') && !file.startsWith('.codex/skills/wego-design/preview/index.html'));
  if (systemChanged && !changed.includes('.codex/skills/wego-design/metadata.json')) add('error', 'metadata.version_required', '设计系统源有变更时必须递增 metadata.version', path.join(libraryRoot, 'metadata.json'));
}

function main() {
  if (!['changed', 'system', 'full'].includes(requestedScope)) add('error', 'args.scope', `未知范围：${requestedScope}`);
  checkRequiredFiles();
  if (report.errors.length === 0) {
    checkLibrarySchema();
    checkNoLegacyRuntimeReferences();
    checkHistoricalPlanMarkers();
    checkAppHost();
    checkLibrarySync();
    checkIteration();
    checkSceneContractTools();
    checkSkillEntryBoundary();
    checkMetadataVersion();
  }
  report.metrics.changedFiles = changedFiles().length;
  if (jsonOutput) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(report.errors.length ? 'wego-design 守门验证失败' : 'wego-design 守门验证通过');
    for (const item of report.errors) console.error(`- [${item.code}] ${item.file || ''} ${item.message}`);
    for (const item of report.warnings) console.warn(`- [${item.code}] ${item.file || ''} ${item.message}`);
  }
  process.exit(report.errors.length ? 1 : 0);
}

main();
