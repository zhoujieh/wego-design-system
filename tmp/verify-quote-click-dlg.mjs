import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));

  await page.goto('http://127.0.0.1:8788/index.html#/quote-export');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(800);

  await page.locator('[data-quote-toggle][data-mode="product"]').first().click({ timeout: 5000 });
  console.log('第一次点击成功');
  await page.waitForTimeout(300);

  const state = await page.evaluate(() => {
    const hosts = Array.from(document.querySelectorAll('[data-dialog-host], .app-dialog-host'));
    return {
      hostTexts: hosts.map((h) => h.innerText),
      hostHtml: hosts.map((h) => h.innerHTML.slice(0, 600)),
    };
  });
  console.log('DIALOG_TEXT:', JSON.stringify(state.hostTexts, null, 2));
  console.log('DIALOG_HTML:', JSON.stringify(state.hostHtml, null, 2));
  await page.screenshot({ path: '/Users/baobei/CODE/wego-design-system/tmp/quote-after-first-click.png' });
  await browser.close();
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
