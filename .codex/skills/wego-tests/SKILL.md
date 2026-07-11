---
name: "wego-tests"
description: 验收原型定稿并正式化后的业务迭代，比较规格、正式规则来源和实现，输出 acceptance_report、开发交接与冻结记录。
---

# Wego Tests

## 触发与职责边界

用于已实现迭代的验收、回归和交付判断。只证明需求、规则与实现是否一致；发现问题归因到最早决策环节，不直接修改业务或设计系统规则。

## 必要输入与运行时入口

读取 `AGENTS.md`、已实现迭代、两份正式规格、规则来源和运行时。报告结构读取[验收报告](references/acceptance-report.md)，专项路径读取[验收方法](references/acceptance-checks.md)，浏览器核对读取[浏览器验证](references/browser-verification.md)。只接受当前 Schema，旧输入直接失败。

## 输出契约与跨技能交接

输出带 `rule_source_check` 的 `acceptance_report`。失败时退回最早归属技能；全部通过后输出开发交接并冻结迭代。
