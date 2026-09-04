---
name: "wego-scene-app-test"
description: WeGo App 业务场景分层测试。业务场景 scene.js/scene.css/业务运行时 js 改动后做轻量回归，交付节点做本地关键路径，终局验收前做全量走查；用于 App 走查、业务交互异常、bu.click 排查。
---

# WeGo App 业务场景自动化测试

## 触发条件
实现或修改 WeGo App 业务场景后回归；到达交付节点、终局验收或业务交互异常排查时按层级加深测试。

## 固定流程
0. 定层级：本地小改=轻量冒烟；交付节点/PR 更新=本地关键路径；终局验收=全量走查。
1. 环境：启动或复用本地预览；URL 加 cache-busting 参数，确认加载最新版本再断言。[ev-026]
2. 轻量冒烟：只测本次改动直达 route、主操作是否可用、无 pageerror/console.error；证据记关键操作、可见 DOM 结果和时间戳。
3. 本地关键路径：覆盖本次影响的正常/边界/异常路径；涉及存储时核对 key 命名、结构与写入时序，不只验证存在性。[ev-033]
4. 全量走查：终局验收前才同时测直链（#/route）与 overlay 入口；核对发布/取消后 hash 清理、模态不二次打开等差异。[ev-030]
5. 排查定位：先 dump DOM 核对选择器与层级（含 shadowRoot）；bu.click 命中失败换 elementFromPoint/坐标点击兜底，勿反复重试同一失败选择器。[ev-027]
6. 动态流等依赖 hashchange 重绘的页面，手动 dispatch hashchange 或走完整跳转动作后再断言。[ev-031]

## 交付前检查清单
- 层级匹配：小改只需轻量冒烟；PR 更新前完成本地关键路径；终局验收前完成全量走查。
- 证据链：交付节点开始记录操作+DOM+必要 localStorage+时间戳；小改不强制逐项完整证据。
- 置信度分级：先排除缓存/faultInjection 假象与浏览器合成事件，再判真实 bug；低置信度保持待确认，高置信度才修复。[ev-032]
- 双模式：仅终局验收或入口模式相关改动必须直链与 overlay 都测。[ev-030]
- 嵌套 overlay 关闭：选图/帮卖等子弹窗用内层 ctx 的 close，不用外层 closeOverlay 关宿主。[ev-029]
- 全程监听 pageerror / console.error，无页面报错。
- 发现真实缺陷先修复并复验同层级用例，通过后再交付。

## 踩坑反例
- 浏览器加载旧 JS 致断言旧版本：先 cache-busting 绕缓存；CDP 禁用缓存在本环境不可用。[ev-026][ev-028]
- bu.click 命中失败：先 dump DOM 再改定位，勿盲目重试同一选择器。[ev-027]
- 嵌套 overlay 误用外层 closeOverlay 关掉宿主：修复用内层 ctx.close() 只关自身弹窗。[ev-029]
- 直链/overlay 双模式行为不同（hash 残留、模态二次打开）：双模式都测。[ev-030]
- 动态流仅改 location 不重绘：手动触发 hashchange 再断言。[ev-031]
- faultInjection 注入表现为失败假象：先排除环境假象再判真实 bug。[ev-032]
- localStorage 只查存在性易误判：校验 key 命名、结构与写入时序（防抖落盘有延迟）。[ev-033]
