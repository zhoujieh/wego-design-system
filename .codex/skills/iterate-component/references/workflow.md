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

## 2.1 收敛现有组件能力

遇到下面情况时，优先把任务视为“组件能力收敛”，不要只做表面样式修补：

- preview 里有多处 inline style 在承担组件类型、颜色、形态或定位语义
- 契约里的公开类型比真实可维护范围更散
- 宿主挂载方式、默认定位、嵌套边界没有写清楚

处理顺序：

1. 先确认最小稳定公开类型
2. 再确认辅助维度，例如 tone、placement、overflow
3. 把 inline style 里的组件语义收回 class 或契约
4. 最后再补齐 preview 全场景示例

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

### 用户改颜色但没提 Token

先判断是局部样式微调，还是公共语义 Token 应调整。
如果已经涉及公共语义层，就必须补读 `wegoux/colors_and_type.css` 和 `wegoux/css.json`，不要停留在组件局部硬编码。
