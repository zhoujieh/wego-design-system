# 案例：开单场景"无法返回"（2026-08）

## 现象

工作台 → 收银开单 → 点页内返回按钮，画面不动或行为错乱。

## 排查过程（browser-use 脚本化）

1. 干净会话重放用户路径，逐步打印 `location.hash` / `history.length` / panel 数；
2. 发现进一次开单 `history.length` +2：除 `#/workspace-order-create` 外多出一条 `#/workspace` 幽灵条目；
3. 挂 `hashchange` 监听记录 oldURL => newURL，确认第一次变化是 EMPTY => `/workspace`，但无人调用过 navigate('workspace')；
4. 尝试 monkey-patch `location.hash` setter 抓调用栈（Location.prototype 描述符在 CDP 环境取不到，失败）；
5. 改查 DOM：`document.querySelectorAll('[data-host-tab="workspace"] [data-route-id]')` 发现场景根 `<section data-route-id="workspace" data-route-bound="true">` 被 bindRouteEntries 绑定了 click。

## 根因

- 场景模板根节点带 `data-route-id="workspace"` 仅作标识；
- 宿主 `bindRouteEntries` 给所有 `[data-route-id]` 绑点击 → 面板内任意按钮冒泡触发 `navigate('workspace')` 写入幽灵 hash；
- 历史变成 `[首页, #/workspace, #/workspace-order-create]`，ctx.back() 只退一条落到 `#/workspace`。

## 修复（wego-app/js/app.js）

1. bindRouteEntries 对 `config.entry.type === 'host-tab'` 的元素跳过绑定；
2. openScene 的 overlay 分支显式清 `pendingEntryPushed`
   （full-screen-modal 走 openOverlay 自管 history，不经 hashchange，不消费标记）。

## 回归验证清单

```text
干净会话（about:blank 起步，避免旧历史干扰）：
1. 工作台 → 开单           hash=#/workspace-order-create, histLen+1
2. 成功页 navigate          overlay 打开
3. 再开一单（ctx.back）     overlay 关闭, 开单 panel 仍在
4. 开单 [data-back]         hash 清空, 回工作台
5. 浏览器返回               不复活场景
6. 帮卖分销同样路径回归      通过
```

## 经验

- "无法返回"先怀疑历史账本（history.length 增量），再怀疑 UI；
- hashchange 日志（oldURL => newURL）比断点更直接定位谁写了 hash；
- browser-use 会话历史里残留的旧条目会让浏览器返回滑出目标页——每次验证前 goto about:blank 重置。
