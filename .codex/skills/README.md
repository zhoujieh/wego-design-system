# wego 本地技能路由说明

本文件只负责帮助 agent 判断当前请求应触发哪个技能。详细规则以各技能唯一的 `SKILL.md` 为准。

## 技能路由

| 用户意图 | 应触发技能 | 前置条件 | 下一步 |
| --- | --- | --- | --- |
| 原始业务需求、做页面、做原型、做新场景 | `wego-product` | 无 | 确认极简原型简报；定稿后落盘 `interaction_spec` |
| 基于已确认原型简报或正式规格选择页面范式、UI Kit、组件和打开方式 | `wego-design` | v2 为 `prototyping` 或正式阶段 | 原型期写设计约束，定稿后落盘 `design_plan` |
| 正式生成或更新 `wego-app` 场景 | `wego-ux` | v2 原型期有简报和设计约束；正式期有两份规格 | 提交用户定稿后交给 `wego-tests` |
| 验收、回归、检查当前业务场景 | `wego-tests` | 场景已生成并注册路由 | 输出 `acceptance_report` |
| 改组件、Token、Preview、UI Kit、metadata 或守门 | `wego-uxsystem-iterate` 的迭代模式 | 目标属于设计系统本体 | 按同步矩阵执行 |
| 审查并沉淀经验、补充规则、复盘形成经验、优化工作流 | `wego-uxsystem-iterate` 的工作流迭代模式 | 用户明确要求沉淀或优化 | 先进入经验候选流程 |
| 只检查组件、UI Kit 或工作流是否合理 | `wego-uxsystem-iterate` 的审查模式 | 无 | 先输出 findings，再决定是否修复 |

## 统一硬规则

- 新业务需求和已有业务场景修改必须先创建有效业务迭代；v2 先确认极简原型简报，再连续完成设计与实现，用户定稿后才补正式规格与交接。
- 需求用 `requirement_id` 贯穿产品、设计、实现、验收和开发交接；冻结迭代不得覆盖。
- 模糊业务页面请求默认先走 `wego-product`。
- v2 原型期的 `wego-design` 消费 `prototype_brief`，`wego-ux` 消费 `prototype_design`；完整 `interaction_spec` 与无 gap 的 `design_plan` 只在定稿后成为正式化门禁。
- 已有场景的任何修改先进入 `wego-ux` 做偏差判定。
- 组件、UI Kit、工作流问题不得误走普通业务开发链路。
- 普通反馈、AI 自查和验收失败不会自动进入经验池。
- 一次经验审查最多记录一条候选；达到当前阈值只触发用户确认，不自动升级正式规则。快速迭代阶段阈值为 1，标准稳定阶段保留 3。
- `docs/specs/*.md` 是自动生成的人工检查文档，不是任何业务技能的运行时规则来源。

## 单一技能入口

- 五个主技能目录都只使用一个 `SKILL.md` 作为运行时入口。
- 禁止创建 `SKILL.runtime.md`、`SKILL.override.md` 或其他并列入口。
- `SKILL.md` 保留触发边界、职责、主流程、门禁、输出和交接；详细 schema、迁移、长示例和专项检查进入 `references/`。
- `references/` 必须由 `SKILL.md` 直接链接并说明读取条件；模板进入 `assets/`，确定性操作进入 `scripts/`。
- 技能目录不保留平级 README 或 `templates/`；生成脚本、同步矩阵和守门只引用当前入口与其直接引用的正式 reference。

## 详细入口

- 仓库级约束：`AGENTS.md`
- 产品理解：`wego-product/SKILL.md`
- 设计消费：`wego-design/SKILL.md`
- 原型实现：`wego-ux/SKILL.md`
- 验收：`wego-tests/SKILL.md`
- 组件、UI Kit、工作流迭代：`wego-uxsystem-iterate/SKILL.md`
