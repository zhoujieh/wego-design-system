# 修复快捷发布退出后侧滑出现重复宿主容器的问题

## 问题总结

在手机端浏览器上，从"动态"宿主 Tab 点击"发布"按钮打开快捷发布页面，点击"取消"退出后，回到动态页面，继续侧滑会出现**同一个宿主页面看起来有两个容器**（iOS Safari 侧滑返回时的快照动画幻影）。

这是上一轮已经修过的老问题，但现在仍然存在。

## 根因分析

### 导航与 history 操作链路

快捷发布页面的 `presentation.type` 是 `full-screen-modal`，不是 `push`。打开和关闭时的 history 操作如下：

**打开流程：**

1. 用户点击"发布" → `WegoApp.navigate('quick-publish-product')`
2. `navigate` 设置 `window.location.hash = '#/quick-publish-product'` → 创建 **history 条目 H2**
3. `hashchange` → `openRoute` → `openOverlay('full-screen-modal', ...)`
4. `openOverlay` 调用 `pushOverlayHistoryState` → `history.pushState(...)` → 创建 **history 条目 H3**

此时 history 栈：
```
H1: 宿主页（无 hash）
H2: #/quick-publish-product（hash 导航条目）
H3: #/quick-publish-product + overlay state（overlay 条目）
```

**关闭流程（用户点"取消"，走 animated 路径）：**

1. `closeOverlay()` → `overlayHistoryActive = false` → `history.back()` → 弹出 H3，当前在 H2
2. 退场 CSS 动画开始
3. `transitionend` 回调中：
   - `overlayLayer.hidden = true`（隐藏浮层）
   - `history.replaceState(null, '', pathname + search)` → 把 H2 的 URL 从 `#/quick-publish-product` 改成无 hash

此时 history 栈：
```
H1: 宿主页（无 hash）
H2: 宿主页（无 hash）—— 替换后与 H1 完全相同的 URL
```

**问题发生：**

H1 和 H2 现在都是"宿主页 + 无 hash"，但它们是两条独立的 history 条目。用户在 H2 位置，侧滑时会触发 `history.back()` 回到 H1。iOS Safari 在侧滑时播放**系统级快照过渡动画**，H1 的快照和当前页面（H2）看起来一模一样，就出现了"两个宿主容器"的视觉效果。

### 同样问题也存在于侧滑关闭场景

如果用户不是点"取消"，而是直接侧滑返回：

1. iOS Safari 侧滑 → `history.back()` → 弹出 H3，回到 H2
2. `popstate` 事件 → `closeOverlay(true, false)`（skipHistory=true, animated=false）
3. 浮层直接隐藏，但 `!skipHistory` 为 false，**hash 清理代码被跳过**
4. H2 的 hash 还是 `#/quick-publish-product`，且与 H1 一起形成两个条目
5. 用户再次侧滑 → 回到 H1 → 同样出现重复快照

## 修复方案

**核心思路：用 `history.back()` 替换 `history.replaceState()`，真正弹出多余的历史条目，而不是只修改当前条目的 URL。**

修改文件：`wego-app/js/app.js`，涉及 `closeOverlay` 函数的 3 处改动。

### 改动 1：animated 退场路径（用户点"取消"）

**位置**：第 335-336 行，`transitionend` 回调内部

**现状**：
```js
if (!skipHistory && sceneStack.length === 0 && window.location.hash) {
  history.replaceState(null, document.title, window.location.pathname + window.location.search);
}
```

**改为**：
```js
if (!skipHistory && sceneStack.length === 0 && window.location.hash) {
  history.back();
}
```

此时浮层已经隐藏（`overlayLayer.hidden = true`），popstate handler 不会误触发。

### 改动 2：非 animated 退场路径，skipHistory=false（用户点"取消"但无动画的情况）

实际上这个路径在正常流程中不会走到（full-screen-modal 总是走 animated 路径），但为了一致性和防御性，同样修改。

**位置**：第 322-323 行

**现状**：
```js
if (!skipHistory && sceneStack.length === 0 && window.location.hash) {
  history.replaceState(null, document.title, window.location.pathname + window.location.search);
}
```

**改为**：
```js
if (!skipHistory && sceneStack.length === 0 && window.location.hash) {
  history.back();
}
```

### 改动 3：非 animated 退场路径，skipHistory=true（侧滑/系统返回键触发）

**位置**：第 322-324 行，移除 `!skipHistory` 条件，改为无条件处理

**现状**：
```js
if (animated === false) {
  overlayLayer.hidden = true;
  overlayLayer.className = 'app-overlay-layer';
  overlayLayer.replaceChildren();
  overlayClosing = false;
  if (!skipHistory && sceneStack.length === 0 && window.location.hash) {
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
  }
  return;
}
```

**改为**：
```js
if (animated === false) {
  overlayLayer.hidden = true;
  overlayLayer.className = 'app-overlay-layer';
  overlayLayer.replaceChildren();
  overlayClosing = false;
  if (sceneStack.length === 0 && window.location.hash) {
    if (skipHistory) {
      history.replaceState(null, document.title, window.location.pathname + window.location.search);
      setTimeout(function () { history.back(); }, 0);
    } else {
      history.back();
    }
  }
  return;
}
```

`skipHistory=true` 时通过 `setTimeout` 延迟执行 `history.back()`，因为此时正在 popstate handler 内部，直接调用 `history.back()` 可能导致浏览器行为异常。

## 修复后的 history 行为

**打开快捷发布：**
```
H1: 宿主页（无 hash）
H2: #/quick-publish-product
H3: overlay state
```

**关闭后（点"取消"）：**
```
H1: 宿主页（无 hash）
```
H2 被 `history.back()` 弹出，H3 被第一次 `history.back()` 弹出。只剩一条宿主条目，侧滑不会触发重复快照。

**关闭后（侧滑返回）：**
```
H1: 宿主页（无 hash）
```
H3 被系统侧滑弹出，H2 被 `setTimeout(history.back)` 弹出。同样只剩一条宿主条目。

## 验证步骤

1. 打开 `wego-app/index.html`
2. 切换到"动态" Tab
3. 点击右上角"发布"按钮，打开快捷发布页面
4. 点击"取消"退出 → 回到动态页面
5. 在手机端浏览器（或桌面端模拟器）尝试侧滑返回
6. 预期：侧滑不应出现"两个宿主容器"的视觉效果
7. 再次进入快捷发布 → 侧滑退出 → 侧滑返回：同样不应出现重复

## 影响范围

- 仅修改 `wego-app/js/app.js` 中的 `closeOverlay` 函数
- 影响所有 `full-screen-modal` 和 `sheet` 类型的 overlay 关闭行为
- 不影响 push 类型的场景导航
- 其他业务场景（系统设置、价格权限管理等）不涉及 overlay 关闭，不受影响
