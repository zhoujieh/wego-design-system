# 设计决策细则

> 角色：设计判断方法。读取条件：页面范式、组件组合或承载方式需要决策时；正式领域规则仍以结构化设计系统来源为准。

仅在判断页面复杂度、pagePattern、fallback、组件组合或打开方式时读取。

## 决策顺序

1. 先按业务交互模式与 surface 角色匹配 pagePattern，不按内容主题或页面名称猜测。
2. exact/near 不成立时检查正式 fallback blueprint。
3. 仍无法覆盖时标记 gap，不自由设计。
4. 先确定页面与区域结构，再映射组件模式和稳定变体。
5. 每个决定记录命中条件和真实来源。

## 组件消费

- 先查 `scenarioTypeRegistry`，再查组件契约与 Preview。
- 稳定变体优先于组合约束，组合约束优先于自由组合。
- 自由组合只能使用正式 `domAnatomy`，业务 class 只允许做区域布局胶水。
- 业务需要但契约无法覆盖时形成 design gap，不能发明组件类。

## presentation

- 层级返回语义优先 push。
- 当前任务上的轻量确认或说明使用 modal/dialog。
- 底部选项或短操作使用 sheet。
- 复杂编辑且需要覆盖全屏时使用 full-screen-modal。
- 宿主固定 Tab 内容使用 host-tab。

surface 的打开方式、overlay 层级、返回动作和 Tab 覆盖必须一起决定，不能只选择动画或容器。

## 回退

pagePattern、fallback 和组件契约冲突时，停止交接并回到 `wego-uxsystem-iterate` 修正规则；业务规格不足时回到 `wego-product`。不要在 `design_plan` 中写临时发明的规则。
