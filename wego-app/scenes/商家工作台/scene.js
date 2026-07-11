(function () {
  var DASHBOARD = [
    { id: 'paid-amount', label: '实收金额', value: '¥48,260', compare: '昨日 ¥42,880', trend: '+12.5%', tone: 'up' },
    { id: 'sales-orders', label: '销售单数', value: '328', compare: '昨日 301 单', trend: '+27', tone: 'up' },
    { id: 'paid-customers', label: '成交人数', value: '216', compare: '昨日 198 人', trend: '+18', tone: 'up' },
    { id: 'shop-visitors', label: '访问人数', value: '3,842', compare: '较昨日', trend: '+8.6%', tone: 'up' },
    { id: 'fan-views', label: '粉丝浏览量', value: '9,460', compare: '昨日 8,972', trend: '+488', tone: 'up' },
    { id: 'staff-performance', label: '员工业绩', value: '76%', compare: '目标完成', trend: '5人达标', tone: 'neutral' }
  ];

  var COMMON_APPS = [
    { label: '发布商品', icon: '发布.svg', route: 'quick-publish-product' },
    { label: '采购入库', icon: '采购单.svg', route: 'my-warehouse-management' },
    { label: '销售开单', icon: '销售单.svg', toast: '销售开单功能入口已预留' },
    { label: '查库存', icon: '库存管理.svg', route: 'my-inventory-management' },
    { label: '去发货', icon: '查订单-查快递.svg', toast: '待发货处理入口已预留' },
    { label: '发起直播', icon: '私域直播.svg', toast: '直播能力接入中' },
    { label: '补货计划', icon: '备货.svg', route: 'restock-plan' },
    { label: '全部应用', icon: '规则中心.svg', action: 'open-app-center' }
  ];

  var ORDER_STATUS = [
    { label: '待收款', value: 18, toast: '已筛选待收款订单' },
    { label: '待发货', value: 42, toast: '已进入待发货处理入口' },
    { label: '已挂起', value: 7, toast: '已筛选挂起订单' },
    { label: '待售后', value: 5, toast: '待售后处理入口已预留' }
  ];

  var APP_GROUPS = [
    {
      title: '店铺管理',
      apps: [
        { label: '店铺装修', subtitle: '主页、分类和模块配置', icon: '店铺装修.svg', toast: '店铺装修入口已预留' }
      ]
    },
    {
      title: '数据报表',
      apps: [
        { label: '销售报表', subtitle: '订单量、销售额和利润', icon: '销售报表.svg', toast: '销售报表入口已预留' },
        { label: '资金收支统计', subtitle: '今日收入、支出和结余', icon: '数据中心.svg', toast: '资金收支统计入口已预留' }
      ]
    },
    {
      title: '进销存管理',
      apps: [
        { label: '库存管理', subtitle: '盘点、调拨和预警', icon: '库存管理.svg', route: 'my-inventory-management' },
        { label: '补货计划', subtitle: '临时挑选商品并生成待提交计划', icon: '备货.svg', route: 'restock-plan' },
        { label: '销售单', subtitle: '销售历史单据', icon: '销售单.svg', toast: '销售单列表入口已预留' },
        { label: '采购单', subtitle: '采购历史与审批', icon: '采购单.svg', route: 'my-warehouse-management' }
      ]
    },
    {
      title: '营销中心',
      apps: [
        { label: '一键开团', subtitle: '拼团和社群团购', icon: '一键开团.svg', toast: '一键开团入口已预留' },
        { label: '优惠券', subtitle: '满减券、折扣券管理', icon: '优惠券.svg', toast: '优惠券入口已预留' },
        { label: '营销中心', subtitle: '裂变、促活和留存', icon: '营销中心.svg', toast: '营销中心入口已预留' }
      ]
    },
    {
      title: '财务与客户',
      apps: [
        { label: '客户账单', subtitle: '客户维度对账与应收', icon: '客户管理.svg', toast: '客户账单入口已预留' }
      ]
    }
  ];

  var TRAFFIC = [
    { label: '分享到聊天', value: '126', compare: '昨日 104', trend: '+21.2%' },
    { label: '分享到朋友圈', value: '58', compare: '昨日 62', trend: '-6.5%', down: true },
    { label: '今日新增', value: '84', compare: '新粉丝/会员', trend: '+14' },
    { label: '全部粉丝', value: '18,420', compare: '累计粉丝/会员', trend: '+0.5%' }
  ];

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function iconPath(name) {
    return './lib/icons/app-center/' + name;
  }

  function sectionHeader(title, actionText, action) {
    var link = actionText
      ? '<a class="link link--standalone" href="javascript:void(0)" data-action="' + esc(action) + '">' + esc(actionText) + '</a>'
      : '';
    return ''
      + '<div class="merchant-workbench__section-head">'
      +   '<h2 class="merchant-workbench__section-title">' + esc(title) + '</h2>'
      +   link
      + '</div>';
  }

  function dashboardMarkup() {
    var cards = DASHBOARD.map(function (item) {
      return ''
        + '<article class="merchant-workbench-metric" data-metric-id="' + esc(item.id) + '">'
        +   '<div class="merchant-workbench-metric__label">' + esc(item.label) + '</div>'
        +   '<div class="merchant-workbench-metric__value">' + esc(item.value) + '</div>'
        +   '<div class="merchant-workbench-metric__foot">'
        +     '<span>' + esc(item.compare) + '</span>'
        +     '<span class="merchant-workbench-trend merchant-workbench-trend--' + esc(item.tone) + '">' + esc(item.trend) + '</span>'
        +   '</div>'
        + '</article>';
    }).join('');

    return ''
      + '<section class="card card--surface merchant-workbench-card merchant-workbench-card--summary" data-content-id="business-dashboard">'
      +   '<div class="card__content">'
      +     '<div class="merchant-workbench__summary-top">'
      +       '<div>'
      +         '<div class="merchant-workbench__eyebrow">今日经营</div>'
      +         '<div class="merchant-workbench__summary-title">数据更新中</div>'
      +       '</div>'
      +       '<span class="tag tag--20 tag--brand-stroke"><span class="tag__label">09:42 更新</span></span>'
      +     '</div>'
      +     '<div class="merchant-workbench-metrics">' + cards + '</div>'
      +   '</div>'
      + '</section>';
  }

  function commonAppsMarkup() {
    var items = COMMON_APPS.map(function (item) {
      var attrs = '';
      if (item.route) {
        attrs = ' data-route="' + esc(item.route) + '"';
      } else if (item.action) {
        attrs = ' data-app-action="' + esc(item.action) + '"';
      } else {
        attrs = ' data-toast="' + esc(item.toast) + '"';
      }
      return ''
        + '<button type="button" class="merchant-workbench-action" data-action="entry"' + attrs + '>'
        +   '<span class="merchant-workbench-action__icon"><img src="' + esc(iconPath(item.icon)) + '" alt=""></span>'
        +   '<span class="merchant-workbench-action__label">' + esc(item.label) + '</span>'
        + '</button>';
    }).join('');

    return ''
      + '<section class="card card--surface merchant-workbench-card" data-content-id="common-apps">'
      +   '<div class="card__content">'
      +     sectionHeader('常用应用')
      +     '<div class="merchant-workbench-actions">' + items + '</div>'
      +   '</div>'
      + '</section>';
  }

  function orderMarkup() {
    var items = ORDER_STATUS.map(function (item) {
      return ''
        + '<button type="button" class="merchant-workbench-status" data-action="entry" data-toast="' + esc(item.toast) + '">'
        +   '<span class="merchant-workbench-status__value">' + esc(item.value) + '</span>'
        +   '<span class="merchant-workbench-status__label">' + esc(item.label) + '</span>'
        + '</button>';
    }).join('');

    return ''
      + '<section class="card card--surface merchant-workbench-card" data-content-id="order-management">'
      +   '<div class="card__content">'
      +     sectionHeader('销售订单', '全部', 'all-orders')
      +     '<div class="merchant-workbench-status-grid">' + items + '</div>'
      +     '<div class="merchant-workbench-card__actions">'
      +       '<button type="button" class="btn btn--weak btn--sm" data-action="entry" data-toast="全部销售单入口已预留">全部销售单</button>'
      +       '<button type="button" class="btn btn--weak btn--sm" data-action="entry" data-toast="收益查看入口已预留">收益查看</button>'
      +     '</div>'
      +   '</div>'
      + '</section>';
  }

  function customerTodoMarkup() {
    return ''
      + '<section class="card card--surface merchant-workbench-card merchant-workbench-card--todo" data-content-id="customer-todo">'
      +   '<div class="card__content merchant-workbench-todo">'
      +     '<div class="merchant-workbench-todo__main">'
      +       '<div class="merchant-workbench__eyebrow">客户智能待办</div>'
      +       '<div class="merchant-workbench-todo__title">32 位客户即将流失</div>'
      +       '<div class="merchant-workbench-todo__desc">最近 14 天未访问且购买周期接近到期，建议今天完成回访。</div>'
      +     '</div>'
      +     '<div class="merchant-workbench-todo__actions">'
      +       '<button type="button" class="btn btn--strong btn--sm" data-action="entry" data-toast="已生成客户回访待办">去回访</button>'
      +       '<button type="button" class="btn btn--weak btn--sm" data-action="entry" data-toast="营销触达入口已预留">推活动</button>'
      +     '</div>'
      +   '</div>'
      + '</section>';
  }

  function trafficMarkup() {
    var rows = TRAFFIC.map(function (item) {
      return ''
        + '<div class="merchant-workbench-traffic__row">'
        +   '<div>'
        +     '<div class="merchant-workbench-traffic__label">' + esc(item.label) + '</div>'
        +     '<div class="merchant-workbench-traffic__compare">' + esc(item.compare) + '</div>'
        +   '</div>'
        +   '<div class="merchant-workbench-traffic__value">'
        +     '<strong>' + esc(item.value) + '</strong>'
        +     '<span class="merchant-workbench-trend ' + (item.down ? 'merchant-workbench-trend--down' : 'merchant-workbench-trend--up') + '">' + esc(item.trend) + '</span>'
        +   '</div>'
        + '</div>';
    }).join('');

    return ''
      + '<section class="card card--surface merchant-workbench-card" data-content-id="traffic-analytics">'
      +   '<div class="card__content">'
      +     sectionHeader('流量与传播')
      +     '<div class="merchant-workbench-traffic">' + rows + '</div>'
      +   '</div>'
      + '</section>';
  }

  function workbenchTemplate() {
    return ''
      + '<section class="merchant-workbench-page" data-bg="page" data-surface-id="merchant-workbench-main">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left"></div>'
      +       '<div class="navbar__center navbar__center--wide"><span class="navbar__title">商家工作台</span></div>'
      +       '<div class="navbar__right navbar__right--wide navbar__right--icon" data-content-id="navbar-actions">'
      +         '<div class="navbar__action" data-action="navbar-action" data-navbar-action="payment-code" role="button" aria-label="收款码">'
      +           '<div class="navbar__action-icon"><i class="wego-iconfont-s icon-shoukuanma"></i></div>'
      +           '<span class="navbar__action-label">收款码</span>'
      +         '</div>'
      +         '<div class="navbar__action" data-action="navbar-action" data-navbar-action="trade-settings" role="button" aria-label="交易设置">'
      +           '<div class="navbar__action-icon"><i class="wego-iconfont-s icon-shezhi"></i></div>'
      +           '<span class="navbar__action-label">交易设置</span>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="merchant-workbench-page__body">'
      +     dashboardMarkup()
      +     commonAppsMarkup()
      +     orderMarkup()
      +     customerTodoMarkup()
      +     trafficMarkup()
      +   '</div>'
      + '</section>';
  }

  function appCenterTemplate() {
    var groups = APP_GROUPS.map(function (group) {
      var rows = group.apps.map(function (app, index) {
        var divider = index === group.apps.length - 1 ? '' : ' cell--divider-right-edge';
        var attrs = app.route
          ? ' data-route="' + esc(app.route) + '"'
          : ' data-toast="' + esc(app.toast) + '"';
        return ''
          + '<button type="button" class="cell cell--double cell--bg-white cell--clickable' + divider + '" data-action="entry"' + attrs + '>'
          +   '<div class="cell__body">'
          +     '<span class="merchant-workbench-cell-icon"><img src="' + esc(iconPath(app.icon)) + '" alt=""></span>'
          +     '<div class="cell__content">'
          +       '<div class="cell__title-row"><span class="cell__title">' + esc(app.label) + '</span></div>'
          +       '<div class="cell__subtitle">' + esc(app.subtitle) + '</div>'
          +     '</div>'
          +     '<div class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div>'
          +   '</div>'
          + '</button>';
      }).join('');
      return ''
        + '<div class="cell-group merchant-workbench-cell-group">'
        +   '<div class="cell-group__title">' + esc(group.title) + '</div>'
        +   '<div class="cell-group__content cell-group__content--card">' + rows + '</div>'
        + '</div>';
    }).join('');

    return ''
      + '<section class="app-center-page" data-bg="page" data-surface-id="app-center-page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-btn" data-action="back">'
      +           '<i class="wego-iconfont-s icon-zuojiantou16"></i>'
      +         '</button>'
      +       '</div>'
      +       '<div class="navbar__center"><span class="navbar__title">全部应用</span></div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="app-center-page__body">'
      +     '<div data-content-id="app-center-full">' + groups + '</div>'
      +   '</div>'
      + '</section>';
  }

  function bindWorkbench(ctx) {
    var root = ctx.root;
    var pageBody = root.querySelector('.merchant-workbench-page__body');
    if (pageBody) {
      pageBody.scrollTop = 0;
      requestAnimationFrame(function () {
        pageBody.scrollTop = 0;
      });
      setTimeout(function () {
        pageBody.scrollTop = 0;
      }, 120);
    }

    root.addEventListener('click', function (event) {
      var target = event.target.closest('[data-action]');
      if (!target) return;
      var action = target.dataset.action;

      if (action === 'navbar-action') {
        var navbarAction = target.dataset.navbarAction;
        if (navbarAction === 'payment-code') {
          ctx.toast('功能开发中');
          return;
        }
        if (navbarAction === 'trade-settings') {
          ctx.navigate('my-trade-settings');
          return;
        }
        return;
      }
      if (action === 'all-orders') {
        ctx.toast('全部销售单入口已预留');
        return;
      }
      if (action === 'entry') {
        if (target.dataset.route) {
          ctx.navigate(target.dataset.route);
          return;
        }
        if (target.dataset.appAction === 'open-app-center') {
          ctx.navigate('workspace-app-center');
          return;
        }
        ctx.toast(target.dataset.toast || '功能入口已预留');
      }
    });
  }

  function bindAppCenter(ctx) {
    var root = ctx.root;

    root.addEventListener('click', function (event) {
      var target = event.target.closest('[data-action]');
      if (!target) return;
      var action = target.dataset.action;

      if (action === 'back') {
        ctx.back();
        return;
      }
      if (action === 'entry') {
        if (target.dataset.route) {
          ctx.navigate(target.dataset.route);
          return;
        }
        ctx.toast(target.dataset.toast || '功能入口已预留');
      }
    });
  }

  window.WegoApp.registerScene({
    routeId: 'workspace-merchant-workbench',
    title: '商家工作台',
    presentation: {
      type: 'host-tab',
      transition: 'none',
      coversTabBar: false
    },
    template: workbenchTemplate(),
    init: bindWorkbench
  });

  window.WegoApp.registerScene({
    routeId: 'workspace-app-center',
    title: '全部应用',
    presentation: {
      type: 'push',
      transition: 'slide-left',
      coversTabBar: true
    },
    template: appCenterTemplate(),
    init: bindAppCenter
  });
})();
