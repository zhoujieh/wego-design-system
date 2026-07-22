# 微购技能路由

| 用户意图 | 技能 | 输出 |
| --- | --- | --- |
| 新业务页面、场景、流程或范围变化 | `wego-product` | 已确认的 `prototype_brief`（含原型边界）与有效迭代 |
| 基于确认简报设计、实现或修改业务场景 | `wego-design` | 路由、scene.js、scene.css、设计决策与守卫证据 |
| 改组件、Preview、Token、UI Kit、消费规则、设计系统缺口或守门 | `wego-uxsystem-iterate` | 设计系统权威源、同步结果与组件一致性证据 |
| 审查并沉淀经验、补充规则、优化工作流 | `wego-uxsystem-iterate` | 候选、确认后的权威规则与回归守卫 |

## 主链路

```text
wego-product → wego-design
```

- `wego-product` 先遵循共享设计决策原则，再确认业务事实、范围、入口、关键路径、状态、数据、原型边界和产品阶段交互视觉描述。
- `wego-design` 消费同一份共享设计决策原则，再一次完成 Preview-first 组件消费、场景实现、交互、决策提取、场景合同和视觉检查。
- `wego-uxsystem-iterate` 处理设计系统本体，消费并收敛 `wego-design` 交接的最小缺口说明；不实现普通业务场景。
- 工作流优化与经验沉淀归 `wego-uxsystem-iterate`；经验先进入候选，只有用户确认后才能升级为正式规则。
- 所有技能只读取当前权威来源；禁止旧技能、自动生成规则文档、兼容字段和双轨路径。
