import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const logs = [];
  page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));

  await page.goto('http://127.0.0.1:8788/index.html#/quote-export');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(800);

  // 尝试点击商品行，若被拦截则抓取弹窗内容
  try {
    await page.locator('[data-quote-toggle][data-mode="product"]').first().click({ timeout: 5000 });
    console.log('CLICK_OK: 未被拦截');
  } catch (e) {
    const dlg = await page.evaluate(() => {
      const hosts = Array.from(document.querySelectorAll('[data-dialog-host], .app-dialog-host'));
      return hosts.map((h) => ({ visible: h.offsetParent !== null, text: h.innerText }));
    });
    console.log('CLICK_BLOCKED');
    console.log('DIALOGS:', JSON.stringify(dlg, null, 2));
    await page.screenshot({ path: '/Users/baobei/CODE/wego-design-system/tmp/quote-blocked.png' });
  }
  console.log('ERRORS:', JSON.stringify(logs, null, 2));
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
