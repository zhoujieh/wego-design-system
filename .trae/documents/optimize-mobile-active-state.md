# 移动端点击态优化计划

## 1. 摘要

针对移动端 `cell`、`button`、`navbar`、`bottom-nav` 等可点击元素点击态不可见、反而出现浏览器默认灰色/深色高亮的问题，采用 **"CSS 兜底 + JS 显式按压类"** 双轨方案：

- 可点击元素统一加 `-webkit-tap-highlight-color: transparent`，消除截图中那种非规范的暗色/灰色背景。
- 可点击元素统一加 `touch-action: manipulation`，只消除可点击元素上的双击延迟，不影响滚动、双指缩放、长按文本选择等原生能力。
- 触控设备上通过 `wego-app/js/app.js` 在 `touchstart` 时给目标元素加 `.is-pressed`，与 `:active` 共用同一样式；`touchend`/`touchcancel`/滑出阈值时移除。
- `:hover` 全部包进 `@media (hover: hover)`，避免移动端 hover 粘滞。

> 用户已确认：只解决点击态问题，不禁用移动端浏览器双击放大、长按文本选择/拖杆控件等原生交互。

## 2. 当前状态

| 模块 | 状态 | 说明 |
|---|---|---|
| 8 个组件预览 CSS | 已完成 | `component-button.html`、`component-cell.html`、`component-navbar.html`、`component-bottom-nav.html`、`component-form.html`、`component-counter.html`、`component-image.html`、`component-link.html` 已添加 `-webkit-tap-highlight-color: transparent`、`touch-action: manipulation`、`.is-pressed` 同 `:active` 样式，并将 `:hover` 包进 `@media (hover: hover)`。 |
| 全局触控按压管理 | 已完成 | `wego-app/js/app.js` 已新增 `initTouchPressState`，事件委托监听 `touchstart`/`touchmove`/`touchend`/`touchcancel`，自动加/移除 `.is-pressed`。 |
| 宿主 App 局部样式 | 已完成 | `wego-app/css/app.css` 已为 `.host-shell-grid-entry`、`.host-shell-link-button` 补充按压态与 tap-highlight 清除。 |
| 聚合组件样式 | 已重新生成并同步 | `.codex/skills/wego-design/components.css` 已通过 `extract-components-css.mjs` 重新生成，并已 `cp` 到 `wego-app/lib/components.css`。 |
| 组件契约 | 待完成 | 8 个组件 JSON 契约尚未补充触控按压态说明。 |
| 设计系统版本号 | 待完成 | `metadata.json` 当前 `version: 313`，需递增至 `314`。 |
| 验证 | 待完成 | 需运行 `scripts/validate-wego-design.mjs` 并通过；需做本地预览验证。 |

## 3. 待完成变更

### 3.1 更新 8 个组件契约

在以下契约文件的 `behavior` 中新增 `pressFeedback` 字段（若已有 `active` 字段，则合并补充），内容统一为：

```text
移动端按压态由 :active 与 .is-pressed 共同承载。宿主 App 通过 wego-app/js/app.js 在触控设备上自动为 button、.btn、.cell--clickable、.navbar__left-btn、.navbar__action、.bottom-nav__item、.form-body--clickable、.counter__btn、.wg-image--clickable、.link 等可点击元素添加/移除 .is-pressed；桌面端继续由 :active 兜底。
```

受影响的契约文件：

- `.codex/skills/wego-design/components/button.json`
- `.codex/skills/wego-design/components/cell.json`
- `.codex/skills/wego-design/components/navbar.json`
- `.codex/skills/wego-design/components/bottom-nav.json`
- `.codex/skills/wego-design/components/form.json`
- `.codex/skills/wego-design/components/counter.json`
- `.codex/skills/wego-design/components/image.json`
- `.codex/skills/wego-design/components/link.json`

### 3.2 递增设计系统版本号

修改 `.codex/skills/wego-design/metadata.json`：

```json
"version": 314
```

### 3.3 重新生成并同步聚合样式（确认/补跑）

由于组件预览 CSS 已改，需确保聚合样式是最新的：

```bash
/Users/baobei/.nvm/versions/node/v24.16.0/bin/node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design
cp .codex/skills/wego-design/components.css wego-app/lib/components.css
```

> 本机 `node` 命令未在 PATH 中，必须使用绝对路径执行。

### 3.4 运行守门验证

```bash
/Users/baobei/.nvm/versions/node/v24.16.0/bin/node scripts/validate-wego-design.mjs
```

确保不报错；若存在与本次变更无关的既有债务警告，确认后记录即可。

### 3.5 本地预览验证

1. 在浏览器中直接打开 `wego-app/index.html`。
2. 打开 DevTools 移动端模拟（iPhone / Android 尺寸均可）。
3. 重点检查用户截图中出现问题的元素：
   - 二级页返回按钮 `.navbar__left-btn`
   - "设置"页 `.cell--clickable` 行
   - "退出登录" `.btn`
   - 底部 Tab `.bottom-nav__item`
   - "我的"页 grid 入口 `.host-shell-grid-entry`
4. 验证两点：
   - **不能出现**浏览器默认的深灰/灰色高亮背景；
   - **必须出现**设计规范按压态（cell 为 `var(--bg-state-pressed)`、按钮为对应强调色按压、navbar 操作区为 `opacity: 0.6`），松开或滑出后立即消失。
5. 切回桌面端鼠标点击同一批元素，`:active` 状态仍然可见，无退化。

## 4. 假设与决策

- **决策 1**：不删除 `:active`，让 `.is-pressed` 与其共用同一样式声明，保证桌面端和禁用 JS 的降级场景仍可用。
- **决策 2**：不使用 FastClick 等第三方库，用原生事件委托实现，体积最小。
- **决策 3**：按压移动阈值设为 10px，兼顾轻触和滚动容错。
- **决策 4**：`touch-action: manipulation` 只加在明确可点击的元素上，避免全局影响滚动体验；同时不会禁用双指缩放、长按文本选择等原生行为。
- **决策 5**：长按文本选择/拖杆控件、双指缩放、页面滚动等原生交互**不做限制**；JS touch handler 不调用 `preventDefault()`，也不额外添加 `user-select: none` 或 `user-scalable=no`。

## 5. 验证清单

- [ ] 8 个组件契约已补充 `pressFeedback` 说明。
- [ ] `.codex/skills/wego-design/metadata.json` 的 `version` 已改为 `314`。
- [ ] 已通过 `extract-components-css.mjs` 重新生成 `.codex/skills/wego-design/components.css`。
- [ ] 已将 `components.css` 同步拷贝到 `wego-app/lib/components.css`。
- [ ] `scripts/validate-wego-design.mjs` 运行通过。
- [ ] 本地移动端模拟预览中，点击态可见且无浏览器默认高亮。
- [ ] 桌面端鼠标点击 `:active` 态未退化。
