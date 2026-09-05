/**
 * 导出报价单场景（shop244）：选品 → 预览编辑 → 分享导出 → 报价记录 全闭环。
 * 阶段B/C：入口分流、选品页与报价单预览编辑。入口来自「我的」内容管理-批量-批量导出（见 我的/scene.js）。
 * 选品页支持：按产品报价 / 按图报价 两种模式切换、商品搜索（名称/货号/搜索码）、
 * 列表/宫格视图、商品勾选、底部批量栏（全选/已选计数下拉/查看已选/下一步）、分页滚动加载。
 * 筛选面板、分享导出、报价记录在后续阶段接入。
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
  var CATEGORY_PREVIEW_COUNT = 9;
  var SOURCE_PAGE_SIZE = 4;
  var DATE_PRESETS = [
    { key: 'today', label: '今天' },
    { key: 'yesterday', label: '昨天' },
    { key: 'thisMonth', label: '本月' }
  ];
  var BATCH_PRICE_MODES = [
    { key: 'set', label: '统一价格' },
    { key: 'increase', label: '统一加价' },
    { key: 'decrease', label: '统一减价' },
    { key: 'tail', label: '尾数处理' }
  ];
  var BATCH_PRICE_UNITS = [
    { key: 'percent', label: '按比例' },
    { key: 'amount', label: '按金额' }
  ];
  var BATCH_PRICE_TAILS = [
    { key: 'none', label: '不处理' },
    { key: 'round', label: '去小数' },
    { key: 'tail9', label: '个位9' },
    { key: 'tail99', label: '十位99' }
  ];
  var CNY_TO_USD = 7.1;
  var LANGUAGE_OPTIONS = [
    { code: 'zh-CN', label: '中文', short: '中', cn: '中文', rtl: false },
    { code: 'en', label: 'English', short: '英', cn: '英语', rtl: false },
    { code: 'ja', label: '日本語', short: '日', cn: '日本', rtl: false },
    { code: 'ko', label: '한국어', short: '韩', cn: '韩国', rtl: false },
    { code: 'es', label: 'Español', short: '西', cn: '西班牙', rtl: false },
    { code: 'fr', label: 'Français', short: '法', cn: '法国', rtl: false },
    { code: 'de', label: 'Deutsch', short: '德', cn: '德国', rtl: false },
    { code: 'it', label: 'Italiano', short: '意', cn: '意大利', rtl: false },
    { code: 'pt', label: 'Português', short: '葡', cn: '葡萄牙', rtl: false },
    { code: 'ru', label: 'Русский', short: '俄', cn: '俄罗斯', rtl: false },
    { code: 'ar', label: 'العربية', short: '阿', cn: '阿拉伯', rtl: true },
    { code: 'hi', label: 'हिन्दी', short: '印地', cn: '印度', rtl: false },
    { code: 'id', label: 'Indonesia', short: '印尼', cn: '印度尼西亚', rtl: false },
    { code: 'vi', label: 'Tiếng Việt', short: '越南', cn: '越南', rtl: false },
    { code: 'th', label: 'ไทย', short: '泰', cn: '泰国', rtl: false },
    { code: 'tr', label: 'Türkçe', short: '土', cn: '土耳其', rtl: false }
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
  function addDays(date, days) {
    var next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }
  function todayValue() {
    return formatDate(new Date());
  }
  function normalizeDateValue(value) {
    var text = String(value || '').trim().replace(/\//g, '-');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return '';
    var parts = text.split('-');
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (Number.isNaN(date.getTime()) || formatDate(date) !== text) return '';
    var today = todayValue();
    return text > today ? today : text;
  }
  function formatDateLabel(value) {
    var normalized = normalizeDateValue(value);
    if (!normalized) return '';
    return normalized.replace(/-/g, '/');
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
        + '<span class="quote-language-option__native">' + escapeHtml(lang.label) + '</span>'
        + '<span class="quote-language-option__cn">' + escapeHtml(lang.cn || lang.label) + '</span>'
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
  function quoteRowUsdText(row) {
    if (quoteRowHasRange(row)) {
      return '$' + formatUsd(row.priceMin) + ' ~ $' + formatUsd(row.priceMax);
    }
    return '$' + formatUsd(row.priceMin);
  }
  function quoteRowHasRange(row) {
    return Boolean(row.priceMax && moneyNumber(row.priceMax) !== moneyNumber(row.priceMin));
  }
  function quotePriceInputHtml(row, field, label) {
    return '<div class="number-input" data-component-slug="input" data-number-input>'
      + '<input class="number-input__field" type="text" inputmode="decimal" data-quote-field="' + escapeHtml(field) + '" value="' + escapeHtml(row[field]) + '" aria-label="' + escapeHtml(label) + '">'
      + '<span class="number-input__suffix" aria-hidden="true"></span>'
      + '</div>';
  }
  function quotePriceCellHtml(row) {
    var hasRange = quoteRowHasRange(row);
    return '<td class="quote-table__price">'
      + '<div class="quote-price-cell">'
      + '<div class="quote-price-inputs' + (hasRange ? '' : ' quote-price-inputs--single') + '">'
      + quotePriceInputHtml(row, 'priceMin', hasRange ? '最低价格' : '价格')
      + (hasRange ? '<span class="quote-price-separator">~</span>' + quotePriceInputHtml(row, 'priceMax', '最高价格') : '')
      + '</div>'
      + '<div class="quote-usd-text">' + escapeHtml(quoteRowUsdText(row)) + '</div>'
      + '</div>'
      + '</td>';
  }
  function quotePreviewTemplate(state) {
    var lang = getLanguage(state.language);
    var totals = quoteTotals(state.quoteRows);
    var albumName = quoteAlbumName();
    return '<div class="modal modal--fullscreen modal--has-actions quote-preview-modal" data-component-slug="modal" data-state="open" role="dialog" aria-modal="true" aria-label="报价单预览" style="--modal-panel-bg: var(--bg-surface)">'
      + '<div class="modal__panel">'
      + '<div class="modal__title modal__title--default">'
      + '<nav class="navbar" data-component-slug="navbar"><div class="navbar__body">'
      + '<div class="navbar__left"><button type="button" class="navbar__left-btn navbar__left-btn--circle" data-dom-id="quote-preview-back" aria-label="收起"><i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i></button></div>'
      + '<div class="navbar__center"><span class="navbar__title">报价单预览</span></div>'
      + '<div class="navbar__right"></div>'
      + '</div></nav>'
      + '</div>'
      + '<div class="modal__body quote-preview-body">'
      + '<div class="layout-scroll quote-preview-scroll" data-component-slug="layout-scroll" data-role="quote-preview-scroll">'
      + '<section class="quote-preview-summary">'
      + '<div class="quote-preview-summary__top"><div><div class="quote-preview-dir">' + escapeHtml(albumName) + '</div><div class="quote-preview-date">' + escapeHtml(formatDate(new Date(state.createdAt))) + '</div></div>'
      + '<div class="quote-preview-total" data-role="quote-total"><strong>' + escapeHtml(totals.cny) + '</strong><span>' + escapeHtml(totals.usd) + '</span></div></div>'
      + '<div class="quote-preview-title input-group" data-component-slug="input"><label class="field-label" for="quote-title-input">报价单标题</label><div class="input-wrapper"><input id="quote-title-input" data-dom-id="quote-title-input" type="text" value="' + escapeHtml(state.title) + '" aria-label="报价单标题"></div></div>'
      + '</section>'
      + '<section class="quote-preview-toolbar"><div class="quote-preview-toolbar__row"><button type="button" class="btn btn--medium btn--md quote-add-more" data-component-slug="button" data-dom-id="quote-add-more"><i class="btn__icon wego-iconfont-s icon-jia16" aria-hidden="true"></i>继续添加产品</button><div class="quote-preview-language"><button type="button" class="quote-language-button" data-dom-id="quote-language-button" aria-haspopup="listbox" aria-expanded="false"><i class="wego-iconfont-s icon-yuyanqiehuanxian" aria-hidden="true"></i><span data-role="quote-language-label">' + escapeHtml(lang.cn || lang.label) + '</span><i class="wego-iconfont-s icon-xiajiantou16 quote-language-caret" aria-hidden="true"></i></button>'
      + '<div class="popmenu popmenu--select quote-language-menu" data-component-slug="popmenu" data-role="quote-language-menu" role="listbox" data-state="closed">' + languageMenuHtml(state.language) + '</div></div></div></section>'
      + '<div class="quote-sticky-head-slot" data-role="quote-sticky-head-slot"' + (state.quoteRows.length ? '' : ' hidden') + '>' + quoteStickyHeaderHtml() + '</div>'
      + '<section class="quote-table-shell" data-role="quote-table-shell">' + quoteTableHtml(state.quoteRows) + '</section>'
      + '</div>'
      + '</div>'
      + '<div class="modal__actions quote-preview-actions"><div class="bottom-action-bar bottom-action-bar--primary-secondary quote-preview-bottom-bar" data-component-slug="bottom-action-bar" role="toolbar" aria-label="报价单导出操作"><div class="bottom-action-bar__inner"><div class="bottom-action-bar__leading"><div class="quote-share-format" role="group" aria-label="导出格式">' + quoteFormatStackHtml('excel', 'Excel', state.exportFormat) + quoteFormatStackHtml('pdf', 'PDF', state.exportFormat) + '</div></div><div class="bottom-action-bar__trailing"><button type="button" class="btn btn--strong btn--md quote-share-button" data-component-slug="button" data-dom-id="quote-share-main">分享报价单</button></div></div></div></div>'
      + '<div class="loading loading-overlay quote-translate-loading" data-component-slug="loading" data-role="quote-translate-loading" role="status" aria-live="polite" aria-label="正在翻译中" hidden><div class="loading-overlay__indicator"><span class="loading" data-component-slug="loading" role="presentation"><span class="loading__icon"><span class="loading__dot loading__dot--1"></span><span class="loading__dot loading__dot--2"></span><span class="loading__dot loading__dot--3"></span></span></span></div><div class="loading-overlay__text"><span class="loading-overlay__label">正在翻译中</span></div></div>'
      + '</div>'
      + '</div>';
  }
  function quoteAlbumName() {
    var user = DB && DB.currentUser ? DB.currentUser : null;
    var name = user && (user.album_name || user.albumName || user.merchant_name || user.nickname || user.name);
    return name ? name + '相册' : '我的相册';
  }
  function quoteFormatStackHtml(format, label, currentFormat) {
    var selected = format === currentFormat;
    return '<button type="button" class="stack quote-format-stack' + (selected ? ' stack--selected' : '') + '" data-component-slug="stack" data-format="' + escapeHtml(format) + '" aria-pressed="' + (selected ? 'true' : 'false') + '">'
      + '<span class="stack__bg"><span class="stack__label">' + escapeHtml(label) + '</span><span class="stack__check-corner" aria-hidden="true"><i class="wego-iconfont-s icon-gou16 stack__check-icon"></i></span></span>'
      + '</button>';
  }
  function quoteChoiceStackHtml(extraClass, attrName, value, label, selected) {
    return '<button type="button" class="stack ' + escapeHtml(extraClass) + (selected ? ' stack--selected' : '') + '" data-component-slug="stack" ' + attrName + '="' + escapeHtml(value) + '" aria-pressed="' + (selected ? 'true' : 'false') + '">'
      + '<span class="stack__bg"><span class="stack__label">' + escapeHtml(label) + '</span><span class="stack__check-corner" aria-hidden="true"><i class="wego-iconfont-s icon-gou16 stack__check-icon"></i></span></span>'
      + '</button>';
  }
  function quoteTableColgroupHtml() {
    return '<colgroup><col class="quote-col-image"><col class="quote-col-price"><col class="quote-col-spec"><col class="quote-col-code"><col class="quote-col-name"><col class="quote-col-action"></colgroup>';
  }
  function quoteHeaderCellHtml(kind, label, secondary) {
    if (kind === 'price') {
      return '<th class="quote-table__price"><span class="quote-price-header-title"><span>' + escapeHtml(label) + '</span><button type="button" class="link link--14 quote-price-batch" data-component-slug="link" data-dom-id="quote-batch-price">批量改价</button></span>' + (secondary ? '<small>' + escapeHtml(secondary) + '</small>' : '') + '</th>';
    }
    return '<th class="quote-table__' + escapeHtml(kind) + '"><span>' + escapeHtml(label) + '</span>' + (secondary ? '<small>' + escapeHtml(secondary) + '</small>' : '') + '</th>';
  }
  function quoteHeaderRowHtml() {
    return '<thead><tr>'
      + quoteHeaderCellHtml('image', '图片', '')
      + quoteHeaderCellHtml('price', '价格/¥', '')
      + quoteHeaderCellHtml('spec', '规格', '')
      + quoteHeaderCellHtml('code', '货号', '')
      + quoteHeaderCellHtml('name', '商品名', '')
      + quoteHeaderCellHtml('action', '操作', '')
      + '</tr></thead>';
  }
  function quoteStickyHeaderHtml() {
    return '<div class="quote-sticky-head"><table class="quote-table quote-table--sticky-head" aria-hidden="true">' + quoteTableColgroupHtml() + quoteHeaderRowHtml() + '</table><div class="quote-sticky-frozen-image-header" aria-hidden="true"><span>图片</span></div></div>';
  }
  function quoteTableHtml(rows) {
    if (!rows.length) {
      return '<div class="quote-table-empty"><strong>暂无报价商品</strong><span>可继续添加产品生成报价行</span></div>';
    }
    return '<div class="quote-table-scroll" data-role="quote-table-scroll"><table class="quote-table quote-table--body">' + quoteTableColgroupHtml() + '<tbody>' + rows.map(quoteTableRowHtml).join('') + '</tbody></table></div>';
  }
  function quoteTableRowHtml(row) {
    return '<tr data-quote-row-id="' + escapeHtml(row.id) + '">'
      + '<td class="quote-table__image"><div class="wg-image wg-image--rounded-sm quote-row-image" data-component-slug="image"><img class="wg-image__src" src="' + escapeHtml(row.image) + '" alt="' + escapeHtml(row.name) + '"></div></td>'
      + quotePriceCellHtml(row)
      + '<td class="quote-table__spec"><div class="input-group quote-cell-field" data-component-slug="input"><label class="field-label" for="quote-spec-' + escapeHtml(row.id) + '">规格</label><textarea id="quote-spec-' + escapeHtml(row.id) + '" rows="1" class="quote-cell-textarea" data-quote-field="specification">' + escapeHtml(row.specification) + '</textarea></div></td>'
      + '<td class="quote-table__code"><div class="input-group quote-cell-field quote-cell-field--code" data-component-slug="input"><label class="field-label" for="quote-no-' + escapeHtml(row.id) + '">货号</label><textarea id="quote-no-' + escapeHtml(row.id) + '" rows="1" class="quote-cell-textarea" data-quote-field="itemNo">' + escapeHtml(row.itemNo) + '</textarea></div></td>'
      + '<td class="quote-table__name"><div class="input-group quote-cell-field" data-component-slug="input"><label class="field-label" for="quote-name-' + escapeHtml(row.id) + '">商品名</label><textarea id="quote-name-' + escapeHtml(row.id) + '" rows="1" class="quote-cell-textarea" data-quote-field="name">' + escapeHtml(row.name) + '</textarea></div></td>'
      + '<td class="quote-table__action"><button type="button" class="btn btn--danger btn--sm btn--icon-only" data-component-slug="button" data-quote-delete-row="' + escapeHtml(row.id) + '" aria-label="删除报价行"><i class="btn__icon wego-iconfont-s icon-shanchu" aria-hidden="true"></i></button></td>'
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
        batchPriceDraft: createBatchPriceDraft(),
        batchPriceRestoreSnapshot: null,
        filters: createDefaultFilters(),
        filterDraft: null,
        filterPanel: '',
        filterSearch: { category: '', source: '' },
        filterSearchOpen: '',
        sourceVisibleCount: SOURCE_PAGE_SIZE,
        dirty: false,
        translateRunId: 0,
        translateScrollLock: null,
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

      function createDefaultFilters() {
        return { startDate: '', endDate: '', preset: '', category: 'all', source: 'all' };
      }
      function cloneFilters(filters) {
        return Object.assign(createDefaultFilters(), filters || {});
      }
      function normalizeFilters(filters, changedField) {
        var next = cloneFilters(filters);
        next.startDate = normalizeDateValue(next.startDate);
        next.endDate = normalizeDateValue(next.endDate);
        if (next.startDate && next.endDate && next.startDate > next.endDate) {
          if (changedField === 'endDate') next.startDate = next.endDate;
          else next.endDate = next.startDate;
        }
        if (!next.category) next.category = 'all';
        if (!next.source) next.source = 'all';
        return next;
      }
      function activeDraftFilters() {
        return normalizeFilters(state.filterDraft || state.filters);
      }
      function hasActiveFilters(filters) {
        var f = normalizeFilters(filters || state.filters);
        return Boolean(f.startDate || f.endDate || f.category !== 'all' || f.source !== 'all');
      }
      function selectedFilterLabel(kind, value) {
        if (!value || value === 'all') return kind === 'source' ? '全部来源' : '全部分类';
        return String(value);
      }
      function dateFilterLabel(filters) {
        var f = normalizeFilters(filters);
        if (f.startDate && f.endDate && f.startDate === f.endDate) return formatDateLabel(f.startDate);
        if (f.startDate && f.endDate) return formatDateLabel(f.startDate) + ' - ' + formatDateLabel(f.endDate);
        if (f.startDate) return formatDateLabel(f.startDate) + ' 起';
        if (f.endDate) return formatDateLabel(f.endDate) + ' 前';
        return '';
      }
      function activeFilterBadges(filters) {
        var f = normalizeFilters(filters || state.filters);
        var badges = [];
        if (f.category !== 'all') badges.push({ kind: 'category', label: selectedFilterLabel('category', f.category) });
        if (f.source !== 'all') badges.push({ kind: 'source', label: selectedFilterLabel('source', f.source) });
        if (f.startDate || f.endDate) badges.push({ kind: 'date', label: dateFilterLabel(f) });
        return badges;
      }
      function renderFilterStrip() {
        var strip = root.querySelector('[data-role="quote-filter-strip"]');
        var btn = root.querySelector('[data-dom-id="quote-filter-sheet-btn"]');
        var badges = activeFilterBadges(state.filters);
        var active = badges.length > 0;
        if (btn) {
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-pressed', active ? 'true' : 'false');
          btn.setAttribute('aria-label', active ? '筛选，已选' + badges.length + '项条件' : '筛选');
          if (active) btn.setAttribute('data-filter-count', String(badges.length));
          else btn.removeAttribute('data-filter-count');
        }
        if (!strip) return;
        strip.hidden = !active;
        strip.innerHTML = active
          ? '<div class="quote-filter-badges" aria-label="当前筛选条件">' + badges.map(function (badge) {
              return '<button type="button" class="quote-filter-badge" data-filter-remove="' + escapeHtml(badge.kind) + '" aria-label="移除' + escapeHtml(badge.label) + '"><span>' + escapeHtml(badge.label) + '</span><i class="wego-iconfont-s icon-yuancha-mian" aria-hidden="true"></i></button>';
            }).join('') + '</div>'
          : '';
      }
      function uniqueProductValues(field) {
        var seen = {};
        var list = [];
        PRODUCTS.forEach(function (p) {
          var value = String(p[field] || '').trim();
          if (!value || seen[value]) return;
          seen[value] = true;
          list.push(value);
        });
        return list;
      }
      function filterOptions(kind) {
        return uniqueProductValues(kind === 'source' ? 'source' : 'category');
      }
      function filterOptionMatches(value, query) {
        var text = String(value || '').toLowerCase();
        var q = String(query || '').trim().toLowerCase();
        return !q || text.indexOf(q) >= 0;
      }
      function highlightFilterLabel(value, query) {
        var text = String(value == null ? '' : value);
        var q = String(query || '').trim();
        var index = text.toLowerCase().indexOf(q.toLowerCase());
        if (!q || index < 0) return escapeHtml(text);
        return escapeHtml(text.slice(0, index))
          + '<mark class="quote-filter-highlight">' + escapeHtml(text.slice(index, index + q.length)) + '</mark>'
          + escapeHtml(text.slice(index + q.length));
      }
      function productDateValue(product) {
        var raw = product.created_at || product.createdAt || product.created_date || product.updated_at || product.updatedAt || product.updated_date || '';
        var normalized = normalizeDateValue(raw);
        if (normalized) return normalized;
        var index = PRODUCTS.indexOf(product);
        return formatDate(addDays(new Date(), -Math.max(0, index)));
      }
      function productPassesFilters(product) {
        var filters = normalizeFilters(state.filters);
        if (filters.category !== 'all' && product.category !== filters.category) return false;
        if (filters.source !== 'all' && product.source !== filters.source) return false;
        if (filters.startDate || filters.endDate) {
          var date = productDateValue(product);
          if (filters.startDate && date < filters.startDate) return false;
          if (filters.endDate && date > filters.endDate) return false;
        }
        return true;
      }
      function currentList() {
        var query = state.query.trim().toLowerCase();
        return PRODUCTS.filter(function (p) {
          if (query) {
            var hit = (p.title || '').toLowerCase().indexOf(query) >= 0
              || (p.item_no || '').toLowerCase().indexOf(query) >= 0
              || (p.search_code || '').toLowerCase().indexOf(query) >= 0;
            if (!hit) return false;
          }
          return productPassesFilters(p);
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
        var noResult = list.length === 0 && PRODUCTS.length > 0;
        var initialEmpty = PRODUCTS.length === 0;
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
        renderFilterStrip();
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
      function syncQuoteStickyHeadX(previewRoot) {
        var scroller = previewRoot.querySelector('[data-role="quote-table-scroll"]');
        var sticky = previewRoot.querySelector('.quote-table--sticky-head');
        if (!scroller || !sticky) return;
        sticky.style.transform = 'translate3d(' + (-Math.round(scroller.scrollLeft || 0)) + 'px, 0, 0)';
      }
      function refreshPreviewTable(previewRoot) {
        var shell = previewRoot.querySelector('[data-role="quote-table-shell"]');
        if (!shell) return;
        shell.innerHTML = quoteTableHtml(state.quoteRows);
        var stickySlot = previewRoot.querySelector('[data-role="quote-sticky-head-slot"]');
        if (stickySlot) stickySlot.hidden = !state.quoteRows.length;
        activateImages(shell);
        updatePreviewTotals(previewRoot);
        bindPreviewTableControls(previewRoot);
        syncQuoteStickyHeadX(previewRoot);
      }
      function deleteQuoteRow(previewRoot, button) {
        var id = button ? button.getAttribute('data-quote-delete-row') : '';
        var rowEl = button ? button.closest('[data-quote-row-id]') : null;
        var row = findQuoteRow(id);
        if (!id || !row) return;
        state.quoteRows = state.quoteRows.filter(function (r) { return r.id !== id; });
        if (row.sourceKey && state.selected[row.sourceKey]) delete state.selected[row.sourceKey];
        state.dirty = true;
        if (!state.quoteRows.length) {
          refreshPreviewTable(previewRoot);
          return;
        }
        if (rowEl) rowEl.remove();
        updatePreviewTotals(previewRoot);
        var stickySlot = previewRoot.querySelector('[data-role="quote-sticky-head-slot"]');
        if (stickySlot) stickySlot.hidden = false;
        syncQuoteStickyHeadX(previewRoot);
      }
      function bindPreviewTableControls(previewRoot) {
        var batch = previewRoot.querySelector('[data-dom-id="quote-batch-price"]');
        if (batch && !batch.dataset.quoteBatchBound) {
          batch.dataset.quoteBatchBound = 'true';
          batch.addEventListener('click', function (e) {
            e.stopPropagation();
            openBatchPriceSheet(previewRoot);
          });
        }
        Array.prototype.forEach.call(previewRoot.querySelectorAll('[data-quote-delete-row]'), function (btn) {
          if (btn.dataset.quoteDeleteBound) return;
          btn.dataset.quoteDeleteBound = 'true';
          btn.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteQuoteRow(previewRoot, btn);
          });
        });
        var tableScroll = previewRoot.querySelector('[data-role="quote-table-scroll"]');
        if (tableScroll && !tableScroll.dataset.quoteScrollBound) {
          tableScroll.dataset.quoteScrollBound = 'true';
          tableScroll.addEventListener('scroll', function () { syncQuoteStickyHeadX(previewRoot); });
        }
        Array.prototype.forEach.call(previewRoot.querySelectorAll('.quote-cell-textarea'), function (field) {
          if (field.dataset.quoteTextareaBound) return;
          field.dataset.quoteTextareaBound = 'true';
          field.addEventListener('focus', function () {
            previewRoot.classList.add('is-input-focused');
            field.classList.add('is-expanded');
            window.setTimeout(function () { field.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, 0);
          });
          field.addEventListener('blur', function () {
            field.classList.remove('is-expanded');
            if (!previewRoot.querySelector('[data-quote-field]:focus')) previewRoot.classList.remove('is-input-focused');
          });
        });
        Array.prototype.forEach.call(previewRoot.querySelectorAll('input[data-quote-field]'), function (field) {
          if (field.dataset.quoteInputBound) return;
          field.dataset.quoteInputBound = 'true';
          field.addEventListener('focus', function () {
            previewRoot.classList.add('is-input-focused');
            window.setTimeout(function () { field.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, 0);
          });
          field.addEventListener('blur', function () {
            if (!previewRoot.querySelector('[data-quote-field]:focus')) previewRoot.classList.remove('is-input-focused');
          });
        });
      }
      function syncLanguageMenu(previewRoot) {
        var lang = getLanguage(state.language);
        var label = previewRoot.querySelector('[data-role="quote-language-label"]');
        if (label) label.textContent = lang.cn || lang.label;
        Array.prototype.forEach.call(document.querySelectorAll('[data-role="quote-language-option"]'), function (opt) {
          var selected = opt.getAttribute('data-lang') === state.language;
          opt.classList.toggle('popmenu__item--selected', selected);
          opt.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
        var scroll = previewRoot.querySelector('[data-role="quote-preview-scroll"]');
        if (scroll) scroll.setAttribute('dir', lang.rtl ? 'rtl' : 'ltr');
      }
      function setPreviewScrollLocked(locked) {
        if (locked && !state.translateScrollLock) {
          state.translateScrollLock = {
            html: document.documentElement.style.overflow,
            body: document.body.style.overflow
          };
          document.documentElement.style.overflow = 'hidden';
          document.body.style.overflow = 'hidden';
          return;
        }
        if (!locked && state.translateScrollLock) {
          document.documentElement.style.overflow = state.translateScrollLock.html;
          document.body.style.overflow = state.translateScrollLock.body;
          state.translateScrollLock = null;
        }
      }
      function setTranslateLoading(previewRoot, visible) {
        var overlay = previewRoot.querySelector('[data-role="quote-translate-loading"]');
        if (!overlay) return;
        if (visible) {
          overlay.hidden = false;
          previewRoot.setAttribute('data-quote-translating', 'true');
          setPreviewScrollLocked(true);
          requestAnimationFrame(function () {
            overlay.classList.add('is-visible');
          });
          return;
        }
        overlay.classList.remove('is-visible');
        previewRoot.removeAttribute('data-quote-translating');
        setPreviewScrollLocked(false);
        window.setTimeout(function () {
          if (!overlay.classList.contains('is-visible')) overlay.hidden = true;
        }, 250);
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
          setTranslateLoading(previewRoot, false);
          return;
        }
        var work = [];
        state.quoteRows.forEach(function (row) {
          work.push({ row: row, field: 'name', text: row.originalName });
          work.push({ row: row, field: 'specification', text: row.originalSpec });
        });
        if (!work.length) return;
        setTranslateLoading(previewRoot, true);
        work.reduce(function (chain, item) {
          return chain.then(function () {
            if (runId !== state.translateRunId) return null;
            return translateText(item.text, code).then(function (translated) {
              if (runId !== state.translateRunId) return;
              item.row[item.field] = translated;
            });
          });
        }, Promise.resolve()).then(function () {
          if (runId === state.translateRunId) {
            refreshPreviewTable(previewRoot);
            setTranslateLoading(previewRoot, false);
          }
        });
      }
      function createBatchPriceDraft() {
        return {
          mode: 'set',
          unit: 'percent',
          values: {
            set: '',
            increase: { percent: '', amount: '' },
            decrease: { percent: '', amount: '' }
          },
          tail: 'none'
        };
      }
      function normalizeBatchMode(value) {
        return BATCH_PRICE_MODES.some(function (item) { return item.key === value; }) ? value : 'set';
      }
      function normalizeBatchUnit(value) {
        return value === 'amount' ? 'amount' : 'percent';
      }
      function normalizeBatchTail(value) {
        return BATCH_PRICE_TAILS.some(function (item) { return item.key === value; }) ? value : 'none';
      }
      function batchDraftValue() {
        var draft = state.batchPriceDraft || createBatchPriceDraft();
        var mode = normalizeBatchMode(draft.mode);
        var unit = normalizeBatchUnit(draft.unit);
        var values = draft.values || createBatchPriceDraft().values;
        if (mode === 'set') return String(values.set || '');
        if (mode === 'increase' || mode === 'decrease') return String((values[mode] && values[mode][unit]) || '');
        return '';
      }
      function setBatchDraftValue(value) {
        var draft = state.batchPriceDraft || createBatchPriceDraft();
        state.batchPriceDraft = draft;
        draft.values = draft.values || createBatchPriceDraft().values;
        var mode = normalizeBatchMode(draft.mode);
        var unit = normalizeBatchUnit(draft.unit);
        if (mode === 'set') draft.values.set = value;
        else if (mode === 'increase' || mode === 'decrease') {
          draft.values[mode] = draft.values[mode] || { percent: '', amount: '' };
          draft.values[mode][unit] = value;
        }
      }
      function batchPriceModeStackHtml(current) {
        return BATCH_PRICE_MODES.map(function (mode) {
          return quoteChoiceStackHtml('quote-batch-price-mode', 'data-batch-price-mode', mode.key, mode.label, current === mode.key);
        }).join('');
      }
      function batchPriceUnitStackHtml(current) {
        return BATCH_PRICE_UNITS.map(function (unit) {
          return quoteChoiceStackHtml('quote-batch-price-unit', 'data-batch-price-unit', unit.key, unit.label, current === unit.key);
        }).join('');
      }
      function batchPriceTailStackHtml(current) {
        return BATCH_PRICE_TAILS.map(function (tail) {
          return quoteChoiceStackHtml('quote-batch-price-tail', 'data-batch-price-tail', tail.key, tail.label, current === tail.key);
        }).join('');
      }
      function batchPriceEditorHtml() {
        var draft = state.batchPriceDraft || createBatchPriceDraft();
        var mode = normalizeBatchMode(draft.mode);
        var unit = normalizeBatchUnit(draft.unit);
        var tail = normalizeBatchTail(draft.tail);
        var value = batchDraftValue();
        var label = mode === 'set' ? '统一价格' : (mode === 'increase' ? '加价' : '减价') + (unit === 'percent' ? '比例' : '金额');
        var valueField = '';
        if (mode !== 'tail') {
          valueField = '<div class="quote-batch-value-row">'
            + (mode === 'set' ? '' : '<div class="quote-batch-unit-row" role="group" aria-label="加减价方式">' + batchPriceUnitStackHtml(unit) + '</div>')
            + '<div class="input-group quote-batch-value-field" data-component-slug="input"><label class="field-label" for="quote-batch-price-input">' + escapeHtml(label) + '</label><div class="input-wrapper"><input id="quote-batch-price-input" type="text" inputmode="decimal" data-role="quote-batch-price-input" value="' + escapeHtml(value) + '" placeholder="' + (unit === 'percent' && mode !== 'set' ? '输入比例' : '输入金额') + '"></div></div>'
            + '</div>';
        }
        return '<div class="quote-batch-mode-grid" role="group" aria-label="改价方式">' + batchPriceModeStackHtml(mode) + '</div>'
          + '<section class="quote-batch-editor">'
          + valueField
          + '<div class="quote-batch-tail-block"><div class="quote-batch-section-title">尾数处理</div><div class="quote-batch-tail-grid" role="group" aria-label="尾数处理">' + batchPriceTailStackHtml(tail) + '</div></div>'
          + '</section>';
      }
      function batchPriceSheetTemplate() {
        var canRestore = Boolean(state.batchPriceRestoreSnapshot && state.batchPriceRestoreSnapshot.rows && state.batchPriceRestoreSnapshot.rows.length);
        return '<div class="modal modal--frame-x modal--has-actions quote-batch-price-modal" data-component-slug="modal" role="dialog" aria-modal="true" data-state="open" aria-label="批量改价">'
          + '<div class="modal__panel">'
          + '<div class="modal__title modal__title--default"><nav class="navbar" data-component-slug="navbar"><div class="navbar__body navbar__body--spaced"><div class="navbar__left"><button type="button" class="navbar__left-text" data-dom-id="quote-batch-price-cancel" aria-label="取消">取消</button></div><div class="navbar__center"><span class="navbar__title">批量改价</span></div><div class="navbar__right navbar__right--button"><button type="button" class="btn btn--strong btn--sm" data-component-slug="button" data-dom-id="quote-batch-price-confirm">确定</button></div></div></nav></div>'
          + '<div class="modal__body quote-batch-price-body" data-role="quote-batch-price-body">' + batchPriceEditorHtml() + '</div>'
          + '<div class="modal__actions"><div class="modal__links"><button type="button" class="link quote-batch-price-restore' + (canRestore ? '' : ' link--disabled') + '" data-component-slug="link" data-dom-id="quote-batch-price-restore"' + (canRestore ? '' : ' disabled') + '>恢复改价前</button></div></div>'
          + '</div></div>';
      }
      function refreshBatchPriceSheetBody(sheetRoot) {
        var body = sheetRoot.querySelector('[data-role="quote-batch-price-body"]');
        if (body) body.innerHTML = batchPriceEditorHtml();
        var restore = sheetRoot.querySelector('[data-dom-id="quote-batch-price-restore"]');
        if (restore) restore.disabled = !(state.batchPriceRestoreSnapshot && state.batchPriceRestoreSnapshot.rows && state.batchPriceRestoreSnapshot.rows.length);
      }
      function rememberBatchPriceSnapshot() {
        state.batchPriceRestoreSnapshot = {
          rows: state.quoteRows.map(function (row) {
            return { id: row.id, priceMin: row.priceMin, priceMax: row.priceMax };
          })
        };
      }
      function restoreBatchPrices(previewRoot, sheetCtx) {
        var snapshot = state.batchPriceRestoreSnapshot;
        if (!snapshot || !snapshot.rows || !snapshot.rows.length) {
          sheetCtx.toast('暂无可恢复的改价');
          return;
        }
        var byId = {};
        snapshot.rows.forEach(function (row) { byId[row.id] = row; });
        state.quoteRows.forEach(function (row) {
          if (!byId[row.id]) return;
          row.priceMin = byId[row.id].priceMin;
          row.priceMax = byId[row.id].priceMax;
        });
        state.batchPriceRestoreSnapshot = null;
        state.dirty = true;
        refreshPreviewTable(previewRoot);
        sheetCtx.close();
        sheetCtx.toast('已恢复改价前价格');
      }
      function batchPriceNumber(value) {
        var normalized = normalizePriceValue(value);
        if (!normalized) return 0;
        var n = Number(normalized);
        return Number.isFinite(n) ? n : 0;
      }
      function applyTailValue(value, tail) {
        var n = Number(value);
        if (!Number.isFinite(n) || n <= 0) return 0;
        if (tail === 'tail9') return Math.floor(n / 10) * 10 + 9;
        if (tail === 'tail99') return Math.floor(n / 100) * 100 + 99;
        if (tail === 'round') return Math.floor(n);
        return n;
      }
      function calculateBatchPrice(current, draft) {
        var mode = normalizeBatchMode(draft.mode);
        var unit = normalizeBatchUnit(draft.unit);
        var value = batchPriceNumber(batchDraftValue());
        if (mode === 'set') {
          if (!value) return { error: '请输入大于0的统一价格' };
          return value;
        }
        if (mode === 'tail') return current;
        if (!value) return { error: '请输入大于0的' + (unit === 'percent' ? '比例' : '金额') };
        if (mode === 'decrease' && unit === 'percent' && value >= 100) return { error: '减价比例需小于100%' };
        var direction = mode === 'increase' ? 1 : -1;
        var next = unit === 'percent' ? current * (1 + direction * value / 100) : current + direction * value;
        if (!Number.isFinite(next) || next <= 0) return { error: '调整后价格需大于0' };
        return next;
      }
      function applyBatchPriceChanges(previewRoot, sheetCtx) {
        var draft = state.batchPriceDraft || createBatchPriceDraft();
        var tail = normalizeBatchTail(draft.tail);
        if (!state.quoteRows.length) {
          sheetCtx.toast('暂无可改价商品');
          return;
        }
        var nextRows = [];
        for (var i = 0; i < state.quoteRows.length; i++) {
          var row = state.quoteRows[i];
          var low = moneyNumber(row.priceMin);
          var high = moneyNumber(row.priceMax);
          var nextLow = calculateBatchPrice(low, draft);
          if (nextLow && nextLow.error) {
            sheetCtx.toast(nextLow.error);
            return;
          }
          var nextHigh = high ? calculateBatchPrice(high, draft) : 0;
          if (nextHigh && nextHigh.error) {
            sheetCtx.toast(nextHigh.error);
            return;
          }
          nextLow = applyTailValue(nextLow, tail);
          nextHigh = high ? applyTailValue(nextHigh, tail) : 0;
          if (!nextLow || (high && !nextHigh)) {
            sheetCtx.toast(tail === 'round' ? '有商品价格小于1元，不能去小数' : '处理后价格需大于0');
            return;
          }
          if (nextHigh && nextLow > nextHigh) {
            var temp = nextLow;
            nextLow = nextHigh;
            nextHigh = temp;
          }
          nextRows.push({ row: row, priceMin: formatMoney(nextLow), priceMax: nextHigh && nextHigh !== nextLow ? formatMoney(nextHigh) : '' });
        }
        rememberBatchPriceSnapshot();
        nextRows.forEach(function (item) {
          item.row.priceMin = item.priceMin;
          item.row.priceMax = item.priceMax;
        });
        state.dirty = true;
        refreshPreviewTable(previewRoot);
        sheetCtx.close();
        sheetCtx.toast('已批量调整' + nextRows.length + '款商品');
      }
      function openBatchPriceSheet(previewRoot) {
        state.batchPriceDraft = createBatchPriceDraft();
        ctx.openSheet(batchPriceSheetTemplate(), {
          label: '批量改价',
          init: function (sheetCtx) {
            var sheetRoot = sheetCtx.root;
            var cancel = sheetRoot.querySelector('[data-dom-id="quote-batch-price-cancel"]');
            var confirm = sheetRoot.querySelector('[data-dom-id="quote-batch-price-confirm"]');
            var restore = sheetRoot.querySelector('[data-dom-id="quote-batch-price-restore"]');
            cancel.addEventListener('click', function () { sheetCtx.close(); });
            confirm.addEventListener('click', function () { applyBatchPriceChanges(previewRoot, sheetCtx); });
            restore.addEventListener('click', function () { restoreBatchPrices(previewRoot, sheetCtx); });
            sheetRoot.addEventListener('input', function (e) {
              if (!e.target.matches('[data-role="quote-batch-price-input"]')) return;
              e.target.value = normalizePriceValue(e.target.value);
              setBatchDraftValue(e.target.value);
            });
            sheetRoot.addEventListener('click', function (e) {
              var modeBtn = e.target.closest('[data-batch-price-mode]');
              if (modeBtn) {
                state.batchPriceDraft.mode = normalizeBatchMode(modeBtn.getAttribute('data-batch-price-mode'));
                if (state.batchPriceDraft.mode === 'tail' && state.batchPriceDraft.tail === 'none') state.batchPriceDraft.tail = 'round';
                refreshBatchPriceSheetBody(sheetRoot);
                return;
              }
              var unitBtn = e.target.closest('[data-batch-price-unit]');
              if (unitBtn) {
                state.batchPriceDraft.unit = normalizeBatchUnit(unitBtn.getAttribute('data-batch-price-unit'));
                refreshBatchPriceSheetBody(sheetRoot);
                return;
              }
              var tailBtn = e.target.closest('[data-batch-price-tail]');
              if (tailBtn) {
                state.batchPriceDraft.tail = normalizeBatchTail(tailBtn.getAttribute('data-batch-price-tail'));
                refreshBatchPriceSheetBody(sheetRoot);
              }
            });
          }
        });
      }
      function presetRange(preset) {
        var today = new Date();
        var start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (preset === 'today') return { startDate: formatDate(start), endDate: formatDate(start) };
        if (preset === 'yesterday') {
          var yesterday = addDays(start, -1);
          return { startDate: formatDate(yesterday), endDate: formatDate(yesterday) };
        }
        if (preset === 'thisMonth') return { startDate: formatDate(new Date(start.getFullYear(), start.getMonth(), 1)), endDate: formatDate(start) };
        return { startDate: '', endDate: '' };
      }
      function dateInputConstraints(field, filters) {
        var f = normalizeFilters(filters);
        var today = todayValue();
        if (field === 'endDate') return { min: f.startDate, max: today };
        return { min: '', max: f.endDate && f.endDate < today ? f.endDate : today };
      }
      function filterDateFieldHtml(field, label, draft) {
        var value = draft[field] || '';
        var limits = dateInputConstraints(field, draft);
        return '<label class="quote-filter-date-field' + (value ? '' : ' is-empty') + '">'
          + '<span class="quote-filter-date-field__display">' + escapeHtml(formatDateLabel(value) || label) + '</span>'
          + '<input type="date" data-filter-date-field="' + escapeHtml(field) + '" value="' + escapeHtml(value) + '"' + (limits.min ? ' min="' + escapeHtml(limits.min) + '"' : '') + ' max="' + escapeHtml(limits.max) + '" aria-label="' + escapeHtml(label) + '">'
          + '</label>';
      }
      function filterSearchControlHtml(kind) {
        var open = state.filterSearchOpen === kind;
        var value = state.filterSearch[kind] || '';
        if (!open) {
          return '<button type="button" class="quote-filter-search-trigger" data-role="quote-filter-search-trigger" data-filter-kind="' + escapeHtml(kind) + '" aria-label="搜索' + (kind === 'source' ? '来源' : '分类') + '"><i class="wego-iconfont-s icon-sousuo" aria-hidden="true"></i><span>搜索</span></button>';
        }
        return '<label class="searchbox searchbox--sm searchbox--gray quote-filter-inline-search" data-component-slug="search">'
          + '<span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>'
          + '<div class="searchbox__input"><input class="searchbox__field" data-role="quote-filter-search-input" data-filter-kind="' + escapeHtml(kind) + '" type="search" value="' + escapeHtml(value) + '" placeholder="搜索' + (kind === 'source' ? '来源' : '分类') + '" aria-label="搜索' + (kind === 'source' ? '来源' : '分类') + '"></div>'
          + '<div class="searchbox__actions"><button class="searchbox__action searchbox__clear wego-iconfont-s icon-yuancha-mian" data-role="quote-filter-search-clear" data-filter-kind="' + escapeHtml(kind) + '" type="button" aria-label="清除搜索"' + (value ? '' : ' hidden') + '></button></div>'
          + '</label>';
      }
      function filterTitleHtml(title, kind, draft) {
        var activeValue = kind ? draft[kind] : '';
        var active = activeValue && activeValue !== 'all';
        return '<div class="quote-filter-card__title">'
          + '<div class="quote-filter-card__label"><strong>' + escapeHtml(title) + '</strong>' + (kind === 'source' ? '<span>仅自己可见</span>' : '') + '</div>'
          + '<div class="quote-filter-card__right">'
          + (active ? '<button type="button" class="quote-filter-card__selected" data-filter-clear-kind="' + escapeHtml(kind) + '" aria-label="清除' + escapeHtml(title) + '"><span>' + escapeHtml(selectedFilterLabel(kind, activeValue)) + '</span><i class="wego-iconfont-s icon-yuancha-mian" aria-hidden="true"></i></button>' : '')
          + (kind ? filterSearchControlHtml(kind) : '')
          + '</div></div>';
      }
      function filterChipHtml(kind, value, label, current, query, extraClass) {
        var selected = current === value;
        return '<button type="button" class="quote-filter-chip' + (selected ? ' is-active' : '') + (extraClass ? ' ' + extraClass : '') + '" data-filter-option data-filter-kind="' + escapeHtml(kind) + '" data-filter-value="' + escapeHtml(value) + '">'
          + highlightFilterLabel(label, query)
          + '</button>';
      }
      function filterEmptyHtml() {
        return '<p class="quote-filter-option-empty">没有匹配的结果</p>';
      }
      function filterCategoryGridHtml(draft) {
        var query = state.filterSearch.category || '';
        var options = filterOptions('category').filter(function (item) { return filterOptionMatches(item, query); });
        var preview = query ? options : options.slice(0, CATEGORY_PREVIEW_COUNT);
        var html = preview.map(function (item) { return filterChipHtml('category', item, item, draft.category, query, ''); }).join('');
        if (!query && options.length > CATEGORY_PREVIEW_COUNT) {
          html += '<button type="button" class="quote-filter-chip quote-filter-chip--more" data-role="quote-filter-more-category">查看更多 <i class="wego-iconfont-s icon-youjiantou16" aria-hidden="true"></i></button>';
        }
        return html || filterEmptyHtml();
      }
      function filterSourceGridHtml(draft) {
        var query = state.filterSearch.source || '';
        var options = filterOptions('source').filter(function (item) { return filterOptionMatches(item, query); });
        var visible = query ? options : options.slice(0, state.sourceVisibleCount);
        var html = visible.map(function (item) { return filterChipHtml('source', item, item, draft.source, query, 'quote-filter-chip--source'); }).join('');
        if (!html) return filterEmptyHtml();
        if (!query && visible.length < options.length) {
          html += '<div class="quote-filter-source-footer"><span></span><em>继续下滑，加载更多</em><span></span></div>';
        } else {
          html += '<div class="quote-filter-source-footer"><span></span><em>已到底</em><span></span></div>';
        }
        return html;
      }
      function filterMainContentHtml(draft) {
        return '<div class="quote-filter-safe-top"></div>'
          + '<div class="quote-filter-scroll" data-role="quote-filter-scroll">'
          + '<section class="quote-filter-card">'
          + filterTitleHtml('时间区间', '', draft)
          + '<div class="quote-filter-date-row">' + filterDateFieldHtml('startDate', '开始日期', draft) + '<span>-</span>' + filterDateFieldHtml('endDate', '结束日期', draft) + '</div>'
          + '<div class="quote-filter-chip-grid">' + DATE_PRESETS.map(function (preset) { return filterChipHtml('preset', preset.key, preset.label, draft.preset, '', ''); }).join('') + '</div>'
          + '</section>'
          + '<section class="quote-filter-card">' + filterTitleHtml('分类', 'category', draft) + '<div class="quote-filter-chip-grid">' + filterCategoryGridHtml(draft) + '</div></section>'
          + '<section class="quote-filter-card quote-filter-card--source">' + filterTitleHtml('来源', 'source', draft) + '<div class="quote-filter-chip-grid quote-filter-source-grid" data-role="quote-filter-source-list">' + filterSourceGridHtml(draft) + '</div></section>'
          + '</div>'
          + '<div class="quote-filter-actions"><button type="button" class="btn btn--weak btn--md quote-filter-reset" data-component-slug="button" data-dom-id="quote-filter-reset">重置</button><button type="button" class="btn btn--strong btn--md quote-filter-confirm" data-component-slug="button" data-dom-id="quote-filter-confirm">确定</button></div>'
          + '<div class="quote-filter-safe-bottom"></div>';
      }
      function filterOptionPanelHtml(kind, draft) {
        var title = kind === 'source' ? '来源' : '分类';
        var query = state.filterSearch[kind] || '';
        var options = filterOptions(kind).filter(function (item) { return filterOptionMatches(item, query); });
        return '<section class="quote-filter-option-panel" role="dialog" aria-modal="true" aria-label="' + escapeHtml(title) + '">'
          + '<div class="quote-filter-safe-top"></div>'
          + '<header class="quote-filter-option-nav"><button type="button" class="navbar__left-btn" data-dom-id="quote-filter-option-back" aria-label="返回筛选"><i class="wego-iconfont-s icon-fanhui" aria-hidden="true"></i></button><strong>' + escapeHtml(title) + '</strong><span></span></header>'
          + '<div class="quote-filter-option-search"><label class="searchbox searchbox--md searchbox--gray" data-component-slug="search"><span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span><div class="searchbox__input"><input class="searchbox__field" data-role="quote-filter-panel-search-input" data-filter-kind="' + escapeHtml(kind) + '" type="search" value="' + escapeHtml(query) + '" placeholder="搜索" aria-label="搜索' + escapeHtml(title) + '"></div><div class="searchbox__actions"><button class="searchbox__action searchbox__clear wego-iconfont-s icon-yuancha-mian" data-dom-id="quote-filter-panel-search-clear" type="button" aria-label="清除搜索"' + (query ? '' : ' hidden') + '></button></div></label></div>'
          + '<div class="quote-filter-chip-grid quote-filter-option-grid">' + (options.map(function (item) { return filterChipHtml(kind, item, item, draft[kind], query, ''); }).join('') || filterEmptyHtml()) + '</div>'
          + '<div class="quote-filter-option-actions"><span>已选 <em>' + (draft[kind] === 'all' ? '0' : '1') + '/' + (kind === 'source' ? '1' : '1') + '</em></span><button type="button" class="btn btn--weak btn--md" data-component-slug="button" data-dom-id="quote-filter-option-clear">清除</button><button type="button" class="btn btn--strong btn--md" data-component-slug="button" data-dom-id="quote-filter-option-confirm">确定</button></div>'
          + '<div class="quote-filter-safe-bottom"></div>'
          + '</section>';
      }
      function filterShellHtml() {
        var draft = activeDraftFilters();
        return '<button type="button" class="quote-filter-mask" data-dom-id="quote-filter-close-mask" aria-label="关闭筛选"></button>'
          + '<aside class="quote-filter-drawer" role="dialog" aria-modal="true" aria-label="筛选">'
          + filterMainContentHtml(draft)
          + (state.filterPanel ? filterOptionPanelHtml(state.filterPanel, draft) : '')
          + '</aside>';
      }
      function filterOverlayTemplate() {
        return '<div class="modal modal--fullscreen quote-filter-modal" data-component-slug="modal" data-state="open" role="dialog" aria-modal="true" aria-label="筛选" style="--modal-panel-bg: transparent"><div class="quote-filter-shell" data-role="quote-filter-shell">' + filterShellHtml() + '</div></div>';
      }
      function openFilterDrawer() {
        state.filterDraft = normalizeFilters(state.filters);
        state.filterPanel = '';
        state.filterSearch = { category: '', source: '' };
        state.filterSearchOpen = '';
        state.sourceVisibleCount = SOURCE_PAGE_SIZE;
        closeAllMenus();
        ctx.openFullScreenModal(filterOverlayTemplate(), {
          label: '筛选',
          init: bindFilterOverlay
        });
      }
      function bindFilterOverlay(filterCtx) {
        var filterRoot = filterCtx.root;
        function refresh(options) {
          var shell = filterRoot.querySelector('[data-role="quote-filter-shell"]');
          if (!shell) return;
          shell.innerHTML = filterShellHtml();
          bindControls();
          if (options && options.focusKind) {
            var input = filterRoot.querySelector('[data-role="quote-filter-search-input"][data-filter-kind="' + options.focusKind + '"]')
              || filterRoot.querySelector('[data-role="quote-filter-panel-search-input"][data-filter-kind="' + options.focusKind + '"]');
            if (input) input.focus();
          }
        }
        function updateDraft(next, changedField) {
          state.filterDraft = normalizeFilters(next, changedField);
        }
        function bindControls() {
          var closeMask = filterRoot.querySelector('[data-dom-id="quote-filter-close-mask"]');
          var resetBtn = filterRoot.querySelector('[data-dom-id="quote-filter-reset"]');
          var confirmBtn = filterRoot.querySelector('[data-dom-id="quote-filter-confirm"]');
          if (closeMask) closeMask.addEventListener('click', function () {
            state.filterDraft = null;
            state.filterPanel = '';
            filterCtx.close();
          });
          if (resetBtn) resetBtn.addEventListener('click', function () {
            state.filterDraft = createDefaultFilters();
            state.filterPanel = '';
            state.filterSearch = { category: '', source: '' };
            state.filterSearchOpen = '';
            state.sourceVisibleCount = SOURCE_PAGE_SIZE;
            refresh();
          });
          if (confirmBtn) confirmBtn.addEventListener('click', function () {
            state.filters = normalizeFilters(activeDraftFilters());
            state.filterDraft = null;
            state.filterPanel = '';
            state.page = 1;
            filterCtx.close();
            renderList();
          });
          Array.prototype.forEach.call(filterRoot.querySelectorAll('[data-filter-date-field]'), function (input) {
            input.addEventListener('input', function () {
              var field = input.getAttribute('data-filter-date-field');
              var draft = activeDraftFilters();
              updateDraft(Object.assign({}, draft, { preset: '', [field]: input.value }), field);
              refresh();
            });
          });
          Array.prototype.forEach.call(filterRoot.querySelectorAll('[data-filter-option]'), function (btn) {
            btn.addEventListener('click', function () {
              var kind = btn.getAttribute('data-filter-kind');
              var value = btn.getAttribute('data-filter-value');
              var draft = activeDraftFilters();
              if (kind === 'preset') {
                updateDraft(Object.assign({}, draft, presetRange(value), { preset: value }), '');
              } else {
                updateDraft(Object.assign({}, draft, { [kind]: draft[kind] === value ? 'all' : value }), '');
              }
              refresh({ focusKind: state.filterSearchOpen || state.filterPanel });
            });
          });
          Array.prototype.forEach.call(filterRoot.querySelectorAll('[data-filter-clear-kind]'), function (btn) {
            btn.addEventListener('click', function () {
              var kind = btn.getAttribute('data-filter-clear-kind');
              var draft = activeDraftFilters();
              updateDraft(Object.assign({}, draft, { [kind]: 'all' }), '');
              refresh({ focusKind: state.filterSearchOpen || state.filterPanel });
            });
          });
          Array.prototype.forEach.call(filterRoot.querySelectorAll('[data-role="quote-filter-search-trigger"]'), function (btn) {
            btn.addEventListener('click', function () {
              state.filterSearchOpen = btn.getAttribute('data-filter-kind') || '';
              refresh({ focusKind: state.filterSearchOpen });
            });
          });
          Array.prototype.forEach.call(filterRoot.querySelectorAll('[data-role="quote-filter-search-input"], [data-role="quote-filter-panel-search-input"]'), function (input) {
            input.addEventListener('input', function () {
              var kind = input.getAttribute('data-filter-kind');
              state.filterSearch[kind] = input.value;
              if (kind === 'source') state.sourceVisibleCount = SOURCE_PAGE_SIZE;
              refresh({ focusKind: kind });
            });
          });
          Array.prototype.forEach.call(filterRoot.querySelectorAll('[data-role="quote-filter-search-clear"]'), function (btn) {
            btn.addEventListener('click', function () {
              var kind = btn.getAttribute('data-filter-kind');
              state.filterSearch[kind] = '';
              refresh({ focusKind: kind });
            });
          });
          var categoryMore = filterRoot.querySelector('[data-role="quote-filter-more-category"]');
          if (categoryMore) categoryMore.addEventListener('click', function () {
            state.filterPanel = 'category';
            state.filterSearch.category = '';
            refresh({ focusKind: 'category' });
          });
          var sourceList = filterRoot.querySelector('[data-role="quote-filter-source-list"]');
          if (sourceList) sourceList.addEventListener('scroll', function () {
            var bottom = sourceList.scrollTop + sourceList.clientHeight >= sourceList.scrollHeight - 16;
            var total = filterOptions('source').filter(function (item) { return filterOptionMatches(item, state.filterSearch.source); }).length;
            if (bottom && !state.filterSearch.source && state.sourceVisibleCount < total) {
              state.sourceVisibleCount += SOURCE_PAGE_SIZE;
              refresh();
            }
          });
          var optionBack = filterRoot.querySelector('[data-dom-id="quote-filter-option-back"]');
          if (optionBack) optionBack.addEventListener('click', function () {
            state.filterPanel = '';
            state.filterSearch.category = '';
            refresh();
          });
          var panelClearSearch = filterRoot.querySelector('[data-dom-id="quote-filter-panel-search-clear"]');
          if (panelClearSearch) panelClearSearch.addEventListener('click', function () {
            var kind = state.filterPanel || 'category';
            state.filterSearch[kind] = '';
            refresh({ focusKind: kind });
          });
          var optionClear = filterRoot.querySelector('[data-dom-id="quote-filter-option-clear"]');
          if (optionClear) optionClear.addEventListener('click', function () {
            var kind = state.filterPanel || 'category';
            var draft = activeDraftFilters();
            updateDraft(Object.assign({}, draft, { [kind]: 'all' }), '');
            refresh({ focusKind: kind });
          });
          var optionConfirm = filterRoot.querySelector('[data-dom-id="quote-filter-option-confirm"]');
          if (optionConfirm) optionConfirm.addEventListener('click', function () {
            state.filterPanel = '';
            state.filterSearch.category = '';
            refresh();
          });
        }
        bindControls();
      }
      function bindPreview(previewCtx) {
        var previewRoot = previewCtx.root;
        var languageButton = previewRoot.querySelector('[data-dom-id="quote-language-button"]');
        var languageMenu = previewRoot.querySelector('[data-role="quote-language-menu"]');
        var titleInput = previewRoot.querySelector('[data-dom-id="quote-title-input"]');
        var languageMenuHandle = null;
        var languageMenuObserver = null;
        function syncLanguageButtonOpenState() {
          var open = languageMenu && languageMenu.getAttribute('data-state') === 'open';
          if (!languageButton) return;
          languageButton.setAttribute('aria-expanded', open ? 'true' : 'false');
          languageButton.classList.toggle('is-open', open);
        }
        function hideLanguageMenu() {
          if (!languageMenu) return;
          if (languageMenuHandle) languageMenuHandle.hide();
          else languageMenu.setAttribute('data-state', 'closed');
          syncLanguageButtonOpenState();
        }
        function onPreviewScroll() { hideLanguageMenu(); }
        function cleanupPreview() {
          if (languageMenuHandle) languageMenuHandle.destroy();
          if (languageMenuObserver) languageMenuObserver.disconnect();
          if (languageMenu && languageMenu.parentElement === document.body) languageMenu.remove();
          setTranslateLoading(previewRoot, false);
        }
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
          cleanupPreview();
          previewCtx.close();
          syncVisibleSelectionStates();
        });
        previewRoot.querySelector('[data-dom-id="quote-add-more"]').addEventListener('click', function () {
          setAppendMode(true);
          cleanupPreview();
          previewCtx.close();
          syncVisibleSelectionStates();
          ctx.toast('继续选择要追加的产品');
        });
        previewRoot.querySelector('[data-dom-id="quote-share-main"]').addEventListener('click', function () {
          ctx.toast('分享导出将在后续阶段接入');
        });
        if (window.WegoPopmenu && languageButton && languageMenu) {
          /* app 浮层基座（app-overlay-layer）带 transform，会改变 fixed 定位坐标基准
             （相对浮层而非视口），WegoPopmenu 用视口坐标计算会导致气泡错位；
             先把菜单挂到无 transform 的 body 下，再用组件通用定位。
             dismissOnScroll 关闭组件级滚动收起：菜单 max-height 内滚动列表时不应收起，
             预览内容（询单滚动容器）滚动仍按外面滚动收起，避免气泡悬空错位 */
          if (languageMenu.parentElement !== document.body) document.body.appendChild(languageMenu);
          languageMenu.style.position = 'fixed';
          languageMenuHandle = window.WegoPopmenu.bind(languageButton, languageMenu, {
            beforeShow: function () { closeAllMenus(); },
            onItemClick: function (item) {
              applyLanguage(previewRoot, item.getAttribute('data-lang'));
            },
            dismissOnScroll: false
          });
          var previewScrollEl = previewRoot.querySelector('[data-role="quote-preview-scroll"]');
          if (previewScrollEl) previewScrollEl.addEventListener('scroll', onPreviewScroll);
          languageMenuObserver = new MutationObserver(syncLanguageButtonOpenState);
          languageMenuObserver.observe(languageMenu, { attributes: true, attributeFilter: ['data-state'] });
          syncLanguageButtonOpenState();
        } else if (languageButton && languageMenu) {
          languageButton.addEventListener('click', function () {
            var open = languageMenu.getAttribute('data-state') !== 'open';
            languageMenu.setAttribute('data-state', open ? 'open' : 'closed');
            syncLanguageButtonOpenState();
          });
        }
        previewRoot.addEventListener('click', function (e) {
          var langOpt = e.target.closest('[data-role="quote-language-option"]');
          if (langOpt) {
            hideLanguageMenu();
            applyLanguage(previewRoot, langOpt.getAttribute('data-lang'));
            return;
          }
          var formatTab = e.target.closest('.quote-format-stack');
          if (formatTab) {
            state.exportFormat = formatTab.getAttribute('data-format') || 'excel';
            Array.prototype.forEach.call(previewRoot.querySelectorAll('.quote-format-stack'), function (tab) {
              var selected = tab === formatTab;
              tab.classList.toggle('stack--selected', selected);
              tab.setAttribute('aria-pressed', selected ? 'true' : 'false');
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
            deleteQuoteRow(previewRoot, del);
            return;
          }
          if (!e.target.closest('[data-role="quote-language-menu"]') && !e.target.closest('[data-dom-id="quote-language-button"]')) {
            hideLanguageMenu();
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
            if (usd) usd.textContent = quoteRowUsdText(row);
            updatePreviewTotals(previewRoot);
          } else {
            row[field] = e.target.value;
          }
          state.dirty = true;
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
        window.scrollTo(0, 0);
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
        openFilterDrawer();
      });
      root.querySelector('[data-role="quote-filter-strip"]').addEventListener('click', function (e) {
        var remove = e.target.closest('[data-filter-remove]');
        if (!remove) return;
        var kind = remove.getAttribute('data-filter-remove');
        var next = cloneFilters(state.filters);
        if (kind === 'category') next.category = 'all';
        else if (kind === 'source') next.source = 'all';
        else if (kind === 'date') {
          next.startDate = '';
          next.endDate = '';
          next.preset = '';
        }
        state.filters = normalizeFilters(next);
        state.page = 1;
        renderList();
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
