/* wego-design-contract: {
  "surface_id": "publish-product",
  "route_id": "publish-product",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "push",
    "transition": "slide-left-enter, slide-right-exit",
    "dismissAction": "back-button",
    "overlayLevel": "inline",
    "coversTabBar": true,
    "source": "library-consumption.json#/appRuntime/presentationTypes"
  },
  "prompt_contract": {
    "design_system_version": 484,
    "token_bindings": [
      {
        "selector": ".publish-product",
        "content_role": "页面背景",
        "css_property": "background",
        "token": "var(--bg-page)"
      },
      {
        "selector": ".publish-product__scroll",
        "content_role": "主滚动区底部基础避让",
        "css_property": "padding-bottom",
        "token": "var(--safe-area-bottom-content)"
      },
      {
        "selector": ".publish-product__moments",
        "content_role": "类朋友圈图文区横向留白",
        "css_property": "padding-inline",
        "token": "var(--spacer-16)"
      },
      {
        "selector": ".publish-product__moments",
        "content_role": "类朋友圈图文区纵向留白",
        "css_property": "padding-block",
        "token": "var(--spacer-16)"
      },
      {
        "selector": ".publish-product__textarea",
        "content_role": "文案输入框文字颜色",
        "css_property": "color",
        "token": "var(--text-default)"
      },
      {
        "selector": ".publish-product__textarea",
        "content_role": "文案输入框字号",
        "css_property": "font-size",
        "token": "var(--body-lg-font-size)"
      },
      {
        "selector": ".publish-product__textarea",
        "content_role": "文案输入框行高",
        "css_property": "line-height",
        "token": "var(--body-lg-line-height)"
      },
      {
        "selector": ".publish-product__textarea::placeholder",
        "content_role": "文案输入框占位符颜色",
        "css_property": "color",
        "token": "var(--text-placeholder)"
      },
      {
        "selector": ".publish-product__image-grid",
        "content_role": "图片网格间距",
        "css_property": "gap",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".publish-product__image-item",
        "content_role": "图片项圆角",
        "css_property": "border-radius",
        "token": "var(--radius-8)"
      },
      {
        "selector": ".publish-product__image-add",
        "content_role": "添加图片按钮边框颜色",
        "css_property": "border-color",
        "token": "var(--border-neutral-l2)"
      },
      {
        "selector": ".publish-product__image-add",
        "content_role": "添加图片按钮圆角",
        "css_property": "border-radius",
        "token": "var(--radius-8)"
      },
      {
        "selector": ".publish-product__capsule-bar",
        "content_role": "横向胶囊条横向留白",
        "css_property": "padding-inline",
        "token": "var(--spacer-16)"
      },
      {
        "selector": ".publish-product__capsule-bar",
        "content_role": "横向胶囊条纵向留白",
        "css_property": "padding-block",
        "token": "var(--spacer-12)"
      },
      {
        "selector": ".publish-product__capsule-bar",
        "content_role": "横向胶囊条背景",
        "css_property": "background",
        "token": "var(--bg-surface)"
      },
      {
        "selector": ".publish-product__capsule-list",
        "content_role": "胶囊列表间距",
        "css_property": "gap",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".publish-product__capsule-item",
        "content_role": "胶囊项背景",
        "css_property": "background",
        "token": "var(--bg-subtle)"
      },
      {
        "selector": ".publish-product__capsule-item",
        "content_role": "胶囊项圆角",
        "css_property": "border-radius",
        "token": "var(--radius-full)"
      },
      {
        "selector": ".publish-product__capsule-item",
        "content_role": "胶囊项横向留白",
        "css_property": "padding-inline",
        "token": "var(--spacer-12)"
      },
      {
        "selector": ".publish-product__capsule-item",
        "content_role": "胶囊项纵向留白",
        "css_property": "padding-block",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".publish-product__capsule-item",
        "content_role": "胶囊项文字颜色",
        "css_property": "color",
        "token": "var(--text-secondary)"
      },
      {
        "selector": ".publish-product__capsule-item",
        "content_role": "胶囊项文字字号",
        "css_property": "font-size",
        "token": "var(--body-sm-font-size)"
      },
      {
        "selector": ".publish-product__capsule-item.has-value",
        "content_role": "已选中胶囊项背景",
        "css_property": "background",
        "token": "var(--bg-brand-surface-l1)"
      },
      {
        "selector": ".publish-product__capsule-item.has-value",
        "content_role": "已选中胶囊项文字颜色",
        "css_property": "color",
        "token": "var(--text-brand)"
      },
      {
        "selector": ".publish-product__capsule-label",
        "content_role": "胶囊标签颜色",
        "css_property": "color",
        "token": "var(--text-tertiary)"
      },
      {
        "selector": ".publish-product__capsule-label",
        "content_role": "胶囊标签字号",
        "css_property": "font-size",
        "token": "var(--body-sm-font-size)"
      },
      {
        "selector": ".publish-product__form-group",
        "content_role": "表单组标题颜色",
        "css_property": "color",
        "token": "var(--text-tertiary)"
      },
      {
        "selector": ".publish-product__form-group",
        "content_role": "表单组标题字号",
        "css_property": "font-size",
        "token": "var(--body-sm-font-size)"
      },
      {
        "selector": ".publish-product__form-group",
        "content_role": "表单组标题纵向留白",
        "css_property": "padding-block",
        "token": "var(--spacer-8)"
      },
      {
        "selector": ".publish-product__form-group",
        "content_role": "表单组标题横向留白",
        "css_property": "padding-inline",
        "token": "var(--spacer-16)"
      },
      {
        "selector": ".publish-product__bottom-bar",
        "content_role": "底部操作栏背景",
        "css_property": "background",
        "token": "var(--bg-surface)"
      },
      {
        "selector": ".publish-product__bottom-bar",
        "content_role": "底部操作栏横向留白",
        "css_property": "padding-inline",
        "token": "var(--spacer-16)"
      },
      {
        "selector": ".publish-product__bottom-bar",
        "content_role": "底部操作栏纵向留白",
        "css_property": "padding-block",
        "token": "var(--spacer-12)"
      }
    ],
    "component_bindings": [
      {
        "binding_id": "publish-product-navbar",
        "slug": "navbar",
        "reason": "普通二级页面使用返回箭头和居中标题",
        "variant_dimensions": {
          "leftControl": "back-icon",
          "titleAlignment": "center",
          "actions": "none",
          "spacing": "default",
          "pageTransition": "push",
          "position": "sticky"
        }
      },
      {
        "binding_id": "publish-product-form-group",
        "slug": "form",
        "reason": "表单区使用 form-group 组织字段分组",
        "variant_dimensions": {
          "layout": "vertical",
          "surface": "default"
        }
      },
      {
        "binding_id": "publish-product-form-body",
        "slug": "form",
        "reason": "表单字段使用 form-body 承载",
        "variant_dimensions": {
          "layout": "horizontal",
          "surface": "default"
        }
      },
      {
        "binding_id": "publish-product-button",
        "slug": "button",
        "reason": "底部发布按钮使用强调按钮",
        "variant_dimensions": {
          "emphasis": "strong",
          "size": "lg",
          "iconMode": "text-only",
          "state": "default"
        }
      },
      {
        "binding_id": "publish-product-actionsheet",
        "slug": "actionsheet",
        "reason": "选择标签、来源、可见性、规格、颜色等使用底部操作表单",
        "variant_dimensions": {
          "mode": "select",
          "header": "none",
          "state": "open"
        }
      },
      {
        "binding_id": "publish-product-toast",
        "slug": "toast",
        "reason": "类朋友圈区域缺失时使用 toast 提示",
        "variant_dimensions": {
          "variant": "default",
          "state": "visible"
        }
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "发布产品是普通 Push 二级页；根与主滚动区通栏，navbar 和底部操作栏保持通栏，类朋友圈图文区、横向胶囊条和表单区作为语义内容组承担各自留白。底部操作栏在滚动区之外按流式预留空间。",
      "mutable_regions": [
        ".publish-product__scroll",
        ".publish-product__image-grid",
        ".publish-product__capsule-list"
      ],
      "principle_refs": [
        "wego-clarity-page-architecture-before-components",
        "wego-efficiency-primary-action-right"
      ],
      "page_layers": [
        {
          "region_id": "publish-product-navbar",
          "selector": ".publish-product__navbar",
          "scope": "page-local",
          "role": "navigation"
        },
        {
          "region_id": "publish-product-scroll",
          "selector": ".publish-product__scroll",
          "scope": "page-local",
          "role": "content"
        },
        {
          "region_id": "publish-product-bottom-bar",
          "selector": ".publish-product__bottom-bar",
          "scope": "page-local",
          "role": "navigation"
        }
      ],
      "scroll_architecture": {
        "viewport_selector": ".publish-product",
        "primary_scroll_selector": ".publish-product__scroll",
        "document_scroll": false,
        "nested_scroll_regions": [],
        "fixed_regions": [
          {
            "region_id": "publish-product-bottom-bar",
            "selector": ".publish-product__bottom-bar",
            "edge": "bottom",
            "safe_area_owner": "component",
            "clearance": "flow-reserved"
          }
        ]
      },
      "layout_groups": [
        {
          "group_id": "publish-product-navbar-group",
          "selector": ".publish-product__navbar",
          "content_role": "导航通栏 surface",
          "inline_inset_token": "var(--layout-page-margin-m0)",
          "spacing_owner": "component",
          "gap_token": "var(--spacer-0)"
        },
        {
          "group_id": "publish-product-moments-group",
          "selector": ".publish-product__moments",
          "content_role": "类朋友圈图文内容组",
          "inline_inset_token": "var(--spacer-16)",
          "spacing_owner": "scene",
          "gap_token": "var(--spacer-16)"
        },
        {
          "group_id": "publish-product-capsule-group",
          "selector": ".publish-product__capsule-bar",
          "content_role": "横向胶囊条内容组",
          "inline_inset_token": "var(--spacer-16)",
          "spacing_owner": "scene",
          "gap_token": "var(--spacer-12)"
        },
        {
          "group_id": "publish-product-form-group",
          "selector": ".publish-product__form-group",
          "content_role": "表单内容组",
          "inline_inset_token": "var(--layout-page-margin-m0)",
          "spacing_owner": "component",
          "gap_token": "var(--spacer-0)"
        },
        {
          "group_id": "publish-product-bottom-group",
          "selector": ".publish-product__bottom-bar",
          "content_role": "底部操作通栏 surface",
          "inline_inset_token": "var(--layout-page-margin-m0)",
          "spacing_owner": "component",
          "gap_token": "var(--spacer-0)"
        }
      ],
      "sticky_regions": []
    },
    "interaction_contract": [
      {
        "dom_id": "publish-product-back",
        "target": "navigation:back"
      },
      {
        "dom_id": "publish-product-add-image",
        "target": "feedback:toast"
      },
      {
        "dom_id": "publish-product-select-tag",
        "target": "overlay:sheet"
      },
      {
        "dom_id": "publish-product-select-source",
        "target": "overlay:sheet"
      },
      {
        "dom_id": "publish-product-select-visibility",
        "target": "overlay:sheet"
      },
      {
        "dom_id": "publish-product-select-spec",
        "target": "overlay:sheet"
      },
      {
        "dom_id": "publish-product-select-color",
        "target": "overlay:sheet"
      },
      {
        "dom_id": "publish-product-submit",
        "target": "feedback:toast"
      }
    ],
    "state_contract": [
      {
        "state_id": "publish-product-initial",
        "initial": true,
        "trigger": "场景进入",
        "visible_result": "展示空白发布表单或回填编辑数据",
        "fallback": "使用空白表单",
        "persistence": "memory"
      },
      {
        "state_id": "publish-product-publishing",
        "initial": false,
        "trigger": "点击发布按钮",
        "visible_result": "显示发布中状态",
        "fallback": "停留当前页面",
        "persistence": "memory"
      },
      {
        "state_id": "publish-product-published",
        "initial": false,
        "trigger": "发布成功",
        "visible_result": "Toast 提示发布成功并返回动态页",
        "fallback": "停留当前页面",
        "persistence": "memory"
      },
      {
        "state_id": "publish-product-validation-error",
        "initial": false,
        "trigger": "校验失败",
        "visible_result": "类朋友圈区域缺失用 toast 提示，售价缺失就地显示红色错误",
        "fallback": "停留当前页面",
        "persistence": "memory"
      }
    ]
  },
  "visual_check": {
    "status": "pending",
    "viewports": [375, 393],
    "checked_at": null,
    "checks": {
      "horizontal_overflow": false,
      "overlap": false,
      "clipping": false,
      "action_legibility": false,
      "primary_focus": false,
      "state_feedback": false
    }
  }
} */

(function registerPublishProduct() {
  var editData = null;
  var formState = {
    text: '',
    images: [],
    tag: null,
    source: null,
    visibility: null,
    price: '',
    itemNumber: '',
    specs: [],
    colors: [],
    weight: '',
    stock: ''
  };

  var tagOptions = [
    { id: 'new', label: '新品' },
    { id: 'hot', label: '热卖' },
    { id: 'recommend', label: '推荐' },
    { id: 'limited', label: '限量' }
  ];

  var sourceOptions = [
    { id: 'self', label: '自有货源' },
    { id: 'agent', label: '代理' },
    { id: 'factory', label: '工厂直供' },
    { id: 'import', label: '进口' }
  ];

  var visibilityOptions = [
    { id: 'public', label: '公开' },
    { id: 'friends', label: '仅好友可见' },
    { id: 'private', label: '仅自己可见' }
  ];

  var specOptions = [
    { id: 's', label: 'S' },
    { id: 'm', label: 'M' },
    { id: 'l', label: 'L' },
    { id: 'xl', label: 'XL' },
    { id: 'xxl', label: 'XXL' }
  ];

  var colorOptions = [
    { id: 'black', label: '黑色' },
    { id: 'white', label: '白色' },
    { id: 'red', label: '红色' },
    { id: 'blue', label: '蓝色' },
    { id: 'green', label: '绿色' }
  ];

  function escapeHtml(value) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value == null ? '' : value).split('').map(function(char) { return map[char] || char; }).join('');
  }

  function findOption(options, id) {
    return options.find(function(opt) { return opt.id === id; });
  }

  function actionsheetTemplate(title, options, selectedId, selectAttr) {
    var itemsHtml = options.map(function(opt) {
      var selected = opt.id === selectedId ? ' actionsheet__item--selected' : '';
      return '<div class="actionsheet__item' + selected + '" ' + selectAttr + '="' + opt.id + '">'
        + '<div class="actionsheet__item-row">'
        + '<div class="actionsheet__item-main">'
        + '<div class="actionsheet__item-title">' + escapeHtml(opt.label) + '</div>'
        + '</div>'
        + '<div class="actionsheet__item-check-slot">'
        + '<i class="wego-iconfont-s icon-gou-jiacu actionsheet__item-check"></i>'
        + '</div>'
        + '</div>'
        + '</div>';
    }).join('');

    return '<div class="actionsheet actionsheet--select" role="dialog" aria-modal="true" data-state="closed">'
      + '<div class="actionsheet__panel">'
      + '<div class="actionsheet__header actionsheet__header--text">'
      + '<div class="actionsheet__header-text">' + escapeHtml(title) + '</div>'
      + '</div>'
      + '<div class="actionsheet__list">'
      + itemsHtml
      + '</div>'
      + '<div class="actionsheet__cancel-gap"></div>'
      + '<div class="actionsheet__cancel" data-close-sheet>取消</div>'
      + '</div>'
      + '</div>';
  }

  function multiSelectActionsheetTemplate(title, options, selectedIds, selectAttr) {
    var itemsHtml = options.map(function(opt) {
      var selected = selectedIds.indexOf(opt.id) !== -1 ? ' actionsheet__item--selected' : '';
      return '<div class="actionsheet__item' + selected + '" ' + selectAttr + '="' + opt.id + '">'
        + '<div class="actionsheet__item-row">'
        + '<div class="actionsheet__item-main">'
        + '<div class="actionsheet__item-title">' + escapeHtml(opt.label) + '</div>'
        + '</div>'
        + '<div class="actionsheet__item-check-slot">'
        + '<i class="wego-iconfont-s icon-gou-jiacu actionsheet__item-check"></i>'
        + '</div>'
        + '</div>'
        + '</div>';
    }).join('');

    return '<div class="actionsheet actionsheet--select" role="dialog" aria-modal="true" data-state="closed">'
      + '<div class="actionsheet__panel">'
      + '<div class="actionsheet__header actionsheet__header--text">'
      + '<div class="actionsheet__header-text">' + escapeHtml(title) + '</div>'
      + '</div>'
      + '<div class="actionsheet__list">'
      + itemsHtml
      + '</div>'
      + '<div class="actionsheet__cancel-gap"></div>'
      + '<div class="actionsheet__cancel" data-close-sheet>取消</div>'
      + '</div>'
      + '</div>';
  }

  function imageGridTemplate(images) {
    var itemsHtml = images.map(function(img, index) {
      return '<div class="publish-product__image-item" data-image-index="' + index + '">'
        + '<img src="' + img + '" alt="">'
        + '</div>';
    }).join('');

    var addBtn = '<button type="button" class="publish-product__image-add" data-dom-id="publish-product-add-image">'
      + '<i class="wego-iconfont-s icon-jia16"></i>'
      + '</button>';

    return itemsHtml + addBtn;
  }

  window.WegoApp.registerScene({
    routeId: 'publish-product',
    title: '发布产品',
    template: `
    <section class="publish-product" data-surface-id="publish-product" data-route-id="publish-product" data-route-bound="true" data-layout-mode="composed" data-bg="page">
      <div class="navbar publish-product__navbar" data-dd-id="publish-product-navbar" data-component-slug="navbar" data-component-binding="publish-product-navbar">
        <div class="navbar__body">
          <div class="navbar__left"><button type="button" class="navbar__left-btn" aria-label="返回" data-dom-id="publish-product-back"><i class="wego-iconfont-s icon-fanhui" aria-hidden="true"></i></button></div>
          <div class="navbar__center"><span class="navbar__title">发布产品</span></div>
          <div class="navbar__right"></div>
        </div>
      </div>
      <main class="publish-product__scroll">
        <div class="publish-product__moments">
          <textarea class="publish-product__textarea" placeholder="分享你的产品故事..." data-dom-id="publish-product-textarea"></textarea>
          <div class="publish-product__image-grid" data-region="image-grid"></div>
        </div>
        <div class="publish-product__capsule-bar">
          <div class="publish-product__capsule-list">
            <button type="button" class="publish-product__capsule-item" data-dom-id="publish-product-select-tag">
              <span class="publish-product__capsule-label">标签</span>
              <span class="publish-product__capsule-value" data-value="tag">选择标签</span>
            </button>
            <button type="button" class="publish-product__capsule-item" data-dom-id="publish-product-select-source">
              <span class="publish-product__capsule-label">来源</span>
              <span class="publish-product__capsule-value" data-value="source">选择来源</span>
            </button>
            <button type="button" class="publish-product__capsule-item" data-dom-id="publish-product-select-visibility">
              <span class="publish-product__capsule-label">谁可以看</span>
              <span class="publish-product__capsule-value" data-value="visibility">选择可见性</span>
            </button>
          </div>
        </div>
        <div class="publish-product__form-group">
          <div class="publish-product__form-title">商品信息</div>
          <div class="form-group__content">
            <div class="form-body form-body--preserve-content-align" data-validate="price-required">
              <div class="form-body__label form-body__label--required"><span class="form-body__label-text">售价</span><span class="form-body__required">*</span></div>
              <div class="form-body__action">
                <div class="form-body__money">
                  <span class="form-body__money-symbol">¥</span>
                  <input class="form-body__money-input" type="text" inputmode="decimal" data-sanitize="money" placeholder="0.00" data-dom-id="publish-product-price">
                </div>
                <span class="form-body__error">请输入售价</span>
              </div>
            </div>
            <div class="form-body">
              <div class="form-body__label">货号</div>
              <div class="form-body__action">
                <input type="text" placeholder="请输入货号" data-dom-id="publish-product-item-number">
              </div>
            </div>
            <div class="form-body form-body--clickable" data-dom-id="publish-product-select-spec">
              <div class="form-body__label">规格</div>
              <div class="form-body__action">
                <div class="form-body__select">
                  <span class="form-body__select-text" data-value="specs">请选择规格</span>
                  <i class="form-body__select-arrow wego-iconfont-s icon-youjiantou16"></i>
                </div>
              </div>
            </div>
            <div class="form-body form-body--clickable" data-dom-id="publish-product-select-color">
              <div class="form-body__label">颜色</div>
              <div class="form-body__action">
                <div class="form-body__select">
                  <span class="form-body__select-text" data-value="colors">请选择颜色</span>
                  <i class="form-body__select-arrow wego-iconfont-s icon-youjiantou16"></i>
                </div>
              </div>
            </div>
            <div class="form-body">
              <div class="form-body__label">重量</div>
              <div class="form-body__action">
                <input type="text" placeholder="请输入重量" data-dom-id="publish-product-weight">
              </div>
            </div>
            <div class="form-body">
              <div class="form-body__label">库存</div>
              <div class="form-body__action">
                <input type="text" inputmode="numeric" placeholder="请输入库存" data-dom-id="publish-product-stock">
              </div>
            </div>
          </div>
        </div>
      </main>
      <div class="publish-product__bottom-bar">
        <button type="button" class="btn btn--strong btn--lg publish-product__submit-btn" data-dd-id="publish-product-button" data-component-slug="button" data-component-binding="publish-product-button" data-dom-id="publish-product-submit">发布</button>
      </div>
    </section>
  `,
    presentation: { type: 'push', transition: 'slide-left-enter, slide-right-exit', dismissAction: 'back-button', overlayLevel: 'inline', coversTabBar: true },
    init: function initPublishProduct(ctx) {
      var root = ctx.root;
      var imageGrid = root.querySelector('[data-region="image-grid"]');
      var textarea = root.querySelector('[data-dom-id="publish-product-textarea"]');
      var priceInput = root.querySelector('[data-dom-id="publish-product-price"]');
      var priceBody = priceInput.closest('.form-body');
      var priceSymbol = priceBody.querySelector('.form-body__money-symbol');

      // Check for edit mode
      editData = ctx.appState.publishProductEditData;
      if (editData) {
        formState.text = editData.text || '';
        formState.images = editData.images || [];
        formState.tag = editData.tag;
        formState.source = editData.source;
        formState.visibility = editData.visibility;
        formState.price = editData.price || '';
        formState.itemNumber = editData.itemNumber || '';
        formState.specs = editData.specs || [];
        formState.colors = editData.colors || [];
        formState.weight = editData.weight || '';
        formState.stock = editData.stock || '';
        ctx.appState.publishProductEditData = null;
      }

      // Render initial state
      function render() {
        // Textarea
        textarea.value = formState.text;

        // Image grid
        imageGrid.innerHTML = imageGridTemplate(formState.images);

        // Capsule bar
        var tagValue = root.querySelector('[data-value="tag"]');
        var sourceValue = root.querySelector('[data-value="source"]');
        var visibilityValue = root.querySelector('[data-value="visibility"]');
        var tagBtn = root.querySelector('[data-dom-id="publish-product-select-tag"]');
        var sourceBtn = root.querySelector('[data-dom-id="publish-product-select-source"]');
        var visibilityBtn = root.querySelector('[data-dom-id="publish-product-select-visibility"]');

        if (formState.tag) {
          var tagOpt = findOption(tagOptions, formState.tag);
          tagValue.textContent = tagOpt.label;
          tagBtn.classList.add('has-value');
        } else {
          tagValue.textContent = '选择标签';
          tagBtn.classList.remove('has-value');
        }

        if (formState.source) {
          var sourceOpt = findOption(sourceOptions, formState.source);
          sourceValue.textContent = sourceOpt.label;
          sourceBtn.classList.add('has-value');
        } else {
          sourceValue.textContent = '选择来源';
          sourceBtn.classList.remove('has-value');
        }

        if (formState.visibility) {
          var visOpt = findOption(visibilityOptions, formState.visibility);
          visibilityValue.textContent = visOpt.label;
          visibilityBtn.classList.add('has-value');
        } else {
          visibilityValue.textContent = '选择可见性';
          visibilityBtn.classList.remove('has-value');
        }

        // Form fields
        priceInput.value = formState.price;
        priceSymbol.classList.toggle('has-value', formState.price.length > 0);
        root.querySelector('[data-dom-id="publish-product-item-number"]').value = formState.itemNumber;
        root.querySelector('[data-dom-id="publish-product-weight"]').value = formState.weight;
        root.querySelector('[data-dom-id="publish-product-stock"]').value = formState.stock;

        // Specs and colors
        var specsText = root.querySelector('[data-value="specs"]');
        var colorsText = root.querySelector('[data-value="colors"]');
        if (formState.specs.length > 0) {
          var specLabels = formState.specs.map(function(id) { return findOption(specOptions, id).label; }).join(', ');
          specsText.textContent = specLabels;
          specsText.classList.add('has-value');
        } else {
          specsText.textContent = '请选择规格';
          specsText.classList.remove('has-value');
        }

        if (formState.colors.length > 0) {
          var colorLabels = formState.colors.map(function(id) { return findOption(colorOptions, id).label; }).join(', ');
          colorsText.textContent = colorLabels;
          colorsText.classList.add('has-value');
        } else {
          colorsText.textContent = '请选择颜色';
          colorsText.classList.remove('has-value');
        }
      }

      // Bind events
      root.querySelector('[data-dom-id="publish-product-back"]').addEventListener('click', function() {
        ctx.back();
      });

      textarea.addEventListener('input', function() {
        formState.text = textarea.value;
      });

      priceInput.addEventListener('input', function() {
        formState.price = priceInput.value;
        priceSymbol.classList.toggle('has-value', formState.price.length > 0);
        // Clear error on input
        priceBody.classList.remove('form-body--error');
      });

      root.querySelector('[data-dom-id="publish-product-item-number"]').addEventListener('input', function(e) {
        formState.itemNumber = e.target.value;
      });

      root.querySelector('[data-dom-id="publish-product-weight"]').addEventListener('input', function(e) {
        formState.weight = e.target.value;
      });

      root.querySelector('[data-dom-id="publish-product-stock"]').addEventListener('input', function(e) {
        formState.stock = e.target.value.replace(/\D/g, '');
        e.target.value = formState.stock;
      });

      // Image grid delegation
      imageGrid.addEventListener('click', function(e) {
        var addBtn = e.target.closest('[data-dom-id="publish-product-add-image"]');
        if (addBtn) {
          ctx.toast('图片选择能力本期暂未开放');
          return;
        }
        var imageItem = e.target.closest('[data-image-index]');
        if (imageItem) {
          var index = parseInt(imageItem.dataset.imageIndex, 10);
          formState.images.splice(index, 1);
          render();
        }
      });

      // Capsule bar actions
      root.querySelector('[data-dom-id="publish-product-select-tag"]').addEventListener('click', function() {
        ctx.openSheet(actionsheetTemplate('选择标签', tagOptions, formState.tag, 'data-select-tag'), {
          label: '选择标签',
          init: function(sheet) {
            sheet.root.querySelectorAll('[data-select-tag]').forEach(function(item) {
              item.addEventListener('click', function() {
                formState.tag = item.getAttribute('data-select-tag');
                sheet.close();
                render();
              });
            });
            var cancelBtn = sheet.root.querySelector('[data-close-sheet]');
            if (cancelBtn) {
              cancelBtn.addEventListener('click', function() { sheet.close(); });
            }
            sheet.root.addEventListener('click', function(event) {
              if (event.target === sheet.root) sheet.close();
            });
          }
        });
      });

      root.querySelector('[data-dom-id="publish-product-select-source"]').addEventListener('click', function() {
        ctx.openSheet(actionsheetTemplate('选择来源', sourceOptions, formState.source, 'data-select-source'), {
          label: '选择来源',
          init: function(sheet) {
            sheet.root.querySelectorAll('[data-select-source]').forEach(function(item) {
              item.addEventListener('click', function() {
                formState.source = item.getAttribute('data-select-source');
                sheet.close();
                render();
              });
            });
            var cancelBtn = sheet.root.querySelector('[data-close-sheet]');
            if (cancelBtn) {
              cancelBtn.addEventListener('click', function() { sheet.close(); });
            }
            sheet.root.addEventListener('click', function(event) {
              if (event.target === sheet.root) sheet.close();
            });
          }
        });
      });

      root.querySelector('[data-dom-id="publish-product-select-visibility"]').addEventListener('click', function() {
        ctx.openSheet(actionsheetTemplate('谁可以看', visibilityOptions, formState.visibility, 'data-select-visibility'), {
          label: '谁可以看',
          init: function(sheet) {
            sheet.root.querySelectorAll('[data-select-visibility]').forEach(function(item) {
              item.addEventListener('click', function() {
                formState.visibility = item.getAttribute('data-select-visibility');
                sheet.close();
                render();
              });
            });
            var cancelBtn = sheet.root.querySelector('[data-close-sheet]');
            if (cancelBtn) {
              cancelBtn.addEventListener('click', function() { sheet.close(); });
            }
            sheet.root.addEventListener('click', function(event) {
              if (event.target === sheet.root) sheet.close();
            });
          }
        });
      });

      // Form actions - specs (multi-select)
      root.querySelector('[data-dom-id="publish-product-select-spec"]').addEventListener('click', function() {
        ctx.openSheet(multiSelectActionsheetTemplate('选择规格', specOptions, formState.specs, 'data-select-spec'), {
          label: '选择规格',
          init: function(sheet) {
            sheet.root.querySelectorAll('[data-select-spec]').forEach(function(item) {
              item.addEventListener('click', function() {
                var specId = item.getAttribute('data-select-spec');
                var index = formState.specs.indexOf(specId);
                if (index === -1) {
                  formState.specs.push(specId);
                  item.classList.add('actionsheet__item--selected');
                } else {
                  formState.specs.splice(index, 1);
                  item.classList.remove('actionsheet__item--selected');
                }
                render();
              });
            });
            var cancelBtn = sheet.root.querySelector('[data-close-sheet]');
            if (cancelBtn) {
              cancelBtn.addEventListener('click', function() { sheet.close(); });
            }
            sheet.root.addEventListener('click', function(event) {
              if (event.target === sheet.root) sheet.close();
            });
          }
        });
      });

      // Form actions - colors (multi-select)
      root.querySelector('[data-dom-id="publish-product-select-color"]').addEventListener('click', function() {
        ctx.openSheet(multiSelectActionsheetTemplate('选择颜色', colorOptions, formState.colors, 'data-select-color'), {
          label: '选择颜色',
          init: function(sheet) {
            sheet.root.querySelectorAll('[data-select-color]').forEach(function(item) {
              item.addEventListener('click', function() {
                var colorId = item.getAttribute('data-select-color');
                var index = formState.colors.indexOf(colorId);
                if (index === -1) {
                  formState.colors.push(colorId);
                  item.classList.add('actionsheet__item--selected');
                } else {
                  formState.colors.splice(index, 1);
                  item.classList.remove('actionsheet__item--selected');
                }
                render();
              });
            });
            var cancelBtn = sheet.root.querySelector('[data-close-sheet]');
            if (cancelBtn) {
              cancelBtn.addEventListener('click', function() { sheet.close(); });
            }
            sheet.root.addEventListener('click', function(event) {
              if (event.target === sheet.root) sheet.close();
            });
          }
        });
      });

      // Submit
      root.querySelector('[data-dom-id="publish-product-submit"]').addEventListener('click', function() {
        // Validation
        var hasError = false;

        // Check moments area (text or images)
        if (!formState.text.trim() && formState.images.length === 0) {
          ctx.toast('请输入文案或添加图片');
          hasError = true;
          return;
        }

        // Check price
        if (!formState.price.trim()) {
          priceBody.classList.add('form-body--error');
          hasError = true;
          return;
        }

        if (hasError) return;

        // Publish success
        ctx.state['publish-product-publishing'] = true;
        ctx.toast('发布成功');

        // Add to feed if appState exists
        if (ctx.appState.dynamicFeedList) {
          var newDynamic = {
            dynamic_id: 'dynamic-' + Date.now(),
            publisher_id: 'self',
            content_type: 'product',
            text_content: formState.text,
            media_list: formState.images.map(function(img, i) {
              return { media_id: 'media-' + i, media_type: 'image', poster_or_src: img };
            }),
            published_at: '刚刚',
            tags: formState.tag ? [formState.tag] : [],
            source: formState.source,
            visibility: formState.visibility,
            product: {
              price: formState.price,
              item_number: formState.itemNumber,
              specs: formState.specs,
              colors: formState.colors,
              weight: formState.weight,
              stock: formState.stock
            }
          };
          ctx.appState.dynamicFeedList.unshift(newDynamic);
        }

        ctx.state['publish-product-published'] = true;
        setTimeout(function() {
          ctx.back();
        }, 1000);
      });

      // Initial render
      render();
      ctx.state['publish-product-initial'] = true;
    }
  });
})();
