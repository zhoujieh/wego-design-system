# wego-design-system

> 微购中文静态 App 原型与设计系统仓库。用户只需要提供业务需求，AI 负责生成符合微购设计语言的移动端交互原型。

## 当前产物目标

仓库固定输出一个完整静态 App 原型：

- App 项目位于 `wego-app/`
- 入口为 `wego-app/index.html`
- 业务场景位于 `wego-app/scenes/{中文业务场景}/`
- 路由使用 hash route
- 电脑端在手机壳中预览，移动端同链接铺满真实 viewport
- 预览以 Vercel 固定链接为主，同时支持本地直接打开 `wego-app/index.html`
- 旧的“每个任务生成一个独立原型文件夹”模式已经废弃

## 技能闭环

仓库统一采用 4 个本地技能闭环，全部位于 `.codex/skills/`：

1. `wego-product`
   负责理解原始需求并输出 `page_spec`
2. `wego-design`
   负责消费设计系统并输出 `design_consumption_plan`
3. `wego-ux`
   负责更新 `wego-app` 和对应业务场景
4. `wego-tests`
   负责按当前任务范围验收并输出 `acceptance_report`

这 4 段职责分开，避免一个技能同时承担需求理解、设计消费、原型生成和验收。

## 当前设计系统位置

设计系统本体位于：

- [.codex/skills/wego-design/SKILL.md](.codex/skills/wego-design/SKILL.md)
- [.codex/skills/wego-design/README.md](.codex/skills/wego-design/README.md)
- [.codex/skills/wego-design/library-consumption.json](.codex/skills/wego-design/library-consumption.json)
- [.codex/skills/wego-design/uikit-plan.json](.codex/skills/wego-design/uikit-plan.json)

旧目录已退出当前执行链路，不再作为权威路径。

## 核心目录

- `wego-app/`：可部署到 Vercel 的静态 App 原型项目
- `.codex/skills/wego-product/`：产品需求理解技能
- `.codex/skills/wego-design/`：设计系统本体与消费技能
- `.codex/skills/wego-ux/`：原型项目输出技能
- `.codex/skills/wego-tests/`：验收技能
- `.codex/skills/wego-uxsystem-iterate/`：项目级别迭代技能
- `docs/`：计划文档、历史审查文档、参考资料
- `scripts/validate-wego-design.mjs`：当前设计系统守门脚本

## 原型输出规则

- 正式输出产品原型的环节固定为 `wego-ux`
- 原型必须更新到 `wego-app/`，不能把业务文件直接丢在仓库根目录
- 同一业务场景的迭代必须复用 `wego-app/scenes/{中文业务场景}/`
- `wego-app/index.html` 是唯一 App 宿主和预览外壳；业务场景不再复制宿主壳
- 业务场景通过 `scene.js` 注册 template、打开方式和交互，不依赖运行时 `fetch()`/`XHR` 读取本地 HTML 片段
- 支持 push、modal、sheet、full-screen-modal 等打开方式，具体由 `design_consumption_plan` 决定
- 页面交互必须体现真实业务数据状态和流程闭环，但不默认要求刷新后持久化保存
- 默认无需构建、无需框架，可部署到 Vercel，也可本地直接打开 `wego-app/index.html`

## 设计系统方向

- 风格：简洁、干净、淡雅、克制
- 优先级：清晰 > 一致 > 效率 > 美观 > 创新
- 主色：微信绿 `#03C160`
- 默认场景：移动端、微信生态、电商、工具、社交
- 默认密度：移动端高信息密度

禁止方向漂移：

- 不把系统改成桌面 IDE、后台工作台或营销大屏
- 不把 Showcase 外壳当作生产页面模板

## 常用入口

- 根规则：[AGENTS.md](AGENTS.md)
- 设计系统技能：[.codex/skills/wego-design/SKILL.md](.codex/skills/wego-design/SKILL.md)
- 项目级别迭代技能：[.codex/skills/wego-uxsystem-iterate/SKILL.md](.codex/skills/wego-uxsystem-iterate/SKILL.md)
- 闭环计划：[docs/wego-local-skills-closed-loop-plan.md](docs/wego-local-skills-closed-loop-plan.md)

## 验证

当前设计系统守门脚本：

```bash
node scripts/validate-wego-design.mjs
node scripts/validate-wego-design.mjs --scope=full --strict
```

组件样式聚合脚本：

```bash
node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design
```
