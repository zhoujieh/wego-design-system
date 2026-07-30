#!/usr/bin/env node

/**
 * validate-claims.mjs
 *
 * 校验 claims/ 目录下的场景认领是否有冲突。
 *
 * 多 Agent 并发时，每个 Agent 开工前在 claims/<agent-id>.json 认领一个场景；
 * 本脚本确保没有两个活跃认领指向同一个 scene 或 routeId。
 *
 * Usage:
 *   node scripts/validate-claims.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const claimsDir = path.join(repoRoot, 'claims');

if (!fs.existsSync(claimsDir)) {
  console.log('[validate-claims] 无 claims 目录，跳过');
  process.exit(0);
}

const files = fs.readdirSync(claimsDir).filter((file) => file.endsWith('.json'));
const active = [];

for (const file of files) {
  const claim = JSON.parse(fs.readFileSync(path.join(claimsDir, file), 'utf8'));
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

console.log(`[validate-claims] 通过：${active.length} 个活跃认领，无冲突`);
