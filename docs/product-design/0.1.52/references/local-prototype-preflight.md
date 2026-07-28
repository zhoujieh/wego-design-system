# 本地原型预检

在创建新的本地原型之前使用此文件。

- 将工作自包含在新的项目文件夹中。
- 插件 UI 图标位于 `../assets/`。不要将原型启动代码或生成的应用资产放在那里。
- 捆绑的产品设计启动器位于 `../templates/`。
- 对于 Web 或桌面风格的原型，使用默认的 `prototype` 模板。
- 对于移动应用原型，使用 `--template mobile-app`。
- 使用引导脚本创建应用。相对于此文件解析脚本路径，然后使用绝对路径运行它：

```bash
node /absolute/path/to/plugins/product-design/scripts/bootstrap-prototype.mjs --dest /absolute/path/to/new-prototype
```

```bash
node /absolute/path/to/plugins/product-design/scripts/bootstrap-prototype.mjs --template mobile-app --dest /absolute/path/to/new-mobile-prototype
```

- 对于 `mobile-app`，从生成的项目根目录运行 `npm ci --prefer-offline --no-audit --no-fund`。对于 Web `prototype` 模板，运行 `npm install --prefer-offline --no-audit --no-fund`。使用环境中配置的 npm 缓存。
- 不要因为包安装慢就用静态 HTML 替换启动器。如果安装确实被阻塞，请报告阻塞原因。
- 一旦选择了移动端模板并安装了依赖，立即启动预览，以便用户在构建界面时可以看到设备外壳。在整个实现和 QA 过程中保持预览运行。
- 两个模板都使用普通的 Vite 开发环境进行本地主机和工作模式预览。不要在应用代码中硬编码 `localhost` 或 `terminal.local`；使用相对 URL 和同源请求。
- 两个模板都已为 Sites 做好准备。`npm run build` 会在 `dist/client` 下输出静态客户端文件，在 `dist/server/index.js` 输出所需的 Worker，在 `dist/.openai/hosting.json` 输出元数据。在将已验证的项目交给 Sites 之前，运行 `npm run test:sites`。不要运行 `init-site.sh` 或用 Vinext 启动器替换产品设计项目。


使用 `mobile-app` 模板时，保留其运行时外壳。不要将 `App` 替换为独立页面，也不要移除 `PhoneFrame`、iPhone / Pixel 10 设备选择器、`KeyboardProvider`、`MobileScroll`、`KeyboardDock`、`StatusBar`、`HomeIndicator`、平台专属的 iOS / Android 底部装饰，或 Pixel 摄像头挖孔，除非用户明确要求更改运行时。`FlowStack` 可用于多屏流程，但简单的单屏原型可以直接在 `KeyboardProvider` 内部挂载 `MobileScroll`。将 `StatusBar`、iOS 主屏幕指示器和摄像头挖孔作为叠加的设备外壳保留。Android 键盘关闭时的应用视口会预留导航栏区域；Android 键盘打开状态继续使用键盘资源内置的 IME 导航条。将 iOS 安全区域的内容内边距放在每个应用屏幕上，而不是放在滚动包装器上。`FlowScreen.footer` 也是叠加层，因此使用固定底部标签页或导航栏的界面必须自行添加底部内容内边距，而不是依赖流程外壳来预留空间。

在 `src/Prototype.tsx` 和 `src/prototype.css` 中构建应用专属 UI。将 `src/App.tsx`、`src/main.tsx`、`src/styles.css`、`src/mobile/`、`public/assets/iphone/`、`public/assets/android/`、`public/assets/status/`、`vite.config.ts`、`worker/index.js` 和 `scripts/prepare-sites-build.mjs` 视为受保护的运行时文件。在预览或交付前运行 `npm run check:runtime`；如果检查失败，请恢复运行时。

对于 Sites 托管，保持移动端项目完整。`npm run build` 会在 `dist/client` 下输出静态客户端文件，在 `dist/server/index.js` 输出所需的 Worker，在 `dist/.openai/hosting.json` 输出元数据。在将已验证的项目交给 Sites 之前，运行 `npm run test:sites`。不要运行 `init-site.sh` 或用 Vinext 启动器替换移动端运行时。
