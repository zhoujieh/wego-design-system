# 新增 toast 组件

## 概要

基于 Figma 设计稿(node-id 75:55812) 与 `docs/kuikly_components/Toast.md` 文档,在 `wego-design` 设计系统中新增 `toast` 组件(第 18 个稳定组件),覆盖以下 2 类场景:

- **默认 Toast**:居中显示,纯文案告知用户当前发生了什么(对应 Figma `.Toast`)
- **引导型 Toast**:左侧文案必选 + 左侧图标可选 + 右侧操作按钮可选(WEAK/STRONG),引导用户进行下一步操作(对应 Figma `.Toast_Action`)

本轮**仅发布 toast 视觉组件契约**(slug: `toast`),不单独注册 DialogContainer;定位、动画、conflicting 单例、自动关闭等行为规则写入契约 `behavior` 字段,由宿主 App 承载。

---

## 当前状态分析

### 设计系统已具备的条件

- `colors_and_type.css` 已预留 toast 专用 Token,无需新增:
  - `--bg-toast: rgba(63, 67, 71, 0.96)`(与 Figma 完全一致)
  - `--z-toast: 400`
  - `--duration-xslow: 500ms`(对应 Toast.md 描述的淡出动画时长)
  - `--text-inverse`、`--text-tertiary`、`--palette-green-400`、`--radius-8`、`--spacer-12`、`--spacer-16`、`--body-md-*`、`--size-20`、`--size-16`、`--ease-standard`、`--ease-enter`
- 现有 17 个稳定组件中尚无浮层类组件,toast 是首个
- `preview/component-switch.html` 中已有一个临时 `.toast` demo class(非正式),本组件发布后可作为收口参考
- iconfont 已含引导型 toast 允许的全部 4 个图标(经用户确认限定):
  - `.icon-goutoast`(购物 toast,line 630)
  - `.icon-chatoast`(查 toast,line 634)
  - `.icon-tanhao`(感叹号,line 1650)
  - `.icon-shijian`(时间,line 1502)
- **不允许使用其他图标,不允许自定义图标**

### Figma 设计稿提取的关键规格

**两个原生组件:**

| 组件 | 节点 ID | 宽度 | 高度 | 行数 | 用途 |
|---|---|---|---|---|---|
| `.Toast` | 2292:62628 | max 268px | 44px | 1 行 | 默认纯告知 |
| `.Toast_Action` | 2292:62656 | min 288px / max 480px | 44px | ≤2 行 | 引导型带操作或图标 |

**`.Toast_Action` 4 种变体(来自 Figma,均归入"引导型 toast"):**

1. **纯文字**(无图标无操作):仅文本
2. **图标 + 文字**(无操作):左侧 20px 图标,4px 间距,文字
3. **文字 + WEAK 操作**:文字 + 24px 间距 + 灰色文字按钮(#969AA0, Regular 14px)+ 16px 右箭头图标(同色)
4. **图标 + 文字 + STRONG 操作**:左侧 20px 图标 + 文字 + 24px 间距 + 绿色文字按钮(#49C167, Medium 14px,无箭头)

> 备注:Figma 同时展示了上述 4 种过渡形态,但根据用户最终确认:**引导型 toast 的标准形态是"左侧文案必选 + 左侧图标可选 + 右侧操作可选(WEAK/STRONG)"**;4 种 Figma 变体均通过 `iconMode`(none/限定 4 种之一) × `actionMode`(none/weak/strong) 灵活组合。

**通用视觉规格(从 Figma 提取):**

- 背景:`var(--bg-toast)` ✓ 与 Token 一致
- 文字颜色:`var(--text-inverse)` 白色,14px PingFang SC Regular
- 圆角:`var(--radius-8)` 8px
- 边框:0.5px rgba(255,255,255,0.4)(**Figma 新增,Token 中无对应,需在组件 CSS 内硬编码并记录到契约**)
- padding:
  - 默认 Toast:`px-16 py-12`
  - 引导型 Toast:`px-12 py-12`(Figma 使用 `var(--表单高度/间隙_2,12px)`)
- 高度:44px 固定
- 图标尺寸:20px(引导型左侧)、16px(WEAK 操作右侧箭头)
- gap:图标-文字 4px;文字-操作 24px
- 位置:距底部 106px(Figma 案例值,含安全区)
- z-index:`var(--z-toast)` 400
- 案例宽度:343px(满宽 strip 形态,375 - 16*2)
- 文字对齐:默认 toast 居中(text-center);引导型 toast 左对齐(text-left,为操作按钮让位)

**使用场景规则(Figma 文本说明 + 用户确认):**

- 默认 Toast:"文本尽量不超过 8 个字,严格限制在 1 行以内。轻型操作的反馈,不强调结果"
- 引导型 Toast:"操作后有额外引导操作、重要反馈"
  - 文案必选,最多 2 行
  - 左侧图标可选(默认不显示;仅在购物/查询/感叹/时间四类业务场景下使用对应图标)
  - 右侧操作按钮可选,强弱根据当前任务重要性决定:
    - STRONG(绿色高亮文字按钮):与当前反馈内容相关性强的高亮操作
    - WEAK(灰色文字 + 右箭头):相关弱的跳转类操作
  - 伴随页面级跳转:跳转后反馈需明显可见,即使不带操作也使用长条形 toast

---

## 提议变更

### 1. 新增组件契约

**文件**: `.codex/skills/wego-design/components/toast.json`(新建)

契约要点:

- `slug`: `toast`
- `name`: `提示`
- `category`: `feedback`(新增类别,与 form/navigation/display 等并列)
- `status`: `stable`
- `semanticTypeCandidates`: `["feedback", "toast", "transient-notification"]`
- `variantDimensions`:
  - `variant`: `["default", "guide"]`(对应 Figma 的 .Toast / .Toast_Action)
  - `iconMode`: `["none", "shopping", "query", "exclamation", "time"]`(限定 4 种业务图标,None 为默认)
  - `actionMode`: `["none", "weak", "strong"]`
  - `state`: `["entering", "visible", "leaving"]`
- `representativeVariants`:
  - 默认 Toast(纯文字,居中)
  - 引导型 + 无图标无操作(纯文字两行)
  - 引导型 + shopping 图标(无操作)
  - 引导型 + WEAK 操作(文字 + 箭头)
  - 引导型 + shopping 图标 + STRONG 操作
- `anatomy`:
  - `root`: `.toast`
  - `icon`: `.toast__icon`(可选)
  - `text`: `.toast__text`
  - `action`: `.toast__action`(可选)
- `structurePatterns`:
  - 根节点 `.toast`,叠加 `.toast--default` 或 `.toast--guide` 修饰类
  - 引导型带图标使用 `.toast__icon` 子节点,类名叠加 `icon-goutoast`/`icon-chatoast`/`icon-tanhao`/`icon-shijian` 之一
  - 引导型带操作使用 `.toast__action` 子节点,叠加 `.toast__action--weak` 或 `.toast__action--strong`
- `behavior`:
  - `autoClose`: "默认显示 4000ms(默认)/ 4500ms(引导型)后开始淡出动画,淡出 500ms(var(--duration-xslow))后移除 DOM"
  - `conflicting`: "默认 conflicting=true,新 toast 出现会顶替当前显示中的 toast;需同时显示多个时业务侧显式传 conflicting=false"
  - `hideTriggers`: "页面跳转(route 切换)、用户操作页面其他功能(点击按钮/展开折叠/提交表单)、点击引导型 toast 的操作按钮后,应立即隐藏 toast 并触发回调。默认 toast 点击 toast 本身不触发隐藏"
  - `position`: "底部弹出,距页面底部 106px(含安全区)。使用 position: fixed; bottom: 106px; left: 50%; transform: translateX(-50%)"
  - `animation`: "进入: opacity 0→1 + translateY(8px→0),var(--duration-normal) var(--ease-enter);离开: opacity 1→0,var(--duration-xslow) var(--ease-exit)"
- `usageHints`:
  - "默认 Toast 文案不超过 8 个字,严格限制 1 行;居中显示,纯告知"
  - "引导型 Toast 文案必选,最多 2 行"
  - "引导型 toast 左侧图标默认不显示;仅在购物/查询/感叹/时间四类业务场景下使用对应图标(icon-goutoast/icon-chatoast/icon-tanhao/icon-shijian),不允许使用其他图标,不允许自定义图标"
  - "右侧操作按钮可选:STRONG(绿色高亮)用于相关性强的高亮操作;WEAK(灰色 + 右箭头)用于相关弱的跳转类操作"
  - "页面跳转后即使不带操作也应使用长条形 toast 确保反馈可见"
  - "同时只允许显示 1 个 conflicting=true 的 toast"
- `doNotInvent`:
  - "不要扩展为 loading、modal、dialog 等非瞬时反馈形态"
  - "不要在 toast 内放置输入框、多按钮组或复杂表单"
  - "不要让 toast 阻断页面交互(pointer-events: none)"
  - "不要为默认 toast 添加图标或操作按钮"
  - "不要使用 icon-goutoast/icon-chatoast/icon-tanhao/icon-shijian 之外的图标"
  - "不要自定义图标 SVG"
- `tokensConsumed`: 列出全部消费的 Token
- `designTokens`: 写入从 Figma 提取的具体尺寸
- `provenance`: `{ "preview": "preview/component-toast.html", "cssSource": "preview/component-toast.html", "embedded": false, "hostComponent": null }`

### 2. 新增预览页

**文件**: `.codex/skills/wego-design/preview/component-toast.html`(新建)

**结构**(参考 `component-button.html` 和 `component-switch.html` 的脚手架):

```text
<head>
  - 引入 colors_and_type.css / scaffold.css / iconfont.css
  - <style> @component-css-start ... @component-css-end </style>
</head>
<body>
  - pv-header: "提示 Toast"
  - 静态展示区(变体矩阵):
    - 默认 Toast(纯文字 居中)
    - 默认 Toast 长文案省略演示
    - 引导型 - 无图标无操作(纯文字两行)
    - 引导型 + icon-goutoast(无操作)
    - 引导型 + icon-chatoast(无操作)
    - 引导型 + icon-tanhao(无操作)
    - 引导型 + icon-shijian(无操作)
    - 引导型 + WEAK 操作(文字 + 箭头)
    - 引导型 + STRONG 操作(绿色文字按钮)
    - 引导型 + icon-goutoast + STRONG 操作(完整组合)
  - 暗色模式展示区
  - 交互演示区:
    - 4 个触发按钮 → 触发 4 种 toast(默认/引导无操作/引导 WEAK/引导 STRONG)
    - 演示 conflicting(快速连点两个按钮看到顶替)
    - 演示自动关闭(duration)
    - 演示淡出动画
    - 演示"点击页面其他区域时隐藏"(document click listener)
    - 演示"点击引导按钮后立即隐藏并 alert 回调"
  - 模拟手机 frame 内的 toast 定位演示(参考 Figma 案例 106px from bottom)
</body>
```

**组件核心 CSS(标记区内,可被 extract 脚本聚合):**

```css
/* @component-css-start */
.toast {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacer-8);
  min-height: 44px;
  padding: var(--spacer-12) var(--spacer-16);
  background: var(--bg-toast);
  border: 0.5px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-8);
  color: var(--text-inverse);
  font-family: var(--body-md-font-family);
  font-size: var(--body-md-font-size);
  font-weight: var(--body-md-font-weight);
  line-height: var(--body-md-line-height);
  box-sizing: border-box;
  pointer-events: none;
  z-index: var(--z-toast);
  -webkit-user-select: none;
  user-select: none;
}

/* 默认 toast:居中、最宽 268px、单行省略 */
.toast--default {
  max-width: 268px;
}
.toast--default .toast__text {
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 236px;
}

/* 引导型 toast:左对齐、最宽 480px、最小宽 288px、最多两行 */
.toast--guide {
  max-width: 480px;
  min-width: 288px;
  padding: var(--spacer-12);
  justify-content: flex-start;
}
.toast--guide .toast__text {
  flex: 1 1 0;
  min-width: 0;
  text-align: left;
  white-space: normal;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 图标(限定 4 种 iconfont 类,不允许其他) */
.toast__icon {
  font-family: "wego-iconfont-s" !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1;
  font-size: 20px;
  flex-shrink: 0;
  color: var(--text-inverse);
}

/* 文字 */
.toast__text {
  flex: 0 1 auto;
  min-width: 0;
}

/* 操作按钮 */
.toast__action {
  display: inline-flex;
  align-items: center;
  gap: var(--spacer-2);
  padding: 0 var(--spacer-4);
  height: 24px;
  border: none;
  background: transparent;
  border-radius: var(--radius-4);
  font-family: var(--body-md-font-family);
  font-size: var(--body-md-font-size);
  line-height: 1;
  cursor: pointer;
  pointer-events: auto;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}
.toast__action--weak {
  color: var(--text-tertiary);
  font-weight: var(--body-md-font-weight);
}
.toast__action--weak:active {
  background: rgba(255, 255, 255, 0.08);
}
.toast__action--strong {
  color: var(--palette-green-400);
  font-weight: var(--body-md-strong-font-weight);
}
.toast__action--strong:active {
  background: rgba(73, 193, 103, 0.16);
}
.toast__action__arrow {
  font-size: 16px;
  line-height: 1;
}

/* 浮层定位(宿主挂载时使用,preview 静态展示区关闭) */
.toast.is-floating {
  position: fixed;
  bottom: 106px;
  left: 50%;
  transform: translateX(-50%);
}

/* 进入动画 */
.toast.is-entering {
  animation: toast-enter var(--duration-normal) var(--ease-enter);
}
@keyframes toast-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.toast.is-floating.is-entering {
  animation: toast-floating-enter var(--duration-normal) var(--ease-enter);
}
@keyframes toast-floating-enter {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* 离开动画 */
.toast.is-leaving {
  animation: toast-leave var(--duration-xslow) var(--ease-exit) forwards;
}
@keyframes toast-leave {
  from { opacity: 1; }
  to { opacity: 0; }
}
/* @component-css-end */
```

**JS 交互脚本(在 preview 标记区外,演示用):**

- `showToast(options)` 函数:创建 toast DOM → 挂载到 demo 容器 → 添加 `is-entering` → duration 后添加 `is-leaving` → 动画结束移除
- `conflicting` 单例管理:维护 `currentToast` 引用,新 toast 出现时先关闭旧的
- 4 个触发按钮绑定不同 variant
- 演示"点击页面其他区域时隐藏"(document click listener)
- 演示"点击操作按钮后立即隐藏并 alert 回调"

### 3. 注册到组件索引

**文件**: `.codex/skills/wego-design/components/index.json`(编辑)

在 `components` 数组末尾追加:

```json
{
  "slug": "toast",
  "name": "提示",
  "category": "feedback",
  "status": "stable",
  "preview": "preview/component-toast.html"
}
```

### 4. 同步消费契约

**文件**: `.codex/skills/wego-design/library-consumption.json`(编辑)

在 `consumptionLayers.components.downstreamRule` 中追加 toast 特定规则:

- "toast 是瞬时反馈浮层,定位为 fixed bottom 106px,默认不阻断页面交互(pointer-events: none);引导型 toast 的操作按钮区域允许 pointer-events: auto"
- "同时只允许 1 个 conflicting=true 的 toast;新 toast 出现顶替旧 toast"
- "页面跳转、用户操作其他功能、点击引导型操作按钮时,宿主 App 应主动调用 hide() 关闭当前 toast"
- "引导型 toast 左侧图标仅允许使用 icon-goutoast / icon-chatoast / icon-tanhao / icon-shijian 4 种,不允许自定义图标"

### 5. 同步 UI Kit 计划

**文件**: `.codex/skills/wego-design/uikit-plan.json`(编辑)

- 在顶层 `allowedComponents` 数组追加 `"toast"`
- 在合适的 `screenBlueprints[].allowedComponents` 中追加 `"toast"`(主要用于操作反馈场景,如保存成功、删除失败)

### 6. 同步 README 与顶层 SKILL

**文件**: `.codex/skills/wego-design/README.md`(编辑)

- "稳定组件共 17 个" → "稳定组件共 18 个"
- 在组件清单末尾追加 `- \`toast\``
- 不新增 category 章节,toast 归入现有展示即可

**文件**: `.codex/skills/wego-design/SKILL.md`(按需编辑)

- 检查是否有需要追加 toast 边界说明的位置(通常仅在消费规则中提及,本轮不强制改)

### 7. 重生成聚合 CSS

**命令**: `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`

执行后扫描 `.codex/skills/wego-design/components.css`,确认包含 toast 标记区内容,且未带出无关组件 diff。

### 8. 递增 metadata 版本

**文件**: `.codex/skills/wego-design/metadata.json`(编辑)

- `version`: 315 → 316

### 9. 提交前完整性检查

**命令**: `node scripts/validate-wego-design.mjs`

验证 JSON 格式、Token 同步、组件三向对齐、components.css 完整性、UI Kit 成对、过期路径、禁止文件、metadata version。

---

## 假设与决策

### 假设

1. **Figma 视觉度量值优先于 Toast.md**:当两者冲突时,以 Figma 提取的实际数值为准(如距底部 106px vs Toast.md 的 72px + 安全区;采用 Figma 的 106px 作为已含安全区的总值)。
2. **WEAK 操作颜色映射**:Figma 使用 `#969AA0`,与 `--text-tertiary: var(--palette-neutral-700)` = `#9097a3` 接近但不完全一致;按设计系统惯例使用 `--text-tertiary` Token,差异在可接受范围。
3. **STRONG 操作颜色映射**:Figma 使用 `#49C167` = `--palette-green-400`,但 `--text-brand` 是 `--palette-green-500` = `#03c160`。本轮采用 `--palette-green-400` 直接消费(与 Figma 1:1),不新增语义 Token;若后续多个组件出现相同需求,再回流为 `--text-brand-soft` 类 Token。
4. **边框 0.5px rgba(255,255,255,0.4)**:Figma 新增的 toast 专用边框,Token 中无对应;本轮先在组件 CSS 内硬编码并记录到契约 `designTokens.borderWidth`,不强行新增 Token(避免单组件 Token 扩散)。
5. **DialogContainer 不单独注册**:定位、动画、conflicting、自动关闭等行为规则全部写入 toast 契约的 `behavior` 字段;由宿主 App `wego-app/js/app.js` 承载具体 JS 实现。本轮发布的 toast 是纯视觉组件 + 行为契约,JS 实现不在组件 preview 中正式发布(仅 preview 内演示用)。
6. **图标资产**:引导型 toast 的左侧图标限定为 iconfont 中的 `icon-goutoast` / `icon-chatoast` / `icon-tanhao` / `icon-shijian` 4 种,不允许使用其他图标,不允许自定义图标 SVG。已通过 Grep 验证 4 个图标在 `iconfont.css` 中均存在(line 630 / 634 / 1650 / 1502)。
7. **preview 演示 JS 不进入 components.css**:仅组件核心样式(标记区内)被提取,JS 交互脚本写在标记区外。

### 决策

| 决策点 | 选择 | 理由 |
|---|---|---|
| 组件范围 | 2 个变体:默认 + 引导型 | 用户明确要求,简化结构 |
| 引导型结构 | 文案必选 + 图标可选(4 种) + 操作可选(WEAK/STRONG) | 用户确认 |
| 图标限定 | icon-goutoast / icon-chatoast / icon-tanhao / icon-shijian | 用户明确限定 |
| DialogContainer | 不单独注册 | 范围控制,行为写入 toast 契约 |
| preview 交互 | 静态展示 + JS 交互演示 | 参考 switch preview 模式 |
| 互斥策略 | 默认全部 conflicting=true | 与 Toast.md 一致 |
| 主动隐藏场景 | 页面跳转 + 操作其他功能 + 点击引导按钮 | 用户明确要求 |
| WEAK 颜色 | 用 `--text-tertiary` | 设计系统 Token 优先 |
| STRONG 颜色 | 用 `--palette-green-400` | 与 Figma 1:1 |
| 边框 | 硬编码 rgba(255,255,255,0.4) | 单组件不扩散 Token |
| 底部位置 | bottom: 106px | Figma 案例值,含安全区 |
| 文字对齐 | 默认 toast 居中 / 引导型左对齐 | 与 Figma 一致,引导型需为操作按钮让位 |

---

## 验证步骤

### 静态扫描

1. Grep 搜索 `.toast` class 在仓库中的引用,确认 preview/component-toast.html 与 components/toast.json 引用一致
2. Grep 搜索旧版临时 toast class(`.toast { position:fixed; bottom:40px; ...}` from switch preview),评估是否需要收口(本轮不强制清理,记录到剩余风险)
3. 扫描 components.css 是否包含 toast 标记区内容
4. 扫描 components/index.json 是否包含 toast 条目
5. 验证 4 个限定图标在 `iconfont.css` 中存在(已通过 Grep 验证)

### 脚本校验

1. `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design` 成功执行
2. `node -e "JSON.parse(require('fs').readFileSync('.codex/skills/wego-design/components/toast.json','utf8'))"` 通过
3. `node scripts/validate-wego-design.mjs` 全部通过(无报错)

### 资源与结构检查

1. `metadata.json` version = 316
2. `components/index.json` 数量从 17 → 18
3. `library-consumption.json` 中 toast 规则已追加
4. `uikit-plan.json` allowedComponents 包含 toast
5. `README.md` 组件数量 17 → 18,清单含 toast
6. `components.css` 包含 toast 标记区内容,且无其他组件 diff

### 风险说明

1. **未做浏览器自动化验证**(按 wego-uxsystem-iterate 默认约束,不视为流程缺失)
2. **Toast.md 描述的 spring 弹性入场动画**未在 preview 中实现(改为标准 opacity + translateY 动画);理由:CSS spring 动画兼容性差,标准 ease-enter 已能满足移动端反馈体感;如后续真实 App 反馈需要更弹性的动画,再回流
3. **preview/component-switch.html 中的临时 `.toast` demo class** 与正式组件类名冲突;本轮不强制清理,记录到剩余风险,后续迭代收口
4. **0.5px 边框**在低 DPI 设备可能渲染为 0px;preview 中通过 `border-width: 0.5px` 配合 `-webkit-fit-content` 处理;如真实 App 需要可见边框,可考虑改为 `1px` + 调整透明度
5. **引导型 toast 288px 最小宽度**在窄屏(320px)可能接近边缘;preview 中通过 343px 案例宽度演示满宽形态,验证可读性
6. **STRONG 操作使用 `--palette-green-400` 而非 `--text-brand`**:与 Figma 1:1 但与设计系统"优先语义 Token"原则有微小偏差;记录到契约 `designTokens` 中以便后续回流
