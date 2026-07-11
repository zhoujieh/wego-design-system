# 浏览器验证

执行布局、交互、键盘、覆盖层或线上验证时读取。

## 布局

- 逐层量测 host-shell-page → panel → scene body → 内容元素的 padding。
- 像素级比较同层级标题、卡片和内容左右边界。
- 核对 section 间距、卡片内距和 `page_strategy.scroll_rhythm/content_density`。
- 截图审查整体层级，不能只报告无横向溢出。

## presentation

- 量测 panel 是否按 `coversTabBar` 覆盖底部导航。
- 检查 push 栈深度、返回后下层 DOM 与状态。
- 检查 overlay root、mask 和 panel 的 opacity/transition，确保面板不被遮罩动画带透明。

## 交互与键盘

- 从真实宿主入口进入，不直接跳过入口打开内部状态。
- 覆盖重复点击、失败、取消、返回和再次进入。
- 连续聚焦多个输入，检查导航固定、当前输入可见、无双层滚动。
- 键盘收起、返回和旋转后检查高度、安全区与滚动恢复。

## 证据

记录实际视口、路径、操作、量测值、截图或浏览器结果。未执行线上访问时不得推断 Production Ready。
