---
name: "wego-uxsystem-iterate"
description: 审查或迭代微购设计系统、组件、Preview、UI Kit、设计库消费规则、自动守门、设计系统缺口与经验候选；不实现普通业务场景。
---

# Wego UX 系统迭代

## 触发与职责边界

用于组件、Token、Preview、UI Kit、消费边界、守门、设计系统缺口和工作流迭代。普通业务场景固定交给 `wego-product → wego-design`。本技能修改唯一设计系统源，不直接修改 `wego-app/lib/`、`components.css` 或业务场景来掩盖系统问题。

## 必要输入与运行时入口

固定先读 `AGENTS.md`，再按任务只读取对应分支：

- 组件、Token、Preview 或 UI Kit：读[组件与 UI Kit 迭代](references/workflow.md)、[资源同步矩阵](references/sync-matrix.runtime.md)，以及目标组件契约、Preview、索引、生成后的 `components.css` 和受影响明确范式。
- 消费规则、守门或设计系统缺口：读直接受影响的权威源和消费者；涉及顶层页面判断时才读共享[设计决策原则](../shared/references/design-decisions.md)。
- 用户明确要求优化工作流或沉淀经验：读[工作流迭代](references/workflow-iteration.md)和[工作流与经验同步](references/sync-matrix.md)；只有录入、确认或升级候选时再读[经验候选](references/experience-candidates.md)、归属注册表和候选池。

## 输出契约与跨技能交接

输出权威源改动、组件一致性守卫结果、必要资源同步和缺口处理结论。收到最小缺口说明时，先验证缺口真实存在，再记录采用的正式能力或回退；不建立平行状态机。新增或修改组件、Preview、UI Kit、Token 或消费规则时，必须同步索引、引用该组件的明确范式、质量报告与版本；只有用户确认的经验才可升级正式规则。
