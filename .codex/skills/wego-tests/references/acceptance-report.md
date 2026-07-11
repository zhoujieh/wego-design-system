# Acceptance Report 结构

构造、迁移或校验 `acceptance_report` 时读取。

```json
{
  "iteration_context": {
    "iteration_id": "shop001",
    "scope_revision": 1,
    "requirement_ids": ["shop001-R01"]
  },
  "requirement_coverage": [],
  "scene_judgement_check": {},
  "surface_design_check": {},
  "uikit_consumption_check": {},
  "component_discipline_check": {},
  "rule_source_check": {},
  "copy_check": {},
  "route_check": {},
  "interaction_check": {},
  "layout_check": {},
  "viewport_keyboard_check": {},
  "app_scene_check": {},
  "resource_sync_check": {},
  "flow_coverage": {},
  "transition_check": {},
  "state_handoff_check": {},
  "back_restore_check": {},
  "prototype_boundary_check": {},
  "end_to_end_paths": [],
  "design_contraction_check": {},
  "compatibility_check": {},
  "deployment_readiness_check": {},
  "automated_checks": {},
  "findings": [],
  "risk_log": [],
  "manual_verify_items": [],
  "final_status": "pass | pass-with-risk | fail"
}
```

业务迭代的 `requirement_coverage[]` 每项必须包含 `requirement_id` 和真实 `status`，覆盖本场景全部非 excluded 需求；自然语言描述不能代替稳定编号。

## automated_checks

记录 `commands`、`exit_codes`、`errors`、`warnings_count` 和 `key_findings`。退出非 0 或 errors 非空时不得 pass。

## deployment_readiness_check

记录 `push_attempted`、`push_commit_hash`、`deploy_status`、`production_domain`、`fallback_local_entry` 和 `errors`。

`success` 必须有已核实 Ready 的 Production 部署；`pending` 表示已推送但未核实；`degraded-local` 记录失败并保留本地入口；`not-run` 记录原因。

## findings

每条 finding 至少说明严重度、现象、复现证据、影响、最早归属、修复条件和复验结果。不能用风险日志隐藏硬门禁错误。
