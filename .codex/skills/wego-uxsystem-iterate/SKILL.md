---
name: "wego-uxsystem-iterate"
description: 审查或迭代微购设计系统、组件、Preview、UI Kit、设计库消费规则、自动守门、DDR 与经验候选；不实现普通业务场景。
---

# Wego UX 系统迭代

## 触发与职责边界

用于组件、Token、Preview、UI Kit、消费边界、守门、DDR 和工作流迭代。普通业务场景固定交给 `wego-product → wego-design`。本技能修改唯一设计系统源，不直接修改 `wego-app/lib/`、`components.css` 或业务场景来掩盖系统问题。

## 必要输入与运行时入口

读取 `AGENTS.md`、[原型基线](references/high-fidelity-prototype-baseline.md)、[组件与 UI Kit 迭代](references/workflow.md)、[资源同步矩阵](references/sync-matrix.runtime.md)、[工作流与经验同步](references/sync-matrix.md)、[工作流迭代](references/workflow-iteration.md)、[经验候选](references/experience-candidates.md)、归属注册表和候选池。组件或 UI Kit 改动必须读取其契约、Preview、`components.css`、索引和受影响页面蓝图。

## 输出契约与跨技能交接

输出权威源改动、组件一致性守卫结果、必要资源同步和 DDR 决策。新增或修改组件、Preview、UI Kit、Token 或消费规则时，必须同步索引、允许组件、页面蓝图、质量报告与版本；只有用户确认的经验才可升级正式规则。
