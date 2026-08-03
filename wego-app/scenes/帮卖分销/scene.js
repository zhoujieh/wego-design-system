(function () {
  'use strict';

  // ── 场景样例数据 ──
  // 商品图片和标题取自 window.WEGO_PROTOTYPE_DB,帮卖配置为场景特定样例数据
  var SCENE_SAMPLES = [
    {
      key: 'first-resale-free-single',
      label: '初次帮卖 · 自由定价 · 单一价格',
      group: '自由定价',
      badge: { text: '自由定价', type: 'free' },
      desc: '供货价100 · 默认加价+100 · 单一价格',
      product_id: 'prod-clothing-001',
      distribution_type: 1,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: false,
      from_page: 'normal'
    },
    {
      key: 'first-resale-free-range',
      label: '初次帮卖 · 自由定价 · 区间价格',
      group: '自由定价',
      badge: { text: '区间价', type: 'free' },
      desc: 'SKU供货价80/100/120 · 区间80~120',
      product_id: 'prod-clothing-002',
      distribution_type: 1,
      supply_price: [80, 120],
      skus: [
        { id: 'sku-1', supply_price: 80 },
        { id: 'sku-2', supply_price: 100 },
        { id: 'sku-3', supply_price: 120 }
      ],
      distribution_config: { amountType: 2, rate: 0.3 },
      my_item: false,
      from_page: 'normal'
    },
    {
      key: 'edit-free-single',
      label: '编辑 · 自由定价',
      group: '编辑',
      badge: { text: '编辑', type: 'free' },
      desc: '回显售价150 · 加价+50',
      product_id: 'prod-clothing-003',
      distribution_type: 1,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: true,
      current_price: 150,
      current_add_price_type: 1,
      current_add_price_value: 50,
      from_page: 'normal'
    },
    {
      key: 'edit-fixed-rebate',
      label: '编辑 · 固定佣金',
      group: '编辑',
      badge: { text: '固定佣金', type: 'fixed' },
      desc: '售价200 · 佣金100 · 只读',
      product_id: 'prod-clothing-005',
      distribution_type: 2,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: true,
      current_price: 200,
      commission: 100,
      from_page: 'normal'
    },
    {
      key: 'live-room-free',
      label: '直播间 · 自由定价',
      group: '直播间',
      badge: { text: '直播', type: 'live' },
      desc: '同初次帮卖 · 来源直播间 · 遮罩可关',
      product_id: 'prod-clothing-006',
      distribution_type: 1,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: false,
      from_page: 'live'
    },
    {
      key: 'live-room-fixed',
      label: '直播间 · 固定佣金',
      group: '直播间',
      badge: { text: '直播', type: 'live' },
      desc: '固定佣金 · 底部仅"我知道了"',
      product_id: 'prod-clothing-007',
      distribution_type: 2,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: false,
      current_price: 200,
      commission: 100,
      from_page: 'live'
    },
    {
      key: 'wholesale-hidden',
      label: '批发价隐藏',
      group: '异常',
      badge: { text: '异常', type: 'error' },
      desc: '批发价被隐藏 · 模态框确认公开',
      product_id: 'prod-clothing-008',
      distribution_type: 1,
      supply_price: null,
      error_code: 'wholesale_hidden',
      from_page: 'normal'
    },
    {
      key: 'all-price-hidden',
      label: '所有价格隐藏',
      group: '异常',
      badge: { text: '异常', type: 'error' },
      desc: '所有价格被隐藏 · 引导跳转价格管理',
      product_id: 'prod-clothing-009',
      distribution_type: 1,
      supply_price: null,
      error_code: 'all_price_hidden',
      from_page: 'normal'
    }
  ];

  var STORAGE_KEYS = {
    customAddPrice: 'agent-resale-custom-add-price',
    showEditFreeTip: 'agent-resale-show-edit-free-tip'
  };

  // ── 工具函数 ──
  function getProduct(productId) {
    var db = window.WEGO_PROTOTYPE_DB;
    if (!db || !db.products) return null;
    return db.products.find(function (p) { return p.product_id === productId; });
  }

  function getProductImage(productId) {
    var product = getProduct(productId);
    return (product && product.image_list && product.image_list[0]) || '';
  }

  function getProductTitle(productId) {
    var product = getProduct(productId);
    return (product && product.title) || '商品标题';
  }

  // 格式化价格:整数不显示小数点,否则保留2位小数
  function formatPrice(value) {
    if (value === null || value === undefined || value === '') return '--';
    var num = Number(value);
    if (isNaN(num)) return '--';
    if (Math.abs(num - Math.round(num)) < 0.001) return String(Math.round(num));
    return num.toFixed(2);
  }

  // 格式化百分比:0.3 -> 30%
  function formatRate(rate) {
    if (rate === null || rate === undefined) return '--';
    var percent = Number(rate) * 100;
    if (Math.abs(percent - Math.round(percent)) < 0.01) return Math.round(percent) + '%';
    return percent.toFixed(1) + '%';
  }

  // 格式化区间价格
  function formatPriceRange(min, max) {
    if (min === max) return formatPrice(min);
    return formatPrice(min) + '~' + formatPrice(max);
  }

  // 计算售价 = 供货价 + 加价
  function computePrice(supplyPrice, addPrice) {
    return Number(supplyPrice) + Number(addPrice);
  }

  // 加价金额转比例
  function amountToRate(amount, supplyPrice) {
    if (!supplyPrice) return 0;
    return Number(amount) / Number(supplyPrice);
  }

  // 加价比例转金额
  function rateToAmount(rate, supplyPrice) {
    return Number(rate) * Number(supplyPrice);
  }

  // 校验加价比例是否在 1%-300% 范围内
  function validateRate(rate) {
    var percent = Number(rate) * 100;
    return percent >= 1 && percent <= 300;
  }

  // localStorage 封装
  function getStorage(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function setStorage(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  // 获取快捷加价标签(优先级:当前加价>店铺设置>前端缓存>兜底30%/20%/10%)
  function getQuickTags(sample, currentAdd) {
    var tags = [];
    var customStr = getStorage(STORAGE_KEYS.customAddPrice);
    var custom = customStr ? JSON.parse(customStr) : null;

    // 兜底标签
    var fallbackRates = [0.3, 0.2, 0.1];

    // 如果有当前加价,优先放入
    if (currentAdd) {
      if (currentAdd.type === 1 && currentAdd.value) {
        tags.push({ amountType: 1, value: Number(currentAdd.value), label: '+' + formatPrice(currentAdd.value) + '元' });
      } else if (currentAdd.type === 2 && currentAdd.rate) {
        tags.push({ amountType: 2, rate: Number(currentAdd.rate), label: '+' + formatRate(currentAdd.rate) });
      }
    }

    // 加入前端缓存的自定义加价(如果和当前加价不同)
    if (custom && (!currentAdd || JSON.stringify(custom) !== JSON.stringify({ type: currentAdd.type, value: currentAdd.value, rate: currentAdd.rate }))) {
      if (custom.type === 1) {
        tags.push({ amountType: 1, value: custom.value, label: '+' + formatPrice(custom.value) + '元' });
      } else {
        tags.push({ amountType: 2, rate: custom.rate, label: '+' + formatRate(custom.rate) });
      }
    }

    // 补充兜底标签(最多3个)
    for (var i = 0; i < fallbackRates.length && tags.length < 3; i++) {
      var rate = fallbackRates[i];
      var exists = tags.some(function (t) {
        return t.amountType === 2 && Math.abs(t.rate - rate) < 0.001;
      });
      if (!exists) {
        tags.push({ amountType: 2, rate: rate, label: '+' + formatRate(rate) });
      }
    }

    return tags.slice(0, 3);
  }

  // 判断是否为区间价格
  function isRangePrice(sample) {
    return Array.isArray(sample.supply_price);
  }

  // 判断是否为固定佣金
  function isFixedRebate(sample) {
    return sample.distribution_type === 2;
  }

  // 判断是否为直播间来源
  function isLiveRoom(sample) {
    return sample.from_page === 'live';
  }

  // ── 帮卖弹窗模板 ──
  function buildPopupTemplate(sample) {
    var isFixed = isFixedRebate(sample);
    var title = isFixed ? '赚佣金' : '加价卖';
    var isLive = isLiveRoom(sample);

    // 异常场景:价格隐藏
    if (sample.error_code === 'wholesale_hidden') {
      return buildWholesaleHiddenTemplate();
    }
    if (sample.error_code === 'all_price_hidden') {
      return buildAllPriceHiddenTemplate();
    }

    var isRange = isRangePrice(sample);

    // 价格展示:售价 + 佣金 一行
    var priceHtml = '';
    if (isFixed) {
      // 固定佣金:只读展示
      priceHtml = ''
        + '<div class="resale-price">'
        +   '<div class="resale-price__field-row">'
        +     '<div class="resale-price__field">'
        +       '<span class="resale-price__field-label">我的售价</span>'
        +       '<div class="resale-price__field-value resale-price__field-value--readonly" data-display-price>' + formatPrice(sample.current_price) + '<span class="resale-price__field-suffix">元</span></div>'
        +     '</div>'
        +     '<div class="resale-price__field">'
        +       '<span class="resale-price__field-label">佣金</span>'
        +       '<div class="resale-price__field-value resale-price__field-value--commission resale-price__field-value--readonly" data-display-commission>' + formatPrice(sample.commission) + '<span class="resale-price__field-suffix">元</span></div>'
        +     '</div>'
        +   '</div>'
        + '</div>';
    } else if (isRange) {
      // 区间价格:不显示输入框,展示区间
      var minSupply = sample.supply_price[0];
      var maxSupply = sample.supply_price[1];
      var defaultRate = sample.distribution_config.amountType === 2 ? sample.distribution_config.rate : 0.3;
      var minAdd = rateToAmount(defaultRate, minSupply);
      var maxAdd = rateToAmount(defaultRate, maxSupply);
      var minPrice = computePrice(minSupply, minAdd);
      var maxPrice = computePrice(maxSupply, maxAdd);

      priceHtml = ''
        + '<div class="resale-price">'
        +   '<div class="resale-price__field-row">'
        +     '<div class="resale-price__field">'
        +       '<span class="resale-price__field-label">我的售价</span>'
        +       '<div class="resale-price__field-value" data-display-price>' + formatPriceRange(minPrice, maxPrice) + '<span class="resale-price__field-suffix">元</span></div>'
        +     '</div>'
        +     '<div class="resale-price__field">'
        +       '<span class="resale-price__field-label">佣金</span>'
        +       '<div class="resale-price__field-value resale-price__field-value--commission" data-display-commission>' + formatPriceRange(minAdd, maxAdd) + '<span class="resale-price__field-suffix">元</span></div>'
        +     '</div>'
        +   '</div>'
        + '</div>';
    } else {
      // 单一价格:售价可编辑
      var supplyPrice = sample.supply_price;
      var currentAdd = sample.my_item
        ? { type: sample.current_add_price_type, value: sample.current_add_price_value, rate: sample.current_add_price_rate }
        : null;
      var defaultAdd = currentAdd
        ? (currentAdd.type === 1 ? currentAdd.value : rateToAmount(currentAdd.rate, supplyPrice))
        : (sample.distribution_config.amountType === 1
            ? sample.distribution_config.value
            : rateToAmount(sample.distribution_config.rate, supplyPrice));
      var defaultPrice = computePrice(supplyPrice, defaultAdd);

      priceHtml = ''
        + '<div class="resale-price">'
        +   '<div class="resale-price__field-row">'
        +     '<div class="resale-price__field resale-price__field--editable">'
        +       '<span class="resale-price__field-label">我的售价</span>'
        +       '<div class="resale-price__field-value" data-price-edit>' + formatPrice(defaultPrice) + '<span class="resale-price__field-suffix">元</span></div>'
        +     '</div>'
        +     '<div class="resale-price__field">'
        +       '<span class="resale-price__field-label">佣金</span>'
        +       '<div class="resale-price__field-value resale-price__field-value--commission" data-display-commission>' + formatPrice(defaultAdd) + '<span class="resale-price__field-suffix">元</span></div>'
        +     '</div>'
        +   '</div>'
        + '</div>';
    }

    // 快捷加价标签区(仅自由定价显示):标题在左,标签在右,间距8
    var tagsHtml = '';
    if (!isFixed) {
      var currentAdd = sample.my_item
        ? { type: sample.current_add_price_type, value: sample.current_add_price_value, rate: sample.current_add_price_rate }
        : null;
      var tags = getQuickTags(sample, currentAdd);

      var tagsItems = tags.map(function (tag, idx) {
        var isSelected = idx === 0 && sample.my_item;
        var tagClass = isSelected ? 'tag--28 tag--brand tag--selected' : 'tag--28 tag--gray tag--normal';
        return '<div class="resale-tags__item tag ' + tagClass + '" data-tag-amounttype="' + tag.amountType + '" data-tag-value="' + (tag.value || '') + '" data-tag-rate="' + (tag.rate || '') + '"><span class="tag__label">' + tag.label + '</span></div>';
      }).join('');

      tagsHtml = ''
        + '<div class="resale-tags">'
        +   '<span class="resale-tags__title">快捷加价</span>'
        +   '<div class="resale-tags__list">'
        +     tagsItems
        +     '<a class="link resale-tags__manual" data-manual-input>手动输入</a>'
        +   '</div>'
        + '</div>';
    }

    // 佣金保密提示(非直播间 + 自由定价),放底部按钮上方
    var hintHtml = '';
    if (!isLive && !isFixed) {
      hintHtml = '<div class="resale-hint-bottom">*帮卖分佣仅自己可见,可放心分享</div>';
    }

    // 首次编辑气泡引导
    var bubbleHtml = '';
    if (sample.my_item && !isFixed && !isRange && !getStorage(STORAGE_KEYS.showEditFreeTip)) {
      bubbleHtml = '<div class="resale-bubble" data-edit-bubble>可修改你的售价,赚更多</div>';
    }

    // 底部按钮
    var actionsHtml = '';
    if (isLive) {
      // 直播间:自由定价仅【保存】,固定佣金仅【我知道了】
      if (isFixed) {
        actionsHtml = ''
          + '<div class="modal__action--single-h">'
          +   '<button class="btn btn--strong btn--lg" data-action="confirm">我知道了</button>'
          + '</div>';
      } else {
        actionsHtml = ''
          + '<div class="modal__action--single-h">'
          +   '<button class="btn btn--strong btn--lg" data-action="save">保存</button>'
          + '</div>';
      }
    } else if (sample.my_item) {
      // 编辑场景:【保存】+【分享】
      actionsHtml = ''
        + '<div class="modal__buttons">'
        +   '<button class="btn btn--weak btn--lg" data-action="share">分享</button>'
        +   '<button class="btn btn--strong btn--lg" data-action="save">保存</button>'
        + '</div>';
    } else {
      // 初次帮卖:【帮卖并分享】
      actionsHtml = ''
        + '<div class="modal__action--single-h">'
        +   '<button class="btn btn--strong btn--lg" data-action="resale-share">帮卖并分享</button>'
        + '</div>';
    }

    // 标题:自由定价加问号图标
    var titleHelp = '';
    if (!isFixed) {
      titleHelp = '<i class="wego-iconfont-s icon-wenhao navbar__title-help" data-resale-help></i>';
    }

    return ''
      + '<div class="modal modal--frame modal--has-actions" role="dialog" aria-modal="true" data-state="closed" data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="modal__title modal__title--default">'
      +       '<div class="navbar">'
      +         '<div class="navbar__body">'
      +           '<div class="navbar__left">'
      +             '<div class="navbar__left-btn navbar__left-btn--circle" data-popup-close><i class="wego-iconfont-s icon-xiajiantou16"></i></div>'
      +           '</div>'
      +           '<div class="navbar__center"><span class="navbar__title" data-resale-title>' + title + '</span>' + titleHelp + '</div>'
      +           '<div class="navbar__right"></div>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="modal__body resale-popup__body">'
      +       priceHtml
      +       tagsHtml
      +       bubbleHtml
      +     '</div>'
      +     '<div class="modal__actions">'
      +       '<div class="modal__action-gradient"></div>'
      +       hintHtml
      +       actionsHtml
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // ── 批发价隐藏模板 ──
  function buildWholesaleHiddenTemplate() {
    return ''
      + '<div class="modal modal--frame modal--has-actions" role="dialog" aria-modal="true" data-state="closed" data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="modal__title modal__title--info">'
      +       '<div class="modal__title-text">批发价被隐藏不支持帮卖</div>'
      +       '<div class="modal__subtitle">确认后,将自动公开批发价支持帮卖</div>'
      +     '</div>'
      +     '<div class="modal__body"></div>'
      +     '<div class="modal__actions">'
      +       '<div class="modal__action-gradient"></div>'
      +       '<div class="modal__buttons">'
      +         '<button class="btn btn--weak btn--lg" data-action="close-popup">取消</button>'
      +         '<button class="btn btn--strong btn--lg" data-action="confirm-wholesale">确认</button>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // ── 所有价格隐藏模板 ──
  function buildAllPriceHiddenTemplate() {
    return ''
      + '<div class="modal modal--frame modal--has-actions" role="dialog" aria-modal="true" data-state="closed" data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="modal__title modal__title--info">'
      +       '<div class="modal__title-text">所有价格被隐藏</div>'
      +       '<div class="modal__subtitle">你店铺所有价格被隐藏,不支持帮卖,请前往价格管理设置</div>'
      +     '</div>'
      +     '<div class="modal__body"></div>'
      +     '<div class="modal__actions">'
      +       '<div class="modal__action-gradient"></div>'
      +       '<div class="modal__action--single-h">'
      +         '<button class="btn btn--strong btn--lg" data-action="go-price-settings">确认</button>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // ── 数字键盘模板 ──
  function buildKeypadTemplate(mode, initialValue) {
    var displayValue = initialValue ? String(initialValue) : '';
    var isAmount = mode === 'amount';
    var segClass = isAmount ? 'is-amount' : 'is-rate';

    return ''
      + '<div class="modal modal--frame modal--no-mask" role="dialog" aria-modal="true" data-state="closed" data-keypad-overlay data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="keypad">'
      +       '<div class="keypad__segmented ' + segClass + '" data-keypad-segmented>'
      +         '<div class="keypad__segmented-thumb"></div>'
      +         '<div class="keypad__segmented-item ' + (isAmount ? 'is-active' : '') + '" data-keypad-tab="amount">加价金额</div>'
      +         '<div class="keypad__segmented-item ' + (!isAmount ? 'is-active' : '') + '" data-keypad-tab="rate">加价比例</div>'
      +       '</div>'
      +       '<div class="keypad__display">'
      +         '<div class="keypad__display-label" data-keypad-label>' + (isAmount ? '加价金额' : '加价比例') + '</div>'
      +         '<div class="keypad__display-value ' + (displayValue ? '' : 'keypad__display-value--placeholder') + '" data-keypad-display>'
      +           (displayValue || '请输入') + '<span class="keypad__display-suffix">' + (isAmount ? '元' : '%') + '</span>'
      +         '</div>'
      +       '</div>'
      +       '<div class="keypad__body">'
      +         '<div class="keypad__keys">'
      +           '<div class="keypad__key" data-key="1">1</div>'
      +           '<div class="keypad__key" data-key="2">2</div>'
      +           '<div class="keypad__key" data-key="3">3</div>'
      +           '<div class="keypad__key" data-key="4">4</div>'
      +           '<div class="keypad__key" data-key="5">5</div>'
      +           '<div class="keypad__key" data-key="6">6</div>'
      +           '<div class="keypad__key" data-key="7">7</div>'
      +           '<div class="keypad__key" data-key="8">8</div>'
      +           '<div class="keypad__key" data-key="9">9</div>'
      +           '<div class="keypad__key keypad__key--zero" data-key="0">0</div>'
      +           '<div class="keypad__key" data-key=".">.</div>'
      +         '</div>'
      +         '<div class="keypad__side">'
      +           '<div class="keypad__key keypad__key--delete" data-key="delete"><i class="wego-iconfont-s icon-shanchu"></i></div>'
      +           '<button class="btn btn--strong keypad__side-confirm" data-keypad-confirm>确定</button>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // ── 加价卖说明页模板(基于已确认简报组织) ──
  function buildHelpTemplate() {
    return ''
      + '<div class="modal modal--fullscreen" role="dialog" aria-modal="true" data-state="closed" data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="modal__title modal__title--default">'
      +       '<div class="navbar">'
      +         '<div class="navbar__body">'
      +           '<div class="navbar__left">'
      +             '<div class="navbar__left-btn navbar__left-btn--circle" data-help-close><i class="wego-iconfont-s icon-xiajiantou16"></i></div>'
      +           '</div>'
      +           '<div class="navbar__center"><span class="navbar__title">加价卖说明</span></div>'
      +           '<div class="navbar__right"></div>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="modal__body modal__body--safe-bottom resale-help__body">'
      +       '<div class="resale-help__section">'
      +         '<h3 class="resale-help__title">什么是加价卖</h3>'
      +         '<p class="resale-help__text">在供货价基础上加价出售,加价部分即你的佣金收益。可按金额或按比例设置加价。</p>'
      +       '</div>'
      +       '<div class="resale-help__section">'
      +         '<h3 class="resale-help__title">价格计算</h3>'
      +         '<p class="resale-help__text">我的售价 = 供货价 + 加价;佣金 = 加价金额。按金额与按比例可互转,金额保留 2 位小数。</p>'
      +       '</div>'
      +       '<div class="resale-help__section">'
      +         '<h3 class="resale-help__title">加价范围</h3>'
      +         '<p class="resale-help__text">加价比例需在 1%-300% 之间,按金额加价时会自动换算为比例校验。</p>'
      +       '</div>'
      +       '<div class="resale-help__section">'
      +         '<h3 class="resale-help__title">佣金保密</h3>'
      +         '<p class="resale-help__text">帮卖分佣仅自己可见,买家无法查看,可放心分享。</p>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // ── 挂载场景选择页 ──
  function mountSelection(ctx) {
    var root = ctx.root;

    // 场景卡片点击
    var cards = root.querySelectorAll('[data-scene-key]');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var key = card.getAttribute('data-scene-key');
        var sample = SCENE_SAMPLES.find(function (s) { return s.key === key; });
        if (!sample) return;
        openResalePopup(ctx, sample);
      });
    });
  }

  // ── 打开帮卖弹窗 ──
  function openResalePopup(ctx, sample) {
    var template = buildPopupTemplate(sample);

    ctx.openSheet(template, {
      label: '帮卖弹窗',
      init: function (overlayCtx) {
        var root = overlayCtx.root;

        // 关闭按钮
        var closeBtn = root.querySelector('[data-popup-close]');
        if (closeBtn) {
          closeBtn.addEventListener('click', function () { ctx.closeOverlay(); });
        }

        // 标题/问号点击打开说明页(自由定价)
        var resaleTitle = root.querySelector('[data-resale-title]');
        var resaleHelp = root.querySelector('[data-resale-help]');
        if (resaleTitle) {
          resaleTitle.addEventListener('click', function () { openHelp(ctx); });
        }
        if (resaleHelp) {
          resaleHelp.addEventListener('click', function (e) { e.stopPropagation(); openHelp(ctx); });
        }

        // 异常场景按钮
        var confirmWholesaleBtn = root.querySelector('[data-action="confirm-wholesale"]');
        if (confirmWholesaleBtn) {
          confirmWholesaleBtn.addEventListener('click', function () {
            ctx.toast('批发价已设置为公开');
            ctx.closeOverlay();
          });
        }
        var goPriceSettingsBtn = root.querySelector('[data-action="go-price-settings"]');
        if (goPriceSettingsBtn) {
          goPriceSettingsBtn.addEventListener('click', function () {
            ctx.toast('跳转价格管理设置页');
            ctx.closeOverlay();
          });
        }
        var closePopupBtn = root.querySelector('[data-action="close-popup"]');
        if (closePopupBtn) {
          closePopupBtn.addEventListener('click', function () { ctx.closeOverlay(); });
        }

        // 正常场景按钮
        var saveBtn = root.querySelector('[data-action="save"]');
        if (saveBtn) {
          saveBtn.addEventListener('click', function () {
            ctx.toast('保存成功');
            ctx.closeOverlay();
          });
        }
        var shareBtn = root.querySelector('[data-action="share"]');
        if (shareBtn) {
          shareBtn.addEventListener('click', function () {
            ctx.toast('分享面板已拉起');
          });
        }
        var resaleShareBtn = root.querySelector('[data-action="resale-share"]');
        if (resaleShareBtn) {
          resaleShareBtn.addEventListener('click', function () {
            ctx.toast('帮卖成功');
            ctx.closeOverlay();
          });
        }
        var confirmBtn = root.querySelector('[data-action="confirm"]');
        if (confirmBtn) {
          confirmBtn.addEventListener('click', function () {
            ctx.closeOverlay();
          });
        }

        // 气泡引导:点击任意区域消失
        var bubble = root.querySelector('[data-edit-bubble]');
        if (bubble) {
          var dismissBubble = function () {
            bubble.remove();
            setStorage(STORAGE_KEYS.showEditFreeTip, '1');
          };
          bubble.addEventListener('click', dismissBubble);
          root.addEventListener('click', function () {
            if (bubble.parentNode) dismissBubble();
          }, { once: true });
        }

        // 快捷加价标签点击
        var tagItems = root.querySelectorAll('.resale-tags__item');
        tagItems.forEach(function (tag) {
          tag.addEventListener('click', function () {
            var amountType = Number(tag.getAttribute('data-tag-amounttype'));
            var value = tag.getAttribute('data-tag-value');
            var rate = tag.getAttribute('data-tag-rate');

            // 更新选中态
            tagItems.forEach(function (t) {
              t.classList.remove('tag--brand', 'tag--selected');
              t.classList.add('tag--gray', 'tag--normal');
            });
            tag.classList.remove('tag--gray', 'tag--normal');
            tag.classList.add('tag--brand', 'tag--selected');

            // 计算新价格
            var addPrice;
            if (amountType === 1) {
              addPrice = Number(value);
            } else {
              addPrice = rateToAmount(Number(rate), getSupplyPriceForCalc(sample));
            }
            updatePopupPrice(root, sample, addPrice, amountType, amountType === 1 ? value : rate);
          });
        });

        // 手动输入点击
        var manualInput = root.querySelector('[data-manual-input]');
        if (manualInput) {
          manualInput.addEventListener('click', function () {
            openKeypad(ctx, root, sample, 'amount', '');
          });
        }

        // 单一价格输入框点击(直接改售价)
        var priceEdit = root.querySelector('[data-price-edit]');
        if (priceEdit) {
          priceEdit.addEventListener('click', function () {
            var currentPrice = priceEdit.textContent;
            openKeypad(ctx, root, sample, 'price', currentPrice);
          });
        }
      }
    });
  }

  // ── 打开加价卖说明页 ──
  function openHelp(ctx) {
    ctx.openFullScreenModal(buildHelpTemplate(), {
      label: '加价卖说明',
      init: function (overlayCtx) {
        var root = overlayCtx.root;
        var closeBtn = root.querySelector('[data-help-close]');
        if (closeBtn) {
          closeBtn.addEventListener('click', function () { ctx.closeOverlay(); });
        }
      }
    });
  }

  // 获取用于计算的供货价(区间价取最小值)
  function getSupplyPriceForCalc(sample) {
    if (isRangePrice(sample)) return sample.supply_price[0];
    return sample.supply_price;
  }

  // 设置字段值(数字 + "元"后缀)
  function setFieldValue(el, text) {
    if (!el) return;
    el.innerHTML = text + '<span class="resale-price__field-suffix">元</span>';
  }

  // 更新弹窗价格显示
  function updatePopupPrice(root, sample, addPrice, addType, addValue) {
    if (isRangePrice(sample)) {
      var minSupply = sample.supply_price[0];
      var maxSupply = sample.supply_price[1];
      var minAdd, maxAdd;

      if (addType === 1) {
        // 按金额加价:每个SKU加相同金额
        minAdd = addPrice;
        maxAdd = addPrice;
      } else {
        // 按比例加价:每个SKU按比例加价
        minAdd = rateToAmount(addValue, minSupply);
        maxAdd = rateToAmount(addValue, maxSupply);
      }

      var minPrice = computePrice(minSupply, minAdd);
      var maxPrice = computePrice(maxSupply, maxAdd);

      setFieldValue(root.querySelector('[data-display-price]'), formatPriceRange(minPrice, maxPrice));
      setFieldValue(root.querySelector('[data-display-commission]'), formatPriceRange(minAdd, maxAdd));
    } else {
      var supplyPrice = sample.supply_price;
      var newPrice = computePrice(supplyPrice, addPrice);

      setFieldValue(root.querySelector('[data-price-edit]'), formatPrice(newPrice));
      setFieldValue(root.querySelector('[data-display-commission]'), formatPrice(addPrice));
    }
  }

  // ── 打开数字键盘 ──
  function openKeypad(ctx, popupRoot, sample, mode, initialValue) {
    var keypadMode = mode === 'price' ? 'amount' : mode; // price 模式也是按金额
    var cleanedValue = initialValue ? String(initialValue).replace(/[^0-9.]/g, '') : '';
    var template = buildKeypadTemplate(keypadMode, cleanedValue);

    ctx.openSheet(template, {
      label: '数字键盘',
      init: function (overlayCtx) {
        var root = overlayCtx.root;

        var currentMode = keypadMode;
        var currentValue = cleanedValue;
        var displayEl = root.querySelector('[data-keypad-display]');
        var labelEl = root.querySelector('[data-keypad-label]');

        function updateDisplay() {
          var isAmount = currentMode === 'amount';
          var suffix = isAmount ? '元' : '%';
          var label = isAmount ? '加价金额' : '加价比例';

          if (labelEl) labelEl.textContent = label;
          if (displayEl) {
            if (currentValue) {
              displayEl.classList.remove('keypad__display-value--placeholder');
              displayEl.innerHTML = currentValue + '<span class="keypad__display-suffix">' + suffix + '</span>';
            } else {
              displayEl.classList.add('keypad__display-value--placeholder');
              displayEl.innerHTML = '请输入<span class="keypad__display-suffix">' + suffix + '</span>';
            }
          }
        }

        // 分段切换控件
        var segmented = root.querySelector('[data-keypad-segmented]');
        var tabs = root.querySelectorAll('[data-keypad-tab]');
        tabs.forEach(function (tab) {
          tab.addEventListener('click', function () {
            var newMode = tab.getAttribute('data-keypad-tab');
            if (newMode === currentMode) return;

            // 切换时尝试转换值
            var oldVal = parseFloat(currentValue) || 0;
            var supplyPrice = getSupplyPriceForCalc(sample);
            if (currentMode === 'amount' && newMode === 'rate') {
              // 金额转比例
              currentValue = supplyPrice ? String((oldVal / supplyPrice).toFixed(4)) : '';
            } else if (currentMode === 'rate' && newMode === 'amount') {
              // 比例转金额
              currentValue = String((oldVal * supplyPrice).toFixed(2));
            }

            currentMode = newMode;
            tabs.forEach(function (t) { t.classList.remove('is-active'); });
            tab.classList.add('is-active');
            // 同步滑动 thumb 位置
            if (segmented) {
              segmented.classList.toggle('is-amount', currentMode === 'amount');
              segmented.classList.toggle('is-rate', currentMode === 'rate');
            }
            updateDisplay();
          });
        });

        // 按键点击
        var keys = root.querySelectorAll('[data-key]');
        keys.forEach(function (key) {
          key.addEventListener('click', function () {
            var k = key.getAttribute('data-key');
            handleKeyPress(k);
          });

          // 长按退格连续删除
          if (key.getAttribute('data-key') === 'delete') {
            var pressTimer = null;
            var intervalTimer = null;

            var startPress = function (e) {
              e.preventDefault();
              pressTimer = setTimeout(function () {
                intervalTimer = setInterval(function () {
                  handleKeyPress('delete');
                }, 100);
              }, 500);
            };

            var endPress = function () {
              if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
              if (intervalTimer) { clearInterval(intervalTimer); intervalTimer = null; }
            };

            key.addEventListener('touchstart', startPress, { passive: false });
            key.addEventListener('touchend', endPress);
            key.addEventListener('touchcancel', endPress);
            key.addEventListener('mousedown', startPress);
            key.addEventListener('mouseup', endPress);
            key.addEventListener('mouseleave', endPress);
          }
        });

        function handleKeyPress(k) {
          if (k === 'delete') {
            currentValue = currentValue.slice(0, -1);
          } else if (k === '.') {
            // 小数点不可重复
            if (currentValue.indexOf('.') === -1 && currentValue !== '') {
              currentValue += '.';
            }
          } else {
            // 第3位小数静默拦截
            var dotIndex = currentValue.indexOf('.');
            if (dotIndex !== -1 && currentValue.length - dotIndex - 1 >= 2) {
              return;
            }
            currentValue += k;
          }
          updateDisplay();
        }

        // 点击键盘外丢弃未确认值
        root.addEventListener('click', function (e) {
          if (e.target === root) {
            ctx.closeOverlay();
          }
        });

        // 确定按钮
        var confirmBtn = root.querySelector('[data-keypad-confirm]');
        if (confirmBtn) {
          confirmBtn.addEventListener('click', function () {
            if (!currentValue) {
              ctx.toast('请输入加价');
              return;
            }

            var numValue = parseFloat(currentValue);
            if (isNaN(numValue) || numValue <= 0) {
              ctx.toast('请输入正确的加价');
              return;
            }

            // 校验加价比例 1%-300%
            var supplyPrice = getSupplyPriceForCalc(sample);
            var rate;
            if (currentMode === 'amount') {
              rate = amountToRate(numValue, supplyPrice);
            } else {
              rate = numValue; // 按比例模式直接是比例值(小数)
            }

            if (!validateRate(rate)) {
              ctx.toast('加价比例需在1%-300%之间');
              return;
            }

            // 计算最终加价金额
            var addPrice;
            var addType;
            var addValue;

            if (currentMode === 'amount') {
              addPrice = numValue;
              addType = 1;
              addValue = String(numValue);
            } else {
              addPrice = rateToAmount(numValue, supplyPrice);
              addType = 2;
              addValue = String(numValue);
            }

            // 缓存自定义加价
            var cacheData = currentMode === 'amount'
              ? { type: 1, value: numValue }
              : { type: 2, rate: numValue };
            setStorage(STORAGE_KEYS.customAddPrice, JSON.stringify(cacheData));

            // 更新弹窗价格
            updatePopupPrice(popupRoot, sample, addPrice, addType, addValue);

            // 更新快捷标签选中态(全部取消选中)
            var tagItems = popupRoot.querySelectorAll('.resale-tags__item');
            tagItems.forEach(function (t) {
              t.classList.remove('tag--brand', 'tag--selected');
              t.classList.add('tag--gray', 'tag--normal');
            });

            ctx.closeOverlay();
          });
        }

        updateDisplay();
      }
    });
  }

  // ── 注册场景 ──
  window.WegoApp.registerScene({
    routeId: 'agent-resale',
    title: '代理商帮卖弹窗',
    template: `
<div class="layout-page" data-bg="page" data-component-slug="layout-page" data-surface-id="agent-resale" data-route-id="agent-resale" data-layout-mode="composed">
  <div class="layout-page__top">
    <div class="navbar" data-component-slug="navbar">
      <div class="navbar__body navbar__body--spaced">
        <div class="navbar__left"></div>
        <div class="navbar__center"><span class="navbar__title">代理商帮卖弹窗</span></div>
        <div class="navbar__right"></div>
      </div>
    </div>
  </div>
  <div class="layout-page__body">
    <div class="layout-scroll" data-component-slug="layout-scroll">
      <div class="agent-resale-scene__intro">
        <p class="agent-resale-scene__intro-title">帮卖分销原型</p>
        <p class="agent-resale-scene__intro-desc">点击下方场景卡片进入对应帮卖弹窗实例,覆盖自由定价/固定佣金、单一价/区间价、普通/直播间来源以及价格隐藏异常。</p>
      </div>
      <div class="agent-resale-scene__group">
        <div class="agent-resale-scene__group-title">自由定价</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="first-resale-free-single">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">初次帮卖 · 自由定价 · 单一价格</span>
                </div>
                <div class="cell__subtitle">供货价100 · 默认加价+100 · 单一价格</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--free">自由定价</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="first-resale-free-range">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">初次帮卖 · 自由定价 · 区间价格</span>
                </div>
                <div class="cell__subtitle">SKU供货价80/100/120 · 区间80~120</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--free">区间价</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="agent-resale-scene__group">
        <div class="agent-resale-scene__group-title">编辑</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="edit-free-single">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">编辑 · 自由定价</span>
                </div>
                <div class="cell__subtitle">回显售价150 · 加价+50</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--free">编辑</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="edit-fixed-rebate">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">编辑 · 固定佣金</span>
                </div>
                <div class="cell__subtitle">售价200 · 佣金100 · 只读</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--fixed">固定佣金</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="agent-resale-scene__group">
        <div class="agent-resale-scene__group-title">直播间</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="live-room-free">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">直播间 · 自由定价</span>
                </div>
                <div class="cell__subtitle">同初次帮卖 · 来源直播间 · 遮罩可关</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--live">直播</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="live-room-fixed">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">直播间 · 固定佣金</span>
                </div>
                <div class="cell__subtitle">固定佣金 · 底部仅"我知道了"</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--live">直播</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="agent-resale-scene__group">
        <div class="agent-resale-scene__group-title">异常</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="wholesale-hidden">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">批发价隐藏</span>
                </div>
                <div class="cell__subtitle">批发价被隐藏 · 模态框确认公开</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--error">异常</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="all-price-hidden">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">所有价格隐藏</span>
                </div>
                <div class="cell__subtitle">所有价格被隐藏 · 引导跳转价格管理</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--error">异常</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
    presentation: { type: 'push', coversTabBar: true },
    init: function (ctx) {
      mountSelection(ctx);
    }
  });
})();
