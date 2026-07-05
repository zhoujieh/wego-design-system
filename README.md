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

仓库当前采用 5 个本地技能协作：

1. `wego-product`
   负责理解原始需求并输出 `page_spec`
2. `wego-design`
   负责消费设计系统并输出 `design_consumption_plan`
3. `wego-ux`
   负责更新 `wego-app` 和对应业务场景
4. `wego-tests`
   负责按当前任务范围验收并输出 `acceptance_report`
5. `wego-uxsystem-iterate`
   负责组件迭代、UI Kit 迭代、工作流迭代和审查

其中前 4 个是业务开发主链路，第 5 个负责设计系统与工作流本体迭代。

## 技能触发矩阵

对 Codex、Trae 等会读取仓库文档的 agent，同样按这套分流执行：

| 用户意图 / 请求特征 | 必须先触发的技能 | 前置条件 | 下一步交接 |
| --- | --- | --- | --- |
| 业务开发、做页面、做原型、做场景、接业务需求 | `wego-product` | 无 | 输出 `page_spec` 后交给 `wego-design` → `wego-ux` → `wego-tests` |
| 已有 `page_spec`，要出页面范式、UI Kit、组件映射、打开方式 | `wego-design` | 已有 `page_spec` | 输出 `design_consumption_plan` 后交给 `wego-ux` |
| 已有 `page_spec` + `design_consumption_plan`，要正式生成或更新 `wego-app` 场景 | `wego-ux` | 两份规格文件都已落盘 | 原型完成后交给 `wego-tests` |
| 验收、检查、回归、review 当前场景是否符合规格 | `wego-tests` | 当前场景已生成 | 输出 `acceptance_report` |
| 改组件、补 preview、改契约、改 UI Kit、改 metadata、补守门 | `wego-uxsystem-iterate` 的`迭代模式` | 目标属于设计系统本体 | 按同步矩阵执行 |
| 补规则、沉淀经验、优化流程、修技能链路、修触发机制 | `wego-uxsystem-iterate` 的`工作流迭代模式` | 目标属于工作流回流 | 回流到对应技能或权威数据文件 |
| 审查组件 / UI Kit / 工作流是否合理 | `wego-uxsystem-iterate` 的`审查模式` | 目标属于设计系统审查 | 先出 findings，再决定是否转修复 |

补充硬规则：

- 用户只说“帮我做这个业务页面”这类模糊请求时，默认按业务开发处理，先走 `wego-product`
- 没有 `page_spec` 时，不直接触发 `wego-design`
- 没有 `design_consumption_plan` 时，不直接触发 `wego-ux`
- 组件 / UI Kit / 工作流问题，不要误走普通业务开发链路
- 统一技能路由入口见 `.codex/skills/README.md`

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
- `.codex/skills/README.md`：技能总路由入口
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
- 技能路由入口：[.codex/skills/README.md](.codex/skills/README.md)
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
