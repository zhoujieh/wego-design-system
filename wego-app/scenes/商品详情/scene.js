/* wego-design-contract:
{
  "surface_id": "product-detail",
  "route_id": "product-detail",
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
    "design_system_version": 435,
    "token_bindings": [
      {"selector":".product-detail","content_role":".product-detail 的 padding-inline","css_property":"padding-inline","token":"var(--layout-page-margin-m0)"},
      {"selector":".product-detail","content_role":".product-detail 的 background","css_property":"background","token":"var(--bg-page)"},
      {"selector":".product-detail","content_role":".product-detail 的 color","css_property":"color","token":"var(--text-default)"},
      {"selector":".product-detail","content_role":".product-detail 的 font-family","css_property":"font-family","token":"var(--body-md-font-family)"},
      {"selector":".product-detail__body","content_role":".product-detail__body 的 gap","css_property":"gap","token":"var(--spacer-8)"},
      {"selector":".product-detail__body","content_role":"商品信息区顶部内边距","css_property":"padding-top","token":"var(--spacer-8)"},
      {"selector":".product-detail__body","content_role":"商品信息区横向内边距","css_property":"padding-inline","token":"var(--spacer-16)"},
      {"selector":".product-detail__body","content_role":"商品信息区底部内边距","css_property":"padding-bottom","token":"var(--spacer-16)"},
      {"selector":".product-detail__card-content","content_role":".product-detail__card-content 的 gap","css_property":"gap","token":"var(--spacer-8)"},
      {"selector":".product-detail__card-content","content_role":".product-detail__card-content 的 padding","css_property":"padding","token":"var(--spacer-16)"},
      {"selector":".product-detail__price","content_role":".product-detail__price 的 color","css_property":"color","token":"var(--text-promotion)"},
      {"selector":".product-detail__price","content_role":".product-detail__price 的 font-family","css_property":"font-family","token":"var(--heading-sm-font-family)"},
      {"selector":".product-detail__price","content_role":".product-detail__price 的 font-size","css_property":"font-size","token":"var(--heading-sm-font-size)"},
      {"selector":".product-detail__price","content_role":".product-detail__price 的 font-weight","css_property":"font-weight","token":"var(--heading-sm-font-weight)"},
      {"selector":".product-detail__price","content_role":".product-detail__price 的 line-height","css_property":"line-height","token":"var(--heading-sm-line-height)"},
      {"selector":".product-detail__name","content_role":".product-detail__name 的 color","css_property":"color","token":"var(--text-default)"},
      {"selector":".product-detail__name","content_role":".product-detail__name 的 font-size","css_property":"font-size","token":"var(--heading-sm-font-size)"},
      {"selector":".product-detail__name","content_role":".product-detail__name 的 font-weight","css_property":"font-weight","token":"var(--heading-sm-font-weight)"},
      {"selector":".product-detail__name","content_role":".product-detail__name 的 line-height","css_property":"line-height","token":"var(--heading-sm-line-height)"},
      {"selector":".product-detail__points","content_role":".product-detail__points 的 gap","css_property":"gap","token":"var(--spacer-4)"},
      {"selector":".product-detail__points","content_role":".product-detail__points 的 margin-top","css_property":"margin-top","token":"var(--spacer-8)"},
      {"selector":".product-detail__seller-status","content_role":".product-detail__seller-status 的 gap","css_property":"gap","token":"var(--spacer-4)"},
      {"selector":".product-detail__seller-status","content_role":".product-detail__seller-status 的 margin-top","css_property":"margin-top","token":"var(--spacer-8)"},
      {"selector":".product-detail__section-title","content_role":".product-detail__section-title 的 color","css_property":"color","token":"var(--text-default)"},
      {"selector":".product-detail__section-title","content_role":".product-detail__section-title 的 font-size","css_property":"font-size","token":"var(--heading-xs-font-size)"},
      {"selector":".product-detail__section-title","content_role":".product-detail__section-title 的 font-weight","css_property":"font-weight","token":"var(--heading-xs-font-weight)"},
      {"selector":".product-detail__section-title","content_role":".product-detail__section-title 的 line-height","css_property":"line-height","token":"var(--heading-xs-line-height)"},
      {"selector":".product-detail__seller-name","content_role":".product-detail__seller-name 的 color","css_property":"color","token":"var(--text-default)"},
      {"selector":".product-detail__seller-name","content_role":".product-detail__seller-name 的 font-size","css_property":"font-size","token":"var(--heading-xs-font-size)"},
      {"selector":".product-detail__seller-name","content_role":".product-detail__seller-name 的 font-weight","css_property":"font-weight","token":"var(--heading-xs-font-weight)"},
      {"selector":".product-detail__seller-name","content_role":".product-detail__seller-name 的 line-height","css_property":"line-height","token":"var(--heading-xs-line-height)"},
      {"selector":".product-detail__section-body","content_role":".product-detail__section-body 的 color","css_property":"color","token":"var(--text-secondary)"},
      {"selector":".product-detail__section-body","content_role":".product-detail__section-body 的 font-size","css_property":"font-size","token":"var(--body-md-font-size)"},
      {"selector":".product-detail__section-body","content_role":".product-detail__section-body 的 line-height","css_property":"line-height","token":"var(--body-md-line-height)"},
      {"selector":".product-detail__detail-copy","content_role":".product-detail__detail-copy 的 color","css_property":"color","token":"var(--text-secondary)"},
      {"selector":".product-detail__detail-copy","content_role":".product-detail__detail-copy 的 font-size","css_property":"font-size","token":"var(--body-md-font-size)"},
      {"selector":".product-detail__detail-copy","content_role":".product-detail__detail-copy 的 line-height","css_property":"line-height","token":"var(--body-md-line-height)"},
      {"selector":".product-detail__list","content_role":".product-detail__list 的 color","css_property":"color","token":"var(--text-secondary)"},
      {"selector":".product-detail__list","content_role":".product-detail__list 的 font-size","css_property":"font-size","token":"var(--body-md-font-size)"},
      {"selector":".product-detail__list","content_role":".product-detail__list 的 line-height","css_property":"line-height","token":"var(--body-md-line-height)"},
      {"selector":".product-detail__list","content_role":".product-detail__list 的 gap","css_property":"gap","token":"var(--spacer-8)"},
      {"selector":".product-detail__detail-copy","content_role":".product-detail__detail-copy 的 gap","css_property":"gap","token":"var(--spacer-8)"},
      {"selector":".product-detail__seller","content_role":".product-detail__seller 的 gap","css_property":"gap","token":"var(--spacer-8)"},
      {"selector":".product-detail__seller-type","content_role":".product-detail__seller-type 的 color","css_property":"color","token":"var(--text-tertiary)"},
      {"selector":".product-detail__seller-type","content_role":".product-detail__seller-type 的 font-size","css_property":"font-size","token":"var(--body-sm-font-size)"},
      {"selector":".product-detail__seller-type","content_role":".product-detail__seller-type 的 line-height","css_property":"line-height","token":"var(--body-sm-line-height)"}
    ],
    "component_bindings": [
      { "binding_id": "product-detail-navbar", "slug": "navbar", "reason": "普通二级商品详情使用返回箭头和居中标题", "variant_dimensions": { "leftControl": "back-icon", "titleAlignment": "center", "actions": "none", "spacing": "default", "pageTransition": "push", "position": "sticky" } },
      { "binding_id": "product-detail-image", "slug": "image", "reason": "展示商品主图", "variant_dimensions": { "fit": "cover", "size": "custom-wide", "radius": "none", "state": "loaded", "interaction": "static" } },
      { "binding_id": "product-detail-card", "slug": "card", "reason": "按传统电商信息结构分组承载价格卖点、规格属性和详情说明", "variant_dimensions": { "base": "auto", "surface": "surface" } },
      { "binding_id": "product-detail-avatar", "slug": "avatar", "reason": "展示店铺或发布者身份", "variant_dimensions": { "type": "image", "size": "40" } },
      { "binding_id": "product-detail-tag", "slug": "tag", "reason": "展示店铺或发布者状态", "variant_dimensions": { "size": "20", "theme": "gray", "state": "normal", "affordance": "display-only" } },
      { "binding_id": "product-detail-actions", "slug": "bottom-action-bar", "reason": "固定承载联系卖家与立即购买入口", "variant_dimensions": { "type": "primary-secondary-actions", "iconMode": "text-only", "state": "default", "overflow": "expanded" } },
      { "binding_id": "product-detail-contact", "slug": "button", "reason": "弱化的联系卖家入口", "variant_dimensions": { "emphasis": "weak", "size": "md", "iconMode": "text-only", "state": "default" } },
      { "binding_id": "product-detail-buy", "slug": "button", "reason": "商品详情页唯一强调的购买入口；本期点击明确提示边界", "variant_dimensions": { "emphasis": "strong", "size": "md", "iconMode": "text-only", "state": "default" } }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "商品详情是次级普通 Push 页面；采用 M0 通栏主图、内部信息分组与固定底部双操作，遵循传统电商阅读顺序。",
      "page_edge_mode": "M0",
      "mutable_regions": [".product-detail__hero", ".product-detail__body", ".product-detail__seller"]
    },
    "interaction_contract": [
      { "dom_id": "product-detail-back", "target": "navigation:back" },
      { "dom_id": "product-contact", "target": "feedback:toast" },
      { "dom_id": "product-buy", "target": "feedback:toast" }
    ],
    "state_contract": [
      { "state_id": "product-detail-ready", "initial": true, "trigger": "从动态首页或动态详情进入", "visible_result": "按传统电商顺序展示商品图片、价格、名称、卖点、规格属性、详情说明和卖家信息", "fallback": "使用本地示例商品", "persistence": "memory" },
      { "state_id": "product-commerce-entry-feedback", "initial": false, "trigger": "点击联系卖家或立即购买", "visible_result": "Toast 明确提示对应能力本期暂未开放，不产生联系或订单", "fallback": "停留当前商品详情", "persistence": "memory" }
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-22T02:44:17.000Z",
    "scope": "商品主图、价格卖点、规格属性、详情卖家信息、固定底部交易入口与嵌套二级页返回。",
    "checks": { "horizontal_overflow": true, "overlap": true, "clipping": true, "action_legibility": true, "primary_focus": true, "state_feedback": true }
  }
}
*/

(function registerProductDetail() {
  var fallbackImage = './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg';
  var statusLabels = { live: '直播中', new: '上新', starred: '星标', verified: '认证' };

  function escapeHtml(value) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value == null ? '' : value).split('').map(function(char) { return map[char] || char; }).join('');
  }

  function fallbackPayload() {
    var db = window.WEGO_PROTOTYPE_DB || {};
    var fallbackProduct = db.products && db.products[0];
    var fallbackPublisher = db.publishers && db.publishers[0];
    return {
      product: fallbackProduct || { product_id: 'fallback-product', title: '荷叶边方领短袖上衣', name: '荷叶边方领短袖上衣', price: 139, image_list: [fallbackImage], selling_points: ['方领修饰颈部线条', '荷叶边增加层次'], specs: { sizes: ['S', 'M', 'L'], fit: '正常码', care: '建议轻柔洗涤' }, attributes: { color: ['白色'], style: ['轻甜'], silhouette: '合身短款', season: '春夏', material_note: '轻薄梭织感' }, detail_sections: ['适合日常约会和周末出行。'] },
      publisher: fallbackPublisher || { publisher_id: 'fallback-seller', publisher_name: '云朵服饰', publisher_avatar: './lib/assets/image/avatar/avatar_001.jpg', publisher_type: 'shop', publisher_statuses: ['verified'] }
    };
  }

  function tagTemplate(label, id) {
    return '<span class="tag tag--20 tag--gray" data-dd-id="product-detail-tag-' + id + '" data-component-slug="tag" data-component-binding="product-detail-tag"><span class="tag__label">' + escapeHtml(label) + '</span></span>';
  }

  function cardTemplate(id, title, body) {
    return '<section class="card card--surface product-detail__card" data-dd-id="product-detail-card-' + id + '" data-component-slug="card" data-component-binding="product-detail-card"><div class="card__content product-detail__card-content"><h2 class="card__header product-detail__section-title">' + escapeHtml(title) + '</h2><div class="card__body product-detail__section-body">' + body + '</div></div></section>';
  }

  function listItems(items) {
    return items.map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('');
  }

  function productSpecs(product) {
    var specs = product.specs || {};
    if (Array.isArray(product.sku_options)) return product.sku_options;
    return [
      '尺码：' + (specs.sizes || []).join(' / '),
      '版型建议：' + (specs.fit || '正常码'),
      '护理：' + (specs.care || '按衣物标签护理')
    ].filter(function(item) { return item.indexOf('：') === -1 || item.split('：')[1]; });
  }

  function productAttributes(product) {
    var attrs = product.attributes || {};
    if (Array.isArray(attrs)) return attrs;
    return [
      '颜色：' + (attrs.color || []).join(' / '),
      '风格：' + (attrs.style || []).join(' / '),
      '版型：' + (attrs.silhouette || ''),
      '季节：' + (attrs.season || ''),
      '材质观感：' + (attrs.material_note || '')
    ].filter(function(item) { return item.indexOf('：') === -1 || item.split('：')[1]; });
  }

  window.WegoApp.registerScene({
    routeId: 'product-detail',
    title: '商品详情',
    template: `
    <section class="product-detail" data-surface-id="product-detail" data-route-id="product-detail" data-route-bound="true" data-layout-mode="composed" data-page-edge-mode="M0" data-bg="page">
      <div class="navbar" data-dd-id="product-detail-navbar" data-component-slug="navbar" data-component-binding="product-detail-navbar">
        <div class="navbar__body">
          <div class="navbar__left"><button type="button" class="navbar__left-btn" aria-label="返回" data-dom-id="product-detail-back"><i class="wego-iconfont-s icon-fanhui" aria-hidden="true"></i></button></div>
          <div class="navbar__center"><span class="navbar__title">商品详情</span></div>
          <div class="navbar__right"></div>
        </div>
      </div>
      <main class="product-detail__scroll"><div data-region="product-content"></div><span class="tag tag--20 tag--gray" hidden aria-hidden="true" data-dd-id="product-detail-tag-seed" data-component-slug="tag" data-component-binding="product-detail-tag"><span class="tag__label">认证</span></span></main>
      <div class="bottom-action-bar bottom-action-bar--primary-secondary" role="toolbar" aria-label="商品操作" data-dd-id="product-detail-actions" data-component-slug="bottom-action-bar" data-component-binding="product-detail-actions">
        <div class="bottom-action-bar__inner">
          <div class="bottom-action-bar__leading"></div>
          <div class="bottom-action-bar__trailing">
            <button class="btn btn--weak btn--md" type="button" data-dd-id="product-detail-contact" data-component-slug="button" data-component-binding="product-detail-contact" data-dom-id="product-contact">联系卖家</button>
            <button class="btn btn--strong btn--md" type="button" data-dd-id="product-detail-buy" data-component-slug="button" data-component-binding="product-detail-buy" data-dom-id="product-buy">立即购买</button>
          </div>
        </div>
      </div>
    </section>
  `,
    presentation: { type: 'push', transition: 'slide-left-enter, slide-right-exit', dismissAction: 'back-button', overlayLevel: 'inline', coversTabBar: true },
    init: function initProductDetail(ctx) {
      var payload = ctx.appState.productDetailPayload || fallbackPayload();
      var product = payload.product;
      var publisher = payload.publisher || fallbackPayload().publisher;
      var productName = product.title || product.name;
      var productImage = product.image_list && product.image_list[0] ? product.image_list[0] : fallbackImage;
      var sellerStatuses = (publisher.publisher_statuses || []).map(function(status, index) { return tagTemplate(statusLabels[status] || status, index); }).join('');
      var sellingPoints = product.selling_points.map(function(point) { return tagTemplate(point, 'point-' + point); }).join('');
      var specs = listItems(productSpecs(product));
      var attributes = listItems(productAttributes(product));
      var details = product.detail_sections.map(function(section) { return '<p>' + escapeHtml(section) + '</p>'; }).join('');
      var content = ctx.root.querySelector('[data-region="product-content"]');
      content.innerHTML = ''
        + '<div class="product-detail__hero"><div class="wg-image product-detail__image" data-dd-id="product-detail-image" data-component-slug="image" data-component-binding="product-detail-image"><img class="wg-image__src is-loaded" src="' + productImage + '" alt="' + escapeHtml(productName) + '"></div></div>'
        + '<div class="product-detail__body">'
        +   '<section class="card card--surface product-detail__card" data-dd-id="product-detail-card-main" data-component-slug="card" data-component-binding="product-detail-card"><div class="card__content product-detail__card-content"><div class="card__header product-detail__price">¥' + escapeHtml(product.price) + '</div><div class="card__body"><h1 class="product-detail__name">' + escapeHtml(productName) + '</h1><div class="product-detail__points">' + sellingPoints + '</div></div></div></section>'
        +   cardTemplate('spec', '规格选择', '<ul class="product-detail__list">' + specs + '</ul>')
        +   cardTemplate('attributes', '商品属性', '<ul class="product-detail__list">' + attributes + '</ul>')
        +   cardTemplate('detail', '详情说明', '<div class="product-detail__detail-copy">' + details + '</div>')
        +   '<section class="card card--surface product-detail__card" data-dd-id="product-detail-card-seller" data-component-slug="card" data-component-binding="product-detail-card"><div class="card__content product-detail__card-content"><h2 class="card__header product-detail__section-title">卖家信息</h2><div class="card__body product-detail__seller"><div class="avatar avatar--40 avatar--image" data-dd-id="product-detail-avatar" data-component-slug="avatar" data-component-binding="product-detail-avatar"><img src="' + publisher.publisher_avatar + '" alt="' + escapeHtml(publisher.publisher_name) + '"></div><div class="product-detail__seller-copy"><div class="product-detail__seller-name">' + escapeHtml(publisher.publisher_name) + '</div><div class="product-detail__seller-type">' + (publisher.publisher_type === 'shop' ? '店铺发布者' : '个人发布者') + '</div><div class="product-detail__seller-status">' + sellerStatuses + '</div></div></div></div></section>'
        + '</div>';

      ctx.root.querySelector('[data-dom-id="product-detail-back"]').addEventListener('click', function() {
        ctx.back();
        if (payload.source_route) window.history.replaceState('', document.title, '#/' + payload.source_route);
      });
      ctx.root.querySelector('[data-dom-id="product-contact"]').addEventListener('click', function() { ctx.toast('联系卖家能力本期暂未开放'); });
      ctx.root.querySelector('[data-dom-id="product-buy"]').addEventListener('click', function() { ctx.toast('购买能力本期暂未开放'); });
      ctx.state['product-detail-ready'] = true;
    }
  });
})();
