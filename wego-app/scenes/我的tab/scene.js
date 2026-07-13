/* wego-design-contract:
{
  "surface_id": "my-tab",
  "route_id": "my-tab",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "host-tab",
    "transition": "none",
    "dismissAction": "switch-tab",
    "overlayLevel": "inline",
    "coversTabBar": false,
    "source": "library-consumption.json#/appRuntime/presentationTypes"
  },
  "prompt_contract": {
    "design_system_snapshot": {
      "version": 409,
      "token_css": "colors_and_type.css",
      "component_css": "components.css",
      "component_inputs": [
        {
          "slug": "avatar",
          "preview_file": "preview/component-avatar.html",
          "contract_file": "components/avatar.json"
        },
        {
          "slug": "tag",
          "preview_file": "preview/component-tag.html",
          "contract_file": "components/tag.json"
        },
        {
          "slug": "button",
          "preview_file": "preview/component-button.html",
          "contract_file": "components/button.json"
        },
        {
          "slug": "card",
          "preview_file": "preview/component-card.html",
          "contract_file": "components/card.json"
        },
        {
          "slug": "link",
          "preview_file": "preview/component-link.html",
          "contract_file": "components/link.json"
        },
        {
          "slug": "cell",
          "preview_file": "preview/component-cell.html",
          "contract_file": "components/cell.json"
        }
      ]
    },
    "token_whitelist": [
      "var(--bg-brand)",
      "var(--bg-page)",
      "var(--bg-subtle)",
      "var(--bg-surface)",
      "var(--body-lg-font-size)",
      "var(--body-lg-line-height)",
      "var(--body-sm-font-size)",
      "var(--body-sm-line-height)",
      "var(--body-xs-font-size)",
      "var(--body-xs-line-height)",
      "var(--border-neutral-l2)",
      "var(--font-weight-medium)",
      "var(--font-weight-semibold)",
      "var(--heading-sm-font-size)",
      "var(--heading-sm-line-height)",
      "var(--heading-xs-font-size)",
      "var(--heading-xs-line-height)",
      "var(--radius-8)",
      "var(--size-32)",
      "var(--spacer-12)",
      "var(--spacer-16)",
      "var(--spacer-24)",
      "var(--spacer-4)",
      "var(--spacer-8)",
      "var(--text-default)",
      "var(--text-secondary)",
      "var(--text-tertiary)"
    ],
    "token_bindings": [
      {
        "selector": ".my-tab__name",
        "content_role": "用户名",
        "css_property": "font-size",
        "token": "var(--heading-sm-font-size)",
        "rule_ref": "colors_and_type.css#/heading-sm-font-size"
      },
      {
        "selector": ".my-tab__name",
        "content_role": "用户名",
        "css_property": "color",
        "token": "var(--text-default)",
        "rule_ref": "colors_and_type.css#/text-default"
      },
      {
        "selector": ".my-tab__headline",
        "content_role": "会员和订单区标题",
        "css_property": "font-size",
        "token": "var(--heading-xs-font-size)",
        "rule_ref": "colors_and_type.css#/heading-xs-font-size"
      },
      {
        "selector": ".my-tab__subcopy",
        "content_role": "说明文字",
        "css_property": "color",
        "token": "var(--text-secondary)",
        "rule_ref": "colors_and_type.css#/text-secondary"
      },
      {
        "selector": ".my-tab-space__usage",
        "content_role": "空间用量数字",
        "css_property": "color",
        "token": "var(--text-default)",
        "rule_ref": "colors_and_type.css#/text-default"
      },
      {
        "selector": ".my-tab-section__title",
        "content_role": "区块标题",
        "css_property": "font-size",
        "token": "var(--heading-xs-font-size)",
        "rule_ref": "colors_and_type.css#/heading-xs-font-size"
      },
      {
        "selector": ".my-tab-app-button__label",
        "content_role": "应用入口文案",
        "css_property": "color",
        "token": "var(--text-secondary)",
        "rule_ref": "colors_and_type.css#/text-secondary"
      },
      {
        "selector": ".my-tab-order-button__label",
        "content_role": "订单状态文案",
        "css_property": "color",
        "token": "var(--text-default)",
        "rule_ref": "colors_and_type.css#/text-default"
      }
    ],
    "component_bindings": [
      {
        "slot": "profile-avatar",
        "slug": "avatar",
        "reason": "顶部身份区使用正式 56px 图片头像承载个人身份识别。",
        "root_class": "avatar",
        "required_structure": [],
        "modifiers": ["avatar--56", "avatar--image"],
        "variant_dimensions": {
          "type": "image",
          "size": "56"
        },
        "source": "preview/component-avatar.html",
        "contract_file": "components/avatar.json"
      },
      {
        "slot": "identity-tags",
        "slug": "tag",
        "reason": "顶部身份标签使用 20 规格轻量展示账号身份与角色。",
        "root_class": "tag",
        "required_structure": [".tag__label"],
        "modifiers": ["tag--20"],
        "variant_dimensions": {
          "size": "20",
          "theme": "gray",
          "state": "normal",
          "affordance": "display-only"
        },
        "source": "preview/component-tag.html",
        "contract_file": "components/tag.json"
      },
      {
        "slot": "surface-cards",
        "slug": "card",
        "reason": "页面主要区块以白底表面卡片承载信息分组。",
        "root_class": "card",
        "required_structure": [".card__content"],
        "modifiers": ["card--surface"],
        "variant_dimensions": {
          "base": "auto",
          "surface": "surface"
        },
        "source": "preview/component-card.html",
        "contract_file": "components/card.json"
      },
      {
        "slot": "text-links",
        "slug": "link",
        "reason": "添加员工、员工管理、空间管理和全部采用独立文字链接表达轻跳转。",
        "root_class": "link",
        "required_structure": [],
        "modifiers": [],
        "variant_dimensions": {
          "mode": "standalone",
          "size": "14",
          "state": "default"
        },
        "source": "preview/component-link.html",
        "contract_file": "components/link.json"
      },
      {
        "slot": "membership-primary-action",
        "slug": "button",
        "reason": "会员续费作为页面唯一明确主操作，使用正式 strong 小按钮承载。",
        "root_class": "btn",
        "required_structure": [],
        "modifiers": ["btn--strong", "btn--sm"],
        "variant_dimensions": {
          "emphasis": "strong",
          "size": "sm",
          "iconMode": "text-only",
          "state": "default"
        },
        "source": "preview/component-button.html",
        "contract_file": "components/button.json"
      },
      {
        "slot": "settings-cells",
        "slug": "cell",
        "reason": "设置列表使用正式 cell clickable + arrow 结构承载进入下一层入口。",
        "root_class": "cell",
        "required_structure": [".cell__body", ".cell__content"],
        "modifiers": ["cell--single", "cell--bg-white", "cell--clickable", "cell--divider-right-edge"],
        "variant_dimensions": {
          "density": "single",
          "surface": "bg-white",
          "interaction": "clickable",
          "divider": "divider-right-edge",
          "leadingSlot": "none",
          "trailingSlot": "arrow"
        },
        "source": "preview/component-cell.html",
        "contract_file": "components/cell.json"
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "页面同时包含身份概览、会员状态、宫格应用、订单状态和设置入口，未命中现有明确范式，因此按已确认业务信息自主组合。",
      "page_edge_mode": "M8",
      "page_edge_mode_reason": "页面使用灰底承载多个白底内容块，保持统一外层留白与分组节奏。",
      "rules": [
        "顶部身份区、会员区、应用入口区和订单区统一使用白底表面分组。",
        "设置列表使用正式 cell-group 与 clickable arrow 结构，不自造等价列表组件。",
        "应用入口和订单状态保持首屏可扫读，文案允许两行内收束，不增加营销装饰。"
      ],
      "mutable_regions": [
        ".my-tab-scene"
      ]
    },
    "interaction_contract": [
      {
        "dom_id": "my-tab-add-staff",
        "target": "toast:add-staff"
      },
      {
        "dom_id": "my-tab-staff-manage",
        "target": "toast:staff-manage"
      },
      {
        "dom_id": "my-tab-renew",
        "target": "toast:renew-vip"
      },
      {
        "dom_id": "my-tab-space-manage",
        "target": "toast:space-manage"
      },
      {
        "dom_id": "my-tab-order-all",
        "target": "toast:orders-all"
      },
      {
        "dom_id": "my-tab-setting-settings",
        "target": "toast:setting"
      },
      {
        "dom_id": "my-tab-setting-wallet",
        "target": "toast:wallet"
      },
      {
        "dom_id": "my-tab-setting-favorite",
        "target": "toast:favorite"
      },
      {
        "dom_id": "my-tab-setting-coupon",
        "target": "toast:coupon"
      },
      {
        "dom_id": "my-tab-setting-commission",
        "target": "toast:commission"
      }
    ],
    "state_contract": [],
    "hard_rules": [
      "禁止硬编码颜色和间距",
      "禁止使用 token_whitelist 之外的 Token",
      "不补造任何未确认的下钻业务页面"
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-13T22:38:14+08:00"
  },
  "crowding_check": {
    "status": "passed",
    "items": [
      "375px 首屏无横向溢出",
      "393px 首屏无横向溢出",
      "顶部身份区按钮与标签未挤压换行失衡",
      "应用入口图标缩小后在两种视口下仍保持对齐",
      "订单状态区两行布局在两种视口下可完整阅读",
      "设置列表箭头与标题未发生重叠"
    ]
  }
}
*/

window.WegoApp.registerScene({
  routeId: 'my-tab',
  title: '我的',
  presentation: {
    type: 'host-tab',
    transition: 'none',
    coversTabBar: false
  },
  template: `
    <section class="my-tab-scene" data-surface-id="my-tab" data-route-id="my-tab" data-layout-mode="composed">
      <div class="card card--surface" data-dd-id="card-profile" data-component-slug="card" data-rule-source="preview/component-card.html">
        <div class="card__content my-tab-card">
          <div class="my-tab-profile">
            <div class="avatar avatar--56 avatar--image" data-dd-id="avatar-profile" data-component-slug="avatar" data-rule-source="preview/component-avatar.html">
              <img src="./lib/assets/image/avatar-defult.png" alt="周小棠头像" />
            </div>
            <div class="my-tab-profile__meta">
              <div class="my-tab-profile__header">
                <span class="my-tab__name" data-token-binding="font-size:var(--heading-sm-font-size);color:var(--text-default)">周小棠</span>
                <span class="tag tag--20 tag--gray" data-dd-id="tag-vip" data-component-slug="tag" data-rule-source="preview/component-tag.html">
                  <span class="tag__label">VIP</span>
                </span>
              </div>
              <div class="my-tab-role-row">
                <span class="tag tag--20 tag--gray" data-dd-id="tag-role-service" data-component-slug="tag" data-rule-source="preview/component-tag.html">
                  <span class="tag__label">客服</span>
                </span>
                <span class="tag tag--20 tag--gray" data-dd-id="tag-role-admin" data-component-slug="tag" data-rule-source="preview/component-tag.html">
                  <span class="tag__label">超级管理员</span>
                </span>
              </div>
            </div>
          </div>
          <div class="my-tab-profile__actions">
            <div class="my-tab-profile__links">
              <a href="javascript:void(0)" class="link" data-dd-id="link-add-staff" data-component-slug="link" data-rule-source="preview/component-link.html" data-dom-id="my-tab-add-staff" data-toast-message="添加员工入口开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">添加员工</a>
              <a href="javascript:void(0)" class="link" data-dd-id="link-staff-manage" data-component-slug="link" data-rule-source="preview/component-link.html" data-dom-id="my-tab-staff-manage" data-toast-message="员工管理入口开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">员工管理</a>
            </div>
          </div>
        </div>
      </div>

      <div class="card card--surface" data-dd-id="card-membership" data-component-slug="card" data-rule-source="preview/component-card.html">
        <div class="card__content my-tab-card">
          <div class="my-tab-membership__block">
            <div class="my-tab-membership__copy">
              <span class="my-tab__eyebrow">会员服务</span>
              <span class="my-tab__headline" data-token-binding="font-size:var(--heading-xs-font-size);color:var(--text-default)">年度超级会员</span>
              <span class="my-tab__subcopy" data-token-binding="color:var(--text-secondary)">会员有效期内可继续使用经营能力</span>
            </div>
            <button type="button" class="btn btn--strong btn--sm" data-dd-id="button-renew" data-component-slug="button" data-rule-source="preview/component-button.html" data-dom-id="my-tab-renew" data-toast-message="续费流程开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              去续费
            </button>
          </div>
          <div class="my-tab-space">
            <div class="my-tab-membership__copy">
              <span class="my-tab__eyebrow">空间状态</span>
              <span class="my-tab-space__usage" data-token-binding="color:var(--text-default);font-size:var(--body-lg-font-size)">117.29G / 360G</span>
              <span class="my-tab__subcopy" data-token-binding="color:var(--text-secondary)">当前已用空间</span>
            </div>
            <a href="javascript:void(0)" class="link" data-dd-id="link-space-manage" data-component-slug="link" data-rule-source="preview/component-link.html" data-dom-id="my-tab-space-manage" data-toast-message="空间管理入口开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">空间管理</a>
          </div>
        </div>
      </div>

      <div class="card card--surface" data-dd-id="card-apps" data-component-slug="card" data-rule-source="preview/component-card.html">
        <div class="card__content my-tab-card">
          <div class="my-tab-section__header">
            <span class="my-tab-section__title" data-token-binding="font-size:var(--heading-xs-font-size);color:var(--text-default)">常用应用</span>
          </div>
          <div class="my-tab-app-grid">
            <button type="button" class="my-tab-app-button" data-dom-id="app-yijiankaituan" data-toast-message="一键开团功能开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <img class="my-tab-app-button__icon" src="./lib/assets/icons/app-center/一键开团.svg" alt="" />
              <span class="my-tab-app-button__label" data-token-binding="color:var(--text-secondary)">一键开团</span>
            </button>
            <button type="button" class="my-tab-app-button" data-dom-id="app-dianpuzhuangxiu" data-toast-message="店铺装修功能开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <img class="my-tab-app-button__icon" src="./lib/assets/icons/app-center/店铺装修.svg" alt="" />
              <span class="my-tab-app-button__label" data-token-binding="color:var(--text-secondary)">店铺装修</span>
            </button>
            <button type="button" class="my-tab-app-button" data-dom-id="app-shoukuanma" data-toast-message="收款码功能开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <img class="my-tab-app-button__icon" src="./lib/assets/icons/app-center/收款码.svg" alt="" />
              <span class="my-tab-app-button__label" data-token-binding="color:var(--text-secondary)">收款码</span>
            </button>
            <button type="button" class="my-tab-app-button" data-dom-id="app-huiyuanguanli" data-toast-message="会员管理功能开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <img class="my-tab-app-button__icon" src="./lib/assets/icons/app-center/粉丝会员卡.svg" alt="" />
              <span class="my-tab-app-button__label" data-token-binding="color:var(--text-secondary)">会员管理</span>
            </button>
            <button type="button" class="my-tab-app-button" data-dom-id="app-fangkuzuji" data-toast-message="访客足迹功能开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <img class="my-tab-app-button__icon" src="./lib/assets/icons/app-center/访客足迹.svg" alt="" />
              <span class="my-tab-app-button__label" data-token-binding="color:var(--text-secondary)">访客足迹</span>
            </button>
            <button type="button" class="my-tab-app-button" data-dom-id="app-shujuzhongxin" data-toast-message="数据中心功能开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <img class="my-tab-app-button__icon" src="./lib/assets/icons/app-center/数据中心.svg" alt="" />
              <span class="my-tab-app-button__label" data-token-binding="color:var(--text-secondary)">数据中心</span>
            </button>
            <button type="button" class="my-tab-app-button" data-dom-id="app-weiqunfa" data-toast-message="微信群发功能开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <img class="my-tab-app-button__icon" src="./lib/assets/icons/app-center/微信群发助手.svg" alt="" />
              <span class="my-tab-app-button__label" data-token-binding="color:var(--text-secondary)">微信群发</span>
            </button>
            <button type="button" class="my-tab-app-button" data-dom-id="app-yijianhuanfu" data-toast-message="一键换肤功能开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <img class="my-tab-app-button__icon" src="./lib/assets/icons/app-center/一键换肤.svg" alt="" />
              <span class="my-tab-app-button__label" data-token-binding="color:var(--text-secondary)">一键换肤</span>
            </button>
            <button type="button" class="my-tab-app-button" data-dom-id="app-tuanduiguanli" data-toast-message="团队管理功能开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <img class="my-tab-app-button__icon" src="./lib/assets/icons/app-center/团队管理.svg" alt="" />
              <span class="my-tab-app-button__label" data-token-binding="color:var(--text-secondary)">团队管理</span>
            </button>
            <button type="button" class="my-tab-app-button" data-dom-id="app-gengduo" data-toast-message="更多应用功能开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <img class="my-tab-app-button__icon" src="./lib/assets/icons/app-center/营销中心.svg" alt="" />
              <span class="my-tab-app-button__label" data-token-binding="color:var(--text-secondary)">更多应用</span>
            </button>
          </div>
        </div>
      </div>

      <div class="card card--surface" data-dd-id="card-orders" data-component-slug="card" data-rule-source="preview/component-card.html">
        <div class="card__content my-tab-card">
          <div class="my-tab-section__header">
            <span class="my-tab-section__title" data-token-binding="font-size:var(--heading-xs-font-size);color:var(--text-default)">我买的</span>
            <a href="javascript:void(0)" class="link" data-dd-id="link-order-all" data-component-slug="link" data-rule-source="preview/component-link.html" data-dom-id="my-tab-order-all" data-toast-message="全部订单入口开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">全部</a>
          </div>
          <div class="my-tab-order-grid">
            <button type="button" class="my-tab-order-button" data-dom-id="order-daifukuan" data-toast-message="查看待付款订单" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <span class="my-tab-order-button__label">待付款</span>
            </button>
            <button type="button" class="my-tab-order-button" data-dom-id="order-yifukuan" data-toast-message="查看已付款订单" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <span class="my-tab-order-button__label">已付款</span>
            </button>
            <button type="button" class="my-tab-order-button" data-dom-id="order-yifahuo" data-toast-message="查看已发货订单" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <span class="my-tab-order-button__label">已发货</span>
            </button>
            <button type="button" class="my-tab-order-button" data-dom-id="order-tuikuan" data-toast-message="查看退款订单" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <span class="my-tab-order-button__label">退款</span>
            </button>
            <button type="button" class="my-tab-order-button" data-dom-id="order-guaqi" data-toast-message="查看挂起订单" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <span class="my-tab-order-button__label">挂起</span>
            </button>
          </div>
        </div>
      </div>

      <div class="my-tab-settings">
        <div class="cell-group">
          <div class="cell-group__content cell-group__content--card">
            <button type="button" class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-dd-id="cell-settings" data-component-slug="cell" data-rule-source="preview/component-cell.html" data-dom-id="my-tab-setting-settings" data-toast-message="设置入口开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <div class="cell__body">
                <div class="cell__content">
                  <div class="cell__title-row"><span class="cell__title">设置</span></div>
                </div>
                <div class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div>
              </div>
            </button>
            <button type="button" class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-dd-id="cell-wallet" data-component-slug="cell" data-rule-source="preview/component-cell.html" data-dom-id="my-tab-setting-wallet" data-toast-message="我的钱包入口开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <div class="cell__body">
                <div class="cell__content">
                  <div class="cell__title-row"><span class="cell__title">我的钱包</span></div>
                </div>
                <div class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div>
              </div>
            </button>
            <button type="button" class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-dd-id="cell-favorite" data-component-slug="cell" data-rule-source="preview/component-cell.html" data-dom-id="my-tab-setting-favorite" data-toast-message="我的收藏入口开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <div class="cell__body">
                <div class="cell__content">
                  <div class="cell__title-row"><span class="cell__title">我的收藏</span></div>
                </div>
                <div class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div>
              </div>
            </button>
            <button type="button" class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-dd-id="cell-coupon" data-component-slug="cell" data-rule-source="preview/component-cell.html" data-dom-id="my-tab-setting-coupon" data-toast-message="我的卡券入口开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <div class="cell__body">
                <div class="cell__content">
                  <div class="cell__title-row"><span class="cell__title">我的卡券</span></div>
                </div>
                <div class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div>
              </div>
            </button>
            <button type="button" class="cell cell--single cell--bg-white cell--clickable" data-dd-id="cell-commission" data-component-slug="cell" data-rule-source="preview/component-cell.html" data-dom-id="my-tab-setting-commission" data-toast-message="提现与返佣入口开发中" onclick="window.WegoApp.toast(this.dataset.toastMessage); return false;">
              <div class="cell__body">
                <div class="cell__content">
                  <div class="cell__title-row"><span class="cell__title">提现与返佣</span></div>
                </div>
                <div class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  init: function initMyTabScene(ctx) {
    var root = ctx.root;
    var appMessages = {
      'app-yijiankaituan': '一键开团功能开发中',
      'app-dianpuzhuangxiu': '店铺装修功能开发中',
      'app-shoukuanma': '收款码功能开发中',
      'app-wodexiaodian': '我的小店功能开发中',
      'app-huiyuanguanli': '会员管理功能开发中',
      'app-fangkuzuji': '访客足迹功能开发中',
      'app-shujuzhongxin': '数据中心功能开发中',
      'app-weiqunfa': '微信群发功能开发中',
      'app-yijianhuanfu': '一键换肤功能开发中',
      'app-tuanduiguanli': '团队管理功能开发中',
      'app-zhuanxiangxiaochengxu': '专享小程序功能开发中',
      'app-xiangcewangzhi': '相册网址功能开发中',
      'app-siyujianpan': '私域键盘功能开发中',
      'app-pc': 'PC(电脑版)功能开发中',
      'app-gengduo': '更多应用功能开发中'
    };
    var orderMessages = {
      'order-daifukuan': '查看待付款订单',
      'order-yifukuan': '查看已付款订单',
      'order-yifahuo': '查看已发货订单',
      'order-tuikuan': '查看退款订单',
      'order-guaqi': '查看挂起订单'
    };
    var delegatedMessages = {
      'my-tab-add-staff': '员工新增入口开发中',
      'my-tab-staff-manage': '员工管理入口开发中',
      'my-tab-renew': '续费流程开发中',
      'my-tab-space-manage': '空间管理入口开发中',
      'my-tab-order-all': '全部订单入口开发中',
      'my-tab-setting-settings': '设置入口开发中',
      'my-tab-setting-wallet': '我的钱包入口开发中',
      'my-tab-setting-favorite': '我的收藏入口开发中',
      'my-tab-setting-coupon': '我的卡券入口开发中',
      'my-tab-setting-commission': '提现与返佣入口开发中'
    };

    if (root.dataset.domDelegateBound !== 'true') {
      root.dataset.domDelegateBound = 'true';
      root.addEventListener('click', function (event) {
        var trigger = event.target.closest('[data-dom-id]');
        if (!trigger || !root.contains(trigger)) return;
        var domId = trigger.getAttribute('data-dom-id');
        if (appMessages[domId]) {
          ctx.toast(appMessages[domId]);
          return;
        }
        if (orderMessages[domId]) {
          ctx.toast(orderMessages[domId]);
          return;
        }
        if (delegatedMessages[domId]) {
          if (trigger.tagName === 'A') event.preventDefault();
          ctx.toast(delegatedMessages[domId]);
        }
      });
    }

    Object.keys(appMessages).forEach(function (domId) {
      var trigger = root.querySelector('[data-dom-id="' + domId + '"]');
      if (!trigger) return;
      trigger.addEventListener('click', function () {
        ctx.toast(appMessages[domId]);
      });
    });

    Object.keys(orderMessages).forEach(function (domId) {
      var trigger = root.querySelector('[data-dom-id="' + domId + '"]');
      if (!trigger) return;
      trigger.addEventListener('click', function () {
        ctx.toast(orderMessages[domId]);
      });
    });

    var addStaffTrigger = root.querySelector('[data-dom-id="my-tab-add-staff"]');
    if (addStaffTrigger) {
      addStaffTrigger.addEventListener('click', function () {
        ctx.toast('员工新增入口开发中');
      });
    }

    var staffManageTrigger = root.querySelector('[data-dom-id="my-tab-staff-manage"]');
    if (staffManageTrigger) {
      staffManageTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        ctx.toast('员工管理入口开发中');
      });
    }

    var renewTrigger = root.querySelector('[data-dom-id="my-tab-renew"]');
    if (renewTrigger) {
      renewTrigger.addEventListener('click', function () {
        ctx.toast('续费流程开发中');
      });
    }

    var spaceManageTrigger = root.querySelector('[data-dom-id="my-tab-space-manage"]');
    if (spaceManageTrigger) {
      spaceManageTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        ctx.toast('空间管理入口开发中');
      });
    }

    var orderAllTrigger = root.querySelector('[data-dom-id="my-tab-order-all"]');
    if (orderAllTrigger) {
      orderAllTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        ctx.toast('全部订单入口开发中');
      });
    }

    var settingsTrigger = root.querySelector('[data-dom-id="my-tab-setting-settings"]');
    if (settingsTrigger) {
      settingsTrigger.addEventListener('click', function () {
        ctx.toast('设置入口开发中');
      });
    }

    var walletTrigger = root.querySelector('[data-dom-id="my-tab-setting-wallet"]');
    if (walletTrigger) {
      walletTrigger.addEventListener('click', function () {
        ctx.toast('我的钱包入口开发中');
      });
    }

    var favoriteTrigger = root.querySelector('[data-dom-id="my-tab-setting-favorite"]');
    if (favoriteTrigger) {
      favoriteTrigger.addEventListener('click', function () {
        ctx.toast('我的收藏入口开发中');
      });
    }

    var couponTrigger = root.querySelector('[data-dom-id="my-tab-setting-coupon"]');
    if (couponTrigger) {
      couponTrigger.addEventListener('click', function () {
        ctx.toast('我的卡券入口开发中');
      });
    }

    var commissionTrigger = root.querySelector('[data-dom-id="my-tab-setting-commission"]');
    if (commissionTrigger) {
      commissionTrigger.addEventListener('click', function () {
        ctx.toast('提现与返佣入口开发中');
      });
    }
  }
});
