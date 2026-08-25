#!/usr/bin/env node

/**
 * claims-lib.mjs
 *
 * 场景认领机制共享工具库。被 validate-claims.mjs、claim-scene.mjs、
 * release-claim.mjs 共同引用，避免三处重复实现。
 *
 * 认领本质 = 「场景 × 分支」的独占租约。模型约定：
 * - claims/<agent>.json 存在 = 持有租约（active）；
 * - 释放 = 删除该文件。claims/ 目录只保留活跃认领，绝不堆积历史文件。
 *
 * 这里提供：
 * - 认领文件读取；
 * - 孤儿判定（交付单元是否存活：branch 存在 + 开放 PR + 场景目录存在）；
 * - 冲突判定（files 范围分级）。
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * 读取 claims 目录下所有 .json 认领文件（排除 schema.json）。
 * @returns {{ file: string, filePath: string, claim: object }[]}
 */
export function readClaims(claimsDir) {
  if (!fs.existsSync(claimsDir)) return [];
  return fs.readdirSync(claimsDir)
    .filter((file) => file.endsWith('.json') && file !== 'schema.json')
    .map((file) => {
      const filePath = path.join(claimsDir, file);
      let claim;
      try {
        claim = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (error) {
        throw new Error(`${file} 无法解析：${error.message}`);
      }
      return { file, filePath, claim };
    });
}

/**
 * 分支是否真实存在（本地或远端）。
 */
export function branchExists(branch, repoRoot) {
  if (!branch) return false;
  const local = spawnSync('git', ['branch', '--list', branch], { cwd: repoRoot, encoding: 'utf8' });
  if (local.status === 0 && (local.stdout || '').trim()) return true;
  const remote = spawnSync('git', ['branch', '-r', '--list', `*/${branch}`], { cwd: repoRoot, encoding: 'utf8' });
  if (remote.status === 0 && (remote.stdout || '').trim()) return true;
  return false;
}

/**
 * 该分支是否存在开放 PR。
 * @returns {boolean|null} true=有 PR，false=确认无 PR，null=gh 不可用（证据缺失）。
 */
export function hasOpenPR(branch, repoRoot) {
  if (!branch) return false;
  const pr = spawnSync(
    'gh',
    ['pr', 'list', '--state', 'open', '--head', branch, '--json', 'number', '--limit', '1'],
    { cwd: repoRoot, encoding: 'utf8' }
  );
  if (pr.status !== 0) return null; // gh 不可用/未认证，视为证据缺失
  try {
    const list = JSON.parse(pr.stdout || '[]');
    return Array.isArray(list) && list.length > 0;
  } catch {
    return null;
  }
}

/**
 * 孤儿判定：三条「交付单元存活」证据（分支存在、开放 PR、场景目录存在）全部
 * 确认不成立时才判孤儿。PR 证据缺失（gh 不可用）时保守不判孤儿，避免误释放。
 */
export function isOrphan(claim, repoRoot) {
  const branchAlive = branchExists(claim.branch, repoRoot);
  const hasPR = hasOpenPR(claim.branch, repoRoot);
  const sceneAlive = fs.existsSync(path.join(repoRoot, 'wego-app', 'scenes', claim.scene || ''));
  return !branchAlive && hasPR === false && !sceneAlive;
}

/**
 * 两个文件清单的交集（元素级）。
 */
export function intersectFiles(a, b) {
  const setA = new Set(Array.isArray(a) ? a : []);
  const setB = new Set(Array.isArray(b) ? b : []);
  return [...setA].filter((f) => setB.has(f));
}

/**
 * 判断两条认领（同 scene）是否冲突。
 * 规则：双方都声明 files 且无交集 → 不冲突；任一方未声明 files（默认整场景独占）或 files 有交集 → 冲突。
 */
export function claimsConflict(a, b) {
  const aScoped = Array.isArray(a.files) && a.files.length > 0;
  const bScoped = Array.isArray(b.files) && b.files.length > 0;
  if (aScoped && bScoped) {
    return intersectFiles(a.files, b.files).length > 0;
  }
  return true;
}
