/**
 * stack 运行时
 *
 * 负责组件契约 behavior.selection 与 behavior.feedback：
 * - 点击 .stack 切换 stack--selected 选中态
 * - 同步 data-selected 属性，供宿主暴露当前选中状态
 * - 是否互斥由宿主业务决定，本运行时只负责单项切换
 *
 * 场景调用：
 *   var handle = WegoStack.bind(root);   // root 默认 document
 *   handle.destroy();                     // 卸载
 *
 * 选中态由场景通过 .stack--selected 表达；本运行时只负责点击切换。
 */
(function () {
  'use strict';

  function toggle(stackEl) {
    if (!stackEl) return;
    var isSelected = stackEl.classList.contains('stack--selected');
    if (isSelected) {
      stackEl.classList.remove('stack--selected');
      stackEl.setAttribute('data-selected', 'false');
    } else {
      stackEl.classList.add('stack--selected');
      stackEl.setAttribute('data-selected', 'true');
    }
  }

  function bind(options) {
    options = options || {};
    var scopeRoot = options.root && options.root.nodeType === 1 ? options.root : document;
    var stacks = Array.prototype.slice.call(scopeRoot.querySelectorAll('.stack'));
    if (stacks.length === 0) return { update: function () {}, destroy: function () {} };

    var handlers = stacks.map(function (stackEl) {
      var handler = function () { toggle(stackEl); };
      stackEl.addEventListener('click', handler);
      return { stackEl: stackEl, handler: handler };
    });

    return {
      update: function () {},
      destroy: function () {
        handlers.forEach(function (item) {
          item.stackEl.removeEventListener('click', item.handler);
        });
      }
    };
  }

  window.WegoStack = {
    bind: bind,
    toggle: toggle
  };
})();
