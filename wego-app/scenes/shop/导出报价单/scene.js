/**
 * 导出报价单场景（shop244）：选品 → 预览编辑 → 分享导出 → 报价记录 全闭环。
 * 阶段B：入口分流与选品页。入口来自「我的」内容管理-批量-批量导出（见 我的/scene.js）。
 * 选品页支持：按产品报价 / 按图报价 两种模式切换、商品搜索（名称/货号/搜索码）、
 * 列表/宫格视图、商品勾选、底部批量栏（全选/已选计数下拉/查看已选/下一步）、分页滚动加载。
 * 筛选面板与预览编辑、分享导出、报价记录在后续阶段接入（筛选按钮当前展示条件条占位）。
 */
const quoteSelectTemplate = `<div class="layout-page quote-page" data-surface-id="quote-export" data-route-id="quote-export" data-layout-mode="composed" data-bg="page" data-component-slug="layout-page">
  <div class="layout-page__top">
    <nav class="navbar" data-component-slug="navbar">
      <div class="navbar__body navbar__body--split">
        <div class="navbar__left">
          <button type="button" class="navbar__left-btn" data-dom-id="quote-back" aria-label="返回">
            <i class="wego-iconfont-s icon-fanhui" aria-hidden="true"></i>
          </button>
        </div>
        <div class="navbar__center">
          <div class="quote-nav-mode">
            <button type="button" class="quote-nav-mode__button" data-dom-id="quote-mode-button" aria-haspopup="menu" aria-expanded="false">
              <span data-role="quote-mode-label">按产品报价</span>
              <i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i>
            </button>
            <div class="popmenu popmenu--select quote-mode-menu" data-component-slug="popmenu" data-role="quote-mode-menu" role="listbox" data-state="closed" hidden>
              <div class="popmenu__list">
                <div class="popmenu__item" data-role="quote-mode-option" data-mode="product">
                  <span class="popmenu__item-text">按产品报价</span>
                  <i class="wego-iconfont-s icon-gou-jiacu popmenu__item-check"></i>
                </div>
                <div class="popmenu__item" data-role="quote-mode-option" data-mode="image">
                  <span class="popmenu__item-text">按图报价</span>
                  <i class="wego-iconfont-s icon-gou-jiacu popmenu__item-check"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="navbar__right navbar__right--icon">
          <button type="button" class="navbar__action" data-dom-id="quote-records-entry" aria-label="报价记录">
            <span class="navbar__action-icon"><i class="wego-iconfont-s icon-shangxiajiantou16" aria-hidden="true"></i></span>
          </button>
          <span class="quote-guide-bubble" data-role="quote-guide-bubble" hidden>你的报价单都在这</span>
        </div>
      </div>
    </nav>
    <div class="quote-select-toolbar">
      <div class="search-toolbar quote-search-toolbar">
        <div class="searchbox searchbox--md searchbox--white" data-component-slug="search">
          <span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>
          <div class="searchbox__input">
            <input class="searchbox__field" data-dom-id="quote-search-input" type="search" placeholder="商品名、货号、搜索码" aria-label="搜索商品">
          </div>
          <div class="searchbox__actions">
            <button class="searchbox__action searchbox__clear wego-iconfont-s icon-yuancha-mian" data-dom-id="quote-search-clear" type="button" aria-label="清除搜索" hidden></button>
          </div>
        </div>
        <div class="search-toolbar__actions">
          <button class="search-toolbar__action" data-dom-id="quote-view-toggle" type="button" aria-label="切换视图">
            <span class="search-toolbar__action-icon wego-iconfont-s icon-liebiao" data-role="quote-view-icon" aria-hidden="true"></span>
            <span data-role="quote-view-label">列表</span>
          </button>
          <button class="search-toolbar__action quote-filter-btn" data-dom-id="quote-filter-btn" type="button">
            <span class="search-toolbar__action-icon wego-iconfont-s icon-shaixuan" aria-hidden="true"></span>
            筛选
            <span class="badge badge--number quote-filter-badge" data-component-slug="badge" data-role="quote-filter-badge" hidden><span class="badge__text" data-role="quote-filter-count">0</span></span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="layout-page__body">
    <div class="layout-scroll quote-scroll" data-component-slug="layout-scroll" data-role="quote-scroll">
      <div class="quote-filter-strip" data-role="quote-filter-strip" hidden></div>
      <div class="quote-list" data-role="quote-list"></div>
      <div class="quote-list-loading" data-role="quote-list-loading" hidden>正在加载商品…</div>
      <div class="quote-empty" data-role="quote-empty" hidden></div>
    </div>
  </div>
  <div class="layout-page__bottom">
    <div class="bottom-action-bar bottom-action-bar--selection quote-bottom-bar" data-component-slug="bottom-action-bar">
      <div class="bottom-action-bar__inner">
        <div class="bottom-action-bar__leading">
          <button type="button" class="bottom-action-bar__action" data-dom-id="quote-select-all">全选</button>
          <button type="button" class="bottom-action-bar__action quote-bar-count-btn" data-dom-id="quote-count-dropdown" aria-haspopup="menu" aria-expanded="false">
            <span data-role="quote-count-label">已选 0</span>
            <i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i>
          </button>
          <div class="popmenu popmenu--select quote-count-menu" data-component-slug="popmenu" data-role="quote-count-menu" role="listbox" data-state="closed" hidden>
            <div class="popmenu__list">
              <div class="popmenu__item" data-role="quote-batch-option" data-value="all"><span class="popmenu__item-text">全选全部</span></div>
              <div class="popmenu__item" data-role="quote-batch-option" data-value="clear"><span class="popmenu__item-text">清空已选</span></div>
            </div>
          </div>
          <button type="button" class="bottom-action-bar__action" data-dom-id="quote-view-selected">查看已选</button>
        </div>
        <div class="bottom-action-bar__trailing">
          <button type="button" class="btn btn--strong btn--md" data-component-slug="button" data-dom-id="quote-next" disabled>下一步</button>
        </div>
      </div>
    </div>
  </div>
</div>`;

(function () {
  var DB = window.WEGO_PROTOTYPE_DB;
  var PRODUCTS = DB && DB.products ? DB.products : [];
  var STORAGE_KEYS = {
    mode: 'wego.quote.selectMode',
    guide: 'wego.quote.guideSeen',
    records: 'wego.quote.records'
  };
  var PAGE_SIZE = 6;

  function safeReadJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function safeWriteJSON(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 隐私模式忽略 */ }
  }
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\x22/g, '&quot;').replace(/\x27/g, '&#39;');
  }
  function metricHtml(price, size) {
    var parts = String(price).split('.');
    return '<span class="metric metric--' + size + ' metric--marketing" data-component-slug="metric"><span class="metric__main"><span class="metric__symbol">¥</span><span class="metric__value"><span class="metric__integer">' + escapeHtml(parts[0]) + '</span>' + (parts[1] ? '<span class="metric__decimal">.' + escapeHtml(parts[1]) + '</span>' : '') + '</span></span></span>';
  }
  function checkboxHtml(checked, extra) {
    return '<div class="checkbox' + (checked ? ' checkbox--checked' : '') + '" data-component-slug="checkbox"' + (extra || '') + '><div class="checkbox__inner"></div>' + (checked ? '<div class="checkbox__icon"><img class="checkbox__asset" src="./lib/assets/icons/checkbox-check.svg" alt=""></div>' : '') + '</div>';
  }
  function productImages(product) {
    var list = (product.image_list || []).filter(Boolean);
    return list.length ? list : ['./lib/assets/icons/default-diagram.svg'];
  }
  function tagsHtml(product) {
    var parts = [];
    if (product.category) parts.push('<span class="quote-tag">' + escapeHtml(product.category) + '</span>');
    if (product.source) parts.push('<span class="quote-tag quote-tag--muted">' + escapeHtml(product.source) + '</span>');
    return parts.join('');
  }
  function activateImages(scope) {
    if (!scope) return;
    Array.prototype.forEach.call(scope.querySelectorAll('.wg-image__src'), function (img) {
      if (img.classList.contains('is-loaded')) return;
      img.addEventListener('load', function () { img.classList.add('is-loaded'); }, { once: true });
      if (img.complete && img.naturalWidth) img.classList.add('is-loaded');
    });
  }

  window.WegoApp.registerScene({
    routeId: 'quote-export',
    template: quoteSelectTemplate,
    presentation: { type: 'push', transition: 'slide-left', coversTabBar: true },
    init: function init(ctx) {
      var root = ctx.root;
      var destroyed = false;
      var state = {
        selectMode: safeReadJSON(STORAGE_KEYS.mode, 'product'),
        view: 'list',
        query: '',
        page: 1,
        hasMore: true,
        loading: false,
        selected: {}          /* 按产品模式：{ product_id: true }；按图模式：{ product_id + ':' + idx: true } */
      };
      var listEl = root.querySelector('[data-role="quote-list"]');
      var scrollEl = root.querySelector('[data-role="quote-scroll"]');
      var emptyEl = root.querySelector('[data-role="quote-empty"]');
      var loadingEl = root.querySelector('[data-role="quote-list-loading"]');
      var searchInput = root.querySelector('[data-dom-id="quote-search-input"]');
      var searchClear = root.querySelector('[data-dom-id="quote-search-clear"]');
      var countLabel = root.querySelector('[data-role="quote-count-label"]');
      var nextBtn = root.querySelector('[data-dom-id="quote-next"]');
      var selectAllBtn = root.querySelector('[data-dom-id="quote-select-all"]');
      var modeButton = root.querySelector('[data-dom-id="quote-mode-button"]');
      var modeMenu = root.querySelector('[data-role="quote-mode-menu"]');
      var countDropdown = root.querySelector('[data-dom-id="quote-count-dropdown"]');
      var countMenu = root.querySelector('[data-role="quote-count-menu"]');
      var guideBubble = root.querySelector('[data-role="quote-guide-bubble"]');
      var toolbarEl = root.querySelector('.quote-search-toolbar');

      function currentList() {
        var query = state.query.trim().toLowerCase();
        return PRODUCTS.filter(function (p) {
          if (query) {
            var hit = (p.title || '').toLowerCase().indexOf(query) >= 0
              || (p.item_no || '').toLowerCase().indexOf(query) >= 0
              || (p.search_code || '').toLowerCase().indexOf(query) >= 0;
            if (!hit) return false;
          }
          return true;
        });
      }

      function selectionKey(mode, p, idx) {
        return mode === 'image' ? p.product_id + ':' + idx : p.product_id;
      }
      function selectedCount() {
        var keys = Object.keys(state.selected);
        return keys.filter(function (k) { return state.selected[k]; }).length;
      }
      function isSelected(mode, p, idx) {
        return Boolean(state.selected[selectionKey(mode, p, idx)]);
      }
      function toggleSelect(mode, p, idx) {
        var key = selectionKey(mode, p, idx);
        if (state.selected[key]) delete state.selected[key];
        else state.selected[key] = true;
      }
      function allSelectedInList(list) {
        var total = 0, sel = 0;
        list.forEach(function (p) {
          if (state.selectMode === 'image') {
            productImages(p).forEach(function (_, idx) {
              total++;
              if (isSelected('image', p, idx)) sel++;
            });
          } else {
            total++;
            if (isSelected('product', p, 0)) sel++;
          }
        });
        return { total: total, sel: sel };
      }

      function productRowHtml(p) {
        var img = productImages(p)[0];
        return '<div class="quote-product-row" data-quote-toggle data-mode="product" data-id="' + escapeHtml(p.product_id) + '">'
          + '<div class="quote-product-row__select">' + checkboxHtml(isSelected('product', p, 0), ' data-role="quote-check"') + '</div>'
          + '<div class="wg-image wg-image--rounded-sm quote-product-row__img" data-component-slug="image"><img class="wg-image__src" src="' + escapeHtml(img) + '" alt="' + escapeHtml(p.title) + '" loading="lazy"></div>'
          + '<div class="quote-product-row__info">'
          + '<h3 class="quote-product-row__title"><span class="quote-row__no">' + escapeHtml(p.item_no) + '</span><span class="quote-row__divider">|</span><span class="quote-row__name">' + escapeHtml(p.title) + '</span></h3>'
          + (p.specification ? '<div class="quote-product-row__spec">' + escapeHtml(p.specification) + '</div>' : '')
          + '<div class="quote-product-row__price">' + metricHtml(p.price, '14') + '</div>'
          + '</div>'
          + '</div>';
      }
      function productGridCardHtml(p) {
        var img = productImages(p)[0];
        return '<div class="card card--surface quote-product-grid-card" data-component-slug="card" data-quote-toggle data-mode="product" data-id="' + escapeHtml(p.product_id) + '">'
          + '<div class="quote-product-grid-card__select">' + checkboxHtml(isSelected('product', p, 0), ' data-role="quote-check"') + '</div>'
          + '<div class="wg-image wg-image--rounded-sm quote-product-grid-card__img" data-component-slug="image"><img class="wg-image__src" src="' + escapeHtml(img) + '" alt="' + escapeHtml(p.title) + '" loading="lazy"></div>'
          + '<div class="quote-product-grid-card__info"><h3 class="quote-product-grid-card__title"><span class="quote-row__no">' + escapeHtml(p.item_no) + '</span><span class="quote-row__divider">|</span><span class="quote-row__name">' + escapeHtml(p.title) + '</span></h3>'
          + (p.specification ? '<div class="quote-product-grid-card__spec">' + escapeHtml(p.specification) + '</div>' : '')
          + '<div class="quote-product-grid-card__price">' + metricHtml(p.price, '14') + '</div></div>'
          + '</div>';
      }
      function imageGroupHtml(p) {
        var images = productImages(p);
        var groupSel = 0;
        images.forEach(function (_, idx) { if (isSelected('image', p, idx)) groupSel++; });
        var all = groupSel === images.length && images.length > 0;
        return '<section class="quote-image-group" data-group-id="' + escapeHtml(p.product_id) + '">'
          + '<div class="quote-image-group__head">'
          + '<button type="button" class="quote-image-group__select" data-quote-toggle-group data-id="' + escapeHtml(p.product_id) + '" aria-label="全选本组">' + checkboxHtml(all, ' data-role="quote-check"') + '</button>'
          + '<div class="quote-image-group__title">' + escapeHtml(p.title) + '</div>'
          + '<div class="quote-image-group__summary">' + escapeHtml(p.item_no) + ' · 已选 ' + groupSel + '/' + images.length + '</div>'
          + '</div>'
          + '<div class="quote-image-group__grid">'
          + images.map(function (img, idx) {
              return '<div class="quote-image-cell" data-quote-toggle data-mode="image" data-id="' + escapeHtml(p.product_id) + '" data-idx="' + idx + '">'
                + '<div class="wg-image wg-image--rounded-sm quote-image-cell__img" data-component-slug="image"><img class="wg-image__src" src="' + escapeHtml(img) + '" alt="' + escapeHtml(p.title + '图' + (idx + 1)) + '" loading="lazy"></div>'
                + '<div class="quote-image-cell__select">' + checkboxHtml(isSelected('image', p, idx), ' data-role="quote-check"') + '</div>'
                + '</div>';
            }).join('')
          + '</div></section>';
      }

      function renderList() {
        var list = currentList();
        var pageItems = list.slice(0, state.page * PAGE_SIZE);
        state.hasMore = pageItems.length < list.length;
        var noResult = list.length === 0 && state.query.trim() !== '';
        /* 空态（搜索无匹配）隐藏搜索工具栏，聚焦空态并给出清空入口（spec：空态隐藏搜索框） */
        if (toolbarEl) toolbarEl.hidden = noResult;
        var html = '';
        if (state.selectMode === 'image') {
          html = '<div class="quote-image-groups">' + pageItems.map(imageGroupHtml).join('') + '</div>';
        } else if (state.view === 'grid') {
          html = '<div class="layout-grid quote-product-grid" data-component-slug="layout-grid" data-columns="2" data-align="stretch">' + pageItems.map(productGridCardHtml).join('') + '</div>';
        } else {
          html = '<div class="layout-flow quote-product-list" data-component-slug="layout-flow" data-direction="vertical" data-align="stretch">' + pageItems.map(productRowHtml).join('') + '</div>';
        }
        listEl.innerHTML = html;
        activateImages(listEl);
        emptyEl.hidden = list.length !== 0;
        emptyEl.innerHTML = list.length === 0
          ? (noResult
              ? '<div class="card card--filled quote-empty__card" data-component-slug="card"><i class="wego-iconfont-s icon-sousuo" aria-hidden="true"></i><strong>暂无相关结果</strong><span>换个关键词试试</span><button type="button" class="btn btn--ghost btn--sm quote-empty__action" data-action="clear-search">清空搜索</button></div>'
              : '<div class="card card--filled quote-empty__card" data-component-slug="card"><i class="wego-iconfont-s icon-sousuo" aria-hidden="true"></i><strong>暂无商品</strong><span>商品库暂无可选商品</span></div>')
          : '';
        updateBar();
      }

      function updateBar() {
        var count = selectedCount();
        countLabel.textContent = '已选 ' + count;
        nextBtn.disabled = count === 0;
        nextBtn.classList.toggle('btn--disabled', count === 0);
        var list = currentList();
        var stat = allSelectedInList(list);
        selectAllBtn.textContent = (stat.sel > 0 && stat.sel === stat.total) ? '取消全选' : '全选';
        selectAllBtn.setAttribute('aria-pressed', (stat.sel > 0 && stat.sel === stat.total) ? 'true' : 'false');
      }

      function toggleAllInList() {
        var list = currentList();
        var stat = allSelectedInList(list);
        var all = stat.sel > 0 && stat.sel === stat.total;
        list.forEach(function (p) {
          if (state.selectMode === 'image') {
            productImages(p).forEach(function (_, idx) {
              var key = selectionKey('image', p, idx);
              if (all) delete state.selected[key]; else state.selected[key] = true;
            });
          } else {
            var key = selectionKey('product', p, 0);
            if (all) delete state.selected[key]; else state.selected[key] = true;
          }
        });
        renderList();
      }

      function clearSelection() {
        state.selected = {};
        renderList();
      }

      function openSelectedSheet() {
        var mode = state.selectMode;
        var rows = [];
        PRODUCTS.forEach(function (p) {
          if (mode === 'image') {
            productImages(p).forEach(function (img, idx) {
              if (isSelected('image', p, idx)) rows.push({ p: p, img: img, key: selectionKey('image', p, idx), label: escapeHtml(p.title) + ' · 图' + (idx + 1) });
            });
          } else {
            if (isSelected('product', p, 0)) rows.push({ p: p, img: productImages(p)[0], key: selectionKey('product', p, 0), label: escapeHtml(p.title) });
          }
        });
        var itemsHtml = rows.map(function (row) {
          return '<div class="quote-selected-item">'
            + '<div class="wg-image wg-image--rounded-sm quote-selected-item__img" data-component-slug="image"><img class="wg-image__src" src="' + escapeHtml(row.img) + '" alt="' + escapeHtml(row.p.title) + '"></div>'
            + '<div class="quote-selected-item__info"><div class="quote-selected-item__title">' + row.label + '</div><div class="quote-selected-item__meta">' + escapeHtml(row.p.item_no) + '</div></div>'
            + '<button type="button" class="quote-selected-item__remove" data-remove-selected data-key="' + escapeHtml(row.key) + '" aria-label="移除">移除</button>'
            + '</div>';
        }).join('');
        var html = '<div class="actionsheet" data-component-slug="actionsheet" role="dialog" aria-modal="true" data-state="open">'
          + '<div class="actionsheet__panel actionsheet__panel--lg">'
          + '<div class="actionsheet__header"><h2 class="actionsheet__title">已选产品</h2><button type="button" class="actionsheet__close wego-iconfont-s icon-guanbi" data-dom-id="quote-selected-close" data-close-selected-sheet aria-label="关闭"></button></div>'
          + '<div class="quote-selected-list">' + (itemsHtml || '<div class="quote-selected-empty">暂无可展示的已选商品</div>') + '</div>'
          + '</div>'
          + '</div>';
        ctx.openSheet(html, {
          label: '查看已选',
          init: function (sheetCtx) {
            var sheetRoot = sheetCtx.root;
            activateImages(sheetRoot);
            Array.prototype.forEach.call(sheetRoot.querySelectorAll('[data-remove-selected]'), function (btn) {
              btn.addEventListener('click', function () {
                var key = btn.getAttribute('data-key');
                if (key && state.selected[key]) delete state.selected[key];
                ctx.closeOverlay();
                renderList();
                ctx.toast('已移除 1 项');
              });
            });
            var close = sheetRoot.querySelector('[data-close-selected-sheet]');
            if (close) close.addEventListener('click', function () { ctx.closeOverlay(); });
            sheetRoot.addEventListener('click', function (e) { if (e.target === sheetCtx.root) ctx.closeOverlay(); });
          }
        });
      }

      function toggleMenu(btn, menu, open) {
        menu.hidden = !open;
        menu.setAttribute('data-state', open ? 'open' : 'closed');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) btn.classList.add('is-open');
        else btn.classList.remove('is-open');
      }
      function closeAllMenus() {
        toggleMenu(modeButton, modeMenu, false);
        toggleMenu(countDropdown, countMenu, false);
      }

      function switchMode(mode) {
        if (mode !== 'product' && mode !== 'image') return;
        state.selectMode = mode;
        state.page = 1;
        state.selected = {};   /* 模式切换后重置已选（两种模式选择单位不同） */
        safeWriteJSON(STORAGE_KEYS.mode, mode);
        root.querySelector('[data-role="quote-mode-label"]').textContent = mode === 'image' ? '按图报价' : '按产品报价';
        var viewToggle = root.querySelector('[data-dom-id="quote-view-toggle"]');
        viewToggle.hidden = mode === 'image';
        closeAllMenus();
        renderList();
      }

      function switchView(view) {
        state.view = view === 'grid' ? 'grid' : 'list';
        state.page = 1;
        var icon = root.querySelector('[data-role="quote-view-icon"]');
        var label = root.querySelector('[data-role="quote-view-label"]');
        icon.className = 'search-toolbar__action-icon wego-iconfont-s ' + (view === 'grid' ? 'icon-datu' : 'icon-liebiao');
        label.textContent = view === 'grid' ? '网格' : '列表';
        renderList();
      }

      function applySearch(query) {
        state.query = query;
        state.page = 1;
        var has = Boolean(query);
        searchClear.hidden = !has;
        searchInput.closest('.searchbox').classList.toggle('is-inputting', has);
        searchInput.closest('.searchbox').classList.toggle('is-text-result', has);
        renderList();
      }

      function showGuideBubble() {
        var seen = safeReadJSON(STORAGE_KEYS.guide, false);
        if (!seen && guideBubble) {
          guideBubble.hidden = false;
          safeWriteJSON(STORAGE_KEYS.guide, true);
          window.setTimeout(function () { if (!destroyed) guideBubble.hidden = true; }, 4000);
        }
      }

      function onListClick(e) {
        var target = e.target;
        var clearSearch = target.closest('[data-action="clear-search"]');
        if (clearSearch) {
          searchInput.value = '';
          applySearch('');
          return;
        }
        var toggle = target.closest('[data-quote-toggle]');
        if (toggle) {
          var mode = toggle.getAttribute('data-mode');
          var pid = toggle.getAttribute('data-id');
          var idx = toggle.getAttribute('data-idx') ? Number(toggle.getAttribute('data-idx')) : 0;
          var p = PRODUCTS.filter(function (x) { return x.product_id === pid; })[0];
          if (p) { toggleSelect(mode, p, idx); renderList(); }
          return;
        }
        var groupToggle = target.closest('[data-quote-toggle-group]');
        if (groupToggle) {
          var gid = groupToggle.getAttribute('data-id');
          var gp = PRODUCTS.filter(function (x) { return x.product_id === gid; })[0];
          if (gp) {
            var images = productImages(gp);
            var sel = 0;
            images.forEach(function (_, idx) { if (isSelected('image', gp, idx)) sel++; });
            var all = sel === images.length && images.length > 0;
            images.forEach(function (_, idx) {
              var key = selectionKey('image', gp, idx);
              if (all) delete state.selected[key]; else state.selected[key] = true;
            });
            renderList();
          }
          return;
        }
      }

      function onDocumentClick(e) {
        if (destroyed) return;
        var insideMenu = e.target.closest('[data-role="quote-mode-menu"]')
          || e.target.closest('[data-role="quote-count-menu"]')
          || e.target.closest('[data-dom-id="quote-mode-button"]')
          || e.target.closest('[data-dom-id="quote-count-dropdown"]');
        if (!insideMenu) closeAllMenus();
      }

      function onScroll() {
        var bottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 40;
        if (bottom && state.hasMore && !state.loading) {
          state.loading = true;
          loadingEl.hidden = false;
          window.setTimeout(function () {
            if (destroyed) return;
            state.page += 1;
            state.loading = false;
            loadingEl.hidden = true;
            renderList();
          }, 400);
        }
      }

      /* 初始化 */
      if (state.selectMode === 'image') {
        root.querySelector('[data-role="quote-mode-label"]').textContent = '按图报价';
        root.querySelector('[data-dom-id="quote-view-toggle"]').hidden = true;
      }
      renderList();
      showGuideBubble();
      if (guideBubble) guideBubble.addEventListener('click', function () { guideBubble.hidden = true; });

      /* 交互 data-dom-id 显式绑定 */
      root.querySelector('[data-dom-id="quote-back"]').addEventListener('click', function () { ctx.navigateBack(); });
      root.querySelector('[data-dom-id="quote-records-entry"]').addEventListener('click', function () { ctx.toast('报价记录将在后续阶段接入'); });
      modeButton.addEventListener('click', function () { toggleMenu(modeButton, modeMenu, modeMenu.hidden); });
      root.querySelector('[data-dom-id="quote-view-toggle"]').addEventListener('click', function () { switchView(state.view === 'grid' ? 'list' : 'grid'); });
      root.querySelector('[data-dom-id="quote-filter-btn"]').addEventListener('click', function () {
        var badge = root.querySelector('[data-role="quote-filter-badge"]');
        var strip = root.querySelector('[data-role="quote-filter-strip"]');
        badge.hidden = false;
        strip.hidden = false;
        root.querySelector('[data-role="quote-filter-count"]').textContent = '1';
        ctx.toast('筛选面板将在后续阶段接入');
      });
      selectAllBtn.addEventListener('click', function () { toggleAllInList(); });
      countDropdown.addEventListener('click', function () { toggleMenu(countDropdown, countMenu, countMenu.hidden); });
      root.querySelector('[data-dom-id="quote-view-selected"]').addEventListener('click', openSelectedSheet);
      nextBtn.addEventListener('click', function () {
        ctx.toast('已选 ' + selectedCount() + ' 项，预览编辑将在下一阶段接入');
      });
      searchInput.addEventListener('input', function () { applySearch(searchInput.value); });
      searchClear.addEventListener('click', function () { searchInput.value = ''; applySearch(''); searchInput.focus(); });

      /* 菜单选项绑定 */
      Array.prototype.forEach.call(root.querySelectorAll('[data-role="quote-mode-option"]'), function (opt) {
        opt.addEventListener('click', function () { switchMode(opt.getAttribute('data-mode')); });
      });
      Array.prototype.forEach.call(root.querySelectorAll('[data-role="quote-batch-option"]'), function (opt) {
        opt.addEventListener('click', function () {
          var value = opt.getAttribute('data-value');
          closeAllMenus();
          if (value === 'all') toggleAllInList();
          else if (value === 'clear') clearSelection();
        });
      });

      /* 动态商品列表委托 + 滚动分页 + 外部点击关闭菜单 */
      scrollEl.addEventListener('click', onListClick);
      scrollEl.addEventListener('scroll', onScroll);
      document.addEventListener('click', onDocumentClick);

      ctx.bindScrollLayout({
        scrollRoot: '.quote-scroll',
        regions: [],
        fixedRegions: [{ selector: '.quote-count-menu', edge: 'bottom', gap: 8 }]
      });

      ctx.onDestroy(function () {
        destroyed = true;
        scrollEl.removeEventListener('click', onListClick);
        scrollEl.removeEventListener('scroll', onScroll);
        document.removeEventListener('click', onDocumentClick);
      });
    }
  });
})();
