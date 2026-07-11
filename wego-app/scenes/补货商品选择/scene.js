(function () {
  function ensureRuntime() {
    if (!window.__WEGO_RESTOCK_RUNTIME__) {
      window.__WEGO_RESTOCK_RUNTIME__ = {
        catalog: [],
        selectedIds: [],
        quantities: {},
        planStatus: '草稿',
        planErrors: {},
        showSaveSuccess: false,
        pickerDraftIds: [],
        pickerSearch: '',
        pickerFeedback: ''
      };
    }
    return window.__WEGO_RESTOCK_RUNTIME__;
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function ensureDraft(runtime) {
    if (!Array.isArray(runtime.pickerDraftIds)) {
      runtime.pickerDraftIds = runtime.selectedIds.slice();
    }
  }

  function isSelected(runtime, id) {
    return runtime.pickerDraftIds.indexOf(id) >= 0;
  }

  function filteredCatalog(runtime) {
    var keyword = String(runtime.pickerSearch || '').trim().toLowerCase();
    if (!keyword) return runtime.catalog.slice();
    return runtime.catalog.filter(function (item) {
      return item.title.toLowerCase().indexOf(keyword) >= 0 || item.id.toLowerCase().indexOf(keyword) >= 0;
    });
  }

  function checkboxMarkup(checked, disabled) {
    var className = 'checkbox checkbox--sm';
    if (checked) className += ' checkbox--checked';
    if (disabled) className += ' checkbox--disabled';
    return ''
      + '<div class="' + className + '">'
      +   '<div class="checkbox__inner"></div>'
      +   (checked ? '<div class="checkbox__icon"><img class="checkbox__asset" src="./lib/icons/checkbox-check.svg" alt=""></div>' : '')
      + '</div>';
  }

  function pickerRowMarkup(runtime, item, index, total) {
    var checked = isSelected(runtime, item.id);
    var limitReached = runtime.pickerDraftIds.length >= 5 && !checked;
    var divider = index === total - 1 ? '' : ' cell--divider-right-edge';
    return ''
      + '<button type="button" class="cell cell--double cell--bg-white cell--clickable' + divider + '" data-action="toggle-product" data-product-id="' + esc(item.id) + '">'
      +   '<div class="cell__body">'
      +     '<div class="cell__select">' + checkboxMarkup(checked, limitReached) + '</div>'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + esc(item.title) + '</span></div>'
      +       '<div class="cell__subtitle">商品 ID：' + esc(item.id) + ' · 当前库存 ' + esc(item.stock) + ' 件 · ' + esc(item.tag) + '</div>'
      +     '</div>'
      +     '<div class="cell__action">' + (limitReached ? '<span class="cell__action-text">已达上限</span>' : '') + '</div>'
      +   '</div>'
      + '</button>';
  }

  function pickerTemplate(runtime) {
    var list = filteredCatalog(runtime);
    var rows = list.map(function (item, index) {
      return pickerRowMarkup(runtime, item, index, list.length);
    }).join('');
    return ''
      + '<section class="restock-picker" data-bg="surface">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-btn" data-action="cancel" aria-label="返回">'
      +           '<i class="wego-iconfont-s icon-zuojiantou16"></i>'
      +         '</button>'
      +       '</div>'
      +       '<div class="navbar__center"><span class="navbar__title">补货商品选择</span></div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="restock-picker__toolbar">'
      +     '<div class="searchbox searchbox--md searchbox--gray">'
      +       '<span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>'
      +       '<div class="searchbox__input">'
      +         '<input class="searchbox__field" type="search" value="' + esc(runtime.pickerSearch) + '" placeholder="搜索商品名称或商品 ID" data-action="search-input" aria-label="搜索补货商品">'
      +       '</div>'
      +       '<div class="searchbox__actions">' + (runtime.pickerSearch ? '<button type="button" class="searchbox__action searchbox__clear wego-iconfont-s icon-yuancha-mian" data-action="clear-search" aria-label="清空搜索"></button>' : '') + '</div>'
      +     '</div>'
      +     '<div class="restock-picker__summary">'
      +       '<span class="badge badge--gray badge--md"><span class="badge__label">已选 ' + esc(runtime.pickerDraftIds.length) + '/5</span></span>'
      +       '<span class="restock-picker__summary-text">再次进入会恢复本次会话勾选，刷新后不保留</span>'
      +     '</div>'
      +     (runtime.pickerFeedback ? '<div class="restock-picker__feedback">' + esc(runtime.pickerFeedback) + '</div>' : '')
      +   '</div>'
      +   '<div class="restock-picker__body">'
      +     '<div class="cell-group">'
      +       '<div class="cell-group__content">' + (rows || '<div class="restock-picker__empty">没有找到匹配商品</div>') + '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="restock-picker__footer">'
      +     '<button type="button" class="btn btn--strong btn--lg restock-picker__complete" data-action="complete">完成</button>'
      +   '</div>'
      + '</section>';
  }

  function updateSelection(runtime, ctx, productId) {
    var index = runtime.pickerDraftIds.indexOf(productId);
    if (index >= 0) {
      runtime.pickerDraftIds.splice(index, 1);
      runtime.pickerFeedback = '';
      runtime.planStatus = '草稿';
      runtime.showSaveSuccess = false;
      return true;
    }
    if (runtime.pickerDraftIds.length >= 5) {
      runtime.pickerFeedback = '最多只能选择 5 个商品';
      ctx.toast('最多只能选择 5 个商品');
      return false;
    }
    runtime.pickerDraftIds.push(productId);
    runtime.pickerFeedback = '';
    runtime.planStatus = '草稿';
    runtime.showSaveSuccess = false;
    return true;
  }

  function commitSelection(runtime) {
    runtime.selectedIds = runtime.pickerDraftIds.slice();
    var nextQuantities = {};
    runtime.selectedIds.forEach(function (id) {
      nextQuantities[id] = runtime.quantities[id] == null ? '' : String(runtime.quantities[id]);
    });
    runtime.quantities = nextQuantities;
    runtime.planErrors = {};
    runtime.pickerFeedback = '';
    runtime.pickerSearch = '';
  }

  function cancelSelection(runtime) {
    runtime.pickerDraftIds = runtime.selectedIds.slice();
    runtime.pickerSearch = '';
    runtime.pickerFeedback = '';
  }

  function renderPicker(ctx) {
    var runtime = ensureRuntime();
    ensureDraft(runtime);
    ctx.root.innerHTML = pickerTemplate(runtime);
    bindPicker(ctx);
  }

  function bindPicker(ctx) {
    var runtime = ensureRuntime();
    var root = ctx.root;

    var cancelBtn = root.querySelector('[data-action="cancel"]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        cancelSelection(runtime);
        ctx.back();
      });
    }

    var searchInput = root.querySelector('[data-action="search-input"]');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        runtime.pickerSearch = searchInput.value;
        renderPicker(ctx);
      });
    }

    var clearSearch = root.querySelector('[data-action="clear-search"]');
    if (clearSearch) {
      clearSearch.addEventListener('click', function () {
        runtime.pickerSearch = '';
        renderPicker(ctx);
      });
    }

    root.querySelectorAll('[data-action="toggle-product"]').forEach(function (node) {
      node.addEventListener('click', function () {
        var changed = updateSelection(runtime, ctx, node.dataset.productId);
        if (changed) renderPicker(ctx);
      });
    });

    var completeBtn = root.querySelector('[data-action="complete"]');
    if (completeBtn) {
      completeBtn.addEventListener('click', function () {
        commitSelection(runtime);
        ctx.back();
      });
    }
  }

  window.WegoApp.registerScene({
    routeId: 'restock-product-picker',
    title: '补货商品选择',
    presentation: {
      type: 'push',
      transition: 'slide-left',
      coversTabBar: true
    },
    template: '',
    init: function (ctx) {
      var runtime = ensureRuntime();
      ensureDraft(runtime);
      renderPicker(ctx);
    }
  });
})();
