# wego-app 原型与设计系统

## 仓库定位

微购中文静态 App 原型与设计系统仓库。用户提供业务需求，AI 按固定技能链路生成符合微购设计语言的移动端交互原型。

默认面向移动端、微信生态、电商、工具和社交场景，不依赖特定 agent 运行时。设计方向固定为简洁、干净、淡雅、克制，判断优先级固定为：清晰 > 一致 > 效率 > 美观 > 创新。

## 固定产物

- `wego-app/index.html` 是唯一 App 入口和预览宿主。
- 业务场景统一进入 `wego-app/scenes/{中文业务场景}/`。
- 路由使用稳定的 kebab-case `route_id`，例如 `my-permission-management`；访问地址使用 `#/my-permission-management`。
- 电脑端显示手机预览外壳，移动端同链接铺满真实 viewport。
- 预览以 Vercel 固定链接为主，同时必须支持本地直接打开 `wego-app/index.html`。
- `wego-app/lib/` 是设计系统部署副本，禁止直接编辑；必须先改 `.codex/skills/wego-design/` 源文件，再运行 `node scripts/sync-wego-app-lib.mjs`。

## 沟通要求

- 每次会话先读取本文件，再按用户意图触发对应技能。
- 先理解完整工作流和影响范围，不按用户点名文件机械修改。
- 使用简洁、通俗的中文说明改了什么、验证了什么、还有什么风险。
- 不堆砌技术名词，不编造未执行的验证或风险。

## 技能路由

| 用户意图 | 必须先触发 | 前置条件 | 下一步 |
| --- | --- | --- | --- |
| 原始业务需求、做页面、做原型、做新场景 | `wego-product` | 无 | 新迭代先确认极简原型简报；定稿后补全 `interaction_spec` |
| 基于已确认原型简报选择页面范式、UI Kit、组件和打开方式 | `wego-design` | 迭代为 `prototyping` 或后续正式阶段 | 原型期写紧凑设计约束，定稿后落盘无 gap 的 `design_plan` |
| 正式生成或更新 `wego-app` 场景 | `wego-ux` | 原型期有已确认简报和设计约束；正式期有两份规格 | 原型提交用户定稿，正式化后交给 `wego-tests` |
| 验收、回归、检查当前业务场景 | `wego-tests` | 场景已生成并注册路由 | 输出 `acceptance_report` |
| 改组件、Token、Preview、UI Kit 或设计系统守门 | `wego-uxsystem-iterate` 的迭代模式 | 目标属于设计系统本体 | 按组件/UI Kit 同步矩阵执行 |
| 审查并沉淀经验、补充规则、优化工作流 | `wego-uxsystem-iterate` 的工作流迭代模式 | 用户明确要求沉淀或优化 | 先进入经验候选流程 |
| 只检查组件、UI Kit 或工作流是否合理 | `wego-uxsystem-iterate` 的审查模式 | 无 | 先输出 findings，再决定是否修复 |

统一路由入口见 `.codex/skills/README.md`。

## 主链路硬门禁

- 正式规则生效后的新业务需求或已有业务场景修改必须归属主业务场景 `_iterations/` 下的有效迭代；历史场景无需补录，后续再次修改时进入新流程。
- 新建 schema v2 迭代先用 `submit-brief → confirm-brief` 在 `awaiting-brief-confirmation` 确认 `prototype_brief` 的目标、范围、入口和关键路径，进入 `prototyping` 后可连续完成设计约束与交互原型；原型定稿前不得写入或修改正式规格、验收和交接产物。
- v2 原型定稿通过 `confirm-prototype` 锁定运行时快照，并直接承担正式范围确认；只有 `prototype-confirmed` 后才可补齐 `interaction_spec` 并进入 `product-confirmed`。既有 schema v1 迭代继续按原范围确认流程执行。
- `wego-design` 不得新增产品内容，`wego-ux` 不得修改未登记场景或宿主文件，`wego-tests` 必须按 `requirement_id` 覆盖全部确认需求后才能生成开发交接和冻结迭代。
- 冻结迭代不得覆盖；后续业务变化建立新迭代。纯设计系统、工作流或仓库管理变化不建立业务迭代。
- 模糊的业务页面请求默认先走 `wego-product`；关键需求未确认前不得进入下一环节，且不得擅自修改用户明确的产品要求。
- v2 原型期的 `wego-design` 只消费已确认 `prototype_brief` 并写入 `prototype_design`；正式 `interaction_spec` 和 `design_plan` 均在原型定稿后补齐。v1 继续要求先有可继续的 `interaction_spec`。
- v2 原型期的 `wego-ux` 只执行 `prototype_design`；正式化后的实现追踪仍要求无 gap 的 `design_plan`。v1 继续要求实现前完整设计计划已落盘。
- 已有业务场景的任何修改都必须先进入 `wego-ux` 做偏差判定；文案、间距或使用已注册 Token 的实现微调也不能绕过。修改 Token 源、组件或设计系统规则必须转入 `wego-uxsystem-iterate`。
- 当前场景未生成且未注册 `route_id`，不得进入 `wego-tests`。
- 组件、UI Kit、工作流问题不得误走普通业务开发链路。

## 仓库级约束

- 原型产物不得散落在仓库根目录。
- `wego-app/index.html` 是唯一宿主，不为单个业务复制第二套宿主壳。
- 业务场景不得依赖 `fetch()` 或 `XHR` 读取本地 HTML 片段。
- 场景通过 `scene.js` 注册模板、打开方式和交互。
- 原型必须体现真实业务状态和流程反馈；只有需求明确要求刷新后保留时才使用持久化。
- 设计系统本体正式迭代必须递增 `.codex/skills/wego-design/metadata.json.version`；纯仓库管理类变更可不递增。
- 不提交 `.DS_Store`、`.uploads/`。
- AGENTS.md 只承载跨技能硬约束；具体组件规则、工作流方法和经验候选分别落到对应权威文件。
- `.trae/skills/*` 是指向 `.codex/skills/*` 的符号链接，禁止把它当作独立副本维护；统一修改 `.codex/skills/` 下的源文件。

## 经验沉淀硬规则

- 只有用户明确要求“审查并沉淀经验”“补充规则”“复盘并形成经验”或“优化工作流”时，才允许更新经验候选池。
- 沉淀经验必须通过 wego-uxsystem-iterate 工作流迭代模式进入，用户确认后才能升级为正式规则。
- 归属不明确时不得入池。
- 当前处于快速迭代阶段，同类经验达到当前阈值（默认 1 次）后，只能提示用户确认；未确认不得升级正式规则。
- 标准稳定阶段阈值保留为 3 次，后续恢复时只调整经验候选池阈值与对应守门，不重建流程。
- 正式沉淀前必须拆分适用场景、不适用场景、例外和回退条件，并验证运行时消费与验收链路。
- `scenarioTypeRegistry` 只保存成熟且会被运行时消费的正式类型，不保存经验候选。

完整流程见 `.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md`。

## 自动生成规则文档

`docs/specs/*.md` 由 `scripts/specs.mjs` 从权威来源自动生成，只用于人工检查当前规则是否完整、清晰、重复或冲突。

- 页面生成、设计消费、原型实现和验收技能不得把生成文档作为运行时规则来源。
- 不得直接修改生成文档。
- 修改权威来源后运行 `node scripts/specs.mjs generate`。
- 提交前必须通过 `node scripts/specs.mjs check`。
- 生成文档与权威来源冲突时，以权威来源为准。

## Git 与验证

- 默认目标分支为 `main`。
- 提交前使用显式路径暂存，不无脑执行 `git add -A`。
- 不强推已存在的远端分支。
- 提交信息使用简短中文动词短语。
- 提交前运行：
  - `node scripts/specs.mjs test`
  - `node scripts/specs.mjs check`
  - `node scripts/validate-wego-design.mjs`
  - 正式合并前按需运行 `node scripts/validate-wego-design.mjs --scope=full --strict`
  - 只审查设计系统或工作流本体、且业务场景是测试数据时，运行 `node scripts/validate-wego-design.mjs --scope=system --strict`；该范围仍检查设计系统全量资源和 `wego-app/lib/` 同步，但跳过 `wego-app/scenes/` 业务产物。
- 若涉及设计系统源资源，再检查 `wego-app/lib/` 同步状态。
- **启动本地验证服务器（`python -m http.server` 等）必须自带自动退出或任务结束显式清理**：
  - 必须使用 `timeout` / `trap kill` / `EXIT trap` / `pgrep cleanup` 等包装，禁止直接 `nohup ... &` 让进程脱离会话。
  - 任务开始前用 `lsof -iTCP -sTCP:LISTEN -P | grep python` 确认无残留 http.server；任务结束后再次执行确认无新增。
  - 出现端口占用时优先清理旧进程，不要盲目切换端口。
