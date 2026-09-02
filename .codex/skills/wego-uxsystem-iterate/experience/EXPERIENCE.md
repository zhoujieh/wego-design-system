# 经验视图

> 由 AI 基于 evidence.json 事实推理维护，每条经验必须追溯到事实事件，表述不得与事实矛盾。会话前置读取。

§
[工作流] Spec 多轮更新后必须全文检查前后一致性：spec 全部确认后、提交 submit-brief 校验前，必须全文搜索关键词（如入口名、操作方式、功能名）统一检查，替换所有旧描述，确保各模块表述一致后再提交。[ev-001] ×1，最近 2026-08-28
§
[工作流] 新任务接入本地存储前必须盘点现有 key 并遵循命名规范：新任务开工前必须 grep 全仓库现有 wego.* localStorage key 并列清单；新功能必须用新 key，遵循 wego.{domain}.{entity} 命名规范；WegoApp.db 只是统一封装层，不改变现有 key 和数据格式，不做自动迁移；现有场景不迁移，新场景走统一接口。[ev-002] ×1，最近 2026-08-28
§
[工作流] 经验沉淀必须走标准流程，禁止脚本机械化生成：遇到用户纠正、返工、踩坑等触发信号时，先写入 evidence.json 事实事件，AI 阅读事实后推理归纳，直接写入 EXPERIENCE.md（用 section 符号分隔多条），再运行 node scripts/refine-experience.mjs --check 校验事实一致性。禁止用脚本从结构化数据模板生成 EXPERIENCE.md。[ev-003, ev-005] ×2，最近 2026-08-28
§
[工作流] Spec 入口逻辑必须明确触发方式和对象，避免理解偏差：写 spec 入口部分时，每条入口必须明确①触发方式（点击/长按/滑动）②触发对象（自己的/别人的/特定类型）③按钮位置和层级④后续行为。不明确的点列入 open_questions，不凭猜测写入正文。[ev-004] ×1，最近 2026-08-28
§
[组件使用] modal fullscreen 变体用于居中弹窗时必须覆盖蒙层和 z-index：modal 组件的 fullscreen 变体默认无蒙层（::before display:none）、z-index 用 --z-raised:10（低于导航栏的 100）、面板从底部 translateY 滑入、容器底部对齐。若用于居中弹窗（如灰度升级弹窗），需场景级覆盖：恢复 ::before 蒙层显示、z-index 提升到 --z-modal:600、面板动画改 scale+opacity 淡入、容器 align-items 改 center。[ev-006] ×1，最近 2026-08-28
§
[实现方式] 切图需要偏移且不裁剪时用 img 标签而非 CSS 背景图：CSS 背景图用 background-position 偏移后，超出容器部分会被 background-clip 裁剪，overflow:visible 对背景图无效。若切图需要偏移且完整显示（如顶部插画往上偏移 N px），应改用 img 标签 + 容器 overflow:visible + img position:relative; top:-Npx。注意 img src 路径相对于 HTML 页面解析而非 CSS 文件，场景内图片需写相对于 index.html 的路径（如 scenes/shop/xxx/assets/yyy.png）。[ev-007] ×1，最近 2026-08-28
§
[工作流] 涉及设计稿还原的任务必须先确认设计稿内容再实施：用户提供 Figma 设计稿链接后，不能凭组件名或常见模式猜测设计稿内容（如把居中弹窗误认为底部 sheet 样式）。若无法直接访问 Figma 内容，必须请用户描述关键样式（布局方式、蒙层有无、动画方向、间距数值、切图位置）或提供切图，确认后再实施，禁止凭猜测直接写代码。[ev-008] ×1，最近 2026-08-28
§
[工作流] 工作流维护免验收例外只适用于文档/规则类内容，涉及可视输出的工具改动仍须用户验收：wego-uxsystem-iterate 权威源维护中，AGENTS.md、SKILL.md、references/、experience/ 等纯文档/规则（用户无法直观验收的内容）验证通过可直接走短周期 PR 合并；但 walkthrough-tool.js 这类会产出施工单、预览等用户每日查看的可视内容的工具改动，不适用免验收例外，必须先推送 PR 保留待用户验收，用户确认后再合并。判断边界：改的是"用户能直接看到效果的内容"就要验收。[ev-010] ×1，最近 2026-09-01
§
[工作流] 业务组件运行时改动必须同步权威源与 lib 副本：改 .codex/skills/wego-design/runtime/*.js 后必须同步 wego-app/lib/js/ 对应副本，严禁只改 lib 副本（会触发 CI 同步一致性检查失败）。注意 scripts/sync-wego-app-lib.mjs 仅 --check 是只读校验，默认/--json 均为写入模式（清空再复制），误当 dry-run 运行会覆盖 lib 副本丢失业务改造；核对一致性用 --check，回灌方向错误时先确认哪个版本正确再覆盖。[ev-011] ×1，最近 2026-09-02
§
[工作流] GitHub Pages 部署延迟会导致 Pages Preview 误报标红：构建与 push gh-pages 均完成后，Verify published URL 在 90 秒内等不到部署生效即判定未就绪，但预览实际最终部署完成。已放宽验证等待窗口至 36 次×10 秒≈6 分钟（PR #156 合入 main）；排查时先 curl 预览 URL 的 .wego-deployment-sha 与 CI 期望 sha 比对，一致即部署完成，勿误判为构建异常。[ev-012] ×1，最近 2026-09-02
§
[工作流] 每次推送 PR 后必须返回在线预览链接，且等部署完成再交付：规则虽已写"返回本地与在线两个链接"，但执行断点在在线部署延迟（publish CI + GitHub Pages 排队，推送后在线链接不能立即可用），导致只给本地链接、漏补在线链接。推送后须等 publish 通过并 curl 校验 previews/pr-N 部署产物（.wego-deployment-sha 一致、入口 200）后再返回在线链接；未就绪时明确告知等待状态并补齐，不得只交付本地链接。[ev-013] ×1，最近 2026-09-03
