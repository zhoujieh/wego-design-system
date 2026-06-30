# Nimbus Core 设计系统

> 暗色优先的产品设计系统（核心子集 —— 23 个组件覆盖全部 UI Kit）。Token 直接以项目根目录 `colors_and_type.css` 为权威来源；组件 / UI Kit 引用派生自 `previews/` HTML 页面。

## 库布局

> 以下库根目录名为 `nimbus-core/`，仅用于文档说明。**部署位置由消费者定义** —— 可以是 `node_modules/@nimbus/core/`、`packages/design/nimbus-core/`、CDN 基础路径或其他任意位置。本文档中所有路径均为**相对于库根目录**；将根前缀视为 `{NIMBUS_ROOT}`，从你的消费项目中自行解析。

```
{NIMBUS_ROOT}/                 # nimbus-core 库根（位置由消费者定义）
├── colors_and_type.css        # 权威 Token 源头（直接引用，仅暗色）
├── css.json                   # 机器可读 Token 投影（自动生成）
├── scaffold.css               # 页面骨架：reset、布局辅助、共享原子样式（手写）
├── components.css             # 聚合组件 class 定义 —— 自动生成
├── icons.js                   # 内联图标精灵渲染器
├── uikit-plan.json            # 组件白名单 + 槽位分配 + 屏幕蓝图
├── library-consumption.json   # AI 消费推荐读取顺序
├── assets/
│   └── icons/                 # 115 个捆绑 SVG 图标（默认 + .0c0c0d / 状态着色变体）
├── components/                # 组件层（每个 slug 一个 JSON 契约，共 23 个）
│   ├── index.json
│   ├── activity-rail.json     │ ├── page-header.json
│   ├── alert.json             │ ├── pagination.json
│   ├── avatar.json            │ ├── setting-row.json
│   ├── buttons.json           │ ├── stat-card.json
│   ├── cards.json             │ ├── status-bar.json
│   ├── chat-composer.json     │ ├── table.json
│   ├── dialog.json            │ ├── table-panel.json
│   ├── editor-tabs.json       │ ├── tabs.json
│   ├── file-tree.json         │ ├── tag.json
│   ├── forms.json             │ └── workbench-titlebar.json
│   ├── kbd.json               │
│   ├── menu.json              │
│   └── nav-list.json          │
├── preview/                   # 23 个组件预览页（每个 slug 一个 HTML）
└── ui_kits/                   # 页面级 Showcase，组合组件 + Token
    ├── dashboard/index.html
    └── dev-explorer/index.html
```

> `scaffold.css` 为手写，稳定不变。`components.css` 由 `design-library-creator/scripts/extract-components-css.mjs` **重新生成**，该脚本扫描每个 `preview/component-*.html` 中 `<style>` 块内 `/* @component-css-start */` 和 `/* @component-css-end */` 标记之间的 CSS，并聚合结果。在 preview HTML 中编辑组件 CSS，然后重新运行脚本 —— 切勿直接编辑 `components.css`。

## 品牌要素

- **背景**：暗色画布 `--bg-base-default #1A1B1D`，通过 `--bg-base-secondary` / `--bg-base-tertiary` 和 `--bg-overlay-l1..l4` 着色层叠。
- **主文字**：`--text-default #D1D3DB`；弱化：`--text-secondary` / `--text-tertiary`。
- **品牌强调色**：`--bg-brand #32F08C`（绿色），含 `--bg-brand-hover` 和 `--bg-brand-popup` 着色。
- **状态调色板**：primary / success / alert / warning / error 各提供 `default | hover | active | surface-l1..l3`。
- **排版**：正文 SF Pro / SF Pro Text，代码 JetBrains Mono；标题层级 `3xs → 3xl`，正文层级 `xs → base`，含 `*-strong` 500 字重配对。
- **圆角**：`2 / 4 / 6 / 8 / 10 / full`。**间距**：`0 / 4 / 6 / 8 / 12 / 16 / 24 / 32 / 40`。

## Token 命名规范

Token 保持源命名不变。没有可移植别名 —— 组件直接消费源变量：

- `--bg-*` 表面填充（base / overlay / brand / menu / tooltip / invert）
- `--text-*` 和 `--icon-*` 内容 Token（与颜色状态镜像）
- `--border-neutral-l1..l3`、`--border-brand`、`--border-contrast`
- `--status-{primary|success|alert|warning|error}-{default|hover|active|surface-l1..l3}`
- `--accent-*`、`--brand-{green|red|yellow|blue|purple}-100..1000`、`--viz-*`
- 排版：`--{body|heading}-{size}-{font-family|font-size|font-weight|line-height}`
- 代码：`--code-editor-*`、`--code-terminal-*`，外加 `--code-{text|doc|link|number|action|...}` 色调。

> 组件通过 `var(--token-name)` 直接引用 Token。**不要**重命名 Token；**不要**引入新的色阶。

## 组件（23 个）

| Slug | 类型 | 说明 |
|------|------|------|
| activity-rail | IDE 侧栏 | 垂直活动栏，含激活态 + 分割线 |
| alert | 通知矩阵 | 4 种色调 × 简单 / 复杂布局 |
| avatar | 用户头像 | sm/md/lg，方形 / 强调色，堆叠组 + 溢出 |
| buttons | 按钮矩阵 | brand / primary / ghost / danger × 尺寸 × 状态 |
| cards | 表面卡片 | 头部 / 操作装饰 |
| chat-composer | AI 输入 | 工具栏 + 模型标签 + 麦克风 + 发送 |
| dialog | 弹窗 | 遮罩 + 底部操作按钮 |
| editor-tabs | IDE 标签页 | 分层标签条 + 关闭按钮 + 操作项 |
| file-tree | IDE 文件浏览器 | 多级行、展开箭头、文件类型着色 |
| forms | 表单控件 | input / textarea / select / checkbox / radio / switch |
| kbd | 快捷键提示 | 键盘按键样式 |
| menu | 下拉菜单 | 分组标签、快捷键、危险操作项 |
| nav-list | 侧边导航 | 分组菜单项，含激活态 |
| page-header | 页头 | 标题 + 操作区域 |
| pagination | 分页器 | 数字页码，含省略号 |
| setting-row | 设置行 | 标题 + 描述 + 控件（select / button / select-with-icon）；通过 `.ds-settingrow__group` + `.ds-settingrow__grouplabel` 分组面板 |
| stat-card | KPI 卡片 | 等宽数字 + 变化量 |
| status-bar | IDE 状态栏 | 状态项 + 圆点指示器 |
| table | 数据表格 | 头像 + 标签单元格、工具栏 / 底栏、局部状态着色 |
| table-panel | 表格容器 | 带边框的表格，含工具栏 + 底部分页插槽 |
| tabs | 标签页 | 下划线 / 填充 / 可关闭样式 |
| tag | 状态标签 | default / success / warning / danger / brand / count / neutral-strong |
| workbench-titlebar | IDE 顶部栏 | 红绿灯按钮 + 项目选择器 + 图标操作 |

## UI Kit（2 个）

| 类型 | 组合 |
|------|------|
| dashboard | KPI 统计 + 最近活动表格 |
| dev-explorer | IDE 框架：标题栏 + 活动栏 + 浏览器 + 编辑器 + 聊天 + 状态栏 |

每个 UI Kit 是一个独立的交互式 React 18 `index.html` 单文件，链接 `../../colors_and_type.css` 和 `../../components.css`，通过 `../../assets/icons/*.svg` 渲染图标，并输出同级 `quality-report.json`。外壳被 `max-width: 1184px` 限制，按 design-library-creator skill 规范 —— UI Kit 是展示样品，而非真实画布的页面模板（详见 README → "下游消费指南"）。

## 图标

捆绑 SVG 图标位于 `assets/icons/`（115 个文件）。可选运行时精灵渲染器位于 `icons.js`。

## 创作规则

1. **禁止硬编码 hex/rem 值。** 始终引用 `var(--token)`。
2. **状态颜色仅局部使用。** 仅在标签 / 单元格级别着色 —— 禁止对整行表格着色。
3. **表面抬升。** 使用 `--bg-base-secondary`（常规）和 `--bg-base-tertiary`（浮起）实现分层表面。
4. **边框保持中性。** `--border-neutral-l1` 用于默认边框；仅状态相关边框使用 status / brand。
5. **图标描边为 2px**，通过 `icons.js` 渲染；尺寸通过 `data-size` 控制。

## 超出范围（不生成）

- Token 专项预览页（`colors`、`typography`、`spacing`、`radius`）—— 按用户要求，不包含基础预览页；它们由 `colors_and_type.css` + `css.json` 纯粹表示。
- 自动派生的亮色主题 —— 源 Token 仅暗色（`/* @dark-only */`）。
- React UI Kit 交互性 —— UI Kit 以静态 HTML 展示形式交付，与源 `previews/` 结构一致。

## 会话连续性

- 新增组件：`expand-components`
- 优化 Token 或重命名分组：`refine-library`
- 生成额外的 Kit（如移动端 / 营销站点）：`generate-additional-kit`
