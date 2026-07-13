export const requiredPromptArrays = [
  'token_whitelist',
  'token_bindings',
  'component_bindings',
  'interaction_contract',
  'state_contract',
  'hard_rules'
];

export const promptContractTemplateFields = [
  'prompt_contract:', 'design_system_snapshot:', 'version:', 'token_css:', 'component_css:', 'component_inputs:',
  'slug:', 'preview_file:', 'contract_file:', 'token_whitelist:', 'token_bindings:', 'selector:', 'content_role:',
  'css_property:', 'token:', 'rule_ref:', 'component_bindings:', 'slot:', 'reason:', 'root_class:',
  'required_structure:', 'modifiers:', 'variant_dimensions:', 'layout_contract:', 'mode:', 'source:', 'selection_reason:',
  'page_edge_mode:', 'page_edge_mode_reason:', 'rules:',
  'mutable_regions:', 'interaction_contract:', 'dom_id:', 'target:', 'state_contract:', 'state_id:', 'initial:',
  'trigger:', 'visible_result:', 'fallback:', 'persistence:', 'hard_rules:'
];

const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;
const isPlainObject = value => value && typeof value === 'object' && !Array.isArray(value);

export function validatePromptContractShape(prompt) {
  const errors = [];
  const add = (path, message) => errors.push({ path, message });
  if (!isPlainObject(prompt)) {
    add('prompt_contract', '必须是对象');
    return errors;
  }

  for (const field of requiredPromptArrays) {
    if (!Array.isArray(prompt[field])) add(`prompt_contract.${field}`, '必须是数组');
  }

  const snapshot = prompt.design_system_snapshot;
  if (!isPlainObject(snapshot)) add('prompt_contract.design_system_snapshot', '必须是对象');
  else {
    if (!Number.isInteger(snapshot.version) || snapshot.version < 1) add('prompt_contract.design_system_snapshot.version', '必须是正整数');
    for (const field of ['token_css', 'component_css']) if (!isNonEmptyString(snapshot[field])) add(`prompt_contract.design_system_snapshot.${field}`, '必须是非空字符串');
    if (!Array.isArray(snapshot.component_inputs)) add('prompt_contract.design_system_snapshot.component_inputs', '必须是数组');
    else {
      const inputSlugs = new Set();
      snapshot.component_inputs.forEach((input, index) => {
        const prefix = `prompt_contract.design_system_snapshot.component_inputs[${index}]`;
        if (!isPlainObject(input)) return add(prefix, '必须是对象');
        for (const field of ['slug', 'preview_file', 'contract_file']) if (!isNonEmptyString(input[field])) add(`${prefix}.${field}`, '必须是非空字符串');
        if (isNonEmptyString(input.slug)) {
          if (inputSlugs.has(input.slug)) add(`${prefix}.slug`, '不得重复');
          inputSlugs.add(input.slug);
        }
      });
    }
  }

  (prompt.token_bindings || []).forEach((binding, index) => {
    const prefix = `prompt_contract.token_bindings[${index}]`;
    if (!isPlainObject(binding)) return add(prefix, '必须是对象');
    for (const field of ['selector', 'content_role', 'css_property', 'token', 'rule_ref']) if (!isNonEmptyString(binding[field])) add(`${prefix}.${field}`, '必须是非空字符串');
  });

  const bindingSlugs = new Set();
  (prompt.component_bindings || []).forEach((binding, index) => {
    const prefix = `prompt_contract.component_bindings[${index}]`;
    if (!isPlainObject(binding)) return add(prefix, '必须是对象');
    for (const field of ['slot', 'slug', 'reason', 'root_class', 'source', 'contract_file']) if (!isNonEmptyString(binding[field])) add(`${prefix}.${field}`, '必须是非空字符串');
    for (const field of ['required_structure', 'modifiers']) if (!Array.isArray(binding[field])) add(`${prefix}.${field}`, '必须是数组');
    if (!isPlainObject(binding.variant_dimensions)) add(`${prefix}.variant_dimensions`, '必须是对象');
    if (isNonEmptyString(binding.slug)) {
      if (bindingSlugs.has(binding.slug)) add(`${prefix}.slug`, '不得重复');
      bindingSlugs.add(binding.slug);
    }
  });

  const layout = prompt.layout_contract;
  if (!isPlainObject(layout)) add('prompt_contract.layout_contract', '必须是对象');
  else {
    if (!['pattern', 'composed'].includes(layout.mode)) add('prompt_contract.layout_contract.mode', '必须是 pattern 或 composed');
    for (const field of ['source', 'selection_reason', 'page_edge_mode', 'page_edge_mode_reason']) if (!isNonEmptyString(layout[field])) add(`prompt_contract.layout_contract.${field}`, '必须是非空字符串');
    if (isNonEmptyString(layout.page_edge_mode) && !['M0', 'M8', 'M32'].includes(layout.page_edge_mode)) add('prompt_contract.layout_contract.page_edge_mode', '只能使用 M0、M8 或 M32');
    if (!Array.isArray(layout.rules) || !layout.rules.length) add('prompt_contract.layout_contract.rules', '必须是非空数组');
    if (!Array.isArray(layout.mutable_regions)) add('prompt_contract.layout_contract.mutable_regions', '必须是数组');
  }

  (prompt.interaction_contract || []).forEach((interaction, index) => {
    const prefix = `prompt_contract.interaction_contract[${index}]`;
    if (!isPlainObject(interaction)) return add(prefix, '必须是对象');
    for (const field of ['dom_id', 'target']) if (!isNonEmptyString(interaction[field])) add(`${prefix}.${field}`, '必须是非空字符串');
  });

  (prompt.state_contract || []).forEach((state, index) => {
    const prefix = `prompt_contract.state_contract[${index}]`;
    if (!isPlainObject(state)) return add(prefix, '必须是对象');
    for (const field of ['state_id', 'trigger', 'visible_result', 'fallback', 'persistence']) if (!isNonEmptyString(state[field])) add(`${prefix}.${field}`, '必须是非空字符串');
    if (typeof state.initial !== 'boolean') add(`${prefix}.initial`, '必须是布尔值');
  });

  if (Array.isArray(prompt.hard_rules) && !prompt.hard_rules.some(isNonEmptyString)) add('prompt_contract.hard_rules', '至少包含一条非空硬规则');
  return errors;
}
