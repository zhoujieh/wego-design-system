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
const has = name => rawArgs.includes(`--${name}`);
const ROOT = path.resolve(option('root') || process.cwd());
const SCENES_ROOT = path.join(ROOT, 'wego-app/scenes');
const SCRIPT_FILE = path.resolve(process.argv[1]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[a-z][a-z0-9-]*\d{3}$/;
const REQUIREMENT_RE = /^[a-z][a-z0-9-]*\d{3}-R\d{2,}$/;
const FEATURE_RE = /^[a-z0-9]+(?:[.-][a-z0-9]+)+$/;
const ACTIVE_STATUSES = new Set(['draft', 'awaiting-scope-confirmation', 'product-confirmed', 'design-ready', 'implemented', 'testing', 'accepted', 'accepted-with-risk', 'blocked']);
const ALL_STATUSES = new Set([...ACTIVE_STATUSES, 'cancelled', 'superseded', 'frozen']);
const BLOCKABLE_STATUSES = new Set(['draft', 'awaiting-scope-confirmation', 'product-confirmed', 'design-ready', 'implemented', 'testing']);
const CHANGE_TYPES = new Set(['added', 'changed', 'removed', 'verification-only']);
const DEPTHS = new Set(['functional', 'simulated', 'stub', 'excluded']);
const STAGE_ORDER = new Map([
  ['draft', 0], ['awaiting-scope-confirmation', 1], ['product-confirmed', 2], ['design-ready', 3],
  ['implemented', 4], ['testing', 5], ['accepted', 6], ['accepted-with-risk', 6], ['frozen', 7],
]);

const now = () => new Date().toISOString();
const rel = file => path.relative(ROOT, file).split(path.sep).join('/');
const exists = file => fs.existsSync(file);
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const mkdir = dir => fs.mkdirSync(dir, { recursive: true });
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const unique = values => values.length === new Set(values).size;
const asArray = value => Array.isArray(value) ? value : [];
const hasRefs = value => Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'string' && item.length > 0);
const stageAtLeast = (status, stage) => (STAGE_ORDER.get(status) ?? -1) >= (STAGE_ORDER.get(stage) ?? 99);
const isSafeSceneName = value => typeof value === 'string' && value.trim() === value && value.length > 0 && !/[\\/]/.test(value) && !['.', '..'].includes(value);
const isSafeTitle = value => typeof value === 'string' && value.trim() === value && value.length > 0 && !/[\\/]/.test(value);

function isValidDate(value) {
  if (!DATE_RE.test(value || '')) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonicalize(value[key])]));
  }
  return value;
}

function hashValue(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
}

function productRecordProjection(record) {
  return {
    identity: record.identity,
    scope_revision: record.scope_revision,
    product_scope: record.product_scope,
    features: record.features,
    requirements: record.requirements,
    traceability: asArray(record.traceability).map(item => ({
      requirement_id: item.requirement_id,
      scene: item.scene,
      flow_refs: item.flow_refs,
      node_refs: item.node_refs,
      surface_refs: item.surface_refs,
      exit_result_refs: item.exit_result_refs,
    })),
    affected_scenes: record.affected_scenes,
    affected_runtime: record.affected_runtime,
  };
}

function stageRecordProjection(record, field) {
  return asArray(record.traceability).map(item => ({
    requirement_id: item.requirement_id,
    scene: item.scene,
    [field]: item[field],
  }));
}

function effectiveStatus(record) {
  return record.status === 'blocked' ? record.pause?.resume_status : record.status;
}

function fail(message) {
  throw new Error(message);
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

function identityNames(record) {
  const id = record.identity?.iteration_id;
  const title = record.identity?.title;
  return {
    scope: `${id}-${title}-范围确认.md`,
    handoff: `${id}-${title}-开发交接.md`,
  };
}

function affectedScenes(record) {
  return asArray(record.affected_scenes).map(item => typeof item === 'string'
    ? { scene: item, role: item === record.identity?.primary_scene ? 'primary' : 'related', change_type: 'changed' }
    : item);
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

function affectedRuntimeFiles(record) {
  return asArray(record.affected_runtime).map(item => typeof item === 'string' ? item : item?.file);
}

function iterationRequirementIds(record, scene) {
  return asArray(record.requirements)
    .filter(item => asArray(item.scene_refs).includes(scene))
    .map(item => item.requirement_id);
}

function assertIterationContext(value, record, file, expectedIds) {
  const context = value?.iteration_context;
  if (!context) fail(`${rel(file)} 缺少 iteration_context`);
  if (context.iteration_id !== record.identity.iteration_id) fail(`${rel(file)} iteration_id 与当前迭代不一致`);
  if (context.scope_revision !== record.scope_revision) fail(`${rel(file)} scope_revision 与当前迭代不一致`);
  const actual = [...asArray(context.requirement_ids)].sort();
  const expected = [...expectedIds].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(`${rel(file)} requirement_ids 与当前场景需求不一致`);
}

function validateBasic(record, file) {
  const errors = [];
  const add = message => errors.push(`${rel(file)}：${message}`);
  if (record.schemaVersion !== 1) add('schemaVersion 必须为 1');
  const identity = record.identity || {};
  if (!ID_RE.test(identity.iteration_id || '')) add('identity.iteration_id 必须是小写前缀加三位序号，例如 shop001');
  if (!isSafeTitle(identity.title)) add('identity.title 必须为不含路径分隔符的非空文本');
  if (!isValidDate(identity.date)) add('identity.date 必须为有效 YYYY-MM-DD 日期');
  if (!isSafeSceneName(identity.primary_scene)) add('identity.primary_scene 必须为不含路径分隔符的非空业务场景名');
  if (!ALL_STATUSES.has(record.status)) add(`非法 status：${record.status}`);
  if (record.status === 'blocked' && (!record.pause || !BLOCKABLE_STATUSES.has(record.pause.resume_status))) add('blocked 必须记录可恢复的 pause.resume_status');
  if (!Number.isInteger(record.scope_revision) || record.scope_revision < 1) add('scope_revision 必须为正整数');
  for (const field of ['features', 'requirements', 'traceability', 'affected_scenes', 'affected_runtime', 'change_log']) {
    if (!Array.isArray(record[field])) add(`${field} 必须为数组`);
  }
  const sceneItems = affectedScenes(record);
  const sceneNames = sceneItems.map(item => item?.scene).filter(Boolean);
  if (!unique(sceneNames)) add('affected_scenes.scene 不得重复');
  if (!sceneItems.some(item => item?.scene === identity.primary_scene && item?.role === 'primary')) add('affected_scenes 必须包含唯一主场景');
  if (sceneItems.filter(item => item?.role === 'primary').length !== 1) add('affected_scenes 只能有一个 role=primary');
  for (const item of sceneItems) {
    if (!isSafeSceneName(item?.scene) || !['primary', 'related'].includes(item.role) || !CHANGE_TYPES.has(item.change_type)) add('affected_scenes 每项必须包含合法 scene/role/change_type');
  }
  const related = asArray(identity.related_scenes);
  if (!unique(related)) add('identity.related_scenes 不得重复');
  if (related.some(scene => !sceneNames.includes(scene) || scene === identity.primary_scene)) add('related_scenes 必须对应 affected_scenes 中的 related 场景');
  const affectedRelated = sceneItems.filter(item => item?.role === 'related').map(item => item.scene).sort();
  if (JSON.stringify([...related].sort()) !== JSON.stringify(affectedRelated)) add('identity.related_scenes 必须完整等于 affected_scenes 中的 related 场景');
  const runtimeFiles = affectedRuntimeFiles(record);
  if (!unique(runtimeFiles) || runtimeFiles.some(value => !isBusinessRuntimeFile(value))) add('affected_runtime 必须是唯一且合法的 wego-app 宿主、js、css 或 assets 路径');
  const featureIds = asArray(record.features).map(item => item?.feature_id).filter(Boolean);
  if (!unique(featureIds)) add('feature_id 不得重复');
  for (const item of asArray(record.features)) {
    if (!FEATURE_RE.test(item?.feature_id || '') || !item?.title || !item?.current_behavior || !Array.isArray(item?.scene_refs) || item.scene_refs.length === 0 || item.scene_refs.some(scene => !sceneNames.includes(scene)) || !['active', 'removed'].includes(item?.status)) add(`features.${item?.feature_id || '?'} 字段不完整或场景引用非法`);
  }
  const requirementIds = asArray(record.requirements).map(item => item?.requirement_id).filter(Boolean);
  if (!unique(requirementIds)) add('requirement_id 不得重复');
  for (const item of asArray(record.requirements)) {
    if (!REQUIREMENT_RE.test(item?.requirement_id || '') || !item.requirement_id.startsWith(`${identity.iteration_id}-R`) || !featureIds.includes(item?.feature_id) || !item?.title || !CHANGE_TYPES.has(item?.change_type) || !item?.user_outcome || !Array.isArray(item?.scene_refs) || item.scene_refs.length === 0 || item.scene_refs.some(scene => !sceneNames.includes(scene)) || !Array.isArray(item?.surface_refs) || !DEPTHS.has(item?.prototype_depth) || !Array.isArray(item?.acceptance_criteria) || item.acceptance_criteria.length === 0) add(`requirements.${item?.requirement_id || '?'} 字段不完整或引用非法`);
  }
  const traceKeys = asArray(record.traceability).map(item => `${item?.requirement_id || ''}::${item?.scene || ''}`);
  if (!unique(traceKeys)) add('traceability 的 requirement_id + scene 组合不得重复');
  for (const item of asArray(record.traceability)) {
    const requirement = asArray(record.requirements).find(value => value?.requirement_id === item?.requirement_id);
    if (!requirement || !requirement.scene_refs.includes(item?.scene) || !Array.isArray(item?.flow_refs) || !Array.isArray(item?.node_refs) || !Array.isArray(item?.surface_refs) || !Array.isArray(item?.exit_result_refs)) add(`traceability.${item?.requirement_id || '?'} 字段不完整或场景引用非法`);
  }
  for (const req of asArray(record.requirements).filter(item => item.prototype_depth !== 'excluded')) {
    for (const scene of req.scene_refs) {
      if (!traceKeys.includes(`${req.requirement_id}::${scene}`)) add(`非 excluded 需求 ${req.requirement_id} 在场景 ${scene} 缺少 traceability`);
    }
  }
  const statusForValidation = effectiveStatus(record);
  if (stageAtLeast(statusForValidation, 'product-confirmed') && record.stage_outputs?.product?.valid !== true) add('product-confirmed 及后续状态必须有有效产品阶段结果');
  if (stageAtLeast(statusForValidation, 'design-ready') && record.stage_outputs?.design?.valid !== true) add('design-ready 及后续状态必须有有效设计阶段结果');
  if (stageAtLeast(statusForValidation, 'implemented') && record.stage_outputs?.implementation?.valid !== true) add('implemented 及后续状态必须有有效实现阶段结果');
  if (stageAtLeast(statusForValidation, 'accepted') && record.stage_outputs?.acceptance?.valid !== true) add('accepted 及后续状态必须有有效验收阶段结果');
  const names = identityNames(record);
  const expectedFolder = `${identity.date.replaceAll('-', '')}-${identity.iteration_id}-${identity.title}`;
  if (path.basename(iterationDir(file)) !== expectedFolder) add(`迭代目录必须命名为 ${expectedFolder}`);
  if (path.basename(path.dirname(path.dirname(iterationDir(file)))) !== identity.primary_scene) add('迭代目录必须位于主业务场景的 _iterations 下');
  if (errors.length) fail(errors.join('\n'));
  return names;
}

function validateProduct(record, file) {
  const scope = record.product_scope || {};
  if (!scope.problem || !scope.goal || !Array.isArray(scope.actors) || scope.actors.length === 0 || !Array.isArray(scope.success_criteria) || scope.success_criteria.length === 0 || !Array.isArray(scope.included) || !Array.isArray(scope.excluded) || !Array.isArray(scope.assumptions) || !Array.isArray(scope.open_questions) || !Array.isArray(scope.dependencies)) fail('product_scope 字段不完整');
  if (scope.open_questions.some(item => item?.blocking === true || item?.impact_level === 'core')) fail('仍有阻塞产品问题，不能确认范围');
  if (record.requirements.length === 0) fail('产品范围至少需要一项 requirement');
  for (const item of affectedScenes(record)) {
    if (item.change_type === 'removed') continue;
    const files = specFiles(item.scene);
    if (!exists(files.interaction)) fail(`缺少产品规格：${rel(files.interaction)}`);
    const spec = readJson(files.interaction);
    const readiness = typeof spec.readiness === 'object' ? spec.readiness?.status : spec.readiness;
    if (!['ready', 'ready-with-assumptions'].includes(readiness)) fail(`${rel(files.interaction)} readiness 必须为 ready 或 ready-with-assumptions`);
    assertIterationContext(spec, record, files.interaction, iterationRequirementIds(record, item.scene));
    const flowIds = new Set(asArray(spec.flows).map(value => value?.flow_id));
    const nodeIds = new Set(asArray(spec.flow_nodes).map(value => value?.node_id));
    const surfaceIds = new Set(asArray(spec.surfaces).map(value => value?.surface_id));
    const resultIds = new Set(asArray(spec.exit_results).map(value => value?.result_id || value?.exit_result_id));
    for (const trace of record.traceability.filter(value => value.scene === item.scene)) {
      for (const id of trace.flow_refs) if (!flowIds.has(id)) fail(`traceability ${trace.requirement_id} 引用了不存在的 flow ${id}`);
      for (const id of trace.node_refs) if (!nodeIds.has(id)) fail(`traceability ${trace.requirement_id} 引用了不存在的 node ${id}`);
      for (const id of trace.surface_refs) if (!surfaceIds.has(id)) fail(`traceability ${trace.requirement_id} 引用了不存在的 surface ${id}`);
      for (const id of trace.exit_result_refs) if (!resultIds.has(id)) fail(`traceability ${trace.requirement_id} 引用了不存在的 exit result ${id}`);
    }
  }
}

function validateDesign(record) {
  for (const item of affectedScenes(record)) {
    if (item.change_type === 'removed') continue;
    const files = specFiles(item.scene);
    if (!exists(files.design)) fail(`缺少设计计划：${rel(files.design)}`);
    const plan = readJson(files.design);
    assertIterationContext(plan, record, files.design, iterationRequirementIds(record, item.scene));
    if (asArray(plan.design_gaps).length > 0 || asArray(plan.surface_designs).some(value => value?.match_status === 'gap')) fail(`${rel(files.design)} 仍存在 design gap`);
    const spec = readJson(files.interaction);
    const surfaceIds = asArray(spec.surfaces).map(value => value?.surface_id);
    const designedSurfaceIds = asArray(plan.surface_designs).map(value => value?.surface_id);
    if (!unique(designedSurfaceIds) || designedSurfaceIds.some(id => !surfaceIds.includes(id))) fail(`${rel(files.design)} 包含重复或未知 surface 设计`);
    const designedSurfaces = new Set(designedSurfaceIds);
    for (const surface of asArray(spec.surfaces)) if (!designedSurfaces.has(surface?.surface_id)) fail(`${rel(files.design)} 缺少 surface ${surface?.surface_id} 的设计覆盖`);
  }
  for (const trace of record.traceability) {
    const requirement = record.requirements.find(item => item.requirement_id === trace.requirement_id);
    if (requirement?.prototype_depth !== 'excluded' && !hasRefs(trace.design_refs)) fail(`需求 ${trace.requirement_id} 在场景 ${trace.scene} 缺少合法 design_refs`);
  }
}

function validateImplementation(record) {
  for (const item of affectedScenes(record)) {
    if (item.change_type === 'removed' || item.change_type === 'verification-only') continue;
    const files = specFiles(item.scene);
    if (!exists(files.sceneJs)) fail(`缺少场景实现：${rel(files.sceneJs)}`);
  }
  for (const file of record.affected_runtime) {
    const target = path.join(ROOT, typeof file === 'string' ? file : file?.file || '');
    if (!exists(target)) fail(`affected_runtime 文件不存在：${rel(target)}`);
  }
  for (const req of record.requirements.filter(item => item.prototype_depth !== 'excluded' && item.change_type !== 'verification-only')) {
    for (const scene of req.scene_refs) {
      const trace = record.traceability.find(item => item.requirement_id === req.requirement_id && item.scene === scene);
      if (!trace || !hasRefs(trace.implementation_refs)) fail(`需求 ${req.requirement_id} 在场景 ${scene} 缺少合法 implementation_refs`);
    }
  }
}

function validateAcceptance(record) {
  const required = record.requirements.filter(item => item.prototype_depth !== 'excluded').map(item => item.requirement_id);
  let hasRisk = false;
  for (const item of affectedScenes(record)) {
    if (item.change_type === 'removed' && !iterationRequirementIds(record, item.scene).length) continue;
    const files = specFiles(item.scene);
    if (!exists(files.acceptance)) fail(`缺少验收报告：${rel(files.acceptance)}`);
    const report = readJson(files.acceptance);
    assertIterationContext(report, record, files.acceptance, iterationRequirementIds(record, item.scene));
    if (!['pass', 'pass-with-risk'].includes(report.final_status)) fail(`${rel(files.acceptance)} final_status 必须为 pass 或 pass-with-risk`);
    const automatedErrors = asArray(report?.automated_checks?.errors);
    const exitCodes = asArray(report?.automated_checks?.exit_codes);
    if (automatedErrors.length > 0 || exitCodes.some(code => Number(code) !== 0)) fail(`${rel(files.acceptance)} 自动化检查仍有错误，不能通过`);
    const hardFindings = asArray(report.findings).filter(finding => {
      const severity = String(finding?.severity || finding?.priority || '').toLowerCase();
      const unresolved = !['resolved', 'fixed', 'closed', 'pass'].includes(String(finding?.status || '').toLowerCase());
      return unresolved && ['critical', 'high', 'blocker', 'error', 'p0', 'p1'].includes(severity);
    });
    if (hardFindings.length > 0) fail(`${rel(files.acceptance)} 仍有未解决硬问题，不能通过或 pass-with-risk`);
    if (report.final_status === 'pass-with-risk') hasRisk = true;
    const covered = new Set(asArray(report.requirement_coverage)
      .filter(coverage => coverage?.requirement_id && ['pass', 'pass-with-risk', 'pass-browser-verified'].includes(coverage?.status))
      .map(coverage => coverage.requirement_id));
    const expectedForScene = record.requirements.filter(req => req.prototype_depth !== 'excluded' && req.scene_refs.includes(item.scene)).map(req => req.requirement_id);
    const reportedIds = asArray(report.requirement_coverage).map(coverage => coverage?.requirement_id).filter(Boolean);
    if (!unique(reportedIds) || reportedIds.some(id => !expectedForScene.includes(id))) fail(`${rel(files.acceptance)} 包含重复或未知 requirement_id`);
    for (const id of expectedForScene) if (!covered.has(id)) fail(`${rel(files.acceptance)} 缺少需求 ${id} 的通过结论`);
  }
  if (required.length === 0) fail('迭代没有可验收需求');
  return hasRisk ? 'accepted-with-risk' : 'accepted';
}

function sceneCurrentFiles(scene) {
  const root = path.join(SCENES_ROOT, scene);
  return listFiles(root).filter(file => {
    const relative = rel(file);
    return !relative.includes('/_iterations/') && !relative.includes('/_spec/archive/');
  });
}

function currentFiles(record, { includeAcceptance = true } = {}) {
  const files = [];
  for (const item of affectedScenes(record)) {
    for (const file of sceneCurrentFiles(item.scene)) {
      if (!includeAcceptance && file === specFiles(item.scene).acceptance) continue;
      files.push(file);
    }
  }
  for (const item of affectedRuntimeFiles(record)) {
    const file = path.join(ROOT, item);
    if (exists(file) && fs.statSync(file).isFile()) files.push(file);
  }
  return [...new Set(files)];
}

function fingerprintFiles(files) {
  return Object.fromEntries(files.map(file => [rel(file), sha256(file)]).sort(([a], [b]) => a.localeCompare(b)));
}

function verifyFingerprints(fingerprints, label) {
  if (!fingerprints || typeof fingerprints !== 'object') fail(`${label} 缺少文件指纹`);
  for (const [name, hash] of Object.entries(fingerprints)) {
    const target = path.join(ROOT, name);
    if (!exists(target) || sha256(target) !== hash) fail(`${label}已失效：${name}`);
  }
}

function validateStageIntegrity(record, stage) {
  const output = record.stage_outputs?.[stage];
  if (output?.valid !== true) fail(`${stage} 阶段结果无效`);
  if (stage === 'product') {
    if (output.record_fingerprint !== hashValue(productRecordProjection(record))) fail('已确认产品范围已变化，必须先失效 product 阶段并重新确认');
    verifyFingerprints(output.fingerprints, '产品规格');
  } else if (stage === 'design') {
    if (output.record_fingerprint !== hashValue(stageRecordProjection(record, 'design_refs'))) fail('设计追踪引用已变化，必须先失效 design 阶段');
    verifyFingerprints(output.fingerprints, '设计计划');
  } else if (stage === 'implementation') {
    if (output.record_fingerprint !== hashValue(stageRecordProjection(record, 'implementation_refs'))) fail('实现追踪引用已变化，必须先失效 implementation 阶段');
    verifyFingerprints(output.files, '实现结果');
  } else if (stage === 'acceptance') {
    if (output.record_fingerprint !== hashValue(stageRecordProjection(record, 'acceptance_refs'))) fail('验收追踪引用已变化，必须先失效 acceptance 阶段');
    verifyFingerprints(output.fingerprints, '验收结果');
  }
}

function renderScope(record) {
  const lines = [
    `# ${record.identity.iteration_id}-${record.identity.title} 范围确认`, '',
    `- 主业务：${record.identity.primary_scene}`,
    `- 关联业务：${record.identity.related_scenes.join('、') || '无'}`,
    `- 范围版本：${record.scope_revision}`, '',
    '## 目标', '', record.product_scope.goal, '',
    '## 成功标准', '', ...record.product_scope.success_criteria.map(item => `- ${typeof item === 'string' ? item : item.description}`), '',
    '## 本轮功能变化', '',
    '| 需求编号 | 功能 | 类型 | 用户结果 | 场景 | 页面/Surface |', '| --- | --- | --- | --- | --- | --- |',
    ...record.requirements.map(item => `| ${item.requirement_id} | ${item.title} | ${item.change_type} | ${item.user_outcome} | ${item.scene_refs.join('、')} | ${item.surface_refs.join('、') || '无独立页面'} |`), '',
    '## 包含范围', '', ...record.product_scope.included.map(item => `- ${typeof item === 'string' ? item : item.description}`), '',
    '## 排除范围', '', ...record.product_scope.excluded.map(item => `- ${typeof item === 'string' ? item : item.description}`), '',
    '## 假设与依赖', '', ...[...record.product_scope.assumptions, ...record.product_scope.dependencies].map(item => `- ${typeof item === 'string' ? item : item.description}`), '',
    '> 本文由 iteration.json 生成；正式范围以 iteration.json 和各场景 interaction_spec 为准。',
  ];
  return `${lines.join('\n')}\n`;
}

function renderHandoff(record) {
  const coverage = record.requirements.map(req => {
    const trace = record.traceability.find(item => item.requirement_id === req.requirement_id) || {};
    return `| ${req.requirement_id} | ${req.title} | ${req.change_type} | ${req.user_outcome} | ${req.scene_refs.join('、')} | ${asArray(trace.acceptance_refs).join('、') || '见验收报告'} |`;
  });
  const lines = [
    `# ${record.identity.iteration_id}-${record.identity.title} 开发交接`, '',
    `- 主业务：${record.identity.primary_scene}`,
    `- 关联业务：${record.identity.related_scenes.join('、') || '无'}`,
    `- 验收状态：${record.status}`,
    `- 范围版本：${record.scope_revision}`, '',
    '## 迭代目标', '', record.product_scope.goal, '',
    '## 功能变化与验收', '',
    '| 需求编号 | 功能 | 类型 | 用户结果 | 页面/场景 | 验收 |', '| --- | --- | --- | --- | --- | --- |', ...coverage, '',
    '## 交付后的相关功能状态', '', ...record.features.map(item => `- **${item.title}**（${item.feature_id}）：${item.current_behavior}`), '',
    '## 页面与数据范围', '', ...affectedScenes(record).map(item => `- ${item.scene}：${item.change_type}，${item.role === 'primary' ? '主业务' : '关联业务'}`), '',
    '## 页面与流程明细', '', ...renderSceneDetails(record), '',
    '## 原型与开发边界', '', ...record.requirements.map(item => `- ${item.requirement_id}：${item.prototype_depth}`), '',
    '## 风险与依赖', '', ...[...record.product_scope.assumptions, ...record.product_scope.dependencies].map(item => `- ${typeof item === 'string' ? item : item.description}`), '',
    '## 文件索引', '', ...affectedScenes(record).flatMap(item => {
      const files = specFiles(item.scene);
      return [files.interaction, files.design, files.acceptance].filter(exists).map(file => `- ${rel(file)}`);
    }), '',
    '> 本文由正式迭代、规格和验收报告生成；不代表真实接口、推送或生产部署已经完成，除非验收报告明确记录并验证。',
  ];
  return `${lines.join('\n')}\n`;
}

function renderSceneDetails(record) {
  const lines = [];
  for (const item of affectedScenes(record)) {
    const file = specFiles(item.scene).interaction;
    if (!exists(file)) continue;
    const spec = readJson(file);
    lines.push(`### ${item.scene}`, '');
    for (const surface of asArray(spec.surfaces)) {
      lines.push(`- 页面/Surface ${surface.surface_id}：${surface.purpose || surface.role || '见产品规格'}；承载 ${surface.carrier || '见设计计划'}`);
    }
    for (const flow of asArray(spec.flows)) {
      lines.push(`- 流程 ${flow.flow_id}：${asArray(flow.steps).join(' → ') || '见产品规格'}；完成条件 ${flow.exit_condition || '见退出结果'}`);
    }
    for (const handoff of asArray(spec.data_handoffs)) {
      lines.push(`- 数据交接 ${handoff.handoff_id}：${handoff.source_node} → ${handoff.target_node}；数据 ${asArray(handoff.payload_content_refs).join('、') || '无'}；返回策略 ${handoff.reset_policy || '未声明'}`);
    }
    lines.push('');
  }
  return lines;
}

function loadAndValidate(file) {
  const record = readJson(file);
  const names = validateBasic(record, file);
  return { record, names };
}

function saveRecord(file, record, action, detail = {}) {
  record.change_log.push({ at: now(), action, ...detail });
  writeJson(file, record);
}

function activeIterationClaims(record) {
  return new Set([
    ...affectedScenes(record).map(item => `scene:${item.scene}`),
    ...affectedRuntimeFiles(record).map(item => `runtime:${item}`),
  ]);
}

function assertNoActiveOverlap(record, file) {
  const claims = activeIterationClaims(record);
  for (const otherFile of findIterationFiles()) {
    if (path.resolve(otherFile) === path.resolve(file)) continue;
    const other = readJson(otherFile);
    if (!ACTIVE_STATUSES.has(other.status)) continue;
    const overlap = [...activeIterationClaims(other)].filter(value => claims.has(value));
    if (overlap.length > 0) fail(`与活跃迭代 ${other.identity?.iteration_id || rel(otherFile)} 范围冲突：${overlap.join('、')}；同一场景或宿主文件必须串行`);
  }
}

function commandInit() {
  const scene = option('scene');
  const id = option('id');
  const title = option('title');
  const date = option('date') || new Date().toISOString().slice(0, 10);
  if (!scene || !id || !title) fail('init 必须提供 --scene、--id、--title');
  if (!isSafeSceneName(scene) || !ID_RE.test(id) || !isValidDate(date) || !isSafeTitle(title)) fail('init 参数格式非法');
  for (const existingFile of findIterationFiles()) {
    const existing = readJson(existingFile);
    if (existing.identity?.iteration_id === id) fail(`iteration_id 已存在：${id}`);
    if (ACTIVE_STATUSES.has(existing.status) && affectedScenes(existing).some(item => item.scene === scene)) fail(`场景 ${scene} 已被活跃迭代 ${existing.identity?.iteration_id} 认领`);
  }
  const sceneAlreadyExists = exists(path.join(SCENES_ROOT, scene));
  const dir = path.join(SCENES_ROOT, scene, '_iterations', `${date.replaceAll('-', '')}-${id}-${title}`);
  const file = path.join(dir, 'iteration.json');
  if (exists(file)) fail(`迭代已存在：${rel(file)}`);
  mkdir(dir);
  const record = {
    schemaVersion: 1,
    identity: { iteration_id: id, title, date, primary_scene: scene, related_scenes: [] },
    status: 'draft', scope_revision: 1, base_fingerprint: {},
    product_scope: { problem: '', goal: '', actors: [], success_criteria: [], included: [], excluded: [], assumptions: [], open_questions: [], dependencies: [] },
    features: [], requirements: [], traceability: [],
    affected_scenes: [{ scene, role: 'primary', change_type: sceneAlreadyExists ? 'changed' : 'added' }],
    affected_runtime: [],
    stage_outputs: { product: { valid: false }, design: { valid: false }, implementation: { valid: false }, acceptance: { valid: false } },
    change_log: [{ at: now(), action: 'init' }], freeze: null,
  };
  writeJson(file, record);
  console.log(rel(dir));
}

function commandScope() {
  const file = getIterationFile();
  const { record, names } = loadAndValidate(file);
  if (!['draft', 'awaiting-scope-confirmation'].includes(record.status)) fail('只有 draft 或 awaiting-scope-confirmation 可以生成范围确认文档；已确认范围变化请先 invalidate product');
  assertNoActiveOverlap(record, file);
  validateProduct(record, file);
  const target = path.join(iterationDir(file), names.scope);
  fs.writeFileSync(target, renderScope(record));
  record.status = 'awaiting-scope-confirmation';
  record.stage_outputs.product = { valid: false, scope_document: rel(target), generated_at: now() };
  saveRecord(file, record, 'scope-generated');
  console.log(rel(target));
}

function commandConfirmScope() {
  const file = getIterationFile();
  const { record, names } = loadAndValidate(file);
  if (record.status !== 'awaiting-scope-confirmation') fail('只有 awaiting-scope-confirmation 可以确认范围');
  assertNoActiveOverlap(record, file);
  validateProduct(record, file);
  const target = path.join(iterationDir(file), names.scope);
  if (!exists(target) || fs.readFileSync(target, 'utf8') !== renderScope(record)) fail('范围确认文档缺失或已过期，请先执行 scope');
  record.status = 'product-confirmed';
  record.stage_outputs.product = {
    valid: true,
    scope_document: rel(target),
    confirmed_at: now(),
    confirmed_by: option('by') || 'user',
    record_fingerprint: hashValue(productRecordProjection(record)),
    fingerprints: fingerprintFiles(affectedScenes(record).map(item => specFiles(item.scene).interaction).filter(exists)),
  };
  saveRecord(file, record, 'scope-confirmed');
}

function commandMarkDesign() {
  const file = getIterationFile();
  const { record } = loadAndValidate(file);
  if (record.status !== 'product-confirmed') fail('只有 product-confirmed 可以标记设计完成');
  validateByStatus(record, file);
  validateDesign(record);
  record.status = 'design-ready';
  record.base_fingerprint = fingerprintFiles(currentFiles(record));
  record.stage_outputs.design = {
    valid: true,
    completed_at: now(),
    record_fingerprint: hashValue(stageRecordProjection(record, 'design_refs')),
    fingerprints: fingerprintFiles(affectedScenes(record).map(item => specFiles(item.scene).design).filter(exists)),
  };
  saveRecord(file, record, 'design-ready');
}

function commandCheckBase() {
  const file = getIterationFile();
  const { record } = loadAndValidate(file);
  if (record.status !== 'design-ready') fail('只有 design-ready 可以检查实现基线');
  validateByStatus(record, file);
  for (const [name, hash] of Object.entries(record.base_fingerprint || {})) {
    const target = path.join(ROOT, name);
    if (!exists(target) || sha256(target) !== hash) fail(`实现基线已变化：${name}，必须重新检查产品或设计`);
  }
  record.stage_outputs.design.base_checked_at = now();
  record.stage_outputs.design.base_checked_fingerprint = hashValue(record.base_fingerprint);
  saveRecord(file, record, 'implementation-base-checked');
}

function commandMarkImplemented() {
  const file = getIterationFile();
  const { record } = loadAndValidate(file);
  if (record.status !== 'design-ready') fail('只有 design-ready 可以标记实现完成');
  validateByStatus(record, file);
  if (!record.stage_outputs.design.base_checked_at || record.stage_outputs.design.base_checked_fingerprint !== hashValue(record.base_fingerprint)) fail('实现前必须先执行 check-base，且检查后基线不得变化');
  validateImplementation(record);
  record.status = 'implemented';
  record.stage_outputs.implementation = {
    valid: true,
    completed_at: now(),
    record_fingerprint: hashValue(stageRecordProjection(record, 'implementation_refs')),
    files: fingerprintFiles(currentFiles(record, { includeAcceptance: false })),
  };
  saveRecord(file, record, 'implemented');
}

function commandStartTesting() {
  const file = getIterationFile();
  const { record } = loadAndValidate(file);
  if (record.status !== 'implemented') fail('只有 implemented 可以开始验收');
  validateByStatus(record, file);
  record.status = 'testing';
  saveRecord(file, record, 'testing-started');
}

function copySnapshots(record, dir) {
  for (const item of affectedScenes(record)) {
    const source = specFiles(item.scene);
    const targetDir = path.join(dir, 'scenes', item.scene);
    mkdir(targetDir);
    for (const [name, file] of [['interaction_spec.json', source.interaction], ['design_plan.json', source.design], ['acceptance_report.json', source.acceptance]]) {
      if (exists(file)) fs.copyFileSync(file, path.join(targetDir, name));
    }
  }
}

function commandHandoff() {
  const file = getIterationFile();
  const { record, names } = loadAndValidate(file);
  if (record.status !== 'testing') fail('只有 testing 可以生成开发交接');
  validateByStatus(record, file);
  record.status = validateAcceptance(record);
  for (const trace of record.traceability) {
    if (!hasRefs(trace.acceptance_refs)) trace.acceptance_refs = [`${trace.scene}:requirement_coverage:${trace.requirement_id}`];
  }
  const dir = iterationDir(file);
  copySnapshots(record, dir);
  const target = path.join(dir, names.handoff);
  fs.writeFileSync(target, renderHandoff(record));
  record.stage_outputs.acceptance = {
    valid: true,
    completed_at: now(),
    handoff_document: rel(target),
    final_status: record.status,
    record_fingerprint: hashValue(stageRecordProjection(record, 'acceptance_refs')),
    fingerprints: fingerprintFiles(currentFiles(record)),
  };
  saveRecord(file, record, 'handoff-generated');
  console.log(rel(target));
}

function commandInvalidate() {
  const file = getIterationFile();
  const { record } = loadAndValidate(file);
  if (['frozen', 'cancelled', 'superseded'].includes(record.status)) fail('冻结、取消或已替代迭代不得失效或修改');
  const stage = option('stage');
  if (!['product', 'design', 'implementation', 'acceptance'].includes(stage)) fail('invalidate 必须提供 --stage=product|design|implementation|acceptance');
  const minimum = { product: 'product-confirmed', design: 'design-ready', implementation: 'implemented', acceptance: 'testing' }[stage];
  if (!stageAtLeast(effectiveStatus(record), minimum)) fail(`当前状态尚未到达 ${stage} 阶段，不能向前推进式失效`);
  const mapping = { product: 'awaiting-scope-confirmation', design: 'product-confirmed', implementation: 'design-ready', acceptance: 'implemented' };
  const affected = { product: ['product', 'design', 'implementation', 'acceptance'], design: ['design', 'implementation', 'acceptance'], implementation: ['implementation', 'acceptance'], acceptance: ['acceptance'] }[stage];
  for (const key of affected) record.stage_outputs[key] = { valid: false, invalidated_at: now(), reason: option('reason') || '上游内容发生变化' };
  if (stage === 'product') record.scope_revision += 1;
  if (['product', 'design'].includes(stage)) record.base_fingerprint = {};
  if (stage === 'implementation') {
    record.base_fingerprint = fingerprintFiles(currentFiles(record));
    delete record.stage_outputs.design.base_checked_at;
    delete record.stage_outputs.design.base_checked_fingerprint;
  }
  record.status = mapping[stage];
  delete record.pause;
  record.freeze = null;
  saveRecord(file, record, 'invalidated', { stage, reason: option('reason') || '上游内容发生变化' });
}

function commandClose(status) {
  const file = getIterationFile();
  const { record } = loadAndValidate(file);
  if (['frozen', 'cancelled', 'superseded'].includes(record.status)) fail('冻结、取消或已替代迭代不得再次关闭');
  if (!option('reason')) fail(`${status} 必须提供 --reason`);
  if (status === 'superseded' && !option('replacement')) fail('supersede 必须提供 --replacement');
  record.status = status;
  delete record.pause;
  record.closure = { status, reason: option('reason'), replacement_iteration: option('replacement') || null, at: now() };
  saveRecord(file, record, status);
}

function commandBlock() {
  const file = getIterationFile();
  const { record } = loadAndValidate(file);
  if (!BLOCKABLE_STATUSES.has(record.status)) fail('当前状态不能进入 blocked');
  if (!option('reason')) fail('block 必须提供 --reason');
  validateByStatus(record, file);
  record.pause = { resume_status: record.status, reason: option('reason'), blocked_at: now() };
  record.status = 'blocked';
  saveRecord(file, record, 'blocked', { reason: option('reason'), resume_status: record.pause.resume_status });
}

function commandResume() {
  const file = getIterationFile();
  const { record } = loadAndValidate(file);
  if (record.status !== 'blocked' || !record.pause?.resume_status) fail('只有 blocked 可以恢复');
  const resumeStatus = record.pause.resume_status;
  record.status = resumeStatus;
  validateByStatus(record, file);
  const pause = record.pause;
  delete record.pause;
  saveRecord(file, record, 'resumed', { resumed_from: resumeStatus, blocked_at: pause.blocked_at, reason: pause.reason });
}

function commandFreeze() {
  const file = getIterationFile();
  const { record, names } = loadAndValidate(file);
  if (!['accepted', 'accepted-with-risk'].includes(record.status)) fail('只有 accepted/accepted-with-risk 可以冻结');
  validateByStatus(record, file);
  const dir = iterationDir(file);
  const handoff = path.join(dir, names.handoff);
  if (!exists(handoff) || fs.readFileSync(handoff, 'utf8') !== renderHandoff(record)) fail('开发交接文档缺失或已过期');
  const current = currentFiles(record);
  const currentFingerprints = fingerprintFiles(current);
  const preFreezeArtifacts = listFiles(dir).filter(value => path.basename(value) !== 'freeze.json');
  const gitCommit = gitCommitForFiles([...current, ...preFreezeArtifacts]);
  record.status = 'frozen';
  record.freeze = {
    frozen_at: now(),
    final_status: record.stage_outputs.acceptance.final_status,
    current_fingerprint: hashValue(currentFingerprints),
  };
  saveRecord(file, record, 'frozen');
  const iterationArtifacts = listFiles(dir).filter(value => path.basename(value) !== 'freeze.json');
  const freeze = {
    schemaVersion: 1,
    iteration_id: record.identity.iteration_id,
    frozen_at: record.freeze.frozen_at,
    final_status: record.freeze.final_status,
    iteration_files: fingerprintFiles(iterationArtifacts),
    current_files: currentFingerprints,
    git_commit: gitCommit,
  };
  writeJson(path.join(dir, 'freeze.json'), freeze);
}

function gitCommitForFiles(files) {
  const names = [...new Set(files.map(rel))];
  const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
  if (head.status !== 0 || names.length === 0) return null;
  const status = spawnSync('git', ['status', '--porcelain', '--', ...names], { cwd: ROOT, encoding: 'utf8' });
  return status.status === 0 && status.stdout.trim() === '' ? head.stdout.trim() : null;
}

function listFiles(dir) {
  if (!exists(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(target));
    else if (entry.isFile()) out.push(target);
  }
  return out;
}

function findIterationFiles() {
  if (!exists(SCENES_ROOT)) return [];
  const found = [];
  for (const scene of fs.readdirSync(SCENES_ROOT, { withFileTypes: true }).filter(entry => entry.isDirectory())) {
    const root = path.join(SCENES_ROOT, scene.name, '_iterations');
    if (!exists(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true }).filter(value => value.isDirectory())) {
      const file = path.join(root, entry.name, 'iteration.json');
      if (exists(file)) found.push(file);
    }
  }
  return found;
}

function validateFreeze(record, file) {
  const freezeFile = path.join(iterationDir(file), 'freeze.json');
  if (!exists(freezeFile)) fail(`${rel(freezeFile)} 缺失`);
  const freeze = readJson(freezeFile);
  if (freeze.schemaVersion !== 1 || freeze.iteration_id !== record.identity.iteration_id || freeze.frozen_at !== record.freeze?.frozen_at || freeze.final_status !== record.freeze?.final_status) fail('freeze.json 与 iteration.json 不一致');
  const expectedIterationFiles = fingerprintFiles(listFiles(iterationDir(file)).filter(value => path.basename(value) !== 'freeze.json'));
  if (JSON.stringify(freeze.iteration_files || {}) !== JSON.stringify(expectedIterationFiles)) fail('冻结迭代归档文件已新增、删除或变化');
  if (!freeze.current_files || typeof freeze.current_files !== 'object') fail('freeze.json 缺少冻结时当前文件指纹');
  if (record.freeze?.current_fingerprint !== hashValue(freeze.current_files)) fail('freeze.json 当前文件指纹清单已变化');
  if (freeze.git_commit !== null && !/^[0-9a-f]{40}$/.test(freeze.git_commit || '')) fail('freeze.json git_commit 必须为真实提交哈希或 null');
}

function validateByStatus(record, file) {
  validateBasic(record, file);
  if (record.status === 'frozen') {
    validateFreeze(record, file);
    return;
  }
  const statusForValidation = effectiveStatus(record);
  if (stageAtLeast(statusForValidation, 'product-confirmed')) {
    validateProduct(record, file);
    validateStageIntegrity(record, 'product');
  }
  if (stageAtLeast(statusForValidation, 'design-ready')) {
    validateDesign(record);
    validateStageIntegrity(record, 'design');
  }
  if (stageAtLeast(statusForValidation, 'implemented')) {
    validateImplementation(record);
    validateStageIntegrity(record, 'implementation');
  }
  if (stageAtLeast(statusForValidation, 'accepted')) {
    validateAcceptance(record);
    validateStageIntegrity(record, 'acceptance');
  }
}

function changedSceneFromFile(value) {
  const match = value.match(/^wego-app\/scenes\/([^/]+)\/(.+)$/);
  if (!match || match[2].startsWith('_iterations/') || match[2].startsWith('_spec/archive/')) return null;
  if (match[2] === '_spec/interaction_spec.json') return { scene: match[1], kind: match[2] };
  if (match[2] === '_spec/design_plan.json') return { scene: match[1], kind: match[2] };
  if (match[2] === '_spec/acceptance_report.json') return { scene: match[1], kind: match[2] };
  if (match[2].startsWith('_spec/')) return { scene: match[1], kind: 'spec' };
  return { scene: match[1], kind: 'runtime' };
}

function activeStatusCanClaim(status, kind) {
  if (kind === '_spec/interaction_spec.json') return ACTIVE_STATUSES.has(status);
  if (kind === 'spec') return ACTIVE_STATUSES.has(status);
  if (kind === '_spec/design_plan.json') return ['product-confirmed', 'design-ready', 'implemented', 'testing', 'accepted', 'accepted-with-risk'].includes(status);
  if (kind === 'runtime') return ['design-ready', 'implemented', 'testing', 'accepted', 'accepted-with-risk'].includes(status);
  if (kind === '_spec/acceptance_report.json') return ['implemented', 'testing', 'accepted', 'accepted-with-risk'].includes(status);
  return false;
}

function isBusinessRuntimeFile(value) {
  return typeof value === 'string'
    && !value.includes('\\')
    && !path.posix.isAbsolute(value)
    && path.posix.normalize(value) === value
    && /^wego-app\/(?:index\.html|js\/.+|css\/.+|assets\/.+)$/.test(value);
}

function validateChangedClaims(records) {
  const changedFiles = options('changed-file');
  for (const changed of changedFiles) {
    const sceneChange = changedSceneFromFile(changed);
    const runtimeChange = !sceneChange && isBusinessRuntimeFile(changed);
    if (!sceneChange && !runtimeChange) continue;
    const target = path.join(ROOT, changed);
    const currentHash = exists(target) ? sha256(target) : null;
    const claimed = records.some(({ file, record }) => {
      const affected = sceneChange ? affectedScenes(record).find(item => item.scene === sceneChange.scene) : null;
      const runtimeFiles = asArray(record.affected_runtime).map(item => typeof item === 'string' ? item : item?.file);
      if (sceneChange && !affected) return false;
      if (runtimeChange && !runtimeFiles.includes(changed)) return false;
      const kind = runtimeChange ? 'runtime' : sceneChange.kind;
      if (sceneChange && kind === 'runtime' && affected.change_type === 'verification-only') return false;
      if (activeStatusCanClaim(record.status, kind)) return true;
      if (record.status !== 'frozen') return false;
      if (sceneChange && currentHash === null && affected.change_type === 'removed') return true;
      const freezeFile = path.join(iterationDir(file), 'freeze.json');
      if (!exists(freezeFile)) return false;
      return readJson(freezeFile).current_files?.[changed] === currentHash;
    });
    if (!claimed) fail(`业务场景变更未归属有效迭代：${changed}`);
  }
}

function commandCheck() {
  const single = getIterationFile(false);
  const files = single ? [single] : findIterationFiles();
  const ids = [];
  const records = [];
  for (const file of files) {
    const record = readJson(file);
    validateByStatus(record, file);
    ids.push(record.identity.iteration_id);
    records.push({ file, record });
  }
  if (!unique(ids)) fail('全仓 iteration_id 必须唯一');
  validateChangedClaims(records);
  console.log(`业务迭代检查通过：${files.length} 个迭代`);
}

function commandTest() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-iteration-test-'));
  try {
    mkdir(path.join(temp, 'wego-app/scenes/测试场景/_spec'));
    mkdir(path.join(temp, 'wego-app/scenes/关联场景/_spec'));
    const run = (args, ok = true) => {
      const result = spawnSync(process.execPath, [SCRIPT_FILE, ...args, `--root=${temp}`], { encoding: 'utf8' });
      if ((result.status === 0) !== ok) fail(`测试命令失败：${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
      return result;
    };
    const init = run(['init', '--scene=测试场景', '--id=test001', '--title=测试迭代', '--date=2026-07-11']);
    const dir = path.join(temp, init.stdout.trim());
    const file = path.join(dir, 'iteration.json');
    run(['init', '--scene=../越界', '--id=bad001', '--title=非法', '--date=2026-07-11'], false);
    run(['init', '--scene=测试场景', '--id=test099', '--title=重叠迭代', '--date=2026-07-11'], false);
    run(['invalidate', `--iteration=${relFor(temp, dir)}`, '--stage=design', '--reason=非法前进'], false);
    fs.writeFileSync(path.join(temp, 'wego-app/scenes/测试场景/scene.js'), 'draft\n');
    mkdir(path.join(temp, 'wego-app/js'));
    fs.writeFileSync(path.join(temp, 'wego-app/js/routes.js'), 'draft\n');
    run(['check', '--changed-file=wego-app/scenes/测试场景/scene.js'], false);
    run(['scope', `--iteration=${relFor(temp, dir)}`], false);
    const record = readJson(file);
    record.identity.related_scenes = ['关联场景'];
    record.affected_scenes.push({ scene: '关联场景', role: 'related', change_type: 'changed' });
    record.product_scope = { problem: '缺少测试', goal: '完成工作流测试', actors: ['用户'], success_criteria: ['可以交付'], included: ['主流程'], excluded: [], assumptions: [], open_questions: [], dependencies: [] };
    record.features = [{ feature_id: 'test.workflow', title: '测试能力', current_behavior: '能够跨场景完成', scene_refs: ['测试场景', '关联场景'], status: 'active' }];
    record.requirements = [{ requirement_id: 'test001-R01', feature_id: 'test.workflow', title: '完成测试', change_type: 'added', user_outcome: '跨场景完成', scene_refs: ['测试场景', '关联场景'], surface_refs: ['test-main', 'related-main'], prototype_depth: 'functional', acceptance_criteria: ['流程通过'] }];
    record.traceability = [
      { requirement_id: 'test001-R01', scene: '测试场景', flow_refs: ['test-flow'], node_refs: ['test-node'], surface_refs: ['test-main'], exit_result_refs: ['test-result'] },
      { requirement_id: 'test001-R01', scene: '关联场景', flow_refs: ['related-flow'], node_refs: ['related-node'], surface_refs: ['related-main'], exit_result_refs: ['related-result'] },
    ];
    record.affected_runtime = ['wego-app/js/routes.js'];
    writeJson(file, record);
    writeJson(path.join(temp, 'wego-app/scenes/测试场景/_spec/interaction_spec.json'), { iteration_context: { iteration_id: 'test001', scope_revision: 1, requirement_ids: ['test001-R01'] }, flows: [{ flow_id: 'test-flow' }], flow_nodes: [{ node_id: 'test-node' }], surfaces: [{ surface_id: 'test-main' }], exit_results: [{ result_id: 'test-result' }], readiness: { status: 'ready' } });
    writeJson(path.join(temp, 'wego-app/scenes/关联场景/_spec/interaction_spec.json'), { iteration_context: { iteration_id: 'test001', scope_revision: 1, requirement_ids: ['test001-R01'] }, flows: [{ flow_id: 'related-flow' }], flow_nodes: [{ node_id: 'related-node' }], surfaces: [{ surface_id: 'related-main' }], exit_results: [{ result_id: 'related-result' }], readiness: { status: 'ready' } });
    run(['scope', `--iteration=${relFor(temp, dir)}`]);
    run(['confirm-scope', `--iteration=${relFor(temp, dir)}`, '--by=user']);
    run(['scope', `--iteration=${relFor(temp, dir)}`], false);
    const changedScope = readJson(file);
    changedScope.product_scope.goal = '未重新确认的目标';
    writeJson(file, changedScope);
    run(['check', `--iteration=${relFor(temp, dir)}`], false);
    changedScope.product_scope.goal = '完成工作流测试';
    writeJson(file, changedScope);
    run(['block', `--iteration=${relFor(temp, dir)}`, '--reason=等待设计系统缺口']);
    if (readJson(file).status !== 'blocked') fail('block 必须进入 blocked');
    run(['resume', `--iteration=${relFor(temp, dir)}`]);
    if (readJson(file).status !== 'product-confirmed') fail('resume 必须回到阻塞前状态');
    writeJson(path.join(temp, 'wego-app/scenes/测试场景/_spec/design_plan.json'), { iteration_context: { iteration_id: 'test001', scope_revision: 1, requirement_ids: ['test001-R01'] }, design_gaps: [{ id: 'missing' }], surface_designs: [{ surface_id: 'test-main', match_status: 'gap' }] });
    run(['mark-design', `--iteration=${relFor(temp, dir)}`], false);
    writeJson(path.join(temp, 'wego-app/scenes/测试场景/_spec/design_plan.json'), { iteration_context: { iteration_id: 'test001', scope_revision: 1, requirement_ids: ['test001-R01'] }, design_gaps: [], surface_designs: [{ surface_id: 'test-main', match_status: 'fallback' }] });
    writeJson(path.join(temp, 'wego-app/scenes/关联场景/_spec/design_plan.json'), { iteration_context: { iteration_id: 'test001', scope_revision: 1, requirement_ids: ['test001-R01'] }, design_gaps: [], surface_designs: [{ surface_id: 'related-main', match_status: 'fallback' }] });
    run(['mark-design', `--iteration=${relFor(temp, dir)}`], false);
    const designed = readJson(file);
    designed.traceability[0].design_refs = ['surface_designs:test-main'];
    designed.traceability[1].design_refs = ['surface_designs:related-main'];
    writeJson(file, designed);
    run(['mark-design', `--iteration=${relFor(temp, dir)}`]);
    run(['check', '--changed-file=wego-app/scenes/测试场景/scene.js']);
    run(['check', '--changed-file=wego-app/js/routes.js']);
    run(['invalidate', `--iteration=${relFor(temp, dir)}`, '--stage=design', '--reason=设计调整']);
    if (readJson(file).status !== 'product-confirmed') fail('设计失效后必须回到 product-confirmed');
    run(['mark-design', `--iteration=${relFor(temp, dir)}`]);
    run(['check-base', `--iteration=${relFor(temp, dir)}`]);
    const updated = readJson(file);
    updated.traceability[0].implementation_refs = ['wego-app/scenes/测试场景/scene.js'];
    updated.traceability[1].implementation_refs = ['wego-app/scenes/关联场景/scene.js'];
    writeJson(file, updated);
    fs.writeFileSync(path.join(temp, 'wego-app/scenes/测试场景/scene.js'), 'window.WegoApp?.registerScene?.({ routeId: "test" });\n');
    fs.writeFileSync(path.join(temp, 'wego-app/scenes/关联场景/scene.js'), 'window.WegoApp?.registerScene?.({ routeId: "related" });\n');
    run(['mark-implemented', `--iteration=${relFor(temp, dir)}`]);
    run(['start-testing', `--iteration=${relFor(temp, dir)}`]);
    writeJson(path.join(temp, 'wego-app/scenes/测试场景/_spec/acceptance_report.json'), { iteration_context: { iteration_id: 'test001', scope_revision: 1, requirement_ids: ['test001-R01'] }, requirement_coverage: [{ requirement_id: 'test001-R01', status: 'fail' }], final_status: 'fail' });
    run(['handoff', `--iteration=${relFor(temp, dir)}`], false);
    writeJson(path.join(temp, 'wego-app/scenes/测试场景/_spec/acceptance_report.json'), { iteration_context: { iteration_id: 'test001', scope_revision: 1, requirement_ids: ['test001-R01'] }, requirement_coverage: [{ requirement_id: 'test001-R01', status: 'pass' }], final_status: 'pass' });
    writeJson(path.join(temp, 'wego-app/scenes/关联场景/_spec/acceptance_report.json'), { iteration_context: { iteration_id: 'test001', scope_revision: 1, requirement_ids: ['test001-R01'] }, requirement_coverage: [{ requirement_id: 'test001-R01', status: 'pass' }], final_status: 'pass' });
    run(['handoff', `--iteration=${relFor(temp, dir)}`]);
    run(['scope', `--iteration=${relFor(temp, dir)}`], false);
    const acceptedRuntime = fs.readFileSync(path.join(temp, 'wego-app/scenes/测试场景/scene.js'), 'utf8');
    fs.appendFileSync(path.join(temp, 'wego-app/scenes/测试场景/scene.js'), '// 未失效修改\n');
    run(['check', `--iteration=${relFor(temp, dir)}`], false);
    fs.writeFileSync(path.join(temp, 'wego-app/scenes/测试场景/scene.js'), acceptedRuntime);
    run(['freeze', `--iteration=${relFor(temp, dir)}`]);
    run(['check', `--iteration=${relFor(temp, dir)}`]);
    run(['check', '--changed-file=wego-app/scenes/测试场景/scene.js']);
    mkdir(path.join(temp, 'wego-app/scenes/未归属场景'));
    fs.writeFileSync(path.join(temp, 'wego-app/scenes/未归属场景/scene.js'), 'test\n');
    run(['check', '--changed-file=wego-app/scenes/未归属场景/scene.js'], false);
    fs.appendFileSync(path.join(temp, 'wego-app/scenes/测试场景/scene.js'), '// 篡改冻结实现\n');
    run(['check', `--iteration=${relFor(temp, dir)}`, '--changed-file=wego-app/scenes/测试场景/scene.js'], false);
    fs.writeFileSync(path.join(temp, 'wego-app/scenes/测试场景/scene.js'), acceptedRuntime);
    run(['check', `--iteration=${relFor(temp, dir)}`]);
    const nextInit = run(['init', '--scene=测试场景', '--id=test002', '--title=后续迭代', '--date=2026-07-12']);
    const nextFile = path.join(temp, nextInit.stdout.trim(), 'iteration.json');
    const nextRecord = readJson(nextFile);
    nextRecord.affected_scenes[0].change_type = 'changed';
    writeJson(nextFile, nextRecord);
    const nextSpec = readJson(path.join(temp, 'wego-app/scenes/测试场景/_spec/interaction_spec.json'));
    nextSpec.followup_draft = true;
    writeJson(path.join(temp, 'wego-app/scenes/测试场景/_spec/interaction_spec.json'), nextSpec);
    run(['check', '--changed-file=wego-app/scenes/测试场景/_spec/interaction_spec.json']);
    fs.appendFileSync(path.join(dir, 'test001-测试迭代-开发交接.md'), '\n篡改\n');
    run(['check', `--iteration=${relFor(temp, dir)}`], false);
    console.log('iteration-record 回归测试通过');
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

function relFor(root, file) {
  return path.relative(root, file).split(path.sep).join('/');
}

try {
  switch (command) {
    case 'init': commandInit(); break;
    case 'scope': commandScope(); break;
    case 'confirm-scope': commandConfirmScope(); break;
    case 'mark-design': commandMarkDesign(); break;
    case 'check-base': commandCheckBase(); break;
    case 'mark-implemented': commandMarkImplemented(); break;
    case 'start-testing': commandStartTesting(); break;
    case 'block': commandBlock(); break;
    case 'resume': commandResume(); break;
    case 'invalidate': commandInvalidate(); break;
    case 'handoff': commandHandoff(); break;
    case 'cancel': commandClose('cancelled'); break;
    case 'supersede': commandClose('superseded'); break;
    case 'freeze': commandFreeze(); break;
    case 'check': commandCheck(); break;
    case 'test': commandTest(); break;
    default: fail(`未知命令：${command}`);
  }
} catch (error) {
  console.error(`业务迭代操作失败：${error.message}`);
  process.exitCode = 1;
}
