---
name: "wego-tests"
description: 按已确认业务迭代验收 wego-app 关联场景，比较 interaction_spec、design_plan、正式规则来源和真实实现，输出 acceptance_report，并在通过后生成开发交接和冻结记录。用于验收、回归、review、浏览器交互检查、布局检查和交付就绪判断；不要在场景未生成时使用，也不要把验收问题直接沉淀为正式工作流规则。
---

# Wego Tests

负责证明场景是否真实承接需求与设计，并把问题归因到最早做错决定的环节。

## 前置门禁与读取顺序

必须存在并读取：

1. 仓库根目录 [AGENTS.md](../../../AGENTS.md)。
2. 状态为 `implemented` 的当前业务迭代和 [业务迭代契约](../wego-product/references/iteration-workflow.md)。
3. 所有相关场景 `_spec/interaction_spec.json`。
4. 所有相关场景 `_spec/design_plan.json`。
5. `rule_sources_used` 指向的正式组件、pagePattern、fallback、Token 和 Preview。
6. 当前 scene、路由、宿主、资源和真实交互状态。
7. 构造或校验报告时读取 [acceptance-report.md](references/acceptance-report.md)。
8. 验完整业务路径、兼容迁移或专项规则时读取 [acceptance-checks.md](references/acceptance-checks.md)。
9. 做布局、键盘、交互或线上验证时读取 [browser-verification.md](references/browser-verification.md)。

缺少规格、场景未注册、设计仍有 gap 时直接失败并归因到上游。不得用截图或 `docs/specs/*.md` 代替正式依据。

业务迭代验收必须按 `requirement_id` 覆盖全部非 excluded 需求；`iteration_context`、`scope_revision` 或上游指纹不一致时停止并返回最早失效环节。

## 核心规则

- 验收必须同时比较需求、设计计划、正式规则来源和当前实现，不能只看页面截图或自动化结果。
- `acceptance_report` 必须使用 `rule_source_check`，每个关键设计和实现决定都能追溯到真实文件与字段。
- 问题必须归因到最早产生错误决定的工作流环节，不能根据最后修改的文件或表面组件名称归因。
- 正常路径、空内容、长内容、重复操作、中断操作、失败状态、键盘焦点和返回恢复按需求必要性一起验证。
- 只有真实执行过的脚本、浏览器检查、提交、推送和部署结果才能写入报告。

## 验收流程

1. 校验迭代、两份规格、readiness、surface、route 和设计缺口，通过后运行 `iteration-record.mjs start-testing`。
2. 建立 requirement → design → rule source → implementation 的覆盖关系。
3. 检查 DOM、组件、Token、布局、presentation、路由和稳定 ID。
4. 从真实入口执行正常、异常、中断、重复与返回恢复路径。
5. 用浏览器量测布局、覆盖层、键盘和滚动；保存真实证据。
6. 运行自动化守门并记录命令、退出码、错误和 warning。
7. 把 finding 归因到最早环节，确定 pass、pass-with-risk 或 fail。
8. 落盘 `acceptance_report`；若任务要求修复，回到对应技能修复后重新验收。

## 验收范围

默认验当前场景、route、入口和本次直接影响的宿主或设计系统资源。用户要求全局审查，或变更跨场景宿主能力时，扩大到全部受影响场景、公共交互、模板、结构化规则和资源同步。

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

### UI Kit、布局和组件

- exact/near/fallback/gap 与实际依据一致。
- M0/M8/M16/M32 的 padding、背景和容器满足计划。
- 主区域在空内容和短内容下仍占满可用宽度。
- Token、组件类、分组容器和变体均已注册。
- 新任务不在 `component_mapping.selected` 中放 DOM 或 CSS 类。
- `component_patterns`、`region_composition` 和 mapping 职责分离。

`layout_check` 必须做多层视觉实测：检查宿主到 scene 的 padding 链路、同层级像素对齐、间距与 `page_strategy` 一致性，以及实际截图；只有无宿主嵌套的单卡片简单页可退化为溢出检查。

### App、路由与打开方式

- `wego-app/index.html` 是唯一宿主。
- 每个 route 唯一、稳定并映射正确 surface。
- scene 使用 `registerScene()`，入口在 `.phone-screen` 内打开。
- 不使用 fetch、XHR、外链或 `location.href` 加载本地 scene。
- presentation、动画、关闭方式、overlay 层级和 Tab 覆盖一致。
- 多 surface 独立核对 `coversTabBar`；push 栈、overlay 和返回语义正确。

### 真实交互与视口

- 输入、选择、开关、筛选、保存、取消、删除和创建产生可见状态变化。
- 成功、失败、空态、禁用和中断按规格出现。
- 数据回填、reset policy、重复操作和返回恢复正确。
- 输入聚焦后导航固定、内容可见、无双层滚动；键盘收起和返回后恢复。

完整专项清单见 [acceptance-checks.md](references/acceptance-checks.md)。

## 自动化守门

至少运行：

```bash
node scripts/specs.mjs check
node scripts/specs.mjs test
node scripts/validate-wego-design.mjs
```

全局审查、跨技能规则变化或正式合并前使用严格范围。资源变化补充 `node scripts/sync-wego-app-lib.mjs --check`。

把真实命令、退出码、错误、warning 和关键发现写入报告。自动化通过不替代人工语义和体验验收。

## 状态判定

- `pass`：全部必查项通过且没有未说明缺口。
- `pass-with-risk`：需求完成，只有明确、不影响当前结果的验证边界。
- `fail`：存在硬门禁错误、关键路径失败、自动化错误或未修复规格偏差。

## 问题归因

- `wego-product`：目标、范围、流程、状态、宿主或 prototype target 错误。
- `wego-design`：复杂度、区域、组件、布局、presentation、fallback 或来源错误。
- `wego-ux`：规格正确但 DOM、CSS、路由、交互、回填、视口或宿主实现偏离。
- `wego-tests`：验收范围、方法、判定或归因错误。
- `wego-uxsystem-iterate`：正式组件、Token、UI Kit、消费边界、守门或跨技能规则错误。

普通验收失败不会自动进入经验池；只有用户明确要求沉淀或优化工作流时，才转入工作流迭代模式。

## 开发交接与冻结

- `wego-tests` 是 `{iteration_id}-{title}-开发交接.md` 的唯一输出技能，不新增独立交接技能。
- `fail` 不得生成交接；`pass-with-risk` 不得隐藏未完成需求或硬门禁错误。
- 所有相关报告通过后运行 `iteration-record.mjs handoff`，生成交接并复制最终规格快照；随后运行 `freeze` 写入文件指纹；只有交付文件确实匹配当前 Git HEAD 时才记录提交，否则 Git 字段保持空值。
- 冻结后不得覆盖；后续业务变化建立新迭代。

## 禁止事项

- 不只看截图、只跑正常路径或只相信自动化。
- 不编造浏览器、真机、推送、部署或线上结果。
- 不把生成文档当验收规则。
- 不按最后修改文件归因。
