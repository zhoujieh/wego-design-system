(function enhanceDynamicFeed() {
  function createStackTab(label, filter, isSelected, badgeText) {
    return ''
      + '<span class="dynamic-feed-tab-item" role="presentation">'
      +   '<button type="button" class="stack dynamic-feed-tab' + (isSelected ? ' stack--selected' : '') + '" role="tab" aria-selected="' + (isSelected ? 'true' : 'false') + '" data-feed-filter="' + filter + '">'
      +     '<span class="stack__bg">'
      +       '<span class="stack__label">' + label + '</span>'
      +       '<span class="stack__check-corner" aria-hidden="true"><i class="wego-iconfont-s icon-gou16 stack__check-icon"></i></span>'
      +     '</span>'
      +   '</button>'
      +   (badgeText ? '<span class="badge badge--dot dynamic-feed-tab__badge">' + badgeText + '</span>' : '')
      + '</span>';
  }

  function createToolbar() {
    var panel = document.querySelector('[data-host-tab="dongtai"]');
    var navbar = panel && panel.querySelector('.host-dongtai-navbar');
    if (!panel || !navbar || navbar.dataset.feedToolbar === 'true') return;

    // 演示用:首次访问动态 Tab 且无产品时,注入 3 条模拟数据以呈现列表布局。
    // 真实环境由发布流程写入;此分支不污染已有数据(内部判空)。
    if (window.WegoProducts && typeof window.WegoProducts.seedDemoProducts === 'function') {
      if (window.WegoProducts.seedDemoProducts() && typeof window.WegoProducts.render === 'function') {
        window.WegoProducts.render();
      }
    }

    navbar.dataset.feedToolbar = 'true';
    navbar.innerHTML = ''
      + '<div class="navbar__body dynamic-feed-navbar__body">'
      +   '<div class="navbar__left dynamic-feed-navbar__left">'
      +     '<button type="button" class="host-dongtai-navbar__vip dynamic-feed-vip" data-vip-level="vip" aria-label="VIP" data-content-id="vip-entry">'
      +       '<img src="./lib/icons/icon-dongtai-vip.svg" alt="" />'
      +     '</button>'
      +   '</div>'
      +   '<div class="navbar__center dynamic-feed-navbar__center"></div>'
      +   '<div class="navbar__right navbar__right--icon dynamic-feed-navbar__right">'
      +     '<div class="navbar__action dynamic-feed-publish-action">'
      +       '<button type="button" class="btn btn--strong btn--sm btn--icon-only dynamic-feed-publish" aria-label="发布产品" data-content-id="publish-entry"><span aria-hidden="true">+</span></button>'
      +     '</div>'
      +   '</div>'
      + '</div>'
      + '<div class="dynamic-feed-tabs" role="tablist" aria-label="动态筛选" data-content-id="filter-tabs">'
      +   createStackTab('全部', 'all', true, '')
      +   createStackTab('上新', 'new', false, '1')
      + '</div>';

    var vip = navbar.querySelector('.dynamic-feed-vip');
    if (vip) vip.addEventListener('click', function () {
      if (window.WegoApp && typeof window.WegoApp.toast === 'function') {
        window.WegoApp.toast('会员功能开发中');
      }
    });

    var publish = navbar.querySelector('.dynamic-feed-publish');
    if (publish) publish.addEventListener('click', function () {
      // products.js 与 dynamic-feed.js 均由 routes.js 动态 async 插入，加载顺序不确定。
      // WegoProducts 就绪时用 startCreate（保留重置 editingProductId 的“新建”语义）；
      // 否则回退 WegoApp.navigate：此路径下 editingProductId 不可能被设过（仅 products.js
      // 的 startEdit 会设，而 startEdit 同样依赖 products.js），故 state 必然干净，直接导航安全。
      if (window.WegoProducts && typeof window.WegoProducts.startCreate === 'function') {
        window.WegoProducts.startCreate();
      } else if (window.WegoApp && typeof window.WegoApp.navigate === 'function') {
        window.WegoApp.navigate('quick-publish-product');
      }
    });

    navbar.querySelectorAll('.dynamic-feed-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        navbar.querySelectorAll('.dynamic-feed-tab').forEach(function (item) {
          var active = item === tab;
          item.classList.toggle('stack--selected', active);
          item.setAttribute('aria-selected', active ? 'true' : 'false');
        });
      });
    });
  }

  function createGallery() {
    var gallery = document.createElement('div');
    gallery.className = 'dynamic-feed-gallery dynamic-feed-gallery--9';
    gallery.setAttribute('aria-label', '产品图片九宫格');
    for (var i = 0; i < 9; i++) {
      var item = document.createElement('div');
      item.className = 'dynamic-feed-gallery__item';
      item.innerHTML = '<div class="wg-image wg-image--rounded-md wg-image--loading"><div class="wg-image__src"></div></div>';
      gallery.appendChild(item);
    }
    return gallery;
  }

  function createSummary(title, price) {
    var summary = document.createElement('section');
    summary.className = 'card card--filled dynamic-product-summary';

    var content = document.createElement('div');
    content.className = 'card__content dynamic-product-summary__content';

    var media = document.createElement('div');
    media.className = 'dynamic-product-summary__media';
    media.textContent = (title.textContent || '商').slice(0, 1);

    var body = document.createElement('div');
    body.className = 'dynamic-product-summary__body';

    var summaryTitle = document.createElement('p');
    summaryTitle.className = 'dynamic-product-summary__title';
    summaryTitle.textContent = title.textContent;
    body.appendChild(summaryTitle);

    if (price) {
      price.className = 'dynamic-product-summary__price';
      body.appendChild(price);
    }

    var action = document.createElement('button');
    action.type = 'button';
    action.className = 'btn btn--weak btn--sm dynamic-product-summary__action';
    action.textContent = '开单';
    action.addEventListener('click', function (event) { event.stopPropagation(); });

    content.appendChild(media);
    content.appendChild(body);
    content.appendChild(action);
    summary.appendChild(content);
    summary.setAttribute('data-content-id', 'feed-item-summary');
    return summary;
  }

  function createInfo(meta) {
    if (!meta) return null;
    var values = Array.from(meta.querySelectorAll('.dynamic-product-card__summary')).map(function (item) {
      return item.textContent.trim();
    }).filter(Boolean);

    var info = document.createElement('section');
    info.className = 'card card--filled dynamic-product-info';
    var content = document.createElement('div');
    content.className = 'card__content dynamic-product-info__content';

    values.forEach(function (value) {
      var line = document.createElement('p');
      line.className = 'dynamic-product-info__line';
      line.textContent = value;
      content.appendChild(line);
    });

    if (!values.length) {
      var line = document.createElement('p');
      line.className = 'dynamic-product-info__line';
      line.textContent = '产品信息';
      content.appendChild(line);
    }

    info.appendChild(content);
    info.setAttribute('data-content-id', 'feed-item-info');
    return info;
  }

  function createActions(card) {
    var actions = document.createElement('div');
    actions.className = 'dynamic-feed-actions';
    actions.setAttribute('data-content-id', 'feed-item-actions');
    ['删除', '下架', '刷新', '置顶', '编辑'].forEach(function (label) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'link link--12 dynamic-feed-actions__item';
      button.textContent = label;
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        if (window.WegoApp && typeof window.WegoApp.toast === 'function') {
          window.WegoApp.toast('功能开发中');
        }
      });
      actions.appendChild(button);
    });

    // 帮卖按钮：操作行最右侧，复用既有 link standalone 12px 变体，点击拉起加价卖 sheet
    var resaleButton = document.createElement('button');
    resaleButton.type = 'button';
    resaleButton.className = 'link link--12 dynamic-feed-actions__item';
    resaleButton.textContent = '帮卖';
    resaleButton.setAttribute('data-content-id', 'feed-item-resale-action');
    resaleButton.addEventListener('click', function (event) {
      event.stopPropagation();
      openResaleSheet(card);
    });
    actions.appendChild(resaleButton);

    return actions;
  }

  // 帮卖弹窗：使用 modal 组件（frame 变体），支持自由定价和固定佣金两种模式
  function openResaleSheet(card, mode) {
    mode = mode || 'free'; // 'free' = 自由定价(加价卖), 'fixed' = 固定佣金(赚佣金)
    var isFreeMode = mode === 'free';

    var existing = document.querySelector('.dynamic-resale-sheet__modal');
    if (existing) existing.remove();

    // 解析商品供货价；读取失败时使用模拟默认值 ¥100
    var supplyPrice = 100;
    if (card) {
      var priceEl = card.querySelector('.dynamic-product-card__price');
      if (priceEl) {
        var parsed = parseInt(priceEl.textContent.replace(/[^\d]/g, ''), 10);
        if (!isNaN(parsed) && parsed > 0) supplyPrice = parsed;
      }
    }

    var RECOMMEND_RATE = 0.30;
    var QUICK_RATE = 0.20;
    var recommendRatePercent = (RECOMMEND_RATE * 100).toFixed(0);
    var quickRatePercent = (QUICK_RATE * 100).toFixed(0);
    var fixedRate = 0.30;

    // === modal 容器（frame 变体，底部弹出）===
    var modal = document.createElement('div');
    modal.className = 'modal modal--frame modal--has-actions dynamic-resale-sheet__modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('data-state', 'closed'); // 初始为关闭态，触发入场动画
    modal.setAttribute('data-surface-id', 'resale-sheet');
    modal.setAttribute('data-resale-mode', mode);

    var panel = document.createElement('div');
    panel.className = 'modal__panel';

    // === 标题栏：NavBar 风格（default 模式）===
    var titleBar = document.createElement('div');
    titleBar.className = 'modal__title modal__title--default';
    titleBar.setAttribute('data-content-id', 'resale-sheet-header');
    titleBar.innerHTML = ''
      + '<div class="navbar">'
      +   '<div class="navbar__body">' // navbar 组件契约要求 body 包装层
      +     '<div class="navbar__left">'
      +       '<button type="button" class="navbar__left-btn navbar__left-btn--circle" aria-label="收起">'
      +         '<i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i>'
      +       '</button>'
      +     '</div>'
      +     '<div class="navbar__center">'
      +       '<span class="navbar__title">' + (isFreeMode ? '加价卖' : '赚佣金') + '</span>'
      +     '</div>'
      +     '<div class="navbar__right">'
      +       '<a class="link" href="https://mp.weixin.qq.com/s/H05MjX1OTmng8nXVl3GXrQ" target="_blank" rel="noopener noreferrer" aria-label="帮卖说明">'
      +         '<i class="wego-iconfont-s icon-bangzhu" aria-hidden="true"></i>'
      +       '</a>'
      +     '</div>'
      +   '</div>'
      + '</div>';

    // === body 内容 ===
    var body = document.createElement('div');
    body.className = 'modal__body';

    // 1. 编辑区：先完成输入，再紧邻展示计算结果
    var numberInput, field, fieldError;
    if (isFreeMode) {
      var formGroup = document.createElement('div');
      formGroup.className = 'form-group dynamic-resale-sheet__form-group';
      formGroup.setAttribute('data-content-id', 'resale-price-input');
      formGroup.innerHTML = ''
        + '<div class="form-group__content">'
        +   '<div class="dynamic-resale-sheet__editor-heading">'
        +     '<label class="dynamic-resale-sheet__editor-label" for="resale-markup-rate">加价比例</label>'
        +     '<span class="dynamic-resale-sheet__supply" data-content-id="resale-supply-price">供货价 ¥' + supplyPrice + '</span>'
        +   '</div>'
        +   '<div class="dynamic-resale-sheet__editor-control">'
        +     '<div class="form-body__action">'
        +       '<div class="number-input">'
        +         '<input id="resale-markup-rate" type="text" inputmode="decimal" enterkeyhint="done" class="number-input__field" value="' + recommendRatePercent + '" aria-describedby="resale-rate-error" />'
        +         '<span class="number-input__suffix">%</span>'
        +       '</div>'
        +     '</div>'
        +   '</div>'
        + '</div>';

      // 错误提示（放入 form-group 内部，配合 .form-group.is-error 显示）
      fieldError = document.createElement('div');
      fieldError.className = 'field-error dynamic-resale-sheet__field-error';
      fieldError.id = 'resale-rate-error';
      fieldError.setAttribute('role', 'alert');
      formGroup.appendChild(fieldError);

      body.appendChild(formGroup);

      numberInput = formGroup.querySelector('.number-input');
      field = formGroup.querySelector('.number-input__field');
    }

    // 2. 快捷加价紧跟输入，作为同一编辑任务的预设值
    var recommendCard, quickBtn;
    if (isFreeMode) {
      var quickOptions = document.createElement('div');
      quickOptions.className = 'dynamic-resale-sheet__quick-options';
      quickOptions.setAttribute('data-content-id', 'resale-quick-markup');
      quickOptions.innerHTML = ''
        + '<span class="dynamic-resale-sheet__quick-label">快捷选择</span>'
        + '<button type="button" class="btn btn--weak btn--sm is-selected dynamic-resale-sheet__recommend-btn" aria-pressed="true">推荐 +' + recommendRatePercent + '%</button>'
        + '<button type="button" class="btn btn--weak btn--sm dynamic-resale-sheet__quick-btn" aria-pressed="false">+' + quickRatePercent + '%</button>';
      body.appendChild(quickOptions);

      recommendCard = quickOptions.querySelector('.dynamic-resale-sheet__recommend-btn');
      quickBtn = quickOptions.querySelector('.dynamic-resale-sheet__quick-btn');
    }

    // 3. 结果区：把因输入变化的输出聚合展示，减少三行信息的往返扫视
    var priceSummary = document.createElement('div');
    priceSummary.className = 'dynamic-resale-sheet__summary' + (isFreeMode ? '' : ' dynamic-resale-sheet__summary--triple');
    priceSummary.setAttribute('aria-live', 'polite');
    priceSummary.innerHTML = ''
      + (!isFreeMode
        ? '<div class="dynamic-resale-sheet__summary-item" data-content-id="resale-supply-price"><span class="dynamic-resale-sheet__summary-label">供货价</span><strong class="dynamic-resale-sheet__summary-value">¥' + supplyPrice + '</strong></div>'
        : '')
      + '<div class="dynamic-resale-sheet__summary-item" data-content-id="resale-display-price"><span class="dynamic-resale-sheet__summary-label">我的售价</span><strong class="dynamic-resale-sheet__summary-value dynamic-resale-sheet__display-price">¥' + Math.round(supplyPrice * (1 + (isFreeMode ? RECOMMEND_RATE : fixedRate))) + '</strong></div>'
      + '<div class="dynamic-resale-sheet__summary-item dynamic-resale-sheet__summary-item--income" data-content-id="resale-display-commission"><span class="dynamic-resale-sheet__summary-label">预计佣金</span><strong class="dynamic-resale-sheet__summary-value dynamic-resale-sheet__commission-text">¥' + Math.round(supplyPrice * (isFreeMode ? RECOMMEND_RATE : fixedRate)) + '</strong></div>';
    body.appendChild(priceSummary);

    // 4. 底部说明
    var bottomNote = document.createElement('div');
    bottomNote.className = 'dynamic-resale-sheet__note';
    bottomNote.setAttribute('data-content-id', 'resale-bottom-note');
    bottomNote.textContent = '帮卖佣金仅自己可见，可放心分享';
    body.appendChild(bottomNote);

    // === actions 区：渐变蒙层 + 单按钮 ===
    var actions = document.createElement('div');
    actions.className = 'modal__actions';
    actions.innerHTML = ''
      + '<div class="modal__action-gradient"></div>' // 40px 渐变蒙层
      + '<div class="modal__action--single-h" data-content-id="resale-submit-action">'
      +   '<button type="button" class="btn btn--strong btn--lg dynamic-resale-sheet__submit-btn">保存和分享</button>'
      + '</div>';

    panel.appendChild(titleBar);
    panel.appendChild(body);
    panel.appendChild(actions);
    modal.appendChild(panel);

    var phoneScreen = document.querySelector('.phone-screen') || document.body;
    phoneScreen.appendChild(modal);

    // 触发入场动画：双 rAF 确保 DOM 渲染完成后再切换状态
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        modal.setAttribute('data-state', 'open');
      });
    });

    var submitBtn = actions.querySelector('.dynamic-resale-sheet__submit-btn');
    var displayPriceEl = priceSummary.querySelector('.dynamic-resale-sheet__display-price');
    var displayCommissionEl = priceSummary.querySelector('.dynamic-resale-sheet__commission-text');

    // 计算我的售价和佣金
    function calculateValues(ratePercent) {
      var rate = parseFloat(ratePercent) / 100;
      if (isNaN(rate) || rate < 0) rate = 0;
      var salePrice = Math.round(supplyPrice * (1 + rate));
      var commission = salePrice - supplyPrice;
      return { salePrice: salePrice, commission: commission };
    }

    // 更新展示值
    function updateDisplays(ratePercent) {
      var vals = calculateValues(ratePercent);
      displayPriceEl.textContent = '¥' + vals.salePrice;
      displayCommissionEl.textContent = '¥' + vals.commission;
      return vals;
    }

    // 校验比例输入
    function validateRate(value) {
      if (!value && value !== '0') return { valid: false, msg: '请输入加价比例' };
      if (!/^\d+(\.\d{0,2})?$/.test(value)) return { valid: false, msg: '仅支持数字，最多2位小数' };
      var num = parseFloat(value);
      if (num < 1) return { valid: false, msg: '佣金比例不能小于 1%' };
      if (num > 300) return { valid: false, msg: '佣金比例不能大于 300%' };
      return { valid: true, num: num };
    }

    // 自由定价模式：实时校验与更新
    function updateFreeMode() {
      var value = field.value.trim();
      var result = validateRate(value);
      if (result.valid) {
        numberInput.classList.remove('is-error');
        formGroup.classList.remove('is-error');
        field.setAttribute('aria-invalid', 'false');
        fieldError.textContent = '';
        updateDisplays(result.num);
        submitBtn.classList.remove('btn--disabled');
        submitBtn.disabled = false;
      } else {
        numberInput.classList.add('is-error');
        formGroup.classList.add('is-error');
        field.setAttribute('aria-invalid', 'true');
        fieldError.textContent = result.msg;
        updateDisplays(value);
        submitBtn.classList.add('btn--disabled');
        submitBtn.disabled = true;
      }
    }

    // 固定佣金模式：只读展示
    function updateFixedMode() {
      updateDisplays(fixedRate * 100);
    }

    function setRate(percent) {
      field.value = String(percent);
      updateFreeMode();
    }

    if (isFreeMode) {
      // 输入实时校验与更新
      field.addEventListener('input', function () {
        var val = field.value;
        var cleaned = val.replace(/[^\d.]/g, '');
        var parts = cleaned.split('.');
        if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('');
        if (parts.length === 2 && parts[1].length > 2) cleaned = parts[0] + '.' + parts[1].slice(0, 2);
        if (cleaned !== val) field.value = cleaned;

        if (recommendCard) {
          recommendCard.classList.remove('is-selected');
          recommendCard.setAttribute('aria-pressed', 'false');
        }
        if (quickBtn) {
          quickBtn.classList.remove('is-selected');
          quickBtn.setAttribute('aria-pressed', 'false');
        }
        updateFreeMode();
      });
      field.addEventListener('focus', function () { numberInput.classList.add('is-focus'); });
      field.addEventListener('blur', function () { numberInput.classList.remove('is-focus'); });
      field.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') field.blur();
      });

      // 推荐加价按钮
      recommendCard.addEventListener('click', function () {
        recommendCard.classList.add('is-selected');
        recommendCard.setAttribute('aria-pressed', 'true');
        quickBtn.classList.remove('is-selected');
        quickBtn.setAttribute('aria-pressed', 'false');
        setRate(recommendRatePercent);
      });

      // 快捷按钮 +20%
      quickBtn.addEventListener('click', function () {
        quickBtn.classList.add('is-selected');
        quickBtn.setAttribute('aria-pressed', 'true');
        recommendCard.classList.remove('is-selected');
        recommendCard.setAttribute('aria-pressed', 'false');
        setRate(quickRatePercent);
      });

      // 初始化
      updateFreeMode();
    } else {
      updateFixedMode();
    }

    // 关闭逻辑
    function closeSheet() {
      modal.setAttribute('data-state', 'closed');
      setTimeout(function () {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      }, 300); // 与 modal CSS 动画时长一致
    }

    var closeBtn = titleBar.querySelector('.navbar__left-btn');
    closeBtn.addEventListener('click', closeSheet);
    modal.addEventListener('click', function (event) {
      if (event.target === modal) closeSheet();
    });

    // 保存和分享：stub 反馈
    submitBtn.addEventListener('click', function () {
      if (submitBtn.disabled) return;
      closeSheet();
      if (window.WegoApp && typeof window.WegoApp.toast === 'function') {
        window.WegoApp.toast('已保存帮卖配置，进入分享');
      }
    });
  }

  function enhanceCard(card) {
    if (!card || card.dataset.feedEnhanced === 'true') return;
    var content = card.querySelector('.dynamic-product-card__content');
    var media = card.querySelector('.dynamic-product-card__media');
    var main = card.querySelector('.dynamic-product-card__main');
    var primary = card.querySelector('.dynamic-product-card__primary');
    var title = card.querySelector('.dynamic-product-card__title');
    var price = card.querySelector('.dynamic-product-card__price');
    var meta = card.querySelector('.dynamic-product-card__meta');
    if (!content || !media || !main || !primary || !title) return;

    card.dataset.feedEnhanced = 'true';
    card.classList.add('dynamic-feed-item');
    card.setAttribute('data-surface-id', 'dynamic-feed-main');

    media.className = 'avatar avatar--40 avatar--image dynamic-feed-item__avatar';
    media.setAttribute('data-content-id', 'feed-item-identity');
    media.innerHTML = '<img src="./lib/image/avatar-defult.png" alt="">';

    var header = document.createElement('div');
    header.className = 'dynamic-feed-item__header';
    header.innerHTML = ''
      + '<div class="dynamic-feed-item__identity">'
      +   '<strong class="dynamic-feed-item__name">微购相册 · 用户体验设计师</strong>'
      +   '<div class="dynamic-feed-item__subline"><span>1分钟前</span><span>◉</span><span>来源</span></div>'
      + '</div>';
    main.insertBefore(header, primary);

    var titleNode = document.createElement('div');
    titleNode.className = 'dynamic-feed-item__title-wrap';
    titleNode.setAttribute('data-content-id', 'feed-item-title');
    titleNode.appendChild(title);
    primary.insertBefore(titleNode, primary.firstChild);

    var gallery = createGallery();
    gallery.setAttribute('data-content-id', 'feed-item-gallery');
    primary.appendChild(gallery);
    main.insertBefore(createSummary(title, price), meta || null);

    var info = createInfo(meta);
    if (info) main.insertBefore(info, meta || null);
    if (meta) meta.remove();

    main.appendChild(createActions(card));
  }

  function enhanceAll() {
    createToolbar();
    document.querySelectorAll('.dynamic-product-card').forEach(enhanceCard);
  }

  var observer = new MutationObserver(enhanceAll);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  enhanceAll();
})();
