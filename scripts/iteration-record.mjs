#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rawArgs = process.argv.slice(2);
const command = rawArgs.find(arg => !arg.startsWith('--')) || 'check';
const option = name => rawArgs.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const options = name => rawArgs.filter(arg => arg.startsWith(`--${name}=`)).map(arg => arg.slice(name.length + 3));
const ROOT = path.resolve(option('root') || process.cwd());
const SCENES_ROOT = path.join(ROOT, 'wego-app/scenes');
const SCRIPT_FILE = path.resolve(process.argv[1]);

const CURRENT_SCHEMA = 2;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[a-z][a-z0-9-]*\d{3}$/;
const REQUIREMENT_RE = /^[a-z][a-z0-9-]*\d{3}-R\d{2,}$/;
const ACTIVE_STATUSES = new Set([
  'draft',
  'awaiting-brief-confirmation',
  'prototyping',
  'awaiting-prototype-confirmation',
  'prototype-confirmed',
  'product-confirmed',
  'design-ready',
  'implemented',
  'testing',
  'accepted',
  'accepted-with-risk',
  'blocked',
]);
const ALL_STATUSES = new Set([...ACTIVE_STATUSES, 'cancelled', 'superseded', 'frozen']);
const BLOCKABLE_STATUSES = new Set([
  'draft',
  'awaiting-brief-confirmation',
  'prototyping',
  'awaiting-prototype-confirmation',
  'prototype-confirmed',
  'product-confirmed',
  'design-ready',
  'implemented',
  'testing',
]);
const STAGE_ORDER = new Map([
  ['draft', 0],
  ['awaiting-brief-confirmation', 1],
  ['prototyping', 2],
  ['awaiting-prototype-confirmation', 3],
  ['prototype-confirmed', 4],
  ['product-confirmed', 5],
  ['design-ready', 6],
  ['implemented', 7],
  ['testing', 8],
  ['accepted', 9],
  ['accepted-with-risk', 9],
  ['frozen', 10],
]);

const now = () => new Date().toISOString();
const exists = file => fs.existsSync(file);
const mkdir = dir => fs.mkdirSync(dir, { recursive: true });
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const hashValue = value => crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
const asArray = value => Array.isArray(value) ? value : [];
const unique = values => values.length === new Set(values).size;
const rel = file => path.relative(ROOT, file).split(path.sep).join('/');

function fail(message) {
  throw new Error(message);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
  }
  return value;
}

function isValidDate(value) {
  if (!DATE_RE.test(value || '')) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isSafeName(value) {
  return typeof value === 'string'
    && value.trim() === value
    && value.length > 0
    && !/[\\/]/.test(value)
    && !['.', '..'].includes(value);
}

function assertCurrentSchema(record, file = 'iteration.json') {
  if (record.schemaVersion !== CURRENT_SCHEMA) {
    fail(`${relPath(file)} 使用旧 Schema ${record.schemaVersion ?? 'unknown'}；当前只接受 schemaVersion: ${CURRENT_SCHEMA}，请先显式迁移`);
  }
}

function relPath(file) {
  return path.isAbsolute(file) ? rel(file) : file;
}

function getIterationFile(required = true) {
  const value = option('iteration');
  if (!value) {
    if (required) fail('必须提供 --iteration=<迭代目录或 iteration.json>');
    return null;
  }
  const target = path.resolve(ROOT, value);
  const file = path.basename(target) === 'iteration.json' ? target : path.join(target, 'iteration.json');
  const relative = path.relative(SCENES_ROOT, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) fail('iteration 必须位于 wego-app/scenes 下');
  if (required && !exists(file)) fail(`找不到 iteration.json：${rel(file)}`);
  return file;
}

function iterationDir(file) {
  return path.dirname(file);
}

function affectedScenes(record) {
  return asArray(record.affected_scenes).map(item => typeof item === 'string'
    ? { scene: item, role: item === record.identity?.primary_scene ? 'primary' : 'related', change_type: 'changed' }
    : item);
}

function affectedRuntimeFiles(record) {
  return asArray(record.affected_runtime).map(item => typeof item === 'string' ? item : item?.file).filter(Boolean);
}

function specFiles(scene) {
  const dir = path.join(SCENES_ROOT, scene, '_spec');
  return {
    dir,
    interaction: path.join(dir, 'interaction_spec.json'),
    design: path.join(dir, 'design_plan.json'),
    acceptance: path.join(dir, 'acceptance_report.json'),
    sceneJs: path.join(SCENES_ROOT, scene, 'scene.js'),
    sceneCss: path.join(SCENES_ROOT, scene, 'scene.css'),
  };
}

function listFiles(root) {
  if (!exists(root)) return [];
  const output = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) output.push(...listFiles(target));
    else if (entry.isFile()) output.push(target);
  }
  return output;
}

function prototypeFiles(record) {
  const files = [];
  for (const item of affectedScenes(record)) {
    const root = path.join(SCENES_ROOT, item.scene);
    for (const file of listFiles(root)) {
      const relative = rel(file);
      if (!relative.includes('/_iterations/') && !relative.includes('/_spec/')) files.push(file);
    }
  }
  for (const runtime of affectedRuntimeFiles(record)) {
    const file = path.join(ROOT, runtime);
    if (exists(file)) files.push(file);
  }
  return [...new Set(files)];
}

function fingerprints(files) {
  return Object.fromEntries(files.filter(exists).map(file => [rel(file), sha256(file)]));
}

function verifyFingerprints(expected, label) {
  for (const [relative, expectedHash] of Object.entries(expected || {})) {
    const file = path.join(ROOT, relative);
    if (!exists(file)) fail(`${label}文件缺失：${relative}`);
    if (sha256(file) !== expectedHash) fail(`${label}已漂移：${relative}`);
  }
}

function validatePrototypeBrief(record) {
  const brief = record.prototype_brief || {};
  for (const key of ['included', 'excluded', 'entry_points', 'critical_paths']) {
    if (!Array.isArray(brief[key])) fail(`prototype_brief.${key} 必须为数组`);
  }
  if (!brief.goal) fail('prototype_brief.goal 不得为空');
  if (brief.included.length === 0 || brief.entry_points.length === 0 || brief.critical_paths.length === 0) {
    fail('prototype_brief 的 included、entry_points、critical_paths 不得为空');
  }
  if (asArray(brief.open_questions).some(item => item?.blocking === true || item?.impact_level === 'core')) {
    fail('prototype_brief 仍有阻塞问题，不能确认');
  }
}

function validatePrototypeDesign(record) {
  const items = asArray(record.prototype_design?.surface_decisions);
  if (items.length === 0) fail('prototype_design 至少需要一个 surface_decision');
  const ids = items.map(item => item?.surface_id);
  if (!unique(ids) || ids.some(id => typeof id !== 'string' || !id)) fail('prototype_design.surface_decisions 的 surface_id 必须唯一且非空');
  for (const item of items) {
    if (!item.presentation || asArray(item.rule_sources_used).length === 0) {
      fail(`surface_decision ${item.surface_id} 必须包含 presentation 和 rule_sources_used`);
    }
  }
}

function briefFingerprint(record) {
  return hashValue({
    prototype_brief: record.prototype_brief,
    affected_scenes: record.affected_scenes,
    affected_runtime: record.affected_runtime,
  });
}

function prototypeFingerprint(record) {
  return hashValue({
    prototype_brief: record.prototype_brief,
    prototype_design: record.prototype_design,
    affected_scenes: record.affected_scenes,
    affected_runtime: record.affected_runtime,
  });
}

function assertBriefConfirmation(record) {
  if (!record.brief_confirmation?.brief_fingerprint) fail('缺少有效 brief_confirmation');
  if (record.brief_confirmation.brief_fingerprint !== briefFingerprint(record)) {
    fail('原型简报已变化，必须 invalidate --stage=brief 并重新确认');
  }
}

function assertPrototypeSnapshot(record) {
  const confirmation = record.prototype_confirmation;
  if (!confirmation?.prototype_fingerprint || !confirmation?.fingerprints) fail('缺少有效 prototype_confirmation');
  if (confirmation.prototype_fingerprint !== prototypeFingerprint(record)) fail('原型简报或设计约束已变化，必须重新定稿');
  verifyFingerprints(confirmation.fingerprints, '已确认原型');
}

function validateIdentity(record) {
  const identity = record.identity || {};
  if (!ID_RE.test(identity.iteration_id || '')) fail('identity.iteration_id 必须是小写前缀加三位序号，例如 shop001');
  if (!isSafeName(identity.title)) fail('identity.title 非法');
  if (!isValidDate(identity.date)) fail('identity.date 必须为有效 YYYY-MM-DD 日期');
  if (!isSafeName(identity.primary_scene)) fail('identity.primary_scene 非法');
  if (!ALL_STATUSES.has(record.status)) fail(`非法 status：${record.status}`);
  if (!Number.isInteger(record.scope_revision) || record.scope_revision < 1) fail('scope_revision 必须为正整数');
}

function assertIterationContext(value, record, file, expectedIds) {
  const context = value?.iteration_context;
  if (!context) fail(`${rel(file)} 缺少 iteration_context`);
  if (context.iteration_id !== record.identity.iteration_id) fail(`${rel(file)} iteration_id 不一致`);
  if (context.scope_revision !== record.scope_revision) fail(`${rel(file)} scope_revision 不一致`);
  const actual = [...asArray(context.requirement_ids)].sort();
  const expected = [...expectedIds].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(`${rel(file)} requirement_ids 不一致`);
}

function requirementIds(record, scene) {
  return asArray(record.requirements)
    .filter(item => asArray(item.scene_refs).includes(scene))
    .map(item => item.requirement_id);
}

function validateFormalProduct(record, file) {
  if (!record.product_scope?.goal) fail(`${rel(file)} 缺少 product_scope.goal`);
  if (asArray(record.requirements).length === 0) fail(`${rel(file)} 缺少 requirements`);
  const ids = record.requirements.map(item => item.requirement_id);
  if (!unique(ids) || ids.some(id => !REQUIREMENT_RE.test(id || ''))) fail(`${rel(file)} requirement_id 非法或重复`);
  for (const scene of affectedScenes(record)) {
    const spec = specFiles(scene.scene);
    if (!exists(spec.interaction)) fail(`缺少 ${rel(spec.interaction)}`);
    const value = readJson(spec.interaction);
    assertIterationContext(value, record, spec.interaction, requirementIds(record, scene.scene));
    const readiness = typeof value.readiness === 'string' ? value.readiness : value.readiness?.status;
    if (!['ready', 'ready-with-assumptions'].includes(readiness)) fail(`${rel(spec.interaction)} readiness 不可继续`);
  }
}

function validateDesign(record) {
  for (const scene of affectedScenes(record)) {
    const spec = specFiles(scene.scene);
    if (!exists(spec.design)) fail(`缺少 ${rel(spec.design)}`);
    const value = readJson(spec.design);
    assertIterationContext(value, record, spec.design, requirementIds(record, scene.scene));
    if (asArray(value.design_gaps).length > 0) fail(`${rel(spec.design)} 仍有 design_gaps`);
    if (asArray(value.surface_designs).some(item => item.match_status === 'gap')) fail(`${rel(spec.design)} 存在 gap surface`);
  }
  for (const item of asArray(record.traceability)) {
    if (asArray(item.design_refs).length === 0) fail(`traceability ${item.requirement_id}/${item.scene} 缺少 design_refs`);
  }
}

function validateImplementation(record) {
  assertPrototypeSnapshot(record);
  for (const scene of affectedScenes(record)) {
    const files = specFiles(scene.scene);
    if (scene.change_type !== 'removed' && !exists(files.sceneJs)) fail(`缺少 ${rel(files.sceneJs)}`);
  }
  for (const item of asArray(record.traceability)) {
    if (asArray(item.implementation_refs).length === 0) fail(`traceability ${item.requirement_id}/${item.scene} 缺少 implementation_refs`);
  }
}

function validateAcceptance(record) {
  for (const scene of affectedScenes(record)) {
    const spec = specFiles(scene.scene);
    if (!exists(spec.acceptance)) fail(`缺少 ${rel(spec.acceptance)}`);
    const value = readJson(spec.acceptance);
    assertIterationContext(value, record, spec.acceptance, requirementIds(record, scene.scene));
    if (!['pass', 'pass-with-risk'].includes(value.final_status)) fail(`${rel(spec.acceptance)} 未通过`);
  }
}

function validateRecord(record, file) {
  assertCurrentSchema(record, file);
  validateIdentity(record);
  if (record.status === 'blocked') {
    if (!record.pause || !BLOCKABLE_STATUSES.has(record.pause.resume_status)) fail('blocked 必须记录有效 pause.resume_status');
  }
  const effective = record.status === 'blocked' ? record.pause.resume_status : record.status;
  const stage = STAGE_ORDER.get(effective) ?? -1;
  if (stage >= STAGE_ORDER.get('prototyping')) assertBriefConfirmation(record);
  if (stage >= STAGE_ORDER.get('prototype-confirmed')) assertPrototypeSnapshot(record);
  if (stage >= STAGE_ORDER.get('product-confirmed')) validateFormalProduct(record, file);
  if (stage >= STAGE_ORDER.get('design-ready')) validateDesign(record);
  if (stage >= STAGE_ORDER.get('implemented')) validateImplementation(record);
  if (stage >= STAGE_ORDER.get('accepted')) validateAcceptance(record);
}

function findIterationFiles() {
  if (!exists(SCENES_ROOT)) return [];
  return listFiles(SCENES_ROOT).filter(file => file.endsWith('/iteration.json') || file.endsWith('\\iteration.json'));
}

function assertNoOverlap(record, currentFile = null) {
  const targetScenes = new Set(affectedScenes(record).map(item => item.scene));
  const targetRuntime = new Set(affectedRuntimeFiles(record));
  for (const file of findIterationFiles()) {
    if (currentFile && path.resolve(file) === path.resolve(currentFile)) continue;
    const other = readJson(file);
    assertCurrentSchema(other, file);
    if (!ACTIVE_STATUSES.has(other.status)) continue;
    const sceneOverlap = affectedScenes(other).some(item => targetScenes.has(item.scene));
    const runtimeOverlap = affectedRuntimeFiles(other).some(item => targetRuntime.has(item));
    if (sceneOverlap || runtimeOverlap) fail(`迭代范围与活跃迭代冲突：${rel(file)}`);
  }
}

function save(file, record, action, detail = {}) {
  record.change_log = asArray(record.change_log);
  record.change_log.push({ at: now(), action, ...detail });
  writeJson(file, record);
}

function commandInit() {
  if (option('schema') && option('schema') !== String(CURRENT_SCHEMA)) {
    fail(`不支持 --schema=${option('schema')}；当前只允许 --schema=${CURRENT_SCHEMA}`);
  }
  const scene = option('scene');
  const id = option('id');
  const title = option('title');
  const date = option('date');
  if (!isSafeName(scene) || !ID_RE.test(id || '') || !isSafeName(title) || !isValidDate(date)) {
    fail('init 必须提供合法的 --scene、--id、--title、--date');
  }
  const dir = path.join(SCENES_ROOT, scene, '_iterations', `${date.replaceAll('-', '')}-${id}-${title}`);
  const file = path.join(dir, 'iteration.json');
  if (exists(file)) fail(`迭代已存在：${rel(file)}`);
  const related = options('related-scene');
  const runtime = options('runtime');
  const record = {
    schemaVersion: CURRENT_SCHEMA,
    identity: { iteration_id: id, title, date, primary_scene: scene, related_scenes: related },
    status: 'draft',
    scope_revision: 1,
    prototype_brief: { goal: '', included: [], excluded: [], entry_points: [], critical_paths: [], prototype_boundaries: [], assumptions: [], open_questions: [] },
    prototype_design: { surface_decisions: [] },
    brief_confirmation: null,
    prototype_confirmation: null,
    base_fingerprint: {},
    product_scope: {},
    features: [],
    requirements: [],
    traceability: [],
    affected_scenes: [
      { scene, role: 'primary', change_type: 'changed' },
      ...related.map(item => ({ scene: item, role: 'related', change_type: 'changed' })),
    ],
    affected_runtime: runtime,
    stage_outputs: { product: { valid: false }, design: { valid: false }, implementation: { valid: false }, acceptance: { valid: false } },
    change_log: [],
    freeze: null,
  };
  assertNoOverlap(record);
  mkdir(dir);
  save(file, record, 'init');
  console.log(rel(dir));
}

function mutate(expectedStatuses, nextStatus, action, mutator = () => {}) {
  const file = getIterationFile();
  const record = readJson(file);
  assertCurrentSchema(record, file);
  if (!expectedStatuses.includes(record.status)) fail(`${action} 不允许从 ${record.status} 执行`);
  mutator(record, file);
  record.status = nextStatus;
  save(file, record, action);
  console.log(`${action} 完成：${rel(file)} → ${nextStatus}`);
}

function commandSubmitBrief() {
  mutate(['draft'], 'awaiting-brief-confirmation', 'submit-brief', record => {
    validatePrototypeBrief(record);
    assertNoOverlap(record, getIterationFile());
  });
}

function commandConfirmBrief() {
  mutate(['awaiting-brief-confirmation'], 'prototyping', 'confirm-brief', record => {
    validatePrototypeBrief(record);
    record.brief_confirmation = { confirmed_at: now(), confirmed_by: option('by') || 'user', brief_fingerprint: briefFingerprint(record) };
  });
}

function commandSubmitPrototype() {
  mutate(['prototyping'], 'awaiting-prototype-confirmation', 'submit-prototype', record => {
    assertBriefConfirmation(record);
    validatePrototypeDesign(record);
  });
}

function commandConfirmPrototype() {
  mutate(['awaiting-prototype-confirmation'], 'prototype-confirmed', 'confirm-prototype', record => {
    assertBriefConfirmation(record);
    validatePrototypeDesign(record);
    const files = prototypeFiles(record);
    if (files.length === 0) fail('没有可锁定的原型运行时文件');
    record.prototype_confirmation = {
      confirmed_at: now(),
      confirmed_by: option('by') || 'user',
      prototype_fingerprint: prototypeFingerprint(record),
      fingerprints: fingerprints(files),
    };
  });
}

function commandFormalizeProduct() {
  mutate(['prototype-confirmed'], 'product-confirmed', 'formalize-product', (record, file) => {
    assertPrototypeSnapshot(record);
    validateFormalProduct(record, file);
    record.stage_outputs.product = { valid: true, completed_at: now(), fingerprint: hashValue({ product_scope: record.product_scope, requirements: record.requirements, traceability: record.traceability }) };
  });
}

function commandMarkDesign() {
  mutate(['product-confirmed'], 'design-ready', 'mark-design', record => {
    assertPrototypeSnapshot(record);
    validateDesign(record);
    record.base_fingerprint = fingerprints(prototypeFiles(record));
    record.stage_outputs.design = { valid: true, completed_at: now(), fingerprint: hashValue(asArray(record.traceability).map(item => item.design_refs)) };
  });
}

function commandCheckPrototypeSnapshot() {
  const file = getIterationFile();
  const record = readJson(file);
  assertCurrentSchema(record, file);
  assertPrototypeSnapshot(record);
  console.log(`原型快照未漂移：${rel(file)}`);
}

function commandMarkImplemented() {
  mutate(['design-ready'], 'implemented', 'mark-implemented', record => {
    assertPrototypeSnapshot(record);
    validateImplementation(record);
    record.stage_outputs.implementation = { valid: true, completed_at: now(), fingerprint: hashValue(asArray(record.traceability).map(item => item.implementation_refs)) };
  });
}

function commandStartTesting() {
  mutate(['implemented'], 'testing', 'start-testing', record => validateImplementation(record));
}

function commandHandoff() {
  mutate(['testing'], 'accepted', 'handoff', (record, file) => {
    validateAcceptance(record);
    const statuses = affectedScenes(record).map(item => readJson(specFiles(item.scene).acceptance).final_status);
    if (statuses.includes('pass-with-risk')) record.status = 'accepted-with-risk';
    const dir = iterationDir(file);
    const name = `${record.identity.iteration_id}-${record.identity.title}-开发交接.md`;
    fs.writeFileSync(path.join(dir, name), `# ${record.identity.title} 开发交接\n\n- 迭代：${record.identity.iteration_id}\n- 状态：${statuses.includes('pass-with-risk') ? 'accepted-with-risk' : 'accepted'}\n- 生成时间：${now()}\n`);
    record.stage_outputs.acceptance = { valid: true, completed_at: now() };
  });
}

function commandFreeze() {
  mutate(['accepted', 'accepted-with-risk'], 'frozen', 'freeze', (record, file) => {
    validateAcceptance(record);
    const dir = iterationDir(file);
    const currentFiles = {};
    for (const scene of affectedScenes(record)) {
      const files = specFiles(scene.scene);
      for (const source of [files.interaction, files.design, files.acceptance, files.sceneJs, files.sceneCss]) {
        if (exists(source)) currentFiles[rel(source)] = sha256(source);
      }
    }
    for (const runtime of affectedRuntimeFiles(record)) {
      const source = path.join(ROOT, runtime);
      if (exists(source)) currentFiles[rel(source)] = sha256(source);
    }
    const archiveFiles = fingerprints(listFiles(dir).filter(item => path.resolve(item) !== path.resolve(file)));
    const freeze = { frozen_at: now(), git_commit: null, current_files: currentFiles, archive_files: archiveFiles };
    writeJson(path.join(dir, 'freeze.json'), freeze);
    record.freeze = freeze;
  });
}

function commandInvalidate() {
  const file = getIterationFile();
  const record = readJson(file);
  assertCurrentSchema(record, file);
  if (record.status === 'frozen' || record.status === 'cancelled' || record.status === 'superseded') fail(`${record.status} 迭代不能失效恢复`);
  const stage = option('stage');
  const reason = option('reason');
  if (!reason) fail('invalidate 必须提供 --reason');
  const targets = {
    brief: 'draft',
    prototype: 'prototyping',
    product: 'prototype-confirmed',
    design: 'product-confirmed',
    implementation: 'design-ready',
    acceptance: 'implemented',
  };
  const target = targets[stage];
  if (!target) fail('非法 --stage；允许 brief|prototype|product|design|implementation|acceptance');
  if ((STAGE_ORDER.get(record.status) ?? -1) < (STAGE_ORDER.get(target) ?? 99)) fail('不能用 invalidate 将流程向前推进');
  if (stage === 'brief') {
    record.brief_confirmation = null;
    record.prototype_confirmation = null;
    record.scope_revision += 1;
  } else if (stage === 'prototype') {
    record.prototype_confirmation = null;
  }
  if (['brief', 'prototype', 'product'].includes(stage)) record.stage_outputs.product = { valid: false };
  if (['brief', 'prototype', 'product', 'design'].includes(stage)) record.stage_outputs.design = { valid: false };
  if (['brief', 'prototype', 'product', 'design', 'implementation'].includes(stage)) record.stage_outputs.implementation = { valid: false };
  record.stage_outputs.acceptance = { valid: false };
  record.status = target;
  save(file, record, 'invalidate', { stage, reason });
  console.log(`invalidate 完成：${rel(file)} → ${target}`);
}

function commandBlock() {
  const file = getIterationFile();
  const record = readJson(file);
  assertCurrentSchema(record, file);
  if (!BLOCKABLE_STATUSES.has(record.status)) fail(`${record.status} 不能 block`);
  const reason = option('reason');
  if (!reason) fail('block 必须提供 --reason');
  record.pause = { resume_status: record.status, reason, blocked_at: now() };
  record.status = 'blocked';
  save(file, record, 'block', { reason });
  console.log(`block 完成：${rel(file)}`);
}

function commandResume() {
  const file = getIterationFile();
  const record = readJson(file);
  assertCurrentSchema(record, file);
  if (record.status !== 'blocked' || !record.pause?.resume_status) fail('只有 blocked 迭代可以 resume');
  record.status = record.pause.resume_status;
  delete record.pause;
  validateRecord(record, file);
  save(file, record, 'resume');
  console.log(`resume 完成：${rel(file)} → ${record.status}`);
}

function commandTerminal(nextStatus) {
  const file = getIterationFile();
  const record = readJson(file);
  assertCurrentSchema(record, file);
  if (record.status === 'frozen') fail('frozen 迭代不能修改');
  record.status = nextStatus;
  save(file, record, nextStatus, { reason: option('reason') || '' });
  console.log(`${nextStatus} 完成：${rel(file)}`);
}

function commandCheck() {
  const single = getIterationFile(false);
  const files = single ? [single] : findIterationFiles();
  const ids = [];
  for (const file of files) {
    const record = readJson(file);
    validateRecord(record, file);
    ids.push(record.identity.iteration_id);
  }
  if (!unique(ids)) fail('全仓 iteration_id 必须唯一');
  for (const changed of options('changed-file')) {
    if (/page_spec\.json$|design_consumption_plan\.json$/.test(changed)) fail(`禁止旧规格文件：${changed}`);
  }
  console.log(`业务迭代检查通过：${files.length} 个迭代，Schema=${CURRENT_SCHEMA}`);
}

function commandTest() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-iteration-test-'));
  const run = (args, ok = true) => {
    const result = spawnSync(process.execPath, [SCRIPT_FILE, ...args, `--root=${temp}`], { encoding: 'utf8' });
    if ((result.status === 0) !== ok) fail(`测试命令失败：${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
    return result;
  };
  try {
    mkdir(path.join(temp, 'wego-app/scenes/测试场景/_spec'));
    const legacy = run(['init', '--schema=1', '--scene=测试场景', '--id=test000', '--title=旧版', '--date=2026-07-11'], false);
    if (!legacy.stderr.includes('当前只允许')) fail('旧 Schema 必须明确失败');
    const init = run(['init', '--scene=测试场景', '--id=test001', '--title=测试迭代', '--date=2026-07-11']);
    const dir = path.join(temp, init.stdout.trim());
    const file = path.join(dir, 'iteration.json');
    const record = readJson(file);
    record.prototype_brief = { goal: '完成测试', included: ['主流程'], excluded: [], entry_points: ['入口'], critical_paths: ['入口到完成'], prototype_boundaries: [], assumptions: [], open_questions: [] };
    writeJson(file, record);
    run(['submit-brief', `--iteration=${path.relative(temp, dir)}`]);
    run(['confirm-brief', `--iteration=${path.relative(temp, dir)}`, '--by=user']);
    const prototyping = readJson(file);
    prototyping.prototype_design.surface_decisions = [{ surface_id: 'main', presentation: 'push', rule_sources_used: ['test'] }];
    writeJson(file, prototyping);
    fs.writeFileSync(path.join(temp, 'wego-app/scenes/测试场景/scene.js'), 'window.WegoApp?.registerScene?.({ routeId: "test" });\n');
    run(['submit-prototype', `--iteration=${path.relative(temp, dir)}`]);
    run(['confirm-prototype', `--iteration=${path.relative(temp, dir)}`, '--by=user']);
    run(['scope', `--iteration=${path.relative(temp, dir)}`], false);
    console.log('业务迭代脚本自测通过：旧 Schema 和旧命令均被拒绝');
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

const commands = {
  init: commandInit,
  'submit-brief': commandSubmitBrief,
  'confirm-brief': commandConfirmBrief,
  'submit-prototype': commandSubmitPrototype,
  'confirm-prototype': commandConfirmPrototype,
  'formalize-product': commandFormalizeProduct,
  'mark-design': commandMarkDesign,
  'check-prototype-snapshot': commandCheckPrototypeSnapshot,
  'mark-implemented': commandMarkImplemented,
  'start-testing': commandStartTesting,
  handoff: commandHandoff,
  freeze: commandFreeze,
  invalidate: commandInvalidate,
  block: commandBlock,
  resume: commandResume,
  cancel: () => commandTerminal('cancelled'),
  supersede: () => commandTerminal('superseded'),
  check: commandCheck,
  test: commandTest,
};

try {
  const handler = commands[command];
  if (!handler) fail(`未知命令：${command}。当前不提供旧命令兼容`);
  handler();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
