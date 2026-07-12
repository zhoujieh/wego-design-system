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

function fileExists(relative) {
  return fs.existsSync(path.join(libraryRoot, relative));
}

function validRuleRef(ref) {
  const [relative] = String(ref).split('#');
  if (!relative || /(?:^|\/)specs(?:\/|$)|wego-ux|wego-tests/.test(relative)) return false;
  return fileExists(relative);
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
if (uiKit?.schemaVersion !== 4) fail('uikit.schema', 'uikit-plan.json 必须使用 schemaVersion 4', 'uikit-plan.json');
if (library?.schemaVersion !== 4) fail('library.schema', 'library-consumption.json 必须使用 schemaVersion 4', 'library-consumption.json');

const registered = new Set((index?.components || []).map(item => item.slug));
const allowed = new Set(uiKit?.allowedComponents || []);
for (const slug of registered) if (!allowed.has(slug)) fail('uikit.allowed_missing', `已注册组件 ${slug} 不在 allowedComponents`, 'uikit-plan.json');
for (const slug of allowed) if (!registered.has(slug)) fail('uikit.allowed_unknown', `allowedComponents 包含未注册组件 ${slug}`, 'uikit-plan.json');
const evidence = [...(uiKit?.corePreviewComponents || []), ...(uiKit?.supportEvidenceComponents || [])].map(item => item.slug);
for (const slug of registered) if (!evidence.includes(slug)) fail('uikit.evidence_missing', `已注册组件 ${slug} 未进入核心或支持组件清单`, 'uikit-plan.json');
function checkNestedAllowed(value, locator = 'uikit-plan.json') {
  if (Array.isArray(value)) return value.forEach((item, index) => checkNestedAllowed(item, `${locator}/${index}`));
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value.allowedComponents)) for (const slug of value.allowedComponents) if (!registered.has(slug) || !allowed.has(slug)) fail('uikit.pattern_component', `${locator}.allowedComponents 使用未注册或未允许组件：${slug}`, 'uikit-plan.json');
  for (const [key, child] of Object.entries(value)) if (key !== 'allowedComponents') checkNestedAllowed(child, `${locator}/${key}`);
}
checkNestedAllowed(uiKit?.pagePatterns || [], 'pagePatterns');
checkNestedAllowed(uiKit?.fallbackPageBlueprints || [], 'fallbackPageBlueprints');
for (const item of [...(uiKit?.corePreviewComponents || []), ...(uiKit?.supportEvidenceComponents || [])]) {
  if (item.evidenceFile !== `components/${item.slug}.json` || item.previewFile !== `preview/component-${item.slug}.html`) fail('uikit.evidence_source', `组件 ${item.slug} 的 UI Kit 证据路径必须使用当前契约与 Preview`, 'uikit-plan.json');
}
for (const kit of uiKit?.uiKits || []) {
  const relative = kit.qualityReport;
  if (!relative || !fileExists(relative)) {
    fail('uikit.quality_report_missing', `UI Kit ${kit.slug || '未命名'} 缺少质量报告`, relative || 'uikit-plan.json');
    continue;
  }
  const quality = json(relative);
  if (!quality) continue;
  if (quality.schemaVersion !== 4 || quality.designSystemVersion !== metadata?.version || quality.kitType !== kit.slug) fail('uikit.quality_report_schema', `${relative} 必须记录当前 schemaVersion、designSystemVersion 与 kitType`, relative);
  if (quality.designSystemParity?.status !== 'passed' || !quality.designSystemParity?.checked_at || !Array.isArray(quality.designSystemParity?.checks) || !quality.designSystemParity.checks.length) fail('uikit.quality_report_parity', `${relative} 必须记录已通过的设计系统一致性检查`, relative);
  const used = [...(quality.coreComponentsUsed || []), ...(quality.supportComponentsUsed || [])];
  for (const slug of used) if (!registered.has(slug) || !allowed.has(slug)) fail('uikit.quality_report_component', `${relative} 使用未注册或未允许组件：${slug}`, relative);
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
  const rootClass = classNamesFromSelector(contract.domAnatomy?.root)[0];
  if (!rootClass || !previewClasses.has(rootClass) || !componentClasses.has(rootClass)) fail('component.root', `${contractRelative}.domAnatomy.root 必须在 Preview 与 components.css 中存在`, contractRelative);
  for (const selector of contract.domAnatomy?.requiredChildren || []) {
    for (const className of classNamesFromSelector(selector)) {
      if (!previewClasses.has(className)) fail('component.required_child', `${contractRelative} 必需结构未出现在 Preview：${className}`, contractRelative);
    }
  }
  for (const alternative of contract.domAnatomy?.alternatives || []) {
    for (const branch of [...(alternative.allOf ? [alternative.allOf] : []), ...(alternative.oneOf || [])]) {
      for (const selector of branch) {
        for (const className of classNamesFromSelector(selector)) if (!previewClasses.has(className)) fail('component.alternative', `${contractRelative} alternatives 指向不存在的 Preview class：${className}`, contractRelative);
      }
    }
  }
  for (const selector of contract.domAnatomy?.modifierClasses || []) {
    const className = classNamesFromSelector(selector)[0];
    if (!className || !previewClasses.has(className) || !componentClasses.has(className)) fail('component.modifier', `${contractRelative} modifier 必须在 Preview 与 components.css 中存在：${selector}`, contractRelative);
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
