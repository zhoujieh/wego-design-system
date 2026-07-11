# Design Plan 结构

仅在创建、迁移或校验 `design_plan` 时读取。触发、核心门禁和交接以 `../SKILL.md` 为准。

业务迭代中的 `design_plan` 必须包含与产品规格完全一致的 `iteration_context`，只引用已确认的 `requirement_ids[]`。设计阶段不得新增需求编号或提升 `scope_revision`。

## 新任务结构

```text
design_plan
├── complexity_level
├── flow_to_surface_decisions
├── page_strategy
├── region_composition
├── component_patterns
├── page_presentation
├── surface_designs
├── component_mapping
├── design_gaps
├── rule_sources_used
└── implementation_constraints
```

## complexity_level

- `simple`：简单设置、单一表单、基础详情；可省略 `region_composition` 和单节点的 `flow_to_surface_decisions`。
- `structured`：多分组设置、管理列表、多区块工作台；必须有 `region_composition`，多 surface 时必须有 flow 决策。
- `complex`：首页、内容流、营销多模块页；还必须定义首屏目标、区域优先级、内容密度、滚动节奏、固定与滚动关系、视觉竞争。

## flow_to_surface_decisions

每条使用稳定 `decision_id`，声明 `node_refs[]`、`surface_ref`、`carrier_decision`、`reason` 和 `rule_sources`。

`carrier_decision` 仅为 `merge-into-surface | standalone-page | sheet | modal | dialog | inline`。

## page_strategy

声明 `page_goal`、`page_pattern`、`layout_pattern`、`main_scroll_direction`、`content_density`、`fixed_vs_scroll`。复杂页面还必须声明 `first_screen_goal`、`region_priority`、`scroll_rhythm` 和 `visual_competition`。

## region_composition

每个区域使用稳定 `region_id`，声明 `role`、`priority`、`order`、`layout`、`width`、`scroll_behavior`、`component_refs[]`、`relation` 和 `rule_sources`。

区域负责页面编排，不复制业务文案，不拼装 CSS 类。

## component_patterns

每条使用稳定 `pattern_id`，声明 `applies_to[]`、`component_pattern`、`matched_page_pattern` 或 `matched_blueprint`、`constraint_ref`、`reason` 和 `rule_sources`。

## surface_designs

覆盖全部 `interaction_spec.surfaces[]`，至少包含 `surface_id`、`role`、`match_status`、命中的 UI Kit/pagePattern/blueprint、`presentation_ref`、组件映射和允许的页面样式。

## component_mapping

`selected` 不再同时承载变体、DOM、CSS 类、状态类和组合关系：

- stable-variant → 变体维度数组。
- composition-constraint → 正式约束 ID。
- free-composition → `domAnatomy` 范围内的组合说明。

## page_presentation

单 route 单 surface 可使用单数对象；多 route 或多 surface 必须按 `surface_id` 索引。每项完整声明打开类型、动画、关闭动作、层级、是否覆盖 Tab 和真实来源。

## 兼容规则

- 新任务只维护新结构。
- 旧场景可回退 `matched_uikit`、`navigation_pattern`、`layout_pattern`、`interaction_pattern` 和旧式 `selected`。
- 新旧字段不得维护语义不同的两份计划；迁移时归档旧版并一次补齐新字段。
