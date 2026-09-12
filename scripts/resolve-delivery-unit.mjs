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
import os from 'node:os';
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

const terminalStatuses = new Set(['frozen', 'cancelled', 'superseded']);

function iterationMatchesScene(iteration, scene) {
  return [
    iteration.identity?.primary_scene,
    ...(Array.isArray(iteration.identity?.related_scenes) ? iteration.identity.related_scenes : []),
    ...(Array.isArray(iteration.affected_scenes) ? iteration.affected_scenes : [])
  ].includes(scene);
}

function findIterationFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const records = [];
  const visit = current => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile() && entry.name === 'iteration.json' && /[\\/]_iterations[\\/]/.test(target)) records.push(target);
    }
  };
  visit(directory);
  return records;
}

function activeIterations(worktree, scene) {
  const records = [];
  const scenesRoot = path.join(worktree.path, 'wego-app', 'scenes');
  for (const file of findIterationFiles(scenesRoot)) {
    const iteration = readJson(file);
    if (iterationMatchesScene(iteration, scene) && !terminalStatuses.has(iteration.status)) {
      records.push({
        id: iteration.identity?.iteration_id,
        status: iteration.status,
        file,
        briefFile: iteration.brief_file || null,
        scenes: [...new Set([
          iteration.identity?.primary_scene,
          ...(iteration.identity?.related_scenes || []),
          ...(iteration.affected_scenes || [])
        ].filter(Boolean))],
        affectedRuntime: Array.isArray(iteration.affected_runtime) ? iteration.affected_runtime : []
      });
    }
  }
  return records;
}

function allLocalBranches() {
  const output = command('git', ['branch', '--format=%(refname:short)']);
  return output.split('\n').map(line => line.trim()).filter(Boolean);
}

function branchActiveIterations(branch, scene) {
  let listing;
  try {
    listing = command('git', ['-c', 'core.quotepath=false', 'ls-tree', '-r', '--name-only', branch, 'wego-app/scenes']);
  } catch {
    return [];
  }
  const iterationFiles = listing.split('\n')
    .map(line => line.trim())
    .filter(file => /^wego-app\/scenes\/[^/]+\/[^/]+\/_iterations\/[^/]+\/iteration\.json$/.test(file));
  const records = [];
  for (const iterationFile of iterationFiles) {
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
    if (iterationMatchesScene(iteration, scene) && !terminalStatuses.has(iteration.status)) {
      records.push({
        id: iteration.identity?.iteration_id,
        status: iteration.status,
        file: iterationFile,
        briefFile: iteration.brief_file || null,
        scenes: [...new Set([
          iteration.identity?.primary_scene,
          ...(iteration.identity?.related_scenes || []),
          ...(iteration.affected_scenes || [])
        ].filter(Boolean))],
        affectedRuntime: Array.isArray(iteration.affected_runtime) ? iteration.affected_runtime : []
      });
    }
  }
  return records;
}

function lines(output) {
  return (output || '').split('\n').map(line => line.trim()).filter(Boolean);
}

function changedFilesForWorktree(worktree) {
  const files = new Set();
  const commands = [
    ['git', ['-c', 'core.quotepath=false', 'diff', '--name-only', 'origin/main...HEAD']],
    ['git', ['-c', 'core.quotepath=false', 'diff', '--name-only']],
    ['git', ['-c', 'core.quotepath=false', 'diff', '--cached', '--name-only']],
    ['git', ['-c', 'core.quotepath=false', 'ls-files', '--others', '--exclude-standard']]
  ];
  for (const [commandName, commandArgs] of commands) {
    const result = spawnSync(commandName, commandArgs, { cwd: worktree.path, encoding: 'utf8' });
    if (result.status === 0) for (const file of lines(result.stdout)) files.add(file);
  }
  return [...files];
}

function changedFilesForBranch(branch) {
  try {
    return lines(command('git', ['-c', 'core.quotepath=false', 'diff', '--name-only', `origin/main...${branch}`]));
  } catch {
    return [];
  }
}

function iterationOwnedByChanges(iteration, changedFiles, worktreePath = null) {
  const iterationFile = worktreePath
    ? path.relative(worktreePath, iteration.file).split(path.sep).join('/')
    : iteration.file;
  const iterationDirectory = path.posix.dirname(iterationFile);
  const direct = changedFiles.some(file => file === iterationFile || file.startsWith(`${iterationDirectory}/`));
  if (direct) return { direct: true, related: true };
  const related = changedFiles.some(file => (
    iteration.scenes.some(scene => new RegExp(`^wego-app/scenes/[^/]+/${escapeRegex(scene)}/`).test(file))
    || iteration.affectedRuntime.includes(file)
  ));
  return { direct: false, related };
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ownedIterations(iterations, changedFiles, worktreePath = null) {
  const classified = iterations.map(iteration => ({
    iteration,
    ownership: iterationOwnedByChanges(iteration, changedFiles, worktreePath)
  }));
  const direct = classified.filter(item => item.ownership.direct).map(item => item.iteration);
  if (direct.length) return direct;
  return classified.filter(item => item.ownership.related).map(item => item.iteration);
}

function classify(candidates) {
  if (!candidates.length) return { outcome: 'new', candidates: [] };
  const branches = [...new Set(candidates.map(candidate => candidate.branch))];
  if (branches.length !== 1) return { outcome: 'conflict', candidates };
  return { outcome: 'matched', candidates: [candidates[0]] };
}

function resolve(scene, {
  listWorktrees = worktrees,
  listPullRequests = openPullRequests,
  listBranches = allLocalBranches,
  listWorktreeChanges = changedFilesForWorktree,
  listBranchChanges = changedFilesForBranch
} = {}) {
  if (!scene) throw new Error('--scene 必填，必须使用已确认的场景名称');
  const pullRequests = listPullRequests();
  const worktreeList = listWorktrees();
  const worktreeBranches = new Set(worktreeList.map(wt => wt.branch));

  // 1. 遍历有 worktree 的分支
  const candidates = worktreeList.flatMap(worktree => {
    if (worktree.branch === 'main') return [];
    const iterations = ownedIterations(activeIterations(worktree, scene), listWorktreeChanges(worktree), worktree.path);
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
    const iterations = ownedIterations(branchActiveIterations(branch, scene), listBranchChanges(branch));
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

  // 3. 开放 PR 可能只存在远端；fetch 后从 origin/<head> 恢复候选。
  const knownBranches = new Set([...worktreeBranches, ...listBranches()]);
  for (const pullRequest of pullRequests) {
    if (knownBranches.has(pullRequest.headRefName)) continue;
    const remoteRef = `origin/${pullRequest.headRefName}`;
    const iterations = ownedIterations(branchActiveIterations(remoteRef, scene), listBranchChanges(remoteRef));
    if (!iterations.length) continue;
    candidates.push({
      branch: pullRequest.headRefName,
      worktree: null,
      pullRequest,
      orphan: true,
      stage: 'remote-pr',
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

  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-delivery-unit-'));
  try {
    const iterationDirectory = path.join(fixture, 'wego-app/scenes/bcg/工作台/_iterations/bcg001-测试-20260904');
    fs.mkdirSync(iterationDirectory, { recursive: true });
    const iterationFile = path.join(iterationDirectory, 'iteration.json');
    fs.writeFileSync(iterationFile, JSON.stringify({
      identity: { iteration_id: 'bcg001', primary_scene: '工作台', related_scenes: ['应用中心'] },
      status: 'in-development',
      brief_file: 'bcg001-测试-20260904.md',
      affected_scenes: ['工作台', '应用中心', '我的'],
      affected_runtime: ['wego-app/js/shared.js']
    }));
    const discovered = activeIterations({ path: fixture }, '我的');
    if (discovered.length !== 1 || discovered[0].id !== 'bcg001') {
      throw new Error('必须从分类目录递归发现 affected_scenes 命中的活动迭代');
    }
    const iterationRelative = path.relative(fixture, iterationFile).split(path.sep).join('/');
    const owned = ownedIterations(discovered, [iterationRelative], fixture);
    if (owned.length !== 1) throw new Error('迭代目录发生变化时必须识别为当前分支交付单元');
    const inherited = ownedIterations(discovered, [], fixture);
    if (inherited.length !== 0) throw new Error('仅从 main 继承且本分支无相关变化的活动迭代不得重复认领');

    const resolved = resolve('我的', {
      listWorktrees: () => [{ path: fixture, branch: 'feature/test' }],
      listPullRequests: () => [{ number: 9, headRefName: 'feature/test', baseRefName: 'main', url: 'test' }],
      listBranches: () => ['feature/test'],
      listWorktreeChanges: () => [iterationRelative],
      listBranchChanges: () => []
    });
    if (resolved.outcome !== 'matched' || resolved.candidates[0].iterations[0].id !== 'bcg001') {
      throw new Error('分类目录与跨场景活动迭代必须解析为 matched');
    }
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }

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
