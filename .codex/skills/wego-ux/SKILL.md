---
name: "wego-ux"
description: 将已落盘的 page_spec 和 design_consumption_plan 实现为 wego-app 静态 App 场景，或按规格迭代已有场景；负责路由、DOM、CSS、交互、状态、资源同步和交付验证。
---

# Wego UX

本文件是 `wego-ux` 的唯一运行时权威入口。这是唯一正式产出或修改业务原型的环节。目标是持续开发同一个 `wego-app`，而不是生成孤立 demo。

## 何时触发

- 已有 `page_spec` 和 `design_consumption_plan`，需要生成或更新 `wego-app` 场景。
- 用户要求实现 `scene.js`、`scene.css`、`routes.js`、宿主入口或真实交互。
- 任何对 `wego-app/scenes/{场景}/` 已有业务场景的修改，无论大小，都先进入本技能做偏差判定。

不要误用：

- 缺少上游规格：回到 `wego-product` 或 `wego-design`。
- 修改组件、Token、UI Kit、Preview、消费边界或工作流：转入 `wego-uxsystem-iterate`。
- 只做验收或回归：转入 `wego-tests`。

## 输入与实现依据

开始前必须读取：

1. `AGENTS.md`。
2. 当前场景 `_spec/page_spec.json`。
3. 当前场景 `_spec/design_consumption_plan.json`。
4. `design_consumption_plan.rule_sources_used` 指向的正式来源。
5. 实际命中的组件契约、Preview、Token、pagePattern 和 fallback blueprint。
6. 现有 `wego-app` 宿主、路由和目标场景文件。

`.codex/skills/wego-design/specs/*.md` 只用于人工检查，不得作为实现依据。发现规格、来源或实现约束缺失时，必须回到最早产生问题的上游技能修正，不得在实现阶段补造规则。

## 核心规则

- 实现只能执行已确认的 `page_spec`、`design_consumption_plan` 和其中记录的真实规则来源，自动生成文档不得参与实现判断。
- 修改已有场景前必须先做偏差判定；禁止绕过规格直接修改 `scene.js`、`scene.css` 或路由。
- 组件结构、变体、状态、Token、页面布局和打开方式必须严格执行设计计划，不得二次设计。
- 发现内容、组件、展示或规则来源偏差时必须回退上游并更新、归档 `_spec`，不能在实现层自行消化。
- 场景完成后必须经过 `wego-tests`；提交、推送和部署状态只能按真实执行结果报告。

## 强制门禁：已有场景偏差判定

修改已有场景前依次检查：

1. 本次变化是否被 `page_spec.page_surfaces[]`、`information_blocks`、`states` 或 `edge_cases` 覆盖。
2. 组件变化是否在对应 `component_mapping[].selected`、`consumption_mode` 和契约范围内。
3. 页面布局、打开方式、覆盖层级和返回方式是否与 `layout_pattern`、`page_presentation` 一致。
4. 本次使用的 Token、组件类和行为是否能在 `rule_sources_used` 中追溯。

偏差处理：

| 偏差 | 必须更新 | 回退链路 |
| --- | --- | --- |
| 内容、状态、范围或宿主路径偏差 | `page_spec`、`design_consumption_plan` | `wego-product → wego-design → wego-ux` |
| 组件、布局或组合偏差 | `design_consumption_plan` | `wego-design → wego-ux` |
| 展示、打开方式或层级偏差 | 视原因更新两份规格 | `wego-product/wego-design → wego-ux` |
| 权威来源缺失或冲突 | 正确的规则源和设计计划 | `wego-uxsystem-iterate/wego-design → wego-ux` |

更新规格前必须把上一版归档到 `_spec/archive/`。

以下通常属于无偏差，但仍须符合已有规则：

- 文案、间距、圆角等工程细节修正。
- 使用已注册 Token 替换错误硬编码。
- 安全区、响应式和键盘视口修复。
- 不改变交互模式的 Bug 修复。
- 性能优化和代码重构。
- 在计划已允许范围内切换稳定变体。

## 产物结构

唯一正式 App：

```text
wego-app/
├── index.html
├── vercel.json
├── css/app.css
├── js/app.js
├── js/routes.js
├── lib/
└── scenes/{中文业务场景}/
    ├── _spec/page_spec.json
    ├── _spec/design_consumption_plan.json
    ├── scene.js
    └── scene.css
```

规则：

- 不在仓库根目录创建任务级原型文件夹。
- `wego-app/index.html` 是唯一宿主入口和预览外壳。
- 业务场景只进入 `wego-app/scenes/{中文业务场景}/`，同一场景复用原目录。
- `route_id` 使用上游确定的稳定 kebab-case。
- `wego-app/lib/` 只是部署副本，禁止直接作为修改源。

## 固定宿主 App

`wego-ux/templates/host-shell.*` 是宿主基线；正式产物维护在 `wego-app/index.html`、`wego-app/css/app.css` 和 `wego-app/js/app.js`。

- `wego-app` 不存在时按基线初始化一次。
- 已存在时保留当前 Tab、工作台、我的页、既有入口和场景。
- 只按 `route_id` 增量 upsert 入口、路由、场景资源和结果摘要。
- 禁止重画宿主、删除无关入口或为单个任务复制第二套宿主。
- 固定 Tab：`动态 / 好友 / 工作台 / 消息 / 我的`。
- 业务入口图标优先使用 `wego-app/lib/icons/app-center/*.svg` 中已有资产。

宿主级改动必须同步检查真实宿主和 `templates/host-shell.*`，避免后续初始化回退到旧行为。

## 场景注册

`scene.js` 是业务场景运行时入口，必须调用：

```js
window.WegoApp.registerScene({
  routeId: 'my-permission-management',
  title: '权限管理',
  presentation: {
    type: 'push',
    transition: 'slide-left',
    coversTabBar: true
  },
  template: '<section class="permission-page">...</section>',
  init(ctx) {
    // 绑定业务交互、状态、反馈和回填
  }
});
```

- `routeId`、`presentation` 必须与设计计划一致。
- 场景级页面默认 `coversTabBar: true`；只有宿主内嵌 `host-entry` 可为 `false`。
- `scene.html` 只能作为源码参考，不得在运行时通过 `fetch()` 或 XHR 加载。
- 业务模板放在 `scene.js` 字符串或宿主可直接加载的 `<template>` 中。

## 路由和入口

`wego-app/js/routes.js` 按 `route_id` upsert，不按文案模糊匹配。每个 route 至少包含：

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

- 同一 `route_id` 只能注册一次。
- 入口层级必须与 `host_container` 和 `page_surfaces[host-entry]` 一致。
- 入口点击必须在 `.phone-screen` 内打开场景，禁止顶层浏览器离开 `wego-app/index.html`。

## 页面打开方式

只执行 `design_consumption_plan.page_presentation`：

| type | 实现语义 | navbar 左侧 |
| --- | --- | --- |
| `push` | App 内栈式层级页面 | `back-icon` |
| `modal` | 当前场景上的轻量对话层 | 按契约使用关闭或取消 |
| `sheet` | 底部进入的选择或操作层 | 按契约使用关闭 |
| `full-screen-modal` | 覆盖手机屏的复杂编辑流程 | `text-cancel` 或 `close-icon` |

- `coversTabBar` 必须等于 `covers_tab_bar`。
- `push` 使用 `slide-left`；`modal` 常用 `fade`；`sheet/full-screen-modal` 使用底部进入退出，具体以计划为准。
- 所有层都挂在 `.phone-screen` 内。
- 不得把 push 页面实现为 overlay，也不得把 overlay 实现为独立 route，除非设计计划明确如此。

### 多层 push

- `sceneLayer` 是栈容器，每次 push 创建独立 panel，不销毁下层 DOM 和状态。
- `ctx.back()` 只弹出栈顶；栈空时回到宿主。
- 切换 Tab 或清空场景层时才清空整个栈。
- `sceneLayer` 容器保持透明，不透明页面背景放到每个 panel，避免转场期间白屏遮住下层。
- `leaf_level >= 3` 的页面注册独立 push route，由父场景 `ctx.navigate(routeId)` 打开，子场景用 `ctx.back()` 返回。
- 多级页面不得用 `ctx.openFullScreenModal()` 冒充栈式导航。

## 组件与设计计划消费

按 `surface_designs[]` 和 `component_mapping[]` 实现：

- `exact / near`：严格按命中 pagePattern、UI Kit 节奏和映射实现。
- `fallback`：只按 `matched_blueprint` 的布局、允许组件和禁止项实现。
- `gap`：停止实现，回到 `wego-design`。

按 `consumption_mode` 分派：

- `stable-variant`：在组件契约中找到对应变体，按 `domAnatomy` 和 Preview 复制正式 markup，不替换维度、不跨变体混搭。
- `composition-constraint`：完整执行 `selected` DOM 路径，不省略容器、修饰类、状态类或资产路径。
- `free-composition`：在契约 `domAnatomy` 范围内实现，可增加业务作用域布局胶水，但不得发明组件结构。

硬约束：

- 连续 cell/form 使用 `.cell-group`、`.form-group` 等正式容器。
- 页面业务 class 只做布局和作用域，不能替代组件 class。
- 不发明组件、子元素、修饰类、Token 或图标资产。
- 不输出给 AI 或工作流看的内部说明文案。
- 主内容区域宽度不受内容多少影响；空内容和短文本下仍占满计划规定的可用宽度。

navbar 绑定：

- `back-icon` → `.navbar__left-btn > i.wego-iconfont-s.icon-fanhui`
- `text-cancel` → `.navbar__left-text`，文案固定“取消”
- `close-icon` → `.navbar__left-btn > i.wego-iconfont-s.icon-cha`

## 对象管理列表实现

命中 `object-management-list-page` 时：

- 列表只展示对象识别、关键状态、1–2 条摘要和必要操作。
- 详情字段进入下钻页、sheet、dialog 或编辑表单。
- 默认执行设计计划中的横向主结构和图片策略。
- 1–2 个高频安全操作可外露；3 个及以上或包含危险/低频操作时按计划收纳。
- 没有已注册菜单或 popover 时不得临时发明通用组件；只有设计计划明确允许的场景级临时承载才可实现。
- 危险操作始终进入确认 dialog。

## 真实业务交互

原型必须体现完整状态变化：

- 选择、开关、输入、筛选、批量操作、保存、取消、删除和创建按需求可操作。
- 保存或完成后有明确反馈，例如 toast、摘要更新、返回或关闭。
- toast 由宿主 `ctx.toast()` 统一管理，scene 不自建 toast 容器；跨 route、Tab、overlay/push 返回和下一次操作时清理旧 toast，同一时刻只保留一个。
- 空态、禁用态、错误态和成功态按 `page_spec` 实现。
- 默认使用内存状态；只有需求明确要求刷新或跨会话保留时使用持久化。
- switch、计数器等有状态动画的组件优先更新状态 class、`aria-*` 和业务值，不整组重渲染导致动画丢失。

## 移动端视口、键盘与滚动

宿主负责页面视口和固定导航，业务 scene 只负责自身内容区：

- scene 不修改 viewport meta、不直接控制 `.phone-frame`、`.phone-screen` 或浏览器顶层滚动。
- 顶部导航与内容滚动区分离；输入聚焦时导航保持在宿主顶部，内容区独立滚动并保证当前输入可见。
- 键盘弹出、收起、连续切换输入框、返回页面和横竖屏变化后，宿主高度、底部安全区和滚动位置必须恢复正确。
- 不在 scene 内通过额外 `position: fixed`、硬编码视口高度或重复 viewport 监听修补宿主问题。
- 若宿主基线需要修复，同时更新正式宿主、`templates/host-shell.*` 和对应验收规则。

## 资源同步

`wego-app/lib/` 是部署副本：

- Token 修改源：`.codex/skills/wego-design/colors_and_type.css` 与 `css.json`。
- 组件样式修改源：对应 Preview 标记区和提取脚本。
- 图标与图片修改源：`.codex/skills/wego-design/iconfont.css` 或 `assets/`。

更新源文件后运行：

```bash
node scripts/sync-wego-app-lib.mjs
node scripts/sync-wego-app-lib.mjs --check
```

`assets/` 整体同步，确保 `icons/app-center/` 等资产完整。禁止只修改 `wego-app/lib/*`。

## 预览与本地直开

同一 `wego-app/index.html` 必须：

- 电脑端显示手机壳，内容位于 `.phone-screen`。
- 移动端隐藏手机壳视觉，铺满真实 viewport。
- 不依赖 npm、构建框架、`fetch()` 或 XHR 读取本地文件。
- 通过相对路径 `<link>` 和 `<script>` 加载 CSS、JS 和资源。
- 模态、sheet、push 和底部固定操作栏正确处理安全区。

`.preview-shell`、`.phone-frame`、`.phone-screen`、`.phone-status`、`.phone-indicator` 只属于宿主，不得进入 scene markup 或 scene CSS 选择器。

## 提交与部署闭环

当任务包含正式交付且用户未明确要求不推送时：

1. 完成场景、宿主和资源同步。
2. 运行仓库要求的验证。
3. 使用显式路径暂存并提交，推送到约定分支。
4. 若仓库以 `main` 触发 Vercel，记录实际推送 commit。
5. 只根据已核实结果报告部署状态。

部署状态：

- `success`：推送成功，且对应 Production 部署已确认 Ready。
- `pending`：推送成功，但本轮尚未确认 Vercel Ready；不得描述为线上已可用。
- `degraded-local`：推送或部署失败；说明错误并提供 `wego-app/index.html` 本地入口。
- `not-run`：用户明确要求不部署或任务在部署前终止；说明原因。

不得把异步构建中的状态写成 `success`，也不得虚构 Production Domain、commit hash 或验证结果。

## 验证与交接

实现完成后至少检查：

```bash
node scripts/specs.mjs check
node scripts/validate-wego-design.mjs
```

涉及设计系统源资源时再检查同步状态；正式全量交付按需要运行：

```bash
node scripts/validate-wego-design.mjs --scope=full --strict
```

随后交给 `wego-tests`，并提供：

- App 入口、场景目录和 route。
- 宿主入口位置和页面打开方式。
- 已实现的状态变化与反馈。
- 实际执行的验证命令及结果。
- commit、推送和部署状态；未执行或未确认的事项明确标注。

## 禁止事项

- 绕过偏差判定直接改场景。
- 创建第二套宿主或独立任务原型。
- 重画与任务无关的固定宿主内容。
- 绕过设计计划自由发挥页面范式、布局和组件。
- 引入 React、Vue、Next.js 等框架。
- 使用 `fetch()` / XHR 加载本地 scene HTML。
- 使用普通链接或 `location.href` 离开 App。
- 复制 UI Kit Showcase 外壳到业务场景。
- 默认强制持久化。
- 伪造测试、提交、推送或部署结果。
