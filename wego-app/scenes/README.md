# scenes

业务场景统一放在这里，目录使用中文业务语义命名。

推荐结构：

```text
权限管理/
├── _spec/
│   ├── page_spec.json
│   └── design_consumption_plan.json
├── scene.css
└── scene.js
```

运行时以 `scene.js` 为准，通过 `window.WegoApp.registerScene()` 注册 route、template、presentation 和交互。
