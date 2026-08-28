# Liaison 插件源码研究报告

> 研究目的：拆解 Liaison 插件的核心交互和 UI 实现，作为 wego-app 走查工具的设计参考。  
> 源码来源：Chrome 扩展安装目录（版本 1.0.6），仅用于研究参考，不直接拷贝代码。  
> 研究日期：2026-08-26

---

## 一、整体架构

### 1.1 技术栈

- **核心框架**：Web Components（Custom Elements + Shadow DOM）
- **模块格式**：ES Module
- **样式方案**：Shadow DOM 内联 CSS + CSS 变量
- **状态管理**：通过元素属性（`data-*`、`color-mode`、`color-scheme`）驱动 UI

### 1.2 文件结构

```
1.0.6_0/
├── manifest.json              # 扩展配置（MV3）
├── liaison.js                 # Background Service Worker（注入/切换逻辑）
├── icons/                     # 图标资源
├── contextmenu/               # 右键菜单
│   ├── launcher.js            # 启动切换
│   ├── colormode.js           # 颜色模式
│   └── colorscheme.js         # 配色方案
└── toolbar/                   # 核心注入内容
    ├── bundle.css             # 页面级样式（仅 35 行，主要控制选中态）
    ├── bundle.min.js          # 核心逻辑（582K，Web Components 全部实现）
    ├── inject.js              # 注入脚本（创建 <liaison-app> 元素）
    ├── eject.js               # 退出脚本（移除元素，带滑出动画）
    └── restore.js             # 恢复脚本（重新创建元素）
```

### 1.3 注入流程

1. 用户点击扩展图标或按 `Alt+Shift+D`
2. Background Service Worker（`liaison.js`）判断当前状态：
   - 首次注入：插入 `bundle.css` + 执行 `inject.js`
   - 已注入但隐藏：执行 `restore.js`（重新创建 `<liaison-app>`）
   - 已注入且显示：执行 `eject.js`（移除元素，带左侧滑出动画）
3. `inject.js` 创建 `<script type="module">` 加载 `bundle.min.js`，同时 `document.body.prepend(<liaison-app>)`
4. `bundle.min.js` 注册所有 Custom Elements，`<liaison-app>` 开始渲染

### 1.4 自定义元素清单（共 33 个）

**核心容器：**
- `liaison-app` — 主应用根元素
- `liaison-top-toolbar` — 顶部工具栏
- `liaison-style-panel` — 样式编辑面板
- `liaison-overlay` — 页面覆盖层（高亮蒙层）

**元素交互：**
- `liaison-hover` — 悬停预览（虚线高亮）
- `liaison-handle` / `liaison-handles` / `liaison-grip` — 调整手柄
- `liaison-label` — 元素信息标签
- `liaison-offscreen-label` — 离屏标签
- `liaison-distance` — 距离测量
- `liaison-gridlines` — 网格/对齐辅助线

**样式编辑子组件：**
- `liaison-boxmodel` — 盒模型（间距调整）
- `liaison-corners` — 圆角（四角独立）
- `liaison-metatip` — 元信息提示

**批注系统：**
- `liaison-comment-panel` — 批注输入面板
- `liaison-comment-list-panel` — 批注列表面板

**配置汇总：**
- `liaison-page-overview-panel` — 页面概览面板（配置列表汇总）

**无障碍与快捷键：**
- `liaison-ally` — 无障碍辅助
- `liaison-hotkeys` — 快捷键管理
- `hotkey-map` / `hotkeys-accessibility` / `hotkeys-align` / `hotkeys-boxshadow` / `hotkeys-font` / `hotkeys-guides` / `hotkeys-hueshift` / `hotkeys-inspector` / `hotkeys-margin` / `hotkeys-move` / `hotkeys-padding` / `hotkeys-position` / `hotkeys-search` / `hotkeys-text` — 各功能的快捷键映射

---

## 二、UI 界面拆解

### 2.1 顶部工具栏（liaison-top-toolbar）

**位置**：页面顶部，固定悬浮，可拖拽移动

**按钮组（从左到右）：**

| 按钮 | 功能 | 快捷键 |
|------|------|--------|
| 浏览/收起 | 切换浏览模式（关闭编辑，只查看） | — |
| 配置列表 | 打开/关闭配置列表面板 | `L` |
| 展开编辑 | 展开/收起样式编辑面板 | `Tab` |
| 固定编辑器 | 将样式面板固定到侧边（docked 模式） | — |
| 更多 | 下拉菜单 | — |

**更多菜单内容：**
- 固定编辑器（带状态指示）
- 导入配置
- 导出配置
- 问题反馈（飞书链接）

**工具栏特性：**
- 可折叠：折叠后只显示几个核心按钮，节省空间
- 可拖拽：整个工具栏可在页面上拖拽移动
- 计数显示：`data-toolbar-count` 显示当前配置/评论数量

### 2.2 样式编辑面板（liaison-style-panel）

**位置**：默认浮动在选中元素旁边，可切换为固定侧边栏模式

**面板头部：**
- 当前元素信息（标签名 + 选择器摘要）
- 「仅编辑当前元素 / 共享元素」切换开关
  - 共享元素开启后，修改会同时应用到所有同类元素（如所有 `.btn` 按钮）
  - 显示"当前命中 N 个同类元素"
- 固定/浮动切换

**面板内容（分组顺序）：**

1. **定位** — position、top/right/bottom/left、z-index
2. **自动布局** — display（flex/grid/block）、flex-direction、justify-content、align-items、gap、flex-wrap
3. **字体** — font-family（带搜索菜单）、font-weight、font-size、line-height、letter-spacing、text-align、text-transform、text-decoration
4. **外观** — opacity、visibility、overflow、border-radius（联动）
5. **填充** — 支持多层填充，每层可选「实色」或「渐变」，带颜色选择器和透明度
6. **描边** — 支持多层描边，可选「内描边」或「外描边」，颜色 + 宽度 + 样式
7. **投影** — 支持多层投影，可选「内阴影」或「外阴影」，x/y/blur/spread/color
8. **圆角（独立）** — liaison-corners 组件，四角独立调整，可联动

**面板底部：**
- 重置修改（单元素）
- 添加效果（填充/描边/投影）

**颜色选择器特性：**
- 支持 Hex / RGB / HSL 格式切换
- 透明度滑块
- 渐变色编辑（色标节点、线性/径向渐变）
- 最近使用颜色

### 2.3 配置列表面板（liaison-page-overview-panel）

**位置**：从右侧滑入的面板

**顶部 Tab：**
- `全部` — 显示所有配置修改和评论
- `配置` — 只显示样式修改
- `评论` — 只显示批注

**Tab 栏右侧按钮：**
- 复制 Prompt — 一键复制结构化 Prompt 到剪贴板
- 导入 — 导入之前导出的配置
- 导出 — 导出当前配置为 JSON
- 重置修改 — 清空所有配置修改

**配置项展示：**
- 按元素分组，每组显示元素选择器
- 每个配置项显示 CSS 属性名 + 修改后的值
- 支持单条删除
- 代码视图切换（可查看原始 CSS）

**评论项展示：**
- 显示批注内容 + 关联元素
- 支持编辑和删除

### 2.4 批注面板（liaison-comment-panel）

**触发方式**：选中元素后，从配置列表或工具栏打开评论输入

**面板内容：**
- 当前选中元素信息
- 文本输入框（textarea），placeholder："先点击页面上的一个元素，再输入评论"
- 保存评论按钮
- 评论列表（已保存的评论，支持编辑/删除）

### 2.5 页面覆盖层（liaison-overlay）

**元素选中态**：
- `data-selected=true` — 实线边框 + 8 个调整手柄 + 尺寸标签
- `data-pseudo-select=true` — 紫色虚线边框（悬停预览）
- `data-selected-hide=true` — 隐藏选中态的 ::after 伪元素
- `contenteditable=true` — 文本编辑模式，光标颜色为 `--neon-pink`

**测量模式**：
- `data-measuring=true` — 十字光标，测量元素间距

**拖拽模式**：
- `draggable=true` — grab 光标，激活时为 grabbing

---

## 三、核心交互拆解

### 3.1 元素选中流程

1. 开启编辑模式后，鼠标悬停元素 → 显示紫色虚线高亮（`data-pseudo-select=true`）
2. 点击元素 → 选中该元素（`data-selected=true`）
3. 选中后显示：
   - 实线边框
   - 8 个调整手柄（四角 + 四边中点）
   - 元素信息标签（标签名 + 尺寸）
   - 样式编辑面板自动定位到元素旁边
4. 点击其他元素 → 切换选中目标
5. 点击空白处 → 取消选中

### 3.2 样式修改流程

1. 选中元素后，样式面板自动读取 `getComputedStyle` 的计算值
2. 用户在面板中修改属性 → 直接设置 `element.style[property]`
3. 修改实时生效，页面即时预览
4. 修改记录自动添加到配置列表
5. 支持「共享元素」模式：修改同时应用到所有匹配同类选择器的元素

### 3.3 getComputedStyleSummary 提取的属性

Liaison 在导出时提取以下计算样式：

```javascript
{
  display, position, width, height,
  color, backgroundColor, opacity,
  fontSize, fontWeight, textAlign,
  justifyContent, alignItems, gap,
  padding, borderRadius, boxShadow
}
```

### 3.4 批注流程

1. 选中元素
2. 打开评论面板，输入批注内容
3. 点击「保存评论」→ 批注与元素绑定
4. 批注显示在配置列表的「评论」Tab 中
5. 导出时批注纳入 Prompt

### 3.5 导出流程

**Prompt 格式（Markdown）：**

```
## Page Feedback: {页面路径}
**Viewport:** {宽度}×{高度}

1. 元素：{元素描述}
   选择器：{CSS 选择器}
   配置修改：
   - {属性}: {原值} → {新值}
   评论：{批注内容}
   文案：{元素文本内容}

2. ...
```

**JSON 格式：**

```javascript
{
  page: {
    path: "页面URL",
    viewport: { width, height }
  },
  exportedAt: "ISO时间戳",
  annotations: [
    {
      elements: [...],     // 关联元素
      configs: [...],      // 样式修改
      comments: [...],     // 批注
      text: "..."          // 元素文案
    }
  ]
}
```

### 3.6 快捷键系统

Liaison 有非常丰富的快捷键支持，按功能分组：

| 分组 | 功能 |
|------|------|
| move | 元素移动（方向键微调） |
| margin | 外边距调整 |
| padding | 内边距调整 |
| font | 字体属性 |
| text | 文本属性 |
| align | 对齐方式 |
| position | 定位属性 |
| boxshadow | 投影 |
| inspector | 检查器 |
| guides | 辅助线 |
| search | 搜索 |
| hueshift | 色相偏移 |
| accessibility | 无障碍 |

---

## 四、视觉设计拆解

### 4.1 颜色体系

Liaison 使用「霓虹」色系作为品牌视觉：

| 变量名 | 用途 |
|--------|------|
| `--neon-pink` | 主强调色、选中文本光标 |
| `--neon-purple` | 悬停高亮边框（hsl(267, 100%, 58%)） |
| `--neon-cyan` | 辅助强调色 |
| `--neon-lime` | 成功/确认色 |
| `--agentation-color-accent` | 交互强调色 |
| `--agentation-color-green` | 成功状态 |
| `--agentation-color-red` | 危险/删除状态 |

**中性色：**
- `--dark-grey`、`--grey`、`--light-grey`

### 4.2 面板样式

- 圆角：`--border-radius`、`--radius-round`
- 阴影：`--shadow`、`--shadow-color`、`--shadow-strength`、`--shadow-direction`
- 背景：深色半透明（类似 Figma 的深色面板风格）

### 4.3 动画

- 选中态过渡：`transition: all 0.15s ease`
- 退出动画：`translateX(-200%)` + opacity 0，300ms ease-out（从左侧滑出）
- 面板定位：`anchorTo(boundingRect)` 自动锚定到选中元素旁边

---

## 五、数据存储

### 5.1 存储方式

- `localStorage` — 持久化配置和评论
- `sessionStorage` — 会话级临时状态
- `chrome.storage` — 扩展级存储（颜色模式、配色方案等全局设置）

### 5.2 状态属性

通过元素属性驱动 UI 状态：

| 属性 | 值 | 用途 |
|------|-----|------|
| `color-mode` | light/dark | 颜色模式 |
| `color-scheme` | — | 配色方案 |
| `data-selected` | true/false | 元素选中 |
| `data-pseudo-select` | true/false | 悬停预览 |
| `data-measuring` | true/false | 测量模式 |
| `data-docked` | true/false | 面板固定模式 |
| `data-active` | true/false | 激活状态 |
| `data-state` | — | 通用状态 |
| `data-commit-field` | — | 表单提交字段标识 |
| `data-label-id` | — | 标签关联 ID |

---

## 六、对 wego-app 走查工具的借鉴建议

### 6.1 可以直接借鉴的设计

1. **Web Components 架构**：使用 Custom Elements + Shadow DOM 封装走查工具，避免与页面样式冲突。wego-app 可以用同样的方式，创建 `<wego-walkthrough>` 自定义元素。
2. **样式面板分组顺序**：定位 → 自动布局 → 字体 → 外观 → 填充 → 描边 → 投影，这个顺序符合设计师的使用习惯。
3. **配置列表三 Tab**：全部 / 配置 / 评论，清晰分离不同类型的走查记录。
4. **共享元素模式**：修改同类元素批量应用，适合原型走查中统一调整组件样式。
5. **多层填充/描边/投影**：支持图层叠加，满足复杂样式需求。
6. **Prompt 导出格式**：Markdown 格式，包含页面路径、视口尺寸、元素选择器、样式变更、批注，结构清晰，AI 容易理解。

### 6.2 需要适配 wego-app 的部分

1. **面板位置**：Liaison 是桌面端右侧面板，wego-app 是 375px 手机视口，需要改为底部抽屉式面板。
2. **工具栏位置**：Liaison 是顶部悬浮工具栏，wego-app 应复用现有的右下角悬浮入口。
3. **颜色体系**：Liaison 用霓虹色系，wego-app 应使用自己的设计系统 Token。
4. **快捷键**：Liaison 有丰富的键盘快捷键，手机端主要靠触摸操作，快捷键可作为桌面端预览的辅助。
5. **存储隔离**：Liaison 按 URL 存储，wego-app 应按场景路由（`#/route-id`）存储。

### 6.3 可以简化的部分（一期不需要）

1. **多层填充/描边/投影**：一期只支持单层，二期再加多层。
2. **渐变填充**：一期只支持实色，二期再加渐变。
3. **共享元素模式**：一期只支持单元素编辑，二期再加批量。
4. **测量模式 + 距离显示**：二期再加。
5. **完整的快捷键系统**：二期再加，一期只保留核心快捷键。
6. **导入/导出配置文件**：一期只支持复制 Prompt，二期再加 JSON 导入导出。

---

## 七、源码文件位置

研究用源码已复制到：
`docs/plan/research/liaison-extension-source/`

包含完整的扩展文件，仅供内部研究参考，不得直接拷贝到项目源码中。
