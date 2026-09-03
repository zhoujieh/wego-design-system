#!/usr/bin/env node
/**
 * 走查工具一键回归冒烟：覆盖 5 项交互核心断言（回显 + 无页面报错）。
 * 运行方式（CommonJS，支持 NODE_PATH 解析 playwright）：
 *   cd <含 node_modules 的 worktree>
 *   NODE_PATH=<node_modules 所在 worktree> node scripts/wt-smoke.cjs            # 默认本地 localhost:8092
 *   NODE_PATH=<node_modules 所在 worktree> node scripts/wt-smoke.cjs --url=https://zhoujieh.github.io/wego-design-system/previews/pr-160/
 * 依赖：playwright（仓库主 worktree node_modules）
 */
const { chromium } = require('playwright');

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const i = a.indexOf('=');
  return i > 0 ? [a.slice(0, i), a.slice(i + 1)] : [a, true];
}));
const BASE = args.url || 'http://localhost:8092/wego-app/index.html';

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  → ' + detail : ''}`);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 960 }, cacheDisabled: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0, 200)));

  try {
    await page.goto(BASE + '?t=' + Date.now(), { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);

    // 进入走查（此时无选中）
    await page.evaluate(() => {
      document.querySelector('wego-walkthrough').shadowRoot.querySelector('[data-fab-btn]').click();
    });
    await page.waitForTimeout(500);

    // ⑤ 悬停元信息（无选中态，hover head 左上 padding 区）
    const hp = await page.evaluate(() => {
      const el = document.querySelector('.album-feed__head');
      const r = el.getBoundingClientRect();
      return { x: r.x + 6, y: r.y + 6 };
    });
    await page.mouse.move(hp.x, hp.y);
    await page.waitForTimeout(600);
    const insp = await page.evaluate(() => {
      const ins = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-inspector');
      if (!ins) return null;
      const isr = ins.shadowRoot;
      return {
        guides: isr.querySelectorAll('line.guide').length,
        bubble: isr.querySelector('.bubble-text')?.textContent || '',
        pads: isr.querySelectorAll('rect.pad-r').length,
        display: getComputedStyle(ins).display
      };
    });
    check('⑤ 悬停四边延长线+气泡', insp && insp.display === 'block' && insp.guides === 4 && insp.bubble.includes('×'), insp ? insp.bubble : '无 inspector');
    check('⑤ padding 青色块', insp && insp.pads >= 1, `pads=${insp ? insp.pads : 0}`);

    // 选中 head（点击中心 + 连点，head 中心命中 publisher 上移到 head）
    const p = await page.evaluate(() => {
      const el = document.querySelector('.album-feed__head');
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(450);
    for (let i = 0; i < 2; i++) { await page.mouse.click(p.x, p.y); await page.waitForTimeout(400); }
    const sel = await page.evaluate(() => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      return panel && panel._targetEl ? (panel._targetEl.className || panel._targetEl.tagName) : 'none';
    });
    check('进入走查并选中元素', sel === 'album-feed__head', sel);

    // ① HSL
    await page.evaluate(() => {
      const sp = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel').shadowRoot;
      sp.querySelector('[data-color-trigger][data-field="fillHex"]').click();
    });
    await page.waitForTimeout(500);
    const hsl = await page.evaluate(() => {
      const c = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-color-picker').shadowRoot;
      const selEl = c.querySelector('select[data-format-select]');
      const opts = Array.from(selEl.options).map(o => o.value);
      selEl.value = 'hsl';
      selEl.dispatchEvent(new Event('change', { bubbles: true }));
      return { opts, chans: Array.from(c.querySelectorAll('.channel-input')).map(i => i.getAttribute('data-channel')) };
    });
    check('① HSL 格式切换', JSON.stringify(hsl.opts).includes('"hsl"'), 'hex/rgb/hsl');
    check('① HSL 三通道', hsl.chans.includes('h') && hsl.chans.includes('s') && hsl.chans.includes('l'), hsl.chans.join(','));

    // ② 渐变
    await page.evaluate(() => {
      const c = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-color-picker').shadowRoot;
      const gradBtn = Array.from(c.querySelectorAll('.seg-btn')).find(b => b.textContent.includes('渐变'));
      if (gradBtn) gradBtn.click();
    });
    await page.waitForTimeout(500);
    const gradEditor = await page.evaluate(() => {
      const c = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-color-picker').shadowRoot;
      return { editor: !!c.querySelector('.gradient-editor'), stopbar: !!c.querySelector('.gradient-stopbar') };
    });
    check('② 渐变编辑器+色标条', gradEditor.editor && gradEditor.stopbar, JSON.stringify(gradEditor));

    // ③ 数值字段：点击全选 + 输入回显（完整撤销闭环见 test-steps.md）
    const num = await page.evaluate(() => {
      const sp = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel').shadowRoot;
      const input = sp.querySelector('input[data-field="paddingLeft"]');
      if (!input) return null;
      const v0 = input.value;
      input.focus();
      input.select();
      const selInfo = { selStart: input.selectionStart, selEnd: input.selectionEnd, len: v0.length };
      input.value = '30';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return selInfo;
    });
    check('③ 数值字段点击全选', num && num.len > 0 && num.selStart === 0 && num.selEnd === num.len, num ? `len=${num.len}` : '字段未找到');

    // ④ 拖拽换位（head 层：head 中心起点，越过 media 中心；单次 move 到位——CDP 多段会被输入合并只留第一段）
    const dragInfo = await page.evaluate(() => {
      const head = document.querySelector('.album-feed__head').getBoundingClientRect();
      const media = document.querySelector('.album-feed__media').getBoundingClientRect();
      window.__drag = { sx: head.x + head.width / 2, sy: head.y + head.height / 2, ty: media.y + media.height / 2 + 20 };
      const card0 = document.querySelector('.album-feed__list').children[0];
      return {
        headClass: card0.querySelector('.album-feed__head') ? 'head存在' : 'head缺失',
        publisher: card0.querySelector('.album-feed__publisher')?.textContent.trim().slice(0, 4)
      };
    });
    const d = await page.evaluate(() => window.__drag);
    await page.mouse.move(d.sx, d.sy);
    await page.mouse.down();
    await page.waitForTimeout(300);
    await page.mouse.move(d.sx, d.ty, { steps: 20 });
    await page.waitForTimeout(400);
    await page.mouse.up();
    await page.waitForTimeout(900);
    const orderAfter = await page.evaluate(() => {
      const list = document.querySelector('.album-feed__list');
      const card0 = list.children[0];
      return Array.from(card0.children).map(c => c.className.split(' ')[0]).slice(0, 3);
    });
    const changed = orderAfter[0] !== 'album-feed__head';
    check('④ 拖拽换位（head↔media）', changed, `card0 子序:${orderAfter.join(',')}`);

  } catch (e) {
    check('脚本执行无异常', false, e.message.slice(0, 200));
  }

  check('无页面报错', errors.length === 0, errors.slice(0, 3).join(' | '));
  const failed = results.filter(r => !r.ok).length;
  console.log(`\n结果：${results.length - failed}/${results.length} 通过`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
