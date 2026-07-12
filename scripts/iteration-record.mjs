#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const [command, ...args] = process.argv.slice(2);
const value = flag => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
};
const fileArg = value('--file');
const statuses = new Set(['draft', 'awaiting-brief-confirmation', 'prototyping', 'awaiting-prototype-confirmation', 'prototype-confirmed', 'frozen', 'blocked', 'cancelled', 'superseded']);

function fail(message) { console.error(message); process.exit(1); }
function sha(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
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
function validate(record, file) {
  const errors = [];
  if (record.schemaVersion !== 3) errors.push(`${file}: schemaVersion 必须为 3`);
  if (!record.identity?.iteration_id || !record.identity?.title || !record.identity?.primary_scene) errors.push(`${file}: identity 缺少 iteration_id/title/primary_scene`);
  if (!statuses.has(record.status)) errors.push(`${file}: status 非法：${record.status}`);
  if (!Number.isInteger(record.scope_revision) || record.scope_revision < 1) errors.push(`${file}: scope_revision 必须为正整数`);
  const brief = record.prototype_brief;
  for (const key of ['goal', 'included', 'excluded', 'entry_points', 'critical_paths', 'states', 'data_contract', 'assumptions', 'open_questions']) if (!(key in (brief || {}))) errors.push(`${file}: prototype_brief 缺少 ${key}`);
  if (!Array.isArray(record.affected_scenes) || !Array.isArray(record.affected_runtime)) errors.push(`${file}: affected_scenes/affected_runtime 必须为数组`);
  if (!record.stage_outputs?.product || !record.stage_outputs?.design) errors.push(`${file}: stage_outputs 必须含 product/design`);
  if (['prototyping', 'awaiting-prototype-confirmation', 'prototype-confirmed', 'frozen'].includes(record.status) && !record.brief_confirmation) errors.push(`${file}: 当前状态要求 brief_confirmation`);
  if (['prototype-confirmed', 'frozen'].includes(record.status) && !record.prototype_confirmation) errors.push(`${file}: 当前状态要求 prototype_confirmation`);
  if (record.status === 'frozen') {
    if (!record.freeze?.fingerprints) errors.push(`${file}: frozen 状态要求 freeze.fingerprints`);
    const freezeFile = path.join(path.dirname(file), 'freeze.json');
    if (!fs.existsSync(freezeFile)) errors.push(`${file}: frozen 状态要求同目录 freeze.json`);
    else {
      try {
        const freeze = JSON.parse(fs.readFileSync(freezeFile, 'utf8'));
        if (JSON.stringify(freeze) !== JSON.stringify(record.freeze)) errors.push(`${file}: freeze.json 必须与 iteration.json.freeze 一致`);
      } catch (error) { errors.push(`${file}: freeze.json 无法解析：${error.message}`); }
    }
  }
  return errors;
}
function save(file, record, action) {
  record.change_log = Array.isArray(record.change_log) ? record.change_log : [];
  record.change_log.push({ action, at: new Date().toISOString() });
  fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`);
}
function requireFile() {
  if (!fileArg) fail('该命令必须传 --file <iteration.json>');
  return path.resolve(root, fileArg);
}
function transition(expected, next, mutate = () => {}) {
  const file = requireFile();
  const record = load(file);
  const errors = validate(record, file);
  if (errors.length) fail(errors.join('\n'));
  if (!expected.includes(record.status)) fail(`${file}: 当前状态 ${record.status} 不能执行 ${command}`);
  mutate(record);
  record.status = next;
  save(file, record, command);
  return record;
}
function init() {
  const file = requireFile();
  if (fs.existsSync(file)) fail(`${file} 已存在`);
  const id = value('--iteration-id');
  const title = value('--title');
  const scene = value('--scene');
  if (!id || !title || !scene) fail('init 需要 --iteration-id、--title、--scene');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const record = { schemaVersion: 3, identity: { iteration_id: id, title, date: new Date().toISOString().slice(0, 10), primary_scene: scene, related_scenes: [] }, status: 'draft', scope_revision: 1, prototype_brief: { goal: '', included: [], excluded: [], entry_points: [], critical_paths: [], states: [], data_contract: {}, assumptions: [], open_questions: [] }, brief_confirmation: null, prototype_confirmation: null, affected_scenes: [scene], affected_runtime: [], stage_outputs: { product: { valid: false }, design: { valid: false } }, change_log: [], freeze: null };
  save(file, record, 'init');
}
function check() {
  const records = files(path.join(root, 'wego-app/scenes'));
  const errors = records.flatMap(file => validate(load(file), file));
  if (errors.length) fail(errors.join('\n'));
  console.log(`${records.length} 个迭代通过检查`);
}
function test() {
  const sample = { schemaVersion: 3, identity: { iteration_id: 'test', title: '测试', primary_scene: '测试场景' }, status: 'draft', scope_revision: 1, prototype_brief: { goal: '', included: [], excluded: [], entry_points: [], critical_paths: [], states: [], data_contract: {}, assumptions: [], open_questions: [] }, brief_confirmation: null, prototype_confirmation: null, affected_scenes: [], affected_runtime: [], stage_outputs: { product: { valid: false }, design: { valid: false } }, change_log: [], freeze: null };
  const errors = validate(sample, 'sample');
  if (errors.length) fail(errors.join('\n'));
  if (!briefReadinessErrors(sample).length) fail('业务迭代状态机未拦截空 prototype_brief');
  sample.prototype_brief = { goal: '测试目标', included: ['范围'], excluded: [], entry_points: ['入口'], critical_paths: ['路径'], states: ['初始'], data_contract: {}, assumptions: [], open_questions: [] };
  if (briefReadinessErrors(sample).length) fail('业务迭代状态机错误拦截有效 prototype_brief');
  console.log('业务迭代状态机测试通过');
}
function briefReadinessErrors(record) {
  const brief = record.prototype_brief || {};
  const errors = [];
  if (typeof brief.goal !== 'string' || !brief.goal.trim()) errors.push('prototype_brief.goal 不能为空');
  for (const key of ['included', 'entry_points', 'critical_paths', 'states']) if (!Array.isArray(brief[key]) || !brief[key].length) errors.push(`prototype_brief.${key} 必须是非空数组`);
  if (!brief.data_contract || typeof brief.data_contract !== 'object' || Array.isArray(brief.data_contract)) errors.push('prototype_brief.data_contract 必须是对象');
  return errors;
}
function validatePrototypeScenes(record) {
  for (const scene of record.affected_scenes) {
    const sceneDirectory = `wego-app/scenes/${scene}`;
    const result = spawnSync(process.execPath, ['scripts/validate-scene-contract.mjs', sceneDirectory, '--json'], { cwd: root, encoding: 'utf8' });
    if (result.status !== 0) fail(`${sceneDirectory} 未通过场景合同：${(result.stderr || result.stdout || '未知错误').trim()}`);
  }
}
function freeze() {
  const record = transition(['prototype-confirmed'], 'frozen', record => {
    const targets = [...record.affected_runtime, ...record.affected_scenes.flatMap(scene => [
      `wego-app/scenes/${scene}/scene.js`,
      `wego-app/scenes/${scene}/scene.css`,
      `wego-app/scenes/${scene}/design-decisions.json`
    ]), 'wego-app/js/routes.js'];
    const fingerprints = {};
    for (const relative of targets) {
      const target = path.join(root, relative);
      if (!fs.existsSync(target)) fail(`freeze 缺少运行时文件：${relative}`);
      fingerprints[relative] = sha(target);
    }
    record.freeze = { at: new Date().toISOString(), design_system_version: JSON.parse(fs.readFileSync(path.join(root, '.codex/skills/wego-design/metadata.json'), 'utf8')).version, fingerprints };
  });
  fs.writeFileSync(path.join(path.dirname(requireFile()), 'freeze.json'), `${JSON.stringify(record.freeze, null, 2)}\n`);
}

switch (command) {
  case 'init': init(); break;
  case 'submit-brief': transition(['draft'], 'awaiting-brief-confirmation', record => {
    const errors = briefReadinessErrors(record);
    if (errors.length) fail(errors.join('\n'));
    record.stage_outputs.product.valid = true;
  }); break;
  case 'confirm-brief': transition(['awaiting-brief-confirmation'], 'prototyping', record => { record.brief_confirmation = { at: new Date().toISOString() }; }); break;
  case 'submit-prototype': transition(['prototyping'], 'awaiting-prototype-confirmation', record => {
    validatePrototypeScenes(record);
    record.stage_outputs.design.valid = true;
  }); break;
  case 'confirm-prototype': transition(['awaiting-prototype-confirmation'], 'prototype-confirmed', record => { record.prototype_confirmation = { at: new Date().toISOString() }; }); break;
  case 'freeze': freeze(); break;
  case 'invalidate': {
    const stage = value('--stage');
    if (!['brief', 'prototype'].includes(stage)) fail('invalidate 需要 --stage=brief|prototype');
    const file = requireFile(); const record = load(file);
    if (record.status === 'frozen') fail('冻结迭代不得失效；请新建迭代');
    record.status = stage === 'brief' ? 'draft' : 'prototyping';
    if (stage === 'brief') { record.brief_confirmation = null; record.prototype_confirmation = null; record.stage_outputs = { product: { valid: false }, design: { valid: false } }; }
    else { record.prototype_confirmation = null; record.stage_outputs.design.valid = false; }
    record.scope_revision += 1; save(file, record, 'invalidate'); break;
  }
  case 'check': check(); break;
  case 'test': test(); break;
  default: fail('用法：init|submit-brief|confirm-brief|submit-prototype|confirm-prototype|invalidate|freeze|check|test');
}
