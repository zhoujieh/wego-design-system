---
name: "wego-scene-walkthrough-test"
description: 走查工具自动化测试与回归。改动 wego-app/js/walkthrough-tool.js 或 wego-app/css/walkthrough-tool.css 后回归；走查工具 5 项交互（颜色 HSL / 渐变 / 数值拖动 / 顺序移动 / 悬停元信息）验收；走查工具相关 PR 验证与交互异常排查。触发词：走查工具测试/回归/验收、walkthrough 测试、走查工具功能检查、走查工具 bug 排查。
---

# 走查工具自动化测试

## 触发条件
改动走查工具（js/css）后回归；5 项交互验收或相关 PR 验证；走查工具交互异常排查。

## 固定流程
0. 测试矩阵：先列矩阵（功能点 × 正常/边界/异常，含反例）再动手，测试更全。
1. 环境：读 references/env.md（Playwright + 预览服务 + 运行方式）。
2. 进入走查：DOM 结构读 references/dom-map.md；点 `wego-walkthrough` shadowRoot `[data-fab-btn]` 展开，点页面元素选中，`wego-wt-style-panel` 打开。
3. 逐项跑 5 项功能：步骤读 references/test-steps.md；每项必须测**回显 + 撤销/重做 + 刷新持久化**完整闭环。
4. 优先跑 `scripts/wt-smoke.cjs` 一键冒烟，再按需单测。
5. 证据记录：每条断言记「操作 + DOM 状态 + localStorage 校验 + 时间戳」，结论可复核；截图仅佐证，不作为通过依据。

## 交付前检查清单
- ① HSL：格式切 hex/rgb/hsl；HSL 三框独立输入；吸管在滑块组内。
- ② 渐变：实色/渐变切换；色标加（上限 5/最少 2）/删/拖位；±45° 与滑块调角度；填充/文本支持、描边/投影不支持（原生限制）。
- ③ 数值拖动：拖动调值；Shift ×5、Alt 微调；点击全选直接输入；撤销/重做后元素与面板 input 同步。
- ④ 顺序移动：选中 flex 容器内元素，面板移动按钮或键盘方向键换位（moveFlexItem + orderBaselines + 共享同步 + 净零往返）；撤销/重做；刷新顺序保持。元素拖拽换位已移除（旧 reorder 数据仍兼容读取）。
- ⑤ 元信息：悬停四边红虚线（inspector `line.guide`）+ 宽×高气泡（highlight `.label`，hover `${宽}×${高}`、选中 `${类名} ${tag} · ${宽}×${高}`）+ 间距标注——gap 洋红色块+数字（`rect.gap-bg`，元素到父容器 content box 四边，贴边 0 不绘制）、padding 蓝色色块+数值（`rect.pad-bg`，rgba(76,141,255,0.18)）、margin 绿色色块+数值（`rect.mar-bg`，rgba(0,181,120,0.16)）；8px 网格已移除。[ev-036]
- 全程无页面报错（监听 pageerror / console.error）。
- 置信度：先排除环境假象（缓存/浏览器合成事件/输入合并），再判真实 bug；低置信度保持待确认，高置信度才修复；首败保留、单一假设复现。

## 踩坑反例
- Playwright 合成鼠标 down 后多段 move 只产生 1 次 pointermove，长距离拖动（card 层）验证换位需手动 dispatch PointerEvent 绕过。[ev-017]
- 走查工具 DOM 在多级 shadowRoot 内，断言前先 dump 组件 shadow DOM 再写选择器，勿凭记忆猜。[ev-019]
- 防抖落盘 300ms：操作后读 localStorage 需等 ≥400ms。[ev-018]
- 样式面板 fixed 定位，操作前 scrollIntoView({block:'center'})；面板贴右边缘避免遮挡 elementFromPoint。[ev-023]
- 撤销/重做回显：面板 `_render` 重建会触发旧 input blur 写回旧值，断言撤销结果须等重建完成。[ev-021]
- 失败不等于 Bug：先分产品/需求/环境数据/自动化假象与真实缺陷，低置信度不升 Bug。[ev-025]
