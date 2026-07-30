---
name: "wego-design"
description: 基于已确认原型简报消费微购设计系统，在一次任务中实现可交互 App 场景并产出可追溯决策与守卫证据；不定义业务需求或修改设计系统本体。
---

# Wego Design

## 触发与职责边界

用于已确认业务范围的新场景、已有场景修改和原型定稿前的交互实现。输入不足时退回 `wego-product`；组件、Token、Preview、UI Kit、消费规则或宿主能力确有缺口时，记录最小缺口说明并转交 `wego-uxsystem-iterate`。不得新增业务事实、发明组件或直接修改设计系统源。

## 必要输入与运行时入口

### 读取顺序

固定为：有效迭代与已确认 `prototype_brief` → 共享[设计决策原则](../shared/references/design-decisions.md) → [交互原型设计方法](./references/interaction-prototype-design.md) → 把自然语言和用户实际提供的参考图、线框图或高保真 Figma 按职责形成临时 `generation_packet` → `library-consumption.json`、`page-layers.json` 与 `uikit-plan.json` → 先完成设计意图、精确范式/自主组合裁决、语义区域树、页面层级、滚动架构、内容分组与吸顶区域合同 → `components/index.json` → 本页命中的 Preview → 对应组件契约 → `colors_and_type.css` → [场景合同](./references/scene-contract.md)。

- 设计决策原则是所有设计输出不可绕过的顶层权威
- 已确认 `prototype_brief` 即本轮设计与实现授权；范围内的信息分组、布局、组件、Token、反馈和 overlay 形式由 `wego-design` 决定，不重复向用户确认
- 具体组件只在页面层级、滚动边界、内容分组、间距归属和 sticky/fixed 区域确定后读取；禁止从组件清单反推布局、选择“最接近”的 UI Kit 或拼接多个 UI Kit
- 系统不生成线框图或文本分镜；用户主动提供的线框图只作为结构输入，参考图只作为视觉方向，高保真 Figma 作为指定 Frame 的结构视觉来源。三者都不得替代已确认 `prototype_brief`、补造业务事实或绕过正式设计系统
- `design-decisions.json` 仅是场景输出与已有场景修改时的辅助对照，不得作为设计前输入
- 资产按 [资产地图](./references/library-map.md) 定位
- 只接受当前 Schema，旧输入直接失败

<!-- rule-id: scene-dom-copy-preview-verbatim -->
### 组件 DOM 生成约束

- 场景代码中的组件 DOM 结构必须**逐字复制** Preview 中对应变体的 HTML，包括节点层级、class 组合、修饰类顺序和可选子元素位置
- 禁止"理解大意后自己写"
- 变体选择以 Preview 中 `representativeVariants` 命中的示例为准；未命中时先选择能够满足任务的已有变体，不得自行拼凑结构。正式能力仍无法覆盖时按最小缺口处理；只有替代方案会改变已确认业务结果或产品指令时才退回 `wego-product`

### 澄清边界

- 仅当缺失或冲突的业务事实会改变目标、范围、入口、关键路径、状态、数据含义或完成结果时，退回 `wego-product`
- 设计系统无法支持已确认的产品阶段交互视觉描述，且正式回退会改变已确认产品指令或用户可见结果时，停止实现，记录冲突与正式回退，再退回 `wego-product`；更新并重新确认简报后才能实现
- 颜色、间距、信息分组、组件变体和其他设计细节不得形成第二次确认门禁

### Overlay 组件消费

- brief 未指定具体 overlay 类型时，由 `wego-design` 按任务语义、内容量、风险、流程连续性和关闭方式选择；只有选择会改变业务结果、不可逆风险或已确认产品指令时才退回 `wego-product`
- 把对应组件作为 `component_bindings` 登记、把对应交互作为 `interaction_contract`（`overlay:sheet|modal|full-screen-modal|close`）登记后，才能调用 `ctx.openSheet` / `ctx.openModal` / `ctx.openFullScreenModal`
- 守卫会逆向扫描 scene.js 中的这些 API 调用，未登记即 fail
- overlay 类组件的默认关闭行为（如 actionsheet 的 `closeByMask`、`closeByCancel` 默认 true）必须在 init 中实际实现，不能只绑主操作项而漏掉 cancel 与 mask
- 提供给 overlay API 的 HTML 必须遵守组件契约 `structurePatterns`，渲染完整组件根节点、面板及子内容；遮罩视觉与动画由组件自身承担，宿主 overlay 层保持透明

## 输出契约与跨技能交接

输出或更新 `wego-app/js/routes.js`、`wego-app/scenes/{中文业务场景}/scene.js`、`scene.css` 与 `design-decisions.json`；场景合同必须记录设计系统版本、组件/Token 绑定、真实状态、交互与视觉证据。实现后按交互原型设计方法完成一轮设计自审，再完成既有提取、场景合同、交互和视觉检查后交付原型；设计系统缺口由 `wego-uxsystem-iterate` 收敛。
