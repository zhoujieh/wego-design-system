/* 现状核实：预览返回保存拦截 & 导出后报价记录写入（只读探测，不改动） */
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const logs = [];
  page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') logs.push('CONSOLE: ' + m.text()); });

  const url = 'http://127.0.0.1:8788/index.html#/quote-export';
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(800);

  const out = {};

  async function recordsCount() {
    return page.evaluate(() => (JSON.parse(localStorage.getItem('wego.quote.records') || '[]')).length);
  }
  async function dialogVisible() {
    return page.evaluate(() => {
      const hosts = Array.from(document.querySelectorAll('[data-dialog-host], .app-dialog-host'));
      for (const h of hosts) {
        const d = h.querySelector('.dialog');
        if (d && (d.textContent || '').includes('是否保存当前修改')) return 'save-prompt';
      }
      return null;
    });
  }

  /* 场景1：有改动时从预览返回 */
  try {
    await page.locator('[data-quote-toggle][data-mode="product"]').first().click({ timeout: 5000 });
  } catch (e) {
    const dlgText = await page.evaluate(() => Array.from(document.querySelectorAll('.app-dialog-host, [data-dialog-host]')).map((h) => h.innerText));
    console.log('INTERCEPT_DIALOG:', JSON.stringify(dlgText, null, 2));
    await page.screenshot({ path: '/Users/baobei/CODE/wego-design-system/tmp/quote-intercept.png' });
    /* 尝试关掉弹窗再继续 */
    const btn = page.locator('.app-dialog-host button, [data-dialog-host] button').first();
    if (await btn.count()) await btn.click();
    await page.locator('[data-quote-toggle][data-mode="product"]').first().click();
  }
  await page.locator('[data-quote-toggle][data-mode="product"]').nth(1).click();
  await page.waitForTimeout(200);
  out.recordsBefore = await recordsCount();
  await page.locator('[data-dom-id="quote-open-preview"]').click();
  await page.waitForTimeout(500);
  out.previewOpened = await page.locator('[data-dom-id="quote-title-input"]').count();
  await page.locator('[data-dom-id="quote-title-input"]').fill('自动化测试标题A');
  await page.waitForTimeout(200);
  await page.locator('[data-dom-id="quote-preview-back"]').click();
  await page.waitForTimeout(400);
  out.dialogAfterDirtyBack = await dialogVisible();
  /* 弹窗内点「保存」 */
  const saveBtn = page.getByText('保存', { exact: true }).last();
  if (out.dialogAfterDirtyBack === 'save-prompt') {
    await saveBtn.click();
    await page.waitForTimeout(400);
  }
  out.recordsAfterSaveExit = await recordsCount();

  /* 场景2：无改动直接导出 → 完成后记录数 */
  await page.locator('[data-quote-toggle][data-mode="product"]').first().click();
  await page.waitForTimeout(200);
  await page.locator('[data-dom-id="quote-open-preview"]').click();
  await page.waitForTimeout(500);
  await page.locator('[data-dom-id="quote-share-main"]').click();
  await page.waitForTimeout(4000); /* 等生成完成 */
  out.exportDoneVisible = await page.locator('[data-dom-id="quote-export-done"]').count();
  await page.locator('[data-dom-id="quote-export-done"]').click();
  await page.waitForTimeout(500);
  out.recordsAfterExport = await recordsCount();

  /* 场景3：有改动时导出完成 → 记录数 */
  await page.locator('[data-quote-toggle][data-mode="product"]').nth(2).click();
  await page.waitForTimeout(200);
  await page.locator('[data-dom-id="quote-open-preview"]').click();
  await page.waitForTimeout(500);
  await page.locator('[data-dom-id="quote-title-input"]').fill('自动化测试标题B');
  await page.locator('[data-dom-id="quote-share-main"]').click();
  await page.waitForTimeout(4000);
  await page.locator('[data-dom-id="quote-export-done"]').click();
  await page.waitForTimeout(500);
  out.recordsAfterDirtyExport = await recordsCount();

  out.jsErrors = logs;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
