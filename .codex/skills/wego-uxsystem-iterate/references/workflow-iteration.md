# 工作流迭代与经验沉淀

> 仅在用户明确要求总结、登记、升级或清理经验时进入本流程。普通页面设计、修复和验收不自动记录经验，也不得在任务过程中持续扫描经验问题。

## 基本原则

- 经验沉淀由用户触发，不自动执行。
- 沉淀必须由 `wego-uxsystem-iterate` 技能执行，不得在主对话直接修改正式规则、组件、Token、Preview、守卫或工作流权威源。
- 经验文件必须位于 `.codex/skills/wego-uxsystem-iterate/` 内，唯一候选数据源为 `.codex/skills/wego-uxsystem-iterate/experience/candidates.json`。
- 禁止在仓库根目录或其它技能下创建 `experience/`、`candidates.json`、经验记录或任何候选池副本；相对路径不得作为写入目标。
- 用户要求总结本次任务经验时，先基于本次任务事实提取问题，再分类、去重并写入候选池。
<!-- rule-id: experience-summary-must-default-observe -->
- 用户只要求总结、登记或沉淀经验时，默认将有效候选登记为 `observing`，不得询问是否直接升级；只有候选达到升级阈值时才提示用户确认是否升级。用户主动明确要求立即升级时，按正式升级流程处理。
- 用户确认升级前，不得修改正式规则、组件、Token、Preview、守卫或工作流权威源。
- 已有同义规则时只修正唯一权威源，不新增平行表述。
- 单场景特例、普通代码错误、无复用价值的局部调整不得进入候选池。
- 候选池只保存尚未处理的经验；正式规则和 Git 历史承担落地追踪。已升级落地的经验不回填候选池。

## 沉淀技能入口

- 复盘和经验沉淀统一由 `wego-uxsystem-iterate` 技能承担，主对话或其它技能不得直接修改正式权威源。
- 进入本流程后必须读取本文件，按"用户触发后的处理流程"和"正式升级"两章执行，不得跳过分类与候选池环节直接改正式规则。
- "全部升级"等批量指令不构成快捷路径，必须逐条按规范处理。

## 问题归属

经验先判断问题首次产生在哪里、哪个技能应做正确决定、唯一权威源和实际消费者是什么：

- 业务目标、范围、入口、状态和数据：`wego-product`
- 页面设计、组件消费、交互和视觉：`wego-design`
- 组件、Preview、Token、UI Kit、资源、消费规则、守卫和工作流：`wego-uxsystem-iterate`
- 跨技能通用规则（如 AI 执行约束、提问方式、复盘职责）：按语义归 `AGENTS.md` 对应章节，不限定到「沟通要求」；只有真正关于"如何与用户对话"的规则才归「沟通要求」。

本技能可以登记所有分类，但只负责升级属于设计系统与工作流维护范围的正式能力。涉及业务或页面设计权威源时，必须明确目标归属后再修改对应唯一来源。跨技能通用规则归属 `AGENTS.md` 时，由本技能统一修订。

## 经验分类

候选使用 `category` 表示一级分类，使用 `type` 表示二级问题类型。

### requirement

- `requirement-gap`：完成任务所需的用户、目标、字段、角色、状态或结果信息缺失。
- `business-rule-conflict`：业务规则、状态、权限或数据含义前后冲突。
- `scenario-boundary-gap`：主流程存在，但空、错、权限、中断、恢复或重复提交等边界未定义。

### design

- `design-principle-gap`：现有原则无法支持稳定的跨场景设计判断。
- `page-architecture-issue`：页面区域、层级、滚动、固定或覆盖关系不合理。
- `page-pattern-gap`：缺少可复用的页面骨架或任务组织模式。
- `interaction-pattern-gap`：缺少稳定、可复用的交互行为模式。
- `visual-hierarchy-issue`：信息主次、密度、分组或视觉重量失效，且不能仅靠组件或 Token 修复。

### system

- `component-gap`：现有正式组件无法覆盖必要且可复用的结构能力。
- `component-variant-gap`：已有组件缺少必要结构变体。
- `component-state-gap`：已有组件缺少 loading、empty、error、disabled、selected、retry 等必要状态。
- `token-gap`：现有 Token 无法表达稳定、跨场景的设计语义。
- `asset-gap`：缺少正式图标、图片、示例资源，或资源命名、复用和一致性不足。
- `copy-pattern-gap`：缺少稳定的操作、反馈、错误、空状态或危险行为文案规范。

### execution

- `rule-execution-failure`：正式规则已存在，但因入口、顺序、表达或门禁问题未被执行。
- `workflow-gap`：需求确认、设计决策、组件检索、影响分析、同步或验证链路缺步骤。
- `ownership-drift`：规则、数据或职责放错技能或权威源。
- `sync-gap`：权威源更新后直接消费者、索引、生成物或引用未同步。

### validation

- `preview-gap`：Preview 缺失、状态不完整、不可真实使用或与契约不一致。
- `guard-gap`：可客观验证的问题缺少自动守卫。
- `guard-false-positive`：守卫错误拦截正确实现。
- `guard-false-negative`：守卫存在但漏掉实际错误。
- `validation-coverage-gap`：缺少跨页面、多状态、响应式、回归或真实交互验证。

### governance

- `duplicate-rule`：同义规则被重复建立。
- `rule-conflict`：多个正式规则给出不一致要求。
- `overgeneralized-rule`：单场景经验被错误泛化为全局规则。
- `obsolete-rule`：规则已不适合当前业务、架构或组件体系。
- `non-executable-rule`：规则无法指导具体决策，也无法形成可观察验收。
- `insufficient-evidence`：证据不足，暂不能升级。
- `scene-exception`：只适用于单一场景，应保留为局部处理而非全局规则。

## 用户触发后的处理流程

当用户要求总结本次任务经验教训时：

1. 只读取本次任务中已经发生的事实、用户纠正、返工原因、能力缺口、临时回退和验证结果。
2. 排除普通代码错误、需求临时变化、单次视觉微调和没有证据的 AI 自审判断。
3. 为每个有效问题确定 `category`、`type`、归属技能、拟落点和证据。**分类为沉淀流程的强制产物，不得跳过。**
4. 登记候选前必须回溯已落地规则：检查问题是否与已升级的正式规则相关。若相关，归因到 `rule-execution-failure`（规则未被执行），不得重新归因到"缺规则"。
5. 用户只要求总结、登记或沉淀时，直接读取 `.codex/skills/wego-uxsystem-iterate/experience/candidates.json`，按 `normalizedKey` 去重并沉淀，不再询问是否直接升级。
6. 命中已有候选时 `occurrenceCount +1` 并合并证据和场景；新候选 `occurrenceCount` 初始为 1，默认状态为 `observing`。将新增或更新后的候选写回唯一数据源。
7. 当 `occurrenceCount` 达到 3 时，状态自动改为 `proposed`；本次总结输出时必须明确告知用户该候选已达到升级阈值，并询问是否升级。用户主动明确要求立即升级时，登记候选为 `proposed`，执行正式升级，修改唯一权威源，验证通过后从候选池删除。

"全部升级"等批量指令必须逐条按本流程处理，不构成跳过分类与候选池的快捷路径。

## 候选状态

- `observing`：已登记，继续收集证据。
- `proposed`：证据和影响范围清楚，建议用户确认升级。

处理方式：

- 默认沉淀：用户只要求总结、登记或沉淀时，登记候选为 `observing`，保留候选并继续收集证据，不询问是否直接升级。
- 达到阈值：`occurrenceCount` 达到 3 时自动改为 `proposed`，并提醒用户确认是否升级。
- 明确升级：用户主动要求立即升级时，登记候选为 `proposed`，更新唯一权威源和直接消费者，能客观验证时补守卫，验证通过后从候选池删除。

## 候选数据要求

唯一数据源为 `.codex/skills/wego-uxsystem-iterate/experience/candidates.json`。每条候选必须包含：

- 稳定唯一的 `id`
- 用于去重的 `normalizedKey`
- `category` 与 `type`
- `ownerSkill`
- 问题事实 `problem`
- 本次或历史处理方式 `resolution`
- 拟修改的唯一来源 `targetAuthority`
- 证据列表 `evidence`
- 出现场景 `scenes`
- `occurrenceCount`：同类问题出现次数，初始为 1，命中已有候选时 +1
- `status`
- `createdAt` 与 `updatedAt`

候选不得复制完整正式规则正文，不保存迁移字段、已落地规则或第二份权威内容。

## 正式升级

升级对象必须来自候选池。若用户直接要求升级但候选尚未登记，必须先回填候选、确定分类、由用户确认后再升级，不得跳过候选池直接改正式规则。

升级时使用目标来源已有的表达方式：

- 原则和规则必须带稳定 `rule-id`，命名规范 `<领域>-<语义>-<动词>`，如 `confirm-brief-must-wait-affirmation`、`agent-must-read-host-code-before-asking`。`rule-id` 为强制要求，无 `rule-id` 的新增规则视为升级不完整。
- 组件和结构化资源使用自身 Schema。
- 只同步直接消费者；不生成规则投影、场景合同镜像或措辞检查。
- 只有能够从源码或运行结果客观验证的要求才增加守卫。
- 升级时在候选 `evidence` 留痕 `category`、`type`、`rule-id`，便于后续追溯。

跨技能通用规则的归属判断：按规则语义归 `AGENTS.md` 对应章节，不限定到「沟通要求」。AI 执行约束（如"先查后问"、"结构化提问"）归独立章节或对应执行约束章节；只有真正关于"如何与用户对话"的规则才归「沟通要求」。

完成后删除已落地候选，然后运行：

```bash
node scripts/validate-wego-design.mjs --scope=system --strict
```

升级后必须自检：

- 候选池路径：只存在 `.codex/skills/wego-uxsystem-iterate/experience/candidates.json`，仓库根目录和其它技能不存在经验副本。
- 候选池 diff：已升级候选已删除，无残留。
- 分类一致性：升级规则的 `rule-id` 与候选 evidence 留痕一致。
- 归属合理性：规则落点符合「问题归属」章节判断，跨技能通用规则未错放到专有技能 SKILL.md。

## scenarioTypeRegistry

只登记成熟且被运行时消费的类型。经验分类、候选状态、历史技能职责和单场景特例不得进入注册表。
