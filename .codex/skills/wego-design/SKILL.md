---
name: "wego-design"
description: 在已确认原型简报或正式 interaction_spec 基础上消费微购设计系统，选择页面范式、UI Kit、布局、组件组合和页面打开方式；原型期写紧凑设计约束，定稿后输出 design_plan。用于新场景设计、业务规格变化后的重新设计或设计缺口修正；不要用于原始需求理解、最终原型实现、单纯验收或设计系统本体维护。
---

# Wego Design

只负责把已确认原型简报或业务规格转换为可追溯的设计决策；原型期不生成完整文档，定稿后补齐无 gap 的 `design_plan`。

## 顶层版本门禁

- 只接受当前业务迭代 Schema，固定为 `schemaVersion: 2`。
- 发现旧 Schema、旧规格字段、旧文件名或旧命令时必须停止并要求迁移。
- 禁止任何 v1/v2 分支、回退读取、默认兼容或双轨交接。

## 前置门禁与路由

- `prototyping`：读取已确认 `prototype_brief`，为每个原型 surface 写入 `prototype_design.surface_decisions` 后直接交给 `wego-ux`。
- 原型定稿后：缺少已落盘 `interaction_spec` 时回到 `wego-product`；正式设计计划只在 `product-confirmed` 后生成。
- `readiness = blocked`：停止；只接受 `ready` 或 `ready-with-assumptions`。
- 组件、Token、UI Kit、Preview、消费规则或工作流本体需要修改：交给 `wego-uxsystem-iterate`。
- 计划已完整，需要实现：交给 `wego-ux`。

## 读取顺序

1. 仓库根目录 `AGENTS.md`。
2. 当前业务迭代 `iteration.json` 和 [业务迭代契约](../wego-product/references/iteration-workflow.md)。
3. 原型期读取 `prototype_brief`；正式化阶段读取所有相关场景 `_spec/interaction_spec.json`。
4. `library-consumption.json`。
5. `uikit-plan.json`。
6. `colors_and_type.css` 与 `css.json`。
7. `components/index.json`。
8. 仅加载本轮命中的组件契约与 Preview。
9. 构造完整计划时读取 [design-plan.md](references/design-plan.md)。
10. 判断 pagePattern、fallback、复杂度、组合与 presentation 时读取 [design-decisions.md](references/design-decisions.md)。

不得读取 `docs/specs/*.md` 参与决策。

## 核心规则

- 设计判断只能来自已确认的 `prototype_brief` 或 `interaction_spec`，以及正式设计系统来源。
- 每个关键决定必须记录到 `rule_sources_used`。
- 不得重新发明需求、字段、状态或流程；发现缺口必须回到 `wego-product`。
- 找不到可靠 pagePattern、fallback 或组件依据时必须标记 `gap`。
- 原型期必须先把每个 surface 的 presentation、页面范式、组件组合与 `rule_sources_used` 写入 `prototype_design`，然后才能交给 `wego-ux`。
- `design_plan.iteration_context` 必须与已确认迭代一致，不得创建未知 `requirement_id`。

## 设计决策流程

1. 原型期校验 `prototype_brief` 的已确认范围；正式化阶段校验规格 readiness、引用和实现边界。
2. 逐个 surface 判断 exact、near、fallback 或 gap。
3. 确定复杂度、pagePattern、布局和区域优先级。
4. 决定 flow node 的页面承载方式。
5. 为内容块选择组件模式、组合约束和稳定变体。
6. 为每个 surface 独立决定 presentation 与 `covers_tab_bar`。
7. 记录规则来源、实现约束和设计缺口。
8. 原型期写入 `prototype_design` 后立即交接实现；定稿后落盘完整计划。
9. 正式化阶段无 gap 后运行 `iteration-record.mjs mark-design`，同时核验原型快照未漂移。

## surface 命中规则

- `exact`：页面角色、信息结构和交互与 pagePattern 一致。
- `near`：骨架一致，只有业务内容或少量允许槽位变化。
- `fallback`：无精确模式，但正式 fallback blueprint 能完整覆盖。
- `gap`：现有规则无法可靠决定结构、组件或打开方式；停止交接。

## 页面布局与信息组织

- `M0`：通栏。
- `M8`：长列表。
- `M16`：卡片页。
- `M32`：白底大留白，仅极少内容场景使用。
- 单列表优先 M0，多卡片才使用 M8/M16。
- 主区域宽度不得因内容少而收缩。
- 同一数值、说明或状态不得在同一页面重复展示。

## 组件映射

每条 `component_mapping` 至少包含 `block`、`scenario_type`、`consumption_mode`、`selected`、`constraint_ref`、`reason` 和 `rule_sources`。

- `stable-variant`：只写稳定变体维度值。
- `composition-constraint`：写组合约束 ID。
- `free-composition`：只写契约范围内组合说明，不写 DOM 或 CSS 类。

## 页面打开方式

`page_presentation` 至少包含 `type`、`transition`、`dismiss_action`、`overlay_level`、`covers_tab_bar` 和 `source`。多 route 场景按 `surface_id` 独立索引。

## 输出与落盘

最低包括：

- `complexity_level`
- `iteration_context`
- `flow_to_surface_decisions`
- `page_strategy`
- `region_composition`
- `component_patterns`、`component_mapping`
- `page_presentation`、`surface_designs`
- `design_gaps`、`rule_sources_used`、`implementation_constraints`

保存到 `wego-app/scenes/{中文业务场景}/_spec/design_plan.json`，覆盖前归档当前上一版。

## 最终检查与交接

- 迭代 Schema 为当前唯一值 2。
- 所有业务内容来自 `interaction_spec`。
- 每个非 excluded 节点和 surface 都有设计覆盖。
- 每个决定能追溯到正式来源。
- `design_gaps` 为空，且不存在 `match_status = gap`。

通过后交给 `wego-ux`。