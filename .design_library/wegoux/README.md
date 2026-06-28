---
name: "微购设计系统"
---

# 微购设计系统

## 概述

微购设计系统是一套面向**移动应用**与**微信生态**的 UI 设计规范与组件库，适用于电商、工具、社交等场景的产品界面开发。设计风格以**简洁、干净、淡雅、克制**为核心，追求高信息密度与操作效率，保持与微信生态一致的视觉体验。

设计原则优先级：清晰 > 一致 > 效率 > 美观 > 创新。

## 视觉基础

### 品牌色

| Token | 色值 | 说明 |
|-------|------|------|
| 品牌主色 | `#03C160` | 按钮、强调元素、品牌识别 |
| 品牌悬浮 | `rgba(3, 193, 96, 0.80)` | 主色按钮 hover 态 |
| 品牌禁用 | `rgba(3, 193, 96, 0.60)` | 主色按钮 disabled 态 |
| 品牌背景 | `rgba(3, 193, 96, 0.10)` | 品牌色浅底标签/标记 |

### 辅助色系

| 色系 | 主色 | 用途 |
|------|------|------|
| 金色强调 | `#C79A56` | VIP、等级标识 |
| 绿色强调 | `#00C777` | 特殊高亮 |
| 紫色强调 | `#6367F0` | 特殊标识 |
| 黄色强调 | `#FFC300` | 促销/优惠券标记 |
| 红色危险 | `#FA5051` | 删除、错误提示 |
| 橙色警告 | `#FA9D3B` | 警告提示 |
| 蓝色信息 | `#208BF1` | 信息提示 |
| 促销红 | `#FF6045` | 促销/秒杀标识 |

### 中性色

| Token | 色值 | 说明 |
|-------|------|------|
| 一级文字 | `#1E2028` | 主标题、正文 |
| 二级文字 | `#6E7382` | 辅助说明 |
| 三级文字 | `#9097A3` | 占位符、时间戳 |
| 禁用文字 | `#B7BEC5` | 不可用状态文字 |
| 页面背景 | `#EDEDED` | 页面底色 |
| 卡片背景 | `#FFFFFF` | 卡片/列表底色 |
| 分割线 | `rgba(32, 47, 100, 0.08)` | 默认分割线 |

### 字体

| 用途 | 字体 |
|------|------|
| 正文字体 | PingFang SC |
| 数字/金额 | WegoKeyboard N9 |
| 数字回退 | DIN Alternate, SF Pro Display |
| 系统字体 | -apple-system, BlinkMacSystemFont |

字号体系（6档）：10px / 12px / 14px / 16px / 18px / 22px

数字字号（6档）：12px / 14px / 16px / 20px / 24px / 32px

字重（3档）：Regular 400 / Medium 500 / Semibold 600

### 圆角

五级体系：`4px` (xs) / `6px` (sm) / `8px` (md) / `12px` (lg) / `16px` (xl) / `999px` (full)

### 间距

十一级体系：`0` / `2px` / `4px` / `8px` / `12px` / `16px` / `24px` / `32px` / `40px` / `48px` / `72px`

### 阴影

| 级别 | 值 |
|------|-----|
| xs | `0 1px 4px rgba(30, 32, 40, 0.04)` |
| sm | `0 2px 8px rgba(30, 32, 40, 0.06)` |
| md | `0 4px 16px rgba(30, 32, 40, 0.08)` |
| lg | `0 8px 32px rgba(30, 32, 40, 0.12)` |
| xl | `0 12px 48px rgba(30, 32, 40, 0.16)` |

### 动效

| 档位 | 时长 |
|------|------|
| instant | 0ms |
| fast | 150ms |
| normal | 250ms |
| slow | 350ms |
| xslow | 500ms |

缓动函数：`standard` / `enter` / `exit` / `emphasized` / `linear`

### 层级

`0` (base) / `10` (raised) / `100` (sticky) / `200` (dropdown) / `300` (popover) / `400` (toast) / `500` (overlay) / `600` (modal) / `900` (critical)

### 触控

最小触控区域：40px / 默认触控区域：44px / 舒适触控区域：48px

## 命名规则

### 源 Token（`wg.*` 前缀）

底层设计 Token，完整覆盖色彩、字体、间距、圆角、阴影、动效、层级、尺寸、文案等全部属性，是便携别名的数据源。命名遵循 `<wg>-<类别>-<属性>-<等级>` 结构，例如：

- `--wg-color-base-brand-500`：品牌色 500 等级
- `--wg-font-size-f14`：正文字号 14px
- `--wg-spacing-16`：间距 16px
- `--wg-radius-lg`：大圆角 12px
- `--wg-shadow-md`：中等阴影
- `--wg-motion-duration-normal`：标准动效时长 250ms

### 便携别名

为方便日常开发使用，提供语义化的快捷别名，均通过 `var(--wg-*)` 引用源 Token：

- `--color-*`：色彩系列（如 `--color-brand`、`--color-text-primary`、`--color-bg-surface`、`--color-border-default` 等）
- `--radius-*`：圆角系列（如 `--radius-xs`、`--radius-md`、`--radius-full`）
- `--space-*`：间距系列（如 `--space-8`、`--space-16`、`--space-24`）
- `--font-*`：字体系列（如 `--font-family-text`、`--font-size-14`、`--font-weight-medium`）
- `--shadow-*`：阴影系列（如 `--shadow-sm`、`--shadow-lg`）
- `--duration-*` / `--ease-*`：动效系列（如 `--duration-fast`、`--ease-standard`）
- `--size-*`：尺寸系列（如 `--size-24`、`--size-48`）
- `--touch-*`：触控系列（如 `--touch-min`、`--touch-default`）
- `--blur-*`：模糊系列（如 `--blur-md`、`--blur-frosted`）
- `--z-*`：层级系列（如 `--z-sticky`、`--z-modal`）
- `--stroke-*`：描边系列（如 `--stroke-color-default`、`--stroke-width-default`）
- `--layout-*`：布局系列（如 `--layout-page-max-width`、`--layout-group-g1-outside`）

## 组件清单

本设计系统包含 **18** 个组件，覆盖操作、展示、导航、表单四大类别。

### 操作类（action）

| 组件 | Slug | 状态 | 说明 |
|------|------|------|------|
| 按钮 | `button` | stable | 主要操作按钮，支持 primary、secondary、danger 等变体 |
| 链接 | `link` | stable | 文字跳转操作，支持独立链接和内联链接 |

### 展示类（display）

| 组件 | Slug | 状态 | 说明 |
|------|------|------|------|
| 卡片 | `card` | stable | 内容容器，支持标题、描述、图片等多种内容组合 |
| 头像 | `avatar` | stable | 用户头像展示，支持图片、文字首字母等类型 |
| 标签 | `chip` | stable | 信息标签/标记，用于状态标识或筛选 |
| 角标 | `badge` | stable | 未读数量、红点提醒、促销标签等标记 |
| 列表单元格 | `cell` | stable | 移动端信息列表项，支持左右插槽、分割线和点击态 |
| 图片 | `image` | stable | 图片展示组件，支持尺寸、填充、圆角、加载和错误态 |

### 导航类（navigation）

| 组件 | Slug | 状态 | 说明 |
|------|------|------|------|
| 底部导航 | `bottom-nav` | stable | 移动端底部导航栏，支持图标+文字组合 |
| 导航栏 | `navbar` | stable | 页面顶部导航栏，支持返回/关闭按钮、居中/左对齐标题、右侧操作区 |
| 导航栏操作按钮 | `navbar-action-button` | stable | NavBar 右侧操作区按钮，支持纯文字、图标、图标+文字、按钮样式 |
| 选项卡 | `stack` | stable | 选项卡切换控件，支持选中态和复选标记 |

### 表单类（form）

| 组件 | Slug | 状态 | 说明 |
|------|------|------|------|
| 输入框 | `input` | stable | 文本输入控件，支持占位符、前后缀、清除按钮等 |
| 计数器 | `counter` | stable | 数字增减控件，用于商品数量和库存数量；视觉紧凑，热区通过伪元素扩展 |
| 复选框 | `checkbox` | stable | 多选控件，支持未选、已选、半选、计数和禁用 |
| 单选 | `radio` | stable | 互斥选择控件，支持 24px / 20px 两种尺寸 |
| 开关 | `switch` | stable | 布尔切换控件，适合设置项开启/关闭 |
| 表单容器 | `form` | stable | 表单字段容器，支持水平/垂直布局和多种输入类型 |

> `counter` 保持 32px 视觉高度和 28px 按钮视觉尺寸；为满足移动端触控要求，通过 `counter__btn::before` 扩展按钮热区，不改变组件布局。

## 文件清单

```
.design_library/微购设计系统/
├── README.md                          # 本文档：品牌背景、视觉基础、组件概览
├── SKILL.md                           # Skill 运行时控制入口
├── colors_and_type.css                # 完整 CSS Token 定义（源 Token + 便携别名 + 排版工具类）
├── css.json                           # Token 结构化数据（机器可读）
├── components.css                     # 组件样式集合
├── iconfont.css                       # wego-iconfont 图标字体 class
├── library-consumption.json           # 下游/AI 消费读取顺序和复制规则
├── uikit-plan.json                    # UI Kit 组件白名单、槽位分配和页面蓝图
├── components/
│   ├── index.json                     # 组件注册表（名称、类别、状态、预览链接）
│   ├── avatar.json                    # 头像组件契约
│   ├── badge.json                     # 角标组件契约
│   ├── bottom-nav.json                # 底部导航组件契约
│   ├── button.json                    # 按钮组件契约
│   ├── card.json                      # 卡片组件契约
│   ├── cell.json                      # 列表单元格组件契约
│   ├── checkbox.json                  # 复选框组件契约
│   ├── chip.json                      # 标签组件契约
│   ├── counter.json                   # 计数器组件契约
│   ├── form.json                      # 表单容器组件契约
│   ├── image.json                     # 图片组件契约
│   ├── input.json                     # 输入框组件契约
│   ├── link.json                      # 链接组件契约
│   ├── navbar.json                    # 导航栏组件契约
│   ├── navbar-action-button.json      # 导航栏操作按钮组件契约
│   ├── radio.json                     # 单选组件契约
│   ├── stack.json                     # 选项卡组件契约
│   └── switch.json                    # 开关组件契约
├── preview/
│   ├── component-button.html          # 按钮组件预览页
│   ├── component-card.html            # 卡片组件预览页
│   ├── component-bottom-nav.html      # 底部导航组件预览页
│   ├── component-input.html           # 输入框组件预览页
│   ├── component-avatar.html          # 头像组件预览页
│   ├── component-chip.html            # 标签组件预览页
│   ├── component-counter.html         # 计数器组件预览页
│   ├── component-navbar.html          # 导航栏组件预览页
│   ├── component-badge.html           # 角标组件预览页
│   ├── component-cell.html            # 列表单元格预览页
│   ├── component-checkbox.html        # 复选框预览页
│   ├── component-form.html            # 表单容器预览页
│   ├── component-image.html           # 图片组件预览页
│   ├── component-link.html            # 链接组件预览页
│   ├── component-radio.html           # 单选组件预览页
│   ├── component-stack.html           # 选项卡预览页
│   └── component-switch.html          # 开关组件预览页
├── ui_kits/
│   └── app/
│       ├── index.html                 # 移动端应用 UI Kit 示例（完整 4 屏结构）
│       └── quality-report.json        # UI Kit 质量报告
│   └── biz-settings/
│       ├── index.html                 # 业务设置底部面板模式 UI Kit
│       └── quality-report.json
└── specs/                             # 品牌、布局、交互、动效、图标、文案规范
```

## 预览页工程规范

以下规则适用于所有 `preview/component-*.html` 文件：

### 图标引用规则（强制）

1. **所有图标必须使用 wego-iconfont** — 预览页中的所有图标（包括导航栏返回/关闭按钮、操作区图标等）必须通过 `<i class="wego-iconfont-s icon-{name}"></i>` 方式引用，严禁使用内联 `<svg>` 替代。
2. **iconfont 字体文件**已托管在 `assets/fonts/` 下，CSS 通过 `iconfont.css` 引入（`<link rel="stylesheet" href="../iconfont.css">`）。
3. 如需新增图标，应联系设计团队更新 iconfont 字体包，不得在预览页中自行创建 SVG 替代。

### 文件路径

- 外部 CSS：`<link rel="stylesheet" href="../colors_and_type.css">`
- 图标 CSS：`<link rel="stylesheet" href="../iconfont.css">`（强制，预览页必须引入）
- 外部组件 CSS：`<link rel="stylesheet" href="../components.css">`（可选，预览页也可内联组件样式）
- 字体资源：保存在 `assets/fonts/` 子目录

## 下游消费指南

本设计系统分为五层契约，下游使用时按场景读取，不要盲目复制 UI Kit。

| 层 | 文件 | 用途 | 是否可直接复制 |
|----|------|------|----------------|
| Token | `colors_and_type.css` + `css.json` | 颜色、字体、字号、间距、圆角、阴影、动效 | 是 |
| Component | `components.css` + `components/*.json` + `preview/component-*.html` | 单组件结构、class、状态和尺寸 | 是 |
| Icon | `iconfont.css` + `assets/fonts/` + `icons/` | 图标字体和固定 SVG 资产 | 是 |
| Spec | `specs/*.md` | 品牌、布局、交互、动效、文案细则 | 作为规则参考 |
| UI Kit | `ui_kits/app/index.html` + `quality-report.json` | 页面级 Showcase | 不要直接复制外壳 |

推荐读取顺序：`README.md` → `library-consumption.json` → `uikit-plan.json` → `colors_and_type.css` → `components/index.json` → 对应组件契约和预览页。

### UI Kit 使用边界

- `ui_kits/app/index.html` 是展示样品，不是真实业务页面模板。
- 不要直接复制 `.uikit-shell`、`.phone-frame`、`.phone-screen` 外壳。
- 业务演示里的 `biz-*` 样式尚未沉淀为注册组件，复用前应先补契约和预览页。
- 生产图标优先使用 `iconfont.css`，不要为组件临时接入第三方图标库。

---

*微购设计系统 -- 简洁、干净、淡雅、克制的移动端设计规范*
