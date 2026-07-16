/* wego-design-contract:
{
  "surface_id": "app-center",
  "route_id": "app-center",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "push",
    "transition": "push",
    "dismissAction": "back",
    "overlayLevel": "inline",
    "coversTabBar": true,
    "source": "library-consumption.json#/appRuntime/presentationTypes"
  },
  "prompt_contract": {
    "design_system_version": 413,
    "token_bindings": [
      { "selector": ".app-center-page", "content_role": "页面边距", "css_property": "padding-inline", "token": "var(--layout-page-margin-m0)" },
      { "selector": ".app-center-page", "content_role": "页面背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".app-center-page", "content_role": "页面默认文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".app-center-page", "content_role": "页面基础字体", "css_property": "font-family", "token": "var(--body-md-font-family)" },
      { "selector": ".app-center-page__tabs", "content_role": "标签栏背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".app-center-page__tabs", "content_role": "标签栏与内容间距", "css_property": "margin-bottom", "token": "var(--spacer-8)" },
      { "selector": ".app-center-page__body", "content_role": "内容区横向边距", "css_property": "padding-inline", "token": "var(--layout-page-margin-m8)" },
      { "selector": ".app-center-page__body", "content_role": "内容区底部安全区", "css_property": "padding-bottom", "token": "var(--spacer-72)" },
      { "selector": ".app-center-page__body", "content_role": "内容区分组间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".app-center-page__category-content", "content_role": "卡片内容节奏", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".app-center-page__category-content", "content_role": "卡片内容留白", "css_property": "padding", "token": "var(--spacer-12)" },
      { "selector": ".app-center-page__category-title", "content_role": "分类标题文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".app-center-page__category-title", "content_role": "分类标题层级", "css_property": "font-size", "token": "var(--heading-xs-font-size)" },
      { "selector": ".app-center-page__category-title", "content_role": "分类标题层级", "css_property": "font-weight", "token": "var(--heading-xs-font-weight)" },
      { "selector": ".app-center-page__category-title", "content_role": "分类标题层级", "css_property": "line-height", "token": "var(--heading-xs-line-height)" },
      { "selector": ".app-center-page__app-grid", "content_role": "应用入口间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".app-center-page__app-entry", "content_role": "应用入口圆角", "css_property": "border-radius", "token": "var(--radius-8)" },
      { "selector": ".app-center-page__app-entry", "content_role": "应用图标与名称间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".app-center-page__app-entry", "content_role": "应用入口热区", "css_property": "padding-block", "token": "var(--spacer-8)" },
      { "selector": ".app-center-page__app-entry:active", "content_role": "应用入口按压圆角", "css_property": "border-radius", "token": "var(--radius-8)" },
      { "selector": ".app-center-page__app-entry:active", "content_role": "应用入口按压反馈", "css_property": "background", "token": "var(--bg-state-pressed)" },
      { "selector": ".app-center-page__app-placeholder", "content_role": "占位元素间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".app-center-page__app-placeholder", "content_role": "占位元素热区", "css_property": "padding-block", "token": "var(--spacer-8)" },
      { "selector": ".app-center-page__app-label", "content_role": "应用名称", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".app-center-page__app-label", "content_role": "应用名称", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".app-center-page__app-label", "content_role": "应用名称", "css_property": "line-height", "token": "var(--body-sm-line-height)" }
    ],
    "component_bindings": [
      {
        "binding_id": "app-center-navbar",
        "slug": "navbar",
        "reason": "承载应用中心二级页面的返回与页面标题",
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
        "binding_id": "app-center-tabs",
        "slug": "tabs",
        "reason": "承载分类快捷定位切换",
        "variant_dimensions": {
          "size": "mini",
          "layout": "scroll",
          "icon": "none",
          "state": "default"
        }
      },
      {
        "binding_id": "category-card",
        "slug": "card",
        "reason": "承载每个分类的应用网格内容分组",
        "variant_dimensions": {
          "base": "auto",
          "surface": "surface"
        }
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "应用中心是二级页面，使用 tabs 做分类切换，card 做内容分组",
      "page_edge_mode": "M0",
      "mutable_regions": [
        ".app-center-page__body"
      ]
    },
    "interaction_contract": [
      { "dom_id": "app-center-back", "target": "navigation:back" },
      { "dom_id": "app-center-body", "target": "feedback:toast" }
    ],
    "state_contract": [
      {
        "state_id": "app-center-default",
        "initial": true,
        "trigger": "进入应用中心页面",
        "visible_result": "展示全部应用按业务场景分类，顶部 tabs 可快速切换分类",
        "fallback": "保持当前分类展示和演示数据",
        "persistence": "memory"
      },
      {
        "state_id": "app-entry-feedback",
        "initial": false,
        "trigger": "选择应用入口",
        "visible_result": "显示与当前入口对应的瞬时反馈",
        "fallback": "保留当前页面",
        "persistence": "memory"
      }
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-16T02:50:00.000Z",
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

var appCenterCategories = [
  {
    id: 'store-manage',
    name: '店铺管理',
    apps: [
      { name: '我的小店', asset: '我的小店' },
      { name: '店铺装修', asset: '店铺装修' },
      { name: '商品管理', asset: '商品管理' },
      { name: '商品详情装修', asset: '商品详情装修' },
      { name: '上下架', asset: '上下架' },
      { name: '一键换肤', asset: '一键换肤' },
      { name: '专享小程序', asset: '专享小程序' },
      { name: '微信小店', asset: '微信小店' }
    ]
  },
  {
    id: 'product-ops',
    name: '商品运营',
    apps: [
      { name: '一键开团', asset: '一键开团' },
      { name: '发布', asset: '发布' },
      { name: '快捷发布', asset: '快捷发布' },
      { name: '批量发布', asset: '批量发布' },
      { name: '一键搬家', asset: '一键搬家' },
      { name: '铺货管家', asset: '铺货管家' },
      { name: '整理相册', asset: '整理相册' },
      { name: '批量编辑', asset: '批量编辑' },
      { name: '批量删除', asset: '批量删除' },
      { name: '批量抓图', asset: '批量抓图' },
      { name: '批量转发', asset: '批量转发' },
      { name: '批量选择', asset: '批量选择' },
      { name: '文本导入', asset: '文本导入' },
      { name: 'P图', asset: 'P图' }
    ]
  },
  {
    id: 'marketing',
    name: '营销推广',
    apps: [
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
      { name: '一键复制好友相册', asset: '一键复制好友相册' }
    ]
  },
  {
    id: 'traffic',
    name: '引流获客',
    apps: [
      { name: '微信群发', asset: '微信群发助手' },
      { name: '推送上新', asset: '推送上新（群发消息）' },
      { name: '公众号', asset: '公众号' },
      { name: '企业微信', asset: '企业微信' },
      { name: '视频号', asset: '视频号' },
      { name: '抖音引流', asset: '抖音引流' },
      { name: '公域引流', asset: '公域引流' },
      { name: '私域直播', asset: '私域直播' },
      { name: '直播开单', asset: '直播开单' },
      { name: '私域键盘', asset: '私域键盘' }
    ]
  },
  {
    id: 'customer',
    name: '客户管理',
    apps: [
      { name: '客户管理', asset: '客户管理' },
      { name: '创建客户', asset: '创建客户' },
      { name: '客户审核', asset: '客户审核' },
      { name: '客户标签', asset: '客户标签' },
      { name: '会员管理', asset: '粉丝会员卡' },
      { name: '访客足迹', asset: '访客足迹' },
      { name: '标签管理', asset: '标签管理' },
      { name: '积分商城', asset: '积分商城' }
    ]
  },
  {
    id: 'order-trade',
    name: '订单交易',
    apps: [
      { name: '收款码', asset: '收款码' },
      { name: '查订单-查快递', asset: '查订单-查快递' },
      { name: '售后', asset: '售后' },
      { name: '销售单', asset: '销售单' },
      { name: '销售报表', asset: '销售报表' }
    ]
  },
  {
    id: 'stock-supply',
    name: '库存采购',
    apps: [
      { name: '库存管理', asset: '库存管理' },
      { name: '备货', asset: '备货' },
      { name: '配货管理', asset: '配货管理' },
      { name: '采购单', asset: '采购单' },
      { name: '供应商', asset: '供应商' },
      { name: '转图代理', asset: '转图代理' },
      { name: '查件码', asset: '查件码' }
    ]
  },
  {
    id: 'team-tools',
    name: '团队工具',
    apps: [
      { name: '团队管理', asset: '团队管理' },
      { name: '员工业绩', asset: '员工业绩' },
      { name: '批量导出', asset: '批量导出' },
      { name: '导出记录', asset: '导出记录' },
      { name: '规则中心', asset: '规则中心' }
    ]
  },
  {
    id: 'price-finance',
    name: '价格财务',
    apps: [
      { name: '价格管理', asset: '价格管理' },
      { name: 'ERP', asset: 'ERP' },
      { name: '相册网址', asset: '相册网址' }
    ]
  },
  {
    id: 'hardware-learn',
    name: '硬件学习',
    apps: [
      { name: '硬件商城', asset: '硬件商城(智能硬件)' },
      { name: '相册学堂', asset: '相册学堂' },
      { name: 'PC(电脑版)', asset: 'PC版' }
    ]
  }
];

function createAppCenterEntry(app) {
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'app-center-page__app-entry';
  button.dataset.appName = app.name;
  button.setAttribute('aria-label', '打开' + app.name);

  var icon = document.createElement('img');
  icon.className = 'app-center-page__app-icon';
  icon.src = './lib/assets/icons/app-center/' + app.asset + '.svg';
  icon.alt = '';

  var label = document.createElement('span');
  label.className = 'app-center-page__app-label';
  label.textContent = app.name;

  button.append(icon, label);
  return button;
}

function buildAppCenterTabs(categories) {
  var scroll = document.createElement('div');
  scroll.className = 'wg-tabs__scroll';

  categories.forEach(function(category, index) {
    var item = document.createElement('button');
    item.type = 'button';
    item.className = 'wg-tabs__item';
    if (index === 0) item.classList.add('wg-tabs__item--first');
    item.setAttribute('role', 'tab');
    item.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    item.dataset.categoryId = category.id;

    var content = document.createElement('span');
    content.className = 'wg-tabs__content';
    var label = document.createElement('span');
    label.className = 'wg-tabs__label';
    label.textContent = category.name;
    content.appendChild(label);
    item.appendChild(content);
    scroll.appendChild(item);
  });

  var indicator = document.createElement('span');
  indicator.className = 'wg-tabs__active-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  scroll.appendChild(indicator);

  return scroll;
}

function createAppGridPlaceholder(className) {
  var placeholder = document.createElement('div');
  placeholder.className = className;
  placeholder.setAttribute('aria-hidden', 'true');
  return placeholder;
}

function fillAppGridPlaceholders(grid, placeholderClassName) {
  var entries = grid.querySelectorAll('.app-center-page__app-entry');
  var columns = Math.max(1, Math.floor(grid.getBoundingClientRect().width / 80));
  var placeholdersNeeded = entries.length % columns === 0 ? 0 : columns - (entries.length % columns);

  var existingPlaceholders = grid.querySelectorAll('.' + placeholderClassName.split(' ').join('.'));
  existingPlaceholders.forEach(function(p) { p.remove(); });

  grid.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';

  for (var i = 0; i < placeholdersNeeded; i += 1) {
    grid.appendChild(createAppGridPlaceholder(placeholderClassName));
  }
}

function buildAppCenterCategory(category) {
  var section = document.createElement('section');
  section.className = 'card card--surface app-center-page__category';
  section.dataset.categoryId = category.id;

  var content = document.createElement('div');
  content.className = 'card__content app-center-page__category-content';

  var title = document.createElement('h2');
  title.className = 'app-center-page__category-title';
  title.textContent = category.name;

  var grid = document.createElement('div');
  grid.className = 'app-center-page__app-grid';

  category.apps.forEach(function(app) {
    grid.appendChild(createAppCenterEntry(app));
  });

  content.append(title, grid);
  section.appendChild(content);
  return section;
}

function updateTabsIndicator(tabs) {
  var scroll = tabs.querySelector('.wg-tabs__scroll');
  var indicator = tabs.querySelector('.wg-tabs__active-indicator');
  var selected = tabs.querySelector('.wg-tabs__item[aria-selected="true"] .wg-tabs__content');
  if (!scroll || !indicator || !selected) return;

  var scrollRect = scroll.getBoundingClientRect();
  var selectedRect = selected.getBoundingClientRect();
  var x = selectedRect.left - scrollRect.left + scroll.scrollLeft;

  indicator.style.setProperty('--_tabs-indicator-x', x + 'px');
  indicator.style.setProperty('--_tabs-indicator-width', selectedRect.width + 'px');
}

const appCenterTemplate = `
  <section class="app-center-page" data-surface-id="app-center" data-route-id="app-center" data-route-bound="true" data-layout-mode="composed" data-page-edge-mode="M0" data-bg="page">
    <div class="navbar" data-dd-id="app-center-navbar" data-component-slug="navbar" data-component-binding="app-center-navbar">
      <div class="navbar__body">
        <div class="navbar__left"><button type="button" class="navbar__left-btn" data-dom-id="app-center-back" aria-label="返回"><i class="wego-iconfont-s icon-fanhui"></i></button></div>
        <div class="navbar__center"><span class="navbar__title">应用中心</span></div>
        <div class="navbar__right"></div>
      </div>
    </div>
    <div class="wg-tabs wg-tabs--mini wg-tabs--scroll app-center-page__tabs" data-dd-id="app-center-tabs" data-component-slug="tabs" data-component-binding="app-center-tabs" role="tablist">
      <div class="wg-tabs__scroll">
        <button class="wg-tabs__item wg-tabs__item--first" role="tab" aria-selected="true" type="button"><span class="wg-tabs__content"><span class="wg-tabs__label">店铺管理</span></span></button>
        <span class="wg-tabs__active-indicator" aria-hidden="true"></span>
      </div>
    </div>
    <div class="app-center-page__body" data-dom-id="app-center-body">
      <section class="card card--surface app-center-page__category" data-dd-id="category-card" data-component-slug="card" data-component-binding="category-card" data-category-id="store-manage">
        <div class="card__content app-center-page__category-content">
          <h2 class="app-center-page__category-title">店铺管理</h2>
          <div class="app-center-page__app-grid"></div>
        </div>
      </section>
    </div>
  </section>
`;

window.WegoApp.registerScene({
  routeId: 'app-center',
  title: '应用中心',
  template: appCenterTemplate,
  presentation: {
    type: 'push',
    transition: 'push',
    dismissAction: 'back',
    overlayLevel: 'inline',
    coversTabBar: true
  },
  init: function initAppCenterScene(ctx) {
    var backButton = ctx.root.querySelector('[data-dom-id="app-center-back"]');
    var tabsContainer = ctx.root.querySelector('.app-center-page__tabs');
    var tabsScroll = tabsContainer.querySelector('.wg-tabs__scroll');
    var bodyContainer = ctx.root.querySelector('[data-dom-id="app-center-body"]');

    // 绑定返回按钮
    backButton.addEventListener('click', function() {
      ctx.back();
    });

    // 清空模板预写的 tab item 和 indicator，重建完整 tabs
    tabsScroll.innerHTML = '';
    appCenterCategories.forEach(function(category, index) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'wg-tabs__item';
      if (index === 0) item.classList.add('wg-tabs__item--first');
      item.setAttribute('role', 'tab');
      item.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      item.dataset.categoryId = category.id;

      var content = document.createElement('span');
      content.className = 'wg-tabs__content';
      var label = document.createElement('span');
      label.className = 'wg-tabs__label';
      label.textContent = category.name;
      content.appendChild(label);
      item.appendChild(content);
      tabsScroll.appendChild(item);
    });
    var indicator = document.createElement('span');
    indicator.className = 'wg-tabs__active-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    tabsScroll.appendChild(indicator);

    // 清空模板预写的第一个 card，重建全部分类
    bodyContainer.innerHTML = '';
    appCenterCategories.forEach(function(category) {
      bodyContainer.appendChild(buildAppCenterCategory(category));
    });

    // 统一补齐网格空白占位，保持每行列宽一致
    var appGrids = bodyContainer.querySelectorAll('.app-center-page__app-grid');
    function refillAppCenterPlaceholders() {
      appGrids.forEach(function(grid) {
        fillAppGridPlaceholders(grid, 'app-center-page__app-placeholder');
      });
    }
    requestAnimationFrame(refillAppCenterPlaceholders);
    if (typeof ResizeObserver === 'function') {
      var gridObserver = new ResizeObserver(refillAppCenterPlaceholders);
      appGrids.forEach(function(grid) { gridObserver.observe(grid); });
    } else {
      window.addEventListener('resize', refillAppCenterPlaceholders);
    }

    // 初始化 tabs indicator
    requestAnimationFrame(function() {
      updateTabsIndicator(tabsContainer);
    });

    // tabs 切换交互
    var tabItems = tabsScroll.querySelectorAll('.wg-tabs__item');
    tabsContainer.addEventListener('click', function(event) {
      var item = event.target.closest('.wg-tabs__item');
      if (!item) return;

      var categoryId = item.dataset.categoryId;
      var targetSection = bodyContainer.querySelector('[data-category-id="' + categoryId + '"]');
      if (!targetSection) return;

      // 更新选中状态
      tabItems.forEach(function(t) { t.setAttribute('aria-selected', 'false'); });
      item.setAttribute('aria-selected', 'true');

      // 更新 indicator 并滚动 tab 居中
      requestAnimationFrame(function() {
        updateTabsIndicator(tabsContainer);
        var itemRect = item.getBoundingClientRect();
        var scrollRect = tabsScroll.getBoundingClientRect();
        var targetScrollLeft = tabsScroll.scrollLeft + (itemRect.left - scrollRect.left) - (scrollRect.width - itemRect.width) / 2;
        tabsScroll.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
      });

      // 滚动到对应分类
      var bodyRect = bodyContainer.getBoundingClientRect();
      var sectionRect = targetSection.getBoundingClientRect();
      var offset = sectionRect.top - bodyRect.top + bodyContainer.scrollTop - 8;
      bodyContainer.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
    });

    // 应用入口点击交互
    bodyContainer.addEventListener('click', function(event) {
      var entry = event.target.closest('[data-app-name]');
      if (!entry) return;
      ctx.toast(entry.dataset.appName + '入口已打开');
    });
  }
});
