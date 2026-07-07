(function () {
  var TYPE_OPTIONS = ['直营网仓', '门店仓', '同城前置仓', '直播备货仓'];
  var SERVICE_SCOPE_OPTIONS = ['全国快递', '同城配送', '门店自提', '多渠道履约'];
  var SHIPPING_AGING_OPTIONS = ['24小时内发货', '当日发货', '次日发货', '48小时内发货'];
  var TEMP_OPTIONS = ['常温', '冷藏', '冷冻', '混合温层'];
  var COVER_TONES = ['green', 'blue', 'orange', 'purple'];

  var STATE = {
    openMenuId: '',
    warehouses: [
      {
        id: 'wh-001',
        name: '杭州主仓',
        code: 'HZ-MAIN-01',
        manager: '林小满',
        phone: '13800138000',
        address: '浙江省杭州市余杭区五常街道文一西路 998 号 2 栋 1 层',
        locationNote: '靠近西门，适合同城快单发货',
        imageUrl: '',
        type: '直营网仓',
        serviceScope: '多渠道履约',
        shippingAging: '24小时内发货',
        tempLevel: '常温',
        supportSameCity: true,
        supportPickup: false,
        supportLive: true,
        isDefault: true,
        lockReservedStock: true,
        allowTransfer: true,
        enabled: true,
        safetyStock: 20,
        dailyCapacity: 1800,
        remark: '承担微信小店和视频号的大部分订单发货'
      },
      {
        id: 'wh-002',
        name: '广州直播备货仓',
        code: 'GZ-LIVE-03',
        manager: '周泽',
        phone: '13911223344',
        address: '广东省广州市白云区石井街道庆丰一路 66 号 A3 仓',
        locationNote: '直播场次前 2 小时优先配货',
        imageUrl: '',
        type: '直播备货仓',
        serviceScope: '同城配送',
        shippingAging: '当日发货',
        tempLevel: '混合温层',
        supportSameCity: true,
        supportPickup: false,
        supportLive: true,
        isDefault: false,
        lockReservedStock: true,
        allowTransfer: true,
        enabled: true,
        safetyStock: 12,
        dailyCapacity: 960,
        remark: '重点服务直播间爆款与临时补货'
      },
      {
        id: 'wh-003',
        name: '苏州门店仓',
        code: 'SZ-STORE-08',
        manager: '陈雨桐',
        phone: '13799887766',
        address: '江苏省苏州市工业园区星湖街 88 号首层后仓',
        locationNote: '支持顾客门店自提与临时调拨',
        imageUrl: '',
        type: '门店仓',
        serviceScope: '门店自提',
        shippingAging: '次日发货',
        tempLevel: '常温',
        supportSameCity: false,
        supportPickup: true,
        supportLive: false,
        isDefault: false,
        lockReservedStock: false,
        allowTransfer: false,
        enabled: true,
        safetyStock: 8,
        dailyCapacity: 320,
        remark: '适合华东区域自提订单与门店展示样品'
      }
    ]
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createWarehouseIllustration(name, tone) {
    var palette = {
      green: { start: '#03c160', end: '#8be3b7', plate: '#dff9ec' },
      blue: { start: '#208bf1', end: '#9fd0ff', plate: '#e8f3ff' },
      orange: { start: '#fa9d3b', end: '#ffd38f', plate: '#fff2de' },
      purple: { start: '#6367f0', end: '#c4c6ff', plate: '#f0f0ff' }
    };
    var colors = palette[tone] || palette.green;
    var label = (name || '仓库').slice(0, 4);
    var svg = ''
      + '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120">'
      + '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">'
      + '<stop offset="0%" stop-color="' + colors.start + '"/>'
      + '<stop offset="100%" stop-color="' + colors.end + '"/>'
      + '</linearGradient></defs>'
      + '<rect width="160" height="120" rx="18" fill="url(#bg)"/>'
      + '<rect x="16" y="70" width="128" height="26" rx="10" fill="' + colors.plate + '" opacity="0.92"/>'
      + '<rect x="26" y="44" width="108" height="28" rx="10" fill="rgba(255,255,255,0.20)"/>'
      + '<path d="M40 42 L80 20 L120 42 L120 48 L40 48 Z" fill="rgba(255,255,255,0.32)"/>'
      + '<rect x="70" y="56" width="20" height="30" rx="6" fill="rgba(255,255,255,0.92)"/>'
      + '<text x="80" y="88" text-anchor="middle" font-size="12" font-family="PingFang SC, Arial" fill="#1e2028">' + esc(label) + '</text>'
      + '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function getWarehouseCover(item, index) {
    if (item.imageUrl && String(item.imageUrl).trim()) {
      return String(item.imageUrl).trim();
    }
    return createWarehouseIllustration(item.name, COVER_TONES[index % COVER_TONES.length]);
  }

  function cloneWarehouse(item) {
    return JSON.parse(JSON.stringify(item));
  }

  function createDraft(item) {
    var base = item ? cloneWarehouse(item) : {
      id: '',
      name: '',
      code: '',
      manager: '',
      phone: '',
      address: '',
      locationNote: '',
      imageUrl: '',
      type: TYPE_OPTIONS[0],
      serviceScope: SERVICE_SCOPE_OPTIONS[3],
      shippingAging: SHIPPING_AGING_OPTIONS[0],
      tempLevel: TEMP_OPTIONS[0],
      supportSameCity: true,
      supportPickup: false,
      supportLive: false,
      isDefault: false,
      lockReservedStock: true,
      allowTransfer: false,
      enabled: true,
      safetyStock: 10,
      dailyCapacity: 500,
      remark: ''
    };
    return base;
  }

  function cycleValue(current, options) {
    var index = options.indexOf(current);
    return options[(index + 1 + options.length) % options.length];
  }

  function getListSummary(item) {
    return [item.serviceScope, item.shippingAging].filter(Boolean).join(' · ');
  }

  function warehouseCardMarkup(item, index) {
    var cover = getWarehouseCover(item, index);
    var statusLabel = item.enabled ? '启用中' : '已停用';
    var statusClass = item.enabled ? 'is-enabled' : 'is-disabled';
    var menuOpen = STATE.openMenuId === item.id;
    var badges = [
      item.isDefault ? '<span class="warehouse-card__badge is-highlight">默认发货仓</span>' : '',
      '<span class="warehouse-card__badge ' + statusClass + '">' + esc(statusLabel) + '</span>'
    ].join('');
    var menu = menuOpen
      ? ''
        + '<div class="warehouse-action-menu" role="menu" aria-label="' + esc(item.name) + '操作">'
        +   '<button type="button" class="warehouse-action-menu__item" data-action="menu-edit" data-warehouse-id="' + esc(item.id) + '" role="menuitem">编辑</button>'
        +   '<button type="button" class="warehouse-action-menu__item warehouse-action-menu__item--danger" data-action="menu-delete" data-warehouse-id="' + esc(item.id) + '" role="menuitem">删除</button>'
        + '</div>'
      : '';

    return ''
      + '<article class="card card--surface warehouse-list__card" data-warehouse-id="' + esc(item.id) + '">'
      +   '<div class="card__content warehouse-card">'
      +     '<div class="wg-image wg-image--rounded-md warehouse-card__image">'
      +       '<img class="wg-image__src is-loaded" src="' + esc(cover) + '" alt="' + esc(item.name) + '图片" />'
      +     '</div>'
      +     '<div class="warehouse-card__main">'
      +       '<div class="warehouse-card__top">'
      +         '<h3 class="warehouse-card__title">' + esc(item.name) + '</h3>'
      +         '<div class="warehouse-card__actions">'
      +           '<button type="button" class="warehouse-card__more" data-action="toggle-menu" data-warehouse-id="' + esc(item.id) + '" aria-label="' + esc(item.name) + '更多操作" aria-expanded="' + (menuOpen ? 'true' : 'false') + '"><i class="wego-iconfont-s icon-sandian16"></i></button>'
      +           menu
      +         '</div>'
      +       '</div>'
      +       '<div class="warehouse-card__badges">' + badges + '</div>'
      +       '<p class="warehouse-card__summary">' + esc(getListSummary(item)) + '</p>'
      +     '</div>'
      +   '</div>'
      + '</article>';
  }

  function warehouseListTemplate() {
    var cards = STATE.warehouses.map(function (item, index) {
      return warehouseCardMarkup(item, index);
    }).join('');

    var empty = ''
      + '<section class="warehouse-empty">'
      +   '<div class="warehouse-empty__icon"><i class="wego-iconfont-s icon-jiahao-mian"></i></div>'
      +   '<div class="warehouse-empty__title">还没有仓库</div>'
      +   '<div class="warehouse-empty__desc">先新增一个仓库，后面才能继续做库存、配货和履约管理。</div>'
      +   '<button type="button" class="btn btn--strong btn--md" data-action="create-first">新增仓库</button>'
      + '</section>';

    return ''
      + '<section class="warehouse-page" data-bg="page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body navbar__body--spaced">'
      +       '<div class="navbar__left">'
      +         '<div class="navbar__left-btn" data-action="back" role="button" aria-label="返回"><i class="wego-iconfont-s icon-fanhui"></i></div>'
      +       '</div>'
      +       '<div class="navbar__center"><span class="navbar__title">仓库管理</span></div>'
      +       '<div class="navbar__right navbar__right--icon">'
      +         '<button type="button" class="navbar__action" data-action="create" aria-label="新建仓库">'
      +           '<div class="navbar__action-icon"><i class="wego-iconfont-s icon-jia16"></i></div>'
      +           '<span class="navbar__action-label">新建</span>'
      +         '</button>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="warehouse-page__body">'
      +     '<section class="warehouse-page__summary">'
      +       '<div class="warehouse-page__summary-title">已接入仓库 ' + esc(STATE.warehouses.length) + ' 个</div>'
      +       '<div class="warehouse-page__summary-text">启用中 ' + esc(STATE.warehouses.filter(function (item) { return item.enabled; }).length) + ' 个，默认发货仓 ' + esc(STATE.warehouses.filter(function (item) { return item.isDefault; }).length) + ' 个</div>'
      +     '</section>'
      +     '<div class="warehouse-list">'
      +       (STATE.warehouses.length ? cards : empty)
      +     '</div>'
      +   '</div>'
      + '</section>';
  }

  function buildFormInput(label, key, value, placeholder, options) {
    options = options || {};
    var type = options.type || 'text';
    var extraAttrs = options.inputmode ? ' inputmode="' + esc(options.inputmode) + '"' : '';
    var maxLength = options.maxLength ? ' maxlength="' + esc(options.maxLength) + '"' : '';
    return ''
      + '<div class="form-body">'
      +   '<div class="form-body__label">' + esc(label) + '</div>'
      +   '<div class="form-body__action">'
      +     '<input type="' + esc(type) + '" value="' + esc(value) + '" placeholder="' + esc(placeholder) + '" data-field="' + esc(key) + '"' + extraAttrs + maxLength + '>'
      +   '</div>'
      + '</div>';
  }

  function buildPhoneInput(label, key, value) {
    return ''
      + '<div class="form-body form-body--preserve-content-align">'
      +   '<div class="form-body__label">' + esc(label) + '</div>'
      +   '<div class="form-body__action">'
      +     '<div class="form-body__phone">'
      +       '<span class="form-body__phone-prefix">+86</span>'
      +       '<span class="form-body__phone-divider" aria-hidden="true"></span>'
      +       '<input class="form-body__phone-input" type="text" inputmode="numeric" maxlength="11" value="' + esc(value) + '" placeholder="请输入联系电话" data-field="' + esc(key) + '">'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function buildTextarea(label, key, value, placeholder, rowsClass) {
    return ''
      + '<div class="form-body form-body--vertical' + (rowsClass ? ' ' + rowsClass : '') + '">'
      +   '<div class="form-body__label">' + esc(label) + '</div>'
      +   '<div class="form-body__action">'
      +     '<textarea data-field="' + esc(key) + '" placeholder="' + esc(placeholder) + '">' + esc(value) + '</textarea>'
      +   '</div>'
      + '</div>';
  }

  function buildNumberInput(label, key, value, suffix, isLast) {
    return ''
      + '<div class="form-body' + (isLast ? '' : '') + '">'
      +   '<div class="form-body__label">' + esc(label) + '</div>'
      +   '<div class="form-body__action">'
      +     '<div class="number-input number-input--surface-white">'
      +       '<input class="number-input__field" type="text" inputmode="numeric" value="' + esc(value) + '" placeholder="请输入" data-number-field="' + esc(key) + '">'
      +       '<span class="number-input__suffix">' + esc(suffix) + '</span>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function buildSelectRow(label, key, value, isLast) {
    return ''
      + '<button type="button" class="cell cell--single cell--bg-white cell--clickable' + (isLast ? '' : ' cell--divider-right-edge') + '" data-cycle-key="' + esc(key) + '">'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + esc(label) + '</span></div>'
      +     '</div>'
      +     '<div class="cell__action">'
      +       '<span class="cell__action-text">' + esc(value) + '</span>'
      +       '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>'
      +     '</div>'
      +   '</div>'
      + '</button>';
  }

  function buildSwitchRow(label, key, value, isLast) {
    return ''
      + '<div class="cell cell--single cell--bg-white' + (isLast ? '' : ' cell--divider-right-edge') + '">'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + esc(label) + '</span></div>'
      +     '</div>'
      +     '<div class="cell__action">'
      +       '<div class="switch ' + (value ? 'switch--on' : 'switch--off') + '" data-switch-key="' + esc(key) + '" role="switch" aria-checked="' + (value ? 'true' : 'false') + '" tabindex="0">'
      +         '<div class="switch__thumb"></div>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function buildFormSwitchRow(label, key, value) {
    return ''
      + '<div class="form-body form-body--preserve-content-align">'
      +   '<div class="form-body__label">' + esc(label) + '</div>'
      +   '<div class="form-body__action" aria-hidden="true"></div>'
      +   '<div class="form-body__right-btn">'
      +     '<div class="switch ' + (value ? 'switch--on' : 'switch--off') + '" data-switch-key="' + esc(key) + '" role="switch" aria-checked="' + (value ? 'true' : 'false') + '" tabindex="0">'
      +       '<div class="switch__thumb"></div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function editorTemplate(draft, mode) {
    var title = mode === 'edit' ? '编辑仓库' : '新增仓库';
    var cover = draft.imageUrl && draft.imageUrl.trim()
      ? draft.imageUrl.trim()
      : createWarehouseIllustration(draft.name || '新仓库', COVER_TONES[1]);

    return ''
      + '<section class="warehouse-editor" data-bg="page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body navbar__body--spaced">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-text" data-action="cancel">取消</button>'
      +       '</div>'
      +       '<div class="navbar__center"><span class="navbar__title">' + esc(title) + '</span></div>'
      +       '<div class="navbar__right navbar__right--button">'
      +         '<button type="button" class="btn btn--strong btn--sm" data-action="save">保存</button>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="warehouse-editor__body">'
      +     '<div class="form-group">'
      +       '<div class="form-group__title">仓库状态</div>'
      +       '<div class="form-group__content">'
      +         buildFormSwitchRow('启用仓库', 'enabled', draft.enabled)
      +         buildFormSwitchRow('默认发货仓', 'isDefault', draft.isDefault)
      +       '</div>'
      +     '</div>'
      +     '<div class="form-group">'
      +       '<div class="form-group__title">基础信息</div>'
      +       '<div class="form-group__content">'
      +         buildFormInput('仓库名称', 'name', draft.name, '例如：杭州主仓')
      +         buildFormInput('仓库编码', 'code', draft.code, '例如：HZ-MAIN-01')
      +         buildFormInput('仓库联系人', 'manager', draft.manager, '请输入联系人')
      +         buildPhoneInput('联系电话', 'phone', draft.phone)
      +         buildTextarea('仓库地址', 'address', draft.address, '请输入详细地址')
      +         buildFormInput('定位备注', 'locationNote', draft.locationNote, '例如：靠近西门，方便提货')
      +         '<div class="form-body form-body--vertical">'
      +           '<div class="form-body__label">门头图链接</div>'
      +           '<div class="form-body__action">'
      +             '<div class="warehouse-editor__cover-field">'
      +               '<div class="wg-image wg-image--rounded-lg warehouse-editor__cover">'
      +                 '<img class="wg-image__src is-loaded" src="' + esc(cover) + '" alt="' + esc(title) + '预览图" />'
      +               '</div>'
      +               '<input type="text" value="' + esc(draft.imageUrl) + '" placeholder="可粘贴图片链接，留空将使用示意图" data-field="imageUrl">'
      +               '<div class="warehouse-editor__cover-tip">留空时自动用示意图补位，列表里也会正常显示仓库图片。</div>'
      +             '</div>'
      +           '</div>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="cell-group">'
      +       '<div class="cell-group__title">履约能力</div>'
      +       '<div class="cell-group__content">'
      +         buildSelectRow('仓库类型', 'type', draft.type, false)
      +         buildSelectRow('服务范围', 'serviceScope', draft.serviceScope, false)
      +         buildSwitchRow('支持同城配送', 'supportSameCity', draft.supportSameCity, false)
      +         buildSwitchRow('支持门店自提', 'supportPickup', draft.supportPickup, false)
      +         buildSwitchRow('支持直播备货', 'supportLive', draft.supportLive, true)
      +       '</div>'
      +     '</div>'
      +     '<div class="form-group">'
      +       '<div class="form-group__title">库存与发货</div>'
      +       '<div class="form-group__content">'
      +         buildNumberInput('安全库存', 'safetyStock', draft.safetyStock, '件')
      +         buildNumberInput('单日上限', 'dailyCapacity', draft.dailyCapacity, '单')
      +         '<div class="form-body form-body--clickable" data-cycle-key="shippingAging">'
      +           '<div class="form-body__label">发货时效</div>'
      +           '<div class="form-body__action">'
      +             '<div class="form-body__select">'
      +               '<span class="form-body__select-text has-value">' + esc(draft.shippingAging) + '</span>'
      +               '<i class="form-body__select-arrow wego-iconfont-s icon-youjiantou16"></i>'
      +             '</div>'
      +           '</div>'
      +         '</div>'
      +         '<div class="form-body form-body--clickable" data-cycle-key="tempLevel">'
      +           '<div class="form-body__label">温层要求</div>'
      +           '<div class="form-body__action">'
      +             '<div class="form-body__select">'
      +               '<span class="form-body__select-text has-value">' + esc(draft.tempLevel) + '</span>'
      +               '<i class="form-body__select-arrow wego-iconfont-s icon-youjiantou16"></i>'
      +             '</div>'
      +           '</div>'
      +         '</div>'
      +         '<div class="form-body">'
      +           '<div class="form-body__label">锁定预占库存</div>'
      +           '<div class="form-body__right-btn">'
      +             '<div class="switch ' + (draft.lockReservedStock ? 'switch--on' : 'switch--off') + '" data-switch-key="lockReservedStock" role="switch" aria-checked="' + (draft.lockReservedStock ? 'true' : 'false') + '" tabindex="0">'
      +               '<div class="switch__thumb"></div>'
      +             '</div>'
      +           '</div>'
      +         '</div>'
      +         '<div class="form-body">'
      +           '<div class="form-body__label">跨区域调拨</div>'
      +           '<div class="form-body__right-btn">'
      +             '<div class="switch ' + (draft.allowTransfer ? 'switch--on' : 'switch--off') + '" data-switch-key="allowTransfer" role="switch" aria-checked="' + (draft.allowTransfer ? 'true' : 'false') + '" tabindex="0">'
      +               '<div class="switch__thumb"></div>'
      +             '</div>'
      +           '</div>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="form-group">'
      +       '<div class="form-group__title">补充信息</div>'
      +       '<div class="form-group__content">'
      +         buildTextarea('仓库备注', 'remark', draft.remark, '补充说明仓库适用场景、拣货提示或客服同步口径')
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</section>';
  }

  function sanitizeDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function findWarehouse(id) {
    return STATE.warehouses.find(function (item) { return item.id === id; }) || null;
  }

  function validateDraft(draft, overlayCtx) {
    if (!draft.name.trim()) {
      overlayCtx.toast('请先填写仓库名称');
      return false;
    }
    if (!draft.manager.trim()) {
      overlayCtx.toast('请先填写仓库联系人');
      return false;
    }
    if (!/^1\d{10}$/.test(draft.phone)) {
      overlayCtx.toast('联系电话需要填写 11 位手机号');
      return false;
    }
    if (!draft.address.trim()) {
      overlayCtx.toast('请先填写仓库地址');
      return false;
    }
    return true;
  }

  function persistWarehouse(draft, mode) {
    var record = cloneWarehouse(draft);
    if (!record.id) {
      record.id = 'wh-' + Date.now();
    }

    if (record.isDefault) {
      STATE.warehouses.forEach(function (item) {
        item.isDefault = false;
      });
    }

    if (mode === 'edit') {
      STATE.warehouses = STATE.warehouses.map(function (item) {
        return item.id === record.id ? record : item;
      });
      return '仓库已更新';
    }

    STATE.warehouses.unshift(record);
    return '仓库已新增';
  }

  function bindDraftInputs(root, draft) {
    root.querySelectorAll('[data-field]').forEach(function (node) {
      var key = node.dataset.field;
      var handler = function () {
        draft[key] = node.value;
      };
      node.addEventListener('input', handler);
      node.addEventListener('change', handler);
    });

    root.querySelectorAll('[data-number-field]').forEach(function (node) {
      var key = node.dataset.numberField;
      node.addEventListener('input', function () {
        var sanitized = sanitizeDigits(node.value);
        node.value = sanitized;
        draft[key] = sanitized ? Number(sanitized) : 0;
      });
      node.addEventListener('blur', function () {
        if (node.value === '') {
          node.value = '0';
          draft[key] = 0;
        }
      });
    });

    var phoneInput = root.querySelector('[data-field="phone"]');
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        var sanitized = sanitizeDigits(phoneInput.value).slice(0, 11);
        phoneInput.value = sanitized;
        draft.phone = sanitized;
      });
    }
  }

  function openWarehouseEditor(ctx, mode, warehouseId) {
    var current = warehouseId ? findWarehouse(warehouseId) : null;
    var draft = createDraft(current);
    var originalSnapshot = JSON.stringify(draft);

    ctx.openFullScreenModal('', {
      label: mode === 'edit' ? '编辑仓库' : '新增仓库',
      init: function (overlayCtx) {
        function renderEditor() {
          overlayCtx.root.innerHTML = editorTemplate(draft, mode);
          bindEditor();
        }

        function handleCycle(key) {
          if (key === 'type') draft.type = cycleValue(draft.type, TYPE_OPTIONS);
          if (key === 'serviceScope') draft.serviceScope = cycleValue(draft.serviceScope, SERVICE_SCOPE_OPTIONS);
          if (key === 'shippingAging') draft.shippingAging = cycleValue(draft.shippingAging, SHIPPING_AGING_OPTIONS);
          if (key === 'tempLevel') draft.tempLevel = cycleValue(draft.tempLevel, TEMP_OPTIONS);
          renderEditor();
        }

        function bindEditor() {
          var root = overlayCtx.root;

          bindDraftInputs(root, draft);

          function isDirty() {
            return JSON.stringify(draft) !== originalSnapshot;
          }

          function updateSwitchNode(node, value) {
            if (!node) return;
            node.classList.toggle('switch--on', Boolean(value));
            node.classList.toggle('switch--off', !value);
            node.setAttribute('aria-checked', value ? 'true' : 'false');
          }

          function requestCancel() {
            if (!isDirty()) {
              overlayCtx.close();
              return;
            }
            overlayCtx.dialog({
              variant: 'text',
              title: '放弃未保存内容？',
              content: '当前修改还没有保存，放弃后不会保留。',
              buttons: [
                { label: '继续编辑', tone: 'dismiss' },
                {
                  label: '放弃',
                  tone: 'danger',
                  onClick: function () {
                    overlayCtx.close();
                  }
                }
              ]
            });
          }

          var cancelBtn = root.querySelector('[data-action="cancel"]');
          if (cancelBtn) {
            cancelBtn.addEventListener('click', requestCancel);
          }

          var saveBtn = root.querySelector('[data-action="save"]');
          if (saveBtn) {
            saveBtn.addEventListener('click', function () {
              draft.name = String(draft.name || '').trim();
              draft.code = String(draft.code || '').trim();
              draft.manager = String(draft.manager || '').trim();
              draft.phone = sanitizeDigits(draft.phone).slice(0, 11);
              draft.address = String(draft.address || '').trim();
              draft.locationNote = String(draft.locationNote || '').trim();
              draft.imageUrl = String(draft.imageUrl || '').trim();
              draft.remark = String(draft.remark || '').trim();

              if (!validateDraft(draft, overlayCtx)) return;

              var message = persistWarehouse(draft, mode);
              overlayCtx.close();
              renderWarehousePage();
              ctx.toast(message);
            });
          }

          root.querySelectorAll('[data-cycle-key]').forEach(function (node) {
            node.addEventListener('click', function () {
              handleCycle(node.dataset.cycleKey);
            });
          });

          root.querySelectorAll('[data-switch-key]').forEach(function (node) {
            var toggle = function () {
              var key = node.dataset.switchKey;
              draft[key] = !draft[key];
              if (key === 'isDefault' && draft.isDefault) {
                draft.enabled = true;
              }
              if (key === 'enabled' && !draft.enabled) {
                draft.isDefault = false;
              }
              updateSwitchNode(node, draft[key]);
              if (key !== 'enabled') updateSwitchNode(root.querySelector('[data-switch-key="enabled"]'), draft.enabled);
              if (key !== 'isDefault') updateSwitchNode(root.querySelector('[data-switch-key="isDefault"]'), draft.isDefault);
            };
            node.addEventListener('click', toggle);
            node.addEventListener('keydown', function (event) {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle();
              }
            });
          });
        }

        renderEditor();
      }
    });
  }

  function confirmDelete(ctx, warehouseId) {
    var current = findWarehouse(warehouseId);
    if (!current) return;

    ctx.dialog({
      variant: 'text',
      title: '确认删除仓库？',
      content: '删除“' + esc(current.name) + '”后，后续新建单据将无法再选到它。',
      buttons: [
        { label: '取消', tone: 'dismiss' },
        {
          label: '删除',
          tone: 'danger',
          onClick: function () {
            STATE.warehouses = STATE.warehouses.filter(function (item) {
              return item.id !== warehouseId;
            });
            renderWarehousePage();
            ctx.toast('仓库已删除');
          }
        }
      ]
    });
  }

  function bindWarehousePage(ctx) {
    var root = ctx.root;
    if (root.dataset.warehouseBound === 'true') return;
    root.dataset.warehouseBound = 'true';
    root.addEventListener('click', function (event) {
      var node = event.target.closest('[data-action]');
      if (!node) {
        if (STATE.openMenuId) {
          STATE.openMenuId = '';
          renderWarehousePage();
        }
        return;
      }

      var action = node.dataset.action;
      var warehouseId = node.dataset.warehouseId;

      if (action === 'back') {
        STATE.openMenuId = '';
        ctx.back();
        return;
      }

      if (action === 'create' || action === 'create-first') {
        STATE.openMenuId = '';
        openWarehouseEditor(ctx, 'create');
        return;
      }

      if (action === 'toggle-menu') {
        STATE.openMenuId = STATE.openMenuId === warehouseId ? '' : warehouseId;
        renderWarehousePage();
        return;
      }

      if (action === 'menu-edit') {
        STATE.openMenuId = '';
        renderWarehousePage();
        openWarehouseEditor(ctx, 'edit', warehouseId);
        return;
      }

      if (action === 'menu-delete') {
        STATE.openMenuId = '';
        renderWarehousePage();
        confirmDelete(ctx, warehouseId);
      }
    });
  }

  function renderWarehousePage() {
    if (!window.__wegoWarehouseRoot) return;
    window.__wegoWarehouseRoot.innerHTML = warehouseListTemplate();
    bindWarehousePage(window.__wegoWarehouseCtx);
  }

  window.WegoApp.registerScene({
    routeId: 'my-warehouse-management',
    title: '仓库管理',
    presentation: {
      type: 'push',
      transition: 'slide-left',
      coversTabBar: true
    },
    template: '',
    init: function (ctx) {
      window.__wegoWarehouseRoot = ctx.root;
      window.__wegoWarehouseCtx = ctx;
      renderWarehousePage();
    }
  });
})();
