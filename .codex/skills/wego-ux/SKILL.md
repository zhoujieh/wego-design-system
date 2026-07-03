---
name: wego-ux
description: 将 page_spec 和 design_consumption_plan 正式落成产品原型项目的技能。输出静态 HTML/CSS/JS 多页面项目，不依赖前端框架，可在手机浏览器中直接预览；遵守 wego-design 的组件与规范边界。
---

# Wego UX

这是唯一正式产出产品原型的环节。

## 输入前提

开始前必须已经有：

- `page_spec`，且已落盘到 `{task-folder}/_spec/page_spec.json`（落盘规则见 `wego-product/SKILL.md`）
- `design_consumption_plan`，且已落盘到 `{task-folder}/_spec/design_consumption_plan.json`（落盘规则见 `wego-design/SKILL.md`）

找不到这两份文件时不进入原型生成，先回到前两段补齐。同一任务迭代时复用原 `_spec/` 目录，按版本归档（见 `wego-product`、`wego-design` 的落盘规则）。

如果 `page_spec.json` 声明了 `host_container` 和 `route_id`，说明这个任务挂在固定宿主模板里；此时必须先判断该任务目录是否已经完成过首次套壳。

## 原型骨架

使用**静态 HTML/CSS/JS** 多页面项目结构，不引入任何前端框架依赖（无需 npm install、无需构建）。

目标：

- 浏览器直接打开即可预览
- 可在手机浏览器中独立预览
- 页面间跳转方式必须按 `design_consumption_plan.page_presentation.type` 执行，且只能在 `index.html` 的手机屏内容器内切换，详见下方"页面打开方式"
- 页面交互使用内联 `<script>` 或共享 JS 文件，不依赖 React/Vue 等框架
- 所有任务入口同一个链接支持桌面/手机两种预览形态：`index.html` 作为唯一预览外壳，电脑端显示手机外壳，移动端隐藏外壳并铺满真实 viewport

## 任务文件夹规则

- 原型项目必须放在项目根目录下的任务级文件夹中
- 不允许把页面文件、配置文件、资源文件直接散落在仓库根目录
- 如果当前任务已经有对应文件夹，继续在原文件夹内迭代
- 只有新任务才创建新文件夹；新任务文件夹必须使用中文业务语义命名
- 已有英文或其他命名的历史任务目录继续复用，不为命名规则单独重命名

新任务文件夹命名示例：

- `批发规则配置/`
- `多仓配货规则/`

## 标准项目结构

至少包含：

```text
task-folder/
├── index.html                 # 项目入口/首页
├── pages/                     # 业务页面
│   ├── delivery-rule.html     # 示例：多仓配货规则
│   └── ...
├── css/
│   └── page.css               # 页面级样式（页面布局、业务辅助类）
├── js/
│   └── app.js                 # 共享交互逻辑（radio 互斥、switch 切换等）
├── assets/                    # 业务静态资源（图片等）
├── lib/                       # 设计系统文件（从 .codex/skills/wego-design/ 复制）
│   ├── colors_and_type.css
│   ├── iconfont.css
│   ├── components.css
│   ├── fonts/
│   │   ├── wego-iconfont.woff2
│   │   └── ...
│   └── icons/
│       └── ...
└── README.md
```

多页面项目可以扩展更多 pages/，但不能低于这个最小结构。

## 单一预览外壳架构

每个任务文件夹只能有一个电脑端手机外壳，且只能位于 `index.html`。所有后续页面、设置页、弹层页都在 `index.html` 的 `.phone-screen` 内展示，不允许顶层浏览器跳出这个容器。

- `templates/page-shell.html`：`index.html` 的真实页面骨架 + 唯一全局预览外壳；外壳仅用于桌面验收，移动端隐藏
- `templates/page.css`：页面级样式基线（全局预览外壳、容器宽度约束、模态层 fixed 定位、业务样式区）
- `templates/host-shell.html` / `templates/host-shell.css` / `templates/host-shell.js`：固定 App 宿主模板；只在新任务首次落原型时直接复制一次
- `pages/*.html` 若保留，只能作为可加载的 screen 片段或内容源；不得包含 `<html>` / `<body>` / `.preview-shell` / `.phone-frame` / `.phone-screen`

单壳规则：

- 电脑端（默认宽屏）：`index.html` 显示 `.preview-shell` / `.phone-frame` / `.phone-screen`，用于模拟手机预览
- 手机端或窄屏：通过 media query 去掉外壳视觉，内容按真实 viewport 铺满
- 外壳类只服务预览，业务布局、组件选择、状态回填都不能依赖外壳类
- `phone-status` 和 `phone-indicator` 属于预览外壳安全区；`phone-body` 等 UI Kit 内部内容容器仍不得进入任务产物
- `index.html` 内指向 `pages/*.html` 的入口必须使用壳内加载标记（如 `data-route`、`data-screen-src`、`data-open-modal`）和 JS 处理；禁止普通 `<a href="./pages/xxx.html">` 让浏览器顶层离开手机壳
- 普通业务页、二级选择页、设置页和全屏模态页都不再生成第二套手机壳；若需要复用文件，作为 fragment/source 被 `index.html` 拉取后注入 `.phone-screen`

生成前 checklist：

- [ ] 同一任务文件夹只有 `index.html` 含 `.preview-shell` / `.phone-frame` / `.phone-screen`，且移动端隐藏外壳视觉
- [ ] `pages/*.html` 是片段或内容源，不含 `<html>` / `<body>` / `.preview-shell` / `.phone-frame` / `.phone-screen`
- [ ] 所有入口点击都在 `.phone-screen` 内切换内容或打开 overlay，不让顶层浏览器跳到 `pages/*.html`
- [ ] 已删除 `.uikit-shell` / `.phone-body` 类与 DOM；`.phone-status` / `.phone-indicator` 仅作为最外层预览安全区存在
- [ ] `page.css` 不引用 `--safe-area-top` 或 `--safe-area-bottom-content`
- [ ] 模态层挂载在 `.phone-screen` 内并覆盖手机屏，不覆盖整个浏览器 viewport
- [ ] 容器使用 `max-width` + `margin-inline: auto` 约束（默认业务页 768px）
- [ ] 已读取 `design_consumption_plan.page_presentation`，并按 `type` 选择 `push` 或 `full-screen-modal` 打开方式

## 生成规则

1. 先检查当前任务是否已有原型文件夹
2. 已有则复用原目录
3. 没有则在项目根目录创建新任务文件夹
4. 如果 `page_spec` 声明了 `host_container + route_id`：
   - 新任务首次生成：直接复制完整固定 App 宿主模板到任务目录，再按 `host_container + route_id` 插入入口、目标页、跳转关系和状态回填
   - 同任务后续迭代：先检测任务目录是否已有宿主壳；已存在时按 `route_id` 定位旧入口并增量更新，不重复套壳、不重复插入入口
5. 根据 `design_consumption_plan` 落页面骨架、导航、内容布局、组件组合
6. 读取 `design_consumption_plan.page_presentation`，先确定页面打开方式：
   - `push`：壳内 push，使用 JS 更新 `.phone-screen` 内 screen 内容，可配合 `history.pushState` 同步地址；禁止普通 `<a href="./pages/xxx.html">` 或 `location.href` 让顶层浏览器离开 `index.html`
   - `full-screen-modal`：壳内 overlay，入口必须使用 modal trigger 打开 `.phone-screen` 内 overlay，不得只输出普通 `href` 跳转到主业务页
7. 读取 `design_consumption_plan.surface_designs[]`，逐 surface 执行：
   - `exact` / `near`：按命中的 pagePattern、UI Kit 节奏和组件映射生成
   - `fallback`：只能按 `matched_blueprint` 指向的 `uikit-plan.json.fallbackPageBlueprints[]` 生成
   - `gap`：停止生成，回到 `wego-design` 补齐 blueprint/UI Kit/组件契约
8. 从组件预览页复制组件 markup，直接粘贴到 HTML 中（不做转换、不改 class 名）。组件组合约束以 `uikit-plan.json` 对应 pagePattern 的 `compositionConstraints` 或 fallback blueprint 的规则为权威来源。
9. 读取 `library-consumption.json` 中 `buildMobileAppPage.copyFiles`，按清单复制设计系统文件到 `lib/` 目录；不在清单内的文件（如 scaffold.css、typography.css、css.json、specs/*.md、ui_kits/*、metadata.json）一律不复制
10. 每个 HTML 页面通过 `<link>` 标签引用 `lib/` 下的 CSS 文件
11. 页面交互用内联 `<script>` 或 `js/app.js` 实现，直接操作 DOM

### 固定宿主模板（必读）

当 `page_spec` 存在 `host_container` 和 `route_id` 时，说明该任务需要挂在固定宿主模板中。执行规则：

- 固定宿主模板由 `wego-ux` 维护，不属于 `wego-design` 页面范式
- 固定宿主模板是现成 App 基地，生成时直接复制 `templates/host-shell.html`、`templates/host-shell.css`、`templates/host-shell.js`
- 宿主模板中的 Tab、工作台、我的页、默认入口、UI 和基础交互都按模板保留；AI 只能按 `route_id` 增量插入或更新目标入口、业务页链接、状态回填和必要交互
- 禁止参考宿主模板后重新绘制一套宿主 App
- 固定五项 Tab：`动态 / 好友 / 工作台 / 消息 / 我的`
- `host_container` 负责声明入口路径：
  - `tab`：入口挂载的 Tab
  - `entry_label`：一级入口
  - `subentry_label`：二级入口
  - `leaf_level`：当前页层级
  - `entry_type`：`cell | grid-entry`
- `route_id` 是稳定键，用来定位和复用已有入口
- 同任务后续迭代时：
  - 不重复生成第二套宿主页
  - 不重复插入相同入口
  - 不重置与当前任务无关的既有入口和页面
  - 只更新 `route_id` 对应入口、目标页面与状态回填逻辑
- “我的”页默认内容使用真实业务参考版本，保留 `身份资料 + 应用入口 + 设置类入口`
- “工作台”页默认用于承接业务工具入口；入口图标优先使用 `lib/icons/app-center/*.svg`

### surface_designs 执行规则（必读）

- 每个 HTML 页面或动态页面片段必须能对应到一个 `surface_designs[].surface_id`
- `fallback` surface 不允许自由发挥页面范式；必须引用 `matched_blueprint` 的布局规则、允许组件和禁止项
- 页面级业务 class 只能做 `allowed_page_styles` 中声明的布局胶水和业务作用域，不得替代已注册组件 class
- 不输出面向 AI/工作流的内部说明文案，例如“工作流验证任务”“按某范式输出”“验证闭环”等；页面文案必须是用户可见业务文案
- 发现 `match_status: gap` 时不要生成或补写页面，先回到 `wego-design` 输出设计缺口

### 场景类型执行（必读）

生成原型时，必须读取 `library-consumption.json` 的 `scenarioTypeRegistry`，按场景类型执行对应规则。本技能是以下场景类型的主要环节（primaryWorkflowStage=wego-ux）：

- **组件消费决策类**（次要环节）：按 `design_consumption_plan.component_mapping` 中标注的场景类型执行，不临时判断修饰类/尺寸/状态
- **无 UI Kit 页面构成类**（次要环节）：按 `surface_designs[].matched_blueprint` 执行 fallback 页面构成，不临时发明页面范式
- **UI Kit 到生产转换类**（主要环节）：UI Kit 演示外壳不复制到业务片段；任务产物只在 `index.html` 保留唯一预览外壳，生产结构语义化封装为 `<section>`，可借鉴节奏/组合/收口方式
- **全局预览外壳类**（主要环节）：所有任务入口同链接桌面端显示单一手机外壳、移动端隐藏外壳；后续页面必须在同一个 `.phone-screen` 内展示
- **页面打开方式绑定类**（主要环节）：按 `design_consumption_plan.page_presentation.type` 分派 `push` 或 `full-screen-modal`，不得自行把命中 pagePattern 的打开方式改成另一种
- **原型交付标准类**（主要环节）：实现 localStorage 状态持久化、打开时回填、保存后反馈闭环、宿主页状态同步
- **宿主模板路径绑定类**（主要环节）：按 `host_container + route_id` 绑定宿主入口、业务页路径和迭代复用

补充执行约束：

- 若 `design_consumption_plan` 已命中某个已注册组件的稳定场景，生成时必须整体复用该场景语义和结构，不得再拆出内嵌关联控件尺寸、间距、层级做局部再设计
- 父项选中后才出现的补充字段、跳转入口、筛选范围或排除条件，必须按父场景延展实现；不得转译成“列表项 + 独立平级 section”
- 不得用新增 helper 文案去补结构语义缺口；helper 只保留给结构无法承载且业务必须提醒的信息
- navbar 背景统一依赖公共 CSS 与 `data-bg` 的对应关系：`page`=灰底、`surface`=白底；普通业务页不要在任务级 `page.css` 单独覆盖 navbar 背景，透明反白场景仅走 `.navbar--fixed-transparent`

禁止：
- 不读取 scenarioTypeRegistry 直接生成
- 复制 UI Kit 演示外壳类到生产页面
- 删除全局预览外壳能力，或在 `pages/*.html` 生成第二套手机壳
- 通过普通 `<a href="./pages/xxx.html">` 或 `location.href` 打开后续页面，导致顶层浏览器离开 `index.html`
- 交互原型不实现状态持久化
- 同一任务迭代时重复初始化宿主模板
- 跳过 `surface_designs` 只凭总的 `matched_uikit` 生成
- 遇到 `fallback` 时脱离 `matched_blueprint` 自造结构
- 已命中稳定场景后，仍二次改写内嵌选择控件规格、父子联动结构或冗余说明
- 把 ux 类规则回流到 wego-design/SKILL.md（应回流到 wego-ux/SKILL.md 或 templates/）

## 输出要求

最终输出的是"产品原型项目"，不是说明文档。

最小交付结果应能回答：

- 原型项目位于哪个任务文件夹
- 页面入口在哪里（`index.html`）
- 如何预览（浏览器直接打开 `index.html`）
- 页面间如何跳转

## 禁止事项

- 不绕过 `design_consumption_plan` 自由发挥页面范式
- 不引入 React、Vue、Next.js 等前端框架
- 不把产物散落在仓库根目录
- 不把 UI Kit Showcase 外壳当生产页面模板


## 页面打开方式

`design_consumption_plan.page_presentation.type` 决定了页面间的跳转实现。生成时必须按 type 分派，不自行判断。

| type | 页面间跳转 | DOM 结构 | 动画要求 | transition |
|------|-----------|---------|---------|
| `push` | 壳内 push：JS 切换 `.phone-screen` 内 screen，可配合 `history.pushState` | `index.html` 保留唯一外壳，`pages/*.html` 作为 fragment/source | 可用轻量左右切换或无动画，不能触发顶层浏览器跳页 | - |
| `full-screen-modal` | 壳内 overlay + fetch 内容片段 | overlay 预置在 `.phone-screen` 内，JS 动态加载业务片段 | 由 `page_presentation.transition` 映射，见下方转换表 | `slide-up-enter, slide-down-exit` |

**transition 字段→CSS 动画映射**（写在 `page.css` 或内联 `<style>`，按 `page_presentation.transition` 值选择）：

| transition 值 | 初始 `transform` | 激活态 `transform` | 退出（反向） |
|---|---|---|---|
| `slide-up-enter, slide-down-exit` | `translateY(100%)` | `translateY(0)` | `translateY(100%)` |

### full-screen-modal 实现要点

1. 入口页 `index.html` 在 `.phone-screen` 内预置 overlay 容器：`<div id="modal-overlay" class="modal-overlay" hidden></div>`（`display: none` → `display: flex` 由 JS 控制）
2. 入口触发必须使用 `data-open-modal` 或等价 JS modal trigger；不能只用普通 `<a href="...">` 把主业务页作为 push 页面打开
3. 触发打开时：`fetch()` 业务片段 → `DOMParser` 提取 fragment 根节点或页面内容区 → 插入 `#modal-overlay` → 移除 `hidden` → `requestAnimationFrame(() => { overlay.classList.add('modal-overlay--active') })`，两段式触发确保浏览器先绘制初始 `translateY(100%)` 再过渡
4. overlay 样式（写入 `page.css` 或内联 `<style>`）必须限制在手机屏上下文：
   - `.phone-screen { position: relative; }`
   - `.modal-overlay { position: absolute; inset: 0; z-index: var(--z-overlay); background: var(--bg-page); }`
   - `transform: translateY(100%); transition: transform var(--duration-normal) var(--ease-enter);`
   - 打开态加 `.modal-overlay--active { transform: translateY(0); }`
5. 关闭时：移除 `.modal-overlay--active` → 等待 transition 结束（`transitionend` 事件）→ 清空内容 → 加回 `hidden`
6. `covers_tab_bar: true` 时 overlay 的 z-index 需高于 bottom-nav（`--z-overlay` 已是 500）
7. 业务页文件作为 fragment/source，不保留第二套 `<html>`/`<body>`/手机壳；作为 modal 时只插入业务内容
