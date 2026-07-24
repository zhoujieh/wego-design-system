/* wego-design-contract:
{
  "surface_id": "dynamic-detail",
  "route_id": "dynamic-detail",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "push",
    "transition": "slide-left-enter, slide-right-exit",
    "dismissAction": "back-button",
    "overlayLevel": "inline",
    "coversTabBar": true,
    "source": "library-consumption.json#/appRuntime/presentationTypes"
  },
  "prompt_contract": {
    "design_system_version": 451,
    "token_bindings": [
      {
        "selector": ".dynamic-detail",
        "content_role": ".dynamic-detail 的 padding-inline",
        "css_property": "padding-inline",
        "token": "var(--layout-page-margin-m0)"
      },
      {
        "selector": ".dynamic-detail",
        "content_role": ".dynamic-detail 的 background",
        "css_property": "background",
        "token": "var(--bg-page)"
      },
      {
        "selector": ".dynamic-detail",
        "content_role": ".dynamic-detail 的 color",
        "css_property": "color",
        "token": "var(--text-default)"
      },
      {
        "selector": ".dynamic-detail",
        "content_role": ".dynamic-detail 的 font-family",
        "css_property": "font-family",
        "token": "var(--body-md-font-family)"
      },
      {
        "selector": ".dynamic-detail__content",
        "content_role": ".dynamic-detail__content 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-16)"
      },
      {
        "selector": ".dynamic-detail__content",
        "content_role": ".dynamic-detail__content 的 padding",
        "css_property": "padding",
        "token": "var(--spacer-16)"
      },
      {
        "selector": ".dynamic-detail__publisher",
        "content_role": ".dynamic-detail__publisher 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".dynamic-detail__tags",
        "content_role": ".dynamic-detail__tags 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".dynamic-detail__product-content",
        "content_role": ".dynamic-detail__product-content 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".dynamic-detail__publisher-copy",
        "content_role": ".dynamic-detail__publisher-copy 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-2)"
      },
      {
        "selector": ".dynamic-detail__publisher-name",
        "content_role": ".dynamic-detail__publisher-name 的 color",
        "css_property": "color",
        "token": "var(--text-default)"
      },
      {
        "selector": ".dynamic-detail__publisher-name",
        "content_role": ".dynamic-detail__publisher-name 的 font-size",
        "css_property": "font-size",
        "token": "var(--heading-xs-font-size)"
      },
      {
        "selector": ".dynamic-detail__publisher-name",
        "content_role": ".dynamic-detail__publisher-name 的 font-weight",
        "css_property": "font-weight",
        "token": "var(--heading-xs-font-weight)"
      },
      {
        "selector": ".dynamic-detail__publisher-name",
        "content_role": ".dynamic-detail__publisher-name 的 line-height",
        "css_property": "line-height",
        "token": "var(--heading-xs-line-height)"
      },
      {
        "selector": ".dynamic-detail__section-title",
        "content_role": ".dynamic-detail__section-title 的 color",
        "css_property": "color",
        "token": "var(--text-default)"
      },
      {
        "selector": ".dynamic-detail__section-title",
        "content_role": ".dynamic-detail__section-title 的 font-size",
        "css_property": "font-size",
        "token": "var(--heading-xs-font-size)"
      },
      {
        "selector": ".dynamic-detail__section-title",
        "content_role": ".dynamic-detail__section-title 的 font-weight",
        "css_property": "font-weight",
        "token": "var(--heading-xs-font-weight)"
      },
      {
        "selector": ".dynamic-detail__section-title",
        "content_role": ".dynamic-detail__section-title 的 line-height",
        "css_property": "line-height",
        "token": "var(--heading-xs-line-height)"
      },
      {
        "selector": ".dynamic-detail__product-name",
        "content_role": ".dynamic-detail__product-name 的 color",
        "css_property": "color",
        "token": "var(--text-default)"
      },
      {
        "selector": ".dynamic-detail__product-name",
        "content_role": ".dynamic-detail__product-name 的 font-size",
        "css_property": "font-size",
        "token": "var(--heading-xs-font-size)"
      },
      {
        "selector": ".dynamic-detail__product-name",
        "content_role": ".dynamic-detail__product-name 的 font-weight",
        "css_property": "font-weight",
        "token": "var(--heading-xs-font-weight)"
      },
      {
        "selector": ".dynamic-detail__product-name",
        "content_role": ".dynamic-detail__product-name 的 line-height",
        "css_property": "line-height",
        "token": "var(--heading-xs-line-height)"
      },
      {
        "selector": ".dynamic-detail__meta",
        "content_role": ".dynamic-detail__meta 的 color",
        "css_property": "color",
        "token": "var(--text-tertiary)"
      },
      {
        "selector": ".dynamic-detail__meta",
        "content_role": ".dynamic-detail__meta 的 font-size",
        "css_property": "font-size",
        "token": "var(--body-sm-font-size)"
      },
      {
        "selector": ".dynamic-detail__meta",
        "content_role": ".dynamic-detail__meta 的 line-height",
        "css_property": "line-height",
        "token": "var(--body-sm-line-height)"
      },
      {
        "selector": ".dynamic-detail__text",
        "content_role": ".dynamic-detail__text 的 color",
        "css_property": "color",
        "token": "var(--text-default)"
      },
      {
        "selector": ".dynamic-detail__text",
        "content_role": ".dynamic-detail__text 的 font-size",
        "css_property": "font-size",
        "token": "var(--body-lg-font-size)"
      },
      {
        "selector": ".dynamic-detail__text",
        "content_role": ".dynamic-detail__text 的 line-height",
        "css_property": "line-height",
        "token": "var(--body-lg-line-height)"
      },
      {
        "selector": ".dynamic-detail__media-list",
        "content_role": ".dynamic-detail__media-list 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-12)"
      },
      {
        "selector": ".dynamic-detail__media-item",
        "content_role": ".dynamic-detail__media-item 的 border-radius",
        "css_property": "border-radius",
        "token": "var(--radius-8)"
      },
      {
        "selector": ".dynamic-detail__video-state",
        "content_role": ".dynamic-detail__video-state 的 right",
        "css_property": "right",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".dynamic-detail__video-state",
        "content_role": ".dynamic-detail__video-state 的 bottom",
        "css_property": "bottom",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".dynamic-detail__video-state",
        "content_role": "视频状态纵向内边距",
        "css_property": "padding-block",
        "token": "var(--spacer-4)"
      },
      {
        "selector": ".dynamic-detail__video-state",
        "content_role": "视频状态横向内边距",
        "css_property": "padding-inline",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".dynamic-detail__video-state",
        "content_role": ".dynamic-detail__video-state 的 border-radius",
        "css_property": "border-radius",
        "token": "var(--radius-4)"
      },
      {
        "selector": ".dynamic-detail__video-state",
        "content_role": ".dynamic-detail__video-state 的 background",
        "css_property": "background",
        "token": "var(--bg-mask-press)"
      },
      {
        "selector": ".dynamic-detail__video-state",
        "content_role": ".dynamic-detail__video-state 的 color",
        "css_property": "color",
        "token": "var(--text-inverse)"
      },
      {
        "selector": ".dynamic-detail__video-state",
        "content_role": ".dynamic-detail__video-state 的 font-size",
        "css_property": "font-size",
        "token": "var(--body-sm-font-size)"
      },
      {
        "selector": ".dynamic-detail__video-state",
        "content_role": ".dynamic-detail__video-state 的 line-height",
        "css_property": "line-height",
        "token": "var(--body-sm-line-height)"
      },
      {
        "selector": ".dynamic-detail__product-host",
        "content_role": ".dynamic-detail__product-host 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".dynamic-detail__product-content",
        "content_role": ".dynamic-detail__product-content 的 padding",
        "css_property": "padding",
        "token": "var(--spacer-12)"
      },
      {
        "selector": ".dynamic-detail__product-copy",
        "content_role": ".dynamic-detail__product-copy 的 gap",
        "css_property": "gap",
        "token": "var(--spacer-4)"
      },
      {
        "selector": ".dynamic-detail__product-point",
        "content_role": ".dynamic-detail__product-point 的 color",
        "css_property": "color",
        "token": "var(--text-secondary)"
      },
      {
        "selector": ".dynamic-detail__product-point",
        "content_role": ".dynamic-detail__product-point 的 font-size",
        "css_property": "font-size",
        "token": "var(--body-sm-font-size)"
      },
      {
        "selector": ".dynamic-detail__product-point",
        "content_role": ".dynamic-detail__product-point 的 line-height",
        "css_property": "line-height",
        "token": "var(--body-sm-line-height)"
      },
      {
        "selector": ".dynamic-detail__product-price",
        "content_role": ".dynamic-detail__product-price 的 color",
        "css_property": "color",
        "token": "var(--text-promotion)"
      },
      {
        "selector": ".dynamic-detail__product-price",
        "content_role": ".dynamic-detail__product-price 的 font-family",
        "css_property": "font-family",
        "token": "var(--heading-xs-font-family)"
      },
      {
        "selector": ".dynamic-detail__product-price",
        "content_role": ".dynamic-detail__product-price 的 font-size",
        "css_property": "font-size",
        "token": "var(--heading-xs-font-size)"
      },
      {
        "selector": ".dynamic-detail__product-price",
        "content_role": ".dynamic-detail__product-price 的 font-weight",
        "css_property": "font-weight",
        "token": "var(--heading-xs-font-weight)"
      },
      {
        "selector": ".dynamic-detail__product-price",
        "content_role": ".dynamic-detail__product-price 的 line-height",
        "css_property": "line-height",
        "token": "var(--heading-xs-line-height)"
      },
      {
        "selector": ".dynamic-detail__select-cart.is-added .bottom-action-bar__action-icon",
        "content_role": ".dynamic-detail__select-cart.is-added .bottom-action-bar__action-icon 的 color",
        "css_property": "color",
        "token": "var(--text-brand)"
      },
      {
        "selector": ".dynamic-detail__select-cart.is-added .bottom-action-bar__action-label",
        "content_role": ".dynamic-detail__select-cart.is-added .bottom-action-bar__action-label 的 color",
        "css_property": "color",
        "token": "var(--text-brand)"
      }
    ],
    "component_bindings": [
      {
        "binding_id": "dynamic-detail-navbar",
        "slug": "navbar",
        "reason": "普通二级动态详情使用返回箭头和居中标题",
        "variant_dimensions": {
          "leftControl": "back-icon",
          "titleAlignment": "center",
          "actions": "none",
          "spacing": "default",
          "pageTransition": "push",
          "position": "sticky"
        }
      },
      {
        "binding_id": "dynamic-detail-avatar",
        "slug": "avatar",
        "reason": "展示发布者身份",
        "variant_dimensions": {
          "type": "image",
          "size": "40"
        }
      },
      {
        "binding_id": "dynamic-detail-tag",
        "slug": "tag",
        "reason": "展示内容类型和发布者全部状态",
        "variant_dimensions": {
          "size": "20",
          "theme": "gray",
          "state": "normal",
          "affordance": "display-only"
        }
      },
      {
        "binding_id": "dynamic-detail-media",
        "slug": "image",
        "reason": "完整展示动态图片或视频封面",
        "variant_dimensions": {
          "fit": "cover",
          "size": "custom-wide",
          "radius": "rounded-md",
          "state": "loaded",
          "interaction": "static"
        }
      },
      {
        "binding_id": "dynamic-detail-product-card",
        "slug": "card",
        "reason": "产品动态展示可进入商品详情的关联商品模块",
        "variant_dimensions": {
          "base": "auto",
          "surface": "outlined"
        }
      },
      {
        "binding_id": "dynamic-detail-product-image",
        "slug": "image",
        "reason": "关联商品识别图",
        "variant_dimensions": {
          "fit": "cover",
          "size": "xl",
          "radius": "rounded-md",
          "state": "loaded",
          "interaction": "static"
        }
      },
      {
        "binding_id": "dynamic-detail-actions",
        "slug": "bottom-action-bar",
        "reason": "固定承载弱化下载、分享、收藏、复制文案、编辑、复制动态、查看大图等左侧操作，溢出项收进更多入口，右侧为一键转发",
        "variant_dimensions": {
          "type": "primary-secondary-actions",
          "iconMode": "icon-text",
          "state": "default",
          "overflow": "collapsed-more"
        }
      },
      {
        "binding_id": "dynamic-detail-forward",
        "slug": "button",
        "reason": "动态详情唯一强调操作",
        "variant_dimensions": {
          "emphasis": "strong",
          "size": "md",
          "iconMode": "text-only",
          "state": "default"
        }
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "详情是普通 Push 二级页；采用 M0 让导航栏和底部操作栏通栏，正文在内部使用内容留白，首要任务是阅读完整动态。",
      "page_edge_mode": "M0",
      "mutable_regions": [
        ".dynamic-detail__content",
        ".dynamic-detail__media-list",
        ".dynamic-detail__product-host"
      ]
    },
    "interaction_contract": [
      {
        "dom_id": "dynamic-detail-back",
        "target": "navigation:back"
      },
      {
        "dom_id": "open-related-product",
        "target": "route:product-detail"
      },
      {
        "dom_id": "dynamic-detail-download",
        "target": "feedback:toast"
      },
      {
        "dom_id": "dynamic-detail-share",
        "target": "feedback:toast"
      },
      {
        "dom_id": "dynamic-detail-favorite",
        "target": "feedback:toast"
      },
      {
        "dom_id": "dynamic-detail-copy-text",
        "target": "feedback:toast"
      },
      {
        "dom_id": "dynamic-detail-edit",
        "target": "feedback:toast"
      },
      {
        "dom_id": "dynamic-detail-copy-dynamic",
        "target": "feedback:toast"
      },
      {
        "dom_id": "dynamic-detail-view-image",
        "target": "feedback:toast"
      },
      {
        "dom_id": "dynamic-detail-forward",
        "target": "feedback:toast"
      },
      {
        "dom_id": "dynamic-detail-select-cart",
        "target": "state:selection-item-added"
      }
    ],
    "state_contract": [
      {
        "state_id": "dynamic-detail-ready",
        "initial": true,
        "trigger": "从动态首页进入",
        "visible_result": "展示发布者、时间、全文、全部图片或视频及产品动态的关联商品",
        "fallback": "使用本地示例动态",
        "persistence": "memory"
      },
      {
        "state_id": "video-playing",
        "initial": false,
        "trigger": "点击视频媒体",
        "visible_result": "当前视频封面显示播放中或已暂停状态",
        "fallback": "保持视频封面可见",
        "persistence": "memory"
      },
      {
        "state_id": "forward-success",
        "initial": false,
        "trigger": "点击一键转发",
        "visible_result": "Toast 提示动态已转发，当前详情不变",
        "fallback": "停留当前详情",
        "persistence": "memory"
      },
      {
        "state_id": "secondary-action-feedback",
        "initial": false,
        "trigger": "点击下载图片、分享、收藏、复制文案、编辑、复制动态或查看大图",
        "visible_result": "分别提示对应操作的原型边界或成功状态",
        "fallback": "停留当前详情",
        "persistence": "memory"
      },
      {
        "state_id": "selection-item-added",
        "initial": false,
        "trigger": "点击详情页加入选品车",
        "visible_result": "当前产品加入或移出选品车，并与动态列表状态同步",
        "fallback": "当前浏览上下文不变",
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
    "checked_at": "2026-07-24T03:03:45.000Z",
    "scope": "动态详情独立页面的加入选品车入口、列表已选状态同步、关联商品入口；移动端预览验证详情底部操作栏不遮挡内容并保持可查看产品细节。",
    "checks": {
      "horizontal_overflow": true,
      "overlap": true,
      "clipping": true,
      "action_legibility": true,
      "primary_focus": true,
      "state_feedback": true
    },
    "checked": true
  }
}
*/

(function registerDynamicDetail() {
  var fallbackImage = './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg';
  var statusLabels = { live: '直播中', new: '上新', starred: '星标', verified: '认证' };

  function escapeHtml(value) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value == null ? '' : value).split('').map(function(char) { return map[char] || char; }).join('');
  }

  function ensureCartState(ctx) {
    if (!ctx.appState.cartState) {
      ctx.appState.cartState = { selectionIds: [], goodsIds: [], lastTab: 'selection', firstCardGuideDismissed: false, firstAddGuideDismissed: false };
    }
    return ctx.appState.cartState;
  }

  function selectionHas(ctx, dynamicId) {
    return ensureCartState(ctx).selectionIds.indexOf(dynamicId) !== -1;
  }

  function fallbackPayload() {
    var db = window.WEGO_PROTOTYPE_DB || {};
    var fallbackProduct = db.products && db.products[0];
    var fallbackPublisher = db.publishers && db.publishers[0];
    return {
      dynamic: { dynamic_id: 'fallback-dynamic', published_at: '刚刚', content_type: 'note', text_content: '这是一条用于直接访问详情时展示的本地笔记内容。', media_list: [{ media_id: 'fallback-media', media_type: 'image', poster_or_src: fallbackImage }] },
      publisher: fallbackPublisher || { publisher_id: 'fallback-publisher', publisher_name: '微购用户', publisher_avatar: './lib/assets/image/avatar/avatar_001.jpg', publisher_type: 'person', publisher_statuses: ['verified'] },
      products: fallbackProduct ? [fallbackProduct] : []
    };
  }

  function tagTemplate(label, id) {
    return '<span class="tag tag--20 tag--gray" data-dd-id="dynamic-detail-tag-' + id + '" data-component-slug="tag" data-component-binding="dynamic-detail-tag"><span class="tag__label">' + escapeHtml(label) + '</span></span>';
  }

  function mediaTemplate(item) {
    var image = '<div class="wg-image wg-image--rounded-md dynamic-detail__media" data-dd-id="dynamic-detail-media-' + item.media_id + '" data-component-slug="image" data-component-binding="dynamic-detail-media"><img class="wg-image__src is-loaded" src="' + item.poster_or_src + '" alt=""></div>';
    if (item.media_type !== 'video') return '<div class="dynamic-detail__media-item">' + image + '</div>';
    return '<button type="button" class="dynamic-detail__media-item dynamic-detail__video" data-media-id="' + item.media_id + '" data-dom-id="toggle-video-' + item.media_id + '">' + image + '<span class="dynamic-detail__video-state" data-video-state>播放 · ' + escapeHtml(item.duration_label) + '</span></button>';
  }

  function productTemplate(product) {
    if (!product) return '';
    var image = product.image_list && product.image_list[0] ? product.image_list[0] : fallbackImage;
    var name = product.title || product.name;
    return '<div class="card card--outlined dynamic-detail__product-card" role="link" tabindex="0" data-product-id="' + product.product_id + '" data-dd-id="dynamic-detail-product-card" data-component-slug="card" data-component-binding="dynamic-detail-product-card" data-dom-id="open-related-product">'
      + '<div class="card__content dynamic-detail__product-content">'
      + '<div class="card__header"><div class="wg-image wg-image--xl wg-image--rounded-md" data-dd-id="dynamic-detail-product-image" data-component-slug="image" data-component-binding="dynamic-detail-product-image"><img class="wg-image__src is-loaded" src="' + image + '" alt=""></div></div>'
      + '<div class="card__body dynamic-detail__product-copy"><p class="dynamic-detail__product-name">' + escapeHtml(name) + '</p><p class="dynamic-detail__product-point">' + escapeHtml(product.selling_points.slice(0, 2).join(' · ')) + '</p></div>'
      + '<div class="card__footer dynamic-detail__product-price">¥' + escapeHtml(product.price) + '</div>'
      + '</div></div>';
  }

  window.WegoApp.registerScene({
    routeId: 'dynamic-detail',
    title: '动态详情',
    template: `
    <section class="dynamic-detail" data-surface-id="dynamic-detail" data-route-id="dynamic-detail" data-route-bound="true" data-layout-mode="composed" data-page-edge-mode="M0" data-bg="surface">
      <div class="navbar" data-dd-id="dynamic-detail-navbar" data-component-slug="navbar" data-component-binding="dynamic-detail-navbar">
        <div class="navbar__body">
          <div class="navbar__left"><button type="button" class="navbar__left-btn" aria-label="返回" data-dom-id="dynamic-detail-back"><i class="wego-iconfont-s icon-fanhui" aria-hidden="true"></i></button></div>
          <div class="navbar__center"><span class="navbar__title">动态详情</span></div>
          <div class="navbar__right"></div>
        </div>
      </div>
      <main class="dynamic-detail__scroll">
        <article class="dynamic-detail__content" data-region="dynamic-content"></article>
        <span class="tag tag--20 tag--gray" hidden aria-hidden="true" data-dd-id="dynamic-detail-tag-seed" data-component-slug="tag" data-component-binding="dynamic-detail-tag"><span class="tag__label">产品</span></span>
      </main>
      <div class="bottom-action-bar bottom-action-bar--primary-secondary bottom-action-bar--icon-text js-overflow-bar" role="toolbar" aria-label="动态操作" data-dd-id="dynamic-detail-actions" data-component-slug="bottom-action-bar" data-component-binding="dynamic-detail-actions">
        <div class="bottom-action-bar__inner">
          <div class="bottom-action-bar__leading">
            <button class="bottom-action-bar__more" type="button" aria-label="更多操作"><i class="wego-iconfont-s icon-sandian16"></i><span class="bottom-action-bar__more-label">更多</span></button>
            <button class="bottom-action-bar__action" type="button" data-dom-id="dynamic-detail-download" data-menu-label="下载图片"><span class="bottom-action-bar__action-icon"><i class="wego-iconfont-s icon-xiazai"></i></span><span class="bottom-action-bar__action-label">下载图片</span></button>
            <button class="bottom-action-bar__action" type="button" data-dom-id="dynamic-detail-share" data-menu-label="分享"><span class="bottom-action-bar__action-icon"><i class="wego-iconfont-s icon-fenxiang"></i></span><span class="bottom-action-bar__action-label">分享</span></button>
            <button class="bottom-action-bar__action dynamic-detail__select-cart" type="button" data-dom-id="dynamic-detail-select-cart" data-menu-label="加入选品车"><span class="bottom-action-bar__action-icon"><i class="wego-iconfont-s icon-gouwuche"></i></span><span class="bottom-action-bar__action-label">加入选品车</span></button>
            <button class="bottom-action-bar__action" type="button" data-dom-id="dynamic-detail-favorite" data-menu-label="收藏"><span class="bottom-action-bar__action-icon"><i class="wego-iconfont-s icon-shoucang"></i></span><span class="bottom-action-bar__action-label">收藏</span></button>
            <button class="bottom-action-bar__action" type="button" data-dom-id="dynamic-detail-copy-text" data-menu-label="复制文案"><span class="bottom-action-bar__action-icon"><i class="wego-iconfont-s icon-fuzhi"></i></span><span class="bottom-action-bar__action-label">复制文案</span></button>
            <button class="bottom-action-bar__action" type="button" data-dom-id="dynamic-detail-edit" data-menu-label="编辑"><span class="bottom-action-bar__action-icon"><i class="wego-iconfont-s icon-bianji"></i></span><span class="bottom-action-bar__action-label">编辑</span></button>
            <button class="bottom-action-bar__action" type="button" data-dom-id="dynamic-detail-copy-dynamic" data-menu-label="复制动态"><span class="bottom-action-bar__action-icon"><i class="wego-iconfont-s icon-fuzhi"></i></span><span class="bottom-action-bar__action-label">复制动态</span></button>
            <button class="bottom-action-bar__action" type="button" data-dom-id="dynamic-detail-view-image" data-menu-label="查看大图"><span class="bottom-action-bar__action-icon"><i class="wego-iconfont-s icon-tupian"></i></span><span class="bottom-action-bar__action-label">查看大图</span></button>
          </div>
          <div class="bottom-action-bar__trailing">
            <button class="btn btn--strong btn--md" type="button" data-dd-id="dynamic-detail-forward" data-component-slug="button" data-component-binding="dynamic-detail-forward" data-dom-id="dynamic-detail-forward">一键转发</button>
          </div>
        </div>
      </div>
    </section>
  `,
    presentation: { type: 'push', transition: 'slide-left-enter, slide-right-exit', dismissAction: 'back-button', overlayLevel: 'inline', coversTabBar: true },
    init: function initDynamicDetail(ctx) {
      var payload = ctx.appState.dynamicFeedPayload || fallbackPayload();
      var dynamic = payload.dynamic;
      var publisher = payload.publisher;
      var product = payload.products && payload.products[0];
      var content = ctx.root.querySelector('[data-region="dynamic-content"]');
      ensureCartState(ctx);
      var statuses = (publisher.publisher_statuses || []).map(function(status, index) { return tagTemplate(statusLabels[status] || status, 'status-' + index); }).join('');
      content.innerHTML = ''
        + '<header class="dynamic-detail__publisher">'
        +   '<div class="avatar avatar--40 avatar--image" data-dd-id="dynamic-detail-avatar" data-component-slug="avatar" data-component-binding="dynamic-detail-avatar"><img src="' + publisher.publisher_avatar + '" alt="' + escapeHtml(publisher.publisher_name) + '"></div>'
        +   '<div class="dynamic-detail__publisher-copy"><div class="dynamic-detail__publisher-name">' + escapeHtml(publisher.publisher_name) + '</div><div class="dynamic-detail__meta">' + escapeHtml(dynamic.published_at) + '</div></div>'
        + '</header>'
        + '<div class="dynamic-detail__tags">' + tagTemplate(dynamic.content_type === 'product' ? '产品' : '笔记', 'type') + statuses + '</div>'
        + '<p class="dynamic-detail__text">' + escapeHtml(dynamic.text_content) + '</p>'
        + '<div class="dynamic-detail__media-list">' + dynamic.media_list.map(mediaTemplate).join('') + '</div>'
        + (product ? '<section class="dynamic-detail__product-host"><h2 class="dynamic-detail__section-title">关联商品</h2>' + productTemplate(product) + '</section>' : '');

      ctx.root.querySelector('[data-dom-id="dynamic-detail-back"]').addEventListener('click', function() {
        ctx.back();
        if (payload.source_route) window.history.replaceState('', document.title, '#/' + payload.source_route);
      });
      ctx.root.querySelector('[data-dom-id="dynamic-detail-download"]').addEventListener('click', function() { ctx.toast('图片下载为原型演示，本期不保存到设备'); });
      ctx.root.querySelector('[data-dom-id="dynamic-detail-share"]').addEventListener('click', function() { ctx.toast('分享能力本期暂未开放'); });
      function syncSelectButton() {
        var button = ctx.root.querySelector('[data-dom-id="dynamic-detail-select-cart"]');
        if (!button) return;
        var added = selectionHas(ctx, dynamic.dynamic_id);
        button.classList.toggle('is-added', added);
        button.dataset.menuLabel = added ? '移出选品车' : '加入选品车';
        button.querySelector('.bottom-action-bar__action-label').textContent = added ? '已加入' : '加入选品车';
        button.querySelector('.bottom-action-bar__action-icon i').className = 'wego-iconfont-s ' + (added ? 'icon-gou16' : 'icon-gouwuche');
      }
      ctx.root.querySelector('[data-dom-id="dynamic-detail-select-cart"]').addEventListener('click', function() {
        var cart = ensureCartState(ctx);
        var index = cart.selectionIds.indexOf(dynamic.dynamic_id);
        if (index === -1) {
          cart.selectionIds.push(dynamic.dynamic_id);
          cart.lastTab = 'selection';
          cart.firstAddGuideDismissed = false;
          ctx.state['selection-item-added'] = true;
          ctx.toast('已加入选品车，返回动态页可从购物车入口查看');
        } else {
          cart.selectionIds.splice(index, 1);
          ctx.state['selection-item-added'] = cart.selectionIds.indexOf(dynamic.dynamic_id) !== -1;
          ctx.toast('已移出选品车');
        }
        syncSelectButton();
      });
      ctx.root.querySelector('[data-dom-id="dynamic-detail-favorite"]').addEventListener('click', function() { ctx.toast('收藏成功'); });
      ctx.root.querySelector('[data-dom-id="dynamic-detail-copy-text"]').addEventListener('click', function() { ctx.toast('文案已复制（原型演示）'); });
      ctx.root.querySelector('[data-dom-id="dynamic-detail-edit"]').addEventListener('click', function() { ctx.toast('编辑能力本期暂未开放'); });
      ctx.root.querySelector('[data-dom-id="dynamic-detail-copy-dynamic"]').addEventListener('click', function() { ctx.toast('动态已复制（原型演示）'); });
      ctx.root.querySelector('[data-dom-id="dynamic-detail-view-image"]').addEventListener('click', function() { ctx.toast('查看大图能力本期暂未开放'); });
      ctx.root.querySelector('[data-dom-id="dynamic-detail-forward"]').addEventListener('click', function() { ctx.toast('动态已转发'); });

      content.querySelectorAll('[data-media-id]').forEach(function(button) {
        button.addEventListener('click', function() {
          var active = button.classList.toggle('is-playing');
          content.querySelectorAll('[data-media-id]').forEach(function(other) {
            if (other !== button) { other.classList.remove('is-playing'); other.querySelector('[data-video-state]').textContent = '播放 · ' + (dynamic.media_list.find(function(item) { return item.media_id === other.dataset.mediaId; }).duration_label || '视频'); }
          });
          var mediaItem = dynamic.media_list.find(function(item) { return item.media_id === button.dataset.mediaId; });
          button.querySelector('[data-video-state]').textContent = active ? '播放中 · 点击暂停' : '已暂停 · ' + (mediaItem.duration_label || '视频');
          ctx.state.videoPlayingId = active ? button.dataset.mediaId : '';
        });
      });

      var productCard = content.querySelector('[data-dom-id="open-related-product"]');
      if (productCard && product) {
        function openProduct() {
          ctx.appState.productDetailPayload = { product: product, publisher: publisher, source_route: 'dynamic-detail', source_dynamic_id: dynamic.dynamic_id };
          ctx.navigate('product-detail');
        }
        productCard.addEventListener('click', openProduct);
        productCard.addEventListener('keydown', function(event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProduct(); } });
      }
      syncSelectButton();
      ctx.state['dynamic-detail-ready'] = true;
    }
  });
})();
