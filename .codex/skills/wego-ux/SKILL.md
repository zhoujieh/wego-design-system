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

## 原型骨架

使用**静态 HTML/CSS/JS** 多页面项目结构，不引入任何前端框架依赖（无需 npm install、无需构建）。

目标：

- 浏览器直接打开即可预览
- 可在手机浏览器中独立预览
- 页面间跳转方式必须按 `design_consumption_plan.page_presentation.type` 执行，详见下方"页面打开方式"
- 页面交互使用内联 `<script>` 或共享 JS 文件，不依赖 React/Vue 等框架

## 任务文件夹规则

- 原型项目必须放在项目根目录下的任务级文件夹中
- 不允许把页面文件、配置文件、资源文件直接散落在仓库根目录
- 如果当前任务已经有对应文件夹，继续在原文件夹内迭代
- 只有新任务才创建新文件夹

优先使用业务语义命名，例如：

- `wholesale-rule-config/`
- `delivery-rule-config/`

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

## 页面外壳模板

每个 HTML 页面的外壳结构以 `templates/page-shell.html` 和 `templates/page.css` 为权威来源，直接复制使用，不要从 UI Kit Showcase 复制外壳。

- `templates/page-shell.html`：无 phone-frame、uikit-shell、phone-status、phone-body、phone-indicator 的真实页面骨架
- `templates/page.css`：页面级样式基线（全局重置、容器宽度约束、模态层 fixed 定位、业务样式区）

生成前 checklist：

- [ ] 已删除 `.uikit-shell` / `.phone-frame` / `.phone-screen` / `.phone-status` / `.phone-body` / `.phone-indicator` 类与 DOM
- [ ] `page.css` 不引用 `--safe-area-top` 或 `--safe-area-bottom-content`
- [ ] 模态层使用 `position: fixed; inset: 0`，不使用 `position: absolute`
- [ ] 容器使用 `max-width` + `margin-inline: auto` 约束（默认业务页 768px）

## 生成规则

1. 先检查当前任务是否已有原型文件夹
2. 已有则复用原目录
3. 没有则在项目根目录创建新任务文件夹
4. 根据 `design_consumption_plan` 落页面骨架、导航、内容布局、组件组合
5. 从组件预览页复制组件 markup，直接粘贴到 HTML 中（不做转换、不改 class 名）。组件组合约束以 `uikit-plan.json` 对应 pagePattern 的 `compositionConstraints` 为权威来源。
6. 读取 `library-consumption.json` 中 `buildMobileAppPage.copyFiles`，按清单复制设计系统文件到 `lib/` 目录；不在清单内的文件（如 scaffold.css、typography.css、css.json、specs/*.md、ui_kits/*、metadata.json）一律不复制
7. 每个 HTML 页面通过 `<link>` 标签引用 `lib/` 下的 CSS 文件
8. 页面交互用内联 `<script>` 或 `js/app.js` 实现，直接操作 DOM

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
| `push` | `<a>` 标签跳转 | 独立 HTML 页面 | 无需，浏览器原生导航 | - |
| `full-screen-modal` | overlay 容器 + fetch 内容片段 | 入口页预置 `<div id="modal-overlay" class="modal-overlay">`，JS 动态加载业务页内容 | 由 `page_presentation.transition` 映射，见下方转换表 | `slide-up-enter, slide-down-exit` |

**transition 字段→CSS 动画映射**（写在 `page.css` 或内联 `<style>`，按 `page_presentation.transition` 值选择）：

| transition 值 | 初始 `transform` | 激活态 `transform` | 退出（反向） |
|---|---|---|---|
| `slide-up-enter, slide-down-exit` | `translateY(100%)` | `translateY(0)` | `translateY(100%)` |

### full-screen-modal 实现要点

1. 入口页 `index.html` 和所有主流程页面预置 overlay 容器：`<div id="modal-overlay" class="modal-overlay" hidden></div>`（`display: none` → `display: flex` 由 JS 控制）
2. 触发打开时：`fetch()` 业务页 HTML → `DOMParser` 提取页面内容区 → 插入 `#modal-overlay` → 移除 `hidden` → `requestAnimationFrame(() => { overlay.classList.add('modal-overlay--active') })`，两段式触发确保浏览器先绘制初始 `translateY(100%)` 再过渡
3. overlay 样式（写入 `page.css` 或内联 `<style>`）：
   - `position: fixed; inset: 0; z-index: var(--z-overlay); background: var(--bg-page);`
   - `transform: translateY(100%); transition: transform var(--duration-normal) var(--ease-enter);`
   - 打开态加 `.modal-overlay--active { transform: translateY(0); }`
4. 关闭时：移除 `.modal-overlay--active` → 等待 transition 结束（`transitionend` 事件）→ 清空内容 → 加回 `hidden`
5. `covers_tab_bar: true` 时 overlay 的 z-index 需高于 bottom-nav（`--z-overlay` 已是 500）
6. 业务页本身保留完整 HTML（含 `<html>`/`<head>`/`<body>`），可独立打开调试；作为 modal 时只使用其 `<body>` 内容
