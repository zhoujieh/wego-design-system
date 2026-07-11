# Button 迭代案例

本案例对应最近一轮 button 正式迭代，用来示范组件迭代 skill 的标准动作。它是高质量案例，不是所有 action 组件的默认规则。

## 1. 任务判断

输入示例：

- “迭代 button 契约和样式”

任务归类：

- 已注册组件迭代
- 涉及契约与样式
- 不一定涉及 Token
- 不一定需要同步 UI Kit

## 2. 读取顺序

1. `.codex/skills/wego-design/SKILL.md`
2. `.codex/skills/wego-design/references/library-map.md`
3. `.codex/skills/wego-design/library-consumption.json`
4. `.codex/skills/wego-design/uikit-plan.json`
5. `.codex/skills/wego-design/components/index.json`
6. `.codex/skills/wego-design/components/button.json`
7. `.codex/skills/wego-design/preview/component-button.html`

## 3. 本轮落点

button 这轮真实落点是：

- `.codex/skills/wego-design/components/button.json`
- `.codex/skills/wego-design/preview/component-button.html`
- `.codex/skills/wego-design/components.css`
- `.codex/skills/wego-design/metadata.json`

这说明它属于典型的“组件契约 + preview 样式 + 聚合样式重生成 + 版本递增”流程。

## 4. 标准执行链路

1. 判断 button 是否已注册
2. 先看 `.codex/skills/wego-design/components/button.json`，确认变体维度、结构、行为和使用边界
3. 再看 `.codex/skills/wego-design/preview/component-button.html`，确认样式是否只在标记区修改
4. 更新 button 契约
5. 更新 preview 标记区内的组件样式和示例
6. 执行 `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`
7. 递增 `.codex/skills/wego-design/metadata.json.version`
8. 汇报改动、验证和风险

## 5. button 特有边界

这些规则属于 button 特例或强边界，不能直接推广到所有 action 组件：

- 强调级别：`strong` / `medium` / `weak` / `danger`
- 图标模式：`icon-only` 仅用于新建场景
- 页面级规则：`strong` 同页只允许 1 个，避免多个主按钮并列竞争注意力

## 6. 典型拦截

### 情况 A：用户说“顺手改一下 components.css”

处理方式：

- 拦截
- 改去 `.codex/skills/wego-design/preview/component-button.html` 的标记区
- 重新生成 `.codex/skills/wego-design/components.css`

### 情况 B：用户只改按钮示例文案

处理方式：

- 如果只影响展示，不强制改 `.codex/skills/wego-design/components/button.json`
- 如果文案变化反映了按钮使用边界变化，例如图标模式不再限于新建场景，就必须同步契约

### 情况 C：用户要调按钮颜色

处理方式：

- 先判断是 button 局部态色修正，还是公共品牌/状态 Token 变化
- 如果进入公共 Token 层，必须同步 `.codex/skills/wego-design/colors_and_type.css` 与 `.codex/skills/wego-design/css.json`

## 7. 完成信号

完成后至少应满足：

- 契约和 preview 语义一致
- `.codex/skills/wego-design/components.css` 来自提取脚本，不是手改
- 版本号已递增
- 回复里明确说明改了什么、验证了什么、剩余风险
