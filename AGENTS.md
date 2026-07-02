# wego 设计系统

## 这个仓库是什么

微购(WeGo)中文产品原型与设计系统仓库。复制即可用——给 AI 发送业务需求,按 4 段流水线即可输出可在浏览器直接预览的移动端产品原型(静态 HTML/CSS/JS,无需构建、无需依赖)。

默认面向移动端、微信生态、电商/工具场景;不依赖特定 agent 运行时,任意 AI agent 读取本文件与对应 `SKILL.md` 即可上手。

## 如何开始(标准流水线)

收到业务需求后,按顺序走 4 段,每段入口是对应 `SKILL.md`:

1. `.codex/skills/wego-product/` → 输出 `page_spec`(需求理解、任务分类、场景判断)
2. `.codex/skills/wego-design/` → 输出 `design_consumption_plan`(设计系统消费、UI Kit 映射)
3. `.codex/skills/wego-ux/` → 输出原型项目(静态 HTML 任务级文件夹,浏览器直接打开)
4. `.codex/skills/wego-tests/` → 输出 `acceptance_report`(验收)

组件迭代、新增组件、组件契约与 preview 同步走第 5 个技能 `.codex/skills/iterate-component/`。

硬性交接规则:

- 没有 `page_spec` 时不直接进入设计消费
- 没有 `design_consumption_plan` 时不直接生成原型
- 原型未落成任务级文件夹时不验收

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
- `iterate-component/` — 已注册组件的迭代、新增、契约与 preview 同步和守门

## 仓库级约束

以下约束跨技能通用,技能内不再重复:

- 原型产物必须是项目根目录下的任务级文件夹,不能散落在仓库根目录;同一任务迭代复用原文件夹(详见 `wego-ux/SKILL.md`)
- 设计系统本体迭代必须递增 `.codex/skills/wego-design/metadata.json` 的 `version`;纯仓库管理类变更可不递增(详见 `iterate-component/SKILL.md`)
- 不提交 `.DS_Store`、`.uploads/`

## Git 与发布

- 默认使用 `main` 分支
- 提交前用显式路径 `git add`,不要无脑 `git add -A`
- 推送前先确认远端状态;如果远端已有分支,不强推
- 提交信息用简短中文动词短语,例如 `完善 wego 本地技能闭环`

## 提交前完整性检查

- 运行 `node scripts/validate-wego-design.mjs` 通过守门(JSON 格式、Token 同步、组件三向对齐、components.css 完整性、UI Kit 成对、过期路径、禁止文件、metadata version)
- 确认 `metadata.json` version 已按本轮变更递增
- 确认原型产物落在任务级文件夹
- 确认未提交 `.DS_Store`、`.uploads/`

## 设计系统方向与边界

设计系统方向、组件清单、消费边界、变更同步矩阵、设计质量门禁的权威来源:

- `.codex/skills/wego-design/README.md`
- `.codex/skills/wego-design/SKILL.md`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/uikit-plan.json`
- `.codex/skills/wego-design/components/index.json`
- `.codex/skills/wego-design/specs/*.md`

遇冲突以技能本体为准,不在 AGENTS.md 维护副本。
