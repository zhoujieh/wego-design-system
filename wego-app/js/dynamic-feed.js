(function enhanceDynamicFeed() {
  function createToolbar() {
    var panel = document.querySelector('[data-host-tab="dongtai"]');
    var navbar = panel && panel.querySelector('.host-dongtai-navbar');
    if (!panel || !navbar || navbar.dataset.feedToolbar === 'true') return;

    navbar.dataset.feedToolbar = 'true';
    navbar.innerHTML = ''
      + '<div class="dynamic-feed-toolbar">'
      +   '<button type="button" class="dynamic-feed-search" aria-label="搜索产品">'
      +     '<i class="wego-iconfont-s icon-sousuo" aria-hidden="true"></i>'
      +     '<span>标题/搜索码/货号</span>'
      +     '<i class="wego-iconfont-s icon-tupian" aria-hidden="true"></i>'
      +   '</button>'
      +   '<button type="button" class="btn btn--strong dynamic-feed-publish" aria-label="发布产品">+</button>'
      + '</div>'
      + '<div class="dynamic-feed-tabs" role="tablist" aria-label="动态筛选">'
      +   '<button type="button" class="dynamic-feed-tab is-active" role="tab" aria-selected="true">全部</button>'
      +   '<button type="button" class="dynamic-feed-tab" role="tab" aria-selected="false">上新<span class="badge badge--dot dynamic-feed-tab__badge">1</span></button>'
      + '</div>';

    var publish = navbar.querySelector('.dynamic-feed-publish');
    if (publish) publish.addEventListener('click', function () { window.WegoProducts.startCreate(); });
  }

  function createGallery() {
    var gallery = document.createElement('div');
    gallery.className = 'dynamic-feed-gallery dynamic-feed-gallery--9';
    gallery.setAttribute('aria-label', '产品图片九宫格');
    for (var i = 0; i < 9; i++) {
      var item = document.createElement('span');
      item.className = 'dynamic-feed-gallery__item dynamic-feed-gallery__placeholder';
      item.innerHTML = '<i class="wego-iconfont-s icon-tupian" aria-hidden="true"></i>';
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
    return info;
  }

  function createActions() {
    var actions = document.createElement('div');
    actions.className = 'dynamic-feed-actions';
    ['删除', '下架', '刷新', '置顶', '编辑'].forEach(function (label) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'link link--default dynamic-feed-actions__item';
      button.textContent = label;
      button.addEventListener('click', function (event) { event.stopPropagation(); });
      actions.appendChild(button);
    });
    return actions;
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

    media.className = 'avatar avatar--40 avatar--image dynamic-feed-item__avatar';
    media.innerHTML = '<img src="./lib/image/avatar-defult.png" alt="">';

    var header = document.createElement('div');
    header.className = 'dynamic-feed-item__header';
    header.innerHTML = ''
      + '<div class="dynamic-feed-item__identity">'
      +   '<strong class="dynamic-feed-item__name">微购相册 · 用户体验设计师</strong>'
      +   '<div class="dynamic-feed-item__subline"><span>1分钟前</span><span>◉</span><span>来源</span></div>'
      + '</div>';
    main.insertBefore(header, primary);

    primary.appendChild(createGallery());
    main.insertBefore(createSummary(title, price), meta || null);

    var info = createInfo(meta);
    if (info) main.insertBefore(info, meta || null);
    if (meta) meta.remove();

    main.appendChild(createActions());
  }

  function enhanceAll() {
    createToolbar();
    document.querySelectorAll('.dynamic-product-card').forEach(enhanceCard);
  }

  var observer = new MutationObserver(enhanceAll);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  enhanceAll();
})();
