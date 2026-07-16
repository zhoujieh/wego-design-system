/* wego-design-contract:
{
  "surface_id": "my-home",
  "route_id": "my",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "host-tab",
    "transition": "none",
    "dismissAction": "tab-switch",
    "overlayLevel": "inline",
    "coversTabBar": false,
    "source": "library-consumption.json#/appRuntime/presentationTypes"
  },
  "prompt_contract": {
    "design_system_version": 413,
    "token_bindings": [
      { "selector": ".my-page", "content_role": "页面边距", "css_property": "padding-inline", "token": "var(--layout-page-margin-m8)" },
      { "selector": ".my-page", "content_role": "页面顶部安全区", "css_property": "padding-top", "token": "var(--safe-area-top)" },
      { "selector": ".my-page", "content_role": "页面背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".my-page", "content_role": "页面默认文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page", "content_role": "页面基础字体", "css_property": "font-family", "token": "var(--body-md-font-family)" },
      { "selector": ".my-page__scroll", "content_role": "页面分组间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__scroll", "content_role": "页面上下留白", "css_property": "padding-block", "token": "var(--spacer-16)" },
      { "selector": ".my-page__profile", "content_role": "头像与身份间距", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".my-page__profile", "content_role": "用户信息留白", "css_property": "padding", "token": "var(--spacer-8)" },
      { "selector": ".my-page__profile-meta", "content_role": "用户名与身份间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__username", "content_role": "用户名文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__username", "content_role": "用户名层级", "css_property": "font-size", "token": "var(--heading-md-font-size)" },
      { "selector": ".my-page__username", "content_role": "用户名层级", "css_property": "font-weight", "token": "var(--heading-md-font-weight)" },
      { "selector": ".my-page__username", "content_role": "用户名层级", "css_property": "line-height", "token": "var(--heading-md-line-height)" },
      { "selector": ".my-page__identity", "content_role": "身份标签间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".my-page__section-content", "content_role": "卡片内容节奏", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".my-page__section-content", "content_role": "卡片内容留白", "css_property": "padding", "token": "var(--spacer-12)" },
      { "selector": ".my-page__membership-row", "content_role": "会员信息与续费间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__storage-row", "content_role": "空间信息与管理间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__membership-mark", "content_role": "会员标识内容间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__membership-label", "content_role": "会员辅助信息", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".my-page__storage-label", "content_role": "空间辅助信息", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".my-page__membership-label", "content_role": "会员辅助信息", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".my-page__storage-label", "content_role": "空间辅助信息", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".my-page__membership-label", "content_role": "会员辅助信息", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".my-page__storage-label", "content_role": "空间辅助信息", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".my-page__membership-title", "content_role": "会员名称", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__membership-title", "content_role": "会员名称", "css_property": "font-size", "token": "var(--body-lg-font-size)" },
      { "selector": ".my-page__membership-title", "content_role": "会员名称", "css_property": "font-weight", "token": "var(--font-weight-semibold)" },
      { "selector": ".my-page__membership-title", "content_role": "会员名称", "css_property": "line-height", "token": "var(--body-lg-line-height)" },
      { "selector": ".my-page__storage", "content_role": "空间信息节奏", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".my-page__storage-value", "content_role": "空间用量", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__storage-value", "content_role": "空间用量", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".my-page__storage-value", "content_role": "空间用量", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".my-page__storage-value", "content_role": "空间用量", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".my-page__progress", "content_role": "空间进度轨道", "css_property": "border-radius", "token": "var(--radius-full)" },
      { "selector": ".my-page__progress", "content_role": "空间进度轨道", "css_property": "background", "token": "var(--bg-subtle)" },
      { "selector": ".my-page__progress-value", "content_role": "空间已用进度", "css_property": "border-radius", "token": "var(--radius-full)" },
      { "selector": ".my-page__progress-value", "content_role": "空间已用进度", "css_property": "background", "token": "var(--text-brand)" },
      { "selector": ".my-page__section-title", "content_role": "分组标题", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".my-page__section-title", "content_role": "分组标题", "css_property": "font-size", "token": "var(--heading-xs-font-size)" },
      { "selector": ".my-page__section-title", "content_role": "分组标题", "css_property": "font-weight", "token": "var(--heading-xs-font-weight)" },
      { "selector": ".my-page__section-title", "content_role": "分组标题", "css_property": "line-height", "token": "var(--heading-xs-line-height)" },
      { "selector": ".my-page__app-grid", "content_role": "应用入口间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".my-page__app-entry", "content_role": "应用图标与名称间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".my-page__order-entry", "content_role": "订单图标与名称间距", "css_property": "gap", "token": "var(--spacer-4)" },

      { "selector": ".my-page__app-entry", "content_role": "应用入口热区", "css_property": "padding-block", "token": "var(--spacer-8)" },
      { "selector": ".my-page__order-entry", "content_role": "订单入口热区", "css_property": "padding-block", "token": "var(--spacer-8)" },
      { "selector": ".my-page__app-entry", "content_role": "应用入口按压边界", "css_property": "border-radius", "token": "var(--radius-8)" },
      { "selector": ".my-page__order-entry", "content_role": "订单入口按压边界", "css_property": "border-radius", "token": "var(--radius-8)" },
      { "selector": ".my-page__app-entry:active", "content_role": "应用入口按压反馈", "css_property": "background", "token": "var(--bg-state-pressed)" },
      { "selector": ".my-page__app-entry.is-pressed", "content_role": "应用入口触控反馈", "css_property": "background", "token": "var(--bg-state-pressed)" },
      { "selector": ".my-page__order-entry:active", "content_role": "订单入口按压反馈", "css_property": "background", "token": "var(--bg-state-pressed)" },
      { "selector": ".my-page__order-entry.is-pressed", "content_role": "订单入口触控反馈", "css_property": "background", "token": "var(--bg-state-pressed)" },
      { "selector": ".my-page__app-label", "content_role": "应用名称", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".my-page__app-label", "content_role": "应用名称", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".my-page__app-label", "content_role": "应用名称", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".my-page__order-grid", "content_role": "订单入口间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".my-page__order-entry .wego-iconfont-s", "content_role": "全部订单图标", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".my-page__order-entry .wego-iconfont-s", "content_role": "全部订单图标", "css_property": "font-size", "token": "var(--size-24)" },
      { "selector": ".my-page__order-label", "content_role": "订单状态名称", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".my-page__order-label", "content_role": "订单状态名称", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".my-page__order-label", "content_role": "订单状态名称", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".my-page__order-metric", "content_role": "订单数量最小高度", "css_property": "min-height", "token": "var(--size-24)" }
    ],
    "component_bindings": [
      {
        "binding_id": "profile-avatar",
        "slug": "avatar",
        "reason": "承载我的页头部用户身份识别",
        "variant_dimensions": {
          "type": "image",
          "size": "56"
        }
      },
      {
        "binding_id": "vip-tag",
        "slug": "tag",
        "reason": "轻量展示 VIP 身份，不与主行动竞争",
        "variant_dimensions": {
          "size": "20",
          "theme": "brand-stroke",
          "state": "normal",
          "affordance": "display-only"
        }
      },
      {
        "binding_id": "role-tag",
        "slug": "tag",
        "reason": "轻量展示超级管理员角色",
        "variant_dimensions": {
          "size": "20",
          "theme": "gray",
          "state": "normal",
          "affordance": "display-only"
        }
      },
      {
        "binding_id": "section-card",
        "slug": "card",
        "reason": "承载会员空间、应用和订单三类独立内容分组",
        "variant_dimensions": {
          "base": "auto",
          "surface": "surface"
        }
      },
      {
        "binding_id": "renew-action",
        "slug": "button",
        "reason": "承载会员卡内的次级续费入口",
        "variant_dimensions": {
          "emphasis": "medium",
          "size": "sm",
          "iconMode": "text-only",
          "state": "default"
        }
      },
      {
        "binding_id": "storage-action",
        "slug": "link",
        "reason": "承载空间信息旁的轻量管理入口",
        "variant_dimensions": {
          "mode": "standalone",
          "size": "12",
          "state": "default"
        }
      },
      {
        "binding_id": "settings-cell-divided",
        "slug": "cell",
        "reason": "承载连续个人服务中的层级入口与分割节奏",
        "variant_dimensions": {
          "density": "single",
          "surface": "bg-white",
          "interaction": "clickable",
          "divider": "divider-right-edge",
          "leadingSlot": "none",
          "trailingSlot": "arrow"
        }
      },
      {
        "binding_id": "settings-cell-last",
        "slug": "cell",
        "reason": "承载个人服务分组末项并收口分割线",
        "variant_dimensions": {
          "density": "single",
          "surface": "bg-white",
          "interaction": "clickable",
          "divider": "none",
          "leadingSlot": "none",
          "trailingSlot": "arrow"
        }
      },
      {
        "binding_id": "order-metric",
        "slug": "metric",
        "reason": "承载我买的卡片前5个订单状态数量展示，替换原图标位置",
        "variant_dimensions": {
          "size": "20",
          "theme": "black"
        }
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "页面同时承载身份、状态和多类入口，未命中单一页面范式；使用 M8 卡片边距保持高密度内容的分组清晰",
      "page_edge_mode": "M8",
      "mutable_regions": [
        ".my-page__quick-apps",
        ".my-page__order-grid",
        ".my-page__services"
      ]
    },
    "interaction_contract": [
      { "dom_id": "renew-vip", "target": "feedback:toast" },
      { "dom_id": "manage-storage", "target": "feedback:toast" },
      { "dom_id": "main-app-grid", "target": "feedback:toast" },
      { "dom_id": "open-app-center", "target": "route:app-center" },
      { "dom_id": "order-grid", "target": "feedback:toast" },
      { "dom_id": "open-settings", "target": "feedback:toast" },
      { "dom_id": "open-wallet", "target": "feedback:toast" },
      { "dom_id": "open-favorites", "target": "feedback:toast" },
      { "dom_id": "open-coupons", "target": "feedback:toast" },
      { "dom_id": "open-rebate", "target": "feedback:toast" }
    ],
    "state_contract": [
      {
        "state_id": "my-home-default",
        "initial": true,
        "trigger": "进入我的主 tab",
        "visible_result": "展示已登录超级管理员的会员、空间、应用、订单和个人服务信息",
        "fallback": "保持当前可用入口与固定演示数据",
        "persistence": "memory"
      },
      {
        "state_id": "entry-feedback-visible",
        "initial": false,
        "trigger": "选择续费、空间、应用、订单或个人服务入口",
        "visible_result": "显示与当前入口对应的瞬时反馈",
        "fallback": "保留当前页面和固定演示数据",
        "persistence": "memory"
      }
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-16T01:45:16.000Z",
    "checks": {
      "horizontal_overflow": true,
      "overlap": true,
      "clipping": true,
      "action_legibility": true,
      "primary_focus": true,
      "state_feedback": true
    }
  }
}
*/

var mySceneAllApps = [
    { name: '我的小店', asset: '我的小店' },
    { name: '店铺装修', asset: '店铺装修' },
    { name: '商品管理', asset: '商品管理' },
    { name: '商品详情装修', asset: '商品详情装修' },
    { name: '上下架', asset: '上下架' },
    { name: '一键换肤', asset: '一键换肤' },
    { name: '专享小程序', asset: '专享小程序' },
    { name: '微信小店', asset: '微信小店' },
    { name: '一键开团', asset: '一键开团' },
    { name: '发布', asset: '发布' },
    { name: '快捷发布', asset: '快捷发布' },
    { name: '批量发布', asset: '批量发布' },
    { name: '一键搬家', asset: '一键搬家' },
    { name: '铺货管家', asset: '铺货管家' },
    { name: '整理相册', asset: '整理相册' },
    { name: '批量编辑', asset: '批量编辑' },
    { name: '营销中心', asset: '营销中心' },
    { name: '数据中心', asset: '数据中心' },
    { name: '优惠券', asset: '优惠券' },
    { name: '限时秒杀', asset: '限时秒杀' },
    { name: '满减促销', asset: '满减促销' },
    { name: '红包雨', asset: '红包雨' },
    { name: '抽奖大转盘', asset: '抽奖大转盘' },
    { name: '支付后送券', asset: '支付后送券' },
    { name: '追福袋', asset: '追福袋' },
    { name: '分销', asset: '分销' },
    { name: '推广员', asset: '推广员' },
    { name: '发新客福利', asset: '发新客福利' },
    { name: '弃购召回', asset: '弃购召回' },
    { name: '一键复制好友相册', asset: '一键复制好友相册' },
    { name: '微信群发', asset: '微信群发助手' },
    { name: '推送上新', asset: '推送上新（群发消息）' },
    { name: '公众号', asset: '公众号' },
    { name: '企业微信', asset: '企业微信' },
    { name: '视频号', asset: '视频号' },
    { name: '抖音引流', asset: '抖音引流' },
    { name: '公域引流', asset: '公域引流' },
    { name: '私域直播', asset: '私域直播' },
    { name: '直播开单', asset: '直播开单' },
    { name: '私域键盘', asset: '私域键盘' },
    { name: '客户管理', asset: '客户管理' },
    { name: '创建客户', asset: '创建客户' },
    { name: '客户审核', asset: '客户审核' },
    { name: '客户标签', asset: '客户标签' },
    { name: '会员管理', asset: '粉丝会员卡' },
    { name: '访客足迹', asset: '访客足迹' },
    { name: '标签管理', asset: '标签管理' },
    { name: '积分商城', asset: '积分商城' },
    { name: '收款码', asset: '收款码' },
    { name: '查订单-查快递', asset: '查订单-查快递' },
    { name: '售后', asset: '售后' },
    { name: '销售单', asset: '销售单' },
    { name: '销售报表', asset: '销售报表' },
    { name: '库存管理', asset: '库存管理' },
    { name: '备货', asset: '备货' },
    { name: '配货管理', asset: '配货管理' },
    { name: '采购单', asset: '采购单' },
    { name: '供应商', asset: '供应商' },
    { name: '转图代理', asset: '转图代理' },
    { name: '查件码', asset: '查件码' },
    { name: '团队管理', asset: '团队管理' },
    { name: '员工业绩', asset: '员工业绩' },
    { name: '批量导出', asset: '批量导出' },
    { name: '导出记录', asset: '导出记录' },
    { name: '规则中心', asset: '规则中心' },
    { name: '价格管理', asset: '价格管理' },
    { name: 'ERP', asset: 'ERP' },
    { name: '相册网址', asset: '相册网址' },
    { name: '硬件商城', asset: '硬件商城(智能硬件)' },
    { name: '相册学堂', asset: '相册学堂' },
    { name: 'PC(电脑版)', asset: 'PC版' }
  ];

function getRecentlyUsedApps() {
  try {
    var stored = localStorage.getItem('wego_recent_apps');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function setRecentlyUsedApps(appNames) {
  try {
    localStorage.setItem('wego_recent_apps', JSON.stringify(appNames.slice(0, 20)));
  } catch (e) {}
}

function recordAppUsage(appName) {
  var recent = getRecentlyUsedApps();
  recent = recent.filter(function (name) { return name !== appName; });
  recent.unshift(appName);
  setRecentlyUsedApps(recent);
}

function sortAppsByRecentUsage(apps) {
  var recent = getRecentlyUsedApps();
  var recentSet = new Set(recent);
  var sorted = apps.slice().sort(function (a, b) {
    var aIndex = recent.indexOf(a.name);
    var bIndex = recent.indexOf(b.name);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  return sorted;
}

function createMySceneAppEntry(app) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'my-page__app-entry';
    button.dataset.appName = app.name;
    button.setAttribute('aria-label', '打开' + app.name);

    var icon = document.createElement('img');
    icon.className = 'my-page__app-icon';
    icon.src = './lib/assets/icons/app-center/' + app.asset + '.svg';
    icon.alt = '';

    var label = document.createElement('span');
    label.className = 'my-page__app-label';
    label.textContent = app.name;

    button.append(icon, label);
    return button;
}

const mySceneTemplate = `
    <section class="my-page" data-surface-id="my-home" data-route-id="my" data-route-bound="true" data-layout-mode="composed" data-page-edge-mode="M8" data-bg="page">
      <div class="my-page__scroll">
        <header class="my-page__profile">
          <div class="avatar avatar--56 avatar--image" data-dd-id="profile-avatar" data-component-slug="avatar" data-component-binding="profile-avatar">
            <img src="./lib/assets/image/avatar-defult.png" alt="微购用户头像">
          </div>
          <div class="my-page__profile-meta">
            <h1 class="my-page__username">微购用户</h1>
            <div class="my-page__identity">
              <span class="tag tag--20 tag--brand-stroke" data-dd-id="vip-tag" data-component-slug="tag" data-component-binding="vip-tag"><span class="tag__label">VIP</span></span>
              <span class="tag tag--20 tag--gray" data-dd-id="role-tag" data-component-slug="tag" data-component-binding="role-tag"><span class="tag__label">超级管理员</span></span>
            </div>
          </div>
        </header>

        <section class="card card--surface my-page__membership-card" data-dd-id="membership-card" data-component-slug="card" data-component-binding="section-card">
          <div class="card__content my-page__section-content">
            <div class="my-page__membership-row">
              <div class="my-page__membership-mark">
                <img class="my-page__membership-icon" src="./lib/assets/icons/icon-dongtai-svip.svg" alt="">
                <div>
                  <p class="my-page__membership-label">VIP年度</p>
                  <h2 class="my-page__membership-title">超级会员</h2>
                </div>
              </div>
              <button type="button" class="btn btn--medium btn--sm" data-dd-id="renew-action" data-component-slug="button" data-component-binding="renew-action" data-dom-id="renew-vip">去续费</button>
            </div>

            <div class="my-page__storage">
              <div class="my-page__storage-row">
                <div>
                  <p class="my-page__storage-label">空间使用</p>
                  <p class="my-page__storage-value">117.29G / 360G</p>
                </div>
                <button type="button" class="link link--12" data-dd-id="storage-action" data-component-slug="link" data-component-binding="storage-action" data-dom-id="manage-storage">空间管理</button>
              </div>
              <div class="my-page__progress" role="progressbar" aria-label="空间使用进度" aria-valuemin="0" aria-valuemax="360" aria-valuenow="117.29" aria-valuetext="已使用117.29G，共360G">
                <span class="my-page__progress-value"></span>
              </div>
            </div>
          </div>
        </section>

        <section class="card card--surface my-page__quick-apps" data-dd-id="applications-card" data-component-slug="card" data-component-binding="section-card">
          <div class="card__content my-page__section-content">
            <h2 class="my-page__section-title">应用</h2>
            <div class="my-page__app-grid" data-dom-id="main-app-grid">
              <button type="button" class="my-page__app-entry" data-dom-id="open-app-center" aria-label="打开全部应用">
                <img class="my-page__app-icon" src="./lib/assets/icons/app-center/全部应用.svg" alt="">
                <span class="my-page__app-label">全部应用</span>
              </button>
            </div>
          </div>
        </section>

        <section class="card card--surface my-page__orders" data-dd-id="orders-card" data-component-slug="card" data-component-binding="section-card">
          <div class="card__content my-page__section-content">
            <h2 class="my-page__section-title">我买的</h2>
            <div class="my-page__order-grid" data-dom-id="order-grid">
              <button type="button" class="my-page__order-entry" data-order-name="待付款" data-order-count="3"><span class="metric metric--20 metric--black my-page__order-metric" data-dd-id="order-metric-pending" data-component-slug="metric" data-component-binding="order-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">3</span></span></span></span><span class="my-page__order-label">待付款</span></button>
              <button type="button" class="my-page__order-entry" data-order-name="已付款" data-order-count="8"><span class="metric metric--20 metric--black my-page__order-metric" data-dd-id="order-metric-paid" data-component-slug="metric" data-component-binding="order-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">8</span></span></span></span><span class="my-page__order-label">已付款</span></button>
              <button type="button" class="my-page__order-entry" data-order-name="已发货" data-order-count="0"><span class="metric metric--20 metric--black my-page__order-metric" data-dd-id="order-metric-shipped" data-component-slug="metric" data-component-binding="order-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">0</span></span></span></span><span class="my-page__order-label">已发货</span></button>
              <button type="button" class="my-page__order-entry" data-order-name="退款" data-order-count="2"><span class="metric metric--20 metric--black my-page__order-metric" data-dd-id="order-metric-refund" data-component-slug="metric" data-component-binding="order-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">2</span></span></span></span><span class="my-page__order-label">退款</span></button>
              <button type="button" class="my-page__order-entry" data-order-name="挂起" data-order-count="0"><span class="metric metric--20 metric--black my-page__order-metric" data-dd-id="order-metric-hold" data-component-slug="metric" data-component-binding="order-metric"><span class="metric__main"><span class="metric__value"><span class="metric__integer">0</span></span></span></span><span class="my-page__order-label">挂起</span></button>
              <button type="button" class="my-page__order-entry" data-order-name="全部订单"><span class="my-page__order-icon-wrapper"><i class="wego-iconfont-s icon-dingdan"></i></span><span class="my-page__order-label">全部订单</span></button>
            </div>
          </div>
        </section>

        <div class="cell-group my-page__services">
          <div class="cell-group__content cell-group__content--card">
            <button type="button" class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-dd-id="settings-cell" data-component-slug="cell" data-component-binding="settings-cell-divided" data-dom-id="open-settings">
              <span class="cell__body"><span class="cell__content"><span class="cell__title-row"><span class="cell__title">设置</span></span></span><span class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></span></span>
            </button>
            <button type="button" class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-dd-id="wallet-cell" data-component-slug="cell" data-component-binding="settings-cell-divided" data-dom-id="open-wallet">
              <span class="cell__body"><span class="cell__content"><span class="cell__title-row"><span class="cell__title">我的钱包</span></span></span><span class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></span></span>
            </button>
            <button type="button" class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-dd-id="favorites-cell" data-component-slug="cell" data-component-binding="settings-cell-divided" data-dom-id="open-favorites">
              <span class="cell__body"><span class="cell__content"><span class="cell__title-row"><span class="cell__title">我的收藏</span></span></span><span class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></span></span>
            </button>
            <button type="button" class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-dd-id="coupons-cell" data-component-slug="cell" data-component-binding="settings-cell-divided" data-dom-id="open-coupons">
              <span class="cell__body"><span class="cell__content"><span class="cell__title-row"><span class="cell__title">我的卡券</span></span></span><span class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></span></span>
            </button>
            <button type="button" class="cell cell--single cell--bg-white cell--clickable" data-dd-id="rebate-cell" data-component-slug="cell" data-component-binding="settings-cell-last" data-dom-id="open-rebate">
              <span class="cell__body"><span class="cell__content"><span class="cell__title-row"><span class="cell__title">提现与返佣</span></span></span><span class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></span></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

window.WegoApp.registerScene({
    routeId: 'my',
    title: '我的',
    template: mySceneTemplate,
    presentation: {
      type: 'host-tab',
      transition: 'none',
      dismissAction: 'tab-switch',
      overlayLevel: 'inline',
      coversTabBar: false
    },
    init: function initMyScene(ctx) {
      var mainGrid = ctx.root.querySelector('[data-dom-id="main-app-grid"]');
      var moreButton = ctx.root.querySelector('[data-dom-id="open-app-center"]');

      var sortedApps = sortAppsByRecentUsage(mySceneAllApps);
      var allEntries = sortedApps.map(createMySceneAppEntry);

      function updateMainAppCapacity() {
        var columns = Math.max(1, Math.floor(mainGrid.getBoundingClientRect().width / 80));
        var needCount = columns * 2 - 1; // 两行满格，减去"全部应用"按钮

        // 清空并重新填充
        mainGrid.innerHTML = '';
        for (var i = 0; i < needCount && i < allEntries.length; i += 1) {
          mainGrid.appendChild(allEntries[i]);
        }
        mainGrid.appendChild(moreButton);

        mainGrid.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';
      }

      requestAnimationFrame(updateMainAppCapacity);
      if (typeof ResizeObserver === 'function') {
        var gridObserver = new ResizeObserver(updateMainAppCapacity);
        gridObserver.observe(mainGrid);
      } else {
        window.addEventListener('resize', updateMainAppCapacity);
      }

      mainGrid.addEventListener('click', function (event) {
        var entry = event.target.closest('[data-app-name]');
        if (!entry || !mainGrid.contains(entry)) return;
        recordAppUsage(entry.dataset.appName);
        ctx.toast(entry.dataset.appName + '入口已打开');
      });

      moreButton.addEventListener('click', function () {
        ctx.navigate('app-center');
      });

      var renewVip = ctx.root.querySelector('[data-dom-id="renew-vip"]');
      renewVip.addEventListener('click', function () { ctx.toast('已进入会员续费入口'); });

      var manageStorage = ctx.root.querySelector('[data-dom-id="manage-storage"]');
      manageStorage.addEventListener('click', function () { ctx.toast('已进入空间管理入口'); });

      var orderGrid = ctx.root.querySelector('[data-dom-id="order-grid"]');
      orderGrid.addEventListener('click', function (event) {
        var entry = event.target.closest('[data-order-name]');
        if (!entry || !orderGrid.contains(entry)) return;
        ctx.toast('已进入' + entry.dataset.orderName);
      });

      var openSettings = ctx.root.querySelector('[data-dom-id="open-settings"]');
      openSettings.addEventListener('click', function () { ctx.toast('已进入设置入口'); });

      var openWallet = ctx.root.querySelector('[data-dom-id="open-wallet"]');
      openWallet.addEventListener('click', function () { ctx.toast('已进入我的钱包'); });

      var openFavorites = ctx.root.querySelector('[data-dom-id="open-favorites"]');
      openFavorites.addEventListener('click', function () { ctx.toast('已进入我的收藏'); });

      var openCoupons = ctx.root.querySelector('[data-dom-id="open-coupons"]');
      openCoupons.addEventListener('click', function () { ctx.toast('已进入我的卡券'); });

      var openRebate = ctx.root.querySelector('[data-dom-id="open-rebate"]');
      openRebate.addEventListener('click', function () { ctx.toast('已进入提现与返佣'); });
    }
});
