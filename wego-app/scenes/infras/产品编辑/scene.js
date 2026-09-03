/* 产品编辑状态展示场景（product-editor-demo）
   - 本场景为「产品编辑/发布」业务组件的状态展示入口：分组列出全部模式，点击拉起同一套产品编辑组件。
   - 组件逻辑已抽到全局业务运行时 wego-app/js/product-editor.js（window.WegoApp.openProductEditor(ctx, options)），
     本场景只负责模式样例与入口。
   - 模式：publish 发布 / forward 转发（可预填产品）/ edit 编辑（回显产品）。 */

(function () {
  'use strict';

  var WegoApp = window.WegoApp;

  /* 预填样例产品（forward/edit 模式回显用） */
  var SAMPLE_PRODUCT = {
    name: '2026 春季新款连衣裙',
    image_list: [
      'https://picsum.photos/seed/wego1/240/240',
      'https://picsum.photos/seed/wego2/240/240'
    ],
    price: 299
  };

  function mountSelection(ctx) {
    var root = ctx.root;
    root.querySelectorAll('[data-demo-mode]').forEach(function (card) {
      card.addEventListener('click', function () {
        var mode = card.getAttribute('data-demo-mode');
        var opts = { mode: mode };
        if (mode === 'forward' || mode === 'edit') {
          opts.product = SAMPLE_PRODUCT;
        }
        if (WegoApp && WegoApp.openProductEditor) {
          WegoApp.openProductEditor(ctx, opts);
        } else {
          ctx.toast && ctx.toast('产品编辑组件未加载');
        }
      });
    });
  }

  window.WegoApp.registerScene({
    routeId: 'product-editor-demo',
    title: '产品编辑',
    template: `
<div class="layout-page" data-bg="page" data-component-slug="layout-page" data-surface-id="product-editor-demo" data-route-id="product-editor-demo" data-layout-mode="composed">
  <div class="layout-page__top">
    <div class="navbar" data-component-slug="navbar">
      <div class="navbar__body navbar__body--spaced">
        <div class="navbar__left">
          <div class="navbar__left-btn navbar__left-btn--circle" data-back-btn><i class="wego-iconfont-s icon-zuojiantou16"></i></div>
        </div>
        <div class="navbar__center"><span class="navbar__title">产品编辑</span></div>
        <div class="navbar__right"></div>
      </div>
    </div>
  </div>
  <div class="layout-page__body">
    <div class="layout-scroll" data-component-slug="layout-scroll">
      <div class="product-editor-demo__intro">
        <p class="product-editor-demo__intro-title">产品编辑组件状态</p>
        <p class="product-editor-demo__intro-desc">点击下方状态卡片拉起对应产品编辑实例，覆盖发布 / 转发（预填）/ 编辑（回显）三种模式。</p>
      </div>
      <div class="product-editor-demo__group">
        <div class="product-editor-demo__group-title">模式</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-demo-mode="publish">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">发布产品</span>
                </div>
                <div class="cell__subtitle">空白表单 · 完整填写与发布流程</div>
              </div>
              <div class="cell__action">
                <span class="product-editor-demo__card-badge product-editor-demo__card-badge--free">发布</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-demo-mode="forward">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">转发产品</span>
                </div>
                <div class="cell__subtitle">预填样例产品 · 转发分享</div>
              </div>
              <div class="cell__action">
                <span class="product-editor-demo__card-badge product-editor-demo__card-badge--fixed">转发</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-demo-mode="edit">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">编辑产品</span>
                </div>
                <div class="cell__subtitle">回显样例产品 · 修改后保存</div>
              </div>
              <div class="cell__action">
                <span class="product-editor-demo__card-badge product-editor-demo__card-badge--live">编辑</span>
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
