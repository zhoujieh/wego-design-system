# 移动端原型代理指南

## 原型说明

在 ChatGPT 工作模式下，运行 `sites-preview start "$PWD"`，在云浏览器中打开 `http://terminal.local:4173/`，并验证渲染的应用及其主要交互。保持预览打开，并告诉用户在云浏览器中检查；不要将本地 URL 作为面向用户的聊天链接呈现。在 Codex Desktop 中，自己运行本地服务器，在应用内浏览器中打开预览，并提供可点击的本地 URL。除非用户明确要求分享、发布或部署，否则不要部署到 Sites。当你可以运行时，不要给用户提供服务器启动说明。

在规划或实现任何 mobile-app 更改之前，完整阅读此 `AGENTS.md`。它是模板运行时和组件指导的唯一事实来源。

在进行重大视觉更改之前，当视觉来源不明确或不再符合当前目标时，使用产品设计插件的 `get-context` 技能。当用户提供持久的、原型专属的设计反馈、偏好或决策时，将它们记录在 `AGENTS.md` 中。

在根据选定的生成模型实现时，将该图像视为布局、组件解剖、密度、间距、颜色、排版、可见内容和层次结构的唯一事实来源。

## 编辑边界

- 在 `src/Prototype.tsx` 和 `src/prototype.css` 中构建应用专属 UI。
- 将 `src/App.tsx`、`src/main.tsx`、`src/styles.css`、`src/mobile/`、`public/assets/iphone/`、`public/assets/android/`、`public/assets/status/`、`vite.config.ts`、`worker/index.js` 和 `scripts/prepare-sites-build.mjs` 视为受保护的运行时文件。除非用户明确要求更改移动端运行时本身，否则不要编辑、替换、移除或重新创建它们。对于显式的运行时更改，仅在验证新运行时行为后更新受影响的锁定哈希。
- 在预览或交付前运行 `npm run check:runtime`。如果失败，请恢复受保护的运行时，而不是削弱或绕过检查。
- `npm run build` 保留移动端运行时，并准备 Sites 所需的静态 Cloudflare Worker 输出。在交给 Sites 之前，确认 `dist/client/index.html`、`dist/server/index.js`、`dist/.openai/hosting.json` 和源 `.openai/hosting.json` 存在，然后运行 `npm run test:sites`。不要用 Vinext 启动器替换此项目。

## 运行时契约

- 保留移动设备运行时，除非用户的任务明确要求不这样做。不要将其替换为独立页面。视觉保真度适用于设备屏幕内的应用自有内容，而非模板拥有的设备外壳。
- 保持 `App` 围绕 `PhoneFrame` -> `KeyboardProvider` 组合，将 `StatusBar`、应用内容、`HomeIndicator` 和 `KeyboardDock` 挂载在手机框架内。`StatusBar` 和 iOS 主屏幕指示器是叠加的设备外壳。当 Android 键盘关闭时，应用视口预留受保护的导航栏区域，而不是在其后面绘制。当 Android 键盘打开时，保持当前全屏键盘布局：其资源包含 IME 导航条，单独的黑色导航栏被隐藏。iOS 屏幕继续在主屏幕指示器区域后面绘制，并拥有自己的安全区域内容内边距。
- 保留 `iPhone` / `Pixel 10` 设备选择器和两个校准的设备预设。Pixel 屏幕为 `427 x 952`；其 `32 x 32` 摄像头圆圈和 `public/assets/android/navigation-bar.svg` 底部导航栏是受保护的设备外壳，不是应用内容。
- 保留设备选择器在右上角的刻意轻量 Codex 样式：其触发器包装器无边框且透明，触发器根据内容调整大小，其右对齐菜单使用紧凑的 3px 内嵌以及指定的细线和 elevation 阴影层。保持原型根节点和默认应用屏幕为白色。
- 将 `StatusBar` 保留为实时设备外壳，包括其平台专属的排版、源状态图标资源和间距。Pixel 10 使用 Roboto、Android 指示器和 32px 的顶部、左侧、右侧内边距。iPhone 使用其 iOS 指示器、系统排版和校准的间距。不要在状态栏中硬编码截图时间如 `9:41`，替换其实时时钟，或将状态栏内容移入应用标记，除非用户明确要求固定/模拟设备时间。
- `PhoneFrame` 拥有校准的设备框架、屏幕门户、设备选择器、摄像头挖孔和自定义光标。将设备资源保留在 `public/assets/iphone/` 和 `public/assets/android/` 中；如果资源加载失败，请修复资源路径或恢复资源，而不是移除框架、键盘或图像渲染。
- 对于简单的单屏原型，直接使用 `MobileScroll`。对于常规的多屏流程，使用 `FlowStack`，其路由可以拥有固定的页眉和页脚；使用时，将每个路由定义为 `FlowScreen`：`{ id, header?, headerHeight?, footer?, footerHeight?, render }`，并从 `FlowStack` 渲染回调或 `useFlow()` 中使用 `flow.push(screen)`、`flow.pop()` 和 `flow.replace(screen)`，而不是引入另一个路由器。
- 对于轮播、水平轨道、可滑动卡片、图像或媒体条、水平滚动卡片、芯片轨道或其他水平集合，使用 `Carousel`。
- 对于分层应用外壳——例如持久编辑器、独立呈现的面板、推入/窥视侧边栏或应用范围过渡——直接在 `Prototype.tsx` 中组合，而不是强行通过 `FlowStack`。将应用拥有的固定外壳作为 `MobileScroll` 外部的同级层保留。
- 使用 `FlowScreen` 时，将路由拥有的固定页眉或页脚放在 `FlowScreen.header` 或 `FlowScreen.footer` 中。将 `headerHeight` 设置为可见的应用工具栏高度；`FlowStack` 会自动添加设备的顶部安全区域/状态栏内边距。不要在页眉中包含 `StatusBar` 或其高度。将 `footerHeight` 设置为完整的应用页脚高度。`FlowScreen.footer` 是叠加层，不是预留的布局空间；使用它的界面必须添加自己的底部内容内边距，例如 `padding-bottom: calc(var(--flow-footer-height) + var(--mobile-safe-area-height) + 24px)`，以便最终内容可以在页脚上方滚动，同时仍然在其后面绘制。
- 仅在 `MobileScroll` 内部渲染可滚动内容；它用于应随滚动和橡皮筋过滚动移动的内容。将应用拥有的页眉、导航栏、标签页、编辑器和叠加层保留在其外部。这样可以在不让内容绘制在固定外壳下方的情况下，保持滚动物理、安全区域、键盘内边距、滚动条和拖动点击抑制处于活动状态。
- `MobileScroll` 内部的按钮、链接、卡片和图片在指针移动超出点击容差时仍应允许拖动滚动。仅对极少数必须自己拥有拖动手势的控件使用 `data-scroll-drag="ignore"`。
- 不要在 `MobileScroll` 内部将 `var(--keyboard-height)` 添加到普通屏幕/内容内边距中；滚动视口已经在模拟键盘上方收缩。对于自定义固定编辑器、搜索栏或提示外壳，使用 `useKeyboardInsets().bottomInset`。它相对于应用视口：Android 在键盘关闭时返回 `0`，因为关闭键盘的视口已经预留了导航栏，在打开时返回键盘高度；iOS 在关闭时继续清除主屏幕指示器，在打开时直接位于键盘上方。不要将自定义底部外壳固定到 `bottom: 0` 或仅固定到 `keyboardHeight`。
- 对每个文本输入控件使用 `KeyboardInput`、`KeyboardTextarea` 或 `MobileTextField`。原始 `input` 或 `textarea` 会断开焦点、键盘动画、安全区域内边距和附加表面的连接。
- 对手机范围的面板使用 `BottomSheet`。其属性为 `open`、`onOpenChange`、`title`、可选的 `description`、可选的 `snap` 和 `children`；它通过手机屏幕门户渲染，并在打开前收起键盘。

## 水平轮播

- 对水平可拖动卡片、图片、媒体、芯片或其他水平集合使用 `Carousel`。不要用 `overflow-x`、自定义指针处理程序或通用 div 重新创建这些。
- `Carousel` 可以直接嵌套在 `MobileScroll` 内部。它拥有水平手势，并自动将垂直手势交给父级。
- 永远不要在 `Carousel` 上或其周围放置 `data-scroll-drag="ignore"`；这样做会在手势从其内部开始时阻止垂直父级滚动。
- 不要向 `Carousel` 添加 CSS 滚动吸附；其运行时拥有动量和释放动作。
- 仅当控件必须阻止所有拖动方向的父级滚动时才使用 `data-scroll-drag="ignore"`。

完整的组件和手势契约请参见 `src/mobile/COMPONENTS.md`。

## 键盘规则

模拟键盘是一个独立的顶层组件。在呈现任何行为类似 iOS 导航或模态 UI 的内容之前，先将其收起。

在以下操作前调用 `keyboard.hide()`：

- 推入、弹出或替换 FlowStack 路由
- 打开底部面板、操作面板、对话框、菜单或导航面板
- 开始目标不应继承文本输入焦点的过渡

`FlowStack` 已经会在 `push`、`pop` 和 `replace` 时隐藏键盘。`BottomSheet` 已经会在打开前隐藏键盘。如果你添加新的模态/面板/导航原语，请遵循相同的规则。

当编辑器、搜索表面或其他键盘附加组件关闭时，在更新其自身打开状态之前，在同一事件中调用 `keyboard.hide()`。使用 `useKeyboardInsets()` 定位附加表面，而不是单独的计时器或可见性标志，以便两者一起消失。

当任何文本输入控件失去焦点时，收起模拟键盘。如果控件是自定义的或不使用运行时的键盘感知字段，请处理其 blur 事件并显式调用 `keyboard.hide()`。仅在焦点直接移动到另一个应共享同一键盘会话的文本输入控件时，保持键盘打开。

## 交互规则

- 在指针变成拖动后，不要触发按钮或输入。保留 `MobileScroll` 中的拖动抑制行为。
- 不要允许手机框架内的原生浏览器图片/文件拖动。保留手机级别的 `dragstart` 抑制和不可拖动图片样式，以便从图片开始的滚动拖动仍然可以滚动原型。
- 使用 `KeyboardInput`、`KeyboardTextarea` 或 `MobileTextField` 进行文本输入，以便模拟键盘和安全区域内边距保持连接。
- 固定的手机外壳不应随推入的屏幕一起动画。屏幕内容可以动画；状态栏、摄像头挖孔和预览外壳应保持不动。
- 保持键盘在 z-index 上位于主屏幕指示器/安全区域层之下，在可见时位于普通应用 UI 之上。
- 将主屏幕指示器保持为原型中 z-index 上位于一切之上的最顶层安全区域层。
