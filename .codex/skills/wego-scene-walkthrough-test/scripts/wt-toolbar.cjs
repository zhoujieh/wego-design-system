#!/usr/bin/env node
/**
 * 走查工具工具栏回归：桌面固定居中靠下并避让底部导航、不可拖动、收起态数字/默认箭头、入口 Tooltip；移动端保持原定位逻辑。
 */
const { chromium, devices } = require('playwright');

const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const i = arg.indexOf('=');
  return i > 0 ? [arg.slice(0, i).replace(/^--/, ''), arg.slice(i + 1)] : [arg.replace(/^--/, ''), true];
}));
const BASE = args.url || 'http://127.0.0.1:8092/wego-app/index.html';
const results = [];

function check(name, ok, detail = '') {
  const ts = new Date().toISOString().slice(11, 19);
  results.push({ name, ok, detail, ts });
  console.log(`${ok ? 'PASS' : 'FAIL'}  [${ts}]  ${name}${detail ? '  → ' + detail : ''}`);
}

async function inspectPanels(page) {
  return page.evaluate(async () => {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    const host = document.querySelector('wego-walkthrough');
    const root = host.shadowRoot;
    const rect = el => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const visibleInViewport = r => r.width > 0 && r.height > 0 && r.left >= 7 && r.right <= window.innerWidth - 7 && r.top >= 7 && r.bottom <= window.innerHeight - 7;
    const toolbarRect = rect(host);
    const out = { toolbar: toolbarRect };

    root.querySelector('[data-tool="overview"]').click();
    await wait(420);
    const overview = root.querySelector('wego-wt-overview-panel');
    out.overview = { hidden: overview.hasAttribute('hidden'), rect: rect(overview) };
    out.overview.ok = !out.overview.hidden && visibleInViewport(out.overview.rect) && out.overview.rect.bottom <= toolbarRect.top + 2;
    root.querySelector('[data-tool="overview"]').click();

    root.querySelector('[data-action="debug-log"]').click();
    await wait(420);
    const debug = root.querySelector('[data-debug-panel]');
    out.debug = { hidden: debug.hasAttribute('hidden'), rect: rect(debug) };
    out.debug.ok = !out.debug.hidden && visibleInViewport(out.debug.rect) && out.debug.rect.bottom <= toolbarRect.top + 2;
    root.querySelector('[data-action="debug-log"]').click();

    root.querySelector('[data-tool="more"]').click();
    await wait(420);
    const more = root.querySelector('[data-subpanel="more"]');
    const moreAnchor = root.querySelector('[data-tool="more"]');
    out.more = { rect: rect(more), anchor: rect(moreAnchor), open: more.classList.contains('is-open') };
    out.more.ok = out.more.open && visibleInViewport(out.more.rect) && out.more.rect.bottom <= toolbarRect.top - 7 &&
      Math.abs((out.more.rect.left + out.more.rect.width / 2) - (out.more.anchor.left + out.more.anchor.width / 2)) <= 2;
    root.querySelector('[data-tool="more"]').click();
    return out;
  });
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  try {
    const desktop = await browser.newContext({ viewport: { width: 1280, height: 960 }, cacheDisabled: true });
    const page = await desktop.newPage();
    page.on('pageerror', error => errors.push('desktop:' + error.message.slice(0, 180)));
    page.on('console', message => { if (message.type() === 'error') errors.push('desktop:' + message.text().slice(0, 180)); });
    await page.goto(BASE + '?t=' + Date.now(), { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => localStorage.setItem('wego.wgf-position', JSON.stringify({ x: 96, y: 120 })));
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1000);

    const desktopInitial = await page.evaluate(() => {
      const host = document.querySelector('wego-walkthrough');
      const toolbar = host.shadowRoot.querySelector('[data-toolbar]');
      const nav = document.querySelector('.bottom-nav');
      return {
        host: { left: host.getBoundingClientRect().left, top: host.getBoundingClientRect().top, right: host.getBoundingClientRect().right, bottom: host.getBoundingClientRect().bottom, width: host.getBoundingClientRect().width, height: host.getBoundingClientRect().height },
        nav: { left: nav.getBoundingClientRect().left, top: nav.getBoundingClientRect().top, right: nav.getBoundingClientRect().right, bottom: nav.getBoundingClientRect().bottom, width: nav.getBoundingClientRect().width, height: nav.getBoundingClientRect().height },
        fixed: toolbar.classList.contains('is-fixed'),
        savedIgnored: host.style.left !== '96px' && host.style.top === 'auto' && host.style.transform === 'none',
        tooltip: host.shadowRoot.querySelector('[data-fab-btn]').dataset.tooltip,
      };
    });
    check('桌面收起态水平居中', Math.abs(desktopInitial.host.left + desktopInitial.host.width / 2 - 640) <= 1, JSON.stringify(desktopInitial.host));
    check('桌面工具栏避让底部导航 16px', desktopInitial.host.bottom <= desktopInitial.nav.top - 15, `toolBottom=${desktopInitial.host.bottom} navTop=${desktopInitial.nav.top}`);
    check('桌面忽略历史拖动位置并固定', desktopInitial.fixed && desktopInitial.savedIgnored, `fixed=${desktopInitial.fixed}`);
    check('收起入口 Tooltip 为展开工具栏', desktopInitial.tooltip === '展开工具栏', desktopInitial.tooltip);
    const countState = await page.evaluate(() => {
      const root = document.querySelector('wego-walkthrough').shadowRoot;
      const fab = root.querySelector('[data-fab-btn]');
      const icon = root.querySelector('.fab-icon');
      const count = root.querySelector('[data-fab-count]');
      fab.setAttribute('data-has-count', 'true');
      count.hidden = false;
      const state = { icon: getComputedStyle(icon).display, count: getComputedStyle(count).display };
      fab.setAttribute('data-has-count', 'false');
      count.hidden = true;
      return state;
    });
    check('有修改数量时显示数字替换叉图标', countState.icon === 'none' && (countState.count === 'inline-flex' || countState.count === 'flex'), JSON.stringify(countState));

    const beforeDrag = desktopInitial.host;
    await page.mouse.move(beforeDrag.left + beforeDrag.width / 2, beforeDrag.top + beforeDrag.height / 2);
    await page.mouse.down();
    await page.mouse.move(beforeDrag.left + 180, beforeDrag.top - 80, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(350);
    const afterDrag = await page.evaluate(() => {
      const rect = document.querySelector('wego-walkthrough').getBoundingClientRect();
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
    });
    check('桌面工具栏不可拖动', Math.abs(afterDrag.left - beforeDrag.left) <= 1 && Math.abs(afterDrag.top - beforeDrag.top) <= 1,
      `${JSON.stringify(beforeDrag)}→${JSON.stringify(afterDrag)}`);

    await page.evaluate(() => document.querySelector('wego-walkthrough').shadowRoot.querySelector('[data-fab-btn]').click());
    await page.waitForTimeout(450);
    const expanded = await page.evaluate(() => {
      const host = document.querySelector('wego-walkthrough');
      const root = host.shadowRoot;
      const hostRect = host.getBoundingClientRect();
      const fabIcon = root.querySelector('.fab-icon').innerHTML.replace(/\s+/g, '');
      const collapseIcon = root.querySelector('[data-collapse-btn]').innerHTML.replace(/\s+/g, '');
      const labels = Array.from(root.querySelectorAll('[data-toolbar-main] [data-tooltip]')).map(btn => btn.dataset.tooltip);
      return {
        rect: { left: hostRect.left, top: hostRect.top, right: hostRect.right, bottom: hostRect.bottom, width: hostRect.width, height: hostRect.height },
        collapsedUsesArrow: fabIcon !== collapseIcon,
        labels,
      };
    });
    check('桌面展开态保持水平居中', Math.abs(expanded.rect.left + expanded.rect.width / 2 - 640) <= 1, JSON.stringify(expanded.rect));
    check('收起默认箭头、展开态收起入口叉图标', expanded.collapsedUsesArrow, 'different-svg');
    check('工具入口 Tooltip 文案齐全', JSON.stringify(expanded.labels) === JSON.stringify(['收起工具栏', '走查模式', '批注模式', '数据模拟', '修改记录', '调试日志', '更多工具']), expanded.labels.join('、'));

    const tooltipChecks = await page.evaluate(() => {
      const host = document.querySelector('wego-walkthrough');
      const root = host.shadowRoot;
      const tooltip = root.querySelector('[data-toolbar-tooltip]');
      return Array.from(root.querySelectorAll('[data-toolbar-main] [data-tooltip]')).map(btn => {
        btn.dispatchEvent(new MouseEvent('mouseenter'));
        const tipRect = tooltip.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        const result = {
          expected: btn.dataset.tooltip,
          actual: tooltip.textContent,
          visible: !tooltip.hidden,
          above: tipRect.bottom <= btnRect.top,
          nativeTitleRemoved: !btn.hasAttribute('title'),
        };
        btn.dispatchEvent(new MouseEvent('mouseleave'));
        return result;
      });
    });
    check('工具入口 Tooltip 均显示在按钮上方', tooltipChecks.every(item => item.visible && item.above && item.actual === item.expected && item.nativeTitleRemoved), JSON.stringify(tooltipChecks));

    const desktopPanels = await inspectPanels(page);
    check('桌面配置列表可见且位于工具栏上方', desktopPanels.overview.ok, JSON.stringify(desktopPanels.overview));
    check('桌面日志面板可见且位于工具栏上方', desktopPanels.debug.ok, JSON.stringify(desktopPanels.debug));
    check('桌面更多面板锚定对应入口', desktopPanels.more.ok, JSON.stringify(desktopPanels.more));

    await page.setViewportSize({ width: 1082, height: 490 });
    await page.waitForTimeout(350);
    const shortViewport = await page.evaluate(() => {
      const host = document.querySelector('wego-walkthrough');
      const nav = document.querySelector('.bottom-nav');
      return { host: { left: host.getBoundingClientRect().left, top: host.getBoundingClientRect().top, right: host.getBoundingClientRect().right, bottom: host.getBoundingClientRect().bottom, width: host.getBoundingClientRect().width, height: host.getBoundingClientRect().height }, nav: { left: nav.getBoundingClientRect().left, top: nav.getBoundingClientRect().top, right: nav.getBoundingClientRect().right, bottom: nav.getBoundingClientRect().bottom, width: nav.getBoundingClientRect().width, height: nav.getBoundingClientRect().height } };
    });
    check('矮视口仍居中且不挡底部导航', Math.abs(shortViewport.host.left + shortViewport.host.width / 2 - 541) <= 1 && shortViewport.host.bottom <= shortViewport.nav.top - 15,
      JSON.stringify(shortViewport));
    const shortPanels = await inspectPanels(page);
    check('矮视口三个面板均完整可见', shortPanels.overview.ok && shortPanels.debug.ok && shortPanels.more.ok, JSON.stringify(shortPanels));
    if (args.screenshot) {
      await page.evaluate(() => {
        const root = document.querySelector('wego-walkthrough').shadowRoot;
        root.querySelector('[data-tool="overview"]').click();
      });
      await page.waitForTimeout(420);
      await page.screenshot({ path: args.screenshot });
      await page.evaluate(() => document.querySelector('wego-walkthrough').shadowRoot.querySelector('[data-tool="overview"]').click());
    }
    await desktop.close();

    const mobile = await browser.newContext({ ...devices['iPhone 13'], cacheDisabled: true });
    const mobilePage = await mobile.newPage();
    mobilePage.on('pageerror', error => errors.push('mobile:' + error.message.slice(0, 180)));
    mobilePage.on('console', message => { if (message.type() === 'error') errors.push('mobile:' + message.text().slice(0, 180)); });
    await mobilePage.goto(BASE + '?t=' + Date.now(), { waitUntil: 'networkidle', timeout: 60000 });
    await mobilePage.evaluate(() => localStorage.setItem('wego.wgf-position', JSON.stringify({ x: 80, y: 150 })));
    await mobilePage.reload({ waitUntil: 'networkidle', timeout: 60000 });
    await mobilePage.waitForTimeout(900);
    const mobileState = await mobilePage.evaluate(() => {
      const host = document.querySelector('wego-walkthrough');
      const root = host.shadowRoot;
      const toolbar = root.querySelector('[data-toolbar]');
      root.querySelector('[data-fab-btn]').dispatchEvent(new MouseEvent('mouseenter'));
      return {
        left: host.style.left,
        top: host.style.top,
        bottom: host.style.bottom,
        transform: host.style.transform,
        fixed: toolbar.classList.contains('is-fixed'),
        tooltipHidden: root.querySelector('[data-toolbar-tooltip]').hidden,
      };
    });
    check('移动端沿用历史定位逻辑', mobileState.left === '80px' && mobileState.top === '150px' && mobileState.bottom === 'auto' && mobileState.transform === '', JSON.stringify(mobileState));
    check('移动端不启用桌面 Tooltip', !mobileState.fixed && mobileState.tooltipHidden, JSON.stringify(mobileState));
    await mobile.close();
  } catch (error) {
    check('脚本执行无异常', false, error.message.slice(0, 240));
  }

  check('全程无页面报错', errors.length === 0, errors.slice(0, 4).join(' | '));
  const failed = results.filter(result => !result.ok).length;
  console.log(`\n结果：${results.length - failed}/${results.length} 通过`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
