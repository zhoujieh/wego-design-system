#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const syncScript = path.join(scriptDir, 'sync-wego-app-lib.mjs');
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-sync-test-'));
const targetRoot = path.join(fixtureRoot, 'wego-app/lib');

function write(relativePath, content) {
  const absolutePath = path.join(fixtureRoot, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
}

function runSync(expectedStatus, ...args) {
  const result = spawnSync(process.execPath, [syncScript, ...args], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, expectedStatus, result.stderr || result.stdout);
  return result.stdout;
}

try {
  write('.codex/skills/wego-design/colors_and_type.css', ':root {}\n');
  write('.codex/skills/wego-design/components.css', '.button {}\n');
  write('.codex/skills/wego-design/iconfont.css', '@font-face {}\n');
  write('.codex/skills/wego-design/assets/fonts/font.woff2', 'font');
  write('.codex/skills/wego-design/assets/icons/nested/icon.svg', '<svg />');
  write('.codex/skills/wego-design/assets/image/image.png', 'image');

  // 源中的禁用资源不会进入部署副本，包括任意层级的 .uploads 目录。
  write('.codex/skills/wego-design/assets/icons/.DS_Store', 'source-metadata');
  write('.codex/skills/wego-design/assets/icons/nested/.uploads/cache.bin', 'source-cache');
  runSync(0);
  assert.ok(fs.existsSync(path.join(targetRoot, 'assets/icons/nested/icon.svg')));
  assert.ok(!fs.existsSync(path.join(targetRoot, 'assets/icons/.DS_Store')));
  assert.ok(!fs.existsSync(path.join(targetRoot, 'assets/icons/nested/.uploads')));

  // 目标根目录、assets 根目录和已映射目录中的精确忽略名不造成漂移。
  write('wego-app/lib/.DS_Store', 'root-metadata');
  write('wego-app/lib/.uploads/cache.bin', 'root-cache');
  write('wego-app/lib/assets/.DS_Store', 'assets-metadata');
  write('wego-app/lib/assets/.uploads/cache.bin', 'assets-cache');
  write('wego-app/lib/assets/icons/.DS_Store', 'target-metadata');
  write('wego-app/lib/assets/icons/nested/.uploads/cache.bin', 'target-cache');
  const ignoredReport = JSON.parse(runSync(0, '--check', '--json'));
  assert.deepEqual(ignoredReport.synced, []);
  assert.deepEqual(ignoredReport.removed, []);

  // 允许清单外的根文件和 assets 子项必须被发现；相似名不得冒充忽略项。
  write('wego-app/lib/stale.css', '.stale {}\n');
  write('wego-app/lib/assets/stale/old.bin', 'stale-asset');
  write('wego-app/lib/.DS_Store.bak', 'not-ignored');
  write('wego-app/lib/assets/.uploads-old/cache.bin', 'not-ignored');
  const staleReport = JSON.parse(runSync(1, '--check', '--json'));
  assert.deepEqual(
    staleReport.removed.map((item) => item.dest).sort(),
    ['.DS_Store.bak', 'assets/.uploads-old', 'assets/stale', 'stale.css'],
  );
  assert.ok(staleReport.removed.every((item) => item.action === 'stale-in-dest'));

  const cleanupReport = JSON.parse(runSync(0, '--json'));
  assert.deepEqual(
    cleanupReport.removed.map((item) => item.dest).sort(),
    ['.DS_Store.bak', 'assets/.uploads-old', 'assets/stale', 'stale.css'],
  );
  assert.ok(!fs.existsSync(path.join(targetRoot, 'stale.css')));
  assert.ok(!fs.existsSync(path.join(targetRoot, 'assets/stale')));
  assert.ok(!fs.existsSync(path.join(targetRoot, '.DS_Store.bak')));
  assert.ok(!fs.existsSync(path.join(targetRoot, 'assets/.uploads-old')));
  assert.ok(fs.existsSync(path.join(targetRoot, '.DS_Store')));
  assert.ok(fs.existsSync(path.join(targetRoot, '.uploads')));
  assert.ok(fs.existsSync(path.join(targetRoot, 'assets/.DS_Store')));
  assert.ok(fs.existsSync(path.join(targetRoot, 'assets/.uploads')));
  const cleanReport = JSON.parse(runSync(0, '--check', '--json'));
  assert.deepEqual(cleanReport.removed, []);

  // assets 被误建为文件时，检查必须失败，实际同步必须能自动修复。
  fs.rmSync(path.join(targetRoot, 'assets'), { recursive: true, force: true });
  write('wego-app/lib/assets', 'wrong-type');
  const wrongTypeReport = JSON.parse(runSync(1, '--check', '--json'));
  assert.ok(wrongTypeReport.errors.some((item) => item.includes('wego-app/lib/assets')));
  const repairedTypeReport = JSON.parse(runSync(0, '--json'));
  assert.ok(repairedTypeReport.removed.some((item) => item.dest === 'assets' && item.action === 'replaced-wrong-type'));
  assert.ok(fs.statSync(path.join(targetRoot, 'assets')).isDirectory());
  assert.ok(fs.existsSync(path.join(targetRoot, 'assets/icons/nested/icon.svg')));

  // 正常资源的内容差异仍必须被发现。
  write('wego-app/lib/assets/icons/nested/icon.svg', '<svg>changed</svg>');
  const driftReport = JSON.parse(runSync(1, '--check', '--json'));
  assert.ok(
    driftReport.synced.some(
      (item) => item.dest === 'assets/icons' && item.action === 'out-of-sync',
    ),
  );

  // 源恢复同步后，任一必需源缺失也必须让 --check 失败。
  runSync(0);
  fs.rmSync(path.join(fixtureRoot, '.codex/skills/wego-design/iconfont.css'));
  const missingReport = JSON.parse(runSync(1, '--check', '--json'));
  assert.ok(missingReport.missing.some((item) => item.src === 'iconfont.css'));

  console.log('sync-wego-app-lib 忽略与漂移测试通过');
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
