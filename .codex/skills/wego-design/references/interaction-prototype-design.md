# 交互原型设计方法

> `wego-design` 在已确认 `prototype_brief` 后使用。本文只说明如何完成页面设计；不重复原则、组件 DOM、场景 Schema 或迭代状态机。

## 1. 授权与输入边界

<!-- rule-id: confirmed-brief-is-design-authorization -->
<!-- rule-id: wego-scene-decision-scope -->
已确认简报即本轮设计与实现授权。范围内的信息分组、布局、组件、Token、反馈和 overlay 由 `wego-design` 自主决定，不建立第二次确认门禁。缺少或冲突的业务事实会改变目标、范围、入口、路径、状态、数据或结果时，才退回 `wego-product`。

<!-- rule-id: multi-source-generation-input-authority -->
<!-- rule-id: wego-multi-source-generation-input-boundary -->
输入只按职责消费：

- `prototype_brief`：业务事实和已确认的交互视觉要求。
- 参考图：视觉方向。
- 用户线框图：区域与结构。
- 高保真 Figma：指定 Frame 的结构视觉。

视觉材料不得补造业务事实或绕过正式组件、Preview 和 Token。冲突时，业务以简报为准；结构视觉依次参考高保真 Figma、用户线框图、参考图和微购系统基线；实现规格以正式设计系统为准。无需把这些输入编译成新的合同、Schema 或持久化文件。

## 2. 短设计链路

1. 理解用户此刻进入页面的原因。
2. 确定唯一首要任务、核心对象和必要状态。
3. 建立语义区域顺序，删除、合并或降级不能服务首要任务的内容。
4. 确定首屏、主滚动区、固定区域、overlay 和返回关系。
5. 精确匹配页面范式；未命中则自主组合。
6. 命中 UI Kit 时继承其登记的 Layout 组件树；未命中时用正式 Layout 组件搭建 2–3 层页面信息框架（`layout-page` → `layout-scroll` → `layout-section`/`sticky-region` → section 内部 `layout-flow`/`layout-split`/`layout-grid`/`layout-scroll-row`），并将页面信息分配到布局槽位；到第三层后停止拆解，不再继续拆分标题、图标、按钮等业务组件内部。
7. 逐区域组件映射：为每个业务区域显式列出“区域 → 候选组件 → 命中正式组件 / 设计系统缺口”，逐项核对命中组件契约的 `usageHints` 与 `doNotInvent`，确认场景适配性后再复制对应变体的完整 DOM；自造结构必须有正式组件无法替代的依据，或已按规则记录为缺口留待验收时提出。
8. 只读取当前页面实际需要的正式组件、Preview 和契约，并在现有设计系统能力内完成页面。
9. 分配视觉层级与 Token，实现交互和反馈。
10. 在真实页面上自审并运行源码与浏览器验证。

<!-- rule-id: design-before-component-consumption -->
设计时只需在当前上下文形成一个短暂的 design frame：首要任务、核心对象、必要状态、区域顺序，以及滚动、固定和 overlay 决定。它不写入文件，不重复简报，也不产生组件计划、Token 清单或原则引用。

## 3. 页面范式与结构

<!-- rule-id: exact-pattern-or-composed -->
<!-- rule-id: wego-page-pattern-layout-contract -->
用业务任务、surface 角色、状态形态和交互模式匹配 `uikit-plan.json.pagePatterns`：

- 完整满足 `appliesWhen` 且不命中 `excludeWhen` 时使用 `pattern`，只读取对应 UI Kit。
- 未精确命中时使用 `composed`，按首要任务和信息层级自主组织区域。
- 不选择“最接近”的 UI Kit，不拼接多个 UI Kit，不复制演示宿主、业务文案或私有 class。
- `componentCandidates` 只用于缩小后续读取范围，不是允许使用组件的白名单。

页面根和主滚动区保持通栏；内容边距由语义内容组承担。导航、sticky/fixed 和底部操作区保持独立且可避让，具体规则只从 `page-layers.json`、`library-consumption.json` 的命中部分读取，不在任务上下文重写一份布局合同。

## 4. 组件、视觉与交互

结构确定后，从组件索引定位目标组件，逐个读取命中 Preview 和契约，并复制对应变体的完整 DOM。组件约束使原结构不可成立时先调整区域结构；不得用场景 CSS 重造组件。

视觉层级优先使用留白、分组、排版和显隐；中性色承载内容，品牌色只强化主行动，状态色只表达对应状态。场景 CSS 只负责区域关系、语义间距、滚动和业务胶水。

<!-- rule-id: wego-state-interaction-contract -->
只实现简报要求、关键路径需要或操作必然产生的状态。交互必须有真实触发器、可见结果、失败恢复和正确持久化边界；状态不为满足合同而补造。

设计阶段不判断或登记设计系统缺口。组件、规范或系统问题由用户在原型验收时提出，再交给 `wego-uxsystem-iterate` 处理。

## 5. 基于结果自审

<!-- rule-id: prototype-design-self-review -->
实现后直接检查实际页面：

- 首屏是否能看懂上下文、当前状态和唯一下一步。
- 辅助信息是否抢夺首要任务。
- 分组、滚动、固定操作、overlay 和返回是否连续。
- 是否出现因“库里有”而加入的元素。
- 视觉层级、密度和间距是否稳定。
- 必要状态和错误恢复是否真实可用。
- 每个业务区域是否已逐项核对组件契约的 `usageHints` 与 `doNotInvent`，确认场景适配性；自造结构是否有正式组件可替代或已记录为缺口。

发现问题就继续修正，直到源码守卫、真实浏览器视口和核心交互验证通过；不限制修订轮数，也不产出人工自证字段。
