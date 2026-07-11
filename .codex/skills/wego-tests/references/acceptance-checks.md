# 专项验收清单

验复杂流程、对象管理、兼容迁移或设计收缩时读取。

## 流程与节点

- flows 按需求覆盖主流程、分支、异常和中断恢复。
- functional 节点真实走通；simulated 使用本地数据完整走通。
- stub 有入口、`data-node-id` 和明确反馈；excluded 无实现痕迹。
- transition 触发、目标和 return_to 可操作。

## 数据交接与返回

业务迭代验收先按 `iteration.json.requirements[].requirement_id` 建立覆盖矩阵；每个非 excluded 需求都必须能追踪到产品 flow/node/surface、设计决策、实现位置和 `acceptance_report.requirement_coverage[]`，未知编号、缺号或范围版本不一致直接失败。

- handoff 覆盖所有需要回填的 transition。
- payload 回填到正确 content ID。
- keep/reset/clear-on-success 与规格一致。
- 多层 push 逐层返回并保留下层状态；切换 Tab 或明确清空时才清栈。

## 端到端路径

至少按需求覆盖正常、异常、中断恢复、重复操作和子页面回填。页面单独通过不代表完整路径通过。

## 对象管理列表

- 列表只保留识别、关键状态、1–2 条摘要和必要操作。
- 详情字段没有摊满列表。
- 图片、横纵结构、操作外露和危险确认有正式依据。
- 状态组件更新 class、aria 和值，不因重渲染丢动画。

## 设计收缩

- 新计划无完整 DOM 路径或 CSS 类拼装。
- structured/complex 有 region composition；complex 有完整 page strategy。
- flow decisions 覆盖所有非 excluded 节点。
- 每个组件、区域和 presentation 能追溯来源。

## 兼容迁移

- 旧场景可读取旧字段，但新旧字段不维护冲突语义。
- 迁移时旧规格已归档，新字段一次补齐。
- 不因尚未迁移而拒绝合法旧场景，也不让新任务继续写旧格式。

## 资源与本地直开

- `wego-app/lib/` 与设计系统源一致。
- 字体、图标、图片、Token 和 components.css 完整。
- 同一 index 在电脑端显示手机壳、移动端全屏，且不依赖运行时请求本地文件。
