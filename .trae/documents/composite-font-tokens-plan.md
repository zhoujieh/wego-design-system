# 组合排版 Token（方案 A）：字号 + 行高 + 字体族捆绑

## 概述

引入「组合排版 Token」，用 CSS `font` 简写将字号、行高、字体族绑定为一条声明，确保字号和行高严格配对、不会遗漏。保留现有 `--font-size-*` 和 `--font-lineheight-*` 独立 Token 不删，向后兼容。同时修复 scaffold.css 的 body 行高继承问题。同步更新 SKILL.md 和 specs 规范文档。

## 当前问题

1. `scaffold.css` 第 13 行：`html, body { line-height: var(--font-lineheight-16); }` — 24px 行高被所有子元素继承
2. 组件中只设了 `font-size` 但没设 `line-height` 的地方（如 `.field-error` 的 10px、脚手架的 12px 标签等），会继承 body 的 24px 行高，导致视觉间距过大
3. 字号和行高是独立 Token，依赖人/AI 记忆同时声明两行，容易遗漏

## 字号/行高对应表

| 字号 | 中文行高 | 金额数字行高 | 用途 |
|------|---------|-------------|------|
| 10px | 14px | 10px | 提示、角标、错误文本 |
| 12px | 18px | 12px | 辅助说明、标签 |
| 14px | 22px | 14px | 正文、链接 |
| 16px | 24px | 16px | 标题、表单 |
| 18px | 28px | 18px | 导航栏标题 |
| 22px | 32px | 22px | 大标题 |

## 修改清单

### 文件 1: `colors_and_type.css`（Token 权威源）

**新增组合排版 Token**（在 public semantic 区，现有 `--font-lineheight-*` 之后）：

```css
/* ── 组合排版 Token（字号 + 行高 + 字体族） ── */
--font-body-10: 10px / 14px var(--font-family-text);
--font-body-12: 12px / 18px var(--font-family-text);
--font-body-14: 14px / 22px var(--font-family-text);
--font-body-16: 16px / 24px var(--font-family-text);
--font-body-18: 18px / 28px var(--font-family-text);
--font-body-22: 22px / 32px var(--font-family-text);
--font-number-10: 10px / 10px var(--font-family-number);
--font-number-12: 12px / 12px var(--font-family-number);
--font-number-14: 14px / 14px var(--font-family-number);
--font-number-16: 16px / 16px var(--font-family-number);
--font-number-18: 18px / 18px var(--font-family-number);
--font-number-20: 20px / 20px var(--font-family-number);
--font-number-24: 24px / 24px var(--font-family-number);
--font-number-32: 32px / 32px var(--font-family-number);
```

**不修改任何现有 Token**，全部保留。

### 文件 2: `css.json`（机器可读投影）

新增 `fontComposition` 分组：

```json
"fontComposition": {
  "font-body-10": "10px/14px PingFang SC, ...",
  "font-body-12": "12px/18px PingFang SC, ...",
  "font-body-14": "14px/22px PingFang SC, ...",
  "font-body-16": "16px/24px PingFang SC, ...",
  "font-body-18": "18px/28px PingFang SC, ...",
  "font-body-22": "22px/32px PingFang SC, ...",
  "font-number-10": "10px/10px WegoKeyboard N9, ...",
  "font-number-12": "12px/12px WegoKeyboard N9, ...",
  "font-number-14": "14px/14px WegoKeyboard N9, ...",
  "font-number-16": "16px/16px WegoKeyboard N9, ...",
  "font-number-18": "18px/18px WegoKeyboard N9, ...",
  "font-number-20": "20px/20px WegoKeyboard N9, ...",
  "font-number-24": "24px/24px WegoKeyboard N9, ...",
  "font-number-32": "32px/32px WegoKeyboard N9, ..."
}
```

值使用已解析的字符串（font-family 全展开），不使用 `var()` 引用。修改后验证 JSON 合法性。

### 文件 3: `scaffold.css`（脚手架 — 修复 body 行高继承）

```css
/* 原 */
html, body { ... line-height: var(--font-lineheight-16); }

/* 改为 */
html, body { ... font: var(--font-body-16); }
```

用 `font` 简写替代分散的 `font-family` + `font-size` + `line-height`，一行搞定，body 本身和所有未显式设 font 的子元素都会有正确的 16px/24px 基准。

同时检查 scaffold.css 中其他只设了 `font-size` 但没设 `line-height` 的选择器（如 `.pv-section__sub`、`.label`），改为使用对应的组合 Token：
- `.pv-section__sub`（12px，无行高）→ 改为 `font: var(--font-body-12);`
- `.label`（12px，无行高）→ 改为 `font: var(--font-body-12);`
- `.demo-hint`（12px，无行高）→ `font: var(--font-body-12);`
- `.interactive-text`（14px，无行高）→ `font: var(--font-body-14);`
- `.pv-section__title`（14px，无行高）→ `font: var(--font-body-14);`
- `.dark-strip .label`（12px，无行高）→ `font: var(--font-body-12);`

### 文件 4: 17 个预览页 — 组件 CSS 迁移

**迁移原则：只在 `/* @component-css-start */` 和 `/* @component-css-end */` 标记内迁移，脚手架样式不迁。**

对每个组件中**同时存在** `font-size: var(--font-size-X)` + `line-height: var(--font-lineheight-X)` 的选择器，将两行合并为 `font: var(--font-body-X)` 或 `font: var(--font-number-X)`（按 `font-family` 判断）。

**迁移范围逐文件统计**（仅统计标记内的组件 CSS，不含脚手架和内联 style）：

| 预览页 | 需迁移的选择器数 | 说明 |
|--------|----------------|------|
| component-input.html | 3 | `.story-label`(12)、`.field-label`(14)、`.number-input__field`(16) |
| component-card.html | 2 | `.card__header`(16)、`.card__body`(14) |
| component-cell.html | 3 | `.cell__title`(16)、`.cell__subtitle`(12)、`.cell__action-text`(14) |
| component-link.html | 1 | `.link`(14) — 内联 style 不动 |
| component-stack.html | 1 | `.stack__label`(14) |
| component-form.html | 7 | label(16)、textarea(16)、phone-code(16)、phone-input(16)、money-symbol(16)、money-input(16)、select-text(16)、radio-item(16)、dropdown-item(16)、expand-content(14) |
| component-counter.html | 1 | `.story-label`(12) |

**不迁移的场景**：
- `line-height: normal` 或 `line-height: 1` 的地方（图标居中、avatar 等）— 不是排版行高
- 内联 `style=""` 中的声明 — 不是组件 CSS 的一部分，保持不动
- `font-size` 字面值（如 `font-size: 14px`）而不是 Token 的地方 — 按组件自身逻辑处理
- 数字输入框的 `line-height: 20px` — 这是垂直居中的特殊值，不对应行高 Token

**迁移方式示例**：
```css
/* 原 */
.card__header { font-size: var(--font-size-16); font-weight: var(--font-weight-semibold); line-height: var(--font-lineheight-16); }

/* 改为 */
.card__header { font: var(--font-body-16); font-weight: var(--font-weight-semibold); }
```

注意：`font` 简写会重置 `font-weight` 为 `normal`，所以原来有 `font-weight` 的选择器需要在 `font` 声明之后再设 `font-weight`。同理 `font-style`、`font-variant` 如果有也需要在 font 之后。

### 文件 5: `components.css`（重新生成）

全部预览页改完后，运行 `node scripts/extract-components-css.mjs .` 重新生成。

### 文件 6: `SKILL.md`（规范同步）

在「品牌要素」-「字号」后新增组合排版 Token 说明：

```markdown
- **组合排版 Token**：`--font-body-{N}` 和 `--font-number-{N}` 将字号、行高、字体族绑定为一条 `font` 简写声明。使用 `font: var(--font-body-14);` 一次性设置 14px 字号、22px 行高和 PingFang SC 字体族，确保字号行高严格配对。独立 Token（`--font-size-*`、`--font-lineheight-*`）保留兼容，新组件优先使用组合 Token。
```

在「Token 命名规范」中补充：

```markdown
- `--font-body-{N}`：中文文本组合排版 Token（字号 + 行高 + 字体族）
- `--font-number-{N}`：金额数字组合排版 Token（字号 = 行高 + 数字字体族）
```

### 文件 7: `specs/布局与间距规范.md`（规范同步）

在文件末尾、自检清单前，新增「排版 Token 使用规范」章节：

```markdown
## 排版 Token 使用规范

### 字号与行高对应关系

中文文本和金额数字各有独立的字号-行高对应表：

| 字号 | 中文行高 | 金额数字行高 |
|------|---------|-------------|
| 10px | 14px | 10px |
| 12px | 18px | 12px |
| 14px | 22px | 14px |
| 16px | 24px | 16px |
| 18px | 28px | 18px |
| 22px | 32px | 22px |

### 组合 Token

使用 `--font-body-{N}`（中文文本）或 `--font-number-{N}`（金额数字）一次性声明：

```css
.title { font: var(--font-body-16); }           /* 16px / 24px PingFang SC */
.price { font: var(--font-number-20); }           /* 20px / 20px WegoKeyboard N9 */
```

### 不适用组合 Token 的场景

- 需要独立控制 `font-weight` 时，在 `font` 声明之后设置：`font: var(--font-body-16); font-weight: var(--font-weight-semibold);`
- 图标居中、avatar 等非排版场景使用 `line-height: 1` 或 `line-height: normal`
- 垂直居中的固定值行高（如 `line-height: 20px`）保持字面量
```

## 不需要修改的文件

- `components/*.json` 组件契约 — `tokensConsumed` 中已有 `--font-size-*` 和 `--font-lineheight-*`，保留不变（组合 Token 是消费级便利封装，不替代基础 Token 注册）
- `preview/*.html` 的内联 `style=""` — 保持不动，不影响组件 CSS 提取

## 验证步骤

1. `python3 -c "import json; json.load(open('css.json'))"` 验证 JSON 合法
2. 打开 `preview/component-input.html`，检查 10px 错误文本行高是否为 14px（而非 24px）
3. 打开 `preview/component-card.html`，检查标题和正文行高是否正确
4. 打开 `preview/component-cell.html`，检查标题/副标题/操作文本行高
5. 全量检查：所有预览页打开无 JS 报错、无视觉溢出
6. `node scripts/extract-components-css.mjs .` 成功生成（17 个预览页）
