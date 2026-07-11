---
name: "wego-design"
description: 基于已确认原型简报或 interaction_spec 消费设计系统，输出可追溯的原型设计约束和 design_plan；不定义业务需求或修改设计系统本体。
---

# Wego Design

## 触发与职责边界

用于已确认业务范围的页面设计、重新设计或设计缺口修正。只作设计决策；业务范围回到 `wego-product`，设计系统本体转交 `wego-uxsystem-iterate`，实现转交 `wego-ux`。

## 必要输入与运行时入口

读取 `AGENTS.md`、当前迭代、已确认 `prototype_brief` 或 `interaction_spec`，以及命中的设计系统来源。页面决策读取[设计决策方法](references/design-decisions.md)，完整计划读取[设计计划结构](references/design-plan.md)，资产定位读取[资产地图](references/library-map.md)。只接受当前 Schema，旧输入直接失败。

## 输出契约与跨技能交接

原型期写入 `prototype_design.surface_decisions`；定稿后输出无 gap 的 `design_plan`，包含迭代上下文、规则来源、页面承载和实现约束。完成后交给 `wego-ux`；缺少业务依据或存在 gap 时退回 `wego-product`。
