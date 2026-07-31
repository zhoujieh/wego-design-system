# wego-app AI UXDesign 工作流

微购中文移动端原型与设计系统仓库。业务原型固定经过需求确认、设计实现、自动验证和用户验收；精简文档或守卫不得绕过这条链路。

## 沟通要求

- 必须用中文进行沟通。
- 禁止没有跟用户确认需求细节就开始改代码。
- 禁止输出一大堆过程内容和多个方案让用户进行决策，应该直接给出最佳方案让用户确认。
- 禁止输出技术专用的一些技术细节，应该输出业务场景和用户需求与用户进行沟通。
- 每次任务完成并给出结果后，询问用户是否需要总结并登记本次任务的经验教训；用户未明确同意时不得进入经验沉淀流程。

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
- `.trae/skills/*` 是 `.codex/skills/*` 的符号链接，不作为独立副本维护。

## 三技能主链路

- 新需求或业务范围变化：`wego-product` 形成并确认 `prototype_brief`。
- 已确认范围内的页面设计与实现：`wego-design`。
- 组件、Token、Preview、UI Kit、消费规则、守卫和工作流维护：`wego-uxsystem-iterate`。
- 复盘和经验沉淀：`wego-uxsystem-iterate`。

<!-- rule-id: requirement-input-must-create-iteration-first -->
无论用户给的是自然语言需求、参考图还是 Figma 设计稿，均视为业务需求，必须先经 `wego-product` **创建迭代并确认 `prototype_brief`**，不得跳过直接做页面。Figma 与参考图只是实现参考，不代替需求确认、不用于补造业务事实。

业务需求必须属于有效迭代。简报提交、确认、失效和明确冻结的规则以 `.codex/skills/wego-product/references/iteration-workflow.md` 为唯一权威；确认、测试、交付、提交或时间经过均不等于冻结。

已确认简报即设计授权。`wego-design` 不补造业务事实、不建立第二次设计确认门禁，也不修改设计系统本体；正式能力不足时只交接最小缺口。页面质量以源码一致性、真实交互和浏览器视口检查为准，不要求人工合同、自证字段或设计决策镜像。

## Git、临时产物与验证

- 所有开发任务默认使用独立分支，禁止直接提交 `main`。
- 只暂存本次任务的显式路径，不执行 `git add -A`，不强推已有远端分支。
- 只有用户明确要求推送时，才提交并推送当前分支；推送成功后创建或更新 PR，在验证通过且无未解决冲突时自动合并到 `main`。
- PR 自动合并不得绕过分支保护、必要检查或冲突处理；合并失败时停止并修复问题。
- 允许的短期临时目录为 `.uploads/`、`.tasks/`、`output/` 和 `.playwright-cli/`；临时产物不得提交，任务结束前清理无用文件，需长期保留的资源必须迁移到正式目录。
- 按需执行 `node scripts/cleanup-task-artifacts.mjs clean` 清理任务临时产物。

### 多人多 Agent 并发协作

多个人各自驱动自己的 Agent 会话、并发迭代同一仓库。Agent 之间不对话，协调只发生在仓库层面：谁的 Agent 碰了什么，由仓库状态体现，别的 Agent 来读。

- **分支与 PR**：每人/每需求使用 `feature/<owner>-<scene>` 分支；用户要求推送后，通过 PR 自动合并到 `main`。
- **开工前先拉取**：每次新会话/新任务开始前执行 `git pull --rebase origin main`，确保基于最新 `main`；创建 PR 前再次 rebase 到最新 `main` 并解决冲突。
- **场景认领（防冲突核心）**：并发修改时，开工前在 `claims/<agent-id>.json` 写入自己负责的场景，并运行 `node scripts/validate-claims.mjs` 确认无他人重复认领；完成后把 `status` 改为 `released`/`done`。不要两个 Agent 改同一场景目录。
- **路由生成式**：新增或修改场景路由时只编辑其目录下的 `route.json`，再运行 `node scripts/build-routes.mjs` 重新生成 `wego-app/js/routes.js`；**不要手改 `routes.js`**，CI 以 `build-routes.mjs --check` 校验一致性。
- **设计系统单写**：`wego-app/lib/` 与 `components.css` 是生成物；仅执行 `wego-uxsystem-iterate` 任务的 Agent 可改 `.codex/skills/wego-design/` 权威源并运行 `sync-wego-app-lib.mjs`，其它 Agent 只读消费，不得改源。
- 普通改动运行 `node scripts/validate-wego-design.mjs`。
- 设计系统或工作流改动运行 `node scripts/validate-wego-design.mjs --scope=system --strict`。
- 正式合并前按需运行 `node scripts/validate-wego-design.mjs --scope=full --strict`。

<!-- rule-id: local-server-must-auto-exit -->
本地验证服务必须自动退出；任务结束前确认没有遗留监听进程。
