/* wego-design-contract:
{
  "surface_id": "wode-profile",
  "route_id": "wode",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "host-tab",
    "transition": "none",
    "dismissAction": "none",
    "overlayLevel": "none",
    "source": "library-consumption.json#/appRuntime/presentationTypes",
    "coversTabBar": false
  },
  "prompt_contract": {
    "design_system_snapshot": {
      "version": 410,
      "token_css": "colors_and_type.css",
      "component_css": "components.css",
      "component_inputs": [
        {
          "slug": "avatar",
          "preview_file": "preview/component-avatar.html",
          "contract_file": "components/avatar.json"
        },
        {
          "slug": "button",
          "preview_file": "preview/component-button.html",
          "contract_file": "components/button.json"
        },
        {
          "slug": "cell",
          "preview_file": "preview/component-cell.html",
          "contract_file": "components/cell.json"
        }
      ]
    },
    "token_whitelist": [
      "var(--bg-page)",
      "var(--bg-surface)",
      "var(--bg-subtle)",
      "var(--bg-fill-strong)",
      "var(--bg-brand)",
      "var(--bg-state-selected)",
      "var(--bg-overlay-l2)",
      "var(--text-inverse)",
      "var(--text-inverse-secondary)",
      "var(--text-default)",
      "var(--text-secondary)",
      "var(--text-tertiary)",
      "var(--text-brand)",
      "var(--text-link)",
      "var(--heading-xs-font-size)",
      "var(--heading-xs-font-weight)",
      "var(--heading-xs-line-height)",
      "var(--body-xs-font-size)",
      "var(--body-xs-line-height)",
      "var(--body-sm-font-size)",
      "var(--body-sm-line-height)",
      "var(--body-md-font-size)",
      "var(--body-md-font-weight)",
      "var(--body-md-line-height)",
      "var(--body-md-strong-font-size)",
      "var(--body-md-strong-font-weight)",
      "var(--body-md-strong-line-height)",
      "var(--spacer-2)",
      "var(--spacer-6)",
      "var(--spacer-8)",
      "var(--spacer-12)",
      "var(--spacer-16)",
      "var(--spacer-20)",
      "var(--spacer-40)",
      "var(--radius-full)",
      "var(--radius-8)",
      "var(--size-24)",
      "var(--size-32)",
      "var(--size-40)",
      "var(--size-48)",
      "var(--duration-fast)",
      "var(--ease-standard)"
    ],
    "token_bindings": [
      {
        "selector": ".wode-profile",
        "content_role": "场景根容器背景",
        "css_property": "background",
        "token": "var(--bg-page)",
        "rule_ref": "colors_and_type.css#bg-page"
      },
      {
        "selector": ".wode-profile__header",
        "content_role": "顶部用户信息区背景",
        "css_property": "background",
        "token": "var(--bg-brand)",
        "rule_ref": "colors_and_type.css#bg-brand"
      },
      {
        "selector": ".wode-profile__card",
        "content_role": "会员/空间卡片背景",
        "css_property": "background",
        "token": "var(--bg-surface)",
        "rule_ref": "colors_and_type.css#bg-surface"
      },
      {
        "selector": ".wode-profile__card--vip",
        "content_role": "VIP卡片背景",
        "css_property": "background",
        "token": "var(--bg-surface)",
        "rule_ref": "colors_and_type.css#bg-surface"
      },
      {
        "selector": ".wode-profile__user-name",
        "content_role": "用户名文字",
        "css_property": "color",
        "token": "var(--text-inverse)",
        "rule_ref": "colors_and_type.css#text-inverse"
      },
      {
        "selector": ".wode-profile__vip-badge",
        "content_role": "VIP标签文字",
        "css_property": "color",
        "token": "var(--text-inverse)",
        "rule_ref": "colors_and_type.css#text-inverse"
      },
      {
        "selector": ".wode-profile__vip-badge",
        "content_role": "VIP标签背景",
        "css_property": "background",
        "token": "var(--bg-state-selected)",
        "rule_ref": "colors_and_type.css#bg-state-selected"
      },
      {
        "selector": ".wode-profile__role-tag",
        "content_role": "角色标签文字",
        "css_property": "color",
        "token": "var(--text-inverse-secondary)",
        "rule_ref": "colors_and_type.css#text-inverse-secondary"
      },
      {
        "selector": ".wode-profile__role-tag",
        "content_role": "角色标签背景",
        "css_property": "background",
        "token": "var(--bg-overlay-l2)",
        "rule_ref": "colors_and_type.css#bg-overlay-l2"
      },
      {
        "selector": ".wode-profile__vip-icon",
        "content_role": "VIP图标容器背景",
        "css_property": "background",
        "token": "var(--bg-subtle)",
        "rule_ref": "colors_and_type.css#bg-subtle"
      },
      {
        "selector": ".wode-profile__vip-icon .wego-iconfont-s",
        "content_role": "VIP图标颜色",
        "css_property": "color",
        "token": "var(--text-brand)",
        "rule_ref": "colors_and_type.css#text-brand"
      },
      {
        "selector": ".wode-profile__space-bar",
        "content_role": "空间进度条背景",
        "css_property": "background",
        "token": "var(--bg-subtle)",
        "rule_ref": "colors_and_type.css#bg-subtle"
      },
      {
        "selector": ".wode-profile__space-bar",
        "content_role": "空间进度条高度",
        "css_property": "height",
        "token": "var(--spacer-6)",
        "rule_ref": "colors_and_type.css#spacer-6"
      },
      {
        "selector": ".wode-profile__space-bar-fill",
        "content_role": "空间进度条填充",
        "css_property": "background",
        "token": "var(--bg-brand)",
        "rule_ref": "colors_and_type.css#bg-brand"
      },
      {
        "selector": ".wode-profile__btn-add-staff",
        "content_role": "+员工按钮背景",
        "css_property": "background",
        "token": "var(--bg-state-selected)",
        "rule_ref": "colors_and_type.css#bg-state-selected"
      },
      {
        "selector": ".wode-profile__btn-staff-manage",
        "content_role": "员工管理按钮背景",
        "css_property": "background",
        "token": "var(--bg-overlay-l2)",
        "rule_ref": "colors_and_type.css#bg-overlay-l2"
      }
    ],
    "component_bindings": [
      {
        "slot": "用户头像",
        "slug": "avatar",
        "reason": "顶部用户信息区展示头像，使用 image 类型 56 尺寸",
        "root_class": "avatar",
        "source": "preview/component-avatar.html",
        "contract_file": "components/avatar.json",
        "required_structure": [".avatar--image img"],
        "modifiers": [".avatar--56", ".avatar--image"],
        "variant_dimensions": { "type": "image", "size": "56" }
      },
      {
        "slot": "操作按钮组",
        "slug": "button",
        "reason": "VIP 续费按钮使用 medium 强调；+员工与员工管理按钮使用 weak 强调，三处按钮均使用 sm 尺寸",
        "root_class": "btn",
        "source": "preview/component-button.html",
        "contract_file": "components/button.json",
        "required_structure": [],
        "modifiers": [".btn--medium", ".btn--weak", ".btn--sm"],
        "variant_dimensions": { "emphasis": "medium", "size": "sm" }
      },
      {
        "slot": "设置列表项",
        "slug": "cell",
        "reason": "设置区域使用单元格组件展示各项设置入口",
        "root_class": "cell",
        "source": "preview/component-cell.html",
        "contract_file": "components/cell.json",
        "required_structure": [".cell__body", ".cell__content", ".cell__title", ".cell__arrow"],
        "modifiers": [".cell--single", ".cell--clickable", ".cell--divider-center"],
        "variant_dimensions": { "density": "single", "surface": "bg-white", "interaction": "clickable", "divider": "divider-center" }
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "我的页面为个人中心场景，包含多种信息区块，不匹配 biz-rule-config 或 system-settings 范式，采用 composed 模式自主组合",
      "page_edge_mode": "M8",
      "page_edge_mode_reason": "灰底白卡分组布局，外层保留 8px 留白，卡片间 12px 间距",
      "rules": [
        "页面根背景 var(--bg-page)，卡片背景 var(--bg-surface)",
        "顶部用户信息区使用品牌绿背景，包含头像、用户名、标签和员工管理按钮",
        "会员/空间卡片使用圆角白卡，包含 VIP 标识和空间进度条",
        "应用功能区使用 4 列网格布局，15 个功能入口",
        "订单状态区横向排列，显示各状态数量",
        "设置列表区使用 cell 组件纵向排列"
      ],
      "mutable_regions": [
        "wode-profile__app-grid：应用功能网格，由 JS 动态渲染",
        "wode-profile__orders-list：订单状态列表，由 JS 动态渲染",
        "wode-profile__settings-list：设置列表，由 JS 动态渲染"
      ]
    },
    "interaction_contract": [
      {
        "dom_id": "entry-add-staff",
        "target": "toast:+员工功能开发中"
      },
      {
        "dom_id": "entry-staff-manage",
        "target": "toast:员工管理功能开发中"
      },
      {
        "dom_id": "entry-renew-vip",
        "target": "toast:VIP续费功能开发中"
      },
      {
        "dom_id": "entry-space-manage",
        "target": "toast:空间管理功能开发中"
      },
      {
        "dom_id": "entry-all-orders",
        "target": "toast:查看全部订单"
      },
      {
        "dom_id": "order-list",
        "target": "toast:对应订单状态功能开发中"
      },
      {
        "dom_id": "settings-list",
        "target": "toast:对应设置项功能开发中"
      },
      {
        "dom_id": "entry-app",
        "target": "toast:{appName}功能开发中"
      }
    ],
    "state_contract": [
      {
        "state_id": "profile_loaded",
        "initial": true,
        "trigger": "场景挂载后自动加载本地模拟数据",
        "visible_result": "页面展示完整用户信息、会员卡片、应用入口、订单状态和设置列表",
        "fallback": "数据加载失败时展示默认空状态",
        "persistence": "session"
      },
      {
        "state_id": "vip_active",
        "initial": true,
        "trigger": "用户数据中 is_vip 为 true",
        "visible_result": "VIP年度超级会员标识显示，去续费按钮可点击",
        "fallback": "非 VIP 用户显示普通会员标识",
        "persistence": "session"
      },
      {
        "state_id": "space_usage",
        "initial": true,
        "trigger": "空间数据加载完成",
        "visible_result": "空间进度条显示 117.29G/360G，进度条填充约 32.5%",
        "fallback": "数据为空时显示 0/360G",
        "persistence": "session"
      },
      {
        "state_id": "order_counts",
        "initial": true,
        "trigger": "订单数据加载完成",
        "visible_result": "订单状态区显示各状态数量（已付款16、挂起1）",
        "fallback": "数据为空时显示默认 0",
        "persistence": "session"
      },
      {
        "state_id": "entry_clicked",
        "initial": false,
        "trigger": "点击任一功能入口",
        "visible_result": "触发 toast 反馈，显示对应功能开发中提示",
        "fallback": "toast 关闭后回到「我的」页面",
        "persistence": "none"
      }
    ],
    "hard_rules": [
      "用户信息区必须展示头像、用户名、VIP标签和角色标签",
      "VIP卡片必须显示年度超级会员标识和去续费按钮",
      "空间进度条必须显示 117.29G/360G 和空间管理链接",
      "应用功能区必须包含 15 个功能入口，4 列网格布局",
      "订单状态区必须显示待付款、已付款(16)、已发货、退款、挂起(1)",
      "设置列表区必须包含设置、我的钱包、我的收藏、我的卡券、提现与返佣",
      "所有入口仅提供 stub 级反馈（toast），不下钻功能实现"
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-14"
  },
  "crowding_check": {
    "status": "passed",
    "items": [
      "顶部用户信息区高度约 160px，头像 56px，间距合理",
      "会员/空间卡片内边距 16px，信息层级清晰",
      "应用功能区 4 列网格，每个图标 48x48px，间距 12px",
      "订单状态区横向排列，每个状态宽度均等，文字清晰",
      "设置列表行高 56px，分割线居中，点击区域足够",
      "底部留白 40px，最后一项不贴底"
    ]
  }
}
*/

(function () {
  'use strict';

  var USER_DATA = {
    name: '微购优选',
    avatar: './lib/assets/image/avatar-defult.png',
    is_vip: true,
    vip_level: '年度超级会员',
    role: '超级管理员'
  };

  var SPACE_DATA = {
    used: 117.29,
    total: 360
  };

  var ORDER_DATA = {
    pending_payment: 0,
    paid: 16,
    shipped: 0,
    refund: 0,
    suspended: 1
  };

  var APP_ENTRIES = [
    { id: 'app-kaituan', name: '一键开团', icon: '一键开团' },
    { id: 'app-zhuangxiu', name: '店铺装修', icon: '店铺装修' },
    { id: 'app-shoukuan', name: '收款码', icon: '收款码' },
    { id: 'app-xiaodian', name: '我的小店', icon: '我的小店' },
    { id: 'app-huiyuan', name: '会员管理', icon: '粉丝会员卡' },
    { id: 'app-fangke', name: '访客足迹', icon: '访客足迹' },
    { id: 'app-data', name: '数据中心', icon: '数据中心' },
    { id: 'app-qunfa', name: '微信群发', icon: '微信群发助手' },
    { id: 'app-huanfu', name: '一键换肤', icon: '一键换肤' },
    { id: 'app-team', name: '团队管理', icon: '团队管理' },
    { id: 'app-miniprogram', name: '专享小程序', icon: '专享小程序' },
    { id: 'app-album', name: '相册网址', icon: '相册网址' },
    { id: 'app-keyboard', name: '私域键盘', icon: '私域键盘' },
    { id: 'app-pc', name: 'PC版', icon: 'PC版' },
    { id: 'app-more', name: '更多应用', icon: 'icon-yingyongzhongxin' }
  ];

  var SETTINGS_ITEMS = [
    { id: 'settings', name: '设置', icon: 'icon-shezhi' },
    { id: 'wallet', name: '我的钱包', icon: 'icon-wodeqianbao' },
    { id: 'favorites', name: '我的收藏', icon: 'icon-wodeshoucang' },
    { id: 'coupons', name: '我的卡券', icon: 'icon-wodekayuan' },
    { id: 'withdraw', name: '提现与返佣', icon: 'icon-tixianfanyong' }
  ];

  var ORDER_ITEMS = [
    { id: 'order-pending', name: '待付款', count: ORDER_DATA.pending_payment },
    { id: 'order-paid', name: '已付款', count: ORDER_DATA.paid },
    { id: 'order-shipped', name: '已发货', count: ORDER_DATA.shipped },
    { id: 'order-refund', name: '退款', count: ORDER_DATA.refund },
    { id: 'order-suspended', name: '挂起', count: ORDER_DATA.suspended }
  ];

  function renderAppGrid() {
    return APP_ENTRIES.map(function (app) {
      var iconHtml;
      if (app.icon.indexOf('icon-') === 0) {
        iconHtml = '<i class="wego-iconfont-s ' + app.icon + ' wode-profile__app-iconfont"></i>';
      } else {
        iconHtml = '<img src="./lib/assets/icons/app-center/' + app.icon + '.svg" alt="' + app.name + '" class="wode-profile__app-icon">';
      }
      return ''
        + '<div class="wode-profile__app-item" data-dom-id="entry-app" data-app-name="' + app.name + '">'
        +   '<div class="wode-profile__app-icon-wrapper">'
        +     iconHtml
        +   '</div>'
        +   '<span class="wode-profile__app-name">' + app.name + '</span>'
        + '</div>';
    }).join('');
  }

  function renderOrderList() {
    return ORDER_ITEMS.map(function (item) {
      var countHtml = item.count > 0 ? '<span class="wode-profile__order-count">' + item.count + '</span>' : '';
      return ''
        + '<div class="wode-profile__order-item" data-dom-id="' + item.id + '">'
        +   '<span class="wode-profile__order-name">' + item.name + '</span>'
        +   countHtml
        + '</div>';
    }).join('');
  }

  function renderSettingsList() {
    return SETTINGS_ITEMS.map(function (item, index) {
      var dividerClass = index < SETTINGS_ITEMS.length - 1 ? 'cell--divider-center' : '';
      return ''
        + '<div class="cell cell--single cell--clickable ' + dividerClass + '"' + (index === 0 ? ' data-dd-id="cell-first" data-component-slug="cell" data-rule-source="preview/component-cell.html"' : '') + ' data-dom-id="entry-' + item.id + '">'
        +   '<div class="cell__body">'
        +     '<div class="cell__content">'
        +       '<span class="cell__title">' + item.name + '</span>'
        +     '</div>'
        +     '<div class="cell__action cell__action--link">'
        +       '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>'
        +     '</div>'
        +   '</div>'
        + '</div>';
    }).join('');
  }

  var wodeTemplate = ''
    + '<div class="wode-profile" data-surface-id="wode-profile" data-route-id="wode" data-layout-mode="composed" data-bg="page">'
    +   '<div class="wode-profile__header">'
    +     '<div class="wode-profile__user-info">'
    +       '<div class="avatar avatar--56 avatar--image" data-dd-id="avatar-user" data-component-slug="avatar" data-rule-source="preview/component-avatar.html" data-token-binding="background:var(--bg-fill-strong)">'
    +         '<img src="' + USER_DATA.avatar + '" alt="' + USER_DATA.name + '">'
    +       '</div>'
    +       '<div class="wode-profile__user-detail">'
    +         '<div class="wode-profile__user-name-row">'
    +           '<span class="wode-profile__user-name">' + USER_DATA.name + '</span>'
    +           '<span class="wode-profile__vip-badge"><i class="wego-iconfont-s icon-dongtai-vip"></i>VIP</span>'
    +         '</div>'
    +         '<div class="wode-profile__role-tag">' + USER_DATA.role + '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="wode-profile__staff-actions">'
    +       '<button type="button" class="btn btn--weak btn--sm wode-profile__btn-add-staff" data-dd-id="btn-add-staff" data-component-slug="button" data-rule-source="preview/component-button.html" data-token-binding="background:var(--bg-state-selected)" data-dom-id="entry-add-staff">'
    +         '<i class="btn__icon wego-iconfont-s icon-jia"></i>'
    +         '+员工'
    +       '</button>'
    +       '<button type="button" class="btn btn--weak btn--sm wode-profile__btn-staff-manage" data-dd-id="btn-staff-manage" data-component-slug="button" data-rule-source="preview/component-button.html" data-token-binding="background:var(--bg-overlay-l2)" data-dom-id="entry-staff-manage">'
    +         '员工管理'
    +       '</button>'
    +     '</div>'
    +   '</div>'
    +   '<div class="wode-profile__content">'
    +     '<div class="wode-profile__card wode-profile__card--vip">'
    +       '<div class="wode-profile__vip-info">'
    +         '<div class="wode-profile__vip-icon"><i class="wego-iconfont-s icon-dongtai-svip"></i></div>'
    +         '<div class="wode-profile__vip-text">'
    +           '<span class="wode-profile__vip-title">VIP年度超级会员</span>'
    +           '<span class="wode-profile__vip-subtitle">尊享特权服务</span>'
    +         '</div>'
    +       '</div>'
    +       '<button type="button" class="btn btn--medium btn--sm wode-profile__btn-renew" data-dd-id="btn-renew" data-component-slug="button" data-rule-source="preview/component-button.html" data-dom-id="entry-renew-vip">'
    +         '去续费'
    +       '</button>'
    +     '</div>'
    +     '<div class="wode-profile__card wode-profile__card--space">'
    +       '<div class="wode-profile__space-header">'
    +         '<span class="wode-profile__space-title">空间使用</span>'
    +         '<span class="wode-profile__space-link" data-dom-id="entry-space-manage">空间管理</span>'
    +       '</div>'
    +       '<div class="wode-profile__space-bar-wrapper">'
    +         '<div class="wode-profile__space-bar">'
    +           '<div class="wode-profile__space-bar-fill" style="width: ' + (SPACE_DATA.used / SPACE_DATA.total * 100) + '%"></div>'
    +         '</div>'
    +         '<span class="wode-profile__space-text">' + SPACE_DATA.used + 'G / ' + SPACE_DATA.total + 'G</span>'
    +       '</div>'
    +     '</div>'
    +     '<div class="wode-profile__card wode-profile__app-card">'
    +       '<div class="wode-profile__app-grid" data-dom-id="app-grid">' + renderAppGrid() + '</div>'
    +     '</div>'
    +     '<div class="wode-profile__card wode-profile__orders">'
    +       '<div class="wode-profile__orders-header">'
    +         '<span class="wode-profile__orders-title">我买的</span>'
    +         '<span class="wode-profile__orders-all" data-dom-id="entry-all-orders">全部</span>'
    +       '</div>'
    +       '<div class="wode-profile__orders-list" data-dom-id="order-list">' + renderOrderList() + '</div>'
    +     '</div>'
    +     '<div class="wode-profile__card wode-profile__settings">'
    +       '<div class="wode-profile__settings-list" data-dom-id="settings-list">' + renderSettingsList() + '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';

  function initWode(ctx) {
    var root = ctx.root;

    var addStaffBtn = root.querySelector('[data-dom-id="entry-add-staff"]');
    if (addStaffBtn) {
      addStaffBtn.addEventListener('click', function () {
        ctx.toast('+员工功能开发中');
      });
    }

    var staffManageBtn = root.querySelector('[data-dom-id="entry-staff-manage"]');
    if (staffManageBtn) {
      staffManageBtn.addEventListener('click', function () {
        ctx.toast('员工管理功能开发中');
      });
    }

    var renewBtn = root.querySelector('[data-dom-id="entry-renew-vip"]');
    if (renewBtn) {
      renewBtn.addEventListener('click', function () {
        ctx.toast('VIP续费功能开发中');
      });
    }

    var spaceManage = root.querySelector('[data-dom-id="entry-space-manage"]');
    if (spaceManage) {
      spaceManage.addEventListener('click', function () {
        ctx.toast('空间管理功能开发中');
      });
    }

    var allOrders = root.querySelector('[data-dom-id="entry-all-orders"]');
    if (allOrders) {
      allOrders.addEventListener('click', function () {
        ctx.toast('查看全部订单');
      });
    }

    var orderList = root.querySelector('[data-dom-id="order-list"]');
    if (orderList) {
      orderList.addEventListener('click', function (e) {
        var item = e.target.closest('.wode-profile__order-item');
        if (!item) return;
        var domId = item.getAttribute('data-dom-id');
        var names = {
          'order-pending': '待付款',
          'order-paid': '已付款',
          'order-shipped': '已发货',
          'order-refund': '退款',
          'order-suspended': '挂起'
        };
        ctx.toast(names[domId] + '订单功能开发中');
      });
    }

    var settingsList = root.querySelector('[data-dom-id="settings-list"]');
    if (settingsList) {
      settingsList.addEventListener('click', function (e) {
        var item = e.target.closest('.cell');
        if (!item) return;
        var domId = item.getAttribute('data-dom-id');
        var names = {
          'entry-settings': '设置',
          'entry-wallet': '我的钱包',
          'entry-favorites': '我的收藏',
          'entry-coupons': '我的卡券',
          'entry-withdraw': '提现与返佣'
        };
        ctx.toast(names[domId] + '功能开发中');
      });
    }

    var appItems = root.querySelectorAll('[data-dom-id="entry-app"]');
    appItems.forEach(function (item) {
      item.addEventListener('click', function () {
        var appName = item.getAttribute('data-app-name');
        ctx.toast(appName + '功能开发中');
      });
    });
  }

  window.WegoApp.registerScene({
    routeId: 'wode',
    template: wodeTemplate,
    presentation: { type: 'host-tab', transition: 'none', coversTabBar: false },
    init: initWode
  });
})();