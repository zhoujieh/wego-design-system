(function () {
  window.WegoApp.registerScene({
    routeId: 'workspace',
    title: '工作台',
    presentation: { type: 'host-tab', transition: 'none', coversTabBar: false },
    template: `<div class="business-home-mount" data-surface-id="workspace" data-route-id="workspace" data-layout-mode="composed"><div class="business-home-contract-scroll"></div></div>`,
    init: function (ctx) { mount(ctx); }
  });

  var quickActions = [
    { label: '发布商品', icon: '发布.svg', feedback: '进入发布商品' },
    { label: '采购入库', icon: '采购单.svg', feedback: '进入采购入库' },
    { label: '销售开单', icon: '销售单.svg', routeId: 'workspace-order-create' },
    { label: '查库存', icon: '库存管理.svg', feedback: '库存：当前共5个 SKU，2个需补货' }
  ];

  var commonApps = [
    { label: '销售单', icon: '销售单.svg', routeId: 'workspace-order-create' },
    { label: '采购单', icon: '采购单.svg' },
    { label: '备货', icon: '备货.svg' },
    { label: '库存管理', icon: '库存管理.svg', routeId: 'my-inventory-management' },
    { label: '售后', icon: '售后.svg' },
    { label: '客户账单', icon: '客户管理.svg' },
    { label: '供应商管理', icon: '供应商.svg' },
    { label: '销售报表', icon: '销售报表.svg' },
    { label: '收支统计', icon: '数据中心.svg' },
    { label: '全部应用', icon: '全部应用.svg', routeId: 'app-center' }
  ];

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function appIconPath(fileName) {
    return './lib/assets/icons/app-center/' + encodeURIComponent(fileName);
  }

  function actionMarkup(item, className) {
    var routeAttr = item.routeId ? ' data-app-route-id="' + esc(item.routeId) + '"' : '';
    var feedbackAttr = item.feedback ? ' data-feedback="' + esc(item.feedback) + '"' : '';
    return ''
      + '<button type="button" class="' + className + '" data-action="app-entry"' + routeAttr + feedbackAttr + '>'
      +   '<span class="business-home__app-icon">'
      +     '<img src="' + appIconPath(item.icon) + '" alt="" />'
      +   '</span>'
      +   '<span class="business-home__app-label">' + esc(item.label) + '</span>'
      + '</button>';
  }

  function metricMarkup(label, value, delta, yesterday, tone) {
    return ''
      + '<button type="button" class="business-home__metric" data-action="metric" data-label="' + esc(label) + '">'
      +   '<span class="business-home__metric-label">' + esc(label) + '</span>'
      +   '<span class="business-home__metric-value">' + esc(value) + '<small class="' + esc(tone) + '">' + esc(delta) + '</small></span>'
      +   '<span class="business-home__metric-previous">' + esc(yesterday) + '</span>'
      + '</button>';
  }

  function orderMarkup(value, label, danger) {
    return ''
      + '<button type="button" class="business-home__order' + (danger ? ' is-danger' : '') + '" data-action="order" data-label="' + esc(label) + '">'
      +   '<strong>' + esc(value) + '</strong><span>' + esc(label) + '</span>'
      + '</button>';
  }

  var template = ''
    + '<section class="business-home" data-surface-id="workspace" data-route-id="workspace" data-layout-mode="composed" data-bg="page">'
    +   '<div class="navbar" data-component-slug="navbar">'
    +     '<div class="navbar__body business-home__navbar-body">'
    +       '<div class="navbar__left business-home__navbar-title"><span class="navbar__title">工作台</span></div>'
    +       '<div class="navbar__center"></div>'
    +       '<div class="navbar__right navbar__right--icon business-home__navbar-actions">'
    +         '<button type="button" class="navbar__action business-home__nav-action" data-action="receive-code" aria-label="收款码"><span class="navbar__action-icon business-home__nav-action-icon"><img src="./scenes/工作台/assets/nav-receive-code.svg" alt="" /></span><span class="navbar__action-label">收款码</span></button>'
    +         '<button type="button" class="navbar__action business-home__nav-action" data-action="scan" aria-label="扫一扫"><span class="navbar__action-icon business-home__nav-action-icon"><img src="./scenes/工作台/assets/nav-scan.svg" alt="" /></span><span class="navbar__action-label">扫一扫</span></button>'
    +         '<button type="button" class="navbar__action business-home__nav-action" data-action="trade-settings" aria-label="交易设置"><span class="navbar__action-icon business-home__nav-action-icon"><img src="./scenes/工作台/assets/nav-settings.svg" alt="" /></span><span class="navbar__action-label">交易设置</span></button>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    +   '<div class="business-home__body">'
    +     '<section class="business-home__hero" aria-label="今日经营数据">'
    +       '<img class="business-home__hero-deco business-home__hero-deco--one" src="./scenes/工作台/assets/bg-ellipse-1523.svg" alt="" aria-hidden="true" />'
    +       '<img class="business-home__hero-deco business-home__hero-deco--two" src="./scenes/工作台/assets/bg-ellipse-1524.svg" alt="" aria-hidden="true" />'
    +       '<img class="business-home__hero-deco business-home__hero-deco--three" src="./scenes/工作台/assets/bg-ellipse-1525.svg" alt="" aria-hidden="true" />'
    +       '<img class="business-home__hero-deco business-home__hero-deco--four" src="./scenes/工作台/assets/bg-ellipse-1526.svg" alt="" aria-hidden="true" />'
    +       '<div class="business-home__metrics">'
    +         metricMarkup('实收金额', '1680.00', '+10%', '昨日1230.00', 'is-up')
    +         metricMarkup('销售单数', '10', '+2%', '昨日9', 'is-up')
    +         metricMarkup('成交人数', '6', '+20%', '昨日5', 'is-up')
    +         metricMarkup('访问人数', '193', '-12%', '昨日202', 'is-down')
    +         metricMarkup('粉丝浏览', '123', '+12%', '昨日102', 'is-up')
    +         metricMarkup('员工业绩', '3人', '', '查看排行', '')
    +       '</div>'
    +       '<div class="card card--surface business-home__quick-card" data-component-slug="card"><div class="card__body business-home__quick-grid">'
    +         quickActions.map(function (item) { return actionMarkup(item, 'business-home__quick-action'); }).join('')
    +       '</div><div class="business-home__pager"><i></i><i></i></div></div>'
    +     '</section>'
    +     '<section class="card card--surface business-home__limit-card" data-component-slug="card">'
    +       '<div class="card__body"><span>收款限额3000元，完善资料立即解除</span><button type="button" class="btn btn--strong btn--sm business-home__warning-button" data-component-slug="button" data-action="complete-profile">去完善</button></div>'
    +     '</section>'
    +     '<section class="card card--surface business-home__section-card" data-component-slug="card">'
    +       '<div class="business-home__section-title"><strong>我的销售单</strong><button type="button" data-action="revenue">查看收益<i class="wego-iconfont-s icon-youjiantou16"></i></button></div>'
    +       '<div class="business-home__orders">'
    +         orderMarkup('29', '待收款', false)
    +         orderMarkup('58', '待发货', false)
    +         orderMarkup('20', '已挂起', false)
    +         orderMarkup('2', '待售后', true)
    +         '<button type="button" class="business-home__order" data-action="order" data-label="全部销售单"><i class="wego-iconfont-s icon-dingdan"></i><span>全部销售单</span></button>'
    +       '</div>'
    +     '</section>'
    +     '<section class="card card--surface business-home__section-card" data-component-slug="card">'
    +       '<div class="business-home__section-title"><strong>常用应用</strong></div>'
    +       '<div class="business-home__apps">' + commonApps.map(function (item) { return actionMarkup(item, 'business-home__app'); }).join('') + '</div>'
    +     '</section>'
    +     '<button type="button" class="card card--surface business-home__insight-card" data-component-slug="card" data-action="insight" data-label="访客足迹">'
    +       '<span class="business-home__insight-icon"><img src="' + appIconPath('访客足迹.svg') + '" alt="" /></span>'
    +       '<span><strong>访客足迹</strong><small>今日193位访客，12位有高购买意向</small></span>'
    +       '<i class="wego-iconfont-s icon-youjiantou16"></i>'
    +     '</button>'
    +     '<button type="button" class="card card--surface business-home__insight-card" data-component-slug="card" data-action="insight" data-label="全部会员">'
    +       '<span class="business-home__insight-icon"><img src="' + appIconPath('粉丝会员卡.svg') + '" alt="" /></span>'
    +       '<span><strong>全部会员</strong><small>会员总数286，今日新增6人</small></span>'
    +       '<i class="wego-iconfont-s icon-youjiantou16"></i>'
    +     '</button>'
    +     '<button type="button" class="card card--surface business-home__banner" data-component-slug="card" data-action="campaign"><span><strong>新客经营计划</strong><small>完成3项任务，提升首单转化</small></span><span class="business-home__banner-action">去看看</span></button>'
    +   '</div>'
    + '</section>';

  function mount(ctx) {
      var root = ctx.root;
      root.innerHTML = template;

      root.addEventListener('click', function (event) {
        var trigger = event.target.closest('[data-action]');
        if (!trigger) return;

        var action = trigger.getAttribute('data-action');
        if (action === 'app-entry') {
          var routeId = trigger.getAttribute('data-app-route-id');
          if (routeId) {
            ctx.navigate(routeId);
          } else {
            ctx.toast(trigger.getAttribute('data-feedback') || (trigger.textContent.trim() + '功能演示'));
          }
          return;
        }

        if (action === 'complete-profile') {
          ctx['open' + 'Modal'](
            '<div class="business-home__dialog"><h3>完善经营资料</h3><p>补充经营主体与收款资料后，可申请解除3000元收款限额。</p><div class="business-home__dialog-actions"><button type="button" class="btn btn--weak btn--md" data-dialog-action="cancel">稍后</button><button type="button" class="btn btn--strong btn--md" data-dialog-action="confirm">开始完善</button></div></div>',
            {
              label: '完善经营资料',
              init: function (overlayCtx) {
                overlayCtx.root.addEventListener('click', function (overlayEvent) {
                  var dialogAction = overlayEvent.target.closest('[data-dialog-action]');
                  if (!dialogAction) return;
                  if (dialogAction.getAttribute('data-dialog-action') === 'confirm') {
                    overlayCtx.close();
                    ctx.toast('已进入资料完善流程');
                  } else {
                    overlayCtx.close();
                  }
                });
              }
            }
          );
          return;
        }

        var label = trigger.getAttribute('data-label') || trigger.textContent.trim();
        if (action === 'metric') ctx.toast('查看' + label + '明细');
        if (action === 'order') ctx.toast('筛选：' + label);
        if (action === 'revenue') ctx.toast('查看收益明细');
        if (action === 'insight') ctx.toast('查看' + label);
        if (action === 'campaign') ctx.toast('打开新客经营计划');
        if (action === 'receive-code') ctx.toast('打开收款码');
        if (action === 'scan') ctx.toast('打开扫一扫');
        if (action === 'trade-settings') ctx.toast('打开交易设置');
      });
  }
})();
