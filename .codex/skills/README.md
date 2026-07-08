# wego 本地技能路由说明

本文件只负责帮助 agent 判断当前请求应触发哪个技能。详细规则以各技能唯一的 `SKILL.md` 为准。

## 技能路由

| 用户意图 | 应触发技能 | 前置条件 | 下一步 |
| --- | --- | --- | --- |
| 原始业务需求、做页面、做原型、做新场景 | `wego-product` | 无 | 确认并落盘 `interaction_spec` |
| 基于已有 `interaction_spec` 选择页面范式、UI Kit、组件和打开方式 | `wego-design` | 已有且已确认的 `interaction_spec` | 落盘 `design_plan` |
| 正式生成或更新 `wego-app` 场景 | `wego-ux` | 两份规格已落盘且无 gap | 完成后交给 `wego-tests` |
| 验收、回归、检查当前业务场景 | `wego-tests` | 场景已生成并注册路由 | 输出 `acceptance_report` |
| 改组件、Token、Preview、UI Kit、metadata 或守门 | `wego-uxsystem-iterate` 的迭代模式 | 目标属于设计系统本体 | 按同步矩阵执行 |
| 审查并沉淀经验、补充规则、复盘形成经验、优化工作流 | `wego-uxsystem-iterate` 的工作流迭代模式 | 用户明确要求沉淀或优化 | 先进入经验候选流程 |
| 只检查组件、UI Kit 或工作流是否合理 | `wego-uxsystem-iterate` 的审查模式 | 无 | 先输出 findings，再决定是否修复 |

## 统一硬规则

- 模糊业务页面请求默认先走 `wego-product`。
- 没有已确认并落盘的 `interaction_spec` 不进入 `wego-design`。
- 没有已落盘且无 `gap` 的 `design_plan` 不进入 `wego-ux`。
- 已有场景的任何修改先进入 `wego-ux` 做偏差判定。
- 组件、UI Kit、工作流问题不得误走普通业务开发链路。
- 普通反馈、AI 自查和验收失败不会自动进入经验池。
- 一次经验审查最多记录一条候选；三次出现只触发用户确认，不自动升级正式规则。
- `.codex/skills/wego-design/specs/*.md` 是自动生成的人工检查文档，不是任何业务技能的运行时规则来源。

## 单一技能入口

- 五个主技能目录都只使用一个 `SKILL.md` 作为运行时入口。
- 禁止创建 `SKILL.runtime.md`、`SKILL.override.md` 或其他并列入口。
- 专项背景和复杂流程可以放进 `references/`，但必须由 `SKILL.md` 明确引用，且不能覆盖 `SKILL.md`。
- 生成脚本、README、同步矩阵和守门只能引用当前 `SKILL.md`，不得引用历史副本。

## 详细入口

- 仓库级约束：`AGENTS.md`
- 产品理解：`wego-product/SKILL.md`
- 设计消费：`wego-design/SKILL.md`
- 原型实现：`wego-ux/SKILL.md`
- 验收：`wego-tests/SKILL.md`
- 组件、UI Kit、工作流迭代：`wego-uxsystem-iterate/SKILL.md`
