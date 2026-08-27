#!/usr/bin/env node

/**
 * build-routes.mjs
 *
 * 从各场景目录下的 route.json 汇总生成 wego-app/js/routes.js。
 *
 * 设计原则：
 *   - routes.js 是生成物，不是手改源；多人/多 Agent 并发时避免共享单文件冲突
 *   - 每个场景只在自己的目录里写 route.json（声明 routeId 与 entry）
 *   - style / script 路径由场景目录名自动推导，无需手写
 *
 * Usage:
 *   node scripts/build-routes.mjs          # 重新生成 routes.js
 *   node scripts/build-routes.mjs --check  # 仅校验是否与源一致，不写入
 */

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const scenesRoot = path.join(repoRoot, 'wego-app/scenes');
const routesPath = path.join(repoRoot, 'wego-app/js/routes.js');

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');

function jsValue(value, indent) {
  if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.map((item) => jsValue(item, indent)).join(', ')}]`;
  if (typeof value === 'object') {
    const pad = indent + '  ';
    const lines = Object.entries(value).map(([key, val]) => `${pad}${key}: ${jsValue(val, pad)}`);
    return `{\n${lines.join(',\n')}\n${indent}}`;
  }
  return String(value);
}

function serializeRoute(route, pad = '  ') {
  return `{
${pad}routeId: ${jsValue(route.routeId, pad)},
${pad}entry: ${jsValue(route.entry, pad)},
${pad}style: ${jsValue(route.style, pad)},
${pad}script: ${jsValue(route.script, pad)}
}`;
}

function buildRoutes() {
  if (!fs.existsSync(scenesRoot)) return [];
  const categories = fs
    .readdirSync(scenesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const routes = [];
  for (const category of categories) {
    const categoryRoot = path.join(scenesRoot, category);
    const scenes = fs
      .readdirSync(categoryRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const scene of scenes) {
      const metaPath = path.join(categoryRoot, scene, 'route.json');
      if (!fs.existsSync(metaPath)) continue;
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      if (!meta.routeId || !meta.entry) {
        console.error(`[build-routes] 跳过 ${category}/${scene}/route.json：缺少 routeId 或 entry`);
        continue;
      }
      routes.push({
        routeId: meta.routeId,
        entry: meta.entry,
        style: `./scenes/${category}/${scene}/scene.css`,
        script: `./scenes/${category}/${scene}/scene.js`,
      });
    }
  }
  routes.sort((a, b) => a.routeId.localeCompare(b.routeId));
  return routes;
}

const routes = buildRoutes();
const output = routes.length === 0
  ? 'window.WEGO_APP_ROUTES = [];\n'
  : `window.WEGO_APP_ROUTES = [\n${routes.map((route) => serializeRoute(route)).join(',\n')}\n];\n`;

if (checkOnly) {
  const current = fs.existsSync(routesPath) ? fs.readFileSync(routesPath, 'utf8') : '';
  if (current === output) {
    console.log('[build-routes] routes.js 与源一致');
    process.exit(0);
  }
  console.error('[build-routes] routes.js 与源不一致，请运行 node scripts/build-routes.mjs');
  process.exit(1);
}

fs.writeFileSync(routesPath, output, 'utf8');
console.log(`[build-routes] 已生成 ${routes.length} 条路由 -> wego-app/js/routes.js`);
