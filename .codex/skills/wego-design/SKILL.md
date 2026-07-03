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

`component_mapping` 不再使用字符串数组，改为对象数组。每个对象必须包含：

- `block`：对应 `page_spec.information_blocks` 中的信息块标识
- `selected`：所选组件组合（class 名 + 修饰类）
- `constraint_ref`：决策来源（命中 `compositionConstraints` 时必填）
  - `pagePattern`：命中的页面范式
  - `rule_id`：对应 `compositionConstraints` 数组下标，如 `compositionConstraints[0]`
  - `trigger`：该约束的触发条件原文
- `reason`：为什么命中这个约束（结合业务场景说明）

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
- 组件必须优先复用已注册契约
- 文案、布局、交互、视觉规则只通过 `specs/*.md` 引用，不在这里重复规范正文
- 不把 `biz-*` 演示样式当通用组件
- 不把"示例把主操作放在导航操作区"写成唯一强制位置规则
- 匹配 `uikit-plan.json` 中的 `pagePattern` 后，必须将其 `presentation`、`transition`、`dismissAction`、`overlayLevel`、`coversTabBar` 五个字段映射为 `page_presentation` 输出（`presentation`→`type`，`dismissAction`→`dismiss_action`，`overlayLevel`→`overlay_level`，`coversTabBar`→`covers_tab_bar`）；若 pagePattern 未声明 presentation，默认 `type: "push"`、`overlay_level: "inline"`、`covers_tab_bar: false`
- 命中 `pagePattern` 的 `compositionConstraints` 时，`component_mapping` 必须标注所选组合 + 对应规则 ID + trigger，形成可追溯链路（详见上方输出要求）

### 场景类型引用（必读）

输出 `component_mapping` 时，每条映射必须标注：
- 工作流环节归属：本技能输出的规则归属 `wego-design`（主），执行引用同步到 `wego-ux`（次）
- 所属场景类型（引用 `library-consumption.json` 的 `scenarioTypeRegistry.types[].id`）
- 判断条件（结构特征/语义特征/宿主特征，不能是"组件名+修饰类名"）
- 决策依据（引用组件契约的 variantDimensions / usageHints，或 compositionConstraints 的 trigger）

禁止：
- 不标注工作流环节归属和场景类型直接写组件规则
- 用具体组件名作为判断条件的唯一依据
- 把 design 类规则回流到 wego-ux/SKILL.md（应回流到 library-consumption.json 或 uikit-plan.json）


## 禁止事项

- 不直接生成最终原型项目
- 不跳过 `page_spec` 自己重造场景判断
- 不复制 `.uikit-shell`、`.phone-frame`、`.phone-screen`
- 不发明未注册组件类或未定义修饰类
