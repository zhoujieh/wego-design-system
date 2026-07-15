#!/usr/bin/env node

import { validatePromptContractShape } from './prompt-contract-schema.mjs';

const valid = {
  design_system_version: 411,
  token_bindings: [{ selector: '.fixture__title', content_role: '标题', css_property: 'color', token: 'var(--text-default)' }],
  component_bindings: [
    { binding_id: 'primary-action', slug: 'button', reason: '承载确认操作', variant_dimensions: { emphasis: 'strong' } },
    { binding_id: 'secondary-action', slug: 'button', reason: '承载取消操作', variant_dimensions: { emphasis: 'weak' } }
  ],
  layout_contract: { mode: 'pattern', source: 'uikit-plan.json#/pagePatterns/system-settings', selection_reason: '以层级入口为主，连续列表由组件承担横向边距', page_edge_mode: 'M0', mutable_regions: ['.fixture__content'] },
  interaction_contract: [{ dom_id: 'fixture-confirm', target: 'feedback:toast' }],
  state_contract: [{ state_id: 'initial', initial: true, trigger: '场景进入', visible_result: '显示确认操作', fallback: 'none', persistence: 'memory' }]
};

function expectError(mutate, expectedPath) {
  const value = structuredClone(valid);
  mutate(value);
  const errors = validatePromptContractShape(value);
  if (!errors.some(error => error.path === expectedPath)) throw new Error(`应拦截 ${expectedPath}，实际：${JSON.stringify(errors)}`);
}

if (validatePromptContractShape(valid).length) throw new Error('有效 prompt_contract 不应被拦截');
expectError(value => { delete value.design_system_version; }, 'prompt_contract.design_system_version');
for (const field of ['token_bindings', 'component_bindings', 'interaction_contract', 'state_contract']) {
  expectError(value => { value[field] = {}; }, `prompt_contract.${field}`);
}
expectError(value => { delete value.token_bindings[0].selector; }, 'prompt_contract.token_bindings[0].selector');
expectError(value => { delete value.component_bindings[0].reason; }, 'prompt_contract.component_bindings[0].reason');
expectError(value => { value.component_bindings[0].variant_dimensions = []; }, 'prompt_contract.component_bindings[0].variant_dimensions');
expectError(value => { value.component_bindings[0].variant_dimensions = {}; }, 'prompt_contract.component_bindings[0].variant_dimensions');
expectError(value => { value.component_bindings[1].binding_id = 'primary-action'; }, 'prompt_contract.component_bindings[1].binding_id');
expectError(value => { value.component_bindings[0].legacy = true; }, 'prompt_contract.component_bindings[0].legacy');
expectError(value => { delete value.layout_contract.mode; }, 'prompt_contract.layout_contract.mode');
expectError(value => { value.layout_contract.page_edge_mode = 'M16'; }, 'prompt_contract.layout_contract.page_edge_mode');
expectError(value => { value.layout_contract.mutable_regions = []; }, 'prompt_contract.layout_contract.mutable_regions');
expectError(value => { value.interaction_contract[0].target = 'anything'; }, 'prompt_contract.interaction_contract[0].target');
expectError(value => { value.interaction_contract.push(structuredClone(value.interaction_contract[0])); }, 'prompt_contract.interaction_contract[1].dom_id');
expectError(value => { delete value.state_contract[0].persistence; }, 'prompt_contract.state_contract[0].persistence');
expectError(value => { value.state_contract[0].persistence = 'forever'; }, 'prompt_contract.state_contract[0].persistence');
expectError(value => { value.state_contract[0].initial = false; }, 'prompt_contract.state_contract');
expectError(value => { value.hard_rules = []; }, 'prompt_contract.hard_rules');
console.log('prompt_contract Schema 测试通过。');
