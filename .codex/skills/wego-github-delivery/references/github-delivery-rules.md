# GitHub 交付规则

## 交付单元识别

> 启动清单的完整顺序见 [`task-intake.md`](./task-intake.md)；本节只定义交付单元核对的详细规则。

业务页面请求在进入 `wego-product` 或 `wego-design` 前，必须先完成交付单元核对。核对使用 `node scripts/resolve-delivery-unit.mjs --scene {场景}`，该脚本从分类场景目录遍历全部 Git worktree、本地分支和可恢复的远端开放 PR，匹配主场景、关联场景和 `affected_scenes` 中的未冻结业务迭代。只把相对 `origin/main` 实际修改了迭代资料、受影响场景或运行时的分支视为候选，避免把从 main 继承的活动记录误认成每个 worktree 的任务。

结果只能按以下方式处理：

- `matched`：接手结果指定的分支、worktree 和可选开放 PR。已提交简报范围内的视觉、布局、组件或交互反馈留在原迭代中处理；只有改变业务事实时才回到 `wego-product` 更新简报。
- `new`：确认无匹配且无冲突后，才允许创建新迭代和新分支，并默认进入本地迭代。
- `conflict`：多个候选或无法完成必要核对。必须停止并说明阻塞原因，不得自行选择候选。

**人工兜底（必须执行）**：核对返回 `new` 后，再用 `git branch -vv` 扫一遍所有本地分支，检查是否有同场景或相关场景的悬空分支（无 worktree 但分支存在，或分支上有该场景的迭代但 worktree 已清理）。有则先确认是否为同一任务，是则恢复 worktree 而不是新建。

**本地分支归属盘点**：用 `git branch -vv` 盘点全部本地分支；凡非 `main`、非当前任务、无开放 PR、无挂起登记的分支均为悬空交付单元，先向用户报告并收口（推送创建 PR、登记挂起任务或确认废弃删除），不得静默跨会话保留。

**开放 PR 同步**：CI（`sync-open-prs.yml`）在 main 每次 push 后自动对所有开放 PR 执行 merge main；无需人工逐个检查落后情况。只需检查是否有带 `needs-sync` 标签的 PR（CI 同步冲突时会打此标签），有则先处理冲突。

先用以下信息匹配已有交付单元：

- 业务原型：已确认迭代 ID，及场景目录或 routeId；
- 设计系统或工作流：目标权威源和明确的改动范围；
- 本地预览记录：worktree、branch、target 和可空 PR 编号。

新建对话不构成交付单元。命中同一任务即复用其分支和 worktree；已有开放 PR 时继续复用原 PR。

## 分支与两阶段状态

- 新分支统一命名为 `feature/<owner>-<task>`，基于最新 `origin/main`；不再新建 `codex/*` 或 `agent/*`。
- 一个交付单元固定一个工作分支和 worktree，同一需求固定复用同一个 PR，最多只有一个开放 PR；进入自动推进后即创建该 PR 并持续更新。
<!-- rule-id: delivery-unit-must-use-independent-worktree -->
- 每个交付单元必须使用独立 worktree（`git worktree add ../<owner>-<task> -b <分支>`），不得与其它交付单元共享主 worktree；主 worktree 只保留 `main` 用于 `git pull` 同步。多个交付单元并行时必须隔离，避免 checkout 互相覆盖导致 commit 落错分支。

### 本地迭代中（自动推进，默认）

新任务、首次实现和反馈后的连续小调整默认处于本地迭代中，直到用户明确验收通过：

- 只在任务 worktree 修改，执行轻量源码检查和关键交互检查。
- 有可视目标时启动或更新本地 HTTP 预览，并返回本地与在线两个链接；无可视入口时只报告验证结果。
- 允许按一组相关改动创建 checkpoint commit，用于防丢失和回退；不得为每个细节制造提交。暂存时只添加当前需求相关的显式文件路径，不使用 `git add -A` 全量暂存，不强推已有远端分支；工作区里归属不清的游离未提交文件交由用户确认保留或还原，不得擅自打包进当前提交。
- 用户确认归属后的游离改动：全局性/仓库级内容（文档、spec、规则等）随任务一并提交推送；IDE 等本地工具产生的临时目录（如 `.workbuddy/`、`.trae-html-share-packages/`）加入 `.gitignore` 忽略，不进入仓库。任务结束时确保工作区无未提交内容。
- 完成一轮实现后**自动**推送远端分支并创建/更新对应 PR；同一需求固定复用同一个 PR，不重复创建。推送前先让本地与改动相称的验证通过（源码检查、关键交互检查，必要时 `--scope=changed`），禁止未验证直接推送；`--scope=full --strict` 完整静态验证保留到合并阶段。
- 本地预览与在线 PR 预览不视为提交授权或合并授权，仅用于沟通当前进度。
- 每次结果标明：`当前状态：本地迭代中（已推送，PR #<编号>）`；尚未推送或 PR 与预期不符时标明`当前状态：本地迭代中（未推送）`并说明原因。

### 合并授权门禁

- **推送与创建 PR 不需要用户授权**：实现完成后默认自动推送并更新 PR，把进度同步到 GitHub。
- **合并进 `main` 必须用户验收通过**：只有用户明确表达“验收通过”“确认合格”“可以合并”等清晰确认，才允许把 PR 合并进 `main`。
- “改好了”“继续”“再调整一下”“先看看”等反馈、以及 Agent 自己判断“已经完成”，都不构成合并授权。没有明确授权时必须保持 PR 开放、继续本地推进。

<!-- rule-id: workflow-maintenance-exempt-from-submission-authorization -->
**工作流维护例外**：见 `AGENTS.md`，由 `wego-uxsystem-iterate` 执行的权威源维护免明确提交授权与业务验收，通过短周期 PR 自动合并；业务原型和设计系统组件/Token/Preview/UI Kit 变更不适用。

多人或多 Agent 确有远端协调需要时，可仅推送用于暴露分支的最小协调提交，但不得创建 PR，也不得把后续本地小改动自动推送；执行前必须说明这是并发协调例外。

### 终局验收与合并阶段

用户明确表达“验收通过”“确认合格”“可以合并”后先准备终局材料，不立即合并；AI 展示终版 spec 补全 diff 与验收账本，用户确认最终材料后才连续完成固化、验证与合并：

1. 执行与范围相称的完整静态验证；业务原型连续执行 `confirm-brief` 确认简报、再 `submit-prototype --user-confirmed-prototype <iteration_id>` 一步完成确认与冻结；确认 PR 内包含全部本次改动且工作区已清零。
2. 合并前再次同步 `main` 并复验，通过后合并 PR 进 `main` 并完成收口；未获用户对最终材料的明确确认绝不合并。
3. 输出必须明确标记：`当前状态：已验收，合并中（PR #<编号>）`。

PR 已存在时，用户继续提出小问题，回到本地迭代累计修改并自动更新同一个 PR；只有用户确认终局材料才合并。

## 预览链接

### 本地迭代预览

- 本地预览从当前任务 worktree 根目录启动，仅绑定 `127.0.0.1`。
- 业务原型链接格式为 `http://127.0.0.1:<port>/wego-app/#/<routeId>`；设计系统使用与改动对应的 Preview 或 UI Kit 入口。
- 返回链接前确认 worktree 当前分支与任务分支一致，实际请求 HTTP 200，并确认目标内容包含本次改动。

<!-- rule-id: business-preview-links-must-be-paired -->
### 业务预览双链接

业务原型在本地迭代和合并阶段都必须返回两个指向同一 routeId 或目标入口、且均包含本次改动的链接：

- 本地预览：核对承载服务的 worktree 当前分支与任务分支一致，并验证 HTTP 200 和目标内容。
- 在线预览：使用 `https://<owner>.github.io/<repo>/previews/pr-<编号>/` 加与本地一致的目标 hash；必须实际请求核实 HTTP 200，并确认 `publish` 检查成功、部署 SHA 与该次 workflow 事件的 `GITHUB_SHA` 一致、目标产物包含本次改动。pull_request 事件通常使用 merge ref SHA，不得强行与 PR head SHA 比较。
- 任一链接无法核实都必须说明阻塞，不得只返回另一个链接并声称交付完整。

设计系统组件、Token、Preview 或 UI Kit 不使用 GitHub Pages 作为验收入口，即使已创建 PR，仍只交付对应本地 HTTP 预览。

<!-- rule-id: local-preview-branch-must-match-open-pr -->
## 分支与预览一致性

- 本地迭代阶段：服务 worktree 当前分支必须与任务分支一致。
- 合并阶段：除上述条件外，还必须与开放 PR 的 head 分支一致。
- 任一核对失败时不得返回本地地址。等待用户反馈期间不得切换该 worktree 到无关分支；无关任务使用独立 worktree。

<!-- rule-id: acceptance-preview-server-lifecycle -->
## 本地预览服务生命周期

本地迭代和合并阶段的预览都属于受管服务，不属于必须在单次回复结束前退出的临时验证服务：

- 在 `.tasks/preview-servers/` 记录端口、PID、worktree 绝对路径、分支、阶段（`local-iteration`）、可空 PR 编号、目标入口和启动时间；记录不得提交。
- 同一交付单元已有服务时，只有进程存活、HTTP 可访问、worktree 与分支仍匹配才可复用；不一致时先停止旧进程、删除旧记录，再启动新服务。
- 从本地迭代进入合并阶段时复用原服务并补充 PR 编号，不重复启动端口。
- 回复结束、对话结束或等待用户查看期间不得关闭仍有效的服务。
- 用户确认终局材料并进入冻结合并、明确废弃任务、任务分支或 worktree 即将清理、PR 关闭或合并，或服务被同一交付单元的新服务替换时，必须停止服务并删除记录。
- 新任务开始时扫描服务记录，清理进程已失效、worktree 已不存在、分支不匹配，或已关联且 PR 已关闭/合并的残留服务；没有 PR 但仍处于有效本地迭代的服务不得清理。
- 用户继续调整且使用同一 worktree、分支和端口时复用原服务，修改后重新请求本地 URL，确认内容已更新。

<!-- rule-id: open-pr-branch-sync-uses-merge -->
## 已开放 PR 的分支同步

- 已有开放 PR 的分支同步最新 `main` 时使用 `git merge origin/main`，不用 rebase；rebase 会改写已推送历史并导致非快进。确需 rebase 时必须先向用户说明历史重写后果并获得明确同意，再 `git push --force-with-lease`。

<!-- rule-id: open-pr-branch-divergence-must-merge-remote -->
- 开放 PR 的本地分支与同名远端分支分叉时，必须先核对双方各自新增的提交；默认 `git merge origin/<branch>` 保留远端提交、解决冲突并完成验证后正常推送。禁止以 `--force` 或 `--force-with-lease` 覆盖远端提交；仅当用户已知悉将改写远端历史并明确同意时，才可作为例外执行。

<!-- rule-id: business-preview-url-must-be-verified-before-delivery -->
- GitHub Pages 产物根即应用入口（`previews/pr-<编号>/`，无 `wego-app/` 前缀）。业务原型在本地迭代阶段即可等待并核实该地址；设计系统仍不得把 Pages 部署当作完成条件。

## 合并与清理

<!-- rule-id: merge-triggers-closeout-regardless-of-trigger -->
- **合并即触发收口（异步闭环）**：PR 合并是异步事件（网页端合并 / CI 自动合并 / 工作流维护短周期 PR 自动合并），触发者可能与本地收口执行者不是同一方。无论合并由谁触发，本地分支、worktree 与预览服务的收口都必须完成：合并发生时本地会话在场则当场收口；不在场则由后续任何任务启动时的分支巡检（`npm run branches:stale`）兜底补齐。禁止出现远端已删除、本地分支/工作树长期残留的情况。
- 业务原型、设计系统变更：用户确认终局材料后才合并。合并前同步最新 `main`、完成验证并遵守分支保护。
- 工作流维护：由 `wego-uxsystem-iterate` 判断并按 `AGENTS.md` 的例外执行，免明确提交授权与业务验收；完成严格系统验证后通过短周期 PR 进入 `main`，必要检查通过后自动合并并删除分支。
- 合并或关闭 PR 前先停止对应本地预览服务并删除服务记录；随后默认删除远端分支、本地分支和干净的关联 worktree。
- 确需保留分支时，为 PR 添加 `keep-branch` 标签；标签是唯一 PR 分支保留例外，但不会自动保留本地预览服务。
- 没有 PR 的分支可以在任务仍处于本地迭代时保留；用户明确废弃或任务确认结束且不提交时，先确认没有需要保留的改动，再停止服务并删除分支/worktree。

<!-- rule-id: delivery-closeout-checklist -->
### 交付单元收口清单

PR 合并、PR 关闭或交付单元确认废弃后，必须**逐项执行并确认**以下五步，不得遗漏任何一步：

1. **完成经验收口扫描** — 检查 `.tasks/experience-inbox.json`；有草稿先分流沉淀，无草稿明示无信号，清空后才继续。
2. **停止本地预览服务并删除服务记录** — 确认 `.tasks/preview-servers/` 中对应记录已清除，进程已退出。
3. **删除远端分支** — PR 合并时自动删除；手动关闭或废弃时执行 `git push origin --delete <branch>`。
4. **删除本地 worktree** — 执行 `git worktree remove <path>`，确认 `git worktree list` 中已无该 worktree。
5. **同步主 worktree 到最新 main** — 回到主 worktree 执行 `git pull --rebase origin main`；若主 worktree 有本地提交或未提交改动则停止，不得覆盖。

> 收口完成后可运行 `npm run worktrees:stale` 巡检是否有遗漏的孤儿 worktree；发现孤儿时用 `npm run worktrees:prune` 清理。有未提交改动的 worktree 不会被自动清理，需人工确认。

## 分支盘点

- 保留：正在本地迭代、有开放 PR，或带 `keep-branch` 标签。
- 收口：已合并、已关闭或用户明确废弃的交付单元；先停止关联本地预览服务，再删除对应分支与干净 worktree。
- 清理：无法关联到有效任务、预览记录或 PR 的分支；删除前确认没有未提交或仅本地的重要改动。

<!-- rule-id: branch-scan-uses-automated-script -->
- 巡检使用 `npm run branches:stale`（`scripts/prune-merged-branches.mjs`）自动分类：tip 是 main 祖先的 merged 分支直接收口（`branches:prune`）；上游已删除且内容与 main 一致的 gone 分支需确认内容已进 main 后收口（`branches:prune-gone`）；有 worktree / 开放 PR / 无法归属的分支保留。禁止静默跨会话保留无法归属的分支。
