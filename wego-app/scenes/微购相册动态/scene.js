/* wego-design-contract: {
  "surface_id": "dynamic-feed",
  "route_id": "dynamic-feed",
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
    "design_system_version": 490,
    "token_bindings": [
      { "selector": ".dynamic-feed", "content_role": "动态页根背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".dynamic-feed__navbar", "content_role": "页面导航背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".dynamic-feed__search-entry", "content_role": "搜索入口文字颜色", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".dynamic-feed__scroll", "content_role": "主滚动区底部安全区", "css_property": "padding-bottom", "token": "var(--safe-area-bottom-content)" },
      { "selector": ".dynamic-feed__following", "content_role": "关注对象区域背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".dynamic-feed__following", "content_role": "关注对象区域下边界", "css_property": "border-bottom", "token": "var(--border-neutral-l2)" },
      { "selector": ".dynamic-feed__following-inner", "content_role": "关注对象区域横向内边距", "css_property": "padding-inline", "token": "var(--layout-page-margin-m8)" },
      { "selector": ".dynamic-feed__following-inner", "content_role": "关注对象区域纵向内边距", "css_property": "padding-block", "token": "var(--spacer-12)" },
      { "selector": ".dynamic-feed__section-heading", "content_role": "关注对象标题字号", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".dynamic-feed__section-heading", "content_role": "关注对象标题行高", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".dynamic-feed__section-heading", "content_role": "关注对象标题字重", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".dynamic-feed__section-heading", "content_role": "关注对象标题颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".dynamic-feed__following-scroll", "content_role": "关注对象横滑间距", "css_property": "gap", "token": "var(--spacer-16)" },
      { "selector": ".dynamic-feed__following-scroll", "content_role": "关注对象横滑上间距", "css_property": "margin-top", "token": "var(--spacer-12)" },
      { "selector": ".dynamic-feed__publisher-shortcut", "content_role": "关注对象名称间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".dynamic-feed__shortcut-name", "content_role": "关注对象名称字号", "css_property": "font-size", "token": "var(--body-xs-font-size)" },
      { "selector": ".dynamic-feed__shortcut-name", "content_role": "关注对象名称行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".dynamic-feed__shortcut-name", "content_role": "关注对象名称颜色", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".dynamic-feed__filter-sticky", "content_role": "筛选栏背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".dynamic-feed__filter-sticky", "content_role": "筛选栏横向边距", "css_property": "--sticky-region-inline-inset", "token": "var(--layout-page-margin-m8)" },
      { "selector": ".dynamic-feed__filter-row", "content_role": "筛选项间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".dynamic-feed__filter-row", "content_role": "筛选栏纵向内边距", "css_property": "padding-block", "token": "var(--spacer-8)" },
      { "selector": ".dynamic-feed__item", "content_role": "动态条目背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".dynamic-feed__item", "content_role": "动态条目间距", "css_property": "margin-top", "token": "var(--spacer-8)" },
      { "selector": ".dynamic-feed__item-inner", "content_role": "动态正文横向内边距", "css_property": "padding-inline", "token": "var(--spacer-16)" },
      { "selector": ".dynamic-feed__item-inner", "content_role": "动态正文纵向内边距", "css_property": "padding-block", "token": "var(--spacer-16)" },
      { "selector": ".dynamic-feed__publisher", "content_role": "发布者信息间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".dynamic-feed__publisher-name", "content_role": "发布者名称字号", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".dynamic-feed__publisher-name", "content_role": "发布者名称行高", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".dynamic-feed__publisher-name", "content_role": "发布者名称字重", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".dynamic-feed__publisher-name", "content_role": "发布者名称颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".dynamic-feed__published-at", "content_role": "发布时间字号", "css_property": "font-size", "token": "var(--body-xs-font-size)" },
      { "selector": ".dynamic-feed__published-at", "content_role": "发布时间行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".dynamic-feed__published-at", "content_role": "发布时间颜色", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".dynamic-feed__copy", "content_role": "动态正文字号", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".dynamic-feed__copy", "content_role": "动态正文行高", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".dynamic-feed__copy", "content_role": "动态正文颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".dynamic-feed__publisher-line", "content_role": "发布者名称与类型间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".dynamic-feed__copy", "content_role": "动态正文上间距", "css_property": "margin", "token": "var(--spacer-12)" },
      { "selector": ".dynamic-feed__expand", "content_role": "正文展开操作上间距", "css_property": "margin-top", "token": "var(--spacer-4)" },
      { "selector": ".dynamic-feed__media", "content_role": "动态媒体上间距", "css_property": "margin-top", "token": "var(--spacer-12)" },
      { "selector": ".dynamic-feed__product", "content_role": "关联商品上边界", "css_property": "border-top", "token": "var(--border-neutral-l2)" },
      { "selector": ".dynamic-feed__actions", "content_role": "互动区域横向内边距", "css_property": "padding-inline", "token": "var(--spacer-16)" },
      { "selector": ".dynamic-feed__actions", "content_role": "互动区域纵向内边距", "css_property": "padding-block", "token": "var(--spacer-8)" },
      { "selector": ".dynamic-feed__actions", "content_role": "互动区域上边界", "css_property": "border-top", "token": "var(--border-neutral-l2)" },
      { "selector": ".dynamic-feed__actions", "content_role": "互动操作间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".dynamic-feed__like.is-liked", "content_role": "已点赞状态颜色", "css_property": "color", "token": "var(--text-brand)" },
      { "selector": ".dynamic-feed__empty", "content_role": "筛选空列表纵向内边距", "css_property": "padding-block", "token": "var(--spacer-32)" },
      { "selector": ".dynamic-feed__empty", "content_role": "筛选空列表横向内边距", "css_property": "padding-inline", "token": "var(--spacer-16)" },
      { "selector": ".dynamic-feed__empty", "content_role": "筛选空列表提示颜色", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".dynamic-feed__empty", "content_role": "筛选空列表提示字号", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".dynamic-feed__empty", "content_role": "筛选空列表提示行高", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".dynamic-feed__comment-body", "content_role": "评论区横向内边距", "css_property": "padding-inline", "token": "var(--spacer-16)" },
      { "selector": ".dynamic-feed__comment-body", "content_role": "评论区上内边距", "css_property": "padding-top", "token": "var(--spacer-8)" },
      { "selector": ".dynamic-feed__comment-list", "content_role": "评论列表间距", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".dynamic-feed__comment-empty", "content_role": "评论空提示字号", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".dynamic-feed__comment-empty", "content_role": "评论空提示行高", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".dynamic-feed__comment-empty", "content_role": "评论空提示颜色", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".dynamic-feed__comment-row", "content_role": "评论行间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".dynamic-feed__comment-name", "content_role": "评论者名称字号", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".dynamic-feed__comment-name", "content_role": "评论者名称行高", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".dynamic-feed__comment-name", "content_role": "评论者名称字重", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".dynamic-feed__comment-name", "content_role": "评论者名称颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".dynamic-feed__comment-copy", "content_role": "评论内容字号", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".dynamic-feed__comment-copy", "content_role": "评论内容行高", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".dynamic-feed__comment-copy", "content_role": "评论内容颜色", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".dynamic-feed__comment-input", "content_role": "评论输入区上间距", "css_property": "margin-top", "token": "var(--spacer-16)" }
    ],
    "component_bindings": [
      {
        "binding_id": "page-navbar",
        "slug": "navbar",
        "reason": "承载动态页标题与搜索入口",
        "principle_refs": ["wego-clarity-information-flow"],
        "variant_dimensions": { "layout": "two-part", "leftControl": "none", "titleAlignment": "left", "actions": "icon", "rightActionType": "icon", "spacing": "default", "position": "sticky" }
      },
      {
        "binding_id": "filter-sticky",
        "slug": "sticky-region",
        "reason": "滚动浏览时持续提供动态类型筛选",
        "principle_refs": ["wego-efficiency-continuous-flow"],
        "variant_dimensions": { "edge": "top", "visibility": "always", "state": "visible" }
      },
      {
        "binding_id": "available-filter-tag",
        "slug": "tag",
        "reason": "呈现可选的动态类型筛选",
        "principle_refs": ["wego-clarity-state-visible"],
        "variant_dimensions": { "size": "28", "theme": "gray", "state": "normal" }
      },
      {
        "binding_id": "selected-filter-tag",
        "slug": "tag",
        "reason": "明确显示当前动态类型筛选",
        "principle_refs": ["wego-clarity-state-visible"],
        "variant_dimensions": { "size": "28", "theme": "brand", "state": "selected" }
      },
      {
        "binding_id": "publisher-avatar",
        "slug": "avatar",
        "reason": "统一呈现关注对象与动态发布者身份",
        "principle_refs": ["wego-clarity-contextual-function"],
        "variant_dimensions": { "type": "image", "size": "40" }
      },
      {
        "binding_id": "feed-type-tag",
        "slug": "tag",
        "reason": "区分上新、笔记和直播动态类型",
        "principle_refs": ["wego-clarity-state-visible"],
        "variant_dimensions": { "size": "20", "theme": "gray", "state": "normal" }
      },
      {
        "binding_id": "feed-media",
        "slug": "image",
        "reason": "展示动态主媒体内容",
        "principle_refs": ["wego-aesthetics-neutral-priority"],
        "variant_dimensions": { "fit": "cover", "size": "custom-wide", "radius": "rounded-md", "state": "loaded", "interaction": "static" }
      },
      {
        "binding_id": "related-product-cell",
        "slug": "cell",
        "reason": "紧随媒体呈现单个关联商品名称与价格",
        "principle_refs": ["wego-consistency-information-grouping"],
        "variant_dimensions": { "density": "double", "surface": "bg-white", "interaction": "static", "divider": "none", "leadingSlot": "none", "trailingSlot": "text" }
      },
      {
        "binding_id": "feed-action-button",
        "slug": "button",
        "reason": "承载展开、点赞和评论的次级互动",
        "principle_refs": ["wego-aesthetics-432-check"],
        "variant_dimensions": { "emphasis": "weak", "size": "sm", "iconMode": "text-only", "state": "default" }
      },
      {
        "binding_id": "comments-modal",
        "slug": "modal",
        "reason": "在不离开动态上下文时完成评论",
        "principle_refs": ["wego-efficiency-step-reduction"],
        "variant_dimensions": { "variant": "frame-x", "title": "default", "action": "double-h", "align": "center", "state": "open" }
      },
      {
        "binding_id": "comment-navbar",
        "slug": "navbar",
        "reason": "评论面板使用统一标题与关闭结构",
        "principle_refs": ["wego-consistency-reuse-component"],
        "variant_dimensions": { "layout": "three-part", "titleAlignment": "center", "actions": "none", "spacing": "default", "position": "sticky" }
      },
      {
        "binding_id": "comment-avatar",
        "slug": "avatar",
        "reason": "识别当前会话发布的评论",
        "principle_refs": ["wego-clarity-contextual-function"],
        "variant_dimensions": { "type": "image", "size": "24" }
      },
      {
        "binding_id": "comment-input",
        "slug": "input",
        "reason": "输入当前动态的示例评论",
        "principle_refs": ["wego-aesthetics-error-prevention"],
        "variant_dimensions": { "fieldType": "text", "surface": "default", "state": "default" }
      },
      {
        "binding_id": "comment-cancel-button",
        "slug": "button",
        "reason": "取消评论并返回原动态位置",
        "principle_refs": ["wego-clarity-reversible-action-visible"],
        "variant_dimensions": { "emphasis": "weak", "size": "lg", "iconMode": "text-only", "state": "default" }
      },
      {
        "binding_id": "comment-publish-button",
        "slug": "button",
        "reason": "评论面板内唯一发布主操作",
        "principle_refs": ["wego-efficiency-primary-action-right"],
        "variant_dimensions": { "emphasis": "strong", "size": "lg", "iconMode": "text-only", "state": "default" }
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "页面首要任务是连续浏览已关注对象的动态。对比“标题与筛选双层固定”和“标题独立、关注对象流内呈现、仅筛选固定”两个候选后，采用后者：导航只表达动态上下文与搜索入口，关注对象属于内容流，筛选是唯一随滚动固定的次级控制，动态条目保持单列连续阅读；评论以底部面板覆盖，避免跳出当前滚动位置。",
      "principle_refs": ["wego-clarity-single-primary-task", "wego-clarity-page-architecture-before-components", "wego-efficiency-continuous-flow"],
      "mutable_regions": [".dynamic-feed__feed", ".dynamic-feed__filter-row", ".dynamic-feed__comment-body"],
      "page_layers": [
        { "region_id": "dynamic-navbar", "selector": ".dynamic-feed__navbar", "role": "navigation", "scope": "page-local" },
        { "region_id": "dynamic-content", "selector": ".dynamic-feed__scroll", "role": "content", "scope": "page-local" },
        { "region_id": "dynamic-filter", "selector": ".dynamic-feed__filter-sticky", "role": "navigation", "scope": "page-local" }
      ],
      "scroll_architecture": {
        "viewport_selector": ".dynamic-feed",
        "primary_scroll_selector": ".dynamic-feed__scroll",
        "document_scroll": false,
        "nested_scroll_regions": [
          { "region_id": "followed-publishers", "selector": ".dynamic-feed__following-scroll", "axis": "x", "parent_selector": ".dynamic-feed__scroll" },
          { "region_id": "feed-filters", "selector": ".dynamic-feed__filter-row", "axis": "x", "parent_selector": ".dynamic-feed__filter-sticky" }
        ],
        "fixed_regions": []
      },
      "layout_groups": [
        { "group_id": "following-content", "selector": ".dynamic-feed__following-inner", "content_role": "关注对象快捷入口组", "inline_inset_token": "var(--layout-page-margin-m8)", "spacing_owner": "scene", "gap_token": "var(--spacer-12)" },
        { "group_id": "feed-content", "selector": ".dynamic-feed__item-inner", "content_role": "动态发布者、正文与媒体内容组", "inline_inset_token": "var(--spacer-16)", "spacing_owner": "scene", "gap_token": "var(--spacer-12)" },
        { "group_id": "feed-actions", "selector": ".dynamic-feed__actions", "content_role": "单条动态互动操作组", "inline_inset_token": "var(--spacer-16)", "spacing_owner": "scene", "gap_token": "var(--spacer-8)" },
        { "group_id": "comment-content", "selector": ".dynamic-feed__comment-body", "content_role": "评论列表与输入内容组", "inline_inset_token": "var(--spacer-16)", "spacing_owner": "scene", "gap_token": "var(--spacer-16)" }
      ],
      "sticky_regions": [
        { "region_id": "dynamic-navbar", "selector": ".dynamic-feed__navbar", "scroll_selector": ".dynamic-feed__scroll", "edge": "top", "stack_order": 0, "visibility": "always", "background_token": "var(--bg-surface)", "layer_role": "navigation", "after_gap_token": "var(--spacer-0)", "scroll_padding": "flow-reserved", "essential": true },
        { "region_id": "dynamic-filter", "selector": ".dynamic-feed__filter-sticky", "scroll_selector": ".dynamic-feed__scroll", "edge": "top", "stack_order": 10, "visibility": "always", "background_token": "var(--bg-surface)", "layer_role": "navigation", "after_gap_token": "var(--spacer-0)", "scroll_padding": "dynamic-measured", "essential": true }
      ]
    },
    "interaction_contract": [
      { "dom_id": "search-entry", "target": "feedback:toast" },
      { "dom_id": "filter-all", "target": "state:filter-dynamic-feed" },
      { "dom_id": "filter-product", "target": "state:filter-dynamic-feed" },
      { "dom_id": "filter-note", "target": "state:filter-dynamic-feed" },
      { "dom_id": "filter-live", "target": "state:filter-dynamic-feed" },
      { "dom_id": "expand-{dynamic_id}", "target": "state:expand-feed-content" },
      { "dom_id": "like-{dynamic_id}", "target": "state:like-feed-item" },
      { "dom_id": "open-comment-{dynamic_id}", "target": "overlay:sheet" },
      { "dom_id": "comment-sheet-{dynamic_id}", "target": "overlay:close" },
      { "dom_id": "comment-close-{dynamic_id}", "target": "overlay:close" },
      { "dom_id": "comment-cancel-{dynamic_id}", "target": "overlay:close" },
      { "dom_id": "comment-clear-{dynamic_id}", "target": "state:comment-draft" },
      { "dom_id": "comment-publish-{dynamic_id}", "target": "state:comment-feed-item" }
    ],
    "state_contract": [
      {
        "state_id": "initial",
        "initial": true,
        "trigger": "进入动态主 Tab",
        "visible_result": "展示关注对象快捷入口、全部筛选和包含上新、笔记、直播的单列动态流",
        "fallback": "保持全部筛选并展示可用动态数据",
        "persistence": "memory"
      },
      {
        "state_id": "filter-dynamic-feed",
        "initial": false,
        "trigger": "选择上新、笔记或直播筛选",
        "visible_result": "被选筛选高亮，动态流立即只保留对应类型",
        "fallback": "筛选无匹配内容时保留筛选高亮并显示空列表提示",
        "persistence": "memory"
      },
      {
        "state_id": "expand-feed-content",
        "initial": false,
        "trigger": "点击展开全文或收起",
        "visible_result": "当前动态正文完整展开或恢复两行摘要",
        "fallback": "正文保持可读摘要",
        "persistence": "memory"
      },
      {
        "state_id": "like-feed-item",
        "initial": false,
        "trigger": "点击赞或已赞",
        "visible_result": "当前动态在赞与已赞之间切换，数量同步增减",
        "fallback": "保留操作前点赞状态与数量",
        "persistence": "memory"
      },
      {
        "state_id": "comments-open",
        "initial": false,
        "trigger": "点击评论",
        "visible_result": "底部评论面板打开，当前动态的本次会话评论与输入框可见",
        "fallback": "关闭面板并回到原动态位置",
        "persistence": "memory"
      },
      {
        "state_id": "comment-feed-item",
        "initial": false,
        "trigger": "输入评论并点击发布",
        "visible_result": "评论数量增加，重新打开评论面板可看到本次会话评论",
        "fallback": "输入为空时保持面板并提示输入评论",
        "persistence": "memory"
      },
      {
        "state_id": "comment-draft",
        "initial": false,
        "trigger": "点击清空评论输入",
        "visible_result": "当前评论输入立即清空并保持输入焦点",
        "fallback": "保留当前输入内容",
        "persistence": "memory"
      },
      {
        "state_id": "search-stub",
        "initial": false,
        "trigger": "点击顶部搜索入口",
        "visible_result": "显示本期未开放提示，不改变筛选和滚动位置",
        "fallback": "继续停留在当前动态上下文",
        "persistence": "memory"
      }
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-29T14:23:42.000Z",
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

const dynamicFeedTemplate = `
  <div class="dynamic-feed"
    data-surface-id="dynamic-feed"
    data-route-id="dynamic-feed"
    data-layout-mode="composed">
    <div class="navbar dynamic-feed__navbar"
      data-dd-id="dynamic-feed-navbar"
      data-component-slug="navbar"
      data-component-binding="page-navbar">
      <div class="navbar__body navbar__body--split">
        <div class="navbar__left"><span class="navbar__title">动态</span></div>
        <div class="navbar__right navbar__right--icon">
          <div class="navbar__action dynamic-feed__search-entry"
            role="button"
            tabindex="0"
            aria-label="搜索动态"
            data-dom-id="search-entry">
            <div class="navbar__action-icon"><i class="wego-iconfont-s icon-sousuo" aria-hidden="true"></i></div>
            <span class="navbar__action-label">搜索</span>
          </div>
        </div>
      </div>
    </div>
    <main class="dynamic-feed__scroll">
      <section class="dynamic-feed__following" aria-labelledby="dynamic-feed-following-title">
        <div class="dynamic-feed__following-inner">
          <h2 class="dynamic-feed__section-heading" id="dynamic-feed-following-title">关注的人</h2>
          <div class="dynamic-feed__following-scroll" data-region="following"></div>
        </div>
      </section>
      <div class="sticky-region dynamic-feed__filter-sticky"
        data-edge="top"
        data-visibility="always"
        data-state="visible"
        data-dd-id="dynamic-feed-filter-sticky"
        data-component-slug="sticky-region"
        data-component-binding="filter-sticky">
        <div class="sticky-region__motion">
          <div class="sticky-region__inner">
            <div class="dynamic-feed__filter-row" data-region="filters" aria-label="动态类型筛选">
              <div class="tag tag--28 tag--brand tag--selected"
                role="button"
                tabindex="0"
                aria-pressed="true"
                data-filter="all"
                data-dom-id="filter-all"
                data-dd-id="filter-tag-all"
                data-component-slug="tag"
                data-component-binding="selected-filter-tag">
                <span class="tag__label">全部</span>
              </div>
              <div class="tag tag--28 tag--gray tag--normal"
                role="button"
                tabindex="0"
                aria-pressed="false"
                data-filter="product"
                data-dom-id="filter-product"
                data-dd-id="filter-tag-product"
                data-component-slug="tag"
                data-component-binding="available-filter-tag">
                <span class="tag__label">上新</span>
              </div>
              <div class="tag tag--28 tag--gray tag--normal"
                role="button"
                tabindex="0"
                aria-pressed="false"
                data-filter="note"
                data-dom-id="filter-note"
                data-dd-id="filter-tag-note"
                data-component-slug="tag"
                data-component-binding="available-filter-tag">
                <span class="tag__label">笔记</span>
              </div>
              <div class="tag tag--28 tag--gray tag--normal"
                role="button"
                tabindex="0"
                aria-pressed="false"
                data-filter="live"
                data-dom-id="filter-live"
                data-dd-id="filter-tag-live"
                data-component-slug="tag"
                data-component-binding="available-filter-tag">
                <span class="tag__label">直播</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section class="dynamic-feed__feed" data-region="feed" aria-live="polite"></section>
    </main>
    <template class="dynamic-feed__component-blueprints">
      <div class="tag tag--20 tag--gray tag--normal"
        data-dd-id="feed-type-blueprint"
        data-component-slug="tag"
        data-component-binding="feed-type-tag">
        <span class="tag__label">上新</span>
      </div>
      <div class="cell cell--double cell--bg-white"
        data-dd-id="related-product-blueprint"
        data-component-slug="cell"
        data-component-binding="related-product-cell">
        <div class="cell__body">
          <div class="cell__content">
            <div class="cell__title-row"><span class="cell__title">关联商品</span></div>
            <div class="cell__subtitle">关联商品</div>
          </div>
          <div class="cell__action"><span class="cell__action-text">¥0</span></div>
        </div>
      </div>
      <div class="navbar"
        data-dd-id="comment-navbar-blueprint"
        data-component-slug="navbar"
        data-component-binding="comment-navbar">
        <div class="navbar__body">
          <div class="navbar__left">
            <div class="navbar__left-btn navbar__left-btn--circle"><i class="wego-iconfont-s icon-xiajiantou16"></i></div>
          </div>
          <div class="navbar__center"><span class="navbar__title">评论</span></div>
          <div class="navbar__right"></div>
        </div>
      </div>
      <div class="input-group"
        data-dd-id="comment-input-blueprint"
        data-component-slug="input"
        data-component-binding="comment-input">
        <label class="field-label" for="dynamic-feed-comment-blueprint">写评论</label>
        <div class="input-wrapper">
          <input id="dynamic-feed-comment-blueprint" type="text" placeholder="说点什么">
          <button type="button" class="input-clear" aria-label="清空评论"><i class="wego-iconfont-s icon-yuancha-mian"></i></button>
        </div>
      </div>
    </template>
  </div>
`;

(function registerDynamicFeedScene() {
  'use strict';

  var filters = [
    { key: 'all', label: '全部' },
    { key: 'product', label: '上新' },
    { key: 'note', label: '笔记' },
    { key: 'live', label: '直播' }
  ];

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\x22/g, '&quot;')
      .replace(/\x27/g, '&#039;');
  }

  function byId(items, key, value) {
    return (items || []).find(function (item) {
      return item && item[key] === value;
    }) || null;
  }

  function feedType(item, publisher) {
    var hasLiveStatus = publisher && (publisher.publisher_statuses || []).indexOf('live') >= 0;
    var hasVideo = (item.media_list || []).some(function (media) {
      return media.media_type === 'video';
    });
    if (hasLiveStatus && hasVideo) return 'live';
    return item.content_type === 'note' ? 'note' : 'product';
  }

  function feedTypeLabel(type) {
    if (type === 'live') return '直播';
    if (type === 'note') return '笔记';
    return '上新';
  }

  function baseLikeCount(item) {
    return 36 + Number(item.published_order || 0) * 5;
  }

  function baseCommentCount(item) {
    return 2 + Number(item.published_order || 0) % 9;
  }

  function needsExpansion(text) {
    return String(text || '').length > 48;
  }

  function displayContent(item, product) {
    var base = String(item.text_content || '');
    if (item.content_type !== 'note' || !product || !product.selling_points) return base;
    return base + ' ' + product.selling_points.slice(0, 3).join('，') + '。';
  }

  function renderFilter(filter, selected) {
    var isSelected = filter.key === selected;
    var bindingId = isSelected ? 'selected-filter-tag' : 'available-filter-tag';
    var className = isSelected
      ? 'tag tag--28 tag--brand tag--selected'
      : 'tag tag--28 tag--gray tag--normal';
    return [
      '<div',
      ' class="' + className + '"',
      ' role="button"',
      ' tabindex="0"',
      ' aria-pressed="' + String(isSelected) + '"',
      ' data-filter="' + filter.key + '"',
      ' data-dom-id="filter-' + filter.key + '"',
      ' data-dd-id="filter-tag-' + filter.key + '"',
      ' data-component-slug="tag"',
      ' data-component-binding="' + bindingId + '"',
      '>',
      '<span class="tag__label">' + filter.label + '</span>',
      '</div>'
    ].join('');
  }

  function renderFollowingPublisher(publisher) {
    return [
      '<div class="dynamic-feed__publisher-shortcut">',
      '<div class="avatar avatar--40 avatar--image"',
      ' data-dd-id="following-avatar-' + escapeHtml(publisher.publisher_id) + '"',
      ' data-component-slug="avatar"',
      ' data-component-binding="publisher-avatar">',
      '<img src="' + escapeHtml(publisher.publisher_avatar) + '" alt="' + escapeHtml(publisher.publisher_name) + '">',
      '</div>',
      '<span class="dynamic-feed__shortcut-name">' + escapeHtml(publisher.publisher_name) + '</span>',
      '</div>'
    ].join('');
  }

  function renderRelatedProduct(product, dynamicId) {
    if (!product) return '';
    return [
      '<div class="dynamic-feed__product">',
      '<div class="cell cell--double cell--bg-white"',
      ' data-dd-id="feed-product-' + escapeHtml(dynamicId) + '"',
      ' data-component-slug="cell"',
      ' data-component-binding="related-product-cell">',
      '<div class="cell__body">',
      '<div class="cell__content">',
      '<div class="cell__title-row"><span class="cell__title">' + escapeHtml(product.name || product.title) + '</span></div>',
      '<div class="cell__subtitle">关联商品</div>',
      '</div>',
      '<div class="cell__action"><span class="cell__action-text">¥' + escapeHtml(product.price) + '</span></div>',
      '</div>',
      '</div>',
      '</div>'
    ].join('');
  }

  function renderFeedItem(item, publisher, product, state) {
    var dynamicId = item.dynamic_id;
    var type = feedType(item, publisher);
    var expanded = Boolean(state['expand-feed-content'][dynamicId]);
    var liked = Boolean(state['like-feed-item'][dynamicId]);
    var commentItems = state.commentsByFeedId[dynamicId] || [];
    var likeCount = baseLikeCount(item) + (liked ? 1 : 0);
    var commentCount = baseCommentCount(item) + commentItems.length;
    var content = displayContent(item, product);
    var media = (item.media_list || [])[0];
    var mediaHtml = media ? [
      '<div class="dynamic-feed__media">',
      '<div class="wg-image wg-image--custom-wide wg-image--rounded-md is-loaded"',
      ' data-dd-id="feed-media-' + escapeHtml(dynamicId) + '"',
      ' data-component-slug="image"',
      ' data-component-binding="feed-media">',
      '<img src="' + escapeHtml(media.poster_or_src) + '" alt="' + escapeHtml(feedTypeLabel(type) + '动态图片') + '">',
      '</div>',
      '</div>'
    ].join('') : '';
    var expandHtml = needsExpansion(content) ? [
      '<button type="button" class="btn btn--weak btn--sm dynamic-feed__expand"',
      ' data-dynamic-id="' + escapeHtml(dynamicId) + '"',
      ' data-action="expand"',
      ' data-dom-id="expand-' + escapeHtml(dynamicId) + '"',
      ' data-dd-id="expand-action-' + escapeHtml(dynamicId) + '"',
      ' data-component-slug="button"',
      ' data-component-binding="feed-action-button">',
      expanded ? '收起' : '展开全文',
      '</button>'
    ].join('') : '';

    return [
      '<article class="dynamic-feed__item" data-feed-type="' + type + '" data-dynamic-id="' + escapeHtml(dynamicId) + '">',
      '<div class="dynamic-feed__item-inner">',
      '<div class="dynamic-feed__publisher">',
      '<div class="avatar avatar--40 avatar--image"',
      ' data-dd-id="publisher-avatar-' + escapeHtml(dynamicId) + '"',
      ' data-component-slug="avatar"',
      ' data-component-binding="publisher-avatar">',
      '<img src="' + escapeHtml(publisher.publisher_avatar) + '" alt="' + escapeHtml(publisher.publisher_name) + '">',
      '</div>',
      '<div class="dynamic-feed__publisher-copy">',
      '<div class="dynamic-feed__publisher-line">',
      '<span class="dynamic-feed__publisher-name">' + escapeHtml(publisher.publisher_name) + '</span>',
      '<div class="tag tag--20 tag--gray tag--normal"',
      ' data-dd-id="feed-type-' + escapeHtml(dynamicId) + '"',
      ' data-component-slug="tag"',
      ' data-component-binding="feed-type-tag">',
      '<span class="tag__label">' + feedTypeLabel(type) + '</span>',
      '</div>',
      '</div>',
      '<span class="dynamic-feed__published-at">' + escapeHtml(item.published_at) + '</span>',
      '</div>',
      '</div>',
      '<p class="dynamic-feed__copy' + (expanded ? ' is-expanded' : '') + '">' + escapeHtml(content) + '</p>',
      expandHtml,
      mediaHtml,
      '</div>',
      renderRelatedProduct(product, dynamicId),
      '<div class="dynamic-feed__actions">',
      '<button type="button" class="btn btn--weak btn--sm dynamic-feed__like' + (liked ? ' is-liked' : '') + '"',
      ' aria-pressed="' + String(liked) + '"',
      ' data-dynamic-id="' + escapeHtml(dynamicId) + '"',
      ' data-action="like"',
      ' data-dom-id="like-' + escapeHtml(dynamicId) + '"',
      ' data-dd-id="like-action-' + escapeHtml(dynamicId) + '"',
      ' data-component-slug="button"',
      ' data-component-binding="feed-action-button">',
      (liked ? '已赞 ' : '赞 ') + likeCount,
      '</button>',
      '<button type="button" class="btn btn--weak btn--sm"',
      ' data-dynamic-id="' + escapeHtml(dynamicId) + '"',
      ' data-action="comment"',
      ' data-dom-id="open-comment-' + escapeHtml(dynamicId) + '"',
      ' data-dd-id="comment-action-' + escapeHtml(dynamicId) + '"',
      ' data-component-slug="button"',
      ' data-component-binding="feed-action-button">',
      '评论 ' + commentCount,
      '</button>',
      '</div>',
      '</article>'
    ].join('');
  }

  function renderCommentItems(items, currentUser, dynamicId) {
    if (!items.length) {
      return '<p class="dynamic-feed__comment-empty">本次会话还没有新评论，来说说你的看法吧。</p>';
    }
    return [
      '<div class="dynamic-feed__comment-list">',
      items.map(function (comment, index) {
        return [
          '<div class="dynamic-feed__comment-row">',
          '<div class="avatar avatar--24 avatar--image"',
          ' data-dd-id="comment-avatar-' + escapeHtml(dynamicId) + '-' + index + '"',
          ' data-component-slug="avatar"',
          ' data-component-binding="comment-avatar">',
          '<img src="' + escapeHtml(currentUser.avatar) + '" alt="' + escapeHtml(currentUser.display_name) + '">',
          '</div>',
          '<div class="dynamic-feed__comment-content">',
          '<span class="dynamic-feed__comment-name">' + escapeHtml(currentUser.display_name) + '</span>',
          '<p class="dynamic-feed__comment-copy">' + escapeHtml(comment.text) + '</p>',
          '</div>',
          '</div>'
        ].join('');
      }).join(''),
      '</div>'
    ].join('');
  }

  function commentModalTemplate(dynamicId, comments, currentUser) {
    var inputId = 'dynamic-feed-comment-input-' + dynamicId;
    return [
      '<div class="modal modal--frame-x modal--has-actions dynamic-feed__comments-modal"',
      ' role="dialog"',
      ' aria-modal="true"',
      ' aria-labelledby="dynamic-feed-comment-title-' + escapeHtml(dynamicId) + '"',
      ' data-state="open"',
      ' data-dom-id="comment-sheet-' + escapeHtml(dynamicId) + '"',
      ' data-dd-id="comment-modal-' + escapeHtml(dynamicId) + '"',
      ' data-component-slug="modal"',
      ' data-component-binding="comments-modal">',
      '<div class="modal__panel">',
      '<div class="modal__title modal__title--default">',
      '<div class="navbar"',
      ' data-dd-id="comment-navbar-' + escapeHtml(dynamicId) + '"',
      ' data-component-slug="navbar"',
      ' data-component-binding="comment-navbar">',
      '<div class="navbar__body">',
      '<div class="navbar__left">',
      '<div class="navbar__left-btn navbar__left-btn--circle"',
      ' role="button"',
      ' tabindex="0"',
      ' aria-label="关闭评论"',
      ' data-dom-id="comment-close-' + escapeHtml(dynamicId) + '">',
      '<i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i>',
      '</div>',
      '</div>',
      '<div class="navbar__center"><span class="navbar__title" id="dynamic-feed-comment-title-' + escapeHtml(dynamicId) + '">评论</span></div>',
      '<div class="navbar__right"></div>',
      '</div>',
      '</div>',
      '</div>',
      '<div class="modal__body dynamic-feed__comment-body">',
      renderCommentItems(comments, currentUser, dynamicId),
      '<div class="input-group dynamic-feed__comment-input"',
      ' data-dd-id="comment-input-' + escapeHtml(dynamicId) + '"',
      ' data-component-slug="input"',
      ' data-component-binding="comment-input">',
      '<label class="field-label" for="' + inputId + '">写评论</label>',
      '<div class="input-wrapper">',
      '<input id="' + inputId + '" type="text" autocomplete="off" placeholder="说点什么">',
      '<button type="button" class="input-clear" aria-label="清空评论" data-dom-id="comment-clear-' + escapeHtml(dynamicId) + '">',
      '<i class="wego-iconfont-s icon-yuancha-mian" aria-hidden="true"></i>',
      '</button>',
      '</div>',
      '</div>',
      '</div>',
      '<div class="modal__actions">',
      '<div class="modal__action-gradient"></div>',
      '<div class="modal__buttons">',
      '<button type="button" class="btn btn--weak btn--lg"',
      ' data-dom-id="comment-cancel-' + escapeHtml(dynamicId) + '"',
      ' data-dd-id="comment-cancel-button-' + escapeHtml(dynamicId) + '"',
      ' data-component-slug="button"',
      ' data-component-binding="comment-cancel-button">取消</button>',
      '<button type="button" class="btn btn--strong btn--lg"',
      ' data-dom-id="comment-publish-' + escapeHtml(dynamicId) + '"',
      ' data-dd-id="comment-publish-button-' + escapeHtml(dynamicId) + '"',
      ' data-component-slug="button"',
      ' data-component-binding="comment-publish-button">发布</button>',
      '</div>',
      '</div>',
      '</div>',
      '</div>'
    ].join('');
  }

  window.WegoApp.registerScene({
    routeId: 'dynamic-feed',
    scene: '微购相册动态',
    presentation: {
      type: 'host-tab',
      transition: 'none',
      dismissAction: 'none',
      overlayLevel: 'none',
      coversTabBar: false,
      source: 'library-consumption.json#/appRuntime/presentationTypes'
    },
    template: dynamicFeedTemplate,
    init: function initDynamicFeed(ctx) {
      var root = ctx.root.querySelector('.dynamic-feed');
      var scrollRoot = root.querySelector('.dynamic-feed__scroll');
      var filterRegion = root.querySelector('[data-region="filters"]');
      var followingRegion = root.querySelector('[data-region="following"]');
      var feedRegion = root.querySelector('[data-region="feed"]');
      var db = window.WEGO_PROTOTYPE_DB || {};
      var publishers = db.publishers || [];
      var products = db.products || [];
      var dynamics = (db.dynamics || []).slice().sort(function (a, b) {
        return Number(b.published_order || 0) - Number(a.published_order || 0);
      });
      var currentUser = db.currentUser || {
        display_name: '我',
        avatar: './lib/assets/image/avatar/avatar_083.jpg'
      };

      if (!ctx.state['filter-dynamic-feed']) ctx.state['filter-dynamic-feed'] = 'all';
      if (!ctx.state['expand-feed-content']) ctx.state['expand-feed-content'] = Object.create(null);
      if (!ctx.state['like-feed-item']) ctx.state['like-feed-item'] = Object.create(null);
      if (!ctx.state['comment-draft']) ctx.state['comment-draft'] = '';
      if (!ctx.state['comment-feed-item']) ctx.state['comment-feed-item'] = '';
      if (!ctx.state.commentsByFeedId) ctx.state.commentsByFeedId = Object.create(null);

      function enrichedDynamics() {
        return dynamics.map(function (item) {
          var publisher = byId(publishers, 'publisher_id', item.publisher_id);
          var product = byId(products, 'product_id', (item.related_product_ids || [])[0]);
          return {
            item: item,
            publisher: publisher,
            product: product,
            type: feedType(item, publisher)
          };
        }).filter(function (entry) {
          return entry.publisher && (
            ctx.state['filter-dynamic-feed'] === 'all' ||
            entry.type === ctx.state['filter-dynamic-feed']
          );
        });
      }

      function renderFilters() {
        filterRegion.innerHTML = filters.map(function (filter) {
          return renderFilter(filter, ctx.state['filter-dynamic-feed']);
        }).join('');
        bindFilterActions();
      }

      function renderFollowing() {
        followingRegion.innerHTML = publishers.slice(0, 6).map(renderFollowingPublisher).join('');
      }

      function renderFeed() {
        var entries = enrichedDynamics();
        if (!entries.length) {
          feedRegion.innerHTML = '<div class="dynamic-feed__empty">当前筛选下暂无动态</div>';
          return;
        }
        feedRegion.innerHTML = entries.slice(0, 8).map(function (entry) {
          return renderFeedItem(entry.item, entry.publisher, entry.product, ctx.state);
        }).join('');
        bindFeedActions();
      }

      function rerender() {
        renderFilters();
        renderFeed();
      }

      function closeCommentSheet() {
        ctx.closeOverlay();
      }

      function keyboardActivation(event) {
        if (event.type !== 'keydown') return true;
        if (event.key !== 'Enter' && event.key !== ' ') return false;
        event.preventDefault();
        return true;
      }

      function updateFilter(filterKey) {
        ctx.state['filter-dynamic-feed'] = filterKey;
        rerender();
      }

      function selectAllFilter(event) {
        if (keyboardActivation(event)) updateFilter('all');
      }

      function selectProductFilter(event) {
        if (keyboardActivation(event)) updateFilter('product');
      }

      function selectNoteFilter(event) {
        if (keyboardActivation(event)) updateFilter('note');
      }

      function selectLiveFilter(event) {
        if (keyboardActivation(event)) updateFilter('live');
      }

      function bindFilterActions() {
        var filterAll = filterRegion.querySelector('[data-dom-id="filter-all"]');
        var filterProduct = filterRegion.querySelector('[data-dom-id="filter-product"]');
        var filterNote = filterRegion.querySelector('[data-dom-id="filter-note"]');
        var filterLive = filterRegion.querySelector('[data-dom-id="filter-live"]');
        filterAll.addEventListener('click', selectAllFilter);
        filterAll.addEventListener('keydown', selectAllFilter);
        filterProduct.addEventListener('click', selectProductFilter);
        filterProduct.addEventListener('keydown', selectProductFilter);
        filterNote.addEventListener('click', selectNoteFilter);
        filterNote.addEventListener('keydown', selectNoteFilter);
        filterLive.addEventListener('click', selectLiveFilter);
        filterLive.addEventListener('keydown', selectLiveFilter);
      }

      function handleExpand(event) {
        var dynamicId = event.currentTarget.dataset.dynamicId;
        var expandedState = ctx.state['expand-feed-content'];
        expandedState[dynamicId] = !expandedState[dynamicId];
        ctx.state['expand-feed-content'] = expandedState;
        renderFeed();
      }

      function handleLike(event) {
        var dynamicId = event.currentTarget.dataset.dynamicId;
        var likedState = ctx.state['like-feed-item'];
        likedState[dynamicId] = !likedState[dynamicId];
        ctx.state['like-feed-item'] = likedState;
        renderFeed();
      }

      function handleComment(event) {
        openCommentSheet(event.currentTarget.dataset.dynamicId);
      }

      function bindAdditionalActions(selector, firstAction, handler) {
        feedRegion.querySelectorAll(selector).forEach(function (action) {
          if (action !== firstAction) action.addEventListener('click', handler);
        });
      }

      function bindFeedActions() {
        var firstExpand = feedRegion.querySelector('[data-action="expand"]');
        var firstLike = feedRegion.querySelector('[data-action="like"]');
        var firstComment = feedRegion.querySelector('[data-action="comment"]');
        var expandAction = firstExpand
          ? feedRegion.querySelector('[data-dom-id="expand-' + firstExpand.dataset.dynamicId + '"]')
          : null;
        var likeAction = firstLike
          ? feedRegion.querySelector('[data-dom-id="like-' + firstLike.dataset.dynamicId + '"]')
          : null;
        var commentAction = firstComment
          ? feedRegion.querySelector('[data-dom-id="open-comment-' + firstComment.dataset.dynamicId + '"]')
          : null;
        if (expandAction) expandAction.addEventListener('click', handleExpand);
        if (likeAction) likeAction.addEventListener('click', handleLike);
        if (commentAction) commentAction.addEventListener('click', handleComment);
        bindAdditionalActions('[data-dom-id^="expand-"]', expandAction, handleExpand);
        bindAdditionalActions('[data-dom-id^="like-"]', likeAction, handleLike);
        bindAdditionalActions('[data-dom-id^="open-comment-"]', commentAction, handleComment);
      }

      function openCommentSheet(dynamicId) {
        var item = byId(dynamics, 'dynamic_id', dynamicId);
        if (!item) return;
        var comments = ctx.state.commentsByFeedId[dynamicId] || [];
        ctx.openSheet(commentModalTemplate(dynamicId, comments, currentUser), {
          label: '评论',
          init: function initCommentSheet(overlayCtx) {
            var overlayRoot = overlayCtx.root;
            var sheet = overlayRoot.parentElement.querySelector('[data-dom-id="comment-sheet-' + dynamicId + '"]');
            var closeButton = overlayRoot.querySelector('[data-dom-id="comment-close-' + dynamicId + '"]');
            var cancelButton = overlayRoot.querySelector('[data-dom-id="comment-cancel-' + dynamicId + '"]');
            var clearButton = overlayRoot.querySelector('[data-dom-id="comment-clear-' + dynamicId + '"]');
            var publishButton = overlayRoot.querySelector('[data-dom-id="comment-publish-' + dynamicId + '"]');
            var input = overlayRoot.querySelector('#dynamic-feed-comment-input-' + dynamicId);

            sheet.addEventListener('click', function (event) {
              if (event.target === sheet) closeCommentSheet();
            });
            closeButton.addEventListener('click', closeCommentSheet);
            closeButton.addEventListener('keydown', function (event) {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                closeCommentSheet();
              }
            });
            cancelButton.addEventListener('click', closeCommentSheet);
            clearButton.addEventListener('click', function () {
              ctx.state['comment-draft'] = '';
              input.value = '';
              input.focus();
            });
            publishButton.addEventListener('click', function () {
              var text = input.value.trim();
              if (!text) {
                ctx.toast('请输入评论');
                input.focus();
                return;
              }
              if (!ctx.state.commentsByFeedId[dynamicId]) ctx.state.commentsByFeedId[dynamicId] = [];
              ctx.state.commentsByFeedId[dynamicId].push({
                text: text,
                createdAt: '刚刚'
              });
              ctx.state['comment-feed-item'] = dynamicId;
              closeCommentSheet();
              renderFeed();
              ctx.toast('评论已发布');
            });
            requestAnimationFrame(function () {
              input.focus();
            });
          }
        });
      }

      renderFollowing();
      rerender();

      root.querySelector('[data-dom-id="search-entry"]').addEventListener('click', function () {
        ctx.toast('搜索功能本期未开放');
      });
      root.querySelector('[data-dom-id="search-entry"]').addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          ctx.toast('搜索功能本期未开放');
        }
      });

      ctx.bindScrollLayout({
        scrollRoot: '.dynamic-feed__scroll',
        regions: [
          {
            selector: '.dynamic-feed__filter-sticky',
            edge: 'top',
            policy: 'always',
            essential: true,
            stackOrder: 10
          }
        ]
      });
    }
  });
})();
