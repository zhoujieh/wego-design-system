#!/usr/bin/env node

/**
 * 场景-迭代绑定守卫
 *
 * 每个实现了 scene.js / scene.css 的业务场景，必须关联一个已提交简要 prototype_brief
 *（in-development 或 prototyping）的活动迭代；否则视为跳过 wego-product 直接做页面并拦截。
 *
 * 例外:已冻结(frozen)归档场景豁免绑定检查——frozen 是走完产品流程并验收收口的归档态,
 * 场景本身已确认过简报并冻结,不再要求 prototyping 迭代绑定;但冻结迭代不作为其它
 * 未归档场景的绑定来源。
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

// 薄档已提交即可进入原型循环；in-development 与终局确认后的 prototyping 都是有效活动绑定。
// frozen 只在 --all 的仓库基线检查中作为历史归档豁免；显式检查变更场景时仍要求活动迭代。
const activeBriefStatuses = new Set(['in-development', 'prototyping']);

const scenesRoot = path.join(root, 'wego-app/scenes');

// 系统工具场景豁免：开发工具类场景（场景导航、组件预览、迭代画布等）非业务需求驱动，不要求迭代绑定。
const systemToolScenes = new Set(['场景管理', '组件预览', '迭代画布']);

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

function repositoryChangedFiles(repositoryRoot = root) {
  const files = new Set();
  const commands = [
    ['diff', '--name-only', 'origin/main...HEAD'],
    ['diff', '--name-only'],
    ['diff', '--cached', '--name-only'],
    ['ls-files', '--others', '--exclude-standard']
  ];
  for (const command of commands) {
    const result = spawnSync('git', ['-c', 'core.quotepath=false', ...command], { cwd: repositoryRoot, encoding: 'utf8' });
    if (result.status !== 0) continue;
    for (const file of (result.stdout || '').split('\n').map(item => item.trim()).filter(Boolean)) files.add(file);
  }
  return files;
}

function iterationOwnedByChanges(file, changed, repositoryRoot = root) {
  const relative = path.relative(repositoryRoot, file).split(path.sep).join('/');
  const directory = path.posix.dirname(relative);
  return changed.has(relative) || [...changed].some(item => item.startsWith(`${directory}/`));
}

// 收集所有“薄档已提交”的活动迭代所覆盖的场景名（主场景 + affected_scenes）。
function boundScenes({ ownedOnly = false } = {}) {
  const bound = new Set();
  const changed = ownedOnly ? repositoryChangedFiles() : new Set();
  if (!fs.existsSync(scenesRoot)) return bound;
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile() && entry.name === 'iteration.json') {
        const record = loadIteration(target);
        if (!isPlainObject(record)) continue;
        if (!activeBriefStatuses.has(record.status)) continue;
        if (ownedOnly && !iterationOwnedByChanges(target, changed)) continue;
        // in-development 状态只要求 brief_submission 存在（开发模式）
        if (record.status === 'in-development') {
          if (record.brief_submission === null || record.brief_submission === undefined) continue;
        } else {
          if (record.brief_confirmation === null || record.brief_confirmation === undefined) continue;
        }
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

// 收集所有已冻结(frozen)迭代覆盖的场景名(主场景 + affected_scenes)。
// 已冻结迭代是走完产品流程并验收收口的归档场景：场景本身已确认过简报并冻结，
// 不再要求必须有 prototyping 迭代在绑定;但冻结历史迭代不得作为"当前场景修改"的
// 绑定来源(见 test 中对应断言),仅用于豁免 unbound 误拦已归档场景。
function frozenArchiveScenes() {
  const archived = new Set();
  if (!fs.existsSync(scenesRoot)) return archived;
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile() && entry.name === 'iteration.json') {
        const record = loadIteration(target);
        if (!isPlainObject(record)) continue;
        if (record.status !== 'frozen') continue;
        if (record.freeze === null || record.freeze === undefined) continue;
        const primary = record.identity?.primary_scene;
        if (isSafeSceneName(primary)) archived.add(primary);
        if (Array.isArray(record.affected_scenes)) {
          for (const scene of record.affected_scenes) if (isSafeSceneName(scene)) archived.add(scene);
        }
      }
    }
  };
  visit(scenesRoot);
  return archived;
}

function resolveSceneDir(scene) {
  if (!fs.existsSync(scenesRoot)) return null;
  for (const category of fs.readdirSync(scenesRoot, { withFileTypes: true })) {
    if (!category.isDirectory() || category.name.startsWith('_')) continue;
    const candidate = path.join(scenesRoot, category.name, scene);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function sceneDirectories() {
  if (!fs.existsSync(scenesRoot)) return [];
  const scenes = [];
  for (const category of fs.readdirSync(scenesRoot, { withFileTypes: true })) {
    if (!category.isDirectory() || category.name.startsWith('_')) continue;
    const categoryRoot = path.join(scenesRoot, category.name);
    for (const entry of fs.readdirSync(categoryRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
      if (['scene.js', 'scene.css'].some(file => fs.existsSync(path.join(categoryRoot, entry.name, file)))) {
        scenes.push(entry.name);
      }
    }
  }
  return scenes.sort();
}

function implementedScene(scene) {
  const directory = resolveSceneDir(scene);
  if (!directory) return false;
  return ['scene.js', 'scene.css'].some(file => fs.existsSync(path.join(directory, file)));
}

function main() {
  const bound = boundScenes({ ownedOnly: !all });
  const archived = frozenArchiveScenes();
  const targets = all ? sceneDirectories() : scenes.filter(isSafeSceneName);
  const errors = [];
  for (const scene of targets) {
    if (!implementedScene(scene)) continue;
    if (systemToolScenes.has(scene)) continue;
    if (all && archived.has(scene)) continue;
    if (!bound.has(scene)) {
      const rel = path.relative(root, resolveSceneDir(scene) || path.join(scenesRoot, scene));
      errors.push({
        code: 'scene.iteration_unbound',
        message: `场景 ${scene} 没有关联已提交薄档的活动迭代(in-development/prototyping)；必须先经 wego-product 提交简报再实现页面`,
        file: rel.split(path.sep).join('/')
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
    const script = fs.realpathSync(path.resolve(root, process.argv[1]));
    const scene = '测试场景';
    const sceneRoot = path.join(fixture, 'wego-app/scenes/infras', scene);
    const iterationRoot = path.join(sceneRoot, '_iterations/20260803-test-测试');
    fs.mkdirSync(iterationRoot, { recursive: true });
    fs.writeFileSync(path.join(sceneRoot, 'scene.js'), 'window.test = true;\n');
    const recordFile = path.join(iterationRoot, 'iteration.json');
    const writeRecord = record => fs.writeFileSync(recordFile, `${JSON.stringify(record, null, 2)}\n`);
    const relativeRecord = path.relative(fixture, recordFile).split(path.sep).join('/');
    if (!iterationOwnedByChanges(recordFile, new Set([relativeRecord]), fixture)) {
      throw new Error('活动迭代目录发生变化时必须识别为当前分支绑定');
    }
    if (iterationOwnedByChanges(recordFile, new Set(), fixture)) {
      throw new Error('仅继承且未变化的活动迭代不得绑定当前分支变更');
    }

    // 场景没有任何迭代（从未走产品流程）→ 必须拦截 unbound
    writeRecord({
      status: 'draft',
      identity: { primary_scene: scene },
      affected_scenes: [scene],
      brief_confirmation: null
    });
    let noIter = spawnSync(process.execPath, [script, '--all', '--json'], { cwd: fixture, encoding: 'utf8' });
    if (noIter.status === 0 || !(noIter.stdout || '').includes('scene.iteration_unbound')) {
      throw new Error('从未走产品流程的场景必须拦截 unbound');
    }

    // 已冻结归档迭代（有 freeze）→ 场景已走完产品流程，豁免 unbound
    writeRecord({
      status: 'frozen',
      identity: { primary_scene: scene },
      affected_scenes: [scene],
      brief_confirmation: { at: new Date().toISOString() },
      freeze: { at: new Date().toISOString() }
    });
    const archived = spawnSync(process.execPath, [script, '--all', '--json'], { cwd: fixture, encoding: 'utf8' });
    if (archived.status !== 0 || (archived.stdout || '').includes('scene.iteration_unbound')) {
      throw new Error(`已冻结归档场景应豁免 unbound：${archived.stderr || archived.stdout}`);
    }
    // 冻结历史迭代不得继续绑定当前场景修改：frozen 场景不进入 boundScenes 绑定集合，
    // 仅由 frozenArchiveScenes 归档豁免。验证方式——冻结迭代不参与"已确认简报"绑定，
    // 不覆盖其它未归档场景(用独立未归档场景验证该语义)。
    const otherScene = '独立未归档场景';
    const otherRoot = path.join(fixture, 'wego-app/scenes/infras', otherScene);
    fs.mkdirSync(otherRoot, { recursive: true });
    fs.writeFileSync(path.join(otherRoot, 'scene.js'), 'window.other = true;\n');
    const otherUnbound = spawnSync(process.execPath, [script, '--all', '--json'], { cwd: fixture, encoding: 'utf8' });
    if (otherUnbound.status === 0 || !(otherUnbound.stdout || '').includes(otherScene)) {
      throw new Error('冻结迭代不得作为绑定来源覆盖其它未归档场景');
    }
    // 移除辅助未归档场景,避免干扰后续 --all 断言
    fs.rmSync(otherRoot, { recursive: true, force: true });

    // prototyping 迭代 → 绑定场景
    writeRecord({
      status: 'prototyping',
      identity: { primary_scene: scene },
      affected_scenes: [scene],
      brief_confirmation: { at: new Date().toISOString() }
    });
    const active = spawnSync(process.execPath, [script, '--all', '--json'], { cwd: fixture, encoding: 'utf8' });
    if (active.status !== 0) throw new Error(`已确认且未冻结的活动迭代应绑定场景：${active.stderr || active.stdout}`);

    // in-development 是正式原型循环状态，应绑定场景
    writeRecord({
      status: 'in-development',
      identity: { primary_scene: scene },
      affected_scenes: [scene],
      brief_confirmation: null,
      brief_submission: { at: new Date().toISOString(), scope_revision: 1, scope_sha256: '0'.repeat(64) }
    });
    const inDevelopment = spawnSync(process.execPath, [script, '--all', '--json'], { cwd: fixture, encoding: 'utf8' });
    if (inDevelopment.status !== 0) throw new Error(`in-development 迭代应绑定场景：${inDevelopment.stderr || inDevelopment.stdout}`);

    // frozen 仅在 --all 基线检查中豁免；显式检查代表场景发生变化，必须先恢复活动迭代
    writeRecord({
      status: 'frozen',
      identity: { primary_scene: scene },
      affected_scenes: [scene],
      brief_confirmation: { at: new Date().toISOString() },
      freeze: { at: new Date().toISOString() }
    });
    const frozenChanged = spawnSync(process.execPath, [script, scene, '--json'], { cwd: fixture, encoding: 'utf8' });
    if (frozenChanged.status === 0 || !(frozenChanged.stdout || '').includes('scene.iteration_unbound')) {
      throw new Error('显式检查已冻结场景时必须要求恢复活动迭代');
    }
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
  console.log('场景-迭代绑定测试通过');
}

if (testing) test();
else main();
