/* wego-design-contract:
{
  "surface_id": "dynamic-home",
  "route_id": "dynamic-home",
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
      "version": 410,
      "token_css": "colors_and_type.css",
      "component_css": "components.css",
      "component_inputs": [
        {
          "slug": "tabs",
          "preview_file": "preview/component-tabs.html",
          "contract_file": "components/tabs.json"
        },
        {
          "slug": "search",
          "preview_file": "preview/component-search.html",
          "contract_file": "components/search.json"
        },
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
          "slug": "image",
          "preview_file": "preview/component-image.html",
          "contract_file": "components/image.json"
        }
      ]
    },
    "token_whitelist": [
      "var(--bg-page)",
      "var(--bg-subtle)",
      "var(--bg-surface)",
      "var(--body-lg-font-size)",
      "var(--body-lg-line-height)",
      "var(--body-md-font-size)",
      "var(--body-md-line-height)",
      "var(--body-sm-font-size)",
      "var(--body-sm-line-height)",
      "var(--border-neutral-l2)",
      "var(--font-weight-medium)",
      "var(--font-weight-semibold)",
      "var(--heading-xs-font-size)",
      "var(--heading-xs-line-height)",
      "var(--size-40)",
      "var(--size-56)",
      "var(--spacer-4)",
      "var(--spacer-8)",
      "var(--spacer-12)",
      "var(--spacer-16)",
      "var(--spacer-20)",
      "var(--spacer-24)",
      "var(--text-default)",
      "var(--text-secondary)"
    ],
    "token_bindings": [
      {
        "selector": ".dynamic-home-search__hint",
        "content_role": "搜索词提示",
        "css_property": "color",
        "token": "var(--text-default)",
        "rule_ref": "colors_and_type.css#/text-default"
      },
      {
        "selector": ".dynamic-home-shortcut__label",
        "content_role": "快捷入口文案",
        "css_property": "color",
        "token": "var(--text-secondary)",
        "rule_ref": "colors_and_type.css#/text-secondary"
      },
      {
        "selector": ".dynamic-home-filter__hint",
        "content_role": "筛选提示文案",
        "css_property": "color",
        "token": "var(--text-secondary)",
        "rule_ref": "colors_and_type.css#/text-secondary"
      },
      {
        "selector": ".dynamic-home-summary__title",
        "content_role": "动态摘要标题",
        "css_property": "font-size",
        "token": "var(--heading-xs-font-size)",
        "rule_ref": "colors_and_type.css#/heading-xs-font-size"
      },
      {
        "selector": ".dynamic-home-summary__subcopy",
        "content_role": "动态摘要说明",
        "css_property": "color",
        "token": "var(--text-secondary)",
        "rule_ref": "colors_and_type.css#/text-secondary"
      },
      {
        "selector": ".dynamic-home-feed-card__shop",
        "content_role": "店铺名称",
        "css_property": "font-size",
        "token": "var(--heading-xs-font-size)",
        "rule_ref": "colors_and_type.css#/heading-xs-font-size"
      },
      {
        "selector": ".dynamic-home-feed-card__meta",
        "content_role": "店铺发布时间",
        "css_property": "color",
        "token": "var(--text-secondary)",
        "rule_ref": "colors_and_type.css#/text-secondary"
      },
      {
        "selector": ".dynamic-home-feed-card__title",
        "content_role": "动态标题",
        "css_property": "font-size",
        "token": "var(--body-lg-font-size)",
        "rule_ref": "colors_and_type.css#/body-lg-font-size"
      },
      {
        "selector": ".dynamic-home-product__name",
        "content_role": "商品名称",
        "css_property": "font-size",
        "token": "var(--body-sm-font-size)",
        "rule_ref": "colors_and_type.css#/body-sm-font-size"
      },
      {
        "selector": ".dynamic-home-product__price",
        "content_role": "商品价格",
        "css_property": "font-size",
        "token": "var(--body-md-font-size)",
        "rule_ref": "colors_and_type.css#/body-md-font-size"
      },
      {
        "selector": ".dynamic-home-empty__text",
        "content_role": "空状态提示",
        "css_property": "color",
        "token": "var(--text-secondary)",
        "rule_ref": "colors_and_type.css#/text-secondary"
      }
    ],
    "component_bindings": [
      {
        "slot": "main-tabs",
        "slug": "tabs",
        "reason": "顶部内容分类切换使用正式滚动 tabs 承载，默认落在关注频道。",
        "root_class": "wg-tabs",
        "required_structure": [
          ".wg-tabs__scroll",
          ".wg-tabs__item",
          ".wg-tabs__content",
          ".wg-tabs__label",
          ".wg-tabs__active-indicator"
        ],
        "modifiers": [
          "wg-tabs--standard",
          "wg-tabs--scroll"
        ],
        "variant_dimensions": {
          "size": "standard",
          "layout": "scroll",
          "icon": "none"
        },
        "source": "preview/component-tabs.html",
        "contract_file": "components/tabs.json"
      },
      {
        "slot": "top-search",
        "slug": "search",
        "reason": "页面搜索入口使用正式 accent 搜索框表达关注流检索与扫一扫能力。",
        "root_class": "searchbox",
        "required_structure": [
          ".searchbox__icon",
          ".searchbox__input",
          ".searchbox__actions"
        ],
        "modifiers": [
          "searchbox--md",
          "searchbox--accent"
        ],
        "variant_dimensions": {
          "size": "md",
          "surface": "accent-outline",
          "mode": "text",
          "state": "result",
          "hostPattern": "navbar-title-accent-search"
        },
        "source": "preview/component-search.html",
        "contract_file": "components/search.json"
      },
      {
        "slot": "shortcut-and-shop-avatar",
        "slug": "avatar",
        "reason": "频道快捷入口和动态卡片头像都使用 40 规格图片头像，维持圆形识别锚点。",
        "root_class": "avatar",
        "required_structure": [],
        "modifiers": [
          "avatar--40",
          "avatar--image"
        ],
        "variant_dimensions": {
          "type": "image",
          "size": "40"
        },
        "source": "preview/component-avatar.html",
        "contract_file": "components/avatar.json"
      },
      {
        "slot": "filter-tag",
        "slug": "tag",
        "reason": "筛选条件和店铺轻标签统一消费正式 tag，合同按本页主筛选的 28 规格记录。",
        "root_class": "tag",
        "required_structure": [
          ".tag__label"
        ],
        "modifiers": [
          "tag--28"
        ],
        "variant_dimensions": {
          "size": "28",
          "theme": "brand",
          "state": "selected",
          "affordance": "entry"
        },
        "source": "preview/component-tag.html",
        "contract_file": "components/tag.json"
      },
      {
        "slot": "feed-follow-button",
        "slug": "button",
        "reason": "关注动作使用正式小按钮表达关注与已关注两种轻操作状态。",
        "root_class": "btn",
        "required_structure": [],
        "modifiers": [
          "btn--medium",
          "btn--sm"
        ],
        "variant_dimensions": {
          "emphasis": "medium",
          "size": "sm",
          "iconMode": "text-only",
          "state": "default"
        },
        "source": "preview/component-button.html",
        "contract_file": "components/button.json"
      },
      {
        "slot": "product-thumbnail",
        "slug": "image",
        "reason": "动态商品宫格使用正式图片组件承载商品缩略图与按压反馈。",
        "root_class": "wg-image",
        "required_structure": [
          ".wg-image__src"
        ],
        "modifiers": [
          "wg-image--rounded-md",
          "wg-image--clickable"
        ],
        "variant_dimensions": {
          "fit": "cover",
          "size": "custom-rect",
          "radius": "rounded-md",
          "state": "loaded",
          "interaction": "clickable"
        },
        "source": "preview/component-image.html",
        "contract_file": "components/image.json"
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "动态首页同时包含频道切换、搜索、快捷入口、关注店铺动态和商品宫格，未命中现有正式范式，因此按已确认业务层级自主组合。",
      "page_edge_mode": "M0",
      "page_edge_mode_reason": "页面主体保持通栏白底，组件自身承担内部留白与内容分组节奏。",
      "rules": [
        "顶部区域吸顶并保持 tabs、搜索、快捷入口和筛选的连续阅读顺序。",
        "动态列表使用头像、店铺信息、轻关注按钮和三列商品宫格的稳定结构。",
        "商品缩略图、价格和店铺标签只表达业务状态，不复制参考图的强营销色块。"
      ],
      "mutable_regions": [
        ".dynamic-home-scene"
      ]
    },
    "interaction_contract": [
      { "dom_id": "dynamic-search", "target": "toast:search" },
      { "dom_id": "tab-follow", "target": "state:main-tab-follow" },
      { "dom_id": "tab-recommend", "target": "state:main-tab-recommend" },
      { "dom_id": "tab-flash", "target": "state:main-tab-flash" },
      { "dom_id": "tab-preview", "target": "state:main-tab-preview" },
      { "dom_id": "tab-subsidy", "target": "state:main-tab-subsidy" },
      { "dom_id": "tab-live", "target": "state:main-tab-live" },
      { "dom_id": "shortcut-follow-shop", "target": "toast:shortcut-follow-shop" },
      { "dom_id": "shortcut-ai-topic", "target": "toast:shortcut-ai-topic" },
      { "dom_id": "shortcut-coins", "target": "toast:shortcut-coins" },
      { "dom_id": "shortcut-new-arrivals", "target": "toast:shortcut-new-arrivals" },
      { "dom_id": "shortcut-group-buy", "target": "toast:shortcut-group-buy" },
      { "dom_id": "filter-all", "target": "state:filter-all" },
      { "dom_id": "filter-new", "target": "state:filter-new" },
      { "dom_id": "filter-preview", "target": "state:filter-preview" },
      { "dom_id": "filter-category", "target": "state:filter-category" },
      { "dom_id": "filter-live", "target": "state:filter-live" },
      { "dom_id": "feed-follow-0", "target": "state:toggle-follow-card-0" },
      { "dom_id": "feed-follow-1", "target": "state:toggle-follow-card-1" },
      { "dom_id": "product-0-0", "target": "toast:product-0-0" },
      { "dom_id": "product-0-1", "target": "toast:product-0-1" },
      { "dom_id": "product-0-2", "target": "toast:product-0-2" },
      { "dom_id": "product-1-0", "target": "toast:product-1-0" },
      { "dom_id": "product-1-1", "target": "toast:product-1-1" },
      { "dom_id": "product-1-2", "target": "toast:product-1-2" }
    ],
    "state_contract": [
      {
        "state_id": "initial-follow-feed",
        "initial": true,
        "trigger": "进入动态主 tab",
        "visible_result": "默认展示关注频道、全部筛选和两条关注店铺动态",
        "fallback": "保留最近一次有效频道与筛选",
        "persistence": "memory"
      },
      {
        "state_id": "main-tab-switch",
        "initial": false,
        "trigger": "点击顶部频道 tabs",
        "visible_result": "切换摘要、搜索词提示和两条动态内容",
        "fallback": "回退到关注频道内容",
        "persistence": "memory"
      },
      {
        "state_id": "filter-switch",
        "initial": false,
        "trigger": "点击筛选标签",
        "visible_result": "更新当前动态列表，必要时显示空状态提示",
        "fallback": "回退到全部筛选",
        "persistence": "memory"
      },
      {
        "state_id": "follow-toggle",
        "initial": false,
        "trigger": "点击店铺关注按钮",
        "visible_result": "按钮在已关注与可关注之间切换",
        "fallback": "保留最近一次有效按钮状态",
        "persistence": "memory"
      }
    ],
    "hard_rules": [
      "禁止硬编码颜色和间距",
      "禁止使用 token_whitelist 之外的 Token",
      "禁止把淘宝参考图直接等比复刻成微购页面"
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-13T23:20:00+08:00"
  },
  "crowding_check": {
    "status": "passed",
    "items": [
      "无横向溢出",
      "无文字重叠",
      "无图片裁切异常",
      "关注按钮不换行",
      "首屏信息层级清晰",
      "三列商品宫格在 375 和 393 视口均可读"
    ]
  }
}
*/

window.WegoApp.registerScene({
  routeId: 'dynamic-home',
  title: '动态',
  presentation: {
    type: 'host-tab',
    transition: 'none',
    coversTabBar: false
  },
  template: `
    <section class="dynamic-home-scene" data-surface-id="dynamic-home" data-route-id="dynamic-home" data-layout-mode="composed" data-bg="surface">
      <div class="dynamic-home-header">
        <div class="dynamic-home-main-tabs">
          <div class="wg-tabs wg-tabs--standard wg-tabs--scroll" role="tablist" data-dd-id="tabs-main" data-component-slug="tabs" data-rule-source="preview/component-tabs.html" data-tabs-root="main">
            <div class="wg-tabs__scroll">
              <button class="wg-tabs__item" type="button" role="tab" aria-selected="true" data-dom-id="tab-follow" data-tab-key="follow">
                <span class="wg-tabs__content"><span class="wg-tabs__label">关注</span></span>
              </button>
              <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-dom-id="tab-recommend" data-tab-key="recommend">
                <span class="wg-tabs__content"><span class="wg-tabs__label">推荐</span></span>
              </button>
              <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-dom-id="tab-flash" data-tab-key="flash">
                <span class="wg-tabs__content"><span class="wg-tabs__label">闪购</span></span>
              </button>
              <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-dom-id="tab-preview" data-tab-key="preview">
                <span class="wg-tabs__content"><span class="wg-tabs__label">预告</span></span>
              </button>
              <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-dom-id="tab-subsidy" data-tab-key="subsidy">
                <span class="wg-tabs__content"><span class="wg-tabs__label">国补</span></span>
              </button>
              <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-dom-id="tab-live" data-tab-key="live">
                <span class="wg-tabs__content"><span class="wg-tabs__label">直播</span></span>
              </button>
              <span class="wg-tabs__active-indicator"></span>
            </div>
          </div>
        </div>

        <div class="dynamic-home-searchbar">
          <div class="dynamic-home-search" data-dom-id="dynamic-search">
            <div class="searchbox searchbox--md searchbox--accent" data-dd-id="search-main" data-component-slug="search" data-rule-source="preview/component-search.html">
              <span class="searchbox__icon wego-iconfont-s icon-sousuo"></span>
              <div class="searchbox__input">
                <span class="searchbox__keyword dynamic-home-search__hint" data-token-binding="color:var(--text-default)" data-search-hint>夏日手作贴纸</span>
              </div>
              <div class="searchbox__actions">
                <span class="searchbox__action wego-iconfont-s icon-saoyisao" aria-hidden="true"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="dynamic-home-shortcuts">
          <button type="button" class="dynamic-home-shortcut" data-dom-id="shortcut-follow-shop">
            <span class="avatar avatar--40 avatar--image" data-dd-id="shortcut-avatar-follow-shop" data-component-slug="avatar" data-rule-source="preview/component-avatar.html">
              <img src="./lib/assets/image/avatar-defult.png" alt="关注店铺" data-shortcut-avatar="0" />
            </span>
            <span class="dynamic-home-shortcut__label" data-token-binding="color:var(--text-secondary)">关注店铺</span>
          </button>
          <button type="button" class="dynamic-home-shortcut" data-dom-id="shortcut-ai-topic">
            <span class="avatar avatar--40 avatar--image" data-dd-id="shortcut-avatar-ai-topic" data-component-slug="avatar" data-rule-source="preview/component-avatar.html">
              <img src="./lib/assets/image/avatar-defult.png" alt="AI 主题" data-shortcut-avatar="1" />
            </span>
            <span class="dynamic-home-shortcut__label" data-token-binding="color:var(--text-secondary)">AI 主题</span>
          </button>
          <button type="button" class="dynamic-home-shortcut" data-dom-id="shortcut-coins">
            <span class="avatar avatar--40 avatar--image" data-dd-id="shortcut-avatar-coins" data-component-slug="avatar" data-rule-source="preview/component-avatar.html">
              <img src="./lib/assets/image/avatar-defult.png" alt="领金币" data-shortcut-avatar="2" />
            </span>
            <span class="dynamic-home-shortcut__label" data-token-binding="color:var(--text-secondary)">领金币</span>
          </button>
          <button type="button" class="dynamic-home-shortcut" data-dom-id="shortcut-new-arrivals">
            <span class="avatar avatar--40 avatar--image" data-dd-id="shortcut-avatar-new-arrivals" data-component-slug="avatar" data-rule-source="preview/component-avatar.html">
              <img src="./lib/assets/image/avatar-defult.png" alt="新品上架" data-shortcut-avatar="3" />
            </span>
            <span class="dynamic-home-shortcut__label" data-token-binding="color:var(--text-secondary)">新品上架</span>
          </button>
          <button type="button" class="dynamic-home-shortcut" data-dom-id="shortcut-group-buy">
            <span class="avatar avatar--40 avatar--image" data-dd-id="shortcut-avatar-group-buy" data-component-slug="avatar" data-rule-source="preview/component-avatar.html">
              <img src="./lib/assets/image/avatar-defult.png" alt="限时拼团" data-shortcut-avatar="4" />
            </span>
            <span class="dynamic-home-shortcut__label" data-token-binding="color:var(--text-secondary)">限时拼团</span>
          </button>
        </div>

        <div class="dynamic-home-filters">
          <div class="dynamic-home-filter__hint" data-token-binding="color:var(--text-secondary)">关注上新</div>
          <div class="dynamic-home-filter__row">
            <button type="button" class="tag tag--28 tag--brand tag--selected dynamic-home-filter__chip" data-dd-id="filter-all-chip" data-component-slug="tag" data-rule-source="preview/component-tag.html" data-dom-id="filter-all" data-filter-key="all">
              <span class="tag__label">全部</span>
            </button>
            <button type="button" class="tag tag--28 tag--gray tag--normal dynamic-home-filter__chip" data-dd-id="filter-new-chip" data-component-slug="tag" data-rule-source="preview/component-tag.html" data-dom-id="filter-new" data-filter-key="new">
              <span class="tag__label">上新</span>
            </button>
            <button type="button" class="tag tag--28 tag--gray tag--normal dynamic-home-filter__chip" data-dd-id="filter-preview-chip" data-component-slug="tag" data-rule-source="preview/component-tag.html" data-dom-id="filter-preview" data-filter-key="preview">
              <span class="tag__label">预告</span>
            </button>
            <button type="button" class="tag tag--28 tag--gray tag--normal dynamic-home-filter__chip" data-dd-id="filter-category-chip" data-component-slug="tag" data-rule-source="preview/component-tag.html" data-dom-id="filter-category" data-filter-key="category">
              <span class="tag__label">分类</span>
            </button>
            <button type="button" class="tag tag--28 tag--gray tag--normal dynamic-home-filter__chip" data-dd-id="filter-live-chip" data-component-slug="tag" data-rule-source="preview/component-tag.html" data-dom-id="filter-live" data-filter-key="live">
              <span class="tag__label">直播</span>
            </button>
          </div>
        </div>
      </div>

      <div class="dynamic-home-body">
        <div class="dynamic-home-summary">
          <div class="dynamic-home-summary__title" data-token-binding="font-size:var(--heading-xs-font-size);color:var(--text-default)" data-summary-title>你关注的 24 家店铺今天上新 9 条</div>
          <div class="dynamic-home-summary__subcopy" data-token-binding="color:var(--text-secondary)" data-summary-subcopy>优先展示最近发布、直播预告和热卖补货</div>
        </div>

        <div class="dynamic-home-empty" hidden data-empty-state>
          <div class="dynamic-home-empty__text" data-token-binding="color:var(--text-secondary)">当前筛选下暂无可展示的动态，换个条件看看。</div>
        </div>

        <div class="dynamic-home-feed" data-feed-list>
          <article class="dynamic-home-feed-card" data-card-index="0">
            <div class="dynamic-home-feed-card__header">
              <span class="avatar avatar--40 avatar--image" data-dd-id="feed-avatar-0" data-component-slug="avatar" data-rule-source="preview/component-avatar.html">
                <img src="./lib/assets/image/avatar-defult.png" alt="店铺头像" data-card-avatar="0" />
              </span>
              <div class="dynamic-home-feed-card__main">
                <div class="dynamic-home-feed-card__topline">
                  <span class="dynamic-home-feed-card__shop" data-token-binding="font-size:var(--heading-xs-font-size);color:var(--text-default)" data-card-shop="0">锦丽文创</span>
                  <span class="tag tag--20 tag--brand-stroke" data-dd-id="feed-badge-0" data-component-slug="tag" data-rule-source="preview/component-tag.html" data-card-badge-wrap="0">
                    <span class="tag__label" data-card-badge="0">店铺热卖</span>
                  </span>
                </div>
                <div class="dynamic-home-feed-card__meta" data-token-binding="color:var(--text-secondary)" data-card-meta="0">今天发布 · 小店上新 6 件</div>
              </div>
              <button type="button" class="btn btn--medium btn--sm dynamic-home-feed-card__action" data-dd-id="button-follow-0" data-component-slug="button" data-rule-source="preview/component-button.html" data-dom-id="feed-follow-0" data-card-follow="0">+关注</button>
            </div>
            <div class="dynamic-home-feed-card__title" data-token-binding="font-size:var(--body-lg-font-size);color:var(--text-default)" data-card-title="0">掀起抢购热潮，这些热销商品你 GET 了吗？</div>
            <div class="dynamic-home-product-grid">
              <button type="button" class="dynamic-home-product" data-dom-id="product-0-0">
                <span class="wg-image wg-image--rounded-md wg-image--clickable" data-dd-id="product-image-0-0" data-component-slug="image" data-rule-source="preview/component-image.html">
                  <img class="wg-image__src is-loaded" src="./lib/assets/image/avatar-defult.png" alt="商品图" data-product-image="0-0" />
                  <span class="wg-image__overlay"></span>
                </span>
                <span class="dynamic-home-product__copy">
                  <span class="dynamic-home-product__name" data-token-binding="font-size:var(--body-sm-font-size);color:var(--text-default)" data-product-name="0-0">雕花和纸贴</span>
                  <span class="dynamic-home-product__price" data-token-binding="font-size:var(--body-md-font-size);color:var(--text-default)" data-product-price="0-0">¥39</span>
                </span>
              </button>
              <button type="button" class="dynamic-home-product" data-dom-id="product-0-1">
                <span class="wg-image wg-image--rounded-md wg-image--clickable" data-dd-id="product-image-0-1" data-component-slug="image" data-rule-source="preview/component-image.html">
                  <img class="wg-image__src is-loaded" src="./lib/assets/image/avatar-defult.png" alt="商品图" data-product-image="0-1" />
                  <span class="wg-image__overlay"></span>
                </span>
                <span class="dynamic-home-product__copy">
                  <span class="dynamic-home-product__name" data-token-binding="font-size:var(--body-sm-font-size);color:var(--text-default)" data-product-name="0-1">花边纸胶带</span>
                  <span class="dynamic-home-product__price" data-token-binding="font-size:var(--body-md-font-size);color:var(--text-default)" data-product-price="0-1">¥88</span>
                </span>
              </button>
              <button type="button" class="dynamic-home-product" data-dom-id="product-0-2">
                <span class="wg-image wg-image--rounded-md wg-image--clickable" data-dd-id="product-image-0-2" data-component-slug="image" data-rule-source="preview/component-image.html">
                  <img class="wg-image__src is-loaded" src="./lib/assets/image/avatar-defult.png" alt="商品图" data-product-image="0-2" />
                  <span class="wg-image__overlay"></span>
                </span>
                <span class="dynamic-home-product__copy">
                  <span class="dynamic-home-product__name" data-token-binding="font-size:var(--body-sm-font-size);color:var(--text-default)" data-product-name="0-2">浮雕花边套装</span>
                  <span class="dynamic-home-product__price" data-token-binding="font-size:var(--body-md-font-size);color:var(--text-default)" data-product-price="0-2">¥79</span>
                </span>
              </button>
            </div>
          </article>

          <article class="dynamic-home-feed-card" data-card-index="1">
            <div class="dynamic-home-feed-card__header">
              <span class="avatar avatar--40 avatar--image" data-dd-id="feed-avatar-1" data-component-slug="avatar" data-rule-source="preview/component-avatar.html">
                <img src="./lib/assets/image/avatar-defult.png" alt="店铺头像" data-card-avatar="1" />
              </span>
              <div class="dynamic-home-feed-card__main">
                <div class="dynamic-home-feed-card__topline">
                  <span class="dynamic-home-feed-card__shop" data-token-binding="font-size:var(--heading-xs-font-size);color:var(--text-default)" data-card-shop="1">UR 官方旗舰店</span>
                  <span class="tag tag--20 tag--brand-stroke" data-dd-id="feed-badge-1" data-component-slug="tag" data-rule-source="preview/component-tag.html" data-card-badge-wrap="1">
                    <span class="tag__label" data-card-badge="1">品牌榜单</span>
                  </span>
                </div>
                <div class="dynamic-home-feed-card__meta" data-token-binding="color:var(--text-secondary)" data-card-meta="1">今天发布 · 买家秀更新 3 条</div>
              </div>
              <button type="button" class="btn btn--weak btn--sm dynamic-home-feed-card__action" data-dd-id="button-follow-1" data-component-slug="button" data-rule-source="preview/component-button.html" data-dom-id="feed-follow-1" data-card-follow="1">已关注</button>
            </div>
            <div class="dynamic-home-feed-card__title" data-token-binding="font-size:var(--body-lg-font-size);color:var(--text-default)" data-card-title="1">买家秀和消费实录正在更新，先把本周上新的通勤款看完。</div>
            <div class="dynamic-home-product-grid">
              <button type="button" class="dynamic-home-product" data-dom-id="product-1-0">
                <span class="wg-image wg-image--rounded-md wg-image--clickable" data-dd-id="product-image-1-0" data-component-slug="image" data-rule-source="preview/component-image.html">
                  <img class="wg-image__src is-loaded" src="./lib/assets/image/avatar-defult.png" alt="商品图" data-product-image="1-0" />
                  <span class="wg-image__overlay"></span>
                </span>
                <span class="dynamic-home-product__copy">
                  <span class="dynamic-home-product__name" data-token-binding="font-size:var(--body-sm-font-size);color:var(--text-default)" data-product-name="1-0">薄荷绿针织衫</span>
                  <span class="dynamic-home-product__price" data-token-binding="font-size:var(--body-md-font-size);color:var(--text-default)" data-product-price="1-0">¥219</span>
                </span>
              </button>
              <button type="button" class="dynamic-home-product" data-dom-id="product-1-1">
                <span class="wg-image wg-image--rounded-md wg-image--clickable" data-dd-id="product-image-1-1" data-component-slug="image" data-rule-source="preview/component-image.html">
                  <img class="wg-image__src is-loaded" src="./lib/assets/image/avatar-defult.png" alt="商品图" data-product-image="1-1" />
                  <span class="wg-image__overlay"></span>
                </span>
                <span class="dynamic-home-product__copy">
                  <span class="dynamic-home-product__name" data-token-binding="font-size:var(--body-sm-font-size);color:var(--text-default)" data-product-name="1-1">低饱和衬衫裙</span>
                  <span class="dynamic-home-product__price" data-token-binding="font-size:var(--body-md-font-size);color:var(--text-default)" data-product-price="1-1">¥269</span>
                </span>
              </button>
              <button type="button" class="dynamic-home-product" data-dom-id="product-1-2">
                <span class="wg-image wg-image--rounded-md wg-image--clickable" data-dd-id="product-image-1-2" data-component-slug="image" data-rule-source="preview/component-image.html">
                  <img class="wg-image__src is-loaded" src="./lib/assets/image/avatar-defult.png" alt="商品图" data-product-image="1-2" />
                  <span class="wg-image__overlay"></span>
                </span>
                <span class="dynamic-home-product__copy">
                  <span class="dynamic-home-product__name" data-token-binding="font-size:var(--body-sm-font-size);color:var(--text-default)" data-product-name="1-2">通勤直筒长裤</span>
                  <span class="dynamic-home-product__price" data-token-binding="font-size:var(--body-md-font-size);color:var(--text-default)" data-product-price="1-2">¥199</span>
                </span>
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
  init: function initDynamicHomeScene(ctx) {
    var root = ctx.root;
    var SHORTCUT_AVATARS = [
      './lib/assets/icons/app-center/客户管理.svg',
      './lib/assets/icons/app-center/相册学堂.svg',
      './lib/assets/icons/app-center/积分商城.svg',
      './lib/assets/icons/app-center/批量发布.svg',
      './lib/assets/icons/app-center/限时秒杀.svg'
    ];
    var FEEDS = {
      follow: {
        searchHint: '夏日手作贴纸',
        summaryTitle: '你关注的 24 家店铺今天上新 9 条',
        summarySubcopy: '优先展示最近发布、直播预告和热卖补货',
        cards: [
          {
            shop: '锦丽文创',
            badge: '店铺热卖',
            meta: '今天发布 · 小店上新 6 件',
            title: '掀起抢购热潮，这些热销商品你 GET 了吗？',
            followed: false,
            filters: ['all', 'new', 'category'],
            avatarSrc: './lib/assets/icons/icon-dongtai-vip.svg',
            products: [
              { name: '雕花和纸贴', price: '¥39', imageSrc: './lib/assets/icons/app-center/批量发布.svg' },
              { name: '花边纸胶带', price: '¥88', imageSrc: './lib/assets/icons/app-center/快捷发布.svg' },
              { name: '浮雕花边套装', price: '¥79', imageSrc: './lib/assets/icons/app-center/整理相册.svg' }
            ]
          },
          {
            shop: 'UR 官方旗舰店',
            badge: '品牌榜单',
            meta: '今天发布 · 买家秀更新 3 条',
            title: '买家秀和消费实录正在更新，先把本周上新的通勤款看完。',
            followed: true,
            filters: ['all', 'new', 'category'],
            avatarSrc: './lib/assets/icons/icon-dongtai-svip.svg',
            products: [
              { name: '薄荷绿针织衫', price: '¥219', imageSrc: './lib/assets/icons/app-center/商品详情装修.svg' },
              { name: '低饱和衬衫裙', price: '¥269', imageSrc: './lib/assets/icons/app-center/店铺装修.svg' },
              { name: '通勤直筒长裤', price: '¥199', imageSrc: './lib/assets/icons/app-center/营销中心.svg' }
            ]
          }
        ]
      },
      recommend: {
        searchHint: '轻通勤上新',
        summaryTitle: '为你推荐 6 条更适合转发的动态',
        summarySubcopy: '结合你最近浏览的女装、文创和直播预告排序',
        cards: [
          {
            shop: '棠枝配饰',
            badge: '猜你想看',
            meta: '刚刚发布 · 买手推荐 4 件',
            title: '这一波耳饰更适合夏季轻通勤，低饱和金属和珍珠都补齐了。',
            followed: false,
            filters: ['all', 'new', 'category'],
            avatarSrc: './lib/assets/icons/app-center/客户标签.svg',
            products: [
              { name: '珍珠耳钉', price: '¥56', imageSrc: './lib/assets/icons/app-center/优惠券.svg' },
              { name: '磨砂耳圈', price: '¥68', imageSrc: './lib/assets/icons/app-center/P图.svg' },
              { name: '金属锁骨链', price: '¥89', imageSrc: './lib/assets/icons/app-center/视频号.svg' }
            ]
          },
          {
            shop: '留白生活',
            badge: '收藏夹同款',
            meta: '今天发布 · 收藏夹命中 2 条',
            title: '你最近收藏过的浅色餐具和亚麻桌布，这里都补了新图和到货说明。',
            followed: true,
            filters: ['all', 'preview', 'category'],
            avatarSrc: './lib/assets/icons/app-center/我的小店.svg',
            products: [
              { name: '白瓷早餐盘', price: '¥42', imageSrc: './lib/assets/icons/app-center/商品管理.svg' },
              { name: '亚麻桌布', price: '¥128', imageSrc: './lib/assets/icons/app-center/一键换肤.svg' },
              { name: '折边马克杯', price: '¥36', imageSrc: './lib/assets/icons/app-center/相册网址.svg' }
            ]
          }
        ]
      },
      flash: {
        searchHint: '晚八点限时闪购',
        summaryTitle: '闪购频道共有 4 场限时活动即将开始',
        summarySubcopy: '优先展示今晚八点开场和库存紧张的场次',
        cards: [
          {
            shop: '森系家居',
            badge: '限时 2 小时',
            meta: '19:30 开抢 · 预计 2 小时',
            title: '凉感床品和夏季家居布艺已排进今晚闪购，先看图后蹲点。',
            followed: true,
            filters: ['all', 'preview', 'category'],
            avatarSrc: './lib/assets/icons/app-center/直播开单.svg',
            products: [
              { name: '凉感枕套', price: '¥59', imageSrc: './lib/assets/icons/app-center/限时秒杀.svg' },
              { name: '麻感靠垫', price: '¥39', imageSrc: './lib/assets/icons/app-center/推广员.svg' },
              { name: '夏日薄毯', price: '¥109', imageSrc: './lib/assets/icons/app-center/支付后送券.svg' }
            ]
          },
          {
            shop: '简白厨具',
            badge: '库存告急',
            meta: '今晚 20:00 · 余量同步中',
            title: '高频消耗品补货预告已开放，低库存款优先加入闪购提醒。',
            followed: false,
            filters: ['all', 'preview', 'category'],
            avatarSrc: './lib/assets/icons/app-center/库存管理.svg',
            products: [
              { name: '不粘小奶锅', price: '¥149', imageSrc: './lib/assets/icons/app-center/售后.svg' },
              { name: '料理砧板', price: '¥72', imageSrc: './lib/assets/icons/app-center/采购单.svg' },
              { name: '量勺四件套', price: '¥29', imageSrc: './lib/assets/icons/app-center/批量导出.svg' }
            ]
          }
        ]
      },
      preview: {
        searchHint: '新品预告',
        summaryTitle: '预告频道正在等待 5 条即将发布的动态',
        summarySubcopy: '覆盖明天上新、补货预告和预约直播入口',
        cards: [
          {
            shop: '白露花艺',
            badge: '明日上新',
            meta: '明天 10:00 发布 · 花艺周更',
            title: '下批永生花礼盒会先上预告图和配色说明，今晚可以先收藏。',
            followed: true,
            filters: ['all', 'preview', 'category'],
            avatarSrc: './lib/assets/icons/app-center/发新客福利.svg',
            products: [
              { name: '奶油粉花盒', price: '¥169', imageSrc: './lib/assets/icons/app-center/红包雨.svg' },
              { name: '雾紫花束', price: '¥199', imageSrc: './lib/assets/icons/app-center/推广员.svg' },
              { name: '木盒永生花', price: '¥239', imageSrc: './lib/assets/icons/app-center/追福袋.svg' }
            ]
          },
          {
            shop: '小雨手帐',
            badge: '补货预告',
            meta: '今晚 21:00 更新 · 补货 2 款',
            title: '纸胶带补货和手帐贴新图都会集中放在这一条动态里。',
            followed: false,
            filters: ['all', 'preview', 'new', 'category'],
            avatarSrc: './lib/assets/icons/app-center/整理相册.svg',
            products: [
              { name: '雾蓝纸胶带', price: '¥22', imageSrc: './lib/assets/icons/app-center/批量编辑.svg' },
              { name: '碎花贴纸包', price: '¥18', imageSrc: './lib/assets/icons/app-center/批量抓图.svg' },
              { name: '打字机便签', price: '¥16', imageSrc: './lib/assets/icons/app-center/文本导入.svg' }
            ]
          }
        ]
      },
      subsidy: {
        searchHint: '国补家电',
        summaryTitle: '国补频道已整理 3 组高关注补贴商品',
        summarySubcopy: '先看补贴力度，再看是否支持到店核销或直播讲解',
        cards: [
          {
            shop: '住好家电',
            badge: '补贴到手价',
            meta: '今天发布 · 补贴专区 3 件',
            title: '高频小家电都加了补贴说明和到手价，适合直接转发给熟客。',
            followed: true,
            filters: ['all', 'category'],
            avatarSrc: './lib/assets/icons/app-center/硬件商城(智能硬件).svg',
            products: [
              { name: '轻量吸尘器', price: '¥699', imageSrc: './lib/assets/icons/app-center/硬件商城(智能硬件).svg' },
              { name: '除螨手持机', price: '¥399', imageSrc: './lib/assets/icons/app-center/规则中心.svg' },
              { name: '静音电饭煲', price: '¥499', imageSrc: './lib/assets/icons/app-center/销售报表.svg' }
            ]
          },
          {
            shop: '安心厨房',
            badge: '门店核销',
            meta: '下午更新 · 支持到店提货',
            title: '把补贴和提货方式写清以后，顾客更容易直接咨询和下单。',
            followed: false,
            filters: ['all', 'category'],
            avatarSrc: './lib/assets/icons/app-center/企业微信.svg',
            products: [
              { name: '空气炸锅', price: '¥329', imageSrc: './lib/assets/icons/app-center/公众号.svg' },
              { name: '小型破壁机', price: '¥279', imageSrc: './lib/assets/icons/app-center/查订单-查快递.svg' },
              { name: '双层蒸锅', price: '¥189', imageSrc: './lib/assets/icons/app-center/配货管理.svg' }
            ]
          }
        ]
      },
      live: {
        searchHint: '今晚直播清单',
        summaryTitle: '你关注的直播间今晚有 3 场值得蹲守的讲解',
        summarySubcopy: '优先保留开播时间、讲解主题和可以边看边买的商品',
        cards: [
          {
            shop: '姿态穿搭',
            badge: '今晚 20:00',
            meta: '直播预告 · 连麦试穿',
            title: '今晚主讲早秋通勤外套和长裤，直播间会同步放搭配链接。',
            followed: true,
            filters: ['all', 'live', 'category'],
            avatarSrc: './lib/assets/icons/app-center/视频号.svg',
            products: [
              { name: '短款西装外套', price: '¥299', imageSrc: './lib/assets/icons/app-center/视频号.svg' },
              { name: '直筒西裤', price: '¥219', imageSrc: './lib/assets/icons/app-center/私域直播.svg' },
              { name: '细带内搭', price: '¥79', imageSrc: './lib/assets/icons/app-center/抖音引流.svg' }
            ]
          },
          {
            shop: '简厨实验室',
            badge: '开播中',
            meta: '直播讲解 · 厨具实拍',
            title: '厨具细节和使用场景都在实拍里，适合有咨询需求的熟客直接进直播。',
            followed: false,
            filters: ['all', 'live', 'category'],
            avatarSrc: './lib/assets/icons/app-center/直播开单.svg',
            products: [
              { name: '珐琅煎锅', price: '¥179', imageSrc: './lib/assets/icons/app-center/直播开单.svg' },
              { name: '木柄刀具组', price: '¥139', imageSrc: './lib/assets/icons/app-center/查件码.svg' },
              { name: '油刷收纳架', price: '¥32', imageSrc: './lib/assets/icons/app-center/导出记录.svg' }
            ]
          }
        ]
      }
    };
    var SHORTCUT_MESSAGES = {
      'shortcut-follow-shop': '进入关注店铺列表',
      'shortcut-ai-topic': '查看 AI 主题灵感',
      'shortcut-coins': '领取今日金币',
      'shortcut-new-arrivals': '查看新品上架清单',
      'shortcut-group-buy': '进入限时拼团会场'
    };
    var PRODUCT_MESSAGES = {
      'product-0-0': '查看商品详情：卡片一商品一',
      'product-0-1': '查看商品详情：卡片一商品二',
      'product-0-2': '查看商品详情：卡片一商品三',
      'product-1-0': '查看商品详情：卡片二商品一',
      'product-1-1': '查看商品详情：卡片二商品二',
      'product-1-2': '查看商品详情：卡片二商品三'
    };

    if (!ctx.state.mainTab) ctx.state.mainTab = 'follow';
    if (!ctx.state.filterKey) ctx.state.filterKey = 'all';
    if (!ctx.state.followState) ctx.state.followState = { 0: false, 1: true };

    function syncTabsIndicator(tabsRoot) {
      if (!tabsRoot) return;
      var selected = tabsRoot.querySelector('.wg-tabs__item[aria-selected="true"] .wg-tabs__content');
      if (!selected) return;
      var scroll = tabsRoot.querySelector('.wg-tabs__scroll');
      var x = selected.offsetLeft - (scroll ? scroll.scrollLeft : 0);
      tabsRoot.style.setProperty('--_tabs-indicator-x', x + 'px');
      tabsRoot.style.setProperty('--_tabs-indicator-width', selected.offsetWidth + 'px');
    }

    function getVisibleCards() {
      var feed = FEEDS[ctx.state.mainTab] || FEEDS.follow;
      if (ctx.state.filterKey === 'all') return feed.cards;
      return feed.cards.filter(function (card) {
        return Array.isArray(card.filters) && card.filters.indexOf(ctx.state.filterKey) !== -1;
      });
    }

    function setFollowButton(button, followed) {
      if (!button) return;
      button.className = followed
        ? 'btn btn--weak btn--sm dynamic-home-feed-card__action'
        : 'btn btn--medium btn--sm dynamic-home-feed-card__action';
      button.textContent = followed ? '已关注' : '+关注';
    }

    function updateShortcuts() {
      SHORTCUT_AVATARS.forEach(function (item, index) {
        var img = root.querySelector('[data-shortcut-avatar="' + index + '"]');
        if (!img) return;
        img.src = item;
      });
    }

    function updateFilters() {
      root.querySelectorAll('[data-filter-key]').forEach(function (chip) {
        var active = chip.getAttribute('data-filter-key') === ctx.state.filterKey;
        chip.className = active
          ? 'tag tag--28 tag--brand tag--selected dynamic-home-filter__chip'
          : 'tag tag--28 tag--gray tag--normal dynamic-home-filter__chip';
      });
    }

    function updateMainTabs() {
      root.querySelectorAll('[data-tab-key]').forEach(function (item) {
        var active = item.getAttribute('data-tab-key') === ctx.state.mainTab;
        item.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      syncTabsIndicator(root.querySelector('[data-tabs-root="main"]'));
    }

    function updateFeed() {
      var feed = FEEDS[ctx.state.mainTab] || FEEDS.follow;
      var cards = getVisibleCards();
      var emptyState = root.querySelector('[data-empty-state]');
      var feedList = root.querySelector('[data-feed-list]');

      root.querySelector('[data-search-hint]').textContent = feed.searchHint;
      root.querySelector('[data-summary-title]').textContent = feed.summaryTitle;
      root.querySelector('[data-summary-subcopy]').textContent = feed.summarySubcopy;

      if (emptyState) emptyState.hidden = cards.length > 0;
      if (feedList) feedList.hidden = cards.length === 0;

      [0, 1].forEach(function (index) {
        var cardEl = root.querySelector('[data-card-index="' + index + '"]');
        var card = cards[index];
        if (!cardEl) return;
        if (!card) {
          cardEl.hidden = true;
          return;
        }

        cardEl.hidden = false;
        var followed = Object.prototype.hasOwnProperty.call(ctx.state.followState, index)
          ? ctx.state.followState[index]
          : card.followed;

        var avatar = root.querySelector('[data-card-avatar="' + index + '"]');
        if (avatar) {
          avatar.src = card.avatarSrc;
          avatar.alt = card.shop + '头像';
        }
        var shop = root.querySelector('[data-card-shop="' + index + '"]');
        if (shop) shop.textContent = card.shop;
        var badge = root.querySelector('[data-card-badge="' + index + '"]');
        if (badge) badge.textContent = card.badge;
        var meta = root.querySelector('[data-card-meta="' + index + '"]');
        if (meta) meta.textContent = card.meta;
        var title = root.querySelector('[data-card-title="' + index + '"]');
        if (title) title.textContent = card.title;
        setFollowButton(root.querySelector('[data-card-follow="' + index + '"]'), followed);

        card.products.forEach(function (product, productIndex) {
          var productImage = root.querySelector('[data-product-image="' + index + '-' + productIndex + '"]');
          var productName = root.querySelector('[data-product-name="' + index + '-' + productIndex + '"]');
          var productPrice = root.querySelector('[data-product-price="' + index + '-' + productIndex + '"]');
          if (productImage) {
            productImage.src = product.imageSrc;
            productImage.alt = product.name;
          }
          if (productName) productName.textContent = product.name;
          if (productPrice) productPrice.textContent = product.price;
        });
      });
    }

    function bindSelector(selector, handler) {
      var trigger = root.querySelector(selector);
      if (!trigger) return;
      trigger.addEventListener('click', handler);
    }

    function render() {
      updateMainTabs();
      updateFilters();
      updateShortcuts();
      updateFeed();
    }

    if (root.dataset.dynamicHomeBound !== 'true') {
      root.dataset.dynamicHomeBound = 'true';
      bindSelector('[data-dom-id="dynamic-search"]', function () {
        ctx.toast('搜索入口已聚焦到动态频道');
      });
      bindSelector('[data-dom-id="tab-follow"]', function () { ctx.state.mainTab = 'follow'; render(); });
      bindSelector('[data-dom-id="tab-recommend"]', function () { ctx.state.mainTab = 'recommend'; render(); });
      bindSelector('[data-dom-id="tab-flash"]', function () { ctx.state.mainTab = 'flash'; render(); });
      bindSelector('[data-dom-id="tab-preview"]', function () { ctx.state.mainTab = 'preview'; render(); });
      bindSelector('[data-dom-id="tab-subsidy"]', function () { ctx.state.mainTab = 'subsidy'; render(); });
      bindSelector('[data-dom-id="tab-live"]', function () { ctx.state.mainTab = 'live'; render(); });
      bindSelector('[data-dom-id="shortcut-follow-shop"]', function () { ctx.toast(SHORTCUT_MESSAGES['shortcut-follow-shop']); });
      bindSelector('[data-dom-id="shortcut-ai-topic"]', function () { ctx.toast(SHORTCUT_MESSAGES['shortcut-ai-topic']); });
      bindSelector('[data-dom-id="shortcut-coins"]', function () { ctx.toast(SHORTCUT_MESSAGES['shortcut-coins']); });
      bindSelector('[data-dom-id="shortcut-new-arrivals"]', function () { ctx.toast(SHORTCUT_MESSAGES['shortcut-new-arrivals']); });
      bindSelector('[data-dom-id="shortcut-group-buy"]', function () { ctx.toast(SHORTCUT_MESSAGES['shortcut-group-buy']); });
      bindSelector('[data-dom-id="filter-all"]', function () { ctx.state.filterKey = 'all'; render(); });
      bindSelector('[data-dom-id="filter-new"]', function () { ctx.state.filterKey = 'new'; render(); });
      bindSelector('[data-dom-id="filter-preview"]', function () { ctx.state.filterKey = 'preview'; render(); });
      bindSelector('[data-dom-id="filter-category"]', function () { ctx.state.filterKey = 'category'; render(); });
      bindSelector('[data-dom-id="filter-live"]', function () { ctx.state.filterKey = 'live'; render(); });
      bindSelector('[data-dom-id="feed-follow-0"]', function () { ctx.state.followState[0] = !ctx.state.followState[0]; render(); });
      bindSelector('[data-dom-id="feed-follow-1"]', function () { ctx.state.followState[1] = !ctx.state.followState[1]; render(); });
      bindSelector('[data-dom-id="product-0-0"]', function () { ctx.toast(PRODUCT_MESSAGES['product-0-0']); });
      bindSelector('[data-dom-id="product-0-1"]', function () { ctx.toast(PRODUCT_MESSAGES['product-0-1']); });
      bindSelector('[data-dom-id="product-0-2"]', function () { ctx.toast(PRODUCT_MESSAGES['product-0-2']); });
      bindSelector('[data-dom-id="product-1-0"]', function () { ctx.toast(PRODUCT_MESSAGES['product-1-0']); });
      bindSelector('[data-dom-id="product-1-1"]', function () { ctx.toast(PRODUCT_MESSAGES['product-1-1']); });
      bindSelector('[data-dom-id="product-1-2"]', function () { ctx.toast(PRODUCT_MESSAGES['product-1-2']); });
    }

    render();
  }
});
