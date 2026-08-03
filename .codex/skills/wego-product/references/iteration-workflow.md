# 业务迭代工作流

> 创建、提交、确认、失效或冻结迭代时只读对应章节。状态与指纹由 `scripts/iteration-record.mjs` 维护，不手写内部治理字段。

## 迭代位置

```text
wego-app/scenes/{主业务场景}/_iterations/{YYYYMMDD}-{iteration_id}-{title}/
├── iteration.json
├── {iteration_id}-{title}-范围确认.md
└── freeze.json   # 仅明确冻结后存在
```

同一需求在验收和反馈期间复用当前未冻结迭代。只有原迭代已冻结、已终止或用户明确开始独立需求时新建。

## AI 维护的内容

`iteration.json` 使用 `schemaVersion: 6`。AI 只直接维护：

- `identity` 中的迭代标识、标题、主场景和关联场景。
- `prototype_brief`。
- `affected_scenes`。
- 确有场景外运行时改动时维护 `affected_runtime`。

`brief_submission`、`brief_confirmation`、`prototype_submission`、`prototype_confirmation`、`stage_outputs`、`change_log`、`freeze`、范围哈希和文件指纹全部由脚本维护，不直接编辑。

`prototype_brief` 只允许以下字段：

```json
{
  "goal": "",
  "included": [],
  "excluded": [],
  "entry_points": [],
  "critical_paths": [],
  "prototype_boundaries": [
    {
      "flow_id": "publish-product",
      "mode": "functional",
      "visible_result": "用户完成发布并看到成功结果"
    }
  ],
  "states": [],
  "data_contract": {},
  "assumptions": [],
  "open_questions": []
}
```

提交前，目标、纳入范围、入口、关键路径、原型边界和状态必须非空，`data_contract` 必须是非空对象，`open_questions` 必须为空。`flow_id` 使用唯一 kebab-case；`mode` 只能是 `functional`、`simulated` 或 `stub`。

## 命令与状态

```text
draft
  → submit-brief
awaiting-brief-confirmation
  → 用户明确确认 → confirm-brief
prototyping
  → submit-prototype
awaiting-prototype-confirmation
  → 用户验收 → confirm-prototype
prototype-confirmed
  → 用户明确要求冻结 → freeze
frozen
```

暂停或终止状态为 `blocked | cancelled | superseded`。

所有命令都通过统一脚本执行：

```bash
node scripts/iteration-record.mjs init \
  --file wego-app/scenes/{场景}/_iterations/{迭代}/iteration.json \
  --iteration-id {id} --title {标题} --scene {场景}

node scripts/iteration-record.mjs submit-brief --file {iteration.json}
node scripts/iteration-record.mjs confirm-brief --file {iteration.json} \
  --user-confirmed-brief {iteration_id}
node scripts/iteration-record.mjs submit-prototype --file {iteration.json}
node scripts/iteration-record.mjs confirm-prototype --file {iteration.json} \
  --user-confirmed-prototype {iteration_id}
node scripts/iteration-record.mjs invalidate --stage=brief --file {iteration.json}
node scripts/iteration-record.mjs invalidate --stage=prototype --file {iteration.json}
node scripts/iteration-record.mjs check --file {iteration.json}
```

- `submit-brief` 固定当前范围；随后向用户展示简短文字摘要。
- `confirm-brief` 只能在用户看过当前摘要并明确确认后执行，命令中的迭代 ID 必须与当前记录一致。
- `submit-prototype` 会重新验证受影响场景并固定待验收源码、样式和路由指纹；浏览器或源码验证失败时不得进入下一状态。
- `confirm-prototype` 只能在用户验收当前提交后执行，命令中的迭代 ID 必须一致，且当前原型指纹必须与提交验收时完全相同；发生漂移必须先失效并重新提交验收。
- `confirm-prototype` 表示当前原型已验收，不代表冻结。

## 失效

- 目标、范围、入口、关键路径、状态、数据或可见结果变化：先 `invalidate --stage=brief`，更新简报，再重新提交和确认。
- 已确认范围内的视觉、布局、组件、Token、路由或交互变化：先 `invalidate --stage=prototype`，修改后重新提交验收。

失效在原迭代中继续，不自动新建迭代。冻结迭代不得失效或覆盖。

## 冻结

<!-- rule-id: business-iteration-explicit-user-freeze -->
只有用户明确指定迭代并要求“冻结”时执行：

```bash
node scripts/iteration-record.mjs freeze \
  --file {iteration.json} \
  --user-confirmed-freeze {iteration_id}
```

确认、测试、验收、交付、提交、部署或时间经过都不能推断冻结意图。目标迭代不明确时保持 `prototype-confirmed` 并询问用户。

冻结指纹由脚本自动覆盖：

- 每个受影响场景的 `scene.js` 和 `scene.css`。
- 该场景在 `routes.js` 中的实际路由语义。
- `affected_runtime` 中确有必要的文件。

脚本生成 `freeze.json` 并禁止覆盖。冻结后的记录是历史快照，不再为场景修改提供有效迭代绑定；后续变化必须进入新的或仍有效的未冻结迭代。
