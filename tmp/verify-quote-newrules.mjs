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
  const records = () => page.evaluate(() => JSON.parse(localStorage.getItem('wego.quote.records') || '[]'));
  const savePromptVisible = () => page.evaluate(() => Array.from(document.querySelectorAll('[data-dialog-host] .dialog')).some((d) => (d.textContent || '').includes('是否保存当前修改')));

  /* 1. 预览返回（有改动）→ 无保存拦截，直接回选品页 */
  await page.locator('[data-quote-toggle][data-mode="product"]').first().click();
  await page.locator('[data-dom-id="quote-open-preview"]').click();
  await page.waitForTimeout(400);
  await page.locator('[data-dom-id="quote-title-input"]').fill('规则验证A');
  await page.locator('[data-dom-id="quote-preview-back"]').click();
  await page.waitForTimeout(400);
  out.backNoPrompt = !(await savePromptVisible());
  out.backNoPrompt_recordsUntouched = (await records()).length === 0;
  out.backToSelectPage = await page.locator('[data-dom-id="quote-open-preview"]').count();

  /* 2. 导出成功 → 记录写入 */
  await page.locator('[data-dom-id="quote-open-preview"]').click();
  await page.waitForTimeout(400);
  await page.locator('[data-dom-id="quote-share-main"]').click();
  await page.waitForTimeout(4000);
  out.exportDone = await page.locator('[data-dom-id="quote-export-done"]').count();
  await page.locator('[data-dom-id="quote-export-done"]').click();
  await page.waitForTimeout(400);
  const r1 = await records();
  out.exportWritesRecord = r1.length === 1 && r1[0].title === '规则验证A';

  /* 3. 记录再编辑 → 改标题 → 导出 → 更新同一条（不新增） */
  await page.locator('[data-dom-id="quote-records-entry"]').click();
  await page.waitForTimeout(600);
  out.recordsPageOpened = await page.locator('.quote-records-modal').count();
  out.recordsPageTransform = await page.evaluate(() => {
    const el = document.querySelector('.quote-records-modal .modal__panel');
    return el ? getComputedStyle(el).transform : null;
  });
  await page.locator('[data-quote-record-card]').first().click();
  await page.waitForTimeout(500);
  await page.locator('[data-dom-id="quote-title-input"]').fill('规则验证A-改');
  await page.locator('[data-dom-id="quote-share-main"]').click();
  await page.waitForTimeout(4000);
  await page.locator('[data-dom-id="quote-export-done"]').click();
  await page.waitForTimeout(400);
  const r2 = await records();
  out.reExportUpdatesSame = r2.length === 1 && r2[0].title === '规则验证A-改' && r2[0].id === r1[0].id;

  /* 4. 记录页返回（右侧滑出） */
  await page.locator('[data-dom-id="quote-records-entry"]').click();
  await page.waitForTimeout(600);
  await page.locator('[data-dom-id="quote-records-back"]').click();
  await page.waitForTimeout(600);
  out.recordsClosed = (await page.locator('.quote-records-modal').count()) === 0;

  out.jsErrors = errors;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
