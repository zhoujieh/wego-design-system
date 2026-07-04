---
name: wego-ux
description: 将 page_spec 和 design_consumption_plan 落成 wego-app 静态 App 原型。输出可部署到 Vercel、也可本地直接打开的 HTML/CSS/JS 交互原型；业务场景全部挂到 wego-app/scenes/，遵守 wego-design 的组件与规范边界。
---

# Wego UX

这是唯一正式产出产品原型的环节。目标不是生成孤立 demo，而是持续开发一个完整的 `wego-app` 静态 App 原型。

## 输入前提

开始前必须已经有：

- `page_spec`，且已落盘到 `wego-app/scenes/{中文业务场景}/_spec/page_spec.json`
- `design_consumption_plan`，且已落盘到 `wego-app/scenes/{中文业务场景}/_spec/design_consumption_plan.json`

找不到这两份文件时不进入原型生成，先回到 `wego-product` / `wego-design` 补齐。同一业务场景迭代时复用原 `_spec/` 目录，按版本归档。

## 产物目标

`wego-app/` 是唯一 App 项目，可直接部署到 Vercel，也必须支持本地直接打开 `wego-app/index.html`。

```text
wego-app/
├── index.html                 # 唯一 App 宿主入口
├── vercel.json                # 静态部署配置
├── css/
│   └── app.css                # App 宿主、预览外壳、路由层样式
├── js/
│   ├── app.js                 # App 路由、场景注册、弹层、状态交互基线
│   └── routes.js              # route_id 与场景脚本/样式/入口声明
├── lib/                       # 设计系统部署副本
│   ├── colors_and_type.css
│   ├── iconfont.css
│   ├── components.css
│   ├── fonts/
│   ├── icons/
│   └── image/
└── scenes/
    └── 权限管理/
        ├── _spec/
        │   ├── page_spec.json
        │   └── design_consumption_plan.json
        ├── scene.css
        └── scene.js
```

规则：

- 不再创建仓库根目录下的任务级独立原型文件夹
- `wego-app/index.html` 是唯一宿主 App 和唯一预览外壳
- 业务场景全部进入 `wego-app/scenes/{中文业务场景}/`
- 业务场景目录使用中文业务语义命名；同一场景迭代复用原目录
- hash route 使用 `route_id`，例如 `#/my-permission-management`
- `wego-app/lib/` 是部署用设计系统资源副本，由 `.codex/skills/wego-design/` 同步而来

## 固定宿主 App

`wego-ux/templates/host-shell.html`、`host-shell.css`、`host-shell.js` 只作为宿主基线来源。正式产物默认维护在 `wego-app/index.html` / `wego-app/css/app.css` / `wego-app/js/app.js`，不再每次业务任务复制一套宿主模板。

执行规则：

- 若 `wego-app/` 不存在，先按宿主模板基线初始化一次
- 若 `wego-app/` 已存在，保留现有 Tab、工作台、我的页、默认入口、UI 和基础交互
- AI 只能按 `route_id` 增量注册或更新入口、hash route、场景脚本/样式、结果摘要和必要交互
- 禁止重画宿主 App、重置与当前任务无关的入口、删除既有场景
- 固定五项 Tab：`动态 / 好友 / 工作台 / 消息 / 我的`
- 业务入口图标优先使用 `wego-app/lib/icons/app-center/*.svg`

## 场景模块

每个业务场景至少包含：

- `_spec/page_spec.json`
- `_spec/design_consumption_plan.json`
- `scene.js`
- `scene.css`

`scene.js` 是运行时权威入口，必须通过 `window.WegoApp.registerScene()` 注册：

```js
window.WegoApp.registerScene({
  routeId: 'my-permission-management',
  title: '权限管理',
  presentation: {
    type: 'push',
    transition: 'slide-left',
    coversTabBar: false
  },
  template: '<section class="permission-page">...</section>',
  init(ctx) {
    // 绑定真实业务交互、状态变化、toast、回填等
  }
});
```

`scene.html` 可作为源码参考或迁移片段，但运行时不得依赖它。为了同时支持 Vercel 和本地直接打开，禁止使用 `fetch()` / `XHR` 读取本地 HTML 片段；允许通过 `<script src>` 动态加载 `scene.js`、通过 `<link rel="stylesheet">` 加载 `scene.css`。

## 路由注册

`wego-app/js/routes.js` 维护场景清单。新增或更新场景时，按 `route_id` upsert，不按文案模糊匹配。

每条 route 至少包含：

```js
{
  routeId: 'my-permission-management',
  scene: '权限管理',
  script: './scenes/权限管理/scene.js',
  style: './scenes/权限管理/scene.css',
  entry: {
    tab: 'my',
    group: 'my-settings',
    label: '权限管理',
    type: 'cell',
    parentEntry: '设置'
  }
}
```

同一 `route_id` 只能注册一次。后续迭代只更新该 route 和对应 scene，不重复插入入口。

## 页面打开方式

`design_consumption_plan.page_presentation.type` 决定打开方式。`wego-ux` 只执行设计消费决策，不自行重判。

| type | 含义 | DOM 与层级 | 典型场景 |
| --- | --- | --- | --- |
| `push` | App 内二级页面跳转 | 在 `.phone-screen` 内打开 push screen，场景级打开必须 `coversTabBar: true` | 列表详情、二级选择页、商品管理列表 |
| `modal` | 当前页面居中弹窗 | 在当前场景上方打开轻量 dialog，场景级打开必须 `coversTabBar: true` | 确认删除、提示、短表单 |
| `sheet` | 底部弹层 | 从底部滑入，可半屏或内容自适应，场景级打开必须 `coversTabBar: true` | 筛选、选择器、批量操作 |
| `full-screen-modal` | 全屏模态页 | 从底部滑入并覆盖整个手机屏，通常覆盖 Tab | 权限设置、规则配置、复杂编辑 |

转场：

- `slide-left`：push 页面轻量左右切换
- `fade`：普通 modal 淡入淡出
- `slide-up-enter, slide-down-exit`：sheet / full-screen-modal 底部进入退出
- `none`：允许无动画，但层级和关闭方式仍要清晰

所有打开方式都必须限制在 `.phone-screen` 上下文中，不能让浏览器顶层跳转到独立 HTML 页面。

**硬约束**：`registerScene` 的 `presentation.coversTabBar` 必须与 `design_consumption_plan.page_presentation.covers_tab_bar` 一致；`wego-app/scenes/` 下场景的 `coversTabBar` 必须为 `true`（`host-entry` surface 除外）。5 个主 tab 走 host-shell 内嵌面板，不经过 `page_presentation`。

## 真实业务交互

原型不是静态截图，必须体现完整流程和数据表现：

- 选择、开关、筛选、批量操作、保存、取消、删除、创建等操作要有可见状态变化
- 保存或完成后要有明确反馈，如 toast、摘要更新、关闭弹层或返回上一层
- 宿主入口可按需求回填结果摘要，例如“已开启 3 项权限”
- 空态、禁用态、错误态、成功态按业务必要性实现
- 默认使用内存状态即可，不强制 `localStorage` 持久化
- 只有需求明确要求“刷新后保留”或“跨会话保留”时，才实现 localStorage

## 设计系统消费

生成时必须读取 `design_consumption_plan.surface_designs[]` 和 `component_mapping[]`：

- `exact` / `near`：按命中的 pagePattern、UI Kit 节奏和组件映射生成
- `fallback`：只能按 `matched_blueprint` 指向的 `uikit-plan.json.fallbackPageBlueprints[]` 生成
- `gap`：停止生成，回到 `wego-design` 补齐 blueprint/UI Kit/组件契约

组件规则：

- 不发明未注册组件类、子元素类或修饰类
- 连续 cell/form 必须使用已注册分组容器，如 `.cell-group` / `.form-group`
- 页面级业务 class 只能做布局胶水和业务作用域，不替代组件 class
- 不输出面向 AI/工作流的内部说明文案

### component_mapping 消费分派

消费 `component_mapping` 时，按 `consumption_mode` 分派规格消费行为：

- **stable-variant**：反查 `components/{slug}.json` 的 `representativeVariants` 找到维度值组合对应的变体，按 `domAnatomy` + `preview/component-{slug}.html` 实例复制 markup；不得替换变体（如把 `back-icon` 换成 `navbar__left-text`）、不得跨变体组合、不得仿照同 plan 内其他 surface 的 `selected` 自行替换变体。规格消费完成后，wego-ux 仍负责工程实现（场景注册、状态绑定、交互逻辑）。
- **composition-constraint**：直接按 `selected` 的 DOM 路径实现；内嵌控件规格（尺寸/间距/层级/状态修饰类/图标资产）不得二次决定；不得省略 `selected` 中已声明的修饰类或资产路径。规格消费完成后，wego-ux 仍负责工程实现。
- **free-composition**：按 `selected` 的 DOM 路径实现；允许在组件契约 `domAnatomy` 边界内调整业务作用域样式。规格消费完成后，wego-ux 仍负责工程实现。

### navbar leftControl 绑定关系（命中 stable-variant 时必查）

`navbar leftControl` 与 `presentation.type` 的绑定：

- `push` → `back-icon` → DOM: `navbar__left > .navbar__left-btn > i.wego-iconfont-s.icon-fanhui`
- `full-screen-modal` 模式 A → `text-cancel` → DOM: `navbar__left > .navbar__left-text`（文案固定「取消」，不得为「返回」）
- `full-screen-modal` 模式 B → `close-icon` → DOM: `navbar__left > .navbar__left-btn > i.wego-iconfont-s.icon-cha`

## 资源同步

新增或更新 `wego-app` 时，必须确保 `wego-app/lib/` 包含：

- `colors_and_type.css`
- `components.css`
- `iconfont.css`
- `fonts/`
- `icons/`
- `image/`

`assets/` 必须整体同步到 `wego-app/lib/`，不筛选子目录，确保 `icons/app-center/` 等资产完整可用。

## 预览适配

同一个 `wego-app/index.html` 链接必须同时支持：

- 电脑端：显示手机壳，内容在 `.phone-screen` 中预览
- 移动端：隐藏手机壳视觉，内容铺满真实 viewport

约束：

- `.preview-shell` / `.phone-frame` / `.phone-screen` 只允许存在于 `wego-app/index.html` 和宿主样式中
- 场景文件不得依赖外壳类表达布局、状态或交互
- `.phone-status` / `.phone-indicator` 属于宿主预览安全区，不进入 scene markup
- 模态、sheet、push 层都挂载在 `.phone-screen` 内
- 底部固定操作栏必须预留 `--safe-area-bottom`

## 本地直开兼容

`wego-app/index.html` 必须支持本地直接打开：

- 不依赖 npm install、构建命令或前端框架
- 不依赖 `fetch()` / `XHR` 读取本地 HTML 或 JSON 片段
- 可以使用相对路径 `<link>` / `<script>` 加载 CSS 和 JS
- 业务 template 放在 `scene.js` 字符串或 `<template>` 中

Vercel 部署是主预览方式；本地直开是低成本备用能力，两者运行路径必须一致。

## 输出要求

最终输出的是 `wego-app` 静态交互原型，不是说明文档。

最小交付结果应能回答：

- App 项目入口：`wego-app/index.html`
- 当前业务场景目录：`wego-app/scenes/{中文业务场景}/`
- 当前 route：`#/{route_id}`
- 当前入口挂载在哪个 Tab / 分组
- 当前页面使用哪种打开方式
- 当前流程有哪些真实状态变化和结果反馈

## 禁止事项

- 不创建新的任务级独立原型文件夹
- 不为每个场景复制第二套宿主 App
- 不重画固定宿主 Tab、工作台、我的页等现成内容
- 不绕过 `design_consumption_plan` 自由发挥页面范式
- 不引入 React、Vue、Next.js 等前端框架
- 不用 `fetch()` / `XHR` 加载本地 scene HTML
- 不通过普通 `<a href="./scenes/...">` 或 `location.href` 让顶层浏览器离开 `wego-app/index.html`
- 不复制 UI Kit Showcase 外壳到业务场景
- 不默认强制 localStorage 持久化
