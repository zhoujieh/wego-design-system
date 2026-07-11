# Scene Runtime

> 角色：运行时接入方法。读取条件：修改场景注册、路由、push 或 overlay 时；不替代设计计划。

修改场景注册、路由、宿主、presentation、push 栈或 overlay 时读取。

## registerScene

每个 route 独立注册 `routeId`、`title`、`presentation`、`template` 和 `init(ctx)`。模板直接位于 `scene.js` 字符串或宿主可加载的 `<template>`；禁止运行时请求本地片段。

## routes

按稳定 `route_id` upsert，不按文案模糊匹配。入口声明 scene、script、style、Tab、分组、label、type 和父入口。`host-tab` 不生成普通入口列表项，由固定 Tab 直接加载。

## push 栈

- sceneLayer 是栈容器，每次 push 创建独立 panel，保留下层 DOM 和状态。
- `ctx.back()` 只弹栈顶；栈空回宿主。
- 切换 Tab 或明确清空场景层时才清空整个栈。
- sceneLayer 透明，页面背景属于各自 panel，避免转场白屏。
- `leaf_level >= 3` 的下钻页使用独立 push route，不用 full-screen-modal 模拟。

## overlay

- Modal/Sheet/Dialog 挂在 `.phone-screen` 内。
- 遮罩透明度动画放在独立 mask 层，不能让 overlay 根节点 opacity 带透明面板。
- full-screen-modal 根节点声明 `data-bg="page"` 或 `data-bg="surface"`，panel 背景跟随声明。
- overlay 生命周期由其交互关闭逻辑管理，不因普通 route 变化无条件清空。

## 宿主布局

`host-shell-page` 默认有 16px 横向 padding。有自带 navbar 的 host-tab scene 使用 `host-shell-page--flush`，由 scene 自管内边距，避免双重 padding。

scene 不选择 `.preview-shell`、`.phone-frame`、`.phone-screen`、`.phone-status` 或 `.phone-indicator`；这些只属于宿主。
