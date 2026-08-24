/**
 * switch 运行时
 *
 * 负责组件契约 behavior.toggle 与 behavior.disabled：
 * - 点击 .switch 在 --on 与 --off 之间切换状态类
 * - 禁用态 (.switch--disabled) 保留当前值但禁止切换
 *
 * 场景调用：
 *   var handle = WegoSwitch.bind(root);   // root 默认 document
 *   handle.destroy();                      // 卸载
 *
 * 选中态由场景通过 .switch--on / .switch--off 表达；本运行时只负责点击切换。
 */
(function () {
  'use strict';

  function toggle(switchEl) {
    if (!switchEl || switchEl.classList.contains('switch--disabled')) return;
    if (switchEl.classList.contains('switch--on')) {
      switchEl.classList.remove('switch--on');
      switchEl.classList.add('switch--off');
    } else {
      switchEl.classList.remove('switch--off');
      switchEl.classList.add('switch--on');
    }
  }

  function bind(options) {
    options = options || {};
    var scopeRoot = options.root && options.root.nodeType === 1 ? options.root : document;
    var switches = Array.prototype.slice.call(scopeRoot.querySelectorAll('.switch'));
    if (switches.length === 0) return { update: function () {}, destroy: function () {} };

    var handlers = switches.map(function (switchEl) {
      var handler = function () { toggle(switchEl); };
      switchEl.addEventListener('click', handler);
      return { switchEl: switchEl, handler: handler };
    });

    return {
      update: function () {},
      destroy: function () {
        handlers.forEach(function (item) {
          item.switchEl.removeEventListener('click', item.handler);
        });
      }
    };
  }

  window.WegoSwitch = {
    bind: bind,
    toggle: toggle
  };
})();
