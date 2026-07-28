# 原型说明

自己运行本地服务器，并在当前环境可用的浏览器中打开预览。当你可以运行时，不要给用户提供服务器启动说明。

在进行重大视觉更改之前，当视觉来源不明确或不再符合当前目标时，使用产品设计插件的 `get-context` 技能。当用户提供持久的、原型专属的设计反馈、偏好或决策时，将它们记录在 `AGENTS.md` 中。

在根据选定的生成模型实现时，将该图像视为布局、组件解剖、密度、间距、颜色、排版、可见内容和层次结构的唯一事实来源。

在 `src/` 中构建应用 UI。保持 `.openai/hosting.json`、`worker/index.js`、`scripts/prepare-sites-build.mjs` 和 `tests/sites-worker.test.mjs` 完整，以便同一个本地原型可以交给 Sites。在交给 Sites 之前，运行 `npm run build` 和 `npm run test:sites`；构建后必须保留 `dist/client/index.html`、`dist/server/index.js` 和 `dist/.openai/hosting.json`。
