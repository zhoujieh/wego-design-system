# Interaction Spec 结构

仅在创建、迁移或校验 `interaction_spec` 时读取。这里定义详细数据结构；触发、门禁和交接仍以 `../SKILL.md` 为准。

## 新任务字段

```text
interaction_spec
├── iteration_context
├── goal
├── scope
├── actors
├── entry_points
├── flows
├── flow_nodes
├── surfaces
├── content_blocks
├── states
├── transitions
├── data_handoffs
├── exit_results
├── prototype_boundaries
├── prototype_target
├── host_container
├── assumptions
├── open_questions
├── readiness
└── rule_sources
```

`iteration_context` 只保存当前业务迭代的 `iteration_id`、`scope_revision` 和本场景 `requirement_ids[]`。跨场景范围、长期功能和状态机由主业务场景 `iteration.json` 维护，不在各场景规格重复定义。

### flows

使用稳定 `flow_id`，声明 `flow_type`、`entry_node`、引用 `node_id` 的 `steps[]` 和 `exit_condition`。按需求覆盖 `main | branch | exception | interrupt-resume`，不机械补齐无业务意义的流程。

### flow_nodes

使用稳定 `node_id`，声明 `purpose`、`surface_ref`、`inputs`、`outputs` 和 `key_states`。一个节点只能绑定一个 surface；节点不包含组件、DOM 或视觉结构。

### surfaces

使用稳定 `surface_id`，声明：

- `role`：`host-entry | primary-task-page | secondary-task-page | result-summary`
- `carrier`：`host-section | standalone-page | sheet | modal | dialog | inline-area`
- `node_refs[]`、`content_refs[]`
- `interaction_mode`、`purpose`、`states[]`

`carrier` 只表达产品承载意图，最终打开方式由 `wego-design` 决定。

### content_blocks

使用稳定 `content_id`，声明 `content`、`group`、`interaction`、`default_state`、`editable` 和 `key_states`。不得出现组件名、DOM、CSS 类或布局规则。

### transitions

使用稳定 `transition_id`，声明 `from`、`trigger`、`to`、`data_in`、`result_out`，选择类下钻按需声明 `return_to` 和 `return_payload`。引用必须指向已存在的 `node_id`。

### data_handoffs

使用稳定 `handoff_id`，声明 `transition_id`、`source_node`、`target_node`、`payload_content_refs[]` 和 `reset_policy`。`reset_policy` 仅为 `keep | reset | clear-on-success`，并说明取消、成功和再次进入时的状态。

### prototype_boundaries

每个节点声明：

- `functional`：真实可操作并完成状态变化。
- `simulated`：用本地模拟数据走完整流程。
- `stub`：只有入口和明确 `feedback`。
- `excluded`：不进入路由、入口和 DOM。

### prototype_target

```json
{
  "prototype_target": {
    "app_root": "wego-app",
    "scenario_folder": "wego-app/scenes/发布产品",
    "routes": [
      { "id": "product-publish", "surface_ref": "publish-main" },
      { "id": "product-category-select", "surface_ref": "category-select" }
    ]
  }
}
```

`host_container.leaf_level >= 3` 的 push 下钻页面必须有独立 route。Sheet、Modal、Dialog 和内联区域不必注册 route。

## 稳定 ID 与引用

- `flow_id`、`node_id`、`surface_id`、`content_id`、`transition_id` 各自唯一。
- 下游只引用上游 ID，不复制或改写业务内容。
- flow steps → node，node → surface，surface → node/content，transition → node，handoff → transition/node/content，route → surface。

## 兼容规则

- 新任务只维护新字段。
- 旧任务可读取 `business_goal`、`information_blocks`、`page_surfaces` 和顶层 `route_id`。
- 新旧字段并存时优先新字段，但不得维护语义不同的两份规格。
- 开始迁移后一次性补齐新字段并归档旧版，不长期双轨维护。

## rule_sources

只记录真实参与判断的用户要求、已有规格、`AGENTS.md` 和 `wego-product/SKILL.md`。不得包含生成文档、UI Kit 示例或组件 Preview。
