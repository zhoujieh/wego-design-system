---
name: "wego-design"
description: 基于已提交的简要原型简报消费微购设计系统，在一次任务中完成可交互 App 场景；不定义业务需求或修改设计系统本体。
---

# Wego Design

## 触发与边界

用于已提交薄档范围内的新场景、已有场景修改和原型定稿前的交互实现。缺少会改变目标、范围、路径、状态、数据或结果的业务事实时退回 `wego-product`。设计阶段只在现有设计系统能力内完成当前页面的最佳实现；发现组件契约、规范或系统能力无法满足已确认结果时，停止用场景代码绕过并报告给用户，交 `wego-uxsystem-iterate` 核定，不在本技能内修改设计系统。

## 按需读取

<!-- rule-id: scene-must-consume-prototype-db -->
默认读取 `AGENTS.md`、有效迭代中的 spec.md（需求规格说明）、[设计原则](./references/design-principles.md)、[设计方法](./references/interaction-prototype-design.md)、[资产地图](./references/library-map.md)和[原型数据库说明](../../../wego-app/data/README.md)。场景中出现的商品、素材图片、用户头像、发布者、好友和运营文案必须优先取自 `window.WEGO_PROTOTYPE_DB`，不在 `scene.js` 里临时编造或硬编码；System 级 `text_to_image` API 规则在本项目内不适用，图片以数据库 `assets` 与本地 `lib/assets/image/` 为准。

页面结构形成后，只读取 `page-layers.json`、`library-consumption.json` 和 `uikit-plan.json` 中与本页命中的部分。页面骨架先用正式 Layout 组件搭建 2–3 层信息框架（`layout-page`/`layout-scroll`/`layout-section`/`layout-flow`/`layout-split`/`layout-grid`/`layout-scroll-row`，命中 UI Kit 时继承其 Layout 树），再将业务信息分配到布局槽位；组件确定后，只读取 `components/index.json` 的目标项、对应 Preview 和组件契约；实现时读取需要的 Token；收尾时只读取[场景合同](./references/scene-contract.md)中与当前场景命中的规则。已有场景的历史说明不作为设计前输入。

验收或排查走查工具交互（颜色 HSL/渐变、数值拖动、顺序移动、连点选择、悬停元信息、iconfont、工具栏）：先读场景技能[wego-scene-walkthrough-test](../wego-scene-walkthrough-test/SKILL.md)，按其分层门禁执行。

实现或修改业务场景（scene.js/scene.css/业务运行时 js）：先读场景技能[wego-scene-app-test](../wego-scene-app-test/SKILL.md)，按其分层门禁做轻量回归、交付关键路径或终局全量走查。

<!-- rule-id: scene-dom-copy-preview-verbatim -->
正式组件必须使用目标 Preview 变体的完整 DOM、class 和可选节点位置；不得凭组件名自行重写结构，页面结构也不得从组件或 UI Kit 反推。

## 执行约束

<!-- rule-id: scene-contract-precheck-mandatory -->
- 每轮场景实现完成后，必须运行 `node scripts/validate-scene-contract.mjs <场景路径>` 做场景契约预检，通过后再交付本地预览；场景契约问题不得留到合并阶段全量门禁才发现。只有用户明确要求 PR/在线预览时才在通过预检后推送。

<!-- rule-id: scene-app-test-before-delivery -->
- 每轮场景实现完成后必须按 `wego-scene-app-test` 分层门禁做测试：本地小改跑轻量回归，本地可验收版本跑本地关键路径，终局验收前再做全量走查；发现问题先修复并复验同层级用例。

<!-- rule-id: experience-signal-to-inbox -->
- 经验信号自检：会话中出现用户纠正、用户表达偏好、返工、踩坑（CI 失败/守卫拦截/验收打回）时，向当前交付单元 `.tasks/experience-inbox.json` 追加一条草稿（字段与分流规则见 `wego-uxsystem-iterate/references/workflow-iteration.md`），不直接改经验权威源，无信号不动作。

## 输出与交接

业务实现只输出或更新场景目录中的 `route.json`、`scene.js` 和 `scene.css`；迭代记录和生成路由按工作流同步维护。路由发生新增或变化时运行 `node scripts/build-routes.mjs` 生成 `wego-app/js/routes.js`；`routes.js` 是生成物，禁止直接编辑。

在已确认范围内自主完成信息分组、布局、组件、Token、反馈和 overlay，不建立第二次确认门禁。实现过程默认处于**本地迭代中**，直到用户明确验收通过：

- 完成每轮修改后运行场景契约预检和关键交互检查；小问题先在本地累计，不为每个细节推送。首次可验收版本、一组反馈已集中处理完成或 Agent 自行判断“完成”后，默认只交付一个可远程查看的本地预览链接；只有用户明确要求推送 PR、更新 PR 或在线预览时，才由 `wego-github-delivery` 推送远端分支并创建/更新同一 PR；同一需求固定复用同一个 PR。
- 从当前任务 worktree 启动或复用仅绑定 `127.0.0.1` 的本地 HTTP 预览，并通过临时 HTTPS 隧道生成可远程查看的本地预览链接；确认目标 routeId 包含本次改动后，默认只返回该远程本地预览链接。用户明确要求 PR/在线预览且已推送 PR 后，必须等待 publish 检查通过，再 curl 核实 `previews/pr-<N>/` 入口与目标内容，随后只返回在线预览链接并关闭对应本地预览与隧道；`.wego-deployment-sha` 对应 workflow 事件的 `GITHUB_SHA`，pull_request 事件通常是 merge ref SHA，不直接与 PR head SHA 比较。部署未完成时不得以远程本地预览代替在线链接，须等待或明确告知"在线链接待部署完成后返回"并补齐。
- 原型循环期间保持迭代状态为 `in-development`（spec.md 变化随轮重新 submit-brief）；用户发起终局验收后先展示终版材料，用户确认最终材料时连续执行 `confirm-brief` 与 `submit-prototype`，`prototyping` 只作为冻结前的短暂脚本状态。
- 每次结果标明：`当前状态：本地迭代中（已推送，PR #<编号>）`；尚未推送时标明`当前状态：本地迭代中（未推送）`。

"改好了""继续""再调整一下"等普通反馈不构成验收授权，也不构成推送 PR 授权。即使已有 PR，后续小问题仍先在本地累计修改并交付可远程查看的本地预览；只有用户明确要求更新 PR/在线预览时才集中更新同一个 PR，在线部署核实后切换为单一在线预览链接。

## 终局确认（与验收合一）

用户明确表达"验收完成""验收通过""确认合格""可以合并"后，进入收口流程：

1. **补全终版 spec.md**：把 spec.md 补全至终版（状态、数据契约、路径闭环，open_questions 清空；只能补细节不能减内容），重新执行 `submit-brief`（脚本刷新快照并差量迁移验收账本，未变条目保留核对状态）。
2. **逐项核对填写账本**：对 `acceptance.json` 的每条账本项（入口/关键路径/状态/数据契约）核对实际实现，填写 `status`（implemented / missing / mismatch）与 `evidence`（指向真实代码或交互位置）；发现 missing / mismatch 先回本地迭代修复实现并复验，再重新核对。
3. **展示终局确认材料**：向用户展示两样——终版补全 diff（AI 补了什么一眼可见）+ 账本清单（每项状态与证据），请用户过目确认。
4. 用户过目确认后，连续执行：
   ```bash
   node scripts/iteration-record.mjs confirm-brief --file {iteration.json} --user-confirmed-brief {iteration_id}
   node scripts/iteration-record.mjs submit-prototype --file {iteration.json} --user-confirmed-prototype {iteration_id}
   ```
   （脚本终局守门：全量结构 + 充分性 + open_questions 清空 + 账本全绿；submit-prototype 复验账本全绿后才冻结。）
5. 运行与范围相称的完整静态验证；若已有 PR，确认 PR 已包含全部待合并改动；若尚未创建 PR，则在用户确认最终材料后创建 PR 并等待必要检查通过再合并。
6. **经验收口**：扫描 `.tasks/experience-inbox.json`，有草稿则交 `wego-uxsystem-iterate` 先分流需求/普通缺陷并执行质量门，只有合格因果规则进入四层经验体系；无合格经验不输出沉淀提示。处理后清空草稿；未完成本步不得进入 worktree 清理。
7. 停止对应本地预览服务并删除服务记录，再同步最新 `main`、解决冲突并完成验证，最后合并到 `main`。
8. 每次结果标明：`当前状态：已验收，合并中（PR #<编号>）`。

- 用户在原型循环（`in-development`）或 `prototyping` 阶段要求调整视觉、布局、组件、Token、路由或交互时，直接在原迭代继续修改，不执行 `invalidate`。
- 用户反馈改变目标、范围、入口、关键路径、状态、数据或可见结果时，退回 `wego-product` 按简报失效流程处理。

除场景合同允许的简短例外说明外，不新增设计证明文件。
