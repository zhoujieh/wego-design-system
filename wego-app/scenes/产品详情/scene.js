(function () {
  var DEFAULT_PRODUCT = {
    id: 'default',
    name: '春季新款法式碎花连衣裙',
    price: '89.00',
    image: './lib/image/clothing/clothing_1/clothing_1_1.jpg',
    tags: ['秒杀']
  };

  var DEFAULT_ATTRS = [
    { label: '面料', value: '雪纺' },
    { label: '尺码', value: 'S/M/L/XL' },
    { label: '颜色', value: '白色/粉色/蓝色' },
    { label: '季节', value: '春季' },
    { label: '风格', value: '法式' }
  ];

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function splitPrice(price) {
    var str = String(price == null ? '' : price);
    var dot = str.indexOf('.');
    if (dot === -1) return { integer: str, decimal: '' };
    return { integer: str.slice(0, dot), decimal: str.slice(dot) };
  }

  function buildTagsHtml(tags) {
    if (!tags || !tags.length) return '';
    return tags.map(function (t) {
      return '<span class="tag tag--20 tag--promotion"><span class="tag__label">' + escapeHtml(t) + '</span></span>';
    }).join('');
  }

  function buildAttrsHtml(attrs) {
    return attrs.map(function (a) {
      return '<div class="detail-attrs__row">'
        + '<span class="detail-attrs__label">' + escapeHtml(a.label) + '</span>'
        + '<span class="detail-attrs__value">' + escapeHtml(a.value) + '</span>'
        + '</div>';
    }).join('');
  }

  function buildTemplate(product) {
    var price = splitPrice(product.price);
    var tagsHtml = buildTagsHtml(product.tags);
    return ''
      + '<div class="product-detail" data-bg="surface">'
      +   '<nav class="navbar">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-btn" data-action="back" aria-label="返回">'
      +           '<i class="wego-iconfont-s icon-fanhui" aria-hidden="true"></i>'
      +         '</button>'
      +       '</div>'
      +       '<div class="navbar__center">'
      +         '<span class="navbar__title" data-product-title>产品详情</span>'
      +       '</div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</nav>'
      +   '<div class="detail-body">'
      +     '<div class="wg-image wg-image--rounded-lg detail-hero__image">'
      +       '<img class="wg-image__src is-loaded" src="' + escapeHtml(product.image) + '" alt="" />'
      +     '</div>'
      +     '<div class="detail-info">'
      +       '<div class="detail-info__price-row">'
      +         '<div class="metric metric--24 metric--marketing">'
      +           '<div class="metric__main">'
      +             '<span class="metric__symbol">¥</span>'
      +             '<span class="metric__value">'
      +               '<span class="metric__integer">' + escapeHtml(price.integer) + '</span>'
      +               '<span class="metric__decimal">' + escapeHtml(price.decimal) + '</span>'
      +             '</span>'
      +           '</div>'
      +         '</div>'
      +       '</div>'
      +       '<div class="detail-info__name">' + escapeHtml(product.name) + '</div>'
      +       (tagsHtml ? '<div class="detail-info__tags">' + tagsHtml + '</div>' : '')
      +     '</div>'
      +     '<div class="detail-attrs">'
      +       buildAttrsHtml(DEFAULT_ATTRS)
      +     '</div>'
      +   '</div>'
      +   '<div class="detail-action-bar">'
      +     '<button type="button" class="btn btn--strong btn--md detail-action-bar__btn" data-action="buy">立即购买</button>'
      +   '</div>'
      + '</div>';
  }

  function resolveProduct(ctx) {
    var parentState = ctx.appState && ctx.appState.sceneState && ctx.appState.sceneState['dongtai-feed'];
    if (parentState && parentState.selectedProduct) {
      return parentState.selectedProduct;
    }
    return DEFAULT_PRODUCT;
  }

  window.WegoApp.registerScene({
    routeId: 'product-detail',
    title: '产品详情',
    presentation: { type: 'push', transition: 'slide-left-enter, slide-right-exit', coversTabBar: true },
    template: buildTemplate(DEFAULT_PRODUCT),
    init: function (ctx) {
      var root = ctx.root;
      var product = resolveProduct(ctx);
      root.innerHTML = buildTemplate(product);

      var backBtn = root.querySelector('[data-action="back"]');
      if (backBtn) {
        backBtn.addEventListener('click', function () { ctx.back(); });
      }

      var buyBtn = root.querySelector('[data-action="buy"]');
      if (buyBtn) {
        buyBtn.addEventListener('click', function () { ctx.toast('功能开发中'); });
      }
    }
  });
})();
