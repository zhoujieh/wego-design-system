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
 */

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const claimsDir = path.join(repoRoot, 'claims');
const scenesDir = path.join(repoRoot, 'wego-app', 'scenes');

const args = process.argv.slice(2);
function argValue(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}
const checkScene = argValue('--check-scene');
const checkAgent = argValue('--agent');

if (!fs.existsSync(claimsDir)) {
  if (checkScene) {
    console.error(`[validate-claims] 场景 "${checkScene}" 未被认领（claims 目录不存在）`);
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
  const claim = JSON.parse(fs.readFileSync(path.join(claimsDir, file), 'utf8'));
  all.push({ file, claim });
  if (claim.status === 'released' || claim.status === 'done') continue;
  active.push({ file, claim });
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
