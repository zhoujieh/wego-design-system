# 业务迭代契约

> 角色：业务范围确认与原型冻结的唯一状态机。读取条件：创建、确认、失效或冻结业务迭代；不承载组件、UI Kit 或场景实现规则。

## 1. 当前 Schema

迭代固定使用 `schemaVersion: 3`。旧 Schema、旧命令、废弃设计计划文件、实现追踪、验收报告和自动生成规则文档均不是当前输入；发现后必须停止并显式迁移。

```json
{
  "schemaVersion": 3,
  "identity": {
    "iteration_id": "shop001",
    "title": "快捷发布",
    "date": "2026-07-12",
    "primary_scene": "快捷发布产品",
    "related_scenes": []
  },
  "status": "draft",
  "scope_revision": 1,
  "prototype_brief": {
    "goal": "",
    "included": [],
    "excluded": [],
    "entry_points": [],
    "critical_paths": [],
    "states": [],
    "data_contract": {},
    "assumptions": [],
    "open_questions": []
  },
  "brief_confirmation": null,
  "prototype_confirmation": null,
  "affected_scenes": [],
  "affected_runtime": [],
  "stage_outputs": {
    "product": { "valid": false },
    "design": { "valid": false }
  },
  "change_log": [],
  "freeze": null
}
```

## 2. 状态机

```text
draft → awaiting-brief-confirmation → prototyping → awaiting-prototype-confirmation → prototype-confirmed → frozen
```

暂停或终止状态：`blocked | cancelled | superseded`。

- `submit-brief`：产品提交非空的目标、范围、入口、关键路径、状态和数据合同。
- `confirm-brief`：用户确认范围，交给 `wego-design`。
- `submit-prototype`：场景、决策证据和守卫均已完成；命令会实际运行每个受影响场景的场景合同，全部通过后才可等待用户定稿。
- `confirm-prototype`：锁定场景文件指纹与设计系统版本。
- `freeze`：在 `iteration.json.freeze` 与同目录 `freeze.json` 同时记录当前场景、路由和决策证据的指纹，禁止覆盖。
- `invalidate --stage=brief|prototype`：在对应产物修改前失效确认。

## 3. 所有权

- `wego-product`：创建迭代、确认范围、维护 `prototype_brief` 和业务事实。
- `wego-design`：消费已确认简报，在同一任务中实现已登记场景、生成决策证据、场景合同和视觉检查。
- `wego-uxsystem-iterate`：只处理设计系统缺口、DDR 和系统规则；不实现业务场景。

## 4. 目录与冻结

```text
wego-app/scenes/{主业务场景}/_iterations/{YYYYMMDD}-{iteration_id}-{title}/
├── iteration.json
├── {iteration_id}-{title}-范围确认.md
└── freeze.json
```

冻结记录必须包含实际场景文件、`routes.js`、`design-decisions.json`、设计系统版本和 SHA-256。后续业务变化建立新迭代；设计系统迭代不建立业务迭代。

## 5. 修改边界

- 目标、范围、入口、关键路径、状态或数据变化：失效 brief，回到 `wego-product`。
- 组件、布局、presentation、Token、路由或场景交互变化：失效 prototype，回到 `wego-design`。
- 组件、Preview、UI Kit、Token 或消费规则缺口：创建 DDR，转交 `wego-uxsystem-iterate`；DDR 不可替代业务范围确认。
