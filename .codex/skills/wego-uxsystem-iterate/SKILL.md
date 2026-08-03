---
name: "wego-uxsystem-iterate"
description: 审查或迭代微购设计系统、组件、Preview、UI Kit、消费规则、守卫和工作流；不实现普通业务场景。
---

# Wego UX 系统迭代

## 触发与边界

用于组件、Token、Preview、UI Kit、消费边界、守卫、设计系统缺口和工作流维护。普通业务场景固定交给 `wego-product → wego-design`。本技能修改唯一权威源，不直接修改 `wego-app/lib/`、生成的 `components.css` 或业务场景来掩盖系统问题。

经验沉淀不自动触发。只有用户明确要求总结、登记、升级或清理经验时，才进入经验流程；普通任务过程中不得持续扫描、分类或写入经验候选。

<!-- rule-id: experience-must-stay-inside-uxsystem-iterate -->
经验文件只能维护在本技能目录内。唯一候选数据源固定为 `.codex/skills/wego-uxsystem-iterate/experience/candidates.json`；禁止在仓库根目录或其它技能下创建 `experience/`、`candidates.json`、经验记录或其副本。写入前必须使用完整仓库路径确认目标位置，发现根目录旧副本时先合并有效内容，再删除旧副本并清理引用。

## 按需读取

- 组件、Token、Preview 或 UI Kit：读[组件与 UI Kit 迭代](./references/workflow.md)、[资源同步矩阵](./references/sync-matrix.runtime.md)及受影响的权威源和消费者。
- 消费规则、守卫或系统缺口：只读直接受影响的规则、源码和运行时消费者。涉及分支、PR、预览或交付收口时，同步读取 `wego-github-delivery` 的交付规则。
- 用户明确要求总结、登记、升级或清理经验：读[工作流迭代](./references/workflow-iteration.md)、[工作流同步矩阵](./references/sync-matrix.md)和唯一候选数据源 `.codex/skills/wego-uxsystem-iterate/experience/candidates.json`。

## 输出与交接

输出权威源改动、必要同步和与改动范围相称的验证结果。收到设计系统缺口时先验证缺口，再采用正式能力或明确回退。正式设计系统源变化必须递增版本；只有用户确认升级的经验才修改正式规则。守卫验证可观察的源码或运行结果，不校验文档固定措辞。
