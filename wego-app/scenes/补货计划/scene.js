(function () {
  function ensureRuntime() {
    if (!window.__WEGO_RESTOCK_RUNTIME__) {
      window.__WEGO_RESTOCK_RUNTIME__ = {
        catalog: [
          { id: 'prd-201', title: '轻云通勤衬衫', stock: 12, tag: '近7天销量 28' },
          { id: 'prd-202', title: '雾感直筒半裙', stock: 6, tag: '近7天销量 19' },
          { id: 'prd-203', title: '奶油罗纹针织衫', stock: 22, tag: '近7天销量 16' },
          { id: 'prd-204', title: '山茶花短外套', stock: 4, tag: '近7天销量 31' },
          { id: 'prd-205', title: '轻羽阔腿牛仔裤', stock: 18, tag: '近7天销量 14' },
          { id: 'prd-206', title: '豆沙修身打底衫', stock: 9, tag: '近7天销量 22' },
          { id: 'prd-207', title: '晨雾百褶连衣裙', stock: 15, tag: '近7天销量 11' },
          { id: 'prd-208', title: '米白法式短针织', stock: 7, tag: '近7天销量 25' }
        ],
        selectedIds: [],
        quantities: {},
        planStatus: '草稿',
        planErrors: {},
        showSaveSuccess: false,
        pickerDraftIds: null,
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

  function getRuntimeProducts(runtime) {
    return runtime.selectedIds.map(function (id) {
      return runtime.catalog.find(function (item) { return item.id === id; });
    }).filter(Boolean);
  }

  function normalizePlan(runtime) {
    var keep = {};
    runtime.selectedIds.forEach(function (id) {
      keep[id] = runtime.quantities[id] == null ? '' : String(runtime.quantities[id]);
    });
    runtime.quantities = keep;
    Object.keys(runtime.planErrors).forEach(function (id) {
      if (!keep[id]) delete runtime.planErrors[id];
    });
  }

  function preparePickerDraft(runtime) {
    runtime.pickerDraftIds = runtime.selectedIds.slice();
    runtime.pickerSearch = '';
    runtime.pickerFeedback = '';
  }

  function validatePlan(runtime) {
    var errors = {};
    getRuntimeProducts(runtime).forEach(function (item) {
      var raw = String(runtime.quantities[item.id] == null ? '' : runtime.quantities[item.id]).trim();
      if (!raw) {
        errors[item.id] = '请填写补货数量';
        return;
      }
      if (!/^\d+$/.test(raw)) {
        errors[item.id] = '请输入 1-999 的整数';
        return;
      }
      var value = Number(raw);
      if (value <= 0) {
        errors[item.id] = '补货数量必须大于 0';
        return;
      }
      if (value > 999) {
        errors[item.id] = '补货数量不能超过 999';
      }
    });
    runtime.planErrors = errors;
    return Object.keys(errors).length === 0;
  }

  function statusBadgeMarkup(status) {
    var badgeClass = status === '待提交' ? 'badge badge--green badge--md' : 'badge badge--gray badge--md';
    return '<span class="' + badgeClass + '"><span class="badge__label">' + esc(status) + '</span></span>';
  }

  function emptyStateMarkup() {
    return ''
      + '<section class="card card--surface restock-plan__empty">'
      +   '<div class="card__content restock-plan__empty-content">'
      +     '<div class="restock-plan__empty-illustration"><i class="wego-iconfont-s icon-jiahao-mian"></i></div>'
      +     '<h2 class="restock-plan__empty-title">还没有补货商品</h2>'
      +     '<p class="restock-plan__empty-desc">先去补货商品选择页挑选商品，回来后再填写补货数量并保存计划。</p>'
      +     '<button type="button" class="btn btn--strong btn--lg" data-action="add-products">添加补货商品</button>'
      +   '</div>'
      + '</section>';
  }

  function itemCardMarkup(item, runtime) {
    var value = runtime.quantities[item.id] == null ? '' : String(runtime.quantities[item.id]);
    var error = runtime.planErrors[item.id] || '';
    var numberClass = 'number-input number-input--surface-white' + (error ? ' is-error' : '');
    return ''
      + '<article class="card card--surface restock-plan__item-card" data-product-id="' + esc(item.id) + '">'
      +   '<div class="card__content">'
      +     '<div class="restock-plan__item-head">'
      +       '<div>'
      +         '<div class="restock-plan__item-title">' + esc(item.title) + '</div>'
      +         '<div class="restock-plan__item-meta">商品 ID：' + esc(item.id) + '</div>'
      +       '</div>'
      +       '<span class="restock-plan__item-tag">' + esc(item.tag) + '</span>'
      +     '</div>'
      +     '<div class="restock-plan__item-stock">当前库存 ' + esc(item.stock) + ' 件</div>'
      +     '<div class="restock-plan__qty-row">'
      +       '<div class="restock-plan__qty-label">补货数量</div>'
      +       '<div class="' + numberClass + '">'
      +         '<input class="number-input__field" type="text" inputmode="numeric" placeholder="请输入" value="' + esc(value) + '" data-quantity-id="' + esc(item.id) + '" aria-label="' + esc(item.title) + '补货数量">'
      +         '<span class="number-input__suffix">件</span>'
      +       '</div>'
      +     '</div>'
      +     (error ? '<div class="restock-plan__field-error">' + esc(error) + '</div>' : '')
      +   '</div>'
      + '</article>';
  }

  function planTemplate(runtime) {
    var products = getRuntimeProducts(runtime);
    var cards = products.map(function (item) {
      return itemCardMarkup(item, runtime);
    }).join('');
    var contentMarkup = products.length
      ? ''
        + '<div class="restock-plan__list">' + cards + '</div>'
        + '<button type="button" class="btn btn--weak btn--lg restock-plan__secondary-btn" data-action="add-products">继续添加商品</button>'
        + '<button type="button" class="btn btn--strong btn--lg restock-plan__primary-btn" data-action="save-plan">保存补货计划</button>'
      : emptyStateMarkup();
    return ''
      + '<section class="restock-plan" data-bg="page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-btn" data-action="back" aria-label="返回">'
      +           '<i class="wego-iconfont-s icon-zuojiantou16"></i>'
      +         '</button>'
      +       '</div>'
      +       '<div class="navbar__center"><span class="navbar__title">补货计划</span></div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="restock-plan__body">'
      +     '<section class="card card--surface restock-plan__summary">'
      +       '<div class="card__content restock-plan__summary-content">'
      +         '<div>'
      +           '<div class="restock-plan__summary-eyebrow">临时补货计划</div>'
      +           '<div class="restock-plan__summary-text">已选 ' + esc(products.length) + ' / 5 个商品</div>'
      +         '</div>'
      +         '<div class="restock-plan__summary-status">' + statusBadgeMarkup(runtime.planStatus) + '</div>'
      +       '</div>'
      +     '</section>'
      +     (runtime.showSaveSuccess ? '<div class="restock-plan__success">计划已保存，当前状态已更新为待提交。</div>' : '')
      +     contentMarkup
      +   '</div>'
      + '</section>';
  }

  function renderPlan(ctx) {
    var runtime = ensureRuntime();
    normalizePlan(runtime);
    ctx.root.innerHTML = planTemplate(runtime);
    bindPlan(ctx);
  }

  function bindPlan(ctx) {
    var runtime = ensureRuntime();
    var root = ctx.root;

    var backBtn = root.querySelector('[data-action="back"]');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        ctx.back();
      });
    }

    root.querySelectorAll('[data-action="add-products"]').forEach(function (node) {
      node.addEventListener('click', function () {
        preparePickerDraft(runtime);
        ctx.navigate('restock-product-picker');
      });
    });

    root.querySelectorAll('[data-quantity-id]').forEach(function (input) {
      input.addEventListener('input', function () {
        var id = input.dataset.quantityId;
        var raw = input.value.replace(/[^\d-]/g, '');
        var negative = raw.charAt(0) === '-';
        var digits = raw.replace(/-/g, '').slice(0, 4);
        var sanitized = negative ? '-' + digits : digits;
        input.value = sanitized;
        runtime.quantities[id] = sanitized;
        runtime.planStatus = '草稿';
        runtime.showSaveSuccess = false;
        delete runtime.planErrors[id];
      });
    });

    var saveBtn = root.querySelector('[data-action="save-plan"]');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        if (!validatePlan(runtime)) {
          runtime.showSaveSuccess = false;
          renderPlan(ctx);
          return;
        }

        ctx.dialog({
          variant: 'title',
          title: '确认保存补货计划？',
          content: '确认后会把当前计划保存为待提交状态。',
          buttons: [
            { label: '取消', tone: 'dismiss' },
            {
              label: '确认保存',
              tone: 'confirm',
              onClick: function () {
                runtime.planStatus = '待提交';
                runtime.showSaveSuccess = true;
                runtime.planErrors = {};
                renderPlan(ctx);
                ctx.toast('补货计划已保存');
              }
            }
          ]
        });
      });
    }
  }

  window.WegoApp.registerScene({
    routeId: 'restock-plan',
    title: '补货计划',
    presentation: {
      type: 'push',
      transition: 'slide-left',
      coversTabBar: true
    },
    template: '',
    init: function (ctx) {
      ensureRuntime();
      renderPlan(ctx);
    }
  });
})();
