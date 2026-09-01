# 业务组件状态展示场景（component-demo-scene）

## 目的

每个全局加载的业务组件（`wego-app/lib/js/` 下的业务组件，如 `resale-popup` / `upgrade-popup` / `product-share` / `product-editor`）都需要一个**状态展示场景**，把组件的全部形态/状态集中在一个页面里，点击即可拉起组件实例，方便走查与验收。这是 AGENTS.md「固定产物与边界」下的硬约束。

## 范式（参考 `scenes/bcg/帮卖分销/` 的 agent-resale）

1. **独立场景目录 + 三个文件**：`route.json`（声明 routeId + entry）、`scene.js`（registerScene）、`scene.css`（场景样式）。
2. **场景目录归属**：放在该组件的业务归属场景目录下（如产品分享 → `scenes/shop/产品分享/`，通用组件 → `scenes/infras/xxx/`）。若业务目录已被既有场景占用，放同分类下最贴近的目录。
3. **状态分组**：页面用 `layout-page` + `navbar` + `layout-scroll` 结构，顶部 intro 说明组件与状态范围，下方按状态维度分组（cell 卡片），每张卡片点击拉起一个状态实例。
4. **拉起组件**：`window.WegoApp.openXxx(ctx, options)`（如 `openResalePopup` / `openUpgradePopup` / `openProductShare` / `openProductEditor`），**组件本体零改动**，场景只负责传参。
5. **带显示守卫的组件**（如升级弹窗每天 1 次/仅 1 次）：演示前清空对应本地记录（`localStorage.removeItem('wego.xxx.*')`）保证每次必弹。
6. **依赖视口/宽度的状态**（如分享面板渠道分组、指示器显隐）：演示页可用注入限宽 style 模拟窄屏触发，刷新页面还原，并在 intro 里说明。
7. **关联场景管理列表**：把 `{ routeId, name, desc }` 追加到 `scenes/infras/场景管理/scene.js` 的 `scenes` 数组。
8. **注册路由**：运行 `node scripts/build-routes.mjs` 重新生成 `wego-app/js/routes.js`（生成物，禁止手改）。

## 验收清单

- [ ] 展示页覆盖组件**全部**状态（含异常/加载态）
- [ ] 点击卡片能拉起组件实例且状态正确
- [ ] 组件新增状态时已同步补入展示页
- [ ] 场景管理列表可见对应入口并跳转正常
- [ ] `node scripts/validate-wego-design.mjs --scope=system --strict` 通过
