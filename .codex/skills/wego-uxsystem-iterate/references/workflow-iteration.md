# 工作流迭代与经验沉淀

> 经验沉淀由信号驱动自动执行，不等待用户触发。目标是让 AI 设计得更好、更符合规范、更有设计感、更符合用户体验。
> 设计原则：轻量、不笨重——零信号零动作，不为沉淀增加用户确认和额外流程。

## 经验体系四层

| 层 | 载体 | 性质 | 谁维护 |
| --- | --- | --- | --- |
| L1 事实 | `.codex/skills/wego-uxsystem-iterate/experience/evidence.json` | 通过质量门的结构化因果事实；合入 main 后只增不减 | uxsystem |
| L2 核心摘要 | `.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md` | 一句话教训索引，会话前置读，≤1500 字符 | uxsystem |
| L3 场景技能 | `.codex/skills/wego-scene-*/SKILL.md` | 可被 AI 触发的固定流程，按需读取 | uxsystem |
| L4 正式规则 | AGENTS.md / SKILL.md / references / 守卫 | 跨场景硬约束 | uxsystem |

经验在四层之间单向流动：事实 → 摘要 → 场景技能 → 正式规则；已进入 main 的 L1 事实不删除，开放 PR 中尚未合入的候选事实可在验收阶段纠正。表中 L1/L2/L3 路径均相对仓库根，任何技能引用时直接使用完整路径，不再写 `experience/` 缩写或裸文件名。

## 基本原则

- 经验沉淀由 `wego-uxsystem-iterate` 统一承担，主对话或其它技能不得直接修改 L1/L2/L3 权威源，只允许写 L0 草稿。
- 已进入 `main` 的事实事件只增不减，不因升级或过时而删除；开放 PR 内尚未合入的候选事实允许在验收阶段撤回、拆分或改写。体量过大时按年归档（移动到 `evidence-archive/`，不删除）。
- 单场景特例、普通代码错误、需求临时变化、单次视觉微调不进入经验数据。
- 用户纠正、偏好、返工或失败是“触发复核的信号”，不是经验本身；只有通过质量门的因果规则才允许沉淀。
- 沉淀后告知用户：`🧠已沉淀经验：<因果规则>`；没有合格经验时不显示沉淀提示，不新增任何用户确认门禁。

## 触发信号（业务现场识别）

业务技能（wego-product / wego-design / wego-github-delivery）在会话中识别以下可观察信号。信号只进入 L0，不能直接增加 evidence、L2 次数或场景技能内容：

- **用户纠正**：用户明确说"不对""不是这样""应该是 xxx"
- **用户表达偏好**：用户说"我喜欢""以后都""不要再"
- **返工**：同一问题第二次出现，或验收打回后重做
- **踩坑**：CI 失败、守卫拦截、用户验收打回

识别后只做一件事：向当前交付单元的 `.tasks/experience-inbox.json` 追加一条草稿，描述观察到的现象而不是预先声称“已形成经验”。没有信号时不动作、不扫描、不汇报。

## L0 草稿格式（.tasks/experience-inbox.json）

```json
{
  "candidates": [
    { "date": "YYYY-MM-DD", "source": "user-correction", "scene": "场景/任务名", "summary": "事实描述", "tags": [] }
  ]
}
```

- inbox 是**未判定草稿**，不是经验数据，不受"经验只能在 uxsystem 目录"约束；随交付单元 worktree 生灭（`.tasks/` 已 gitignore）。通用临时产物清理和 worktree 自动清理必须保护未处理 inbox，只有本收口流程完成分流或明示无信号后才可清空。
- 业务技能只写 inbox，不直接写 evidence / EXPERIENCE / 场景技能。

## 收口扫描（每交付单元只一次）

时机：wego-design 五维验收清单之后、wego-github-delivery 合并之前，且**必须在 worktree 清理之前**完成（红线：未扫描不得清理 worktree）。

1. 读取 `.tasks/experience-inbox.json`。
2. 为空：一句话报告"本轮无经验信号"，结束。
3. 有候选：先区分需求事实、普通缺陷与经验候选；前两类确认已进入需求/契约/测试后丢弃草稿，只有经验候选继续过质量门；处理完清空 inbox。
4. 会话中断导致漏扫时，由 task-intake 启动巡检兜底补扫。

## 经验质量门（先于主题归属）

每条候选必须同时通过以下五项，任一不满足即不得进入 L1/L2/L3：

1. **因果明确**：能说明失败机制或判断依据，不只是“用户要求改成什么”或“最后改成什么”。
2. **跨任务可迁移**：去掉当前页面、控件、尺寸和文案等专名后，规则仍能用于另一任务。
3. **可改变动作**：能明确指导下一次实现、排查或验证采取什么动作。
4. **修复已验证**：同时有可观察失败和修复后的验证证据，不把猜测当经验。
5. **非冗余**：查询已有 evidence、场景技能和正式规则后，确认没有同义规则；同根因复发只增加复发计数，不复制新教训。

质量门采用“全通过”而非打分制。`user-correction`、`user-preference`、`rework` 等 source 只描述信号来源，不提供豁免。判断顺序固定为：

```text
L0 信号 → 需求/普通缺陷分流 → 五项质量门 → 主题归属 → L1/L2/L3/L4
```

### 不沉淀的去向

- **需求决定 / 验收口径 / 视觉数值 / 提示文案**：写入需求规格、组件契约或自动化测试。
- **普通代码错误 / 单点遗漏**：修复代码并补回归测试；没有可迁移机制时不写经验。
- **已有规则的正常应用**：引用现有规则完成任务，不新增 evidence，不增加次数。
- **同一任务内连续反馈**：按一个交付循环处理；只有同一根因在独立任务复发时才增加 L2 的 ×N。

## 沉淀分流（四层去向）

对通过五项质量门的候选再决定去向：

1. **一次出现但机制明确、影响一类问题**：写结构化 L1 事实 + L2 一句话决策索引。
2. **同场景累计 ×2，或固定流程已成型**：毕业创建 `wego-scene-*` 场景技能（L3），L2 只留一句话与指针。
3. **已有对应场景技能**：直接迭代该技能，L2 更新次数与日期。
4. **跨场景硬约束**：升格 L4 正式规则（rule-id / references / 守卫），流程见「正式升级」。
5. **已升格问题复发**：追加结构化 L1 复发事实，L2 仅在独立任务复发时更新计数，并复查上次修复点。

### 场景技能自动迭代（L3 持续自扩展）

收口分流时，只处理已经通过质量门的候选，再做主题归属判断；命中已有场景技能不能绕过质量门：

1. **判断**：质量门通过后，按 `.codex/skills/README.md` 场景技能登记表与 description 触发词判断是否命中已登记 `wego-scene-*`。
2. **命中 → 自动迭代**：只把可迁移的机制、动作或反例写入场景技能并挂 ev ID；纯功能契约和回归用例可直接更新测试 reference，但不冒充经验、不增加 L2 次数。迭代由 AI 基于事实推理驱动，**禁止脚本机械生成内容**。
3. **未命中但达毕业标准**（同场景累计 ×2 或固定流程已成型）：按「场景技能规范」新建场景技能并完成三重挂载。
4. **收尾**：每次迭代后运行 `node scripts/refine-experience.mjs --check` 与 `node scripts/validate-wego-design.mjs --scope=system --strict` 校验通过；场景技能结构变化（含自动迭代的累积）攒批走一个工作流短周期 PR，随迭代自然发生，不需要每次单独开 PR。
5. **反证提醒**：若同主题已迭代多次仍频繁出现同类新坑，说明流程或修复不彻底，应回到对应 references 规范本体定位根因，而非只加反例。

L1/L2 是纯文本数据、不影响运行时，随当前业务 PR 一起进 main，不单独开 PR；新建场景技能、改规则或守卫等结构性改动攒批，走一个工作流短周期 PR。

### 沉淀步骤（L1+L2 轻沉淀）

1. 用 `node scripts/refine-experience.mjs --related <关键词>` 只取相关事实，不全量读取事实文件。
2. 写入前逐项回答现象、机制、规则、适用边界、验证证据与去重结论；任何一项为空都停止沉淀。
3. 在 `.codex/skills/wego-uxsystem-iterate/experience/evidence.json` 追加结构化事实事件（兼容字段 + `kind/observation/mechanism/rule/scope/verification/novelty`）。
4. AI 基于事实推理，在 `.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md` 追加或更新一句话决策索引；×N 只表示同根因在独立任务中的出现次数。
5. 运行 `node scripts/refine-experience.mjs --check` 校验结构和引用，通过后才允许提交。
6. 告知用户 `🧠已沉淀经验：<机制 → 规则>`；若候选全部被分流，则不输出沉淀提示。

## 场景技能规范（L3）

- 路径：`.codex/skills/wego-scene-{场景名}/SKILL.md`，kebab-case；正文 ≤1500 字符，四段：**触发条件 / 固定流程 / 交付前检查清单 / 踩坑反例**（反例挂 ev ID）。
- frontmatter 必须有 `name` 和 `description`；description 写可观察的触发词与信号，供路由匹配。
- 定位：主链路技能**按需调用的子技能**，不承接业务阶段路由、不新增主链路节点；业务技能只读、只触发，不修改。
- 与 references 边界：references 是"规范本体（应该长成什么样）"，场景技能是"动作顺序 + 检查清单 + 踩坑反例"；场景技能成熟后回流 references 并删除自身、L2 改指针。
- 三重挂载才能被触发：① description 写触发词；② `.codex/skills/README.md` 场景技能分区登记；③ 对应主技能 SKILL.md 硬挂载"遇到 X 必须先读 wego-scene-x"。
- 不预防性建技能：每个场景技能必须有真实 evidence 支撑，达不到"×2 或流程固定"只留 L2。

## EXPERIENCE.md 格式

用 `§` 分隔，每条是一句话**决策指针**：`[标签] 条件/机制 → 动作。[ev-001] ×N，最近 YYYY-MM-DD`。每条摘要正文 ≤60 字符（不含 ev ID 与次数/日期计数）；不写需求结果或修改流水账。操作步骤、参数、坑细节一律毕业到 `wego-scene-*` 场景技能或正式规则。×N 只统计同根因在独立任务中的复发次数，同一交付循环内多轮反馈仍计一次。

**固化即降载（硬约束）**：经验一旦升格 L4 正式规则，立即从本文件删除对应摘要；一旦毕业 L3 场景技能，只保留一句指针（`[标签] …，详见 wego-scene-xxx。[ev-001] ×N`），不得再展开细节。目标是把摘要长期维持在上限 80%（1200 字符）以下，避免"每个会话前置读都在重复提醒已固化规则"。容量上限 1500 字符，超限时先按本约束降载已固化条目，再合并同类、淘汰过时（事实保留）。头部必须以 `# 经验视图` 开头并说明事实来源。

## 事实一致性校验

`node scripts/refine-experience.mjs --check` 只读校验，不生成内容：

1. 每条摘要引用的 evidence ID 必须存在；场景技能正文中的 ev ID 必须存在。
2. 表述与事实不得明显矛盾（关键词比对，仅警告）。
3. `§` 分隔、头部完整；摘要 ≤1500 字符。
4. `wego-scene-*` 目录必须有 SKILL.md 且 frontmatter 含 name/description。
5. 固化即降载：已存在 `wego-scene-*` 场景技能时，L2 摘要若引用了该技能内的 ev ID，必须为指针形式（摘要正文 ≤60 字符），否则报错提示压缩；防止已毕业细节重复占用索引。
6. `qualityGateSince` 起的新事实必须包含 `kind=experience` 及 observation/mechanism/rule/scope/verification/novelty；缺项直接失败。

`system/full` 统一验证同时运行 `refine-experience.mjs --self-test-quality`，确认合格结构放行，而 `kind=requirement` 与缺少 mechanism 的记录会被拒绝。

`--related <关键词>` 为只读查询，输出相关事实，供沉淀时控制读取量。校验失败必须修正后重跑，不得跳过。

## 正式升级（L4）

升级由用户触发（明确要求升级）或 agent 建议（某经验反复出现、影响跨场景时主动建议）。

1. 重新核对经验归属和唯一 `targetAuthority`。
2. 优先修复真实断点。已有规则已经覆盖时，先检查执行入口、消费者、同步和验证，不得默认再增加同义规则。
3. 修改正式规则（AGENTS.md / 技能文件 / 守卫脚本），只同步直接消费者。
4. 运行对应验证，通过后在 `.codex/skills/wego-uxsystem-iterate/experience/evidence.json` 追加升级记录事件。
5. 从 `.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md` 删除对应摘要；若已建场景技能，回流后删除技能并清理挂载点。
6. 升级后同类问题再次出现时，立即重新沉淀并复查上次修复内容。

## 文档漂移检查

工作流维护改动权威源后必须即时执行，不后置：

1. 按 `sync-matrix.md` 核对本次改动涉及的全部"必改"列。
2. 确认引用的规则锚点（`<!-- rule-id -->`）、文件路径、命令示例与实际一致。
3. 运行 `node scripts/validate-wego-design.mjs --scope=system --strict`，通过后才推送 PR。
4. 经验升级时，核对规则在 AGENTS.md、对应技能 SKILL.md、references/ 中的表述一致性。

## 数据 schema

### evidence.json

```
顶层：schemaVersion, qualityGateSince, events[]
兼容字段：id, date, summary, source, scene, tags[]
质量字段：kind="experience", observation, mechanism, rule, scope[], verification[], novelty
```

`summary` 只作检索摘要，真正的经验内容以六个质量字段为准。`qualityGateSince` 之前的历史事件按旧 schema 兼容；之后的新事件必须满足质量门。纯需求、普通缺陷和无机制的反馈不得写入 events。

### experience-inbox.json（L0 草稿，位于交付单元 .tasks/）

```
candidates[]{ date, source（同 evidence 枚举）, scene, summary, tags[] }
```

### EXPERIENCE.md（L2）

```
头部说明 + § 分隔的一句话摘要，每条含：[标签] 教训、[evidence ID]、×次数、最近日期
```
