---
name: "wego-product"
description: 创建或变更业务迭代；形成并确认完整 prototype_brief，最终产出可被场景技能直接消费的已确认简报，不处理设计系统或场景实现。
---

# Wego Product

## 触发与职责边界

用于新页面、新场景、新流程或业务范围变化。负责业务目标、范围、入口、关键路径、原型边界、状态和数据；最小业务事实齐备并形成完整 `prototype_brief` 草案后，提交当前范围、展示文字摘要并取得用户明确确认。具体组件名、CSS 类、Token、动画名等正式规格仍由设计阶段在设计系统范围内决定。设计系统本体转交 `wego-uxsystem-iterate`；已经经过用户确认范围内的设计与实现转交 `wego-design`。

## 必要输入与运行时入口

读取用户原始需求、用户确认的结果、当前迭代和 `AGENTS.md`。创建或变更迭代时先读取共享[设计决策原则](../shared/references/design-decisions.md)，再读取[业务迭代契约](./references/iteration-workflow.md)；处理范围、确认话术与原型边界时读取[边界方法](./references/scope-and-boundaries.md)。只接受当前 Schema，旧输入直接失败。参考图、用户线框图和高保真 Figma 不作为产品阶段补造业务事实的来源；其中明确的业务要求必须写回 `prototype_brief` 后才能确认。

## 输出契约与跨技能交接

通过 `submit-brief` 写入当前范围提交快照，向用户展示包含目标、范围、入口、关键路径、原型边界、状态、数据和假设的文字摘要；`open_questions` 清空且用户明确确认后才能运行 `confirm-brief` 并交给 `wego-design`。用户反馈改变简报时先使当前提交失效，再写回现有简报字段并重新提交确认。已有场景业务需求范围变化时必须使当前原型范围失效并创建或更新迭代，不得静默修改已确认事实。
