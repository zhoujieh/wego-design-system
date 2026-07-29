/* wego-design-contract: {
  "surface_id": "my-page",
  "route_id": "my-page",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "host-tab",
    "transition": "none",
    "dismissAction": "none",
    "overlayLevel": "none",
    "coversTabBar": false,
    "source": "library-consumption.json#/appRuntime/presentationTypes"
  },
  "prompt_contract": {
    "design_system_version": 484,
    "token_bindings": [
      { "selector": ".my-page", "content_role": "页面根背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".my-page__scroll", "content_role": "主滚动区底部安全区", "css_property": "padding-bottom", "token": "var(--safe-area-bottom-content)" },
      { "selector": ".my-page__navbar", "content_role": "导航栏背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".my-page__identity", "content_role": "身份区间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__identity-name", "content_role": "身份名称字号", "css_property": "font-size", "token": "var(--body-lg-font-size)" },
      { "selector": ".my-page__identity-name", "content_role": "身份名称字重", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".my-page__identity-name", "content_role": "身份名称颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__identity-name", "content_role": "身份名称行高", "css_property": "line-height", "token": "var(--body-lg-line-height)" },
      { "selector": ".my-page__identity-verified", "content_role": "认证图标字号", "css_property": "font-size", "token": "var(--size-16)" },
      { "selector": ".my-page__identity-verified", "content_role": "认证图标颜色", "css_property": "color", "token": "var(--bg-brand)" },
      { "selector": ".my-page__identity-caret", "content_role": "下拉箭头字号", "css_property": "font-size", "token": "var(--size-16)" },
      { "selector": ".my-page__identity-caret", "content_role": "下拉箭头颜色", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".my-page__membership", "content_role": "会员卡片外边距", "css_property": "margin", "token": "var(--spacer-8)" },
      { "selector": ".my-page__membership", "content_role": "会员卡片块间距", "css_property": "padding-block", "token": "var(--spacer-12)" },
      { "selector": ".my-page__membership", "content_role": "会员卡片横向边距", "css_property": "padding-inline", "token": "var(--spacer-8)" },
      { "selector": ".my-page__membership-content", "content_role": "会员内容间距", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".my-page__membership-left", "content_role": "会员左侧间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__membership-level", "content_role": "会员等级字号", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".my-page__membership-level", "content_role": "会员等级字重", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".my-page__membership-level", "content_role": "会员等级颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__membership-level", "content_role": "会员等级行高", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".my-page__membership-expire", "content_role": "到期时间字号", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".my-page__membership-expire", "content_role": "到期时间颜色", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".my-page__membership-expire", "content_role": "到期时间行高", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".my-page__membership-cloud", "content_role": "云空间字号", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".my-page__membership-cloud", "content_role": "云空间颜色", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".my-page__membership-cloud", "content_role": "云空间行高", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".my-page__assets", "content_role": "资产区域上边距", "css_property": "margin-top", "token": "var(--spacer-12)" },
      { "selector": ".my-page__assets", "content_role": "资产区域块间距", "css_property": "padding-block", "token": "var(--spacer-12)" },
      { "selector": ".my-page__assets", "content_role": "资产区域背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".my-page__assets-scroll", "content_role": "资产横滑间距", "css_property": "gap", "token": "var(--spacer-24)" },
      { "selector": ".my-page__asset-item", "content_role": "资产项间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".my-page__asset-value", "content_role": "资产数值字号", "css_property": "font-size", "token": "var(--body-lg-font-size)" },
      { "selector": ".my-page__asset-value", "content_role": "资产数值字重", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".my-page__asset-value", "content_role": "资产数值颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__asset-value", "content_role": "资产数值行高", "css_property": "line-height", "token": "var(--body-lg-line-height)" },
      { "selector": ".my-page__asset-label", "content_role": "资产标签字号", "css_property": "font-size", "token": "var(--body-xs-font-size)" },
      { "selector": ".my-page__asset-label", "content_role": "资产标签颜色", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".my-page__asset-label", "content_role": "资产标签行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__apps", "content_role": "应用区域上边距", "css_property": "margin-top", "token": "var(--spacer-8)" },
      { "selector": ".my-page__apps", "content_role": "应用区域块间距", "css_property": "padding-block", "token": "var(--spacer-12)" },
      { "selector": ".my-page__apps", "content_role": "应用区域背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".my-page__apps-scroll", "content_role": "应用横滑间距", "css_property": "gap", "token": "var(--spacer-16)" },
      { "selector": ".my-page__app-item", "content_role": "应用项间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".my-page__app-icon", "content_role": "应用图标字号", "css_property": "font-size", "token": "var(--size-24)" },
      { "selector": ".my-page__app-icon", "content_role": "应用图标颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__app-label", "content_role": "应用标签字号", "css_property": "font-size", "token": "var(--body-xs-font-size)" },
      { "selector": ".my-page__app-label", "content_role": "应用标签颜色", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".my-page__app-label", "content_role": "应用标签行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__tabs", "content_role": "类型 tabs 上边距", "css_property": "margin-top", "token": "var(--spacer-8)" },
      { "selector": ".my-page__tabs", "content_role": "类型 tabs 背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".my-page__toolbar", "content_role": "工具行间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__toolbar", "content_role": "工具行内边距", "css_property": "padding", "token": "var(--spacer-8)" },
      { "selector": ".my-page__toolbar", "content_role": "工具行背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".my-page__toolbar", "content_role": "工具行底边框", "css_property": "border-bottom", "token": "var(--border-neutral-l2)" },
      { "selector": ".my-page__content", "content_role": "内容区内边距", "css_property": "padding", "token": "var(--spacer-8)" },
      { "selector": ".my-page__content", "content_role": "内容区背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".my-page__content[data-view=\"list\"] .my-page__list", "content_role": "列表视图间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__content[data-view=\"grid\"] .my-page__list", "content_role": "网格视图间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__card-image", "content_role": "卡片图片背景", "css_property": "background", "token": "var(--bg-subtle)" },
      { "selector": ".my-page__card-body", "content_role": "卡片正文块内边距", "css_property": "padding-block", "token": "var(--spacer-8)" },
      { "selector": ".my-page__card-body", "content_role": "卡片正文横向内边距", "css_property": "padding-inline", "token": "var(--spacer-12)" },
      { "selector": ".my-page__card-title", "content_role": "卡片标题字号", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".my-page__card-title", "content_role": "卡片标题字重", "css_property": "font-weight", "token": "var(--font-weight-regular)" },
      { "selector": ".my-page__card-title", "content_role": "卡片标题颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__card-title", "content_role": "卡片标题行高", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".my-page__card-meta", "content_role": "卡片元数据间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__card-meta", "content_role": "卡片元数据上边距", "css_property": "margin-top", "token": "var(--spacer-4)" },
      { "selector": ".my-page__card-sales", "content_role": "卡片销量字号", "css_property": "font-size", "token": "var(--body-xs-font-size)" },
      { "selector": ".my-page__card-sales", "content_role": "卡片销量颜色", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".my-page__card-sales", "content_role": "卡片销量行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".my-page__fab", "content_role": "发布 FAB 圆角", "css_property": "border-radius", "token": "var(--radius-full)" },
      { "selector": ".my-page__fab", "content_role": "发布 FAB 背景", "css_property": "background", "token": "var(--bg-brand)" },
      { "selector": ".my-page__fab", "content_role": "发布 FAB 文字颜色", "css_property": "color", "token": "var(--text-inverse)" },
      { "selector": ".my-page__fab", "content_role": "发布 FAB 图标字号", "css_property": "font-size", "token": "var(--size-24)" },
      { "selector": ".my-page__fab:active", "content_role": "发布 FAB 按压背景", "css_property": "background", "token": "var(--bg-brand-hover)" }
    ],
    "component_bindings": [
      {
        "binding_id": "identity-avatar",
        "slug": "avatar",
        "reason": "导航栏左侧个人信息头像",
        "principle_refs": ["wego-clarity-contextual-function"],
        "variant_dimensions": { "type": "image", "size": "40" }
      },
      {
        "binding_id": "identity-tag",
        "slug": "tag",
        "reason": "身份区 VIP 标签",
        "principle_refs": ["wego-clarity-contextual-function"],
        "variant_dimensions": { "size": "20", "theme": "brand-stroke" }
      },
      {
        "binding_id": "navbar-actions",
        "slug": "navbar",
        "reason": "导航栏右侧设置与分享入口",
        "principle_refs": ["wego-efficiency-primary-action-right"],
        "variant_dimensions": {
          "layout": "two-part",
          "leftControl": "custom",
          "titleAlignment": "custom",
          "actions": "icon",
          "rightActionType": "icon",
          "position": "sticky"
        }
      },
      {
        "binding_id": "membership-card",
        "slug": "card",
        "reason": "会员信息卡片",
        "principle_refs": ["wego-clarity-information-flow"],
        "variant_dimensions": { "surface": "surface" }
      },
      {
        "binding_id": "asset-purchased",
        "slug": "metric",
        "reason": "我买的资产入口",
        "principle_refs": ["wego-aesthetics-data-expression"],
        "variant_dimensions": { "size": "14", "theme": "marketing" }
      },
      {
        "binding_id": "asset-fans",
        "slug": "metric",
        "reason": "粉丝资产入口",
        "principle_refs": ["wego-aesthetics-data-expression"],
        "variant_dimensions": { "size": "14", "theme": "marketing" }
      },
      {
        "binding_id": "asset-friends",
        "slug": "metric",
        "reason": "好友资产入口",
        "principle_refs": ["wego-aesthetics-data-expression"],
        "variant_dimensions": { "size": "14", "theme": "marketing" }
      },
      {
        "binding_id": "asset-agents",
        "slug": "metric",
        "reason": "代理资产入口",
        "principle_refs": ["wego-aesthetics-data-expression"],
        "variant_dimensions": { "size": "14", "theme": "marketing" }
      },
      {
        "binding_id": "asset-visitors",
        "slug": "metric",
        "reason": "访客资产入口",
        "principle_refs": ["wego-aesthetics-data-expression"],
        "variant_dimensions": { "size": "14", "theme": "marketing" }
      },
      {
        "binding_id": "asset-wallet",
        "slug": "metric",
        "reason": "钱包资产入口",
        "principle_refs": ["wego-aesthetics-data-expression"],
        "variant_dimensions": { "size": "14", "theme": "marketing" }
      },
      {
        "binding_id": "asset-coupons",
        "slug": "metric",
        "reason": "卡券资产入口",
        "principle_refs": ["wego-aesthetics-data-expression"],
        "variant_dimensions": { "size": "14", "theme": "marketing" }
      },
      {
        "binding_id": "asset-favorites",
        "slug": "metric",
        "reason": "收藏资产入口",
        "principle_refs": ["wego-aesthetics-data-expression"],
        "variant_dimensions": { "size": "14", "theme": "marketing" }
      },
      {
        "binding_id": "content-tabs",
        "slug": "tabs",
        "reason": "内容类型切换 tabs",
        "principle_refs": ["wego-clarity-single-primary-task"],
        "variant_dimensions": { "size": "standard", "layout": "scroll" }
      },
      {
        "binding_id": "search-toolbar",
        "slug": "search",
        "reason": "搜索与筛选工具栏",
        "principle_refs": ["wego-efficiency-step-reduction"],
        "variant_dimensions": { "size": "sm", "surface": "white" }
      },
      {
        "binding_id": "content-card",
        "slug": "card",
        "reason": "内容卡片",
        "principle_refs": ["wego-consistency-same-pattern"],
        "variant_dimensions": { "surface": "surface" }
      },
      {
        "binding_id": "card-metric",
        "slug": "metric",
        "reason": "卡片价格展示",
        "principle_refs": ["wego-aesthetics-data-expression"],
        "variant_dimensions": { "size": "14", "theme": "marketing" }
      },
      {
        "binding_id": "publish-fab",
        "slug": "button",
        "reason": "发布 FAB 悬浮按钮",
        "principle_refs": ["wego-efficiency-primary-action-right"],
        "variant_dimensions": { "emphasis": "strong", "size": "md", "iconMode": "icon-only", "state": "default" }
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "页面以内容管理和资产查看为首要任务；导航栏通栏，会员栏、资产区、应用区、tabs、工具行和内容列表按语义分组纵向排列，tabs 吸顶",
      "principle_refs": ["wego-clarity-single-primary-task", "wego-clarity-information-flow"],
      "mutable_regions": [".my-page__scroll"],
      "page_layers": [
        { "region_id": "my-page-navbar", "selector": ".my-page__navbar", "role": "navigation", "scope": "page-local" },
        { "region_id": "my-page-scroll", "selector": ".my-page__scroll", "role": "content", "scope": "page-local" },
        { "region_id": "my-page-fab", "selector": ".my-page__fab", "role": "navigation", "scope": "page-local" }
      ],
      "scroll_architecture": {
        "viewport_selector": ".my-page",
        "primary_scroll_selector": ".my-page__scroll",
        "document_scroll": false,
        "nested_scroll_regions": [
          { "region_id": "assets-scroll", "selector": ".my-page__assets-scroll", "parent_selector": ".my-page__scroll", "axis": "x" },
          { "region_id": "apps-scroll", "selector": ".my-page__apps-scroll", "parent_selector": ".my-page__scroll", "axis": "x" }
        ],
        "fixed_regions": [
          { "region_id": "my-page-fab", "selector": ".my-page__fab", "edge": "bottom", "safe_area_owner": "component", "clearance": "dynamic-measured", "after_gap_token": "var(--spacer-16)" }
        ]
      },
      "layout_groups": [
        { "group_id": "membership-group", "selector": ".my-page__membership", "content_role": "会员信息组", "inline_inset_token": "var(--spacer-8)", "spacing_owner": "scene", "gap_token": "var(--spacer-8)" },
        { "group_id": "assets-group", "selector": ".my-page__assets", "content_role": "数据资产组", "inline_inset_token": "var(--layout-page-margin-m0)", "spacing_owner": "scene", "gap_token": "var(--spacer-8)" },
        { "group_id": "apps-group", "selector": ".my-page__apps", "content_role": "常用应用组", "inline_inset_token": "var(--layout-page-margin-m0)", "spacing_owner": "scene", "gap_token": "var(--spacer-8)" },
        { "group_id": "content-group", "selector": ".my-page__content", "content_role": "内容列表组", "inline_inset_token": "var(--layout-page-margin-m0)", "spacing_owner": "scene", "gap_token": "var(--spacer-8)" }
      ],
      "sticky_regions": [
        { "region_id": "my-page-tabs", "selector": ".my-page__tabs", "scroll_selector": ".my-page__scroll", "edge": "top", "stack_order": 10, "visibility": "always", "background_token": "var(--bg-surface)", "layer_role": "navigation", "after_gap_token": "var(--spacer-0)", "scroll_padding": "flow-reserved", "essential": true }
      ]
    },
    "interaction_contract": [
      { "dom_id": "identity-switch", "target": "feedback:toast" },
      { "dom_id": "settings-entry", "target": "feedback:toast" },
      { "dom_id": "share-entry", "target": "feedback:toast" },
      { "dom_id": "asset-purchased", "target": "feedback:toast" },
      { "dom_id": "asset-fans", "target": "feedback:toast" },
      { "dom_id": "asset-friends", "target": "feedback:toast" },
      { "dom_id": "asset-agents", "target": "feedback:toast" },
      { "dom_id": "asset-visitors", "target": "feedback:toast" },
      { "dom_id": "asset-wallet", "target": "feedback:toast" },
      { "dom_id": "asset-coupons", "target": "feedback:toast" },
      { "dom_id": "asset-favorites", "target": "feedback:toast" },
      { "dom_id": "app-homepage", "target": "feedback:toast" },
      { "dom_id": "app-qrcode", "target": "feedback:toast" },
      { "dom_id": "app-recent1", "target": "feedback:toast" },
      { "dom_id": "app-recent2", "target": "feedback:toast" },
      { "dom_id": "app-all", "target": "feedback:toast" },
      { "dom_id": "tab-products", "target": "state:tab-switch" },
      { "dom_id": "tab-notes", "target": "state:tab-switch" },
      { "dom_id": "tab-lives", "target": "state:tab-switch" },
      { "dom_id": "search-input", "target": "feedback:toast" },
      { "dom_id": "filter-entry", "target": "feedback:toast" },
      { "dom_id": "view-toggle", "target": "state:view-toggle" },
      { "dom_id": "content-card-1", "target": "feedback:toast" },
      { "dom_id": "content-card-2", "target": "feedback:toast" },
      { "dom_id": "content-card-3", "target": "feedback:toast" },
      { "dom_id": "publish-fab", "target": "feedback:toast" }
    ],
    "state_contract": [
      {
        "state_id": "initial",
        "initial": true,
        "trigger": "场景进入",
        "visible_result": "展示会员信息、8个资产入口、5个应用入口、产品 tab 默认选中、列表视图、3个示例内容卡片",
        "fallback": "保留默认示例数据",
        "persistence": "memory"
      },
      {
        "state_id": "tab-switch",
        "initial": false,
        "trigger": "点击产品/笔记/直播 tab",
        "visible_result": "tab 切换选中态，指示器滑动到对应位置，列表内容更新",
        "fallback": "保持当前 tab",
        "persistence": "memory"
      },
      {
        "state_id": "view-toggle",
        "initial": false,
        "trigger": "点击视图切换按钮",
        "visible_result": "列表/网格视图切换，按钮图标和文案同步变化",
        "fallback": "保持当前视图",
        "persistence": "memory"
      }
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-29T12:00:00Z",
    "checks": {
      "horizontal_overflow": true,
      "overlap": true,
      "clipping": true,
      "action_legibility": true,
      "primary_focus": true,
      "state_feedback": true
    }
  }
} */
window.WegoApp.registerScene({
  routeId: 'my-page',
  scene: '微购相册我的',
  entry: { type: 'host-tab', tab: 'my', label: '我的' },
  presentation: { type: 'host-tab', transition: 'none', dismissAction: 'none', overlayLevel: 'none', coversTabBar: false },
  script: 'scenes/微购相册我的/scene.js',
  style: 'scenes/微购相册我的/scene.css',
  template: `
    <div class="my-page" data-bg="page" data-surface-id="my-page" data-route-id="my-page" data-layout-mode="composed">
      <div class="navbar my-page__navbar" data-dd-id="navbar-actions" data-component-slug="navbar" data-component-binding="navbar-actions">
        <div class="navbar__body navbar__body--split">
          <div class="navbar__left navbar__left--custom">
            <button type="button" class="my-page__identity" aria-label="切换相册" data-dom-id="identity-switch">
              <div class="avatar avatar--40 avatar--image" data-dd-id="identity-avatar" data-component-slug="avatar" data-component-binding="identity-avatar">
                <img src="./lib/assets/image/avatar/avatar_083.jpg" alt="">
              </div>
              <span class="my-page__identity-name">微购优选商行</span>
              <i class="wego-iconfont-s icon-renzheng my-page__identity-verified" aria-label="已认证"></i>
              <span class="tag tag--20 tag--brand-stroke" data-dd-id="identity-tag" data-component-slug="tag" data-component-binding="identity-tag"><span class="tag__label">VIP</span></span>
              <i class="wego-iconfont-s icon-xiajiantou16 my-page__identity-caret" aria-hidden="true"></i>
            </button>
          </div>
          <div class="navbar__right navbar__right--icon">
            <div class="navbar__action" data-action="settings" data-dom-id="settings-entry">
              <div class="navbar__action-icon"><i class="wego-iconfont-s icon-shezhi"></i></div>
              <span class="navbar__action-label">设置</span>
            </div>
            <div class="navbar__action" data-action="share" data-dom-id="share-entry">
              <div class="navbar__action-icon"><i class="wego-iconfont-s icon-fenxiang"></i></div>
              <span class="navbar__action-label">分享</span>
            </div>
          </div>
        </div>
      </div>
      <div class="my-page__scroll">
        <div class="my-page__membership card card--surface" data-dd-id="membership-card" data-component-slug="card" data-component-binding="membership-card">
          <div class="my-page__membership-content">
            <div class="my-page__membership-left">
              <span class="my-page__membership-level">黄金会员</span>
              <span class="my-page__membership-expire">2026-12-31 到期</span>
            </div>
            <div class="my-page__membership-right">
              <span class="my-page__membership-cloud">云空间 2.4GB / 5GB</span>
            </div>
          </div>
        </div>
        <div class="my-page__assets">
          <div class="my-page__assets-scroll">
            <div class="my-page__asset-item metric metric--14 metric--marketing" data-asset="purchased" data-dom-id="asset-purchased" data-dd-id="asset-purchased" data-component-slug="metric" data-component-binding="asset-purchased">
              <span class="metric__main">
                <span class="my-page__asset-value">3</span>
              </span>
              <span class="my-page__asset-label">我买的</span>
            </div>
            <div class="my-page__asset-item metric metric--14 metric--marketing" data-asset="fans" data-dom-id="asset-fans" data-dd-id="asset-fans" data-component-slug="metric" data-component-binding="asset-fans">
              <span class="metric__main">
                <span class="my-page__asset-value">1,280</span>
              </span>
              <span class="my-page__asset-label">粉丝</span>
            </div>
            <div class="my-page__asset-item metric metric--14 metric--marketing" data-asset="friends" data-dom-id="asset-friends" data-dd-id="asset-friends" data-component-slug="metric" data-component-binding="asset-friends">
              <span class="metric__main">
                <span class="my-page__asset-value">328</span>
              </span>
              <span class="my-page__asset-label">好友</span>
            </div>
            <div class="my-page__asset-item metric metric--14 metric--marketing" data-asset="agents" data-dom-id="asset-agents" data-dd-id="asset-agents" data-component-slug="metric" data-component-binding="asset-agents">
              <span class="metric__main">
                <span class="my-page__asset-value">56</span>
              </span>
              <span class="my-page__asset-label">代理</span>
            </div>
            <div class="my-page__asset-item metric metric--14 metric--marketing" data-asset="visitors" data-dom-id="asset-visitors" data-dd-id="asset-visitors" data-component-slug="metric" data-component-binding="asset-visitors">
              <span class="metric__main">
                <span class="my-page__asset-value">892</span>
              </span>
              <span class="my-page__asset-label">访客</span>
            </div>
            <div class="my-page__asset-item metric metric--14 metric--marketing" data-asset="wallet" data-dom-id="asset-wallet" data-dd-id="asset-wallet" data-component-slug="metric" data-component-binding="asset-wallet">
              <span class="metric__main">
                <span class="my-page__asset-value">2,456</span>
              </span>
              <span class="my-page__asset-label">钱包</span>
            </div>
            <div class="my-page__asset-item metric metric--14 metric--marketing" data-asset="coupons" data-dom-id="asset-coupons" data-dd-id="asset-coupons" data-component-slug="metric" data-component-binding="asset-coupons">
              <span class="metric__main">
                <span class="my-page__asset-value">12</span>
              </span>
              <span class="my-page__asset-label">卡券</span>
            </div>
            <div class="my-page__asset-item metric metric--14 metric--marketing" data-asset="favorites" data-dom-id="asset-favorites" data-dd-id="asset-favorites" data-component-slug="metric" data-component-binding="asset-favorites">
              <span class="metric__main">
                <span class="my-page__asset-value">168</span>
              </span>
              <span class="my-page__asset-label">收藏</span>
            </div>
          </div>
        </div>
        <div class="my-page__apps">
          <div class="my-page__apps-scroll">
            <div class="my-page__app-item" data-app="homepage" data-dom-id="app-homepage">
              <i class="wego-iconfont-s icon-shouye my-page__app-icon"></i>
              <span class="my-page__app-label">进入主页</span>
            </div>
            <div class="my-page__app-item" data-app="qrcode" data-dom-id="app-qrcode">
              <i class="wego-iconfont-s icon-erweima my-page__app-icon"></i>
              <span class="my-page__app-label">二维码</span>
            </div>
            <div class="my-page__app-item" data-app="recent1" data-dom-id="app-recent1">
              <i class="wego-iconfont-s icon-chengchangzhongxin my-page__app-icon"></i>
              <span class="my-page__app-label">成长中心</span>
            </div>
            <div class="my-page__app-item" data-app="recent2" data-dom-id="app-recent2">
              <i class="wego-iconfont-s icon-dianpu my-page__app-icon"></i>
              <span class="my-page__app-label">店铺管理</span>
            </div>
            <div class="my-page__app-item" data-app="all" data-dom-id="app-all">
              <i class="wego-iconfont-s icon-gengduo my-page__app-icon"></i>
              <span class="my-page__app-label">全部</span>
            </div>
          </div>
        </div>
        <div class="my-page__tabs wg-tabs wg-tabs--standard wg-tabs--scroll" role="tablist" data-tabs data-dd-id="content-tabs" data-component-slug="tabs" data-component-binding="content-tabs">
          <div class="wg-tabs__scroll">
            <button class="wg-tabs__item" role="tab" aria-selected="true" type="button" data-tab="products" data-dom-id="tab-products">
              <span class="wg-tabs__content"><span class="wg-tabs__label">产品</span></span>
            </button>
            <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-tab="notes" data-dom-id="tab-notes">
              <span class="wg-tabs__content"><span class="wg-tabs__label">笔记</span></span>
            </button>
            <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-tab="lives" data-dom-id="tab-lives">
              <span class="wg-tabs__content"><span class="wg-tabs__label">直播</span></span>
            </button>
            <span class="wg-tabs__active-indicator" aria-hidden="true"></span>
          </div>
        </div>
        <div class="my-page__toolbar search-toolbar">
          <div class="searchbox searchbox--sm searchbox--white" data-dom-id="search-input" data-dd-id="search-toolbar" data-component-slug="search" data-component-binding="search-toolbar">
            <span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>
            <div class="searchbox__input">
              <input class="searchbox__field" type="search" placeholder="搜索内容" aria-label="搜索内容">
            </div>
            <div class="searchbox__actions"></div>
          </div>
          <div class="search-toolbar__actions">
            <button class="search-toolbar__action" type="button" data-action="filter" data-dom-id="filter-entry">
              <span class="search-toolbar__action-icon wego-iconfont-s icon-shaixuan" aria-hidden="true"></span>
              筛选
            </button>
            <button class="search-toolbar__action" type="button" data-action="view-toggle" data-dom-id="view-toggle">
              <span class="search-toolbar__action-icon wego-iconfont-s icon-liebiao" aria-hidden="true"></span>
              列表
            </button>
          </div>
        </div>
        <div class="my-page__content" data-view="list">
          <div class="my-page__list">
            <div class="my-page__card card card--surface" data-content-id="1" data-dom-id="content-card-1" data-dd-id="content-card-1" data-component-slug="card" data-component-binding="content-card">
              <div class="my-page__card-image">
                <img src="./lib/assets/image/clothing/clothing_1/1663741067252_48951.jpg" alt="">
              </div>
              <div class="my-page__card-body">
                <div class="my-page__card-title">春季新款女装连衣裙</div>
                <div class="my-page__card-meta">
                  <span class="metric metric--14 metric--marketing" data-dd-id="card-metric-1" data-component-slug="metric" data-component-binding="card-metric">
                    <span class="metric__main">
                      <span class="metric__symbol">¥</span>
                      <span class="metric__value">
                        <span class="metric__integer">199</span>
                      </span>
                    </span>
                  </span>
                  <span class="my-page__card-sales">已售 128</span>
                </div>
              </div>
            </div>
            <div class="my-page__card card card--surface" data-content-id="2" data-dom-id="content-card-2" data-dd-id="content-card-2" data-component-slug="card" data-component-binding="content-card">
              <div class="my-page__card-image">
                <img src="./lib/assets/image/clothing/clothing_2/1663741015636_57550.jpg" alt="">
              </div>
              <div class="my-page__card-body">
                <div class="my-page__card-title">时尚百搭T恤</div>
                <div class="my-page__card-meta">
                  <span class="metric metric--14 metric--marketing" data-dd-id="card-metric-2" data-component-slug="metric" data-component-binding="card-metric">
                    <span class="metric__main">
                      <span class="metric__symbol">¥</span>
                      <span class="metric__value">
                        <span class="metric__integer">99</span>
                      </span>
                    </span>
                  </span>
                  <span class="my-page__card-sales">已售 256</span>
                </div>
              </div>
            </div>
            <div class="my-page__card card card--surface" data-content-id="3" data-dom-id="content-card-3" data-dd-id="content-card-3" data-component-slug="card" data-component-binding="content-card">
              <div class="my-page__card-image">
                <img src="./lib/assets/image/clothing/clothing_3/1664276865083_43086.jpg" alt="">
              </div>
              <div class="my-page__card-body">
                <div class="my-page__card-title">休闲牛仔裤</div>
                <div class="my-page__card-meta">
                  <span class="metric metric--14 metric--marketing" data-dd-id="card-metric-3" data-component-slug="metric" data-component-binding="card-metric">
                    <span class="metric__main">
                      <span class="metric__symbol">¥</span>
                      <span class="metric__value">
                        <span class="metric__integer">299</span>
                      </span>
                    </span>
                  </span>
                  <span class="my-page__card-sales">已售 89</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button type="button" class="my-page__fab btn btn--strong btn--md btn--icon-only" aria-label="发布" data-dom-id="publish-fab" data-dd-id="publish-fab" data-component-slug="button" data-component-binding="publish-fab">
        <span class="btn__icon wego-iconfont-s icon-jia16"></span>
      </button>
    </div>
  `,
  init(ctx) {
    const root = ctx.root;
    const tabs = root.querySelector('[data-tabs]');
    const tabItems = tabs.querySelectorAll('.wg-tabs__item');
    const indicator = tabs.querySelector('.wg-tabs__active-indicator');
    const scroll = tabs.querySelector('.wg-tabs__scroll');
    const content = root.querySelector('.my-page__content');
    const viewToggle = root.querySelector('[data-dom-id="view-toggle"]');
    const viewToggleIcon = viewToggle.querySelector('.search-toolbar__action-icon');
    const viewToggleLabel = viewToggle.childNodes[viewToggle.childNodes.length - 1];

    function updateIndicator() {
      const selected = tabs.querySelector('.wg-tabs__item[aria-selected="true"] .wg-tabs__content');
      if (!selected || !indicator || !scroll) return;
      const scrollRect = scroll.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();
      indicator.style.setProperty('--_tabs-indicator-x', (selectedRect.left - scrollRect.left + scroll.scrollLeft) + 'px');
      indicator.style.setProperty('--_tabs-indicator-width', selectedRect.width + 'px');
    }

    root.querySelector('[data-dom-id="tab-products"]').addEventListener('click', () => {
      tabItems.forEach(candidate => {
        candidate.setAttribute('aria-selected', String(candidate.getAttribute('data-tab') === 'products'));
      });
      updateIndicator();
      root.querySelector('[data-dom-id="tab-products"]').scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      ctx.state.set('tab-switch', 'products');
    });

    root.querySelector('[data-dom-id="tab-notes"]').addEventListener('click', () => {
      tabItems.forEach(candidate => {
        candidate.setAttribute('aria-selected', String(candidate.getAttribute('data-tab') === 'notes'));
      });
      updateIndicator();
      root.querySelector('[data-dom-id="tab-notes"]').scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      ctx.state.set('tab-switch', 'notes');
    });

    root.querySelector('[data-dom-id="tab-lives"]').addEventListener('click', () => {
      tabItems.forEach(candidate => {
        candidate.setAttribute('aria-selected', String(candidate.getAttribute('data-tab') === 'lives'));
      });
      updateIndicator();
      root.querySelector('[data-dom-id="tab-lives"]').scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      ctx.state.set('tab-switch', 'lives');
    });

    requestAnimationFrame(updateIndicator);
    window.addEventListener('resize', updateIndicator);

    viewToggle.addEventListener('click', () => {
      const currentView = content.getAttribute('data-view');
      const newView = currentView === 'list' ? 'grid' : 'list';
      content.setAttribute('data-view', newView);
      if (newView === 'grid') {
        viewToggleIcon.className = 'search-toolbar__action-icon wego-iconfont-s icon-wangge';
        viewToggleLabel.textContent = '网格';
      } else {
        viewToggleIcon.className = 'search-toolbar__action-icon wego-iconfont-s icon-liebiao';
        viewToggleLabel.textContent = '列表';
      }
      ctx.state.set('view-toggle', newView);
    });

    root.querySelector('[data-dom-id="identity-switch"]').addEventListener('click', () => {
      ctx.toast('切换相册');
    });

    root.querySelector('[data-dom-id="settings-entry"]').addEventListener('click', () => {
      ctx.toast('设置入口');
    });

    root.querySelector('[data-dom-id="share-entry"]').addEventListener('click', () => {
      ctx.toast('分享入口');
    });

    root.querySelector('[data-dom-id="asset-purchased"]').addEventListener('click', () => {
      ctx.toast('资产入口: 我买的');
    });
    root.querySelector('[data-dom-id="asset-fans"]').addEventListener('click', () => {
      ctx.toast('资产入口: 粉丝');
    });
    root.querySelector('[data-dom-id="asset-friends"]').addEventListener('click', () => {
      ctx.toast('资产入口: 好友');
    });
    root.querySelector('[data-dom-id="asset-agents"]').addEventListener('click', () => {
      ctx.toast('资产入口: 代理');
    });
    root.querySelector('[data-dom-id="asset-visitors"]').addEventListener('click', () => {
      ctx.toast('资产入口: 访客');
    });
    root.querySelector('[data-dom-id="asset-wallet"]').addEventListener('click', () => {
      ctx.toast('资产入口: 钱包');
    });
    root.querySelector('[data-dom-id="asset-coupons"]').addEventListener('click', () => {
      ctx.toast('资产入口: 卡券');
    });
    root.querySelector('[data-dom-id="asset-favorites"]').addEventListener('click', () => {
      ctx.toast('资产入口: 收藏');
    });

    root.querySelector('[data-dom-id="app-homepage"]').addEventListener('click', () => {
      ctx.toast('应用入口: 进入主页');
    });
    root.querySelector('[data-dom-id="app-qrcode"]').addEventListener('click', () => {
      ctx.toast('应用入口: 二维码');
    });
    root.querySelector('[data-dom-id="app-recent1"]').addEventListener('click', () => {
      ctx.toast('应用入口: 成长中心');
    });
    root.querySelector('[data-dom-id="app-recent2"]').addEventListener('click', () => {
      ctx.toast('应用入口: 店铺管理');
    });
    root.querySelector('[data-dom-id="app-all"]').addEventListener('click', () => {
      ctx.toast('应用入口: 全部');
    });

    root.querySelector('[data-dom-id="content-card-1"]').addEventListener('click', () => {
      ctx.toast('内容卡片: 1');
    });
    root.querySelector('[data-dom-id="content-card-2"]').addEventListener('click', () => {
      ctx.toast('内容卡片: 2');
    });
    root.querySelector('[data-dom-id="content-card-3"]').addEventListener('click', () => {
      ctx.toast('内容卡片: 3');
    });

    root.querySelector('[data-dom-id="search-input"]').addEventListener('click', () => {
      ctx.toast('搜索内容');
    });

    root.querySelector('[data-dom-id="filter-entry"]').addEventListener('click', () => {
      ctx.toast('筛选入口');
    });

    root.querySelector('[data-dom-id="publish-fab"]').addEventListener('click', () => {
      ctx.toast('发布入口');
    });

    ctx.bindScrollLayout({
      fixedRegions: [{
        selector: '.my-page__fab',
        edge: 'bottom',
        clearance: 16
      }]
    });
  }
});
