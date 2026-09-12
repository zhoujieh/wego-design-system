# Plan：修复点击态恢复时机过晚

## Summary

用户反馈：点击 cell 入口后，按压态没有在 `touchend`（手指抬起）时立即消失，而是持续到新页面进入的一瞬间才恢复默认。根因是 `touch-action: manipulation` 消除了 300ms 延迟，`click` 在 `touchend` 后立即触发 `navigate` → 页面切换，浏览器在 `click` 之前**没有机会重绘**，导致 `.is-pressed` 移除后的样式变化没有在视觉上反映。

## 根因分析（时序证据）

当前事件时序：

```
touchstart → JS 加 .is-pressed（按压态显示）
touchend   → clearPress() 移除 .is-pressed（DOM 已变，但浏览器未重绘）
click      → navigate() → hashchange → openPushScene()（页面切换）
           ↑ 浏览器在这里才有机会重绘，此时 .is-pressed 已被移除
           但 :active 伪类可能仍激活，且 components.css 的 :active 仍匹配
           → 视觉上按压态持续到页面进入
```

关键证据：
- 元素有 `touch-action: manipulation`（消除 300ms 延迟），`click` 紧跟 `touchend`
- `clearPress()` 在 touchend 的 capture 阶段执行，移除了 `.is-pressed` 类
- 但移动端 Safari 在 touchend 和 click 之间**不触发 paint**
- `:active` 伪类在 touchend 后可能仍持续，components.css 的 `:active` 样式仍在匹配
- 虽然 `:active:not(.is-pressed)` 特异性更高，但由于没有重绘机会，视觉上按压态持续到 `openPushScene` 触发重绘

## Proposed Changes

### 1. `wego-app/js/app.js`：touchend 时强制触发样式重新计算

在 `clearPress()` 中，移除 `.is-pressed` 类后调用 `getComputedStyle()` 强制浏览器同步重新计算样式：

**修改文件**：`wego-app/js/app.js`（`initTouchPressState` 内的 `clearPress` 函数）

```js
function clearPress() {
  if (pressedEl) {
    var el = pressedEl;
    el.classList.remove('is-pressed');
    // 强制同步样式重新计算，确保 :active:not(.is-pressed) 覆盖立即生效
    // 否则 touchend → click 之间无 paint 机会，按压态视觉上会持续到页面切换
    getComputedStyle(el).backgroundColor;
    pressedEl = null;
  }
}
```

**Why**：`getComputedStyle()` 会强制浏览器同步执行样式重新计算（style recalc），使 `.is-pressed` 移除后的样式变化立即被计算。配合 `:active:not(.is-pressed)` 的覆盖规则，元素的计算背景色立即变为默认值，即使后续 `click` 立即触发 `navigate`，浏览器在下一次 paint 时也会反映恢复后的样式。

### 2. `wego-app/css/app.css`：简化覆盖规则，增强可靠性

将 `:active:not(.is-pressed)` 简化为 `:active`（不带 `:not`），同时为 `.is-pressed` 用更高特异性确保按压态显示：

**修改文件**：`wego-app/css/app.css`（`@media (hover: none)` 块）

```css
@media (hover: none) {
  /* :active 直接覆盖为默认值（特异性 (0,2,0)） */
  .cell--clickable:active { background: var(--bg-surface); }
  .form-body--clickable:active,
  .form-body__select:active { background: var(--bg-surface); }
  .btn--strong:active { background: var(--bg-brand); }
  .btn--medium:active,
  .btn--weak:active,
  .btn--danger:active { background: var(--bg-overlay-l1); }
  .counter__btn:active { background: var(--bg-surface); }
  .link:active,
  .link--inline:active { background: transparent; }
  .link--disabled:active { background: transparent; }
  .navbar__left-btn:active,
  .navbar__left-text:active,
  .navbar__action:active,
  .bottom-nav__item:active,
  .form-body__upload:active,
  .form-body__icon-action:active,
  .icon-text-btn:active,
  .form-dropdown__item:active,
  .host-shell-grid-entry:active,
  .host-shell-link-button:active { opacity: 1; }

  /* .is-pressed 用更高特异性 (0,3,0) 确保按压态显示，胜过 :active (0,2,0) */
  .cell--clickable.cell--clickable.is-pressed { background: var(--bg-state-pressed); }
  .form-body--clickable.form-body--clickable.is-pressed,
  .form-body__select.form-body__select.is-pressed { background: var(--bg-state-pressed); }
  .btn--strong.btn--strong.is-pressed { background: var(--bg-brand-disabled); }
  .btn--medium.btn--medium.is-pressed,
  .btn--weak.btn--weak.is-pressed,
  .btn--danger.btn--danger.is-pressed { background: var(--bg-state-pressed); }
  .counter__btn.counter__btn.is-pressed { background: var(--bg-state-pressed); }
  .navbar__left-btn.navbar__left-btn.is-pressed,
  .navbar__left-text.navbar__left-text.is-pressed,
  .navbar__action.navbar__action.is-pressed,
  .bottom-nav__item.bottom-nav__item.is-pressed,
  .icon-text-btn.icon-text-btn.is-pressed,
  .form-dropdown__item.form-dropdown__item.is-pressed,
  .host-shell-grid-entry.host-shell-grid-entry.is-pressed,
  .host-shell-link-button.host-shell-link-button.is-pressed { opacity: 0.6; }
}
```

**Why**：
- `:active` 直接覆盖为默认值（特异性 (0,2,0)，app.css 后加载获胜）
- `.is-pressed` 用重复类名提高特异性到 (0,3,0)，确保触摸时按压态显示
- 比 `:not(.is-pressed)` 更可靠，不依赖 `:not()` 伪类的匹配时机

### 3. 不改动文件

- `wego-app/lib/components.css`：`:active, .is-pressed` 共用样式正确，不修改
- 各 `scene.js`：不修改

## 涉及修改的完整清单

### app.js

- `clearPress()` 函数：移除 `.is-pressed` 后增加 `getComputedStyle(el).backgroundColor;`

### app.css

- `@media (hover: none)` 块：
  - `:active:not(.is-pressed)` → `:active`（简化）
  - 新增 `.is-pressed` 用重复类名的规则（提高特异性）

## Assumptions & Decisions

1. **`getComputedStyle` 触发同步样式重新计算**：这是浏览器标准行为，读取计算样式会强制 style recalc。
2. **重复类名提高特异性**：`.cell--clickable.cell--clickable.is-pressed` 特异性 (0,3,0)，是常见的 CSS 特异性 hack，兼容所有浏览器。
3. **`:active` 覆盖不影响桌面端**：仅在 `@media (hover: none)` 内生效，桌面端 `:active` 仍由 components.css 控制。
4. **按压态显示逻辑不变**：touchstart 加 `.is-pressed`，touchend 移除，只是移除后强制重绘。

## Verification Steps

1. 移动端模拟打开页面，点击「设置」入口：
   - 触摸时按压态可见（背景变色）✓
   - **手指抬起时按压态立即消失**（不等页面进入）✓
2. 进入设置页后原入口无按压态残留 ✓
3. 侧滑返回正常（无闪烁）✓
4. 点击返回按钮仍有正常退场动画 ✓
5. 全屏模态侧滑返回无闪烁 ✓
6. Cell、按钮、navbar 返回按钮等按压态均正常可见 ✓
