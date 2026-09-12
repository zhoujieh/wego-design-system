import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const logs = [];
  page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') logs.push('CONSOLE: ' + m.text()); });

  await page.goto('http://127.0.0.1:8788/index.html#/quote-export');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(1000);

  const dlg = await page.evaluate(() => {
    const hosts = Array.from(document.querySelectorAll('[data-dialog-host], .app-dialog-host'));
    return hosts.map((h) => h.innerText).filter(Boolean);
  });
  console.log('DIALOGS:', JSON.stringify(dlg, null, 2));
  console.log('ERRORS:', JSON.stringify(logs, null, 2));
  await page.screenshot({ path: '/Users/baobei/CODE/wego-design-system/tmp/quote-load-dialog.png' });
  await browser.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
