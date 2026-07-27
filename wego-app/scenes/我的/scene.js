/* wego-design-contract:
{
  "surface_id": "my-page",
  "route_id": "my-page",
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
    "design_system_version": 476,
    "token_bindings": [
      {
        "selector": ".my-page",
        "content_role": "场景根背景色",
        "css_property": "background",
        "token": "var(--bg-page)"
      },
      {
        "selector": ".my-page",
        "content_role": "场景根字体",
        "css_property": "color",
        "token": "var(--text-default)"
      }
    ],
    "component_bindings": [
      {
        "binding_id": "my-navbar",
        "slug": "navbar",
        "reason": "\u5BFC\u822A\u680F\uFF0C\u5DE6\u4FA7 custom \u8EAB\u4EFD\u533A\uFF0C\u53F3\u4FA7\u8BBE\u7F6E+\u5206\u4EAB\u5165\u53E3",
        "principle_refs": ["wego-consistency-same-pattern"],
        "variant_dimensions": {
          "leftControl": "custom",
          "titleAlignment": "custom",
          "actions": "icon",
          "rightActionType": "icon"
        }
      },
      {
        "binding_id": "my-type-tabs",
        "slug": "tabs",
        "reason": "\u4EA7\u54C1/\u7B14\u8BB0/\u76F4\u64AD \u7C7B\u578B\u5207\u6362",
        "variant_dimensions": {
          "size": "standard",
          "scrollType": "divide"
        }
      },
      {
        "binding_id": "my-cart-badge",
        "slug": "badge",
        "reason": "\u8D2D\u7269\u8F66 FAB \u89D2\u6807",
        "variant_dimensions": {
          "type": "number",
          "shape": "corner"
        }
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "../../.codex/skills/shared/references/design-decisions.md",
      "selection_reason": "\u4E3B\u9875\u5E03\u5C40\uFF0C\u81EA\u4E0A\u800C\u4E0B\u5355\u7EBF\u6D41\u7A0B\uFF0C\u5185\u5BB9\u7C7B\u578B\u7528 tabs \u5207\u6362\uFF0C\u9875\u9762\u8FB9\u8DDD\u4E3A M0\u901A\u680F",
      "page_edge_mode": "M0",
      "principle_refs": ["wego-clarity-information-flow", "wego-clarity-single-primary-task"],
      "mutable_regions": [".my-page__content"]
    },
    "interaction_contract": [
      { "dom_id": "app-all", "target": "feedback:toast" },
      { "dom_id": "app-homepage", "target": "feedback:toast" },
      { "dom_id": "app-qr", "target": "feedback:toast" },
      { "dom_id": "app-recent", "target": "feedback:toast" },
      { "dom_id": "asset-agents", "target": "feedback:toast" },
      { "dom_id": "asset-coupons", "target": "feedback:toast" },
      { "dom_id": "asset-employees", "target": "feedback:toast" },
      { "dom_id": "asset-fans", "target": "feedback:toast" },
      { "dom_id": "asset-favorites", "target": "feedback:toast" },
      { "dom_id": "asset-friends", "target": "feedback:toast" },
      { "dom_id": "asset-pending-purchase", "target": "feedback:toast" },
      { "dom_id": "asset-visitors", "target": "feedback:toast" },
      { "dom_id": "asset-wallet", "target": "feedback:toast" },
      { "dom_id": "settings", "target": "feedback:toast" },
      { "dom_id": "share-profile", "target": "feedback:toast" },
      { "dom_id": "switch-album", "target": "feedback:toast" },
      { "dom_id": "search", "target": "feedback:toast" },
      { "dom_id": "filter", "target": "feedback:toast" },
      { "dom_id": "view-toggle", "target": "state:view-change" },
      { "dom_id": "open-publish-menu", "target": "overlay:sheet" },
      { "dom_id": "publish-focus", "target": "overlay:close" },
      { "dom_id": "publish-action-product", "target": "feedback:toast" },
      { "dom_id": "publish-action-note", "target": "feedback:toast" },
      { "dom_id": "publish-action-live", "target": "feedback:toast" },
      { "dom_id": "publish-action-import", "target": "feedback:toast" },
      { "dom_id": "publish-action-scan", "target": "feedback:toast" },
      { "dom_id": "open-cart", "target": "feedback:toast" }
    ],
    "state_contract": [
      {
        "state_id": "products-list",
        "initial": true,
        "trigger": "\u573A\u666F\u8FDB\u5165 / \u70B9\u51FB\u4EA7\u54C1 tab",
        "visible_result": "\u663E\u793A\u4EA7\u54C1\u5217\u8868\uFF08\u5217\u8868\u89C6\u56FE\uFF09",
        "fallback": "\u6682\u65E0\u5185\u5BB9",
        "persistence": "memory"
      },
      {
        "state_id": "products-grid",
        "initial": false,
        "trigger": "\u5207\u6362\u4E3A\u7F51\u683C\u89C6\u56FE",
        "visible_result": "\u4EA7\u54C1\u7F51\u683C\u5C55\u793A",
        "fallback": "\u56DE\u5230\u5217\u8868\u89C6\u56FE",
        "persistence": "memory"
      },
      {
        "state_id": "notes-list",
        "initial": false,
        "trigger": "\u70B9\u51FB\u7B14\u8BB0 tab",
        "visible_result": "\u663E\u793A\u7B14\u8BB0\u5217\u8868",
        "fallback": "\u6682\u65E0\u5185\u5BB9",
        "persistence": "memory"
      },
      {
        "state_id": "live-list",
        "initial": false,
        "trigger": "\u70B9\u51FB\u76F4\u64AD tab",
        "visible_result": "\u663E\u793A\u76F4\u64AD\u5217\u8868",
        "fallback": "\u6682\u65E0\u5185\u5BB9",
        "persistence": "memory"
      },
      {
        "state_id": "publish-open",
        "initial": false,
        "trigger": "\u70B9\u51FB\u53D1\u5E03 FAB",
        "visible_result": "\u53D1\u5E03\u6258\u76D8\u4ECE\u5E95\u90E8\u5F39\u51FA\uFF0C\u5305\u542B 5 \u4E2A\u53D1\u5E03\u9009\u9879",
        "fallback": "\u6258\u76D8\u5173\u95ED\uFF0C\u6062\u590D FAB \u521D\u59CB\u72B6\u6001",
        "persistence": "memory"
      },
      {
        "state_id": "cart-visible",
        "initial": false,
        "trigger": "\u8D2D\u7269\u8F66\u6709\u5185\u5BB9\u65F6\u663E\u793A FAB",
        "visible_result": "\u8D2D\u7269\u8F66 FAB \u663E\u793A\u5E26\u89D2\u6807\u6570\u5B57",
        "fallback": "\u8D2D\u7269\u8F66 FAB \u9690\u85CF",
        "persistence": "memory"
      }
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-27T12:00:00.000Z",
    "checks": {
      "horizontal_overflow": true,
      "overlap": true,
      "clipping": true,
      "action_legibility": true,
      "primary_focus": true,
      "state_feedback": true
    }
  }
}
*/
(function () {
  'use strict';

  /* ── 模拟数据 ── */

  var DB = {
    user: {
      name: '微购优选商行',
      avatar: './lib/assets/images/avatar/default-shop.png'
    },
    membership: {
      level: '🏅 黄金会员',
      expiry: '2027-01-20 到期',
      storageUsed: 4.2,
      storageTotal: 10
    },
    assets: {
      pendingPurchase: 3, /* 0 时隐藏「我买的」 */
      fans: 1286,
      friends: 356,
      agents: 89,
      visitors: 438,
      employees: 12,
      wallet: '¥ 2,680.50',
      coupons: 15,
      favorites: 237
    },
    products: [
      { title: '2024 春季新款 · 女装法式连衣裙', price: '¥ 269', sales: '1.2k', img: './lib/assets/images/album/album_001.jpg' },
      { title: '男士休闲商务衬衫 免烫抗皱', price: '¥ 189', sales: '856', img: './lib/assets/images/album/album_002.jpg' },
      { title: '儿童卡通双肩背包 大容量护脊', price: '¥ 99', sales: '2.3k', img: './lib/assets/images/album/album_003.jpg' },
      { title: '北欧风 ins 台灯 护眼阅读灯', price: '¥ 159', sales: '672', img: './lib/assets/images/album/album_004.jpg' },
      { title: '日系简约餐具套装 16 件', price: '¥ 128', sales: '1.8k', img: './lib/assets/images/album/album_005.jpg' }
    ],
    notes: [
      { title: '春季穿搭搭配指南 · 5 套方案轻松出街', date: '2024-03-15', reads: '2.1k', img: './lib/assets/images/album/album_006.jpg' },
      { title: '新品首发预告：夏日清凉系列即将上线', date: '2024-03-14', reads: '856', img: './lib/assets/images/album/album_007.jpg' },
      { title: '店主亲测：这款面霜真的值得回购', date: '2024-03-12', reads: '1.5k', img: './lib/assets/images/album/album_008.jpg' }
    ],
    live: [
      { title: '今晚 8 点 · 春季新品专场直播', scheduled: '2024-03-20 20:00', reservations: 325, img: './lib/assets/images/album/album_009.jpg' },
      { title: '明天下午 3 点 · 美妆课堂第 3 期', scheduled: '2024-03-18 15:00', reservations: 189, img: './lib/assets/images/album/album_010.jpg' }
    ],
    cartCount: 0
  };

  /* ── 视图偏好存储 per-tab ── */
  var viewModes = {
    products: 'list',
    notes: 'list',
    live: 'list'
  };

  var currentTab = 'products';

  /* ── 工具函数 ── */

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ── 内容渲染 ── */

  function renderCard(item, mode) {
    if (mode === 'grid') {
      return (
        '<div class="my-page__card my-page__card--grid" data-dom-id="content-item">' +
          '<img class="my-page__card-img" src="' + escapeHtml(item.img) + '" alt="" loading="lazy">' +
          '<div class="my-page__card-info">' +
            '<div class="my-page__card-title">' + escapeHtml(item.title) + '</div>' +
            '<div class="my-page__card-meta">' + escapeHtml(item.price || item.date || item.scheduled) + '</div>' +
          '</div>' +
        '</div>'
      );
    }
    return (
      '<div class="my-page__card" data-dom-id="content-item">' +
        '<img class="my-page__card-img" src="' + escapeHtml(item.img) + '" alt="" loading="lazy">' +
        '<div class="my-page__card-info">' +
          '<div class="my-page__card-title">' + escapeHtml(item.title) + '</div>' +
          '<div class="my-page__card-meta">' + escapeHtml(item.price || item.date || item.scheduled) + ' · ' + escapeHtml(item.sales || item.reads || (item.reservations + '人预约')) + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderContent(tab, mode) {
    var items;
    switch (tab) {
      case 'products': items = DB.products; break;
      case 'notes': items = DB.notes; break;
      case 'live': items = DB.live; break;
      default: items = [];
    }
    if (!items.length) {
      return '<div class="my-page__empty"><div class="my-page__empty-icon"></div>暂无内容</div>';
    }
    var containerClass = mode === 'grid' ? 'my-page__grid' : 'my-page__list';
    return '<div class="' + containerClass + '">' + items.map(function (item) { return renderCard(item, mode); }).join('') + '</div>';
  }

  function updateContent() {
    var mode = viewModes[currentTab];
    var html = renderContent(currentTab, mode);
    var content = document.getElementById('my-page-content');
    if (content) content.innerHTML = html;
  }

  function updateToolbarViewBtn() {
    var btn = document.getElementById('my-view-toggle');
    if (!btn) return;
    var mode = viewModes[currentTab];
    btn.innerHTML = mode === 'grid' ? '\u2630' : '\u22EE'; /* grid icon vs list icon */
    btn.classList.toggle('my-page__toolbar-action--active', mode === 'grid');
  }

  function switchTab(tab) {
    currentTab = tab;

    /* 更新 tabs indicator */
    var tabs = document.querySelector('.my-page__type-tabs');
    if (tabs) {
      var items = tabs.querySelectorAll('.wg-tabs__item');
      items.forEach(function (item) {
        item.setAttribute('aria-selected', item.getAttribute('data-tab') === tab ? 'true' : 'false');
      });
      updateTabsIndicator(tabs);
    }

    updateContent();
    updateToolbarViewBtn();
  }

  function toggleView() {
    var mode = viewModes[currentTab];
    viewModes[currentTab] = mode === 'list' ? 'grid' : 'list';
    updateContent();
    updateToolbarViewBtn();
  }

  /* ── Tabs 指示器 ── */

  function updateTabsIndicator(tabs) {
    var scroll = tabs.querySelector('.wg-tabs__scroll');
    var indicator = tabs.querySelector('.wg-tabs__active-indicator');
    var selected = tabs.querySelector('.wg-tabs__item[aria-selected="true"] .wg-tabs__content');
    if (!scroll || !indicator || !selected) return;
    var scrollRect = scroll.getBoundingClientRect();
    var selectedRect = selected.getBoundingClientRect();
    indicator.style.setProperty('--_tabs-indicator-x', (selectedRect.left - scrollRect.left + scroll.scrollLeft) + 'px');
    indicator.style.setProperty('--_tabs-indicator-width', selectedRect.width + 'px');
  }

  /* ── 发布托盘 ── */

  function openPublishDock(ctx) {
    var fab = document.getElementById('my-publish-fab');
    var dock = document.getElementById('my-publish-dock');
    var focus = document.getElementById('my-publish-focus');
    if (!dock || !fab || !focus) return;
    var isOpen = dock.getAttribute('data-state') === 'open';
    if (isOpen) {
      dock.setAttribute('data-state', 'closed');
      dock.setAttribute('aria-hidden', 'true');
      fab.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
      focus.setAttribute('aria-hidden', 'true');
    } else {
      dock.setAttribute('data-state', 'open');
      dock.setAttribute('aria-hidden', 'false');
      fab.classList.add('is-open');
      fab.setAttribute('aria-expanded', 'true');
      focus.setAttribute('aria-hidden', 'false');
    }
  }

  function closePublishDock() {
    var fab = document.getElementById('my-publish-fab');
    var dock = document.getElementById('my-publish-dock');
    var focus = document.getElementById('my-publish-focus');
    if (!dock || !fab || !focus) return;
    dock.setAttribute('data-state', 'closed');
    dock.setAttribute('aria-hidden', 'true');
    fab.classList.remove('is-open');
    fab.setAttribute('aria-expanded', 'false');
    focus.setAttribute('aria-hidden', 'true');
  }

  /* ── 注册场景 ── */

  window.WegoApp.registerScene({
    routeId: 'my-page',
    template: `
      <section class="my-page" data-surface-id="my-page" data-route-id="my-page" data-layout-mode="composed" data-page-edge-mode="M0" data-bg="page" data-route-bound="true">
        
        <div class="navbar" data-dd-id="my-navbar" data-component-slug="navbar" data-component-binding="my-navbar">
          <div class="navbar__body navbar__body--split">
            <div class="navbar__left navbar__left--custom">
              <button type="button" class="my-page__identity" aria-label="\u5207\u6362\u76F8\u518C" data-dom-id="switch-album">
                <div class="avatar avatar--40 avatar--image"><img src="./lib/assets/images/avatar/default-shop.png" alt=""></div>
                <span class="my-page__identity-name">\u5FAE\u8D2D\u4F18\u9009\u5546\u884C</span>
                <i class="wego-iconfont-s icon-renzheng my-page__identity-verified" aria-label="\u5DF2\u8BA4\u8BC1"></i>
                <i class="wego-iconfont-s icon-xiajiantou16 my-page__identity-caret" aria-hidden="true"></i>
              </button>
            </div>
            <div class="navbar__right navbar__right--icon">
              <div class="navbar__action" data-dom-id="settings">
                <div class="navbar__action-icon"><i class="wego-iconfont-s icon-shezhi"></i></div>
                <span class="navbar__action-label">\u8BBE\u7F6E</span>
              </div>
              <div class="navbar__action" data-dom-id="share-profile">
                <div class="navbar__action-icon"><i class="wego-iconfont-s icon-fenxiang"></i></div>
                <span class="navbar__action-label">\u5206\u4EAB</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="my-page__scroll" data-region="scroll">
          
          <div class="my-page__member-card">
            <div class="my-page__member-level-row">
              <span class="my-page__member-level">\uD83C\uDFC5 \u9EC4\u91D1\u4F1A\u5458</span>
              <span class="my-page__member-expiry">2027-01-20 \u5230\u671F</span>
            </div>
            <div class="my-page__member-storage">
              <div class="my-page__member-bar"><div class="my-page__member-fill" style="width:42%"></div></div>
              <span class="my-page__member-storage-text">\u5DF2\u7528 4.2GB / 10GB</span>
            </div>
          </div>
          
          <div class="my-page__section-title">
            <span>\u6570\u636E\u8D44\u4EA7</span>
          </div>
          <div class="my-page__hscroll" data-region="assets-hscroll">
            <div class="my-page__asset-item" data-dom-id="asset-pending-purchase">
              <div class="my-page__asset-icon my-page__asset-icon--pending">\u5F85</div>
              <span class="my-page__asset-count">3</span>
              <span class="my-page__asset-label">\u6211\u4E70\u7684</span>
            </div>
            <div class="my-page__asset-item" data-dom-id="asset-fans">
              <div class="my-page__asset-icon my-page__asset-icon--fans">\u7C89</div>
              <span class="my-page__asset-count">1.2k</span>
              <span class="my-page__asset-label">\u7C89\u4E1D</span>
            </div>
            <div class="my-page__asset-item" data-dom-id="asset-friends">
              <div class="my-page__asset-icon my-page__asset-icon--friends">\u53CB</div>
              <span class="my-page__asset-count">356</span>
              <span class="my-page__asset-label">\u597D\u53CB</span>
            </div>
            <div class="my-page__asset-item" data-dom-id="asset-agents">
              <div class="my-page__asset-icon my-page__asset-icon--agents">\u4EE3</div>
              <span class="my-page__asset-count">89</span>
              <span class="my-page__asset-label">\u4EE3\u7406</span>
            </div>
            <div class="my-page__asset-item" data-dom-id="asset-visitors">
              <div class="my-page__asset-icon my-page__asset-icon--visitors">\u8BBF</div>
              <span class="my-page__asset-count">438</span>
              <span class="my-page__asset-label">\u8BBF\u5BA2</span>
            </div>
            <div class="my-page__asset-item" data-dom-id="asset-employees">
              <div class="my-page__asset-icon my-page__asset-icon--employees">\u5458</div>
              <span class="my-page__asset-count">12</span>
              <span class="my-page__asset-label">\u5458\u5DE5</span>
            </div>
            <div class="my-page__asset-item" data-dom-id="asset-wallet">
              <div class="my-page__asset-icon my-page__asset-icon--wallet">\u94B1</div>
              <span class="my-page__asset-count">\u00A52.6k</span>
              <span class="my-page__asset-label">\u94B1\u5305</span>
            </div>
            <div class="my-page__asset-item" data-dom-id="asset-coupons">
              <div class="my-page__asset-icon my-page__asset-icon--coupons">\u5238</div>
              <span class="my-page__asset-count">15</span>
              <span class="my-page__asset-label">\u5361\u5238</span>
            </div>
            <div class="my-page__asset-item" data-dom-id="asset-favorites">
              <div class="my-page__asset-icon my-page__asset-icon--favorites">\u85CF</div>
              <span class="my-page__asset-count">237</span>
              <span class="my-page__asset-label">\u6536\u85CF</span>
            </div>
          </div>
          
          <div class="my-page__section-title">
            <span>\u5E38\u7528\u5E94\u7528</span>
          </div>
          <div class="my-page__hscroll" data-region="apps-hscroll">
            <div class="my-page__app-item" data-dom-id="app-homepage">
              <div class="my-page__app-icon my-page__app-icon--brand">\uD83C\uDFE0</div>
              <span class="my-page__app-label">\u8FDB\u5165\u4E3B\u9875</span>
            </div>
            <div class="my-page__app-item" data-dom-id="app-qr">
              <div class="my-page__app-icon my-page__app-icon--brand">\u25A0</div>
              <span class="my-page__app-label">\u4E8C\u7EF4\u7801</span>
            </div>
            <div class="my-page__app-item" data-dom-id="app-recent">
              <div class="my-page__app-icon my-page__app-icon--plain">\u22EF</div>
              <span class="my-page__app-label">\u6700\u8FD1\u5E94\u7528</span>
            </div>
            <div class="my-page__app-item" data-dom-id="app-all">
              <div class="my-page__app-icon my-page__app-icon--plain">\u229E</div>
              <span class="my-page__app-label">\u5168\u90E8</span>
            </div>
          </div>
          
          <div class="my-page__type-tabs">
            <div class="wg-tabs wg-tabs--standard wg-tabs--divide" role="tablist" data-dd-id="my-type-tabs" data-component-slug="tabs" data-component-binding="my-type-tabs">
              <div class="wg-tabs__scroll">
                <button class="wg-tabs__item" role="tab" aria-selected="true" type="button" data-tab="products">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">\u4EA7\u54C1</span></span>
                </button>
                <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-tab="notes">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">\u7B14\u8BB0</span></span>
                </button>
                <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-tab="live">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">\u76F4\u64AD</span></span>
                </button>
                <span class="wg-tabs__active-indicator" aria-hidden="true"></span>
              </div>
            </div>
          </div>
          
          <div class="my-page__toolbar">
            <div class="my-page__toolbar-search" data-dom-id="search">
              <i class="wego-iconfont-s icon-sousuo my-page__toolbar-search-icon" aria-hidden="true"></i>
              <span class="my-page__toolbar-search-text">\u5728\u5F53\u524D\u7C7B\u578B\u5185\u641C\u7D22</span>
            </div>
            <button type="button" class="my-page__toolbar-action" data-dom-id="filter" aria-label="\u7B5B\u9009">
              <i class="wego-iconfont-s icon-sandian16" aria-hidden="true"></i>
            </button>
            <button type="button" class="my-page__toolbar-action" id="my-view-toggle" data-dom-id="view-toggle" aria-label="\u5207\u6362\u89C6\u56FE">
              \u22EE
            </button>
          </div>
          
          <div class="my-page__content" id="my-page-content"></div>
        </div>
        
        <div class="my-page__publish-focus" id="my-publish-focus" aria-hidden="true" data-dom-id="publish-focus"></div>
        
        <div class="my-page__publish-dock" id="my-publish-dock" data-state="closed" aria-hidden="true" data-region="publish-dock">
          <div class="my-page__publish-dock-surface">
            <div class="my-page__publish-list">
              <button type="button" class="my-page__publish-choice" data-dom-id="publish-action-product">
                <span class="my-page__publish-icon-host"><i class="wego-iconfont-s icon-fabushangpin my-page__publish-choice-icon" aria-hidden="true"></i></span>
                <span class="my-page__publish-choice-text">\u53D1\u4EA7\u54C1</span>
              </button>
              <button type="button" class="my-page__publish-choice" data-dom-id="publish-action-note">
                <span class="my-page__publish-icon-host"><i class="wego-iconfont-s icon-fabubiji my-page__publish-choice-icon" aria-hidden="true"></i></span>
                <span class="my-page__publish-choice-text">\u53D1\u7B14\u8BB0</span>
              </button>
              <button type="button" class="my-page__publish-choice" data-dom-id="publish-action-live">
                <span class="my-page__publish-icon-host"><i class="wego-iconfont-s icon-zhibo my-page__publish-choice-icon" aria-hidden="true"></i></span>
                <span class="my-page__publish-choice-text">\u5F00\u76F4\u64AD</span>
              </button>
              <button type="button" class="my-page__publish-choice" data-dom-id="publish-action-import">
                <span class="my-page__publish-icon-host"><i class="wego-iconfont-s icon-piliangdaoru my-page__publish-choice-icon" aria-hidden="true"></i></span>
                <span class="my-page__publish-choice-text">\u6279\u91CF\u5BFC\u5165</span>
              </button>
              <button type="button" class="my-page__publish-choice" data-dom-id="publish-action-scan">
                <span class="my-page__publish-icon-host"><i class="wego-iconfont-s icon-saoyisao my-page__publish-choice-icon" aria-hidden="true"></i></span>
                <span class="my-page__publish-choice-text">\u626B\u4E00\u626B</span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="my-page__fab-stack">
          <button type="button" class="my-page__fab my-page__fab--publish" id="my-publish-fab" aria-label="\u53D1\u5E03" aria-haspopup="menu" aria-expanded="false" data-dom-id="open-publish-menu">
            <i class="wego-iconfont-s icon-jia my-page__fab-icon" aria-hidden="true"></i>
          </button>
          <button type="button" class="my-page__fab" id="my-cart-fab" aria-label="\u6253\u5F00\u8D2D\u7269\u8F66" data-dom-id="open-cart" hidden>
            <i class="wego-iconfont-s icon-gouwuche my-page__fab-icon" aria-hidden="true"></i>
            <span class="badge badge--number badge--corner my-page__cart-badge" data-cart-count data-dd-id="my-cart-badge" data-component-slug="badge" data-component-binding="my-cart-badge">0</span>
          </button>
        </div>
        
        <div class="contract-seed" hidden aria-hidden="true">
          <span class="badge badge--number badge--corner" data-dd-id="my-cart-badge-seed" data-component-slug="badge" data-component-binding="my-cart-badge">0</span>
        </div>
      </section>
    `,
    presentation: {
      type: 'host-tab',
      transition: 'none',
      dismissAction: 'tab-switch',
      overlayLevel: 'inline',
      coversTabBar: false
    },
    init: function (ctx) {
      /* 初始渲染 */
      updateContent();
      updateToolbarViewBtn();

      /* 延迟初始化 tabs indicator */
      var tabs = document.querySelector('.my-page__type-tabs');
      if (tabs) requestAnimationFrame(function () { updateTabsIndicator(tabs); });

      /* ── 类型 Tabs 切换 ── */
      if (tabs) {
        tabs.addEventListener('click', function (e) {
          var item = e.target.closest('.wg-tabs__item');
          if (!item || !item.hasAttribute('data-tab')) return;
          var tab = item.getAttribute('data-tab');
          if (tab === currentTab) return;
          closePublishDock();
          switchTab(tab);
        });
      }

      /* ── 视图切换 ── */
      var viewBtn = document.getElementById('my-view-toggle');
      if (viewBtn) {
        viewBtn.addEventListener('click', function () {
          toggleView();
        });
      }

      /* ── 发布 FAB ── */
      var publishFab = document.getElementById('my-publish-fab');
      if (publishFab) {
        publishFab.addEventListener('click', function () {
          openPublishDock(ctx);
        });
      }

      /* ── 发布托盘遮罩关闭 ── */
      var focus = document.getElementById('my-publish-focus');
      if (focus) {
        focus.addEventListener('click', function () {
          closePublishDock();
        });
      }

      /* ── 发布选项（stub） ── */
      document.querySelectorAll('[data-dom-id^="publish-action-"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          closePublishDock();
          ctx.showToast('功能即将开放');
        });
      });

      /* ── 购物车 FAB（stub） ── */
      var cartFab = document.getElementById('my-cart-fab');
      if (cartFab) {
        cartFab.addEventListener('click', function () {
          ctx.showToast('功能即将开放');
        });
      }

      /* ── 设置入口（stub） ── */
      var settingsBtn = document.querySelector('[data-dom-id="settings"]');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', function () {
          ctx.showToast('功能即将开放');
        });
      }

      /* ── 分享入口（stub） ── */
      var shareBtn = document.querySelector('[data-dom-id="share-profile"]');
      if (shareBtn) {
        shareBtn.addEventListener('click', function () {
          ctx.showToast('功能即将开放');
        });
      }

      /* ── 搜索入口（stub） ── */
      var searchBtn = document.querySelector('[data-dom-id="search"]');
      if (searchBtn) {
        searchBtn.addEventListener('click', function () {
          ctx.showToast('功能即将开放');
        });
      }

      /* ── 筛选入口（stub） ── */
      var filterBtn = document.querySelector('[data-dom-id="filter"]');
      if (filterBtn) {
        filterBtn.addEventListener('click', function () {
          ctx.showToast('功能即将开放');
        });
      }

      /* ── 切换相册入口（stub） ── */
      var switchAlbum = document.querySelector('[data-dom-id="switch-album"]');
      if (switchAlbum) {
        switchAlbum.addEventListener('click', function () {
          ctx.showToast('功能即将开放');
        });
      }

      /* ── 数据资产/常用应用入口（stub） ── */
      document.querySelectorAll('[data-dom-id^="asset-"], [data-dom-id^="app-"]').forEach(function (el) {
        el.addEventListener('click', function () {
          ctx.showToast('功能即将开放');
        });
      });

      /* ── 窗口 resize 更新 indicator ── */
      window.addEventListener('resize', function () {
        var tabsEl = document.querySelector('.my-page__type-tabs');
        if (tabsEl) updateTabsIndicator(tabsEl);
      });
    }
  });
})();
