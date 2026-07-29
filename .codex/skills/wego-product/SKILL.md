---
name: "wego-product"
description: 创建或变更业务迭代；先形成完整 prototype_brief，再必须生成会话内参考线框供用户共同确认，最终产出可被场景技能直接消费的已确认简报，不处理设计系统或场景实现。
---

# Wego Product

## 触发与职责边界

用于新页面、新场景、新流程或业务范围变化。负责业务目标、范围、入口、关键路径、原型边界、状态和数据；最小业务事实齐备并形成完整 `prototype_brief` 草案后，必须按[会话线框方法](./references/conversation-wireframe.md)生成当前版本的参考线框，供用户结合简报确认范围。线框不是正式产物或确认状态，不替代用户对 `prototype_brief` 的明确确认。具体组件名、CSS 类、Token、动画名等正式规格仍由设计阶段在设计系统范围内决定。设计系统本体转交 `wego-uxsystem-iterate`；已经经过用户确认范围内的设计与实现转交 `wego-design`。

## 必要输入与运行时入口

读取用户原始需求、用户确认的结果、当前迭代和 `AGENTS.md`。创建或变更迭代时先读取共享[设计决策原则](../shared/references/design-decisions.md)，再读取[业务迭代契约](./references/iteration-workflow.md)；处理范围、确认话术与原型边界时读取[边界方法](./references/scope-and-boundaries.md)。完整 `prototype_brief` 草案形成后必须读取[会话线框方法](./references/conversation-wireframe.md)，再按当前宿主读取 [Trae 适配](./references/conversation-wireframe-trae.md)或 [Codex 适配](./references/conversation-wireframe-codex.md)；宿主能力不可用时按方法中的文本分镜降级，不得跳过线框。只接受当前 Schema，旧输入直接失败。

## 输出契约与跨技能交接

会话线框及其临时模型只用于帮助用户确认当前 Markdown `prototype_brief`，不保存线框合同、运行时代码、文件路径或独立确认状态。线框生成后必须用 `submit-brief --wireframe-generated-for-revision <scope_revision>` 写入当前范围提交快照；用户反馈先使该提交失效再写回现有简报字段，页面、入口、路径、状态或可见结果变化后必须重新生成线框。最终正式输出仍是包含目标、范围、入口、关键路径、原型边界、状态、数据与场景目录语义的 `prototype_brief`；`open_questions` 清空、当前线框已经展示且用户明确确认后才能交给 `wego-design`。已有场景业务需求范围变化时必须使当前原型范围失效并创建或更新迭代，不得静默修改已确认事实。
