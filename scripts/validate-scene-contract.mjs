#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { validatePromptContractShape } from './prompt-contract-schema.mjs';

const args = process.argv.slice(2);
const sceneDirectory = args[0];
const jsonOutput = args.includes('--json');
const routesFlag = args.indexOf('--routes');
if (!sceneDirectory) {
  console.error('用法：node scripts/validate-scene-contract.mjs wego-app/scenes/{中文业务场景} [--json] [--routes 路径]');
  process.exit(2);
}
if (routesFlag >= 0 && !args[routesFlag + 1]) {
  console.error('--routes 必须指定 routes.js 路径');
  process.exit(2);
}

const root = process.cwd();
const sceneRoot = path.resolve(root, sceneDirectory);
const errors = [];
const warnings = [];
const add = (code, message, file = null) => errors.push({ code, message, file });
const sceneJs = path.join(sceneRoot, 'scene.js');
const sceneCss = path.join(sceneRoot, 'scene.css');
const decisions = path.join(sceneRoot, 'design-decisions.json');
const routes = routesFlag >= 0 ? path.resolve(root, args[routesFlag + 1]) : path.join(root, 'wego-app/js/routes.js');
const tokenCss = path.join(root, '.codex/skills/wego-design/colors_and_type.css');
const metadata = path.join(root, '.codex/skills/wego-design/metadata.json');
const consumptionFile = path.join(root, '.codex/skills/wego-design/library-consumption.json');
const componentIndexFile = path.join(root, '.codex/skills/wego-design/components/index.json');
const uikitPlanFile = path.join(root, '.codex/skills/wego-design/uikit-plan.json');
const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
if (!fs.existsSync(sceneJs) || !fs.existsSync(sceneCss)) add('scene.files', '场景必须包含 scene.js 与 scene.css', sceneRoot);
let js = '', css = '', decision = null;
if (fs.existsSync(sceneJs)) js = fs.readFileSync(sceneJs, 'utf8');
if (fs.existsSync(sceneCss)) css = fs.readFileSync(sceneCss, 'utf8');
if (!js.includes('window.WegoApp.registerScene')) add('scene.registration', 'scene.js 必须调用 window.WegoApp.registerScene', sceneJs);
const extraction = spawnSync(process.execPath, ['scripts/extract-design-decisions.mjs', sceneDirectory, '--check'], { cwd: root, encoding: 'utf8' });
if (extraction.status !== 0) add('scene.contract', (extraction.stderr || extraction.stdout || '设计合同提取失败').trim(), sceneJs);
if (fs.existsSync(decisions)) {
  try { decision = JSON.parse(fs.readFileSync(decisions, 'utf8')); }
  catch (error) { add('scene.decisions_json', `design-decisions.json 无法解析：${error.message}`, decisions); }
} else add('scene.decisions_missing', '场景必须存在 design-decisions.json', decisions);
const rawColors = [...new Set([...`${js}\n${css}`.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(/g)].map(match => match[0]))];
if (rawColors.length) add('scene.raw_color', `禁止硬编码颜色：${rawColors.join(', ')}`, sceneRoot);
if (/\b(?:TODO|FIXME|lorem|静态原型|设计说明|刷新说明)\b/i.test(`${js}\n${css}`)) add('scene.placeholder', '场景存在占位或内部说明文案', sceneRoot);
const classValues = [...js.matchAll(/(?:class|className)=["']([^"']+)["']/g)].map(match => match[1]);
const previewShellClasses = [...classValues.flatMap(value => value.split(/\s+/)), ...[...css.matchAll(/\.((?:phone|uikit|biz)-[\w-]+)/g)].map(match => match[1])].filter(value => /^(?:phone|uikit|biz)-/.test(value));
if (previewShellClasses.length) add('scene.preview_shell_class', `场景不得复制 Preview 或 UI Kit 宿主 class：${[...new Set(previewShellClasses)].join(', ')}`, sceneRoot);
if (decision) {
  const prompt = decision.prompt_contract || {};
  for (const item of validatePromptContractShape(prompt)) add('scene.prompt_contract_schema', `${item.path} ${item.message}`, decisions);
  let currentVersion = null;
  try { currentVersion = JSON.parse(fs.readFileSync(metadata, 'utf8')).version; }
  catch (error) { add('scene.metadata', `无法读取设计系统版本：${error.message}`, metadata); }
  if (decision.schemaVersion !== 1 || decision.scene !== path.basename(sceneRoot)) add('scene.decisions_schema', 'design-decisions.json 的 schemaVersion 或 scene 与场景目录不一致', decisions);
  if (!Number.isInteger(prompt.design_system_snapshot?.version) || prompt.design_system_snapshot.version !== currentVersion) add('scene.snapshot', 'prompt_contract 必须记录当前设计系统 metadata.version 快照', decisions);
  let consumption = null;
  let indexedComponents = new Map();
  let pagePatterns = [];
  try { consumption = JSON.parse(fs.readFileSync(consumptionFile, 'utf8')); }
  catch (error) { add('scene.consumption_source', `无法读取 library-consumption.json：${error.message}`, consumptionFile); }
  try {
    indexedComponents = new Map(JSON.parse(fs.readFileSync(componentIndexFile, 'utf8')).components.map(component => [component.slug, component]));
  } catch (error) { add('scene.component_index', `无法读取 components/index.json：${error.message}`, componentIndexFile); }
  try {
    const plan = JSON.parse(fs.readFileSync(uikitPlanFile, 'utf8'));
    if (plan.schemaVersion !== 5 || !Array.isArray(plan.pagePatterns)) add('scene.uikit_schema', 'uikit-plan.json 必须使用 schemaVersion 5 且包含 pagePatterns', uikitPlanFile);
    else pagePatterns = plan.pagePatterns;
  } catch (error) { add('scene.uikit_source', `无法读取 uikit-plan.json：${error.message}`, uikitPlanFile); }
  const snapshot = prompt.design_system_snapshot || {};
  if (consumption && (snapshot.token_css !== consumption.tokenCss || snapshot.component_css !== consumption.componentsCss)) {
    add('scene.snapshot_sources', 'design_system_snapshot 必须记录当前 library-consumption.json 的 tokenCss 与 componentsCss', decisions);
  }
  const layout = prompt.layout_contract;
  if (!layout || !Array.isArray(layout.rules) || !layout.rules.length || !Array.isArray(layout.mutable_regions)) add('scene.layout_contract', 'prompt_contract.layout_contract 必须包含 rules 与 mutable_regions', decisions);
  else {
    const layoutSource = String(layout.source || '').split('#')[0];
    if (!layoutSource || !fs.existsSync(path.join(root, '.codex/skills/wego-design', layoutSource))) add('scene.layout_source', 'layout_contract.source 必须指向现存 UI Kit 或设计规则来源', decisions);
    const layoutMode = decision.layout_mode;
    if (!['pattern', 'composed'].includes(layoutMode) || layout.mode !== layoutMode) add('scene.layout_mode', '设计决策与 layout_contract 必须使用相同且合法的 layout_mode', decisions);
    const presentation = decision.presentation || {};
    const presentationTypes = consumption?.appRuntime?.presentationTypes;
    for (const field of ['type', 'transition', 'dismissAction', 'overlayLevel', 'source']) if (typeof presentation[field] !== 'string' || !presentation[field]) add('scene.presentation_field', `presentation.${field} 必须是非空字符串`, decisions);
    if (typeof presentation.coversTabBar !== 'boolean') add('scene.presentation_field', 'presentation.coversTabBar 必须是布尔值', decisions);
    if (!Array.isArray(presentationTypes) || !presentationTypes.includes(presentation.type)) add('scene.presentation_type', 'presentation.type 必须来自 library-consumption.json.appRuntime.presentationTypes', decisions);
    if (layoutMode === 'pattern') {
      const pattern = pagePatterns.find(item => item.id === decision.page_pattern);
      if (!pattern) add('scene.page_pattern', `page_pattern 未命中明确范式：${decision.page_pattern || '未声明'}`, decisions);
      else {
        if (layoutSource !== 'uikit-plan.json' || !String(layout.source).endsWith(`/pagePatterns/${pattern.id}`)) add('scene.pattern_source', 'pattern 模式的 layout_contract.source 必须指向命中的页面范式', decisions);
        for (const [field, value] of Object.entries(pattern.presentation || {})) if (presentation[field] !== value) add('scene.presentation_pattern', `presentation.${field} 必须与范式 ${pattern.id} 一致`, decisions);
        if (presentation.source !== `uikit-plan.json#/pagePatterns/${pattern.id}/presentation`) add('scene.presentation_source', 'pattern 模式的 presentation.source 必须指向命中范式', decisions);
        const candidates = new Set(pattern.componentCandidates || []);
        for (const binding of prompt.component_bindings || []) if (!candidates.has(binding.slug)) add('scene.pattern_component', `范式 ${pattern.id} 不允许组件：${binding.slug}`, decisions);
      }
    } else if (layoutMode === 'composed') {
      if (decision.page_pattern !== null) add('scene.composed_pattern', 'composed 模式的 page_pattern 必须为 null', decisions);
      if (layoutSource !== 'references/design-decisions.md') add('scene.composed_source', 'composed 模式必须以设计决策方法作为 layout_contract.source', decisions);
      if (presentation.source !== 'library-consumption.json#/appRuntime/presentationTypes') add('scene.presentation_source', 'composed 模式的 presentation.source 必须指向运行时 presentation 类型', decisions);
    }
  }
  const declaredTokens = fs.existsSync(tokenCss) ? new Set([...fs.readFileSync(tokenCss, 'utf8').matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1])) : new Set();
  if (!fs.existsSync(tokenCss)) add('scene.token_source', '缺少 colors_and_type.css', tokenCss);
  const componentRuntimeTokens = new Set();
  for (const binding of prompt.component_bindings || []) {
    const expectedContract = binding.slug ? path.join(root, '.codex/skills/wego-design', 'components', `${binding.slug}.json`) : null;
    if (!expectedContract || !fs.existsSync(expectedContract)) continue;
    try {
      for (const token of JSON.parse(fs.readFileSync(expectedContract, 'utf8')).runtimeTokens || []) componentRuntimeTokens.add(token);
    } catch (error) { add('scene.component_runtime_tokens', `无法读取组件 runtimeTokens：${error.message}`, expectedContract); }
  }
  const tokenPolicy = consumption?.sceneTokenPolicy;
  if (!tokenPolicy || !Array.isArray(tokenPolicy.baseTokens) || !Array.isArray(tokenPolicy.baseTokenPrefixes)) add('scene.token_policy', 'library-consumption.json 必须声明 sceneTokenPolicy', consumptionFile);
  const isPolicyToken = token => tokenPolicy && (tokenPolicy.baseTokens.includes(token) || tokenPolicy.baseTokenPrefixes.some(prefix => token.startsWith(prefix)));
  const whitelist = new Set(prompt.token_whitelist || []);
  for (const token of whitelist) {
    const match = String(token).match(/^var\((--[\w-]+)\)$/);
    if (!match || !declaredTokens.has(match[1])) add('scene.token_whitelist_source', `token_whitelist 包含未声明或格式错误的变量：${token}`, decisions);
    else if (!componentRuntimeTokens.has(match[1]) && !isPolicyToken(match[1])) add('scene.token_whitelist_scope', `token_whitelist 包含非本页组件或基础策略的变量：${token}`, decisions);
  }
  const tokens = [...new Set([...`${js}\n${css}`.matchAll(/var\(\s*(--[\w-]+)/g)].map(match => `var(${match[1]})`))];
  for (const token of tokens) if (!whitelist.has(token)) add('scene.token_whitelist', `场景使用未列入 token_whitelist 的变量：${token}`, sceneRoot);
  const renderedComponents = decision.decisions || [];
  const componentIds = new Set();
  const bindingSlugs = new Set((prompt.component_bindings || []).map(item => item.slug));
  const componentInputs = new Map((snapshot.component_inputs || []).map(item => [item.slug, item]));
  for (const input of snapshot.component_inputs || []) if (!bindingSlugs.has(input.slug)) add('scene.component_input_unused', `design_system_snapshot.component_inputs 存在未绑定组件：${input.slug}`, decisions);
  for (const component of renderedComponents) {
    if (componentIds.has(component.dd_id)) add('scene.component_id', `data-dd-id 重复：${component.dd_id}`, sceneJs);
    componentIds.add(component.dd_id);
    if (!bindingSlugs.has(component.component_slug)) add('scene.component_binding_missing', `实际组件未进入 component_bindings：${component.component_slug}`, decisions);
    const ruleSource = String(component.rule_source || '').split('#')[0];
    if (!ruleSource || !fs.existsSync(path.join(root, '.codex/skills/wego-design', ruleSource))) add('scene.component_rule_source', `data-rule-source 不存在：${component.rule_source}`, sceneJs);
    for (const token of [...String(component.token_binding || '').matchAll(/var\((--[\w-]+)\)/g)].map(match => `var(${match[1]})`)) {
      if (!whitelist.has(token)) add('scene.component_token_binding', `data-token-binding 使用未白名单 Token：${token}`, sceneJs);
    }
  }
  for (const component of prompt.component_bindings || []) {
    const rootClass = component.root_class?.split(/\s+/)[0];
    const rendered = (decision.decisions || []).filter(item => item.component_slug === component.slug && String(item.class_name || '').split(/\s+/).includes(rootClass));
    if (!component.slug || !rootClass || !rendered.length) add('scene.component_binding', `组件绑定未以声明的根 class 出现在 scene.js：${component.slug || component.slot || '未声明'}`, sceneJs);
    const input = componentInputs.get(component.slug);
    if (!input || input.preview_file !== component.source || input.contract_file !== component.contract_file) add('scene.component_input', `组件绑定必须与 design_system_snapshot.component_inputs 一一对应：${component.slug || component.slot || '未声明'}`, decisions);
    const indexed = indexedComponents.get(component.slug);
    const expectedPreview = indexed?.preview;
    const expectedContract = component.slug ? `components/${component.slug}.json` : null;
    if (!indexed || component.source !== expectedPreview || component.contract_file !== expectedContract) add('scene.component_authority', `组件绑定必须使用索引登记的 Preview 与当前组件契约：${component.slug || component.slot || '未声明'}`, decisions);
    for (const relative of [component.source, component.contract_file]) {
      if (relative && !fs.existsSync(path.join(root, '.codex/skills/wego-design', relative))) add('scene.component_source', `组件绑定引用不存在的设计系统文件：${relative}`, decisions);
    }
    if (component.contract_file && fs.existsSync(path.join(root, '.codex/skills/wego-design', component.contract_file))) {
      try {
        const contract = JSON.parse(fs.readFileSync(path.join(root, '.codex/skills/wego-design', component.contract_file), 'utf8'));
        const expectedRoot = String(contract.domAnatomy?.root || '').replace(/^\./, '');
        if (expectedRoot && rootClass !== expectedRoot) add('scene.component_root', `组件绑定 root_class 必须匹配契约 domAnatomy.root：${component.slug}`, decisions);
        for (const [dimension, value] of Object.entries(component.variant_dimensions || {})) {
          const allowed = contract.variantDimensions?.[dimension];
          if (!Array.isArray(allowed) || !allowed.includes(value)) add('scene.component_variant', `组件绑定使用未登记变体：${component.slug}.${dimension}=${value}`, decisions);
        }
      } catch (error) { add('scene.component_contract', `无法读取组件契约：${error.message}`, component.contract_file); }
    }
  }
  for (const binding of prompt.token_bindings || []) {
    if (!binding.selector || !binding.content_role || !binding.css_property || !binding.token || !binding.rule_ref) add('scene.token_binding', '每个 token_bindings 项必须包含 selector、content_role、css_property、token、rule_ref', decisions);
    if (binding.selector && !`${js}\n${css}`.includes(binding.selector)) add('scene.token_binding_selector', `token_bindings.selector 未出现在场景源码：${binding.selector}`, sceneRoot);
    if (binding.selector && binding.css_property && binding.token) {
      const cssDeclaration = new RegExp(`${escapeRegex(binding.selector)}\\s*\\{[^}]*${escapeRegex(binding.css_property)}\\s*:\\s*${escapeRegex(binding.token)}\\s*[;} ]`, 's');
      const annotatedUse = js.includes(`${binding.css_property}:${binding.token}`) || js.includes(`${binding.css_property}: ${binding.token}`);
      if (!cssDeclaration.test(css) && !annotatedUse) add('scene.token_binding_application', `token_bindings 未在声明的 selector 或 data-token-binding 中实际使用：${binding.selector} ${binding.css_property}`, sceneRoot);
    }
    if (binding.token && !whitelist.has(binding.token)) add('scene.token_binding_whitelist', `token_bindings 使用未白名单 Token：${binding.token}`, decisions);
    const relative = String(binding.rule_ref || '').split('#')[0];
    if (relative && !fs.existsSync(path.join(root, '.codex/skills/wego-design', relative))) add('scene.token_rule_source', `token_bindings.rule_ref 不存在：${binding.rule_ref}`, decisions);
  }
  const interactions = prompt.interaction_contract || [];
  for (const interaction of interactions) {
    const domMarker = interaction.dom_id ? `data-dom-id="${interaction.dom_id}"` : '';
    const singleQuotedDomMarker = interaction.dom_id ? `data-dom-id='${interaction.dom_id}'` : '';
    const domOccurrences = interaction.dom_id ? (js.match(new RegExp(escapeRegex(`data-dom-id="${interaction.dom_id}"`), 'g'))?.length || 0) + (js.match(new RegExp(escapeRegex(`data-dom-id='${interaction.dom_id}'`), 'g'))?.length || 0) : 0;
    if (!interaction.dom_id || !js.includes(domMarker) && !js.includes(singleQuotedDomMarker)) add('scene.interaction_dom', `交互合同缺少 data-dom-id：${interaction.dom_id || '未声明'}`, sceneJs);
    else if (domOccurrences < 2) add('scene.interaction_handler', `交互合同未在 init 中引用触发器：${interaction.dom_id}`, sceneJs);
    if (!interaction.target || typeof interaction.target !== 'string') add('scene.interaction_target', `交互合同缺少字符串 target：${interaction.dom_id || '未声明'}`, sceneJs);
  }
  if (!prompt.state_contract || !Array.isArray(prompt.state_contract)) add('scene.state_contract', 'prompt_contract 必须包含 state_contract 数组', decisions);
  const visual = decision.generation_evidence?.visualCheck;
  const crowding = decision.generation_evidence?.crowdingCheck;
  const viewports = new Set(visual?.viewports || []);
  if (visual?.status !== 'passed' || !viewports.has(375) || !viewports.has(393) || !visual?.checked_at) add('scene.visual_check', '必须记录 375px、393px 均通过且带 checked_at 的视觉检查', decisions);
  if (crowding?.status !== 'passed' || !Array.isArray(crowding?.items) || crowding.items.length < 6) add('scene.crowding_check', '必须记录通过的六项移动端拥挤检查', decisions);
  const routeId = decision.route_id;
  if (routeId) {
    if (!new RegExp(`registerScene\\s*\\(\\s*\\{[\\s\\S]*?routeId\\s*:\\s*['\"]${escapeRegex(routeId)}['\"]`).test(js)) add('scene.registration_route', `registerScene 未使用合同 route_id：${routeId}`, sceneJs);
    if (!fs.existsSync(routes)) add('scene.routes_missing', '缺少 routes.js', routes);
    else {
      const routeSource = fs.readFileSync(routes, 'utf8');
      if (!new RegExp(`routeId\\s*:\\s*['\"]${escapeRegex(routeId)}['\"]`).test(routeSource)) add('scene.route', `routes.js 未注册 route_id：${routeId}`, routes);
      const sceneRelative = `scenes/${path.basename(sceneRoot)}`;
      for (const suffix of ['scene.js', 'scene.css']) if (!routeSource.includes(`${sceneRelative}/${suffix}`)) add('scene.route_asset', `routes.js 未声明当前场景 ${suffix}：${sceneRelative}/${suffix}`, routes);
    }
  }
}
const report = { ok: errors.length === 0, errors, warnings, metrics: { scene: path.basename(sceneRoot) } };
if (jsonOutput) console.log(JSON.stringify(report, null, 2));
else {
  if (report.ok) console.log(`场景合同通过：${path.basename(sceneRoot)}`);
  for (const item of errors) console.error(`[error] ${item.code}: ${item.message}`);
  for (const item of warnings) console.warn(`[warning] ${item.code}: ${item.message}`);
}
process.exit(report.ok ? 0 : 1);
