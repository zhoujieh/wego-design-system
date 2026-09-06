/* 公共悬浮发布入口组件（publish-fab）
   - 动态页与我的页共用同一套悬浮按钮 + 「选择发布类型」面板
   - 面板内容（发布产品 / 发布笔记 / 发起直播）与交互（点击 FAB → 弹面板 → 选类型 → 回调）完全一致
   - 各页通过 onPublish(type) 自行决定发布结果落点，实现「组件与交互同步、发布结果各页面维护」
   依赖：window.WegoApp（ctx.openSheet / ctx.closeOverlay），需在 app.js 之后加载 */
(function () {
  'use strict';

  var PUBLISH_ITEMS = [
    { type: 'product', icon: 'icon-fabushangpin', title: '发布产品' },
    { type: 'note', icon: 'icon-fabubiji', title: '发布笔记' },
    { type: 'live', icon: 'icon-shikuangLive-bofang', title: '发起直播' }
  ];

  /* 悬浮按钮标记：直接作为场景模板内 .layout-page 的直接子节点（position: absolute 锚定到场景根） */
  function fabMarkup() {
    return '<button class="btn btn--strong btn--lg btn--icon-only wego-fab" data-component-slug="button" data-dom-id="open-publish-sheet" type="button" aria-label="发布内容">'
      + '<i class="btn__icon icon-jia16" aria-hidden="true"></i>'
      + '</button>';
  }

  /* 发布类型选择面板（两边内容完全一致） */
  function sheetTemplate() {
    var itemsHtml = PUBLISH_ITEMS.map(function (item) {
      return '<button class="actionsheet__item" type="button" data-publish-type="' + item.type + '">'
        + '<span class="actionsheet__item-icon"><i class="wego-iconfont-s ' + item.icon + '" aria-hidden="true"></i></span>'
        + '<span class="actionsheet__item-main"><span class="actionsheet__item-title">' + item.title + '</span></span>'
        + '</button>';
    }).join('');

    return '<div class="actionsheet actionsheet--action" data-component-slug="actionsheet" role="dialog" aria-modal="true" data-state="open">'
      + '<div class="actionsheet__panel">'
      + '<div class="actionsheet__header actionsheet__header--text"><span class="actionsheet__header-text">选择发布类型</span></div>'
      + '<div class="actionsheet__list">' + itemsHtml + '</div>'
      + '<div class="actionsheet__cancel-gap"></div>'
      + '<button class="actionsheet__cancel" type="button" data-dom-id="cancel-sheet">取消</button>'
      + '</div></div>';
  }

  /* 绑定悬浮入口并托管发布面板。
     options:
       fabSelector {string}  场景中 FAB 节点的选择器，默认 [data-dom-id="open-publish-sheet"]
       onPublish   {function} 选中类型后的回调 (type) => void，由各场景实现发布落点
     返回 { open, destroy } 供场景在 onDestroy 时解绑 */
  function createPublishFab(ctx, options) {
    var opts = options || {};
    var fabSelector = opts.fabSelector || '[data-dom-id="open-publish-sheet"]';
    var onPublish = typeof opts.onPublish === 'function' ? opts.onPublish : function () {};

    function openPublishSheet() {
      /* pendingType：选中类型后暂存，等面板退场（history.back 落定）后再触发 onPublish，
         避免 closeOverlay 的 history.back 与 navigate 的 hash 变更在同一次同步调用里竞争，
         导致目标场景（publish-product 等 push 场景）被历史抖动吞掉 */
      var pendingType = null;
      ctx.openSheet(sheetTemplate(), {
        label: '选择发布类型',
        init: function (sheetCtx) {
          var cancelButton = sheetCtx.root.querySelector('[data-dom-id="cancel-sheet"]');
          function onSheetClick(event) {
            var item = event.target.closest ? event.target.closest('[data-publish-type]') : null;
            if (item) {
              pendingType = item.getAttribute('data-publish-type');
              ctx.closeOverlay();
              return;
            }
            if (event.target === sheetCtx.root) ctx.closeOverlay();
          }
          if (cancelButton) cancelButton.addEventListener('click', function () { ctx.closeOverlay(); });
          sheetCtx.root.addEventListener('click', onSheetClick);
        },
        onDestroy: function () {
          if (!pendingType) return;
          var type = pendingType;
          pendingType = null;
          onPublish(type);
        }
      });
    }

    var fab = ctx.root.querySelector(fabSelector);
    if (fab) fab.addEventListener('click', openPublishSheet);

    return {
      open: openPublishSheet,
      destroy: function () { if (fab) fab.removeEventListener('click', openPublishSheet); }
    };
  }

  window.WegoApp = window.WegoApp || {};
  window.WegoApp.fabMarkup = fabMarkup;
  window.WegoApp.createPublishFab = createPublishFab;
})();
