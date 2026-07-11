(function () {
  window.WegoApp.registerScene({
    routeId: 'benchmark-smoke-test',
    title: '最小闭环测试',
    presentation: { type: 'push', transition: 'slide-left', coversTabBar: false },
    template: '<section class="benchmark-smoke" data-surface-id="benchmark-smoke"><div class="navbar"><div class="navbar__body"><div class="navbar__left"><button type="button" class="navbar__left-text" data-action="back">返回</button></div><div class="navbar__center"><span class="navbar__title">最小闭环测试</span></div><div class="navbar__right"></div></div></div><div class="benchmark-smoke__body">场景加载成功</div></section>',
    init: function (ctx) {
      var back = ctx.root.querySelector('[data-action="back"]');
      if (back) back.addEventListener('click', ctx.back);
    }
  });
})();
