# 工作流与经验同步矩阵

> 工作流规则和经验沉淀的按需同步范围。组件、Token 与 UI Kit 使用 `sync-matrix.runtime.md`。

| 改动 | 必改 | 仅在受影响时同步 | 验证 |
| --- | --- | --- | --- |
| 信号触发沉淀事实 | `experience/evidence.json` | `experience/EXPERIENCE.md` | 事实事件包含 date/summary/source；同一任务同根因只计一次 |
| 新建或归并经验 | `experience/EXPERIENCE.md` | `experience/evidence.json` | AI 基于事实推理写入，用 § 分隔；每条经验必须引用存在的 evidence ID；运行 `refine-experience.mjs --check` 校验一致性 |
| 用户确认升级 | 唯一权威源、直接消费者 | `experience/evidence.json`（追加升级记录）、`experience/EXPERIENCE.md`（删除对应条目） | 先提交正式修复，再记录升级事实事件；EXPERIENCE.md 删除对应经验 |
| 已升级经验复发 | `experience/evidence.json`、`experience/EXPERIENCE.md` | 上次升级权威源和直接消费者 | 追加复发事实事件，EXPERIENCE.md 更新对应经验，复查上次修复 |
| 经验过时或场景下线 | `experience/EXPERIENCE.md` | `experience/evidence.json` | 删除对应经验条目；事实保留不删除 |
| 技能入口调整 | 目标 `SKILL.md` | 直接引用的 reference、`.codex/skills/README.md` | 三条业务主链技能与交付技能存在、入口唯一、链接有效 |
| GitHub 交付规则调整 | `wego-github-delivery` 规则、`AGENTS.md` | `wego-design`、`wego-uxsystem-iterate`、迭代工作流、技能路由、`README.md`、实际验证入口 | 先核对全部 worktree、开放 PR、未冻结迭代和本地预览记录；同一交付单元复用分支/worktree |
| 技能适配器调整 | `.trae/skills/*`、`.codebuddy/skills/*` 逐项符号链接或整目录符号链接 | `AGENTS.md`、实际验证入口 | 两个适配器以符号链接指向 `.codex/skills/*`，不保留副本 |
| 工作流守卫调整 | 实际执行脚本 | 统一验证入口与脚本文档 | `--scope=system --strict` 必须运行对应回归测试并校验工作流引用 |
| 文档漂移检查 | 按本表必改列逐项核对 | 引用的 rule-id、文件路径、命令示例 | rule-id 锚点存在、文件路径存在、验证命令可执行 |

设计原则只承载跨场景的顶层判断，并保留稳定 `rule-id`。业务事实、组件结构、页面范式、运行实现、资源消费和测试方法留在各自权威源。

`SKILL.md` 只保留触发、职责、按需读取、输出和交接。守卫不得依赖固定标题、固定句子、引用顺序或同义词扫描。

`evidence.json` 保存不可删除的事实事件；`EXPERIENCE.md` 由 AI 基于事实推理维护，用 § 分隔多条自然语言经验，每条必须追溯到 evidence.json 中的事实。`refine-experience.mjs --check` 仅做事实一致性校验和格式检查，不生成内容。

经验数据只能存在于 `.codex/skills/wego-uxsystem-iterate/experience/`。发现旧副本时必须先合并有效内容，再删除旧副本并清理全部旧路径引用。

设计系统本体变化另按资源同步矩阵递增版本、生成 CSS、同步部署副本并运行严格系统验证。
