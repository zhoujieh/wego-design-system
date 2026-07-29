# 经验候选池

> 角色：候选数据结构。读取条件：工作流迭代模式录入、确认或升级经验时；正式规则正文不写在本文件。

候选池只保存待确认或已落地规则的追踪元数据。规则内容必须写入 `authority-registry.json` 指定的唯一来源。

## 当前结构

```json
{
  "schemaVersion": 3,
  "mode": "fast-iteration",
  "threshold": 1,
  "standard_threshold": 3,
  "candidates": []
}
```

每条候选必须包含稳定且唯一的 `id`、`normalized_key`、归属环节、`rule_ownership`、运行时可达性、证据和时间。`rule_ownership` 必须包含归属类别，以及唯一 `file`、`locator`、`rule_id`；归属路径必须且只能命中注册表的一类。已升级 Markdown 规则的 `locator` 必须精确写成 `rule-id: {rule_id}`，且正文存在同名标记；已升级 JSON 规则必须定位到具体属性或数组项，不得只写 `/runtimeTokens`、`/globalConsumptionRules`、`/pagePatterns` 等集合根。只有 `skill-entry` 类可声明 `entry_scope`，且只能取归属注册表的五项白名单。

## 录入与升级

同类候选只累计证据。达到候选阈值后进入 `awaiting-confirmation`；用户确认、唯一来源已更新且验收链路已落地后才可设为 `promoted`。`promoted` 记录必须包含严格 UTC `promoted_at`、与 canonical 完全一致的 `promotion_landing`、非空 `constraint_area` / `description`，并让 `runtime_reachability.acceptance_check` 指向仓库内实际可执行的守卫脚本。无法证明唯一规则已落地时不得保留 `promoted`，应退回等待或标记 `superseded` 并说明原因。候选不进入 `scenarioTypeRegistry`，也不保存迁移豁免、旧字段或第二份正式规则。
