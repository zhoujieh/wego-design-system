# Input 组件增强：清除图标与错误提示

## 概述

为标准文本输入框增加清除图标（`icon-yuancha-mian`）、错误提示文本，并明确数字输入框和多行文本输入框不显示清除图标，禁用态不显示清除图标。

## 当前状态分析

- `preview/component-input.html`：标准文本输入框有 default/focus/error/disabled 四种状态，但无清除图标、无错误提示文本
- `components/input.json`：anatomy 只有 root/label/control 三部分，缺少清除图标和错误提示的描述
- 错误态（`.is-error`）只改变了边框和文字颜色，没有错误提示文本
- 图标 `icon-yuancha-mian` 已存在于 `iconfont.css`（class: `.icon-yuancha-mian`，font-family: `wego-iconfont-s`）

## 需求拆解

### 1. 清除图标（仅标准文本输入框）
- 输入框有内容时，右侧显示清除图标 `icon-yuancha-mian`
- 图标大小 16px，颜色 `var(--color-text-placeholder)`（#B7BEC5）
- 图标的 `<i>` 元素使用 `wego-iconfont-s` 字体族、16px 字号
- 图标位于输入框**内部**右侧
- 点击后清空输入内容并聚焦输入框
- 需要用 JS 监听 input 事件控制图标显示/隐藏，以及点击清除逻辑

### 2. 错误提示文本
- 错误态时，在输入框下方绝对定位显示错误提示文本
- 文字 10px（`var(--font-size-10)`），红色（`var(--color-danger)`）
- 输入内容正确后恢复默认样式（移除错误态）

### 3. 排除规则
- 数字输入框（`.number-input`）不显示清除图标
- 多行文本输入框（`textarea`）不显示清除图标
- 禁用态（`.is-disabled`）的标准文本输入框也不显示清除图标

### 4. 错误态清除图标颜色
- 错误状态下，清除图标变为红色（`var(--color-danger)`）

## 修改清单

### 文件 1: `preview/component-input.html`（预览页 + 组件 CSS）

**HTML 结构变更：**
- 标准文本输入框的 `<input>` 外层包裹一个 `.input-wrapper` 容器（用于定位清除图标）
- 在 `.input-wrapper` 内添加清除按钮：`<button type="button" class="input-clear"><i class="icon-yuancha-mian"></i></button>`
- 错误态示例中，添加错误提示文本：`<span class="field-error">请输入正确的手机号码</span>`
- 增加一个"错误态 + 有内容"的示例，展示红色清除图标 + 错误提示

**CSS 变更（`/* @component-css-start */` 内）：**
- 新增 `.input-wrapper`：`position: relative`，用于定位清除图标
- 新增 `.input-clear` 样式：
  - `position: absolute; right: 8px; top: 50%; transform: translateY(-50%)`
  - `display: none;`（默认隐藏，JS 控制显示）
  - `background: none; border: none; cursor: pointer; padding: 4px`
  - 清除图标 `<i>` 元素字体大小 16px，颜色 `var(--color-text-placeholder)`（#B7BEC5），font-family `wego-iconfont-s`
- 错误态下清除图标变红：`.input-group.is-error .input-clear { color: var(--color-danger); }`
- 禁用态隐藏清除图标：`.input-group.is-disabled .input-clear { display: none; }`
- `.input-group` 新增 `position: relative`（用于错误提示绝对定位）
- 新增 `.field-error` 样式：
  - `position: absolute; top: 100%; left: 0; margin-top: 4px; white-space: nowrap`
  - `display: none; font-size: var(--font-size-10); color: var(--color-danger)`
  - `.input-group.is-error .field-error { display: block; }`

**JS 逻辑：**
- 初始化时对所有标准文本 `<input>`（`.input-group input[type="text"]`）绑定事件
- `input` 事件：有值时设置清除按钮 `display: block`，无值时 `display: none`
- 同时检查 `data-clear-visible` 属性做双重控制，避免 CSS 继承冲突
- 点击清除按钮时：清空 value、触发 input 事件（图标自动隐藏）、聚焦输入框
- 禁用态下即使有值也不显示清除图标（`element.disabled` 检查）
- 只针对 `.input-group` 下的 `input[type="text"]`，不处理 textarea 和 `.number-input`

### 文件 2: `components/input.json`（组件契约）

- `anatomy` 新增：
  - `{ "name": "wrapper", "selector": ".input-wrapper", "role": "输入区包裹容器（用于定位清除按钮）" }`
  - `{ "name": "clear", "selector": ".input-clear", "role": "清除按钮，点击清空并聚焦" }`
  - `{ "name": "error", "selector": ".field-error", "role": "错误提示文本" }`
- `behavior` 新增清除行为描述
- `tokensConsumed` 新增 `--font-size-10`、`--color-text-placeholder`
- `domAnatomy.requiredChildren` 不变（clear 和 error 是可选元素）
- `structurePatterns` 补充清除图标规则

### 文件 3: `components.css`（重新生成）

- 运行 `node scripts/extract-components-css.mjs .` 自动重新生成，不手动编辑

### Token 使用策略

**已有 Token，无需新增：**
- 清除图标默认色：`var(--color-text-placeholder)`，语义色别名，指向 `--wg-color-base-neutral-500`（#B7BEC5）
- 错误态清除图标色：`var(--color-danger)`，语义色别名，指向 `--wg-color-base-danger-500`（#FA5051）
- 错误提示字号：`var(--font-size-10)`，已存在，指向 `--wg-font-size-f10`（10px）
- 错误提示颜色：`var(--color-danger)`

**Token 新增原则（如将来需要）：**
- 遵循 `colors_and_type.css` 三层架构：reference/primitives → public semantic → dark overrides
- 组件仅消费 `--color-*`、`--font-*`、`--space-*`、`--radius-*`、`--size-*` 公共语义 Token
- 不创建单组件、单页面专用的 Token
- 改 `colors_and_type.css` 后必须同步 `css.json` 和受影响的组件

## 前置条件与假设

- `icon-yuancha-mian` class 为 `.icon-yuancha-mian`，font-family 为 `wego-iconfont-s`，使用 `<i class="wego-iconfont-s icon-yuancha-mian"></i>`
- 预览页已引入 `../iconfont.css`，无需额外引用
- 错误提示用 `.input-group.is-error .field-error { display: block }` 控制显示，而非 JS

## 验证步骤

1. 打开 `preview/component-input.html`，确认：
   - 标准文本输入框输入内容后右侧出现 16px 清除图标，颜色为占位文字色（#B7BEC5）
   - 点击清除图标后内容清空、图标消失、输入框聚焦
   - 错误态示例：输入框下方显示红色 10px 错误提示文本
   - 错误态有内容时：清除图标为红色
   - 数字输入框无清除图标
   - 多行文本输入框无清除图标
   - 禁用态输入框无清除图标
2. 运行 `node scripts/extract-components-css.mjs .` 确认 `components.css` 正确重新生成
3. 确认 `components/input.json` 与预览页结构一致
