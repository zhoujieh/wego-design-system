---
name: "wego-design"
description: 在已确认业务迭代及可继续的 interaction_spec 基础上消费微购设计系统，选择页面范式、UI Kit、布局、组件组合和页面打开方式，并输出 design_plan。用于新场景设计、业务规格变化后的重新设计或设计缺口修正；不要用于原始需求理解、最终原型实现、单纯验收或设计系统本体维护。
---

# Wego Design

只负责把已确认业务规格转换为可追溯、无设计缺口的 `design_plan`，不重新发明需求，不直接实现页面。

## 前置门禁与路由

- 缺少已落盘 `interaction_spec`：回到 `wego-product`。
- 业务迭代缺失、状态不是 `product-confirmed`、范围未确认或 `scope_revision` 不一致：回到 `wego-product`。
- `readiness = blocked`：停止；新业务迭代只接受 `ready` 或 `ready-with-assumptions`，历史无迭代规格的 `partially-ready` 只处理已确认且非 excluded 节点。
- 组件、Token、UI Kit、Preview、消费规则或工作流本体需要修改：交给 `wego-uxsystem-iterate`。
- 计划已完整，需要实现：交给 `wego-ux`。

## 读取顺序

1. 仓库根目录 `AGENTS.md`。
2. 当前业务迭代 `iteration.json` 和 [业务迭代契约](../wego-product/references/iteration-workflow.md)。
3. 所有相关场景 `_spec/interaction_spec.json`。
4. `library-consumption.json`。
5. `uikit-plan.json`。
6. `colors_and_type.css` 与 `css.json`。
7. `components/index.json`。
8. 仅加载本轮命中的 `components/{slug}.json` 与 `preview/component-{slug}.html`。
9. 构造完整计划时读取 [design-plan.md](references/design-plan.md)。
10. 判断 pagePattern、fallback、复杂度、组合与 presentation 时读取 [design-decisions.md](references/design-decisions.md)。

技能包与设计资产地图见 [library-map.md](references/library-map.md)，只在维护路径或确认资源角色时读取。不得读取 `docs/specs/*.md` 参与决策。

## 核心规则

- 设计判断只能来自已确认的 `interaction_spec`、`library-consumption.json`、`uikit-plan.json`、正式 Token、组件契约和命中的 Preview。
- 每个关键决定必须记录到 `rule_sources_used`，定位真实文件、字段和支持的决定。
- 不得重新发明需求、字段、状态或流程；发现缺口必须回到 `wego-product`。
- 找不到可靠 pagePattern、fallback 或组件依据时必须标记 `gap`，不得把设计选择留给 `wego-ux`。
- `design_plan` 必须落盘后才能交给 `wego-ux`，且所有 surface、节点和设计引用必须完整。
- `design_plan.iteration_context` 必须与已确认迭代一致；只能为现有需求补充设计引用，不得创建未知 `requirement_id` 或修改产品追踪字段。

## 设计决策流程

1. 校验规格 readiness、引用和实现边界。
2. 逐个 surface 判断 exact、near、fallback 或 gap。
3. 确定 `complexity_level`、pagePattern、布局和区域优先级。
4. 决定 flow node 如何合并或承载到 page、sheet、modal、dialog、inline。
5. 为每个内容块选择组件模式、组合约束和稳定变体。
6. 为每个 surface 独立决定 presentation 与 `covers_tab_bar`。
7. 记录实际规则来源、实现约束和设计缺口。
8. 自检、归档旧版、落盘并交接。
9. 所有相关场景无 gap、每个非 excluded 需求均补齐 `traceability.design_refs` 后运行 `iteration-record.mjs mark-design`，由脚本记录设计指纹和实现基线。

## surface 命中规则

- `exact`：页面角色、信息结构和交互与 pagePattern 一致。
- `near`：骨架一致，只有业务内容或少量允许槽位变化。
- `fallback`：无精确模式，但正式 fallback blueprint 能完整覆盖。
- `gap`：现有规则无法可靠决定结构、组件或打开方式；停止交接。

UI Kit 只用于骨架、节奏和固定槽位，禁止复制展示外壳与演示业务内容。

## 页面布局规则

- `M0`：通栏，内容层横向 padding 为 0。
- `M8`：长列表，8px 横向 padding 与正式卡片修饰。
- `M16`：卡片页，16px 横向 padding 与正式卡片容器。
- `M32`：白底大留白，32px 横向 padding、surface 背景和居中分割线。

主区域宽度不因内容多少收缩；尺寸、间距、圆角、字号和颜色只引用已注册 Token。

## 组件映射

每条 `component_mapping` 至少包含 `block`、`scenario_type`、`consumption_mode`、`selected`、`constraint_ref`、`reason` 和 `rule_sources`。

- `stable-variant`：`selected` 只写稳定变体维度值。
- `composition-constraint`：`selected` 写组合约束 ID。
- `free-composition`：写契约 `domAnatomy` 范围内的组合说明，不写 DOM 或 CSS 类。

连续 cell/form 的分组容器进入 `region_composition`。不得用“结构同构”等模糊描述，也不得让实现环节二次决定组件内部规格。

## 对象管理列表

命中对象管理列表时：

- 使用 `object-management-list-composition`，无精确模式时回退 `object-management-list-page`。
- 列表只承接识别、关键状态、1–2 条摘要和必要操作。
- 详情字段进入详情、编辑、sheet 或表单 surface。
- 默认横向主结构；纵向结构必须记录内容依据。
- 1–2 个高频安全操作可外露，更多或危险操作按正式规则收纳。

## 页面打开方式

`page_presentation` 来自 pagePattern 或 fallback，至少包含 `type`、`transition`、`dismiss_action`、`overlay_level`、`covers_tab_bar` 和 `source`。

- `push`：App 栈式下钻，navbar 使用 `back-icon`。
- `modal`：当前场景轻量对话层。
- `sheet`：底部选择或操作层。
- `full-screen-modal`：复杂编辑；左侧使用 `text-cancel` 或 `close-icon`。
- `host-tab`：固定 Tab 内嵌，`covers_tab_bar = false`。

多 route 场景必须按 `surface_id` 索引，每个 surface 独立配置；二级 push/sheet/full-screen-modal 不得继承主 surface 的 `covers_tab_bar = false`。

## 输出与落盘

完整字段、复杂度和兼容规则见 [design-plan.md](references/design-plan.md)。最低包括：

- `complexity_level`
- `iteration_context`
- `flow_to_surface_decisions`
- `page_strategy`
- `region_composition`（structured/complex 必需）
- `component_patterns`、`component_mapping`
- `page_presentation`、`surface_designs`
- `design_gaps`、`rule_sources_used`、`implementation_constraints`

保存到 `wego-app/scenes/{中文业务场景}/_spec/design_plan.json`，覆盖前归档到 `_spec/archive/design_plan.{YYYYMMDD-HHmm}.json`。

## 最终检查与交接

- 所有业务内容来自 `interaction_spec`。
- 每个非 excluded 节点和 surface 都有设计覆盖。
- 新任务不包含完整 DOM 路径或 CSS 类拼装。
- 每个决定能追溯到实际读取的正式来源。
- `design_gaps` 为空，且不存在 `match_status = gap`。

通过后交给 `wego-ux`；否则回到最早产生缺口的来源。
