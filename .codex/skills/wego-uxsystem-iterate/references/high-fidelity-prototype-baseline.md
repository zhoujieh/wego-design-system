# 高保真交互原型工作流基线

| 不可变规则 | 主要责任 | 消费方 | 验证 |
| --- | --- | --- | --- |
| 业务场景只走 `wego-product → wego-design`；设计系统和工作流变更只走 `wego-uxsystem-iterate`。 | 全部技能 | 全部技能 | 技能入口与零旧路径守卫 |
| 业务需求先确认 `prototype_brief`，AI 不得补造业务事实。 | wego-product | wego-design | iteration-record |
| wego-design 在一次任务中消费正式设计系统、实现登记场景、生成设计决策与完成证据。 | wego-design | 用户与迭代冻结 | 场景合同、交互和视觉检查 |
| 组件消费 Preview-first；组件、Preview、聚合 CSS、索引和 UI Kit 必须可追溯且一致。 | wego-uxsystem-iterate | wego-design | 组件一致性守卫 |
| 设计系统缺口走 DDR；DDR 不得掩盖错误 Token、class、路由或未实现交互。 | wego-uxsystem-iterate | wego-design | DDR 状态机与守卫 |
| 所有规则只保留权威源；禁止生成规则投影、兼容、回退、双轨字段和旧入口。 | 全部技能 | 全部技能 | 全量验证 |

本基线变更必须走 `wego-uxsystem-iterate`，同步影响的权威源和守卫；不得通过业务场景或生成文档绕过。
