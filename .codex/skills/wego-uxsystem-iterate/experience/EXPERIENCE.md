# 经验视图

> 从经验库自动提炼的高频高价值经验，会话前置读取。手动编辑会被下次提炼覆盖。

## 数据库接入规则（shop243 沉淀）

**问题**：新任务接入 localStorage 时，各场景各自为政，key 命名不统一，存在冲突风险，可能导致场景无法正常运行。

**规则**：
1. 新任务开工前必须先 `grep` 全仓库现有 `wego.*` localStorage key，列出现有 key 清单
2. 新功能必须用新 key，遵循 `wego.{domain}.{entity}` 命名规范，禁止复用或修改现有 key
3. WegoApp.db 只是统一封装层（get/set/push/remove），不改变现有 key 和数据格式，不做自动迁移
4. 现有场景不迁移，继续用各自的读写方式；新场景走 WegoApp.db 统一接口
5. 数据格式约定：数组结构统一带 id 字段，时间戳用 ISO 字符串，布尔字段明确命名

**现有 key 清单（截至 shop243）**：
- `wego.album-feed.published` — 动态页发布的动态
- `wego.friend-list.friends` — 好友列表
- `wego.fault-switch.enabled` — 故障注入开关
- `wego.walkthrough.data.` — 新手引导
- `wego.wgf-position` — 位置数据

**后续**：数据库接入规范应沉淀到 wego-uxsystem-iterate 的设计系统消费规则中，作为所有新任务的强制守卫。
