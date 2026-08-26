#!/usr/bin/env node

/**
 * validate-claims.mjs
 *
 * 校验 claims/ 目录下的场景认领，并强制场景目录修改前必须认领。
 *
 * 认领模型（AGENTS.md scene-must-claim-before-edit）：
 * - claims/<agent-id>.json 存在 = 持有「场景 × 分支」的独占租约；
 * - 释放 = 删除该文件，claims/ 目录只保留活跃认领，不堆积历史文件；
 * - 不判断是否并发，单人开发也必须认领；
 * - 同场景不同文件可声明 files 范围并行。
 *
 * 校验内容：
 * 1. 每条认领的结构合法性（字段、类型、agent=文件名、时间）；
 * 2. 语义合法性（场景目录存在、routeId 与 route.json 一致）；
 * 3. 认领之间无冲突：同场景多条仅在「双方均声明 files 且无交集」时允许并行；
 * 4. --check-changed：PR 改动的场景必须有相同 branch 的认领；
 * 5. --check-scene：指定场景是否已被指定 agent 认领；
 * 6. --check-stale：检测孤儿认领（分支已删 + 无开放 PR + 场景目录不存在）。
 *
 * Usage:
 *   node scripts/validate-claims.mjs
 *   node scripts/validate-claims.mjs --check-scene 我的 --agent <agent-id>
 *   node scripts/validate-claims.mjs --check-changed --base <sha> --head <sha> --branch <branch>
 *   node scripts/validate-claims.mjs --check-stale
 *   node scripts/validate-claims.mjs test
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readClaims, isOrphan, intersectFiles, claimsConflict } from './claims-lib.mjs';

const repoRoot = process.cwd();
const claimsDir = path.join(repoRoot, 'claims');
const args = process.argv.slice(2);

function argValue(name) {
  const i = args.indexOf(name);
  if (i >= 0) return args[i + 1] ?? null;
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : null;
}

const checkScene = argValue('--check-scene');
const checkAgent = argValue('--agent');
const checkChanged = args.includes('--check-changed');
const checkStale = args.includes('--check-stale');
const testing = args.includes('test');
const baseRef = argValue('--base');
const headRef = argValue('--head');
const branch = argValue('--branch');

/**
 * 结构校验：字段类型、agent=文件名、时间字段、files 数组。
 */
function validateClaimShape(claim, agentFromName) {
  const errors = [];
  if (typeof claim.agent !== 'string' || !claim.agent) {
    errors.push('agent 必须为非空字符串');
  } else if (claim.agent !== agentFromName) {
    errors.push(`agent "${claim.agent}" 必须等于文件名 "${agentFromName}"`);
  }
  if (typeof claim.scene !== 'string' || !claim.scene) errors.push('scene 必须为非空字符串');
  if (typeof claim.routeId !== 'string' || !claim.routeId) errors.push('routeId 必须为非空字符串');
  if (typeof claim.branch !== 'string' || !claim.branch) errors.push('branch 必须为非空字符串');
  if (typeof claim.claimedAt !== 'string' || Number.isNaN(Date.parse(claim.claimedAt))) {
    errors.push('claimedAt 必须为合法 ISO8601 时间');
  }
  if (claim.files !== undefined) {
    const bad = !Array.isArray(claim.files) || claim.files.length === 0
      || claim.files.some((f) => typeof f !== 'string' || !f);
    if (bad) errors.push('files 必须为非空字符串数组');
  }
  return errors;
}

/**
 * 语义校验：场景目录存在 + routeId 与 route.json 一致。
 */
function validateActiveSemantics(claim) {
  const errors = [];
  const sceneDir = path.join(repoRoot, 'wego-app', 'scenes', claim.scene);
  if (!fs.existsSync(sceneDir)) {
    errors.push(`场景目录 wego-app/scenes/${claim.scene} 不存在`);
    return errors;
  }
  const routeFile = path.join(sceneDir, 'route.json');
  if (fs.existsSync(routeFile)) {
    let route;
    try {
      route = JSON.parse(fs.readFileSync(routeFile, 'utf8'));
    } catch (error) {
      errors.push(`route.json 无法解析：${error.message}`);
      return errors;
    }
    if (route.routeId !== claim.routeId) {
      errors.push(`routeId "${claim.routeId}" 与 wego-app/scenes/${claim.scene}/route.json（routeId: ${route.routeId}）不一致`);
    }
  }
  return errors;
}

// ---- test 模式 ----

if (testing) {
  runTests();
  process.exit(0);
}

function runTests() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-claims-'));
  const runGit = (gitArgs) => spawnSync('git', gitArgs, { cwd: fixture, encoding: 'utf8' });
  const script = fs.realpathSync(path.resolve(repoRoot, process.argv[1]));
  const run = (cliArgs) => spawnSync(process.execPath, [script, ...cliArgs], { cwd: fixture, encoding: 'utf8' });
  const writeClaim = (name, claim) => fs.writeFileSync(path.join(fixture, 'claims', name), `${JSON.stringify(claim, null, 2)}\n`);
  const T0 = '2026-08-25T00:00:00.000Z';
  const SCENE = '测试场景';
  const ROUTE = 'test-route';
  try {
    fs.mkdirSync(path.join(fixture, 'claims'), { recursive: true });
    fs.mkdirSync(path.join(fixture, 'wego-app/scenes', SCENE), { recursive: true });
    fs.writeFileSync(path.join(fixture, 'wego-app/scenes', SCENE, 'scene.js'), 'window.test = 1;\n');
    fs.writeFileSync(path.join(fixture, 'wego-app/scenes', SCENE, 'route.json'), JSON.stringify({ routeId: ROUTE }));
    runGit(['init']);
    runGit(['config', 'user.name', 'Workflow Test']);
    runGit(['config', 'user.email', 'workflow-test@example.com']);
    runGit(['add', '.']);
    runGit(['commit', '-m', 'base']);
    const base = runGit(['rev-parse', 'HEAD']).stdout.trim();
    fs.writeFileSync(path.join(fixture, 'wego-app/scenes', SCENE, 'scene.js'), 'window.test = 2;\n');
    runGit(['add', 'wego-app/scenes/测试场景/scene.js']);
    runGit(['commit', '-m', 'change']);
    const head = runGit(['rev-parse', 'HEAD']).stdout.trim();

    // 1. 场景变更缺少认领 → 失败
    const missing = run(['--check-changed', '--base', base, '--head', head, '--branch', 'feature/test']);
    if (missing.status === 0 || !(missing.stderr || '').includes('未认领')) {
      throw new Error('用例失败：场景变更缺少认领时必须失败');
    }

    // 2. 其它分支的认领不得授权当前 PR
    writeClaim('a.json', { agent: 'a', scene: SCENE, routeId: ROUTE, branch: 'feature/other', claimedAt: T0 });
    const wrongBranch = run(['--check-changed', '--base', base, '--head', head, '--branch', 'feature/test']);
    if (wrongBranch.status === 0) throw new Error('用例失败：其它分支的认领不得授权当前 PR');

    // 3. 当前分支认领应通过
    writeClaim('a.json', { agent: 'a', scene: SCENE, routeId: ROUTE, branch: 'feature/test', claimedAt: T0 });
    const covered = run(['--check-changed', '--base', base, '--head', head, '--branch', 'feature/test']);
    if (covered.status !== 0) throw new Error(`用例失败：当前分支认领应通过：${covered.stderr || covered.stdout}`);

    // 4. agent ≠ 文件名 → 失败
    writeClaim('a.json', { agent: 'not-a', scene: SCENE, routeId: ROUTE, branch: 'feature/test', claimedAt: T0 });
    if (run([]).status === 0) throw new Error('用例失败：agent 必须等于文件名');

    // 5. 缺 branch → 失败
    writeClaim('a.json', { agent: 'a', scene: SCENE, routeId: ROUTE, claimedAt: T0 });
    if (run([]).status === 0) throw new Error('用例失败：认领必须声明 branch');

    // 6. 同场景不同 files → 允许并行
    writeClaim('a.json', { agent: 'a', scene: SCENE, routeId: ROUTE, branch: 'feature/a', claimedAt: T0, files: ['scene.js'] });
    writeClaim('b.json', { agent: 'b', scene: SCENE, routeId: ROUTE, branch: 'feature/b', claimedAt: T0, files: ['style.css'] });
    if (run([]).status !== 0) throw new Error('用例失败：同场景不同 files 应允许并行');

    // 7. 同场景 files 重叠 → 冲突
    writeClaim('b.json', { agent: 'b', scene: SCENE, routeId: ROUTE, branch: 'feature/b', claimedAt: T0, files: ['scene.js'] });
    if (run([]).status === 0) throw new Error('用例失败：files 重叠应冲突');

    // 8. 一方未声明 files → 冲突（默认整场景独占）
    writeClaim('b.json', { agent: 'b', scene: SCENE, routeId: ROUTE, branch: 'feature/b', claimedAt: T0 });
    if (run([]).status === 0) throw new Error('用例失败：一方未声明 files 应冲突');

    // 清理前序测试的 b.json，避免冲突干扰后续 --check-changed 测试
    fs.rmSync(path.join(fixture, 'claims', 'b.json'), { force: true });

    // 构造只修改 scene.css 的提交对（baseCss=head, headCss=新增 scene.css）
    fs.writeFileSync(path.join(fixture, 'wego-app/scenes', SCENE, 'scene.css'), 'body {}\n');
    runGit(['add', 'wego-app/scenes/测试场景/scene.css']);
    runGit(['commit', '-m', 'add css']);
    const headCss = runGit(['rev-parse', 'HEAD']).stdout.trim();
    const baseCss = head; // 第二次提交，diff 到 headCss 只有 scene.css 新增

    // 9. --check-changed: files 范围覆盖改动 → 通过
    writeClaim('a.json', { agent: 'a', scene: SCENE, routeId: ROUTE, branch: 'feature/test', claimedAt: T0, files: ['scene.css'] });
    const scopedCovered = run(['--check-changed', '--base', baseCss, '--head', headCss, '--branch', 'feature/test']);
    if (scopedCovered.status !== 0) throw new Error(`用例失败：files 范围覆盖改动应通过：${scopedCovered.stderr || scopedCovered.stdout}`);

    // 10. --check-changed: files 范围未覆盖改动 → 失败
    writeClaim('a.json', { agent: 'a', scene: SCENE, routeId: ROUTE, branch: 'feature/test', claimedAt: T0, files: ['scene.js'] });
    const scopedUncovered = run(['--check-changed', '--base', baseCss, '--head', headCss, '--branch', 'feature/test']);
    if (scopedUncovered.status === 0 || !(scopedUncovered.stderr || '').includes('超出认领 files 范围')) {
      throw new Error('用例失败：files 范围未覆盖改动应失败');
    }

    // 11. --check-changed: 整场景独占（未声明 files）→ 任意改动都通过
    writeClaim('a.json', { agent: 'a', scene: SCENE, routeId: ROUTE, branch: 'feature/test', claimedAt: T0 });
    const fullCovered = run(['--check-changed', '--base', baseCss, '--head', headCss, '--branch', 'feature/test']);
    if (fullCovered.status !== 0) throw new Error(`用例失败：整场景独占应通过：${fullCovered.stderr || fullCovered.stdout}`);

    console.log('场景认领测试通过');
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

// ---- 主流程 ----

if (!fs.existsSync(claimsDir)) {
  if (checkScene || checkChanged) {
    console.error(`[validate-claims] ${checkScene ? `场景 "${checkScene}" 未被认领` : '无法核对场景变更认领'}（claims 目录不存在）`);
    console.error('  开工前请用 npm run claim -- --agent <agent-id> --scene <场景> 认领该场景');
    process.exit(1);
  }
  console.log('[validate-claims] 无 claims 目录，跳过');
  process.exit(0);
}

let entries;
try {
  entries = readClaims(claimsDir);
} catch (error) {
  console.error(`[validate-claims] ${error.message}`);
  process.exit(1);
}

const active = [];

for (const { file, claim } of entries) {
  const agentFromName = file.replace(/\.json$/, '');
  const shapeErrors = validateClaimShape(claim, agentFromName);
  if (shapeErrors.length) {
    for (const error of shapeErrors) console.error(`[validate-claims] ${file}: ${error}`);
    process.exit(1);
  }
  const semErrors = validateActiveSemantics(claim);
  if (semErrors.length) {
    for (const error of semErrors) console.error(`[validate-claims] ${file}: ${error}`);
    process.exit(1);
  }
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
  // 按场景分组改动文件：{ scene: [相对场景目录的文件路径] }
  const changedByScene = {};
  (diff.stdout || '').split('\n').forEach((file) => {
    const trimmed = file.trim();
    const m = /^wego-app\/scenes\/([^/]+)\/(.+)$/.exec(trimmed);
    if (!m) return;
    const scene = m[1];
    const relPath = m[2];
    if (!changedByScene[scene]) changedByScene[scene] = [];
    changedByScene[scene].push(relPath);
  });
  const changedScenes = Object.keys(changedByScene).sort();

  for (const scene of changedScenes) {
    const matchingClaims = active.filter(({ claim }) => (
      claim.scene === scene && claim.branch === branch
    ));
    if (matchingClaims.length === 0) {
      console.error(`[validate-claims] 分支 ${branch} 修改了未认领场景：${scene}`);
      console.error('  认领记录必须声明相同 scene、branch');
      process.exit(1);
    }
    // files 范围校验：所有匹配认领都声明了 files 时，改动文件必须被至少一个认领覆盖；
    // 只要有一个认领未声明 files（整场景独占），该场景全部改动即被授权。
    const allScoped = matchingClaims.every(({ claim }) => Array.isArray(claim.files) && claim.files.length > 0);
    if (allScoped) {
      const uncoveredFiles = changedByScene[scene].filter((file) => (
        !matchingClaims.some(({ claim }) => claim.files.includes(file))
      ));
      if (uncoveredFiles.length > 0) {
        const owners = matchingClaims.map(({ file: f, claim }) => `${f}(files: ${claim.files.join(',')})`).join('、');
        console.error(`[validate-claims] 场景 "${scene}" 的改动超出认领 files 范围：${uncoveredFiles.join('、')}`);
        console.error(`  当前认领：${owners}`);
        console.error('  请扩大认领 files 范围，或使用整场景独占（不声明 files）');
        process.exit(1);
      }
    }
  }
}

// 冲突检测：按 scene 分组，files 分级
const sceneGroups = new Map();
for (const { file, claim } of active) {
  if (!claim.scene) continue;
  if (!sceneGroups.has(claim.scene)) sceneGroups.set(claim.scene, []);
  sceneGroups.get(claim.scene).push({ file, claim });
}

let conflict = false;

for (const [scene, group] of sceneGroups) {
  if (group.length <= 1) continue;
  const hasConflict = group.some((a, i) =>
    group.slice(i + 1).some((b) => claimsConflict(a.claim, b.claim))
  );
  if (!hasConflict) {
    console.warn(`[validate-claims] 并行认领：场景 "${scene}" 被 ${group.map((e) => e.file).join('、')} 同时认领（files 无交集）`);
    continue;
  }
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i];
      const b = group[j];
      if (!claimsConflict(a.claim, b.claim)) continue;
      const overlap = intersectFiles(a.claim.files, b.claim.files);
      const reason = overlap.length
        ? `文件重叠：${overlap.join('、')}`
        : '未声明 files 范围，默认整场景独占';
      console.error(`[validate-claims] 冲突：场景 "${scene}" 被 ${a.file} 与 ${b.file} 同时认领（${reason}）`);
      conflict = true;
    }
  }
}

// routeId 兜底：不同场景声明了相同 routeId（路由重复）
const byRoute = new Map();
for (const { file, claim } of active) {
  if (!claim.routeId) continue;
  const prev = byRoute.get(claim.routeId);
  if (prev && prev.claim.scene !== claim.scene) {
    console.error(`[validate-claims] 冲突：routeId "${claim.routeId}" 被不同场景 "${prev.claim.scene}"(${prev.file}) 与 "${claim.scene}"(${file}) 同时声明`);
    conflict = true;
  } else if (!prev) {
    byRoute.set(claim.routeId, { file, claim });
  }
}

if (conflict) {
  console.error('[validate-claims] 存在认领冲突，请协调后再开工');
  process.exit(1);
}

// stale 检测（默认关闭，本地辅助）
if (checkStale) {
  const orphans = active.filter(({ claim }) => isOrphan(claim, repoRoot));
  if (orphans.length) {
    console.error(`[validate-claims] 发现 ${orphans.length} 个孤儿认领（分支已删 + 无开放 PR）：`);
    for (const { file, claim } of orphans) {
      console.error(`  - ${file}（scene: ${claim.scene}, branch: ${claim.branch}）`);
    }
    console.error('  请用 npm run release-claim -- --sweep 释放');
    process.exit(1);
  }
  console.log('[validate-claims] 无孤儿认领');
}

// 校验指定场景是否已被指定 agent 认领
if (checkScene) {
  const group = sceneGroups.get(checkScene) || [];
  if (!group.length) {
    console.error(`[validate-claims] 场景 "${checkScene}" 未被任何认领占用`);
    console.error('  开工前请用 npm run claim -- --agent <agent-id> --scene <场景> 认领该场景');
    process.exit(1);
  }
  if (checkAgent) {
    const owned = group.some(({ claim }) => claim.agent === checkAgent);
    if (!owned) {
      const owners = group.map((e) => `${e.file}(agent: ${e.claim.agent})`).join('、');
      console.error(`[validate-claims] 场景 "${checkScene}" 已被 ${owners} 认领，不得修改`);
      process.exit(1);
    }
  }
}

console.log(`[validate-claims] 通过：${active.length} 个活跃认领，无冲突`);
