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
      { "binding_id": "feed-navbar", "slug": "navbar", "reason": "动态 tab 顶部导航：左对齐大标题「动态」，右侧仅保留搜索入口；发布入口改为右下角悬浮按钮（与我的页共用公共组件）", "variant_dimensions": { "leftControl": "none", "titleAlignment": "left-wide", "actions": "icon", "rightActionType": "icon", "spacing": "default", "pageTransition": "push", "position": "sticky" } }
    ],
    "layout_contract": {
      "mode": "composed",
      "page_edge_mode": "M0",
      "mutable_regions": [".album-feed__scroll", ".album-feed__list"]
    },
    "interaction_contract": [
      { "dom_id": "open-publish-sheet", "target": "overlay:sheet" },
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
    'dyn-01': { distribution_type: 1, distribution_config: { amountType: 1, value: 30 }, supply_price: 98 },
    'dyn-03': { distribution_type: 1, distribution_config: { amountType: 2, rate: 0.3 }, supply_price: 112 },
    'dyn-05': { distribution_type: 2, distribution_config: { amountType: 1, value: 100 }, supply_price: 139, current_price: 239, commission: 100 },
    'dyn-07': { distribution_type: 2, distribution_config: { amountType: 1, value: 100 }, supply_price: 169, current_price: 269, commission: 100 }
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

  /* 单图朝向：按图片真实宽高比判定（宽≈高→正方，宽>高→横版，宽<高→竖版） */
  function classifyOrientation(w, h) {
    if (!w || !h) return 'square';
    var ratio = w / h;
    if (ratio >= 0.95 && ratio <= 1.05) return 'square';
    return ratio > 1 ? 'landscape' : 'portrait';
  }

  /* 渲染后按已加载图片的真实尺寸，回填单图朝向修饰类（已缓存图片无闪烁，未加载则监听 load 后修正） */
  function applySingleImageOrientation(root) {
    var imgs = root.querySelectorAll('.wg-image-grid__single-img[data-probe]');
    Array.prototype.forEach.call(imgs, function (img) {
      if (img.getAttribute('data-probed')) return;
      function setOrientation(ori) {
        var box = img.closest ? img.closest('.wg-image-grid--single') : null;
        if (box) {
          box.classList.remove('wg-image-grid--square', 'wg-image-grid--landscape', 'wg-image-grid--portrait');
          box.classList.add('wg-image-grid--' + ori);
        }
        img.setAttribute('data-probed', '1');
      }
      if (img.complete && img.naturalWidth) {
        setOrientation(classifyOrientation(img.naturalWidth, img.naturalHeight));
      } else {
        img.addEventListener('load', function () { setOrientation(classifyOrientation(img.naturalWidth, img.naturalHeight)); });
        img.addEventListener('error', function () { setOrientation('square'); });
      }
    });
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

  /* 价格拆分为「¥ 符号 + 整数 + 小数」，整数用数字字体放大，对齐设计稿 price 组件 */
  function priceHtml(p) {
    if (!p) return '';
    var s = String(p.price);
    var dot = s.indexOf('.');
    var yuan = dot >= 0 ? s.slice(0, dot) : s;
    var cents = dot >= 0 ? s.slice(dot) : '';
    return '<span class="album-feed__product-price">'
      + '<i class="album-feed__price-symbol">¥</i>'
      + '<span class="album-feed__price-num">' + yuan + '</span>'
      + (cents ? '<span class="album-feed__price-cents">' + cents + '</span>' : '')
      + '</span>';
  }

  /* ── 动态卡片模板 ── */
  function feedCardTemplate(dyn) {
    var pub = publisherById(dyn.publisher_id);
    var product = productOf(dyn);
    /* 媒体项：保留 video / image 类型与播放时长，单图按真实尺寸判定朝向，多图统一 3 列行式填充 */
    var items = (dyn.media_list || []).map(function (m) {
      return { src: m.poster_or_src, type: m.media_type, duration: m.duration_label };
    }).filter(function (m) { return !!m.src; });
    var resale = isResaleDynamic(dyn);
    var text = dyn.text_content || '';

    var mediaHtml = '';
    if (items.length === 1) {
      /* 单图：正方形 / 横版(4:3) / 竖版(3:4) 三朝向由运行时按图片真实尺寸判定（默认正方，加载后修正）；
         最大封顶在 9 宫格左上 2×2（≈192）盒内；首媒体为 video 时叠加播放角标 */
      var single = items[0];
      var singlePlay = single.type === 'video'
        ? '<span class="wg-image-grid__play" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="12"/><path d="M10 8 L16 12 L10 16 Z"/></svg></span>'
        : '';
      mediaHtml = '<div class="album-feed__media"><div class="wg-image-grid wg-image-grid--single wg-image-grid--square">'
        + '<button type="button" class="wg-image-grid__single" data-component-slug="button" data-action="view-image" data-img="' + single.src + '">'
        + '<img class="wg-image-grid__single-img" src="' + single.src + '" alt="" data-probe />'
        + singlePlay
        + '</button></div></div>';
    } else if (items.length > 1) {
      /* 多图九宫格：统一消费设计系统组件 .wg-image-grid--dynamic（3 列，行数随数量 1/2/3 行，尾部空格，最多 9 张）；
         外层 .album-feed__media 仅负责头像列缩进，不参与栅格；首媒体为 video 时首格叠加播放角标 */
      mediaHtml = '<div class="album-feed__media"><div class="wg-image-grid wg-image-grid--dynamic">';
      items.slice(0, 9).forEach(function (m, i) {
        var playBadge = (i === 0 && m.type === 'video')
          ? '<span class="wg-image-grid__play" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="12"/><path d="M10 8 L16 12 L10 16 Z"/></svg></span>'
          : '';
        mediaHtml += '<button type="button" class="wg-image-grid__item" data-component-slug="button" data-action="view-image" data-img="' + m.src + '">'
          + '<img class="album-feed__media-img" src="' + m.src + '" alt="" />'
          + playBadge
          + '</button>';
      });
      mediaHtml += '</div></div>';
    }

    var badgeHtml = resale ? '<span class="badge album-feed__resale-badge" data-component-slug="badge">可帮卖</span>' : '';

    var productHtml = '';
    if (product) {
      productHtml = '<button type="button" class="album-feed__product" data-component-slug="button" data-action="open-detail" data-product-id="' + product.product_id + '">'
        + '<span class="album-feed__product-body">'
        + '<img class="album-feed__product-thumb" src="' + (product.image_list && product.image_list[0] ? product.image_list[0] : '') + '" alt="" />'
        + '<span class="album-feed__product-info">'
        + '<span class="album-feed__product-name">' + product.name + '</span>'
        + priceHtml(product)
        + '</span>'
        + badgeHtml
        + '<i class="wego-iconfont-s icon-arrow-right album-feed__product-arrow" aria-hidden="true"></i>'
        + '</span>'
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
      + '<button type="button" class="album-feed__more" data-component-slug="button" data-action="more-actions" data-dyn-id="' + dyn.dynamic_id + '" aria-label="更多操作"><i class="wego-iconfont-s icon-sandian16" aria-hidden="true"></i></button>'
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

  /* 骨架屏：与真实卡片结构一一对应（头部 / 文字 / 九宫格图 / 产品卡 / 操作区），
     按设计稿骨架屏变体（componentId 9685:80044）组合 skeleton 原子块；列表展示 2 个 item */
  function feedSkeletonItem() {
    var cells = '';
    for (var i = 0; i < 9; i++) {
      cells += '<span class="wg-skeleton wg-skeleton--rect"></span>';
    }
    return '<div class="album-feed__skeleton-item" aria-hidden="true">'
      + '<div class="album-feed__skeleton-head">'
      + '<span class="wg-skeleton wg-skeleton--circle" style="width:40px;height:40px"></span>'
      + '<div class="album-feed__skeleton-meta">'
      + '<span class="wg-skeleton wg-skeleton--text" style="width:88px;height:20px"></span>'
      + '<span class="wg-skeleton wg-skeleton--text" style="width:120px;height:14px"></span>'
      + '</div>'
      + '</div>'
      + '<div class="album-feed__skeleton-block">'
      + '<span class="wg-skeleton wg-skeleton--text" style="width:100%"></span>'
      + '<span class="wg-skeleton wg-skeleton--text" style="width:60%"></span>'
      + '</div>'
      + '<div class="album-feed__skeleton-block">'
      + '<div class="album-feed__skeleton-grid">' + cells + '</div>'
      + '</div>'
      + '<div class="album-feed__skeleton-block">'
      + '<div class="album-feed__skeleton-product">'
      + '<span class="wg-skeleton wg-skeleton--rect" style="width:48px;height:48px"></span>'
      + '<div class="album-feed__skeleton-meta">'
      + '<span class="wg-skeleton wg-skeleton--text" style="width:122px;height:14px"></span>'
      + '<span class="wg-skeleton wg-skeleton--text" style="width:79px;height:14px"></span>'
      + '</div>'
      + '<span class="wg-skeleton wg-skeleton--rect" style="width:40px;height:20px"></span>'
      + '</div>'
      + '</div>'
      + '<div class="album-feed__skeleton-actions">'
      + '<span class="wg-skeleton wg-skeleton--rect" style="width:24px;height:16px"></span>'
      + '<span class="wg-skeleton wg-skeleton--rect" style="width:24px;height:16px"></span>'
      + '<span class="wg-skeleton wg-skeleton--rect" style="width:24px;height:16px"></span>'
      + '<span class="wg-skeleton wg-skeleton--rect" style="width:80px;height:32px;margin-left:auto"></span>'
      + '</div>'
      + '</div>';
  }

  function feedSkeletonTemplate() {
    return '<div class="album-feed__skeleton">'
      + feedSkeletonItem()
      + feedSkeletonItem()
      + '</div>';
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
      html += '<button type="button" class="actionsheet__item" data-component-slug="button" data-action-label="' + label + '">'
        + '<div class="actionsheet__item-main"><div class="actionsheet__item-title">' + label + '</div></div>'
        + '</button>';
    });
    html += '</div>';
    html += '<div class="actionsheet__cancel-gap"></div>';
    html += '<button type="button" class="actionsheet__cancel" data-component-slug="button" data-close-action-sheet>取 消</button>';
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
      + '<button type="button" class="album-feed__viewer-close" data-component-slug="button" data-dom-id="close-viewer" aria-label="关闭"><i class="wego-iconfont-s icon-guanbi" aria-hidden="true"></i></button>'
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
    applySingleImageOrientation(listEl);
  }

  window.WegoApp.registerScene({
    routeId: 'album-product-feed',
    template: `
<div class="layout-page album-feed" data-surface-id="album-product-feed" data-route-id="album-product-feed" data-layout-mode="composed" data-bg="surface" data-component-slug="layout-page">
  <div class="layout-page__top">
    <div class="navbar album-feed__navbar" data-component-slug="navbar">
      <div class="navbar__body navbar__body--split">
        <div class="navbar__left"><span class="navbar__title album-feed__nav-title">动态</span></div>
        <div class="navbar__right"></div>
      </div>
    </div>
  </div>
  <div class="layout-page__body">
    <div class="layout-scroll album-feed__scroll" data-component-slug="layout-scroll" data-tab-scroll>
      <div class="sticky-region album-feed__search-sticky" data-component-slug="sticky-region" data-edge="top" data-visibility="direction-reveal" data-state="visible">
        <div class="sticky-region__motion">
          <div class="sticky-region__inner">
            <div class="album-feed__searchbar">
              <div class="searchbox searchbox--md searchbox--white searchbox--accent" data-component-slug="search" data-search-input-host><span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span><div class="searchbox__input"><input class="searchbox__field" type="search" placeholder="搜索商品动态" data-search-input /></div><div class="searchbox__actions"><button class="btn btn--strong btn--sm" type="button" data-component-slug="button" data-action="select-image" aria-label="图搜">图搜</button></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="album-feed__list" data-feed-list></div>
    </div>
  </div>
  <button class="btn btn--strong btn--lg btn--icon-only wego-fab" data-component-slug="button" data-dom-id="open-publish-sheet" type="button" aria-label="发布内容">
    <i class="btn__icon icon-jia16" aria-hidden="true"></i>
  </button>
</div>`,
    presentation: { type: 'host-tab', transition: 'none', dismissAction: 'tab-switch', overlayLevel: 'inline', coversTabBar: false },
    init: function initAlbumFeed(ctx) {
      var root = ctx.root;
      var listEl = root.querySelector('[data-feed-list]');
      var searchInput = root.querySelector('[data-search-input]');

      ctx.state.keyword = '';
      /* 首次加载先展示骨架屏（2 个 item），短暂加载间隙后过渡到真实列表（本地数据无真实网络延迟） */
      listEl.innerHTML = feedSkeletonTemplate();
      setTimeout(function () {
        renderList(ctx, listEl);
      }, 600);

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
            if (resale) {
              var dyn = dynamicById(target.getAttribute('data-dyn-id'));
              var product = dyn ? productOf(dyn) : null;
              var cfg = resaleConfigOf(dyn) || { distribution_type: 1, distribution_config: { amountType: 1, value: 30 } };
              var retailPrice = (product && product.price != null) ? Number(product.price) : 0;
              // supply_price 取帮卖配置里的供货价（低于零售价）；未配置时回退零售价演示
              var supplyPrice = (cfg && cfg.supply_price != null) ? Number(cfg.supply_price) : retailPrice;
              var isFixed = cfg && cfg.distribution_type === 2;
              window.WegoApp.openAgentResalePopup(ctx, {
                sample: {
                  product_id: product ? product.product_id : '',
                  distribution_type: cfg.distribution_type,
                  distribution_config: cfg.distribution_config,
                  supply_price: supplyPrice,
                  skus: [{ id: 'sku-1', supply_price: supplyPrice }],
                  my_item: false,
                  from_page: 'normal',
                  current_price: isFixed ? (cfg.current_price != null ? Number(cfg.current_price) : retailPrice) : undefined,
                  commission: isFixed ? (cfg.commission != null ? Number(cfg.commission) : 0) : undefined
                }
              });
            } else {
              ctx.toast('已复制转发链接（演示）');
            }
          } else if (action === 'forward-action') {
            ctx.toast('转发入口（本轮为演示反馈）');
          } else if (action === 'more-actions') {
            openActionSheet(ctx);
          } else if (action === 'empty-publish') {
            window.WegoApp.openPublishProductModal(ctx);
          } else if (action === 'retry-load') {
            renderList(ctx, listEl);
          }
        });
      }
      bindDelegated();

      var publishFab = window.WegoApp.createPublishFab(ctx, {
        fabSelector: '[data-dom-id="open-publish-sheet"]',
        onPublish: function (type) {
          if (type === 'product') {
            window.WegoApp.openPublishProductModal(ctx);
          } else {
            var typeLabel = type === 'note' ? '笔记' : '直播';
            ctx.toast('发布' + typeLabel + '（演示）');
          }
        }
      });

      if (searchInput) {
        searchInput.addEventListener('focus', function () {
          openSearchModal(ctx);
        });
      }

      /* 图搜按钮在顶部 sticky 搜索栏内，不在数据列表委托范围内，单独绑定 */
      var imageSearchBtn = root.querySelector('[data-action="select-image"]');
      if (imageSearchBtn) {
        imageSearchBtn.addEventListener('click', function (e) {
          e.preventDefault();
          ctx.toast('图搜（演示）');
        });
      }

      /* 注册滚动布局：搜索框上滑隐藏 / 下滑显示（公共 WegoScrollLayout 运行时接管） */
      ctx.bindScrollLayout({
        scrollRoot: '.album-feed__scroll',
        regions: [
          { selector: '.album-feed__search-sticky', policy: 'direction-reveal', edge: 'top', essential: false, threshold: 8 }
        ]
      });

      /* 发布完成 navigate 回 album-product-feed 时，host-tab 不会重跑 init，
         用 hashchange 监听回到动态流时重绘列表，让新发布的内容即时出现 */
      function onReturnToFeed() {
        var m = (window.location.hash || '').match(/^#\/([^/?#]+)/);
        var id = m ? decodeURIComponent(m[1]) : '';
        if (id === 'album-product-feed') renderList(ctx, listEl);
      }
      window.addEventListener('hashchange', onReturnToFeed);
      ctx.onDestroy(function () {
        publishFab.destroy();
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
          applySingleImageOrientation(results);
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
        /* 蒙层点击关闭：点 actionsheet 组件根节点（遮罩空白区）关闭 */
        sheetRoot.addEventListener('click', function (e) {
          if (e.target === sheetCtx.root) ctx.closeOverlay();
        });
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
