# 走查工具 DOM 选择器地图

> 全部为实测确认的选择器。走查工具 UI 位于多级 shadowRoot 内，断言前先 dump 再写选择器。

## 入口与面板

| 目标 | 路径 |
| --- | --- |
| 进入走查模式 | `document.querySelector('wego-walkthrough').shadowRoot.querySelector('[data-fab-btn]').click()` |
| 样式面板 | `wego-walkthrough` shadowRoot → `wego-wt-style-panel`（其 shadowRoot 内为面板字段） |
| 撤销 / 重做 | style-panel shadowRoot → `[data-action="undo"]` / `[data-action="redo"]` |
| 面包屑层级 | style-panel shadowRoot → `[data-crumb]`（`data-crumb-index` 层级索引） |
| 颜色字段触发 | style-panel shadowRoot → `[data-color-trigger][data-field="fillHex"]`（填充）/ `[data-field="strokeHex"]`（描边） |

## 颜色选择器（wego-wt-color-picker）

| 目标 | 选择器 |
| --- | --- |
| 格式切换 | shadowRoot → `select[data-format-select]`（值 hex/rgb/hsl） |
| 通道输入 | `.channel-input[data-channel="h"|"s"|"l"|"hex"|"r"|"g"|"b"]` |
| 滑块组（吸管并排） | `.slider-group` 内：`.eyedropper-btn` + `.hue-slider` + `.opacity-slider` |
| 实色/渐变切换 | `.seg-btn`（文本"实色"/"渐变"） |
| 渐变编辑器 | `.gradient-editor`：`.gradient-angle-row`（−45° 按钮 / `.gradient-angle-slider` / +45°）、`.gradient-stopbar`、`.stop-dot`（激活色标）、`.gradient-toolbar`、`[data-stop-delete]` |

## 元信息（wego-wt-inspector）

| 目标 | 选择器 |
| --- | --- |
| 四边延长线（红虚线） | shadowRoot → `line.guide`（stroke rgba(255,77,79,.45)，dasharray 4 5） |
| 间距数字 | `text.num` / `line.sp` |
| 气泡（类名 + 宽×高） | `.bubble` / `.bubble-text` |
| padding 色块（青） | `rect.pad-r`（rgba(64,158,255,.16)，pointer-events:auto） |
| margin 色块（橙） | `rect.mar-r`（rgba(255,170,0,.16)） |
| hover 数值 tooltip | `.tooltip`（文本形如 `padding: 12px 16px 12px 16px`） |

## 选中与拖拽

- 选中元素：`panel._targetEl`（样式面板实例属性）可取当前选中元素。
- 连点选中父级：同位置连点（≤1.2s、±16px）逐级上移（img→item→grid→media→card）。
- 拖拽换位：选中即拖（120ms + 移动 >8px 双触发）；`_swapSiblings` 用 FLIP 过渡（transition transform 250ms cubic-bezier(0.22,0.9,0.32,1)）。
