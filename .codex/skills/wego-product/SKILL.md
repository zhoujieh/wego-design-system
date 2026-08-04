---
name: "wego-product"
description: 创建或变更业务迭代；形成并确认完整 prototype_brief，最终产出可被场景技能直接消费的已确认简报，不处理设计系统或场景实现。
---

# Wego Product

## 触发与边界

用于新页面、新场景、新流程或业务范围变化。负责确认目标、范围、入口、关键路径、原型边界、状态和数据；不决定正式组件、Token、CSS 或设计系统实现。已确认范围内的设计实现交给 `wego-design`，设计系统本体交给 `wego-uxsystem-iterate`。

## 按需读取

默认先读取 `AGENTS.md` 和 `wego-github-delivery` 的交付单元核对结果，再读取当前需求、当前活动迭代和[边界方法](./references/scope-and-boundaries.md)。创建或更新简报时读取[业务迭代契约](./references/iteration-workflow.md)的 brief Schema；执行提交、确认、失效或冻结时只读取同文件对应操作。参考图、线框图和 Figma 不用于补造业务事实。

## 输出与交接

形成 `open_questions` 已清空的 `prototype_brief`，通过 `submit-brief` 绑定当前范围并展示文字摘要；用户明确确认后运行带当前迭代 ID 的 `confirm-brief --user-confirmed-brief`，再交给 `wego-design`。反馈改变已确认业务事实时，在原迭代中失效、更新、重新提交并确认，不静默修改范围。

## 执行约束

<!-- rule-id: product-must-require-delivery-intake -->
- 创建、查看或更新业务迭代前，必须先完成 `wego-github-delivery` 的交付单元核对。命中现有交付单元时，先接手对应分支、worktree 和 PR；已确认范围内的验收反馈不得新建简报，按原迭代的失效与重新提交规则处理。

<!-- rule-id: confirm-brief-must-wait-affirmation -->
- submit-brief 后必须明确询问"是否确认？"并等待用户回复肯定词，且将当前迭代 ID 作为明确授权参数后才能执行 confirm-brief。

<!-- rule-id: agent-must-pull-before-task-start -->
- 新会话/新任务开场先执行 `git pull --rebase origin main` 同步最新 `main`，再进入需求确认或迭代查看（规则见 `AGENTS.md`「多人多 Agent 并发协作」）。
