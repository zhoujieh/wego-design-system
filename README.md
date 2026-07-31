# 微购 App 原型与设计系统

由 AI 工作流驱动的中文移动端原型仓库。你只要**用自然语言描述业务需求**，仓库内置的 AI 技能会完成需求确认、页面设计、交互实现和验证，产出可在手机预览壳里操作的交互原型。

[查看线上原型](https://zhoujieh.github.io/wego-design-system/)

---

## 协作者：三步开始

> 你已经作为 GitHub 协作者被邀请。下面是从零到"给 AI 发需求"的全部操作。

### 1. 准备环境（只需一次）

需要 **Git** 和 **Node.js 18+**（建议 20+）。没有 Node 就去 https://nodejs.org 装 LTS 版。

### 2. 复制仓库到本地

```bash
git clone https://github.com/zhoujieh/wego-design-system.git
cd wego-design-system
npm install
```

`npm install` 会安装仓库唯一的开发依赖 `playwright`（用于自动化验证）。第一次跑验证脚本若提示缺浏览器，执行一次 `npx playwright install`。

### 3. 在 AI IDE 里打开仓库，直接发需求

用 CodeBuddy（或任意 AI IDE）打开这个文件夹，然后像跟人说话一样描述业务目标即可。例如：

```text
帮我做一个商品批量改价原型。入口在工作台，用户选择多个商品后按固定金额或比例调价，
提交前需要预览变化，提交后展示成功和部分失败两种结果。
```

AI 会按固定链路推进：**澄清需求 → 你确认简报 → 设计实现页面 → 自动验证 → 你验收**。你不需要懂组件或布局，只描述业务。

### 预览你的原型

直接双击打开 `wego-app/index.html`（桌面端显示手机预览壳，移动端铺满屏幕）。
若浏览器限制本地文件，临时起一个服务：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080/wego-app/`，用完按 `Ctrl+C` 停止。

---

## 不想自己敲命令？把这段直接丢给你的 AI

如果你自己也是用 AI 干活，**复制下面整段**发给你自己的 AI（CodeBuddy / 任意 AI IDE），它会把环境、依赖、预览全部帮你准备好。你只需要先**接受 GitHub 的协作者邀请邮件**（这一步 AI 替不了你，必须本人点接受）。

```text
我是这个仓库（wego-design-system）的 GitHub 协作者。请帮我把本地环境准备好，让我能开始给仓库里的 AI 技能发业务需求、做交互原型。请按下面顺序做，每步遇到阻塞就停下来告诉我，不要跳过：

1. 检查环境：确认已安装 Git 和 Node.js（要求 >=18，建议 20+）。缺哪个就告诉我具体安装方式（不要自动改系统配置，除非我同意）。
2. 复制仓库：如果本地还没有这个仓库，执行 git clone https://github.com/zhoujieh/wego-design-system.git 并 cd 进去；如果已有，执行 git pull --rebase origin main 更新到最新 main。
3. 安装依赖：执行 npm install（仓库唯一的开发依赖是 playwright）。
4. 安装浏览器：执行 npx playwright install，确保自动化验证能跑。如果已装过就跳过。
5. 校验：跑一次 node scripts/validate-wego-design.mjs --scope=changed --strict，确认环境没问题；有任何报错把关键信息贴给我。
6. 预览：告诉我怎么打开原型——直接双击 wego-app/index.html，或用 python3 -m http.server 8080 后访问 http://localhost:8080/wego-app/（提醒我用完按 Ctrl+C 停止，避免遗留进程）。
7. 准备就绪后，告诉我「环境已就绪，可以开始发业务需求了」，并简要说明：我接下来只要用自然语言描述业务目标（入口、用户任务、主要操作、可见结果和状态），仓库的 AI 技能就会走「澄清需求 → 我确认简报 → 设计实现 → 自动验证 → 我验收」的链路。

注意：不要改动 wego-app/lib/ 和 components.css（设计系统只读消费）；不要直接提交 main；不要执行 git add -A。
```

> 提示：AI 完成上面步骤后，你后续只要像聊天一样描述业务需求即可，无需再管命令。

---

## 提需求时怎么写更好

说清这几点，AI 就能直接开工，不用反复问你：

- **入口在哪**（从哪个页面进来）
- **用户首要任务是什么**
- **主要操作**（点什么、选什么）
- **能看到的结果和必要状态**（成功 / 失败 / 空态等）

参考图、线框图、Figma 只作为视觉方向，**不能替代你确认过的需求简报**。

---

## 多人协作要点（给想知道的人）

- 各人开 `feature/<你>-<场景>` 分支，通过 PR 合并到 `main`，不要直接提交 `main`。
- 每次开工前先 `git pull --rebase origin main` 基于最新代码。
- 开工前在 `claims/<你>.json` 认领场景并跑 `node scripts/validate-claims.mjs`，避免两人改同一场景。
- 完整协作约定见 [`AGENTS.md`](AGENTS.md)；脚本与验证命令见 [`scripts/README.md`](scripts/README.md)。

> 普通设计任务把设计系统当**只读**用，不要改 `wego-app/lib/` 和 `components.css`；只有做设计系统维护任务才改源。

## 验证（可选，合并前建议跑）

```bash
node scripts/validate-wego-design.mjs --scope=changed --strict
```
