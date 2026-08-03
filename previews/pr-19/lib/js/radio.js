/**
 * radio 运行时
 *
 * 负责组件契约 behavior.group / behavior.cannotDeselect / behavior.disabled：
 * - 同一 data-group 内互斥：点击新项时清空同组其他 .radio--checked
 * - 点击已选中项不取消当前选择
 * - 禁用态 (.radio--disabled) 忽略点击
 * - 点击与键盘（Space / Enter）均触发选择，并同步 .radio-field 的 aria-checked
 *
 * 场景调用：
 *   var handle = WegoRadio.bind(root);   // root 默认 document
 *   handle.update();                      // 重新同步 aria-checked
 *   handle.destroy();                     // 卸载
 *
 * 选中态由场景通过 .radio--checked 表达；本运行时只负责互斥切换与无障碍同步。
 */
(function () {
  'use strict';

  function syncGroup(groupName) {
    var fields = document.querySelectorAll('[data-radio-group="' + groupName + '"] .radio-field');
    fields.forEach(function (field) {
      var radio = field.querySelector('.radio');
      field.setAttribute('aria-checked', radio.classList.contains('radio--checked') ? 'true' : 'false');
    });
  }

  function selectRadio(target) {
    if (!target || target.classList.contains('radio--disabled')) return;
    if (target.classList.contains('radio--checked')) return;
    var group = target.getAttribute('data-group');
    if (!group) return;
    var siblings = document.querySelectorAll('.radio[data-group="' + group + '"]');
    for (var i = 0; i < siblings.length; i++) {
      siblings[i].classList.remove('radio--checked');
    }
    target.classList.add('radio--checked');
    syncGroup(group);
  }

  function bindPress(node, handler) {
    var keyHandler = function (event) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handler();
      }
    };
    node.addEventListener('click', handler);
    node.addEventListener('keydown', keyHandler);
    return function unbind() {
      node.removeEventListener('click', handler);
      node.removeEventListener('keydown', keyHandler);
    };
  }

  function bind(options) {
    options = options || {};
    var scopeRoot = options.root && options.root.nodeType === 1 ? options.root : document;
    var fields = Array.prototype.slice.call(scopeRoot.querySelectorAll('[data-radio-group] .radio-field'));
    if (fields.length === 0) return { update: function () {}, destroy: function () {} };

    var unbinds = [];
    var groups = {};
    fields.forEach(function (field) {
      var handler = function () { selectRadio(field.querySelector('.radio')); };
      unbinds.push(bindPress(field, handler));
      var radio = field.querySelector('.radio[data-group]');
      if (radio) groups[radio.getAttribute('data-group')] = true;
    });

    Object.keys(groups).forEach(syncGroup);

    return {
      update: function () { Object.keys(groups).forEach(syncGroup); },
      destroy: function () { unbinds.forEach(function (fn) { fn(); }); }
    };
  }

  window.WegoRadio = {
    bind: bind,
    selectRadio: selectRadio,
    syncGroup: syncGroup
  };
})();
