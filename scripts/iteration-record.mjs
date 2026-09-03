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
const statuses = new Set(['draft', 'in-development', 'prototyping', 'frozen', 'blocked', 'cancelled', 'superseded']);
const briefSubmittedStatuses = new Set(['in-development', 'prototyping', 'frozen']);
const activeStatuses = new Set(['draft', 'in-development', 'prototyping', 'frozen', 'blocked']);
const prototypeModes = new Set(['functional', 'simulated', 'stub']);
const prototypeBoundaryKeys = new Set(['flow_id', 'mode', 'visible_result']);
const prototypeBriefKeys = ['goal', 'included', 'excluded', 'entry_points', 'critical_paths', 'prototype_boundaries', 'states', 'data_contract', 'assumptions', 'open_questions'];
const prototypeBriefKeySet = new Set(prototypeBriefKeys);
const prototypeBriefArrayFields = ['included', 'excluded', 'entry_points', 'critical_paths', 'states', 'assumptions', 'open_questions'];
const requiredBriefArrayFields = new Set(['included', 'entry_points', 'critical_paths', 'states']);
const iterationKeys = ['schemaVersion', 'identity', 'status', 'scope_revision', 'brief_file', 'prototype_brief', 'brief_submission', 'brief_confirmation', 'prototype_submission', 'prototype_confirmation', 'affected_scenes', 'affected_runtime', 'stage_outputs', 'change_log', 'freeze'];
const identityKeys = ['iteration_id', 'title', 'date', 'primary_scene', 'related_scenes'];
const routesRelativePath = 'wego-app/js/routes.js';
const routeFingerprintPrefix = '@route-entry/';

// 迭代分类映射：场景名 → 分类代码。新增场景时在此补充。
const sceneCategoryMap = new Map([
  // shop 相册云：内容发布、商品展示、个人中心
  ['动态', 'shop'],
  ['发布产品', 'shop'],
  ['我的', 'shop'],
  // bcg 生意云：生意经营、交易相关
  ['帮卖分销', 'bcg'],
  ['开单', 'bcg'],
  // customer 客户云：客户关系、个人中心
  ['好友列表', 'customer'],
  // infras 基础：系统工具、基础能力
  ['工作台', 'bcg'],
  ['场景管理', 'infras'],
  ['组件预览', 'infras'],
  ['应用中心', 'infras']
]);
const categoryCodes = ['shop', 'bcg', 'customer', 'infras'];

// 从文件系统解析场景名 → 分类/场景名 相对路径；目录不存在时回退到 sceneCategoryMap
function resolveSceneRelPath(scene, repositoryRoot = root) {
  const scenesRoot = path.join(repositoryRoot, 'wego-app/scenes');
  if (fs.existsSync(scenesRoot)) {
    for (const category of categoryCodes) {
      if (fs.existsSync(path.join(scenesRoot, category, scene))) return `${category}/${scene}`;
    }
  }
  const mapped = sceneCategoryMap.get(scene);
  return mapped ? `${mapped}/${scene}` : null;
}
// iteration_id 格式：{分类}{3位数字}[-{修订号}]，如 shop001、bcg003-2
const iterationIdPattern = /^(shop|bcg|customer|infras)(\d{3,})(-\d+)?$/;
const expectedStageValidity = new Map([
  ['draft', [false, false]],
  ['in-development', [true, false]],
  ['prototyping', [true, false]],
  ['frozen', [true, true]]
]);
const expectedConfirmations = new Map([
  ['draft', [false, false, false]],
  ['in-development', [true, false, false]],
  ['prototyping', [true, true, false]],
  ['frozen', [true, true, true]]
]);
const expectedPrototypeSubmissions = new Map([
  ['draft', false],
  ['in-development', false],
  ['prototyping', false],
  ['frozen', true]
]);
const invalidateSources = {
  brief: new Set(['in-development', 'prototyping', 'frozen']),
  prototype: new Set(['frozen'])
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

/**
 * 从 spec.md 解析 prototype_brief。
 * 按 ## 标题分割，标题中括号内的字段名映射到 prototype_brief 字段。
 * 列表字段解析为数组，prototype_boundaries 和 data_contract 用 ### 子标题解析。
 */
function parseBriefMarkdown(mdFile) {
  if (!fs.existsSync(mdFile)) fail(`简报文件不存在：${mdFile}`);
  const content = fs.readFileSync(mdFile, 'utf8');
  const brief = {
    goal: '',
    included: [],
    excluded: [],
    entry_points: [],
    critical_paths: [],
    prototype_boundaries: [],
    states: [],
    data_contract: {},
    assumptions: [],
    open_questions: []
  };

  // 去掉 HTML 注释
  const cleanContent = content.replace(/<!--[\s\S]*?-->/g, '');
  // 按 ## 标题分割（排除 # 一级标题）
  const sections = cleanContent.split(/^## /m).slice(1);

  for (const section of sections) {
    const lines = section.split('\n');
    const header = lines[0].trim();
    const body = lines.slice(1).join('\n').trim();

    // 提取字段名（标题中的括号内容，如 "目标（goal）" → goal）
    const fieldMatch = header.match(/[（(](\w+)[）)]/);
    if (!fieldMatch) continue;
    const field = fieldMatch[1];
    if (!prototypeBriefKeySet.has(field)) continue;

    if (field === 'goal') {
      brief.goal = body.trim();
    } else if (prototypeBriefArrayFields.includes(field)) {
      const items = body.split('\n')
        .filter(line => /^\s*-\s+/.test(line))
        .map(line => line.replace(/^\s*-\s+/, '').trim())
        .filter(Boolean);
      brief[field] = items;
    } else if (field === 'prototype_boundaries') {
      const subsections = body.split(/^### /m).slice(1);
      for (const sub of subsections) {
        const subLines = sub.split('\n');
        const flowId = subLines[0].trim();
        const subBody = subLines.slice(1).join('\n');
        const modeMatch = subBody.match(/mode:\s*(\w+)/);
        const resultMatch = subBody.match(/visible_result:\s*(.+)/);
        if (flowId && modeMatch && resultMatch) {
          brief.prototype_boundaries.push({
            flow_id: flowId,
            mode: modeMatch[1].trim(),
            visible_result: resultMatch[1].trim()
          });
        }
      }
    } else if (field === 'data_contract') {
      const subsections = body.split(/^### /m).slice(1);
      for (const sub of subsections) {
        const subLines = sub.split('\n');
        const entityName = subLines[0].trim();
        const subBody = subLines.slice(1).join('\n');
        const entity = {};
        for (const line of subBody.split('\n')) {
          const kvMatch = line.match(/^\s*-\s*([^：:]+)[：:]\s*(.+)/);
          if (kvMatch) {
            entity[kvMatch[1].trim()] = kvMatch[2].trim();
          }
        }
        if (entityName) brief.data_contract[entityName] = entity;
      }
    }
  }

  return brief;
}

function findBriefFile(iterationFile) {
  const dir = path.dirname(iterationFile);
  // 优先用 brief_file 字段
  // 否则在目录中查找 *.md（排除范围确认.md 等历史文件）
  const entries = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  // 优先找包含"需求规格"或"spec"的文件
  const specFile = entries.find(f => /需求规格|spec/i.test(f));
  if (specFile) return path.join(dir, specFile);
  // 否则取第一个 md（排除范围确认文件）
  const other = entries.find(f => !/范围确认/.test(f));
  if (other) return path.join(dir, other);
  return null;
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
  const canonical = segments.length === 7
    && segments[0] === 'wego-app'
    && segments[1] === 'scenes'
    && categoryCodes.includes(segments[2])
    && isSafeSceneName(segments[3])
    && segments[4] === '_iterations'
    && isSafeSceneName(segments[5])
    && segments[6] === 'iteration.json';
  if (!canonical) {
    errors.push('--file 必须固定为 wego-app/scenes/{分类}/{主业务场景}/_iterations/{迭代目录}/iteration.json');
    return errors;
  }
  if (expectedScene !== null && segments[3] !== expectedScene) errors.push(`--file 所属主业务场景必须与 identity.primary_scene 一致：${expectedScene}`);
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
  const relPath = resolveSceneRelPath(scene, repositoryRoot);
  if (!relPath) return { error: `场景 ${scene} 不属于任何已知分类` };
  const expectedScript = `scenes/${relPath}/scene.js`;
  const expectedStyle = `scenes/${relPath}/scene.css`;
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
function expectedFingerprintDescriptors(record, repositoryRoot = root) {
  const targets = [];
  if (Array.isArray(record.affected_runtime)) {
    targets.push(...record.affected_runtime
      .filter(relative => isSafeRepositoryPath(relative) && relative !== routesRelativePath)
      .map(relative => ({ key: relative, kind: 'file', relative })));
  }
  if (Array.isArray(record.affected_scenes)) {
    for (const scene of record.affected_scenes.filter(isSafeSceneName)) {
      const relPath = resolveSceneRelPath(scene, repositoryRoot);
      const scenePath = relPath || scene;
      for (const file of ['scene.js', 'scene.css']) {
        const relative = `wego-app/scenes/${scenePath}/${file}`;
        targets.push({ key: relative, kind: 'file', relative });
      }
      targets.push({ key: `${routeFingerprintPrefix}${encodeURIComponent(scene)}`, kind: 'route', scene });
    }
  }
  return [...new Map(targets.map(target => [target.key, target])).values()].sort((left, right) => left.key.localeCompare(right.key));
}
function expectedFingerprintTargets(record, repositoryRoot = root) {
  return expectedFingerprintDescriptors(record, repositoryRoot).map(target => target.key);
}
function fingerprintShapeErrors(fingerprints, record, prefix, repositoryRoot = root) {
  const errors = [];
  const descriptors = expectedFingerprintDescriptors(record, repositoryRoot);
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
  const errors = fingerprintShapeErrors(fingerprints, record, prefix, repositoryRoot);
  if (errors.length) return errors;
  const descriptors = expectedFingerprintDescriptors(record, repositoryRoot);
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
function confirmationErrors(record, file, repositoryRoot, options = {}) {
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
      else if (!options.skipDrift && record.brief_submission.scope_sha256 !== scopeSha256(record)) errors.push(`${file}: brief_submission.scope_sha256 与当前范围不一致（简报提交后范围已漂移）`);
    }
  }
  if (briefPresent) {
    errors.push(...exactKeysErrors(record.brief_confirmation, ['at', 'scope_revision', 'scope_sha256'], `${file}: brief_confirmation`));
    if (isPlainObject(record.brief_confirmation)) {
      if (!isIsoTimestamp(record.brief_confirmation.at)) errors.push(`${file}: brief_confirmation.at 必须为 ISO 时间`);
      if (record.brief_confirmation.scope_revision !== record.scope_revision) errors.push(`${file}: brief_confirmation 必须绑定当前 scope_revision`);
      if (typeof record.brief_confirmation.scope_sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(record.brief_confirmation.scope_sha256)) errors.push(`${file}: brief_confirmation.scope_sha256 必须是 SHA-256`);
      else if (!options.skipDrift && record.brief_confirmation.scope_sha256 !== scopeSha256(record)) errors.push(`${file}: brief_confirmation.scope_sha256 与当前范围不一致（范围确认后已漂移）`);
    }
  }
  if (prototypeSubmissionPresent) {
    errors.push(...exactKeysErrors(record.prototype_submission, ['at', 'scope_revision', 'affected_scenes', 'fingerprints'], `${file}: prototype_submission`));
    if (isPlainObject(record.prototype_submission)) {
      if (!isIsoTimestamp(record.prototype_submission.at)) errors.push(`${file}: prototype_submission.at 必须为 ISO 时间`);
      if (record.prototype_submission.scope_revision !== record.scope_revision) errors.push(`${file}: prototype_submission 必须绑定当前 scope_revision`);
      if (stableJson(record.prototype_submission.affected_scenes) !== stableJson(record.affected_scenes)) errors.push(`${file}: prototype_submission.affected_scenes 必须等于当前 affected_scenes`);
      const prototypeSubmissionCheck = options.skipDrift ? fingerprintShapeErrors : (record.status === 'frozen' ? fingerprintShapeErrors : fingerprintErrors);
      errors.push(...prototypeSubmissionCheck(record.prototype_submission.fingerprints, record, `${file}: prototype_submission`, repositoryRoot, '原型提交后已漂移'));
    }
  }
  if (prototypePresent) {
    errors.push(...exactKeysErrors(record.prototype_confirmation, ['at', 'scope_revision', 'affected_scenes', 'fingerprints'], `${file}: prototype_confirmation`));
    if (isPlainObject(record.prototype_confirmation)) {
      if (!isIsoTimestamp(record.prototype_confirmation.at)) errors.push(`${file}: prototype_confirmation.at 必须为 ISO 时间`);
      if (record.prototype_confirmation.scope_revision !== record.scope_revision) errors.push(`${file}: prototype_confirmation 必须绑定当前 scope_revision`);
      if (stableJson(record.prototype_confirmation.affected_scenes) !== stableJson(record.affected_scenes)) errors.push(`${file}: prototype_confirmation.affected_scenes 必须等于当前 affected_scenes`);
      const prototypeConfirmationCheck = options.skipDrift ? fingerprintShapeErrors : (record.status === 'frozen' ? fingerprintShapeErrors : fingerprintErrors);
      errors.push(...prototypeConfirmationCheck(record.prototype_confirmation.fingerprints, record, `${file}: prototype_confirmation`, repositoryRoot, '原型确认后已漂移'));
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
    errors.push(...fingerprintShapeErrors(record.freeze.fingerprints, record, `${file}: freeze`, repositoryRoot));
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
function validate(record, file, repositoryRoot = root, options = {}) {
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
  // brief_file 校验：仅在 file 为真实路径且状态非 draft 时校验
  if (record.status !== 'draft' && record.brief_file && fs.existsSync(file)) {
    const briefPath = path.resolve(path.dirname(file), record.brief_file);
    if (!fs.existsSync(briefPath)) errors.push(`${file}: brief_file 指向的文件不存在：${record.brief_file}`);
  }
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
  errors.push(...confirmationErrors(record, file, repositoryRoot, options));
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

function generateBriefTemplate(record) {
  const id = record.identity.iteration_id;
  const title = record.identity.title;
  const date = record.identity.date;
  const scene = record.identity.primary_scene;
  return `# ${title} 需求规格说明

## 元信息

- **迭代 ID**：${id}
- **主场景**：${scene}
- **关联场景**：无
- **创建日期**：${date}
- **状态**：draft
- **输入来源**：

---

## 目标（goal）

<!-- 必填，字符串。说明这个迭代要解决什么问题、为谁创造什么价值。 -->

---

## 纳入范围（included）

<!-- 必填，数组。每条写清本次做什么，禁止只写名词。 -->

- {功能点 1：做什么 + 做到什么程度}

---

## 不纳入范围（excluded）

<!-- 必填，数组。明确不做的事项，防止范围蔓延。 -->

- {明确不做的事项}

---

## 入口（entry_points）

<!-- 必填，数组。说明入口属于哪个宿主区域/页面/流程节点、何时可见、触发条件。 -->

- {入口 1：位置 + 可见条件 + 触发方式}

---

## 关键路径（critical_paths）

<!-- 必填，数组。每条 = 可独立测试的完整流程，写「起点 → 操作 → 中间态 → 结果」，首尾闭环。核心流程加 [P1] 前缀。 -->

- [P1] {起点} → {操作} → {中间态} → {结果}

---

## 原型边界（prototype_boundaries）

<!-- 必填，数组。每个流程用 ### 子标题，flow-id 为唯一 kebab-case。 -->

### {flow-id-1}

- mode: functional
  <!-- functional：用户必须真实操作并看到状态变化 -->
  <!-- simulated：无后端，但完整模拟体验和结果 -->
  <!-- stub：只表达入口或边界，仍需提供可见反馈 -->
- visible_result: {用户可见的明确结果}

---

## 状态（states）

<!-- 必填，数组。每条写「标识：进入条件 → 可感知结果」，禁止只写名词。 -->
<!-- 必须覆盖：默认主态、加载态、失败态、空状态（含数据产生入口引导）。 -->

- 默认主态：{进入条件} → {可感知结果}
- 加载态：{进入条件} → {可感知结果}
- 失败态：{进入条件} → {可感知结果（失败提示 + 重试/关闭）}
- 空状态：{进入条件} → {可感知结果（含数据产生入口引导）}

---

## 数据契约（data_contract）

<!-- 必填，非空对象。每个数据实体用 ### 子标题。 -->
<!-- 硬规则：数据必须有产生入口（发布/新建/录入流程），禁止静态种子降级。 -->

### {数据实体 1}

- 字段：{字段名、类型、约束}
- 产生入口：{哪个流程写入（必须对应 included/critical_paths 中的发布/新建/录入流程）}
- 展示位置：{在哪里展示}
- 修改方式：{如何修改/删除}

---

## 假设（assumptions）

<!-- 可选，数组。低风险、可逆、已写明影响的假设。 -->

- {低风险、可逆、已写明影响的假设}

---

## 待确认问题（open_questions）

<!-- 提交前必须清空。每个问题解决后写回对应业务字段。 -->

- {待确认问题 1}

---

## 澄清记录（Clarifications）

<!-- 可选。记录需求沟通中的问答，按日期分组。已确认的结论必须同步写回上方对应业务字段。 -->

### Session {YYYY-MM-DD}

- Q: {问题} → A: {回答}
`;
}

// 根据场景名判断分类代码：优先从目录结构解析，回退到映射表，最后默认 infras
function classifyScene(scene) {
  const scenesRoot = path.join(root, 'wego-app/scenes');
  if (fs.existsSync(scenesRoot)) {
    for (const category of categoryCodes) {
      if (fs.existsSync(path.join(scenesRoot, category, scene))) return category;
    }
  }
  return sceneCategoryMap.get(scene) || 'infras';
}

// 扫描所有迭代，计算指定分类的下一个编号（最大编号+1，格式化为3位）
function nextIterationNumber(category) {
  const scenesRoot = path.join(root, 'wego-app/scenes');
  if (!fs.existsSync(scenesRoot)) return 1;
  let maxNum = 0;
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile() && entry.name === 'iteration.json') {
        try {
          const record = JSON.parse(fs.readFileSync(target, 'utf8'));
          const id = record.identity?.iteration_id || '';
          const match = id.match(iterationIdPattern);
          if (match && match[1] === category) {
            const num = parseInt(match[2], 10);
            if (num > maxNum) maxNum = num;
          }
        } catch { /* 忽略无法解析的记录 */ }
      }
    }
  };
  visit(scenesRoot);
  return maxNum + 1;
}

// 生成建议的 iteration_id：{分类}{3位编号}
function suggestIterationId(scene) {
  const category = classifyScene(scene);
  const num = nextIterationNumber(category);
  return `${category}${String(num).padStart(3, '0')}`;
}

function init() {
  let id = value('--iteration-id');
  const title = value('--title');
  const scene = value('--scene');
  if (!title || !scene) fail('init 需要 --title、--scene（--iteration-id 可选，不传则自动生成）');
  if (!isSafeSceneName(scene)) fail('--scene 必须是单层安全场景名');
  // 未传 --iteration-id 时自动生成：{分类}{3位编号}
  if (!id) {
    id = suggestIterationId(scene);
    console.log(`自动生成迭代 ID：${id}（分类：${classifyScene(scene)}）`);
  } else if (!iterationIdPattern.test(id)) {
    console.warn(`警告：iteration_id "${id}" 不符合规范格式 {分类}{3位编号}[-修订号]（如 shop001、bcg003-2），仍将使用`);
  }
  const file = requireFile(scene);
  if (fs.existsSync(file)) fail(`${file} 已存在`);
  const today = new Date().toISOString().slice(0, 10);
  const briefFileName = `${id}-${title}-${today.replace(/-/g, '')}.md`;
  const record = {
    schemaVersion: 6,
    identity: { iteration_id: id, title, date: today, primary_scene: scene, related_scenes: [] },
    status: 'draft',
    scope_revision: 1,
    brief_file: briefFileName,
    prototype_brief: { goal: '', included: [], excluded: [], entry_points: [], critical_paths: [], prototype_boundaries: [], states: [], data_contract: {}, assumptions: [], open_questions: [] },
    brief_submission: null,
    brief_confirmation: null,
    prototype_submission: null,
    prototype_confirmation: null,
    affected_scenes: [scene],
    affected_runtime: [],
    stage_outputs: { product: { valid: false }, design: { valid: false } },
    change_log: [],
    freeze: null
  };
  const errors = validate(record, file);
  if (errors.length) fail(errors.join('\n'));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // 生成 spec.md 模板
  const briefPath = path.join(path.dirname(file), briefFileName);
  fs.writeFileSync(briefPath, generateBriefTemplate(record));
  save(file, record, 'init');
  console.log(`已创建迭代：${id}`);
  console.log(`简报文件：${briefFileName}`);
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
 */
function briefSufficiencyErrors(brief) {
  const errors = [];
  if (!isPlainObject(brief)) return errors;

  // A. states 必须覆盖加载态、失败态、空状态
  const states = (brief.states || []).filter(item => typeof item === 'string');
  const joinedStates = states.join(' ');
  if (!states.length) return errors;
  if (!/加载|loading/i.test(joinedStates)) errors.push('prototype_brief.states 必须包含加载态（如 loading，写明进入条件与即见结果）');
  if (!/(失败|error|fault)/i.test(joinedStates)) errors.push('prototype_brief.states 必须包含失败态（如加载/保存失败，写明提示与重试/关闭）');
  if (!/(空|empty|无数据|无结果)/.test(joinedStates)) errors.push('prototype_brief.states 必须包含空状态（列表空 / 搜索空结果，写明引导入口）');

  // 每个 state 须写成「进入条件 → 可感知结果」
  const vague = states.filter(s => s === s.replace(/[：:→，,；;]/g, ''));
  if (vague.length) errors.push(`prototype_brief.states 存在未写输入条件/可感知结果的粗糙状态：${vague.slice(0, 3).map(s => `「${s}」`).join('、')}（每个状态应为「标识：进入条件 → 可感知结果」）`);

  // B. 禁止用静态种子/本地模拟代替真实数据产生入口
  const forbidSeedWords = /种子|内置数据|预置|mock|模拟数据|seed/i;
  const forbiddenText = [...(brief.assumptions || []), ...(brief.data_contract && typeof brief.data_contract === 'object' ? [String(brief.data_contract)] : [])].join(' ');
  if (forbidSeedWords.test(forbiddenText)) {
    errors.push('prototype_brief 不得用「内置种子/mock/预置模拟数据」代替数据产生入口；数据必须通过发布/新建流程写入（localStorage 可作为存储位置，但写入通道必须是真实交互流程）');
  }

  // C. 数据必须有产生入口
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
    const relPath = resolveSceneRelPath(scene);
    if (!relPath) fail(`场景 ${scene} 不属于任何已知分类`);
    const sceneDirectory = `wego-app/scenes/${relPath}`;
    const result = spawnSync(process.execPath, ['scripts/validate-scene-contract.mjs', sceneDirectory, '--json'], { cwd: root, encoding: 'utf8' });
    if (result.status !== 0) fail(`${sceneDirectory} 未通过场景验证：${(result.stderr || result.stdout || '未知错误').trim()}`);
  }
}
function collectFingerprints(record, repositoryRoot = root) {
  const fingerprints = {};
  for (const descriptor of expectedFingerprintDescriptors(record, repositoryRoot)) {
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
  if (!invalidateSources[stage]?.has(record.status)) return `当前状态 ${record.status} 不能执行 invalidate --stage=${stage}`;
  return null;
}
// blocked 不新增顶层字段：恢复目标由不可变的提交/确认快照推导
// （blocked 期间无任何命令可修改这些快照，推导结果稳定）
function resumeTargetOf(record) {
  if (record.brief_confirmation) return 'prototyping';
  if (record.brief_submission) return 'in-development';
  return 'draft';
}
const blockSources = new Set(['draft', 'in-development', 'prototyping']);
const terminateSources = new Set(['draft', 'in-development', 'prototyping', 'blocked']);
const terminateTargets = new Set(['cancelled', 'superseded']);
function applyInvalidation(record, stage) {
  record.status = stage === 'brief' ? 'draft' : 'prototyping';
  if (stage === 'brief') {
    record.scope_revision += 1;
    record.brief_submission = null;
    record.brief_confirmation = null;
    record.prototype_submission = null;
    record.prototype_confirmation = null;
    record.freeze = null;
    record.stage_outputs = { product: { valid: false }, design: { valid: false } };
  } else {
    record.prototype_submission = null;
    record.prototype_confirmation = null;
    record.freeze = null;
    record.stage_outputs.design.valid = false;
  }
}
function migrateLegacyRecord(record) {
  if (record.schemaVersion !== 5) fail('migrate 只支持 schemaVersion 5 的迭代记录');
  record.schemaVersion = 6;
  if (!Object.hasOwn(record, 'prototype_submission')) record.prototype_submission = null;
  if (['awaiting-prototype-confirmation', 'prototype-confirmed'].includes(record.status)) {
    // 旧中间态已取消，回到 prototyping 重新验收
    record.status = 'prototyping';
    record.prototype_submission = null;
    record.prototype_confirmation = null;
    record.stage_outputs.design.valid = false;
  } else if (record.status === 'frozen') {
    if (!isPlainObject(record.prototype_confirmation)) {
      fail('已冻结的旧迭代缺少 prototype_confirmation，无法安全迁移');
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
function acceptAndFreeze() {
  const file = requireFile();
  const record = load(file);
  // 用户授权
  requireUserConfirmation(record, '--user-confirmed-prototype', 'submit-prototype');
  const errors = validate(record, file);
  if (errors.length) fail(errors.join('\n'));
  if (record.status !== 'prototyping') fail(`${file}: 当前状态 ${record.status} 不能执行 submit-prototype`);
  // 场景静态验证
  validatePrototypeScenes(record);
  // 固定原型提交指纹
  record.prototype_submission = createPrototypeSubmission(record);
  record.stage_outputs.design.valid = true;
  // 原型确认（连续执行，确认指纹与提交一致）
  record.prototype_confirmation = createPrototypeConfirmation(record);
  // 冻结归档
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
    fail(`submit-prototype 后记录非法，未写入 iteration.json：\n${changedErrors.join('\n')}`);
  }
  save(file, record, 'submit-prototype');
  console.log(`原型已验收并冻结，状态：frozen`);
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
  const sample = { schemaVersion: 6, identity: { iteration_id: 'test', title: '测试', date: '2026-07-15', primary_scene: '测试场景', related_scenes: [] }, status: 'draft', scope_revision: 1, brief_file: 'test-测试-20260715.md', prototype_brief: { goal: '', included: [], excluded: [], entry_points: [], critical_paths: [], prototype_boundaries: [], states: [], data_contract: {}, assumptions: [], open_questions: [] }, brief_submission: null, brief_confirmation: null, prototype_submission: null, prototype_confirmation: null, affected_scenes: ['测试场景'], affected_runtime: [], stage_outputs: { product: { valid: false }, design: { valid: false } }, change_log: [], freeze: null };

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
  const inDevelopment = clone(sample);
  inDevelopment.status = 'in-development';
  inDevelopment.stage_outputs.product.valid = true;
  inDevelopment.brief_submission = createBriefSubmission(inDevelopment);
  assert(!validate(inDevelopment, 'sample').length, '确认矩阵错误拦截合法 in-development 状态');
  const frozenForInvalidation = clone(prototyping);
  frozenForInvalidation.status = 'frozen';
  frozenForInvalidation.stage_outputs.design.valid = true;
  frozenForInvalidation.prototype_submission = { at: new Date().toISOString(), scope_revision: 1, affected_scenes: ['测试场景'], fingerprints: { 'wego-app/scenes/infras/测试场景/scene.js': 'abc' } };
  frozenForInvalidation.prototype_confirmation = { at: new Date().toISOString(), scope_revision: 1, affected_scenes: ['测试场景'], fingerprints: { 'wego-app/scenes/infras/测试场景/scene.js': 'abc' } };
  frozenForInvalidation.freeze = { at: new Date().toISOString(), design_system_version: 1, scope_revision: 1, fingerprints: {} };
  applyInvalidation(frozenForInvalidation, 'prototype');
  assert(frozenForInvalidation.status === 'prototyping' && frozenForInvalidation.scope_revision === 1 && frozenForInvalidation.prototype_submission === null && frozenForInvalidation.prototype_confirmation === null && frozenForInvalidation.freeze === null && !validate(frozenForInvalidation, 'sample').length, 'prototype 失效必须从 frozen 回到 prototyping 并清除提交、确认和冻结快照');
  const legacyAwaitingPrototype = clone(sample);
  legacyAwaitingPrototype.schemaVersion = 5;
  legacyAwaitingPrototype.status = 'awaiting-prototype-confirmation';
  legacyAwaitingPrototype.stage_outputs = { product: { valid: true }, design: { valid: true } };
  legacyAwaitingPrototype.brief_submission = createBriefSubmission(legacyAwaitingPrototype);
  legacyAwaitingPrototype.brief_confirmation = createBriefConfirmation(legacyAwaitingPrototype);
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
    const sceneRoot = path.join(fixtureRoot, 'wego-app/scenes/infras', scene);
    fs.mkdirSync(sceneRoot, { recursive: true });
    fs.mkdirSync(path.join(fixtureRoot, 'wego-app/js'), { recursive: true });
    fs.mkdirSync(path.join(fixtureRoot, '.codex/skills/wego-design'), { recursive: true });
    fs.mkdirSync(path.join(fixtureRoot, 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(sceneRoot, 'scene.js'), 'window.testScene = true;\n');
    fs.writeFileSync(path.join(sceneRoot, 'scene.css'), '.test { color: var(--color-text); }\n');
    const currentRoute = `{ routeId: 'test-route', scene: '${scene}', entry: { type: 'host-tab', tab: 'my', label: '测试' }, script: 'scenes/infras/${scene}/scene.js', style: 'scenes/infras/${scene}/scene.css' }`;
    const detailRoute = `{ routeId: 'test-route-detail', scene: '${scene}', script: './scenes/infras/${scene}/scene.js', style: './scenes/infras/${scene}/scene.css' }`;
    const unrelatedRoute = "{ routeId: 'other-route', script: 'scenes/shop/其他场景/scene.js', style: 'scenes/shop/其他场景/scene.css' }";
    const duplicateRouteId = "{ routeId: 'test-route', scene: '其他场景', script: 'scenes/shop/其他场景/scene.js', style: 'scenes/shop/其他场景/scene.css' }";
    const duplicateHostTab = "{ routeId: 'other-host-tab', scene: '其他场景', entry: { type: 'host-tab', tab: 'my' }, script: 'scenes/shop/其他场景/scene.js', style: 'scenes/shop/其他场景/scene.css' }";
    const missingHostTab = "{ routeId: 'missing-host-tab', scene: '其他场景', entry: { type: 'host-tab' }, script: 'scenes/shop/其他场景/scene.js', style: 'scenes/shop/其他场景/scene.css' }";
    const routesFile = path.join(fixtureRoot, routesRelativePath);
    fs.writeFileSync(routesFile, `window.WEGO_APP_ROUTES = [${currentRoute}, ${detailRoute}];\n`);
    fs.writeFileSync(path.join(fixtureRoot, '.codex/skills/wego-design/metadata.json'), '{"version":411}\n');
    fs.writeFileSync(path.join(fixtureRoot, 'scripts/validate-scene-contract.mjs'), `import fs from 'node:fs';\nimport path from 'node:path';\nconst source = fs.readFileSync(path.join(process.argv[2], 'scene.js'), 'utf8');\nif (source.includes('INVALID_SCENE')) { console.error('场景合同失败'); process.exit(1); }\n`);
    const iterationDirectory = path.join(sceneRoot, '_iterations/20260715-test-测试');
    const iterationFile = path.join(iterationDirectory, 'iteration.json');
    const iterationArgument = path.relative(fixtureRoot, iterationFile).split(path.sep).join('/');
    const freezeFile = path.join(iterationDirectory, 'freeze.json');
    fs.mkdirSync(iterationDirectory, { recursive: true });
    const scriptFile = fs.realpathSync(path.resolve(root, process.argv[1]));
    const run = cliArgs => spawnSync(process.execPath, [scriptFile, ...cliArgs], { cwd: fixtureRoot, encoding: 'utf8' });
    const outsideIteration = path.join(fixtureRoot, 'iteration.json');
    const outsideInit = run(['init', '--file', 'iteration.json', '--iteration-id', 'outside', '--title', '越界', '--scene', scene]);
    assert(outsideInit.status !== 0 && (outsideInit.stderr || '').includes('_iterations'), 'init 未拦截非标准迭代路径');
    assert(!fs.existsSync(outsideIteration), '非法 init 不得在标准目录外写入文件');
    const traversalInit = run(['init', '--file', '../wego-escape/iteration.json', '--iteration-id', 'traversal', '--title', '穿越', '--scene', scene]);
    assert(traversalInit.status !== 0 && (traversalInit.stderr || '').includes('..'), 'init 未拦截含 .. 的仓库逃逸路径');
    const mismatchedArgument = 'wego-app/scenes/shop/其他场景/_iterations/20260715-test-测试/iteration.json';
    const mismatchedIteration = path.join(fixtureRoot, mismatchedArgument);
    const mismatchedInit = run(['init', '--file', mismatchedArgument, '--iteration-id', 'mismatch', '--title', '错位', '--scene', scene]);
    assert(mismatchedInit.status !== 0 && (mismatchedInit.stderr || '').includes('identity.primary_scene'), 'init 未拦截 --file 与主业务场景错位');
    assert(!fs.existsSync(mismatchedIteration), '场景错位的 init 不得写入文件');
    const linkedScene = '链接场景';
    const linkedTarget = path.join(fixtureRoot, 'linked-scene-target');
    fs.mkdirSync(linkedTarget, { recursive: true });
    fs.mkdirSync(path.join(fixtureRoot, 'wego-app/scenes/infras'), { recursive: true });
    fs.symlinkSync(linkedTarget, path.join(fixtureRoot, 'wego-app/scenes/infras', linkedScene));
    const linkedArgument = `wego-app/scenes/infras/${linkedScene}/_iterations/20260715-link-链接/iteration.json`;
    const linkedInit = run(['init', '--file', linkedArgument, '--iteration-id', 'link', '--title', '链接', '--scene', linkedScene]);
    assert(linkedInit.status !== 0 && (linkedInit.stderr || '').includes('符号链接'), 'init 未拦截符号链接迭代路径');

    fs.writeFileSync(iterationFile, `${JSON.stringify(sample, null, 2)}\n`);
    // 创建有效的 spec.md 供 submit-brief 解析
    const briefMdPath = path.join(iterationDirectory, 'test-测试-20260715.md');
    fs.writeFileSync(briefMdPath, `# 测试 需求规格说明

## 目标（goal）
测试目标

## 纳入范围（included）
- 发布商品

## 不纳入范围（excluded）
- 不做的事项

## 入口（entry_points）
- 工作台商品管理

## 关键路径（critical_paths）
- [P1] 进入发布 → 填写信息 → 完成发布

## 原型边界（prototype_boundaries）

### publish-product
- mode: functional
- visible_result: 用户完成发布并看到成功结果

## 状态（states）
- 默认主态：页面加载完成 → 展示商品列表
- 加载态：数据读取中 → 显示 loading 骨架
- 失败态：加载接口失败 → 失败提示 + 重试/关闭
- 空状态：无商品数据 → 空状态 + 引导新建

## 数据契约（data_contract）

### product
- 字段：title 字符串、price 数字
- 产生入口：发布商品表单提交
- 展示位置：商品列表
- 修改方式：编辑表单修改

## 假设（assumptions）
- 用户已登录

## 待确认问题（open_questions）

## 澄清记录（Clarifications）
`);
    const submittedBrief = run(['submit-brief', '--file', iterationArgument]);
    assert(submittedBrief.status === 0, `合法 submit-brief 失败：${(submittedBrief.stderr || submittedBrief.stdout).trim()}`);
    const submittedRecord = JSON.parse(fs.readFileSync(iterationFile, 'utf8'));
    assert(submittedRecord.status === 'in-development' && submittedRecord.brief_submission?.scope_sha256 === scopeSha256(submittedRecord), 'submit-brief 未写入当前范围提交快照');
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
    const invalidSubmission = run(['submit-prototype', `--file=${iterationArgument}`, '--user-confirmed-prototype', 'test']);
    assert(invalidSubmission.status !== 0 && (invalidSubmission.stderr || '').includes('场景验证'), 'submit-prototype 未运行静态场景验证');
    assert(JSON.parse(fs.readFileSync(iterationFile, 'utf8')).status === 'prototyping', '静态场景验证失败后不应写入原型提交');
    assert(!fs.existsSync(freezeFile), '场景验证失败后不应生成 freeze.json');
    fs.writeFileSync(path.join(sceneRoot, 'scene.js'), 'window.testScene = true;\n');
    const unapprovedSubmission = run(['submit-prototype', '--file', iterationArgument]);
    assert(unapprovedSubmission.status !== 0 && (unapprovedSubmission.stderr || '').includes('用户明确确认'), 'submit-prototype 未拦截缺少用户明确授权的请求');
    assert(JSON.parse(fs.readFileSync(iterationFile, 'utf8')).status === 'prototyping', '无用户授权的 submit-prototype 不得改变状态');
    assert(!fs.existsSync(freezeFile), '无用户授权的 submit-prototype 不得生成 freeze.json');
    const wrongTargetSubmission = run(['submit-prototype', '--file', iterationArgument, '--user-confirmed-prototype', 'other-iteration']);
    assert(wrongTargetSubmission.status !== 0 && (wrongTargetSubmission.stderr || '').includes('必须等于当前 iteration_id'), 'submit-prototype 未拦截用户授权与目标迭代不一致');
    const validSubmission = run(['submit-prototype', '--file', iterationArgument, '--user-confirmed-prototype', 'test']);
    assert(validSubmission.status === 0, `合法 submit-prototype 失败：${(validSubmission.stderr || validSubmission.stdout).trim()}`);
    const submittedPrototype = JSON.parse(fs.readFileSync(iterationFile, 'utf8'));
    assert(submittedPrototype.status === 'frozen' && Object.keys(submittedPrototype.prototype_submission?.fingerprints || {}).length > 0, 'submit-prototype 未直接验收并冻结');
    assert(fs.existsSync(freezeFile), 'submit-prototype 应生成 freeze.json');
    assert(!validate(submittedPrototype, iterationFile, fixtureRoot).length, '合法 frozen 记录未通过复验');
    assert(Object.keys(submittedPrototype.freeze).sort().join(',') === 'at,design_system_version,fingerprints,scope_revision', 'freeze 对象字段不完整');
    assert(Object.keys(submittedPrototype.freeze.fingerprints).length === expectedFingerprintTargets(submittedPrototype, fixtureRoot).length, 'freeze fingerprints 未覆盖全部预期目标');
    assert(!Object.hasOwn(submittedPrototype.freeze.fingerprints, routesRelativePath), 'affected_runtime 中的 routes.js 不得退回整文件指纹');
    assert(Object.keys(submittedPrototype.freeze.fingerprints).some(key => key.startsWith(routeFingerprintPrefix)), 'freeze 缺少场景路由语义指纹');

    const equalFlagResult = run(['invalidate', `--file=${iterationArgument}`, '--stage=prototype']);
    assert(equalFlagResult.status === 0, `invalidate 未支持等号参数：${(equalFlagResult.stderr || equalFlagResult.stdout).trim()}`);
    const invalidated = JSON.parse(fs.readFileSync(iterationFile, 'utf8'));
    assert(invalidated.status === 'prototyping' && invalidated.prototype_confirmation === null && invalidated.prototype_submission === null && invalidated.freeze === null && invalidated.scope_revision === 1, 'invalidate --stage=prototype 状态迁移错误');
    assert(!fs.existsSync(freezeFile), 'invalidate --stage=prototype 应删除 freeze.json');

    const resubmit = run(['submit-prototype', '--file', iterationArgument, '--user-confirmed-prototype=test']);
    assert(resubmit.status === 0, `失效后重新 submit-prototype 失败：${(resubmit.stderr || resubmit.stdout).trim()}`);
    const frozen = JSON.parse(fs.readFileSync(iterationFile, 'utf8'));
    assert(frozen.status === 'frozen', '失效后重新提交未回到 frozen');

    // block / resume / terminate 状态出口测试
    assert(resumeTargetOf(prototyping) === 'prototyping' && resumeTargetOf(inDevelopment) === 'in-development' && resumeTargetOf(sample) === 'draft', 'resume 目标推导与提交/确认快照不一致');
    assert(run(['invalidate', '--file', iterationArgument, '--stage=prototype']).status === 0, '出口测试前置 invalidate 失败');
    const unapprovedTermination = run(['terminate', '--file', iterationArgument, '--target', 'cancelled']);
    assert(unapprovedTermination.status !== 0 && (unapprovedTermination.stderr || '').includes('用户明确确认'), 'terminate 未拦截缺少用户明确授权的请求');
    const invalidTerminationTarget = run(['terminate', '--file', iterationArgument, '--user-confirmed-termination', 'test', '--target', 'paused']);
    assert(invalidTerminationTarget.status !== 0 && (invalidTerminationTarget.stderr || '').includes('--target'), 'terminate 未拦截非法目标状态');
    const blockedResult = run(['block', '--file', iterationArgument]);
    assert(blockedResult.status === 0, `合法 block 失败：${(blockedResult.stderr || blockedResult.stdout).trim()}`);
    assert(JSON.parse(fs.readFileSync(iterationFile, 'utf8')).status === 'blocked', 'block 未进入 blocked');
    const blockedSubmission = run(['submit-prototype', '--file', iterationArgument, '--user-confirmed-prototype', 'test']);
    assert(blockedSubmission.status !== 0 && (blockedSubmission.stderr || '').includes('不能执行'), 'blocked 状态不得执行 submit-prototype');
    const blockedBriefConfirmation = run(['confirm-brief', '--file', iterationArgument, '--user-confirmed-brief', 'test']);
    assert(blockedBriefConfirmation.status !== 0, 'blocked 状态不得执行 confirm-brief');
    const doubleBlock = run(['block', '--file', iterationArgument]);
    assert(doubleBlock.status !== 0 && (doubleBlock.stderr || '').includes('不能执行'), 'blocked 状态不得重复 block');
    const resumeResult = run(['resume', '--file', iterationArgument]);
    assert(resumeResult.status === 0, `合法 resume 失败：${(resumeResult.stderr || resumeResult.stdout).trim()}`);
    assert(JSON.parse(fs.readFileSync(iterationFile, 'utf8')).status === 'prototyping', 'resume 未回到中断前状态');
    const resumeFromPrototyping = run(['resume', '--file', iterationArgument]);
    assert(resumeFromPrototyping.status !== 0, '非 blocked 状态不得执行 resume');
    run(['block', '--file', iterationArgument]);
    const wrongTargetTermination = run(['terminate', '--file', iterationArgument, '--user-confirmed-termination', 'other-iteration', '--target', 'cancelled']);
    assert(wrongTargetTermination.status !== 0 && (wrongTargetTermination.stderr || '').includes('必须等于当前 iteration_id'), 'terminate 未拦截授权与目标迭代不一致');
    const cancelledTermination = run(['terminate', '--file', iterationArgument, '--user-confirmed-termination', 'test', '--target', 'cancelled']);
    assert(cancelledTermination.status === 0, `合法 terminate 失败：${(cancelledTermination.stderr || cancelledTermination.stdout).trim()}`);
    const cancelledRecord = JSON.parse(fs.readFileSync(iterationFile, 'utf8'));
    assert(cancelledRecord.status === 'cancelled' && cancelledRecord.freeze === null, 'terminate 未进入 cancelled');
    const resumeFromCancelled = run(['resume', '--file', iterationArgument]);
    assert(resumeFromCancelled.status !== 0, '终态 cancelled 不得 resume');
    fs.writeFileSync(iterationFile, `${JSON.stringify(sample, null, 2)}\n`);
    const supersededTermination = run(['terminate', '--file', iterationArgument, '--user-confirmed-termination', 'test', '--target', 'superseded']);
    assert(supersededTermination.status === 0, `draft 状态 terminate 失败：${(supersededTermination.stderr || supersededTermination.stdout).trim()}`);
    assert(JSON.parse(fs.readFileSync(iterationFile, 'utf8')).status === 'superseded', 'terminate 未从 draft 进入 superseded');

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
  case 'suggest-id': {
    const scene = value('--scene');
    if (!scene) fail('suggest-id 需要 --scene');
    if (!isSafeSceneName(scene)) fail('--scene 必须是单层安全场景名');
    const id = suggestIterationId(scene);
    console.log(`建议迭代 ID：${id}`);
    console.log(`分类：${classifyScene(scene)}`);
    break;
  }
  case 'init': init(); break;
  case 'submit-brief': {
    // submit-brief 支持从 draft 和 in-development 状态执行
    // 从 spec.md 读取简报，解析为 prototype_brief 快照
    const file = requireFile();
    const record = load(file);
    const errors = validate(record, file);
    if (errors.length) fail(errors.join('\n'));
    if (!['draft', 'in-development'].includes(record.status)) fail(`${file}: 当前状态 ${record.status} 不能执行 submit-brief`);
    // 找到 spec.md 文件
    let briefFile;
    if (record.brief_file) {
      briefFile = path.resolve(path.dirname(file), record.brief_file);
    } else {
      briefFile = findBriefFile(file);
    }
    if (!briefFile || !fs.existsSync(briefFile)) fail('未找到 spec.md 简报文件，请先编写需求规格说明');
    // 解析 spec.md
    const parsedBrief = parseBriefMarkdown(briefFile);
    record.prototype_brief = parsedBrief;
    // 校验
    const submissionErrors = [
      ...briefSubmissionErrors(record),
      ...briefSufficiencyErrors(record.prototype_brief)
    ];
    if (submissionErrors.length) fail(submissionErrors.join('\n'));
    // 更新 brief_submission 快照
    record.brief_submission = createBriefSubmission(record);
    record.stage_outputs.product.valid = true;
    record.status = 'in-development';
    const changedErrors = validate(record, file);
    if (changedErrors.length) fail(`submit-brief 后记录非法，未写入文件：\n${changedErrors.join('\n')}`);
    save(file, record, 'submit-brief');
    console.log(`简报已提交，状态：in-development`);
    console.log(`范围哈希：${record.brief_submission.scope_sha256}`);
    break;
  }
  case 'confirm-brief': transition(['in-development'], 'prototyping', record => {
    requireUserConfirmation(record, '--user-confirmed-brief', 'confirm-brief');
    record.brief_confirmation = createBriefConfirmation(record);
  }); break;
  case 'submit-prototype': acceptAndFreeze(); break;
  case 'migrate': migrate(); break;
  case 'invalidate': {
    const stage = value('--stage');
    if (!['brief', 'prototype'].includes(stage)) fail('invalidate 需要 --stage brief|prototype 或 --stage=brief|prototype');
    const file = requireFile();
    const record = load(file);
    const currentErrors = validate(record, file, root, { skipDrift: true });
    if (currentErrors.length) fail(currentErrors.join('\n'));
    const sourceError = invalidationSourceError(record, stage);
    if (sourceError) fail(sourceError);
    applyInvalidation(record, stage);
    // 失效原型时清理 freeze.json
    if (stage === 'prototype') {
      const freezeFile = path.join(path.dirname(file), 'freeze.json');
      if (fs.existsSync(freezeFile)) fs.rmSync(freezeFile, { force: true });
    }
    const changedErrors = validate(record, file);
    if (changedErrors.length) fail(`invalidate 后记录非法，未写入文件：\n${changedErrors.join('\n')}`);
    save(file, record, 'invalidate');
    break;
  }
  case 'block': {
    const file = requireFile();
    const record = load(file);
    const errors = validate(record, file);
    if (errors.length) fail(errors.join('\n'));
    if (!blockSources.has(record.status)) fail(`${file}: 当前状态 ${record.status} 不能执行 block`);
    record.status = 'blocked';
    const changedErrors = validate(record, file);
    if (changedErrors.length) fail(`block 后记录非法，未写入文件：\n${changedErrors.join('\n')}`);
    save(file, record, 'block');
    console.log(`迭代已暂停，状态：blocked（resume 可恢复到 ${resumeTargetOf(record)}）`);
    break;
  }
  case 'resume': {
    const file = requireFile();
    const record = load(file);
    const errors = validate(record, file);
    if (errors.length) fail(errors.join('\n'));
    if (record.status !== 'blocked') fail(`${file}: 当前状态 ${record.status} 不能执行 resume`);
    record.status = resumeTargetOf(record);
    const changedErrors = validate(record, file);
    if (changedErrors.length) fail(`resume 后记录非法，未写入文件：\n${changedErrors.join('\n')}`);
    save(file, record, 'resume');
    console.log(`迭代已恢复，状态：${record.status}`);
    break;
  }
  case 'terminate': {
    const target = value('--target');
    if (!terminateTargets.has(target)) fail('terminate 需要 --target cancelled|superseded 或 --target=cancelled|superseded');
    const file = requireFile();
    const record = load(file);
    requireUserConfirmation(record, '--user-confirmed-termination', 'terminate');
    const errors = validate(record, file);
    if (errors.length) fail(errors.join('\n'));
    if (!terminateSources.has(record.status)) fail(`${file}: 当前状态 ${record.status} 不能执行 terminate`);
    record.status = target;
    const changedErrors = validate(record, file);
    if (changedErrors.length) fail(`terminate 后记录非法，未写入文件：\n${changedErrors.join('\n')}`);
    save(file, record, 'terminate');
    console.log(`迭代已终止，状态：${target}（终态，不可恢复）`);
    break;
  }
  case 'check': check(); break;
  case 'test': test(); break;
  default: fail('用法：init|submit-brief|confirm-brief --user-confirmed-brief <iteration_id>|submit-prototype --user-confirmed-prototype <iteration_id>|invalidate|block|resume|terminate --user-confirmed-termination <iteration_id> --target cancelled|superseded|migrate|check|test');
}
