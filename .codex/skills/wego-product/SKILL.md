---
name: "wego-product"
description: 创建或变更业务迭代，确认原型范围，并在原型定稿后产出可追踪的 interaction_spec；不处理设计系统或实现偏差。
---

# Wego Product

## 触发与职责边界

用于新页面、新场景、新流程或业务范围变化。只负责业务目标、范围、状态和规格；设计系统本体转交 `wego-uxsystem-iterate`，实现偏差转交 `wego-ux`，验收转交 `wego-tests`。

## 必要输入与运行时入口

读取用户确认结果、当前迭代和 `AGENTS.md`。创建或变更迭代时读取[业务迭代契约](references/iteration-workflow.md)；构造规格时读取[规格结构](references/interaction-spec.md)；处理范围或 readiness 时读取[边界方法](references/readiness-and-boundaries.md)。只接受当前 Schema，旧输入直接失败。

## 输出契约与跨技能交接

原型期输出已确认的 `prototype_brief`；定稿后输出 `interaction_spec`、迭代上下文和 `rule_sources`，保存到场景 `_spec/interaction_spec.json`。范围确认后交给 `wego-design`；业务事实或范围未确认时不交接。
