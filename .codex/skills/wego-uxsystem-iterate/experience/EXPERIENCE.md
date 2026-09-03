# 经验视图

> 一句话教训索引，细节毕业到 wego-scene-* 场景技能，原始事实见 evidence.json。会话前置读取。

§
[简报] spec 更新后提交前全文搜索统一旧描述；入口写清触发方式/对象/按钮层级/后续行为，不明点入 open_questions。[ev-001, ev-004] ×2，最近 2026-08-28
§
[实现] 新存储先 grep 盘点 key 按 wego.{domain}.{entity} 命名不迁移旧 key；切图偏移且不裁剪用 img 标签定位，路径相对 index.html。[ev-002, ev-007] ×2，最近 2026-08-28
§
[元规则] 经验沉淀先写 evidence.json 事实再写摘要并跑校验；权威入口/操作指令文件路径写仓库根完整路径。[ev-003, ev-005, ev-014] ×3，最近 2026-09-03
§
[组件] modal fullscreen 改居中须场景级恢复蒙层、z-index 提到 --z-modal、改淡入与居中。[ev-006] ×1，最近 2026-08-28
§
[设计稿] Figma 还原前必须确认设计稿内容，无法访问请用户描述/给切图，禁止凭组件名猜样式。[ev-008] ×1，最近 2026-08-28
§
[交付] PR 合并后清理本地分支/worktree/预览记录，异步合并由启动巡检兜底；推送 PR 等 publish 通过并 curl 校验产物；验收后核实 PR 已 MERGED。[ev-009, ev-013, ev-016] ×3，最近 2026-09-03
§
[元规则] 免验收短周期 PR 只限纯文档规则；工具改动产出用户可见内容仍须验收。[ev-010] ×1，最近 2026-09-01
§
[CI] 改 design/runtime 须同步 lib 副本（sync 仅 --check 只读）；Pages 预览标红多为部署延迟，先比对 .wego-deployment-sha。[ev-011, ev-012] ×2，最近 2026-09-02
§
[结构] 业务场景功能不入技能目录/设计系统权威源，全局业务运行时放 wego-app/js 与 wego-app/css，由 runtime.business_file 守卫拦截。[ev-015] ×1，最近 2026-09-03
§
[走查] 走查工具 5 项交互验收测回显+撤销重做+刷新持久化；长拖动手动 dispatch、先 dump shadow DOM 等坑见 wego-scene-walkthrough-test。[ev-017, ev-020, ev-024] ×9，最近 2026-09-03
§
[走查] App 场景走查：绕 JS 缓存、bu.click 失败先 dump DOM、嵌套 overlay 用内层 close 不用外层 closeOverlay、直链/overlay 双模式都测并验 hash 清理、动态流测 hashchange 重绘、排除 faultInjection 假象再判 bug、localStorage 断言校验结构时序；详见 wego-scene-app-test。[ev-026, ev-029, ev-030, ev-032] ×8，最近 2026-09-03
§
[元规则] EXPERIENCE.md 超限控容优先合并同类、细节毕业场景技能，不逐字压缩。[ev-034] ×1，最近 2026-09-03
