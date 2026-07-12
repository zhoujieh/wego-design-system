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
  page_pattern: 'settings',
  prompt_contract: {
    design_system_snapshot: {
      version: metadata.version,
      component_inputs: [{ slug: 'button', preview_file: 'preview/component-button.html', contract_file: 'components/button.json' }]
    },
    token_whitelist: ['var(--text-default)'],
    token_bindings: [{ content_role: 'fixture-action', css_property: 'color', token: 'var(--text-default)', rule_ref: 'components/button.json#/runtimeTokens' }],
    component_bindings: [{ slug: 'button', root_class: 'button', source: 'preview/component-button.html', contract_file: 'components/button.json' }],
    layout_contract: { source: 'uikit-plan.json#/pagePatterns', rules: ['单一操作位于页面主内容内'], mutable_regions: ['.contract-fixture'] },
    interaction_contract: [{ dom_id: 'fixture-confirm', target: 'overlay:toast' }],
    state_contract: [{ state_id: 'initial', initial: true, fallback: 'none' }],
    hard_rules: ['禁止硬编码颜色']
  },
  visual_check: { status: 'passed', viewports: [375, 393], checked_at: '2026-07-12T00:00:00+08:00' },
  crowding_check: { status: 'passed', items: ['无横向溢出', '无重叠', '无裁切', '按钮不换行', '首屏层级清晰', '操作区不拥挤'] }
};

const sceneJs = `/* wego-design-contract: ${JSON.stringify(contract)} */
window.WegoApp.registerScene({
  routeId: 'contract-fixture',
  template: \`<section class="contract-fixture" data-surface-id="contract-fixture" data-route-id="contract-fixture" data-page-pattern="settings"><button class="button" data-dd-id="fixture-button" data-component-slug="button" data-rule-source="components/button.json#/domAnatomy" data-token-binding="color:var(--text-default)" data-dom-id="fixture-confirm">确认</button></section>\`,
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
