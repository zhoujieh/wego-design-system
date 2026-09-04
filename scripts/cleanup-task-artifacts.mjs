#!/usr/bin/env node

/**
 * 清理仓库内的临时任务产物。
 *
 * clean（默认保留 24 小时内文件）：
 *   node scripts/cleanup-task-artifacts.mjs clean
 *   node scripts/cleanup-task-artifacts.mjs clean --older-than-hours=6
 *   node scripts/cleanup-task-artifacts.mjs clean --all
 *
 * check：只检查，不写文件；发现应清理内容时退出 1。
 * test：在系统临时目录运行自测。
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repositoryRoot = path.resolve(process.cwd());
const artifactRoots = ['.uploads', 'output', '.tasks', '.playwright-cli'];
const defaultOlderThanHours = 24;
const protectedTaskArtifacts = [
  '.tasks/experience-inbox.json',
  '.tasks/preview-servers/'
];

function parseArgs(argv) {
  const [command, ...flags] = argv;
  const result = {
    command,
    all: false,
    json: false,
    olderThanHours: defaultOlderThanHours,
    errors: [],
  };
  if (!['clean', 'check', 'test'].includes(command)) {
    result.errors.push('命令必须是 clean、check 或 test');
  }
  for (const flag of flags) {
    if (flag === '--all') result.all = true;
    else if (flag === '--json') result.json = true;
    else if (flag.startsWith('--older-than-hours=')) {
      const value = Number(flag.slice('--older-than-hours='.length));
      if (!Number.isFinite(value) || value < 0) result.errors.push('--older-than-hours 必须是非负数');
      else result.olderThanHours = value;
    } else result.errors.push(`未知参数：${flag}`);
  }
  if (result.all && flags.some(flag => flag.startsWith('--older-than-hours='))) {
    result.errors.push('--all 不得与 --older-than-hours 同时使用');
  }
  return result;
}

function artifactPath(baseRoot, relative) {
  if (!artifactRoots.includes(relative)) throw new Error(`未登记的任务产物目录：${relative}`);
  const target = path.resolve(baseRoot, relative);
  if (path.dirname(target) !== path.resolve(baseRoot)) throw new Error(`任务产物路径越界：${target}`);
  return target;
}

function isProtectedTaskArtifact(baseRoot, target) {
  const relative = path.relative(baseRoot, target).split(path.sep).join('/');
  return protectedTaskArtifacts.some(marker => (
    marker.endsWith('/') ? relative.startsWith(marker) : relative === marker
  ));
}

function listLeaves(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.lstatSync(target);
  if (!stat.isDirectory() || stat.isSymbolicLink()) return [{ target, stat }];
  const leaves = [];
  for (const entry of fs.readdirSync(target)) {
    leaves.push(...listLeaves(path.join(target, entry)));
  }
  return leaves;
}

function removeEmptyDirectories(target, root) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.lstatSync(target);
  if (!stat.isDirectory() || stat.isSymbolicLink()) return [];
  const removed = [];
  for (const entry of fs.readdirSync(target)) {
    removed.push(...removeEmptyDirectories(path.join(target, entry), root));
  }
  if (fs.existsSync(target) && fs.readdirSync(target).length === 0) {
    fs.rmdirSync(target);
    removed.push(path.relative(root, target));
  }
  return removed;
}

function inspectArtifacts({ baseRoot, all, olderThanHours, now = Date.now() }) {
  const cutoff = now - olderThanHours * 60 * 60 * 1000;
  const matched = [];
  for (const relativeRoot of artifactRoots) {
    const root = artifactPath(baseRoot, relativeRoot);
    if (!fs.existsSync(root)) continue;
    const leaves = listLeaves(root).filter(leaf => !isProtectedTaskArtifact(baseRoot, leaf.target));
    if (all) {
      for (const leaf of leaves) {
        matched.push({
          path: path.relative(baseRoot, leaf.target),
          type: leaf.stat.isSymbolicLink() ? 'symlink' : 'file',
          files: 1,
          bytes: leaf.stat.size,
        });
      }
      continue;
    }
    for (const leaf of leaves) {
      if (leaf.stat.mtimeMs > cutoff) continue;
      matched.push({
        path: path.relative(baseRoot, leaf.target),
        type: leaf.stat.isSymbolicLink() ? 'symlink' : 'file',
        files: 1,
        bytes: leaf.stat.size,
      });
    }
  }
  return matched;
}

function cleanArtifacts({ baseRoot, all, olderThanHours, now = Date.now() }) {
  const matched = inspectArtifacts({ baseRoot, all, olderThanHours, now });
  const removedDirectories = [];
  for (const item of matched) {
    const target = path.resolve(baseRoot, item.path);
    const allowed = artifactRoots.some(relativeRoot => {
      const root = artifactPath(baseRoot, relativeRoot);
      return target === root || target.startsWith(`${root}${path.sep}`);
    });
    if (!allowed) throw new Error(`任务产物文件越界：${target}`);
    if (isProtectedTaskArtifact(baseRoot, target)) throw new Error(`受保护的交付状态不得由通用清理删除：${item.path}`);
    fs.rmSync(target, { recursive: item.type === 'root', force: true });
  }
  for (const relativeRoot of artifactRoots) {
    removedDirectories.push(...removeEmptyDirectories(artifactPath(baseRoot, relativeRoot), baseRoot));
  }
  return { matched, removedDirectories };
}

function reportFor(options, matched, removedDirectories = []) {
  return {
    mode: options.command,
    policy: options.all ? 'all' : `older-than-${options.olderThanHours}-hours`,
    roots: artifactRoots,
    matched,
    matchedFiles: matched.reduce((sum, item) => sum + item.files, 0),
    matchedBytes: matched.reduce((sum, item) => sum + item.bytes, 0),
    removedDirectories,
  };
}

function runSelfTest() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-task-artifacts-'));
  try {
    const oldTime = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const oldUpload = path.join(fixture, '.uploads', 'old-input.png');
    const oldSnapshot = path.join(fixture, '.playwright-cli', 'nested', 'old.yml');
    const recentOutput = path.join(fixture, 'output', 'recent.png');
    const experienceInbox = path.join(fixture, '.tasks', 'experience-inbox.json');
    const previewRecord = path.join(fixture, '.tasks', 'preview-servers', 'active.json');
    for (const target of [oldUpload, oldSnapshot, recentOutput, experienceInbox, previewRecord]) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, target);
    }
    fs.utimesSync(oldUpload, oldTime, oldTime);
    fs.utimesSync(oldSnapshot, oldTime, oldTime);

    const checked = inspectArtifacts({
      baseRoot: fixture,
      all: false,
      olderThanHours: 24,
    });
    assert.deepEqual(
      checked.map(item => item.path).sort(),
      ['.playwright-cli/nested/old.yml', '.uploads/old-input.png'],
    );
    assert.ok(fs.existsSync(oldUpload), '检查模式不得删除文件');

    cleanArtifacts({ baseRoot: fixture, all: false, olderThanHours: 24 });
    assert.ok(!fs.existsSync(oldUpload), '过期上传应被清理');
    assert.ok(!fs.existsSync(oldSnapshot), '过期 Playwright 快照应被清理');
    assert.ok(fs.existsSync(recentOutput), '24 小时内产物必须保留');

    cleanArtifacts({ baseRoot: fixture, all: true, olderThanHours: 24 });
    assert.ok(fs.existsSync(experienceInbox), '经验草稿不得被通用清理删除');
    assert.ok(fs.existsSync(previewRecord), '受管预览记录不得被通用清理删除');
    assert.ok(!fs.existsSync(path.join(fixture, '.uploads')), '--all 必须清理非保护任务产物');
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

function printReport(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  const sizeKb = (report.matchedBytes / 1024).toFixed(1);
  console.log(`任务产物 ${report.mode}：${report.matchedFiles} 个文件，${sizeKb} KB，策略 ${report.policy}`);
  for (const item of report.matched) console.log(`- ${item.path}`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.errors.length > 0) {
    for (const error of options.errors) console.error(`[error] ${error}`);
    process.exit(2);
  }
  if (options.command === 'test') {
    runSelfTest();
    const report = { ok: true, test: 'cleanup-task-artifacts' };
    if (options.json) console.log(JSON.stringify(report));
    else console.log('任务产物清理测试通过');
    return;
  }

  if (options.command === 'check') {
    const matched = inspectArtifacts({
      baseRoot: repositoryRoot,
      all: options.all,
      olderThanHours: options.olderThanHours,
    });
    const report = reportFor(options, matched);
    printReport(report, options.json);
    process.exit(matched.length > 0 ? 1 : 0);
  }

  const result = cleanArtifacts({
    baseRoot: repositoryRoot,
    all: options.all,
    olderThanHours: options.olderThanHours,
  });
  printReport(reportFor(options, result.matched, result.removedDirectories), options.json);
}

main();
