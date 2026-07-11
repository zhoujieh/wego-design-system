# 同步、验证与交付

资源同步、本地验证、提交、推送或部署时读取。

## 资源同步

设计系统源位于 `.codex/skills/wego-design/`，`wego-app/lib/` 只是部署副本。修改 Token、组件样式、图标或图片后执行：

```bash
node scripts/sync-wego-app-lib.mjs
node scripts/sync-wego-app-lib.mjs --check
```

## 本地直开

`wego-app/index.html` 通过相对路径加载资源，不依赖 npm、构建框架、fetch 或 XHR。电脑端显示手机壳，移动端同链接铺满 viewport。

## 本地服务器

按仓库根目录 `AGENTS.md` 使用自动退出或显式清理包装；开始和结束都检查残留 `http.server`，不得留下脱离会话的后台进程。

## 交付状态

- `success`：推送成功且 Production 部署已核实 Ready。
- `pending`：推送成功但未核实 Ready。
- `degraded-local`：推送或部署失败，保留本地入口。
- `not-run`：用户不要求或流程未进入部署。

只报告实际执行结果。正式交付时显式暂存路径，不使用无范围的 `git add -A`。
