---
name: "wego-scene-walkthrough-test"
description: 走查工具分层测试。改动 walkthrough-tool.js/css 后先跑冒烟和受影响项；交付节点跑本地专项闭环；终局或 PR 发布验证跑双端关键链路。用于 walkthrough 测试、回归、验收、异常排查。
---

# 走查工具自动化测试

## 触发条件
改动走查工具 js/css 后回归；走查验收、PR 验证或异常排查时按层级加深测试。

## 固定流程
0. 定层级：本地小改=冒烟+受影响项；交付节点=本地专项闭环；终局/PR 发布=双端关键链路。
1. 环境：读 references/env.md。
2. 进入走查：DOM 读 references/dom-map.md；点 `[data-fab-btn]` 展开选中元素，`wego-wt-style-panel` 打开。
3. 先跑 `scripts/wt-smoke.cjs`；命中 iconfont 或工具栏再跑对应脚本；其它按受影响章节手测。
4. 交付节点才验回显+撤销/重做+刷新持久化；终局再扩到全部关键项。
5. 证据：轻量层记操作+结果+时间戳；交付/终验层补 DOM+必要 localStorage。

## 交付前检查清单
- 层级匹配：小改不过度全量；交付节点覆盖受影响闭环；终局/PR 发布覆盖双端关键链路。
- 基础冒烟：入口、选中、面板打开、主控件回显、无页面报错。
- 颜色/HSL/渐变改动：按 ①② 验回显；交付节点再验撤销/重做/刷新持久化。
- 数值/顺序/连点/元信息改动：按 ③④⑤⑥ 验受影响路径；交付节点补边界和持久化。
- iconfont 改动：跑 `scripts/wt-iconfont.cjs`；移动端布局变化加 `--mobile`。
- 工具栏改动：跑 `scripts/wt-toolbar.cjs`；定位/浮层变化覆盖桌面、矮视口和移动端。
- 无页面报错（pageerror/console.error）。
- 置信度：先排除环境假象再判 bug；低置信度待确认，高置信度才修复。

## 踩坑反例
- 非 CSS 状态须按 textContent/属性/classList 分派回放，不能走 style.setProperty。[ev-044]
- 顺序变化后旧坐标会指向兄弟元素，须重取目标；一次动作的多记录用事务键成组撤销。[ev-045, ev-047]
- 冒烟须覆盖决定代码路径的关键分支，不能只覆盖功能名称。[ev-046]
- 程序恢复滚动会异步派发可信 scroll，须用时间窗或临时移除监听器。[ev-048]
- 可变资源类不能进入持久化定位；共享资源按组件语义与原值定界并成组记录。[ev-049, ev-050]
- 复合颜色值须同步内部预览；状态批量刷新按值类型渲染，勿用实色覆盖渐变。[ev-053, ev-054]
- 含 fixed 浮层的宿主不得用 transform 居中；受限 flex 面板须显式分配主次滚动区的收缩权。[ev-051, ev-052]
- Playwright 合成鼠标多段 move 只留 1 次 pointermove，长距拖动手动 dispatch PointerEvent。[ev-017]
- DOM 在多级 shadowRoot，断言前先 dump，勿凭记忆猜。[ev-019]
- 防抖落盘 300ms：读 localStorage 等 ≥400ms。[ev-018]
- 面板 fixed，交互前 scrollIntoView({block:'center'})。[ev-023]
- 撤销/重做回显：`_render` 重建触发旧 input blur 写回旧值，断言等重建完成。[ev-021]
- 失败≠Bug：先分环境假象/真实缺陷，低置信度不升 Bug。[ev-025]
