---
name: "wego-scene-app-test"
description: WeGo App 业务场景自动化测试与回归。实现业务场景（scene.js/scene.css/业务运行时 js）改动后回归；验收前交付全量走查；业务场景相关 PR 验证与交互异常排查。触发词：业务场景测试/回归/验收、App 走查、发布产品测试、bu.click 排查、业务交互异常。
---

# WeGo App 业务场景自动化测试

## 触发条件
实现 WeGo App 业务场景（scene.js/scene.css/业务运行时 js）每轮改动后回归；验收前交付全量走查；业务场景相关 PR 验证；业务交互异常排查。

## 固定流程
0. 测试矩阵：先列矩阵（功能点 × 正常/边界/异常，含反例）再动手，测试更全。
1. 环境：启动本地预览服务；URL 加 cache-busting 参数绕 JS 缓存，确认加载最新版本再断言。[ev-026]
2. 进入场景：目标 routeId 的直链（#/route）与 overlay 两种入口模式都进入，行为差异都测。[ev-030]
3. 逐项测试：每条断言记「操作 + DOM 状态 + localStorage 校验 + 时间戳」证据链，结论可复核；localStorage 校验 key 命名、结构与写入时序，不只验证存在性。[ev-033]
4. 交互定位：先 dump DOM 核对选择器与层级（含 shadowRoot）；bu.click 命中失败换 elementFromPoint/坐标点击兜底，勿反复重试同一失败选择器。[ev-027]
5. 动态流等依赖 hashchange 重绘的页面，手动 dispatch hashchange 或走完整跳转动作后再断言。[ev-031]
6. 自评：本技能创建/增强后，用一次真实业务场景走查（如发布产品）验证能指导完整闭环再算生效。

## 交付前检查清单
- 证据链：每条断言已记操作+DOM+localStorage+时间戳，可复核。
- 置信度分级：先排除缓存/faultInjection 假象与浏览器合成事件，再判真实 bug；低置信度保持待确认，高置信度才修复。[ev-032]
- 双模式：直链与 overlay 入口都测；直链验证发布/取消后 hash 清理、模态不二次打开。[ev-030]
- 嵌套 overlay 关闭：选图/帮卖等子弹窗用内层 ctx 的 close，不用外层 closeOverlay 关宿主。[ev-029]
- 全程监听 pageerror / console.error，无页面报错。
- 每轮实现后回归通过、验收前全量通过，才交验收。

## 踩坑反例
- 浏览器加载旧 JS 致断言旧版本：先 cache-busting 绕缓存；CDP 禁用缓存在本环境不可用。[ev-026][ev-028]
- bu.click 命中失败：先 dump DOM 再改定位，勿盲目重试同一选择器。[ev-027]
- 嵌套 overlay 误用外层 closeOverlay 关掉宿主：修复用内层 ctx.close() 只关自身弹窗。[ev-029]
- 直链/overlay 双模式行为不同（hash 残留、模态二次打开）：双模式都测。[ev-030]
- 动态流仅改 location 不重绘：手动触发 hashchange 再断言。[ev-031]
- faultInjection 注入表现为失败假象：先排除环境假象再判真实 bug。[ev-032]
- localStorage 只查存在性易误判：校验 key 命名、结构与写入时序（防抖落盘有延迟）。[ev-033]
