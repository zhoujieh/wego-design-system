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
- ② 渐变：色标加（≤5/≥2）/删/拖位；±45° 与滑块调角度；填充/文本支持、描边/投影不支持；入口已收敛颜色选择器。[ev-049]
- ③ 数值拖动：Shift ×5、Alt 微调；点击全选直接输入；撤销/重做后元素与 input 同步。
- ④ 顺序移动：移动按钮/方向键换位（moveFlexItem+orderBaselines+共享同步+moveKey）；撤销/重做；刷新保持；拖拽换位已移除。[ev-046, ev-050]
- ⑤ 元信息：红虚线 `line.guide`+宽×高气泡 `highlight .label`+gap 洋红 `rect.gap-bg`/padding 蓝 `rect.pad-bg`/margin 绿 `rect.mar-bg`；8px 网格已移除。[ev-042]
- ⑦ iconfont：入口仅在选中已注册图标时出现；纯图标网格可滚动；同组件结构且原图标一致时整组同步，图标无自身组件类则按重复父组件相对路径匹配；修改记录、撤销/重做、删除、刷新回放整组闭环。[ev-055, ev-056]
- ⑧ 工具栏：桌面固定屏幕水平居中、位于可见 bottom-nav 上方 16px 且不可拖动；居中不得用 transform 破坏 fixed 子面板坐标；配置列表/日志须完整可见，数据模拟/更多锚定各自入口；移动端保留原逻辑；收起态有配置显示数字、无配置与展开态收起入口显示叉图标；全部工具入口 Tooltip 完整。[ev-057, ev-058]
- 无页面报错（pageerror/console.error）。
- 置信度：先排除环境假象再判 bug；低置信度待确认，高置信度才修复。

## 踩坑反例
- 回归脚本须用当前交付单元分支上的技能脚本（.codex/skills 随分支不同步），禁止跑主仓库 main 旧版（含已移除断言误报 FAIL）。[ev-054]
- 恢复滚动会异步派发 scroll，同步标志无效，须时间窗/临时移除监听器。[ev-053]
- 渐变撤销：切渐变+改色标各一条，回 none 须撤 2 步。[ev-052]
- 顺序移动后原坐标命中兄弟元素须重取；一次移动=一个撤销单元（moveKey）。[ev-044, ev-050]
- 冒烟须覆盖移动按钮同档换位路径（曾漏测作用域 bug）。[ev-047]
- 无背景元素 fillHex 为空、HSL 改色不生效属既定行为，勿判失败。[ev-045]
- Playwright 合成鼠标多段 move 只留 1 次 pointermove，长距拖动手动 dispatch PointerEvent。[ev-017]
- DOM 在多级 shadowRoot，断言前先 dump，勿凭记忆猜。[ev-019]
- 防抖落盘 300ms：读 localStorage 等 ≥400ms。[ev-018]
- 面板 fixed，交互前 scrollIntoView({block:'center'})。[ev-023]
- 撤销/重做回显：`_render` 重建触发旧 input blur 写回旧值，断言等重建完成。[ev-021]
- 失败≠Bug：先分环境假象/真实缺陷，低置信度不升 Bug。[ev-025]
