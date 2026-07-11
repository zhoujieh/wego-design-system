# 专项验收清单

> 角色：验收方法。读取条件：验证完整路径或专项规则时；正式业务规则仍以规格与结构化来源为准。

验复杂流程、对象管理或设计收缩时读取。

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

## 连续内容流

- 复杂内容流默认不应误用 M16 卡片式压缩横向空间；若使用 M16，必须有正式 pagePattern 或 fallback blueprint 依据。
- 单条内容同时承载正文、媒体、对象摘要和操作时，媒体区域没有主导首屏高度，文字与对象信息仍是主要判断对象。
- 价格、金额、统计值和划线价命中 metric 语义时，必须能追溯到 metric 消费；不能只靠数字字体类自定义数值样式通过。
- 重复列表项中没有反复出现 strong 主按钮；若页面存在 strong，必须能说明它是页面级唯一主动作。
- 列表项外露操作数量与正式依据一致；达到 3 个及以上操作时，应看到收纳承载或正式例外说明。
- 命中 sheet primitive 且内容属于操作列表、轻量筛选或单选切换时，实现应消费 actionsheet 或能说明为何命中正式例外，不接受业务自造通用 action-sheet 结构。
- 页面文案只表达业务信息、状态和动作，不出现解释设计意图、Benchmark 背景或工作流提示的说明块。

## 设计收缩

- 新计划无完整 DOM 路径或 CSS 类拼装。
- structured/complex 有 region composition；complex 有完整 page strategy。
- flow decisions 覆盖所有非 excluded 节点。
- 每个组件、区域和 presentation 能追溯来源。

## 当前格式

- 发现旧字段、旧文件或兼容分支直接失败，不为验收保留迁移读取路径。

## 资源与本地直开

- `wego-app/lib/` 与设计系统源一致。
- 字体、图标、图片、Token 和 components.css 完整。
- 同一 index 在电脑端显示手机壳、移动端全屏，且不依赖运行时请求本地文件。
