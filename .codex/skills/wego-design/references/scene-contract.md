# 场景合同

> 角色：场景产物、决策标注和完成门禁的唯一说明。创建或修改业务场景时，在设计原则和命中组件之后读取。

## 唯一场景产物

```text
wego-app/js/routes.js
wego-app/scenes/{中文业务场景}/scene.js
wego-app/scenes/{中文业务场景}/scene.css
wego-app/scenes/{中文业务场景}/design-decisions.json
```

禁止创建独立场景 HTML、第二个宿主、`style.css`、以 route_id 命名的场景目录或运行时 `fetch/XHR`。

## scene.js

<!-- rule-id: scene-registration-contract -->

- 通过 `window.WegoApp.registerScene` 注册 `routeId`、template、presentation 和 `init`。
- `routes.js` 必须且只能对 `window.WEGO_APP_ROUTES` 静态赋值一次；数组直接包含静态路由对象，`routeId` 全局唯一。入口的 `entry.type` 只能是 `host-tab`、`grid-entry`、`cell-entry`，必须声明所属 `entry.tab`；`host-tab` 的 tab 全局唯一。
- template 根节点必须且只能有一处同时声明 `data-surface-id`、`data-route-id`、`data-layout-mode`、`data-page-edge-mode`；边距标注必须等于 `layout_contract.page_edge_mode`。`pattern` 模式额外声明 `data-page-pattern`；`composed` 模式不得声明页面范式。
- 每个正式组件实例必须声明唯一 `data-dd-id`、`data-component-slug` 和 `data-component-binding`；binding 必须对应 `prompt_contract.component_bindings[].binding_id`。
- 所有交互触发器使用唯一 `data-dom-id`，并进入 `interaction_contract`。

<!-- rule-id: routes-subpage-no-entry -->

- 只有宿主入口声明 `entry`；下钻页由 `presentation.type` 决定打开方式，不声明 `entry`，宿主也不得把无 `entry` 的路由自动挂到入口列表。

<!-- rule-id: cross-route-data-handoff-appstate -->

- 状态只写当前场景 `ctx.state`、明确共享的 `ctx.appState` 或需求明确要求的持久化位置，不直接写其他场景状态。

<!-- rule-id: overlay-host-runtime-integration -->

- 浮层通过对应 `ctx` API 交给宿主 overlay 层打开；场景不重复实现遮罩、固定定位或安全区。

## 当前 `wego-design-contract`

以下模板是唯一当前格式；生成时必须把版本占位替换成 `metadata.json.version` 的整数值。`prompt_contract` 只记录不能从组件索引、契约和源码推导的设计判断。

```jsonc
{
  "surface_id": "settings-edit",
  "route_id": "settings-edit",
  "layout_mode": "pattern",
  "page_pattern": "biz-rule-config",
  "presentation": {
    "type": "full-screen-modal",
    "transition": "slide-up-enter, slide-down-exit",
    "dismissAction": "page-level-save",
    "overlayLevel": "overlay",
    "coversTabBar": true,
    "source": "uikit-plan.json#/pagePatterns/biz-rule-config/presentation"
  },
  "prompt_contract": {
    "design_system_version": "<场景创建时基于的 metadata.version 快照>",
    "token_bindings": [
      {
        "selector": ".settings-edit__title",
        "content_role": "页面标题",
        "css_property": "color",
        "token": "var(--text-default)"
      },
      {
        "selector": ".settings-edit",
        "content_role": "页面边距",
        "css_property": "padding-inline",
        "token": "var(--layout-page-margin-m0)"
      }
    ],
    "component_bindings": [
      {
        "binding_id": "primary-action",
        "slug": "button",
        "reason": "承载唯一保存操作",
        "variant_dimensions": {
          "emphasis": "strong",
          "size": "md",
          "iconMode": "text-only",
          "state": "default"
        }
      }
    ],
    "layout_contract": {
      "mode": "pattern",
      "source": "uikit-plan.json#/pagePatterns/biz-rule-config",
      "selection_reason": "页面以统一保存为主，并采用通栏内容边距",
      "page_edge_mode": "M0",
      "mutable_regions": [".settings-edit__content"]
    },
    "interaction_contract": [
      { "dom_id": "save-settings", "target": "feedback:toast" }
    ],
    "state_contract": [
      {
        "state_id": "initial",
        "initial": true,
        "trigger": "场景进入",
        "visible_result": "展示当前设置值和保存操作",
        "fallback": "保留当前有效值",
        "persistence": "memory"
      }
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "ISO 时间",
    "checks": {
      "horizontal_overflow": true,
      "overlap": true,
      "clipping": true,
      "action_legibility": true,
      "primary_focus": true,
      "state_feedback": true
    }
  }
}
```

约束：

<!-- rule-id: scene-version-snapshot-not-pinned -->

- `design_system_version` 是场景创建时基于的 `metadata.json.version` 快照（正整数），不要求随设计系统升级而连锁更新；场景适配由 `components.css` 提取校验、组件契约一致性、`source_sha256` 和 `visual_check` 守护。
- 同一组件可有多个 binding，但 `binding_id` 唯一且每项必须被实际 DOM 使用。
- `variant_dimensions` 使用组件契约的实际维度和值，不写 Preview、契约路径、根 class 或必需子节点。守卫检查所有值是否合法；契约已声明 `domAnatomy.variantRules` 的维度还会核对实际 DOM。未映射维度仍必须按 Preview 对照，不得宣称已自动验证。
<!-- rule-id: design-decisions-css-token-binding-precision -->

- `token_bindings` 只记录场景自己声明的视觉语义，包括排版、颜色、页面边距等。组件内部样式由正式组件负责；允许 Token 由当前组件 `runtimeTokens` 与场景基础策略自动计算。
- `layout_contract.source`：pattern 指向命中范式；composed 指向 `references/design-decisions.md`。边距理由并入 `selection_reason`。
- 非空 `state_contract` 必须且只能有一个初始状态。仅实现简报和真实操作需要的状态；刷新后保留必须有明确需求。
- `interaction_contract.target` 只使用实际存在的 `route:*`、`state:*`、`overlay:modal|sheet|full-screen-modal|close`、`feedback:toast|dialog` 或 `navigation:back`。

<!-- rule-id: interaction-dom-id-placeholder -->

- `interaction_contract.dom_id` 必须与 template DOM 中的 `data-dom-id` 一一对应。
- 动态列表项的 dom_id 在运行时由列表渲染函数拼接（如 `data-dom-id="more-${post_id}"`），无法在静态 template DOM 中预先声明。此类交互在 `interaction_contract` 中使用占位符语法 `more-{post_id}`：`{}` 内为占位符变量名，与 scene.js 模板拼接中的 `${...}` 对应。守卫会把占位符模式转成正则匹配 scene.js 源码，确认对应模板拼接确实存在；handler 校验放宽至允许通过 `querySelectorAll('[data-dom-id^="prefix-"]')` 等模式批量绑定 listener。
- 占位符 dom_id 在提取器 `extract-design-decisions.mjs` 中会归一化为 `prefix-{placeholder}suffix` 写入 `generation_evidence.dom_ids`，与 `interaction_contract` 中的占位符声明对照。

<!-- rule-id: overlay-component-consumption-binding -->

- 通过 `ctx.openSheet`、`ctx.openModal`、`ctx.openFullScreenModal` 消费 overlay 类组件（actionsheet、dialog、modal 等）前，必须先把组件作为 `component_bindings` 登记并补 `interaction_contract`（`overlay:sheet|modal|full-screen-modal`）。守卫会逆向扫描 scene.js 中的 `ctx.openSheet` 等调用，未登记即 fail。
- overlay 类组件的默认关闭行为（如 actionsheet 的 `closeByMask`、`closeByCancel` 默认 true）必须在场景 init 中实际实现：mask click 与 cancel click 必须调用 `ctx.closeOverlay()` 或对应关闭 API；不能只给 `.actionsheet__item` 绑 click 而漏掉 cancel 与 mask。
- 场景提供给 overlay API 的 HTML 必须遵守组件契约 `structurePatterns`：例如 actionsheet 在 wego-app overlay 架构下只渲染 `.actionsheet__panel` 及其子内容，不再渲染 `.actionsheet` 根节点，避免双重遮罩与动画错位。

## scene.css

<!-- rule-id: business-state-class-scoped-prefix -->

- 业务状态必须由场景自有选择器限定，例如 `.feed-item__forward-btn.is-forwarded`；不得单独使用通用状态类，也不得把业务状态发明成正式组件 modifier。
- 只写场景根作用域下的布局、区域关系和业务胶水。
- 场景根用 `padding-inline` 和对应的 `var(--layout-page-margin-m0)`、`var(--layout-page-margin-m8)` 或 `var(--layout-page-margin-m32)` 实际落实 `M0/M8/M32`；合同、根标注和 Token 必须一致。

<!-- rule-id: spacing-must-use-spacer-token -->

- 禁止硬编码颜色、间距、圆角和组件内部视觉值；页面边距使用上述三个 `--layout-page-margin-*` Token，其余场景间距使用 `var(--spacer-*)`。
- 页面滚动容器使用实际可滚动行为；`overflow:hidden` 只用于明确的组件裁切边界，不得用来禁用页面滚动。
- 固定操作栏由正式组件处理安全区；无固定栏的滚动内容按宿主规则预留底部安全区。

<!-- rule-id: safe-area-top-single-owner -->

- 顶部安全区由页面首个固定元素承担且只承担一次：有 navbar 的场景由 navbar 组件内置 `padding-top: var(--safe-area-top)` 处理，`host-shell-page` 和场景容器不得再重复加安全区；无 navbar 的场景由场景根容器或滚动区通过 `var(--safe-area-top)` 自行承担。
- 禁止用 JS 读取 `--safe-area-top` 再设置 padding；安全区必须通过 CSS 变量声明。

## 提取与完成门禁

每次 scene.js 或 scene.css 变化后必须按以下顺序执行：

```bash
node scripts/extract-design-decisions.mjs wego-app/scenes/{中文业务场景}
node scripts/validate-scene-contract.mjs wego-app/scenes/{中文业务场景}
```

`design-decisions.json` 由提取器生成，包含场景身份、布局、presentation、精简 `prompt_contract`、实际组件绑定和源码哈希；禁止手写。视觉检查必须覆盖 375px、393px 和六项固定检查，任一失败都不得标记完成。

组件、变体或 presentation 确实无法覆盖时，向 `wego-uxsystem-iterate` 交接缺失能力、受影响 surface、是否阻断和可用正式回退；实现错误必须直接修复。
