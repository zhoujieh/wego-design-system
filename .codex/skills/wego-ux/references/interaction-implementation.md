# 交互实现细则

实现多节点、多 surface、数据回填、对象列表、键盘焦点或原型边界时读取。

## 组装顺序

1. `page_strategy` 确定页面范式、布局和滚动。
2. `region_composition` 确定区域顺序、优先级和宽度。
3. `component_patterns` 确定区域或 surface 的模式。
4. `component_mapping` 确定稳定变体或组合约束。
5. `flow_to_surface_decisions` 确定节点承载。

simple 可省略区域层；structured/complex 必须先编排区域。

## 数据交接

- 按 `payload_content_refs[]` 从子 surface 回填父 surface。
- `keep` 保留子状态；`reset` 返回后重置；`clear-on-success` 成功清空、取消保留。
- 回填后同步更新对应 content block 的状态与展示。
- 多层 push 每层状态独立；普通返回不清空整个栈。

## 对象管理列表

- 列表只展示识别、关键状态、1–2 条摘要和必要操作。
- 详情字段进入详情、编辑、sheet、dialog 或表单。
- 1–2 个高频安全操作可外露；更多或危险操作按计划收纳。
- 危险操作必须确认。
- 无正式 popmenu 时不得发明通用组件。

## 状态组件

Switch、counter 等优先更新状态 class、`aria-*` 和业务值，不整组重渲染导致动画或焦点丢失。重复进入和重复操作不得产生重复监听或脏状态。

## 键盘与滚动

输入聚焦时导航留在宿主顶部，内容区独立滚动并保证当前输入可见。连续切换输入、键盘收起、返回、旋转后恢复滚动、安全区和宿主高度，不创建双层滚动。
