# 修复侧滑返回后入口按压态残留问题

## 问题现象（用户最新反馈，修正后的理解）

点击入口（如设置入口）进入新页面后，**侧滑返回**时：
- 入口的点击态（按压态）还在显示
- 然后延迟恢复到默认状态

**对比**：
- 点击导航栏返回 → 不会这样
- 只有侧滑返回会这样

## 根因分析

### 1. 设置入口的 DOM 归属是关键

设置入口是 `.cell--clickable`（`cellEntryMarkup` 生成，[app.js:395-412](file:///Users/baobei/CODE/wego-design-system/wego-app/js/app.js#L395-412)），位于 host 页面（`[data-entry-group]` 容器内）。**host 页面永不从 DOM 移除。**

### 2. 导航栏返回 vs 侧滑返回的差异

| 路径 | 被点击元素 | 元素命运 | `:active` 残留是否可见 |
|------|-----------|----------|----------------------|
| 导航栏返回 | back 按钮（在 push 场景 panel 内） | `popSceneLayer` 调用 `top.host.remove()` 把 panel（含 back 按钮）从 DOM 移除 | 元素已不存在，无残留 |
| 侧滑返回 | 设置入口（在 host 页面内） | host 页面不移除，入口一直在 DOM | `:active` 卡住的元素仍可见 |

### 3. iOS Safari `:active` 卡住 bug

iOS Safari 在点击元素后立即触发 hash 变更 + scene panel 滑入覆盖时，`:active` 伪类状态（或对应的合成层缓存）会卡住，未被及时清除。

- `.is-pressed` 类已在原始 touchend 时被 `clearPress()` 移除（[app.js:601-607](file:///Users/baobei/CODE/wego-design-system/wego-app/js/app.js#L601-607)），残留视觉与 `.is-pressed` 无关
- CSS 覆盖 `:active` → 默认色（[app.css:29](file:///Users/baobei/CODE/wego-design-system/wego-app/css/app.css#L29)）从级联看是正确的，但对 iOS 合成层缓存的残留帧无能为力
- `clearPress()` 里的 `getComputedStyle` reflow 时机错位（在 touchend 时执行，但卡住是在 click → navigate 之后才发生）

### 4. 为什么"延迟恢复"

iOS 内部 `:active` 清除时机依赖下一次触摸或浏览器内部计时器。`clearAllPressStates` 只清类名，不清伪类，所以"恢复"是 iOS 内部时序决定的，表现为延迟。

## 修复方案

**核心思路**：在侧滑返回路径（`popSceneLayer` 的 `animated === false` 分支）和 forward 导航路径（`openPushScene`），用 JS 强制重绘 host 入口，触发合成层重建，丢弃旧按压帧；并用 `blur()` 促使 iOS 清除 `:active` 状态。

### 修改文件 1：`wego-app/js/app.js`

#### 改动 1：新增辅助函数 `forceHostEntriesRepaint()`

在 `clearAllPressStates` 定义附近（[app.js:557-564](file:///Users/baobei/CODE/wego-design-system/wego-app/js/app.js#L557-564) 之后）新增：

```js
// 强制重绘 host 页面入口，清除 iOS Safari 可能残留的 :active 合成层缓存
// 用于侧滑返回后 / forward 导航时，触发合成层重建，丢弃旧按压帧
function forceHostEntriesRepaint(targetEl) {
  if (targetEl) {
    // 精准重绘单个元素（forward 导航时 pressedEl 已知）
    try { targetEl.blur(); } catch (e) {}
    void targetEl.offsetWidth;  // 强制 layout，触发合成层重建
    return;
  }
  // 兜底：重绘所有 host 入口（侧滑返回时 pressedEl 已清空）
  var entries = document.querySelectorAll('[data-entry-group] [data-route-id]');
  for (var i = 0; i < entries.length; i++) {
    var el = entries[i];
    try { el.blur(); } catch (e) {}
    void el.offsetWidth;
  }
}
```

**说明**：
- `el.blur()`：促使 iOS Safari 清除 `:active` 伪类状态
- `void el.offsetWidth`：读取布局属性，强制浏览器执行 layout（reflow），触发合成层重建，丢弃缓存的旧按压帧
- 查询范围 `[data-entry-group] [data-route-id]`：只覆盖 host 页面的路由入口（不含 scene panel 内的元素，因为 panel 已移除）

#### 改动 2：`openPushScene` 中 forward 预防

修改 [app.js:202-219](file:///Users/baobei/CODE/wego-design-system/wego-app/js/app.js#L202-219) 的 `openPushScene`：

```js
function openPushScene(scene) {
  // 保存 pressedEl 引用，clearAllPressStates 会清空它
  var entryEl = pressedEl;
  clearAllPressStates();
  var presentation = normalizePresentation(scene);
  sceneLayer.hidden = false;
  sceneLayer.className = 'app-scene-layer';
  sceneLayer.classList.toggle('app-scene-layer--cover-tab', presentation.coversTabBar);

  // 为新场景创建独立的栈层 panel
  var panel = document.createElement('div');
  panel.className = 'app-scene-layer__panel app-scene-layer__panel--enter';
  if (presentation.coversTabBar) panel.classList.add('app-scene-layer__panel--cover-tab');
  renderTemplate(panel, scene.template);
  sceneLayer.appendChild(panel);

  // scene panel 已覆盖 host，此时 host 不可见，对原入口强制重绘
  // 预防 iOS Safari :active 卡住导致的侧滑返回按压态残留
  // 此时 reflow 安全无闪烁（host 被 scene panel 遮挡）
  if (entryEl) {
    forceHostEntriesRepaint(entryEl);
  }

  sceneStack.push({ routeId: scene.routeId, host: panel, scene: scene });
  appState.currentRouteId = scene.routeId;
  if (typeof scene.init === 'function') scene.init(sceneContext(scene, panel));
}
```

**为什么有效**：
- `sceneLayer.appendChild(panel)` 之后，scene panel 开始滑入覆盖 host
- 此时对 host 入口做 reflow，把"默认态"锁进合成层，避免覆盖期间保留旧按压帧
- reflow 时机在 host 不可见时，不会引起视觉闪烁

#### 改动 3：`popSceneLayer` 的 `animated === false` 分支兜底

修改 [app.js:131-143](file:///Users/baobei/CODE/wego-design-system/wego-app/js/app.js#L131-143) 的 `popSceneLayer` 无动画分支：

```js
if (animated === false) {
  // 无动画：直接移除 panel（用于 hashchange/侧滑返回，系统动画已完成）
  top.host.remove();
  sceneStack.pop();
  if (sceneStack.length === 0) {
    sceneLayer.hidden = true;
    sceneLayer.className = 'app-scene-layer';
    appState.currentRouteId = '';
  } else {
    appState.currentRouteId = sceneStack[sceneStack.length - 1].routeId;
  }
  // 侧滑返回后，host 页面重新可见，强制重绘入口
  // 清除 iOS Safari 可能残留的 :active 合成层缓存，避免按压态视觉残留
  forceHostEntriesRepaint();
  if (typeof afterCallback === 'function') afterCallback();
  return;
}
```

**为什么有效**：
- `top.host.remove()` 之后，scene panel 已移除，host 页面重新可见
- 此时对 host 入口做 reflow，触发合成层重建，丢弃缓存的旧按压帧
- iOS 侧滑返回的系统动画已完成，host 页面稳定，reflow 应即时无闪烁

### 不需要修改的文件

- **`wego-app/css/app.css`**：当前 `@media (hover: none)` 块的 `:active` 覆盖和 `.is-pressed` 重复类名规则（特异性 (0,3,0)）是正确的，保留不变。问题不在 CSS 级联，而在 iOS 合成层缓存，需要 JS 强制重绘。
- **`wego-app/lib/components.css`**：设计系统本体，不修改。

## 假设与决策

### 决策 1：为什么用 `void el.offsetWidth` 而非 `getComputedStyle`

- `getComputedStyle(el).backgroundColor` 主要触发 style recalc，在样式有变化时有效（如 `clearPress` 里移除 `.is-pressed` 后）
- 侧滑返回时 `.is-pressed` 早已移除，样式无变化，`getComputedStyle` 可能不触发 reflow
- `void el.offsetWidth` 强制读取布局属性，必定触发 layout（reflow），更强力地触发合成层重建

### 决策 2：为什么保留 `@media (hover: none)` 限定

- 不移出 `@media (hover: none)`，因为无条件覆盖会破坏桌面端 `:active` 按压反馈
- 桌面端依赖 `:active`（无 touch 事件，`.is-pressed` 不会被添加）
- 移出媒体查询会让桌面端点击 cell 无按压反馈

### 决策 3：为什么 forward 和侧滑返回都加 reflow

- forward 预防（`openPushScene`）：在 host 不可见时 reflow，把默认态锁进合成层，从源头预防
- 侧滑返回兜底（`popSceneLayer` animated=false）：在 host 重新可见时 reflow，触发合成层重建，丢弃残留帧
- 双保险：如果 forward 预防失效，侧滑返回兜底仍能修复

### 决策 4：为什么用 `blur()`

- iOS Safari 上 `blur()` 有时能促使浏览器清除元素的 `:active` 伪类状态
- 与 reflow 配合，从伪类状态 + 合成层两个层面清除残留
- `try/catch` 包裹，避免在不支持 `blur` 的元素上报错

## 验证步骤

### 1. 静态验证（subagent 浏览器）

- 部署后用 subagent 浏览器访问 wego-app
- 模拟触控设备（`@media (hover: none)` 生效）
- 点击设置入口 → 进入系统设置页
- 检查设置入口的 `.is-pressed` 是否已移除（应已移除）
- 模拟侧滑返回（`history.back()` 触发 hashchange → `popSceneLayer(null, false)`）
- 检查返回后设置入口的背景色是否为默认色（`rgb(255, 255, 255)`），非按压色（`rgba(32, 47, 100, 0.06)`）

### 2. 真机验证（用户执行）

- 在 iOS Safari 真机上打开 wego-app
- 点击设置入口 → 进入系统设置页 → 侧滑返回
- 观察设置入口是否立即显示默认态（无按压态残留、无延迟恢复）
- 对比点击导航栏返回（应同样无残留）
- 测试其他入口（如 grid-entry 类型）是否也无残留

### 3. 回归验证

- 桌面端点击 cell 仍有 `:active` 按压反馈（未被破坏）
- forward 导航时按压态在手指抬起时立即消失（第三轮修复仍有效）
- 侧滑返回不再闪烁（第一、二轮修复仍有效）
- 全屏模态侧滑返回不再重新出现再退出（第二轮修复仍有效）

## 风险与回退

### 风险

- `void el.offsetWidth` 在大量元素上调用可能引起短暂 layout 抖动。但 host 入口数量有限（通常 <20），影响可忽略。
- `blur()` 可能导致键盘收起（如果入口是 input）。但路由入口是 `<button>`，无键盘影响。

### 回退

如果修复无效或引入新问题，回退方式：
1. 移除 `forceHostEntriesRepaint` 函数
2. 移除 `openPushScene` 中的 `entryEl` 保存和 `forceHostEntriesRepaint(entryEl)` 调用
3. 移除 `popSceneLayer` animated=false 分支中的 `forceHostEntriesRepaint()` 调用

回退后回到第三轮修复状态（forward 导航按压态即时消失，但侧滑返回仍有残留）。
