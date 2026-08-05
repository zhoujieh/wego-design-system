#!/usr/bin/env node
/**
 * 场景骨架屏采样脚本
 *
 * 用 Playwright 启动本地预览,导航到指定路由,等场景 init 渲染完成,
 * 递归扫描 [data-surface-id] 真实子树,生成扁平 div 色块骨架模板(复用 .wg-skeleton 基类)。
 *
 * 通用规则(P1-P7 节点处理优先级):
 *   P1 隐藏节点        → 跳过
 *   P2 装饰元素        → 跳过(叶子+纯背景色+高度≤4px或宽高比≥10)
 *   P3 叶子内容        → 画色块(文本/IMG/SVG/INPUT/图标≥16px)
 *   P4 横滚容器子元素  → 画整体(父级 overflow-x:scroll/auto + 水平排列)
 *   P5 有交互后代      → 穿透递归(子树含 button/a/INPUT/[data-component-slug])
 *   P6 无交互+水平排列 → 画整体
 *   P7 无交互+垂直堆叠 → 穿透递归
 *
 * 色块四周收缩 1px 产生间距,裁剪到场景根可见区域。
 *
 * 用法:
 *   node scripts/generate-scene-skeleton.mjs --route=album-product-feed
 *   node scripts/generate-scene-skeleton.mjs --route=album-product-feed --base-url=http://localhost:8080/wego-app/
 *   node scripts/generate-scene-skeleton.mjs --route=album-product-feed --write
 *   node scripts/generate-scene-skeleton.mjs --route=album-product-feed --regions=assets,apps
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
  const args = { route: null, baseUrl: null, write: false, outFile: null, regions: null };
  for (const item of argv.slice(2)) {
    if (item === '--write') args.write = true;
    else if (item.startsWith('--route=')) args.route = item.slice(8);
    else if (item.startsWith('--base-url=')) args.baseUrl = item.slice(11);
    else if (item.startsWith('--out=')) args.outFile = item.slice(6);
    else if (item.startsWith('--regions=')) args.regions = item.slice(10).split(',').map(s => s.trim()).filter(Boolean);
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
  --regions=a,b,c    指定采样的 data-region 名称;缺省时采样整个 [data-surface-id] 场景根
  --write            直接写入该路由 scene.js 的 skeletonTemplate 字段(需有标记注释)
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

// ── 路由解析:从 routes.js 找到目标路由的场景脚本路径 ──────
async function resolveRouteScript(routeId) {
  const routesPath = path.join(REPO_ROOT, 'wego-app', 'js', 'routes.js');
  const source = await fs.readFile(routesPath, 'utf8');
  const sandbox = { window: {} };
  const { default: vm } = await import('node:vm');
  vm.runInNewContext(source, sandbox, { filename: routesPath });
  const routes = Array.isArray(sandbox.window.WEGO_APP_ROUTES) ? sandbox.window.WEGO_APP_ROUTES : [];
  const route = routes.find(item => item && item.routeId === routeId);
  if (!route) throw new Error(`routes.js 中不存在路由: ${routeId}`);
  if (typeof route.script !== 'string' || !route.script) throw new Error(`路由 ${routeId} 缺少 script 字段`);
  const normalized = route.script.replace(/^\.?\//, '');
  const scenePath = path.join(REPO_ROOT, 'wego-app', normalized);
  if (!scenePath.startsWith(path.join(REPO_ROOT, 'wego-app') + path.sep)) {
    throw new Error(`路由 ${routeId} 的 script 路径越界: ${route.script}`);
  }
  return scenePath;
}

// ── evalDOM:在浏览器内执行,扫描 DOM 生成扁平色块 ──────────
// 此函数会被序列化注入浏览器执行,不能用闭包变量,所有依赖必须在函数内定义
async function evalDOMInPage(regions) {
  // 找 scene root 作为坐标参考(桌面预览壳里手机预览区域不是整个视口)
  const root = document.querySelector('[data-surface-id]') || document.body;
  const rootRect = root.getBoundingClientRect();
  const rw = rootRect.width;
  const rh = rootRect.height;
  if (rw === 0 || rh === 0) return '';

  // P1: 过滤不可见节点
  function isHidden(node) {
    if (!node || node.nodeType !== 1) return true;
    if (node.hasAttribute('hidden')) return true;
    const cs = getComputedStyle(node);
    if (cs.display === 'none' || cs.visibility === 'hidden') return true;
    if (parseFloat(cs.opacity) === 0) return true;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return true;
    // 完全在 scene root 外
    if (rect.bottom < rootRect.top || rect.top > rootRect.bottom) return true;
    if (rect.right < rootRect.left || rect.left > rootRect.right) return true;
    // 悬浮元素(FAB 等):fixed 或 absolute+高 z-index
    if (cs.position === 'fixed') return true;
    if (cs.position === 'absolute' && parseInt(cs.zIndex, 10) >= 100) return true;
    return false;
  }

  // P2: 装饰元素(叶子 + 纯背景色 + 高度≤4px 或 宽高比≥10)
  function isDecorative(node) {
    if (node.children.length > 0) return false;
    const hasText = (node.textContent || '').trim();
    if (hasText) return false;
    if (node.tagName === 'IMG' || node.tagName === 'SVG') return false;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName)) return false;
    const cs = getComputedStyle(node);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return false;
    const hasBg = cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';
    if (!hasBg) return false;
    const rect = node.getBoundingClientRect();
    if (rect.height <= 4) return true;
    if (rect.width > 0 && rect.height > 0 && rect.width / rect.height >= 10) return true;
    return false;
  }

  // P3: 叶子内容节点(不再递归,直接生成色块)
  function isLeafContent(node) {
    if (node.tagName === 'SVG') return true;
    if (node.children.length === 0) {
      const text = (node.textContent || '').trim();
      if (text) return true;
      const cs = getComputedStyle(node);
      if (node.tagName === 'IMG') return true;
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName)) return true;
      // 无子元素 + 有背景色 + 尺寸 > 4px 且 宽高比 < 10(如进度条填充值)
      if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') {
        const rect = node.getBoundingClientRect();
        if (rect.height > 4 && rect.width > 0 && rect.height > 0 && rect.width / rect.height < 10) return true;
      }
      // 图标字体 <i> 标签,尺寸 ≥ 16px 才画(< 16px 的箭头等跳过)
      if (node.tagName === 'I') {
        const rect = node.getBoundingClientRect();
        if (rect.width >= 16 && rect.height >= 16) return true;
      }
      return false;
    }
    if (node.children.length === 1 && node.firstElementChild.tagName === 'IMG') return true;
    return false;
  }

  // P4: 横滚容器直接子元素(父级 overflow-x:scroll/auto + 水平排列)
  function isHorizontalScrollChild(node) {
    const parent = node.parentElement;
    if (!parent || parent === root) return false;
    const pcs = getComputedStyle(parent);
    if (pcs.overflowX !== 'scroll' && pcs.overflowX !== 'auto') return false;
    const isRow = pcs.flexDirection === 'row' || pcs.flexDirection === 'row-reverse';
    const isInline = pcs.display === 'inline' || pcs.display === 'inline-block';
    return isRow || isInline;
  }

  // P5: 有交互后代(子树含 button/a/INPUT 或 [data-component-slug])
  function hasInteractiveDescendant(node) {
    const interactive = node.querySelectorAll('button, a, input, textarea, select');
    for (const el of interactive) {
      if (!isHidden(el)) return true;
    }
    const components = node.querySelectorAll('[data-component-slug]');
    for (const el of components) {
      if (!isHidden(el)) return true;
    }
    return false;
  }

  // P6: 无交互后代 + 子元素水平排列
  function isHorizontalLayout(node) {
    if (node.children.length < 2) return false;
    const cs = getComputedStyle(node);
    if (cs.flexDirection === 'row' || cs.flexDirection === 'row-reverse') return true;
    if (cs.display === 'inline' || cs.display === 'inline-block') return true;
    // 检查前两个可见子元素的 y 坐标是否重叠(水平排列)
    const visibleChildren = Array.from(node.children).filter(c => !isHidden(c));
    if (visibleChildren.length < 2) return false;
    const r1 = visibleChildren[0].getBoundingClientRect();
    const r2 = visibleChildren[1].getBoundingClientRect();
    if (r1.top < r2.bottom && r2.top < r1.bottom) return true;
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

  // 裁剪 rect 到 bounds 范围
  function clampRect(rect, bounds) {
    const top = Math.max(rect.top, bounds.top);
    const bottom = Math.min(rect.bottom, bounds.bottom);
    const left = Math.max(rect.left, bounds.left);
    const right = Math.min(rect.right, bounds.right);
    return { top, left, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
  }

  // 取真实盒模型,换算为相对于 scene root 的百分比
  function drawBlock(node, sink) {
    const rawRect = node.getBoundingClientRect();
    if (rawRect.width <= 1 || rawRect.height <= 1) return;

    // 裁剪到场景根可见区域
    const rect = clampRect(rawRect, rootRect);
    if (rect.width <= 1 || rect.height <= 1) return;

    // 四周收缩 1px 产生间距
    const sTop = rect.top + 1;
    const sLeft = rect.left + 1;
    const sWidth = rect.width - 2;
    const sHeight = rect.height - 2;
    if (sWidth <= 0 || sHeight <= 0) return;

    const cs = getComputedStyle(node);
    let radius = cs.borderRadius;
    if (radius && radius.endsWith('%')) {
      const pct = parseFloat(radius) / 100;
      radius = Math.round(Math.min(rawRect.width, rawRect.height) * pct) + 'px';
    }
    if (radius === '0px') radius = '';

    const top = ((sTop - rootRect.top) / rh * 100).toFixed(3);
    const left = ((sLeft - rootRect.left) / rw * 100).toFixed(3);
    const width = (sWidth / rw * 100).toFixed(3);
    const height = (sHeight / rh * 100).toFixed(3);

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

  // walk:按 P1-P7 优先级处理
  function walk(node, sink) {
    if (isHidden(node)) return;           // P1
    if (isDecorative(node)) return;       // P2
    if (isLeafContent(node)) {            // P3
      drawBlock(node, sink);
      return;
    }
    if (isHorizontalScrollChild(node)) {  // P4
      drawBlock(node, sink);
      return;
    }
    if (hasInteractiveDescendant(node)) { // P5
      for (const child of node.children) {
        walk(child, sink);
      }
      return;
    }
    if (isHorizontalLayout(node)) {       // P6
      drawBlock(node, sink);
      return;
    }
    // P7: 无交互后代 + 垂直堆叠 → 穿透递归
    for (const child of node.children) {
      walk(child, sink);
    }
  }

  const sink = [];
  if (!regions || regions.length === 0) {
    // 全页面采样:遍历场景根
    walk(root, sink);
  } else {
    // 局部采样:只遍历指定 region
    for (const name of regions) {
      const el = document.querySelector('[data-region="' + name + '"]');
      if (el) walk(el, sink);
    }
  }
  return sink.join('\n');
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

    // 等场景 init 完成:[data-surface-id] 有内容,或任一 [data-region] 有内容,或等待 8s 兜底
    await page.waitForFunction(() => {
      const root = document.querySelector('[data-surface-id]');
      if (root && root.children.length > 0) return true;
      const regions = document.querySelectorAll('[data-region]');
      for (const r of regions) {
        if (r.children.length > 0 && !r.hasAttribute('hidden')) return true;
      }
      return false;
    }, { timeout: 8000 }).catch(() => {
      console.warn('[warn] 等待场景 init 超时,按当前状态采样');
    });

    // 滚动到顶部,确保采样的是首屏状态
    await page.evaluate(() => {
      const scroll = document.querySelector('[data-tab-scroll]') || document.querySelector('.album-feed__scroll');
      if (scroll) scroll.scrollTop = 0;
      window.scrollTo(0, 0);
    });
    // 额外等待 500ms 确保布局稳定(图片加载、动画结束、滚动归位)
    await page.waitForTimeout(500);

    // 采样:--regions 指定局部采样;缺省采样整个 [data-surface-id] 场景根
    const skeletonHtml = await page.evaluate(evalDOMInPage, args.regions);

    if (!skeletonHtml.trim()) {
      throw new Error('生成的骨架模板为空,请检查页面是否正常渲染');
    }

    if (args.outFile) {
      await fs.writeFile(args.outFile, skeletonHtml, 'utf-8');
      console.log('[info] 骨架模板已写入:', args.outFile);
    } else if (args.write) {
      const scenePath = await resolveRouteScript(args.route);
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
