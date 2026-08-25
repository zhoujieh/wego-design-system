#!/usr/bin/env node

/**
 * claim-scene.mjs
 *
 * 认领场景：声明 agent/scene/branch/files 并写入 claims/<agent>.json，消除手写 JSON。
 * 校验场景目录、routeId 与 route.json 一致、同场景冲突（files 范围分级）。
 *
 * Usage:
 *   node scripts/claim-scene.mjs --agent <id> --scene <场景> [--route-id <id>] [--branch <分支>] [--files <a,b,c>] [--force] [--json]
 *
 * 退出码：0 成功 / 1 校验失败 / 2 冲突 / 3 参数错误
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readClaims, claimsConflict } from './claims-lib.mjs';

const repoRoot = process.cwd();
const claimsDir = path.join(repoRoot, 'claims');
const args = process.argv.slice(2);

function argValue(name) {
  const i = args.indexOf(name);
  if (i >= 0) return args[i + 1] ?? null;
  const inline = args.find((a) => a.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : null;
}

const agent = argValue('--agent');
const scene = argValue('--scene');
const routeIdArg = argValue('--route-id');
const branchArg = argValue('--branch');
const filesArg = argValue('--files');
const force = args.includes('--force');
const json = args.includes('--json');

function fail(code, message) {
  if (json) console.log(JSON.stringify({ ok: false, error: message }, null, 2));
  else console.error(`[claim-scene] ${message}`);
  process.exit(code);
}

function ok(result) {
  if (json) console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  else console.log(`[claim-scene] 已认领：agent=${agent} scene=${scene} branch=${result.claim.branch}${result.claim.files ? ` files=${result.claim.files.join(',')}` : ''}`);
}

// ---- 参数校验 ----
if (!agent) fail(3, '缺少 --agent');
if (!scene) fail(3, '缺少 --scene');
if (agent !== path.basename(agent)) fail(3, '--agent 不得包含路径分隔符');

// ---- 场景目录 ----
const sceneDir = path.join(repoRoot, 'wego-app', 'scenes', scene);
if (!fs.existsSync(sceneDir)) fail(1, `场景目录 wego-app/scenes/${scene} 不存在`);

// ---- routeId ----
const routeFile = path.join(sceneDir, 'route.json');
let route = null;
if (fs.existsSync(routeFile)) {
  try {
    route = JSON.parse(fs.readFileSync(routeFile, 'utf8'));
  } catch (error) {
    fail(1, `route.json 无法解析：${error.message}`);
  }
}
let routeId = routeIdArg;
if (!routeId) {
  if (!route) fail(1, `未提供 --route-id 且 wego-app/scenes/${scene}/route.json 不存在`);
  routeId = route.routeId;
} else if (route && route.routeId !== routeId) {
  fail(1, `routeId "${routeId}" 与 route.json（routeId: ${route.routeId}）不一致`);
}

// ---- branch ----
let branch = branchArg;
if (!branch) {
  const r = spawnSync('git', ['branch', '--show-current'], { cwd: repoRoot, encoding: 'utf8' });
  if (r.status !== 0 || !(r.stdout || '').trim()) fail(1, '未提供 --branch 且无法获取当前 git 分支');
  branch = (r.stdout || '').trim();
}

// ---- files ----
const files = filesArg
  ? filesArg.split(',').map((f) => f.trim()).filter(Boolean)
  : undefined;
if (files !== undefined && files.length === 0) fail(3, '--files 必须为非空逗号分隔列表');

// ---- 冲突检查 ----
const file = `${agent}.json`;
const filePath = path.join(claimsDir, file);
let entries;
try {
  entries = readClaims(claimsDir);
} catch (error) {
  fail(1, error.message);
}

const incoming = { agent, scene, routeId, branch, files };

for (const { file: existingFile, claim: existing } of entries) {
  if (existingFile === file) {
    if (force) continue; // 允许覆盖自己的同名认领
    fail(2, `已有认领 ${file}（scene=${existing.scene}），如需覆盖用 --force`);
  }
  if (existing.scene === scene && claimsConflict(existing, incoming)) {
    const overlap = (Array.isArray(existing.files) && files)
      ? files.filter((f) => existing.files.includes(f))
      : [];
    const reason = overlap.length
      ? `文件重叠：${overlap.join('、')}`
      : '未声明 files 范围，默认整场景独占';
    fail(2, `场景 "${scene}" 已被 ${existingFile}（agent=${existing.agent}）认领，${reason}`);
  }
  if (existing.routeId && existing.routeId === routeId && existing.scene !== scene) {
    fail(2, `routeId "${routeId}" 已被场景 "${existing.scene}"（${existingFile}）占用`);
  }
}

// ---- 写入认领 ----
const claim = {
  agent,
  scene,
  routeId,
  branch,
  claimedAt: new Date().toISOString(),
};
if (files) claim.files = files;

fs.mkdirSync(claimsDir, { recursive: true });
fs.writeFileSync(filePath, `${JSON.stringify(claim, null, 2)}\n`, 'utf8');

ok({ file, claim });
