# wego-design-system

> 微购（wegoux）设计系统的源仓库。面向移动应用、微信生态、电商与工具场景的中文界面设计系统。

## 它解决什么问题

当前阶段，这套系统主要服务于**产品团队**：让产出的产品原型统一符合微购设计规范，避免颜色随手写、组件各画各的、风格被桌面后台或营销页带偏、规范散在口口相传里这些老问题。通过一份结构化、机器可读的契约库，配合 AI 生成界面，让原型从源头就贴近设计规范。

后续会演进到**开发侧**，把契约接入真实的组件库，赋能开发效率，打通从设计到研发的链路。

核心价值：

- **一致**：颜色、字号、间距、圆角、阴影、动效全部走 Token，组件直接消费，避免硬编码漂移。
- **克制**：风格固定为简洁、干净、淡雅、克制；优先级是 清晰 > 一致 > 效率 > 美观 > 创新。
- **可消费**：Token、组件、图标、规范都按层契约化，AI 与下游项目可按场景读取复制。
- **可演进**：先以契约形式落地产品原型，后续可对接真实组件库，从设计规范自然延伸到研发效率。

## 架构设计

整套系统是**五层契约**的分层结构，每一层都有权威源和同步规则。设计库位于 `.design_library/wegoux/`，根目录的 [AGENTS.md](file:///Users/dk/Documents/code/wego-design-system/AGENTS.md) 是仓库级总则。

| 层 | 内容 | 权威源 |
|----|------|--------|
| Token（视觉语言） | 色阶、语义色、排版、间距、圆角、阴影、动效等原子级视觉值 | [colors_and_type.css](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/colors_and_type.css) 是人读权威源，[css.json](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/css.json) 是机器可读投影，两者必须同步 |
| 组件 | 按钮、卡片、输入框、导航栏等 17 个稳定组件，每个都有契约和预览页 | [components/index.json](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/components/index.json) 是注册表，[components/{slug}.json](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/components) 是单组件契约，[preview/component-{slug}.html](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/preview) 是预览页 |
| 图标 | 常规图标统一走 iconfont 字体，少数固定资产用 SVG | [iconfont.css](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/iconfont.css) + [assets/fonts/](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/assets/fonts) + [assets/icons/](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/assets/icons) |
| 规范 | 品牌、布局、交互、动效、图标、文案与数据格式细则 | [specs/*.md](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/specs)，作为规则参考 |
| UI Kit | 页面级组合示例，展示组件如何搭配使用 | [ui_kits/*/index.html](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/ui_kits) + `quality-report.json` |

几个关键约束贯穿全架构：

- **预览页是组件样式的真实来源**：`preview/component-*.html` 内用 `/* @component-css-start */` / `/* @component-css-end */` 标记包裹的样式块，由 `scripts/extract-components-css.mjs` 聚合生成 `components.css`。**严禁手动编辑 `components.css`**。
- **Token 改动双向同步**：改 `colors_and_type.css` 后必须同步 `css.json`，且 `css.json` 使用 TRAE 官方嵌套分组与对象阴影格式，不能用 CSS 字符串或 `var()` 引用。
- **方向不漂移**：不把 wegoux 改成桌面 IDE、营销大屏或暗色优先系统；TRAE 仅作结构完整性参考，不迁移视觉风格。

## AI 如何调用

本设计系统本身就是为 AI 消费设计的。AI 通过读取结构化的契约文件来理解和使用这套系统，而不是靠猜测或自由发挥。

### 标准读取顺序

1. 先读 [library-consumption.json](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/library-consumption.json)，确认当前任务对应哪一层消费、能复制哪些文件、边界在哪。
2. 需要页面组合时，读 [uikit-plan.json](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/uikit-plan.json)，确认允许使用的组件、核心槽位和页面蓝图。
3. 需要 Token 时，优先读 [colors_and_type.css](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/colors_and_type.css)；需要结构化处理时再读 [css.json](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/css.json)。
4. 需要组件时，先读 [components/index.json](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/components/index.json) 确认可用组件，再读对应 `components/{slug}.json` 契约和 `preview/component-{slug}.html` 拿 markup。
5. 需要布局、文案、日期、金额等细则时，读取 [specs/](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/specs) 下对应规范。

### 按场景调用

- **只使用 Token** → 读取 `colors_and_type.css`，在页面中 `<link>` 或 `@import`，所有视觉值引用 `var(--*)`，不硬编码。
- **生成单个组件** → 读注册表确认存在，再读对应契约和预览页拿结构和 class，同时链接 `colors_and_type.css`、`iconfont.css` 和 `components.css`。
- **生成完整移动端页面** → 用 UI Kit 看结构和组合方式，用单组件预览页拿 markup，用真实页面尺寸重写外层布局，不复制 `.uikit-shell` / `.phone-frame` / `.phone-screen` 演示外壳。
- **处理中文文案和数据** → 读取 `specs/文案与数据规范.md`，金额、日期、时间、空数据、省略规则以它为准。
- **迭代已有组件** → 使用 `.codex/skills/iterate-component/SKILL.md` 定义的标准流程，走组件迭代 Skill。

### 调用边界

- 不擅自发布未在 `components/index.json` 注册的组件。
- 不为了临时需求接入 Lucide、第三方 CDN 图标或内联 SVG，常规图标统一用 `wego-iconfont`。
- 不把 UI Kit 的手机壳、Showcase 外壳或 `biz-*` 演示样式当成通用组件复制。
- 不直接手动编辑 `components.css`，改组件样式必须走"改预览页标记内样式 → 改组件契约 → 运行生成脚本"流程。

## 进一步阅读

- [.design_library/wegoux/README.md](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/README.md) — 品牌背景、视觉基础、命名规则、组件概览
- [.design_library/wegoux/SKILL.md](file:///Users/dk/Documents/code/wego-design-system/.design_library/wegoux/SKILL.md) — Skill 运行时控制入口和读取顺序
- [AGENTS.md](file:///Users/dk/Documents/code/wego-design-system/AGENTS.md) — 仓库级总则、硬约束、变更同步矩阵和已知技术债
- [.codex/skills/iterate-component/SKILL.md](file:///Users/dk/Documents/code/.codex/skills/iterate-component/SKILL.md) — 组件迭代的标准流程和守门清单
