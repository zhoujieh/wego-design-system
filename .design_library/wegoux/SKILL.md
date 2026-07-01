---
name: "wego-design"
description: "用于生成符合微购设计系统的移动端中文界面。包含品牌原则、设计 Token、组件契约、图标字体、预览页和 UI Kit。"
---

# 微购设计系统（wegoux）

> 面向移动应用和微信生态的中文产品设计系统。风格关键词是**简洁、干净、淡雅、克制**；设计优先级是：清晰 > 一致 > 效率 > 美观 > 创新。使用本 Skill 时，先阅读 `README.md`，再按任务需要读取 Token、组件契约、预览页和 `specs/` 规范。

## 库布局

> 以下路径均相对于本 Skill 根目录，根目录可记为 `{WEGOUX_ROOT}`。消费者可把它放在项目任意位置，使用时自行解析根路径。

```text
{WEGOUX_ROOT}/
├── SKILL.md                    # Skill 入口说明
├── README.md                   # 品牌背景、视觉基础、命名规则、组件概览
├── colors_and_type.css         # 权威 CSS Token 源：v2 公共 Token（palette + bg/text/icon/border/status + type/size）
├── css.json                    # 机器可读 Token 投影
├── typography.css              # 预览/脚手架排版辅助类（不属于 Token 权威层）
├── scaffold.css                # 预览页脚手架样式（仅用于 preview/ 和 ui_kits/）
├── components.css              # 聚合组件样式（自动生成，禁止手动编辑）
├── iconfont.css                # wego-iconfont 图标字体 class
├── library-consumption.json    # AI / 下游消费推荐读取顺序和复制规则
├── uikit-plan.json             # 组件白名单、槽位分配和页面蓝图
├── metadata.json               # 库元信息
├── scripts/
│   └── extract-components-css.mjs  # 组件 CSS 聚合生成脚本
├── assets/
│   └── fonts/                  # wego-iconfont 字体文件
├── assets/icons/               # Tab、标签、选择类 SVG 资产
├── components/                 # 组件契约 JSON
│   ├── index.json              # 当前权威组件注册表
│   └── *.json                  # 单组件契约
├── preview/                    # 组件 HTML 预览页（含人工验收聚合入口）
├── ui_kits/
│   ├── app/
│   │   ├── index.html          # 移动端应用 UI Kit 示例
│   │   └── quality-report.json # UI Kit 质量报告
│   └── biz-settings/
│       ├── index.html          # 业务设置底部面板模式 UI Kit
│       └── quality-report.json # 业务设置质量报告
└── specs/                      # 微购专项设计规范（含预览页脚手架规范）
```

## 读取顺序

1. 先读 `README.md`，理解品牌、视觉基础和命名规则。
2. 读 `library-consumption.json`，确认下游消费场景、文件读取顺序和复制边界。
3. 需要页面组合时，读 `uikit-plan.json`，确认允许使用的组件、核心槽位和页面蓝图。
4. 需要用 Token 时，优先读 `colors_and_type.css`；需要结构化处理时再读 `css.json`。
5. 需要组件时，先读 `components/index.json`，再读对应 `components/{slug}.json` 和 `preview/component-{slug}.html`。
6. 需要人工集中验收组件时，读 `preview/index.html`；它只作为聚合查看入口，不替代单组件预览页和契约。
7. 需要页面组合示例时，参考 `ui_kits/app/index.html` 和 `ui_kits/app/quality-report.json`。
8. 需要更细的行为、文案、图标、布局和动效规则时，读取 `specs/` 下对应规范。

## 品牌要素

- **主色**：微信绿 `#03C160`，用于主按钮、选中态、成功反馈和品牌识别。
- **背景**：页面底色 `#EDEDED`，内容表面 `#FFFFFF`，弱表面 `#F8F9FA` / `#F2F3F6`。
- **文字**：一级文字 `#1E2028`，二级文字 `#6E7382`，弱化文字 `#9097A3`，禁用/占位 `#B7BEC5`。
- **状态色**：危险 `#FA5051`，警告 `#FA9D3B`，信息 `#208BF1`，促销 `#FF6045`，黄色强调 `#FFC300`。
- **字体**：正文使用 `PingFang SC`；金额和数字优先使用 `WegoKeyboard N9`，回退到 `DIN Alternate` / `SF Pro Display`。
- **字号**：常用 10 / 12 / 14 / 16 / 18 / 22px；数字常用 12 / 14 / 16 / 20 / 24 / 32px。
- **圆角**：4 / 6 / 8 / 12 / 16 / 999px。
- **间距**：0 / 2 / 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 72px。
- **触控**：紧凑 40px / 默认 44px / 舒适 48px 为参考值；仅当点击目标小于 32px 时才考虑用伪元素补偿，且不能破坏布局，详见 `specs/布局与间距规范.md` 操作热区章节。

## Token 命名规范

`colors_and_type.css` 是权威来源。不要随意新增色值或重命名 Token。

- `--palette-*`：完整 10 档基础色阶，例如 `--palette-green-500`、`--palette-neutral-1000`。
- `--bg-*` / `--text-*` / `--icon-*` / `--border-*`：组件直接消费的表面、内容、图标和描边 Token。
- `--status-{success|warning|danger|info|promotion}-*`：状态色，包含 `default`、`hover`、`active` 和 `surface-l1..l3`。
- `--body-*` / `--heading-*` / `--number-*`：正文、标题和数字/金额排版角色。
- `--spacer-*` / `--radius-*` / `--shadow-*`：间距、圆角、阴影别名。
- `--duration-*` / `--ease-*`：动效时长和缓动别名。
- `--size-*` / `--touch-*` / `--z-*`：尺寸、触控热区和层级别名。
- `--stroke-*` / `--layout-*`：描边和布局别名。

v2 不保留旧命名兼容层；新组件和业务页面不得继续使用旧的 `wg` 前缀或旧色彩别名。

## 组件（注册表 17 个）

`components/index.json` 是当前权威注册表。组件实现时，优先复用已有 class、结构和 Token。

| Slug | 名称 | 类型 | 说明 |
|------|------|------|------|
| `button` | 按钮 | action | strong/medium/weak/danger 四种强调级别，大/中/小三种尺寸；图标和纯图标模式仅用于新建场景。 |
| `link` | 链接 | action | 独立链接和内联链接，适合文字跳转操作。 |
| `card` | 卡片 | display | 白底、线框、填充三种样式，默认无阴影、无内边距，可承载商品、订单、余额等内容。 |
| `avatar` | 头像 | display | 图片头像和文字头像，支持 24 / 40 / 56px。 |
| `tag` | 标签 | display | 状态标识、筛选标签、添加标签和优惠券业务标签。 |
| `badge` | 角标 | display | 红点、数字、文字、移除四类角标；文字类默认绿色，支持通过 CSS 变量自定义颜色与滚动宽度。 |
| `cell` | 列表单元格 | display | 单行/双行信息项，支持左右插槽、分割线、点击态和角标。 |
| `image` | 图片 | display | 预设尺寸、自定义矩形/宽幅、cover/contain、加载和错误态。 |
| `bottom-nav` | 底部导航 | navigation | 移动端主 Tab，固定 5 个 Tab：动态、好友、工作台、消息、我的；支持选中态和角标。 |
| `navbar` | 导航栏 | navigation | 顶部导航，支持返回/关闭、居中/左对齐标题、右侧操作区。 |
| `stack` | 选项卡 | navigation | 方块式选项，多项选择场景，支持未选和已选态。 |
| `input` | 输入框 | form | 独立输入框，支持 text / textarea / 紧凑数字输入，以及清除、错误、禁用状态。 |
| `counter` | 计数器 | form | 数字增减控件，用于商品数量和库存数量；视觉 32px 高，按钮热区用伪元素扩展到 40px。 |
| `checkbox` | 复选框 | form | 24 / 20px，支持未选、已选、半选、计数、禁用和暗色未选态；勾选标记使用随库 SVG 资产，半选标记由 CSS 横线绘制。 |
| `radio` | 单选 | form | 24 / 20px，品牌绿圆点选中态。 |
| `switch` | 开关 | form | 44x24px 布尔切换，品牌绿开启态，支持禁用；通过伪元素补偿触控热区。 |
| `form` | 表单容器 | form | 表单字段容器，支持水平/垂直布局、多输入类型、错误和计数。 |

## 组件发布状态

- **已发布组件**：以 `components/index.json` 为准，共 17 个。
- **NavBar 右侧操作区**：作为 `navbar` 内部样式场景维护，使用 `.navbar__action` 与 `.navbar__right--icon` / `.navbar__right--text` / `.navbar__right--button` 组合，不再注册独立组件。
- **触控边界**：`counter` 保持紧凑视觉尺寸；因按钮视觉尺寸小于 32px，通过 `counter__btn::before` 补偿热区，不通过增大布局尺寸满足触控要求。
- **新增组件流程**：先补 `components/{slug}.json`，再补 `preview/component-{slug}.html`，同步 `preview/index.html`，然后更新 `components/index.json`、`uikit-plan.json` 和 `library-consumption.json`。
- **组件迭代入口**：正式迭代组件时，优先使用仓库根目录 `.codex/skills/iterate-component/SKILL.md`，它定义了已注册组件迭代、新增组件发布、同步矩阵和强制守门流程。

## 组件 CSS 生成规则

`components.css` 是聚合组件样式，文件头部声明为自动生成，不应作为首选编辑入口。

- 带有 `/* @component-css-start */` 和 `/* @component-css-end */` 的预览页，是可抽取组件 CSS 的来源。
- `preview/index.html` 是人工验收聚合页，可以通过 `iframe` 组合现有单组件预览页，但不放提取标记，也不参与 `components.css` 聚合。
- 当前已有独立预览页 17 个，均已包含精确提取标记，覆盖率 100%：`avatar`、`badge`、`bottom-nav`、`button`、`card`、`cell`、`checkbox`、`tag`、`counter`、`form`、`image`、`input`、`link`、`navbar`、`radio`、`stack`、`switch`。
- NavBar 右侧操作区样式随 `preview/component-navbar.html` 提取，不作为独立组件消费。
- 如需修改组件样式，优先改对应 `preview/component-*.html` 中的组件样式块和 `components/{slug}.json` 契约，再重新生成 `components.css`。
- 本库内置生成脚本：`scripts/extract-components-css.mjs`。
- 用法：在 `{WEGOUX_ROOT}` 下执行 `node scripts/extract-components-css.mjs .`，自动扫描 `preview/component-*.html` 中 `/* @component-css-start */` / `/* @component-css-end */` 标记内的样式，聚合输出为 `components.css`。
- 改组件时禁止直接手动编辑 `components.css`，必须走"改预览页标记内样式 → 改组件契约 → 运行生成脚本"流程。

## UI Kit

| 路径 | 说明 |
|------|------|
| `ui_kits/app/index.html` | 移动端应用示例，展示完整 App 结构（首页/详情/我的/业务设置），引用 `colors_and_type.css` 和 `components.css`。 |
| `ui_kits/biz-settings/index.html` | 业务设置页面模式示例，展示 bottom-sheet 模式下的 navbar/cell/checkbox/switch 组合使用。 |
| `ui_kits/app/quality-report.json` | `app` UI Kit 质量报告。 |
| `ui_kits/biz-settings/quality-report.json` | `biz-settings` UI Kit 质量报告。 |

UI Kit 是组合示例，不是固定页面模板。生成业务界面时应遵守微购风格，但根据实际信息架构重新组织页面。

### UI Kit 使用边界

- `ui_kits/app/index.html` 是 Showcase，用来观察页面结构和组件组合。
- 不要直接复制 `.uikit-shell`、`.phone-frame`、`.phone-screen` 作为真实业务页面外壳。
- 业务演示里的 `biz-*` 样式还不是注册组件；要复用时应先沉淀为组件契约和预览页。
- 若 UI Kit 中出现 Lucide/CDN 图标，只视为演示占位；生产组件仍优先使用 `iconfont.css`。

## 下游消费契约

`library-consumption.json` 和 `uikit-plan.json` 是给 AI 与下游项目读取的机器化契约。

| 文件 | 作用 |
|------|------|
| `library-consumption.json` | 定义 Token、组件、图标、规范和 UI Kit 的读取顺序、复制规则和边界。 |
| `uikit-plan.json` | 定义移动端应用的核心组件、辅助组件、允许组件、页面蓝图和固定槽位。 |

常见消费方式：

1. **只用 Token**：读取 `colors_and_type.css`，在页面中直接 `<link>` 或 `@import`。
2. **写单个组件**：读取 `components/index.json`、对应组件契约、对应 preview 和 `components.css`。
3. **写完整移动端页面**：用 UI Kit 看结构，用 preview 拿组件 markup，用真实页面尺寸重写外层布局。
4. **写中文文案和数据**：读取 `specs/文案与数据规范.md`。

## 图标和资产

- 预览页和组件中的常规图标优先使用 `wego-iconfont`：`<i class="wego-iconfont-s icon-{name}"></i>`。
- 预览页必须引入 `../iconfont.css`。
- 字体文件位于 `assets/fonts/`。
- `iconfont.css` 当前包含 435 个 `.icon-*` class。
- `assets/icons/` 中的 SVG 用于已沉淀的固定资产；`checkbox` 的对勾必须引用 `checkbox-check.svg`，半选标记由 `.checkbox__minus::before` 绘制居中横线，不要改回 iconfont、内联 SVG 或临时图片。
- 若缺少图标，优先复用语义接近的现有图标；不要为了装饰新增无意义图标。

## 创作规则

1. **优先使用 Token**：颜色、字号、间距、圆角、阴影、动效都引用 CSS 变量。
2. **保持移动端密度**：界面应高效、清晰，不做营销页式的大留白和夸张装饰。
3. **主色克制使用**：品牌绿用于主操作、选中和成功，不要铺满大面积背景。
4. **遵守 4N 节奏**：尺寸和间距尽量取 4 的倍数，列表内边距通常为 16px。
5. **触控可用**：热区 Token 作为参考值；仅当点击目标小于 32px 时才用伪元素补偿，且不改变布局。
6. **状态一致**：hover 多用于 Web，移动端重点关注 active / disabled；点击态通常用透明度或浅灰底表达。
7. **文案自然中文**：短、准、直接；金额、日期、时间、空数据按 `specs/文案与数据规范.md` 处理。
8. **少用阴影**：优先用底色、描边和分组建立层级，只有重叠或可点击强调时再用轻阴影。
9. **不要直接硬改聚合样式**：`components.css` 是聚合输出；改组件时走"改预览页标记内样式 → 改组件契约 → 运行 `node scripts/extract-components-css.mjs .` 重新生成"流程。**严禁手动编辑此文件，重新生成会覆盖所有手动修改。**
10. **不要脱离微信生态质感**：避免高饱和渐变、大面积插画、过度圆角、过强阴影和复杂动效。

## 规范索引

| 规范 | 适用场景 |
|------|----------|
| `specs/设计风格与品牌原则.md` | 品牌气质、色彩定位、整体视觉方向。 |
| `specs/布局与间距规范.md` | 页面边距、分组、列表、卡片、操作热区。 |
| `specs/交互设计原则.md` | 操作位置、状态定义、按钮和内容状态。 |
| `specs/动效与视觉效果.md` | 描边、分割线、圆角、阴影、动效、毛玻璃。 |
| `specs/图标设计规范.md` | 图标命名、画布、描边、尺寸和使用原则。 |
| `specs/文案与数据规范.md` | 标点、日期、时间、金额、数字、省略和中文表达。 |
| `specs/预览页脚手架规范.md` | 预览页脚手架选择器、布局模式、CSS 导入顺序和标记规则。 |

## 超出范围

- 不自动生成新的品牌色阶或主题。
- 不把桌面后台、营销落地页、强视觉活动页当作默认方向。
- 不为了装饰新增复杂插画、渐变背景或大面积阴影。
- 不擅自发布未在 `components/index.json` 注册的组件。
- 不绕过 `iconfont.css` 为组件临时接入第三方图标库。
- 不把 UI Kit 的手机壳、Showcase 外壳或 `biz-*` 演示样式当成通用组件。

## 会话连续性

- 新增组件：`expand-components`，先补组件契约和预览页，再同步注册表、`uikit-plan.json` 和聚合样式。
- 迭代组件：`iterate-component`，先判断是已注册组件迭代还是新增组件发布，再按仓库根目录 `.codex/skills/iterate-component/` 下的标准流程执行。
- 优化 Token：`refine-library`，先改 `colors_and_type.css`，再同步 `css.json` 和受影响组件。
- 生成额外 Kit：`generate-additional-kit`，先确认移动端业务场景，再产出 UI Kit 和 `quality-report.json`。
- 刷新消费契约：`refresh-consumption-contracts`，当组件、图标、规范或 UI Kit 变化时，同步 `library-consumption.json` 和 `uikit-plan.json`。
- 审计 UI Kit：`audit-uikit-quality`，检查组件复用率、演示样式、未注册组件和图标来源。
