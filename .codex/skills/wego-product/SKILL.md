---
name: "wego-product"
description: 创建或变更业务迭代；以 spec.md 为唯一需求源形成并确认简报，最终产出可被场景技能直接消费的已确认迭代，不处理设计系统或场景实现。
---

# Wego Product

## 触发与边界

用于新页面、新场景、新流程或业务范围变化。负责确认目标、范围、入口、关键路径、原型边界、状态和数据；不决定正式组件、Token、CSS 或设计系统实现。已确认范围内的设计实现交给 `wego-design`，设计系统本体交给 `wego-uxsystem-iterate`。

## 按需读取

默认先读取 `AGENTS.md` 和 `wego-github-delivery` 的交付单元核对结果，再读取当前需求、当前活动迭代和[边界方法](./references/scope-and-boundaries.md)。创建或更新简报时读取[业务迭代契约](./references/iteration-workflow.md)和[简报模板](./references/brief-template.md)；执行提交、确认、失效或冻结时只读取同文件对应操作。参考图、线框图和 Figma 不用于补造业务事实。

## 输出与交接

需求阶段唯一产出是 `spec.md`（需求规格说明），按[简报模板](./references/brief-template.md)填写。`spec.md` 写好后通过 `submit-brief` 自动解析并校验，进入 `in-development` 状态。

**简报开放开发**：`in-development` 期间可随时修改 `spec.md`，修改后重新 `submit-brief` 即可更新快照，无需 invalidate/confirm。

**验收统一收口**：用户说"验收完成"时，由 `wego-design` 输出 5 维度一致性校验清单（范围/入口/关键路径/状态/数据契约），用户逐项确认后执行 `confirm-brief --user-confirmed-brief <iteration_id>`，进入 `prototyping`。

反馈改变已确认业务事实时，在原迭代中失效、更新 spec.md、重新提交并确认，不静默修改范围。

<!-- rule-id: brief-sufficiency-mandatory -->
简报必须写"足够细"：`states` 覆盖加载态、失败态、空状态并写明「进入条件 → 可感知结果」；数据必须有产生入口且禁止静态种子降级；关键路径首尾闭环。具体清单见 [边界方法](./references/scope-and-boundaries.md) 的「需求简报输出要求」，`submit-brief` 会据此守门拒绝不合规简报。

## 迭代命名规则

迭代 ID 格式：`{分类}{3位数字}`，按分类内递增。

| 分类代码 | 业务域 |
|---------|--------|
| `shop` | 相册云 |
| `bcg` | 生意云 |
| `customer` | 客户云 |
| `infras` | 基础 |

目录名和 spec.md 文件名统一为：`{iteration_id}-{title}-{YYYYMMDD}`

示例：`shop001-发布优化-20260212`

## 执行约束

<!-- rule-id: product-must-require-delivery-intake -->
- 创建、查看或更新业务迭代前，必须先完成 `wego-github-delivery` 的交付单元核对。命中现有交付单元时，先接手对应分支、worktree 和 PR；已确认范围内的验收反馈不得新建简报，按原迭代的失效与重新提交规则处理。

<!-- rule-id: confirm-brief-must-wait-affirmation -->
- `confirm-brief` 只能在用户明确表达"验收完成"且 5 维度一致性校验清单逐项确认后执行，必须带当前迭代 ID 作为明确授权参数。

<!-- rule-id: agent-must-pull-before-task-start -->
- 新会话/新任务开场先执行 `git pull --rebase origin main` 同步最新 `main`，再进入需求确认或迭代查看（交付细节见 `wego-github-delivery`）。
