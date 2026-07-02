---
name: wego-tests
description: 验收产品原型项目并输出 acceptance_report 的技能。用于原型已经由 $wego-ux 产出后，检查需求承接、场景判断、设计系统消费、任务文件夹约束、构建部署可用性，以及文案/布局/交互是否符合 wego-design 规范。
---

# Wego Tests

只做验收，不做原型生成。

## 输入前提

开始前必须已经有：

- `page_spec`
- `design_consumption_plan`
- 最终原型项目文件夹

## 输出要求

必须输出 `acceptance_report`，至少包含这些字段：

```json
{
  "requirement_coverage": [],
  "scene_judgement_check": {},
  "uikit_consumption_check": {},
  "component_discipline_check": {},
  "spec_ref_check": {},
  "copy_check": {},
  "interaction_check": {},
  "layout_check": {},
  "prototype_folder_check": {},
  "deployment_readiness_check": {},
  "risk_log": [],
  "manual_verify_items": [],
  "final_status": "pass | pass-with-risk | fail"
}
```

## 必查项

- 需求是否被页面完整承接
- 是否正确命中 `biz-rule-config` 或其他目标场景
- 是否按 `design_consumption_plan` 消费了 UI Kit 和组件
- 是否误复制 Showcase 外壳
- 是否发明了不该发明的组件类或修饰类
- 是否按 `spec_refs` 执行了文案、布局、交互、视觉规则
- 原型是否位于任务级文件夹
- 同一任务是否复用了原文件夹
- 项目是否具备基本构建和部署条件

## 验收顺序

1. 先对照 `page_spec`
2. 再对照 `design_consumption_plan`
3. 再检查原型项目结构
4. 再检查规范引用执行结果
5. 最后给出 `final_status`

## 结果归因

如果不通过，要明确问题属于哪一层：

- `wego-product`：需求理解或场景判断问题
- `wego-design`：设计系统消费决策问题
- `wego-ux`：原型实现或项目结构问题

不要只给笼统结论。
