# UI Kit 迁移报告：Layout 组件系统接入

**版本**：metadata 494  
**日期**：2026-07-31  
**范围**：system-settings、biz-rule-config、entity-form 三个 UI Kit  
**触发**：Layout 组件系统改造阶段 5

## 改动概要

三个 UI Kit 的页面骨架从场景级自由 CSS（`.phone-body` + `overflow-y:auto`）迁移为正式 Layout 组件树。命中 UI Kit 时可继承其登记的 `layoutTree`，无需 AI 自行搭建。

## Layout 组件使用分类

| 类别 | 组件 | 适用场景 |
|---|---|---|
| 页面级 | `layout-page`、`layout-scroll` | 场景主页面，提供唯一主滚动 |
| 嵌入级 | `layout-section`、`layout-flow`、`layout-split`、`layout-grid`、`layout-scroll-row` | 可嵌入任何滚动容器（包括 `modal__body`、`actionsheet__list`），提供信息分区与排列 |

## 逐 Kit 迁移明细

### 1. system-settings（push 场景）

- **范式**：push 进入的设置列表
- **迁移前**：`.phone-body` 自带 `overflow-y:auto`，场景 CSS 承担页面骨架
- **迁移后**：`layout-page` > `layout-scroll` > 3× `layout-section` edge=M0
- **layoutTree**：`layout-page` 根，navbar 在 top 槽位，`layout-scroll` 在 body，3 个 `layout-section` edge=M0
- **滚动权**：`layout-scroll` 唯一承担主滚动；push 转场保留在 `.uikit-settings-screen` 的 `absolute + transform` 上
- **视觉保真**：edge=M0 保持 cells 全宽；首段 `gap-before: var(--spacer-8)` 保留顶部 8px 留白

### 2. biz-rule-config（全屏模态）

- **范式**：`modal--fullscreen` 全屏模态设置
- **迁移前**：`.phone-body` 自带滚动；modal 内部无结构化分区
- **迁移后**：
  - 宿主页：`layout-page` > `layout-scroll` > `layout-section` edge=M0
  - 模态内部：`modal__body` 承担滚动（自带 `overflow-y:auto`），内部 3× `layout-section` edge=M0
- **layoutTree**：`modal--fullscreen` 根，navbar 在 title 槽位，`modal__body` 在 body 槽位（note：自带滚动，不使用 `layout-scroll`），3 个 `layout-section` edge=M0
- **滚动权**：`modal__body` 自身承担，不套 `layout-scroll`（避免双层滚动）
- **审查修复**：初始迁移在 `modal__body` 内套了 `layout-scroll`，审查发现 `modal__body` 已自带 `overflow-y:auto` 会形成双层滚动，已移除

### 3. entity-form（全屏模态）

- **范式**：`modal--fullscreen` 全屏模态表单
- **迁移前**：`.phone-body` 自带滚动；modal 内部无结构化分区
- **迁移后**：
  - 宿主页：`layout-page` > `layout-scroll` > `layout-section` edge=M0
  - 模态内部：`modal__body` 承担滚动，内部 3× `layout-section` edge=M0
- **layoutTree**：同 biz-rule-config 模式
- **滚动权**：同 biz-rule-config

## 关键设计决策

### 为什么全屏模态不用 `layout-scroll`？

`modal__body`（`component-modal.html:237-243`）自带 `overflow-y: auto; min-height: 0`，已经是滚动容器。`layout-scroll` 也带 `overflow-y: auto`，嵌套会形成双层滚动。

按 `layout-scroll.json` 契约约定：

> 不要把 `layout-scroll` 放进 `modal__body` / `actionsheet__list` 等自带 `overflow-y` 的浮层滚动容器内部；浮层内部直接用 `layout-section` 等嵌入级组件。

这与计划 4.2 的 modal/overlay 滚动豁免一致：浮层内部滚动由浮层组件自身约定，不计入场景主页面唯一 `layout-scroll` 约束。

### 为什么全屏模态不用 `layout-page`？

`modal--fullscreen` 自身就是页面框架的替代：`modal__panel` 铺满全屏，`modal__title` 承担顶部槽位，`modal__body` 承担正文与滚动。再套 `layout-page` 会与 modal 组件自身的面板结构重复，违反 `layout-page` 契约的"不创建第二个宿主"。

### 嵌入级 Layout 组件的使用边界

`layout-section`/`layout-flow`/`layout-split`/`layout-grid`/`layout-scroll-row` 不限于页面主滚动区，可嵌入任何滚动容器：

| 宿主滚动容器 | 可用嵌入级组件 |
|---|---|
| `layout-scroll`（场景主滚动） | 全部 |
| `modal__body`（模态滚动） | 全部 |
| `actionsheet__list`（操作表滚动） | 全部 |

`layout-scroll` 只在宿主不提供滚动容器时使用——即场景主页面。

### 半弹窗的 Layout 使用

半弹窗（`modal--frame`/`modal--frame-x`）与全屏模态同理：`modal__body` 自带 `overflow-y:auto`，内部不使用 `layout-scroll`，但仍可用 `layout-section` 等嵌入级组件做信息分区。当前无 UI Kit 使用半弹窗范式，待产生时自然验证。

## 验证结果

| 验证项 | 结果 |
|---|---|
| `extract-components-css.mjs` | 36 组件 924 规则 0 警告 |
| `sync-wego-app-lib.mjs` | 部署副本同步完成 |
| `validate-component-contract-parity.mjs` | 36 组件 375 Token 通过 |
| `validate-wego-design.mjs --scope=system --strict` | 0 错 0 警 |
| `test-scene-contract-tools.mjs` | 通过 |
| `test-scroll-layout.mjs` | 通过 |
| `test-sync-wego-app-lib.mjs` | 通过 |

## 未覆盖项

- `layoutTree` 与真实 DOM 一致性守卫未实现（计划 9.2 列出，待新场景产生后验证对齐效果）
- 场景 CSS 禁止项守卫（10.2 的 flex/grid/sticky/overflow 拦截）因当前无场景暂缓
- 半弹窗（`modal--frame`/`modal--frame-x`）内部 Layout 使用未验证（当前无 UI Kit 使用半弹窗范式）
