---
name: "wego-product"
description: 将原始中文业务需求转换为 page_spec 的产品理解技能。任何新页面、原型、场景或业务编辑任务，都必须先在这里确认需求、页面范围、状态和宿主路径。
---

# Wego Product

先读取 `SKILL.runtime.md` 执行完整产品理解流程。本文件中的规则优先级高于历史核心文档。

## 本轮覆盖规则

- `.codex/skills/wego-design/specs/*.md` 是自动生成的人工检查文档，不是运行时规则来源。
- 忽略 `SKILL.runtime.md` 中所有要求读取或输出 `spec_refs` 的旧说明。
- `page_spec` 不再输出 `spec_refs`；需要传递依据时使用 `rule_sources`，只引用真实权威来源：
  - 本技能 `SKILL.md` / `SKILL.runtime.md`
  - `AGENTS.md`
  - 用户原始需求
- `information_blocks`、页面状态、异常流程和宿主路径只能来自用户需求与本技能的结构化判断，不能从生成规范文档补充业务内容。
- 需求未确认前不得进入 `wego-design`；用户确认后必须把 `page_spec` 落盘再交接。

## 完整流程

继续读取同目录 `SKILL.runtime.md`。其中与上述规则冲突的内容，以本文件为准。
