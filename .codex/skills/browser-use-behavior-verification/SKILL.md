---
name: browser-use-behavior-verification
description: 用 browser-use 做前端路由/导航行为回归验证时使用：会话重置、断言三件套、hash 排查技巧。
---

# browser-use 行为验证

对 hash 路由 SPA（微购 wego-app 等）做页内导航 vs 浏览器返回一致性验证时使用。

## 会话卫生

- 每轮验证前 `goto_url('about:blank')` 重置：浏览器会话残留的旧历史条目会让 history.back() 滑出目标页，被误判为目标站的 bug。
- 入口元素可能异步挂载：click 前轮询等待，找不到时先确认场景面板已渲染（如 `.business-home` 存在）。

## 断言三件套

每条路径后取并记录：
1. `location.hash`
2. 场景 panel 数：`document.querySelectorAll('.app-scene-layer__panel').length`
3. 是否滑出站点：对比 `location.href`

注意：JS 里同步读 `location.hash` 可能跑在 hashchange 派发之前，sleep 300-800ms 后再断言。

## 排查"谁写了 hash"

- 挂监听记录轨迹：`window.addEventListener('hashchange', e => log.push(e.oldURL.split('#')[1] + ' => ' + (e.newURL.split('#')[1] || 'EMPTY')))` —— 比 debugger 直接，能看到幽灵条目首次出现的位置。
- 同时观察 `history.length` 增量：一次导航涨 2 条 = 有重复写入。
- monkey-patch location.hash setter 抓调用栈在 CDP 环境不可靠（Location.prototype 描述符常取不到），不要走这条路。
- 查 DOM 归属：事件冒泡类问题用 `querySelector('[data-host-tab=X] [data-route-id]')` 找被误绑的容器元素（检查 `data-route-bound` 属性）。

## 已知陷阱速查

- 直接改 `location.hash`（不经应用 navigate()）= 直达链接语义，是验证兜底分支的快捷手段；
- 场景根节点带 `data-route-id` 标识会被入口绑定逻辑误绑点击 → 冒泡写幽灵 hash；
- overlay 型场景自管 history 不经 hashchange，验证其关闭要查 `[data-overlay-layer]` 状态而非 panel 数。
