(function registerDynamicProductFeedScenes() {
  if (!window.WegoApp || typeof window.WegoApp.registerScene !== 'function') return;

  var FEED_ROUTE_ID = 'dynamic-product-feed';
  var DETAIL_ROUTE_ID = 'dynamic-product-detail';
  var DEFAULT_AVATAR = './lib/image/avatar-defult.png';

  function createPosts() {
    return [
      {
        id: 'post-1',
        publisher: '江南风物',
        publisherTag: '店主',
        initials: '江',
        time: '5分钟前',
        text: '早秋第一批风衣已经到仓，面料比上一批更垂顺，卡其和灰蓝都能直接发。需要直播实拍图的可以先点详情看完整图组。',
        images: [
          './lib/image/clothing/clothing_1/clothing_1_1.jpg',
          './lib/image/clothing/clothing_1/clothing_1_4.jpg',
          './lib/image/clothing/clothing_1/clothing_1_6.jpg'
        ],
        product: {
          title: '法式翻领收腰长风衣外套，双排扣系带版型，直播间和门店都能直接上架',
          spec: '卡其 / 灰蓝 · S-XL',
          sku: 'FW-8802',
          summary: '垂顺面料｜现货 28 件｜支持代发',
          badges: ['现货', '支持代发'],
          price: '269.00',
          marketPrice: '329.00',
          updateCount: '今日补图 3 张',
          service: '48 小时内发货',
          shipping: '全国包邮（偏远地区除外）',
          cover: './lib/image/clothing/clothing_1/clothing_1_1.jpg'
        }
      },
      {
        id: 'post-2',
        publisher: '轻氧运动馆',
        publisherTag: '主理人',
        initials: '氧',
        time: '今天 09:12',
        text: '',
        images: [
          './lib/image/clothing/clothing_10/1663740458798_50060.jpg'
        ],
        product: {
          title: '高弹塑形瑜伽套装长标题示例：无缝提花背心 + 高腰提臀九分裤，适合门店常规零售、团购分销和直播间成套推荐，不压缩成单行时也要保持信息完整',
          spec: '黑色 / 奶咖 · 均码',
          sku: 'YD-1106',
          summary: '热卖返场｜今日可发｜面料弹力强',
          badges: ['热卖返场', '尺码稳定'],
          price: '159.00',
          marketPrice: '219.00',
          updateCount: '今日新发 1 条',
          service: '支持尺码建议',
          shipping: '当天 18:00 前付款可发',
          cover: './lib/image/clothing/clothing_10/1663740458798_50060.jpg'
        }
      },
      {
        id: 'post-3',
        publisher: '木棉生活家',
        publisherTag: '店主',
        initials: '木',
        time: '昨天 21:48',
        text: '这组茶具我把近景、俯拍和摆台图都补齐了，送礼和家用两个场景都能直接转给客户看。正文不长，但会和商品信息一起稳定排布。',
        images: [
          './lib/image/clothing/clothing_3/1663741004075_93363.jpg',
          './lib/image/clothing/clothing_3/1663740989360_60487.jpg',
          './lib/image/clothing/clothing_3/1663741004074_59093.jpg',
          './lib/image/clothing/clothing_3/1663740989362_46872.jpg'
        ],
        product: {
          title: '手作陶瓷旅行茶具礼盒，一壶四杯带收纳包，客厅陈列和节日送礼都适合',
          spec: '米白 / 墨青',
          sku: 'CJ-2407',
          summary: '礼盒套装｜附赠手提袋｜剩余 12 盒',
          badges: ['礼盒套装', '送礼推荐'],
          price: '219.00',
          marketPrice: '279.00',
          updateCount: '补齐实拍图',
          service: '支持代写贺卡',
          shipping: '24 小时内发货',
          cover: './lib/image/clothing/clothing_3/1663741004075_93363.jpg'
        }
      },
      {
        id: 'post-4',
        publisher: '南巷鞋包仓',
        publisherTag: '档口',
        initials: '巷',
        time: '昨天 16:30',
        text: '',
        images: [
          './lib/image/clothing/clothing_14/1664276960210_50005.jpg',
          './lib/image/clothing/clothing_14/1664276960207_53503.jpg',
          './lib/image/clothing/clothing_14/1664276960208_27201.jpg',
          './lib/image/clothing/clothing_14/1664276960205_75960.jpg',
          './lib/image/clothing/clothing_14/1664276960209_35695.jpg'
        ],
        product: {
          title: '通勤软底乐福鞋，轻量橡胶底 + 细纹皮面，适合秋季门店陈列、直播间走量和企业团采，长商品名在列表里允许两行稳定展示',
          spec: '35-40 码 · 黑 / 奶白 / 摩卡',
          sku: 'XF-3011',
          summary: '多色齐码｜爆款补货｜可一件代发',
          badges: ['多色齐码', '可代发'],
          price: '189.00',
          marketPrice: '249.00',
          updateCount: '含 5 张补图',
          service: '尺码不合支持换码',
          shipping: '支持门店自提',
          cover: './lib/image/clothing/clothing_14/1664276960210_50005.jpg'
        }
      }
    ];
  }

  function clonePosts() {
    return JSON.parse(JSON.stringify(createPosts()));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function metricMarkup(price, marketPrice) {
    var parts = String(price || '0.00').split('.');
    var integer = parts[0] || '0';
    var decimal = '.' + (parts[1] || '00');
    return ''
      + '<div class="dynamic-product-card__price-row">'
      +   '<span class="metric metric--20 metric--marketing">'
      +     '<span class="metric__main">'
      +       '<span class="metric__symbol">¥</span>'
      +       '<span class="metric__value">'
      +         '<span class="metric__integer">' + escapeHtml(integer) + '</span>'
      +         '<span class="metric__decimal">' + escapeHtml(decimal) + '</span>'
      +       '</span>'
      +     '</span>'
      +   '</span>'
      +   '<span class="metric metric--16 metric--black"><span class="metric__line">¥' + escapeHtml(marketPrice) + '</span></span>'
      + '</div>';
  }

  function mediaGridMarkup(images) {
    var list = Array.isArray(images) ? images.slice(0, 5) : [];
    var count = list.length;
    if (!count) return '';
    return ''
      + '<div class="dynamic-post__media-grid" data-count="' + count + '">'
      + list.map(function (src, index) {
        var extra = index === 4 && images.length > 5
          ? '<span class="dynamic-post__media-extra">+' + (images.length - 5) + '</span>'
          : '';
        return ''
          + '<div class="dynamic-post__media-item" data-count="' + count + '">'
          +   '<img src="' + escapeHtml(src) + '" alt="商品图片 ' + (index + 1) + '" />'
          +   extra
          + '</div>';
      }).join('')
      + '</div>';
  }

  function postCardMarkup(post) {
    var badgeMarkup = post.product.badges.map(function (badge) {
      return '<span class="tag tag--20 tag--white"><span class="tag__label">' + escapeHtml(badge) + '</span></span>';
    }).join('');
    return ''
      + '<article class="dynamic-post" data-post-id="' + escapeHtml(post.id) + '">'
      +   '<div class="dynamic-post__header">'
      +     '<div class="dynamic-post__identity">'
      +       '<div class="avatar avatar--40 avatar--initials">' + escapeHtml(post.initials) + '</div>'
      +       '<div class="dynamic-post__meta">'
      +         '<div class="dynamic-post__name-row">'
      +           '<h3 class="dynamic-post__name">' + escapeHtml(post.publisher) + '</h3>'
      +           '<span class="tag tag--20 tag--brand-stroke"><span class="tag__label">' + escapeHtml(post.publisherTag) + '</span></span>'
      +         '</div>'
      +         '<div class="dynamic-post__time">' + escapeHtml(post.time) + '</div>'
      +       '</div>'
      +     '</div>'
      +     '<button type="button" class="dynamic-icon-button" data-post-id="' + escapeHtml(post.id) + '" data-action="more" aria-label="更多操作">'
      +       '<i class="wego-iconfont-s icon-sandian16"></i>'
      +     '</button>'
      +   '</div>'
      +   (post.text ? '<p class="dynamic-post__text">' + escapeHtml(post.text) + '</p>' : '')
      +   mediaGridMarkup(post.images)
      +   '<button type="button" class="dynamic-product-card" data-post-id="' + escapeHtml(post.id) + '" data-action="detail">'
      +     '<div class="dynamic-product-card__cover"><img src="' + escapeHtml(post.product.cover) + '" alt="' + escapeHtml(post.product.title) + '" /></div>'
      +     '<div class="dynamic-product-card__main">'
      +       '<h4 class="dynamic-product-card__title">' + escapeHtml(post.product.title) + '</h4>'
      +       metricMarkup(post.product.price, post.product.marketPrice)
      +       '<div class="dynamic-product-card__tags">'
      +         badgeMarkup
      +       '</div>'
      +       '<div class="dynamic-product-card__meta">' + escapeHtml(post.product.spec) + ' · ' + escapeHtml(post.product.summary) + '</div>'
      +     '</div>'
      +   '</button>'
      +   '<div class="dynamic-post__actions">'
      +     '<div class="dynamic-post__actions-left">'
      +       '<button type="button" class="link" data-post-id="' + escapeHtml(post.id) + '" data-action="detail">看详情</button>'
      +       '<button type="button" class="btn btn--weak btn--sm" data-post-id="' + escapeHtml(post.id) + '" data-action="inquire">询价</button>'
      +     '</div>'
      +     '<div class="dynamic-post__time">' + escapeHtml(post.product.updateCount) + '</div>'
      +   '</div>'
      + '</article>';
  }

  function findPost(posts, postId) {
    return posts.find(function (post) { return post.id === postId; }) || posts[0] || null;
  }

  function ensureFeedState(appState) {
    var state = appState.sceneState[FEED_ROUTE_ID] || (appState.sceneState[FEED_ROUTE_ID] = Object.create(null));
    if (!Array.isArray(state.posts)) state.posts = clonePosts();
    if (!state.selectedPostId) state.selectedPostId = state.posts[0] && state.posts[0].id;
    return state;
  }

  function renderFeed(ctx) {
    var state = ensureFeedState(ctx.appState);
    ctx.root.querySelector('[data-feed-list]').innerHTML = state.posts.map(postCardMarkup).join('');
  }

  function openPostActions(ctx, postId) {
    var state = ensureFeedState(ctx.appState);
    var post = findPost(state.posts, postId);
    if (!post) return;
    state.selectedPostId = post.id;
    ctx.openSheet(
      ''
        + '<div class="dynamic-feed-actionsheet actionsheet actionsheet--action" data-state="open">'
        +   '<div class="actionsheet__panel">'
        +     '<div class="actionsheet__header actionsheet__header--text">'
        +       '<div class="actionsheet__header-text">' + escapeHtml(post.product.title) + '</div>'
        +     '</div>'
        +     '<div class="actionsheet__list">'
        +       '<button type="button" class="actionsheet__item" data-sheet-action="detail">'
        +         '<div class="actionsheet__item-main"><span class="actionsheet__item-title">查看商品详情</span></div>'
        +       '</button>'
        +       '<button type="button" class="actionsheet__item" data-sheet-action="forward">'
        +         '<div class="actionsheet__item-main"><span class="actionsheet__item-title">转发给客户</span></div>'
        +       '</button>'
        +       '<button type="button" class="actionsheet__item" data-sheet-action="favorite">'
        +         '<div class="actionsheet__item-main"><span class="actionsheet__item-title">收藏商品</span></div>'
        +       '</button>'
        +       '<button type="button" class="actionsheet__item" data-sheet-action="contact">'
        +         '<div class="actionsheet__item-main"><span class="actionsheet__item-title">联系店主</span></div>'
        +       '</button>'
        +     '</div>'
        +     '<div class="actionsheet__cancel-gap"></div>'
        +     '<button type="button" class="actionsheet__cancel" data-sheet-action="cancel">取消</button>'
        +     '<div class="actionsheet__safe-area"></div>'
        +   '</div>'
        + '</div>',
      {
        label: '更多操作',
        init: function (sheetCtx) {
          sheetCtx.root.addEventListener('click', function (event) {
            var trigger = event.target.closest('[data-sheet-action]');
            if (!trigger) return;
            var action = trigger.dataset.sheetAction;
            if (action === 'cancel') {
              sheetCtx.close();
              return;
            }
            if (action === 'detail') {
              sheetCtx.close();
              ctx.navigate(DETAIL_ROUTE_ID);
              return;
            }
            sheetCtx.close();
            if (action === 'forward') ctx.toast('已模拟转发给客户');
            if (action === 'favorite') ctx.toast('已加入收藏');
            if (action === 'contact') ctx.toast('已打开联系店主入口');
          });
        }
      }
    );
  }

  function feedTemplate() {
    return ''
      + '<section class="dynamic-feed-page" data-bg="page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body navbar__body--spaced">'
      +       '<div class="navbar__left"></div>'
      +       '<div class="navbar__center"><span class="navbar__title">动态</span></div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="dynamic-feed-page__body">'
      +     '<div class="dynamic-feed-list" data-feed-list></div>'
      +   '</div>'
      + '</section>';
  }

  function detailTemplate() {
    return ''
      + '<section class="dynamic-detail-page" data-bg="page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body navbar__body--spaced">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-btn" data-detail-action="back" aria-label="返回">'
      +           '<i class="wego-iconfont-s icon-fanhui"></i>'
      +         '</button>'
      +       '</div>'
      +       '<div class="navbar__center"><span class="navbar__title">商品详情</span></div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="dynamic-detail-page__body" data-detail-body></div>'
      + '</section>';
  }

  function detailBodyMarkup(post, activeImageIndex) {
    var images = Array.isArray(post.images) && post.images.length ? post.images : [post.product.cover];
    var activeImage = images[activeImageIndex] || images[0];
    var noteMarkup = post.text
      ? '<section class="dynamic-detail-section"><h3 class="dynamic-detail-note__title">动态说明</h3><p class="dynamic-detail-note__body">' + escapeHtml(post.text) + '</p></section>'
      : '';
    var thumbMarkup = images.map(function (src, index) {
      var active = index === activeImageIndex ? ' is-active' : '';
      return '<button type="button" class="dynamic-detail-gallery__thumb' + active + '" data-detail-action="thumb" data-index="' + index + '"><img src="' + escapeHtml(src) + '" alt="商品缩略图 ' + (index + 1) + '" /></button>';
    }).join('');
    var detailBadgeMarkup = post.product.badges.map(function (badge) {
      return '<span class="tag tag--24 tag--white tag--normal"><span class="tag__label">' + escapeHtml(badge) + '</span></span>';
    }).join('');
    return ''
      + '<section class="dynamic-detail-gallery">'
      +   '<div class="dynamic-detail-gallery__hero"><img src="' + escapeHtml(activeImage) + '" alt="' + escapeHtml(post.product.title) + '" /></div>'
      +   '<div class="dynamic-detail-gallery__thumbs">'
      +     thumbMarkup
      +   '</div>'
      + '</section>'
      + '<section class="dynamic-detail-product">'
      +   '<div class="dynamic-detail-product__seller">'
      +     '<div class="avatar avatar--40 avatar--initials">' + escapeHtml(post.initials) + '</div>'
      +     '<div class="dynamic-post__meta">'
      +       '<div class="dynamic-post__name-row">'
      +         '<h3 class="dynamic-post__name">' + escapeHtml(post.publisher) + '</h3>'
      +         '<span class="tag tag--20 tag--brand-stroke"><span class="tag__label">' + escapeHtml(post.publisherTag) + '</span></span>'
      +       '</div>'
      +       '<div class="dynamic-post__time">' + escapeHtml(post.time) + '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="dynamic-detail-product__main">'
      +     '<h2 class="dynamic-detail-product__title">' + escapeHtml(post.product.title) + '</h2>'
      +     metricMarkup(post.product.price, post.product.marketPrice)
      +     '<div class="dynamic-detail-product__tags">'
      +       detailBadgeMarkup
      +     '</div>'
      +     '<p class="dynamic-detail-product__desc">' + escapeHtml(post.product.summary) + '</p>'
      +     '<div class="dynamic-detail-product__grid">'
      +       '<div class="dynamic-detail-product__fact"><p class="dynamic-detail-product__fact-label">规格</p><p class="dynamic-detail-product__fact-value">' + escapeHtml(post.product.spec) + '</p></div>'
      +       '<div class="dynamic-detail-product__fact"><p class="dynamic-detail-product__fact-label">货号</p><p class="dynamic-detail-product__fact-value">' + escapeHtml(post.product.sku) + '</p></div>'
      +       '<div class="dynamic-detail-product__fact"><p class="dynamic-detail-product__fact-label">发货说明</p><p class="dynamic-detail-product__fact-value">' + escapeHtml(post.product.shipping) + '</p></div>'
      +       '<div class="dynamic-detail-product__fact"><p class="dynamic-detail-product__fact-label">服务承诺</p><p class="dynamic-detail-product__fact-value">' + escapeHtml(post.product.service) + '</p></div>'
      +     '</div>'
      +   '</div>'
      + '</section>'
      + noteMarkup
      + '<div class="dynamic-detail-action-bar-wrap">'
      +   '<div class="dynamic-detail-action-bar">'
      +     '<button type="button" class="btn btn--medium btn--md" data-detail-action="contact">联系店主</button>'
      +     '<button type="button" class="btn btn--strong btn--md" data-detail-action="order">立即下单</button>'
      +   '</div>'
      + '</div>';
  }

  function renderDetail(ctx) {
    var feedState = ensureFeedState(ctx.appState);
    var state = ctx.state;
    var post = findPost(feedState.posts, state.selectedPostId || feedState.selectedPostId);
    if (!post) return;
    state.selectedPostId = post.id;
    state.activeImageIndex = Math.min(state.activeImageIndex || 0, (post.images || []).length - 1);
    if (state.activeImageIndex < 0) state.activeImageIndex = 0;
    ctx.root.querySelector('[data-detail-body]').innerHTML = detailBodyMarkup(post, state.activeImageIndex);
  }

  function initFeedScene(ctx) {
    ensureFeedState(ctx.appState);
    renderFeed(ctx);
    ctx.root.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-action]');
      if (!trigger) return;
      var postId = trigger.dataset.postId;
      var action = trigger.dataset.action;
      var state = ensureFeedState(ctx.appState);
      state.selectedPostId = postId;
      if (action === 'detail') {
        ctx.navigate(DETAIL_ROUTE_ID);
        return;
      }
      if (action === 'inquire') {
        ctx.toast('已打开询价入口');
        return;
      }
      if (action === 'more') {
        openPostActions(ctx, postId);
      }
    });
  }

  function initDetailScene(ctx) {
    var feedState = ensureFeedState(ctx.appState);
    ctx.state.selectedPostId = feedState.selectedPostId || ctx.state.selectedPostId;
    renderDetail(ctx);
    ctx.root.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-detail-action]');
      if (!trigger) return;
      var action = trigger.dataset.detailAction;
      if (action === 'back') {
        ctx.back();
        return;
      }
      if (action === 'thumb') {
        ctx.state.activeImageIndex = Number(trigger.dataset.index || 0);
        renderDetail(ctx);
        return;
      }
      if (action === 'contact') {
        ctx.toast('已打开联系店主入口');
        return;
      }
      if (action === 'order') {
        ctx.toast('已提交下单意向');
      }
    });
  }

  window.WegoApp.registerScene({
    routeId: FEED_ROUTE_ID,
    title: '动态',
    presentation: {
      type: 'host-tab',
      transition: 'none',
      coversTabBar: false
    },
    template: feedTemplate(),
    init: initFeedScene
  });

  window.WegoApp.registerScene({
    routeId: DETAIL_ROUTE_ID,
    title: '商品详情',
    presentation: {
      type: 'push',
      transition: 'slide-left',
      coversTabBar: true
    },
    template: detailTemplate(),
    init: initDetailScene
  });
})();
