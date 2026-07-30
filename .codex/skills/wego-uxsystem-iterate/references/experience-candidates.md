# 经验候选池

> 角色：候选数据结构。读取条件：工作流迭代模式录入、确认或升级经验时；正式规则正文不写在本文件。

候选池只保存尚待确认的追踪元数据。正式规则必须写入 `authority-registry.json` 指定的唯一来源；落地或废弃后删除候选，历史由 Git 保留。

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

每条候选必须包含稳定且唯一的 `id`、`normalized_key`、归属环节、拟落点、证据和时间。拟落点必须命中注册表中的一类；候选不复制正式规则正文。

## 录入与升级

同类候选只累计证据。达到阈值后进入 `awaiting-confirmation`；用户确认后更新唯一来源和直接消费者，能客观验证时再补守卫，随后从候选池删除。候选不保存已落地或已废弃规则、不进入 `scenarioTypeRegistry`，也不保存迁移豁免、旧字段或第二份正式规则。
