# 微购技能路由

| 用户意图 | 技能 |
| --- | --- |
| 新业务需求、页面、流程或业务范围变化 | `wego-product` |
| 已确认范围内的页面设计与实现 | `wego-design` |
| 组件、Token、Preview、UI Kit、消费规则、守卫或工作流维护 | `wego-uxsystem-iterate` |
| 分支、PR、本地迭代预览、合并或交付分支清理 | `wego-github-delivery` |

## 场景技能（主链路技能的子技能）

`wego-scene-*` 是经验毕业产生的场景技能，沉淀某类任务的固定流程、交付前检查清单与踩坑反例，由对应主链路技能在命中场景时按需读取；它不承接业务阶段路由、不新增主链路节点。场景技能的创建与维护统一由 `wego-uxsystem-iterate` 承担（同场景 ×2 或流程固定才允许创建），毕业标准、四段结构与三重挂载规则见 `wego-uxsystem-iterate/references/workflow-iteration.md`。

已登记场景技能：

| 技能 | 触发场景 | 主挂载 |
| --- | --- | --- |
| `wego-scene-walkthrough-test` | 走查工具自动化测试/回归/验收/排查（改走查 js/css 后回归、5 项交互验收、走查相关 PR 验证） | `wego-uxsystem-iterate`（副 `wego-design`） |

## 输入形态一律先走产品技能

无论用户以哪种形态提出需求，都视为**业务需求**，必须先由 `wego-product` **创建迭代并确认 `prototype_brief`**，再进入 `wego-design` 实现。不得跳过产品技能直接做页面：

- **自然语言需求**：用户用语言描述要做什么。
- **参考图（截图/草图）**：仅作风格参考；图中缺失的业务逻辑、状态、数据须由对话补全。
- **Figma 设计稿**：仅作视觉/组件参考，**不代表需求已确认**；流程、状态、数据来源与边界仍须在简报中确认。

> 迭代必须先创建并确认简报。`Figma` 与参考图不用于补造业务事实。

```text
需求（自然语言 / 参考图 / Figma）
  → wego-product 创建迭代并确认 prototype_brief
  → wego-design 在本地迭代并提供本地与在线预览
  → 用户持续反馈小问题，改完自动更新同一 PR
  → 用户明确验收通过
  → 固化指纹 + 完整静态验证 + 合并进 main
```

> 不同迭代阶段（in-development / prototyping / frozen）的反馈处理方式见 `wego-product/references/iteration-workflow.md`。

同一需求复用当前未冻结迭代；简报变化按产品技能重新提交并确认。设计阶段只消费现有正式能力；组件、规范或系统问题由用户在原型验收时提出，再交给 `wego-uxsystem-iterate`。

分支、worktree、预览和 PR 由 `wego-github-delivery` 统一管理。新任务默认创建或复用工作分支并进入本地迭代；完成一轮实现并通过本地验证后**自动推送并更新同一 PR**，同时返回本地与在线两个链接；合并进 `main` 必须用户明确验收通过。它不再是第四条业务主链路。各技能只按当前任务读取各自入口直接引用的权威来源。
