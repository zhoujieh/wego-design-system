const template = `<div class="layout-page my-page" data-surface-id="my" data-route-id="my" data-layout-mode="composed" data-component-slug="layout-page">
  <div class="layout-page__top">
    <div class="navbar my-navbar" data-component-slug="navbar">
      <div class="navbar__body navbar__body--split">
        <div class="navbar__left navbar__left--custom">
          <button type="button" class="my-profile-entry" data-stub="相册切换">
            <div class="avatar avatar--40 avatar--image my-profile-avatar" data-component-slug="avatar">
              <img class="my-profile-avatar-img" alt="">
            </div>
            <div class="my-profile-info">
              <div class="my-profile-name"></div>
              <div class="my-profile-bio"></div>
            </div>
          </button>
        </div>
        <div class="navbar__right navbar__right--custom">
          <button type="button" class="navbar__action" data-stub="设置" aria-label="设置">
            <i class="navbar__action-icon wego-iconfont-s icon-shezhi"></i>
          </button>
          <button type="button" class="navbar__action" data-stub="分享主页" aria-label="分享主页">
            <i class="navbar__action-icon wego-iconfont-s icon-fenxiang"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="layout-page__body">
    <div class="layout-scroll my-page__scroll" data-component-slug="layout-scroll">
      <div class="layout-section" data-component-slug="layout-section" data-edge="M8" style="--layout-section-gap-after:var(--spacer-12)">
        <div class="card card--surface card--flush my-membership" data-component-slug="card">
          <div class="card__content my-membership__content">
            <span class="my-membership__level">VIP会员</span>
            <span class="my-membership__expire">2026.12.31到期</span>
            <span class="my-membership__cloud">云空间 12.3/50G</span>
          </div>
        </div>
      </div>
      <div class="layout-section" data-component-slug="layout-section" data-edge="M0" style="--layout-section-gap-after:var(--spacer-12)">
        <div class="layout-scroll-row my-assets-row" data-component-slug="layout-scroll-row" data-snap="start" style="--layout-scroll-row-gap:var(--spacer-0)"></div>
      </div>
      <div class="layout-section" data-component-slug="layout-section" data-edge="M0" style="--layout-section-gap-after:var(--spacer-12)">
        <div class="layout-scroll-row my-apps-row" data-component-slug="layout-scroll-row" data-snap="start" style="--layout-scroll-row-gap:var(--spacer-0)"></div>
      </div>
      <div class="layout-section my-content-section" data-component-slug="layout-section" data-edge="M0" style="--layout-section-gap-before:var(--spacer-0);--layout-section-gap-after:var(--spacer-0)">
        <div class="wg-tabs wg-tabs--standard wg-tabs--divide my-content-tabs" data-component-slug="tabs" role="tablist">
          <div class="wg-tabs__scroll">
            <button class="wg-tabs__item" role="tab" aria-selected="true" type="button" data-tab="product">
              <span class="wg-tabs__content"><span class="wg-tabs__label">产品</span></span>
            </button>
            <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-tab="note">
              <span class="wg-tabs__content"><span class="wg-tabs__label">笔记</span></span>
            </button>
            <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-tab="live">
              <span class="wg-tabs__content"><span class="wg-tabs__label">直播</span></span>
            </button>
            <span class="wg-tabs__active-indicator" aria-hidden="true"></span>
          </div>
        </div>
        <div class="my-toolbar">
          <button type="button" class="my-toolbar__search" data-stub="搜索">
            <i class="wego-iconfont-s icon-sousuo"></i>
            <span>搜索我的内容</span>
          </button>
          <div class="my-toolbar__actions">
            <button type="button" class="my-toolbar__btn" data-stub="筛选" aria-label="筛选">
              <i class="wego-iconfont-s icon-shaixuan"></i>
            </button>
            <button type="button" class="my-toolbar__btn my-toolbar__btn--active" data-view="list" aria-label="列表视图">
              <i class="wego-iconfont-s icon-liebiao"></i>
            </button>
            <button type="button" class="my-toolbar__btn" data-view="grid" aria-label="网格视图">
              <i class="wego-iconfont-s icon-shangpin"></i>
            </button>
          </div>
        </div>
        <div class="my-content-list"></div>
      </div>
    </div>
  </div>
  <button type="button" class="my-fab" data-dom-id="publish-fab" data-action="publish" aria-label="发布">
    <i class="wego-iconfont-s icon-jia16"></i>
  </button>
</div>`;

(function () {
  'use strict';

  var db = window.WEGO_PROTOTYPE_DB || {};
  var user = db.currentUser || { merchant_name: '微购用户', avatar: '', merchant_type: '', region: '' };
  var products = db.products || [];

  var DATA_ASSETS = [
    { label: '我买的', icon: 'icon-shangpin', badge: 3 },
    { label: '粉丝', icon: 'icon-fensi' },
    { label: '好友', icon: 'icon-fensihuiyuanka-mian' },
    { label: '代理', icon: 'icon-zhibo' },
    { label: '访客', icon: 'icon-fangkejilu' },
    { label: '员工', icon: 'icon-shangpin-xin' },
    { label: '钱包', icon: 'icon-qianbao-mian' },
    { label: '卡券', icon: 'icon-erweima-mian' },
    { label: '收藏', icon: 'icon-shoucang' }
  ];

  var QUICK_APPS = [
    { label: '主页', icon: 'icon-shouye' },
    { label: '二维码', icon: 'icon-erweima' },
    { label: '购物车', icon: 'icon-gouwuche', badge: 2 },
    { label: '最近应用', icon: 'icon-fabushangpin' },
    { label: '全部', icon: 'icon-shangpin' }
  ];

  var TABS = [
    { id: 'product', label: '产品' },
    { id: 'note', label: '笔记' },
    { id: 'live', label: '直播' }
  ];

  function assetEntryHtml(asset) {
    var badge = asset.badge
      ? '<span class="badge badge--inline badge--number my-asset-entry__badge" data-component-slug="badge">' + asset.badge + '</span>'
      : '';
    return ''
      + '<button type="button" class="my-asset-entry" data-stub="' + asset.label + '">'
      +   '<div class="my-asset-entry__icon">'
      +     '<i class="wego-iconfont-s ' + asset.icon + '"></i>'
      +     badge
      +   '</div>'
      +   '<span class="my-asset-entry__label">' + asset.label + '</span>'
      + '</button>';
  }

  function buildAssetRow() {
    return DATA_ASSETS.map(assetEntryHtml).join('');
  }

  function buildAppRow() {
    return QUICK_APPS.map(assetEntryHtml).join('');
  }

  function productImg(product) {
    return (product.image_list && product.image_list[0]) || '';
  }

  function buildProductCard(product, view) {
    var gridClass = view === 'grid' ? ' my-product-card--grid' : '';
    var cardClass = view === 'grid'
      ? 'card card--surface card--vertical'
      : 'card card--surface card--flush';
    return ''
      + '<div class="' + cardClass + ' my-product-card' + gridClass + '" data-component-slug="card">'
      +   '<img class="my-product-card__img" src="' + productImg(product) + '" alt="' + product.title + '">'
      +   '<div class="my-product-card__info">'
      +     '<div class="my-product-card__title">' + product.title + '</div>'
      +     '<div class="my-product-card__price">¥' + product.price + '</div>'
      +   '</div>'
      + '</div>';
  }

  function buildNoteCard(product, view) {
    var gridClass = view === 'grid' ? ' my-note-card--grid' : '';
    var cardClass = view === 'grid'
      ? 'card card--surface card--vertical'
      : 'card card--surface card--flush';
    return ''
      + '<div class="' + cardClass + ' my-note-card' + gridClass + '" data-component-slug="card">'
      +   '<img class="my-note-card__img" src="' + productImg(product) + '" alt="' + product.title + '">'
      +   '<div class="my-note-card__info">'
      +     '<div class="my-note-card__text">' + product.feed_text + '</div>'
      +   '</div>'
      + '</div>';
  }

  function buildLiveCard(product, view) {
    var gridClass = view === 'grid' ? ' my-live-card--grid' : '';
    var cardClass = view === 'grid'
      ? 'card card--surface card--vertical'
      : 'card card--surface card--flush';
    return ''
      + '<div class="' + cardClass + ' my-live-card' + gridClass + '" data-component-slug="card">'
      +   '<div class="my-live-card__media">'
      +     '<img class="my-live-card__img" src="' + productImg(product) + '" alt="' + product.title + '">'
      +     '<span class="badge badge--inline badge--text my-live-card__badge" data-component-slug="badge"><span class="badge__text">直播回放</span></span>'
      +   '</div>'
      +   '<div class="my-live-card__info">'
      +     '<div class="my-product-card__title">' + product.title + '</div>'
      +   '</div>'
      + '</div>';
  }

  function buildContentList(tab, view) {
    return products.slice(0, 6).map(function (product) {
      if (tab === 'note') return buildNoteCard(product, view);
      if (tab === 'live') return buildLiveCard(product, view);
      return buildProductCard(product, view);
    }).join('');
  }

  function buildTabsHtml() {
    return TABS.map(function (tab, idx) {
      var selected = idx === 0 ? 'true' : 'false';
      return ''
        + '<button class="wg-tabs__item" role="tab" aria-selected="' + selected + '" type="button" data-tab="' + tab.id + '">'
        +   '<span class="wg-tabs__content"><span class="wg-tabs__label">' + tab.label + '</span></span>'
        + '</button>';
    }).join('') + '<span class="wg-tabs__active-indicator" aria-hidden="true"></span>';
  }

  var tabStates = { product: { view: 'list' }, note: { view: 'list' }, live: { view: 'list' } };
  var currentTab = 'product';

  window.WegoApp.registerScene({
    routeId: 'my',
    template: template,
    presentation: { type: 'host-tab' },
    init: function (ctx) {
      var root = ctx.root;
      var tabsHandle = ctx.bindTabs({ root: root });
      ctx.bindScrollLayout({ root: root, fixedRegions: [{ selector: '.my-fab' }] });

      // 填充个人信息
      var avatarImg = root.querySelector('.my-profile-avatar-img');
      if (avatarImg) { avatarImg.src = user.avatar; avatarImg.alt = user.merchant_name; }
      var nameEl = root.querySelector('.my-profile-name');
      if (nameEl) nameEl.textContent = user.merchant_name;
      var bioEl = root.querySelector('.my-profile-bio');
      if (bioEl) bioEl.textContent = user.merchant_type + ' · ' + user.region;

      // 填充数据资产 / 常用应用横滑
      var assetsRow = root.querySelector('.my-assets-row');
      if (assetsRow) assetsRow.innerHTML = buildAssetRow();
      var appsRow = root.querySelector('.my-apps-row');
      if (appsRow) appsRow.innerHTML = buildAppRow();

      // 填充初始内容列表（tabs 已在 template 中静态声明）
      var listEl = root.querySelector('.my-content-list');
      if (listEl) listEl.innerHTML = buildContentList('product', 'list');
      tabsHandle.update();

      function updateContent() {
        var state = tabStates[currentTab];
        if (listEl) {
          listEl.className = 'my-content-list' + (state.view === 'grid' ? ' my-content-list--grid' : '');
          listEl.innerHTML = buildContentList(currentTab, state.view);
        }
        var listBtn = root.querySelector('[data-view="list"]');
        var gridBtn = root.querySelector('[data-view="grid"]');
        if (listBtn) listBtn.classList.toggle('my-toolbar__btn--active', state.view === 'list');
        if (gridBtn) gridBtn.classList.toggle('my-toolbar__btn--active', state.view === 'grid');
      }

      var tabItems = root.querySelectorAll('.wg-tabs__item[data-tab]');
      Array.prototype.forEach.call(tabItems, function (item) {
        item.addEventListener('click', function () {
          var tab = item.dataset.tab;
          if (!tab || tab === currentTab) return;
          currentTab = tab;
          Array.prototype.forEach.call(tabItems, function (t) {
            t.setAttribute('aria-selected', String(t === item));
          });
          tabsHandle.update();
          updateContent();
        });
      });

      Array.prototype.forEach.call(root.querySelectorAll('[data-view]'), function (btn) {
        btn.addEventListener('click', function () {
          var view = btn.dataset.view;
          if (!view || view === tabStates[currentTab].view) return;
          tabStates[currentTab].view = view;
          updateContent();
        });
      });

      Array.prototype.forEach.call(root.querySelectorAll('[data-stub]'), function (el) {
        el.addEventListener('click', function () {
          ctx.toast(el.dataset.stub + '（功能开发中）');
        });
      });

      var fab = root.querySelector('[data-dom-id="publish-fab"]');
      if (fab) {
        fab.addEventListener('click', function () {
          var sheetTemplate = ''
            + '<div class="actionsheet actionsheet--action" data-component-slug="actionsheet" role="dialog" aria-modal="true" data-state="closed">'
            +   '<div class="actionsheet__panel">'
            +     '<div class="actionsheet__list">'
            +       '<div class="actionsheet__item" data-publish="product">'
            +         '<i class="wego-iconfont-s icon-fabushangpin actionsheet__item-icon"></i>'
            +         '<div class="actionsheet__item-main"><div class="actionsheet__item-title">发产品</div></div>'
            +       '</div>'
            +       '<div class="actionsheet__item" data-publish="note">'
            +         '<i class="wego-iconfont-s icon-fabubiji actionsheet__item-icon"></i>'
            +         '<div class="actionsheet__item-main"><div class="actionsheet__item-title">发笔记</div></div>'
            +       '</div>'
            +       '<div class="actionsheet__item" data-publish="live">'
            +         '<i class="wego-iconfont-s icon-zhibo actionsheet__item-icon"></i>'
            +         '<div class="actionsheet__item-main"><div class="actionsheet__item-title">开直播</div></div>'
            +       '</div>'
            +     '</div>'
            +     '<div class="actionsheet__cancel-gap"></div>'
            +     '<div class="actionsheet__cancel" data-dom-id="cancel">取消</div>'
            +   '</div>'
            + '</div>';

          ctx.openSheet(sheetTemplate, {
            init: function (sheetCtx) {
              var sheetRoot = sheetCtx.root;
              var cancelBtn = sheetRoot.querySelector('[data-dom-id="cancel"]');
              if (cancelBtn) {
                cancelBtn.addEventListener('click', function () { ctx.closeOverlay(); });
              }
              sheetRoot.addEventListener('click', function (e) {
                if (e.target === sheetRoot) { ctx.closeOverlay(); return; }
                var item = e.target.closest('.actionsheet__item');
                if (item) {
                  var type = item.dataset.publish;
                  var msg = type === 'product' ? '发产品' : type === 'note' ? '发笔记' : '开直播';
                  ctx.closeOverlay();
                  ctx.toast('即将进入' + msg);
                }
              });
            }
          });
        });
      }
    },
    destroy: function () {
      // ctx.bindTabs / ctx.bindScrollLayout 注册的 destroy 回调由框架自动执行
    }
  });
})();
