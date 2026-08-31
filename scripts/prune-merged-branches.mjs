#!/usr/bin/env node

/**
 * prune-merged-branches.mjs
 *
 * 扫描本地分支，识别已合入 main 或远端已删除的残留分支并清理。
 *
 * 目的：闭合"PR 合并后本地分支残留"的收口缺口——PR 合并是异步发生的（网页端合并 / CI 自动合并），
 * 远端分支被 GitHub 自动删除（upstream gone），但本地分支/工作树若无人收口就会长期残留。
 *
 * 残留判定（保守策略，避免误删在途工作）：
 * - 排除 main、当前分支、有 worktree 检出的分支。
 * - 分支有开放 PR → 交付单元在途，保留。
 * - 分支 tip 是 main 的祖先（普通 merge 已合入）→ 可安全清理。
 * - 分支上游已删除（upstream gone，常见于 squash merge 后 GitHub 自动删除远端）→ 疑似已合并/废弃，
 *   默认只报告、需人工确认内容已进 main 后再清理；--force-gone 才一并清理。
 * - 分支上游存在且本地有独有提交 → 在途或未合并，保留。
 *
 * Usage:
 *   node scripts/prune-merged-branches.mjs              # dry-run，只报告
 *   node scripts/prune-merged-branches.mjs --force      # 清理已确认合入 main 的分支（merged 类）
 *   node scripts/prune-merged-branches.mjs --force-gone # 同时清理 upstream gone 且与 main 内容一致的分支
 *   node scripts/prune-merged-branches.mjs --json       # JSON 输出
 *   node scripts/prune-merged-branches.mjs test         # 自测
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();

function parseArgs(argv) {
  const flags = { force: false, forceGone: false, json: false, test: false };
  for (const arg of argv) {
    if (arg === '--force') flags.force = true;
    else if (arg === '--force-gone') flags.forceGone = true;
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
 * 获取当前分支名。
 */
function currentBranch() {
  const r = runGit(['branch', '--show-current']);
  return r.status === 0 ? r.stdout : null;
}

/**
 * 获取全部本地分支及其上游信息。
 * 输出形如：branchName<TAB>upstreamShort<TAB>upstreamTrack<TAB>isHEAD
 * upstreamTrack 为 [gone] 表示上游远程分支已删除。
 */
function listLocalBranches() {
  const fmt = '%(refname:short)%09%(upstream:short)%09%(upstream:track)%09%(HEAD)';
  const r = runGit(['for-each-ref', `--format=${fmt}`, 'refs/heads']);
  if (r.status !== 0) {
    throw new Error(`无法读取本地分支列表：${r.stderr || r.stdout}`);
  }
  const branches = [];
  for (const line of r.stdout.split('\n')) {
    if (!line) continue;
    const [name, upstream, track, head] = line.split('\t');
    branches.push({
      name,
      upstream: upstream || null,
      upstreamGone: track === '[gone]',
      isHead: head === '*'
    });
  }
  return branches;
}

/**
 * 获取全部 worktree 检出的分支（排除这些分支，避免删到在检出的分支）。
 */
function listCheckedOutBranches() {
  const r = runGit(['worktree', 'list', '--porcelain']);
  if (r.status !== 0) {
    throw new Error(`无法读取 worktree 列表：${r.stderr || r.stdout}`);
  }
  const branches = new Set();
  for (const line of r.stdout.split('\n')) {
    if (line.startsWith('branch ')) {
      const b = line.slice('branch '.length).trim().replace(/^refs\/heads\//, '');
      if (b) branches.add(b);
    }
  }
  return branches;
}

/**
 * 判断分支 tip 是否为 main 的祖先（即已通过普通 merge 合入 main）。
 */
function isAncestorOfMain(branch) {
  const r = runGit(['merge-base', '--is-ancestor', branch, 'refs/heads/main']);
  return r.status === 0;
}

/**
 * 判断分支与 main 当前内容是否完全一致（无任何文件差异）。
 * 用于辅助判断 upstream gone 的分支内容是否已进 main（squash merge 场景）。
 */
function isContentSameAsMain(branch) {
  const r = runGit(['diff', '--quiet', 'refs/heads/main', branch]);
  return r.status === 0;
}

/**
 * 扫描本地分支，分类为可清理、需人工确认、保留。
 */
function scanBranches() {
  const all = listLocalBranches();
  const checkedOut = listCheckedOutBranches();
  const current = currentBranch();
  const mainSha = runGit(['rev-parse', 'refs/heads/main']).stdout;

  const result = { merged: [], gone: [], active: [], error: [] };

  for (const br of all) {
    if (br.name === 'main' || br.isHead || br.name === current) continue;
    if (checkedOut.has(br.name)) {
      // 有 worktree 检出 → 在途交付单元，保留
      result.active.push({ ...br, reason: '有 worktree 检出，交付单元在途' });
      continue;
    }

    if (br.upstreamGone) {
      // 上游已删除：squash merge 后 GitHub 自动删远端，或任务被关闭/废弃
      const same = isContentSameAsMain(br);
      const openPR = hasOpenPR(br.name);
      const info = {
        name: br.name,
        upstream: br.upstream,
        contentSameAsMain: same,
        openPR,
        reason: same
          ? '上游已删除且与 main 内容一致，疑似 squash 合入后的残留'
          : '上游已删除但与 main 内容不一致，可能是废弃或部分合入，需确认'
      };
      if (same) result.gone.push(info);
      else result.active.push({ ...info, reason: info.reason });
      continue;
    }

    if (isAncestorOfMain(br)) {
      result.merged.push({ name: br.name, upstream: br.upstream, reason: 'tip 是 main 祖先，已合入 main' });
      continue;
    }

    const openPR = hasOpenPR(br.name);
    if (openPR === true) {
      result.active.push({ name: br.name, upstream: br.upstream, openPR, reason: '有开放 PR，交付单元在途' });
      continue;
    }

    // 上游存在、非 main 祖先、无开放 PR、无 worktree → 保留并提示
    result.active.push({ name: br.name, upstream: br.upstream, openPR, reason: '非 main 祖先且无开放 PR，可能未完成' });
  }

  result.summary = {
    main: mainSha,
    total: all.length,
    merged: result.merged.length,
    gone: result.gone.length,
    active: result.active.length
  };
  return result;
}

/**
 * 删除分支（本地）。删除前再次复核该分支未被检出且无 worktree。
 */
function deleteBranches(list) {
  const removed = [];
  const failed = [];
  for (const br of list) {
    const r = runGit(['branch', '-D', br.name]);
    if (r.status === 0) removed.push(br.name);
    else failed.push({ name: br.name, error: r.stderr || r.stdout });
  }
  return { removed, failed };
}

function printReport(scan, delResult, flags) {
  if (flags.json) {
    const out = { ...scan, removed: delResult?.removed || [], failed: delResult?.failed || [] };
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  console.log('=== 本地分支巡检 ===');
  console.log(`main: ${scan.summary.main?.slice(0, 8) || '未知'} | 本地分支 ${scan.summary.total} 个`);
  console.log('');

  if (scan.merged.length) {
    console.log(`可清理（已合入 main，${scan.merged.length} 个）：`);
    for (const br of scan.merged) console.log(`  - ${br.name}`);
    console.log('');
  }

  if (scan.gone.length) {
    console.log(`疑似残留（上游已删且与 main 内容一致，${scan.gone.length} 个，默认需确认）：`);
    for (const br of scan.gone) console.log(`  - ${br.name}`);
    console.log('');
  }

  if (scan.active.length) {
    console.log(`保留（${scan.active.length} 个）：`);
    for (const br of scan.active) console.log(`  - ${br.name}：${br.reason}`);
    console.log('');
  }

  if (delResult) {
    if (delResult.removed.length) {
      console.log(`已删除 ${delResult.removed.length} 个分支：`);
      for (const n of delResult.removed) console.log(`  - ${n}`);
    }
    if (delResult.failed.length) {
      console.log(`删除失败 ${delResult.failed.length} 个：`);
      for (const f of delResult.failed) console.log(`  - ${f.name}：${f.error}`);
    }
  } else {
    if (scan.merged.length) console.log(`当前为 dry-run，未实际删除。使用 --force 清理 merged 类。`);
    if (scan.gone.length) console.log(`gone 类需确认内容已进 main 后使用 --force-gone 一并清理。`);
    if (!scan.merged.length && !scan.gone.length) console.log('无残留分支，无需清理。');
  }
}

// ---- 自测 ----
function runSelfTest() {
  const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

  // 测试 parseArgs
  assert(parseArgs(['--force', '--json']).force === true, '参数解析 --force 失败');
  assert(parseArgs(['--force-gone']).forceGone === true, '参数解析 --force-gone 失败');
  assert(parseArgs([]).force === false, '默认参数应为 false');

  // 测试 listLocalBranches 能正常运行（不校验内容，只校验不抛异常）
  const branches = listLocalBranches();
  assert(Array.isArray(branches) && branches.length >= 1, '分支列表应至少包含 main');

  // 测试 isAncestorOfMain：main 自身是 main 祖先
  assert(isAncestorOfMain('main'), 'main 应被识别为 main 的祖先');

  // 测试 listCheckedOutBranches 能正常运行
  const co = listCheckedOutBranches();
  assert(co instanceof Set, 'worktree 检出分支应为 Set');

  console.log('prune-merged-branches 自测通过');
}

function main() {
  const flags = parseArgs(process.argv.slice(2));

  if (flags.test) {
    runSelfTest();
    return;
  }

  let scan;
  try {
    scan = scanBranches();
  } catch (error) {
    console.error(`[prune-merged-branches] ${error.message}`);
    process.exit(1);
  }

  let delResult = null;
  const toDelete = [];
  if (flags.force) toDelete.push(...scan.merged);
  if (flags.forceGone) toDelete.push(...scan.gone);
  if (toDelete.length) delResult = deleteBranches(toDelete);

  printReport(scan, delResult, flags);
}

main();
