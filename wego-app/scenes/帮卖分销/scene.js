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
      desc: '供货价178.5 · 默认加价+30 · 售价208.5',
      product_id: 'prod-clothing-001',
      distribution_type: 1,
      supply_price: 178.5,
      skus: [{ id: 'sku-1', supply_price: 178.5 }],
      distribution_config: { amountType: 1, value: 30 },
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
      desc: '售价208.5 · 佣金30 · 只读',
      product_id: 'prod-clothing-005',
      distribution_type: 2,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: true,
      current_price: 208.5,
      commission: 30,
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
    },
    {
      key: 'loading-state',
      label: '加载中',
      group: '异常',
      badge: { text: '异常', type: 'error' },
      desc: '弹窗加载中 · 居中加载图标',
      product_id: 'prod-clothing-001',
      distribution_type: 1,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: false,
      state: 'loading',
      from_page: 'normal'
    },
    {
      key: 'load-failed-state',
      label: '加载失败',
      group: '异常',
      badge: { text: '异常', type: 'error' },
      desc: '获取帮卖信息失败 · 点击请重试',
      product_id: 'prod-clothing-001',
      distribution_type: 1,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: false,
      state: 'load-failed',
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

  // 格式化价格:整数不显示小数点,否则保留有效小数(去除尾零)
  function formatPrice(value) {
    if (value === null || value === undefined || value === '') return '--';
    var num = Number(value);
    if (isNaN(num)) return '--';
    if (Math.abs(num - Math.round(num)) < 0.001) return String(Math.round(num));
    return String(parseFloat(num.toFixed(2)));
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
  // 兜底标签按供应商配置类型展示:金额模式展示+30元/+20元/+10元,比例模式展示+30%/+20%/+10%
  function getQuickTags(sample, currentAdd) {
    var tags = [];
    var customStr = getStorage(STORAGE_KEYS.customAddPrice);
    var custom = customStr ? JSON.parse(customStr) : null;

    // 兜底标签:金额模式用固定金额,比例模式用百分比
    var isAmountMode = sample.distribution_config && sample.distribution_config.amountType === 1;
    var fallbackAmounts = [30, 20, 10];
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
      if (isAmountMode) {
        var amount = fallbackAmounts[i];
        var existsAmount = tags.some(function (t) {
          return t.amountType === 1 && Math.abs(t.value - amount) < 0.001;
        });
        if (!existsAmount) {
          tags.push({ amountType: 1, value: amount, label: '+' + formatPrice(amount) + '元' });
        }
      } else {
        var rate = fallbackRates[i];
        var existsRate = tags.some(function (t) {
          return t.amountType === 2 && Math.abs(t.rate - rate) < 0.001;
        });
        if (!existsRate) {
          tags.push({ amountType: 2, rate: rate, label: '+' + formatRate(rate) });
        }
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

  // ── 快捷加价标签 HTML(inline=true 内联到售价卡片;false 独立区块) ──
  function buildTagsHtml(sample, inline) {
    var currentAdd = sample.my_item
      ? { type: sample.current_add_price_type, value: sample.current_add_price_value, rate: sample.current_add_price_rate }
      : null;
    var tags = getQuickTags(sample, currentAdd);
    var defaultAddType = sample.my_item
      ? sample.current_add_price_type
      : (sample.distribution_config ? sample.distribution_config.amountType : null);
    var defaultAddVal = sample.my_item
      ? (sample.current_add_price_type === 1 ? sample.current_add_price_value : sample.current_add_price_rate)
      : (sample.distribution_config
          ? (sample.distribution_config.amountType === 1 ? sample.distribution_config.value : sample.distribution_config.rate)
          : null);

    var tagsItems = tags.map(function (tag) {
      var isSelected = false;
      if (tag.amountType === 1 && defaultAddType === 1 && defaultAddVal) {
        isSelected = Math.abs(tag.value - Number(defaultAddVal)) < 0.001;
      } else if (tag.amountType === 2 && defaultAddType === 2 && defaultAddVal) {
        isSelected = Math.abs(tag.rate - Number(defaultAddVal)) < 0.001;
      }
      var tagClass = isSelected ? 'tag--28 tag--brand tag--selected' : 'tag--28 tag--white tag--normal';
      return '<div data-component-slug="tag" class="resale-tags__item tag ' + tagClass + '" data-tag-amounttype="' + tag.amountType + '" data-tag-value="' + (tag.value || '') + '" data-tag-rate="' + (tag.rate || '') + '"><span class="tag__label">' + tag.label + '</span></div>';
    }).join('');

    var wrapperClass = inline ? 'resale-tags resale-tags--inline' : 'resale-tags';
    return ''
      + '<div class="' + wrapperClass + '">'
      +   '<span class="resale-tags__title">快捷加价</span>'
      +   '<div class="resale-tags__list">'
      +     tagsItems
      +     '<a data-component-slug="link" class="link resale-tags__manual" data-manual-input>手动输入</a>'
      +   '</div>'
      + '</div>';
  }

  // ── 帮卖弹窗模板 ──
  function buildPopupTemplate(sample) {
    var isFixed = isFixedRebate(sample);
    var title = isFixed ? '赚佣金' : '加价卖';
    var isLive = isLiveRoom(sample);

    var isRange = isRangePrice(sample);

    // 价格展示:售价 + 佣金 一行
    var priceHtml = '';
    if (isFixed) {
      // 固定佣金:只读展示(Figma 赚佣金样式:灰底卡片 + ¥符号 + 赚徽标)
      priceHtml = ''
        + '<div class="resale-price resale-price--fixed">'
        +   '<div class="resale-price__card">'
        +     '<div class="resale-price__row">'
        +       '<span class="resale-price__label">我的售价：</span>'
        +       '<div class="resale-price__value-wrap">'
        +         '<span class="resale-price__price-group">'
        +           '<span class="resale-price__currency">¥</span>'
        +           '<span class="resale-price__amount" data-display-price>' + formatPrice(sample.current_price) + '</span>'
        +         '</span>'
        +         '<div class="resale-price__commission">'
        +           '<span class="resale-price__earn-badge">赚</span>'
        +           '<span class="resale-price__commission-group">'
        +             '<span class="resale-price__commission-currency">¥</span>'
        +             '<span class="resale-price__commission-amount" data-display-commission>' + formatPrice(sample.commission) + '</span>'
        +           '</span>'
        +         '</div>'
        +       '</div>'
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
        + '<div class="resale-price resale-price--editable">'
        +   '<div class="resale-price__card">'
        +     '<div class="resale-price__card-title">我的售价：</div>'
        +     '<div class="resale-price__input-row">'
        +       '<div class="resale-price__input-left">'
        +         '<span class="resale-price__currency">¥</span>'
        +         '<span class="resale-price__amount" data-display-price>' + formatPriceRange(minPrice, maxPrice) + '</span>'
        +       '</div>'
        +       '<div class="resale-price__commission">'
        +         '<span class="resale-price__earn-badge">赚</span>'
        +         '<span class="resale-price__commission-group">'
        +           '<span class="resale-price__commission-currency">¥</span>'
        +           '<span class="resale-price__commission-amount" data-display-commission>' + formatPriceRange(minAdd, maxAdd) + '</span>'
        +         '</span>'
        +       '</div>'
        +     '</div>'
        +     buildTagsHtml(sample, true)
        +   '</div>'
        + '</div>';
    } else {
      // 单一价格:售价可编辑(Figma 加价卖样式:灰底卡片 + 白底绿框输入行 + 赚徽标佣金 + 内联快捷加价)
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
        + '<div class="resale-price resale-price--editable">'
        +   '<div class="resale-price__card">'
        +     '<div class="resale-price__card-title">我的售价：</div>'
        +     '<div class="resale-price__input-row" data-price-edit>'
        +       '<div class="resale-price__input-left">'
        +         '<span class="resale-price__currency">¥</span>'
        +         '<span class="resale-price__amount" data-display-price>' + formatPrice(defaultPrice) + '</span>'
        +       '</div>'
        +       '<div class="resale-price__commission">'
        +         '<span class="resale-price__earn-badge">赚</span>'
        +         '<span class="resale-price__commission-group">'
        +           '<span class="resale-price__commission-currency">¥</span>'
        +           '<span class="resale-price__commission-amount" data-display-commission>' + formatPrice(defaultAdd) + '</span>'
        +         '</span>'
        +       '</div>'
        +     '</div>'
        +     buildTagsHtml(sample, true)
        +   '</div>'
        + '</div>';
    }

    // 快捷加价标签区(固定佣金不显示;单一价格和区间价格均已内联到售价卡片)
    var tagsHtml = '';

    // 佣金保密提示(非直播间均显示,含固定佣金)
    var hintHtml = '';
    if (!isLive) {
      hintHtml = '<div class="resale-hint-bottom">*帮卖分佣仅自己可见，可放心分享</div>';
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
          +   '<button data-component-slug="button" class="btn btn--weak btn--lg" data-action="confirm">我知道了</button>'
          + '</div>';
      } else {
        actionsHtml = ''
          + '<div class="modal__action--single-h">'
          +   '<button data-component-slug="button" class="btn btn--strong btn--lg" data-action="save">保存</button>'
          + '</div>';
      }
    } else if (sample.my_item) {
      if (isFixed) {
        // 编辑固定佣金:仅【分享】
        actionsHtml = ''
          + '<div class="modal__action--single-h">'
          +   '<button data-component-slug="button" class="btn btn--strong btn--lg" data-action="share">分享</button>'
          + '</div>';
      } else {
        // 编辑自由定价:【保存】+【分享】
        actionsHtml = ''
          + '<div class="modal__buttons">'
          +   '<button data-component-slug="button" class="btn btn--weak btn--lg" data-action="share">分享</button>'
          +   '<button data-component-slug="button" class="btn btn--strong btn--lg" data-action="save">保存</button>'
          + '</div>';
      }
    } else {
      // 初次帮卖:【帮卖并分享】
      actionsHtml = ''
        + '<div class="modal__action--single-h">'
        +   '<button data-component-slug="button" class="btn btn--strong btn--lg" data-action="resale-share">帮卖并分享</button>'
        + '</div>';
    }

    // 标题:问号图标(非直播间固定佣金也显示)
    var titleHelp = '';
    if (!isLive || !isFixed) {
      titleHelp = '<i class="wego-iconfont-s icon-wenhao navbar__title-help" data-resale-help></i>';
    }

    return ''
      + '<div class="modal modal--frame modal--has-actions" role="dialog" aria-modal="true" data-state="closed" data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="modal__title modal__title--default">'
      +       '<div class="navbar" data-component-slug="navbar">'
      +         '<div class="navbar__body">'
      +           '<div class="navbar__left">'
      +             '<div class="navbar__left-btn navbar__left-btn--circle" data-dom-id="popup-close" data-popup-close><i class="wego-iconfont-s icon-xiajiantou16"></i></div>'
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

  // ── 数字键盘模板(Figma: 顶部加价控件行 + 4列4行 grid 键盘) ──
  function buildKeypadTemplate(mode, initialValue) {
    var displayValue = initialValue ? String(initialValue) : '';
    var isPrice = mode === 'price';
    var isAmount = mode === 'amount';
    var segClass = isAmount ? 'is-amount' : 'is-rate';
    var labelText = isPrice ? '售价(元)' : (isAmount ? '加价(元)' : '加价(%)');

    var headerHtml = '';
    if (!isPrice) {
      headerHtml = ''
      + '<div class="keypad__header" data-keypad-segmented>'
      +   '<span class="keypad__header-label" data-keypad-label>' + labelText + '</span>'
      +   '<div class="keypad__header-value">'
      +     '<input class="keypad__header-amount" data-keypad-display type="text" inputmode="none" placeholder="0.00" aria-label="加价金额输入">'
      +   '</div>'
      +   '<div class="keypad__seg ' + segClass + '">'
      +     '<div class="keypad__seg-thumb"></div>'
      +     '<div class="keypad__seg-item ' + (isAmount ? 'is-active' : '') + '" data-keypad-tab="amount">金额</div>'
      +     '<div class="keypad__seg-item ' + (!isAmount ? 'is-active' : '') + '" data-keypad-tab="rate">比例</div>'
      +   '</div>'
      + '</div>';
    }

    return ''
      + '<div class="modal modal--frame modal--no-mask" role="dialog" aria-modal="true" data-state="closed" data-keypad-overlay data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="keypad ' + (isPrice ? 'is-price' : segClass) + '">'
      +       headerHtml
            // 键盘主体:4列×4行 grid,第4列跨前3行放回删+确定
      +       '<div class="keypad__keys">'
      +         '<div class="keypad__key" data-key="1">1</div>'
      +         '<div class="keypad__key" data-key="2">2</div>'
      +         '<div class="keypad__key" data-key="3">3</div>'
      +         '<div class="keypad__key keypad__key--delete" data-key="delete"><i class="wego-iconfont-s icon-tuige"></i></div>'
      +         '<div class="keypad__key" data-key="4">4</div>'
      +         '<div class="keypad__key" data-key="5">5</div>'
      +         '<div class="keypad__key" data-key="6">6</div>'
      +         '<button data-component-slug="button" class="keypad__key keypad__key--confirm" data-keypad-confirm>确定</button>'
      +         '<div class="keypad__key" data-key="7">7</div>'
      +         '<div class="keypad__key" data-key="8">8</div>'
      +         '<div class="keypad__key" data-key="9">9</div>'
      +         '<div class="keypad__key keypad__key--zero" data-key="0">0</div>'
      +         '<div class="keypad__key" data-key=".">.</div>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // ── 加价卖/赚佣金说明页模板(基于已确认简报组织) ──
  function buildHelpTemplate(isFixed) {
    var title = isFixed ? '赚佣金说明' : '加价卖说明';
    if (isFixed) {
      return ''
        + '<div class="modal modal--fullscreen" role="dialog" aria-modal="true" data-state="closed" data-component-slug="modal">'
        +   '<div class="modal__panel">'
        +     '<div class="modal__title modal__title--default">'
        +       '<div class="navbar" data-component-slug="navbar">'
        +         '<div class="navbar__body">'
        +           '<div class="navbar__left">'
        +             '<div class="navbar__left-btn navbar__left-btn--circle" data-help-close><i class="wego-iconfont-s icon-xiajiantou16"></i></div>'
        +           '</div>'
        +           '<div class="navbar__center"><span class="navbar__title">' + title + '</span></div>'
        +           '<div class="navbar__right"></div>'
        +         '</div>'
        +       '</div>'
        +     '</div>'
        +     '<div class="modal__body modal__body--safe-bottom resale-help__body">'
        +       '<div class="resale-help__section">'
        +         '<h3 class="resale-help__title">什么是赚佣金</h3>'
        +         '<p class="resale-help__text">供应商设定了固定佣金,你无需改价即可帮卖商品,佣金由供应商统一配置。</p>'
        +       '</div>'
        +       '<div class="resale-help__section">'
        +         '<h3 class="resale-help__title">售价与佣金</h3>'
        +         '<p class="resale-help__text">售价和佣金均为只读展示,不可修改;佣金已由供应商固定。</p>'
        +       '</div>'
        +       '<div class="resale-help__section">'
        +         '<h3 class="resale-help__title">佣金保密</h3>'
        +         '<p class="resale-help__text">帮卖分佣仅自己可见,买家无法查看,可放心分享。</p>'
        +       '</div>'
        +     '</div>'
        +   '</div>'
        + '</div>';
    }
    return ''
      + '<div class="modal modal--fullscreen" role="dialog" aria-modal="true" data-state="closed" data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="modal__title modal__title--default">'
      +       '<div class="navbar" data-component-slug="navbar">'
      +         '<div class="navbar__body">'
      +           '<div class="navbar__left">'
      +             '<div class="navbar__left-btn navbar__left-btn--circle" data-help-close><i class="wego-iconfont-s icon-xiajiantou16"></i></div>'
      +           '</div>'
      +           '<div class="navbar__center"><span class="navbar__title">' + title + '</span></div>'
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

  // ── 加载中状态模板(Figma 7207-2474) ──
  // 半屏弹窗 + 顶部下箭头收起 + 内容区居中 loading 组件 + 底部 home indicator
  function buildLoadingTemplate() {
    return ''
      + '<div class="modal modal--frame modal--state-loading" role="dialog" aria-modal="true" data-state="closed" data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="modal__title modal__title--default">'
      +       '<div class="navbar" data-component-slug="navbar">'
      +         '<div class="navbar__body">'
      +           '<div class="navbar__left">'
      +             '<div class="navbar__left-btn navbar__left-btn--circle" data-popup-close><i class="wego-iconfont-s icon-xiajiantou16"></i></div>'
      +           '</div>'
      +           '<div class="navbar__center"></div>'
      +           '<div class="navbar__right"></div>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="modal__body">'
      +       '<span class="loading" role="status" aria-label="加载中" data-component-slug="loading"><span class="loading__icon"><span class="loading__dot loading__dot--1"></span><span class="loading__dot loading__dot--2"></span><span class="loading__dot loading__dot--3"></span></span></span>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // ── 加载失败状态模板(Figma 7207-23599) ──
  // 半屏弹窗 + 顶部下箭头收起 + result 组件(叹号图标 + 标题内联 link) + 底部 home indicator
  function buildLoadFailedTemplate() {
    return ''
      + '<div class="modal modal--frame modal--state-load-failed" role="dialog" aria-modal="true" data-state="closed" data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="modal__title modal__title--default">'
      +       '<div class="navbar" data-component-slug="navbar">'
      +         '<div class="navbar__body">'
      +           '<div class="navbar__left">'
      +             '<div class="navbar__left-btn navbar__left-btn--circle" data-popup-close><i class="wego-iconfont-s icon-xiajiantou16"></i></div>'
      +           '</div>'
      +           '<div class="navbar__center"></div>'
      +           '<div class="navbar__right"></div>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="modal__body">'
      +       '<div class="result" data-component-slug="result">'
      +         '<div class="result__icon" aria-hidden="true">'
      +           '<i class="wego-iconfont-s icon-tanhao-mian"></i>'
      +         '</div>'
      +         '<div class="result__title">获取帮卖信息失败，<a class="link link--inline" href="javascript:void(0)" data-action="retry">请重试</a></div>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // ── 挂载场景选择页 ──
  function mountSelection(ctx) {
    var root = ctx.root;

    // 场景卡片点击（跳过已通过 data-dom-id 绑定的入口卡片）
    var cards = root.querySelectorAll('[data-scene-key]:not([data-dom-id])');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var key = card.getAttribute('data-scene-key');
        var sample = SCENE_SAMPLES.find(function (s) { return s.key === key; });
        if (!sample) return;
        openResalePopup(ctx, sample);
      });
    });
  }

  // ── @debug-temp-start ─────────────────────────────────────────
  // 临时调试入口:Loading 动画预览(对齐 wgoo LoadingIcon 16/24/32 三尺寸)
  // 正式合并前删除从 @debug-temp-start 到 @debug-temp-end 的整段代码
  function buildLoadingPreviewTemplate() {
    var loadingSvg = ''
      + '<span class="loading__icon">'
      +   '<span class="loading__dot loading__dot--1"></span>'
      +   '<span class="loading__dot loading__dot--2"></span>'
      +   '<span class="loading__dot loading__dot--3"></span>'
      + '</span>';
    var loadingHtml = '<span class="loading" role="status" aria-label="加载中" data-component-slug="loading">' + loadingSvg + '</span>';
    var loading16 = '<span class="loading loading--16" role="status" aria-label="加载中" data-component-slug="loading">' + loadingSvg + '</span>';
    var loading32 = '<span class="loading loading--32" role="status" aria-label="加载中" data-component-slug="loading">' + loadingSvg + '</span>';

    return ''
      + '<div class="modal modal--fullscreen" role="dialog" aria-modal="true" data-state="closed" data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="modal__title modal__title--default">'
      +       '<div class="navbar" data-component-slug="navbar">'
      +         '<div class="navbar__body">'
      +           '<div class="navbar__left">'
      +             '<div class="navbar__left-btn navbar__left-btn--circle" data-debug-close><i class="wego-iconfont-s icon-xiajiantou16"></i></div>'
      +           '</div>'
      +           '<div class="navbar__center"><span class="navbar__title">加载 · Loading</span></div>'
      +           '<div class="navbar__right"></div>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="modal__body modal__body--safe-bottom loading-preview__body">'
      +       '<div class="loading-preview__header">'
      +         '<h1 class="loading-preview__title">加载</h1>'
      +         '<p class="loading-preview__desc">三点涟漪脉冲加载指示器，用于内容区或弹窗等待态。</p>'
      +       '</div>'
      +       '<div class="loading-preview__section-title">尺寸 24 — 默认</div>'
      +       '<div class="loading-preview__stage">' + loadingHtml + '</div>'
      +       '<div class="loading-preview__section-title">尺寸 16 — 按钮内</div>'
      +       '<div class="loading-preview__row">'
      +         '<span class="loading-preview__size-label">16px</span>'
      +         loading16
      +       '</div>'
      +       '<div class="loading-preview__section-title">尺寸 32 — 大区域</div>'
      +       '<div class="loading-preview__stage">' + loading32 + '</div>'
      +       '<div class="loading-preview__note">默认 24px 三点涟漪脉冲加载图标(对齐 wgoo LoadingIcon)，两端点 1s ease-in-out 共用同一关键帧、第3点 delay:-1s 反相位；中间点 0.5s ease-out 短周期独立关键帧，形成三相位错落涟漪节奏；支持 16/24/32 尺寸按比例缩放；prefers-reduced-motion 时降级为整体淡入淡出。</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function mountDebugEntry(ctx) {
    var root = ctx.root;
    var scroll = root.querySelector('.layout-scroll');
    if (!scroll) return;

    var group = document.createElement('div');
    group.className = 'agent-resale-scene__group agent-resale-scene__group--debug';
    group.setAttribute('data-debug', '');
    group.innerHTML = ''
      + '<div class="agent-resale-scene__group-title">调试</div>'
      + '<div class="cell-group__content">'
      +   '<div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-debug-entry>'
      +     '<div class="cell__body">'
      +       '<div class="cell__content">'
      +         '<div class="cell__title-row">'
      +           '<span class="cell__title">Loading 动画预览</span>'
      +         '</div>'
      +         '<div class="cell__subtitle">对齐 wgoo LoadingIcon · 16/24/32 三尺寸</div>'
      +       '</div>'
      +       '<div class="cell__action">'
      +         '<span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--debug">调试</span>'
      +         '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';

    scroll.insertBefore(group, scroll.firstChild);

    var entry = group.querySelector('[data-debug-entry]');
    entry.addEventListener('click', function () {
      ctx.openFullScreenModal(buildLoadingPreviewTemplate(), {
        label: 'Loading 动画预览(调试)',
        init: function (overlayCtx) {
          var closeBtn = overlayCtx.root.querySelector('[data-debug-close]');
          if (closeBtn) {
            closeBtn.addEventListener('click', function () { ctx.closeOverlay(); });
          }
        }
      });
    });
  }
  // ── @debug-temp-end ───────────────────────────────────────────

  // ── 打开帮卖弹窗 ──
  function openResalePopup(ctx, sample) {
    // 异常状态:加载中(Figma 7207-2474 半屏弹窗 + 居中加载图标)
    if (sample.state === 'loading') {
      ctx.openSheet(buildLoadingTemplate(), {
        label: '帮卖弹窗-加载中',
        init: function (overlayCtx) {
          var root = overlayCtx.root;
          root.addEventListener('click', function (e) {
            if (!e.target.closest('.modal__panel')) ctx.closeOverlay();
          });
          var closeBtn = root.querySelector('[data-popup-close]');
          if (closeBtn) {
            closeBtn.addEventListener('click', function () { ctx.closeOverlay(); });
          }
        }
      });
      return;
    }

    // 异常状态:加载失败(Figma 7207-23599 半屏弹窗 + Result_60 信息组)
    if (sample.state === 'load-failed') {
      ctx.openSheet(buildLoadFailedTemplate(), {
        label: '帮卖弹窗-加载失败',
        init: function (overlayCtx) {
          var root = overlayCtx.root;
          root.addEventListener('click', function (e) {
            if (!e.target.closest('.modal__panel')) ctx.closeOverlay();
          });
          var closeBtn = root.querySelector('[data-popup-close]');
          if (closeBtn) {
            closeBtn.addEventListener('click', function () { ctx.closeOverlay(); });
          }
          // 点击"请重试"链接:toast 反馈并保持弹窗(原型模拟重试)
          var retryLink = root.querySelector('[data-action="retry"]');
          if (retryLink) {
            retryLink.addEventListener('click', function (e) {
              e.stopPropagation();
              ctx.toast('正在重试，请稍候');
            });
          }
        }
      });
      return;
    }

    // 异常场景:价格隐藏,改用 Dialog_Text 居中对话框
    if (sample.error_code === 'wholesale_hidden') {
      ctx.dialog({
        variant: 'text',
        title: '批发价被隐藏不支持帮卖',
        content: '确认后，将自动公开批发价支持帮卖',
        buttons: [
          { label: '取消', tone: 'dismiss' },
          { label: '确定', tone: 'confirm', onClick: function () { ctx.toast('批发价已设置为公开'); } }
        ]
      });
      return;
    }
    if (sample.error_code === 'all_price_hidden') {
      ctx.dialog({
        variant: 'text',
        title: '价格被隐藏不支持帮卖',
        content: '你店铺所有价格被隐藏，不支持帮卖，请前往价格管理设置',
        buttons: [
          { label: '取消', tone: 'dismiss' },
          { label: '前往设置', tone: 'confirm', onClick: function () { ctx.toast('跳转价格管理设置页'); } }
        ]
      });
      return;
    }

    var template = buildPopupTemplate(sample);

    ctx.openSheet(template, {
      label: '帮卖弹窗',
      init: function (overlayCtx) {
        var root = overlayCtx.root;

        // 点击蒙层(弹窗 panel 之外的空白区)关闭弹窗
        root.addEventListener('click', function (e) {
          if (!e.target.closest('.modal__panel')) {
            ctx.closeOverlay();
          }
        });

        // 关闭按钮
        var closeBtn = root.querySelector('[data-popup-close]');
        if (closeBtn) {
          closeBtn.addEventListener('click', function () { ctx.closeOverlay(); });
        }

        // 标题/问号点击打开说明页
        var resaleTitle = root.querySelector('[data-resale-title]');
        var resaleHelp = root.querySelector('[data-resale-help]');
        if (resaleTitle) {
          resaleTitle.addEventListener('click', function () { openHelp(ctx, isFixed); });
        }
        if (resaleHelp) {
          resaleHelp.addEventListener('click', function (e) { e.stopPropagation(); openHelp(ctx, isFixed); });
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
            // 固定佣金编辑场景:分享后关闭弹窗
            if (isFixed) {
              ctx.closeOverlay();
            }
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
              t.classList.add('tag--white', 'tag--normal');
            });
            tag.classList.remove('tag--white', 'tag--normal');
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
            var priceEl = root.querySelector('[data-display-price]');
            var currentPrice = priceEl ? priceEl.textContent : '';
            openKeypad(ctx, root, sample, 'price', currentPrice);
          });
        }
      }
    });
  }

  // ── 打开加价卖/赚佣金说明页 ──
  function openHelp(ctx, isFixed) {
    ctx.openFullScreenModal(buildHelpTemplate(isFixed), {
      label: isFixed ? '赚佣金说明' : '加价卖说明',
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

      var priceEl = root.querySelector('[data-display-price]');
      var commissionEl = root.querySelector('[data-display-commission]');
      if (priceEl) priceEl.textContent = formatPrice(newPrice);
      if (commissionEl) commissionEl.textContent = formatPrice(addPrice);
    }
  }

  // ── 打开数字键盘 ──
  function openKeypad(ctx, popupRoot, sample, mode, initialValue) {
    var isPriceMode = mode === 'price';
    var keypadMode = isPriceMode ? 'price' : mode;
    var cleanedValue = initialValue ? String(initialValue).replace(/[^0-9.]/g, '') : '';
    var template = buildKeypadTemplate(keypadMode, cleanedValue);

    // 售价模式:实时更新弹窗中的售价显示
    var popupPriceEl = isPriceMode ? popupRoot.querySelector('[data-display-price]') : null;
    var priceInputRow = isPriceMode ? popupRoot.querySelector('[data-price-edit]') : null;

    ctx.openSheet(template, {
      label: '数字键盘',
      onDestroy: function () {
        if (priceInputRow) {
          priceInputRow.classList.remove('is-editing');
        }
      },
      init: function (overlayCtx) {
        var root = overlayCtx.root;

        var currentMode = isPriceMode ? 'amount' : keypadMode;
        var currentValue = cleanedValue;
        var displayEl = root.querySelector('[data-keypad-display]');
        var labelEl = root.querySelector('[data-keypad-label]');

        function updateDisplay() {
          if (isPriceMode) {
            // 售价模式:无键盘头部,直接更新弹窗中的售价显示
            if (popupPriceEl) {
              popupPriceEl.textContent = currentValue || '0';
            }
            if (priceInputRow) {
              priceInputRow.classList.add('is-editing');
            }
          } else {
            var isAmount = currentMode === 'amount';
            var labelText = isAmount ? '加价(元)' : '加价(%)';
            if (labelEl) labelEl.textContent = labelText;
            if (displayEl) {
              // 原生 input 展示,值由自定义键盘控制;空输入显示占位文本(金额0.00/比例0)
              displayEl.value = currentValue || '';
              displayEl.placeholder = isAmount ? '0.00' : '0';
            }
          }
        }

        // input 接管:阻止物理键盘实际输入(值由自定义键盘控制),仅保留原生 caret 展示
        if (displayEl && !isPriceMode) {
          displayEl.addEventListener('beforeinput', function (e) { e.preventDefault(); });
          displayEl.addEventListener('input', function (e) { e.preventDefault(); });
          // 键盘拉起后激活 input 显示光标:overlay 入场 open 后(visibility 变 visible)再聚焦
          var overlayRoot = displayEl.closest('.modal');
          if (overlayRoot) {
            var focusOnce = function () {
              if (overlayRoot.getAttribute('data-state') === 'open') {
                displayEl.focus({ preventScroll: true });
                obs.disconnect();
              }
            };
            var obs = new MutationObserver(focusOnce);
            obs.observe(overlayRoot, { attributes: true, attributeFilter: ['data-state'] });
            focusOnce();
          } else {
            setTimeout(function () { displayEl.focus(); }, 0);
          }
        }

        // Seg_32 分段切换(金额/比例):切换时清空输入
        var seg = root.querySelector('.keypad__seg');
        var keypadRoot = root.querySelector('.keypad');
        var tabs = root.querySelectorAll('[data-keypad-tab]');
        tabs.forEach(function (tab) {
          tab.addEventListener('click', function () {
            var newMode = tab.getAttribute('data-keypad-tab');
            if (newMode === currentMode) return;

            // 切换时清空输入
            currentValue = '';
            currentMode = newMode;
            tabs.forEach(function (t) { t.classList.remove('is-active'); });
            tab.classList.add('is-active');
            // 同步滑动 thumb 位置(在 .keypad__seg 和 .keypad 上同时切换 class)
            if (seg) {
              seg.classList.toggle('is-amount', currentMode === 'amount');
              seg.classList.toggle('is-rate', currentMode === 'rate');
            }
            if (keypadRoot) {
              keypadRoot.classList.toggle('is-amount', currentMode === 'amount');
              keypadRoot.classList.toggle('is-rate', currentMode === 'rate');
            }
            updateDisplay();
            // 切换金额/比例后重新激活 input 显示光标
            if (displayEl && document.activeElement !== displayEl) {
              displayEl.focus({ preventScroll: true });
            }
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
          // 自定义键盘点击会让 input 失焦,重新聚焦保持光标显示
          if (displayEl && document.activeElement !== displayEl) {
            displayEl.focus({ preventScroll: true });
          }
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
              ctx.toast(isPriceMode ? '请输入售价' : '请输入加价');
              return;
            }

            var numValue = parseFloat(currentValue);
            if (isNaN(numValue) || numValue <= 0) {
              ctx.toast(isPriceMode ? '请输入正确的售价' : '请输入正确的加价');
              return;
            }

            var supplyPrice = getSupplyPriceForCalc(sample);

            if (isPriceMode) {
              // 售价模式:加价 = 售价 - 供货价
              var addPrice = numValue - supplyPrice;
              if (addPrice <= 0) {
                ctx.toast('售价需大于供货价¥' + formatPrice(supplyPrice));
                return;
              }
              var rate = amountToRate(addPrice, supplyPrice);
              if (!validateRate(rate)) {
                ctx.toast('加价比例需在1%-300%之间');
                return;
              }
              updatePopupPrice(popupRoot, sample, addPrice, 1, String(addPrice));
            } else {
              // 加价模式:金额模式直接用金额,比例模式用户输入百分比需转小数
              var rate;
              if (currentMode === 'amount') {
                rate = amountToRate(numValue, supplyPrice);
              } else {
                rate = numValue / 100;
              }

              if (!validateRate(rate)) {
                if (currentMode === 'amount') {
                  ctx.toast('加价金额需在¥' + formatPrice(supplyPrice * 0.01) + '~' + formatPrice(supplyPrice * 3) + '之间');
                } else {
                  ctx.toast('加价比例需在1%~300%之间');
                }
                return;
              }

              var addPrice;
              var addType;
              var addValue;

              if (currentMode === 'amount') {
                addPrice = numValue;
                addType = 1;
                addValue = String(numValue);
              } else {
                addPrice = rateToAmount(rate, supplyPrice);
                addType = 2;
                addValue = String(rate);
              }

              // 缓存自定义加价(比例存小数)
              var cacheData = currentMode === 'amount'
                ? { type: 1, value: numValue }
                : { type: 2, rate: rate };
              setStorage(STORAGE_KEYS.customAddPrice, JSON.stringify(cacheData));

              updatePopupPrice(popupRoot, sample, addPrice, addType, addValue);
            }

            // 手动输入完成后,把输入值替换到第三个快捷标签并高亮该标签
            var tagItems = popupRoot.querySelectorAll('.resale-tags__item');
            tagItems.forEach(function (t, idx) {
              if (idx === tagItems.length - 1) {
                // 第三个标签:替换为手动输入值并高亮
                var labelText = addType === 1
                  ? '+' + formatPrice(addPrice) + '元'
                  : '+' + formatRate(Number(addValue));
                t.setAttribute('data-tag-amounttype', addType);
                t.setAttribute('data-tag-value', addType === 1 ? addValue : '');
                t.setAttribute('data-tag-rate', addType === 2 ? addValue : '');
                t.querySelector('.tag__label').textContent = labelText;
                t.classList.remove('tag--white', 'tag--normal');
                t.classList.add('tag--brand', 'tag--selected');
              } else {
                // 其余标签取消高亮
                t.classList.remove('tag--brand', 'tag--selected');
                t.classList.add('tag--white', 'tag--normal');
              }
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
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-dom-id="open-resale-popup" data-scene-key="first-resale-free-single">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">初次帮卖 · 自由定价 · 单一价格</span>
                </div>
                <div class="cell__subtitle">供货价178.5 · 默认加价+30 · 售价208.5</div>
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
                <div class="cell__subtitle">售价208.5 · 佣金30 · 只读</div>
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
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="loading-state">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">加载中</span>
                </div>
                <div class="cell__subtitle">弹窗加载中 · 居中加载图标</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--error">异常</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="load-failed-state">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">加载失败</span>
                </div>
                <div class="cell__subtitle">获取帮卖信息失败 · 点击请重试</div>
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
      var root = ctx.root;
      var entryCard = root.querySelector('[data-dom-id="open-resale-popup"]');
      if (entryCard) {
        entryCard.addEventListener('click', function () {
          var sample = SCENE_SAMPLES.find(function (s) { return s.key === 'first-resale-free-single'; });
          if (sample) openResalePopup(ctx, sample);
        });
      }
      mountSelection(ctx);
      mountDebugEntry(ctx); // @debug-temp
    }
  });
})();
