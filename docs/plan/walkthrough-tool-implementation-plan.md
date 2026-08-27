# 走查工具（Walkthrough Tool）实现计划

> 版本：v1.0  
> 创建日期：2026-08-26  
> 负责人：用户体验设计中心  
> 状态：规划中

---

## 一、项目背景与目标

### 1.1 背景

在微购原型的日常验收和走查流程中，存在以下痛点：

1. **样式调整沟通成本高**：走查时发现"这个按钮往左挪一点""间距不舒服"这类问题，难以用文字准确描述给 AI 或开发，需要反复截图和解释。
2. **批注分散**：走查意见散落在聊天记录、截图和文档中，与具体页面元素无法绑定，后续定位困难。
3. **失败注入入口独立**：现有的失败注入功能是一个独立的悬浮按钮，与其他走查能力割裂。
4. **本地/在线预览体验不一致**：希望在任何预览环境下都能使用统一的走查工具。

参考 Liaison、Design Mode、Chromo Page Designer 等同类产品的思路，我们计划在 wego-app 中内置一套完整的走查工具，实现"所点即所得"的可视化走查体验。

### 1.2 目标

- **统一入口**：将现有失败注入升级为统一的「走查工具」悬浮入口，所有走查能力集中管理。
- **可视化样式编辑**：在任意场景页面上点击元素，弹出属性面板，实时调整样式并预览效果。
- **元素批注**：为任意元素添加文字批注，批注与元素绑定，支持分类和汇总。
- **变更导出**：自动汇总所有样式修改和批注，一键导出结构化 Prompt 或 JSON，交给 AI 精准修改源码。
- **环境通用**：本地预览和在线预览使用同一套代码，无需额外配置。
- **可扩展架构**：预留功能扩展位，后续可接入无障碍检查、性能标记、对比标尺等更多能力。

### 1.3 非目标

- 不直接修改源码文件（修改仅在浏览器端生效，通过导出 Prompt 交给 AI 落地）。
- 不做实时协作（多人同时批注）。
- 不做完整的设计工具（如 Figma 的全部功能），只聚焦走查场景。
- 一期不支持动态列表元素的稳定批注（数据变化后选择器可能失效）。

---

## 二、功能范围

### 2.1 一期（核心能力）

| 模块 | 功能点 | 说明 |
|------|--------|------|
| **统一悬浮入口** | 悬浮按钮 + 工具面板框架 | 复用现有失败注入的位置和形态，升级为多 Tab 工具面板 |
| **失败注入迁移** | 加载失败 / 新增保存失败 / 删除失败 | 现有功能原样迁入，作为面板的一个 Tab |
| **走查模式开关** | 开启/关闭走查模式 | 开启后拦截页面点击，关闭后恢复正常交互 |
| **元素选中与高亮** | 悬停预览 + 点击选中 + 选中态边框 | 鼠标悬停时虚线高亮，点击选中后实线边框 + 尺寸标注 |
| **样式属性面板** | 尺寸 / 布局 / 字体 / 颜色 / 间距 / 圆角 / 描边 / 投影 / 透明度 | Figma 风格的可视化属性编辑面板，修改实时生效 |
| **变更追踪** | 自动记录所有样式修改 | 按元素分组，记录属性、原值、新值、时间戳 |
| **Prompt 导出** | 一键复制结构化 Prompt | 生成包含 CSS 选择器 + 属性变更的文本，可直接粘贴给 AI |
| **JSON 导出** | 导出结构化 JSON | 便于程序化处理和后续扩展 |
| **数据持久化** | 按场景路由保存到 localStorage | 刷新页面后可恢复上次的走查状态 |

### 2.2 二期（批注与体验打磨）

| 模块 | 功能点 | 说明 |
|------|--------|------|
| **元素批注** | 选中元素后添加文字批注 | 批注与元素绑定，支持 Bug / Design / Copy / Question / General 分类 |
| **批注汇总面板** | 查看整页所有批注 | 按分类筛选，支持跳转定位到对应元素 |
| **批注导出** | 批注纳入 Prompt / JSON 导出 | AI 可同时获取样式变更和批注意见 |
| **批量批注工作流** | 一次性标注多个问题，统一导出 | 参考 Inspecto 的 Annotate Mode，走查时连续标注，最后一次性导出 |
| **撤销/重做** | 样式修改的撤销和重做 | 支持快捷键 Ctrl+Z / Ctrl+Shift+Z |
| **键盘微调** | 选中元素后方向键微调尺寸和位置 | 参考 VisBug 的键盘操作模式 |
| **面板体验优化** | 手机视口内的面板布局适配 | 底部抽屉式面板，可折叠，避免遮挡页面内容 |

### 2.3 后续扩展（预留架构，不纳入本期）

- **设计系统 Token 匹配**：编辑颜色/字体时自动推荐对应的设计系统 Token 值
- **源码直连**：导出变更后直接定位到对应场景的 scene.css / scene.js 文件
- **无障碍检查**：自动检测对比度、语义化标签、可访问性问题
- **对比标尺**：元素间距测量、对齐辅助线
- **截图导出**：带批注和高亮的截图导出
- **走查报告生成**：自动生成结构化的走查报告文档
- **迭代记录关联**：走查批注自动关联到场景的迭代记录

---

## 三、技术架构设计

### 3.1 整体架构

```
wego-app/index.html
├── 引入 walkthrough-tool.js（新增，运行时工具）
├── 引入 walkthrough-tool.css（新增，工具样式）
└── 现有 app.js（移除失败注入代码，改为调用统一入口）

walkthrough-tool.js（IIFE 封装，挂载到 window.WegoApp.Walkthrough）
├── 核心控制器（WalkthroughController）
│   ├── 模式管理（普通/走查）
│   ├── 悬浮入口管理
│   ├── 工具面板管理（Tab 切换）
│   └── 数据持久化
├── 元素选择引擎（ElementSelector）
│   ├── 悬停检测
│   ├── 点击选中
│   ├── 高亮蒙层渲染
│   └── CSS 选择器生成
├── 样式编辑器（StyleEditor）
│   ├── 属性面板渲染
│   ├── 样式读取（getComputedStyle）
│   ├── 样式应用（element.style）
│   └── 变更记录
├── 批注系统（AnnotationSystem）【二期】
│   ├── 批注添加/编辑/删除
│   ├── 批注与元素绑定
│   └── 批注汇总
├── 导出器（Exporter）
│   ├── Prompt 格式生成
│   ├── JSON 格式生成
│   └── Markdown 摘要生成【二期】
├── 失败注入模块（FaultInjection）
│   └── 从 app.js 迁移过来的现有功能
└── 工具扩展注册中心（ToolRegistry）
    └── 预留后续功能扩展接口
```

### 3.2 代码归属与同步

| 文件 | 权威源位置 | 同步目标 | 说明 |
|------|-----------|---------|------|
| `walkthrough-tool.js` | `.codex/skills/wego-design/runtime/walkthrough-tool.js` | `wego-app/lib/js/walkthrough-tool.js` | 运行时核心逻辑 |
| `walkthrough-tool.css` | `.codex/skills/wego-design/runtime/walkthrough-tool.css` | `wego-app/lib/walkthrough-tool.css` | 工具样式 |
| `app.js` 修改 | `wego-app/js/app.js`（手写，非生成物） | — | 移除失败注入代码 |
| `index.html` 修改 | `wego-app/index.html` | — | 引入新的 JS 和 CSS |

> 说明：走查工具属于设计系统运行时能力，由 `wego-uxsystem-iterate` 技能负责迭代维护。权威源放在 `wego-design/runtime/` 下，通过 `sync-wego-app-lib.mjs` 同步到 `wego-app/lib/`。

### 3.3 与现有系统的集成点

1. **悬浮入口位置**：复用现有失败注入的 `#wgf-root` 位置（右下角，bottom: 96px），升级为统一入口。
2. **失败注入迁移**：将 `app.js` 中 `mountFaultSwitch` 的约 100 行代码迁移到走查工具的 `FaultInjection` 模块，保持功能完全一致。
3. **场景路由感知**：通过 `window.WegoApp.getState()` 获取当前场景路由，用于数据持久化的 key 隔离。
4. **设计系统 Token**：样式面板使用 wego-app 已有的 CSS 变量（`--bg-surface`、`--text-default`、`--shadow-md` 等），确保视觉一致。
5. **localStorage 命名空间**：使用 `wego.walkthrough.*` 前缀，与现有 `wego.fault-switch.enabled` 等保持一致的命名规范。

---

## 四、模块详细设计

### 4.1 统一悬浮入口与工具面板

#### 4.1.1 悬浮按钮

- **位置**：固定在右下角，`right: 12px; bottom: 96px`（与现有失败注入一致）
- **形态**：胶囊形按钮，图标 + 文字「走查工具」
- **状态指示**：当有任何工具开启时（走查模式开启 / 任意失败注入开启），按钮显示红色小圆点
- **点击行为**：展开/收起工具面板

#### 4.1.2 工具面板

- **位置**：悬浮按钮上方弹出，`width: 280px`（适配手机视口）
- **结构**：顶部 Tab 栏 + 内容区
- **一期 Tab**：
  - 🏠 **常用**：走查模式开关 + 快速导出按钮 + 变更计数
  - 🎨 **样式走查**：元素选中状态 + 已修改样式列表 + 编辑入口
  - ⚠️ **失败注入**：加载失败 / 新增保存失败 / 删除失败 三个开关（迁移自现有功能）
- **二期 Tab**：
  - 📝 **批注**：批注列表 + 添加入口 + 分类筛选
- **扩展位**：通过 `ToolRegistry.register(tabId, { title, icon, render })` 注册新 Tab，无需修改核心代码

#### 4.1.3 走查模式开关

- **位置**：「常用」Tab 的顶部，大按钮
- **开启后**：
  - 页面顶部显示蓝色横幅「走查模式已开启，点击元素进行样式编辑」
  - 拦截页面元素的 click 事件，改为选中元素
  - 正常的页面交互（按钮点击、链接跳转等）暂时失效
- **关闭后**：
  - 恢复所有正常交互
  - 保留已记录的变更和批注
- **快捷键**：`Alt + W` 切换走查模式（可选，二期实现）

### 4.2 元素选择引擎

#### 4.2.1 悬停检测

- 监听 `mouseover` / `mouseout` 事件（走查模式开启时）
- 悬停元素显示**蓝色虚线边框** + 元素标签（标签名 + class）
- 使用 `elementFromPoint` 确保精准定位

#### 4.2.2 点击选中

- 走查模式下点击元素，阻止默认行为和事件冒泡
- 选中元素显示**蓝色实线边框** + 8 个调整手柄（二期）+ 尺寸标注
- 选中后自动打开样式属性面板

#### 4.2.3 高亮蒙层

- 使用独立的绝对定位 div 作为高亮层，不修改原页面元素的样式
- 高亮层通过 `getBoundingClientRect()` 计算位置和尺寸
- 页面滚动时实时更新高亮层位置

#### 4.2.4 CSS 选择器生成

- 为选中元素生成稳定的 CSS 选择器路径，用于导出 Prompt
- 生成策略（优先级从高到低）：
  1. 如果元素有唯一 `id`，使用 `#id`
  2. 如果元素有稳定的 `data-*` 属性（如 `data-component-slug`、`data-dom-id`），优先使用
  3. 否则使用 `tagname.class:nth-child(n)` 的路径链，从最近的有 id 或稳定 class 的祖先开始
- 选择器生成后验证唯一性（`document.querySelectorAll(selector).length === 1`）

### 4.3 样式属性面板

#### 4.3.1 面板布局

- **位置**：走查模式下选中元素后，从底部滑出的抽屉面板（适配手机视口）
- **高度**：默认占屏幕 60%，可拖拽调整
- **结构**：
  - 顶部：元素信息（标签名 + 选择器摘要）+ 关闭按钮
  - 中部：可滚动的属性分组区域
  - 底部：撤销按钮 + 复制此元素变更按钮

#### 4.3.2 属性分组与控件

| 分组 | 属性 | 控件类型 |
|------|------|---------|
| **尺寸** | width, height | 数值输入 + 单位切换（px/%） |
| **布局** | display, flex-direction, justify-content, align-items, gap, flex-wrap | 按钮组 / 下拉选择 |
| **间距** | margin（上下左右）, padding（上下左右） | 数值输入 + 四宫格联动 |
| **字体** | font-family, font-size, font-weight, line-height, letter-spacing, text-align | 下拉 / 数值输入 |
| **颜色** | color, background-color | 颜色选择器 + 透明度滑块 + Hex 输入 |
| **圆角** | border-radius（四角独立/联动） | 数值输入 + 四角独立切换 |
| **描边** | border-width, border-style, border-color | 数值 / 下拉 / 颜色 |
| **投影** | box-shadow（x, y, blur, spread, color） | 数值输入 + 颜色 |
| **外观** | opacity, visibility, display | 滑块 / 下拉 |

#### 4.3.3 样式读取与应用

- **读取**：使用 `window.getComputedStyle(element)` 获取当前计算值
- **应用**：修改 `element.style[property]`，实时生效
- **单位处理**：数值属性支持 px / rem / em / % 单位切换，默认使用 px
- **变更记录**：每次修改记录 `{ property, oldValue, newValue, timestamp }`，同一属性多次修改只保留最新值（但撤销栈保留历史）

### 4.4 变更追踪与导出

#### 4.4.1 变更数据结构

```javascript
{
  sceneRoute: "dynamic-product-feed",  // 当前场景路由
  timestamp: 1724659200000,             // 走查开始时间
  changes: [
    {
      id: "change-001",
      selector: "#product-list .card:nth-child(2) .btn",  // CSS 选择器
      elementTag: "button",
      elementText: "立即购买",  // 元素文本摘要，便于人工识别
      property: "padding-left",
      oldValue: "12px",
      newValue: "16px",
      timestamp: 1724659215000
    }
    // ... 更多变更
  ],
  annotations: []  // 二期：批注列表
}
```

#### 4.4.2 Prompt 导出格式

生成的文本可直接粘贴给 AI 编程工具：

```
【走查变更报告】
场景：动态商品流（#/dynamic-product-feed）
时间：2026-08-26 14:00

请修改以下元素的样式：

1. 元素：button「立即购买」
   选择器：#product-list .card:nth-child(2) .btn
   - padding-left: 12px → 16px
   - background-color: #0a6cff → #0a5cdd

2. 元素：div「商品标题」
   选择器：#product-list .card:nth-child(2) .title
   - font-size: 14px → 16px
   - color: #333 → #111

请在 scene.css 中找到对应选择器并修改。
```

#### 4.4.3 JSON 导出格式

```json
{
  "version": "1.0",
  "sceneRoute": "dynamic-product-feed",
  "exportedAt": "2026-08-26T14:00:00.000Z",
  "changes": [
    {
      "selector": "#product-list .card:nth-child(2) .btn",
      "elementInfo": { "tag": "button", "text": "立即购买" },
      "style": {
        "padding-left": "16px",
        "background-color": "#0a5cdd"
      }
    }
  ],
  "annotations": []
}
```

### 4.5 批注系统（二期）

#### 4.5.1 批注数据结构

```javascript
{
  id: "anno-001",
  selector: "#product-list .card:nth-child(2) .price",
  elementText: "¥99.00",
  category: "Design",  // Bug / Design / Copy / Question / General
  content: "价格字号偏小，建议增大到 18px",
  createdAt: 1724659215000,
  resolved: false  // 是否已处理
}
```

#### 4.5.2 批注交互

- 走查模式下选中元素后，属性面板底部有「添加批注」按钮
- 点击后弹出输入框，选择分类（默认 General），输入文字后保存
- 已批注的元素在页面上显示**黄色小圆点**标记
- 点击小圆点可查看和编辑该元素的批注
- 「批注」Tab 中列出整页所有批注，支持按分类筛选，点击可跳转到对应元素

### 4.6 失败注入模块（迁移）

将现有 `app.js` 中的 `mountFaultSwitch` 功能完整迁移：

- **三个开关**：加载失败、新增保存失败、删除失败
- **状态持久化**：`localStorage` key 保持 `wego.fault-switch.enabled` 不变
- **API 保持**：`window.WegoApp.faultInjection.isEnabled(key)` 和 `setEnabled(key, on)` 接口不变，确保场景代码中已有的调用不受影响
- **UI 迁移**：从独立悬浮按钮迁移到工具面板的「失败注入」Tab，功能完全一致

### 4.7 数据持久化

#### 4.7.1 存储方案

- 使用 `localStorage`，所有 key 以 `wego.walkthrough.` 为前缀
- 按场景路由隔离：`wego.walkthrough.data.{routeId}`
- 全局设置：`wego.walkthrough.settings`

#### 4.7.2 存储内容

```
wego.walkthrough.settings          // 全局设置（面板是否展开、上次选中的 Tab 等）
wego.walkthrough.data.dynamic      // 动态场景的走查数据（变更 + 批注）
wego.walkthrough.data.friend-list  // 好友列表场景的走查数据
wego.walkthrough.data.{routeId}    // 其他场景
```

#### 4.7.3 数据生命周期

- 进入场景时：加载对应场景的走查数据，如果有未导出的变更，提示用户
- 离开场景时：自动保存当前数据
- 导出成功后：不自动清除数据，用户可手动点击「清空本次走查」
- 场景切换时：保留各场景独立的数据，互不影响

---

## 五、实施步骤与里程碑

### 5.1 前置准备（0.5 个工作单元）

- [ ] 交付单元核对：通过 `wego-github-delivery` 创建独立 worktree 和分支
- [ ] 同步 main：`git pull --rebase origin main`
- [ ] 技术验证：写一个最小原型验证元素选中 + 样式修改的核心链路可行性

### 5.2 一期里程碑

#### M1：框架搭建与失败注入迁移（1 个工作单元）

- [ ] 创建 `walkthrough-tool.js` 和 `walkthrough-tool.css` 的权威源文件
- [ ] 实现悬浮按钮 + 工具面板框架（Tab 切换、展开/收起）
- [ ] 实现 `ToolRegistry` 扩展注册中心
- [ ] 将 `app.js` 中的失败注入代码迁移到 `FaultInjection` 模块
- [ ] 保持 `window.WegoApp.faultInjection` API 兼容
- [ ] 在 `index.html` 中引入新文件
- [ ] 验证：失败注入功能与迁移前完全一致

#### M2：走查模式与元素选择（1.5 个工作单元）

- [ ] 实现走查模式开关（开启/关闭、页面横幅、事件拦截）
- [ ] 实现 `ElementSelector` 悬停检测（虚线高亮 + 元素标签）
- [ ] 实现点击选中（实线边框 + 尺寸标注）
- [ ] 实现高亮蒙层（独立 div，滚动跟随）
- [ ] 实现 CSS 选择器生成（id / data-* / nth-child 路径链 + 唯一性验证）
- [ ] 验证：在任意场景页面上能正常选中元素并生成稳定选择器

#### M3：样式属性面板（2 个工作单元）

- [ ] 实现底部抽屉式属性面板（滑出/收起、拖拽调整高度）
- [ ] 实现属性分组 UI（尺寸/布局/间距/字体/颜色/圆角/描边/投影/外观）
- [ ] 实现各类控件（数值输入、单位切换、颜色选择器、四宫格间距、按钮组）
- [ ] 实现样式读取（`getComputedStyle`）和实时应用（`element.style`）
- [ ] 实现变更记录（每次修改记录到变更列表）
- [ ] 验证：选中元素后能正常修改样式，修改实时生效且被记录

#### M4：变更追踪与导出（1 个工作单元）

- [ ] 实现变更列表 UI（「样式走查」Tab 中展示所有变更，按元素分组）
- [ ] 实现单条变更撤销和全部撤销
- [ ] 实现 Prompt 导出（生成可直接粘贴给 AI 的文本）
- [ ] 实现 JSON 导出
- [ ] 实现复制到剪贴板功能
- [ ] 验证：导出的 Prompt 能被 AI 正确理解并定位到对应元素

#### M5：数据持久化与联调（0.5 个工作单元）

- [ ] 实现按场景路由的 localStorage 持久化
- [ ] 进入场景时自动加载走查数据
- [ ] 离开场景时自动保存
- [ ] 实现「清空本次走查」功能
- [ ] 全流程联调：开启走查 → 选中元素 → 修改样式 → 导出 → 刷新恢复
- [ ] 设计系统同步：将权威源同步到 `wego-app/lib/`
- [ ] 运行验证脚本：`node scripts/validate-wego-design.mjs --scope=system --strict`

#### M6：预览与验收（0.5 个工作单元）

- [ ] 启动本地预览服务，在多个场景下验证
- [ ] 验证在线预览环境下功能正常
- [ ] 编写使用说明文档
- [ ] 用户验收

**一期合计：约 7 个工作单元**

### 5.3 二期里程碑（规划中，一期验收后启动）

#### M7：批注系统（1.5 个工作单元）

- [ ] 实现批注数据结构和存储
- [ ] 实现添加批注 UI（选中元素后 → 输入框 + 分类选择）
- [ ] 实现元素上的批注标记（黄色小圆点）
- [ ] 实现「批注」Tab 列表（按分类筛选、点击跳转）
- [ ] 实现批注编辑和删除
- [ ] 批注纳入 Prompt / JSON 导出

#### M8：体验打磨（1 个工作单元）

- [ ] 实现撤销/重做栈（Ctrl+Z / Ctrl+Shift+Z）
- [ ] 实现键盘微调（方向键调整尺寸/位置）
- [ ] 优化手机视口内的面板布局
- [ ] 实现批量批注工作流（连续标注 → 统一导出）
- [ ] 实现 Markdown 摘要导出
- [ ] 性能优化（高亮层渲染、事件节流）

**二期合计：约 2.5 个工作单元**

---

## 六、风险与应对

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|---------|
| **CSS 选择器不稳定** | 动态列表元素在数据变化后，导出的选择器无法定位到正确元素 | 高 | 一期优先支持静态结构元素；动态元素标注「选择器可能失效」提示；优先使用 `data-*` 属性生成选择器；二期研究更稳定的元素定位算法（如基于文本内容 + 相对位置） |
| **样式修改与页面交互冲突** | 走查模式开启后无法正常操作页面，影响验收流程 | 中 | 明确的走查模式开关和视觉提示；关闭模式后立即恢复所有交互；支持快捷键快速切换 |
| **手机视口面板遮挡** | 375px 宽度下属性面板空间有限，可能遮挡关键内容 | 中 | 采用底部抽屉式面板，可折叠；面板高度可拖拽调整；关键属性优先展示，高级属性折叠；二期优化 |
| **修改的样式值不规范** | 用户随意输入颜色/尺寸值，导致导出的代码不符合设计规范 | 中 | 颜色选择器限制可选范围；数值输入有合理范围校验；二期接入设计系统 Token 推荐 |
| **localStorage 容量限制** | 大量变更和批注数据可能超出 localStorage 5MB 限制 | 低 | 按场景隔离，单场景数据量有限；提供清空功能；必要时压缩存储或迁移到 IndexedDB |
| **与现有代码的兼容性** | 迁移失败注入时可能破坏场景中已有的 `faultInjection` 调用 | 低 | 保持 `window.WegoApp.faultInjection` API 完全兼容；迁移后全面回归测试 |
| **高亮层性能问题** | 复杂页面上频繁计算元素位置可能导致卡顿 | 低 | 使用 `requestAnimationFrame` 节流；滚动时批量更新；只在走查模式开启时渲染高亮层 |

---

## 七、验收标准

### 7.1 功能验收

- [ ] **统一入口**：右下角悬浮按钮正常显示，点击展开工具面板，Tab 切换正常
- [ ] **失败注入**：三个开关功能与迁移前完全一致，`window.WegoApp.faultInjection` API 正常工作
- [ ] **走查模式**：开启后页面显示横幅，点击元素被拦截为选中；关闭后恢复正常交互
- [ ] **元素选中**：悬停显示虚线高亮，点击显示实线边框和尺寸标注，能正确生成 CSS 选择器
- [ ] **样式编辑**：属性面板正常展示，修改样式实时生效，变更被正确记录
- [ ] **变更列表**：「样式走查」Tab 中正确展示所有变更，按元素分组
- [ ] **Prompt 导出**：生成的文本包含选择器、属性、原值、新值，可直接粘贴给 AI 使用
- [ ] **JSON 导出**：生成的 JSON 结构完整，可被程序解析
- [ ] **数据持久化**：刷新页面后走查数据可恢复，切换场景数据互不影响
- [ ] **环境通用**：本地预览和在线预览环境下功能完全一致

### 7.2 兼容性验收

- [ ] 现有所有场景页面正常加载，无 JS 报错
- [ ] 现有失败注入的所有调用点（场景代码中的 `faultInjection.isEnabled`）正常工作
- [ ] 设计系统验证脚本通过：`node scripts/validate-wego-design.mjs --scope=system --strict`
- [ ] 场景合同验证通过：`node scripts/validate-scene-contract.mjs`

### 7.3 体验验收

- [ ] 走查模式开启/关闭响应迅速，无明显延迟
- [ ] 元素选中高亮准确，无错位
- [ ] 样式修改实时生效，无闪烁
- [ ] 面板在手机视口内布局合理，不影响核心内容查看
- [ ] 导出操作一键完成，复制到剪贴板有成功提示

---

## 八、开源参考借鉴清单

以下开源项目的设计思路可供实现时参考（均为 MIT 或 Apache 许可证，学习思路，不拷贝代码）：

| 项目 | 参考点 | 地址 |
|------|--------|------|
| **Chromo Page Designer** | 属性面板控件设计、变更追踪数据结构、JSON/Markdown 导出格式、Auto Layout 检测 | [github.com/joesteinkamp/chromo-chrome-page-designer](https://github.com/joesteinkamp/chromo-chrome-page-designer) |
| **Design Mode** | 面板信息架构（Layers/Design/Changes）、拖拽调整尺寸、元素间距测量、MCP 数据结构 | [designmode.app](https://www.designmode.app/) |
| **Markup** | 批注分类标签（Bug/Design/Copy/Question/General）、AI 修复简报模板、localStorage 按 URL 隔离 | [github.com/noahomrilevin/getmarkup](https://github.com/noahomrilevin/getmarkup) |
| **Inspecto** | 批量批注工作流（Annotate Mode）、源码定位思路 | 掘金搜索「Inspecto 开源」 |
| **VisBug** | 键盘快捷键操作模式、多选元素批量操作、无障碍检查 | [github.com/GoogleChromeLabs/ProjectVisBug](https://github.com/GoogleChromeLabs/ProjectVisBug) |
| **VibeLens** | 写回源码的思路、VisualDiff 差异对比 | [github.com/shandar/VibeLens](https://github.com/shandar/VibeLens/) |
| **PinPoint Editor** | 元素选择器生成算法、轻量持久化实现 | [github.com/projectashik/pinpoint](https://github.com/projectashik/pinpoint) |

### 8.1 Liaison 源码深度研究（交互与 UI 参考）

已从 Chrome 扩展安装目录提取 Liaison v1.0.6 完整源码，存放于 `docs/plan/research/liaison-extension-source/`，详细拆解报告见 `docs/plan/liaison-extension-research-report.md`。以下为实现时需重点对齐的交互和 UI 细节。

#### 8.1.1 技术架构参考

- **Web Components 架构**：Liaison 全部基于 Custom Elements + Shadow DOM 实现，共 33 个自定义元素。wego-app 走查工具应采用同样的架构，创建 `<wego-walkthrough>` 根元素，用 Shadow DOM 隔离样式，避免与页面 CSS 冲突。
- **状态驱动**：通过元素属性（`data-selected`、`data-pseudo-select`、`data-measuring`、`color-mode` 等）驱动 UI 状态，而非内部变量。这种方式便于调试和状态同步。
- **注入方式**：`document.body.prepend(<liaison-app>)`，工具 UI 位于页面最顶层，z-index 极高。

#### 8.1.2 顶部工具栏交互（适配为 wego-app 悬浮入口）

Liaison 的顶部工具栏包含以下按钮，wego-app 应将核心功能整合到悬浮入口的工具面板中：

| 按钮 | 功能 | 快捷键 | wego-app 适配 |
|------|------|--------|--------------|
| 浏览/收起 | 切换浏览模式（关闭编辑） | — | 走查模式开关 |
| 配置列表 | 打开/关闭配置列表面板 | `L` | 工具面板「变更汇总」Tab |
| 展开编辑 | 展开/收起样式编辑面板 | `Tab` | 选中元素后自动展开 |
| 固定编辑器 | 面板固定到侧边 | — | 底部抽屉固定/收起 |
| 更多 | 下拉菜单（导入/导出/反馈） | — | 面板右上角更多按钮 |

**工具栏特性**：可折叠（只显示核心按钮）、可拖拽移动、显示当前配置/评论计数。

#### 8.1.3 样式编辑面板 UI（核心参考）

**面板头部**：
- 当前元素信息（标签名 + 选择器摘要）
- **「仅编辑当前元素 / 共享元素」切换开关**（重点参考）：
  - 共享元素开启后，修改同时应用到所有同类元素（如所有 `.btn`）
  - 显示"当前命中 N 个同类元素"
  - 二期实现，一期只支持单元素
- 固定/浮动切换

**面板内容分组顺序（严格对齐 Liaison）**：

1. **定位** — position、top/right/bottom/left、z-index
2. **自动布局** — display（flex/grid/block）、flex-direction、justify-content、align-items、gap、flex-wrap
3. **字体** — font-family（带搜索菜单）、font-weight、font-size、line-height、letter-spacing、text-align、text-transform、text-decoration
4. **外观** — opacity、visibility、overflow
5. **填充** — 背景色，支持多层（二期），每层可选实色/渐变（二期）
6. **描边** — border，支持多层（二期），内描边/外描边
7. **投影** — box-shadow，支持多层（二期），内阴影/外阴影，x/y/blur/spread/color
8. **圆角** — border-radius，四角独立调整（liaison-corners 组件），可联动

**一期简化**：填充/描边/投影只支持单层实色，圆角支持联动（四角独立二期）。

**颜色选择器**：支持 Hex 输入 + 颜色面板 + 透明度滑块。渐变和色标编辑二期实现。

#### 8.1.4 元素选中与高亮交互

Liaison 的选中态通过以下属性控制：

| 属性 | 视觉效果 | 触发时机 |
|------|---------|---------|
| `data-pseudo-select=true` | 紫色虚线边框（hsl(267, 100%, 58%)） | 鼠标悬停预览 |
| `data-selected=true` | 实线边框 + 8 个调整手柄 + 尺寸标签 | 点击选中 |
| `data-selected-hide=true` | 隐藏选中态的 ::after 伪元素 | 特殊场景 |
| `contenteditable=true` | 文本编辑模式，光标颜色为强调色 | 双击文本元素 |
| `data-measuring=true` | 十字光标 | 测量模式（二期） |
| `draggable=true` | grab/grabbing 光标 | 拖拽移动（二期） |

**选中态过渡动画**：`transition: all 0.15s ease`

**调整手柄**：8 个（四角 + 四边中点），白色小方块，拖拽调整尺寸。Shift 键锁定宽高比。

**尺寸标签**：选中元素时显示宽高数值，跟随元素位置。

#### 8.1.5 配置列表面板 UI（重点对齐）

Liaison 的配置列表（liaison-page-overview-panel）是走查工具的核心输出界面，wego-app 应严格对齐其交互：

**顶部 Tab（三个）**：
- `全部` — 显示所有配置修改和评论
- `配置` — 只显示样式修改
- `评论` — 只显示批注

**Tab 栏右侧操作按钮**：
- **复制 Prompt** — 一键复制结构化 Prompt 到剪贴板（核心功能）
- 导入 — 导入之前导出的配置 JSON（二期）
- 导出 — 导出当前配置为 JSON（二期）
- 重置修改 — 清空所有配置修改

**配置项展示**：
- 按元素分组，每组显示元素选择器
- 每个配置项显示 CSS 属性名 + 修改后的值
- 支持单条删除
- 代码视图切换（可查看原始 CSS）

**Prompt 导出格式（严格对齐 Liaison）**：

```
## Page Feedback: {场景路由}
**Viewport:** {宽度}×{高度}

1. 元素：{元素描述/标签名}
   选择器：{CSS 选择器}
   配置修改：
   - {属性}: {原值} → {新值}
   评论：{批注内容}
   文案：{元素文本内容}

2. ...
```

**getComputedStyleSummary 提取的属性（导出时包含）**：
display, position, width, height, color, backgroundColor, opacity, fontSize, fontWeight, textAlign, justifyContent, alignItems, gap, padding, borderRadius, boxShadow

#### 8.1.6 批注交互（二期参考）

Liaison 的批注系统（liaison-comment-panel + liaison-comment-list-panel）：

- 选中元素后打开评论面板，textarea 输入
- placeholder："先点击页面上的一个元素，再输入评论"
- 「保存评论」按钮
- 评论列表支持编辑和删除
- 批注纳入配置列表的「评论」Tab，导出时纳入 Prompt

#### 8.1.7 视觉风格参考

Liaison 使用「霓虹」色系作为品牌视觉：

| 变量 | 颜色 | 用途 |
|------|------|------|
| `--neon-purple` | hsl(267, 100%, 58%) | 悬停高亮边框 |
| `--neon-pink` | — | 选中文本光标、主强调 |
| `--neon-cyan` | — | 辅助强调 |
| `--neon-lime` | — | 成功/确认 |

**wego-app 适配**：不使用霓虹色系，改用 wego 设计系统的品牌色 Token（`--text-brand` 等），但交互形态（虚线悬停、实线选中、手柄样式）对齐 Liaison。

**面板样式**：深色半透明背景（类似 Figma 深色面板），圆角，柔和阴影。wego-app 可根据设计系统选择浅色或深色面板。

**动画**：
- 选中态过渡：`all 0.15s ease`
- 退出动画：左侧滑出 `translateX(-200%)` + opacity 0，300ms ease-out
- 面板定位：自动锚定到选中元素旁边（`anchorTo(boundingRect)`）

#### 8.1.8 快捷键系统（二期参考）

Liaison 有非常丰富的快捷键，按功能分组（共 15 组 hotkey 组件）：
move（移动）、margin（外边距）、padding（内边距）、font（字体）、text（文本）、align（对齐）、position（定位）、boxshadow（投影）、inspector（检查器）、guides（辅助线）、search（搜索）、hueshift（色相偏移）、accessibility（无障碍）。

**wego-app 一期**：只保留走查模式切换快捷键（Alt+W），其他快捷键二期按需添加。手机端触摸操作为主，快捷键作为桌面端预览的辅助。

#### 8.1.9 数据存储参考

Liaison 使用三层存储：
- `localStorage` — 持久化配置和评论
- `sessionStorage` — 会话级临时状态
- `chrome.storage` — 扩展级全局设置（颜色模式等）

**wego-app 适配**：只用 `localStorage`，按场景路由（`#/route-id`）隔离存储，key 前缀 `wego.walkthrough.`。

---

## 九、后续规划

一期交付并稳定运行后，按以下优先级推进后续能力：

1. **设计系统 Token 匹配**（高价值）：编辑颜色/字体时自动推荐对应的 Token 值，确保走查修改符合设计规范
2. **源码直连**（高价值）：导出变更后直接定位到 `scene.css` / `scene.js` 的对应行，甚至自动生成修改建议
3. **批量批注工作流**（中价值）：走查时连续标注多个问题，最后统一导出，提升走查效率
4. **无障碍检查**（中价值）：自动检测对比度、语义化标签等可访问性问题
5. **走查报告生成**（中价值）：自动生成结构化的走查报告文档，可直接分享
6. **迭代记录关联**（低价值）：走查批注自动关联到场景的迭代记录，形成完整闭环
7. **截图导出**（低价值）：带批注和高亮的截图导出，便于在沟通中使用

---

## 附录：关键决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| 实现方式 | 自己重新实现，不拷贝插件代码 | Chrome 扩展架构无法直接复用；需要深度集成 wego-app；避免知识产权风险 |
| 代码归属 | 设计系统运行时能力，放 `wego-design/runtime/` | 与现有运行时模块（tabs.js、form.js 等）保持一致；由 `wego-uxsystem-iterate` 维护 |
| 面板形态 | 底部抽屉式，而非右侧固定面板 | 适配 375px 手机视口；右侧面板在窄屏上会遮挡全部内容 |
| 持久化方案 | localStorage，按场景路由隔离 | 实现简单；单场景数据量小；与现有失败注入的存储方式一致 |
| 一期范围 | 样式走查核心 + 失败注入迁移，不含批注 | 控制交付节奏，先验证核心链路；批注功能依赖样式走查的元素选择引擎 |
