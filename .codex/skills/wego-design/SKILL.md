---
name: "wego-design"
description: 消费微购设计系统并输出 design_plan。用于已有 interaction_spec 时选择页面范式、UI Kit、组件映射、布局和打开方式；不负责原始需求理解或最终原型实现。
---

# Wego Design

本文件是 `wego-design` 技能的唯一运行时权威入口。只负责把已确认并落盘的 `interaction_spec` 转换为可追溯、可执行、可验收的 `design_plan`。

## 何时触发

- 已有完整 `interaction_spec`，需要选择页面范式、UI Kit、fallback blueprint、布局、组件组合或打开方式。
- 已有场景发生组件映射、页面结构或展示方式偏差，需要重新生成设计计划。
- 用户明确要求基于现有需求规格做设计系统消费。

不要误用：

- 没有已确认并落盘的 `interaction_spec`：回到 `wego-product`。
- 需要直接生成或更新 `wego-app` 场景：转入 `wego-ux`。
- 需要修改组件契约、Preview、Token、UI Kit、消费边界或工作流：转入 `wego-uxsystem-iterate`。

## 输入前提

开始前必须确认：

- `wego-app/scenes/{中文业务场景}/_spec/interaction_spec.json` 存在且结构完整。
- `interaction_spec.open_questions` 中不存在会改变页面范围、核心流程或宿主路径的未决问题。
- `task_type = design-system-consumption`。其他类型按 `wego-product` 的交接规则转走。
- `interaction_spec.app_target`、`host_container`、`route_id` 和 `page_surfaces` 能互相对应。

任何前提不满足时停止设计消费，回到 `wego-product` 修正；不得在本技能中重新理解或补造需求。

## 权威来源与读取顺序

按以下顺序读取：

1. 本文件：确认职责、门禁、输出结构和禁止事项。
2. 已落盘的 `interaction_spec.json`：唯一业务需求输入。
3. `library-consumption.json`：全局消费边界、资源与场景类型。
4. `uikit-plan.json`：pagePattern、UI Kit、fallback blueprint、组合约束和 presentation。
5. `colors_and_type.css` 与 `css.json`：Token 和可用数值。
6. `components/index.json`：可用组件注册表。
7. 命中的 `components/{slug}.json`：组件结构、状态、变体和行为契约。
8. 命中的 `preview/component-{slug}.html`：真实 DOM 与稳定示例。

`.codex/skills/wego-design/specs/*.md` 只用于人工检查，不得在运行时读取、引用或作为设计依据。`library-consumption.json` 中任何仍指向 `specs/*.md` 的历史读取项均视为非运行时兼容信息，不得进入 `rule_sources_used`。

## 核心规则

- 设计判断只能来自已确认的 `interaction_spec`、正式页面范式、Token、组件契约、Preview 和消费边界，自动生成文档不得参与决策。
- 每个页面结构、布局、组件组合和打开方式都必须记录到 `rule_sources_used`，并能定位到真实文件和字段。
- 不得重新发明需求、字段、状态或流程；发现需求缺口必须回到 `wego-product`。
- 无法由现有 pagePattern、fallback blueprint 和组件契约安全覆盖时，必须标记 `gap`，不得把判断交给 `wego-ux`。
- `design_plan` 必须落盘后才能交给 `wego-ux`，且不得输出 `spec_refs_used`。

## 设计决策流程

1. 校验 `interaction_spec` 输入和所有 surface。
2. 按 surface 逐一判断 `exact | near | fallback | gap`。
3. 先决定 pagePattern 或 fallback blueprint，再决定组件组合，禁止反向用组件拼出页面范式。
4. 明确页面布局模式、内容宽度、信息层级和页面打开方式。
5. 对每个信息块建立组件映射，确定 `consumption_mode`。
6. 明确只允许的页面级业务样式和实现约束。
7. 记录每个关键决策的真实规则来源。
8. 做完整性与冲突检查，输出并落盘设计计划。

## surface 命中规则

`surface_designs` 必须覆盖 `interaction_spec.page_surfaces[]` 的每个 `id`：

- `exact`：明确命中 `uikit-plan.json.pagePatterns[]`；填写 `matched_uikit`、`matched_page_pattern` 和依据。
- `near`：接近既有 pagePattern，但存在小差异；说明差异、可复用部分和受限范围，仍以命中范式的约束为主。
- `fallback`：无合适 pagePattern，但可由 `fallbackPageBlueprints[]` 安全承接；填写 `matched_blueprint`。
- `gap`：现有范式、blueprint、组件和 Token 无法安全覆盖；填写 `design_gap` 并阻止下游实现。

规则：

- `host-entry` 只承接宿主入口、摘要和结果回填，不得误当成主业务页面范式。
- 每个 surface 的信息块必须来自对应 `interaction_spec.page_surfaces[].information_blocks`。
- 命中带 `presentation` 的 pagePattern 时，必须记录 `presentation_ref`，`wego-ux` 不再重新判断。
- `allowed_page_styles` 只允许页面级布局胶水、业务作用域和 Token 消费；不能授权新组件类、未定义修饰类或 Showcase 外壳类。

## 页面布局规则

`layout_pattern` 必须显式写明页面模式，不使用模糊或条件性记法：

- `通栏模式 M1`：页面内容层横向 padding 为 0；分组内容使用通栏结构，不开启卡片修饰类。
- `卡片模式 M2`：页面内容层横向 padding 为 16px；分组内容使用已注册卡片修饰类。

约束：

- 命中 `biz-rule-config` 的业务 surface 默认使用通栏 M1；`host-entry` 默认使用卡片 M2，除非权威来源明确给出例外。
- 移动端和桌面端的业务内容边距语义必须一致，不能因为手机壳边框消失而改变 scene 内容对齐。
- 页面主结构默认占满可用宽度；空内容、短文本或字段未填写不得让主区域收缩。
- 间距、尺寸、圆角、字号和颜色必须引用已注册 Token，不得在计划中发明新值。
- `allowed_page_styles` 必须与 `layout_pattern` 一致，不能同时授权 M1 与 M2。

## 组件映射

`component_mapping` 必须是对象数组，每条至少包含：

- `block`：对应 `interaction_spec.information_blocks` 的标识。
- `scenario_type`：来自 `library-consumption.json.scenarioTypeRegistry.types[].id`。
- `consumption_mode`：`stable-variant | composition-constraint | free-composition`。
- `selected`：稳定变体组合或完整 DOM 路径。
- `constraint_ref`：命中组合约束时的 pagePattern、规则位置和触发条件。
- `reason`：结合业务信息说明为什么命中。
- `rule_sources`：该映射实际读取的契约、字段和 Preview。

### consumption_mode

- `stable-variant`：命中组件契约 `representativeVariants` 或稳定 `behavior` 场景。`selected` 使用维度值组合，不写自然语言或完整 DOM。
- `composition-constraint`：命中 `uikit-plan.json` 的 `compositionConstraints`。`selected` 写完整 DOM 路径，包含分组容器、修饰类、控件状态和资产路径。
- `free-composition`：未命中稳定变体和组合约束，但可在组件契约 `domAnatomy` 范围内安全组合。`selected` 仍写完整 DOM 路径。

禁止：

- 使用“返回图标在左边”等语义描述代替正式变体或 DOM。
- 使用“与某结构同构”省略结构。
- 同一计划中遗漏 `consumption_mode` 或混用写法。
- 先选择宿主组件，再把尺寸、间距、层级和内嵌控件规格留给 `wego-ux` 二次决定。
- 连续 cell/form 不声明已注册分组容器。
- 把额外 helper 文案当成默认兜底；只有业务必须且结构无法承载时才保留。

连续行式组件必须在 `selected` 中包含 `.cell-group`、`.form-group` 等正式容器，并在 `implementation_constraints` 中声明不可替换为场景自定义 group 类。

## 对象管理列表

当主 surface 管理一组可新增、编辑、删除、启停或进入详情的业务对象，且 `interaction_spec` 已完成字段分级时：

- `scenario_type = object-management-list-composition`。
- 无精确 pagePattern 时优先使用 `fallbackPageBlueprints[object-management-list-page]`。
- 列表只承接对象识别、关键状态、1–2 条摘要和必要操作。
- 详情字段进入详情、编辑、sheet 或表单 surface。
- 默认优先横向主结构；若使用纵向结构，必须记录业务和内容依据。
- 明确识别图使用真实业务图片、缩略图还是低饱和占位。
- 明确操作外露或收纳的数量与危险等级依据。
- 新增入口默认使用已注册的图标+文字结构；降级纯文字必须说明依据。

## 页面打开方式

`page_presentation` 必须来自命中的 pagePattern 或明确的 fallback 规则：

- `push`：App 内层级跳转，使用 `back-icon`。
- `modal`：当前场景上的轻量对话层。
- `sheet`：从底部进入的选择或操作层。
- `full-screen-modal`：覆盖手机屏的复杂编辑或配置流程。

至少包含：

- `type`
- `transition`
- `dismiss_action`
- `overlay_level`
- `covers_tab_bar`
- `source`

`interaction_spec.host_container.leaf_level >= 3` 时，若使用 push，必须在说明中声明栈式导航需求。场景级页面默认 `covers_tab_bar = true`；只有明确属于宿主内嵌 `host-entry` 时可为 `false`。

navbar 稳定变体绑定：

- `push` → `leftControl=back-icon`
- `full-screen-modal` 模式 A → `leftControl=text-cancel`，文案固定“取消”
- `full-screen-modal` 模式 B → `leftControl=close-icon`

## App 目标绑定

`design_plan.app_target` 必须从 `interaction_spec.app_target`、`route_id` 和 `host_container` 映射：

- `mode = wego-app-scene`
- `app_root = wego-app`
- `scene_folder` 与 `interaction_spec` 完全一致
- `route_id` 与 `interaction_spec.route_id` 完全一致
- `route_mode = hash`
- `runtime_entry = scene.js`

固定宿主 App 不是 UI Kit 或 pagePattern，不得把 `.uikit-shell`、`.phone-frame`、`.phone-screen` 当作业务结构。

## 输出要求

必须输出：

```json
{
  "matched_uikit": "biz-rule-config | system-settings | null",
  "scene_fit_reason": "总体匹配原因",
  "navigation_pattern": "导航类型",
  "layout_pattern": "通栏模式 M1 | 卡片模式 M2",
  "interaction_pattern": "交互范式",
  "app_target": {
    "mode": "wego-app-scene",
    "app_root": "wego-app",
    "scene_folder": "wego-app/scenes/权限管理",
    "route_id": "my-permission-management",
    "route_mode": "hash",
    "runtime_entry": "scene.js"
  },
  "surface_designs": [
    {
      "surface_id": "primary-task-page",
      "role": "host-entry | primary-task-page | secondary-task-page | result-summary",
      "match_status": "exact | near | fallback | gap",
      "matched_uikit": "biz-rule-config | system-settings | null",
      "matched_page_pattern": "string | null",
      "matched_blueprint": "string | null",
      "presentation_ref": "",
      "scene_fit_reason": "",
      "component_mapping": [],
      "allowed_page_styles": [],
      "design_gap": ""
    }
  ],
  "component_mapping": [
    {
      "block": "inventory-deduction-order",
      "scenario_type": "string",
      "consumption_mode": "stable-variant | composition-constraint | free-composition",
      "selected": "正式变体维度或完整 DOM 路径",
      "constraint_ref": {},
      "reason": "",
      "rule_sources": []
    }
  ],
  "rule_sources_used": [
    {
      "file": ".codex/skills/wego-design/uikit-plan.json",
      "field": "pagePatterns[...].compositionConstraints[...]",
      "supports": ["具体设计决策"]
    }
  ],
  "implementation_constraints": [],
  "page_presentation": {
    "type": "push | modal | sheet | full-screen-modal",
    "transition": "none | slide-left | fade | slide-up-enter, slide-down-exit",
    "dismiss_action": "back-button | cancel | close | overlay",
    "overlay_level": "inline | scene-overlay | screen-overlay",
    "covers_tab_bar": true,
    "source": "真实文件与字段"
  }
}
```

`rule_sources_used` 只记录实际参与本轮决策的来源，不为凑数量列出未读取文件；不得包含 `specs/*.md`。

## 落盘与归档

路径固定为：

`wego-app/scenes/{中文业务场景}/_spec/design_plan.json`

规则：

- 必须在 `interaction_spec.json` 已落盘后生成。
- 最新版本写入 `_spec/design_plan.json`。
- 覆盖前把上一版归档到 `_spec/archive/design_plan.{YYYYMMDD-HHmm}.json`。
- `surface_designs` 必须覆盖全部 surface，且不能存在 `gap` 才能交给 `wego-ux`。

落盘前自检：

- 所有业务信息均来自 `interaction_spec`，没有自行新增字段或流程。
- 每个 surface 有明确 match_status、布局、组件映射和 presentation。
- 每条组件映射写法与 `consumption_mode` 一致。
- 每个关键决定可追溯到真实权威文件与字段。
- 没有读取或引用生成文档，没有 `spec_refs_used`。
- 没有把未决问题、gap 或实现选择留给 `wego-ux`。

## 交接与禁止事项

通过自检后交给 `wego-ux`。以下情况不得交接：

- `interaction_spec` 缺失、未确认或与 App 目标不一致。
- 任一 surface 为 `gap`。
- 组件类、子元素类、修饰类或 Token 无正式来源。
- 打开方式、布局模式或组件组合无法追溯。

本技能禁止：

- 直接生成最终原型。
- 跳过 `interaction_spec` 重做需求理解。
- 复制 UI Kit Showcase 外壳或演示业务内容。
- 发明未注册组件、变体、Token、页面范式或打开方式。
- 用生成文档、个人审美或同类页面惯例覆盖正式规则来源。