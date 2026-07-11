---
name: "wego-tests"
description: 按原型定稿后完成正式化的业务迭代验收 wego-app 关联场景，比较 interaction_spec、design_plan、正式规则来源和真实实现，输出 acceptance_report，并在通过后生成开发交接和冻结记录。用于验收、回归、review、浏览器交互检查、布局检查和交付就绪判断；不要在原型未定稿或场景未生成时使用，也不要把验收问题直接沉淀为正式工作流规则。
---

# Wego Tests

负责证明场景是否真实承接需求与设计，并把问题归因到最早做错决定的环节。

## 顶层版本门禁

- 只验收当前业务迭代 Schema，固定为 `schemaVersion: 2`。
- 发现旧 Schema、旧规格字段、旧文件名、旧命令或兼容读取路径时直接失败。
- 验收报告必须明确记录兼容逻辑扫描结果；存在任一兼容分支不得判定通过。

## 前置门禁与读取顺序

必须存在并读取：

1. 仓库根目录 [AGENTS.md](../../../AGENTS.md)。
2. 状态为 `implemented` 的当前业务迭代和 [业务迭代契约](../wego-product/references/iteration-workflow.md)，且存在未漂移的 `prototype_confirmation`。
3. 所有相关场景 `_spec/interaction_spec.json`。
4. 所有相关场景 `_spec/design_plan.json`。
5. `rule_sources_used` 指向的正式组件、pagePattern、fallback、Token 和 Preview。
6. 当前 scene、路由、宿主、资源和真实交互状态。
7. 构造或校验报告时读取 [acceptance-report.md](references/acceptance-report.md)。
8. 验完整业务路径或专项规则时读取 [acceptance-checks.md](references/acceptance-checks.md)。
9. 做布局、键盘、交互或线上验证时读取 [browser-verification.md](references/browser-verification.md)。

原型期只支持供用户定稿的真实交互检查，不输出正式验收、开发交接或冻结。定稿后缺少规格、场景未注册、设计仍有 gap、原型快照漂移或发现旧版本输入时直接失败。

## 核心规则

- 验收必须同时比较需求、设计计划、正式规则来源和当前实现。
- `acceptance_report` 必须使用 `rule_source_check`。
- 问题必须归因到最早产生错误决定的工作流环节。
- 正常路径、空内容、长内容、重复操作、中断操作、失败状态、键盘焦点和返回恢复按需求必要性一起验证。
- 只有真实执行过的脚本、浏览器检查、提交、推送和部署结果才能写入报告。
- 必须检查仓库内是否仍存在 v1/v2 双轨、旧文件回退、旧字段兜底、双写、命令别名或静默迁移。

## 验收流程

1. 校验当前 Schema、迭代、原型定稿快照、两份规格、readiness、surface、route 和设计缺口。
2. 运行 `iteration-record.mjs start-testing`。
3. 建立 requirement → design → rule source → implementation 覆盖关系。
4. 检查 DOM、组件、Token、布局、presentation、路由和稳定 ID。
5. 从真实入口执行正常、异常、中断、重复与返回恢复路径。
6. 用浏览器量测布局、覆盖层、键盘和滚动；保存真实证据。
7. 运行自动化守门并记录命令、退出码、错误和 warning。
8. 扫描兼容逻辑残留；存在残留直接 fail。
9. 落盘 `acceptance_report`；若需修复，回到对应技能后重新验收。

## 必查项

### 需求与设计覆盖

- flows、nodes、surfaces、content、transition、handoff、boundary 和 route 引用闭合。
- 每个非 excluded 节点被设计和实现覆盖。
- 没有私自增加业务字段、入口、状态或层级。
- `readiness`、assumptions 和 open questions 与实现范围一致。

### 规则来源

- 使用 `rule_sources` 和 `rule_sources_used`，不存在 `spec_refs*`。
- pagePattern、布局、presentation 和组件映射能定位真实来源。
- 未命中来源、生成文档或不存在路径不得进入规则来源。

### 版本与兼容

- `schemaVersion` 只能为 2。
- 不存在 `schemaVersion: 1`、`isV1`、`V1_*`、`v1` 状态机分支。
- 不存在旧文件 `page_spec.json`、`design_consumption_plan.json` 的运行时读取。
- 不存在旧字段 `page_surfaces`、顶层 `route_id` 的回退读取。
- 不存在 `scope → confirm-scope` 旧命令执行路径。
- 不存在新旧双写、自动迁移或 deprecated 路径继续可用。

### UI Kit、布局和组件

- exact/near/fallback/gap 与实际依据一致。
- M0/M8/M16/M32 的 padding、背景和容器满足计划。
- 主区域在空内容和短内容下仍占满可用宽度。
- Token、组件类、分组容器和变体均已注册。
- 新任务不在 `component_mapping.selected` 中放 DOM 或 CSS 类。

### App、路由与打开方式

- `wego-app/index.html` 是唯一宿主。
- 每个 route 唯一、稳定并映射正确 surface。
- scene 使用 `registerScene()`。
- 不使用 fetch、XHR、外链或 `location.href` 加载本地 scene。
- presentation、动画、关闭方式、overlay 层级和 Tab 覆盖一致。

### 真实交互与视口

- 输入、选择、开关、筛选、保存、取消、删除和创建产生可见状态变化。
- 成功、失败、空态、禁用和中断按规格出现。
- 数据回填、reset policy、重复操作和返回恢复正确。
- 输入聚焦后导航固定、内容可见、无双层滚动。

## 自动化守门

至少运行：

```bash
node scripts/specs.mjs check
node scripts/specs.mjs test
node scripts/validate-wego-design.mjs
```

全局审查、跨技能规则变化或正式合并前使用严格范围。自动化通过不替代人工语义和体验验收。

## 状态判定

- `pass`：全部必查项通过且兼容逻辑扫描为零。
- `pass-with-risk`：需求完成，只有明确、不影响当前结果的验证边界；兼容逻辑不允许作为风险保留。
- `fail`：存在硬门禁错误、关键路径失败、自动化错误、规格偏差或任何兼容逻辑。

## 开发交接与冻结

- `wego-tests` 是开发交接文档的唯一输出技能。
- `fail` 不得生成交接。
- 所有相关报告通过后运行 `iteration-record.mjs handoff`，随后运行 `freeze`。
- 冻结后不得覆盖；后续业务变化建立新迭代。

## 禁止事项

- 不只看截图、只跑正常路径或只相信自动化。
- 不编造浏览器、真机、推送、部署或线上结果。
- 不把生成文档当验收规则。
- 不允许任何旧版本兼容逻辑通过验收。