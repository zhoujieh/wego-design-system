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

- 页面只保留一个首要任务；其余信息降级、延后或按需出现。
- 用户应当直接看懂当前内容、所处状态和下一步，不依赖说明或记忆上一页。
- 信息按任务和语义分组，优先采用自上而下、从左到右的单线流程。
- 功能应在正确场景和位置自然出现，首次接触即可理解用途，不依赖额外教学。
- 每个元素必须服务于页面目标；无法解释用途的元素、重复文案和显而易见的提示应删除。
- 取消、退出、关闭、停用等反向操作不能被刻意隐藏，应与风险相称地可发现。

### 高效

- 核心操作优先靠右侧显示，便于快速操作，禁止无脑从左往右依次排列。
- 优先减少步骤、输入、等待和跳转；能提供可靠默认值或自动选择时，不要求用户重复操作。
- 无法减少步骤时，每一步都必须明确、连续且不易出错。
- 除非继续操作会不可用或造成高风险，提示不得阻断当前流程，并应当可以快速关闭。
- 同一新功能提示不得在多个位置反复打扰；高频核心路径应比常见做法更直接，至少不能增加无价值步骤。
- 深链应到达准确位置；返回时保留合理上下文，不让用户重复寻找或选择。
- 响应速度和可见反馈属于核心体验；效率收益应具体、可感知，不夸大。

### 一致

- 同类问题使用相同的组件、结构、颜色、形状、文案和交互。
- 优先遵循微信生态中用户熟悉的习惯，避免只为不同而改变成熟模式。
- 相同信息放在一起，不混合不同类型和层级；父子功能关系在全局保持一致。
- 优先复用正式组件及其稳定变体；新形式必须证明收益能够覆盖学习和切换成本。

### 美观

- 视觉应简洁、专业、安全、可信并有人情味，美观不得牺牲前三项。
- 通过中性色表面、留白、分组和层级传递信息，不依赖多色、渐变、厚重阴影或装饰性动效。
- 用“432”检查过度设计：同页交互方式原则上不超过 4 种、内容样式不超过 3 类，不为约 20% 的低频需求持续打扰约 80% 的用户；它是克制性评审提示，业务确有必要时说明理由，不机械凑数。
- 数据表达应帮助用户理解规模、进度和结果，而不是装饰页面。首次引导和正向反馈用于确认进展、建立信心；复杂或令人不安的流程应在恰当时机提供帮助、解释和鼓励。
- 先预防错误；错误发生后降低损失并提供明确恢复路径。只有高风险或不可逆操作使用阻断式确认。
- 默认用户没有耐心学习、容易受情绪和损失影响；解决用户问题始终高于表达设计者风格。

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
