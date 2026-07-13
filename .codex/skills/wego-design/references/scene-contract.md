# 场景合同

> 角色：场景产物、决策标注和完成门禁。读取条件：`wego-design` 创建或修改业务场景时。

## 1. 唯一场景产物

```text
wego-app/js/routes.js
wego-app/scenes/{中文业务场景}/scene.js
wego-app/scenes/{中文业务场景}/scene.css
wego-app/scenes/{中文业务场景}/design-decisions.json
```

禁止创建独立场景 HTML、第二个宿主、`style.css`、以 route_id 命名的场景目录或运行时 `fetch/XHR`。

## 2. scene.js

- 通过 `window.WegoApp.registerScene` 注册 `routeId`、template、presentation 和 `init`。
- template 根节点必须含 `data-surface-id`、`data-route-id`、`data-page-pattern`。
- 每个正式组件实例必须含稳定 `data-dd-id`、`data-component-slug`、`data-rule-source`；涉及 Token 的元素用 `data-token-binding` 标明属性与变量。
- 所有交互触发器必须有稳定 `data-dom-id`，并能从 `interaction_contract` 追溯到目标 route 或 overlay。
- 场景状态只写当前场景 `ctx.state` 或明确的共享 `ctx.appState` 键；不得直接写其他场景的 state。

## 3. scene.css

- 只写场景根作用域下的布局、区域关系和业务胶水。
- 禁止硬编码颜色和间距值、越权 Token、覆盖正式组件内部 Token/尺寸/安全区、发明组件 class 和使用未注册图标。所有间距（gap/padding/margin）必须使用 `var(--spacer-*)` Token，不得使用裸像素值；组件内部尺寸（如图标 font-size）遵循组件 Preview 模式，不在此约束范围内。
- 固定操作栏由正式组件处理安全区；无固定栏的滚动内容按宿主规则预留底部安全区。

## 4. design-decisions.json

由 `extract-design-decisions.mjs` 从场景目录生成，包含：

- 场景身份、页面范式、presentation、设计系统版本快照。
- 完整 `prompt_contract`、实际组件 class、Token 绑定、Preview/契约输入和规则引用。
- `state_contract`、交互合同、视觉检查、拥挤检查、守卫结果、修复次数和基线信息。
- 任何影响 DOM、class、Token、状态、路由或 data 标注的修改后必须重新生成。
- 生成结果含 `source_sha256`；即使只改动文案或注释，只要源码变化，旧决策文件也会被视为过期并要求重提取。

## 5. 完成门禁

依次运行：

```bash
node scripts/validate-scene-contract.mjs wego-app/scenes/{中文业务场景}
node scripts/extract-design-decisions.mjs wego-app/scenes/{中文业务场景}
```

随后在 375px 和 393px 固定视口检查交互和视觉，并在 scene.js 的 `wego-design-contract` 写入：`visual_check: { status: "passed", viewports: [375, 393], checked_at: "ISO 时间" }` 与 `crowding_check: { status: "passed", items: [六项检查结果] }`。错误必须修复后重跑；最多一次定向修复和一次重生成，仍不能通过时记录真实 DDR 或明确失败原因，不得假称完成。
