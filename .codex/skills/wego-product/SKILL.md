---
name: "wego-product"
description: 创建或变更业务迭代；以需求规格说明为唯一需求源形成并确认简报，最终产出可被场景技能直接消费的已确认迭代，不处理设计系统或场景实现。
---

# Wego Product

## 触发与边界

用于新页面、新场景、新流程或业务范围变化。负责确认目标、范围、入口、关键路径、原型边界、状态和数据；不决定正式组件、Token、CSS 或设计系统实现。已确认范围内的设计实现交给 `wego-design`，设计系统本体交给 `wego-uxsystem-iterate`。

## 按需读取

默认先读取 `AGENTS.md` 和 `wego-github-delivery` 的交付单元核对结果，再读取当前需求、当前活动迭代、[设计原则](../wego-design/references/design-principles.md)和[边界方法](./references/scope-and-boundaries.md)。创建或更新简报时读取[业务迭代契约](./references/iteration-workflow.md)和[简报模板](./references/brief-template.md)；执行提交、确认、失效或冻结时只读取同文件对应操作。参考图、线框图和 Figma 不用于补造业务事实。

## 输出与交接

需求阶段唯一产出是需求规格说明（文件名为 `{iteration_id}-{title}-{YYYYMMDD}.md`），按[简报模板](./references/brief-template.md)填写。写好后通过 `submit-brief` 自动解析并校验（薄档守门），进入 `in-development` 状态。

**原型循环**：立项确认（开工前的需求沟通）+ 已提交简要简报即原型授权，可交给 `wego-design` 开始实现。`in-development` 期间可随时修改需求规格说明，修改后重新 `submit-brief` 即可更新快照与验收账本（差量迁移），无需 invalidate/confirm；每轮用户反馈必须写回 spec.md 对应字段，不能只留在聊天记录。

**终局确认（与验收合一）**：用户明确表达"验收完成""验收通过""确认合格""可以合并"时进入收口：AI 先把 spec.md 补全至终版（状态、数据契约、路径闭环，只能补细节不能减内容）并重新 `submit-brief`，再逐项核对填写验收账本 `acceptance.json`，然后向用户展示终版补全 diff + 账本清单；用户过目确认后执行 `confirm-brief --user-confirmed-brief <iteration_id>`（脚本终局守门：全量校验 + 充分性 + 账本全绿），进入 `prototyping`；随后执行 `submit-prototype --user-confirmed-prototype <iteration_id>` 一步完成确认与冻结，进入 `frozen`。

反馈改变已确认业务事实时，在原迭代中失效、更新需求规格说明、重新提交并确认，不静默修改范围。

<!-- rule-id: brief-sufficiency-mandatory -->
简报必须写"足够细"：`states` 覆盖加载态、失败态、空状态并写明「进入条件 → 可感知结果」；数据必须有产生入口且禁止静态种子降级；关键路径首尾闭环。具体清单见 [边界方法](./references/scope-and-boundaries.md) 的「需求简报输出要求」，`submit-brief` 会据此守门拒绝不合规简报。

## 迭代命名规则

迭代 ID 格式：`{分类}{3位数字}[-{修订号}]`，按分类内递增且新建时仓库唯一；修订号后缀如 `-1`、`-2` 用于同迭代的重大修订。

| 分类代码 | 业务域 |
|---------|--------|
| `shop` | 相册云 |
| `bcg` | 生意云 |
| `customer` | 客户云 |
| `infras` | 基础 |

目录名和需求规格说明文件名统一为：`{iteration_id}-{title}-{YYYYMMDD}`

示例：`shop001-发布优化-20260212`

## 执行约束

<!-- rule-id: product-must-require-delivery-intake -->
- 创建、查看或更新业务迭代前，必须先完成 `wego-github-delivery` 的交付单元核对（具体执行见 `wego-github-delivery/references/task-intake.md` 启动清单）。命中现有交付单元时，先接手对应分支、worktree 和 PR；已确认范围内的验收反馈不得新建简报，按原迭代的失效与重新提交规则处理。

<!-- rule-id: confirm-brief-must-wait-affirmation -->
- `confirm-brief` 是终局确认，只能在用户明确表达"验收完成"、AI 补全终版 spec.md 并重新提交、账本核对填写完毕、用户过目补全 diff 与账本并确认后执行，必须带当前迭代 ID 作为明确授权参数；脚本终局守门（全量结构 + 充分性 + open_questions 清空 + 账本锚点一致且全部 implemented）不过即拒绝。

<!-- rule-id: experience-signal-to-inbox -->
- 经验信号自检：会话中出现用户纠正、用户表达偏好、返工、踩坑（CI 失败/守卫拦截/验收打回）时，向当前交付单元 `.tasks/experience-inbox.json` 追加一条草稿（字段与分流规则见 `wego-uxsystem-iterate/references/workflow-iteration.md`），不直接改经验权威源，无信号不动作、不打断需求流程。
