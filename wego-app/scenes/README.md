# scenes

业务场景统一放在这里，目录使用中文业务语义命名。

推荐结构：

```text
权限管理/
├── _spec/
│   ├── interaction_spec.json
│   ├── design_plan.json
│   ├── acceptance_report.json
│   └── archive/
├── _iterations/
│   └── 20260711-shop001-权限管理优化/
│       ├── iteration.json
│       ├── shop001-权限管理优化-范围确认.md
│       ├── shop001-权限管理优化-开发交接.md
│       ├── freeze.json
│       └── scenes/
├── scene.css
└── scene.js
```

运行时以 `scene.js` 为准，通过 `window.WegoApp.registerScene()` 注册 route、template、presentation 和交互。

新业务需求和已有场景变化先由 `wego-product` 在主业务场景创建迭代并确认范围。关联场景通过 `iteration.json.affected_scenes` 登记；设计、实现和验收只能消费同一 `iteration_id`、`scope_revision` 和 `requirement_ids`。正式结构与状态机见 `wego-product` 的业务迭代契约。
