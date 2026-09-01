/* 产品分享状态展示场景（product-share-demo）
   - 本场景为「产品分享」业务组件的状态展示入口：分组列出全部状态，点击拉起同一套产品分享面板。
   - 面板逻辑已抽到全局组件 wego-app/lib/js/product-share.js（window.WegoApp.openProductShare(ctx, options)），
     本场景只负责状态样例与入口。
   - 状态说明：渠道分组/指示器由面板宽度动态计算（每行 N = floor((宽-16)/68)）；
     标准 430px 视口下 11 渠道为单组，窄屏（如 375px）下会折为双组并出现滚动条式指示器。 */

(function () {
  'use strict';

  var WegoApp = window.WegoApp;

  /* 窄屏模拟：注入限宽样式，触发渠道多组 + 指示器（刷新还原） */
  var NARROW_STYLE_ID = 'product-share-demo-narrow';
  function setNarrow(enable) {
    try {
      var el = document.getElementById(NARROW_STYLE_ID);
      if (enable && !el) {
        var style = document.createElement('style');
        style.id = NARROW_STYLE_ID;
        style.textContent = '.share-panel__panel{max-width:340px!important;margin:0 auto;}';
        document.head.appendChild(style);
      } else if (!enable && el) {
        el.remove();
      }
    } catch (e) { /* ignore */ }
  }

  /* 状态样例：click 时先清理窄屏残留，再按需注入 */
  function mountSelection(ctx) {
    var root = ctx.root;
    root.querySelectorAll('[data-demo-key]').forEach(function (card) {
      card.addEventListener('click', function () {
        var key = card.getAttribute('data-demo-key');
        setNarrow(false);
        var opts = { title: '分享产品' };
        if (key === 'narrow') {
          setNarrow(true);
        } else if (key === 'minimal') {
          opts.config = { showHeaderActions: false, configItems: [], actions: [
            { key: 'miniprogramLink', label: '小程序链接', icon: 'icon-lianjie', style: 'icon-text' },
            { key: 'saveImages', label: '保存图片', icon: 'icon-xiazai', style: 'icon-text' }
          ] };
        }
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
        <p class="product-share-demo__intro-title">产品分享面板组件状态</p>
        <p class="product-share-demo__intro-desc">点击下方状态卡片拉起对应分享面板实例，覆盖标准渠道 / 窄屏双组指示器 / 简洁模式。窄屏模拟通过注入限宽样式触发，刷新页面还原。</p>
      </div>
      <div class="product-share-demo__group">
        <div class="product-share-demo__group-title">渠道布局</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-demo-key="standard">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">标准分享面板</span>
                </div>
                <div class="cell__subtitle">11 渠道 · 当前视口单组（或按屏宽自动折行）</div>
              </div>
              <div class="cell__action">
                <span class="product-share-demo__card-badge product-share-demo__card-badge--free">标准</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-demo-key="narrow">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">窄屏双组 + 指示器</span>
                </div>
                <div class="cell__subtitle">模拟 375px 窄屏 · 渠道折双组 · 滚动条式指示器</div>
              </div>
              <div class="cell__action">
                <span class="product-share-demo__card-badge product-share-demo__card-badge--live">窄屏</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="product-share-demo__group">
        <div class="product-share-demo__group-title">面板配置</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-demo-key="minimal">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">简洁模式</span>
                </div>
                <div class="cell__subtitle">无头部操作 · 无配置项 · 精简底部操作</div>
              </div>
              <div class="cell__action">
                <span class="product-share-demo__card-badge product-share-demo__card-badge--fixed">简洁</span>
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
