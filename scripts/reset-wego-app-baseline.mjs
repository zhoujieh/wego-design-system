#!/usr/bin/env node

/**
 * reset-wego-app-baseline.mjs
 *
 * 把 wego-app 恢复为空白基线：清空全部业务场景，仅保留架构文件与 .gitkeep。
 *
 * 注册方案说明（与 build-routes.mjs 对齐）：
 *   - routes.js 是生成物，由 build-routes.mjs 从各场景目录的 route.json 汇总生成
 *   - 清空场景的正确做法是删除场景目录，再由 build-routes.mjs 重新生成空白 routes.js
 *   - 本脚本不再直接写 routes.js，也不再用 route-source-parser 解析 routes.js 删项
 *
 * Usage:
 *   node scripts/reset-wego-app-baseline.mjs            # 实际重置（删场景目录 + 重新生成 routes.js）
 *   node scripts/reset-wego-app-baseline.mjs --check    # 仅校验是否已是空白基线，不写入
 *   node scripts/reset-wego-app-baseline.mjs --dry-run  # 打印将删除的场景，不写入
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const scenesRoot = path.join(repoRoot, 'wego-app/scenes');
const buildRoutesScript = path.join(__dirname, 'build-routes.mjs');

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const dryRun = args.has('--dry-run');

const GITKEEP = '.gitkeep';

function isGitKeepOnly(entries) {
  if (entries.length === 0) return true;
  if (entries.length > 1) return false;
  return entries[0] === GITKEEP;
}

function listSceneDirs() {
  if (!fs.existsSync(scenesRoot)) return [];
  return fs
    .readdirSync(scenesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function currentBaselineScene() {
  return listSceneDirs().filter((dir) => !isGitKeepOnly(fs.readdirSync(path.join(scenesRoot, dir))));
}

function runBuildRoutes(check = false) {
  execFileSync('node', [buildRoutesScript, ...(check ? ['--check'] : [])], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

function resetBaseline() {
  const scenes = currentBaselineScene();
  if (scenes.length === 0) {
    console.log('[reset-baseline] 已是空白基线，无需清理场景');
  } else {
    if (dryRun) {
      console.log('[reset-baseline] 将删除场景：' + scenes.join(', '));
    } else {
      for (const dir of scenes) {
        const abs = path.join(scenesRoot, dir);
        fs.rmSync(abs, { recursive: true, force: true });
        console.log(`[reset-baseline] 已删除场景目录 wego-app/scenes/${dir}`);
      }
    }
  }

  // 删除场景后由 build-routes.mjs 重新生成空白 routes.js（单一职责，避免手改生成物）
  if (dryRun) {
    console.log('[reset-baseline] 将运行 build-routes.mjs 重新生成空白 routes.js（dry-run 跳过）');
    return;
  }
  runBuildRoutes();
  console.log('[reset-baseline] 已重新生成 wego-app/js/routes.js（空白基线）');
}

function checkBaseline() {
  const scenes = currentBaselineScene();
  if (scenes.length > 0) {
    console.error(`[reset-baseline] 当前非空基线，存在场景：${scenes.join(', ')}`);
    process.exit(1);
  }
  // 校验 routes.js 与源（无 route.json 时应生成 []）一致
  try {
    runBuildRoutes(true);
  } catch {
    process.exit(1);
  }
  console.log('[reset-baseline] 已是空白基线，routes.js 与源一致');
}

if (checkOnly) {
  checkBaseline();
} else {
  resetBaseline();
}
