# Plan：修复移动端点击态残留与侧滑返回闪烁问题

## Summary

优化点击态后，在「我的 → 设置」入口出现两个移动端触控问题：

1. **入口点击态残留**：点击设置入口进入设置页后，原入口仍保持 `is-pressed` 的按压背景。
2. **侧滑返回闪烁/二次退出**：在设置页从屏幕最左边缘侧滑返回时，页面会先向右退出，紧接着又从右侧重新进入，然后再退出；点击导航返回按钮则正常。

根据用户补充的关键信息——**未做点击态优化时侧滑返回正常**——问题 2 的根因应指向点击态优化引入的 JS 触摸处理与 iOS 侧滑返回手势产生竞态。本方案聚焦两件事：

- **状态兜底清理**：在页面切换关键路径强制清除所有 `is-pressed`，解决入口残留。
- **抑制滑动后的幽灵点击**：在全局触控管理中识别出有移动的触摸序列，并在其触发的 `click` 到达可点击元素前阻止它，避免侧滑返回被误识别为再次点击设置入口。

---

## Current State Analysis

### 相关文件与逻辑

| 文件 | 作用 |
|------|------|
| `wego-app/js/app.js` | 全局触控按压态管理器 `initTouchPressState`；push 场景栈、hashchange 路由、`popSceneLayer`/`openPushScene`/`clearSceneLayer`/`setActiveTab` 等 |
| `wego-app/css/app.css` | 场景进入/退出动画：`app-scene-layer__panel--enter`、`app-scene-layer__panel--exit` |
| `wego-app/lib/components.css` | `.cell--clickable.is-pressed` 等按压态样式 |
| `wego-app/scenes/系统设置/scene.js` | 设置页模板，内部入口均使用 `.cell--clickable`；返回按钮调用 `ctx.back()` |
| `wego-app/js/routes.js` | `my-system-settings` 等路由配置；设置入口挂载在宿主 `my-settings` 分组 |

### 问题 1：入口点击态残留根因

全局按压态管理器当前仅在 `touchend` / `touchcancel` / `touchmove` 超出阈值时移除 `is-pressed`。

移动端标准顺序为 `touchstart → touchend → click`，`clearPress` 理论上在 `click` 前执行。但以下场景会导致清理未命中原入口：

- `click` 触发 `navigate` → `hashchange` → `openPushScene` 同步插入新 scene panel；
- 随后 `touchend` 的 `event.target` 可能已漂移到新覆盖层，或者 `pressedEl` 引用被提前清空；
- 结果原入口按钮仍保留 `is-pressed`，返回宿主页时仍显示按压背景。

### 问题 2：侧滑返回「退出→重新进入→再退出」根因

用户明确侧滑起点为**屏幕最左边缘**，现象为**设置页退出 → 重新进入 → 再退出**。

未做点击态优化时侧滑正常，说明 iOS 系统侧滑手势本身与当前路由/动画机制兼容。引入点击态优化后，全局 `touchstart`/`touchmove`/`touchend` 监听会完整参与侧滑返回的触摸序列：

1. 手指从屏幕最左边缘向右滑动，触发 `touchstart`、`touchmove`、`touchend`；
2. iOS 识别为系统侧滑返回，系统动画将设置页推出，同时 `history.back()` 使 hash 变空；
3. `touchend` 之后浏览器仍可能向当前坐标派发一个延迟/幽灵 `click`；
4. 此时设置页已被系统动画移出，该坐标下的最上层元素变成宿主页面的「设置」入口；
5. `click` 触发 `navigate('my-system-settings')` → 设置页重新进入；
6. 紧接着侧滑返回触发的 `hashchange` 又调用 `popSceneLayer`，将刚进入的设置页再次关闭。

视觉结果即为「退出 → 重新进入 → 再退出」。

点击导航返回按钮时不存在系统侧滑手势，也就没有后续幽灵 `click`，因此表现正常。

---

## Proposed Changes

### 1. `wego-app/js/app.js`：页面切换时强制清理所有 `is-pressed`

**What/How：**

在 `initTouchPressState` 内部新增一个清理函数 `clearAllPressStates()`：

```js
function clearAllPressStates() {
  document.querySelectorAll('.is-pressed').forEach(function (el) {
    el.classList.remove('is-pressed');
  });
  pressedEl = null;
}
```

在以下关键路径开头调用：

- `openPushScene(scene)`：进入新场景前清理旧按压态。
- `popSceneLayer(...)`：返回时清理当前场景的按压态。
- `clearSceneLayer()`：切 Tab / 打开 overlay 前清理。
- `setActiveTab(tab)`：切换 Tab 前清理。
- `openOverlay(...)`：打开弹窗前清理。
- `closeOverlay(...)`：关闭弹窗前清理。

同时在 `visibilitychange` 中兜底：

```js
document.addEventListener('visibilitychange', function () {
  if (document.hidden) clearAllPressStates();
});
```

**Why：**

无论 `touchend` 是否因时序错乱/目标漂移而遗漏，进入新页面或切页后都不应保留旧按压态。兜底清理保证交互状态与视觉一致。

---

### 2. `wego-app/js/app.js`：抑制滑动产生的幽灵点击

**What/How：**

扩展 `initTouchPressState`，为每个触摸序列记录是否发生过有效移动；在 `touchend` 时设置抑制标志，并在 `click` 捕获阶段阻止该次点击。

伪代码：

```js
(function initTouchPressState() {
  if (!('ontouchstart' in window)) return;

  // ... pressSelector、pressedEl、startX/Y 等原有变量 ...
  var activeTouch = null;
  var suppressNextClick = false;
  var moveThreshold = 10;

  function clearPress() { /* 原有实现 */ }
  function clearAllPressStates() { /* 如上 */ }

  document.addEventListener('touchstart', function (event) {
    var touch = event.touches && event.touches[0];
    if (!touch) return;

    activeTouch = { x: touch.clientX, y: touch.clientY };
    suppressNextClick = false;

    var target = findPressTarget(event.target);
    if (!target) return;
    clearPress();
    target.classList.add('is-pressed');
    pressedEl = target;
    startX = touch.clientX;
    startY = touch.clientY;
  }, { passive: true, capture: true });

  document.addEventListener('touchmove', function (event) {
    var touch = event.touches && event.touches[0];
    if (!touch || !activeTouch) return;

    if (Math.abs(touch.clientX - activeTouch.x) > moveThreshold ||
        Math.abs(touch.clientY - activeTouch.y) > moveThreshold) {
      activeTouch.moved = true;
      clearPress();
    }
  }, { passive: true, capture: true });

  document.addEventListener('touchend', function () {
    clearPress();
    if (activeTouch && activeTouch.moved) {
      suppressNextClick = true;
    }
    activeTouch = null;
  }, { passive: true, capture: true });

  document.addEventListener('touchcancel', function () {
    clearPress();
    activeTouch = null;
    suppressNextClick = false;
  }, { passive: true, capture: true });

  document.addEventListener('click', function (event) {
    if (suppressNextClick) {
      suppressNextClick = false;
      event.preventDefault();
      event.stopPropagation();
    }
  }, { capture: true });
})();
```

**Why：**

- 正常点击：手指基本不动，`activeTouch.moved` 为 `false`，`click` 正常响应。
- 侧滑返回/滚动/拖动：手指明显移动，`activeTouch.moved` 为 `true`，随后产生的幽灵 `click` 在捕获阶段被阻止，不会误触发设置入口或返回按钮。
- 这是最小侵入式修复，只影响由触摸滑动派生的 `click`，不影响鼠标、键盘等其他输入方式。

---

### 3. `wego-app/js/app.js`：`popSceneLayer` 增加防重复调用保护

**What/How：**

在 `popSceneLayer` 开头增加状态检查，避免系统侧滑与代码返回重复执行导致栈混乱：

```js
function popSceneLayer(afterCallback) {
  var top = sceneStack[sceneStack.length - 1];
  if (!top) { ... }
  if (!top.host.parentNode || top.host.classList.contains('app-scene-layer__panel--exit')) {
    return;
  }
  // ... 原有退场动画逻辑 ...
}
```

**Why：**

即使幽灵点击问题未完全消除，也能保证同一张 scene panel 不会同时进入两次退场流程，避免「退出→再退出」类视觉异常。

---

### 4. 不改动文件（明确排除）

- `wego-app/css/app.css`：场景动画本身无问题，不修改。
- `wego-app/lib/components.css`：`.is-pressed` 样式正确，不修改。
- 各 `scene.js`：问题在全局触控管理层统一修复，不修改场景内部代码。

---

## Assumptions & Decisions

1. **幽灵点击是问题 2 的主要根因**：基于用户补充的「未优化时侧滑正常」以及「退出→重新进入→再退出」现象，推断侧滑返回后的延迟 `click` 重新命中了宿主页面设置入口。
2. **移动即非点击**：将发生过有效移动（>10px）的触摸序列后续产生的 `click` 视为误触并抑制，符合移动浏览器对滚动/滑动的常规处理心智。
3. **保留点击返回按钮动画**：显式点击返回按钮不走系统侧滑，没有幽灵 `click`，现有动画不受影响。
4. **兜底清理不影响正常反馈**：同一页面内的 `touchstart → touchend` 按压反馈链路保持不变；清理只发生在切页/弹窗/切 Tab 等状态转换点。
5. **Plan 阶段只写计划文件**：实施阶段再修改 `wego-app/js/app.js`。

---

## Verification Steps

1. 在移动端真机或 DevTools 移动模拟中打开 `wego-app/index.html`。
2. 进入「我的」Tab，点击「设置」入口进入系统设置页：
   - 入口在点击后应恢复正常背景，不应残留按压色。
3. 在设置页从屏幕最左边缘向右滑动返回：
   - 应只出现一次平滑的系统侧滑返回，不应看到设置页退出后又重新进入再退出。
4. 再次进入设置页，点击左上角返回按钮：
   - 仍应保留正常的 slide-left 退场动画。
5. 测试设置页内部可点击项（如「产品与笔记」）：
   - 点击进入后返回，原入口不应残留按压态；侧滑返回也不应误触重新打开页面。
6. 切换底部 Tab（动态/好友/工作台/消息/我的）：
   - 不应看到任何残留的按压态背景。
7. 验证正常点击仍然可用：
   - 设置入口、cell 行、按钮、底部 Tab 等正常轻触仍能进入对应页面。
