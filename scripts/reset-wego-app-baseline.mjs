#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const wegoAppRoot = path.join(repoRoot, 'wego-app');
const routesFile = path.join(wegoAppRoot, 'js/routes.js');
const scenesRoot = path.join(wegoAppRoot, 'scenes');
const specRoot = path.join(wegoAppRoot, '_spec');
const keepSceneFile = path.join(scenesRoot, '.gitkeep');
const routesBaseline = 'window.WEGO_APP_ROUTES = [];\n';

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const jsonOutput = args.has('--json');

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

  try {
    validateProtectedTargets();
    resetRoutesFile();
    cleanScenes();
    cleanSpec();
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

  console.log(checkOnly ? '\nwego-app 空白基线检查完成' : '\nwego-app 空白基线重置完成');

  if (report.planned.length > 0) {
    console.log('\n计划处理：');
    for (const item of report.planned) {
      console.log(`- ${item.target}：${item.detail}`);
    }
  }

  if (report.updated.length > 0) {
    console.log('\n已重置：');
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
