(function enhanceDynamicFeed() {
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
    card.classList.remove('card--surface');

    media.className = 'avatar avatar--40 avatar--image dynamic-feed-item__avatar';
    media.innerHTML = '<img src="./lib/image/avatar-defult.png" alt="">';

    var header = document.createElement('div');
    header.className = 'dynamic-feed-item__header';
    header.innerHTML = '<div class="dynamic-feed-item__identity"><strong class="dynamic-feed-item__name">微购相册 · 用户体验设计师</strong><span class="dynamic-feed-item__source">来自 微购相册</span></div>';
    main.insertBefore(header, primary);

    var gallery = document.createElement('div');
    gallery.className = 'dynamic-feed-gallery dynamic-feed-gallery--9';
    for (var i = 0; i < 9; i++) {
      var item = document.createElement('span');
      item.className = 'dynamic-feed-gallery__item dynamic-feed-gallery__placeholder';
      item.innerHTML = '<i class="wego-iconfont-s icon-tupian" aria-hidden="true"></i>';
      gallery.appendChild(item);
    }
    primary.appendChild(gallery);

    var summary = document.createElement('section');
    summary.className = 'card card--filled dynamic-product-summary';
    var summaryContent = document.createElement('div');
    summaryContent.className = 'card__content dynamic-product-summary__content';
    summaryContent.innerHTML = '<div class="dynamic-product-summary__media"><span aria-hidden="true">' + (title.textContent || '商').slice(0, 1) + '</span></div><div class="dynamic-product-summary__body"><p class="dynamic-product-summary__title"></p></div>';
    summaryContent.querySelector('.dynamic-product-summary__title').textContent = title.textContent;
    if (price) {
      price.className = 'dynamic-product-summary__price';
      summaryContent.querySelector('.dynamic-product-summary__body').appendChild(price);
    }
    summary.appendChild(summaryContent);
    main.insertBefore(summary, meta || null);

    if (meta) meta.classList.add('dynamic-feed-item__footer');
  }

  function enhanceAll() {
    document.querySelectorAll('.dynamic-product-card').forEach(enhanceCard);
  }

  var observer = new MutationObserver(enhanceAll);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  enhanceAll();
})();
