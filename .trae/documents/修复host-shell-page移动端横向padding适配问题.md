# 修复 .host-shell-page 移动端横向 padding 适配问题

## Summary

用户反馈：移动端"我的"tab 页面内容左右边距变为 0，应该是跟电脑端显示一致。根因是 `.host-shell-page` 的 padding 规则移动端/电脑端适配处理不对——移动端媒体查询处理了 `preview-shell`、`phone-frame`、`phone-screen`、`phone-status`、`phone-indicator`，但**遗漏了 `.host-shell-page`**。需求：如果电脑端左右有间距，移动端也要有。

## Current State Analysis（根因分析）

### 当前 CSS 规则链路

**`wego-app/css/app.css` 第 36-49 行** — `.phone-screen` 覆盖了 `:root` 的 safe-area 变量：
```css
.phone-screen {
  --safe-area-top: 44px;       /* 覆盖 :root 的 env(safe-area-inset-top, 0px) */
  --safe-area-bottom: 34px;    /* 覆盖 :root 的 env(safe-area-inset-bottom, 0px) */
  ...
}
```

**`wego-app/css/app.css` 第 69-77 行** — `.host-shell-page` 用 3 值 padding 简写：
```css
.host-shell-page {
  padding: calc(var(--spacer-16) + var(--safe-area-top)) var(--spacer-16) calc(var(--spacer-40) + var(--safe-area-bottom) + 56px);
  /*       ↑ top（依赖 safe-area-top）              ↑ left/right（纯 spacer-16） ↑ bottom（依赖 safe-area-bottom） */
}
```

**`wego-app/css/app.css` 第 369-399 行** — 移动端媒体查询：
```css
@media (max-width: 767px) {
  .preview-shell { padding: 0; }           /* 16px → 0 */
  .phone-frame { border: none; }           /* 8px border → 0 */
  .phone-screen {
    --safe-area-top: 0;                    /* 44px → 0 */
    --safe-area-bottom: 0;                 /* 34px → 0 */
  }
  .phone-status, .phone-indicator { display: none; }
  /* ❌ 缺少 .host-shell-page 的显式处理 */
}
```

**`wego-app/index.html` 第 5 行** — viewport meta 缺少 `viewport-fit=cover`：
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
<!-- ❌ 缺少 viewport-fit=cover，导致 env(safe-area-inset-*) 在 iOS 上始终返回 0 -->
```

### 根因结论

**核心问题：移动端媒体查询遗漏了 `.host-shell-page` 的显式横向 padding 适配，依赖 3 值 padding 简写在 CSS 变量级联下的稳健性。**

#### 已验证的事实

1. **`--spacer-40: 40px` 存在**（`wego-app/lib/colors_and_type.css` 第 353 行），`--spacer-16: 16px` 存在（第 349 行）——不是变量未定义
2. **全仓库只有 2 处 `.host-shell-page` 规则**：`wego-app/css/app.css` 第 69 行、`wego-ux/templates/host-shell.css` 第 73 行——没有任何场景 CSS 覆盖 `.host-shell-page` 的 padding
3. **设计系统规范（`预览页脚手架规范.md` 第 96、126 行）明确**：`.phone-screen` 在桌面端提供 `--safe-area-top: 44px`、`--safe-area-bottom: 34px` 作为 mock 值；移动端 `@media` 重置为 `0` 联动隐藏 safe-area 模拟。这是设计意图，但规范未对 `.host-shell-page` 横向 padding 的移动端行为做明确约束

#### 根因分析

1. **3 值 padding 简写在 CSS 变量级联场景下脆弱**：
   - 当前规则 `padding: calc(var(--spacer-16) + var(--safe-area-top)) var(--spacer-16) calc(var(--spacer-40) + var(--safe-area-bottom) + 56px)`
   - 移动端把 `.phone-screen` 的 `--safe-area-top`/`--safe-area-bottom` 从 `44px`/`34px` 改为 `0`（unitless），触发 CSS 变量重新计算
   - 浏览器在某些渲染场景下（特别是 iOS Safari 真机、Chrome DevTools 移动模拟切换时）可能出现 3 值简写整体失效，回退到 `padding: 0`（初始值），导致横向 padding 实际为 0
   - **缺乏显式的 `padding-left`/`padding-right` 兜底**，没有防止 3 值简写失效的护栏

2. **视觉间距骤降**：
   - 桌面端视觉间距 = preview-shell padding(16px) + phone-frame border(8px) + host-shell-page padding(16px) = **40px**
   - 移动端视觉间距 = 0 + 0 + host-shell-page padding(16px) = **16px**（理论值）
   - 桌面端有 24px 的"外层间距"包裹 phone-screen，移动端这层间距被媒体查询显式移除（`preview-shell { padding: 0 }`、`phone-frame { border: none }`），用户感知"间距骤降到几乎为 0"

3. **viewport-fit=cover 缺失**：
   - `wego-app/index.html` 第 5 行和 `host-shell.html` 第 19 行的 viewport meta 都缺少 `viewport-fit=cover`
   - 导致 iOS 设备上 `env(safe-area-inset-left/right)` 始终返回 0，无法处理刘海屏/曲面屏的横向安全区
   - 即使后续加 `env(safe-area-inset-left/right)` padding，没有 `viewport-fit=cover` 也是空操作

4. **模板与产物同步问题**：
   - `.codex/skills/wego-ux/templates/host-shell.css` 和 `host-shell.html` 有完全相同的问题
   - 修产物不修模板 → 下次 AI 生成新 app 时问题复现

## Proposed Changes（修改计划）

### 文件 1：`wego-app/css/app.css`

**修改点 1.1**：在移动端媒体查询（第 369 行 `@media (max-width: 767px)` 块内）新增 `.host-shell-page` 显式横向 padding 规则

在 `.phone-status, .phone-indicator { display: none; }` 之后追加：

```css
  .host-shell-page {
    padding-left: var(--spacer-16);
    padding-right: var(--spacer-16);
  }
```

**为什么**：
- 显式声明 `padding-left` / `padding-right`，避免 3 值简写在 CSS 变量级联异常时整条声明失效
- 与桌面端保持一致的 16px 横向 padding
- 后续如果需要支持刘海屏，可在此基础上加 `env(safe-area-inset-left/right)`

**修改点 1.2**（可选增强）：如果要支持刘海屏横向安全区，改为：

```css
  .host-shell-page {
    padding-left: calc(var(--spacer-16) + env(safe-area-inset-left, 0px));
    padding-right: calc(var(--spacer-16) + env(safe-area-inset-right, 0px));
  }
```

**注意**：此增强需要配合 viewport-fit=cover（见文件 2、3）。如果不加 viewport-fit=cover，`env()` 始终返回 0，等同于修改点 1.1。**建议采用 1.2 + viewport-fit=cover 方案**，一步到位支持刘海屏。

### 文件 2：`wego-app/index.html`

**修改点 2.1**：第 5 行 viewport meta 标签增加 `viewport-fit=cover`

原文：
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

改为：
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

**为什么**：启用 `viewport-fit=cover` 后，内容会延伸到屏幕边缘（包括刘海区域），`env(safe-area-inset-*)` 才能返回真实的设备安全区值。配合文件 1 的 `env(safe-area-inset-left/right)` padding，可确保刘海屏设备上内容不被刘海遮挡。

### 文件 3：`.codex/skills/wego-ux/templates/host-shell.html`

**修改点 3.1**：第 19 行 viewport meta 标签同步增加 `viewport-fit=cover`

原文：
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

改为：
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

**为什么**：模板是 AI 生成新 app 的基线来源，必须与 `wego-app/index.html` 保持一致，否则下次生成新 app 时问题复现。

### 文件 4：`.codex/skills/wego-ux/templates/host-shell.css`

**修改点 4.1**：在移动端媒体查询（第 286 行 `@media (max-width: 767px)` 块内）新增 `.host-shell-page` 显式横向 padding 规则

在 `.phone-status, .phone-indicator { display: none; }` 之后追加：

```css
  .host-shell-page {
    padding-left: calc(var(--spacer-16) + env(safe-area-inset-left, 0px));
    padding-right: calc(var(--spacer-16) + env(safe-area-inset-right, 0px));
  }
```

**为什么**：模板 CSS 必须与 `wego-app/css/app.css` 保持同步，否则 AI 下次生成新 app 时会基于旧模板，问题复现。

### 文件 5：`.codex/skills/wego-design/specs/布局与间距规范.md`

**修改点 5.1**：在"页面边距"章节的 M1/M2/M3 三档表后追加移动端适配说明

```markdown
### 移动端横向 padding 适配规则

- `.host-shell-page` 必须在移动端媒体查询 `@media (max-width: 767px)` 中显式声明 `padding-left` / `padding-right`，禁止只依赖 3 值 padding 简写在桌面端的定义
- 移动端横向 padding 取值应与桌面端一致（M1=0px，M2=16px），或使用 `calc(var(--spacer-16) + env(safe-area-inset-left/right, 0px))` 支持刘海屏
- viewport meta 必须包含 `viewport-fit=cover`，否则 `env(safe-area-inset-*)` 在 iOS 上始终返回 0
- 模板 `host-shell.css` 与产物 `wego-app/css/app.css` 必须保持同步更新
```

## Assumptions & Decisions

### 已验证的前提
1. **`--spacer-40` 和 `--spacer-16` 都存在**于 `wego-app/lib/colors_and_type.css`（第 353 行、第 349 行），不是变量未定义导致 3 值简写失效
2. **全仓库没有其他 `.host-shell-page` 覆盖规则**（grep 全仓库只有 `wego-app/css/app.css` 第 69 行、`wego-ux/templates/host-shell.css` 第 73 行两处定义），不是被场景 CSS 覆盖
3. **`预览页脚手架规范.md` 第 96、126 行**确认 `--safe-area-top: 0` 移动端重置是设计意图（联动隐藏桌面 mock），但规范本身未约束 `.host-shell-page` 移动端横向 padding 行为
4. **`viewport-fit=cover` 在 `wego-app/index.html` 和 `host-shell.html` 中均缺失**，导致 iOS 设备上 `env(safe-area-inset-left/right)` 始终返回 0

### 决策
1. **采用 1.2 + viewport-fit=cover 方案**（而非仅 1.1 的简单修复）：一步到位支持刘海屏，避免后续再迭代
2. **模板和产物同步修改**：`host-shell.css`、`host-shell.html` 与 `wego-app/css/app.css`、`wego-app/index.html` 保持一致，防止下次 AI 生成新 app 时问题复现
3. **不修改 `.host-shell-page` 的桌面端规则**：保持第 73 行的 3 值简写不变，只在移动端媒体查询中追加显式 `padding-left` / `padding-right`——这是最低风险的护栏式修复
4. **不修改 `.app-scene-layer`**：场景层的横向 padding 由 M1/M2 模式决定（已在上一轮工作流迭代中约束），不在本轮范围内
5. **不递增 `metadata.json` version**：本轮修改的是 app 产物文件和 wego-ux 模板，不是 wego-design 设计系统本体（specs 文档只是补充说明）

## Verification Steps

### 1. 桌面端回归验证
- 电脑端打开 `wego-app/index.html`，检查"我的"tab 内容左右间距是否仍为 16px（不受影响）
- 检查 phone-frame 边框和 preview-shell 间距是否正常

### 2. 移动端验证
- 浏览器 DevTools 切换到移动端视图（iPhone 14 Pro / 375px 宽度）
- 打开 `wego-app/index.html`，检查"我的"tab 内容左右是否有 16px 间距
- 检查 profile-card、membership-card、app-card、list-card 是否距屏幕边缘 16px

### 3. 刘海屏验证（如有 iOS 真机）
- 在 iPhone X 及以上设备上打开页面
- 检查横屏时内容是否避开刘海区域（`env(safe-area-inset-left/right)` 生效）

### 4. 模板同步验证
- 对比 `.codex/skills/wego-ux/templates/host-shell.css` 与 `wego-app/css/app.css` 的 `.host-shell-page` 移动端规则是否一致
- 对比 `.codex/skills/wego-ux/templates/host-shell.html` 与 `wego-app/index.html` 的 viewport meta 是否一致

### 5. 场景层影响验证
- 打开价格权限管理场景（`#/price-permission-management`）
- 检查场景页面横向 padding 是否符合 M1/M2 模式声明（不影响场景层，场景层有自己的 padding 规则）

## 本轮不处理的事项

1. **`.app-scene-layer` 的横向 padding**：场景层的横向 padding 由 M1/M2 模式决定（上一轮工作流迭代已约束），不在本轮范围
2. **`.host-shell-page` 桌面端 3 值 padding 简写重构**：保持现有桌面端规则不变，只在移动端媒体查询中追加显式横向 padding，降低改动风险
3. **metadata.json version 递增**：本轮修改的是 app 产物和 wego-ux 模板，不是 wego-design 设计系统本体
