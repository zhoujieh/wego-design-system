# 新增 system-settings UI Kit

## 摘要

新增一个 `system-settings` UI Kit，抽象自现有 `wego-app/scenes/系统设置/` 的"设置入口列表"范式，作为系统级各业务场景设置页的通用 Showcase。

关键决策（来自用户确认）：
- slug = `system-settings`
- 范围 = 只新增 UI Kit + 设计系统登记，不修改现有 `wego-app/scenes/系统设置/` 场景
- UI Kit 中不包含退出登录按钮和客服链接（这两者是页面级业务功能，不属于通用设置入口列表范式）
- UI Kit 不使用手机外壳（`.uikit-shell`/`.phone-frame`/`.phone-screen`/`.phone-status`/`.phone-indicator`），改用简单居中容器 `.uikit-canvas`，避免引入大量外壳相关规则；`wego-app` 的手机外壳保留不动

## 当前状态分析

### 现有 UI Kit 全集

仅 `biz-rule-config` 一个，定位是"业务规则配置 / edit-then-save / full-screen-modal 编辑型"。系统设置页这种"入口列表导航 / select / push"模式没有对应注册的 UI Kit，当前走 `generic-mobile-task-page` fallback blueprint。

### 现有系统设置页结构（参考来源）

- 路径：`wego-app/scenes/系统设置/scene.js` + `scene.css`
- 范式：push 二级页，navbar（back-icon + 居中标题"设置" + 右侧空），phone-body 通栏模式 M1，3 个无标题 cell-group，cell--double/single 混排，trailing slot 有 arrow / text-arrow / dot-arrow 三种
- 退出登录按钮：`.system-settings-logout` + `button.btn--medium.btn--md`（width: 100%）
- 客服链接：`.system-settings-service` + `button.link.link--default`（居中）
- 红点：`.system-settings__dot`（业务作用域，因 badge 无纯 dot 变体；颜色走 `var(--status-danger-default)`）

### biz-rule-config UI Kit 结构（参考）

- 使用 React + Babel standalone 渲染
- 使用 `.uikit-shell` + `.phone-frame` + `.phone-screen` + `.phone-status` + `.phone-indicator` 手机外壳
- 有 BaseScreen（入口页）+ BizSettingsModal（模态页）双层结构
- quality-report.json 字段：kitType / presentation / enterTransition / exitTransition / coversTabBar / screensGenerated / coreComponentsUsed / supportComponentsUsed / previewClassReuseRate / reuseAssessment / a11yFixes / inventedComponents / recommendedRefactors / interactiveStatesRendered / primaryActionPerScreen / mockDataDensity / qualityGates / warnings

### 同步登记现状

- `metadata.json`（version=308）：`uiKits` 数组仅 `biz-rule-config`
- `uikit-plan.json`：`uiKits` 数组、`productContext.selectedFrameNames`、`pagePatterns` 均仅 `biz-rule-config`
- `library-consumption.json`：`consumptionLayers.uikit.files`、`downstreamScenarios.buildMobileAppPage.read`、顶层 `uiKits` 均仅 `biz-rule-config`
- `README.md` / `SKILL.md`：UI Kit 清单仅 `biz-rule-config`

## 拟议变更

### 1. 新增 `.codex/skills/wego-design/ui_kits/system-settings/index.html`

**定位**：设置入口列表 Showcase，演示 push 二级页 + 通栏 M1 + cell-group 分组 + cell 行密度与 trailing slot 变体。

**技术选型**：
- 不使用 React/Babel，改用原生 JS + template literal（页面无状态切换，只有 click→toast，无需前端框架）
- 不使用手机外壳类（`.uikit-shell`/`.phone-frame`/`.phone-screen`/`.phone-status`/`.phone-indicator`）
- 引入 `.uikit-canvas` 简单居中容器（max-width: 420px，desktop 居中，mobile 全宽），承担"屏幕"角色但不模拟手机硬件
- 不引入新组件类、新组件子元素类、新组件修饰类；页面级样式只做布局胶水与业务作用域状态标记

**引入资源**：`../../colors_and_type.css` + `../../scaffold.css`（仅取 base reset 与 `body.uikit-page`）+ `../../iconfont.css` + `../../components.css`

**页面结构**：
```
<body class="uikit-page">
  <div class="uikit-canvas">
    <section class="system-settings-page" data-bg="page">
      <div class="navbar">
        .navbar__body > .navbar__left > .navbar__left-btn > i.wego-iconfont-s.icon-fanhui
        .navbar__center > .navbar__title（"设置"）
        .navbar__right（空）
      </div>
      <div class="phone-body system-settings-body">
        cell-group × 3（无标题，直接 cell-group__content 承载连续 cell）
        + cell 行变体演示（cell--double/single、arrow/text-arrow/dot-arrow、divider 控制）
      </div>
    </section>
  </div>
  <div class="uikit-toast"></div>
</body>
```

**Mock 数据**（抽象自系统设置，但用通用设置项表达范式而非复制原业务文案）：
- Group 1（account）：账号绑定（subtitle + text-arrow "去设置"）、登录密码（subtitle + arrow）
- Group 2（business）：商品设置（subtitle + dot-arrow，演示红点）、订单设置（subtitle + arrow）、通知设置（subtitle + arrow，本组最后一行无分割线）
- Group 3（system）：安全中心（single + arrow）、关于（single + arrow，本组最后一行无分割线）

**交互**：
- 返回按钮：toast "返回"（Showcase 演示，不真实跳转）
- 入口行点击：toast "该功能尚未接入原型"
- toast 用 `.uikit-toast`（fixed 定位、1.5s 自动消失）

**页面级样式（布局胶水，全部 Token 化）**：
- `.uikit-canvas`：max-width 420px、min-height 100dvh、margin 0 auto、background var(--bg-page)、flex column；@media (max-width: 640px) 时 max-width 100%
- `.system-settings-page`：flex column、min-height 100%、flex 1、background var(--bg-page)
- `.system-settings-body`：flex 1、overflow-y auto、gap var(--spacer-8)、padding var(--spacer-8) 0 calc(var(--spacer-40) + var(--safe-area-bottom, 0px))
- `.system-settings__dot`：8x8px、border-radius 50%、background var(--status-danger-default)、margin-right var(--spacer-8)
- `.uikit-toast` + `.is-visible`：固定定位 toast 样式（复用 biz-rule-config 同款样式）

**不包含**：
- 退出登录按钮（`.system-settings-logout`）
- 客服链接（`.system-settings-service`）
- 手机外壳（`.uikit-shell`/`.phone-frame`/`.phone-screen`/`.phone-status`/`.phone-indicator`）

### 2. 新增 `.codex/skills/wego-design/ui_kits/system-settings/quality-report.json`

字段参照 biz-rule-config quality-report.json 结构，内容按 system-settings 范式实际状态填写：

- `kitType`: `"system-settings"`
- `presentation`: `"push"`
- `enterTransition`: `"slide-left"`
- `exitTransition`: `"slide-left-reverse"`（或写 `"back"`）
- `coversTabBar`: `true`
- `screensGenerated`: `1`
- `coreComponentsUsed`: `["navbar", "cell"]`
- `supportComponentsUsed`: `[]`（不使用 button/link，因不包含退出与客服）
- `previewClassReuseRate`：估算值（约 0.95，因大量复用 navbar/cell 契约结构）
- `reuseAssessment`：说明主体已收敛为 navbar + cell-group + cell 的入口列表母版，trailing slot 有 arrow/text-arrow/dot-arrow 三种稳定变体，红点为业务作用域状态标记（badge 无纯 dot 变体）
- `a11yFixes`：可点击 cell 补 role/aria-label/键盘触发；返回按钮补 aria-label
- `inventedComponents`: `[]`
- `recommendedRefactors`: `{}`
- `interactiveStatesRendered`: `["active", "hover", "focus-visible"]`
- `primaryActionPerScreen`: `false`（入口列表范式无页面级主操作，所有操作都是行级跳转）
- `mockDataDensity`：`{ settingSections: 3, doubleRows: 5, singleRows: 2, dotIndicatorRows: 1 }`
- `qualityGates`：
  - `componentDOMCompliance`：核心组件 DOM 与契约一致，不发明 cell 子元素或修饰类
  - `spacingCompliance`：phone-body 8px 组间距、通栏 M1、cell 横向边距由 cell__body 16px padding 承担
- `warnings`：
  - 本 UI Kit 按用户决策不使用手机外壳，仅用 `.uikit-canvas` 简单居中容器；这样避免引入大量外壳相关规则，使 Showcase 聚焦于设置入口列表范式本身；`biz-rule-config` 等其他 UI Kit 仍保持手机外壳
  - 本 UI Kit 不包含退出登录按钮和客服链接，这两者是页面级业务功能，不属于通用设置入口列表范式
  - 红点 `.system-settings__dot` 为业务作用域状态标记，因 badge 组件无纯 dot 形态变体；颜色走 `var(--status-danger-default)` token，不硬编码 hex
  - 入口行点击仅 toast 演示，不实现下钻
  - navbar 通过组件自身 `padding-top: var(--safe-area-top, 0px)` + sticky top: 0 处理顶部避让；本 UI Kit 未设置 `--safe-area-top`，默认回落 0px，适合 Showcase 不模拟状态栏的场景
  - iconfont 图标用于返回（icon-fanhui）和跳转指示器（icon-youjiantou16）

### 3. 更新 `.codex/skills/wego-design/metadata.json`

- `version`：308 → 309
- `uiKits` 数组追加：`{ "slug": "system-settings", "entry": "ui_kits/system-settings/index.html", "qualityReport": "ui_kits/system-settings/quality-report.json" }`

### 4. 更新 `.codex/skills/wego-design/uikit-plan.json`

- `uiKits` 数组追加：`{ "slug": "system-settings", "entry": "ui_kits/system-settings/index.html", "qualityReport": "ui_kits/system-settings/quality-report.json" }`
- `productContext.selectedFrameNames` 追加：`"ui_kits/system-settings/index.html"`
- `pagePatterns` 数组追加新范式条目：
  ```json
  {
    "name": "系统设置入口列表",
    "slug": "system-settings",
    "applicableScenarios": ["系统设置", "个人设置", "业务设置", "应用设置", "通用设置入口列表"],
    "interactionPattern": "入口列表导航，点击行进入下一层；不做编辑、不做统一保存",
    "priority": "highest-for-entry-list-settings-pages",
    "presentation": "push",
    "transition": "slide-left",
    "dismissAction": "back",
    "overlayLevel": "scene-layer",
    "coversTabBar": true,
    "componentSlugs": ["navbar", "cell"],
    "uikitFile": "ui_kits/system-settings/index.html",
    "specRef": "specs/交互设计原则.md#页面模式与转场",
    "structureHighlights": [
      "使用 push 二级页导航，navbar 左侧返回图标（icon-fanhui）+ 居中标题，右侧留空",
      "通栏模式 M1：phone-body 0px 横向 padding + cell-group__content 不开 --card 修饰；cell 横向边距由 cell__body 自带 16px padding 承担",
      "分组使用 cell-group（无标题时直接用 cell-group__content 承载连续 cell，不发明 scene 级 xxx-page__group 自定义类）",
      "cell 行密度：有副标题用 cell--double，无副标题用 cell--single",
      "同一 cell-group 内最后一行不加分割线，其余行加 cell--divider-right-edge",
      "trailing slot 稳定变体：arrow（仅箭头）、text-arrow（cell__action-text + 箭头）、dot-arrow（业务作用域红点 + 箭头）",
      "红点为业务作用域状态标记（badge 无纯 dot 变体），使用 var(--status-danger-default) token，限定在 cell__action 内",
      "不包含退出登录按钮和客服链接（页面级业务功能，不属于通用设置入口列表范式）"
    ],
    "templates": ["系统设置", "个人设置", "业务设置", "通用设置入口列表"],
    "compositionConstraints": []
  }
  ```
- `screenBlueprints` 中"我的/资料编辑"或"业务规则配置/权限"不改；本范式不强制新增 screenBlueprint（push 设置页可复用现有 navbar+cell 组合）
- `warnings` 数组按需补一条："系统设置入口列表型页面命中 system-settings pagePattern；编辑型设置页仍优先命中 biz-rule-config"

### 5. 更新 `.codex/skills/wego-design/library-consumption.json`

- `consumptionLayers.uikit.files` 追加：
  - `"ui_kits/system-settings/index.html"`
  - `"ui_kits/system-settings/quality-report.json"`
- `downstreamScenarios.buildMobileAppPage.read` 追加：`"ui_kits/system-settings/index.html"`（与 biz-rule-config 并列，作为设置入口列表型页面的参考蓝本）
- 顶层 `uiKits` 数组追加：`"system-settings"`
- `downstreamScenarios.buildMobileAppPage.consume` 文案补一句："入口列表型设置页优先参考 ui_kits/system-settings/index.html；编辑型设置页优先参考 ui_kits/biz-rule-config/index.html"

### 6. 更新 `.codex/skills/wego-design/README.md`

- "当前 UI Kit" 章节：在 `biz-rule-config` 条目下方追加 `system-settings` 条目，说明用于观察系统设置/个人设置/业务设置等入口列表型页面的页面范式
- 补一句定位说明：`system-settings` 的重点是 push 二级页导航、通栏入口列表、cell 行密度与 trailing slot 变体；它不是编辑型设置页（编辑型走 `biz-rule-config`）

### 7. 更新 `.codex/skills/wego-design/SKILL.md`

- 根目录结构示意中 `ui_kits/` 子目录补 `system-settings/`：
  ```
  ├── ui_kits/
  │   ├── biz-rule-config/
  │   └── system-settings/
  ```
- 不新增消费规则（UI Kit 只作结构参考，消费规则由现有 library-consumption.json 统一约束）

## 假设与决策

1. **slug = `system-settings`**：用户确认。虽然 `settings-entry-list` 语义更通用，但用户选了 `system-settings`，作为目录名与 pagePattern slug。
2. **不修改现有 wego-app/scenes/系统设置/**：用户确认"场景的不要动"。现有场景保留退出登录与客服教我，因为那是该页真实业务功能；UI Kit 只抽象通用入口列表范式。
3. **不使用手机外壳**：用户明确要求。改用 `.uikit-canvas` 简单居中容器。这是对 sync-matrix.md / workflow.md 中"必须保持 .uikit-shell/.phone-frame/.phone-screen 演示外壳"规则的定向例外，仅适用于本 UI Kit；biz-rule-config 等其他 UI Kit 不受影响。本例外通过 quality-report.json warnings 显式记录，不修改全局规则。
4. **使用原生 JS 而非 React**：页面无状态切换，只有 click→toast，无需前端框架；避免 CDN 依赖，更简洁。
5. **pagePattern.presentation = push**：与系统设置页 scene.js 的 `presentation.type=push, transition=slide-left, coversTabBar=true` 一致；与 biz-rule-config 的 full-screen-modal 区分。
6. **不新增 compositionConstraints**：cell 的行密度、trailing slot 变体、divider 规则均由 cell 组件契约（representativeVariants + structurePatterns）承接，不重复定义。
7. **不新增 screenBlueprint**：push 设置页可由 navbar+cell 自然组合，无需独立蓝图。
8. **mock 数据用通用设置项**：不复制原系统设置页的具体业务文案（如"产品与笔记""粉丝设置"），改用更通用的"账号绑定""商品设置""订单设置"等，表达范式而非特定业务。

## 验证步骤

1. **静态扫描**：
   - 确认 `ui_kits/system-settings/index.html` 不含 `.uikit-shell`/`.phone-frame`/`.phone-screen`/`.phone-status`/`.phone-indicator`
   - 确认不含退出登录按钮（`.system-settings-logout`）和客服链接（`.system-settings-service`）
   - 确认所有颜色/间距使用 `var(--token)`，无硬编码 hex/rem
   - 确认不发明未注册组件类、子元素类、修饰类
   - 确认 cell-group/cell/navbar 的 DOM 与组件契约一致

2. **脚本校验**：
   - 仓库根执行 `node scripts/validate-wego-design.mjs`，确认 JSON 格式、Token 同步、组件三向对齐、UI Kit 成对、过期路径、禁止文件、metadata version 全部通过
   - 若脚本校验手机外壳使用情况并报错，按报错信息处理（可能需要在 quality-report.json 补例外说明，或脚本本身不检查此项）

3. **资源与结构检查**：
   - 确认 `metadata.json.version` 已递增（308 → 309）
   - 确认 `metadata.json.uiKits`、`uikit-plan.json.uiKits`、`library-consumption.json.uiKits`（顶层）三处同步登记
   - 确认 `uikit-plan.json.productContext.selectedFrameNames` 已追加
   - 确认 `uikit-plan.json.pagePatterns` 已追加新范式
   - 确认 `library-consumption.json.consumptionLayers.uikit.files` 已追加两条
   - 确认 `library-consumption.json.downstreamScenarios.buildMobileAppPage.read` 已追加
   - 确认 `README.md` 与 `SKILL.md` UI Kit 清单已同步

4. **本地预览**（可选，由用户决定是否打开浏览器）：
   - 本地直接打开 `ui_kits/system-settings/index.html`，确认页面渲染、toast 交互、返回按钮、入口行点击均正常
   - 桌面端居中容器、移动端全宽均成立

5. **风险说明**：
   - 本 UI Kit 不使用手机外壳，是对既有规则的定向例外；若后续有第三种 UI Kit 想跟随此例外，应考虑回流到 sync-matrix.md / workflow.md 做通用化规则升级
   - 红点 `.system-settings__dot` 仍为业务作用域样式，未回流到 badge 组件作为纯 dot 变体；若未来多个设置类页面都需要红点，应考虑回流到 badge 契约
   - 未执行浏览器自动化验证（按 workflow.md 第 9 节，默认不主动拉起浏览器）
