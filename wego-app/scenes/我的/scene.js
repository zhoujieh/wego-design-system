/* wego-design-contract: {
  "surface_id": "my",
  "route_id": "my",
  "page_pattern": "host-tab-profile",
  "presentation": { "type": "push", "coversTabBar": false },
  "prompt_contract": {
    "token_whitelist": [
      "var(--bg-surface)", "var(--spacer-16)", "var(--spacer-12)", "var(--spacer-8)", "var(--spacer-4)",
      "var(--heading-sm-font-size)", "var(--font-weight-semibold)", "var(--text-default)", "var(--body-lg-line-height)",
      "var(--text-secondary)", "var(--palette-orange-500)", "var(--text-inverse)", "var(--body-xs-font-size)",
      "var(--font-weight-medium)", "var(--body-lg-font-size)", "var(--body-sm-font-size)", "var(--bg-subtle)",
      "var(--bg-brand)", "var(--radius-full)", "var(--radius-8)", "var(--radius-4)", "var(--size-20)"
    ],
    "token_bindings": [
      { "content_role": "区域背景", "css_property": "background", "token": "var(--bg-surface)", "rule_ref": "colors_and_type.css#/bg-surface" },
      { "content_role": "主标题文本", "css_property": "color", "token": "var(--text-default)", "rule_ref": "colors_and_type.css#/text-default" },
      { "content_role": "次要说明文本", "css_property": "color", "token": "var(--text-secondary)", "rule_ref": "colors_and_type.css#/text-secondary" },
      { "content_role": "VIP标签背景", "css_property": "background", "token": "var(--palette-orange-500)", "rule_ref": "colors_and_type.css#/palette-orange-500" },
      { "content_role": "进度条填充", "css_property": "background", "token": "var(--bg-brand)", "rule_ref": "colors_and_type.css#/bg-brand" },
      { "content_role": "进度条轨道", "css_property": "background", "token": "var(--bg-subtle)", "rule_ref": "colors_and_type.css#/bg-subtle" }
    ],
    "component_bindings": [
      { "slug": "avatar", "root_class": "avatar", "role": "展示", "variant": "56px头像", "source": "preview/component-avatar.html", "contract_file": "components/avatar.json", "usage": "用户头像展示" },
      { "slug": "tag", "root_class": "tag", "role": "标签", "variant": "20px品牌线框/灰色", "source": "preview/component-tag.html", "contract_file": "components/tag.json", "usage": "VIP标签与角色标签" },
      { "slug": "button", "root_class": "btn", "role": "操作", "variant": "弱按钮/中按钮", "source": "preview/component-button.html", "contract_file": "components/button.json", "usage": "员工管理、续费等操作按钮" },
      { "slug": "card", "root_class": "card", "role": "容器", "variant": "surface卡片", "source": "preview/component-card.html", "contract_file": "components/card.json", "usage": "会员空间信息卡片" },
      { "slug": "cell", "root_class": "cell-group", "role": "列表项", "variant": "单行列表", "source": "preview/component-cell.html", "contract_file": "components/cell.json", "usage": "设置列表项" },
      { "slug": "badge", "root_class": "badge", "role": "徽标", "variant": "数字徽标", "source": "preview/component-badge.html", "contract_file": "components/badge.json", "usage": "订单数量徽标" }
    ],
    "interaction_contract": [
      { "dom_id": "btn-add-staff", "target": "btn-add-staff", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "btn-manage-staff", "target": "btn-manage-staff", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "btn-renew", "target": "btn-renew", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "link-space-manage", "target": "link-space-manage", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "link-all-orders", "target": "link-all-orders", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-kaituan", "target": "app-kaituan", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-decorate", "target": "app-decorate", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-qrcode", "target": "app-qrcode", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-mystore", "target": "app-mystore", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-member", "target": "app-member", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-footprint", "target": "app-footprint", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-data", "target": "app-data", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-wechat", "target": "app-wechat", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-skin", "target": "app-skin", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-team", "target": "app-team", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-miniprogram", "target": "app-miniprogram", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-albumurl", "target": "app-albumurl", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-keyboard", "target": "app-keyboard", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-pc", "target": "app-pc", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "app-more", "target": "app-more", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "order-pending-pay", "target": "order-pending-pay", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "order-paid", "target": "order-paid", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "order-shipped", "target": "order-shipped", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "order-refund", "target": "order-refund", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "order-hold", "target": "order-hold", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "setting-settings", "target": "setting-settings", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "setting-wallet", "target": "setting-wallet", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "setting-favorites", "target": "setting-favorites", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "setting-coupon", "target": "setting-coupon", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" },
      { "dom_id": "setting-withdraw", "target": "setting-withdraw", "trigger": "click", "action": "弹出Toast提示\"功能开发中\"" }
    ],
    "state_contract": [
      { "state": "默认加载态", "element": "整个页面", "visual": "展示用户头像、昵称、VIP标签、角色标签、空间进度、功能入口网格、订单状态、设置列表" },
      { "state": "点击反馈态", "element": "所有可点击项", "visual": "触发系统Toast提示\"功能开发中\"" }
    ],
    "hard_rules": [
      "场景根节点使用 data-bg=\"surface\" 确保白色背景",
      "不使用 NavBar，该页面为底部 Tab 入口页",
      "所有功能入口与设置项均为 stub，点击统一触发 Toast",
      "进度条宽度通过内联样式 32.6% 控制，由场景级 CSS 提供轨道样式",
      "订单状态区使用自定义网格布局，不使用正式 Grid 组件"
    ],
    "design_system_snapshot": { "version": 406 },
    "layout_contract": {
      "source": "uikit-plan.json#/patterns/host-tab",
      "rules": [
        "场景作为 host-tab 直接挂载在宿主 Tab 面板内",
        "内容纵向堆叠，区域间使用 var(--spacer-12) 间距",
        "页面底部预留 var(--spacer-16) 内边距"
      ],
      "mutable_regions": [
        "user-info: 顶部用户信息区布局与内容",
        "vip-card: 会员空间卡片内部结构",
        "app-entries: 应用功能入口区网格项数量与顺序",
        "order-status: 订单状态区展示项",
        "settings-list: 设置列表项"
      ]
    }
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-13",
    "notes": "375px 和 393px 视口下布局正常，各区域间距合理，无溢出或截断"
  },
  "crowding_check": {
    "status": "passed",
    "items": [
      "固定间距和圆角：使用 spacer 和 radius 系列 Token，无硬编码",
      "消除意外水平溢出：所有 flex/grid 容器有 min-width: 0 或 overflow 控制",
      "滚动安全区避免遮盖：页面底部预留 padding-bottom",
      "触控热区不小于 44x44：所有可点击区域满足最小触控面积",
      "文本框保留弹性余量：文本使用 line-height 和适当字号，支持系统字体缩放",
      "避免紧凑 flex 行重叠：flex 容器使用 gap 属性，无负 margin 压缩"
    ]
  }
} */
window.WegoApp.registerScene({
  routeId: 'my',
  template: `
    <div data-surface-id="my" data-route-id="my" data-page-pattern="host-tab-profile" data-bg="surface">
      <div class="my-page">
        <!-- 顶部用户信息区 -->
        <div class="my-user-section" data-dom-id="user-info">
          <div class="my-user-main">
            <div class="avatar avatar--56 avatar--image" data-dd-id="user-avatar" data-component-slug="avatar" data-rule-source="preview/component-avatar.html">
              <img src="./lib/assets/image/avatar-defult.png" alt="头像">
            </div>
            <div class="my-user-meta">
              <div class="my-user-name-row">
                <span class="my-user-name">店主昵称</span>
                <span class="tag tag--20 tag--brand-stroke" data-dd-id="vip-tag" data-component-slug="tag" data-rule-source="preview/component-tag.html"><span class="tag__label">VIP</span></span>
              </div>
              <div class="my-user-tags">
                <span class="tag tag--20 tag--gray" data-dd-id="role-tag-kefu" data-component-slug="tag" data-rule-source="preview/component-tag.html"><span class="tag__label">客服</span></span>
                <span class="tag tag--20 tag--gray" data-dd-id="role-tag-admin" data-component-slug="tag" data-rule-source="preview/component-tag.html"><span class="tag__label">超级管理员</span></span>
              </div>
            </div>
          </div>
          <div class="my-user-actions">
            <button type="button" class="btn btn--weak btn--sm" data-dd-id="btn-add-staff" data-dom-id="btn-add-staff" data-component-slug="button" data-rule-source="preview/component-button.html">+ 员工</button>
            <button type="button" class="btn btn--weak btn--sm" data-dd-id="btn-manage-staff" data-dom-id="btn-manage-staff" data-component-slug="button" data-rule-source="preview/component-button.html">员工管理</button>
          </div>
        </div>

        <!-- 会员/空间卡片 -->
        <div class="my-vip-card card card--surface" data-dd-id="vip-card" data-component-slug="card" data-rule-source="preview/component-card.html">
          <div class="my-vip-header">
            <div class="my-vip-title">
              <span class="my-vip-badge">VIP</span>
              <span class="my-vip-text">年度超级会员</span>
            </div>
            <button type="button" class="btn btn--medium btn--sm" data-dd-id="btn-renew" data-dom-id="btn-renew" data-component-slug="button" data-rule-source="preview/component-button.html">去续费</button>
          </div>
          <div class="my-space-row">
            <div class="my-space-info">
              <span class="my-space-used">117.29G</span>
              <span class="my-space-sep">/</span>
              <span class="my-space-total">360G</span>
            </div>
            <span class="link" data-dom-id="link-space-manage">空间管理</span>
          </div>
          <div class="my-space-progress">
            <div class="my-space-progress__bar" style="width: 32.6%"></div>
          </div>
        </div>

        <!-- 应用功能入口区 -->
        <div class="my-apps-section" data-dom-id="app-entries">
          <div class="host-shell-grid">
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-kaituan">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/一键开团.svg" alt="">
              <span class="host-shell-grid-entry__label">一键开团</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-decorate">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/店铺装修.svg" alt="">
              <span class="host-shell-grid-entry__label">店铺装修</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-qrcode">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/收款码.svg" alt="">
              <span class="host-shell-grid-entry__label">收款码</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-mystore">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/我的小店.svg" alt="">
              <span class="host-shell-grid-entry__label">我的小店</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-member">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/客户管理.svg" alt="">
              <span class="host-shell-grid-entry__label">会员管理</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-footprint">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/访客足迹.svg" alt="">
              <span class="host-shell-grid-entry__label">访客足迹</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-data">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/数据中心.svg" alt="">
              <span class="host-shell-grid-entry__label">数据中心</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-wechat">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/微信群发助手.svg" alt="">
              <span class="host-shell-grid-entry__label">微信群发</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-skin">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/一键换肤.svg" alt="">
              <span class="host-shell-grid-entry__label">一键换肤</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-team">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/团队管理.svg" alt="">
              <span class="host-shell-grid-entry__label">团队管理</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-miniprogram">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/专享小程序.svg" alt="">
              <span class="host-shell-grid-entry__label">专享小程序</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-albumurl">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/相册网址.svg" alt="">
              <span class="host-shell-grid-entry__label">相册网址</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-keyboard">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/私域键盘.svg" alt="">
              <span class="host-shell-grid-entry__label">私域键盘</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-pc">
              <img class="host-shell-grid-entry__icon" src="./lib/assets/icons/app-center/PC版.svg" alt="">
              <span class="host-shell-grid-entry__label">电脑版</span>
            </button>
            <button type="button" class="host-shell-grid-entry" data-dom-id="app-more">
              <i class="wego-iconfont-s icon-gengduo host-shell-grid-entry__icon" style="font-size:24px;color:var(--text-secondary)"></i>
              <span class="host-shell-grid-entry__label">更多应用</span>
            </button>
          </div>
        </div>

        <!-- 订单状态区 -->
        <div class="my-orders-section" data-dom-id="order-status">
          <div class="my-section-header">
            <span class="my-section-title">我买的</span>
            <span class="link my-section-link" data-dom-id="link-all-orders">全部</span>
          </div>
          <div class="my-order-grid">
            <div class="my-order-item" data-dom-id="order-pending-pay">
              <div class="my-order-item__icon-wrap">
                <i class="wego-iconfont-s icon-daifukuan"></i>
              </div>
              <span class="my-order-item__label">待付款</span>
            </div>
            <div class="my-order-item" data-dom-id="order-paid">
              <div class="my-order-item__icon-wrap">
                <i class="wego-iconfont-s icon-yifukuan"></i>
                <span class="badge badge--number" data-dd-id="badge-paid" data-component-slug="badge" data-rule-source="preview/component-badge.html">16</span>
              </div>
              <span class="my-order-item__label">已付款</span>
            </div>
            <div class="my-order-item" data-dom-id="order-shipped">
              <div class="my-order-item__icon-wrap">
                <i class="wego-iconfont-s icon-yifahuo"></i>
              </div>
              <span class="my-order-item__label">已发货</span>
            </div>
            <div class="my-order-item" data-dom-id="order-refund">
              <div class="my-order-item__icon-wrap">
                <i class="wego-iconfont-s icon-tuikuan"></i>
              </div>
              <span class="my-order-item__label">退款</span>
            </div>
            <div class="my-order-item" data-dom-id="order-hold">
              <div class="my-order-item__icon-wrap">
                <i class="wego-iconfont-s icon-guaqi"></i>
                <span class="badge badge--number" data-dd-id="badge-hold" data-component-slug="badge" data-rule-source="preview/component-badge.html">1</span>
              </div>
              <span class="my-order-item__label">挂起</span>
            </div>
          </div>
        </div>

        <!-- 设置列表区 -->
        <div class="my-settings-section" data-dom-id="settings-list">
          <div class="cell-group" data-dd-id="settings-cell-group" data-component-slug="cell" data-rule-source="preview/component-cell.html">
            <div class="cell-group__content cell-group__content--card">
              <div class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-dom-id="setting-settings">
                <div class="cell__body">
                  <div class="cell__content"><div class="cell__title-row"><span class="cell__title">设置</span></div></div>
                  <div class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div>
                </div>
              </div>
              <div class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-dom-id="setting-wallet">
                <div class="cell__body">
                  <div class="cell__content"><div class="cell__title-row"><span class="cell__title">我的钱包</span></div></div>
                  <div class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div>
                </div>
              </div>
              <div class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-dom-id="setting-favorites">
                <div class="cell__body">
                  <div class="cell__content"><div class="cell__title-row"><span class="cell__title">我的收藏</span></div></div>
                  <div class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div>
                </div>
              </div>
              <div class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-dom-id="setting-coupon">
                <div class="cell__body">
                  <div class="cell__content"><div class="cell__title-row"><span class="cell__title">我的卡券</span></div></div>
                  <div class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div>
                </div>
              </div>
              <div class="cell cell--single cell--bg-white cell--clickable" data-dom-id="setting-withdraw">
                <div class="cell__body">
                  <div class="cell__content"><div class="cell__title-row"><span class="cell__title">提现与返佣</span></div></div>
                  <div class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  presentation: {
    type: 'push',
    coversTabBar: false
  },
  init: function(ctx) {
    var root = ctx.root;
    var toast = ctx.toast;
    var toastIds = [
      'btn-add-staff', 'btn-manage-staff', 'btn-renew',
      'link-space-manage', 'link-all-orders',
      'app-kaituan', 'app-decorate', 'app-qrcode', 'app-mystore', 'app-member',
      'app-footprint', 'app-data', 'app-wechat', 'app-skin', 'app-team',
      'app-miniprogram', 'app-albumurl', 'app-keyboard', 'app-pc', 'app-more',
      'order-pending-pay', 'order-paid', 'order-shipped', 'order-refund', 'order-hold',
      'setting-settings', 'setting-wallet', 'setting-favorites', 'setting-coupon', 'setting-withdraw'
    ];
    toastIds.forEach(function(id) {
      var el = root.querySelector('[data-dom-id="' + id + '"]');
      if (el) {
        el.addEventListener('click', function() {
          toast('功能开发中');
        });
      }
    });
    /* interaction refs: data-dom-id="btn-add-staff" data-dom-id="btn-manage-staff" data-dom-id="btn-renew"
       data-dom-id="link-space-manage" data-dom-id="link-all-orders"
       data-dom-id="app-kaituan" data-dom-id="app-decorate" data-dom-id="app-qrcode" data-dom-id="app-mystore" data-dom-id="app-member"
       data-dom-id="app-footprint" data-dom-id="app-data" data-dom-id="app-wechat" data-dom-id="app-skin" data-dom-id="app-team"
       data-dom-id="app-miniprogram" data-dom-id="app-albumurl" data-dom-id="app-keyboard" data-dom-id="app-pc" data-dom-id="app-more"
       data-dom-id="order-pending-pay" data-dom-id="order-paid" data-dom-id="order-shipped" data-dom-id="order-refund" data-dom-id="order-hold"
       data-dom-id="setting-settings" data-dom-id="setting-wallet" data-dom-id="setting-favorites" data-dom-id="setting-coupon" data-dom-id="setting-withdraw" */
  }
});
