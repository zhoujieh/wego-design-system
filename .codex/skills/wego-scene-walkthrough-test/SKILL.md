---
name: "wego-scene-walkthrough-test"
description: 走查工具自动化测试与回归。改动 wego-app/js/walkthrough-tool.js 或 wego-app/css/walkthrough-tool.css 后回归；颜色 HSL、渐变、数值拖动、顺序移动、悬停元信息、连点选择、iconfont 替换、工具栏定位与 Tooltip 等交互验收；走查工具相关 PR 验证与交互异常排查。触发词：走查工具测试/回归/验收、walkthrough 测试、走查工具功能检查、走查工具 bug 排查。
---

# 走查工具自动化测试

## 触发条件
改动走查工具（js/css）后回归；走查交互验收或相关 PR 验证；走查工具交互异常排查。

## 固定流程
0. 测试矩阵：功能点 × 正常/边界/异常，含反例。
1. 环境：读 references/env.md。
2. 进入走查：DOM 读 references/dom-map.md；点 `[data-fab-btn]` 展开选中元素，`wego-wt-style-panel` 打开。
3. 功能步骤读 references/test-steps.md；每项必测**回显+撤销/重做+刷新持久化**闭环。
4. 优先跑 `scripts/wt-smoke.cjs` 冒烟；iconfont 变更跑 `scripts/wt-iconfont.cjs`，工具栏变更跑 `scripts/wt-toolbar.cjs`。
5. 证据：每条断言记「操作+DOM+localStorage+时间戳」；截图仅佐证。

## 交付前检查清单
- ① HSL：切 hex/rgb/hsl；三框独立输入；吸管在滑块组内。
- ② 渐变：色标加（≤5/≥2）/删/拖位；±45° 与滑块调角度；填充/文本支持、描边/投影不支持；入口已收敛颜色选择器。
- ③ 数值拖动：Shift ×5、Alt 微调；点击全选直接输入；撤销/重做后元素与 input 同步。
- ④ 顺序移动：移动按钮/方向键换位；撤销/重做；刷新保持；拖拽换位已移除。
- ⑤ 元信息：红虚线 + 宽×高气泡 + gap/padding/margin 数值；8px 网格已移除。
- ⑦ iconfont：纯图标网格可滚动；移动端至少四行；同组件同原图标整组同步；修改记录、撤销/重做、删除、刷新闭环。
- ⑧ 工具栏：桌面居中避开 bottom-nav 且不可拖动；浮层锚定入口；移动端保留原逻辑；数字/箭头/叉状态与 Tooltip 按测试步骤验收。
- 无页面报错（pageerror/console.error）。
- 置信度：先排除环境假象再判 bug；低置信度待确认，高置信度才修复。

## 踩坑反例
- 非 CSS 状态须按 textContent/属性/classList 分派回放，不能走 style.setProperty。[ev-043]
- 顺序变化后旧坐标会指向兄弟元素，须重取目标；一次动作的多记录用事务键成组撤销。[ev-044, ev-046]
- 冒烟须覆盖决定代码路径的关键分支，不能只覆盖功能名称。[ev-045]
- 程序恢复滚动会异步派发可信 scroll，须用时间窗或临时移除监听器。[ev-047]
- 可变资源类不能进入持久化定位；共享资源按组件语义与原值定界并成组记录。[ev-048, ev-049]
- 复合颜色值须同步内部预览；状态批量刷新按值类型渲染，勿用实色覆盖渐变。[ev-052, ev-053]
- 含 fixed 浮层的宿主不得用 transform 居中；受限 flex 面板须显式分配主次滚动区的收缩权。[ev-050, ev-051]
- Playwright 合成鼠标多段 move 只留 1 次 pointermove，长距拖动手动 dispatch PointerEvent。[ev-017]
- DOM 在多级 shadowRoot，断言前先 dump，勿凭记忆猜。[ev-019]
- 防抖落盘 300ms：读 localStorage 等 ≥400ms。[ev-018]
- 面板 fixed，交互前 scrollIntoView({block:'center'})。[ev-023]
- 撤销/重做回显：`_render` 重建触发旧 input blur 写回旧值，断言等重建完成。[ev-021]
- 失败≠Bug：先分环境假象/真实缺陷，低置信度不升 Bug。[ev-025]
