# 工作流与经验同步矩阵

> 工作流规则和经验沉淀的按需同步范围。组件、Token 与 UI Kit 使用 `sync-matrix.runtime.md`。

| 改动 | 必改 | 仅在受影响时同步 | 验证 |
| --- | --- | --- | --- |
| 现场识别经验信号（业务技能） | 交付单元 `.tasks/experience-inbox.json` 草稿 | — | 信号只描述现象，不预判“已形成经验”；不改经验权威源、不增加次数、不输出沉淀提示 |
| 需求/普通缺陷分流 | 需求规格、组件契约或对应测试 | `.tasks/experience-inbox.json`（处理后清空） | 用户纠正不等于经验；确认需求/测试已更新后丢弃草稿，不写 evidence/L2/L3 |
| 经验质量门 | `.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md` | 已有 evidence、场景技能、正式规则 | 主题归属前同时检查因果明确、跨任务迁移、可改变动作、修复已验证、非冗余；任一失败即停止沉淀 |
| 收口轻沉淀（合格因果规则） | `.codex/skills/wego-uxsystem-iterate/experience/evidence.json`、`.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md` | — | 新事实填写 kind/observation/mechanism/rule/scope/verification/novelty；同一任务同根因只计一次；摘要只写决策指针；跑 `--check`；随当前业务 PR 进 main |
| 毕业场景技能（同场景 ×2 或流程固定） | 新建 `.codex/skills/wego-scene-*/SKILL.md`、`.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md`（改一句话+指针） | `.codex/skills/README.md`、对应主技能 SKILL.md 挂载点、`validate-doc-drift.mjs`（自动覆盖新目录） | 四段结构、frontmatter 完整、ev ID 存在；三重挂载齐全；攒批走工作流短周期 PR |
| 迭代已有场景技能 | 目标 `wego-scene-*/SKILL.md` | `.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md`（独立任务复发才更新次数/日期） | 质量门先于主题归属；纯功能契约只改测试 reference、不挂 ev ID；单技能 ≤1500 字符 |
| 用户确认升级（L4） | 唯一权威源、直接消费者 | `.codex/skills/wego-uxsystem-iterate/experience/evidence.json`（追加升级记录）、`.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md`（删除对应摘要）、相关场景技能（回流后删除） | 先提交正式修复，再记录升级事实事件 |
| 已升级经验复发 | `.codex/skills/wego-uxsystem-iterate/experience/evidence.json`、`.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md` | 上次升级权威源和直接消费者 | 追加复发事实事件，更新摘要，复查上次修复 |
| 经验过时或场景下线 | `.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md` 或目标场景技能 | `.codex/skills/wego-uxsystem-iterate/experience/evidence.json` | 删除对应摘要/技能；事实保留不删除（量大按年归档） |
| 技能入口调整 | 目标 `SKILL.md` | 直接引用的 reference、`.codex/skills/README.md` | 三条业务主链技能与交付技能存在、入口唯一、链接有效 |
| GitHub 交付规则调整 | `wego-github-delivery` 规则、`AGENTS.md` | `wego-design`、`wego-uxsystem-iterate`、迭代工作流、技能路由、`README.md`、`scripts/README.md`、工作流流程图、实际验证入口；涉及远程本地预览时同步隧道记录、校验与关闭时机 | 先核对全部 worktree、开放 PR、未冻结迭代和本地预览记录；同一交付单元复用分支/worktree |
| 技能适配器调整 | `.trae/skills/*`、`.codebuddy/skills/*` 逐项符号链接或整目录符号链接 | `AGENTS.md`、实际验证入口 | 两个适配器以符号链接指向 `.codex/skills/*`，不保留副本 |
| 工作流守卫调整 | 实际执行脚本 | 统一验证入口、脚本文档和 CI workflow | `--scope=system --strict` 必须运行对应回归测试并校验工作流引用；完整验证存在场景/迭代时覆盖数不得为 0 |
| 文档漂移检查 | 按本表必改列逐项核对 | 引用的 rule-id、文件路径、命令示例、根 README、脚本说明、工作流流程图与关键结构化消费配置 | rule-id 锚点存在、文件路径存在、验证命令可执行、分类场景路径与状态语义一致 |

设计原则只承载跨场景的顶层判断，并保留稳定 `rule-id`。业务事实、组件结构、页面范式、运行实现、资源消费和测试方法留在各自权威源。

`SKILL.md` 只保留触发、职责、按需读取、输出和交接。守卫不得依赖固定标题、固定句子、引用顺序或同义词扫描。

`.codex/skills/wego-uxsystem-iterate/experience/evidence.json` 保存已通过质量门且已进入 main 的不可删除事实；开放 PR 内尚未合入的候选事实可在验收时撤回、拆分或改写。`.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md` 只保留因果决策指针（≤1500 字符），固定流程细节毕业到 `.codex/skills/wego-scene-*`。`refine-experience.mjs --check` 从 `qualityGateSince` 起强制结构化质量字段，不生成内容，`--related` 为只读查询。

经验权威源只能存在于 `.codex/skills/wego-uxsystem-iterate/experience/` 与 `.codex/skills/wego-scene-*/`；交付单元 `.tasks/experience-inbox.json` 是唯一允许的外部草稿（随 worktree 生灭，uxsystem 收口时转正或清空）。发现旧副本时必须先合并有效内容，再删除旧副本并清理全部旧路径引用。L1/L2 数据随业务 PR 进 main，场景技能与规则类结构性改动攒批走工作流短周期 PR。

设计系统本体变化另按资源同步矩阵递增版本、生成 CSS、同步部署副本并运行严格系统验证。
