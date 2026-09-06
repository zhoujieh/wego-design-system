# 移除 UI Kit 手机壳 + 新增 system-settings UI Kit

## 摘要

本计划合并两件事：
1. **移除所有 UI Kit 的手机外壳**（包括 biz-rule-config 和新增的 system-settings），改用简单居中容器 `.uikit-canvas`；同步清理所有"UI Kit 必须使用手机外壳"的强制规则，避免残留
2. **新增 system-settings UI Kit**，抽象自现有 `wego-app/scenes/系统设置/` 的"设置入口列表"范式，作为系统级各业务场景设置页的通用 Showcase

**不动的部分**：
- `wego-app/index.html` 的手机外壳（`.preview-shell`/`.phone-frame`/`.phone-screen`/`.phone-status`/`.phone-indicator`）保留
- `wego-app/css/app.css`、`wego-ux/templates/host-shell.*`、`wego-ux/templates/page-shell.html`、`wego-ux/templates/page.css` 保留
- `wego-app/scenes/系统设置/` 现有场景不动（退出登录与客服教我是该页真实业务功能）
- preview/component-*.html 仍在使用 `.preview-phone` + `.phone-screen`，scaffold.css 中的预览页样式保留

## 当前状态分析

### 现有 UI Kit 全集

仅 `biz-rule-config` 一个，使用 React + 手机外壳（`.uikit-shell` + `.phone-frame` + `.phone-screen` + `.phone-status` + `.phone-indicator`），定位是"业务规则配置 / edit-then-save / full-screen-modal 编辑型"。

### 手机外壳强制规则分布（审计结果）

| 文件 | 位置 | 规则原文摘要 | 处理方式 |
|---|---|---|---|
| `library-consumption.json` | `uikitConstraints.previewShellPolicy.appliesTo` | 含 `"ui_kits/*/index.html"` | 移除该项，保留 wego-ux/templates 和 wego-app |
| `library-consumption.json` | `uikitConstraints.outerShells` | `[".uikit-shell", ".preview-shell", ".phone-frame", ".phone-screen"]` | 保留（wego-app 仍在用） |
| `uikit-plan.json` | `hostShell.previewShellPolicy.appliesTo` | 含 `"ui_kits/*/index.html"` | 移除该项 |
| `wego-uxsystem-iterate/references/sync-matrix.md` | 第 209 行 | "必须保持 `.uikit-shell`、`.phone-frame`、`.phone-screen` 等演示外壳" | 改为"UI Kit 可选使用手机外壳；若使用须遵循 previewShellPolicy" |
| `wego-uxsystem-iterate/references/workflow.md` | 第 153 行 | "验证新 UI Kit 是否符合...且保持 `.uikit-shell`、`.phone-frame`、`.phone-screen` 演示外壳" | 同上，改为可选 |
| `scaffold.css` | 第 119-217 行 | `body.uikit-page`、`.uikit-shell`、`.phone-frame`、`.phone-indicator` 等样式 + `@media` 块 | 删除 UI Kit 专属外壳样式，保留预览页样式 |
| `biz-rule-config/index.html` | 第 14-31、145-179、192-207 行 | 自定义 `.phone-status` + `.uikit-shell` + `.phone-frame` + `.phone-screen#root` + StatusBar + HomeIndicator | 移除手机外壳，改用 `.uikit-canvas` 容器 |
| `biz-rule-config/quality-report.json` | 第 49、55 行 | 提到 phone-status/phone-indicator 的 warnings | 更新 warnings，移除手机外壳相关描述 |

### 现有系统设置页结构（参考来源）

- 路径：`wego-app/scenes/系统设置/scene.js` + `scene.css`
- 范式：push 二级页，navbar（back-icon + 居中标题"设置" + 右侧空），phone-body 通栏模式 M1，3 个无标题 cell-group，cell--double/single 混排，trailing slot 有 arrow / text-arrow / dot-arrow 三种
- 红点：`.system-settings__dot`（业务作用域，因 badge 无纯 dot 变体；颜色走 `var(--status-danger-default)`）

### 守门脚本现状

`scripts/validate-wego-design.mjs` 的 `uikit.preview_shell_responsive_missing` 检查是**条件式**的："UI Kit **使用**手机预览外壳**时**，必须包含移动端隐藏外壳视觉的 media query"。如果 UI Kit 不使用手机外壳，该检查自动通过，无需修改脚本逻辑。`ALLOWED_UIKIT_SHELL_CLASSES` 白名单保留（不影响不使用外壳的 UI Kit）。

## 拟议变更

### 第 1 部分：移除 UI Kit 手机外壳 + 清理规则

#### 1.1 修改 `.codex/skills/wego-design/ui_kits/biz-rule-config/index.html`

- 删除 `<style>` 中的 `.phone-status` 自定义样式（第 14-31 行）
- 删除 `@media (max-width: 767px)` 中针对 `.uikit-shell`/`.phone-frame`/`.phone-screen` 的响应式块（第 145-171 行）
- 把 `<body class="uikit-page">` 下 `<div class="uikit-shell"><div class="phone-frame"><div class="phone-screen" id="root">` 简化为 `<div class="uikit-canvas" id="root">`
- 删除 React 中的 `StatusBar` 和 `HomeIndicator` 组件及其渲染
- 在 `<style>` 中新增 `.uikit-canvas` 样式（max-width 420px、min-height 100dvh、margin 0 auto、background var(--bg-page)、flex column；@media max-width 640px 时 max-width 100%）
- 保留 `.uikit-modal-screen`、`.uikit-toast` 等业务展示样式（与手机外壳无关）
- 保留 React 的模态打开/关闭逻辑，只是去掉手机外壳包裹层

#### 1.2 修改 `.codex/skills/wego-design/ui_kits/biz-rule-config/quality-report.json`

- 删除 warnings 中关于 `phone-status`/`phone-indicator` 的两条
- 新增一条 warning："本 UI Kit 已移除手机外壳，改用 `.uikit-canvas` 简单居中容器；不再模拟状态栏和 Home 指示器，navbar 默认 0px 顶部安全区"

#### 1.3 修改 `.codex/skills/wego-design/scaffold.css`

删除 UI Kit 专属外壳样式：
- `body.uikit-page`（第 119-123 行）
- `.uikit-shell`（第 124-135 行）
- `.phone-frame`（第 136-151 行）—— 注意 scaffold.css 中的 `.phone-frame` 仅 UI Kit 使用；wego-app 的 `.phone-frame` 在 `wego-app/css/app.css` 和 `wego-ux/templates/host-shell.css` 中独立维护，不受影响
- `.phone-indicator` 与 `.phone-indicator-bar`（第 176-195 行）
- `@media (max-width: 640px)` 中针对 `.uikit-shell`/`.phone-frame` 的响应式块（第 197-217 行中的相关部分）

保留：
- base reset（第 16-27 行）
- `.phone-screen` 及其 safe-area 变量（第 9-14、152-175 行）—— preview/component-*.html 仍在使用
- `.phone-body`（第 167-175 行）—— preview 页面可能使用
- `.preview-phone` 及其子选择器（第 100-117 行）
- `.pv-header`/`.pv-section`/`.row`/`.stack-*`/`.label`/`.page`/`.section-group`/`.section-gap`（第 29-98 行）
- `.dark-strip`/`.demo-hint`/`.interactive-row`/`.interactive-text`（第 219-254 行）

#### 1.4 修改 `.codex/skills/wego-design/library-consumption.json`

- `uikitConstraints.previewShellPolicy.appliesTo`：移除 `"ui_kits/*/index.html"`，保留 `"../wego-ux/templates/*.html"` 和 `"wego-app/index.html"`
- `uikitConstraints.previewShellPolicy.desktop`/`mobile`/`boundary`/`statusBarRule`：保留（仍适用于 wego-app 和 templates）
- `uikitConstraints.warningForDownstream`：更新文案，明确"UI Kit 不再使用手机外壳，只通过 .uikit-canvas 简单居中容器承载；wego-app 仍保留手机外壳"
- `uikitConstraints.outerShells`：保留（wego-app 仍在用）
- `downstreamScenarios.buildMobileAppPage.consume` 中关于"所有场景使用同链接预览外壳规则"的文案：更新为"UI Kit 不再使用手机外壳；wego-app/index.html 仍保留手机外壳，电脑端显示、移动端同链接隐藏"
- `downstreamScenarios.buildMobileAppPage.recommendedWorkflow` 中"复核电脑端手机壳、移动端全屏"：更新为"复核 wego-app 电脑端手机壳、移动端全屏"
- `scenarioTypeRegistry.types[]` 中 `uikit-to-production-transform` 的 `judgmentLogic`：更新，移除"UI Kit 的 .uikit-shell/.phone-frame/.phone-screen"表述，改为"UI Kit 通过 .uikit-canvas 简单居中容器承载，不使用手机外壳；wego-app 的 .preview-shell/.phone-frame/.phone-screen 是宿主预览外壳"

#### 1.5 修改 `.codex/skills/wego-design/uikit-plan.json`

- `hostShell.previewShellPolicy.appliesTo`：移除 `"ui_kits/*/index.html"`，保留 `"../wego-ux/templates/host-shell.*"`、`"../wego-ux/templates/page-shell.html"`、`"wego-app/index.html"`
- `hostShell.previewShellPolicy` 其他字段保留（仍适用于 wego-app 和 templates）
- `warnings[]` 中"手机预览外壳是全局预览能力"：更新为"wego-app/index.html 的手机预览外壳是全局预览能力：电脑端显示，移动端同链接隐藏；UI Kit 不再使用手机外壳，改用 .uikit-canvas 简单居中容器"
- `fallbackPageBlueprints[0].forbidden` 中 `[".uikit-shell", ".phone-frame", ".phone-screen"]`：保留（仍禁止业务场景复制这些类）

#### 1.6 修改 `.codex/skills/wego-uxsystem-iterate/references/sync-matrix.md`

- "新增 UI Kit" 章节的"限制"中"必须保持 `.uikit-shell`、`.phone-frame`、`.phone-screen` 等演示外壳"：改为"UI Kit 不再使用手机外壳，改用 `.uikit-canvas` 简单居中容器；`.uikit-shell`/`.phone-frame`/`.phone-screen` 仅保留给 wego-app 和 preview/component-*.html 使用"
- "改 UI Kit" 章节的"限制"中"不把 `.uikit-shell`、`.phone-frame`、`.phone-screen`、`biz-*` 等 Showcase 演示外壳或业务样式误升级成通用组件"：保留（仍是禁止项，只是 UI Kit 不再使用它们）

#### 1.7 修改 `.codex/skills/wego-uxsystem-iterate/references/workflow.md`

- 第 3.2 节"新增 UI Kit 发布标准步骤"第 10 步"验证新 UI Kit 是否符合移动端、微信生态、电商/工具场景，且保持 `.uikit-shell`、`.phone-frame`、`.phone-screen` 演示外壳"：改为"验证新 UI Kit 是否符合移动端、微信生态、电商/工具场景，且使用 `.uikit-canvas` 简单居中容器承载页面内容"
- 第 3.1 节"改 UI Kit 标准步骤"第 4 步"演示外壳"检查项：更新为"`.uikit-canvas` 居中容器是否正确承载页面内容"
- 第 8 节"常见拦截"中"用户要求把 UI Kit 外壳升级为通用组件"：保留（仍是拦截项），但更新文案为"UI Kit 已不再使用手机外壳；若用户要求把 `.uikit-canvas` 或其他 Showcase 样式升级为通用组件，仍按原拦截流程处理"

#### 1.8 修改 `.codex/skills/wego-design/README.md`

- "消费原则"章节中"手机外壳是 `wego-app/index.html` 的全局预览能力"：保留（仍准确）
- 不需要新增 UI Kit 手机外壳相关说明（因为 UI Kit 不再使用手机外壳）

#### 1.9 修改 `.codex/skills/wego-design/SKILL.md`

- "禁止事项"中"不把 `.uikit-shell`、`.phone-frame`、`.phone-screen` 当作业务页面结构"：保留（仍禁止业务场景使用这些类）

### 第 2 部分：新增 system-settings UI Kit

#### 2.1 新增 `.codex/skills/wego-design/ui_kits/system-settings/index.html`

**定位**：设置入口列表 Showcase，演示 push 二级页 + 通栏 M1 + cell-group 分组 + cell 行密度与 trailing slot 变体。

**技术选型**：
- 不使用 React/Babel，改用原生 JS + template literal（页面无状态切换，只有 click→toast，无需前端框架）
- 不使用手机外壳类，改用 `.uikit-canvas` 简单居中容器（与 biz-rule-config 改造后一致）
- 不引入新组件类、新组件子元素类、新组件修饰类；页面级样式只做布局胶水与业务作用域状态标记

**引入资源**：`../../colors_and_type.css` + `../../scaffold.css`（base reset）+ `../../iconfont.css` + `../../components.css`

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

注意：`body.uikit-page` 类已在 scaffold.css 中删除（第 1.3 步），但保留 `<body class="uikit-page">` 不会报错（class 存在但无对应样式是无害的）；为保持一致，本 UI Kit 也不使用 `uikit-page` class，直接用默认 body 样式。实际上 scaffold.css 删除 `body.uikit-page` 后，body 默认 padding 32px（来自 `body { padding: 32px; }`）。为了让 .uikit-canvas 铺满，需要在 .uikit-canvas 样式中覆盖或在新 UI Kit 的 `<style>` 中重置 `body { padding: 0; }`。为统一，biz-rule-config 和 system-settings 都在自己的 `<style>` 中补 `body { padding: 0; }`。

**Mock 数据**（抽象自系统设置，用通用设置项表达范式）：
- Group 1（account）：账号绑定（subtitle + text-arrow "去设置"）、登录密码（subtitle + arrow）
- Group 2（business）：商品设置（subtitle + dot-arrow，演示红点）、订单设置（subtitle + arrow）、通知设置（subtitle + arrow，本组最后一行无分割线）
- Group 3（system）：安全中心（single + arrow）、关于（single + arrow，本组最后一行无分割线）

**交互**：
- 返回按钮：toast "返回"
- 入口行点击：toast "该功能尚未接入原型"
- toast 用 `.uikit-toast`（fixed 定位、1.5s 自动消失）

**页面级样式（布局胶水，全部 Token 化）**：
- `body { padding: 0; }`（覆盖 scaffold.css 默认 32px）
- `.uikit-canvas`：max-width 420px、min-height 100dvh、margin 0 auto、background var(--bg-page)、display flex、flex-direction column
- `.system-settings-page`：flex 1、display flex、flex-direction column、min-height 100%、background var(--bg-page)
- `.system-settings-body`：flex 1、overflow-y auto、display flex、flex-direction column、gap var(--spacer-8)、padding var(--spacer-8) 0 calc(var(--spacer-40) + var(--safe-area-bottom, 0px))
- `.system-settings__dot`：8x8px、border-radius 50%、background var(--status-danger-default)、margin-right var(--spacer-8)、flex-shrink 0
- `.uikit-toast` + `.is-visible`：固定定位 toast 样式
- `@media (max-width: 640px)`：`.uikit-canvas { max-width: 100%; }`

**不包含**：
- 退出登录按钮（`.system-settings-logout`）
- 客服链接（`.system-settings-service`）
- 手机外壳（`.uikit-shell`/`.phone-frame`/`.phone-screen`/`.phone-status`/`.phone-indicator`）

#### 2.2 新增 `.codex/skills/wego-design/ui_kits/system-settings/quality-report.json`

字段参照 biz-rule-config quality-report.json 结构：

- `kitType`: `"system-settings"`
- `presentation`: `"push"`
- `enterTransition`: `"slide-left"`
- `exitTransition`: `"back"`
- `coversTabBar`: `true`
- `screensGenerated`: `1`
- `coreComponentsUsed`: `["navbar", "cell"]`
- `supportComponentsUsed`: `[]`
- `previewClassReuseRate`: `0.95`
- `reuseAssessment`: "主体已收敛为 navbar + cell-group + cell 的入口列表母版，trailing slot 有 arrow/text-arrow/dot-arrow 三种稳定变体，红点为业务作用域状态标记（badge 无纯 dot 变体）"
- `a11yFixes`: ["可点击 cell 补 role/aria-label/键盘触发", "返回按钮补 aria-label"]
- `inventedComponents`: `[]`
- `recommendedRefactors`: `{}`
- `interactiveStatesRendered`: `["active", "hover", "focus-visible"]`
- `primaryActionPerScreen`: `false`
- `mockDataDensity`: `{ "settingSections": 3, "doubleRows": 5, "singleRows": 2, "dotIndicatorRows": 1 }`
- `qualityGates`:
  - `componentDOMCompliance`: DOM 与契约一致，不发明 cell 子元素或修饰类
  - `spacingCompliance`: phone-body 8px 组间距、通栏 M1、cell 横向边距由 cell__body 16px padding 承担
- `warnings`:
  - 本 UI Kit 不使用手机外壳，改用 .uikit-canvas 简单居中容器
  - 本 UI Kit 不包含退出登录按钮和客服链接（页面级业务功能，不属于通用设置入口列表范式）
  - 红点 .system-settings__dot 为业务作用域状态标记，因 badge 无纯 dot 形态变体；颜色走 var(--status-danger-default) token
  - 入口行点击仅 toast 演示，不实现下钻
  - navbar 通过组件自身 padding-top: var(--safe-area-top, 0px) + sticky top: 0 处理顶部避让；本 UI Kit 未设置 --safe-area-top，默认回落 0px
  - iconfont 图标用于返回（icon-fanhui）和跳转指示器（icon-youjiantou16）

#### 2.3 更新 `.codex/skills/wego-design/metadata.json`

- `version`：308 → 309
- `uiKits` 数组追加：`{ "slug": "system-settings", "entry": "ui_kits/system-settings/index.html", "qualityReport": "ui_kits/system-settings/quality-report.json" }`

#### 2.4 更新 `.codex/skills/wego-design/uikit-plan.json`

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
- `warnings` 数组补一条："系统设置入口列表型页面命中 system-settings pagePattern；编辑型设置页仍优先命中 biz-rule-config"

#### 2.5 更新 `.codex/skills/wego-design/library-consumption.json`

- `consumptionLayers.uikit.files` 追加：
  - `"ui_kits/system-settings/index.html"`
  - `"ui_kits/system-settings/quality-report.json"`
- `downstreamScenarios.buildMobileAppPage.read` 追加：`"ui_kits/system-settings/index.html"`
- 顶层 `uiKits` 数组追加：`"system-settings"`
- `downstreamScenarios.buildMobileAppPage.consume` 补一句："入口列表型设置页优先参考 ui_kits/system-settings/index.html；编辑型设置页优先参考 ui_kits/biz-rule-config/index.html"

#### 2.6 更新 `.codex/skills/wego-design/README.md`

- "当前 UI Kit" 章节：在 `biz-rule-config` 条目下方追加 `system-settings` 条目，说明用于观察系统设置/个人设置/业务设置等入口列表型页面的页面范式
- 补定位说明：`system-settings` 的重点是 push 二级页导航、通栏入口列表、cell 行密度与 trailing slot 变体；它不是编辑型设置页（编辑型走 `biz-rule-config`）

#### 2.7 更新 `.codex/skills/wego-design/SKILL.md`

- 根目录结构示意中 `ui_kits/` 子目录补 `system-settings/`：
  ```
  ├── ui_kits/
  │   ├── biz-rule-config/
  │   └── system-settings/
  ```

## 假设与决策

1. **移除所有 UI Kit 手机壳**：用户确认。包括 biz-rule-config 和新 system-settings。wego-app 手机壳保留。
2. **scaffold.css 删除 UI Kit 专属外壳样式，保留预览页样式**：scaffold.css 仍服务 preview/component-*.html；删除 `body.uikit-page`/`.uikit-shell`/`.phone-frame`/`.phone-indicator` 等 UI Kit 专属样式，保留 `.preview-phone`/`.phone-screen`/`.pv-*` 等预览页样式。
3. **`.uikit-canvas` 作为 UI Kit 通用居中容器**：max-width 420px、min-height 100dvh、margin 0 auto；每个 UI Kit 在自己的 `<style>` 中补 `body { padding: 0; }` 覆盖 scaffold.css 默认 32px。
4. **守门脚本不需要修改**：`uikit.preview_shell_responsive_missing` 是条件式检查（"使用手机外壳时..."），UI Kit 不使用外壳时自动通过；`ALLOWED_UIKIT_SHELL_CLASSES` 白名单保留，不影响不使用外壳的 UI Kit。
5. **`body.uikit-page` class 不再使用**：scaffold.css 删除该样式后，UI Kit 页面不再添加 `class="uikit-page"` 到 body；为保持 body 默认 padding: 0，每个 UI Kit 在自己 `<style>` 中重置 `body { padding: 0; }`。
6. **不修改 wego-app 专属规则**：`wego-app/index.html`、`wego-app/css/app.css`、`wego-ux/templates/host-shell.*`、`wego-ux/templates/page-shell.html`、`wego-ux/templates/page.css` 中的手机外壳保留。
7. **不修改 specs/ 中的条件规则**：`specs/预览页脚手架规范.md`、`specs/布局与间距规范.md`、`specs/交互设计原则.md` 中关于 `.phone-screen` 的条件规则保留（wego-app 和 preview 页仍在使用）。
8. **不修改 wego-ux/SKILL.md、wego-tests/SKILL.md**：这些文件中的"业务场景不得复制外壳类"规则保留（仍正确）。
9. **slug = `system-settings`**：用户确认。
10. **不修改现有 wego-app/scenes/系统设置/**：用户确认"场景的不要动"。
11. **pagePattern.presentation = push**：与系统设置页 scene.js 一致。
12. **mock 数据用通用设置项**：不复制原系统设置页具体业务文案。

## 验证步骤

1. **静态扫描**：
   - 确认 `ui_kits/system-settings/index.html` 不含 `.uikit-shell`/`.phone-frame`/`.phone-screen`/`.phone-status`/`.phone-indicator`
   - 确认 `ui_kits/biz-rule-config/index.html` 已移除手机外壳类
   - 确认两个 UI Kit 都不含退出登录按钮和客服链接（system-settings 不含；biz-rule-config 本来就不含）
   - 确认所有颜色/间距使用 `var(--token)`，无硬编码 hex/rem
   - 确认 cell-group/cell/navbar 的 DOM 与组件契约一致

2. **手机外壳规则残留扫描**：
   - 在 `.codex/skills/` 下搜索 `ui_kits/*/index.html` 与"必须保持 .uikit-shell"等强制表述，确认无残留
   - 确认 `library-consumption.json` 和 `uikit-plan.json` 的 `previewShellPolicy.appliesTo` 已移除 `ui_kits/*/index.html`
   - 确认 `wego-uxsystem-iterate/references/sync-matrix.md` 和 `workflow.md` 中"必须保持外壳"已改为可选或删除
   - 确认 `scaffold.css` 中 UI Kit 专属外壳样式已删除

3. **wego-app 手机壳保留确认**：
   - 确认 `wego-app/index.html` 的 `.preview-shell`/`.phone-frame`/`.phone-screen`/`.phone-status`/`.phone-indicator` 仍在
   - 确认 `wego-app/css/app.css` 外壳样式仍在
   - 确认 `wego-ux/templates/host-shell.*` 和 `page-shell.*` 仍在

4. **脚本校验**：
   - 仓库根执行 `node scripts/validate-wego-design.mjs`，确认全部通过
   - 若报错，按报错信息处理

5. **资源与结构检查**：
   - 确认 `metadata.json.version` 已递增（308 → 309）
   - 确认 `metadata.json.uiKits`、`uikit-plan.json.uiKits`、`library-consumption.json.uiKits`（顶层）三处同步登记 system-settings
   - 确认 `uikit-plan.json.productContext.selectedFrameNames` 已追加
   - 确认 `uikit-plan.json.pagePatterns` 已追加新范式
   - 确认 `library-consumption.json.consumptionLayers.uikit.files` 已追加两条
   - 确认 `library-consumption.json.downstreamScenarios.buildMobileAppPage.read` 已追加
   - 确认 `README.md` 与 `SKILL.md` UI Kit 清单已同步

6. **本地预览**（可选）：
   - 本地直接打开 `ui_kits/system-settings/index.html`，确认页面渲染、toast 交互、返回按钮、入口行点击均正常
   - 本地打开 `ui_kits/biz-rule-config/index.html`，确认移除手机外壳后模态打开/关闭、保存 toast 仍正常
   - 桌面端居中容器、移动端全宽均成立

7. **风险说明**：
   - 移除 biz-rule-config 手机外壳是结构性改动，需确认模态层 `.uikit-modal-screen` 在 `.uikit-canvas` 内仍能正确定位（原本依赖 `.phone-screen` 的 `position: relative`）
   - 红点 `.system-settings__dot` 仍为业务作用域样式，未回流到 badge 组件作为纯 dot 变体
   - 未执行浏览器自动化验证（按 workflow.md 第 9 节，默认不主动拉起浏览器）
