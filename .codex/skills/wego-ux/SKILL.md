---
name: "wego-ux"
description: 按已确认原型简报与设计约束快速实现 wego-app 交互原型，并在定稿后按 interaction_spec 和 design_plan 补齐正式实现追踪；用于生成或修改登记范围内的 scene.js、scene.css、routes.js、宿主入口、交互状态、数据回填、路由和资源同步。不要用于需求重定义、设计系统本体维护或只做验收。
---

# Wego UX

这是唯一正式生成或修改业务原型的环节。持续维护同一个 `wego-app`，不生成孤立 demo；schema v2 先实现可交互原型，再在定稿后正式化追踪。

## 前置门禁与路由

- schema v2 的 `prototyping` 状态必须有用户确认的 `prototype_brief` 和 `prototype_design`；此时只可修改登记范围内的运行时文件，禁止改写正式规格、验收或交接产物。
- schema v2 定稿后，正式实现追踪必须有已落盘 `_spec/interaction_spec.json`、`_spec/design_plan.json` 且状态为 `design-ready`；运行 `check-prototype-snapshot` 后才能 `mark-implemented`。
- v1 必须有两份规格且状态为 `design-ready`，产品、设计和 `base_fingerprint` 未失效。
- `readiness = blocked`、存在 design gap 或任一 surface 为 gap：停止并回到上游。
- 只改组件、Token、UI Kit、Preview、消费边界或工作流：交给 `wego-uxsystem-iterate`。
- 只验收或回归：交给 `wego-tests`。

## 读取顺序

1. 仓库根目录 [AGENTS.md](../../../AGENTS.md)。
2. 当前业务迭代 `iteration.json` 和 [业务迭代契约](../wego-product/references/iteration-workflow.md)。
3. schema v2 原型期读取 `prototype_brief` 和 `prototype_design`；定稿后及 v1 读取所有相关场景两份 `_spec`。
4. `prototype_design.rule_sources_used` 或 `design_plan.rule_sources_used` 指向的正式来源。
5. 命中的组件契约、Preview、Token、pagePattern 和 fallback。
6. 当前 `wego-app` 宿主、路由和目标场景。
7. 修改路由、宿主、presentation 或场景注册时读取 [scene-runtime.md](references/scene-runtime.md)。
8. 实现多节点、状态交接、原型边界、键盘或列表时读取 [interaction-implementation.md](references/interaction-implementation.md)。
9. 同步、验证或交付时读取 [delivery.md](references/delivery.md)。

不得读取 `docs/specs/*.md` 作为实现依据。

## 核心规则

- schema v2 原型期只能执行已确认的 `prototype_brief`、`prototype_design` 和真实规则来源；定稿后及 v1 只能执行 `interaction_spec`、`design_plan` 和真实规则来源。
- 修改已有场景前必须先做偏差判定；禁止绕过规格直接修改 scene、样式或路由。
- 组件结构、变体、状态、Token、页面布局和打开方式必须严格执行设计计划，不得二次设计。
- 原型期发现范围偏差回到 `wego-product` 更新简报并重新确认；设计偏差回到 `wego-design` 更新原型约束。定稿后及 v1 的偏差仍须回退上游并更新、归档 `_spec`。
- 场景完成后必须经过 `wego-tests`；提交、推送和部署状态只按真实执行结果报告。
- 只能修改 `affected_scenes` 和 `affected_runtime` 登记范围；新增业务、场景或产品结果必须回到 `wego-product`，设计变化回到 `wego-design`。

## 强制偏差判定

依次检查：

1. 本次变化是否被 flows、nodes、surfaces、content、transition、handoff 和 boundary 覆盖。
2. 组件是否在 `component_patterns`、`component_mapping` 与契约范围内。
3. 布局、区域、presentation、Tab 覆盖和返回方式是否与设计计划一致。
4. flow node 的 page/sheet/modal/dialog/inline 承载是否一致。
5. Token、组件类和行为是否可追溯。

内容、范围或流程偏差回到 `wego-product → wego-design`；设计组合或打开方式偏差回到 `wego-design`；设计系统来源缺失回到 `wego-uxsystem-iterate`。

不改变需求或设计的 Token 替换、安全区修复、响应式修复、Bug 修复、性能重构通常可直接实现，但仍须满足正式规格。

v2 原型实现完成后运行 `submit-prototype` 等待用户定稿；文档化阶段运行 `check-prototype-snapshot`，补齐每项需求的 `implementation_refs` 后运行 `mark-implemented`。v1 继续在实现前运行 `check-base`。

## 产物与宿主

- 唯一入口为 `wego-app/index.html`。
- 场景位于 `wego-app/scenes/{中文业务场景}/`，包含 `_spec`、`scene.js`、`scene.css`。
- 路由增量 upsert 到 `wego-app/js/routes.js`。
- `wego-app/lib/` 是部署副本，不得直接编辑。
- 宿主初始化模板位于 `assets/templates/`；正式宿主已存在时只做增量修改。
- 宿主级改动同步检查正式宿主和模板，不能重置无关 Tab、入口和场景。

## 场景注册与路由

每个 route 通过 `window.WegoApp.registerScene()` 注册，`routeId`、presentation、surface 和入口必须与两份规格一致。运行时不得用 `fetch()` 或 XHR 加载本地 HTML 片段。

新任务优先读取 `prototype_target.routes[]`；旧场景回退顶层 `route_id`。Sheet、Modal、Dialog 和 inline 不注册独立 route，除非设计计划明确要求。

## 页面打开方式

只执行 `design_plan.page_presentation`：

- `push`：sceneLayer 栈式页面，使用 back-icon。
- `host-tab`：固定 Tab 面板，无返回，通常不覆盖 Tab。
- `modal`：轻量对话层。
- `sheet`：底部操作或选择层。
- `full-screen-modal`：覆盖全屏的复杂编辑。

`coversTabBar` 必须等于 `covers_tab_bar`。多 surface 逐项读取，不能继承主 surface。详细栈、overlay 和背景规则见 [scene-runtime.md](references/scene-runtime.md)。

## 组件与设计计划消费

- `exact/near`：执行命中模式与组件映射。
- `fallback`：只使用正式 blueprint 允许的布局和组件。
- `gap`：停止实现。

按 `consumption_mode`：

- `stable-variant`：按契约维度与 Preview 复制正式结构。
- `composition-constraint`：按约束 ID 还原完整组合。
- `free-composition`：只在 `domAnatomy` 内组合，业务 class 仅做区域布局。

新任务按 `page_strategy → region_composition → component_patterns → component_mapping → flow_to_surface_decisions` 组装，不从 `selected` 读取 DOM 或 CSS 类。

## 稳定标识与交互

- surface 根元素保留 `data-surface-id`。
- 内容承载元素保留 `data-content-id`。
- stub 入口保留 `data-node-id` 并显示明确反馈。
- functional/simulated 节点必须产生规格要求的状态变化、反馈与数据回填。
- excluded 节点不得出现在路由、入口或 DOM。

默认使用内存状态；只有需求明确要求刷新或跨会话保留时才持久化。Toast 由宿主统一管理。

## 移动端约束

scene 不修改 viewport meta、宿主盒模型或浏览器顶层滚动。顶部导航与内容滚动分离；键盘切换、返回和横竖屏变化后恢复高度、安全区与滚动位置。宿主能力缺失时修复正式宿主和模板，不在 scene 内重复监听或硬编码视口。

## 验证与交接

最低执行：

```bash
node scripts/specs.mjs check
node scripts/specs.mjs test
node scripts/validate-wego-design.mjs
```

资源变化补充 `node scripts/sync-wego-app-lib.mjs --check`。全局或跨技能变化使用严格范围。详细交付状态与服务器清理规则见 [delivery.md](references/delivery.md)。

完成后确认：规格覆盖、路由唯一、组件和 Token 有来源、交互与回填可走通、本地直开成立、实际验证有记录，然后交给 `wego-tests`。

## 禁止事项

- 不复制第二套 App 宿主或 UI Kit 展示外壳。
- 不发明组件、变体、Token、打开方式或业务字段。
- 不把 push 冒充 overlay，或把 overlay 擅自注册为 route。
- 不编造浏览器、提交、推送、部署或线上结果。
