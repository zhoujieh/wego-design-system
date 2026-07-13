---
name: "wego-product"
description: 创建或变更业务迭代，确认原型范围并产出可被场景技能直接消费的 prototype_brief；不处理设计系统或场景实现。
---

# Wego Product

## 触发与职责边界

用于新页面、新场景、新流程或业务范围变化。只负责业务目标、范围、状态、入口和关键路径，不决定组件、布局、打开方式或实现。设计系统本体转交 `wego-uxsystem-iterate`；已经经过用户确认范围内的设计与实现转交 `wego-design`。

## 必要输入与运行时入口

读取用户原始需求、用户确认的结果、当前迭代和 `AGENTS.md`。创建或变更迭代时读取[业务迭代契约](references/iteration-workflow.md)；处理范围、确认话术与 readiness 时读取[边界方法](references/readiness-and-boundaries.md)。只接受当前 Schema，旧输入直接失败。

## 输出契约与跨技能交接

必须输出 `prototype_brief`，包含目标、范围、入口、关键路径、状态、数据与场景目录语义。必须由用户明确回复确认后才能交给 `wego-design`；业务范围变化时必须使当前原型范围失效并创建或更新迭代，不得静默修改已确认事实。
