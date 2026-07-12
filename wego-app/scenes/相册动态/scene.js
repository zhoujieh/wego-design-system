/* 相册动态场景
   消费 prototype_design.surface_decisions：
   - feed-host-tab: host-tab presentation, M0, media_priority=supporting
   - feed-product-detail: push, M16, simulated
   - feed-more-actions: sheet (actionsheet), stub
   - feed-image-viewer: full-screen-modal, stub
   组件消费：navbar / search / avatar / card / image / metric / tag / link / button / actionsheet / toast
   生成多条真实业务动态数据，覆盖：纯商品 / 文字+商品 / 多图 / 空文字 / 长标题 等形态 */
(function () {
  // ── 模拟动态数据 ──
  var IMAGE_BASE = './lib/image/clothing/';
  var AVATAR_DEFAULT = './lib/image/avatar-defult.png';

  var feedData = [
    {
      id: 'dy-001',
      author: { name: '初夏衣橱', avatar: AVATAR_DEFAULT },
      time: '2小时前',
      text: '今天上新几款早秋衬衫，面料柔软透气，配色克制好搭配。喜欢的姐妹可以直接拍下，尺码齐全。',
      images: [
        IMAGE_BASE + 'clothing_1/clothing_1_1.jpg',
        IMAGE_BASE + 'clothing_1/clothing_1_2.jpg',
        IMAGE_BASE + 'clothing_1/clothing_1_3.jpg',
        IMAGE_BASE + 'clothing_1/clothing_1_4.jpg'
      ],
      product: {
        id: 'p-001',
        title: '早秋法式碎花衬衫 长袖通勤款',
        price: '128.00',
        originalPrice: '198.00',
        tags: ['新品', '包邮'],
        image: IMAGE_BASE + 'clothing_1/clothing_1_1.jpg'
      }
    },
    {
      id: 'dy-002',
      author: { name: '简白女装', avatar: AVATAR_DEFAULT },
      time: '4小时前',
      text: '',
      images: [
        IMAGE_BASE + 'clothing_3/1663740989357_27184.jpg',
        IMAGE_BASE + 'clothing_3/1663740989357_63074.jpg'
      ],
      product: {
        id: 'p-002',
        title: '纯棉白T恤 基础版型短袖',
        price: '59.90',
        tags: ['热销'],
        image: IMAGE_BASE + 'clothing_3/1663740989357_27184.jpg'
      }
    },
    {
      id: 'dy-003',
      author: { name: '秋枫工作室', avatar: AVATAR_DEFAULT },
      time: '昨天',
      text: '这件针织开衫真的太软糯了，触感像棉花糖。版型偏宽松，适合微胖姐妹，搭配吊带或T恤都很出彩。库存不多，需要的尽快。',
      images: [
        IMAGE_BASE + 'clothing_5/1663741055068_1251.jpg'
      ],
      product: {
        id: 'p-003',
        title: '软糯针织开衫 春秋宽松外套 长袖百搭',
        price: '168.00',
        originalPrice: '238.00',
        tags: ['限量', '包邮', '真丝'],
        image: IMAGE_BASE + 'clothing_5/1663741055068_1251.jpg'
      }
    },
    {
      id: 'dy-004',
      author: { name: '南风衣橱', avatar: AVATAR_DEFAULT },
      time: '昨天',
      text: '一条能穿三季的半裙，A字版型显瘦显高，腰部松紧设计包容多种身材。',
      images: [
        IMAGE_BASE + 'clothing_7/1663741042720_27285.jpg',
        IMAGE_BASE + 'clothing_7/1663741042720_39124.jpg',
        IMAGE_BASE + 'clothing_7/1663741042721_59504.jpg',
        IMAGE_BASE + 'clothing_7/1663741042721_16519.jpg',
        IMAGE_BASE + 'clothing_7/1663741042722_18800.jpg',
        IMAGE_BASE + 'clothing_7/1663741042723_52704.jpg'
      ],
      product: {
        id: 'p-004',
        title: '高腰A字半身裙 中长款百搭显瘦 松紧腰',
        price: '89.00',
        tags: ['新品'],
        image: IMAGE_BASE + 'clothing_7/1663741042720_27285.jpg'
      }
    },
    {
      id: 'dy-005',
      author: { name: '初夏衣橱', avatar: AVATAR_DEFAULT },
      time: '2天前',
      text: '',
      images: [],
      product: {
        id: 'p-005',
        title: '复古格子外套 英伦风长袖秋装 修身版型 加厚保暖',
        price: '199.00',
        originalPrice: '299.00',
        tags: ['热销', '包邮'],
        image: IMAGE_BASE + 'clothing_9/1663740558494_61057.jpg'
      }
    },
    {
      id: 'dy-006',
      author: { name: '简白女装', avatar: AVATAR_DEFAULT },
      time: '3天前',
      text: '夏末清仓，最后几件断码特价。面料是冰丝混纺，凉感明显，适合怕热的姐妹。',
      images: [
        IMAGE_BASE + 'clothing_10/1663740458796_1630.jpg',
        IMAGE_BASE + 'clothing_10/1663740458797_6679.jpg',
        IMAGE_BASE + 'clothing_10/1663740458798_50060.jpg'
      ],
      product: {
        id: 'p-006',
        title: '冰丝短袖T恤 夏季凉感面料 断码清仓',
        price: '39.90',
        tags: ['清仓', '特价'],
        image: IMAGE_BASE + 'clothing_10/1663740458796_1630.jpg'
      }
    }
  ];

  // ── 工具函数 ──
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function mediaLayoutClass(count) {
    if (count === 1) return 'album-feed-item__media--single';
    if (count === 2) return 'album-feed-item__media--double';
    return 'album-feed-item__media--grid';
  }

  function buildMediaHtml(images) {
    if (!images || images.length === 0) return '';
    var cls = mediaLayoutClass(images.length);
    var items = images.map(function (src) {
      return ''
        + '<div class="album-feed-item__media-item">'
        +   '<div class="wg-image wg-image--rounded-md wg-image--clickable" data-image-src="' + escapeHtml(src) + '">'
        +     '<img class="wg-image__src" src="' + escapeHtml(src) + '" alt="" loading="lazy" />'
        +   '</div>'
        + '</div>';
    }).join('');
    return '<div class="album-feed-item__media ' + cls + '">' + items + '</div>';
  }

  function buildTagsHtml(tags) {
    if (!tags || tags.length === 0) return '';
    var html = tags.map(function (t) {
      return '<span class="tag tag--20 tag--gray"><span class="tag__label">' + escapeHtml(t) + '</span></span>';
    }).join('');
    return '<div class="album-feed-item__product-tags">' + html + '</div>';
  }

  function buildPriceHtml(product) {
    var main = ''
      + '<span class="metric__symbol">¥</span>'
      + '<span class="metric__value">'
      +   '<span class="metric__integer">' + escapeHtml(product.price.split('.')[0]) + '</span>'
      +   '<span class="metric__decimal">.' + escapeHtml(product.price.split('.')[1] || '00') + '</span>'
      + '</span>';
    var line = '';
    if (product.originalPrice) {
      line = ''
        + '<span class="metric__line">'
        +   '<span class="metric__symbol">¥</span>'
        +   '<span class="metric__value">' + escapeHtml(product.originalPrice) + '</span>'
        + '</span>';
    }
    return '<span class="metric metric--16 metric--marketing">' + main + line + '</span>';
  }

  function buildProductHtml(product) {
    if (!product) return '';
    var img = ''
      + '<div class="album-feed-item__product-image">'
      +   '<div class="wg-image wg-image--rounded-sm">'
      +     '<img class="wg-image__src" src="' + escapeHtml(product.image) + '" alt="" loading="lazy" />'
      +   '</div>'
      + '</div>';
    var tags = buildTagsHtml(product.tags);
    var price = buildPriceHtml(product);
    var link = '<button type="button" class="link album-feed-item__product-link" data-product-id="' + escapeHtml(product.id) + '">查看详情</button>';
    var body = ''
      + '<div class="album-feed-item__product-body">'
      +   '<div class="album-feed-item__product-title">' + escapeHtml(product.title) + '</div>'
      +   tags
      +   '<div class="album-feed-item__product-price-row">' + price + link + '</div>'
      + '</div>';
    return '<div class="album-feed-item__product">' + img + body + '</div>';
  }

  function buildFeedItemHtml(item) {
    var header = ''
      + '<div class="album-feed-item__header">'
      +   '<div class="avatar avatar--image avatar--40">'
      +     '<img src="' + escapeHtml(item.author.avatar) + '" alt="" />'
      +   '</div>'
      +   '<div class="album-feed-item__author">'
      +     '<div class="album-feed-item__name">' + escapeHtml(item.author.name) + '</div>'
      +     '<div class="album-feed-item__time">' + escapeHtml(item.time) + '</div>'
      +   '</div>'
      +   '<button type="button" class="album-feed-item__more" data-more-actions="' + escapeHtml(item.id) + '" aria-label="更多操作">'
      +     '<i class="wego-iconfont-s icon-gengduo-caozuo"></i>'
      +   '</button>'
      + '</div>';
    var text = item.text ? '<p class="album-feed-item__text">' + escapeHtml(item.text) + '</p>' : '';
    var media = buildMediaHtml(item.images);
    var product = buildProductHtml(item.product);
    var actions = ''
      + '<div class="album-feed-item__actions">'
      +   '<button type="button" class="btn btn--medium btn--sm album-feed-item__action-forward" data-forward-id="' + escapeHtml(item.id) + '">'
      +     '<i class="btn__icon icon-zhuanfa16"></i>一键转发'
      +   '</button>'
      + '</div>';
    return ''
      + '<article class="album-feed-item" data-feed-id="' + escapeHtml(item.id) + '">'
      +   header + text + media + product + actions
      + '</article>';
  }

  // ── 更多操作 actionsheet ──
  function buildMoreActionsSheet(item) {
    var actions = [
      { id: 'forward', label: '一键转发' },
      { id: 'copy-text', label: '复制文案' },
      { id: 'share', label: '分享' },
      { id: 'favorite', label: '收藏' },
      { id: 'download', label: '下载图片' },
      { id: 'search', label: '搜索' },
      { id: 'edit', label: '编辑' },
      { id: 'copy-feed', label: '复制动态' }
    ];
    var items = actions.map(function (a) {
      return ''
        + '<div class="actionsheet__item" data-action-id="' + a.id + '">'
        +   '<div class="actionsheet__item-main">'
        +     '<div class="actionsheet__item-title">' + escapeHtml(a.label) + '</div>'
        +   '</div>'
        + '</div>';
    }).join('');
    return ''
      + '<div class="actionsheet actionsheet--action" role="dialog" aria-modal="true" data-state="open">'
      +   '<div class="actionsheet__panel">'
      +     '<div class="actionsheet__header actionsheet__header--text">'
      +       '<div class="actionsheet__header-text">更多操作</div>'
      +     '</div>'
      +     '<div class="actionsheet__list">' + items + '</div>'
      +     '<div class="actionsheet__cancel-gap"></div>'
      +     '<div class="actionsheet__cancel" data-cancel="true">取消</div>'
      +   '</div>'
      + '</div>';
  }

  // ── 商品详情页模板 ──
  function buildDetailTemplate(product) {
    if (!product) return '<div class="album-detail-page"><div class="album-detail-page__body">商品信息缺失</div></div>';
    var hero = ''
      + '<div class="album-detail-page__hero">'
      +   '<div class="wg-image wg-image--rounded-lg">'
      +     '<img class="wg-image__src" src="' + escapeHtml(product.image) + '" alt="" />'
      +   '</div>'
      + '</div>';
    var tags = (product.tags || []).map(function (t) {
      return '<span class="tag tag--20 tag--gray"><span class="tag__label">' + escapeHtml(t) + '</span></span>';
    }).join('');
    var price = buildPriceHtml(product);
    var info = ''
      + '<div class="album-detail-page__section">'
      +   '<h2 class="album-detail-page__title">' + escapeHtml(product.title) + '</h2>'
      +   '<div class="album-detail-page__price-row">' + price + '</div>'
      +   (tags ? '<div class="album-detail-page__tags">' + tags + '</div>' : '')
      + '</div>';
    var attrs = ''
      + '<div class="album-detail-page__section">'
      +   '<ul class="album-detail-page__attr-list">'
      +     '<li class="album-detail-page__attr"><span class="album-detail-page__attr-label">面料</span><span class="album-detail-page__attr-value">优质面料</span></li>'
      +     '<li class="album-detail-page__attr"><span class="album-detail-page__attr-label">版型</span><span class="album-detail-page__attr-value">标准版型</span></li>'
      +     '<li class="album-detail-page__attr"><span class="album-detail-page__attr-label">尺码</span><span class="album-detail-page__attr-value">S / M / L / XL</span></li>'
      +     '<li class="album-detail-page__attr"><span class="album-detail-page__attr-label">产地</span><span class="album-detail-page__attr-value">中国</span></li>'
      +   '</ul>'
      + '</div>';
    var footer = ''
      + '<div class="album-detail-page__footer">'
      +   '<button type="button" class="btn btn--strong btn--lg album-detail-page__footer-action" data-contact-seller="true">联系店主</button>'
      + '</div>';
    return ''
      + '<div class="album-detail-page" data-bg="page">'
      +   '<nav class="navbar" data-bg="page">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-btn" data-back="true" aria-label="返回">'
      +           '<i class="wego-iconfont-s icon-fanhui16"></i>'
      +         '</button>'
      +       '</div>'
      +       '<div class="navbar__center"><span class="navbar__title">商品详情</span></div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</nav>'
      +   '<div class="album-detail-page__body">' + hero + info + attrs + '</div>'
      +   footer
      + '</div>';
  }

  // ── 图片查看器模板 ──
  function buildViewerTemplate(src) {
    return ''
      + '<div class="album-viewer-page" data-bg="page">'
      +   '<nav class="navbar navbar--fixed-transparent" data-bg="page">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-btn" data-close-viewer="true" aria-label="关闭">'
      +           '<i class="wego-iconfont-s icon-yuancha-mian"></i>'
      +         '</button>'
      +       '</div>'
      +       '<div class="navbar__center"></div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</nav>'
      +   '<div class="album-viewer-page__body">'
      +     '<div class="wg-image album-viewer-page__image">'
      +       '<img class="wg-image__src" src="' + escapeHtml(src) + '" alt="" />'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // ── 主页模板 ──
  function buildFeedTemplate() {
    var items = feedData.map(buildFeedItemHtml).join('');
    return ''
      + '<div class="album-feed-page">'
      +   '<div class="album-feed-page__topbar">'
      +     '<div class="album-feed-page__topbar-inner">'
      +       '<h1 class="album-feed-page__topbar-title">动态</h1>'
      +       '<div class="album-feed-page__search">'
      +         '<div class="searchbox searchbox--md searchbox--gray" data-search-box="true">'
      +           '<span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>'
      +           '<div class="searchbox__input"><span class="searchbox__placeholder">搜索商品</span></div>'
      +           '<div class="searchbox__actions">'
      +             '<button class="searchbox__action wego-iconfont-s icon-tupian" type="button" aria-label="选择图片" data-search-image="true"></button>'
      +           '</div>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="album-feed-page__list">' + items + '</div>'
      + '</div>';
  }

  // ── 交互绑定 ──
  function bindFeedInteractions(ctx) {
    var root = ctx.root;

    // 搜索框：图搜入口 stub
    var searchImg = root.querySelector('[data-search-image]');
    if (searchImg) {
      searchImg.addEventListener('click', function () {
        ctx.toast('图搜功能开发中');
      });
    }
    var searchBox = root.querySelector('[data-search-box]');
    if (searchBox) {
      searchBox.addEventListener('click', function () {
        ctx.toast('搜索功能开发中');
      });
    }

    // 图片点击看大图
    root.querySelectorAll('.album-feed-item__media-item .wg-image--clickable').forEach(function (el) {
      el.addEventListener('click', function () {
        var src = el.getAttribute('data-image-src');
        if (!src) return;
        window.__albumOpenViewer(src);
      });
    });

    // 商品详情入口
    root.querySelectorAll('[data-product-id]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var pid = el.getAttribute('data-product-id');
        window.__albumOpenProductDetail(pid);
      });
    });

    // 一键转发
    root.querySelectorAll('[data-forward-id]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var fid = el.getAttribute('data-forward-id');
        var item = feedData.find(function (d) { return d.id === fid; });
        ctx.toast('已转发：' + (item && item.product ? item.product.title.slice(0, 12) : '动态'));
      });
    });

    // 更多操作
    root.querySelectorAll('[data-more-actions]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var fid = el.getAttribute('data-more-actions');
        var item = feedData.find(function (d) { return d.id === fid; });
        if (!item) return;
        openMoreActions(ctx, item);
      });
    });
  }

  function openMoreActions(ctx, item) {
    var html = buildMoreActionsSheet(item);
    ctx.openSheet(html, {
      label: '更多操作',
      init: function (overlayCtx) {
        var panel = overlayCtx.root;
        panel.querySelectorAll('[data-action-id]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var actionId = btn.getAttribute('data-action-id');
            var label = btn.querySelector('.actionsheet__item-title').textContent;
            overlayCtx.close();
            // stub：只呈现入口与明确反馈，不下钻具体功能实现
            setTimeout(function () {
              ctx.toast(label + '功能开发中');
            }, 100);
          });
        });
        var cancel = panel.querySelector('[data-cancel]');
        if (cancel) {
          cancel.addEventListener('click', function () {
            overlayCtx.close();
          });
        }
      }
    });
  }

  function findProduct(pid) {
    for (var i = 0; i < feedData.length; i++) {
      if (feedData[i].product && feedData[i].product.id === pid) return feedData[i].product;
    }
    return null;
  }

  // ── 注册全局入口给 scene 内部使用（避免依赖 ctx.navigate 的 hash 路由）──
  window.__albumOpenProductDetail = function (pid) {
    if (window.WegoApp && window.WegoApp.navigate) {
      window.__albumPendingProductId = pid;
      window.WegoApp.navigate('album-product-detail');
    }
  };
  window.__albumOpenViewer = function (src) {
    if (window.WegoApp && window.WegoApp.navigate) {
      window.__albumPendingViewerSrc = src;
      window.WegoApp.navigate('album-image-viewer');
    }
  };

  // ── 注册场景 ──
  window.WegoApp.registerScene({
    routeId: 'album-feed',
    title: '动态',
    presentation: { type: 'host-tab', coversTabBar: true },
    template: buildFeedTemplate(),
    init: function (ctx) {
      bindFeedInteractions(ctx);
    }
  });

  window.WegoApp.registerScene({
    routeId: 'album-product-detail',
    title: '商品详情',
    presentation: { type: 'push', transition: 'slide-left', coversTabBar: true },
    template: '<div class="album-detail-page"><div class="album-detail-page__body">加载中</div></div>',
    init: function (ctx) {
      var pid = window.__albumPendingProductId;
      window.__albumPendingProductId = null;
      var product = findProduct(pid);
      ctx.root.innerHTML = buildDetailTemplate(product);
      var back = ctx.root.querySelector('[data-back]');
      if (back) back.addEventListener('click', function () { ctx.back(); });
      var contact = ctx.root.querySelector('[data-contact-seller]');
      if (contact) contact.addEventListener('click', function () {
        ctx.toast('联系店主功能开发中');
      });
    }
  });

  window.WegoApp.registerScene({
    routeId: 'album-image-viewer',
    title: '图片查看',
    presentation: { type: 'full-screen-modal', transition: 'slide-up', coversTabBar: true },
    template: '<div class="album-viewer-page"><div class="album-viewer-page__body">加载中</div></div>',
    init: function (ctx) {
      var src = window.__albumPendingViewerSrc;
      window.__albumPendingViewerSrc = null;
      ctx.root.innerHTML = buildViewerTemplate(src);
      var close = ctx.root.querySelector('[data-close-viewer]');
      if (close) close.addEventListener('click', function () { ctx.back(); });
    }
  });
})();
