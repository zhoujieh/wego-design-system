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

## 分支、PR 与预览

- 新分支统一命名为 `feature/<owner>-<task>`，基于最新 `origin/main`；不再新建 `codex/*` 或 `agent/*`。
- 一个交付单元只能有一个开放 PR。接手任务必须 checkout 该 PR 的远端分支并更新原 PR。
- 场景改动先认领，并在认领中记录当前分支；完成、废弃或关闭对应 PR 时释放认领。
- 业务原型交付时必须同时返回本地与在线两个验收链接；设计系统组件、Token、Preview 或 UI Kit 的视觉验收仍只返回本地 HTTP 预览链接，不返回或等待 GitHub Pages 预览。

<!-- rule-id: business-preview-links-must-be-paired -->
- 业务原型的两个链接必须指向本次任务对应的同一 routeId 或目标入口，并包含本次改动：
  - 本地预览：先读取 PR head 分支，确认承载服务的 worktree 当前分支一致，再确认 `wego-app/index.html`、目标路由和场景产物存在；从该 worktree 根目录启动仅绑定 `127.0.0.1` 的本地 HTTP 服务，链接格式为 `http://127.0.0.1:<port>/wego-app/#/<routeId>`。
  - 在线预览：使用 `https://<owner>.github.io/<repo>/previews/pr-<编号>/` 加与本地一致的目标 hash；必须实际请求核实 HTTP 200、部署 SHA 与当前 PR 提交一致，并确认目标产物包含本次改动。
  - 任一链接无法核实都必须说明阻塞，不得只返回另一个链接并声称交付完整。

<!-- rule-id: local-preview-branch-must-match-open-pr -->
- 交付任何未合并 PR 的本地预览时，先读取该 PR 的 head 分支并核对承载服务的 worktree 当前分支一致，再核对预览文件和目标入口已包含本次改动；任一核对失败时不得给出本地地址。等待验收期间不得切换该 worktree 到无关分支；无关任务使用短期独立 worktree。

<!-- rule-id: acceptance-preview-server-lifecycle -->
- 本地验收服务属于等待用户验收期间的受管服务，不属于必须在单次回复结束前退出的临时验证服务：
  - 启动时仅绑定 `127.0.0.1`，并在 `.tasks/preview-servers/` 记录端口、PID、worktree 绝对路径、分支、PR、目标入口和启动时间；记录不得提交。
  - 同一交付单元已有服务时，只有进程存活、HTTP 可访问、worktree 与分支仍匹配才可复用；不一致时先停止旧进程、删除旧记录，再启动新服务。
  - 回复结束、对话结束或等待用户查看期间不得关闭仍有效的验收服务。
  - 用户明确验收通过、明确废弃任务、PR 关闭或合并、对应分支或 worktree 即将清理，或服务被同一交付单元的新服务替换时，必须停止服务并删除记录。
  - 新任务开始时扫描服务记录，清理进程已失效、PR 已关闭、worktree 已不存在或分支不匹配的残留服务；不得误停其它仍在等待验收的开放 PR 服务。
  - 用户提出验收调整且继续使用同一 worktree、分支和端口时复用原服务，完成修改后重新请求本地 URL，确认内容已更新。

<!-- rule-id: open-pr-branch-sync-uses-merge -->
- 已有开放 PR 的分支同步最新 `main` 时使用 `git merge origin/main`，不用 rebase；rebase 会改写已推送历史并导致非快进。确需 rebase 时必须先向用户说明历史重写后果并获得明确同意，再 `git push --force-with-lease`。

<!-- rule-id: open-pr-branch-divergence-must-merge-remote -->
- 开放 PR 的本地分支与同名远端分支分叉时，必须先核对双方各自新增的提交；默认 `git merge origin/<branch>` 保留远端提交、解决冲突并完成验证后正常推送。禁止以 `--force` 或 `--force-with-lease` 覆盖远端提交；仅当用户已知悉将改写远端历史并明确同意时，才可作为例外执行。

<!-- rule-id: business-preview-url-must-be-verified-before-delivery -->
- GitHub Pages 产物根即应用入口（`previews/pr-<编号>/`，无 `wego-app/` 前缀）。交付在线预览前必须实际请求核实，禁止只凭路径规律拼接未核实的链接。设计系统组件、Token、Preview 或 UI Kit 不等待此步骤，仍只返回与改动一致并已核实的本地 HTTP 预览链接。

## 合并与清理

- 业务原型、设计系统变更：用户明确验收通过后才合并。合并前 rebase 最新 `main`、完成验证并遵守分支保护。
- 工作流维护：由 `wego-uxsystem-iterate` 判断并按 `AGENTS.md` 的例外执行，完成严格系统验证后才可直接进入 `main`。
- 合并或关闭 PR 前先停止对应本地验收服务并删除服务记录；随后默认删除远端分支、本地分支和干净的关联 worktree。
- 确需保留分支时，为 PR 添加 `keep-branch` 标签；标签是唯一分支保留例外，但不会自动保留本地预览服务。
- 没有 PR 的分支只允许处于当前正在交付的任务中；交付结束时创建 PR 或删除。

## 分支盘点

- 保留：有开放 PR、正在交付，或带 `keep-branch` 标签。
- 收口：已合并或已关闭 PR 的分支；先停止关联本地预览服务，再删除远端、本地和干净 worktree。
- 清理：无 PR 且不属于当前交付的分支；删除前确认没有未提交改动，并清理其失效的本地预览服务记录。
