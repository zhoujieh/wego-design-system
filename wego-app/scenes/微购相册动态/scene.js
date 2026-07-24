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
        "selector": ".album-feed__nav-tabs .wg-tabs--standard .wg-tabs__item",
        "content_role": "居中导航标签横向间距",
        "css_property": "padding-inline",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".album-feed__publish-trigger",
        "content_role": "发布入口内边距",
        "css_property": "padding",
        "token": "var(--spacer-0)"
      },
      {
        "selector": ".album-feed__publish-trigger",
        "content_role": "发布入口透明背景",
        "css_property": "background",
        "token": "var(--transparent)"
      },
      {
        "selector": ".album-feed__publish-fab",
        "content_role": "右下角悬浮发布入口背景",
        "css_property": "background",
        "token": "var(--bg-brand)"
      },
      {
        "selector": ".album-feed__publish-fab",
        "content_role": "右下角悬浮发布入口阴影",
        "css_property": "box-shadow",
        "token": "var(--shadow-lg)"
      },
      {
        "selector": ".album-feed__publish-fab",
        "content_role": "右下角悬浮发布入口宽度",
        "css_property": "width",
        "token": "var(--size-56)"
      },
      {
        "selector": ".album-feed__publish-fab",
        "content_role": "右下角悬浮发布入口高度",
        "css_property": "height",
        "token": "var(--size-56)"
      },
      {
        "selector": ".album-feed__publish-fab",
        "content_role": "右下角悬浮发布入口内边距",
        "css_property": "padding",
        "token": "var(--spacer-0)"
      },
      {
        "selector": ".album-feed__publish-fab",
        "content_role": "右下角悬浮发布入口圆角",
        "css_property": "border-radius",
        "token": "var(--radius-full)"
      },
      {
        "selector": ".album-feed__publish-fab",
        "content_role": "右下角悬浮发布入口文字色",
        "css_property": "color",
        "token": "var(--text-inverse)"
      },
      {
        "selector": ".album-feed__publish-fab-ripple",
        "content_role": "右下角悬浮发布入口波纹背景",
        "css_property": "background",
        "token": "var(--bg-brand)"
      },
      {
        "selector": ".album-feed__publish-fab-ripple",
        "content_role": "右下角悬浮发布入口波纹圆角",
        "css_property": "border-radius",
        "token": "var(--radius-full)"
      },
      {
        "selector": ".album-feed__publish-fab-icon",
        "content_role": "悬浮发布入口加号颜色",
        "css_property": "color",
        "token": "var(--text-inverse)"
      },
      {
        "selector": ".album-feed__publish-fab-icon",
        "content_role": "悬浮发布入口加号字号",
        "css_property": "font-size",
        "token": "var(--size-24)"
      },
      {
        "selector": ".album-feed__publish-scrim",
        "content_role": "发布菜单打开时的弱化遮罩",
        "css_property": "background",
        "token": "var(--text-default)"
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
        "selector": ".album-feed__card",
        "content_role": ".album-feed__card 的列内间距",
        "css_property": "margin-block",
        "token": "var(--spacer-8)"
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
        "selector": ".album-feed__new-dot",
        "content_role": "上新绿点边框宽度",
        "css_property": "border-width",
        "token": "var(--stroke-strong)"
      },
      {
        "selector": ".album-feed__new-dot",
        "content_role": "上新绿点外圈与卡片底色一致",
        "css_property": "border-color",
        "token": "var(--bg-surface)"
      },
      {
        "selector": ".album-feed__new-dot",
        "content_role": "上新绿点圆形",
        "css_property": "border-radius",
        "token": "var(--radius-full)"
      },
      {
        "selector": ".album-feed__new-dot",
        "content_role": "上新绿点状态色",
        "css_property": "background",
        "token": "var(--status-success-default)"
      },
      {
        "selector": ".album-feed__verified-icon",
        "content_role": "已认证图标颜色",
        "css_property": "color",
        "token": "var(--text-brand)"
      },
      {
        "selector": ".album-feed__verified-icon",
        "content_role": "已认证图标字号",
        "css_property": "font-size",
        "token": "var(--size-16)"
      },
      {
        "selector": ".album-feed__verified-icon",
        "content_role": "已认证图标行高",
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
        "reason": "下滑手势浮现的工具栏使用 search 组件的标准强调搜索结构，作为全局搜索入口；图搜复用正式小号主按钮，不添加场景私有皮肤",
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
        "binding_id": "feed-search-image",
        "slug": "button",
        "reason": "强调搜索框内的图搜入口复用 Search Preview 规定的小号主按钮",
        "variant_dimensions": {
          "emphasis": "strong",
          "size": "sm",
          "iconMode": "text-only",
          "state": "default"
        }
      },
      {
        "binding_id": "feed-publish-popmenu",
        "slug": "popmenu",
        "reason": "导航栏右侧发布入口展开紧凑快捷菜单",
        "variant_dimensions": {
          "mode": "action",
          "icon": "left",
          "placement": "bottom",
          "align": "end",
          "state": "open"
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
      "selection_reason": "页面首要任务是发现并进入动态详情；顶部 page-tabs 与搜索栏共同吸顶，搜索栏使用 Search 组件 Preview 的标准强调结构（白底、品牌描边、右侧正式小号主按钮），场景包装层只承担收起动画。人维度栏支持横滑且「我的商家」与筛选入口固定在右侧，并用渐变蒙层隔开滚动内容；瀑布流在手机壳和窄容器中固定双列，在场景自身可用宽度增大后按 168px 目标列宽自动增列并居中，避免根据桌面窗口宽度误把手机壳拉成单列。卡片信息紧凑，发布时间下沉到操作栏左侧，与一键转发形成稳定底部信息带；发布操作保留右上角入口，同时新增右下角拇指区悬浮入口，复用同一组 popmenu 动作并从触发点向上浮出，降低单手操作距离；场景根由 host-shell-page__panel 约束，并预留底部导航安全区。",
      "page_edge_mode": "M8",
      "mutable_regions": [
        ".album-feed__floating-toolbar",
        ".album-feed__grid",
        ".album-feed__card-content",
        ".album-feed__empty",
        ".album-feed__publish-fab"
      ]
    },
    "interaction_contract": [
      {
        "dom_id": "open-publish-menu",
        "target": "state:publish-menu-open"
      },
      {
        "dom_id": "open-publish-menu-floating",
        "target": "state:publish-menu-open"
      },
      {
        "dom_id": "publish-scrim",
        "target": "state:publish-menu-open"
      },
      {
        "dom_id": "publish-action-product",
        "target": "feedback:toast"
      },
      {
        "dom_id": "publish-action-note",
        "target": "feedback:toast"
      },
      {
        "dom_id": "publish-action-live",
        "target": "feedback:toast"
      },
      {
        "dom_id": "publish-action-import",
        "target": "feedback:toast"
      },
      {
        "dom_id": "publish-action-scan",
        "target": "feedback:toast"
      },
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
        "visible_result": "页面级 tabs 与标准强调搜索工具栏共同吸顶顶部，搜索栏默认显示占据文档流，首屏显示双列瀑布流与人维度栏",
        "fallback": "保留可浏览的本地动态",
        "persistence": "memory"
      },
      {
        "state_id": "publish-menu-open",
        "initial": false,
        "trigger": "点击导航栏右侧发布入口或右下角悬浮发布入口",
        "visible_result": "右上角入口保持原有加号旋转；右下角悬浮入口在拇指区展开同一组发布操作，菜单从入口位置向上错层浮出并轻微弱化背景",
        "fallback": "点击页面其他位置、滚动或选择菜单项后关闭菜单并恢复发布入口默认状态",
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
        "trigger": "动态页自身可用宽度增至 480px",
        "visible_result": "瀑布流按实际容器宽度自动增列并居中，手机壳中的双列不受桌面窗口宽度影响",
        "fallback": "手机壳和窄容器保持双列",
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
    "checked_at": "2026-07-23T16:22:09.000Z",
    "scope": "顶部 page-tabs 居中且左右预留对称栏位，右上角发布入口保持原有 popmenu；右下角新增悬浮发布入口，点击后同一组发布操作在按钮上方错层浮出并显示弱化遮罩。375/393px 验证菜单在视口内、不与按钮重叠、无横向溢出，点击发笔记后菜单关闭并出现未开放 toast。",
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
  var db = window.WEGO_PROTOTYPE_DB || {};
  var publishers = db.publishers || [];
  var products = db.products || [];
  var dynamics = db.dynamics || [];
  var currentUser = db.currentUser || (db.users || []).find(function(item) { return item.is_self; }) || { merchant_name: '微购优选商行', avatar: './lib/assets/image/avatar/avatar_083.jpg' };

  window.WEGO_DYNAMIC_CATALOG = { publishers: publishers, products: products, dynamics: dynamics, currentUser: currentUser, source: 'WEGO_PROTOTYPE_DB' };

  function escapeHtml(value) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value == null ? '' : value).split('').map(function(char) { return map[char] || char; }).join('');
  }

  function getPublisher(id) {
    return publishers.find(function(item) { return item.publisher_id === id; }) || publishers[0] || { publisher_id: 'fallback-publisher', publisher_name: '微购商家', publisher_avatar: './lib/assets/image/avatar-defult.png', publisher_type: 'shop', publisher_statuses: [] };
  }

  function getProduct(id) {
    return products.find(function(item) { return item.product_id === id; }) || products[0];
  }

  function hasPublisherStatus(publisher, status) {
    return publisher.publisher_statuses.indexOf(status) !== -1;
  }

  function publisherVerifiedTemplate(publisher) {
    if (!hasPublisherStatus(publisher, 'verified')) return '';
    return '<i class="wego-iconfont-s icon-renzheng album-feed__verified-icon" aria-label="已认证"></i>';
  }

  function publisherNewDotTemplate(publisher) {
    if (!hasPublisherStatus(publisher, 'new')) return '';
    return '<span class="album-feed__new-dot" aria-label="上新"></span>';
  }

  function publishMenuTemplate() {
    return '<div class="popmenu popmenu--action popmenu--has-icon album-feed__publish-menu" role="menu" data-state="closed" data-placement="bottom" data-align="end" data-dd-id="feed-publish-popmenu" data-component-slug="popmenu" data-component-binding="feed-publish-popmenu">'
      + '<div class="popmenu__list">'
      + '<div class="popmenu__item" role="menuitem" data-dom-id="publish-action-product"><i class="wego-iconfont-s icon-fabushangpin popmenu__item-icon"></i><span class="popmenu__item-text">发产品</span></div>'
      + '<div class="popmenu__item" role="menuitem" data-dom-id="publish-action-note"><i class="wego-iconfont-s icon-fabubiji popmenu__item-icon"></i><span class="popmenu__item-text">发笔记</span></div>'
      + '<div class="popmenu__item" role="menuitem" data-dom-id="publish-action-live"><i class="wego-iconfont-s icon-zhibo popmenu__item-icon"></i><span class="popmenu__item-text">开直播</span></div>'
      + '<div class="popmenu__item" role="menuitem" data-dom-id="publish-action-import"><i class="wego-iconfont-s icon-piliangdaoru popmenu__item-icon"></i><span class="popmenu__item-text">批量导入</span></div>'
      + '<div class="popmenu__item" role="menuitem" data-dom-id="publish-action-scan"><i class="wego-iconfont-s icon-saoyisao popmenu__item-icon"></i><span class="popmenu__item-text">扫一扫</span></div>'
      + '</div>'
      + '</div>';
  }

  function feedCardTemplate(item) {
    var publisher = getPublisher(item.publisher_id);
    var cover = item.media_list[0];
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
      +           publisherNewDotTemplate(publisher)
      +         '</div>'
      +         '<span class="album-feed__publisher-name">' + escapeHtml(publisher.publisher_name) + '</span>'
      +         publisherVerifiedTemplate(publisher)
      +       '</div>'
      +       '<p class="album-feed__summary">' + escapeHtml(item.text_content) + '</p>'
      +     '</div>'
      +     '<div class="card__footer album-feed__card-footer">'
      +       '<div class="album-feed__actions">'
      +         '<span class="album-feed__publisher-meta">' + escapeHtml(item.published_at) + '</span>'
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
      return [publisher.publisher_id, '商家 · ' + publisher.publisher_name];
    }));
    var categoryOptions = [['all', '全部分类'], ['clothing', '服装'], ['shoes', '鞋子'], ['bags', '包袋']];
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
          <div class="album-feed__nav-row">
            <div class="album-feed__nav-left" aria-hidden="true"></div>
            <div class="album-feed__nav-tabs">
              <div class="wg-tabs wg-tabs--standard wg-tabs--scroll" role="tablist" data-dd-id="feed-page-tabs" data-component-slug="tabs" data-component-binding="feed-page-tabs">
                <div class="wg-tabs__scroll">
                  <button class="wg-tabs__item" role="tab" aria-selected="true" type="button" data-page-tab="following" data-dom-id="page-tab-following"><span class="wg-tabs__content"><span class="wg-tabs__label">关注</span></span></button>
                  <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-page-tab="recommended" data-dom-id="page-tab-recommended"><span class="wg-tabs__content"><span class="wg-tabs__label">推荐</span></span></button>
                  <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-page-tab="new" data-dom-id="page-tab-new"><span class="wg-tabs__content"><span class="wg-tabs__label">上新</span></span></button>
                  <span class="wg-tabs__active-indicator" aria-hidden="true"></span>
                </div>
              </div>
            </div>
            <div class="album-feed__nav-right">
              <button type="button" class="album-feed__publish-trigger" aria-label="发布动态" aria-haspopup="menu" aria-expanded="false" data-dom-id="open-publish-menu">
                <span class="album-feed__publish-trigger-bg" aria-hidden="true"><img src="./lib/assets/icons/dongtai-add-bg.svg" alt=""></span>
                <span class="album-feed__publish-trigger-plus" aria-hidden="true"><img src="./lib/assets/icons/dongtai-add-plus.svg" alt=""></span>
              </button>
            </div>
          </div>
        </div>
        <div class="album-feed__floating-toolbar" data-toolbar-floating aria-hidden="false">
          <div class="album-feed__toolbar-motion">
            <div class="search-toolbar">
              <div class="searchbox searchbox--md searchbox--white searchbox--accent" role="button" tabindex="0" aria-label="打开全局搜索" data-dom-id="open-global-search" data-dd-id="feed-search-toolbar" data-component-slug="search" data-component-binding="feed-search-toolbar">
                <span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>
                <div class="searchbox__input"><span class="searchbox__placeholder">搜索全局内容</span></div>
                <div class="searchbox__actions"><button class="btn btn--strong btn--sm" type="button" aria-label="图搜" data-dd-id="feed-search-image" data-component-slug="button" data-component-binding="feed-search-image">图搜</button></div>
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
              <img class="album-feed__sticky-fade album-feed__sticky-fade--people" src="./lib/assets/icons/sticky-fade-16.svg" alt="" aria-hidden="true">
              <div class="album-feed__people-item">
                <div class="avatar avatar--40 avatar--image album-feed__people-avatar" data-dd-id="feed-people-avatar-self" data-component-slug="avatar" data-component-binding="feed-people-avatar-self"><img src="./lib/assets/image/avatar/avatar_083.jpg" alt="我的商家"></div>
                <span class="album-feed__people-name">我的商家</span>
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
          <div class="album-feed__filter-open-host">
            <img class="album-feed__sticky-fade album-feed__sticky-fade--filter" src="./lib/assets/icons/sticky-fade-16.svg" alt="" aria-hidden="true">
            <button type="button" class="tag tag--28 tag--white tag--normal album-feed__filter-open" data-dom-id="open-filter" data-dd-id="feed-filter-open" data-component-slug="tag" data-component-binding="feed-filter-open-tag"><span class="tag__label">筛选</span></button>
          </div>
        </div>
        <main class="album-feed__grid" data-region="feed-grid" data-dom-id="feed-open-dynamic"></main>
        <div data-region="empty-host" hidden></div>
        <div class="album-feed__publish-scrim" data-dom-id="publish-scrim" aria-hidden="true"></div>
        <button type="button" class="album-feed__publish-fab" aria-label="发布动态" aria-haspopup="menu" aria-expanded="false" data-dom-id="open-publish-menu-floating">
          <span class="album-feed__publish-fab-ripple" aria-hidden="true"></span>
          <i class="wego-iconfont-s icon-jia album-feed__publish-fab-icon" aria-hidden="true"></i>
        </button>
        <div class="album-feed__contract-seed" hidden aria-hidden="true">
          <div class="navbar" data-dd-id="feed-filter-navbar-seed" data-component-slug="navbar" data-component-binding="feed-filter-navbar"><div class="navbar__body"><div class="navbar__left"><button type="button" class="navbar__left-btn navbar__left-btn--circle" aria-label="关闭"><i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i></button></div><div class="navbar__center"><span class="navbar__title">筛选动态</span></div><div class="navbar__right"></div></div></div>
          <div class="radio radio--sm radio--checked" data-group="feed-seed-checked" data-dd-id="feed-radio-checked-seed" data-component-slug="radio" data-component-binding="feed-filter-radio-checked"><div class="radio__inner"></div><div class="radio__dot"></div></div>
          <div class="radio radio--sm" data-group="feed-seed-unchecked" data-dd-id="feed-radio-unchecked-seed" data-component-slug="radio" data-component-binding="feed-filter-radio-unchecked"><div class="radio__inner"></div><div class="radio__dot"></div></div>
          <button type="button" class="link link--12" data-dd-id="feed-forward-link-seed" data-component-slug="link" data-component-binding="feed-forward-link">一键转发</button>
          <div class="popmenu popmenu--action popmenu--has-icon" role="menu" data-state="open" data-placement="bottom" data-align="end" data-dd-id="feed-publish-popmenu-seed" data-component-slug="popmenu" data-component-binding="feed-publish-popmenu">
            <div class="popmenu__list">
              <div class="popmenu__item" role="menuitem" data-dom-id="publish-action-product"><i class="wego-iconfont-s icon-fabushangpin popmenu__item-icon"></i><span class="popmenu__item-text">发产品</span></div>
              <div class="popmenu__item" role="menuitem" data-dom-id="publish-action-note"><i class="wego-iconfont-s icon-fabubiji popmenu__item-icon"></i><span class="popmenu__item-text">发笔记</span></div>
              <div class="popmenu__item" role="menuitem" data-dom-id="publish-action-live"><i class="wego-iconfont-s icon-zhibo popmenu__item-icon"></i><span class="popmenu__item-text">开直播</span></div>
              <div class="popmenu__item" role="menuitem" data-dom-id="publish-action-import"><i class="wego-iconfont-s icon-piliangdaoru popmenu__item-icon"></i><span class="popmenu__item-text">批量导入</span></div>
              <div class="popmenu__item" role="menuitem" data-dom-id="publish-action-scan"><i class="wego-iconfont-s icon-saoyisao popmenu__item-icon"></i><span class="popmenu__item-text">扫一扫</span></div>
            </div>
          </div>
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
      var publishTrigger = root.querySelector('[data-dom-id="open-publish-menu"]');
      var floatingPublishTrigger = root.querySelector('[data-dom-id="open-publish-menu-floating"]');
      var publishScrim = root.querySelector('[data-dom-id="publish-scrim"]');
      var activePublishTrigger = publishTrigger;
      var publishMenu = null;
      var removePublishListeners = null;

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

      function closePublishMenu() {
        if (publishMenu) {
          publishMenu.setAttribute('data-state', 'closed');
          publishMenu.remove();
          publishMenu = null;
        }
        if (publishTrigger) {
          publishTrigger.classList.remove('is-open');
          publishTrigger.setAttribute('aria-expanded', 'false');
        }
        if (floatingPublishTrigger) {
          floatingPublishTrigger.classList.remove('is-open');
          floatingPublishTrigger.setAttribute('aria-expanded', 'false');
        }
        if (publishScrim) publishScrim.classList.remove('is-visible');
        ctx.state['publish-menu-open'] = false;
        if (removePublishListeners) {
          removePublishListeners();
          removePublishListeners = null;
        }
      }

      function positionPublishMenu() {
        var trigger = activePublishTrigger || publishTrigger;
        if (!publishMenu || !trigger) return false;
        var isFloating = trigger === floatingPublishTrigger;
        var triggerRect = trigger.getBoundingClientRect();
        publishMenu.style.left = '-9999px';
        publishMenu.style.top = '-9999px';
        publishMenu.setAttribute('data-state', 'closed');
        publishMenu.classList.toggle('album-feed__publish-menu--floating', isFloating);
        publishMenu.setAttribute('data-placement', isFloating ? 'top' : 'bottom');
        publishMenu.setAttribute('data-align', 'end');
        var menuWidth = publishMenu.offsetWidth;
        var menuHeight = publishMenu.offsetHeight;
        var gap = isFloating ? 16 : 4;
        var sideGap = 4;
        var left = triggerRect.right - menuWidth;
        var top = isFloating ? triggerRect.top - gap - menuHeight : triggerRect.bottom + gap;
        if (left < sideGap) left = sideGap;
        if (left + menuWidth > window.innerWidth - sideGap) left = Math.max(sideGap, window.innerWidth - sideGap - menuWidth);
        if (!isFloating && top + menuHeight > window.innerHeight - sideGap) top = triggerRect.top - gap - menuHeight;
        if (isFloating && top < sideGap) top = triggerRect.bottom + gap;
        if (top < sideGap || top + menuHeight > window.innerHeight - sideGap) return false;
        publishMenu.style.left = left + 'px';
        publishMenu.style.top = top + 'px';
        requestAnimationFrame(function() {
          if (publishMenu) publishMenu.setAttribute('data-state', 'open');
        });
        return true;
      }

      function openPublishMenu() {
        closePublishMenu();
        if (!activePublishTrigger) return;
        publishMenu = document.createElement('div');
        publishMenu.innerHTML = publishMenuTemplate();
        publishMenu = publishMenu.firstElementChild;
        document.body.appendChild(publishMenu);
        if (!positionPublishMenu()) {
          closePublishMenu();
          ctx.toast('发布菜单空间不足');
          return;
        }
        activePublishTrigger.classList.add('is-open');
        activePublishTrigger.setAttribute('aria-expanded', 'true');
        if (publishScrim && activePublishTrigger === floatingPublishTrigger) publishScrim.classList.add('is-visible');
        ctx.state['publish-menu-open'] = true;
        publishMenu.querySelector('[data-dom-id="publish-action-product"]').addEventListener('click', function(event) { event.stopPropagation(); closePublishMenu(); ctx.toast('发产品能力本期暂未开放'); });
        publishMenu.querySelector('[data-dom-id="publish-action-note"]').addEventListener('click', function(event) { event.stopPropagation(); closePublishMenu(); ctx.toast('发笔记能力本期暂未开放'); });
        publishMenu.querySelector('[data-dom-id="publish-action-live"]').addEventListener('click', function(event) { event.stopPropagation(); closePublishMenu(); ctx.toast('开直播能力本期暂未开放'); });
        publishMenu.querySelector('[data-dom-id="publish-action-import"]').addEventListener('click', function(event) { event.stopPropagation(); closePublishMenu(); ctx.toast('批量导入能力本期暂未开放'); });
        publishMenu.querySelector('[data-dom-id="publish-action-scan"]').addEventListener('click', function(event) { event.stopPropagation(); closePublishMenu(); ctx.toast('扫一扫能力本期暂未开放'); });
        var onOutsidePointer = function(event) {
          if ((publishTrigger && publishTrigger.contains(event.target)) || (floatingPublishTrigger && floatingPublishTrigger.contains(event.target)) || (publishMenu && publishMenu.contains(event.target))) return;
          closePublishMenu();
        };
        var onDismiss = function() { closePublishMenu(); };
        document.addEventListener('pointerdown', onOutsidePointer, true);
        window.addEventListener('resize', onDismiss);
        scroll.addEventListener('scroll', onDismiss, { once: true });
        removePublishListeners = function() {
          document.removeEventListener('pointerdown', onOutsidePointer, true);
          window.removeEventListener('resize', onDismiss);
          scroll.removeEventListener('scroll', onDismiss);
        };
      }

      function togglePublishMenu(event) {
        event.stopPropagation();
        var requestedTrigger = event.currentTarget;
        if (publishMenu && activePublishTrigger === requestedTrigger) {
          closePublishMenu();
          return;
        }
        activePublishTrigger = requestedTrigger;
        openPublishMenu();
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

      function renderCurrentMerchant() {
        var selfRoot = root.querySelector('[data-dom-id="people-self"]');
        if (!selfRoot) return;
        var selfImg = selfRoot.querySelector('.album-feed__people-avatar img');
        var selfName = selfRoot.querySelector('.album-feed__people-name');
        var merchantName = currentUser.merchant_name || currentUser.display_name || '我的商家';
        if (selfImg) {
          selfImg.src = currentUser.avatar || './lib/assets/image/avatar/avatar_083.jpg';
          selfImg.alt = merchantName;
        }
        if (selfName) selfName.textContent = merchantName;
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
        closePublishMenu();
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
         使用 requestAnimationFrame 与累积方向阈值，避免抖动与误触发；
         顶部边界强制显示，底部边界抑制下滑手势重现，避免橡皮筋回弹误触发 */
      var lastScrollTop = 0;
      var scrollDirectionDelta = 0;
      var toolbarRevealThreshold = 12;
      var toolbarBottomGuardPx = 8;
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
        var isAtTop = currentTop <= 0;
        var isAtBottom = currentTop + scroll.clientHeight >= scroll.scrollHeight - toolbarBottomGuardPx;
        if (isAtTop) {
          setToolbarRevealed(true);
          scrollDirectionDelta = 0;
        } else if (isAtBottom) {
          /* 底部边界：抑制下滑手势（delta < 0）重现搜索框，避免橡皮筋回弹误触发；
             保留上滑手势收起逻辑以维持状态一致，用户脱离底部后恢复正常响应 */
          if (delta > 0) {
            scrollDirectionDelta += delta;
            if (scrollDirectionDelta > toolbarRevealThreshold) {
              setToolbarRevealed(false);
              scrollDirectionDelta = 0;
            }
          } else {
            scrollDirectionDelta = 0;
          }
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
      if (publishTrigger) publishTrigger.addEventListener('click', togglePublishMenu);
      if (floatingPublishTrigger) floatingPublishTrigger.addEventListener('click', togglePublishMenu);
      if (publishScrim) publishScrim.addEventListener('click', closePublishMenu);
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
      root.querySelector('[data-dom-id="page-tab-following"]').addEventListener('click', function() { closePublishMenu(); ctx.state.pageTab = 'following'; ctx.state['feed-ready'] = true; syncPageTabs(); updateAllIndicators(); });
      root.querySelector('[data-dom-id="page-tab-recommended"]').addEventListener('click', function() { closePublishMenu(); ctx.toast('推荐视图本期暂未开放'); });
      root.querySelector('[data-dom-id="page-tab-new"]').addEventListener('click', function() { closePublishMenu(); ctx.toast('上新视图本期暂未开放'); });

      /* 人维度头像：自己入口直接绑定，好友项由 bindPeopleEvents 逐项绑定 */
      root.querySelector('[data-dom-id="people-self"]').addEventListener('click', function() { closePublishMenu(); ctx.toast('商家主页本期暂未开放'); });

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
      renderCurrentMerchant();
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
