# Readiness 与原型边界

> 角色：范围判断方法。读取条件：需求存在歧义或需要控制原型深度时；不替代规格字段定义。

仅在需求存在歧义、局部未确认或需要决定原型实现深度时读取。业务事实只能来自用户原始需求及其明确确认；不得从 UI Kit、组件 Preview、同类页面惯例或 AI 推测补充页面、字段、状态、流程、文案和操作。

## 提交简报与确认

每个业务需求都先提交极简 `prototype_brief`，内容只包括：目标、纳入范围、排除范围、入口、关键路径、原型边界、低风险假设和待确认问题。不得在此阶段输出组件、布局、页面范式、打开方式或正式规格。

向用户确认时，使用简短摘要逐项列出“本次要做什么、不做什么、从哪里进入、关键操作如何完成、原型模拟到什么程度”。只有用户明确确认后才能运行 `confirm-brief` 并交给 `wego-design`。

## 风险分级

- 低风险、可逆：记录到 `assumptions`，标记 `impact_level: low`、`reversible: true`，可继续。
- 影响局部流程：记录到 `open_questions`，关联 `node_id` 或 `flow_id`；已确认范围继续，未确认节点设为 `stub` 或 `excluded`。
- 影响核心目标、主流程或完成结果：必须询问用户，设置 `readiness = blocked`。

下列不确定项一律属于必须询问：业务目标、纳入或排除范围、入口、主路径、完成结果、不可逆业务规则、影响多个 surface 的状态。不得把这些问题降级为 assumption。

## readiness

- `ready`：关键流程、状态和结果明确。
- `ready-with-assumptions`：只有低风险可逆假设。
- `partially-ready`：主流程可继续，局部节点待确认。
- `blocked`：核心目标、流程或结果不清晰。

每个 readiness 必须有 `reason` 和受影响范围。`partially-ready` 只把已确认范围交给设计；`blocked` 不得交接。

正式业务迭代第一版的本轮交付范围必须整体达到 `ready` 或 `ready-with-assumptions` 才能 `product-confirmed`；`partially-ready` 只能继续停留在产品阶段拆分延期或排除范围，不直接推进整个迭代。

## 边界选择

- 用户必须真实操作并看到状态变化：`functional`。
- 无后端但需要完整体验：`simulated`。
- 只需表达入口和边界：`stub`，必须有用户可见反馈。
- 明确不在本次范围：`excluded`。

不得用 `stub` 回避已经明确要求的核心路径，也不得实现 `excluded` 节点。
