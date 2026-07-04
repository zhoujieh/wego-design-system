---
name: "wego-design"
description: "消费微购本地设计系统并输出 design_consumption_plan 的技能。用于 page_spec 已明确、Codex 需要选择移动端页面范式、UI Kit、导航方式、内容布局、组件映射和规范引用时使用；不负责直接理解长需求，也不负责直接产出最终原型项目。"
---

# Wego Design

只负责设计系统消费，不负责原始需求理解，也不负责最终原型生成。

## 根目录

以下路径都相对于当前 skill 根目录 `{WEGO_DESIGN_ROOT}`：

```text
{WEGO_DESIGN_ROOT}/
├── SKILL.md
├── README.md
├── colors_and_type.css
├── css.json
├── typography.css
├── scaffold.css
├── components.css
├── iconfont.css
├── library-consumption.json
├── uikit-plan.json
├── metadata.json
├── scripts/
├── assets/
├── components/
├── preview/
├── ui_kits/
│   └── biz-rule-config/
└── specs/
```

## 输入前提

开始前必须已有 `page_spec`。

如果用户给的是原始业务需求，先转给 `wego-product`，不要在这里直接重做需求理解。

## 固定读取顺序

1. `SKILL.md`（技能入口，明确自身职责与边界）
2. `library-consumption.json`
3. `uikit-plan.json`
4. `colors_and_type.css`
5. `css.json`
6. `components/index.json`
7. 命中的 `components/{slug}.json`
8. 命中的 `preview/component-{slug}.html`
9. 相关 `specs/*.md`

`README.md` 是给人看的总览，AI 不强制顺序读；需要时按需查阅。

## 输出要求

必须输出 `design_consumption_plan`，至少包含这些字段：

```json
{
  "matched_uikit": "biz-rule-config | null",
  "scene_fit_reason": "为什么命中这个范式",
  "navigation_pattern": "导航类型",
  "layout_pattern": "页面布局模式 + 内容布局类型。必须显式声明『通栏模式 M1』或『卡片模式 M2』：通栏 M1 = phone-body 0px 横向 padding + cell-group__content 无 --card；卡片 M2 = phone-body 16px 横向 padding + cell-group__content--card。命中 biz-rule-config 的 surface 默认通栏 M1，host-entry surface 用卡片 M2。禁止使用 [+--card] 条件性记法。",
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
      "surface_id": "host-entry",
      "role": "host-entry | primary-task-page | secondary-task-page | result-summary",
      "match_status": "exact | near | fallback | gap",
      "matched_uikit": "biz-rule-config | null",
      "matched_page_pattern": "biz-rule-config | null",
      "matched_blueprint": "mobile-host-entry | generic-mobile-task-page | selection-list-page | null",
      "presentation_ref": "命中的 pagePattern.presentation 来源；未命中 pagePattern 时为空字符串",
      "scene_fit_reason": "为什么精确命中、近似命中、使用兜底蓝图，或为什么构成设计缺口",
      "component_mapping": [],
      "allowed_page_styles": ["仅允许的页面级布局/业务作用域样式。横向 padding 必须显式声明 M1（0px）或 M2（16px），引用 specs/布局与间距规范.md#页面边距；禁止使用 12px 等非 4N 倍数值；禁止使用『phone-body 间距』这种模糊描述。"],
      "design_gap": ""
    }
  ],
  "component_mapping": [
    {
      "block": "inventory-deduction-order",
      "selected": "cell + cell__select + radio",
      "constraint_ref": {
        "pagePattern": "biz-rule-config",
        "rule_id": "compositionConstraints[0]",
        "trigger": "多选项互斥单选（选项≥3 或单条文案>4字）"
      },
      "reason": "3 个仓库选项属于互斥单选，命中 compositionConstraints[0]"
    }
  ],
  "spec_refs_used": {},
  "implementation_constraints": [],
  "page_presentation": {
    "type": "push | modal | sheet | full-screen-modal",
    "transition": "none | slide-left | fade | slide-up-enter, slide-down-exit",
    "dismiss_action": "back-button",
    "overlay_level": "inline",
    "covers_tab_bar": false
  }
}
```

`surface_designs` 是逐页面/页面片段的设计依据，必须覆盖 `page_spec.page_surfaces[]` 中的每个 `id`。字段规则：

- `match_status = exact`：明确命中 `uikit-plan.json.pagePatterns[]`，必须填写 `matched_uikit`、`matched_page_pattern`
- `match_status = near`：接近已有 pagePattern 但存在小差异，必须说明差异，并仍以已命中 pagePattern 的约束为主
- `match_status = fallback`：没有合适 UI Kit/pagePattern，但可由 `uikit-plan.json.fallbackPageBlueprints[]` 兜底，必须填写 `matched_blueprint`
- `match_status = gap`：现有 UI Kit、fallback blueprint、组件契约都无法安全覆盖；必须填写 `design_gap`，并阻止进入 `wego-ux`
- 命中带 `presentation` 的 pagePattern 时，必须填写 `presentation_ref`，说明 `page_presentation` 来源于哪个 `matched_page_pattern`
- `allowed_page_styles` 只允许声明页面级布局胶水或业务作用域样式，不能授权新组件类、未定义修饰类或 Showcase 外壳类
- `allowed_page_styles` 中的横向 padding 必须与 `layout_pattern` 声明的模式一致：通栏 M1 声明 0px，卡片 M2 声明 16px；移动端与桌面端横向 padding 一致（移动端 phone-frame border 和 preview-shell padding 的消失不应导致 scene 内容边距变小）
- `layout_pattern` 禁止使用 `[+--card]` 条件性记法，必须明确写出"通栏模式 M1"或"卡片模式 M2"

`component_mapping` 不再使用字符串数组，改为对象数组。每个对象必须包含：

- `block`：对应 `page_spec.information_blocks` 中的信息块标识
- `consumption_mode`：规格消费模式，取值三选一（`stable-variant` / `composition-constraint` / `free-composition`），由命中来源决定：
  - `stable-variant`：命中组件契约 `representativeVariants` 稳定变体或 `behavior` 稳定场景（如 navbar fullscreenModalPatterns 模式 A）
  - `composition-constraint`：命中 `uikit-plan.json` 的 `compositionConstraints`
  - `free-composition`：两者均未命中，按组件契约 `domAnatomy` 自由组合
- `selected`：所选组件组合，写法必须与 `consumption_mode` 匹配：
  - `stable-variant`：写变体维度值组合，如 `navbar + navbar__body--spaced(leftControl=text-cancel, actions=button, rightActionType=button, pageTransition=present)`
  - `composition-constraint`：写完整 DOM 路径（合成 compositionConstraints.use + 组件契约 domAnatomy），含分组容器类、修饰类、内嵌控件状态修饰类、图标资产路径
  - `free-composition`：写完整 DOM 路径（基于 domAnatomy.root + requiredChildren + optionalActionClasses 推导）
- `constraint_ref`：决策来源（命中 `compositionConstraints` 时必填）
  - `pagePattern`：命中的页面范式
  - `rule_id`：对应 `compositionConstraints` 数组下标，如 `compositionConstraints[0]`
  - `trigger`：该约束的触发条件原文
- `reason`：为什么命中这个约束（结合业务场景说明）；若命中的是已注册组件的稳定场景，必须说明哪些内部关系已由场景承接，例如关联控件规格、背景/表面关系、父子从属结构、是否仍需要额外说明文案

补充要求：

- `selected` 优先表达“命中的组件场景/组合模式”，不要只写松散组件串联后把关键判断留给 `wego-ux`
- `judgment_condition` / `reason` 需要说明命中的是哪个稳定场景，以及页面层仍允许补哪些业务数据或布局胶水
- 若组件契约已提供稳定场景，不得先选宿主组件，再把内嵌控件尺寸、间距、层级或补充结构留到实现阶段二次决定
- helper 文案不是默认兜底；只有结构无法承载且业务必须提醒时，才允许保留额外说明
- 当 block 选中行式组件（如 cell）的连续组合时，`selected` 必须显式包含已注册的分组容器类（如 `.cell-group`），不发明场景级 `xxx-page__group` 自定义类替代；`implementation_constraints` 必须把"分组容器类强制使用"作为传递给 `wego-ux` 的硬约束
- **禁止"语义描述型"写法**（如 `back-icon 左`）—— 必须用 `stable-variant` 模式 + 维度值组合，或用 `composition-constraint`/`free-composition` + 完整 DOM 路径
- **禁止"结构同构"引用写法**（如 `与『部分可见』结构同构:...`）—— 即使结构相同，`selected` 也必须独立给出完整 DOM 路径，不得用引用省略修饰类或资产路径
- **一致性要求**：同一份 `design_consumption_plan` 内所有 `component_mapping` 必须标注 `consumption_mode`，且 `selected` 写法与 `consumption_mode` 匹配（`stable-variant` 用维度值组合，`composition-constraint`/`free-composition` 用完整 DOM 路径）

未命中 `compositionConstraints` 的组合也要标注，`constraint_ref` 留空对象、`reason` 说明"无对应约束，按组件契约 domAnatomy 自由组合"，`consumption_mode` 标注为 `free-composition`。

### App 目标绑定（必填）

`design_consumption_plan.app_target` 必须从 `page_spec.app_target` 和 `route_id` 映射而来：

- `mode` 固定为 `wego-app-scene`
- `app_root` 固定为 `wego-app`
- `scene_folder` 固定为 `wego-app/scenes/{中文业务场景}`
- `route_id` 必须与 `page_spec.route_id` 一致
- `route_mode` 固定为 `hash`
- `runtime_entry` 固定为 `scene.js`

设计消费只决定业务页面结构、组件映射和打开方式；不得把固定宿主 App 本身当作 UI Kit 或 pagePattern。

## 落盘规则（硬约束）

`design_consumption_plan` 必须落盘到 App 场景目录，不允许只在对话上下文中存在：

- 路径：`wego-app/scenes/{中文业务场景}/_spec/design_consumption_plan.json`
- 必须在 `page_spec.json` 已落盘的前提下生成
- 同一业务场景迭代时复用原 `_spec/` 目录，按版本归档保留历史：
  - 最新版本始终写入 `_spec/design_consumption_plan.json`
  - 每次迭代时把上一版复制为 `_spec/archive/design_consumption_plan.{YYYYMMDD-HHmm}.json`
- `wego-ux`、`wego-tests` 都通过读取该文件确认前置条件已满足

## 消费规则

- UI Kit 只作业务页面结构参考，不复制 Showcase 外壳，也不承担 App 宿主模板职责
- `app` 不属于 UI Kit；固定宿主 App 的唯一运行落点是 `wego-app/index.html`，宿主模板基线由 `wego-ux/templates/host-shell.*` 维护
- 组件必须优先复用已注册契约
- 文案、布局、交互、视觉规则只通过 `specs/*.md` 引用，不在这里重复规范正文
- 不把 `biz-*` 演示样式当通用组件
- `cell` / `form` 连续分组优先消费组件正式 group 结构：标题走 `.cell-group__title` / `.form-group__title`，连续内容走各自 content 容器；卡片页圆角只开在 content 容器上
- 不把"示例把主操作放在导航操作区"写成唯一强制位置规则
- 必须先按 `page_spec.page_surfaces[]` 逐 surface 判断命中状态；不能只给整个任务一个 `matched_uikit` 后跳过宿主页、二级页或结果页
- 当 `page_spec` 包含 `host_container + route_id` 时，`host-entry` 只负责输出宿主页入口/结果回填所需的 surface 依据；不要把固定宿主 App 本身当作新的 pagePattern，也不要让下游参考后重画宿主 App
- 匹配 `uikit-plan.json` 中的 `pagePattern` 后，必须将其 `presentation`、`transition`、`dismissAction`、`overlayLevel`、`coversTabBar` 五个字段映射为 `page_presentation` 输出（`presentation`→`type`，`dismissAction`→`dismiss_action`，`overlayLevel`→`overlay_level`，`coversTabBar`→`covers_tab_bar`）；若 pagePattern 未声明 presentation，默认 `type: "push"`、`overlay_level: "inline"`、`covers_tab_bar: true`
- **硬约束**：`wego-app/scenes/` 下业务场景的 `page_presentation.covers_tab_bar` 必须为 `true`（5 个主 tab 走 host-shell 内嵌面板，不经过 page_presentation）；不得输出 `false`，除非 surface 角色为 `host-entry` inline grid 入口
- `page_presentation` 必须能从业务主 surface 的 `matched_page_pattern` 和 `presentation_ref` 反查来源；不能只给顶层字段而不说明命中的页面范式
- 命中 `biz-rule-config` pagePattern 时，默认必须输出 `type: "full-screen-modal"`、`transition: "slide-up-enter, slide-down-exit"`、`overlay_level: "overlay"`、`covers_tab_bar: true`；若业务语义更适合二级页面、普通弹窗或底部面板，必须先在 `uikit-plan.json.pagePatterns[].presentation` 或对应 fallback blueprint 中有明确依据，再输出 `push`、`modal` 或 `sheet`
- 命中 `pagePattern` 的 `compositionConstraints` 时，`component_mapping` 必须标注所选组合 + 对应规则 ID + trigger，形成可追溯链路（详见上方输出要求）
- 未命中 UI Kit/pagePattern 但能安全输出时，必须引用 `uikit-plan.json.fallbackPageBlueprints[]`；不能临时发明页面范式
- 任何 surface 为 `gap` 时，不输出可执行原型计划，只输出设计缺口与建议补充的 blueprint/UI Kit/组件契约
- 若已命中组件稳定场景，页面层不得再重定义其内嵌关联控件规格、父子联动结构或冗余 helper；这类判断必须在 `component_mapping` 阶段就锁定

### 场景类型引用（必读）

输出 `component_mapping` 时，每条映射必须标注：
- 工作流环节归属：本技能输出的规则归属 `wego-design`（主），执行引用同步到 `wego-ux`（次）
- 所属场景类型（引用 `library-consumption.json` 的 `scenarioTypeRegistry.types[].id`）
- 判断条件（结构特征/语义特征/宿主特征，不能是"组件名+修饰类名"）
- 决策依据（引用组件契约的 variantDimensions / usageHints，或 compositionConstraints 的 trigger）

当 surface 未命中 UI Kit/pagePattern 时，场景类型必须标注为 `no-uikit-page-composition`，并引用 `fallbackPageBlueprints` 中的 `id`、`layoutRules`、`allowedComponents` 与 `forbidden`。

当 surface 命中带 `presentation` 的 pagePattern 时，场景类型必须标注为 `page-presentation-binding`，并说明判断条件来自页面角色、命中的 pagePattern 和 `uikit-plan.json.pagePatterns[].presentation`，不要让 `wego-ux` 重新判断打开方式。

当 surface 属于 App 内业务场景挂载时，场景类型必须标注为 `wego-app-scene-delivery`，并说明判断条件来自 `page_spec.app_target`、`route_id` 和 `host_container`。

禁止：
- 不标注工作流环节归属和场景类型直接写组件规则
- 用具体组件名作为判断条件的唯一依据
- 把 design 类规则回流到 wego-ux/SKILL.md（应回流到 library-consumption.json 或 uikit-plan.json）


## 禁止事项

- 不直接生成最终原型项目
- 不跳过 `page_spec` 自己重造场景判断
- 不把 `.uikit-shell`、`.phone-frame`、`.phone-screen` 当作业务页面结构；手机外壳只允许作为全局预览容器，电脑端显示、移动端同链接隐藏
- 不发明未注册组件类或未定义修饰类
