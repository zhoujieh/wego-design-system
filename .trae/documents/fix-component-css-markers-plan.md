# 修复预览页 CSS 提取标记 — 修订方案（基于 TRAE 对比）

## 摘要

对比 TRAE 参考实现后发现，wegoux 的问题比预期严重——不仅是标记缺失，5 个组件（badge、cell、checkbox、stack、switch）的 CSS 在任何地方都完全缺失。本轮：为 7 个文件补充 CSS + 标记，重新生成 components.css，同步文档。

---

## TRAE vs wegoux 对比结论

| 维度 | TRAE (Nimbus Core) | wegoux |
|------|-------------------|--------|
| 预览页 CSS 标记覆盖率 | **100%**（23/23） | **59%**（10/17） |
| 组件 CSS 完整度 | 所有组件 CSS 均在预览页 `<style>` 内定义 | 5 个组件 CSS 完全缺失 |
| scaffold.css（共享骨架样式） | 有 | **无**（每个预览页各自复制 scaffold） |
| 提取脚本本地副本 | 无（引用外部路径） | 有 |
| `components.css` 质量 | 纯净组件 CSS，无 scaffold 污染 | **严重污染**（scaffold 样式 + JS 函数被提取） |

**TRAE 的 100% 覆盖率证明：所有预览文件都应该有标记，这是可行且必要的。**

---

## 当前状态详解

### 已标记（10 个）
avatar、bottom-nav、button、card、chip、counter、input、link、navbar、radio

### 未标记 + CSS 部分缺失（2 个）

| 文件 | 内联组件 CSS | 问题 |
|------|-------------|------|
| `component-form.html` | 有（约 150 行） | 与 scaffold 混在一起，无标记区分 |
| `component-image.html` | 有（约 25 行） | 与 scaffold 混在一起，无标记区分 |

### 未标记 + CSS 完全缺失（5 个）

| 文件 | 组件 CSS 状态 | 影响 |
|------|-------------|------|
| `component-badge.html` | **无** | 红点、数字角标、文字标签等仅靠浏览器默认 + 少量内联 style |
| `component-cell.html` | **无** | 列表单元格无任何样式定义，scaffold 甚至提取了 JS 函数 |
| `component-checkbox.html` | **无** | 24px/20px 复选框、选中/半选/禁用态无样式 |
| `component-stack.html` | **无** | 24x24 选项块无样式，选中态无法区分 |
| `component-switch.html` | **无** | 52x32 开关无样式，on/off 态无法区分 |

### components.css 污染状态

当前 `components.css` 中 Badge/Cell/Checkbox/Stack/Switch 区段的内容全是 heuristic fallback 误提取的 scaffold 样式（`.section-title`、`.demo-hint`、`.interactive-row`、`.setting-row`、`.toast` 等），部分甚至包含 JavaScript 代码——这些都不是组件 CSS。

---

## 修复方案（10 项变更）

### 变更 1：component-badge.html — 新增 Badge 组件 CSS + 标记

**文件**：`wegoux/preview/component-badge.html`

**依据**：`components/badge.json` 设计契约 + HTML body 已使用的 class 名

新增的 Badge CSS（使用 `--color-*` 短别名 Token，与已有标记组件一致）覆盖：

| 变体 | 类名 | 规格（来自契约） |
|------|------|-----------------|
| 红点 | `.badge--dot` | 8×8px, `#FA5051`, `border-radius: 999px` |
| 数字角标 | `.badge--number` | min-w:16px, h:16px, `#FA5051` 底 #FFF 字, 10px, 999px 圆角 |
| 多数值 | `.badge--number-multi` | min-w:28px |
| 黄色标签 | `.badge--yellow` | h:16px, `rgba(255,195,0,0.1)` 底 `#FFC300` 字, 4px 圆角 |
| 绿色标签 | `.badge--green` | h:16px, `rgba(3,193,96,0.1)` 底 `#03C160` 字, 4px 圆角 |
| 气泡标签 | `.badge--bubble` | h:16px, `#FF6045` 底 #FFF 字, 4px 圆角 |
| 删除 | `.badge--delete` | 16×16px, `#B7BEC5` 底, 交叉线 |
| 右上角定位 | `.badge--corner` | absolute, top/right 定位 |
| 圆角无边 | `.badge--round` | 999px 圆角 |
| 直角 | `.badge--sharp` | 0 圆角 |
| 对齐 | `.badge--align-left/center/right` | 文字对齐 |
| 可滚动 | `.badge--scrollable` | max-w:28px, overflow:hidden |
| 展开方向 | `.badge--corner-expand-left/right/center` | transform origin |

**结构**：scaffold 样式保留在标记外 → `/* @component-css-start */` → Badge CSS → `/* @component-css-end */`

### 变更 2：component-cell.html — 新增 Cell 组件 CSS + 标记

**文件**：`wegoux/preview/component-cell.html`

**依据**：`components/cell.json` 设计契约 + HTML body 已使用的 class 名

新增的 Cell CSS（覆盖 cell 组件的完整布局体系）：

| 元素 | 类名 | 规格（来自契约） |
|------|------|-----------------|
| 单行 | `.cell--single` | min-height: 56px |
| 双行 | `.cell--double` | min-height: 76px |
| 主体 | `.cell__body` | flex, gap: 12px, align-items: center, padding: 0 16px |
| 内容 | `.cell__content` | flex: 1, overflow: hidden |
| 标题 | `.cell__title` | 16px, regular, `--color-text-primary` |
| 标题行 | `.cell__title-row` | flex, align-items: center, gap: 4px |
| 标题图标 | `.cell__title-icon` | 16px iconfont, `--color-text-secondary` |
| 副标题 | `.cell__subtitle` | 12px, regular, `--color-text-tertiary`, margin-top: 2px |
| 右侧区 | `.cell__action` | flex-shrink: 0, margin-left: auto |
| 右侧文字 | `.cell__action-text` | 14px, regular, `--color-text-secondary` |
| 右侧角标 | `.cell__action-badge` | flex, align-items: center, gap: 4px |
| 箭头 | `.cell__arrow` | 16px iconfont, `--color-text-tertiary` |
| 白色底 | `.cell--bg-white` | `--color-bg-surface` |
| 灰色底 | `.cell--bg-grey` | `--color-bg-subtle` |
| 可点击 | `.cell--clickable` | cursor: pointer, active → `--color-state-pressed` |
| 缩进 | `.cell--indent` | padding-left: 32px |
| 分割线-右贴边 | `.cell--divider-right-edge` | ::after 从 left:16px 到 right:0 |
| 分割线-居中 | `.cell--divider-center` | ::after 左右各 16px |
| 左侧选择 | `.cell__select` | 含 4px 左内边距 |
| 左侧头像 | `.cell__avatar` | margin-right: 12px |
| 左侧退格 | `.cell__backspace` | 含退格图标 |

**注意**：移除 `<style>` 块中的重复 Button 样式（`.btn--sm` 等）和 JavaScript 函数——这些通过 `components.css` 获取。

### 变更 3：component-checkbox.html — 新增 Checkbox 组件 CSS + 标记

**文件**：`wegoux/preview/component-checkbox.html`

**依据**：`components/checkbox.json` 设计契约

新增的 Checkbox CSS：

| 状态/变体 | 类名 | 规格 |
|----------|------|------|
| 默认 | `.checkbox` | 24×24px, 1.5px border `rgba(0,0,0,0.15)`, 白色底, 4px 圆角 |
| 选中 | `.checkbox--checked` | 品牌绿底 `--color-brand`, inline SVG 勾 |
| 半选 | `.checkbox--indeterminate` | 品牌绿底 + 减号横线 |
| 计数 | `.checkbox--count` | 品牌绿底, 10px medium 数字 |
| 小号 | `.checkbox--sm` | 20×20px |
| 禁用 | `.checkbox--disabled` | opacity: 0.4 |
| 内部框 | `.checkbox__inner` | 基础框（未选中态可见） |
| 勾标记 | `.checkbox__icon` | 选中态时显示的 SVG 容器 |
| 减标记 | `.checkbox__minus` | 半选态时显示的 SVG 容器 |
| 计数文字 | `.checkbox__count` | 白色数字 |

### 变更 4：component-switch.html — 新增 Switch 组件 CSS + 标记

**文件**：`wegoux/preview/component-switch.html`

**依据**：`components/switch.json` 设计契约

新增的 Switch CSS：

| 状态 | 类名 | 规格 |
|------|------|------|
| 基础 | `.switch` | 52×32px, 100px 圆角, relative, inline-flex, cursor: pointer |
| 开启 | `.switch--on` | 品牌绿底, thumb left: 22px |
| 关闭 | `.switch--off` | `#E5E5EA` 底, thumb left: 2px |
| 禁用 | `.switch--disabled` | opacity: 0.4, pointer-events: none |
| 滑块 | `.switch__thumb` | 28×28px, 白底, 圆形, shadow, absolute, transition 150ms |

### 变更 5：component-stack.html — 新增 Stack 组件 CSS + 标记

**文件**：`wegoux/preview/component-stack.html`

**依据**：`components/stack.json` 设计契约

新增的 Stack CSS：

| 状态 | 类名 | 规格 |
|------|------|------|
| 基础 | `.stack` | flex column, align-items: center, gap: 4px, cursor: pointer |
| 选项块 | `.stack__bg` | 24×24px, 4px 圆角, 白底, 1px 灰边框, flex 居中, transition |
| 选中 | `.stack--selected .stack__bg` | 品牌绿底 + 品牌绿边框 |
| 勾标记 | `.stack__check-badge` | 16×16px, 选中态时显示 |
| 文字 | `.stack__label` | 14px, regular, `--color-text-primary`, text-align: center |

### 变更 6：component-form.html — 添加标记（CSS 已有，仅加标记）

**文件**：`wegoux/preview/component-form.html`

**操作**：
- Scaffold（`.page`、`.section-title`、`.section-group`、`.section-gap`）保留在标记外
- 第一个 Form 组件 CSS 规则前插入 `/* @component-css-start */`
- 最后一个 Form 组件 CSS 规则后插入 `/* @component-css-end */`
- 不修改任何 CSS 规则内容

### 变更 7：component-image.html — 添加标记（CSS 已有，仅加标记）

**文件**：`wegoux/preview/component-image.html`

**操作**：
- Scaffold（`.section`、`.section-title`、`.demo-img-1~5`、`.demo-img-checker` 等）保留在标记外
- Image 组件 CSS（`.wg-image` 及其变体）用标记包裹
- 不修改任何 CSS 规则内容

### 变更 8：重新生成 components.css

**命令**：`node wegoux/scripts/extract-components-css.mjs wegoux`

**预期效果**：
1. Badge/Cell/Checkbox/Stack/Switch 的组件 CSS 被精确提取（首次有真实内容）
2. 原有被误提取的 scaffold 样式（`.section-title`、`.demo-hint`、`.interactive-row`、`.setting-row`、`.toast` 等）从这些区段中消失
3. `cell.html` 的 JS 函数不再出现在 CSS 文件中
4. Form/Image 组件 CSS 精确提取，无 scaffold 污染
5. 脚本 stdout 输出无任何 warning

### 变更 9：更新 SKILL.md

**文件**：`wegoux/SKILL.md`

**操作**：
- 「组件 CSS 生成规则」中：
  - 已标记预览页从 10 个更新为 16 个（所有 `component-*.html`）
  - 说明标记覆盖率 100%
- 「当前已知技术债」中移除 "预览页标记不足" 相关项

### 变更 10：更新 AGENTS.md

**文件**：`/Users/baobei/CODE/wego-design-system/AGENTS.md`

**新增小节**（在「变更同步矩阵 → 改组件样式」下）：

```markdown
## CSS 提取标记强制规则

每个 `preview/component-*.html` 的 `<style>` 块中必须包含：
- `/* @component-css-start */` — 在第一个组件 CSS 规则前
- `/* @component-css-end */` — 在最后一个组件 CSS 规则后

两标记之间只允许包含该组件的核心 CSS 规则，scaffold 样式（body、.row、.label、.demo-hint 等）必须在标记之外。

标记缺失 = 脚本走 heuristic fallback → 可能误提取 scaffold 样式到 `components.css`。

修改任何组件样式后必须运行 `node scripts/extract-components-css.mjs .` 重新生成 `components.css`。
```

同步更新「当前已知技术债」：移除标记缺失项，新增 "Cell 预览页重复定义了 Button 样式（应通过 components.css 复用）"。

---

## 与 TRAE 的结构差异说明

| 差异 | TRAE | wegoux（本轮后） | 说明 |
|------|------|-----------------|------|
| scaffold.css | 有独立文件 | **无**，每个预览页内联 scaffold | 暂不引入，属于更大范围重构 |
| Checkbox/Switch/Form 合并 | 合并到 forms.html | 各自独立文件 | wegoux 的独立文件结构保留 |
| 标签组件命名 | `.ds-tag` | `.badge` | 命名不同，功能等价 |
| 状态管理 | `input:checked` 伪类 | class 切换（`.checkbox--checked`） | wegoux 保持 class 方式 |

---

## 假设与决策

1. **5 个组件 CSS 使用 `--color-*` 短别名 Token**（如 `--color-brand`、`--color-text-primary`），与已有标记组件一致。不使用 `--wg-*` 前缀（那是 badge/image 等少数文件的历史遗留，后续统一迁移）。

2. **CSS 规格严格来自 `components/{slug}.json` 设计契约**。不擅自修改尺寸/颜色/状态定义。

3. **navbar-action-button 无需处理**——其 CSS 在 `component-navbar.html` 内已被标记覆盖。

4. **Cell 预览页的重复 Button 样式在标记外保留**（scaffold 区域），不纳入新 Cell CSS。它是演示辅助，且后续可独立清理。

## 验证步骤

1. 运行 `grep -l "@component-css-start" preview/component-*.html`，确认 16 个文件（不含 navbar-action-button 独立文件）均有标记
2. 运行 `node scripts/extract-components-css.mjs .`，确认 stdout 无 warning
3. 检查 `components.css` 中 Badge/Cell/Checkbox/Stack/Switch 区段：包含真实的组件 CSS 规则，不含 scaffold 样式
4. 检查 `components.css`：不再出现 JavaScript 函数片段
5. 检查 `components.css` 中 Form/Image 区段：不含 scaffold 样式
6. 检查 `components.css` 总规则数预期增加（5 个组件新增 CSS）
7. 分别打开 7 个预览页 HTML，确认视觉正常
8. 确认 SKILL.md 和 AGENTS.md 已更新
