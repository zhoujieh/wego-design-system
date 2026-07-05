# UsageHint 把尺寸修饰类误列为宿主场景合法状态修饰类 — 案例

本案例对应一次跨工作流环节的链式错误复盘，用来示范"组件契约 usageHint 把尺寸修饰类与状态修饰类混列为宿主场景合法修饰类"这一类问题的发现、定位与防复发动作。它是高质量案例，不是所有组件的默认规则。

## 1. 任务背景

输入信号：

- 价格权限设置页的权限类型选择 cell，实际生成 `radio radio--sm`（20px）
- 用户预期（与设计系统原始意图一致）应为 `radio` 默认尺寸（24px）
- 同场景的粉丝分组多选 `checkbox` 正确使用了 24px 默认尺寸
- 已"修复"2 轮仍未根治

任务归类：

- 工作流迭代（经验沉淀 + 组件契约本体修正 + 任务级产物同步）
- 工作流环节归属：`wego-design`（主，契约本体 usageHint 修正） + `wego-design` 消费环节（次，design_consumption_plan implementation_constraints 同步）
- 场景类型：`component-consumption-decision`（已注册）— 子问题"组件契约 usageHint 把尺寸修饰类误列为宿主场景合法状态修饰类"

## 2. 读取顺序

1. `.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md`
2. `.codex/skills/wego-design/components/radio.json`
3. `.codex/skills/wego-design/components/checkbox.json`
4. `.codex/skills/wego-design/components/cell.json`
5. `.codex/skills/wego-design/preview/component-cell.html`
6. `wego-app/scenes/{业务场景}/_spec/design_consumption_plan.json`
7. `wego-app/scenes/{业务场景}/scene.js`

## 3. 根因分析（四段式）

### 3.1 工作流环节归属

主：`wego-design`（契约本体 `usageHints` 修正）
次：`wego-design` 消费环节（`design_consumption_plan.json` 的 `selected` 与 `implementation_constraints` 同步）

### 3.2 场景类型识别

`component-consumption-decision`（已注册，无需新增类型）— 子问题："组件契约 usageHint 把尺寸修饰类误列为宿主场景合法状态修饰类"。

### 3.3 判断条件定义（结构特征，不依赖具体组件名）

当组件契约的 `usageHints` 中出现下面任一结构时，判定为本次同类问题：

- 表述形式 A："X 嵌入宿主组件 Y 时只使用 .X 及其状态修饰类（.X--尺寸类/.X--状态类）"，即在同一句话里把来自 `variantDimensions.size` 的尺寸修饰类与来自 `variantDimensions.state` 的状态修饰类并列为宿主场景合法修饰类
- 表述形式 B：宿主场景明确不带文字（由宿主组件的 title/subtitle 节点承载文案），但 hint 仍把"带文字场景才用"的尺寸修饰类列为合法修饰类

**关键判定**：检查该组件契约的 `structurePatterns` 与 `usageHints` 是否已有"带文字/带 label 场景才用 sm 尺寸"的规则；若已有，而新写的"嵌入宿主"hint 又把 sm 列为合法类，且宿主场景明确不带文字，则该 hint 与已有规则自相矛盾，必须按已有规则修正。

**对照验证（兄弟组件对照法）**：检查同类兄弟组件（如 radio vs checkbox）的 `usageHints` 是否有等价的"嵌入宿主"hint；如果没有，则说明该 hint 是独有偏差，应当对齐而非新增。

**组件名独立性验证**：把规则里的"radio"替换成"组件A"、"cell"替换成"宿主B"后，逻辑仍成立 — 验证通过。

### 3.4 决策动作落地

- 回流到 `.codex/skills/wego-design/components/{slug}.json` 的 `usageHints`：宿主场景嵌入规则必须与同文件 `structurePatterns`/`usageHints` 已有的尺寸规则保持一致；若已有"带文字/带 label 场景才用 sm"规则，宿主场景嵌入 hint 必须显式声明"宿主场景不带文字 → 用 default 尺寸"，不能把 sm 列为合法修饰类
- 回流到 `.codex/skills/wego-uxsystem-iterate/references/workflow.md` 的组件契约审查 checklist：补充一条"检查组件契约 usageHints 中宿主场景嵌入规则是否与已有尺寸规则自相矛盾"
- **禁止**：把规则回流到 `AGENTS.md`（违反 `workflow-iteration.md` 第 6 节"不允许把工作流迭代规则写到 AGENTS.md"）

## 4. 标准执行链路

1. 定位源头契约：`components/{slug}.json` 中导致歧义的 `usageHints` 行
2. 检查同文件已有的尺寸规则（`structurePatterns` + `usageHints`），确认"带文字才用 sm"规则已存在
3. 检查兄弟组件契约是否有等价 hint，确认是否独有偏差
4. 修正 `usageHints`：移除尺寸类的并列，显式声明宿主场景不带文字 → 用 default 尺寸
5. 同步下游任务级产物：
   - `wego-app/scenes/{业务场景}/_spec/design_consumption_plan.json` 的 `selected` 字段
   - `wego-app/scenes/{业务场景}/_spec/design_consumption_plan.json` 的 `implementation_constraints`
   - `wego-app/scenes/{业务场景}/scene.js` 的实际 DOM 生成代码
6. 递增 `.codex/skills/wego-design/metadata.json.version`
7. 跑守门脚本 `node scripts/validate-wego-design.mjs`
8. 汇报改动、验证和风险

## 5. 为什么只在末端修补无法根治

这是一个跨 4 个工作流环节的链式错误：

| 轮次 | 推测修复位置 | 为什么没根治 |
|---|---|---|
| 第 1 轮 | 只改 `scene.js`（wego-ux） | 没改 `design_consumption_plan.json` 和 `radio.json`，下次重新生成场景时回到 radio--sm |
| 第 2 轮 | 改 `scene.js` + `design_consumption_plan.json` | 没改 `radio.json` 契约本体 usageHint（直接原因），新场景消费时 AI 读到的 hint 仍然把 `.radio--sm` 当 cell 内嵌合法修饰类，导致 design_consumption_plan 重新生成时又回到 radio--sm |

**关键认知**：只在末端（wego-ux）修补无法根治。必须从源头（组件契约 usageHint）同步往下修，并沉淀经验防止下次重蹈覆辙。

## 6. 对照反证

同场景的 `checkbox` 多选因为 `checkbox.json` 没有把 `.checkbox--sm` 列为 cell 嵌入合法修饰类的 usageHint，所以消费决策和 scene.js 都正确使用 24px。

这说明：**只要源头契约正确，下游环节会自动跟随正确；反之源头有歧义，下游必出错**。

兄弟组件对照法是定位"独有偏差"的关键手段。

## 7. 典型拦截

### 情况 A：用户说"直接改 scene.js 把 radio--sm 去掉就行"

处理方式：

- 拦截
- 改去 `components/{slug}.json` 的 `usageHints`，移除尺寸类的并列
- 同步 `design_consumption_plan.json` 的 `selected` 和 `implementation_constraints`
- 最后才改 `scene.js`

### 情况 B：用户说"在 radio.json 里把 .radio--sm 从 stateClasses 数组移除就行"

处理方式：

- 先判断 `stateClasses` 数组是否是本次错误的直接原因
- 对照兄弟组件：如果兄弟组件也有同样的结构问题但行为正确，说明此项不是直接原因，只是放大因素
- 可作为预防性清理，但不是必须；优先修正导致歧义的 `usageHints`

### 情况 C：用户说"加一条经验沉淀到 AGENTS.md"

处理方式：

- 拦截
- `workflow-iteration.md` 第 6 节明确"不允许把工作流迭代规则写到 AGENTS.md"
- 经验沉淀应回流到对应技能的 `references/` 或权威数据文件

## 8. 完成信号

完成后至少应满足：

- 源头契约 `usageHints` 不再把尺寸类列为宿主场景合法状态修饰类
- 同场景的兄弟组件行为一致（如 radio 和 checkbox 都用 24px）
- `design_consumption_plan.json` 的 `selected` 和 `implementation_constraints` 与契约对齐
- `scene.js` 实际生成的 DOM 与 `design_consumption_plan.json` 一致
- `metadata.json.version` 已递增
- 守门脚本通过
- 经验沉淀 case 文件已创建，checklist 已补充
- 回复里明确说明改了什么、验证了什么、剩余风险
