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

## 元信息（wego-wt-inspector + wego-wt-highlight）

| 目标 | 选择器 |
| --- | --- |
| 四边延长线（红虚线） | inspector shadowRoot → `line.guide`（stroke rgba(255,77,79,.45)，dasharray 4 5） |
| 间距数字 | inspector shadowRoot → `text.num`（gap 间距）/ `text.pnum`（padding） |
| 气泡（宽×高，悬停/选中显示） | **wego-wt-highlight** shadowRoot → `.label`（文本形如 `670×64`；旧 `.bubble-text` 已过时） |
| 选中框/调整柄 | wego-wt-highlight shadowRoot → `.box.box--selected` / `.handles .handle` |
| padding 色块（青） | inspector shadowRoot → `rect.pad-bg`（旧 `.pad-r` 已过时） |
| gap 间距色块（洋红线） | inspector shadowRoot → `rect.gap-bg` / `line.sp` |
| hover 数值 tooltip | `.tooltip`（文本形如 `padding: 12px 16px 12px 16px`） |

## 选中与顺序移动

- 选中元素：`panel._targetEl`（样式面板实例属性）可取当前选中元素。
- 连点选中父级：同位置连点（≤1.2s、±16px）逐级上移（head→publisher→…→card）。
- 顺序移动（替代已移除的"鼠标拖拽换位"）：样式面板 shadowRoot → `[data-move]`（up/left/right/down 按钮，父容器须 flex 才启用，`_updateMoveControls` 按主轴置灰）+ 方向键；换位通过 CSS `order` 实现（`_moveSelected`/`moveFlexItem`），DOM 顺序不变，撤销/重做按 moveKey 整体回退。
