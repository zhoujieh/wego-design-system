# 修复 badge 组件验证错误

## 概述

`node scripts/validate-wegoux.mjs --scope=full` 对 badge 报了 4 个错误，根因在验证器（3 个）+ 组件内硬编码值（1 个）：

1. 三个 `preview.var.undefined` — 验证器忽略了组件 CSS 块内自行声明、自行消费的局部 CSS 自定义属性
2. 一个 `contract.schema_extra_fields` — `cssCustomProperties` 是合法 v3 契约字段，但未在白名单中
3. `--badge-scroll-width: 96px` 硬编码 — 应改为引用已有 Token 体系

## 当前状态分析

### `component-badge.html` 中的局部 CSS 属性

```css
/* @component-css-start */
.badge--text {
  --badge-text-bg: var(--accent-green);      /* 引用 Token，正确 */
  --badge-text-color: var(--text-inverse);    /* 引用 Token，正确 */
  background: var(--badge-text-bg);
  color: var(--badge-text-color);
}
.badge--scrollable {
  --badge-scroll-width: 96px;                 /* 硬编码，不合理 */
  width: var(--badge-scroll-width);
}
/* @component-css-end */
```

### 分析

- `--badge-text-bg` 和 `--badge-text-color`：声明和消费都在组件块内，引用的是已有 Token，是标准的「自引用覆盖模式」。不属于全局 Token 体系。
- `--badge-scroll-width: 96px`：96px 作为硬编码值放在组件里不合理。96 是 4 的倍数，适合作为公共 size Token。

## 拟议修改

### 1. `wegoux/colors_and_type.css` — 新增 `--size-96`

在 `/* size */` 区域，`--size-76` 和 `--size-104` 之间插入：

```css
--size-96: 96px;
```

### 2. `wegoux/preview/component-badge.html` — 引用 Token

组件 CSS 标记块内：

```diff
 .badge--scrollable {
-  --badge-scroll-width: 96px;
+  --badge-scroll-width: var(--size-96);
   width: var(--badge-scroll-width);
```

### 3. `wegoux/css.json` — 同步新 Token

在 `size` 桶中补充 `"--size-96": "96px"`。

### 4. `scripts/validate-wegoux.mjs` — 修复局部 CSS 属性扫描

在 `checkPreviewPages` 中，609 行 `const usedVars = extractUsedVars(block);` 之前，插入：

```js
// 将组件 CSS 块内的局部 --xxx: 声明加入允许集
const localVars = extractCssVars(block);
for (const localVar of localVars) declaredVars.add(localVar);
```

### 5. `scripts/validate-wegoux.mjs` — 加入 `cssCustomProperties` 白名单

在 `REQUIRED_COMPONENT_CONTRACT_FIELDS` 数组中添加 `'cssCustomProperties'`。

### 6. 重新生成 `components.css`

```bash
node wegoux/scripts/extract-components-css.mjs wegoux
```

### 7. 后续同步

- `wegoux/README.md`：在 size 表格中补充 `--size-96`
- `wegoux/SKILL.md`：size Token 清单更新
- `wegoux/metadata.json`：递增 version

## 验证步骤

1. `python3 -c "import json; json.load(open('wegoux/css.json'))"` — JSON 合法
2. `node wegoux/scripts/extract-components-css.mjs wegoux` — 17 组件 0 warning
3. `node scripts/validate-wegoux.mjs --scope=full` — 0 错误
