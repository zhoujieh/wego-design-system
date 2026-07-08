#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const VERSION = '1';
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

function fingerprint() {
  const manifest = sources().map(rel => `${rel}:${blobSha(text(rel))}`);
  return {
    value: crypto.createHash('sha256').update([`generator:${VERSION}`, ...manifest].join('\n')).digest('hex'),
    count: manifest.length,
  };
}

const bullets = items => items.map(item => `- ${item}`).join('\n');
const section = (title, body) => `## ${title}\n\n${body}\n`;
const doc = (title, body, fp) => `# ${title}\n\n${NOTICE}\n\n${body.trim()}\n\n<!-- generated-by: scripts/specs.mjs@${VERSION} -->\n<!-- source-fingerprint: ${fp} -->\n`;

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
    section('固定链路', bullets(['原始需求先做需求理解。','需求规格落盘后做页面设计。','设计计划落盘后实现 App 场景。','场景完成并注册路由后做验收。','设计系统和工作流本体进入项目级迭代。'])),
    section('判断优先级', '清晰 > 一致 > 效率 > 美观 > 创新。'),
    section('硬门禁', bullets(['没有需求规格不进入页面设计。','没有设计计划不进入原型实现。','已有场景修改先做偏差判定。','候选经验未达到三次并获得确认，不修改正式规则。','生成文档只用于人工检查，不参与运行时决策。'])),
  ].join('\n'), fp);

  docs[FILES[1]] = doc('需求理解规则', [
    section('先确认真实任务', '先确认用户目标、页面范围、信息块、状态、异常流程和宿主路径，不提前选择组件或布局。'),
    section('不发明需求', bullets(['字段和动作只来自用户需求。','不把 UI Kit、组件预览或历史惯例当成新需求。','列表区分识别、摘要、详情和操作字段。','每个信息块必须由至少一个页面承接。'])),
    section('交接', '关键歧义先确认；确认后的需求规格必须落盘，页面设计只消费已确认内容。'),
  ].join('\n'), fp);

  docs[FILES[2]] = doc('页面设计规则', [
    section('逐个页面判断', '每个页面分别判断精确命中、近似命中、兜底蓝图或设计缺口，不能整项任务只给一个页面范式。'),
    section('先结构后组件', bullets(['先定页面职责、信息组织、布局方向和打开方式。','再选稳定组件场景、组合约束或自由组合。','主要信息区域默认占满可用宽度，不随空内容收缩。','对象管理列表默认优先横向主结构。','同一表单保持统一对齐。'])),
    section('正式场景类型', types || '当前没有登记正式场景类型。'),
    section('交接', '页面打开方式和关键设计决策必须可追溯；无法追溯时标记为设计缺口，不交给实现阶段临时判断。'),
  ].join('\n'), fp);

  docs[FILES[3]] = doc('组件与 UI Kit 使用规则', [
    section('当前组件', components || '当前没有登记组件。'),
    section('组件边界', bullets(['先读注册表、组件契约和预览。','不发明未注册组件类、子元素类或修饰类。','连续列表和表单优先使用正式分组结构。','独立控件自行承担点击；危险操作保留确认。','资源先改设计系统源文件，再同步部署副本。'])),
    section('UI Kit 边界', `当前 UI Kit：${kits}。只参考页面骨架、组合节奏和打开方式，不复制手机壳、演示内容和业务示例样式。`),
  ].join('\n'), fp);

  docs[FILES[4]] = doc('原型实现规则', [
    section('只执行已确认规格', '已有场景修改前先判断内容、组件和打开方式是否偏离原规格；有偏差先回上游更新。'),
    section('固定结构', bullets(['唯一 App 入口是 wego-app/index.html。','场景进入 wego-app/scenes/{中文业务场景}/。','同一场景使用稳定路由增量更新。','场景通过 scene.js 注册模板、打开方式和交互。','不得读取本地 HTML 片段或跳出 App。'])),
    section('交互闭环', bullets(['输入、选择、切换、保存、取消、删除和反馈要有真实状态变化。','焦点、键盘、滚动、宽度和安全区不能破坏主结构。','只有需求明确要求刷新保留时才使用持久化。'])),
  ].join('\n'), fp);

  docs[FILES[5]] = doc('验收与回归规则', [
    section('比较三层一致性', '验收比较需求规格、设计计划和当前实现；自动化通过不能替代业务流程、组件结构和真实体验检查。'),
    section('必查', bullets(['页面、信息、状态和异常流程完整。','页面范式、组件、布局和打开方式与设计计划一致。','路由、入口、返回路径和覆盖层级正确。','空内容、长内容、少量内容、重复操作和中断操作稳定。','设计系统部署副本与源资源一致。'])),
    section('归因', '问题归因到最早产生错误的环节：需求遗漏归产品理解，设计决策错误归页面设计，规格正确但实现偏离归原型实现，漏检或归因错误归验收。'),
  ].join('\n'), fp);

  docs[FILES[6]] = doc('工作流迭代与经验沉淀规则', [
    section('候选入口', '只有用户明确要求沉淀经验、补充规则、复盘形成经验或优化工作流时才更新候选池；普通反馈、AI 自查和验收失败不会自动入池。'),
    section('一次一条', '一次审查最多选择一条最早产生、影响最大、最可复用的经验。'),
    section('去重和归属', bullets(['去除具体业务名，并用至少两个不同业务场景验证。','按问题首次产生的环节判断主要归属。','明确正式权威落点、运行时消费、下游交接和验收方式。','同类只累计次数和证据，不重复新增。'])),
    section('三次确认', '第 3 次出现时改为等待确认并询问用户；未明确确认前不修改正式规则，不新增正式场景类型。'),
    section('正式升级', '确认后拆分适用、不适用、例外和回退，优先并入已有规则，并补齐运行时消费、回归验证、版本和生成文档。'),
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
    if (!Number.isInteger(item?.occurrence_count) || item.occurrence_count < 1) errors.push(`${p}.occurrence_count 必须为正整数`);
    if (item?.threshold !== 3) errors.push(`${p}.threshold 必须为 3`);
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
  expect(fingerprint().value !== crypto.createHash('sha256').update('changed').digest('hex'), '规则源变化应改变指纹');
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
