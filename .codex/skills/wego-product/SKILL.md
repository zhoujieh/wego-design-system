---
name: "wego-product"
description: 创建业务迭代并先确认极简原型简报；用户定稿后再将确认原型补全为跨场景可追踪、可验证、可交接的 interaction_spec。用于新页面、新原型、新场景、业务流程或已有场景的目标、范围、状态、异常流程、宿主入口发生变化时；不要用于纯组件、Token、UI Kit、实现偏差或验收任务。
---

# Wego Product

负责创建业务迭代、确认跨场景原型范围，并在用户定稿后落盘 `interaction_spec`；不选择 UI Kit、组件、布局或实现方式。

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
5. 新业务迭代或已有业务场景变化时读取 [业务迭代契约](references/iteration-workflow.md)。
6. 仅在需要构造、迁移或校验完整规格时读取 [interaction-spec.md](references/interaction-spec.md)。
7. 仅在需求有歧义、局部未确认或需要控制原型深度时读取 [readiness-and-boundaries.md](references/readiness-and-boundaries.md)。

不要读取 `docs/specs/*.md`、UI Kit 演示内容、组件 Preview 或历史页面惯例来补造业务事实。

## 核心规则

- 自动生成的 `specs/*.md` 不得作为运行时规则来源，也不得补充或改变用户需求。
- 页面信息、状态、异常流程和宿主路径只能来自用户需求、已有业务事实与本技能的结构化判断，不能凭模板或惯例发明。
- 影响页面范围、核心流程、数据含义、保存方式或宿主层级的关键歧义，必须先得到用户确认；schema v2 以极简 `prototype_brief` 完成这次范围确认。
- `interaction_spec` 只记录真实判断依据，必须使用 `rule_sources`，不得输出 `spec_refs`。
- schema v2 新迭代先确认只含目标、范围、入口、关键路径、边界与假设的 `prototype_brief`，随后进入连续原型冲刺；完整 `interaction_spec`、需求编号和追踪均在原型定稿后补齐。
- 正式业务变化必须先用 `scripts/iteration-record.mjs init` 在唯一主业务场景创建迭代，登记关联场景和宿主文件；新建迭代默认 schema v2，既有 v1 继续按原流程处理。
- v2 先以 `submit-brief → confirm-brief` 进入 `prototyping`，再以 `confirm-prototype` 锁定运行时原型并承担正式范围确认；随后 `formalize-product` 生成范围记录、落盘规格并进入 `product-confirmed`。v1 继续使用 `scope → confirm-scope`。

## 执行流程

1. 判断是新需求、业务变更、实现偏差，还是设计系统/工作流问题。
2. 为业务需求创建迭代，确定主场景、关联场景、`feature_id`、`requirement_id` 和需要持续比较的共享场景基线范围。
3. 提炼目标、范围、入口、关键路径、原型边界和交互模式，写入 `prototype_brief`。
4. 运行 `submit-brief` 等待用户确认，再运行 `confirm-brief`，交给 `wego-design → wego-ux` 连续完成原型。
5. 用户定稿后，拆分完整流程节点、surface、内容块、状态、异常与数据交接。
6. 按 [interaction-spec.md](references/interaction-spec.md) 更新相关场景规格与需求追踪，运行 `formalize-product`；v1 继续使用 `scope → confirm-scope`。
7. 归档旧版、落盘新版并交给 `wego-design`。

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
- `iteration_context`
- `flows`、`flow_nodes`、`surfaces`、`content_blocks`
- `states`、`transitions`、`data_handoffs`、`exit_results`
- `prototype_boundaries`、`prototype_target`
- `host_container`、`assumptions`、`open_questions`、`readiness`
- `rule_sources`

保存到：`wego-app/scenes/{中文业务场景}/_spec/interaction_spec.json`。

迭代总表保存到主业务场景 `_iterations/{YYYYMMDD}-{iteration_id}-{title}/iteration.json`；v2 的 `prototype_brief`、`prototype_design` 和两次确认都记录在其中，范围确认文档只在原型定稿后生成。完整结构、状态机和跨场景规则以 [业务迭代契约](references/iteration-workflow.md) 为准。

覆盖前把上一版归档到 `_spec/archive/interaction_spec.{YYYYMMDD-HHmm}.json`。`interaction_spec` 未落盘、`readiness = blocked` 或核心引用无效时不得交接。

## 最终检查

- 没有从模板、示例或设计资产发明业务内容。
- flows、nodes、surfaces、content、transition、handoff 和 route 引用闭合。
- `functional` 节点可进入下游；`stub` 有明确反馈；`excluded` 不进入实现。
- 关键歧义已确认，假设可逆且有记录。
- 新版规格已落盘，旧版已归档。
- 迭代范围已由用户确认，状态为 `product-confirmed`，所有相关规格的 `scope_revision` 与需求编号一致。

完成后交给 `wego-design`。
