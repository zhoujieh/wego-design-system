---
name: "wego-scene-walkthrough-test"
description: 走查工具自动化测试与回归。改动 wego-app/js/walkthrough-tool.js 或 wego-app/css/walkthrough-tool.css 后回归；走查工具 5 项交互（颜色 HSL / 渐变 / 数值拖动 / 拖拽换位 / 悬停元信息）验收；走查工具相关 PR 验证与交互异常排查。触发词：走查工具测试/回归/验收、walkthrough 测试、走查工具功能检查、走查工具 bug 排查。
---

# 走查工具自动化测试

## 触发条件
改动走查工具（js/css）后回归；5 项交互验收或相关 PR 验证；走查工具交互异常排查。

## 固定流程
1. 环境：读 references/env.md（Playwright + 预览服务 + 运行方式）。
2. 进入走查：DOM 结构读 references/dom-map.md；点 `wego-walkthrough` shadowRoot `[data-fab-btn]` 展开，点页面元素选中，`wego-wt-style-panel` 打开。
3. 逐项跑 5 项功能：步骤读 references/test-steps.md；每项必须测**回显 + 撤销/重做 + 刷新持久化**完整闭环。
4. 优先跑 `scripts/wt-smoke.cjs` 一键冒烟，再按需单测。

## 交付前检查清单
- ① HSL：格式切 hex/rgb/hsl；HSL 三框独立输入；吸管在滑块组内。
- ② 渐变：实色/渐变切换；色标加（上限 5/最少 2）/删/拖位；±45° 与滑块调角度；填充/文本支持、描边/投影不支持（原生限制）。
- ③ 数值拖动：拖动调值；Shift ×5、Alt 微调；点击全选直接输入；撤销/重做后元素与面板 input 同步。
- ④ 拖拽换位：选中即拖（无需长按）；clamp 父容器内；越过兄弟中心换位 + FLIP；撤销/重做；刷新顺序保持。
- ⑤ 元信息：悬停四边红虚线 + 气泡（类名 + 宽×高）+ 间距数字；padding 青色 / margin 橙色块 hover 显示数值；8px 网格已移除。
- 全程无页面报错（监听 pageerror / console.error）。

## 踩坑反例
- Playwright 合成鼠标 down 后多段 move 只产生 1 次 pointermove，长距离拖动（card 层）验证换位需手动 dispatch PointerEvent 绕过。[ev-017]
- 走查工具 DOM 在多级 shadowRoot 内，断言前先 dump 组件 shadow DOM 再写选择器，勿凭记忆猜。[ev-019]
- 防抖落盘 300ms：操作后读 localStorage 需等 ≥400ms。[ev-018]
- 样式面板 fixed 定位，操作前 scrollIntoView({block:'center'})；面板贴右边缘避免遮挡 elementFromPoint。[ev-023]
- 撤销/重做回显：面板 `_render` 重建会触发旧 input blur 写回旧值，断言撤销结果须等重建完成。[ev-021]
