#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { promptContractTemplateFields } from './prompt-contract-schema.mjs';

const root = process.cwd();
const libraryRoot = path.join(root, '.codex/skills/wego-design');
const defaultDocument = path.join(libraryRoot, 'references/design-decisions.md');
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const fileFlag = args.indexOf('--file');
const documentFile = fileFlag >= 0 ? path.resolve(root, args[fileFlag + 1] || '') : defaultDocument;
const candidatesFlag = args.indexOf('--candidates');
const candidateFile = candidatesFlag >= 0 ? path.resolve(root, args[candidatesFlag + 1] || '') : path.join(root, '.codex/skills/wego-uxsystem-iterate/experience/candidates.json');
const errors = [];
const warnings = [];

function add(code, message, file = documentFile) { errors.push({ code, message, file: path.relative(root, file).replaceAll(path.sep, '/') }); }
function existsSource(ref) {
  const relative = String(ref).split('#')[0];
  if (!relative) return false;
  const target = relative === 'AGENTS.md' ? path.join(root, relative) : path.join(libraryRoot, relative);
  return fs.existsSync(target);
}

if (!fs.existsSync(documentFile)) add('document.missing', '缺少设计决策方法文档');
const content = fs.existsSync(documentFile) ? fs.readFileSync(documentFile, 'utf8') : '';
const frontMatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
if (!frontMatter) add('front_matter.missing', '文档必须以 YAML front matter 开始');
else {
  const sourceLines = [...frontMatter[1].matchAll(/^\s*-\s+"([^"]+)"\s*$/gmu)].map(match => match[1]);
  if (!/^schemaVersion:\s*1\s*$/mu.test(frontMatter[1])) add('front_matter.schema', 'schemaVersion 必须为 1');
  if (!/^name:\s*".+"\s*$/mu.test(frontMatter[1]) || !/^description:\s*".+"\s*$/mu.test(frontMatter[1])) add('front_matter.identity', 'front matter 必须包含 name 和 description');
  if (!sourceLines.length) add('front_matter.sources', 'authoritySources 必须声明非空权威来源');
  for (const source of sourceLines) if (!existsSource(source.replace('{slug}', 'metric'))) add('front_matter.source_missing', `authoritySources 指向不存在来源：${source}`);
}

const expectedHeadings = ['Overview', 'Colors', 'Typography', 'Layout', 'Elevation & Depth', 'Shapes', 'Components', "Do's and Don'ts", 'State & Interaction', 'Exceptions & DDR', 'Legacy Traceability'];
const headings = [...content.matchAll(/^##\s+(.+)$/gmu)].map(match => match[1].trim());
for (let index = 0; index < expectedHeadings.length; index += 1) {
  if (headings[index] !== expectedHeadings[index]) add('section.order', `第 ${index + 1} 个二级标题必须为 ${expectedHeadings[index]}`);
}
if (headings.length !== expectedHeadings.length) add('section.count', '设计决策方法不得增加未受守卫的二级章节');

const requiredReadSequence = [
  '`AGENTS.md`',
  '`prototype_brief`',
  '`library-consumption.json`',
  '`uikit-plan.json`',
  '`components/index.json`',
  '本页命中组件 Preview',
  '同一组件契约',
  '`colors_and_type.css`',
  '`references/scene-contract.md`'
];
for (const token of requiredReadSequence) if (!content.includes(token)) add('read_order.missing', `设计决策方法缺少必需读取顺序项：${token}`);
if (!content.includes('`design-decisions.json` 不是设计前权威输入')) add('read_order.decisions_json', '设计决策方法必须明确 design-decisions.json 不是设计前权威输入');

const rules = [...content.matchAll(/<!--\s*rule-id:\s*([a-z0-9-]+);\s*source-ref:\s*([^\s]+)\s*-->/g)].map(match => ({ id: match[1], source: match[2] }));
const ruleIds = new Set();
for (const rule of rules) {
  if (ruleIds.has(rule.id)) add('rule.duplicate', `rule_id 重复：${rule.id}`);
  ruleIds.add(rule.id);
  if (!existsSource(rule.source)) add('rule.source_missing', `rule_id ${rule.id} 指向不存在来源：${rule.source}`);
}
const requiredRules = [
  'wego-scene-decision-scope', 'prototype-brief-required', 'wego-semantic-color-consumption',
  'design-decisions-css-token-binding-precision', 'preview-first-component-consumption',
  'component-visual-usage-consume-registered', 'metric-structured-number-rendering',
  'prompt-contract-current-schema', 'wego-state-interaction-contract', 'wego-ddr-boundary'
];
for (const id of requiredRules) if (!ruleIds.has(id)) add('rule.required_missing', `缺少必需 rule_id：${id}`);
const schemaBlock = content.match(/<!--\s*rule-id:\s*prompt-contract-current-schema;\s*source-ref:\s*references\/scene-contract\.md\s*-->[\s\S]*?```yaml\n([\s\S]*?)```/u)?.[1] || '';
if (!schemaBlock) add('prompt_contract.template_missing', '缺少带 rule_id 的完整 prompt_contract 标准模板');
else {
  for (const field of promptContractTemplateFields) if (!schemaBlock.includes(field)) add('prompt_contract.template_field', `标准模板缺少字段：${field}`);
}
for (const legacy of ['输入与失败条件', 'Preview-first 选择过程', 'prompt_contract', '页面、状态与交互', '视觉约束', 'DDR']) if (!content.includes(legacy)) add('legacy.traceability', `遗留追溯表缺少：${legacy}`);

if (!fs.existsSync(candidateFile)) add('candidate.missing', '缺少经验候选池', candidateFile);
else {
  const candidates = JSON.parse(fs.readFileSync(candidateFile, 'utf8')).candidates || [];
  const canonicalPath = '.codex/skills/wego-design/references/design-decisions.md';
  for (const candidate of candidates) {
    const canonical = candidate.rule_ownership?.canonical;
    const landing = candidate.promotion_landing;
    const pointsToDocument = canonical?.file === canonicalPath || landing?.file === canonicalPath;
    if (canonical?.file === canonicalPath && candidate.status !== 'promoted') add('candidate.unpromoted_document', `未晋升候选不得指向设计决策文档：${candidate.id}`, candidateFile);
    if (pointsToDocument && candidate.status === 'promoted' && !ruleIds.has((landing || canonical).rule_id)) add('candidate.rule_missing', `已晋升候选缺少文档 rule_id：${candidate.id}`, candidateFile);
  }
}

const report = { ok: errors.length === 0, errors, warnings, metrics: { headings: headings.length, rules: rules.length } };
if (jsonOutput) console.log(JSON.stringify(report, null, 2));
else {
  if (report.ok) console.log(`设计决策方法通过：${rules.length} 条规则。`);
  for (const item of errors) console.error(`[error] ${item.code}: ${item.message}`);
}
process.exit(report.ok ? 0 : 1);
