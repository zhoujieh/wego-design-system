# 微购 App 原型与设计系统

这是一个由 AI 工作流驱动的中文移动端原型仓库。向 Codex 或 Trae 描述业务需求后，仓库内置技能会完成需求确认、页面设计、设计系统消费、交互实现和验证。

[查看当前线上原型](https://zhoujieh.github.io/wego-design-system/)

## 获取与预览

需要 Git 和 Node.js 24：

```bash
git clone https://github.com/zhoujieh/wego-design-system.git
cd wego-design-system
npm ci
```

直接打开 `wego-app/index.html`，或从各场景目录下的 `route.json` 选择 hash 路由（路由由 `scripts/build-routes.mjs` 汇总生成）：

```text
wego-app/index.html#/my-permission-management
```

浏览器限制本地文件时，可临时运行：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080/wego-app/`，使用后停止服务。

## 让 AI 创建或修改原型

直接描述业务目标、入口、页面首要任务、主要操作、可见结果和必要状态，不需要指定组件或布局。例如：

```text
帮我做一个商品批量改价原型。入口在工作台，用户选择多个商品后按固定金额或比例调价，
提交前需要预览变化，提交后展示成功和部分失败两种结果。
```

固定链路为：

1. `wego-product` 澄清业务事实并形成 `prototype_brief`。
2. 你确认简报后，`wego-design` 完成页面设计、正式组件消费和交互实现。
3. 自动守卫检查源码一致性，真实浏览器检查视口、布局和核心交互。
4. 你通过 `wego-app/index.html#/route-id` 验收；反馈复用当前未冻结迭代。

组件、Token、Preview、UI Kit、守卫或工作流本体由 `wego-uxsystem-iterate` 维护。技能路由见 [`.codex/skills/README.md`](.codex/skills/README.md)，仓库硬约束见 [`AGENTS.md`](AGENTS.md)。

参考图只提供视觉方向，用户线框图只提供结构，高保真 Figma 约束指定 Frame 的结构视觉；它们不能替代已确认简报或补造业务事实。系统不主动生成线框图或文本分镜。

## 主要路径

| 路径 | 用途 |
| --- | --- |
| `wego-app/index.html` | 唯一 App 入口 |
| `wego-app/scenes/{中文业务场景}/` | 场景脚本与样式 |
| `wego-app/scenes/{主业务场景}/_iterations/` | 简报、迭代状态和明确冻结后的快照 |
| `.codex/skills/` | 三个技能及设计系统权威源 |
| `scripts/` | 验证、迭代记录、同步和清理工具 |

`wego-app/lib/` 是设计系统部署副本，`components.css` 是生成物，二者都不直接修改。

## 多人协作（多 Agent 并发）

多个人各自在自己的 IDE 里驱动 Agent 会话，并发迭代同一个仓库。由于各 Agent 之间不互相通信，**所有协调都通过仓库状态完成**：谁在改什么、改到哪一步，都落在文件里，别的 Agent 来读。下面是从邀请到合并的完整约定。

### 邀请团队成员

1. 仓库管理员在 GitHub 仓库 `Settings → Collaborators`（组织或团队则在团队设置里）按用户名 / 邮箱邀请成员，授予 `Write` 权限。
2. 成员接受邀请后 `git clone` 到本地，安装依赖（`npm ci`），在自己常用的 AI IDE（如 CodeBuddy）中打开仓库。
3. 协作纪律已经写进 [`AGENTS.md`](AGENTS.md) 与各技能，新成员的 Agent 打开仓库即自动继承，无需额外培训。

### 别人如何使用仓库

- 克隆后 `npm ci` 安装依赖（主要供 Playwright 运行时验证）。
- 在 AI IDE 里像单人一样描述需求；Agent 会按 `wego-product → wego-design → 验证 → 验收` 链路推进。
- 设计系统（`wego-app/lib/`、`components.css`）对普通设计任务**只读消费**，不要改源；只有做 `wego-uxsystem-iterate` 维护任务时才改 `.codex/skills/wego-design/` 权威源并同步。
- 本地预览：直接打开 `wego-app/index.html`，或 `python3 -m http.server 8080` 后访问 `http://localhost:8080/wego-app/`（用完停止服务，避免遗留监听进程）。

### 何时拉取代码

- **每次新会话 / 新任务开始前**：`git pull --rebase origin main`，确保基于最新 `main`。
- **创建 PR 前**：再次 `git pull --rebase origin main`（或把分支 rebase 到最新 `main`），解决冲突后再推。
- **别人的 PR 合并到 `main` 后**：及时 `git pull` 同步，尤其是共享产物（设计系统同步后、路由生成后）。
- **运行 `sync-wego-app-lib.mjs` / `build-routes.mjs` 前**：先 `pull`，避免基于旧源生成。
- 原则：分支生命周期短、频繁 `pull`、小 PR。

### 分支与 PR 模型

- 每人 / 每需求开 `feature/<owner>-<scene>` 分支（如 `feature/alice-example`）。
- 通过 PR 合并到 `main`；**禁止多个 Agent 直接提交 `main`**。
- 合并前 CI 会跑一致性检查（见下）；建议至少一人 review。

### 场景认领（防冲突核心）

不同场景目录天然隔离，但必须避免两人抢改同一场景：

1. 开工前在 `claims/<agent-id>.json` 写入认领（字段见 `claims/.gitkeep`）：
   ```json
   {
     "agentId": "alice",
     "owner": "Alice",
     "scene": "示例场景",
     "routeId": "example-route",
     "branch": "feature/alice-example",
     "status": "working",
     "claimedAt": "2026-07-30T10:00:00+08:00"
   }
   ```
2. 运行 `node scripts/validate-claims.mjs` 确认无他人重复认领该 `scene` / `routeId`。
3. 完成后把 `status` 改为 `released` 或 `done`（这两个状态不计入冲突）。

### 共享文件纪律

- **路由生成式**：新增场景只在其目录写 `route.json`（声明 `routeId` 与 `entry`），再 `node scripts/build-routes.mjs` 重新生成 `wego-app/js/routes.js`。**不要手改 `routes.js`**——这是并发时最大的共享文件冲突源，改为生成式后每人只动自己的场景目录。
- **设计系统单写**：`wego-app/lib/`、`components.css` 由 `sync-wego-app-lib.mjs` 从 `.codex/skills/wego-design/` 生成；只有 `wego-uxsystem-iterate` 任务可改源。
- **`index.html`**：仅在新增宿主 tab 时改动，低频，靠 PR 串行合并即可。

### 提交与合并门禁

- 始终 `git add <显式路径>`，**不要 `git add -A`**，避免把别的会话里的半成品一起提交；不强推。
- CI（`.github/workflows/validate.yml`）在 PR 上强制三项硬门禁：
  - 认领冲突检查 `validate-claims.mjs`
  - 路由一致性 `build-routes.mjs --check`
  - 设计系统同步一致性 `sync-wego-app-lib.mjs --check`
  - 设计系统守门验证（当前为**报告项**，见下「已知问题」）
- 本地合并前建议跑 `node scripts/validate-wego-design.mjs --scope=changed --strict`。

### 冲突处理

- 不同场景目录的改动可安全合并；同一场景被两人改则靠认领机制提前避免。
- 若 `routes.js` 出现冲突：不要手解，重新跑 `node scripts/build-routes.mjs` 由源生成。
- 设计系统冲突：因单写约束基本不会发生；若发生，以 `.codex/skills/wego-design/` 源为准，重跑 `sync`。

### 新成员上手清单

1. 被邀请为 GitHub 协作者 → `git clone` → `npm ci`。
2. 读 [`AGENTS.md`](AGENTS.md) 与 [`scripts/README.md`](scripts/README.md)。
3. 选一个未认领的场景（或新建场景目录 + `route.json`）。
4. `git checkout -b feature/<you>-<scene>`，写 `claims/<you>.json`，跑 `validate-claims.mjs`。
5. 开 Agent 按技能链路实现；本地 `validate --scope=changed --strict`。
6. PR 合并。

### 已知问题

本仓库基线（`wego-app`）当前为空，所有业务场景由团队成员按上述约定逐步添加。

设计系统守门验证（`validate-wego-design.mjs`）的**场景契约检查依赖一个对引号 / 注释配对较敏感的脱敏器**：个别合法 `scene.js` 可能被误报「`scene.js` 必须且只能真实调用一次 `window.WegoApp.registerScene`，当前为 0 次」（实际已正确调用）。因此在修复该脆弱性前，CI 中该验证暂设为**非阻塞报告项**；若某次新增场景触发此误报，请先确认 `scene.js` 确已调用 `window.WegoApp.registerScene({...})`，再判断是否为验证器问题，不要据此误判场景缺陷。

## 验证

```bash
node scripts/validate-wego-design.mjs
node scripts/validate-wego-design.mjs --scope=system --strict
node scripts/validate-wego-design.mjs --scope=full --strict
```

按改动范围选择命令，脚本职责见 [`scripts/README.md`](scripts/README.md)。涉及新增 / 修改场景时，另跑 `node scripts/build-routes.mjs --check` 校验路由生成一致性。

仓库已配置 GitHub Pages 工作流；启用 Pages 后，以工作流显示的 deployment URL 为准。
