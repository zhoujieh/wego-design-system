# 经验候选池

> 角色：候选数据结构。读取条件：工作流迭代模式录入、确认或升级经验时；正式规则正文不写在本文件。

候选池只保存待确认或已落地规则的追踪元数据。规则内容必须写入 `authority-registry.json` 指定的唯一来源。

## 当前结构

```json
{
  "schemaVersion": 2,
  "mode": "fast-iteration",
  "threshold": 1,
  "standard_threshold": 3,
  "candidates": []
}
```

每条候选必须包含稳定 `id`、`normalized_key`、归属环节、`rule_ownership`、运行时可达性、证据和时间。`rule_ownership` 必须包含归属类别，以及唯一 `file`、`locator`、`rule_id`；已升级规则指向设计决策原则或场景合同时，`locator` 必须精确写成 `rule-id: {rule_id}`，且正文存在同名标记。只有 `skill-entry` 类可声明 `entry_scope`，且只能取归属注册表的五项白名单。

## 录入与升级

同类候选只累计证据。达到候选阈值后进入 `awaiting-confirmation`；用户确认、唯一来源已更新且验收链路已落地后才可设为 `promoted`。候选不进入 `scenarioTypeRegistry`，也不保存迁移豁免、旧字段或第二份正式规则。
