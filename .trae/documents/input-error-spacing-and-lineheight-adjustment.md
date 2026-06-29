# 错误文本间距调整 + 全局行高 Token 修正

## 概述

两项改动：
1. Input 错误提示文本距输入框间距从 `margin-top: 4px` 改为 `0`
2. 全局行高 Token 中 14/18/22px 三个字号对应行高需调整为用户提供的标准值

## 当前状态分析

### 错误提示间距
`preview/component-input.html` 第 39 行：
```css
.field-error { ... margin-top: 4px; ... }
```
上传的参考图片中红箭头指向紧贴输入框下方的错误文本，间距为 0。

### 行高 Token 对比

| 字号 | Token | 当前值 | 目标值 | 需改？ |
|------|-------|--------|--------|--------|
| 10px | `--font-lineheight-10` | 14px | 14px | 否 |
| 12px | `--font-lineheight-12` | 18px | 18px | 否 |
| 14px | `--font-lineheight-14` | **20px** | **22px** | **是** |
| 16px | `--font-lineheight-16` | 24px | 24px | 否 |
| 18px | `--font-lineheight-18` | **26px** | **28px** | **是** |
| 22px | `--font-lineheight-22` | **30px** | **32px** | **是** |

影响范围：6 个预览页 + 6 个组件契约引用了 `--font-lineheight-14`，但这些组件本身不需要改，因为它们引用的是 Token 变量，Token 值变了它们会自动跟随。

## 修改清单

### 文件 1: `colors_and_type.css`（Token 权威源）

修改 3 个 reference/primitives 行高值：

```css
/* 第 105 行 */
--wg-font-lineheight-14: 22px;   /* 原 20px */

/* 第 107 行 */
--wg-font-lineheight-18: 28px;   /* 原 26px */

/* 第 108 行 */
--wg-font-lineheight-22: 32px;   /* 原 30px */
```

### 文件 2: `css.json`（机器可读投影）

修改 `lineHeight` 对象中 3 个值：

```json
"font-lineheight-14": "22px",
"font-lineheight-18": "28px",
"font-lineheight-22": "32px"
```

修改后用 `python3 -c "import json; json.load(open('css.json'))"` 验证 JSON 合法性。

### 文件 3: `preview/component-input.html`（错误文本间距）

第 39 行，`/* @component-css-start */` 内的 `.field-error`：
```css
/* 原：margin-top: 4px */
/* 改：margin-top: 0px */
```

### 文件 4: `components.css`（重新生成）

运行 `node scripts/extract-components-css.mjs .` 自动重新生成。

## 不需要修改的文件

以下文件引用了 `--font-lineheight-14` 但不需要改，因为它们引用 Token 变量，值会自动跟随：
- `preview/component-input.html`（`.field-label` 引用 `--font-lineheight-14`）
- `preview/component-stack.html`、`preview/component-card.html`、`preview/component-link.html`、`preview/component-form.html`、`preview/component-cell.html`
- 对应的 `components/*.json` 契约（tokensConsumed 列表）

## 验证步骤

1. 确认 `colors_and_type.css` 中 3 个行高值已改
2. 运行 `python3 -c "import json; json.load(open('css.json'))"` 确认 JSON 合法
3. 打开 `preview/component-input.html`，确认错误提示紧贴输入框下方（间距 0）
4. 抽查其他预览页（如 card、cell），确认行高变化后视觉正常
