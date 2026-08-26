#!/usr/bin/env node

/**
 * prune-worktrees.mjs
 *
 * 扫描本地 git worktree，识别已结束交付单元的孤儿 worktree 并清理。
 *
 * 孤儿判定（保守策略，避免误删在途工作）：
 * - 排除主 worktree（branch=main 或 bare）
 * - 分支有开放 PR → 交付单元在途，保留
 * - worktree 有未提交改动 → 可能在途，只报告不自动清理
 * - 分支无开放 PR 且 worktree 干净 → 孤儿，可清理
 *
 * Usage:
 *   node scripts/prune-worktrees.mjs            # dry-run，只报告
 *   node scripts/prune-worktrees.mjs --force    # 实际清理孤儿 worktree
 *   node scripts/prune-worktrees.mjs --json     # JSON 输出
 *   node scripts/prune-worktrees.mjs test       # 自测
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();

function parseArgs(argv) {
  const flags = { force: false, json: false, test: false };
  for (const arg of argv) {
    if (arg === '--force') flags.force = true;
    else if (arg === '--json') flags.json = true;
    else if (arg === 'test') flags.test = true;
  }
  return flags;
}

function runGit(args, cwd) {
  const r = spawnSync('git', args, { cwd: cwd || repoRoot, encoding: 'utf8' });
  return { status: r.status, stdout: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
}

function runGh(args) {
  const r = spawnSync('gh', args, { cwd: repoRoot, encoding: 'utf8' });
  if (r.status !== 0) return null;
  try {
    return JSON.parse(r.stdout || '[]');
  } catch {
    return null;
  }
}

/**
 * 解析 git worktree list --porcelain 输出。
 * 每个 worktree 块以 worktree <path> 开头，包含 branch、HEAD、detached 等字段。
 */
function listWorktrees() {
  const r = runGit(['worktree', 'list', '--porcelain']);
  if (r.status !== 0) {
    throw new Error(`无法读取 worktree 列表：${r.stderr || r.stdout}`);
  }
  const worktrees = [];
  let current = null;
  for (const line of r.stdout.split('\n')) {
    if (line.startsWith('worktree ')) {
      if (current) worktrees.push(current);
      current = { path: line.slice('worktree '.length).trim(), branch: null, head: null, detached: false, bare: false };
    } else if (line.startsWith('branch ')) {
      current.branch = line.slice('branch '.length).trim().replace(/^refs\/heads\//, '');
    } else if (line.startsWith('HEAD ')) {
      current.head = line.slice('HEAD '.length).trim();
    } else if (line === 'detached') {
      current.detached = true;
    } else if (line === 'bare') {
      current.bare = true;
    }
  }
  if (current) worktrees.push(current);
  return worktrees;
}

/**
 * 检查 worktree 是否干净（无未提交改动）。
 */
function isWorktreeClean(worktreePath) {
  if (!fs.existsSync(worktreePath)) return true; // 路径已不存在，视为干净
  const r = runGit(['status', '--porcelain'], worktreePath);
  if (r.status !== 0) return false;
  return r.stdout.length === 0;
}

/**
 * 检查分支是否有开放 PR。
 * @returns {boolean|null} true=有开放PR，false=确认无，null=gh不可用
 */
function hasOpenPR(branch) {
  if (!branch) return false;
  const list = runGh(['pr', 'list', '--state', 'open', '--head', branch, '--json', 'number', '--limit', '1']);
  if (list === null) return null;
  return Array.isArray(list) && list.length > 0;
}

/**
 * 判断是否为主 worktree。
 * 主 worktree 的特征：branch 为 main，或 .git 是目录（其他 worktree 的 .git 是文件）。
 * 不能用路径比较，因为脚本可能在任意 worktree 中运行。
 */
function isMainWorktree(wt) {
  if (wt.branch === 'main') return true;
  // 检查 .git 是目录还是文件：主 worktree 的 .git 是目录
  const gitPath = path.join(wt.path, '.git');
  try {
    return fs.statSync(gitPath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * 扫描所有 worktree，分类为可清理、需人工确认、保留。
 */
function scanWorktrees() {
  const worktrees = listWorktrees();
  const result = { prunable: [], dirty: [], active: [], main: null };

  for (const wt of worktrees) {
    if (isMainWorktree(wt)) {
      result.main = wt;
      continue;
    }

    const clean = isWorktreeClean(wt.path);
    const openPR = hasOpenPR(wt.branch);

    const info = {
      path: wt.path,
      branch: wt.branch || '(detached)',
      head: wt.head,
      clean,
      openPR,
      reason: null
    };

    if (openPR === true) {
      info.reason = '分支有开放 PR，交付单元在途';
      result.active.push(info);
    } else if (!clean) {
      info.reason = 'worktree 有未提交改动，可能在途，需人工确认';
      result.dirty.push(info);
    } else if (openPR === null) {
      info.reason = 'gh 不可用，无法确认 PR 状态，保守保留';
      result.active.push(info);
    } else {
      info.reason = '分支无开放 PR 且 worktree 干净，为孤儿';
      result.prunable.push(info);
    }
  }

  return result;
}

function pruneWorktrees(prunable) {
  const removed = [];
  const failed = [];
  for (const wt of prunable) {
    const r = runGit(['worktree', 'remove', wt.path]);
    if (r.status === 0) {
      removed.push(wt);
    } else {
      failed.push({ ...wt, error: r.stderr || r.stdout });
    }
  }
  return { removed, failed };
}

function printReport(scan, pruneResult, flags) {
  if (flags.json) {
    const out = {
      main: scan.main ? { path: scan.main.path, branch: scan.main.branch } : null,
      prunable: scan.prunable,
      dirty: scan.dirty,
      active: scan.active,
      summary: {
        total: scan.prunable.length + scan.dirty.length + scan.active.length,
        prunable: scan.prunable.length,
        dirty: scan.dirty.length,
        active: scan.active.length
      }
    };
    if (pruneResult) {
      out.removed = pruneResult.removed.map((w) => w.path);
      out.failed = pruneResult.failed;
    }
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  console.log('=== 本地 worktree 巡检 ===');
  if (scan.main) {
    console.log(`主 worktree：${scan.main.path}（${scan.main.branch || 'bare'}）`);
  }
  console.log('');

  if (scan.prunable.length) {
    console.log(`可清理（孤儿，${scan.prunable.length} 个）：`);
    for (const wt of scan.prunable) {
      console.log(`  - ${wt.path}（branch: ${wt.branch}）`);
      console.log(`    ${wt.reason}`);
    }
    console.log('');
  }

  if (scan.dirty.length) {
    console.log(`需人工确认（有未提交改动，${scan.dirty.length} 个）：`);
    for (const wt of scan.dirty) {
      console.log(`  - ${wt.path}（branch: ${wt.branch}）`);
      console.log(`    ${wt.reason}`);
    }
    console.log('');
  }

  if (scan.active.length) {
    console.log(`保留（交付单元在途，${scan.active.length} 个）：`);
    for (const wt of scan.active) {
      console.log(`  - ${wt.path}（branch: ${wt.branch}）`);
      console.log(`    ${wt.reason}`);
    }
    console.log('');
  }

  if (pruneResult) {
    if (pruneResult.removed.length) {
      console.log(`已清理 ${pruneResult.removed.length} 个孤儿 worktree：`);
      for (const wt of pruneResult.removed) console.log(`  - ${wt.path}`);
    }
    if (pruneResult.failed.length) {
      console.log(`清理失败 ${pruneResult.failed.length} 个：`);
      for (const wt of pruneResult.failed) console.log(`  - ${wt.path}：${wt.error}`);
    }
  } else if (scan.prunable.length) {
    console.log(`当前为 dry-run，未实际清理。使用 --force 执行清理。`);
  } else {
    console.log('无孤儿 worktree，无需清理。');
  }
}

// ---- 自测 ----
function runSelfTest() {
  const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

  // 测试 isMainWorktree
  const fakeMain = { path: repoRoot, branch: 'main' };
  assert(isMainWorktree(fakeMain), '主 worktree 应被识别');

  const fakeOther = { path: path.join(path.dirname(repoRoot), 'other-worktree'), branch: 'feature/test' };
  assert(!isMainWorktree(fakeOther), '非主 worktree 不应被识别为主');

  // 测试 parseArgs
  const args1 = parseArgs(['--force', '--json']);
  assert(args1.force === true && args1.json === true, '参数解析失败');

  const args2 = parseArgs([]);
  assert(args2.force === false && args2.json === false, '默认参数应为 false');

  // 测试 listWorktrees 能正常运行（不校验内容，只校验不抛异常）
  const wts = listWorktrees();
  assert(Array.isArray(wts) && wts.length >= 1, 'worktree 列表应至少包含主 worktree');

  console.log('prune-worktrees 自测通过');
}

function main() {
  const flags = parseArgs(process.argv.slice(2));

  if (flags.test) {
    runSelfTest();
    return;
  }

  let scan;
  try {
    scan = scanWorktrees();
  } catch (error) {
    console.error(`[prune-worktrees] ${error.message}`);
    process.exit(1);
  }

  let pruneResult = null;
  if (flags.force && scan.prunable.length) {
    pruneResult = pruneWorktrees(scan.prunable);
  }

  printReport(scan, pruneResult, flags);

  // dirty worktree 存在时退出码为 2，提醒人工确认
  if (scan.dirty.length > 0) {
    process.exit(2);
  }
}

main();
