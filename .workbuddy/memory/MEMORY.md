# wego-design-system 长期备忘

## 报价单项目（shop244 导出报价单）
- 位置：场景 `wego-app/scenes/shop/导出报价单/`（routeId=quote-export），独立 worktree `.tasks/worktrees/export-quote`，分支 `feat-add-export-quote-UzxOaG`。
- 接手任何任务先查 `git worktree list` 和 `.tasks/`（交付单元不共用主 worktree），再读对应场景 `_iterations/*/阶段推进文档.md`。
- 用户约定的范围裁剪：报价单分享导出不做图片格式；Web 端生成文件后直接下载，不走系统分享。
