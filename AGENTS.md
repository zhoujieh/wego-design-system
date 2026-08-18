# wego-app AI UXDesign 工作流

微购中文移动端原型与设计系统仓库。业务原型固定经过需求确认、本地设计迭代、正式提交、自动验证和用户验收；精简文档或守卫不得绕过这条链路。

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

## Git 与交付硬约束

- 禁止直接提交 `main`，所有任务默认使用独立分支。

<!-- rule-id: workflow-maintenance-enters-main-via-pr -->
- **工作流维护例外**：`wego-uxsystem-iterate` 维护的权威源免业务验收和明确提交授权，验证通过后直接走短周期 PR 合入 `main`，CI 失败停止等用户；业务原型和设计系统组件/Token/Preview/UI Kit 变更不适用。

<!-- rule-id: delivery-ops-must-enter-github-delivery-skill -->
- 分支、PR、预览、合并和清理由 `wego-github-delivery` 技能承担；出现交付操作意图时先进入该技能。

<!-- rule-id: delivery-intake-must-precede-business-workflow -->
- 业务页面请求进入 `wego-product` 或 `wego-design` 前必须先经 `wego-github-delivery` 完成交付单元核对。

<!-- rule-id: scene-must-claim-before-edit -->
- 场景认领强制前置：开工前在 `claims/<agent-id>.json` 认领场景目录并记录分支，再运行 `node scripts/validate-claims.mjs` 确认无冲突；单人开发也必须认领。

<!-- rule-id: agent-must-pull-before-task-start -->
- 开工前先 `git pull --rebase origin main` 同步最新 `main`；分支命名、PR 同步、分叉处置等细节见 `wego-github-delivery`。

<!-- rule-id: local-server-must-auto-exit -->
- 临时验证用本地服务必须自动退出；本地迭代与验收预览服务是唯一例外，在等待反馈或验收期间保持运行，完成后由 Agent 关闭。

- 路由生成式：只编辑场景目录下 `route.json`，运行 `node scripts/build-routes.mjs` 生成 `wego-app/js/routes.js`，禁止手改 `routes.js`。
- 设计系统单写：`wego-app/lib/` 与 `components.css` 是生成物；仅 `wego-uxsystem-iterate` 可改 `.codex/skills/wego-design/` 权威源并运行 `sync-wego-app-lib.mjs`，其它 Agent 只读消费。
- 验证范围：本地迭代轻量检查；提交授权后 `validate-wego-design.mjs`；设计系统/工作流正式提交 `--scope=system --strict`；正式合并按需 `--scope=full --strict`。
- 临时目录限 `.uploads/`、`.tasks/`、`output/` 和 `.playwright-cli/`；临时产物不得提交，任务收口时清理。
