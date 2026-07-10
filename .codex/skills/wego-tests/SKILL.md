---
name: "wego-tests"
description: 验收 wego-app 当前业务场景并输出 acceptance_report，检查需求、设计计划、规则来源、实现、路由、交互、适配、资源和交付状态是否一致。
---

# Wego Tests

本文件是 `wego-tests` 的唯一运行时权威入口。只负责验收、回归和问题归因，不重新设计页面，也不替实现阶段直接修补规则。

## 何时触发

- 用户要求验收、检查、回归或 review 当前业务场景。
- `wego-ux` 完成新场景或已有场景迭代，需要进入正式验收。
- 用户要求输出 `acceptance_report` 或核对部署、路由、交互闭环。

不要误用：

- 需要实现或修复场景：转入 `wego-ux`。
- 需要重新做设计消费：转入 `wego-design`。
- 需要修改组件、UI Kit、Token、守门或工作流：转入 `wego-uxsystem-iterate`。

## 输入前提

开始前必须存在：

- `_spec/interaction_spec.json`
- `_spec/design_plan.json`
- `scene.js` 和 `scene.css`
- 当前 `prototype_target.routes[]`（或旧 `route_id`）的路由注册和宿主入口
- `design_plan.rule_sources_used` 指向的正式来源

新任务还必须存在：

- `interaction_spec.flows`、`flow_nodes`、`surfaces`、`content_blocks`、`transitions`、`data_handoffs`、`prototype_boundaries`、`readiness`
- `design_plan.complexity_level`、`flow_to_surface_decisions`、`page_strategy`、`region_composition`（structured/complex 必填）、`component_patterns`

任一前提缺失时，直接判定前置条件失败并归因到对应上游；不得用截图、自然语言说明或自动生成文档代替。

## 验收依据

按以下来源比较：

1. 用户已确认并落盘的 `interaction_spec`。
2. 已落盘的 `design_plan`。
3. `rule_sources_used` 指向的组件契约、pagePattern、fallback、Token 和 Preview。
4. 当前 scene、路由、宿主入口、资源和真实状态变化。
5. 自动化守门和本轮实际执行记录。

`.codex/skills/wego-design/specs/*.md` 是人工检查文档，不得作为验收依据，也不得输出 `spec_ref_check`。

## 核心规则

- 验收必须同时比较需求、设计计划、正式规则来源和当前实现，不能只看页面截图或自动化结果。
- `acceptance_report` 使用 `rule_source_check`，每个关键设计和实现决定都必须能追溯到真实文件与字段。
- 问题必须归因到最早产生错误决定的工作流环节，不能根据最后修改的文件或表面组件名称归因。
- 正常路径、空内容、长内容、重复操作、中断操作、失败状态、键盘焦点和返回恢复按需求必要性一起验证。
- 只有真实执行过的脚本、浏览器检查、提交、推送和部署结果才能写入报告。

## 验收范围

默认验当前任务影响范围：

- 当前 `scene_folder`、`route_id` 和入口挂载位置。
- 当前任务修改的宿主、路由、scene 和设计系统文件。
- 与本次变化相关的直接上游和下游场景。

用户明确要求全局审查、全量回归或改动涉及跨场景宿主能力时，扩大到：

- 全部受影响场景与路由。
- 宿主公共交互、资源同步和固定模板。
- 设计系统结构化来源和生成文档一致性。

浏览器或线上访问验证只有在本轮实际可执行并已执行时记录；未执行不伪装为通过。

## 输出要求

必须输出：

```
{
  "requirement_coverage": [],
  "scene_judgement_check": {},
  "surface_design_check": {},
  "uikit_consumption_check": {},
  "component_discipline_check": {},
  "rule_source_check": {},
  "copy_check": {},
  "route_check": {},
  "interaction_check": {},
  "layout_check": {},
  "viewport_keyboard_check": {},
  "app_scene_check": {},
  "resource_sync_check": {},
  "flow_coverage": {},
  "transition_check": {},
  "state_handoff_check": {},
  "back_restore_check": {},
  "prototype_boundary_check": {},
  "end_to_end_paths": [],
  "design_contraction_check": {},
  "compatibility_check": {},
  "deployment_readiness_check": {
    "push_attempted": false,
    "push_commit_hash": "",
    "deploy_status": "success | pending | degraded-local | not-run",
    "production_domain": "",
    "fallback_local_entry": "wego-app/index.html",
    "errors": []
  },
  "automated_checks": {
    "commands": [],
    "exit_codes": [],
    "errors": [],
    "warnings_count": 0,
    "key_findings": []
  },
  "findings": [],
  "risk_log": [],
  "manual_verify_items": [],
  "final_status": "pass | pass-with-risk | fail"
}
```

规则：

- 存在未修复的硬门禁错误时必须 `fail`。
- 只有不影响当前需求完成、且明确记录验证边界的剩余风险才可 `pass-with-risk`。
- `pass` 需要所有必查项通过且没有未说明的验证缺口。
- 自动化命令退出非 0 或 `errors` 非空时不能 `pass`。

## 必查项

### 需求和 surface

- 用户目标、范围、信息块（或 `content_blocks`）、状态和异常流程是否完整承接。
- `surface_designs[]` 是否覆盖全部 `interaction_spec.surfaces[]`（或旧 `page_surfaces[]`）。
- 每个 surface 的 role、内容引用（`content_refs` 或旧 `information_blocks`）、交互模式和实现页面一致。
- `flow_nodes[].surface_ref` 能映射到 `surface_designs[]`。
- 实现是否私自增加需求、字段、入口或页面层级。

### 规则来源

- `interaction_spec` 使用 `rule_sources`，不存在 `spec_refs`。
- `design_plan` 使用 `rule_sources_used`，不存在 `spec_refs_used`。
- 每个 pagePattern、blueprint、布局、presentation 和组件映射能定位真实文件与字段。
- `rule_sources_used` 不包含 `specs/*.md`、不存在的路径或未实际命中的来源。
- 发现来源缺失时归因到 `wego-product` 或 `wego-design`，不能让 `wego-ux` 自行补判。

### UI Kit、布局和组件

- `match_status` 与实际命中依据一致；`gap` 不得进入实现。
- `layout_pattern`（或新 `page_strategy.layout_pattern`）明确为通栏 M1 或卡片 M2，不使用条件性或模糊描述。
- M1 实现为页面内容层 0 横向 padding，M2 实现为 16px 横向 padding 和正式卡片容器。
- 主内容区域在空内容、短内容和未填写状态下仍占满计划规定的可用宽度。
- 所有间距、颜色、字号、圆角和尺寸使用正式 Token。
- 不存在未注册组件类、子元素类或修饰类。
- 连续 cell/form 使用正式分组容器，页面业务 class 只做布局胶水。
- `consumption_mode` 与 `selected` 写法一致。
- `stable-variant` 的 DOM 和维度值一致；旧写法其他模式给出完整 DOM 路径，新任务 `selected` 只写变体维度值组合、组合约束 ID 或组合说明。
- 新任务 `component_patterns` 和 `region_composition` 已分离，未混入 `component_mapping`；`complexity_level` 与实际页面复杂度相符。
- 不存在“结构同构”“类似某结构”等省略写法。

### 对象管理列表

命中 `object-management-list-composition` 或 `object-management-list-page` 时：
- 列表只展示对象识别、关键状态、1–2 条摘要和必要操作。
- 详情字段没有摊满列表。
- 默认横向主结构；纵向结构有明确设计依据。
- 图片策略不使用抢占视觉的大面积高饱和占位。
- 1–2 个高频安全操作可外露；更多或危险操作按计划收纳并确认。
- 临时气泡菜单只有在设计计划明确允许时存在，且没有注册成通用组件。
- 新增入口的图标+文字或降级纯文字有正式依据。
- 同一表单或同类分组对齐策略一致。
- switch 等状态组件通过 class、`aria-*` 和值更新保留动画。

### App、路由和宿主

- `wego-app/index.html` 是唯一宿主入口。
- 当前场景位于 `wego-app/scenes/{中文业务场景}/`。
- `prototype_target.routes[]`（或旧 `route_id`）中每个 route 唯一、稳定、kebab-case，并与两份规格一致。
- 每个 route 的 `surface_ref` 对应已实现 surface。
- `scene.js` 调用 `window.WegoApp.registerScene()`，多路由场景按 route 分别注册。
- 入口挂在 `host_container` 指定的 Tab、分组和父子层级。
- 点击入口在 `.phone-screen` 内打开，不离开 App。
- scene 不包含或依赖 `.preview-shell`、`.phone-frame`、`.phone-screen`、`.phone-status`、`.phone-indicator`、`.uikit-shell`。
- 运行时不使用 `fetch()`、XHR、普通外链或 `location.href` 读取/跳转本地 scene。
- 宿主修改没有重置无关 Tab、入口和历史场景。

### 打开方式和导航

- `presentation.type`、DOM 容器、动画、关闭方式和覆盖层级一致。
- `coversTabBar` 等于 `covers_tab_bar`；场景级页面默认 true，宿主内嵌 `host-entry` 例外需有依据。
- `push` 在 sceneLayer 栈中打开，back 逐层弹栈。
- `leaf_level >= 3` 的页面使用独立 push route，不用 full-screen modal 冒充。
- sceneLayer 容器透明、每个 panel 自带页面背景，转场期间不白屏遮住下层。
- `back-icon`、`text-cancel`、`close-icon` 的 DOM、图标和文案与稳定变体一致。
- Modal/Sheet 类浮层的遮罩淡入淡出必须由独立遮罩层承担（如 `.modal::before`）；根 overlay 和面板不得用 `opacity` 动画，否则面板会被父级透明度一起带透明。验收时必须同时检查 root opacity、mask opacity、panel opacity 和 panel transition。

### 真实交互

- 选择、输入、开关、筛选、保存、取消、删除、创建等状态有可见变化。
- 成功、失败、删除确认、空态、禁用和中断流程按 `interaction_spec` 出现。
- 保存或完成后有 toast、摘要回填、返回或关闭等明确结果。
- toast 由宿主管理，同一时刻一个，跨 route、Tab、返回和下一次操作正确清理。
- 默认不持久化；只有需求明确要求时才使用 localStorage。
- 重复点击、重复提交和返回后重新进入不会产生重复入口、重复监听或脏状态。

### 移动端视口、键盘和滚动

对包含输入的场景至少检查：

- 输入聚焦后顶部导航仍由宿主固定显示，没有被页面整体顶走。
- 当前输入可见，滚动只发生在内容区，不产生双层滚动。
- 回车或业务要求的下一步操作能正确切换焦点，不能被单一输入框锁住。
- 键盘收起后宿主高度、底部安全区和滚动位置恢复，无残留空白。
- 连续聚焦多个输入、返回页面、切换横竖屏后仍正常。
- scene 没有自行修改 viewport meta、宿主盒模型或重复注册顶层 viewport 监听。
- 宿主级修复同步到正式宿主和 `templates/host-shell.*`。

### 资源和本地直开

- `wego-app/lib/` 与 `.codex/skills/wego-design/` 源资源一致。
- 没有只修改部署副本、不修改源文件的漂移。
- `assets/`、字体、图标、Token 和 components.css 完整。
- `wego-app/index.html` 可通过相对路径本地直接打开，不依赖构建框架或运行时请求本地文件。
- 电脑端显示手机壳，移动端同链接全屏，业务内容边距语义一致。

## Stage 2/3：完整交互路径与设计收缩检查

为配合《interaction-prototype-workflow-refactor-conclusion.md》第二、三阶段，`acceptance_report` 在原有页面、组件和路由检查之外增加以下检查项。新任务必须输出对应字段；旧场景在未迁移时按兼容性检查处理。

### 流程与节点覆盖检查（flow_coverage）

验证 `interaction_spec.flows`、`flow_nodes`、`surfaces`、`transitions`、`data_handoffs`、`prototype_boundaries` 的完整性：

- `flows` 覆盖主流程、分支流程、异常流程和中断/恢复流程（按需求必要性）。
- 每个 `flow_nodes[].surface_ref` 能映射到已实现的 surface。
- 每个 `functional` 节点都有对应 surface 承接，且在实现中可走通。
- `stub` 节点有入口和明确反馈；`excluded` 节点未出现在路由、入口或 DOM 中。
- `blocked` 节点未进入实现。
- 用户可从真实入口进入并完成主流程。

### 转移检查（transition_check）

- 每个 `transitions.from/to/return_to` 引用的 `node_id` 存在。
- 转移触发条件在实现中可被用户操作或业务事件触发。
- `return_to` 的回流路径在实现中可走通。
- 承载方式（push/sheet/modal/dialog/inline）与 `design_plan.flow_to_surface_decisions` 一致。

### 跨界面数据交接检查（state_handoff_check）

- `data_handoffs` 覆盖所有需要回填的转移。
- 子页面返回时按 `payload_content_refs[]` 携带数据并回填到父 surface 的对应 `content_id`。
- `reset_policy` 在实现中按规格执行：`keep` 保留状态、`reset` 重置、`clear-on-success` 成功后清空。
- 回填后父 surface 的 content_block 状态和展示正确更新。

### 返回恢复检查（back_restore_check）

- 多层 push 返回时逐层弹栈，每层状态独立保留。
- 切换 Tab 或清空场景层时才清空整个栈。
- 取消、失败、中断后下层页面和状态恢复正确。
- 重复操作不产生重复监听或脏状态。

### 原型边界检查（prototype_boundary_check）

- `functional` 节点完整实现交互、状态变化和反馈。
- `simulated` 节点使用本地模拟数据走完整流程。
- `stub` 节点保留 `data-node-id` 和入口，反馈明确。
- `excluded` 节点没有任何实现痕迹。

### 端到端路径检查（end_to_end_paths）

至少覆盖：

- 正常路径：从入口到结果完整走通。
- 异常路径：失败、空数据、禁用、权限不足等按规格出现。
- 中断/恢复路径：中断后能恢复或正确重置。
- 重复操作路径：不产生重复入口、重复监听或脏状态。
- 子页面选择后正确回填；返回后下层状态恢复；成功后宿主状态更新。

页面单独通过不代表完整交互原型通过。

### 内容块与假设检查

- 所有 `content_blocks` 都被设计方案和实现覆盖。
- `assumptions` 中的假设在实现中得到落实或保留记录。
- `open_questions` 中影响核心流程的问题未进入实现；影响局部的问题按 `stub` 或 `excluded` 处理。
- `readiness` 与实际实现范围一致：`ready` 全量实现；`ready-with-assumptions` 假设已记录；`partially-ready` 只实现已确认节点。

### 多路由与 overlay 检查

- `prototype_target.routes[]` 正确映射到 `wego-app/js/routes.js` 中的多个 route。
- 每个 route 的 `surface_ref` 对应已实现 surface。
- Sheet、Modal、Dialog、内联区域未注册独立 route，由父场景触发。
- `host_container.leaf_level >= 3` 的下钻页面使用独立 push route。
- 场景层级和覆盖层级实现正确：push 在 sceneLayer 栈中，overlay 按设计计划层级叠加。

### 设计收缩检查（design_contraction_check）

- `design_plan` 不存在完整 DOM 路径或 CSS 类拼装（新任务）。
- `component_patterns` 和 `region_composition` 合理分离，未混入 `component_mapping`。
- `component_mapping.selected` 只写变体维度值组合、组合约束 ID 或组合说明（新任务）。
- `complexity_level` 已声明，且与实际页面复杂度相符：
  - `simple`：单页面或简单表单，可省略 `region_composition`。
  - `structured`：多分组或管理列表，必须有 `region_composition`。
  - `complex`：多模块页面，必须有 `page_strategy` 的首屏目标、区域优先级、内容密度、滚动节奏等字段。
- `flow_to_surface_decisions` 覆盖所有 `prototype_boundaries.depth != excluded` 的节点。
- 所有设计决策可追溯到正式组件契约、蓝图或页面模式。

### 兼容性检查（compatibility_check）

- 旧场景未迁移时，`page_surfaces`、`information_blocks`、`component_mapping.selected`（含完整 DOM 路径）等旧字段可作为兼容读取来源。
- 旧字段与新字段不得在同一场景中同时维护语义不同的两份规格。
- 迁移中的场景已归档旧规格，新字段完整且通过上述检查。
- 鼓励使用新结构，但不得在过渡期拒绝旧场景通过验收。

### 稳定节点标识检查

- 实现中保留 `data-surface-id`、`data-content-id` 稳定标识。
- `data-surface-id` 与 `interaction_spec.surfaces[].surface_id` 一致。
- `data-content-id` 与 `interaction_spec.content_blocks[].content_id` 一致。
- `stub` 节点保留 `data-node-id`。
- 路由和场景状态使用稳定 `route_id`。

## 自动化守门

当前变更范围至少运行：

```bash
node scripts/specs.mjs check
node scripts/specs.mjs test
node scripts/validate-wego-design.mjs
```

用户要求全局审查、跨技能规则变更或正式合并前，运行：

```bash
node scripts/validate-wego-design.mjs --scope=full --strict
```

涉及设计系统运行资源时补充：

```bash
node scripts/sync-wego-app-lib.mjs --check
```

启动本地验证服务器做验收前，必须遵守 [AGENTS.md](../../AGENTS.md) 的"Git 与验证"小节：使用 `timeout` / `trap kill` / `EXIT trap` / `pgrep cleanup` 等包装避免进程残留，验收前后用 `lsof -iTCP -sTCP:LISTEN -P | grep python` 确认无残留 http.server。

把实际命令、退出码、错误、warning 和关键发现写入 `automated_checks`。不得把未执行命令写成通过。

## 硬门禁与人工验收

自动化已覆盖的结构错误以脚本结果为准；人工验收重点检查脚本无法判断的体验和语义：

- 需求与流程是否真实成立。
- 组件 DOM 与契约是否一致。
- layout、presentation 和 navbar 绑定是否正确。
- 交互、焦点、滚动、键盘、返回和状态恢复是否完整。
- 视觉信息层级和内容取舍是否符合设计计划。

自动化通过不等于体验通过；人工发现确定问题时仍须失败或修复。

## 部署结果验收

- `success`：必须有推送 commit、Production Domain，且已确认对应部署 Ready。
- `pending`：推送成功但未确认 Ready；不得声称线上已可用。
- `degraded-local`：记录推送或部署失败原因，并提供 `wego-app/index.html`。
- `not-run`：记录用户要求不部署或任务停止在部署前的原因。

未访问 Vercel 控制台或线上页面时，不得推断 Ready。

## 问题归因

按问题最早产生位置归因：

- `wego-product`：目标、范围、`flows`、`flow_nodes`、`surfaces`、`content_blocks`、`transitions`、`data_handoffs`、`prototype_boundaries`、`readiness`、信息块、状态、异常流程、宿主路径、`prototype_target.routes[]` 或 scene 目录错误。
- `wego-design`：`complexity_level`、`flow_to_surface_decisions`、`page_strategy`、`region_composition`、`component_patterns`、pagePattern、布局、组件映射、presentation、fallback 或规则来源错误。
- `wego-ux`：规格正确但 DOM、CSS、路由、交互、`data-surface-id`/`data-content-id` 标识、数据回填、返回恢复、资源、视口或宿主实现偏离。
- `wego-tests`：验收范围、判定标准或归因本身错误。
- `wego-uxsystem-iterate`：正式组件、Token、UI Kit、消费边界、守门或跨技能规则错误。

不能根据最后修改的文件归因；同一问题有多个影响时标明主要归属和次要影响。

## 发现问题后的处理

- 当前任务要求修复时，直接回到对应技能修复并重新验收。
- 上游规格变化时先归档旧 `_spec`，再重走后续链路。
- 普通验收失败不会自动进入经验池。
- 只有用户明确要求沉淀经验、补充规则、复盘形成经验或优化工作流时，才转入 `wego-uxsystem-iterate` 的工作流迭代模式。

## 禁止事项

- 只看截图不检查规格、规则来源和真实实现。
- 默认全量回归所有历史场景而不控制范围。
- 只验证正常路径，忽略需求明确的异常和中断状态。
- 把生成文档当验收规则。
- 自动化通过后跳过人工语义和体验检查。
- 编造浏览器、真机、推送、部署或线上访问结果。
- 归因时不标明最早错误环节。
