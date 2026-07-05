# wego 静态 App 原型与设计系统

## 这个仓库是什么

微购(WeGo)中文静态 App 原型与设计系统仓库。复制即可用——用户只需要输出业务需求,AI 负责生成符合微购设计语言的移动端静态交互原型。

默认面向移动端、微信生态、电商/工具场景;不依赖特定 agent 运行时,任意 AI agent 读取本文件与对应 `SKILL.md` 即可上手。

主 App 固定在 `wego-app/`:

- `wego-app/index.html` 是唯一 App 入口和预览宿主
- 电脑端在手机壳中预览,移动端同链接铺满真实 viewport
- 预览以 Vercel 固定链接为主,同时必须支持本地直接打开 `wego-app/index.html`
- 业务场景全部进入 `wego-app/scenes/{中文业务场景}/`
- 页面路由使用 hash route,如 `#/my-permission-management`
- `wego-app/lib/` 是部署用设计系统资源副本
- 旧的“每个任务生成一个独立原型文件夹”模式废弃

## 技能触发矩阵

对 Codex、Trae 等会读取仓库文档的 agent，同样按这套分流执行；不要只看文件名猜测技能。

| 用户意图 / 请求特征 | 必须先触发的技能 | 前置条件 | 下一步交接 |
| --- | --- | --- | --- |
| 业务开发、做页面、做原型、做场景、接业务需求、做新业务编辑任务 | `wego-product` | 无 | `page_spec` 完成后交给 `wego-design`，再进入 `wego-ux`、`wego-tests` |
| 已有 `page_spec`，要出页面范式、UI Kit、组件映射、打开方式、`design_consumption_plan` | `wego-design` | 已有 `page_spec` | `design_consumption_plan` 完成后交给 `wego-ux` |
| 已有 `page_spec` + `design_consumption_plan`，要正式生成或更新 `wego-app` 场景 | `wego-ux` | 已落盘的 `page_spec` + `design_consumption_plan` | 原型完成后交给 `wego-tests` |
| 验收、检查、回归、review 当前场景是否符合规格 | `wego-tests` | 当前场景已生成，且 `route_id` 已注册 | 输出 `acceptance_report`，必要时把问题归因回前置技能 |
| 改组件、补 preview、改契约、改 UI Kit、改 metadata、补守门 | `wego-uxsystem-iterate` 的`迭代模式` | 当前目标属于设计系统本体或 UI Kit | 按 `references/workflow.md` / `sync-matrix.md` 同步 |
| 补规则、沉淀经验、优化流程、修技能链路、修触发机制 | `wego-uxsystem-iterate` 的`工作流迭代模式` | 当前目标属于经验回流或工作流分流 | 按 `references/workflow-iteration.md` 回流到对应环节 |
| 只要求检查组件是否合理、是否漂移、是否该收敛规则 | `wego-uxsystem-iterate` 的`审查模式` | 当前目标属于设计系统审查 | 先出 findings，再决定是否转迭代模式 |

补充硬规则:

- 用户只说“帮我做这个业务页面”这类模糊请求时，默认按业务开发处理，先走 `wego-product`，不允许直接跳过
- 没有 `page_spec` 时，不直接触发 `wego-design`
- 没有 `design_consumption_plan` 时，不直接触发 `wego-ux`
- 组件/UI Kit/工作流问题，不要误走业务开发链路；优先判断是否应进入 `wego-uxsystem-iterate`
- 技能总路由入口见 `.codex/skills/README.md`

## 如何开始(标准流水线)

收到业务需求后,按顺序走 4 段主链路,每段入口是对应 `SKILL.md`:

1. `.codex/skills/wego-product/` → 输出 `page_spec`(需求理解、任务分类、场景判断)
2. `.codex/skills/wego-design/` → 输出 `design_consumption_plan`(设计系统消费、UI Kit 映射)
3. `.codex/skills/wego-ux/` → 更新 `wego-app` 静态 App 与对应 `scenes/` 场景模块
4. `.codex/skills/wego-tests/` → 输出当前任务范围的 `acceptance_report`(验收)

组件迭代、新增组件、组件契约与 preview 同步,以及工作流规则沉淀,都走第 5 个技能 `.codex/skills/wego-uxsystem-iterate/`。

硬性交接规则:

- 没有 `page_spec` 时不直接进入设计消费
- 没有 `design_consumption_plan` 时不直接生成原型
- 当前业务场景未落成 `wego-app/scenes/{中文业务场景}/` 时不验收

## 沟通要求

- 始终用简洁、通俗易懂的中文沟通。
- 先理解当前技能链路和 `wego-design` 设计系统,再修改文件;不要只改一个文件就结束。
- 每次回复都要说明本轮改了什么、验证了什么、还有什么风险。

## 技能入口

5 个技能全部位于 `.codex/skills/`,职责与读取顺序详见各 `SKILL.md`:

- `wego-product/` — 需求理解、任务分类、页面规格 `page_spec`
- `wego-design/` — 设计系统消费、场景判断、UI Kit 与组件映射 `design_consumption_plan`
- `wego-ux/` — 正式输出产品原型项目
- `wego-tests/` — 最终验收,输出 `acceptance_report`
- `wego-uxsystem-iterate/` — 项目级别迭代(组件迭代/UI Kit 迭代/工作流迭代)

统一路由说明见 `.codex/skills/README.md`; agent 先判断用户意图,再决定命中哪个技能,不要直接按文件路径盲改。

## 仓库级约束

以下约束跨技能通用,技能内不再重复:

- 原型产物必须落在 `wego-app/` 静态 App 中;业务场景必须落在 `wego-app/scenes/{中文业务场景}/`,不能散落在仓库根目录;同一业务场景迭代复用原场景目录(详见 `wego-ux/SKILL.md`)
- `wego-app/index.html` 是唯一宿主 App 入口;不为每个业务场景复制第二套宿主壳
- 业务页面不得运行时依赖 `fetch()`/`XHR` 读取本地 HTML 片段;场景通过 `scene.js` 注册 template 与交互,确保 Vercel 和本地直接打开都可用
- `wego-app/lib/` 是设计系统部署副本,禁止直接编辑其中的 CSS、字体、图标或图片;必须先修改 `.codex/skills/wego-design/` 源文件,再运行 `node scripts/sync-wego-app-lib.mjs` 同步
- 原型交互必须体现真实业务流程和数据状态变化,但不默认强制 localStorage 持久化;只有需求明确要求刷新后保留时才做持久化
- 设计系统本体迭代必须递增 `.codex/skills/wego-design/metadata.json` 的 `version`;纯仓库管理类变更可不递增(详见 `wego-uxsystem-iterate/SKILL.md`)
- 不提交 `.DS_Store`、`.uploads/`
- AGENTS.md 只承载顶层仓库关键信息与仓库偏好规则;不承载工作流迭代方法论、组件迭代步骤、单个组件规则;后者一律落到对应技能的 references/ 或权威数据文件

## 经验沉淀与工作流迭代

工作流迭代(经验沉淀、规则补充、流程优化、场景类型注册)遵循 `.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md` 的经验沉淀通用化原则。AGENTS.md 不重复具体规则。

新增规则时,仓库级硬约束(影响所有技能的)仍回流到 AGENTS.md 的"仓库级约束"章节;只影响单个工作流环节的规则回流到对应技能文档。

## Git 与发布

- 默认使用 `main` 分支
- 提交前用显式路径 `git add`,不要无脑 `git add -A`
- 推送前先确认远端状态;如果远端已有分支,不强推
- 提交信息用简短中文动词短语,例如 `完善 wego 本地技能闭环`

## 提交前完整性检查

- 运行 `node scripts/validate-wego-design.mjs` 通过守门(JSON 格式、Token 同步、组件三向对齐、components.css 完整性、UI Kit 成对、过期路径、禁止文件、metadata version)
- 确认 `metadata.json` version 已按本轮变更递增
- 确认原型产物落在 `wego-app/` 和对应 `wego-app/scenes/` 场景目录

## 设计系统方向与边界

设计系统方向、组件清单、消费边界、变更同步矩阵、设计质量门禁的权威来源:

- `.codex/skills/wego-design/README.md`
- `.codex/skills/wego-design/SKILL.md`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/uikit-plan.json`
- `.codex/skills/wego-design/components/index.json`
- `.codex/skills/wego-design/specs/*.md`

遇冲突以技能本体为准,不在 AGENTS.md 维护副本。
