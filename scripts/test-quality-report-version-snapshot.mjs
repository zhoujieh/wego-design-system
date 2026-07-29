#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repositoryRoot = process.cwd();
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-quality-version-'));
const sourceLibrary = path.join(repositoryRoot, '.codex/skills/wego-design');
const fixtureLibrary = path.join(fixtureRoot, '.codex/skills/wego-design');
const validator = path.join(repositoryRoot, 'scripts/validate-component-contract-parity.mjs');

try {
  fs.mkdirSync(path.dirname(fixtureLibrary), { recursive: true });
  fs.cpSync(sourceLibrary, fixtureLibrary, { recursive: true });
  fs.cpSync(path.join(repositoryRoot, '.codex/skills/shared'), path.join(fixtureRoot, '.codex/skills/shared'), { recursive: true });
  fs.cpSync(path.join(repositoryRoot, 'docs/kuikly_components'), path.join(fixtureRoot, 'docs/kuikly_components'), { recursive: true });
  fs.copyFileSync(path.join(repositoryRoot, 'AGENTS.md'), path.join(fixtureRoot, 'AGENTS.md'));

  const metadataFile = path.join(fixtureLibrary, 'metadata.json');
  const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
  metadata.version += 100;
  fs.writeFileSync(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`);
  const snapshotResult = spawnSync(process.execPath, [validator, '--json'], { cwd: fixtureRoot, encoding: 'utf8' });
  assert.equal(snapshotResult.status, 0, `UI Kit 质量报告的历史版本快照不应被当前 metadata 版本拒绝：${snapshotResult.stderr || snapshotResult.stdout}`);

  const plan = JSON.parse(fs.readFileSync(path.join(fixtureLibrary, 'uikit-plan.json'), 'utf8'));
  const qualityFile = path.join(fixtureLibrary, plan.pagePatterns[0].uiKit.qualityReport);
  const quality = JSON.parse(fs.readFileSync(qualityFile, 'utf8'));
  quality.designSystemVersion = 0;
  fs.writeFileSync(qualityFile, `${JSON.stringify(quality, null, 2)}\n`);
  const invalidSnapshot = spawnSync(process.execPath, [validator, '--json'], { cwd: fixtureRoot, encoding: 'utf8' });
  assert.notEqual(invalidSnapshot.status, 0, '非正整数 designSystemVersion 必须失败');
  assert.match(invalidSnapshot.stdout || invalidSnapshot.stderr, /uikit\.quality_report_schema/, '非法版本必须由质量报告 Schema 守卫拦截');
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log('UI Kit 质量报告版本快照测试通过。');
