#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const VERSION = '2';
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

function render() {
  const index = json('.codex/skills/wego-design/components/index.json');
  const plan = json('.codex/skills/wego-design/uikit-plan.json');
  const consumption = json('.codex/skills/wego-design/library-consumption.json');
  const { value: fp, count } = fingerprint();
  const components = (index.components || []).map(item => `${item.name}（${item.slug}）`).join('、');
  const kits = (plan.uiKits || []).map(item => item.slug).join('、') || '无';
  const types = (consumption.scenarioTypeRegistry?.types || [])
    .map(item => `- ${item.name}（${item.id}）：主要由 ${item.primaryWorkflowStage} 决策。`)
    .join('\n');
  const docs = {};

  docs[FILES[0]] = doc('工作流总览与优先级', [
    section('技能路由', sourceSection('AGENTS.md', '技能路由')),
    section('主链路硬门禁', sourceSection('AGENTS.md', '主链路硬门禁')),
    section('判断优先级', '清晰 > 一致 > 效率 > 美观 > 创新。'),
  ].join('\n'), fp);

  docs[FILES[1]] = doc('需求理解规则', [
    section('产品理解运行规则', sourceSection('.codex/skills/wego-product/SKILL.md', '本轮覆盖规则')),
    section('完成标准', '用户目标、页面范围、信息块、状态、异常流程和宿主路径必须落盘；关键歧义未确认前不进入页面设计。'),
  ].join('\n'), fp);

  docs[FILES[2]] = doc('页面设计规则', [
    section('设计消费运行规则', sourceSection('.codex/skills/wego-design/SKILL.md', '本轮覆盖规则')),
    section('正式场景类型', types || '当前没有登记正式场景类型。'),
    section('完成标准', '每个页面都要有可追溯的页面范式、组件组合、布局和打开方式；无法追溯时标记为设计缺口。'),
  ].join('\n'), fp);

  docs[FILES[3]] = doc('组件与 UI Kit 使用规则', [
    section('当前组件', components || '当前没有登记组件。'),
    section('组件与 UI Kit 边界', sourceSection('.codex/skills/wego-design/README.md', '组件与 UI Kit 边界')),
    section('当前 UI Kit', `当前登记：${kits}。实际清单以 uikit-plan.json 为准。`),
  ].join('\n'), fp);

  docs[FILES[4]] = doc('原型实现规则', [
    section('原型实现运行规则', sourceSection('.codex/skills/wego-ux/SKILL.md', '本轮覆盖规则')),
    section('固定交付', '唯一 App 入口是 wego-app/index.html；业务场景进入 wego-app/scenes/{中文业务场景}/，使用稳定路由和 scene.js 增量更新。'),
  ].join('\n'), fp);

  docs[FILES[5]] = doc('验收与回归规则', [
    section('验收运行规则', sourceSection('.codex/skills/wego-tests/SKILL.md', '本轮覆盖规则')),
    section('归因原则', '问题归因到最早产生错误的环节；自动化通过不能替代业务流程、组件结构和真实体验检查。'),
  ].join('\n'), fp);

  docs[FILES[6]] = doc('工作流迭代与经验沉淀规则', [
    section('经验候选硬门禁', sourceSection('.codex/skills/wego-uxsystem-iterate/SKILL.md', '经验候选硬门禁')),
    section('候选匹配与计数', sourceSection('.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md', '5. 候选匹配与计数')),
    section('第三次确认门禁', sourceSection('.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md', '6. 第三次确认门禁')),
    section('正式沉淀前的场景拆分', sourceSection('.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md', '7. 正式沉淀前的场景拆分')),
    section('运行时可达性', sourceSection('.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md', '8. 运行时可达性')),
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
