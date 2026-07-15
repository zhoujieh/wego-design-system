#!/usr/bin/env node

/**
 * sync-wego-app-lib.mjs
 *
 * 将设计系统原始资源从 .codex/skills/wego-design/ 同步到 wego-app/lib/ 部署副本。
 *
 * 设计原则：
 *   - wego-app/lib/ 是部署副本，不是源文件；任何修改只能改原始文件后跑本脚本同步
 *   - 已映射资源采用“清空再复制”，允许清单外资源会被识别并清理
 *   - 同步范围由下方 SYNC_MAP 唯一声明，完整性由同步测试与主守门检查
 *
 * Usage:
 *   node scripts/sync-wego-app-lib.mjs
 *   node scripts/sync-wego-app-lib.mjs --check      # 仅校验是否一致，不写入
 *   node scripts/sync-wego-app-lib.mjs --json        # 输出 JSON
 */

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const libraryRoot = path.join(repoRoot, '.codex/skills/wego-design');
const libRoot = path.join(repoRoot, 'wego-app/lib');

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const jsonOutput = args.has('--json');

// 仓库级禁用资源：无论出现在源或部署副本的哪一层，都不参与复制与一致性比较。
const IGNORED_ENTRY_NAMES = new Set(['.DS_Store', '.uploads']);

// 同步映射：源（相对 libraryRoot）→ 目标（相对 libRoot）
const SYNC_MAP = [
  { src: 'colors_and_type.css', dest: 'colors_and_type.css', type: 'file' },
  { src: 'components.css', dest: 'components.css', type: 'file' },
  { src: 'iconfont.css', dest: 'iconfont.css', type: 'file' },
  { src: 'assets/fonts', dest: 'assets/fonts', type: 'dir' },
  { src: 'assets/icons', dest: 'assets/icons', type: 'dir' },
  { src: 'assets/image', dest: 'assets/image', type: 'dir' },
];

const ALLOWED_LIB_ROOT_ENTRIES = new Set([
  'colors_and_type.css',
  'components.css',
  'iconfont.css',
  'assets',
]);
const ALLOWED_ASSETS_ROOT_ENTRIES = new Set(['fonts', 'icons', 'image']);

const report = {
  synced: [],
  missing: [],
  removed: [],
  errors: [],
};

function ensureDirectory(target, label) {
  if (!fs.existsSync(target)) {
    if (checkOnly) {
      report.errors.push(`部署目录不存在：${label}`);
      return false;
    }
    fs.mkdirSync(target, { recursive: true });
    return true;
  }
  if (fs.statSync(target).isDirectory()) return true;
  if (checkOnly) {
    report.errors.push(`部署路径必须是目录：${label}`);
    return false;
  }
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  report.removed.push({ dest: path.relative(libRoot, target).split(path.sep).join('/') || '.', action: 'replaced-wrong-type', type: 'file' });
  return true;
}

function clearTarget(destAbs, type) {
  if (!fs.existsSync(destAbs)) return;
  if (type === 'dir') {
    fs.rmSync(destAbs, { recursive: true, force: true });
  } else {
    fs.rmSync(destAbs, { recursive: true, force: true });
  }
}

function isIgnoredEntry(filePath) {
  return IGNORED_ENTRY_NAMES.has(path.basename(filePath));
}

function copyItem(srcAbs, destAbs, type) {
  if (type === 'dir') {
    // 保留时间戳便于部署副本追溯；一致性判断仍以完整字节内容为准。
    fs.cpSync(srcAbs, destAbs, {
      recursive: true,
      preserveTimestamps: true,
      filter: (sourcePath) => !isIgnoredEntry(sourcePath),
    });
  } else {
    fs.copyFileSync(srcAbs, destAbs);
    const st = fs.statSync(srcAbs);
    fs.utimesSync(destAbs, st.atime, st.mtime);
  }
}

function filesEqual(a, b) {
  try {
    const sa = fs.statSync(a);
    const sb = fs.statSync(b);
    if (sa.size !== sb.size) return false;
    return fs.readFileSync(a, 'utf8') === fs.readFileSync(b, 'utf8');
  } catch {
    return false;
  }
}

function dirsEqual(a, b) {
  // 比较两目录所有相对文件路径与完整字节内容；部署副本不得以采样比较掩盖尾部漂移。
  try {
    const collect = (root) => {
      const out = new Map();
      const walk = (dir, base = '') => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          if (IGNORED_ENTRY_NAMES.has(entry.name)) continue;
          const rel = base ? `${base}/${entry.name}` : entry.name;
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walk(full, rel);
          } else {
            const st = fs.statSync(full);
            out.set(rel, st.size);
          }
        }
      };
      walk(root);
      return out;
    };
    const ma = collect(a);
    const mb = collect(b);
    if (ma.size !== mb.size) return false;
    for (const [k, size] of ma) {
      if (mb.get(k) !== size) return false;
      if (!fs.readFileSync(path.join(a, k)).equals(fs.readFileSync(path.join(b, k)))) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function collectStaleEntries() {
  const stale = [];
  const collect = (root, allowedNames) => {
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (IGNORED_ENTRY_NAMES.has(entry.name) || allowedNames.has(entry.name)) continue;
      const absolutePath = path.join(root, entry.name);
      stale.push({
        absolutePath,
        dest: path.relative(libRoot, absolutePath).split(path.sep).join('/'),
        type: entry.isDirectory() ? 'dir' : 'file',
      });
    }
  };

  collect(libRoot, ALLOWED_LIB_ROOT_ENTRIES);
  collect(path.join(libRoot, 'assets'), ALLOWED_ASSETS_ROOT_ENTRIES);
  return stale;
}

function removeOrReportStaleEntries() {
  for (const item of collectStaleEntries()) {
    if (!checkOnly) {
      fs.rmSync(item.absolutePath, { recursive: true, force: true });
    }
    report.removed.push({
      dest: item.dest,
      action: checkOnly ? 'stale-in-dest' : 'removed',
      type: item.type,
    });
  }
}

function run() {
  if (!fs.existsSync(libraryRoot)) {
    report.errors.push(`设计系统源目录不存在：${path.relative(repoRoot, libraryRoot)}`);
    return finish(1);
  }

  if (!ensureDirectory(libRoot, 'wego-app/lib')) return finish(1);
  if (!ensureDirectory(path.join(libRoot, 'assets'), 'wego-app/lib/assets')) return finish(1);
  removeOrReportStaleEntries();

  for (const item of SYNC_MAP) {
    const srcAbs = path.join(libraryRoot, item.src);
    const destAbs = path.join(libRoot, item.dest);

    if (!fs.existsSync(srcAbs)) {
      report.missing.push({ src: item.src, type: item.type });
      continue;
    }
    const sourceMatchesType = item.type === 'dir' ? fs.statSync(srcAbs).isDirectory() : fs.statSync(srcAbs).isFile();
    if (!sourceMatchesType) {
      report.errors.push(`源类型错误：${item.src} 应为 ${item.type}`);
      continue;
    }

    if (checkOnly) {
      if (!fs.existsSync(destAbs)) {
        report.synced.push({ dest: item.dest, action: 'missing-in-dest', type: item.type });
      } else {
        const equal = item.type === 'dir' ? dirsEqual(srcAbs, destAbs) : filesEqual(srcAbs, destAbs);
        if (!equal) {
          report.synced.push({ dest: item.dest, action: 'out-of-sync', type: item.type });
        }
      }
      continue;
    }

    // 实际同步：清空目标 → 复制
    clearTarget(destAbs, item.type);
    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    copyItem(srcAbs, destAbs, item.type);
    report.synced.push({ dest: item.dest, action: 'synced', type: item.type });
  }

  const failed = report.missing.length > 0
    || report.errors.length > 0
    || (checkOnly && (report.synced.length > 0 || report.removed.length > 0));
  return finish(failed ? 1 : 0);
}

function finish(code) {
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    if (checkOnly) {
      const outOfSync = report.synced.length > 0 || report.removed.length > 0;
      console.log(`\n${outOfSync ? 'wego-app/lib 副本与源不一致' : 'wego-app/lib 副本与源一致'}`);
      if (report.synced.length > 0) {
        console.log('\n需同步项：');
        for (const item of report.synced) {
          console.log(`- [${item.action}] ${item.dest} (${item.type})`);
        }
      }
      if (report.removed.length > 0) {
        console.log('\n陈旧项：');
        for (const item of report.removed) {
          console.log(`- [${item.action}] ${item.dest} (${item.type})`);
        }
      }
    } else {
      console.log(`\nwego-app/lib 副本同步完成`);
      if (report.synced.length > 0) {
        console.log('\n已同步：');
        for (const item of report.synced) {
          console.log(`- ${item.dest} (${item.type})`);
        }
      }
      if (report.removed.length > 0) {
        console.log('\n已删除陈旧项：');
        for (const item of report.removed) {
          console.log(`- ${item.dest} (${item.type})`);
        }
      }
    }
    if (report.missing.length > 0) {
      console.log('\n源缺失：');
      for (const item of report.missing) {
        console.log(`- ${item.src} (${item.type})`);
      }
    }
    if (report.errors.length > 0) {
      console.log('\n错误：');
      for (const err of report.errors) {
        console.log(`- ${err}`);
      }
    }
  }
  process.exit(code);
}

run();
