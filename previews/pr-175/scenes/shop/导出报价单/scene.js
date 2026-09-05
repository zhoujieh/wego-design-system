/**
 * 导出报价单场景（shop244）：选品 → 预览编辑 → 分享导出 → 报价记录 全闭环。
 * 阶段B/C：入口分流、选品页与报价单预览编辑。入口来自「我的」内容管理-批量-批量导出（见 我的/scene.js）。
 * 选品页支持：按产品报价 / 按图报价 两种模式切换、商品搜索（名称/货号/搜索码）、
 * 列表/宫格视图、商品勾选、底部批量栏（全选/已选计数下拉/查看已选/下一步）、分页滚动加载。
 * 筛选面板、分享导出、报价记录在后续阶段接入（筛选按钮当前展示条件条占位）。
 */
const quoteSelectTemplate = `<div class="layout-page quote-page" data-surface-id="quote-export" data-route-id="quote-export" data-layout-mode="composed" data-bg="page" data-component-slug="layout-page">
  <div class="layout-page__top">
    <nav class="navbar" data-component-slug="navbar">
      <div class="navbar__body">
        <div class="navbar__left">
          <button type="button" class="navbar__left-btn" data-dom-id="quote-back" aria-label="返回">
            <i class="wego-iconfont-s icon-fanhui" aria-hidden="true"></i>
          </button>
        </div>
        <div class="navbar__center navbar__center--custom">
          <div class="quote-nav-mode">
            <button type="button" class="quote-nav-mode__button" data-dom-id="quote-mode-button" aria-haspopup="listbox" aria-controls="quote-mode-menu" aria-expanded="false">
              <span data-role="quote-mode-label">按产品报价</span>
              <i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i>
            </button>
            <div class="popmenu popmenu--select quote-mode-menu" id="quote-mode-menu" data-component-slug="popmenu" data-role="quote-mode-menu" role="listbox" data-state="closed" hidden>
              <div class="popmenu__list">
                <div class="popmenu__item popmenu__item--selected" data-role="quote-mode-option" data-mode="product" role="option" aria-selected="true">
                  <span class="popmenu__item-text">按产品报价</span>
                  <i class="wego-iconfont-s icon-gou-jiacu popmenu__item-check"></i>
                </div>
                <div class="popmenu__item" data-role="quote-mode-option" data-mode="image" role="option" aria-selected="false">
                  <span class="popmenu__item-text">按图报价</span>
                  <i class="wego-iconfont-s icon-gou-jiacu popmenu__item-check"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="navbar__right navbar__right--icon">
          <button type="button" class="navbar__action" data-dom-id="quote-records-entry" aria-label="报价记录">
            <span class="navbar__action-icon"><i class="wego-iconfont-s icon-shijian" aria-hidden="true"></i></span>
            <span class="navbar__action-label">报价记录</span>
          </button>
          <div class="popover popover--normal quote-guide-popover" data-component-slug="popover" data-role="quote-guide-bubble" role="tooltip" data-variant="normal" data-placement="bottom" data-align="end" data-state="closed" hidden>
            <div class="popover__arrow"></div>
            <div class="popover__body">
              <span class="popover__text">你的报价单都在这</span>
            </div>
          </div>
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
          <button class="search-toolbar__action quote-filter-btn" data-dom-id="quote-filter-sheet-btn" type="button" aria-pressed="false">
            <span class="search-toolbar__action-icon wego-iconfont-s icon-shaixuan" aria-hidden="true"></span>
            筛选
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
        <div class="bottom-action-bar__leading quote-batch-control">
          <button type="button" class="bottom-action-bar__selection-toggle quote-select-check-btn" data-dom-id="quote-select-all" aria-pressed="false" aria-label="批量选择商品">
            <span class="bottom-action-bar__checkbox-field" tabindex="-1" role="checkbox" aria-checked="false">
              <span class="checkbox" data-component-slug="checkbox" data-role="quote-check"><span class="checkbox__inner"></span></span>
            </span>
          </button>
          <button type="button" class="bottom-action-bar__selection-toggle quote-bar-count-btn" data-dom-id="quote-count-dropdown" aria-haspopup="menu" aria-expanded="false">
            <span class="bottom-action-bar__selection-value"><span data-role="quote-count-label">0/100</span><i class="bottom-action-bar__selection-caret wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i></span>
          </button>
          <span class="quote-batch-divider" aria-hidden="true" hidden></span>
          <button type="button" class="link quote-view-selected-btn" data-component-slug="link" data-dom-id="quote-view-selected" hidden>
            查看已选
          </button>
          <div class="popmenu popmenu--select quote-count-menu" data-component-slug="popmenu" data-role="quote-count-menu" role="listbox" data-state="closed" hidden>
            <div class="popmenu__list">
              <div class="popmenu__item" data-role="quote-batch-option" data-value="50" role="option" aria-selected="false"><span class="popmenu__item-text">50</span><i class="wego-iconfont-s icon-gou-jiacu popmenu__item-check"></i></div>
              <div class="popmenu__item popmenu__item--selected" data-role="quote-batch-option" data-value="100" role="option" aria-selected="true"><span class="popmenu__item-text">100</span><i class="wego-iconfont-s icon-gou-jiacu popmenu__item-check"></i></div>
              <div class="popmenu__item" data-role="quote-batch-option" data-value="200" role="option" aria-selected="false"><span class="popmenu__item-text">200</span><i class="wego-iconfont-s icon-gou-jiacu popmenu__item-check"></i></div>
            </div>
          </div>
        </div>
        <div class="bottom-action-bar__trailing">
          <button type="button" class="btn btn--strong btn--md btn--disabled" data-component-slug="button" data-dom-id="quote-open-preview" aria-disabled="true" aria-label="下一步，请先选择要导出的产品">下一步</button>
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
  var DEFAULT_BATCH_SELECT_VALUE = '100';
  var BATCH_SELECT_VALUES = ['50', '100', '200'];
  var CNY_TO_USD = 7.1;
  var LANGUAGE_OPTIONS = [
    { code: 'zh-CN', label: '中文', short: '中', rtl: false },
    { code: 'en', label: 'English', short: '英', rtl: false },
    { code: 'ja', label: '日本語', short: '日', rtl: false },
    { code: 'ko', label: '한국어', short: '韩', rtl: false },
    { code: 'es', label: 'Español', short: '西', rtl: false },
    { code: 'fr', label: 'Français', short: '法', rtl: false },
    { code: 'de', label: 'Deutsch', short: '德', rtl: false },
    { code: 'it', label: 'Italiano', short: '意', rtl: false },
    { code: 'pt', label: 'Português', short: '葡', rtl: false },
    { code: 'ru', label: 'Русский', short: '俄', rtl: false },
    { code: 'ar', label: 'العربية', short: '阿', rtl: true },
    { code: 'hi', label: 'हिन्दी', short: '印地', rtl: false },
    { code: 'id', label: 'Indonesia', short: '印尼', rtl: false },
    { code: 'vi', label: 'Tiếng Việt', short: '越南', rtl: false },
    { code: 'th', label: 'ไทย', short: '泰', rtl: false },
    { code: 'tr', label: 'Türkçe', short: '土', rtl: false }
  ];
  var translateCache = {};

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
  function setCheckboxState(checkbox, checked) {
    if (!checkbox) return;
    checkbox.classList.toggle('checkbox--checked', checked);
    var icon = checkbox.querySelector('.checkbox__icon');
    if (checked && !icon) {
      icon = document.createElement('div');
      icon.className = 'checkbox__icon';
      icon.innerHTML = '<img class="checkbox__asset" src="./lib/assets/icons/checkbox-check.svg" alt="">';
      checkbox.appendChild(icon);
    } else if (!checked && icon) {
      icon.remove();
    }
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
  function formatDate(date) {
    var d = date || new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function defaultQuoteTitle() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return '报价单 ' + formatDate(d) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function moneyNumber(value) {
    var n = Number(String(value == null ? '' : value).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }
  function formatMoney(value) {
    var n = moneyNumber(value);
    return n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function formatUsd(value) {
    var n = moneyNumber(value) / CNY_TO_USD;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function getLanguage(code) {
    return LANGUAGE_OPTIONS.filter(function (item) { return item.code === code; })[0] || LANGUAGE_OPTIONS[0];
  }
  function languageMenuHtml(currentCode) {
    return '<div class="popmenu__list">' + LANGUAGE_OPTIONS.map(function (lang) {
      var selected = lang.code === currentCode;
      return '<div class="popmenu__item' + (selected ? ' popmenu__item--selected' : '') + '" data-role="quote-language-option" data-lang="' + escapeHtml(lang.code) + '" role="option" aria-selected="' + (selected ? 'true' : 'false') + '">'
        + '<span class="popmenu__item-text">' + escapeHtml(lang.short + ' · ' + lang.label) + '</span>'
        + '<i class="wego-iconfont-s icon-gou-jiacu popmenu__item-check"></i>'
        + '</div>';
    }).join('') + '</div>';
  }
  function normalizePriceValue(value) {
    var normalized = String(value == null ? '' : value).replace(/[^\d.]/g, '');
    var pieces = normalized.split('.');
    if (pieces.length > 1) normalized = pieces.shift() + '.' + pieces.join('');
    return normalized;
  }
  function quoteTotals(rows) {
    var min = 0;
    var max = 0;
    var hasRange = false;
    rows.forEach(function (row) {
      var low = moneyNumber(row.priceMin);
      var high = moneyNumber(row.priceMax);
      min += low;
      max += high || low;
      if (high && high !== low) hasRange = true;
    });
    return { cny: hasRange ? '¥' + formatMoney(min) + ' ~ ¥' + formatMoney(max) : '¥' + formatMoney(min), usd: hasRange ? '$' + formatUsd(min) + ' ~ $' + formatUsd(max) : '$' + formatUsd(min) };
  }
  function quotePreviewTemplate(state) {
    var lang = getLanguage(state.language);
    var totals = quoteTotals(state.quoteRows);
    return '<div class="modal modal--fullscreen quote-preview-modal" data-component-slug="modal" data-state="open" role="dialog" aria-modal="true" aria-label="报价单预览" style="--modal-panel-bg: var(--bg-page)">'
      + '<div class="modal__panel">'
      + '<div class="modal__title modal__title--default">'
      + '<nav class="navbar" data-component-slug="navbar"><div class="navbar__body">'
      + '<div class="navbar__left"><button type="button" class="navbar__left-btn navbar__left-btn--circle" data-dom-id="quote-preview-back" aria-label="返回"><i class="wego-iconfont-s icon-zuojiantou16" aria-hidden="true"></i></button></div>'
      + '<div class="navbar__center"><span class="navbar__title">报价单预览</span></div>'
      + '<div class="navbar__right"><button type="button" class="btn btn--weak btn--sm" data-component-slug="button" data-dom-id="quote-preview-save">保存</button></div>'
      + '</div></nav>'
      + '</div>'
      + '<div class="modal__body quote-preview-body">'
      + '<div class="layout-scroll quote-preview-scroll" data-component-slug="layout-scroll" data-role="quote-preview-scroll">'
      + '<section class="quote-preview-summary">'
      + '<div class="quote-preview-summary__top"><div><div class="quote-preview-dir">默认目录</div><div class="quote-preview-date">' + escapeHtml(formatDate(new Date(state.createdAt))) + '</div></div>'
      + '<div class="quote-preview-total" data-role="quote-total"><strong>' + escapeHtml(totals.cny) + '</strong><span>' + escapeHtml(totals.usd) + '</span></div></div>'
      + '<div class="quote-preview-title input-group input-group--surface-white" data-component-slug="input"><label class="field-label" for="quote-title-input">标题</label><div class="input-wrapper"><input id="quote-title-input" data-dom-id="quote-title-input" type="text" value="' + escapeHtml(state.title) + '"></div></div>'
      + '<div class="quote-preview-language"><button type="button" class="quote-language-button" data-dom-id="quote-language-button" aria-haspopup="listbox" aria-expanded="false"><span data-role="quote-language-label">' + escapeHtml(lang.short + ' · ' + lang.label) + '</span><i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i></button>'
      + '<div class="popmenu popmenu--select quote-language-menu" data-component-slug="popmenu" data-role="quote-language-menu" role="listbox" data-state="closed" hidden>' + languageMenuHtml(state.language) + '</div></div>'
      + '<div class="quote-translate-status" data-role="quote-translate-status" hidden><span data-role="quote-translate-text">正在翻译中 0/0</span><button type="button" class="link link--14" data-component-slug="link" data-dom-id="quote-translate-cancel">取消</button></div>'
      + '</section>'
      + '<section class="quote-preview-toolbar"><button type="button" class="btn btn--weak btn--md quote-add-more" data-component-slug="button" data-dom-id="quote-add-more"><i class="btn__icon wego-iconfont-s icon-jiahao" aria-hidden="true"></i>继续添加产品</button></section>'
      + '<section class="quote-table-shell" data-role="quote-table-shell">' + quoteTableHtml(state.quoteRows) + '</section>'
      + '</div>'
      + '</div>'
      + '<div class="modal__actions quote-preview-actions"><div class="modal__action-gradient"></div><div class="quote-share-format" role="tablist" aria-label="导出格式"><button type="button" class="quote-format-tab is-active" data-format="excel" aria-selected="true">Excel</button><button type="button" class="quote-format-tab" data-format="pdf" aria-selected="false">PDF</button></div><button type="button" class="btn btn--strong btn--lg quote-share-button" data-component-slug="button" data-dom-id="quote-share-main">分享报价单</button></div>'
      + '</div>'
      + '</div>';
  }
  function quoteTableHtml(rows) {
    if (!rows.length) {
      return '<div class="quote-table-empty"><strong>暂无报价商品</strong><span>可继续添加产品生成报价行</span></div>';
    }
    return '<div class="quote-table-scroll"><table class="quote-table"><thead><tr>'
      + '<th class="quote-table__image">图</th><th class="quote-table__price">价格 <button type="button" class="link link--14 quote-price-batch" data-component-slug="link" data-dom-id="quote-batch-price">批量</button></th><th>规格</th><th>货号</th><th>商品名</th><th class="quote-table__action">操作</th>'
      + '</tr></thead><tbody>' + rows.map(quoteTableRowHtml).join('') + '</tbody></table></div>';
  }
  function quoteTableRowHtml(row) {
    return '<tr data-quote-row-id="' + escapeHtml(row.id) + '">'
      + '<td class="quote-table__image"><div class="wg-image wg-image--rounded-sm quote-row-image" data-component-slug="image"><img class="wg-image__src" src="' + escapeHtml(row.image) + '" alt="' + escapeHtml(row.name) + '"></div></td>'
      + '<td class="quote-table__price"><div class="quote-price-inputs"><div class="number-input number-input--surface-white" data-component-slug="input"><input class="number-input__field" inputmode="decimal" data-quote-field="priceMin" value="' + escapeHtml(row.priceMin) + '" aria-label="最低价格"><span class="number-input__suffix">¥</span></div><span class="quote-price-separator">~</span><div class="number-input number-input--surface-white" data-component-slug="input"><input class="number-input__field" inputmode="decimal" data-quote-field="priceMax" value="' + escapeHtml(row.priceMax) + '" aria-label="最高价格"><span class="number-input__suffix">¥</span></div></div><div class="quote-usd-text">$' + escapeHtml(formatUsd(row.priceMax || row.priceMin)) + '</div></td>'
      + '<td><div class="input-group input-group--surface-white quote-cell-field" data-component-slug="input"><label class="field-label" for="quote-spec-' + escapeHtml(row.id) + '">规格</label><textarea id="quote-spec-' + escapeHtml(row.id) + '" rows="2" data-quote-field="specification">' + escapeHtml(row.specification) + '</textarea></div></td>'
      + '<td><div class="input-group input-group--surface-white quote-cell-field quote-cell-field--short" data-component-slug="input"><label class="field-label" for="quote-no-' + escapeHtml(row.id) + '">货号</label><div class="input-wrapper"><input id="quote-no-' + escapeHtml(row.id) + '" type="text" data-quote-field="itemNo" value="' + escapeHtml(row.itemNo) + '"></div></div></td>'
      + '<td><div class="input-group input-group--surface-white quote-cell-field" data-component-slug="input"><label class="field-label" for="quote-name-' + escapeHtml(row.id) + '">商品名</label><textarea id="quote-name-' + escapeHtml(row.id) + '" rows="2" data-quote-field="name">' + escapeHtml(row.name) + '</textarea></div></td>'
      + '<td class="quote-table__action"><button type="button" class="btn btn--weak btn--sm btn--icon-only" data-component-slug="button" data-dom-id="quote-row-delete-' + escapeHtml(row.id) + '" data-quote-delete-row="' + escapeHtml(row.id) + '" aria-label="删除报价行"><i class="btn__icon wego-iconfont-s icon-shanchu" aria-hidden="true"></i></button></td>'
      + '</tr>';
  }

  window.WegoApp.registerScene({
    routeId: 'quote-export',
    template: quoteSelectTemplate,
    presentation: { type: 'push', transition: 'slide-left', coversTabBar: true },
    init: function init(ctx) {
      var root = ctx.root;
      var destroyed = false;
      var savedSelectMode = safeReadJSON(STORAGE_KEYS.mode, 'product');
      var state = {
        selectMode: savedSelectMode === 'image' ? 'image' : 'product',
        view: 'list',
        query: '',
        page: 1,
        hasMore: true,
        loading: false,
        batchSelectValue: DEFAULT_BATCH_SELECT_VALUE,
        appendMode: false,
        title: defaultQuoteTitle(),
        createdAt: Date.now(),
        language: 'zh-CN',
        exportFormat: 'excel',
        quoteRows: [],
        dirty: false,
        translateRunId: 0,
        selected: {}          /* 按产品模式：{ product_id: true }；按图模式：{ product_id + ':' + idx: true } */
      };
      var listEl = root.querySelector('[data-role="quote-list"]');
      var scrollEl = root.querySelector('[data-role="quote-scroll"]');
      var emptyEl = root.querySelector('[data-role="quote-empty"]');
      var loadingEl = root.querySelector('[data-role="quote-list-loading"]');
      var searchInput = root.querySelector('[data-dom-id="quote-search-input"]');
      var searchClear = root.querySelector('[data-dom-id="quote-search-clear"]');
      var countLabel = root.querySelector('[data-role="quote-count-label"]');
      var nextBtn = root.querySelector('[data-dom-id="quote-open-preview"]');
      var selectAllBtn = root.querySelector('[data-dom-id="quote-select-all"]');
      var modeButton = root.querySelector('[data-dom-id="quote-mode-button"]');
      var modeMenu = root.querySelector('[data-role="quote-mode-menu"]');
      var countDropdown = root.querySelector('[data-dom-id="quote-count-dropdown"]');
      var countMenu = root.querySelector('[data-role="quote-count-menu"]');
      var guideBubble = root.querySelector('[data-role="quote-guide-bubble"]');
      var toolbarEl = root.querySelector('.quote-search-toolbar');
      var toolbarWrap = root.querySelector('.quote-select-toolbar');
      var viewSelectedBtn = root.querySelector('[data-dom-id="quote-view-selected"]');
      var viewSelectedDivider = root.querySelector('.quote-batch-divider');

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
      function highlightSearchMatch(value) {
        var text = String(value == null ? '' : value);
        var query = state.query.trim();
        var index = text.toLowerCase().indexOf(query.toLowerCase());
        if (!query || index < 0) return escapeHtml(text);
        return escapeHtml(text.slice(0, index))
          + '<mark class="quote-search-highlight">' + escapeHtml(text.slice(index, index + query.length)) + '</mark>'
          + escapeHtml(text.slice(index + query.length));
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
      function syncToggleSelection(toggle, mode, p, idx) {
        setCheckboxState(toggle.querySelector('[data-role="quote-check"]'), isSelected(mode, p, idx));
        updateBar();
      }
      function syncImageGroupSelection(group, product) {
        if (!group) return;
        var images = productImages(product);
        var selected = 0;
        images.forEach(function (_, idx) {
          if (isSelected('image', product, idx)) selected++;
        });
        setCheckboxState(group.querySelector('[data-quote-toggle-group] [data-role="quote-check"]'), selected === images.length && images.length > 0);
        var summary = group.querySelector('.quote-image-group__summary');
        if (summary) summary.textContent = '已选 ' + selected + '/' + images.length;
        Array.prototype.forEach.call(group.querySelectorAll('[data-quote-toggle][data-mode="image"]'), function (cell) {
          var idx = cell.getAttribute('data-idx') ? Number(cell.getAttribute('data-idx')) : 0;
          setCheckboxState(cell.querySelector('[data-role="quote-check"]'), isSelected('image', product, idx));
        });
        updateBar();
      }
      function syncVisibleSelectionStates() {
        if (state.selectMode === 'image') {
          Array.prototype.forEach.call(listEl.querySelectorAll('.quote-image-group'), function (group) {
            var pid = group.getAttribute('data-group-id');
            var product = PRODUCTS.filter(function (x) { return x.product_id === pid; })[0];
            if (product) syncImageGroupSelection(group, product);
          });
          return;
        }
        Array.prototype.forEach.call(listEl.querySelectorAll('[data-quote-toggle][data-mode="product"]'), function (toggle) {
          var pid = toggle.getAttribute('data-id');
          var product = PRODUCTS.filter(function (x) { return x.product_id === pid; })[0];
          if (product) setCheckboxState(toggle.querySelector('[data-role="quote-check"]'), isSelected('product', product, 0));
        });
        updateBar();
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
      function batchSelectLimit(value) {
        var normalized = BATCH_SELECT_VALUES.indexOf(String(value)) >= 0 ? String(value) : DEFAULT_BATCH_SELECT_VALUE;
        return Number(normalized);
      }
      function batchSelectableRows() {
        var rows = [];
        currentList().forEach(function (p) {
          if (state.selectMode === 'image') {
            productImages(p).forEach(function (_, idx) {
              rows.push({ p: p, key: selectionKey('image', p, idx) });
            });
          } else {
            rows.push({ p: p, key: selectionKey('product', p, 0) });
          }
        });
        return rows.slice(0, batchSelectLimit(state.batchSelectValue));
      }
      function batchSelectionState() {
        var rows = batchSelectableRows();
        var selected = rows.filter(function (row) { return state.selected[row.key]; }).length;
        return {
          target: batchSelectLimit(state.batchSelectValue),
          available: rows.length,
          selected: selected,
          complete: rows.length > 0 && selected === rows.length
        };
      }
      function selectedRows(mode) {
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
        return rows;
      }
      function selectedItemsHtml(rows) {
        return rows.map(function (row) {
          return '<div class="cell cell--double cell--bg-white quote-selected-item" data-component-slug="cell">'
            + '<div class="cell__body">'
            + '<div class="wg-image wg-image--md wg-image--rounded-sm quote-selected-item__img" data-component-slug="image"><img class="wg-image__src" src="' + escapeHtml(row.img) + '" alt="' + escapeHtml(row.p.title) + '"></div>'
            + '<div class="cell__content quote-selected-item__info"><div class="cell__title-row"><span class="cell__title quote-selected-item__title">' + row.label + '</span></div><div class="cell__subtitle quote-selected-item__meta">' + escapeHtml(row.p.item_no) + '</div></div>'
            + '<div class="cell__action"><button type="button" class="btn btn--weak btn--sm btn--icon-only quote-selected-item__remove" data-component-slug="button" data-remove-selected data-key="' + escapeHtml(row.key) + '" aria-label="移除"><i class="btn__icon wego-iconfont-s icon-shanchu" aria-hidden="true"></i></button></div>'
            + '</div>'
            + '</div>';
        }).join('') || '<div class="quote-selected-empty">暂无可展示的已选商品</div>';
      }
      function quoteRowFromSelection(row) {
        var p = row.p;
        var sourceParts = row.key.split(':');
        var imageIndex = sourceParts.length > 1 ? Number(sourceParts[1]) : 0;
        return {
          id: row.key.replace(/[^a-zA-Z0-9_-]/g, '-') + '-' + state.quoteRows.length,
          sourceKey: row.key,
          productId: p.product_id,
          imageIndex: imageIndex,
          image: row.img,
          priceMin: String(p.price || ''),
          priceMax: '',
          originalName: p.title || '',
          originalSpec: p.specification || '',
          name: p.title || '',
          specification: p.specification || '',
          itemNo: p.item_no || ''
        };
      }
      function appendSelectedQuoteRows() {
        var existing = {};
        state.quoteRows.forEach(function (row) { existing[row.sourceKey] = true; });
        selectedRows(state.selectMode).forEach(function (row) {
          if (!existing[row.key]) {
            state.quoteRows.push(quoteRowFromSelection(row));
            existing[row.key] = true;
          }
        });
      }
      function setAppendMode(enabled) {
        state.appendMode = Boolean(enabled);
        nextBtn.textContent = state.appendMode ? '确定' : '下一步';
        nextBtn.setAttribute('aria-label', state.appendMode ? '确定追加产品' : (selectedCount() === 0 ? '下一步，请先选择要导出的产品' : '下一步'));
      }

      function productRowHtml(p) {
        var img = productImages(p)[0];
        return '<div class="cell cell--double cell--bg-white quote-product-row" data-component-slug="cell" data-quote-toggle data-mode="product" data-id="' + escapeHtml(p.product_id) + '">'
          + '<div class="cell__select quote-product-row__select">' + checkboxHtml(isSelected('product', p, 0), ' data-role="quote-check"') + '</div>'
          + '<div class="cell__body">'
          + '<div class="wg-image wg-image--rounded-sm quote-product-row__img" data-component-slug="image"><img class="wg-image__src" src="' + escapeHtml(img) + '" alt="' + escapeHtml(p.title) + '" loading="lazy"></div>'
          + '<div class="cell__content quote-product-row__info">'
          + '<div class="cell__title-row quote-product-row__copy">'
          + '<span class="cell__title quote-product-row__title"><span class="quote-row__no">' + highlightSearchMatch(p.item_no) + '</span><span class="quote-row__divider">|</span><span class="quote-row__name">' + highlightSearchMatch(p.title) + '</span></span>'
          + '</div>'
          + (p.specification ? '<div class="cell__subtitle quote-product-row__spec">' + escapeHtml(p.specification) + '</div>' : '')
          + '<div class="quote-product-row__price">' + metricHtml(p.price, '16') + '</div>'
          + '</div>'
          + '</div>'
          + '</div>';
      }
      function productGridCardHtml(p) {
        var img = productImages(p)[0];
        return '<div class="card card--surface card--vertical quote-product-grid-card" data-component-slug="card" data-quote-toggle data-mode="product" data-id="' + escapeHtml(p.product_id) + '">'
          + '<div class="quote-product-grid-card__select dark">' + checkboxHtml(isSelected('product', p, 0), ' data-role="quote-check"') + '</div>'
          + '<div class="wg-image wg-image--rounded-sm quote-product-grid-card__img" data-component-slug="image"><img class="wg-image__src" src="' + escapeHtml(img) + '" alt="' + escapeHtml(p.title) + '" loading="lazy"></div>'
          + '<div class="quote-product-grid-card__info"><h3 class="quote-product-grid-card__title"><span class="quote-row__no">' + highlightSearchMatch(p.item_no) + '</span><span class="quote-row__divider">|</span><span class="quote-row__name">' + highlightSearchMatch(p.title) + '</span></h3>'
          + (p.specification ? '<div class="quote-product-grid-card__spec">' + escapeHtml(p.specification) + '</div>' : '')
          + '<div class="quote-product-grid-card__price">' + metricHtml(p.price, '16') + '</div></div>'
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
          + '<div class="quote-image-group__title"><span class="quote-row__no">' + highlightSearchMatch(p.item_no) + '</span><span class="quote-row__divider">|</span><span class="quote-row__name">' + highlightSearchMatch(p.title) + '</span></div>'
          + '<div class="quote-image-group__summary">已选 ' + groupSel + '/' + images.length + '</div>'
          + '</div>'
          + '<div class="quote-image-group__grid">'
          + images.map(function (img, idx) {
              return '<div class="quote-image-cell" data-quote-toggle data-mode="image" data-id="' + escapeHtml(p.product_id) + '" data-idx="' + idx + '">'
                + '<div class="wg-image wg-image--rounded-sm quote-image-cell__img" data-component-slug="image"><img class="wg-image__src" src="' + escapeHtml(img) + '" alt="' + escapeHtml(p.title + '图' + (idx + 1)) + '" loading="lazy"></div>'
                + '<div class="quote-image-cell__select dark">' + checkboxHtml(isSelected('image', p, idx), ' data-role="quote-check"') + '</div>'
                + '</div>';
            }).join('')
          + '</div></section>';
      }

      function renderList() {
        var list = currentList();
        var pageItems = list.slice(0, state.page * PAGE_SIZE);
        state.hasMore = pageItems.length < list.length;
        var noResult = list.length === 0 && state.query.trim() !== '';
        var initialEmpty = PRODUCTS.length === 0 && state.query.trim() === '';
        if (toolbarWrap) toolbarWrap.hidden = initialEmpty;
        if (toolbarEl) toolbarEl.hidden = false;
        var html = '';
        if (state.selectMode === 'image') {
          html = '<div class="quote-image-groups">' + pageItems.map(imageGroupHtml).join('') + '</div>';
        } else if (state.view === 'grid') {
          html = '<div class="layout-grid quote-product-grid" data-component-slug="layout-grid" data-columns="3" data-align="stretch">' + pageItems.map(productGridCardHtml).join('') + '</div>';
        } else {
          html = '<div class="layout-flow quote-product-list" data-component-slug="layout-flow" data-direction="vertical" data-align="stretch">' + pageItems.map(productRowHtml).join('') + '</div>';
        }
        listEl.innerHTML = html;
        updateProductGridColumns();
        activateImages(listEl);
        emptyEl.hidden = list.length !== 0;
        emptyEl.innerHTML = list.length === 0
          ? (noResult
              ? '<div class="quote-empty__result"><div class="result" data-component-slug="result" role="group" aria-label="无搜索结果"><div class="result__title">未搜索到相关商品</div></div></div>'
              : '<div class="card card--filled quote-empty__card" data-component-slug="card"><i class="wego-iconfont-s icon-sousuo" aria-hidden="true"></i><strong>暂无商品</strong><span>商品库暂无可选商品</span></div>')
          : '';
        updateBar();
      }

      function updateProductGridColumns() {
        var grid = root.querySelector('.quote-product-grid');
        if (!grid) return;
        grid.setAttribute('data-columns', grid.getBoundingClientRect().width >= 520 ? '4' : '3');
      }

      function updateBar() {
        var count = selectedCount();
        var batchState = batchSelectionState();
        countLabel.textContent = count + '/' + state.batchSelectValue;
        nextBtn.classList.toggle('btn--disabled', count === 0);
        if (count === 0) nextBtn.setAttribute('aria-disabled', 'true');
        else nextBtn.removeAttribute('aria-disabled');
        nextBtn.textContent = state.appendMode ? '确定' : '下一步';
        nextBtn.setAttribute('aria-label', state.appendMode ? '确定追加产品' : (count === 0 ? '下一步，请先选择要导出的产品' : '下一步'));
        viewSelectedBtn.disabled = count === 0;
        viewSelectedBtn.hidden = count === 0;
        viewSelectedBtn.classList.toggle('is-disabled', count === 0);
        if (viewSelectedDivider) viewSelectedDivider.hidden = count === 0;
        var allChecked = batchState.complete;
        setCheckboxState(selectAllBtn.querySelector('[data-role="quote-check"]'), allChecked);
        selectAllBtn.setAttribute('aria-pressed', allChecked ? 'true' : 'false');
        selectAllBtn.querySelector('.bottom-action-bar__checkbox-field').setAttribute('aria-checked', allChecked ? 'true' : 'false');
      }

      function toggleBatchSelection() {
        var rows = batchSelectableRows();
        if (!rows.length) {
          closeAllMenus();
          renderList();
          return;
        }
        var batchState = batchSelectionState();
        rows.forEach(function (row) {
          if (batchState.complete) delete state.selected[row.key];
          else state.selected[row.key] = true;
        });
        closeAllMenus();
        syncVisibleSelectionStates();
      }

      function setBatchSelectValue(value) {
        var next = BATCH_SELECT_VALUES.indexOf(String(value)) >= 0 ? String(value) : DEFAULT_BATCH_SELECT_VALUE;
        var before = batchSelectionState();
        state.batchSelectValue = next;
        syncBatchMenuSelection();
        closeAllMenus();
        if (before.complete) {
          state.selected = {};
          batchSelectableRows().forEach(function (row) { state.selected[row.key] = true; });
        }
        renderList();
      }

      function clearSelection() {
        state.selected = {};
        renderList();
      }

      function openSelectedSheet() {
        if (selectedCount() === 0) return;
        var mode = state.selectMode;
        var itemsHtml = selectedItemsHtml(selectedRows(mode));
        var html = '<div class="modal modal--frame-x quote-selected-modal" data-component-slug="modal" role="dialog" aria-modal="true" aria-labelledby="quote-selected-title" data-state="open">'
          + '<div class="modal__panel">'
          + '<div class="modal__title modal__title--default">'
          + '<nav class="navbar" data-component-slug="navbar"><div class="navbar__body"><div class="navbar__left"><button type="button" class="navbar__left-btn navbar__left-btn--circle" data-dom-id="quote-selected-close" data-close-selected-sheet aria-label="收起"><i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i></button></div><div class="navbar__center"><span class="navbar__title" id="quote-selected-title">已选产品</span></div><div class="navbar__right"></div></div></nav>'
          + '</div>'
          + '<div class="modal__body modal__body--safe-bottom quote-selected-list">' + (itemsHtml || '<div class="quote-selected-empty">暂无可展示的已选商品</div>') + '</div>'
          + '</div>'
          + '</div>';
        ctx.openSheet(html, {
          label: '查看已选',
          init: function (sheetCtx) {
            var sheetRoot = sheetCtx.root;
            function refreshSelectedModal() {
              var list = sheetRoot.querySelector('.quote-selected-list');
              if (list) list.innerHTML = selectedItemsHtml(selectedRows(mode));
              activateImages(sheetRoot);
              Array.prototype.forEach.call(sheetRoot.querySelectorAll('[data-remove-selected]'), function (btn) {
                btn.addEventListener('click', function () {
                  var key = btn.getAttribute('data-key');
                  if (key && state.selected[key]) delete state.selected[key];
                  renderList();
                  refreshSelectedModal();
                });
              });
            }
            refreshSelectedModal();
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

      function syncModeMenuSelection() {
        Array.prototype.forEach.call(root.querySelectorAll('[data-role="quote-mode-option"]'), function (opt) {
          var selected = opt.getAttribute('data-mode') === state.selectMode;
          opt.classList.toggle('popmenu__item--selected', selected);
          opt.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
      }
      function syncBatchMenuSelection() {
        Array.prototype.forEach.call(root.querySelectorAll('[data-role="quote-batch-option"]'), function (opt) {
          var selected = opt.getAttribute('data-value') === state.batchSelectValue;
          opt.classList.toggle('popmenu__item--selected', selected);
          opt.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
      }

      function switchMode(mode) {
        if (mode !== 'product' && mode !== 'image') return;
        state.selectMode = mode;
        state.page = 1;
        state.selected = {};   /* 模式切换后重置已选（两种模式选择单位不同） */
        safeWriteJSON(STORAGE_KEYS.mode, mode);
        root.querySelector('[data-role="quote-mode-label"]').textContent = mode === 'image' ? '按图报价' : '按产品报价';
        syncModeMenuSelection();
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
        icon.className = 'search-toolbar__action-icon wego-iconfont-s ' + (view === 'grid' ? 'icon-sanlie' : 'icon-liebiao');
        label.textContent = view === 'grid' ? '卡片' : '列表';
        renderList();
      }

      function onViewportResize() {
        updateProductGridColumns();
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
          guideBubble.setAttribute('data-state', 'open');
          safeWriteJSON(STORAGE_KEYS.guide, true);
          window.setTimeout(function () {
            if (destroyed) return;
            guideBubble.setAttribute('data-state', 'closed');
            guideBubble.hidden = true;
          }, 4000);
        }
      }
      function findQuoteRow(id) {
        return state.quoteRows.filter(function (row) { return row.id === id; })[0];
      }
      function updatePreviewTotals(previewRoot) {
        var totalEl = previewRoot.querySelector('[data-role="quote-total"]');
        if (!totalEl) return;
        var totals = quoteTotals(state.quoteRows);
        totalEl.innerHTML = '<strong>' + escapeHtml(totals.cny) + '</strong><span>' + escapeHtml(totals.usd) + '</span>';
      }
      function refreshPreviewTable(previewRoot) {
        var shell = previewRoot.querySelector('[data-role="quote-table-shell"]');
        if (!shell) return;
        shell.innerHTML = quoteTableHtml(state.quoteRows);
        activateImages(shell);
        updatePreviewTotals(previewRoot);
        bindPreviewTableControls(previewRoot);
      }
      function bindPreviewTableControls(previewRoot) {
        var batch = previewRoot.querySelector('[data-dom-id="quote-batch-price"]');
        if (batch) {
          batch.addEventListener('click', function (e) {
            e.stopPropagation();
            openBatchPriceSheet(previewRoot);
          });
        }
        Array.prototype.forEach.call(previewRoot.querySelectorAll('[data-quote-delete-row]'), function (btn) {
          btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var id = btn.getAttribute('data-quote-delete-row');
            state.quoteRows = state.quoteRows.filter(function (row) { return row.id !== id; });
            state.dirty = true;
            refreshPreviewTable(previewRoot);
          });
        });
      }
      function syncLanguageMenu(previewRoot) {
        var lang = getLanguage(state.language);
        var label = previewRoot.querySelector('[data-role="quote-language-label"]');
        if (label) label.textContent = lang.short + ' · ' + lang.label;
        Array.prototype.forEach.call(previewRoot.querySelectorAll('[data-role="quote-language-option"]'), function (opt) {
          var selected = opt.getAttribute('data-lang') === state.language;
          opt.classList.toggle('popmenu__item--selected', selected);
          opt.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
        var scroll = previewRoot.querySelector('[data-role="quote-preview-scroll"]');
        if (scroll) scroll.setAttribute('dir', lang.rtl ? 'rtl' : 'ltr');
      }
      function setTranslateStatus(previewRoot, visible, text) {
        var status = previewRoot.querySelector('[data-role="quote-translate-status"]');
        var label = previewRoot.querySelector('[data-role="quote-translate-text"]');
        if (!status || !label) return;
        status.hidden = !visible;
        if (text) label.textContent = text;
      }
      function translateText(text, targetLang) {
        var source = String(text || '');
        if (!source || targetLang === 'zh-CN') return Promise.resolve(source);
        var key = targetLang + '|' + source;
        if (translateCache[key]) return Promise.resolve(translateCache[key]);
        var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(source);
        return fetch(url).then(function (res) {
          if (!res.ok) throw new Error('translate failed');
          return res.json();
        }).then(function (data) {
          var translated = data && data[0] ? data[0].map(function (part) { return part[0]; }).join('') : source;
          translateCache[key] = translated || source;
          return translateCache[key];
        }).catch(function () { return source; });
      }
      function applyLanguage(previewRoot, code) {
        state.language = code;
        state.translateRunId += 1;
        var runId = state.translateRunId;
        syncLanguageMenu(previewRoot);
        if (code === 'zh-CN') {
          state.quoteRows.forEach(function (row) {
            row.name = row.originalName;
            row.specification = row.originalSpec;
          });
          refreshPreviewTable(previewRoot);
          setTranslateStatus(previewRoot, false, '');
          return;
        }
        var work = [];
        state.quoteRows.forEach(function (row) {
          work.push({ row: row, field: 'name', text: row.originalName });
          work.push({ row: row, field: 'specification', text: row.originalSpec });
        });
        if (!work.length) return;
        setTranslateStatus(previewRoot, true, '正在翻译中 0/' + work.length);
        var done = 0;
        work.reduce(function (chain, item) {
          return chain.then(function () {
            if (runId !== state.translateRunId) return null;
            return translateText(item.text, code).then(function (translated) {
              if (runId !== state.translateRunId) return;
              item.row[item.field] = translated;
              done += 1;
              setTranslateStatus(previewRoot, true, '正在翻译中 ' + done + '/' + work.length);
              refreshPreviewTable(previewRoot);
            });
          });
        }, Promise.resolve()).then(function () {
          if (runId === state.translateRunId) setTranslateStatus(previewRoot, false, '');
        });
      }
      function openBatchPriceSheet(previewRoot) {
        var template = '<div class="modal modal--frame modal--align-left quote-batch-price-modal" data-component-slug="modal" role="dialog" aria-modal="true" data-state="open" aria-labelledby="quote-batch-price-title">'
          + '<div class="modal__panel">'
          + '<div class="modal__title modal__title--info"><div class="modal__title-text" id="quote-batch-price-title">批量改价</div><div class="modal__subtitle">统一改动当前报价表的价格</div></div>'
          + '<div class="modal__body quote-batch-price-body"><div class="input-group input-group--surface-white" data-component-slug="input"><label class="field-label" for="quote-batch-price-value">统一价格</label><div class="input-wrapper"><input id="quote-batch-price-value" type="text" inputmode="decimal" data-dom-id="quote-batch-price-value" placeholder="输入价格"></div></div></div>'
          + '<div class="modal__actions"><div class="modal__action-gradient"></div><div class="modal__buttons"><button type="button" class="btn btn--weak btn--lg" data-component-slug="button" data-dom-id="quote-batch-price-cancel">取消</button><button type="button" class="btn btn--strong btn--lg" data-component-slug="button" data-dom-id="quote-batch-price-confirm">确定</button></div></div>'
          + '</div></div>';
        ctx.openSheet(template, {
          label: '批量改价',
          init: function (sheetCtx) {
            var input = sheetCtx.root.querySelector('[data-dom-id="quote-batch-price-value"]');
            var cancel = sheetCtx.root.querySelector('[data-dom-id="quote-batch-price-cancel"]');
            var confirm = sheetCtx.root.querySelector('[data-dom-id="quote-batch-price-confirm"]');
            input.addEventListener('input', function () { input.value = normalizePriceValue(input.value); });
            cancel.addEventListener('click', function () { sheetCtx.close(); });
            confirm.addEventListener('click', function () {
              var value = normalizePriceValue(input.value);
              if (!value) {
                sheetCtx.toast('请输入价格');
                return;
              }
              state.quoteRows.forEach(function (row) {
                row.priceMin = value;
                row.priceMax = '';
              });
              state.dirty = true;
              refreshPreviewTable(previewRoot);
              sheetCtx.close();
            });
          }
        });
      }
      function openFilterPlaceholder() {
        var template = '<div class="modal modal--frame quote-filter-placeholder" data-component-slug="modal" role="dialog" aria-modal="true" data-state="open" aria-labelledby="quote-filter-placeholder-title">'
          + '<div class="modal__panel">'
          + '<div class="modal__title modal__title--info"><div class="modal__title-text" id="quote-filter-placeholder-title">筛选</div><div class="modal__subtitle">筛选面板将在后续阶段接入</div></div>'
          + '<div class="modal__actions"><div class="modal__action-gradient"></div><div class="modal__buttons"><button type="button" class="btn btn--strong btn--lg" data-component-slug="button" data-dom-id="quote-filter-cancel">知道了</button></div></div>'
          + '</div></div>';
        ctx.openSheet(template, {
          label: '筛选',
          init: function (sheetCtx) {
            var cancel = sheetCtx.root.querySelector('[data-dom-id="quote-filter-cancel"]');
            if (cancel) cancel.addEventListener('click', function () { sheetCtx.close(); });
          }
        });
      }
      function bindPreview(previewCtx) {
        var previewRoot = previewCtx.root;
        var languageButton = previewRoot.querySelector('[data-dom-id="quote-language-button"]');
        var languageMenu = previewRoot.querySelector('[data-role="quote-language-menu"]');
        var titleInput = previewRoot.querySelector('[data-dom-id="quote-title-input"]');
        activateImages(previewRoot);
        syncLanguageMenu(previewRoot);
        bindPreviewTableControls(previewRoot);
        titleInput.addEventListener('input', function () {
          state.title = titleInput.value;
          state.dirty = true;
        });
        previewRoot.querySelector('[data-dom-id="quote-preview-back"]').addEventListener('click', function () {
          state.appendMode = false;
          setAppendMode(false);
          previewCtx.close();
        });
        previewRoot.querySelector('[data-dom-id="quote-preview-save"]').addEventListener('click', function () {
          state.dirty = false;
          previewCtx.toast('已保存当前报价单');
        });
        previewRoot.querySelector('[data-dom-id="quote-add-more"]').addEventListener('click', function () {
          setAppendMode(true);
          previewCtx.close();
          ctx.toast('继续选择要追加的产品');
        });
        previewRoot.querySelector('[data-dom-id="quote-share-main"]').addEventListener('click', function () {
          ctx.toast('分享导出将在后续阶段接入');
        });
        languageButton.addEventListener('click', function () {
          var open = languageMenu.hidden;
          languageMenu.hidden = !open;
          languageMenu.setAttribute('data-state', open ? 'open' : 'closed');
          languageButton.setAttribute('aria-expanded', open ? 'true' : 'false');
          languageButton.classList.toggle('is-open', open);
        });
        previewRoot.addEventListener('click', function (e) {
          var langOpt = e.target.closest('[data-role="quote-language-option"]');
          if (langOpt) {
            languageMenu.hidden = true;
            languageMenu.setAttribute('data-state', 'closed');
            languageButton.setAttribute('aria-expanded', 'false');
            languageButton.classList.remove('is-open');
            applyLanguage(previewRoot, langOpt.getAttribute('data-lang'));
            return;
          }
          var formatTab = e.target.closest('.quote-format-tab');
          if (formatTab) {
            state.exportFormat = formatTab.getAttribute('data-format') || 'excel';
            Array.prototype.forEach.call(previewRoot.querySelectorAll('.quote-format-tab'), function (tab) {
              var selected = tab === formatTab;
              tab.classList.toggle('is-active', selected);
              tab.setAttribute('aria-selected', selected ? 'true' : 'false');
            });
            return;
          }
          var batch = e.target.closest('[data-dom-id="quote-batch-price"]');
          if (batch) {
            openBatchPriceSheet(previewRoot);
            return;
          }
          var del = e.target.closest('[data-quote-delete-row]');
          if (del) {
            var id = del.getAttribute('data-quote-delete-row');
            state.quoteRows = state.quoteRows.filter(function (row) { return row.id !== id; });
            state.dirty = true;
            refreshPreviewTable(previewRoot);
            return;
          }
          if (!e.target.closest('[data-role="quote-language-menu"]') && !e.target.closest('[data-dom-id="quote-language-button"]')) {
            languageMenu.hidden = true;
            languageMenu.setAttribute('data-state', 'closed');
            languageButton.setAttribute('aria-expanded', 'false');
            languageButton.classList.remove('is-open');
          }
        });
        previewRoot.addEventListener('input', function (e) {
          var field = e.target.getAttribute('data-quote-field');
          if (!field) return;
          var rowEl = e.target.closest('[data-quote-row-id]');
          var row = rowEl ? findQuoteRow(rowEl.getAttribute('data-quote-row-id')) : null;
          if (!row) return;
          if (field === 'priceMin' || field === 'priceMax') {
            e.target.value = normalizePriceValue(e.target.value);
            row[field] = e.target.value;
            var usd = rowEl.querySelector('.quote-usd-text');
            if (usd) usd.textContent = '$' + formatUsd(row.priceMax || row.priceMin);
            updatePreviewTotals(previewRoot);
          } else {
            row[field] = e.target.value;
          }
          state.dirty = true;
        });
        var cancel = previewRoot.querySelector('[data-dom-id="quote-translate-cancel"]');
        if (cancel) cancel.addEventListener('click', function () {
          state.translateRunId += 1;
          setTranslateStatus(previewRoot, false, '');
        });
      }
      function openQuotePreview() {
        appendSelectedQuoteRows();
        if (!state.quoteRows.length) {
          ctx.toast('请先选择要导出的产品');
          return;
        }
        state.appendMode = false;
        setAppendMode(false);
        ctx.openFullScreenModal(quotePreviewTemplate(state), {
          label: '报价单预览',
          init: bindPreview
        });
      }

      function onListClick(e) {
        var target = e.target;
        var toggle = target.closest('[data-quote-toggle]');
        if (toggle) {
          var mode = toggle.getAttribute('data-mode');
          var pid = toggle.getAttribute('data-id');
          var idx = toggle.getAttribute('data-idx') ? Number(toggle.getAttribute('data-idx')) : 0;
          var p = PRODUCTS.filter(function (x) { return x.product_id === pid; })[0];
          if (p) {
            toggleSelect(mode, p, idx);
            syncToggleSelection(toggle, mode, p, idx);
            var group = toggle.closest('.quote-image-group');
            if (mode === 'image' && group) syncImageGroupSelection(group, p);
          }
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
            syncImageGroupSelection(groupToggle.closest('.quote-image-group'), gp);
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
      syncModeMenuSelection();
      syncBatchMenuSelection();
      renderList();
      showGuideBubble();
      if (guideBubble) guideBubble.addEventListener('click', function () {
        guideBubble.setAttribute('data-state', 'closed');
        guideBubble.hidden = true;
      });

      /* 交互 data-dom-id 显式绑定 */
      root.querySelector('[data-dom-id="quote-back"]').addEventListener('click', function () { ctx.navigate('my'); });
      root.querySelector('[data-dom-id="quote-records-entry"]').addEventListener('click', function () { ctx.toast('报价记录将在后续阶段接入'); });
      modeButton.addEventListener('click', function () {
        syncModeMenuSelection();
        toggleMenu(modeButton, modeMenu, modeMenu.hidden);
      });
      root.querySelector('[data-dom-id="quote-view-toggle"]').addEventListener('click', function () { switchView(state.view === 'grid' ? 'list' : 'grid'); });
      root.querySelector('[data-dom-id="quote-filter-sheet-btn"]').addEventListener('click', function () {
        var btn = root.querySelector('[data-dom-id="quote-filter-sheet-btn"]');
        var strip = root.querySelector('[data-role="quote-filter-strip"]');
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        strip.hidden = false;
        openFilterPlaceholder();
      });
      selectAllBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleBatchSelection(); });
      countDropdown.addEventListener('click', function () { toggleMenu(countDropdown, countMenu, countMenu.hidden); });
      root.querySelector('[data-dom-id="quote-view-selected"]').addEventListener('click', openSelectedSheet);
      nextBtn.addEventListener('click', function () {
        if (selectedCount() === 0) {
          ctx.toast('请先选择要导出的产品');
          return;
        }
        openQuotePreview();
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
          setBatchSelectValue(value);
        });
      });

      /* 动态商品列表委托 + 滚动分页 + 外部点击关闭菜单 */
      scrollEl.addEventListener('click', onListClick);
      scrollEl.addEventListener('scroll', onScroll);
      document.addEventListener('click', onDocumentClick);
      window.addEventListener('resize', onViewportResize);

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
        window.removeEventListener('resize', onViewportResize);
      });
    }
  });
})();
