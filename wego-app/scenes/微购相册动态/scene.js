/* wego-design-contract:
{
  "surface_id": "album-product-feed",
  "route_id": "album-product-feed",
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
    "design_system_version": 440,
    "token_bindings": [
      {
        "selector": ".album-feed__top-stack",
        "content_role": ".album-feed__top-stack 的 padding-top",
        "css_property": "padding-top",
        "token": "var(--safe-area-top)"
      },
      {
        "selector": ".album-feed",
        "content_role": ".album-feed 的 padding-inline",
        "css_property": "padding-inline",
        "token": "var(--layout-page-margin-m8)"
      },
      {
        "selector": ".album-feed",
        "content_role": ".album-feed 的 background",
        "css_property": "background",
        "token": "var(--bg-page)"
      },
      {
        "selector": ".album-feed::before",
        "content_role": "背景渐变白色覆盖层",
        "css_property": "background",
        "token": "var(--bg-surface)"
      },
      {
        "selector": ".album-feed",
        "content_role": ".album-feed 的 color",
        "css_property": "color",
        "token": "var(--text-default)"
      },
      {
        "selector": ".album-feed",
        "content_role": ".album-feed 的 font-family",
        "css_property": "font-family",
        "token": "var(--body-md-font-family)"
      },
      {
        "selector": ".album-feed__scroll",
        "content_role": ".album-feed__scroll 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-12)"
      },
      {
        "selector": ".album-feed__scroll",
        "content_role": ".album-feed__scroll 的 padding-bottom",
        "css_property": "padding-bottom",
        "token": "var(--safe-area-bottom-content)"
      },
      {
        "selector": ".album-feed__top-stack",
        "content_role": ".album-feed__top-stack 的 background",
        "css_property": "background",
        "token": "var(--bg-surface)"
      },
      {
        "selector": ".album-feed__floating-toolbar",
        "content_role": ".album-feed__floating-toolbar 的 padding-block",
        "css_property": "padding-block",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".album-feed__floating-toolbar .search-toolbar",
        "content_role": ".album-feed__floating-toolbar .search-toolbar 的 padding-block",
        "css_property": "padding-block",
        "token": "var(--spacer-0)"
      },
      {
        "selector": ".album-feed__people-wrap",
        "content_role": ".album-feed__people-wrap 的 margin-top",
        "css_property": "margin-top",
        "token": "var(--spacer-12)"
      },
      {
        "selector": ".album-feed__people-scroll",
        "content_role": "人维度横滑区横向间距",
        "css_property": "gap",
        "token": "var(--spacer-12)"
      },
      {
        "selector": ".album-feed__people-list",
        "content_role": ".album-feed__people-list 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-12)"
      },
      {
        "selector": ".album-feed__people-item",
        "content_role": "人维度头像与名字纵向间距",
        "css_property": "gap",
        "token": "var(--spacer-4)"
      },
      {
        "selector": ".album-feed__people-item",
        "content_role": ".album-feed__people-item 的 background",
        "css_property": "background",
        "token": "var(--transparent)"
      },
      {
        "selector": ".album-feed__people-name",
        "content_role": ".album-feed__people-name 的 color",
        "css_property": "color",
        "token": "var(--text-secondary)"
      },
      {
        "selector": ".album-feed__people-name",
        "content_role": ".album-feed__people-name 的 font-size",
        "css_property": "font-size",
        "token": "var(--body-xs-font-size)"
      },
      {
        "selector": ".album-feed__people-name",
        "content_role": ".album-feed__people-name 的 line-height",
        "css_property": "line-height",
        "token": "var(--body-xs-line-height)"
      },
      {
        "selector": ".album-feed__people-self",
        "content_role": ".album-feed__people-self 的 background",
        "css_property": "background",
        "token": "var(--bg-surface)"
      },
      {
        "selector": ".album-feed__filter-tags",
        "content_role": "筛选标签区横向间距",
        "css_property": "gap",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".album-feed__filter-tags",
        "content_role": "筛选标签区最小高度",
        "css_property": "min-height",
        "token": "var(--size-28)"
      },
      {
        "selector": ".album-feed__grid",
        "content_role": ".album-feed__grid 的 column-gap",
        "css_property": "column-gap",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".album-feed__grid",
        "content_role": ".album-feed__grid 的 row-gap",
        "css_property": "row-gap",
        "token": "var(--spacer-12)"
      },
      {
        "selector": ".album-feed__card:focus-visible",
        "content_role": "卡片焦点描边宽度",
        "css_property": "outline-width",
        "token": "var(--stroke-strong)"
      },
      {
        "selector": ".album-feed__card:focus-visible",
        "content_role": "卡片焦点描边颜色",
        "css_property": "outline-color",
        "token": "var(--border-brand)"
      },
      {
        "selector": ".album-feed__card:focus-visible",
        "content_role": ".album-feed__card:focus-visible 的 outline-offset",
        "css_property": "outline-offset",
        "token": "var(--spacer-2)"
      },
      {
        "selector": ".album-feed__cover-host",
        "content_role": "封面容器顶部圆角",
        "css_property": "border-radius",
        "token": "var(--radius-8)"
      },
      {
        "selector": ".album-feed__duration",
        "content_role": ".album-feed__duration 的 right",
        "css_property": "right",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".album-feed__duration",
        "content_role": ".album-feed__duration 的 bottom",
        "css_property": "bottom",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".album-feed__duration",
        "content_role": "视频时长纵向内边距",
        "css_property": "padding-block",
        "token": "var(--spacer-2)"
      },
      {
        "selector": ".album-feed__duration",
        "content_role": "视频时长横向内边距",
        "css_property": "padding-inline",
        "token": "var(--spacer-4)"
      },
      {
        "selector": ".album-feed__duration",
        "content_role": ".album-feed__duration 的 border-radius",
        "css_property": "border-radius",
        "token": "var(--radius-4)"
      },
      {
        "selector": ".album-feed__duration",
        "content_role": ".album-feed__duration 的 background",
        "css_property": "background",
        "token": "var(--bg-toast)"
      },
      {
        "selector": ".album-feed__duration",
        "content_role": ".album-feed__duration 的 color",
        "css_property": "color",
        "token": "var(--text-inverse)"
      },
      {
        "selector": ".album-feed__duration",
        "content_role": ".album-feed__duration 的 font-size",
        "css_property": "font-size",
        "token": "var(--body-xs-font-size)"
      },
      {
        "selector": ".album-feed__duration",
        "content_role": ".album-feed__duration 的 line-height",
        "css_property": "line-height",
        "token": "var(--body-xs-line-height)"
      },
      {
        "selector": ".album-feed__card-content",
        "content_role": ".album-feed__card-content 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-4)"
      },
      {
        "selector": ".album-feed__card-content",
        "content_role": ".album-feed__card-content 的 padding",
        "css_property": "padding",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".album-feed__publisher-row",
        "content_role": "发布者区横向间距",
        "css_property": "gap",
        "token": "var(--spacer-4)"
      },
      {
        "selector": ".album-feed__meta-row",
        "content_role": "内容类型与状态徽章行横向间距",
        "css_property": "gap",
        "token": "var(--spacer-4)"
      },
      {
        "selector": ".album-feed__publisher-name",
        "content_role": ".album-feed__publisher-name 的 color",
        "css_property": "color",
        "token": "var(--text-default)"
      },
      {
        "selector": ".album-feed__publisher-name",
        "content_role": ".album-feed__publisher-name 的 font-size",
        "css_property": "font-size",
        "token": "var(--body-sm-font-size)"
      },
      {
        "selector": ".album-feed__publisher-name",
        "content_role": ".album-feed__publisher-name 的 font-weight",
        "css_property": "font-weight",
        "token": "var(--font-weight-medium)"
      },
      {
        "selector": ".album-feed__publisher-name",
        "content_role": ".album-feed__publisher-name 的 line-height",
        "css_property": "line-height",
        "token": "var(--body-sm-line-height)"
      },
      {
        "selector": ".album-feed__publisher-meta",
        "content_role": ".album-feed__publisher-meta 的 color",
        "css_property": "color",
        "token": "var(--text-tertiary)"
      },
      {
        "selector": ".album-feed__publisher-meta",
        "content_role": ".album-feed__publisher-meta 的 font-size",
        "css_property": "font-size",
        "token": "var(--body-xs-font-size)"
      },
      {
        "selector": ".album-feed__publisher-meta",
        "content_role": ".album-feed__publisher-meta 的 line-height",
        "css_property": "line-height",
        "token": "var(--body-xs-line-height)"
      },
      {
        "selector": ".album-feed__type-badge",
        "content_role": "内容类型徽章纵向内边距",
        "css_property": "padding-block",
        "token": "var(--spacer-2)"
      },
      {
        "selector": ".album-feed__type-badge",
        "content_role": "内容类型徽章横向内边距",
        "css_property": "padding-inline",
        "token": "var(--spacer-4)"
      },
      {
        "selector": ".album-feed__type-badge",
        "content_role": "内容类型徽章 border-radius",
        "css_property": "border-radius",
        "token": "var(--radius-4)"
      },
      {
        "selector": ".album-feed__type-badge",
        "content_role": "内容类型徽章 background",
        "css_property": "background",
        "token": "var(--bg-brand-surface-l1)"
      },
      {
        "selector": ".album-feed__type-badge",
        "content_role": "内容类型徽章 color",
        "css_property": "color",
        "token": "var(--text-brand)"
      },
      {
        "selector": ".album-feed__type-badge",
        "content_role": "内容类型徽章 font-size",
        "css_property": "font-size",
        "token": "var(--body-xs-font-size)"
      },
      {
        "selector": ".album-feed__type-badge",
        "content_role": "内容类型徽章 line-height",
        "css_property": "line-height",
        "token": "var(--body-xs-line-height)"
      },
      {
        "selector": ".album-feed__status-badge",
        "content_role": "发布者状态徽章纵向内边距",
        "css_property": "padding-block",
        "token": "var(--spacer-2)"
      },
      {
        "selector": ".album-feed__status-badge",
        "content_role": "发布者状态徽章横向内边距",
        "css_property": "padding-inline",
        "token": "var(--spacer-4)"
      },
      {
        "selector": ".album-feed__status-badge",
        "content_role": "发布者状态徽章 border-radius",
        "css_property": "border-radius",
        "token": "var(--radius-4)"
      },
      {
        "selector": ".album-feed__status-badge",
        "content_role": "发布者状态徽章 background",
        "css_property": "background",
        "token": "var(--bg-subtle)"
      },
      {
        "selector": ".album-feed__status-badge",
        "content_role": "发布者状态徽章 color",
        "css_property": "color",
        "token": "var(--text-secondary)"
      },
      {
        "selector": ".album-feed__status-badge",
        "content_role": "发布者状态徽章 font-size",
        "css_property": "font-size",
        "token": "var(--body-xs-font-size)"
      },
      {
        "selector": ".album-feed__status-badge",
        "content_role": "发布者状态徽章 line-height",
        "css_property": "line-height",
        "token": "var(--body-xs-line-height)"
      },
      {
        "selector": ".album-feed__shop-badge",
        "content_role": "卡片店铺徽章纵向内边距",
        "css_property": "padding-block",
        "token": "var(--spacer-2)"
      },
      {
        "selector": ".album-feed__shop-badge",
        "content_role": "卡片店铺徽章横向内边距",
        "css_property": "padding-inline",
        "token": "var(--spacer-4)"
      },
      {
        "selector": ".album-feed__shop-badge",
        "content_role": "卡片店铺徽章 border-radius",
        "css_property": "border-radius",
        "token": "var(--radius-4)"
      },
      {
        "selector": ".album-feed__shop-badge",
        "content_role": "卡片店铺徽章 background",
        "css_property": "background",
        "token": "var(--bg-inverse)"
      },
      {
        "selector": ".album-feed__shop-badge",
        "content_role": "卡片店铺徽章 color",
        "css_property": "color",
        "token": "var(--text-inverse)"
      },
      {
        "selector": ".album-feed__shop-badge",
        "content_role": "卡片店铺徽章 font-size",
        "css_property": "font-size",
        "token": "var(--body-xs-font-size)"
      },
      {
        "selector": ".album-feed__shop-badge",
        "content_role": "卡片店铺徽章 line-height",
        "css_property": "line-height",
        "token": "var(--body-xs-line-height)"
      },
      {
        "selector": ".album-feed__summary",
        "content_role": ".album-feed__summary 的 color",
        "css_property": "color",
        "token": "var(--text-default)"
      },
      {
        "selector": ".album-feed__summary",
        "content_role": ".album-feed__summary 的 font-size",
        "css_property": "font-size",
        "token": "var(--body-md-font-size)"
      },
      {
        "selector": ".album-feed__summary",
        "content_role": ".album-feed__summary 的 line-height",
        "css_property": "line-height",
        "token": "var(--body-md-line-height)"
      },
      {
        "selector": ".album-feed__card-footer",
        "content_role": "卡片底部区域横向内边距",
        "css_property": "padding-inline",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".album-feed__card-footer",
        "content_role": "卡片底部区域顶部内边距",
        "css_property": "padding-top",
        "token": "var(--spacer-0)"
      },
      {
        "selector": ".album-feed__card-footer",
        "content_role": "卡片底部区域底部内边距",
        "css_property": "padding-bottom",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".album-feed__card-footer",
        "content_role": "卡片底部区域 gap",
        "css_property": "gap",
        "token": "var(--spacer-4)"
      },
      {
        "selector": ".album-feed__actions",
        "content_role": "操作行横向间距",
        "css_property": "gap",
        "token": "var(--spacer-12)"
      },
      {
        "selector": ".album-feed__empty",
        "content_role": ".album-feed__empty 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".album-feed__empty",
        "content_role": "空结果纵向内边距",
        "css_property": "padding-block",
        "token": "var(--spacer-16)"
      },
      {
        "selector": ".album-feed__empty",
        "content_role": "空结果横向内边距",
        "css_property": "padding-inline",
        "token": "var(--spacer-16)"
      },
      {
        "selector": ".album-feed__empty-title",
        "content_role": ".album-feed__empty-title 的 color",
        "css_property": "color",
        "token": "var(--text-default)"
      },
      {
        "selector": ".album-feed__empty-title",
        "content_role": ".album-feed__empty-title 的 font-size",
        "css_property": "font-size",
        "token": "var(--heading-xs-font-size)"
      },
      {
        "selector": ".album-feed__empty-title",
        "content_role": ".album-feed__empty-title 的 font-weight",
        "css_property": "font-weight",
        "token": "var(--heading-xs-font-weight)"
      },
      {
        "selector": ".album-feed__empty-title",
        "content_role": ".album-feed__empty-title 的 line-height",
        "css_property": "line-height",
        "token": "var(--heading-xs-line-height)"
      },
      {
        "selector": ".album-feed__empty-text",
        "content_role": ".album-feed__empty-text 的 color",
        "css_property": "color",
        "token": "var(--text-tertiary)"
      },
      {
        "selector": ".album-feed__empty-text",
        "content_role": ".album-feed__empty-text 的 font-size",
        "css_property": "font-size",
        "token": "var(--body-md-font-size)"
      },
      {
        "selector": ".album-feed__empty-text",
        "content_role": ".album-feed__empty-text 的 line-height",
        "css_property": "line-height",
        "token": "var(--body-md-line-height)"
      },
      {
        "selector": ".album-feed__filter-body",
        "content_role": ".album-feed__filter-body 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-12)"
      },
      {
        "selector": ".album-feed__filter-body",
        "content_role": ".album-feed__filter-body 的 padding",
        "css_property": "padding",
        "token": "var(--spacer-16)"
      },
      {
        "selector": ".album-feed__filter-section",
        "content_role": ".album-feed__filter-section 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-12)"
      },
      {
        "selector": ".album-feed__filter-title",
        "content_role": ".album-feed__filter-title 的 color",
        "css_property": "color",
        "token": "var(--text-default)"
      },
      {
        "selector": ".album-feed__filter-title",
        "content_role": ".album-feed__filter-title 的 font-size",
        "css_property": "font-size",
        "token": "var(--heading-xs-font-size)"
      },
      {
        "selector": ".album-feed__filter-title",
        "content_role": ".album-feed__filter-title 的 font-weight",
        "css_property": "font-weight",
        "token": "var(--heading-xs-font-weight)"
      },
      {
        "selector": ".album-feed__filter-title",
        "content_role": ".album-feed__filter-title 的 line-height",
        "css_property": "line-height",
        "token": "var(--heading-xs-line-height)"
      },
      {
        "selector": ".album-feed__filter-options",
        "content_role": ".album-feed__filter-options 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-12)"
      }
    ],
    "component_bindings": [
      {
        "binding_id": "feed-page-tabs",
        "slug": "tabs",
        "reason": "关注/推荐/上新页面级内容视图切换",
        "variant_dimensions": {
          "size": "standard",
          "layout": "scroll",
          "icon": "none",
          "state": "default"
        }
      },
      {
        "binding_id": "feed-search-toolbar",
        "slug": "search",
        "reason": "下滑手势浮现的工具栏使用 search 组件的 navbar-title-accent-search 强调变体，搜索框使用 md/accent-outline + 内嵌 select-image 动作",
        "variant_dimensions": {
          "size": "md",
          "surface": "accent-outline",
          "mode": "text",
          "state": "empty",
          "internalActions": "select-image",
          "hostPattern": "navbar-title-accent-search"
        }
      },
      {
        "binding_id": "feed-people-avatar",
        "slug": "avatar",
        "reason": "人维度横滑头像列表展示关注的人与店铺",
        "variant_dimensions": {
          "type": "image",
          "size": "40"
        }
      },
      {
        "binding_id": "feed-people-avatar-self",
        "slug": "avatar",
        "reason": "人维度最右侧固定的自己入口",
        "variant_dimensions": {
          "type": "image",
          "size": "40"
        }
      },
      {
        "binding_id": "feed-filter-tag",
        "slug": "tag",
        "reason": "多维度行内筛选标签，横向滚动选择上新/星标/合集等",
        "variant_dimensions": {
          "size": "28",
          "theme": "white",
          "state": "normal"
        }
      },
      {
        "binding_id": "feed-filter-open-tag",
        "slug": "tag",
        "reason": "全部上新栏末尾的弱化筛选入口，使用 gray 主题与常规状态",
        "variant_dimensions": {
          "size": "28",
          "theme": "gray",
          "state": "normal"
        }
      },
      {
        "binding_id": "feed-content-card",
        "slug": "card",
        "reason": "承载自适应产品或笔记内容入口",
        "variant_dimensions": {
          "base": "auto",
          "surface": "surface"
        }
      },
      {
        "binding_id": "feed-cover-image",
        "slug": "image",
        "reason": "展示动态媒体封面；瀑布流下按自然比例撑高",
        "variant_dimensions": {
          "fit": "cover",
          "size": "custom-rect",
          "radius": "none",
          "state": "loaded",
          "interaction": "static"
        }
      },
      {
        "binding_id": "feed-publisher-avatar",
        "slug": "avatar",
        "reason": "展示动态发布者身份",
        "variant_dimensions": {
          "type": "image",
          "size": "24"
        }
      },
      {
        "binding_id": "feed-forward-link",
        "slug": "link",
        "reason": "卡片核心操作一键转发，靠右显示",
        "variant_dimensions": {
          "mode": "standalone",
          "size": "12",
          "state": "default"
        }
      },
      {
        "binding_id": "feed-empty-action",
        "slug": "button",
        "reason": "筛选无结果时清除条件恢复内容",
        "variant_dimensions": {
          "emphasis": "medium",
          "size": "md",
          "iconMode": "text-only",
          "state": "default"
        }
      },
      {
        "binding_id": "feed-filter-modal",
        "slug": "modal",
        "reason": "承载用户确认使用的集中筛选 Modal；frame-x 变体按正式契约通过 overlay 宿主打开",
        "variant_dimensions": {
          "variant": "frame-x",
          "title": "default",
          "action": "double-h",
          "align": "center",
          "state": "open"
        }
      },
      {
        "binding_id": "feed-filter-navbar",
        "slug": "navbar",
        "reason": "筛选 Modal 使用正式 default 标题栏与下箭头关闭入口",
        "variant_dimensions": {
          "leftControl": "close-icon",
          "titleAlignment": "center",
          "actions": "none",
          "spacing": "default",
          "pageTransition": "present",
          "position": "sticky"
        }
      },
      {
        "binding_id": "feed-filter-radio-checked",
        "slug": "radio",
        "reason": "筛选 Modal 中表示当前互斥选项",
        "variant_dimensions": {
          "size": "sm",
          "state": "checked",
          "presentation": "with-text-group",
          "theme": "light"
        }
      },
      {
        "binding_id": "feed-filter-radio-unchecked",
        "slug": "radio",
        "reason": "筛选 Modal 中表示未选互斥选项",
        "variant_dimensions": {
          "size": "sm",
          "state": "unchecked",
          "presentation": "with-text-group",
          "theme": "light"
        }
      },
      {
        "binding_id": "feed-filter-cancel",
        "slug": "button",
        "reason": "关闭筛选 Modal 且不改变已应用条件",
        "variant_dimensions": {
          "emphasis": "weak",
          "size": "lg",
          "iconMode": "text-only",
          "state": "default"
        }
      },
      {
        "binding_id": "feed-filter-apply",
        "slug": "button",
        "reason": "应用筛选并查看结果，是 Modal 唯一主操作",
        "variant_dimensions": {
          "emphasis": "strong",
          "size": "lg",
          "iconMode": "text-only",
          "state": "default"
        }
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "页面首要任务是发现并进入动态详情；顶部 page-tabs 与搜索栏共同包进 sticky top-stack 吸顶，背景跟随顶部白色；页面背景从顶部白色渐变到 --bg-page 灰色，过渡完成点在瀑布流往下一点位置；搜索框使用 searchbox--accent 强调模式，默认显示占据文档流，层级低于 page-tabs，上滑手势收起（max-height 归零让下方内容上移）、下滑手势或滚回顶部重现；筛选入口从搜索框右侧移除，弱化后放到全部上新这一栏的横滑标签末尾，使用 tag--gray；全部上新横滑标签区保留最小高度确保可见；人维度栏约 10 个发布者支持横滑、头像右下角不再放置店铺标识、「我的相册」项 sticky right 固定在可视区最右侧；瀑布流双列按媒体自然比例撑高参差，显式设置 row-gap 让列内卡片上下不贴在一起，375/393px 双列，768px 自动增列且单卡不超过 220px；卡片信息层级紧凑，发布者区单行（头像 + 名字 + 店铺文字徽章），状态恢复为文字徽章后与内容类型、时间组成 meta 行并保留间距，1 至 2 行摘要，底部操作行一键转发靠右不再保留商品入口；通过 host-shell-page__panel 相对定位让场景根元素正确约束在 tab 内容区内，配合滚动容器底部预留 40px + safe-area-bottom，避免内容被 bottom-nav 遮挡。",
      "page_edge_mode": "M8",
      "mutable_regions": [
        ".album-feed__floating-toolbar",
        ".album-feed__grid",
        ".album-feed__card-content",
        ".album-feed__empty"
      ]
    },
    "interaction_contract": [
      {
        "dom_id": "open-global-search",
        "target": "feedback:toast"
      },
      {
        "dom_id": "page-tab-following",
        "target": "state:feed-ready"
      },
      {
        "dom_id": "page-tab-recommended",
        "target": "feedback:toast"
      },
      {
        "dom_id": "page-tab-new",
        "target": "feedback:toast"
      },
      {
        "dom_id": "people-{publisher_id}",
        "target": "feedback:toast"
      },
      {
        "dom_id": "people-self",
        "target": "feedback:toast"
      },
      {
        "dom_id": "filter-tag-all",
        "target": "state:feed-ready"
      },
      {
        "dom_id": "filter-tag-new",
        "target": "state:filter-applied"
      },
      {
        "dom_id": "filter-tag-starred",
        "target": "state:filter-applied"
      },
      {
        "dom_id": "filter-tag-collection",
        "target": "state:filter-applied"
      },
      {
        "dom_id": "filter-tag-presale",
        "target": "state:filter-applied"
      },
      {
        "dom_id": "filter-tag-live",
        "target": "state:filter-applied"
      },
      {
        "dom_id": "open-filter",
        "target": "overlay:sheet"
      },
      {
        "dom_id": "filter-apply",
        "target": "state:filter-applied"
      },
      {
        "dom_id": "empty-clear",
        "target": "state:feed-ready"
      },
      {
        "dom_id": "feed-open-dynamic",
        "target": "route:dynamic-detail"
      },
      {
        "dom_id": "forward-{dynamic_id}",
        "target": "feedback:toast"
      }
    ],
    "state_contract": [
      {
        "state_id": "feed-ready",
        "initial": true,
        "trigger": "进入动态主 tab",
        "visible_result": "页面级 tabs 与搜索栏共同吸顶顶部，搜索栏默认显示占据文档流，首屏显示双列瀑布流与人维度栏",
        "fallback": "保留可浏览的本地动态",
        "persistence": "memory"
      },
      {
        "state_id": "page-tab-switch",
        "initial": false,
        "trigger": "点击推荐或上新 Tab",
        "visible_result": "Toast 提示该视图本期暂未开放，停留在关注视图",
        "fallback": "停留当前关注视图",
        "persistence": "memory"
      },
      {
        "state_id": "global-search-entry-feedback",
        "initial": false,
        "trigger": "点击全局搜索入口",
        "visible_result": "Toast 提示全局搜索能力本期暂未开放，当前内容不变",
        "fallback": "停留当前动态页",
        "persistence": "memory"
      },
      {
        "state_id": "people-entry-feedback",
        "initial": false,
        "trigger": "点击人维度头像",
        "visible_result": "Toast 提示好友主页本期暂未开放，当前内容不变",
        "fallback": "停留当前动态页",
        "persistence": "memory"
      },
      {
        "state_id": "filter-draft",
        "initial": false,
        "trigger": "打开筛选 Modal 并选择条件",
        "visible_result": "Modal 内更新互斥选择但未改变当前结果",
        "fallback": "取消后保留已应用条件",
        "persistence": "memory"
      },
      {
        "state_id": "filter-applied",
        "initial": false,
        "trigger": "点击筛选标签或查看结果",
        "visible_result": "按筛选维度组合过滤并显示已选标签高亮，搜索框右侧筛选文案显示筛选·已选",
        "fallback": "清除条件回到全部",
        "persistence": "memory"
      },
      {
        "state_id": "result-empty",
        "initial": false,
        "trigger": "组合条件无匹配动态",
        "visible_result": "展示无结果说明与清除条件入口",
        "fallback": "清除条件恢复内容",
        "persistence": "memory"
      },
      {
        "state_id": "toolbar-revealed",
        "initial": false,
        "trigger": "下滑手势或滚回顶部",
        "visible_result": "搜索栏在吸顶栈中展开占据文档流，上滑手势后收起让出可视区域",
        "fallback": "滚回顶部恢复显示",
        "persistence": "memory"
      },
      {
        "state_id": "forward-success",
        "initial": false,
        "trigger": "点击卡片一键转发",
        "visible_result": "Toast 提示动态已转发，且不进入详情",
        "fallback": "当前浏览上下文不变",
        "persistence": "memory"
      },
      {
        "state_id": "feed-wide-layout",
        "initial": false,
        "trigger": "视口宽度增至 768px",
        "visible_result": "瀑布流自动增列且单卡不超过 220px 并居中，交互层级不变",
        "fallback": "常见手机宽度保持双列",
        "persistence": "memory"
      }
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [
      375,
      393
    ],
    "checked_at": "2026-07-23T12:00:00.000Z",
    "scope": "顶部 page-tabs 与搜索栏 sticky 吸顶且搜索栏层级低于 tabs、背景白到灰渐变在瀑布流位置过渡、搜索栏默认显示且上滑收起下滑重现、人维度栏无店铺 badge 且我的相册 sticky right、瀑布流双列卡片信息层级紧凑、底部留白与 bottom-nav 隔离，375/393px 全部通过。",
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

(function registerAlbumProductFeed() {
  var imagePool = [
    './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092896_1960_1.jpg.jpg',
    './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092896_1518_0.jpg.jpg',
    './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092843_8406_8.jpg.jpg',
    './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092843_7820_16.jpg.jpg',
    './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092877_8943_0.jpg.jpg',
    './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092860_9030_2.jpg.jpg',
    './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092843_9294_21.jpg.jpg',
    './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092843_8369_2.jpg.jpg',
    './lib/assets/image/avatar/avatar_001.jpg',
    './lib/assets/image/avatar/avatar_008.jpg',
    './lib/assets/image/avatar/avatar_016.jpg',
    './lib/assets/image/avatar/avatar_024.jpg',
    './lib/assets/image/avatar/avatar_032.jpg',
    './lib/assets/image/avatar/avatar_040.jpg',
    './lib/assets/image/avatar/avatar_048.jpg',
    './lib/assets/image/avatar/avatar_056.jpg',
    './lib/assets/image/avatar/avatar_064.jpg',
    './lib/assets/image/avatar/avatar_072.jpg'
  ];

  var publishers = [
    { publisher_id: 'pub-01', publisher_name: '云朵服饰', publisher_avatar: imagePool[8], publisher_type: 'shop', publisher_statuses: ['live', 'verified'] },
    { publisher_id: 'pub-02', publisher_name: '小满的衣橱', publisher_avatar: imagePool[9], publisher_type: 'person', publisher_statuses: ['new', 'starred'] },
    { publisher_id: 'pub-03', publisher_name: '漫川生活馆', publisher_avatar: imagePool[10], publisher_type: 'shop', publisher_statuses: ['new', 'verified'] },
    { publisher_id: 'pub-04', publisher_name: '阿宁手记', publisher_avatar: imagePool[11], publisher_type: 'person', publisher_statuses: ['starred', 'verified'] },
    { publisher_id: 'pub-05', publisher_name: '微光面料室', publisher_avatar: imagePool[12], publisher_type: 'shop', publisher_statuses: ['new', 'starred'] },
    { publisher_id: 'pub-06', publisher_name: '陆小满', publisher_avatar: imagePool[13], publisher_type: 'person', publisher_statuses: ['verified'] },
    { publisher_id: 'pub-07', publisher_name: '白茶手作', publisher_avatar: imagePool[14], publisher_type: 'shop', publisher_statuses: ['live', 'new'] },
    { publisher_id: 'pub-08', publisher_name: '苏野', publisher_avatar: imagePool[15], publisher_type: 'person', publisher_statuses: ['starred'] },
    { publisher_id: 'pub-09', publisher_name: '云间集', publisher_avatar: imagePool[16], publisher_type: 'shop', publisher_statuses: ['verified'] },
    { publisher_id: 'pub-10', publisher_name: '朝晚穿搭', publisher_avatar: imagePool[17], publisher_type: 'person', publisher_statuses: ['new'] }
  ];

  var products = [
    { product_id: 'prod-01', name: '云感垂坠针织短袖', price: 129, image_list: [imagePool[0], imagePool[1], imagePool[2]], selling_points: ['柔软亲肤', '轻薄不透', '通勤百搭'], sku_options: ['奶油白', '雾霾蓝', 'S / M / L'], attributes: ['材质：棉混纺', '版型：合身', '季节：夏季'], detail_sections: ['细密针织兼顾透气与垂坠感。', '建议冷水轻柔洗涤并平铺晾干。'], seller_id: 'pub-01', seller_name: '云朵服饰' },
    { product_id: 'prod-02', name: '复古高腰直筒牛仔裤', price: 169, image_list: [imagePool[3], imagePool[4]], selling_points: ['高腰显腿长', '微弹不紧绷', '复古水洗'], sku_options: ['浅蓝', '深蓝', '26–30'], attributes: ['材质：棉丹宁', '裤型：直筒', '腰型：高腰'], detail_sections: ['直筒剪裁修饰腿型，日常搭配更省心。'], seller_id: 'pub-03', seller_name: '漫川生活馆' },
    { product_id: 'prod-03', name: '法式碎花连衣裙', price: 219, image_list: [imagePool[5], imagePool[6]], selling_points: ['收腰剪裁', '轻盈里衬', '通勤度假两穿'], sku_options: ['杏色花卉', 'S / M / L'], attributes: ['面料：雪纺', '裙长：中长款'], detail_sections: ['细碎花型和自然腰线，单穿即可完成搭配。'], seller_id: 'pub-02', seller_name: '小满的衣橱' },
    { product_id: 'prod-04', name: '极简通勤托特包', price: 99, image_list: [imagePool[7], imagePool[2]], selling_points: ['轻量大容量', '内置分区', '可肩背'], sku_options: ['黑色', '燕麦色'], attributes: ['材质：环保皮革', '闭合：磁吸'], detail_sections: ['可容纳折叠伞、平板与日常随身物。'], seller_id: 'pub-04', seller_name: '阿宁手记' }
  ];

  function media(id, type, src, duration) {
    var item = { media_id: id, media_type: type, poster_or_src: src };
    if (duration) item.duration_label = duration;
    return item;
  }

  var dynamics = [
    { dynamic_id: 'dyn-01', publisher_id: 'pub-01', published_at: '刚刚', published_order: 10, content_type: 'product', category_id: 'women', text_content: '今日上新这件云感针织短袖，垂坠但不贴身，通勤和周末都很好搭。实拍是自然光，颜色更接近第一张。', media_list: [media('m-01', 'video', imagePool[0], '00:18'), media('m-02', 'image', imagePool[1])], related_product_ids: ['prod-01'] },
    { dynamic_id: 'dyn-02', publisher_id: 'pub-02', published_at: '8 分钟前', published_order: 9, content_type: 'note', text_content: '最近常穿的三套清爽通勤搭配。比起堆叠单品，我更喜欢把颜色控制在两种以内，早上出门会轻松很多。', media_list: [media('m-03', 'image', imagePool[5]), media('m-04', 'video', imagePool[6], '00:26')] },
    { dynamic_id: 'dyn-03', publisher_id: 'pub-03', published_at: '20 分钟前', published_order: 8, content_type: 'product', category_id: 'women', text_content: '直筒牛仔裤补到货了，腰头做了微弹处理，坐久也不会勒。浅蓝色更适合夏天。', media_list: [media('m-05', 'image', imagePool[3]), media('m-06', 'image', imagePool[4])], related_product_ids: ['prod-02'] },
    { dynamic_id: 'dyn-04', publisher_id: 'pub-04', published_at: '今天 10:30', published_order: 7, content_type: 'note', text_content: '把旧衣重新整理了一次，留下真正会反复穿的单品。衣橱变轻之后，每天做选择也更快。', media_list: [media('m-07', 'video', imagePool[7], '00:34'), media('m-08', 'image', imagePool[2])] },
    { dynamic_id: 'dyn-05', publisher_id: 'pub-02', published_at: '今天 09:15', published_order: 6, content_type: 'product', category_id: 'women', text_content: '碎花裙这次把里衬做得更轻，保留垂感也不容易透。腰线位置对小个子更友好。', media_list: [media('m-09', 'image', imagePool[5]), media('m-10', 'video', imagePool[6], '00:21')], related_product_ids: ['prod-03'] },
    { dynamic_id: 'dyn-06', publisher_id: 'pub-01', published_at: '昨天 18:40', published_order: 5, content_type: 'note', text_content: '直播结束后整理了大家最常问的面料护理方法，针织类尽量不要悬挂晾晒，肩线会更耐穿。', media_list: [media('m-11', 'image', imagePool[1])] },
    { dynamic_id: 'dyn-07', publisher_id: 'pub-04', published_at: '昨天', published_order: 4, content_type: 'product', category_id: 'accessory', text_content: '这个托特包我连续背了一周，最喜欢的是自重很轻，通勤需要的东西都能分区放好。', media_list: [media('m-12', 'video', imagePool[7], '00:16'), media('m-13', 'image', imagePool[2])], related_product_ids: ['prod-04'] },
    { dynamic_id: 'dyn-08', publisher_id: 'pub-03', published_at: '2 天前', published_order: 3, content_type: 'note', text_content: '店里换了新的陈列方式，同色系放在一起后，客人挑选搭配明显更快了。', media_list: [media('m-14', 'image', imagePool[4]), media('m-15', 'image', imagePool[3])] },
    { dynamic_id: 'dyn-09', publisher_id: 'pub-01', published_at: '3 天前', published_order: 2, content_type: 'product', category_id: 'women', text_content: '针织基础款补了一批新色，奶油白和雾霾蓝都很显肤色，尺码按正常码选择即可。', media_list: [media('m-16', 'image', imagePool[2]), media('m-17', 'video', imagePool[0], '00:12')], related_product_ids: ['prod-01'] },
    { dynamic_id: 'dyn-10', publisher_id: 'pub-02', published_at: '本周一', published_order: 1, content_type: 'note', text_content: '周末去看了一个小型面料展，记录了几组很舒服的中性色，准备慢慢用到后面的搭配里。', media_list: [media('m-18', 'image', imagePool[6]), media('m-19', 'image', imagePool[5])] },
    { dynamic_id: 'dyn-11', publisher_id: 'pub-07', published_at: '12 分钟前', published_order: 0, content_type: 'product', category_id: 'home', text_content: '今天店里现场裁剪的桌旗上线了，手工锁边，颜色比图片更柔和一些。', media_list: [media('m-20', 'image', imagePool[4]), media('m-21', 'image', imagePool[3])], related_product_ids: [] },
    { dynamic_id: 'dyn-12', publisher_id: 'pub-05', published_at: '昨天 22:10', published_order: -1, content_type: 'note', text_content: '把上周整理的色卡和面料样本重新归档，未来一段时间的搭配主线会围绕这组中性色。', media_list: [media('m-22', 'image', imagePool[2])] }
  ];

  window.WEGO_DYNAMIC_CATALOG = { publishers: publishers, products: products, dynamics: dynamics };

  /* 状态配置：优先级与显示文案（使用文字徽章替代图标，避免碎片化） */
  var statusConfig = [
    { value: 'verified', label: '已认证' },
    { value: 'starred', label: '已星标' },
    { value: 'live', label: '直播中' },
    { value: 'new', label: '上新' }
  ];
  var typeConfig = {
    product: { label: '产品' },
    note: { label: '笔记' }
  };

  function escapeHtml(value) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value == null ? '' : value).split('').map(function(char) { return map[char] || char; }).join('');
  }

  function getPublisher(id) {
    return publishers.find(function(item) { return item.publisher_id === id; }) || publishers[0];
  }

  function getProduct(id) {
    return products.find(function(item) { return item.product_id === id; }) || products[0];
  }

  function orderedStatuses(statuses) {
    var ordered = [];
    statusConfig.forEach(function(cfg) {
      if (statuses.indexOf(cfg.value) !== -1) ordered.push(cfg);
    });
    return ordered;
  }

  function statusBadgesTemplate(publisher) {
    return orderedStatuses(publisher.publisher_statuses).map(function(cfg) {
      return '<span class="album-feed__status-badge">' + escapeHtml(cfg.label) + '</span>';
    }).join('');
  }

  function feedShopBadgeTemplate(publisher) {
    if (publisher.publisher_type !== 'shop') return '';
    return '<span class="album-feed__shop-badge">店铺</span>';
  }

  function feedCardTemplate(item) {
    var publisher = getPublisher(item.publisher_id);
    var cover = item.media_list[0];
    var typeCfg = typeConfig[item.content_type];
    var videoMark = cover.media_type === 'video'
      ? '<span class="album-feed__duration">' + escapeHtml(cover.duration_label) + '</span>'
      : '';
    return ''
      + '<div class="card card--surface album-feed__card" role="link" tabindex="0" aria-label="查看' + (item.content_type === 'product' ? '产品' : '笔记') + '动态详情" data-dynamic-id="' + item.dynamic_id + '" data-dd-id="feed-card-' + item.dynamic_id + '" data-component-slug="card" data-component-binding="feed-content-card" data-dom-id="open-dynamic-' + item.dynamic_id + '">'
      +   '<div class="card__content">'
      +     '<div class="card__header album-feed__cover-host">'
      +       '<div class="wg-image album-feed__cover" data-dd-id="feed-cover-' + item.dynamic_id + '" data-component-slug="image" data-component-binding="feed-cover-image">'
      +         '<img class="wg-image__src is-loaded" src="' + cover.poster_or_src + '" alt="">'
      +       '</div>'
      +       videoMark
      +     '</div>'
      +     '<div class="card__body album-feed__card-content">'
      +       '<div class="album-feed__publisher-row">'
      +         '<div class="avatar avatar--24 avatar--image album-feed__publisher-avatar" data-dd-id="feed-avatar-' + item.dynamic_id + '" data-component-slug="avatar" data-component-binding="feed-publisher-avatar">'
      +           '<img src="' + publisher.publisher_avatar + '" alt="' + escapeHtml(publisher.publisher_name) + '">'
      +         '</div>'
      +         '<span class="album-feed__publisher-name">' + escapeHtml(publisher.publisher_name) + '</span>'
      +         feedShopBadgeTemplate(publisher)
      +       '</div>'
      +       '<div class="album-feed__meta-row">'
      +         '<span class="album-feed__type-badge">' + escapeHtml(typeCfg.label) + '</span>'
      +         statusBadgesTemplate(publisher)
      +         '<span class="album-feed__publisher-meta">' + escapeHtml(item.published_at) + '</span>'
      +       '</div>'
      +       '<p class="album-feed__summary">' + escapeHtml(item.text_content) + '</p>'
      +     '</div>'
      +     '<div class="card__footer album-feed__card-footer">'
      +       '<div class="album-feed__actions">'
      +         '<button type="button" class="link link--12 album-feed__forward-link" data-dd-id="feed-forward-' + item.dynamic_id + '" data-component-slug="link" data-component-binding="feed-forward-link" data-dom-id="forward-' + item.dynamic_id + '">一键转发</button>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function emptyTemplate() {
    return '<div class="album-feed__empty">'
      + '<p class="album-feed__empty-title">没有匹配的动态</p>'
      + '<p class="album-feed__empty-text">可以清除当前条件，继续浏览推荐内容。</p>'
      + '<button type="button" class="btn btn--medium btn--md" data-dd-id="feed-empty-action" data-component-slug="button" data-component-binding="feed-empty-action" data-dom-id="empty-clear">清除筛选</button>'
      + '</div>';
  }

  function radioOptionTemplate(group, value, label, checked) {
    var binding = checked ? 'feed-filter-radio-checked' : 'feed-filter-radio-unchecked';
    return '<div class="radio-field album-feed__filter-option" tabindex="0" role="radio" aria-checked="' + (checked ? 'true' : 'false') + '" data-filter-group="' + group + '" data-filter-value="' + value + '" data-dom-id="filter-' + group + '-' + value + '">'
      + '<div class="radio radio--sm' + (checked ? ' radio--checked' : '') + '" data-group="feed-' + group + '" data-dd-id="filter-radio-' + group + '-' + value + '" data-component-slug="radio" data-component-binding="' + binding + '"><div class="radio__inner"></div><div class="radio__dot"></div></div>'
      + '<span class="radio-field__text">' + escapeHtml(label) + '</span>'
      + '</div>';
  }

  function filterModalTemplate(draft) {
    var publisherOptions = [['all', '全部发布者']].concat(publishers.map(function(publisher) {
      return [publisher.publisher_id, (publisher.publisher_type === 'shop' ? '店铺 · ' : '个人 · ') + publisher.publisher_name];
    }));
    var categoryOptions = [['all', '全部分类'], ['women', '女装'], ['accessory', '配饰'], ['home', '家居']];
    function options(group, list, selected) {
      return list.map(function(option) { return radioOptionTemplate(group, option[0], option[1], selected === option[0]); }).join('');
    }
    return ''
      + '<div class="modal modal--frame-x modal--has-actions" role="dialog" aria-modal="true" data-state="closed" data-dd-id="feed-filter-modal" data-component-slug="modal" data-component-binding="feed-filter-modal">'
      +   '<div class="modal__panel">'
      +     '<div class="modal__title modal__title--default">'
      +       '<div class="navbar" data-dd-id="feed-filter-navbar" data-component-slug="navbar" data-component-binding="feed-filter-navbar">'
      +         '<div class="navbar__body">'
      +           '<div class="navbar__left"><button type="button" class="navbar__left-btn navbar__left-btn--circle" aria-label="关闭筛选" data-dom-id="filter-close"><i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i></button></div>'
      +           '<div class="navbar__center"><span class="navbar__title">筛选动态</span></div>'
      +           '<div class="navbar__right"></div>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="modal__body album-feed__filter-body">'
      +       '<section class="album-feed__filter-section"><h3 class="album-feed__filter-title">发布者</h3><div class="radio-field-group album-feed__filter-options" role="radiogroup" aria-label="发布者">' + options('publisher', publisherOptions, draft.publisher) + '</div></section>'
      +       '<section class="album-feed__filter-section" data-filter-category-section><h3 class="album-feed__filter-title">商品分类</h3><div class="radio-field-group album-feed__filter-options" role="radiogroup" aria-label="商品分类">' + options('category', categoryOptions, draft.category) + '</div></section>'
      +     '</div>'
      +     '<div class="modal__actions">'
      +       '<div class="modal__action-gradient"></div>'
      +       '<div class="modal__buttons">'
      +         '<button type="button" class="btn btn--weak btn--lg" data-dd-id="feed-filter-cancel" data-component-slug="button" data-component-binding="feed-filter-cancel" data-dom-id="filter-cancel">取消</button>'
      +         '<button type="button" class="btn btn--strong btn--lg" data-dd-id="feed-filter-apply" data-component-slug="button" data-component-binding="feed-filter-apply" data-dom-id="filter-apply">查看结果</button>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  window.WegoApp.registerScene({
    routeId: 'album-product-feed',
    title: '动态',
    template: `
    <section class="album-feed" data-surface-id="album-product-feed" data-route-id="album-product-feed" data-route-bound="true" data-layout-mode="composed" data-page-edge-mode="M8" data-bg="page">
      <div class="album-feed__top-stack" data-top-stack>
        <div class="album-feed__page-tabs" data-page-tabs>
          <div class="wg-tabs wg-tabs--standard wg-tabs--scroll" role="tablist" data-dd-id="feed-page-tabs" data-component-slug="tabs" data-component-binding="feed-page-tabs">
            <div class="wg-tabs__scroll">
              <button class="wg-tabs__item" role="tab" aria-selected="true" type="button" data-page-tab="following" data-dom-id="page-tab-following"><span class="wg-tabs__content"><span class="wg-tabs__label">关注</span></span></button>
              <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-page-tab="recommended" data-dom-id="page-tab-recommended"><span class="wg-tabs__content"><span class="wg-tabs__label">推荐</span></span></button>
              <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-page-tab="new" data-dom-id="page-tab-new"><span class="wg-tabs__content"><span class="wg-tabs__label">上新</span></span></button>
              <span class="wg-tabs__active-indicator" aria-hidden="true"></span>
            </div>
          </div>
        </div>
        <div class="album-feed__floating-toolbar" data-toolbar-floating aria-hidden="false">
          <div class="search-toolbar">
            <div class="searchbox searchbox--md searchbox--accent" role="button" tabindex="0" aria-label="打开全局搜索" data-dom-id="open-global-search" data-dd-id="feed-search-toolbar" data-component-slug="search" data-component-binding="feed-search-toolbar">
              <span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>
              <div class="searchbox__input"><span class="searchbox__placeholder">搜索全局内容</span></div>
              <div class="searchbox__actions">
                <button class="searchbox__action wego-iconfont-s icon-tupian" type="button" aria-label="选择图片"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="album-feed__scroll" data-tab-scroll>
        <div class="album-feed__people-wrap" data-region="people-wrap">
          <div class="album-feed__people-scroll" data-region="people-scroll">
            <div class="album-feed__people-list" data-region="people-list"></div>
            <div class="album-feed__people-self" data-dom-id="people-self">
              <div class="album-feed__people-item">
                <div class="avatar avatar--40 avatar--image album-feed__people-avatar" data-dd-id="feed-people-avatar-self" data-component-slug="avatar" data-component-binding="feed-people-avatar-self"><img src="./lib/assets/image/avatar-defult.png" alt="我的相册"></div>
                <span class="album-feed__people-name">我的相册</span>
              </div>
            </div>
          </div>
        </div>
        <div class="album-feed__filter-tags" data-region="filter-tags" role="group" aria-label="多维度筛选">
          <button type="button" class="tag tag--28 tag--brand tag--selected" data-filter-dimension="all" data-dom-id="filter-tag-all" data-dd-id="feed-filter-tag-all" data-component-slug="tag" data-component-binding="feed-filter-tag"><span class="tag__label">全部</span></button>
          <button type="button" class="tag tag--28 tag--white tag--normal" data-filter-dimension="new" data-dom-id="filter-tag-new" data-dd-id="feed-filter-tag-new" data-component-slug="tag" data-component-binding="feed-filter-tag"><span class="tag__label">上新</span></button>
          <button type="button" class="tag tag--28 tag--white tag--normal" data-filter-dimension="starred" data-dom-id="filter-tag-starred" data-dd-id="feed-filter-tag-starred" data-component-slug="tag" data-component-binding="feed-filter-tag"><span class="tag__label">星标</span></button>
          <button type="button" class="tag tag--28 tag--white tag--normal" data-filter-dimension="collection" data-dom-id="filter-tag-collection" data-dd-id="feed-filter-tag-collection" data-component-slug="tag" data-component-binding="feed-filter-tag"><span class="tag__label">合集</span></button>
          <button type="button" class="tag tag--28 tag--white tag--normal" data-filter-dimension="presale" data-dom-id="filter-tag-presale" data-dd-id="feed-filter-tag-presale" data-component-slug="tag" data-component-binding="feed-filter-tag"><span class="tag__label">预售</span></button>
          <button type="button" class="tag tag--28 tag--white tag--normal" data-filter-dimension="live" data-dom-id="filter-tag-live" data-dd-id="feed-filter-tag-live" data-component-slug="tag" data-component-binding="feed-filter-tag"><span class="tag__label">直播</span></button>
          <button type="button" class="tag tag--28 tag--gray tag--normal album-feed__filter-open" data-dom-id="open-filter" data-dd-id="feed-filter-open" data-component-slug="tag" data-component-binding="feed-filter-open-tag"><span class="tag__label">筛选</span></button>
        </div>
        <main class="album-feed__grid" data-region="feed-grid" data-dom-id="feed-open-dynamic"></main>
        <div data-region="empty-host" hidden></div>
        <div class="album-feed__contract-seed" hidden aria-hidden="true">
          <div class="navbar" data-dd-id="feed-filter-navbar-seed" data-component-slug="navbar" data-component-binding="feed-filter-navbar"><div class="navbar__body"><div class="navbar__left"><button type="button" class="navbar__left-btn navbar__left-btn--circle" aria-label="关闭"><i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i></button></div><div class="navbar__center"><span class="navbar__title">筛选动态</span></div><div class="navbar__right"></div></div></div>
          <div class="radio radio--sm radio--checked" data-group="feed-seed-checked" data-dd-id="feed-radio-checked-seed" data-component-slug="radio" data-component-binding="feed-filter-radio-checked"><div class="radio__inner"></div><div class="radio__dot"></div></div>
          <div class="radio radio--sm" data-group="feed-seed-unchecked" data-dd-id="feed-radio-unchecked-seed" data-component-slug="radio" data-component-binding="feed-filter-radio-unchecked"><div class="radio__inner"></div><div class="radio__dot"></div></div>
          <button type="button" class="link link--12" data-dd-id="feed-forward-link-seed" data-component-slug="link" data-component-binding="feed-forward-link">一键转发</button>
        </div>
      </div>
    </section>
  `,
    presentation: { type: 'host-tab', transition: 'none', dismissAction: 'tab-switch', overlayLevel: 'inline', coversTabBar: false },
    init: function initAlbumProductFeed(ctx) {
      var root = ctx.root;
      var scroll = root.querySelector('.album-feed__scroll');
      var pageTabs = root.querySelector('[data-page-tabs]');
      var floatingToolbar = root.querySelector('[data-toolbar-floating]');
      var grid = root.querySelector('[data-region="feed-grid"]');
      var emptyHost = root.querySelector('[data-region="empty-host"]');
      var filterOpenTag = root.querySelector('[data-dom-id="open-filter"]');
      var peopleList = root.querySelector('[data-region="people-list"]');
      var filterTags = root.querySelector('[data-region="filter-tags"]');

      var filterDimensions = [
        { value: 'all', label: '全部' },
        { value: 'new', label: '上新' },
        { value: 'starred', label: '星标' },
        { value: 'collection', label: '合集' },
        { value: 'presale', label: '预售' },
        { value: 'live', label: '直播' }
      ];

      if (!ctx.state.pageTab) ctx.state.pageTab = 'following';
      if (!ctx.state.filters) ctx.state.filters = { content: 'all', publisher: 'all', category: 'all', dimension: 'all' };
      if (typeof ctx.state.scrollPosition !== 'number') ctx.state.scrollPosition = 0;

      function updateTabsIndicator(tabs) {
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

      function updateAllIndicators() {
        requestAnimationFrame(function() {
          updateTabsIndicator(pageTabs.querySelector('.wg-tabs'));
        });
      }

      function syncPageTabs() {
        pageTabs.querySelectorAll('[data-page-tab]').forEach(function(item) {
          item.setAttribute('aria-selected', item.dataset.pageTab === ctx.state.pageTab ? 'true' : 'false');
        });
      }

      function peopleItemTemplate(publisher) {
        return '<button type="button" class="album-feed__people-item" data-dom-id="people-' + publisher.publisher_id + '">'
          + '<div class="avatar avatar--40 avatar--image album-feed__people-avatar" data-dd-id="feed-people-avatar-' + publisher.publisher_id + '" data-component-slug="avatar" data-component-binding="feed-people-avatar">'
          +   '<img src="' + publisher.publisher_avatar + '" alt="' + escapeHtml(publisher.publisher_name) + '">'
          + '</div>'
          + '<span class="album-feed__people-name">' + escapeHtml(publisher.publisher_name) + '</span>'
          + '</button>';
      }

      function renderPeopleList() {
        peopleList.innerHTML = publishers.map(peopleItemTemplate).join('');
      }

      function bindPeopleEvents() {
        publishers.forEach(function(publisher) {
          var peopleItem = root.querySelector('[data-dom-id="people-' + publisher.publisher_id + '"]');
          if (peopleItem) peopleItem.addEventListener('click', function() { ctx.toast('好友主页本期暂未开放'); });
        });
      }

      function syncFilterTags() {
        filterTags.querySelectorAll('[data-filter-dimension]').forEach(function(tag) {
          var selected = ctx.state.filters.dimension === tag.dataset.filterDimension;
          tag.className = 'tag tag--28 ' + (selected ? 'tag--brand tag--selected' : 'tag--white tag--normal');
        });
      }

      function filteredItems() {
        var result = dynamics.slice();
        var filters = ctx.state.filters;
        if (filters.content !== 'all') result = result.filter(function(item) { return item.content_type === filters.content; });
        if (filters.publisher !== 'all') result = result.filter(function(item) { return item.publisher_id === filters.publisher; });
        if (filters.category !== 'all') result = result.filter(function(item) { return item.content_type === 'product' && item.category_id === filters.category; });
        if (filters.dimension !== 'all') {
          result = result.filter(function(item) {
            var publisher = getPublisher(item.publisher_id);
            var dimMap = { new: 'new', starred: 'starred', live: 'live' };
            if (filters.dimension === 'collection' || filters.dimension === 'presale') return false;
            return publisher.publisher_statuses.indexOf(dimMap[filters.dimension]) !== -1;
          });
        }
        return result;
      }

      function hasFilters() {
        var filters = ctx.state.filters;
        return filters.content !== 'all' || filters.publisher !== 'all' || filters.category !== 'all' || filters.dimension !== 'all';
      }

      function openDynamic(item) {
        ctx.state.scrollPosition = scroll.scrollTop;
        ctx.appState.dynamicFeedPayload = { dynamic: item, publisher: getPublisher(item.publisher_id), products: item.related_product_ids ? item.related_product_ids.map(getProduct) : [], source_route: 'album-product-feed' };
        ctx.navigate('dynamic-detail');
      }

      function bindCardEvents() {
        grid.querySelectorAll('[data-dynamic-id]').forEach(function(card) {
          var item = dynamics.find(function(dynamic) { return dynamic.dynamic_id === card.dataset.dynamicId; });
          if (!item) return;
          card.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openDynamic(item);
            }
          });
          var forward = card.querySelector('[data-dom-id="forward-' + item.dynamic_id + '"]');
          if (forward) forward.addEventListener('click', function(event) { event.stopPropagation(); ctx.toast('动态已转发'); });
        });
      }

      function render() {
        var items = filteredItems();
        syncPageTabs();
        syncFilterTags();
        if (filterOpenTag) {
          var filterLabel = filterOpenTag.querySelector('.tag__label');
          if (filterLabel) filterLabel.textContent = hasFilters() ? '筛选·已选' : '筛选';
        }
        if (items.length === 0) {
          grid.innerHTML = '';
          emptyHost.hidden = false;
          emptyHost.innerHTML = emptyTemplate();
          var emptyAction = emptyHost.querySelector('[data-dom-id="empty-clear"]');
          if (emptyAction) emptyAction.addEventListener('click', clearFilters);
        } else {
          emptyHost.hidden = true;
          emptyHost.innerHTML = '';
          grid.innerHTML = items.map(feedCardTemplate).join('');
          bindCardEvents();
        }
        updateAllIndicators();
      }

      function clearFilters() {
        ctx.state.filters = { content: 'all', publisher: 'all', category: 'all', dimension: 'all' };
        ctx.state['filter-applied'] = false;
        ctx.state['result-empty'] = false;
        ctx.state['feed-ready'] = true;
        render();
      }

      function switchDimension(value) {
        ctx.state.filters.dimension = value;
        ctx.state['filter-applied'] = value !== 'all';
        if (value === 'all') ctx.state['feed-ready'] = true;
        scroll.scrollTop = 0;
        render();
        ctx.state['result-empty'] = filteredItems().length === 0;
      }

      function openFilterModal() {
        var draft = {
          publisher: ctx.state.filters.publisher,
          category: ctx.state.filters.category
        };
        ctx.openSheet(filterModalTemplate(draft), {
          label: '筛选动态',
          init: function(api) {
            function syncOptions() {
              api.root.querySelectorAll('[data-filter-group]').forEach(function(field) {
                var selected = draft[field.dataset.filterGroup] === field.dataset.filterValue;
                var radio = field.querySelector('.radio');
                field.setAttribute('aria-checked', selected ? 'true' : 'false');
                radio.classList.toggle('radio--checked', selected);
                radio.setAttribute('data-component-binding', selected ? 'feed-filter-radio-checked' : 'feed-filter-radio-unchecked');
              });
            }
            function selectField(field) {
              var group = field.dataset.filterGroup;
              var value = field.dataset.filterValue;
              draft[group] = value;
              syncOptions();
            }
            api.root.querySelectorAll('[data-filter-group]').forEach(function(field) {
              field.addEventListener('click', function() { selectField(field); });
              field.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectField(field); }
              });
            });
            api.root.querySelector('[data-dom-id="filter-close"]').addEventListener('click', api.close);
            api.root.querySelector('[data-dom-id="filter-cancel"]').addEventListener('click', api.close);
            api.root.querySelector('[data-dom-id="filter-apply"]').addEventListener('click', function() {
              ctx.state.filters.publisher = draft.publisher;
              ctx.state.filters.category = draft.category;
              ctx.state['filter-applied'] = hasFilters();
              scroll.scrollTop = 0;
              render();
              ctx.state['result-empty'] = filteredItems().length === 0;
              api.close();
            });
            api.root.addEventListener('click', function(event) { if (event.target === api.root) api.close(); });
            syncOptions();
          }
        });
      }

      /* 工具栏显隐：默认显示，上滑（内容向下）收起、下滑（内容向上）重现，滚到顶部恢复显示
         使用 requestAnimationFrame 与累积方向阈值，避免抖动与误触发 */
      var lastScrollTop = 0;
      var scrollDirectionDelta = 0;
      var toolbarRevealThreshold = 12;
      var toolbarRafId = null;
      var pendingScrollTop = 0;
      var isToolbarRevealed = true;
      function setToolbarRevealed(revealed) {
        if (isToolbarRevealed === revealed) return;
        isToolbarRevealed = revealed;
        if (revealed) {
          floatingToolbar.classList.remove('is-hidden');
          floatingToolbar.setAttribute('aria-hidden', 'false');
        } else {
          floatingToolbar.classList.add('is-hidden');
          floatingToolbar.setAttribute('aria-hidden', 'true');
        }
      }
      function applyToolbarReveal() {
        toolbarRafId = null;
        var currentTop = pendingScrollTop;
        var delta = currentTop - lastScrollTop;
        if (currentTop <= 0) {
          setToolbarRevealed(true);
          scrollDirectionDelta = 0;
        } else {
          scrollDirectionDelta += delta;
          if (scrollDirectionDelta > toolbarRevealThreshold) {
            /* 上滑手势：内容向下滚动，收起工具栏 */
            setToolbarRevealed(false);
            scrollDirectionDelta = 0;
          } else if (scrollDirectionDelta < -toolbarRevealThreshold) {
            /* 下滑手势：内容向上滚动，重现工具栏 */
            setToolbarRevealed(true);
            scrollDirectionDelta = 0;
          }
        }
        lastScrollTop = currentTop;
      }
      function onScroll() {
        ctx.state.scrollPosition = scroll.scrollTop;
        pendingScrollTop = scroll.scrollTop;
        if (!toolbarRafId) toolbarRafId = requestAnimationFrame(applyToolbarReveal);
      }

      root.querySelector('[data-dom-id="open-global-search"]').addEventListener('click', function() { ctx.toast('全局搜索能力本期暂未开放'); });
      root.querySelector('[data-dom-id="open-global-search"]').addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ctx.toast('全局搜索能力本期暂未开放'); }
      });
      root.querySelector('[data-dom-id="open-filter"]').addEventListener('click', openFilterModal);
      root.querySelector('[data-dom-id="feed-open-dynamic"]').addEventListener('click', function(event) {
        if (event.target.closest('button, a')) return;
        var card = event.target.closest('[data-dynamic-id]');
        if (!card) return;
        var item = dynamics.find(function(dynamic) { return dynamic.dynamic_id === card.dataset.dynamicId; });
        if (!item) return;
        ctx.state.scrollPosition = scroll.scrollTop;
        ctx.appState.dynamicFeedPayload = { dynamic: item, publisher: getPublisher(item.publisher_id), products: item.related_product_ids ? item.related_product_ids.map(getProduct) : [], source_route: 'album-product-feed' };
        ctx.navigate('dynamic-detail');
      });

      /* 页面级 Tab：关注默认可用，推荐/上新本期不下钻 */
      root.querySelector('[data-dom-id="page-tab-following"]').addEventListener('click', function() { ctx.state.pageTab = 'following'; ctx.state['feed-ready'] = true; syncPageTabs(); updateAllIndicators(); });
      root.querySelector('[data-dom-id="page-tab-recommended"]').addEventListener('click', function() { ctx.toast('推荐视图本期暂未开放'); });
      root.querySelector('[data-dom-id="page-tab-new"]').addEventListener('click', function() { ctx.toast('上新视图本期暂未开放'); });

      /* 人维度头像：自己入口直接绑定，好友项由 bindPeopleEvents 逐项绑定 */
      root.querySelector('[data-dom-id="people-self"]').addEventListener('click', function() { ctx.toast('个人主页本期暂未开放'); });

      /* 多维度筛选标签：直接绑定 */
      root.querySelector('[data-dom-id="filter-tag-all"]').addEventListener('click', function() { switchDimension('all'); });
      root.querySelector('[data-dom-id="filter-tag-new"]').addEventListener('click', function() { switchDimension('new'); });
      root.querySelector('[data-dom-id="filter-tag-starred"]').addEventListener('click', function() { switchDimension('starred'); });
      root.querySelector('[data-dom-id="filter-tag-collection"]').addEventListener('click', function() { switchDimension('collection'); });
      root.querySelector('[data-dom-id="filter-tag-presale"]').addEventListener('click', function() { switchDimension('presale'); });
      root.querySelector('[data-dom-id="filter-tag-live"]').addEventListener('click', function() { switchDimension('live'); });

      scroll.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', updateAllIndicators);

      /* 页面级 Tab 滚轮联动 */
      var pageTabsScroll = pageTabs.querySelector('.wg-tabs__scroll');
      if (pageTabsScroll) {
        pageTabsScroll.addEventListener('wheel', function(event) {
          if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
          event.preventDefault();
          pageTabsScroll.scrollLeft += event.deltaY;
          updateTabsIndicator(pageTabs.querySelector('.wg-tabs'));
        }, { passive: false });
      }

      renderPeopleList();
      bindPeopleEvents();
      ctx.state['feed-ready'] = true;
      render();
      requestAnimationFrame(function() {
        scroll.scrollTop = ctx.state.scrollPosition;
        lastScrollTop = scroll.scrollTop;
        updateAllIndicators();
      });
    }
  });
})();
