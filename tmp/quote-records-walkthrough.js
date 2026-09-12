/* 阶段F 报价记录链路走查：保存弹窗 → 记录页搜索/删除/空态 → 记录再编辑 */
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:8788/index.html#/quote-export';
const results = [];
function check(name, ok, extra) {
  results.push((ok ? 'PASS' : 'FAIL') + ' | ' + name + (extra ? ' | ' + extra : ''));
  if (!ok) process.exitCode = 1;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. 选品页勾选两个商品并进入预览
  await page.locator('[data-quote-toggle][data-mode="product"]').first().click();
  await page.locator('[data-quote-toggle][data-mode="product"]').nth(1).click();
  await page.locator('[data-dom-id="quote-open-preview"]').click();
  await page.waitForTimeout(500);
  check('预览页打开', await page.locator('[data-dom-id="quote-title-input"]').count() === 1);

  // 2. 修改标题 → 返回 → 保存弹窗出现
  await page.locator('[data-dom-id="quote-title-input"]').fill('走查测试报价单');
  await page.locator('[data-dom-id="quote-preview-back"]').click();
  await page.waitForTimeout(400);
  const dialogTitle = await page.locator('.dialog__title').textContent().catch(() => '');
  check('退出弹「是否保存当前修改？」', dialogTitle.includes('是否保存当前修改'), dialogTitle);

  // 3. 点保存 → 记录写入 → 预览关闭
  await page.locator('.dialog__btn--confirm').click();
  await page.waitForTimeout(500);
  check('预览已关闭', await page.locator('[data-dom-id="quote-title-input"]').count() === 0);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('wego.quote.records') || '[]'));
  check('记录已写入 localStorage', stored.length === 1 && stored[0].title === '走查测试报价单', JSON.stringify(stored.map(r => r.title)));
  check('记录含 total/rowCount/rows', stored.length === 1 && stored[0].rowCount >= 2 && !!stored[0].total && Array.isArray(stored[0].rows));

  // 4. 打开报价记录页
  await page.locator('[data-dom-id="quote-records-entry"]').click();
  await page.waitForTimeout(500);
  check('记录页打开', await page.locator('.quote-records-modal').count() === 1);
  const cardMeta = await page.locator('.quote-record-card__meta').first().textContent().catch(() => '');
  check('卡片显示项数与总价', /项\s*·\s*¥/.test(cardMeta), cardMeta);
  const cardTime = await page.locator('.quote-record-card__time').first().textContent().catch(() => '');
  check('卡片显示更新时间', cardTime.includes('更新时间'), cardTime);
  check('有记录时显示删除入口', await page.locator('[data-dom-id="quote-records-delete-toggle"]').isVisible());

  // 5. 记录搜索：无匹配空态 / 恢复
  await page.locator('[data-dom-id="quote-records-search-input"]').fill('不存在的标题');
  await page.waitForTimeout(300);
  const emptyTitle = await page.locator('.quote-records-empty .result__title').textContent().catch(() => '');
  check('搜索无匹配「暂无相关结果」', emptyTitle === '暂无相关结果', emptyTitle);
  check('搜索无匹配保留搜索栏', await page.locator('.quote-records-toolbar').isVisible());
  await page.locator('[data-dom-id="quote-records-search-clear"]').click();
  await page.waitForTimeout(300);
  check('清除搜索恢复列表', await page.locator('.quote-record-card').count() === 1);

  // 6. 记录打开预览 → 再编辑 → 退出保存（更新同一条记录）
  await page.locator('[data-quote-record-open]').first().click();
  await page.waitForTimeout(500);
  check('记录进入预览编辑态', await page.locator('[data-dom-id="quote-title-input"]').count() === 1);
  const titleVal = await page.locator('[data-dom-id="quote-title-input"]').inputValue();
  check('预览载入记录标题', titleVal === '走查测试报价单', titleVal);
  await page.locator('[data-dom-id="quote-title-input"]').fill('走查测试报价单2');
  await page.locator('[data-dom-id="quote-preview-back"]').click();
  await page.waitForTimeout(400);
  await page.locator('.dialog__btn--confirm').click();
  await page.waitForTimeout(500);
  const stored2 = await page.evaluate(() => JSON.parse(localStorage.getItem('wego.quote.records') || '[]'));
  check('编辑后更新同一条记录', stored2.length === 1 && stored2[0].title === '走查测试报价单2', JSON.stringify(stored2.map(r => r.title)));

  // 7. 删除模式：勾选 → 确认弹窗 → 删除 → 空态隐藏搜索
  await page.locator('[data-dom-id="quote-records-delete-toggle"]').click();
  await page.waitForTimeout(300);
  check('删除模式左上「取消」', await page.locator('[data-dom-id="quote-records-cancel"]').isVisible());
  await page.locator('[data-quote-record-card]').first().click();
  await page.waitForTimeout(300);
  check('勾选后批量删除条计数', (await page.locator('[data-role="quote-records-delete-count"]').textContent()).includes('1'), '');
  await page.locator('[data-dom-id="quote-records-delete-confirm"]').click();
  await page.waitForTimeout(400);
  const delDialogTitle = await page.locator('.dialog__title').textContent().catch(() => '');
  check('删除确认弹窗出现', delDialogTitle.includes('确认删除'), delDialogTitle);
  await page.locator('.dialog__btn--danger').click();
  await page.waitForTimeout(500);
  const emptyAfter = await page.locator('.quote-records-empty .result__title').textContent().catch(() => '');
  check('删除后「暂无报价记录」', emptyAfter === '暂无报价记录', emptyAfter);
  check('空记录隐藏搜索整栏', !(await page.locator('.quote-records-toolbar').isVisible()));
  check('空记录隐藏删除入口', !(await page.locator('[data-dom-id="quote-records-delete-toggle"]').isVisible()));

  // 8. 关闭记录页
  await page.locator('[data-dom-id="quote-records-back"]').click();
  await page.waitForTimeout(300);
  check('记录页可关闭', await page.locator('.quote-records-modal').count() === 0);

  // 9. 修改语言也计为改动（回到预览改语言后退出应弹保存）
  await page.locator('[data-quote-toggle][data-mode="product"]').first().click();
  await page.locator('[data-dom-id="quote-open-preview"]').click();
  await page.waitForTimeout(500);
  await page.locator('[data-dom-id="quote-language-button"]').click();
  await page.waitForTimeout(300);
  await page.locator('[data-role="quote-language-option"][data-lang="en"]').click();
  await page.waitForTimeout(1500);
  await page.locator('[data-dom-id="quote-preview-back"]').click();
  await page.waitForTimeout(400);
  const dialogAfterLang = await page.locator('.dialog__title').textContent().catch(() => '');
  check('切语言后退出弹保存确认', dialogAfterLang.includes('是否保存当前修改'), dialogAfterLang);
  await page.locator('.dialog__btn--dismiss').click();
  await page.waitForTimeout(400);
  const storedFinal = await page.evaluate(() => JSON.parse(localStorage.getItem('wego.quote.records') || '[]'));
  check('「不保存」不写入记录', storedFinal.length === 0, 'records=' + storedFinal.length);

  const realErrors = errors.filter((e) => !e.includes('translate.googleapis') && !e.includes('Failed to load resource') && !e.includes('net::'));
  check('无页面运行时错误', realErrors.length === 0, realErrors.slice(0, 3).join(' || '));

  console.log(results.join('\n'));
  await browser.close();
})().catch((e) => { console.log(results.join('\n')); console.error('WALKTHROW ERROR:', e); process.exit(1); });
