# wego-app

微购相册静态 App 原型项目。

- 入口：`index.html`
- 路由：hash route，例如 `#/my-permission-management`
- 场景：`scenes/{中文业务场景}/scene.js`
- 样式：`scenes/{中文业务场景}/scene.css`
- 设计决策：`scenes/{中文业务场景}/design-decisions.json`
- 统一原型数据库：`data/prototype-db.js`
- 正式迭代：`scenes/{主业务场景}/_iterations/{日期}-{iteration_id}-{标题}/`
- 资源：`lib/` 为设计系统部署副本

业务场景通过 `window.WegoApp.registerScene()` 注册，不运行时读取本地 HTML 片段。项目由 GitHub Actions 部署到 [GitHub Pages](https://zhoujieh.github.io/wego-design-system/)，也可本地直接打开 `index.html` 预览。

需要商品、素材、发布者或动态内容的场景统一从 `window.WEGO_PROTOTYPE_DB` 读取对应数据。此类场景不得在 `scene.js` 里临时维护独立商品库；新增鞋子、包袋等品类先补 `data/prototype-db.js`，再由场景按 `product_id` 或 `asset_id` 引用。

主 App 的 `scene.js`、`scene.css` 与提取生成的 `design-decisions.json` 始终表示当前最新状态；`_iterations/` 保存正式业务迭代的范围确认、阶段记录，以及仅在用户明确要求冻结时生成的交付快照。一次迭代只归档在唯一主业务场景下，关联场景不重复保存同一迭代。
