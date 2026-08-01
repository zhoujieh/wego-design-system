const sceneTemplate = `<div class="my-page layout-page" data-component-slug="layout-page" data-surface-id="personal-center" data-route-id="personal-center" data-layout-mode="composed"><div class="layout-page__top"><div class="navbar" data-component-slug="navbar"><div class="navbar__body navbar__body--split"><div class="navbar__left navbar__left--custom"><div class="my-nav-profile" data-dom-id="nav-profile"><div class="avatar avatar--40 avatar--image" data-component-slug="avatar"><img alt=""></div><div class="my-nav-profile__info"><div class="my-nav-profile__name"></div><div class="my-nav-profile__album"></div></div><i class="wego-iconfont-s icon-youjiantou-mian16 my-nav-profile__arrow"></i></div></div><div class="navbar__right navbar__right--icon"><div class="navbar__action" data-dom-id="nav-settings"><div class="navbar__action-icon"><i class="wego-iconfont-s icon-shezhi"></i></div><span class="navbar__action-label">设置</span></div><div class="navbar__action" data-dom-id="nav-share"><div class="navbar__action-icon"><i class="wego-iconfont-s icon-fenxiang-mian"></i></div><span class="navbar__action-label">分享</span></div></div></div></div></div><div class="layout-page__body"><div class="layout-scroll" data-component-slug="layout-scroll"><div class="layout-section" data-component-slug="layout-section" data-edge="M8" style="--layout-section-gap-before:var(--spacer-12);--layout-section-gap-after:var(--spacer-0)"><div class="card card--surface" data-component-slug="card"><div class="card__content my-membership" data-dom-id="membership"><div class="my-membership__row"><span class="my-membership__level">VIP 会员</span><span class="my-membership__expire">2026.12.31 到期</span></div><div class="my-membership__storage"><div class="my-membership__storage-head"><span class="my-membership__storage-label">云空间</span><span class="my-membership__storage-text">12.5GB / 50GB</span></div><div class="my-membership__storage-bar"><div class="my-membership__storage-used" style="width:25%"></div></div></div></div></div></div><div class="layout-section" data-component-slug="layout-section" data-edge="M0" style="--layout-section-gap-before:var(--spacer-12);--layout-section-gap-after:var(--spacer-0)"><div class="card card--surface my-section-card" data-component-slug="card"><div class="layout-scroll-row my-assets" data-component-slug="layout-scroll-row" data-item-size="auto" data-snap="none" data-peek="next" style="--layout-scroll-row-gap:var(--spacer-0)" data-region="assets"></div></div></div><div class="layout-section" data-component-slug="layout-section" data-edge="M0" style="--layout-section-gap-before:var(--spacer-12);--layout-section-gap-after:var(--spacer-0)"><div class="card card--surface my-section-card" data-component-slug="card"><div class="layout-scroll-row my-apps" data-component-slug="layout-scroll-row" data-item-size="auto" data-snap="none" data-peek="next" style="--layout-scroll-row-gap:var(--spacer-0)" data-region="apps"></div></div></div><div class="sticky-region" data-component-slug="sticky-region" data-edge="top" data-visibility="always" data-state="visible" style="--sticky-region-expanded-size:56px;--sticky-region-inline-inset:0px"><div class="sticky-region__motion"><div class="sticky-region__inner"><div class="wg-tabs wg-tabs--standard wg-tabs--divide" data-component-slug="tabs" role="tablist"><div class="wg-tabs__scroll"><button class="wg-tabs__item" role="tab" aria-selected="true" type="button" data-dom-id="tab-product"><span class="wg-tabs__content"><span class="wg-tabs__label">产品</span></span></button><button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-dom-id="tab-note"><span class="wg-tabs__content"><span class="wg-tabs__label">笔记</span></span></button><button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-dom-id="tab-live"><span class="wg-tabs__content"><span class="wg-tabs__label">直播</span></span></button><span class="wg-tabs__active-indicator" aria-hidden="true"></span></div></div></div></div></div><div class="layout-section" data-component-slug="layout-section" data-edge="M8" style="--layout-section-gap-before:var(--spacer-0);--layout-section-gap-after:var(--spacer-0)"><div class="my-content" data-region="content"></div></div></div></div><button class="my-fab" type="button" data-dom-id="fab-publish" aria-label="发布"><i class="wego-iconfont-s icon-jia"></i></button></div>`;

(function () {
  // Layout: 顶部 navbar（个人信息+设置+分享）→ 主滚动区（会员栏→数据资产横滑→常用应用横滑→sticky 类型 tabs→内容列表）→ 右下角发布 FAB。
  // 列表区 functional（tab 切换、发布插入），相册切换 functional，其余入口 stub 反馈。

  function getAlbums() {
    return [
      { id: 'album-all', name: '全部相册' },
      { id: 'album-clothing', name: '服装相册' },
      { id: 'album-shoes', name: '鞋包相册' }
    ];
  }

  function getAssetItems() {
    return [
      { id: 'asset-purchased', icon: 'icon-shangpin-xin', label: '我买的', value: '128', badge: 3 },
      { id: 'asset-fans', icon: 'icon-fensi', label: '粉丝', value: '1280' },
      { id: 'asset-friends', icon: 'icon-duoren-mian', label: '好友', value: '86' },
      { id: 'asset-agents', icon: 'icon-tuiguangyuan', label: '代理', value: '12' },
      { id: 'asset-visitors', icon: 'icon-fangkejilu', label: '访客', value: '56' },
      { id: 'asset-staff', icon: 'icon-ren', label: '员工', value: '4' },
      { id: 'asset-wallet', icon: 'icon-qianbao-mian', label: '钱包', value: '2580' },
      { id: 'asset-coupons', icon: 'icon-quan-mian', label: '卡券', value: '8' },
      { id: 'asset-favorites', icon: 'icon-shoucang', label: '收藏', value: '36' }
    ];
  }

  function getAppItems() {
    return [
      { id: 'app-home', icon: 'icon-shouye', label: '主页' },
      { id: 'app-qrcode', icon: 'icon-erweima-mian', label: '二维码' },
      { id: 'app-cart', icon: 'icon-gouwuche', label: '购物车', badge: 3 },
      { id: 'app-recent', icon: 'icon-rili', label: '最近' },
      { id: 'app-all', icon: 'icon-yingyongzhongxin', label: '全部' }
    ];
  }

  function collectProducts(db) {
    var products = db.products || [];
    return products.slice(0, 8).map(function (p) {
      return { id: p.product_id, title: p.title, price: p.price, cover: p.image_list && p.image_list[0] };
    });
  }

  function collectNotes(db) {
    var dynamics = db.dynamics || [];
    return dynamics.filter(function (d) { return d.content_type === 'note'; }).map(function (d) {
      var cover = d.media_list && d.media_list[0] && d.media_list[0].poster_or_src;
      return { id: d.dynamic_id, title: d.text_content, cover: cover };
    });
  }

  function collectLives(db) {
    var products = db.products || [];
    var covers = products.map(function (p) { return p.image_list && p.image_list[0]; }).filter(Boolean);
    return [
      { id: 'live-1', title: '秋季新品上新直播', cover: covers[4] || covers[0], status: '直播中', viewers: 128 },
      { id: 'live-2', title: '通勤穿搭分享专场', cover: covers[5] || covers[0], status: '预告', viewers: 0 },
      { id: 'live-3', title: '夏日清仓特卖回放', cover: covers[7] || covers[0], status: '回放', viewers: 560 }
    ];
  }

  function renderNavProfile(root, currentUser, state) {
    var avatarImg = root.querySelector('.my-nav-profile .avatar img');
    var nameEl = root.querySelector('.my-nav-profile__name');
    var albumEl = root.querySelector('.my-nav-profile__album');
    if (avatarImg && currentUser.avatar) avatarImg.src = currentUser.avatar;
    if (nameEl && currentUser.merchant_name) nameEl.textContent = currentUser.merchant_name;
    var currentAlbum = state.albums.find(function (a) { return a.id === state.currentAlbumId; });
    if (albumEl && currentAlbum) albumEl.textContent = currentAlbum.name;
  }

  function renderAssets(root) {
    var container = root.querySelector('[data-region="assets"]');
    if (!container) return;
    container.innerHTML = getAssetItems().map(function (item) {
      var badgeHtml = item.badge
        ? '<span class="badge badge--corner badge--number" data-component-slug="badge">' + item.badge + '</span>'
        : '';
      return '<button class="my-asset-item" type="button" data-dom-id="' + item.id + '"><div class="my-asset-item__icon"><i class="wego-iconfont-s ' + item.icon + '"></i></div><div class="my-asset-item__value">' + item.value + '</div><div class="my-asset-item__label">' + item.label + '</div>' + badgeHtml + '</button>';
    }).join('');
  }

  function renderApps(root) {
    var container = root.querySelector('[data-region="apps"]');
    if (!container) return;
    container.innerHTML = getAppItems().map(function (item) {
      var badgeHtml = item.badge
        ? '<span class="badge badge--corner badge--number" data-component-slug="badge">' + item.badge + '</span>'
        : '';
      return '<button class="my-app-item" type="button" data-dom-id="' + item.id + '"><div class="my-app-item__icon"><i class="wego-iconfont-s ' + item.icon + '"></i></div><div class="my-app-item__label">' + item.label + '</div>' + badgeHtml + '</button>';
    }).join('');
  }

  function buildPriceMetrics(price) {
    var intPart = String(Math.floor(price));
    var decimal = String(price).split('.')[1];
    var decimalHtml = decimal ? '<span class="metric__decimal">.' + decimal + '</span>' : '';
    return '<span class="metric metric--14 metric--marketing" data-component-slug="metric"><span class="metric__main"><span class="metric__symbol">¥</span><span class="metric__value"><span class="metric__integer">' + intPart + '</span>' + decimalHtml + '</span></span></span>';
  }

  function renderContent(root, state) {
    var container = root.querySelector('[data-region="content"]');
    if (!container) return;
    var tab = state.activeTab;
    var list = state.lists[tab] || [];
    container.className = 'my-content my-content--grid my-content--' + tab;
    if (list.length === 0) {
      container.innerHTML = '<div class="my-content__empty">暂无内容，点击右下角发布</div>';
      return;
    }
    container.innerHTML = list.map(function (item) {
      var cover = item.cover || '';
      if (tab === 'product') {
        var priceHtml = buildPriceMetrics(item.price);
        return '<div class="card card--surface card--vertical my-content-card my-content-card--grid" role="button" data-dom-id="item-' + item.id + '"><div class="my-content-card__cover"><img src="' + cover + '" alt=""></div><div class="my-content-card__body"><div class="my-content-card__title">' + item.title + '</div><div class="my-content-card__info">' + priceHtml + '</div></div></div>';
      }
      if (tab === 'note') {
        return '<div class="card card--surface card--vertical my-content-card my-content-card--grid" role="button" data-dom-id="item-' + item.id + '"><div class="my-content-card__cover"><img src="' + cover + '" alt=""></div><div class="my-content-card__body"><div class="my-content-card__title">' + item.title + '</div></div></div>';
      }
      return '<div class="card card--surface card--vertical my-content-card my-content-card--grid my-content-card--live" role="button" data-dom-id="item-' + item.id + '"><div class="my-content-card__cover"><img src="' + cover + '" alt=""><span class="my-content-card__live-badge my-content-card__live-badge--' + item.status + '">' + item.status + '</span></div><div class="my-content-card__body"><div class="my-content-card__title">' + item.title + '</div><div class="my-content-card__info"><span class="my-content-card__live-viewers">' + item.viewers + '人观看</span></div></div></div>';
    }).join('');
  }

  function setActiveTab(root, tab, ctx) {
    var tabs = root.querySelectorAll('.wg-tabs__item');
    tabs.forEach(function (t) {
      var domId = t.getAttribute('data-dom-id');
      var isActive = domId === 'tab-' + tab;
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    if (ctx && ctx.updateTabsIndicator) {
      var tabsRoot = root.querySelector('.wg-tabs');
      if (tabsRoot) ctx.updateTabsIndicator(tabsRoot);
    }
  }

  function buildAlbumSheetTemplate(state) {
    var albums = state.albums;
    var currentAlbumId = state.currentAlbumId;
    var items = albums.map(function (album) {
      var selected = album.id === currentAlbumId;
      return '<div class="actionsheet__item' + (selected ? ' actionsheet__item--selected' : '') + '" data-album-id="' + album.id + '"><div class="actionsheet__item-row"><div class="actionsheet__item-main"><div class="actionsheet__item-title">' + album.name + '</div></div><div class="actionsheet__item-check-slot"><i class="wego-iconfont-s icon-gou-jiacu actionsheet__item-check"></i></div></div></div>';
    }).join('');
    return '<div class="actionsheet actionsheet--select" role="dialog" aria-modal="true" data-state="closed"><div class="actionsheet__panel"><div class="actionsheet__header actionsheet__header--text"><div class="actionsheet__header-text">切换相册</div></div><div class="actionsheet__list">' + items + '</div><div class="actionsheet__cancel-gap"></div><div class="actionsheet__cancel">取消</div></div></div>';
  }

  function openAlbumSheet(ctx, state) {
    ctx.openSheet(buildAlbumSheetTemplate(state), {
      init: function (overlayCtx) {
        var overlayRoot = overlayCtx.root;
        var cancelBtn = overlayRoot.querySelector('.actionsheet__cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', function () { overlayCtx.close(); });
        var items = overlayRoot.querySelectorAll('.actionsheet__item');
        items.forEach(function (item) {
          item.addEventListener('click', function () {
            var albumId = item.getAttribute('data-album-id');
            var album = state.albums.find(function (a) { return a.id === albumId; });
            if (album) {
              state.currentAlbumId = album.id;
              var albumEl = ctx.root.querySelector('.my-nav-profile__album');
              if (albumEl) albumEl.textContent = album.name;
              ctx.toast('已切换到 ' + album.name);
            }
            overlayCtx.close();
          });
        });
      }
    });
  }

  function buildPublishModalTemplate() {
    return '<div class="modal modal--fullscreen" data-component-slug="modal" role="dialog" aria-modal="true" data-state="open"><div class="modal__panel"><div class="modal__title modal__title--default"><div class="navbar" data-component-slug="navbar"><div class="navbar__body navbar__body--spaced"><div class="navbar__left"><div class="navbar__left-btn navbar__left-btn--circle" data-dom-id="publish-close"><i class="wego-iconfont-s icon-xiajiantou16"></i></div></div><div class="navbar__center"><span class="navbar__title">发布</span></div><div class="navbar__right navbar__right--button" data-publish-action-slot></div></div></div></div><div class="modal__body modal__body--safe-bottom"><div class="my-publish-step" data-publish-step="select"><div class="my-publish-types"><button class="my-publish-type" type="button" data-dom-id="publish-type-product"><div class="my-publish-type__icon"><i class="wego-iconfont-s icon-fabushangpin"></i></div><span class="my-publish-type__label">发布产品</span></button><button class="my-publish-type" type="button" data-dom-id="publish-type-note"><div class="my-publish-type__icon"><i class="wego-iconfont-s icon-fabubiji"></i></div><span class="my-publish-type__label">发布笔记</span></button><button class="my-publish-type" type="button" data-dom-id="publish-type-live"><div class="my-publish-type__icon"><i class="wego-iconfont-s icon-zhibo"></i></div><span class="my-publish-type__label">创建直播</span></button></div></div><div class="my-publish-step" data-publish-step="form" hidden></div></div></div></div>';
  }

  function buildPublishFormTemplate(type) {
    var titleLabel = type === 'live' ? '直播标题' : '标题';
    var fields = '<div class="form-group"><div class="form-group__content form-group__content--card"><div class="form-body"><div class="form-body__label form-body__label--required"><span class="form-body__label-text">' + titleLabel + '</span><span class="form-body__required">*</span></div><div class="form-body__action"><input type="text" placeholder="请输入' + titleLabel + '" data-publish-field="title"></div></div>';
    if (type === 'product') {
      fields += '<div class="form-body form-body--preserve-content-align"><div class="form-body__label form-body__label--required"><span class="form-body__label-text">价格</span><span class="form-body__required">*</span></div><div class="form-body__action"><div class="form-body__money"><span class="form-body__money-symbol has-value">¥</span><input class="form-body__money-input" type="text" inputmode="decimal" placeholder="0.00" data-publish-field="price"></div></div></div>';
    } else if (type === 'note') {
      fields += '<div class="form-body form-body--vertical form-body--fixed-height"><div class="form-body__label">内容</div><div class="form-body__action"><textarea rows="4" placeholder="分享你的想法..." data-publish-field="content"></textarea></div></div>';
    } else {
      fields += '<div class="form-body"><div class="form-body__label">直播主题</div><div class="form-body__action"><input type="text" placeholder="请输入直播主题" data-publish-field="topic"></input></div></div>';
    }
    fields += '</div></div>';
    return fields;
  }

  function bindPublishModal(root, ctx, state) {
    var closeBtn = root.querySelector('[data-dom-id="publish-close"]');
    if (closeBtn) closeBtn.addEventListener('click', function () { ctx.closeOverlay(); });

    var types = root.querySelectorAll('[data-publish-step="select"] .my-publish-type');
    types.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var type = btn.getAttribute('data-dom-id').replace('publish-type-', '');
        showPublishForm(root, ctx, state, type);
      });
    });
  }

  function showPublishForm(root, ctx, state, type) {
    var selectStep = root.querySelector('[data-publish-step="select"]');
    var formStep = root.querySelector('[data-publish-step="form"]');
    var titleEl = root.querySelector('.navbar__title');
    var actionSlot = root.querySelector('[data-publish-action-slot]');
    if (selectStep) selectStep.hidden = true;
    if (formStep) {
      formStep.hidden = false;
      formStep.innerHTML = buildPublishFormTemplate(type);
    }
    if (titleEl) titleEl.textContent = type === 'product' ? '发布产品' : type === 'note' ? '发布笔记' : '创建直播';
    if (actionSlot) {
      actionSlot.innerHTML = '<div class="navbar__action navbar__action--button"><button class="btn btn--strong btn--sm" type="button" data-dom-id="publish-submit">发布</button></div>';
      var submitBtn = actionSlot.querySelector('[data-dom-id="publish-submit"]');
      if (submitBtn) submitBtn.addEventListener('click', function () {
        handlePublish(root, ctx, state, type);
      });
    }
  }

  function handlePublish(root, ctx, state, type) {
    var titleInput = root.querySelector('[data-publish-field="title"]');
    var title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      ctx.toast('请输入标题');
      return;
    }
    var db = window.WEGO_PROTOTYPE_DB || {};
    var defaultCover = db.products && db.products[0] && db.products[0].image_list && db.products[0].image_list[0];
    var newItem;
    if (type === 'product') {
      var priceInput = root.querySelector('[data-publish-field="price"]');
      var price = parseFloat(priceInput ? priceInput.value : '0') || 0;
      newItem = { id: 'new-prod-' + Date.now(), title: title, price: price, cover: defaultCover };
    } else if (type === 'note') {
      newItem = { id: 'new-note-' + Date.now(), title: title, cover: defaultCover };
    } else {
      newItem = { id: 'new-live-' + Date.now(), title: title, cover: defaultCover, status: '预告', viewers: 0 };
    }
    state.lists[type].unshift(newItem);
    state.activeTab = type;
    ctx.closeOverlay();
    ctx.toast('发布成功');
    setActiveTab(ctx.root, type, ctx);
    renderContent(ctx.root, state);
  }

  window.WegoApp.registerScene({
    routeId: 'personal-center',
    template: sceneTemplate,
    presentation: { type: 'host-tab' },
    init(ctx) {
      var root = ctx.root;
      var state = ctx.state;
      var db = window.WEGO_PROTOTYPE_DB || {};
      var currentUser = db.currentUser || {};

      state.albums = state.albums || getAlbums();
      state.currentAlbumId = state.currentAlbumId || 'album-all';
      state.activeTab = state.activeTab || 'product';
      state.lists = state.lists || {
        product: collectProducts(db),
        note: collectNotes(db),
        live: collectLives(db)
      };

      renderNavProfile(root, currentUser, state);
      renderAssets(root);
      renderApps(root);
      renderContent(root, state);
      setActiveTab(root, state.activeTab, ctx);

      // 绑定 tabs 运行时（指示条自动跟随选中项 + resize/scroll 维护）
      if (ctx.bindTabs) {
        ctx.bindTabs();
      }

      // 类型 tab 绑定
      var tabProductBtn = root.querySelector('[data-dom-id="tab-product"]');
      if (tabProductBtn) tabProductBtn.addEventListener('click', function () {
        state.activeTab = 'product';
        setActiveTab(root, 'product', ctx);
        renderContent(root, state);
      });
      var tabNoteBtn = root.querySelector('[data-dom-id="tab-note"]');
      if (tabNoteBtn) tabNoteBtn.addEventListener('click', function () {
        state.activeTab = 'note';
        setActiveTab(root, 'note', ctx);
        renderContent(root, state);
      });
      var tabLiveBtn = root.querySelector('[data-dom-id="tab-live"]');
      if (tabLiveBtn) tabLiveBtn.addEventListener('click', function () {
        state.activeTab = 'live';
        setActiveTab(root, 'live', ctx);
        renderContent(root, state);
      });

      // 个人信息相册切换入口
      var navProfileEl = root.querySelector('[data-dom-id="nav-profile"]');
      if (navProfileEl) navProfileEl.addEventListener('click', function () { openAlbumSheet(ctx, state); });

      // FAB 发布绑定
      var fab = root.querySelector('[data-dom-id="fab-publish"]');
      if (fab) fab.addEventListener('click', function () {
        ctx.openFullScreenModal(buildPublishModalTemplate(), {
          init: function (overlayCtx) {
            var overlayRoot = (overlayCtx && overlayCtx.root) || overlayCtx;
            bindPublishModal(overlayRoot, ctx, state);
          }
        });
      });

      // stub 入口绑定
      var navSettingsEl = root.querySelector('[data-dom-id="nav-settings"]');
      if (navSettingsEl) navSettingsEl.addEventListener('click', function () { ctx.toast('功能开发中'); });
      var navShareEl = root.querySelector('[data-dom-id="nav-share"]');
      if (navShareEl) navShareEl.addEventListener('click', function () { ctx.toast('功能开发中'); });
      var membershipEl = root.querySelector('[data-dom-id="membership"]');
      if (membershipEl) membershipEl.addEventListener('click', function () { ctx.toast('功能开发中'); });

      // 数据资产 9 入口 stub
      getAssetItems().forEach(function (item) {
        var el = root.querySelector('[data-dom-id="' + item.id + '"]');
        if (el) el.addEventListener('click', function () { ctx.toast('功能开发中'); });
      });

      // 常用应用入口 stub
      getAppItems().forEach(function (item) {
        var el = root.querySelector('[data-dom-id="' + item.id + '"]');
        if (el) el.addEventListener('click', function () { ctx.toast('功能开发中'); });
      });

      // 列表项点击可见反馈（stub，不下钻）
      root.querySelectorAll('.my-content-card').forEach(function (card) {
        card.addEventListener('click', function () { ctx.toast('查看内容'); });
      });

      // 滚动布局绑定（FAB 进入 fixedRegions）
      if (ctx.bindScrollLayout) {
        ctx.bindScrollLayout({ fixedRegions: [{ selector: '.my-fab' }] });
      }
    }
  });
})();
