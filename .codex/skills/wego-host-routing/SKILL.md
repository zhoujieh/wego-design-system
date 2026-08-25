---
name: wego-host-routing
description: 审查 wego-app 路由与返回行为一致性时使用：统一返回语义、幽灵历史、直达兜底、回归清单。
---

# 微购宿主路由与历史语义

审查 `wego-app/js/app.js` 路由机制（页内导航 vs 浏览器返回一致性）、
改 push 场景返回行为、或排查"场景复活/地址与画面脱节"类缺陷时使用。

## 架构事实

1. **push 场景栈 `sceneStack`**：entry 记 `{ routeId, host, scene, historyPushed }`。
   `historyPushed=true` = 该历史条目由 `navigate()` 置位 `pendingEntryPushed`
   后经 hash 推入；`#/route-id` 直达链接进入时为 false。
2. **overlay 栈**：每层独立 `pushState({wegoOverlay})`，popstate 逐层关闭。
3. **hashchange handler**：用 `event.oldURL` 提取前一个 routeId，配合
   `poppingRouteIds`（退场中的场景集合）判断该次 hash 变化是否已被本地处理。

## 统一返回语义（2026-08 改造后，勿回退）

- **ctx.back() 且 historyPushed=true**：先本地带动画 `popSceneLayer(null, true)`，
  再 `history.back()` 消费同一条历史；随后的 hashchange 因 poppingRouteIds 跳过，
  不会误弹下层。页面内返回与浏览器返回操作同一条账本。
- **直达链接进入后 ctx.back()**：无 App 推入的历史可消费 → 本地弹出 +
  `replaceState` 抹掉当前 hash。**不是 pushState**——旧实现 pushState 留下幽灵
  条目，浏览器返回会把已关场景"复活"。
- **场景内禁止裸调 `history.back()`**：直达场景下会甩出页面，一律 `ctx.back()`
  （帮卖分销 scene.js 曾犯此错）。

## bindRouteEntries 陷阱：host-tab 容器不是入口（2026-08 修复，勿回退）

场景模板根节点常带 `data-route-id="<tab路由>"` 作标识（如工作台 `<section data-route-id="workspace">`）。
`bindRouteEntries` 若不跳过 host-tab 型容器，面板内任何按钮的点击冒泡都会触发
`navigate(tab路由)`，往历史里塞幽灵条目，导致 push 场景 ctx.back() 落到错误位置、
表现为"无法返回"。修复：对 `config.entry.type === 'host-tab'` 的元素直接 return 不绑 click。

同类陷阱：`pendingEntryPushed` 只被 openPushScene 消费；overlay 型场景
（sheet / full-screen-modal）走 openOverlay 自管历史不经 hashchange，
必须在 openScene 的 overlay 分支显式清标记，否则残留污染下一个 push 场景的返回判断。

## 常见缺陷模式（审查时对照）

- 返回只清画面不清账本 → 幽灵历史条目复活场景；
- 只在"栈空时"才对齐 URL → 中间层返回后 hash 与画面脱节，刷新/分享出错；
- 入口路由写 hash、tab 切换 replaceState 抹 hash → 同一页面两种进法返回行为不同；
- 动画退场依赖 transitionend 无兜底 → 事件丢失后整条导航链卡死；
- 场景根节点 data-route-id 被误绑入口点击 → 幽灵 hash 条目（见上节）。

## 行为回归验证清单（browser-use 可脚本化）

每条路径断言 `{hash, panel 数, 是否滑出站点}`：
1. 入口进入 → 页内返回 → 浏览器返回：不复活、hash 空、不离开；
2. 浏览器直接 back：正常关场景消费 hash；
3. 直达链接 → 页内返回：本地清理不甩出；
4. 快速连点返回：只弹一次；
5. 场景中切 tab 后浏览器返回：无残留。

调试技巧：直接改 `location.hash`（不经 navigate()）= 直达语义
（historyPushed=false），是验证兜底分支的快捷手段。
详细案例与调试脚本见 [references/case-order-scene-back-bug.md](references/case-order-scene-back-bug.md)。
静态守卫：`node scripts/validate-scene-runtime.mjs "wego-app/scenes/<场景>"`
（Node 需补 nvm PATH）。「我的」场景 `overlay_not_exercised` 报错系历史遗留。
