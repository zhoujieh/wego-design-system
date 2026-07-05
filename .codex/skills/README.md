# wego 本地技能路由说明

这份文档只负责一件事: 帮会先扫描 `.codex/skills/` 的 agent 快速判断“当前请求该触发哪个技能”。

## 技能路由

| 用户意图 | 应触发技能 | 前置条件 | 下一步交接 |
| --- | --- | --- | --- |
| 原始业务需求、做页面、做原型、做新场景、业务编辑任务 | `wego-product` | 无 | 输出 `page_spec` 后交给 `wego-design` |
| 基于已有 `page_spec` 做设计系统消费、选 UI Kit、定组件映射、定打开方式 | `wego-design` | 已有 `page_spec` | 输出 `design_consumption_plan` 后交给 `wego-ux` |
| 基于已有 `page_spec` + `design_consumption_plan` 正式生成或更新 `wego-app` 场景 | `wego-ux` | 已落盘的 `page_spec` + `design_consumption_plan` | 原型完成后交给 `wego-tests` |
| 验收、回归、review 当前场景的需求承接、路由、交互、部署状态 | `wego-tests` | 当前场景已生成且已注册 `route_id` | 输出 `acceptance_report` |
| 改组件、补 preview、改契约、改 UI Kit、改 metadata、补守门 | `wego-uxsystem-iterate` 的`迭代模式` | 目标属于设计系统本体 | 按组件/UI Kit 同步矩阵执行 |
| 补规则、沉淀经验、优化流程、修技能链路、修触发机制 | `wego-uxsystem-iterate` 的`工作流迭代模式` | 目标属于工作流或经验回流 | 回流到对应技能或权威数据文件 |
| 只做检查、评估、review 组件或工作流是否合理 | `wego-uxsystem-iterate` 的`审查模式` | 目标属于设计系统审查 | 先出 findings, 再决定是否转迭代 |

## 统一硬规则

- 模糊请求如“帮我做这个业务页面”，默认先走 `wego-product`
- 没有 `page_spec`，不要直接触发 `wego-design`
- 没有 `design_consumption_plan`，不要直接触发 `wego-ux`
- 组件/UI Kit/工作流问题，不要误判成普通业务开发
- `wego-uxsystem-iterate` 负责设计系统本体与工作流本体；`wego-ux` 负责业务场景原型实现

## 详细规则位置

- 仓库总规则: `AGENTS.md`
- 产品理解: `wego-product/SKILL.md`
- 设计消费: `wego-design/SKILL.md`
- 原型实现: `wego-ux/SKILL.md`
- 验收: `wego-tests/SKILL.md`
- 组件 / UI Kit / 工作流迭代: `wego-uxsystem-iterate/SKILL.md`
