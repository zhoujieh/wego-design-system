#!/usr/bin/env node

/**
 * 交付单元核对器。
 *
 * 在进入产品或设计流程前，从全部 Git worktree 中查找与场景或 routeId 匹配的
 * 活跃认领、未冻结迭代，并与开放 PR 的 head 分支关联。
 *
 * 用法：
 *   node scripts/resolve-delivery-unit.mjs --scene 我的 [--route-id my] [--json]
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

function activeClaims(worktree, scene, routeId) {
  const directory = path.join(worktree.path, 'claims');
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter(file => file.endsWith('.json'))
    .map(file => ({ file, claim: readJson(path.join(directory, file)) }))
    .filter(({ claim }) => !['released', 'done'].includes(claim.status))
    .filter(({ claim }) => claim.scene === scene || (routeId && claim.routeId === routeId));
}

function activeIterations(worktree, scene) {
  const directory = path.join(worktree.path, 'wego-app', 'scenes', scene, '_iterations');
  if (!fs.existsSync(directory)) return [];
  const records = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(directory, entry.name, 'iteration.json');
    if (!fs.existsSync(file)) continue;
    const iteration = readJson(file);
    if (iteration.identity?.primary_scene === scene && !['frozen', 'cancelled', 'superseded'].includes(iteration.status)) {
      records.push({ id: iteration.identity.iteration_id, status: iteration.status, file });
    }
  }
  return records;
}

function classify(candidates) {
  if (!candidates.length) return { outcome: 'new', candidates: [] };
  const branches = [...new Set(candidates.map(candidate => candidate.branch))];
  if (branches.length !== 1) return { outcome: 'conflict', candidates };
  const candidate = candidates[0];
  if (!candidate.pullRequest) return { outcome: 'conflict', candidates };
  return { outcome: 'matched', candidates: [candidate] };
}

function resolve(scene, routeId, { listWorktrees = worktrees, listPullRequests = openPullRequests } = {}) {
  if (!scene) throw new Error('--scene 必填，必须使用已确认的场景名称');
  const pullRequests = listPullRequests();
  const candidates = listWorktrees().flatMap(worktree => {
    const claims = activeClaims(worktree, scene, routeId);
    const iterations = activeIterations(worktree, scene);
    if (!claims.length && !iterations.length) return [];
    const pullRequest = pullRequests.find(item => item.headRefName === worktree.branch) || null;
    return [{
      branch: worktree.branch,
      worktree: worktree.path,
      pullRequest,
      claims: claims.map(({ file, claim }) => ({ file, agent: claim.agent, scene: claim.scene, routeId: claim.routeId, status: claim.status })),
      iterations
    }];
  });
  return classify(candidates);
}

function test() {
  const none = classify([]);
  if (none.outcome !== 'new') throw new Error('无候选时必须允许创建新交付单元');
  const matched = classify([{ branch: 'feature/my', pullRequest: { number: 22 } }]);
  if (matched.outcome !== 'matched') throw new Error('单一且关联开放 PR 的候选必须要求接手');
  const missingPr = classify([{ branch: 'feature/my', pullRequest: null }]);
  if (missingPr.outcome !== 'conflict') throw new Error('活跃候选缺少开放 PR 时必须阻断');
  const ambiguous = classify([
    { branch: 'feature/one', pullRequest: { number: 1 } },
    { branch: 'feature/two', pullRequest: { number: 2 } }
  ]);
  if (ambiguous.outcome !== 'conflict') throw new Error('多个候选时必须阻断');
  console.log('交付单元核对测试通过');
}

if (testing) {
  test();
  process.exit(0);
}

try {
  const report = resolve(value('--scene'), value('--route-id'));
  const payload = JSON.stringify(report, null, 2);
  if (jsonOutput) console.log(payload);
  else {
    console.log(`交付单元核对结果：${report.outcome}`);
    for (const candidate of report.candidates) {
      console.log(`- ${candidate.branch}：${candidate.worktree}${candidate.pullRequest ? `，PR #${candidate.pullRequest.number}` : '，缺少开放 PR'}`);
    }
  }
  process.exit(report.outcome === 'conflict' ? 2 : 0);
} catch (error) {
  const message = `交付单元核对失败：${error.message}`;
  if (jsonOutput) console.log(JSON.stringify({ outcome: 'conflict', error: message }, null, 2));
  else console.error(message);
  process.exit(2);
}
