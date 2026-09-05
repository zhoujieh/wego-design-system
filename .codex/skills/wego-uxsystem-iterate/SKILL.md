---
name: "wego-uxsystem-iterate"
description: 审查或迭代微购设计系统、组件、Preview、UI Kit、消费规则、守卫和工作流；不实现普通业务场景。
---

# Wego UX 系统迭代

## 触发与边界

用于组件、Token、Preview、UI Kit、消费边界、守卫、设计系统缺口和工作流维护。普通业务场景固定交给 `wego-product → wego-design`。本技能修改唯一权威源，不直接修改 `wego-app/lib/`、生成的 `components.css` 或业务场景来掩盖系统问题。

经验体系分四层：L1 事实 `.codex/skills/wego-uxsystem-iterate/experience/evidence.json`（合入 main 后只增不减）→ L2 核心摘要 `.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md`（一句话索引、会话前置读）→ L3 场景技能 `.codex/skills/wego-scene-*`（可被 AI 触发的固定流程）→ L4 正式规则。业务技能在现场只识别信号、写 `.tasks/experience-inbox.json` 草稿；本技能收口时先执行经验质量门，再做主题归属与层级路由，命中已有场景技能也不得跳过质量门。需求决定、验收口径、单次视觉调整和普通缺陷只更新需求/契约/测试，不沉淀经验；只有同时具备明确机制、跨任务复用、可行动、已验证、非冗余的因果规则才进入 L1/L2/L3，并告知用户 `🧠已沉淀经验：<因果规则>`。零合格信号零经验动作。完整流程见[工作流迭代](./references/workflow-iteration.md)。

<!-- rule-id: experience-must-stay-inside-uxsystem-iterate -->
L1/L2/L3 经验权威源只能维护在本技能目录及 `.codex/skills/wego-scene-*` 内：事实唯一数据源为 `.codex/skills/wego-uxsystem-iterate/experience/evidence.json`，核心摘要为 `.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md`（AI 基于事实推理维护，`§` 分隔，≤1500 字符）；禁止在仓库根目录或其它技能下创建经验目录、记录或副本。唯一例外是交付单元 `.tasks/experience-inbox.json` 未判定草稿（随 worktree 生灭，业务技能只写草稿、本技能负责转正或清空）。写入前必须使用完整仓库路径确认目标位置，发现旧副本时先合并有效内容，再删除旧副本并清理引用。

## 按需读取

- 组件、Token、Preview 或 UI Kit：读[组件与 UI Kit 迭代](./references/workflow.md)、[资源同步矩阵](./references/sync-matrix.runtime.md)及受影响的权威源和消费者。
- 消费规则、守卫或系统缺口：只读直接受影响的规则、源码和运行时消费者。涉及分支、PR、预览或交付收口时，同步读取 `wego-github-delivery` 的交付规则。
- 经验沉淀或工作流维护：读[工作流迭代](./references/workflow-iteration.md)、[工作流同步矩阵](./references/sync-matrix.md)、交付单元 `.tasks/experience-inbox.json` 草稿；先把纯需求/普通缺陷分流出去，再用 `node scripts/refine-experience.mjs --related <关键词>` 核对是否已有同类规则；新经验按结构化质量字段写入并由 `--check` 守门。
- 走查工具测试/回归/验收/排查（改走查 js/css 后回归、交互矩阵验收、走查相关 PR 验证）：先读场景技能[wego-scene-walkthrough-test](../wego-scene-walkthrough-test/SKILL.md)，按分层门禁与受影响回归脚本执行。

## 输出与交接

输出权威源改动、必要同步和与改动范围相称的验证结果。默认处于**本地迭代中**：

- 组件、Token、Preview 或 UI Kit 变更如有可视 Preview，从当前任务 worktree 启动或复用本地 HTTP 服务，返回已核实且可点击的对应预览链接；不返回 GitHub Pages 预览链接。
- 工作流、守卫或纯文档维护没有可视入口时，只报告受影响范围和本地验证结果，不为满足形式强行生成预览。
- 工作流维护改动权威源后，必须即时执行文档漂移检查：按 sync-matrix.md 核对必改项，确认 rule-id 锚点、文件路径、命令示例与实际一致，跑验证后才推送。
- 允许按一组相关改动创建本地 checkpoint commit；小问题先本地累计，不为每个细节推送。组件、Token、Preview 或 UI Kit 完成一轮后默认只交付本地预览；只有用户明确要求推送 PR、更新 PR、在线预览，或工作流维护短周期收口时，才由 `wego-github-delivery` 推送远端分支并创建/更新同一 PR。
- 每次结果标明：`当前状态：本地迭代中（已推送，PR #<编号>）`；尚未推送时标明`当前状态：本地迭代中（未推送）`。

用户明确表达"验收通过""确认合格""可以合并"后，才进入合并；在此之前始终保持本地迭代：

<!-- rule-id: workflow-maintenance-exempt-from-submission-authorization -->
<!-- rule-id: workflow-maintenance-must-cleanup-after-merge -->
**工作流维护例外**：本技能执行的 AGENTS.md、SKILL.md、`references/` 和 `experience/` 等权威源维护，免明确提交授权门禁。完成改动并运行 `node scripts/validate-wego-design.mjs --scope=system --strict` 通过后，直接推送创建短周期 PR，必要检查通过后自动合并到 `main`，并立即由 `wego-github-delivery` 执行完整收口清理（停止对应预览服务并删除记录、删除本地与远端分支、删除干净的关联 worktree），不得只删分支而遗留 worktree；CI 失败时停止并报告原因等用户处理。组件、Token、Preview、UI Kit 变更不适用本例外，仍需用户明确验收授权后才能合并。

1. 完成全部必要同步，并运行 `node scripts/validate-wego-design.mjs --scope=system --strict`。
2. 确认 PR 已包含全部待合并改动；工作流权威源维护直接创建/更新短周期 PR。
3. 组件、Token、Preview 或 UI Kit 仍只交付本地 HTTP 预览；工作流和守卫维护不要求在线预览。
4. 设计系统变更等待用户明确验收通过后合并；工作流权威源维护免业务验收，必要检查通过后可按短周期 PR 自动合并。
5. 每次结果标明：`当前状态：已验收，合并中（PR #<编号>）`；工作流维护已自动合并时改为报告合并结果。

"改好了""继续""再调整一下"等普通反馈不构成验收授权，也不构成推送 PR 授权。PR 已存在时，后续小问题先回到本地迭代累计并交付本地预览；只有用户明确要求更新 PR/在线预览时才集中更新原 PR，不重复创建。

本地预览服务在本地迭代和等待合并期间保持运行，只在用户明确验收通过、任务废弃、PR 关闭或合并、worktree 即将清理，或被同一交付单元的新服务替换时停止并删除记录。正式设计系统源变化必须递增版本；收到设计系统缺口时先验证缺口，再采用正式能力或明确回退。只有用户确认升级的经验才修改正式能力。经验升级后保留事实、累计次数和升级历史；升级后再次出现时立即重新进入调整。守卫验证可观察的源码、结构化数据或运行结果，不校验文档固定措辞。
