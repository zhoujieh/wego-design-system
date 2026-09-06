# Toast 宽度修复：电脑端手机壳场景

## Summary

电脑端带手机壳预览时，引导 toast 使用 `100vw` 计算宽度，导致 toast 宽度等于浏览器视口宽度而非手机屏幕宽度。改为 `100%` 使其相对于 `.app-toast-host` 宿主容器（即手机屏幕）计算。

## Current State Analysis

**问题定位：**
- `.toast--guide` 的 CSS 规则：`width: calc(100vw - 2 * var(--toast-edge-gap))`
- `100vw` 始终等于浏览器视口宽度，不受包含块约束
- `.app-toast-host` 是 `position: absolute; inset: 0` 位于 `.phone-screen` 内，尺寸等于手机屏幕（390px）
- 结果：toast 宽度 = 浏览器宽度 - 32px，远超手机屏幕宽度

**影响范围：**
- 仅影响电脑端手机壳预览场景（`@media (min-width: 768px)`）
- 移动端（`@media (max-width: 767px)`）无 phone-frame 包裹，`100vw` 与 `100%` 等价，不受影响
- 默认 toast 使用 `max-width` 而非 `width`，不受影响

## Proposed Changes

### 1. 修改 preview 组件 CSS（标记区内）

**文件：** `.codex/skills/wego-design/preview/component-toast.html`

将 `.toast--guide` 的 `width` 从 `100vw` 改为 `100%`：

```css
/* Before */
.toast--guide {
  width: calc(100vw - 2 * var(--toast-edge-gap));
}

/* After */
.toast--guide {
  width: calc(100% - 2 * var(--toast-edge-gap));
}
```

**原因：** `100%` 相对于 `.app-toast-host` 的宽度（即手机屏幕宽度 390px），在手机壳场景下正确约束 toast 宽度。移动端无 phone-frame 时 `.app-toast-host` 铺满视口，`100%` 与 `100vw` 等价。

### 2. 同步组件契约

**文件：** `.codex/skills/wego-design/components/toast.json`

更新 `structurePatterns` 中引导 toast 宽度描述，将"屏幕宽度"改为更准确的表述：

```
Before: "引导 toast 宽度默认拉伸至屏幕宽度减去左右各 16px 边距"
After:  "引导 toast 宽度默认拉伸至宿主容器宽度减去左右各 16px 边距"
```

### 3. 重跑提取脚本

```bash
node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design
```

### 4. 递增 metadata version

**文件：** `.codex/skills/wego-design/metadata.json`

`version`: 323 → 324

## Assumptions & Decisions

- 不修改 `.app-toast-host` 的定位方式，因为当前 `position: absolute; inset: 0` 是正确的包含块设置
- 不改默认 toast，因为它使用 `max-width` 而非 `width`，不存在此问题
- 不新增 CSS 变量，`100%` 已足够解决问题
- 移动端场景不受影响，无需额外处理

## Verification Steps

1. 静态扫描：确认 `components.css` 中 `.toast--guide` 的 `width` 已变为 `100%`
2. 运行 `node scripts/validate-wego-design.mjs` 做文件完整性守门
3. 确认 `metadata.json` version 已递增
4. 确认 `components/toast.json` 契约描述已同步
