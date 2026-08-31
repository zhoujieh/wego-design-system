# wego-app AI UXDesign 工作流

微购中文移动端原型与设计系统仓库。业务原型固定经过需求确认、本地设计迭代、自动验证和用户验收；精简文档或守卫不得绕过这条链路。

## 沟通与执行约束

- 全程用中文沟通，与用户沟通用业务场景与需求语言，不展开实现层面的技术细节。
- 每项任务只给出一个推荐方案，直接请用户确认；不列举多方案让用户选择。

<!-- rule-id: experience-auto-sediment-on-signals -->
- 遇到用户纠正、返工、踩坑时，按 wego-uxsystem-iterate 经验沉淀流程自动沉淀并告知用户；普通代码错误、需求临时变化、单次视觉微调、单场景特例不沉淀。

<!-- rule-id: agent-must-read-host-code-before-asking -->
- 接收任务后不立即执行：先结合宿主代码现状理清本次要修改的内容与范围，与用户确认（须得到明确肯定）后再开始；禁止未经确认需求细节就改代码。

## 权威入口

- 技能路由：`.codex/skills/README.md`
- 设计原则：`.codex/skills/wego-design/references/design-principles.md`
- 各技能方法：对应技能 `references/`
- 经验视图：`.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md`
- 本文件只定义跨任务硬约束，不预读完整工作流。

<!-- rule-id: agent-must-read-experience-before-task -->
- 处理 wego 任务前，会话前置读取 `EXPERIENCE.md`，了解历史经验与踩坑教训。

<!-- rule-id: experience-is-ai-curated -->
- `EXPERIENCE.md` 由 `wego-uxsystem-iterate` 技能内的 AI 基于 `evidence.json` 事实推理维护，用 `§` 分隔多条自然语言经验；每条经验必须追溯到 `evidence.json` 中的事实事件，表述不得与事实矛盾；禁止脚本机械化生成内容。`node scripts/refine-experience.mjs` 仅做事实一致性校验和格式检查，不生成内容。

## 固定产物与边界

- `wego-app/index.html` 是唯一 App 入口；业务场景位于 `wego-app/scenes/{shop|bcg|customer|infras}/{中文业务场景}/`，通过 `#/route-id` 访问；场景产物不得散落到仓库根目录。
- `wego-app/js/routes.js`、`wego-app/lib/`、`components.css` 是生成物，禁止直接编辑；权威源在 `.codex/skills/wego-design/`，仅 `wego-uxsystem-iterate` 可改。
- `.trae/skills/*` 与 `.codebuddy/skills/*` 必须以逐项符号链接指向 `.codex/skills/*`，或以整目录符号链接指向 `.codex/skills`；不得保留副本。

## 三技能主链路

- 新需求或业务范围变化：`wego-product` 形成并确认 `prototype_brief`。
- 已确认范围内的页面设计与实现：`wego-design`。
- 组件、Token、Preview、UI Kit、消费规则、守卫和工作流维护：`wego-uxsystem-iterate`。

<!-- rule-id: retrospect-must-use-uxsystem-iterate-skill -->
- 复盘和经验沉淀统一由 `wego-uxsystem-iterate` 承担。

<!-- rule-id: requirement-input-must-create-iteration-first -->
- 业务需求（自然语言、参考图、Figma）必须先经 `wego-product` 创建迭代并确认 `prototype_brief`，不得跳过直接做页面；简报状态规则以 `wego-product/references/iteration-workflow.md` 为唯一权威。
- 已确认简报即设计授权；`wego-design` 不补造业务事实、不改设计系统本体；验收以源码一致性、真实交互和浏览器视口为准；组件/规范问题验收时提出交 `wego-uxsystem-iterate`。

## Git 与交付硬约束

- 禁止直接提交 `main`，所有任务默认使用独立分支。

<!-- rule-id: task-intake-must-follow-checklist -->
- 新任务开工前必须按 `wego-github-delivery/references/task-intake.md` 执行启动清单；该清单统一定义会话上下文判断、完整/轻量启动分流、交付单元核对、需求确认和工作环境就绪的顺序，各技能不得自行另起启动步骤。

<!-- rule-id: delivery-unit-must-use-independent-worktree -->
- 每个交付单元必须使用独立 worktree（`git worktree add ../<owner>-<task> -b <分支>`），不得与其它交付单元共享主 worktree；主 worktree 只保留 `main` 用于 `git pull` 同步。

<!-- rule-id: workflow-maintenance-enters-main-via-pr -->
- **工作流维护例外**：`wego-uxsystem-iterate` 权威源免业务验收和提交授权，验证通过直接走短周期 PR 合入 `main`；业务原型和设计系统组件/Token/Preview/UI Kit 变更不适用。

<!-- rule-id: delivery-ops-must-enter-github-delivery-skill -->
- 分支、PR、预览、合并和清理由 `wego-github-delivery` 技能承担。

<!-- rule-id: delivery-intake-must-precede-business-workflow -->
- 业务页面请求进入 `wego-product` 或 `wego-design` 前必须先经 `wego-github-delivery` 完成交付单元核对。

<!-- rule-id: agent-must-pull-before-task-start -->
- 开工前先 `git pull --rebase origin main` 同步最新 `main`；具体执行时机见启动清单（完整启动时执行，轻量启动时按需）。

<!-- rule-id: open-pr-must-sync-main-when-behind -->
- 接手交付单元或更新开放 PR 前，其分支落后 `main` 时先 merge 最新 `main` 并解决冲突再继续；等待合并的 PR 同样适用，闲置不是豁免理由。

<!-- rule-id: session-end-must-clean-worktree -->
- 回复结束、任务暂停或会话结束时，任务 worktree 不得遗留未提交改动：成组改动提交 checkpoint，零散改动还原或登记任务记录；禁止未提交改动跨会话存活。

<!-- rule-id: merge-must-complete-closeout -->
- PR 合并后必须完成本地收口：远端分支删除后，本地分支、worktree 与预览服务记录一并清理。合并发生在本地会话之外（网页端合并 / CI 自动合并 / 工作流维护短周期 PR 自动合并）时，由后续任务启动时的分支巡检兜底补齐，禁止远端已删除、本地长期残留。

<!-- rule-id: local-server-must-auto-exit -->
- 临时验证用本地服务必须自动退出；本地迭代与验收预览服务是唯一例外。
