# Design Plan 结构

> 角色：设计计划结构。读取条件：创建或校验 `design_plan` 时；不替代业务规格或设计系统契约。

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

- `page_strategy.page_pattern` 只能填写已在 `uikit-plan.json.pagePatterns[]` 注册的 `slug`，或在明确使用 fallback blueprint 时留空；不得自由发明内容流、详情页等临时范式名。

## region_composition

每个区域使用稳定 `region_id`，声明 `role`、`priority`、`order`、`layout`、`width`、`scroll_behavior`、`component_refs[]`、`relation` 和 `rule_sources`。

区域负责页面编排，不复制业务文案，不拼装 CSS 类。

## component_patterns

每条使用稳定 `pattern_id`，声明 `applies_to[]`、`component_pattern`、`matched_page_pattern` 或 `matched_blueprint`、`constraint_ref`、`reason` 和 `rule_sources`。

## surface_designs

覆盖全部 `interaction_spec.surfaces[]`，至少包含 `surface_id`、`role`、`match_status`、命中的 UI Kit/pagePattern/blueprint、`presentation_ref`、组件映射和允许的页面样式。

- `matched_page_pattern` 只允许引用 `uikit-plan.json.pagePatterns[].slug`。
- `matched_blueprint` 只允许引用 `uikit-plan.json.fallbackPageBlueprints[].id`。
- `matched_ui_kit` 如填写，只允许引用 `uikit-plan.json.uiKits[].slug`，不写展示名称或临时中文名。
- `component_refs` 只允许引用已注册组件 slug；primitive 名称如 `sheet`、`push` 不作为组件填写。
- 若命中的 `pagePattern` 或 `fallback blueprint` 声明了 `requiredSurfaceDesignContract`，对应 surface 必须补齐 `layout_contract` 对象，并原样输出要求的字段；该对象用于把布局决策传递给 `wego-ux` 和 `wego-tests`，不能只把规则留在自然语言 reason 中。
- 连续内容流命中 `continuous-content-feed-page` 时，`layout_contract.page_edge_mode` 只能是 `M0 | M8 | M16 | M32`；`layout_contract.media_priority` 只能是 `supporting | balanced`；并且必须分别给出 reason，说明页面横向边距模式与媒体权重判断。
- 连续内容流或列表的首屏不得额外生成总览卡、导览、刷新说明、原型说明、Benchmark 背景或评审说明；首屏内容只能承接已确认的业务对象、状态、动作和任务直接相关摘要。

## component_mapping

`selected` 不再同时承载变体、DOM、CSS 类、状态类和组合关系：

- stable-variant → 变体维度数组。
- composition-constraint → 正式约束 ID。
- free-composition → `domAnatomy` 范围内的组合说明。

每条映射还必须给出可追溯的实现锚点约束：实现时使用对应正式组件 class、稳定变体或契约 anatomy；业务作用域 class 只能编排区域，不能替代已声明组件的完整结构。对可选内容块，约束应明确空值时折叠结构，除非 `interaction_spec` 已将缺失定义为业务状态。

## page_presentation

单 route 单 surface 可使用单数对象；多 route 或多 surface 必须按 `surface_id` 索引。每项完整声明打开类型、动画、关闭动作、层级、是否覆盖 Tab 和真实来源。

## 当前格式

- 只维护本文件定义的当前结构；发现旧字段时停止并迁移，禁止兼容读取或双写。
