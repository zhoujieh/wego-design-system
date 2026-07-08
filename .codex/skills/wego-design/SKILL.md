---
name: "wego-design"
description: 消费微购设计系统并输出 design_consumption_plan。用于已有 page_spec 时选择页面范式、UI Kit、组件映射、布局和打开方式；不负责原始需求理解或最终原型实现。
---

# Wego Design

先读取 `SKILL.runtime.md` 执行完整设计消费流程。本文件中的规则优先级高于历史核心文档。

## 本轮覆盖规则

- `.codex/skills/wego-design/specs/*.md` 是自动生成的人工检查文档，不得在运行时读取、引用或作为设计决策依据。
- 忽略 `SKILL.runtime.md` 中所有 `specs/*.md`、`spec_refs_used` 和旧规范文件路径说明。
- 设计决策只能来自以下权威来源：
  1. 已落盘的 `page_spec`
  2. `library-consumption.json`
  3. `uikit-plan.json`
  4. `colors_and_type.css` 与 `css.json`
  5. `components/index.json`
  6. 命中的 `components/{slug}.json`
  7. 命中的 `preview/component-{slug}.html`
- `design_consumption_plan` 使用 `rule_sources_used` 记录实际命中的权威文件和字段，不输出 `spec_refs_used`。
- 布局、页面宽度、组件组合、打开方式和例外条件必须能追溯到上述权威来源；无法追溯时标记为 `gap`，不得交给 `wego-ux` 自行判断。

## 完整流程

继续读取同目录 `SKILL.runtime.md`。其中与上述规则冲突的内容，以本文件为准。
