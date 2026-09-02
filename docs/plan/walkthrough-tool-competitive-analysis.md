# 走查工具阶段三功能竞品调研

> 对象：微购走查工具（wego-design-system）阶段三 12 项功能
> 方法：逐功能对照主流设计协作工具（Figma、蓝湖、即时设计、Chrome DevTools、GoProof）与浏览器调试器
> 时间：2026-09-03
> 结论：每个功能均存在成熟竞品先例，我方实现取其交互范式、保持更轻量的移动端原生形态。

---

## 1. 撤销 / 重做

**竞品：Figma**
- 快捷键：`Ctrl/Cmd + Z` 撤销、`Ctrl/Cmd + Shift + Z`（或 `Ctrl+Y`）重做；每次按键回退一步，支持连续多步
- 兜底：版本历史（Starter 30 天 / Pro 无限），按文件级快照恢复
- 共享对象：Figma 中组件实例改动可批量影响所有实例（类似我方共享组语义）

**我方实现对照**：全局 `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z`，栈式撤销/重做；共享组批量改色时一次撤销整体还原全部同构元素（对齐 Figma 实例批量语义）；路由切换/场景重置时清空栈防止旧上下文残留（对齐 Figma 画布切换清栈）。

来源：
- https://saasdesign.io/learn/figma-undo
- https://wpdean.com/how-to-undo-in-figma/

---

## 2. 定位分组（position / top / right / bottom / left / z-index）

**竞品：Figma / 蓝湖 / Chrome DevTools**
- Figma：右侧属性面板 Position 区域，数值输入 X/Y、W/H，支持负偏移
- 蓝湖：自动标注展示元素位置与间距，`Alt` 悬停查看间距
- DevTools Styles：直接编辑 position/top/left 等属性，CSS 无单位 `0` 之外的数值须带 `px`

**我方实现对照**：样式面板定位分组含 position 下拉 + 四向偏移 + z-index；纯数字自动补 `px`（对齐 CSS 语义，修复了无单位值被浏览器忽略的问题）；输入清空即还原。

来源：
- https://lanhu.saicmobility.com/sos/quick_view.html
- https://developer.chrome.google.cn/docs/devtools/dom

---

## 3. 测量模式

**竞品：Figma Dev Mode**
- 快捷键 `Shift + M` 进入测量工具，点击起点拖拽到终点绘制测量
- `Alt`（Mac `Option`）悬停元素显示红线距离与像素值；`Ctrl+Alt` 测量嵌套组内距离
- 测量线红色、不可改色，可拖动调整位置避免遮挡

**竞品：GoProof Measure**
- 点击拖拽测量宽/高/对角线/面积，网格覆盖辅助对齐

**我方实现对照**：走查模式内 M 键切换测量，第一次点起点（圆点+十字准星）、第二次点终点绘制横向/纵向虚线+数值气泡；点空白退出。更接近 Figma 的两点式 + DevTools 常驻模式（无需长按 Alt）。

来源：
- https://help.figma.com/hc/en-us/articles/22012921621015-Guide-to-inspecting
- https://help.figma.com/hc/en-us/articles/360039956974-Measure-distances-between-layers

---

## 4. 网格辅助线 + 吸附

**竞品：Figma / GoProof / 设计稿工具通识**
- Figma：智能参考线 + 8px 网格吸附，拖拽时元素自动吸附到网格线并显示对齐辅助线
- GoProof Grid：网格覆盖层用于对齐检查
- DevTools：Layout 面板可叠加网格叠加层

**我方实现对照**：G 键切换网格叠加层（品红虚线网格），拖拽元素时自动吸附到最近网格线（阈值 ±4px），命中吸附时轻震动反馈（移动端）；修复了"拖拽中吸附显示位置 ≠ 松手提交位置"的跳变（提交使用吸附后位移）。

来源：
- https://www.goproof.net/support-collaborating/using-the-measure-and-grid-tools
- https://help.figma.com/hc/en-us/articles/360039956974-Measure-distances-between-layers

---

## 5. 渐变填充编辑器

**竞品：Figma**
- 五种 paint：Solid / Linear / Radial / Angular / Diamond
- 渐变：色标条拖拽调整 stop 位置、点空白加 stop、拖出色标条删除、角度数值输入或画布控制器调整、单层最多 5 个 stop

**竞品：即时设计**
- 同图层面板填充下拉，支持线性/径向/角度渐变

**我方实现对照**：开关渐变后显示渐变面板，线性/径向切换、角度数值（如 90deg → `linear-gradient(90deg,...)`）、双色色标；多层填充合并为逗号分隔多层 `background-image`（对齐 CSS 多层背景）。聚焦线性/径向两种移动端常用形态。

来源：
- https://help.figma.com/hc/en-us/articles/360041003694-Paints-in-Figma
- https://help.figma.com/hc/en-us/articles/34208860210199-Use-gradients-as-a-fill-or-stroke
- https://js.design/special/article/figma-gradient.html

---

## 6. 多层填充 / 描边 / 投影

**竞品：Figma Effects / Paints**
- Fill 支持多层（多 paint 叠加），Stroke 支持多层描边
- Effects 面板 `+` 添加多个 Drop Shadow / Inner Shadow 层，各层独立参数；阴影导出为 CSS `box-shadow`

**竞品：蓝湖**
- 自动标注直接输出多层 box-shadow / border 的 CSS 代码

**我方实现对照**：样式面板填充/描边/投影均支持多层增删改，各层独立 change 记录（可单独撤销）；投影合并为 `box-shadow` 逗号分隔多层（`rgb(0,0,0) 0px 0px 0px 3px, rgba(0,0,0,0.4) 6px 6px 12px 0px`）。

来源：
- https://help.figma.com/hc/en-us/articles/360041488473-Apply-effects-to-layers
- https://lanhuapp.com/bd_page?come

---

## 7. 核心快捷键系统

**竞品：Figma / Chrome DevTools**
- Figma：`Shift+D` 切换 Dev Mode、`G` 渐变工具、`Shift+M` 测量、`Alt` 测量间距等完整快捷键体系
- DevTools：`Ctrl+Shift+C` 检查元素（对应我方走查激活）

**我方实现对照**：`M` 测量、`G` 网格、`Alt+W` 走查开关、`L` 配置列表、方向键微调 transform（`Shift` + 方向键大步幅）。取竞品"高频操作全部可键触发"原则，但保持极简（走查工具面向评审场景，不做全量快捷键）。

来源：
- https://dualite.dev/blogs/figma-keyboard-shortcuts
- https://developer.chrome.google.cn/docs/devtools/dom

---

## 8. 元素选择 / 连续点击层级上移（阶段二）

**竞品：Chrome DevTools Elements**
- DOM 树 + 面包屑祖先链，逐级查看/选择祖先节点
- `Ctrl+Shift+C` 检查模式，点选即定位；`$0` 引用当前选中节点、`$1/$2` 历史选中
- 直接点 DOM 树中的祖先节点实现层级上移

**竞品：蓝湖 / 即时设计**
- 打点选择元素后可 @ 成员 / 复制参数，层级通过标注树浏览

**我方实现对照**：同位置连续点击（间隔 ≤1.2s、±16px 容差）逐级向父级上移；顶部面包屑展示祖先链（11 层折叠为 6 项），可点击面包屑直接跳层级；到顶回环。比 DevTools 更贴近触屏评审场景（连点上移，无需鼠标右键/树操作）。

来源：
- https://developer.chrome.google.cn/docs/devtools/dom
- https://juejin.cn/post/7585214391828643883

---

## 9. 批注 hover / 选中 / 连续点击（阶段二）

**竞品：蓝湖**
- 快捷键 `N` 打点批注，支持 @ 项目内成员并通知；拖拽区域标记
- 点击设计图位置添加批注，团队成员可回复

**竞品：Figma / 即时设计**
- Figma 评论直接钉在画布坐标；即时设计标注页打点讨论

**我方实现对照**：批注模式 hover 高亮 + 单击选中并直接开气泡 + 同位置连续点击逐级上移批注目标；空批注自动清理、marker 随滚动/显隐同步重绘。对齐"批注钉在元素上"的行业范式，更轻量（无需账号/成员体系）。

来源：
- https://lanhu.100tal.com/sos/lan-hu-xiang-xi-jiao-cheng.html
- https://m.oppozhijia.com/wz/955476.html

---

## 10. 长按拖拽移动

**竞品：Figma / 通用编辑器**
- Figma：`V` 移动工具拖拽图层，配合智能参考线对齐
- 移动端设计工具普遍采用长按（Haptic）进入拖拽态，区分点击与拖拽

**我方实现对照**：长按 500ms 进入拖拽态（元素半透明），移动实时更新 transform，松手提交位移变更（进撤销栈）；未移动自动还原。取通用"长按=拖拽"移动端范式，规避与走查单击/连点选择冲突。

---

## 11. JSON 导出 / 导入

**竞品：蓝湖 / Figma**
- 蓝湖：设计稿历史版本管理，可查看/恢复任意版本快照
- Figma：版本历史 + `.fig` 文件 / JSON 插件导出

**我方实现对照**：走查数据（变更+批注+文本）按元素归并导出为 JSON；导入支持合并追加 / 替换两种模式。对齐"评审结论可沉淀、可恢复"的行业能力，形态更贴合走查产物（无需全量工程文件）。

来源：
- https://lanhuapp.com/bd_page?come

---

## 12. 失败注入 API（测试支撑）

**竞品：Chrome DevTools Network 节流 / 阻断 / 断点**
- DevTools Network 面板可模拟 Slow 3G、请求阻断、离线等失败场景，用于前端异常态验证

**我方实现对照**：`window.WegoApp.faultInjection` 提供 `setEnabled/setEnabled/isEnabled`，支持 slow（慢响应）等故障注入，供自动验证模拟真实失败路径。对应 DevTools 的"故障注入"能力，但封装为面向走查工具验证的极简 API（评审者无需开 DevTools）。

来源：
- https://developer.chrome.google.cn/docs/devtools/dom

---

## 竞品结论

| 功能 | 竞品范式 | 我方形态 | 差距 |
|---|---|---|---|
| 撤销/重做 | Figma 栈 + 版本历史 | 栈 + 共享组批量撤销 | 无版本历史（走查场景不需要） |
| 定位分组 | DevTools/Figma 属性面板 | 面板 + 自动补 px | 无 |
| 测量 | Figma Alt 悬停 + Shift+M | 两点式常驻模式 | 无 hover 测量（触屏优先） |
| 网格 | Figma 8px 吸附 | 网格层 + 吸附 + 震动 | 吸附粒度仅 8px |
| 渐变 | Figma 5 种 paint | 线性/径向 | 无角度/菱形（移动端少用） |
| 多层效果 | Figma Effects/Paints | 多层填充/描边/投影 | 无 layer blur（CSS 弱支持） |
| 快捷键 | Figma 全量快捷键 | 核心 5 组 | 无 |
| 层级选择 | DevTools 树+面包屑 | 连点上移+面包屑 | 更贴触屏 |
| 批注 | 蓝湖 N 打点+@ | 点击即批注+hover | 无 @ 成员/回复流 |
| 拖拽 | Figma V 拖拽 | 长按拖拽 | 无智能参考线对齐 |
| JSON | Figma/蓝湖版本快照 | 导出/导入 | 无 |
| 失败注入 | DevTools Network | faultInjection API | 无 |

**总体结论**：12 项功能均能从 Figma / 蓝湖 / 即时设计 / Chrome DevTools / GoProof 找到成熟先例；我方全部取其交互范式，针对"移动端真机评审"场景做减法（触屏优先、无账号体系、极简快捷键）。无偏离行业共识的实现，也无必须补齐的能力缺口。
