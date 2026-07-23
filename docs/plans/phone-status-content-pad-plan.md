# 电池栏职责对齐计划

> 模式：计划模式，待用户确认后执行。
> 目标：顶部电池栏高度由页面内容内部的固定/吸顶元素或滚动层自行垫出，页面根节点保持默认全屏撑满。

## 1. 当前状态

- **NavBar 组件** 已按规则在内部通过 `padding-top: var(--safe-area-top, 0px)` 处理顶部安全区（[`components.css`](file:///Users/dk/Documents/code/wego-design-system/.codex/skills/wego-design/components.css#L1959)、[`preview/component-navbar.html`](file:///Users/dk/Documents/code/wego-design-system/.codex/skills/wego-design/preview/component-navbar.html#L46)）。
- **全局 `.phone-status`** 作为桌面预览壳的透明覆盖层保留在 [`wego-app/index.html`](file:///Users/dk/Documents/code/wego-design-system/wego-app/index.html#L21-L24)，不参与页面布局，只负责模拟 iOS 状态栏视觉。
- **问题**：两个无导航栏的主 Tab 页面把 `padding-top: var(--safe-area-top)` 加在了**页面根节点**上，导致根节点不是真正的全屏撑满：
  - [`wego-app/scenes/我的/scene.css`](file:///Users/dk/Documents/code/wego-design-system/wego-app/scenes/我的/scene.css#L4) 的 `.my-page`
  - [`wego-app/scenes/微购相册动态/scene.css`](file:///Users/dk/Documents/code/wego-design-system/wego-app/scenes/微购相册动态/scene.css#L7) 的 `.album-feed`
- 其余带 NavBar 的页面（商品详情、动态详情、好友列表、应用中心）目前由 NavBar 自行让位，符合规则。

## 2. 目标状态

- **所有页面根节点默认全屏撑满**：保持 `position: absolute; inset: 0`，不额外加 `padding-top`。
- **有 NavBar 的页面**：由 NavBar 内部 `padding-top: var(--safe-area-top)` 让位。
- **无 NavBar、但顶部有固定/吸顶元素的页面**：由该固定元素自身内部加 `padding-top: var(--safe-area-top)` 让位。
- **无 NavBar、且无固定顶部元素的页面**：由滚动内容层自己加 `padding-top: var(--safe-area-top)` 让位。
- **视觉不变**：用户看到的顶部间距和现有效果一致。

## 3. 改动方案

### 3.1 我的页

文件：
- [`wego-app/scenes/我的/scene.css`](file:///Users/dk/Documents/code/wego-design-system/wego-app/scenes/我的/scene.css)
- [`wego-app/scenes/我的/scene.js`](file:///Users/dk/Documents/code/wego-design-system/wego-app/scenes/我的/scene.js)
- [`wego-app/scenes/我的/design-decisions.json`](file:///Users/dk/Documents/code/wego-design-system/wego-app/scenes/我的/design-decisions.json)

改动：
1. `.my-page` 删除 `padding-top: var(--safe-area-top)`。
2. `.my-page__scroll` 增加 `padding-top: var(--safe-area-top)`。
3. 同步更新 `scene.js` 中的 `prompt_contract.token_bindings`：把“页面顶部安全区”从 `.my-page` 改到 `.my-page__scroll`。
4. 同步更新 `design-decisions.json` 中对应的 token 绑定。

### 3.2 微购相册动态页

文件：
- [`wego-app/scenes/微购相册动态/scene.css`](file:///Users/dk/Documents/code/wego-design-system/wego-app/scenes/微购相册动态/scene.css)
- [`wego-app/scenes/微购相册动态/scene.js`](file:///Users/dk/Documents/code/wego-design-system/wego-app/scenes/微购相册动态/scene.js)
- [`wego-app/scenes/微购相册动态/design-decisions.json`](file:///Users/dk/Documents/code/wego-design-system/wego-app/scenes/微购相册动态/design-decisions.json)

改动：
1. `.album-feed` 删除 `padding-top: var(--safe-area-top)`。
2. `.album-feed__page-tabs`（顶部吸顶 tabs）增加 `padding-top: var(--safe-area-top)`。
3. `.album-feed__scroll` 不加 `padding-top`，由 tabs 已经把内容层下推。
4. 浮动搜索工具条 `.album-feed__floating-toolbar` 保持 `top: var(--safe-area-top)` 不变（fixed 定位，按视口安全区定位）。
5. 同步更新 `scene.js` 中的 `prompt_contract.token_bindings` 与 `design-decisions.json`。

### 3.3 规则补录

把这条职责边界写入项目记忆：

> 顶部安全区由页面内容内部自行处理：有 NavBar 时由 NavBar 内部加 `padding-top: var(--safe-area-top)`；无 NavBar 但顶部有固定/吸顶元素时由该固定元素内部加 `padding-top: var(--safe-area-top)`；无固定顶部元素时由滚动内容层加 `padding-top: var(--safe-area-top)`。页面根节点默认不预留该高度，保持 `position: absolute; inset: 0` 全屏撑满。

## 4. 验证步骤

1. 组件/设计系统状态未变，NavBar 与全局 `.phone-status` 保持原样，无需重新生成 `components.css`。
2. 运行场景合同与视觉检查：  
   `node scripts/validate-wego-design.mjs --scope=scenes --strict`
3. 本地打开 `wego-app/index.html` 检查：
   - 桌面端手机壳：我的页、微购相册动态页顶部仍有电池栏留白，内容从电池栏下方开始。
   - 微购相册动态页下滑时吸顶 tabs 仍粘在电池栏下方，无重叠。
   - 带 NavBar 页面（商品详情等）保持原样。

## 5. 风险

- `.album-feed__page-tabs` 增加 `padding-top` 后高度增加 44px（桌面），需确认 sticky 吸顶位置仍正确；因 sticky `top: 0` 是相对于 scroll 容器，不受影响。
- 修改后需确保 `scene.js` 与 `design-decisions.json` 的 token 绑定同步，否则守卫会报不一致。

## 6. 待确认

请确认：

- 是否同意以上修正后的方案（只改 我的、微购相册动态 两个页面，NavBar 与全局 `.phone-status` 不变）？
- 是否同意把该职责边界补录到项目记忆？

确认后即执行。
