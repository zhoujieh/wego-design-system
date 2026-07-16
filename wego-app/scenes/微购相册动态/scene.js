/* wego-design-contract:
{
  "surface_id": "album-product-feed",
  "route_id": "album-product-feed",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "host-tab",
    "transition": "none",
    "dismissAction": "tab-switch",
    "overlayLevel": "inline",
    "coversTabBar": false,
    "source": "library-consumption.json#/appRuntime/presentationTypes"
  },
  "prompt_contract": {
    "design_system_version": 413,
    "token_bindings": [
      { "selector": ".album-feed", "content_role": "页面背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".album-feed", "content_role": "页面文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".album-feed", "content_role": "页面字体", "css_property": "font-family", "token": "var(--body-md-font-family)" },
      { "selector": ".album-feed", "content_role": "页面边距", "css_property": "padding-inline", "token": "var(--layout-page-margin-m0)" },
      { "selector": ".album-feed", "content_role": "页面顶部安全区", "css_property": "padding-top", "token": "var(--safe-area-top)" },
      { "selector": ".album-feed__scroll", "content_role": "内容底部留白", "css_property": "padding-bottom", "token": "var(--spacer-24)" },
      { "selector": ".album-feed__intro", "content_role": "页面引导留白", "css_property": "padding", "token": "var(--spacer-16)" },
      { "selector": ".album-feed__intro", "content_role": "标题信息间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".album-feed__intro", "content_role": "页面引导背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".album-feed__title", "content_role": "页面标题", "css_property": "font-size", "token": "var(--heading-sm-font-size)" },
      { "selector": ".album-feed__title", "content_role": "页面标题", "css_property": "font-weight", "token": "var(--heading-sm-font-weight)" },
      { "selector": ".album-feed__title", "content_role": "页面标题", "css_property": "line-height", "token": "var(--heading-sm-line-height)" },
      { "selector": ".album-feed__subtitle", "content_role": "页面说明", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".album-feed__subtitle", "content_role": "页面说明", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".album-feed__subtitle", "content_role": "页面说明", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".album-feed__item", "content_role": "动态内容留白", "css_property": "padding", "token": "var(--spacer-16)" },
      { "selector": ".album-feed__item", "content_role": "动态内容节奏", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".album-feed__item", "content_role": "动态内容背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".album-feed__author", "content_role": "发布信息间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".album-feed__author-name", "content_role": "发布者名称", "css_property": "font-size", "token": "var(--body-md-strong-font-size)" },
      { "selector": ".album-feed__author-name", "content_role": "发布者名称", "css_property": "font-weight", "token": "var(--body-md-strong-font-weight)" },
      { "selector": ".album-feed__author-name", "content_role": "发布者名称", "css_property": "line-height", "token": "var(--body-md-strong-line-height)" },
      { "selector": ".album-feed__time", "content_role": "发布时间", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".album-feed__time", "content_role": "发布时间", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".album-feed__time", "content_role": "发布时间", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".album-feed__copy", "content_role": "动态正文", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".album-feed__copy", "content_role": "动态正文", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".album-feed__media", "content_role": "商品图片间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".album-feed__product", "content_role": "商品信息留白", "css_property": "padding", "token": "var(--spacer-12)" },
      { "selector": ".album-feed__product-title", "content_role": "商品名称", "css_property": "font-size", "token": "var(--body-md-strong-font-size)" },
      { "selector": ".album-feed__product-title", "content_role": "商品名称", "css_property": "font-weight", "token": "var(--body-md-strong-font-weight)" },
      { "selector": ".album-feed__product-title", "content_role": "商品名称", "css_property": "line-height", "token": "var(--body-md-strong-line-height)" },
      { "selector": ".album-feed__product-meta", "content_role": "商品说明", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".album-feed__product-meta", "content_role": "商品说明", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".album-feed__product-meta", "content_role": "商品说明", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".album-feed__price", "content_role": "商品价格", "css_property": "color", "token": "var(--text-promotion)" },
      { "selector": ".album-feed__price", "content_role": "商品价格", "css_property": "font-size", "token": "var(--body-lg-font-size)" },
      { "selector": ".album-feed__price", "content_role": "商品价格", "css_property": "font-weight", "token": "var(--font-weight-semibold)" },
      { "selector": ".album-feed__price", "content_role": "商品价格", "css_property": "line-height", "token": "var(--body-lg-line-height)" },
      { "selector": ".album-feed__actions", "content_role": "核心操作间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".album-feed__more", "content_role": "弱化操作文字", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".album-feed__more", "content_role": "弱化操作文字", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".album-feed__more", "content_role": "弱化操作文字", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".album-product-modal", "content_role": "详情内容间距", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".album-product-modal", "content_role": "详情内容留白", "css_property": "padding", "token": "var(--spacer-16)" },
      { "selector": ".album-product-modal", "content_role": "详情背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".album-product-modal", "content_role": "详情文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".album-product-modal", "content_role": "详情字体", "css_property": "font-family", "token": "var(--body-md-font-family)" },
      { "selector": ".album-product-modal__head", "content_role": "详情标题间距", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".album-product-modal__head", "content_role": "详情标题", "css_property": "font-size", "token": "var(--heading-xs-font-size)" },
      { "selector": ".album-product-modal__head", "content_role": "详情标题", "css_property": "font-weight", "token": "var(--heading-xs-font-weight)" },
      { "selector": ".album-product-modal__head", "content_role": "详情标题", "css_property": "line-height", "token": "var(--heading-xs-line-height)" },
      { "selector": ".album-product-modal img", "content_role": "详情图片圆角", "css_property": "border-radius", "token": "var(--radius-8)" },
      { "selector": ".album-product-modal p", "content_role": "详情说明", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".album-product-modal p", "content_role": "详情说明", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".album-product-modal p", "content_role": "详情说明", "css_property": "line-height", "token": "var(--body-md-line-height)" }
    ],
    "component_bindings": [
      { "binding_id": "feed-avatar", "slug": "avatar", "reason": "呈现每条动态的发布者身份", "variant_dimensions": { "type": "initials", "size": "40" } },
      { "binding_id": "feed-image", "slug": "image", "reason": "展示可点击查看的商品图片", "variant_dimensions": { "fit": "cover", "size": "custom-rect", "radius": "rounded-md", "state": "loaded", "interaction": "clickable" } },
      { "binding_id": "product-card", "slug": "card", "reason": "归纳动态关联的商品信息", "variant_dimensions": { "base": "auto", "surface": "outlined" } },
      { "binding_id": "forward-action", "slug": "button", "reason": "承载一键转发核心操作", "variant_dimensions": { "emphasis": "strong", "size": "sm", "iconMode": "text-only", "state": "default" } },
      { "binding_id": "download-action", "slug": "button", "reason": "承载下载图片核心操作", "variant_dimensions": { "emphasis": "medium", "size": "sm", "iconMode": "text-only", "state": "default" } }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "页面首要任务是连续浏览商品动态，采用通栏内容以减少阅读中断并为不同图片数量保留稳定空间。",
      "page_edge_mode": "M0",
      "mutable_regions": [".album-feed__scroll", ".album-feed__item", ".album-feed__media", ".album-feed__product"]
    },
    "interaction_contract": [
      { "dom_id": "open-product-one", "target": "overlay:modal" },
      { "dom_id": "open-product-two", "target": "overlay:modal" },
      { "dom_id": "open-product-three", "target": "overlay:modal" },
      { "dom_id": "forward-one", "target": "feedback:toast" },
      { "dom_id": "download-one", "target": "feedback:toast" },
      { "dom_id": "more-actions-one", "target": "overlay:sheet" },
      { "dom_id": "view-image-one", "target": "feedback:toast" },
      { "dom_id": "view-image-two", "target": "feedback:toast" },
      { "dom_id": "view-image-three", "target": "feedback:toast" },
      { "dom_id": "view-image-four", "target": "feedback:toast" },
      { "dom_id": "view-image-five", "target": "feedback:toast" },
      { "dom_id": "view-image-six", "target": "feedback:toast" }
    ],
    "state_contract": [
      { "state_id": "feed-ready", "initial": true, "trigger": "进入动态主 tab", "visible_result": "展示连续商品动态、核心操作与弱化操作入口", "fallback": "保留当前可浏览的动态内容", "persistence": "memory" },
      { "state_id": "action-feedback", "initial": false, "trigger": "选择核心操作、弱化操作或商品图片", "visible_result": "展示与所选入口相符的瞬时反馈或操作列表", "fallback": "关闭反馈后回到同一动态位置", "persistence": "memory" }
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-16T11:10:00.000Z",
    "checks": { "horizontal_overflow": true, "overlap": true, "clipping": true, "action_legibility": true, "primary_focus": true, "state_feedback": true }
  }
}
*/

const albumProductFeedTemplate = `
  <section class="album-feed" data-surface-id="album-product-feed" data-route-id="album-product-feed" data-route-bound="true" data-layout-mode="composed" data-page-edge-mode="M0" data-bg="page">
    <div class="album-feed__scroll">
      <header class="album-feed__intro">
        <h1 class="album-feed__title">相册动态</h1>
        <p class="album-feed__subtitle">店主上新的商品，随时可以转发给客户</p>
      </header>

      <article class="album-feed__item">
        <header class="album-feed__author">
          <div class="avatar avatar--40 avatar--initials" data-dd-id="author-one" data-component-slug="avatar" data-component-binding="feed-avatar">森</div>
          <div><p class="album-feed__author-name">森屿生活选物</p><p class="album-feed__time">12 分钟前发布</p></div>
        </header>
        <p class="album-feed__copy">今日上新一组轻便通勤单品，面料柔软、颜色很衬夏天。</p>
        <div class="album-feed__media">
          <button type="button" class="wg-image wg-image--custom-rect wg-image--rounded-md wg-image--clickable" data-dd-id="feed-image-one" data-component-slug="image" data-component-binding="feed-image" data-dom-id="view-image-one"><img class="wg-image__src is-loaded" src="./lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092817_7404_0.jpg.jpg" alt="米色针织上衣"><span class="wg-image__overlay"></span></button>
          <button type="button" class="wg-image wg-image--custom-rect wg-image--rounded-md wg-image--clickable" data-dd-id="feed-image-two" data-component-slug="image" data-component-binding="feed-image" data-dom-id="view-image-two"><img class="wg-image__src is-loaded" src="./lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092843_7820_16.jpg.jpg" alt="浅色衬衫"><span class="wg-image__overlay"></span></button>
          <button type="button" class="wg-image wg-image--custom-rect wg-image--rounded-md wg-image--clickable" data-dd-id="feed-image-three" data-component-slug="image" data-component-binding="feed-image" data-dom-id="view-image-three"><img class="wg-image__src is-loaded" src="./lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092896_1518_0.jpg.jpg" alt="白色短袖"><span class="wg-image__overlay"></span></button>
        </div>
        <button type="button" class="card card--outlined album-feed__product" data-dd-id="product-one" data-component-slug="card" data-component-binding="product-card" data-dom-id="open-product-one">
          <span class="card__content"><span class="card__header album-feed__product-title">云感垂坠针织短袖 · 夏日通勤基础款</span><span class="card__body album-feed__product-meta">多色可选｜轻薄不透｜支持七天换码</span><span class="album-feed__price">¥89</span></span>
        </button>
        <div class="album-feed__actions"><button type="button" class="btn btn--strong btn--sm" data-dd-id="forward-one-button" data-component-slug="button" data-component-binding="forward-action" data-dom-id="forward-one">一键转发</button><button type="button" class="btn btn--medium btn--sm" data-dd-id="download-one-button" data-component-slug="button" data-component-binding="download-action" data-dom-id="download-one">下载图片</button><button type="button" class="album-feed__more" data-dom-id="more-actions-one">更多操作</button></div>
      </article>

      <article class="album-feed__item">
        <header class="album-feed__author"><div class="avatar avatar--40 avatar--initials" data-dd-id="author-two" data-component-slug="avatar" data-component-binding="feed-avatar">麦</div><div><p class="album-feed__author-name">麦田家居</p><p class="album-feed__time">今天 09:20</p></div></header>
        <div class="album-feed__media album-feed__media--single"><button type="button" class="wg-image wg-image--custom-rect wg-image--rounded-md wg-image--clickable" data-dd-id="feed-image-four" data-component-slug="image" data-component-binding="feed-image" data-dom-id="view-image-four"><img class="wg-image__src is-loaded" src="./lib/assets/image/clothing/clothing_5/1663741067252_48951.jpg" alt="亚麻质感收纳布艺"><span class="wg-image__overlay"></span></button></div>
        <button type="button" class="card card--outlined album-feed__product" data-dd-id="product-two" data-component-slug="card" data-component-binding="product-card" data-dom-id="open-product-two"><span class="card__content"><span class="card__header album-feed__product-title">亚麻纹理多用途收纳篮（加大号）</span><span class="card__body album-feed__product-meta">适合衣物、玩具和玄关零碎收纳</span><span class="album-feed__price">¥46</span></span></button>
      </article>

      <article class="album-feed__item">
        <header class="album-feed__author"><div class="avatar avatar--40 avatar--initials" data-dd-id="author-three" data-component-slug="avatar" data-component-binding="feed-avatar">北</div><div><p class="album-feed__author-name">北岸男装</p><p class="album-feed__time">昨天 18:40</p></div></header>
        <p class="album-feed__copy">新补到的阔腿裤，腰部做了更舒适的松紧设计。</p>
        <div class="album-feed__media album-feed__media--two"><button type="button" class="wg-image wg-image--custom-rect wg-image--rounded-md wg-image--clickable" data-dd-id="feed-image-five" data-component-slug="image" data-component-binding="feed-image" data-dom-id="view-image-five"><img class="wg-image__src is-loaded" src="./lib/assets/image/clothing/clothing_4/1663741029867_34853.jpg" alt="浅色阔腿裤"><span class="wg-image__overlay"></span></button><button type="button" class="wg-image wg-image--custom-rect wg-image--rounded-md wg-image--clickable" data-dd-id="feed-image-six" data-component-slug="image" data-component-binding="feed-image" data-dom-id="view-image-six"><img class="wg-image__src is-loaded" src="./lib/assets/image/clothing/clothing_4/1663741015640_92584.jpg" alt="深色阔腿裤"><span class="wg-image__overlay"></span></button></div>
        <button type="button" class="card card--outlined album-feed__product" data-dd-id="product-three" data-component-slug="card" data-component-binding="product-card" data-dom-id="open-product-three"><span class="card__content"><span class="card__header album-feed__product-title">高腰垂感阔腿西装裤 · 轻商务显腿长版型</span><span class="card__body album-feed__product-meta">尺码齐全，适配通勤与日常出行</span><span class="album-feed__price">¥128</span></span></button>
      </article>
    </div>
  </section>
`;

function productDetailTemplate(title, price, image, description) {
  return `<section class="album-product-modal" aria-label="产品详情"><div class="album-product-modal__head"><strong>${title}</strong><button type="button" data-close-product-detail>关闭</button></div><img src="${image}" alt="${title}"><p>${description}</p><strong>${price}</strong></section>`;
}

function moreActionsTemplate() {
  return `<div class="actionsheet__panel"><div class="actionsheet__header actionsheet__header--text"><span class="actionsheet__header-text">其他操作</span></div><div class="actionsheet__list"><button type="button" class="actionsheet__item" data-album-action="复制文案"><span class="actionsheet__item-main"><span class="actionsheet__item-title">复制文案</span></span></button><button type="button" class="actionsheet__item" data-album-action="分享"><span class="actionsheet__item-main"><span class="actionsheet__item-title">分享</span></span></button><button type="button" class="actionsheet__item" data-album-action="收藏"><span class="actionsheet__item-main"><span class="actionsheet__item-title">收藏</span></span></button><button type="button" class="actionsheet__item" data-album-action="搜索"><span class="actionsheet__item-main"><span class="actionsheet__item-title">搜索同款</span></span></button><button type="button" class="actionsheet__item" data-album-action="编辑"><span class="actionsheet__item-main"><span class="actionsheet__item-title">编辑</span></span></button><button type="button" class="actionsheet__item" data-album-action="复制动态"><span class="actionsheet__item-main"><span class="actionsheet__item-title">复制动态</span></span></button></div><div class="actionsheet__cancel-gap"></div><button type="button" class="actionsheet__cancel" data-close-album-sheet>取 消</button></div>`;
}

window.WegoApp.registerScene({
  routeId: 'album-product-feed',
  title: '相册动态',
  template: albumProductFeedTemplate,
  presentation: { type: 'host-tab', transition: 'none', dismissAction: 'tab-switch', overlayLevel: 'inline', coversTabBar: false },
  init: function initAlbumProductFeed(ctx) {
    var detailData = {
      'open-product-one': ['云感垂坠针织短袖', '¥89', './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092817_7404_0.jpg.jpg', '轻薄透气的基础短袖，适合夏日通勤。'],
      'open-product-two': ['亚麻纹理多用途收纳篮', '¥46', './lib/assets/image/clothing/clothing_5/1663741067252_48951.jpg', '一篮多用，整理日常收纳更轻松。'],
      'open-product-three': ['高腰垂感阔腿西装裤', '¥128', './lib/assets/image/clothing/clothing_4/1663741029867_34853.jpg', '宽松有垂感，兼顾日常与通勤。']
    };
    function openProduct(domId) { var data = detailData[domId]; ctx.openModal(productDetailTemplate(data[0], data[1], data[2], data[3]), { label: '产品详情', init: function (overlay) { overlay.root.querySelector('[data-close-product-detail]').addEventListener('click', function () { overlay.close(); }); } }); }
    var productOne = ctx.root.querySelector('[data-dom-id="open-product-one"]');
    var productTwo = ctx.root.querySelector('[data-dom-id="open-product-two"]');
    var productThree = ctx.root.querySelector('[data-dom-id="open-product-three"]');
    productOne.addEventListener('click', function () { openProduct('open-product-one'); });
    productTwo.addEventListener('click', function () { openProduct('open-product-two'); });
    productThree.addEventListener('click', function () { openProduct('open-product-three'); });
    var forward = ctx.root.querySelector('[data-dom-id="forward-one"]');
    forward.addEventListener('click', function () { ctx.toast('已打开一键转发入口'); });
    var download = ctx.root.querySelector('[data-dom-id="download-one"]');
    download.addEventListener('click', function () { ctx.toast('已打开图片下载入口'); });
    var more = ctx.root.querySelector('[data-dom-id="more-actions-one"]');
    more.addEventListener('click', function () {
      ctx.openSheet(moreActionsTemplate(), { label: '其他操作', init: function (overlay) {
        overlay.root.querySelectorAll('[data-album-action]').forEach(function (item) { item.addEventListener('click', function () { overlay.close(); ctx.toast('已打开' + item.dataset.albumAction + '入口'); }); });
        overlay.root.querySelector('[data-close-album-sheet]').addEventListener('click', function () { overlay.close(); });
      } });
    });
    function openImage() { ctx.toast('已打开图片查看入口'); }
    var imageOne = ctx.root.querySelector('[data-dom-id="view-image-one"]');
    var imageTwo = ctx.root.querySelector('[data-dom-id="view-image-two"]');
    var imageThree = ctx.root.querySelector('[data-dom-id="view-image-three"]');
    var imageFour = ctx.root.querySelector('[data-dom-id="view-image-four"]');
    var imageFive = ctx.root.querySelector('[data-dom-id="view-image-five"]');
    var imageSix = ctx.root.querySelector('[data-dom-id="view-image-six"]');
    imageOne.addEventListener('click', openImage);
    imageTwo.addEventListener('click', openImage);
    imageThree.addEventListener('click', openImage);
    imageFour.addEventListener('click', openImage);
    imageFive.addEventListener('click', openImage);
    imageSix.addEventListener('click', openImage);
  }
});
