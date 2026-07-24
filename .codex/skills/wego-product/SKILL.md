---
name: "wego-product"
description: 创建或变更业务迭代，确认原型范围并产出可被场景技能直接消费的 prototype_brief；不处理设计系统或场景实现。
---

# Wego Product

## 触发与职责边界

用于新页面、新场景、新流程或业务范围变化。负责业务目标、范围、入口、关键路径、原型边界、状态和数据，并按共享[设计决策原则](../shared/references/design-decisions.md)约束 `prototype_brief` 中的首要任务、信息层级和交互视觉描述；具体组件名、CSS 类、Token、动画名等正式规格仍由设计阶段在设计系统范围内决定。设计系统本体转交 `wego-uxsystem-iterate`；已经经过用户确认范围内的设计与实现转交 `wego-design`。

## 必要输入与运行时入口

读取用户原始需求、用户确认的结果、当前迭代和 `AGENTS.md`。创建或变更迭代时先读取共享[设计决策原则](../shared/references/design-decisions.md)，再读取[业务迭代契约](./references/iteration-workflow.md)；处理范围、确认话术与原型边界时读取[边界方法](./references/scope-and-boundaries.md)。只接受当前 Schema，旧输入直接失败。

## 输出契约与跨技能交接

必须先以 Markdown 的形式输出 `prototype_brief`，包含目标、范围、入口、关键路径、原型边界、状态、数据与场景目录语义。`open_questions` 清空且用户明确确认后才能交给 `wego-design`；已有场景业务需求范围变化时必须使当前原型范围失效并创建或更新迭代，不得静默修改已确认事实。
