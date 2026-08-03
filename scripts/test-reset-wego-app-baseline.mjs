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

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(fixtureRoot, relativePath), 'utf8'));
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
  write('wego-app/scenes/我的/route.json', JSON.stringify({
    routeId: 'my',
    entry: { type: 'host-tab', tab: 'my' },
  }));
  write('wego-app/scenes/我的/scene.js', 'window.example = true;\n');
  write('wego-app/scenes/我的/scene.css', '.example {}\n');
  write('wego-app/js/routes.js', 'window.WEGO_APP_ROUTES = [{ routeId: \'my\' }];\n');
  write('claims/active.json', `${JSON.stringify({
    agent: 'active-agent',
    scene: '我的',
    routeId: 'my',
    status: 'active',
    claimedAt: '2026-08-01T00:00:00.000Z',
    note: '必须保留的说明',
  }, null, 2)}\n`);
  const releasedClaim = {
    agent: 'released-agent',
    scene: '历史场景',
    routeId: 'history',
    status: 'released',
    claimedAt: '2026-07-01T00:00:00.000Z',
    releasedAt: '2026-07-02T00:00:00.000Z',
  };
  write('claims/released.json', `${JSON.stringify(releasedClaim, null, 2)}\n`);

  const dryRunOutput = runReset(0, '--dry-run');
  assert.match(dryRunOutput, /将删除场景：我的/);
  assert.match(dryRunOutput, /将释放场景认领：active\.json/);
  assert.ok(fs.existsSync(path.join(fixtureRoot, 'wego-app/scenes/我的')));
  assert.equal(readJson('claims/active.json').status, 'active');

  runReset(0);
  assert.ok(!fs.existsSync(path.join(fixtureRoot, 'wego-app/scenes/我的')));
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'wego-app/js/routes.js'), 'utf8'), 'window.WEGO_APP_ROUTES = [];\n');

  const activeClaim = readJson('claims/active.json');
  assert.equal(activeClaim.status, 'released');
  assert.equal(activeClaim.releaseReason, 'wego-app-baseline-reset');
  assert.equal(activeClaim.note, '必须保留的说明');
  assert.match(activeClaim.releasedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.deepEqual(readJson('claims/released.json'), releasedClaim);
  runReset(0, '--check');

  write('claims/orphan.json', `${JSON.stringify({
    agent: 'orphan-agent',
    scene: '已删除场景',
    routeId: 'deleted-scene',
    status: 'active',
  }, null, 2)}\n`);
  assert.match(runReset(1, '--check'), /存在活跃场景认领：orphan\.json/);
  runReset(0);
  assert.equal(readJson('claims/orphan.json').status, 'released');
  runReset(0, '--check');

  write('wego-app/scenes/坏认领保护/route.json', '{}\n');
  write('claims/broken.json', '{ invalid json\n');
  assert.match(runReset(1), /认领文件无法解析 claims\/broken\.json/);
  assert.ok(fs.existsSync(path.join(fixtureRoot, 'wego-app/scenes/坏认领保护')));

  console.log('空白基线场景、路由与认领清理测试通过');
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
