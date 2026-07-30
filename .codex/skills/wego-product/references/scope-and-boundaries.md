# 范围确认与原型边界

> 仅用于澄清业务范围和原型深度；不决定正式组件、Token、CSS 或页面实现。

## 业务事实

业务事实只能来自用户需求和明确确认，不从参考图、线框图、Figma、UI Kit、Preview 或同类页面补充。`prototype_brief` 只记录：

- `goal`：目标和用户价值。
- `included` / `excluded`：本次做与不做的范围。
- `entry_points`：入口归属、位置和触发条件。
- `critical_paths`：用户完成目标的关键路径。
- `prototype_boundaries`：各流程的原型深度和可见结果。
- `states`：必要业务状态、进入条件和用户可感知结果。
- `data_contract`：必须展示、读取或修改的数据及约束。
- `assumptions`：低风险、可逆且已写明影响的假设。
- `open_questions`：提交前必须解决的问题。

<!-- rule-id: entry-points-business-ownership -->
入口属于哪个宿主区域、页面或流程节点，以及何时可见，由 `wego-product` 确认；入口的具体视觉形式由 `wego-design` 决定。

## 何时询问

- 低风险且可逆：写入 `assumptions` 后继续。
- 影响局部流程：暂存到 `open_questions`，提交前确认、转为假设或移入 `excluded`。
- 影响目标、范围、入口、关键路径、状态、数据含义、不可逆规则或完成结果：必须询问，不得推测。

`open_questions` 清空前不得提交简报。用户答案必须写回对应业务字段，不能只保留在聊天记录。

## 交互视觉要求

<!-- rule-id: product-stage-ui-directive-allowed -->
用户明确提出的布局位置、控件类型、视觉强调、页面范式或打开方式，可用业务语言写进现有 brief 字段并随简报确认。具体组件名、class、Token 和动画仍由设计阶段按正式设计系统决定。

参考图只提供视觉方向，用户线框图只提供区域结构，高保真 Figma 只约束指定 Frame 的结构视觉；它们不能补造业务事实。正式能力无法满足已确认要求时，若回退改变指令或可见结果，退回产品阶段更新并重新确认简报；否则由设计阶段采用正式回退。

## 原型深度

每个纳入流程使用稳定 `flow_id`，并选择一种模式：

- `functional`：用户必须真实操作并看到状态变化。
- `simulated`：无后端，但要完整模拟体验和结果。
- `stub`：只表达入口或边界，仍需提供可见反馈。

`visible_result` 必须明确。`excluded` 事项不得以 `stub` 重新进入，也不得用 `stub` 回避已确认的核心路径。

## 交接

进入 `wego-design` 前必须满足：

- 目标、范围、入口、关键路径、原型边界、必要状态和数据完整。
- `open_questions` 为空。
- 已通过 `submit-brief` 展示简短文字摘要，并由用户明确确认后执行 `confirm-brief`。

已确认简报即设计授权。范围内未指定的信息分组、布局、组件、Token、反馈和 overlay 由设计阶段自主完成；只有会改变业务事实的缺失或冲突才退回产品阶段。
