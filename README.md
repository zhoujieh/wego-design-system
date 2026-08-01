# 微购 App 原型与设计系统

由 AI 工作流驱动的中文移动端原型仓库。你只要**用自然语言描述业务需求**，仓库内置的 AI 技能会完成需求确认、页面设计、交互实现和验证，产出可在手机预览壳里操作的交互原型。

[查看正式线上原型](https://zhoujieh.github.io/wego-design-system/)

---

## 协作者：把下面这段直接丢给你的 AI，让它全包

你是这个仓库（wego-design-system）的 GitHub 协作者。请帮我把本地环境全部准备好，让我能开始给仓库里的 AI 技能发业务需求、做交互原型。**除了「接受 GitHub 协作者邀请邮件」这一步必须我自己点邮件接受之外，其余全部由你完成**，我不需要自己敲命令。

请按下面顺序做，每步遇到阻塞就停下来告诉我，不要跳过：

1. 检查环境：确认已安装 Git 和 Node.js（要求 >=18，建议 20+）。缺哪个就告诉我具体安装方式（不要自动改系统配置，除非我同意）。
2. 复制仓库：如果本地还没有这个仓库，执行 `git clone https://github.com/zhoujieh/wego-design-system.git` 并 `cd` 进去；如果已有，执行 `git pull --rebase origin main` 更新到最新 main。
3. 安装依赖：执行 `npm install`（仓库唯一的开发依赖是 playwright）。
4. 安装浏览器：执行 `npx playwright install`，确保自动化验证能跑。如果已装过就跳过。
5. 校验：跑一次 `node scripts/validate-wego-design.mjs --scope=changed --strict`，确认环境没问题；有任何报错把关键信息贴给我。
6. 预览：帮我起一个本地预览服务（`python3 -m http.server 8080`），并告诉我访问 `http://localhost:8080/wego-app/`。提醒我看完按 `Ctrl+C` 停止，避免遗留进程；也可以直接告诉我双击打开 `wego-app/index.html` 的方式。
7. 准备就绪后，告诉我「环境已就绪，可以开始发业务需求了」，并简要说明：我接下来只要用自然语言描述业务目标（入口、用户任务、主要操作、可见结果和状态），仓库的 AI 技能就会走「澄清需求 → 我确认简报 → 设计实现 → 自动验证 → PR 预览验收 → 验收通过后合并」的链路。后续所有需求也由你代我按这条链路推进。

注意：不要改动 `wego-app/lib/` 和 `components.css`（设计系统只读消费）；不要直接提交 main；不要执行 `git add -A`。

---

## 给 AI 的需求怎么写更好（准备就绪后参考）

说清这几点，AI 就能直接开工，不用反复问你：

- **入口在哪**（从哪个页面进来）
- **用户首要任务是什么**
- **主要操作**（点什么、选什么）
- **能看到的结果和必要状态**（成功 / 失败 / 空态等）

参考图、线框图、Figma 只作为视觉方向，**不能替代你确认过的需求简报**。

---

## 多人协作要点（给想知道的人）

- 各人开 `feature/<你>-<场景>` 分支，不要直接提交 `main`。
- 每次开工前先 `git pull --rebase origin main` 基于最新代码。
- 开工前在 `claims/<你>.json` 认领场景并跑 `node scripts/validate-claims.mjs`，避免两人改同一场景。
- 实现和验证完成后提交并推送当前分支，创建或更新 PR。
- 每个 PR 自动获得独立验收链接：`https://zhoujieh.github.io/wego-design-system/previews/pr-{PR编号}/`。
- PR 更新后原验收链接自动更新；用户明确验收通过后才合并到 `main`。
- 正式线上原型只展示已经验收并合并的稳定内容。
- 完整协作约定见 [`AGENTS.md`](AGENTS.md)；脚本与验证命令见 [`scripts/README.md`](scripts/README.md)。

> 普通设计任务把设计系统当**只读**用，不要改 `wego-app/lib/` 和 `components.css`；只有做设计系统维护任务才改源。
