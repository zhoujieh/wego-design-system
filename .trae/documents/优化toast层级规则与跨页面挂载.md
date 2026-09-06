# 优化 toast 层级规则与跨页面挂载

## 摘要

把 toast 宿主层的 z-index 从 `calc(var(--z-overlay) + 4) = 504` 改为直接用 `var(--z-toast) = 700`,取消 calc hack,让 token 体系与运行时一致;同时把 toast 在跨页面切换时的行为明确为「push/pop 场景切换与 overlay 关闭时保持显示,Tab 切换时立即隐藏」,并同步更新 toast 组件契约和设计系统 metadata version。

## 当前状态分析

### toast 挂载结构(已符合「跨页面保持」诉求,无需改)

- `.app-toast-host` 是 `.phone-screen` 的直接子节点,与 `.app-scene-layer` / `.app-overlay-layer` 是兄弟关系
- 场景切换、overlay 关闭、Tab 切换都不会自动销毁 toast DOM(因为是兄弟层)
- **结论:挂载位置不需要改,只在 Tab 切换时主动隐藏即可**

### z-index 倒挂问题

**Token 体系**([colors_and_type.css:413-422](file:///Users/baobei/CODE/wego-design-system/wego-app/lib/colors_and_type.css#L413-L422)):
```
--z-toast: 400;     ← token 值
--z-overlay: 500;   ← token 值
--z-modal: 600;     ← token 值
```

**运行时实际值**:
- `.app-scene-layer` / `.app-overlay-layer` = `var(--z-overlay)` = 500([app.css:353](file:///Users/baobei/CODE/wego-design-system/wego-app/css/app.css#L353))
- `.phone-status` = `calc(var(--z-overlay) + 3)` = 503([app.css:131](file:///Users/baobei/CODE/wego-design-system/wego-app/css/app.css#L131))
- `.app-toast-host` = `calc(var(--z-overlay) + 4)` = 504([app.css:453](file:///Users/baobei/CODE/wego-design-system/wego-app/css/app.css#L453))

token 里 `--z-toast=400` < `--z-overlay=500`,但运行时通过 calc 把 toast 抬到 504,绕过了 token 体系。这导致按 token 字面值判断层级会误判。

### 契约与实现的冲突

[toast.json:9](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/toast.json#L9) 的 description 末尾写「触发页面跳转或操作其他功能时立即隐藏」,[toast.json:99](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/toast.json#L99) 的 hideTriggers 写「页面跳转、操作页面其他功能……均立即隐藏当前 toast」。

但 [app.js](file:///Users/baobei/CODE/wego-design-system/wego-app/js/app.js) 中:
- `popSceneLayer`(L119-166)不隐藏 toast ✓(符合本次诉求)
- `closeOverlay`(L294-329)不隐藏 toast ✓(符合本次诉求)
- `clearSceneLayer`(L169-177)不隐藏 toast ✗(Tab 切换调用了它,应该隐藏)
- Tab 切换 handler(L500-506)调用 `closeOverlay()` + `clearSceneLayer()`,但都不隐藏 toast ✗

**结论:需要让 Tab 切换 handler 主动隐藏 toast,push/pop 与 overlay 关闭保持不变。**

### 已有调用示例

[价格权限管理 scene.js:285-286](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/scene.js#L285-L286) 是典型的「保存 → 退出 → toast 保持」流程:
```js
ctx.closeOverlay();
ctx.toast('已保存「' + priceType.label + '」权限设置');
```
当前实现已经能让这个 toast 在 overlay 关闭过程中保持显示(z-index 504 > overlay 500),本次优化后 z-index 抬到 700,行为不变。

## 提议的变更

### 1. 调整 `--z-toast` token 取值(从 400 → 700)

**文件**:[wego-app/lib/colors_and_type.css:419](file:///Users/baobei/CODE/wego-design-system/wego-app/lib/colors_and_type.css#L419)

**改前**:
```css
--z-toast: 400;
```

**改后**:
```css
--z-toast: 700;
```

**为什么**:700 高于 `--z-overlay=500` 与 `--z-modal=600`,低于 `--z-critical=900`。toast 作为「全局顶层反馈」浮在所有场景/模态/抽屉之上,但保留 critical 给未来系统级中断层。

### 2. toast 宿主层取消 calc hack,直接用 token

**文件**:[wego-app/css/app.css:449-454](file:///Users/baobei/CODE/wego-design-system/wego-app/css/app.css#L449-L454)

**改前**:
```css
.app-toast-host {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: calc(var(--z-overlay, 500) + 4);
}
```

**改后**:
```css
.app-toast-host {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-toast);
}
```

**为什么**:token 与运行时一致,层级关系一眼可读;移除 calc 也省去了 fallback 兜底。

### 3. Tab 切换时主动隐藏 toast

**文件**:[wego-app/js/app.js:500-506](file:///Users/baobei/CODE/wego-design-system/wego-app/js/app.js#L500-L506)

**改前**:
```js
tabTriggers.forEach(function (trigger) {
  trigger.addEventListener('click', function () {
    closeOverlay();
    clearSceneLayer();
    setActiveTab(trigger.dataset.hostTabTrigger);
  });
});
```

**改后**:
```js
tabTriggers.forEach(function (trigger) {
  trigger.addEventListener('click', function () {
    closeOverlay();
    clearSceneLayer();
    // Tab 切换意味着用户离开当前功能模块,toast 不跨 Tab 保持
    clearToastTimers();
    removeCurrentToast();
    setActiveTab(trigger.dataset.hostTabTrigger);
  });
});
```

**为什么**:
- `removeCurrentToast` 是 app.js 闭包内的私有函数(L356-366),Tab handler 在同一闭包内可直接调用
- `removeCurrentToast` 会触发 200ms 淡出动画(`is-leaving` 类),视觉上是「立即开始隐藏」,符合契约「立即隐藏」
- `clearToastTimers` 防止已设置的 4000ms 自动关闭计时器在淡出过程中误触发
- push/pop(`popSceneLayer`、`openPushScene`)与 `closeOverlay` 都不调用 `removeCurrentToast`,保持「跨页面持续显示」行为

**注意**:此处不新增 `hideToast()` 公开 API,避免 API 表面扩大。如果后续业务场景需要主动隐藏 toast(例如引导 toast 点击 action 后),再单独评估。

### 4. 更新 toast 组件契约

**文件**:[.codex/skills/wego-design/components/toast.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/toast.json)

#### 4.1 description(L9)

**改前**:
```
瞬时浮层提示,用于告知用户当前发生的事件或引导下一步操作。仅两种变体:默认 toast(居中纯文本告知)和引导 toast(左侧可选图标 + 必选文案 + 右侧可选操作)。同屏互斥,单次展示一个,触发页面跳转或操作其他功能时立即隐藏。
```

**改后**:
```
瞬时浮层提示,用于告知用户当前发生的事件或引导下一步操作。仅两种变体:默认 toast(居中纯文本告知)和引导 toast(左侧可选图标 + 必选文案 + 右侧可选操作)。同屏互斥,单次展示一个。toast 挂载在宿主层,push/pop 场景切换与 overlay 关闭时保持显示(便于「保存 → 退出 → 反馈仍可见」流程),切 Tab 切换主功能模块时立即隐藏。
```

#### 4.2 hideTriggers(L99)

**改前**:
```
页面跳转、操作页面其他功能、点击引导 toast 的右侧操作按钮均立即隐藏当前 toast。
```

**改后**:
```
切 Tab 切换主功能模块、点击引导 toast 的右侧操作按钮均立即隐藏当前 toast。push/pop 场景切换(进入/返回业务设置页)与 overlay 关闭(关闭模态/抽屉/全屏模态)时不隐藏,以便「保存 → 退出 → toast 反馈仍可见」。
```

#### 4.3 position(L101)

**改前**:
```
距底部 106px 居中悬浮,z-index 使用 var(--z-toast)。
```

**改后**:
```
距底部 106px 居中悬浮,toast 宿主层 z-index 使用 var(--z-toast)=700,高于 overlay(500)与 modal(600),低于 critical(900),确保浮于所有场景/模态/抽屉之上。
```

### 5. 递增设计系统 metadata version

**文件**:[.codex/skills/wego-design/metadata.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/metadata.json)

按 `wego-uxsystem-iterate` 技能要求,组件契约变更必须递增 version。需要先读取当前 version,把 patch 段 +1(例如 `1.x.y` → `1.x.y+1`)。

## 假设与决策

1. **挂载位置不变**:toast 宿主层 `.app-toast-host` 已经是 `.phone-screen` 的直接子节点,与 sceneLayer/overlayLayer 是兄弟,事实支持「跨页面保持 DOM 不销毁」。本次不动挂载结构,只动 z-index 和 Tab 切换时的隐藏逻辑。
2. **Tab 切换的语义**:Tab 切换 = 切主功能模块(首页/我的等),用户已离开当前任务上下文,toast 应立即消失。push/pop 与 overlay 关闭都视为「同一任务上下文内的层级变化」,toast 保持。
3. **不新增 hideToast 公开 API**:本次只用闭包内的 `removeCurrentToast` 在 Tab 切换时隐藏。如果后续业务场景需要主动隐藏(如引导 toast 点击 action),再单独评估 API 设计。
4. **退场动画保留**:`removeCurrentToast` 触发 200ms `is-leaving` 淡出。Tab 切换时 toast 在新 tab 上方 200ms 内淡出,视觉上是「立即开始隐藏」,符合契约。
5. **`--z-modal` 与 `--z-critical` 不动**:这两个 token 当前未被任何元素使用,但保留语义层级,本次不调整。
6. **价格权限管理场景代码不动**:它已经是「closeOverlay + toast」顺序,新规则下行为符合预期。

## 验证步骤

### 1. 守门脚本

```bash
node scripts/validate-wego-design.mjs
```

应全部通过(JSON 格式、Token 同步、组件三向对齐、components.css 完整性、UI Kit 成对、过期路径、禁止文件、metadata version)。

### 2. 本地直接打开预览

直接用浏览器打开 `wego-app/index.html`,依次验证:

- **z-index 层级**:在任意 push 场景(如系统设置)中触发 toast,toast 应浮于场景层之上;打开模态/抽屉后再触发 toast,toast 应浮于 overlay 之上。
- **跨页面保持(push/pop)**:进入系统设置 → 点未接入入口触发 toast → 点返回 pop 回宿主 → toast 应在宿主页继续显示直到 4s 自动消失。
- **跨页面保持(overlay 关闭)**:进入价格权限管理 → 点编辑打开 overlay → 点保存触发 `closeOverlay() + toast()` → overlay 关闭过程中 toast 应可见,关闭后 toast 在价格权限管理页继续显示。
- **Tab 切换立即隐藏**:在任意 tab 触发 toast → 立即点另一个 tab → toast 应在 200ms 内淡出消失,不会持续到新 tab。
- **桌面端手机壳预览**:toast 应相对手机屏定位,不是相对视口(`.app-toast-host .toast.is-floating { position: absolute }` 仍生效)。

### 3. 契约一致性

读 `toast.json` 的 description、hideTriggers、position 三个字段,确认与 app.js 的实际行为一致:
- push/pop 不隐藏 ✓
- closeOverlay 不隐藏 ✓
- Tab 切换隐藏 ✓
- z-index = `var(--z-toast)` = 700 ✓

### 4. metadata version

读 `metadata.json` 确认 version 已递增。

## 不在本次范围

- 引导 toast(带图标/操作按钮)在 app.js 运行时的接入——当前 `toast()` 只生成 `toast--default`,引导 toast 接入是独立任务。
- `--z-modal` / `--z-critical` token 的实际启用——本次不动。
- 新增 `hideToast()` 公开 API——本次不需要。
- 价格权限管理场景代码改动——它已经符合新规则。
