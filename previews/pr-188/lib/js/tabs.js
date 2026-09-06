/**
 * tabs 运行时
 *
 * 负责组件契约 behavior.indicator 与 behavior.scroll：
 * - 按选中项 .wg-tabs__content 的 x 坐标和宽度更新 --_tabs-indicator-x 与 --_tabs-indicator-width
 * - scroll 变体将纵向 wheel 转换为横向滚动，并在滚动后同步指示条
 *
 * 场景调用：
 *   var handle = WegoTabs.bind(root);   // root 默认 document
 *   handle.update();                     // tab 切换后手动刷新
 *   handle.destroy();                    // 卸载
 *
 * 选中态由场景维护 aria-selected，本运行时只负责指示条跟随。
 */
(function () {
  'use strict';

  function updateIndicator(tabs) {
    var scroll = tabs.querySelector('.wg-tabs__scroll');
    var indicator = tabs.querySelector('.wg-tabs__active-indicator');
    var selected = tabs.querySelector('.wg-tabs__item[aria-selected="true"] .wg-tabs__content');
    if (!scroll || !indicator || !selected) return;

    var scrollRect = scroll.getBoundingClientRect();
    var selectedRect = selected.getBoundingClientRect();
    var x = selectedRect.left - scrollRect.left + scroll.scrollLeft;

    indicator.style.setProperty('--_tabs-indicator-x', x + 'px');
    indicator.style.setProperty('--_tabs-indicator-width', selectedRect.width + 'px');
  }

  function bindWheel(tabs, scroll) {
    var handler = function (event) {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      scroll.scrollLeft += event.deltaY;
      updateIndicator(tabs);
    };
    scroll.addEventListener('wheel', handler, { passive: false });
    return handler;
  }

  function bind(options) {
    options = options || {};
    var scopeRoot = options.root && options.root.nodeType === 1 ? options.root : document;
    var tabsList = Array.prototype.slice.call(scopeRoot.querySelectorAll('.wg-tabs'));
    if (tabsList.length === 0) return { update: function () {}, destroy: function () {} };

    var resizeHandler = function () { tabsList.forEach(updateIndicator); };
    window.addEventListener('resize', resizeHandler);

    var scrollBindings = [];
    tabsList.forEach(function (tabs) {
      var scroll = tabs.querySelector('.wg-tabs__scroll');
      if (scroll && tabs.classList.contains('wg-tabs--scroll')) {
        var wheelHandler = bindWheel(tabs, scroll);
        var scrollHandler = function () { updateIndicator(tabs); };
        scroll.addEventListener('scroll', scrollHandler);
        scrollBindings.push({ scroll: scroll, wheelHandler: wheelHandler, scrollHandler: scrollHandler });
      }
    });

    requestAnimationFrame(function () { tabsList.forEach(updateIndicator); });

    return {
      update: function () { tabsList.forEach(updateIndicator); },
      destroy: function () {
        window.removeEventListener('resize', resizeHandler);
        scrollBindings.forEach(function (item) {
          item.scroll.removeEventListener('wheel', item.wheelHandler);
          item.scroll.removeEventListener('scroll', item.scrollHandler);
        });
      }
    };
  }

  window.WegoTabs = {
    bind: bind,
    updateIndicator: updateIndicator
  };
})();
