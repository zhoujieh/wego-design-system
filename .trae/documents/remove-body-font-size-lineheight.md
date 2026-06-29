# 移除 body 全局字号和行高

## 概述

从 `scaffold.css` 的 `html, body` 中移除 `font-size` 和 `line-height`，交由各组件/业务自行声明，避免继承导致的行高溢出问题。

## 当前问题

`scaffold.css` 第 12-13 行设置了 `font-size: var(--font-size-16)` 和 `line-height: var(--font-lineheight-16)`（24px），所有子元素如果没显式设置行高就会继承 24px。导致 10px 错误文本、12px 标签等小字号元素行高异常偏大。

## 修改清单

### 文件 1: `scaffold.css`

```css
/* 原 */
html, body {
  background: var(--color-bg-page);
  color: var(--color-text-primary);
  font-family: var(--font-family-text);
  font-size: var(--font-size-16);
  line-height: var(--font-lineheight-16);
  min-height: 100%;
  overflow-x: hidden;
  max-width: 100%;
}

/* 改为 */
html, body {
  background: var(--color-bg-page);
  color: var(--color-text-primary);
  font-family: var(--font-family-text);
  min-height: 100%;
  overflow-x: hidden;
  max-width: 100%;
}
```

仅删除 `font-size` 和 `line-height` 两行，保留 `font-family` 作为默认字体。

## 影响范围分析

移除后，预览页中**没有**显式设 `font-size` / `line-height` 的元素会回退到浏览器默认值（通常 16px / normal ≈ 1.2 倍 ≈ 19.2px）。检查以下脚手架元素是否会受影响：

| 选择器 | 字号 | 行高 | 现状 | 移除后 |
|--------|------|------|------|--------|
| `.pv-header h1` | `--font-size-18` | `--font-lineheight-18` | 已声明 | 无影响 |
| `.pv-header p` | `--font-size-14` | `--font-lineheight-14` | 已声明 | 无影响 |
| `.pv-section__title` | `--font-size-14` | **未声明** | 继承 24px | 回退 normal — 可接受（脚手架样式） |
| `.pv-section__sub` | `--font-size-12` | **未声明** | 继承 24px | 回退 normal — 改善 |
| `.label` | `--font-size-12` | **未声明** | 继承 24px | 回退 normal — 改善 |
| `.demo-hint` | `--font-size-12` | **未声明** | 继承 24px | 回退 normal — 改善 |
| `.interactive-text` | `--font-size-14` | **未声明** | 继承 24px | 回退 normal — 改善 |

组件 CSS 标记内的选择器全部有自己的 `font-size` 和/或 `line-height` 声明，不受 body 变更影响。

## 验证步骤

1. 打开 `preview/component-input.html`：确认 10px 错误文本行高不再为 24px
2. 打开 `preview/component-card.html`：标题/正文/副标题行高正常
3. 打开 `preview/component-form.html`：表单各元素行高正常
4. 抽查其他预览页，确认无视觉溢出或异常
