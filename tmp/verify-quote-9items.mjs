import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('http://127.0.0.1:8788/index.html#/quote-export');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(800);

  const out = {};
  /* 造一条 4 行商品的记录：选 4 个商品 → 预览 → 导出成功 */
  const toggles = page.locator('[data-quote-toggle][data-mode="product"]');
  for (let i = 0; i < 4; i++) { await toggles.nth(i).click(); await page.waitForTimeout(80); }
  await page.locator('[data-dom-id="quote-open-preview"]').click();
  await page.waitForTimeout(400);
  await page.locator('[data-dom-id="quote-share-main"]').click();
  await page.waitForTimeout(4000);
  out.exportDone = await page.locator('[data-dom-id="quote-export-done"]').count();
  await page.locator('[data-dom-id="quote-export-done"]').click();
  await page.waitForTimeout(400);

  /* 打开记录页核对 9 项 */
  await page.locator('[data-dom-id="quote-records-entry"]').click();
  await page.waitForTimeout(700);
  out.batchBtn = await page.evaluate(() => {
    const b = document.querySelector('[data-dom-id="quote-records-delete-toggle"]');
    return b ? { text: b.textContent.trim(), icon: (b.querySelector('i') || {}).className || '' } : null;
  });
  out.listPadding = await page.evaluate(() => {
    const el = document.querySelector('[data-role="quote-records-list"]');
    const cs = getComputedStyle(el);
    return [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' ');
  });
  out.toolbarPadding = await page.evaluate(() => getComputedStyle(document.querySelector('.quote-records-toolbar')).paddingBottom);
  out.scrollPaddingTop = await page.evaluate(() => getComputedStyle(document.querySelector('[data-role="quote-records-scroll"]')).paddingTop);

  /* 删除模式底栏 */
  await page.locator('[data-dom-id="quote-records-delete-toggle"]').click();
  await page.waitForTimeout(300);
  out.actionsPaddingBottom = await page.evaluate(() => {
    const el = document.querySelector('[data-role="quote-records-actions"]');
    return el ? getComputedStyle(el).paddingBottom : null;
  });
  out.barInner = await page.evaluate(() => {
    const el = document.querySelector('.quote-records-delete-bar .bottom-action-bar__inner');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { paddingLeft: cs.paddingLeft, bg: cs.backgroundColor };
  });
  /* 删除模式卡片应有勾选、无箭头；退出后卡片有四宫格+箭头 */
  out.deleteModeCard = await page.evaluate(() => {
    const card = document.querySelector('[data-quote-record-card]');
    return {
      hasCheckbox: Boolean(card.querySelector('[data-role="quote-record-check"]')),
      hasArrow: Boolean(card.querySelector('.cell__arrow')),
    };
  });
  await page.locator('[data-dom-id="quote-records-cancel"]').click();
  await page.waitForTimeout(300);
  out.normalCard = await page.evaluate(() => {
    const card = document.querySelector('[data-quote-record-card]');
    const grid = card.querySelector('.wg-image-grid--product');
    const cs = getComputedStyle(grid);
    return {
      hasGrid: Boolean(grid),
      itemCount: grid.querySelectorAll('.wg-image-grid__item').length,
      gridWidth: cs.width,
      hasArrow: Boolean(card.querySelector('.cell__arrow')),
    };
  });

  await page.screenshot({ path: '/Users/baobei/CODE/wego-design-system/tmp/quote-records-after-9items.png' });
  out.jsErrors = errors;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
