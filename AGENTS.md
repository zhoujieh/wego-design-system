# wego-app AI UXDesign 工作流

微购中文移动端原型与设计系统仓库。业务原型固定经过需求确认、设计实现、自动验证和用户验收；精简文档或守卫不得绕过这条链路。

## 沟通要求

- 必须用中文进行沟通。
- 禁止没有跟用户确认需求细节就开始改代码。
- 禁止输出一大堆过程内容和多个方案让用户进行决策，应该直接给出最佳方案让用户确认。
- 禁止输出技术专用的一些技术细节，应该输出业务场景和用户需求与用户进行沟通。
- 每次任务完成并给出结果后，询问用户是否需要总结并登记本次任务的经验教训；用户未明确同意时不得进入经验沉淀流程。

## AI 执行约束

<!-- rule-id: agent-must-read-host-code-before-asking -->
- 提问前必须查看宿主代码了解现状，基于事实提问，不得让用户替 Agent 完成现状确认。

<!-- rule-id: agent-must-use-structured-questions -->
- 向用户提问必须使用 AskUserQuestion 工具提供结构化选项，不得用纯文本泛泛而问。

## 权威入口

- 技能路由：`.codex/skills/README.md`
- 设计原则：`.codex/skills/shared/references/design-principles.md`
- 产品、设计和系统维护方法：对应技能直接引用的 `references/`

本文件只定义跨任务硬约束。按任务进入一个技能，再按需读取其引用，不预读完整工作流。

## 固定产物与边界

- `wego-app/index.html` 是唯一 App 入口和预览宿主；桌面端显示手机预览壳，移动端铺满 viewport。
- 业务场景位于 `wego-app/scenes/{中文业务场景}/`，通过稳定 kebab-case `#/route-id` 访问。
- 每个场景只直接维护 `route.json`、`scene.js` 和 `scene.css`；`route.json` 声明路由，场景通过 `window.WegoApp.registerScene` 注册，原型产物不得散落到仓库根目录。
- 路由由各场景目录下的 `route.json` 经 `scripts/build-routes.mjs` 生成；`wego-app/js/routes.js` 是生成物，**禁止手改**。
- `wego-app/lib/` 和生成的 `components.css` 禁止直接编辑。先修改 `.codex/skills/wego-design/` 权威源，再运行同步或生成脚本。
- `.trae/skills/*` 与 `.codebuddy/skills/*` 都必须是 `.codex/skills/*` 的符号链接，不作为独立副本维护。

## 三技能主链路

- 新需求或业务范围变化：`wego-product` 形成并确认 `prototype_brief`。
- 已确认范围内的页面设计与实现：`wego-design`。
- 组件、Token、Preview、UI Kit、消费规则、守卫和工作流维护：`wego-uxsystem-iterate`。

<!-- rule-id: retrospect-must-use-uxsystem-iterate-skill -->
- 复盘和经验沉淀统一由 `wego-uxsystem-iterate` 技能承担，主对话或其它技能不得直接修改正式权威源。

<!-- rule-id: requirement-input-must-create-iteration-first -->
无论用户给的是自然语言需求、参考图还是 Figma 设计稿，均视为业务需求，必须先经 `wego-product` **创建迭代并确认 `prototype_brief`**，不得跳过直接做页面。Figma 与参考图只是实现参考，不代替需求确认、不用于补造业务事实。

业务需求必须属于有效迭代。简报提交、确认、失效和明确冻结的规则以 `.codex/skills/wego-product/references/iteration-workflow.md` 为唯一权威；确认、测试、交付、提交或时间经过均不等于冻结。

已确认简报即设计授权。`wego-design` 不补造业务事实、不建立第二次设计确认门禁，也不修改设计系统本体；设计阶段只在现有设计系统能力内完成当前页面的最佳实现。组件、规范或系统问题由用户在原型验收时提出，再交给 `wego-uxsystem-iterate` 处理。页面质量以源码一致性、真实交互和浏览器视口检查为准，不要求人工合同、自证字段或设计决策镜像。

## Git、预览、临时产物与验证

- 所有开发任务默认使用独立分支，禁止直接提交 `main`。
<!-- rule-id: workflow-maintenance-enters-main-via-pr -->
- **工作流维护例外**：由 `wego-uxsystem-iterate` 技能执行的 AGENTS.md、SKILL.md、`references/` 和 `experience/` 等权威源维护，免于业务迭代与验收链路，可直接以 `main` 为目标交付；因仓库分支保护，实际通过短周期 PR 合入，必要检查通过后合并，无需用户业务验收；提交前仍需运行 `node scripts/validate-wego-design.mjs --scope=system --strict`。
<!-- rule-id: delivery-ops-must-enter-github-delivery-skill -->
- 分支、PR、预览和清理由 `wego-github-delivery` 执行；出现推送、创建或更新 PR、合并、分支清理等交付操作意图时，必须先进入该技能再执行，读过其规则文件不等于已进入技能；新建对话不等于新分支，同一交付单元必须复用同一开放 PR。
<!-- rule-id: delivery-intake-must-precede-business-workflow -->
- 收到业务页面的新建、优化、修复、验收反馈或复用请求时，进入 `wego-product` 或 `wego-design` 前必须先进入 `wego-github-delivery` 完成交付单元核对。核对必须覆盖全部 worktree、开放 PR、有效场景认领和未冻结迭代；不得只依据当前分支或 `main` 判断页面、场景或交付单元不存在。命中已有单元时必须接手其分支、worktree 和 PR；只有查无匹配且无冲突时才能新建迭代或分支。
- 只暂存本次任务的显式路径，不执行 `git add -A`，不强推已有远端分支。
<!-- rule-id: design-system-preview-delivery-uses-local-address -->
- 原型实现和自动验证完成后，默认提交并推送当前功能分支并创建或更新 PR。业务原型必须同时提供已核实的本地 HTTP 预览链接和当前 PR 独立在线预览链接，两个链接进入同一 routeId 或目标入口；设计系统组件、Token、Preview 或 UI Kit 更新只提供与改动对应的本地 HTTP 预览链接，不返回 GitHub Pages 预览链接。
- GitHub Pages 的 PR 预览只用于业务原型验收；设计系统预览不在 Pages 产物中时，直接以本地 HTTP 预览验收。`main` 的 GitHub Pages 链接只展示已经验收并合并的稳定业务版本。
<!-- rule-id: local-preview-branch-must-match-open-pr -->
- 交付未合并 PR 的本地预览前，必须核对承载服务的 worktree 当前分支与该 PR 的 head 分支一致，并确认目标预览内容包含本次改动；不一致时不得返回本地地址。等待验收期间不得切换该 worktree 到无关分支；无关任务使用短期独立 worktree。
<!-- rule-id: acceptance-preview-server-lifecycle -->
- 本地验收服务从对应 PR head 分支的 worktree 根目录启动，仅绑定 `127.0.0.1`；端口、PID、worktree、分支、PR 和目标入口记录在 `.tasks/preview-servers/`，记录不得提交。回复结束、对话结束或等待用户查看期间不得关闭仍有效的验收服务。用户明确验收通过、明确废弃任务、PR 关闭或合并、对应分支或 worktree 即将清理，或服务被同一交付单元的新服务替换时，必须停止服务并删除记录。新任务开始时清理进程失效、PR 已关闭、worktree 不存在或分支不匹配的残留服务，不得误停其它仍在等待验收的开放 PR 服务。
- 用户明确验收通过后，先停止对应本地验收服务，再重新同步最新 `main`、解决冲突并完成验证，最后合并到 `main`；不得根据“推送”或“创建 PR”推断用户已经同意合并。
- PR 合并不得绕过分支保护、必要检查或冲突处理；合并失败时停止并修复问题。
- PR 创建或更新后，GitHub Actions 将业务原型分支发布到 `previews/pr-{PR编号}/`；PR 后续更新覆盖同一预览地址，PR 关闭或合并后清理对应预览目录。设计系统变更可继续触发该动作，但不得将它作为组件或 UI Kit 的验收入口。
- 允许的短期临时目录为 `.uploads/`、`.tasks/`、`output/` 和 `.playwright-cli/`；临时产物不得提交，任务收口时清理无用文件，需长期保留的资源必须迁移到正式目录。仍在等待用户验收的本地服务记录不是无用临时产物。
- 按需执行 `node scripts/cleanup-task-artifacts.mjs clean` 清理任务临时产物；不得删除仍在等待验收的服务记录。

### 多人多 Agent 并发协作

多个人各自驱动自己的 Agent 会话、并发迭代同一仓库。Agent 之间不对话，协调只发生在仓库层面：谁的 Agent 碰了什么，由仓库状态体现，别的 Agent 来读。

- **分支与 PR**：一个可验收交付单元对应一个开放 PR 和 `feature/<owner>-<task>` 分支；新会话先检查同一交付单元的开放 PR 与场景认领，命中即复用原分支。实现和验证完成后提交并推送当前分支、创建或更新 PR：业务原型通过本地 HTTP 与独立 PR 在线双预览验收，设计系统组件、Token、Preview 或 UI Kit 只通过对应本地 HTTP 预览验收；只有用户明确验收通过后才合并到 `main`。PR 合并或关闭后先停止本地验收服务，再默认删除本地和远端分支；只有 `keep-branch` 标签可例外保留分支。
<!-- rule-id: agent-must-pull-before-task-start -->
- **开工前先拉取**：每次新会话/新任务开始前执行 `git pull --rebase origin main`，确保基于最新 `main`；首次创建 PR 前再次 rebase 到最新 `main` 并解决冲突。已有开放 PR 的分支同步 `main` 改用 merge，不用 rebase（详见 `wego-github-delivery` 交付规则）。
<!-- rule-id: open-pr-branch-divergence-must-merge-remote -->
- **开放 PR 分叉处置**：本地与同名远端分支分叉时，先核对双方新增提交，默认合并远端分支以保留协作者工作；未经用户明确同意，不得强推覆盖远端提交（详见 `wego-github-delivery` 交付规则）。
<!-- rule-id: scene-must-claim-before-edit -->
- **场景认领（强制前置）**：开工前必须在 `claims/<agent-id>.json` 认领本次负责的场景目录并记录当前 `branch`，再运行 `node scripts/validate-claims.mjs` 确认无冲突；不判断是否并发，单人开发也必须认领。认领期间场景目录由该 Agent 独占，他人不得修改。完成后把 `status` 改为 `released`/`done` 释放；CI 按 PR 分支核对所有场景目录变更均有对应认领。
- **路由生成式**：新增或修改场景路由时只编辑其目录下的 `route.json`，再运行 `node scripts/build-routes.mjs` 重新生成 `wego-app/js/routes.js`；**不要手改 `routes.js`**，CI 以 `build-routes.mjs --check` 校验一致性。
- **设计系统单写**：`wego-app/lib/` 与 `components.css` 是生成物；仅执行 `wego-uxsystem-iterate` 任务的 Agent 可改 `.codex/skills/wego-design/` 权威源并运行 `sync-wego-app-lib.mjs`，其它 Agent 只读消费，不得改源。
- 普通改动运行 `node scripts/validate-wego-design.mjs`。
- 设计系统或工作流改动运行 `node scripts/validate-wego-design.mjs --scope=system --strict`。
- 正式合并前按需运行 `node scripts/validate-wego-design.mjs --scope=full --strict`。

<!-- rule-id: local-server-must-auto-exit -->
临时浏览器验证、自动化测试或一次性检查使用的本地服务必须自动退出，任务结束前确认没有遗留监听进程。`acceptance-preview-server-lifecycle` 定义的用户验收预览服务是唯一例外：它在等待验收期间保持运行，并在验收完成、任务废弃、PR 关闭或合并、worktree 清理或服务替换时由 Agent 负责关闭。
