# 新增 system-settings UI Kit(参照 biz-rule-config 范式)

## 一、用户问题回答:现有 UI Kit 是否有"宿主页面 + 打开动画"规则?

分两层回答:

### 1. 消费侧规则(已有,显性)

- `uikit-plan.json` 的 `pagePattern.presentation` 字段已定义五字段:`presentation` / `transition` / `dismissAction` / `overlayLevel` / `coversTabBar`
- biz-rule-config 已注册:`full-screen-modal` + `slide-up-enter, slide-down-exit` + `page-level-save` + `overlay` + `coversTabBar: true`
- `wego-design/SKILL.md` 规定:命中带 `presentation` 的 pagePattern 时,必须填写 `presentation_ref`,并映射为 `page_presentation` 输出
- `library-consumption.json` 的 `scenarioTypeRegistry` 有 `page-presentation-binding` 场景类型,覆盖"pagePattern.presentation、page_presentation、push/modal/sheet/full-screen-modal 分派"

### 2. Showcase 侧规则(没有显性文档,只有 biz-rule-config 隐性实践)

`biz-rule-config/index.html` 实际做了双层结构:

- `BaseScreen`(宿主入口页):navbar + phone-body + `uikit-base-card`(摘要) + `cell-group`(入口 cell,点击触发 onOpen) + BottomNav + HomeIndicator
- `BizSettingsModal`(模态层):`.uikit-modal-screen` + `transform: translateY(100%)` → `translateY(0)` 实现 slide-up 打开动画
- 通过 `openModal` / `closeModal` 控制模态挂载与打开/关闭状态
- 使用 React + Babel standalone

但**没有显性规则文档**要求"UI Kit 必须演示双层结构(宿主入口 + 打开动画)"。这是 biz-rule-config 的隐性实践。

### 结论

- 现有规则只覆盖"消费侧如何引用 pagePattern.presentation"
- 没有显性规则覆盖"UI Kit Showcase 如何演示打开方式和动画"
- 新 system-settings UI Kit 应参照 biz-rule-config 实践双层结构,让 AI 能从 Showcase 学到"系统设置类页面"的打开方式和动画定义

## 二、计划范围

- 只新增 `system-settings` UI Kit
- **不移除手机壳**(保留 biz-rule-config 现状)
- **不修改现有 `wego-app/scenes/系统设置/` 场景**
- 参照 biz-rule-config 的双层结构实践(HostScreen + SettingsScreen + 打开动画)

## 三、产出物

### 1. UI Kit Showcase

**路径**:`.codex/skills/wego-design/ui_kits/system-settings/index.html`

参照 biz-rule-config 的双层结构:

- **HostScreen(宿主入口页)**:
  - StatusBar + navbar("我的") + phone-body + 摘要卡 + 入口 cell-group(点击触发 onOpen) + BottomNav + HomeIndicator
  - 摘要卡使用 `.uikit-base-card`(参照 biz-rule-config)
  - 入口 cell 使用 `cell--single cell--clickable` + arrow,点击触发打开系统设置页
- **SystemSettingsScreen(系统设置页)**:
  - 带打开动画(参照 `.uikit-modal-screen` 的 transform + transition 实现)
  - StatusBar + navbar("设置" + 返回) + phone-body + 三组 cell-group + HomeIndicator
  - 三组:account / business / system(抽象自现有系统设置页)
  - **移除"退出登录"按钮和"客服"链接**(用户要求)
  - 通栏模式 M1(phone-body 0px 横向 padding + cell-group__content 无 --card)
  - cell 变体:`cell--double` / `cell--single` + trailing 变体(text-arrow / dot-arrow / arrow)
- **打开动画**:参照 biz-rule-config 的 `openModal` / `closeModal` + `setTimeout` 控制挂载与状态切换
- **技术栈**:React + Babel standalone(参照 biz-rule-config)

### 2. 质量报告

**路径**:`.codex/skills/wego-design/ui_kits/system-settings/quality-report.json`

参照 biz-rule-config 的 quality-report.json 结构:

- `kitType` / `presentation` / `enterTransition` / `exitTransition` / `coversTabBar`
- `coreComponentsUsed` / `supportComponentsUsed`
- `previewClassReuseRate` / `reuseAssessment`
- `interactiveStatesRendered` / `primaryActionPerScreen`
- `mockDataDensity` / `qualityGates` / `warnings`

### 3. 更新 metadata.json

**路径**:`.codex/skills/wego-design/metadata.json`

- 在 `uiKits[]` 数组添加 system-settings 条目
- version 递增(309 → 310)

### 4. 更新 uikit-plan.json

**路径**:`.codex/skills/wego-design/uikit-plan.json`

- 在 `uiKits[]` 数组添加 system-settings 条目
- 在 `pagePatterns[]` 数组添加 system-settings pagePattern,包含:
  - `name` / `slug` / `applicableScenarios`
  - `interactionPattern`
  - `presentation` / `transition` / `dismissAction` / `overlayLevel` / `coversTabBar`(五字段)
  - `componentSlugs`
  - `uikitFile`
  - `specRef`
  - `structureHighlights`
  - `compositionConstraints`(如有)

### 5. 更新 library-consumption.json

**路径**:`.codex/skills/wego-design/library-consumption.json`

- `consumptionLayers.uikit.files` 添加 system-settings 的 index.html 和 quality-report.json
- `uiKits` 数组添加 "system-settings"
- `downstreamScenarios.buildMobileAppPage.read` 添加 system-settings 的 index.html
- **`uikitConstraints` 新增 `showcaseStructureRule` 字段**(决策 2 已决定):
  - `applicableTo`:包含 pagePattern 的 UI Kit
  - `structureRequirement`:双层结构(HostScreen + SettingsScreen)的具体要求
  - `animationRequirement`:transform + transition 实现打开/关闭动画(push 用 translateX,modal 用 translateY)
  - `referenceInstances`:biz-rule-config、system-settings
  - `purpose`:让 AI 从规则文档学到 UI Kit 必须演示双层结构 + 打开方式 + 动画定义

### 6. 更新 README.md

**路径**:`.codex/skills/wego-design/README.md`

- 在 UI Kit 清单中添加 system-settings 说明

## 四、抽象来源

- 现有 `wego-app/scenes/系统设置/scene.js` + `scene.css`(参考结构,不修改)
- 三组 cell-group:account / business / system
- cell 变体:`cell--double` / `cell--single` + trailing 变体(text-arrow / dot-arrow / arrow)
- **移除**:"退出登录"按钮 + "客服教我"链接
- **保留**:三组 cell + 通栏模式 M1

## 五、决策点(已决定)

### 决策 1:打开方式(已决定:push + slide-left)

**决定**:`push` + `slide-left`

- 参照现有系统设置页 `wego-app/scenes/系统设置/scene.js` 的 presentation(`type: 'push'`, `transition: 'slide-left'`)
- 系统设置通常是层级导航,从"我的"页 push 进入,不是模态
- 与现有系统设置页保持一致
- UI Kit Showcase 仍参照 biz-rule-config 的双层结构(HostScreen + SettingsScreen),只是动画类型为 push
- **实现方式**:`.uikit-settings-screen` + `transform: translateX(100%)` → `translateX(0)`(slide-left 进入),关闭时反向
- **pagePattern presentation 五字段**:
  - `presentation`: `"push"`
  - `transition`: `"slide-left-enter, slide-right-exit"`
  - `dismissAction`: `"back-button"`
  - `overlayLevel`: `"inline"`
  - `coversTabBar`: `true`

### 决策 2:补充显性 Showcase 规则(已决定补充到 library-consumption.json)

**决定**:在 `library-consumption.json` 的 `uikitConstraints` 新增 `showcaseStructureRule` 字段

**规则内容**:

- **适用范围**:包含 pagePattern 的 UI Kit(即有 presentation 定义的 UI Kit)
- **结构要求**:
  - UI Kit 必须演示双层结构:宿主入口页(HostScreen) + 业务页面(SettingsScreen)
  - 宿主入口页包含:navbar + phone-body + 摘要卡 + 入口 cell-group(触发打开) + BottomNav + HomeIndicator
  - 业务页面包含:navbar + phone-body + 内容 + 打开动画 + 关闭动画
- **动画要求**:
  - 打开动画通过 `transform` + `transition` 实现
  - push 用 `translateX(100%)` → `translateX(0)`(slide-left 进入)
  - modal/full-screen-modal 用 `translateY(100%)` → `translateY(0)`(slide-up 进入)
  - 关闭动画反向,通过 React 状态控制挂载与打开/关闭状态切换
- **参考实例**:biz-rule-config(BaseScreen + BizSettingsModal)、system-settings(HostScreen + SystemSettingsScreen)
- **目的**:让 AI 从规则文档直接学到"UI Kit 必须演示双层结构 + 打开方式 + 动画定义",不依赖隐性实践推断

## 六、验证步骤

1. 运行 `node scripts/validate-wego-design.mjs` 通过守门(JSON 格式、Token 同步、组件三向对齐、components.css 完整性、UI Kit 成对、过期路径、禁止文件、metadata version)
2. 确认 `metadata.json` version 已递增(309 → 310)
3. 确认 UI Kit 产物落在 `.codex/skills/wego-design/ui_kits/system-settings/`
4. 本地打开 `ui_kits/system-settings/index.html` 确认双层结构和动画可用
5. 确认电脑端手机壳预览 + 移动端全屏都成立
6. 确认 `wego-app/scenes/系统设置/` 场景未被修改

## 七、风险与边界

- **风险 1**:新 UI Kit 的双层结构实现可能偏离 biz-rule-config 范式。**对策**:严格参照 biz-rule-config/index.html 的 React 组件结构和 CSS 动画实现。
- **风险 2**:pagePattern 注册可能与 biz-rule-config 重复或冲突。**对策**:system-settings 的 `applicableScenarios` 聚焦"系统设置类页面",与 biz-rule-config 的"业务规则配置类页面"区分。
- **边界**:本次只新增 UI Kit + 不修改现有场景 + 补充显性 Showcase 规则到 `library-consumption.json` 的 `uikitConstraints.showcaseStructureRule`(决策 2 已决定)。
- **风险 3**:新规则 `showcaseStructureRule` 可能与现有 biz-rule-config 实践不完全对齐。**对策**:规则内容直接抽取自 biz-rule-config/index.html 的实际实现,确保规则与实践一致。
