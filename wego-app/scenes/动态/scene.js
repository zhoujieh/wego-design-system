(function () {
  'use strict';

  // ── 图片辅助 ──
  function imgUrl(prompt, size) {
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
      encodeURIComponent(prompt) + '&image_size=' + size;
  }

  var AVATAR = './lib/assets/image/avatar-defult.png';

  // ── 模拟数据 ──
  var followedShops = [
    { id: 'shop-1', name: '手作时光', avatar: AVATAR, unread: true },
    { id: 'shop-2', name: '棉麻生活', avatar: AVATAR, unread: true },
    { id: 'shop-3', name: '多肉花园', avatar: AVATAR, unread: false },
    { id: 'shop-4', name: '陶瓷工坊', avatar: AVATAR, unread: false },
    { id: 'shop-5', name: '茶香记', avatar: AVATAR, unread: true },
    { id: 'shop-6', name: '布衣坊', avatar: AVATAR, unread: false }
  ];

  var feeds = [
    {
      id: 'feed-1',
      shop: { id: 'shop-1', name: '手作时光', avatar: AVATAR },
      timeText: '2小时前',
      tag: '上新',
      text: '新烧了一批抹茶绿色的茶杯，釉色温润，手感很好。每一只都略有不同，这就是手作的温度。',
      image: imgUrl('handmade ceramic tea cup on wooden table, warm lighting, minimal lifestyle photography', 'landscape_4_3'),
      product: {
        id: 'product-1',
        name: '手作抹茶绿釉茶杯',
        image: imgUrl('handmade ceramic mug product photo on pure white background, studio lighting', 'square_hd'),
        priceInt: '68',
        priceDec: ''
      },
      liked: false,
      likeCount: 32,
      commentCount: 5,
      shareCount: 2,
      comments: [
        { name: '小美', text: '好喜欢这个釉色！' },
        { name: '茶客', text: '容量多大呀？' },
        { name: '手作时光', text: '@茶客 220ml 左右哦' }
      ]
    },
    {
      id: 'feed-2',
      shop: { id: 'shop-2', name: '棉麻生活', avatar: AVATAR },
      timeText: '5小时前',
      tag: '',
      text: '秋冬新款棉麻围巾到货了，天然植物染色，亲肤透气。有三色可选：米白、灰蓝、暖棕。',
      image: imgUrl('folded cotton linen scarf in natural colors on white table, product lifestyle photo', 'landscape_4_3'),
      product: null,
      liked: true,
      likeCount: 58,
      commentCount: 12,
      shareCount: 8,
      comments: [
        { name: '暖暖', text: '灰蓝色好好看' },
        { name: '简约控', text: '求链接！' }
      ]
    },
    {
      id: 'feed-3',
      shop: { id: 'shop-5', name: '茶香记', avatar: AVATAR },
      timeText: '昨天',
      tag: '推荐',
      text: '今年新到的白茶，入口清甜，回甘悠长。适合慢慢品味。',
      image: null,
      product: {
        id: 'product-2',
        name: '2026年白毫银针 50g',
        image: imgUrl('dried white tea leaves in glass cup product photo on white background', 'square_hd'),
        priceInt: '128',
        priceDec: '50'
      },
      liked: false,
      likeCount: 15,
      commentCount: 3,
      shareCount: 1,
      comments: [
        { name: '茶友', text: '白毫银针好茶！' }
      ]
    }
  ];

  // ── HTML 辅助 ──
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function shopItemHtml(shop) {
    var badge = shop.unread ? '<span class="badge badge--dot badge--corner"></span>' : '';
    return ''
      + '<button type="button" class="dongtai-feed__shop-item" data-action="shop-entry" data-shop-id="' + shop.id + '">'
      +   '<div class="dongtai-feed__shop-avatar">'
      +     '<div class="avatar avatar--image avatar--40"><img src="' + shop.avatar + '" alt="' + esc(shop.name) + '" /></div>'
      +     badge
      +   '</div>'
      +   '<span class="dongtai-feed__shop-name">' + esc(shop.name) + '</span>'
      + '</button>';
  }

  function productCardHtml(product) {
    var decimal = product.priceDec ? '<span class="metric__decimal">.' + product.priceDec + '</span>' : '';
    return ''
      + '<button type="button" class="feed-item__product card card--surface" data-action="product-entry" data-product-id="' + product.id + '">'
      +   '<div class="feed-item__product-image wg-image">'
      +     '<img class="wg-image__src" src="' + product.image + '" alt="" />'
      +   '</div>'
      +   '<div class="feed-item__product-info">'
      +     '<div class="feed-item__product-name">' + esc(product.name) + '</div>'
      +     '<div class="metric metric--16 metric--marketing">'
      +       '<span class="metric__main">'
      +         '<span class="metric__symbol">¥</span>'
      +         '<span class="metric__value"><span class="metric__integer">' + product.priceInt + '</span>' + decimal + '</span>'
      +       '</span>'
      +     '</div>'
      +   '</div>'
      + '</button>';
  }

  function feedItemHtml(feed) {
    var tagHtml = feed.tag
      ? '<span class="tag tag--20 tag--brand-stroke"><span class="tag__label">' + esc(feed.tag) + '</span></span>'
      : '';
    var imageHtml = feed.image
      ? '<div class="feed-item__image wg-image wg-image--rounded-md"><img class="wg-image__src" src="' + feed.image + '" alt="" /></div>'
      : '';
    var productHtml = feed.product ? productCardHtml(feed.product) : '';

    return ''
      + '<article class="feed-item card card--surface" data-feed-id="' + feed.id + '">'
      +   '<div class="feed-item__header">'
      +     '<button type="button" class="feed-item__author" data-action="shop-entry" data-shop-id="' + feed.shop.id + '">'
      +       '<div class="avatar avatar--image avatar--40"><img src="' + feed.shop.avatar + '" alt="' + esc(feed.shop.name) + '" /></div>'
      +       '<div class="feed-item__author-info">'
      +         '<div class="feed-item__author-name">' + esc(feed.shop.name) + '</div>'
      +         '<div class="feed-item__time">' + esc(feed.timeText) + '</div>'
      +       '</div>'
      +     '</button>'
      +     tagHtml
      +   '</div>'
      +   (feed.text ? '<div class="feed-item__text">' + esc(feed.text) + '</div>' : '')
      +   imageHtml
      +   productHtml
      +   '<div class="feed-item__actions">'
      +     '<button type="button" class="feed-item__action feed-item__like-btn' + (feed.liked ? ' is-liked' : '') + '" data-action="like" data-feed-id="' + feed.id + '">'
      +       '<i class="feed-item__action-icon wego-iconfont-s ' + (feed.liked ? 'icon-aixin-mian' : 'icon-aixin') + '"></i>'
      +       '<span class="feed-item__action-count">' + feed.likeCount + '</span>'
      +     '</button>'
      +     '<button type="button" class="feed-item__action feed-item__comment-btn" data-action="comment" data-feed-id="' + feed.id + '">'
      +       '<i class="feed-item__action-icon wego-iconfont-s icon-xiaoxi1"></i>'
      +       '<span class="feed-item__action-count">' + feed.commentCount + '</span>'
      +     '</button>'
      +     '<button type="button" class="feed-item__action feed-item__share-btn" data-action="share" data-feed-id="' + feed.id + '">'
      +       '<i class="feed-item__action-icon wego-iconfont-s icon-fenxiang"></i>'
      +       '<span class="feed-item__action-count">' + feed.shareCount + '</span>'
      +     '</button>'
      +   '</div>'
      + '</article>';
  }

  // ── 图片加载 ──
  function bindImageLoad(root) {
    var imgs = root.querySelectorAll('.wg-image__src');
    imgs.forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('is-loaded');
      } else {
        img.addEventListener('load', function () { img.classList.add('is-loaded'); });
        img.addEventListener('error', function () {
          var wg = img.closest('.wg-image');
          if (wg) wg.classList.add('wg-image--error');
        });
      }
    });
  }

  // ── tabs ──
  function updateTabsIndicator(tabsEl) {
    var active = tabsEl.querySelector('.wg-tabs__item[aria-selected="true"] .wg-tabs__content');
    if (!active) return;
    tabsEl.style.setProperty('--_tabs-indicator-x', active.offsetLeft + 'px');
    tabsEl.style.setProperty('--_tabs-indicator-width', active.offsetWidth + 'px');
  }

  function bindTabs(tabsEl, ctx) {
    var items = tabsEl.querySelectorAll('.wg-tabs__item');
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        items.forEach(function (it) { it.setAttribute('aria-selected', 'false'); });
        item.setAttribute('aria-selected', 'true');
        updateTabsIndicator(tabsEl);
        if (item.dataset.tab === 'video') ctx.toast('视频分类开发中');
      });
    });
    requestAnimationFrame(function () { updateTabsIndicator(tabsEl); });
  }

  // ── 评论 actionsheet ──
  function openCommentSheet(ctx, feedId) {
    var feed = feeds.find(function (f) { return f.id === feedId; });
    if (!feed) return;
    var comments = feed.comments || [];

    var listHtml = comments.length > 0
      ? comments.map(function (c) {
          return ''
            + '<div class="comment-sheet__item">'
            +   '<div class="comment-sheet__item-avatar">'
            +     '<div class="avatar avatar--image avatar--24"><img src="' + AVATAR + '" alt="' + esc(c.name) + '" /></div>'
            +   '</div>'
            +   '<div class="comment-sheet__item-body">'
            +     '<div class="comment-sheet__item-name">' + esc(c.name) + '</div>'
            +     '<div class="comment-sheet__item-text">' + esc(c.text) + '</div>'
            +   '</div>'
            + '</div>';
        }).join('')
      : '<div class="comment-sheet__empty">暂无评论，快来抢沙发吧</div>';

    var template = ''
      + '<div class="actionsheet__panel">'
      +   '<div class="actionsheet__header actionsheet__header--text-link">'
      +     '<span class="actionsheet__header-text">评论 ' + comments.length + '</span>'
      +     '<button type="button" class="actionsheet__header-link link">写评论</button>'
      +   '</div>'
      +   '<div class="actionsheet__list"><div class="comment-sheet__list">' + listHtml + '</div></div>'
      +   '<div class="actionsheet__cancel-gap"></div>'
      +   '<button type="button" class="actionsheet__cancel">取消</button>'
      +   '<div class="actionsheet__safe-area"></div>'
      + '</div>';

    ctx.openSheet(template, {
      label: '评论',
      init: function (oCtx) {
        var writeLink = oCtx.root.querySelector('.actionsheet__header-link');
        if (writeLink) {
          writeLink.addEventListener('click', function () {
            oCtx.close();
            ctx.dialog({
              variant: 'input',
              title: '写评论',
              inputPlaceholder: '说点什么吧...',
              buttons: [
                { label: '取消', tone: 'default' },
                {
                  label: '发布',
                  tone: 'confirm',
                  onClick: function (e) {
                    var input = document.querySelector('.dialog__input input');
                    var text = input ? input.value.trim() : '';
                    if (!text) return;
                    feed.comments = feed.comments || [];
                    feed.comments.push({ name: '我', text: text });
                    feed.commentCount += 1;
                    var countEl = ctx.root.querySelector('[data-feed-id="' + feedId + '"] .feed-item__comment-btn .feed-item__action-count');
                    if (countEl) countEl.textContent = feed.commentCount;
                    e.close();
                    ctx.toast('评论发布成功');
                  }
                }
              ]
            });
          });
        }
        var cancelBtn = oCtx.root.querySelector('.actionsheet__cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', function () { oCtx.close(); });
      }
    });
  }

  // ── 转发 actionsheet ──
  function openShareSheet(ctx, feedId) {
    var template = ''
      + '<div class="actionsheet__panel">'
      +   '<div class="actionsheet__header actionsheet__header--text">'
      +     '<span class="actionsheet__header-text">转发到</span>'
      +   '</div>'
      +   '<div class="actionsheet__list">'
      +     '<div class="actionsheet__group">'
      +       '<button type="button" class="actionsheet__item"><div class="actionsheet__item-main"><div class="actionsheet__item-title">微信好友</div></div></button>'
      +       '<button type="button" class="actionsheet__item"><div class="actionsheet__item-main"><div class="actionsheet__item-title">朋友圈</div></div></button>'
      +       '<button type="button" class="actionsheet__item"><div class="actionsheet__item-main"><div class="actionsheet__item-title">复制链接</div></div></button>'
      +     '</div>'
      +   '</div>'
      +   '<div class="actionsheet__cancel-gap"></div>'
      +   '<button type="button" class="actionsheet__cancel">取消</button>'
      +   '<div class="actionsheet__safe-area"></div>'
      + '</div>';

    ctx.openSheet(template, {
      label: '转发',
      init: function (oCtx) {
        var items = oCtx.root.querySelectorAll('.actionsheet__item');
        items.forEach(function (item) {
          item.addEventListener('click', function () {
            oCtx.close();
            ctx.toast('转发成功');
          });
        });
        var cancelBtn = oCtx.root.querySelector('.actionsheet__cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', function () { oCtx.close(); });
      }
    });
  }

  // ── 点赞 ──
  function toggleLike(ctx, feedId, btn) {
    var feed = feeds.find(function (f) { return f.id === feedId; });
    if (!feed) return;
    feed.liked = !feed.liked;
    feed.likeCount += feed.liked ? 1 : -1;
    btn.classList.toggle('is-liked', feed.liked);
    var icon = btn.querySelector('.feed-item__action-icon');
    if (icon) {
      icon.classList.toggle('icon-aixin', !feed.liked);
      icon.classList.toggle('icon-aixin-mian', feed.liked);
    }
    var count = btn.querySelector('.feed-item__action-count');
    if (count) count.textContent = feed.likeCount;
  }

  // ── 读取父场景 state ──
  function readParentState(ctx, key) {
    var parentState = ctx.appState.sceneState && ctx.appState.sceneState['dongtai-feed'];
    return parentState ? parentState[key] : null;
  }

  // ── dongtai-feed 模板 ──
  var feedTemplate = ''
    + '<div class="dongtai-feed" data-bg="page">'
    +   '<div class="dongtai-feed__sticky">'
    +     '<div class="dongtai-feed__search">'
    +       '<div class="searchbox searchbox--md searchbox--gray" data-action="search">'
    +         '<span class="searchbox__icon"><i class="wego-iconfont-s icon-sousuo"></i></span>'
    +         '<div class="searchbox__input"><span class="searchbox__placeholder">搜索店主或商品</span></div>'
    +         '<div class="searchbox__actions"></div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="dongtai-feed__tabs">'
    +       '<div class="wg-tabs wg-tabs--standard wg-tabs--divide" role="tablist" data-tabs="feed-category">'
    +         '<div class="wg-tabs__scroll">'
    +           '<button class="wg-tabs__item" role="tab" aria-selected="true" data-tab="follow"><div class="wg-tabs__content"><span class="wg-tabs__label">关注</span></div></button>'
    +           '<button class="wg-tabs__item" role="tab" aria-selected="false" data-tab="recommend"><div class="wg-tabs__content"><span class="wg-tabs__label">推荐</span></div></button>'
    +           '<button class="wg-tabs__item" role="tab" aria-selected="false" data-tab="video"><div class="wg-tabs__content"><span class="wg-tabs__label">视频</span></div></button>'
    +           '<div class="wg-tabs__active-indicator"></div>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    +   '<div class="dongtai-feed__content">'
    +     '<div class="dongtai-feed__shops"><div class="dongtai-feed__shops-scroll" data-shops-scroll></div></div>'
    +     '<div class="dongtai-feed__list" data-feed-list></div>'
    +   '</div>'
    + '</div>';

  // ── shop-home-stub 模板 ──
  function shopStubTemplate(shopName) {
    return ''
      + '<div class="shop-stub" data-bg="surface">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-btn" data-action="back"><i class="wego-iconfont-s icon-fanhui"></i></button>'
      +       '</div>'
      +       '<div class="navbar__center">' + esc(shopName || '店主主页') + '</div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="shop-stub__content">'
      +     '<div class="avatar avatar--image avatar--56"><img src="' + AVATAR + '" alt="' + esc(shopName || '店主') + '" /></div>'
      +     '<div class="shop-stub__name">' + esc(shopName || '店主') + '</div>'
      +     '<button type="button" class="btn btn--weak btn--sm" data-action="follow">已关注</button>'
      +     '<div class="shop-stub__hint">店主主页开发中</div>'
      +   '</div>'
      + '</div>';
  }

  // ── product-detail-stub 模板 ──
  function productStubTemplate(product) {
    var name = (product && product.name) || '商品详情';
    var image = (product && product.image) || imgUrl('product placeholder photo on white background', 'landscape_4_3');
    var priceInt = (product && product.priceInt) || '--';
    var decimal = (product && product.priceDec) ? '<span class="metric__decimal">.' + product.priceDec + '</span>' : '';

    return ''
      + '<div class="product-stub" data-bg="surface">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-btn" data-action="back"><i class="wego-iconfont-s icon-fanhui"></i></button>'
      +       '</div>'
      +       '<div class="navbar__center">' + esc(name) + '</div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="product-stub__image wg-image"><img class="wg-image__src" src="' + image + '" alt="" /></div>'
      +   '<div class="product-stub__info">'
      +     '<div class="product-stub__name">' + esc(name) + '</div>'
      +     '<div class="product-stub__price metric metric--24 metric--marketing">'
      +       '<span class="metric__main">'
      +         '<span class="metric__symbol">¥</span>'
      +         '<span class="metric__value"><span class="metric__integer">' + priceInt + '</span>' + decimal + '</span>'
      +       '</span>'
      +     '</div>'
      +     '<div class="product-stub__hint">商品详情开发中</div>'
      +   '</div>'
      + '</div>';
  }

  // ── 注册 dongtai-feed (host-tab) ──
  WegoApp.registerScene({
    routeId: 'dongtai-feed',
    title: '动态',
    presentation: { type: 'host-tab', transition: 'none', coversTabBar: false },
    template: feedTemplate,
    init: function (ctx) {
      var root = ctx.root;

      // 渲染关注店主
      var shopsScroll = root.querySelector('[data-shops-scroll]');
      if (shopsScroll) shopsScroll.innerHTML = followedShops.map(shopItemHtml).join('');

      // 渲染动态列表
      var feedList = root.querySelector('[data-feed-list]');
      if (feedList) feedList.innerHTML = feeds.map(feedItemHtml).join('');

      // 图片加载
      bindImageLoad(root);

      // tabs
      var tabsEl = root.querySelector('[data-tabs="feed-category"]');
      if (tabsEl) bindTabs(tabsEl, ctx);

      // 搜索
      var searchEl = root.querySelector('[data-action="search"]');
      if (searchEl) searchEl.addEventListener('click', function () { ctx.toast('搜索功能开发中'); });

      // 事件委托：动态卡片交互
      root.addEventListener('click', function (e) {
        var target = e.target.closest('[data-action]');
        if (!target) return;
        var action = target.dataset.action;

        if (action === 'like') {
          e.preventDefault();
          toggleLike(ctx, target.dataset.feedId, target);
        } else if (action === 'comment') {
          e.preventDefault();
          openCommentSheet(ctx, target.dataset.feedId);
        } else if (action === 'share') {
          e.preventDefault();
          openShareSheet(ctx, target.dataset.feedId);
        } else if (action === 'shop-entry') {
          e.preventDefault();
          var shop = followedShops.find(function (s) { return s.id === target.dataset.shopId; });
          ctx.state.shopName = shop ? shop.name : '店主主页';
          ctx.navigate('shop-home-stub');
        } else if (action === 'product-entry') {
          e.preventDefault();
          var product = null;
          for (var i = 0; i < feeds.length; i++) {
            if (feeds[i].product && feeds[i].product.id === target.dataset.productId) {
              product = feeds[i].product;
              break;
            }
          }
          ctx.state.productData = product;
          ctx.navigate('product-detail-stub');
        }
      });
    }
  });

  // ── 注册 shop-home-stub (push) ──
  WegoApp.registerScene({
    routeId: 'shop-home-stub',
    title: '店主主页',
    presentation: { type: 'push', transition: 'slide-left-enter, slide-right-exit', coversTabBar: true },
    template: '',
    init: function (ctx) {
      var root = ctx.root;
      var shopName = readParentState(ctx, 'shopName') || '店主主页';
      root.innerHTML = shopStubTemplate(shopName);
      bindImageLoad(root);

      var backBtn = root.querySelector('[data-action="back"]');
      if (backBtn) backBtn.addEventListener('click', function () { ctx.back(); });

      var followBtn = root.querySelector('[data-action="follow"]');
      if (followBtn) followBtn.addEventListener('click', function () { ctx.toast('关注功能开发中'); });

      ctx.toast('店主主页开发中');
    }
  });

  // ── 注册 product-detail-stub (push) ──
  WegoApp.registerScene({
    routeId: 'product-detail-stub',
    title: '商品详情',
    presentation: { type: 'push', transition: 'slide-left-enter, slide-right-exit', coversTabBar: true },
    template: '',
    init: function (ctx) {
      var root = ctx.root;
      var productData = readParentState(ctx, 'productData');
      root.innerHTML = productStubTemplate(productData);
      bindImageLoad(root);

      var backBtn = root.querySelector('[data-action="back"]');
      if (backBtn) backBtn.addEventListener('click', function () { ctx.back(); });

      ctx.toast('商品详情开发中');
    }
  });

})();
