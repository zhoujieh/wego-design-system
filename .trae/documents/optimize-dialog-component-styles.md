# 优化 dialog 组件样式（剩余实施计划）

## 当前状态

已在前序对话中完成：
- `scaffold.css` 已添加统一 `.demo-stage` 白底规则与 `.demo-stage--col`
- `specs/预览页脚手架规范.md` 已补充 `.demo-stage` 行
- `preview/component-toast.html` 已移除内联 `.demo-stage`，改用 `.demo-stage demo-stage--col`
- `preview/component-dialog.html` 已重写：`.dialog` 自身作为 overlay 容器（`position:fixed; inset:0; background:var(--bg-mask-light)`），`data-state="open/closed"` 状态机，`.dialog__card` 用 `--shadow-xl`，链接改用 `.link.link--inline`，"不再提示" 改用 `.checkbox-field > .checkbox--sm`，input 背景改 `--bg-surface`，按钮 `:hover/:active` 反馈

剩余任务：修复 dialog preview 一个 token 引用 bug，同步 dialog.json 契约，递增 metadata，重生成 components.css，wego-app 接入 dialog 宿主与 `dialog()` API，最后同步 lib 并守门。

## 待实施变更

### 1. 修复 dialog preview 的 `--state-focus` 引用 bug

**文件**：`.codex/skills/wego-design/preview/component-dialog.html`

**问题**：line 254 `outline:var(--stroke-strong) solid var(--state-focus);` 引用了不存在的 `--state-focus` token（已确认 `colors_and_type.css` 中无此 token）。

**修复**：参考 input 组件（`border-color: var(--border-neutral-l2)`）与 button 组件的 focus 处理，改为：
```css
.dialog__btn:focus-visible{
  outline:var(--stroke-strong) solid var(--border-brand);
  outline-offset:calc(-1 * var(--spacer-2));
}
```
（`--border-brand` 已在 colors_and_type.css 中定义，与 input/checkbox 等组件的焦点表达一致）

### 2. 同步 dialog.json 契约

**文件**：`.codex/skills/wego-design/components/dialog.json`

按 preview 实际实现回写契约，保持 schemaVersion 3 不变：

#### 2.1 `anatomy` 数组
- 删除 `mask` 项（`.dialog__mask` 已不存在，根节点自身承担遮罩）
- `root` 项的 role 描述更新为："浮层容器，自身承担半透明遮罩（var(--bg-mask-light)），承载居中卡、定位与动画"
- `link` 项 selector 改为 `.link.link--inline`，role 描述："正文内可点击链接，复用 link 组件 inline 变体，至多 2 处"
- `check` 项 role 描述补充："复用 checkbox 组件 .checkbox--sm（20px，带文本场景标准用法）"
- `input` 项 role 描述补充："input 背景为 var(--bg-surface)，与 input 组件对齐"
- `btn` 项 role 描述补充："含 :hover/:active 背景反馈（var(--bg-state-hover)/var(--bg-state-pressed)）"

#### 2.2 `structurePatterns` 数组
- 第 1 条改为："根节点 .dialog 是 overlay 定位容器，自身承担半透明遮罩背景 var(--bg-mask-light)，position:fixed; inset:0；不再使用独立 .dialog__mask 子节点。"
- 第 5 条改为："正文链接通过 .link.link--inline 标记（复用 link 组件），至多 2 处，蓝色文字。"
- 第 8 条改为："勾选项 .dialog__check 位于按钮行上方，复用 checkbox 组件 .checkbox--sm（带文本场景的标准用法，20px）。"
- 第 4 条后追加一条："状态机通过 data-state='open'/'closed' 属性切换，不再使用 is-visible/is-leaving 类。"

#### 2.3 `behavior`
- `closeByMask` 改为："默认 true，点击 .dialog overlay 空白区域（e.target === dialog）关闭；可通过修饰类 --mask-unclosable 关闭。"
- `animation` 改为："overlay opacity 0→1 + card scale 0.9→1，时长 var(--duration-normal)，缓动 var(--ease-enter)/var(--ease-standard)；出场反向，data-state='closed' 触发 opacity→0 与 scale→0.9。"

#### 2.4 `designTokens`
- `cardShadow` 从 `var(--shadow-lg)` 改为 `var(--shadow-xl)`
- `enterScale` 从 `0.95` 改为 `0.9`
- `leaveScale` 从 `0.95` 改为 `0.9`
- `enterEase` 从 `var(--ease-enter)` 改为 `var(--ease-standard)`（与 preview 实际 transition 一致）
- `leaveEase` 从 `var(--ease-exit)` 改为 `var(--ease-standard)`

#### 2.5 `cssCustomProperties` 数组
- `--dialog-enter-scale` 默认值改为 `0.9`
- 删除 `--dialog-mask-depth`（mask 已由根节点 background 直接承担，不再作为可调 CSS 变量）
- 删除 `--dialog-mask-closable`（行为类控制，非 CSS 变量）

#### 2.6 `domAnatomy`
- `optionalChildren` 删除 `.dialog__mask` 与 `.dialog__link`
- `modifiers` 删除 `.dialog.is-floating`、`.dialog.is-visible`、`.dialog.is-leaving`、`.dialog--mask-unclosable`
- `modifiers` 新增 `[data-state="open"]`、`[data-state="closed"]`
- 保留 `.dialog--mask-unclosable` 行为修饰类说明放到 behavior.closeByMask（不放入 modifiers，因 preview 未实现，仅作契约描述）

#### 2.7 `variantDimensions.state`
- 改为 `["open", "closed"]`（替代旧的 `initial/visible/leaving`）

#### 2.8 `tokensConsumed` 调整
- 移除：`--bg-mask-modal`、`--bg-mask-strong`、`--bg-muted`、`--shadow-lg`、`--ease-exit`
- 新增：`--shadow-xl`、`--bg-state-hover`、`--bg-state-pressed`、`--ease-standard`、`--stroke-strong`、`--border-brand`
- 保留：`--bg-mask-light`（仍是默认 mask 背景）

### 3. 递增 metadata.json version

**文件**：`.codex/skills/wego-design/metadata.json`

`version` 从 `326` 改为 `327`（dialog 组件样式架构性重构，必须递增）

### 4. 重新生成 components.css

**命令**：
```bash
node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design
```

将 `preview/component-dialog.html` 中 `@component-css-start`/`@component-css-end` 之间的新 CSS 抽取到 `components.css`（包含修复后的 `--border-brand` 版本）。

### 5. wego-app/index.html 新增 .app-dialog-host 容器

**文件**：`wego-app/index.html`

在 `.app-toast-host` 之前（line 107 前）插入：
```html
<div class="app-dialog-host" data-dialog-host role="region" aria-label="对话框浮层"></div>
```

放在 toast host 之前的原因：dialog z-index（600）低于 toast（700），DOM 顺序与 z-index 一致更清晰；dialog 通常阻塞式常驻，toast 仍可在 dialog 上方提示。

### 6. wego-app/css/app.css 新增 dialog 宿主样式

**文件**：`wego-app/css/app.css`

在 `.app-toast-host` 规则块附近（line 449 附近）追加：
```css
.app-dialog-host {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-modal);
}

/* phone-frame 预览中 dialog 相对宿主定位而非视口 */
.app-dialog-host .dialog {
  position: absolute;
  pointer-events: auto;
}
```

镜像 toast 的处理：
- host 自身 `pointer-events: none`，子元素 `pointer-events: auto`，避免 host 拦截底层交互
- lib 中 `.dialog` 是 `position: fixed`，在 phone-frame 内会被定位到浏览器视口而非手机壳；覆盖为 `position: absolute` 让 dialog 受 `.phone-screen`（`position: relative`）约束

### 7. wego-app/js/app.js 新增 dialog() API

**文件**：`wego-app/js/app.js`

#### 7.1 顶部变量声明（line 9 附近）
```js
var dialogHost = document.querySelector('[data-dialog-host]');
```

#### 7.2 在 toast() 函数之后新增 dialog() 函数

入参形态（与 preview 演示一致，简化为对象入参）：
```js
// dialog({ variant, title, content, icon, inputPlaceholder, buttons, onClose })
//   - variant: 'text' | 'status' | 'title' | 'input'，默认 'text'
//   - title:   必选，标题文案
//   - content: 可选，正文文案（可含 HTML，如 <a class="link link--inline">）
//   - icon:    仅 status 生效，'success' | 'warning' | 'danger'
//   - inputPlaceholder: 仅 input 生效
//   - buttons: [{ label, tone:'default'|'danger'|'weak', onClick? }]，1-3 个
//   - onClose: 关闭后回调，可选
```

实现要点（镜像 preview 的 showDialog 逻辑）：
- 同屏互斥：新 dialog 出现前移除旧 dialog（含 data-state="closed" 过渡中的）
- 创建 `.dialog.dialog--{variant}`，设置 `role="dialog"` `aria-modal="true"` `data-state="closed"`
- 构造 `.dialog__card` > `.dialog__header`（含 icon + title）→ `.dialog__content`（可选）→ `.dialog__input`（仅 input）→ `.dialog__actions`
- buttons 渲染：相邻按钮间插入 `.dialog__divider`
- 点击 `.dialog` 自身（e.target === dialog）触发关闭
- 链接（`[data-link]`）点击 `preventDefault` + `stopPropagation`，不关闭
- input 变体：打开后聚焦输入框；回车触发主按钮（最后一个按钮）点击
- 关闭流程：`data-state="closed"` → 250ms 后移除 DOM → 触发 onClose
- 暴露给 buttons[i].onClick 一个 `close` 参数（调用即关闭 dialog）

#### 7.3 暴露到 sceneContext 与 overlay context

**sceneContext**（line 188 附近，`toast: toast,` 后追加）：
```js
dialog: dialog,
```

**overlay context**（line 281 附近，`options.init({ root, close, toast, ... })` 中追加）：
```js
dialog: dialog,
```

### 8. 同步 lib 到 wego-app

**命令**：
```bash
node scripts/sync-wego-app-lib.mjs
```

将更新后的 `components.css`（含新 dialog 样式）同步到 `wego-app/lib/components.css`。

### 9. 守门验证

**命令**：
```bash
node scripts/validate-wego-design.mjs
```

确认：JSON 格式、Token 同步、组件三向对齐（dialog.json ↔ preview ↔ components.css）、components.css 完整性、UI Kit 成对、过期路径、禁止文件、metadata version 递增。

### 10. 排查 scenes 旧引用（验证）

已通过 grep 确认 `wego-app/scenes` 目录无 `dialog` / `is-visible` / `is-leaving` / `dialog__mask` 旧引用，无需迁移。

## 验证步骤

1. `node scripts/validate-wego-design.mjs` 通过
2. 浏览器打开 `wego-app/index.html`，在任意场景通过控制台执行 `window.wegoApp.dialog({ variant:'text', title:'测试', buttons:[{label:'取消'},{label:'确认'}] })`（或暴露的入口）验证：
   - 电脑端：dialog 在 phone-frame 范围内居中，蒙层覆盖整个 phone-screen，不溢出到浏览器视口
   - 移动端：dialog 居中铺满 viewport
   - 点击蒙层空白关闭
   - 点击按钮关闭
   - input 变体自动聚焦，回车触发主按钮
3. 打开 `preview/component-dialog.html` 验证 13 个 demo 静态展示正确，焦点态 outline 用 `--border-brand`
4. 打开 `preview/component-toast.html` 验证 `.demo-stage` 白底，无视觉回归

## 假设与决策

1. **dialog host 放在 toast host 之前**：z-index 已分级（dialog 600 < toast 700），DOM 顺序与 z-index 一致，避免 toast 被 dialog 遮挡。
2. **`.app-dialog-host .dialog` 覆盖 `position: fixed` 为 `absolute`**：镜像 toast 的 `.app-toast-host .toast.is-floating { position: absolute; }` 模式，确保 phone-frame 预览下 dialog 不溢出。
3. **`--state-focus` 改用 `--border-brand`**：input/checkbox 组件均用 `--border-brand` 表达焦点态，保持一致；不在本次新增 `--state-focus` token（避免 token 体系扩张）。
4. **dialog() API 不支持 `--mask-unclosable` 修饰类参数**：preview 契约保留该修饰类作为业务自定义扩展，API 默认 maskClosable=true；如业务需要不可关闭，可后续扩展 `maskClosable: false` 参数。
5. **不持久化 dialog 状态**：与 doNotInvent 一致，刷新后不保留。
6. **不修改 dialog.json 的 `representativeVariants`**：变体矩阵不变，仅样式架构调整。

## 风险

1. **components.css 重新生成后其他组件样式可能受影响**：extract 脚本只抽取 `@component-css-start/end` 之间的内容，dialog 块替换不影响其他组件块。验证脚本会兜底。
2. **scenes 目录暂无 dialog 调用方**：本次新增 `dialog()` API 是预备能力，无现有调用方需迁移；后续业务场景可直接通过 sceneContext.dialog 调用。
3. **`--bg-state-hover`/`--bg-state-pressed` 是新增消费的 token**：已在 colors_and_type.css line 138-139 确认存在，无需新增。
