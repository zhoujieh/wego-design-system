# preview/index.html 内容滚动优化方案

## 问题分析

### 当前现状
`preview/index.html` 采用左右两栏布局：
- **左侧**：组件导航栏（`.overview-sidebar`，sticky 定位）
- **右侧**：组件预览区（`.overview-viewer`），通过 iframe 加载各单组件预览页

### 问题根因
1. **iframe 高度固定**：`height: calc(100vh - 140px)`，且设置了 `scrolling="no"`
2. **内容高度超过视口**：如 cell 组件预览页内容较多，高度远超 iframe 固定高度
3. **滚动容器错位**：`.overview-viewer` 虽设置了 `overflow-y: auto`，但只能滚动 iframe 元素本身，无法滚动 iframe 内部内容
4. 结果：iframe 底部内容被截断，无法查看完整组件（如 cell 组件的底部示例）

## 优化方案

### 核心思路：iframe 自适应内容高度 + 外层容器统一滚动

通过 JavaScript 在 iframe 加载完成后读取其内部文档的实际高度，动态设置 iframe 高度，让右侧预览区域的所有内容通过外层容器统一滚动。

### 具体修改

#### 1. 修改 `.overview-viewer` 样式
- 移除 `max-height: 100vh` 限制（或调整为合理值）
- 保持 `overflow-y: auto` 用于外层滚动

#### 2. 修改 iframe 样式与属性
- 移除固定高度 `height: calc(100vh - 140px)`
- 改为初始高度，由 JS 动态调整
- 保留 `scrolling="no"` 避免双层滚动条

#### 3. 新增 iframe 自适应高度 JS 逻辑
- 监听 iframe 的 `load` 事件
- 读取 `iframe.contentDocument.body.scrollHeight`（或 `documentElement.scrollHeight`）
- 动态设置 iframe 高度为内容实际高度
- 考虑跨域安全：当前为同域文件，可直接访问
- 切换组件时重新计算高度

#### 4. 左侧 sidebar sticky 优化
- 确保 sidebar 的 sticky 定位在右侧内容变长后仍正常工作
- 可能需要调整 `top` 值或增加 `max-height` + 自身滚动，避免 sidebar 内容过高时也看不全

#### 5. 响应式适配
- 移动端（991px 以下）布局改为单列，需确保 iframe 高度自适应仍正常
- 小屏下 iframe 高度逻辑保持一致

## 文件修改清单

| 文件 | 修改内容 |
|------|---------|
| `.design_library/wegoux/preview/index.html` | 1. 调整 `.overview-viewer` 高度相关样式<br>2. 调整 iframe 高度样式<br>3. 新增 iframe 自适应高度 JS 逻辑<br>4. 优化 sidebar sticky 行为 |

## 风险与注意事项

1. **跨域限制**：当前预览页均为同域文件，不存在跨域问题；未来若引入外部 URL 需额外处理
2. **iframe 内容动态变化**：如果组件预览页有展开/收起等动态高度变化，可能需要 `ResizeObserver` 监听（当前静态预览页不需要）
3. **sidebar 自身滚动**：如果未来组件数量继续增多，sidebar 可能也需要独立滚动，需预留方案
4. **性能影响**：每次切换组件都会触发一次高度计算，属于轻量操作，无性能问题

## 验证标准

- [ ] 切换到 cell 组件时，能滚动查看全部示例内容
- [ ] 所有 17 个组件预览均能完整显示
- [ ] 左侧导航栏在滚动时保持 sticky 定位正常
- [ ] 切换组件后高度正确更新
- [ ] 移动端（单列布局）下显示正常
- [ ] 不出现双层滚动条
