# 业务迭代契约与跨技能交接

本文件是业务迭代的详细权威规则。`wego-product` 负责创建和确认迭代范围；`wego-design`、`wego-ux`、`wego-tests` 只消费各自阶段需要的字段，不得重写产品范围。

## 1. 顶层版本规则

- 当前项目只使用一套业务迭代 Schema，固定为 `schemaVersion: 2`。
- 禁止创建、读取、验证或继续执行 `schemaVersion: 1`。
- 禁止 v1/v2 双状态机、旧命令别名、旧字段兜底、回退读取、双写和静默迁移。
- 发现旧迭代时必须停止并明确提示迁移；迁移完成前不得进入任何下游技能。
- 历史版本信息只允许存在于 Git 历史，不得作为运行时规则或验证分支保留。

## 2. 适用范围

以下任务必须建立业务迭代：

- 新业务页面、场景、流程或宿主入口。
- 已有业务场景的产品、设计或实现变化。
- 跨 scene、route、宿主入口或无独立 route 的 surface 联动。
- 小型 Bug 和紧急修复；可使用 `hotfix` 编号，但不得绕过范围确认和验收。

纯设计系统、组件、Token、Preview、UI Kit、工作流本体或仓库管理变更不建立业务迭代。

## 3. 目录和命名

迭代只归档在唯一主业务场景下：

```text
wego-app/scenes/{主业务场景}/_iterations/{YYYYMMDD}-{iteration_id}-{title}/
├── iteration.json
├── {iteration_id}-{title}-范围确认.md
├── {iteration_id}-{title}-开发交接.md
├── freeze.json
└── scenes/{受影响场景}/
    ├── interaction_spec.json
    ├── design_plan.json
    └── acceptance_report.json
```

- 主 App 和各场景 `_spec/` 始终表示当前最新状态。
- `_spec/archive/` 保存覆盖前的同格式过程版本，不保留旧格式运行入口。
- `_iterations/` 只保存正式交付批次。
- 迭代目录不复制历史运行代码；`freeze.json` 记录当前文件路径、SHA-256 和真实存在的 Git 提交。

## 4. 标识边界

- `iteration_id`：一次交付批次。
- `feature_id`：跨迭代稳定的业务能力。
- `requirement_id`：当前迭代的变化项。
- `flow_id`、`node_id`、`surface_id`、`content_id`：由场景 `interaction_spec` 维护。

不得把迭代编号当成功能、场景或 route 的长期标识。

## 5. iteration.json 最小结构

```json
{
  "schemaVersion": 2,
  "identity": {
    "iteration_id": "shop001",
    "title": "快捷发布",
    "date": "2026-07-11",
    "primary_scene": "快捷发布产品",
    "related_scenes": ["动态"]
  },
  "status": "draft",
  "scope_revision": 1,
  "prototype_brief": {
    "goal": "",
    "included": [],
    "excluded": [],
    "entry_points": [],
    "critical_paths": [],
    "prototype_boundaries": [],
    "assumptions": [],
    "open_questions": []
  },
  "prototype_design": {
    "surface_decisions": []
  },
  "brief_confirmation": null,
  "prototype_confirmation": null,
  "base_fingerprint": {},
  "product_scope": {},
  "features": [],
  "requirements": [],
  "traceability": [],
  "affected_scenes": [],
  "affected_runtime": [],
  "stage_outputs": {
    "product": { "valid": false },
    "design": { "valid": false },
    "implementation": { "valid": false },
    "acceptance": { "valid": false }
  },
  "change_log": [],
  "freeze": null
}
```

`prototype_brief` 是范围确认的唯一前置物。`prototype_design` 由 `wego-design` 写入。`prototype_confirmation` 保存用户定稿时间、确认人、简报/设计指纹和全部原型运行时文件指纹。

## 6. 状态机

唯一状态机：

```text
draft
→ awaiting-brief-confirmation
→ prototyping
→ awaiting-prototype-confirmation
→ prototype-confirmed
→ product-confirmed
→ design-ready
→ implemented
→ testing
→ accepted / accepted-with-risk
→ frozen
```

终止或暂停状态：`blocked | cancelled | superseded`。

状态只能通过 `scripts/iteration-record.mjs` 推进：

1. `submit-brief`：提交极简原型简报。
2. `confirm-brief`：用户确认范围，进入 `prototyping`。
3. `submit-prototype`：提交真实交互原型等待定稿。
4. `confirm-prototype`：锁定原型快照。
5. `formalize-product`：补齐正式产品字段、`interaction_spec` 和范围确认记录。
6. `mark-design`：确认正式设计计划无 gap。
7. `check-prototype-snapshot`：确认原型快照未漂移。
8. `mark-implemented`：记录实现追踪。
9. `start-testing`：进入正式验收。
10. `handoff`：生成开发交接。
11. `freeze`：冻结迭代。

旧命令 `scope`、`confirm-scope`、`check-base` 不再允许执行。

## 7. 产品范围确认

`wego-product` 必须：

1. 登记主场景、关联场景和受影响宿主文件。
2. 以简短可读摘要让用户确认 `prototype_brief`。
3. 用户定稿后拆分完整 requirement、flow、surface、状态和数据交接。
4. 更新所有相关 `interaction_spec.iteration_context`。
5. 运行 `formalize-product`，生成范围确认记录并进入 `product-confirmed`。

正式规格 readiness 必须为 `ready` 或 `ready-with-assumptions`。

## 8. 各阶段所有权

### wego-design

- 原型期消费 `prototype_brief`，写入 `prototype_design` 并交给 `wego-ux`。
- 正式阶段生成无 gap 的 `design_plan`。
- 只能补充设计引用，不能新增功能、页面职责、流程、结果或数据含义。

### wego-ux

- 原型期只在 `prototyping` 且 `prototype_design` 完整后修改登记范围内运行时。
- 原型定稿后只在 `design-ready` 补实现追踪并核验快照。
- 发现产品变化回到 `wego-product`；发现设计变化回到 `wego-design`。

### wego-tests

- 只在 `implemented` 后输出正式验收，并验证原型快照未漂移。
- `requirement_coverage[]` 覆盖全部非 excluded 需求。
- 通过后生成开发交接、复制最终规格快照并冻结迭代。
- 发现任何旧版本或兼容分支直接 fail。

## 9. 修改与失效

- 简报目标、范围、入口或关键路径变化：`invalidate --stage=brief`。
- 定稿原型运行时、交互或设计约束变化：`invalidate --stage=prototype`。
- 正式产品文档或追踪变化：`invalidate --stage=product`。
- 产品目标或流程变化：回到 `wego-product`。
- 布局、组件或打开方式变化：回到 `wego-design`。
- 规格和设计不变，仅修实现：回到 `wego-ux`。
- 仅修验收方法或报告：回到 `wego-tests`。
- 冻结后不得修改；后续变化建立新迭代。

所有修改写入 `change_log`。`invalidate` 必须在修改对应阶段产物之前执行。

## 10. 场景基线与并行边界

影响范围不重叠的多个迭代可以并行。同一场景或同一 `affected_runtime` 文件不得被多个活跃迭代同时认领。

进入正式实现追踪前必须比较已确认原型快照和设计阶段基线。发生漂移时必须失效对应阶段，不得在旧基线上直接覆盖。

## 11. 特殊场景

- Sheet、Modal、Dialog 和 inline 使用 `surface_id` 追踪，不强制创建 route。
- 删除功能或页面使用 `change_type=removed`。
- 场景合并必须记录来源、目标、入口迁移和旧内容清理。
- 设计系统缺口转入 `wego-uxsystem-iterate`。
- 开发交接必须区分原型验收、本地模拟、真实接口、推送和部署状态。

## 12. 开发交接与冻结

`wego-tests` 生成开发交接文档。冻结时：

1. 复制所有相关场景最终 `interaction_spec`、`design_plan`、`acceptance_report`。
2. 记录当前规格、实现文件和生成文档的 SHA-256。
3. 真实存在时记录 Git commit。
4. 写入 `freeze.json` 并把状态改为 `frozen`。
5. 冻结目录的新增、删除或修改一律失败。

## 13. 旧数据处理

- 历史场景不要求补录过去的迭代。
- 仓库中仍需继续测试或修改的旧迭代必须先一次性迁移到 `schemaVersion: 2`。
- 迁移是显式维护任务，不是运行时兼容能力。
- 迁移后删除旧字段、旧命令记录和旧状态机产物；不得保留双轨数据。