# 优化工作流：bottom-nav 覆盖规则与 component_mapping 传递规则

## Summary

基于「价格权限管理」场景任务暴露的两个工作流问题，回流优化工作流规则，不修改已生成的场景产物：

1. **bottom-nav 覆盖规则缺失**：`uikit-plan.json` 中 push/modal/sheet 的 `coversTabBarDefault` 为 false，导致非主 tab 场景没有盖住 bottom-nav。需统一为：除 5 个主 tab 外，所有场景必须盖住 bottom-nav。

2. **component_mapping 规格传递模糊**：wego-design 输出的 `component_mapping.selected` 写法不统一——有的给完整 DOM、有的只给变体名（如"back-icon 左"）、有的用"结构同构"引用省略关键修饰类。wego-ux 没有被告知"哪些直接用、哪些要反查契约"，导致仿照同 plan 内子级 surface 的明确 DOM，把列表页 back-icon 偷换成文本「返回」。需在 component_mapping 引入显式消费模式标记，并补齐 wego-ux 的消费分派规则。

本次属设计系统本体迭代（修改 uikit-plan.json + library-consumption.json + 三个 SKILL.md），须递增 metadata.version（305 → 306）。

## wego-design 与 wego-ux 的职责边界（决策基础）

在制定 component_mapping 传递规则前，先明确两者的职责分工，避免规则越界：

**wego-design 的职责（输出"可消费的规格"）**：
- 决定命中哪个 pagePattern、哪个 compositionConstraint、哪个组件稳定变体
- 决定每个 surface 的组件组合、DOM 结构、状态修饰类、图标资产路径
- 决定 page_presentation（type / transition / covers_tab_bar 等）
- 输出 implementation_constraints 作为硬约束

**wego-ux 的职责（把规格落成"可运行的工程"）**：
- 场景注册与路由集成：`registerScene`、routes.js upsert、入口挂载到指定 Tab/分组
- 宿主 App 增量维护：按 route_id 插入口、保留既有场景、不重画宿主
- 运行时交互实现：状态变化、toast、回填、空/禁用/错误/成功态、多 surface 编排与数据传递
- 资源同步与部署兼容：lib/ 同步、Vercel + 本地直开双兼容、预览适配

**边界原则**：design 给"规格"（用什么、怎么组合、什么打开方式），ux 给"工程"（怎么注册、怎么运行、怎么同步）。component_mapping 属于规格层，由 design 决定；scene.js 的运行时实现属于工程层，由 ux 决定。规则补强的目标是让规格传递无歧义，而不是让 design 取代 ux 的工程职责。

## Current State Analysis

### 问题 1：bottom-nav 未覆盖

**事实链**：
- [uikit-plan.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/uikit-plan.json) `presentationPrimitives`：push/modal/sheet 的 `coversTabBarDefault` 均为 `false`（仅 full-screen-modal 为 `true`）
- [specs/交互设计原则.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/specs/交互设计原则.md)「页面打开方式 primitive」章节：push 默认 `covers_tab_bar: false`
- [wego-design/SKILL.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/SKILL.md#L178) 行 178：pagePattern 未声明 presentation 时默认 `covers_tab_bar: false`
- [design_consumption_plan.json](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/_spec/design_consumption_plan.json#L200) 行 200 note：明确写了 `price-type-list...采用 push（inline, covers_tab_bar=false）`
- [scene.js](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/scene.js#L213) 行 213：`coversTabBar: false`
- [app.css](file:///Users/baobei/CODE/wego-design-system/wego-app/css/app.css#L271) 行 271：`.app-scene-layer:not(.app-scene-layer--cover-tab) { bottom: calc(56px + var(--safe-area-bottom)) }` —— 未加 `--cover-tab` 修饰类就让出 bottom-nav 空间

**根因**：工作流规则把 push 默认设为不覆盖 bottom-nav，与产品期望"非主 tab 场景都盖住"冲突。

### 问题 2：component_mapping 规格传递模糊

**事实链**：

价格权限管理的 7 条 component_mapping（[design_consumption_plan.json](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/_spec/design_consumption_plan.json)）写法不一致：

| # | surface | block | selected 写法 | DOM 完整度 |
|---|---|---|---|---|
| 1 | host-entry | grid 入口 | `host-shell-grid-entry(button.host-shell-grid-entry + img + span)` + 资产路径 | 完整 |
| 2 | price-type-list | navbar | `navbar + navbar__body(back-icon 左、navbar__center 居中标题『价格管理』、navbar__right 空)` | **语义描述型（模糊）** |
| 3 | price-type-list | cell 列表 | `.cell-group > .cell-group__title + .cell-group__content[+--card] > .cell.cell--single...（cell__body > ...）` | 完整 |
| 4 | price-permission-edit | navbar | `navbar + navbar__body--spaced(navbar__left > navbar__left-text『取消』 + ...)` | 完整 |
| 5 | price-permission-edit | radio | `.cell-group > ... .cell...role=radio(cell__select > .radio.radio--sm[...] + ...)` | 完整 |
| 6 | price-permission-edit | checkbox(部分可见) | `父项『部分可见』cell.role=radio 选中后,在...追加子项 .cell.cell--indent...(cell__select > .checkbox[+.checkbox--checked + .checkbox__icon > img.checkbox__asset.src=checkbox-check.svg] + ...)` | 完整 |
| 7 | price-permission-edit | checkbox(不给谁看) | `与『部分可见』结构同构:父项『不给谁看』cell.role=radio 选中后,在...追加子项 .cell.cell--indent...(cell__select > .checkbox + cell__body > cell__title)` | **不完整（"结构同构"引用，省略 checkbox--checked 和图标资产）** |

**规则链路的真实状态**：

- [wego-design/SKILL.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/SKILL.md#L135) 行 135-137：要求 selected 优先表达"命中的组件场景/组合模式"，稳定场景不得把内嵌控件规格留到实现阶段二次决定
- [wego-design/SKILL.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/SKILL.md#L141) 行 141：未命中 compositionConstraints 时按组件契约 domAnatomy 自由组合
- [library-consumption.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/library-consumption.json#L261) 行 261：稳定场景"消费单位优先是该场景，场景一旦命中，内嵌关联控件的尺寸、对齐、层级、补充结构与冗余说明默认随场景完整消费"
- [uikit-plan.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/uikit-plan.json#L410) compositionConstraints[1] 行 410-415：明确"完整消费命中的稳定场景，不再拆出内嵌选择控件做二次规格判断"
- [wego-ux/SKILL.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-ux/SKILL.md#L156) 行 156：只说"必须读取 surface_designs[] 和 component_mapping[]"，没说怎么消费
- [wego-ux/SKILL.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-ux/SKILL.md#L164) 行 164：反而说"从组件预览页复制组件 markup"，暗示 wego-ux 仍需查看预览页

**根因环节在 wego-design + wego-ux 双向缺口**：

1. **wego-design 侧缺口**：现有规则要求"稳定场景完整消费"和"不得留二次决定"，但没有规定 selected 字段的合法写法，也没有禁止"结构同构"引用。第 2 条（navbar 用"back-icon 左"语义描述）和第 7 条（checkbox 用"结构同构"省略修饰类）都属于规则未覆盖的灰色地带。

2. **wego-ux 侧缺口**：wego-ux/SKILL.md 没有被告知"哪些 component_mapping 是稳定场景直接消费、哪些是自由组合需要反查契约 domAnatomy"。行 164"从组件预览页复制 markup"与 wego-design 行 135-137"稳定场景不得二次决定"存在张力——wego-ux 不知道当 selected 已给完整 DOM 时是否仍要反查预览页，也不知道当 selected 只给变体名时应该反查契约的哪个字段。

3. **实际偏差**：列表页 navbar mapping（第 2 条）只给变体名 `back-icon 左`，wego-ux 仿照同 plan 内权限设置页 navbar（第 4 条）的明确 DOM `navbar__left-text`，把列表页 back-icon 偷换成文本「返回」——既非 back-icon 也非 text-cancel 的「取消」。这就是"子级发现了新样式"的真相。

## Proposed Changes

### 问题 1：bottom-nav 覆盖规则（5 处回流）

#### 1.1 `uikit-plan.json` — primitive 默认值

**文件**：`.codex/skills/wego-design/uikit-plan.json`
**位置**：`presentationPrimitives` 数组
**修改**：
- `push.coversTabBarDefault`: `false` → `true`
- `modal.coversTabBarDefault`: `false` → `true`
- `sheet.coversTabBarDefault`: `false` → `true`
- `full-screen-modal.coversTabBarDefault`: 保持 `true`
- 每个 primitive 的 `description` 增补一句："wego-app/scenes/ 下业务场景必须盖住 bottom-nav（5 个主 tab 走 host-shell 内嵌面板，不走 primitive）"

**理由**：用户明确"除 5 个主 tab 外其他场景都要盖住 bottom-nav"，默认值与之一致。

#### 1.2 `specs/交互设计原则.md` — primitive 章节描述

**文件**：`.codex/skills/wego-design/specs/交互设计原则.md`
**位置**：「页面打开方式 primitive」章节
**修改**：
- push 的 `covers_tab_bar` 默认值描述改为 `true`
- modal 的描述从"通常不覆盖底部 Tab"改为"场景级 modal 默认覆盖 bottom-nav"
- sheet 的描述保持"由 covers_tab_bar 决定"，但默认值改为 `true`
- 章节顶部增加硬约束："wego-app/index.html 的 5 个主 tab（动态/好友/工作台/消息/我的）走 host-shell 内嵌面板，不走 primitive；wego-app/scenes/ 下所有业务场景无论 presentation type 都必须盖住 bottom-nav"

#### 1.3 `wego-design/SKILL.md` — page_presentation 输出规则

**文件**：`.codex/skills/wego-design/SKILL.md`
**位置**：行 178 page_presentation 输出规则
**修改**：
- 行 178 "若 pagePattern 未声明 presentation，默认 type: 'push'、overlay_level: 'inline'、covers_tab_bar: false" → 改为 `covers_tab_bar: true`
- 行 178 后增补硬约束："wego-app/scenes/ 下业务场景的 page_presentation.covers_tab_bar 必须为 true（5 个主 tab 走 host-shell 内嵌面板，不经过 page_presentation）；不得输出 false，除非 surface 角色为 host-entry inline grid 入口"

#### 1.4 `wego-ux/SKILL.md` — 页面打开方式分派表

**文件**：`.codex/skills/wego-ux/SKILL.md`
**位置**：页面打开方式分派表（行 127-141 附近）
**修改**：
- 分派表中 push/modal/sheet 的说明增补"场景级打开必须 coversTabBar: true"
- 增补硬约束："registerScene 的 presentation.coversTabBar 必须与 design_consumption_plan.page_presentation.covers_tab_bar 一致；wego-app/scenes/ 下场景的 coversTabBar 必须为 true（host-entry surface 除外）"

#### 1.5 `wego-tests/SKILL.md` — 验收项

**文件**：`.codex/skills/wego-tests/SKILL.md`
**位置**：页面打开方式验收章节（行 93-99 附近）
**修改**：
- push 验收项增补："场景级 push 必须盖住 bottom-nav（.app-scene-layer--cover-tab 已应用）"
- modal/sheet 验收项增补同款要求
- 增补一致性检查："coversTabBar 实现值与 design_consumption_plan.page_presentation.covers_tab_bar 必须一致；wego-app/scenes/ 下场景若 coversTabBar=false，必须归因到 wego-design 或 wego-ux"

### 问题 2：component_mapping 规格传递规则（4 处回流）

核心方案：在 component_mapping 引入显式 `consumption_mode` 字段，标记每条 mapping 的规格来源，让 wego-ux 一眼知道"哪些直接消费、哪些要反查契约"。规则只规范"规格传递的清晰度"，不取代 wego-ux 的工程职责（场景注册、状态管理、资源同步等仍由 ux 决定）。

#### 2.1 `wego-design/SKILL.md` — component_mapping 输出规则

**文件**：`.codex/skills/wego-design/SKILL.md`
**位置**：行 123-141 component_mapping 字段定义与补充要求
**修改**：

**A. 引入 `consumption_mode` 必填字段**，取值三选一：

| consumption_mode | 含义 | selected 写法 | wego-ux 消费方式 |
|---|---|---|---|
| `stable-variant` | 命中组件契约的 `representativeVariants` 稳定变体或 `behavior` 稳定场景（如 navbar fullscreenModalPatterns 模式 A） | 写变体维度值组合，如 `navbar + navbar__body--spaced(leftControl=text-cancel, actions=button, rightActionType=button, pageTransition=present)` | 反查 `components/{slug}.json` 的 `representativeVariants` 找到对应变体，按 `domAnatomy` + `preview/component-{slug}.html` 实例实现；不得替换变体或自由组合 |
| `composition-constraint` | 命中 `uikit-plan.json` 的 `compositionConstraints` | 写完整 DOM 路径（合成 compositionConstraints.use + 组件契约 domAnatomy），含分组容器类、修饰类、内嵌控件状态修饰类、图标资产路径 | 直接按 selected 的 DOM 路径实现；内嵌控件规格（尺寸/间距/层级/状态修饰类）不得二次决定 |
| `free-composition` | 未命中稳定变体和 compositionConstraints，按组件契约 domAnatomy 自由组合 | 写完整 DOM 路径（基于 domAnatomy.root + requiredChildren + optionalActionClasses 推导） | 按 selected 的 DOM 路径实现；允许在 domAnatomy 边界内调整业务作用域样式 |

**B. 禁止两种模糊写法**：
- 禁止"语义描述型"写法（如 `back-icon 左`）—— 必须用 `stable-variant` 模式 + 维度值组合，或用 `composition-constraint`/`free-composition` + 完整 DOM 路径
- 禁止"结构同构"引用写法（如 `与『部分可见』结构同构:...`）—— 即使结构相同，selected 也必须独立给出完整 DOM 路径，不得用引用省略修饰类或资产路径

**C. 增补一致性要求**：同一份 design_consumption_plan 内所有 component_mapping 必须标注 `consumption_mode`，且 selected 写法与 consumption_mode 匹配（stable-variant 用维度值组合，composition-constraint/free-composition 用完整 DOM 路径）。

**理由**：
- `stable-variant` 模式承认"变体名引用"是合法的，但要求用维度值组合而非自然语言描述，并要求 wego-ux 反查契约的 representativeVariants + domAnatomy + preview 实例。这解决了第 2 条（列表页 navbar）"back-icon 左"的模糊问题——必须写成 `stable-variant` + 维度值组合，wego-ux 反查 navbar.json 的 representativeVariants[0] 找到 back-icon 对应 DOM `navbar__left-btn > i.wego-iconfont-s.icon-fanhui`。
- `composition-constraint` 模式要求完整 DOM 路径，承接 compositionConstraints[1]"完整消费稳定场景"的现有规则。这覆盖第 3/5/6 条的写法。
- `free-composition` 模式承接行 141"未命中 compositionConstraints 时按 domAnatomy 自由组合"。这覆盖第 1 条（host-entry grid 入口）的写法。
- 禁止"结构同构"引用解决第 7 条的违规。

#### 2.2 `wego-ux/SKILL.md` — component_mapping 消费分派规则

**文件**：`.codex/skills/wego-ux/SKILL.md`
**位置**：行 154-168 设计系统消费章节
**修改**：

**A. 增加 component_mapping 消费分派规则**（替换或增补行 164"从组件预览页复制组件 markup"的笼统说法）：

```
消费 component_mapping 时,按 consumption_mode 分派规格消费行为:

- stable-variant:反查 components/{slug}.json 的 representativeVariants
  找到维度值组合对应的变体,按 domAnatomy + preview/component-{slug}.html
  实例复制 markup;不得替换变体(如把 back-icon 换成 navbar__left-text)、
  不得跨变体组合、不得仿照同 plan 内其他 surface 的 selected 自行替换变体。
  规格消费完成后,wego-ux 仍负责工程实现(场景注册、状态绑定、交互逻辑)。

- composition-constraint:直接按 selected 的 DOM 路径实现;
  内嵌控件规格(尺寸/间距/层级/状态修饰类/图标资产)不得二次决定;
  不得省略 selected 中已声明的修饰类或资产路径。
  规格消费完成后,wego-ux 仍负责工程实现。

- free-composition:按 selected 的 DOM 路径实现;
  允许在组件契约 domAnatomy 边界内调整业务作用域样式。
  规格消费完成后,wego-ux 仍负责工程实现。
```

**B. 增补 navbar leftControl 绑定关系硬约束**（作为 stable-variant 模式的具体落地参考）：

```
navbar leftControl 与 presentation.type 的绑定(命中 stable-variant 时必查):
- push → back-icon → DOM: navbar__left > .navbar__left-btn > i.wego-iconfont-s.icon-fanhui
- full-screen-modal 模式 A → text-cancel → DOM: navbar__left > .navbar__left-text(文案固定「取消」,不得为「返回」)
- full-screen-modal 模式 B → close-icon → DOM: navbar__left > .navbar__left-btn > i.wego-iconfont-s.icon-cha
```

**理由**：wego-ux 现有规则只说"从预览页复制 markup"，没有区分"何时直接用 selected、何时反查契约"。新规则让 wego-ux 按 consumption_mode 分派规格消费行为，且明确禁止"仿照同 plan 内其他 surface 的 selected 自行替换变体"——这正是本次列表页 navbar 出错的直接原因。规则只规范"规格消费"，不干预 wego-ux 的工程职责（场景注册、状态管理、资源同步等仍由 ux 决定）。

#### 2.3 `wego-tests/SKILL.md` — 验收项

**文件**：`.codex/skills/wego-tests/SKILL.md`
**位置**：验收项章节
**修改**：

**A. 增加 component_mapping 规格传递一致性验收**：
- "每条 component_mapping 必须有 consumption_mode 字段；缺失归因到 wego-design"
- "consumption_mode 与 selected 写法匹配检查：stable-variant 必须是维度值组合（不得是完整 DOM 路径，也不得是自然语言描述）；composition-constraint 和 free-composition 必须是完整 DOM 路径（含分组容器类、修饰类、内嵌控件状态修饰类、图标资产路径）"
- "禁止'结构同构'引用写法检查：selected 不得出现『与...结构同构』『同构』等引用词，每条必须独立给出完整 DOM 或维度值组合"

**B. 增加 navbar leftControl 实现一致性验收**：
- "stable-variant 模式下 navbar leftControl 实现与维度值一致：leftControl=back-icon 时实现必须是 `navbar__left-btn > i.wego-iconfont-s.icon-fanhui`；leftControl=text-cancel 时实现必须是 `navbar__left-text` 且文案为「取消」（不得为「返回」）；leftControl=close-icon 时实现必须是 `navbar__left-btn > i.wego-iconfont-s.icon-cha`"
- "实现与 selected 维度值不一致时归因到 wego-ux；selected 写法与 consumption_mode 不匹配时归因到 wego-design"

#### 2.4 `library-consumption.json` — scenarioTypeRegistry 补充 consumption_mode 引用

**文件**：`.codex/skills/wego-design/library-consumption.json`
**位置**：`scenarioTypeRegistry.types[]` 中 `component-consumption-decision` 类型的 `judgmentLogic`（行 261 附近）
**修改**：在现有 judgmentLogic 末尾增补："该场景类型在 component_mapping 中必须标注 `consumption_mode` 字段（取值 `stable-variant` / `composition-constraint` / `free-composition`），用于 wego-ux 分派规格消费行为；`consumption_mode` 取值由 wego-design 根据命中来源决定：命中组件契约 representativeVariants 或 behavior 稳定场景 → `stable-variant`；命中 uikit-plan.json compositionConstraints → `composition-constraint`；两者均未命中 → `free-composition`。"

**理由**：library-consumption.json 是场景类型注册表的权威来源，consumption_mode 作为 component-consumption-decision 场景类型的必填属性，应在 judgmentLogic 中明确定义取值规则。这样 wego-design/SKILL.md 的输出规则、wego-ux/SKILL.md 的消费规则、wego-tests/SKILL.md 的验收规则都引用同一个权威定义。

### metadata version 递增

**文件**：`.codex/skills/wego-design/metadata.json`
**修改**：`version: 305` → `version: 306`
**理由**：修改了 uikit-plan.json 和 library-consumption.json（设计系统本体），按 AGENTS.md 仓库级约束须递增 version。

## Assumptions & Decisions

1. **wego-design 与 wego-ux 的职责边界**：design 输出"可消费的规格"（用什么组件、什么 DOM、什么打开方式），ux 把规格落成"可运行的工程"（场景注册、状态管理、资源同步、预览适配）。component_mapping 属于规格层，由 design 决定；scene.js 的运行时实现属于工程层，由 ux 决定。本次规则补强只规范"规格传递的清晰度"，不取代 ux 的工程职责。

2. **wego-ux 的不可替代价值**：即使 design 把 component_mapping 写到极致清晰，ux 仍承担 6 项工程职责：①场景注册与路由集成 ②宿主 App 增量维护 ③运行时交互实现（状态/toast/回填/多 surface 编排）④资源同步与部署兼容（Vercel + 本地直开）⑤预览适配（电脑端手机壳 + 移动端铺满）⑥工程层的状态管理与数据流。这些是 design_consumption_plan 作为规格文档无法覆盖的。

3. **覆盖范围决策**：用户明确"所有非主 tab 场景"都盖住 bottom-nav，因此 push/modal/sheet 三个 primitive 的 `coversTabBarDefault` 统一改为 `true`。host-entry surface（inline grid 入口）仍为 `covers_tab_bar: false`，因为它不是独立场景，是宿主页内的入口节点——这点在 wego-design/SKILL.md 的硬约束中显式排除。

4. **modal 盖住 bottom-nav 的视觉影响**：modal 作为浮层盖住 bottom-nav 在移动端不常见，但用户已明确规则，本次按用户意图修改。若后续发现具体 modal 场景视觉异常，可由 wego-design 在该 surface 的 presentation_ref 中显式声明 `covers_tab_bar: false` 并说明理由（规则保留例外出口）。

5. **consumption_mode 三值设计依据**：
   - `stable-variant`：承接 wego-design/SKILL.md 行 137 + library-consumption.json 行 261 + uikit-plan.json compositionConstraints[1] 行 410-415 的现有"稳定场景完整消费"语义，但显式化为字段
   - `composition-constraint`：承接 wego-design/SKILL.md 行 139-141 的现有 compositionConstraints 处理规则
   - `free-composition`：承接 wego-design/SKILL.md 行 141 的"未命中 compositionConstraints 时按 domAnatomy 自由组合"
   - 三值覆盖了 component_mapping 的所有可能命中来源，无遗漏

6. **stable-variant 模式允许变体名引用**：承认"稳定变体引用"是合法的，但要求用维度值组合（如 `leftControl=back-icon, pageTransition=push`）而非自然语言（如 `back-icon 左`）。wego-ux 反查契约 representativeVariants 找到对应变体的 domAnatomy + preview 实例。这样既避免了冗长的 DOM 重复，又让 wego-ux 有明确的反查路径，不会仿照错误对象。

7. **禁止"结构同构"引用**：第 7 条 checkbox（不给谁看）用"与『部分可见』结构同构"省略了 `.checkbox--checked` 和图标资产，违反行 137"稳定场景内嵌控件规格不得二次决定"。新规则要求每条 selected 独立给出完整 DOM，不得用引用省略修饰类或资产路径。

8. **navbar 根因定位**：根因在 wego-design（selected 写法模糊）+ wego-ux（规格消费规则缺口）双向，而非单点。wego-ux 仿照同 plan 内子级 surface 的明确 DOM 是合理但错误的推理。因此补强重心在 wego-design（引入 consumption_mode + 禁止模糊写法）和 wego-ux（按 consumption_mode 分派规格消费），wego-tests 作为第三道防线。

9. **不改 navbar.json 契约**：契约本身正确（representativeVariants 已覆盖 back-icon 变体，pageTransitionRule 已明确 back-icon→push），问题在 design_consumption_plan 没有正确引用契约。契约无需修改。

10. **不改生成产物**：按用户要求，本次只优化工作流文档，不修改 wego-app/scenes/价格权限管理/ 下的 scene.js / scene.css / _spec/。后续若需修正产物，应走正常场景迭代流程（用新规则重新生成 design_consumption_plan + scene.js）。

11. **不改宿主 App 实现**：wego-app/css/app.css 的 `.app-scene-layer:not(.app-scene-layer--cover-tab)` 兜底规则保留（无害），wego-app/js/app.js 的 `--cover-tab` 修饰类切换逻辑保留。工作流规则修改后，wego-ux 生成新场景时会输出 `coversTabBar: true`，自然触发 `--cover-tab`。

12. **不改 workflow-iteration.md**：本次回流符合四段式（环节归属 → 场景类型 → 判断条件 → 决策动作），是该文档的正常应用，无需修改方法论本身。

## Verification Steps

1. **守门脚本通过**：运行 `node scripts/validate-wego-design.mjs`，确认 JSON 格式、Token 同步、组件三向对齐、components.css 完整性、UI Kit 成对、过期路径、禁止文件、metadata version 全部通过。

2. **metadata version 已递增**：确认 `.codex/skills/wego-design/metadata.json` version = 306。

3. **反例回归检查（人工 review）**：用「价格权限管理」场景作为反例，验证新规则能拦截本次的两个问题：
   - **问题 1 拦截**：按新规则，wego-design 输出 price-type-list surface 的 page_presentation 时，push 默认 `covers_tab_bar: true`；wego-ux 实现时 `coversTabBar: true`；wego-tests 验收"场景级 push 必须盖住 bottom-nav"通过。
   - **问题 2 拦截（列表页 navbar）**：按新规则，列表页 navbar mapping 必须标注 `consumption_mode: stable-variant`，selected 写维度值组合 `leftControl=back-icon, pageTransition=push`；wego-ux 按 stable-variant 模式反查 navbar.json representativeVariants[0]，找到 back-icon 对应 DOM `navbar__left-btn > i.wego-iconfont-s.icon-fanhui`；wego-tests 验收"leftControl=back-icon 时实现必须是 `navbar__left-btn > i.wego-iconfont-s.icon-fanhui`"通过。文本「返回」被拦截。
   - **问题 2 拦截（checkbox 不给谁看）**：按新规则，第 7 条不得用"结构同构"引用，必须独立给出完整 DOM（含 `.checkbox--checked` 和 `img.checkbox__asset.src=checkbox-check.svg`）；wego-tests 验收"禁止'结构同构'引用写法"通过。

4. **consumption_mode 取值覆盖性检查**：确认三个取值覆盖所有 component_mapping 命中来源——stable-variant（组件契约稳定变体/behavior 稳定场景）、composition-constraint（uikit-plan compositionConstraints）、free-composition（两者均未命中）。无第四种情况。

5. **不影响现有 full-screen-modal 默认值**：确认 biz-rule-config pagePattern 的 presentation 仍为 `full-screen-modal` + `coversTabBar: true`，本次修改不影响已有 pagePattern 级声明，只影响 primitive 级默认值。

6. **规则一致性检查**：确认 wego-design/SKILL.md（输出规则）、wego-ux/SKILL.md（消费规则）、wego-tests/SKILL.md（验收规则）、library-consumption.json（场景类型权威定义）四处对 consumption_mode 的取值定义和分派逻辑完全一致，无冲突。

7. **职责边界检查**：确认新规则只规范"规格传递的清晰度"，不取代 wego-ux 的工程职责。wego-ux/SKILL.md 中"规格消费完成后,wego-ux 仍负责工程实现"的表述应出现在每种 consumption_mode 的消费说明中，避免规则越界。
