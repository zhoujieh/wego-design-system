/* 帮卖弹窗（代理商帮卖 / 加价卖 / 赚佣金）可复用组件
   - 抽出自 wego-app/scenes/帮卖分销/scene.js，改为全局加载，供任意业务场景拉起。
   - 暴露 window.WegoApp.openAgentResalePopup(ctx, options)
       options.sample: 帮卖样例数据（与帮卖分销 SCENE_SAMPLES 同契约）
         { product_id, distribution_type(1=自由定价/2=固定佣金), distribution_config,
           supply_price(数字 或 [min,max] 区间), skus, my_item, current_price,
           commission, from_page('normal'|'live'), state('loading'|'load-failed'),
           error_code('wholesale_hidden'|'all_price_hidden') }
       options.mode:   'resale'(默认,代理商视角) | 'configure'(供应商配置视角,仅「保存」)
       options.onResult: 可选。用户在保存/分享/帮卖并分享 时回调，
                         入参 { distribution_type, distribution_config }（含用户在键盘/快捷标签上的最新编辑）
   - 依赖宿主 ctx 提供的 openSheet / openFullScreenModal / closeOverlay / dialog / toast。 */

(function () {
  'use strict';

  var WegoApp = (window.WegoApp = window.WegoApp || {});

  var STORAGE_KEYS = {
    customAddPrice: 'agent-resale-custom-add-price',
    showEditFreeTip: 'agent-resale-show-edit-free-tip'
  };

  // ── 工具函数 ──
  function formatPrice(value) {
    if (value === null || value === undefined || value === '') return '--';
    var num = Number(value);
    if (isNaN(num)) return '--';
    if (Math.abs(num - Math.round(num)) < 0.001) return String(Math.round(num));
    return String(parseFloat(num.toFixed(2)));
  }

  function formatRate(rate) {
    if (rate === null || rate === undefined) return '--';
    var percent = Number(rate) * 100;
    if (Math.abs(percent - Math.round(percent)) < 0.01) return Math.round(percent) + '%';
    return percent.toFixed(1) + '%';
  }

  function formatPriceRange(min, max) {
    if (min === max) return formatPrice(min);
    return formatPrice(min) + '~' + formatPrice(max);
  }

  function computePrice(supplyPrice, addPrice) {
    return Number(supplyPrice) + Number(addPrice);
  }

  function amountToRate(amount, supplyPrice) {
    if (!supplyPrice) return 0;
    return Number(amount) / Number(supplyPrice);
  }

  function rateToAmount(rate, supplyPrice) {
    return Number(rate) * Number(supplyPrice);
  }

  function validateRate(rate) {
    var percent = Number(rate) * 100;
    return percent >= 1 && percent <= 300;
  }

  function getStorage(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function setStorage(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function getQuickTags(sample, currentAdd) {
    var tags = [];
    var customStr = getStorage(STORAGE_KEYS.customAddPrice);
    var custom = customStr ? JSON.parse(customStr) : null;

    var isAmountMode = sample.distribution_config && sample.distribution_config.amountType === 1;
    var fallbackAmounts = [30, 20, 10];
    var fallbackRates = [0.3, 0.2, 0.1];

    if (currentAdd) {
      if (currentAdd.type === 1 && currentAdd.value) {
        tags.push({ amountType: 1, value: Number(currentAdd.value), label: '+' + formatPrice(currentAdd.value) + '元' });
      } else if (currentAdd.type === 2 && currentAdd.rate) {
        tags.push({ amountType: 2, rate: Number(currentAdd.rate), label: '+' + formatRate(currentAdd.rate) });
      }
    }

    if (custom && (!currentAdd || JSON.stringify(custom) !== JSON.stringify({ type: currentAdd.type, value: currentAdd.value, rate: currentAdd.rate }))) {
      if (custom.type === 1) {
        tags.push({ amountType: 1, value: custom.value, label: '+' + formatPrice(custom.value) + '元' });
      } else {
        tags.push({ amountType: 2, rate: custom.rate, label: '+' + formatRate(custom.rate) });
      }
    }

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

  function isRangePrice(sample) {
    return Array.isArray(sample.supply_price);
  }
  function isFixedRebate(sample) {
    return sample.distribution_type === 2;
  }
  function isLiveRoom(sample) {
    return sample.from_page === 'live';
  }

  // 把用户在快捷标签/键盘上的最新加价写回 working 配置
  function applyWorkingConfig(working, addType, addValue) {
    if (addType === 1) {
      working.distribution_config = { amountType: 1, value: Number(addValue) };
    } else {
      working.distribution_config = { amountType: 2, rate: Number(addValue) };
    }
  }

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

  function buildPopupTemplate(sample, mode) {
    var isFixed = isFixedRebate(sample);
    var title = isFixed ? '赚佣金' : '加价卖';
    var isLive = isLiveRoom(sample);
    var isRange = isRangePrice(sample);

    var priceHtml = '';
    if (isFixed) {
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

    var tagsHtml = '';

    var hintHtml = '';
    if (!isLive) {
      hintHtml = '<div class="resale-hint-bottom">*帮卖分佣仅自己可见，可放心分享</div>';
    }

    var bubbleHtml = '';
    if (sample.my_item && !isFixed && !isRange && !getStorage(STORAGE_KEYS.showEditFreeTip)) {
      bubbleHtml = '<div class="resale-bubble" data-edit-bubble>可修改你的售价,赚更多</div>';
    }

    var actionsHtml = '';
    if (mode === 'configure') {
      // 供应商配置视角：单一「保存」按钮（固定佣金亦同）
      actionsHtml = ''
        + '<div class="modal__action--single-h">'
        +   '<button data-component-slug="button" class="btn btn--strong btn--lg" data-action="save">保存</button>'
        + '</div>';
    } else if (isLive) {
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
        actionsHtml = ''
          + '<div class="modal__action--single-h">'
          +   '<button data-component-slug="button" class="btn btn--strong btn--lg" data-action="share">分享</button>'
          + '</div>';
      } else {
        actionsHtml = ''
          + '<div class="modal__buttons">'
          +   '<button data-component-slug="button" class="btn btn--weak btn--lg" data-action="share">分享</button>'
          +   '<button data-component-slug="button" class="btn btn--strong btn--lg" data-action="save">保存</button>'
          + '</div>';
      }
    } else {
      actionsHtml = ''
        + '<div class="modal__action--single-h">'
        +   '<button data-component-slug="button" class="btn btn--strong btn--lg" data-action="resale-share">帮卖并分享</button>'
        + '</div>';
    }

    var titleHelp = '';
    if (!isLive || !isFixed) {
      titleHelp = '<i class="wego-iconfont-s icon-wenhao navbar__title-help" data-resale-help></i>';
    }

    return ''
      + '<div class="modal modal--frame modal--has-actions resale-popup" role="dialog" aria-modal="true" data-state="closed" data-component-slug="modal">'
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
      +     '<div class="keypad__seg-item ' + (isAmount ? 'is-active' : '') + '" data-keypad-tab="amount">按金额</div>'
      +     '<div class="keypad__seg-item ' + (!isAmount ? 'is-active' : '') + '" data-keypad-tab="rate">按比例</div>'
      +   '</div>'
      + '</div>';
    }

    return ''
      + '<div class="modal modal--frame modal--no-mask" role="dialog" aria-modal="true" data-state="closed" data-keypad-overlay data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="keypad ' + (isPrice ? 'is-price' : segClass) + '">'
      +       headerHtml
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

  function getSupplyPriceForCalc(sample) {
    if (isRangePrice(sample)) return sample.supply_price[0];
    return sample.supply_price;
  }

  function setFieldValue(el, text) {
    if (!el) return;
    el.innerHTML = text + '<span class="resale-price__field-suffix">元</span>';
  }

  function updatePopupPrice(root, sample, addPrice, addType, addValue) {
    if (isRangePrice(sample)) {
      var minSupply = sample.supply_price[0];
      var maxSupply = sample.supply_price[1];
      var minAdd, maxAdd;

      if (addType === 1) {
        minAdd = addPrice;
        maxAdd = addPrice;
      } else {
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

  function openKeypad(ctx, popupRoot, sample, mode, initialValue, working) {
    var isPriceMode = mode === 'price';
    var keypadMode = isPriceMode ? 'price' : mode;
    var cleanedValue = initialValue ? String(initialValue).replace(/[^0-9.]/g, '') : '';
    var template = buildKeypadTemplate(keypadMode, cleanedValue);

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
            if (popupPriceEl) {
              popupPriceEl.textContent = currentValue || '';
            }
            if (priceInputRow) {
              priceInputRow.classList.add('is-editing');
            }
          } else {
            var isAmount = currentMode === 'amount';
            var labelText = isAmount ? '加价(元)' : '加价(%)';
            if (labelEl) labelEl.textContent = labelText;
            if (displayEl) {
              displayEl.value = currentValue || '';
              displayEl.placeholder = isAmount ? '0.00' : '0';
            }
          }
        }

        if (displayEl && !isPriceMode) {
          displayEl.addEventListener('beforeinput', function (e) { e.preventDefault(); });
          displayEl.addEventListener('input', function (e) { e.preventDefault(); });
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

        var seg = root.querySelector('.keypad__seg');
        var keypadRoot = root.querySelector('.keypad');
        var tabs = root.querySelectorAll('[data-keypad-tab]');
        tabs.forEach(function (tab) {
          tab.addEventListener('click', function () {
            var newMode = tab.getAttribute('data-keypad-tab');
            if (newMode === currentMode) return;

            currentValue = '';
            currentMode = newMode;
            tabs.forEach(function (t) { t.classList.remove('is-active'); });
            tab.classList.add('is-active');
            if (seg) {
              seg.classList.toggle('is-amount', currentMode === 'amount');
              seg.classList.toggle('is-rate', currentMode === 'rate');
            }
            if (keypadRoot) {
              keypadRoot.classList.toggle('is-amount', currentMode === 'amount');
              keypadRoot.classList.toggle('is-rate', currentMode === 'rate');
            }
            updateDisplay();
            if (displayEl && document.activeElement !== displayEl) {
              displayEl.focus({ preventScroll: true });
            }
          });
        });

        var keys = root.querySelectorAll('[data-key]');
        keys.forEach(function (key) {
          key.addEventListener('click', function () {
            var k = key.getAttribute('data-key');
            handleKeyPress(k);
          });

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
            if (currentValue.indexOf('.') === -1 && currentValue !== '') {
              currentValue += '.';
            }
          } else {
            var dotIndex = currentValue.indexOf('.');
            if (dotIndex !== -1 && currentValue.length - dotIndex - 1 >= 2) {
              return;
            }
            currentValue += k;
          }
          updateDisplay();
          if (displayEl && document.activeElement !== displayEl) {
            displayEl.focus({ preventScroll: true });
          }
        }

        root.addEventListener('click', function (e) {
          if (e.target.closest('.modal__panel')) return;
          if (isPriceMode && currentValue) {
            var sp = getSupplyPriceForCalc(sample);
            var num = parseFloat(currentValue);
            var add = num - sp;
            var r = amountToRate(add, sp);
            if (isNaN(num) || num <= 0) {
              ctx.toast('请输入正确的售价');
              return;
            }
            if (add <= 0) {
              ctx.toast('售价需大于供货价' + formatPrice(sp) + '元');
              return;
            }
            if (!validateRate(r)) {
              if (r < 0.01) {
                ctx.toast('金额不能小于' + formatPrice(sp * 1.01) + '元');
              } else {
                ctx.toast('金额不能大于' + formatPrice(sp * 4) + '元');
              }
              return;
            }
          }
          ctx.closeOverlay();
        });

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

            var addPrice;
            var addType;
            var addValue;

            if (isPriceMode) {
              addPrice = numValue - supplyPrice;
              if (addPrice <= 0) {
                ctx.toast('售价需大于供货价' + formatPrice(supplyPrice) + '元');
                return;
              }
              var rate = amountToRate(addPrice, supplyPrice);
              if (!validateRate(rate)) {
                if (rate < 0.01) {
                  ctx.toast('金额不能小于' + formatPrice(supplyPrice * 1.01) + '元');
                } else {
                  ctx.toast('金额不能大于' + formatPrice(supplyPrice * 4) + '元');
                }
                return;
              }
              addType = 1;
              addValue = String(addPrice);
              updatePopupPrice(popupRoot, sample, addPrice, 1, String(addPrice));
              if (working) applyWorkingConfig(working, 1, addPrice);
            } else {
              var rate2;
              if (currentMode === 'amount') {
                rate2 = amountToRate(numValue, supplyPrice);
              } else {
                rate2 = numValue / 100;
              }

              if (!validateRate(rate2)) {
                if (currentMode === 'amount') {
                  if (rate2 < 0.01) {
                    ctx.toast('佣金金额不能小于' + formatPrice(supplyPrice * 0.01) + '元');
                  } else {
                    ctx.toast('佣金金额不能大于' + formatPrice(supplyPrice * 3) + '元');
                  }
                } else {
                  if (rate2 < 0.01) {
                    ctx.toast('佣金金额不能小于1%');
                  } else {
                    ctx.toast('佣金金额不能大于300%');
                  }
                }
                return;
              }

              if (currentMode === 'amount') {
                addPrice = numValue;
                addType = 1;
                addValue = String(numValue);
              } else {
                addPrice = rateToAmount(rate2, supplyPrice);
                addType = 2;
                addValue = String(rate2);
              }

              var cacheData = currentMode === 'amount'
                ? { type: 1, value: numValue }
                : { type: 2, rate: rate2 };
              setStorage(STORAGE_KEYS.customAddPrice, JSON.stringify(cacheData));

              updatePopupPrice(popupRoot, sample, addPrice, addType, addValue);
              if (working) applyWorkingConfig(working, addType, addValue);
            }

            var tagItems = popupRoot.querySelectorAll('.resale-tags__item');
            tagItems.forEach(function (t, idx) {
              if (idx === tagItems.length - 1) {
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

  // ── 打开帮卖弹窗 ──
  function openResalePopup(ctx, options, sample, mode, onResult, working) {
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

    var isFixed = isFixedRebate(sample);
    var template = buildPopupTemplate(sample, mode);

    ctx.openSheet(template, {
      label: '帮卖弹窗',
      init: function (overlayCtx) {
        var root = overlayCtx.root;

        root.addEventListener('click', function (e) {
          if (!e.target.closest('.modal__panel')) {
            ctx.closeOverlay();
          }
        });

        var closeBtn = root.querySelector('[data-popup-close]');
        if (closeBtn) {
          closeBtn.addEventListener('click', function () { ctx.closeOverlay(); });
        }

        var resaleTitle = root.querySelector('[data-resale-title]');
        var resaleHelp = root.querySelector('[data-resale-help]');
        if (resaleTitle) {
          resaleTitle.addEventListener('click', function () { openHelp(ctx, isFixed); });
        }
        if (resaleHelp) {
          resaleHelp.addEventListener('click', function (e) { e.stopPropagation(); openHelp(ctx, isFixed); });
        }

        function commit(action) {
          if (typeof onResult === 'function') {
            onResult({ distribution_type: working.distribution_type, distribution_config: working.distribution_config });
          }
          if (action === 'resale-share') {
            ctx.toast('帮卖成功');
          } else if (action === 'save') {
            ctx.toast('保存成功');
          } else if (action === 'share') {
            ctx.toast('分享面板已拉起');
          }
          ctx.closeOverlay();
        }

        var saveBtn = root.querySelector('[data-action="save"]');
        if (saveBtn) {
          saveBtn.addEventListener('click', function () { commit('save'); });
        }
        var shareBtn = root.querySelector('[data-action="share"]');
        if (shareBtn) {
          shareBtn.addEventListener('click', function () {
            // 固定佣金编辑/配置场景:分享后关闭弹窗
            if (isFixed || mode === 'configure') {
              commit('share');
            } else {
              ctx.toast('分享面板已拉起');
            }
          });
        }
        var resaleShareBtn = root.querySelector('[data-action="resale-share"]');
        if (resaleShareBtn) {
          resaleShareBtn.addEventListener('click', function () { commit('resale-share'); });
        }
        var confirmBtn = root.querySelector('[data-action="confirm"]');
        if (confirmBtn) {
          confirmBtn.addEventListener('click', function () { ctx.closeOverlay(); });
        }

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

        var tagItems = root.querySelectorAll('.resale-tags__item');
        tagItems.forEach(function (tag) {
          tag.addEventListener('click', function () {
            var amountType = Number(tag.getAttribute('data-tag-amounttype'));
            var value = tag.getAttribute('data-tag-value');
            var rate = tag.getAttribute('data-tag-rate');

            tagItems.forEach(function (t) {
              t.classList.remove('tag--brand', 'tag--selected');
              t.classList.add('tag--white', 'tag--normal');
            });
            tag.classList.remove('tag--white', 'tag--normal');
            tag.classList.add('tag--brand', 'tag--selected');

            var addPrice;
            if (amountType === 1) {
              addPrice = Number(value);
            } else {
              addPrice = rateToAmount(Number(rate), getSupplyPriceForCalc(sample));
            }
            updatePopupPrice(root, sample, addPrice, amountType, amountType === 1 ? value : rate);
            if (working) applyWorkingConfig(working, amountType, amountType === 1 ? value : rate);
          });
        });

        var manualInput = root.querySelector('[data-manual-input]');
        if (manualInput) {
          manualInput.addEventListener('click', function () {
            openKeypad(ctx, root, sample, 'amount', '', working);
          });
        }

        var priceEdit = root.querySelector('[data-price-edit]');
        if (priceEdit) {
          priceEdit.addEventListener('click', function () {
            var priceEl = root.querySelector('[data-display-price]');
            var currentPrice = priceEl ? priceEl.textContent : '';
            openKeypad(ctx, root, sample, 'price', currentPrice, working);
          });
        }
      }
    });
  }

  // ── 对外 API ──
  WegoApp.openAgentResalePopup = function (ctx, options) {
    options = options || {};
    var sample = options.sample || {};
    var mode = options.mode || 'resale';
    var onResult = typeof options.onResult === 'function' ? options.onResult : null;

    var working = {
      distribution_type: sample.distribution_type,
      distribution_config: sample.distribution_config
        ? JSON.parse(JSON.stringify(sample.distribution_config))
        : { amountType: 1, value: 30 }
    };

    openResalePopup(ctx, options, sample, mode, onResult, working);
  };
})();
