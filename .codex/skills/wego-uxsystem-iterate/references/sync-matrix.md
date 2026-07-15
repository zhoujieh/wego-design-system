# 工作流与经验同步矩阵

> 角色：系统规则、经验候选和技能入口调整的同步范围。组件与 UI Kit 资源同步以 `sync-matrix.runtime.md` 为准。

## 候选新增或累计

只允许更新 `experience/candidates.json`。必须完成归属、去重、运行时可达性、适用边界和证据记录；达到阈值只进入 `awaiting-confirmation`，不得修改正式规则。

## 正式规则升级

用户确认后，必须同步：

- 唯一权威来源。
- 读取该规则的技能或直接 reference。
- 对应组件、Preview、UI Kit、Token、消费契约或场景合同。
- 可执行守卫或回归检查。
- 候选池的 `promoted` 记录。

若规则落点为 `.codex/skills/wego-design/references/design-decisions.md`，只允许承载跨场景的顶层原则与页面设计判断：设计输入、组件选择、布局和视觉取舍、状态交互或设计系统缺口判断。业务事实、合同字段、组件内部结构、页面范式、运行时实现、资源消费和测试方法必须分别落到其对应权威源，不能以设计决策原则文档汇总代替。

设计决策原则文档升级时必须保留现行规则语义和 `rule_id` 追溯，更新 `source_ref`，并运行设计决策原则守卫。

设计系统本体变更还必须递增 metadata 版本、重新生成 `components.css`、同步 `wego-app/lib/` 并运行组件一致性与严格系统验证。

## 技能入口调整

- 每个当前技能包只能有一个 `SKILL.md`。
- `SKILL.md` 只承载触发、职责、输入、输出和交接；详细方法位于直接引用的 references。
- 删除技能或 reference 时，必须清理所有运行时、守卫、候选 canonical 路径和入口链接。
- 禁止生成规则投影、并行入口、旧技能路径和兼容读取。
