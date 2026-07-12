(function () {
  var AVATAR = './lib/image/avatar-defult.png';

  var IMAGES = {
    c1_1: './lib/image/clothing/clothing_1/clothing_1_1.jpg',
    c1_2: './lib/image/clothing/clothing_1/clothing_1_2.jpg',
    c1_3: './lib/image/clothing/clothing_1/clothing_1_3.jpg',
    c3_1: './lib/image/clothing/clothing_3/1663741004077_80946.jpg',
    c3_2: './lib/image/clothing/clothing_3/1663741004076_83920.jpg',
    c3_3: './lib/image/clothing/clothing_3/1663741004076_70693.jpg',
    c3_4: './lib/image/clothing/clothing_3/1663741004075_93363.jpg',
    c3_5: './lib/image/clothing/clothing_3/1663741004074_59093.jpg',
    c3_6: './lib/image/clothing/clothing_3/1663741004073_84014.jpg',
    c4_1: './lib/image/clothing/clothing_4/1663741029868_65506.jpg',
    c4_2: './lib/image/clothing/clothing_4/1663741029867_34853.jpg',
    c5_1: './lib/image/clothing/clothing_5/1663741067253_12684.jpg',
    c5_2: './lib/image/clothing/clothing_5/1663741067252_48951.jpg',
    c7_1: './lib/image/clothing/clothing_7/1663741042726_75173.jpg',
    c7_2: './lib/image/clothing/clothing_7/1663741042725_25882.jpg',
    c10_1: './lib/image/clothing/clothing_10/1663740458802_8666.jpg',
    c12_1: './lib/image/clothing/clothing_12/1663741493021_53473.jpg',
    c14_1: './lib/image/clothing/clothing_14/1664276960210_50005.jpg'
  };

  var FEED_DATA = [
    {
      id: 1,
      author: '阿香女装批发',
      time: '2小时前',
      text: '',
      images: [IMAGES.c1_1],
      product: { id: 'p1', name: '春季新款法式碎花连衣裙', price: '89.00', image: IMAGES.c1_2, tags: ['秒杀'] },
      forwarded: false
    },
    {
      id: 2,
      author: '韩风女装工作室',
      time: '3小时前',
      text: '新品到货！春款连衣裙，面料柔软透气，版型修身显瘦，多色可选，欢迎咨询下单～',
      images: [IMAGES.c3_1, IMAGES.c3_2, IMAGES.c3_3, IMAGES.c3_4],
      product: { id: 'p2', name: '韩系温柔风针织开衫', price: '129.00', image: IMAGES.c3_5, tags: ['新品'] },
      forwarded: false
    },
    {
      id: 3,
      author: '杭州四季青直供',
      time: '5小时前',
      text: '',
      images: [
        IMAGES.c4_1, IMAGES.c4_2, IMAGES.c5_1,
        IMAGES.c5_2, IMAGES.c7_1, IMAGES.c7_2,
        IMAGES.c10_1, IMAGES.c12_1, IMAGES.c14_1
      ],
      product: { id: 'p3', name: '夏装短袖T恤宽松百搭', price: '39.90', image: IMAGES.c1_3, tags: ['清仓'] },
      forwarded: false
    },
    {
      id: 4,
      author: '小清新服饰',
      time: '昨天',
      text: '这条裙子真的太好看了！上身效果绝绝子，姐妹们冲～',
      images: [IMAGES.c3_6],
      product: { id: 'p4', name: '法式方领泡泡袖连衣裙', price: '158.00', image: IMAGES.c1_1, tags: ['热卖'] },
      forwarded: true
    },
    {
      id: 5,
      author: '优品女装批发城',
      time: '昨天',
      text: '秋冬新款羊毛大衣，质感满满，现货秒发！',
      images: [],
      product: { id: 'p5', name: '秋冬双面羊绒大衣中长款', price: '299.00', image: IMAGES.c1_2, tags: ['预售'] },
      forwarded: false
    },
    {
      id: 6,
      author: '广州十三行货源',
      time: '2天前',
      text: '一批高性价比货源，支持一件代发，质量有保障，长期合作优先！',
      images: [IMAGES.c1_3, IMAGES.c3_1],
      product: { id: 'p6', name: '2026春夏新款法式复古浪漫碎花雪纺连衣裙女气质收腰长裙', price: '99.00', image: IMAGES.c3_2, tags: ['秒杀', '包邮'] },
      forwarded: false
    }
  ];

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function splitPrice(price) {
    var parts = String(price).split('.');
    return {
      integer: parts[0] || '0',
      decimal: parts[1] ? '.' + parts[1] : '.00'
    };
  }

  function gridClass(count) {
    if (count === 1) return 'feed-item__images--grid-1';
    if (count >= 2 && count <= 4) return 'feed-item__images--grid-2';
    return 'feed-item__images--grid-3';
  }

  function renderTags(tags) {
    if (!tags || !tags.length) return '';
    return tags.map(function (tag) {
      return '<span class="tag tag--20 tag--promotion"><span class="tag__label">' + escapeHtml(tag) + '</span></span>';
    }).join('');
  }

  function renderImages(images) {
    if (!images || !images.length) return '';
    var cls = gridClass(images.length);
    var items = images.map(function (src, idx) {
      return '<div class="wg-image wg-image--rounded-md wg-image--clickable" data-image-index="' + idx + '">'
        + '<img class="wg-image__src is-loaded" src="' + src + '" alt="" />'
        + '</div>';
    }).join('');
    return '<div class="feed-item__images ' + cls + '">' + items + '</div>';
  }

  function renderProduct(product) {
    if (!product) return '';
    var priceParts = splitPrice(product.price);
    var tagsHtml = renderTags(product.tags);
    return '<div class="feed-item__product" data-action="product">'
      + '<div class="wg-image wg-image--rounded-sm feed-item__product-thumb">'
      + '<img class="wg-image__src is-loaded" src="' + product.image + '" alt="" />'
      + '</div>'
      + '<div class="feed-item__product-info">'
      + '<div class="feed-item__product-name">' + escapeHtml(product.name) + '</div>'
      + (tagsHtml ? '<div class="feed-item__product-tags">' + tagsHtml + '</div>' : '')
      + '<div class="metric metric--16 metric--marketing">'
      + '<div class="metric__main">'
      + '<span class="metric__symbol">¥</span>'
      + '<span class="metric__value">'
      + '<span class="metric__integer">' + escapeHtml(priceParts.integer) + '</span>'
      + '<span class="metric__decimal">' + escapeHtml(priceParts.decimal) + '</span>'
      + '</span>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  function renderFeedItem(item) {
    var headerHtml = '<div class="feed-item__header">'
      + '<div class="avatar avatar--image avatar--40">'
      + '<img src="' + AVATAR + '" alt="" />'
      + '</div>'
      + '<div class="feed-item__meta">'
      + '<div class="feed-item__name">' + escapeHtml(item.author) + '</div>'
      + '<div class="feed-item__time">' + escapeHtml(item.time) + '</div>'
      + '</div>'
      + '</div>';

    var textHtml = item.text
      ? '<div class="feed-item__text">' + escapeHtml(item.text) + '</div>'
      : '';

    var imagesHtml = renderImages(item.images);
    var productHtml = renderProduct(item.product);

    var forwardedClass = item.forwarded ? ' is-forwarded' : '';
    var forwardedLabel = item.forwarded ? '已转发' : '一键转发';
    var actionsHtml = '<div class="feed-item__actions">'
      + '<button type="button" class="btn btn--weak btn--sm' + forwardedClass + '" data-action="forward">'
      + '<i class="btn__icon wego-iconfont-s icon-fasongjiantou" aria-hidden="true"></i>'
      + forwardedLabel
      + '</button>'
      + '<button type="button" class="link" data-action="more">更多</button>'
      + '</div>';

    return '<article class="card card--surface feed-item" data-feed-id="' + item.id + '">'
      + '<div class="card__content">'
      + headerHtml
      + textHtml
      + imagesHtml
      + productHtml
      + actionsHtml
      + '</div>'
      + '</article>';
  }

  var template = ''
    + '<div class="dongtai-feed">'
    + '<nav class="navbar host-dongtai-navbar">'
    + '<div class="navbar__body">'
    + '<div class="navbar__center navbar__center--wide">'
    + '<span class="navbar__title">动态</span>'
    + '</div>'
    + '<div class="navbar__right navbar__right--icon">'
    + '<button type="button" class="navbar__action" data-action="search" aria-label="搜索">'
    + '<span class="navbar__action-icon"><i class="wego-iconfont-s icon-sousuo" aria-hidden="true"></i></span>'
    + '<span class="navbar__action-label">搜索</span>'
    + '</button>'
    + '</div>'
    + '</div>'
    + '</nav>'
    + '<div class="dongtai-feed__list"></div>'
    + '</div>';

  function init(ctx) {
    var root = ctx.root;
    var state = ctx.state;
    var feed = root.querySelector('.dongtai-feed');
    var listEl = root.querySelector('.dongtai-feed__list');

    if (!state.feedData) {
      state.feedData = FEED_DATA.map(function (item) {
        return Object.assign({}, item);
      });
    }

    function renderList() {
      listEl.innerHTML = state.feedData.map(renderFeedItem).join('');
    }

    renderList();

    // ── 事件委托 ──
    listEl.addEventListener('click', function (e) {
      var target = e.target;

      // 图片点击 → image-viewer
      var imageEl = target.closest('.wg-image--clickable');
      if (imageEl && imageEl.closest('.feed-item__images')) {
        var img = imageEl.querySelector('.wg-image__src');
        if (img) {
          openImageViewer(ctx, img.src);
        }
        return;
      }

      // 产品摘要卡点击 → product-detail
      var productEl = target.closest('[data-action="product"]');
      if (productEl) {
        var feedItemEl = productEl.closest('[data-feed-id]');
        var feedId = feedItemEl ? parseInt(feedItemEl.dataset.feedId, 10) : null;
        var feedItem = state.feedData.find(function (it) { return it.id === feedId; });
        if (feedItem && feedItem.product) {
          state.selectedProduct = feedItem.product;
          ctx.navigate('product-detail');
        }
        return;
      }

      // 一键转发
      var forwardBtn = target.closest('[data-action="forward"]');
      if (forwardBtn) {
        e.preventDefault();
        var fiEl = forwardBtn.closest('[data-feed-id]');
        var fid = fiEl ? parseInt(fiEl.dataset.feedId, 10) : null;
        var item = state.feedData.find(function (it) { return it.id === fid; });
        if (item) {
          item.forwarded = !item.forwarded;
          if (item.forwarded) {
            forwardBtn.classList.add('is-forwarded');
            forwardBtn.lastChild.textContent = '已转发';
            ctx.toast('已转发');
          } else {
            forwardBtn.classList.remove('is-forwarded');
            forwardBtn.lastChild.textContent = '一键转发';
            ctx.toast('已取消转发');
          }
        }
        return;
      }

      // 更多 → actionsheet
      var moreBtn = target.closest('[data-action="more"]');
      if (moreBtn) {
        e.preventDefault();
        openActionsheet(ctx, feed);
        return;
      }
    });

    // 搜索入口
    var searchBtn = root.querySelector('[data-action="search"]');
    if (searchBtn) {
      searchBtn.addEventListener('click', function () {
        ctx.toast('搜索功能开发中');
      });
    }
  }

  function openImageViewer(ctx, imgSrc) {
    var template = ''
      + '<div class="image-viewer" data-bg="surface">'
      + '<img class="image-viewer__img" src="' + imgSrc + '" alt="" />'
      + '<button type="button" class="image-viewer__close" aria-label="关闭">'
      + '<i class="wego-iconfont-s icon-guanbi" aria-hidden="true"></i>'
      + '</button>'
      + '</div>';
    ctx.openModal(template, {
      label: '查看大图',
      init: function (modalCtx) {
        var root = modalCtx.root;
        var viewer = root.querySelector('.image-viewer');
        if (!viewer) return;
        viewer.addEventListener('click', function (e) {
          if (e.target === viewer || e.target.closest('.image-viewer__close')) {
            modalCtx.close();
          }
        });
      }
    });
  }

  var ACTIONSHEET_TEMPLATE = ''
    + '<div class="actionsheet actionsheet--action" data-state="open" role="dialog" aria-modal="true">'
    + '<div class="actionsheet__panel">'
    + '<div class="actionsheet__list">'
    + '<button type="button" class="actionsheet__item" data-sheet-action="copy-text">'
    + '<div class="actionsheet__item-main"><div class="actionsheet__item-title">复制文案</div></div>'
    + '</button>'
    + '<button type="button" class="actionsheet__item" data-sheet-action="share">'
    + '<div class="actionsheet__item-main"><div class="actionsheet__item-title">分享</div></div>'
    + '</button>'
    + '<button type="button" class="actionsheet__item" data-sheet-action="favorite">'
    + '<div class="actionsheet__item-main"><div class="actionsheet__item-title">收藏</div></div>'
    + '</button>'
    + '<button type="button" class="actionsheet__item" data-sheet-action="download">'
    + '<div class="actionsheet__item-main"><div class="actionsheet__item-title">下载图片</div></div>'
    + '</button>'
    + '<button type="button" class="actionsheet__item" data-sheet-action="edit">'
    + '<div class="actionsheet__item-main"><div class="actionsheet__item-title">编辑</div></div>'
    + '</button>'
    + '<button type="button" class="actionsheet__item" data-sheet-action="copy-feed">'
    + '<div class="actionsheet__item-main"><div class="actionsheet__item-title">复制动态</div></div>'
    + '</button>'
    + '</div>'
    + '<div class="actionsheet__cancel-gap"></div>'
    + '<button type="button" class="actionsheet__cancel">取消</button>'
    + '<div class="actionsheet__safe-area"></div>'
    + '</div>'
    + '</div>';

  var SHEET_ACTION_TOAST = {
    'copy-text': '已复制文案',
    'share': '已分享',
    'favorite': '已收藏',
    'download': '已保存图片',
    'edit': '编辑功能开发中',
    'copy-feed': '已复制动态'
  };

  function openActionsheet(ctx, container) {
    // 移除已有的 actionsheet
    var existing = container.querySelector('.actionsheet');
    if (existing) existing.remove();

    container.insertAdjacentHTML('beforeend', ACTIONSHEET_TEMPLATE);
    var sheet = container.querySelector('.actionsheet:last-child');
    if (!sheet) return;

    function close() {
      if (!sheet || !sheet.parentNode) return;
      sheet.setAttribute('data-state', 'closed');
      var onEnd = function () {
        sheet.removeEventListener('transitionend', onEnd);
        if (sheet.parentNode) sheet.parentNode.removeChild(sheet);
      };
      sheet.addEventListener('transitionend', onEnd);
      // 兜底移除
      setTimeout(function () {
        if (sheet && sheet.parentNode) sheet.parentNode.removeChild(sheet);
      }, 400);
    }

    sheet.addEventListener('click', function (e) {
      // 点击遮罩关闭
      if (e.target === sheet) {
        close();
        return;
      }
      // 取消按钮
      if (e.target.closest('.actionsheet__cancel')) {
        close();
        return;
      }
      // 操作项
      var item = e.target.closest('[data-sheet-action]');
      if (item) {
        var action = item.dataset.sheetAction;
        close();
        var msg = SHEET_ACTION_TOAST[action] || '操作完成';
        ctx.toast(msg);
      }
    });
  }

  window.WegoApp.registerScene({
    routeId: 'dongtai-feed',
    title: '动态',
    presentation: { type: 'host-tab', coversTabBar: false },
    template: template,
    init: init
  });
})();
