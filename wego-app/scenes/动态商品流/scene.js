(function () {
  'use strict';

  // ===== 本地模拟数据 =====
  // 发布者数据
  var AUTHORS = {
    taotao: { name: '小桃优选', initials: '桃' },
    youyi: { name: '优衣美阁', initials: '优' },
    hanfeng: { name: '韩风衣橱', initials: '韩' },
    mianma: { name: '棉麻记', initials: '棉' }
  };

  // 产品数据
  var PRODUCTS = {
    p1: {
      id: 'p1',
      name: '法式复古碎花连衣裙 春秋新款收腰长袖气质长裙',
      price: { low: 12800, high: 15800, line: null },
      image: './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg',
      attrs: [
        { label: '面料', value: '雪纺 + 内衬' },
        { label: '颜色', value: '杏色碎花 / 黑底白花 / 茶绿碎花' },
        { label: '尺码', value: 'S / M / L / XL' },
        { label: '产地', value: '杭州' }
      ]
    },
    p2: {
      id: 'p2',
      name: '春秋新款针织开衫女宽松外套百搭短款',
      price: { low: 8900, high: null, line: 12900 },
      image: './lib/assets/image/clothing/clothing_2/clothing_2_1.jpg.jpg',
      attrs: [
        { label: '面料', value: '55% 棉 + 45% 腈纶' },
        { label: '颜色', value: '米白 / 燕麦 / 雾蓝 / 奶咖' },
        { label: '尺码', value: '均码（80-130斤）' }
      ]
    },
    p3: {
      id: 'p3',
      name: '高腰直筒牛仔裤女显瘦长裤宽松阔腿裤',
      price: { low: 16800, high: null, line: null },
      image: './lib/assets/image/clothing/clothing_3/1663740989357_27184.jpg',
      attrs: [
        { label: '面料', value: '棉麻混纺（微弹）' },
        { label: '颜色', value: '浅蓝 / 深蓝 / 黑色' },
        { label: '尺码', value: 'S / M / L / XL / XXL' },
        { label: '版型', value: '高腰直筒，裤长 105cm' }
      ]
    },
    p4: {
      id: 'p4',
      name: '简约基础款白衬衫女长袖通勤商务OL职业衬衫',
      price: { low: 9900, high: null, line: null },
      image: './lib/assets/image/clothing/clothing_4/1663741015639_25492.jpg',
      attrs: [
        { label: '面料', value: '纯棉 40 支' },
        { label: '颜色', value: '本白 / 浅蓝' },
        { label: '尺码', value: 'S / M / L / XL' }
      ]
    },
    p5: {
      id: 'p5',
      name: '文艺棉麻宽松半身裙女春秋中长款百搭A字裙',
      price: { low: 11800, high: 13800, line: null },
      image: './lib/assets/image/clothing/clothing_5/1663741055068_1251.jpg',
      attrs: [
        { label: '面料', value: '55% 棉 + 45% 亚麻' },
        { label: '颜色', value: '燕麦 / 茶绿 / 藕粉 / 雾灰' },
        { label: '尺码', value: 'S / M / L' },
        { label: '裙长', value: '中长款 75cm' }
      ]
    }
  };

  // 动态数据：覆盖两种形态 + 边界情况（文字为空、图片数量不同、产品信息较长）
  var FEEDS = [
    {
      id: 'f1',
      author: AUTHORS.taotao,
      time: '2 分钟前',
      text: '今天到货的新款法式碎花裙，版型超好，颜色显白，喜欢的姐妹私信我～',
      images: [
        './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg',
        './lib/assets/image/clothing/clothing_1/clothing_1_2.jpg',
        './lib/assets/image/clothing/clothing_1/clothing_1_3.jpg'
      ],
      product: PRODUCTS.p1
    },
    {
      id: 'f2',
      author: AUTHORS.youyi,
      time: '15 分钟前',
      text: '',
      images: [
        './lib/assets/image/clothing/clothing_2/clothing_2_1.jpg.jpg'
      ],
      product: PRODUCTS.p2
    },
    {
      id: 'f3',
      author: AUTHORS.hanfeng,
      time: '1 小时前',
      text: '春秋必备的针织开衫，柔软亲肤，多色可选，春秋冬三季都能穿。',
      images: [
        './lib/assets/image/clothing/clothing_2/clothing_2_2.jpg',
        './lib/assets/image/clothing/clothing_2/clothing_2_3.jpg.jpg',
        './lib/assets/image/clothing/clothing_2/clothing_2_4.jpg.jpg',
        './lib/assets/image/clothing/clothing_2/clothing_2_5.jpg.jpg',
        './lib/assets/image/clothing/clothing_2/clothing_2_6.jpg.jpg'
      ],
      product: PRODUCTS.p2
    },
    {
      id: 'f4',
      author: AUTHORS.mianma,
      time: '3 小时前',
      text: '经典白衬衫，简约百搭，面料舒服到不想脱。',
      images: [
        './lib/assets/image/clothing/clothing_4/1663741015639_25492.jpg',
        './lib/assets/image/clothing/clothing_4/1663741015639_94460.jpg'
      ],
      product: PRODUCTS.p4
    },
    {
      id: 'f5',
      author: AUTHORS.taotao,
      time: '昨天 22:30',
      text: '',
      images: [
        './lib/assets/image/clothing/clothing_5/1663741055068_1251.jpg',
        './lib/assets/image/clothing/clothing_5/1663741055070_59070.jpg',
        './lib/assets/image/clothing/clothing_5/1663741055070_91047.jpg',
        './lib/assets/image/clothing/clothing_5/1663741055071_7270.jpg',
        './lib/assets/image/clothing/clothing_5/1663741055072_60369.jpg',
        './lib/assets/image/clothing/clothing_5/1663741055072_69717.jpg'
      ],
      product: PRODUCTS.p5
    },
    {
      id: 'f6',
      author: AUTHORS.hanfeng,
      time: '昨天 18:10',
      text: '高腰显瘦直筒牛仔裤，棉麻混纺有弹力，覆盖通勤、约会、逛街等多场合穿搭需求，版型经过多次调整，上身效果非常好看。',
      images: [
        './lib/assets/image/clothing/clothing_3/1663740989357_27184.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989357_63074.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989358_96529.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989359_87304.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989360_60487.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989360_70845.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989361_76334.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989362_46872.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989363_87642.jpg'
      ],
      product: PRODUCTS.p3
    },
    {
      id: 'f7',
      author: AUTHORS.mianma,
      time: '前天 20:00',
      text: '棉麻半身裙，文艺范儿，宽松舒适。',
      images: [
        './lib/assets/image/clothing/clothing_5/1663741067247_74948.jpg',
        './lib/assets/image/clothing/clothing_5/1663741067248_49998.jpg',
        './lib/assets/image/clothing/clothing_5/1663741067248_80102.jpg',
        './lib/assets/image/clothing/clothing_5/1663741067249_22733.jpg'
      ],
      product: PRODUCTS.p5
    }
  ];

  // ===== 辅助函数 =====

  // 金额（分）→ 显示字符串
  function formatPrice(cents) {
    var yuan = (cents / 100).toFixed(2);
    return yuan;
  }

  // 渲染 wg-image：动态生成时 img 需监听 load 添加 is-loaded
  function wgImageMarkup(src, alt) {
    return ''
      + '<div class="wg-image wg-image--rounded-md">'
      +   '<img class="wg-image__src" src="' + src + '" alt="' + (alt || '') + '" />'
      + '</div>';
  }

  // 渲染 metric 价格（单值 / 区间 / 划线价）
  function metricPriceMarkup(price) {
    var html = '<span class="metric metric--16 metric--marketing metric--wrap">';
    html += '<span class="metric__main">';
    html += '<span class="metric__symbol">¥</span>';
    html += '<span class="metric__value"><span class="metric__integer">' + formatPrice(price.low) + '</span></span>';
    if (price.high) {
      html += '<span class="metric__range-sep">~</span>';
      html += '<span class="metric__value metric__value--high"><span class="metric__integer">' + formatPrice(price.high) + '</span></span>';
    }
    html += '</span>';
    if (price.line) {
      html += '<span class="metric__line">¥' + formatPrice(price.line) + '</span>';
    }
    html += '</span>';
    return html;
  }

  // 渲染图片网格
  function imageGridMarkup(images) {
    if (!images || images.length === 0) return '';
    var cls = 'feed-item__media';
    if (images.length === 1) {
      cls += ' feed-item__media--single';
    } else if (images.length <= 4) {
      cls += ' feed-item__media--grid-2';
    } else {
      cls += ' feed-item__media--grid-3';
    }
    var html = '<div class="' + cls + '">';
    images.forEach(function (src, idx) {
      html += ''
        + '<div class="feed-item__image" data-image-index="' + idx + '">'
        +   wgImageMarkup(src, '动态图片 ' + (idx + 1))
        + '</div>';
    });
    html += '</div>';
    return html;
  }

  // 渲染产品摘要
  function productSummaryMarkup(product) {
    if (!product) return '';
    return ''
      + '<div class="card card--outlined feed-item__product" data-product-id="' + product.id + '">'
      +   '<div class="feed-item__product-image">'
      +     wgImageMarkup(product.image, product.name)
      +   '</div>'
      +   '<div class="feed-item__product-info">'
      +     '<div class="feed-item__product-name">' + product.name + '</div>'
      +     '<div class="feed-item__product-meta">'
      +       metricPriceMarkup(product.price)
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // 渲染单条动态
  function feedItemMarkup(feed) {
    var html = '<article class="card card--surface feed-item" data-feed-id="' + feed.id + '">';
    // 发布者区
    html += ''
      + '<div class="feed-item__author">'
      +   '<div class="avatar avatar--40 avatar--initials">' + feed.author.initials + '</div>'
      +   '<div class="feed-item__author-meta">'
      +     '<div class="feed-item__author-name">' + feed.author.name + '</div>'
      +     '<div class="feed-item__author-time">' + feed.time + '</div>'
      +   '</div>'
      + '</div>';
    // 正文区（为空时不渲染）
    if (feed.text) {
      html += '<div class="feed-item__text">' + feed.text + '</div>';
    }
    // 图片媒体区（数量为 0 时不渲染）
    if (feed.images && feed.images.length > 0) {
      html += imageGridMarkup(feed.images);
    }
    // 产品摘要区
    if (feed.product) {
      html += productSummaryMarkup(feed.product);
    }
    // 操作收口区
    html += ''
      + '<div class="feed-item__actions">'
      +   '<div class="feed-item__actions-left">'
      +     '<button type="button" class="link feed-item__more-btn" data-action="more">更多</button>'
      +   '</div>'
      +   '<div class="feed-item__actions-right">'
      +     '<button type="button" class="link feed-item__favorite-btn" data-action="favorite">'
      +         '<span class="feed-item__favorite-icon iconfont icon-shoucang" aria-hidden="true"></span>'
      +       '<span>收藏</span>'
      +     '</button>'
      +     '<button type="button" class="link feed-item__forward-btn" data-action="forward">一键转发</button>'
      +   '</div>'
      + '</div>';
    html += '</article>';
    return html;
  }

  // 动态流页面模板
  var feedTemplate = ''
    + '<div class="feed-page" data-bg="page">'
    +   '<nav class="navbar" data-bg="surface">'
    +     '<div class="navbar__body">'
    +       '<div class="navbar__left"></div>'
    +       '<div class="navbar__center"><span class="navbar__title">动态</span></div>'
    +       '<div class="navbar__right navbar__right--text">'
    +         '<div class="navbar__action navbar__action--text" data-action="search">'
    +           '<span class="navbar__action-label">搜索</span>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</nav>'
    +   '<div class="feed-stream" data-feed-list></div>'
    + '</div>';

  // ===== 动态流 init =====
  function initFeed(ctx) {
    var root = ctx.root;
    var listEl = root.querySelector('[data-feed-list]');
    if (!listEl) return;

    // 渲染动态列表
    var html = '';
    FEEDS.forEach(function (feed) {
      html += feedItemMarkup(feed);
    });
    listEl.innerHTML = html;

    // 为动态生成的 wg-image 绑定 load 事件，添加 is-loaded
    bindImageLoad(listEl);

    // 绑定交互
    bindFeedInteractions(ctx, listEl);
  }

  // 为容器内所有 wg-image 的 img 绑定 load 事件
  function bindImageLoad(container) {
    var imgs = container.querySelectorAll('img.wg-image__src:not(.is-loaded)');
    imgs.forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('is-loaded');
      } else {
        img.addEventListener('load', function () {
          img.classList.add('is-loaded');
        });
        img.addEventListener('error', function () {
          var wgImage = img.closest('.wg-image');
          if (wgImage) {
            wgImage.classList.add('wg-image--error');
            var placeholder = document.createElement('div');
            placeholder.className = 'wg-image__placeholder';
            var phIcon = document.createElement('img');
            phIcon.className = 'wg-image__placeholder-icon';
            phIcon.src = './lib/assets/icons/default-diagram.svg';
            phIcon.alt = '';
            placeholder.appendChild(phIcon);
            wgImage.appendChild(placeholder);
          }
        });
      }
    });
  }

  // 绑定动态流交互
  function bindFeedInteractions(ctx, container) {
    // 使用事件委托处理动态项内的交互
    container.addEventListener('click', function (event) {
      var target = event.target;
      if (!target) return;

      // 图片点击看大图
      var imageEl = target.closest('.feed-item__image');
      if (imageEl) {
        var feedEl = imageEl.closest('.feed-item');
        var feedId = feedEl && feedEl.dataset.feedId;
        var feed = FEEDS.find(function (f) { return f.id === feedId; });
        if (feed) {
          var idx = parseInt(imageEl.dataset.imageIndex, 10) || 0;
          var src = feed.images[idx];
          openImageViewer(ctx, src);
        }
        return;
      }

      // 产品摘要点击 → 进入产品详情
      var productEl = target.closest('.feed-item__product');
      if (productEl) {
        var productId = productEl.dataset.productId;
        if (productId && PRODUCTS[productId]) {
          // 通过 appState.sceneState 传递产品数据给子场景
          ctx.appState.sceneState['product-detail'] = ctx.appState.sceneState['product-detail'] || {};
          ctx.appState.sceneState['product-detail'].product = PRODUCTS[productId];
          ctx.navigate('product-detail');
        }
        return;
      }

      // 操作按钮
      var actionEl = target.closest('[data-action]');
      if (actionEl) {
        var action = actionEl.dataset.action;
        var itemEl = actionEl.closest('.feed-item');
        var fid = itemEl && itemEl.dataset.feedId;

        if (action === 'forward') {
          ctx.toast('已加入转发队列');
          return;
        }
        if (action === 'favorite') {
          toggleFavorite(actionEl);
          var isFav = actionEl.classList.contains('is-favorited');
          ctx.toast(isFav ? '已收藏' : '已取消收藏');
          return;
        }
        if (action === 'more') {
          openMoreActions(ctx, fid);
          return;
        }
      }
    });

    // 搜索按钮（navbar 在 root 内但不在 feed-stream 内，单独绑定）
    var searchEl = ctx.root.querySelector('[data-action="search"]');
    if (searchEl) {
      searchEl.addEventListener('click', function () {
        ctx.toast('搜索功能开发中');
      });
    }
  }

  // 切换收藏状态
  function toggleFavorite(btn) {
    btn.classList.toggle('is-favorited');
    var labelEl = btn.querySelector('span:last-child');
    if (labelEl) {
      labelEl.textContent = btn.classList.contains('is-favorited') ? '已收藏' : '收藏';
    }
  }

  // 打开更多操作 actionsheet
  function openMoreActions(ctx, feedId) {
    var items = ['复制文案', '分享', '下载图片', '编辑', '复制动态'];
    // overlay 架构下只提供 .actionsheet__panel 及其子内容，遮罩与定位由 .app-overlay-layer--sheet 承担
    var html = ''
      + '<div class="actionsheet__panel">'
      +   '<div class="actionsheet__list">';
    items.forEach(function (name, idx) {
      html += ''
        + '<button type="button" class="actionsheet__item" data-more-action="' + idx + '">'
        +   '<div class="actionsheet__item-main">'
        +     '<div class="actionsheet__item-title">' + name + '</div>'
        +   '</div>'
        + '</button>';
    });
    html += ''
      +   '</div>'
      +   '<div class="actionsheet__cancel-gap"></div>'
      +   '<button type="button" class="actionsheet__cancel">取消</button>'
      + '</div>';

    ctx.openSheet(html, {
      label: '更多操作',
      init: function (overlayCtx) {
        var panel = overlayCtx.root;
        // 选项点击
        var itemEls = panel.querySelectorAll('[data-more-action]');
        itemEls.forEach(function (el) {
          el.addEventListener('click', function () {
            var idx = parseInt(el.dataset.moreAction, 10);
            var name = items[idx];
            overlayCtx.close();
            overlayCtx.toast(name + ' · 已执行（stub）');
          });
        });
        // 取消按钮
        var cancelBtn = panel.querySelector('.actionsheet__cancel');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', function () {
            overlayCtx.close();
          });
        }
      }
    });
  }

  // 打开图片查看器（full-screen-modal）
  function openImageViewer(ctx, src) {
    var html = ''
      + '<div class="image-viewer" data-bg="inverse">'
      +   '<button type="button" class="image-viewer__close" aria-label="关闭">×</button>'
      +   '<img class="image-viewer__image" src="' + src + '" alt="图片大图" />'
      + '</div>';

    ctx.openFullScreenModal(html, {
      label: '图片查看',
      init: function (overlayCtx) {
        var panel = overlayCtx.root;
        // 点击任意位置关闭
        panel.addEventListener('click', function () {
          overlayCtx.close();
        });
      }
    });
  }

  // ===== 产品详情页 =====
  function productDetailTemplate(product) {
    var html = ''
      + '<div class="product-detail-page" data-bg="surface">'
      +   '<nav class="navbar" data-bg="surface">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<div class="navbar__left-btn" data-action="back" role="button" aria-label="返回">'
      +           '<i class="wego-iconfont-s icon-fanhui" aria-hidden="true"></i>'
      +         '</div>'
      +       '</div>'
      +       '<div class="navbar__center"><span class="navbar__title">产品详情</span></div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</nav>'
      +   '<div class="product-detail__body">'
      +     '<div class="product-detail__hero">'
      +       wgImageMarkup(product.image, product.name)
      +     '</div>'
      +     '<div class="card card--surface product-detail__section">'
      +       '<div class="product-detail__title">' + product.name + '</div>'
      +       '<div class="product-detail__price-row">'
      +         metricPriceMarkup(product.price)
      +       '</div>'
      +     '</div>';
    if (product.attrs && product.attrs.length > 0) {
      html += '<div class="card card--surface product-detail__section">';
      html += '<div class="product-detail__attrs">';
      product.attrs.forEach(function (attr) {
        html += ''
          + '<div class="product-detail__attr-row">'
          +   '<div class="product-detail__attr-label">' + attr.label + '</div>'
          +   '<div class="product-detail__attr-value">' + attr.value + '</div>'
          + '</div>';
      });
      html += '</div></div>';
    }
    html += ''
      +   '</div>'
      +   '<div class="product-detail__action-bar">'
      +     '<button type="button" class="btn btn--strong btn--md" data-action="forward">一键转发</button>'
      +   '</div>'
      + '</div>';
    return html;
  }

  function initProductDetail(ctx) {
    var root = ctx.root;
    var productData = ctx.appState.sceneState['product-detail'] && ctx.appState.sceneState['product-detail'].product;
    if (!productData) {
      // 兜底：用第一个产品
      productData = PRODUCTS.p1;
    }
    root.innerHTML = productDetailTemplate(productData);

    // 绑定图片 load
    bindImageLoad(root);

    // 返回按钮
    var backBtn = root.querySelector('[data-action="back"]');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        ctx.back();
      });
    }

    // 一键转发
    var forwardBtn = root.querySelector('[data-action="forward"]');
    if (forwardBtn) {
      forwardBtn.addEventListener('click', function () {
        ctx.toast('已加入转发队列');
      });
    }
  }

  // ===== 注册场景 =====
  window.WegoApp.registerScene({
    routeId: 'dongtai-feed',
    title: '动态',
    presentation: { type: 'host-tab' },
    template: feedTemplate,
    init: initFeed
  });

  window.WegoApp.registerScene({
    routeId: 'product-detail',
    title: '产品详情',
    presentation: { type: 'push', transition: 'slide-left-enter, slide-right-exit', coversTabBar: true },
    template: '',
    init: initProductDetail
  });
})();
