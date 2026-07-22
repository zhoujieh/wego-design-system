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
    'scripts/test-skill-entry-boundary.mjs',
    'scripts/route-source-parser.mjs',
    'scripts/validate-scene-contract.mjs',
    'scripts/extract-design-decisions.mjs',
    'scripts/prompt-contract-schema.mjs',
    'scripts/test-prompt-contract-schema.mjs',
    'scripts/test-uikit-plan-schema.mjs',
    'scripts/test-scene-contract-tools.mjs',
    'scripts/validate-design-decision-method.mjs',
    'scripts/test-design-decision-method.mjs',
    'scripts/test-sync-wego-app-lib.mjs'
  ];
  for (const relative of required) if (!exists(relative)) add('error', 'required.missing', `缺少当前工作流必需文件：${relative}`, path.join(root, relative));
  for (const removed of [
    '.codex/skills/wego-ux',
    '.codex/skills/wego-tests',
    '.codex/skills/wego-design/specs',
    'docs/specs',
    'docs/DESIGN.md',
    'docs/plans/wego-design-implementation-spec.md',
    'docs/plans/wego-design-workflow-final-plan.md',
    'docs/plans/wego-design-workflow-optimization-plan.md',
    'scripts/specs.mjs',
    'scripts/specs-core.mjs'
  ]) {
    if (exists(removed)) add('error', 'legacy.path_present', `已删除路径仍存在：${removed}`, path.join(root, removed));
  }
}

function checkLibrarySchema() {
  const index = readJson('.codex/skills/wego-design/components/index.json');
  const plan = readJson('.codex/skills/wego-design/uikit-plan.json');
  const consumption = readJson('.codex/skills/wego-design/library-consumption.json');
  const metadata = readJson('.codex/skills/wego-design/metadata.json');
  const tokenStructure = readJson('.codex/skills/wego-design/css.json');
  if (!index || !plan || !consumption || !metadata || !tokenStructure) return;
  if (index.schemaVersion !== 4 || index.componentContractSchemaVersion !== 4) add('error', 'library.component_schema', '组件索引必须使用 schemaVersion 4', path.join(libraryRoot, 'components/index.json'));
  if (plan.schemaVersion !== 5 || consumption.schemaVersion !== 5) add('error', 'library.schema', 'UI Kit 与消费契约必须使用 schemaVersion 5', libraryRoot);
  if (!Number.isInteger(metadata.version) || metadata.version < 1) add('error', 'library.version', 'metadata.version 必须为正整数', path.join(libraryRoot, 'metadata.json'));
  if (consumption.tokenCss !== 'colors_and_type.css' || Object.hasOwn(consumption, 'tokenSource') || consumption.actualTokenNameReference?.source !== 'colors_and_type.css:root') add('error', 'library.token_authority', '实际 Token 名必须且只能以 colors_and_type.css:root 为权威；css.json 仅作结构索引', path.join(libraryRoot, 'library-consumption.json'));
  if (Object.hasOwn(consumption, 'recommendedReadOrder')) add('error', 'library.read_order_duplicate', '消费契约不得重复维护技能读取顺序', path.join(libraryRoot, 'library-consumption.json'));
  const designSkill = read('.codex/skills/wego-design/SKILL.md');
  if (designSkill.includes('`AGENTS.md`')) add('error', 'library.read_order_agents', 'wego-design 不得重复读取仓库级 AGENTS.md', path.join(libraryRoot, 'SKILL.md'));
  const readMarkers = ['有效迭代与已确认 `prototype_brief`', '[设计决策原则]', '`library-consumption.json`', '`uikit-plan.json`', '`components/index.json`', '本页命中的 Preview', '对应组件契约', '`colors_and_type.css`', '[场景合同]'];
  let previous = -1;
  for (const marker of readMarkers) {
    const position = designSkill.indexOf(marker);
    if (position < 0 || position <= previous) add('error', 'library.read_order', `wego-design 固定读取顺序缺失或错序：${marker}`, path.join(libraryRoot, 'SKILL.md'));
    previous = position;
  }
  const libraryMap = read('.codex/skills/wego-design/references/library-map.md');
  const libraryMapRoot = path.join(libraryRoot, 'references');
  for (const [marker, target] of [['../../../../wego-app/index.html', '../../../../wego-app/index.html'], ['../../../../wego-app/js/routes.js', '../../../../wego-app/js/routes.js'], ['../../../../scripts/*.mjs', '../../../../scripts']]) {
    if (!libraryMap.includes(`\`${marker}\``) || !fs.existsSync(path.resolve(libraryMapRoot, target))) add('error', 'library.asset_map_path', `资产地图路径不存在或未使用正确相对层级：${marker}`, path.join(libraryMapRoot, 'library-map.md'));
  }
  const expectedComponentPlanFields = ['binding_id', 'slug', 'reason', 'variant_dimensions'];
  if (Object.hasOwn(consumption.componentPlan || {}, 'min') || Object.hasOwn(consumption.componentPlan || {}, 'max') || JSON.stringify(consumption.componentPlan?.requiredFields) !== JSON.stringify(expectedComponentPlanFields)) add('error', 'library.component_plan', '组件计划不得限制数量，且只记录不可推导的设计判断', path.join(libraryRoot, 'library-consumption.json'));
  if (JSON.stringify(consumption.pageEdgeModes) !== JSON.stringify(['M0', 'M8', 'M32'])) add('error', 'library.page_edge_modes', '页面边距模式必须且只能为 M0、M8、M32', path.join(libraryRoot, 'library-consumption.json'));
  const expectedPageEdgeTokens = { M0: '--layout-page-margin-m0', M8: '--layout-page-margin-m8', M32: '--layout-page-margin-m32' };
  if (JSON.stringify(consumption.pageEdgeTokens) !== JSON.stringify(expectedPageEdgeTokens)) add('error', 'library.page_edge_tokens', '页面边距模式必须精确映射到 M0、M8、M32 对应 Token', path.join(libraryRoot, 'library-consumption.json'));
  const declaredPageEdgeTokens = [...cssVars(read('.codex/skills/wego-design/colors_and_type.css'))].filter(token => token.startsWith('--layout-page-margin-')).sort();
  const expectedDeclaredPageEdgeTokens = Object.values(expectedPageEdgeTokens).sort();
  if (JSON.stringify(declaredPageEdgeTokens) !== JSON.stringify(expectedDeclaredPageEdgeTokens)) add('error', 'library.page_edge_token_source', 'Token 源中的页面边距必须且只能为 M0、M8、M32', path.join(libraryRoot, 'colors_and_type.css'));
  const structuredPageEdgeTokens = Object.keys(tokenStructure.layout || {}).filter(token => token.startsWith('layout-page-margin-')).sort();
  if (JSON.stringify(structuredPageEdgeTokens) !== JSON.stringify(expectedDeclaredPageEdgeTokens.map(token => token.slice(2)).sort())) add('error', 'library.page_edge_token_structure', 'Token 结构中的页面边距必须且只能为 M0、M8、M32', path.join(libraryRoot, 'css.json'));
  const slugs = new Set((index.components || []).map(item => item.slug));
  report.metrics.registeredComponents = slugs.size;
  for (const component of index.components || []) {
    const contract = path.join(libraryRoot, 'components', `${component.slug}.json`);
    const preview = path.join(libraryRoot, component.preview || '');
    if (!fs.existsSync(contract)) add('error', 'component.contract_missing', `缺少组件契约：${component.slug}`, contract);
    if (!fs.existsSync(preview)) add('error', 'component.preview_missing', `缺少组件 Preview：${component.slug}`, preview);
  }
  for (const pattern of plan.pagePatterns || []) {
    for (const relative of [pattern.uiKit?.entry, pattern.uiKit?.qualityReport]) if (!relative || !fs.existsSync(path.join(libraryRoot, relative))) add('error', 'uikit.file_missing', `UI Kit 文件缺失：${relative}`, path.join(libraryRoot, relative || ''));
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
    { code: 'legacy.scene_html', pattern: /scenes\/\{route_id\}\/index\.html|scene\.html 若存在/ },
    { code: 'legacy.ddr', pattern: /\bDDR\b/ }
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
  const stalePattern = /design[_-]plan|wego-ux(?!system-iterate)|wego-tests|specs(?:\/|\.mjs)|acceptance_report/;
  const files = listFiles(plans).filter(file => file.endsWith('.md'));
  for (const target of files) {
    const file = path.relative(plans, target).replaceAll(path.sep, '/');
    const content = fs.readFileSync(target, 'utf8');
    if (stalePattern.test(content) && !content.slice(0, 600).includes('历史归档文档')) add('error', 'history.plan_unmarked', `旧工作流计划必须明确标记为历史归档：${file}`, target);
  }
}

function checkAppHost(includeBusinessScenes = true) {
  const index = read('wego-app/index.html');
  const app = read('wego-app/js/app.js');
  const routes = read('wego-app/js/routes.js');
  for (const required of ['data-host-shell="true"', 'data-scene-layer', 'data-overlay-layer']) if (!index.includes(required)) add('error', 'app.host_missing', `唯一宿主缺少 ${required}`, path.join(appRoot, 'index.html'));
  if (!app.includes('window.WegoApp') || !app.includes('registerScene')) add('error', 'app.registration_missing', 'App 宿主必须提供 window.WegoApp.registerScene', path.join(appRoot, 'js/app.js'));
  if (!app.includes('if (!route.entry) return;')) add('error', 'app.route_entry_boundary', '宿主不得把无 entry 的下钻路由自动挂到入口列表', path.join(appRoot, 'js/app.js'));
  if (!routes.includes('window.WEGO_APP_ROUTES')) add('error', 'app.routes_missing', 'routes.js 必须初始化 window.WEGO_APP_ROUTES', path.join(appRoot, 'js/routes.js'));
  if (!includeBusinessScenes) return;
  const scenesPath = path.join(appRoot, 'scenes');
  const scenes = fs.existsSync(scenesPath) ? fs.readdirSync(scenesPath, { withFileTypes: true }).filter(entry => entry.isDirectory() && !entry.name.startsWith('_')).map(entry => entry.name) : [];
  report.metrics.scenes = scenes.length;
  for (const scene of scenes) {
    const dir = path.join(scenesPath, scene);
    for (const file of ['scene.js', 'scene.css', 'design-decisions.json']) if (!fs.existsSync(path.join(dir, file))) add('error', 'scene.file_missing', `场景 ${scene} 缺少 ${file}`, path.join(dir, file));
    if (!fs.existsSync(path.join(dir, 'scene.js')) || !fs.existsSync(path.join(dir, 'scene.css'))) continue;
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
  const tests = spawnSync(process.execPath, ['scripts/test-sync-wego-app-lib.mjs'], { cwd: root, encoding: 'utf8' });
  if (tests.status !== 0) add('error', 'app.lib_sync_test', (tests.stderr || tests.stdout || '资源同步脚本测试失败').trim(), path.join(root, 'scripts/test-sync-wego-app-lib.mjs'));
  const check = spawnSync(process.execPath, ['scripts/sync-wego-app-lib.mjs', '--check', '--json'], { cwd: root, encoding: 'utf8' });
  if (check.status !== 0) add('error', 'app.lib_out_of_sync', (check.stderr || check.stdout || 'wego-app/lib 与设计系统源不同步').trim(), path.join(appRoot, 'lib'));
}

function checkIteration(includeBusinessRecords = true) {
  if (includeBusinessRecords) {
    const result = spawnSync(process.execPath, ['scripts/iteration-record.mjs', 'check'], { cwd: root, encoding: 'utf8' });
    if (result.status !== 0) add('error', 'iteration.check', (result.stderr || result.stdout || '迭代检查失败').trim(), path.join(root, 'scripts/iteration-record.mjs'));
  }
  const tests = spawnSync(process.execPath, ['scripts/iteration-record.mjs', 'test'], { cwd: root, encoding: 'utf8' });
  if (tests.status !== 0) add('error', 'iteration.test', (tests.stderr || tests.stdout || '迭代脚本测试失败').trim(), path.join(root, 'scripts/iteration-record.mjs'));
}

function checkSceneContractTools() {
  const uikitTests = spawnSync(process.execPath, ['scripts/test-uikit-plan-schema.mjs'], { cwd: root, encoding: 'utf8' });
  if (uikitTests.status !== 0) add('error', 'uikit_schema.test', (uikitTests.stderr || uikitTests.stdout || 'UI Kit schema 测试失败').trim(), path.join(root, 'scripts/test-uikit-plan-schema.mjs'));
  const schemaTests = spawnSync(process.execPath, ['scripts/test-prompt-contract-schema.mjs'], { cwd: root, encoding: 'utf8' });
  if (schemaTests.status !== 0) add('error', 'prompt_contract_schema.test', (schemaTests.stderr || schemaTests.stdout || 'prompt_contract Schema 测试失败').trim(), path.join(root, 'scripts/test-prompt-contract-schema.mjs'));
  const tests = spawnSync(process.execPath, ['scripts/test-scene-contract-tools.mjs'], { cwd: root, encoding: 'utf8' });
  if (tests.status !== 0) add('error', 'scene_contract.test', (tests.stderr || tests.stdout || '场景合同工具测试失败').trim(), path.join(root, 'scripts/test-scene-contract-tools.mjs'));
}

function checkDesignDecisionPrinciples() {
  const validation = spawnSync(process.execPath, ['scripts/validate-design-decision-method.mjs', '--json'], { cwd: root, encoding: 'utf8' });
  if (validation.status !== 0) add('error', 'design_decision_principles.validation', (validation.stderr || validation.stdout || '设计决策原则守卫失败').trim(), path.join(root, '.codex/skills/shared/references/design-decisions.md'));
  const tests = spawnSync(process.execPath, ['scripts/test-design-decision-method.mjs'], { cwd: root, encoding: 'utf8' });
  if (tests.status !== 0) add('error', 'design_decision_principles.test', (tests.stderr || tests.stdout || '设计决策原则守卫测试失败').trim(), path.join(root, 'scripts/test-design-decision-method.mjs'));
}

function checkSkillEntryBoundary() {
  const result = spawnSync(process.execPath, ['scripts/validate-skill-entry-boundary.mjs'], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) add('error', 'skill_entry.check', (result.stderr || result.stdout || '技能入口校验失败').trim(), path.join(root, 'scripts/validate-skill-entry-boundary.mjs'));
  const tests = spawnSync(process.execPath, ['scripts/test-skill-entry-boundary.mjs'], { cwd: root, encoding: 'utf8' });
  if (tests.status !== 0) add('error', 'skill_entry.test', (tests.stderr || tests.stdout || '技能入口追溯测试失败').trim(), path.join(root, 'scripts/test-skill-entry-boundary.mjs'));
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
    const includeBusinessArtifacts = requestedScope !== 'system';
    checkLibrarySchema();
    checkNoLegacyRuntimeReferences();
    checkHistoricalPlanMarkers();
    checkAppHost(includeBusinessArtifacts);
    checkLibrarySync();
    checkIteration(includeBusinessArtifacts);
    checkSceneContractTools();
    checkDesignDecisionPrinciples();
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
