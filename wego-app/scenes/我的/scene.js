/* wego-design-contract:
{
  "surface_id": "my-home",
  "route_id": "my",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "host-tab",
    "transition": "none",
    "dismissAction": "tab-switch",
    "overlayLevel": "inline",
    "coversTabBar": false,
    "source": "library-consumption.json#/appRuntime/presentationTypes"
  },
  "prompt_contract": {
    "design_system_version": 465,
    "token_bindings": [
      { "selector": ".my-page", "content_role": "页面边距", "css_property": "padding-inline", "token": "var(--layout-page-margin-m8)" },
      { "selector": ".my-page", "content_role": "页面背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".my-page", "content_role": "页面默认文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page", "content_role": "页面基础字体", "css_property": "font-family", "token": "var(--body-md-font-family)" },
      { "selector": ".my-page__topbar", "content_role": "顶部吸顶栈节奏", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__topbar", "content_role": "顶部吸顶栈最小高度", "css_property": "min-height", "token": "var(--size-56)" },
      { "selector": ".my-page__topbar", "content_role": "顶部吸顶栈底部留白", "css_property": "padding-bottom", "token": "var(--spacer-8)" },
      { "selector": ".my-page__topbar", "content_role": "顶部安全区让位", "css_property": "padding-top", "token": "var(--safe-area-top)" },
      { "selector": ".my-page__topbar", "content_role": "顶部吸顶栈水平留白", "css_property": "padding-inline", "token": "var(--spacer-4)" },
      { "selector": ".my-page__topbar", "content_role": "顶部吸顶栈背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".my-page__topbar-identity", "content_role": "身份区节奏", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__topbar-identity", "content_role": "身份区垂直内边距", "css_property": "padding-block", "token": "var(--spacer-4)" },
      { "selector": ".my-page__topbar-identity", "content_role": "身份区水平内边距", "css_property": "padding-inline", "token": "var(--spacer-8)" },
      { "selector": ".my-page__topbar-identity", "content_role": "身份区底色", "css_property": "background", "token": "var(--transparent)" },
      { "selector": ".my-page__topbar-identity", "content_role": "身份区圆角", "css_property": "border-radius", "token": "var(--radius-full)" },
      { "selector": ".my-page__topbar-identity:active", "content_role": "身份区按压反馈", "css_property": "background", "token": "var(--bg-subtle)" },
      { "selector": ".my-page__topbar-name", "content_role": "用户名文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__topbar-name", "content_role": "用户名层级", "css_property": "font-size", "token": "var(--heading-sm-font-size)" },
      { "selector": ".my-page__topbar-name", "content_role": "用户名层级", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".my-page__topbar-name", "content_role": "用户名层级", "css_property": "line-height", "token": "var(--heading-sm-line-height)" },
      { "selector": ".my-page__topbar-verified", "content_role": "认证图标颜色", "css_property": "color", "token": "var(--text-brand)" },
      { "selector": ".my-page__topbar-verified", "content_role": "认证图标尺寸", "css_property": "font-size", "token": "var(--size-16)" },
      { "selector": ".my-page__topbar-verified", "content_role": "认证图标行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__topbar-caret", "content_role": "切换指示颜色", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".my-page__topbar-caret", "content_role": "切换指示尺寸", "css_property": "font-size", "token": "var(--size-16)" },
      { "selector": ".my-page__topbar-caret", "content_role": "切换指示行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__topbar-actions", "content_role": "顶部图标按钮组节奏", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".my-page__topbar-action", "content_role": "顶部图标按钮尺寸", "css_property": "width", "token": "var(--size-40)" },
      { "selector": ".my-page__topbar-action", "content_role": "顶部图标按钮尺寸", "css_property": "height", "token": "var(--size-40)" },
      { "selector": ".my-page__topbar-action", "content_role": "顶部图标按钮圆角", "css_property": "border-radius", "token": "var(--radius-full)" },
      { "selector": ".my-page__topbar-action", "content_role": "顶部图标按钮底色", "css_property": "background", "token": "var(--transparent)" },
      { "selector": ".my-page__topbar-action:active", "content_role": "顶部图标按钮按压反馈", "css_property": "background", "token": "var(--bg-subtle)" },
      { "selector": ".my-page__topbar-action .btn__icon", "content_role": "顶部图标按钮图标尺寸", "css_property": "font-size", "token": "var(--size-24)" },
      { "selector": ".my-page__topbar-action .btn__icon", "content_role": "顶部图标按钮图标颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__scroll", "content_role": "滚动区底部留白", "css_property": "padding-bottom", "token": "var(--safe-area-bottom-content)" },
      { "selector": ".my-page__hero", "content_role": "顶部滚动区节奏", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".my-page__hero", "content_role": "顶部滚动区垂直留白", "css_property": "padding-block", "token": "var(--spacer-12)" },
      { "selector": ".my-page__membership-card:active", "content_role": "会员卡按压反馈", "css_property": "background", "token": "var(--bg-subtle)" },
      { "selector": ".my-page__membership-content", "content_role": "会员卡内容节奏", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".my-page__membership-content", "content_role": "会员卡内容留白", "css_property": "padding", "token": "var(--spacer-12)" },
      { "selector": ".my-page__membership-row", "content_role": "会员信息行间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__membership-mark", "content_role": "会员标识内容间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__membership-icon", "content_role": "会员图标尺寸", "css_property": "width", "token": "var(--size-32)" },
      { "selector": ".my-page__membership-icon", "content_role": "会员图标尺寸", "css_property": "height", "token": "var(--size-32)" },
      { "selector": ".my-page__membership-label", "content_role": "会员辅助信息", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".my-page__membership-label", "content_role": "会员辅助信息", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".my-page__membership-label", "content_role": "会员辅助信息", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".my-page__membership-title", "content_role": "会员名称", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__membership-title", "content_role": "会员名称", "css_property": "font-size", "token": "var(--body-lg-font-size)" },
      { "selector": ".my-page__membership-title", "content_role": "会员名称", "css_property": "font-weight", "token": "var(--font-weight-semibold)" },
      { "selector": ".my-page__membership-title", "content_role": "会员名称", "css_property": "line-height", "token": "var(--body-lg-line-height)" },
      { "selector": ".my-page__storage", "content_role": "空间信息节奏", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__storage-row", "content_role": "空间信息与管理间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__storage-value", "content_role": "空间用量", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__storage-value", "content_role": "空间用量", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".my-page__storage-value", "content_role": "空间用量", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".my-page__storage-value", "content_role": "空间用量", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".my-page__progress", "content_role": "空间进度轨道高度", "css_property": "height", "token": "var(--spacer-6)" },
      { "selector": ".my-page__progress", "content_role": "空间进度轨道圆角", "css_property": "border-radius", "token": "var(--radius-full)" },
      { "selector": ".my-page__progress", "content_role": "空间进度轨道背景", "css_property": "background", "token": "var(--bg-subtle)" },
      { "selector": ".my-page__progress-value", "content_role": "空间已用进度圆角", "css_property": "border-radius", "token": "var(--radius-full)" },
      { "selector": ".my-page__progress-value", "content_role": "空间已用进度背景", "css_property": "background", "token": "var(--bg-brand)" },
      { "selector": ".my-page__assets", "content_role": "数据资产横滑间距", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".my-page__assets", "content_role": "数据资产横滑垂直留白", "css_property": "padding-block", "token": "var(--spacer-4)" },
      { "selector": ".my-page__asset-entry", "content_role": "数据资产入口节奏", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".my-page__asset-entry", "content_role": "数据资产入口宽度", "css_property": "width", "token": "var(--size-48)" },
      { "selector": ".my-page__asset-entry", "content_role": "数据资产入口内边距", "css_property": "padding", "token": "var(--spacer-4)" },
      { "selector": ".my-page__asset-entry", "content_role": "数据资产入口圆角", "css_property": "border-radius", "token": "var(--radius-8)" },
      { "selector": ".my-page__asset-entry", "content_role": "数据资产入口底色", "css_property": "background", "token": "var(--transparent)" },
      { "selector": ".my-page__asset-entry:active", "content_role": "数据资产入口按压反馈", "css_property": "background", "token": "var(--bg-subtle)" },
      { "selector": ".my-page__asset-icon", "content_role": "数据资产图标颜色", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".my-page__asset-icon", "content_role": "数据资产图标尺寸", "css_property": "font-size", "token": "var(--size-24)" },
      { "selector": ".my-page__asset-icon", "content_role": "数据资产图标行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__asset-value", "content_role": "数据资产数值最小高度", "css_property": "min-height", "token": "var(--size-20)" },
      { "selector": ".my-page__asset-label", "content_role": "数据资产标签", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".my-page__asset-label", "content_role": "数据资产标签", "css_property": "font-size", "token": "var(--body-xs-font-size)" },
      { "selector": ".my-page__asset-label", "content_role": "数据资产标签", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__asset-entry--brand .my-page__asset-icon", "content_role": "我买的品牌色强调", "css_property": "color", "token": "var(--text-brand)" },
      { "selector": ".my-page__asset-entry--brand .my-page__asset-label", "content_role": "我买的标签强调", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__apps", "content_role": "常用应用横滑间距", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".my-page__apps", "content_role": "常用应用横滑垂直留白", "css_property": "padding-block", "token": "var(--spacer-4)" },
      { "selector": ".my-page__app-entry", "content_role": "应用入口节奏", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".my-page__app-entry", "content_role": "应用入口宽度", "css_property": "width", "token": "var(--size-48)" },
      { "selector": ".my-page__app-entry", "content_role": "应用入口内边距", "css_property": "padding", "token": "var(--spacer-4)" },
      { "selector": ".my-page__app-entry", "content_role": "应用入口圆角", "css_property": "border-radius", "token": "var(--radius-8)" },
      { "selector": ".my-page__app-entry", "content_role": "应用入口底色", "css_property": "background", "token": "var(--transparent)" },
      { "selector": ".my-page__app-entry:active", "content_role": "应用入口按压反馈", "css_property": "background", "token": "var(--bg-subtle)" },
      { "selector": ".my-page__app-icon-host", "content_role": "应用图标承载尺寸", "css_property": "width", "token": "var(--size-40)" },
      { "selector": ".my-page__app-icon-host", "content_role": "应用图标承载尺寸", "css_property": "height", "token": "var(--size-40)" },
      { "selector": ".my-page__app-icon-host", "content_role": "应用图标承载边界", "css_property": "border-radius", "token": "var(--radius-12)" },
      { "selector": ".my-page__app-icon", "content_role": "应用图标颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__app-icon", "content_role": "应用图标尺寸", "css_property": "font-size", "token": "var(--size-24)" },
      { "selector": ".my-page__app-icon", "content_role": "应用图标行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__app-label", "content_role": "应用名称", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".my-page__app-label", "content_role": "应用名称", "css_property": "font-size", "token": "var(--body-xs-font-size)" },
      { "selector": ".my-page__app-label", "content_role": "应用名称", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__apps-recent", "content_role": "最近应用节奏", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".my-page__apps-divider", "content_role": "常用应用分隔线高度", "css_property": "height", "token": "var(--size-32)" },
      { "selector": ".my-page__apps-divider", "content_role": "常用应用分隔线", "css_property": "background", "token": "var(--border-neutral-l2)" },
      { "selector": ".my-page__list-sticky", "content_role": "列表区吸顶栈背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".my-page__toolbar", "content_role": "工具行留白", "css_property": "padding-block", "token": "var(--spacer-8)" },
      { "selector": ".my-page__list", "content_role": "内容列表节奏", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".my-page__list", "content_role": "内容列表底部留白", "css_property": "padding-bottom", "token": "var(--spacer-32)" },
      { "selector": ".my-page__list--grid", "content_role": "网格视图节奏", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".my-page__card", "content_role": "内容卡片节奏", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".my-page__card", "content_role": "内容卡片留白", "css_property": "padding", "token": "var(--spacer-8)" },
      { "selector": ".my-page__card", "content_role": "内容卡片边界", "css_property": "border-radius", "token": "var(--radius-12)" },
      { "selector": ".my-page__card", "content_role": "内容卡片背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".my-page__list--grid .my-page__card", "content_role": "网格视图卡片节奏", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__card:active", "content_role": "内容卡片按压反馈", "css_property": "background", "token": "var(--bg-subtle)" },
      { "selector": ".my-page__card-cover-wrap", "content_role": "内容卡片封面尺寸", "css_property": "width", "token": "var(--size-72)" },
      { "selector": ".my-page__card-cover-wrap", "content_role": "内容卡片封面圆角", "css_property": "border-radius", "token": "var(--radius-8)" },
      { "selector": ".my-page__card-body", "content_role": "内容卡片正文节奏", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".my-page__card-title", "content_role": "内容卡片标题", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__card-title", "content_role": "内容卡片标题", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".my-page__card-title", "content_role": "内容卡片标题", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".my-page__card-title", "content_role": "内容卡片标题", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".my-page__card-meta", "content_role": "内容卡片辅助信息", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".my-page__card-meta", "content_role": "内容卡片辅助信息", "css_property": "font-size", "token": "var(--body-xs-font-size)" },
      { "selector": ".my-page__card-meta", "content_role": "内容卡片辅助信息", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__empty", "content_role": "空态垂直留白", "css_property": "padding-block", "token": "var(--spacer-32)" },
      { "selector": ".my-page__empty", "content_role": "空态文字", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".my-page__empty", "content_role": "空态文字", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".my-page__empty", "content_role": "空态文字", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".my-page__publish-focus", "content_role": "发布遮罩背景", "css_property": "background", "token": "var(--text-default)" },
      { "selector": ".my-page__publish-focus", "content_role": "发布遮罩过渡时长", "css_property": "transition", "token": "var(--duration-fast)" },
      { "selector": ".my-page__publish-dock", "content_role": "发布托盘左留白", "css_property": "left", "token": "var(--spacer-16)" },
      { "selector": ".my-page__publish-dock", "content_role": "发布托盘右留白", "css_property": "right", "token": "var(--spacer-16)" },
      { "selector": ".my-page__publish-dock", "content_role": "发布托盘底部偏移", "css_property": "bottom", "token": "var(--safe-area-bottom-content)" },
      { "selector": ".my-page__publish-dock-surface", "content_role": "发布托盘面板节奏", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".my-page__publish-dock-surface", "content_role": "发布托盘面板留白", "css_property": "padding", "token": "var(--spacer-8)" },
      { "selector": ".my-page__publish-dock-surface", "content_role": "发布托盘面板边界", "css_property": "border-radius", "token": "var(--radius-16)" },
      { "selector": ".my-page__publish-dock-surface", "content_role": "发布托盘面板背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".my-page__publish-dock-surface", "content_role": "发布托盘面板位移", "css_property": "transform", "token": "var(--spacer-16)" },
      { "selector": ".my-page__publish-dock-surface", "content_role": "发布托盘面板过渡", "css_property": "transition", "token": "var(--duration-fast)" },
      { "selector": ".my-page__publish-list", "content_role": "发布列表节奏", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".my-page__publish-choice", "content_role": "发布选项节奏", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".my-page__publish-choice", "content_role": "发布选项最小高度", "css_property": "min-height", "token": "var(--size-56)" },
      { "selector": ".my-page__publish-choice", "content_role": "发布选项水平留白", "css_property": "padding-inline", "token": "var(--spacer-12)" },
      { "selector": ".my-page__publish-choice", "content_role": "发布选项边界", "css_property": "border-radius", "token": "var(--radius-12)" },
      { "selector": ".my-page__publish-choice", "content_role": "发布选项底色", "css_property": "background", "token": "var(--transparent)" },
      { "selector": ".my-page__publish-choice", "content_role": "发布选项文字颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__publish-choice", "content_role": "发布选项位移", "css_property": "transform", "token": "var(--spacer-8)" },
      { "selector": ".my-page__publish-choice", "content_role": "发布选项过渡", "css_property": "transition", "token": "var(--duration-normal)" },
      { "selector": ".my-page__publish-choice:active", "content_role": "发布选项按压反馈", "css_property": "background", "token": "var(--bg-subtle)" },
      { "selector": ".my-page__publish-icon-host", "content_role": "发布选项图标底板尺寸", "css_property": "width", "token": "var(--size-40)" },
      { "selector": ".my-page__publish-icon-host", "content_role": "发布选项图标底板尺寸", "css_property": "height", "token": "var(--size-40)" },
      { "selector": ".my-page__publish-icon-host", "content_role": "发布选项图标底板边界", "css_property": "border-radius", "token": "var(--radius-full)" },
      { "selector": ".my-page__publish-icon-host", "content_role": "发布选项图标底板", "css_property": "background", "token": "var(--bg-subtle)" },
      { "selector": ".my-page__publish-choice-icon", "content_role": "发布选项图标颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__publish-choice-icon", "content_role": "发布选项图标尺寸", "css_property": "font-size", "token": "var(--size-20)" },
      { "selector": ".my-page__publish-choice-icon", "content_role": "发布选项图标行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__publish-choice-text", "content_role": "发布选项文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__publish-choice-text", "content_role": "发布选项文字", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".my-page__publish-choice-text", "content_role": "发布选项文字", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".my-page__publish-fab", "content_role": "发布FAB右留白", "css_property": "right", "token": "var(--spacer-16)" },
      { "selector": ".my-page__publish-fab", "content_role": "发布FAB底部偏移", "css_property": "bottom", "token": "var(--safe-area-bottom-content)" },
      { "selector": ".my-page__publish-fab", "content_role": "发布FAB尺寸", "css_property": "width", "token": "var(--size-48)" },
      { "selector": ".my-page__publish-fab", "content_role": "发布FAB尺寸", "css_property": "height", "token": "var(--size-48)" },
      { "selector": ".my-page__publish-fab", "content_role": "发布FAB边界", "css_property": "border-radius", "token": "var(--radius-full)" },
      { "selector": ".my-page__publish-fab", "content_role": "发布FAB背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".my-page__publish-fab", "content_role": "发布FAB颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__publish-fab", "content_role": "发布FAB过渡", "css_property": "transition", "token": "var(--duration-normal)" },
      { "selector": ".my-page__publish-fab-icon", "content_role": "发布FAB图标颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__publish-fab-icon", "content_role": "发布FAB图标尺寸", "css_property": "font-size", "token": "var(--size-24)" },
      { "selector": ".my-page__publish-fab-icon", "content_role": "发布FAB图标行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__publish-fab-icon", "content_role": "发布FAB图标过渡", "css_property": "transition", "token": "var(--duration-normal)" },
      { "selector": ".my-page__cart-fab", "content_role": "购物车FAB右留白", "css_property": "right", "token": "var(--spacer-16)" },
      { "selector": ".my-page__cart-fab", "content_role": "购物车FAB底部偏移", "css_property": "bottom", "token": "var(--safe-area-bottom-content)" },
      { "selector": ".my-page__cart-fab", "content_role": "购物车FAB尺寸", "css_property": "width", "token": "var(--size-48)" },
      { "selector": ".my-page__cart-fab", "content_role": "购物车FAB尺寸", "css_property": "height", "token": "var(--size-48)" },
      { "selector": ".my-page__cart-fab", "content_role": "购物车FAB边界", "css_property": "border-radius", "token": "var(--radius-full)" },
      { "selector": ".my-page__cart-fab", "content_role": "购物车FAB背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".my-page__cart-fab", "content_role": "购物车FAB颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__cart-fab", "content_role": "购物车FAB过渡", "css_property": "transition", "token": "var(--duration-normal)" },
      { "selector": ".my-page__cart-fab-icon", "content_role": "购物车FAB图标尺寸", "css_property": "font-size", "token": "var(--size-24)" },
      { "selector": ".my-page__cart-fab-icon", "content_role": "购物车FAB图标行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__cart-fab-badge", "content_role": "购物车角标位置", "css_property": "top", "token": "var(--spacer-12)" },
      { "selector": ".my-page__cart-fab-badge", "content_role": "购物车角标位置", "css_property": "right", "token": "var(--spacer-12)" }
    ],
    "component_bindings": [
      {
        "binding_id": "profile-avatar",
        "slug": "avatar",
        "reason": "顶部栏左侧身份识别头像",
        "variant_dimensions": {
          "type": "image",
          "size": "40"
        }
      },
      {
        "binding_id": "vip-tag",
        "slug": "tag",
        "reason": "顶部栏 VIP 身份标识，与认证图标并存",
        "variant_dimensions": {
          "size": "20",
          "theme": "brand-stroke",
          "state": "normal",
          "affordance": "display-only"
        }
      },
      {
        "binding_id": "membership-card",
        "slug": "card",
        "reason": "会员中心独立卡片承载等级、到期时间与云空间用量",
        "variant_dimensions": {
          "base": "auto",
          "surface": "surface"
        }
      },
      {
        "binding_id": "storage-action",
        "slug": "link",
        "reason": "云空间信息旁的轻量管理入口",
        "variant_dimensions": {
          "mode": "standalone",
          "size": "12",
          "state": "default"
        }
      },
      {
        "binding_id": "topbar-action",
        "slug": "button",
        "reason": "顶部栏右侧设置和分享两个图标按钮入口",
        "variant_dimensions": {
          "emphasis": "weak",
          "size": "sm",
          "iconMode": "icon-only",
          "state": "default"
        }
      },
      {
        "binding_id": "type-tabs",
        "slug": "tabs",
        "reason": "内容列表类型分类切换（产品/笔记/直播）",
        "variant_dimensions": {
          "size": "standard",
          "layout": "scroll"
        }
      },
      {
        "binding_id": "list-search",
        "slug": "search",
        "reason": "工具行内联弱化搜索入口，placeholder 随当前 tab 变化",
        "variant_dimensions": {
          "size": "sm",
          "surface": "gray",
          "mode": "text",
          "state": "empty",
          "hostPattern": "content-search-filter"
        }
      },
      {
        "binding_id": "cart-badge",
        "slug": "badge",
        "reason": "购物车 FAB 数量角标",
        "variant_dimensions": {
          "type": "number",
          "placement": "corner"
        }
      },
      {
        "binding_id": "asset-metric",
        "slug": "metric",
        "reason": "数据资产横滑各项数量/余额展示",
        "variant_dimensions": {
          "size": "16",
          "theme": "black"
        }
      },
      {
        "binding_id": "orders-metric",
        "slug": "metric",
        "reason": "我买的入口订单待办数量（品牌色强调）",
        "variant_dimensions": {
          "size": "16",
          "theme": "black"
        }
      },
      {
        "binding_id": "card-cover-image",
        "slug": "image",
        "reason": "内容列表卡片封面图（产品/笔记/直播缩略图），尺寸 72px 自定义矩形",
        "variant_dimensions": {
          "fit": "cover",
          "size": "custom-rect",
          "radius": "rounded-md",
          "state": "loaded",
          "interaction": "static"
        }
      },
      {
        "binding_id": "app-icon-image",
        "slug": "image",
        "reason": "最近使用应用入口的应用图标承载图（缩略图模式）",
        "variant_dimensions": {
          "fit": "cover",
          "size": "custom-rect",
          "radius": "rounded-lg",
          "state": "loaded",
          "interaction": "static"
        }
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "页面同时承载身份、会员、数据资产、应用入口和内容列表，未命中单一页面范式；使用 M8 卡片边距保持高密度内容的分组清晰，顶部 4 行紧凑布局保证列表优先露出",
      "page_edge_mode": "M8",
      "principle_refs": ["wego-clarity-information-flow", "wego-clarity-single-primary-task"],
      "mutable_regions": [
        ".my-page__assets",
        ".my-page__apps",
        ".my-page__list"
      ]
    },
    "interaction_contract": [
      { "dom_id": "switch-album", "target": "feedback:toast" },
      { "dom_id": "open-settings", "target": "feedback:toast" },
      { "dom_id": "share-homepage", "target": "feedback:toast" },
      { "dom_id": "enter-membership", "target": "feedback:toast" },
      { "dom_id": "manage-storage", "target": "feedback:toast" },
      { "dom_id": "open-orders", "target": "feedback:toast" },
      { "dom_id": "open-fans", "target": "feedback:toast" },
      { "dom_id": "open-friends", "target": "feedback:toast" },
      { "dom_id": "open-agents", "target": "feedback:toast" },
      { "dom_id": "open-visitors", "target": "feedback:toast" },
      { "dom_id": "open-staff", "target": "feedback:toast" },
      { "dom_id": "open-wallet", "target": "feedback:toast" },
      { "dom_id": "open-coupons", "target": "feedback:toast" },
      { "dom_id": "open-favorites", "target": "feedback:toast" },
      { "dom_id": "enter-homepage", "target": "feedback:toast" },
      { "dom_id": "view-qrcode", "target": "feedback:toast" },
      { "dom_id": "open-recent-app", "target": "feedback:toast" },
      { "dom_id": "open-all-apps", "target": "feedback:toast" },
      { "dom_id": "type-tab-product", "target": "state:switch-type" },
      { "dom_id": "type-tab-note", "target": "state:switch-type" },
      { "dom_id": "type-tab-live", "target": "state:switch-type" },
      { "dom_id": "open-search", "target": "feedback:toast" },
      { "dom_id": "open-filter", "target": "feedback:toast" },
      { "dom_id": "toggle-view", "target": "state:toggle-view" },
      { "dom_id": "open-publish-menu", "target": "state:publish-dock-open" },
      { "dom_id": "publish-focus", "target": "state:publish-dock-open" },
      { "dom_id": "publish-action-product", "target": "feedback:toast" },
      { "dom_id": "publish-action-note", "target": "feedback:toast" },
      { "dom_id": "publish-action-live", "target": "feedback:toast" },
      { "dom_id": "publish-action-import", "target": "feedback:toast" },
      { "dom_id": "publish-action-scan", "target": "feedback:toast" },
      { "dom_id": "open-cart", "target": "feedback:toast" }
    ],
    "state_contract": [
      {
        "state_id": "my-home-default",
        "initial": true,
        "trigger": "进入我的主 tab",
        "visible_result": "顶部 4 行紧凑布局（导航栏/会员栏/数据资产/常用应用）后直接看到类型tabs+内容列表，类型tabs默认产品，列表视图，搜索框空，购物车FAB按需显示",
        "fallback": "保持当前可用入口与固定演示数据",
        "persistence": "memory"
      },
      {
        "state_id": "switch-type",
        "initial": false,
        "trigger": "点击类型tab（产品/笔记/直播）",
        "visible_result": "搜索placeholder、列表内容跟随当前tab变化，视图模式恢复该tab的记忆值",
        "fallback": "保持当前tab和列表",
        "persistence": "memory"
      },
      {
        "state_id": "toggle-view",
        "initial": false,
        "trigger": "点击工具行视图切换按钮",
        "visible_result": "当前tab的列表/网格视图切换并per-tab记忆",
        "fallback": "保持当前视图",
        "persistence": "memory"
      },
      {
        "state_id": "publish-dock-open",
        "initial": false,
        "trigger": "点击发布FAB",
        "visible_result": "底部dock弹出发布动作网格，遮罩覆盖；点击遮罩或托盘外收起",
        "fallback": "保持发布dock关闭",
        "persistence": "memory"
      },
      {
        "state_id": "cart-visible",
        "initial": false,
        "trigger": "购物车数量大于0",
        "visible_result": "购物车FAB显示并带数量角标",
        "fallback": "购物车FAB隐藏",
        "persistence": "memory"
      }
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-27T19:30:00+08:00",
    "checks": {
      "horizontal_overflow": true,
      "overlap": true,
      "clipping": true,
      "action_legibility": true,
      "primary_focus": true,
      "state_feedback": true
    }
  }
}
*/

var mySceneAllApps = [
    { name: '我的小店', asset: '我的小店' },
    { name: '店铺装修', asset: '店铺装修' },
    { name: '商品管理', asset: '商品管理' },
    { name: '商品详情装修', asset: '商品详情装修' },
    { name: '上下架', asset: '上下架' },
    { name: '一键换肤', asset: '一键换肤' },
    { name: '专享小程序', asset: '专享小程序' },
    { name: '微信小店', asset: '微信小店' },
    { name: '一键开团', asset: '一键开团' },
    { name: '发布', asset: '发布' },
    { name: '快捷发布', asset: '快捷发布' },
    { name: '批量发布', asset: '批量发布' },
    { name: '一键搬家', asset: '一键搬家' },
    { name: '铺货管家', asset: '铺货管家' },
    { name: '整理相册', asset: '整理相册' },
    { name: '批量编辑', asset: '批量编辑' },
    { name: '营销中心', asset: '营销中心' },
    { name: '数据中心', asset: '数据中心' },
    { name: '优惠券', asset: '优惠券' },
    { name: '限时秒杀', asset: '限时秒杀' },
    { name: '满减促销', asset: '满减促销' },
    { name: '红包雨', asset: '红包雨' },
    { name: '抽奖大转盘', asset: '抽奖大转盘' },
    { name: '支付后送券', asset: '支付后送券' },
    { name: '追福袋', asset: '追福袋' },
    { name: '分销', asset: '分销' },
    { name: '推广员', asset: '推广员' },
    { name: '发新客福利', asset: '发新客福利' },
    { name: '弃购召回', asset: '弃购召回' },
    { name: '一键复制好友相册', asset: '一键复制好友相册' },
    { name: '微信群发', asset: '微信群发助手' },
    { name: '推送上新', asset: '推送上新（群发消息）' },
    { name: '公众号', asset: '公众号' },
    { name: '企业微信', asset: '企业微信' },
    { name: '视频号', asset: '视频号' },
    { name: '抖音引流', asset: '抖音引流' },
    { name: '公域引流', asset: '公域引流' },
    { name: '私域直播', asset: '私域直播' },
    { name: '直播开单', asset: '直播开单' },
    { name: '私域键盘', asset: '私域键盘' },
    { name: '客户管理', asset: '客户管理' },
    { name: '创建客户', asset: '创建客户' },
    { name: '客户审核', asset: '客户审核' },
    { name: '客户标签', asset: '客户标签' },
    { name: '会员管理', asset: '粉丝会员卡' },
    { name: '访客足迹', asset: '访客足迹' },
    { name: '标签管理', asset: '标签管理' },
    { name: '积分商城', asset: '积分商城' },
    { name: '收款码', asset: '收款码' },
    { name: '查订单-查快递', asset: '查订单-查快递' },
    { name: '售后', asset: '售后' },
    { name: '销售单', asset: '销售单' },
    { name: '销售报表', asset: '销售报表' },
    { name: '库存管理', asset: '库存管理' },
    { name: '备货', asset: '备货' },
    { name: '配货管理', asset: '配货管理' },
    { name: '采购单', asset: '采购单' },
    { name: '供应商', asset: '供应商' },
    { name: '转图代理', asset: '转图代理' },
    { name: '查件码', asset: '查件码' },
    { name: '团队管理', asset: '团队管理' },
    { name: '员工业绩', asset: '员工业绩' },
    { name: '批量导出', asset: '批量导出' },
    { name: '导出记录', asset: '导出记录' },
    { name: '规则中心', asset: '规则中心' },
    { name: '价格管理', asset: '价格管理' },
    { name: 'ERP', asset: 'ERP' },
    { name: '相册网址', asset: '相册网址' },
    { name: '硬件商城', asset: '硬件商城(智能硬件)' },
    { name: '相册学堂', asset: '相册学堂' },
    { name: 'PC(电脑版)', asset: 'PC版' }
  ];

var MY_SCENE_TYPE_TABS = [
  { key: 'product', label: '产品', placeholder: '搜索产品' },
  { key: 'note', label: '笔记', placeholder: '搜索笔记' },
  { key: 'live', label: '直播', placeholder: '搜索直播' }
];

var MY_SCENE_ASSETS = [
  { key: 'fans', label: '粉丝', icon: 'icon-fensi', value: '1.2万' },
  { key: 'friends', label: '好友', icon: 'icon-fensihuiyuanka', value: '328' },
  { key: 'agents', label: '代理', icon: 'icon-fenxiangzhuan', value: '46' },
  { key: 'visitors', label: '访客', icon: 'icon-fangkejilu', value: '892' },
  { key: 'staff', label: '员工', icon: 'icon-tuiguangyuan', value: '12' },
  { key: 'wallet', label: '钱包', icon: 'icon-qianbao', value: '¥2,580' },
  { key: 'coupons', label: '卡券', icon: 'icon-quan', value: '18' },
  { key: 'favorites', label: '收藏', icon: 'icon-shoucang', value: '256' }
];

var MY_SCENE_CONTENT_DATA = {
  product: [
    { id: 'p1', title: '2024秋冬新款针织毛衣', cover: 'clothing/clothing_5/1663741067252_48951.jpg', published_at: '今天 10:32', stats: '浏览 128 · 收藏 12' },
    { id: 'p2', title: '法式复古碎花连衣裙', cover: 'clothing/clothing_6/img_1708defc_20240216_i1708092843_7820_16.jpg.jpg', published_at: '今天 09:15', stats: '浏览 256 · 收藏 28' },
    { id: 'p3', title: '加厚羊毛大衣中长款', cover: 'clothing/clothing_11/1663741015636_57550.jpg', published_at: '昨天 16:20', stats: '浏览 432 · 收藏 56' },
    { id: 'p4', title: '休闲宽松卫衣套装', cover: 'clothing/clothing_13/1664276865083_43086.jpg', published_at: '昨天 14:08', stats: '浏览 312 · 收藏 41' }
  ],
  note: [
    { id: 'n1', title: '秋冬穿搭灵感：5套日常通勤造型', cover: 'clothing/clothing_5/1663741067252_48951.jpg', published_at: '今天 11:20', stats: '点赞 86 · 评论 12' },
    { id: 'n2', title: '新品预告｜法式复古系列上架', cover: 'clothing/clothing_6/img_1708defc_20240216_i1708092843_7820_16.jpg.jpg', published_at: '今天 08:45', stats: '点赞 142 · 评论 28' },
    { id: 'n3', title: '买家秀合集｜针织毛衣实穿分享', cover: 'clothing/clothing_11/1663741015636_57550.jpg', published_at: '昨天 19:30', stats: '点赞 218 · 评论 46' }
  ],
  live: [
    { id: 'l1', title: '秋冬新品直播专场｜限时8折', cover: 'clothing/clothing_13/1664276865083_43086.jpg', published_at: '今天 20:00', stats: '预约 256 · 观看 1.2万' },
    { id: 'l2', title: '法式复古系列直播回顾', cover: 'clothing/clothing_5/1663741067252_48951.jpg', published_at: '昨天 20:00', stats: '观看 8,624 · 点赞 432' }
  ]
};

function getRecentlyUsedApps() {
  try {
    var stored = localStorage.getItem('wego_recent_apps');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function setRecentlyUsedApps(appNames) {
  try {
    localStorage.setItem('wego_recent_apps', JSON.stringify(appNames.slice(0, 20)));
  } catch (e) {}
}

function recordAppUsage(appName) {
  var recent = getRecentlyUsedApps();
  recent = recent.filter(function (name) { return name !== appName; });
  recent.unshift(appName);
  setRecentlyUsedApps(recent);
}

function sortAppsByRecentUsage(apps) {
  var recent = getRecentlyUsedApps();
  var sorted = apps.slice().sort(function (a, b) {
    var aIndex = recent.indexOf(a.name);
    var bIndex = recent.indexOf(b.name);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  return sorted;
}

function createMySceneRecentAppEntry(app, index) {
  var wrapper = document.createElement('div');
  wrapper.innerHTML = ''
    + '<button type="button" class="my-page__app-entry" data-app-name="' + app.name + '" data-dom-id="open-recent-app" aria-label="打开' + app.name + '">'
    +   '<div class="wg-image my-page__app-icon-host" data-dd-id="app-icon-image-' + index + '" data-component-slug="image" data-component-binding="app-icon-image">'
    +     '<img class="wg-image__src is-loaded" src="./lib/assets/icons/app-center/' + app.asset + '.svg" alt="" decoding="async">'
    +   '</div>'
    +   '<span class="my-page__app-label">' + app.name + '</span>'
    + '</button>';
  return wrapper.firstElementChild;
}

const mySceneTemplate = `
    <section class="my-page" data-surface-id="my-home" data-route-id="my" data-route-bound="true" data-layout-mode="composed" data-page-edge-mode="M8" data-bg="page">
      <header class="my-page__topbar" data-topbar>
        <button type="button" class="my-page__topbar-identity" data-dom-id="switch-album" aria-label="切换相册">
          <div class="avatar avatar--40 avatar--image my-page__topbar-avatar" data-dd-id="profile-avatar" data-component-slug="avatar" data-component-binding="profile-avatar">
            <img src="./lib/assets/image/avatar/avatar_083.jpg" alt="我的头像" data-current-merchant-avatar>
          </div>
          <span class="my-page__topbar-name" data-current-merchant-name>微购优选商行</span>
          <i class="wego-iconfont-s icon-renzheng my-page__topbar-verified" aria-label="已认证"></i>
          <span class="tag tag--20 tag--brand-stroke my-page__topbar-vip" data-dd-id="vip-tag" data-component-slug="tag" data-component-binding="vip-tag"><span class="tag__label">VIP</span></span>
          <i class="wego-iconfont-s icon-xiajiantou16 my-page__topbar-caret" aria-hidden="true"></i>
        </button>
        <div class="my-page__topbar-actions">
          <button type="button" class="btn btn--weak btn--sm btn--icon-only my-page__topbar-action" aria-label="设置" data-dom-id="open-settings" data-dd-id="settings-button" data-component-slug="button" data-component-binding="topbar-action">
            <i class="btn__icon icon-shezhi"></i>
          </button>
          <button type="button" class="btn btn--weak btn--sm btn--icon-only my-page__topbar-action" aria-label="分享主页" data-dom-id="share-homepage" data-dd-id="share-button" data-component-slug="button" data-component-binding="topbar-action">
            <i class="btn__icon icon-fenxiang"></i>
          </button>
        </div>
      </header>

      <div class="my-page__scroll" data-scroll>
        <div class="my-page__hero">
          <section class="card card--surface my-page__membership-card" data-dd-id="membership-card" data-component-slug="card" data-component-binding="membership-card" data-dom-id="enter-membership">
            <div class="card__content my-page__membership-content">
              <div class="my-page__membership-row">
                <div class="my-page__membership-mark">
                  <img class="my-page__membership-icon" src="./lib/assets/icons/icon-dongtai-svip.svg" alt="">
                  <div>
                    <p class="my-page__membership-label">VIP年度 · 2025.12.31到期</p>
                    <h2 class="my-page__membership-title">超级会员</h2>
                  </div>
                </div>
              </div>
              <div class="my-page__storage">
                <div class="my-page__storage-row">
                  <p class="my-page__storage-value">117.29G / 360G</p>
                  <button type="button" class="link link--12" data-dd-id="storage-action" data-component-slug="link" data-component-binding="storage-action" data-dom-id="manage-storage">管理</button>
                </div>
                <div class="my-page__progress" role="progressbar" aria-label="空间使用进度" aria-valuemin="0" aria-valuemax="360" aria-valuenow="117.29" aria-valuetext="已使用117.29G，共360G">
                  <span class="my-page__progress-value"></span>
                </div>
              </div>
            </div>
          </section>

          <div class="my-page__assets" data-assets-scroll>
            <button type="button" class="my-page__asset-entry my-page__asset-entry--brand" data-asset-key="orders" data-dom-id="open-orders">
              <i class="wego-iconfont-s icon-dingdan my-page__asset-icon" aria-hidden="true"></i>
              <span class="metric metric--16 metric--black my-page__asset-value" data-dd-id="orders-metric" data-component-slug="metric" data-component-binding="orders-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">3</span></span></span></span>
              <span class="my-page__asset-label">我买的</span>
            </button>
            <button type="button" class="my-page__asset-entry" data-asset-key="fans" data-dom-id="open-fans">
              <i class="wego-iconfont-s icon-fensi my-page__asset-icon" aria-hidden="true"></i>
              <span class="metric metric--16 metric--black my-page__asset-value" data-dd-id="asset-metric-fans" data-component-slug="metric" data-component-binding="asset-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">1.2</span><span class="metric__unit">万</span></span></span></span>
              <span class="my-page__asset-label">粉丝</span>
            </button>
            <button type="button" class="my-page__asset-entry" data-asset-key="friends" data-dom-id="open-friends">
              <i class="wego-iconfont-s icon-fensihuiyuanka my-page__asset-icon" aria-hidden="true"></i>
              <span class="metric metric--16 metric--black my-page__asset-value" data-dd-id="asset-metric-friends" data-component-slug="metric" data-component-binding="asset-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">328</span></span></span></span>
              <span class="my-page__asset-label">好友</span>
            </button>
            <button type="button" class="my-page__asset-entry" data-asset-key="agents" data-dom-id="open-agents">
              <i class="wego-iconfont-s icon-fenxiangzhuan my-page__asset-icon" aria-hidden="true"></i>
              <span class="metric metric--16 metric--black my-page__asset-value" data-dd-id="asset-metric-agents" data-component-slug="metric" data-component-binding="asset-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">46</span></span></span></span>
              <span class="my-page__asset-label">代理</span>
            </button>
            <button type="button" class="my-page__asset-entry" data-asset-key="visitors" data-dom-id="open-visitors">
              <i class="wego-iconfont-s icon-fangkejilu my-page__asset-icon" aria-hidden="true"></i>
              <span class="metric metric--16 metric--black my-page__asset-value" data-dd-id="asset-metric-visitors" data-component-slug="metric" data-component-binding="asset-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">892</span></span></span></span>
              <span class="my-page__asset-label">访客</span>
            </button>
            <button type="button" class="my-page__asset-entry" data-asset-key="staff" data-dom-id="open-staff">
              <i class="wego-iconfont-s icon-tuiguangyuan my-page__asset-icon" aria-hidden="true"></i>
              <span class="metric metric--16 metric--black my-page__asset-value" data-dd-id="asset-metric-staff" data-component-slug="metric" data-component-binding="asset-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">12</span></span></span></span>
              <span class="my-page__asset-label">员工</span>
            </button>
            <button type="button" class="my-page__asset-entry" data-asset-key="wallet" data-dom-id="open-wallet">
              <i class="wego-iconfont-s icon-qianbao my-page__asset-icon" aria-hidden="true"></i>
              <span class="metric metric--16 metric--black my-page__asset-value" data-dd-id="asset-metric-wallet" data-component-slug="metric" data-component-binding="asset-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">2,580</span></span></span></span>
              <span class="my-page__asset-label">钱包</span>
            </button>
            <button type="button" class="my-page__asset-entry" data-asset-key="coupons" data-dom-id="open-coupons">
              <i class="wego-iconfont-s icon-quan my-page__asset-icon" aria-hidden="true"></i>
              <span class="metric metric--16 metric--black my-page__asset-value" data-dd-id="asset-metric-coupons" data-component-slug="metric" data-component-binding="asset-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">18</span></span></span></span>
              <span class="my-page__asset-label">卡券</span>
            </button>
            <button type="button" class="my-page__asset-entry" data-asset-key="favorites" data-dom-id="open-favorites">
              <i class="wego-iconfont-s icon-shoucang my-page__asset-icon" aria-hidden="true"></i>
              <span class="metric metric--16 metric--black my-page__asset-value" data-dd-id="asset-metric-favorites" data-component-slug="metric" data-component-binding="asset-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">256</span></span></span></span>
              <span class="my-page__asset-label">收藏</span>
            </button>
          </div>

          <div class="my-page__apps" data-apps-scroll>
            <button type="button" class="my-page__app-entry my-page__app-entry--fixed" data-dom-id="enter-homepage" aria-label="进入主页">
              <span class="my-page__app-icon-host"><i class="wego-iconfont-s icon-shouye my-page__app-icon" aria-hidden="true"></i></span>
              <span class="my-page__app-label">进入主页</span>
            </button>
            <button type="button" class="my-page__app-entry my-page__app-entry--fixed" data-dom-id="view-qrcode" aria-label="查看二维码">
              <span class="my-page__app-icon-host"><i class="wego-iconfont-s icon-erweima my-page__app-icon" aria-hidden="true"></i></span>
              <span class="my-page__app-label">二维码</span>
            </button>
            <span class="my-page__apps-divider" aria-hidden="true"></span>
            <div class="my-page__apps-recent" data-region="recent-apps"></div>
            <button type="button" class="my-page__app-entry my-page__app-entry--all" data-dom-id="open-all-apps" aria-label="查看全部应用">
              <span class="my-page__app-icon-host"><i class="wego-iconfont-s icon-yuanjia my-page__app-icon" aria-hidden="true"></i></span>
              <span class="my-page__app-label">全部</span>
            </button>
          </div>
        </div>

        <div class="my-page__list-sticky" data-list-sticky>
          <div class="wg-tabs wg-tabs--standard wg-tabs--scroll my-page__type-tabs" role="tablist" data-dd-id="type-tabs" data-component-slug="tabs" data-component-binding="type-tabs" data-type-tabs>
            <div class="wg-tabs__scroll">
              <button class="wg-tabs__item" role="tab" aria-selected="true" type="button" data-type-tab="product" data-dom-id="type-tab-product"><span class="wg-tabs__content"><span class="wg-tabs__label">产品</span></span></button>
              <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-type-tab="note" data-dom-id="type-tab-note"><span class="wg-tabs__content"><span class="wg-tabs__label">笔记</span></span></button>
              <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-type-tab="live" data-dom-id="type-tab-live"><span class="wg-tabs__content"><span class="wg-tabs__label">直播</span></span></button>
              <span class="wg-tabs__active-indicator" aria-hidden="true"></span>
            </div>
          </div>
          <div class="my-page__toolbar">
            <div class="search-toolbar">
              <div class="searchbox searchbox--sm searchbox--gray" role="button" tabindex="0" aria-label="搜索产品" data-dom-id="open-search" data-dd-id="list-search" data-component-slug="search" data-component-binding="list-search">
                <span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>
                <div class="searchbox__input"><span class="searchbox__placeholder" data-search-placeholder>搜索产品</span></div>
                <div class="searchbox__actions"></div>
              </div>
              <div class="search-toolbar__actions">
                <button class="search-toolbar__action" type="button" data-dom-id="open-filter">
                  <span class="search-toolbar__action-icon wego-iconfont-s icon-shaixuan" aria-hidden="true"></span>
                  筛选
                </button>
                <button class="search-toolbar__action" type="button" data-dom-id="toggle-view">
                  <span class="search-toolbar__action-icon wego-iconfont-s icon-liebiao" aria-hidden="true" data-view-icon></span>
                  <span data-view-label>列表</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main class="my-page__list" data-region="content-list"></main>
      </div>

      <div class="my-page__publish-focus" data-dom-id="publish-focus" aria-hidden="true"></div>
      <div class="my-page__publish-dock" data-region="publish-dock" data-state="closed" aria-hidden="true">
        <div class="my-page__publish-dock-surface">
          <div class="my-page__publish-list">
            <button type="button" class="my-page__publish-choice" data-dom-id="publish-action-product">
              <span class="my-page__publish-icon-host"><i class="wego-iconfont-s icon-fabushangpin my-page__publish-choice-icon" aria-hidden="true"></i></span>
              <span class="my-page__publish-choice-text">发产品</span>
            </button>
            <button type="button" class="my-page__publish-choice" data-dom-id="publish-action-note">
              <span class="my-page__publish-icon-host"><i class="wego-iconfont-s icon-fabubiji my-page__publish-choice-icon" aria-hidden="true"></i></span>
              <span class="my-page__publish-choice-text">发笔记</span>
            </button>
            <button type="button" class="my-page__publish-choice" data-dom-id="publish-action-live">
              <span class="my-page__publish-icon-host"><i class="wego-iconfont-s icon-zhibo my-page__publish-choice-icon" aria-hidden="true"></i></span>
              <span class="my-page__publish-choice-text">开直播</span>
            </button>
            <button type="button" class="my-page__publish-choice" data-dom-id="publish-action-import">
              <span class="my-page__publish-icon-host"><i class="wego-iconfont-s icon-piliangdaoru my-page__publish-choice-icon" aria-hidden="true"></i></span>
              <span class="my-page__publish-choice-text">批量导入</span>
            </button>
            <button type="button" class="my-page__publish-choice" data-dom-id="publish-action-scan">
              <span class="my-page__publish-icon-host"><i class="wego-iconfont-s icon-saoyisao my-page__publish-choice-icon" aria-hidden="true"></i></span>
              <span class="my-page__publish-choice-text">扫一扫</span>
            </button>
          </div>
        </div>
      </div>
      <button type="button" class="my-page__publish-fab" aria-label="发布内容" aria-haspopup="menu" aria-expanded="false" data-dom-id="open-publish-menu">
        <i class="wego-iconfont-s icon-jia my-page__publish-fab-icon" aria-hidden="true"></i>
      </button>
      <button type="button" class="my-page__cart-fab" aria-label="打开购物车" data-dom-id="open-cart" hidden>
        <i class="wego-iconfont-s icon-gouwuche my-page__cart-fab-icon" aria-hidden="true"></i>
        <span class="badge badge--number badge--corner my-page__cart-fab-badge" data-cart-count data-dd-id="cart-badge" data-component-slug="badge" data-component-binding="cart-badge">0</span>
      </button>
    </section>
  `;

function updateMySceneTabsIndicator(tabs) {
  if (!tabs) return;
  var tabScroll = tabs.querySelector('.wg-tabs__scroll');
  var indicator = tabs.querySelector('.wg-tabs__active-indicator');
  var selected = tabs.querySelector('.wg-tabs__item[aria-selected="true"] .wg-tabs__content');
  if (!tabScroll || !indicator || !selected) return;
  var scrollRect = tabScroll.getBoundingClientRect();
  var selectedRect = selected.getBoundingClientRect();
  indicator.style.setProperty('--_tabs-indicator-x', (selectedRect.left - scrollRect.left + tabScroll.scrollLeft) + 'px');
  indicator.style.setProperty('--_tabs-indicator-width', selectedRect.width + 'px');
}

function renderMySceneList(ctx, root) {
  var listHost = root.querySelector('[data-region="content-list"]');
  if (!listHost) return;
  var currentType = ctx.state.currentType || 'product';
  var viewMode = (ctx.state.viewModePerType && ctx.state.viewModePerType[currentType]) || 'list';
  var items = MY_SCENE_CONTENT_DATA[currentType] || [];

  listHost.classList.toggle('my-page__list--grid', viewMode === 'grid');
  listHost.innerHTML = '';

  if (items.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'my-page__empty';
    empty.textContent = '暂无内容';
    listHost.appendChild(empty);
    return;
  }

  items.forEach(function (item) {
    var cardHtml = ''
      + '<article class="my-page__card">'
      +   '<div class="wg-image my-page__card-cover-wrap" data-dd-id="card-cover-image-' + item.id + '" data-component-slug="image" data-component-binding="card-cover-image">'
      +     '<img class="wg-image__src is-loaded" src="./lib/assets/image/' + item.cover + '" alt="" loading="lazy" decoding="async">'
      +   '</div>'
      +   '<div class="my-page__card-body">'
      +     '<p class="my-page__card-title">' + item.title + '</p>'
      +     '<p class="my-page__card-meta">' + item.published_at + ' · ' + item.stats + '</p>'
      +   '</div>'
      + '</article>';
    var wrapper = document.createElement('div');
    wrapper.innerHTML = cardHtml;
    listHost.appendChild(wrapper.firstElementChild);
  });
}

function syncMySceneViewToggle(root, ctx) {
  var currentType = ctx.state.currentType || 'product';
  var viewMode = (ctx.state.viewModePerType && ctx.state.viewModePerType[currentType]) || 'list';
  var viewIcon = root.querySelector('[data-view-icon]');
  var viewLabel = root.querySelector('[data-view-label]');
  if (viewIcon) {
    viewIcon.classList.toggle('icon-liebiao', viewMode === 'list');
    viewIcon.classList.toggle('icon-tupian', viewMode === 'grid');
  }
  if (viewLabel) {
    viewLabel.textContent = viewMode === 'list' ? '列表' : '网格';
  }
}

function syncMySceneSearchPlaceholder(root, ctx) {
  var currentType = ctx.state.currentType || 'product';
  var tab = MY_SCENE_TYPE_TABS.find(function (t) { return t.key === currentType; });
  var placeholder = root.querySelector('[data-search-placeholder]');
  if (placeholder && tab) {
    placeholder.textContent = tab.placeholder;
  }
  var searchbox = root.querySelector('[data-component-binding="list-search"]');
  if (searchbox) {
    searchbox.setAttribute('aria-label', tab ? tab.placeholder : '搜索');
  }
}

function syncMySceneTypeTabs(root, ctx) {
  var currentType = ctx.state.currentType || 'product';
  root.querySelectorAll('[data-type-tab]').forEach(function (item) {
    item.setAttribute('aria-selected', item.dataset.typeTab === currentType ? 'true' : 'false');
  });
  var tabs = root.querySelector('[data-type-tabs]');
  if (tabs) {
    requestAnimationFrame(function () { updateMySceneTabsIndicator(tabs); });
  }
}

window.WegoApp.registerScene({
    routeId: 'my',
    title: '我的',
    template: mySceneTemplate,
    presentation: {
      type: 'host-tab',
      transition: 'none',
      dismissAction: 'tab-switch',
      overlayLevel: 'inline',
      coversTabBar: false
    },
    init: function initMyScene(ctx) {
      var root = ctx.root;
      var scroll = root.querySelector('[data-scroll]');
      var recentAppsHost = root.querySelector('[data-region="recent-apps"]');
      var publishTrigger = root.querySelector('[data-dom-id="open-publish-menu"]');
      var publishFocus = root.querySelector('[data-dom-id="publish-focus"]');
      var publishDock = root.querySelector('[data-region="publish-dock"]');
      var cartTrigger = root.querySelector('[data-dom-id="open-cart"]');
      var cartBadge = root.querySelector('[data-cart-count]');
      var assetsScroll = root.querySelector('[data-assets-scroll]');
      var appsScroll = root.querySelector('[data-apps-scroll]');
      var removePublishListeners = null;

      // 初始化状态
      if (!ctx.state.currentType) ctx.state.currentType = 'product';
      if (!ctx.state.viewModePerType) ctx.state.viewModePerType = { product: 'list', note: 'list', live: 'list' };
      if (typeof ctx.state.cartCount !== 'number') ctx.state.cartCount = 0;

      // 顶部栏个人信息回填
      var db = window.WEGO_PROTOTYPE_DB || {};
      var currentUser = db.currentUser || (db.users || []).find(function (item) { return item.is_self; }) || {};
      var merchantName = currentUser.merchant_name || currentUser.display_name || '微购优选商行';
      var avatar = root.querySelector('[data-current-merchant-avatar]');
      var name = root.querySelector('[data-current-merchant-name]');
      if (avatar) {
        avatar.src = currentUser.avatar || './lib/assets/image/avatar/avatar_083.jpg';
        avatar.alt = merchantName + '头像';
      }
      if (name) name.textContent = merchantName;

      // 填充最近使用应用（最多4个）
      function refreshRecentApps() {
        if (!recentAppsHost) return;
        recentAppsHost.innerHTML = '';
        var sortedApps = sortAppsByRecentUsage(mySceneAllApps);
        var recentCount = 4;
        for (var i = 0; i < recentCount && i < sortedApps.length; i += 1) {
          recentAppsHost.appendChild(createMySceneRecentAppEntry(sortedApps[i], i));
        }
      }
      refreshRecentApps();

      // 初始化类型tabs状态、搜索placeholder、视图切换按钮、列表
      syncMySceneTypeTabs(root, ctx);
      syncMySceneSearchPlaceholder(root, ctx);
      syncMySceneViewToggle(root, ctx);
      renderMySceneList(ctx, root);

      // tabs 指示器更新
      var tabs = root.querySelector('[data-type-tabs]');
      if (tabs) {
        requestAnimationFrame(function () { updateMySceneTabsIndicator(tabs); });
      }
      var typeTabProduct = root.querySelector('[data-dom-id="type-tab-product"]');
      if (typeTabProduct) {
        typeTabProduct.addEventListener('click', function () {
          var typeKey = typeTabProduct.dataset.typeTab;
          if (!typeKey || typeKey === ctx.state.currentType) return;
          ctx.state.currentType = typeKey;
          ctx.state['switch-type'] = true;
          syncMySceneTypeTabs(root, ctx);
          syncMySceneSearchPlaceholder(root, ctx);
          syncMySceneViewToggle(root, ctx);
          renderMySceneList(ctx, root);
        });
      }
      var typeTabNote = root.querySelector('[data-dom-id="type-tab-note"]');
      if (typeTabNote) {
        typeTabNote.addEventListener('click', function () {
          var typeKey = typeTabNote.dataset.typeTab;
          if (!typeKey || typeKey === ctx.state.currentType) return;
          ctx.state.currentType = typeKey;
          ctx.state['switch-type'] = true;
          syncMySceneTypeTabs(root, ctx);
          syncMySceneSearchPlaceholder(root, ctx);
          syncMySceneViewToggle(root, ctx);
          renderMySceneList(ctx, root);
        });
      }
      var typeTabLive = root.querySelector('[data-dom-id="type-tab-live"]');
      if (typeTabLive) {
        typeTabLive.addEventListener('click', function () {
          var typeKey = typeTabLive.dataset.typeTab;
          if (!typeKey || typeKey === ctx.state.currentType) return;
          ctx.state.currentType = typeKey;
          ctx.state['switch-type'] = true;
          syncMySceneTypeTabs(root, ctx);
          syncMySceneSearchPlaceholder(root, ctx);
          syncMySceneViewToggle(root, ctx);
          renderMySceneList(ctx, root);
        });
      }

      // 视图切换按钮
      var toggleViewBtn = root.querySelector('[data-dom-id="toggle-view"]');
      if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', function () {
          var currentType = ctx.state.currentType || 'product';
          var currentMode = (ctx.state.viewModePerType && ctx.state.viewModePerType[currentType]) || 'list';
          var nextMode = currentMode === 'list' ? 'grid' : 'list';
          ctx.state.viewModePerType[currentType] = nextMode;
          ctx.state['toggle-view'] = true;
          syncMySceneViewToggle(root, ctx);
          renderMySceneList(ctx, root);
        });
      }

      // 顶部栏交互
      root.querySelector('[data-dom-id="switch-album"]').addEventListener('click', function () {
        ctx.toast('已进入切换相册入口');
      });
      root.querySelector('[data-dom-id="open-settings"]').addEventListener('click', function () {
        ctx.toast('已进入设置入口');
      });
      root.querySelector('[data-dom-id="share-homepage"]').addEventListener('click', function () {
        ctx.toast('已触发分享主页');
      });

      // 会员卡入口
      root.querySelector('[data-dom-id="enter-membership"]').addEventListener('click', function (event) {
        if (event.target.closest('[data-dom-id="manage-storage"]')) return;
        ctx.toast('已进入会员中心');
      });
      root.querySelector('[data-dom-id="manage-storage"]').addEventListener('click', function () {
        ctx.toast('已进入空间管理入口');
      });

      // 数据资产入口
      var assetOrders = root.querySelector('[data-dom-id="open-orders"]');
      if (assetOrders) {
        assetOrders.addEventListener('click', function () { ctx.toast('已进入我买的'); });
      }
      var assetFans = root.querySelector('[data-dom-id="open-fans"]');
      if (assetFans) {
        assetFans.addEventListener('click', function () { ctx.toast('已进入粉丝'); });
      }
      var assetFriends = root.querySelector('[data-dom-id="open-friends"]');
      if (assetFriends) {
        assetFriends.addEventListener('click', function () { ctx.toast('已进入好友'); });
      }
      var assetAgents = root.querySelector('[data-dom-id="open-agents"]');
      if (assetAgents) {
        assetAgents.addEventListener('click', function () { ctx.toast('已进入代理'); });
      }
      var assetVisitors = root.querySelector('[data-dom-id="open-visitors"]');
      if (assetVisitors) {
        assetVisitors.addEventListener('click', function () { ctx.toast('已进入访客'); });
      }
      var assetStaff = root.querySelector('[data-dom-id="open-staff"]');
      if (assetStaff) {
        assetStaff.addEventListener('click', function () { ctx.toast('已进入员工'); });
      }
      var assetWallet = root.querySelector('[data-dom-id="open-wallet"]');
      if (assetWallet) {
        assetWallet.addEventListener('click', function () { ctx.toast('已进入钱包'); });
      }
      var assetCoupons = root.querySelector('[data-dom-id="open-coupons"]');
      if (assetCoupons) {
        assetCoupons.addEventListener('click', function () { ctx.toast('已进入卡券'); });
      }
      var assetFavorites = root.querySelector('[data-dom-id="open-favorites"]');
      if (assetFavorites) {
        assetFavorites.addEventListener('click', function () { ctx.toast('已进入收藏'); });
      }

      // 常用应用入口
      root.querySelector('[data-dom-id="enter-homepage"]').addEventListener('click', function () {
        ctx.toast('已进入相册主页');
      });
      root.querySelector('[data-dom-id="view-qrcode"]').addEventListener('click', function () {
        ctx.toast('已展示二维码');
      });
      root.querySelector('[data-dom-id="open-all-apps"]').addEventListener('click', function () {
        ctx.toast('已进入全部应用');
        ctx.navigate('app-center');
      });
      // 最近使用应用入口（动态生成，每次刷新后重新绑定）
      var recentAppEntry = root.querySelector('[data-dom-id="open-recent-app"]');
      if (recentAppEntry) {
        recentAppEntry.addEventListener('click', function (event) {
          event.stopImmediatePropagation();
          var appName = recentAppEntry.dataset.appName;
          recordAppUsage(appName);
          ctx.toast(appName + '入口已打开');
          refreshRecentApps();
          bindRecentAppEntries();
        });
      }
      function bindRecentAppEntries() {
        root.querySelectorAll('[data-dom-id="open-recent-app"]').forEach(function (entry) {
          entry.addEventListener('click', function () {
            var appName = entry.dataset.appName;
            recordAppUsage(appName);
            ctx.toast(appName + '入口已打开');
            refreshRecentApps();
            bindRecentAppEntries();
          });
        });
      }
      bindRecentAppEntries();

      // 工具行搜索与筛选
      root.querySelector('[data-dom-id="open-search"]').addEventListener('click', function () {
        ctx.toast('已进入搜索入口');
      });
      root.querySelector('[data-dom-id="open-filter"]').addEventListener('click', function () {
        ctx.toast('已进入筛选入口');
      });

      // 发布托盘与购物车FAB
      function closePublishMenu() {
        if (publishTrigger) {
          publishTrigger.classList.remove('is-open');
          publishTrigger.setAttribute('aria-expanded', 'false');
        }
        if (publishFocus) publishFocus.classList.remove('is-visible');
        if (publishDock) {
          publishDock.setAttribute('data-state', 'closed');
          publishDock.setAttribute('aria-hidden', 'true');
        }
        ctx.state['publish-dock-open'] = false;
        if (removePublishListeners) {
          removePublishListeners();
          removePublishListeners = null;
        }
      }

      function bindDismissListeners() {
        var onOutsidePointer = function (event) {
          if ((publishTrigger && publishTrigger.contains(event.target))
            || (publishDock && publishDock.contains(event.target))) return;
          closePublishMenu();
        };
        var onDismiss = function () { closePublishMenu(); };
        document.addEventListener('pointerdown', onOutsidePointer, true);
        window.addEventListener('resize', onDismiss);
        scroll.addEventListener('scroll', onDismiss, { once: true });
        removePublishListeners = function () {
          document.removeEventListener('pointerdown', onOutsidePointer, true);
          window.removeEventListener('resize', onDismiss);
          scroll.removeEventListener('scroll', onDismiss);
        };
      }

      function openPublishMenu() {
        if (!publishTrigger || !publishDock) return;
        publishTrigger.classList.add('is-open');
        publishTrigger.setAttribute('aria-expanded', 'true');
        if (publishFocus) publishFocus.classList.add('is-visible');
        publishDock.setAttribute('data-state', 'open');
        publishDock.setAttribute('aria-hidden', 'false');
        ctx.state['publish-dock-open'] = true;
        bindDismissListeners();
      }

      if (publishTrigger) {
        publishTrigger.addEventListener('click', function (event) {
          event.stopPropagation();
          if (publishDock && publishDock.getAttribute('data-state') === 'open') {
            closePublishMenu();
            return;
          }
          openPublishMenu();
        });
      }

      // 发布遮罩点击关闭托盘
      if (publishFocus) {
        publishFocus.addEventListener('click', function () {
          closePublishMenu();
        });
      }

      // 发布动作入口（逐项绑定 listener）
      var publishActionProduct = root.querySelector('[data-dom-id="publish-action-product"]');
      if (publishActionProduct) {
        publishActionProduct.addEventListener('click', function (event) {
          event.stopPropagation();
          closePublishMenu();
          ctx.toast('发产品能力本期暂未开放');
        });
      }
      var publishActionNote = root.querySelector('[data-dom-id="publish-action-note"]');
      if (publishActionNote) {
        publishActionNote.addEventListener('click', function (event) {
          event.stopPropagation();
          closePublishMenu();
          ctx.toast('发笔记能力本期暂未开放');
        });
      }
      var publishActionLive = root.querySelector('[data-dom-id="publish-action-live"]');
      if (publishActionLive) {
        publishActionLive.addEventListener('click', function (event) {
          event.stopPropagation();
          closePublishMenu();
          ctx.toast('开直播能力本期暂未开放');
        });
      }
      var publishActionImport = root.querySelector('[data-dom-id="publish-action-import"]');
      if (publishActionImport) {
        publishActionImport.addEventListener('click', function (event) {
          event.stopPropagation();
          closePublishMenu();
          ctx.toast('批量导入能力本期暂未开放');
        });
      }
      var publishActionScan = root.querySelector('[data-dom-id="publish-action-scan"]');
      if (publishActionScan) {
        publishActionScan.addEventListener('click', function (event) {
          event.stopPropagation();
          closePublishMenu();
          ctx.toast('扫一扫能力本期暂未开放');
        });
      }

      // 购物车FAB显示与点击
      function syncCartFloatingEntry() {
        if (!cartTrigger) return;
        var count = ctx.state.cartCount || 0;
        cartTrigger.hidden = count === 0;
        if (cartBadge) cartBadge.textContent = String(count);
      }
      syncCartFloatingEntry();

      if (cartTrigger) {
        cartTrigger.addEventListener('click', function () {
          ctx.toast('已进入购物车');
        });
      }

      // 监听窗口尺寸变化更新tabs指示器
      var onResize = function () {
        if (tabs) updateMySceneTabsIndicator(tabs);
      };
      window.addEventListener('resize', onResize);

      ctx.onDestroy(function () {
        if (removePublishListeners) removePublishListeners();
        window.removeEventListener('resize', onResize);
      });
    }
});
