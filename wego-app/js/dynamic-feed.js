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

  // 加价卖半弹窗：场景级自写容器，待 modal 组件上线后迁移
  function openResaleSheet(card) {
    var existing = document.querySelector('.dynamic-resale-sheet__overlay');
    if (existing) existing.remove();

    // 解析商品售价；读取失败时使用模拟默认值 ¥20
    var productPrice = 20;
    if (card) {
      var priceEl = card.querySelector('.dynamic-product-card__price');
      if (priceEl) {
        var parsed = parseInt(priceEl.textContent.replace(/[^\d]/g, ''), 10);
        if (!isNaN(parsed) && parsed > 0) productPrice = parsed;
      }
    }

    var RECOMMEND_RATE = 0.30;
    var QUICK_RATE = 0.20;
    var recommendPrice = Math.round(productPrice * (1 + RECOMMEND_RATE));
    var quickPrice = Math.round(productPrice * (1 + QUICK_RATE));
    var maxPrice = productPrice * 10;

    var overlay = document.createElement('div');
    overlay.className = 'dynamic-resale-sheet__overlay';
    overlay.setAttribute('data-surface-id', 'resale-sheet');

    var panel = document.createElement('div');
    panel.className = 'dynamic-resale-sheet__panel';

    // sheet 头部：左关闭X + 标题 + 右帮助入口?
    var header = document.createElement('div');
    header.className = 'dynamic-resale-sheet__header';
    header.setAttribute('data-content-id', 'resale-sheet-header');
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'dynamic-resale-sheet__close';
    closeBtn.setAttribute('aria-label', '关闭');
    closeBtn.innerHTML = '<i class="wego-iconfont-s icon-guanbi" aria-hidden="true"></i>';
    var title = document.createElement('h2');
    title.className = 'dynamic-resale-sheet__title';
    title.textContent = '加价卖';
    var helpEntry = document.createElement('a');
    helpEntry.className = 'link dynamic-resale-sheet__help';
    helpEntry.href = 'https://mp.weixin.qq.com/s/H05MjX1OTmng8nXVl3GXrQ';
    helpEntry.target = '_blank';
    helpEntry.rel = 'noopener noreferrer';
    helpEntry.setAttribute('aria-label', '加价卖说明');
    helpEntry.innerHTML = '<i class="wego-iconfont-s icon-wenhao" aria-hidden="true"></i>';
    header.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(helpEntry);

    // 售价输入区 + 实时收益
    var priceSection = document.createElement('div');
    priceSection.className = 'dynamic-resale-sheet__price-section';
    priceSection.setAttribute('data-content-id', 'resale-price-input');

    var priceLabel = document.createElement('div');
    priceLabel.className = 'dynamic-resale-sheet__label';
    priceLabel.textContent = '我的售价';

    var numberInput = document.createElement('div');
    numberInput.className = 'number-input dynamic-resale-sheet__input';
    var field = document.createElement('input');
    field.type = 'text';
    field.inputMode = 'numeric';
    field.className = 'number-input__field';
    field.value = String(recommendPrice);
    field.setAttribute('aria-label', '我的售价');
    var suffix = document.createElement('span');
    suffix.className = 'number-input__suffix';
    suffix.textContent = '¥';
    numberInput.appendChild(field);
    numberInput.appendChild(suffix);

    var earnings = document.createElement('div');
    earnings.className = 'dynamic-resale-sheet__earnings';
    earnings.setAttribute('data-content-id', 'resale-earnings');

    var fieldError = document.createElement('div');
    fieldError.className = 'field-error dynamic-resale-sheet__field-error';

    priceSection.appendChild(priceLabel);
    priceSection.appendChild(numberInput);
    priceSection.appendChild(earnings);
    priceSection.appendChild(fieldError);

    // 快捷加价区
    var quickSection = document.createElement('div');
    quickSection.className = 'dynamic-resale-sheet__quick-markup';
    quickSection.setAttribute('data-content-id', 'resale-quick-markup');

    var recommendCard = document.createElement('button');
    recommendCard.type = 'button';
    recommendCard.className = 'dynamic-resale-sheet__recommend is-selected';
    recommendCard.innerHTML = ''
      + '<span class="dynamic-resale-sheet__recommend-text">可修改你的售价，赚更多</span>'
      + '<span class="dynamic-resale-sheet__recommend-rate">+' + (RECOMMEND_RATE * 100) + '%</span>';

    var quickRow = document.createElement('div');
    quickRow.className = 'dynamic-resale-sheet__quick-row';
    var quickBtn = document.createElement('button');
    quickBtn.type = 'button';
    quickBtn.className = 'btn btn--weak btn--sm dynamic-resale-sheet__quick-btn';
    quickBtn.textContent = '+' + (QUICK_RATE * 100) + '%';
    var manualEntry = document.createElement('button');
    manualEntry.type = 'button';
    manualEntry.className = 'link dynamic-resale-sheet__manual';
    manualEntry.textContent = '手动输入';
    quickRow.appendChild(quickBtn);
    quickRow.appendChild(manualEntry);

    quickSection.appendChild(recommendCard);
    quickSection.appendChild(quickRow);

    // 底部说明
    var bottomNote = document.createElement('div');
    bottomNote.className = 'dynamic-resale-sheet__bottom-note';
    bottomNote.setAttribute('data-content-id', 'resale-bottom-note');
    bottomNote.textContent = '帮卖佣金仅自己可见，可放心分享';

    // 主按钮
    var submitAction = document.createElement('div');
    submitAction.className = 'dynamic-resale-sheet__submit-action';
    submitAction.setAttribute('data-content-id', 'resale-submit-action');
    var submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.className = 'btn btn--strong btn--lg dynamic-resale-sheet__submit-btn';
    submitBtn.textContent = '帮卖并分享';
    submitAction.appendChild(submitBtn);

    // 可滚动内容区
    var body = document.createElement('div');
    body.className = 'dynamic-resale-sheet__body';
    body.appendChild(priceSection);
    body.appendChild(quickSection);
    body.appendChild(bottomNote);

    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(submitAction);
    overlay.appendChild(panel);

    var phoneScreen = document.querySelector('.phone-screen') || document.body;
    phoneScreen.appendChild(overlay);

    // 触发入场动画
    requestAnimationFrame(function () {
      overlay.classList.add('is-visible');
    });

    function validatePrice(value) {
      if (!value) return { valid: false, msg: '请输入售价' };
      if (!/^\d+$/.test(value)) return { valid: false, msg: '仅支持整数金额' };
      var num = parseInt(value, 10);
      if (num < productPrice) return { valid: false, msg: '不能低于商品售价 ¥' + productPrice };
      if (num > maxPrice) return { valid: false, msg: '不能超过 ¥' + maxPrice };
      return { valid: true, num: num };
    }

    function updateEarnings() {
      var value = field.value.trim();
      var result = validatePrice(value);
      if (result.valid) {
        numberInput.classList.remove('is-error');
        fieldError.textContent = '';
        earnings.textContent = '赚 ¥' + (result.num - productPrice);
        earnings.classList.remove('is-hidden');
        submitBtn.classList.remove('btn--disabled');
        submitBtn.disabled = false;
      } else {
        numberInput.classList.add('is-error');
        fieldError.textContent = result.msg;
        earnings.classList.add('is-hidden');
        submitBtn.classList.add('btn--disabled');
        submitBtn.disabled = true;
      }
    }

    function setPrice(num) {
      field.value = String(num);
      updateEarnings();
    }

    // 输入实时校验与收益更新
    field.addEventListener('input', function () {
      var cleaned = field.value.replace(/[^\d]/g, '');
      if (cleaned !== field.value) field.value = cleaned;
      recommendCard.classList.remove('is-selected');
      quickBtn.classList.remove('is-selected');
      updateEarnings();
    });
    field.addEventListener('focus', function () { numberInput.classList.add('is-focus'); });
    field.addEventListener('blur', function () { numberInput.classList.remove('is-focus'); });

    // 推荐加价卡
    recommendCard.addEventListener('click', function () {
      recommendCard.classList.add('is-selected');
      quickBtn.classList.remove('is-selected');
      setPrice(recommendPrice);
    });

    // 快捷按钮 +20%
    quickBtn.addEventListener('click', function () {
      quickBtn.classList.add('is-selected');
      recommendCard.classList.remove('is-selected');
      setPrice(quickPrice);
    });

    // 手动输入入口
    manualEntry.addEventListener('click', function () {
      recommendCard.classList.remove('is-selected');
      quickBtn.classList.remove('is-selected');
      field.focus();
    });

    // 关闭逻辑：左上角X + 点击遮罩；关闭后不保存未确认修改
    function closeSheet() {
      overlay.classList.add('is-closing');
      overlay.classList.remove('is-visible');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 250);
    }
    closeBtn.addEventListener('click', closeSheet);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeSheet();
    });

    // 帮卖并分享：本次 stub 反馈，toast 后关闭
    submitBtn.addEventListener('click', function () {
      if (submitBtn.disabled) return;
      closeSheet();
      if (window.WegoApp && typeof window.WegoApp.toast === 'function') {
        window.WegoApp.toast('已生成帮卖，进入分享');
      }
    });

    // 初始化收益显示
    updateEarnings();
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
