---
name: "wego-product"
description: 创建或变更业务迭代，确认原型范围，并在原型定稿后产出可追踪的 interaction_spec；不处理设计系统或实现偏差。
---

# Wego Product

## 触发与职责边界

用于新页面、新场景、新流程或业务范围变化。先理解用户原始需求、再确认原型范围；只负责业务目标、范围、状态和规格，不决定组件、布局、打开方式或实现。设计系统本体转交 `wego-uxsystem-iterate`，实现偏差转交 `wego-ux`，验收转交 `wego-tests`。

## 必要输入与运行时入口

读取用户原始需求、用户确认结果、当前迭代和 `AGENTS.md`，并遵守[高保真原型基线](../wego-uxsystem-iterate/references/high-fidelity-prototype-baseline.md)。创建或变更迭代时读取[业务迭代契约](references/iteration-workflow.md)；构造规格时读取[规格结构](references/interaction-spec.md)；处理范围、确认话术与 readiness 时读取[边界方法](references/readiness-and-boundaries.md)。只接受当前 Schema，旧输入直接失败。

## 输出契约与跨技能交接

先提交只含用户事实的极简 `prototype_brief`，并等待用户确认；确认后才交给 `wego-design`。原型定稿后才输出 `interaction_spec`、迭代上下文和 `rule_sources`，保存到场景 `_spec/interaction_spec.json`。业务事实、范围、入口、主路径或完成结果未确认时不得交接。
