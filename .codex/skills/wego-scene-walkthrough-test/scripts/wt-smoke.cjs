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
  return i > 0 ? [a.slice(0, i).replace(/^--/, ''), a.slice(i + 1)] : [a.replace(/^--/, ''), true];
}));
const BASE = args.url || 'http://localhost:8092/wego-app/index.html';

const results = [];
function check(name, ok, detail = '') {
  const ts = new Date().toISOString().slice(11, 19);
  results.push({ name, ok, detail, ts });
  console.log(`${ok ? 'PASS' : 'FAIL'}  [${ts}]  ${name}${detail ? '  → ' + detail : ''}`);
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
        padbg: isr.querySelectorAll('rect.pad-bg').length,
        gapbg: isr.querySelectorAll('rect.gap-bg').length,
        pnum: Array.from(isr.querySelectorAll('text.pnum')).map(t => t.textContent),
        nums: Array.from(isr.querySelectorAll('text.num')).map(t => t.textContent),
        noBubble: !isr.querySelector('.bubble-text'),
        display: getComputedStyle(ins).display
      };
    });
    check('⑤ 悬停四边延长线', insp && insp.display === 'block' && insp.guides === 4, insp ? `guides=${insp.guides}` : '无 inspector');
    check('⑤ 容器 padding 蓝底 + gap 洋红底', insp && insp.padbg >= 1 && insp.gapbg >= 1 && insp.pnum.length >= 1, `padbg=${insp ? insp.padbg : 0} gapbg=${insp ? insp.gapbg : 0} pnum=${insp ? insp.pnum.length : 0}`);
    check('⑤ 元素信息气泡已去除', insp && insp.noBubble, `noBubble=${insp ? insp.noBubble : 0}`);
    // 宽×高气泡在 highlight `.label`（hover 模式 `${宽}×${高}`）
    const hlLabel = await page.evaluate(() => {
      const hl = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-highlight');
      return hl?.shadowRoot?.querySelector('.label')?.textContent || '';
    });
    check('⑤ highlight 宽×高气泡', hlLabel.includes('×'), hlLabel);

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

    // ③ 数值字段：合并 padding 输入点击全选 + 四边同步（完整撤销闭环见 test-steps.md）
    const num = await page.evaluate(() => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      const sp = panel.shadowRoot;
      const input = sp.querySelector('input[data-field="paddingAll"]');
      if (!input) return null;
      const v0 = input.value;
      input.focus();
      input.select();
      const selInfo = { selStart: input.selectionStart, selEnd: input.selectionEnd, len: v0.length };
      input.value = '30';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      const cs = getComputedStyle(panel._targetEl);
      selInfo.padding = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft];
      return selInfo;
    });
    check('③ 合并 padding 点击全选并同步四边',
      num && num.len > 0 && num.selStart === 0 && num.selEnd === num.len && num.padding.every(v => v === '30px'),
      num ? `len=${num.len} padding=${num.padding.join('/')}` : '字段未找到');

    // ④a 连点上移（鼠标不动连续点击当前选中元素 → 逐级上移父级）：
    // 当前已选中 album-feed__head，同位置（head 中心 p）再点击 → 上移到父级 card
    const upBefore = await page.evaluate(() => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      const body = panel.shadowRoot.querySelector('.panel-body');
      window.__upRef = body ? body.firstElementChild : null;
      return panel._targetEl ? (panel._targetEl.className || panel._targetEl.tagName) : 'none';
    });
    await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(450);
    const upAfter = await page.evaluate(() => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      return panel._targetEl ? (panel._targetEl.className || panel._targetEl.tagName) : 'none';
    });
    check('④a 连点上移（鼠标不动点击选中元素→上移父级）', upAfter !== upBefore && upBefore === 'album-feed__head', `${upBefore}→${upAfter}`);

    // ④b 样式面板 light 局部更新：结构一致时 openForElement(light) 不重建 DOM（.panel-body 首子节点引用不变）
    const light = await page.evaluate(() => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      const el = panel._targetEl;
      if (!el) return { same: false, reason: 'no target' };
      const body = panel.shadowRoot.querySelector('.panel-body');
      const ref = body ? body.firstElementChild : null;
      panel.openForElement(el, 'x', '', { light: true });
      const body2 = panel.shadowRoot.querySelector('.panel-body');
      return { same: !!(body && body2 && body === body2 && ref === body2.firstElementChild) };
    });
    check('④b 样式面板 light 局部更新不重建 DOM', light.same, JSON.stringify(light));

    // ④c 键盘方向键顺序移动（与样式面板 move 按钮一致）：点击 publisher 文本左端选中
    //     （左端距 head 中心 >16px，避免被判定为连点上移），ArrowDown 在 meta column 容器内与 time 换位
    const pub = await page.evaluate(() => {
      const el = document.querySelector('.album-feed__publisher');
      const r = el.getBoundingClientRect();
      return { x: r.x + 8, y: r.y + r.height / 2 };
    });
    await page.mouse.click(pub.x, pub.y);
    await page.waitForTimeout(500);
    const k1 = await page.evaluate(() => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      const el = document.querySelector('.album-feed__publisher');
      return { order: getComputedStyle(el).order, selected: panel && panel._targetEl === el ? 'publisher' : (panel && panel._targetEl ? (panel._targetEl.className || panel._targetEl.tagName) : 'none') };
    });
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    const k2 = await page.evaluate(() => getComputedStyle(document.querySelector('.album-feed__publisher')).order);
    check('④c 键盘方向键顺序移动（flex 换位）', k1.selected === 'publisher' && k2 !== k1.order, `选中:${k1.selected} order:${k1.order}→${k2}`);

    // ④d 面板移动按钮「同档换位 + 撤销整体还原」：覆盖 moveFlexItem 顺延分支与 moveKey 一次撤销绑定
    //     （曾漏测该路径致 moveFlexItem 块级 g 作用域 bug 与「一次移动=多撤销单元」长期未被抓出）
    const avc = await page.evaluate(() => {
      const el = document.querySelector('.album-feed__avatar');
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await page.mouse.click(avc.x, avc.y);
    await page.waitForTimeout(500);
    const allAvOrder = () => page.evaluate(() => Array.from(document.querySelectorAll('.album-feed__avatar')).map(a => getComputedStyle(a).order));
    const avBefore = await page.evaluate(() => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      const el = document.querySelector('.album-feed__avatar');
      return { selected: panel && panel._targetEl === el ? 'avatar' : 'other', order: getComputedStyle(el).order };
    });
    const allBefore = await allAvOrder();
    await page.evaluate(() => {
      const pr = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel').shadowRoot;
      pr.querySelector('[data-move="right"]').click();
    });
    await page.waitForTimeout(600); // 等跨卡共享同步
    const avAfter = await page.evaluate(() => getComputedStyle(document.querySelector('.album-feed__avatar')).order);
    const undoAvail = await page.evaluate(() => {
      const pr = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel').shadowRoot;
      return !pr.querySelector('[data-action="undo"]').classList.contains('is-disabled');
    });
    check('④d 面板移动按钮同档换位（flex 顺延）', avBefore.selected === 'avatar' && avAfter !== avBefore.order, `选中:${avBefore.selected} order:${avBefore.order}→${avAfter}`);
    check('④d 移动后撤销栈已记录（undo 可点）', undoAvail, `undoEnabled=${undoAvail}`);
    await page.evaluate(() => {
      const pr = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel').shadowRoot;
      pr.querySelector('[data-action="undo"]').click();
    });
    await page.waitForTimeout(500);
    const allUndone = await allAvOrder();
    check('④d 一次撤销整体还原（moveKey 跨卡同步）', JSON.stringify(allUndone) === JSON.stringify(allBefore), `${JSON.stringify(allBefore)} → ${JSON.stringify(allUndone)}`);

    // localStorage 落盘核对（真实执行证据：操作已写入本地存储，防"看起来对"假象）
    const ls = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => /wego|walkthrough|changes/i.test(k));
      const snap = {};
      keys.forEach(k => { try { snap[k] = String(localStorage.getItem(k)).slice(0, 80); } catch (e) {} });
      return { keys, snap };
    });
    check('操作已落盘 localStorage（真实写入证据）', ls.keys.length > 0, ls.keys.join(',') || '无 wego/walkthrough key');

  } catch (e) {
    check('脚本执行无异常', false, e.message.slice(0, 200));
  }

  check('无页面报错', errors.length === 0, errors.slice(0, 3).join(' | '));
  const failed = results.filter(r => !r.ok).length;
  console.log('\n=== 证据清单（操作 → 实测 → 时间戳）===');
  results.forEach(r => console.log(`[${r.ts}] ${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? ' → ' + r.detail : ''}`));
  console.log(`\n结果：${results.length - failed}/${results.length} 通过`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
