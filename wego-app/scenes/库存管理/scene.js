(function () {
  var STATE = {
    items: [
      { id: 'sku-1', title: '云纱衬衫 S码', warehouse: '杭州一仓', available: 18, reserved: 4, sales7d: 12 },
      { id: 'sku-2', title: '轻羽短裙 M码', warehouse: '杭州一仓', available: 56, reserved: 6, sales7d: 15 },
      { id: 'sku-3', title: '奶油针织开衫 L码', warehouse: '广州分仓', available: 9, reserved: 2, sales7d: 11 },
      { id: 'sku-4', title: '雾灰西裤 XL码', warehouse: '广州分仓', available: 26, reserved: 8, sales7d: 7 },
      { id: 'sku-5', title: '豆沙色吊带均码', warehouse: '直播备货仓', available: 5, reserved: 0, sales7d: 9 }
    ],
    alertSettings: {
      enabled: true,
      threshold: 20,
      scope: '仅在售商品',
      includeReserved: false,
      appNotice: true,
      digestNotice: true,
      digestTime: '09:00',
      autoRestock: true,
      keyItemsCount: 3
    }
  };

  var THRESHOLD_OPTIONS = [10, 20, 30, 50];
  var SCOPE_OPTIONS = ['全部商品', '仅在售商品', '重点商品'];
  var DIGEST_TIME_OPTIONS = ['09:00', '12:00', '18:00'];
  var KEY_ITEM_OPTIONS = [0, 3, 8];

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cloneSettings() {
    return JSON.parse(JSON.stringify(STATE.alertSettings));
  }

  function getStockStatus(item, settings) {
    var compareValue = settings.includeReserved ? item.available + item.reserved : item.available;
    if (!settings.enabled) {
      return { label: '未启用', summaryClass: 'is-neutral' };
    }
    if (compareValue <= Math.floor(settings.threshold / 2)) {
      return { label: '紧急', summaryClass: 'is-danger' };
    }
    if (compareValue <= settings.threshold) {
      return { label: '预警', summaryClass: 'is-warning' };
    }
    return { label: '正常', summaryClass: 'is-normal' };
  }

  function getAlertCount(settings) {
    return STATE.items.filter(function (item) {
      var status = getStockStatus(item, settings);
      return status.label === '紧急' || status.label === '预警';
    }).length;
  }

  function getPendingRestockCount(settings) {
    if (!settings.enabled || !settings.autoRestock) return 0;
    return getAlertCount(settings);
  }

  function getSettingsSummary(settings) {
    if (!settings.enabled) return '已关闭';
    return '低于' + settings.threshold + '件预警';
  }

  function metricMarkup(label, value, toneClass) {
    return ''
      + '<div class="inventory-summary__metric ' + toneClass + '">'
      +   '<div class="inventory-summary__label">' + esc(label) + '</div>'
      +   '<div class="inventory-summary__value">' + esc(value) + '</div>'
      + '</div>';
  }

  function inventoryCellMarkup(item, isLast) {
    var status = getStockStatus(item, STATE.alertSettings);
    var divider = isLast ? '' : ' cell--divider-right-edge';
    var subtitle = item.warehouse
      + ' · 可售' + item.available
      + ' · 预占' + item.reserved
      + ' · 近7天销' + item.sales7d;

    return ''
      + '<div class="cell cell--double cell--bg-white' + divider + '">'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + esc(item.title) + '</span></div>'
      +       '<div class="cell__subtitle">' + esc(subtitle) + '</div>'
      +     '</div>'
      +     '<div class="cell__action">'
      +       '<span class="cell__action-text inventory-stock-status ' + status.summaryClass + '">' + esc(status.label) + '</span>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function inventoryListTemplate() {
    var settings = STATE.alertSettings;
    var alertCount = getAlertCount(settings);
    var pendingRestock = getPendingRestockCount(settings);
    var metrics = [
      metricMarkup('总 SKU', STATE.items.length, 'is-neutral'),
      metricMarkup('预警商品', alertCount, alertCount > 0 ? 'is-warning' : 'is-neutral'),
      metricMarkup('待补货', pendingRestock, pendingRestock > 0 ? 'is-danger' : 'is-neutral')
    ].join('');
    var rows = STATE.items.map(function (item, index) {
      return inventoryCellMarkup(item, index === STATE.items.length - 1);
    }).join('');

    return ''
      + '<section class="inventory-page" data-bg="page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<div class="navbar__left-btn" data-action="back" role="button" aria-label="返回"><i class="wego-iconfont-s icon-fanhui"></i></div>'
      +       '</div>'
      +       '<div class="navbar__center"><span class="navbar__title">库存管理</span></div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="inventory-page__body">'
      +     '<section class="inventory-summary" aria-label="库存概览">' + metrics + '</section>'
      +     '<div class="cell-group">'
      +       '<div class="cell-group__content cell-group__content--card">'
      +         '<button type="button" class="cell cell--single cell--bg-white cell--clickable" data-action="open-alert-settings">'
      +           '<div class="cell__body">'
      +             '<div class="cell__content">'
      +               '<div class="cell__title-row"><span class="cell__title">库存预警设置</span></div>'
      +             '</div>'
      +             '<div class="cell__action">'
      +               '<span class="cell__action-text">' + esc(getSettingsSummary(settings)) + '</span>'
      +               '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>'
      +             '</div>'
      +           '</div>'
      +         '</button>'
      +       '</div>'
      +     '</div>'
      +     '<div class="cell-group">'
      +       '<div class="cell-group__title">当前库存</div>'
      +       '<div class="cell-group__content cell-group__content--card">' + rows + '</div>'
      +     '</div>'
      +   '</div>'
      + '</section>';
  }

  function switchMarkup(key, value) {
    var stateClass = value ? 'switch--on' : 'switch--off';
    return ''
      + '<div class="switch ' + stateClass + '" data-switch-key="' + esc(key) + '" role="switch" aria-checked="' + (value ? 'true' : 'false') + '" tabindex="0">'
      +   '<div class="switch__thumb"></div>'
      + '</div>';
  }

  function settingsRowMarkup(options) {
    var title = options.title;
    var actionText = options.actionText ? '<span class="cell__action-text">' + esc(options.actionText) + '</span>' : '';
    var subtitle = options.subtitle ? '<div class="cell__subtitle">' + esc(options.subtitle) + '</div>' : '';
    var divider = options.isLast ? '' : ' cell--divider-right-edge';

    if (options.type === 'switch') {
      return ''
        + '<div class="cell cell--single cell--bg-white' + divider + (options.disabled ? ' inventory-cell--disabled' : '') + '">'
        +   '<div class="cell__body">'
        +     '<div class="cell__content">'
        +       '<div class="cell__title-row"><span class="cell__title">' + esc(title) + '</span></div>'
        +       subtitle
        +     '</div>'
        +     '<div class="cell__action">'
        +       switchMarkup(options.key, options.value)
        +     '</div>'
        +   '</div>'
        + '</div>';
    }

    return ''
      + '<button type="button" class="cell cell--single cell--bg-white cell--clickable' + divider + (options.disabled ? ' inventory-cell--disabled' : '') + '" data-cycle-key="' + esc(options.key) + '">'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + esc(title) + '</span></div>'
      +       subtitle
      +     '</div>'
      +     '<div class="cell__action">'
      +       actionText
      +       '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>'
      +     '</div>'
      +   '</div>'
      + '</button>';
  }

  function settingsGroupMarkup(title, rows) {
    return ''
      + '<div class="cell-group">'
      +   '<div class="cell-group__title">' + esc(title) + '</div>'
      +   '<div class="cell-group__content">'
      +     rows.join('')
      +   '</div>'
      + '</div>';
  }

  function alertSettingsTemplate(draft) {
    var disabledTip = draft.enabled ? '' : '预警关闭后仅保留库存列表展示';
    var groups = [
      settingsGroupMarkup('基础规则', [
        settingsRowMarkup({ type: 'switch', key: 'enabled', title: '启用库存预警', value: draft.enabled }),
        settingsRowMarkup({ type: 'cycle', key: 'threshold', title: '预警阈值', actionText: '低于' + draft.threshold + '件', isLast: false, disabled: !draft.enabled }),
        settingsRowMarkup({ type: 'cycle', key: 'scope', title: '监控范围', actionText: draft.scope, isLast: false, disabled: !draft.enabled }),
        settingsRowMarkup({ type: 'switch', key: 'includeReserved', title: '合并预占库存', value: draft.includeReserved, isLast: true, disabled: !draft.enabled })
      ]),
      settingsGroupMarkup('通知方式', [
        settingsRowMarkup({ type: 'switch', key: 'appNotice', title: 'App 内提醒', value: draft.appNotice }),
        settingsRowMarkup({ type: 'switch', key: 'digestNotice', title: '每日汇总提醒', value: draft.digestNotice }),
        settingsRowMarkup({ type: 'cycle', key: 'digestTime', title: '提醒时间', actionText: draft.digestNotice ? draft.digestTime : '已关闭', isLast: true, disabled: !draft.enabled })
      ]),
      settingsGroupMarkup('处理策略', [
        settingsRowMarkup({ type: 'switch', key: 'autoRestock', title: '自动加入补货清单', value: draft.autoRestock }),
        settingsRowMarkup({ type: 'cycle', key: 'keyItemsCount', title: '重点商品名单', actionText: draft.keyItemsCount > 0 ? (draft.keyItemsCount + '款') : '未设置', isLast: true, disabled: !draft.enabled })
      ])
    ].join('');

    return ''
      + '<section class="inventory-alert-page" data-bg="page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body navbar__body--spaced">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-text" data-action="cancel">取消</button>'
      +       '</div>'
      +       '<div class="navbar__center"><span class="navbar__title">库存预警设置</span></div>'
      +       '<div class="navbar__right navbar__right--button">'
      +         '<button type="button" class="btn btn--strong btn--sm" data-action="save">保存</button>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="inventory-alert-page__body">'
      +     '<section class="inventory-alert-summary">'
      +       '<div class="inventory-alert-summary__title">当前规则</div>'
      +       '<div class="inventory-alert-summary__text">' + esc(draft.enabled ? ('当可售库存低于' + draft.threshold + '件时触发提醒') : '当前未启用库存预警') + '</div>'
      +       '<div class="inventory-alert-summary__subtext">' + esc(disabledTip || ('范围：' + draft.scope + '，通知：' + (draft.appNotice ? 'App内' : '') + (draft.appNotice && draft.digestNotice ? ' + ' : '') + (draft.digestNotice ? ('每日' + draft.digestTime) : ''))) + '</div>'
      +     '</section>'
      +     '<div class="inventory-alert-groups">' + groups + '</div>'
      +   '</div>'
      + '</section>';
  }

  function cycleValue(current, options) {
    var index = options.indexOf(current);
    return options[(index + 1) % options.length];
  }

  function openAlertSettings(ctx) {
    var draft = cloneSettings();

    ctx.openFullScreenModal('', {
      label: '库存预警设置',
      init: function (overlayCtx) {
        function renderOverlay() {
          overlayCtx.root.innerHTML = alertSettingsTemplate(draft);
          bindOverlay();
        }

        function bindOverlay() {
          var root = overlayCtx.root;

          var cancelBtn = root.querySelector('[data-action="cancel"]');
          var saveBtn = root.querySelector('[data-action="save"]');

          if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
              overlayCtx.close();
            });
          }

          if (saveBtn) {
            saveBtn.addEventListener('click', function () {
              STATE.alertSettings = JSON.parse(JSON.stringify(draft));
              overlayCtx.close();
              renderInventoryPage();
              ctx.toast('库存预警设置已保存');
            });
          }

          root.querySelectorAll('[data-switch-key]').forEach(function (node) {
            node.addEventListener('click', function () {
              var key = node.dataset.switchKey;
              draft[key] = !draft[key];
              if (key === 'enabled' && !draft.enabled) {
                draft.appNotice = false;
                draft.digestNotice = false;
              }
              renderOverlay();
            });
          });

          root.querySelectorAll('[data-cycle-key]').forEach(function (node) {
            node.addEventListener('click', function () {
              var key = node.dataset.cycleKey;
              if (!draft.enabled) {
                overlayCtx.toast('请先启用库存预警');
                return;
              }
              if (key === 'digestTime' && !draft.digestNotice) {
                overlayCtx.toast('请先开启每日汇总提醒');
                return;
              }
              if (key === 'threshold') draft.threshold = cycleValue(draft.threshold, THRESHOLD_OPTIONS);
              if (key === 'scope') draft.scope = cycleValue(draft.scope, SCOPE_OPTIONS);
              if (key === 'digestTime') draft.digestTime = cycleValue(draft.digestTime, DIGEST_TIME_OPTIONS);
              if (key === 'keyItemsCount') draft.keyItemsCount = cycleValue(draft.keyItemsCount, KEY_ITEM_OPTIONS);
              renderOverlay();
            });
          });
        }

        renderOverlay();
      }
    });
  }

  function renderInventoryPage() {
    if (!window.__wegoInventoryRoot) return;
    window.__wegoInventoryRoot.innerHTML = inventoryListTemplate();
    bindInventoryPage(window.__wegoInventoryCtx);
  }

  function bindInventoryPage(ctx) {
    var root = ctx.root;

    var backBtn = root.querySelector('[data-action="back"]');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        ctx.back();
      });
    }

    var openAlertBtn = root.querySelector('[data-action="open-alert-settings"]');
    if (openAlertBtn) {
      openAlertBtn.addEventListener('click', function () {
        openAlertSettings(ctx);
      });
    }
  }

  window.WegoApp.registerScene({
    routeId: 'my-inventory-management',
    title: '库存管理',
    presentation: {
      type: 'push',
      transition: 'slide-left',
      coversTabBar: true
    },
    template: '',
    init: function (ctx) {
      window.__wegoInventoryRoot = ctx.root;
      window.__wegoInventoryCtx = ctx;
      renderInventoryPage();
    }
  });
})();
