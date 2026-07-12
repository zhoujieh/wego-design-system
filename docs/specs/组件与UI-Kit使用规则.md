# 组件与 UI Kit 使用规则

本文档由系统规则自动生成，用于人工检查。请勿直接修改；如需调整规则，应修改对应权威来源后重新生成。

## 阅读方式

本目录按工作阶段编排。每个“权威规则全文”小节均标明来源；生成文档仅供阅读，不是运行时规则来源。

## 阶段目标

从已登记组件、页面范式和兜底蓝图中选择，不新增未登记的结构或样式能力。

## 速查

### 页面范式、选择优先级与兜底蓝图

来源：`.codex/skills/wego-design/uikit-plan.json`

#### 选择优先级

1. 页面是否有页面级保存按钮（或需要统一提交后生效）？
2. 页面主要内容是导航入口（箭头跳转）还是编辑控件（表单、单选、多选等）？
3. 导航入口和编辑控件混合且占比相近时？

#### 已登记页面范式

#### 业务规则配置（`biz-rule-config`）

- 适用：业务规则配置、业务参数编辑、权限管理、库存规则维护、发货规则维护、业务数据编辑
- 打开方式：full-screen-modal
- 交互：编辑后统一保存，页面级主操作收口，不在内容区和底部重复堆叠保存动作
- 组件：navbar、form、cell、checkbox、switch、radio、tag、link
#### 系统设置（`system-settings`）

- 适用：系统设置、应用设置、账号设置、通用设置、App 设置
- 打开方式：push
- 交互：层级导航,从右侧 push 进入,返回按钮收口;设置项按账号/业务/系统三组分类,整行点击进入下一层
- 组件：navbar、cell

#### 兜底蓝图

#### 移动端宿主页入口（`mobile-host-entry`）

- 适用条件：页面角色为 host-entry；页面只承接打开入口、当前状态摘要、保存回填或结果概览；没有精确命中的 pagePattern，但可用移动端基础组件安全组成
- 允许组件：navbar、cell、button、tag、card、link
#### 对象管理列表页（`object-management-list-page`）

- 适用条件：页面角色为 primary-task-page；主任务是管理一组可新增、编辑、删除、启停或进入详情的业务对象；列表项包含对象识别物、名称、关键状态、摘要和至少一个操作；现有 UI Kit/pagePattern 无精确范式，但可由已注册组件和页面级业务样式安全组成
- 允许组件：navbar、search、card、image、tag、button、link、dialog、toast
#### 连续内容流页面（`continuous-content-feed-page`）

- 适用条件：页面角色为 primary-task-page；主任务是连续浏览多条内容并快速判断是否下钻或执行轻操作；单条内容同时可能包含发布信息、正文、媒体、对象摘要和轻操作；现有 UI Kit/pagePattern 无精确范式，但可由已注册组件和页面级业务样式安全组成
- 允许组件：navbar、avatar、image、card、tag、metric、link、button、actionsheet、toast
#### 对象详情页（`object-detail-page`）

- 适用条件：页面角色为 secondary-task-page；主任务是呈现单个业务对象的完整信息并支持少量操作；页面通常从列表或内容流下钻进入；现有 UI Kit/pagePattern 无精确范式，但可由已注册组件和页面级业务样式安全组成
- 允许组件：navbar、image、card、tag、metric、link、button、cell、actionsheet、toast
#### 通用移动任务页（`generic-mobile-task-page`）

- 适用条件：页面角色为 primary-task-page；现有 UI Kit/pagePattern 无精确范式；任务可由已注册组件、section 分组和规范约束完成
- 允许组件：navbar、search、form、cell、input、button、tag、link、switch、radio、checkbox
#### 二级选择列表页（`selection-list-page`）

- 适用条件：页面角色为 secondary-task-page；核心任务是单选、多选、创建后回填或列表选择；没有独立 UI Kit，但可由 cell + radio/checkbox/tag 承接
- 允许组件：navbar、cell、radio、checkbox、tag、button、link、input

## 权威规则全文

### 设计系统消费边界

来源：`.codex/skills/wego-design/library-consumption.json`

{
  "schemaVersion": 3,
  "tokenSource": "css.json",
  "uikitPlan": "uikit-plan.json",
  "componentsIndex": "components/index.json",
  "componentContractDir": "components",
  "componentsCss": "components.css",
  "tokenCss": "colors_and_type.css",
  "iconFontCss": "iconfont.css",
  "previewDir": "preview",
  "uiKitsDir": "ui_kits",
  "specsDir": "specs",
  "consumptionLayers": {
    "tokens": {
      "files": [
        "colors_and_type.css",
        "css.json"
      ],
      "copyable": true,
      "purpose": "微购视觉语言源头，包含完整 palette 色阶、bg/text/icon/border/status 公共语义、排版角色、间距、圆角、阴影、动效和尺寸 Token"
    },
    "components": {
      "files": [
        "components.css",
        "components/index.json",
        "components/{slug}.json",
        "preview/component-{slug}.html"
      ],
      "copyable": true,
      "purpose": "组件级结构、class、状态、尺寸和使用边界",
      "downstreamRule": "优先读取 components/index.json 确认可用组件，再读取对应契约和预览页；复制组件 markup 时同时链接 colors_and_type.css、iconfont.css 和 components.css。命中连续列表/表单分组时，优先消费 `.cell-group` / `.form-group` 的正式结构：标题使用 group 自带 title 节点，连续内容放进 group 自带 content 容器；当 phone-body 或等价宿主内容层承担横向留白时，在 content 容器上开启卡片修饰类；当分组内容直接通栏贴边排列时，不开启卡片修饰类；整行点击只保留给带箭头、会进入下一层或展开选择面板的行式场景，右侧为 switch、radio-group、checkbox-group、button 等独立控件时由控件自身承担交互；不额外发明 section title、白底壳或圆角包裹层。"
    },
    "icons": {
      "files": [
        "iconfont.css",
        "assets/fonts/wego-iconfont.woff2",
        "assets/fonts/wego-iconfont.woff",
        "assets/fonts/wego-iconfont.ttf",
        "assets/icons/*.svg",
        "assets/icons/app-center/*.svg"
      ],
      "copyable": true,
      "purpose": "微购图标字体、固定 SVG 资产和业务入口图标资产",
      "downstreamRule": "组件和预览页常规图标优先使用 <i class=\"wego-iconfont-s icon-{name}\"></i>；不要为了常规图标引入 Lucide/CDN 或临时内联 SVG。assets/icons/*.svg 用于已有 Tab、标签、checkbox 对勾等固定资产，其中 checkbox 对勾必须引用 checkbox-check.svg，半选标记由 .checkbox__minus::before 绘制。assets/icons/app-center/*.svg 是通用业务入口图标资产，优先给固定宿主模板和入口型业务页面使用，不并入基础 iconfont。"
    },
    "specs": {
      "files": [
        "specs/*.md"
      ],
      "copyable": false,
      "purpose": "由正式权威来源生成的人工审查投影，不参与运行时决策",
      "downstreamRule": "业务技能不得读取、引用或复制 specs/*.md；发现冲突时回到 Token、组件契约、uikit-plan.json、library-consumption.json 或对应 SKILL.md 修复。"
    },
    "uikit": {
      "files": [
        "ui_kits/biz-rule-config/index.html",
        "ui_kits/biz-rule-config/quality-report.json",
        "ui_kits/system-settings/index.html",
        "ui_kits/system-settings/quality-report.json"
      ],
      "copyable": false,
      "purpose": "业务规则配置等页面组合 Showcase，用来理解页面结构和组件搭配；App 宿主页正式维护在 wego-app/，不是 UI Kit",
      "downstreamRule": "只参考页面结构和组件组合，不要直接复制 .uikit-shell、.phone-frame 或业务演示里的自定义 biz-* 样式作为通用组件。固定宿主 App 正式维护在 wego-app/index.html，wego-ux/assets/templates/host-shell.* 只作为宿主基线来源，不由 UI Kit 下发，也不在每个业务场景中复制。命中页面范式后，检查 uikit-plan.json 中对应 pagePatterns[].compositionConstraints 获取组件组合约束（如 radio 的 cell vs form 取舍）。UI Kit 中出现的 section 标题现在应回收为组件正式节点（如 .cell-group__title、.form-group__title），不再把 .uikit-section-title 当下游可复制规则。"
    }
  },
  "iconUsage": {
    "fontClassMode": {
      "syntax": "<i class=\"wego-iconfont-s icon-{name}\"></i>",
      "requires": [
        "iconfont.css",
        "assets/fonts/wego-iconfont.*"
      ],
      "recolorable": true,
      "colorRule": "通过父元素或图标自身的 CSS color 使用 Token，例如 color: var(--text-default)。"
    },
    "svgAssetMode": {
      "syntax": "<img src=\"assets/icons/{name}.svg\" alt=\"\" />",
      "recolorable": false,
      "useFor": "底部 Tab、标签、checkbox 对勾等已经沉淀为 SVG 的固定资产；checkbox 半选标记使用 CSS 横线。"
    },
    "iconCountFromIconfontCss": 435,
    "rule": "优先使用已随库交付的 iconfont；缺图时先找语义接近的已有图标，再考虑联系设计团队更新字体包。"
  },
  "downstreamScenarios": {
    "buildDeployableProject": {
      "read": [
        "library-consumption.json",
        "uikit-plan.json",
        "components/index.json",
        "components/{slug}.json",
        "preview/component-{slug}.html",
        "SKILL.md"
      ],
      "consume": "默认输出 wego-app 静态 App 原型项目，不依赖前端框架；预览以 Vercel 固定链接为主，同时支持本地直接打开 wego-app/index.html；完整流程必须拆成 App 宿主、hash route、scene.js 注册场景、modal/sheet/push 等交互层，不能把所有内容聚合成一个长页面；运行时不得依赖 fetch()/XHR 读取本地 HTML 片段。wego-app/lib/ 是由 .codex/skills/wego-design/ 源资源同步出来的部署副本，不作为修改源；样式、Token、iconfont 或资产变更必须先改源文件，再运行 node scripts/sync-wego-app-lib.mjs。",
      "deliverables": [
        "wego-app/ 静态 App 项目",
        "wego-app/index.html 唯一宿主入口",
        "wego-app/js/routes.js hash route 注册",
        "wego-app/scenes/{中文业务场景}/ 场景模块",
        "wego-app/lib/ 设计系统部署副本"
      ],
      "staticHostBaseline": [
        "存在可直接打开的 wego-app/index.html",
        "Vercel 可直接托管 wego-app/ 静态目录",
        "样式、脚本和资源路径为相对路径",
        "业务场景运行时不依赖 fetch()/XHR 读取本地 HTML",
        "同一链接电脑端手机壳预览、移动端全屏展示",
        "wego-app/lib/ 与 .codex/skills/wego-design/ 源资源保持同步，禁止只改部署副本"
      ]
    },
    "useTokensOnly": {
      "read": [
        "colors_and_type.css"
      ],
      "consume": "通过 <link> 或 CSS @import 引入 Token。"
    },
    "buildSingleComponent": {
      "read": [
        "components/index.json",
        "components/{slug}.json",
        "preview/component-{slug}.html",
        "components.css"
      ],
      "consume": "复制预览页中的组件 markup，链接 colors_and_type.css、iconfont.css 和 components.css。"
    },
    "buildMobileAppPage": {
      "read": [
        "library-consumption.json",
        "components/index.json",
        "components/{slug}.json",
        "preview/component-{slug}.html",
        "uikit-plan.json",
        "ui_kits/biz-rule-config/index.html",
        "ui_kits/system-settings/index.html"
      ],
      "copyFiles": [
        "colors_and_type.css",
        "components.css",
        "iconfont.css",
        "assets/"
      ],
      "copyRule": "copyFiles 只描述部署副本需要包含的资源；不得直接编辑 wego-app/lib/ 内文件。需要改 Token、组件聚合 CSS、iconfont 或 assets 时，先修改 .codex/skills/wego-design/ 源文件，再运行 node scripts/sync-wego-app-lib.mjs 生成副本。",
      "consume": "UI Kit 只作业务页面结构参考（看组件如何组合），不复制外壳；App 宿主页不是 UI Kit，固定宿主 App 正式维护在 wego-app/index.html，不再为每个任务复制 host-shell.*。先检查 interaction_spec.app_target + host_container + route_id：wego-design 只输出宿主入口/结果回填和页面打开方式依据，wego-ux 只增量更新 wego-app/js/routes.js、对应 scene.js/scene.css、入口和状态反馈，不重画宿主 Tab、工作台、我的页等现成内容。随后在 uikit-plan.json 中判断业务页所属范式；设置、权限、规则、配置类页面优先参考 ui_kits/biz-rule-config/index.html。所有场景使用同链接预览外壳规则：电脑端显示手机壳，移动端隐藏外壳视觉；业务场景不得依赖外壳类实现内容结构。禁止事项：不把 app 当 UI Kit；不重画固定宿主 App；不把 .uikit-shell/.phone-frame/.phone-screen 当业务结构；不发明组件类（如 .profile-header）；不发明组件子元素类（如 .profile-header__name）；不发明组件修饰类（如 .cell__action-text--accent）；不使用 inline style 控制颜色/间距；不硬编码 hex/rem 值。同步 assets/ 时必须整体复制到 wego-app/lib/，不做任何子目录筛选或文件判断。",
      "forbidden": [
        "复制 UI Kit 外壳作为页面容器",
        "发明未在 components/index.json 注册的组件类",
        "发明未在组件契约中定义的子元素类",
        "发明未在组件契约中定义的修饰类",
        "使用 inline style 控制颜色或间距",
        "硬编码 hex/rem 值而非使用 var(--token)"
      ],
      "allowedSupplement": [
        "页面级布局样式（容器宽度、区块间距）",
        "业务语义样式（用业务作用域限定，如 .profile-page__section）",
        "使用 Token 控制颜色/间距/字号",
        "基础重置样式（box-sizing: border-box; margin: 0; padding: 0）"
      ],
      "recommendedWorkflow": [
        "先检查 interaction_spec.app_target、host_container 和 route_id，确认目标是 wego-app/scenes/{中文业务场景}/",
        "按 route_id 增量更新 wego-app/js/routes.js，不重复插入入口",
        "匹配业务页面范式，确定最优 UI Kit 蓝本和页面打开方式",
        "生成或更新 scene.js/scene.css，通过 window.WegoApp.registerScene 注册 template、presentation 和真实交互",
        "根据 page_presentation 分派 push、modal、sheet 或 full-screen-modal",
        "实现真实业务状态变化、反馈和必要回填，但不默认强制 localStorage 持久化",
        "修改 .codex/skills/wego-design/ 源资源后运行 node scripts/sync-wego-app-lib.mjs，同步设计系统运行资源到 wego-app/lib/",
        "复核电脑端手机壳、移动端全屏、Vercel 部署和本地直接打开都成立"
      ],
      "compositionConstraintsRule": "命中 pagePattern 后检查对应 `compositionConstraints` 字段，遵守其中的 trigger/use/avoid/allowWhen 约束。当前已定义的约束见 `uikit-plan.json` 中 biz-rule-config 的 compositionConstraints。"
    },
    "writeChineseCopyOrData": {
      "read": [
        "SKILL.md"
      ],
      "consume": "只使用 interaction_spec 中已确认的业务文案和数据格式；不得从自动生成的 specs/*.md 补充或改变业务内容。"
    }
  },
  "uikitConstraints": {
    "kitType": "business-page-showcase",
    "appHostTemplateSource": "../wego-ux/assets/templates/host-shell.*",
    "previewShellPolicy": {
      "appliesTo": [
        "ui_kits/*/index.html",
        "../wego-ux/assets/templates/*.html",
        "wego-app/index.html"
      ],
      "desktop": "显示手机预览外壳",
      "mobile": "同链接隐藏手机外壳视觉并铺满真实 viewport，不保留额外外层 padding",
      "boundary": "外壳类只服务预览，不作为业务页面结构或组件契约",
      "statusBarRule": "phone-status / phone-indicator 是全局预览外壳安全区：默认 absolute 悬浮、不占文档流，并保持预览层级最高（z-index 使用 var(--z-critical)）。桌面手机壳预览在 .phone-screen 内写死模拟值 --safe-area-top: 44px / --safe-area-bottom: 34px；移动端同链接隐藏 phone-status / phone-indicator，并由 env(safe-area-inset-*) 返回真实安全区。navbar 必须在组件内部通过 padding-top: var(--safe-area-top, 0px) + sticky top: 0 处理顶部避让，页面容器不得再额外补一层顶部 safe-area padding；页面底部若有固定操作栏，该固定栏自身必须声明 padding-bottom: var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))；若页面底部没有固定操作栏，则可滚动内容容器底部必须补 calc(40px + var(--safe-area-bottom)) 避开安全区。禁止把 phone-status 改成流内占位特例。"
    },
    "outerShells": [
      ".uikit-shell",
      ".preview-shell",
      ".phone-frame",
      ".phone-screen"
    ],
    "warningForDownstream": "UI Kit 是展示样品，不是真实宿主模板；App 宿主模板直接从 wego-ux/assets/templates/host-shell.* 复制。",
    "showcaseStructureRule": {
      "applicableTo": "包含 pagePattern 的 UI Kit（即有 presentation 定义的 UI Kit）",
      "structureRequirement": {
        "description": "UI Kit 必须演示双层结构：宿主入口页（HostScreen） + 业务页面（SettingsScreen），让 AI 能从 Showcase 学到页面的打开方式和动画定义",
        "hostScreen": "包含 navbar + phone-body + 摘要卡 + 入口 cell-group（触发打开）+ BottomNav + HomeIndicator",
        "settingsScreen": "包含 navbar + phone-body + 内容 + 打开动画 + 关闭动画"
      },
      "animationRequirement": {
        "description": "打开/关闭动画通过 transform + transition 实现，通过 React 状态控制挂载与打开/关闭状态切换",
        "push": "translateX(100%) → translateX(0)（slide-left 进入），关闭时反向",
        "modal": "translateY(100%) → translateY(0)（slide-up 进入），关闭时反向",
        "fullScreenModal": "translateY(100%) → translateY(0)（slide-up 进入），关闭时反向",
        "defaultState": "首屏展示以稳定落点为准，默认直接展示打开后的最终态，避免自动入场动画让截图停在半开中间态"
      },
      "referenceInstances": [
        "biz-rule-config（BaseScreen + BizSettingsModal，full-screen-modal + slide-up）",
        "system-settings（HostScreen + SystemSettingsScreen，push + slide-left）"
      ],
      "purpose": "让 AI 从规则文档直接学到 UI Kit 必须演示双层结构 + 打开方式 + 动画定义，不依赖隐性实践推断"
    },
    "pageBottomPaddingRule": {
      "description": "页面底部预留规则，适用于所有页面底部间距",
      "noBottomActionBar": "页面没有固定底部操作栏时，可滚动内容容器底部必须补 calc(40px + var(--safe-area-bottom))，对应 Token --safe-area-bottom-content",
      "hasBottomActionBar": "页面有固定底部操作栏时，操作栏自身声明 padding-bottom: var(--safe-area-bottom) 避开安全区，内容容器底部只需补 40px（--spacer-40）确保最后一项内容不被操作栏遮挡",
      "appliesTo": "所有 wego-app 业务场景页面底部",
      "exception": "modal、sheet 等浮层组件自带安全区处理，不适用此规则"
    },
    "bottomActionBarAlignment": {
      "description": "底部固定操作栏内按钮对齐规则",
      "singleButton": "单按钮时使用 width:100% 占满操作栏宽度",
      "multiButton": "多按钮时主操作靠右，次操作靠左，按钮间用 spacer 间隔",
      "appliesTo": "所有含底部固定操作栏的 wego-app 业务场景页面",
      "exception": "modal、sheet 等浮层组件自带的底部操作区由组件内部布局决定，不适用此规则"
    }
  },
  "globalConsumptionRules": {
    "uikitReferenceBoundary": "UI Kit 只作业务页面结构和组件组合参考，禁止复制 Showcase 外壳与内容，也不承担 App 宿主模板职责。",
    "appHostBoundary": "`app` 不属于 UI Kit；固定宿主 App 的唯一运行落点是 wego-app/index.html，宿主模板基线由 wego-ux/assets/templates/host-shell.* 维护。",
    "contractFirst": "组件必须优先复用已注册契约；若命中组件契约已定义的稳定场景，页面层不得再重定义其内嵌关联控件规格、父子联动结构或冗余 helper。若发现组件契约问题，任务完成后必须作为风险性告知用户。",
    "specAuthority": "业务内容来自 interaction_spec；布局、交互和视觉规则引用实际命中的 Token、组件契约、Preview、uikit-plan.json、library-consumption.json 或 SKILL.md 字段。自动生成的 specs/*.md 只用于人工审查，不得进入运行时规则来源。",
    "demoStyleBoundary": "不把 biz-* 演示样式当通用组件，也不把示例中的主操作位置误写成唯一强制规则。",
    "groupStructureFirst": "命中连续列表或表单分组时，优先消费 .cell-group / .form-group 的正式结构：标题使用 group 自带 title 节点，连续内容放进 group 自带 content 容器；卡片修饰只开在内容容器上。"
  },
  "recommendedReadOrder": [
    "SKILL.md",
    "library-consumption.json",
    "uikit-plan.json",
    "colors_and_type.css",
    "css.json",
    "components/index.json",
    "components/{slug}.json",
    "preview/component-{slug}.html"
  ],
  "defaultDeliveryMode": "static-single-preview-shell-flow",
  "deliveryGuardrails": [
    "默认输出 wego-app 静态 App 原型，不引入前端框架依赖",
    "wego-app/index.html 是唯一 App 宿主和预览外壳；业务场景不复制第二套手机壳",
    "业务场景全部落在 wego-app/scenes/{中文业务场景}/，通过 scene.js 注册 template、presentation 和交互",
    "页面打开方式由 design_plan.page_presentation.type 决定，支持 push、modal、sheet、full-screen-modal",
    "预览以 Vercel 固定链接为主，同时支持本地直接打开 wego-app/index.html",
    "运行时禁止依赖 fetch()/XHR 读取本地 HTML 片段；禁止普通 <a href=\"./scenes/*.html\"> 或 location.href 顶层离开 App",
    "原型必须体现真实业务数据状态和流程闭环，但不默认强制 localStorage 持久化"
  ],
  "coreComponents": [
    "navbar",
    "bottom-nav",
    "button",
    "cell",
    "form",
    "input",
    "search",
    "card"
  ],
  "supportComponents": [
    "avatar",
    "badge",
    "checkbox",
    "tag",
    "counter",
    "image",
    "link",
    "radio",
    "stack",
    "tabs",
    "switch",
    "toast",
    "dialog",
    "actionsheet",
    "modal",
    "popmenu",
    "metric"
  ],
  "embeddedComponents": [],
  "unpublishedContracts": [],
  "uiKits": [
    "biz-rule-config",
    "system-settings"
  ],
  "componentContractSchemaVersion": 3,
  "componentContractReadRule": "components/{slug}.json 统一使用 schemaVersion 3；读取时依次关注 semanticTypeCandidates、variantDimensions、usageHints、doNotInvent、tokensConsumed、provenance。",
  "componentConsumptionNotes": [
    "搜索语义必须优先消费 search 组件，不得用 input 临时拼搜索框；基础 searchbox 固定为左图标、中间输入、右侧内部动作三段式，业务右侧操作放在 search 的 host pattern actions 槽。",
    "独立文字跳转操作（如卡片头部右侧的'全部'、'配置'、'查看详情'，列表项右侧的轻操作文字）必须消费 link 组件的 standalone 模式，不得用业务作用域自定义类（如 __text-action）模拟 link 视觉（color: var(--text-link) + transparent 背景）。link standalone 已提供 14px/12px 尺寸、40px 紧凑热区和按压态反馈；自定义模拟会丢失热区、按压态和视觉一致性。页面主操作仍用 button，不用 link 代替强动作。",
    "页面内搜索框（search-nav-bar、search-toolbar）默认固定在页面顶部，不跟随页面滚动；搜索框使用 position: sticky 或等价固定方式，确保用户向下滚动时仍可触达搜索入口。例外：覆盖式搜索结果层（search-overlay）是全屏搜索态，不适用此规则。",
    "命中 navbar 语义时，必须直接消费 navbar 组件的正式 DOM 与行为约束；页面级样式只允许补内容区留白和业务布局，不得在场景样式里重写 navbar 的 sticky、安全区、背景跟随或左右操作热区逻辑。",
    "命中数值展示语义时，价格、金额、统计值和划线价优先消费 metric 组件，不得只因为页面已经引入数字字体就回退成自定义 price 类；自定义数值样式只允许做业务布局胶水，不替代 metric 的字号、字重、划线价和颜色语义。",
    "命中 sheet primitive 且内容是 3 个以上并列操作、轻量筛选或单选切换时，优先消费 actionsheet 组件；不得在 scene.js/scene.css 中自造业务版 action-sheet 结构去替代正式组件。",
    "页面文案只表达业务对象、状态、结果、风险和动作，不写解释设计意图、Benchmark 背景、工作流提示或面向评审/AI 的说明文案；当首屏说明与用户任务无直接关系时，应删除而不是保留为'导览文案'。",
    "使用图标时必须从 wego-app/lib/iconfont.css 中引用已存在的 .icon-xxx 类名，不得从语义推测发明图标名；iconfont.css 中不存在的图标不得在 scene.js/scene.css 中使用，应改用文字或已有图标替代。"
  ],
  "scenarioTypeRegistry": {
    "description": "通用场景类型注册表。所有经验沉淀必须先归入一个场景类型并标注工作流环节，再按四段式落地。新类型需经通用化验证。",
    "types": [
      {
        "id": "component-consumption-decision",
        "name": "组件消费决策",
        "primaryWorkflowStage": "wego-design",
        "secondaryWorkflowStages": [
          "wego-ux"
        ],
        "covers": [
          "选哪个组件",
          "用哪个修饰类",
          "什么尺寸",
          "什么状态",
          "组件职责边界"
        ],
        "judgmentLogic": "决策必须引用组件契约的 variantDimensions + 宿主场景说明，不能凭默认或惯例；当两个组件的 category 不同时，职责互斥，不互相嵌套。若组件契约已经提供稳定场景，消费单位优先是该场景，不再把宿主组件与内嵌关联组件拆成多个局部判断；场景一旦命中，内嵌关联控件的尺寸、对齐、层级、补充结构与冗余说明默认随场景完整消费。若业务需求确实要偏离场景内部定义，必须回到设计系统迭代，不允许在任务实现中临时改写。该场景类型在 component_mapping 中必须标注 `consumption_mode` 字段（取值 `stable-variant` / `composition-constraint` / `free-composition`），用于 wego-ux 分派规格消费行为；`consumption_mode` 取值由 wego-design 根据命中来源决定：命中组件契约 representativeVariants 或 behavior 稳定场景 → `stable-variant`；命中 uikit-plan.json compositionConstraints → `composition-constraint`；两者均未命中 → `free-composition`。",
        "landingPriority": [
          "components/{slug}.json 的 variantDimensions/usageHints",
          "library-consumption.json 的边界字段",
          "uikit-plan.json 的 compositionConstraints"
        ],
        "secondaryLanding": [
          "wego-ux/SKILL.md 的生成规则引用"
        ],
        "verificationStandard": "把规则里的具体组件名替换成'组件A/组件B'后，逻辑是否仍然成立"
      },
      {
        "id": "no-uikit-page-composition",
        "name": "无 UI Kit 页面构成",
        "primaryWorkflowStage": "wego-design",
        "secondaryWorkflowStages": [
          "wego-ux",
          "wego-tests"
        ],
        "covers": [
          "未命中 pagePattern 的页面",
          "宿主页入口",
          "通用任务页",
          "二级选择页",
          "设计缺口拦截"
        ],
        "judgmentLogic": "当 interaction_spec.surfaces[] 中的页面角色或结构无法精确命中现有 pagePattern/UI Kit，但仍能由已注册组件、Token 和正式消费规则安全组成时，输出 match_status=fallback 并引用 uikit-plan.json.fallbackPageBlueprints；若命中的 pagePattern 或 fallback blueprint 已声明 requiredSurfaceDesignContract，则必须同步把对应字段写入 design_plan.surface_designs[].layout_contract，作为 wego-ux 和 wego-tests 的运行时权威来源；若 fallback blueprint 也无法覆盖，输出 match_status=gap 并阻止进入 wego-ux",
        "landingPriority": [
          "uikit-plan.json 的 fallbackPageBlueprints",
          "wego-design/references/design-plan.md 的 surface_designs 结构",
          "wego-design/SKILL.md 的 surface_designs 输出规则"
        ],
        "secondaryLanding": [
          "wego-ux/SKILL.md 的 surface_designs 执行规则",
          "wego-tests/SKILL.md 的 surface_designs 验收规则"
        ],
        "verificationStandard": "把具体页面名称替换成'页面A'后，是否仍能按页面角色、结构特征和宿主特征判断 exact/near/fallback/gap？"
      },
      {
        "id": "object-management-list-composition",
        "name": "对象管理列表构成",
        "primaryWorkflowStage": "wego-design",
        "secondaryWorkflowStages": [
          "wego-product",
          "wego-ux",
          "wego-tests"
        ],
        "covers": [
          "仓库/商品/员工/客户/门店等对象列表",
          "列表信息取舍",
          "列表项横向/纵向排布判断",
          "列表操作暴露或收纳",
          "对象缩略图或真实图片选择",
          "新增入口承载方式"
        ],
        "judgmentLogic": "当页面主任务是管理一组可新增、编辑、删除或启停的业务对象，且列表项包含对象识别物、名称、关键状态、摘要和操作时，命中对象管理列表构成。列表页目标是扫读和行动，不是完整资料展示；设计消费必须先划分列表必显字段、列表摘要字段、详情/编辑字段和操作字段，再决定卡片横向或纵向布局、操作外露或收纳、图片/图标/占位资产来源。",
        "landingPriority": [
          "uikit-plan.json 的 fallbackPageBlueprints[object-management-list-page]",
          "components/image.json 的 usageHints / doNotInvent",
          "components/button.json 与 components/navbar.json 的新增入口规则",
          "components/form.json 的分组对齐规则"
        ],
        "secondaryLanding": [
          "wego-product/SKILL.md 的 information_blocks 字段优先级",
          "wego-ux/SKILL.md 的状态动画和操作收纳实现规则",
          "wego-tests/SKILL.md 的对象管理列表验收项"
        ],
        "verificationStandard": "把具体业务对象替换成商品、员工、客户或门店后，是否仍能判断列表只展示识别与行动所需信息、完整资料进入详情/编辑页、操作数量决定外露或收纳，并能生成一致的导航新增入口和表单对齐？"
      },
      {
        "id": "uikit-to-production-transform",
        "name": "UI Kit 到生产转换",
        "primaryWorkflowStage": "wego-ux",
        "secondaryWorkflowStages": [
          "wego-design"
        ],
        "covers": [
          "预览外壳仅用于桌面验收",
          "移动端同链接隐藏外壳",
          "节奏/组合/收口可借鉴",
          "生产结构语义化封装",
          "演示样式不当通用组件",
          "App 场景 CSS 作用域隔离"
        ],
        "judgmentLogic": "UI Kit 的 .uikit-shell/.phone-frame/.phone-screen/biz-*/uikit-section-* 是预览或 Showcase 演示层；电脑端可显示手机外壳，移动端必须隐藏外壳视觉并铺满真实 viewport；业务场景不得依赖外壳类实现内容结构，生产内容必须语义化封装为 <section> 并注册到 scene.js；可借鉴的是页面范式、组合节奏、收口方式。",
        "landingPriority": [
          "wego-ux/SKILL.md 的生成规则",
          "wego-design/SKILL.md 的消费规则"
        ],
        "secondaryLanding": [
          "uikit-plan.json 的 pagePatterns 说明"
        ],
        "verificationStandard": "同一个链接在电脑端是否显示手机外壳、移动端是否隐藏外壳？业务内容是否仍能脱离外壳类成立？"
      },
      {
        "id": "page-presentation-binding",
        "name": "页面打开方式绑定",
        "primaryWorkflowStage": "wego-ux",
        "secondaryWorkflowStages": [
          "wego-design",
          "wego-tests"
        ],
        "covers": [
          "pagePattern.presentation",
          "page_presentation",
          "push/modal/sheet/full-screen-modal 分派",
          "入口触发方式",
          "覆盖 Tab"
        ],
        "judgmentLogic": "只要 surface 命中带 presentation 的 pagePattern 或 fallback blueprint，wego-design 必须把 presentation、transition、dismissAction、overlayLevel、coversTabBar 映射为可追溯的 page_presentation；wego-ux 必须按 page_presentation.type 分派 push、modal、sheet 或 full-screen-modal，不得自行改成另一种打开方式；wego-tests 必须检查实现与 page_presentation.type 一致。",
        "landingPriority": [
          "wego-ux/SKILL.md 的页面打开方式规则",
          "wego-design/SKILL.md 的 page_presentation 输出规则"
        ],
        "secondaryLanding": [
          "wego-tests/SKILL.md 的 interaction_check 验收规则",
          "uikit-plan.json 的 pagePatterns.presentation 字段"
        ],
        "verificationStandard": "把具体页面名称替换成'页面A'后，是否仍能按页面角色、命中的 pagePattern/fallback blueprint 和 presentation 判断应使用 push、modal、sheet 还是 full-screen-modal，并在实现中看到对应入口触发、DOM 容器、动画和覆盖层级？"
      },
      {
        "id": "prototype-fidelity-standard",
        "name": "App 场景交付标准",
        "primaryWorkflowStage": "wego-ux",
        "secondaryWorkflowStages": [
          "wego-tests"
        ],
        "covers": [
          "scene_folder 命名",
          "App 项目结构",
          "真实业务状态变化",
          "状态回填",
          "保存反馈闭环",
          "不默认强制持久化",
          "Vercel 固定链接预览",
          "本地直接打开兼容性"
        ],
        "judgmentLogic": "新业务场景目录使用中文业务语义命名并落在 wego-app/scenes/；已有历史场景继续复用；交互原型必须体现真实业务数据状态、选择/保存/取消/删除等流程反馈和必要回填；默认使用内存状态即可，不强制 localStorage 持久化，只有需求明确要求刷新后保留时才做持久化；wego-app/index.html 必须可部署到 Vercel 固定链接并支持本地直接打开；运行时不得依赖 fetch()/XHR 读取本地 HTML 片段。",
        "landingPriority": [
          "wego-ux/SKILL.md 的 App 场景生成规则"
        ],
        "secondaryLanding": [
          "wego-product/SKILL.md 的 app_target 和落盘规则",
          "wego-tests/SKILL.md 的 app_scene_check 与 interaction_check"
        ],
        "verificationStandard": "新场景是否使用中文业务语义目录并落在 wego-app/scenes/？点击入口后是否在 App 内打开并完成真实业务状态变化？是否只在需求明确时才做持久化？Vercel 与本地直开是否走同一套静态资源路径？"
      },
    {
      "id": "host-shell-route-binding",
      "name": "App 宿主路径绑定",
        "primaryWorkflowStage": "wego-ux",
        "secondaryWorkflowStages": [
          "wego-product",
          "wego-tests"
        ],
        "covers": [
          "固定宿主 App 常驻 wego-app",
          "host_container 路径表达",
          "route_id 稳定复用",
          "同场景迭代不重复插入口",
          "禁止重画宿主 App",
          "宿主资源同步完整性",
          "二级入口页面层级定义"
        ],
        "judgmentLogic": "当 interaction_spec 声明 app_target + host_container + route_id 时，任务属于 wego-app 固定宿主挂载场景。wego-product 负责输出结构化路径、scene_folder 和稳定 route_id；wego-design 只输出宿主入口/结果回填和页面打开依据；wego-ux 必须维护现有 wego-app/index.html，不再复制第二套 host-shell，只按 route_id 增量更新 routes.js、入口、业务场景、状态回填和必要交互；后续迭代按 route_id 定位旧入口增量更新，不重画宿主 Tab、工作台、我的页等现成内容。",
        "landingPriority": [
          "wego-ux/SKILL.md 的固定 App 宿主规则",
          "wego-app/index.html / js/routes.js / scenes/{scene}/scene.js",
          "wego-product/SKILL.md 的 app_target 与 interaction_spec 字段定义"
        ],
        "secondaryLanding": [
          "wego-tests/SKILL.md 的 App 宿主路径验收规则"
      ],
      "verificationStandard": "wego-app/index.html 是否作为唯一宿主保留现成 UI/交互？同一路径任务二次迭代时是否只更新 route_id 对应入口、routes.js 和 scene，而不是新增第二套宿主壳或重画宿主内容？"
    },
    {
      "id": "design-resource-sync-boundary",
      "name": "设计系统资源副本边界",
      "primaryWorkflowStage": "wego-ux",
      "secondaryWorkflowStages": [
        "wego-design",
        "wego-tests"
      ],
      "covers": [
        "wego-app/lib 部署副本",
        "设计系统源资源",
        "Token 同步",
        "组件聚合 CSS 同步",
        "iconfont 和 assets 同步",
        "禁止直接改副本"
      ],
      "judgmentLogic": "当任务涉及 App 运行资源、Token、组件样式、iconfont 或设计系统 assets 时，.codex/skills/wego-design/ 是源文件，wego-app/lib/ 只是部署副本。wego-ux 必须先修改源文件并运行 node scripts/sync-wego-app-lib.mjs 生成副本；不得直接编辑 wego-app/lib/ 来修样式或资源。wego-tests 必须检查副本与源资源一致，validate-wego-design.mjs 的 app.lib.out_of_sync 错误阻止通过。",
      "landingPriority": [
        "wego-ux/SKILL.md 的资源同步规则",
        "library-consumption.json 的 copyRule / downstreamScenarios",
        "scripts/validate-wego-design.mjs 的 app.lib.out_of_sync 守门"
      ],
      "secondaryLanding": [
        "wego-tests/SKILL.md 的设计系统资源副本验收",
        "AGENTS.md 的仓库级约束"
      ],
      "verificationStandard": "把具体资源名替换成'资源A'后，是否仍能判断源文件在 .codex/skills/wego-design/、部署副本在 wego-app/lib/，且只能通过同步脚本生成副本？"
    },
    {
      "id": "wego-app-scene-delivery",
      "name": "wego-app 场景交付",
        "primaryWorkflowStage": "wego-ux",
        "secondaryWorkflowStages": [
          "wego-product",
          "wego-design",
          "wego-tests"
        ],
        "covers": [
          "wego-app 固定项目",
          "scenes 场景模块",
          "hash route 注册",
          "scene.js template 注册",
          "Vercel-first 预览",
          "本地直接打开兼容"
        ],
        "judgmentLogic": "当 interaction_spec.app_target.mode=wego-app-scene 时，交付对象是 wego-app 内的场景模块，而不是独立原型目录。wego-ux 必须在 wego-app/js/routes.js 注册 route_id，并在 wego-app/scenes/{中文业务场景}/scene.js 中通过 window.WegoApp.registerScene 注册 template、presentation 和交互；运行时只能通过 script/link 加载静态资源，不依赖 fetch()/XHR 读取本地 HTML。",
        "landingPriority": [
          "wego-ux/SKILL.md 的场景模块和路由注册规则",
          "wego-app/js/routes.js",
          "wego-app/scenes/{scene}/scene.js"
        ],
        "secondaryLanding": [
          "wego-product/SKILL.md 的 app_target 字段",
          "wego-design/SKILL.md 的 app_target 映射",
          "wego-tests/SKILL.md 的 app_scene_check"
        ],
        "verificationStandard": "把具体场景名称替换成'场景A'后，是否仍能按 app_target、route_id 和 scene_folder 判断应更新 wego-app/scenes/场景A，而不是创建独立原型文件夹？"
      }
    ],
    "workflowStageDefinitions": {
      "wego-product": "需求理解、任务分类、场景判断、信息块拆解；经验回流到 wego-product 技能文档或 interaction_spec 字段定义",
      "wego-design": "设计系统消费、组件映射、组合约束决策；经验回流到 wego-design 技能文档、消费契约和组合约束文件",
      "wego-ux": "原型生成、App 宿主维护、场景模块注册、交互实现；经验回流到 wego-ux 技能文档或模板目录",
      "wego-tests": "验收项定义、当前任务范围、归因规则、风险记录；经验回流到 wego-tests 技能文档或验收报告字段定义"
    },
    "rule": "正式规则升级前必须先标注工作流环节归属（primaryWorkflowStage），再判断是否需要匹配 scenarioTypeRegistry 中的成熟类型。经验候选只进入 wego-uxsystem-iterate/experience/candidates.json；无匹配类型时保持候选，不得为了候选先新增正式类型。只有用户确认升级、规则可被运行时消费且确有新类型必要时，才新增 scenarioTypeRegistry 类型。"
  }
}

### 组件与 UI Kit 变更同步矩阵

来源：`.codex/skills/wego-uxsystem-iterate/references/sync-matrix.runtime.md`

#### 变更同步矩阵

> 角色：设计系统运行时同步方法。读取条件：组件、Token、图标或 UI Kit 正式迭代时；工作流经验升级读取 `sync-matrix.md`。

##### 只改契约

必看：

- `.codex/skills/wego-design/components/index.json`
- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`

必改：

- `.codex/skills/wego-design/components/{slug}.json`

按需改：

- `.codex/skills/wego-design/preview/component-{slug}.html`：当契约变化影响结构、状态、变体示例时
- `.codex/skills/wego-design/references/library-map.md`、`.codex/skills/wego-design/SKILL.md`：当边界或清单说明变化时

通常不需要：

- `.codex/skills/wego-design/components.css`
- `.codex/skills/wego-design/css.json`

##### 只改样式

必看：

- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`

必改：

- `.codex/skills/wego-design/preview/component-{slug}.html`

必做：

- 运行 `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`

按需改：

- `.codex/skills/wego-design/components/{slug}.json`：当状态、Token 消费、尺寸或边界变化时

提取后补查：

- 如果 `components.css` 额外出现非目标组件 diff，先暂停提交，回查对应 preview 和工作区历史；确认来源前不要把无关生成结果一起收下

##### 契约 + 样式一起收敛

必看：

- `.codex/skills/wego-design/SKILL.md`
- `.codex/skills/wego-design/components/index.json`
- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`

必改：

- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`

必做：

- 运行 `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`
- 递增 `.codex/skills/wego-design/metadata.json.version`

按需改：

- `.codex/skills/wego-design/references/library-map.md`
- `.codex/skills/wego-design/SKILL.md`
- `.codex/skills/wego-design/library-consumption.json`
- 受影响 UI Kit 的 `ui_kits/{slug}/index.html` 与对应 `quality-report.json`：当契约收敛影响该 UI Kit 已有示例时
- 下游技能文档（wego-ux/SKILL.md 等）：删除已被收回的重复规则

适用场景：

- 删除冗余变体，重建少数稳定公开类型
- 明确默认挂载、定位或宿主边界
- 把 preview 中的 inline style 语义收回正式 class
- 新增或调整公开 CSS 变量、自定义宽度或颜色覆盖能力
- 取消一个原本误认为独立的场景，并把它并回现有场景
- 调整父子联动、成组选择、嵌套调用等会影响示例语义的结构
- 暗色模式从 preview 专用覆盖收回组件级 `.dark` 规则或正式 Token 消费
- 组件行为规则（DOM 结构、禁止项）从下游技能文档收回组件契约

##### 改 Token

必看：

- `.codex/skills/wego-design/colors_and_type.css`
- `.codex/skills/wego-design/css.json`
- 受影响组件契约
- 受影响 preview

必改：

- `.codex/skills/wego-design/colors_and_type.css`
- `.codex/skills/wego-design/css.json`

按需改：

- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`
- `.codex/skills/wego-design/references/library-map.md`
- `.codex/skills/wego-design/SKILL.md`

必做：

- 执行 `node -e "JSON.parse(require('fs').readFileSync('.codex/skills/wego-design/css.json','utf8'))"`
- 如组件核心 CSS 同时变化，再执行 `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`

补充判断：

- 如果只是单个组件临时补暗色可见性，且没有形成公共语义，可先落组件 `.dark` 规则
- 如果多个组件开始重复相同暗色边框、底色、禁用态数值，应升级为 Token 变更，不要让局部硬编码继续扩散

##### 改图标

必看：

- `.codex/skills/wego-design/iconfont.css`
- `.codex/skills/wego-design/assets/fonts/`
- `.codex/skills/wego-design/assets/icons/`
- 受影响组件契约与 preview

必改：

- 受影响预览页或组件引用

按需改：

- `.codex/skills/wego-design/iconfont.css`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/SKILL.md`
- `.codex/skills/wego-design/references/library-map.md`：当存在 iconfont 规则例外或下游复制边界变化时
- 调用该组件的 preview / UI Kit：当它们仍在使用旧图标、内联 SVG 或旧 helper

限制：

- 不为了临时需求引入 Lucide、第三方 CDN 或内联 SVG
- 如果设计稿指定随库 SVG 资产，必须把它作为固定资产引用，不要改回 iconfont
- 扫描调用方，确认同一语义没有同时存在 iconfont、内联 SVG、SVG asset 三套实现

##### 改 UI Kit

先从 `.codex/skills/wego-design/uikit-plan.json` 的 `uiKits` 列表确认全部已注册 UI Kit，再定位本轮要改的 `ui_kits/{slug}/`。不要默认只处理 `app`。

必看：

- `.codex/skills/wego-design/uikit-plan.json`：确认 `uiKits` 全集与本次目标 `slug`
- 目标 `ui_kits/{slug}/index.html`
- 对应 `ui_kits/{slug}/quality-report.json`
- `.codex/skills/wego-design/uikit-plan.json`：确认该 UI Kit 对应的 `pagePatterns`、`screenBlueprints`、`productContext.selectedFrameNames`

必改：

- 目标 UI Kit 入口文件 `ui_kits/{slug}/index.html`
- 目标 `ui_kits/{slug}/quality-report.json`

按需改：

- `.codex/skills/wego-design/uikit-plan.json`：当 UI Kit 内的页面范式、组合约束、槽位分配变化时
- 相关组件契约与 preview：当 UI Kit 中暴露出组件使用问题，需要收回规则时
- `.codex/skills/wego-design/library-consumption.json`：当该 UI Kit 的复制边界、消费说明变化时
- `.codex/skills/wego-design/references/library-map.md`、`.codex/skills/wego-design/SKILL.md`：当 UI Kit 数量、清单或定位说明变化时

必做：

- 递增 `.codex/skills/wego-design/metadata.json.version`

限制：

- 不把 `.uikit-shell`、`.phone-frame`、`.phone-screen`、`biz-*` 等 Showcase 演示外壳或业务样式误升级成通用组件
- 改动落点应在 Showcase 演示层；若发现组件本体有问题，转走组件迭代流程，不在 UI Kit 里硬补组件样式
- 同一变更若影响多个 UI Kit，逐个同步各自的 `index.html` 与 `quality-report.json`，不要只改 `app`

##### 新增 UI Kit

先确认它不是现有 UI Kit 的变体或页面范式扩展：

- 若只是同一套页面范式换了业务外壳（如另一类规则配置页），优先扩展现有 UI Kit 的示例区，而不是新增
- 若页面范式、组件组合节奏、固定槽位与现有 UI Kit 明显不同（例如新增大屏导购、客服会话、营销活动等范式），才走新增流程

必看：

- `.codex/skills/wego-design/metadata.json`
- `.codex/skills/wego-design/uikit-plan.json`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/references/library-map.md`
- `.codex/skills/wego-design/SKILL.md`

必改：

- 新增 `.codex/skills/wego-design/ui_kits/{slug}/index.html`
- 新增 `.codex/skills/wego-design/ui_kits/{slug}/quality-report.json`
- `.codex/skills/wego-design/uikit-plan.json`：在 `uiKits`、`productContext.selectedFrameNames` 中登记，并按需补 `pagePatterns` / `screenBlueprints` / `compositionConstraints`
- `.codex/skills/wego-design/library-consumption.json`：在 `consumptionLayers.uikit.files` 中登记新 UI Kit 入口与 quality-report，必要时更新 `downstreamScenarios.buildMobileAppPage.read`
- `.codex/skills/wego-design/references/library-map.md` 与顶层 `.codex/skills/wego-design/SKILL.md`：同步 UI Kit 清单、定位与根目录结构

必做：

- 在仓库根运行 `node scripts/validate-wego-design.mjs` 做文件完整性守门
- 递增 `.codex/skills/wego-design/metadata.json.version`

限制：

- 新 UI Kit 必须复用已注册组件契约，不发明组件类、子元素类或修饰类
- 必须保持 `.uikit-shell`、`.phone-frame`、`.phone-screen` 等演示外壳，不把它当成真实页面模板交付
- 新 UI Kit 的 `slug` 不得与现有组件、现有 UI Kit 冲突

##### 新增组件

必看：

- `.codex/skills/wego-design/components/index.json`
- `.codex/skills/wego-design/uikit-plan.json`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/references/library-map.md`
- `.codex/skills/wego-design/SKILL.md`

必改：

- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`
- `.codex/skills/wego-design/components/index.json`
- `.codex/skills/wego-design/uikit-plan.json`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/references/library-map.md`
- `.codex/skills/wego-design/SKILL.md`

必做：

- 运行 `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`
- 递增 `.codex/skills/wego-design/metadata.json.version`

按需改：

- 命中页面范式的 UI Kit `ui_kits/{slug}/index.html` 与对应 `quality-report.json`：当新组件应进入该 UI Kit 展示时

##### 每次正式迭代共同项

无论哪类正式迭代，都要检查：

- 是否仍符合移动端、微信生态、电商/工具场景
- 是否仍保持简洁、干净、淡雅、克制
- 是否误手改 `.codex/skills/wego-design/components.css`
- 是否需要递增 `.codex/skills/wego-design/metadata.json.version`
- 是否把 inline style 中承载的组件语义收回正式 class
- 如果组件本身带交互，交互是否已经并回原场景示例，而不是新增独立“交互演示”模块
- 如果保留了 inline style，是否只是演示已公开的 CSS 变量覆盖
- 是否补齐了契约已经承诺的关键宿主场景
- 是否对圆角、偏移、滚动这类视觉细节做过真实渲染核对
- 如果涉及暗色模式，是否确认修复落在组件 `.dark` 或正式 Token，而不是只靠 preview 专用 class
- 是否对照过同类稳定组件的暗色策略，避免同类控件各写各的
- 是否顺序运行提取脚本后再扫描 `components.css`，避免读到旧聚合输出
- 是否没有直接编辑 `wego-app/lib/` 部署副本；若设计系统运行资源变化，必须先改 `.codex/skills/wego-design/` 源文件，再运行 `node scripts/sync-wego-app-lib.mjs`
- 是否用 `node scripts/sync-wego-app-lib.mjs --check` 或 `node scripts/validate-wego-design.mjs` 确认 `wego-app/lib/` 与源资源一致
- 如果提取脚本带出无关组件 diff，是否已经定位来源并明确说明为什么保留或为什么不纳入本轮
- 若未执行浏览器验证，是否已按统一规则完成静态扫描、脚本校验、资源检查，并明确这不视为流程缺失
- 是否清理了已取消场景的旧文案、旧 class、旧契约字段和旧消费说明
- 回复里是否明确写出“改了什么、验证了什么、剩余风险”
- 如果没有真实剩余风险，是否明确写“无明显剩余风险”，而不是编造模板化风险

##### 工作流迭代（经验沉淀/规则补充/流程优化）

适用于 wego-uxsystem-iterate 的“工作流迭代模式”。完整规则见 `workflow-iteration.md`。

###### 经验沉淀（新增规则）

必看：
- `.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md`（经验沉淀通用化原则）
- `.codex/skills/wego-design/library-consumption.json` 的 `scenarioTypeRegistry`

必改（按环节归属）：
- product 类 → `.codex/skills/wego-product/SKILL.md`
- design 类 → `.codex/skills/wego-design/SKILL.md` 或 `library-consumption.json` 或 `uikit-plan.json` 或 `components/{slug}.json`
- ux 类 → `.codex/skills/wego-ux/SKILL.md`
- tests 类 → `.codex/skills/wego-tests/SKILL.md`

按需改：
- `AGENTS.md`（仅当规则升级为仓库级硬约束时，回流到“仓库级约束”章节）

必做：
- 通过 workflow-iteration.md 的通用化验证清单
- 若涉及设计系统本体（library-consumption.json / uikit-plan.json / components/*.json），递增 `metadata.json.version`

###### 场景类型注册（新增类型）

必看：
- `.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md`（经验沉淀通用化原则）
- `.codex/skills/wego-design/library-consumption.json` 的 `scenarioTypeRegistry`

必改：
- `.codex/skills/wego-design/library-consumption.json`（新增类型到 `scenarioTypeRegistry.types[]`）

按需改：
- 对应工作流环节的 SKILL.md（补执行引用）

必做：
- 新类型必须标注 primaryWorkflowStage
- 新类型必须通过通用化验证清单
- 递增 `metadata.json.version`

###### 工作流环节规则调整（改 SKILL.md）

必看：
- 目标环节的 SKILL.md
- `AGENTS.md`（确认是否与仓库级硬约束冲突）

必改：
- 目标环节的 SKILL.md

按需改：
- `AGENTS.md`（仅当规则升级为仓库级硬约束时）
- 下游环节的 SKILL.md（若规则跨环节）

必做：
- 确认规则不与已有契约/计划文件重复
- 若涉及设计系统本体，递增 `metadata.json.version`

<!-- generated-by: scripts/specs.mjs@8 -->
<!-- source-fingerprint: 2b6b8e9b6e2e9ed8e6a6133790cdc78177951d74f60a91607c8a88e751e22abc -->
