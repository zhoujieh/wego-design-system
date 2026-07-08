#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const VERSION = '3';
const ROOT = path.resolve(process.env.WEGO_REPO_ROOT || process.cwd());
const OUT = path.join(ROOT, '.codex/skills/wego-design/specs');
const CMD = process.argv[2];
const JSON_OUT = process.argv.includes('--json');
const NOTICE = '本文档由系统规则自动生成，用于人工检查。请勿直接修改；如需调整规则，应修改对应权威来源后重新生成。';
const FILES = [
  '工作流总览与优先级.md', '需求理解规则.md', '页面设计规则.md', '组件与UI-Kit使用规则.md',
  '原型实现规则.md', '验收与回归规则.md', '工作流迭代与经验沉淀规则.md',
];

const text = rel => {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`缺少规则来源：${rel}`);
  return fs.readFileSync(file, 'utf8');
};
const json = rel => {
  try { return JSON.parse(text(rel)); }
  catch (error) { throw new Error(`${rel} JSON 解析失败：${error.message}`); }
};
const blobSha = value => {
  const body = Buffer.from(value);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${body.length}\0`)).update(body).digest('hex');
};

function sources() {
  const index = json('.codex/skills/wego-design/components/index.json');
  const components = (index.components || []).map(({ slug }) => `.codex/skills/wego-design/components/${slug}.json`);
  return [
    'AGENTS.md', 'README.md', '.codex/skills/README.md',
    '.codex/skills/wego-product/SKILL.md', '.codex/skills/wego-product/SKILL.runtime.md',
    '.codex/skills/wego-design/SKILL.md', '.codex/skills/wego-design/SKILL.runtime.md',
    '.codex/skills/wego-design/README.md', '.codex/skills/wego-design/library-consumption.json',
    '.codex/skills/wego-design/uikit-plan.json', '.codex/skills/wego-design/components/index.json', ...components,
    '.codex/skills/wego-ux/SKILL.md', '.codex/skills/wego-ux/SKILL.runtime.md',
    '.codex/skills/wego-tests/SKILL.md', '.codex/skills/wego-tests/SKILL.runtime.md',
    '.codex/skills/wego-uxsystem-iterate/SKILL.md',
    '.codex/skills/wego-uxsystem-iterate/references/workflow.md',
    '.codex/skills/wego-uxsystem-iterate/references/judgment-principles.md',
    '.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md',
    '.codex/skills/wego-uxsystem-iterate/references/sync-matrix.md',
    '.codex/skills/wego-uxsystem-iterate/references/sync-matrix.runtime.md',
    '.codex/skills/wego-uxsystem-iterate/experience/README.md',
    'scripts/validate-wego-design.mjs', 'scripts/validate-wego-design-core.mjs',
  ].sort();
}

function manifestFingerprint(manifest) {
  return crypto.createHash('sha256').update([`generator:${VERSION}`, ...manifest].join('\n')).digest('hex');
}

function fingerprint() {
  const manifest = sources().map(rel => `${rel}:${blobSha(text(rel))}`);
  return { value: manifestFingerprint(manifest), count: manifest.length };
}

const bullets = items => items.map(item => `- ${item}`).join('\n');
const section = (title, body) => `## ${title}\n\n${body}\n`;
const doc = (title, body, fp) => `# ${title}\n\n${NOTICE}\n\n${body.trim()}\n\n<!-- generated-by: scripts/specs.mjs@${VERSION} -->\n<!-- source-fingerprint: ${fp} -->\n`;

function sourceSection(rel, heading) {
  const value = text(rel);
  const marker = `## ${heading}`;
  const start = value.indexOf(marker);
  if (start < 0) return '';
  const rest = value.slice(start + marker.length).replace(/^\s+/, '');
  const next = rest.search(/^## /m);
  return (next >= 0 ? rest.slice(0, next) : rest).trim();
}

function mappedRules(rel, heading, mappings) {
  const lines = sourceSection(rel, heading).split('\n')
    .filter(line => line.startsWith('- '))
    .map(line => line.slice(2).trim());
  const outputs = [];
  const unmatched = [];
  for (const line of lines) {
    const mapping = mappings.find(item => item.match.test(line));
    if (!mapping) unmatched.push(line);
    else if (!outputs.includes(mapping.output)) outputs.push(mapping.output);
  }
  if (unmatched.length > 0) throw new Error(`${rel} 的“${heading}”出现未映射规则：${unmatched.join('；')}`);
  return outputs;
}

function render() {
  const index = json('.codex/skills/wego-design/components/index.json');
  const plan = json('.codex/skills/wego-design/uikit-plan.json');
  const consumption = json('.codex/skills/wego-design/library-consumption.json');
  const { value: fp, count } = fingerprint();
  const componentNames = (index.components || []).map(item => item.name).join('、') || '暂无';
  const kitNames = (plan.uiKits || []).map(item => ({
    'biz-rule-config': '业务规则配置',
    'system-settings': '系统设置',
  }[item.slug] || item.slug)).join('、') || '暂无';
  const typeNames = (consumption.scenarioTypeRegistry?.types || []).map(item => item.name).join('、') || '暂无';

  const productRules = mappedRules('.codex/skills/wego-product/SKILL.md', '本轮覆盖规则', [
    { match: /自动生成.*不是运行时规则来源/, output: '只根据用户需求和正式工作流规则理解任务，自动生成的检查文档不能补充或改变需求。' },
    { match: /忽略.*旧说明/, output: '历史兼容规则与当前入口冲突时，以当前入口为准。' },
    { match: /不再输出.*spec_refs/, output: '需求规格只记录真实判断依据，不引用自动生成文档。' },
    { match: /information_blocks.*只能来自/, output: '页面信息、状态、异常流程和宿主路径必须来自用户需求与结构化判断，不能凭惯例发明。' },
    { match: /需求未确认前/, output: '关键需求未确认前不进入页面设计；确认后先落盘需求规格再交接。' },
  ]);
  const designRules = mappedRules('.codex/skills/wego-design/SKILL.md', '本轮覆盖规则', [
    { match: /不得在运行时读取/, output: '设计判断只使用已确认需求、正式页面范式、设计令牌、组件契约和真实示例。' },
    { match: /忽略.*旧规范/, output: '历史规则与当前入口冲突时，以当前入口为准。' },
    { match: /设计决策只能来自/, output: '先确认页面职责和结构，再选择现有页面范式、组件与组合方式。' },
    { match: /rule_sources_used/, output: '每个关键设计决定都要记录真实依据，方便实现和验收追溯。' },
    { match: /无法追溯时标记为.*gap/, output: '找不到可靠依据时必须标记设计缺口，不能把判断甩给实现阶段。' },
  ]);
  const uxRules = mappedRules('.codex/skills/wego-ux/SKILL.md', '本轮覆盖规则', [
    { match: /只用于人工检查/, output: '实现只执行已确认的需求规格和设计计划，不从自动生成文档重新做设计判断。' },
    { match: /忽略.*旧说明/, output: '历史兼容规则与当前入口冲突时，以当前入口为准。' },
    { match: /实现依据固定为/, output: '实现前必须确认需求规格、设计计划和实际规则依据都已齐全。' },
    { match: /不得因为生成文档/, output: '不能用通俗摘要覆盖组件契约、页面范式或设计计划中的明确决定。' },
    { match: /必须回退到对应上游技能/, output: '发现规格缺失、冲突或无法追溯时，回到产生问题的上游环节修正，不能在实现阶段自行补规则。' },
  ]);
  const testRules = mappedRules('.codex/skills/wego-tests/SKILL.md', '本轮覆盖规则', [
    { match: /不得作为验收依据/, output: '验收只比较已确认需求、设计计划、正式规则依据和当前实现。' },
    { match: /忽略.*旧规范路径/, output: '历史验收规则与当前入口冲突时，以当前入口为准。' },
    { match: /验收依据固定为/, output: '需求、设计、路由、交互状态和自动化守门必须一起检查，不能只看其中一层。' },
    { match: /rule_source_check/, output: '每个关键设计和实现决定都要能追溯到正式规则来源。' },
    { match: /最早产生错误的工作流环节/, output: '问题必须归因到最早做错决定的环节，不能只看最后改了哪个文件。' },
  ]);
  const experienceRules = mappedRules('.codex/skills/wego-uxsystem-iterate/SKILL.md', '经验候选硬门禁', [
    { match: /不能自动进入经验池/, output: '普通反馈、自查和验收失败只用于修复当前任务，不会自动沉淀经验。' },
    { match: /每轮最多选择一条/, output: '一次审查最多记录一条最重要、最可复用的经验。' },
    { match: /入池前必须确认/, output: '记录前必须明确问题最早产生的位置、规则归属、未来落点、消费方和验收方式。' },
    { match: /归属不明确/, output: '归属不明确时不得进入候选池。' },
    { match: /同类经验复用/, output: '同类经验只累计次数和场景证据，不重复创建。' },
    { match: /第三次出现/, output: '同类经验第 3 次出现时只进入等待确认状态，并询问用户是否升级。' },
    { match: /未明确确认前/, output: '用户未确认前不得修改正式规则，也不得登记正式场景类型。' },
    { match: /正式沉淀前必须拆分/, output: '正式升级前必须写清适用、不适用、例外和回退条件，并优先并入已有规则。' },
    { match: /只保存成熟/, output: '正式场景注册表只保存成熟、经过验证且会被实际消费的规则类型。' },
  ]);

  const docs = {};
  docs[FILES[0]] = doc('工作流总览与优先级', [
    section('什么时候使用', '任何新页面、新场景或业务修改，都先判断任务属于需求理解、页面设计、原型实现、验收，还是设计系统迭代。'),
    section('应该怎么做', bullets(['新需求先形成需求规格。','需求规格确认后形成设计计划。','设计计划确认后实现或更新 App 场景。','场景完成并注册路由后再验收。','组件、页面范式和工作流本体进入项目级迭代。'])),
    section('不能怎么做', bullets(['不能跳过上游规格直接写页面。','不能把组件或工作流问题当普通业务开发处理。','不能用自动生成文档代替正式规则来源。'])),
    section('完成后如何检查', '确认每一阶段都有明确输入、输出和下一步交接，且判断优先级始终是：清晰 > 一致 > 效率 > 美观 > 创新。'),
  ].join('\n'), fp);

  docs[FILES[1]] = doc('需求理解规则', [
    section('什么时候使用', '收到新的业务页面、原型、场景或流程调整需求时使用。'),
    section('应该怎么做', bullets(productRules)),
    section('不能怎么做', bullets(['不能提前选择组件或布局代替需求判断。','不能从历史示例、页面模板或自动生成文档中发明字段、状态和流程。'])),
    section('完成后如何检查', '用户目标、页面范围、信息块、状态、异常流程和宿主路径都已明确，并且关键歧义已经确认。'),
  ].join('\n'), fp);

  docs[FILES[2]] = doc('页面设计规则', [
    section('什么时候使用', '需求规格已经确认，需要决定页面结构、布局、组件组合和打开方式时使用。'),
    section('应该怎么做', bullets(designRules)),
    section('不能怎么做', bullets(['不能只凭视觉感觉拼组件。','不能临时发明页面范式、组件类或打开方式。','不能让内容多少改变主要区域的整体宽度和对齐。'])),
    section('完成后如何检查', `当前正式沉淀的场景类型包括：${typeNames}。检查每个页面都能说明使用了什么结构、为什么这样组合、如何打开，以及依据来自哪里。`),
  ].join('\n'), fp);

  docs[FILES[3]] = doc('组件与 UI Kit 使用规则', [
    section('什么时候使用', '页面结构已经确定，需要选择稳定组件、组合方式或页面示例时使用。'),
    section('应该怎么做', bullets([`当前稳定组件包括：${componentNames}。`,`当前页面示例包括：${kitNames}。`,`先看组件契约和真实示例，再决定结构、状态和组合。`,`页面示例只用于理解骨架、节奏和固定位置，业务内容必须按当前需求重新组织。`])),
    section('不能怎么做', bullets(['不能复制手机壳、展示外框或演示业务内容作为正式页面。','不能发明未登记的组件、子结构或修饰方式。','不能直接修改 App 中的设计系统副本。'])),
    section('完成后如何检查', '组件已在注册表中存在，结构与状态符合契约，页面示例只被用于结构参考，设计系统源文件与部署副本保持一致。'),
  ].join('\n'), fp);

  docs[FILES[4]] = doc('原型实现规则', [
    section('什么时候使用', '需求规格和设计计划都已落盘，需要生成或更新真实 App 场景时使用。'),
    section('应该怎么做', bullets(uxRules)),
    section('不能怎么做', bullets(['不能复制第二套 App 宿主。','不能跳出 App 打开独立页面。','不能依赖运行时读取本地页面片段。','不能因为内容为空或较少让主要区域缩成小块。'])),
    section('完成后如何检查', '入口、路由、页面打开方式、保存回填、取消删除、键盘焦点、滚动和空内容等状态都能形成完整闭环；电脑端和移动端使用同一链接。'),
  ].join('\n'), fp);

  docs[FILES[5]] = doc('验收与回归规则', [
    section('什么时候使用', '场景已经实现并注册路由，需要判断是否正确承接需求和设计时使用。'),
    section('应该怎么做', bullets(testRules)),
    section('不能怎么做', bullets(['不能只看自动化通过就认定体验正确。','不能只验证正常路径，忽略空内容、长内容、重复操作和中断操作。','不能把实现偏差误归因到组件或最后修改的文件。'])),
    section('完成后如何检查', '页面、信息、状态、异常流程、组件结构、打开方式、路由、反馈和资源同步都已覆盖；发现的问题有明确归属和复现依据。'),
  ].join('\n'), fp);

  docs[FILES[6]] = doc('工作流迭代与经验沉淀规则', [
    section('什么时候使用', '只有用户明确要求沉淀经验、补充规则、复盘形成经验或优化工作流时使用。'),
    section('应该怎么做', bullets(experienceRules)),
    section('不能怎么做', bullets(['不能一次批量记录多条经验。','不能因为业务名称不同重复创建同类候选。','不能在第 3 次出现时自动升级正式规则。','不能把候选内容写进正式场景注册表。'])),
    section('完成后如何检查', '候选次数、场景证据、主要归属、未来规则落点、实际消费方和验收方式都完整；正式升级还必须有用户确认、场景边界和回归验证。'),
  ].join('\n'), fp);
  return { docs, fp, count };
}

function candidateErrors(pool) {
  const errors = [];
  const owners = new Set(['wego-product','wego-design','wego-ux','wego-tests']);
  const statuses = new Set(['observing','awaiting-confirmation','promoted','rejected']);
  if (!pool || typeof pool !== 'object' || Array.isArray(pool)) return ['候选池必须是对象'];
  if (pool.schemaVersion !== 1) errors.push('schemaVersion 必须为 1');
  if (pool.threshold !== 3) errors.push('threshold 必须为 3');
  if (!Array.isArray(pool.candidates)) return [...errors, 'candidates 必须是数组'];
  const ids = new Set(), keys = new Set();
  pool.candidates.forEach((item, i) => {
    const p = `candidates[${i}]`;
    for (const field of ['id','normalized_key','title','status','primary_owner','ownership_reason','problem_pattern','created_at','updated_at'])
      if (typeof item?.[field] !== 'string' || !item[field].trim()) errors.push(`${p}.${field} 必须为非空字符串`);
    for (const field of ['secondary_owners','scene_evidence','applies_when_candidates','avoid_when_candidates'])
      if (!Array.isArray(item?.[field])) errors.push(`${p}.${field} 必须是数组`);
    if (ids.has(item?.id)) errors.push(`${p}.id 重复：${item.id}`); ids.add(item?.id);
    if (keys.has(item?.normalized_key)) errors.push(`${p}.normalized_key 重复：${item.normalized_key}`); keys.add(item?.normalized_key);
    if (!statuses.has(item?.status)) errors.push(`${p}.status 非法`);
    if (!owners.has(item?.primary_owner)) errors.push(`${p}.primary_owner 非法`);
    for (const [j, owner] of (item?.secondary_owners || []).entries())
      if (!owners.has(owner)) errors.push(`${p}.secondary_owners[${j}] 非法`);
    if (!Number.isInteger(item?.occurrence_count) || item.occurrence_count < 1) errors.push(`${p}.occurrence_count 必须为正整数`);
    if (item?.threshold !== 3) errors.push(`${p}.threshold 必须为 3`);
    for (const field of ['created_at','updated_at'])
      if (typeof item?.[field] === 'string' && Number.isNaN(Date.parse(item[field]))) errors.push(`${p}.${field} 必须为 ISO 8601 时间`);
    for (const [j, evidence] of (item?.scene_evidence || []).entries()) {
      for (const field of ['date','scene','summary','source'])
        if (typeof evidence?.[field] !== 'string' || !evidence[field].trim()) errors.push(`${p}.scene_evidence[${j}].${field} 必须为非空字符串`);
      if (typeof evidence?.date === 'string' && Number.isNaN(Date.parse(evidence.date))) errors.push(`${p}.scene_evidence[${j}].date 必须为可解析日期`);
    }
    if (item?.status === 'observing' && item.occurrence_count >= 3) errors.push(`${p} 已达到阈值，必须等待确认或已处理`);
    if (item?.status === 'awaiting-confirmation' && item.occurrence_count < 3) errors.push(`${p} 未达到 3 次，不能等待确认`);
    if (!item?.expected_rule_target?.file || !item?.expected_rule_target?.field) errors.push(`${p}.expected_rule_target 不完整`);
    const reach = item?.runtime_reachability;
    if (!reach || ['consumer_skill','output_field','downstream_consumer','acceptance_check'].some(k => !reach[k])) errors.push(`${p}.runtime_reachability 不完整`);
    if (item?.status === 'promoted' && (!item.formal_rule || ['confirmed_at','file','field','rule_id'].some(k => !item.formal_rule[k]))) errors.push(`${p}.formal_rule 不完整`);
  });
  return errors;
}

function structuralErrors() {
  const errors = candidateErrors(json('.codex/skills/wego-uxsystem-iterate/experience/candidates.json'));
  const consumption = json('.codex/skills/wego-design/library-consumption.json');
  for (const [i, item] of (consumption.scenarioTypeRegistry?.types || []).entries()) {
    for (const key of ['occurrence_count','scene_evidence','threshold','status','normalized_key'])
      if (Object.hasOwn(item, key)) errors.push(`scenarioTypeRegistry.types[${i}] 含候选字段 ${key}`);
    const encoded = JSON.stringify(item);
    if (/observing|awaiting-confirmation/.test(encoded)) errors.push(`scenarioTypeRegistry.types[${i}] 含候选状态，不得进入正式注册表`);
  }
  for (const rel of ['AGENTS.md','.codex/skills/README.md','.codex/skills/wego-product/SKILL.md','.codex/skills/wego-design/SKILL.md','.codex/skills/wego-ux/SKILL.md','.codex/skills/wego-tests/SKILL.md'])
    for (const name of FILES) if (text(rel).includes(name)) errors.push(`${rel} 不得引用自动生成文档 ${name}`);
  return errors;
}

function checkFiles(docs) {
  const errors = [];
  for (const [name, expected] of Object.entries(docs)) {
    const file = path.join(OUT, name);
    if (!fs.existsSync(file)) errors.push(`缺少自动生成文档：${name}`);
    else if (fs.readFileSync(file, 'utf8') !== expected) errors.push(`自动生成文档已过期或被手工修改：${name}`);
  }
  if (fs.existsSync(OUT)) for (const entry of fs.readdirSync(OUT, { withFileTypes: true }))
    if (entry.isFile() && entry.name.endsWith('.md') && !FILES.includes(entry.name)) errors.push(`specs 顶层存在未登记文档：${entry.name}`);
  return errors;
}

function output(result) {
  if (JSON_OUT) return process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  (result.ok ? console.log : console.error)(result.message);
  for (const error of result.errors || []) console.error(`- ${error}`);
  if (result.ok && result.fingerprint) console.log(`规则指纹：${result.fingerprint}`);
}

function tests() {
  const base = { id:'a', normalized_key:'k', title:'t', status:'observing', occurrence_count:1, threshold:3, primary_owner:'wego-design', secondary_owners:[], ownership_reason:'r', problem_pattern:'p', scene_evidence:[], applies_when_candidates:[], avoid_when_candidates:[], expected_rule_target:{file:'f',field:'x'}, runtime_reachability:{consumer_skill:'wego-design',output_field:'x',downstream_consumer:'wego-ux',acceptance_check:'wego-tests'}, created_at:'2026-07-08T00:00:00Z', updated_at:'2026-07-08T00:00:00Z' };
  const failures = [];
  const expect = (value, message) => { if (!value) failures.push(message); };
  expect(candidateErrors({schemaVersion:1,threshold:3,candidates:[base]}).length === 0, '合法候选应通过');
  expect(candidateErrors({schemaVersion:1,threshold:3,candidates:[base,{...base,id:'b'}]}).some(e=>e.includes('normalized_key 重复')), '同类候选必须去重');
  expect(candidateErrors({schemaVersion:1,threshold:3,candidates:[{...base,occurrence_count:3}]}).some(e=>e.includes('达到阈值')), '第三次必须等待确认');
  expect(candidateErrors({schemaVersion:1,threshold:3,candidates:[{...base,status:'promoted',occurrence_count:3}]}).some(e=>e.includes('formal_rule')), '未确认不能升级');
  expect(candidateErrors({schemaVersion:1,threshold:3,candidates:[{...base,primary_owner:''}]}).some(e=>e.includes('primary_owner')), '归属不明不得入池');
  expect(manifestFingerprint(['a:1']) !== manifestFingerprint(['a:2']), '规则源变化应改变指纹');
  expect(candidateErrors({schemaVersion:1,threshold:3,candidates:[{...base,secondary_owners:['unknown']}]}).some(e=>e.includes('secondary_owners')), '次要归属必须合法');
  expect(candidateErrors({schemaVersion:1,threshold:3,candidates:[{...base,scene_evidence:[{date:'bad',scene:'s',summary:'x',source:'y'}]}]}).some(e=>e.includes('可解析日期')), '场景证据时间必须合法');
  const workflow = text('.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md');
  expect(workflow.includes('每轮只记录一条经验') && workflow.includes('是否现在将其升级为正式规则') && workflow.includes('运行时可达性'), '工作流门禁不完整');
  const rendered = render().docs;
  for (const [name, value] of Object.entries(rendered)) {
    expect(value.includes('## 什么时候使用') && value.includes('## 应该怎么做') && value.includes('## 不能怎么做') && value.includes('## 完成后如何检查'), `${name} 缺少统一的人话结构`);
    const body = value.replace(/<!--[^]*?-->/g, '');
    expect(!body.includes('.codex/skills/') && !body.includes('SKILL.runtime.md') && !body.includes('spec_refs'), `${name} 仍堆叠运行时文件名或旧字段`);
  }
  return failures;
}

try {
  if (!['generate','check','test'].includes(CMD)) throw new Error('用法：node scripts/specs.mjs <generate|check|test> [--json]');
  if (CMD === 'test') {
    const errors = tests();
    output({ ok: !errors.length, message: errors.length ? '规则文档与经验池测试失败' : '规则文档与经验池测试通过', errors });
    process.exit(errors.length ? 1 : 0);
  }
  const structure = structuralErrors();
  const { docs, fp, count } = render();
  if (CMD === 'generate') {
    if (structure.length) { output({ok:false,message:'正式生成前结构检查失败',errors:structure}); process.exit(1); }
    fs.mkdirSync(OUT, { recursive: true });
    for (const [name, value] of Object.entries(docs)) fs.writeFileSync(path.join(OUT, name), value);
    output({ok:true,message:`已生成 ${FILES.length} 份规则检查文档`,fingerprint:fp,source_count:count});
    process.exit(0);
  }
  const errors = [...structure, ...checkFiles(docs)];
  output({ok:!errors.length,message:errors.length?'规则文档一致性检查失败':'规则文档一致性检查通过',errors,fingerprint:fp,source_count:count});
  process.exit(errors.length ? 1 : 0);
} catch (error) {
  output({ok:false,message:'规则文档脚本执行失败',errors:[error.message]});
  process.exit(1);
}
