/* wego-design-contract:
{
  "surface_id": "album-product-feed",
  "route_id": "album-product-feed",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "host-tab",
    "transition": "none",
    "dismissAction": "tab-switch",
    "overlayLevel": "inline",
    "coversTabBar": false,
    "source": "library-consumption.json#/appRuntime/presentationTypes"
  },
  "prompt_contract": {
    "design_system_version": 416,
    "token_bindings": [
      { "selector": ".album-feed", "content_role": "页面背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".album-feed", "content_role": "页面文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".album-feed", "content_role": "页面字体", "css_property": "font-family", "token": "var(--body-md-font-family)" }
    ],
    "component_bindings": [
      { "binding_id": "feed-navbar", "slug": "navbar", "reason": "动态 tab 顶部导航：左对齐大标题「动态」，右侧发布入口与搜索入口", "variant_dimensions": { "leftControl": "none", "titleAlignment": "left-wide", "actions": "icon", "rightActionType": "icon", "spacing": "default", "pageTransition": "push", "position": "sticky" } }
    ],
    "layout_contract": {
      "mode": "composed",
      "page_edge_mode": "M0",
      "mutable_regions": [".album-feed__scroll", ".album-feed__list"]
    },
    "interaction_contract": [
      { "dom_id": "publish-entry", "target": "route:publish-product" },
      { "dom_id": "feed-search-input", "target": "state:searching" }
    ],
    "state_contract": [
      { "state_id": "feed-ready", "initial": true, "trigger": "进入动态 tab 且数据就绪", "visible_result": "时间倒序展示动态流", "fallback": "保留当前可浏览列表", "persistence": "memory" }
    ]
  }
}
*/

/* 动态商品流场景（album-product-feed）
   - 连续浏览所有店主的商品动态（社区已有动态 + 当前用户发布动态）
   - 卡片稳定呈现：发布者 / 时间 / 商品文字 / 商品图片 / 相关产品信息
   - 帮卖商品主按钮「邀请帮卖」+「可帮卖」标识，转发降次级；非帮卖主按钮「一键转发」
   - 进产品详情（simulated）、图片看大图、搜索、必要操作入口（stub） */

(function () {
  'use strict';

  var DB = window.WEGO_PROTOTYPE_DB || {};
  var COMMUNITY_DYNAMICS = (DB.dynamics || []).slice();
  var PUBLISHERS = DB.publishers || [];
  var PRODUCTS = DB.products || [];
  var CURRENT_USER = DB.currentUser || {};

  var PUBLISHED_KEY = 'wego.album-feed.published';

  /* 社区动态的帮卖标记：对齐帮卖分销场景数据契约（distribution_type 1=自由定价 / 2=固定佣金）。
     社区已有动态在原型数据库中不携带帮卖配置，此处以场景样例标记部分商品为「可帮卖」，
     用于演示帮卖卡片（主按钮「邀请帮卖」+「可帮卖」标识）与非帮卖卡片（主按钮「一键转发」）两种形态。 */
  var RESALE_MARK = {
    'dyn-01': { distribution_type: 1, distribution_config: { amountType: 1, value: 30 } },
    'dyn-03': { distribution_type: 1, distribution_config: { amountType: 2, rate: 0.3 } },
    'dyn-05': { distribution_type: 2, distribution_config: { amountType: 1, value: 100 } },
    'dyn-07': { distribution_type: 2, distribution_config: { amountType: 1, value: 100 } }
  };

  function loadPublished() {
    try {
      var raw = window.localStorage.getItem(PUBLISHED_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* 忽略 */ }
    return [];
  }

  function savePublished(list) {
    try {
      window.localStorage.setItem(PUBLISHED_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  function publisherById(id) {
    if (id === CURRENT_USER.user_id) {
      return { publisher_id: CURRENT_USER.user_id, publisher_name: CURRENT_USER.merchant_name, publisher_avatar: CURRENT_USER.avatar, publisher_type: 'shop' };
    }
    for (var i = 0; i < PUBLISHERS.length; i++) {
      if (PUBLISHERS[i].publisher_id === id) return PUBLISHERS[i];
    }
    return { publisher_id: id, publisher_name: '微购店主', publisher_avatar: '', publisher_type: 'shop' };
  }

  function productById(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].product_id === id) return PRODUCTS[i];
    }
    return null;
  }

  /* 解析动态关联的产品：静态产品查不到时回退到动态内联的 _product（发布场景写入的新产品） */
  function productOf(dyn) {
    var p = productById((dyn.related_product_ids || [])[0]);
    if (p) return p;
    return dyn._product || null;
  }

  function dynamicById(id) {
    var list = mergedDynamics();
    for (var i = 0; i < list.length; i++) {
      if (list[i].dynamic_id === id) return list[i];
    }
    return null;
  }

  function dynamicMediaImages(mediaList) {
    var images = [];
    (mediaList || []).forEach(function (m) {
      if (m && m.poster_or_src) images.push(m.poster_or_src);
    });
    return images;
  }

  function isResaleDynamic(dyn) {
    if (dyn.resale && dyn.resale.distribution_type) return true;
    return Boolean(RESALE_MARK[dyn.dynamic_id]);
  }

  function resaleConfigOf(dyn) {
    if (dyn.resale && dyn.resale.distribution_type) return dyn.resale;
    return RESALE_MARK[dyn.dynamic_id] || null;
  }

  function mergedDynamics() {
    var published = loadPublished();
    var list = COMMUNITY_DYNAMICS.concat(published);
    list.sort(function (a, b) {
      return (Number(b.published_order) || 0) - (Number(a.published_order) || 0);
    });
    return list;
  }

  function priceText(p) {
    if (!p) return '';
    var price = p.price;
    if (typeof price === 'number') return '¥' + price;
    return '¥' + price;
  }

  /* ── 动态卡片模板 ── */
  function feedCardTemplate(dyn) {
    var pub = publisherById(dyn.publisher_id);
    var product = productOf(dyn);
    var images = dynamicMediaImages(dyn.media_list);
    var resale = isResaleDynamic(dyn);
    var text = dyn.text_content || '';

    var mediaHtml = '';
    if (images.length === 1) {
      mediaHtml = '<button type="button" class="album-feed__media album-feed__media--single" data-action="view-image" data-img="' + images[0] + '">'
        + '<img class="album-feed__media-img" src="' + images[0] + '" alt="" /></button>';
    } else if (images.length > 1) {
      mediaHtml = '<div class="album-feed__media album-feed__media--grid">';
      images.slice(0, 9).forEach(function (src) {
        mediaHtml += '<button type="button" class="album-feed__media-cell" data-action="view-image" data-img="' + src + '"><img class="album-feed__media-img" src="' + src + '" alt="" /></button>';
      });
      mediaHtml += '</div>';
    }

    var badgeHtml = resale ? '<span class="badge album-feed__resale-badge" data-component-slug="badge">可帮卖</span>' : '';

    var productHtml = '';
    if (product) {
      productHtml = '<button type="button" class="album-feed__product" data-action="open-detail" data-product-id="' + product.product_id + '">'
        + '<img class="album-feed__product-thumb" src="' + (product.image_list && product.image_list[0] ? product.image_list[0] : '') + '" alt="" />'
        + '<span class="album-feed__product-info">'
        + '<span class="album-feed__product-name">' + product.name + '</span>'
        + '<span class="album-feed__product-price">' + priceText(product) + '</span>'
        + '</span>'
        + badgeHtml
        + '<i class="wego-iconfont-s icon-arrow-right album-feed__product-arrow" aria-hidden="true"></i>'
        + '</button>';
    }

    var primaryLabel = resale ? '邀请帮卖' : '一键转发';
    var primaryBtn = '<button type="button" class="btn btn--strong btn--md album-feed__primary" data-component-slug="button" data-action="primary-action" data-dyn-id="' + dyn.dynamic_id + '" data-resale="' + (resale ? '1' : '0') + '">' + primaryLabel + '</button>';
    var forwardBtn = resale ? '<button type="button" class="btn btn--weak btn--md album-feed__forward" data-component-slug="button" data-action="forward-action" data-dyn-id="' + dyn.dynamic_id + '">转发</button>' : '';

    return '<article class="album-feed__card" data-dyn-id="' + dyn.dynamic_id + '">'
      + '<header class="album-feed__head">'
      + '<div class="avatar avatar--40 avatar--image album-feed__avatar" data-component-slug="avatar"><img src="' + pub.publisher_avatar + '" alt="" /></div>'
      + '<div class="album-feed__meta">'
      + '<span class="album-feed__publisher">' + pub.publisher_name + '</span>'
      + '<span class="album-feed__time">' + dyn.published_at + '</span>'
      + '</div>'
      + '<button type="button" class="album-feed__more" data-action="more-actions" data-dyn-id="' + dyn.dynamic_id + '" aria-label="更多操作"><i class="wego-iconfont-s icon-sandian16" aria-hidden="true"></i></button>'
      + '</header>'
      + (text ? '<p class="album-feed__text">' + text + '</p>' : '')
      + mediaHtml
      + productHtml
      + '<footer class="album-feed__actions">'
      + '<div class="album-feed__actions-row">' + primaryBtn + forwardBtn + '</div>'
      + '</footer>'
      + '</article>';
  }

  function emptyStateTemplate() {
    return '<div class="album-feed__empty">'
      + '<i class="wego-iconfont-s icon-tupian album-feed__empty-icon" aria-hidden="true"></i>'
      + '<span class="album-feed__empty-text">还没有商品动态</span>'
      + '<button type="button" class="btn btn--strong btn--md" data-component-slug="button" data-action="empty-publish">去发布</button>'
      + '</div>';
  }

  function loadingTemplate() {
    return '<div class="album-feed__loading"><div class="loading" data-component-slug="loading"></div></div>';
  }

  function loadFailedTemplate() {
    return '<div class="album-feed__failed">'
      + '<i class="wego-iconfont-s icon-tupian album-feed__empty-icon" aria-hidden="true"></i>'
      + '<span class="album-feed__empty-text">动态加载失败</span>'
      + '<button type="button" class="btn btn--strong btn--md" data-component-slug="button" data-action="retry-load">重试</button>'
      + '</div>';
  }

  function searchEmptyTemplate() {
    return '<div class="album-feed__empty">'
      + '<i class="wego-iconfont-s icon-sousuo album-feed__empty-icon" aria-hidden="true"></i>'
      + '<span class="album-feed__empty-text">没有找到相关动态</span>'
      + '<button type="button" class="btn btn--weak btn--md" data-component-slug="button" data-action="clear-search">清空搜索</button>'
      + '</div>';
  }

  /* ── 操作入口 actionsheet（stub：点击给明确反馈）── */
  function actionSheetTemplate() {
    var items = ['复制文案', '分享', '收藏', '下载图片', '编辑', '复制动态'];
    var html = '<div class="actionsheet actionsheet--action" role="dialog" aria-modal="true" data-component-slug="actionsheet">';
    html += '<div class="actionsheet__panel">';
    html += '<div class="actionsheet__list">';
    items.forEach(function (label) {
      html += '<button type="button" class="actionsheet__item" data-action-label="' + label + '">'
        + '<div class="actionsheet__item-main"><div class="actionsheet__item-title">' + label + '</div></div>'
        + '</button>';
    });
    html += '</div>';
    html += '<div class="actionsheet__cancel-gap"></div>';
    html += '<button type="button" class="actionsheet__cancel" data-close-action-sheet>取 消</button>';
    html += '</div></div>';
    return html;
  }

  /* ── 产品详情（simulated）── */
  function productDetailTemplate(product) {
    return '<div class="modal modal--fullscreen" data-component-slug="modal" data-state="open" role="dialog" aria-modal="true" aria-label="产品详情">'
      + '<div class="modal__panel">'
      + '<div class="modal__title modal__title--default"><div class="navbar" data-component-slug="navbar"><div class="navbar__body navbar__body--spaced">'
      + '<div class="navbar__left"><button type="button" class="navbar__left-btn" data-dom-id="close-detail" aria-label="返回"><i class="wego-iconfont-s icon-zuojiantou16"></i></button></div>'
      + '<div class="navbar__center"><span class="navbar__title">产品详情</span></div>'
      + '<div class="navbar__right"></div>'
      + '</div></div></div>'
      + '<div class="modal__body modal__body--safe-bottom"><div class="album-feed__detail-body">'
      + '<img class="album-feed__detail-img" src="' + (product.image_list && product.image_list[0] ? product.image_list[0] : '') + '" alt="" />'
      + '<div class="album-feed__detail-info">'
      + '<div class="album-feed__detail-price">' + priceText(product) + '</div>'
      + '<div class="album-feed__detail-name">' + product.name + '</div>'
      + '<div class="album-feed__detail-points">' + ((product.selling_points || []).join(' · ')) + '</div>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  /* ── 图片看大图 ── */
  function imageViewerTemplate(src) {
    return '<div class="modal modal--fullscreen" data-component-slug="modal" data-state="open" role="dialog" aria-modal="true" aria-label="查看图片">'
      + '<div class="modal__panel">'
      + '<div class="album-feed__viewer">'
      + '<button type="button" class="album-feed__viewer-close" data-dom-id="close-viewer" aria-label="关闭"><i class="wego-iconfont-s icon-guanbi" aria-hidden="true"></i></button>'
      + '<img class="album-feed__viewer-img" src="' + src + '" alt="" />'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  /* ── 主模板已内联至 registerScene.template ── */

  function renderList(ctx, listEl) {
    var dynamics = mergedDynamics();
    var keyword = (ctx.state.keyword || '').trim().toLowerCase();

    if (keyword) {
      dynamics = dynamics.filter(function (dyn) {
        var product = productOf(dyn);
        var hay = ((dyn.text_content || '') + ' ' + (product ? (product.name + ' ' + (product.selling_points || []).join(' ')) : '')).toLowerCase();
        return hay.indexOf(keyword) >= 0;
      });
    }

    if (window.WegoApp.faultInjection && window.WegoApp.faultInjection.isEnabled('load')) {
      listEl.innerHTML = loadFailedTemplate();
      return;
    }

    if (!dynamics.length) {
      listEl.innerHTML = keyword ? searchEmptyTemplate() : emptyStateTemplate();
      return;
    }

    var html = '';
    dynamics.forEach(function (dyn) {
      html += feedCardTemplate(dyn);
    });
    listEl.innerHTML = html;
  }

  window.WegoApp.registerScene({
    routeId: 'album-product-feed',
    template: `
<div class="layout-page album-feed" data-surface-id="album-product-feed" data-route-id="album-product-feed" data-layout-mode="composed" data-bg="page" data-component-slug="layout-page">
  <div class="layout-page__top">
    <div class="navbar album-feed__navbar" data-component-slug="navbar">
      <div class="navbar__body navbar__body--split">
        <div class="navbar__left navbar__left--custom"><span class="navbar__title album-feed__nav-title">动态</span></div>
        <div class="navbar__right navbar__right--icon">
          <button type="button" class="navbar__action" data-dom-id="feed-search-entry" aria-label="搜索"><span class="navbar__action-icon"><i class="wego-iconfont-s icon-sousuo" aria-hidden="true"></i></span></button>
          <button type="button" class="navbar__action" data-dom-id="publish-entry" aria-label="发布"><span class="navbar__action-icon"><i class="wego-iconfont-s icon-jia" aria-hidden="true"></i></span></button>
        </div>
      </div>
    </div>
  </div>
  <div class="layout-page__body">
    <div class="layout-scroll album-feed__scroll" data-component-slug="layout-scroll" data-tab-scroll>
      <div class="album-feed__list" data-feed-list></div>
    </div>
  </div>
</div>`,
    presentation: { type: 'host-tab', transition: 'none', dismissAction: 'tab-switch', overlayLevel: 'inline', coversTabBar: false },
    init: function initAlbumFeed(ctx) {
      var root = ctx.root;
      var listEl = root.querySelector('[data-feed-list]');
      var publishEntry = root.querySelector('[data-dom-id="publish-entry"]');
      var searchEntry = root.querySelector('[data-dom-id="feed-search-entry"]');

      ctx.state.keyword = '';
      renderList(ctx, listEl);

      function bindDelegated() {
        listEl.addEventListener('click', function (e) {
          var target = e.target.closest ? e.target.closest('[data-action]') : null;
          if (!target) return;
          var action = target.getAttribute('data-action');

          if (action === 'view-image') {
            var src = target.getAttribute('data-img');
            if (src) openImageViewer(ctx, src);
          } else if (action === 'open-detail') {
            var pid = target.getAttribute('data-product-id');
            var product = productById(pid);
            if (!product) {
              var dynEl = target.closest ? target.closest('[data-dyn-id]') : null;
              var dynId = dynEl ? dynEl.getAttribute('data-dyn-id') : '';
              var dyn = dynId ? dynamicById(dynId) : null;
              if (dyn) product = productOf(dyn);
            }
            if (product) openDetail(ctx, product);
          } else if (action === 'primary-action') {
            var resale = target.getAttribute('data-resale') === '1';
            ctx.toast(resale ? '邀请帮卖入口（本轮为演示反馈）' : '已复制转发链接（演示）');
          } else if (action === 'forward-action') {
            ctx.toast('转发入口（本轮为演示反馈）');
          } else if (action === 'more-actions') {
            openActionSheet(ctx);
          } else if (action === 'empty-publish') {
            ctx.navigate('publish-product');
          } else if (action === 'retry-load') {
            renderList(ctx, listEl);
          }
        });
      }
      bindDelegated();

      if (publishEntry) {
        publishEntry.addEventListener('click', function () {
          ctx.navigate('publish-product');
        });
      }

      if (searchEntry) {
        searchEntry.addEventListener('click', function () {
          openSearchModal(ctx);
        });
      }

      /* 发布完成 navigate 回 album-product-feed 时，host-tab 不会重跑 init，
         用 hashchange 监听回到动态流时重绘列表，让新发布的内容即时出现 */
      function onReturnToFeed() {
        var m = (window.location.hash || '').match(/^#\/([^/?#]+)/);
        var id = m ? decodeURIComponent(m[1]) : '';
        if (id === 'album-product-feed') renderList(ctx, listEl);
      }
      window.addEventListener('hashchange', onReturnToFeed);
      ctx.onDestroy(function () {
        window.removeEventListener('hashchange', onReturnToFeed);
      });
    }
  });


  /* ── 搜索弹窗（全屏模态，静态触发入口）── */
  function searchModalTemplate() {
    return '<div class="modal modal--fullscreen" data-component-slug="modal" data-state="open" role="dialog" aria-modal="true" aria-label="搜索">'
      + '<div class="modal__panel">'
      + '<div class="modal__title modal__title--default"><div class="navbar" data-component-slug="navbar"><div class="navbar__body navbar__body--spaced">'
      + '<div class="navbar__left"><button type="button" class="navbar__left-btn" data-dom-id="search-close" aria-label="返回"><i class="wego-iconfont-s icon-zuojiantou16" aria-hidden="true"></i></button></div>'
      + '<div class="navbar__center"><span class="navbar__title">搜索</span></div>'
      + '<div class="navbar__right"></div>'
      + '</div></div></div>'
      + '<div class="modal__body modal__body--safe-bottom">'
      + '<div class="album-feed__search-box"><div class="searchbox searchbox--md searchbox--white" data-component-slug="search"><span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span><div class="searchbox__input"><input class="searchbox__field" type="search" placeholder="搜索商品动态" data-search-input /></div><div class="searchbox__actions"></div></div></div>'
      + '<div class="album-feed__search-results" data-search-results></div>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  function openSearchModal(ctx) {
    ctx.openFullScreenModal(searchModalTemplate(), {
      label: '搜索动态',
      init: function (overlayCtx) {
        var r = overlayCtx.root;
        var input = r.querySelector('[data-search-input]');
        var results = r.querySelector('[data-search-results]');
        var closeBtn = r.querySelector('[data-dom-id="search-close"]');

        function renderSearch(keyword) {
          keyword = (keyword || '').trim().toLowerCase();
          var dynamics = mergedDynamics();
          if (keyword) {
            dynamics = dynamics.filter(function (dyn) {
              var product = productOf(dyn);
              var hay = ((dyn.text_content || '') + ' ' + (product ? (product.name + ' ' + (product.selling_points || []).join(' ')) : '')).toLowerCase();
              return hay.indexOf(keyword) >= 0;
            });
          }
          if (!dynamics.length) {
            results.innerHTML = '<div class="album-feed__empty"><i class="wego-iconfont-s icon-sousuo album-feed__empty-icon" aria-hidden="true"></i><span class="album-feed__empty-text">没有找到相关动态</span></div>';
            return;
          }
          var html = '';
          dynamics.forEach(function (dyn) { html += feedCardTemplate(dyn); });
          results.innerHTML = html;
        }

        renderSearch('');
        if (input) input.addEventListener('input', function () { renderSearch(input.value); });
        if (closeBtn) closeBtn.addEventListener('click', function () { ctx.closeOverlay(); });
      }
    });
  }

  function openActionSheet(ctx) {
    ctx.openSheet(actionSheetTemplate(), {
      label: '动态操作',
      init: function (sheetCtx) {
        var sheetRoot = sheetCtx.root;
        sheetRoot.querySelectorAll('.actionsheet__item').forEach(function (item) {
          item.addEventListener('click', function () {
            var label = item.getAttribute('data-action-label');
            ctx.closeOverlay();
            ctx.toast('已执行「' + label + '」（本轮为演示反馈）');
          });
        });
        var cancel = sheetRoot.querySelector('[data-close-action-sheet]');
        if (cancel) cancel.addEventListener('click', function () { ctx.closeOverlay(); });
      }
    });
  }

  function openDetail(ctx, product) {
    ctx.openFullScreenModal(productDetailTemplate(product), {
      label: '产品详情',
      init: function (overlayCtx) {
        var r = overlayCtx.root;
        var closeBtn = r.querySelector('[data-dom-id="close-detail"]');
        if (closeBtn) closeBtn.addEventListener('click', function () { ctx.closeOverlay(); });
      }
    });
  }

  function openImageViewer(ctx, src) {
    ctx.openFullScreenModal(imageViewerTemplate(src), {
      label: '查看图片',
      init: function (overlayCtx) {
        var r = overlayCtx.root;
        var closeBtn = r.querySelector('[data-dom-id="close-viewer"]');
        if (closeBtn) closeBtn.addEventListener('click', function () { ctx.closeOverlay(); });
      }
    });
  }
})();
