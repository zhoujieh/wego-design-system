#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-reset-baseline-test-'));
const fixtureScriptDir = path.join(fixtureRoot, 'scripts');
const resetScript = path.join(fixtureScriptDir, 'reset-wego-app-baseline.mjs');

function write(relativePath, content) {
  const absolutePath = path.join(fixtureRoot, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
}

function runReset(expectedStatus, ...args) {
  const result = spawnSync(process.execPath, [resetScript, ...args], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, expectedStatus, result.stderr || result.stdout);
  return `${result.stdout}${result.stderr}`;
}

try {
  fs.mkdirSync(fixtureScriptDir, { recursive: true });
  fs.copyFileSync(path.join(scriptDir, 'reset-wego-app-baseline.mjs'), resetScript);
  fs.copyFileSync(path.join(scriptDir, 'build-routes.mjs'), path.join(fixtureScriptDir, 'build-routes.mjs'));

  write('wego-app/scenes/.gitkeep', '');
  write('wego-app/scenes/shop/我的/route.json', JSON.stringify({
    routeId: 'my',
    entry: { type: 'host-tab', tab: 'my' },
  }));
  write('wego-app/scenes/shop/我的/scene.js', 'window.example = true;\n');
  write('wego-app/scenes/shop/我的/scene.css', '.example {}\n');
  write('wego-app/js/routes.js', 'window.WEGO_APP_ROUTES = [{ routeId: \'my\' }];\n');

  // 1. dry-run 应报告将删除场景，但不实际修改
  const dryRunOutput = runReset(0, '--dry-run');
  assert.match(dryRunOutput, /将删除场景：shop\/我的/);
  assert.ok(fs.existsSync(path.join(fixtureRoot, 'wego-app/scenes/shop/我的')));

  // 2. 实际重置应删除场景并重建空白路由
  runReset(0);
  assert.ok(!fs.existsSync(path.join(fixtureRoot, 'wego-app/scenes/shop/我的')));
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'wego-app/js/routes.js'), 'utf8'), 'window.WEGO_APP_ROUTES = [];\n');

  // 3. --check 应确认已是空白基线
  runReset(0, '--check');

  // 4. 存在场景时 --check 应失败
  write('wego-app/scenes/infras/测试场景/route.json', '{}\n');
  assert.match(runReset(1, '--check'), /存在场景：infras\/测试场景/);

  console.log('空白基线场景与路由清理测试通过');
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
