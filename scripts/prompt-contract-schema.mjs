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
    const allowed = new Set(['binding_id', 'slug', 'reason', 'principle_refs', 'variant_dimensions']);
    for (const field of Object.keys(binding)) if (!allowed.has(field)) add(`${prefix}.${field}`, '不是当前 Schema 字段');
    for (const field of ['binding_id', 'slug', 'reason']) if (!isNonEmptyString(binding[field])) add(`${prefix}.${field}`, '必须是非空字符串');
    if (binding.principle_refs !== undefined && !Array.isArray(binding.principle_refs)) add(`${prefix}.principle_refs`, '必须是数组');
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
    const allowed = new Set(['mode', 'source', 'selection_reason', 'principle_refs', 'mutable_regions', 'page_layers', 'scroll_architecture', 'layout_groups', 'sticky_regions']);
    for (const field of Object.keys(layout)) if (!allowed.has(field)) add(`prompt_contract.layout_contract.${field}`, '不是当前 Schema 字段');
    if (!['pattern', 'composed'].includes(layout.mode)) add('prompt_contract.layout_contract.mode', '必须是 pattern 或 composed');
    for (const field of ['source', 'selection_reason']) if (!isNonEmptyString(layout[field])) add(`prompt_contract.layout_contract.${field}`, '必须是非空字符串');
    if (layout.principle_refs !== undefined && !Array.isArray(layout.principle_refs)) add('prompt_contract.layout_contract.principle_refs', '必须是数组');
    if (!Array.isArray(layout.mutable_regions) || !layout.mutable_regions.length) add('prompt_contract.layout_contract.mutable_regions', '必须是非空数组');
    else {
      const regions = new Set();
      layout.mutable_regions.forEach((value, index) => {
        if (!isNonEmptyString(value)) add(`prompt_contract.layout_contract.mutable_regions[${index}]`, '必须是非空字符串');
        else if (regions.has(value)) add(`prompt_contract.layout_contract.mutable_regions[${index}]`, '不得重复');
        regions.add(value);
      });
    }

    const layerIds = new Set();
    if (!Array.isArray(layout.page_layers) || !layout.page_layers.length) add('prompt_contract.layout_contract.page_layers', '必须是非空数组');
    asArray(layout.page_layers).forEach((layer, index) => {
      const prefix = `prompt_contract.layout_contract.page_layers[${index}]`;
      if (!isPlainObject(layer)) return add(prefix, '必须是对象');
      const fields = new Set(['region_id', 'selector', 'scope', 'role']);
      for (const field of Object.keys(layer)) if (!fields.has(field)) add(`${prefix}.${field}`, '不是当前 Schema 字段');
      for (const field of fields) if (!isNonEmptyString(layer[field])) add(`${prefix}.${field}`, '必须是非空字符串');
      if (isNonEmptyString(layer.region_id)) {
        if (!/^[a-z][a-z0-9-]*$/.test(layer.region_id)) add(`${prefix}.region_id`, '必须是稳定 kebab-case');
        if (layerIds.has(layer.region_id)) add(`${prefix}.region_id`, '不得重复');
        layerIds.add(layer.region_id);
      }
      if (!['page-local', 'app-global', 'overlay-local'].includes(layer.scope)) add(`${prefix}.scope`, '必须是 page-local、app-global 或 overlay-local');
      const roles = {
        'page-local': ['content', 'raised', 'navigation', 'anchored-popout'],
        'app-global': ['host', 'scene', 'overlay', 'dialog', 'feedback', 'critical'],
        'overlay-local': ['mask', 'surface', 'nested-popout']
      };
      if (roles[layer.scope] && !roles[layer.scope].includes(layer.role)) add(`${prefix}.role`, '不是该 scope 支持的层级角色');
    });

    const scroll = layout.scroll_architecture;
    if (!isPlainObject(scroll)) add('prompt_contract.layout_contract.scroll_architecture', '必须是对象');
    else {
      const prefix = 'prompt_contract.layout_contract.scroll_architecture';
      const fields = new Set(['viewport_selector', 'primary_scroll_selector', 'document_scroll', 'nested_scroll_regions', 'fixed_regions']);
      for (const field of Object.keys(scroll)) if (!fields.has(field)) add(`${prefix}.${field}`, '不是当前 Schema 字段');
      for (const field of ['viewport_selector', 'primary_scroll_selector']) if (!isNonEmptyString(scroll[field])) add(`${prefix}.${field}`, '必须是非空字符串');
      if (typeof scroll.document_scroll !== 'boolean' || scroll.document_scroll) add(`${prefix}.document_scroll`, '必须为 false，App 场景禁止 document scroll');
      if (!Array.isArray(scroll.nested_scroll_regions)) add(`${prefix}.nested_scroll_regions`, '必须是数组');
      asArray(scroll.nested_scroll_regions).forEach((region, index) => {
        const itemPrefix = `${prefix}.nested_scroll_regions[${index}]`;
        if (!isPlainObject(region)) return add(itemPrefix, '必须是对象');
        const itemFields = new Set(['region_id', 'selector', 'axis', 'parent_selector']);
        for (const field of Object.keys(region)) if (!itemFields.has(field)) add(`${itemPrefix}.${field}`, '不是当前 Schema 字段');
        for (const field of itemFields) if (!isNonEmptyString(region[field])) add(`${itemPrefix}.${field}`, '必须是非空字符串');
        if (!['x', 'y', 'both'].includes(region.axis)) add(`${itemPrefix}.axis`, '必须是 x、y 或 both');
      });
      if (!Array.isArray(scroll.fixed_regions)) add(`${prefix}.fixed_regions`, '必须是数组');
      asArray(scroll.fixed_regions).forEach((region, index) => {
        const itemPrefix = `${prefix}.fixed_regions[${index}]`;
        if (!isPlainObject(region)) return add(itemPrefix, '必须是对象');
        const itemFields = new Set(['region_id', 'selector', 'edge', 'safe_area_owner', 'clearance']);
        for (const field of Object.keys(region)) if (!itemFields.has(field)) add(`${itemPrefix}.${field}`, '不是当前 Schema 字段');
        for (const field of itemFields) if (!isNonEmptyString(region[field])) add(`${itemPrefix}.${field}`, '必须是非空字符串');
        if (!['top', 'bottom'].includes(region.edge)) add(`${itemPrefix}.edge`, '必须是 top 或 bottom');
        if (!['component', 'region', 'host'].includes(region.safe_area_owner)) add(`${itemPrefix}.safe_area_owner`, '必须是 component、region 或 host');
        if (!['dynamic-measured', 'flow-reserved'].includes(region.clearance)) add(`${itemPrefix}.clearance`, '必须是 dynamic-measured 或 flow-reserved');
      });
    }

    const groupIds = new Set();
    const groupSelectors = new Set();
    if (!Array.isArray(layout.layout_groups) || !layout.layout_groups.length) add('prompt_contract.layout_contract.layout_groups', '必须是非空数组');
    asArray(layout.layout_groups).forEach((group, index) => {
      const prefix = `prompt_contract.layout_contract.layout_groups[${index}]`;
      if (!isPlainObject(group)) return add(prefix, '必须是对象');
      const fields = new Set(['group_id', 'selector', 'content_role', 'inline_inset_token', 'spacing_owner', 'gap_token']);
      for (const field of Object.keys(group)) if (!fields.has(field)) add(`${prefix}.${field}`, '不是当前 Schema 字段');
      for (const field of fields) if (!isNonEmptyString(group[field])) add(`${prefix}.${field}`, '必须是非空字符串');
      if (isNonEmptyString(group.group_id)) {
        if (!/^[a-z][a-z0-9-]*$/.test(group.group_id)) add(`${prefix}.group_id`, '必须是稳定 kebab-case');
        if (groupIds.has(group.group_id)) add(`${prefix}.group_id`, '不得重复');
        groupIds.add(group.group_id);
      }
      if (isNonEmptyString(group.selector)) {
        if (groupSelectors.has(group.selector)) add(`${prefix}.selector`, '同一内容组 selector 只能有一个 spacing owner');
        groupSelectors.add(group.selector);
      }
      if (isNonEmptyString(group.inline_inset_token) && !/^var\(--(?:layout-page-margin-m(?:0|8|32)|spacer-(?:0|2|4|6|8|12|16|20|24|32|40|48|56|64|72|80))\)$/.test(group.inline_inset_token)) add(`${prefix}.inline_inset_token`, '必须使用正式页面边距或 spacer Token');
      if (!['scene', 'component', 'host'].includes(group.spacing_owner)) add(`${prefix}.spacing_owner`, '必须是 scene、component 或 host');
      if (isNonEmptyString(group.gap_token) && !/^var\(--spacer-(?:0|2|4|6|8|12|16|20|24|32|40|48|56|64|72|80)\)$/.test(group.gap_token)) add(`${prefix}.gap_token`, '必须使用正式 spacer Token');
    });

    const stickyIds = new Set();
    if (!Array.isArray(layout.sticky_regions)) add('prompt_contract.layout_contract.sticky_regions', '必须是数组');
    asArray(layout.sticky_regions).forEach((region, index) => {
      const prefix = `prompt_contract.layout_contract.sticky_regions[${index}]`;
      if (!isPlainObject(region)) return add(prefix, '必须是对象');
      const fields = new Set(['region_id', 'selector', 'scroll_selector', 'edge', 'stack_order', 'visibility', 'background_token', 'layer_role', 'after_gap_token', 'scroll_padding', 'essential']);
      for (const field of Object.keys(region)) if (!fields.has(field)) add(`${prefix}.${field}`, '不是当前 Schema 字段');
      for (const field of ['region_id', 'selector', 'scroll_selector', 'edge', 'visibility', 'background_token', 'layer_role', 'after_gap_token', 'scroll_padding']) if (!isNonEmptyString(region[field])) add(`${prefix}.${field}`, '必须是非空字符串');
      if (isNonEmptyString(region.region_id)) {
        if (!/^[a-z][a-z0-9-]*$/.test(region.region_id)) add(`${prefix}.region_id`, '必须是稳定 kebab-case');
        if (stickyIds.has(region.region_id)) add(`${prefix}.region_id`, '不得重复');
        stickyIds.add(region.region_id);
      }
      if (!['top', 'bottom'].includes(region.edge)) add(`${prefix}.edge`, '必须是 top 或 bottom');
      if (!Number.isInteger(region.stack_order) || region.stack_order < 0) add(`${prefix}.stack_order`, '必须是非负整数');
      if (!['always', 'direction-reveal', 'compact-on-scroll', 'pin-after-threshold', 'elevate-after-scroll'].includes(region.visibility)) add(`${prefix}.visibility`, '不是受支持的 sticky 策略');
      if (region.layer_role !== 'navigation') add(`${prefix}.layer_role`, 'sticky 区域必须使用 navigation');
      if (!/^var\(--bg-[\w-]+\)$/.test(region.background_token)) add(`${prefix}.background_token`, '必须使用不透明背景 Token');
      if (!/^var\(--spacer-(?:0|2|4|6|8|12|16|20|24|32|40|48|56|64|72|80)\)$/.test(region.after_gap_token)) add(`${prefix}.after_gap_token`, '必须使用正式 spacer Token');
      if (!['dynamic-measured', 'flow-reserved'].includes(region.scroll_padding)) add(`${prefix}.scroll_padding`, '必须是 dynamic-measured 或 flow-reserved');
      if (typeof region.essential !== 'boolean') add(`${prefix}.essential`, '必须是布尔值');
      if (region.essential === true && region.visibility === 'direction-reveal') add(`${prefix}.visibility`, '首要导航、保存、结算或高优先级告警不得自动隐藏');
    });
  }

  const interactionIds = new Set();
  asArray(prompt.interaction_contract).forEach((interaction, index) => {
    const prefix = `prompt_contract.interaction_contract[${index}]`;
    if (!isPlainObject(interaction)) return add(prefix, '必须是对象');
    const allowed = new Set(['dom_id', 'target']);
    for (const field of Object.keys(interaction)) if (!allowed.has(field)) add(`${prefix}.${field}`, '不是当前 Schema 字段');
    for (const field of allowed) if (!isNonEmptyString(interaction[field])) add(`${prefix}.${field}`, '必须是非空字符串');
    if (isNonEmptyString(interaction.dom_id)) {
      // 支持 kebab-case 和动态列表项占位符语法（如 "more-{post_id}"）
      if (!/^[a-z][a-z0-9-]*(?:\{[a-z][a-z0-9_-]*\}[a-z0-9-]*)?$/.test(interaction.dom_id)) add(`${prefix}.dom_id`, '必须是稳定 kebab-case 或带单个占位符的 kebab-case（如 more-{post_id}）');
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
