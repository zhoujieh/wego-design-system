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
