#!/usr/bin/env node
/**
 * 走查工具 iconfont 替换回归：标题栏入口、纯图标滚动面板、替换记录、撤销/重做、刷新回放、删除还原。
 * 运行方式：
 *   NODE_PATH=/path/to/node_modules node wt-iconfont.cjs
 *   NODE_PATH=/path/to/node_modules node wt-iconfont.cjs --url=https://example.com/wego-app/index.html
 */
const { chromium } = require('playwright');

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

function getIconClass(className) {
  return String(className || '').split(/\s+/).find(c => /^icon-[A-Za-z0-9_-]+$/.test(c)) || '';
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: Number(args.width) || 1280, height: Number(args.height) || 960 },
    cacheDisabled: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message.slice(0, 200)));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text().slice(0, 200));
  });

  try {
    await page.goto(BASE + '?t=' + Date.now(), { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter(key => key.startsWith('wego.walkthrough.data.'))
        .forEach(key => localStorage.removeItem(key));
    });
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);

    await page.evaluate(() => {
      document.querySelector('wego-walkthrough').shadowRoot.querySelector('[data-fab-btn]').click();
    });
    await page.waitForTimeout(400);

    const iconPoint = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('.searchbox__icon.wego-iconfont-s'))
        .find(node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    if (!iconPoint) throw new Error('未找到可见 iconfont 测试元素');
    await page.mouse.click(iconPoint.x, iconPoint.y);
    await page.waitForTimeout(450);

    const selected = await page.evaluate(() => {
      const app = document.querySelector('wego-walkthrough');
      const panel = app.shadowRoot.querySelector('wego-wt-style-panel');
      const el = panel && panel._targetEl;
      if (el) el.classList.add('icon-action');
      return {
        selected: !!el && el.classList.contains('wego-iconfont-s'),
        className: el ? el.className : '',
        trigger: !!panel?.shadowRoot?.querySelector('[data-action="iconfont"]'),
      };
    });
    const originalClass = getIconClass(selected.className);
    check('选中 iconfont 后仍打开样式面板', selected.selected, selected.className);
    check('标题栏右侧显示图标入口', selected.trigger, `current=${originalClass}`);

    const panelInfo = await page.evaluate(() => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      const root = panel.shadowRoot;
      root.querySelector('[data-action="iconfont"]').click();
      const picker = root.querySelector('[data-iconfont-panel]');
      const options = Array.from(root.querySelectorAll('[data-iconfont-class]'));
      const onlyGlyphs = options.every(btn => btn.children.length === 1 && btn.firstElementChild.tagName === 'SPAN');
      picker.scrollTop = picker.scrollHeight;
      return {
        open: !picker.hidden,
        count: options.length,
        scrollable: picker.scrollHeight > picker.clientHeight && picker.scrollTop > 0,
        onlyGlyphs,
      };
    });
    check('图标面板展开并只显示图标', panelInfo.open && panelInfo.onlyGlyphs, JSON.stringify(panelInfo));
    check('图标面板包含完整图标目录', panelInfo.count >= 400, `count=${panelInfo.count}`);
    check('图标面板支持滚动查看', panelInfo.scrollable, `count=${panelInfo.count}`);
    if (args.screenshot) await page.screenshot({ path: args.screenshot });

    await page.evaluate(() => {
      const root = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel').shadowRoot;
      root.querySelector('.iconfont-option.is-current').click();
    });
    await page.waitForTimeout(400);
    const sameIcon = await page.evaluate(() => {
      const records = Object.keys(localStorage)
        .filter(key => key.startsWith('wego.walkthrough.data.'))
        .flatMap(key => {
          try { return JSON.parse(localStorage.getItem(key) || '{}').changes || []; } catch (e) { return []; }
        });
      return records.filter(record => record.property === 'icon-class').length;
    });
    check('重复选择当前图标不产生修改记录', sameIcon === 0, `records=${sameIcon}`);

    await page.evaluate(() => {
      const root = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel').shadowRoot;
      root.querySelector('[data-action="iconfont"]').click();
    });

    const replacement = await page.evaluate((oldClass) => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      const option = Array.from(panel.shadowRoot.querySelectorAll('[data-iconfont-class]'))
        .find(btn => btn.dataset.iconfontClass !== oldClass);
      if (!option) return '';
      const next = option.dataset.iconfontClass;
      option.click();
      return next;
    }, originalClass);
    await page.waitForTimeout(500);
    const replaced = await page.evaluate(({ originalClass, replacement }) => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      const el = panel._targetEl;
      const key = Object.keys(localStorage).find(k => k.startsWith('wego.walkthrough.data.'));
      const data = key ? JSON.parse(localStorage.getItem(key) || '{}') : {};
      const record = (data.changes || []).find(c => c.property === 'icon-class');
      return {
        hasNew: el.classList.contains(replacement),
        noOld: !el.classList.contains(originalClass),
        baseKept: el.classList.contains('wego-iconfont-s'),
        businessKept: el.classList.contains('icon-action'),
        pickerClosed: panel.shadowRoot.querySelector('[data-iconfont-panel]').hidden,
        record,
      };
    }, { originalClass, replacement });
    check('点击图标后只替换 iconfont 类', replaced.hasNew && replaced.noOld && replaced.baseKept && replaced.businessKept, `${originalClass}→${replacement}`);
    check('替换后图标面板关闭', replaced.pickerClosed, 'closed');
    check('替换值写入修改记录', !!replaced.record && replaced.record.oldValue === originalClass && replaced.record.newValue === replacement,
      replaced.record ? `${replaced.record.oldValue}→${replaced.record.newValue}` : '无记录');
    check('图标类未写入元素定位选择器', !!replaced.record && !replaced.record.selector.includes(originalClass) && !replaced.record.selector.includes(replacement),
      replaced.record ? replaced.record.selector : '无记录');

    const recordUi = await page.evaluate(({ originalClass, replacement }) => {
      const app = document.querySelector('wego-walkthrough');
      const overview = app.shadowRoot.querySelector('wego-wt-overview-panel');
      const key = Object.keys(localStorage).find(k => k.startsWith('wego.walkthrough.data.'));
      const data = key ? JSON.parse(localStorage.getItem(key) || '{}') : {};
      overview.open(data.changes || [], data.sceneRoute || '', null, data.annotations || []);
      const rowText = overview.shadowRoot.querySelector('.change-row')?.textContent || '';
      const prompt = overview._buildPrompt();
      overview.close();
      return {
        rowOk: rowText.includes('图标') && rowText.includes(originalClass) && rowText.includes(replacement),
        promptOk: prompt.includes('替换图标') && prompt.includes(originalClass) && prompt.includes(replacement),
      };
    }, { originalClass, replacement });
    check('配置列表显示图标原值与新值', recordUi.rowOk, `${originalClass}→${replacement}`);
    check('复制施工单包含图标替换值', recordUi.promptOk, `${originalClass}→${replacement}`);

    await page.evaluate(() => {
      const root = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel').shadowRoot;
      root.querySelector('[data-action="undo"]').click();
    });
    await page.waitForTimeout(350);
    const undone = await page.evaluate(oldClass => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      return panel._targetEl.classList.contains(oldClass);
    }, originalClass);
    check('撤销恢复原图标', undone, originalClass);

    await page.evaluate(() => {
      const root = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel').shadowRoot;
      root.querySelector('[data-action="redo"]').click();
    });
    await page.waitForTimeout(500);
    const redone = await page.evaluate(nextClass => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      return panel._targetEl.classList.contains(nextClass);
    }, replacement);
    check('重做恢复新图标', redone, replacement);

    await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1600);
    const replayed = await page.evaluate(nextClass => {
      const icons = Array.from(document.querySelectorAll('.searchbox__icon.wego-iconfont-s'));
      const el = icons.find(node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
      const records = Object.keys(localStorage)
        .filter(key => key.startsWith('wego.walkthrough.data.'))
        .map(key => ({ key, data: JSON.parse(localStorage.getItem(key) || '{}') }));
      return {
        ok: !!el && el.classList.contains(nextClass),
        classes: icons.map(node => node.className),
        records: records.map(item => ({ key: item.key, changes: item.data.changes })),
      };
    }, replacement);
    check('刷新后回放已替换图标', replayed.ok, `${replacement} ${JSON.stringify(replayed)}`);

    await page.evaluate(() => {
      const app = document.querySelector('wego-walkthrough');
      app.shadowRoot.querySelector('[data-fab-btn]').click();
      app.shadowRoot.querySelector('[data-tool="overview"]').click();
      const overview = app.shadowRoot.querySelector('wego-wt-overview-panel');
      overview.shadowRoot.querySelector('[data-delete]').click();
    });
    await page.waitForTimeout(450);
    const deleted = await page.evaluate(oldClass => {
      const el = Array.from(document.querySelectorAll('.searchbox__icon.wego-iconfont-s'))
        .find(node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
      const changes = Object.keys(localStorage)
        .filter(key => key.startsWith('wego.walkthrough.data.'))
        .flatMap(key => {
          try { return JSON.parse(localStorage.getItem(key) || '{}').changes || []; } catch (e) { return []; }
        });
      return { restored: !!el && el.classList.contains(oldClass), remaining: changes.filter(c => c.property === 'icon-class').length };
    }, originalClass);
    check('删除修改项后还原原图标', deleted.restored && deleted.remaining === 0, JSON.stringify(deleted));

    await page.evaluate(() => {
      const app = document.querySelector('wego-walkthrough');
      const panel = app.shadowRoot.querySelector('wego-wt-style-panel');
      const el = document.querySelector('.album-feed__head');
      panel.openForElement(el, '.album-feed__head', '');
    });
    const nonIcon = await page.evaluate(() => {
      const panel = document.querySelector('wego-walkthrough').shadowRoot.querySelector('wego-wt-style-panel');
      return !panel.shadowRoot.querySelector('[data-action="iconfont"]');
    });
    check('非 iconfont 元素不显示图标入口', nonIcon, 'hidden');
  } catch (error) {
    check('脚本执行无异常', false, error.message.slice(0, 240));
  }

  check('全程无页面报错', errors.length === 0, errors.slice(0, 3).join(' | '));
  const failed = results.filter(result => !result.ok).length;
  console.log(`\n结果：${results.length - failed}/${results.length} 通过`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
