#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

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
  return Boolean(relative) && fs.existsSync(path.join(libraryRoot, relative));
}

if (!fs.existsSync(documentFile)) add('document.missing', '缺少设计决策原则文档');
const content = fs.existsSync(documentFile) ? fs.readFileSync(documentFile, 'utf8') : '';
const frontMatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
if (!frontMatter) add('front_matter.missing', '文档必须以 YAML front matter 开始');
else {
  const sourceLines = [...frontMatter[1].matchAll(/^\s*-\s+"([^"]+)"\s*$/gmu)].map(match => match[1]);
  if (!/^schemaVersion:\s*2\s*$/mu.test(frontMatter[1])) add('front_matter.schema', 'schemaVersion 必须为 2');
  if (!/^name:\s*".+"\s*$/mu.test(frontMatter[1]) || !/^description:\s*".+"\s*$/mu.test(frontMatter[1])) add('front_matter.identity', 'front matter 必须包含 name 和 description');
  if (!/^\s*status:\s*"user-confirmed"\s*$/mu.test(frontMatter[1])) add('front_matter.authority', '顶层原则必须标记为用户已确认');
  if (!/^\s*priority:\s*\["clarity",\s*"efficiency",\s*"consistency",\s*"aesthetics"\]\s*$/mu.test(frontMatter[1])) add('front_matter.priority', '顶层原则机器优先级必须为 clarity、efficiency、consistency、aesthetics');
  if (!sourceLines.length) add('front_matter.sources', 'authoritySources 必须声明非空机器权威来源');
  for (const source of sourceLines) if (!existsSource(source.replace('{slug}', 'metric'))) add('front_matter.source_missing', `authoritySources 指向不存在来源：${source}`);
}

const requiredSections = ['顶层原则', '输入与页面裁决', '视觉与资产', '组件消费', '状态与交互', '设计系统缺口'];
const headings = new Set([...content.matchAll(/^##\s+(.+)$/gmu)].map(match => match[1].trim()));
for (const section of requiredSections) if (!headings.has(section)) add('section.missing', `缺少必要章节：${section}`);

if (!content.includes('**清晰 > 高效 > 一致 > 美观**')) add('principle.priority', '顶层裁决顺序必须为清晰 > 高效 > 一致 > 美观');
for (const principle of ['### 清晰', '### 高效', '### 一致', '### 美观']) if (!content.includes(principle)) add('principle.missing', `缺少原则：${principle.replace('### ', '')}`);
for (const statement of ['一个首要任务', '可靠默认值', '微信生态', '错误发生后', '反向操作', '不得从组件、UI Kit、历史场景或图片补造事实和文案']) {
  if (!content.includes(statement)) add('principle.behavior', `缺少可执行原则：${statement}`);
}
if (!content.includes('`design-decisions.json` 不是设计前权威输入')) add('input.decisions_json', '必须明确 design-decisions.json 不是设计前权威输入');
if (!content.includes('先读 Preview，再读对应契约')) add('component.preview_first', '必须明确 Preview-first 组件消费顺序');

const forbidden = [
  ['`AGENTS.md`', '设计决策原则不得要求重复读取 AGENTS.md'],
  ['prompt_contract:', '设计决策原则不得重复完整 prompt_contract 模板'],
  ['token_whitelist', '设计决策原则不得重复输出合同字段'],
  ['Legacy Traceability', '设计决策原则不得保留迁移历史'],
  ['3–6', '设计决策原则不得强制组件数量'],
  ['assets/image/clothing/', '设计决策原则不得限制内容图片目录或据图编造文案'],
  ['overflow：hidden', '设计决策原则不得用 overflow:hidden 禁用页面滚动']
];
for (const [token, message] of forbidden) if (content.includes(token)) add('document.redundancy', message);

const rules = [...content.matchAll(/<!--\s*rule-id:\s*([a-z0-9-]+);\s*source-ref:\s*([^\s]+)\s*-->/g)].map(match => ({ id: match[1], source: match[2] }));
const ruleIds = new Set();
for (const rule of rules) {
  if (ruleIds.has(rule.id)) add('rule.duplicate', `rule_id 重复：${rule.id}`);
  ruleIds.add(rule.id);
  if (!existsSource(rule.source)) add('rule.source_missing', `rule_id ${rule.id} 指向不存在来源：${rule.source}`);
}
const requiredRules = [
  'wego-scene-decision-scope', 'wego-page-pattern-layout-contract', 'wego-page-edge-modes', 'wego-semantic-color-consumption',
  'wego-content-role-typography', 'no-large-color-background-app-center-svg-priority',
  'preview-first-component-consumption', 'component-visual-usage-consume-registered',
  'wego-state-interaction-contract', 'wego-design-system-gap-boundary'
];
for (const id of requiredRules) if (!ruleIds.has(id)) add('rule.required_missing', `缺少必需 rule_id：${id}`);

if (!fs.existsSync(candidateFile)) add('candidate.missing', '缺少经验候选池', candidateFile);
else {
  const candidates = JSON.parse(fs.readFileSync(candidateFile, 'utf8')).candidates || [];
  const canonicalPath = '.codex/skills/wego-design/references/design-decisions.md';
  for (const candidate of candidates) {
    const canonical = candidate.rule_ownership?.canonical;
    const landing = candidate.promotion_landing;
    const pointsToDocument = canonical?.file === canonicalPath || landing?.file === canonicalPath;
    if (canonical?.file === canonicalPath && candidate.status !== 'promoted') add('candidate.unpromoted_document', `未晋升候选不得指向设计决策原则文档：${candidate.id}`, candidateFile);
    if (pointsToDocument && candidate.status === 'promoted' && !ruleIds.has((landing || canonical).rule_id)) add('candidate.rule_missing', `已晋升候选缺少文档 rule_id：${candidate.id}`, candidateFile);
  }
}

const report = { ok: errors.length === 0, errors, warnings, metrics: { sections: headings.size, rules: rules.length } };
if (jsonOutput) console.log(JSON.stringify(report, null, 2));
else {
  if (report.ok) console.log(`设计决策原则通过：${rules.length} 条可追溯规则。`);
  for (const item of errors) console.error(`[error] ${item.code}: ${item.message}`);
}
process.exit(report.ok ? 0 : 1);
