# wego-app AI UXDesign 工作流

微购中文静态 App 原型与设计系统仓库，默认面向移动端、微信生态、电商和工具场景。AI 必须按用户意图进入对应技能，不得绕过产品确认、设计系统消费或验收守卫。

## 权威入口

- 技能路由与主链路：`.codex/skills/README.md`
- 共享设计决策原则：`.codex/skills/shared/references/design-decisions.md`
- 详细方法、Schema 和同步范围：各技能 `SKILL.md` 直接引用的 `references/`
- 本文件只保留跨任务必须遵守的仓库级硬约束，不重复定义技能内部方法。

每次会话先理解完整工作流和影响范围，不按用户点名文件机械修改。交付说明使用简洁中文，如实说明改动、验证和风险。

## 固定产物

- `wego-app/index.html` 是唯一 App 入口和预览宿主；电脑端显示手机预览壳，移动端铺满真实 viewport。
- 业务场景进入 `wego-app/scenes/{中文业务场景}/`；稳定 kebab-case `route_id` 通过 `#/route-id` 访问，目录名不是 `route_id`。
- 新场景增量维护 `wego-app/js/routes.js`、`scene.js` 和 `scene.css`，并通过 `window.WegoApp.registerScene` 注册模板、presentation 和交互。
- `wego-app/lib/` 是设计系统部署副本，禁止直接编辑；先改 `.codex/skills/wego-design/` 权威源，再运行 `node scripts/sync-wego-app-lib.mjs`。
- 原型产物不得散落在仓库根目录。

## 技能路由与主链路

- 新业务需求、页面、流程或已有场景的需求笔记：先用 `wego-product` 形成并确认 `prototype_brief`。
- 基于已确认简报实现新场景，或修改已有场景的交互与视觉：使用 `wego-design`。
- 组件、Token、Preview、UI Kit、消费规则、守门、设计系统缺口和工作流优化：使用 `wego-uxsystem-iterate`。

业务迭代必须遵守以下门禁：

- 新业务需求或已有场景修改必须归属主业务场景 `_iterations/` 下的有效迭代。同一需求的验收与反馈优先复用当前未冻结迭代；只有无可复用迭代、用户明确开始独立需求，或原迭代已冻结/终止时才新建。
- `wego-product` 完成 `prototype_brief` 草案并清空 `open_questions` 后，通过 `submit-brief → confirm-brief` 绑定当前范围、展示文字摘要并取得用户明确确认；用户目标、入口、首要任务、主要操作、可见结果和必要状态未齐备时先澄清，不得补造。
- 任何影响目标、范围、入口、路径、状态、数据或可见结果的简报修改都会使当前提交失效，必须在原迭代中更新简报、重新提交并确认。系统不生成线框图或文本分镜；用户主动提供的线框图只作为设计阶段的结构输入。
- 已确认 `prototype_brief` 即 `wego-design` 的设计与实现授权。设计阶段先按输入职责形成临时 `generation_packet`，再完成设计意图、精确范式/自主组合裁决、语义区域和页面布局合同，最后选择组件；不得从组件清单反推布局、选择近似 UI Kit 或拼接多个 UI Kit。
- `wego-design` 在已确认范围内自主决定设计细节，不建立第二次确认门禁；会改变目标、范围、路径、状态或结果的业务事实缺失或冲突，必须退回 `wego-product`。
- 每个场景必须有 `prompt_contract`（含 `layout_contract`）、状态合同、设计决策证据、场景合同守卫、交互守卫和固定视口视觉检查；场景源码变化后必须重提取 `design-decisions.json`。
- 确认、测试、交付、提交、部署或时间经过都不代表冻结。只有用户明确指定迭代并要求“冻结”后才能执行 `freeze`；冻结迭代不得覆盖。

## 场景边界

- 业务场景不得通过 `fetch()` 或 XHR 读取本地 HTML；必须体现真实业务状态和流程反馈，仅在需求明确要求刷新后保留时使用持久化。
- 页面根、滚动层、安全区、语义内容组和 sticky/fixed 区域必须遵循 `.codex/skills/wego-design/references/scene-contract.md` 与 `.codex/skills/wego-design/library-consumption.json`，禁止用页面根统一承担内容边距或安全区。
- 页面结构确定后按 Preview-first 顺序消费组件；场景组件 DOM 必须逐字复制对应 Preview 变体，包括节点层级、class 顺序和可选子元素位置。
- `wego-design` 不定义业务事实、不直接修改设计系统源；正式能力不足时只记录最小缺口说明，交由 `wego-uxsystem-iterate` 收敛。

## 组件与 UI Kit 一致性

- 组件、Preview、索引、Token、UI Kit、质量报告和消费契约按同步矩阵保持一致；`components.css` 只能由 Preview 提取脚本生成。
- 正式设计系统迭代必须递增 `.codex/skills/wego-design/metadata.json.version`。`.trae/skills/*` 是 `.codex/skills/*` 的符号链接，不作为独立副本维护。

## 临时产物

- `.uploads/`、`output/` 和 `.playwright-cli/` 只保存任务输入或短期诊断产物，不是正式产物，也不提交；不提交 `.DS_Store`。
- 开始和结束任务运行 `node scripts/cleanup-task-artifacts.mjs clean`。结束前删除本任务创建的精确临时文件；只有确认目录未被其他任务使用或用户明确要求时才运行 `clean --all`。

## Git 与验证

- 默认直接在 `main` 开发；除非用户明确要求，不自行创建分支或 PR。
- 只暂存本次任务的显式路径，不执行 `git add -A`；提交信息使用简短中文动词短语，不强推已有远端分支。
- 提交前运行：

```bash
node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design
node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design --check
node scripts/validate-component-contract-parity.mjs
node scripts/validate-wego-design.mjs
```

正式合并前按需运行 `node scripts/validate-wego-design.mjs --scope=full --strict`。

<!-- rule-id: local-server-must-auto-exit -->
启动本地验证服务时，开始与结束均检查 `lsof -iTCP -sTCP:LISTEN -P | grep python`，并确保服务自动退出或在任务结束时清理。
