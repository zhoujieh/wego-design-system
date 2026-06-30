# 组件迭代工作流

## 1. 先判断任务类型

先把任务归到下面一种或多种：

- 已注册组件迭代
- 新增组件发布
- Token 变更
- UI Kit 同步
- 图标资产变更

如果用户只说“改一下按钮”，先从现有契约和 preview 判断是结构、样式、Token、文案还是展示层调整，不要直接进入编辑。

## 2. 已注册组件迭代标准步骤

1. 读取 `wegoux/SKILL.md`、`wegoux/README.md`、`wegoux/library-consumption.json`、`wegoux/uikit-plan.json`
2. 读取 `wegoux/components/index.json`，确认 slug 已注册
3. 读取 `wegoux/components/{slug}.json` 与 `wegoux/preview/component-{slug}.html`
4. 判断这次变化落在哪些面：
   - 契约结构
   - 样式与状态
   - Token 消费
   - 预览示例文案
   - 是否影响 UI Kit 复用
   - 是否存在 preview 靠 inline style 才成立的组件语义
   - 是否需要先收敛公开类型、挂载方式或宿主边界
   - 是否属于圆角、偏移、滚动、描边这类必须看真实渲染结果的视觉改动
   - 是否涉及特殊资产例外，例如组件选择态必须使用 `assets/icons/*.svg` 而不是 iconfont
   - 是否存在成组示例尺寸混用，例如父子联动、radio group、嵌套 cell 中同一场景内尺寸不一致
   - 如果涉及暗色模式，当前问题是在 preview 展示层，还是已经触及组件本体；是否有同类稳定组件可作为暗色策略参照
5. 修改 `wegoux/components/{slug}.json`
6. 修改 `wegoux/preview/component-{slug}.html`
   - 组件 CSS 只改 `/* @component-css-start */` 与 `/* @component-css-end */` 之间
   - 脚手架样式不要混进组件核心样式区
7. 若样式有变化，在仓库根执行 `node wegoux/scripts/extract-components-css.mjs wegoux`
8. 若影响 `wegoux/README.md`、顶层 `wegoux/SKILL.md`、`wegoux/library-consumption.json`、`wegoux/uikit-plan.json`，一并同步
9. 递增 `wegoux/metadata.json.version`
10. 做最小必要验证并汇报风险

补充：

- 如果改动主要是视觉细节，不要只依赖静态阅读 CSS，至少核对一次 preview 的真实渲染结果
- 如果组件决定对外开放 CSS 变量，自定义变量名、默认值、适用范围要先写进契约，再决定是否在 preview / UI Kit 用 inline style 演示覆盖
- 如果浏览器或插件安全策略阻止本地文件核对，不要绕策略；改用顺序生成、静态扫描、JSON 校验、资源引用检查，并在最终风险中说明未做真实视觉核对
- 如果暗色模式问题已经影响边框、底色、禁用态、选中态等组件本体可见性，优先把修复收回 `.dark` 上下文或正式 Token 映射；preview 专用 `dark-mode` 覆盖只用于展示壳，不应用来长期承担组件语义
- 如果暗色修复里出现多个组件重复的 rgba 值，要把它视为 Token 候选，在最终风险里说明“暂未沉淀到 `colors_and_type.css` / `css.json`”
- 如果重跑提取脚本后 `components.css` 带出目标组件之外的 diff，先定位是哪些 preview 造成的；不要默认这些差异都属于当前任务

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

## 3. 新增组件发布标准步骤

1. 先确认它不是已有组件或嵌入式组件的变体
2. 新增 `wegoux/components/{slug}.json`
3. 新增 `wegoux/preview/component-{slug}.html`
4. 注册到 `wegoux/components/index.json`
5. 在仓库根执行 `node wegoux/scripts/extract-components-css.mjs wegoux` 生成 `wegoux/components.css`
6. 同步 `wegoux/uikit-plan.json`
7. 同步 `wegoux/library-consumption.json`
8. 同步 `wegoux/README.md` 与顶层 `wegoux/SKILL.md` 中的组件数量、清单、状态和边界
9. 递增 `wegoux/metadata.json.version`
10. 验证新增组件是否符合移动端、微信生态、电商/工具场景

## 4. 什么时候同步顶层文档

出现下面任一情况时，要考虑同步 `wegoux/README.md` 和顶层 `wegoux/SKILL.md`：

- 组件数量变化
- 已发布组件清单变化
- 组件边界发生明显变化
- 读取顺序、消费方式、发布规则变化
- 新增了后续迭代必须知道的限制

## 5. 什么时候同步消费契约

同步 `wegoux/library-consumption.json`：

- 新增组件
- 组件读取顺序、复制边界、嵌入关系变化
- 图标消费方式变化

同步 `wegoux/uikit-plan.json`：

- 新增组件进入允许清单
- 组件槽位、优先级、页面蓝图变化
- UI Kit 需要用新组件补位

## 6. 什么时候跑提取脚本

执行 `node wegoux/scripts/extract-components-css.mjs wegoux` 的条件：

- 组件核心 CSS 变了
- 新增了带 preview 的组件
- 调整了 preview 标记区内的 class 或状态规则

不要在只改 JSON 契约、只改说明文案且不影响组件 CSS 时强行重跑。

提取后检查：

- 顺序执行提取脚本后再扫描 `wegoux/components.css`，不要并行读取旧输出
- 如果刚删除某个 class 或场景，必须扫 preview、契约、README/SKILL、`library-consumption.json` 和 `components.css` 是否仍残留旧词
- 对特殊 SVG 资产，额外扫是否还有 iconfont、内联 SVG 或旧脚本常量承担同一语义
- 如果 `components.css` 出现无关组件差异，继续回查对应 `preview/component-*.html` 和工作区 diff，确认是本轮连带修改、既有漂移还是他人脏改动，再决定是否拆任务处理

## 7. 什么时候校验 css.json

执行 `python3 -c "import json; json.load(open('wegoux/css.json'))"` 的条件：

- 改了 `wegoux/colors_and_type.css`
- 改了 `wegoux/css.json`
- 新增或调整了组件依赖的语义 Token，并同步更新了 `wegoux/css.json`

如果这次只是组件 preview 样式调整，且没有触发 Token 层变更，不需要为了形式去改或校验 `wegoux/css.json`。

## 8. 常见拦截

### 用户要求直接修改 `wegoux/components.css`

必须拦截，改为：

1. 找到对应 `wegoux/preview/component-{slug}.html`
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

### 用户改颜色但没提 Token

先判断是局部样式微调，还是公共语义 Token 应调整。
如果已经涉及公共语义层，就必须补读 `wegoux/colors_and_type.css` 和 `wegoux/css.json`，不要停留在组件局部硬编码。

### 用户说“暗色模式看不见”

先判断问题发生在哪一层：

- 如果只是暗色示例容器没挂 `.dark`，修正 preview 容器 class，并做真实浏览器核对
- 如果组件在暗色里边框、底色、禁用态不可见，优先修改组件 `.dark` 规则或正式 Token 消费，再同步契约里的 theme / tokensConsumed / designTokens 说明
- 如果修复过程明显复用了多个相同暗色 rgba，记录为 Token 候选，后续进入 `colors_and_type.css` / `css.json`
