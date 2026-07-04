---
name: "wego-uxsystem-iterate"
description: "用于 wego-design 设计系统的项目级别迭代。包括组件迭代(契约/preview/样式/守门)、UI Kit 迭代、工作流迭代(经验沉淀/规则补充/流程优化)。"
---

# 项目级别迭代 Skill

用于 `wego-design` 设计系统和工作流的正式迭代。最核心的目标是：

1. 让AI可以稳定且正确的输出符合微购设计规范的交互原型，这是最顶层的原则，所有的迭代都必须要满足这个目标
2. 不要只改一个文件就结束
3. 不要把技能写成无限膨胀的经验仓库

本技能保留少数稳定规则，具体步骤按场景交给 `references/`。

## 工作模式（3 种）

先判断当前请求属于哪一种：

- `迭代模式` — 改样式、补场景、修契约、同步 preview、发布组件/UI Kit
- `审查模式` — review、评估、判断是否合理、契约是否漂移
- `工作流迭代模式` — 经验沉淀、规则补充、流程优化、场景类型注册

默认规则：

- 用户要求修改文件 → 迭代模式
- 用户只要求检查或评估 → 审查模式
- 用户要求沉淀经验、补规则、优化流程 → 工作流迭代模式
- “先审查再修” → 先出 findings，再进入对应迭代模式
- 审查发现问题需要沉淀规则 → 先出 findings，再转入工作流迭代模式

## 任务分流（按模式读取对应规则）

- 迭代模式 / 审查模式 → 读 `references/workflow.md`（步骤 + 组件迭代读取顺序 + 验证约束）、`references/sync-matrix.md`（同步范围，不含工作流迭代场景）、`references/judgment-principles.md`（组件级判断原则 + 组件级守门）
- 工作流迭代模式 → 读 `references/workflow-iteration.md`（完整规则 + 工作流迭代读取顺序 + 经验沉淀通用化原则）、`references/sync-matrix.md`（同步范围，工作流迭代场景）

技能本体只负责分流和跨模式守门，不重复展开所有步骤。

## 跨模式顶层守门

只保留真正跨模式的硬约束：

- 正式迭代必须递增 `.codex/skills/wego-design/metadata.json.version`
- 工作流迭代必须遵循 `references/workflow-iteration.md` 的经验沉淀通用化原则
- AGENTS.md 只承载顶层仓库关键信息与仓库偏好规则；工作流迭代规则不写到 AGENTS.md（除非升级为仓库级硬约束）

组件级守门（禁止手改 components.css / 只改 preview 标记区 / 契约同步 / 重跑提取脚本 / Token 同步 css.json）见 `references/judgment-principles.md`。

## 输出约定

无论哪种模式，回复都保持这 3 句：

- 改了什么：
- 验证了什么：
- 剩余风险：

审查模式先给 findings，再补这 3 句；没有真实风险时写“无明显剩余风险”。

## 特别提醒

- `.codex/skills/wego-design/components/index.json` 是已发布组件权威来源
- `.codex/skills/wego-design/preview/index.html` 是人工聚合验收页——AI 不读取、不修改
- `.codex/skills/wego-design/library-consumption.json` 的 `scenarioTypeRegistry` 是工作流迭代的经验沉淀索引
- `button` 的参考案例见 `references/button-example.md`
- 提交前可运行 `node scripts/validate-wego-design.mjs` 做文件完整性守门
