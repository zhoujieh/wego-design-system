# 优化工作流：bottom-nav 覆盖规则与 navbar 返回箭头规则

## Summary

基于「价格权限管理」场景任务暴露的两个工作流问题，回流优化设计系统消费与原型生成的工作流规则，不修改已生成的场景产物：

1. **bottom-nav 覆盖规则缺失**：`uikit-plan.json` 中 push/modal/sheet 的 `coversTabBarDefault` 为 false，导致非主 tab 场景没有盖住 bottom-nav。需统一为：除 5 个主 tab 外，所有场景必须盖住 bottom-nav。
2. **navbar leftControl 颗粒度不一致**：`design_consumption_plan` 的 component_mapping 对列表页 navbar 只写变体名 `back-icon`（未展开具体 DOM），对权限设置页却写了具体 DOM 类名 `navbar__left-text`。wego-ux 仿照子级 surface 的明确 DOM，把列表页 back-icon 偷换成了文本「返回」。需在 design/ux/tests 三环堵住"变体名未展开"漏洞。

本次属设计系统本体迭代（修改 uikit-plan.json），须递增 metadata.version（305 → 306）。

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

### 问题 2：navbar 列表页用文本「返回」替代 back-icon

**事实链**：
- [navbar.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/navbar.json#L147) 行 147 `pageTransitionRule`：`back-icon` → push 转场；`close-icon`/`text-cancel` → present 转场（契约正确）
- [preview/component-navbar.html](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/preview/component-navbar.html#L162-L171) 行 162-171：back-icon 的具体 DOM 是 `<div class="navbar__left-btn"><i class="wego-iconfont-s icon-fanhui"></i></div>`（preview 正确）
- [design_consumption_plan.json](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/_spec/design_consumption_plan.json#L59) 行 59（列表页 mapping）：`selected` 只写 `navbar + navbar__body（back-icon 左、navbar__center 居中标题『价格管理』、navbar__right 空）` —— **只给变体名，未给具体 DOM**
- [design_consumption_plan.json](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/_spec/design_consumption_plan.json#L104) 行 104（权限设置页 mapping）：`selected` 写 `navbar + navbar__body--spaced（navbar__left > navbar__left-text『取消』 + ...）` —— **给了具体 DOM 类名 `navbar__left-text`**
- [scene.js](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/scene.js#L91-L111) 行 91-111（列表页）：用 `<button class="navbar__left-text" data-action="back">返回</button>` —— 文本「返回」，既非 back-icon 也非 text-cancel 的「取消」
- [scene.js](file:///Users/baobei/CODE/wego-design-system/wego-app/scenes/价格权限管理/scene.js#L180-L195) 行 180-195（权限设置页）：用 `<button class="navbar__left-text" data-action="cancel">取消</button>` —— 与 mapping 一致

**根因环节在 wego-design**：同一份 plan 内，权限设置页 mapping 给了具体 DOM（`navbar__left-text`），列表页 mapping 只给变体名（`back-icon`）。wego-ux 仿照同 plan 内子级 surface 的明确 DOM 模式，把列表页 back-icon 偷换成 `navbar__left-text` + 文案「返回」。wego-design/SKILL.md 行 135 虽要求"selected 优先表达命中的组件场景/组合模式"，但未强制"变体名必须展开成具体 DOM"。

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

### 问题 2：navbar leftControl 颗粒度（3 处回流）

#### 2.1 `wego-design/SKILL.md` — component_mapping 输出规则

**文件**：`.codex/skills/wego-design/SKILL.md`
**位置**：行 135-139 component_mapping 补充要求
**修改**：
- 行 135 "selected 优先表达'命中的组件场景/组合模式'"后增补硬约束："`selected` 必须把变体名展开成具体 DOM 结构（类名 + 子元素 + iconfont/svg 类），不得只写变体名；例如 navbar leftControl=back-icon 必须展开为 `navbar__left > .navbar__left-btn > i.wego-iconfont-s.icon-fanhui`，不得只写 `back-icon 左`"
- 增补一致性要求："同一份 design_consumption_plan 内所有 surface 的 component_mapping 颗粒度必须一致；不得出现部分 surface 给具体 DOM、部分 surface 只给变体名的情况"

**理由**：根因就是颗粒度不一致，wego-ux 仿照了同 plan 内子级 surface 的明确 DOM。强制全展开 + 同 plan 颗粒度一致，从源头堵住。

#### 2.2 `wego-ux/SKILL.md` — 实现纪律

**文件**：`.codex/skills/wego-ux/SKILL.md`
**位置**：禁止事项或实现规则章节
**修改**：
- 增补规则："navbar leftControl 必须严格按 design_consumption_plan.component_mapping 的 selected 落地；若 selected 只给了变体名（如 back-icon）而非具体 DOM，必须反查 components/navbar.json 契约 + preview/component-navbar.html 找到对应变体的具体 DOM，不得仿照同 plan 内其他 surface 的 DOM 模式自行替换变体"
- 增补绑定关系表："navbar 左侧控件与 presentation.type 的绑定：push → back-icon（`navbar__left-btn > i.wego-iconfont-s.icon-fanhui`）；full-screen-modal 模式 A → text-cancel（`navbar__left-text`，文案固定为「取消」）；full-screen-modal 模式 B → close-icon（`navbar__left-btn > i.wego-iconfont-s.icon-cha`）。不得用文本「返回」替代 back-icon"

#### 2.3 `wego-tests/SKILL.md` — 验收项

**文件**：`.codex/skills/wego-tests/SKILL.md`
**位置**：验收项章节
**修改**：
- 增补验收项："navbar leftControl 实现与 design_consumption_plan.component_mapping 变体名一致性检查：mapping 写 back-icon 时，实现必须是 `navbar__left-btn > i.wego-iconfont-s.icon-fanhui`；mapping 写 text-cancel 时，实现必须是 `navbar__left-text` 且文案为「取消」（不得为「返回」）；mapping 写 close-icon 时，实现必须是 `navbar__left-btn > i.wego-iconfont-s.icon-cha`"
- 增补验收项："检查 design_consumption_plan 内所有 surface 的 component_mapping 颗粒度一致性：若某 surface 的 selected 只写变体名未展开 DOM，归因到 wego-design"

### metadata version 递增

**文件**：`.codex/skills/wego-design/metadata.json`
**修改**：`version: 305` → `version: 306`
**理由**：修改了 uikit-plan.json（设计系统本体），按 AGENTS.md 仓库级约束须递增 version。

## Assumptions & Decisions

1. **覆盖范围决策**：用户明确"所有非主 tab 场景"都盖住 bottom-nav，因此 push/modal/sheet 三个 primitive 的 `coversTabBarDefault` 统一改为 `true`。host-entry surface（inline grid 入口）仍为 `covers_tab_bar: false`，因为它不是独立场景，是宿主页内的入口节点——这点在 wego-design/SKILL.md 的硬约束中显式排除。

2. **modal 盖住 bottom-nav 的视觉影响**：modal 作为浮层盖住 bottom-nav 在移动端不常见，但用户已明确规则，本次按用户意图修改。若后续发现具体 modal 场景视觉异常，可由 wego-design 在该 surface 的 presentation_ref 中显式声明 `covers_tab_bar: false` 并说明理由（规则保留例外出口）。

3. **navbar 根因定位**：根因在 wego-design（component_mapping 颗粒度不一致），而非 wego-ux 自由发挥。wego-ux 仿照同 plan 内子级 surface 的明确 DOM 是合理但错误的推理。因此补强重心在 wego-design/SKILL.md（强制变体名展开 + 同 plan 颗粒度一致），wego-ux 和 wego-tests 作为二、三道防线。

4. **不改生成产物**：按用户要求，本次只优化工作流文档，不修改 wego-app/scenes/价格权限管理/ 下的 scene.js / scene.css / _spec/。后续若需修正产物，应走正常场景迭代流程。

5. **不改宿主 App 实现**：wego-app/css/app.css 的 `.app-scene-layer:not(.app-scene-layer--cover-tab)` 兜底规则保留（无害），wego-app/js/app.js 的 `--cover-tab` 修饰类切换逻辑保留。工作流规则修改后，wego-ux 生成新场景时会输出 `coversTabBar: true`，自然触发 `--cover-tab`。

6. **不改 navbar.json 契约**：契约本身正确（pageTransitionRule 已明确 back-icon→push），问题在 design_consumption_plan 没有把契约的变体名展开成 DOM。契约无需补 doNotInvent 条款，因为"不得用文本『返回』替代 back-icon"是消费纪律（wego-design/wego-ux 层），不是契约本身的禁止项。

7. **不改 workflow-iteration.md**：本次回流符合四段式（环节归属 → 场景类型 → 判断条件 → 决策动作），是该文档的正常应用，无需修改方法论本身。

## Verification Steps

1. **守门脚本通过**：运行 `node scripts/validate-wego-design.mjs`，确认 JSON 格式、Token 同步、组件三向对齐、components.css 完整性、UI Kit 成对、过期路径、禁止文件、metadata version 全部通过。

2. **metadata version 已递增**：确认 `.codex/skills/wego-design/metadata.json` version = 306。

3. **反例回归检查（人工 review）**：用「价格权限管理」场景作为反例，验证新规则能拦截本次的两个问题：
   - 问题 1：按新规则，wego-design 输出 price-type-list surface 的 page_presentation 时，push 默认 `covers_tab_bar: true`；wego-ux 实现时 `coversTabBar: true`；wego-tests 验收"场景级 push 必须盖住 bottom-nav"通过。问题被拦截。
   - 问题 2：按新规则，wego-design 输出列表页 navbar component_mapping 时，`selected` 必须展开为 `navbar__left > .navbar__left-btn > i.wego-iconfont-s.icon-fanhui`；wego-ux 按此 DOM 实现；wego-tests 验收"back-icon 实现必须是 `navbar__left-btn > i.wego-iconfont-s.icon-fanhui`"通过。问题被拦截。

4. **同 plan 颗粒度一致性检查**：确认新规则要求"同一份 design_consumption_plan 内所有 surface 的 component_mapping 颗粒度必须一致"，避免再现"列表页给变体名、权限设置页给具体 DOM"的割裂。

5. **不影响现有 full-screen-modal 默认值**：确认 biz-rule-config pagePattern 的 presentation 仍为 `full-screen-modal` + `coversTabBar: true`，本次修改不影响已有 pagePattern 级声明，只影响 primitive 级默认值。
