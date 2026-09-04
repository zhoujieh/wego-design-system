---
name: "wego-scene-walkthrough-test"
description: 走查工具自动化测试与回归。改动 wego-app/js/walkthrough-tool.js 或 wego-app/css/walkthrough-tool.css 后回归；走查工具 5 项交互（颜色 HSL / 渐变 / 数值拖动 / 顺序移动 / 悬停元信息）验收；走查工具相关 PR 验证与交互异常排查。触发词：走查工具测试/回归/验收、walkthrough 测试、走查工具功能检查、走查工具 bug 排查。
---

# 走查工具自动化测试

## 触发条件
改动走查工具（js/css）后回归；5 项交互验收或相关 PR 验证；走查工具交互异常排查。

## 固定流程
0. 测试矩阵：功能点 × 正常/边界/异常，含反例。
1. 环境：读 references/env.md。
2. 进入走查：DOM 读 references/dom-map.md；点 `[data-fab-btn]` 展开选中元素，`wego-wt-style-panel` 打开。
3. 5 项功能步骤读 references/test-steps.md；每项必测**回显+撤销/重做+刷新持久化**闭环。
4. 优先跑 `scripts/wt-smoke.cjs` 冒烟，再单测。
5. 证据：每条断言记「操作+DOM+localStorage+时间戳」；截图仅佐证。

## 交付前检查清单
- ① HSL：切 hex/rgb/hsl；三框独立输入；吸管在滑块组内。
- ② 渐变：色标加（≤5/≥2）/删/拖位；±45° 与滑块调角度；填充/文本支持、描边/投影不支持；入口已收敛颜色选择器。[ev-043]
- ③ 数值拖动：Shift ×5、Alt 微调；点击全选直接输入；撤销/重做后元素与 input 同步。
- ④ 顺序移动：移动按钮/方向键换位（moveFlexItem+orderBaselines+共享同步+moveKey）；撤销/重做；刷新保持；拖拽换位已移除。[ev-040, ev-044]
- ⑤ 元信息：红虚线 `line.guide`+宽×高气泡 `highlight .label`+gap 洋红 `rect.gap-bg`/padding 蓝 `rect.pad-bg`/margin 绿 `rect.mar-bg`；8px 网格已移除。[ev-036]
- 无页面报错（pageerror/console.error）。
- 置信度：先排除环境假象再判 bug；低置信度待确认，高置信度才修复。

## 踩坑反例
- 回归脚本须用当前交付单元分支上的技能脚本（.codex/skills 随分支不同步），禁止跑主仓库 main 旧版（含已移除断言误报 FAIL）。[ev-048]
- 恢复滚动会异步派发 scroll，同步标志无效，须时间窗/临时移除监听器。[ev-047]
- 渐变撤销：切渐变+改色标各一条，回 none 须撤 2 步。[ev-046]
- 顺序移动后原坐标命中兄弟元素须重取；一次移动=一个撤销单元（moveKey）。[ev-038, ev-044]
- 冒烟须覆盖移动按钮同档换位路径（曾漏测作用域 bug）。[ev-041]
- 无背景元素 fillHex 为空、HSL 改色不生效属既定行为，勿判失败。[ev-039]
- Playwright 合成鼠标多段 move 只留 1 次 pointermove，长距拖动手动 dispatch PointerEvent。[ev-017]
- DOM 在多级 shadowRoot，断言前先 dump，勿凭记忆猜。[ev-019]
- 防抖落盘 300ms：读 localStorage 等 ≥400ms。[ev-018]
- 面板 fixed，交互前 scrollIntoView({block:'center'})。[ev-023]
- 撤销/重做回显：`_render` 重建触发旧 input blur 写回旧值，断言等重建完成。[ev-021]
- 失败≠Bug：先分环境假象/真实缺陷，低置信度不升 Bug。[ev-025]
