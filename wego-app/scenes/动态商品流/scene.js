/**
 * 动态商品流场景
 * routeId: dongtai-feed (host-tab) / dongtai-product-detail (push)
 * 迭代: 20260712-dongtai001-动态商品流浏览
 */

(function () {
  'use strict';

  // ── 模拟数据 ──

  var AVATAR = './lib/assets/image/avatar-defult.png';

  var FEED_DATA = [
    {
      id: 1,
      author: '小薇女装工作室',
      avatar: AVATAR,
      time: '2小时前',
      text: '秋冬新款针织毛衣上架啦！面料柔软舒适，版型显瘦，三色可选，现货秒发～喜欢的姐妹冲鸭！',
      images: [
        './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg',
        './lib/assets/image/clothing/clothing_1/clothing_1_2.jpg',
        './lib/assets/image/clothing/clothing_1/clothing_1_3.jpg'
      ],
      product: {
        name: '秋冬针织毛衣 韩版宽松套头衫',
        price: '128',
        originalPrice: '198',
        tags: ['新品', '包邮'],
        image: './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg'
      }
    },
    {
      id: 2,
      author: '潮人男装工坊',
      avatar: AVATAR,
      time: '3小时前',
      text: '',
      images: [
        './lib/assets/image/clothing/clothing_2/clothing_2_2.jpg',
        './lib/assets/image/clothing/clothing_2/clothing_2_4.jpg.jpg'
      ],
      product: {
        name: '男士休闲夹克 秋季百搭外套',
        price: '238',
        originalPrice: '',
        tags: ['热销'],
        image: './lib/assets/image/clothing/clothing_2/clothing_2_2.jpg'
      }
    },
    {
      id: 3,
      author: '童装优选店',
      avatar: AVATAR,
      time: '5小时前',
      text: '宝宝春秋连体衣，纯棉材质，亲肤透气，妈妈们放心入手！多色多码可选，团购价更优惠哦～数量有限，先到先得！',
      images: [
        './lib/assets/image/clothing/clothing_3/1663740989357_27184.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989357_63074.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989358_96529.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989359_87304.jpg'
      ],
      product: {
        name: '婴儿纯棉连体衣 春秋款 0-3岁 A类标准',
        price: '68',
        originalPrice: '98',
        tags: ['团购', '纯棉'],
        image: './lib/assets/image/clothing/clothing_3/1663740989357_27184.jpg'
      }
    },
    {
      id: 4,
      author: '简约女装馆',
      avatar: AVATAR,
      time: '昨天',
      text: '简约风连衣裙，气质优雅，适合通勤约会。限时特价，数量有限，先到先得！',
      images: [
        './lib/assets/image/clothing/clothing_4/1663741015639_25492.jpg'
      ],
      product: {
        name: '气质通勤连衣裙 收腰显瘦中长款',
        price: '188',
        originalPrice: '288',
        tags: ['限时特价', '包邮'],
        image: './lib/assets/image/clothing/clothing_4/1663741015639_25492.jpg'
      }
    },
    {
      id: 5,
      author: '品质女装供应链',
      avatar: AVATAR,
      time: '昨天',
      text: '大牌同源面料，秋冬大衣专场。做工精细，版型挺括，一件抵三件，衣柜必备单品！',
      images: [
        './lib/assets/image/clothing/clothing_5/1663741055068_1251.jpg',
        './lib/assets/image/clothing/clothing_5/1663741055070_59070.jpg',
        './lib/assets/image/clothing/clothing_5/1663741055070_91047.jpg',
        './lib/assets/image/clothing/clothing_5/1663741055071_7270.jpg',
        './lib/assets/image/clothing/clothing_5/1663741055072_60369.jpg',
        './lib/assets/image/clothing/clothing_5/1663741055072_69717.jpg'
      ],
      product: {
        name: '秋冬羊毛大衣 双面呢外套 中长款',
        price: '568',
        originalPrice: '898',
        tags: ['大牌同源', '现货'],
        image: './lib/assets/image/clothing/clothing_5/1663741055068_1251.jpg'
      }
    }
  ];

  var PRODUCT_DETAIL = {
    name: '秋冬针织毛衣 韩版宽松套头衫',
    price: '128',
    originalPrice: '198',
    image: './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg',
    tags: ['新品', '包邮', '7天无理由'],
    attrs: [
      { label: '面料', value: '针织混纺' },
      { label: '版型', value: '宽松' },
      { label: '颜色', value: '米白 / 燕麦 / 雾蓝' },
      { label: '尺码', value: 'S / M / L / XL' },
      { label: '库存', value: '126件' },
      { label: '店主', value: '小薇女装工作室' }
    ],
    description: '采用优质针织混纺面料，柔软亲肤，透气不扎人。韩版宽松套头设计，不挑身材，轻松搭配各种下装。三色可选，适合秋冬日常穿着。'
  };

  // ── 辅助函数 ──

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function tagsHtml(tags) {
    if (!tags || !tags.length) return '';
    return tags.map(function (tag) {
      return '<span class="tag tag--28 tag--brand tag--selected">' + escapeHtml(tag) + '</span>';
    }).join('');
  }

  function metricHtml(price, originalPrice) {
    var parts = price.split('.');
    var integer = parts[0];
    var decimal = parts[1] ? '.' + parts[1] : '';
    var html = '<span class="metric metric--marketing metric--18">' +
      '<span class="metric__main">' +
      '<span class="metric__value">' +
      '<span class="metric__symbol">¥</span>' +
      '<span class="metric__integer">' + escapeHtml(integer) + '</span>' +
      (decimal ? '<span class="metric__decimal">' + escapeHtml(decimal) + '</span>' : '') +
      '</span>' +
      '</span>' +
      '</span>';
    if (originalPrice) {
      html += '<span class="metric metric--14">' +
        '<span class="metric__main">' +
        '<span class="metric__line">¥' + escapeHtml(originalPrice) + '</span>' +
        '</span>' +
        '</span>';
    }
    return html;
  }

  // ── 动态流模板 ──

  function feedItemHtml(item) {
    var html = '<article class="feed-item" data-feed-id="' + item.id + '">';

    // 发布者
    html += '<header class="feed-item__header">';
    html += '<div class="avatar avatar--40 avatar--image"><img src="' + item.avatar + '" alt="' + escapeHtml(item.author) + '"></div>';
    html += '<div class="feed-item__meta">';
    html += '<div class="feed-item__author">' + escapeHtml(item.author) + '</div>';
    html += '<div class="feed-item__time">' + escapeHtml(item.time) + '</div>';
    html += '</div>';
    html += '</header>';

    // 正文（为空时折叠）
    if (item.text) {
      html += '<div class="feed-item__text">' + escapeHtml(item.text) + '</div>';
    }

    // 图片网格（为空时折叠）
    if (item.images && item.images.length > 0) {
      var count = Math.min(item.images.length, 9);
      html += '<div class="feed-item__images feed-item__images--' + count + '">';
      for (var i = 0; i < count; i++) {
        html += '<div class="feed-item__image feed-item__image--clickable" data-image-index="' + i + '" data-image-src="' + item.images[i] + '">';
        html += '<img src="' + item.images[i] + '" alt="" loading="lazy">';
        html += '</div>';
      }
      html += '</div>';
    }

    // 产品摘要卡片
    if (item.product) {
      var p = item.product;
      html += '<div class="feed-item__product" data-product-id="' + item.id + '">';
      html += '<div class="feed-item__product-thumb"><img src="' + p.image + '" alt=""></div>';
      html += '<div class="feed-item__product-info">';
      html += '<div class="feed-item__product-name">' + escapeHtml(p.name) + '</div>';
      html += '<div class="feed-item__product-bottom">';
      html += '<div class="feed-item__product-tags">' + tagsHtml(p.tags) + '</div>';
      html += '<div class="feed-item__product-price">' + metricHtml(p.price, p.originalPrice) + '</div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    }

    // 操作行
    html += '<div class="feed-item__actions">';
    html += '<button class="feed-item__more-btn" type="button" aria-label="更多操作"><i class="wego-iconfont-s icon-sandian16"></i></button>';
    html += '<button class="btn btn--weak btn--sm feed-item__forward-btn" type="button">一键转发</button>';
    html += '</div>';

    html += '</article>';
    return html;
  }

  function feedTemplate() {
    var html = '<div class="dongtai-feed" data-bg="surface">';

    // 搜索栏
    html += '<div class="dongtai-feed__search">';
    html += '<div class="search-toolbar">';
    html += '<div class="searchbox searchbox--md searchbox--gray">';
    html += '<span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>';
    html += '<div class="searchbox__input">';
    html += '<input class="searchbox__field" type="search" placeholder="搜索商品、动态" aria-label="搜索商品动态">';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // 动态列表
    html += '<div class="dongtai-feed__list">';
    for (var i = 0; i < FEED_DATA.length; i++) {
      html += feedItemHtml(FEED_DATA[i]);
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ── 产品详情模板 ──

  function productDetailTemplate() {
    var p = PRODUCT_DETAIL;
    var html = '<div class="product-detail" data-bg="surface">';

    // navbar
    html += '<div class="navbar">';
    html += '<div class="navbar__body">';
    html += '<div class="navbar__left">';
    html += '<div class="navbar__left-btn"><i class="wego-iconfont-s icon-fanhui"></i></div>';
    html += '</div>';
    html += '<div class="navbar__center"><span class="navbar__title">产品详情</span></div>';
    html += '<div class="navbar__right"></div>';
    html += '</div>';
    html += '</div>';

    // 内容区
    html += '<div class="product-detail__body">';

    // 主图
    html += '<div class="product-detail__image"><img src="' + p.image + '" alt=""></div>';

    // 信息区
    html += '<div class="product-detail__info">';
    html += '<div class="product-detail__price-row">' + metricHtml(p.price, p.originalPrice) + '</div>';
    html += '<div class="product-detail__name">' + escapeHtml(p.name) + '</div>';
    html += '<div class="product-detail__tags">' + tagsHtml(p.tags) + '</div>';
    html += '</div>';

    // 属性列表
    html += '<div class="product-detail__attrs">';
    for (var i = 0; i < p.attrs.length; i++) {
      var attr = p.attrs[i];
      html += '<div class="cell cell--single">';
      html += '<div class="cell__body">';
      html += '<div class="cell__content">';
      html += '<div class="cell__title">' + escapeHtml(attr.label) + '</div>';
      html += '</div>';
      html += '<div class="cell__action"><span style="font-size:var(--body-md-font-size);color:var(--text-secondary)">' + escapeHtml(attr.value) + '</span></div>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';

    // 描述信息
    html += '<div class="product-detail__info">';
    html += '<div style="font-size:var(--body-md-font-size);color:var(--text-secondary);line-height:var(--body-lg-line-height)">' + escapeHtml(p.description) + '</div>';
    html += '</div>';

    html += '</div>'; // body

    // 底部操作栏
    html += '<div class="product-detail__footer">';
    html += '<button class="product-detail__footer-action" type="button"><i class="wego-iconfont-s icon-shoucang"></i><span>收藏</span></button>';
    html += '<div class="product-detail__footer-main">';
    html += '<button class="btn btn--strong btn--md" type="button">联系店主</button>';
    html += '</div>';
    html += '</div>';

    html += '</div>'; // product-detail
    return html;
  }

  // ── Actionsheet 模板（只含 .actionsheet__panel）──

  function actionsheetTemplate(feedItem) {
    var html = '<div class="actionsheet__panel">';
    html += '<div class="actionsheet__list">';
    html += '<div class="actionsheet__group">';

    var actions = [
      { icon: 'icon-fuzhi', title: '复制文案', feedback: '文案已复制' },
      { icon: 'icon-fenxiang', title: '分享', feedback: '分享面板（stub）' },
      { icon: 'icon-shoucang', title: '收藏', feedback: '已收藏' },
      { icon: 'icon-xiazai', title: '下载图片', feedback: '图片已下载（stub）' },
      { icon: 'icon-bianji', title: '编辑', feedback: '编辑动态（stub）' },
      { icon: 'icon-fuzhi-mian', title: '复制动态', feedback: '动态已复制（stub）' }
    ];

    for (var i = 0; i < actions.length; i++) {
      var a = actions[i];
      html += '<div class="actionsheet__item" data-action-title="' + escapeHtml(a.title) + '" data-action-feedback="' + escapeHtml(a.feedback) + '">';
      html += '<div class="actionsheet__item-icon"><i class="wego-iconfont-s ' + a.icon + '"></i></div>';
      html += '<div class="actionsheet__item-main">';
      html += '<div class="actionsheet__item-title">' + escapeHtml(a.title) + '</div>';
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    html += '</div>';
    html += '<div class="actionsheet__cancel-gap"></div>';
    html += '<div class="actionsheet__cancel">取消</div>';
    html += '</div>';
    return html;
  }

  // ── 图片大图查看模板 ──

  function imageViewerTemplate(imageSrc) {
    var html = '<div class="dongtai-image-viewer">';
    html += '<img class="dongtai-image-viewer__img" src="' + imageSrc + '" alt="">';
    html += '<button class="dongtai-image-viewer__close" type="button" aria-label="关闭"><i class="wego-iconfont-s icon-cha"></i></button>';
    html += '</div>';
    return html;
  }

  // ── 动态流初始化 ──

  function initFeed(ctx) {
    var root = ctx.root;

    // 搜索
    var searchField = root.querySelector('.searchbox__field');
    if (searchField) {
      searchField.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var keyword = searchField.value.trim();
          if (keyword) {
            ctx.toast('搜索：' + keyword + '（stub）');
            searchField.blur();
          }
        }
      });
    }

    // 遍历每条动态绑定交互
    var feedItems = root.querySelectorAll('.feed-item');
    feedItems.forEach(function (item) {
      var feedId = item.dataset.feedId;
      var feedData = null;
      for (var i = 0; i < FEED_DATA.length; i++) {
        if (String(FEED_DATA[i].id) === feedId) {
          feedData = FEED_DATA[i];
          break;
        }
      }
      if (!feedData) return;

      // 产品卡片点击 → 进入产品详情
      var productCard = item.querySelector('.feed-item__product');
      if (productCard) {
        productCard.addEventListener('click', function () {
          ctx.navigate('dongtai-product-detail');
        });
      }

      // 图片点击 → 大图查看
      var images = item.querySelectorAll('.feed-item__image--clickable');
      images.forEach(function (imgEl) {
        imgEl.addEventListener('click', function () {
          var imageSrc = imgEl.dataset.imageSrc;
          ctx.openFullScreenModal(imageViewerTemplate(imageSrc), {
            init: function (overlayCtx) {
              var closeBtn = overlayCtx.root.querySelector('.dongtai-image-viewer__close');
              if (closeBtn) {
                closeBtn.addEventListener('click', function () {
                  overlayCtx.close();
                });
              }
              overlayCtx.root.addEventListener('click', function (e) {
                if (e.target === overlayCtx.root || e.target.classList.contains('dongtai-image-viewer')) {
                  overlayCtx.close();
                }
              });
            }
          });
        });
      });

      // 更多按钮 → actionsheet
      var moreBtn = item.querySelector('.feed-item__more-btn');
      if (moreBtn) {
        moreBtn.addEventListener('click', function () {
          ctx.openSheet(actionsheetTemplate(feedData), {
            init: function (overlayCtx) {
              // 绑定操作项
              var actionItems = overlayCtx.root.querySelectorAll('.actionsheet__item');
              actionItems.forEach(function (actionItem) {
                actionItem.addEventListener('click', function () {
                  var feedback = actionItem.dataset.actionFeedback;
                  overlayCtx.close();
                  setTimeout(function () {
                    ctx.toast(feedback);
                  }, 100);
                });
              });

              // 取消按钮
              var cancelBtn = overlayCtx.root.querySelector('.actionsheet__cancel');
              if (cancelBtn) {
                cancelBtn.addEventListener('click', function () {
                  overlayCtx.close();
                });
              }
            }
          });
        });
      }

      // 一键转发
      var forwardBtn = item.querySelector('.feed-item__forward-btn');
      if (forwardBtn) {
        forwardBtn.addEventListener('click', function () {
          if (forwardBtn.classList.contains('is-forwarded')) {
            forwardBtn.classList.remove('is-forwarded');
            forwardBtn.textContent = '一键转发';
            ctx.toast('已取消转发');
          } else {
            forwardBtn.classList.add('is-forwarded');
            forwardBtn.textContent = '已转发';
            ctx.toast('转发成功');
          }
        });
      }
    });
  }

  // ── 产品详情初始化 ──

  function initProductDetail(ctx) {
    var root = ctx.root;

    // 返回按钮
    var backBtn = root.querySelector('.navbar__left-btn');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        ctx.back();
      });
    }

    // 联系店主
    var contactBtn = root.querySelector('.product-detail__footer .btn--strong');
    if (contactBtn) {
      contactBtn.addEventListener('click', function () {
        ctx.toast('联系店主（stub）');
      });
    }

    // 收藏
    var favoriteBtn = root.querySelector('.product-detail__footer-action');
    if (favoriteBtn) {
      var favorited = false;
      favoriteBtn.addEventListener('click', function () {
        favorited = !favorited;
        var label = favoriteBtn.querySelector('span');
        var icon = favoriteBtn.querySelector('.wego-iconfont-s');
        if (favorited) {
          if (label) label.textContent = '已收藏';
          if (icon) icon.style.color = 'var(--status-promotion-default)';
          ctx.toast('已收藏');
        } else {
          if (label) label.textContent = '收藏';
          if (icon) icon.style.color = '';
          ctx.toast('已取消收藏');
        }
      });
    }
  }

  // ── 场景注册 ──

  if (window.WegoApp && window.WegoApp.registerScene) {
    window.WegoApp.registerScene({
      routeId: 'dongtai-feed',
      title: '动态',
      presentation: { type: 'host-tab' },
      template: feedTemplate(),
      init: initFeed
    });

    window.WegoApp.registerScene({
      routeId: 'dongtai-product-detail',
      title: '产品详情',
      presentation: { type: 'push', coversTabBar: true },
      template: productDetailTemplate(),
      init: initProductDetail
    });
  }
})();
