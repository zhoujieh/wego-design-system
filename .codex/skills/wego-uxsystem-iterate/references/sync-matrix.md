# 变更同步矩阵

组件、Token、Preview、UI Kit、图标和普通设计系统迭代的原有同步矩阵保留在 `sync-matrix.runtime.md`。执行这些场景时先读取该文件。

本文件补充工作流迭代、经验候选和自动生成规则文档的同步范围；与 `workflow-iteration.md` 冲突时，以 `workflow-iteration.md` 的门禁为准。

## 经验候选新增或累计

必看：

- `references/workflow-iteration.md`
- `experience/README.md`
- `experience/candidates.json`
- 与主要归属对应的技能和权威文件

只允许修改：

- `experience/candidates.json`

必做：

- 确认用户明确触发了经验沉淀流程。
- 一次审查只选择一条经验。
- 先完成抽象、去重、归属和运行时可达性判断。
- 同类只累计次数和证据，不重复新增。
- 达到 3 次时只改为 `awaiting-confirmation` 并询问用户。
- 运行 `node scripts/specs.mjs check`，确认候选池结构合法且没有污染正式场景注册表。

不需要：

- 不修改正式权威来源。
- 不修改 `scenarioTypeRegistry`。
- 不递增设计系统版本。
- 不重新生成 `specs/*.md`；候选不是正式规则源。

## 正式规则升级

前提：

- 候选至少出现 3 次。
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
- 对应 `SKILL.md` 或 references：技能职责、输入输出和门禁。
- `AGENTS.md`：仅跨技能仓库硬约束。
- `scenarioTypeRegistry`：仅当形成成熟、可复用且会被运行时消费的正式场景类型。

必做：

- 涉及设计系统本体时递增 `metadata.json.version`。
- 运行 `node scripts/specs.mjs generate`。
- 运行 `node scripts/specs.mjs check`。
- 运行 `node scripts/validate-wego-design.mjs`。
- 人工检查生成文档是否准确表达正式规则。

## 只调整工作流技能

必看：

- 目标技能 `SKILL.md`
- 对应 `SKILL.runtime.md` 或 references
- `AGENTS.md`
- `references/workflow-iteration.md`

必做：

- 确认规则没有与结构化权威来源重复。
- 明确由哪个技能读取、影响哪个输出、如何交接和验收。
- 运行规则文档生成与检查。
- 若 `.codex/skills/wego-design/` 内文件发生变化，递增 `metadata.json.version`。

## 自动生成规则文档

修改任何正式规则来源后：

1. 运行 `node scripts/specs.mjs generate`。
2. 检查 `.codex/skills/wego-design/specs/` 下 7 份自动生成文档。
3. 运行 `node scripts/specs.mjs check`。
4. 运行 `node scripts/validate-wego-design.mjs`。

禁止：

- 直接编辑生成文档。
- 把生成文档加入运行时读取顺序。
- 只更新生成文档而不更新权威来源。
- 在 `specs/` 顶层保留未登记的手工文档；历史资料只能放在归档子目录。

## 每次正式迭代共同项

除本文件外，继续执行 `sync-matrix.runtime.md` 中“每次正式迭代共同项”的全部检查。
