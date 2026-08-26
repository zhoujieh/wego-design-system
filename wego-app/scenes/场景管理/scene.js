const sceneManagerTemplate = `
  <section class="scene-manager-page" data-surface-id="scene-manager" data-route-id="scene-manager" data-layout-mode="composed" data-bg="page">
    <div class="navbar scene-manager-page__navbar" data-component-slug="navbar">
      <div class="navbar__body">
        <div class="navbar__left"><button type="button" class="navbar__left-btn" data-dom-id="scene-manager-back" aria-label="返回"><i class="wego-iconfont-s icon-fanhui"></i></button></div>
        <div class="navbar__center"><span class="navbar__title">场景管理</span></div>
        <div class="navbar__right"></div>
      </div>
    </div>
    <div class="scene-manager-page__body" data-dom-id="scene-manager-body">
      <div class="scene-manager-page__hint">点击入口跳转到对应业务场景原型</div>
      <div class="scene-manager-page__list" data-region="scenes"></div>
    </div>
  </section>
`;

(function () {
  // 业务场景入口清单：仅列出已有需求迭代的业务场景
  var scenes = [
    { routeId: 'agent-resale', name: '帮卖弹窗', desc: '代理商帮卖分销弹窗' },
    { routeId: 'album-product-feed', name: '动态', desc: '动态商品流' },
    { routeId: 'publish-product', name: '发布产品', desc: '商品发布' },
    { routeId: 'friend-list', name: '好友列表', desc: '好友通讯录' },
    { routeId: 'workspace', name: '工作台', desc: '店铺工作台首页' },
    { routeId: 'workspace-order-create', name: '收银开单', desc: '收银开单' },
    { routeId: 'my', name: '我的', desc: '个人中心' }
  ];

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\x22/g, '&quot;')
      .replace(/\x27/g, '&#39;');
  }

  function sceneCellMarkup(scene) {
    return ''
      + '<button type="button" class="cell cell--single cell--bg-white cell--clickable cell--divider-center" data-route-id="' + esc(scene.routeId) + '">'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + esc(scene.name) + '</span></div>'
      +       '<div class="cell__subtitle">' + esc(scene.desc) + '</div>'
      +     '</div>'
      +     '<div class="cell__action"><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div>'
      +   '</div>'
      + '</button>';
  }

  window.WegoApp.registerScene({
    routeId: 'scene-manager',
    title: '场景管理',
    presentation: { type: 'push', transition: 'slide-left', coversTabBar: true },
    template: sceneManagerTemplate,
    init: function (ctx) {
      var root = ctx.root;
      var backButton = root.querySelector('[data-dom-id="scene-manager-back"]');
      var listGroup = root.querySelector('[data-region="scenes"]');

      backButton.addEventListener('click', function () { ctx.back(); });

      scenes.forEach(function (scene) {
        listGroup.insertAdjacentHTML('beforeend', sceneCellMarkup(scene));
      });

      listGroup.addEventListener('click', function (event) {
        var cell = event.target.closest('[data-route-id]');
        if (!cell) return;
        ctx.navigate(cell.getAttribute('data-route-id'));
      });
    }
  });
})();
