---
name: "wego-design"
description: 基于已确认原型简报消费微购设计系统，在一次任务中完成可交互 App 场景；不定义业务需求或修改设计系统本体。
---

# Wego Design

## 触发与边界

用于已确认范围内的新场景、已有场景修改和原型定稿前的交互实现。缺少会改变目标、范围、路径、状态、数据或结果的业务事实时退回 `wego-product`。设计阶段只在现有设计系统能力内完成当前页面的最佳实现，不判断或登记设计系统缺口；组件、规范或系统问题由用户在原型验收时提出，再交给 `wego-uxsystem-iterate`。

## 按需读取

<!-- rule-id: scene-must-consume-prototype-db -->
默认读取 `AGENTS.md`、有效迭代中的 spec.md（需求规格说明）、共享[设计原则](../shared/references/design-principles.md)、[设计方法](./references/interaction-prototype-design.md)、[资产地图](./references/library-map.md)和[原型数据库说明](../../../wego-app/data/README.md)。场景中出现的商品、素材图片、用户头像、发布者、好友和运营文案必须优先取自 `window.WEGO_PROTOTYPE_DB`，不在 `scene.js` 里临时编造或硬编码；System 级 `text_to_image` API 规则在本项目内不适用，图片以数据库 `assets` 与本地 `lib/assets/image/` 为准。

页面结构形成后，只读取 `page-layers.json`、`library-consumption.json` 和 `uikit-plan.json` 中与本页命中的部分。页面骨架先用正式 Layout 组件搭建 2–3 层信息框架（`layout-page`/`layout-scroll`/`layout-section`/`layout-flow`/`layout-split`/`layout-grid`/`layout-scroll-row`，命中 UI Kit 时继承其 Layout 树），再将业务信息分配到布局槽位；组件确定后，只读取 `components/index.json` 的目标项、对应 Preview 和组件契约；实现时读取需要的 Token；收尾时只读取[场景合同](./references/scene-contract.md)中与当前场景命中的规则。已有场景的历史说明不作为设计前输入。

<!-- rule-id: scene-dom-copy-preview-verbatim -->
正式组件必须使用目标 Preview 变体的完整 DOM、class 和可选节点位置；不得凭组件名自行重写结构，页面结构也不得从组件或 UI Kit 反推。

## 执行约束

<!-- rule-id: agent-must-pull-before-task-start -->
- 新会话/新任务开场先执行 `git pull --rebase origin main` 同步最新 `main`，再进入简报消费或场景实现（交付细节见 `wego-github-delivery`）。

<!-- rule-id: scene-contract-precheck-mandatory -->
- 每轮场景实现完成后，必须运行 `node scripts/validate-scene-contract.mjs <场景路径>` 做场景契约预检，通过后再推送 PR。场景契约问题不得留到合并阶段全量门禁才发现。

## 输出与交接

业务实现只输出或更新场景目录中的 `route.json`、`scene.js` 和 `scene.css`；迭代记录、场景认领（`npm run claim` / `npm run release-claim`）和生成路由按工作流同步维护。路由发生新增或变化时运行 `node scripts/build-routes.mjs` 生成 `wego-app/js/routes.js`；`routes.js` 是生成物，禁止直接编辑。

在已确认范围内自主完成信息分组、布局、组件、Token、反馈和 overlay，不建立第二次确认门禁。实现过程默认处于**本地迭代中**，直到用户明确验收通过：

- 完成每轮修改后运行场景契约预检和关键交互检查，通过后由 `wego-github-delivery` **自动推送远端分支并创建/更新同一 PR**；同一需求固定复用同一个 PR。
- 从当前任务 worktree 启动或复用本地 HTTP 预览，确认目标 routeId 包含本次改动，同时返回本地与在线两个链接。
- 保持迭代状态为 `prototyping`；不主动执行 `submit-prototype`，等用户明确验收通过后一次性收口。
- 每次结果标明：`当前状态：本地迭代中（已推送，PR #<编号>）`；尚未推送时标明`当前状态：本地迭代中（未推送）`。

"改好了""继续""再调整一下"等普通反馈不构成验收授权。即使已有 PR，后续小问题仍先在本地累计修改，完成一轮验证后自动更新同一个 PR。

## 验收统一收口

用户明确表达"验收完成""确认合格""可以合并"后，进入收口流程：

1. **输出 5 维度一致性校验清单**，逐项对比需求规格说明与实际实现：
   - **范围**：included/excluded 是否与实现一致
   - **入口**：entry_points 是否全部实现且位置正确
   - **关键路径**：critical_paths 是否首尾闭环
   - **状态**：states 覆盖的加载/失败/空状态是否全部实现
   - **数据契约**：data_contract 的数据产生入口、展示、修改是否闭环
2. 用户逐项确认后，连续执行：
   ```bash
   node scripts/iteration-record.mjs confirm-brief --file {iteration.json} --user-confirmed-brief {iteration_id}
   node scripts/iteration-record.mjs submit-prototype --file {iteration.json} --user-confirmed-prototype {iteration_id}
   ```
3. 运行与范围相称的完整静态验证，确认自动推送的 PR 已包含全部本次改动。
4. 停止对应本地预览服务并删除服务记录，再同步最新 `main`、解决冲突并完成验证，最后合并到 `main`。
5. 每次结果标明：`当前状态：已验收，合并中（PR #<编号>）`。

- 用户在 `prototyping` 阶段要求调整视觉、布局、组件、Token、路由或交互时，直接在原迭代继续修改，不执行 `invalidate`。
- 用户反馈改变目标、范围、入口、关键路径、状态、数据或可见结果时，退回 `wego-product` 按简报失效流程处理。

除场景合同允许的简短例外说明外，不新增设计证明文件。
