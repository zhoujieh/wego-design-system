# 场景合同

> 创建或修改业务场景时按命中章节读取。本文只保留源码和运行结果能够验证的要求，不要求人工合同或设计自证。

## 固定产物

```text
wego-app/js/routes.js
wego-app/scenes/{分类}/{中文业务场景}/route.json
wego-app/scenes/{分类}/{中文业务场景}/scene.js
wego-app/scenes/{分类}/{中文业务场景}/scene.css
```

`route.json` 保存场景路由元数据（routeId、入口、展示方式等），被 `build-routes.mjs` 消费。

禁止创建独立场景 HTML、第二个宿主、`style.css`、以 route_id 命名的目录或运行时 `fetch/XHR`。

## 路由与 scene.js

<!-- rule-id: scene-registration-contract -->

- 通过 `window.WegoApp.registerScene` 注册 `routeId`、template、presentation 和 `init`。
- `routes.js` 只对 `window.WEGO_APP_ROUTES` 静态赋值一次；`routeId` 全局唯一。
- 入口 `entry.type` 只能是 `host-tab`、`grid-entry` 或 `cell-entry`，并声明 `entry.tab`；`host-tab` 的 tab 全局唯一。
- template 根节点唯一声明 `data-surface-id`、`data-route-id` 和 `data-layout-mode`。`pattern` 额外声明 `data-page-pattern`，`composed` 不声明页面范式。
- 正式组件实例声明正确的 `data-component-slug`；守卫直接根据源码、组件索引、Preview 和契约验证实例，不要求额外 binding 或人工实例编号。
- 交互触发器使用稳定且唯一的 `data-dom-id`，并在 `init` 或对应渲染逻辑中实际绑定。

<!-- rule-id: scene-global-implementation-mode -->
**全局实现模式**：当场景的模板与交互逻辑均由外部全局模块（如 `lib/js/*.js`）提供时，在 `scene.js` 开头声明 `wego-design-contract` 注释：

```js
/* wego-design-contract: { "implementation": "global" } */
```

此时 `scene.js` 仅做路由注册与 `init` 转发，守卫跳过依赖完整 `init` 字面逻辑的检查（页面根定位、交互绑定等）。普通内联实现场景不得声明此模式。

<!-- rule-id: routes-subpage-no-entry -->
只有宿主入口声明 `entry`；下钻页由 `presentation.type` 决定打开方式，不声明 `entry`。

<!-- rule-id: cross-route-data-handoff-appstate -->
状态只写当前 `ctx.state`、明确共享的 `ctx.appState` 或需求明确要求的持久化位置，不直接改写其他场景状态。

<!-- rule-id: interaction-dom-id-placeholder -->
动态列表项可以在渲染时生成稳定 `data-dom-id`；插值键必须来自真实数据，事件委托或批量绑定必须覆盖实际生成的节点。

<!-- rule-id: overlay-host-runtime-integration -->
浮层通过对应 `ctx` API 打开，场景不重复实现宿主遮罩、固定定位或安全区。

<!-- rule-id: overlay-component-consumption-binding -->
传给 overlay API 的 HTML 必须使用对应 Preview 的完整组件根、面板和子内容；默认允许 mask/cancel 关闭的组件必须实际调用关闭 API。守卫直接检查 API、组件 DOM 和关闭逻辑，不要求另写交互或组件绑定清单。

## 业务组件复用

<!-- rule-id: business-component-first -->
场景涉及可复用业务能力（帮卖、产品分享、产品编辑/发布/转发、升级引导等）时，先按适用业务场景查业务组件清单（`references/library-map.md` 业务组件分类 + `runtime/`），命中即复用，不重复实现。

<!-- rule-id: business-component-consumption-api -->
业务组件经 `window.WegoApp.open{Component}` 全局 API 消费，调用前用 `window.WegoApp && window.WegoApp.open{Component}` 判空防御；业务组件由 `index.html` 全局加载，不注册场景路由，不从 `scene.js` 懒加载。

<!-- rule-id: business-component-new-entry -->
业务组件清单无命中才新做，新做组件归入 `runtime/`（同步至 `lib/js/`），头部注释按统一范式写明【业务场景】【适用场景】【消费方式】，并登记回 `library-map.md` 与 `library-consumption.json` 的业务组件层。

## scene.css

<!-- rule-id: business-state-class-scoped-prefix -->

- 业务状态类必须由场景选择器限定，不单独使用通用状态类，也不把业务状态发明成组件 modifier。
- 场景样式只负责根作用域内的区域关系、语义分组、滚动和业务胶水。
- 页面根使用 `position: absolute; inset: 0` 并保持通栏；主滚动区不承担统一内容边距。

<!-- rule-id: spacing-must-use-spacer-token -->

- 禁止硬编码颜色、间距、圆角和组件内部视觉值；内容边距使用 `--layout-page-margin-*`，其余间距使用 `var(--spacer-*)`。
- 页面必须存在真实主滚动行为；`overflow:hidden` 只用于明确的裁切边界。
- sticky/fixed 区域必须有不透明背景、正确层级和实际内容避让；底部遮挡按 `library-consumption.json#/layoutContract/scrollBottomRule` 验证。

<!-- rule-id: safe-area-top-single-owner -->
顶部安全区只能由 navbar、顶部固定元素或滚动内容层之一承担；禁止页面根重复预留，也禁止用 JS 读取安全区变量后再写 padding。

## 可选设计说明

只有存在不直观的结构取舍或正式能力回退时，才在 `scene.js` 相邻代码处保留 1–3 句说明：

- `Layout`：解释关键区域、信息降级或 sticky/fixed/overlay 的业务原因。
- `Exception`：说明正式能力缺口和采用的回退。

说明不是合同，不要求固定格式，守卫不解析措辞；可从简报或源码直接看出的内容不重复记录。

## 完成门禁

源码守卫直接提取并验证路由、根属性、组件实例、Token、交互触发器、overlay 调用、滚动和 sticky/fixed 关系：

```bash
node scripts/validate-scene-contract.mjs wego-app/scenes/{分类}/{中文业务场景}
node scripts/validate-scene-runtime.mjs wego-app/scenes/{分类}/{中文业务场景}
```

运行时守卫自动启动并清理本地服务，在真实浏览器的 375px 和 393px 视口检查控制台与资源错误、横向溢出、运行时组件结构和变体、交互 listener，以及可发现的 overlay 打开/关闭。主行动、必要状态反馈和核心路径仍需结合实际页面验收。证据保留在运行结果中，不写回场景。
