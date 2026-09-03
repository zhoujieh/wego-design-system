# 走查工具 5 项交互测试步骤

> 每项都验证**回显 + 撤销/重做 + 刷新持久化**完整闭环。环境见 env.md，选择器见 dom-map.md。

## 公共准备
1. 打开预览（本地 `http://localhost:8092/wego-app/index.html` 或在线 previews/pr-N）。
2. 进入走查：点 `wego-walkthrough` shadowRoot `[data-fab-btn]`。
3. 选中目标元素：点页面元素（如 `.album-feed__head` 中心），`wego-wt-style-panel` 打开；鼠标不动连续点击当前选中元素可逐级上移选中父级（点击其内部其他元素则改选，快速双击文本进入改文案）。
4. 样式面板 fixed 定位，交互前 `scrollIntoView({block:'center'})`；监听 `pageerror` + `console.error`，全程不得有报错。
5. 证据记录：每条断言输出「操作 → 期望 → 实测 DOM/localStorage → 时间戳」；证据不足记待确认，截图仅佐证，不以截图数/用例数代替通过。

## ① 颜色选择器对齐 HSL
1. 打开颜色字段（`[data-color-trigger][data-field="fillHex"]`）。
2. `select[data-format-select]` 依次切 hex/rgb/hsl；HSL 下出现 `.channel-input[data-channel="h"|"s"|"l"]` 三框独立输入。
3. 改 H 值 → 断言页面元素颜色 / swatch / fillHex input 同步回显。
4. 断言吸管按钮 `.eyedropper-btn` 与色相、透明度滑块在 `.slider-group` 内并排。
5. 撤销/重做 → 颜色恢复 / 重做恢复。
6. 反例：改色后必须 `getComputedStyle(panel._targetEl)` 与 input 值双确认；只改 input 未触发 change 属测试假象，不算通过。

## ② 渐变融入颜色选择器
1. 颜色面板 `.seg-btn` 切"渐变" → `.gradient-editor` 出现。
2. 点 `.gradient-stopbar` 空白加色标（上限 5 个、至少保留 2 个）；`.stop-dot` 可拖动位置、`[data-stop-delete]` 删除。
3. 角度：−45° 按钮 / `.gradient-angle-slider` / +45° 调节渐变方向。
4. 改激活色标颜色 → 断言元素 `backgroundImage` 为 `linear-gradient(...)` 且页面同步。
5. 撤销 2 步回 none、重做恢复。
6. 边界：填充/文本支持渐变；描边（strokeHex）/投影（shadowHex）无渐变切换按钮（原生限制，属正常）。
7. 反例：撤销渐变后 `backgroundImage` 应回 none；防抖落盘 300ms 后读 localStorage 核对，防旧值残留假象。

## ③ 数值字段拖动调值
1. 面板数值字段（如 paddingLeft）按住左右拖动调值，断言元素样式与 input 同步。
2. Shift 拖动 = ×5 步进；Alt 拖动 = 微调。
3. 点击字段自动全选，直接输入新值（如 88）→ 元素同步。
4. 撤销（回 36）→ 重做（回 88）→ 撤销输入，元素与面板 input 全程同步（防 blur 写回旧值）。
5. 反例：撤销后面板 input 会因 `_render` 重建写回旧值，断言须等重建完成；非法输入应被回退或忽略（边界）。

## ④ 顺序移动（面板按钮 / 键盘方向键）
1. 选中 flex 容器内的元素（如 `.album-feed__publisher`，父 `.album-feed__meta` 为 flex column）→ 面板移动按钮可用。
2. 点面板 `[data-move]` 按钮或键盘方向键（row→左右、column→上下）→ 元素 CSS order 改变、显示顺序换位；同类元素共享同步、净零往返还原。
3. 撤销 → 顺序还原；重做 → 恢复；刷新页面 → DOM 顺序保持（order 落盘）。
4. 注意：元素拖拽换位（拖动越过兄弟中心）已随「连续点击选择」交互迭代移除；旧 localStorage reorder 数据仍被兼容读取（`_applyReorder`/`_queryMoveTarget` 保留）。
5. 反例：父容器非 flex（display 无 flex）时移动按钮置灰、方向键无操作，属正常（非 bug）；同档（order 相同）换位会顺延中间同档元素，order 可能多次变化。

## ⑤ 悬停/选中元信息
1. 悬停元素（不选中）→ 四边 `line.guide` 红虚线延长线 + `.bubble`（类名 + 宽×高）+ `text.num` 间距数字。
2. 有 padding 元素 → `rect.pad-r` 青色块；悬停显示 `padding: t r b l` 数值。
3. 有 margin 元素 → `rect.mar-r` 橙色块；悬停显示 `margin: t r b l`。
4. 选中元素后 inspector 同样显示元信息。
5. 断言 8px 网格辅助线已移除（页面无网格线覆盖层）。
6. 场景无 margin 元素时，可用测试注入 `style.marginTop` 验证橙色块逻辑。
7. 反例：无 padding/margin 的元素不显示色块属正常，勿判失败；悬停前先确保无选中态（无选中时 inspector 才走 hover 分支）。

## 回归基线脚本
完整闭环回归脚本：`wt-test-hsl2`（①）、`wt-test-grad8`（②）、`wt-test-numdrag6`（③）、`wt-test-keymove`（④ 键盘顺序移动；原拖拽脚本 `wt-test-reorder5`/`wt-card-drag-dispatch` 已随拖拽移除）、`wt-test-hover4`（⑤）。优先跑 `scripts/wt-smoke.cjs` 一键冒烟。

## 评测闭环（技能自评）
- 回归评测集：`scripts/wt-smoke.cjs` 是技能回归评测集，每次技能迭代后必须重跑（本地 + 在线），9/9 为基准。
- 触发评测：用「走查工具测试/回归/验收/排查」等模拟 prompt 验证 description 命中（对应官方 skill-creator 触发率+通过率双指标）。
- 技能交付前用一次真实业务走查（完整闭环）实测本技能，确认四段结构能指导跑通，再交付。
