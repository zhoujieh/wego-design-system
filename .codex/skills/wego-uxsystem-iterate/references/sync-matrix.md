# 工作流与经验同步矩阵

> 工作流规则和经验升级的按需同步范围。组件、Token 与 UI Kit 使用 `sync-matrix.runtime.md`。

| 改动 | 必改 | 仅在受影响时同步 | 验证 |
| --- | --- | --- | --- |
| 用户触发总结并登记事实 | `.codex/skills/wego-uxsystem-iterate/experience/evidence.json` | `.codex/skills/wego-uxsystem-iterate/experience/candidates.json` | 独立事实事件、证明材料、任务引用、场景和经验关联；同一任务同根因只计一次 |
| 新建或归并经验 | `.codex/skills/wego-uxsystem-iterate/experience/candidates.json` | `.codex/skills/wego-uxsystem-iterate/experience/evidence.json` | 先查已有规则；分类与类型匹配；归属为最早阻止问题的技能；按 relatedRuleId、rootCause、ownerSkill、normalizedKey 去重 |
| 经验首次达到升级阈值 | `.codex/skills/wego-uxsystem-iterate/experience/candidates.json` | 无 | `occurrenceCount` 达到 3，状态改为 `proposed`，`proposalReason=threshold`，并提示用户确认是否升级 |
| 用户明确要求正式升级 | 唯一权威源、直接消费者、`candidates.json.upgradeHistory` | 能客观验证时同步守卫 | 先提交正式修复，再记录修复提交 SHA；状态改为 `upgraded`，经验和事实不删除 |
| 已升级经验再次出现 | `evidence.json`、`candidates.json` | 上次升级权威源和直接消费者 | 累计次数继续增加，立即改为 `proposed`，`proposalReason=post-upgrade-recurrence`，复查上次修复位置和内容，不重新等待 3 次 |
| 技能入口调整 | 目标 `SKILL.md` | 直接引用的 reference、`.codex/skills/README.md` | 三条业务主链技能与交付技能存在、入口唯一、链接有效 |
| GitHub 交付规则调整 | `wego-github-delivery` 规则、`AGENTS.md` | 直接消费者技能、技能路由、实际验证入口 | 先核对全部 worktree、开放 PR、认领和未冻结迭代；同一交付单元复用开放 PR；合并或关闭后默认收口分支 |
| 技能适配器调整 | `.trae/skills/*`、`.codebuddy/skills/*` 符号链接 | `AGENTS.md`、实际验证入口 | 两个适配器完整且逐项指向 `.codex/skills/*`，不保留副本或额外技能目录 |
| 工作流守卫调整 | 实际执行脚本 | 统一验证入口与脚本文档 | `--scope=system --strict` 必须运行对应回归测试并校验工作流引用 |

设计原则只承载跨场景的顶层判断，并保留稳定 `rule-id`。业务事实、组件结构、页面范式、运行实现、资源消费和测试方法留在各自权威源，不投影到原则文档。

`SKILL.md` 只保留触发、职责、按需读取、输出和交接。守卫不得依赖固定标题、固定句子、引用顺序或同义词扫描；结构化经验数据可以按 Schema 和引用关系验证。

`evidence.json` 保存不可因升级而删除的事实事件；`candidates.json` 保存经验归纳、累计次数、状态和升级历史。`occurrenceCount` 等于关联的独立事实事件数量，同一事件中的多条证明材料不重复计次。

经验数据只能存在于 `.codex/skills/wego-uxsystem-iterate/experience/`。发现旧副本时必须先合并有效内容，再删除旧副本并清理全部旧路径引用。

设计系统本体变化另按资源同步矩阵递增版本、生成 CSS、同步部署副本并运行严格系统验证。
