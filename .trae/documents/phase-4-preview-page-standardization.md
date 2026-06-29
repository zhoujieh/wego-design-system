# 阶段 4：规范预览页 — 实施计划

## 摘要

规范所有 17 个预览页（`preview/component-*.html`），使其成为可靠的组件 CSS 权威来源。核心工作：清理标记块内的硬编码色值、将内联 SVG 统一为 iconfont、统一 CSS 引入方式、消除跨组件 CSS 重复、补齐缺失的语义 Token。

## 当前状态

- 17 个预览页全部有 `@component-css-start/end` 标记，覆盖率 100%。
- **6 个预览页**标记块内有硬编码色值（共约 18 处）。
- **4 个预览页**有严重内联 SVG 问题（bottom-nav、checkbox、chip、form）。
- **CSS 引入不统一**：`iconfont.css` 仅 11/17 引入，`components.css` 仅 6/17 引入。
- **form 预览页**在标记块外复制了完整的 button CSS（18-38 行），存在同步风险。
- **提取脚本**不检测标记块内硬编码 hex 和 scaffold 泄漏。

## 实施步骤

### 步骤 1：补齐缺失语义 Token

**目标**：为标记块内的硬编码值提供精确匹配的语义 Token。

**修改文件**：`colors_and_type.css` + `css.json`

| 硬编码值 | 新增/调整 Token | Token 值 | 使用组件 |
|---------|----------------|---------|---------|
| `#E5E5EA` (switch off 背景) | 新增 `--color-switch-off-bg` | `#E5E5EA` | switch |
| `rgba(0,0,0,0.15)` (checkbox/radio 边框) | 新增 `--color-border-input-default` | `rgba(0,0,0,0.15)` | checkbox, radio |
| `rgba(0,0,0,0.12)` (stack 边框) | 新增 `--color-border-subtle` | `rgba(0,0,0,0.12)` | stack |
| `#f33` (input error / chip 促销) | 使用已有 `--color-status-danger-default` (`#fa5051`)，视觉差异极小，不新增 Token | — | input, chip |
| `#f8f9fa` (input 背景) | 使用已有 `--color-surface-subtle` (`#f8f9fa`)，精确匹配 | — | input |
| `rgba(32,47,100,0.08)` (input 边框) | 使用已有 `--color-border-default`，精确匹配 | — | input |
| `rgba(255,51,51,0.1)` (input error 背景) | 使用已有 `--color-status-danger-surface-l2` (`rgba(250,80,81,0.20)`)，最接近语义 | — | input |
| `rgba(250,80,81,0.6)` (chip 优惠券边框) | 使用已有 `--wg-color-base-danger-alpha-60`，精确匹配 | — | chip |
| `rgba(255,255,255,0.1)` (chip 优惠券背景) | 新增 `--color-coupon-overlay` | `rgba(255,255,255,0.1)` | chip |
| `rgba(0,0,0,0.12)` (switch 阴影) | 使用已有 `--shadow-sm`，但只取 color 部分；建议新增 `--color-shadow-thumb` | `rgba(0,0,0,0.12)` | switch |
| `rgba(0,0,0,0.04)` (switch 外描边) | 使用已有 `--shadow-xs` 中的 color；建议新增 `--color-shadow-thumb-ring` | `rgba(0,0,0,0.04)` | switch |
| radio dark mode `rgba(255,255,255,*)` | dark mode tokens 已在 `colors_and_type.css` 的 `.dark` 块中有对应，检查是否已有匹配 | — | radio |

**决策**：
- `#f33` → 统一用 `--color-status-danger-default`，色差从 `#ff3333` → `#fa5051`，视觉上几乎不可见，且符合系统已有色值。
- `#E5E5EA` 与现有 `--wg-color-base-neutral-200`（`#e9eaef`）有色差，新增专用语义 Token `--color-switch-off-bg`。
- switch thumb shadow 不直接用 `--shadow-sm`（那是完整 `box-shadow` 值），新增两个 shadow color Token。

**同步**：修改 `colors_and_type.css` 后同步 `css.json`。

### 步骤 2：清理标记块内硬编码色值

**修改范围**：6 个预览页

| 组件文件 | 硬编码值 | 替换为 |
|---------|---------|-------|
| `component-switch.html` | `background:#E5E5EA` (2处) | `background:var(--color-switch-off-bg)` |
| `component-switch.html` | `box-shadow:0 2px 4px rgba(0,0,0,0.12),0 0 0 0.5px rgba(0,0,0,0.04)` | `box-shadow:0 2px 4px var(--color-shadow-thumb),0 0 0 0.5px var(--color-shadow-thumb-ring)` |
| `component-checkbox.html` | `border:1.5px solid rgba(0,0,0,0.15)` | `border:1.5px solid var(--color-border-input-default)` |
| `component-radio.html` | `border:1.5px solid rgba(0,0,0,0.15)` | `border:1.5px solid var(--color-border-input-default)` |
| `component-radio.html` | dark mode `rgba(255,255,255,...)` 多处 | 使用已有的 `.dark` 变体 Token（`--wg-color-base-neutral-alpha-*` dark 覆盖） |
| `component-stack.html` | `border:1px solid rgba(0,0,0,0.12)` | `border:1px solid var(--color-border-subtle)` |
| `component-input.html` | `background:#f8f9fa` | `background:var(--color-surface-subtle)` |
| `component-input.html` | `border:0.5px solid rgba(32,47,100,0.08)` | `border:0.5px solid var(--color-border-default)` |
| `component-input.html` | `background:rgba(255,51,51,0.1)` | `background:var(--color-status-danger-surface-l2)` |
| `component-input.html` | `border-color:#f33` | `border-color:var(--color-status-danger-default)` |
| `component-chip.html` | `background:rgba(255,255,255,0.1)` | `background:var(--color-coupon-overlay)` |
| `component-chip.html` | `border:0.5px solid rgba(250,80,81,0.6)` | `border:0.5px solid var(--wg-color-base-danger-alpha-60)` |
| `component-chip.html` | `color:#f33` | `color:var(--color-status-danger-default)` |

### 步骤 3：内联 SVG 改为 iconfont

**策略**：仅在标记块外 HTML 中使用的图标改为 iconfont；标记块内 CSS 不涉及 SVG。JS 中动态插入的图标也统一为 iconfont。

#### 3.1 checkbox 勾选/减号

**修改文件**：`component-checkbox.html`

- HTML 中约 12 处勾选/减号内联 SVG → `<i class="wego-iconfont-s icon-gou16"></i>` 和 `<i class="wego-iconfont-s icon-jian16"></i>`
- JS 中 `CHECK_SVG` / `MINUS_SVG` 字符串常量 → 动态创建 `<i>` 元素并添加 iconfont class
- 勾选图标用 `icon-gou16`，减号图标用 `icon-jian16`（已在 iconfont.css 中确认存在）

#### 3.2 bottom-nav Tab 图标

**修改文件**：`component-bottom-nav.html`

- 5 个 Tab 的 active/default 内联 SVG → 使用 `assets/icons/tab-*.svg` 文件引用或 iconfont
- JS 中 ICONS 对象（10 个 SVG 字符串常量）→ 改为引用 `assets/icons/tab-*.svg` 的 `src` 或创建 `<i>` 元素

**决策**：bottom-nav 的 Tab 图标是成对设计的（active 选中态/line 线性态），`assets/icons/` 中有 5 对专用 SVG。方案是：
- HTML 中内联 SVG → 改为 `<img src="../assets/icons/tab-shouye.svg">` 等（已确认资产存在）
- JS 中 ICONS 对象 → 改为路径映射 + 动态替换 `<img>` 的 `src`
- 这是"随库固定资产"使用，符合规则；比 iconfont 的通用图标更贴合底部导航场景

#### 3.3 chip tag__close

**修改文件**：`component-chip.html`

- HTML 中约 12 处 tag__close 内联 SVG → `<i class="wego-iconfont-s icon-cha16"></i>`（已在 iconfont.css 中确认存在）
- tag__icon-left 的加号 SVG 约 4 处 → `<i class="wego-iconfont-s icon-jia16"></i>`

#### 3.4 cell 中的复用内联 SVG

**修改文件**：`component-cell.html`

- 复选框勾选 SVG → `<i class="wego-iconfont-s icon-gou16"></i>`
- radio 圆点 SVG（含硬编码 `#03C160`）→ 使用 CSS pseudo-element + Token 背景（`background:var(--color-brand)`）替代
- 退格区减号 SVG → `<i class="wego-iconfont-s icon-jian16"></i>`

#### 3.5 form 中的复用内联 SVG

**修改文件**：`component-form.html`

- counter 加减 SVG → `<i class="wego-iconfont-s icon-jian16"></i>` / `<i class="wego-iconfont-s icon-jia16"></i>`
- radio 圆点 SVG → 同 cell 方案
- dropdown 勾选 SVG → `<i class="wego-iconfont-s icon-gou16"></i>`

### 步骤 4：统一 CSS 引入方式

**目标**：所有预览页统一引入 `colors_and_type.css` + `iconfont.css`；不引入 `components.css`（避免循环依赖——组件 CSS 从标记块内定义，不应引入聚合输出）。

**当前状态**：

| 引入模式 | 组件 |
|---------|------|
| 仅 `colors_and_type.css` | avatar, card, chip, image, input, link (6个) |
| `colors_and_type.css` + `iconfont.css` | button, counter, navbar, radio, switch (5个) |
| `colors_and_type.css` + `components.css` + `iconfont.css` | badge, bottom-nav, cell, checkbox, form, stack (6个) |

**统一规则**：
- **所有预览页**引入 `../colors_and_type.css` 和 `../iconfont.css`
- **不引入** `components.css`（预览页本身是组件 CSS 的权威来源，引入聚合输出会造成循环；TRAE 也采用此模式）
- 移除 6 个文件中对 `components.css` 的引入（badge, bottom-nav, cell, checkbox, form, stack）

**注意**：form 预览页复制了 button CSS（步骤 5 处理），移除 `components.css` 引入后需确认跨组件 class 引用（如 `btn`）是否仍能正常展示。

### 步骤 5：消除跨组件 CSS 重复

**修改文件**：`component-form.html`

- 删除标记块外 18-38 行的 button CSS 完整副本
- form 预览页中用到的 `btn` class 改为内联 `@import` 引入或依赖 form 自身的 button-like 样式

**方案**：form 预览页中使用了少量 `btn` 样式（如表单底部操作按钮）。不引入 `components.css`，但也不复制 button CSS。改为：
1. 在 form 的 scaffold/demo 区域（标记块外）用精简的内联样式替代 `btn` class
2. 或在 form 标记块内定义 form 专属的按钮样式（仅当 form 需要自包含按钮时）

**推荐方案 1**：form 底部操作按钮是 demo 展示性质，在标记块外用 scaffold 样式即可。

### 步骤 6：增强提取脚本

**修改文件**：`scripts/extract-components-css.mjs`

新增检查：
1. **硬编码 hex 检测**：扫描标记块内 CSS，找出所有不含 `var()` 的 `#[0-9a-fA-F]{3,8}` 和 `rgba(/rgb(` 值，输出 warning
2. **scaffold 泄漏检测**：检查标记块内是否包含已知 scaffold 选择器（`body`、`.row`、`.label`、`.section-title`、`.divider`、`.demo-hint` 等），输出 warning
3. 输出报告中增加 `rawHexWarnings` 和 `scaffoldLeakWarnings` 字段

### 步骤 7：重新生成 `components.css`

1. 运行 `node scripts/extract-components-css.mjs .`
2. 验证输出中 raw hex warnings 可解释或为 0
3. 验证 `components.css` 文件头保留 `DO NOT EDIT MANUALLY`
4. 确认标记块内的硬编码已全部清理

### 步骤 8：同步组件契约

对步骤 2-5 中有改动的组件，同步其 `components/{slug}.json`：
- 更新 `tokensConsumed` 反映新增使用的语义 Token
- 确认 `provenance.preview` 路径正确

涉及组件：switch, checkbox, radio, stack, input, chip, bottom-nav, cell, form（9 个）。

### 步骤 9：递增版本

修改 `metadata.json` 中的 `version`，递增 1。

## 验证清单

- [ ] 所有 `preview/component-*.html` 标记块内无 `#hex` 或 `rgba()` 硬编码色值（必要的 shadow color Token 除外）
- [ ] 所有预览页统一引入 `colors_and_type.css` + `iconfont.css`，不引入 `components.css`
- [ ] 所有内联 SVG 已替换为 iconfont 或 `assets/icons/` 随库资产引用
- [ ] `component-form.html` 中无 button CSS 完整副本
- [ ] `colors_and_type.css` 与 `css.json` Token 同步
- [ ] `components.css` 通过脚本重新生成，raw hex warnings 为 0
- [ ] 提取脚本增加硬编码 hex 和 scaffold 泄漏检测
- [ ] 受影响组件的 `tokensConsumed` 已同步更新
- [ ] `metadata.json` version 已递增
- [ ] 所有预览页在浏览器中仍能正常展示（无样式断裂）

## 不做的事

- 不修改 UI Kit（阶段 6 任务）
- 不升级组件契约 schema（阶段 3 任务，但步骤 8 中仅同步 `tokensConsumed`）
- 不统一 Token 命名体系（`--wg-*` 与 `--color-*` 混用是阶段 2 Token 整理范畴）
- 不处理标记块外的 scaffold 硬编码（demo 辅助样式不属于组件 CSS）
- 不新增 iconfont 字体文件（仅使用已有图标）

## 风险与决策

1. **`#f33` → `#fa5051` 色差**：视觉上 `#ff3333` 与 `#fa5051` 几乎无法区分，统一使用系统色值是正确方向。如有视觉回归，可微调 `--color-status-danger-default` 值。

2. **bottom-nav 图标从内联 SVG 改为 `<img>` 引用**：需确认 5 对 `assets/icons/tab-*.svg` 的视觉质量与当前内联 SVG 一致。如有差异，以 `assets/icons/` 版本为准（它们是随库固定资产）。

3. **移除 `components.css` 引入可能影响 form/cell/checkbox 展示**：这些预览页可能间接依赖了 `components.css` 中聚合的其他组件样式。移除后需逐页检查。

4. **radio dark mode `rgba(255,255,255,*)` 处理**：需确认 `colors_and_type.css` 的 `.dark` 块是否已有对应的 neutral alpha 覆盖值。如有，直接引用；如没有，新增。
