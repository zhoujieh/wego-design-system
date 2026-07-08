---
name: "wego-tests"
description: 验收 wego-app 当前业务场景并输出 acceptance_report，检查需求、设计计划、实现、路由、交互和回归是否一致。
---

# Wego Tests

先读取 `SKILL.runtime.md` 执行完整验收流程。本文件中的规则优先级高于历史核心文档。

## 本轮覆盖规则

- `.codex/skills/wego-design/specs/*.md` 是人工检查文档，不得作为验收依据。
- 忽略 `SKILL.runtime.md` 中所有 `spec_ref_check`、旧规范路径和“按 specs 验收”的说明。
- 验收依据固定为：
  1. `page_spec`
  2. `design_consumption_plan`
  3. `rule_sources_used` 指向的权威来源
  4. 当前场景实现、宿主路由和真实状态变化
  5. 自动化守门结果
- `acceptance_report` 使用 `rule_source_check` 替代 `spec_ref_check`，检查每个关键设计与实现决策是否能追溯到权威文件和字段。
- 发现问题时必须归因到最早产生错误的工作流环节，不能根据最后修改的文件或表面组件名称归因。

## 完整流程

继续读取同目录 `SKILL.runtime.md`。其中与上述规则冲突的内容，以本文件为准。
