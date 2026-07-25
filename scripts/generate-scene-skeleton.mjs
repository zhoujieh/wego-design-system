#!/usr/bin/env node
/**
 * 场景骨架屏采样脚本
 *
 * 用 Playwright 启动本地预览,导航到指定路由,等场景 init 渲染完成,
 * 递归扫描 [data-region] 真实子树,生成扁平 div 色块骨架模板(复用 .wg-skeleton 基类)。
 *
 * 用法:
 *   node scripts/generate-scene-skeleton.mjs --route=album-product-feed
 *   node scripts/generate-scene-skeleton.mjs --route=album-product-feed --base-url=http://localhost:8080/wego-app/
 *   node scripts/generate-scene-skeleton.mjs --route=album-product-feed --write
 *
 * 输出:
 *   - 默认打印到 stdout(便于人工 review)
 *   - --write: 写入 scene.js 的 skeletonTemplate 字段(由 // SKELETON-TEMPLATE-START/END 标记定位)
 *
 * 依赖:playwright(开发期)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// ── CLI 参数解析 ────────────────────────────────────────────
function parseArgs(argv) {
  const args = { route: null, baseUrl: null, write: false, outFile: null };
  for (const item of argv.slice(2)) {
    if (item === '--write') args.write = true;
    else if (item.startsWith('--route=')) args.route = item.slice(8);
    else if (item.startsWith('--base-url=')) args.baseUrl = item.slice(11);
    else if (item.startsWith('--out=')) args.outFile = item.slice(6);
    else if (item === '-h' || item === '--help') {
      printHelp();
      process.exit(0);
    }
  }
  if (!args.route) {
    console.error('[error] 缺少 --route 参数');
    printHelp();
    process.exit(1);
  }
  return args;
}

function printHelp() {
  console.log(`
用法: node scripts/generate-scene-skeleton.mjs --route=<routeId> [options]

参数:
  --route=<id>       必填,路由 ID(对应 routes.js 中的 routeId,如 album-product-feed)
  --base-url=<url>   本地预览基地址,默认 http://localhost:8080/wego-app/
  --write            直接写入 scene.js 的 skeletonTemplate 字段(需有标记注释)
  --out=<file>       写入指定文件(默认 stdout)
  -h, --help         显示帮助

骨架模板定位标记(写入 scene.js 时需要):
  // SKELETON-TEMPLATE-START
  skeletonTemplate: \`
  ...模板内容...
  \`,
  // SKELETON-TEMPLATE-END
`);
}

// ── evalDOM:在浏览器内执行,扫描 DOM 生成扁平色块 ──────────
// 借鉴 draw-page-structure (famanoder/dps) 的核心思路:
// 递归遍历可见节点 → getBoundingClientRect 取真实盒模型 → 换算百分比 → 生成 div 色块
// 与 dps 的差异:
// 1. 复用 .wg-skeleton 基类(shimmer 动画与 image 组件一致),不造新 class
// 2. 坐标相对于 scene root([data-surface-id])而非视口,适配桌面预览壳(手机预览区域非全屏视口)
// 3. 色块用 position:absolute 而非 fixed,由 overlay 容器(absolute inset:0)承载
//
// 此函数会被序列化注入浏览器执行,不能用闭包变量,所有依赖必须在函数内定义
async function evalDOMInPage(regions) {
  // 找 scene root 作为坐标参考(桌面预览壳里手机预览区域不是整个视口)
  const root = document.querySelector('[data-surface-id]') || document.body;
  const rootRect = root.getBoundingClientRect();
  const rw = rootRect.width;
  const rh = rootRect.height;
  if (rw === 0 || rh === 0) return {};

  // 过滤规则:不可见 / 装饰 / 非内容
  function isHidden(node) {
    if (!node || node.nodeType !== 1) return true;
    if (node.hasAttribute('hidden')) return true;
    if (node.getAttribute('aria-hidden') === 'true') return true;
    const cs = getComputedStyle(node);
    if (cs.display === 'none' || cs.visibility === 'hidden') return true;
    if (parseFloat(cs.opacity) === 0) return true;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return true;
    // 完全在 scene root 外
    if (rect.bottom < rootRect.top || rect.top > rootRect.bottom) return true;
    if (rect.right < rootRect.left || rect.left > rootRect.right) return true;
    return false;
  }

  // 判断是否为叶子内容节点(不再递归,直接生成色块)
  function isLeafContent(node) {
    if (node.children.length === 0) {
      const text = (node.textContent || '').trim();
      if (text) return true;
      const cs = getComputedStyle(node);
      if (node.tagName === 'IMG') return true;
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName)) return true;
      return false;
    }
    if (node.tagName === 'SVG') return true;
    if (node.children.length === 1 && node.firstElementChild.tagName === 'IMG') return true;
    return false;
  }

  // 判断是否为圆形(头像等)
  function isCircle(node) {
    const cs = getComputedStyle(node);
    const r = cs.borderRadius;
    if (r === '50%' || r === '9999px') return true;
    const cls = node.className || '';
    if (typeof cls === 'string' && /avatar|circle|round/.test(cls)) {
      const rect = node.getBoundingClientRect();
      if (rect.width === rect.height) return true;
    }
    return false;
  }

  // 取真实盒模型,换算为相对于 scene root 的百分比
  function drawBlock(node, sink) {
    const rect = node.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) return;

    const cs = getComputedStyle(node);
    let radius = cs.borderRadius;
    if (radius && radius.endsWith('%')) {
      const pct = parseFloat(radius) / 100;
      radius = Math.round(Math.min(rect.width, rect.height) * pct) + 'px';
    }
    if (radius === '0px') radius = '';

    // 相对于 scene root 的百分比,position:absolute 由 overlay 容器承载
    const top = ((rect.top - rootRect.top) / rh * 100).toFixed(3);
    const left = ((rect.left - rootRect.left) / rw * 100).toFixed(3);
    const width = (rect.width / rw * 100).toFixed(3);
    const height = (rect.height / rh * 100).toFixed(3);

    const circleCls = isCircle(node) ? ' wg-skeleton--circle' : ' wg-skeleton--rect';
    const style = [
      'position:absolute',
      'top:' + top + '%',
      'left:' + left + '%',
      'width:' + width + '%',
      'height:' + height + '%',
      radius ? 'border-radius:' + radius : '',
      'box-sizing:border-box'
    ].filter(Boolean).join(';');

    sink.push('<div class="wg-skeleton' + circleCls + '" style="' + style + '" aria-hidden="true"></div>');
  }

  function walk(node, sink) {
    if (isHidden(node)) return;
    if (isLeafContent(node)) {
      drawBlock(node, sink);
      return;
    }
    let hasVisibleChild = false;
    for (const child of node.children) {
      if (!isHidden(child)) {
        hasVisibleChild = true;
        walk(child, sink);
      }
    }
    if (!hasVisibleChild) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        drawBlock(node, sink);
      }
    }
  }

  const result = {};
  for (const name of regions) {
    const el = document.querySelector('[data-region="' + name + '"]');
    if (!el) continue;
    const sink = [];
    walk(el, sink);
    result[name] = sink.join('\n');
  }
  return result;
}

// ── 主流程 ─────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv);

  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch (e) {
    console.error('[error] 未安装 playwright。请运行: npm i -D playwright && npx playwright install chromium');
    process.exit(2);
  }

  // 简化:base 为 wgo-app 根,hash 直接拼路由(格式 #/routeId)
  const targetUrl = args.baseUrl
    ? (args.baseUrl.replace(/\/$/, '') + '/#/' + args.route)
    : 'http://localhost:8080/wego-app/#/' + args.route;

  console.log('[info] 启动浏览器,目标:', targetUrl);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X 尺寸,与预览壳一致
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    // 等场景 init 完成:feed-grid 有内容或等待 8s 兜底
    await page.waitForFunction(() => {
      const grid = document.querySelector('[data-region="feed-grid"]');
      if (grid && grid.children.length > 0) return true;
      const regions = document.querySelectorAll('[data-region]');
      for (const r of regions) {
        if (r.children.length > 0 && !r.hasAttribute('hidden')) return true;
      }
      return false;
    }, { timeout: 8000 }).catch(() => {
      console.warn('[warn] 等待场景 init 超时,按当前状态采样');
    });

    // 滚动到顶部,确保采样的是首屏状态(避免采到滚动后的位置)
    await page.evaluate(() => {
      const scroll = document.querySelector('[data-tab-scroll]') || document.querySelector('.album-feed__scroll');
      if (scroll) scroll.scrollTop = 0;
      window.scrollTo(0, 0);
    });
    // 额外等待 500ms 确保布局稳定(图片加载、动画结束、滚动归位)
    await page.waitForTimeout(500);

    // 只采样初始为空、由 init 填充的 region
    // publish-dock / empty-host 不采样(初始 hidden 或不参与骨架)
    const SAMPLE_REGIONS = ['people-list', 'filter-tags', 'feed-grid'];

    const skeleton = await page.evaluate(evalDOMInPage, SAMPLE_REGIONS);

    // 组装最终 HTML(扁平色块堆叠)
    const htmlParts = [];
    for (const name of SAMPLE_REGIONS) {
      if (skeleton[name]) {
        htmlParts.push(skeleton[name]);
      }
    }
    const skeletonHtml = htmlParts.join('\n');

    if (args.outFile) {
      await fs.writeFile(args.outFile, skeletonHtml, 'utf-8');
      console.log('[info] 骨架模板已写入:', args.outFile);
    } else if (args.write) {
      const scenePath = path.join(REPO_ROOT, 'wego-app', 'scenes', '微购相册动态', 'scene.js');
      await writeSkeletonToScene(scenePath, skeletonHtml);
      console.log('[info] 骨架模板已写入:', scenePath);
    } else {
      console.log('\n=== 骨架模板 ===\n');
      console.log(skeletonHtml);
      console.log('\n=== END ===');
      const count = skeletonHtml.split('\n').filter(Boolean).length;
      console.log('[info] 共', count, '个色块');
    }
  } finally {
    await browser.close();
  }
}

// ── 写入 scene.js ──────────────────────────────────────────
const TEMPLATE_START = '// SKELETON-TEMPLATE-START';
const TEMPLATE_END = '// SKELETON-TEMPLATE-END';

async function writeSkeletonToScene(scenePath, skeletonHtml) {
  const content = await fs.readFile(scenePath, 'utf-8');

  if (!content.includes(TEMPLATE_START)) {
    throw new Error(`scene.js 未找到 ${TEMPLATE_START} 标记,请先添加占位:\n  skeletonMode: 'explicit',\n  ${TEMPLATE_START}\n  skeletonTemplate: \`\n  \`,\n  ${TEMPLATE_END}\n`);
  }

  const startIdx = content.indexOf(TEMPLATE_START);
  const endIdx = content.indexOf(TEMPLATE_END);
  if (endIdx < startIdx) throw new Error(`${TEMPLATE_END} 在 ${TEMPLATE_START} 之前,标记顺序错误`);

  const before = content.slice(0, startIdx);
  const after = content.slice(endIdx + TEMPLATE_END.length);

  // 转义反引号和 ${} 避免模板字符串解析错误
  const escaped = skeletonHtml.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

  const newBlock = `${TEMPLATE_START}
  skeletonTemplate: \`
${escaped}
  \`,
  ${TEMPLATE_END}`;

  await fs.writeFile(scenePath, before + newBlock + after, 'utf-8');
}

main().catch((err) => {
  console.error('[error]', err.message);
  process.exit(1);
});
