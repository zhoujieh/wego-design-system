#!/usr/bin/env node

import { validatePromptContractShape } from './prompt-contract-schema.mjs';

const valid = {
  design_system_snapshot: {
    version: 1,
    token_css: 'colors_and_type.css',
    component_css: 'components.css',
    component_inputs: [{ slug: 'button', preview_file: 'preview/component-button.html', contract_file: 'components/button.json' }]
  },
  token_whitelist: ['var(--text-default)'],
  token_bindings: [{ selector: '.fixture__title', content_role: '标题', css_property: 'color', token: 'var(--text-default)', rule_ref: 'colors_and_type.css#/text-default' }],
  component_bindings: [{ slot: 'primary-action', slug: 'button', reason: '承载确认操作', root_class: 'btn', required_structure: [], modifiers: ['btn--strong'], variant_dimensions: { emphasis: 'strong' }, source: 'preview/component-button.html', contract_file: 'components/button.json' }],
  layout_contract: { mode: 'pattern', source: 'uikit-plan.json#/pagePatterns/system-settings', selection_reason: '以层级入口为主且无页面级保存', page_edge_mode: 'M0', page_edge_mode_reason: '连续列表由组件承担横向内边距', rules: ['主操作位于内容底部'], mutable_regions: ['.fixture__content'] },
  interaction_contract: [{ dom_id: 'fixture-confirm', target: 'overlay:toast' }],
  state_contract: [{ state_id: 'initial', initial: true, trigger: '场景进入', visible_result: '显示确认操作', fallback: 'none', persistence: 'memory' }],
  hard_rules: ['禁止硬编码颜色']
};

function expectError(mutate, expectedPath) {
  const value = structuredClone(valid);
  mutate(value);
  if (!validatePromptContractShape(value).some(error => error.path === expectedPath)) throw new Error(`应拦截 ${expectedPath}`);
}

if (validatePromptContractShape(valid).length) throw new Error('有效 prompt_contract 不应被拦截');
expectError(value => { delete value.design_system_snapshot.component_css; }, 'prompt_contract.design_system_snapshot.component_css');
expectError(value => { delete value.token_bindings[0].selector; }, 'prompt_contract.token_bindings[0].selector');
expectError(value => { delete value.component_bindings[0].reason; }, 'prompt_contract.component_bindings[0].reason');
expectError(value => { value.component_bindings[0].variant_dimensions = []; }, 'prompt_contract.component_bindings[0].variant_dimensions');
expectError(value => { value.component_bindings.push(structuredClone(value.component_bindings[0])); }, 'prompt_contract.component_bindings[1].slug');
expectError(value => { delete value.layout_contract.mode; }, 'prompt_contract.layout_contract.mode');
expectError(value => { value.layout_contract.page_edge_mode = 'M16'; }, 'prompt_contract.layout_contract.page_edge_mode');
expectError(value => { delete value.state_contract[0].persistence; }, 'prompt_contract.state_contract[0].persistence');
expectError(value => { value.hard_rules = []; }, 'prompt_contract.hard_rules');
console.log('prompt_contract Schema 测试通过。');
