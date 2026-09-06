# MVP 仓库管理 Figma MCP 写入计划验证

## 概述

基于 `zhoujieh/wego-design-system` 仓库现有「仓库管理」业务场景，只读分析后生成一套独立的 MVP 验证产物，存放在 `mvp/warehouse-management/`。这些产物用于验证「真实仓库内容 → 可执行的 Figma 写入计划」链路的可行性，作为后续 Figma MCP 自动创建页面、状态、交互说明的输入。

**硬约束**：只读分析仓库、不修改任何现有文件、不修改现有 workflow、不修改四个技能、不调用 Figma MCP、不创建 Figma 文件、只生成 MVP 产物。

## 当前状态分析

### 仓库管理场景已存在且完整

通过阅读 [routes.js](file:///Users/baobei/CODE/wego-design-system/wego-app/js/routes.js)、[scene.js](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/仓库管理/scene.js)、[scene.css](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/仓库管理/scene.css)，确认场景已完整实现：

- **路由**：`routeId: my-warehouse-management`，挂在「我的」Tab 应用中心 grid-entry，icon 为 `配货管理.svg`
- **呈现方式**：`push` + `slide-left` + `coversTabBar: true`
- **页面组成**：仓库列表页（navbar + summary + cards/empty）+ 仓库编辑页（full-screen-modal，新增/编辑共用）+ 删除确认 dialog
- **模拟数据**：3 条仓库（杭州主仓、广州直播备货仓、苏州门店仓），字段含 id/name/code/manager/phone/address/type/serviceScope/shippingAging/tempLevel/supportSameCity/supportPickup/supportLive/isDefault/enabled/safetyStock/dailyCapacity/remark 等
- **核心交互**：新建（navbar「新建」按钮或空状态「新增仓库」按钮）、编辑（卡片更多菜单→编辑）、删除（卡片更多菜单→删除→dialog 二次确认）、取消挽留（脏数据时 dialog「放弃未保存内容？」）、表单校验（名称/联系人/电话11位/地址必填）
- **选项枚举**：TYPE_OPTIONS(直营网仓/门店仓/同城前置仓/直播备货仓)、SERVICE_SCOPE_OPTIONS(全国快递/同城配送/门店自提/多渠道履约)、SHIPPING_AGING_OPTIONS(24小时内发货/当日发货/次日发货/48小时内发货)、TEMP_OPTIONS(常温/冷藏/冷冻/混合温层)
- **默认仓互斥逻辑**：设为默认仓时自动取消其他默认；停用仓库时自动取消默认

### 已有规格文件（参考但不修改）

`wego-app/scenes/仓库管理/_spec/` 下已有 `interaction_spec.json`、`design_plan.json`、`acceptance_report.json` 等。MVP 产物独立存放在 `mvp/warehouse-management/`，不复用也不修改这些文件，但会参考其结构约定以保证一致性。

### MVP 目录不存在

仓库根目录目前没有 `mvp/` 目录，需新建。

## 提议变更（新建 8 个文件，均在 mvp/warehouse-management/ 下）

### 文件 1：`mvp/warehouse-management/source/route-info.json`

**内容**：从 routes.js 提取的路由元信息。

```json
{
  "route_id": "my-warehouse-management",
  "scene_name": "仓库管理",
  "entry_path": "wego-app/js/routes.js",
  "scene_path": "wego-app/scenes/仓库管理/",
  "entry": {
    "tab": "my",
    "group": "my-app-center",
    "label": "仓库管理",
    "type": "grid-entry",
    "icon": "./lib/icons/app-center/配货管理.svg"
  },
  "presentation": {
    "type": "push",
    "transition": "slide-left",
    "coversTabBar": true
  },
  "script": "./scenes/仓库管理/scene.js",
  "style": "./scenes/仓库管理/scene.css"
}
```

### 文件 2：`mvp/warehouse-management/source/scene-context.md`

**内容**：用中文描述场景入口、页面组成、用户目标、主要业务流程。基于 scene.js 的实际实现：
- 场景入口：我的 Tab → 应用中心 → 仓库管理 grid 入口 → push 进入列表页
- 页面组成：仓库列表页（navbar 含返回/新建、summary 统计区、仓库卡片列表或空状态）、仓库编辑页（full-screen-modal，含仓库状态/基础信息/履约能力/库存与发货/补充信息五个分组）、删除确认 dialog
- 用户目标：店主集中维护仓库资料，完成新增、编辑、删除、启停切换
- 主要业务流程：浏览列表 → 新增/编辑/删除 → 保存或确认 → 回填列表

### 文件 3：`mvp/warehouse-management/source/source-files.md`

**内容**：记录本次读取的 3 个仓库文件列表及简要说明：
1. `wego-app/js/routes.js` — 路由注册表，含仓库管理 routeId 与入口配置
2. `wego-app/scenes/仓库管理/scene.js` — 场景逻辑，含状态、模板、交互绑定
3. `wego-app/scenes/仓库管理/scene.css` — 场景样式，含列表页与编辑页布局

### 文件 4：`mvp/warehouse-management/interaction_spec.json`

**内容**：基于 scene.js 实际实现重新整理的交互规格（独立于 _spec/ 下的版本，面向 Figma 写入）。包含：

- **用户目标**：维护仓库资料，覆盖新增、编辑、删除、空状态新增
- **页面入口**：my-warehouse-management，host-grid-entry
- **flows**（5 条，与 figma_write_plan 对齐）：
  - F01 仓库列表浏览流程
  - F02 新增仓库流程
  - F03 编辑仓库流程
  - F04 删除仓库流程
  - F05 空状态新增流程
- **flow_nodes**：enter-warehouse、view-list、open-create、open-edit、edit-form、save、open-menu、confirm-delete、empty-create
- **surfaces**：warehouse-list、warehouse-editor(create)、warehouse-editor(edit)、delete-dialog
- **states**：default、empty、menu-open、creating、editing、validation-fail、saved、delete-confirm、deleted
- **transitions**：open-warehouse、create-warehouse、edit-warehouse、save-warehouse、open-delete-dialog、confirm-delete、cancel-edit、empty-create
- **data_handoffs**：保存回填（新增 unshift / 编辑原位更新）、删除回填（filter 移除）
- **exit_results**：返回我的 Tab、保存成功 toast、删除成功 toast

### 文件 5：`mvp/warehouse-management/design_plan.json`

**内容**：基于 scene.css 实际布局的设计规格。包含：

- **页面拆分**：列表页（push）、编辑页（full-screen-modal，新增/编辑共用）、删除确认（dialog）
- **页面策略**：object-management-list-with-editor
- **Surface 类型**：warehouse-list(primary-task-page, push)、warehouse-editor(secondary-task-page, full-screen-modal)、delete-dialog(secondary-task-page, dialog)
- **区域布局**：
  - 列表页：navbar(horizontal-3-slot, fixed) + summary(vertical-stack, scroll) + warehouse-list(vertical-stack, scroll)
  - 编辑页：modal-navbar(horizontal-3-slot, fixed) + form(vertical-stack, scroll，含 5 个 form-group/cell-group) + save-action(navbar 右侧, fixed)
  - 删除 dialog：dialog-content + dialog-actions
- **状态展示方式**：卡片 badge（默认发货仓=highlight、启用中=success、已停用=subtle）、空状态（icon+title+desc+button）
- **组件模式**：card(warehouse-card)、button(strong sm 新建 / danger sm 删除)、switch(启停/默认/锁定/调拨)、form(horizontal/vertical input)、cell(selectRow cycle)、number-input、dialog(text variant)

### 文件 6：`mvp/warehouse-management/figma_write_plan.json`

**内容**：MVP 核心 Figma 写入计划，严格遵循用户指定的 schema。结构如下：

#### iteration
- id: `mvp001`
- name: `仓库管理 Figma MCP 写入验证`

#### figma_target
- mode: `new_file`
- purpose: `MVP测试`

#### source_scene
- route_id: `my-warehouse-management`
- scene_name: `仓库管理`
- source_files: 3 个文件路径

#### write_scope
- 包含：仓库管理列表页、新增仓库流程、编辑仓库流程、删除确认流程、空状态流程
- 不包含：其他业务场景、库存管理、订单流程、非本次需求页面

#### figma_pages
- 1 个 Figma 文件，下含 4 个 Frame 组（对应 4 个 screen）

#### flows（5 条）
每条含 flow_id/flow_name/flow_type/steps/start_point/end_result：
- F01 仓库列表浏览流程（main）：进入列表→查看卡片→浏览摘要
- F02 新增仓库流程（main）：列表→点新建→填表单→保存→回填列表
- F03 编辑仓库流程（branch）：列表→更多菜单→编辑→改表单→保存→回填列表
- F04 删除仓库流程（branch）：列表→更多菜单→删除→确认→回填列表
- F05 空状态新增流程（branch）：空列表→点新增仓库→填表单→保存→回填列表

#### screens（4 个）
每个含 screen_id/screen_name/surface_type/related_flows/required_states：
1. 仓库管理列表页（push, F01/F05, 列表默认态/空状态/菜单展开态/保存成功态/删除完成态）
2. 新增仓库页（full-screen-modal, F02/F05, 新增初始态/校验失败态/保存成功态）
3. 编辑仓库页（full-screen-modal, F03, 编辑已有数据态/校验失败态/保存成功态）
4. 删除确认弹窗（dialog, F04, 删除确认态）

#### states（9 个）
每个含 state_id/state_name/screen_id/trigger/precondition/visual_change/data_change/next_action/edge_cases/figma_frame_name：
1. S01 列表默认态（列表页，初始进入，展示 3 条卡片）
2. S02 空状态（列表页，无仓库数据，展示空状态组件）
3. S03 操作菜单展开态（列表页，点击更多按钮，展开编辑/删除菜单）
4. S04 新增仓库初始态（新增页，点击新建，空表单+默认值）
5. S05 编辑已有数据态（编辑页，点击编辑，表单回填已有数据）
6. S06 表单校验失败态（新增/编辑页，保存时缺必填项，toast 提示）
7. S07 保存成功态（新增/编辑页→列表页，保存成功，toast+列表回填）
8. S08 删除确认态（删除弹窗，点击删除，dialog 二次确认）
9. S09 删除完成态（列表页，确认删除，toast+列表移除）

#### frame_naming
格式：`mvp001-{flow_id}-{state_id}-{screen_name}`
示例：`mvp001-F01-S01-仓库管理页-列表态`

#### annotations
每个 Frame 生成：状态名称、触发条件、页面变化、数据变化、下一步动作、边界情况

#### validation_checklist
- 是否覆盖全部流程（5 条 flow 全覆盖）
- 是否覆盖全部页面（4 个 screen 全覆盖）
- 是否覆盖关键状态（9 个 state 全覆盖）
- 是否存在多余页面（无）
- 是否支持后续更新同步（是，state 与 frame 一一对应，可增量更新）

### 文件 7：`mvp/warehouse-management/figma_write_plan.review.md`

**内容**：人审版，8 个章节，使用产品/设计语言，不展示 JSON 字段：
1. 本次验证目标
2. 本次需求范围（含 5 个 flow、4 个 screen、9 个 state）
3. 用户流程总览（5 条 flow 文字描述）
4. Figma 页面清单（4 个 screen 文字描述）
5. 页面状态清单（9 个 state 文字描述）
6. 交互完整性检查（流程闭环、状态覆盖、边界情况）
7. 不包含内容（其他场景/库存/订单/非本次页面）
8. 写入 Figma 前确认项（frame 命名、状态映射、流程闭环）

### 文件 8：`mvp/warehouse-management/figma_write_report.json`

**内容**：MVP 生成结果报告，记录：
- iteration_id: mvp001
- generated_at: 生成时间
- source_files_read: 读取的 3 个文件
- artifacts_generated: 8 个产物文件清单
- coverage: flows(5)/screens(4)/states(9) 覆盖统计
- validation: checklist 通过情况
- figma_mcp_called: false（未调用）
- existing_files_modified: false（未修改任何现有文件）
- next_step: 等待人审确认后可作为 Figma MCP 写入输入

## 假设与决策

1. **MVP 产物独立存放**：所有文件放在 `mvp/warehouse-management/`，不触碰 `wego-app/scenes/仓库管理/_spec/` 已有规格，避免污染正式链路。
2. **flows 编号对齐用户要求**：F01-F05 严格按用户指定顺序，F01 列表浏览、F02 新增、F03 编辑、F04 删除、F05 空状态新增。
3. **states 覆盖用户指定 9 个**：列表默认态/空状态/操作菜单展开态/新增初始态/编辑已有数据态/校验失败态/保存成功态/删除确认态/删除完成态，与 scene.js 实际交互一一对应。
4. **frame_naming 用中文 screen_name**：用户示例 `mvp001-F01-S01-仓库管理页-列表态` 用中文，保持一致。
5. **不调用 Figma MCP**：用户明确要求，report 中记录 `figma_mcp_called: false`。
6. **校验失败态合并新增/编辑**：scene.js 中 validateDraft 对新增和编辑用同一套校验逻辑，state 描述时说明适用两个页面。
7. **保存成功态/删除完成态跨页面**：这两个状态涉及页面跳转（编辑页→列表页），在 state 描述中明确 visual_change 包含 toast + 列表回填。

## 验证步骤

1. **目录结构验证**：确认 `mvp/warehouse-management/` 下 8 个文件全部生成，目录结构与用户指定一致。
2. **只读验证**：`git status` 确认仅新增 `mvp/` 目录，无现有文件被修改。
3. **JSON 合法性验证**：每个 .json 文件可被 `JSON.parse` 解析。
4. **覆盖完整性验证**：
   - flows 覆盖 5 条（F01-F05）
   - screens 覆盖 4 个
   - states 覆盖 9 个
   - validation_checklist 全部通过
5. **frame_naming 一致性验证**：每个 state 的 figma_frame_name 符合 `mvp001-{flow_id}-{state_id}-{screen_name}` 格式。
6. **人审版可读性验证**：`figma_write_plan.review.md` 不含 JSON 字段，使用产品/设计语言。
7. **未调用 Figma MCP 验证**：`figma_write_report.json` 中 `figma_mcp_called: false`。

## 执行顺序

1. 创建 `mvp/warehouse-management/source/` 目录
2. 生成 `source/route-info.json`、`source/scene-context.md`、`source/source-files.md`
3. 生成 `interaction_spec.json`
4. 生成 `design_plan.json`
5. 生成 `figma_write_plan.json`（核心产物）
6. 生成 `figma_write_plan.review.md`（人审版）
7. 生成 `figma_write_report.json`（生成报告）
8. 输出生成结果摘要
