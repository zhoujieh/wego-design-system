/* 升级弹窗状态展示场景（upgrade-popup-demo）
   - 本场景为「升级弹窗」业务组件的状态展示入口：分组列出全部状态，点击拉起同一套升级弹窗。
   - 弹窗逻辑已抽到全局组件 wego-app/lib/js/upgrade-popup.js（window.WegoApp.openUpgradePopup(ctx, type)），
     本场景只负责状态样例与入口。
   - 升级弹窗带显示守卫（可关闭型每天 1 次 / 强制型仅 1 次），演示前清空本地记录保证每次可弹出。 */

(function () {
  'use strict';

  var WegoApp = window.WegoApp;

  /* 清空显示守卫，确保演示必弹 */
  function clearGuard(type) {
    try {
      localStorage.removeItem('wego.upgrade-popup.' + type);
    } catch (e) { /* ignore */ }
  }

  function mountSelection(ctx) {
    var root = ctx.root;
    root.querySelectorAll('[data-demo-type]').forEach(function (card) {
      card.addEventListener('click', function () {
        var type = card.getAttribute('data-demo-type');
        clearGuard(type);
        if (WegoApp && WegoApp.openUpgradePopup) {
          WegoApp.openUpgradePopup(ctx, type);
        } else {
          ctx.toast && ctx.toast('升级弹窗组件未加载');
        }
      });
    });
  }

  window.WegoApp.registerScene({
    routeId: 'upgrade-popup-demo',
    title: '升级弹窗',
    template: `
<div class="layout-page" data-bg="page" data-surface-id="upgrade-popup-demo" data-route-id="upgrade-popup-demo" data-layout-mode="composed">
  <div class="layout-page__top">
    <div class="navbar" data-component-slug="navbar">
      <div class="navbar__body navbar__body--spaced">
        <div class="navbar__left">
          <div class="navbar__left-btn navbar__left-btn--circle" data-back-btn><i class="wego-iconfont-s icon-zuojiantou16"></i></div>
        </div>
        <div class="navbar__center"><span class="navbar__title">升级弹窗</span></div>
        <div class="navbar__right"></div>
      </div>
    </div>
  </div>
  <div class="layout-page__body">
    <div class="layout-scroll" data-component-slug="layout-scroll">
      <div class="upgrade-popup-demo__intro">
        <p class="upgrade-popup-demo__intro-title">升级弹窗组件状态</p>
        <p class="upgrade-popup-demo__intro-desc">点击下方状态卡片拉起对应升级弹窗实例，覆盖可关闭型 / 强制型两种形态。</p>
      </div>
      <div class="upgrade-popup-demo__group">
        <div class="upgrade-popup-demo__group-title">形态</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-demo-type="dismissible">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">可关闭型</span>
                </div>
                <div class="cell__subtitle">每天 1 次 · 含「近期不再提醒」· 点击遮罩可关闭</div>
              </div>
              <div class="cell__action">
                <span class="upgrade-popup-demo__card-badge upgrade-popup-demo__card-badge--free">可关闭</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-demo-type="forced">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">强制型</span>
                </div>
                <div class="cell__subtitle">仅 1 次 · 仅「立即体验」· 点击遮罩不可关闭</div>
              </div>
              <div class="cell__action">
                <span class="upgrade-popup-demo__card-badge upgrade-popup-demo__card-badge--error">强制</span>
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
