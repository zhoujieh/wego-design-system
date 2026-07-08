---
name: "wego-uxsystem-iterate"
description: 用于 wego-design 设计系统与工作流本体的正式迭代，包括组件、Token、Preview、UI Kit、守门、经验候选、规则沉淀和工作流优化。
---

# 项目级别迭代 Skill

目标是让 AI 稳定、正确地输出符合微购设计规范的交互原型，同时保持规则来源唯一、经验可控、验证链路完整。

## 何时触发

- 改组件、Token、Preview、UI Kit、metadata 或设计系统守门。
- 审查组件、UI Kit 或工作流是否合理。
- 用户明确要求审查并沉淀经验、补充规则、复盘形成经验或优化工作流。

普通业务页面仍走 `wego-product → wego-design → wego-ux → wego-tests`。

## 三种模式

### 迭代模式

用于修改设计系统本体。读取：

1. `references/workflow.md`
2. `references/sync-matrix.md`
3. `references/judgment-principles.md`

### 审查模式

用于只检查、不直接沉淀规则。先输出 findings；用户未明确要求沉淀时，不得更新经验池。

### 工作流迭代模式

仅在用户明确要求以下任一意图时进入：

- 审查并沉淀经验
- 补充规则
- 复盘并形成经验
- 优化工作流

读取顺序：

1. `references/workflow-iteration.md`
2. `experience/README.md`
3. `experience/candidates.json`
4. 按问题归属读取对应技能和权威来源
5. `references/sync-matrix.md`

## 经验候选硬门禁

- 用户普通反馈、AI 自查、验收失败或实现偏差不能自动进入经验池。
- 每轮最多选择一条最重要、最可复用的经验。
- 入池前必须确认问题最早产生的环节、主要归属、次要归属、权威落点、运行时消费方和验收方式。
- 归属不明确时不得入池。
- 同类经验复用已有候选，只增加 `occurrence_count` 和场景证据，不重复新增。
- 第三次出现时将状态置为 `awaiting-confirmation`，并提示用户：

> 该经验已累计出现 3 次，达到正式沉淀阈值，是否现在将其升级为正式规则？

- 用户未明确确认前，不得修改正式规则或 `scenarioTypeRegistry`。
- 正式沉淀前必须拆分适用场景、不适用场景、例外、回退条件，并检查是否可并入已有规则。
- `scenarioTypeRegistry` 只保存成熟、经过验证且会被运行时消费的正式类型，不保存经验候选。

## 自动生成规则文档

`.codex/skills/wego-design/specs/*.md` 由 `scripts/specs.mjs` 自动生成，只用于人工检查。

- 不直接修改生成文档。
- 运行时技能不得读取生成文档。
- 修改权威来源后运行 `node scripts/specs.mjs generate`。
- 提交前运行 `node scripts/specs.mjs check`。
- `scripts/validate-wego-design.mjs` 会先执行一致性检查，再运行原有设计系统守门。

## 跨模式守门

- 涉及设计系统本体时递增 `.codex/skills/wego-design/metadata.json.version`。
- 不只修改一个表面文件；按同步矩阵检查契约、Preview、UI Kit、消费规则和验证影响。
- AGENTS.md 只保存跨技能硬约束。
- 组件规则回到组件契约，页面范式回到 `uikit-plan.json`，消费边界回到 `library-consumption.json`，流程规则回到对应 `SKILL.md` 或 references。
- 正式规则必须增加对应回归验证。
- 生成文档只反映权威来源，不反向成为权威来源。

## 输出约定

无论哪种模式，最终回复保持：

- 改了什么：
- 验证了什么：
- 剩余风险：

没有真实风险时写“无明显剩余风险”。
