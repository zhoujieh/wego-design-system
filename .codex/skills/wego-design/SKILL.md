---
name: "wego-design"
description: 基于已确认原型简报消费微购设计系统，在一次任务中完成可交互 App 场景；不定义业务需求或修改设计系统本体。
---

# Wego Design

## 触发与边界

用于已确认范围内的新场景、已有场景修改和原型定稿前的交互实现。缺少会改变目标、范围、路径、状态、数据或结果的业务事实时退回 `wego-product`。设计阶段只在现有设计系统能力内完成当前页面的最佳实现，不判断或登记设计系统缺口；组件、规范或系统问题由用户在原型验收时提出，再交给 `wego-uxsystem-iterate`。

## 按需读取

<!-- rule-id: scene-must-consume-prototype-db -->
默认读取 `AGENTS.md`、有效迭代中的已确认 `prototype_brief`、共享[设计原则](../shared/references/design-principles.md)、[设计方法](./references/interaction-prototype-design.md)、[资产地图](./references/library-map.md)和[原型数据库说明](../../wego-app/data/README.md)。场景中出现的商品、素材图片、用户头像、发布者、好友和运营文案必须优先取自 `window.WEGO_PROTOTYPE_DB`，不在 `scene.js` 里临时编造或硬编码；System 级 `text_to_image` API 规则在本项目内不适用，图片以数据库 `assets` 与本地 `lib/assets/image/` 为准。

页面结构形成后，只读取 `page-layers.json`、`library-consumption.json` 和 `uikit-plan.json` 中与本页命中的部分。页面骨架先用正式 Layout 组件搭建 2–3 层信息框架（`layout-page`/`layout-scroll`/`layout-section`/`layout-flow`/`layout-split`/`layout-grid`/`layout-scroll-row`，命中 UI Kit 时继承其 Layout 树），再将业务信息分配到布局槽位；组件确定后，只读取 `components/index.json` 的目标项、对应 Preview 和组件契约；实现时读取需要的 Token；收尾时只读取[场景合同](./references/scene-contract.md)中与当前场景命中的规则。已有场景的历史说明不作为设计前输入。

<!-- rule-id: scene-dom-copy-preview-verbatim -->
正式组件必须使用目标 Preview 变体的完整 DOM、class 和可选节点位置；不得凭组件名自行重写结构，页面结构也不得从组件或 UI Kit 反推。

## 执行约束

<!-- rule-id: agent-must-pull-before-task-start -->
- 新会话/新任务开场先执行 `git pull --rebase origin main` 同步最新 `main`，再进入简报消费或场景实现（规则见 `AGENTS.md`「多人多 Agent 并发协作」）。

## 输出与交接

只输出或更新场景目录中的 `route.json`、`scene.js` 和 `scene.css`。路由发生新增或变化时运行 `node scripts/build-routes.mjs` 生成 `wego-app/js/routes.js`；`routes.js` 是生成物，禁止直接编辑。

在已确认范围内自主完成信息分组、布局、组件、Token、反馈和 overlay，不建立第二次确认门禁。完成实现后运行源码守卫和真实浏览器检查；验证通过后执行 `submit-prototype`，提交并推送当前功能分支，创建或更新 PR，并将迭代推进到 `awaiting-prototype-confirmation`。交付时提供当前 PR 的独立预览链接供用户验收。

- 用户明确验收通过后执行 `confirm-prototype`，重新同步最新 `main`、解决冲突并完成验证，再合并到 `main`。
- 用户在已确认范围内要求调整视觉、布局、组件、Token、路由或交互时，先执行 `invalidate --stage=prototype`，修改、验证并重新 `submit-prototype`；原 PR 预览链接保持不变并自动更新。
- 用户反馈改变目标、范围、入口、关键路径、状态、数据或可见结果时，退回 `wego-product` 按简报失效流程处理。

除场景合同允许的简短例外说明外，不新增设计证明文件。
