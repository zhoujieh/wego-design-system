---
name: wego-github-delivery
description: 负责微购仓库的分支、PR、本地迭代预览、合并和收口清理。用户要求新建或接手 Codex 任务、创建或更新 PR、合并或关闭 PR、查询分支、整理遗留分支时使用；不判断业务需求、页面设计或设计系统内容。
---

# 微购 GitHub 交付

## 核心原则

- 会话只是执行入口，不是分支。一个交付单元固定复用一个工作分支和 worktree，最多只有一个开放 PR。

## 开始交付

新任务开工前必须按 [`references/task-intake.md`](./references/task-intake.md) 执行启动清单，包含会话上下文判断、完整/轻量启动分流、交付单元核对、需求确认和工作环境就绪。本技能不再单独定义启动步骤。

<!-- rule-id: delivery-unit-must-use-independent-worktree -->
- 每个交付单元必须使用独立 worktree：开工前用 `git worktree add ../<owner>-<task> -b <分支>` 创建独立目录并在其中操作，不得与其它交付单元共享主 worktree；主 worktree 只保留 `main` 用于 `git pull` 同步。多个交付单元并行时尤其必须隔离，避免 checkout 互相覆盖导致 commit 落错分支。

## 两阶段状态

### 本地迭代中（自动推进，默认）

- 新任务、首次实现和后续小问题调整默认停留在本地迭代中，直到用户明确验收通过。
- 允许修改、轻量源码检查、关键交互检查和按一组相关改动创建 checkpoint commit。完成一轮实现后**自动**推送远端分支并创建/更新对应 PR（同一需求固定复用同一个 PR）；推送前先让与改动相称的本地验证通过（源码检查、关键交互检查，必要时 `--scope=changed`），禁止未验证直接 `git push`。
- 有可视内容时，从当前任务 worktree 启动或复用本地 HTTP 预览；**每次推送 PR 后必须返回在线预览链接（不只本地链接）**，无可视入口的工作流或文档维护直接报告验证结果。
- 每次结果必须标明：`当前状态：本地迭代中（已推送，PR #<编号>）`；尚未推送时标明`当前状态：本地迭代中（未推送）`。

### 终局验收与合并阶段

用户明确表达"验收完成""验收通过""确认合格""可以合并"后先进入终局验收准备，由 `wego-design` 补全终版 spec.md、核对填写验收账本并展示补全 diff 与账本；这一步不直接合并。用户确认最终材料后，才获得冻结与合并授权并连续完成：

1. 由 `wego-design` 连续执行迭代收口：
   - `confirm-brief --user-confirmed-brief <iteration_id>`（终局确认，脚本守门全量结构 + 充分性 + 账本全绿，进入 prototyping）
   - `submit-prototype --user-confirmed-prototype <iteration_id>`（账本复验 + 场景验证 + 固化指纹 + 确认 + 冻结，一步到 frozen）
2. 运行与范围相称的完整静态验证，确认 PR 内包含全部本次改动且工作区已清零：
   - `node scripts/validate-wego-design.mjs --scope=full --strict`（场景 Token 合规、源/副本同步、原型指纹、完整守门）
   - `node scripts/build-routes.mjs --check`（路由生成一致性）
   - `node scripts/sync-wego-app-lib.mjs --check`（设计系统 lib 副本与源一致）
   - 任意一项失败必须先修复再推送；未跑验证或验证未过直接推送视为跳过门禁
3. 合并前再次同步 `main` 并复验，同时兜底确认 `.tasks/experience-inbox.json` 已完成经验收口扫描（空则已明示无信号），通过后合并 PR 进 `main` 并完成收口；未获用户对最终材料的明确确认绝不合并。
4. 每次结果标明：`当前状态：已验收，合并中（PR #<编号>）`。

PR 已存在时，用户继续提出小问题仍先回到本地迭代，累计完成一轮后自动更新同一个 PR；只有用户确认终局材料才合并。

## 会话收尾

回复结束、任务暂停或会话结束时：

- 任务 worktree 不得遗留未提交改动：成组改动提交 checkpoint commit，零散改动还原或登记到任务记录；未提交改动不得跨会话存活。
- 清理或删除任务 worktree 前，必须确认 `.tasks/experience-inbox.json` 已扫描处理（沉淀或明示无信号后清空），未扫描不得清理 worktree；会话中断漏扫由 task-intake 启动巡检兜底。
- 当前交付单元已提交 checkpoint 但尚未推送创建 PR 时，必须在会话结束前推送创建 PR 进入可见交付状态，或显式登记到任务记录为挂起；已实现的改动不得以本地悬空分支形式静默跨会话保留。

## 预览服务

- **启动与复用**：从当前交付单元 worktree 根目录启动，仅绑定 `127.0.0.1`；端口、PID、worktree、分支、阶段、可空 PR 编号和目标入口记录在 `.tasks/preview-servers/`（记录不得提交）。同一交付单元已有可用且信息一致的服务时复用，否则先停止旧服务再启动新服务；进入合并阶段后更新原记录的阶段和 PR 编号，不为同一任务重复启动。
- **交付前校验**：本地迭代阶段核对服务 worktree 当前分支与任务分支一致；合并阶段还必须核对与 PR head 分支一致。交付链接前实际请求确认 HTTP 200 且目标入口包含本次改动。**在线链接返回必须等部署完成**：推送后先确认 `gh pr checks <N>` 的 publish 通过，再 curl 校验 `https://zhoujieh.github.io/wego-design-system/previews/pr-<N>/` 部署产物；`.wego-deployment-sha` 应与该次 workflow 事件的 `GITHUB_SHA` 一致，pull_request 事件通常是 merge ref SHA，不能强行与 PR head SHA 比较。入口资源和目标内容核实后才返回在线链接；在线部署通常需数分钟，未就绪时明确告知等待状态并补齐，不得只交付本地链接。
- **停止时机**：服务在回复结束、对话结束、终局材料准备和等待用户确认期间继续保留；只在用户确认最终材料并进入冻结合并、明确废弃任务、任务分支/worktree 即将清理、PR 关闭或合并，或服务被同一交付单元的新服务替换时停止并删除记录。

## 合并与收口

- 业务原型和设计系统变更只有在用户确认终局材料后才能合并；合并前再次同步 `main` 并完成相应验证。
- 工作流权威源维护例外见 `AGENTS.md`，由 `wego-uxsystem-iterate` 执行，免业务验收与明确提交授权，通过短周期 PR 自动合并并按下方收口规则完成完整清理；业务原型和设计系统组件/Token/Preview/UI Kit 变更不适用。
- PR 合并或关闭后，先停止对应本地预览服务并删除记录，再删除对应本地与远端分支及干净的关联 worktree；只有 PR 带 `keep-branch` 标签时才保留分支，但预览服务仍默认关闭。
- 合并冲突涉及生成物（`wego-app/js/routes.js`、`wego-app/lib/`、`components.css`）时，不得手工编辑冲突标记：先取任一侧版本，运行对应生成脚本（`build-routes.mjs` / `sync-wego-app-lib.mjs`）重新生成后提交。
- 没有 PR 的工作分支允许在本地迭代期间保持；用户明确废弃任务或确认不再继续时，停止服务并删除分支/worktree。不得因单次回复结束而强制创建 PR 或删除仍在继续的任务。

## 边界

- 不替代 `wego-product`、`wego-design` 或 `wego-uxsystem-iterate` 对内容范围的判断。
- 不把本地预览、完成修改、通过检查、创建 checkpoint commit 或用户查看页面视为提交授权或合并授权。
- 不删除 `main`、当前正在使用的分支、带 `keep-branch` 标签的分支，或有未提交改动的 worktree。
- 不停止状态仍为本地迭代或合并阶段、且与记录 worktree 和分支一致的本地预览服务。
- 分支盘点只输出并执行明确的保留、收口或清理动作；无法归属的分支先关联到交付单元或关闭，不再长期保留为"待观察"。
