window.WegoApp.registerScene({
  routeId: 'my',
  title: '我的',
  mount: function (container) {
    container.innerHTML = `
      <div class="my-page" data-component-slug="my-page">
        <!-- 导航栏 -->
        <header class="my-nav" data-component-slug="my-nav">
          <div class="my-nav__left" data-component-slug="layout-flow" data-direction="horizontal" data-align="center" data-gap="8">
            <div class="my-nav__avatar" data-component-slug="avatar" data-size="40">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20portrait%20of%20a%20friendly%20business%20person%2C%20clean%20background%2C%20neutral%20expression&image_size=square" alt="头像" />
            </div>
            <div class="my-nav__info" data-component-slug="layout-flow" data-direction="vertical" data-gap="2">
              <span class="my-nav__name">我的相册</span>
              <span class="my-nav__role">超级管理员</span>
            </div>
          </div>
          <div class="my-nav__right" data-component-slug="layout-flow" data-direction="horizontal" data-gap="12">
            <button class="my-nav__icon-btn" data-component-slug="icon-btn" aria-label="设置">
              <i class="wego-iconfont-s icon-shezhi"></i>
            </button>
            <button class="my-nav__icon-btn" data-component-slug="icon-btn" aria-label="分享主页">
              <i class="wego-iconfont-s icon-fenxiang"></i>
            </button>
          </div>
        </header>

        <!-- 会员栏 -->
        <section class="my-membership" data-component-slug="my-membership">
          <div class="my-membership__header" data-component-slug="layout-flow" data-direction="horizontal" data-justify="between" data-align="center">
            <span class="my-membership__level">黄金会员</span>
            <span class="my-membership__expire">到期时间：2026-12-31</span>
          </div>
          <div class="my-membership__storage" data-component-slug="layout-flow" data-direction="vertical" data-gap="4">
            <div class="my-membership__storage-label" data-component-slug="layout-flow" data-direction="horizontal" data-justify="between">
              <span>云空间用量</span>
              <span>已用 12.5 / 总共 50 GB</span>
            </div>
            <div class="my-membership__progress" data-component-slug="progress-bar" data-value="25" data-max="100">
              <div class="my-membership__progress-fill"></div>
            </div>
          </div>
        </section>

        <!-- 数据资产横滑 -->
        <section class="my-assets" data-component-slug="layout-scroll-row" data-peek="next" data-item-size="compact" data-gap="12">
          <div class="my-asset-item" data-component-slug="my-asset-item" data-has-badge="false">
            <span class="my-asset-item__count">0</span>
            <span class="my-asset-item__label">我买的</span>
          </div>
          <div class="my-asset-item" data-component-slug="my-asset-item">
            <span class="my-asset-item__count">128</span>
            <span class="my-asset-item__label">粉丝</span>
          </div>
          <div class="my-asset-item" data-component-slug="my-asset-item">
            <span class="my-asset-item__count">56</span>
            <span class="my-asset-item__label">好友</span>
          </div>
          <div class="my-asset-item" data-component-slug="my-asset-item">
            <span class="my-asset-item__count">12</span>
            <span class="my-asset-item__label">代理</span>
          </div>
          <div class="my-asset-item" data-component-slug="my-asset-item">
            <span class="my-asset-item__count">89</span>
            <span class="my-asset-item__label">访客</span>
          </div>
          <div class="my-asset-item" data-component-slug="my-asset-item">
            <span class="my-asset-item__count">3</span>
            <span class="my-asset-item__label">员工</span>
          </div>
          <div class="my-asset-item" data-component-slug="my-asset-item">
            <span class="my-asset-item__count">¥2,580</span>
            <span class="my-asset-item__label">钱包</span>
          </div>
          <div class="my-asset-item" data-component-slug="my-asset-item">
            <span class="my-asset-item__count">5</span>
            <span class="my-asset-item__label">卡券</span>
          </div>
          <div class="my-asset-item" data-component-slug="my-asset-item">
            <span class="my-asset-item__count">23</span>
            <span class="my-asset-item__label">收藏</span>
          </div>
        </section>

        <!-- 常用应用横滑 -->
        <section class="my-apps" data-component-slug="layout-scroll-row" data-peek="next" data-item-size="compact" data-gap="12">
          <div class="my-app-item" data-component-slug="my-app-item">
            <i class="wego-iconfont-s icon-shouye"></i>
            <span>进入主页</span>
          </div>
          <div class="my-app-item" data-component-slug="my-app-item">
            <i class="wego-iconfont-s icon-erweima"></i>
            <span>二维码</span>
          </div>
          <div class="my-app-item" data-component-slug="my-app-item">
            <i class="wego-iconfont-s icon-yingyongzhongxin"></i>
            <span>应用1</span>
          </div>
          <div class="my-app-item" data-component-slug="my-app-item">
            <i class="wego-iconfont-s icon-yingyongzhongxin"></i>
            <span>应用2</span>
          </div>
          <div class="my-app-item" data-component-slug="my-app-item">
            <i class="wego-iconfont-s icon-yingyongzhongxin"></i>
            <span>应用3</span>
          </div>
          <div class="my-app-item my-app-item--all" data-component-slug="my-app-item">
            <i class="wego-iconfont-s icon-liebiao-dian"></i>
            <span>全部</span>
          </div>
        </section>

        <!-- 类型tabs -->
        <div class="my-type-tabs" data-component-slug="segmented-control" data-active="product">
          <button class="my-type-tabs__item active" data-type="product">产品</button>
          <button class="my-type-tabs__item" data-type="note">笔记</button>
          <button class="my-type-tabs__item" data-type="live">直播</button>
        </div>

        <!-- 工具行 -->
        <div class="my-toolbar" data-component-slug="layout-flow" data-direction="horizontal" data-justify="between" data-align="center">
          <div class="my-toolbar__search" data-component-slug="search-bar">
            <i class="wego-iconfont-s icon-sousuo"></i>
            <input type="text" placeholder="搜索内容" />
          </div>
          <div class="my-toolbar__actions" data-component-slug="layout-flow" data-direction="horizontal" data-gap="12">
            <button class="my-toolbar__icon-btn" data-component-slug="icon-btn" aria-label="筛选">
              <i class="wego-iconfont-s icon-shaixuan"></i>
            </button>
            <button class="my-toolbar__icon-btn" data-component-slug="icon-btn" aria-label="视图切换" data-view-mode="grid">
              <i class="wego-iconfont-s icon-tupian"></i>
            </button>
          </div>
        </div>

        <!-- 内容列表 - 产品网格视图 -->
        <section class="my-content-list my-content-list--grid" data-component-slug="my-content-list" data-type="product" data-view="grid">
          <div class="my-product-card" data-component-slug="my-product-card">
            <div class="my-product-card__image">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20product%20photography%20of%20luxury%20watch%20on%20white%20background%2C%20clean%20minimal%20style&image_size=square" alt="产品" />
            </div>
            <div class="my-product-card__info" data-component-slug="layout-flow" data-direction="vertical" data-gap="4">
              <span class="my-product-card__title">高端商务手表</span>
              <span class="my-product-card__price">¥2,999</span>
            </div>
            <div class="my-product-card__actions" data-component-slug="layout-flow" data-direction="horizontal" data-justify="between">
              <button class="my-product-card__action-btn" data-action="share">
                <i class="wego-iconfont-s icon-fenxiang"></i>
              </button>
              <button class="my-product-card__action-btn" data-action="edit">
                <i class="wego-iconfont-s icon-bianji"></i>
              </button>
              <button class="my-product-card__action-btn" data-action="download">
                <i class="wego-iconfont-s icon-xiazai"></i>
              </button>
              <button class="my-product-card__action-btn" data-action="refresh">
                <i class="wego-iconfont-s icon-shuaxin"></i>
              </button>
            </div>
          </div>
          <div class="my-product-card" data-component-slug="my-product-card">
            <div class="my-product-card__image">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20product%20photography%20of%20leather%20handbag%20on%20white%20background%2C%20clean%20minimal%20style&image_size=square" alt="产品" />
            </div>
            <div class="my-product-card__info" data-component-slug="layout-flow" data-direction="vertical" data-gap="4">
              <span class="my-product-card__title">真皮手提包</span>
              <span class="my-product-card__price">¥1,599</span>
            </div>
            <div class="my-product-card__actions" data-component-slug="layout-flow" data-direction="horizontal" data-justify="between">
              <button class="my-product-card__action-btn" data-action="share">
                <i class="wego-iconfont-s icon-fenxiang"></i>
              </button>
              <button class="my-product-card__action-btn" data-action="edit">
                <i class="wego-iconfont-s icon-bianji"></i>
              </button>
              <button class="my-product-card__action-btn" data-action="download">
                <i class="wego-iconfont-s icon-xiazai"></i>
              </button>
              <button class="my-product-card__action-btn" data-action="refresh">
                <i class="wego-iconfont-s icon-shuaxin"></i>
              </button>
            </div>
          </div>
          <div class="my-product-card" data-component-slug="my-product-card">
            <div class="my-product-card__image">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20product%20photography%20of%20wireless%20earbuds%20on%20white%20background%2C%20clean%20minimal%20style&image_size=square" alt="产品" />
            </div>
            <div class="my-product-card__info" data-component-slug="layout-flow" data-direction="vertical" data-gap="4">
              <span class="my-product-card__title">无线蓝牙耳机</span>
              <span class="my-product-card__price">¥899</span>
            </div>
            <div class="my-product-card__actions" data-component-slug="layout-flow" data-direction="horizontal" data-justify="between">
              <button class="my-product-card__action-btn" data-action="share">
                <i class="wego-iconfont-s icon-fenxiang"></i>
              </button>
              <button class="my-product-card__action-btn" data-action="edit">
                <i class="wego-iconfont-s icon-bianji"></i>
              </button>
              <button class="my-product-card__action-btn" data-action="download">
                <i class="wego-iconfont-s icon-xiazai"></i>
              </button>
              <button class="my-product-card__action-btn" data-action="refresh">
                <i class="wego-iconfont-s icon-shuaxin"></i>
              </button>
            </div>
          </div>
          <div class="my-product-card" data-component-slug="my-product-card">
            <div class="my-product-card__image">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20product%20photography%20of%20sunglasses%20on%20white%20background%2C%20clean%20minimal%20style&image_size=square" alt="产品" />
            </div>
            <div class="my-product-card__info" data-component-slug="layout-flow" data-direction="vertical" data-gap="4">
              <span class="my-product-card__title">时尚太阳镜</span>
              <span class="my-product-card__price">¥599</span>
            </div>
            <div class="my-product-card__actions" data-component-slug="layout-flow" data-direction="horizontal" data-justify="between">
              <button class="my-product-card__action-btn" data-action="share">
                <i class="wego-iconfont-s icon-fenxiang"></i>
              </button>
              <button class="my-product-card__action-btn" data-action="edit">
                <i class="wego-iconfont-s icon-bianji"></i>
              </button>
              <button class="my-product-card__action-btn" data-action="download">
                <i class="wego-iconfont-s icon-xiazai"></i>
              </button>
              <button class="my-product-card__action-btn" data-action="refresh">
                <i class="wego-iconfont-s icon-shuaxin"></i>
              </button>
            </div>
          </div>
        </section>

        <!-- 发布FAB -->
        <button class="my-fab" data-component-slug="my-fab" aria-label="发布">
          <i class="wego-iconfont-s icon-jia"></i>
        </button>
      </div>
    `;

    // 绑定事件
    this.bindEvents(container);
  },

  bindEvents: function (container) {
    // 数据资产入口点击
    container.querySelectorAll('.my-asset-item').forEach(item => {
      item.addEventListener('click', () => {
        window.WegoApp.showToast('即将上线');
      });
    });

    // 常用应用点击
    container.querySelectorAll('.my-app-item').forEach(item => {
      item.addEventListener('click', () => {
        const label = item.querySelector('span').textContent;
        if (label === '全部') {
          window.WegoApp.showToast('即将上线');
        } else {
          window.WegoApp.showToast('即将上线');
        }
      });
    });

    // 类型tabs切换
    container.querySelectorAll('.my-type-tabs__item').forEach(tab => {
      tab.addEventListener('click', (e) => {
        container.querySelectorAll('.my-type-tabs__item').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // 视图切换
    const viewBtn = container.querySelector('.my-toolbar__icon-btn[data-view-mode]');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        const currentMode = viewBtn.getAttribute('data-view-mode');
        const newMode = currentMode === 'grid' ? 'list' : 'grid';
        viewBtn.setAttribute('data-view-mode', newMode);
        const icon = viewBtn.querySelector('i');
        icon.className = newMode === 'grid' ? 'wego-iconfont-s icon-tupian' : 'wego-iconfont-s icon-liebiao';
      });
    }

    // 发布FAB
    const fab = container.querySelector('.my-fab');
    if (fab) {
      fab.addEventListener('click', () => {
        window.WegoApp.showToast('即将上线');
      });
    }
  },

  unmount: function () {}
});
