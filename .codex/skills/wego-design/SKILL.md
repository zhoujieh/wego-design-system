---
name: "wego-design"
description: 基于已确认原型简报消费微购设计系统，在一次任务中实现可交互 App 场景并产出可追溯决策与守卫证据；不定义业务需求或修改设计系统本体。
---

# Wego Design

## 触发与职责边界

用于已确认业务范围的新场景、已有场景修改和原型定稿前的交互实现。输入不足时退回 `wego-product`；组件、Token、Preview、UI Kit、消费规则或宿主能力确有缺口时，记录最小缺口说明并转交 `wego-uxsystem-iterate`。不得新增业务事实、发明组件或直接修改设计系统源。

## 必要输入与运行时入口

### 读取顺序

固定为：有效迭代与已确认 `prototype_brief` → [设计决策原则](references/design-decisions.md) → `library-consumption.json` → `uikit-plan.json` → `components/index.json` → 本页命中的 Preview → 对应组件契约 → `colors_and_type.css` → [场景合同](references/scene-contract.md)。

- 设计决策原则是所有设计输出不可绕过的顶层权威
- `design-decisions.json` 仅是场景输出与已有场景修改时的辅助对照，不得作为设计前输入
- 资产按 [资产地图](references/library-map.md) 定位
- 只接受当前 Schema，旧输入直接失败

### 组件 DOM 生成约束

- 场景代码中的组件 DOM 结构必须**逐字复制** Preview 中对应变体的 HTML，包括节点层级、class 组合、修饰类顺序和可选子元素位置
- 禁止"理解大意后自己写"
- 变体选择以 Preview 中 `representativeVariants` 命中的示例为准，未命中的变体不得自行拼凑结构，必须退回确认或选择已有变体

### 需求确认

- 开始交互视觉设计前，必须先完全理解用户需求并与用户确认，禁止不做确认就直接改代码，即使只改一个颜色也要确认

### Overlay 组件消费

- brief 中提到"反馈/操作面板/弹层/底部面板/弹窗"等模糊措辞时，必须先与用户确认具体控件类型（actionsheet / dialog / modal / full-screen-modal / sheet）
- 把对应组件作为 `component_bindings` 登记、把对应交互作为 `interaction_contract`（`overlay:sheet|modal|full-screen-modal|close`）登记后，才能调用 `ctx.openSheet` / `ctx.openModal` / `ctx.openFullScreenModal`
- 守卫会逆向扫描 scene.js 中的这些 API 调用，未登记即 fail
- overlay 类组件的默认关闭行为（如 actionsheet 的 `closeByMask`、`closeByCancel` 默认 true）必须在 init 中实际实现，不能只绑主操作项而漏掉 cancel 与 mask
- 提供给 overlay API 的 HTML 必须遵守组件契约 `structurePatterns`（如 actionsheet 在 overlay 架构下只渲染 `.actionsheet__panel`，不再渲染 `.actionsheet` 根节点，避免双重遮罩与动画错位）

## 输出契约与跨技能交接

输出或更新 `wego-app/js/routes.js`、`wego-app/scenes/{中文业务场景}/scene.js`、`scene.css` 与 `design-decisions.json`；场景合同必须记录设计系统版本、组件/Token 绑定、真实状态、交互与视觉证据。完成提取、场景合同、交互和视觉检查后交付原型；设计系统缺口由 `wego-uxsystem-iterate` 收敛。
