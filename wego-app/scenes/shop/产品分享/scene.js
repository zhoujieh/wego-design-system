/* 产品分享状态展示场景（product-share-demo）
   - 本场景为「产品分享」业务组件的状态展示入口：按业务数据状态分组列出全部状态，点击拉起对应数据状态的分享面板。
   - 面板逻辑已抽到全局业务运行时 wego-app/js/product-share.js（window.WegoApp.openProductShare(ctx, options)），
     本场景只负责状态样例与入口。
   - 场景管理重构：demo 场景按业务维度组织（产品数据状态 S1 完整商品 / S2 纯文字 / S3 视频为主，共 3 态），
     不再按纯样式维度（标准/窄屏/简洁）组织；S2 视频商品并入 S1 完整商品（有图或图+视频的常规商品形态）不再单列；
     窄屏双组+指示器为面板自身响应式能力随视口自动适配，简洁模式不作为独立入口。
   - 各状态分享内容取自 window.WEGO_PROTOTYPE_DB 商品数据（图片/标题），视频用海报图模拟（无真实视频文件）。 */

(function () {
  'use strict';

  var WegoApp = window.WegoApp;
  var DB = window.WEGO_PROTOTYPE_DB || {};

  /* 各数据状态分享内容：从原型数据库商品取图片与标题，构造对应状态的分享 content */
  function buildContent(stateKey) {
    var products = DB.products || [];
    var p0 = products[0] || {};
    var p1 = products[1] || {};
    var imgs0 = p0.image_list || [];
    var imgs1 = p1.image_list || [];
    /* 视频海报图：以商品图代替视频画面（项目无真实视频文件，与动态页 video 用海报图一致） */
    var videoPoster = imgs0.length > 0 ? imgs0[0] : (imgs1.length > 0 ? imgs1[0] : '');

    switch (stateKey) {
      case 's1':
        /* S1 完整商品：图片（可含视频）+ 标题 */
        return {
          id: p0.product_id || 'demo-s1',
          title: p0.title || '完整商品示例',
          images: imgs0,
          videos: [],
          isOwn: true
        };
      case 's2':
        /* S2 纯文字：仅标题，无图无视频 */
        return {
          id: p1.product_id || 'demo-s2',
          title: (p1.title || '纯文字商品示例') + '——限时上新，欢迎咨询选购',
          images: [],
          videos: [],
          isOwn: true
        };
      case 's3':
        /* S3 视频为主：视频 + 标题，无图片 */
        return {
          id: p1.product_id || 'demo-s3',
          title: p1.title || '视频为主示例',
          images: [],
          videos: [videoPoster],
          isOwn: true
        };
      default:
        return { id: 'demo', title: '分享产品', images: imgs0, videos: [], isOwn: true };
    }
  }

  /* 状态样例：点击各状态卡片拉起对应数据状态的分享面板 */
  function mountSelection(ctx) {
    var root = ctx.root;
    root.querySelectorAll('[data-demo-key]').forEach(function (card) {
      card.addEventListener('click', function () {
        var key = card.getAttribute('data-demo-key');
        var opts = { title: '分享产品', content: buildContent(key) };
        if (WegoApp && WegoApp.openProductShare) {
          WegoApp.openProductShare(ctx, opts);
        } else {
          ctx.toast && ctx.toast('产品分享组件未加载');
        }
      });
    });
  }

  window.WegoApp.registerScene({
    routeId: 'product-share-demo',
    title: '产品分享面板',
    template: `
<div class="layout-page" data-bg="page" data-component-slug="layout-page" data-surface-id="product-share-demo" data-route-id="product-share-demo" data-layout-mode="composed">
  <div class="layout-page__top">
    <div class="navbar" data-component-slug="navbar">
      <div class="navbar__body navbar__body--spaced">
        <div class="navbar__left"><button type="button" class="navbar__left-btn" data-back-btn aria-label="返回"><i class="wego-iconfont-s icon-fanhui" aria-hidden="true"></i></button></div>
        <div class="navbar__center"><span class="navbar__title">产品分享面板</span></div>
        <div class="navbar__right"></div>
      </div>
    </div>
  </div>
  <div class="layout-page__body">
    <div class="layout-scroll" data-component-slug="layout-scroll">
      <div class="product-share-demo__intro">
        <p class="product-share-demo__intro-title">产品分享面板数据状态</p>
        <p class="product-share-demo__intro-desc">面板内容元素固定不变，差异来自产品数据状态与点击渠道后的交互提示。点击下方状态卡片拉起对应数据状态的分享面板，覆盖完整商品 / 纯文字 / 视频为主。</p>
      </div>
      <div class="product-share-demo__group">
        <div class="product-share-demo__group-title">产品数据状态</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-demo-key="s1">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">S1 完整商品</span>
                </div>
                <div class="cell__subtitle">图片（1-9张）+ 标题（可含视频）· 各渠道正常分享</div>
              </div>
              <div class="cell__action">
                <span class="product-share-demo__card-badge product-share-demo__card-badge--free">完整</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-demo-key="s2">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">S2 纯文字</span>
                </div>
                <div class="cell__subtitle">仅标题 · 无保存按钮 · 部分渠道提示</div>
              </div>
              <div class="cell__action">
                <span class="product-share-demo__card-badge product-share-demo__card-badge--fixed">纯文字</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-demo-key="s3">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">S3 视频为主</span>
                </div>
                <div class="cell__subtitle">视频 + 标题（无图片）· 视频分享 / 海报暂无图片</div>
              </div>
              <div class="cell__action">
                <span class="product-share-demo__card-badge product-share-demo__card-badge--video">视频主</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
    presentation: { type: 'push', coversTabBar: true },
    init: function (ctx) {
      var root = ctx.root;
      var backBtn = root.querySelector('[data-back-btn]');
      if (backBtn) {
        backBtn.addEventListener('click', function () { ctx.back(); });
      }
      mountSelection(ctx);
    }
  });
})();
