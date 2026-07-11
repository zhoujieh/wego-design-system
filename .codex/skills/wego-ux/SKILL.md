---
name: "wego-ux"
description: 按已确认原型简报与设计约束快速实现 wego-app 交互原型，并在定稿后按 interaction_spec 和 design_plan 补齐正式实现追踪；用于生成或修改登记范围内的 scene.js、scene.css、routes.js、宿主入口、交互状态、数据回填、路由和资源同步。不要用于需求重定义、设计系统本体维护或只做验收。
---

# Wego UX

这是唯一正式生成或修改业务原型的环节。持续维护同一个 `wego-app`，先实现可交互原型，再在定稿后正式化追踪。

## 顶层版本门禁

- 只接受当前业务迭代 Schema，固定为 `schemaVersion: 2`。
- 发现旧 Schema、旧规格字段、旧 route 字段或旧状态机命令时必须停止并要求迁移。
- 禁止 v1/v2 分支、旧文件回退、旧字段兜底和双轨实现。

## 前置门禁与路由

- `prototyping` 状态必须有用户确认的 `prototype_brief` 和完整 `prototype_design`；此时只可修改登记范围内的运行时文件。
- 原型定稿后，正式实现追踪必须有 `_spec/interaction_spec.json`、`_spec/design_plan.json` 且状态为 `design-ready`；运行 `check-prototype-snapshot` 后才能 `mark-implemented`。
- `readiness = blocked`、存在 design gap 或任一 surface 为 gap：停止并回到上游。
- 只改组件、Token、UI Kit、Preview、消费边界或工作流：交给 `wego-uxsystem-iterate`。
- 只验收或回归：交给 `wego-tests`。

## 读取顺序

1. 仓库根目录 [AGENTS.md](../../../AGENTS.md)。
2. 当前业务迭代 `iteration.json` 和 [业务迭代契约](../wego-product/references/iteration-workflow.md)。
3. 原型期读取 `prototype_brief` 和 `prototype_design`；定稿后读取所有相关场景两份 `_spec`。
4. `prototype_design.rule_sources_used` 或 `design_plan.rule_sources_used` 指向的正式来源。
5. 命中的组件契约、Preview、Token、pagePattern 和 fallback。
6. 当前 `wego-app` 宿主、路由和目标场景。
7. 修改路由、宿主、presentation 或场景注册时读取 [scene-runtime.md](references/scene-runtime.md)。
8. 实现多节点、状态交接、原型边界、键盘或列表时读取 [interaction-implementation.md](references/interaction-implementation.md)。
9. 同步、验证或交付时读取 [delivery.md](references/delivery.md)。

不得读取 `docs/specs/*.md` 作为实现依据。

## 核心规则

- 原型期只能执行已确认的 `prototype_brief`、`prototype_design` 和真实规则来源；定稿后只能执行 `interaction_spec`、`design_plan` 和真实规则来源。
- 修改已有场景前必须先做偏差判定；禁止绕过规格直接修改 scene、样式或路由。
- 组件结构、变体、状态、Token、页面布局和打开方式必须严格执行设计计划，不得二次设计。
- 原型期发现范围偏差回到 `wego-product`；设计偏差回到 `wego-design`。定稿后的偏差同样回到上游并更新正式规格。
- 场景完成后必须经过 `wego-tests`。
- 只能修改 `affected_scenes` 和 `affected_runtime` 登记范围。

## 强制偏差判定

依次检查：

1. 本次变化是否被 flows、nodes、surfaces、content、transition、handoff 和 boundary 覆盖。
2. 组件是否在 `component_patterns`、`component_mapping` 与契约范围内。
3. 布局、区域、presentation、Tab 覆盖和返回方式是否与设计计划一致。
4. flow node 的 page/sheet/modal/dialog/inline 承载是否一致。
5. Token、组件类和行为是否可追溯。

原型实现完成后运行 `submit-prototype` 等待用户定稿；文档化阶段运行 `check-prototype-snapshot`，补齐 `implementation_refs` 后运行 `mark-implemented`。

## 产物与宿主

- 唯一入口为 `wego-app/index.html`。
- 场景位于 `wego-app/scenes/{中文业务场景}/`。
- 路由增量 upsert 到 `wego-app/js/routes.js`。
- `wego-app/lib/` 是部署副本，不得直接编辑。
- 宿主级改动同步检查正式宿主和模板。

## 场景注册与路由

每个 route 通过 `window.WegoApp.registerScene()` 注册，`routeId`、presentation、surface 和入口必须与两份规格一致。运行时不得用 `fetch()` 或 XHR 加载本地 HTML 片段。

统一读取 `prototype_target.routes[]`；禁止回退顶层 `route_id`。Sheet、Modal、Dialog 和 inline 不注册独立 route，除非设计计划明确要求。

## 页面打开方式

只执行 `design_plan.page_presentation`，并逐 surface 核对 `coversTabBar`。不得把 push 冒充 overlay，也不得让二级 surface 继承主 surface 配置。

## 组件与设计计划消费

- `exact/near`：执行命中模式与组件映射。
- `fallback`：只使用正式 blueprint 允许的布局和组件。
- `gap`：停止实现。

新任务按 `page_strategy → region_composition → component_patterns → component_mapping → flow_to_surface_decisions` 组装，不从 `selected` 读取 DOM 或 CSS 类。

## 稳定标识与交互

- surface 根元素保留 `data-surface-id`。
- 内容承载元素保留 `data-content-id`。
- stub 入口保留 `data-node-id` 并显示明确反馈。
- functional/simulated 节点必须产生规格要求的状态变化、反馈与数据回填。
- excluded 节点不得出现在路由、入口或 DOM。

默认使用内存状态；只有需求明确要求刷新或跨会话保留时才持久化。

## 验证与交接

至少执行：

```bash
node scripts/specs.mjs check
node scripts/specs.mjs test
node scripts/validate-wego-design.mjs
```

完成后确认：当前 Schema 唯一、规格覆盖、路由唯一、组件和 Token 有来源、交互与回填可走通、本地直开成立，然后交给 `wego-tests`。

## 禁止事项

- 不复制第二套 App 宿主或 UI Kit 展示外壳。
- 不发明组件、变体、Token、打开方式或业务字段。
- 不编造浏览器、提交、推送、部署或线上结果。
- 不保留旧 Schema、旧 route 字段或兼容执行路径。