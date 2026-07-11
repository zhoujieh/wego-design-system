# Readiness 与原型边界

仅在需求存在歧义、局部未确认或需要决定原型实现深度时读取。

## 风险分级

- 低风险、可逆：记录到 `assumptions`，标记 `impact_level: low`、`reversible: true`，可继续。
- 影响局部流程：记录到 `open_questions`，关联 `node_id` 或 `flow_id`；已确认范围继续，未确认节点设为 `stub` 或 `excluded`。
- 影响核心目标、主流程或完成结果：必须询问用户，设置 `readiness = blocked`。

## readiness

- `ready`：关键流程、状态和结果明确。
- `ready-with-assumptions`：只有低风险可逆假设。
- `partially-ready`：主流程可继续，局部节点待确认。
- `blocked`：核心目标、流程或结果不清晰。

每个 readiness 必须有 `reason` 和受影响范围。`partially-ready` 只把已确认范围交给设计；`blocked` 不得交接。

## 边界选择

- 用户必须真实操作并看到状态变化：`functional`。
- 无后端但需要完整体验：`simulated`。
- 只需表达入口和边界：`stub`，必须有用户可见反馈。
- 明确不在本次范围：`excluded`。

不得用 `stub` 回避已经明确要求的核心路径，也不得实现 `excluded` 节点。
