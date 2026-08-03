# 工作流与经验同步矩阵

> 工作流规则和经验升级的按需同步范围。组件、Token 与 UI Kit 使用 `sync-matrix.runtime.md`。

| 改动 | 必改 | 仅在受影响时同步 | 验证 |
| --- | --- | --- | --- |
| 用户触发总结并登记候选 | `.codex/skills/wego-uxsystem-iterate/experience/candidates.json` | 无 | 分类、去重、归属、证据、拟落点、状态及唯一存放路径；默认 `observing`，不询问是否直接升级 |
| 候选达到升级阈值 | `.codex/skills/wego-uxsystem-iterate/experience/candidates.json` | 无 | 状态自动改为 `proposed`，并提示用户确认是否升级 |
| 用户明确要求正式升级 | 唯一权威源，并从候选池移除已解决项 | 直接读取该规则的技能或消费者 | 可观察行为；无可执行行为时只做链接检查 |
| 技能入口调整 | 目标 `SKILL.md` | 直接引用的 reference、`.codex/skills/README.md` | 三条业务主链技能与交付技能存在、入口唯一、链接有效 |
| GitHub 交付规则调整 | `wego-github-delivery` 规则、`AGENTS.md` | 技能路由、实际验证入口 | 同一交付单元复用开放 PR；合并或关闭后默认收口分支 |
| 技能适配器调整 | `.trae/skills/*`、`.codebuddy/skills/*` 符号链接 | `AGENTS.md`、实际验证入口 | 两个适配器完整且逐项指向 `.codex/skills/*`，不保留副本或额外技能目录 |
| 工作流守卫调整 | 实际执行脚本 | 统一验证入口与脚本文档 | `--scope=system --strict` 必须运行对应回归测试并校验工作流引用 |

设计原则只承载跨场景的顶层判断，并保留稳定 `rule-id`。业务事实、组件结构、页面范式、运行实现、资源消费和测试方法留在各自权威源，不投影到原则文档。

`SKILL.md` 只保留触发、职责、按需读取、输出和交接。守卫不得依赖固定标题、固定句子、引用顺序或同义词扫描；删除文件时必须清理真实入口和链接。

经验候选通过 `occurrenceCount` 累计同类问题出现次数。用户要求总结、登记或沉淀时默认直接写入 `observing`，不询问是否升级；达到 3 次后状态自动改为 `proposed`，并在本次总结时提醒用户确认是否升级。只有用户明确选择升级时才修改正式规则。

经验候选只能存在于 `.codex/skills/wego-uxsystem-iterate/experience/candidates.json`。不得在仓库根目录或其它技能创建同名目录、文件或副本；发现旧副本时必须先合并有效内容，再删除旧副本并清理全部旧路径引用。

设计系统本体变化另按资源同步矩阵递增版本、生成 CSS、同步部署副本并运行严格系统验证。
