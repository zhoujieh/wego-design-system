---
name: "wego-uxsystem-iterate"
description: 用于 wego-design 设计系统与工作流本体的正式迭代，包括组件、Token、Preview、UI Kit、消费边界、守门、经验候选、规则沉淀和技能链路优化。
---

# 项目级迭代 Skill

本文件是 `wego-uxsystem-iterate` 的唯一运行时权威入口。目标是让 AI 稳定、正确地输出符合微购设计规范的交互原型，同时保证规则来源唯一、经验升级可控、同步范围明确、验证链路完整。

## 何时触发

- 修改组件契约、组件 Preview、组件聚合 CSS、Token、图标、UI Kit、metadata 或设计系统守门。
- 修改 `library-consumption.json`、`uikit-plan.json` 或技能工作流。
- 审查组件、UI Kit、消费规则或工作流是否合理。
- 用户明确要求审查并沉淀经验、补充规则、复盘形成经验或优化工作流。

普通业务页面仍走：

`wego-product → wego-design → wego-ux → wego-tests`

## 三种模式

### 迭代模式

用于正式修改设计系统本体。

读取顺序：

1. 本文件。
2. `references/workflow.md`。
3. `references/sync-matrix.md`。
4. `references/judgment-principles.md`。
5. 本轮目标对应的结构化权威来源、Preview、UI Kit 和验证脚本。

执行要求：

- 先判断问题属于 Token、组件、页面范式、消费边界、宿主能力还是守门。
- 按同步矩阵读取所有受影响文件，不根据用户点名文件机械修改。
- 优先修改最早做错决定的权威来源，再同步下游投影和验证。
- 涉及设计系统本体时递增 `metadata.json.version`。

### 审查模式

用于只检查、不直接沉淀正式规则。

- 先按严重程度输出 findings、影响范围、证据和最早归属。
- 用户要求修复时可转迭代模式直接修复。
- 用户未明确要求经验沉淀或工作流优化时，不得更新经验池。
- 普通 Bug、实现偏差和验收失败只修当前问题，不自动升级规则。

### 工作流迭代模式

仅在用户明确表达以下任一意图时进入：

- 审查并沉淀经验。
- 补充规则。
- 复盘并形成经验。
- 优化工作流或技能链路。

读取顺序：

1. `references/workflow-iteration.md`。
2. `experience/README.md`。
3. `experience/candidates.json`。
4. 按问题最早归属读取对应技能及正式权威来源。
5. `references/sync-matrix.md`。
6. 相关生成与验证脚本。

## 规则归属

正式规则必须落到能被运行时真实消费的最小权威来源：

- 跨技能仓库硬约束：`AGENTS.md`。
- 技能触发、职责、输入输出和交接：对应技能唯一的 `SKILL.md`。
- 复杂流程说明：对应技能 `references/*.md`，并由 `SKILL.md` 明确引用。
- Token：`colors_and_type.css` 与 `css.json`。
- 单组件结构、状态、变体和行为：`components/{slug}.json` 与对应 Preview。
- 页面范式、fallback、presentation 和多组件组合：`uikit-plan.json`。
- 全局消费与复制边界、场景类型：`library-consumption.json`。
- 运行时实现：`wego-app` 正式宿主和场景；模板只作为初始化基线。
- 自动化检查：对应脚本和回归测试。

不得把同一规则正文复制到多个平级权威文件。下游只记录引用、执行要求或验收要求，不重复定义上游规则。

## Skill 单一入口硬规则

- 每个技能目录只能有一个运行时入口：`SKILL.md`。
- 禁止创建或保留 `SKILL.runtime.md`、`SKILL.core.md`、`SKILL.override.md` 等并列入口。
- `SKILL.md` 必须直接包含完整触发条件、职责边界、读取顺序、输入输出、门禁、交接和禁止事项。
- 需要拆分长篇背景、示例或专项流程时放入 `references/`，并由 `SKILL.md` 明确说明何时读取；reference 不能反向覆盖 `SKILL.md`。
- 更新技能时必须全仓检查旧入口引用、生成脚本来源、README、同步矩阵和守门逻辑。
- 删除旧入口前先把仍有效的规则合并到唯一 `SKILL.md`，清理已经废弃或被正式来源替代的规则，不能简单拼接。
- `scripts/specs.mjs` 和其他运行时脚本只能读取唯一 `SKILL.md`，不得把历史副本加入 source manifest。

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

## 正式规则升级

候选达到阈值并获得确认后：

1. 汇总不同场景证据，确认是同一问题而非表面相似。
2. 明确适用、不适用、例外和回退条件。
3. 检查现有规则，优先合并或增加例外，不优先新增平级规则。
4. 确认正式权威落点、运行时消费者、输出字段、下游传播和验收方式。
5. 修改最早权威来源，并同步所有必需投影。
6. 增加对应回归测试或守门。
7. 涉及设计系统本体时递增版本。
8. 生成并检查人工规则文档。
9. 将候选改为 `promoted`，记录正式文件、字段和规则 ID。

没有运行时可达性或验收方式的规则不得升级。

## 自动生成规则文档

`.codex/skills/wego-design/specs/*.md` 由 `scripts/specs.mjs` 从正式权威来源自动生成，只用于人工检查规则是否完整、清晰、重复或冲突。

- 不直接修改生成文档。
- 业务运行时技能不得读取生成文档。
- 修改正式规则来源后运行 `node scripts/specs.mjs generate`。
- 提交前运行 `node scripts/specs.mjs check` 和 `node scripts/specs.mjs test`。
- 生成文档与权威来源冲突时，以正式权威来源为准并重新生成。
- 生成脚本的 source manifest 必须只列当前真实权威来源，不包含历史副本。

## 跨模式同步与守门

每次正式迭代都要检查：

- 是否修改了最早权威来源，而不是只修下游表现。
- 组件契约、Preview、UI Kit、消费边界、部署副本和验收是否需要同步。
- 是否误改 `components.css` 或 `wego-app/lib/` 等生成/部署副本。
- 是否存在旧字段、旧 class、旧说明或旧 source manifest 残留。
- 是否需要递增 `metadata.json.version`。
- 是否增加了可自动执行的结构检查和必要人工验收项。
- 是否没有把局部经验扩大成所有场景的一刀切规则。
- 是否保持设计优先级：清晰 > 一致 > 效率 > 美观 > 创新。

最低验证：

```bash
node scripts/specs.mjs generate
node scripts/specs.mjs check
node scripts/specs.mjs test
node scripts/validate-wego-design.mjs
```

正式合并或用户要求全局审查时：

```bash
node scripts/validate-wego-design.mjs --scope=full --strict
```

涉及设计系统部署资源时补充：

```bash
node scripts/sync-wego-app-lib.mjs --check
```

所有验证必须记录真实命令和结果；未执行的检查不能写成通过。

## 修改完成后的全局审查

完成修改后必须再做一轮影响审查：

- 上游输出字段是否仍被下游读取。
- 下游是否仍引用已删除文件、旧字段或旧规则路径。
- 生成脚本、README、同步矩阵、守门和示例是否同步。
- 正常场景、边界场景、异常场景和回退路径是否都有覆盖。
- 是否出现新的规则重复、优先级冲突或循环依赖。
- 是否存在“脚本通过但运行时不消费”或“运行时消费但无人验收”的断链。

发现确定问题时直接修复并重新验证，不把已知问题留给后续任务。

## 输出约定

最终回复固定说明：

- 改了什么。
- 验证了什么。
- 剩余风险。

没有真实剩余风险时写“无明显剩余风险”；不能为了模板完整编造风险，也不能声称执行过未执行的验证。
