# 业务迭代契约与跨技能交接

本文件是业务迭代的详细权威规则。`wego-product` 负责创建和确认迭代范围；`wego-design`、`wego-ux`、`wego-tests` 只消费各自阶段需要的字段，不得重写产品范围。

## 1. 适用范围

以下任务必须建立业务迭代：

- 新业务页面、场景、流程或宿主入口。
- 已有业务场景的产品、设计或实现变化。
- 跨 scene、route、宿主入口或无独立 route 的 surface 联动。
- 小型 Bug 和紧急修复；可使用 `hotfix` 编号，但不得绕过范围确认和验收。

纯设计系统、组件、Token、Preview、UI Kit、工作流本体或仓库管理变更不建立业务迭代，转入 `wego-uxsystem-iterate` 或对应维护流程。

## 2. 目录和命名

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
- `_spec/archive/` 继续保存规格覆盖前的过程版本。
- `_iterations/` 只保存正式交付批次；关联场景不得重复建立同一迭代目录。
- 迭代目录不复制历史运行代码；`freeze.json` 记录当前文件路径、SHA-256 和真实存在的 Git 提交。
- 场景名、迭代标题和 `affected_runtime` 必须是仓库内安全相对路径；禁止绝对路径、`..`、路径分隔符越界和把 `wego-app/lib/` 认领为业务运行时文件。

## 3. 标识边界

- `iteration_id`：一次交付批次，例如 `shop001`。
- `feature_id`：跨迭代稳定的业务能力，例如 `quick-publish.field-recognition`。
- `requirement_id`：当前迭代的变化项，例如 `shop001-R01`。
- `flow_id`、`node_id`、`surface_id`、`content_id`：仍由场景 `interaction_spec` 维护。

不得把迭代编号当成功能、场景或 route 的长期标识。

## 4. iteration.json 最小结构

既有 `schemaVersion: 1` 迭代继续使用原有“先完整规格、后实现”的状态机，不迁移。后续 `init` 默认创建 `schemaVersion: 2`，以原型先行；两种版本都保留同一目录、冻结和追溯边界。

v2 在正式字段之外增加：

```json
{
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
    "surface_decisions": [{
      "surface_id": "",
      "presentation": "",
      "rule_sources_used": []
    }]
  },
  "brief_confirmation": null,
  "prototype_confirmation": null
}
```

- `prototype_brief` 是范围确认的唯一前置物：必须明确目标、包含/排除范围、入口、关键路径和边界；不得承载完整 flow、字段或交接文档。
- `prototype_design` 由 `wego-design` 写入：每个原型 surface 至少有 presentation 和真实规则来源；可补页面范式与组件组合，但不能发明业务内容。
- `brief_confirmation` 记录用户对简报的范围授权；`prototype_confirmation` 保存用户定稿时间、确认人、简报/设计指纹和全部原型运行时文件指纹。

```json
{
  "schemaVersion": 1,
  "identity": {
    "iteration_id": "shop001",
    "title": "快捷发布",
    "date": "2026-07-11",
    "primary_scene": "快捷发布产品",
    "related_scenes": ["动态"]
  },
  "status": "draft",
  "scope_revision": 1,
  "base_fingerprint": {},
  "product_scope": {
    "problem": "",
    "goal": "",
    "actors": [],
    "success_criteria": [],
    "included": [],
    "excluded": [],
    "assumptions": [],
    "open_questions": [],
    "dependencies": []
  },
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

### features

每项至少包含 `feature_id`、`title`、`current_behavior`、`scene_refs[]` 和 `status`。`status` 为 `active | removed`。

### requirements

每项至少包含：

- `requirement_id`、`feature_id`、`title`
- `change_type`：`added | changed | removed | verification-only`
- `user_outcome`
- `scene_refs[]`、`surface_refs[]`
- `prototype_depth`：`functional | simulated | stub | excluded`
- `acceptance_criteria[]`

### traceability

每个非 `excluded` 需求在其每个 `scene_refs` 场景中都必须有一条记录；`requirement_id + scene` 联合唯一。每条至少包含：

- `requirement_id`
- `scene`
- `flow_refs[]`、`node_refs[]`、`surface_refs[]`、`exit_result_refs[]`

下游在同一条记录补充 `design_refs[]`、`implementation_refs[]` 和 `acceptance_refs[]`，不得修改产品引用。

### affected_scenes

每项包含 `scene`、`role`（`primary | related`）和 `change_type`（`added | changed | removed | verification-only`）。

### affected_runtime

登记场景目录外的 App 文件，例如 `wego-app/js/routes.js`、宿主入口和公共样式。未登记的公共文件不得由本轮业务实现修改。

`features[].scene_refs`、`requirements[].scene_refs` 和 `traceability[].scene` 必须引用 `affected_scenes`；`requirement_id` 必须以前缀 `{iteration_id}-R` 开头。`identity.related_scenes` 必须完整等于 `affected_scenes` 中的 related 场景，不能只登记其中一部分。

### 阶段指纹

每个有效 `stage_outputs` 同时保存该阶段拥有的结构化字段指纹和文件指纹：产品覆盖范围与产品追踪字段，设计覆盖 `design_refs` 与设计计划，实现覆盖 `implementation_refs` 与实现文件，验收覆盖 `acceptance_refs`、报告和交接前当前文件。阶段进入下游后，指纹不一致必须先执行 `invalidate`，不得静默继续。

## 5. 状态机

正常状态：

```text
draft
→ awaiting-scope-confirmation
→ product-confirmed
→ design-ready
→ implemented
→ testing
→ accepted / accepted-with-risk
→ frozen
```

终止或暂停状态：`blocked | cancelled | superseded`。

状态只能通过 `scripts/iteration-record.mjs` 推进。脚本同时检查前置产物并使不再有效的下游结果失效。

v2 状态机：

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

1. `draft` 只编辑 `prototype_brief`、受影响场景和宿主范围；运行 `submit-brief` 后进入 `awaiting-brief-confirmation`，用户确认后执行 `confirm-brief` 进入 `prototyping`。
2. `prototyping` 中 `wego-design → wego-ux` 连续完成 `prototype_design` 与真实交互原型；不创建或改写正式规格、验收或交接。
3. `submit-prototype` 进入 `awaiting-prototype-confirmation`；用户定稿后执行 `confirm-prototype`，锁定原型快照并进入 `prototype-confirmed`。
4. `formalize-product` 只在快照未漂移时补齐正式产品字段、`interaction_spec` 和范围确认记录，随后进入 `product-confirmed`。这一步不要求第二次用户范围确认。
5. 后续 `mark-design → check-prototype-snapshot → mark-implemented → start-testing → handoff → freeze` 沿用正式交付守门；任何运行时原型变化必须 `invalidate --stage=prototype` 并重新定稿。

- `scope` 只允许从 `draft | awaiting-scope-confirmation` 执行；已确认范围变化必须先 `invalidate --stage=product`。
- `block --reason=...` 保存阻塞前状态，`resume` 只在阶段产物和指纹仍有效时恢复。
- `invalidate` 只能失效已经到达的阶段，不能从早期状态把流程向前推进；冻结、取消和已替代迭代不能恢复。

## 6. 产品范围确认

### v2 原型简报确认

`wego-product` 必须先登记主/关联场景和受影响宿主文件，再以简短可读摘要让用户确认 `prototype_brief`。确认只授权按已登记范围做原型，不生成范围确认 Markdown，也不要求完整 requirement、flow、surface 或数据交接。

原型完成后用户可多轮反馈；只有明确“定稿”才调用 `confirm-prototype`。确认快照和简报/设计约束任一漂移时，正式化停止并回到 `prototyping`。

### 正式范围确认

`wego-product` 必须：

1. 创建迭代和主场景目录。
2. 对比当前规格和实现，识别共享场景基线；正式实现基线由设计完成时的 `mark-design` 统一记录。
3. 区分长期 `feature_id` 与本轮 `requirement_id`。
4. 明确主场景、关联场景、宿主文件、包含和排除范围。
5. 更新所有相关 `interaction_spec` 的 `iteration_context`：

```json
{
  "iteration_context": {
    "iteration_id": "shop001",
    "scope_revision": 1,
    "requirement_ids": ["shop001-R01"]
  }
}
```

6. 保证需求能追踪到 flow、node、surface 和退出结果。
7. 生成 `{iteration_id}-{title}-范围确认.md`。
8. 获得用户明确确认后执行 `confirm-scope`。

确认时所有相关 `interaction_spec.readiness` 必须为 `ready` 或 `ready-with-assumptions`。v2 在原型定稿后由 `formalize-product` 生成范围确认记录；v1 继续在设计前由 `confirm-scope` 生成。第一版不把 `partially-ready` 迭代整体交给设计；未确认内容应明确延期或排除。

## 7. 各阶段所有权

### wego-design

- v2 原型期在 `prototyping` 后消费 `prototype_brief`，写入 `prototype_design` 并立即交给 `wego-ux`；完整 `design_plan` 只在 `product-confirmed` 后工作。
- `design_plan.iteration_context` 必须与产品范围一致。
- 只能补充设计引用，不能新增功能、页面职责、流程、结果或数据含义。
- 所有 surface 有覆盖且无 gap 后才能执行 `mark-design`，由状态机保存设计指纹和进入实现前的 `base_fingerprint`。

### wego-ux

- v2 原型期只在 `prototyping` 且 `prototype_design` 完整后修改运行时；原型定稿后只在 `design-ready` 补实现追踪并核验快照。v1 只在 `design-ready` 后工作。
- 只能修改 `affected_scenes` 和 `affected_runtime` 登记范围。
- 发现新业务、新场景或产品结果变化时回到 `wego-product`；发现设计变化时回到 `wego-design`。
- 实现完成后补充实现引用并执行 `mark-implemented`。

### wego-tests

- 只在 `implemented` 后输出正式验收；v2 还必须验证确认原型快照未漂移。原型期的浏览器检查只服务用户定稿，不生成正式报告。
- 前置检查通过后运行 `start-testing`，后续验收和交接只在 `testing` 状态执行。
- `acceptance_report.iteration_context` 必须一致。
- `requirement_coverage[]` 每项必须含 `requirement_id`，覆盖全部非 excluded 需求。
- `fail` 不得生成开发交接；`pass-with-risk` 只允许不影响已确认结果的验证边界。
- 通过后生成开发交接、复制最终规格快照并冻结迭代。

## 8. 修改与失效

v2：

- 简报的目标、包含/排除范围、入口或关键路径变化：`invalidate --stage=brief`，范围版本递增并重新确认简报。
- 定稿原型的运行时、交互或设计约束变化：`invalidate --stage=prototype`，回到 `prototyping` 并重新定稿。
- 只修正式产品文档的表述或追踪：`invalidate --stage=product`，回到 `prototype-confirmed`，不重复要求用户定稿。
- 设计、实现和验收阶段的失效继续分别回退到 `product-confirmed`、`design-ready` 和 `implemented`；若任何改动触及确认原型运行时，优先按 prototype 失效。

- 产品目标、功能、页面职责、流程、结果或数据变化：回到 `wego-product`，`scope_revision + 1`，重新确认，设计/实现/验收失效。
- 产品不变但布局、组件或打开方式变化：回到 `wego-design`，实现/验收失效。
- 规格和设计不变，仅修实现：回到 `wego-ux`，验收失效。
- 仅修验收方法或报告：回到 `wego-tests`，开发交接失效。
- 冻结后不得修改；任何会影响业务理解的变化建立新迭代。

所有修改写入 `change_log`，包含时间、原因、归属、受影响需求和失效阶段。

`invalidate` 应在修改对应阶段产物之前执行。实现阶段失效时以当时当前文件刷新实现基线并要求重新执行 `check-base`；产品或设计失效时清空旧实现基线，由重新完成设计时生成。

## 9. 场景基线与并行边界

影响范围不重叠的多个迭代可以同时处于产品或设计阶段。由于主 App 与各场景 `_spec/` 只保存一份当前最新状态，同一场景或同一 `affected_runtime` 文件不得被多个活跃迭代同时认领；后续迭代必须等待前一迭代冻结、取消或被替代。状态机在 `init`、`scope` 和 `confirm-scope` 阶段拦截重叠范围。

进入实现前必须比较 `base_fingerprint`：

- 基线未变化：继续。
- 只有实现基础变化且规格仍成立：刷新基线后继续。
- 产品结果变化：重新进入范围确认。
- 设计结构变化：重新进入设计。

不得在已变化的共享场景旧基线上直接覆盖。

`check-base` 的成功结果必须由状态机写回设计阶段记录；`mark-implemented` 不接受只由人工声称已经检查的基线。

## 10. 特殊场景

- Sheet、Modal、Dialog 和 inline 使用 `surface_id` 追踪，不强制创建 route。
- 删除功能或页面使用 `change_type=removed`，验收旧入口、route 和实现已清理。
- 场景合并必须记录来源、目标、入口迁移和旧内容清理。
- 设计系统缺口转入 `wego-uxsystem-iterate`，业务迭代保持 blocked 或 design gap。
- 开发交接必须区分原型验收、本地模拟、真实接口、推送和部署状态。

## 11. 开发交接与冻结

`wego-tests` 生成 `{iteration_id}-{title}-开发交接.md`，内容包括本轮变化、相关功能当前状态、页面、流程、数据、原型边界、设计约束、验收和风险。

冻结时：

1. 复制所有相关场景最终 `interaction_spec`、`design_plan`、`acceptance_report`。
2. 记录当前规格、实现文件和生成文档的 SHA-256。
3. 真实存在时记录 Git commit；不得编造。
4. 写入 `freeze.json` 并把状态改为 `frozen`。
5. 后续检查发现冻结文件变化时失败。

冻结时必须记录迭代目录全部归档文件和当时当前场景/宿主文件的完整文件集合及 SHA-256。冻结后，迭代目录快照的新增、删除或修改一律失败；当前场景允许由后续有效迭代继续修改，但每个变化必须被新迭代认领，不能靠旧冻结迭代放行。只有当前交付文件确实与某个 Git HEAD 一致时才记录 `git_commit`，否则保存 `null`。

## 12. 历史兼容

- 历史场景不要求补录过去的迭代。
- 新建迭代默认 schema v2；既有 schema v1、已接受和已冻结迭代不迁移，继续按其原状态机验证。
- 验证器按阶段检查：产品阶段不要求设计和运行时文件；设计阶段要求无 gap；实现阶段要求 scene/route；验收和冻结阶段要求报告与交接。
