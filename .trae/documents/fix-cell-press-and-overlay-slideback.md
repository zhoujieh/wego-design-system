# Plan：修复 cell 点击态不可见与全屏模态侧滑闪烁

## Summary

上一轮修复引入了两个新问题，根因已通过代码确认：

1. **Cell 点击态不可见**：`app.css` 中的 `:active` 覆盖与 `components.css` 中的 `.is-pressed` 特异性相同 `(0,2,0)`，app.css 后加载获胜，导致触摸时按压态被覆盖为默认值。
2. **全屏模态侧滑后再次显示又自动退出**：`popstate` 调用 `closeOverlay(true)` 未传 animated 参数，仍添加 `--exit` 类播放 CSS 退场动画。

## 根因确认（代码证据）

### 问题 1：CSS 特异性冲突

```
components.css:303 → .cell--clickable:active,.cell--clickable.is-pressed{background:var(--bg-state-pressed)}
app.css:26        → .cell--clickable:active { background: var(--bg-surface); }  (在 @media (hover: none) 内)
```

- 触摸时 `:active` 和 `.is-pressed` 同时匹配
- 两者特异性均为 `(0,2,0)`
- app.css 后加载 → `:active` 覆盖获胜 → 背景为 `var(--bg-surface)`（默认值）→ 按压态不可见

### 问题 2：closeOverlay 仍有退场动画

```
app.js:239 → closeOverlay(true)  (仅 skipHistory=true，无 animated 参数)
closeOverlay 内 → panel.classList.add('app-overlay-panel--exit')
app.css:417 → .app-overlay-panel--exit { transition: transform 250ms; transform: translateY(100%); }
```

- iOS 侧滑返回触发 `popstate` → `closeOverlay(true)` → 添加 `--exit` 类
- CSS 退场动画 `translateY(100%)` 播放 → panel 先在原位重新出现再向下滑出

## Proposed Changes

### 1. `wego-app/css/app.css`：用 `:not(.is-pressed)` 限定 `:active` 覆盖

将 `@media (hover: none)` 块内所有 `:active` 选择器改为 `:active:not(.is-pressed)`：

**修改前**（app.css:26）：
```css
.cell--clickable:active { background: var(--bg-surface); }
```

**修改后**：
```css
.cell--clickable:active:not(.is-pressed) { background: var(--bg-surface); }
```

所有组件均按此模式修改。

**效果**：
- 触摸时 `.is-pressed` 存在 → `:not(.is-pressed)` 不匹配 → 覆盖不生效 → components.css 的按压态样式正常显示 ✓
- touchend 后 `.is-pressed` 移除 → 若 `:active` 残留 → `:not(.is-pressed)` 匹配 → 背景恢复默认 → 无残留 ✓

### 2. `wego-app/js/app.js`：`closeOverlay` 增加 `animated` 参数

```js
function closeOverlay(skipHistory, animated) {
  clearAllPressStates();
  if (overlayClosing) return;
  // ...
  if (panel && (isSheet || isFullScreenModal)) {
    // ... skipHistory 逻辑不变 ...

    if (animated === false) {
      // 无动画：直接清除（用于 popstate/侧滑返回）
      overlayLayer.hidden = true;
      overlayLayer.className = 'app-overlay-layer';
      overlayLayer.replaceChildren();
      overlayClosing = false;
      return;
    }

    overlayClosing = true;
    panel.classList.add('app-overlay-panel--exit');
    // ... 原有 transitionend 逻辑 ...
  }
}
```

### 3. `wego-app/js/app.js`：`popstate` 传 `animated=false`

```js
window.addEventListener('popstate', function () {
  if (overlayHistoryActive && !overlayLayer.hidden) {
    overlayHistoryActive = false;
    closeOverlay(true, false);  // ← 增加 false
  }
});
```

## 涉及修改的完整选择器/函数清单

### app.css `@media (hover: none)` 内（全部加 `:not(.is-pressed)`）：

- `.cell--clickable:active`
- `.form-body--clickable:active`、`.form-body__select:active`
- `.btn--strong:active`
- `.btn--medium:active`、`.btn--weak:active`、`.btn--danger:active`
- `.counter__btn:active`
- `.link:active`、`.link--inline:active`
- `.link--disabled:active`
- `.navbar__left-btn:active`、`.navbar__left-text:active`、`.navbar__action:active`
- `.bottom-nav__item:active`
- `.form-body__upload:active`、`.form-body__icon-action:active`
- `.icon-text-btn:active`、`.form-dropdown__item:active`
- `.host-shell-grid-entry:active`、`.host-shell-link-button:active`

### app.js：

- `closeOverlay(skipHistory)` → `closeOverlay(skipHistory, animated)`
- `popstate` 处理器：`closeOverlay(true)` → `closeOverlay(true, false)`

## Verification Steps

1. 移动端模拟打开页面，点击 cell 入口：触摸时按压态可见（背景变色）✓
2. 进入设置页后原入口无按压态残留 ✓
3. 打开全屏模态页面，侧滑返回：模态直接消失，无"先重新出现再滑出" ✓
4. 点击蒙层/取消按钮关闭模态：仍有正常向下滑出退场动画 ✓
5. Cell、按钮、navbar 返回按钮等按压态均正常可见 ✓
