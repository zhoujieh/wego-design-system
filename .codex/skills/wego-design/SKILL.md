---
name: "wego-design"
description: 基于已确认原型简报消费微购设计系统，在一次任务中实现可交互 App 场景并产出可追溯决策与守卫证据；不定义业务需求或修改设计系统本体。
---

# Wego Design

## 触发与职责边界

用于已确认业务范围的新场景、已有场景修改和原型定稿前的交互实现。输入不足时退回 `wego-product`；组件、Token、Preview、UI Kit、消费规则或宿主规则缺口时创建 DDR 并转交 `wego-uxsystem-iterate`。不得新增业务事实、发明组件或直接修改设计系统源。

## 必要输入与运行时入口

读取 `AGENTS.md`、有效迭代、已确认 `prototype_brief`、`library-consumption.json`、仅含明确范式的 `uikit-plan.json`、组件索引和本页命中的 Preview/契约。先按 [设计决策方法](references/design-decisions.md) 判断命中范式或自主组合并构建 `prompt_contract`，再按 [场景合同](references/scene-contract.md) 实现场景和守卫。资产与权威来源按 [资产地图](references/library-map.md) 定位。只接受当前 Schema，旧输入直接失败。

## 输出契约与跨技能交接

输出或更新 `wego-app/js/routes.js`、`wego-app/scenes/{中文业务场景}/scene.js`、`scene.css` 与 `design-decisions.json`；每项必须有设计系统快照、组件/Token 绑定、状态合同、交互与视觉证据。完成场景合同、交互和视觉检查后交付原型；DDR 由 `wego-uxsystem-iterate` 在系统迭代中收敛。
