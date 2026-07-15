---
name: "wego-design"
description: 基于已确认原型简报消费微购设计系统，在一次任务中实现可交互 App 场景并产出可追溯决策与守卫证据；不定义业务需求或修改设计系统本体。
---

# Wego Design

## 触发与职责边界

用于已确认业务范围的新场景、已有场景修改和原型定稿前的交互实现。输入不足时退回 `wego-product`；组件、Token、Preview、UI Kit、消费规则或宿主能力确有缺口时，记录最小缺口说明并转交 `wego-uxsystem-iterate`。不得新增业务事实、发明组件或直接修改设计系统源。

## 必要输入与运行时入口

读取顺序固定为：有效迭代与已确认 `prototype_brief` → [设计决策原则](references/design-decisions.md) → `library-consumption.json` → `uikit-plan.json` → `components/index.json` → 本页命中的 Preview → 对应组件契约 → `colors_and_type.css` → [场景合同](references/scene-contract.md)。设计决策原则是所有设计输出不可绕过的顶层权威；`design-decisions.json` 仅是场景输出与已有场景修改时的辅助对照，不得作为设计前输入。资产按 [资产地图](references/library-map.md) 定位。只接受当前 Schema，旧输入直接失败。

## 输出契约与跨技能交接

输出或更新 `wego-app/js/routes.js`、`wego-app/scenes/{中文业务场景}/scene.js`、`scene.css` 与 `design-decisions.json`；场景合同必须记录设计系统版本、组件/Token 绑定、真实状态、交互与视觉证据。完成提取、场景合同、交互和视觉检查后交付原型；设计系统缺口由 `wego-uxsystem-iterate` 收敛。
