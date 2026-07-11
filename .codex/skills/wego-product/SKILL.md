---
name: "wego-product"
description: 将原始中文业务需求转换为可落盘、可验证、可交接的 interaction_spec。用于新页面、新原型、新场景、业务流程或已有场景的目标、范围、状态、异常流程、宿主入口发生变化时；在任何设计系统消费和原型实现之前使用。不要用于纯组件、Token、UI Kit、实现偏差或验收任务。
---

# Wego Product

只负责理解产品需求并落盘 `interaction_spec`，不选择 UI Kit、组件、布局或实现方式。

## 职责与路由

- 新页面、新场景、新流程或业务范围变化：执行本技能。
- 已有完整且仍适用的 `interaction_spec`，只需设计消费：交给 `wego-design`。
- 只修复不改变需求的实现偏差：交给 `wego-ux`。
- 组件、Token、UI Kit、Preview、守门或工作流变更：交给 `wego-uxsystem-iterate`。

## 必要输入与读取顺序

1. 用户本轮明确要求与确认结果。
2. 同场景已有 `_spec/interaction_spec.json`，只用于差异判断。
3. 仓库根目录 `AGENTS.md`。
4. 本文件。
5. 仅在需要构造、迁移或校验完整规格时读取 [interaction-spec.md](references/interaction-spec.md)。
6. 仅在需求有歧义、局部未确认或需要控制原型深度时读取 [readiness-and-boundaries.md](references/readiness-and-boundaries.md)。

不要读取 `docs/specs/*.md`、UI Kit 演示内容、组件 Preview 或历史页面惯例来补造业务事实。

## 核心规则

- 自动生成的 `specs/*.md` 不得作为运行时规则来源，也不得补充或改变用户需求。
- 页面信息、状态、异常流程和宿主路径只能来自用户需求、已有业务事实与本技能的结构化判断，不能凭模板或惯例发明。
- 影响页面范围、核心流程、数据含义、保存方式或宿主层级的关键歧义，必须得到用户确认后再进入 `wego-design`。
- `interaction_spec` 只记录真实判断依据，必须使用 `rule_sources`，不得输出 `spec_refs`。
- 需求确认完成后必须先落盘 `interaction_spec`，通过自检后才能交给 `wego-design`。

## 执行流程

1. 判断是新需求、同场景业务变更，还是无需改规格的实现问题。
2. 提炼目标、用户、范围、完成条件和交互模式。
3. 拆分流程节点、surface、内容块、状态、异常与数据交接。
4. 判断宿主 Tab、入口层级、场景目录和稳定 route。
5. 区分已确认事实、低风险可逆假设和待确认问题。
6. 对会改变核心结果的歧义向用户确认；只阻塞受影响范围。
7. 按 [interaction-spec.md](references/interaction-spec.md) 生成并校验规格。
8. 归档旧版、落盘新版并交给 `wego-design`。

## 需求确认门禁

进入设计前至少明确：

- 谁要完成什么业务动作，完成结果是什么。
- 包含和排除哪些流程、页面或局部 surface。
- 核心操作是即时生效、统一保存、只读还是选择后返回。
- 必须展示或编辑哪些真实字段。
- 成功、失败、空数据、禁用、中断、取消和返回如何处理。
- 场景挂载在哪个 Tab、入口层级和稳定 route。

低风险可逆缺口可记入 `assumptions`；核心目标、主流程或结果不清楚时设置 `readiness = blocked`，不得进入设计。

## 对象管理列表字段分级

管理仓库、商品、员工、客户、门店等对象时，按业务事实输出：

- `list_required_fields`：识别对象和关键状态必需字段。
- `list_summary_fields`：只保留 1–2 条影响当前判断的摘要。
- `detail_fields`：完整地址、联系人、备注和长文本等详情字段。
- `operation_fields`：新增、编辑、删除、启停和更多操作，并标记频率与风险。

## 页面角色拆分

- `host-entry`：宿主页入口、摘要或结果回填。
- `primary-task-page`：核心任务。
- `secondary-task-page`：选择、创建、详情或补充设置。
- `result-summary`：完成结果或只读摘要。

新任务使用 `surfaces`；旧 `page_surfaces` 只作兼容读取。每个内容块至少归属一个 surface，surface 只描述产品职责和承载意图，不指定组件或布局。

## App 目标

- 固定目标为 `wego-app`，场景进入 `wego-app/scenes/{中文业务场景}/`。
- 新任务使用 `prototype_target.routes[]`，每个 route 绑定稳定 `surface_ref`。
- 旧场景可回退顶层 `route_id`，同一路径迭代不得随意更名。
- `host_container` 描述 Tab、入口、层级与父子关系，不重复表达 route。
- 不在仓库根目录创建任务原型。

## 输出与落盘

完整字段、ID 约束、兼容规则和示例见 [interaction-spec.md](references/interaction-spec.md)。最低输出包括：

- `goal`、`scope`、`actors`、`entry_points`
- `flows`、`flow_nodes`、`surfaces`、`content_blocks`
- `states`、`transitions`、`data_handoffs`、`exit_results`
- `prototype_boundaries`、`prototype_target`
- `host_container`、`assumptions`、`open_questions`、`readiness`
- `rule_sources`

保存到：`wego-app/scenes/{中文业务场景}/_spec/interaction_spec.json`。

覆盖前把上一版归档到 `_spec/archive/interaction_spec.{YYYYMMDD-HHmm}.json`。`interaction_spec` 未落盘、`readiness = blocked` 或核心引用无效时不得交接。

## 最终检查

- 没有从模板、示例或设计资产发明业务内容。
- flows、nodes、surfaces、content、transition、handoff 和 route 引用闭合。
- `functional` 节点可进入下游；`stub` 有明确反馈；`excluded` 不进入实现。
- 关键歧义已确认，假设可逆且有记录。
- 新版规格已落盘，旧版已归档。

完成后交给 `wego-design`。
