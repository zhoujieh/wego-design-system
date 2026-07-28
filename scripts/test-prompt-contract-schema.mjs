#!/usr/bin/env node

import { validatePromptContractShape } from './prompt-contract-schema.mjs';

const valid = {
  design_system_version: 411,
  token_bindings: [{ selector: '.fixture__title', content_role: '标题', css_property: 'color', token: 'var(--text-default)' }],
  component_bindings: [
    { binding_id: 'primary-action', slug: 'button', reason: '承载确认操作', variant_dimensions: { emphasis: 'strong' } },
    { binding_id: 'secondary-action', slug: 'button', reason: '承载取消操作', variant_dimensions: { emphasis: 'weak' } }
  ],
  layout_contract: {
    mode: 'pattern',
    source: 'uikit-plan.json#/pagePatterns/system-settings',
    selection_reason: '以层级入口为主，连续列表由语义内容组承担横向边距',
    mutable_regions: ['.fixture__content'],
    page_layers: [{ region_id: 'fixture-content', selector: '.fixture__content', scope: 'page-local', role: 'content' }],
    scroll_architecture: { viewport_selector: '.fixture', primary_scroll_selector: '.fixture__scroll', document_scroll: false, nested_scroll_regions: [], fixed_regions: [] },
    layout_groups: [{ group_id: 'fixture-content-group', selector: '.fixture__content', content_role: '主要内容', inline_inset_token: 'var(--spacer-16)', spacing_owner: 'scene', gap_token: 'var(--spacer-12)' }],
    sticky_regions: []
  },
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
expectError(value => { value.layout_contract.mutable_regions = []; }, 'prompt_contract.layout_contract.mutable_regions');
expectError(value => { value.layout_contract.page_edge_mode = 'M8'; }, 'prompt_contract.layout_contract.page_edge_mode');
expectError(value => { value.layout_contract.page_layers = []; }, 'prompt_contract.layout_contract.page_layers');
expectError(value => { value.layout_contract.page_layers[0].role = 'floating-whatever'; }, 'prompt_contract.layout_contract.page_layers[0].role');
expectError(value => { value.layout_contract.scroll_architecture.document_scroll = true; }, 'prompt_contract.layout_contract.scroll_architecture.document_scroll');
expectError(value => { value.layout_contract.layout_groups[0].inline_inset_token = '16px'; }, 'prompt_contract.layout_contract.layout_groups[0].inline_inset_token');
expectError(value => { value.layout_contract.layout_groups[0].spacing_owner = 'root'; }, 'prompt_contract.layout_contract.layout_groups[0].spacing_owner');
expectError(value => { value.layout_contract.sticky_regions = {}; }, 'prompt_contract.layout_contract.sticky_regions');
expectError(value => { value.interaction_contract[0].target = 'anything'; }, 'prompt_contract.interaction_contract[0].target');
expectError(value => { value.interaction_contract.push(structuredClone(value.interaction_contract[0])); }, 'prompt_contract.interaction_contract[1].dom_id');
expectError(value => { delete value.state_contract[0].persistence; }, 'prompt_contract.state_contract[0].persistence');
expectError(value => { value.state_contract[0].persistence = 'forever'; }, 'prompt_contract.state_contract[0].persistence');
expectError(value => { value.state_contract[0].initial = false; }, 'prompt_contract.state_contract');
expectError(value => { value.hard_rules = []; }, 'prompt_contract.hard_rules');
console.log('prompt_contract Schema 测试通过。');
