# Nimbus Core

从现有 `previews/` 文件夹提炼的暗色优先设计系统 —— **保留核心子集（23 个组件）** 以覆盖两个 UI Kit（`dashboard`、`dev-explorer`）以及设置面板。权威 Token 源头为 `colors_and_type.css`（+ `css.json`）。

## 打开 Showcase

所有 HTML 文件通过相对路径引用 `colors_and_type.css`，作为静态页面运行。

| Showcase | 路径 |
|----------|------|
| 组件 — Alert | `preview/component-alert.html` |
| 组件 — Buttons | `preview/component-buttons.html` |
| 组件 — Forms | `preview/component-forms.html` |
| 组件 — Table | `preview/component-table.html` |
| UI Kit — Dashboard | `ui_kits/dashboard/index.html` |
| UI Kit — Dev Explorer (IDE) | `ui_kits/dev-explorer/index.html` |

## 包含内容

- `colors_and_type.css` —— 权威 Token 源头（直接从项目根目录 `colors_and_type.css` 引用，标记为 `/* @dark-only */`，含 `/* @group-priority: brand-green, status, brand-blue, brand-purple, brand-yellow */`）。
- `css.json` —— 机器可读 Token 投影（`color`、`font`、`radius`、`spacing`，以及规范预留的空 `shadow`/`size` 桶）。
- `scaffold.css` —— 页面骨架：reset、body/html、标题、布局辅助（`.row`、`.col`、`.grid-*`、`.stack-*`）、预览页原子样式（`.pv-header`、`.pv-section*`）、共享原子（`.ds-tooltip`、`.ds-popover`、`.ds-empty`、`.ds-code`、`.ds-kbd`、`.mono`/`.num`），以及 JetBrains Mono 的 `@import`。手写。
- `components/` —— 23 个组件 slug（`{slug}.json` + 共享的 `index.json`）。每个契约包含 `category`、`tokensConsumed`、`domAnatomy` 和 `provenance`。
- `preview/` —— 23 个组件预览页（`component-{slug}.html`）。每个页面在 `<style>` 中的 `/* @component-css-start */` 和 `/* @component-css-end */` 标记之间内嵌其 `.ds-*` 类的权威 CSS。
- `ui_kits/` —— 2 个页面级 Showcase（`dashboard`、`dev-explorer`），每个为独立的交互式 React 18 `index.html` 单文件，附带同级 `quality-report.json`。
- `components.css` —— 聚合组件 class 定义，由 `design-library-creator/scripts/extract-components-css.mjs` 从上述标记块**自动生成**。请勿手工编辑 —— 编辑对应的 `preview/component-*.html` 文件后重新生成。
- `uikit-plan.json` —— 组件白名单（2 核心 + 21 辅助）和基于 `components/index.json` 通过 `generate-uikit-plan.mjs` 派生的槽位分配。
- `library-consumption.json` —— 消费本库的 AI 推荐下游读取顺序。
- `assets/icons/` —— 115 个捆绑 SVG 图标。
- `icons.js` —— 可选的内联图标精灵渲染器。

## Token 亮点

| 分组 | 示例 |
|------|------|
| 表面 | `--bg-base-default #1A1B1D`、`--bg-base-secondary`、`--bg-overlay-l1..l4` |
| 品牌 | `--bg-brand #32F08C`、`--bg-brand-hover #0FDC78`、`--bg-brand-popup` |
| 状态 | `--status-{primary, success, alert, warning, error}-{default, hover, active, surface-l1..l3}` |
| 文字 / 图标 | `--text-default #D1D3DB`、`--text-secondary`、`--icon-tertiary` |
| 边框 | `--border-neutral-l1..l3`、`--border-brand`、`--border-contrast` |
| 排版 — 正文 | `--body-{xs, sm, md, base}-{font-family, font-size, font-weight, line-height}`（+ `*-strong`） |
| 排版 — 标题 | `--heading-{3xs..3xl}-...` |
| 代码 | `--code-editor-*`、`--code-terminal-*`、语法色调 `--code-{text, link, number, ...}` |
| 圆角 | `--radius-2 / 4 / 6 / 8 / 10 / full` |
| 间距 | `--spacer-0 / 4 / 6 / 8 / 12 / 16 / 24 / 32 / 40` |

## 命名规范

Token **保持源命名不变** —— 没有 `--color-*` 可移植别名。组件直接消费 `var(--bg-*)`、`var(--text-*)`、`var(--status-*-*)`。禁止重命名、扩缩或自创值；如需缺失的变体，先运行 `refine-library` 扩展源头。

## 生成说明

- 原始 `previews/` 文件的 HTML 结构保持不变。仅重写了两个 `<link>` 路径（及 `icons.js` 的一个 `<script>` 路径）使其指向库根目录。
- `data.html` 按约定分类拆分为三个组件文件（`avatar.html`、`tag.html`、`table.html`）。
- **故意不包含** Token 专项预览页（`colors`、`typography`、`spacing`、`radius`）—— 由 `colors_and_type.css` + `css.json` 纯粹表示。
- UI Kit 以交互式 React 18 单文件 Showcase 形式交付（`<script type="text/babel">` + Babel Standalone CDN），按 design-library-creator skill 规范限制为 `max-width: 1184px`。

## 下游消费指南

本设计系统有三层契约，下游消费时**按场景挑文件**，不要盲目复制 UIKit。

### 三层契约

| 层 | 文件 | 用途 | 是否可直接复制 |
|---|---|---|---|
| **Tokens** | `colors_and_type.css` + `css.json` | 颜色 / 字号 / 圆角 / 间距等设计语言 | ✅ 直接 link 或读 css.json |
| **Components** | `components.css` + `preview/component-*.html` | 单个组件的 markup + class | ✅ 复制 markup，引用 components.css |
| **UI Kit Showcase** | `ui_kits/{type}/index.html` | 页面级**样品展示**（max-width 1184px） | ❌ **不要直接复制根容器** |

### UI Kit 是 Showcase，不是页面模板

UI Kit 受 design-library-creator skill 硬约束：`max-width: 1184px` + 不允许 `transform: scale`。它是**给设计师看产品长什么样的样品**，不是给开发抄到 1920/2560 真实画布的母版。直接复制会导致两侧大片留白。

### 正确的下游消费流程

```
你要做：在自己画布上生成一个 IDE 风格页面
  ↓
1. 读 ui_kits/dev-explorer/index.html → 看页面"结构骨架"
   （titlebar + activity-bar + sidebar + editor + chat）
  ↓
2. 看每个 region 用了哪些 .ds-* 类
   （sidebar 用 .ds-filetree、editor 用 .ds-editortabs ...）
  ↓
3. 进 preview/component-{slug}.html 拿干净的组件 markup
   （preview 不带 1184 容器，组件级是 fluid 的）
  ↓
4. 在你自己的画布上写外层 grid
   - 不要继承 UI Kit 的 .uikit-shell（max-width: 1184）
   - 不要继承 UI Kit 的根 grid-template-columns（那是为 1184 调的比例）
   - 只继承组件层级的 markup + class
   - 顶层用 100vw / 100% / auto-fit grid 自适应你的画布
```

### 快速参考表

| 你想做什么 | 应该读 |
|---|---|
| 用品牌色 / 字号 / 间距 Token | [colors_and_type.css](./colors_and_type.css) 或 [css.json](./css.json) |
| 写一个按钮 / 表单 / 表格 | `preview/component-{slug}.html` + `components.css` |
| 写一个完整的页面（自定义画布） | UI Kit 看**结构思路** + preview 拿组件 markup + 自己写外层 grid |
| 看有哪些组件可用 | [components/index.json](./components/index.json) |

### UI Kit 内层组件其实是流体的

注意：UI Kit 的 1184 限制只在**最外层 `.uikit-shell` 容器**。内层所有 `.ds-*` 组件都是 fluid 的（`min-width: 0` + `1fr` + `minmax(0, 1fr)`）。所以正确做法是：把内层 region 整段复制出来，外层换成你自己的画布尺寸 grid。

## 图标

捆绑 SVG 图标位于 `assets/icons/`（115 个文件）。可选运行时精灵渲染器位于 `icons.js`。

## 后续步骤

- 优化或扩展 Token → `refine-library` 工作流。
- 新增组件 → `expand-components` 工作流。
- 生成额外的 Kit 类型 → `generate-additional-kit` 工作流。
