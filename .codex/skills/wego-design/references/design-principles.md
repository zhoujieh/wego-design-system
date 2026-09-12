# 微购设计原则

> 本文只回答“什么是好设计”。业务事实由当前已提交的 `prototype_brief` 快照提供，执行方法、组件结构和验证规则分别由设计方法、Preview、组件契约和场景合同提供。

冲突时按以下顺序裁决：

**清晰 > 高效 > 一致 > 美观**

## 清晰

<!-- rule-id: wego-clarity-single-primary-task -->
**单一首要任务**：一页只突出一件最重要的事，次要信息降级、延后或按需出现。

<!-- rule-id: wego-clarity-state-visible -->
**状态和下一步可见**：用户无需回忆上一页，就能看懂当前内容、状态和下一步。

<!-- rule-id: wego-clarity-information-flow -->
**单线信息流**：信息按任务和语义分组，优先自上而下、从左到右阅读。

<!-- rule-id: wego-clarity-page-architecture-before-components -->
**结构先于组件**：先确定区域、滚动、固定关系和间距归属，再选择组件。

<!-- rule-id: wego-clarity-contextual-function -->
**功能就地出现**：入口贴近使用时刻和对象，不依赖额外教学。

<!-- rule-id: wego-clarity-delete-redundant -->
**删除冗余**：无法说明如何服务首要任务的元素、重复文案和显而易见提示应删除。

<!-- rule-id: wego-clarity-reversible-action-visible -->
**反向操作可发现**：返回、取消、关闭和停用应与风险相称地可见，不刻意隐藏。

## 高效

<!-- rule-id: wego-efficiency-primary-action-right -->
**主行动稳定可达**：提交、确认、发布等主行动位于持续可见、拇指易达的位置；模态主行动使用正式操作区。

<!-- rule-id: wego-efficiency-step-reduction -->
**减少步骤**：优先减少输入、等待和跳转，可靠默认值不要求用户重复确认。

<!-- rule-id: wego-efficiency-continuous-flow -->
**路径连续**：无法减少的每一步都应明确、连续且可即时纠错。

<!-- rule-id: wego-efficiency-non-blocking-prompt -->
**低风险不阻断**：只有继续操作不可用、不可逆或高风险时才使用阻断式确认。

<!-- rule-id: wego-efficiency-no-repeated-nudge -->
**不重复打扰**：同一提示不在多个位置反复出现，高频路径不增加无价值步骤。

<!-- rule-id: wego-efficiency-deep-link-and-back -->
**进入准确、返回有上下文**：深链直达目标，返回保留合理的滚动、筛选和选择状态。

<!-- rule-id: wego-efficiency-visible-feedback -->
**反馈即时可见**：操作开始、完成和失败都有真实、明确的反馈。

## 一致

<!-- rule-id: wego-consistency-same-pattern -->
**同类问题同一方案**：组件、结构、颜色、文案和交互保持一致。

<!-- rule-id: wego-consistency-wechat-ecosystem -->
**遵循微信生态习惯**：优先采用用户熟悉的返回、关闭、选择、反馈和手势模式。

<!-- rule-id: wego-consistency-information-grouping -->
**关系稳定**：同类信息放在一起，父子层级和入口关系全局一致。

<!-- rule-id: wego-consistency-reuse-component -->
**正式组件优先**：优先复用正式组件及稳定变体，新形式必须有明确、可验证的收益。

## 美观

<!-- rule-id: wego-aesthetics-minimal-professional -->
**简洁可信**：视觉专业、安全、有温度，美观不能覆盖可用性。

<!-- rule-id: wego-aesthetics-neutral-priority -->
**中性表面优先**：用留白、分组和层级建立秩序；品牌色强化主行动，状态色只表达状态。

<!-- rule-id: wego-aesthetics-432-check -->
**控制复杂度**：用“432”作为过度设计提醒，而非机械配额；低频需求不持续打扰多数用户。

<!-- rule-id: wego-aesthetics-data-expression -->
**数据服务理解**：数据用于说明规模、进度和结果，不作为装饰。

<!-- rule-id: wego-aesthetics-error-prevention -->
**错误可预防、可恢复**：先用约束降低错误，发生后保留明确恢复路径。

<!-- rule-id: wego-aesthetics-user-first -->
**用户问题优先**：不要求用户学习设计者的表达方式，不以风格牺牲任务完成。

<!-- rule-id: wego-content-role-typography -->
**层级服务内容**：对象名称和关键识别信息高于正文，提示和元数据弱化；具体 Token 以正式设计系统为准。
