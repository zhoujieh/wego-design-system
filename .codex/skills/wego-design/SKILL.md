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
- `interaction_spec.readiness` 不为 `blocked`；`partially-ready` 时只处理已确认节点。
- `task_type = design-system-consumption`。其他类型按 `wego-product` 的交接规则转走。
- 新任务必须存在 `flows`、`flow_nodes`、`surfaces`、`content_blocks`、`transitions`、`data_handoffs`、`prototype_boundaries`、`prototype_target`；旧场景可仅有 `app_target`、`host_container`、`route_id` 和 `page_surfaces`。
- `prototype_target.routes[]`（或旧 `route_id`）与 `host_container`、`surfaces[]`（或旧 `page_surfaces[]`）能互相对应。

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

`surface_designs` 必须覆盖 `interaction_spec.surfaces[]`（新字段）或 `interaction_spec.page_surfaces[]`（旧字段）的每个 ID：

- `exact`：明确命中 `uikit-plan.json.pagePatterns[]`；填写 `matched_uikit`、`matched_page_pattern` 和依据。
- `near`：接近既有 pagePattern，但存在小差异；说明差异、可复用部分和受限范围，仍以命中范式的约束为主。
- `fallback`：无合适 pagePattern，但可由 `fallbackPageBlueprints[]` 安全承接；填写 `matched_blueprint`。
- `gap`：现有范式、blueprint、组件和 Token 无法安全覆盖；填写 `design_gap` 并阻止下游实现。

规则：

- `host-entry` 只承接宿主入口、摘要和结果回填，不得误当成主业务页面范式。
- 每个 surface 的内容必须来自对应 `interaction_spec.surfaces[].content_refs`（或旧 `page_surfaces[].information_blocks`）。
- `interaction_spec.flow_nodes[].surface_ref` 必须能映射到 `surface_designs[]` 中某条；`functional` 节点必须被覆盖。
- 命中带 `presentation` 的 pagePattern 时，必须记录 `presentation_ref`，`wego-ux` 不再重新判断。
- `allowed_page_styles` 只允许页面级布局胶水、业务作用域和 Token 消费；不能授权新组件类、未定义修饰类或 Showcase 外壳类。
- `flow_to_surface_decisions` 必须覆盖所有 `prototype_boundaries.depth != excluded` 的节点，并说明承载方式。

## 页面布局规则

`layout_pattern` 必须显式写明页面模式，不使用模糊或条件性记法：

- `通栏模式 M0`：页面内容层横向 padding 为 0px（Token `--layout-page-margin-m0`）；分组内容使用通栏结构，不开启卡片修饰类。
- `长列表模式 M8`：页面内容层横向 padding 为 8px（Token `--layout-page-margin-m8`）；用于长列表数据较多的场景，分组内容开启卡片修饰类，cell 分割线使用 `.cell--divider-right-edge`。
- `卡片模式 M16`：页面内容层横向 padding 为 16px（Token `--layout-page-margin-m16`）；分组内容使用已注册卡片修饰类。
- `白底大留白模式 M32`：页面内容层横向 padding 为 32px（Token `--layout-page-margin-m32`）；页面背景使用 `--bg-surface`（白底），用于白色背景下极少内容场景；cell 分割线使用 `.cell--divider-center`（分割线与文本右缘对齐、不贴边）；cell-group__content 不开启卡片修饰类（白底页面无需圆角收边）；form 当前无 divider-center 能力，M32 下 form 暂用 `--no-divider`，待后续组件迭代补齐。

`--card` 修饰类开关规则：开启 `.cell-group__content--card` 的充要条件是「页面内容层横向 padding > 0 且页面背景为灰色（`--bg-page`）」。灰底上白底内容需要圆角收边；白底页面（`--bg-surface`）圆角无意义；通栏 0px 无横向留白，圆角也无意义。四档对应：M0 不开（0px）、M8 开（灰底+8px）、M16 开（灰底+16px）、M32 不开（白底）。

约束：

- 命中 `biz-rule-config` 的业务 surface 默认使用通栏 M0；`host-entry` 默认使用卡片 M16，除非权威来源明确给出例外。
- 移动端和桌面端的业务内容边距语义必须一致，不能因为手机壳边框消失而改变 scene 内容对齐。
- 页面主结构默认占满可用宽度；空内容、短文本或字段未填写不得让主区域收缩。
- 间距、尺寸、圆角、字号和颜色必须引用已注册 Token，不得在计划中发明新值。
- `allowed_page_styles` 必须与 `layout_pattern` 一致，不能同时授权互斥档位。

## 组件映射

`component_mapping` 必须是对象数组，每条至少包含：

- `block`：对应 `interaction_spec.content_blocks[].content_id`（新字段）或 `interaction_spec.information_blocks` 的标识（旧字段）。
- `scenario_type`：来自 `library-consumption.json.scenarioTypeRegistry.types[].id`。
- `consumption_mode`：`stable-variant | composition-constraint | free-composition`。
- `selected`：稳定变体组合或完整 DOM 路径（旧写法）。
- `constraint_ref`：命中组合约束时的 pagePattern、规则位置和触发条件。
- `reason`：结合业务信息说明为什么命中。
- `rule_sources`：该映射实际读取的契约、字段和 Preview。

### consumption_mode

- `stable-variant`：命中组件契约 `representativeVariants` 或稳定 `behavior` 场景。`selected` 使用维度值组合，不写自然语言或完整 DOM。
- `composition-constraint`：命中 `uikit-plan.json` 的 `compositionConstraints`。`selected` 写完整 DOM 路径，包含分组容器、修饰类、控件状态和资产路径（旧写法）。
- `free-composition`：未命中稳定变体和组合约束，但可在组件契约 `domAnatomy` 范围内安全组合。`selected` 仍写完整 DOM 路径（旧写法）。

> 第三阶段规则：新任务 `selected` 不得再写完整 DOM 路径或拼装 CSS 类，必须按“第三阶段 → 删除多义实现字段”的写法输出。`composition-constraint` 写命中的组合约束 ID；`free-composition` 写在契约 `domAnatomy` 范围内的组合说明。连续 cell/form 的分组容器通过 `region_composition` 表达，不再进入 `selected`。

禁止：

- 使用“返回图标在左边”等语义描述代替正式变体或 DOM。
- 使用“与某结构同构”省略结构。
- 同一计划中遗漏 `consumption_mode` 或混用写法。
- 先选择宿主组件，再把尺寸、间距、层级和内嵌控件规格留给 `wego-ux` 二次决定。
- 连续 cell/form 不声明已注册分组容器。
- 把额外 helper 文案当成默认兜底；只有业务必须且结构无法承载时才保留。

连续行式组件必须在 `selected` 中包含 `.cell-group`、`.form-group` 等正式容器（旧写法），并在 `implementation_constraints` 中声明不可替换为场景自定义 group 类。新任务改为在 `region_composition` 中声明分组容器，并在 `implementation_constraints` 中保留不可替换约束。

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
  "layout_pattern": "通栏模式 M0 | 长列表模式 M8 | 卡片模式 M16 | 白底大留白模式 M32",
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
- 新任务 `component_mapping.selected` 不含完整 DOM 路径或 CSS 类拼装；连续 cell/form 分组容器进入 `region_composition`。
- `complexity_level` 已声明，且按分级要求输出 `region_composition`、`flow_to_surface_decisions`、`page_strategy` 必填字段。
- `flow_to_surface_decisions` 覆盖所有 `prototype_boundaries.depth != excluded` 的节点。
- `surface_designs` 覆盖 `interaction_spec.surfaces[]`（或旧 `page_surfaces[]`）的全部 ID。
- `component_patterns.applies_to` 和 `region_composition.component_refs` 引用的 ID 均存在。
- 每个关键决定可追溯到真实权威文件与字段。
- 没有读取或引用生成文档，没有 `spec_refs_used`。
- 没有把未决问题、gap 或实现选择留给 `wego-ux`。

## 交接与禁止事项

通过自检后交给 `wego-ux`。以下情况不得交接：

- `interaction_spec` 缺失、未确认或与 App 目标不一致。
- `interaction_spec.readiness = blocked`。
- 任一 surface 为 `gap`。
- `functional` 节点未被 surface_designs 或 flow_to_surface_decisions 覆盖。
- 组件类、子元素类、修饰类或 Token 无正式来源。
- 打开方式、布局模式或组件组合无法追溯。

本技能禁止：

- 直接生成最终原型。
- 跳过 `interaction_spec` 重做需求理解。
- 复制 UI Kit Showcase 外壳或演示业务内容。
- 发明未注册组件、变体、Token、页面范式或打开方式。
- 用生成文档、个人审美或同类页面惯例覆盖正式规则来源。

## 第三阶段：设计越界收缩

为配合《interaction-prototype-workflow-refactor-conclusion.md》第三阶段要求，`design_plan` 在保持向下游兼容的同时，缩减过度依赖 DOM 和 CSS 的内容，并增加复杂度标识和结构拆分。

### 推荐整体结构

新版 `design_plan` 推荐以下结构层次：

```text
design_plan
├── complexity_level
├── flow_to_surface_decisions
├── page_strategy
├── region_composition
├── component_patterns
├── page_presentation
├── surface_designs
├── component_mapping
├── design_gaps
├── rule_sources_used
└── implementation_constraints
```

旧字段 `matched_uikit`、`navigation_pattern`、`layout_pattern`、`interaction_pattern`、`app_target` 仍可保留，用于兼容旧场景读取。新任务必须同时输出 `complexity_level`、`flow_to_surface_decisions`、`page_strategy`、`region_composition`、`component_patterns`、`page_presentation`、`surface_designs`、`component_mapping`、`design_gaps`、`rule_sources_used`。

### 关键改动

1. **删除完整 DOM 路径**：`component_mapping.selected` 不再填写完整 DOM 路径；只能使用代表稳定变体的维度值组合或命中的组合约束标识。如果需要标明区域组合，应在 `region_composition[]` 中描述，而非直接拼接 class。
2. **删除 CSS 类拼装**：计划中不应拼装或发明业务 class、修饰 class 或 Token 类；区域的布局胶水应通过 `layout_pattern` 与受控容器达成，不再出现在 `selected` 中。
3. **拆分组件模式和区域组合**：`component_patterns[]` 只描述页面命中的 pagePattern 或 fallback blueprint 以及对应的设计模式；`region_composition[]` 只描述由多个组件组合而成的业务区域、组合约束来源和区域角色。两者不得互相替代，也不得再混入 `component_mapping`。
4. **增加页面复杂度分级**：新字段 `complexity_level` 标识页面整体复杂度，取值见下节。该级别指导 `wego-ux` 实现重点和 `wego-tests` 验收粒度。
5. **保留正式规则来源追溯**：删除 DOM 路径和 class 后，所有设计判断仍须保留 `rule_sources_used`，并能定位到真实文件和字段；`rule_sources` 必须更新以配合新字段。

### 页面复杂度分级

`complexity_level` 必须取以下三值之一：

#### `simple`

适用于：简单设置页、单一表单、基础详情页。

必须字段：

- `complexity_level`、`component_patterns`、`page_strategy`、`page_presentation`、`surface_designs`、`component_mapping`、`rule_sources_used`。

可省略：`region_composition`、`flow_to_surface_decisions`（单节点单页面时）。

#### `structured`

适用于：多分组设置页、管理列表、多区块工作台。

在 `simple` 基础上必须增加：

- `region_composition`：表达分组结构、区域组合和信息优先级。
- `flow_to_surface_decisions`：当涉及多 surface 编排时必须输出。

#### `complex`

适用于：首页、内容流、营销页、类似淘宝首页的多模块页面。

在 `structured` 基础上必须增加：

- `page_strategy.first_screen_goal`：首屏目标。
- `page_strategy.region_priority`：区域优先级。
- `page_strategy.content_density`：内容密度策略。
- `page_strategy.scroll_rhythm`：滚动节奏。
- `page_strategy.fixed_vs_scroll`：固定区、吸顶区与连续内容关系。
- `page_strategy.visual_competition`：视觉竞争控制。

### flow_to_surface_decisions

负责定义：

- 哪些 `flow_nodes` 合并到同一 surface。
- 哪些节点使用独立页面、Sheet、Modal、Dialog 或内联交互。
- 返回和完成反馈如何表达。

每条决策使用稳定 `decision_id`，声明 `node_refs[]`、`surface_ref`、`carrier_decision`（`merge-into-surface | standalone-page | sheet | modal | dialog | inline`）、`reason` 和 `rule_sources`。

### page_strategy

定义页面级设计策略：

- `page_goal`：页面目标。
- `page_pattern`：命中的 pagePattern 或 fallback blueprint。
- `layout_pattern`：`通栏模式 M0 | 长列表模式 M8 | 卡片模式 M16 | 白底大留白模式 M32`。
- `main_scroll_direction`：主滚动方向。
- `content_density`：内容密度。
- `first_screen_priority`：首屏优先级（complex 必填）。
- `fixed_vs_scroll`：固定区与滚动区关系。
- `region_priority`：区域优先级（complex 必填）。
- `scroll_rhythm`：滚动节奏（complex 必填）。
- `visual_competition`：视觉竞争控制（complex 必填）。

### region_composition

负责复杂页面的区域编排，例如：搜索区、核心入口区、运营区、推荐流、吸顶区、底部操作区。

每个区域使用稳定 `region_id`，声明：

- `role`：区域角色，例如 `search | core-entry | operation | recommend | sticky-top | bottom-action`。
- `priority`：优先级。
- `order`：顺序。
- `layout`：布局模式。
- `width`：宽度策略。
- `scroll_behavior`：滚动行为。
- `component_refs[]`：引用 `component_patterns[].pattern_id` 或 `component_mapping[].block`。
- `relation`：与其他 `region_id` 的关系。
- `rule_sources`：组合约束来源。

`region_composition` 只在 `structured` 和 `complex` 页面中强制使用；`simple` 页面可省略。

### component_patterns

设计方案不再复制业务文案，也不写完整 DOM。`component_patterns[]` 描述页面命中的 pagePattern 或 fallback blueprint，以及对应的组件设计模式。

每条使用稳定 `pattern_id`，声明：

- `applies_to[]`：引用 `interaction_spec.content_blocks[].content_id` 或 `surfaces[].surface_id`。
- `component_pattern`：设计模式名称，例如 `single-arrow-entry | form-with-summary | list-with-actions`。
- `matched_page_pattern` 或 `matched_blueprint`。
- `constraint_ref`：命中的组合约束标识。
- `reason`：结合业务说明为什么命中。
- `rule_sources`：实际读取的契约、字段和 Preview。

允许多个业务内容共享同一个设计模式，但必须保留完整 ID 引用。

### 删除多义实现字段

不再使用一个字段同时承载：

- 变体值；
- DOM 路径；
- CSS 类；
- 状态类；
- 组合关系。

`component_mapping.selected` 只能写：

- `stable-variant`：变体维度值组合，例如 `["size=large", "type=primary"]`。
- `composition-constraint`：命中的组合约束 ID。
- `free-composition`：在契约 `domAnatomy` 范围内的组合说明，不出现完整 DOM 或 class。

### 示例扩展设计计划

```json
{
  "complexity_level": "structured",
  "flow_to_surface_decisions": [
    {
      "decision_id": "merge-permission-nodes",
      "node_refs": ["edit-permission", "save-permission"],
      "surface_ref": "permission-main",
      "carrier_decision": "merge-into-surface",
      "reason": "权限编辑和保存在同一表单页面完成",
      "rule_sources": ["uikit-plan.json.pagePatterns[biz-rule-config]"]
    }
  ],
  "page_strategy": {
    "page_goal": "权限配置",
    "page_pattern": "biz-rule-config",
    "layout_pattern": "通栏模式 M0",
    "main_scroll_direction": "vertical",
    "content_density": "comfortable"
  },
  "region_composition": [
    {
      "region_id": "permission-form-area",
      "role": "core-entry",
      "priority": 1,
      "order": 1,
      "layout": "vertical-stack",
      "width": "full",
      "scroll_behavior": "scroll",
      "component_refs": ["form-with-summary"],
      "relation": {},
      "rule_sources": ["uikit-plan.json.compositionConstraints[form-with-summary]"]
    }
  ],
  "component_patterns": [
    {
      "pattern_id": "biz-rule-config",
      "applies_to": ["permission-main"],
      "component_pattern": "form-with-summary",
      "matched_page_pattern": "biz-rule-config",
      "constraint_ref": "form-with-summary",
      "reason": "命中权限管理页面模式",
      "rule_sources": ["uikit-plan.json.pagePatterns[biz-rule-config]"]
    }
  ],
  "surface_designs": [],
  "component_mapping": [
    {
      "block": "inventory-deduction-order",
      "scenario_type": "string",
      "consumption_mode": "stable-variant",
      "selected": ["type=primary", "size=large"],
      "constraint_ref": {},
      "reason": "",
      "rule_sources": []
    }
  ],
  "design_gaps": [],
  "rule_sources_used": [
    {
      "file": ".codex/skills/wego-design/uikit-plan.json",
      "field": "pagePatterns[...].compositionConstraints[...]",
      "supports": ["具体设计决策"]
    }
  ],
  "implementation_constraints": []
}
```

实施第三阶段后，任何引用完整 DOM 路径或拼装 CSS 类的设计计划都视为越界。必须使用注册的组件契约提供的变体 ID 或组合约束 ID 代替。

### 兼容读取与迁移

- 新任务只输出 `complexity_level`、`flow_to_surface_decisions`、`page_strategy`、`region_composition`、`component_patterns` 等新字段。
- 旧场景仍可保留 `matched_uikit`、`navigation_pattern`、`layout_pattern`、`interaction_pattern` 等字段；`wego-ux` 和 `wego-tests` 优先读新字段，缺失时回退旧字段。
- 禁止同一场景同时维护新旧两份语义不同的设计计划；旧字段只作为迁移来源，不再继续编辑。
- `surface_designs` 必须覆盖 `interaction_spec.surfaces[]`（新字段）或 `interaction_spec.page_surfaces[]`（旧字段）的全部 ID。