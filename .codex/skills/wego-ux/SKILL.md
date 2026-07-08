---
name: "wego-ux"
description: 将 page_spec 和 design_consumption_plan 落成 wego-app 静态 App 场景，或按已落盘规格迭代已有场景。
---

# Wego UX

先读取 `SKILL.runtime.md` 执行完整原型实现流程。本文件中的规则优先级高于历史核心文档。

## 本轮覆盖规则

- `.codex/skills/wego-design/specs/*.md` 只用于人工检查，不得作为实现规则读取。
- 忽略 `SKILL.runtime.md` 中所有要求消费 `specs` 或 `spec_refs` 的旧说明。
- 实现依据固定为：
  1. `_spec/page_spec.json`
  2. `_spec/design_consumption_plan.json`
  3. `design_consumption_plan.rule_sources_used`
  4. 命中的组件契约、Preview、Token 和 UI Kit 计划
- 不得因为生成文档中的通俗描述覆盖 `design_consumption_plan` 或组件契约。
- 发现规格缺失、冲突或无法追溯时，必须回退到对应上游技能，不在实现阶段补规则。

## 完整流程

继续读取同目录 `SKILL.runtime.md`。其中与上述规则冲突的内容，以本文件为准。
