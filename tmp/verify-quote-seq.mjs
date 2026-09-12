import { chromium } from 'playwright';

async function dumpDialogs(page, tag) {
  const s = await page.evaluate(() => {
    const hosts = Array.from(document.querySelectorAll('[data-dialog-host], .app-dialog-host'));
    return hosts.map((h) => h.innerText).filter((t) => t && t.trim());
  });
  if (s.length) {
    console.log('[' + tag + '] DIALOG:', JSON.stringify(s, null, 2));
    await page.screenshot({ path: '/Users/baobei/CODE/wego-design-system/tmp/quote-dlg-' + tag + '.png' });
  } else {
    console.log('[' + tag + '] 无弹窗');
  }
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));

  await page.goto('http://127.0.0.1:8788/index.html#/quote-export');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(800);

  await page.locator('[data-quote-toggle][data-mode="product"]').first().click({ timeout: 5000 });
  console.log('点击1成功');
  await dumpDialogs(page, 'after-click1');

  await page.locator('[data-quote-toggle][data-mode="product"]').nth(1).click({ timeout: 5000 });
  console.log('点击2成功');
  await dumpDialogs(page, 'after-click2');
  await browser.close();
})().catch(async (e) => {
  console.error('FATAL', e.message.split('\n')[0]);
  process.exit(1);
});
