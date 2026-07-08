(function () {
  var GROUPS = [
    {
      title: '收款',
      items: [
        { id: 'voice-broadcast', title: '收款到账语音播报', density: 'single', type: 'switch', defaultOn: false }
      ]
    },
    {
      title: '库存',
      items: [
        { id: 'inventory-setting', title: '库存设置', density: 'single', type: 'arrow' }
      ]
    },
    {
      title: '下单',
      items: [
        { id: 'freight-template', title: '运费模板', density: 'single', type: 'arrow' },
        { id: 'shipping-setting', title: '发货设置', density: 'single', type: 'arrow' },
        { id: 'order-mode', title: '下单模式', density: 'single', type: 'arrow' }
      ]
    },
    {
      title: '零售',
      items: [
        { id: 'balance-accounting', title: '客户余额记账', density: 'double', type: 'switch', defaultOn: true, subtitle: '开启后支持客户余额支付和开单赊账' },
        { id: 'min-purchase', title: '全店起批量', density: 'single', type: 'text-arrow', actionText: '关闭' },
        { id: 'online-payment', title: '小店在线收款', density: 'double', type: 'switch', defaultOn: true, subtitle: '开启后客户可直接在相册完成付款' },
        { id: 'payment-code', title: '收款码设置', density: 'single', type: 'arrow' }
      ]
    },
    {
      title: '订单',
      items: [
        { id: 'modify-pending-order', title: '客户可修改待付款订单', density: 'double', type: 'switch', defaultOn: false, subtitle: '开启后客户可修改收货地址和商品数量' },
        { id: 'hide-phone', title: '隐藏客户联系电话', density: 'single', type: 'arrow' },
        { id: 'export-setting', title: '订单批量导出设置', density: 'single', type: 'arrow' },
        { id: 'share-setting', title: '订单分享设置', density: 'single', type: 'arrow' },
        { id: 'batch-delete', title: '批量删除订单', density: 'single', type: 'arrow' },
        { id: 'list-view-setting', title: '订单列表视图展示设置', density: 'single', type: 'arrow' },
        { id: 'fold-view', title: '折叠视图', density: 'single', type: 'arrow' },
        { id: 'show-suspended', title: '展示挂起商品', density: 'single', type: 'switch', defaultOn: false }
      ]
    },
    {
      title: '商品条码',
      items: [
        { id: 'barcode-printer', title: '条码打印机', density: 'single', type: 'text-arrow', actionText: '未添加' }
      ]
    },
    {
      title: '快递单',
      items: [
        { id: 'electronic-waybill', title: '电子面单', density: 'single', type: 'text-arrow', actionText: '未添加' },
        { id: 'express-printer', title: '快递单打印机', density: 'single', type: 'text-arrow', actionText: '未添加' }
      ]
    },
    {
      title: '小票',
      items: [
        { id: 'receipt-printer', title: '小票打印机', density: 'single', type: 'text-arrow', actionText: '未添加' }
      ]
    }
  ];

  var switchStates = {};

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function actionMarkup(item) {
    if (item.type === 'switch') {
      var stateClass = switchStates[item.id] !== undefined
        ? (switchStates[item.id] ? 'switch--on' : 'switch--off')
        : (item.defaultOn ? 'switch--on' : 'switch--off');
      return '<div class="switch ' + stateClass + '" data-switch-id="' + esc(item.id) + '" role="switch" aria-checked="' + (switchStates[item.id] !== undefined ? switchStates[item.id] : !!item.defaultOn) + '"><div class="switch__thumb"></div></div>';
    }
    if (item.type === 'text-arrow') {
      return ''
        + '<span class="cell__action-text">' + esc(item.actionText || '') + '</span>'
        + '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>';
    }
    return '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>';
  }

  function cellMarkup(item, isLastInGroup) {
    var density = item.density === 'double' ? 'cell--double' : 'cell--single';
    var divider = isLastInGroup ? '' : ' cell--divider-right-edge';
    var clickable = item.type !== 'switch' ? ' cell--clickable' : '';
    var subtitle = item.subtitle
      ? '<div class="cell__subtitle">' + esc(item.subtitle) + '</div>'
      : '';
    var element = item.type === 'switch' ? 'div' : 'button';
    return ''
      + '<' + element + ' type="button" class="cell ' + density + ' cell--bg-white' + clickable + divider + '" data-item-id="' + esc(item.id) + '"' + (clickable ? ' role="button"' : '') + '>'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + esc(item.title) + '</span></div>'
      +       subtitle
      +     '</div>'
      +     '<div class="cell__action">'
      +       actionMarkup(item)
      +     '</div>'
      +   '</div>'
      + '</' + element + '>';
  }

  function groupMarkup(group) {
    var total = group.items.length;
    var rows = group.items.map(function (item, idx) {
      return cellMarkup(item, idx === total - 1);
    }).join('');
    return ''
      + '<div class="cell-group">'
      +   '<div class="cell-group__title">' + esc(group.title) + '</div>'
      +   '<div class="cell-group__content">'
      +     rows
      +   '</div>'
      + '</div>';
  }

  function pageTemplate() {
    var groups = GROUPS.map(function (g) { return groupMarkup(g); }).join('');
    return ''
      + '<section class="trade-settings-page" data-bg="page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<div class="navbar__left-btn" data-action="back" role="button" aria-label="返回"><i class="wego-iconfont-s icon-fanhui"></i></div>'
      +       '</div>'
      +       '<div class="navbar__center">'
      +         '<span class="navbar__title">交易设置</span>'
      +       '</div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="trade-settings-body">'
      +     groups
      +   '</div>'
      + '</section>';
  }

  window.WegoApp.registerScene({
    routeId: 'my-trade-settings',
    title: '交易设置',
    presentation: {
      type: 'push',
      transition: 'slide-left',
      coversTabBar: true
    },
    template: '',
    init: function (ctx) {
      function render() {
        ctx.root.innerHTML = pageTemplate();
        bindInteractions();
      }

      function bindInteractions() {
        var root = ctx.root;

        var backBtn = root.querySelector('[data-action="back"]');
        if (backBtn) {
          backBtn.addEventListener('click', function () {
            ctx.back();
          });
        }

        root.querySelectorAll('[data-switch-id]').forEach(function (switchEl) {
          switchEl.addEventListener('click', function (e) {
            e.stopPropagation();
            var id = switchEl.dataset.switchId;
            var isOn = switchEl.classList.contains('switch--on');
            switchEl.classList.remove('switch--on', 'switch--off');
            switchEl.classList.add(isOn ? 'switch--off' : 'switch--on');
            switchEl.setAttribute('aria-checked', String(!isOn));
            switchStates[id] = !isOn;
          });
        });

        root.querySelectorAll('[data-item-id]').forEach(function (row) {
          row.addEventListener('click', function () {
            var id = row.dataset.itemId;
            var item = GROUPS.reduce(function (found, g) {
              return found || g.items.find(function (i) { return i.id === id; });
            }, null);
            if (item && item.type !== 'switch') {
              ctx.toast('该功能尚未接入原型');
            }
          });
        });
      }

      render();
    }
  });
})();
