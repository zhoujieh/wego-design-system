const componentPreviewTemplate = `
  <section class="component-preview-page" data-surface-id="component-preview" data-route-id="component-preview" data-layout-mode="composed" data-bg="page">
    <div class="navbar component-preview-page__navbar" data-component-slug="navbar">
      <div class="navbar__body">
        <div class="navbar__left"><button type="button" class="navbar__left-btn" data-dom-id="component-preview-back" aria-label="返回"><i class="wego-iconfont-s icon-fanhui"></i></button></div>
        <div class="navbar__center"><span class="navbar__title">组件预览</span></div>
        <div class="navbar__right"></div>
      </div>
    </div>
    <div class="component-preview-page__body" data-dom-id="component-preview-body">
      <iframe class="component-preview-page__frame" src="./.codex/skills/wego-design/preview/index.html" title="组件预览总览"></iframe>
    </div>
  </section>
`;

(function () {
  window.WegoApp.registerScene({
    routeId: 'component-preview',
    title: '组件预览',
    presentation: { type: 'push', transition: 'slide-left', coversTabBar: true },
    template: componentPreviewTemplate,
    init: function (ctx) {
      var root = ctx.root;
      var backButton = root.querySelector('[data-dom-id="component-preview-back"]');
      backButton.addEventListener('click', function () { ctx.back(); });
    }
  });
})();
