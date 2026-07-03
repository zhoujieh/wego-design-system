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
│   ├── app/
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
4. `components/index.json`
5. 命中的 `components/{slug}.json`
6. 命中的 `preview/component-{slug}.html`
7. 相关 `specs/*.md`

`README.md` 是给人看的总览，AI 不强制顺序读；需要时按需查阅。

## 输出要求

必须输出 `design_consumption_plan`，至少包含这些字段：

```json
{
  "matched_uikit": "app | biz-rule-config",
  "scene_fit_reason": "为什么命中这个范式",
  "navigation_pattern": "导航类型",
  "layout_pattern": "内容布局类型",
  "interaction_pattern": "交互范式",
  "surface_designs": [
    {
      "surface_id": "host-entry",
      "role": "host-entry | primary-task-page | secondary-task-page | result-summary",
      "match_status": "exact | near | fallback | gap",
      "matched_uikit": "app | biz-rule-config | null",
      "matched_page_pattern": "biz-rule-config | null",
      "matched_blueprint": "mobile-host-entry | generic-mobile-task-page | selection-list-page | null",
      "scene_fit_reason": "为什么精确命中、近似命中、使用兜底蓝图，或为什么构成设计缺口",
      "component_mapping": [],
      "allowed_page_styles": ["仅允许的页面级布局/业务作用域样式"],
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
    "type": "push",
    "transition": "",
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
- `allowed_page_styles` 只允许声明页面级布局胶水或业务作用域样式，不能授权新组件类、未定义修饰类或 Showcase 外壳类

`component_mapping` 不再使用字符串数组，改为对象数组。每个对象必须包含：

- `block`：对应 `page_spec.information_blocks` 中的信息块标识
- `selected`：所选组件组合（class 名 + 修饰类）
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

未命中 `compositionConstraints` 的组合也要标注，`constraint_ref` 留空对象、`reason` 说明"无对应约束，按组件契约 domAnatomy 自由组合"。

## 落盘规则（硬约束）

`design_consumption_plan` 必须落盘到任务文件夹，不允许只在对话上下文中存在：

- 路径：`{task-folder}/_spec/design_consumption_plan.json`
- 必须在 `page_spec.json` 已落盘的前提下生成
- 同一任务迭代时复用原 `_spec/` 目录，按版本归档保留历史：
  - 最新版本始终写入 `_spec/design_consumption_plan.json`
  - 每次迭代时把上一版复制为 `_spec/archive/design_consumption_plan.{YYYYMMDD-HHmm}.json`
- `wego-ux`、`wego-tests` 都通过读取该文件确认前置条件已满足

## 消费规则

- UI Kit 只作结构参考，不复制 Showcase 外壳
- `app` 仅保留为移动端应用 Showcase；固定宿主模板由 `wego-ux` 维护，不作为 `wego-design` 的页面范式输出
- 组件必须优先复用已注册契约
- 文案、布局、交互、视觉规则只通过 `specs/*.md` 引用，不在这里重复规范正文
- 不把 `biz-*` 演示样式当通用组件
- 不把"示例把主操作放在导航操作区"写成唯一强制位置规则
- 必须先按 `page_spec.page_surfaces[]` 逐 surface 判断命中状态；不能只给整个任务一个 `matched_uikit` 后跳过宿主页、二级页或结果页
- 当 `page_spec` 包含 `host_container + route_id` 时，`host-entry` 只负责输出宿主页入口/回填所需的 surface 依据；不要把固定宿主模板本身当作新的 pagePattern
- 匹配 `uikit-plan.json` 中的 `pagePattern` 后，必须将其 `presentation`、`transition`、`dismissAction`、`overlayLevel`、`coversTabBar` 五个字段映射为 `page_presentation` 输出（`presentation`→`type`，`dismissAction`→`dismiss_action`，`overlayLevel`→`overlay_level`，`coversTabBar`→`covers_tab_bar`）；若 pagePattern 未声明 presentation，默认 `type: "push"`、`overlay_level: "inline"`、`covers_tab_bar: false`
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

禁止：
- 不标注工作流环节归属和场景类型直接写组件规则
- 用具体组件名作为判断条件的唯一依据
- 把 design 类规则回流到 wego-ux/SKILL.md（应回流到 library-consumption.json 或 uikit-plan.json）


## 禁止事项

- 不直接生成最终原型项目
- 不跳过 `page_spec` 自己重造场景判断
- 不复制 `.uikit-shell`、`.phone-frame`、`.phone-screen`
- 不发明未注册组件类或未定义修饰类
