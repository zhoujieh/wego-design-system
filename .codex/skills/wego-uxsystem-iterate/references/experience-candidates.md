# 经验候选池

本目录只服务 `wego-uxsystem-iterate` 的工作流迭代模式。普通页面生成、设计消费、原型实现和验收技能不得读取这里的候选内容。

## 文件

- `candidates.json`：机器可读的经验候选池，由 AI 在满足入口门禁后更新。
- 本文件：字段、阈值、流程和禁止事项，不保存具体经验。

## 进入候选池的前提

只有用户明确要求“审查并沉淀经验”“补充规则”“复盘并形成经验”或“优化工作流”时，才允许更新候选池。一次审查最多记录一条最重要、最有复用价值的经验。

归属、正式权威落点、运行时消费方或验收方式任一项不明确，不得入池。

## 顶层结构

```json
{
  "schemaVersion": 1,
  "mode": "fast-iteration",
  "threshold": 1,
  "standard_threshold": 3,
  "candidates": []
}
```

当前 `threshold` 为快速迭代阶段生效阈值，默认 `1`；`standard_threshold` 保留标准稳定阶段的 `3` 次门槛。历史 `observing` 候选不因阈值调整批量改为待确认，只有新增或本轮复用更新时才按当前阈值进入确认。

## 候选字段

每条候选必须包含：

- `id`：稳定唯一标识，例如 `exp-page-width-stability`。
- `normalized_key`：用于同类匹配的稳定键，不包含具体业务名。
- `title`：抽象后的经验名称。
- `status`：`observing | awaiting-confirmation | promoted | rejected`。
- `occurrence_count`：累计出现次数，从 1 开始。
- `threshold`：候选自身的确认阈值；快速迭代阶段新候选默认 1，标准稳定阶段默认 3。
- `primary_owner`：`wego-product | wego-design | wego-ux | wego-tests`。
- `secondary_owners`：次要关联环节数组。
- `ownership_reason`：为什么问题最初产生在主要归属环节。
- `problem_pattern`：去除业务名后的重复问题模式。
- `scene_evidence`：去重后的场景证据数组，每条包含 `date`、`scene`、`summary`、`source`。
- `applies_when_candidates`：候选阶段观察到的适用条件。
- `avoid_when_candidates`：候选阶段观察到的不适用条件。
- `expected_rule_target.file`：未来正式规则的预期权威文件。
- `expected_rule_target.field`：未来正式规则的预期字段或章节。
- `runtime_reachability.consumer_skill`：未来由哪个技能读取。
- `runtime_reachability.output_field`：影响哪个输出字段或实现动作。
- `runtime_reachability.downstream_consumer`：如何传递给下游。
- `runtime_reachability.acceptance_check`：最终由谁、用什么方式验收。
- `created_at`、`updated_at`：ISO 8601 时间。

当 `status=promoted` 时还必须包含：

```json
{
  "formal_rule": {
    "confirmed_at": "ISO 8601 时间",
    "file": "正式权威文件",
    "field": "正式字段或章节",
    "rule_id": "稳定规则标识"
  }
}
```

## 匹配和计数

1. 先按 `normalized_key`、`problem_pattern`、主要归属、预期落点和触发条件判断是否同类。
2. 业务名称不同但错误模式与未来决策动作相同，必须累计原候选，不得新增。
3. 同类候选只增加 `occurrence_count` 并追加去重证据。
4. 新候选次数从 1 开始，并使用当前候选池 `threshold`；若已达到阈值，同轮置为 `awaiting-confirmation`。
5. 达到候选自身 `threshold` 时改为 `awaiting-confirmation` 并询问用户，不得自动升级。
6. 用户明确确认且正式规则、运行时链路、回归验证均已落地后，才能改为 `promoted`。

## 禁止事项

- 禁止把普通反馈或 AI 自查自动写入候选池。
- 禁止一次审查批量记录多条经验。
- 禁止因业务名不同重复创建同类候选。
- 禁止在达到当前阈值时直接修改正式规则。
- 禁止把候选写入 `scenarioTypeRegistry`。
- 禁止让业务开发技能读取候选池并影响页面生成。
- 禁止把 `specs/*.md` 当作候选或正式规则的权威落点。
