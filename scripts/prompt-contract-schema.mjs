export const requiredPromptArrays = [
  'token_bindings',
  'component_bindings',
  'interaction_contract',
  'state_contract'
];

const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;
const isPlainObject = value => value && typeof value === 'object' && !Array.isArray(value);
const asArray = value => Array.isArray(value) ? value : [];

export function validatePromptContractShape(prompt) {
  const errors = [];
  const add = (path, message) => errors.push({ path, message });
  if (!isPlainObject(prompt)) {
    add('prompt_contract', '必须是对象');
    return errors;
  }

  const allowedTopLevel = new Set(['design_system_version', 'token_bindings', 'component_bindings', 'layout_contract', 'interaction_contract', 'state_contract']);
  for (const field of Object.keys(prompt)) if (!allowedTopLevel.has(field)) add(`prompt_contract.${field}`, '不是当前 Schema 字段');
  if (!Number.isInteger(prompt.design_system_version) || prompt.design_system_version < 1) add('prompt_contract.design_system_version', '必须是正整数');
  for (const field of requiredPromptArrays) if (!Array.isArray(prompt[field])) add(`prompt_contract.${field}`, '必须是数组');

  asArray(prompt.token_bindings).forEach((binding, index) => {
    const prefix = `prompt_contract.token_bindings[${index}]`;
    if (!isPlainObject(binding)) return add(prefix, '必须是对象');
    const allowed = new Set(['selector', 'content_role', 'css_property', 'token']);
    for (const field of Object.keys(binding)) if (!allowed.has(field)) add(`${prefix}.${field}`, '不是当前 Schema 字段');
    for (const field of allowed) if (!isNonEmptyString(binding[field])) add(`${prefix}.${field}`, '必须是非空字符串');
  });

  const bindingIds = new Set();
  asArray(prompt.component_bindings).forEach((binding, index) => {
    const prefix = `prompt_contract.component_bindings[${index}]`;
    if (!isPlainObject(binding)) return add(prefix, '必须是对象');
    const allowed = new Set(['binding_id', 'slug', 'reason', 'variant_dimensions']);
    for (const field of Object.keys(binding)) if (!allowed.has(field)) add(`${prefix}.${field}`, '不是当前 Schema 字段');
    for (const field of ['binding_id', 'slug', 'reason']) if (!isNonEmptyString(binding[field])) add(`${prefix}.${field}`, '必须是非空字符串');
    if (!isPlainObject(binding.variant_dimensions) || !Object.keys(binding.variant_dimensions || {}).length) add(`${prefix}.variant_dimensions`, '必须是非空对象');
    if (isNonEmptyString(binding.binding_id)) {
      if (!/^[a-z][a-z0-9-]*$/.test(binding.binding_id)) add(`${prefix}.binding_id`, '必须是稳定 kebab-case');
      if (bindingIds.has(binding.binding_id)) add(`${prefix}.binding_id`, '不得重复');
      bindingIds.add(binding.binding_id);
    }
  });

  const layout = prompt.layout_contract;
  if (!isPlainObject(layout)) add('prompt_contract.layout_contract', '必须是对象');
  else {
    const allowed = new Set(['mode', 'source', 'selection_reason', 'page_edge_mode', 'mutable_regions']);
    for (const field of Object.keys(layout)) if (!allowed.has(field)) add(`prompt_contract.layout_contract.${field}`, '不是当前 Schema 字段');
    if (!['pattern', 'composed'].includes(layout.mode)) add('prompt_contract.layout_contract.mode', '必须是 pattern 或 composed');
    for (const field of ['source', 'selection_reason', 'page_edge_mode']) if (!isNonEmptyString(layout[field])) add(`prompt_contract.layout_contract.${field}`, '必须是非空字符串');
    if (isNonEmptyString(layout.page_edge_mode) && !['M0', 'M8', 'M32'].includes(layout.page_edge_mode)) add('prompt_contract.layout_contract.page_edge_mode', '只能使用 M0、M8 或 M32');
    if (!Array.isArray(layout.mutable_regions) || !layout.mutable_regions.length) add('prompt_contract.layout_contract.mutable_regions', '必须是非空数组');
    else {
      const regions = new Set();
      layout.mutable_regions.forEach((value, index) => {
        if (!isNonEmptyString(value)) add(`prompt_contract.layout_contract.mutable_regions[${index}]`, '必须是非空字符串');
        else if (regions.has(value)) add(`prompt_contract.layout_contract.mutable_regions[${index}]`, '不得重复');
        regions.add(value);
      });
    }
  }

  const interactionIds = new Set();
  asArray(prompt.interaction_contract).forEach((interaction, index) => {
    const prefix = `prompt_contract.interaction_contract[${index}]`;
    if (!isPlainObject(interaction)) return add(prefix, '必须是对象');
    const allowed = new Set(['dom_id', 'target']);
    for (const field of Object.keys(interaction)) if (!allowed.has(field)) add(`${prefix}.${field}`, '不是当前 Schema 字段');
    for (const field of allowed) if (!isNonEmptyString(interaction[field])) add(`${prefix}.${field}`, '必须是非空字符串');
    if (isNonEmptyString(interaction.dom_id)) {
      if (!/^[a-z][a-z0-9-]*$/.test(interaction.dom_id)) add(`${prefix}.dom_id`, '必须是稳定 kebab-case');
      if (interactionIds.has(interaction.dom_id)) add(`${prefix}.dom_id`, '不得重复');
      interactionIds.add(interaction.dom_id);
    }
    if (isNonEmptyString(interaction.target) && !/^(?:route:[a-z][a-z0-9-]*|overlay:(?:modal|sheet|full-screen-modal|close)|state:[a-z][a-z0-9-]*|feedback:(?:toast|dialog)|navigation:back)$/.test(interaction.target)) add(`${prefix}.target`, '必须使用可校验的 route、overlay、state、feedback 或 navigation 目标');
  });

  const stateIds = new Set();
  asArray(prompt.state_contract).forEach((state, index) => {
    const prefix = `prompt_contract.state_contract[${index}]`;
    if (!isPlainObject(state)) return add(prefix, '必须是对象');
    const allowed = new Set(['state_id', 'initial', 'trigger', 'visible_result', 'fallback', 'persistence']);
    for (const field of Object.keys(state)) if (!allowed.has(field)) add(`${prefix}.${field}`, '不是当前 Schema 字段');
    for (const field of ['state_id', 'trigger', 'visible_result', 'fallback', 'persistence']) if (!isNonEmptyString(state[field])) add(`${prefix}.${field}`, '必须是非空字符串');
    if (isNonEmptyString(state.persistence) && !['memory', 'shared-memory', 'local-storage'].includes(state.persistence)) add(`${prefix}.persistence`, '只能是 memory、shared-memory 或 local-storage');
    if (typeof state.initial !== 'boolean') add(`${prefix}.initial`, '必须是布尔值');
    if (isNonEmptyString(state.state_id)) {
      if (!/^[a-z][a-z0-9-]*$/.test(state.state_id)) add(`${prefix}.state_id`, '必须是稳定 kebab-case');
      if (stateIds.has(state.state_id)) add(`${prefix}.state_id`, '不得重复');
      stateIds.add(state.state_id);
    }
  });
  if (asArray(prompt.state_contract).length && asArray(prompt.state_contract).filter(state => state?.initial === true).length !== 1) add('prompt_contract.state_contract', '非空状态合同必须且只能有一个初始状态');
  return errors;
}
