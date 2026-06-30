---
name: "iterate-component"
description: "用于迭代 wegoux 已注册组件或发布新组件。适用于调整组件契约、预览页标记区样式、组件同步关系、components.css 生成链路与正式迭代守门。"
---

# 组件迭代 Skill

用于 `wegoux` 组件的正式迭代。目标是把组件修改流程收敛成稳定、可复用、可审计的标准动作，而不是临时改一个文件就结束。

## 触发场景

- 迭代已注册组件，例如“迭代 button 契约和样式”“调整 cell 组件边界”
- 发布新组件，例如“新增 coupon-card 组件并注册”
- 同步组件契约与预览页，例如“把 input 的结构和 preview 对齐”
- 拦截错误入口，例如“顺手改一下 components.css”

## 固定读取顺序

每次开始前按这个顺序读取：

1. `wegoux/SKILL.md`
2. `wegoux/README.md`
3. `wegoux/library-consumption.json`
4. `wegoux/uikit-plan.json`
5. `wegoux/components/index.json`
6. `wegoux/components/{slug}.json`
7. `wegoux/preview/component-{slug}.html`

按任务继续补读：

- 涉及 Token：读 `wegoux/colors_and_type.css` 和 `wegoux/css.json`
- 涉及 UI Kit：读 `wegoux/ui_kits/app/index.html` 和对应 `quality-report.json`
- 涉及图标：读 `wegoux/iconfont.css`、`wegoux/assets/fonts/`、`wegoux/assets/icons/`
- 涉及规范或文案：读 `wegoux/specs/` 对应文件

## 本轮经验守门

- 设计稿里的“特殊资产例外”要显式落契约：例如 checkbox 对勾没有 iconfont 时，契约、preview、UI Kit 和消费说明都要写清楚使用随库 SVG，不要被常规 iconfont 规则误伤。
- 用户后续反馈取消某个场景时，要反向收敛：删除 preview 示例、状态 class、组件契约、README/SKILL 文案和 `components.css` 生成残留，不要只改可见文案。
- 预览页布局优化如果只服务展示，应放在标记区外；组件核心 CSS 仍只放在 `/* @component-css-start */` 与 `/* @component-css-end */` 之间。
- 父子联动、成组选择、嵌套调用等示例要检查“同一场景内尺寸一致”，不要让父级/子级混用尺寸造成契约歧义。
- 视觉微调完成后先顺序执行提取脚本，再扫 `components.css`。不要并行跑“提取”和“扫描”，否则可能读到旧聚合内容。
- 真实浏览器核对不要默认直接打开 `file://` 预览页。应用内浏览器 / WebView 可能拦截本地文件继续加载同目录 CSS、字体、脚本；优先在 `wegoux/` 根目录启动静态服务，再用 `http://127.0.0.1:<port>/preview/component-{slug}.html` 或 `http://127.0.0.1:<port>/ui_kits/...` 访问。
- 如果真实浏览器核对被工具安全策略阻塞，要如实记录阻塞原因，并用静态扫描、JSON 校验、生成脚本、资源引用检查做降级验证；不要绕策略换通道强行访问。
- 暗色模式示例如果组件核心 CSS 使用 `.dark` 上下文，preview 的暗色容器也必须挂载 `.dark`，不要只靠 `.dark-mode` 展示覆盖；否则预览看到的暗色效果不是下游真实消费效果。
- 暗色模式如果已经影响组件本体的边框、底色、禁用态或选中态，可见性修复要优先收回组件级 `.dark` 规则或正式 Token 映射，不要长期停留在 preview 专用覆盖；否则会出现“展示正常、下游消费失真”。
- 做暗色迭代时，先对照同类稳定组件的暗色策略再落实现，例如 radio / checkbox 应先看 switch 这类已稳定暗色处理，优先复用同一套 inverse border / surface 思路，而不是每个组件各写一套临时 rgba。
- 如果同一类暗色值开始在多个组件重复出现，例如暗色禁用边框、暗色禁用底色，应该把它标记成下一步 Token 候选，并在风险中明确记录，不要让组件内硬编码长期扩散。
- 预览页网格卡片在窄屏要显式检查横向溢出；优先用 `width:100%`、`box-sizing:border-box`、`min-width:0` 和 `minmax(min(100%, Npx), 1fr)` 这类约束，避免长文案或固定列宽撑出暗色容器。
- 重跑提取脚本后如果 `components.css` 出现和本轮目标无关的组件差异，不要顺手吞掉；先回查对应 preview 或工作区历史，确认它是本轮连带修改、旧脏改动，还是脚本暴露出的既有漂移，再决定是拆出去单独处理还是一并收敛。
- 带交互脚本的 preview 不能只核对静态 class 名；要把契约中的边界条件逐条对照到脚本判断，例如 `max` 是否允许取等、输入是否真的只收数字、非法值是否会落成 `NaN`。契约、示例初始值和脚本分支三者只要有一个不一致，下游就会学到错误行为。
- 契约里如果某个节点依赖“基础 class + 状态 class”组合才能定位或排版，例如 `.counter__message.counter__hint`，`domAnatomy.requiredChildren` 必须写完整组合，不要只写状态 class；否则下游按契约复制会丢掉关键基础样式。

## 任务分流

优先判断当前任务属于哪一类：

- 已注册组件迭代
- 新增组件发布
- 涉及 Token
- 涉及 UI Kit
- 涉及图标

详细步骤读 `references/workflow.md`，变更同步面读 `references/sync-matrix.md`。

## 预检清单

进入编辑前，先检查：

- preview 里是否有 inline style 承担了组件语义；有的话优先判断为契约漂移
- 当前变体是否过散，是否应该先收敛成少数稳定公开类型
- 是否涉及默认挂载方式、宿主关系、嵌套方式等组件边界变化
- 是否会连带影响 UI Kit、README、顶层设计库 SKILL 或消费契约
- 如果是视觉细节迭代，是否需要打开 preview 做一次真实浏览器核对，而不是只看 CSS
- 如果要做真实浏览器核对，是否已经优先准备本地静态服务入口，而不是继续使用 `file://`
- 如果涉及暗色模式，是否已经检查过组件真实使用的是 `.dark` 还是 preview 专用 class，是否对照过同类稳定组件的暗色做法
- 如果本轮需要重跑提取脚本，是否先留意工作区里是否已有其他 preview / `components.css` 相关脏改动，避免把无关生成差异混进本次迭代

## 强制守门

- 禁止直接手改 `wegoux/components.css`
- 组件样式优先改 `wegoux/preview/component-{slug}.html` 中 `/* @component-css-start */` 与 `/* @component-css-end */` 之间的样式
- 组件契约与 preview 结构、状态、变体、Token 消费必须同步
- 如果 preview 里出现“靠 inline style 才成立的类型或形态”，必须优先收回正式 class 或契约
- 如果组件正式暴露了 CSS 自定义属性，允许在 preview / UI Kit 用 inline style 演示变量覆盖，但必须先把变量写进组件契约
- 如果暗色模式变更已经触及组件本体可见性，优先修改组件 `.dark` 规则或 Token 消费，不要只补 preview 专用暗色覆盖
- 提取脚本跑完后如果带出无关组件差异，必须先定位来源，再决定是否继续提交，不能默认把所有生成结果都视为本轮改动
- 涉及 Token 时，必须同步 `wegoux/css.json`
- 修改 `wegoux/css.json` 后，必须执行 `python3 -c "import json; json.load(open('wegoux/css.json'))"`
- 组件样式有变动时，必须在仓库根执行 `node wegoux/scripts/extract-components-css.mjs wegoux`
- 正式迭代必须递增 `wegoux/metadata.json` 的 `version`

## 输入约定

收到任务后，先在心里补齐这几个输入：

- 组件 slug
- 变更类型
- 是否涉及 Token
- 是否为新增组件
- 是否需要同步 UI Kit

缺少时先从仓库里推断；实在推断不了，再向用户确认。

## 输出约定

每轮回复都用这 3 句，尽量短一点，说人话：

- 改了什么：直接说这轮动了哪些文件、修了什么问题。
- 验证了什么：直接说跑了什么脚本、看了什么结果、有没有确认生效。
- 剩余风险：只说现在还没覆盖到的真实问题；如果没有，就写“无明显剩余风险”。

不要写很长的过程复盘，也不要把已经做过的每一步都展开。

如果信息不够：

- 先一句话说清楚缺什么。
- 再一句话说清楚你基于什么假设继续。

推荐写法：

- 改了什么：修了 counter 的上限判断和输入清洗，同步了组件契约。
- 验证了什么：重跑了提取脚本，JSON 校验通过，边界值检查正常。
- 剩余风险：无明显剩余风险。

## 特别提醒

- `wegoux/components/index.json` 是已发布组件权威来源
- `button` 案例参考读 `references/button-example.md`
- 若用户要求直接改 `wegoux/components.css`，应明确拦截并改走 preview 标记区 + 提取脚本流程
- 遇到默认角标挂载与行内模式这类定位规则时，要明确它们是两套行为，不要混用
- 遇到圆角、切角、滚动、偏移这类强视觉反馈改动时，优先做一次浏览器核对，再结束本轮
- 需要浏览器核对时，可先在 `wegoux/` 根目录执行 `python3 -m http.server 4173`，再访问 `http://127.0.0.1:4173/preview/component-{slug}.html`；不要把应用内浏览器对 `file://` 的安全拦截误判成组件样式失效
- 遇到设计反馈把“独立场景”并回已有场景时，要把公开状态、class、文档和消费契约一并收回
