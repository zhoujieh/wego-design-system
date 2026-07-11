(function registerAlbumProductFeedScene() {
  if (!window.WegoApp) return;

  var feedItems = [
    {
      id: 'post-01',
      sellerName: '苏禾轻衣',
      sellerTag: '今日上新',
      publishTime: '7月11日 09:12',
      text: '新品到店，薄荷绿小香风套装今天刚补齐尺码。上身利落，通勤和见客户都很稳，S 到 XL 现货可直接拍。',
      images: [
        '../.codex/skills/wego-design/assets/image/clothing/clothing_1/clothing_1_1.jpg',
        '../.codex/skills/wego-design/assets/image/clothing/clothing_1/clothing_1_2.jpg',
        '../.codex/skills/wego-design/assets/image/clothing/clothing_1/clothing_1_3.jpg'
      ],
      product: {
        id: 'mint-set',
        title: '薄荷绿小香风两件套西装，含短外套与高腰半裙，支持拆分搭配',
        subtitle: '面料轻挺不闷，直播间同款，现货 4 色 8 码可混批',
        price: '¥268',
        marketPrice: '¥329',
        stockHint: '现货 128 件',
        tags: ['可混批', '48小时发货']
      }
    },
    {
      id: 'post-02',
      sellerName: '苏禾轻衣',
      sellerTag: '店主精选',
      publishTime: '7月11日 10:26',
      text: '',
      images: [
        '../.codex/skills/wego-design/assets/image/clothing/clothing_4/1663741029863_23235.jpg'
      ],
      product: {
        id: 'ivory-shirt',
        title: '法式垂感真丝衬衫',
        subtitle: '只有商品信息的动态也要能一眼看清主卖点，适合被连续滑动浏览时快速做判断。',
        price: '¥199',
        marketPrice: '¥259',
        stockHint: '预售 3 天内发货',
        tags: ['单图款', '可代发']
      }
    },
    {
      id: 'post-03',
      sellerName: '苏禾轻衣',
      sellerTag: '长文说明',
      publishTime: '7月11日 11:08',
      text: '这组是给门店团购客户准备的通勤针织系列。颜色多、尺码跨度大，拿货时常会问是否显肩宽、洗后会不会塌，所以我把版型和成分都写全，减少来回确认。',
      images: [
        '../.codex/skills/wego-design/assets/image/clothing/clothing_7/1663741042720_27285.jpg',
        '../.codex/skills/wego-design/assets/image/clothing/clothing_7/1663741042721_39124.jpg',
        '../.codex/skills/wego-design/assets/image/clothing/clothing_7/1663741042724_52704.jpg',
        '../.codex/skills/wego-design/assets/image/clothing/clothing_7/1663741042725_25882.jpg'
      ],
      product: {
        id: 'knit-series',
        title: '通勤针织系列套组，含圆领短袖、薄开衫、直筒半裙与同色系披肩',
        subtitle: '92% 粘纤 + 8% 锦纶，肩线做了内收处理；长文、四图和超长商品信息同时出现时，卡片仍需稳定不跳版。',
        price: '¥359',
        marketPrice: '¥429',
        stockHint: '团购价满 10 件起',
        tags: ['尺码齐', '支持团购', '成分说明完整']
      }
    }
  ];

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function imageGridClass(count) {
    if (count <= 1) return 'album-feed-card__gallery album-feed-card__gallery--single';
    if (count === 2) return 'album-feed-card__gallery album-feed-card__gallery--double';
    if (count === 4) return 'album-feed-card__gallery album-feed-card__gallery--quad';
    return 'album-feed-card__gallery album-feed-card__gallery--triple';
  }

  function renderImages(images, title) {
    if (!Array.isArray(images) || images.length === 0) return '';
    return ''
      + '<div class="' + imageGridClass(images.length) + '">'
      + images.map(function (src, index) {
        return ''
          + '<button type="button" class="album-feed-card__image-btn" data-action="preview-image" data-image-index="' + index + '" aria-label="查看第' + (index + 1) + '张商品图">'
          +   '<img src="' + src + '" alt="' + escapeHtml(title) + '" class="album-feed-card__image" />'
          + '</button>';
      }).join('')
      + '</div>';
  }

  function renderTags(tags) {
    return (tags || []).map(function (tag) {
      return '<span class="tag tag--24 tag--white tag--normal"><span class="tag__label">' + escapeHtml(tag) + '</span></span>';
    }).join('');
  }

  function renderProductCard(item) {
    var product = item.product;
    return ''
      + '<button type="button" class="album-product-card" data-action="open-detail" data-product-id="' + product.id + '">'
      +   '<div class="album-product-card__meta">'
      +     '<div class="album-product-card__title">' + escapeHtml(product.title) + '</div>'
      +     '<div class="album-product-card__subtitle">' + escapeHtml(product.subtitle) + '</div>'
      +     '<div class="album-product-card__price-row">'
      +       '<span class="album-product-card__price">' + escapeHtml(product.price) + '</span>'
      +       '<span class="album-product-card__market">' + escapeHtml(product.marketPrice) + '</span>'
      +     '</div>'
      +     '<div class="album-product-card__foot">'
      +       '<span class="album-product-card__stock">' + escapeHtml(product.stockHint) + '</span>'
      +       '<span class="album-product-card__arrow">查看商品</span>'
      +     '</div>'
      +   '</div>'
      + '</button>';
  }

  function renderFeedCard(item) {
    return ''
      + '<article class="card card--surface album-feed-card" data-post-id="' + item.id + '">'
      +   '<div class="card__content album-feed-card__content">'
      +     '<header class="album-feed-card__header">'
      +       '<div class="avatar avatar--40 avatar--initials">苏</div>'
      +       '<div class="album-feed-card__header-meta">'
      +         '<div class="album-feed-card__header-row">'
      +           '<strong class="album-feed-card__seller">' + escapeHtml(item.sellerName) + '</strong>'
      +           '<span class="tag tag--20 tag--gray"><span class="tag__label">' + escapeHtml(item.sellerTag) + '</span></span>'
      +         '</div>'
      +         '<div class="album-feed-card__time">' + escapeHtml(item.publishTime) + '</div>'
      +       '</div>'
      +     '</header>'
      +     (item.text ? '<p class="album-feed-card__text">' + escapeHtml(item.text) + '</p>' : '')
      +     renderImages(item.images, item.product.title)
      +     renderProductCard(item)
      +     '<div class="album-feed-card__tags">' + renderTags(item.product.tags) + '</div>'
      +     '<div class="album-feed-card__actions">'
      +       '<button type="button" class="btn btn--weak btn--sm" data-action="save-product" data-product-id="' + item.product.id + '">加入选货单</button>'
      +       '<button type="button" class="btn btn--medium btn--sm" data-action="share-post" data-post-id="' + item.id + '">转发动态</button>'
      +       '<button type="button" class="btn btn--strong btn--sm" data-action="open-detail" data-product-id="' + item.product.id + '">去看看</button>'
      +     '</div>'
      +   '</div>'
      + '</article>';
  }

  function findItemByProductId(productId) {
    return feedItems.find(function (item) { return item.product.id === productId; }) || feedItems[0];
  }

  function findItemByPostId(postId) {
    return feedItems.find(function (item) { return item.id === postId; }) || feedItems[0];
  }

  function feedTemplate() {
    return ''
      + '<section class="album-feed-page">'
      +   '<header class="album-feed-page__navbar navbar">'
      +     '<div class="navbar__body navbar__body--spaced">'
      +       '<div class="navbar__left"></div>'
      +       '<div class="navbar__center navbar__center--wide">'
      +         '<h1 class="navbar__title">商品动态</h1>'
      +       '</div>'
      +       '<div class="navbar__right navbar__right--text">'
      +         '<button type="button" class="navbar__action navbar__action--text" data-action="open-manage">'
      +           '<span class="navbar__action-label">筛选</span>'
      +         '</button>'
      +       '</div>'
      +     '</div>'
      +   '</header>'
      +   '<div class="album-feed-page__body">'
      +     '<section class="card card--filled album-feed-brief">'
      +       '<div class="card__content album-feed-brief__content">'
      +         '<div class="album-feed-brief__title">连续浏览更稳定</div>'
      +         '<div class="album-feed-brief__text">按发布时间倒序展示，优先保证发布者、时间、内容、图片和商品信息都在一屏内形成稳定节奏。</div>'
      +       '</div>'
      +     '</section>'
      +     '<div class="album-feed-filters">'
      +       '<button type="button" class="tag tag--32 tag--brand tag--selected"><span class="tag__label">全部动态</span></button>'
      +       '<button type="button" class="tag tag--32 tag--white tag--normal"><span class="tag__label">仅看商品</span></button>'
      +       '<button type="button" class="tag tag--32 tag--white tag--normal"><span class="tag__label">图多优先</span></button>'
      +     '</div>'
      +     '<section class="album-feed-list">'
      +       feedItems.map(renderFeedCard).join('')
      +     '</section>'
      +   '</div>'
      + '</section>';
  }

  function detailTemplate(item) {
    var product = item.product;
    return ''
      + '<section class="album-detail-page">'
      +   '<header class="album-detail-page__navbar navbar">'
      +     '<div class="navbar__body navbar__body--spaced">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-btn" data-action="go-back" aria-label="返回">'
      +           '<i class="wego-iconfont-s icon-zuojiantou24"></i>'
      +         '</button>'
      +       '</div>'
      +       '<div class="navbar__center"><h1 class="navbar__title">商品详情</h1></div>'
      +       '<div class="navbar__right navbar__right--text">'
      +         '<button type="button" class="navbar__action navbar__action--text" data-action="open-more" data-product-id="' + product.id + '">'
      +           '<span class="navbar__action-label">更多</span>'
      +         '</button>'
      +       '</div>'
      +     '</div>'
      +   '</header>'
      +   '<div class="album-detail-page__body">'
      +     '<div class="album-detail-page__hero">'
      +       '<img src="' + item.images[0] + '" alt="' + escapeHtml(product.title) + '" class="album-detail-page__hero-image" />'
      +     '</div>'
      +     '<section class="card card--surface album-detail-page__summary">'
      +       '<div class="card__content album-detail-page__summary-content">'
      +         '<div class="album-detail-page__price">' + escapeHtml(product.price) + '</div>'
      +         '<h2 class="album-detail-page__title">' + escapeHtml(product.title) + '</h2>'
      +         '<p class="album-detail-page__desc">' + escapeHtml(product.subtitle) + '</p>'
      +         '<div class="album-detail-page__specs">'
      +           '<span>' + escapeHtml(product.stockHint) + '</span>'
      +           '<span>支持私聊拿货</span>'
      +           '<span>可一键转发到客户群</span>'
      +         '</div>'
      +       '</div>'
      +     '</section>'
      +     '<section class="card card--surface album-detail-page__origin">'
      +       '<div class="card__content album-detail-page__origin-content">'
      +         '<div class="album-detail-page__origin-head">'
      +           '<div class="avatar avatar--40 avatar--initials">苏</div>'
      +           '<div>'
      +             '<div class="album-detail-page__origin-name">' + escapeHtml(item.sellerName) + '</div>'
      +             '<div class="album-detail-page__origin-time">来自 ' + escapeHtml(item.publishTime) + ' 的商品动态</div>'
      +           '</div>'
      +         '</div>'
      +         '<div class="album-detail-page__origin-text">' + escapeHtml(item.text || '该动态只发布了商品信息，没有额外文案说明。') + '</div>'
      +       '</div>'
      +     '</section>'
      +   '</div>'
      +   '<footer class="album-detail-page__footer">'
      +     '<button type="button" class="btn btn--weak btn--md" data-action="consult-product" data-product-id="' + product.id + '">联系店主</button>'
      +     '<button type="button" class="btn btn--strong btn--md" data-action="save-product" data-product-id="' + product.id + '">加入选货单</button>'
      +   '</footer>'
      + '</section>';
  }

  function bindFeedActions(root, ctx) {
    root.addEventListener('click', function (event) {
      var actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;
      var action = actionEl.dataset.action;
      var productId = actionEl.dataset.productId || '';
      var postId = actionEl.dataset.postId || '';

      if (action === 'open-detail') {
        ctx.state.selectedProductId = productId;
        ctx.navigate('album-product-detail');
        return;
      }

      if (action === 'save-product') {
        ctx.toast('已加入选货单');
        return;
      }

      if (action === 'share-post') {
        ctx.toast({
          variant: 'guide',
          icon: 'icon-chatoast',
          text: '已生成分享文案，可继续转发给客户',
          action: { label: '查看商品', mode: 'weak' },
          onAction: function () {
            ctx.state.selectedProductId = findItemByPostId(postId).product.id;
            ctx.navigate('album-product-detail');
          }
        });
        return;
      }

      if (action === 'preview-image') {
        ctx.toast('原型中图片预览已收口到商品详情查看');
        return;
      }

      if (action === 'open-manage') {
        ctx.openSheet(
          '<div class="album-action-sheet">'
          + '<div class="album-action-sheet__title">连续浏览偏好</div>'
          + '<button type="button" class="album-action-sheet__item" data-sheet-action="latest">按最新发布</button>'
          + '<button type="button" class="album-action-sheet__item" data-sheet-action="product-only">仅看带商品卡</button>'
          + '<button type="button" class="album-action-sheet__item" data-sheet-action="cancel">取消</button>'
          + '</div>',
          {
            label: '动态筛选',
            init: function (overlayCtx) {
              overlayCtx.root.addEventListener('click', function (overlayEvent) {
                var item = overlayEvent.target.closest('[data-sheet-action]');
                if (!item) return;
                overlayCtx.close();
                if (item.dataset.sheetAction !== 'cancel') ctx.toast('原型中已保留筛选入口和反馈');
              });
            }
          }
        );
      }
    });
  }

  function bindDetailActions(root, ctx) {
    root.addEventListener('click', function (event) {
      var actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;
      var action = actionEl.dataset.action;

      if (action === 'go-back') {
        ctx.back();
        return;
      }

      if (action === 'save-product') {
        ctx.toast('已加入选货单');
        return;
      }

      if (action === 'consult-product') {
        ctx.dialog({
          variant: 'text',
          title: '联系店主',
          content: '原型中使用弹窗确认动作，正式接入时可跳转到聊天或询价流程。',
          buttons: [
            { label: '稍后再说', tone: 'dismiss' },
            { label: '知道了', tone: 'confirm' }
          ]
        });
        return;
      }

      if (action === 'open-more') {
        ctx.openSheet(
          '<div class="album-action-sheet">'
          + '<div class="album-action-sheet__title">商品操作</div>'
          + '<button type="button" class="album-action-sheet__item" data-sheet-action="poster">生成海报</button>'
          + '<button type="button" class="album-action-sheet__item" data-sheet-action="copy">复制文案</button>'
          + '<button type="button" class="album-action-sheet__item" data-sheet-action="cancel">取消</button>'
          + '</div>',
          {
            label: '商品操作',
            init: function (overlayCtx) {
              overlayCtx.root.addEventListener('click', function (overlayEvent) {
                var item = overlayEvent.target.closest('[data-sheet-action]');
                if (!item) return;
                overlayCtx.close();
                if (item.dataset.sheetAction !== 'cancel') ctx.toast('已保留必要操作入口');
              });
            }
          }
        );
      }
    });
  }

  window.WegoApp.registerScene({
    routeId: 'album-product-feed',
    title: '动态',
    presentation: { type: 'host-tab', coversTabBar: false },
    template: feedTemplate(),
    init: function (ctx) {
      bindFeedActions(ctx.root, ctx);
    }
  });

  window.WegoApp.registerScene({
    routeId: 'album-product-detail',
    title: '商品详情',
    presentation: { type: 'push', transition: 'slide-left', coversTabBar: true },
    template: detailTemplate(findItemByProductId((window.WegoApp.getState().sceneState['album-product-feed'] || {}).selectedProductId)),
    init: function (ctx) {
      var feedState = window.WegoApp.getState().sceneState['album-product-feed'] || {};
      var currentItem = findItemByProductId(feedState.selectedProductId);
      ctx.root.innerHTML = detailTemplate(currentItem);
      bindDetailActions(ctx.root, ctx);
    }
  });
})();
