# 走查工具交互测试步骤

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
4. 改激活色标颜色 → 断言元素 `backgroundImage`、`[data-stopbar-preview]` 和激活 `[data-stop-dot]` 同步；再改其它颜色字段，原渐变字段 swatch 不得被实色覆盖。
5. 撤销 2 步回 none、重做恢复——注意：切到渐变模式会先应用默认白→黑渐变（1 条变更记录），改色标再 1 条，共 2 条；共享元素会按事务整组撤销，验证逐步回退须选非共享元素，勿把共享事务当作失败。
6. 边界：填充/文本支持渐变；描边（strokeHex）/投影（shadowHex）无渐变切换按钮（原生限制，属正常）。
7. 反例：撤销渐变后 `backgroundImage` 应回 none；防抖落盘 300ms 后读 localStorage 核对，防旧值残留假象；只看元素样式不看面板预览会漏掉控件内部同步缺陷。

## ③ 数值字段拖动调值
1. 面板数值字段（如合并态 paddingAll，或展开后的 paddingTop / paddingRight / paddingBottom / paddingLeft）按住左右拖动调值，断言元素样式与 input 同步。
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

## ⑥ 连点选择 + 文本改文案（本次交互迭代新增）
1. 连点逐级上移：鼠标不动（±16px、无时间限制）点击当前选中元素 → 逐级上移父级；到根回环最深层。鼠标移动后点击 → 改选（含选中容器后点内部元素）。
2. 快速双击（<350ms）可编辑文本 → contentEditable 内联编辑；改字 blur/Enter 提交 → 面板 toast「已更新文本」、bus 'style-change' 记录 text-content。
3. 撤销 → 文本恢复原值；重做 → 新值；**刷新页面 → 文本保持**（`_replayInlineChanges` 对 text-content 走 `el.textContent = c.newValue`，非 setProperty）。
4. 样式面板 light 局部更新：上移选择时只更新内容不重建（`.panel-body` 首子节点引用不变）；结构指纹不一致时回落全量渲染。
5. 反例：顺序移动 ArrowDown 会让同容器兄弟**换位**，改文案前须重取目标元素坐标（原坐标此时命中兄弟）；text-content 若走 `el.style.setProperty` 恢复会静默失败，刷新后文本丢失（曾出现，已修复）。

## ⑤ 悬停/选中元信息
1. 悬停元素（不选中）→ highlight `.label` 显示 `${宽}×${高}` 气泡；inspector `line.guide`×4 红虚线延长线 + `text.num` 间距数字。
2. 有 padding 元素 → inspector `rect.pad-bg` 蓝色块（fill rgba(76,141,255,0.18)），数值（`text.pnum`）绘制在块内。
3. 有 margin 元素 → inspector `rect.mar-bg` 绿色块（fill rgba(0,181,120,0.16)），数值（`text.mnum`）在块内；gap 为 `rect.gap-bg` 洋红块。
4. 选中元素后 highlight `.label` 显示 `${类名} ${tag} · ${宽}×${高}`；inspector 同样显示元信息。
5. 断言 8px 网格辅助线已移除（页面无网格线覆盖层）。
6. 场景无 margin 元素时，可用测试注入 `style.marginTop` 验证 `rect.mar-bg` 逻辑。
7. 反例：气泡在 highlight `.label`，不在 inspector；无 padding/margin 的元素不显示色块属正常，勿判失败；悬停前先确保无选中态（无选中时 inspector 才走 hover 分支）。

## ⑦ iconfont 图标替换
1. 选中含 `wego-iconfont-s` 与已注册 `icon-*` 类的元素 → 样式面板正常打开，标题栏右侧出现 `[data-action="iconfont"]`；普通元素不出现入口。
2. 点击入口 → `[data-iconfont-panel]` 展开；图标项只渲染字形，不显示名称文本；目录数量与已加载 `iconfont.css` 一致，面板可纵向滚动；移动端图标区固定约 42dvh、至少可见四行且 `flex-shrink:0`，样式区保留独立滚动。
3. 重复点击 `.iconfont-option.is-current` → 不产生 `icon-class` 修改记录；点击其它图标 → 仅替换图标类，`wego-iconfont-s` 与业务结构类保留。
4. 同一组件结构且原图标一致的可见实例须全部同步；图标自身无重复组件类时，按最近重复父组件的相对子节点路径匹配；不得把不同组件中碰巧同名的图标一起修改。
5. 修改记录写入 `property: icon-class`、原图标类与新图标类；定位选择器不得含可变的 `icon-*` 类；共享记录须合并显示“共享 N 个元素”。
6. 撤销、重做、删除修改组、重置和刷新回放均须整组生效。
7. 运行 `scripts/wt-iconfont.cjs`，本地与在线均须全量通过且无 `pageerror` / `console.error`。

## ⑧ 工具栏定位与 Tooltip
1. 桌面 1280×960：收起态和展开态中心与视口水平中心一致；即使 localStorage 有旧拖动坐标也忽略，`[data-toolbar]` 为 `.is-fixed`，拖动后位置不变。
2. 可见 `.bottom-nav` 贴视口底部时，工具栏底边与导航顶边至少间隔 16px；1082×490 矮视口重复验证居中与避让。
3. 收起态有配置内容时显示数字；无配置内容时显示走查模式箭头；展开态收起入口使用叉图标。
4. 展开入口 Tooltip 为“展开工具栏”；展开态依次为“收起工具栏 / 走查模式 / 批注模式 / 数据模拟 / 修改记录 / 调试日志 / 更多工具”，均显示在入口上方且无重复原生 title。
5. 点击“修改记录”后配置列表须在视口内且位于工具栏上方；日志面板同样完整可见；数据模拟/更多面板须锚定各自入口，矮视口重复验证。
6. 移动端保留 `wego.wgf-position` 历史坐标与现有拖动逻辑，不添加 `.is-fixed`，不显示桌面 hover Tooltip。
7. 运行 `scripts/wt-toolbar.cjs`，本地与在线均须全量通过且无 `pageerror` / `console.error`。

## 回归基线脚本
完整闭环回归脚本：`wt-test-hsl2`（①）、`wt-test-grad8`（②）、`wt-test-numdrag6`（③）、`wt-test-keymove`（④ 键盘顺序移动；原拖拽脚本 `wt-test-reorder5`/`wt-card-drag-dispatch` 已随拖拽移除）、`wt-test-hover4`（⑤）、`scripts/wt-iconfont.cjs`（⑦，移动端加 `--mobile`）、`scripts/wt-toolbar.cjs`（⑧）。优先跑 `scripts/wt-smoke.cjs` 一键冒烟，再跑对应专项。

## 评测闭环（技能自评）
- 回归评测集：`scripts/wt-smoke.cjs` + `scripts/wt-iconfont.cjs` + `scripts/wt-toolbar.cjs` 是技能回归评测集，每次技能迭代后必须重跑（本地 + 在线）。
- 触发评测：用「走查工具测试/回归/验收/排查」等模拟 prompt 验证 description 命中（对应官方 skill-creator 触发率+通过率双指标）。
- 技能交付前用一次真实业务走查（完整闭环）实测本技能，确认四段结构能指导跑通，再交付。
