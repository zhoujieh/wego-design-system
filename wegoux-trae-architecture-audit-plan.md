# wegoux 与 TRAE 设计系统架构审查比对及优化计划

> 本文档是审查与优化计划，不包含代码改动方案的实际落地。本次目标是借 TRAE/Nimbus Core 的结构完整性，反向校准 wegoux 的文件职责、组件契约、预览页规则、消费契约和未来迭代顺序，避免 wegoux 方向漂移。

## 1. 审查结论

TRAE 参考库本质是 `Nimbus Core`：暗色优先、桌面 IDE / 开发工具场景、英文界面、桌面信息密度。它不能作为 wegoux 的视觉和产品定位来源，只能作为“文件职责清晰、组件契约完整、消费边界明确”的结构参考。

wegoux 的大方向是正确的：移动端、微信生态、电商/工具场景、中文界面、微信绿 `#03C160` 克制使用。这一点已经写进 `SKILL.md`、`README.md`、Token、组件清单和 specs。当前主要问题不是视觉方向完全错误，而是规则表达还不够机器稳定：组件契约字段不统一，使用场景和禁止边界没有系统写入组件 JSON，预览页脚手架重复且不够统一，UI Kit 主示例仍混有 Lucide/CDN、演示外壳和业务样式，消费契约与实际文件存在少量不同步。

后续优化应按依赖顺序推进：先统一文件职责和路径，再稳定 Token，再升级组件契约，再规范预览页和聚合 CSS，最后修 UI Kit 与消费文档。不要从 UI Kit 或视觉细节直接开改，否则容易再次把业务演示样式误当通用组件。

## 2. TRAE 架构中各文件定义了什么

### 2.1 `SKILL.md`

TRAE 的 `SKILL.md` 是运行时入口，负责告诉 AI：这个库是什么、怎么读、哪些规则不能破坏。

它定义了：

| 内容 | 核心规则 |
| --- | --- |
| 产品定位 | `Nimbus Core`，暗色优先，桌面/IDE 场景。 |
| 库布局 | Token、`css.json`、`scaffold.css`、`components.css`、`icons.js`、`components/`、`preview/`、`ui_kits/`。 |
| 读取顺序 | 先理解 README/消费指南，再读 Token、组件索引、组件契约、预览页、UI Kit。 |
| Token 规则 | `colors_and_type.css` 是权威来源；组件直接消费源变量，不引入可移植别名。 |
| 组件规则 | 23 个组件，按 slug 注册，预览页与 JSON 契约一一对应。 |
| CSS 生成规则 | `components.css` 从预览页标记块自动生成，禁止手动编辑。 |
| UI Kit 边界 | UI Kit 是 Showcase，不是真实页面模板。 |
| 图标规则 | 使用随库 SVG 和 `icons.js`，不临时接入外部图标。 |
| 创作禁区 | 不生成亮色主题，不新增未定义色阶，不把 UI Kit 外壳当模板。 |

可借鉴点：`SKILL.md` 不只写“有什么”，还写“先读什么、不要做什么、如何生成、何时走哪个工作流”。wegoux 已经具备这些内容，但还要继续把“使用边界”和“禁止方向漂移”压进更可执行的文件级规则。

### 2.2 `README.md`

TRAE 的 `README.md` 是给人看的总说明，比 `SKILL.md` 更偏消费指南。

它定义了：

| 内容 | 核心规则 |
| --- | --- |
| 库概述 | 从原始 previews 提炼，23 个组件覆盖两个 UI Kit。 |
| 打开方式 | 直接打开静态 HTML，路径清楚列出。 |
| 文件清单 | 每个核心文件的用途说明。 |
| Token 亮点 | 表面、品牌、状态、文字、边框、排版、代码、圆角、间距。 |
| 命名规范 | 不重命名 Token，不自创值，组件直接使用 `var(--token)`。 |
| 生成说明 | 原始 HTML 结构保留，组件 CSS 从 preview 抽取。 |
| 下游消费 | Token 可复制，组件 markup 可复制，UI Kit 外壳不可复制。 |
| UI Kit 警告 | `max-width: 1184px` 是展示约束，真实页面要自己写外层 grid。 |

可借鉴点：TRAE 对“UI Kit 是 Showcase，不是页面模板”的解释非常明确，并给出正确消费流程。wegoux 也写了类似边界，但主 UI Kit 仍存在 `.phone-*`、Lucide、业务样式混用，后续需要让 README、消费契约、质量报告和真实文件互相一致。

### 2.3 `colors_and_type.css`

TRAE 的 `colors_and_type.css` 是权威 Token 源。文件头说明它是暗色唯一源头，并用 `/* @dark-only */`、`/* @group-priority: ... */` 标记方向。

它定义了：

| 分组 | 内容 |
| --- | --- |
| `radius` | `2 / 4 / 6 / 8 / 10 / full`。 |
| `spacers` | `0 / 4 / 6 / 8 / 12 / 16 / 24 / 32 / 40`。 |
| `font` | SF Pro Text、SF Pro、JetBrains Mono，以及字重。 |
| `body` | `xs/sm/md/base`，字号 10/11/12/13px，含 strong 配对。 |
| `heading` | `3xs` 到 `3xl`，字号 11 到 32px。 |
| `code` | 代码编辑器/终端字体、字号、行高和语法色。 |
| `bg` | 暗色基础背景、浮层、菜单、tooltip、反色背景。 |
| `bg-brand` | 品牌绿、hover、disabled、popup。 |
| `text` / `icon` | 默认、hover、active、secondary、tertiary、disabled、onbrand。 |
| `border` | 中性边框、品牌边框、强对比边框。 |
| `status` | primary/success/alert/warning/error，每组有 default/hover/active/surface。 |
| `brand-*` | green/red/yellow/blue/purple 100-1000 色阶。 |
| `viz` | 图表颜色和图表 UI Token。 |
| `special` | white/black/tab overlay。 |
| `layout aliases` | 少量从预览系统迁移的布局别名。 |

排版特点：

- 正文很小，偏桌面工具密度：10/11/12/13px。
- 标题层级完整：11/12/13/16/20/22/24/28/32px。
- 代码字体是一等公民：JetBrains Mono 和大量 `--code-*` 语法色。
- 数字、快捷键、代码块都倾向 mono/tabular。

可借鉴点：Token 分组完整，方向标记清晰，组件 CSS 基本只用 `var()`。不可借鉴点：暗色优先、代码语义、桌面字号和 IDE 色彩不适合 wegoux。

### 2.4 `css.json`

TRAE 的 `css.json` 是机器可读 Token 投影，顶层只有 `color`、`font`、`shadow`、`radius`、`spacing`、`size`。

它定义了：

- `color`：bg、bg-brand、text、icon、border、status、code、brand 色阶、accent。
- `font`：family、size、weight、lineHeight。
- `radius`：基础圆角与别名。
- `spacing`：spacer 刻度。
- `shadow`、`size`：存在桶，但基本为空。

可借鉴点：`css.json` 明确是 Token 的机器投影。wegoux 的投影范围更丰富，但需要继续保证它和 `colors_and_type.css` 同步。

### 2.5 `scaffold.css`

TRAE 有独立的 `scaffold.css`，专门管预览页和 UI Kit 的通用外壳，不放组件样式。

它定义了：

- reset、`html/body` 背景、字体、基础排版。
- 预览页标题、段落、section、grid、row、stack 等布局辅助。
- 共享原子：tooltip、popover、empty、code、kbd、mono/num。
- 预览页不要横向溢出的保护。

可借鉴点：把预览页脚手架与组件 CSS 分开。wegoux 目前每个预览页重复写 `body`、`.row`、`.label`、`.section-title` 等脚手架样式，后续可以不照搬 TRAE 的暗色视觉，但要沉淀一份移动端预览脚手架规范或共享 CSS。

### 2.6 `components/index.json`

TRAE 的组件索引是权威注册表。

它定义了：

- `schemaVersion: 2`
- `library: nimbus-core`
- 23 个组件的 `slug`、`name`、`preview`
- 2 个 UI Kit 的 `type` 和入口路径

可借鉴点：索引不仅列组件，还给出 preview 路径和 UI Kit 入口，适合机器消费。wegoux 当前索引列出了 category/status，但缺少 schemaVersion、library、preview、是否 embedded 等机器字段。

### 2.7 `components/{slug}.json`

TRAE 的每个组件契约字段高度统一。

统一字段包括：

| 字段 | 作用 |
| --- | --- |
| `schemaVersion` | 契约版本。 |
| `slug` / `name` / `category` | 组件身份和分类。 |
| `sourceKind` / `confidence` | 来源和可信度。 |
| `semanticTypeCandidates` | 语义候选，帮助 AI 映射需求。 |
| `variantDimensions` | 变体维度，如 intent、size、state、tone、control。 |
| `representativeVariants` | 代表性组合，避免穷举失控。 |
| `anatomy` | 组件结构部件名称。 |
| `structurePatterns` | DOM/布局组合规则。 |
| `usageHints` | 适用场景、推荐用法、局部规则。 |
| `doNotInvent` | 禁止发明的变体或能力。 |
| `unknowns` | 未确定问题，避免假装稳定。 |
| `tokensConsumed` | 实际消费的 Token 列表。 |
| `domAnatomy` | 代表 DOM 结构。 |
| `provenance` | 预览页、来源、CSS section。 |

组件的使用场景规则写进去了，主要在 `usageHints`、`structurePatterns` 和 `doNotInvent` 中。比如 `setting-row` 明确写了：select 用于预设选择、button 用于二级配置、danger button 用于破坏动作、同组 rows 放进 panel；同时禁止它发明表单提交、校验错误、展开折叠、switch/toggle 控件。

交互规则的表达方式：TRAE 组件契约大多写状态维度和结构规则，不一定写完整 JS 行为。比如 switch 在 `forms` 组件中通过原生 input + CSS `transition` 表达开关状态和滑块动画，但契约没有单独的 `behavior` 字段。对 wegoux 来说，移动端交互更关键，应比 TRAE 更明确地写 `behavior`。

### 2.8 TRAE 23 个组件各自定义的核心内容

| 组件 | 核心定义 |
| --- | --- |
| `activity-rail` | IDE 垂直活动栏，定义按钮、激活态、分割线、spacer，禁止发明横向导航。 |
| `alert` | 通知/警告，定义 tone 和 layout，局部状态着色。 |
| `avatar` | 用户头像，定义尺寸、形状、堆叠组和溢出。 |
| `buttons` | 按钮矩阵，定义 intent、size、state、shape，包含图标/文字/纯图标。 |
| `cards` | 表面卡片，定义标题、描述、操作区和装饰。 |
| `chat-composer` | AI 输入框，定义输入区、工具栏、模型标签、麦克风、发送按钮。 |
| `dialog` | 弹窗，定义 backdrop、head、body、foot、关闭和操作按钮。 |
| `editor-tabs` | IDE 标签页，定义 tab、关闭按钮、激活态、操作区。 |
| `file-tree` | 文件树，定义多级行、展开箭头、文件类型图标和层级。 |
| `forms` | input、textarea、select、checkbox、radio、switch、slider 等表单控件。 |
| `kbd` | 快捷键提示，定义单键、组合键和 mono 数字规则。 |
| `menu` | 下拉菜单，定义 item、shortcut、divider、danger item。 |
| `nav-list` | 侧边导航，定义 group、item、label、badge、active。 |
| `page-header` | 页面头，定义标题、副标题和右侧操作区。 |
| `pagination` | 分页器，定义数字页码、省略号、active/disabled。 |
| `setting-row` | 设置行，定义标题描述 + 控件插槽，适合设置面板。 |
| `stat-card` | KPI 卡片，定义 label、value、delta、caption。 |
| `status-bar` | IDE 状态栏，定义分组、状态项、圆点。 |
| `table` | 数据表格，定义头像、标签单元格、工具栏/底栏。 |
| `table-panel` | 表格容器，定义 toolbar、table、footer/pagination 插槽。 |
| `tabs` | 标签页，定义 underline、filled、closable。 |
| `tag` | 标签，定义 default/success/warning/danger/brand/count/neutral。 |
| `workbench-titlebar` | IDE 顶部栏，定义红绿灯、项目选择器、图标按钮。 |

### 2.9 `preview/component-*.html`

TRAE 的预览页承担两件事：展示组件矩阵，并提供可抽取的权威组件 CSS。

它们的规则：

- 每个组件一个 HTML。
- 统一引入 `../colors_and_type.css`、`../scaffold.css`、`../components.css`。
- 组件核心 CSS 必须放在 `/* @component-css-start */` 和 `/* @component-css-end */` 之间。
- 标记外是预览脚手架、标题、section 和 demo 布局。
- 组件 CSS 基本只用 Token，不硬编码 hex。
- 多数预览是静态展示，不写 JS。
- 表单控件的交互用原生 input/check 状态表达，switch 有 `transition`，但没有复杂交互脚本。

关于开关组件：应该定义开关状态变化的动画。TRAE 的 `forms` 里定义了 `.ds-switch` 背景与边框 `0.15s` 过渡、`.ds-switch__thumb` 的 `left/background` 过渡。对 wegoux 来说，建议在组件契约写清 `transitionProperty`、`duration`、`easing`、on/off thumb 位置；在预览页核心 CSS 落地；交互 demo 的点击 JS 可以有，但要明确它是 demo，不是组件 CSS 的一部分。

### 2.10 `components.css`

TRAE 的 `components.css` 是聚合输出，文件头写明自动生成、禁止手动编辑。

它定义了：

- 每个组件的 CSS section。
- 从预览页标记块抽出的 `.ds-*` 类。
- 基本只含组件 class，不含页面脚手架。
- 不应该手动维护。

### 2.11 `library-consumption.json`

TRAE 的消费契约定义 AI/下游项目应该怎么读、怎么复制。

它定义了：

- Token 层：`colors_and_type.css` + `css.json`，可复制。
- Component 层：`components.css` + preview，组件级 markup 可复制。
- Icon 层：`assets/icons/*.svg` + `icons.js`，禁止临时拉 Lucide/CDN。
- UI Kit 层：只读结构，不复制 `.uikit-shell`。
- 推荐读取顺序。
- 下游场景：只用 Token、构建单组件、构建完整页面。
- UI Kit 约束：`max-width: 1184px`，内层组件 fluid。

### 2.12 `uikit-plan.json`

TRAE 的 UI Kit 计划定义组件白名单和槽位，但它的业务叙事较弱。

它定义了：

- 核心组件：`buttons`、`nav-list`。
- 辅助组件：其他 21 个。
- `allowedComponents` 白名单。
- fixed slot：button、navigation、menu、card、tag、table 等。
- `screenBlueprints` 和 `productContext` 为空或 null，说明它更偏自动生成计划，不够产品化。

可借鉴点：白名单和 slotAssignments 很适合机器约束。不可借鉴点：wegoux 需要更强中文移动端业务蓝图，不能像 TRAE 一样让 productContext 为空。

### 2.13 `ui_kits/*`

TRAE 有 `dashboard` 和 `dev-explorer` 两个 UI Kit。

它们定义了：

- 单文件 React 18 Showcase。
- 引入 `colors_and_type.css` 和 `components.css`。
- 外层 `.uikit-shell` 限宽 1184px，明确不能当真实页面模板。
- 用 `quality-report.json` 记录复用率、组件使用、状态覆盖、mock 数据密度和 warning。

质量报告显示：

- `dashboard` 复用率 0.82，无发明组件。
- `dev-explorer` 复用率 0.78，无发明组件。

这说明 TRAE 的 UI Kit 虽然也是 Showcase，但它比 wegoux 主 `app` 更依赖已注册组件。

## 3. wegoux 对应文件比对问题

### 3.1 总体定位

wegoux 当前定位清楚：移动端、微信生态、电商/工具、中文、高信息密度、淡雅克制。这个方向必须保持。

主要风险：

1. TRAE 的桌面/IDE/暗色/代码语义不能迁移到 wegoux。
2. 结构可以参考，但视觉不能跟随。
3. 目前部分文件还有“业务展示”和“通用组件”边界不够硬的问题，尤其是 UI Kit 和预览页。

### 3.2 `SKILL.md` 与 `README.md`

现状优点：

- 明确主色、风格、优先级、移动端触控、图标、组件清单。
- 写清 `components.css` 自动生成，禁止手动编辑。
- 写清 `navbar-action-button` 是嵌入组件。
- 已经强调 UI Kit 是 Showcase，不可复制外壳。

发现的问题：

| 问题 | 影响 |
| --- | --- |
| 文档提到 `icons/`，实际资产在 `assets/icons/`。 | 下游读取路径可能错误。 |
| `README.md`/`SKILL.md` 已提到 `biz-settings`，但 `library-consumption.json` 的 `uiKits` 仍只有 `app`。 | 消费契约和实际 UI Kit 不同步。 |
| README 文件清单中根路径写成 `.design_library/微购设计系统/`。 | 与实际 `.design_library/wegoux/` 不一致。 |
| 方向约束主要在文档层，还没有系统进入每个组件契约。 | 后续 AI 修改单组件时容易只看局部文件。 |

### 3.3 `colors_and_type.css`

现状优点：

- 比 TRAE 更适合 wegoux：浅色移动端优先，微信绿 `#03C160`，PingFang SC，金额数字字体，触控 Token。
- Token 覆盖比 TRAE 更广：597 个变量，包含 color/font/radius/spacing/size/stroke/shadow/motion/touch/layout/blur/z-index/icon。
- 已明确禁止导入 TRAE 桌面、IDE、暗色优先语义。

发现的问题：

| 问题 | 影响 |
| --- | --- |
| 命名层级较多：`--wg-*`、`--color-*`、`--Status-*`、`--Text-*`、`--Surface-*` 并存。 | 对 AI 和下游来说，权威用法不够唯一。 |
| `.dark` 可选覆盖较完整，但 wegoux 不是暗色优先。 | 后续迭代可能误把暗色当主方向。 |
| 部分组件仍硬编码 `#E5E5EA`、`rgba(0,0,0,0.15)`、`#f33` 等。 | Token 不能完全约束组件实现。 |
| `css.json` 虽覆盖更全，但缺少自动校验流程说明。 | 新增 Token 后容易投影滞后。 |

建议：保留浅色移动端为默认，明确 `.dark` 只是可选覆盖；为 switch off、选择控件边框、促销强红等补齐语义 Token 后，再清理组件硬编码。

### 3.4 `css.json`

现状优点：

- 顶层比 TRAE 完整：`color`、`font`、`shadow`、`radius`、`spacing`、`size`、`layout`、`blur`、`motion`、`stroke`、`touch`、`zIndex`。
- 已投影字体资产、数字字号、触控、布局等移动端重要信息。

发现的问题：

| 问题 | 影响 |
| --- | --- |
| 项目已知技术债写明 `css.json` 需要补齐新增 Token 投影。 | 说明当前可能有 Token 同步遗漏风险。 |
| 没有专门的 parity 校验脚本或报告。 | 只能人工判断 `colors_and_type.css` 与 `css.json` 是否一致。 |

建议：后续正式迭代先加“Token 源 -> JSON 投影”的检查表或脚本，再改组件。

### 3.5 `components/index.json`

现状优点：

- 18 个稳定组件符合当前发布规则。
- category/status 比 TRAE 的索引更直接。

发现的问题：

| 问题 | 影响 |
| --- | --- |
| 缺少 `schemaVersion`、`library`。 | 机器消费不易判断契约版本。 |
| 缺少 `preview` 路径。 | 下游必须推断 preview 文件。 |
| 没有标注 `navbar-action-button` 为 embedded。 | 需要依赖 README/SKILL 才知道它没有独立预览。 |
| 没有列 UI Kit 入口。 | 组件注册表与 Kit 关系弱。 |

建议：升级注册表 schema，但不改变已发布组件数量和顺序。

### 3.6 `components/{slug}.json`

现状优点：

- 18 个组件都有契约，且业务描述比较贴近移动端。
- `radio` 已经写了 `structure`、`behavior`、`darkMode`，是当前最接近完整契约的样板。
- `counter` 已写 accessibility 和触控热区扩展，是移动端关键规则。
- `switch` 已写尺寸、on/off、disabled、滑块位置和动画 Token。

发现的问题：

| 问题 | 影响 |
| --- | --- |
| 字段不统一：有的写 `variants/sizes/states`，有的写 `structure/behavior/accessibility/darkMode`，但不是统一 schema。 | 批量维护和机器读取困难。 |
| 所有组件缺少 `usageHints`。 | 使用场景规则没有系统写入组件层。 |
| 所有组件缺少 `doNotInvent`。 | AI 容易发明未发布变体或桌面化能力。 |
| 所有组件缺少 `provenance` 和 `preview`。 | 契约与预览页、聚合 CSS 的来源链不完整。 |
| 多数组件缺少 `behavior`。 | 点击、互斥、禁用、选择、开关等交互规则分散在预览页或描述里。 |
| 多数组件缺少 `accessibility`。 | 触控、禁用、语义角色、aria 约束不足。 |
| `designTokens` 常写原始色值。 | 与 Token 优先原则冲突。 |

回答重点问题：组件使用场景规则应该写进组件契约。建议每个组件都至少有 `usageHints`、`doNotInvent`、`behavior`、`tokensConsumed`、`provenance`。比如 switch 不只写“52x32、绿色开启”，还要写“用于布尔设置项；点击切换 on/off；disabled 不响应；动画只允许背景和滑块位置变化；不用于多状态选择；不做弹性回弹复杂动效”。

### 3.7 `preview/component-*.html`

现状优点：

- 17 个独立预览页都有 `@component-css-start/end` 标记。
- `navbar-action-button` 作为 navbar 内嵌组件处理，符合当前规则。
- 多个预览页有交互 demo，有助于观察移动端状态。

发现的问题：

| 问题 | 影响 |
| --- | --- |
| 预览页脚手架重复：`body`、`.row`、`.label`、`.section-title` 到处复制。 | 风格和布局容易漂移，维护成本高。 |
| CSS 引入不统一：有的引 `components.css`，有的不引；有图标时引 `iconfont.css`，但不是所有页面一致。 | 预览环境不够稳定。 |
| 组件核心 CSS 里仍有少量 raw hex，例如 switch off、radio 边框、chip 促销色。 | Token 管控不完整。 |
| 部分预览页使用 inline SVG 或硬编码 fill。 | 与“优先 iconfont / 随库资产”的规则不完全一致。 |
| 有 demo JS 的组件，契约却不一定写 behavior。 | 规则在 HTML demo 中，机器消费 JSON 时看不到。 |

关于交互：预览页可以包含交互 demo，但交互规则不能只藏在 JS 里。契约负责写规则，预览页负责展示与验证。比如 switch 当前 CSS 已有 `transition`，JS 能点击切换；后续还要把“动画属性、时长、禁用不响应、点击热区”统一写进 `switch.json` 的 `behavior/accessibility`。

### 3.8 `components.css`

现状优点：

- 文件头明确自动生成，禁止手动编辑。
- 从预览页聚合，符合项目发布规则。
- 当前脚本还会插入 `@anatomy` 注释，帮助观察代表 DOM。

发现的问题：

| 问题 | 影响 |
| --- | --- |
| `components.css` 中仍有少量 raw hex。 | 来源是预览页核心 CSS，需要回到 preview 修。 |
| `@anatomy` 是生成注释，但文档没有明确说明。 | 消费者可能误解为手写内容或规则来源。 |
| 脚本会抽 DOM anatomy，但组件 JSON 没同步 `domAnatomy`。 | 聚合 CSS 和契约信息没有互通。 |

建议：不要手动编辑 `components.css`。后续修 Token/preview 后运行脚本，再用 diff 验证。

### 3.9 `uikit-plan.json`

现状优点：

- 已按移动端 fixed slot 排序：navbar、bottom-nav、button、cell、form、card。
- `productContext` 有中文移动端电商/工具语境。
- 有 `screenBlueprints` 和 `pagePatterns`，比 TRAE 更贴合产品。
- 明确禁止 `desktop-sidebar`、`marketing-hero`、`large-gradient-hero`、`decorative-orb-background`。

发现的问题：

| 问题 | 影响 |
| --- | --- |
| `selectedFrameNames` 包含 `ui_kits/biz-settings/index.html`，但 `uiKits` 只列 `app`。 | 计划文件内部不同步。 |
| 只在 plan 层写了 forbidden invented components，组件契约层没写。 | 单组件迭代仍可能漂移。 |
| `supportEvidenceComponents` 覆盖完整，但没有统一 `specRef` 到每个组件。 | 组件与 specs 的关系弱。 |

### 3.10 `library-consumption.json`

现状优点：

- 定义了 Token、Component、Icon、Spec、UI Kit 五层契约。
- 明确 UI Kit 不能复制外壳，真实页面要重写外层结构。
- 写清图标优先 iconfont。

发现的问题：

| 问题 | 影响 |
| --- | --- |
| `icons/*.svg` 与实际 `assets/icons/*.svg` 不一致。 | 下游复制资产可能找不到文件。 |
| `uiKits` 只列 `app`，没有 `biz-settings`。 | 实际已有 Kit 没进入消费契约。 |
| 推荐读取顺序没有把 `SKILL.md` 放入首位。 | 与 AGENTS 当前读取顺序不完全一致。 |

### 3.11 `ui_kits/app` 与 `ui_kits/biz-settings`

现状优点：

- `app` 覆盖首页、详情、我的、业务设置，业务语境完整。
- `biz-settings` 已经大量复用注册组件，质量报告复用率为 1。
- `biz-settings` 的页面模式、转场、slot 与 specs/uikit-plan 对齐度较高。

发现的问题：

| 文件 | 问题 |
| --- | --- |
| `ui_kits/app/index.html` | 质量报告复用率 0.52，仍有 Lucide CDN、`phone-header`、`phone-status`、`phone-indicator`、`menu-item` 等演示/业务样式。 |
| `ui_kits/app/quality-report.json` | 已记录 Lucide 和发明组件问题，但尚未修复。 |
| `ui_kits/biz-settings/index.html` | 复用率高，但仍有 inline `CHECKMARK_SVG`，应优先回到 checkbox/iconfont/随库资产。 |
| 两个 Kit | 都有 `.uikit-shell`、`.phone-frame`、`.phone-screen` 外壳，需要继续强调 Showcase 边界。 |

建议：后续先以 `biz-settings` 为样板修 `app`，目标是主 `app` 复用率至少提升到 0.8，所有 Lucide/CDN 图标替换为 iconfont 或随库资产。

### 3.12 图标与资产

现状优点：

- `iconfont.css` 包含大量 `.icon-*` class，适合中文移动端。
- `assets/fonts/` 完整。
- `assets/icons/` 有 Tab、标签、选择态等固定 SVG 资产。

发现的问题：

| 问题 | 影响 |
| --- | --- |
| 文档有时写 `icons/`，实际是 `assets/icons/`。 | 路径不一致。 |
| UI Kit 主 app 使用 Lucide CDN。 | 违反生产图标优先使用随库资产的方向。 |
| 部分预览页 inline SVG 较多。 | 图标来源分散，不利于统一替换。 |

## 4. 推荐优化顺序

> **进度总览**
>
> | 阶段 | 状态 | 说明 |
> | --- | --- | --- |
> | 阶段 0：冻结方向和审查基线 | **已完成** | AGENTS.md、README.md、SKILL.md 中已明确方向约束，无需额外改动 |
> | 阶段 1：同步文件路径和消费入口 | **已完成** | 9 项修复已提交（commit `312b3ac`），metadata version 118 |
> | 阶段 2：整理 Token 权威层 | 未开始 | — |
> | 阶段 3：升级组件契约 schema | 未开始 | — |
> | 阶段 4：规范预览页 | 未开始 | — |
> | 阶段 5：重新生成 `components.css` | 未开始 | — |
> | 阶段 6：修复 UI Kit | 未开始 | — |
> | 阶段 7：同步文档和消费契约 | 未开始 | — |

### 阶段 0：冻结方向和审查基线 ✅ 已完成

目标：先防漂移，再改文件。

> **完成记录**：AGENTS.md 已写死"TRAE 只作为结构完整性参考，不能迁移视觉风格和产品定位"；README.md 和 SKILL.md 已明确移动端/微信生态/电商工具定位。确认无需额外改动。

要做：

1. 明确 TRAE 只能作为结构参考，不迁移暗色、IDE、桌面字号、代码语义和桌面组件。
2. 保持 wegoux 默认方向：移动端、微信生态、电商/工具、中文、高信息密度、浅色优先。
3. 建立本次问题清单，不直接改视觉。

验收：

- README/SKILL/计划文档都能说清楚“参考 TRAE 的结构，不参考 TRAE 的风格”。

### 阶段 1：同步文件路径和消费入口 ✅ 已完成

目标：先让人和 AI 读对文件。

> **完成记录**（commit `312b3ac`，metadata version 118）：
>
> 1. ✅ README.md 文件清单根路径从 `.design_library/微购设计系统/` 统一为 `.design_library/wegoux/`。
> 2. ✅ 所有文档中 `icons/*.svg` 修正为 `assets/icons/*.svg`（README.md、SKILL.md、library-consumption.json 共 6 处）。
> 3. ✅ `biz-settings` UI Kit 同步到 library-consumption.json（uiKits 数组 + uikit layer files）、components/index.json（uiKits 入口列表）、uikit-plan.json（uiKits 入口列表）、README.md（文件清单树 + 下游消费指南表格）、SKILL.md（文件清单树）。
> 4. ✅ `navbar-action-button` 在 components/index.json 中标记 `embedded: true` + `hostComponent: "navbar"`。
> 5. ✅ components/index.json、library-consumption.json、uikit-plan.json 三个核心 JSON schemaVersion 统一升级到 2，补充 `library: "wegoux"`。
> 6. ✅ 所有 18 个组件在 index.json 中补充 `preview` 路径。
> 7. ✅ library-consumption.json `recommendedReadOrder` 首位加入 `SKILL.md`。
>
> **验收结果**：全文档路径 grep 无遗留旧路径；biz-settings 在 5 个文件中同步到位；JSON schemaVersion 一致。

要做：

1. 统一文档中的根路径为 `.design_library/wegoux/`。
2. 把 `icons/*.svg` 修为实际的 `assets/icons/*.svg`。
3. 在 `library-consumption.json`、`uikit-plan.json`、README、SKILL 中同步 `app` 和 `biz-settings` 两个 UI Kit。
4. 明确 `navbar-action-button` 是 embedded component，并在注册表中机器可读。

验收：

- 所有文档提到的路径都能在仓库中找到。
- 消费契约列出的 UI Kit 与实际目录一致。

### 阶段 2：整理 Token 权威层

目标：让所有组件只从 Token 取值。

要做：

1. 确定 Token 使用优先级：组件 CSS 优先用 `--color-*`、`--font-*`、`--space-*`、`--radius-*`、`--duration-*` 等便携别名；源 Token 只作为底层。
2. 补齐缺失语义 Token：例如 switch off 背景、选择控件默认边框、深浅禁用边框、促销强红。
3. 清理组件契约和预览页核心 CSS 中的 raw hex。
4. 同步 `css.json`。
5. 明确 `.dark` 只是可选覆盖，不是默认方向。

验收：

- `colors_and_type.css` 与 `css.json` 无明显不同步。
- 组件核心 CSS 中 raw hex 降到 0；必要例外必须在契约中说明。

### 阶段 3：升级组件契约 schema

目标：把组件使用规则写进组件文件，而不是只写在 README 或预览页。

建议所有组件统一字段：

```json
{
  "schemaVersion": 2,
  "slug": "...",
  "name": "...",
  "category": "...",
  "status": "stable",
  "sourceKind": "inferred",
  "confidence": "high",
  "description": "...",
  "semanticTypeCandidates": [],
  "variantDimensions": {},
  "representativeVariants": [],
  "anatomy": [],
  "structurePatterns": [],
  "behavior": {},
  "accessibility": {},
  "usageHints": [],
  "doNotInvent": [],
  "tokensConsumed": [],
  "designTokens": {},
  "specRefs": [],
  "domAnatomy": {},
  "provenance": {},
  "unknowns": []
}
```

优先级：

1. `button`、`cell`、`form`、`input`
2. `navbar`、`navbar-action-button`、`bottom-nav`
3. `switch`、`checkbox`、`radio`、`counter`
4. `card`、`image`、`avatar`
5. `chip`、`badge`、`link`、`stack`

验收：

- 每个组件都有 `usageHints` 和 `doNotInvent`。
- 每个可交互组件都有 `behavior`。
- 每个组件都有 `provenance.preview` 和 `tokensConsumed`。

### 阶段 4：规范预览页

目标：预览页既能展示，又能作为 CSS 权威来源。

要做：

1. 制定 wegoux 移动端预览页脚手架规则，不照搬 TRAE 暗色 `scaffold.css`。
2. 所有预览页统一引入 `colors_and_type.css`；涉及图标时统一引入 `iconfont.css`。
3. 组件核心 CSS 只放在标记块之间，脚手架、demo 样式、toast、setting-row demo 等留在标记外。
4. demo JS 可以保留，但对应交互必须写入组件 JSON。
5. inline SVG 只允许用于已批准的随库固定资产；常规图标回到 iconfont。

验收：

- 所有 `preview/component-*.html` 标记完整。
- 标记块内无 page scaffold、无 demo-only 样式、无未解释 raw hex。
- 组件契约能解释预览页中的所有状态和交互。

### 阶段 5：重新生成 `components.css`

目标：让聚合样式只由预览页生成。

要做：

1. 修改 preview 标记块后运行 `node scripts/extract-components-css.mjs .`。
2. 验证 `components.css` 文件头仍保留 `DO NOT EDIT MANUALLY`。
3. 验证 raw hex、未定义 Token、重复 selector。
4. 说明 `@anatomy` 是生成脚本插入的代表 DOM 注释。

验收：

- `components.css` 只通过脚本生成。
- 输出 warnings 可解释或为 0。

### 阶段 6：修复 UI Kit

目标：主 UI Kit 体现系统能力，不继续发明页面组件。

要做：

1. 以 `biz-settings` 为样板重构 `app`。
2. 用 `navbar` 替代 `phone-header`。
3. 用 `cell` 替代 `menu-item`。
4. 用 `bottom-nav` 的已注册结构替代 Lucide Tab 图标。
5. 移除 Lucide CDN；图标改用 iconfont 或 `assets/icons/` 固定资产。
6. 保留 `.uikit-shell`、`.phone-frame`、`.phone-screen` 作为 Showcase 外壳，但继续标注不可复制。
7. 同步 `quality-report.json`。

验收：

- `ui_kits/app/quality-report.json` 复用率目标 >= 0.8。
- `inventedComponents` 只允许 Showcase 外壳类。
- 无 Lucide/CDN 图标。

### 阶段 7：同步文档和消费契约

目标：所有文件说同一套话。

要做：

1. 同步 README、SKILL、`library-consumption.json`、`uikit-plan.json`。
2. 把组件 schema、使用边界、预览页规则写进 README/SKILL。
3. 每次新增/修改组件时同步质量报告和消费契约。
4. 正式迭代递增 `metadata.json` version。

验收：

- README、SKILL、组件注册表、消费契约、UI Kit 质量报告互相一致。

## 5. 关键决策建议

### 5.1 要不要为 switch 定义交互动画

要定义。

建议分三层：

| 层 | 应写什么 |
| --- | --- |
| `components/switch.json` | on/off/disabled、点击切换、禁用不响应、滑块位置、动画属性、时长、缓动、不要做复杂回弹。 |
| `preview/component-switch.html` | 核心 CSS 中实现 `background` 和 `left/transform` 的 `transition`，demo JS 只负责切换 class。 |
| `specs/动效与视觉效果.md` | 规定开关属于轻微状态切换，用 `--duration-fast` 和 `--ease-standard`。 |

当前 wegoux 已经在 switch 契约和预览页中写了动画，但还缺少统一 `behavior/accessibility/usageHints/doNotInvent` 字段。

### 5.2 组件使用场景规则要不要写进组件 JSON

要写。

README/SKILL 是全局规则，组件 JSON 是单组件决策规则。AI 只改某个组件时，最容易只读对应 JSON 和 preview。如果使用场景不在组件 JSON，后续很容易把 `cell` 扩成桌面 table row、把 `switch` 扩成多状态 toggle、把 `card` 扩成营销卡片。

建议每个组件至少写：

- `usageHints`：什么时候用。
- `doNotInvent`：不要发明什么。
- `behavior`：可交互组件怎么响应。
- `accessibility`：触控热区、禁用、语义。
- `specRefs`：关联哪个规范。

### 5.3 要不要新增 wegoux 版 `scaffold.css`

可以考虑，但不应照搬 TRAE。

更稳妥的做法是先写“预览页脚手架规范”，再决定是否抽成文件。如果抽成文件，应是浅色移动端预览脚手架，只包含 body、section、row、label、phone demo 辅助，不包含真实组件样式，也不引入暗色 IDE 视觉。

### 5.4 `components.css` 里的 `@anatomy` 是否保留

可以保留，但要写清楚它是生成脚本插入的辅助注释，不是手写规则。真正的结构权威应逐步迁移到 `components/{slug}.json` 的 `domAnatomy` / `anatomy` 字段。

## 6. 后续执行检查表

正式进入下一轮代码优化时，每轮都检查：

- 是否仍是移动端、微信生态、电商/工具、中文场景。
- 是否没有引入 TRAE 的暗色、IDE、桌面侧栏、代码编辑器语义。
- `components/index.json`、组件契约、预览页、`components.css` 是否同步。
- `colors_and_type.css` 与 `css.json` 是否同步。
- 组件核心 CSS 是否优先使用 Token。
- 图标是否优先使用 `iconfont.css` 或随库资产。
- UI Kit 是否只作为 Showcase，不把 `.phone-*`、`.biz-*` 沉淀为通用组件。
- `quality-report.json` 是否反映真实复用率。
- `metadata.json` 是否按正式迭代递增。

## 7. 本次不改代码的边界

本次只新增这份根目录审查/优化计划文档，不修改 `.design_library/wegoux/` 下任何代码、样式、JSON、HTML 或资产文件。

提交时应只 add 本文档路径，避免带入当前已有的未归属改动：

- `.design_library/wegoux/metadata.json`
- `design-inventory-settings/`
