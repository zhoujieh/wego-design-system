# 组件与 UI Kit 迭代

> 只在修改组件、Preview、Token、UI Kit 或消费契约时读取；普通业务场景走 `wego-product → wego-design`。

## 权威来源

- 组件结构、变体、状态和 Token 声明：`components/{slug}.json`
- 组件实际 DOM、class、样式和交互示例：`preview/component-{slug}.html`
- 组件注册：`components/index.json`
- 聚合组件样式：生成的 `components.css`
- Token：`colors_and_type.css`；`css.json` 是结构索引
- 页面范式与 UI Kit：`uikit-plan.json`、`ui_kits/*`

`wego-app/lib/` 和 `components.css` 均不直接编辑。

## 组件维护

1. 只读取目标组件的契约、Preview、索引项及明确受影响的 UI Kit 和场景。
2. DOM、变体、状态、Token 或行为变化时同步契约与 Preview；消费提示变化不机械改写实现。
3. CSS 全局变量登记到 `runtimeTokens`，内部参数登记到 `localTokens`，纯展示变量登记到 `previewOnlyTokens`。
4. 新增或修改的变体必须有可执行 Preview；结构、class、状态和生成 CSS 保持一致。
5. 重新生成 `components.css`，同步部署副本并回归受影响场景。

## UI Kit 维护

- UI Kit 只展示明确页面范式的组合方式，不是 App 宿主、业务模板或组件来源。
- 范式候选只维护设计阶段的读取提示，具体消费语义以设计方法为准。
- 范式必须声明适用和排除条件；设计阶段只有精确命中时才读对应 UI Kit，未命中使用 `composed`。
- UI Kit 不复制业务文案、不引入私有组件、不作为场景正确性的自证；正确性由正式组件一致性和实际页面验证。

## 验证

```bash
node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design
node scripts/validate-component-contract-parity.mjs
node scripts/sync-wego-app-lib.mjs
node scripts/validate-wego-design.mjs --scope=system --strict
```

正式设计系统源变化必须递增 `metadata.json.version`。守卫验证实际结构、资源和运行结果，不检查文档固定措辞。
