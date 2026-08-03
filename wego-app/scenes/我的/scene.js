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
                <span>云空间</span>
                <span class="my-membership-card__usage">36.8 GB / 100 GB</span>
              </div>
              <div class="my-membership-card__progress" aria-label="云空间已使用百分之三十七">
                <span class="my-membership-card__progress-value"></span>
              </div>
            </div>
          </div>
        </section>

        <section class="layout-section my-tab-section" data-component-slug="layout-section" data-edge="M8">
          <div class="card card--surface card--vertical my-entry-card" data-component-slug="card">
            <div class="card__content my-entry-card__content">
              <div class="card__header my-section-heading">
                <h2>数据资产</h2>
                <span>横滑查看更多</span>
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
                <span>按最近使用排序</span>
              </div>
              <div class="card__body" data-region="apps"></div>
            </div>
          </div>
        </section>

        <div class="sticky-region my-content-sticky" data-component-slug="sticky-region" data-edge="top" data-visibility="elevate-after-scroll" data-state="visible">
          <div class="sticky-region__motion">
            <div class="sticky-region__inner">
              <div class="wg-tabs wg-tabs--standard wg-tabs--divide my-content-tabs" data-component-slug="tabs" role="tablist" aria-label="内容类型">
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
                  <button class="search-toolbar__action" data-action="filter" type="button">
                    <span class="search-toolbar__action-icon wego-iconfont-s icon-shaixuan" aria-hidden="true"></span>
                    筛选
                  </button>
                  <button class="search-toolbar__action" data-action="view-toggle" type="button">
                    <span class="search-toolbar__action-icon wego-iconfont-s icon-liebiao" data-role="view-icon" aria-hidden="true"></span>
                    <span data-role="view-label">列表</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section class="layout-section my-content-section" data-component-slug="layout-section" data-edge="M8" data-region="content"></section>
      </div>
    </div>

    <button class="btn btn--strong btn--md my-tab-fab" data-component-slug="button" data-dom-id="open-publish-sheet" type="button" aria-label="发布内容">
      <i class="btn__icon icon-jia16" aria-hidden="true"></i>
      发布
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
    skeleton: true,
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

      state.activeType = state.activeType || 'product';
      state.viewByType = Object.assign({ product: 'grid', note: 'grid', live: 'list' }, safeRead(viewStorageKey, {}), state.viewByType || {});
      state.searchByType = Object.assign({ product: '', note: '', live: '' }, safeRead(searchStorageKey, {}), state.searchByType || {});
      state.purchaseTodoCount = Number.isFinite(state.purchaseTodoCount) ? state.purchaseTodoCount : 2;
      state.cartItemCount = Number.isFinite(state.cartItemCount) ? state.cartItemCount : 3;
      state.published = state.published || { product: [], note: [], live: [] };

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
        { id: 'purchases', label: '我买的', icon: 'icon-dingdan', metric: { integer: String(state.purchaseTodoCount) }, conditional: state.purchaseTodoCount > 0, todo: true },
        { id: 'fans', label: '粉丝', icon: 'icon-fensi', metric: { integer: '1', decimal: '.2', unit: '万' }, conditional: true },
        { id: 'friends', label: '好友', icon: 'icon-duoren', metric: { integer: '386' }, conditional: true },
        { id: 'agents', label: '代理', icon: 'icon-tuiguangyuan', metric: { integer: '28' }, conditional: true },
        { id: 'visitors', label: '访客', icon: 'icon-fangkejilu', metric: { integer: '1,280' }, conditional: true },
        { id: 'employees', label: '员工', icon: 'icon-qiye', metric: { integer: '12' }, conditional: true },
        { id: 'wallet', label: '钱包', icon: 'icon-qianbao', metric: { symbol: '¥', integer: '8,420' }, conditional: true },
        { id: 'coupons', label: '卡券', icon: 'icon-quan', metric: { integer: '6' }, conditional: true },
        { id: 'favorites', label: '收藏', icon: 'icon-shoucang', metric: { integer: '324' }, conditional: true }
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
            cover: product.image_list && product.image_list[0],
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
            + '<span class="my-entry-icon"><i class="wego-iconfont-s ' + item.icon + '" aria-hidden="true"></i></span>'
            + metricHtml(item.metric, { size: '16', theme: 'black' })
            + '<span class="my-entry-label">' + escapeHtml(item.label);
          if (item.todo) html += '<span class="badge badge--inline badge--number" data-component-slug="badge">' + state.purchaseTodoCount + '</span>';
          html += '</span></button>';
        });
        html += '</div>';
        ctx.setRegion('assets', html);
      }

      function appIcon(icon, label, count) {
        var badge = count ? '<span class="badge badge--inline badge--number my-app-entry__badge" data-component-slug="badge">' + count + '</span>' : '';
        return '<span class="my-app-icon"><img src="' + escapeHtml(icon) + '" alt=""></span><span class="my-app-label">' + escapeHtml(label) + badge + '</span>';
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

      function productCard(item, view) {
        var grid = view === 'grid';
        return '<article class="card card--surface ' + (grid ? 'card--vertical ' : '') + 'my-content-card my-product-card my-product-card--' + view + '" data-component-slug="card">'
          + imageHtml(item.cover, item.title, 'my-product-card__media')
          + '<div class="card__content my-content-card__content">'
          + '<h3 class="card__header my-content-card__title">' + escapeHtml(item.title) + '</h3>'
          + '<div class="card__footer my-product-card__footer">' + priceMetric(item.price) + '<span>' + escapeHtml(item.updatedAt) + '</span></div>'
          + '</div></article>';
      }

      function noteCard(item, view) {
        var grid = view === 'grid';
        return '<article class="card card--surface ' + (grid ? 'card--vertical ' : '') + 'my-content-card my-note-card my-note-card--' + view + '" data-component-slug="card">'
          + imageHtml(item.cover, item.title, 'my-note-card__media')
          + '<div class="card__content my-content-card__content">'
          + '<h3 class="card__header my-content-card__title">' + escapeHtml(item.title) + '</h3>'
          + '<p class="card__body my-note-card__summary">' + escapeHtml(item.summary) + '</p>'
          + '<span class="card__footer my-content-card__meta">' + escapeHtml(item.updatedAt) + '</span>'
          + '</div></article>';
      }

      function liveCard(item, view) {
        var grid = view === 'grid';
        return '<article class="card card--surface card--vertical my-content-card my-live-card my-live-card--' + view + '" data-component-slug="card">'
          + imageHtml(item.cover, item.title, 'my-live-card__media')
          + '<div class="card__content my-content-card__content">'
          + '<h3 class="card__header my-content-card__title">' + escapeHtml(item.title) + '</h3>'
          + '<div class="card__body my-live-card__details"><span><i class="wego-iconfont-s icon-ren" aria-hidden="true"></i>' + escapeHtml(item.host) + '</span><span><i class="wego-iconfont-s icon-shijian" aria-hidden="true"></i>' + escapeHtml(item.time) + '</span></div>'
          + '</div></article>';
      }

      function contentFor(type) {
        var defaults = type === 'product' ? productContent() : type === 'note' ? noteContent() : liveContent();
        return (state.published[type] || []).concat(defaults);
      }

      function matchesSearch(item, query) {
        if (!query) return true;
        var source = [item.title, item.summary, item.host, item.time, item.price].filter(Boolean).join(' ').toLowerCase();
        return source.includes(query.toLowerCase());
      }

      function renderContent() {
        var type = state.activeType;
        var view = state.viewByType[type];
        var query = state.searchByType[type] || '';
        var items = contentFor(type).filter(function (item) { return matchesSearch(item, query); });
        var containerClass = view === 'grid' ? 'layout-grid' : 'layout-flow';
        var componentSlug = view === 'grid' ? 'layout-grid' : 'layout-flow';
        var attributes = view === 'grid'
          ? ' data-columns="2" data-align="stretch"'
          : ' data-direction="vertical" data-align="stretch"';
        var html = '<div class="' + containerClass + ' my-content-list my-content-list--' + view + ' my-content-list--' + type + '" data-component-slug="' + componentSlug + '"' + attributes + '>';

        if (!items.length) {
          var typeLabel = type === 'product' ? '产品' : type === 'note' ? '笔记' : '直播';
          html += '<div class="card card--filled card--vertical my-content-empty" data-component-slug="card">'
            + '<i class="wego-iconfont-s icon-sousuo" aria-hidden="true"></i>'
            + '<strong>没有找到相关' + typeLabel + '</strong>'
            + '<span>换个关键词试试</span></div>';
        } else {
          items.forEach(function (item) {
            html += type === 'product' ? productCard(item, view) : type === 'note' ? noteCard(item, view) : liveCard(item, view);
          });
        }
        html += '</div>';
        ctx.setRegion('content', html);
        activateImages(root.querySelector('[data-region="content"]'));
      }

      function syncControls() {
        var type = state.activeType;
        var typeNames = { product: '产品', note: '笔记', live: '直播' };
        var placeholders = { product: '搜索产品名称', note: '搜索笔记内容', live: '搜索直播主题' };
        var search = root.querySelector('[data-role="content-search"]');
        var clear = root.querySelector('[data-action="clear-search"]');
        var viewIcon = root.querySelector('[data-role="view-icon"]');
        var viewLabel = root.querySelector('[data-role="view-label"]');
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
        root.querySelector('[data-action="view-toggle"]').setAttribute('aria-label', currentView === 'grid' ? '切换为列表视图' : '切换为网格视图');
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
          cover: sourceProduct.image_list && sourceProduct.image_list[0], price: sourceProduct.price, updatedAt: '刚刚'
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
        if (event.target.closest('[data-action="view-toggle"]')) {
          var type = state.activeType;
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
        regions: [{ selector: '.my-content-sticky', policy: 'elevate-after-scroll', edge: 'top', essential: true, threshold: 8 }],
        fixedRegions: [{ selector: '.my-tab-fab', edge: 'bottom', gap: 8 }]
      });

      var publishButton = root.querySelector('[data-dom-id="open-publish-sheet"]');
      publishButton.addEventListener('click', openPublishSheet);
      root.addEventListener('click', onRootClick);
      root.addEventListener('input', onSearchInput);
      ctx.onDestroy(function () {
        destroyed = true;
        if (publishTimer) window.clearTimeout(publishTimer);
        publishButton.removeEventListener('click', openPublishSheet);
        root.removeEventListener('click', onRootClick);
        root.removeEventListener('input', onSearchInput);
      });
    }
  });
})();
