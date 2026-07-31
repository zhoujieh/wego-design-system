---
name: "wego-design"
description: 基于已确认原型简报消费微购设计系统，在一次任务中完成可交互 App 场景；不定义业务需求或修改设计系统本体。
---

# Wego Design

## 触发与边界

用于已确认范围内的新场景、已有场景修改和原型定稿前的交互实现。缺少会改变目标、范围、路径、状态、数据或结果的业务事实时退回 `wego-product`；正式组件、Token、Preview、UI Kit 或宿主能力确有缺口时，记录最小说明并交给 `wego-uxsystem-iterate`。

## 按需读取

默认读取 `AGENTS.md`、有效迭代中的已确认 `prototype_brief`、共享[设计原则](../shared/references/design-principles.md)、[设计方法](./references/interaction-prototype-design.md)和[资产地图](./references/library-map.md)。

页面结构形成后，只读取 `page-layers.json`、`library-consumption.json` 和 `uikit-plan.json` 中与本页命中的部分。页面骨架先用正式 Layout 组件搭建 2–3 层信息框架（`layout-page`/`layout-scroll`/`layout-section`/`layout-flow`/`layout-split`/`layout-grid`/`layout-scroll-row`，命中 UI Kit 时继承其 Layout 树），再将业务信息分配到布局槽位；组件确定后，只读取 `components/index.json` 的目标项、对应 Preview 和组件契约；实现时读取需要的 Token；收尾时只读取[场景合同](./references/scene-contract.md)中与当前场景命中的规则。已有场景的历史说明不作为设计前输入。

<!-- rule-id: scene-dom-copy-preview-verbatim -->
正式组件必须使用目标 Preview 变体的完整 DOM、class 和可选节点位置；不得凭组件名自行重写结构，页面结构也不得从组件或 UI Kit 反推。

## 输出与交接

输出或更新 `wego-app/js/routes.js`、场景 `scene.js` 和 `scene.css`。在已确认范围内自主完成信息分组、布局、组件、Token、反馈和 overlay，不建立第二次确认门禁。完成后运行源码守卫和真实浏览器检查，再交给用户验收；除场景合同允许的简短例外说明外，不新增设计证明文件。
