# 价格权限设置页 cell-select 单选模式 radio 尺寸问题 — 工作流环节审查与修复

## 一、问题陈述

场景: `wego-app/scenes/价格权限管理/`
现象: 权限类型选择(公开/私密/部分可见/不给谁看)的 cell 行内嵌 radio 实际渲染为 `radio radio--sm`(20px),用户预期(与设计系统原始意图)应为 `radio` 默认尺寸(24px)。
**对照证据(关键)**: 同一场景的"粉丝分组多选"(`fanGroupChildRowMarkup`)的 checkbox 正确使用了 24px 默认尺寸(`'checkbox'`+状态),不带 `.checkbox--sm`。说明问题不是通用"cell 内嵌"规则错误,而是 radio 契约独有的决策偏差。
历史: 已"修复"2 轮仍未根治。

## 二、工作流环节审查结论

### 错误决策的源头:wego-design 环节(设计系统契约本体)

问题不是 wego-ux 写错了代码,而是**wego-design 环节输出的契约和消费决策本身就指向 `radio--sm`**,wego-ux 只是忠实执行。

#### 根因 1(直接原因): `radio.json` 第 119 行 usageHint 与同文件已有的"带文字才用 sm"规则自相矛盾

[radio.json:119](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/radio.json#L119):

> "radio 嵌入 cell 时只使用 .radio 及其状态修饰类(.radio--sm/.radio--checked/.radio--disabled),不额外引入 .radio-field 或 .radio-field-group。"

**自相矛盾点**: 同一文件已经明确写清楚"带文字才用 sm":

- [radio.json:98](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/radio.json#L98) structurePatterns: "带文字场景使用 .radio-field 包裹 radio 与 .radio-field__text,**默认采用 20px 小尺寸控件**"
- [radio.json:114](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/radio.json#L114) usageHints: "带文字时优先使用 20px 小尺寸控件"
- [radio.json:117](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/radio.json#L117) usageHints: "独立使用 radio 时,通过 .radio-field > .radio + .radio-field__text 承载文案,**控件使用 radio--sm(20px)**"

而第 118 行明确说 cell 嵌入场景"文案和说明由 cell 的 .cell__title/.cell__subtitle 承载" — 即 cell 嵌入时 radio 本身**不带文字**。按第 98/114/117 行规则,不带文字 = 用默认 24px = 不应带 `.radio--sm`。

但第 119 行却把 `.radio--sm` 列为 cell 嵌入合法状态修饰类,直接违反同文件已有规则。

**对照 `checkbox.json`**: checkbox 契约 [checkbox.json:114](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/checkbox.json#L114) 同样写"带文字场景...默认采用 20px 小尺寸控件",但 checkbox 契约**没有**"checkbox 嵌入 cell 时只使用 .checkbox 及状态修饰类(.checkbox--sm/...)"这种把 sm 列为 cell 嵌入合法类的 hint。所以消费 checkbox 时 AI 不会误带 `.checkbox--sm`,行为正确。

这是 radio 与 checkbox 行为差异的**真正分水岭**,也是本次错误的直接原因。

**核心规则**(用户已明确,与契约一致): **radio 和 checkbox 在 cell 内有两种使用场景,尺寸选择与是否带文字绑定**:

| 场景 | 宿主位置 | 是否带文字 | 尺寸 | 触发条件 |
|---|---|---|---|---|
| 左侧选择器(单选竖排) | `.cell__select` 内嵌 | 不带文字(文案由 cell__title/cell__subtitle 承载) | **default 24px** | 选项≥3 或单条文案>4字(命中 compositionConstraints[0]) |
| 右侧成组选择 | `.cell__action` 或 `form-body` 内的 `.radio-field-group`/`.checkbox-field-group` | **带文字**(`.radio-field__text`/`.checkbox-field__text`) | **sm 20px** | 2 选项短文案(单条≤4字,命中 compositionConstraints[0].allowWhen) |

即: **带文字才用 sm,不带文字(左侧选择器)用 default 24px**。本场景(权限类型 4 选项单选)命中第一行规则,应为 24px。

#### 根因 2(放大因素,非直接原因): `radio.json` 第 188 行 `domAnatomy.stateClasses` 把尺寸类混入

[radio.json:184-188](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/radio.json#L184-L188):

```json
"stateClasses": [
  ".radio--checked",
  ".radio--disabled",
  ".radio--sm"        ← 尺寸修饰类被归入 stateClasses
]
```

**注意**: checkbox 契约 [checkbox.json:213-219](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/checkbox.json#L213-L219) **同样**把 `.checkbox--sm` 放进了 stateClasses 数组 — 这是 radio 和 checkbox 共同的结构问题,但 checkbox 没有触发错误,说明此因素不是直接原因,只是放大了根因 1 的影响。修复时可作为结构性清理一并修正,但不是必须。

#### 根因 3: `preview/component-cell.html` 与契约存在隐式冲突(但 preview 不是契约)

preview 第 478-496 行所有 cell-select radio 用例都用裸 `.radio`(24px),不带 `.radio--sm`。但 preview 是示例不是契约,AI 在消费时优先读 `radio.json` 契约,被第 119 行误导。

### 错误决策的执行:wego-design 消费环节(design_consumption_plan)

[design_consumption_plan.json:124](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/_spec/design_consumption_plan.json#L124) 第 124 行 `surface_designs[2].component_mapping[1].selected`:

```
.cell__select > .radio.radio--sm[+.radio--checked + .radio__inner + .radio__dot[选中时]]
```

**这是工作流中"错误决策"被固化的关键节点**。wego-design 环节基于根因 1 的歧义 usageHint,主动在消费决策里写入了 `.radio.radio--sm`。

**对照证据**: 同文件 [第 139 行](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/_spec/design_consumption_plan.json#L139) "部分可见"粉丝分组多选的 `.selected` 写的是 `.cell__select > .checkbox[+.checkbox--checked...]`(无 `.checkbox--sm`),[第 154 行](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/_spec/design_consumption_plan.json#L154) "不给谁看"的多选也是 `.checkbox[+.checkbox--checked...]`。这印证了消费决策环节对 radio 和 checkbox 采取了不一致的写法,根源是 radio.json 第 119 行独有 usageHint 的误导。

同文件 [第 190 行](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/_spec/design_consumption_plan.json#L190) `implementation_constraints[3]`:

> "radio 嵌入 cell 时只使用 .radio 及状态修饰类(.radio--sm/.radio--checked),不套 .radio-field 或 .radio-field-group;选项文案由 .cell__title 承载"

**对照 [第 191 行](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/_spec/design_consumption_plan.json#L191)** checkbox 的对应 constraint:

> "checkbox 嵌入 cell 时只使用 .checkbox 及状态修饰类(.checkbox--checked),不套 .checkbox-field;勾选标记必须引用 assets/icons/checkbox-check.svg..."

radio 写了 `.radio--sm/.radio--checked`(尺寸+状态混列),checkbox 只写了 `.checkbox--checked`(只状态类)。这一对照是消费决策环节**直接放大**了 radio.json 第 119 行错误的铁证。

### 错误决策的执行:wego-ux 环节(原型生成)

[scene.js:117](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/scene.js#L117) 第 117 行:

```js
var radioClass = 'radio radio--sm' + (checked ? ' radio--checked' : '');
```

**wego-ux 没有决策错误**,只是严格按 `design_consumption_plan.json` 第 124 行的 `.selected` 字段生成 DOM。这一环节不是问题源头,改这里治标不治本。

### 错误决策的失守:wego-tests 环节(验收)

[wego-design/library-consumption.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/library-consumption.json) 的 `scenarioTypeRegistry` 中 `component-consumption-decision` 类型的 `verificationStandard` 是"把规则里的具体组件名替换成'组件A/组件B'后逻辑是否成立"。

但实际验收时 wego-tests 只能对照 `design_consumption_plan.json` 的 `implementation_constraints[3]` 第 190 行,而该 constraints **本身就写错了**(把 radio--sm 当成 cell 内嵌的合法修饰类)。验收规则源头被污染,自然无法发现问题。

### 经验沉淀缺失:wego-uxsystem-iterate 环节

[wego-uxsystem-iterate/references/](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-uxsystem-iterate/references/) 下没有任何关于此问题的经验沉淀。前两轮"修复"未沉淀规则,所以问题反复出现。

## 三、为什么前两轮修复没解决(根因链)

| 轮次 | 推测修复位置 | 为什么没根治 |
|---|---|---|
| 第 1 轮 | 大概率只改 `scene.js`(wego-ux) | 没改 `design_consumption_plan.json` 和 `radio.json`,下次重新生成场景时回到 radio--sm |
| 第 2 轮 | 可能改了 `scene.js` + `design_consumption_plan.json` | 没改 `radio.json` 第 119 行契约本体 usageHint(直接原因),新场景消费时 AI 读到的 hint 仍然把 `.radio--sm` 当 cell 内嵌合法修饰类,导致 design_consumption_plan 重新生成时又回到 radio--sm |

**关键认知**: 这是一个跨 4 个工作流环节的链式错误,只在末端(wego-ux)修补无法根治。必须从源头(radio.json 第 119 行 usageHint)同步往下修。

**对照反证**: 同场景的 checkbox 多选(`fanGroupChildRowMarkup`)因为 `checkbox.json` 没有把 `.checkbox--sm` 列为 cell 嵌入合法修饰类的 usageHint,所以消费决策和 scene.js 都正确使用 24px。这说明只要源头契约正确,下游环节会自动跟随正确;反之源头有歧义,下游必出错。

## 四、修复方案(走 wego-uxsystem-iterate 流程,四层同步)

### 修复 1: 设计系统契约本体(wego-design) — 源头(核心)

**文件**: [radio.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/radio.json)

**改动 A(必做,直接原因)** — 第 119 行 usageHints 改写:

原:
> "radio 嵌入 cell 时只使用 .radio 及其状态修饰类(.radio--sm/.radio--checked/.radio--disabled),不额外引入 .radio-field 或 .radio-field-group。"

改为:
> "radio 嵌入 cell 左侧选择器(`.cell__select`)时只使用 `.radio` 及其状态修饰类(`.radio--checked`/`.radio--disabled`),不额外引入 `.radio-field` 或 `.radio-field-group`;文案和说明由 cell 的 `.cell__title`/`.cell__subtitle` 承载,radio 本身不带文字,**使用 default 尺寸(24px),不追加 `.radio--sm`**(对照本组件 structurePatterns『带文字场景才用 20px 小尺寸』)。当选项为 2 项短文案(单条≤4字)需要放在 cell 右侧或 form-body 内成组横排时,使用 `.radio-field-group > .radio-field > .radio.radio--sm + .radio-field__text`,此时带文字,**使用 sm 尺寸(20px)**。"

依据: 同文件已明文"带文字才用 sm",cell 左侧选择器不带文字,直接对齐已有规则即可;右侧成组带文字,沿用已有规则。

**改动 B(可选,结构性清理)** — 第 184-188 行 `domAnatomy.stateClasses`:
把 `.radio--sm` 移出 `stateClasses`,只保留 `.radio--checked` / `.radio--disabled`。同时建议 [checkbox.json:213-219](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/checkbox.json#L213-L219) 同步清理 `.checkbox--sm`,保持一致。

> 说明: 此项不是本次错误直接原因(checkbox 也有同样结构问题但行为正确),可作为预防性清理,但必须先确认 `scripts/validate-wego-design.mjs` 守门规则是否对 stateClasses 数组成员有硬性要求,避免改了契约导致守门失败。

**改动 C** — `wego-design/metadata.json` 递增 `version`(按 AGENTS.md 仓库级约束要求)。

### 修复 2: 消费决策(wego-design 消费环节) — 中间层

**文件**: [design_consumption_plan.json](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/_spec/design_consumption_plan.json)

**改动 A** — 第 124 行 `surface_designs[2].component_mapping[1].selected`:
把 `.radio.radio--sm[+.radio--checked...]` 改为 `.radio[+.radio--checked...]`(去掉 `.radio--sm`),与第 139/154 行 checkbox 写法对齐。

**改动 B** — 第 130 行 `reason`:补充"cell 内嵌 radio 默认使用 default 24px 尺寸,与 cell--single 56px min-height 协调,不追加 radio--sm(对照同文件 checkbox 多选行 139/154)"。

**改动 C(必做)** — 第 190 行 `implementation_constraints[3]`:
把 `.radio--sm/.radio--checked` 改为 `.radio--checked`,只保留真正的状态修饰类,与第 191 行 checkbox constraint 写法对齐。

### 修复 3: 原型实现(wego-ux) — 末端

**文件**: [scene.js](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/scene.js)

**改动** — 第 117 行:
```js
// 原
var radioClass = 'radio radio--sm' + (checked ? ' radio--checked' : '');
// 改为(与第 139 行 checkbox 写法对齐)
var radioClass = 'radio' + (checked ? ' radio--checked' : '');
```

### 修复 4: 经验沉淀(wego-uxsystem-iterate) — 防复发

按 [workflow-iteration.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md) 的"四段式通用化原则"沉淀:

1. **工作流环节归属**: `wego-design`(主,契约本体 usageHint 修正) + `wego-design` 消费环节(次,design_consumption_plan implementation_constraints 同步)
2. **场景类型识别**: `component-consumption-decision`(已注册,无需新增类型) — 子问题: "组件契约 usageHint 把尺寸修饰类误列为宿主场景合法状态修饰类"
3. **判断条件定义**(结构特征,不依赖具体组件名,通过 workflow-iteration.md 第 5 节"组件名独立性"验证):
   - 当组件契约的 `usageHints` 中出现"X 嵌入宿主组件 Y 时只使用 .X 及其状态修饰类(.X--尺寸类/.X--状态类)"这类表述时
   - 即:在同一句话里把来自 `variantDimensions.size` 的尺寸修饰类与来自 `variantDimensions.state` 的状态修饰类并列为宿主场景合法修饰类
   - **关键判定**: 检查该组件契约的 `structurePatterns` 与 `usageHints` 是否已有"带文字/带 label 场景才用 sm 尺寸"的规则;若已有,而新写的"嵌入宿主"hint 又把 sm 列为合法类,且宿主场景明确不带文字(由宿主组件的 title 节点承载),则该 hint 与已有规则自相矛盾,必须按已有规则修正
   - 对照验证: 检查同类兄弟组件(如 radio vs checkbox)的 usageHints 是否有等价的"嵌入宿主"hint;如果没有则说明该 hint 是独有偏差,应当对齐而非新增
4. **决策动作落地**:
   - 回流到 `wego-design/components/{slug}.json` 的 `usageHints`:宿主场景嵌入规则必须与同文件 `structurePatterns`/`usageHints` 已有的尺寸规则保持一致;若已有"带文字/带 label 场景才用 sm"规则,宿主场景嵌入 hint 必须显式声明"宿主场景不带文字 → 用 default 尺寸",不能把 sm 列为合法修饰类
   - 回流到 `wego-design/SKILL.md`(或 workflow.md 的组件契约审查 checklist):补充一条"检查组件契约 usageHints 中宿主场景嵌入规则是否与已有尺寸规则自相矛盾(把尺寸类当状态类列举、把 sm 列为不带文字场景的合法修饰类)"
   - **禁止**: 把规则回流到 AGENTS.md(违反 workflow-iteration.md 第 6 节"不允许把工作流迭代规则写到 AGENTS.md")

沉淀位置建议新建: `/Users/baobei/CODE/wego-design-system/.codex/skills/wego-uxsystem-iterate/references/case-usagehint-size-as-state.md`(参照 [button-example.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-uxsystem-iterate/references/button-example.md) 的案例格式)。

### 修复 5: 守门验证

按 [AGENTS.md](file:///Users/baobei/CODE/wego-design-system/AGENTS.md) 提交前完整性检查要求:

- 运行 `node scripts/validate-wego-design.mjs`,确认 JSON 格式、Token 同步、组件三向对齐、components.css 完整性、UI Kit 成对、过期路径、禁止文件、metadata version 全部通过
- 跑 `scripts/extract-components-css.mjs` 同步 `wego-app/lib/components.css`(仅当改动 B 影响 CSS 提取时)
- 确认 `metadata.json` version 已递增

## 五、验证步骤

1. 修复完成后,本地直接打开 `wego-app/index.html` 路由到价格权限管理场景
2. 进入权限设置页,用浏览器 DevTools 检查权限类型 cell 行的 `.radio` 元素 computed `width` 应为 24px(而非 20px)
3. 重新跑 wego-tests 验收,确认 `acceptance_report` 中关于 cell-select 单选模式的检查项通过
4. 关键回归测试: **不重新生成场景**,只在原场景上验证;**重新生成场景**(模拟一次 wego-design → wego-ux 完整流水线),确认新生成的 scene.js 中 radio 不再带 `radio--sm`

## 六、关键假设与决策

- 假设 1: 用户预期"cell 内 radio 应该是 24px"与设计系统原始意图一致(由 preview/component-cell.html 第 478-496 行所有 cell-select radio 用例均用 24px 默认尺寸佐证)
- 假设 2: `radio--sm`(20px)在 cell 场景属于"高密度列表"特殊场景,不是默认值;权限设置页 cell--single min-height 56px 不属于高密度场景
- **对照证据(强)**: 同场景 checkbox 多选(`fanGroupChildRowMarkup`)正确使用 24px 默认尺寸,且 checkbox.json 没有等价的"嵌入 cell 时使用状态修饰类(.checkbox--sm/...)" usageHint,反向佐证根因在 radio.json 第 119 行独有 usageHint
- 决策: 不直接改 `components.css`(那是 CSS 实现层,与契约一致),只改契约 + 消费决策 + 实现 + 沉淀
- 决策: 不修改 `cell.json`(cell 契约本身没问题,问题在 radio 契约第 119 行独有 usageHint)
- 决策: 修复 1B(stateClasses 数组清理)设为可选,因为对照证据显示该结构问题与本次错误无直接因果关系(checkbox 同结构但行为正确),且改动可能影响守门规则

## 七、风险提示

1. 修复 4 经验沉淀的"判断条件"必须通过 workflow-iteration.md 第 5 节"通用化验证标准"7 条检查(尤其是第 3 条"组件名独立性":把规则里的 radio/cell 替换成组件A/组件B 后逻辑仍成立)
2. 修复 1B 改 `radio.json` 的 `domAnatomy.stateClasses` 可能影响 `scripts/validate-wego-design.mjs` 守门规则中"组件三向对齐"检查,需要先确认守门脚本是否对 stateClasses 数组成员有硬性要求;如不确定可先跳过 1B,只做 1A
3. 前两轮失败的根因是只改末端不改源头,本轮必须四层同步;若用户只授权改部分文件,需明确告知不完整修复的复发风险
4. 修复 2(改 design_consumption_plan.json)属于"任务级产物"修正,不影响其他场景;但若其他场景也有同类 radio--sm 错误,需要单独审查(本轮范围限定在价格权限管理场景)
