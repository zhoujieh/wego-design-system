---
schemaVersion: 1
name: "Wego 场景设计决策方法"
description: "以微购设计系统为唯一事实来源的页面级设计决策合同。"
authoritySources:
  - "AGENTS.md#仓库定位"
  - "library-consumption.json"
  - "colors_and_type.css"
  - "uikit-plan.json"
  - "components/index.json"
  - "preview/component-{slug}.html"
  - "components/{slug}.json"
  - "references/scene-contract.md"
---

# 微购场景设计决策方法

> 角色：新建场景或修改既有场景前的页面级约束合同。本文只定义如何消费微购设计系统；Token 数值、组件 DOM、组件变体和页面范式仍以 `authoritySources` 所列权威源为准，不定义业务事实或修改设计系统源。

## Overview

<!-- rule-id: wego-scene-decision-scope; source-ref: AGENTS.md#仓库定位 -->

微购面向移动端、微信生态、电商、工具场景。页面应是简洁、干净、淡雅、克制的中文 App 界面，不做营销落地页、桌面后台或独立网页。最高判断优先级固定为：清晰 > 一致 > 效率 > 美观 > 创新。

<!-- rule-id: prototype-brief-required; source-ref: AGENTS.md#主链路硬门禁 -->

开始设计前必须先读取 `AGENTS.md`、已确认的 `prototype_brief` 与当前有效迭代，再读取本技能入口与本文。`prototype_brief` 必须明确场景目标、入口、关键路径、所需状态、业务数据和场景目录语义；缺少会影响页面结构或交互的信息时退回 `wego-product`，不得补造业务事实。

进入设计系统消费后，固定读取顺序为：`library-consumption.json`、`uikit-plan.json`、`components/index.json`、本页命中组件 Preview、同一组件契约、`colors_and_type.css`、`references/scene-contract.md`。`design-decisions.json` 不是设计前权威输入；新场景不得以它替代权威源，已有场景修改时也只可把它当作辅助对照。禁止以历史场景、已删除工作流、旧技能或废弃设计计划替代这些输入。

## Colors

<!-- rule-id: wego-semantic-color-consumption; source-ref: colors_and_type.css -->

微购以中性色表面承载内容，品牌绿色承担主行动与品牌强调；状态色只表达成功、警告、危险、信息或促销状态。页面使用语义 Token，不根据颜色外观猜变量名，也不直接写颜色值。

- 页面和内容区域优先使用 `--bg-page`、`--bg-surface`、`--bg-panel`、`--bg-subtle` 等中性语义。
- 文本、图标和边框分别使用对应的 `--text-*`、`--icon-*`、`--border-*` Token。
- `--status-*-surface-l*` 与促销状态色只能用于提示、标签和局部反馈，不得大面积铺底。
- 禁止大面积彩色或渐变背景、玻璃拟态和与微购中性基调冲突的强装饰效果。

## Asset Semantics

<!-- rule-id: no-large-color-background-app-center-svg-priority; source-ref: library-consumption.json -->

页面中的视觉资产必须区分为三类，禁止跨语义代用：

- 身份资产：用户头像、店铺头像、品牌头像、作者头像。
- 应用资产：应用入口图标优先使用 `assets/icons/app-center/` 中与业务语义匹配的 SVG。
- 内容资产：商品图、封面图、场景图、内容缩略图、媒体图。
- 功能资产：必须使用 `iconfont.css` 中已查证的图标名；都不适用时选择最近似已交付资产或文字，不得猜测 icon class。

硬规则：
- 不得用身份组件承载功能入口图标。
- 不得用功能图标冒充商品图、店铺头像、品牌图或内容缩略图。
- 不得用商品图承载功能入口语义。
- 产品、商品、内容、动态卡片图片只能使用 `assets/image/clothing/` 中的图片，根据图片生成对应的文案。

## Typography

<!-- rule-id: wego-content-role-typography; source-ref: colors_and_type.css -->

识别性信息、标题和关键对象名称使用语义 `heading` Token；正文、字段值和主要说明使用 `body` Token；时间、提示和低优先级元数据使用较小语义 Token。单个页面只保留一个明确的页面级 semibold 焦点。

<!-- rule-id: design-decisions-css-token-binding-precision; source-ref: colors_and_type.css -->

每个需要设置字体、字重、行高或颜色的业务元素，必须在 `prompt_contract.token_bindings` 中记录实际 CSS 选择器、CSS 属性、实际 Token 和规则来源。实现阶段只翻译已记录绑定，不重新猜测视觉规格。

```yaml
token_bindings:
  - selector: ".member-card__name"
    content_role: "会员名称"
    css_property: "font-size"
    token: "var(--heading-xs-font-size)"
    rule_ref: "colors_and_type.css#/heading-xs-font-size"
```

`token_whitelist` 只能使用本页命中组件的 `runtimeTokens`、`library-consumption.json.sceneTokenPolicy` 声明的基础 Token 和 `colors_and_type.css` 中实际声明的变量。组件 `localTokens`、其他组件 Token、原始 palette 与状态色都不得由场景直接绑定或猜测；`css.json` 只帮助理解 Token 关系，不能推导变量名。

## Layout

<!-- rule-id: wego-page-pattern-layout-contract; source-ref: uikit-plan.json -->

先按业务交互模式、surface 角色和状态匹配 `pagePatterns`；只有适用条件明确命中时才使用页面范式。未命中时进入 `composed` 模式：根据已确认业务任务、信息层级、状态和正式组件能力自主组合页面，不得伪造“通用页”或其他未登记范式。UI Kit 只用于理解已验证范式的页面结构和组件组合，不得复制其宿主、手机外壳、演示文案或私有 class。

`layout_contract` 必须记录 `mode`、来源、选择理由、页面边距模式及理由、当前场景可执行的布局规则和状态变化允许修改的区域。`pattern` 模式只引用命中的正式范式；`composed` 模式引用本文的 Layout 规则，并先形成实际 3–6 个组件的选择计划，再逐个读取 Preview 与契约。连续列表和表单优先使用 `.cell-group`、`.form-group` 的正式标题和内容结构；场景 CSS 只处理业务区域关系和纵向节奏，所有间距使用 `--spacer-*` Token。

页面边距只能选择 `M0`、`M8` 或 `M32`：`M0` 为默认通栏白底，横向内容边距由正式组件承担；`M8` 用于灰底上的卡片分组，必须同时保留对应外层留白；`M32` 仅用于明确需要大留白的沉浸式展示。不得发明中间边距、灰底贴边卡片或在同页混用模式而不记录理由。具体宿主 class 与尺寸以实际 CSS 和组件 Preview 为准。

```yaml
layout_contract:
  mode: "pattern"
  source: "uikit-plan.json#/pagePatterns/system-settings"
  selection_reason: "以带箭头的层级入口为主，且没有页面级保存"
  page_edge_mode: "M0"
  page_edge_mode_reason: "连续 cell 分组由组件自身承担横向内边距"
  rules: ["连续列表使用正式 group 结构"]
  mutable_regions: [".scene-content"]
```
## Scroll & Sticky

页面必须先定义滚动分层，再开始组件组合。

默认规则：
- 连续内容流页面同一时刻只允许一个主要 sticky 层，sticky 区域禁止过高。
- 页面主 tabs、一级分类切换可作为主要 sticky 层；搜索栏和筛选条只有在确属高频收窄条件时才设置 sticky。
- 滚动层必须设置 overflow：hidden, 避免出现内容重叠的情况。

## Elevation & Depth

<!-- rule-id: wego-tonal-hierarchy; source-ref: colors_and_type.css -->

微购通过中性色表面、边框、分组和信息层级建立深度，不依赖厚重阴影、叠层卡片或视觉特效。连续内容保持连贯列表或表单节奏，不额外包裹只为白底、圆角或阴影存在的容器。卡片、弹层、遮罩和固定操作区必须消费正式组件或页面范式。

## Shapes

<!-- rule-id: wego-component-owned-shapes; source-ref: components/index.json -->

圆角、控件高度、边框形态和组件内部留白由已登记组件决定。业务 class 只能承担区域布局与业务胶水，不得重做按钮、标签、角标、头像、列表行、输入框或卡片的圆角、背景、字号和字重。badge 必须相对于设有 `position: relative` 的语义宿主定位。

## Components

<!-- rule-id: preview-first-component-consumption; source-ref: library-consumption.json -->

组件消费必须 Preview-first：Preview 决定实际 DOM、class、Token、间距和状态，契约决定语义、变体、行为和边界。每页选择实际需要的 3–6 个组件，记录选择原因、Preview、契约、根 class、可用 Token 和范式来源；`composed` 模式也遵循这一限制，不得扫描全量组件后拼凑页面。

```yaml
component_bindings:
  - slot: "settings-row"
    slug: "cell"
    reason: "承载设置项的标题、状态与进入下一层操作"
    root_class: "cell cell--single"
    required_structure: [".cell__body", ".cell__content"]
    modifiers: ["cell--clickable"]
    variant_dimensions: { density: "single", interaction: "clickable", trailingSlot: "arrow" }
    source: "preview/component-cell.html"
    contract_file: "components/cell.json"
```

<!-- rule-id: prompt-contract-current-schema; source-ref: references/scene-contract.md -->

### 当前标准 `prompt_contract`

以下是场景 `scene.js` 中 `wego-design-contract` 必须采用的完整当前格式。先以本页实际输入替换示例，再实现页面；不得只摘取其中的 Token、布局或组件片段。提取器与场景守卫会校验该结构、输入来源和实际 DOM 的对应关系。

```yaml
prompt_contract:
  design_system_snapshot:
    version: "{metadata.version}"
    token_css: "colors_and_type.css"
    component_css: "components.css"
    component_inputs:
      - slug: "cell"
        preview_file: "preview/component-cell.html"
        contract_file: "components/cell.json"
  token_whitelist:
    - "var(--text-default)"
  token_bindings:
    - selector: ".settings-row__title"
      content_role: "设置项标题"
      css_property: "font-size"
      token: "var(--heading-xs-font-size)"
      rule_ref: "colors_and_type.css#/heading-xs-font-size"
  component_bindings:
    - slot: "settings-row"
      slug: "cell"
      reason: "承载设置项的标题、状态与进入下一层操作"
      root_class: "cell cell--single"
      required_structure: [".cell__body", ".cell__content"]
      modifiers: ["cell--clickable"]
      variant_dimensions: { density: "single", interaction: "clickable", trailingSlot: "arrow" }
      source: "preview/component-cell.html"
      contract_file: "components/cell.json"
  layout_contract:
    mode: "pattern"
    source: "uikit-plan.json#/pagePatterns/system-settings"
    selection_reason: "以带箭头的层级入口为主，且没有页面级保存"
    page_edge_mode: "M0"
    page_edge_mode_reason: "连续 cell 分组由组件自身承担横向内边距"
    rules: ["连续列表使用正式 group 结构"]
    mutable_regions: [".scene-content"]
  interaction_contract:
    - dom_id: "open-settings-detail"
      target: "route:settings-detail"
  state_contract:
    - state_id: "initial"
      initial: true
      trigger: "场景进入"
      visible_result: "展示当前设置值"
      fallback: "保留最近一次有效状态"
      persistence: "memory"
  hard_rules:
    - "禁止硬编码颜色和间距"
    - "禁止使用 token_whitelist 之外的 Token"
```

`component_inputs` 与 `component_bindings` 按 `slug` 一一对应，且 Preview、契约路径必须与组件索引一致。`component_bindings.reason` 记录为何选择此组件；`variant_dimensions` 记录本页实际使用的变体值。`state_contract` 无可见状态变化时可为空数组；一旦声明状态，每项都必须具备 `state_id`、`initial`、`trigger`、`visible_result`、`fallback` 和 `persistence`。

<!-- rule-id: component-visual-usage-consume-registered; source-ref: components/index.json -->

视觉用途命中已注册组件时必须直接消费正式组件：标签用 `tag`、角标用 `badge`、操作按钮用 `button`、列表行用 `cell`、头像用 `avatar`、文本操作用 `link`。稳定变体优先；仅在 `domAnatomy` 允许范围内才可 `free-composition`；没有正式能力时创建 DDR 并选择最近似结构完成当前原型。

<!-- rule-id: metric-structured-number-rendering; source-ref: components/metric.json -->

金额和统计数据使用 `metric` 展示时，必须先拆成结构化字段再渲染：`.metric__integer` 始终承载整数部分；有小数时 `.metric__decimal` 独立承载小数点和小数位；货币符号、单位、前缀和区间两端分别使用正式节点。纯整数不创建空小数节点。订单号、手机号、日期、验证码和可编辑输入值不适用本规则。

禁止自造完整组件、猜 Token、猜 iconfont 名称、复制 UI Kit 外壳，或用业务 class 覆盖组件内部样式。

## Do's and Don'ts

<!-- rule-id: wego-scene-hard-rules; source-ref: library-consumption.json -->

应当使用已确认简报、页面范式、正式组件、实际 Token 和真实业务状态；独立控件承担自身交互，只有进入下一层、跳转或展开的行才整行可点击。

不得硬编码颜色或间距；不得复制 Preview/UI Kit 宿主和演示业务内容；不得覆盖组件内部 Token、尺寸、安全区或交互状态；不得用大面积状态色、渐变、额外白底壳和重复 section 标题制造层级；不得用 DDR 掩盖实现错误。

## State & Interaction

<!-- rule-id: wego-state-interaction-contract; source-ref: references/scene-contract.md -->

每个可见变化都必须进入 `state_contract`，写清初始值、触发器、可见结果、加载/空/错误状态、回退动作和持久化策略。选择 presentation 时同时记录 `type`、`transition`、`dismissAction`、`overlayLevel` 和 `coversTabBar`。

新场景必须明确入口和目标 `route_id`；已有场景复用既有 route。右侧为 switch、radio、checkbox 或 button 等独立控件时由控件自身处理事件；带箭头、进入下一层、跳转或展开选择面板的行才可整行点击。状态只写当前 `ctx.state` 或明确的共享 `ctx.appState` 键，不得直接写入其他场景 state。动态数据、保存、取消、删除和回填必须体现真实路径；只有需求明确要求时才持久化。

## Exceptions & DDR

<!-- rule-id: wego-ddr-boundary; source-ref: AGENTS.md#主链路硬门禁 -->

DDR 只记录正式设计系统无法覆盖的 pattern、variant、参数、组件或 presentation 能力缺口，状态只能为 `open → extended → resolved | wontfix | escalated`，其中 `extended` 最多两次。未命中页面范式本身不是 DDR，必须先按 `composed` 模式完成页面；`resolved` 必须回流组件契约、Preview、聚合 CSS、索引、UI Kit、守卫和受影响场景。

错误 Token、错误 class、未读 Preview、缺少路由、未实现状态或交互失败必须直接修复，不得登记为 DDR。

## Legacy Traceability

| 遗留内容 | 保留后的规则位置 |
| --- | --- |
| 输入与失败条件 | Overview |
| Preview-first 选择过程 | Components、Shapes |
| `prompt_contract` | Typography、Layout、Components、State & Interaction |
| 页面、状态与交互 | State & Interaction |
| 视觉约束 | Colors、Typography、Layout、Elevation & Depth、Shapes |
| DDR | Exceptions & DDR |
| CSS 选择器到 Token 绑定 | Typography / `design-decisions-css-token-binding-precision` |
| 正式组件视觉用途优先 | Components / `component-visual-usage-consume-registered` |
| 禁止大面积彩色背景与 SVG 优先 | Colors / `no-large-color-background-app-center-svg-priority` |
