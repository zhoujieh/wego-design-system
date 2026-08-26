# 走查工具 MVP 实现计划

> 版本：v1.0（MVP，基于 Liaison v1.0.6 源码深度调研）
> 创建日期：2026-08-26
> 负责人：用户体验设计中心
> 状态：待确认
> 参考源码：`docs/plan/research/liaison-extension-source/`

---

## 一、MVP 目标与范围

### 1.1 核心目标

跑通 **选中元素 → 编辑样式 → 查看变更 → 复制 Prompt** 最短价值链路，在真实场景中验证核心交互体验。

### 1.2 MVP 包含模块

| 模块 | 自定义元素 | 说明 |
|------|-----------|------|
| 主应用根 | `wego-walkthrough` | 统筹所有子模块，状态管理 |
| 悬浮入口 | `wego-wt-fab` | 右下角悬浮按钮，展开/收起工具条 |
| 底部工具条 | `wego-wt-bottom-bar` | 走查模式、配置列表、更多三个按钮 |
| 走查横幅 | `wego-wt-banner` | 走查模式开启时顶部横幅 |
| 覆盖层 | `wego-wt-overlay` | 选中框、元素信息气泡 |
| 样式面板 | `wego-wt-style-panel` | 浮动面板，6 个纵向 section |
| 颜色选择器 | `wego-wt-color-picker` | 纯色 popover（Hex + 透明度 + 颜色面板） |
| 配置列表 | `wego-wt-overview-panel` | 浮动面板，全部/配置两 Tab |
| Toast | `wego-wt-toast` | 操作结果提示 |

### 1.3 MVP 暂不包含

- 测量模式、网格辅助线
- 渐变编辑器、多层填充/描边/投影（MVP 只做单层纯色）
- 共享元素模式、批注系统
- 失败注入迁移（现有功能保持不动）
- 快捷键、撤销/重做、JSON 导入导出
- 文本内联编辑、长按拖拽移动
- 面板拖拽停靠（MVP 面板固定位置，不可拖动）

---

## 二、技术架构

### 2.1 技术选型

- **核心框架**：Web Components（Custom Elements + Shadow DOM）
- **样式隔离**：Shadow DOM + `adoptedStyleSheets`
- **模块格式**：IIFE 封装，挂载到 `window.WegoApp.Walkthrough`
- **状态管理**：元素属性驱动（`data-*`）+ 主元素事件总线
- **数据持久化**：localStorage，按场景路由隔离

### 2.2 文件结构

```
.codex/skills/wego-design/runtime/
├── walkthrough-tool.js          # 主入口，注册所有 Custom Elements（单文件，MVP 不拆分）
└── walkthrough-tool.css         # 页面级样式（选中态、光标、横幅等）

同步目标：
wego-app/lib/js/walkthrough-tool.js
wego-app/lib/walkthrough-tool.css
```

> MVP 阶段所有模块写在单个 `walkthrough-tool.js` 文件中，降低构建复杂度。后续迭代再拆分模块。

### 2.3 与现有系统集成

1. **index.html**：引入 `walkthrough-tool.js` 和 `walkthrough-tool.css`
2. **app.js**：不修改，失败注入保持现有实现不动
3. **悬浮入口位置**：右下角 `right: 12px; bottom: 96px`（与现有失败注入按钮错开，MVP 阶段两者共存）
4. **设计系统 Token**：面板样式使用 wego 设计系统 CSS 变量

---

## 三、模块详细设计

### 3.1 悬浮入口（wego-wt-fab）

**形态与位置：**
- 固定右下角，`right: 12px; bottom: 96px`
- 圆形按钮，直径 48px
- 走查工具图标（使用设计系统 iconfont 或 SVG）
- z-index: 9500

**状态指示：**
- 走查模式开启时，按钮使用强调色填充
- 有未导出变更时，按钮右上角显示红色小圆点

**点击行为：**
- 点击展开/收起底部工具条
- 工具条展开时，按钮旋转 45° 变为关闭图标

### 3.2 底部工具条（wego-wt-bottom-bar）

**形态：**
- 悬浮按钮上方弹出，高度 56px
- 横向排列按钮，可横向滚动（MVP 只有 3 个按钮，不需要滚动）
- 圆角 12px，背景使用 `--bg-surface`，顶部边框 `--border-color`
- z-index: 9400

**按钮清单：**

| 按钮 | 功能 | 样式 |
|------|------|------|
| 走查模式 | 切换走查模式开/关 | 大按钮，强调色填充（开启时） |
| 配置列表 | 打开配置列表面板 | 次要按钮，显示变更数量 badge |
| 更多 | 弹出更多菜单 | 次要按钮，"⋯" 图标 |

**更多菜单（向上弹出）：**
- 重置修改（清空当前场景所有样式修改）
- ─── 分隔线 ───
- 关于走查工具（版本号，可选）

> MVP 阶段更多菜单只放"重置修改"，导入导出放后续迭代。

### 3.3 走查模式横幅（wego-wt-banner）

**形态：**
- 走查模式开启后，页面顶部固定显示
- 高度 28px，半透明品牌色背景，白色文字
- 文字："走查模式 · 触摸元素选中"
- 右侧"关闭"按钮（×，点击关闭走查模式）
- z-index: 9000

### 3.4 元素选中与覆盖层（wego-wt-overlay）

#### 3.4.1 走查模式开关

**开启时：**
- 页面设置 `data-walkthrough-mode="true"`
- 拦截页面 `touchstart`/`touchend` 事件（区分触摸和滑动）
- 显示顶部横幅
- 悬浮按钮变为强调色

**关闭时：**
- 移除 `data-walkthrough-mode`
- 取消选中元素，关闭样式面板
- 恢复正常页面交互

#### 3.4.2 触摸与滑动区分

```
触摸开始(touchstart)：记录起始坐标(x1,y1)和时间戳
触摸移动(touchmove)：移动距离 > 10px → 标记为"滑动"，不触发选中
触摸结束(touchend)：
  - 移动 ≤ 10px 且时长 < 500ms → "点击"，执行选中
  - 移动 > 10px → "滑动"，不选中，允许页面滚动
  - 时长 ≥ 500ms 且移动 ≤ 10px → "长按"（MVP 不处理拖拽，长按不触发任何操作）
```

#### 3.4.3 选中态视觉

| 属性 | 视觉效果 |
|------|---------|
| `data-selected="true"` | 2px 实线边框（`--text-brand`）+ 元素信息气泡 |
| `data-selected-hide="true"` | 隐藏选中边框（MVP 暂不需要） |

**选中边框实现：**
- 使用 `outline: 2px solid var(--text-brand)` + `outline-offset: 2px`
- 不修改元素自身的 border/padding，避免影响布局
- 过渡动画：`outline 0.15s ease`

#### 3.4.4 元素信息气泡

**内容：** 标签名 + 尺寸（如 `button · 120×44`）

**位置：**
- 优先显示在元素上方（气泡底部对齐元素顶部上方 8px）
- 元素靠近顶部（< 60px）时显示在下方
- 水平居中对齐元素
- 元素靠近屏幕边缘时，气泡自动调整水平位置避免超出屏幕（左右各留 8px）

**形态：**
- 深色半透明背景（`rgba(30,30,30,0.85)`），白色文字
- 圆角 6px，padding 4px 8px
- 字体 11px，行高 16px
- `pointer-events: none`，不影响操作
- 带小三角指向选中元素

#### 3.4.5 取消选中

- 触摸空白处（非元素、非工具 UI）→ 取消选中
- 关闭走查模式 → 取消选中
- 取消选中后自动关闭样式面板

### 3.5 样式面板（wego-wt-style-panel）

> 对齐 Liaison 实现：浮动面板，纵向 section，不是底部抽屉，不是横向 Tab。

#### 3.5.1 面板形态

**位置与尺寸：**
- `position: fixed`，默认显示在选中元素右侧
- 宽度 300px，`max-width: calc(100vw - 32px)`
- `max-height: 70vh`，内容超出可滚动（隐藏滚动条）
- 元素右侧空间不足（< 320px）时，显示在左侧
- 元素上下空间不足时，面板顶部对齐视口顶部下方 16px
- z-index: 9600

**视觉样式（对齐 Liaison，适配 wego Token）：**
- 圆角 16px
- 边框 1px `rgba(255,255,255,0.08)`（深色主题）/ 设计系统边框色
- 背景：`--bg-surface`（使用设计系统 Token，替代 Liaison 的半透明毛玻璃）
- 阴影：设计系统阴影 Token
- padding: 16px
- 内部 section 间距：gap 16px

**关闭方式：**
- 点击面板外部（页面空白处）
- 取消选中元素
- 关闭走查模式
- MVP 阶段面板不设关闭按钮（点击外部即可关闭）

#### 3.5.2 面板结构（从上到下）

**① 元素信息行（Header）**
- 左侧：元素标签名 + 选择器摘要（如 `button.btn · 120×44`），超出横向滚动
- 右侧：无（MVP 不做共享元素开关）

**② 属性分组（纵向 section，6 个）**

每个 section 结构：
```html
<section class="section">
  <p class="section-title">分组名</p>
  <div class="field-row">...</div>  <!-- 属性行 -->
</section>
```

section 样式：
- `.section-title`：字体 12px，颜色 `--text-tertiary`，margin-bottom 8px
- `.field-row`：display flex，gap 8px，align-items center
- `.field-row.two-col`：两列等宽布局
- 属性行间距：每个 field-row 之间 gap 8px

#### 3.5.3 属性分组详细设计

##### 分组 1：自动布局

| 属性 | 控件 | 数据字段 | 说明 |
|------|------|---------|------|
| 布局方向 | 图标按钮组（纵向/横向） | `layoutMode` | column/row，对齐 Liaison 的 layout-tabs |
| 对齐方式 | 3×3 矩阵点（9 个点） | `justifyContent` + `alignItems` | 点击矩阵点设置对齐，对齐 Liaison 的 alignment-matrix |
| 间距 gap | 数值输入 | `layoutGap` | px，带步进按钮 |
| padding-left | 数值输入 | `paddingLeft` | px |
| padding-top | 数值输入 | `paddingTop` | px |
| padding-right | 数值输入 | `paddingRight` | px |
| padding-bottom | 数值输入 | `paddingBottom` | px |
| 宽度 width | 数值输入 | `width` | px，MVP 放在自动布局分组 |
| 高度 height | 数值输入 | `height` | px |

**布局方向按钮：**
- 两个按钮并排，每个按钮含图标 + 文字（"纵向"/"横向"）
- 选中态：背景 `--text-brand` 12% 透明度，文字品牌色
- 高度 36px，圆角 8px

**对齐矩阵：**
- 3×3 网格，9 个圆点按钮
- 每个点 24x24px，圆点直径 8px
- 选中点填充品牌色，未选中为灰色
- 点击设置 justify-content 和 align-items 组合

**数值输入控件（通用）：**
- 结构：图标（可选）+ 输入框 + 步进按钮（±）
- 输入框：高度 32px，圆角 8px，边框 1px `--border-color`，聚焦时品牌色边框
- `inputmode="numeric"`，点击弹出数字键盘
- 步进按钮：±1px，长按连续加减（MVP 先做点击加减，长按可选）
- 单位：默认 px，不显示单位文字（数值即 px）

##### 分组 2：字体

| 属性 | 控件 | 数据字段 | 说明 |
|------|------|---------|------|
| font-size | 数值输入 | `fontSize` | px |
| font-weight | 下拉选择 | `fontWeight` | 100-900 / normal / bold |
| color | 颜色按钮 + Hex 输入 | `colorHex` | 点击弹出颜色选择器 |
| line-height | 数值输入 | `lineHeight` | 无单位倍数 |
| text-align | 按钮组（左/中/右） | `textAlign` | 三个图标按钮 |

**font-weight 下拉：**
- 自定义 select 样式，高度 32px，圆角 8px
- 选项：normal, 100, 200, 300, 400, 500, 600, 700, 800, 900, bold

**text-align 按钮组：**
- 三个图标按钮（左对齐/居中/右对齐），每个 32x32px
- 选中态品牌色背景

##### 分组 3：外观

| 属性 | 控件 | 数据字段 | 说明 |
|------|------|---------|------|
| opacity | 数值输入（带 %） | `layerOpacity` | 0-100% |
| border-radius | 数值输入 + 展开按钮 | `borderRadiusAll` | px，点击展开按钮可四角独立（MVP 先做联动，四角独立可选） |

**圆角展开（可选，MVP 先做联动）：**
- 点击展开按钮后，显示四个角的独立数值输入（top-left/top-right/bottom-right/bottom-left）
- 对齐 Liaison 的 `_isRadiusExpanded` 状态

##### 分组 4：填充（背景）

> MVP 只做单层纯色填充，不做渐变和多层。

| 属性 | 控件 | 数据字段 | 说明 |
|------|------|---------|------|
| 填充颜色 | 颜色按钮 + Hex 输入 + 透明度输入 | `fillHex` + `fillOpacity` | 点击颜色按钮弹出颜色选择器 |

**条件渲染：**
- 元素无背景色时，不显示填充分组（或显示"添加填充"按钮）
- MVP 简化：始终显示填充分组，颜色为透明时显示"无"

**颜色行结构（对齐 Liaison）：**
```html
<label class="field">
  <button class="color-button">  <!-- 32x32 圆形色块 -->
    <span class="field-icon" style="--swatch-color: #xxx"></span>
  </button>
  <input class="text-input" value="#FFFFFF" data-commit-field="fillHex" />
  <input class="text-input opacity-input" value="100%" data-commit-field="fillOpacity" />
</label>
```

- 颜色按钮：32x32px，圆形，显示当前颜色色块，点击弹出颜色选择器
- Hex 输入：文本输入，显示 6 位 Hex 值
- 透明度输入：数值输入，带 %，0-100

##### 分组 5：描边

> MVP 只做单层描边。

| 属性 | 控件 | 数据字段 | 说明 |
|------|------|---------|------|
| 描边颜色 | 颜色按钮 + Hex 输入 + 透明度输入 | `strokeHex` + `strokeOpacity` | |
| 描边宽度 | 数值输入 | `strokeWidth` | px |
| 描边位置 | 下拉选择 | `strokePosition` | 内描边/外描边/居中描边 |

**条件渲染：**
- 元素无描边时，显示"添加描边"按钮，点击后添加一层描边
- MVP 简化：始终显示描边分组，宽度为 0 时表示无描边

##### 分组 6：投影

> MVP 只做单层投影。

| 属性 | 控件 | 数据字段 | 说明 |
|------|------|---------|------|
| 投影颜色 | 颜色按钮 + Hex 输入 + 透明度输入 | `shadowHex` + `shadowOpacity` | |
| 投影类型 | 下拉选择 | `shadowInset` | 外阴影/内阴影 |
| x 偏移 | 数值输入 | `shadowX` | px |
| y 偏移 | 数值输入 | `shadowY` | px |
| blur | 数值输入 | `shadowBlur` | px |
| spread | 数值输入 | `shadowSpread` | px |

**条件渲染：**
- 元素无投影时，显示"添加投影"按钮
- MVP 简化：始终显示投影分组，blur 为 0 时表示无投影

#### 3.5.4 样式读取与应用

**读取（选中元素时）：**
- 使用 `getComputedStyle(element)` 读取计算样式
- 转换为面板数据字段格式（如 `padding-left` → `paddingLeft`，去掉 px 单位）
- 颜色值转换为 Hex + 透明度（rgba → hex + opacity%）
- 投影解析：`box-shadow` 字符串解析为 x/y/blur/spread/color/inset

**应用（修改时）：**
- 直接设置 `element.style[property] = value`
- 数值属性自动加 px 单位（除非是无单位属性如 line-height、opacity、z-index）
- 颜色属性：Hex + 透明度组合为 rgba 或 8位 Hex
- 投影：组合为 `box-shadow` 字符串
- 每次修改触发 `change` 事件，记录到变更列表

#### 3.5.5 变更记录

每次属性修改记录一条变更：
```javascript
{
  id: "change-xxx",
  selector: "#element-selector",
  elementTag: "button",
  elementText: "立即购买",
  property: "padding-left",
  oldValue: "12px",
  newValue: "16px",
  timestamp: Date.now()
}
```

- 修改前记录 oldValue（从 getComputedStyle 读取）
- 修改后记录 newValue
- 同一元素同一属性的多次修改合并为一条（更新 newValue 和 timestamp）

### 3.6 颜色选择器（wego-wt-color-picker）

> MVP 只做纯色，不做渐变。对齐 Liaison 的 color-popover 结构。

**形态：**
- `position: absolute`，相对于触发按钮定位
- 宽度 280px
- 圆角 14px，背景 `--bg-surface`，边框 1px
- z-index: 9700（在样式面板之上）
- 点击外部关闭

**结构（从上到下）：**

**① Header**
- 左侧：标题"颜色"
- 右侧：关闭按钮 ×

**② 颜色面板**
- 色相条（横向，可拖动选择色相）
- 饱和度/亮度选择区（大方块，可拖动选择）
- MVP 可简化为：使用 `<input type="color">` 原生颜色选择器 + Hex 输入 + 透明度滑块
- 优先方案：原生 `input type="color"`（兼容性好，实现简单），配合 Hex 输入和透明度滑块

**③ Hex 输入**
- 文本输入框，显示 6 位 Hex 值（如 `#FFFFFF`）
- 支持手动输入，输入时实时更新颜色

**④ 透明度滑块**
- 横向滑块，0-100%
- 显示当前透明度数值
- 棋盘格背景表示透明

**应用：**
- 颜色修改实时应用到目标元素
- 同时更新触发按钮的色块显示
- Hex + 透明度组合为 rgba 或 8位 Hex 设置到元素样式

### 3.7 配置列表面板（wego-wt-overview-panel）

> 对齐 Liaison 的 page-overview-panel，浮动面板形态。

**形态：**
- `position: fixed`，居中显示或右上角显示
- 宽度 340px，`max-width: calc(100vw - 32px)`
- `max-height: 80vh`，内容可滚动
- 圆角 16px，背景 `--bg-surface`，边框 1px，阴影
- z-index: 9600
- 与样式面板互斥（打开配置列表时关闭样式面板）

**结构（从上到下）：**

**① Header**
- 左侧：标题"配置列表" + 变更计数（如"3 项变更"）
- 右侧：操作按钮
  - 复制 Prompt（主要按钮，强调色）
  - 关闭按钮 ×

**② Tab 栏**
- 两个 Tab：全部 / 配置
- Tab 样式：圆角 8px，选中态背景 `--text-brand` 12%，文字品牌色
- MVP 不做"评论"Tab（批注系统后续迭代）

**③ 配置项列表**

按元素分组，每组结构：
```html
<div class="item">
  <div class="item-top">
    <span class="item-selector">button.btn</span>
    <span class="item-text">立即购买</span>
    <button class="item-delete">删除</button>
  </div>
  <div class="item-changes">
    <div class="change-row">
      <span class="change-property">padding-left</span>
      <span class="change-old">12px</span>
      <span class="change-arrow">→</span>
      <span class="change-new">16px</span>
      <button class="change-delete">×</button>
    </div>
  </div>
</div>
```

- 每组显示：元素选择器 + 元素文本摘要 + 该元素下所有属性变更
- 每个变更显示：属性名 + 原值 → 新值 + 单条删除按钮
- 点击元素选择器 → 关闭配置面板 → 选中对应元素并高亮
- 空状态："当前还没有配置修改，选中元素后在样式面板中修改"

**④ 底部操作（可选）**
- 重置修改按钮（危险色文字按钮）
- MVP 可放在 Header 或更多菜单中

### 3.8 Prompt 导出格式

> 对齐 Liaison 实际格式（从源码 `buildOverviewPrompt` 方法提取）。

```
## Page Feedback: {场景路由}
**Viewport:** {宽度}×{高度}

### 1. {元素描述}
**Location:** {CSS 选择器}
**Source:** {元素标签名 · 文本摘要}
**Feedback:** {属性1}: {原值} → {新值} | {属性2}: {原值} → {新值}

### 2. {元素描述}
**Location:** {CSS 选择器}
**Source:** {元素标签名 · 文本摘要}
**Feedback:** {属性}: {原值} → {新值}
```

**字段说明：**
- `Page Feedback`：场景路由（如 `friend-list`、`dynamic`）
- `Viewport`：当前视口尺寸（375×812）
- `### N. 元素描述`：元素标签名 + 文本摘要（如 `button · 立即购买`）
- `Location`：CSS 选择器
- `Source`：元素来源信息（MVP 为标签名 + 文本）
- `Feedback`：所有属性变更用 `|` 连接，每条格式为 `属性: 原值 → 新值`

**空状态：**
```
## Page Feedback: {场景路由}
**Viewport:** {宽度}×{高度}

当前还没有记录到任何配置修改。
```

**复制实现：**
- 优先使用 `navigator.clipboard.writeText()`
- 失败时回退到 `document.execCommand('copy')`（创建临时 textarea）
- 复制成功：toast "已复制 Prompt"
- 复制失败：toast "复制失败，请手动复制"

### 3.9 Toast 提示（wego-wt-toast）

**形态：**
- 底部居中弹出，位于底部工具条上方
- 深色半透明背景 + 白色文字 + 图标
- 圆角 8px，padding 8px 16px
- 字体 13px
- z-index: 9800（最顶层）
- `pointer-events: none`，不拦截点击

**触发场景：**
- 复制 Prompt 成功/失败
- 重置修改成功
- 颜色应用（可选，不需要 toast）

**动画：**
- 从底部滑入 + 淡入（200ms）
- 2 秒后淡出 + 下滑（200ms）
- 最多同时显示 1 条，新 toast 替换旧的

### 3.10 CSS 选择器生成

为选中元素生成稳定 CSS 选择器，优先级：
1. 唯一 `id` → `#id`
2. 稳定 `data-*` 属性（`data-component-slug`、`data-dom-id` 等）
3. `tagname.class:nth-child(n)` 路径链，从最近的稳定祖先开始
4. 生成后验证唯一性：`document.querySelectorAll(selector).length === 1`

**实现要点：**
- 跳过 wego 工具自身的元素（`wego-walkthrough` 及其子元素）
- 优先使用 wego-app 场景中常见的稳定属性（`data-component-slug` 等）
- 选择器尽量简短，避免过长的路径链

---

## 四、数据持久化

### 4.1 存储方案

- 使用 `localStorage`，所有 key 以 `wego.walkthrough.` 为前缀
- 按场景路由隔离：`wego.walkthrough.data.{routeId}`
- 全局设置：`wego.walkthrough.settings`

### 4.2 数据结构

```javascript
{
  sceneRoute: "route-id",
  lastModified: 1724659200000,
  changes: [
    {
      id: "change-001",
      selector: "#product-list .card:nth-child(2) .btn",
      elementTag: "button",
      elementText: "立即购买",
      property: "padding-left",
      oldValue: "12px",
      newValue: "16px",
      timestamp: 1724659215000
    }
  ]
}
```

### 4.3 数据生命周期

- **进入场景时**：加载对应场景数据，有变更时悬浮按钮显示红点
- **每次修改时**：自动保存（debounce 300ms）
- **离开场景时**：自动保存
- **重置修改时**：清空当前场景 changes 数组，保存
- **导出/复制后**：不自动清除，用户手动重置

### 4.4 场景路由获取

- 从 URL hash 获取：`#/route-id` → `route-id`
- 监听 `hashchange` 事件，切换场景时重新加载数据
- 无 hash 时使用 `default` 作为 key

---

## 五、面板层级与互斥关系

| 面板 | z-index | 互斥关系 |
|------|---------|---------|
| 走查模式横幅 | 9000 | 常驻（走查模式开启时） |
| 悬浮按钮 | 9500 | 常驻，始终可点击 |
| 底部工具条 | 9400 | 样式面板/配置面板打开时自动收起 |
| 样式面板 | 9600 | 与配置面板互斥 |
| 配置面板 | 9600 | 与样式面板互斥 |
| 颜色选择器 | 9700 | 在样式面板之上弹出，不关闭样式面板 |
| 更多菜单 | 9700 | 在工具条之上弹出，点击外部关闭 |
| Toast | 9800 | 最顶层，不拦截点击 |

**关键规则：**
- 样式面板和配置面板不能同时打开
- 颜色选择器是样式面板的子弹层，在面板之上
- 工具条在面板打开时自动收起（避免被遮挡）
- 悬浮按钮始终在最上层可访问

---

## 六、实施步骤与里程碑

### M1：框架搭建与入口（0.5 个工作单元）

- [ ] 创建 `walkthrough-tool.js` 权威源文件（IIFE 封装，挂载 `window.WegoApp.Walkthrough`）
- [ ] 创建 `walkthrough-tool.css` 页面级样式
- [ ] 实现 `wego-walkthrough` 主元素（Shadow DOM + 事件总线）
- [ ] 实现 `wego-wt-fab` 悬浮按钮
- [ ] 实现 `wego-wt-bottom-bar` 底部工具条（3 个按钮 + 更多菜单）
- [ ] 实现 `wego-wt-banner` 走查横幅
- [ ] 实现 `wego-wt-toast` 组件
- [ ] 在 `index.html` 引入文件
- [ ] 验证：悬浮按钮显示，点击展开工具条，按钮可点击，横幅显示，toast 正常

### M2：元素选中与高亮（0.5 个工作单元）

- [ ] 实现走查模式开关（事件拦截、触摸/滑动区分）
- [ ] 实现 `wego-wt-overlay` 覆盖层
- [ ] 实现触摸选中（2px 实线边框 + 元素信息气泡）
- [ ] 实现元素信息气泡（标签名+尺寸，位置自动适配）
- [ ] 实现取消选中（触摸空白处）
- [ ] 实现 CSS 选择器生成（id / data-* / nth-child 路径链 + 唯一性验证）
- [ ] 验证：走查模式下触摸选中元素，显示边框+气泡，滑动不误触，空白处取消选中

### M3：样式面板核心（1 个工作单元）

- [ ] 实现 `wego-wt-style-panel` 浮动面板（300px 宽，位置智能适配，纵向 section）
- [ ] 实现面板元素信息行（标签名+选择器+尺寸）
- [ ] 实现「自动布局」分组（布局方向、对齐矩阵、gap、padding、width/height）
- [ ] 实现「字体」分组（font-size、font-weight、color、line-height、text-align）
- [ ] 实现「外观」分组（opacity、border-radius）
- [ ] 实现数值输入控件（通用组件，带步进按钮）
- [ ] 实现样式读取（getComputedStyle → 面板数据）和实时应用（element.style）
- [ ] 实现变更记录（每次修改记录 oldValue/newValue）
- [ ] 验证：选中元素后面板自动弹出，属性修改实时生效，变更被记录

### M4：颜色选择器 + 填充/描边/投影（0.5 个工作单元）

- [ ] 实现 `wego-wt-color-picker` 颜色选择器（原生 input color + Hex 输入 + 透明度滑块）
- [ ] 实现「填充」分组（单层纯色：颜色按钮 + Hex + 透明度）
- [ ] 实现「描边」分组（单层：颜色 + 宽度 + 位置）
- [ ] 实现「投影」分组（单层：颜色 + 类型 + x/y/blur/spread）
- [ ] 实现颜色解析（rgba ↔ Hex + 透明度）和投影解析（box-shadow 字符串解析）
- [ ] 验证：颜色选择器弹出正常，填充/描边/投影修改实时生效

### M5：配置列表 + 复制 Prompt + 持久化（0.5 个工作单元）

- [ ] 实现 `wego-wt-overview-panel` 配置列表面板（浮动面板，全部/配置 Tab）
- [ ] 实现配置项展示（按元素分组、属性变更列表、单条删除、点击跳转选中）
- [ ] 实现复制 Prompt（对齐 Liaison 格式 + 剪贴板复制 + toast）
- [ ] 实现重置修改（清空当前场景变更 + toast）
- [ ] 实现 localStorage 数据持久化（按场景路由隔离、自动保存/加载）
- [ ] 实现悬浮按钮红点指示（有未导出变更时）
- [ ] 验证：配置列表展示正确，复制 Prompt 格式正确，刷新后数据恢复，重置正常

### M6：同步与验证（0.5 个工作单元）

- [ ] 权威源同步到 `wego-app/lib/js/walkthrough-tool.js` 和 `wego-app/lib/walkthrough-tool.css`
- [ ] 多场景验证（至少 3 个场景）
- [ ] 375px 宽度下所有面板内容不溢出
- [ ] 现有场景页面正常加载，无 JS 报错
- [ ] 编写简要使用说明

**合计：约 3.5 个工作单元**

---

## 七、验收标准

### 7.1 功能验收

- [ ] **悬浮入口**：右下角悬浮按钮正常显示，点击展开/收起底部工具条
- [ ] **走查模式**：开启后顶部显示横幅，触摸元素即选中；关闭后恢复正常页面交互
- [ ] **元素选中**：选中显示 2px 实线边框 + 元素信息气泡（标签名+尺寸），气泡位置自动适配不超出屏幕
- [ ] **触摸滑动区分**：滑动页面不误选中元素，点击（≤10px 移动）才选中
- [ ] **样式面板**：选中元素后浮动面板自动弹出（300px 宽），位置智能适配，6 个纵向 section
- [ ] **自动布局分组**：布局方向切换、对齐矩阵、gap、padding、width/height 数值输入正常
- [ ] **字体分组**：font-size、font-weight、color、line-height、text-align 修改实时生效
- [ ] **外观分组**：opacity、border-radius 修改实时生效
- [ ] **填充分组**：单层纯色填充，颜色选择器正常，修改实时生效
- [ ] **描边分组**：单层描边，颜色/宽度/位置修改实时生效
- [ ] **投影分组**：单层投影，颜色/类型/x/y/blur/spread 修改实时生效
- [ ] **颜色选择器**：弹出正常，Hex 输入、颜色选择、透明度滑块正常
- [ ] **数值输入**：所有数值输入框带步进按钮，修改实时生效
- [ ] **配置列表**：浮动面板正常打开，全部/配置 Tab 切换，按元素分组展示变更
- [ ] **单条删除**：配置列表中每条变更可单独删除，删除后元素样式恢复
- [ ] **点击跳转**：点击配置列表中的元素选择器，关闭面板并选中对应元素
- [ ] **复制 Prompt**：生成的文本格式对齐 Liaison，包含选择器、属性变更，复制成功有 toast
- [ ] **重置修改**：清空当前场景所有变更，元素样式恢复，有成功 toast
- [ ] **数据持久化**：刷新页面后走查数据恢复，切换场景数据互不影响
- [ ] **悬浮按钮红点**：有未导出变更时悬浮按钮显示红点
- [ ] **Toast**：复制/重置等操作有 toast 提示，2 秒自动消失
- [ ] **面板互斥**：样式面板和配置面板不同时打开，颜色选择器在样式面板之上

### 7.2 兼容性验收

- [ ] 现有所有场景页面正常加载，无 JS 报错
- [ ] 现有失败注入功能正常工作（未被影响）
- [ ] 375px 宽度下所有面板内容不溢出、不变形
- [ ] 本地预览环境功能正常

### 7.3 体验验收

- [ ] 走查模式切换响应迅速，无延迟
- [ ] 元素选中高亮准确，气泡位置不超出屏幕
- [ ] 样式修改实时生效，无闪烁
- [ ] 浮动面板弹出位置合理，不遮挡选中元素（空间足够时）
- [ ] 数值输入框点击弹出数字键盘，步进按钮响应灵敏
- [ ] 颜色选择器弹出位置合理，不超出屏幕
- [ ] 配置列表滚动流畅
- [ ] 所有按钮点击区域 ≥ 44x44px，无误触
- [ ] 空状态有友好提示文案

---

## 八、关键决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| 面板形态 | 浮动面板（对齐 Liaison），非底部抽屉 | 用户明确要求对齐参考插件效果；Liaison 源码确认是 300px 浮动面板 |
| 属性分组 | 纵向 section，非横向 Tab | Liaison 源码确认是纵向排列的 section，一屏可见全部分组标题 |
| 分组数量 | 6 个（自动布局/字体/外观/填充/描边/投影） | 对齐 Liaison 实际分组；定位合并到自动布局，圆角合并到外观 |
| 颜色选择器 | 原生 input type="color" + Hex + 透明度 | MVP 简化实现，兼容性好；后续迭代可做自定义颜色面板 |
| 多层效果 | MVP 只做单层 | 降低复杂度；多层效果后续迭代 |
| 配置面板形态 | 浮动面板（对齐 Liaison） | 与样式面板保持一致的视觉语言 |
| Prompt 格式 | 对齐 Liaison 实际格式（### N. + Location/Source/Feedback） | 从源码 buildOverviewPrompt 方法提取，非计划文档中的简化格式 |
| 代码组织 | 单文件 walkthrough-tool.js | MVP 降低构建复杂度；后续迭代再拆分模块 |
| 失败注入 | 不迁移，保持现有实现 | MVP 范围控制；避免破坏现有场景代码 |
| 面板拖拽 | MVP 不做，固定位置 | 降低复杂度；位置智能适配足够覆盖大部分场景 |
