# restock001-智能补货计划 开发交接

- 主业务：补货计划
- 关联业务：补货商品选择
- 验收状态：accepted-with-risk
- 范围版本：2

## 迭代目标

在微购 App 原型中建立一条从补货计划入口进入、选择商品、填写数量、确认保存并得到待提交结果的完整会话内补货流程。

## 功能变化与验收

| 需求编号 | 功能 | 类型 | 用户结果 | 页面/场景 | 验收 |
| --- | --- | --- | --- | --- | --- |
| restock001-R01 | 补货计划入口与空状态建链 | added | 商家能从 App 场景列表进入补货计划页，并在首次进入时看到空状态和添加补货商品主按钮。 | 补货计划 | 补货计划:requirement_coverage:restock001-R01 |
| restock001-R02 | 商品选择与回填 | added | 商家能搜索并选择最多 5 个补货商品，完成后返回补货计划页并回填商品信息，再次进入时恢复本次会话中的勾选状态。 | 补货计划、补货商品选择 | 补货计划:requirement_coverage:restock001-R02 |
| restock001-R03 | 补货数量校验与确认保存 | added | 商家能为每个已选商品填写有效补货数量，确认保存后看到成功反馈，并将计划状态更新为待提交。 | 补货计划 | 补货计划:requirement_coverage:restock001-R03 |

## 交付后的相关功能状态

- **临时补货计划创建**（restock.plan-workflow）：商家可在补货计划主场景中维护会话内计划草稿，校验数量并保存为待提交状态。
- **补货商品选择**（restock.product-picker）：商家可在补货商品选择场景中搜索并挑选最多 5 个补货商品，再返回主场景回填结果。

## 页面与数据范围

- 补货计划：added，主业务
- 补货商品选择：added，关联业务

## 页面与流程明细

### 补货计划

- 页面/Surface host-entry：工作台常用应用中的补货计划入口；承载 host-section
- 页面/Surface restock-plan-page：补货计划主页面，承载空状态、商品回填、数量输入与保存结果；承载 standalone-page
- 页面/Surface restock-save-dialog：保存前确认补货计划的 Dialog；承载 dialog
- 流程 restock-plan-build：enter-restock-plan → view-restock-plan → request-product-picker → receive-selected-products → edit-restock-quantities → request-save-confirmation → confirm-save-plan → show-save-success；完成条件 补货计划保存成功并显示待提交状态
- 流程 restock-plan-quantity-validation：edit-restock-quantities → validate-restock-quantities；完成条件 存在空值、0、负数或超上限时阻止保存并就地提示
- 流程 restock-plan-picker-cancel：request-product-picker → resume-after-picker-cancel；完成条件 从商品选择页取消返回，已编辑内容保持不变
- 数据交接 restock-picker-return：request-product-picker → receive-selected-products；数据 restock-item-list、restock-item-stock、restock-item-id；返回策略 keep
- 数据交接 restock-save-result：confirm-save-plan → show-save-success；数据 restock-plan-status、restock-success-feedback；返回策略 clear-on-success

### 补货商品选择

- 页面/Surface restock-product-picker-page：补货商品选择页，承载搜索、勾选、取消勾选、上限反馈和完成返回；承载 standalone-page
- 流程 pick-restock-products：enter-product-picker → view-product-picker-list → search-restock-products → toggle-product-selection → complete-product-selection；完成条件 选择结果返回补货计划页
- 流程 picker-selection-limit：toggle-product-selection → show-selection-limit-feedback；完成条件 达到 5 个上限时给出明确反馈，且不新增第 6 个商品
- 流程 picker-cancel-return：view-product-picker-list → cancel-product-selection；完成条件 取消返回补货计划页，不改动当前草稿
- 数据交接 picker-session-selection：toggle-product-selection → view-product-picker-list；数据 picker-product-selection、picker-selected-counter；返回策略 keep


## 原型与开发边界

- restock001-R01：functional
- restock001-R02：functional
- restock001-R03：functional

## 风险与依赖

- 本轮原型中的商品、库存和保存结果均使用本地模拟数据，后续接真实接口时不改变当前流程结构。
- 计划保存后的待提交状态仅用于原型内反馈，不要求生成真实单据号。
- 后续设计与实现阶段需要在 wego-app/js/routes.js 新增补货计划和补货商品选择的路由登记。

## 文件索引

- wego-app/scenes/补货计划/_spec/interaction_spec.json
- wego-app/scenes/补货计划/_spec/design_plan.json
- wego-app/scenes/补货计划/_spec/acceptance_report.json
- wego-app/scenes/补货商品选择/_spec/interaction_spec.json
- wego-app/scenes/补货商品选择/_spec/design_plan.json
- wego-app/scenes/补货商品选择/_spec/acceptance_report.json

> 本文由正式迭代、规格和验收报告生成；不代表真实接口、推送或生产部署已经完成，除非验收报告明确记录并验证。
