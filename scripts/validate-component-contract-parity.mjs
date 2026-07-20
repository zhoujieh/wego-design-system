#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(process.cwd());
const libraryRoot = path.join(root, '.codex/skills/wego-design');
const errors = [];
const warnings = [];

function fail(code, message, file = null) {
  errors.push({ code, message, file });
}

function read(relative) {
  return fs.readFileSync(path.join(libraryRoot, relative), 'utf8');
}

function json(relative) {
  try {
    return JSON.parse(read(relative));
  } catch (error) {
    fail('json.invalid', `${relative} 无法解析：${error.message}`, relative);
    return null;
  }
}

function vars(source) {
  return [...new Set([...source.matchAll(/var\(\s*(--[\w-]+)/g)].map(match => match[1]))].sort();
}

function classes(source) {
  return new Set([...source.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(match => match[1]));
}

function htmlClasses(source) {
  return new Set([...source.matchAll(/\bclass=["']([^"']+)["']/g)].flatMap(match => match[1].split(/\s+/)).filter(Boolean));
}

function markerBlock(html, relative) {
  const markerStart = '/* @component-css-start */';
  const markerEnd = '/* @component-css-end */';
  const start = html.indexOf(markerStart);
  const end = html.indexOf(markerEnd);
  if (start < 0 || end <= start || html.indexOf(markerStart, start + markerStart.length) >= 0 || html.indexOf(markerEnd, end + markerEnd.length) >= 0) {
    fail('preview.marker', `${relative} 必须且只能有一对组件 CSS marker`, relative);
    return '';
  }
  return html.slice(start + markerStart.length, end);
}

function classNamesFromSelector(value) {
  return [...String(value || '').matchAll(/\.([A-Za-z_][\w-]*)/g)].map(match => match[1]);
}

function attributeSelectorEvidence(selector, css) {
  const match = String(selector || '').match(/^\[([:\w-]+)(?:=(["'])(.*?)\2)?\]$/);
  if (!match) return false;
  const name = match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (match[2]) {
    const expected = match[3].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\[\\s*${name}\\s*=\\s*["']${expected}["']\\s*\\]`).test(css);
  }
  return new RegExp(`\\[\\s*${name}(?:\\s*=|\\s*\\])`).test(css)
    || (match[1] === 'disabled' && /:disabled\b/.test(css));
}

function selectorsFromAlternativeBranch(branch) {
  if (Array.isArray(branch)) return branch;
  return branch && typeof branch === 'object' && Array.isArray(branch.allOf) ? branch.allOf : [];
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

const variantConstraintFields = ['rootAllOf', 'rootOneOf', 'rootNoneOf', 'descendantAllOf', 'descendantOneOf', 'descendantNoneOf'];

function fileExists(relative) {
  return fs.existsSync(path.join(libraryRoot, relative));
}

function validRuleRef(ref) {
  const [relative] = String(ref).split('#');
  if (!relative || /(?:^|\/)specs(?:\/|$)|wego-ux|wego-tests/.test(relative)) return false;
  return fileExists(relative);
}

function textNodesByClass(html, className) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...html.matchAll(new RegExp(`<[^>]+class=["'][^"']*\\b${escaped}\\b[^"']*["'][^>]*>([^<]*)<\\/`, 'g'))].map(match => match[1].trim());
}

const tokenCss = fs.readFileSync(path.join(libraryRoot, 'colors_and_type.css'), 'utf8');
const declaredTokens = new Set([...tokenCss.matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1]));
const extraction = spawnSync(process.execPath, ['.codex/skills/wego-design/scripts/extract-components-css.mjs', '.codex/skills/wego-design', '--check'], { cwd: root, encoding: 'utf8' });
if (extraction.status !== 0) fail('components.css_stale', 'components.css 未由当前 Preview 提取；请先运行提取脚本', 'components.css');
const componentCss = fs.readFileSync(path.join(libraryRoot, 'components.css'), 'utf8');
const componentClasses = classes(componentCss);
const index = json('components/index.json');
const uiKit = json('uikit-plan.json');
const library = json('library-consumption.json');
const metadata = json('metadata.json');

if (index?.schemaVersion !== 4 || index?.componentContractSchemaVersion !== 4) {
  fail('index.schema', 'components/index.json 必须使用 schemaVersion 4 与 componentContractSchemaVersion 4', 'components/index.json');
}
if (Object.hasOwn(index || {}, 'uiKits')) fail('index.duplicate_uikits', 'components/index.json 不得重复维护 UI Kit；唯一来源是 uikit-plan.json', 'components/index.json');
if (uiKit?.schemaVersion !== 5 || !Array.isArray(uiKit?.pagePatterns)) fail('uikit.schema', 'uikit-plan.json 必须使用 schemaVersion 5 且包含 pagePatterns', 'uikit-plan.json');
if (library?.schemaVersion !== 5) fail('library.schema', 'library-consumption.json 必须使用 schemaVersion 5', 'library-consumption.json');

const registered = new Set((index?.components || []).map(item => item.slug));
const patternIds = new Set();
for (const pattern of uiKit?.pagePatterns || []) {
  if (!pattern?.id || patternIds.has(pattern.id)) fail('uikit.pattern_id', `页面范式 id 缺失或重复：${pattern?.id || '未声明'}`, 'uikit-plan.json');
  patternIds.add(pattern.id);
  if (!Array.isArray(pattern.componentCandidates) || !pattern.componentCandidates.length) fail('uikit.pattern_candidates', `页面范式 ${pattern.id} 必须声明非空 componentCandidates`, 'uikit-plan.json');
  for (const slug of pattern.componentCandidates || []) if (!registered.has(slug)) fail('uikit.pattern_component', `页面范式 ${pattern.id} 使用未注册组件：${slug}`, 'uikit-plan.json');
  for (const field of ['entry', 'qualityReport']) if (!pattern.uiKit?.[field] || !fileExists(pattern.uiKit[field])) fail('uikit.pattern_asset', `页面范式 ${pattern.id} 缺少有效 UI Kit ${field}`, pattern.uiKit?.[field] || 'uikit-plan.json');
  if (!pattern.presentation || !['type', 'transition', 'dismissAction', 'overlayLevel'].every(field => typeof pattern.presentation[field] === 'string' && pattern.presentation[field]) || typeof pattern.presentation.coversTabBar !== 'boolean') fail('uikit.pattern_presentation', `页面范式 ${pattern.id} 缺少完整 presentation`, 'uikit-plan.json');
}
for (const pattern of uiKit?.pagePatterns || []) {
  const relative = pattern.uiKit?.qualityReport;
  if (!relative || !fileExists(relative)) {
    fail('uikit.quality_report_missing', `页面范式 ${pattern.id || '未命名'} 缺少质量报告`, relative || 'uikit-plan.json');
    continue;
  }
  const quality = json(relative);
  if (!quality) continue;
  if (quality.schemaVersion !== 4 || !Number.isInteger(quality.designSystemVersion) || quality.designSystemVersion < 1 || quality.kitType !== pattern.id) fail('uikit.quality_report_schema', `${relative} 必须记录 schemaVersion、designSystemVersion（正整数）与 kitType`, relative);
  if (quality.designSystemParity?.status !== 'passed' || !quality.designSystemParity?.checked_at || !Array.isArray(quality.designSystemParity?.checks) || !quality.designSystemParity.checks.length) fail('uikit.quality_report_parity', `${relative} 必须记录已通过的设计系统一致性检查`, relative);
  const used = [...(quality.coreComponentsUsed || []), ...(quality.supportComponentsUsed || [])];
  for (const slug of used) if (!registered.has(slug)) fail('uikit.quality_report_component', `${relative} 使用未注册组件：${slug}`, relative);
  if (!Array.isArray(quality.inventedComponents) || quality.inventedComponents.length) fail('uikit.quality_report_invented', `${relative} 不得记录自造组件`, relative);
  if (!quality.qualityGates || !Object.keys(quality.qualityGates).length) fail('uikit.quality_gate_missing', `${relative} 必须至少声明一个质量门禁`, relative);
  for (const [gate, result] of Object.entries(quality.qualityGates || {})) {
    if (result?.checked !== true || !Array.isArray(result?.violations) || result.violations.length) fail('uikit.quality_gate', `${relative} 的质量门禁未通过：${gate}`, relative);
  }
  if (JSON.stringify(quality).match(/(?:^|["/])specs\/(?:[^"\s]+)|wego-ux(?!system-iterate)|wego-tests/)) fail('uikit.quality_report_legacy', `${relative} 不得引用已删除规则或技能`, relative);
}

for (const item of index?.components || []) {
  const slug = item.slug;
  const contractRelative = `components/${slug}.json`;
  const previewRelative = item.preview;
  if (!fileExists(contractRelative)) {
    fail('component.contract_missing', `缺少 ${contractRelative}`, contractRelative);
    continue;
  }
  if (!fileExists(previewRelative)) {
    fail('component.preview_missing', `缺少 ${previewRelative}`, previewRelative);
    continue;
  }
  const contract = json(contractRelative);
  if (!contract) continue;
  if (contract.schemaVersion !== 4 || contract.slug !== slug) fail('component.schema', `${contractRelative} 必须使用 schemaVersion 4 且 slug 与索引一致`, contractRelative);
  if (['tokensConsumed', 'specRefs', 'cssCustomProperties', 'designTokens'].some(field => Object.hasOwn(contract, field))) fail('component.legacy_field', `${contractRelative} 不得保留重复 Token、生成规则或隐式业务覆盖字段`, contractRelative);
  if (JSON.stringify(contract).includes('specs/') || /wego-ux(?!system-iterate)|wego-tests/.test(JSON.stringify(contract))) {
    fail('component.legacy_reference', `${contractRelative} 不得引用 specs、wego-ux 或 wego-tests`, contractRelative);
  }
  if (!Array.isArray(contract.ruleRefs) || !contract.ruleRefs.length || contract.ruleRefs.some(ref => !validRuleRef(ref))) {
    fail('component.rule_refs', `${contractRelative}.ruleRefs 必须全部指向现存权威来源，且不得指向 specs 或旧技能`, contractRelative);
  }
  if (contract.provenance?.preview !== previewRelative || contract.provenance?.cssSource !== previewRelative) {
    fail('component.provenance', `${contractRelative}.provenance 必须指向索引中的 Preview`, contractRelative);
  }
  for (const source of contract.provenance?.externalSources || []) {
    if (!source?.name || (!source.url && !source.version && !source.sourceFile)) fail('component.external_source', `${contractRelative} 的 externalSources 必须有名称和 URL、版本或 sourceFile`, contractRelative);
    if (source.sourceFile && !fs.existsSync(path.join(root, source.sourceFile))) fail('component.external_source_missing', `${contractRelative} 的 sourceFile 不存在：${source.sourceFile}`, contractRelative);
  }
  const preview = read(previewRelative);
  const block = markerBlock(preview, previewRelative);
  const usedTokens = vars(block);
  const runtimeTokens = usedTokens.filter(token => declaredTokens.has(token));
  const localTokens = usedTokens.filter(token => !declaredTokens.has(token));
  const previewOnlyTokens = vars(preview).filter(token => !runtimeTokens.includes(token) && !localTokens.includes(token));
  const actualRuntime = [...new Set(contract.runtimeTokens || [])].sort();
  const actualLocal = [...new Set(contract.localTokens || [])].sort();
  const actualPreviewOnly = [...new Set(contract.previewOnlyTokens || [])].sort();
  if (JSON.stringify(actualRuntime) !== JSON.stringify(runtimeTokens)) fail('component.runtime_tokens', `${contractRelative}.runtimeTokens 与 Preview 组件 CSS 不一致`, contractRelative);
  if (JSON.stringify(actualLocal) !== JSON.stringify(localTokens)) fail('component.local_tokens', `${contractRelative}.localTokens 与 Preview 组件 CSS 不一致`, contractRelative);
  if (JSON.stringify(actualPreviewOnly) !== JSON.stringify(previewOnlyTokens)) fail('component.preview_tokens', `${contractRelative}.previewOnlyTokens 与 Preview 展示范围不一致`, contractRelative);
  for (const token of runtimeTokens) if (!declaredTokens.has(token)) fail('component.token_unknown', `${contractRelative} 使用未声明 Token：${token}`, contractRelative);
  for (const token of localTokens) if (!new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`).test(block)) fail('component.local_token_missing', `${contractRelative} 的 localToken 未在组件 CSS 中定义：${token}`, contractRelative);
  const previewClasses = new Set([...classes(preview), ...classes(block), ...htmlClasses(preview)]);
  if (!Array.isArray(contract.anatomy) || !contract.anatomy.length) fail('component.anatomy_missing', `${contractRelative} 必须保留有语义角色的 anatomy`, contractRelative);
  for (const anatomy of contract.anatomy || []) {
    for (const className of classNamesFromSelector(anatomy.selector)) if (!previewClasses.has(className)) fail('component.anatomy', `${contractRelative}.anatomy 指向不存在的 Preview class：${className}`, contractRelative);
  }
  const rootClasses = classNamesFromSelector(contract.domAnatomy?.root);
  if (!rootClasses.length) fail('component.root', `${contractRelative}.domAnatomy.root 必须声明至少一个根 class`, contractRelative);
  for (const rootClass of rootClasses) {
    if (!previewClasses.has(rootClass) || !componentClasses.has(rootClass)) fail('component.root', `${contractRelative}.domAnatomy.root 必须全部在 Preview 与 components.css 中存在：${rootClass}`, contractRelative);
  }
  for (const selector of contract.domAnatomy?.requiredChildren || []) {
    for (const className of classNamesFromSelector(selector)) {
      if (!previewClasses.has(className)) fail('component.required_child', `${contractRelative} 必需结构未出现在 Preview：${className}`, contractRelative);
    }
  }
  for (const selector of [contract.domAnatomy?.repeatingChild, ...(contract.domAnatomy?.bodyChildren || []), ...(contract.domAnatomy?.itemChildren || [])].filter(Boolean)) {
    for (const className of classNamesFromSelector(selector)) {
      if (!previewClasses.has(className)) fail('component.nested_anatomy', `${contractRelative} 嵌套结构未出现在 Preview：${className}`, contractRelative);
    }
  }
  for (const alternative of contract.domAnatomy?.alternatives || []) {
    const branches = [...(alternative.allOf ? [alternative.allOf] : []), ...(alternative.oneOf || [])];
    const conditional = (alternative.oneOf || []).filter(branch => branch && typeof branch === 'object' && !Array.isArray(branch));
    if (conditional.length && conditional.length !== (alternative.oneOf || []).length) fail('component.alternative_shape', `${contractRelative} alternatives.oneOf 不得混用条件分支与数组分支`, contractRelative);
    const conditions = new Set();
    for (const branch of conditional) {
      if (!branch.when || typeof branch.when !== 'object' || Array.isArray(branch.when) || !Object.keys(branch.when).length || !Array.isArray(branch.allOf) || !branch.allOf.length) {
        fail('component.alternative_shape', `${contractRelative} 条件分支必须包含非空 when 与 allOf`, contractRelative);
        continue;
      }
      const conditionKey = JSON.stringify(branch.when);
      if (conditions.has(conditionKey)) fail('component.alternative_condition', `${contractRelative} alternatives.oneOf 条件不得重复：${conditionKey}`, contractRelative);
      conditions.add(conditionKey);
      for (const [dimension, value] of Object.entries(branch.when)) {
        if (!Array.isArray(contract.variantDimensions?.[dimension]) || !contract.variantDimensions[dimension].includes(value)) fail('component.alternative_condition', `${contractRelative} 条件分支引用非法变体：${dimension}=${value}`, contractRelative);
      }
    }
    for (const branch of branches) {
      for (const selector of selectorsFromAlternativeBranch(branch)) {
        for (const className of classNamesFromSelector(selector)) if (!previewClasses.has(className)) fail('component.alternative', `${contractRelative} alternatives 指向不存在的 Preview class：${className}`, contractRelative);
      }
    }
  }
  const variantRules = contract.domAnatomy?.variantRules;
  if (variantRules !== undefined && !isPlainObject(variantRules)) fail('component.variant_rules_shape', `${contractRelative}.domAnatomy.variantRules 必须是对象`, contractRelative);
  for (const [dimension, rule] of Object.entries(isPlainObject(variantRules) ? variantRules : {})) {
    const allowedValues = contract.variantDimensions?.[dimension];
    if (!Array.isArray(allowedValues) || !allowedValues.length) {
      fail('component.variant_rules_dimension', `${contractRelative}.domAnatomy.variantRules 引用未登记维度：${dimension}`, contractRelative);
      continue;
    }
    if (!isPlainObject(rule) || typeof rule.required !== 'boolean' || typeof rule.exclusive !== 'boolean' || !isPlainObject(rule.values)) {
      fail('component.variant_rules_shape', `${contractRelative}.domAnatomy.variantRules.${dimension} 必须声明 required、exclusive 和 values`, contractRelative);
      continue;
    }
    const unexpectedRuleFields = Object.keys(rule).filter(field => !['required', 'exclusive', 'values'].includes(field));
    if (unexpectedRuleFields.length) fail('component.variant_rules_shape', `${contractRelative}.${dimension} 含未知规则字段：${unexpectedRuleFields.join('、')}`, contractRelative);
    const mappedValues = Object.keys(rule.values);
    const missingValues = allowedValues.filter(value => !mappedValues.includes(value));
    const unknownValues = mappedValues.filter(value => !allowedValues.includes(value));
    if (missingValues.length || unknownValues.length) fail('component.variant_rules_values', `${contractRelative}.${dimension} 的 DOM 规则必须精确覆盖正式值${missingValues.length ? `；缺少：${missingValues.join('、')}` : ''}${unknownValues.length ? `；未知：${unknownValues.join('、')}` : ''}`, contractRelative);
    for (const [value, constraints] of Object.entries(rule.values)) {
      if (!isPlainObject(constraints) || !Object.keys(constraints).length) {
        fail('component.variant_rules_shape', `${contractRelative}.${dimension}.${value} 必须声明非空 DOM 约束`, contractRelative);
        continue;
      }
      const unexpectedConstraints = Object.keys(constraints).filter(field => !variantConstraintFields.includes(field));
      if (unexpectedConstraints.length) fail('component.variant_rules_shape', `${contractRelative}.${dimension}.${value} 含未知约束：${unexpectedConstraints.join('、')}`, contractRelative);
      for (const field of variantConstraintFields) {
        if (!Object.hasOwn(constraints, field)) continue;
        const selectors = constraints[field];
        if (!Array.isArray(selectors) || !selectors.length || selectors.some(selector => typeof selector !== 'string' || !selector.trim()) || new Set(selectors).size !== selectors.length) {
          fail('component.variant_rules_shape', `${contractRelative}.${dimension}.${value}.${field} 必须是非空、去重的 selector 数组`, contractRelative);
          continue;
        }
        for (const selector of selectors) {
          const classNames = classNamesFromSelector(selector);
          const classEvidence = classNames.length && classNames.every(className => previewClasses.has(className) && componentClasses.has(className));
          const attributeEvidence = attributeSelectorEvidence(selector, block);
          if (!classEvidence && !attributeEvidence) fail('component.variant_rules_selector', `${contractRelative}.${dimension}.${value}.${field} 指向无 Preview/CSS 证据的 selector：${selector}`, contractRelative);
        }
      }
      if (rule.exclusive && !['rootAllOf', 'rootOneOf', 'descendantAllOf', 'descendantOneOf'].some(field => Array.isArray(constraints[field]) && constraints[field].length)) {
        fail('component.variant_rules_exclusive', `${contractRelative}.${dimension}.${value} 开启 exclusive 时必须有正向 DOM 证据`, contractRelative);
      }
    }
  }
  for (const selector of contract.domAnatomy?.modifierClasses || []) {
    const className = classNamesFromSelector(selector)[0];
    if (!className || !previewClasses.has(className) || !componentClasses.has(className)) fail('component.modifier', `${contractRelative} modifier 必须在 Preview 与 components.css 中存在：${selector}`, contractRelative);
  }
  if (slug === 'metric') {
    const numeric = contract.domAnatomy?.numericStructure;
    const expected = {
      integer: '.metric__integer',
      decimal: '.metric__decimal',
      symbol: '.metric__symbol',
      unit: '.metric__unit'
    };
    for (const [key, selector] of Object.entries(expected)) {
      if (numeric?.[key]?.selector !== selector) fail('metric.numeric_structure', `${contractRelative}.domAnatomy.numericStructure.${key} 必须指向 ${selector}`, contractRelative);
    }
    if (numeric?.integer?.required !== true || !numeric?.decimal?.requiredWhen) fail('metric.numeric_requirement', `${contractRelative} 必须声明 integer 必需且 decimal 按小数位条件出现`, contractRelative);
    const invalidIntegers = textNodesByClass(preview, 'metric__integer').filter(value => /[.。]/.test(value));
    if (invalidIntegers.length) fail('metric.integer_decimal_mixed', `${previewRelative} 的 metric__integer 不得包含小数：${invalidIntegers.join(', ')}`, previewRelative);
    if (!textNodesByClass(preview, 'metric__decimal').some(value => /^\.\d+$/.test(value))) fail('metric.decimal_example', `${previewRelative} 必须展示独立的小数节点`, previewRelative);
  }
}

for (const relative of ['library-consumption.json', 'uikit-plan.json', 'components/index.json']) {
  const content = read(relative);
  if (/(?:^|["/])specs\/(?:[^"\s]+)|wego-ux(?!system-iterate)|wego-tests/.test(content)) fail('library.legacy_reference', `${relative} 不得引用 specs 路径或旧技能`, relative);
}

const previewIndex = read('preview/index.html');
for (const slug of registered) if (!previewIndex.includes(`data-slug="${slug}"`)) warnings.push({ code: 'preview.index_missing', message: `preview/index.html 未列出 ${slug}`, file: 'preview/index.html' });

const report = { ok: errors.length === 0, errors, warnings, metrics: { registeredComponents: registered.size, declaredTokens: declaredTokens.size } };
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else {
  if (report.ok) console.log(`组件契约一致性通过：${registered.size} 个组件，${declaredTokens.size} 个 Token。`);
  for (const item of errors) console.error(`[error] ${item.code}: ${item.message}${item.file ? ` (${item.file})` : ''}`);
  for (const item of warnings) console.warn(`[warning] ${item.code}: ${item.message}`);
}
process.exit(report.ok ? 0 : 1);
