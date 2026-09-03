# 走查工具测试环境

## 运行方式
```bash
# 在含 node_modules 的 worktree（通常主 worktree /Users/dk/Documents/code/wego-design-system）
cd /Users/dk/Documents/code/wego-design-system
NODE_PATH=/Users/dk/Documents/code/wego-design-system/node_modules node /path/to/wt-script.js
```
Playwright 依赖装在主 worktree `node_modules`（1.62.0）。测试脚本可放任意目录，用 NODE_PATH 指向主 worktree 的 node_modules。

## 被测地址
- 本地：`http://localhost:8092/wego-app/index.html`（预览服务由任务 worktree 启动，端口见 `.tasks/preview-servers/` 记录）
- 在线：`https://zhoujieh.github.io/wego-design-system/previews/pr-{N}/`（PR 部署产物）

## 常用参数
```js
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 960 }, cacheDisabled: true });
const page = await ctx.newPage();
page.on('pageerror', e => errors.push(e.message));
await page.goto(url + '?t=' + Date.now(), { waitUntil: 'networkidle' });
```

## 关键注意事项
- 进入走查前等页面渲染：`waitForTimeout(1000)`。
- 样式面板 fixed 定位，交互前 `scrollIntoView({block:'center'})`。
- 撤销/重做/颜色等通过 `page.evaluate` 操作 shadowRoot 内元素并手动 dispatch 事件（`new Event('change', {bubbles:true})`）最稳定。
- 断言元素实际样式用 `getComputedStyle(panel._targetEl)`，不要只看面板 input 值。
