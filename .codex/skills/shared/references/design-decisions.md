---
schemaVersion: 2
name: "微购设计决策原则"
description: "微购产品范围确认与业务场景设计必须共用的顶层原则和页面裁决方法。"
principleAuthority:
  title: "微购设计决策原则"
  status: "user-confirmed"
  priority: ["clarity", "efficiency", "consistency", "aesthetics"]
authoritySources:
  - "../../wego-product/references/iteration-workflow.md"
  - "../../wego-product/references/scope-and-boundaries.md"
  - "../../wego-uxsystem-iterate/references/workflow.md"
  - "../../wego-design/library-consumption.json"
  - "../../wego-design/colors_and_type.css"
  - "../../wego-design/uikit-plan.json"
  - "../../wego-design/components/index.json"
  - "../../wego-design/preview/component-{slug}.html"
  - "../../wego-design/components/{slug}.json"
  - "../../wego-design/references/scene-contract.md"
---

# 微购设计决策原则

> 角色：`wego-product` 创建或变更 `prototype_brief`、`wego-design` 设计或修改业务场景前共同读取的顶层决策原则。本文决定“如何判断”；业务事实来自用户需求和已确认 `prototype_brief`，精确实现来自 Preview、组件契约和 Token 源。

## 顶层原则

微购用户自主使用、自主付费、自主传播，首要设计目标是便捷实用。发生冲突时必须按以下顺序裁决：

**清晰 > 高效 > 一致 > 美观**

不得用创新、个性或视觉表现覆盖这四项原则。

### 清晰

<!-- rule-id: wego-clarity-single-primary-task; source-ref: design-decisions.md -->

- **页面只保留一个首要任务**：其余信息降级、延后或按需出现。参照微信首页——聊天列表是唯一焦点，其他功能入口降级到角落。
  - **Do**：一页一个主任务，次要功能折叠或下沉
  - **Don't**：同页并列两个同等强制的主动作、把次要功能提升到与主任务同等视觉权重

<!-- rule-id: wego-clarity-state-visible; source-ref: design-decisions.md -->

- **用户应当直接看懂当前内容、所处状态和下一步**，不依赖说明或记忆上一页。参照微信支付的支付结果页——成功/失败状态一眼可辨，下一步动作明确。
  - **Do**：状态用颜色+图标+文字三重表达、下一步操作显性呈现
  - **Don't**：状态只靠文字描述、用户需要回忆上文才能理解当前页

<!-- rule-id: wego-clarity-information-flow; source-ref: design-decisions.md -->

- **信息按任务和语义分组，优先采用自上而下、从左到右的单线流程**。
  - **Do**：同类信息聚合成块、块与块之间留白分隔
  - **Don't**：不同类型信息交叉排列、打破单线阅读顺序的跳跃式布局

<!-- rule-id: wego-clarity-contextual-function; source-ref: design-decisions.md -->

- **功能应在正确场景和位置自然出现**，首次接触即可理解用途，不依赖额外教学。参照微信长按消息出现的操作菜单——功能在需要时出现，不需要时不打扰。
  - **Do**：功能入口贴近触发场景、用图标+文字说明用途
  - **Don't**：把功能藏在非直觉位置、用 tutorial 引导用户找功能

<!-- rule-id: wego-clarity-delete-redundant; source-ref: design-decisions.md -->

- **每个元素必须服务于页面目标**；无法解释用途的元素、重复文案和显而易见的提示应删除。
  - **Do**：每加一个元素先问"它解决什么问题"、能删则删
  - **Don't**：保留"以防万一"的元素、重复显而易见的信息、加装饰性提示

<!-- rule-id: wego-clarity-reversible-action-visible; source-ref: design-decisions.md -->

- **取消、退出、关闭、停用等反向操作不能被刻意隐藏**，应与风险相称地可发现。参照微信聊天页的返回按钮——始终可见、位置固定。
  - **Do**：返回/取消在左上角固定位置、高风险操作才用二次确认
  - **Don't**：把退出操作藏在菜单深处、对低风险操作强制二次确认

### 高效

<!-- rule-id: wego-efficiency-primary-action-right; source-ref: design-decisions.md -->

- **核心操作优先靠右侧显示**：核心操作（结算、提交、确认、发布等推动流程的主动作）必须放在底部固定区域右侧或模态框 `modal__actions` 固定区域；禁止嵌入可滚动内容末尾。参照微信支付的结算按钮——底部固定、始终可见、拇指可及。
  - **Do**：底部操作栏主按钮在 trailing 区、模态框 CTA 在 `modal__actions`、单按钮 width:100% 占满
  - **Don't**：核心 CTA 放在可滚动列表末尾、操作栏主按钮靠左、CTA 嵌入内容流

<!-- rule-id: wego-efficiency-step-reduction; source-ref: design-decisions.md -->

- **优先减少步骤、输入、等待和跳转**；能提供可靠默认值或自动选择时，不要求用户重复操作。参照微信支付的默认支付方式——系统记住上次选择，不每次都问。
  - **Do**：提供合理默认值、自动选择唯一选项、合并连续步骤
  - **Don't**：让用户重复输入已提供的信息、对唯一选项强制选择、人为拆分可合并的步骤

<!-- rule-id: wego-efficiency-continuous-flow; source-ref: design-decisions.md -->

- **无法减少步骤时，每一步都必须明确、连续且不易出错**。
  - **Do**：步骤之间有明确进度指示、当前步聚焦、错误可即时修正
  - **Don't**：步骤之间上下文断裂、用户不知道还剩几步

<!-- rule-id: wego-efficiency-non-blocking-prompt; source-ref: design-decisions.md -->

- **除非继续操作会不可用或造成高风险，提示不得阻断当前流程**，并应当可以快速关闭。
  - **Do**：非阻断提示用 toast/banner、可快速关闭、不打断操作
  - **Don't**：低风险提示用模态弹窗阻断、提示无法关闭

<!-- rule-id: wego-efficiency-no-repeated-nudge; source-ref: design-decisions.md -->

- **同一新功能提示不得在多个位置反复打扰**；高频核心路径应比常见做法更直接，至少不能增加无价值步骤。
  - **Do**：同一提示全局只出现一次、高频路径走最短路线
  - **Don't**：同一提示在多个页面重复出现、为了引导新功能给核心路径加步骤

<!-- rule-id: wego-efficiency-deep-link-and-back; source-ref: design-decisions.md -->

- **深链应到达准确位置**；返回时保留合理上下文，不让用户重复寻找或选择。
  - **Do**：深链直达目标内容、返回保留滚动位置和筛选状态
  - **Don't**：深链跳到首页让用户自己找、返回后丢失上下文

<!-- rule-id: wego-efficiency-visible-feedback; source-ref: design-decisions.md -->

- **响应速度和可见反馈属于核心体验**；效率收益应具体、可感知，不夸大。
  - **Do**：操作立即有 loading 反馈、完成有明确提示、loading 时间合理
  - **Don't**：操作后无反馈让用户猜测、用虚假 loading 掩盖慢响应

### 一致

<!-- rule-id: wego-consistency-same-pattern; source-ref: design-decisions.md -->

- **同类问题使用相同的组件、结构、颜色、形状、文案和交互**。
  - **Do**：列表用同一组件、同类操作用同一按钮样式、同类状态用同一颜色
  - **Don't**：同类场景用不同组件、相同操作用不同文案

<!-- rule-id: wego-consistency-wechat-ecosystem; source-ref: design-decisions.md -->

- **优先遵循微信生态中用户熟悉的习惯**，避免只为不同而改变成熟模式。参照微信小程序通用交互——左滑删除、长按菜单、下拉刷新。
  - **Do**：沿用微信成熟交互模式、用用户已习惯的图标含义
  - **Don't**：为创新而改变成熟交互、用反直觉的图标

<!-- rule-id: wego-consistency-information-grouping; source-ref: design-decisions.md -->

- **相同信息放在一起，不混合不同类型和层级**；父子功能关系在全局保持一致。
  - **Do**：同类信息成组、父功能入口在所有页面位置一致
  - **Don't**：把不同层级的信息平铺、同一功能在不同页面入口位置不同

<!-- rule-id: wego-consistency-reuse-component; source-ref: design-decisions.md -->

- **优先复用正式组件及其稳定变体**；新形式必须证明收益能够覆盖学习和切换成本。
  - **Do**：先用正式组件、变体不够时记录缺口、新形式有充分理由
  - **Don't**：为小差异自造组件、未经证明就引入新交互形式

### 美观

<!-- rule-id: wego-aesthetics-minimal-professional; source-ref: design-decisions.md -->

- **视觉应简洁、专业、安全、可信并有人情味**，美观不得牺牲前三项。
  - **Do**：用留白和分组传递层次、视觉克制有焦点
  - **Don't**：为美观牺牲清晰度、为个性牺牲一致性

<!-- rule-id: wego-aesthetics-neutral-priority; source-ref: design-decisions.md -->

- **通过中性色表面、留白、分组和层级传递信息**，不依赖多色、渐变、厚重阴影或装饰性动效。参照微信钱包——大量留白+中性色背景+少量品牌色点缀。
  - **Do**：中性色承载主要内容、品牌色只用于主动作、用留白分组
  - **Don't**：大面积彩色背景、厚重阴影、装饰性渐变

<!-- rule-id: wego-aesthetics-432-check; source-ref: design-decisions.md -->

- **用"432"检查过度设计**：同页交互方式原则上不超过 4 种、内容样式不超过 3 类，不为约 20% 的低频需求持续打扰约 80% 的用户；它是克制性评审提示，业务确有必要时说明理由，不机械凑数。
  - **Do**：超出 432 时说明业务理由、低频需求按需出现
  - **Don't**：同页堆砌 5+ 种交互方式、为低频需求牺牲主流路径

<!-- rule-id: wego-aesthetics-data-expression; source-ref: design-decisions.md -->

- **数据表达应帮助用户理解规模、进度和结果**，而不是装饰页面。首次引导和正向反馈用于确认进展、建立信心；复杂或令人不安的流程应在恰当时机提供帮助、解释和鼓励。
  - **Do**：数据服务于理解、进度有明确反馈
  - **Don't**：用数据装饰页面、复杂数据无解释

<!-- rule-id: wego-aesthetics-error-prevention; source-ref: design-decisions.md -->

- **先预防错误**；错误发生后降低损失并提供明确恢复路径。只有高风险或不可逆操作使用阻断式确认。
  - **Do**：用输入约束预防错误、错误有明确恢复路径、高风险才阻断
  - **Don't**：对低风险操作强制阻断确认、错误后无恢复路径

<!-- rule-id: wego-aesthetics-user-first; source-ref: design-decisions.md -->

- **默认用户没有耐心学习、容易受情绪和损失影响**；解决用户问题始终高于表达设计者风格。
  - **Do**：以用户视角验证设计、优先解决核心问题
  - **Don't**：为表达设计风格牺牲易用性、要求用户学习新交互

## 输入与页面裁决

<!-- rule-id: wego-scene-decision-scope; source-ref: ../../wego-product/references/iteration-workflow.md -->

`wego-product` 必须先用本文约束 `prototype_brief` 的首要任务、入口、关键路径、状态、信息层级和交互视觉描述，避免把低效、混乱或违反设计系统的方向交给设计阶段。

`wego-design` 只依据有效迭代和已确认 `prototype_brief` 中的目标、范围、入口、关键路径、状态、数据、原型边界以及产品阶段定义的交互视觉描述进行设计。`wego-design` 必须严格遵循产品阶段的交互视觉描述（布局位置、控件类型、视觉强调、打开方式倾向等），不得自行替换或偏离；唯一例外是组件不支持或设计系统规范不允许，此时设计系统优先，冲突项记录到场景决策证据并退回 `wego-product` 重新确认。缺少会改变页面结构或结果的业务事实时退回 `wego-product`，不得从组件、UI Kit、历史场景或图片补造事实和文案。

`design-decisions.json` 不是设计前权威输入；新场景不得以它代替本文和正式设计系统来源，已有场景修改时也只能辅助对照。

<!-- rule-id: wego-page-pattern-layout-contract; source-ref: ../../wego-design/uikit-plan.json -->

先按业务任务、surface 角色和状态匹配明确 `pagePatterns`。命中时使用对应范式；未命中时采用 `composed`，按首要任务、信息层级、状态和正式组件能力自主组合，不伪造页面范式，也不复制 UI Kit 宿主、演示文案或私有 class。

页面边距、presentation 和布局合同的具体可选值由设计消费源与场景合同决定；本文只裁决是否需要通栏、卡片化或沉浸式表达，不为视觉变化发明中间层级。

## 视觉与资产

<!-- rule-id: wego-content-role-typography; source-ref: ../../wego-design/colors_and_type.css -->

对象名称、标题和关键识别信息应高于正文与字段值；时间、提示和低优先级元数据应弱化。页面只保留一个明确的视觉焦点，具体 Token、字号、字重、行高、间距、圆角和资产路径以设计系统实际消费源为准。

中性色应承载主要内容，品牌色承担主行动，状态色只表达对应状态。禁止用大面积彩色、渐变背景或装饰性图标底板抢夺页面主任务。

## 组件消费

页面应优先复用正式设计系统能力。组件选择先服从业务任务和信息层级，再由设计消费源决定 Preview-first 顺序、合法变体、DOM、class、Token 和资产用法。组件、变体或 presentation 确实无法覆盖时，不在场景内自造替代组件。

## 状态与交互

<!-- rule-id: wego-state-interaction-contract; source-ref: ../../wego-design/references/scene-contract.md -->

只实现已确认简报要求、关键路径真实需要或操作必然产生的可见状态，不为了填合同补造加载、空、错误或持久化。每个实际状态写清初始条件、触发方式、可见结果、失败回退和持久化边界。

独立控件承担自身事件；只有进入下一层、跳转或展开的行才整行可点击。状态只写当前场景或明确共享键，不直接改写其他场景状态。保存、取消、删除、返回和回填必须形成连续、可见且可恢复的路径。

## 设计系统缺口

<!-- rule-id: wego-design-system-gap-boundary; source-ref: ../../wego-uxsystem-iterate/references/workflow.md -->

错误 Token、错误 class、未读 Preview、缺少路由、遗漏状态或交互失败都属于实现错误，必须直接修复。

只有正式组件、变体、参数、页面范式或 presentation 能力确实无法覆盖时，才向 `wego-uxsystem-iterate` 交接设计系统缺口。交接只需说明缺失能力、受影响 surface、是否阻断和可用正式回退；未命中页面范式本身不是缺口，应先使用 `composed` 完成设计。

## 原则应用对照

> 角色：顶层原则 Do/Don't 速查索引，供设计阶段快速对照；具体原则正文以四个小节为准。

| rule_id | 原则 | Do | Don't |
|---------|------|-----|-------|
| wego-clarity-single-primary-task | 页面只保留一个首要任务 | 一页一个主任务，次要功能折叠或下沉 | 同页并列两个同等强制的主动作 |
| wego-clarity-state-visible | 状态和下一步直接可懂 | 状态用颜色+图标+文字三重表达 | 状态只靠文字、需回忆上文 |
| wego-clarity-information-flow | 信息按语义单线分组 | 同类信息聚合成块、留白分隔 | 不同类型信息交叉排列 |
| wego-clarity-contextual-function | 功能在正确场景自然出现 | 功能入口贴近触发场景 | 功能藏在非直觉位置、用 tutorial 引导 |
| wego-clarity-delete-redundant | 删除无用元素 | 每加元素先问"解决什么问题" | 保留"以防万一"的元素 |
| wego-clarity-reversible-action-visible | 反向操作可发现 | 返回/取消在左上角固定位置 | 退出操作藏在菜单深处 |
| wego-efficiency-primary-action-right | 核心操作靠右侧/底部固定 | 主按钮在 trailing 区、CTA 在 modal__actions | CTA 放可滚动列表末尾、主按钮靠左 |
| wego-efficiency-step-reduction | 优先减少步骤 | 提供默认值、自动选择唯一选项 | 重复输入、对唯一选项强制选择 |
| wego-efficiency-continuous-flow | 步骤明确连续 | 步骤间有进度指示、错误可即时修正 | 步骤上下文断裂 |
| wego-efficiency-non-blocking-prompt | 提示不阻断流程 | 非阻断用 toast/banner、可快速关闭 | 低风险提示用模态弹窗阻断 |
| wego-efficiency-no-repeated-nudge | 不反复打扰 | 同一提示全局只出现一次 | 同一提示在多个页面重复 |
| wego-efficiency-deep-link-and-back | 深链准确、返回保留上下文 | 深链直达目标、返回保留滚动位置 | 深链跳首页、返回丢失上下文 |
| wego-efficiency-visible-feedback | 操作有可见反馈 | 操作立即 loading、完成明确提示 | 操作后无反馈、虚假 loading |
| wego-consistency-same-pattern | 同类问题用相同方案 | 列表用同一组件、同类操作同一样式 | 同类场景用不同组件 |
| wego-consistency-wechat-ecosystem | 遵循微信生态习惯 | 沿用微信成熟交互模式 | 为创新改变成熟交互 |
| wego-consistency-information-grouping | 相同信息放一起 | 同类信息成组、父功能入口位置一致 | 不同层级信息平铺 |
| wego-consistency-reuse-component | 优先复用正式组件 | 先用正式组件、变体不够记缺口 | 为小差异自造组件 |
| wego-aesthetics-minimal-professional | 简洁专业有人情味 | 用留白和分组传递层次 | 为美观牺牲清晰度 |
| wego-aesthetics-neutral-priority | 中性色为主 | 中性色承载内容、品牌色只用于主动作 | 大面积彩色背景、厚重阴影 |
| wego-aesthetics-432-check | 432 检查过度设计 | 超出 432 时说明业务理由 | 同页堆砌 5+ 种交互方式 |
| wego-aesthetics-data-expression | 数据帮助理解 | 数据服务于理解、进度有反馈 | 用数据装饰页面 |
| wego-aesthetics-error-prevention | 先预防错误 | 用输入约束预防、错误有恢复路径 | 对低风险操作强制阻断 |
| wego-aesthetics-user-first | 用户问题高于设计风格 | 以用户视角验证设计 | 为设计风格牺牲易用性 |
