#!/usr/bin/env node

/**
 * 无 --scene：清空全部业务场景、路由注册与 _spec，恢复 wego-app 空白基线。
 * 有 --scene <中文业务场景>：只删除该场景整个目录及其全部路由注册，不影响其他场景与 _spec。
 * --check：只输出计划，不写文件。--json：输出结构化报告。
 */

import fs from 'node:fs';
import path from 'node:path';
import { filterRouteRegistrySource } from './route-source-parser.mjs';

const repoRoot = path.resolve(process.cwd());
const wegoAppRoot = path.join(repoRoot, 'wego-app');
const routesFile = path.join(wegoAppRoot, 'js/routes.js');
const scenesRoot = path.join(wegoAppRoot, 'scenes');
const specRoot = path.join(wegoAppRoot, '_spec');
const keepSceneFile = path.join(scenesRoot, '.gitkeep');
const routesBaseline = 'window.WEGO_APP_ROUTES = [];\n';

// ---- arg parsing ----
const allArgs = process.argv.slice(2);
const flags = new Set();
const argumentErrors = [];
const supportedFlags = new Set(['--check', '--json']);
let targetScene = null;
for (let i = 0; i < allArgs.length; i++) {
  const argument = allArgs[i];
  if (argument === '--scene') {
    if (targetScene !== null) {
      argumentErrors.push('--scene 只能声明一次');
      continue;
    }
    const value = allArgs[i + 1];
    if (value === undefined || value.startsWith('--')) {
      argumentErrors.push('--scene 必须指定单层中文业务场景目录名');
      continue;
    }
    targetScene = value;
    i += 1;
  } else if (supportedFlags.has(argument)) {
    flags.add(argument);
  } else {
    argumentErrors.push(`未知参数：${argument}`);
  }
}
const checkOnly = flags.has('--check');
const jsonOutput = flags.has('--json');
const isSceneMode = targetScene !== null;

const report = {
  mode: checkOnly ? 'check' : 'apply',
  planned: [],
  updated: [],
  removed: [],
  kept: [],
  warnings: [],
  errors: [],
};

function assertWithinScope(target, allowedRoots) {
  const normalizedTarget = path.resolve(target);
  const allowed = allowedRoots.some(root => {
    const normalizedRoot = path.resolve(root);
    return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}${path.sep}`);
  });
  if (!allowed) {
    throw new Error(`目标路径越界：${target}`);
  }
}

function ensureParentDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function record(kind, target, detail) {
  report[kind].push({
    target: path.relative(repoRoot, target),
    detail,
  });
}

function plan(target, detail) {
  record('planned', target, detail);
}

function isSafeSceneName(sceneName) {
  return typeof sceneName === 'string'
    && sceneName.length > 0
    && sceneName === sceneName.trim()
    && sceneName !== '.'
    && sceneName !== '..'
    && sceneName !== '.gitkeep'
    && !sceneName.includes('/')
    && !sceneName.includes('\\')
    && !sceneName.includes('\0');
}

function resetRoutesFile() {
  assertWithinScope(routesFile, [routesFile]);
  const current = fs.existsSync(routesFile) ? fs.readFileSync(routesFile, 'utf8') : '';
  if (current === routesBaseline) {
    record('kept', routesFile, 'routes already baseline');
    return;
  }
  plan(routesFile, 'reset routes to empty baseline');
  if (!checkOnly) {
    ensureParentDir(routesFile);
    fs.writeFileSync(routesFile, routesBaseline);
  }
  record('updated', routesFile, 'reset routes to empty baseline');
}

function routeScene(record) {
  if (record.scene) return record.scene;
  return /^scenes\/([^/\\]+)\/scene\.js$/.exec(record.script)?.[1] || null;
}

function routeRemovalPlan(sceneName) {
  if (!fs.existsSync(routesFile)) {
    return { updated: '', removed: [] };
  }
  const current = fs.readFileSync(routesFile, 'utf8');
  const filtered = filterRouteRegistrySource(
    current,
    record => routeScene(record) === sceneName,
  );
  return {
    updated: filtered.records.length === 0 && filtered.removed.length > 0
      ? routesBaseline
      : filtered.source,
    removed: filtered.removed,
  };
}

function listSceneEntries() {
  if (!fs.existsSync(scenesRoot)) return [];
  return fs.readdirSync(scenesRoot).map(name => path.join(scenesRoot, name));
}

function cleanScenes() {
  if (!fs.existsSync(scenesRoot)) {
    if (checkOnly) {
      record('kept', scenesRoot, 'no scenes task artifacts');
      return;
    }
    fs.mkdirSync(scenesRoot, { recursive: true });
    record('updated', scenesRoot, 'restore scenes directory');
  }

  const entries = listSceneEntries();
  if (entries.length === 0 && !fs.existsSync(keepSceneFile)) {
    plan(keepSceneFile, 'restore scenes/.gitkeep');
    if (!checkOnly) fs.writeFileSync(keepSceneFile, '');
    record('updated', keepSceneFile, 'restore scenes/.gitkeep');
    return;
  }

  for (const entry of entries) {
    assertWithinScope(entry, [scenesRoot]);
    if (entry === keepSceneFile) {
      record('kept', entry, 'preserve scenes/.gitkeep');
      continue;
    }
    plan(entry, 'remove scene task artifact');
    if (!checkOnly) {
      fs.rmSync(entry, { recursive: true, force: true });
    }
    record('removed', entry, 'remove scene task artifact');
  }

  if (!fs.existsSync(keepSceneFile)) {
    plan(keepSceneFile, 'restore scenes/.gitkeep');
    if (!checkOnly) fs.writeFileSync(keepSceneFile, '');
    record('updated', keepSceneFile, 'restore scenes/.gitkeep');
  }
}

function cleanSceneByName(sceneName) {
  if (!isSafeSceneName(sceneName)) {
    throw new Error(`--scene 不是安全的单层业务场景目录名：${JSON.stringify(sceneName)}`);
  }
  const sceneDir = path.join(scenesRoot, sceneName);
  assertWithinScope(sceneDir, [scenesRoot]);
  const sceneExists = fs.existsSync(sceneDir);
  const routePlan = routeRemovalPlan(sceneName);

  if (!sceneExists) {
    record('kept', sceneDir, `scene "${sceneName}" not found`);
  } else {
    plan(sceneDir, `remove scene "${sceneName}" artifact`);
  }

  if (routePlan.removed.length === 0) {
    record('kept', routesFile, `no route entries found for scene "${sceneName}"`);
  } else {
    const routeIds = routePlan.removed.map(record => record.routeId).join(', ');
    plan(routesFile, `remove ${routePlan.removed.length} route entries for scene "${sceneName}": ${routeIds}`);
  }

  const otherSceneEntries = listSceneEntries()
    .filter(entry => entry !== sceneDir && entry !== keepSceneFile);
  const restoreKeepFile = otherSceneEntries.length === 0 && !fs.existsSync(keepSceneFile);
  if (restoreKeepFile) plan(keepSceneFile, 'restore scenes/.gitkeep after removing the final scene');

  if (!checkOnly) {
    if (sceneExists) fs.rmSync(sceneDir, { recursive: true, force: true });
    if (routePlan.removed.length > 0) fs.writeFileSync(routesFile, routePlan.updated);
    if (restoreKeepFile) fs.writeFileSync(keepSceneFile, '');
    if (sceneExists) record('removed', sceneDir, `remove scene "${sceneName}" artifact`);
    if (routePlan.removed.length > 0) {
      record('updated', routesFile, `removed all ${routePlan.removed.length} route entries for scene "${sceneName}"`);
    }
    if (restoreKeepFile) record('updated', keepSceneFile, 'restore scenes/.gitkeep');
  }
}

function cleanSpec() {
  if (!fs.existsSync(specRoot)) {
    record('kept', specRoot, 'no _spec task artifacts');
    return;
  }
  assertWithinScope(specRoot, [specRoot]);
  plan(specRoot, 'remove _spec task artifacts');
  if (!checkOnly) {
    fs.rmSync(specRoot, { recursive: true, force: true });
  }
  record('removed', specRoot, 'remove _spec task artifacts');
}

function validateProtectedTargets() {
  const protectedPaths = [
    path.join(repoRoot, 'AGENTS.md'),
    path.join(repoRoot, '.codex/skills'),
    path.join(wegoAppRoot, 'lib'),
    path.join(wegoAppRoot, 'css'),
    path.join(wegoAppRoot, 'index.html'),
    path.join(wegoAppRoot, 'js/app.js'),
  ];
  for (const target of protectedPaths) {
    record('kept', target, 'protected by script scope');
  }
}

function run() {
  if (!fs.existsSync(wegoAppRoot)) {
    report.errors.push('未找到 wego-app 目录，脚本已停止');
    finish(1);
    return;
  }
  if (argumentErrors.length > 0) {
    report.errors.push(...argumentErrors);
    finish(2);
    return;
  }

  try {
    validateProtectedTargets();
    if (isSceneMode) {
      // --scene mode: only clean the specified scene and its route entry
      cleanSceneByName(targetScene);
    } else {
      // Full baseline reset
      resetRoutesFile();
      cleanScenes();
      cleanSpec();
    }
  } catch (error) {
    report.errors.push(error instanceof Error ? error.message : String(error));
    finish(1);
    return;
  }

  finish(0);
}

function finish(code) {
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(code);
  }

  const actionLabel = isSceneMode ? `场景清理（${targetScene}）` : '空白基线重置';
  console.log(checkOnly ? `\nwego-app ${actionLabel}检查完成` : `\nwego-app ${actionLabel}完成`);

  if (report.planned.length > 0) {
    console.log('\n计划处理：');
    for (const item of report.planned) {
      console.log(`- ${item.target}：${item.detail}`);
    }
  }

  if (report.updated.length > 0) {
    console.log('\n已更新：');
    for (const item of report.updated) {
      console.log(`- ${item.target}：${item.detail}`);
    }
  }

  if (report.removed.length > 0) {
    console.log('\n已清理：');
    for (const item of report.removed) {
      console.log(`- ${item.target}：${item.detail}`);
    }
  }

  if (report.kept.length > 0) {
    console.log('\n保留项：');
    for (const item of report.kept) {
      console.log(`- ${item.target}：${item.detail}`);
    }
  }

  if (report.warnings.length > 0) {
    console.log('\n警告：');
    for (const item of report.warnings) {
      console.log(`- ${item}`);
    }
  }

  if (report.errors.length > 0) {
    console.log('\n错误：');
    for (const item of report.errors) {
      console.log(`- ${item}`);
    }
  }

  process.exit(code);
}

run();
