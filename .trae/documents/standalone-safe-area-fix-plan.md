# iOS Standalone 模式底部导航安全区修复计划

## 问题描述

在 iOS Safari 中将 wego-app 添加到主屏幕后，以 standalone（全屏）模式打开时，底部 bottom-nav 没有获取到安全区高度，被系统 home indicator 遮挡。

桌面浏览器手机壳内预览正常（有模拟的 34px 安全区），移动端浏览器内打开也可能看起来正常（浏览器工具栏占位），但 standalone 模式下问题暴露。

## 根因分析

设计系统 `.bottom-nav` 的底部安全区写法（[components.css](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components.css#L173-L173)）：

```css
.bottom-nav {
  padding-bottom: var(--safe-area-bottom, env(safe-area-inset-bottom, 0px));
}
```

优先级：先用 `--safe-area-bottom` CSS 变量，未定义时 fallback 到 `env(safe-area-inset-bottom)`。

但在 [app.css](file:///Users/baobei/CODE/wego-design-system/wego-app/css/app.css#L422-L427) 移动端媒体查询中，`.phone-screen` 把 `--safe-area-bottom` 强制覆盖成了 `0`：

```css
@media (max-width: 767px) {
  .phone-screen {
    --safe-area-top: 0;
    --safe-area-bottom: 0;   /* ← 罪魁祸首 */
    --navbar-body-height: 56px;
  }
}
```

CSS 变量只要定义了（哪怕值是 0），`var()` 的 fallback 就不会触发。于是 bottom-nav 的 `padding-bottom` 拿到 `0`，完全没有安全区。

（顶部没出问题是因为 `.host-shell-page` 的 padding-top 直接用了 `env(safe-area-inset-top)`，不经过 `--safe-area-top` 变量。）

## 修复方案

### 改动文件 1：`wego-app/css/app.css`

移动端媒体查询中，将 `.phone-screen` 的 `--safe-area-bottom` 从 `0` 改为 `env(safe-area-inset-bottom, 0px)`，`--safe-area-top` 同理（保持一致性，虽然当前顶部内容没走这个变量）：

```css
@media (max-width: 767px) {
  .phone-screen {
    --safe-area-top: env(safe-area-inset-top, 0px);
    --safe-area-bottom: env(safe-area-inset-bottom, 0px);
    --navbar-body-height: 56px;
  }
}
```

这样 `.bottom-nav` 的 `var(--safe-area-bottom, ...)` 就能拿到真实的安全区 env 值，iOS standalone 模式下 home indicator 上方会有正确高度的 padding。

### 改动文件 2：`wego-app/lib/components.css`（部署副本同步）

**不需改动**。bottom-nav 的 CSS 定义本身是正确的，问题出在 app.css 对变量的覆盖。lib/components.css 作为设计系统部署副本，保持原样即可。

### 改动文件 3：`wego-app/index.html`（可选增强）

添加 iOS PWA standalone 相关 meta 标签，确保添加到主屏幕后以全屏 standalone 模式运行：

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="微购相册" />
```

这部分虽然不是 bottom-nav 安全区 bug 的直接修复，但用户的需求本质是"全屏原生容器体验"，加上这些 meta 是必要的。

## 验证步骤

1. 本地直接打开 `wego-app/index.html`，桌面端手机壳预览正常（bottom-nav 下方有模拟安全区）
2. 用浏览器开发者工具切换到移动端视图（iPhone 14/15 系列），检查 bottom-nav 是否有 `env(safe-area-inset-bottom)` 对应的 padding
3. 部署到 Vercel 后，用 iOS Safari 打开 → 添加到主屏幕 → 从主屏幕启动，确认 bottom-nav 不被 home indicator 遮挡
4. 确认页面内容滚动时，底部内容不会被 bottom-nav 遮挡（host-shell-page 的 padding-bottom 已经考虑了 56px + safe-area）

## 风险评估

- **低风险**：改动局限在移动端媒体查询的 CSS 变量值，不影响桌面端
- **兼容性**：`env(safe-area-inset-*)` 在 iOS 11+ 支持，老设备 fallback 到 0px，不劣于现状
- **同步一致性**：只改 app.css，不改设计系统本体（components.css），不涉及 wego-design 技能的版本递增
