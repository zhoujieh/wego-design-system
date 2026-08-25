#!/usr/bin/env node

/**
 * release-claim.mjs
 *
 * 释放场景认领：删除 claims/<agent>.json。文件存在 = 持有租约，删除 = 释放。
 * 跟随交付单元收口（PR 合并/关闭后）执行，claims/ 目录只保留活跃认领，不堆积历史文件。
 *
 * Usage:
 *   node scripts/release-claim.mjs --agent <id> [--json]
 *   node scripts/release-claim.mjs --scene <场景> [--json]
 *   node scripts/release-claim.mjs --sweep [--dry-run] [--json]
 *
 * 退出码：0 成功 / 1 未找到 / 3 参数错误
 */

import fs from 'node:fs';
import path from 'node:path';
import { readClaims, isOrphan } from './claims-lib.mjs';

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
const sweep = args.includes('--sweep');
const dryRun = args.includes('--dry-run');
const json = args.includes('--json');

function fail(code, message) {
  if (json) console.log(JSON.stringify({ ok: false, error: message }, null, 2));
  else console.error(`[release-claim] ${message}`);
  process.exit(code);
}

function removeClaim(filePath, file) {
  fs.rmSync(filePath, { force: true });
  if (!json) console.log(`[release-claim] 已释放 ${file}（删除认领文件）`);
}

if (!sweep && !agent && !scene) fail(3, '必须提供 --agent 或 --scene，或使用 --sweep');
if (!sweep && agent && scene) fail(3, '--agent 与 --scene 只能二选一');

let entries;
try {
  entries = readClaims(claimsDir);
} catch (error) {
  fail(1, error.message);
}

// ---- 孤儿扫描 ----
if (sweep) {
  const orphans = entries.filter(({ claim }) => isOrphan(claim, repoRoot));
  if (dryRun) {
    if (json) {
      console.log(JSON.stringify({ ok: true, dryRun: true, count: orphans.length, files: orphans.map((o) => o.file) }, null, 2));
    } else if (orphans.length) {
      console.log('[release-claim] 以下孤儿认领将被释放（dry-run）：');
      for (const { file, claim } of orphans) console.log(`  - ${file}（scene=${claim.scene}, branch=${claim.branch}）`);
    } else {
      console.log('[release-claim] 无孤儿认领');
    }
    process.exit(0);
  }
  for (const { filePath, file } of orphans) removeClaim(filePath, file);
  const msg = `已释放 ${orphans.length} 个孤儿认领`;
  if (json) console.log(JSON.stringify({ ok: true, count: orphans.length, files: orphans.map((o) => o.file) }, null, 2));
  else console.log(`[release-claim] ${msg}`);
  process.exit(0);
}

// ---- 定向释放 ----
const targets = entries.filter(({ claim }) => (
  (agent && claim.agent === agent) || (scene && claim.scene === scene)
));

if (!targets.length) {
  fail(1, `未找到认领记录（agent=${agent || '-'} scene=${scene || '-'}），可能已释放`);
}

for (const { filePath, file } of targets) removeClaim(filePath, file);
const msg = `已释放 ${targets.length} 个认领`;
if (json) console.log(JSON.stringify({ ok: true, count: targets.length, files: targets.map((t) => t.file) }, null, 2));
else console.log(`[release-claim] 完成：${msg}`);
