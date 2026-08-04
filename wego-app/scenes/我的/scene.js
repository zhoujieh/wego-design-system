const myTabTemplate = `<div class="layout-page my-tab-page" data-surface-id="my" data-route-id="my" data-layout-mode="composed" data-bg="page" data-component-slug="layout-page">
    <div class="layout-page__top">
      <div class="navbar my-tab-navbar" data-component-slug="navbar">
        <div class="navbar__body navbar__body--split">
          <div class="navbar__left navbar__left--custom">
            <button type="button" class="my-tab-identity" data-action="album-switch" aria-label="切换相册">
              <div class="avatar avatar--40 avatar--image" data-component-slug="avatar">
                <img data-role="profile-avatar" alt="">
              </div>
              <span class="my-tab-identity__copy">
                <span class="my-tab-identity__name" data-role="profile-name"></span>
                <span class="my-tab-identity__album"><span data-role="profile-album"></span><i class="wego-iconfont-s icon-shangxiajiantou16" aria-hidden="true"></i></span>
              </span>
            </button>
          </div>
          <div class="navbar__right navbar__right--icon">
            <button type="button" class="navbar__action" data-action="settings" aria-label="设置">
              <span class="navbar__action-icon"><i class="wego-iconfont-s icon-shezhi" aria-hidden="true"></i></span>
              <span class="navbar__action-label">设置</span>
            </button>
            <button type="button" class="navbar__action" data-action="share-homepage" aria-label="分享主页">
              <span class="navbar__action-icon"><i class="wego-iconfont-s icon-fenxiang" aria-hidden="true"></i></span>
              <span class="navbar__action-label">分享</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="layout-page__body">
      <div class="layout-scroll my-tab-scroll" data-component-slug="layout-scroll" data-tab-scroll>
        <section class="layout-section my-tab-section my-tab-section--membership" data-component-slug="layout-section" data-edge="M8">
          <div class="card card--surface my-membership-card" data-component-slug="card">
            <div class="card__content my-membership-card__content">
              <div class="card__header my-membership-card__header">
                <div class="my-membership-card__level">
                  <i class="wego-iconfont-s icon-dianpuhuiyuan" aria-hidden="true"></i>
                  <span>SVIP 3</span>
                </div>
                <span class="my-membership-card__expiry">2027-08-31 到期</span>
              </div>
              <div class="card__body my-membership-card__body">
                <span class="my-membership-card__cloud">云空间</span>
                <span class="my-membership-card__progress" role="progressbar" aria-valuenow="37" aria-valuemin="0" aria-valuemax="100" aria-label="云空间已使用百分之三十七">
                  <span class="my-membership-card__progress-value"></span>
                </span>
                <span class="my-membership-card__usage">36.8 / 100 GB</span>
              </div>
            </div>
          </div>
        </section>

        <section class="layout-section my-tab-section" data-component-slug="layout-section" data-edge="M8">
          <div class="card card--surface card--vertical my-entry-card" data-component-slug="card">
            <div class="card__content my-entry-card__content">
              <div class="card__header my-section-heading">
                <h2>数据资产</h2>
              </div>
              <div class="card__body" data-region="assets"></div>
            </div>
          </div>
        </section>

        <section class="layout-section my-tab-section" data-component-slug="layout-section" data-edge="M8">
          <div class="card card--surface card--vertical my-entry-card" data-component-slug="card">
            <div class="card__content my-entry-card__content">
              <div class="card__header my-section-heading">
                <h2>常用应用</h2>
              </div>
              <div class="card__body" data-region="apps"></div>
            </div>
          </div>
        </section>

        <div class="sticky-region my-content-tabs-sticky" data-component-slug="sticky-region" data-edge="top" data-visibility="elevate-after-scroll" data-state="visible">
          <div class="sticky-region__motion">
            <div class="sticky-region__inner">
              <div class="wg-tabs wg-tabs--mini wg-tabs--divide my-content-tabs" data-component-slug="tabs" role="tablist" aria-label="内容类型">
                <div class="wg-tabs__scroll">
                  <button class="wg-tabs__item" type="button" role="tab" aria-selected="true" data-content-type="product">
                    <span class="wg-tabs__content"><span class="wg-tabs__label">产品</span></span>
                  </button>
                  <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-content-type="note">
                    <span class="wg-tabs__content"><span class="wg-tabs__label">笔记</span></span>
                  </button>
                  <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-content-type="live">
                    <span class="wg-tabs__content"><span class="wg-tabs__label">直播</span></span>
                  </button>
                  <span class="wg-tabs__active-indicator" aria-hidden="true"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky-region my-content-search-sticky" data-component-slug="sticky-region" data-edge="top" data-visibility="direction-reveal" data-state="visible">
          <div class="sticky-region__motion">
            <div class="sticky-region__inner">
              <div class="search-toolbar my-content-toolbar">
                <div class="searchbox searchbox--sm searchbox--gray" data-component-slug="search">
                  <span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>
                  <div class="searchbox__input">
                    <input class="searchbox__field" data-role="content-search" type="search" placeholder="搜索产品" aria-label="搜索产品">
                  </div>
                  <div class="searchbox__actions">
                    <button class="searchbox__action searchbox__clear wego-iconfont-s icon-yuancha-mian" data-action="clear-search" type="button" aria-label="清除搜索" hidden></button>
                  </div>
                </div>
                <div class="search-toolbar__actions">
                  <button class="search-toolbar__action" data-action="view-toggle" type="button">
                    <span class="search-toolbar__action-icon wego-iconfont-s icon-liebiao" data-role="view-icon" aria-hidden="true"></span>
                    <span data-role="view-label">列表</span>
                  </button>
                  <button class="search-toolbar__action" data-action="filter" type="button">
                    <span class="search-toolbar__action-icon wego-iconfont-s icon-shaixuan" aria-hidden="true"></span>
                    筛选
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section class="layout-section my-content-management-section" data-component-slug="layout-section" data-edge="M0">
              <div class="my-content-management" data-role="content-management">
                <span class="my-content-management__count" data-role="content-count">共 0 条</span>
                <div class="my-content-management__actions">
                  <a class="link link--12" data-component-slug="link" href="javascript:void(0)" role="button" data-management-action="sort">排序</a>
                  <a class="link link--12" data-component-slug="link" href="javascript:void(0)" role="button" data-management-action="category">分类</a>
                  <a class="link link--12" data-component-slug="link" href="javascript:void(0)" role="button" data-management-action="batch">批量</a>
                  <a class="link link--12" data-component-slug="link" href="javascript:void(0)" role="button" data-management-action="collection" hidden>合集</a>
                </div>
              </div>
        </section>

        <section class="layout-section my-content-section" data-component-slug="layout-section" data-edge="M0" data-region="content"></section>
      </div>
    </div>

    <button class="btn btn--strong btn--lg btn--icon-only my-tab-fab" data-component-slug="button" data-dom-id="open-publish-sheet" type="button" aria-label="发布内容">
      <i class="btn__icon icon-jia16" aria-hidden="true"></i>
    </button>
  </div>`;

(function registerMyTabScene() {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .split('&').join('&amp;')
      .split('<').join('&lt;')
      .split('>').join('&gt;')
      .split('"').join('&quot;')
      .split("'").join('&#39;');
  }

  function safeRead(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function metricHtml(metric, options) {
    var config = options || {};
    var decimal = metric.decimal ? '<span class="metric__decimal">' + escapeHtml(metric.decimal) + '</span>' : '';
    var unit = metric.unit ? '<span class="metric__unit">' + escapeHtml(metric.unit) + '</span>' : '';
    var symbol = metric.symbol ? '<span class="metric__symbol">' + escapeHtml(metric.symbol) + '</span>' : '';
    return '<span class="metric metric--' + (config.size || '16') + ' metric--' + (config.theme || 'black') + '" data-component-slug="metric">'
      + '<span class="metric__main">' + symbol
      + '<span class="metric__value"><span class="metric__integer">' + escapeHtml(metric.integer) + '</span>' + decimal + unit + '</span>'
      + '</span></span>';
  }

  function imageHtml(src, alt, className) {
    return '<div class="wg-image wg-image--custom-rect wg-image--rounded-md ' + className + '" data-component-slug="image">'
      + '<img class="wg-image__src" src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt) + '">'
      + '</div>';
  }

  window.WegoApp.registerScene({
    routeId: 'my',
    presentation: { type: 'host-tab' },
    template: myTabTemplate,
    skeletonMode: 'explicit',
    // SKELETON-TEMPLATE-START
    skeletonTemplate: `
<div class="my-tab-skeleton-surface" aria-hidden="true"></div>
<div class="my-tab-skeleton-panel" style="top:14.264%;left:2.139%;width:95.722%;height:8.618%;border-radius:8px;box-sizing:border-box" aria-hidden="true"></div>
<div class="my-tab-skeleton-panel" style="top:24.071%;left:2.139%;width:95.722%;height:13.670%;border-radius:8px;box-sizing:border-box" aria-hidden="true"></div>
<div class="my-tab-skeleton-panel" style="top:38.930%;left:2.139%;width:95.722%;height:13.967%;border-radius:8px;box-sizing:border-box" aria-hidden="true"></div>
<div class="my-tab-skeleton-panel" style="top:54.086%;left:0.000%;width:100.000%;height:16.939%;border-radius:0px;box-sizing:border-box" aria-hidden="true"></div>
<div class="my-tab-skeleton-panel" style="top:72.214%;left:2.139%;width:46.791%;height:37.296%;border-radius:8px;box-sizing:border-box" aria-hidden="true"></div>
<div class="my-tab-skeleton-panel" style="top:72.214%;left:51.070%;width:46.791%;height:37.296%;border-radius:8px;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--circle" style="position:absolute;top:6.835%;left:2.139%;width:10.695%;height:5.944%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:7.132%;left:14.973%;width:22.460%;height:3.269%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:10.401%;left:14.973%;width:19.786%;height:2.080%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:6.538%;left:75.401%;width:11.765%;height:6.538%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:6.538%;left:87.166%;width:11.765%;height:6.538%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:15.453%;left:5.348%;width:17.158%;height:3.269%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:16.048%;left:72.978%;width:21.674%;height:2.080%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:19.614%;left:5.348%;width:89.305%;height:2.080%;border-radius:999px;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:25.260%;left:2.139%;width:95.722%;height:3.566%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:40.119%;left:2.139%;width:95.722%;height:3.566%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:30.015%;left:9.571%;width:2.569%;height:3.269%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:33.581%;left:4.278%;width:13.156%;height:2.377%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:30.163%;left:22.782%;width:8.322%;height:3.269%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:33.730%;left:24.269%;width:5.348%;height:2.080%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:30.163%;left:36.451%;width:7.190%;height:3.269%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:33.730%;left:37.370%;width:5.348%;height:2.080%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:30.163%;left:49.223%;width:4.880%;height:3.269%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:33.730%;left:48.989%;width:5.348%;height:2.080%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:45.022%;left:6.417%;width:6.417%;height:3.566%;border-radius:6px;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:48.886%;left:4.278%;width:10.695%;height:2.080%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:45.022%;left:21.123%;width:6.417%;height:3.566%;border-radius:6px;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:48.886%;left:20.321%;width:8.021%;height:2.080%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:44.874%;left:37.325%;width:6.417%;height:3.566%;border-radius:6px;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:48.737%;left:33.690%;width:13.691%;height:2.377%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:45.022%;left:54.867%;width:6.417%;height:3.566%;border-radius:6px;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:48.886%;left:52.728%;width:10.695%;height:2.080%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:54.086%;left:2.139%;width:31.906%;height:8.172%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:54.086%;left:34.045%;width:31.910%;height:8.172%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:54.086%;left:65.955%;width:31.906%;height:8.172%;box-sizing:border-box" aria-hidden="true"></div>
<div class="wg-skeleton wg-skeleton--rect" style="position:absolute;top:62.407%;left:2.139%;width:95.722%;height:8.618%;box-sizing:border-box" aria-hidden="true"></div>
    `,
    // SKELETON-TEMPLATE-END
    init: function init(ctx) {
      var root = ctx.root.querySelector('[data-route-id="my"]');
      var db = window.WEGO_PROTOTYPE_DB || {};
      var currentUser = db.currentUser || {};
      var products = Array.isArray(db.products) ? db.products : [];
      var dynamics = Array.isArray(db.dynamics) ? db.dynamics : [];
      var state = ctx.state;
      var viewStorageKey = 'wego-my-content-views';
      var searchStorageKey = 'wego-my-content-searches';
      var recentStorageKey = 'wego-my-recent-apps';
      var destroyed = false;
      var publishTimer = 0;
      var popoverHandles = [];

      state.activeType = state.activeType || 'product';
      state.viewByType = Object.assign({ product: 'list', note: 'list', live: 'grid' }, safeRead(viewStorageKey, {}), state.viewByType || {});
      state.searchByType = Object.assign({ product: '', note: '', live: '' }, safeRead(searchStorageKey, {}), state.searchByType || {});
      state.purchaseTodoCount = Number.isFinite(state.purchaseTodoCount) ? state.purchaseTodoCount : 2;
      state.cartItemCount = Number.isFinite(state.cartItemCount) ? state.cartItemCount : 3;
      state.published = state.published || { product: [], note: [], live: [] };
      state.removedContentIds = state.removedContentIds || [];
      state.pinnedContentIds = state.pinnedContentIds || [];

      var recentCatalog = {
        product_manager: { id: 'product_manager', label: '商品管理', icon: './lib/assets/icons/app-center/商品管理.svg' },
        customer_manager: { id: 'customer_manager', label: '客户管理', icon: './lib/assets/icons/app-center/客户管理.svg' },
        inventory_manager: { id: 'inventory_manager', label: '库存管理', icon: './lib/assets/icons/app-center/库存管理.svg' },
        sales_report: { id: 'sales_report', label: '销售报表', icon: './lib/assets/icons/app-center/销售报表.svg' },
        quick_publish: { id: 'quick_publish', label: '快捷发布', icon: './lib/assets/icons/app-center/快捷发布.svg' }
      };
      var savedRecent = safeRead(recentStorageKey, ['product_manager', 'customer_manager', 'inventory_manager']);
      state.recentApps = Array.isArray(savedRecent) ? savedRecent.filter(function (id) { return Boolean(recentCatalog[id]); }) : [];

      var assetEntries = [
        { id: 'purchases', label: '我买的', metric: { integer: String(state.purchaseTodoCount) }, conditional: state.purchaseTodoCount > 0, todo: true },
        { id: 'fans', label: '粉丝', metric: { integer: '1', decimal: '.2', unit: '万' }, conditional: true },
        { id: 'friends', label: '好友', metric: { integer: '386' }, conditional: true },
        { id: 'agents', label: '代理', metric: { integer: '28' }, conditional: true },
        { id: 'visitors', label: '访客', metric: { integer: '1,280' }, conditional: true },
        { id: 'employees', label: '员工', metric: { integer: '12' }, conditional: true },
        { id: 'wallet', label: '钱包', metric: { symbol: '¥', integer: '8,420' }, conditional: true },
        { id: 'coupons', label: '卡券', metric: { integer: '6' }, conditional: true },
        { id: 'favorites', label: '收藏', metric: { integer: '324' }, conditional: true }
      ];

      function productById(id) {
        return products.find(function (item) { return item.product_id === id; }) || null;
      }

      function relatedProduct(dynamic) {
        var id = dynamic && Array.isArray(dynamic.related_product_ids) ? dynamic.related_product_ids[0] : '';
        return productById(id);
      }

      function productContent() {
        return products.slice(0, 8).map(function (product, index) {
          var dynamic = dynamics.find(function (item) {
            return Array.isArray(item.related_product_ids) && item.related_product_ids.includes(product.product_id);
          });
          return {
            id: product.product_id,
            type: 'product',
            title: product.name,
            images: (product.image_list || []).slice(0, 4),
            price: product.price,
            updatedAt: dynamic ? dynamic.published_at : '近期更新',
            order: index
          };
        });
      }

      function noteContent() {
        return dynamics.filter(function (item) { return item.content_type === 'note'; }).map(function (dynamic, index) {
          var product = relatedProduct(dynamic) || products[index] || {};
          var media = dynamic.media_list && dynamic.media_list[0];
          return {
            id: dynamic.dynamic_id,
            type: 'note',
            title: product.name || '穿搭笔记',
            summary: dynamic.text_content,
            cover: media ? media.poster_or_src : (product.image_list && product.image_list[0]),
            updatedAt: dynamic.published_at,
            order: index
          };
        });
      }

      function liveContent() {
        var schedule = ['今天 19:30', '明天 14:00', '周五 20:00', '周日 15:30'];
        return products.slice(8, 12).map(function (product, index) {
          return {
            id: 'live-' + product.product_id,
            type: 'live',
            title: product.name + '专场',
            cover: product.image_list && product.image_list[0],
            host: currentUser.display_name || currentUser.merchant_name,
            time: schedule[index],
            order: index
          };
        });
      }

      function activateImages(container) {
        Array.prototype.forEach.call(container.querySelectorAll('.wg-image__src'), function (image) {
          function markLoaded() { image.classList.add('is-loaded'); }
          image.addEventListener('load', markLoaded, { once: true });
          if (image.complete && image.naturalWidth) markLoaded();
        });
      }

      function setProfile() {
        var avatar = root.querySelector('[data-role="profile-avatar"]');
        var name = root.querySelector('[data-role="profile-name"]');
        var album = root.querySelector('[data-role="profile-album"]');
        if (avatar) avatar.src = currentUser.avatar || './lib/assets/image/avatar-defult.png';
        if (name) name.textContent = currentUser.display_name || currentUser.merchant_name || '我的相册';
        if (album) album.textContent = '春夏新品相册';
      }

      function renderAssets() {
        var html = '<div class="layout-scroll-row my-asset-row" data-component-slug="layout-scroll-row" data-item-size="compact" data-snap="start" data-peek="next">';
        assetEntries.filter(function (item) { return item.conditional; }).forEach(function (item) {
          html += '<button type="button" class="my-asset-entry" data-asset-id="' + item.id + '">'
            + '<span class="my-entry-metric">' + metricHtml(item.metric, { size: '14', theme: 'black' });
          if (item.todo) html += '<span class="badge badge--corner badge--number" data-component-slug="badge">' + state.purchaseTodoCount + '</span>';
          html += '</span><span class="my-entry-label">' + escapeHtml(item.label) + '</span></button>';
        });
        html += '</div>';
        ctx.setRegion('assets', html);
      }

      function appIcon(icon, label, count) {
        var badge = count ? '<span class="badge badge--corner badge--number" data-component-slug="badge">' + count + '</span>' : '';
        return '<span class="my-app-icon-wrap"><span class="my-app-icon"><img src="' + escapeHtml(icon) + '" alt=""></span>' + badge + '</span><span class="my-app-label">' + escapeHtml(label) + '</span>';
      }

      function renderApps() {
        var appItems = [
          { id: 'homepage', label: '进入主页', icon: './lib/assets/icons/app-center/我的小店.svg', fixed: true },
          { id: 'qr_code', label: '二维码', icon: './lib/assets/icons/app-center/相册网址.svg', fixed: true }
        ];
        if (state.cartItemCount > 0) appItems.push({ id: 'cart', label: '购物车', icon: './lib/assets/icons/app-center/采购单.svg', fixed: true, count: state.cartItemCount });
        state.recentApps.forEach(function (id) { appItems.push(recentCatalog[id]); });
        appItems.push({ id: 'all_apps', label: '全部', icon: './lib/assets/icons/app-center/全部应用.svg', fixed: true });

        var html = '<div class="layout-scroll-row my-app-row" data-component-slug="layout-scroll-row" data-item-size="compact" data-snap="start" data-peek="next">';
        appItems.forEach(function (item) {
          if (!item) return;
          html += '<button type="button" class="my-app-entry" data-app-id="' + item.id + '">' + appIcon(item.icon, item.label, item.count) + '</button>';
        });
        html += '</div>';
        ctx.setRegion('apps', html);
      }

      function priceMetric(price) {
        var parts = String(price).split('.');
        return metricHtml({ symbol: '¥', integer: parts[0], decimal: parts[1] ? '.' + parts[1] : '' }, { size: '18', theme: 'marketing' });
      }

      function actionButton(item, action, label) {
        return '<a class="link my-content-action my-content-action--' + action + '" data-component-slug="link" href="javascript:void(0)" role="button" data-content-operation="' + action + '" data-content-id="' + escapeHtml(item.id) + '" data-content-type="' + escapeHtml(item.type) + '">' + label + '</a>';
      }

      function contentActions(item) {
        return '<div class="my-content-actions" data-content-actions>'
          + '<div class="my-content-actions__leading">'
          + actionButton(item, 'delete', '删除')
          + actionButton(item, 'download', '下载')
          + actionButton(item, 'refresh', '刷新')
          + actionButton(item, 'edit', '编辑')
          + '</div><div class="my-content-actions__trailing">'
          + '<button class="my-content-action my-content-action--more" type="button" data-content-more data-content-id="' + escapeHtml(item.id) + '" data-content-type="' + escapeHtml(item.type) + '" aria-label="更多操作">•••</button>'
          + '<button class="btn btn--weak btn--sm my-content-action--share" data-component-slug="button" type="button" data-content-operation="share" data-content-id="' + escapeHtml(item.id) + '" data-content-type="' + escapeHtml(item.type) + '">分享</button>'
          + '</div>'
          + '</div>';
      }

      function productMedia(item) {
        var images = (item.images || []).filter(Boolean).slice(0, 4);
        if (!images.length) images = ['./lib/assets/icons/default-diagram.svg'];
        return '<div class="my-product-card__media my-product-card__media--count-' + images.length + '">'
          + images.map(function (src, index) { return imageHtml(src, item.title + '图片 ' + (index + 1), 'my-product-card__image'); }).join('')
          + '</div>';
      }

      function productCard(item, view) {
        return '<article class="card card--surface card--vertical my-content-card my-product-card my-product-card--' + view + '" data-component-slug="card">'
          + '<div class="card__content my-content-card__content">'
          + '<div class="my-product-card__main">' + productMedia(item)
          + '<div class="my-product-card__details"><h3 class="my-content-card__title">' + escapeHtml(item.title) + '</h3>'
          + '<div class="my-product-card__footer">' + priceMetric(item.price) + '</div></div></div>'
          + '<button class="my-product-card__attributes" type="button" data-content-operation="attributes" data-content-id="' + escapeHtml(item.id) + '" data-content-type="product">▸ 商品属性</button>'
          + '<div class="card__footer my-content-card__operation-row">' + contentActions(item) + '</div>'
          + '</div></article>';
      }

      function noteCard(item, view) {
        var image = item.cover ? imageHtml(item.cover, item.title, 'my-note-card__media') : '';
        return '<article class="card card--surface card--vertical my-content-card my-note-card my-note-card--' + view + (image ? '' : ' my-note-card--no-image') + '" data-component-slug="card">'
          + '<div class="card__content my-content-card__content">'
          + '<div class="my-note-card__main"><div class="my-note-card__copy"><h3 class="my-content-card__title">' + escapeHtml(item.title) + '</h3>'
          + '<p class="my-note-card__summary">' + escapeHtml(item.summary) + '</p></div>' + image + '</div>'
          + '<div class="card__footer my-content-card__operation-row">' + contentActions(item) + '</div>'
          + '</div></article>';
      }

      function liveCard(item) {
        return '<article class="my-live-card">' + imageHtml(item.cover, item.title, 'my-live-card__media') + '</article>';
      }

      function contentFor(type) {
        var defaults = type === 'product' ? productContent() : type === 'note' ? noteContent() : liveContent();
        var items = (state.published[type] || []).concat(defaults).filter(function (item) { return !state.removedContentIds.includes(item.id); });
        return items.sort(function (left, right) {
          return Number(state.pinnedContentIds.includes(right.id)) - Number(state.pinnedContentIds.includes(left.id));
        });
      }

      function matchesSearch(item, query) {
        if (!query) return true;
        var source = [item.title, item.summary, item.host, item.time, item.price].filter(Boolean).join(' ').toLowerCase();
        return source.includes(query.toLowerCase());
      }

      function dateLabel(value) {
        if (/刚刚|分钟|今天/.test(value || '')) return '今天';
        if (/昨天/.test(value || '')) return '昨天';
        return '更早';
      }

      function groupItemsByDate(items) {
        return items.reduce(function (groups, item) {
          var label = dateLabel(item.updatedAt);
          var group = groups.find(function (entry) { return entry.label === label; });
          if (!group) { group = { label: label, items: [] }; groups.push(group); }
          group.items.push(item);
          return groups;
        }, []);
      }

      function destroyContentPopovers() {
        popoverHandles.forEach(function (entry) {
          entry.handle.destroy();
          entry.popover.remove();
        });
        popoverHandles = [];
      }

      function operationMeta(action) {
        return {
          delete: { label: '删除', icon: 'icon-shanchu' },
          download: { label: '下载', icon: 'icon-xiazai' },
          refresh: { label: '刷新', icon: 'icon-shuaxin' },
          edit: { label: '编辑', icon: 'icon-bianji' },
          pin: { label: '置顶', icon: 'icon-zhiding' },
          copy: { label: '复制', icon: 'icon-fuzhi' }
        }[action];
      }

      function bindContentPopovers() {
        if (!window.WegoPopover) return;
        root.querySelectorAll('[data-content-more]').forEach(function (trigger) {
          var actionRoot = trigger.closest('[data-content-actions]');
          var hiddenActions = ['delete', 'download', 'refresh', 'edit'].filter(function (action) {
            var button = actionRoot.querySelector('[data-content-operation="' + action + '"]');
            return button && window.getComputedStyle(button).display === 'none';
          });
          var actions = hiddenActions.concat(['pin', 'copy']);
          var popover = document.createElement('div');
          popover.className = 'popover popover--action my-content-popover';
          popover.setAttribute('role', 'menu');
          popover.setAttribute('data-variant', 'action');
          popover.setAttribute('data-placement', 'top');
          popover.setAttribute('data-align', 'end');
          popover.setAttribute('data-state', 'closed');
          popover.innerHTML = '<div class="popover__arrow"></div><div class="popover__body"><div class="popover__action-list">'
            + actions.map(function (action) {
              var meta = operationMeta(action);
              return '<button class="popover__action-item" type="button" data-content-operation="' + action + '" data-content-id="' + escapeHtml(trigger.dataset.contentId) + '" data-content-type="' + escapeHtml(trigger.dataset.contentType) + '"><i class="wego-iconfont-s ' + meta.icon + ' popover__action-icon" aria-hidden="true"></i><span class="popover__action-text">' + meta.label + '</span></button>';
            }).join('') + '</div></div>';
          document.body.appendChild(popover);
          var handle = window.WegoPopover.bind(trigger, popover, {
            preferredPlacement: 'top',
            beforeShow: function () { popoverHandles.forEach(function (entry) { entry.handle.hide(); }); },
            onActionItemClick: function (item) { handleContentOperation(item.dataset.contentOperation, item.dataset.contentId, item.dataset.contentType); }
          });
          popoverHandles.push({ popover: popover, handle: handle });
        });
      }

      function renderContent() {
        destroyContentPopovers();
        var type = state.activeType;
        var view = type === 'live' ? 'grid' : state.viewByType[type];
        var query = state.searchByType[type] || '';
        var items = contentFor(type).filter(function (item) { return matchesSearch(item, query); });
        var containerClass = view === 'grid' ? 'layout-grid' : 'layout-flow';
        var componentSlug = view === 'grid' ? 'layout-grid' : 'layout-flow';
        var attributes = view === 'grid' ? ' data-columns="' + (type === 'live' ? '3' : '2') + '" data-align="stretch"' : ' data-direction="vertical" data-align="stretch"';
        var html = '';

        if (!items.length) {
          var typeLabel = type === 'product' ? '产品' : type === 'note' ? '笔记' : '直播';
          html += '<div class="' + containerClass + ' my-content-list my-content-list--' + view + '" data-component-slug="' + componentSlug + '"' + attributes + '><div class="card card--filled card--vertical my-content-empty" data-component-slug="card">'
            + '<i class="wego-iconfont-s icon-sousuo" aria-hidden="true"></i>'
            + '<strong>没有找到相关' + typeLabel + '</strong>'
            + '<span>换个关键词试试</span></div>';
          html += '</div>';
        } else if (type === 'live') {
          html += '<div class="' + containerClass + ' my-content-list my-content-list--grid my-content-list--live" data-component-slug="' + componentSlug + '"' + attributes + '>';
          items.forEach(function (item) { html += liveCard(item); });
          html += '</div>';
        } else {
          groupItemsByDate(items).forEach(function (group) {
            html += '<section class="my-content-date-group"><div class="my-content-date-group__heading"><span>' + group.label + ' ›</span><button type="button" data-date-more="' + group.label + '" aria-label="' + group.label + '更多操作">•••</button></div>';
            html += '<div class="' + containerClass + ' my-content-list my-content-list--' + view + ' my-content-list--' + type + '" data-component-slug="' + componentSlug + '"' + attributes + '>';
            group.items.forEach(function (item) { html += type === 'product' ? productCard(item, view) : noteCard(item, view); });
            html += '</div></section>';
          });
        }
        ctx.setRegion('content', html);
        activateImages(root.querySelector('[data-region="content"]'));
        window.requestAnimationFrame(bindContentPopovers);
      }

      function syncControls() {
        var type = state.activeType;
        var typeNames = { product: '产品', note: '笔记', live: '直播' };
        var placeholders = { product: '搜索产品名称', note: '搜索笔记内容', live: '搜索直播主题' };
        var search = root.querySelector('[data-role="content-search"]');
        var clear = root.querySelector('[data-action="clear-search"]');
        var viewIcon = root.querySelector('[data-role="view-icon"]');
        var viewLabel = root.querySelector('[data-role="view-label"]');
        var viewButton = root.querySelector('[data-action="view-toggle"]');
        var management = root.querySelector('[data-role="content-management"]');
        var count = root.querySelector('[data-role="content-count"]');
        var currentView = state.viewByType[type];

        root.querySelectorAll('[data-content-type]').forEach(function (tab) {
          tab.setAttribute('aria-selected', tab.dataset.contentType === type ? 'true' : 'false');
        });
        search.value = state.searchByType[type] || '';
        search.placeholder = placeholders[type];
        search.setAttribute('aria-label', '搜索' + typeNames[type]);
        clear.hidden = !search.value;
        search.closest('.searchbox').classList.toggle('is-inputting', Boolean(search.value));
        viewIcon.className = 'search-toolbar__action-icon wego-iconfont-s ' + (currentView === 'grid' ? 'icon-liebiao' : 'icon-datu');
        viewLabel.textContent = currentView === 'grid' ? '列表' : '网格';
        viewButton.setAttribute('aria-label', currentView === 'grid' ? '切换为列表视图' : '切换为网格视图');
        viewButton.hidden = type === 'live';
        management.hidden = type === 'live';
        count.textContent = '共 ' + contentFor(type).length + (type === 'note' ? ' 篇' : type === 'live' ? ' 场' : ' 条');
        root.querySelector('[data-management-action="sort"]').hidden = type !== 'product';
        root.querySelector('[data-management-action="category"]').hidden = type !== 'product';
        root.querySelector('[data-management-action="batch"]').hidden = type !== 'product';
        root.querySelector('[data-management-action="collection"]').hidden = type !== 'note';
        ctx.updateTabsIndicator(root.querySelector('.my-content-tabs'));
      }

      function switchType(type) {
        if (!['product', 'note', 'live'].includes(type)) return;
        state.activeType = type;
        syncControls();
        renderContent();
      }

      function updateRecentApp(id) {
        if (!recentCatalog[id]) return;
        state.recentApps = [id].concat(state.recentApps.filter(function (item) { return item !== id; }));
        safeWrite(recentStorageKey, state.recentApps);
        renderApps();
        ctx.toast(recentCatalog[id].label + '已更新为最近使用');
      }

      function publishItem(type) {
        var sourceProduct = type === 'product' ? products[12] : type === 'note' ? products[10] : products[4];
        var noteDynamic = dynamics.find(function (item) { return item.content_type === 'note'; });
        var next = type === 'product' ? {
          id: 'published-product-' + Date.now(), type: type, title: sourceProduct.name,
          images: (sourceProduct.image_list || []).slice(0, 4), price: sourceProduct.price, updatedAt: '刚刚'
        } : type === 'note' ? {
          id: 'published-note-' + Date.now(), type: type, title: sourceProduct.name,
          cover: sourceProduct.image_list && sourceProduct.image_list[0], summary: noteDynamic ? noteDynamic.text_content : sourceProduct.feed_text, updatedAt: '刚刚'
        } : {
          id: 'published-live-' + Date.now(), type: type, title: sourceProduct.name + '专场',
          cover: sourceProduct.image_list && sourceProduct.image_list[0], host: currentUser.display_name || currentUser.merchant_name, time: '刚刚发布'
        };

        ctx.toast('正在发布' + (type === 'product' ? '产品' : type === 'note' ? '笔记' : '直播') + '…');
        publishTimer = window.setTimeout(function () {
          if (destroyed) return;
          state.published[type].unshift(next);
          state.searchByType[type] = '';
          safeWrite(searchStorageKey, state.searchByType);
          switchType(type);
          var scroll = root.querySelector('.my-tab-scroll');
          var content = root.querySelector('.my-content-sticky');
          if (scroll && content) scroll.scrollTo({ top: content.offsetTop, behavior: 'smooth' });
          ctx.toast({ variant: 'guide', text: '发布成功，已加入' + (type === 'product' ? '产品' : type === 'note' ? '笔记' : '直播'), action: { label: '查看', mode: 'strong' } });
        }, 600);
      }

      function handleContentOperation(action, itemId, type) {
        var labels = { delete: '删除', download: '下载', refresh: '刷新', edit: '编辑', share: '分享', pin: '置顶', copy: '复制', attributes: '商品属性' };
        if (action === 'delete') {
          if (!state.removedContentIds.includes(itemId)) state.removedContentIds.push(itemId);
          syncControls();
          renderContent();
          ctx.toast('已删除' + (type === 'note' ? '笔记' : '产品'));
          return;
        }
        if (action === 'pin') {
          state.pinnedContentIds = [itemId].concat(state.pinnedContentIds.filter(function (id) { return id !== itemId; }));
          renderContent();
          ctx.toast('已置顶');
          return;
        }
        if (action === 'copy') {
          ctx.toast('已复制内容信息');
          return;
        }
        if (action === 'attributes') {
          ctx.toast('商品属性已在当前页展开');
          return;
        }
        ctx.toast((labels[action] || '操作') + '已完成');
      }

      function openPublishSheet() {
        var sheetTemplate = '<div class="actionsheet actionsheet--action" data-component-slug="actionsheet" role="dialog" aria-modal="true" data-state="open">'
          + '<div class="actionsheet__panel">'
          + '<div class="actionsheet__header actionsheet__header--text"><span class="actionsheet__header-text">选择发布类型</span></div>'
          + '<div class="actionsheet__list">'
          + '<button class="actionsheet__item" type="button" data-publish-type="product"><span class="actionsheet__item-icon"><i class="wego-iconfont-s icon-fabushangpin" aria-hidden="true"></i></span><span class="actionsheet__item-main"><span class="actionsheet__item-title">发布产品</span></span></button>'
          + '<button class="actionsheet__item" type="button" data-publish-type="note"><span class="actionsheet__item-icon"><i class="wego-iconfont-s icon-fabubiji" aria-hidden="true"></i></span><span class="actionsheet__item-main"><span class="actionsheet__item-title">发布笔记</span></span></button>'
          + '<button class="actionsheet__item" type="button" data-publish-type="live"><span class="actionsheet__item-icon"><i class="wego-iconfont-s icon-shikuangLive-bofang" aria-hidden="true"></i></span><span class="actionsheet__item-main"><span class="actionsheet__item-title">发起直播</span></span></button>'
          + '</div><div class="actionsheet__cancel-gap"></div><button class="actionsheet__cancel" type="button" data-dom-id="cancel-sheet">取消</button>'
          + '</div></div>';

        ctx.openSheet(sheetTemplate, {
          label: '选择发布类型',
          init: function (sheetCtx) {
            var cancelButton = sheetCtx.root.querySelector('[data-dom-id="cancel-sheet"]');
            function onSheetClick(event) {
              var item = event.target.closest('[data-publish-type]');
              if (item) {
                var type = item.dataset.publishType;
                ctx.closeOverlay();
                publishItem(type);
                return;
              }
              if (event.target === sheetCtx.root) ctx.closeOverlay();
            }
            cancelButton.addEventListener('click', ctx.closeOverlay);
            sheetCtx.root.addEventListener('click', onSheetClick);
          }
        });
      }

      function onRootClick(event) {
        var contentOperation = event.target.closest('[data-content-operation]');
        if (contentOperation) {
          handleContentOperation(contentOperation.dataset.contentOperation, contentOperation.dataset.contentId, contentOperation.dataset.contentType);
          return;
        }

        var tab = event.target.closest('[data-content-type]');
        if (tab) { switchType(tab.dataset.contentType); return; }

        var asset = event.target.closest('[data-asset-id]');
        if (asset) {
          var assetItem = assetEntries.find(function (item) { return item.id === asset.dataset.assetId; });
          ctx.toast((assetItem ? assetItem.label : '数据资产') + '入口，本期暂不展开');
          return;
        }

        var app = event.target.closest('[data-app-id]');
        if (app) {
          var appId = app.dataset.appId;
          if (recentCatalog[appId]) updateRecentApp(appId);
          else {
            var fixedLabels = { homepage: '进入主页', qr_code: '二维码', cart: '购物车', all_apps: '全部应用' };
            ctx.toast((fixedLabels[appId] || '应用') + '入口，本期暂不展开');
          }
          return;
        }

        if (event.target.closest('[data-action="album-switch"]')) { ctx.toast('切换相册入口，本期暂不展开'); return; }
        if (event.target.closest('[data-action="settings"]')) { ctx.toast('设置入口，本期暂不展开'); return; }
        if (event.target.closest('[data-action="share-homepage"]')) { ctx.toast('分享主页入口，本期暂不展开'); return; }
        if (event.target.closest('[data-action="filter"]')) {
          var typeNames = { product: '产品', note: '笔记', live: '直播' };
          ctx.toast(typeNames[state.activeType] + '筛选入口，本期暂不展开');
          return;
        }
        var managementAction = event.target.closest('[data-management-action]');
        if (managementAction) {
          var labels = { sort: '排序', category: '分类', batch: '批量', collection: '合集' };
          ctx.toast((labels[managementAction.dataset.managementAction] || '管理') + '入口，本期暂不展开');
          return;
        }
        var dateMore = event.target.closest('[data-date-more]');
        if (dateMore) {
          ctx.toast(dateMore.dataset.dateMore + '内容操作入口，本期暂不展开');
          return;
        }
        if (event.target.closest('[data-action="view-toggle"]')) {
          var type = state.activeType;
          if (type === 'live') return;
          state.viewByType[type] = state.viewByType[type] === 'grid' ? 'list' : 'grid';
          safeWrite(viewStorageKey, state.viewByType);
          syncControls();
          renderContent();
          return;
        }
        if (event.target.closest('[data-action="clear-search"]')) {
          state.searchByType[state.activeType] = '';
          safeWrite(searchStorageKey, state.searchByType);
          syncControls();
          renderContent();
          root.querySelector('[data-role="content-search"]').focus();
          return;
        }
      }

      function onSearchInput(event) {
        if (!event.target.matches('[data-role="content-search"]')) return;
        state.searchByType[state.activeType] = event.target.value;
        safeWrite(searchStorageKey, state.searchByType);
        syncControls();
        renderContent();
      }

      setProfile();
      renderAssets();
      renderApps();
      syncControls();
      renderContent();
      ctx.bindTabs({ root: root });
      ctx.bindScrollLayout({
        scrollRoot: '.my-tab-scroll',
        regions: [
          { selector: '.my-content-tabs-sticky', policy: 'elevate-after-scroll', edge: 'top', essential: true, threshold: 8 },
          { selector: '.my-content-search-sticky', policy: 'direction-reveal', edge: 'top', essential: false, threshold: 8 }
        ],
        fixedRegions: [{ selector: '.my-tab-fab', edge: 'bottom', gap: 8 }]
      });

      var publishButton = root.querySelector('[data-dom-id="open-publish-sheet"]');
      publishButton.addEventListener('click', openPublishSheet);
      root.addEventListener('click', onRootClick);
      root.addEventListener('input', onSearchInput);
      ctx.onDestroy(function () {
        destroyed = true;
        if (publishTimer) window.clearTimeout(publishTimer);
        destroyContentPopovers();
        publishButton.removeEventListener('click', openPublishSheet);
        root.removeEventListener('click', onRootClick);
        root.removeEventListener('input', onSearchInput);
      });
    }
  });
})();
