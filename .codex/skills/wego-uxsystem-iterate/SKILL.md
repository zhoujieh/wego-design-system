---
name: "wego-uxsystem-iterate"
description: 审查或迭代微购设计系统、五技能工作流、经验候选与自动守门；不处理普通业务页面实现或单纯场景验收。
---

# Wego UX 系统迭代

## 触发与职责边界

用于组件、Token、Preview、UI Kit、消费边界、技能工作流、经验沉淀和守门变更。普通业务页面固定交给 `wego-product → wego-design → wego-ux → wego-tests`。

## 必要输入与运行时入口

读取 `AGENTS.md`、本轮最早归属和对应结构化来源。组件与 UI Kit 迭代读取[组件工作流](references/workflow.md)、[运行时同步矩阵](references/sync-matrix.runtime.md)和[稳定判断](references/judgment-principles.md)；工作流迭代先读取[高保真原型基线](references/high-fidelity-prototype-baseline.md)，再读取[经验工作流](references/workflow-iteration.md)、[候选池结构](references/experience-candidates.md)、[归属注册表](experience/authority-registry.json)、[同步矩阵](references/sync-matrix.md)和[技能包结构](references/skill-package-structure.md)。复盘材料仅在需要追溯时读取[button 记录](references/button-example.md)或[usageHint 记录](references/case-usagehint-size-as-state.md)。

## 输出契约与跨技能交接

审查输出归属、证据和修复范围；正式迭代修改唯一权威来源并补齐守门。候选只写入 `experience/candidates.json`，正式规则升级后记录唯一目标、消费方和验收方；下游按归属文件读取，不以 `SKILL.md` 承载领域规则。
