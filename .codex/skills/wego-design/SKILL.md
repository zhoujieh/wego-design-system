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

1. `README.md`
2. `library-consumption.json`
3. `uikit-plan.json`
4. `components/index.json`
5. 命中的 `components/{slug}.json`
6. 命中的 `preview/component-{slug}.html`
7. 相关 `specs/*.md`

## 输出要求

必须输出 `design_consumption_plan`，至少包含这些字段：

```json
{
  "matched_uikit": "app | biz-rule-config",
  "scene_fit_reason": "为什么命中这个范式",
  "navigation_pattern": "导航类型",
  "layout_pattern": "内容布局类型",
  "interaction_pattern": "交互范式",
  "component_mapping": [],
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

## 消费规则

- UI Kit 只作结构参考，不复制 Showcase 外壳
- 组件必须优先复用已注册契约
- 文案、布局、交互、视觉规则只通过 `specs/*.md` 引用，不在这里重复规范正文
- 不把 `biz-*` 演示样式当通用组件
- 不把"示例把主操作放在导航操作区"写成唯一强制位置规则
- 匹配 `uikit-plan.json` 中的 `pagePattern` 后，必须将其 `presentation`、`transition`、`dismissAction`、`overlayLevel`、`coversTabBar` 五个字段映射为 `page_presentation` 输出（`presentation`→`type`，`dismissAction`→`dismiss_action`，`overlayLevel`→`overlay_level`，`coversTabBar`→`covers_tab_bar`）；若 pagePattern 未声明 presentation，默认 `type: "push"`、`overlay_level: "inline"`、`covers_tab_bar: false`


## 禁止事项

- 不直接生成最终原型项目
- 不跳过 `page_spec` 自己重造场景判断
- 不复制 `.uikit-shell`、`.phone-frame`、`.phone-screen`
- 不发明未注册组件类或未定义修饰类
