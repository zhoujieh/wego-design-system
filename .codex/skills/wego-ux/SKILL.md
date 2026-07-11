---
name: "wego-ux"
description: 按确认的原型设计约束或正式规格实现 wego-app 场景，并在定稿后补齐实现追踪；不重定义业务需求或设计系统规则。
---

# Wego UX

## 触发与职责边界

用于登记范围内的场景、路由、宿主和交互实现。只执行已确认规格与设计决策；需求偏差回到 `wego-product`，设计偏差回到 `wego-design`，组件或 Token 变更转交 `wego-uxsystem-iterate`。

## 必要输入与运行时入口

读取 `AGENTS.md`、当前迭代、原型设计或两份正式规格及其真实规则来源。路由和宿主读取[运行时方法](references/scene-runtime.md)，状态交接读取[交互实现方法](references/interaction-implementation.md)，同步与验证读取[交付方法](references/delivery.md)。只接受当前 Schema，旧输入直接失败。

## 输出契约与跨技能交接

原型期输出登记范围内可交互运行时；定稿后补齐 `implementation_refs` 并标记实现完成。场景仅注册到唯一 `wego-app` 宿主，完成后交给 `wego-tests`。
