# wego-app

微购相册静态 App 原型项目。

- 入口：`index.html`
- 路由：hash route，例如 `#/my-permission-management`
- 场景：`scenes/{中文业务场景}/scene.js`
- 样式：`scenes/{中文业务场景}/scene.css`
- 资源：`lib/` 为设计系统部署副本

业务场景通过 `window.WegoApp.registerScene()` 注册，不运行时读取本地 HTML 片段。项目可部署到 Vercel，也可本地直接打开 `index.html` 预览。
