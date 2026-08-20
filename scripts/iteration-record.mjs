#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseRouteRegistrySource } from './route-source-parser.mjs';

const root = process.cwd();
const [command, ...args] = process.argv.slice(2);

function flagValue(source, flag) {
  let result = null;
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === flag) result = source[index + 1]?.startsWith('--') ? '' : (source[index + 1] ?? '');
    else if (source[index].startsWith(`${flag}=`)) result = source[index].slice(flag.length + 1);
  }
  return result;
}

const value = flag => flagValue(args, flag);
const fileArg = value('--file');
const statuses = new Set(['draft', 'awaiting-brief-confirmation', 'prototyping', 'awaiting-prototype-confirmation', 'prototype-confirmed', 'frozen', 'blocked', 'cancelled', 'superseded']);
const briefSubmittedStatuses = new Set(['awaiting-brief-confirmation', 'prototyping', 'awaiting-prototype-confirmation', 'prototype-confirmed', 'frozen']);
const activeStatuses = new Set(['draft', 'awaiting-brief-confirmation', 'prototyping', 'awaiting-prototype-confirmation', 'prototype-confirmed', 'frozen', 'blocked']);
const prototypeModes = new Set(['functional', 'simulated', 'stub']);
const prototypeBoundaryKeys = new Set(['flow_id', 'mode', 'visible_result']);
const prototypeBriefKeys = ['goal', 'included', 'excluded', 'entry_points', 'critical_paths', 'prototype_boundaries', 'states', 'data_contract', 'assumptions', 'open_questions'];
const prototypeBriefKeySet = new Set(prototypeBriefKeys);
const prototypeBriefArrayFields = ['included', 'excluded', 'entry_points', 'critical_paths', 'states', 'assumptions', 'open_questions'];
const requiredBriefArrayFields = new Set(['included', 'entry_points', 'critical_paths', 'states']);
const iterationKeys = ['schemaVersion', 'identity', 'status', 'scope_revision', 'prototype_brief', 'brief_submission', 'brief_confirmation', 'prototype_submission', 'prototype_confirmation', 'affected_scenes', 'affected_runtime', 'stage_outputs', 'change_log', 'freeze'];
const identityKeys = ['iteration_id', 'title', 'date', 'primary_scene', 'related_scenes'];
const routesRelativePath = 'wego-app/js/routes.js';
const routeFingerprintPrefix = '@route-entry/';
const expectedStageValidity = new Map([
  ['draft', [false, false]],
  ['awaiting-brief-confirmation', [true, false]],
  ['prototyping', [true, false]],
  ['awaiting-prototype-confirmation', [true, true]],
  ['prototype-confirmed', [true, true]],
  ['frozen', [true, true]]
]);
const expectedConfirmations = new Map([
  ['draft', [false, false, false]],
  ['awaiting-brief-confirmation', [true, false, false]],
  ['prototyping', [true, true, false]],
  ['awaiting-prototype-confirmation', [true, true, false]],
  ['prototype-confirmed', [true, true, true]],
  ['frozen', [true, true, true]]
]);
const expectedPrototypeSubmissions = new Map([
  ['draft', false],
  ['awaiting-brief-confirmation', false],
  ['prototyping', false],
  ['awaiting-prototype-confirmation', true],
  ['prototype-confirmed', true],
  ['frozen', true]
]);
const invalidateSources = {
  brief: new Set(['awaiting-brief-confirmation', 'prototyping', 'awaiting-prototype-confirmation', 'prototype-confirmed']),
  prototype: new Set(['awaiting-prototype-confirmation', 'prototype-confirmed'])
};

function fail(message) { console.error(message); process.exit(1); }
function sha(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function isPlainObject(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype; }
function isIsoTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  try { return new Date(value).toISOString() === value; }
  catch { return false; }
}
function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (isPlainObject(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function scopeSha256(record) {
  const scope = {
    primary_scene: record.identity?.primary_scene,
    prototype_brief: record.prototype_brief,
    affected_scenes: record.affected_scenes,
    affected_runtime: record.affected_runtime
  };
  return crypto.createHash('sha256').update(stableJson(scope)).digest('hex');
}
function files(rootDir) {
  if (!fs.existsSync(rootDir)) return [];
  const output = [];
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const target = path.join(rootDir, entry.name);
    if (entry.isDirectory()) output.push(...files(target));
    else if (entry.isFile() && entry.name === 'iteration.json') output.push(target);
  }
  return output;
}
function load(file) {
  let record;
  try { record = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { fail(`${file} JSON 无法解析：${error.message}`); }
  return record;
}
function stringArrayErrors(items, field, requireNonEmpty = false) {
  if (!Array.isArray(items)) return [`${field} 必须为数组`];
  const errors = [];
  if (requireNonEmpty && !items.length) errors.push(`${field} 必须是非空数组`);
  const seen = new Set();
  items.forEach((item, index) => {
    if (typeof item !== 'string' || !item.trim()) {
      errors.push(`${field}[${index}] 必须为非空字符串`);
      return;
    }
    const normalized = item.trim();
    if (seen.has(normalized)) errors.push(`${field} 不得包含重复项：${normalized}`);
    seen.add(normalized);
  });
  return errors;
}
function prototypeBriefArrayErrors(brief, prefix = '', requireSubmittedFields = false) {
  return prototypeBriefArrayFields.flatMap(key => stringArrayErrors(
    brief?.[key],
    `${prefix}prototype_brief.${key}`,
    requireSubmittedFields && requiredBriefArrayFields.has(key)
  ));
}
function isSafeSceneName(value) {
  return typeof value === 'string'
    && Boolean(value.trim())
    && value === value.trim()
    && value !== '.'
    && value !== '..'
    && !/[\\/\0]/.test(value);
}
function isSafeRepositoryPath(value) {
  if (typeof value !== 'string' || !value.trim() || value !== value.trim()) return false;
  if (/[\\\0]/.test(value) || value.startsWith('/') || /^[A-Za-z]:/.test(value)) return false;
  const segments = value.split('/');
  return segments.length > 0 && segments.every(segment => segment && segment !== '.' && segment !== '..');
}
function isInsideDirectory(target, directory) {
  const relative = path.relative(directory, target);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
}
function unsafeFileArgument(value) {
  return typeof value !== 'string'
    || !value
    || /[\\\0]/.test(value)
    || value.split('/').some(segment => segment === '.' || segment === '..');
}
function iterationFilePathErrors(file, expectedScene = null, repositoryRoot = root, rawArgument = null) {
  const errors = [];
  if (rawArgument !== null && unsafeFileArgument(rawArgument)) errors.push('--file 不得含空值、反斜杠、. 或 .. 路径段');
  const repository = path.resolve(repositoryRoot);
  const target = path.resolve(file);
  if (!isInsideDirectory(target, repository)) return [...errors, '--file 必须位于当前仓库内'];
  const relative = path.relative(repository, target);
  const segments = relative.split(path.sep);
  const canonical = segments.length === 6
    && segments[0] === 'wego-app'
    && segments[1] === 'scenes'
    && isSafeSceneName(segments[2])
    && segments[3] === '_iterations'
    && isSafeSceneName(segments[4])
    && segments[5] === 'iteration.json';
  if (!canonical) {
    errors.push('--file 必须固定为 wego-app/scenes/{主业务场景}/_iterations/{迭代目录}/iteration.json');
    return errors;
  }
  if (expectedScene !== null && segments[2] !== expectedScene) errors.push(`--file 所属主业务场景必须与 identity.primary_scene 一致：${expectedScene}`);
  let existing = target;
  while (!fs.existsSync(existing) && path.dirname(existing) !== existing) existing = path.dirname(existing);
  try {
    const realRepository = fs.realpathSync(repository);
    const realExisting = fs.realpathSync(existing);
    if (!isInsideDirectory(realExisting, realRepository)) errors.push('--file 不得通过符号链接逃逸当前仓库');
    const existingRelative = path.relative(repository, existing);
    if (isInsideDirectory(existing, repository) && existingRelative) {
      let cursor = repository;
      for (const segment of existingRelative.split(path.sep)) {
        cursor = path.join(cursor, segment);
        if (fs.lstatSync(cursor).isSymbolicLink()) {
          errors.push('--file 路径不得经过符号链接');
          break;
        }
      }
    }
  } catch (error) {
    errors.push(`--file 路径无法确认：${error.message}`);
  }
  return errors;
}
function affectedSceneErrors(record, file) {
  const field = `${file}: affected_scenes`;
  const errors = stringArrayErrors(record.affected_scenes, field, activeStatuses.has(record.status));
  if (Array.isArray(record.affected_scenes)) {
    record.affected_scenes.forEach((scene, index) => {
      if (typeof scene === 'string' && scene.trim() && !isSafeSceneName(scene)) errors.push(`${field}[${index}] 必须是单层安全场景名，不得含路径分隔符、. 或 ..`);
    });
    if (activeStatuses.has(record.status) && !record.affected_scenes.includes(record.identity?.primary_scene)) {
      errors.push(`${field} 必须包含 identity.primary_scene：${record.identity?.primary_scene}`);
    }
  }
  return errors;
}
function affectedRuntimeErrors(record, file) {
  const field = `${file}: affected_runtime`;
  const errors = stringArrayErrors(record.affected_runtime, field);
  if (Array.isArray(record.affected_runtime)) record.affected_runtime.forEach((relative, index) => {
    if (typeof relative === 'string' && relative.trim() && !isSafeRepositoryPath(relative)) errors.push(`${field}[${index}] 必须是仓库内安全相对路径`);
  });
  return errors;
}
function stageOutputErrors(record, file) {
  const errors = [
    ...exactKeysErrors(record.stage_outputs, ['product', 'design'], `${file}: stage_outputs`),
    ...exactKeysErrors(record.stage_outputs?.product, ['valid'], `${file}: stage_outputs.product`),
    ...exactKeysErrors(record.stage_outputs?.design, ['valid'], `${file}: stage_outputs.design`)
  ];
  const productValid = record.stage_outputs?.product?.valid;
  const designValid = record.stage_outputs?.design?.valid;
  if (typeof productValid !== 'boolean') errors.push(`${file}: stage_outputs.product.valid 必须为布尔值`);
  if (typeof designValid !== 'boolean') errors.push(`${file}: stage_outputs.design.valid 必须为布尔值`);
  if (typeof productValid !== 'boolean' || typeof designValid !== 'boolean') return errors;
  const expected = expectedStageValidity.get(record.status);
  if (expected && (productValid !== expected[0] || designValid !== expected[1])) {
    errors.push(`${file}: stage_outputs 与状态 ${record.status} 不一致，product.valid/design.valid 应为 ${expected[0]}/${expected[1]}`);
  } else if (!expected && designValid && !productValid) {
    errors.push(`${file}: stage_outputs.design.valid 为 true 时 product.valid 也必须为 true`);
  }
  return errors;
}
function sceneRouteSemantic(scene, repositoryRoot) {
  const routesFile = path.join(repositoryRoot, routesRelativePath);
  if (!fs.existsSync(routesFile) || !fs.statSync(routesFile).isFile()) return { error: `${routesRelativePath} 不存在` };
  const expectedScript = `scenes/${scene}/scene.js`;
  const expectedStyle = `scenes/${scene}/scene.css`;
  let records;
  try { records = parseRouteRegistrySource(fs.readFileSync(routesFile, 'utf8')); }
  catch (error) { return { error: error.message }; }
  const candidates = records.filter(record => (
    record.scene === scene || record.script === expectedScript || record.style === expectedStyle
  ));
  if (!candidates.length) return { error: `场景 ${scene} 的路由条目不存在` };
  if (candidates.some(record => record.script !== expectedScript || record.style !== expectedStyle)) return { error: `场景 ${scene} 存在未绑定本场景 scene.js/scene.css 的路由条目` };
  return { value: candidates.sort((left, right) => {
    const leftKey = stableJson(left);
    const rightKey = stableJson(right);
    return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
  }) };
}
function expectedFingerprintDescriptors(record) {
  const targets = [];
  if (Array.isArray(record.affected_runtime)) {
    targets.push(...record.affected_runtime
      .filter(relative => isSafeRepositoryPath(relative) && relative !== routesRelativePath)
      .map(relative => ({ key: relative, kind: 'file', relative })));
  }
  if (Array.isArray(record.affected_scenes)) {
    for (const scene of record.affected_scenes.filter(isSafeSceneName)) {
      for (const file of ['scene.js', 'scene.css']) {
        const relative = `wego-app/scenes/${scene}/${file}`;
        targets.push({ key: relative, kind: 'file', relative });
      }
      targets.push({ key: `${routeFingerprintPrefix}${encodeURIComponent(scene)}`, kind: 'route', scene });
    }
  }
  return [...new Map(targets.map(target => [target.key, target])).values()].sort((left, right) => left.key.localeCompare(right.key));
}
function expectedFingerprintTargets(record) {
  return expectedFingerprintDescriptors(record).map(target => target.key);
}
function fingerprintShapeErrors(fingerprints, record, prefix) {
  const errors = [];
  const descriptors = expectedFingerprintDescriptors(record);
  const expected = descriptors.map(target => target.key);
  if (!isPlainObject(fingerprints)) return [`${prefix}.fingerprints 必须为普通对象`];
  const actual = Object.keys(fingerprints).sort();
  if (!actual.length) errors.push(`${prefix}.fingerprints 必须是非空对象`);
  const missing = expected.filter(relative => !Object.hasOwn(fingerprints, relative));
  const extra = actual.filter(relative => !expected.includes(relative));
  if (missing.length || extra.length) errors.push(`${prefix}.fingerprints 键集合必须等于当前预期目标${missing.length ? `；缺少：${missing.join('、')}` : ''}${extra.length ? `；多出：${extra.join('、')}` : ''}`);
  for (const descriptor of descriptors) {
    const fingerprint = fingerprints[descriptor.key];
    if (typeof fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(fingerprint)) {
      errors.push(`${prefix}.fingerprints.${descriptor.key} 必须是 SHA-256`);
    }
  }
  return errors;
}
function fingerprintErrors(fingerprints, record, prefix, repositoryRoot, driftLabel) {
  const errors = fingerprintShapeErrors(fingerprints, record, prefix);
  if (errors.length) return errors;
  const descriptors = expectedFingerprintDescriptors(record);
  for (const descriptor of descriptors) {
    const fingerprint = fingerprints[descriptor.key];
    if (descriptor.kind === 'route') {
      const semantic = sceneRouteSemantic(descriptor.scene, repositoryRoot);
      if (semantic.error) errors.push(`${prefix}.fingerprints.${descriptor.key} ${semantic.error}（${driftLabel}）`);
      else {
        const current = crypto.createHash('sha256').update(stableJson(semantic.value)).digest('hex');
        if (current !== fingerprint) errors.push(`${prefix}.fingerprints.${descriptor.key} 与当前路由条目语义不一致（${driftLabel}）`);
      }
      continue;
    }
    const target = path.join(repositoryRoot, descriptor.relative);
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      errors.push(`${prefix}.fingerprints.${descriptor.key} 对应文件不存在`);
      continue;
    }
    if (sha(target) !== fingerprint) errors.push(`${prefix}.fingerprints.${descriptor.key} 与当前文件不一致（${driftLabel}）`);
  }
  return errors;
}
function exactKeysErrors(value, expected, field) {
  if (!isPlainObject(value)) return [`${field} 必须为普通对象`];
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index])
    ? []
    : [`${field} 字段必须且只能为 ${wanted.join('、')}`];
}
function confirmationErrors(record, file, repositoryRoot) {
  const errors = [];
  if (record.status === 'superseded') return errors;
  const expected = expectedConfirmations.get(record.status);
  const submissionPresent = record.brief_submission !== null && record.brief_submission !== undefined;
  const briefPresent = record.brief_confirmation !== null && record.brief_confirmation !== undefined;
  const prototypeSubmissionPresent = record.prototype_submission !== null && record.prototype_submission !== undefined;
  const prototypePresent = record.prototype_confirmation !== null && record.prototype_confirmation !== undefined;
  if (expected) {
    const submissionMatches = expected[0] ? submissionPresent : record.brief_submission === null;
    const briefMatches = expected[1] ? briefPresent : record.brief_confirmation === null;
    const prototypeMatches = expected[2] ? prototypePresent : record.prototype_confirmation === null;
    if (!submissionMatches) errors.push(`${file}: 状态 ${record.status} 的 brief_submission 必须为 ${expected[0] ? '已提交对象' : 'null'}`);
    if (!briefMatches) errors.push(`${file}: 状态 ${record.status} 的 brief_confirmation 必须为 ${expected[1] ? '已确认对象' : 'null'}`);
    if (!prototypeMatches) errors.push(`${file}: 状态 ${record.status} 的 prototype_confirmation 必须为 ${expected[2] ? '已确认对象' : 'null'}`);
  } else if (prototypePresent && !briefPresent) {
    errors.push(`${file}: prototype_confirmation 存在时 brief_confirmation 也必须存在`);
  }
  const expectedPrototypeSubmission = expectedPrototypeSubmissions.get(record.status);
  if (expectedPrototypeSubmission !== undefined && prototypeSubmissionPresent !== expectedPrototypeSubmission) {
    errors.push(`${file}: 状态 ${record.status} 的 prototype_submission 必须为 ${expectedPrototypeSubmission ? '已提交对象' : 'null'}`);
  }
  if (prototypePresent && !prototypeSubmissionPresent) errors.push(`${file}: prototype_confirmation 存在时 prototype_submission 也必须存在`);
  if (briefPresent && !submissionPresent) errors.push(`${file}: brief_confirmation 存在时 brief_submission 也必须存在`);
  if (submissionPresent) {
    errors.push(...exactKeysErrors(record.brief_submission, ['at', 'scope_revision', 'scope_sha256'], `${file}: brief_submission`));
    if (isPlainObject(record.brief_submission)) {
      if (!isIsoTimestamp(record.brief_submission.at)) errors.push(`${file}: brief_submission.at 必须为 ISO 时间`);
      if (record.brief_submission.scope_revision !== record.scope_revision) errors.push(`${file}: brief_submission 必须绑定当前 scope_revision`);
      if (typeof record.brief_submission.scope_sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(record.brief_submission.scope_sha256)) errors.push(`${file}: brief_submission.scope_sha256 必须是 SHA-256`);
      else if (record.brief_submission.scope_sha256 !== scopeSha256(record)) errors.push(`${file}: brief_submission.scope_sha256 与当前范围不一致（简报提交后范围已漂移）`);
    }
  }
  if (briefPresent) {
    errors.push(...exactKeysErrors(record.brief_confirmation, ['at', 'scope_revision', 'scope_sha256'], `${file}: brief_confirmation`));
    if (isPlainObject(record.brief_confirmation)) {
      if (!isIsoTimestamp(record.brief_confirmation.at)) errors.push(`${file}: brief_confirmation.at 必须为 ISO 时间`);
      if (record.brief_confirmation.scope_revision !== record.scope_revision) errors.push(`${file}: brief_confirmation 必须绑定当前 scope_revision`);
      if (typeof record.brief_confirmation.scope_sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(record.brief_confirmation.scope_sha256)) errors.push(`${file}: brief_confirmation.scope_sha256 必须是 SHA-256`);
      else if (record.brief_confirmation.scope_sha256 !== scopeSha256(record)) errors.push(`${file}: brief_confirmation.scope_sha256 与当前范围不一致（范围确认后已漂移）`);
    }
  }
  if (prototypeSubmissionPresent) {
    errors.push(...exactKeysErrors(record.prototype_submission, ['at', 'scope_revision', 'affected_scenes', 'fingerprints'], `${file}: prototype_submission`));
    if (isPlainObject(record.prototype_submission)) {
      if (!isIsoTimestamp(record.prototype_submission.at)) errors.push(`${file}: prototype_submission.at 必须为 ISO 时间`);
      if (record.prototype_submission.scope_revision !== record.scope_revision) errors.push(`${file}: prototype_submission 必须绑定当前 scope_revision`);
      if (stableJson(record.prototype_submission.affected_scenes) !== stableJson(record.affected_scenes)) errors.push(`${file}: prototype_submission.affected_scenes 必须等于当前 affected_scenes`);
      const fingerprintCheck = record.status === 'frozen' ? fingerprintShapeErrors : fingerprintErrors;
      errors.push(...fingerprintCheck(record.prototype_submission.fingerprints, record, `${file}: prototype_submission`, repositoryRoot, '原型提交后已漂移'));
    }
  }
  if (prototypePresent) {
    errors.push(...exactKeysErrors(record.prototype_confirmation, ['at', 'scope_revision', 'affected_scenes', 'fingerprints'], `${file}: prototype_confirmation`));
    if (isPlainObject(record.prototype_confirmation)) {
      if (!isIsoTimestamp(record.prototype_confirmation.at)) errors.push(`${file}: prototype_confirmation.at 必须为 ISO 时间`);
      if (record.prototype_confirmation.scope_revision !== record.scope_revision) errors.push(`${file}: prototype_confirmation 必须绑定当前 scope_revision`);
      if (stableJson(record.prototype_confirmation.affected_scenes) !== stableJson(record.affected_scenes)) errors.push(`${file}: prototype_confirmation.affected_scenes 必须等于当前 affected_scenes`);
      const fingerprintCheck = record.status === 'frozen' ? fingerprintShapeErrors : fingerprintErrors;
      errors.push(...fingerprintCheck(record.prototype_confirmation.fingerprints, record, `${file}: prototype_confirmation`, repositoryRoot, '原型确认后已漂移'));
      if (isPlainObject(record.prototype_submission) && stableJson(record.prototype_confirmation.fingerprints) !== stableJson(record.prototype_submission.fingerprints)) {
        errors.push(`${file}: prototype_confirmation.fingerprints 必须等于用户验收的 prototype_submission.fingerprints`);
      }
    }
  }
  return errors;
}
function freezeErrors(record, file, repositoryRoot) {
  const errors = [];
  if (record.status === 'superseded') return errors;
  if (record.status !== 'frozen') {
    if (record.freeze !== null) errors.push(`${file}: 非 frozen 状态的 freeze 必须为 null`);
    return errors;
  }
  errors.push(...exactKeysErrors(record.freeze, ['at', 'design_system_version', 'scope_revision', 'fingerprints'], `${file}: freeze`));
  if (isPlainObject(record.freeze)) {
    if (!isIsoTimestamp(record.freeze.at)) errors.push(`${file}: freeze.at 必须为 ISO 时间`);
    if (!Number.isInteger(record.freeze.design_system_version) || record.freeze.design_system_version < 1) errors.push(`${file}: freeze.design_system_version 必须为正整数`);
    if (record.freeze.scope_revision !== record.scope_revision) errors.push(`${file}: freeze.scope_revision 必须等于当前 scope_revision`);
    errors.push(...fingerprintShapeErrors(record.freeze.fingerprints, record, `${file}: freeze`));
  }
  const freezeFile = path.join(path.dirname(file), 'freeze.json');
  if (!fs.existsSync(freezeFile)) errors.push(`${file}: frozen 状态要求同目录 freeze.json`);
  else {
    try {
      const freeze = JSON.parse(fs.readFileSync(freezeFile, 'utf8'));
      if (stableJson(freeze) !== stableJson(record.freeze)) errors.push(`${file}: freeze.json 必须与 iteration.json.freeze 一致`);
    } catch (error) { errors.push(`${file}: freeze.json 无法解析：${error.message}`); }
  }
  return errors;
}
function validate(record, file, repositoryRoot = root) {
  const errors = [];
  if (!isPlainObject(record)) return [`${file}: 迭代记录必须为普通对象`];
  if (path.isAbsolute(file)) errors.push(...iterationFilePathErrors(file, record.identity?.primary_scene ?? null, repositoryRoot));
  const unexpectedKeys = Object.keys(record).filter(key => !iterationKeys.includes(key));
  const missingKeys = iterationKeys.filter(key => !Object.hasOwn(record, key));
  if (unexpectedKeys.length) errors.push(`${file}: 迭代记录含 schemaVersion 6 未定义顶层字段：${unexpectedKeys.join('、')}`);
  if (missingKeys.length) {
    errors.push(`${file}: 迭代记录缺少字段：${missingKeys.join('、')}`);
  }
  if (record.schemaVersion !== 6) errors.push(`${file}: schemaVersion 必须为 6`);
  errors.push(...exactKeysErrors(record.identity, identityKeys, `${file}: identity`));
  if (isPlainObject(record.identity)) {
    for (const key of ['iteration_id', 'title']) {
      if (typeof record.identity[key] !== 'string' || !record.identity[key].trim()) errors.push(`${file}: identity.${key} 必须为非空字符串`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.identity.date ?? '')) errors.push(`${file}: identity.date 必须为 YYYY-MM-DD`);
    if (!isSafeSceneName(record.identity.primary_scene)) errors.push(`${file}: identity.primary_scene 必须是单层安全场景名`);
    errors.push(...stringArrayErrors(record.identity.related_scenes, `${file}: identity.related_scenes`));
    if (Array.isArray(record.identity.related_scenes)) record.identity.related_scenes.forEach((scene, index) => {
      if (typeof scene === 'string' && scene.trim() && !isSafeSceneName(scene)) errors.push(`${file}: identity.related_scenes[${index}] 必须是单层安全场景名`);
    });
  }
  if (!statuses.has(record.status)) errors.push(`${file}: status 非法：${record.status}`);
  if (!Number.isInteger(record.scope_revision) || record.scope_revision < 1) errors.push(`${file}: scope_revision 必须为正整数`);
  const brief = record.prototype_brief;
  const briefIsObject = isPlainObject(brief);
  for (const key of prototypeBriefKeys) if (!briefIsObject || !(key in brief)) errors.push(`${file}: prototype_brief 缺少 ${key}`);
  if (briefIsObject) {
    const unexpectedBriefKeys = Object.keys(brief).filter(key => !prototypeBriefKeySet.has(key));
    if (unexpectedBriefKeys.length) errors.push(`${file}: prototype_brief 含 schemaVersion 6 未定义字段：${unexpectedBriefKeys.join('、')}`);
    errors.push(...prototypeBriefArrayErrors(brief, `${file}: `));
    if (!Array.isArray(brief.prototype_boundaries)) errors.push(`${file}: prototype_brief.prototype_boundaries 必须为数组`);
    else errors.push(...prototypeBoundaryErrors(brief, `${file}: `, false));
    if (!isPlainObject(brief.data_contract)) errors.push(`${file}: prototype_brief.data_contract 必须为普通对象`);
    if (briefSubmittedStatuses.has(record.status)) errors.push(...briefSubmissionErrors(record).map(error => `${file}: ${error}`));
  }
  errors.push(...affectedSceneErrors(record, file));
  errors.push(...affectedRuntimeErrors(record, file));
  if (!record.stage_outputs?.product || !record.stage_outputs?.design) errors.push(`${file}: stage_outputs 必须含 product/design`);
  errors.push(...stageOutputErrors(record, file));
  errors.push(...confirmationErrors(record, file, repositoryRoot));
  errors.push(...freezeErrors(record, file, repositoryRoot));
  return [...new Set(errors)];
}
function save(file, record, action) {
  record.change_log = Array.isArray(record.change_log) ? record.change_log : [];
  record.change_log.push({ action, at: new Date().toISOString() });
  fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`);
}
function requireFile(expectedScene = null) {
  if (!fileArg) fail('该命令必须传 --file <iteration.json> 或 --file=<iteration.json>');
  const file = path.resolve(root, fileArg);
  const errors = iterationFilePathErrors(file, expectedScene, root, fileArg);
  if (errors.length) fail(errors.join('\n'));
  return file;
}
function transition(expected, next, mutate = () => {}) {
  const file = requireFile();
  const record = load(file);
  const errors = validate(record, file);
  if (errors.length) fail(errors.join('\n'));
  if (!expected.includes(record.status)) fail(`${file}: 当前状态 ${record.status} 不能执行 ${command}`);
  mutate(record);
  record.status = next;
  const changedErrors = validate(record, file);
  if (changedErrors.length) fail(`${command} 后记录非法，未写入文件：\n${changedErrors.join('\n')}`);
  save(file, record, command);
  return record;
}
function init() {
  const id = value('--iteration-id');
  const title = value('--title');
  const scene = value('--scene');
  if (!id || !title || !scene) fail('init 需要 --iteration-id、--title、--scene');
  if (!isSafeSceneName(scene)) fail('--scene 必须是单层安全场景名');
  const file = requireFile(scene);
  if (fs.existsSync(file)) fail(`${file} 已存在`);
  const record = { schemaVersion: 6, identity: { iteration_id: id, title, date: new Date().toISOString().slice(0, 10), primary_scene: scene, related_scenes: [] }, status: 'draft', scope_revision: 1, prototype_brief: { goal: '', included: [], excluded: [], entry_points: [], critical_paths: [], prototype_boundaries: [], states: [], data_contract: {}, assumptions: [], open_questions: [] }, brief_submission: null, brief_confirmation: null, prototype_submission: null, prototype_confirmation: null, affected_scenes: [scene], affected_runtime: [], stage_outputs: { product: { valid: false }, design: { valid: false } }, change_log: [], freeze: null };
  const errors = validate(record, file);
  if (errors.length) fail(errors.join('\n'));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  save(file, record, 'init');
}
function check() {
  const records = fileArg ? [requireFile()] : files(path.join(root, 'wego-app/scenes'));
  const errors = records.flatMap(file => validate(load(file), file));
  if (errors.length) fail(errors.join('\n'));
  console.log(`${records.length} 个迭代通过检查`);
}
function prototypeBoundaryErrors(brief, prefix = '', requireNonEmpty = true) {
  const boundaries = brief.prototype_boundaries;
  const errors = [];
  if (!Array.isArray(boundaries)) return [`${prefix}prototype_brief.prototype_boundaries 必须为数组`];
  if (requireNonEmpty && !boundaries.length) errors.push(`${prefix}prototype_brief.prototype_boundaries 必须是非空数组`);
  const excluded = new Set(Array.isArray(brief.excluded) ? brief.excluded.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean) : []);
  const flowIds = new Set();
  boundaries.forEach((boundary, index) => {
    const field = `${prefix}prototype_brief.prototype_boundaries[${index}]`;
    if (!isPlainObject(boundary)) {
      errors.push(`${field} 必须是普通对象`);
      return;
    }
    const unexpectedKeys = Object.keys(boundary).filter(key => !prototypeBoundaryKeys.has(key));
    if (unexpectedKeys.length) errors.push(`${field} 含未知字段：${unexpectedKeys.join('、')}`);
    const flowId = typeof boundary.flow_id === 'string' ? boundary.flow_id.trim() : '';
    if (!flowId) errors.push(`${field}.flow_id 不能为空`);
    else {
      if (!/^[a-z][a-z0-9-]*$/.test(flowId)) errors.push(`${field}.flow_id 必须是稳定 kebab-case`);
      if (flowIds.has(flowId)) errors.push(`${field}.flow_id 不得重复：${flowId}`);
      if (excluded.has(flowId)) errors.push(`${field}.flow_id 已在 excluded 中：${flowId}`);
      flowIds.add(flowId);
    }
    if (!prototypeModes.has(boundary.mode)) errors.push(`${field}.mode 必须为 functional、simulated 或 stub`);
    if (typeof boundary.visible_result !== 'string' || !boundary.visible_result.trim()) errors.push(`${field}.visible_result 不能为空`);
  });
  return errors;
}
function briefSubmissionErrors(record) {
  const brief = record.prototype_brief;
  const errors = [];
  if (!isPlainObject(brief)) return ['prototype_brief 必须为普通对象'];
  if (typeof brief.goal !== 'string' || !brief.goal.trim()) errors.push('prototype_brief.goal 不能为空');
  errors.push(...prototypeBriefArrayErrors(brief, '', true));
  if (!isPlainObject(brief.data_contract) || !Object.keys(brief.data_contract).length) errors.push('prototype_brief.data_contract 必须是非空普通对象');
  errors.push(...prototypeBoundaryErrors(brief));
  if (Array.isArray(brief.open_questions) && brief.open_questions.length) errors.push('prototype_brief.open_questions 必须在 submit-brief 前清空');
  return [...new Set(errors)];
}

/**
 * 需求简报充分性守门（不改变 schema，仅约束既有字段内容）。
 *
 * 目标：要求简报"足够细"——state 覆盖加载/失败/空态等交互状态，数据有产生入口、
 * 禁用静态种子降级。对应 wego-product/references/scope-and-boundaries.md「需求简报输出要求」。
 */
function briefSufficiencyErrors(brief) {
  const errors = [];
  if (!isPlainObject(brief)) return errors;

  // A. states 必须覆盖加载态、失败态、空状态
  const states = (brief.states || []).filter(item => typeof item === 'string');
  const joinedStates = states.join(' ');
  if (!states.length) return errors; // 空态已在 requiredBriefArrayFields 拦截
  if (!/加载|loading/i.test(joinedStates)) errors.push('prototype_brief.states 必须包含加载态（如 loading，写明进入条件与即见结果）');
  if (!/(失败|error|fault)/i.test(joinedStates)) errors.push('prototype_brief.states 必须包含失败态（如加载/保存失败，写明提示与重试/关闭）');
  if (!/(空|empty|无数据|无结果)/.test(joinedStates)) errors.push('prototype_brief.states 必须包含空状态（列表空 / 搜索空结果，写明引导入口）');

  // 每个 state 须写成「进入条件 → 可感知结果」，防止只写一个名词
  const vague = states.filter(s => s === s.replace(/[：:→，,；;]/g, ''));
  if (vague.length) errors.push(`prototype_brief.states 存在未写输入条件/可感知结果的粗糙状态：${vague.slice(0, 3).map(s => `「${s}」`).join('、')}（每个状态应为「标识：进入条件 → 可感知结果」）`);

  // B. 禁止用静态种子/本地模拟代替真实数据产生入口
  const forbidSeedWords = /种子|内置数据|预置|mock|模拟数据|seed/i;
  const forbiddenText = [...(brief.assumptions || []), ...(brief.data_contract && typeof brief.data_contract === 'object' ? [String(brief.data_contract)] : [])].join(' ');
  if (forbidSeedWords.test(forbiddenText)) {
    errors.push('prototype_brief 不得用「内置种子/mock/预置模拟数据」代替数据产生入口；数据必须通过发布/新建流程写入（localStorage 可作为存储位置，但写入通道必须是真实交互流程）');
  }

  // C. 数据必须有产生入口：included(或 critical_paths) 应含新建/发布/录入/采购 之类动作，与数据展示首尾闭环
  const createWords = /新建|添加|新增|发布|录入|上架|创建|导入|上传/;
  const actionText = [...(brief.included || []), ...(brief.critical_paths || [])].join(' ');
  if (!createWords.test(actionText)) {
    errors.push('prototype_brief 缺少数据产生入口：included/critical_paths 必须含「新建/添加/发布/录入」等来源流程，使展示数据有真实创建通道（数据闭环）');
  }

  return errors;
}
function validatePrototypeScenes(record) {
  if (!Array.isArray(record.affected_scenes) || !record.affected_scenes.length) fail('submit-prototype 要求 affected_scenes 为非空数组');
  for (const scene of record.affected_scenes) {
    const sceneDirectory = `wego-app/scenes/${scene}`;
    for (const validator of ['scripts/validate-scene-contract.mjs', 'scripts/validate-scene-runtime.mjs']) {
      const result = spawnSync(process.execPath, [validator, sceneDirectory, '--json'], { cwd: root, encoding: 'utf8' });
      if (result.status !== 0) fail(`${sceneDirectory} 未通过场景验证：${(result.stderr || result.stdout || '未知错误').trim()}`);
    }
  }
}
function collectFingerprints(record, repositoryRoot = root) {
  const fingerprints = {};
  for (const descriptor of expectedFingerprintDescriptors(record)) {
    if (descriptor.kind === 'route') {
      const semantic = sceneRouteSemantic(descriptor.scene, repositoryRoot);
      if (semantic.error) fail(`无法生成路由指纹：${semantic.error}`);
      fingerprints[descriptor.key] = crypto.createHash('sha256').update(stableJson(semantic.value)).digest('hex');
      continue;
    }
    const target = path.join(repositoryRoot, descriptor.relative);
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) fail(`缺少指纹目标文件：${descriptor.relative}`);
    fingerprints[descriptor.key] = sha(target);
  }
  return fingerprints;
}
function createBriefConfirmation(record) {
  return { at: new Date().toISOString(), scope_revision: record.scope_revision, scope_sha256: scopeSha256(record) };
}
function createBriefSubmission(record) {
  return { at: new Date().toISOString(), scope_revision: record.scope_revision, scope_sha256: scopeSha256(record) };
}
function createPrototypeConfirmation(record) {
  if (!isPlainObject(record.prototype_submission)) fail('confirm-prototype 要求先存在 prototype_submission');
  return {
    at: new Date().toISOString(),
    scope_revision: record.scope_revision,
    affected_scenes: [...record.affected_scenes],
    fingerprints: { ...record.prototype_submission.fingerprints }
  };
}
function createPrototypeSubmission(record, repositoryRoot = root) {
  return {
    at: new Date().toISOString(),
    scope_revision: record.scope_revision,
    affected_scenes: [...record.affected_scenes],
    fingerprints: collectFingerprints(record, repositoryRoot)
  };
}
function requireUserConfirmation(record, flag, label) {
  const confirmedIterationId = value(flag);
  if (!confirmedIterationId) fail(`${label} 只能在用户明确确认后执行；请传 ${flag} <iteration_id>`);
  if (confirmedIterationId !== record.identity?.iteration_id) {
    fail(`${flag} 必须等于当前 iteration_id：${record.identity?.iteration_id ?? '未定义'}`);
  }
}
function invalidationSourceError(record, stage) {
  if (record.status === 'frozen') return '冻结迭代不得失效；请新建迭代';
  if (!invalidateSources[stage]?.has(record.status)) return `当前状态 ${record.status} 不能执行 invalidate --stage=${stage}`;
  return null;
}
function applyInvalidation(record, stage) {
  record.status = stage === 'brief' ? 'draft' : 'prototyping';
  if (stage === 'brief') {
    record.scope_revision += 1;
    record.brief_submission = null;
    record.brief_confirmation = null;
    record.prototype_submission = null;
    record.prototype_confirmation = null;
    record.stage_outputs = { product: { valid: false }, design: { valid: false } };
  } else {
    record.prototype_submission = null;
    record.prototype_confirmation = null;
    record.stage_outputs.design.valid = false;
  }
}
function migrateLegacyRecord(record) {
  if (record.schemaVersion !== 5) fail('migrate 只支持 schemaVersion 5 的迭代记录');
  record.schemaVersion = 6;
  if (!Object.hasOwn(record, 'prototype_submission')) record.prototype_submission = null;
  if (record.status === 'awaiting-prototype-confirmation') {
    // 旧记录没有提交指纹，不能将其视为已经验收；回到可重新提交状态。
    record.status = 'prototyping';
    record.prototype_submission = null;
    record.prototype_confirmation = null;
    record.stage_outputs.design.valid = false;
  } else if (['prototype-confirmed', 'frozen'].includes(record.status)) {
    if (!isPlainObject(record.prototype_confirmation)) {
      fail('已确认或冻结的旧迭代缺少 prototype_confirmation，无法安全迁移');
    }
    record.prototype_submission = { ...record.prototype_confirmation, fingerprints: { ...record.prototype_confirmation.fingerprints } };
  }
}
function migrate() {
  const file = requireFile();
  const record = load(file);
  migrateLegacyRecord(record);
  const errors = validate(record, file);
  if (errors.length) fail(`migrate 后记录非法，未写入文件：\n${errors.join('\n')}`);
  save(file, record, 'migrate');
}
function freeze() {
  const file = requireFile();
  const record = load(file);
  const userConfirmedIterationId = value('--user-confirmed-freeze');
  if (!userConfirmedIterationId) {
    fail('freeze 只能在用户明确指定迭代并要求冻结后执行；请传 --user-confirmed-freeze <iteration_id>');
  }
  if (userConfirmedIterationId !== record.identity?.iteration_id) {
    fail(`${file}: --user-confirmed-freeze 必须等于当前 iteration_id：${record.identity?.iteration_id ?? '未定义'}`);
  }
  const errors = validate(record, file);
  if (errors.length) fail(errors.join('\n'));
  if (record.status !== 'prototype-confirmed') fail(`${file}: 当前状态 ${record.status} 不能执行 freeze`);
  const freezeFile = path.join(path.dirname(file), 'freeze.json');
  if (fs.existsSync(freezeFile)) fail(`${freezeFile} 已存在，冻结记录禁止覆盖`);
  let metadata;
  try { metadata = JSON.parse(fs.readFileSync(path.join(root, '.codex/skills/wego-design/metadata.json'), 'utf8')); }
  catch (error) { fail(`无法读取设计系统版本：${error.message}`); }
  if (!Number.isInteger(metadata.version) || metadata.version < 1) fail('设计系统版本必须为正整数');
  record.freeze = {
    at: new Date().toISOString(),
    design_system_version: metadata.version,
    scope_revision: record.scope_revision,
    fingerprints: collectFingerprints(record)
  };
  record.status = 'frozen';
  fs.writeFileSync(freezeFile, `${JSON.stringify(record.freeze, null, 2)}\n`);
  const changedErrors = validate(record, file);
  if (changedErrors.length) {
    fs.rmSync(freezeFile, { force: true });
    fail(`freeze 后记录非法，未写入 iteration.json：\n${changedErrors.join('\n')}`);
  }
  save(file, record, 'freeze');
}

function test() {
  const clone = input => JSON.parse(JSON.stringify(input));
  const assert = (condition, message) => { if (!condition) fail(message); };
  const has = (record, text, file = 'sample', repositoryRoot = root) => validate(record, file, repositoryRoot).some(error => error.includes(text));
  const readyBrief = () => ({
    goal: '测试目标',
    included: ['发布商品'],
    excluded: [],
    entry_points: ['工作台商品管理'],
    critical_paths: ['进入发布 → 填写信息 → 完成发布'],
    prototype_boundaries: [{ flow_id: 'publish-product', mode: 'functional', visible_result: '用户完成发布并看到成功结果' }],
    states: [
      'loading：发布页加载中 → 显示 loading 骨架',
      '发布成功：提交完成 → 商品写入列表并展示',
      'load-failed：加载接口失败 → 失败提示 + 重试/关闭',
      'empty：无商品数据 → 空状态 + 引导新建'
    ],
    data_contract: { product: { required: ['title'] } },
    assumptions: [],
    open_questions: []
  });
  const sample = { schemaVersion: 6, identity: { iteration_id: 'test', title: '测试', date: '2026-07-15', primary_scene: '测试场景', related_scenes: [] }, status: 'draft', scope_revision: 1, prototype_brief: { goal: '', included: [], excluded: [], entry_points: [], critical_paths: [], prototype_boundaries: [], states: [], data_contract: {}, assumptions: [], open_questions: [] }, brief_submission: null, brief_confirmation: null, prototype_submission: null, prototype_confirmation: null, affected_scenes: ['测试场景'], affected_runtime: [], stage_outputs: { product: { valid: false }, design: { valid: false } }, change_log: [], freeze: null };

  assert(!validate(sample, 'sample').length, '业务迭代 Schema 错误拦截合法 draft');
  const emptyScenes = clone(sample);
  emptyScenes.affected_scenes = [];
  assert(has(emptyScenes, 'affected_scenes 必须是非空数组'), '业务迭代 Schema 未拦截活动迭代空 affected_scenes');
  for (const scene of ['.', '..', '父/子', '父\\子']) {
    const invalidScene = clone(sample);
    invalidScene.identity.primary_scene = scene;
    invalidScene.affected_scenes = [scene];
    assert(has(invalidScene, '安全场景名'), `业务迭代 Schema 未拦截非法场景名：${scene}`);
  }
  const duplicateScenes = clone(sample);
  duplicateScenes.affected_scenes.push('测试场景');
  assert(has(duplicateScenes, 'affected_scenes 不得包含重复项'), '业务迭代 Schema 未拦截重复 affected_scenes');
  const nonStringRuntime = clone(sample);
  nonStringRuntime.affected_runtime = [null];
  assert(has(nonStringRuntime, 'affected_runtime[0] 必须为非空字符串'), '业务迭代 Schema 未拦截非字符串 affected_runtime');
  for (const runtime of ['', '../secret', '/tmp/file', 'wego-app/../secret', 'wego-app\\scene.js', './wego-app/app.js', 'C:/temp/file']) {
    const invalidRuntime = clone(sample);
    invalidRuntime.affected_runtime = [runtime];
    assert(has(invalidRuntime, runtime ? '安全相对路径' : '非空字符串'), `业务迭代 Schema 未拦截非法 affected_runtime：${runtime}`);
  }
  const duplicateRuntime = clone(sample);
  duplicateRuntime.affected_runtime = ['wego-app/js/routes.js', 'wego-app/js/routes.js'];
  assert(has(duplicateRuntime, 'affected_runtime 不得包含重复项'), '业务迭代 Schema 未拦截重复 affected_runtime');

  sample.prototype_brief = readyBrief();
  assert(!briefSubmissionErrors(sample).length, '业务迭代状态机错误拦截有效 prototype_brief');
  const emptyDataContract = clone(sample);
  emptyDataContract.prototype_brief.data_contract = {};
  assert(briefSubmissionErrors(emptyDataContract).some(error => error.includes('非空普通对象')), 'submit-brief 未拦截空 data_contract');
  const arrayDataContract = clone(sample);
  arrayDataContract.prototype_brief.data_contract = [];
  assert(briefSubmissionErrors(arrayDataContract).some(error => error.includes('非空普通对象')), 'submit-brief 未拦截非普通对象 data_contract');
  const nullIncluded = clone(sample);
  nullIncluded.prototype_brief.included = [null];
  assert(briefSubmissionErrors(nullIncluded).some(error => error.includes('included[0]')), '业务迭代状态机未拦截 included 中的非字符串');
  const duplicateCriticalPaths = clone(sample);
  duplicateCriticalPaths.prototype_brief.critical_paths.push(duplicateCriticalPaths.prototype_brief.critical_paths[0]);
  assert(briefSubmissionErrors(duplicateCriticalPaths).some(error => error.includes('critical_paths 不得包含重复项')), '业务迭代状态机未拦截重复关键路径');
  const legacyBriefField = clone(sample);
  legacyBriefField.prototype_brief.readiness = { ready: true };
  assert(has(legacyBriefField, 'schemaVersion 6 未定义字段：readiness'), '业务迭代 Schema 未拦截 prototype_brief 遗留字段');
  const unexpectedBriefConfirmation = clone(sample);
  unexpectedBriefConfirmation.brief_confirmation = createBriefConfirmation(unexpectedBriefConfirmation);
  assert(has(unexpectedBriefConfirmation, '状态 draft 的 brief_confirmation 必须为 null'), '确认矩阵未拦截 draft 中的 brief_confirmation');
  const prototyping = clone(sample);
  prototyping.status = 'prototyping';
  prototyping.stage_outputs.product.valid = true;
  prototyping.brief_submission = createBriefSubmission(prototyping);
  assert(has(prototyping, '状态 prototyping 的 brief_confirmation 必须为 已确认对象'), '确认矩阵未要求 prototyping 的 brief_confirmation');
  prototyping.brief_confirmation = createBriefConfirmation(prototyping);
  prototyping.brief_confirmation.scope_revision = 2;
  assert(has(prototyping, '绑定当前 scope_revision'), 'brief_confirmation 未绑定 scope_revision');
  prototyping.brief_confirmation.scope_revision = 1;
  assert(!validate(prototyping, 'sample').length, '确认矩阵错误拦截合法 prototyping 状态');
  const changedBriefAfterConfirmation = clone(prototyping);
  changedBriefAfterConfirmation.prototype_brief.goal = '确认后擅自修改的目标';
  assert(has(changedBriefAfterConfirmation, '范围确认后已漂移'), 'brief_confirmation 未拦截确认后修改 prototype_brief');
  const changedScenesAfterConfirmation = clone(prototyping);
  changedScenesAfterConfirmation.affected_scenes.push('关联场景');
  assert(has(changedScenesAfterConfirmation, '范围确认后已漂移'), 'brief_confirmation 未拦截确认后修改 affected_scenes');
  const changedRuntimeAfterConfirmation = clone(prototyping);
  changedRuntimeAfterConfirmation.affected_runtime.push('wego-app/js/runtime.js');
  assert(has(changedRuntimeAfterConfirmation, '范围确认后已漂移'), 'brief_confirmation 未拦截确认后修改 affected_runtime');
  const awaitingBrief = clone(sample);
  awaitingBrief.status = 'awaiting-brief-confirmation';
  awaitingBrief.stage_outputs.product.valid = true;
  awaitingBrief.brief_submission = createBriefSubmission(awaitingBrief);
  assert(!validate(awaitingBrief, 'sample').length, '确认矩阵错误拦截合法 awaiting-brief-confirmation 状态');
  const awaitingPrototype = clone(prototyping);
  awaitingPrototype.status = 'awaiting-prototype-confirmation';
  awaitingPrototype.stage_outputs.design.valid = true;
  assert(has(awaitingPrototype, '状态 awaiting-prototype-confirmation 的 prototype_submission 必须为 已提交对象'), '确认矩阵未要求 awaiting-prototype-confirmation 存在原型提交快照');
  awaitingPrototype.prototype_confirmation = {};
  assert(has(awaitingPrototype, '状态 awaiting-prototype-confirmation 的 prototype_confirmation 必须为 null'), '确认矩阵未拦截提前写入的 prototype_confirmation');
  const prototypeInvalidation = clone(prototyping);
  prototypeInvalidation.status = 'awaiting-prototype-confirmation';
  prototypeInvalidation.stage_outputs.design.valid = true;
  applyInvalidation(prototypeInvalidation, 'prototype');
  assert(prototypeInvalidation.scope_revision === 1 && prototypeInvalidation.prototype_submission === null && !validate(prototypeInvalidation, 'sample').length, 'prototype 失效必须清除提交快照且不破坏已确认的 scope_revision');
  const legacyAwaitingPrototype = clone(awaitingPrototype);
  legacyAwaitingPrototype.schemaVersion = 5;
  delete legacyAwaitingPrototype.prototype_submission;
  migrateLegacyRecord(legacyAwaitingPrototype);
  assert(legacyAwaitingPrototype.status === 'prototyping' && legacyAwaitingPrototype.schemaVersion === 6 && legacyAwaitingPrototype.prototype_submission === null && !validate(legacyAwaitingPrototype, 'sample').length, '旧待验收迭代迁移后必须回到可重新提交状态');
  const briefInvalidation = clone(prototyping);
  applyInvalidation(briefInvalidation, 'brief');
  assert(briefInvalidation.scope_revision === 2 && briefInvalidation.brief_submission === null && briefInvalidation.brief_confirmation === null, 'brief 失效必须递增版本并清除提交与确认快照');
  assert(!validate(briefInvalidation, 'sample').length, 'brief 失效后的 draft 必须继续符合 Schema');
  assert(flagValue(['--stage', 'brief'], '--stage') === 'brief', '命令参数未支持 --flag value');
  assert(flagValue(['--stage=prototype'], '--stage') === 'prototype', '命令参数未支持 --flag=value');

  // 需求简报充分性守门
  const sufficiencyBase = clone(sample);
  sufficiencyBase.prototype_brief = readyBrief();
  assert(!briefSufficiencyErrors(sufficiencyBase.prototype_brief).length, '合规简报被充分性守门误拦截');
  const missingLoading = clone(sufficiencyBase);
  missingLoading.prototype_brief.states = ['发布成功：提交 → 列表展示', 'load-failed：读取失败 → 提示重试', 'empty：无数据 → 空态引导'];
  assert(briefSufficiencyErrors(missingLoading.prototype_brief).some(e => e.includes('加载态')), '充分性守门未拦截缺加载态');
  const missingFailure = clone(sufficiencyBase);
  missingFailure.prototype_brief.states = ['loading：加载中 → loading 骨架', '发布成功：提交 → 列表展示', 'empty：无数据 → 空态引导'];
  assert(briefSufficiencyErrors(missingFailure.prototype_brief).some(e => e.includes('失败态')), '充分性守门未拦截缺失败态');
  const missingEmpty = clone(sufficiencyBase);
  missingEmpty.prototype_brief.states = ['loading：加载中 → loading 骨架', '发布成功：提交 → 列表展示', 'load-failed：读取失败 → 提示重试'];
  assert(briefSufficiencyErrors(missingEmpty.prototype_brief).some(e => e.includes('空状态')), '充分性守门未拦截缺空状态');
  const vagueState = clone(sufficiencyBase);
  vagueState.prototype_brief.states[0] = '仅名词无冒号';
  assert(briefSufficiencyErrors(vagueState.prototype_brief).some(e => e.includes('粗糙状态')), '充分性守门未拦截粗糙状态(无输入条件/结果)');
  const seededAssumptions = clone(sufficiencyBase);
  seededAssumptions.prototype_brief.assumptions = ['使用内置种子数据 mock 展示'];
  assert(briefSufficiencyErrors(seededAssumptions.prototype_brief).some(e => e.includes('种子')), '充分性守门未拦截静态种子降级');
  const noCreateEntry = clone(sufficiencyBase);
  noCreateEntry.prototype_brief.included = ['仅展示列表'];
  noCreateEntry.prototype_brief.critical_paths = ['浏览列表'];
  assert(briefSufficiencyErrors(noCreateEntry.prototype_brief).some(e => e.includes('数据产生入口')), '充分性守门未拦截缺数据产生入口');

  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-iteration-record-'));
  try {
    const scene = '测试场景';
    const sceneRoot = path.join(fixtureRoot, 'wego-app/scenes', scene);
    fs.mkdirSync(sceneRoot, { recursive: true });
    fs.mkdirSync(path.join(fixtureRoot, 'wego-app/js'), { recursive: true });
    fs.mkdirSync(path.join(fixtureRoot, '.codex/skills/wego-design'), { recursive: true });
    fs.mkdirSync(path.join(fixtureRoot, 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(sceneRoot, 'scene.js'), 'window.testScene = true;\n');
    fs.writeFileSync(path.join(sceneRoot, 'scene.css'), '.test { color: var(--color-text); }\n');
    const currentRoute = `{ routeId: 'test-route', scene: '${scene}', entry: { type: 'host-tab', tab: 'my', label: '测试' }, script: 'scenes/${scene}/scene.js', style: 'scenes/${scene}/scene.css' }`;
    const detailRoute = `{ routeId: 'test-route-detail', scene: '${scene}', script: './scenes/${scene}/scene.js', style: './scenes/${scene}/scene.css' }`;
    const unrelatedRoute = "{ routeId: 'other-route', script: 'scenes/其他场景/scene.js', style: 'scenes/其他场景/scene.css' }";
    const duplicateRouteId = "{ routeId: 'test-route', scene: '其他场景', script: 'scenes/其他场景/scene.js', style: 'scenes/其他场景/scene.css' }";
    const duplicateHostTab = "{ routeId: 'other-host-tab', scene: '其他场景', entry: { type: 'host-tab', tab: 'my' }, script: 'scenes/其他场景/scene.js', style: 'scenes/其他场景/scene.css' }";
    const missingHostTab = "{ routeId: 'missing-host-tab', scene: '其他场景', entry: { type: 'host-tab' }, script: 'scenes/其他场景/scene.js', style: 'scenes/其他场景/scene.css' }";
    const routesFile = path.join(fixtureRoot, routesRelativePath);
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [${currentRoute}, ${detailRoute}];\n`);
    fs.writeFileSync(path.join(fixtureRoot, '.codex/skills/wego-design/metadata.json'), '{"version":411}\n');
    fs.writeFileSync(path.join(fixtureRoot, 'scripts/validate-scene-contract.mjs'), `import fs from 'node:fs';\nimport path from 'node:path';\nconst source = fs.readFileSync(path.join(process.argv[2], 'scene.js'), 'utf8');\nif (source.includes('INVALID_SCENE')) { console.error('场景合同失败'); process.exit(1); }\n`);
    fs.writeFileSync(path.join(fixtureRoot, 'scripts/validate-scene-runtime.mjs'), `import fs from 'node:fs';\nimport path from 'node:path';\nconst source = fs.readFileSync(path.join(process.argv[2], 'scene.js'), 'utf8');\nif (source.includes('INVALID_RUNTIME')) { console.error('场景运行时失败'); process.exit(1); }\n`);
    const iterationDirectory = path.join(sceneRoot, '_iterations/20260715-test-测试');
    const iterationFile = path.join(iterationDirectory, 'iteration.json');
    const iterationArgument = path.relative(fixtureRoot, iterationFile).split(path.sep).join('/');
    const freezeFile = path.join(iterationDirectory, 'freeze.json');
    fs.mkdirSync(iterationDirectory, { recursive: true });
    const makeConfirmed = () => {
      const record = clone(sample);
      record.status = 'prototype-confirmed';
      record.affected_runtime = [routesRelativePath];
      record.stage_outputs = { product: { valid: true }, design: { valid: true } };
      record.brief_submission = createBriefSubmission(record);
      record.brief_confirmation = createBriefConfirmation(record);
      record.prototype_submission = createPrototypeSubmission(record, fixtureRoot);
      record.prototype_confirmation = createPrototypeConfirmation(record);
      return record;
    };
    const scriptFile = fs.realpathSync(path.resolve(root, process.argv[1]));
    const run = cliArgs => spawnSync(process.execPath, [scriptFile, ...cliArgs], { cwd: fixtureRoot, encoding: 'utf8' });
    const outsideIteration = path.join(fixtureRoot, 'iteration.json');
    const outsideInit = run(['init', '--file', 'iteration.json', '--iteration-id', 'outside', '--title', '越界', '--scene', scene]);
    assert(outsideInit.status !== 0 && (outsideInit.stderr || '').includes('_iterations'), 'init 未拦截非标准迭代路径');
    assert(!fs.existsSync(outsideIteration), '非法 init 不得在标准目录外写入文件');
    const traversalInit = run(['init', '--file', '../wego-escape/iteration.json', '--iteration-id', 'traversal', '--title', '穿越', '--scene', scene]);
    assert(traversalInit.status !== 0 && (traversalInit.stderr || '').includes('..'), 'init 未拦截含 .. 的仓库逃逸路径');
    const mismatchedArgument = 'wego-app/scenes/其他场景/_iterations/20260715-test-测试/iteration.json';
    const mismatchedIteration = path.join(fixtureRoot, mismatchedArgument);
    const mismatchedInit = run(['init', '--file', mismatchedArgument, '--iteration-id', 'mismatch', '--title', '错位', '--scene', scene]);
    assert(mismatchedInit.status !== 0 && (mismatchedInit.stderr || '').includes('identity.primary_scene'), 'init 未拦截 --file 与主业务场景错位');
    assert(!fs.existsSync(mismatchedIteration), '场景错位的 init 不得写入文件');
    const linkedScene = '链接场景';
    const linkedTarget = path.join(fixtureRoot, 'linked-scene-target');
    fs.mkdirSync(linkedTarget, { recursive: true });
    fs.symlinkSync(linkedTarget, path.join(fixtureRoot, 'wego-app/scenes', linkedScene));
    const linkedArgument = `wego-app/scenes/${linkedScene}/_iterations/20260715-link-链接/iteration.json`;
    const linkedInit = run(['init', '--file', linkedArgument, '--iteration-id', 'link', '--title', '链接', '--scene', linkedScene]);
    assert(linkedInit.status !== 0 && (linkedInit.stderr || '').includes('符号链接'), 'init 未拦截符号链接迭代路径');

    fs.writeFileSync(iterationFile, `${JSON.stringify(sample, null, 2)}\n`);
    const submittedBrief = run(['submit-brief', '--file', iterationArgument]);
    assert(submittedBrief.status === 0, `合法 submit-brief 失败：${(submittedBrief.stderr || submittedBrief.stdout).trim()}`);
    const submittedRecord = JSON.parse(fs.readFileSync(iterationFile, 'utf8'));
    assert(submittedRecord.status === 'awaiting-brief-confirmation' && submittedRecord.brief_submission?.scope_sha256 === scopeSha256(submittedRecord), 'submit-brief 未写入当前范围提交快照');
    submittedRecord.prototype_brief.goal = '提交后擅自修改简报';
    fs.writeFileSync(iterationFile, `${JSON.stringify(submittedRecord, null, 2)}\n`);
    const driftedBriefConfirmation = run(['confirm-brief', '--file', iterationArgument]);
    assert(driftedBriefConfirmation.status !== 0 && (driftedBriefConfirmation.stderr || '').includes('简报提交后范围已漂移'), 'confirm-brief 未拦截提交后的简报漂移');
    submittedRecord.prototype_brief.goal = sample.prototype_brief.goal;
    fs.writeFileSync(iterationFile, `${JSON.stringify(submittedRecord, null, 2)}\n`);
    const unapprovedBriefConfirmation = run(['confirm-brief', '--file', iterationArgument]);
    assert(unapprovedBriefConfirmation.status !== 0 && (unapprovedBriefConfirmation.stderr || '').includes('用户明确确认'), 'confirm-brief 未拦截缺少用户明确授权的请求');
    const validBriefConfirmation = run(['confirm-brief', '--file', iterationArgument, '--user-confirmed-brief', 'test']);
    assert(validBriefConfirmation.status === 0, `合法 confirm-brief 失败：${(validBriefConfirmation.stderr || validBriefConfirmation.stdout).trim()}`);
    assert(JSON.parse(fs.readFileSync(iterationFile, 'utf8')).status === 'prototyping', 'confirm-brief 未进入 prototyping');

    fs.writeFileSync(path.join(sceneRoot, 'scene.js'), 'INVALID_SCENE\n');
    const invalidSubmission = run(['submit-prototype', `--file=${iterationArgument}`]);
    assert(invalidSubmission.status !== 0 && (invalidSubmission.stderr || '').includes('场景验证'), 'submit-prototype 未运行静态场景验证');
    assert(JSON.parse(fs.readFileSync(iterationFile, 'utf8')).status === 'prototyping', '静态场景验证失败后不应写入原型提交');
    fs.writeFileSync(path.join(sceneRoot, 'scene.js'), 'INVALID_RUNTIME\n');
    const invalidRuntimeSubmission = run(['submit-prototype', `--file=${iterationArgument}`]);
    assert(invalidRuntimeSubmission.status !== 0 && (invalidRuntimeSubmission.stderr || '').includes('场景验证'), 'submit-prototype 未运行真实页面验证');
    assert(JSON.parse(fs.readFileSync(iterationFile, 'utf8')).status === 'prototyping', '运行时场景验证失败后不应写入原型提交');
    fs.writeFileSync(path.join(sceneRoot, 'scene.js'), 'window.testScene = true;\n');
    const validSubmission = run(['submit-prototype', '--file', iterationArgument]);
    assert(validSubmission.status === 0, `合法 submit-prototype 失败：${(validSubmission.stderr || validSubmission.stdout).trim()}`);
    const submittedPrototype = JSON.parse(fs.readFileSync(iterationFile, 'utf8'));
    assert(submittedPrototype.status === 'awaiting-prototype-confirmation' && Object.keys(submittedPrototype.prototype_submission?.fingerprints || {}).length > 0, 'submit-prototype 未写入待验收原型指纹');
    const unapprovedPrototypeConfirmation = run(['confirm-prototype', '--file', iterationArgument]);
    assert(unapprovedPrototypeConfirmation.status !== 0 && (unapprovedPrototypeConfirmation.stderr || '').includes('用户明确确认'), 'confirm-prototype 未拦截缺少用户明确授权的请求');
    fs.writeFileSync(path.join(sceneRoot, 'scene.js'), 'window.testScene = "drift-before-confirmation";\n');
    const driftedPrototypeConfirmation = run(['confirm-prototype', '--file', iterationArgument, '--user-confirmed-prototype', 'test']);
    assert(driftedPrototypeConfirmation.status !== 0 && (driftedPrototypeConfirmation.stderr || '').includes('原型提交后已漂移'), 'confirm-prototype 未拦截用户验收后的源码漂移');
    fs.writeFileSync(path.join(sceneRoot, 'scene.js'), 'window.testScene = true;\n');
    const validConfirmation = run(['confirm-prototype', '--file', iterationArgument, '--user-confirmed-prototype', 'test']);
    assert(validConfirmation.status === 0, `合法 confirm-prototype 失败：${(validConfirmation.stderr || validConfirmation.stdout).trim()}`);
    assert(JSON.parse(fs.readFileSync(iterationFile, 'utf8')).status === 'prototype-confirmed', 'confirm-prototype 只能确认原型，不得自动冻结');
    assert(!fs.existsSync(freezeFile), 'confirm-prototype 不得生成 freeze.json');

    const equalFlagResult = run(['invalidate', `--file=${iterationArgument}`, '--stage=prototype']);
    assert(equalFlagResult.status === 0, `invalidate 未支持等号参数：${(equalFlagResult.stderr || equalFlagResult.stdout).trim()}`);
    const invalidated = JSON.parse(fs.readFileSync(iterationFile, 'utf8'));
    assert(invalidated.status === 'prototyping' && invalidated.prototype_confirmation === null && invalidated.scope_revision === 1, 'invalidate --stage=prototype 状态迁移错误');

    const confirmed = makeConfirmed();
    fs.writeFileSync(iterationFile, `${JSON.stringify(confirmed, null, 2)}\n`);
    const unapprovedFreeze = run(['freeze', '--file', iterationArgument]);
    assert(unapprovedFreeze.status !== 0 && (unapprovedFreeze.stderr || '').includes('用户明确指定迭代'), 'freeze 未拦截缺少用户明确授权的请求');
    assert(JSON.parse(fs.readFileSync(iterationFile, 'utf8')).status === 'prototype-confirmed', '无用户授权的 freeze 不得改变迭代状态');
    assert(!fs.existsSync(freezeFile), '无用户授权的 freeze 不得生成 freeze.json');
    const wrongTargetFreeze = run(['freeze', '--file', iterationArgument, '--user-confirmed-freeze', 'other-iteration']);
    assert(wrongTargetFreeze.status !== 0 && (wrongTargetFreeze.stderr || '').includes('必须等于当前 iteration_id'), 'freeze 未拦截用户授权与目标迭代不一致');
    fs.writeFileSync(path.join(sceneRoot, 'scene.js'), 'window.testScene = "drift";\n');
    const driftedFreeze = run(['freeze', '--file', iterationArgument, '--user-confirmed-freeze', 'test']);
    assert(driftedFreeze.status !== 0 && (driftedFreeze.stderr || '').includes('原型确认后已漂移'), 'freeze 未拦截原型确认后的源码漂移');
    assert(JSON.parse(fs.readFileSync(iterationFile, 'utf8')).status === 'prototype-confirmed', 'freeze 失败后不应写入 frozen 状态');
    assert(!fs.existsSync(freezeFile), 'freeze 失败后不应遗留 freeze.json');

    fs.writeFileSync(path.join(sceneRoot, 'scene.js'), 'window.testScene = true;\n');
    const freezeResult = run(['freeze', `--file=${iterationArgument}`, '--user-confirmed-freeze=test']);
    assert(freezeResult.status === 0, `合法 freeze 失败：${(freezeResult.stderr || freezeResult.stdout).trim()}`);
    const frozen = JSON.parse(fs.readFileSync(iterationFile, 'utf8'));
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '合法 frozen 记录未通过复验');
    assert(Object.keys(frozen.freeze).sort().join(',') === 'at,design_system_version,fingerprints,scope_revision', 'freeze 对象字段不完整');
    assert(Object.keys(frozen.freeze.fingerprints).length === expectedFingerprintTargets(frozen).length, 'freeze fingerprints 未覆盖全部预期目标');
    assert(!Object.hasOwn(frozen.freeze.fingerprints, routesRelativePath), 'affected_runtime 中的 routes.js 不得退回整文件指纹');
    assert(Object.keys(frozen.freeze.fingerprints).some(key => key.startsWith(routeFingerprintPrefix)), 'freeze 缺少场景路由语义指纹');

    const emptyFingerprints = clone(frozen);
    emptyFingerprints.freeze.fingerprints = {};
    assert(has(emptyFingerprints, 'freeze.fingerprints 必须是非空对象', iterationFile, fixtureRoot), 'frozen 校验未拦截空 fingerprints');
    const missingFingerprint = clone(frozen);
    delete missingFingerprint.freeze.fingerprints[Object.keys(missingFingerprint.freeze.fingerprints)[0]];
    assert(has(missingFingerprint, '键集合必须等于当前预期目标', iterationFile, fixtureRoot), 'frozen 校验未拦截 fingerprint 键缺失');
    const incompleteFreeze = clone(frozen);
    delete incompleteFreeze.freeze.scope_revision;
    assert(has(incompleteFreeze, 'freeze 字段必须且只能为', iterationFile, fixtureRoot), 'frozen 校验未拦截不完整 freeze 对象');
    fs.writeFileSync(freezeFile, '{}\n');
    assert(has(frozen, 'freeze.json 必须与 iteration.json.freeze 一致', iterationFile, fixtureRoot), 'frozen 校验未拦截 freeze.json 不一致');
    fs.writeFileSync(freezeFile, `${JSON.stringify(frozen.freeze, null, 2)}\n`);

    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [${detailRoute}, ${unrelatedRoute}, ${currentRoute}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '新增无关路由不应导致旧 frozen 失败');
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [${currentRoute}, ${detailRoute}, ${duplicateRouteId}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前路由 routeId 变化失败');
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [${currentRoute}, ${detailRoute}, ${duplicateHostTab}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前 host-tab 重复失败');
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [${currentRoute}, ${detailRoute}, ${missingHostTab}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前 host-tab 缺失 tab 失败');
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [${currentRoute}, ${detailRoute}];\nwindow.WEGO_APP_ROUTES = [${unrelatedRoute}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前 routes.js 二次赋值失败');
    const duplicateRouteField = `{ routeId: 'test-route', routeId: 'runtime-route', scene: '${scene}', script: 'scenes/${scene}/scene.js', style: 'scenes/${scene}/scene.css' }`;
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [${duplicateRouteField}, ${detailRoute}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前路由重复字段失败');
    fs.writeFileSync(routesFile, `const extraRoutes = [];\nwindow.WEGO_APP_ROUTES = [${currentRoute}, ...extraRoutes, ${detailRoute}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前动态路由条目失败');
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [${currentRoute}, ${detailRoute}];\nwindow.WEGO_APP_ROUTES.push(${unrelatedRoute});\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前路由突变失败');
    const changedDetailEntry = `{ routeId: 'test-route-detail', scene: '${scene}', entry: { type: 'cell-entry', tab: 'my', parentEntry: 'test-route', label: '变更后的详情' }, script: 'scenes/${scene}/scene.js', style: 'scenes/${scene}/scene.css' }`;
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [${currentRoute}, ${changedDetailEntry}, ${unrelatedRoute}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前 entry 语义变化失败');
    const disguisedCurrentRoute = `// window.WEGO_APP_ROUTES = [${currentRoute}, ${detailRoute}];\nconst routeExample = ${JSON.stringify(currentRoute)};\n`;
    fs.writeFileSync(routesFile, `${disguisedCurrentRoute}window.WEGO_APP_ROUTES = [${unrelatedRoute}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前路由条目不存在失败');
    fs.writeFileSync(routesFile, `fake.window.WEGO_APP_ROUTES = [${currentRoute}, ${detailRoute}];\nwindow.WEGO_APP_ROUTES = [${unrelatedRoute}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前 fake.window 路由失败');
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [{ routeId: 'changed-route', scene: '${scene}', script: 'scenes/${scene}/scene.js', style: 'scenes/${scene}/scene.css' }, ${detailRoute}, ${unrelatedRoute}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前本场景 routeId 变化失败');
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [{ routeId: 'test-route', scene: '${scene}', script: 'scenes/${scene}/changed.js', style: 'scenes/${scene}/scene.css' }, ${detailRoute}, ${unrelatedRoute}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前本场景 script 变化失败');
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [{ routeId: 'test-route', scene: '${scene}', script: 'scenes/${scene}/scene.js', style: 'scenes/${scene}/changed.css' }, ${detailRoute}, ${unrelatedRoute}];\n`);
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前本场景 style 变化失败');
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [${currentRoute}, ${detailRoute}, ${unrelatedRoute}];\n`);

    fs.writeFileSync(path.join(sceneRoot, 'scene.css'), '.test { color: red; }\n');
    assert(!validate(frozen, iterationFile, fixtureRoot).length, '旧 frozen 不应因当前文件变化失败');
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
  console.log('业务迭代状态机测试通过');
}

switch (command) {
  case 'init': init(); break;
  case 'submit-brief': transition(['draft'], 'awaiting-brief-confirmation', record => {
    const errors = [
      ...briefSubmissionErrors(record),
      ...briefSufficiencyErrors(record.prototype_brief)
    ];
    if (errors.length) fail(errors.join('\n'));
    record.brief_submission = createBriefSubmission(record);
    record.stage_outputs.product.valid = true;
  }); break;
  case 'confirm-brief': transition(['awaiting-brief-confirmation'], 'prototyping', record => {
    requireUserConfirmation(record, '--user-confirmed-brief', 'confirm-brief');
    record.brief_confirmation = createBriefConfirmation(record);
  }); break;
  case 'submit-prototype': transition(['prototyping'], 'awaiting-prototype-confirmation', record => {
    validatePrototypeScenes(record);
    record.prototype_submission = createPrototypeSubmission(record);
    record.stage_outputs.design.valid = true;
  }); break;
  case 'confirm-prototype': transition(['awaiting-prototype-confirmation'], 'prototype-confirmed', record => {
    requireUserConfirmation(record, '--user-confirmed-prototype', 'confirm-prototype');
    validatePrototypeScenes(record);
    record.prototype_confirmation = createPrototypeConfirmation(record);
  }); break;
  case 'freeze': freeze(); break;
  case 'migrate': migrate(); break;
  case 'invalidate': {
    const stage = value('--stage');
    if (!['brief', 'prototype'].includes(stage)) fail('invalidate 需要 --stage brief|prototype 或 --stage=brief|prototype');
    const file = requireFile();
    const record = load(file);
    const currentErrors = validate(record, file);
    if (currentErrors.length) fail(currentErrors.join('\n'));
    const sourceError = invalidationSourceError(record, stage);
    if (sourceError) fail(sourceError);
    applyInvalidation(record, stage);
    const changedErrors = validate(record, file);
    if (changedErrors.length) fail(`invalidate 后记录非法，未写入文件：\n${changedErrors.join('\n')}`);
    save(file, record, 'invalidate');
    break;
  }
  case 'check': check(); break;
  case 'test': test(); break;
  default: fail('用法：init|submit-brief|confirm-brief --user-confirmed-brief <iteration_id>|submit-prototype|confirm-prototype --user-confirmed-prototype <iteration_id>|invalidate|migrate|freeze --user-confirmed-freeze <iteration_id>|check|test');
}
