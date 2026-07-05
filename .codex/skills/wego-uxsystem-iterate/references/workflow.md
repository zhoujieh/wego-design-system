# 组件迭代工作流

## 1. 先判断任务类型

先把任务归到下面一种或多种：

- 已注册组件迭代
- 新增组件发布
- Token 变更
- 改 UI Kit（已注册 UI Kit 的范式、组合、节奏、收口方式调整）
- 新增 UI Kit 发布
- 图标资产变更

如果用户只说“改一下按钮”，先从现有契约和 preview 判断是结构、样式、Token、文案还是展示层调整，不要直接进入编辑。

## 2. 已注册组件迭代标准步骤

1. 读取 `.codex/skills/wego-design/SKILL.md`、`.codex/skills/wego-design/README.md`、`.codex/skills/wego-design/library-consumption.json`、`.codex/skills/wego-design/uikit-plan.json`
2. 读取 `.codex/skills/wego-design/components/index.json`，确认 slug 已注册
3. 读取 `.codex/skills/wego-design/components/{slug}.json` 与 `.codex/skills/wego-design/preview/component-{slug}.html`
4. 判断这次变化落在哪些面：

   **契约与边界**
   - 契约结构是否需要调整
   - 是否需要先收敛公开类型、挂载方式或宿主边界

   **样式与视觉**
   - 样式与状态是否有变化
   - 是否属于圆角、偏移、滚动、描边这类必须看真实渲染结果的视觉改动
   - 是否存在 preview 靠 inline style 才成立的组件语义

   **Token 与资产**
   - Token 消费是否受影响
   - 是否涉及特殊资产例外，例如组件选择态必须使用 `assets/icons/*.svg` 而不是 iconfont

   **交互与暗色**
   - 如果组件本身带交互，交互说明是否已经直接落在原有变体、宿主结构或成组示例里，而不是额外起一个独立演示模块
   - 如果涉及暗色模式，当前问题是在 preview 展示层，还是已经触及组件本体；是否有同类稳定组件可作为暗色策略参照

   **影响面**
   - 是否影响 UI Kit 复用
   - 预览示例文案是否需要同步
   - 是否存在成组示例尺寸混用，例如父子联动、radio group、嵌套 cell 中同一场景内尺寸不一致
   - 是否存在组件契约 usageHints 中宿主场景嵌入规则与已有尺寸规则自相矛盾（把尺寸修饰类当状态修饰类列举、把 sm 列为不带文字场景的合法修饰类）；兄弟组件若无等价 hint，则该 hint 是独有偏差，应按已有规则修正
   - 是否存在组件使用规则散落在下游技能文档中，属于组件契约的 structurePatterns / usageHints 但没有收回
5. 修改 `.codex/skills/wego-design/components/{slug}.json`
6. 修改 `.codex/skills/wego-design/preview/component-{slug}.html`
   - 组件 CSS 只改 `/* @component-css-start */` 与 `/* @component-css-end */` 之间
   - 脚手架样式不要混进组件核心样式区
7. 若样式有变化，在仓库根执行 `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`
8. 若影响 `.codex/skills/wego-design/README.md`、顶层 `.codex/skills/wego-design/SKILL.md`、`.codex/skills/wego-design/library-consumption.json`、`.codex/skills/wego-design/uikit-plan.json`，一并同步
9. 递增 `.codex/skills/wego-design/metadata.json.version`
10. 做最小必要验证并汇报风险

补充（通用验证约束见第 9 节，以下仅保留组件迭代特有的补充规则）：

- 如果组件决定对外开放 CSS 变量，自定义变量名、默认值、适用范围要先写进契约，再决定是否在 preview / UI Kit 用 inline style 演示覆盖
- 如果暗色模式问题已经影响边框、底色、禁用态、选中态等组件本体可见性，优先把修复收回 `.dark` 上下文或正式 Token 映射；preview 专用 `dark-mode` 覆盖只用于展示壳，不应用来长期承担组件语义
- 如果暗色修复里出现多个组件重复的 rgba 值，要把它视为 Token 候选，在最终风险里说明“暂未沉淀到 `colors_and_type.css` / `css.json`”
- 如果重跑提取脚本后 `components.css` 带出目标组件之外的 diff，先定位是哪些 preview 造成的；不要默认这些差异都属于当前任务
- 如果把错误提示、浮层提示、计数说明改成绝对定位，至少补一条长中文文案做移动端宽度检查；没有这一步时，不要把“单条短文案看起来正常”当成通过
- 如果某个状态仍出现在契约的 `variantDimensions`、`representativeVariants` 或 `stateClasses` 中，就必须确认 preview 里仍有对应 class、伪类或脚本分支能真实触发它；否则应同步删掉契约承诺
- 如果组件需要演示点击、展开、切换、互斥或父子联动，把脚本和可点击区域并回原有示例区；不要新造一个只为交互而存在的独立面板

## 2.1 收敛现有组件能力

遇到下面情况时，优先把任务视为“组件能力收敛”，不要只做表面样式修补：

- preview 里有多处 inline style 在承担组件类型、颜色、形态或定位语义
- 契约里的公开类型比真实可维护范围更散
- 宿主挂载方式、默认定位、嵌套边界没有写清楚
- 用户反馈把某个“独立场景”并回已有场景，例如图片上未选态并入暗色模式
- 特殊资产、状态 class 或示例文案在多处产生了不一致表达
- 暗色模式目前只在 preview 靠临时 class 覆盖成立，组件正式 `.dark` 规则或 Token 消费没有跟上

处理顺序：

1. 先确认最小稳定公开类型
2. 再确认辅助维度，例如 tone、placement、overflow
3. 把 inline style 里的组件语义收回 class 或契约
4. 如果要取消公开能力，反向删除 preview 示例、状态 class、契约字段、README/SKILL 文案和消费说明
5. 最后再补齐 preview 全场景示例

## 2.2 组件规则归属

组件级使用规则（DOM 结构、缩进模式、换行行为、padding 语义等）的权威来源是 `components/{slug}.json`，下游技能文档（如 wego-ux/SKILL.md）不得重复存放。

处理原则：

- 新增或修改组件行为规则时，必须写入 `structurePatterns`（结构用法）或 `usageHints`（约束与禁止项），设计度量值写入 `designTokens`
- 如果发现下游技能文档中存在相同的组件规则，删除下游副本，确保权威来源唯一
- 如果 uikit-plan.json 中重复了组件 DOM 模式描述，精简为引用 `components/{slug}.json`
- 中文命名（如 backspace 区域的实际语义是"缩进"而非"退格"）应在迭代时主动纠正，避免误导 AI 消费端


## 3. 新增组件发布标准步骤

1. 先确认它不是已有组件或嵌入式组件的变体
2. 新增 `.codex/skills/wego-design/components/{slug}.json`
3. 新增 `.codex/skills/wego-design/preview/component-{slug}.html`
4. 注册到 `.codex/skills/wego-design/components/index.json`
5. 在仓库根执行 `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design` 生成 `.codex/skills/wego-design/components.css`
6. 同步 `.codex/skills/wego-design/uikit-plan.json`
7. 同步 `.codex/skills/wego-design/library-consumption.json`
8. 同步 `.codex/skills/wego-design/README.md` 与顶层 `.codex/skills/wego-design/SKILL.md` 中的组件数量、清单、状态和边界
9. 递增 `.codex/skills/wego-design/metadata.json.version`
10. 验证新增组件是否符合移动端、微信生态、电商/工具场景

## 3.1 改 UI Kit 标准步骤

适用于对已注册 UI Kit 的页面范式、组件组合、section 节奏、信息密度、摘要结构或主操作收口方式做调整。先从 `.codex/skills/wego-design/metadata.json` 的 `uiKits` 列表确认全部 UI Kit，再定位本轮目标 `slug`，不要默认只处理 `app`。

1. 读取 `.codex/skills/wego-design/metadata.json`，确认 `uiKits` 全集与本次目标 `slug`
2. 读取目标 `.codex/skills/wego-design/ui_kits/{slug}/index.html` 与对应 `quality-report.json`
3. 读取 `.codex/skills/wego-design/uikit-plan.json`，确认该 UI Kit 对应的 `pagePatterns`、`screenBlueprints`、`productContext.selectedFrameNames`
4. 判断这次变化落在哪些面：
   - **页面范式**：`pagePatterns` 中 `applicableScenarios`、`interactionPattern`、`presentation`、`transition`、`dismissAction` 是否需要同步
   - **组合约束**：`compositionConstraints` 是否仍然成立，是否需要新增/收敛
   - **组件复用**：UI Kit 中暴露的组件使用问题，是否应转走组件迭代流程收回契约，而不是在 UI Kit 里硬补组件样式
   - **演示外壳**：`.uikit-shell`、`.phone-frame`、`.phone-screen`、`biz-*` 是否被误升级为通用组件
5. 修改目标 `ui_kits/{slug}/index.html` 的演示层
6. 修改对应 `quality-report.json`，使报告与页面当前状态一致
7. 按需同步 `.codex/skills/wego-design/uikit-plan.json`、`library-consumption.json`、`README.md`、顶层 `SKILL.md`
8. 递增 `.codex/skills/wego-design/metadata.json.version`
9. 同一变更若影响多个 UI Kit，逐个同步各自的 `index.html` 与 `quality-report.json`
10. 做最小必要验证并汇报风险

补充：

- UI Kit 是 Showcase，不是真实页面模板；改动落点应在演示层
- 若发现组件本体有问题（契约、样式、状态、Token），转走「2. 已注册组件迭代标准步骤」，不在 UI Kit 里硬补组件 CSS
- 不要因为「不复制 Showcase 外壳」就回避其页面模式、section 节奏和摘要结构；这些是该 UI Kit 的核心资产
- 改动若触及页面范式（`presentation`/`transition`/`dismissAction`/`overlayLevel`/`coversTabBar`），必须同步 `uikit-plan.json` 的 `pagePatterns`，避免下游消费端按旧范式输出

## 3.2 新增 UI Kit 发布标准步骤

先确认它不是现有 UI Kit 的变体或页面范式扩展：

- 若只是同一套页面范式换了业务外壳（如另一类规则配置页），优先扩展现有 UI Kit 的示例区，而不是新增
- 若页面范式、组件组合节奏、固定槽位与现有 UI Kit 明显不同，才走新增流程

1. 读取 `.codex/skills/wego-design/metadata.json`、`uikit-plan.json`、`library-consumption.json`、`README.md`、顶层 `SKILL.md`，确认现有 UI Kit 全集与新 `slug` 不冲突
2. 新增 `.codex/skills/wego-design/ui_kits/{slug}/index.html`，复用已注册组件契约，不发明组件类、子元素类或修饰类
3. 新增 `.codex/skills/wego-design/ui_kits/{slug}/quality-report.json`
4. 在 `.codex/skills/wego-design/metadata.json` 的 `uiKits` 数组中追加 `{ slug, entry, qualityReport }`
5. 在 `.codex/skills/wego-design/uikit-plan.json` 中登记：
   - `uiKits` 数组追加新 `slug`
   - `productContext.selectedFrameNames` 追加 `ui_kits/{slug}/index.html`
   - 按需补 `pagePatterns` / `screenBlueprints` / `compositionConstraints`
6. 在 `.codex/skills/wego-design/library-consumption.json` 的 `consumptionLayers.uikit.files` 中登记新 UI Kit 入口与 quality-report；若新 UI Kit 是某下游场景的主蓝本，更新 `downstreamScenarios.buildMobileAppPage.read`
7. 同步 `.codex/skills/wego-design/README.md` 与顶层 `.codex/skills/wego-design/SKILL.md` 中的 UI Kit 清单、定位与根目录结构
8. 在仓库根运行 `node scripts/validate-wego-design.mjs` 做文件完整性守门
9. 递增 `.codex/skills/wego-design/metadata.json.version`
10. 验证新 UI Kit 是否符合移动端、微信生态、电商/工具场景，且保持 `.uikit-shell`、`.phone-frame`、`.phone-screen` 演示外壳

补充：

- 新 UI Kit 的 `slug` 不得与现有组件、现有 UI Kit 冲突
- 新 UI Kit 必须保持 Showcase 定位，不把它当成真实页面模板交付
- 若新 UI Kit 引入了新的页面范式，必须在 `uikit-plan.json` 的 `pagePatterns` 中显式声明 `presentation`/`transition`/`dismissAction`/`overlayLevel`/`coversTabBar`，否则下游消费端会按默认 `push` 输出

## 4. 什么时候同步顶层文档

出现下面任一情况时，要考虑同步 `.codex/skills/wego-design/README.md` 和顶层 `.codex/skills/wego-design/SKILL.md`：

- 组件数量变化
- 已发布组件清单变化
- 组件边界发生明显变化
- 读取顺序、消费方式、发布规则变化
- 新增了后续迭代必须知道的限制

## 5. 什么时候同步消费契约

同步 `.codex/skills/wego-design/library-consumption.json`：

- 新增组件
- 组件读取顺序、复制边界、嵌入关系变化
- 图标消费方式变化

同步 `.codex/skills/wego-design/uikit-plan.json`：

- 新增组件进入允许清单
- 组件槽位、优先级、页面蓝图变化
- UI Kit 需要用新组件补位

## 6. 什么时候跑提取脚本

执行 `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design` 的条件：

- 组件核心 CSS 变了
- 新增了带 preview 的组件
- 调整了 preview 标记区内的 class 或状态规则

不要在只改 JSON 契约、只改说明文案且不影响组件 CSS 时强行重跑。

提取后检查：

- 顺序执行提取脚本后再扫描 `.codex/skills/wego-design/components.css`，不要并行读取旧输出
- 如果刚删除某个 class 或场景，必须扫 preview、契约、README/SKILL、`library-consumption.json` 和 `components.css` 是否仍残留旧词
- 对特殊 SVG 资产，额外扫是否还有 iconfont、内联 SVG 或旧脚本常量承担同一语义
- 如果 `components.css` 出现无关组件差异，继续回查对应 `preview/component-*.html` 和工作区 diff，确认是本轮连带修改、既有漂移还是他人脏改动，再决定是否拆任务处理

## 7. 什么时候校验 css.json

执行 `node -e "JSON.parse(require('fs').readFileSync('.codex/skills/wego-design/css.json','utf8'))"` 的条件：

- 改了 `.codex/skills/wego-design/colors_and_type.css`
- 改了 `.codex/skills/wego-design/css.json`
- 新增或调整了组件依赖的语义 Token，并同步更新了 `.codex/skills/wego-design/css.json`

如果这次只是组件 preview 样式调整，且没有触发 Token 层变更，不需要为了形式去改或校验 `.codex/skills/wego-design/css.json`。

## 8. 常见拦截

### 用户要求直接修改 `.codex/skills/wego-design/components.css`

必须拦截，改为：

1. 找到对应 `.codex/skills/wego-design/preview/component-{slug}.html`
2. 修改标记区内的组件样式
3. 执行提取脚本重新生成

### 用户只改 preview 展示文案

先判断是否只是示例文案变化：

- 如果不影响结构、状态、变体、Token 消费，可只改 preview 展示内容
- 如果文案变化暴露了契约边界变化，需要同步组件契约

### preview 里出现 inline style 组件语义

先判断这些 inline style 属于哪一类：

- 只是 demo 容器布局：可保留在标记区外
- 属于组件颜色、形态、定位、滚动或状态：必须收回正式 class，并同步契约
- 如果 inline style 只是消费组件已经公开的 CSS 变量，可保留为演示用法，但要确认契约已记录这些变量

### 特殊 SVG 资产例外

当组件明确要求使用随库 SVG（例如 checkbox 对勾/半选）：

- 先读 `assets/icons/` 中的对应文件，确认路径和尺寸
- preview、UI Kit、嵌套调用方都引用同一资产，不使用 iconfont 或内联 SVG 代替
- 契约里补 `assetUsage` 或等价说明
- 如影响下游复制规则，同步 `library-consumption.json`、README 和顶层 SKILL 的图标规则

### 设计反馈取消独立场景

当用户说明“这个场景其实就是另一个场景，不用单独说明”：

- 删除独立标题和示例 markup
- 删除对应 class、variant/state、usageHints、doNotInvent 中的边界描述
- 重新生成 `components.css`
- 顺序扫描旧 class/旧文案，确认聚合样式没有残留

### 带交互组件新增独立交互模块

当某个组件的 preview 想单独起一个“交互演示”区时：

1. 先判断这些交互是否本来就属于已有场景，比如默认态、宿主挂载、展开收起、带文字、成组、父子联动、互斥选择
2. 能并回原场景就直接并回，不新增单独标题、面板或专用容器
3. 脚本只绑定原组件示例所需的最小节点，不额外发明演示专用结构
4. 同步检查契约文案，确认交互规则描述跟新的示例落点一致

### 用户改颜色但没提 Token

先判断是局部样式微调，还是公共语义 Token 应调整。
如果已经涉及公共语义层，就必须补读 `.codex/skills/wego-design/colors_and_type.css` 和 `.codex/skills/wego-design/css.json`，不要停留在组件局部硬编码。

### 下游技能文档出现组件规则

当 wego-ux/SKILL.md 等下游技能文档中出现组件级使用规则时：

1. 该规则属于组件契约的 structurePatterns / usageHints，先在 `components/{slug}.json` 中补齐
2. 删除下游技能文档中的重复内容
3. 如果 uikit-plan.json 中有相同的 DOM 模式描述，精简为引用组件契约

### 用户说“暗色模式看不见”

先判断问题发生在哪一层：

- 如果只是暗色示例容器没挂 `.dark`，修正 preview 容器 class，并补静态检查、脚本校验与风险说明
- 如果组件在暗色里边框、底色、禁用态不可见，优先修改组件 `.dark` 规则或正式 Token 消费，再同步契约里的 theme / tokensConsumed / designTokens 说明
- 如果修复过程明显复用了多个相同暗色 rgba，记录为 Token 候选，后续进入 `colors_and_type.css` / `css.json`

### 用户要求把 UI Kit 外壳升级为通用组件

当用户要求把 `.uikit-shell`、`.phone-frame`、`.phone-screen`、`biz-*` 等 Showcase 演示样式升级成通用组件时：

1. 拦截，明确这些是 Showcase 外壳或业务样式，不是通用组件
2. 如果背后确有通用诉求，先判断是否属于已注册组件的变体或宿主结构扩展
3. 若属于新组件，走「3. 新增组件发布标准步骤」，按组件契约流程注册
4. 若只是页面级布局，留在业务页面作用域内（如 `.profile-page__xxx`），不要注册成通用组件

### 用户要求直接改 UI Kit 里的组件样式

当用户要求在 `ui_kits/{slug}/index.html` 里直接改某个组件的 CSS 时：

1. 拦截，UI Kit 是 Showcase，不在演示层硬补组件样式
2. 转走「2. 已注册组件迭代标准步骤」，在 `preview/component-{slug}.html` 标记区改组件核心样式
3. 重跑提取脚本后，再回到 UI Kit 验证示例是否仍成立，必要时同步 `quality-report.json`

## 9. 验证约束

默认不执行任何浏览器自动化验证，除非用户当次明确要求打开浏览器做额外核对。

正式迭代的默认验证范围是：

1. 静态扫描
2. 脚本校验
3. 资源与结构检查
4. 风险说明

如果用户没有明确提出浏览器验证，就不要主动拉起 Safari、Chrome 或其他外部浏览器，也不要把“未做浏览器验证”记成流程缺失或组件问题。
