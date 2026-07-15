#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-scene-contract-'));
const sceneRoot = path.join(temporaryRoot, '契约自测');
const routes = path.join(temporaryRoot, 'routes.js');
const validRoutesSource = "window.WEGO_APP_ROUTES = [{ routeId: 'contract-fixture', script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css' }];\n";
const metadata = JSON.parse(fs.readFileSync(path.join(root, '.codex/skills/wego-design/metadata.json'), 'utf8'));

const run = (script, args) => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' });
function assertSuccess(result, label) { if (result.status !== 0) throw new Error(`${label} 应通过：${result.stderr || result.stdout}`); }
function assertFailure(result, label) { if (result.status === 0) throw new Error(`${label} 应失败但通过了`); }
function assertFailureCode(result, code, label) {
  assertFailure(result, label);
  if (!`${result.stderr || ''}\n${result.stdout || ''}`.includes(code)) throw new Error(`${label} 未命中预期错误 ${code}：${result.stderr || result.stdout}`);
}

const contract = {
  surface_id: 'contract-fixture',
  route_id: 'contract-fixture',
  layout_mode: 'pattern',
  page_pattern: 'biz-rule-config',
  presentation: {
    type: 'full-screen-modal',
    transition: 'slide-up-enter, slide-down-exit',
    dismissAction: 'page-level-save',
    overlayLevel: 'overlay',
    coversTabBar: true,
    source: 'uikit-plan.json#/pagePatterns/biz-rule-config/presentation'
  },
  prompt_contract: {
    design_system_version: metadata.version,
    token_bindings: [
      { selector: '.contract-fixture', content_role: 'fixture-action', css_property: 'color', token: 'var(--text-default)' },
      { selector: '.contract-fixture', content_role: 'page-edge', css_property: 'padding-inline', token: 'var(--layout-page-margin-m0)' }
    ],
    component_bindings: [
      { binding_id: 'settings-row', slug: 'cell', reason: '承载设置内容', variant_dimensions: { density: 'single', interaction: 'static' } },
      { binding_id: 'primary-action', slug: 'button', reason: '承载确认操作', variant_dimensions: { emphasis: 'strong', size: 'md', iconMode: 'text-only', state: 'default' } },
      { binding_id: 'secondary-action', slug: 'button', reason: '承载次要操作', variant_dimensions: { emphasis: 'weak', size: 'md', iconMode: 'text-only', state: 'default' } }
    ],
    layout_contract: { mode: 'pattern', source: 'uikit-plan.json#/pagePatterns/biz-rule-config', selection_reason: '页面以编辑与统一保存为主，采用通栏内容边距', page_edge_mode: 'M0', mutable_regions: ['.contract-fixture'] },
    interaction_contract: [{ dom_id: 'fixture-confirm', target: 'feedback:toast' }],
    state_contract: [{ state_id: 'initial', initial: true, trigger: '场景进入', visible_result: '显示确认按钮', fallback: '保留当前内容', persistence: 'memory' }]
  },
  visual_check: {
    status: 'passed',
    viewports: [375, 393],
    checked_at: '2026-07-12T00:00:00+08:00',
    checks: { horizontal_overflow: true, overlap: true, clipping: true, action_legibility: true, primary_focus: true, state_feedback: true }
  }
};

const baseTemplate = `<section class="contract-fixture" data-surface-id="contract-fixture" data-route-id="contract-fixture" data-layout-mode="pattern" data-page-edge-mode="M0" data-page-pattern="biz-rule-config">
  <div class="cell cell--single" data-dd-id="fixture-cell" data-component-binding="settings-row" data-component-slug="cell"><div class="cell__body"><div class="cell__content"><span class="cell__title">设置</span></div></div></div>
  <button class="btn btn--strong btn--md" data-dd-id="fixture-button" data-component-binding="primary-action" data-component-slug="button" data-dom-id="fixture-confirm">确认</button>
  <button class="btn btn--weak btn--md" data-dd-id="fixture-secondary" data-component-binding="secondary-action" data-component-slug="button">取消</button>
</section>`;

function renderScene(currentContract = contract, options = {}) {
  const presentation = options.runtimePresentation || currentContract.presentation;
  const template = options.template || baseTemplate;
  const templateExpression = options.templateExpression || `\`${template}\``;
  const prelude = options.prelude || '';
  const handler = options.handler || `ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', function () { ctx.toast('已确认'); });`;
  const initMember = options.omitInit ? '' : `,
  init(ctx) { ${handler} }`;
  return `/* wego-design-contract: ${JSON.stringify(currentContract)} */
${prelude}
window.WegoApp.registerScene({
  routeId: 'contract-fixture',
  presentation: ${JSON.stringify(presentation)},
  template: ${templateExpression}${initMember}
});
`;
}

function writeScene(currentContract = contract, options = {}) {
  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), renderScene(currentContract, options));
  const edgeMode = options.edgeMode || currentContract.prompt_contract.layout_contract.page_edge_mode;
  const edgeRule = options.omitEdgeCss ? '' : `.contract-fixture { padding-inline: var(--layout-page-margin-${edgeMode.toLowerCase()}); }\n`;
  fs.writeFileSync(path.join(sceneRoot, 'scene.css'), `${options.css || '.contract-fixture { color: var(--text-default); }\n'}${edgeRule}`);
}

function withEdgeMode(mode) {
  const current = structuredClone(contract);
  current.prompt_contract.layout_contract.page_edge_mode = mode;
  current.prompt_contract.token_bindings.find(binding => binding.css_property === 'padding-inline').token = `var(--layout-page-margin-${mode.toLowerCase()})`;
  return current;
}

function extract(label = '设计决策提取') { assertSuccess(run('scripts/extract-design-decisions.mjs', [sceneRoot]), label); }
function validate(label = '场景合同') { return run('scripts/validate-scene-contract.mjs', [sceneRoot, '--routes', routes]); }

try {
  fs.mkdirSync(sceneRoot, { recursive: true });
  fs.writeFileSync(routes, validRoutesSource);

  writeScene(); extract(); assertSuccess(validate(), '有效场景合同');

  writeScene(contract, { prelude: `const registeredTemplate = \`${baseTemplate}\`;`, templateExpression: 'registeredTemplate' });
  extract('静态模板标识符提取'); assertSuccess(validate(), '静态模板标识符');

  writeScene(contract, { prelude: `{ const scopedTemplate = \`${baseTemplate}\`; }`, templateExpression: 'scopedTemplate' });
  assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '块内 const 不得冒充注册可见模板');
  assertFailureCode(validate(), 'scene.registration', '块内 const 模板必须命中注册解析错误');

  writeScene(contract, { prelude: `const decoyTemplate = \`${baseTemplate}\`;`, template: '<div>实际注册模板缺少合同根</div>' });
  assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '未使用模板不得冒充注册模板');

  writeScene(contract, { templateExpression: 'buildTemplate()' });
  assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '动态模板表达式');
  assertFailureCode(validate(), 'scene.registration', '动态模板必须命中注册解析错误');

  writeScene(contract, { omitInit: true });
  assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), 'registerScene 缺少 init');
  assertFailureCode(validate(), 'scene.registration', '缺少 init 必须命中注册解析错误');

  writeScene(contract, { template: `<!-- ${baseTemplate} -->` });
  assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), 'HTML 注释不得冒充模板根');

  writeScene(contract, { template: `<main>${baseTemplate}</main>` });
  assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '嵌套标注节点不得冒充顶层根');

  writeScene(contract, { template: `${baseTemplate}<aside></aside>` });
  assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '模板不得包含多个顶层元素');

  const secondaryButton = '<button class="btn btn--weak btn--md" data-dd-id="fixture-secondary" data-component-binding="secondary-action" data-component-slug="button">取消</button>';
  const commentedComponentTemplate = baseTemplate.replace(secondaryButton, `<!-- ${secondaryButton} -->`);
  writeScene(contract, { template: commentedComponentTemplate });
  extract('HTML 注释组件提取'); assertFailureCode(validate(), 'scene.component_binding_unused', 'HTML 注释不得满足组件 binding');

  writeScene();
  fs.appendFileSync(path.join(sceneRoot, 'scene.js'), `\nwindow.WegoApp.registerScene({ routeId: 'contract-fixture', template: \`${baseTemplate}\`, init() {} });\n`);
  assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '同一场景不得重复注册');
  assertFailureCode(validate(), 'scene.registration', '重复注册必须命中注册解析错误');

  writeScene(contract, {
    prelude: `const decoyLifecycle = { init(ctx) { ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', () => ctx.toast('伪处理')); } };`,
    handler: 'void ctx;'
  });
  extract('注册对象外 init 提取'); assertFailureCode(validate(), 'scene.interaction_handler', '注册对象外 init 不得冒充实际 init');

  for (const mode of ['M8', 'M32']) {
    const edgeContract = withEdgeMode(mode);
    const edgeTemplate = baseTemplate.replace('data-page-edge-mode="M0"', `data-page-edge-mode="${mode}"`);
    writeScene(edgeContract, { template: edgeTemplate }); extract(`${mode} 页面边距提取`); assertSuccess(validate(), `${mode} 页面边距合同`);
  }

  writeScene(); extract('恢复 M0 页面边距');
  writeScene(contract, { template: baseTemplate.replace('data-page-edge-mode="M0"', 'data-page-edge-mode="M8"') });
  assertFailureCode(validate(), 'scene.page_edge_annotation', '页面边距根标注不一致');

  const m8Contract = withEdgeMode('M8');
  writeScene(m8Contract, { template: baseTemplate.replace('data-page-edge-mode="M0"', 'data-page-edge-mode="M8"'), edgeMode: 'M0' });
  extract('错误 M8 CSS 提取'); assertFailureCode(validate(), 'scene.page_edge_runtime', '页面边距 CSS Token 不一致');

  for (const [label, css] of [
    ['超宽 media', '@media (min-width: 9999px) { .contract-fixture { padding-inline: var(--layout-page-margin-m0); } }'],
    ['supports', '@supports (display: grid) { .contract-fixture { padding-inline: var(--layout-page-margin-m0); } }'],
    ['hover', '.contract-fixture:hover { padding-inline: var(--layout-page-margin-m0); }'],
    ['不匹配属性', '.contract-fixture[data-page-edge-mode="M8"] { padding-inline: var(--layout-page-margin-m0); }']
  ]) {
    writeScene(contract, { css: `.contract-fixture { color: var(--text-default); } ${css}\n`, omitEdgeCss: true });
    extract(`${label} 页面边距提取`); assertFailureCode(validate(), 'scene.page_edge_runtime', `${label} 不得冒充无条件页面边距`);
  }

  const m8Template = baseTemplate.replace('data-page-edge-mode="M0"', 'data-page-edge-mode="M8"');
  for (const property of ['padding', 'padding-left', 'padding-right', 'padding-inline-start', 'padding-inline-end']) {
    writeScene(m8Contract, { template: m8Template, css: `.contract-fixture { color: var(--text-default); ${property}: 0; }\n` });
    extract(`覆盖页面边距 ${property} 提取`); assertFailureCode(validate(), 'scene.page_edge_override', `根 ${property} 不得覆盖页面边距`);
  }
  writeScene(m8Contract, { template: m8Template, css: '.contract-fixture { color: var(--text-default); } @media (max-width: 500px) { .contract-fixture { padding-inline: var(--layout-page-margin-m32); } }\n' });
  extract('条件规则覆盖页面边距提取'); assertFailureCode(validate(), 'scene.page_edge_override', '条件规则不得覆盖页面边距');

  writeScene(contract, { css: '.contract-fixture { color: var(--text-default); } .other { padding-inline: var(--layout-page-margin-m16); }\n' });
  extract('M16 页面边距 Token 提取'); assertFailureCode(validate(), 'scene.page_edge_token', '场景不得使用 M16 页面边距 Token');

  const m16Contract = withEdgeMode('M16');
  writeScene(m16Contract, { template: baseTemplate.replace('data-page-edge-mode="M0"', 'data-page-edge-mode="M16"') });
  assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), 'M16 页面边距模式');

  writeScene(contract, { handler: `const ignoredAuditText = '#fff rgb(0, 0, 0) var(--not-a-token) --text-default: .setProperty("--text-default")';
      // #abc var(--also-not-a-token) --text-default: setProperty('--text-default')
      ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', () => ctx.toast('有效反馈'));` });
  extract('JS 注释与普通字符串扫描提取'); assertSuccess(validate(), 'JS 注释与普通字符串不得伪造颜色或 Token 使用');

  const rawColorTemplate = baseTemplate.replace('</section>', '<span style="color:#fff">颜色</span></section>');
  writeScene(contract, { template: rawColorTemplate }); extract('模板字符串裸颜色提取'); assertFailureCode(validate(), 'scene.raw_color', '模板字符串中的裸颜色必须保留扫描');

  writeScene(); extract('伪注册前有效场景提取');
  const validSceneSource = fs.readFileSync(path.join(sceneRoot, 'scene.js'), 'utf8');
  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), validSceneSource.replace('window.WegoApp.registerScene', `const fakeRegistration = "window.WegoApp.registerScene({ routeId: 'contract-fixture' })";
// window.WegoApp.registerScene({ routeId: 'contract-fixture' });
window.NotWegoApp.registerScene`));
  assertFailureCode(validate(), 'scene.registration', '注释或普通字符串不得伪造 registerScene 调用');

  writeScene(); extract('伪 routeId 前有效场景提取');
  const validRouteScene = fs.readFileSync(path.join(sceneRoot, 'scene.js'), 'utf8');
  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), `const fakeRouteId = "routeId: 'contract-fixture'";
// routeId: 'contract-fixture'
${validRouteScene.replace("routeId: 'contract-fixture'", "routeId: 'wrong-route'")}`);
  assertFailureCode(validate(), 'scene.registration_route', '普通字符串或注释不得伪造 registerScene.routeId');

  writeScene(); extract('伪 routes 前有效场景提取');
  fs.writeFileSync(routes, `// window.WEGO_APP_ROUTES = [{ routeId: 'contract-fixture', script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css' }];
const fakeRoutes = "routeId: 'contract-fixture', script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css'";
window.WEGO_APP_ROUTES = [];
`);
  assertFailureCode(validate(), 'scene.route', 'routes 注释或普通字符串不得伪造路由记录');

  fs.writeFileSync(routes, `// script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css'
const fakeAssets = "scenes/契约自测/scene.js scenes/契约自测/scene.css";
window.WEGO_APP_ROUTES = [{ routeId: 'contract-fixture', script: 'scenes/其他场景/scene.js', style: 'scenes/其他场景/scene.css' }];
`);
  assertFailureCode(validate(), 'scene.route_asset', 'routes 注释或普通字符串不得伪造场景资源');

  fs.writeFileSync(routes, `window.WEGO_APP_ROUTES = [
    { routeId: 'contract-fixture', script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css' },
    { routeId: 'contract-fixture', script: 'scenes/其他场景/scene.js', style: 'scenes/其他场景/scene.css' }
  ];\n`);
  assertFailureCode(validate(), 'scene.route_id_duplicate', 'routes routeId 必须全局唯一');

  fs.writeFileSync(routes, `window.WEGO_APP_ROUTES = [
    { routeId: 'contract-fixture', script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css', entry: { type: 'host-tab', tab: 'my' } },
    { routeId: 'other-route', script: 'scenes/其他场景/scene.js', style: 'scenes/其他场景/scene.css', entry: { type: 'host-tab', tab: 'my' } }
  ];\n`);
  assertFailureCode(validate(), 'scene.host_tab_duplicate', 'host-tab 的 tab 必须全局唯一');

  fs.writeFileSync(routes, `${validRoutesSource}window.WEGO_APP_ROUTES = [];\n`);
  assertFailureCode(validate(), 'scene.routes_registration', 'routes.js 不得真实赋值两次');

  fs.writeFileSync(routes, `window.WEGO_APP_ROUTES = [{ routeId: 'contract-fixture', routeId: 'runtime-route', script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css' }];\n`);
  assertFailureCode(validate(), 'scene.routes_registration', 'routes.js 重复字段不得改变运行时语义');

  fs.writeFileSync(routes, `const extraRoutes = [];\nwindow.WEGO_APP_ROUTES = [{ routeId: 'contract-fixture', script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css' }, ...extraRoutes];\n`);
  assertFailureCode(validate(), 'scene.routes_registration', 'routes.js 不得用动态条目绕过静态检查');

  fs.writeFileSync(routes, `${validRoutesSource}window.WEGO_APP_ROUTES.push({ routeId: 'runtime-route', script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css' });\n`);
  assertFailureCode(validate(), 'scene.routes_registration', 'routes.js 不得在静态赋值后追加运行时路由');

  fs.writeFileSync(routes, `window.WEGO_APP_ROUTES = [{ routeId: 'contract-fixture', script: '../outside/scene.js', style: 'scenes/契约自测/scene.css' }];\n`);
  assertFailureCode(validate(), 'scene.routes_registration', 'routes.js 资源必须指向同一场景目录');

  fs.writeFileSync(routes, `window.WEGO_APP_ROUTES = [{ routeId: 'contract-fixture', script: 'scenes/../scene.js', style: 'scenes/../scene.css' }];\n`);
  assertFailureCode(validate(), 'scene.routes_registration', 'routes.js 资源不得使用父目录作为场景名');

  fs.writeFileSync(routes, `window.WEGO_APP_ROUTES = [{ routeId: 'contract-fixture', script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css', entry: { type: 'push', tab: 'my' } }];\n`);
  assertFailureCode(validate(), 'scene.routes_registration', '路由 entry.type 不得冒充 presentation 类型');

  fs.writeFileSync(routes, `window.WEGO_APP_ROUTES = [{ routeId: 'contract-fixture', script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css', entry: { type: 'host-tab', tab: 'my' } }];\n`);
  assertFailureCode(validate(), 'scene.route_entry', '非 host-tab 场景不得注册为 host-tab 入口');

  fs.writeFileSync(routes, `// { routeId: 'contract-fixture', entry: { type: 'host-tab', tab: 'my' } }
  const fakeDuplicateRoute = "routeId: 'contract-fixture', entry: { type: 'host-tab', tab: 'my' }";
  window.WEGO_APP_ROUTES = [
    { routeId: 'contract-fixture', script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css', entry: { type: 'cell-entry', tab: 'my' } }
  ];\n`);
  assertSuccess(validate(), 'routes 注释或普通字符串不得伪造 routeId 或 host-tab 重复');
  fs.writeFileSync(routes, validRoutesSource);

  const invalidRoute = structuredClone(contract); invalidRoute.route_id = 'Contract_Fixture';
  writeScene(invalidRoute, { template: baseTemplate.replace('data-route-id="contract-fixture"', 'data-route-id="Contract_Fixture"') });
  assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), 'route_id 必须是 kebab-case');

  const legacy = structuredClone(contract); legacy.crowding_check = { status: 'passed' };
  writeScene(legacy); assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '旧 crowding_check');

  const missingVersion = structuredClone(contract); delete missingVersion.prompt_contract.design_system_version;
  writeScene(missingVersion); assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '缺失设计系统版本');

  const duplicateBinding = structuredClone(contract); duplicateBinding.prompt_contract.component_bindings[2].binding_id = 'primary-action';
  writeScene(duplicateBinding); assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '重复 binding_id');

  writeScene(contract, { template: baseTemplate.replace('data-component-binding="primary-action"', 'data-component-binding="unknown-action"') });
  extract('未知 binding 提取'); assertFailure(validate(), '未知 DOM binding');

  writeScene(contract, { template: baseTemplate.replace('data-component-binding="primary-action" data-component-slug="button"', 'data-component-binding="primary-action" data-component-slug="cell"') });
  extract('错误 slug 提取'); assertFailure(validate(), 'binding slug 不一致');

  writeScene(contract, { template: baseTemplate.replace(' data-dd-id="fixture-secondary" data-component-binding="secondary-action" data-component-slug="button"', '') });
  extract('未标注正式组件提取'); assertFailure(validate(), '正式组件缺少追溯标注');

  writeScene(contract, { template: baseTemplate.replace('<div class="cell__content"><span class="cell__title">设置</span></div>', '<span class="cell__title">设置</span>') });
  extract('缺少 anatomy 提取'); assertFailure(validate(), '组件缺少必需子节点');

  for (const [label, template] of [
    ['按钮强调级别与 DOM 不一致', baseTemplate.replace('btn btn--strong btn--md', 'btn btn--weak btn--md')],
    ['按钮缺少尺寸类', baseTemplate.replace('btn btn--strong btn--md', 'btn btn--strong')],
    ['按钮同时使用互斥强调类', baseTemplate.replace('btn btn--strong btn--md', 'btn btn--strong btn--weak btn--md')],
    ['纯文字按钮包含图标节点', baseTemplate.replace('data-dom-id="fixture-confirm">确认', 'data-dom-id="fixture-confirm"><i class="btn__icon"></i>确认')],
    ['默认按钮带禁用类', baseTemplate.replace('btn btn--strong btn--md', 'btn btn--strong btn--md btn--disabled')],
    ['默认按钮带裸 disabled 属性', baseTemplate.replace('data-dom-id="fixture-confirm"', 'data-dom-id="fixture-confirm" disabled')]
  ]) {
    writeScene(contract, { template });
    extract(`${label}提取`); assertFailureCode(validate(), 'scene.component_variant_dom', label);
  }
  const missingRequiredVariant = structuredClone(contract);
  delete missingRequiredVariant.prompt_contract.component_bindings.find(binding => binding.binding_id === 'primary-action').variant_dimensions.size;
  writeScene(missingRequiredVariant); extract('按钮缺少必需变体维度提取'); assertFailureCode(validate(), 'scene.component_variant_required', '按钮缺少必需变体维度');

  const disabledButton = structuredClone(contract);
  disabledButton.prompt_contract.component_bindings.find(binding => binding.binding_id === 'primary-action').variant_dimensions.state = 'disabled';
  writeScene(disabledButton, { template: baseTemplate.replace('data-dom-id="fixture-confirm"', 'data-dom-id="fixture-confirm" disabled') });
  extract('裸 disabled 按钮提取'); assertSuccess(validate(), '裸 disabled 属性必须满足禁用态 DOM 合同');
  writeScene(disabledButton, { template: baseTemplate.replace('btn btn--strong btn--md', 'btn btn--strong btn--md btn--disabled') });
  extract('仅禁用类按钮提取'); assertFailureCode(validate(), 'scene.component_variant_dom', '禁用态不得只用视觉类替代语义属性');

  const unknownPattern = structuredClone(contract); unknownPattern.page_pattern = 'unknown-pattern';
  writeScene(unknownPattern, { template: baseTemplate.replace('data-page-pattern="biz-rule-config"', 'data-page-pattern="unknown-pattern"') });
  extract('未知范式提取'); assertFailure(validate(), '未知范式');

  const wrongPresentation = structuredClone(contract); wrongPresentation.presentation.type = 'push';
  writeScene(wrongPresentation); extract('错误 presentation 提取'); assertFailure(validate(), '范式 presentation 不匹配');

  writeScene(contract, { runtimePresentation: { ...contract.presentation, type: 'push' } });
  extract('运行时 presentation 错误提取'); assertFailure(validate(), '运行时 presentation 与合同不一致');

  writeScene(contract, { runtimePresentation: { ...contract.presentation, type: 'push' } });
  const wrongPresentationSource = fs.readFileSync(path.join(sceneRoot, 'scene.js'), 'utf8');
  const fakePresentationText = `presentation: ${JSON.stringify(contract.presentation)}, template:`;
  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), `const fakePresentation = ${JSON.stringify(fakePresentationText)};\n${wrongPresentationSource}`);
  extract('普通字符串伪装 presentation 提取'); assertFailureCode(validate(), 'scene.presentation_runtime', '普通字符串不得伪装 registerScene.presentation');

  const composed = structuredClone(contract);
  composed.layout_mode = 'composed'; composed.page_pattern = null;
  composed.presentation = { type: 'push', transition: 'slide-left-enter, slide-right-exit', dismissAction: 'back-button', overlayLevel: 'inline', coversTabBar: true, source: 'library-consumption.json#/appRuntime/presentationTypes' };
  composed.prompt_contract.layout_contract = { mode: 'composed', source: 'references/design-decisions.md', selection_reason: '未命中明确范式，按任务层级自主组合并采用通栏边距', page_edge_mode: 'M0', mutable_regions: ['.contract-fixture'] };
  writeScene(composed, { template: baseTemplate.replace('data-layout-mode="pattern" data-page-edge-mode="M0" data-page-pattern="biz-rule-config"', 'data-layout-mode="composed" data-page-edge-mode="M0"') });
  extract('自主组合提取'); assertSuccess(validate(), '自主组合场景合同');

  const groupedBindings = structuredClone(contract);
  groupedBindings.prompt_contract.token_bindings.push({ selector: '.fixture-grouped', content_role: 'grouped-fixture', css_property: 'color', token: 'var(--text-default)' });
  writeScene(groupedBindings, { css: '.contract-fixture, .fixture-grouped { color: var(--text-default); }\n' });
  extract('分组选择器提取'); assertSuccess(validate(), '分组选择器 Token 绑定');

  writeScene(contract, { css: '.contract-fixture { color: var(--text-default); display: flex; position: relative; width: 100%; margin: auto; border-radius: 0; } .fixture-zero { padding: 0; }\n' });
  extract('结构字面值提取'); assertSuccess(validate(), '结构属性与零间距字面值');

  for (const [property, value] of [
    ['font-size', '16px'], ['line-height', '24px'], ['font-weight', '600'],
    ['font-size', 'calc(var(--body-md-font-size) + 1px)'], ['line-height', 'calc(var(--body-md-line-height) + 1px)'],
    ['padding', '13px'], ['padding', '1dvh'], ['padding', '1cqw'], ['padding', '1lh'], ['gap', '4px'], ['border-radius', '8px'],
    ['border', '1px solid red'], ['box-shadow', '0 1px 2px black']
  ]) {
    writeScene(contract, { css: `.contract-fixture { color: var(--text-default); ${property}: ${value}; }\n` });
    extract(`裸值 ${property} 提取`); assertFailureCode(validate(), 'scene.raw_design_value', `裸值 ${property}`);
  }

  for (const [property, value] of [
    ['color', 'red'], ['background', 'white'], ['border-color', 'black'], ['fill', 'red'], ['stroke', 'blue'],
    ['color', '#fff'], ['color', 'rgb(0, 0, 0)']
  ]) {
    writeScene(contract, { css: `.contract-fixture { ${property}: ${value}; }\n` });
    extract(`裸颜色 ${property} 提取`); assertFailure(validate(), `裸颜色 ${property}: ${value}`);
  }

  for (const [property, value] of [
    ['padding', 'var(--layout-page-margin-m8, 8px)'],
    ['color', 'var(--text-default, black)'],
    ['line-height', 'var(--body-md-line-height, 24px)']
  ]) {
    writeScene(contract, { css: `.contract-fixture { color: var(--text-default); ${property}: ${value}; }\n` });
    extract(`Token fallback ${property} 提取`); assertFailureCode(validate(), 'scene.token_fallback', `Token fallback ${property}`);
  }

  writeScene(contract, { css: '/* #fff rgb(0, 0, 0) var(--not-a-token) */\n.contract-fixture { color: var(--text-default); }\n' });
  extract('CSS 注释颜色提取'); assertSuccess(validate(), 'CSS 注释不得触发裸颜色或未知 Token');

  writeScene(contract, { css: '.contract-fixture { color: var(--text-default); & .nested { padding: 1cqw; } }\n' });
  extract('CSS nesting 提取'); assertFailureCode(validate(), 'scene.css_nesting', '原生 CSS nesting 必须明确拒绝');

  const visualBindings = structuredClone(contract);
  visualBindings.prompt_contract.token_bindings = [
    { selector: '.contract-fixture', content_role: 'text', css_property: 'color', token: 'var(--text-default)' },
    { selector: '.contract-fixture', content_role: 'surface', css_property: 'background', token: 'var(--bg-surface)' },
    { selector: '.contract-fixture', content_role: 'border', css_property: 'border-color', token: 'var(--border-neutral-l2)' },
    { selector: '.contract-fixture', content_role: 'vector-fill', css_property: 'fill', token: 'var(--text-default)' },
    { selector: '.contract-fixture', content_role: 'vector-stroke', css_property: 'stroke', token: 'var(--text-secondary)' },
    { selector: '.contract-fixture', content_role: 'font-size', css_property: 'font-size', token: 'var(--body-md-font-size)' },
    { selector: '.contract-fixture', content_role: 'line-height', css_property: 'line-height', token: 'var(--body-md-line-height)' },
    { selector: '.contract-fixture', content_role: 'font-weight', css_property: 'font-weight', token: 'var(--font-weight-regular)' },
    { selector: '.contract-fixture', content_role: 'page-edge', css_property: 'padding-inline', token: 'var(--layout-page-margin-m0)' }
  ];
  const visualCss = '.contract-fixture { color: var(--text-default); background: var(--bg-surface); border-color: var(--border-neutral-l2); fill: var(--text-default); stroke: var(--text-secondary); font-size: var(--body-md-font-size); line-height: var(--body-md-line-height); font-weight: var(--font-weight-regular); }\n';
  writeScene(visualBindings, { css: visualCss }); extract('完整视觉绑定提取'); assertSuccess(validate(), '完整视觉 Token 绑定');
  const incompleteVisualBindings = structuredClone(visualBindings);
  incompleteVisualBindings.prompt_contract.token_bindings = incompleteVisualBindings.prompt_contract.token_bindings.filter(binding => binding.css_property !== 'stroke');
  writeScene(incompleteVisualBindings, { css: visualCss }); extract('缺少 stroke 绑定提取'); assertFailureCode(validate(), 'scene.token_binding_missing', '缺少 stroke Token 绑定');

  const tokenizedBorder = structuredClone(contract);
  tokenizedBorder.prompt_contract.token_bindings.push({ selector: '.contract-fixture', content_role: 'border', css_property: 'border', token: 'var(--border-neutral-l2)' });
  writeScene(tokenizedBorder, { css: '.contract-fixture { color: var(--text-default); border: 1px solid var(--border-neutral-l2); }\n' });
  extract('边框颜色 Token 提取'); assertSuccess(validate(), '边框宽度可为结构字面值但颜色必须使用 Token');

  writeScene();
  fs.writeFileSync(path.join(sceneRoot, 'scene.css'), '.contract-fixture { color: var(--text-default); box-shadow: var(--shadow-sm); }\n');
  extract('越权 Token 提取'); assertFailure(validate(), '越权 Token');

  writeScene(contract, { css: '.contract-fixture { color: var(--not-a-token); }\n' });
  extract('未知 Token 提取'); assertFailure(validate(), '未知 Token');

  writeScene(contract, { css: '.contract-fixture { --text-default: red; color: var(--text-default); }\n' });
  extract('重定义正式 Token 提取'); assertFailureCode(validate(), 'scene.token_redefinition', '场景不得用自定义属性覆盖正式 Token');

  writeScene(contract, { handler: `ctx.root.style.setProperty('--text-default', 'red'); ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', function () { ctx.toast('已确认'); });` });
  extract('运行时重定义正式 Token 提取'); assertFailureCode(validate(), 'scene.token_redefinition', '运行时不得覆盖正式 Token');

  const unappliedToken = structuredClone(contract); unappliedToken.prompt_contract.token_bindings[0].selector = '.missing-selector';
  writeScene(unappliedToken); extract('未应用 Token 提取'); assertFailure(validate(), 'Token 只声明未应用');

  const missingTokenBinding = structuredClone(contract); missingTokenBinding.prompt_contract.token_bindings = [];
  writeScene(missingTokenBinding); extract('缺失 Token 绑定提取'); assertFailure(validate(), '场景视觉声明未进入 Token 绑定');

  const invalidStateTarget = structuredClone(contract); invalidStateTarget.prompt_contract.interaction_contract[0].target = 'state:missing';
  writeScene(invalidStateTarget); extract('无效状态目标提取'); assertFailure(validate(), '无效状态目标');

  const failedVisual = structuredClone(contract); failedVisual.visual_check.checks.clipping = false;
  writeScene(failedVisual); extract('视觉失败提取'); assertFailure(validate(), '视觉检查缺项');

  for (const checkedAt of ['2026-07-12 00:00:00', 'July 12, 2026', '2026-02-30T00:00:00+08:00']) {
    const invalidTimestamp = structuredClone(contract);
    invalidTimestamp.visual_check.checked_at = checkedAt;
    writeScene(invalidTimestamp); extract(`非严格 ISO ${checkedAt} 提取`); assertFailureCode(validate(), 'scene.visual_check', `非严格 ISO checked_at：${checkedAt}`);
  }

  const duplicateDom = baseTemplate.replace('</section>', '<button class="btn btn--weak btn--md" data-dd-id="duplicate-dom" data-component-binding="secondary-action" data-component-slug="button" data-dom-id="fixture-confirm">重复</button></section>');
  writeScene(contract, { template: duplicateDom }); extract('重复 DOM id 提取'); assertFailure(validate(), '重复 DOM id');

  const inputContract = structuredClone(contract);
  inputContract.prompt_contract.component_bindings.push({ binding_id: 'number-field', slug: 'input', reason: '承载数字输入', variant_dimensions: { fieldType: 'number', surface: 'default', state: 'default' } });
  const inputTemplate = baseTemplate.replace('</section>', '<div class="number-input" data-dd-id="fixture-input" data-component-binding="number-field" data-component-slug="input"><input class="number-input__field" type="text"><span class="number-input__suffix">元</span></div></section>');
  writeScene(inputContract, { template: inputTemplate }); extract('多根组件提取'); assertSuccess(validate(), 'input 多根契约');
  writeScene(inputContract, { template: inputTemplate.replace('<input class="number-input__field" type="text"><span class="number-input__suffix">元</span>', '') });
  extract('空 number-input 提取'); assertFailureCode(validate(), 'scene.component_anatomy', '空 number-input');

  const textInputContract = structuredClone(contract);
  textInputContract.prompt_contract.component_bindings.push({ binding_id: 'text-field', slug: 'input', reason: '承载文本输入', variant_dimensions: { fieldType: 'text', surface: 'default', state: 'default' } });
  const textInputTemplate = baseTemplate.replace('</section>', '<label class="input-group" data-dd-id="fixture-text-input" data-component-binding="text-field" data-component-slug="input"><span class="field-label">名称</span><span class="input-wrapper"><input type="text"></span></label></section>');
  writeScene(textInputContract, { template: textInputTemplate }); extract('文本 input 提取'); assertSuccess(validate(), '文本 input 当前变体结构');

  const textareaContract = structuredClone(contract);
  textareaContract.prompt_contract.component_bindings.push({ binding_id: 'textarea-field', slug: 'input', reason: '承载多行输入', variant_dimensions: { fieldType: 'textarea', surface: 'default', state: 'default' } });
  const textareaTemplate = baseTemplate.replace('</section>', '<label class="input-group" data-dd-id="fixture-textarea" data-component-binding="textarea-field" data-component-slug="input"><span class="field-label">说明</span><textarea></textarea></label></section>');
  writeScene(textareaContract, { template: textareaTemplate }); extract('textarea input 提取'); assertSuccess(validate(), 'textarea input 当前变体结构');

  const mismatchedNumberTemplate = textInputTemplate.replace('data-component-binding="text-field"', 'data-component-binding="number-field"');
  writeScene(inputContract, { template: mismatchedNumberTemplate }); extract('number 绑定 input-group 提取'); assertFailureCode(validate(), 'scene.component_anatomy', 'number 绑定不得使用 input-group 结构');

  const anatomyFixtures = [
    {
      slug: 'search', bindingId: 'fixture-search', variants: { size: 'md', surface: 'gray', mode: 'text', state: 'empty', internalActions: 'clear', hostPattern: 'inline' },
      html: '<div class="searchbox" data-dd-id="fixture-search" data-component-binding="fixture-search" data-component-slug="search"><span class="searchbox__icon"></span><div class="searchbox__input"></div><div class="searchbox__actions"></div></div>',
      remove: '<span class="searchbox__icon"></span>'
    },
    {
      slug: 'stack', bindingId: 'fixture-stack', variants: { state: 'unselected', layout: 'label-inside-tile' },
      html: '<div class="stack" data-dd-id="fixture-stack" data-component-binding="fixture-stack" data-component-slug="stack"><span class="stack__bg"></span><span class="stack__label"></span><span class="stack__check-corner"></span><span class="stack__check-icon"></span></div>',
      remove: '<span class="stack__label"></span>'
    },
    {
      slug: 'tabs', bindingId: 'fixture-tabs', variants: { size: 'standard', layout: 'divide', icon: 'none', state: 'default' },
      html: '<div class="wg-tabs" data-dd-id="fixture-tabs" data-component-binding="fixture-tabs" data-component-slug="tabs"><div class="wg-tabs__scroll"><button class="wg-tabs__item"><span class="wg-tabs__content"><span class="wg-tabs__label"></span></span></button><span class="wg-tabs__active-indicator"></span></div></div>',
      remove: '<span class="wg-tabs__active-indicator"></span>'
    },
    {
      slug: 'counter', bindingId: 'fixture-counter', variants: { size: 'default', state: 'default' },
      html: '<div class="counter" data-dd-id="fixture-counter" data-component-binding="fixture-counter" data-component-slug="counter"><div class="counter__body"><button class="counter__btn--minus"></button><input class="counter__value"><button class="counter__btn--plus"></button></div><div class="counter__message counter__hint"></div></div>',
      remove: '<button class="counter__btn--plus"></button>'
    },
    {
      slug: 'bottom-nav', bindingId: 'fixture-bottom-nav', variants: { state: 'default', badge: 'none', layout: 'fixed-five-tab' },
      html: '<nav class="bottom-nav" data-dd-id="fixture-bottom-nav" data-component-binding="fixture-bottom-nav" data-component-slug="bottom-nav"><button class="bottom-nav__item"><span class="bottom-nav__icon"></span><span class="bottom-nav__label"></span></button></nav>',
      remove: '<span class="bottom-nav__label"></span>'
    }
  ];
  for (const fixture of anatomyFixtures) {
    const fixtureContract = structuredClone(composed);
    fixtureContract.prompt_contract.component_bindings.push({ binding_id: fixture.bindingId, slug: fixture.slug, reason: `验证 ${fixture.slug} 契约结构`, variant_dimensions: fixture.variants });
    const fixtureTemplate = baseTemplate.replace('data-layout-mode="pattern" data-page-edge-mode="M0" data-page-pattern="biz-rule-config"', 'data-layout-mode="composed" data-page-edge-mode="M0"').replace('</section>', `${fixture.html}</section>`);
    writeScene(fixtureContract, { template: fixtureTemplate }); extract(`${fixture.slug} anatomy 提取`); assertSuccess(validate(), `${fixture.slug} anatomy 完整结构`);
    writeScene(fixtureContract, { template: fixtureTemplate.replace(fixture.remove, '') }); extract(`${fixture.slug} anatomy 缺失提取`); assertFailureCode(validate(), 'scene.component_anatomy', `${fixture.slug} anatomy 缺失结构`);
  }

  writeScene(contract, { handler: `const confirmButton = ctx.root.querySelector('[data-dom-id="fixture-confirm"]'); confirmButton.addEventListener('click', function () { ctx.toast('已确认'); });` });
  extract('变量 listener 提取'); assertSuccess(validate(), '变量 listener 绑定');

  writeScene(contract, { handler: `ctx.root
      .querySelector(
        '[data-dom-id="fixture-confirm"]'
      )
      .addEventListener('click', event => ctx.toast('换行链'));` });
  extract('换行链 listener 提取'); assertSuccess(validate(), '换行 querySelector listener');

  writeScene(contract, { handler: `function onConfirm() { ctx.toast('命名 handler'); }
      const confirmButton = ctx.root.querySelector('[data-dom-id="fixture-confirm"]');
      confirmButton.addEventListener('click', onConfirm);` });
  extract('命名 handler 提取'); assertSuccess(validate(), '命名 handler');

  writeScene(contract, { handler: `const onConfirm = async event => ctx.toast('async handler');
      const confirmButton = ctx.root.querySelector('[data-dom-id="fixture-confirm"]');
      confirmButton.addEventListener('click', onConfirm);` });
  extract('async 表达式 handler 提取'); assertSuccess(validate(), 'async 表达式箭头 handler');

  writeScene(contract, { handler: `function showFeedback() { ctx.toast('helper feedback'); }
      const onConfirm = () => showFeedback();
      ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', onConfirm);` });
  extract('一层 helper handler 提取'); assertSuccess(validate(), 'handler 调用一层本地 helper');

  writeScene(contract, { handler: `ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', () => { const fake = 'ctx.toast('; });` });
  extract('字符串伪装 API 提取'); assertFailureCode(validate(), 'scene.interaction_runtime', '字符串不得伪装 handler API');

  writeScene(contract, { handler: `ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', () => {}, { capture: false, fake: ctx.toast() });` });
  extract('第三参数伪装 API 提取'); assertFailureCode(validate(), 'scene.interaction_runtime', 'listener 第三参数不得伪装 handler API');

  const stateInteraction = structuredClone(contract);
  stateInteraction.prompt_contract.interaction_contract[0].target = 'state:initial';
  writeScene(stateInteraction, { handler: `ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', () => { void ctx.state.initial; });` });
  extract('只读 state handler 提取'); assertFailureCode(validate(), 'scene.interaction_runtime', 'state handler 只读不得通过');
  writeScene(stateInteraction, { handler: `ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', () => { ctx.state.initial = true; });` });
  extract('写入 state handler 提取'); assertSuccess(validate(), 'state handler 写入');
  writeScene(stateInteraction, { handler: `ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', () => { delete ctx.appState.initial; });` });
  extract('删除 state handler 提取'); assertSuccess(validate(), 'state handler 删除');

  const targetedStateInteraction = structuredClone(contract);
  targetedStateInteraction.prompt_contract.state_contract.push(
    { state_id: 'loading', initial: false, trigger: '提交开始', visible_result: '显示处理中', fallback: '恢复初始状态', persistence: 'memory' },
    { state_id: 'success', initial: false, trigger: '提交成功', visible_result: '显示成功反馈', fallback: '恢复初始状态', persistence: 'memory' }
  );
  targetedStateInteraction.prompt_contract.interaction_contract[0].target = 'state:success';
  writeScene(targetedStateInteraction, { handler: `ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', () => { ctx.state.loading = true; });` });
  extract('写错目标 state handler 提取'); assertFailureCode(validate(), 'scene.interaction_runtime', 'state handler 不得用 loading 冒充 success');
  writeScene(targetedStateInteraction, { handler: `ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', () => { ctx.state.success = true; });` });
  extract('写入目标 state handler 提取'); assertSuccess(validate(), 'state handler 写入对应目标状态');

  const splitHandlers = structuredClone(contract);
  splitHandlers.prompt_contract.interaction_contract.push({ dom_id: 'fixture-secondary', target: 'feedback:toast' });
  const splitHandlerTemplate = baseTemplate.replace('data-component-slug="button">取消', 'data-component-slug="button" data-dom-id="fixture-secondary">取消');
  writeScene(splitHandlers, {
    template: splitHandlerTemplate,
    handler: `const first = ctx.root.querySelector('[data-dom-id="fixture-confirm"]');
      const second = ctx.root.querySelector('[data-dom-id="fixture-secondary"]');
      first.addEventListener('click', function () { ctx.toast('第一个'); });
      second.addEventListener('click', function () { ctx.state.secondClicked = true; });
      ctx.toast('listener 外死代码');`
  });
  extract('handler 隔离提取'); assertFailureCode(validate(), 'scene.interaction_runtime', 'handler 不得借用其他 handler 或死代码');

  const metricContract = structuredClone(composed);
  metricContract.prompt_contract.component_bindings.push({ binding_id: 'summary-metric', slug: 'metric', reason: '展示关键统计值', variant_dimensions: { size: '16', theme: 'black' } });
  const composedTemplate = baseTemplate.replace('data-layout-mode="pattern" data-page-edge-mode="M0" data-page-pattern="biz-rule-config"', 'data-layout-mode="composed" data-page-edge-mode="M0"');
  const metricTemplate = composedTemplate.replace('</section>', '<div class="metric metric--16 metric--black" data-dd-id="fixture-metric" data-component-binding="summary-metric" data-component-slug="metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">12</span></span></span></div></section>');
  writeScene(metricContract, { template: metricTemplate }); extract('metric anatomy 提取'); assertSuccess(validate(), 'metric 必需子节点');
  writeScene(metricContract, { template: metricTemplate.replace('<span class="metric__main"><span class="metric__value"><span class="metric__integer">12</span></span></span>', '<span class="metric__integer">12</span>') });
  extract('metric 缺失 anatomy 提取'); assertFailure(validate(), 'metric 缺少必需子节点');

  writeScene(); extract('恢复有效合同');
  fs.appendFileSync(path.join(sceneRoot, 'scene.js'), '// source changed\n');
  assertFailure(validate(), '过期设计决策');

  console.log('场景合同工具测试通过。');
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
