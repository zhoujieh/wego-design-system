# 微购技能路由

| 用户意图 | 技能 |
| --- | --- |
| 新业务需求、页面、流程或业务范围变化 | `wego-product` |
| 已确认范围内的页面设计与实现 | `wego-design` |
| 组件、Token、Preview、UI Kit、消费规则、守卫或工作流维护 | `wego-uxsystem-iterate` |

```text
需求
  → wego-product 确认 prototype_brief
  → wego-design 设计并实现
  → 自动验证
  → 用户验收
```

同一需求复用当前未冻结迭代；简报变化按产品技能重新提交并确认。设计系统缺口由 `wego-design` 提交最小说明，交给 `wego-uxsystem-iterate`。三个技能只按当前任务读取各自入口直接引用的权威来源。
