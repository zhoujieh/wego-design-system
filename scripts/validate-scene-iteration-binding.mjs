#!/usr/bin/env node

/**
 * 场景-迭代绑定守卫
 *
 * 每个实现了 scene.js / scene.css 的业务场景,必须关联一个 prototype_brief 已确认
 * (status >= prototyping,即 brief_confirmation 已存在)的迭代;否则视为跳过 wego-product
 * 直接做页面,直接报错拦截。
 *
 * 用法:
 *   node scripts/validate-scene-iteration-binding.mjs --all [--json]
 *   node scripts/validate-scene-iteration-binding.mjs [--json] {scene} ...
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const all = args.includes('--all');
const testing = args.includes('test');
const scenes = args.filter(arg => !arg.startsWith('--'));

// 简报已确认 = 进入 prototyping 及之后状态;对应 iteration-record.mjs 的确认矩阵。
const confirmedBriefStatuses = new Set([
  'prototyping',
  'awaiting-prototype-confirmation',
  'prototype-confirmed'
]);

const scenesRoot = path.join(root, 'wego-app/scenes');

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function isSafeSceneName(value) {
  return typeof value === 'string'
    && Boolean(value.trim())
    && value === value.trim()
    && value !== '.'
    && value !== '..'
    && !/[\\/\0]/.test(value);
}

function loadIteration(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

// 收集所有“简报已确认”的迭代所覆盖的场景名(主场景 + affected_scenes)。
function boundScenes() {
  const bound = new Set();
  if (!fs.existsSync(scenesRoot)) return bound;
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile() && entry.name === 'iteration.json') {
        const record = loadIteration(target);
        if (!isPlainObject(record)) continue;
        if (!confirmedBriefStatuses.has(record.status)) continue;
        if (record.brief_confirmation === null || record.brief_confirmation === undefined) continue;
        const primary = record.identity?.primary_scene;
        if (isSafeSceneName(primary)) bound.add(primary);
        if (Array.isArray(record.affected_scenes)) {
          for (const scene of record.affected_scenes) if (isSafeSceneName(scene)) bound.add(scene);
        }
      }
    }
  };
  visit(scenesRoot);
  return bound;
}

function sceneDirectories() {
  if (!fs.existsSync(scenesRoot)) return [];
  return fs.readdirSync(scenesRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('_'))
    .map(entry => entry.name)
    .filter(scene => ['scene.js', 'scene.css'].some(file => fs.existsSync(path.join(scenesRoot, scene, file))))
    .sort();
}

function implementedScene(scene) {
  const directory = path.join(scenesRoot, scene);
  if (!fs.existsSync(directory)) return false;
  return ['scene.js', 'scene.css'].some(file => fs.existsSync(path.join(directory, file)));
}

function main() {
  const bound = boundScenes();
  const targets = all ? sceneDirectories() : scenes.filter(isSafeSceneName);
  const errors = [];
  for (const scene of targets) {
    if (!implementedScene(scene)) continue;
    if (!bound.has(scene)) {
      errors.push({
        code: 'scene.iteration_unbound',
        message: `场景 ${scene} 没有关联 prototype_brief 已确认(prototyping 及以上)的迭代;必须先经 wego-product 创建迭代并确认简报,再实现页面`,
        file: `wego-app/scenes/${scene}`
      });
    }
  }
  const report = { ok: errors.length === 0, errors, warnings: [], info: [] };
  if (jsonOutput) console.log(JSON.stringify(report, null, 2));
  for (const item of errors) console.error(`- [${item.code}] ${item.file} ${item.message}`);
  process.exit(report.ok ? 0 : 1);
}

function test() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-iteration-binding-'));
  try {
    const scene = '测试场景';
    const sceneRoot = path.join(fixture, 'wego-app/scenes', scene);
    const iterationRoot = path.join(sceneRoot, '_iterations/20260803-test-测试');
    fs.mkdirSync(iterationRoot, { recursive: true });
    fs.writeFileSync(path.join(sceneRoot, 'scene.js'), 'window.test = true;\n');
    const record = {
      status: 'frozen',
      identity: { primary_scene: scene },
      affected_scenes: [scene],
      brief_confirmation: { at: new Date().toISOString() }
    };
    const recordFile = path.join(iterationRoot, 'iteration.json');
    fs.writeFileSync(recordFile, `${JSON.stringify(record, null, 2)}\n`);
    const script = fs.realpathSync(path.resolve(root, process.argv[1]));
    const frozen = spawnSync(process.execPath, [script, '--all', '--json'], { cwd: fixture, encoding: 'utf8' });
    if (frozen.status === 0 || !(frozen.stdout || '').includes('scene.iteration_unbound')) {
      throw new Error('冻结历史迭代不得继续绑定当前场景修改');
    }
    record.status = 'prototyping';
    fs.writeFileSync(recordFile, `${JSON.stringify(record, null, 2)}\n`);
    const active = spawnSync(process.execPath, [script, '--all', '--json'], { cwd: fixture, encoding: 'utf8' });
    if (active.status !== 0) throw new Error(`已确认且未冻结的活动迭代应绑定场景：${active.stderr || active.stdout}`);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
  console.log('场景-迭代绑定测试通过');
}

if (testing) test();
else main();
