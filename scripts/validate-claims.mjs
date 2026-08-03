#!/usr/bin/env node

/**
 * validate-claims.mjs
 *
 * 校验 claims/ 目录下的场景认领是否有冲突，并强制场景目录修改前必须认领。
 *
 * 规则（AGENTS.md scene-must-claim-before-edit）：
 * - 开工前必须在 claims/<agent-id>.json 认领本次负责的场景目录；
 * - 不判断是否并发，单人开发也必须认领；
 * - 认领期间场景目录由该 Agent 独占，他人不得修改；
 * - 完成后把 status 改为 released/done 释放。
 *
 * 校验内容：
 * 1. 活跃认领之间无 scene / routeId 冲突；
 * 2. 已认领的场景目录，其 route.json 不得被其它活跃认领覆盖；
 * 3. 若 --check-scene <scene> 指定场景目录，校验该场景是否已被当前 agent 认领。
 *
 * Usage:
 *   node scripts/validate-claims.mjs
 *   node scripts/validate-claims.mjs --check-scene 我的 --agent <agent-id>
 *   node scripts/validate-claims.mjs --check-changed --base <sha> --head <sha> --branch <branch>
 *   node scripts/validate-claims.mjs test
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const claimsDir = path.join(repoRoot, 'claims');
const args = process.argv.slice(2);
function argValue(name) {
  const i = args.indexOf(name);
  if (i >= 0) return args[i + 1] ?? null;
  const inline = args.find(arg => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : null;
}
const checkScene = argValue('--check-scene');
const checkAgent = argValue('--agent');
const checkChanged = args.includes('--check-changed');
const testing = args.includes('test');
const baseRef = argValue('--base');
const headRef = argValue('--head');
const branch = argValue('--branch');

if (testing) {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-claims-'));
  const runGit = gitArgs => spawnSync('git', gitArgs, { cwd: fixture, encoding: 'utf8' });
  try {
    fs.mkdirSync(path.join(fixture, 'claims'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'wego-app/scenes/测试场景'), { recursive: true });
    fs.writeFileSync(path.join(fixture, 'wego-app/scenes/测试场景/scene.js'), 'window.test = 1;\n');
    runGit(['init']);
    runGit(['config', 'user.name', 'Workflow Test']);
    runGit(['config', 'user.email', 'workflow-test@example.com']);
    runGit(['add', 'wego-app/scenes/测试场景/scene.js']);
    runGit(['commit', '-m', 'base']);
    const base = runGit(['rev-parse', 'HEAD']).stdout.trim();
    fs.writeFileSync(path.join(fixture, 'wego-app/scenes/测试场景/scene.js'), 'window.test = 2;\n');
    runGit(['add', 'wego-app/scenes/测试场景/scene.js']);
    runGit(['commit', '-m', 'change']);
    const head = runGit(['rev-parse', 'HEAD']).stdout.trim();
    const script = fs.realpathSync(path.resolve(repoRoot, process.argv[1]));
    const run = () => spawnSync(process.execPath, [script, '--check-changed', '--base', base, '--head', head, '--branch', 'feature/test'], { cwd: fixture, encoding: 'utf8' });
    const missing = run();
    if (missing.status === 0 || !(missing.stderr || '').includes('未认领场景')) throw new Error('场景变更缺少分支认领时必须失败');
    fs.writeFileSync(path.join(fixture, 'claims/test.json'), `${JSON.stringify({ agent: 'test', scene: '测试场景', branch: 'feature/other', status: 'released' }, null, 2)}\n`);
    const wrongBranch = run();
    if (wrongBranch.status === 0) throw new Error('其它分支的历史认领不得授权当前 PR');
    fs.writeFileSync(path.join(fixture, 'claims/test.json'), `${JSON.stringify({ agent: 'test', scene: '测试场景', branch: 'feature/test', status: 'released' }, null, 2)}\n`);
    const covered = run();
    if (covered.status !== 0) throw new Error(`当前分支的场景认领应通过：${covered.stderr || covered.stdout}`);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
  console.log('场景认领测试通过');
  process.exit(0);
}

if (!fs.existsSync(claimsDir)) {
  if (checkScene || checkChanged) {
    console.error(`[validate-claims] ${checkScene ? `场景 "${checkScene}" 未被认领` : '无法核对场景变更认领'}（claims 目录不存在）`);
    console.error('  开工前请在 claims/<agent-id>.json 认领该场景');
    process.exit(1);
  }
  console.log('[validate-claims] 无 claims 目录，跳过');
  process.exit(0);
}

const files = fs.readdirSync(claimsDir).filter((file) => file.endsWith('.json'));
const active = [];
const all = [];

for (const file of files) {
  let claim;
  try {
    claim = JSON.parse(fs.readFileSync(path.join(claimsDir, file), 'utf8'));
  } catch (error) {
    console.error(`[validate-claims] ${file} 无法解析：${error.message}`);
    process.exit(1);
  }
  all.push({ file, claim });
  if (claim.status === 'released' || claim.status === 'done') continue;
  active.push({ file, claim });
}

if (checkChanged) {
  if (!baseRef || !headRef || !branch) {
    console.error('[validate-claims] --check-changed 必须同时提供 --base、--head 和 --branch');
    process.exit(1);
  }
  const diff = spawnSync('git', ['-c', 'core.quotepath=false', 'diff', '--name-only', `${baseRef}...${headRef}`, '--'], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
  if (diff.status !== 0) {
    console.error(`[validate-claims] 无法读取场景变更：${(diff.stderr || diff.stdout || 'git diff 失败').trim()}`);
    process.exit(1);
  }
  const changedScenes = [...new Set((diff.stdout || '')
    .split('\n')
    .map(file => /^wego-app\/scenes\/([^/]+)\//.exec(file.trim())?.[1] ?? null)
    .filter(Boolean))]
    .sort();
  const uncovered = changedScenes.filter(scene => !all.some(({ claim }) => (
    claim.scene === scene
    && claim.branch === branch
    && ['active', 'released', 'done'].includes(claim.status)
  )));
  if (uncovered.length) {
    console.error(`[validate-claims] 分支 ${branch} 修改了未认领场景：${uncovered.join('、')}`);
    console.error('  认领记录必须声明相同 scene、branch，状态为 active/released/done');
    process.exit(1);
  }
}

const byScene = new Map();
const byRoute = new Map();
let conflict = false;

for (const { file, claim } of active) {
  if (claim.scene) {
    if (byScene.has(claim.scene)) {
      console.error(`[validate-claims] 冲突：场景 "${claim.scene}" 被 ${byScene.get(claim.scene)} 与 ${file} 同时认领`);
      conflict = true;
    } else {
      byScene.set(claim.scene, file);
    }
  }
  if (claim.routeId) {
    if (byRoute.has(claim.routeId)) {
      console.error(`[validate-claims] 冲突：routeId "${claim.routeId}" 被 ${byRoute.get(claim.routeId)} 与 ${file} 同时认领`);
      conflict = true;
    } else {
      byRoute.set(claim.routeId, file);
    }
  }
}

if (conflict) {
  console.error('[validate-claims] 存在认领冲突，请协调后再开工');
  process.exit(1);
}

// 校验指定场景是否已被指定 agent 认领
if (checkScene) {
  const owner = byScene.get(checkScene);
  if (!owner) {
    console.error(`[validate-claims] 场景 "${checkScene}" 未被任何活跃认领占用`);
    console.error('  开工前请在 claims/<agent-id>.json 认领该场景，status 设为 active');
    process.exit(1);
  }
  if (checkAgent) {
    const ownerClaim = active.find(({ claim }) => claim.scene === checkScene);
    if (ownerClaim && ownerClaim.claim.agent && ownerClaim.claim.agent !== checkAgent) {
      console.error(`[validate-claims] 场景 "${checkScene}" 已被 ${ownerClaim.file} (agent: ${ownerClaim.claim.agent}) 认领，不得修改`);
      process.exit(1);
    }
  }
}

console.log(`[validate-claims] 通过：${active.length} 个活跃认领，无冲突`);
