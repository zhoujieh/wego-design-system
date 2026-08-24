---
name: wego-preview-acceptance
description: 起微购本地预览或验收场景改动时使用：hash 直达路由、预览面板限制与验证优先级。
---

# 微购预览验收操作要点

## 起服务

仓库是纯静态原型，无需构建：

```bash
python3 -m http.server 8788 --directory <worktree>/wego-app
```

先 `curl` 确认 HTTP 200，再交付链接。

## 打开场景：必须直达 hash 路由

打开页面一律用带 hash 的完整地址：`http://127.0.0.1:<port>/index.html#/<route-id>`（route-id 取场景 route.json）。

**不要**在预览面板里靠点底部导航 tab 切场景：hash 路由已激活时再点同一 tab 不会重新挂载场景、预览面板 elements 也无增量，容易陷入反复点击同一路由的死循环。

## 重走进入流程（加载态 / 失败分支）

用 reload 或改 URL 让路由重新挂载；不要反复点击已激活的 tab。localStorage 注入的状态跨 reload 保留时先清理再验证。

## 交互验证优先级

1. 代码 diff 审查为主证据。
2. 静态守卫兜底：`node scripts/validate-scene-runtime.mjs "<中文场景目录>"` 与 `validate-scene-contract.mjs`（Node 由 nvm 管理，需补 PATH；目录名含中文加引号）。
3. browser-use 连用户 Chrome 需用户手动授权弹窗，未授权前不反复重试，改静态验证并说明哪些路径需人工验收。
4. AGENTS.md 含 `<!-- rule-id -->` 注释会被注入过滤器拦截，read_file 读不到时用终端 cat。

## localStorage 持久化类改动的审查模式

- 失败分支必须检查「内存已变更但 persist 失败」的回滚对称性（push 后 save 失败未回滚 = 脏数据可能被后续操作连带落盘）。
- setTimeout 加载态检查定时器可否被重复触发、是否需清理。
- spec.md 文档与 iteration.json 简报可能漂移，以 iteration.json 为准并指出文档回归。
