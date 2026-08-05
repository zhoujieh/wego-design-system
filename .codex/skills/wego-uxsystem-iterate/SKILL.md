---
name: "wego-uxsystem-iterate"
description: 审查或迭代微购设计系统、组件、Preview、UI Kit、消费规则、守卫和工作流；不实现普通业务场景。
---

# Wego UX 系统迭代

## 触发与边界

用于组件、Token、Preview、UI Kit、消费边界、守卫、设计系统缺口和工作流维护。普通业务场景固定交给 `wego-product → wego-design`。本技能修改唯一权威源，不直接修改 `wego-app/lib/`、生成的 `components.css` 或业务场景来掩盖系统问题。

经验沉淀不自动触发。只有用户明确要求总结、登记、升级或清理经验时，才进入经验流程；普通任务过程中不得持续扫描、分类或写入经验数据。

<!-- rule-id: experience-must-stay-inside-uxsystem-iterate -->
经验文件只能维护在本技能目录内。事实事件唯一数据源为 `.codex/skills/wego-uxsystem-iterate/experience/evidence.json`，经验归纳唯一数据源为 `.codex/skills/wego-uxsystem-iterate/experience/candidates.json`；禁止在仓库根目录或其它技能下创建经验目录、记录或副本。写入前必须使用完整仓库路径确认目标位置，发现旧副本时先合并有效内容，再删除旧副本并清理引用。

## 按需读取

- 组件、Token、Preview 或 UI Kit：读[组件与 UI Kit 迭代](./references/workflow.md)、[资源同步矩阵](./references/sync-matrix.runtime.md)及受影响的权威源和消费者。
- 消费规则、守卫或系统缺口：只读直接受影响的规则、源码和运行时消费者。涉及分支、PR、预览或交付收口时，同步读取 `wego-github-delivery` 的交付规则。
- 用户明确要求总结、登记、升级或清理经验：读[工作流迭代](./references/workflow-iteration.md)、[工作流同步矩阵](./references/sync-matrix.md)、事实事件源 `.codex/skills/wego-uxsystem-iterate/experience/evidence.json` 和经验归纳源 `.codex/skills/wego-uxsystem-iterate/experience/candidates.json`。

## 输出与交接

输出权威源改动、必要同步和与改动范围相称的验证结果。默认处于**本地迭代中**：

- 组件、Token、Preview 或 UI Kit 变更如有可视 Preview，从当前任务 worktree 启动或复用本地 HTTP 服务，返回已核实且可点击的对应预览链接；不返回 GitHub Pages 预览链接。
- 工作流、守卫或纯文档维护没有可视入口时，只报告受影响范围和本地验证结果，不为满足形式强行生成预览。
- 允许按一组相关改动创建本地 checkpoint commit；不得自动推送、创建或更新 PR。
- 每次结果标明：`当前状态：本地迭代中（未推送）`。

只有用户明确要求提交、推送、创建/更新 PR、发在线预览，或明确说明“这一轮改完了，可以验收”时，才进入**正式提交**：

1. 完成全部必要同步，并运行 `node scripts/validate-wego-design.mjs --scope=system --strict`。
2. 集中提交、推送当前分支并创建或更新同一个 PR。
3. 组件、Token、Preview 或 UI Kit 仍只交付本地 HTTP 预览；工作流和守卫维护不要求在线预览。
4. 设计系统变更等待用户明确验收通过后合并；工作流权威源维护免业务验收，必要检查通过后可按短周期 PR 自动合并。
5. 每次结果标明：`当前状态：正式验收中（PR #<编号>）`；工作流维护已自动合并时改为报告合并结果。

“改好了”“继续”“再调整一下”等普通反馈不构成提交授权。PR 已存在时，后续小问题先回到本地迭代累计完成，再由用户明确要求批量更新原 PR。

本地预览服务在本地迭代和等待正式验收期间保持运行，只在用户明确验收通过、任务废弃、PR 关闭或合并、worktree 即将清理，或被同一交付单元的新服务替换时停止并删除记录。正式设计系统源变化必须递增版本；收到设计系统缺口时先验证缺口，再采用正式能力或明确回退。只有用户确认升级的经验才修改正式能力。经验升级后保留事实、累计次数和升级历史；升级后再次出现时立即重新进入调整。守卫验证可观察的源码、结构化数据或运行结果，不校验文档固定措辞。
