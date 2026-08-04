# GitHub 交付规则

## 交付单元识别

业务页面请求在进入 `wego-product` 或 `wego-design` 前，必须先完成交付单元核对。核对必须遍历全部 Git worktree，而不是只读取当前目录或 `main`，并同时读取：

- 开放 PR 的 head 分支；
- 每个 worktree 的有效场景认领；
- 每个 worktree 中未冻结的业务迭代。

使用 `node scripts/resolve-delivery-unit.mjs --scene {场景}` 输出核对结果；routeId 已知时同步传入 `--route-id {routeId}`。结果只能按以下方式处理：

- `matched`：接手结果指定的分支、worktree 和开放 PR。已确认简报范围内的视觉、布局、组件或交互反馈留在原迭代中处理并重新提交验收；只有改变业务事实时才回到 `wego-product` 更新简报。
- `new`：确认无匹配且无冲突后，才允许创建新迭代和新分支。
- `conflict`：多个候选、认领与 PR 不一致，或无法完成必要核对。必须停止并说明阻塞原因，不得自行选择候选。

先用以下信息匹配已有开放 PR，命中同一交付单元即复用其分支：

- 业务原型：已确认迭代 ID，及场景目录或 routeId；
- 设计系统或工作流：PR 标题、目标权威源和明确的改动范围；
- 场景认领：认领中的 `branch`、`scene` 和 `routeId`。

新建对话不构成交付单元。查无开放 PR 和活跃认领，才创建新分支。

## 分支与 PR

- 新分支统一命名为 `feature/<owner>-<task>`，基于最新 `origin/main`；不再新建 `codex/*` 或 `agent/*`。
- 一个交付单元只能有一个开放 PR。接手任务必须 checkout 该 PR 的远端分支并更新原 PR。
- 场景改动先认领，并在认领中记录当前分支；完成、废弃或关闭对应 PR 时释放认领。
- 业务原型的 PR 预览用于当前任务验收；合并或关闭后由 Pages 工作流删除预览。设计系统组件、Token、Preview 或 UI Kit 的视觉验收使用对应本地预览文件的绝对路径，不返回或等待 GitHub Pages 预览。
<!-- rule-id: local-preview-branch-must-match-open-pr -->
- 交付未合并设计系统 PR 的本地预览时，先读取该 PR 的 head 分支并核对主工作目录当前分支一致，再核对预览文件存在且已包含本次改动；任一核对失败时不得给出本地地址。交付后保留主工作目录在该预览分支；处理无关任务时使用短期独立 worktree，避免本地预览因分支切换而回退。
<!-- rule-id: open-pr-branch-sync-uses-merge -->
- 已有开放 PR 的分支同步最新 `main` 时使用 `git merge origin/main`，不用 rebase；rebase 会改写已推送历史并导致非快进。确需 rebase 时必须先向用户说明历史重写后果并获得明确同意，再 `git push --force-with-lease`。
<!-- rule-id: open-pr-branch-divergence-must-merge-remote -->
- 开放 PR 的本地分支与同名远端分支分叉时，必须先核对双方各自新增的提交；默认 `git merge origin/<branch>` 保留远端提交、解决冲突并完成验证后正常推送。禁止以 `--force` 或 `--force-with-lease` 覆盖远端提交；仅当用户已知悉将改写远端历史并明确同意时，才可作为例外执行。
<!-- rule-id: business-preview-url-must-be-verified-before-delivery -->
- 交付业务原型 PR 预览链接前必须实际请求核实再发给用户：Pages 产物根即应用入口（`previews/pr-<编号>/`，无 `wego-app/` 前缀），确认 HTTP 200 且目标产物已包含本次改动；禁止凭路径规律拼接未核实的链接。设计系统组件、Token、Preview 或 UI Kit 不等待此步骤，改为返回与改动一致的本地预览绝对路径。

## 合并与清理

- 业务原型、设计系统变更：用户明确验收通过后才合并。合并前 rebase 最新 `main`、完成验证并遵守分支保护。
- 工作流维护：由 `wego-uxsystem-iterate` 判断并按 `AGENTS.md` 的例外执行，完成严格系统验证后才可直接进入 `main`。
- 合并或关闭 PR 后，默认删除远端分支、本地分支和干净的关联 worktree。
- 确需保留时，为 PR 添加 `keep-branch` 标签；标签是唯一保留例外，任务结束后应移除并收口。
- 没有 PR 的分支只允许处于当前正在交付的任务中；交付结束时创建 PR 或删除。

## 分支盘点

- 保留：有开放 PR、正在交付，或带 `keep-branch` 标签。
- 收口：已合并或已关闭 PR 的分支；删除远端、本地和干净 worktree。
- 清理：无 PR 且不属于当前交付的分支；删除前确认没有未提交改动。
