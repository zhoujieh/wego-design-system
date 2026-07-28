---
name: share
description: "使用用户首选的部署工具分享可运行的原型。"
---

# 分享

部署用户可运行的原型，以便他们与他人分享。

## 关键覆盖规则

- 继续之前，先参考插件路由 [$index](../index/SKILL.md)。
- 遵循 [$critical-overrides](../../references/critical-overrides.md)。

## 用户上下文

开始前，加载 [$user-context](../user-context/SKILL.md)，并在本地 shell 访问可用时运行其预检脚本。

在相关时，使用已保存的产品 URL、Figma 文件、截图、参考图像、代码库路径、Storybook、设计令牌、设计系统、品牌资产、组件参考、浏览器偏好和分享目标作为基础材料。

不要检查每个已保存的参考。只检查当前任务需要的。

## 工作流程

1. 确认原型目录和用户首选的部署目标。
2. 如果用户使用 @Sites、@Vercel 或其他部署工具调用产品设计，将其视为选定的托管目标。
3. 如果用户没有选择目标，问一个问题：

> 我应该将其部署到哪里：@Sites、@Vercel 还是其他目标？

4. 首次使用 Sites 部署产品设计原型前，保持现有项目完整。运行 `npm run build` 和 `npm run test:sites`；对于 `mobile-app`，先运行 `npm run check:runtime`。确认 `dist/client/index.html`、`dist/server/index.js`、`dist/.openai/hosting.json` 和源文件 `.openai/hosting.json` 存在。将验证通过的项目交给 `sites-hosting`。不要调用 `sites-building`、运行 `init-site.sh` 或用 Vinext 启动器替换产品设计运行时。
5. 在选定部署工具可用时使用它。
6. 如果选定工具不可用，清楚说明并询问是否使用其他目标。
7. 尽可能运行部署。如果你能直接完成部署，不要给出设置说明。
8. 返回可分享的 URL。
9. 说明用户仍需手动处理或跟进的事项。

## 规则

- 用户选择或确认目标之前不要部署。
- 在获得可用 URL 之前不要声称原型已分享。
- 如果选定工具不可用，清楚说明并询问是否使用其他目标。
