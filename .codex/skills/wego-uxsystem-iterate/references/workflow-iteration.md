# 工作流迭代与经验沉淀

> 经验沉淀由信号驱动自动执行，不等待用户触发。目标是让 AI 设计得更好、更符合规范、更有设计感、更符合用户体验。

## 基本原则

- 经验沉淀由 `wego-uxsystem-iterate` 统一承担，主对话或其它技能不得直接修改正式权威源。
- 经验数据位于 `.codex/skills/wego-uxsystem-iterate/experience/`：`evidence.json` 保存事实事件，`candidates.json` 保存经验归纳，`EXPERIENCE.md` 是自动提炼的经验视图。
- 禁止在仓库根目录或其它技能下创建经验目录、记录或副本。
- 事实事件和经验归纳只增不减，不因升级或过时而删除。
- 单场景特例、普通代码错误、需求临时变化、单次视觉微调不进入经验数据。

## 沉淀触发信号

遇到以下可观察信号时自动沉淀，不需要用户要求：

- **用户纠正**：用户明确说"不对"、"不是这样"、"应该是xxx"
- **用户表达偏好**：用户说"我喜欢"、"以后都"、"不要再"
- **返工**：同一问题第二次出现，或验收打回后重做
- **踩坑**：CI 失败、守卫拦截、用户验收打回

没有这些信号的轮次不沉淀。沉淀后告知用户：`🧠已沉淀经验：<简短描述>`。

## 沉淀标准

同时满足以下三条才沉淀：

1. **可复用**：未来的任务中可能再次遇到
2. **可行动**：能指导未来避免问题或做得更好
3. **非冗余**：不是已有正式规则或常识已经覆盖的

## 分类与归属

### 顶层分类（class）

- `workflow-lesson`：流程、交付、验证、规则执行、同步方面的教训
- `design-knowledge`：组件、Token、交互、视觉、用户体验方面的可复用知识

### 自由标签（tags）

用自由标签补充细分维度，如 `组件复用`、`CI验证`、`交付流程`、`用户偏好`、`视觉规范` 等，不预定义固定枚举。

### 归属（ownerSkill）

按正常工作流中本应最先阻止问题的技能归属：

- 业务目标、范围、入口、状态、数据：`wego-product`
- 页面结构、组件消费、交互、视觉、结果自审：`wego-design`
- 组件、Preview、Token、UI Kit、资源、消费规则、守卫、工作流：`wego-uxsystem-iterate`

跨技能通用规则的唯一权威源可落到 `AGENTS.md`，但 `ownerSkill` 仍填写最早应做正确决定的技能。

## 沉淀流程

1. 识别触发信号，判断是否满足沉淀标准。
2. 在 `evidence.json` 新增事实事件，记录 `date`、`summary`、`source`、`scene`、`tags`。
3. 按 `class` + `ownerSkill` + 核心问题查找已有经验。
4. 命中已有经验时追加 `evidenceIds`、`occurrenceCount +1`、更新 `lastObserved`；新经验初始次数为 1、状态为 `observing`。
5. 运行 `node scripts/refine-experience.mjs` 自动更新 `EXPERIENCE.md`。
6. 告知用户 `🧠已沉淀经验：<简短描述>`。

## 经验状态

- `observing`：已登记，继续收集事实事件
- `proposed`：用户确认升级中，或升级后复发需要重新调整
- `upgraded`：正式修复已完成、验证通过且升级历史已记录
- `stale`：90 天无新证据，自动标记，可复活（出现新证据即回到 observing）
- `obsolete`：场景下线或规则已取代，废弃，不复活

`stale` 和 `obsolete` 的经验在 `EXPERIENCE.md` 提炼和检索时过滤，但保留在经验库中。

## EXPERIENCE.md 自动提炼

`EXPERIENCE.md` 是从经验库自动生成的视图，3000 字符上限，每次经验库变化后运行 `node scripts/refine-experience.mjs` 更新。

提炼优先级：
1. `occurrenceCount` 高的经验
2. `lastObserved` 最近的经验
3. 跨场景通用的经验
4. 单场景特例最后

会话开始时冻结快照，本次会话内的写入不改变当前视图，下次会话生效。

## 正式升级

升级由用户触发（用户明确要求升级）或 agent 建议（某经验反复出现、影响跨场景时主动建议）。

升级流程：

1. 重新核对 `class`、`ownerSkill` 和唯一 `targetAuthority`。
2. 优先修复真实断点。已有规则已经覆盖时，先检查执行入口、消费者、同步和验证，不得默认再增加同义规则。
3. 修改正式规则（AGENTS.md / 技能文件 / 守卫脚本），只同步直接消费者。
4. 运行对应验证，通过后向 `upgradeHistory` 追加记录（版本、时间、依据证据、targetAuthority、ruleIds、改动摘要、commitSha）。
5. 状态改为 `upgraded`，从 `EXPERIENCE.md` 中删除对应条目。
6. 升级后同类问题再次出现时，立即回到 `proposed`（`proposalReason: post-upgrade-recurrence`），复查上次分类、归属和修复内容，不重新等待阈值。

## 文档漂移检查

工作流维护改动权威源后，必须即时执行以下检查，不后置：

1. 按 `sync-matrix.md` 核对本次改动涉及的全部"必改"列。
2. 确认引用的规则锚点（`<!-- rule-id -->`）、文件路径、命令示例与实际一致。
3. 运行 `node scripts/validate-wego-design.mjs --scope=system --strict`，通过后才推送 PR。
4. 经验升级时，核对规则在 AGENTS.md、对应技能 SKILL.md、references/ 中的表述一致性。

## 数据 schema

### evidence.json

```
id, date, summary（事实描述）, source（user-correction/rework/ci-failure/guard-block/acceptance-rejection/user-preference）, scene, tags[]
```

### candidates.json

```
id, class（workflow-lesson/design-knowledge）, title, lesson, action（以后怎么做）,
status（observing/proposed/upgraded/stale/obsolete）, ownerSkill, evidenceIds[],
occurrenceCount, firstObserved, lastObserved, tags[], targetAuthority（null 或 {path,anchor}）,
relatedRuleId（null 或 rule-id）, upgradeHistory[]
```
