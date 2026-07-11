# 变更同步矩阵

组件、Token、Preview、UI Kit、图标和普通设计系统迭代的基础同步矩阵保留在 `sync-matrix.runtime.md`，它是本 reference 的基础清单，不是技能入口。执行这些场景时先读取该文件，再执行本文件的工作流与单一入口补充规则。

本文件补充工作流迭代、经验候选、技能单一入口和自动生成规则文档的同步范围；与 `workflow-iteration.md` 冲突时，以 `workflow-iteration.md` 的经验门禁为准；与技能职责冲突时，以对应唯一 `SKILL.md` 为准。

## 经验候选新增或累计

必看：

- `references/workflow-iteration.md`
- `references/experience-candidates.md`
- `experience/candidates.json`
- 与主要归属对应的技能和权威文件

只允许修改：

- `experience/candidates.json`

必做：

- 确认用户明确触发了经验沉淀流程。
- 每条候选都必须完成归属判定、去重、运行时可达性验证和场景拆分。
- 先完成抽象、去重、归属和运行时可达性判断。
- 同类只累计次数和证据，不重复新增。
- 达到当前阈值时只改为 `awaiting-confirmation` 并询问用户；快速迭代阶段当前阈值为 1，标准稳定阶段保留 3。
- 运行 `node scripts/specs.mjs check`，确认候选池结构合法且没有污染正式场景注册表。

不需要：

- 不修改正式权威来源。
- 不修改 `scenarioTypeRegistry`。
- 不递增设计系统版本。
- 不重新生成 `specs/*.md`；候选不是正式规则源。

## 正式规则升级

前提：

- 候选已达到自身 `threshold`；快速迭代阶段允许 1 次进入用户确认，标准稳定阶段保留 3 次门槛。
- 用户已明确确认升级。
- 已拆分适用、不适用、例外和回退条件。
- 已明确运行时消费与验收链路。

必改：

- 正确的结构化权威来源。
- 需要消费该规则的技能读取、输出或交接引用。
- 对应回归测试或守门逻辑。
- `experience/candidates.json`：规则完成后改为 `promoted` 并记录正式落点。

按需改：

- `components/{slug}.json`：单组件结构、状态、变体和行为。
- `uikit-plan.json`：页面范式、fallback 和多组件组合。
- `library-consumption.json`：设计系统消费和全局限制。
- 对应唯一 `SKILL.md` 或 references：技能职责、输入输出和门禁。
- `AGENTS.md`：仅跨技能仓库硬约束。
- `scenarioTypeRegistry`：仅当形成成熟、可复用且会被运行时消费的正式场景类型。

必做：

- 涉及设计系统本体时递增 `metadata.json.version`。
- 运行 `node scripts/specs.mjs generate`。
- 运行 `node scripts/specs.mjs check`。
- 运行 `node scripts/specs.mjs test`。
- 运行 `node scripts/validate-wego-design.mjs`。
- 人工检查生成文档是否准确表达正式规则。

## 只调整工作流技能

必看：

- 目标技能唯一的 `SKILL.md`。
- 目标技能明确引用的 `references/`。
- `AGENTS.md`。
- `references/workflow-iteration.md`。
- `scripts/specs.mjs` 和相关守门。

必做：

- 确认规则没有与结构化权威来源重复。
- 明确由哪个技能读取、影响哪个输出、如何交接和验收。
- 确认技能目录不存在 `SKILL.runtime.md` 或其他并列入口。
- 全仓清理已删除入口、旧字段和旧规则路径引用。
- 更新生成脚本 source manifest、library map 和同步矩阵。
- 运行规则文档生成、检查和测试。
- 若 `.codex/skills/wego-design/` 内正式设计系统文件发生变化，递增 `metadata.json.version`。

### 业务迭代工作流专项

修改 `iteration.json`、范围确认、阶段状态、开发交接或冻结规则时：

- 主要权威落点为 `wego-product/references/iteration-workflow.md`，AGENTS 只保留跨技能硬门禁。
- 同步检查 wego-product 创建与确认、wego-design 消费、wego-ux 实现范围、wego-tests 验收/交接/冻结四段职责。
- 同步 `scripts/iteration-record.mjs`、`validate-wego-design-core.mjs`、`specs-core.mjs` 和对应回归测试。
- 检查生成 Markdown 不是运行时规则来源，技能实际读取 `iteration.json` 和正式规格。
- 检查历史场景兼容、新迭代强制认领、范围失效、共享场景基线和冻结防覆盖。

## 合并或删除历史 Skill 入口

前提：

- 已对比唯一 `SKILL.md`、历史入口和相关 references。
- 已区分仍有效规则、被新规则替代的内容和已经废弃的路径。

必改：

- 把有效规则整理进唯一 `SKILL.md`，消除冲突和重复。
- 删除 `SKILL.runtime.md`、`SKILL.override.md` 等历史入口。
- 更新 `.codex/skills/README.md`、技能直接引用的 references、生成脚本 source manifest 和所有运行时引用。
- 增加结构守门，禁止历史入口重新出现。

必查：

- 上游输出字段与下游消费字段仍一致。
- 示例、默认值和硬规则没有互相矛盾。
- 删除文件后不存在断链引用。
- 自动生成规则文档已重新生成。
- 全量严格验证通过，或明确记录无法执行的真实限制。

## 自动生成规则文档

修改任何正式规则来源后：

1. 运行 `node scripts/specs.mjs generate`。
2. 检查 `docs/specs/` 下 7 份自动生成文档。
3. 运行 `node scripts/specs.mjs check`。
4. 运行 `node scripts/specs.mjs test`。
5. 运行 `node scripts/validate-wego-design.mjs`。

禁止：

- 直接编辑生成文档正文。
- 把生成文档加入运行时读取顺序。
- 只更新生成文档而不更新权威来源。
- 在 `specs/` 顶层保留未登记的手工文档；历史资料只能放在归档子目录。
- 把已删除的历史 Skill 入口保留在 source manifest 中。

## 每次正式迭代共同项

除本文件外，继续执行 `sync-matrix.runtime.md` 中“每次正式迭代共同项”的全部检查，并额外确认：

- 五个主技能都只有一个 `SKILL.md` 入口。
- 运行时技能没有读取自动生成文档。
- 规则来源、运行时消费、下游传播和验收链路完整。
