# 高保真交互原型工作流基线

> 角色：五技能不可变协作契约。读取条件：修改业务工作流、技能入口或守门时；不替代各技能的领域规则。

本基线的唯一目标是：让 AI 按微购设计规范稳定产出可交互的高保真原型。它约束主链路的所有阶段，不允许通过局部技能或单个业务场景绕过。

| 基线规则 | 主要责任 | 消费方 | 自动守门 |
| --- | --- | --- | --- |
| 业务场景只走 `wego-product → wego-design → wego-ux → wego-tests`；系统和工作流变更只走 `wego-uxsystem-iterate`。 | wego-uxsystem-iterate | 五技能 | 技能路由与入口边界校验 |
| 每个业务需求先提交极简 `prototype_brief`，取得用户确认后才能进入原型设计；AI 不得补造业务事实。 | wego-product | wego-design、wego-ux | iteration-record 状态机 |
| Product 只定义业务事实和范围；Design 只消费设计系统；UX 只执行确认规格；Tests 只依据规格和正式规则验收。 | 对应阶段技能 | 下游阶段技能 | 技能职责与规格交叉校验 |
| Design 只消费正式 Token、组件契约、Preview、blueprint 和 UI Kit 结构参考；不得发明组件、复制展示外壳或补演示业务。 | wego-design | wego-ux、wego-tests | 设计系统与场景校验 |
| 原型必须可交互、符合微购移动端设计规范；规格、设计、实现和验收必须真实可追溯。 | wego-ux、wego-tests | 交接与冻结 | iteration-record 与验收校验 |
| 业务、设计或实现出现缺口时，必须退回最早责任阶段；下游不得静默补齐。 | 五技能 | 五技能 | gap、readiness 与验收失败门禁 |
| 当前 Schema 和状态机是唯一运行版本；禁止兼容、回退、双轨字段和旧入口。 | wego-product | 五技能 | Schema、入口与迭代校验 |

## 变更门禁

本文件或表中任一规则的修改，必须走 `wego-uxsystem-iterate`，并在同一变更中记录影响、同步全部消费方和守门、取得用户明确确认。普通业务迭代、局部 Skill 调整或仅更新生成文档都不得修改或绕过本基线。
