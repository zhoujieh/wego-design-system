#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-scene-contract-'));
const sceneRoot = path.join(temporaryRoot, '契约自测');
const routes = path.join(temporaryRoot, 'routes.js');
const metadata = JSON.parse(fs.readFileSync(path.join(root, '.codex/skills/wego-design/metadata.json'), 'utf8'));

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' });
}

function assertSuccess(result, label) {
  if (result.status === 0) return;
  throw new Error(`${label} 应通过：${result.stderr || result.stdout}`);
}

function assertFailure(result, label) {
  if (result.status !== 0) return;
  throw new Error(`${label} 应失败但通过了`);
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
    design_system_snapshot: {
      version: metadata.version,
      token_css: 'colors_and_type.css',
      component_css: 'components.css',
      component_inputs: [{ slug: 'button', preview_file: 'preview/component-button.html', contract_file: 'components/button.json' }]
    },
    token_whitelist: ['var(--text-default)'],
    token_bindings: [{ selector: '.contract-fixture', content_role: 'fixture-action', css_property: 'color', token: 'var(--text-default)', rule_ref: 'components/button.json#/runtimeTokens' }],
    component_bindings: [{ slot: 'fixture-action', slug: 'button', reason: '确认操作需要正式主按钮反馈', root_class: 'btn', required_structure: [], modifiers: ['btn--strong'], variant_dimensions: { emphasis: 'strong', size: 'md', iconMode: 'text-only', state: 'default' }, source: 'preview/component-button.html', contract_file: 'components/button.json' }],
    layout_contract: { mode: 'pattern', source: 'uikit-plan.json#/pagePatterns/biz-rule-config', selection_reason: '页面以编辑与统一保存为主', page_edge_mode: 'M0', page_edge_mode_reason: '连续内容由组件承担横向内边距', rules: ['单一操作位于页面主内容内'], mutable_regions: ['.contract-fixture'] },
    interaction_contract: [{ dom_id: 'fixture-confirm', target: 'overlay:toast' }],
    state_contract: [{ state_id: 'initial', initial: true, trigger: '场景进入', visible_result: '显示确认按钮', fallback: 'none', persistence: 'memory' }],
    hard_rules: ['禁止硬编码颜色']
  },
  visual_check: { status: 'passed', viewports: [375, 393], checked_at: '2026-07-12T00:00:00+08:00' },
  crowding_check: { status: 'passed', items: ['无横向溢出', '无重叠', '无裁切', '按钮不换行', '首屏层级清晰', '操作区不拥挤'] }
};

const sceneJs = `/* wego-design-contract: ${JSON.stringify(contract)} */
window.WegoApp.registerScene({
  routeId: 'contract-fixture',
  presentation: ${JSON.stringify(contract.presentation)},
  template: \`<section class="contract-fixture" data-surface-id="contract-fixture" data-route-id="contract-fixture" data-layout-mode="pattern" data-page-pattern="biz-rule-config"><button class="btn btn--strong" data-dd-id="fixture-button" data-component-slug="button" data-rule-source="components/button.json#/domAnatomy" data-token-binding="color:var(--text-default)" data-dom-id="fixture-confirm">确认</button></section>\`,
  init(ctx) {
    ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', function () { ctx.toast('已确认'); });
  }
});
`;

try {
  fs.mkdirSync(sceneRoot, { recursive: true });
  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), sceneJs);
  fs.writeFileSync(path.join(sceneRoot, 'scene.css'), '.contract-fixture { color: var(--text-default); }\n');
  fs.writeFileSync(routes, "window.WEGO_APP_ROUTES = [{ routeId: 'contract-fixture', script: 'scenes/契约自测/scene.js', style: 'scenes/契约自测/scene.css' }];\n");

  assertSuccess(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '设计决策提取');
  assertSuccess(run('scripts/validate-scene-contract.mjs', [sceneRoot, '--routes', routes]), '有效场景合同');

  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), sceneJs.replace('"component_css":"components.css",', ''));
  assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '缺失设计系统快照输入');
  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), sceneJs);

  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), sceneJs.replace('"root_class":"btn"', '"root_class":"button"'));
  assertSuccess(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '错误组件根节点的提取');
  assertFailure(run('scripts/validate-scene-contract.mjs', [sceneRoot, '--routes', routes]), '错误组件根节点');
  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), sceneJs);
  assertSuccess(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '恢复有效场景合同');

  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), sceneJs.replace('"biz-rule-config"', '"unknown-pattern"').replace('data-page-pattern="biz-rule-config"', 'data-page-pattern="unknown-pattern"'));
  assertSuccess(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '未知范式的提取');
  assertFailure(run('scripts/validate-scene-contract.mjs', [sceneRoot, '--routes', routes]), '未知范式');

  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), sceneJs.replace('"type":"full-screen-modal"', '"type":"push"'));
  assertSuccess(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '错误 presentation 的提取');
  assertFailure(run('scripts/validate-scene-contract.mjs', [sceneRoot, '--routes', routes]), '范式 presentation 不匹配');

  const composedContract = structuredClone(contract);
  composedContract.layout_mode = 'composed';
  composedContract.page_pattern = null;
  composedContract.presentation = { type: 'push', transition: 'slide-left-enter, slide-right-exit', dismissAction: 'back-button', overlayLevel: 'inline', coversTabBar: true, source: 'library-consumption.json#/appRuntime/presentationTypes' };
  composedContract.prompt_contract.layout_contract = { mode: 'composed', source: 'references/design-decisions.md#layout', selection_reason: '没有明确命中范式，按任务层级自主组合', page_edge_mode: 'M0', page_edge_mode_reason: '连续内容由组件承担横向内边距', rules: ['使用正式按钮承接唯一主操作'], mutable_regions: ['.contract-fixture'] };
  const composedJs = `/* wego-design-contract: ${JSON.stringify(composedContract)} */\nwindow.WegoApp.registerScene({ routeId: 'contract-fixture', presentation: ${JSON.stringify(composedContract.presentation)}, template: \`<section class="contract-fixture" data-surface-id="contract-fixture" data-route-id="contract-fixture" data-layout-mode="composed"><button class="btn btn--strong" data-dd-id="fixture-button" data-component-slug="button" data-rule-source="components/button.json#/domAnatomy" data-token-binding="color:var(--text-default)" data-dom-id="fixture-confirm">确认</button></section>\`, init(ctx) { ctx.root.querySelector('[data-dom-id="fixture-confirm"]').addEventListener('click', function () { ctx.toast('已确认'); }); } });\n`;
  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), composedJs);
  assertSuccess(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '自主组合场景提取');
  assertSuccess(run('scripts/validate-scene-contract.mjs', [sceneRoot, '--routes', routes]), '自主组合场景合同');

  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), composedJs.replace('"selection_reason":"没有明确命中范式，按任务层级自主组合",', ''));
  assertFailure(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '缺少自主组合理由');
  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), sceneJs);

  fs.appendFileSync(path.join(sceneRoot, 'scene.css'), '.contract-fixture--invalid { box-shadow: var(--shadow-sm); }\n');
  assertSuccess(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '含越权已声明 Token 的提取');
  assertFailure(run('scripts/validate-scene-contract.mjs', [sceneRoot, '--routes', routes]), '越权已声明 Token');
  fs.writeFileSync(path.join(sceneRoot, 'scene.css'), '.contract-fixture { color: var(--text-default); }\n');
  assertSuccess(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '恢复 Token 合同');

  fs.appendFileSync(path.join(sceneRoot, 'scene.js'), '// source changed\n');
  assertFailure(run('scripts/validate-scene-contract.mjs', [sceneRoot, '--routes', routes]), '过期设计决策');
  fs.writeFileSync(path.join(sceneRoot, 'scene.js'), sceneJs);

  fs.appendFileSync(path.join(sceneRoot, 'scene.css'), '.contract-fixture--invalid { color: var(--not-a-token); }\n');
  assertSuccess(run('scripts/extract-design-decisions.mjs', [sceneRoot]), '含未知 Token 的提取');
  assertFailure(run('scripts/validate-scene-contract.mjs', [sceneRoot, '--routes', routes]), '未知 Token');
  console.log('场景合同工具测试通过。');
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
