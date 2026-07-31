window.WegoApp.registerScene({
  routeId: 'my',
  title: '我的',
  presentation: { type: 'host-tab' },
  template: `
    <div class="my-page layout-page" data-component-slug="layout-page" data-surface-id="my" data-route-id="my" data-layout-mode="composed">

      <!-- 顶部导航栏：左自定义身份区 + 右图标操作 -->
      <div class="layout-page__top">
        <div class="navbar" data-component-slug="navbar">
          <div class="navbar__body navbar__body--split">
            <div class="navbar__left navbar__left--custom">
              <button type="button" class="my-nav-identity" data-dom-id="my-nav-identity" aria-label="相册主页">
                <div class="avatar avatar--40 avatar--image" data-component-slug="avatar">
                  <img src="./lib/assets/image/avatar-defult.png" alt="头像">
                </div>
                <span class="my-nav-identity__name">我的相册</span>
                <span class="my-nav-identity__role">超级管理员</span>
              </button>
            </div>
            <div class="navbar__right navbar__right--icon">
              <div class="navbar__action" data-dom-id="my-nav-settings" role="button" tabindex="0" aria-label="设置">
                <div class="navbar__action-icon"><i class="wego-iconfont-s icon-shezhi"></i></div>
                <span class="navbar__action-label">设置</span>
              </div>
              <div class="navbar__action" data-dom-id="my-nav-share" role="button" tabindex="0" aria-label="分享主页">
                <div class="navbar__action-icon"><i class="wego-iconfont-s icon-fenxiang"></i></div>
                <span class="navbar__action-label">分享</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 正文：唯一主纵向滚动区 -->
      <div class="layout-page__body">
        <div class="my-page__scroll layout-scroll" data-component-slug="layout-scroll">

          <!-- 会员栏：独立卡片，等级 + 到期 + 云空间用量 -->
          <div class="layout-section" data-component-slug="layout-section" data-edge="M8" style="--layout-section-gap-before:var(--spacer-12);--layout-section-gap-after:var(--spacer-12)">
            <div class="card card--surface" data-component-slug="card">
              <div class="card__content my-member__content">
                <div class="layout-flow" data-component-slug="layout-flow" data-direction="horizontal" data-justify="between" data-align="center" style="--layout-flow-gap:var(--spacer-8)">
                  <div class="layout-flow" data-component-slug="layout-flow" data-direction="horizontal" data-align="center" style="--layout-flow-gap:var(--spacer-8)">
                    <span class="tag tag--28 tag--brand tag--selected" data-component-slug="tag"><span class="tag__label">黄金会员</span></span>
                    <span class="my-member__expire">到期 2026-12-31</span>
                  </div>
                  <button type="button" class="btn btn--medium btn--sm" data-component-slug="button" data-dom-id="my-member-renew">续费</button>
                </div>
                <div class="layout-flow" data-component-slug="layout-flow" data-direction="vertical" style="--layout-flow-gap:var(--spacer-6)">
                  <div class="layout-flow" data-component-slug="layout-flow" data-direction="horizontal" data-justify="between" style="--layout-flow-gap:var(--spacer-8)">
                    <span class="my-member__storage-label">云空间</span>
                    <span class="my-member__storage-value">已用 12.5 / 50 GB</span>
                  </div>
                  <div class="my-member__progress" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" aria-label="云空间用量">
                    <div class="my-member__progress-fill"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 数据资产横滑：9 个入口，"我买的"带角标 -->
          <div class="layout-section" data-component-slug="layout-section" data-edge="M0" style="--layout-section-gap-before:var(--spacer-0);--layout-section-gap-after:var(--spacer-12)">
            <div class="layout-scroll-row my-assets" data-component-slug="layout-scroll-row" data-peek="next" style="--layout-scroll-row-gap:var(--spacer-0)">
              <button type="button" class="my-asset" data-asset-id="purchased" aria-label="我买的">
                <span class="my-asset__icon"><i class="wego-iconfont-s icon-dingdan"></i></span>
                <span class="my-asset__count">0</span>
                <span class="my-asset__label">我买的</span>
                <span class="badge badge--corner badge--dot" data-component-slug="badge" aria-label="有待办"></span>
              </button>
              <button type="button" class="my-asset" data-asset-id="followers" aria-label="粉丝">
                <span class="my-asset__icon"><i class="wego-iconfont-s icon-fensi"></i></span>
                <span class="my-asset__count">128</span>
                <span class="my-asset__label">粉丝</span>
              </button>
              <button type="button" class="my-asset" data-asset-id="friends" aria-label="好友">
                <span class="my-asset__icon"><i class="wego-iconfont-s icon-duoren"></i></span>
                <span class="my-asset__count">56</span>
                <span class="my-asset__label">好友</span>
              </button>
              <button type="button" class="my-asset" data-asset-id="agents" aria-label="代理">
                <span class="my-asset__icon"><i class="wego-iconfont-s icon-fenxiao"></i></span>
                <span class="my-asset__count">12</span>
                <span class="my-asset__label">代理</span>
              </button>
              <button type="button" class="my-asset" data-asset-id="visitors" aria-label="访客">
                <span class="my-asset__icon"><i class="wego-iconfont-s icon-fangkejilu"></i></span>
                <span class="my-asset__count">89</span>
                <span class="my-asset__label">访客</span>
              </button>
              <button type="button" class="my-asset" data-asset-id="employees" aria-label="员工">
                <span class="my-asset__icon"><i class="wego-iconfont-s icon-guanli"></i></span>
                <span class="my-asset__count">3</span>
                <span class="my-asset__label">员工</span>
              </button>
              <button type="button" class="my-asset" data-asset-id="wallet" aria-label="钱包">
                <span class="my-asset__icon"><i class="wego-iconfont-s icon-qianbao"></i></span>
                <span class="my-asset__count">¥2,580</span>
                <span class="my-asset__label">钱包</span>
              </button>
              <button type="button" class="my-asset" data-asset-id="coupons" aria-label="卡券">
                <span class="my-asset__icon"><i class="wego-iconfont-s icon-quan"></i></span>
                <span class="my-asset__count">5</span>
                <span class="my-asset__label">卡券</span>
              </button>
              <button type="button" class="my-asset" data-asset-id="favorites" aria-label="收藏">
                <span class="my-asset__icon"><i class="wego-iconfont-s icon-shoucang"></i></span>
                <span class="my-asset__count">23</span>
                <span class="my-asset__label">收藏</span>
              </button>
            </div>
          </div>

          <!-- 常用应用横滑：固定入口 + 最近应用 + 全部 -->
          <div class="layout-section" data-component-slug="layout-section" data-edge="M8" style="--layout-section-gap-before:var(--spacer-0);--layout-section-gap-after:var(--spacer-12)">
            <div class="layout-scroll-row my-apps" data-component-slug="layout-scroll-row" data-peek="next" style="--layout-scroll-row-gap:var(--spacer-0)">
              <button type="button" class="my-app" data-app-id="home" aria-label="进入主页">
                <span class="my-app__icon"><i class="wego-iconfont-s icon-shouye"></i></span>
                <span class="my-app__label">进入主页</span>
              </button>
              <button type="button" class="my-app" data-app-id="qrcode" aria-label="二维码">
                <span class="my-app__icon"><i class="wego-iconfont-s icon-erweima"></i></span>
                <span class="my-app__label">二维码</span>
              </button>
              <button type="button" class="my-app" data-app-id="recent" aria-label="最近应用">
                <span class="my-app__icon"><i class="wego-iconfont-s icon-yingyongzhongxin"></i></span>
                <span class="my-app__label">最近应用</span>
              </button>
              <button type="button" class="my-app" data-app-id="all" aria-label="全部应用">
                <span class="my-app__icon my-app__icon--all"><i class="wego-iconfont-s icon-liebiao-dian"></i></span>
                <span class="my-app__label">全部</span>
              </button>
            </div>
          </div>

          <!-- sticky 工具区：类型 tabs + 工具行（搜索 + 筛选 + 视图切换） -->
          <div class="sticky-region my-tools" data-component-slug="sticky-region" data-edge="top" data-visibility="always" data-state="visible" style="--sticky-region-expanded-size:120px;--sticky-region-inline-inset:0;--sticky-region-after-gap:var(--spacer-0)">
            <div class="sticky-region__motion">
              <div class="sticky-region__inner">
                <div class="wg-tabs wg-tabs--standard wg-tabs--divide my-type-tabs" data-component-slug="tabs" role="tablist">
                  <div class="wg-tabs__scroll">
                    <button class="wg-tabs__item" role="tab" aria-selected="true" type="button" data-type="product">
                      <span class="wg-tabs__content"><span class="wg-tabs__label">产品</span></span>
                    </button>
                    <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-type="note">
                      <span class="wg-tabs__content"><span class="wg-tabs__label">笔记</span></span>
                    </button>
                    <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-type="live">
                      <span class="wg-tabs__content"><span class="wg-tabs__label">直播</span></span>
                    </button>
                    <span class="wg-tabs__active-indicator" aria-hidden="true"></span>
                  </div>
                </div>
                <div class="search-toolbar my-toolbar">
                  <div class="searchbox searchbox--sm searchbox--gray" data-component-slug="search">
                    <span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>
                    <div class="searchbox__input">
                      <input class="searchbox__field" type="search" placeholder="搜索内容" aria-label="搜索内容">
                    </div>
                    <div class="searchbox__actions"></div>
                  </div>
                  <div class="search-toolbar__actions">
                    <button class="search-toolbar__action" type="button" data-dom-id="my-filter" aria-label="筛选">
                      <span class="search-toolbar__action-icon wego-iconfont-s icon-shaixuan" aria-hidden="true"></span>
                      筛选
                    </button>
                    <button class="search-toolbar__action" type="button" data-dom-id="my-view-toggle" aria-label="切换视图" data-view-mode="list">
                      <span class="search-toolbar__action-icon wego-iconfont-s icon-liebiao" aria-hidden="true"></span>
                      <span class="my-toolbar__view-label">列表</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 内容列表：产品 / 笔记 / 直播，视图模式 per-tab 独立 -->
          <div class="layout-section" data-component-slug="layout-section" data-edge="M8" style="--layout-section-gap-before:var(--spacer-0);--layout-section-gap-after:var(--spacer-16)">

            <!-- 产品列表 -->
            <div class="my-content my-content--product" data-content-type="product" data-view="list">
              <div class="layout-grid" data-component-slug="layout-grid" data-columns="1" data-align="stretch" style="--layout-grid-row-gap:var(--spacer-12)">
                <div class="card card--surface my-card my-card--product" data-component-slug="card">
                  <div class="my-card__media">
                    <img class="my-card__img" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20product%20photography%20of%20luxury%20watch%20on%20white%20background%2C%20clean%20minimal%20style&image_size=square_hd" alt="高端商务手表">
                  </div>
                  <div class="my-card__body">
                    <div class="my-card__info">
                      <span class="my-card__title">高端商务手表</span>
                      <span class="metric metric--16 metric--marketing" data-component-slug="metric"><span class="metric__main"><span class="metric__symbol">¥</span><span class="metric__value"><span class="metric__integer">2,999</span></span></span></span>
                    </div>
                    <div class="my-card__actions">
                      <button type="button" class="my-card__action" data-action="share" aria-label="分享"><i class="wego-iconfont-s icon-fenxiang"></i></button>
                      <button type="button" class="my-card__action" data-action="edit" aria-label="编辑"><i class="wego-iconfont-s icon-bianji"></i></button>
                      <button type="button" class="my-card__action" data-action="download" aria-label="下载"><i class="wego-iconfont-s icon-xiazai"></i></button>
                      <button type="button" class="my-card__action" data-action="refresh" aria-label="刷新"><i class="wego-iconfont-s icon-shuaxin"></i></button>
                    </div>
                  </div>
                </div>
                <div class="card card--surface my-card my-card--product" data-component-slug="card">
                  <div class="my-card__media">
                    <img class="my-card__img" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20product%20photography%20of%20leather%20handbag%20on%20white%20background%2C%20clean%20minimal%20style&image_size=square_hd" alt="真皮手提包">
                  </div>
                  <div class="my-card__body">
                    <div class="my-card__info">
                      <span class="my-card__title">真皮手提包</span>
                      <span class="metric metric--16 metric--marketing" data-component-slug="metric"><span class="metric__main"><span class="metric__symbol">¥</span><span class="metric__value"><span class="metric__integer">1,599</span></span></span></span>
                    </div>
                    <div class="my-card__actions">
                      <button type="button" class="my-card__action" data-action="share" aria-label="分享"><i class="wego-iconfont-s icon-fenxiang"></i></button>
                      <button type="button" class="my-card__action" data-action="edit" aria-label="编辑"><i class="wego-iconfont-s icon-bianji"></i></button>
                      <button type="button" class="my-card__action" data-action="download" aria-label="下载"><i class="wego-iconfont-s icon-xiazai"></i></button>
                      <button type="button" class="my-card__action" data-action="refresh" aria-label="刷新"><i class="wego-iconfont-s icon-shuaxin"></i></button>
                    </div>
                  </div>
                </div>
                <div class="card card--surface my-card my-card--product" data-component-slug="card">
                  <div class="my-card__media">
                    <img class="my-card__img" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20product%20photography%20of%20wireless%20earbuds%20on%20white%20background%2C%20clean%20minimal%20style&image_size=square_hd" alt="无线蓝牙耳机">
                  </div>
                  <div class="my-card__body">
                    <div class="my-card__info">
                      <span class="my-card__title">无线蓝牙耳机</span>
                      <span class="metric metric--16 metric--marketing" data-component-slug="metric"><span class="metric__main"><span class="metric__symbol">¥</span><span class="metric__value"><span class="metric__integer">899</span></span></span></span>
                    </div>
                    <div class="my-card__actions">
                      <button type="button" class="my-card__action" data-action="share" aria-label="分享"><i class="wego-iconfont-s icon-fenxiang"></i></button>
                      <button type="button" class="my-card__action" data-action="edit" aria-label="编辑"><i class="wego-iconfont-s icon-bianji"></i></button>
                      <button type="button" class="my-card__action" data-action="download" aria-label="下载"><i class="wego-iconfont-s icon-xiazai"></i></button>
                      <button type="button" class="my-card__action" data-action="refresh" aria-label="刷新"><i class="wego-iconfont-s icon-shuaxin"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 笔记列表 -->
            <div class="my-content my-content--note" data-content-type="note" data-view="list" hidden>
              <div class="layout-grid" data-component-slug="layout-grid" data-columns="1" data-align="stretch" style="--layout-grid-row-gap:var(--spacer-12)">
                <div class="card card--surface my-card my-card--note" data-component-slug="card">
                  <div class="my-card__media">
                    <img class="my-card__img" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lifestyle%20note%20cover%20photo%20of%20autumn%20outfit%20matching%2C%20warm%20tone%2C%20minimal%20flat%20lay&image_size=square_hd" alt="秋日穿搭笔记">
                  </div>
                  <div class="my-card__body">
                    <div class="my-card__info">
                      <span class="my-card__title">秋日穿搭分享</span>
                      <span class="my-card__author">作者 · 小微</span>
                    </div>
                    <div class="my-card__actions">
                      <button type="button" class="my-card__action" data-action="share" aria-label="分享"><i class="wego-iconfont-s icon-fenxiang"></i></button>
                      <button type="button" class="my-card__action" data-action="edit" aria-label="编辑"><i class="wego-iconfont-s icon-bianji"></i></button>
                      <button type="button" class="my-card__action" data-action="download" aria-label="下载"><i class="wego-iconfont-s icon-xiazai"></i></button>
                      <button type="button" class="my-card__action" data-action="refresh" aria-label="刷新"><i class="wego-iconfont-s icon-shuaxin"></i></button>
                    </div>
                  </div>
                </div>
                <div class="card card--surface my-card my-card--note" data-component-slug="card">
                  <div class="my-card__media">
                    <img class="my-card__img" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lifestyle%20note%20cover%20photo%20of%20home%20decoration%20tips%2C%20scandinavian%20style%2C%20bright%20and%20airy&image_size=square_hd" alt="家居好物笔记">
                  </div>
                  <div class="my-card__body">
                    <div class="my-card__info">
                      <span class="my-card__title">家居好物推荐</span>
                      <span class="my-card__author">作者 · 阿购</span>
                    </div>
                    <div class="my-card__actions">
                      <button type="button" class="my-card__action" data-action="share" aria-label="分享"><i class="wego-iconfont-s icon-fenxiang"></i></button>
                      <button type="button" class="my-card__action" data-action="edit" aria-label="编辑"><i class="wego-iconfont-s icon-bianji"></i></button>
                      <button type="button" class="my-card__action" data-action="download" aria-label="下载"><i class="wego-iconfont-s icon-xiazai"></i></button>
                      <button type="button" class="my-card__action" data-action="refresh" aria-label="刷新"><i class="wego-iconfont-s icon-shuaxin"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 直播列表：纯图片宫格 3:4，不显示状态 -->
            <div class="my-content my-content--live" data-content-type="live" data-view="grid" hidden>
              <div class="layout-grid" data-component-slug="layout-grid" data-columns="2" data-align="stretch" style="--layout-grid-column-gap:var(--spacer-8);--layout-grid-row-gap:var(--spacer-8)">
                <div class="my-live"><img class="my-live__img" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=live%20streaming%20cover%20of%20fashion%20clothing%20display%2C%20vibrant%20colors%2C%20professional%20studio%20lighting&image_size=portrait_4_3" alt="直播封面"></div>
                <div class="my-live"><img class="my-live__img" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=live%20streaming%20cover%20of%20beauty%20cosmetics%20showcase%2C%20elegant%20setup%2C%20soft%20pink%20tones&image_size=portrait_4_3" alt="直播封面"></div>
                <div class="my-live"><img class="my-live__img" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=live%20streaming%20cover%20of%20home%20appliances%20demonstration%2C%20clean%20modern%20kitchen%20background&image_size=portrait_4_3" alt="直播封面"></div>
                <div class="my-live"><img class="my-live__img" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=live%20streaming%20cover%20of%20food%20cooking%20show%2C%20delicious%20dishes%2C%20warm%20restaurant%20ambiance&image_size=portrait_4_3" alt="直播封面"></div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- 发布 FAB：fixed 右下，点击提示"即将上线" -->
      <button type="button" class="btn btn--strong btn--md btn--icon-only my-fab" data-component-slug="button" data-dom-id="my-fab-publish" aria-label="发布">
        <i class="btn__icon icon-jia16"></i>
      </button>
    </div>
  `,

  init: function (ctx) {
    var root = ctx.root;
    var self = this;
    var viewModes = { product: 'list', note: 'list', live: 'grid' };
    var showToast = function (msg) { window.WegoApp.showToast(msg); };

    // 导航栏身份区
    var identity = root.querySelector('[data-dom-id="my-nav-identity"]');
    if (identity) identity.addEventListener('click', function () { showToast('即将上线'); });

    // 导航栏右侧操作
    var settings = root.querySelector('[data-dom-id="my-nav-settings"]');
    if (settings) settings.addEventListener('click', function () { showToast('即将上线'); });
    var share = root.querySelector('[data-dom-id="my-nav-share"]');
    if (share) share.addEventListener('click', function () { showToast('即将上线'); });

    // 会员续费
    var renew = root.querySelector('[data-dom-id="my-member-renew"]');
    if (renew) renew.addEventListener('click', function () { showToast('即将上线'); });

    // 筛选入口
    var filterBtn = root.querySelector('[data-dom-id="my-filter"]');
    if (filterBtn) filterBtn.addEventListener('click', function () { showToast('即将上线'); });

    // 视图切换（仅产品 / 笔记）
    var viewToggle = root.querySelector('[data-dom-id="my-view-toggle"]');
    var tabs = root.querySelector('.my-type-tabs');
    var tabItems = tabs ? Array.from(tabs.querySelectorAll('.wg-tabs__item')) : [];
    if (viewToggle) {
      viewToggle.addEventListener('click', function () {
        var activeTab = tabs.querySelector('.wg-tabs__item[aria-selected="true"]');
        var type = activeTab ? activeTab.getAttribute('data-type') : 'product';
        if (type === 'live') return;
        var current = viewModes[type];
        var next = current === 'list' ? 'grid' : 'list';
        viewModes[type] = next;
        self.applyViewMode(root, type, next);
        self.updateViewToggle(viewToggle, next);
      });
    }

    // 发布 FAB
    var fab = root.querySelector('[data-dom-id="my-fab-publish"]');
    if (fab) fab.addEventListener('click', function () { showToast('即将上线'); });

    // 数据资产入口点击
    root.querySelectorAll('.my-asset').forEach(function (item) {
      item.addEventListener('click', function () { showToast('即将上线'); });
    });

    // 常用应用点击
    root.querySelectorAll('.my-app').forEach(function (item) {
      item.addEventListener('click', function () { showToast('即将上线'); });
    });

    // 类型 tabs 切换
    tabItems.forEach(function (item) {
      item.addEventListener('click', function () {
        var type = item.getAttribute('data-type');
        tabItems.forEach(function (candidate) {
          candidate.setAttribute('aria-selected', String(candidate === item));
        });
        self.updateTabsIndicator(tabs);
        self.switchContent(root, type, viewModes);
      });
    });

    // 内容卡片操作
    root.querySelectorAll('.my-card__action').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-action');
        var labels = { share: '分享', edit: '编辑', download: '下载', refresh: '刷新' };
        showToast(labels[action] || '操作');
      });
    });

    // 初始化 tabs 指示器
    self.updateTabsIndicator(tabs);

    // 将 sticky 工具区和 FAB 纳入滚动布局管理
    if (ctx.bindScrollLayout) {
      ctx.bindScrollLayout({
        fixedRegions: [{ selector: '.my-fab', edge: 'bottom', gap: 16 }]
      });
    }
  },

  switchContent: function (root, type, viewModes) {
    ['product', 'note', 'live'].forEach(function (t) {
      var el = root.querySelector('[data-content-type="' + t + '"]');
      if (!el) return;
      if (t === type) el.removeAttribute('hidden');
      else el.setAttribute('hidden', '');
    });
    var viewToggle = root.querySelector('[data-dom-id="my-view-toggle"]');
    if (viewToggle) {
      var mode = viewModes[type];
      if (type === 'live') {
        viewToggle.setAttribute('hidden', '');
      } else {
        viewToggle.removeAttribute('hidden');
        this.updateViewToggle(viewToggle, mode);
      }
    }
  },

  applyViewMode: function (root, type, mode) {
    var el = root.querySelector('[data-content-type="' + type + '"]');
    if (!el) return;
    el.setAttribute('data-view', mode);
    var grid = el.querySelector('.layout-grid');
    if (grid) grid.setAttribute('data-columns', mode === 'grid' ? '2' : '1');
  },

  updateViewToggle: function (toggle, mode) {
    toggle.setAttribute('data-view-mode', mode);
    var icon = toggle.querySelector('.search-toolbar__action-icon');
    var label = toggle.querySelector('.my-toolbar__view-label');
    if (icon) icon.className = 'search-toolbar__action-icon wego-iconfont-s ' + (mode === 'grid' ? 'icon-tupian' : 'icon-liebiao');
    if (label) label.textContent = mode === 'grid' ? '网格' : '列表';
  },

  updateTabsIndicator: function (tabs) {
    if (!tabs) return;
    var scroll = tabs.querySelector('.wg-tabs__scroll');
    var indicator = tabs.querySelector('.wg-tabs__active-indicator');
    var selected = tabs.querySelector('.wg-tabs__item[aria-selected="true"] .wg-tabs__content');
    if (!scroll || !indicator || !selected) return;
    var scrollRect = scroll.getBoundingClientRect();
    var selectedRect = selected.getBoundingClientRect();
    indicator.style.setProperty('--_tabs-indicator-x', (selectedRect.left - scrollRect.left + scroll.scrollLeft) + 'px');
    indicator.style.setProperty('--_tabs-indicator-width', selectedRect.width + 'px');
  },

  destroy: function () {}
});
