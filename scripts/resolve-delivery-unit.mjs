#!/usr/bin/env node

/**
 * 交付单元核对器。
 *
 * 在进入产品或设计流程前，从全部 Git worktree 和无 worktree 的本地分支中
 * 查找与场景匹配的未冻结迭代，并关联可选的开放 PR。
 * 本地迭代阶段允许交付单元尚未创建 PR。
 *
 * 用法：
 *   node scripts/resolve-delivery-unit.mjs --scene 我的 [--json]
 *   node scripts/resolve-delivery-unit.mjs test
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const testing = args.includes('test');

function value(flag) {
  const index = args.indexOf(flag);
  if (index >= 0) return args[index + 1] || null;
  const inline = args.find(argument => argument.startsWith(`${flag}=`));
  return inline ? inline.slice(flag.length + 1) : null;
}

function command(commandName, commandArgs, cwd = root) {
  const result = spawnSync(commandName, commandArgs, { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `${commandName} 执行失败`).trim());
  }
  return result.stdout || '';
}

function worktrees() {
  const output = command('git', ['worktree', 'list', '--porcelain']);
  const records = [];
  let current = null;
  for (const line of output.split('\n')) {
    if (line.startsWith('worktree ')) {
      if (current) records.push(current);
      current = { path: line.slice('worktree '.length), branch: null };
    } else if (current && line.startsWith('branch refs/heads/')) {
      current.branch = line.slice('branch refs/heads/'.length);
    }
  }
  if (current) records.push(current);
  return records.filter(record => record.branch);
}

function openPullRequests() {
  const output = command('gh', [
    'pr', 'list', '--state', 'open', '--limit', '100',
    '--json', 'number,headRefName,baseRefName,url'
  ]);
  const records = JSON.parse(output);
  if (!Array.isArray(records)) throw new Error('开放 PR 返回格式无效');
  return records.filter(record => record.baseRefName === 'main');
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${file} 无法解析：${error.message}`);
  }
}

function activeIterations(worktree, scene) {
  // 场景位于 scenes/{分类}/{中文业务场景}/，需遍历全部分类定位迭代目录。
  const scenesRoot = path.join(worktree.path, 'wego-app', 'scenes');
  if (!fs.existsSync(scenesRoot)) return [];
  const records = [];
  const categories = fs.readdirSync(scenesRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('_'));
  for (const category of categories) {
    const directory = path.join(scenesRoot, category.name, scene, '_iterations');
    if (!fs.existsSync(directory)) continue;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(directory, entry.name, 'iteration.json');
      if (!fs.existsSync(file)) continue;
      const iteration = readJson(file);
      if (iteration.identity?.primary_scene === scene && !['frozen', 'cancelled', 'superseded'].includes(iteration.status)) {
        records.push({ id: iteration.identity.iteration_id, status: iteration.status, file });
      }
    }
  }
  return records;
}

function allLocalBranches() {
  const output = command('git', ['branch', '--format=%(refname:short)']);
  return output.split('\n').map(line => line.trim()).filter(Boolean);
}

function branchActiveIterations(branch, scene) {
  // 与 activeIterations 对齐：遍历 scenes/{分类}/ 全部分类，查找 {scene}/_iterations。
  const records = [];
  let categories;
  try {
    categories = command('git', ['ls-tree', '-d', '--name-only', branch, 'wego-app/scenes/'])
      .split('\n').map(line => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
  for (const category of categories) {
    const treePath = `wego-app/scenes/${category}/${scene}/_iterations`;
    let listing;
    try {
      listing = command('git', ['ls-tree', '-d', '--name-only', branch, treePath]);
    } catch {
      continue;
    }
    const dirs = listing.split('\n').map(line => line.trim()).filter(Boolean);
    if (!dirs.length) continue;
    for (const dir of dirs) {
      const iterationFile = `${dir}/iteration.json`;
      let raw;
      try {
        raw = command('git', ['show', `${branch}:${iterationFile}`]);
      } catch {
        continue;
      }
      let iteration;
      try {
        iteration = JSON.parse(raw);
      } catch {
        continue;
      }
      if (iteration.identity?.primary_scene === scene && !['frozen', 'cancelled', 'superseded'].includes(iteration.status)) {
        records.push({ id: iteration.identity.iteration_id, status: iteration.status, file: iterationFile });
      }
    }
  }
  return records;
}

function classify(candidates) {
  if (!candidates.length) return { outcome: 'new', candidates: [] };
  const branches = [...new Set(candidates.map(candidate => candidate.branch))];
  if (branches.length !== 1) return { outcome: 'conflict', candidates };
  return { outcome: 'matched', candidates: [candidates[0]] };
}

function resolve(scene, { listWorktrees = worktrees, listPullRequests = openPullRequests, listBranches = allLocalBranches } = {}) {
  if (!scene) throw new Error('--scene 必填，必须使用已确认的场景名称');
  const pullRequests = listPullRequests();
  const worktreeList = listWorktrees();
  const worktreeBranches = new Set(worktreeList.map(wt => wt.branch));

  // 1. 遍历有 worktree 的分支
  const candidates = worktreeList.flatMap(worktree => {
    const iterations = activeIterations(worktree, scene);
    if (!iterations.length) return [];
    const pullRequest = pullRequests.find(item => item.headRefName === worktree.branch) || null;
    return [{
      branch: worktree.branch,
      worktree: worktree.path,
      pullRequest,
      orphan: false,
      stage: 'local-iteration',
      iterations
    }];
  });

  // 2. 遍历无 worktree 的本地分支（防止 worktree 被清理但分支仍在的情况）
  for (const branch of listBranches()) {
    if (worktreeBranches.has(branch)) continue;
    if (branch === 'main') continue;
    const iterations = branchActiveIterations(branch, scene);
    if (!iterations.length) continue;
    const pullRequest = pullRequests.find(item => item.headRefName === branch) || null;
    candidates.push({
      branch,
      worktree: null,
      pullRequest,
      orphan: true,
      stage: 'orphan-branch',
      iterations
    });
  }

  return classify(candidates);
}

function test() {
  const none = classify([]);
  if (none.outcome !== 'new') throw new Error('无候选时必须允许创建新交付单元');

  const formalReview = classify([{ branch: 'feature/my', pullRequest: { number: 22 } }]);
  if (formalReview.outcome !== 'matched') throw new Error('单一且关联开放 PR 的候选必须要求接手');

  const localIteration = classify([{ branch: 'feature/my', pullRequest: null }]);
  if (localIteration.outcome !== 'matched') throw new Error('单一且尚未创建 PR 的本地迭代候选必须要求接手');

  const orphanBranch = classify([{ branch: 'feature/my', worktree: null, orphan: true, pullRequest: null }]);
  if (orphanBranch.outcome !== 'matched') throw new Error('单一无 worktree 的悬空分支候选必须要求接手');

  const ambiguous = classify([
    { branch: 'feature/one', pullRequest: { number: 1 } },
    { branch: 'feature/two', pullRequest: null }
  ]);
  if (ambiguous.outcome !== 'conflict') throw new Error('多个分支候选时必须阻断');

  const worktreeVsOrphan = classify([
    { branch: 'feature/my', worktree: '/path/wt', orphan: false },
    { branch: 'feature/my', worktree: null, orphan: true }
  ]);
  if (worktreeVsOrphan.outcome !== 'matched') throw new Error('同一分支的 worktree 与 orphan 候选必须合并为 matched');

  console.log('交付单元核对测试通过');
}

if (testing) {
  test();
  process.exit(0);
}

try {
  const report = resolve(value('--scene'));
  const payload = JSON.stringify(report, null, 2);
  if (jsonOutput) console.log(payload);
  else {
    console.log(`交付单元核对结果：${report.outcome}`);
    for (const candidate of report.candidates) {
      if (candidate.orphan) {
        const stage = candidate.pullRequest
          ? `无 worktree 的悬空分支（PR #${candidate.pullRequest.number}，需恢复 worktree 后接手）`
          : '无 worktree 的悬空分支（需恢复 worktree 后接手）';
        console.log(`- ${candidate.branch}：${stage}`);
      } else {
        const stage = candidate.pullRequest
          ? `本地迭代中（已推送，PR #${candidate.pullRequest.number}）`
          : '本地迭代中（未推送）';
        console.log(`- ${candidate.branch}：${candidate.worktree}，${stage}`);
      }
    }
  }
  process.exit(report.outcome === 'conflict' ? 2 : 0);
} catch (error) {
  const message = `交付单元核对失败：${error.message}`;
  if (jsonOutput) console.log(JSON.stringify({ outcome: 'conflict', error: message }, null, 2));
  else console.error(message);
  process.exit(2);
}
