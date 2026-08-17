# 工作流迭代与经验沉淀

> 仅在用户明确要求总结、登记、升级或清理经验时进入本流程。普通页面设计、修复和验收不自动记录经验，也不得在任务过程中持续扫描经验问题。

## 基本原则

- 经验沉淀由用户触发，不自动执行。
- 沉淀必须由 `wego-uxsystem-iterate` 技能执行，不得在主对话直接修改正式规则、组件、Token、Preview、守卫或工作流权威源。
- 经验数据必须位于 `.codex/skills/wego-uxsystem-iterate/experience/`：`evidence.json` 保存事实事件和证明材料，`candidates.json` 保存经验归纳和处理状态。
- 禁止在仓库根目录或其它技能下创建 `experience/`、`evidence.json`、`candidates.json` 或其副本；相对路径不得作为写入目标。
- 用户要求总结本次任务经验时，先记录本次任务已发生的事实事件，再分类、归属、去重并关联经验。
<!-- rule-id: experience-summary-must-default-observe -->
- 用户只要求总结、登记或沉淀经验时，默认将有效经验登记为 `observing`，不得询问是否直接升级；只有首次达到升级阈值时才提示用户确认是否升级。用户主动明确要求立即升级时，按正式升级流程处理。
- 用户确认升级前，不得修改正式规则、组件、Token、Preview、守卫或工作流权威源。
- 已有同义规则时只修正唯一权威源，不新增平行表述。
- 单场景特例、普通代码错误、无复用价值的局部调整不得进入经验数据。
<!-- rule-id: experience-evidence-must-remain-traceable -->
- 事实事件、累计次数和升级历史长期保留。升级只改变状态和正式落点，不删除经验，不中断历史累计。

## 沉淀技能入口

- 复盘和经验沉淀统一由 `wego-uxsystem-iterate` 承担，主对话或其它技能不得直接修改正式权威源。
- 进入本流程后必须读取本文件、`evidence.json` 和 `candidates.json`，不得跳过事实登记、分类和归属直接修改正式规则。
- “全部升级”等批量指令不构成快捷路径，必须逐条按规范处理。

## 分类与归属判断

<!-- rule-id: experience-classification-must-start-from-existing-authority -->
分类前先检查正式权威源：

1. 正式规则已经直接覆盖且可执行，但本次没有被读取、执行、同步或拦截：归 `execution / rule-execution-failure`，不得重新归为“缺规则”。
2. 正式规则存在，但规则本身重复、冲突、过时、过度泛化或不可执行：归 `governance` 对应类型。
3. 没有正式规则覆盖时，才按问题首次产生的根因层级分类；不得按最终修改文件、用户用词或错误表象分类。

<!-- rule-id: experience-owner-must-be-earliest-preventer -->
`ownerSkill` 指向正常工作流中本应最先阻止问题的技能：

- 业务目标、范围、入口、状态和数据：`wego-product`
- 页面结构、组件消费、交互、视觉和结果自审：`wego-design`
- 组件、Preview、Token、UI Kit、资源、消费规则、守卫和工作流：`wego-uxsystem-iterate`

跨技能通用规则的唯一权威源可落到 `AGENTS.md`，但 `ownerSkill` 仍填写最早应做正确决定的业务技能。最终修复文件不决定 `ownerSkill`。

`targetAuthority` 表示本次经验若升级最可能修改的唯一权威位置。`observing` 阶段无法确定时可为 `null`；进入 `proposed` 或 `upgraded` 前必须收敛为一个结构化路径，不得并列多个备选位置。

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

- `rule-execution-failure`：正式规则已存在，但因入口、顺序、表达、消费或门禁问题未被执行。
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

1. 只读取本次任务已经发生的事实、用户纠正、返工原因、能力缺口、临时回退和验证结果。
2. 排除普通代码错误、需求临时变化、单次视觉微调和没有证据的 AI 自审判断。
3. 在 `evidence.json` 新增一个独立事实事件。一次任务、迭代或验收中的同根因多个表现只登记一个事件，在该事件内追加多条证明材料。
4. 按“先查已有正式规则，再定位首次根因”的顺序确定 `category`、`type`、`ownerSkill`、`rootCause` 和唯一拟落点。
<!-- rule-id: experience-deduplication-must-follow-root-cause -->
5. 按 `relatedRuleId → rootCause → ownerSkill → normalizedKey` 的顺序查找同一经验。页面、组件、字段和错误位置不同，只要正式规则、根因和归属相同，就必须归并。
6. 命中已有经验时，追加 `evidenceRefs`、合并场景，`occurrenceCount +1`；新经验初始次数为 1、状态为 `observing`。`occurrenceCount` 按独立事实事件计数，不按事件内证明材料数量计数。
7. 可验证的历史任务、提交、用户反馈或验收记录可以补登记为独立事件；无法追溯的主观记忆不得补计次数。
8. 首次 `occurrenceCount` 达到 3 时，状态自动改为 `proposed`，`proposalReason` 设为 `threshold`，并提示用户确认是否升级。
9. 用户主动明确要求立即升级时，状态改为 `proposed`，`proposalReason` 设为 `explicit-upgrade`，再进入正式升级。
10. 已经 `upgraded` 的经验出现新的同类事实事件时，次数继续累计并立即回到 `proposed`，`proposalReason` 设为 `post-upgrade-recurrence`；不得重新等待 3 次。此时必须复查上次分类、归属、落点和修复内容。

“全部升级”等批量指令必须逐条按本流程处理，不构成跳过分类、证据或归属判断的快捷路径。

## 经验状态

- `observing`：已登记，继续收集事实事件；首次累计达到 3 次前保持此状态。
- `proposed`：达到首次阈值、用户明确要求立即升级，或升级后再次复发，需要用户确认或重新调整。
- `upgraded`：正式修复已完成、验证通过且升级历史已记录；继续接受后续事实事件。

`occurrenceCount` 是从首次发现至今的累计总次数，只增不减。升级后再次出现不清零，也不创建新的同义经验。

## 数据要求

### evidence.json

`.codex/skills/wego-uxsystem-iterate/experience/evidence.json` 是事实事件账本。每条事件必须包含：

- 稳定唯一的 `id`
- 关联经验 `experienceId`
- `occurredAt`
- 可追溯的 `taskRef`
- `scenes`
- 本次事件事实 `fact`
- 支撑该事实的 `evidence`

事件只追加或纠正明确的数据错误，不因经验升级而删除。一个事件只能计入一个经验的一次出现。

### candidates.json

`.codex/skills/wego-uxsystem-iterate/experience/candidates.json` 保存经验归纳。每条经验必须包含：

- 稳定唯一的 `id` 与 `normalizedKey`
- `category` 与 `type`
- `ownerSkill`
- `problem`、`rootCause` 与当前 `resolution`
- 唯一结构化 `targetAuthority`，观察阶段未确定时为 `null`
- 已有正式规则时填写 `relatedRuleId`
- `evidenceRefs` 与 `scenes`
- `occurrenceCount`
- `status` 与 `proposalReason`
- 持续追加的 `upgradeHistory`
- `createdAt` 与 `updatedAt`

经验不得复制完整正式规则正文。`occurrenceCount` 必须等于关联的独立事实事件数量。

## 正式升级

升级对象必须来自 `candidates.json`。若用户直接要求升级但经验尚未登记，必须先补记事实事件、经验归纳和分类，由用户确认后再升级。

升级时：

1. 重新核对已有正式规则、真实根因、`ownerSkill` 和唯一 `targetAuthority`。
2. 优先修复真实断点。已有规则已经覆盖时，先检查执行入口、消费者、同步和验证，不得默认再增加同义规则。
3. 原则和规则必须使用目标来源已有表达方式并保留稳定 `rule-id`；组件和结构化资源使用自身 Schema。
4. 只同步直接消费者；只有能够从源码或运行结果客观验证的要求才增加守卫。
5. 验证通过后向 `upgradeHistory` 追加一条记录，包含：顺序版本、升级时间、依据的 `evidenceRefs`、唯一 `targetAuthority`、相关 `ruleIds`、改动摘要和实际规则改动提交 `commitSha`。
6. 为避免提交 SHA 自引用，先提交正式修复，再用后续追踪提交写入该修复提交的 SHA；写入完成后状态才改为 `upgraded`，`proposalReason` 清空。
7. 升级记录和事实事件均不得删除。后续复发时保留全部历史，并直接进入重新调整。

完成后运行：

```bash
node scripts/validate-experience-records.mjs test
node scripts/validate-wego-design.mjs --scope=system --strict
```

升级后必须自检：

- 经验数据只存在于本技能的 `experience/evidence.json` 与 `experience/candidates.json`。
- 分类与类型匹配，`ownerSkill` 是最早应阻止问题的技能。
- `evidenceRefs` 全部存在，`occurrenceCount` 与独立事实事件数量一致。
- `proposed` 或 `upgraded` 的 `targetAuthority` 已收敛为唯一位置。
- `upgradeHistory` 能通过 `commitSha` 追溯实际修复内容。
- 升级后的新事实事件会立即使经验回到 `proposed`。

## scenarioTypeRegistry

只登记成熟且被运行时消费的类型。经验分类、候选状态、历史技能职责和单场景特例不得进入注册表。
