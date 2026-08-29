const appCenterTemplate = `
  <section class="app-center-page" data-surface-id="app-center" data-route-id="app-center" data-layout-mode="composed" data-bg="page">
    <div class="navbar app-center-page__navbar" data-component-slug="navbar">
      <div class="navbar__body">
        <div class="navbar__left"><button type="button" class="navbar__left-btn" data-dom-id="app-center-back" aria-label="返回"><i class="wego-iconfont-s icon-fanhui"></i></button></div>
        <div class="navbar__center"><span class="navbar__title">全部应用</span></div>
        <div class="navbar__right"></div>
      </div>
    </div>
    <div class="app-center-page__body" data-dom-id="app-center-body">
      <div class="sticky-region app-center-page__search-sticky" data-component-slug="sticky-region" data-edge="top" data-visibility="direction-reveal" data-state="visible">
        <div class="sticky-region__motion">
          <div class="sticky-region__inner">
            <div class="app-center-page__search">
              <div class="searchbox searchbox--md searchbox--white" data-component-slug="search" data-dom-id="app-center-search">
                <span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>
                <div class="searchbox__input">
                  <input class="searchbox__field" type="search" placeholder="搜索应用" aria-label="搜索应用" />
                </div>
                <div class="searchbox__actions"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="sticky-region app-center-page__tabs-sticky" data-component-slug="sticky-region" data-edge="top" data-visibility="always" data-state="visible">
        <div class="sticky-region__motion">
          <div class="sticky-region__inner">
            <div class="wg-tabs wg-tabs--mini wg-tabs--scroll app-center-page__tabs" data-component-slug="tabs" data-dom-id="app-center-tabs" role="tablist">
              <div class="wg-tabs__scroll app-center-page__tabs-scroll">
                <button class="wg-tabs__item wg-tabs__item--first" type="button" role="tab" aria-selected="true" data-category-id="store-manage">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">店铺管理</span></span>
                </button>
                <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-category-id="product-ops">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">商品运营</span></span>
                </button>
                <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-category-id="marketing">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">营销推广</span></span>
                </button>
                <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-category-id="traffic">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">引流获客</span></span>
                </button>
                <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-category-id="customer">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">客户管理</span></span>
                </button>
                <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-category-id="order-trade">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">订单交易</span></span>
                </button>
                <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-category-id="stock-supply">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">库存采购</span></span>
                </button>
                <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-category-id="team-tools">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">团队工具</span></span>
                </button>
                <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-category-id="price-finance">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">价格财务</span></span>
                </button>
                <button class="wg-tabs__item" type="button" role="tab" aria-selected="false" data-category-id="hardware-learn">
                  <span class="wg-tabs__content"><span class="wg-tabs__label">硬件学习</span></span>
                </button>
                <span class="wg-tabs__active-indicator" aria-hidden="true"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="app-center-page__content-group" data-region="categories"></div>
      <div class="app-center-page__empty">
        <div class="result" data-component-slug="result" role="group" aria-label="无搜索结果">
          <div class="result__icon" aria-hidden="true"><i class="wego-iconfont-s icon-tanhao-mian"></i></div>
          <div class="result__title">没有找到相关应用</div>
        </div>
      </div>
    </div>
  </section>
  `;

(function () {
  // 应用中心分类与应用数据：沿用既有应用中心清单，图标取自 lib/assets/icons/app-center/
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
        { name: '销售单', asset: '销售单', routeId: 'workspace-order-create' },
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

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\x22/g, '&quot;')
      .replace(/\x27/g, '&#39;');
  }

  function appIconPath(asset) {
    return './lib/assets/icons/app-center/' + encodeURIComponent(asset) + '.svg';
  }

  function appEntryMarkup(app) {
    var routeAttr = app.routeId ? ' data-app-route-id="' + esc(app.routeId) + '"' : '';
    return ''
      + '<button type="button" class="app-center-page__app-entry" data-app-name="' + esc(app.name) + '"' + routeAttr + '>'
      +   '<img class="app-center-page__app-icon" src="' + appIconPath(app.asset) + '" alt="" />'
      +   '<span class="app-center-page__app-label">' + esc(app.name) + '</span>'
      + '</button>';
  }

  function appGridMarkup(apps) {
    var grid = document.createElement('div');
    grid.className = 'app-center-page__app-grid';
    apps.forEach(function (app) { grid.insertAdjacentHTML('beforeend', appEntryMarkup(app)); });
    return grid;
  }

  function categorySectionMarkup(category) {
    var section = document.createElement('section');
    section.className = 'card card--surface app-center-page__category';
    section.setAttribute('data-component-slug', 'card');
    section.dataset.categoryId = category.id;
    var content = document.createElement('div');
    content.className = 'card__content app-center-page__category-content';
    var title = document.createElement('h2');
    title.className = 'app-center-page__category-title';
    title.textContent = category.name;
    content.appendChild(title);
    content.appendChild(appGridMarkup(category.apps));
    section.appendChild(content);
    return section;
  }

  window.WegoApp.registerScene({
    routeId: 'app-center',
    title: '全部应用',
    presentation: { type: 'push', transition: 'slide-left', coversTabBar: true },
    template: appCenterTemplate,
    init: function (ctx) {
      var root = ctx.root;
      var backButton = root.querySelector('[data-dom-id="app-center-back"]');
      var tabsContainer = root.querySelector('[data-dom-id="app-center-tabs"]');
      var tabsScroll = tabsContainer.querySelector('.wg-tabs__scroll');
      var bodyContainer = root.querySelector('[data-dom-id="app-center-body"]');
      var contentGroup = root.querySelector('[data-region="categories"]');
      var searchBox = root.querySelector('[data-dom-id="app-center-search"]');
      var searchField = root.querySelector('[data-dom-id="app-center-search"] .searchbox__field');

      // 返回
      backButton.addEventListener('click', function () { ctx.back(); });

      // 构建全部分类
      appCenterCategories.forEach(function (category) {
        contentGroup.appendChild(categorySectionMarkup(category));
      });

      // tabs 运行时
      var tabsHandle = null;
      try {
        tabsHandle = ctx.bindTabs({ root: root });
      } catch (e) {
        // 运行时缺失时降级为手动 indicator 更新
        tabsHandle = null;
      }
      ctx.onDestroy(function () {
        if (tabsHandle && typeof tabsHandle.destroy === 'function') tabsHandle.destroy();
      });

      function updateIndicator() {
        if (tabsHandle && typeof tabsHandle.update === 'function') tabsHandle.update();
      }

      // tabs 激活：统一更新 aria-selected 与指示条
      var tabItems = Array.prototype.slice.call(tabsScroll.querySelectorAll('.wg-tabs__item'));
      function setActiveTab(categoryId) {
        var item = null;
        for (var i = 0; i < tabItems.length; i++) {
          if (tabItems[i].dataset.categoryId === categoryId) { item = tabItems[i]; break; }
        }
        if (!item) return;
        tabItems.forEach(function (t) { t.setAttribute('aria-selected', String(t === item)); });
        updateIndicator();
      }

      // tabs 点击：定位分类（对齐到吸顶 tabs 底部，避免目标被遮挡）
      function smoothScrollBodyTo(targetScrollTop) {
        var start = bodyContainer.scrollTop;
        var diff = targetScrollTop - start;
        if (Math.abs(diff) < 1) return;
        var duration = Math.min(320, 160 + Math.abs(diff) * 0.12);
        var startTime = null;
        function step(now) {
          if (startTime === null) startTime = now;
          var p = Math.min((now - startTime) / duration, 1);
          var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          bodyContainer.scrollTop = start + diff * eased;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
      tabsContainer.addEventListener('click', function (event) {
        var item = event.target.closest('.wg-tabs__item');
        if (!item) return;
        var categoryId = item.dataset.categoryId;
        var targetSection = contentGroup.querySelector('[data-category-id="' + esc(categoryId) + '"]');
        if (!targetSection) return;
        setActiveTab(categoryId);
        var sectionTop = targetSection.getBoundingClientRect().top;
        var tabsBottom = tabsSticky.getBoundingClientRect().bottom;
        smoothScrollBodyTo(bodyContainer.scrollTop + (sectionTop - tabsBottom));
      });

      // 滚动布局：搜索栏上滑隐藏/下滑显示、tabs 吸附顶部（公共 sticky-region 运行时接管）
      var tabsSticky = root.querySelector('.app-center-page__tabs-sticky');
      try {
        ctx.bindScrollLayout({
          scrollRoot: '.app-center-page__body',
          regions: [
            { selector: '.app-center-page__search-sticky', policy: 'direction-reveal', edge: 'top', essential: false, threshold: 8 },
            { selector: '.app-center-page__tabs-sticky', policy: 'always', edge: 'top', essential: true }
          ]
        });
      } catch (e) {
        // 滚动布局运行时缺失时降级：tabs 保持常规吸顶，搜索栏不参与滚动收展
      }

      // tabs 滚动联动：页面滚动时实时高亮当前所在分类
      var BOUNDARY_TOLERANCE = 24;
      var spyTimer = null;
      function updateActiveTabFromScroll() {
        var sections = contentGroup.querySelectorAll('.app-center-page__category');
        if (!sections.length) return;
        var bodyRect = bodyContainer.getBoundingClientRect();
        var boundary = tabsSticky.getBoundingClientRect().bottom - bodyRect.top + BOUNDARY_TOLERANCE;
        var atBottom = bodyContainer.scrollTop + bodyContainer.clientHeight >= bodyContainer.scrollHeight - 1;
        var activeId = null;
        if (atBottom) {
          var last = sections[sections.length - 1];
          activeId = last.getAttribute('data-category-id');
        } else {
          for (var i = 0; i < sections.length; i++) {
            if (sections[i].hidden) continue;
            if (sections[i].getBoundingClientRect().top - bodyRect.top <= boundary) {
              activeId = sections[i].getAttribute('data-category-id');
            } else {
              break;
            }
          }
        }
        if (activeId) setActiveTab(activeId);
      }
      bodyContainer.addEventListener('scroll', function () {
        if (spyTimer) clearTimeout(spyTimer);
        spyTimer = setTimeout(updateActiveTabFromScroll, 80);
      }, { passive: true });

      // 搜索：实时过滤 + clear 按钮显隐（search 运行时未在宿主加载，场景自实现 clear 交互）
      var searchClear = searchBox.querySelector('.searchbox__actions') || null;
      function renderClear() {
        if (!searchClear) return;
        var value = (searchField.value || '').trim();
        var existing = searchClear.querySelector('.searchbox__clear');
        if (value) {
          if (!existing) {
            existing = document.createElement('button');
            existing.className = 'searchbox__action searchbox__clear wego-iconfont-s icon-yuancha-mian';
            existing.type = 'button';
            existing.setAttribute('aria-label', '清除');
            existing.addEventListener('click', function () {
              searchField.value = '';
              renderClear();
              applyFilter();
              searchField.focus();
            });
            searchClear.insertBefore(existing, searchClear.firstChild);
          }
        } else if (existing) {
          existing.remove();
        }
      }

      function currentQuery() {
        return (searchField.value || '').trim().toLowerCase();
      }

      function applyFilter() {
        var query = currentQuery();
        renderClear();
        var totalVisible = 0;
        Array.prototype.forEach.call(contentGroup.querySelectorAll('.app-center-page__category'), function (section) {
          if (!query) {
            section.hidden = false;
            totalVisible += 1;
            return;
          }
          var entries = section.querySelectorAll('.app-center-page__app-entry');
          var visibleCount = 0;
          entries.forEach(function (entry) {
            var matched = (entry.dataset.appName || '').toLowerCase().indexOf(query) !== -1;
            entry.hidden = !matched;
            if (matched) visibleCount += 1;
          });
          section.hidden = visibleCount === 0;
          if (!section.hidden) totalVisible += 1;
        });
        root.classList.toggle('app-center-page--empty', totalVisible === 0);
        updateActiveTabFromScroll();
      }

      searchBox.addEventListener('input', applyFilter);

      // 应用点击：有路由跳转，无路由 toast
      bodyContainer.addEventListener('click', function (event) {
        var entry = event.target.closest('[data-app-name]');
        if (!entry) return;
        var routeId = entry.getAttribute('data-app-route-id');
        if (routeId) {
          ctx.navigate(routeId);
        } else {
          ctx.toast(entry.getAttribute('data-app-name') + '功能演示');
        }
      });
    }
  });
})();
