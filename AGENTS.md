# wego-app AI UXDesign 工作流

## 仓库定位

微购中文静态 App 原型与设计系统仓库。用户提供业务需求，AI 按固定链路生成符合微购设计语言的移动端交互原型。

默认面向移动端、微信生态、电商、工具场景。所有设计输出必须先读取并遵循 `wego-design` 的唯一设计决策原则；本文件不重复定义设计原则。

## 固定产物

- `wego-app/index.html` 是唯一 App 入口和预览宿主。
- 业务场景统一进入 `wego-app/scenes/{中文业务场景}/`。
- 路由使用稳定 kebab-case `route_id`，访问地址使用 `#/route-id`；目录名不是 route\_id。
- 新场景必须增量维护 `wego-app/js/routes.js`、场景 `scene.js` 和 `scene.css`。模板、presentation、交互通过 `window.WegoApp.registerScene` 注册。
- 电脑端显示手机预览外壳，移动端同链接铺满真实 viewport。
- 预览以 Vercel 固定链接为主，同时支持本地直接打开 `wego-app/index.html`。
- `wego-app/lib/` 是设计系统部署副本，禁止直接编辑；先改 `.codex/skills/wego-design/` 源文件，再运行 `node scripts/sync-wego-app-lib.mjs`。

## 沟通要求

- 每次会话必须按用户意图触发对应技能。
- 先理解完整工作流和影响范围，禁止按用户点名文件机械修改。
- 使用简洁、通俗的中文说明改了什么、验证了什么、还有什么风险。
- 不堆砌技术名词，不编造未执行的验证或风险。

## 技能路由

| 用户意图                                     | 必须先触发                   | 前置条件                        | 下一步                                          |
| ---------------------------------------- | ----------------------- | --------------------------- | -------------------------------------------- |
| 原始业务需求、做页面、做原型、做新场景                      | `wego-product`          | 无                           | 必须由用户确认 `prototype_brief` 后再交给 `wego-design` |
| 基于已确认原型简报设计并实现业务场景、修改已有业务场景              | `wego-design`           | 必须有用户已确认的 `prototype_brief` | 生成场景、决策证据、守卫结果与必要的最小缺口说明                   |
| 改组件、Token、Preview、UI Kit、设计库消费规则、守门或处理设计系统缺口 | `wego-uxsystem-iterate` | 目标属于设计系统本体或系统规则             | 按组件/UI Kit 同步矩阵执行                            |
| 审查并沉淀经验、补充规则、优化工作流                       | `wego-uxsystem-iterate` | 用户明确要求沉淀或优化                 | 先进入经验候选流程                                    |

统一路由入口见 `.codex/skills/README.md`。

## 主链路硬门禁

- 新业务需求或已有场景修改必须归属主业务场景 `_iterations/` 下的有效迭代；历史场景再次修改时进入新流程。
- 新迭代必须先通过 `submit-brief → confirm-brief` 确认目标、范围、入口、关键路径和原型边界；确认后 `wego-design` 在同一任务中完成设计系统消费与交互原型。
- `wego-design` 不得定义业务事实或直接改设计系统源；业务需求描述不足必须退回 `wego-product`，设计系统缺口只记录最小缺口说明并由 `wego-uxsystem-iterate` 收敛。
- 每个场景必须有页面级 `prompt_contract`（含 `layout_contract`）、状态合同、设计决策证据、场景合同守卫、交互守卫和固定视口视觉检查；任何场景源码变化后都必须重提取决策文件。
- 组件消费必须 Preview-first：先读本页命中组件 Preview，再读契约；禁止猜 Token、class、子元素或 modifier。
- 组件、UI Kit、工作流问题不得误走普通业务开发链路。
- 冻结迭代不得覆盖；后续业务变化建立新迭代。纯设计系统、工作流或仓库管理变化不建立业务迭代。
- 修改已有场景的交互或者视觉必须使用`wego-design`技能。
- 修改已有场景的需求笔记使用`wego-product`技能。

## 仓库级约束

- 原型产物不得散落在仓库根目录。
- 业务场景不得依赖 `fetch()` 或 `XHR` 读取本地 HTML 片段。
- 场景必须体现真实业务状态和流程反馈；只有需求明确要求刷新后保留时才使用持久化。
- 设计系统本体正式迭代必须递增 `.codex/skills/wego-design/metadata.json.version`。
- 不提交 `.DS_Store`、`.uploads/`。
- `.trae/skills/*` 是指向 `.codex/skills/*` 的符号链接，禁止把它当作独立副本维护。

## 组件与 UI Kit 一致性

- 组件契约、Preview、`components.css`、组件索引、允许组件清单和 UI Kit 必须同步。
- 组件契约只引用权威源；禁止 `specRefs`、不存在的仓库路径和旧技能路径。
- Preview 中的全局 Token 必须登记为 `runtimeTokens`，组件内部参数必须登记为 `localTokens`，仅展示页使用的 Token 必须登记为 `previewOnlyTokens`。
- 每份 UI Kit 质量报告必须记录当前设计系统版本、已通过的一致性检查和非空质量门禁；报告中的组件必须已注册且允许使用。
- `components.css` 只能由 Preview 提取脚本生成，禁止直接编辑。
- 新增或修改组件、Preview、UI Kit、Token 或消费契约后，必须运行组件一致性守卫；影响场景时按影响范围回归场景合同、交互和视觉检查。

## 经验沉淀硬规则

- 只有用户明确要求“审查并沉淀经验”“补充规则”“复盘并形成经验”或“优化工作流”时，才允许更新经验候选池。
- 候选必须经归属、适用/不适用、例外、回退和运行时可达性判断；达到阈值后仍需用户确认才能升级正式规则。
- `scenarioTypeRegistry` 只保存成熟且被运行时消费的正式类型，不保存候选或历史技能职责。

## Git 与验证

- 默认目标分支为 `main`；显式路径暂存，不执行 `git add -A`。
- 提交信息使用简短中文动词短语；不强推已存在远端分支。
- 提交前运行：
  - `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`
  - `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design --check`
  - `node scripts/validate-component-contract-parity.mjs`
  - `node scripts/validate-wego-design.mjs`
  - 正式合并前按需运行 `node scripts/validate-wego-design.mjs --scope=full --strict`
- 启动本地验证服务器必须自动退出或在任务结束时清理；开始与结束均用 `lsof -iTCP -sTCP:LISTEN -P | grep python` 检查残留。
