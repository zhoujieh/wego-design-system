# GitHub 交付规则独立化计划

更新时间：2026-08-03

## 背景

当前仓库同时存在业务原型、设计系统、工作流维护和多人多 AI 协作，GitHub 分支与 PR 规则散落在 `AGENTS.md` 和工作流描述中，容易让用户误解为“一个 AI 会话就是一个分支”。近期分支中也同时出现 `feature/*`、`codex/*`、`agent/*` 等命名，进一步增加了理解成本。

本计划用于整理 GitHub 交付规则的最终优化方向。计划文档本身不直接改变正式规则；正式落地时仍由 `wego-uxsystem-iterate` 维护权威规则，并完成验证。

## 核心结论

- 会话不等于分支。
- 业务原型和设计系统交付走分支与 PR。
- 工作流规则和经验沉淀由 `wego-uxsystem-iterate` 维护，可直接进入 `main`。
- GitHub 操作规则独立为 `wego-github-delivery` 技能维护和执行。
- 已合并或已关闭 PR 的本地和远端分支默认必须清理；只有明确的 `keep-branch` 例外可以保留。

## 技能职责

### wego-github-delivery

新增轻量交付技能，只负责 GitHub 操作，不参与业务、设计和工作流内容判断。

触发范围：

- 检查当前分支和 open PR。
- 创建、复用、推送分支。
- 创建或更新 PR。
- 提供 PR 预览验收入口。
- 合并或关闭 PR。
- 删除已无用途的本地和远端分支。
- 盘点分支并执行保留、收口或清理。

关键规则：

- 一个可验收交付单元对应一个 PR。
- 新会话接旧任务时，先按迭代 ID 与场景或明确改动范围查找同一任务的 open PR；有则继续原分支，不新开。
- PR 合并或关闭后，默认删除对应本地和远端分支；只有带 `keep-branch` 标签的 PR 可以例外保留。
- 新分支命名统一使用 `feature/<owner>-<task>`，不再新建 `codex/*`、`agent/*` 等混用分支。

### wego-uxsystem-iterate

继续负责工作流规则、经验沉淀和设计系统维护。

需要同步增加的职责：

- 维护 GitHub 交付规则的规则内容。
- 当分支、PR、预览、合并、清理等问题来自规则缺口时，由本技能修订规则。
- 如果修订 GitHub 交付规则，必须同步更新 `wego-github-delivery` 的规则文档。
- 业务场景中产生的经验仍进入本技能的经验候选池，不夹带在业务 PR 中。

### AGENTS.md

只保留跨任务最高层规则，不继续堆放 GitHub 操作细节。

保留口径：

- 技能路由入口。
- 会话不等于分支。
- 业务和设计系统交付走 PR。
- 工作流和经验沉淀由 `wego-uxsystem-iterate` 维护。
- 已合并或已关闭 PR 的分支默认必须删除。

## 场景规则

### 新业务页面

`wego-product` 确认需求，`wego-design` 完成页面实现，`wego-github-delivery` 负责分支、PR、预览和合并后的分支清理。

### 设计系统能力变更

`wego-uxsystem-iterate` 负责能力规则、权威源和验证；`wego-github-delivery` 负责 PR 交付和分支清理。

### 工作流规则维护

由 `wego-uxsystem-iterate` 直接维护规则，可直接进入 `main`。如果改到 GitHub 交付规则，必须同步 `wego-github-delivery`。

### 业务场景沉淀经验

业务 PR 只承载用户验收的原型结果，不夹带经验候选池。用户明确要求总结、登记或沉淀时，由 `wego-uxsystem-iterate` 登记到 `.codex/skills/wego-uxsystem-iterate/experience/candidates.json`。

默认只登记为观察候选；达到阈值或用户明确要求升级时，才修改正式规则。

### 新 AI 接手旧任务

先检查 open PR 状态。有同一任务 PR 时继续原分支；没有同一任务 PR 时才新建规范分支。

### 任务废弃或 PR 关闭

关闭 PR，并删除远端分支、本地分支和干净的关联 worktree；只有 `keep-branch` 标签可以例外保留。

### 分支列表混乱

`wego-github-delivery` 输出清理清单：

- 保留：仍有 open PR、正在交付或带 `keep-branch` 标签的分支。
- 删除：已合并、已关闭，或无 PR 且不属于当前交付的分支。

## 落地文件

正式执行时建议新增或更新：

- `.codex/skills/wego-github-delivery/SKILL.md`
- `.codex/skills/wego-github-delivery/references/github-delivery-rules.md`
- `.codex/skills/wego-github-delivery/agents/openai.yaml`
- `.codex/skills/README.md`
- `.codex/skills/wego-uxsystem-iterate/SKILL.md`
- `.codex/skills/wego-uxsystem-iterate/references/sync-matrix.md`
- `AGENTS.md`
- `scripts/validate-wego-design-core.mjs`
- `.trae/skills/*` 与 `.codebuddy/skills/*` 的符号链接

其中 `scripts/validate-wego-design-core.mjs` 需要把 `wego-github-delivery` 的入口和直接规则纳入检查；它是交付技能，不改变三条业务主链。

## 验证

正式落地后运行：

```bash
node scripts/validate-wego-design.mjs --scope=system --strict
```

如果使用技能创建脚本生成新技能，还需要按技能创建规范运行对应 quick validate。

验证重点：

- `AGENTS.md` 不再承载大量 GitHub 操作细节。
- `wego-uxsystem-iterate` 明确负责 GitHub 规则维护。
- `wego-github-delivery` 明确负责 GitHub 操作执行。
- 新建对话会复用同一交付单元的开放 PR，而不会重复建分支。
- PR 合并或关闭后默认删除本地和远端分支，`keep-branch` 为唯一例外。
- 业务 PR 不夹带经验候选池。
- Trae 与 CodeBuddy 均完整复用 `.codex/skills`，不存在独立技能副本。

## 当前仓库收口建议

- `feature/codex-my-tab`：对应 PR #22，保留到用户验收结束。
- `feature/codex-workflow-core`：对应 PR #19，完成工作流验证后收口。
- `codex/uxsystem-tab-visual-contract`：迁移为规范分支并创建 PR，避免无 PR 分支悬空。
- 所有已合并分支在本次落地时清理；本节之后由交付技能实时盘点，不再维护静态清单。

## 默认假设

- 用户不直接管理 Git 分支。
- AI 必须负责分支创建、复用、推送、合并后清理。
- GitHub 技能是交付操作技能，不是第四条业务主链路。
- 工作流维护仍由 `wego-uxsystem-iterate` 统一判断和修订。
