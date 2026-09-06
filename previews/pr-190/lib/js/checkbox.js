/**
 * checkbox 运行时
 *
 * 负责组件契约 behavior.toggle / behavior.group / behavior.disabled：
 * - 单个项点击在未选与已选之间切换
 * - 父级根据子项自动计算全选、半选或未选（updateParent）
 * - 父级点击批量勾选/取消所有非禁用子项
 * - 禁用态 (.checkbox--disabled) 忽略点击与分组联动
 * - 点击与键盘（Space / Enter）均触发切换，并同步 aria-checked
 *
 * 场景调用：
 *   var handle = WegoCheckbox.bind(root);   // root 默认 document
 *   handle.update();                         // 重新计算所有父级状态
 *   handle.destroy();                        // 卸载
 *
 * 勾选标记引用 assets/icons/checkbox-check.svg；半选标记由 .checkbox__minus 绘制。
 */
(function () {
  'use strict';

  var CHECK_ASSET = '<img class="checkbox__asset" src="../assets/icons/checkbox-check.svg" alt="">';

  function syncFieldState(field, state) {
    field.setAttribute('aria-checked', state);
  }

  function setChecked(cb) {
    cb.classList.remove('checkbox--indeterminate');
    cb.classList.add('checkbox--checked');
    var old = cb.querySelector('.checkbox__icon'); if (old) old.remove();
    old = cb.querySelector('.checkbox__minus'); if (old) old.remove();
    var icon = document.createElement('div'); icon.className = 'checkbox__icon'; icon.innerHTML = CHECK_ASSET; cb.appendChild(icon);
  }

  function setUnchecked(cb) {
    cb.classList.remove('checkbox--checked', 'checkbox--indeterminate');
    var old = cb.querySelector('.checkbox__icon'); if (old) old.remove();
    old = cb.querySelector('.checkbox__minus'); if (old) old.remove();
  }

  function setIndeterminate(cb) {
    cb.classList.remove('checkbox--checked');
    cb.classList.add('checkbox--indeterminate');
    var old = cb.querySelector('.checkbox__icon'); if (old) old.remove();
    old = cb.querySelector('.checkbox__minus'); if (old) old.remove();
    var minus = document.createElement('div'); minus.className = 'checkbox__minus'; cb.appendChild(minus);
  }

  function isChecked(cb) { return cb.classList.contains('checkbox--checked'); }
  function isIndeterminate(cb) { return cb.classList.contains('checkbox--indeterminate'); }

  function toggleCheckbox(field) {
    var cb = field.querySelector('.checkbox');
    if (!cb || cb.classList.contains('checkbox--disabled')) return;
    if (isChecked(cb)) {
      setUnchecked(cb);
      syncFieldState(field, 'false');
      return;
    }
    setChecked(cb);
    syncFieldState(field, 'true');
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

  function updateParent(groupName) {
    var parentField = document.querySelector('[data-checkbox-parent="' + groupName + '"]');
    var childFields = document.querySelectorAll('[data-checkbox-child="' + groupName + '"]');
    if (!parentField || !childFields.length) return;
    var parentCb = parentField.querySelector('.checkbox');
    var checkedCount = 0;
    childFields.forEach(function (field) {
      var cb = field.querySelector('.checkbox');
      if (cb && isChecked(cb)) checkedCount++;
    });
    if (checkedCount === childFields.length) {
      setChecked(parentCb);
      syncFieldState(parentField, 'true');
      return;
    }
    if (checkedCount === 0) {
      setUnchecked(parentCb);
      syncFieldState(parentField, 'false');
      return;
    }
    setIndeterminate(parentCb);
    syncFieldState(parentField, 'mixed');
  }

  function bind(options) {
    options = options || {};
    var scopeRoot = options.root && options.root.nodeType === 1 ? options.root : document;
    var toggleFields = Array.prototype.slice.call(scopeRoot.querySelectorAll('[data-checkbox-toggle]'));
    var childFields = Array.prototype.slice.call(scopeRoot.querySelectorAll('[data-checkbox-child]'));
    var parentFields = Array.prototype.slice.call(scopeRoot.querySelectorAll('[data-checkbox-parent]'));
    if (toggleFields.length === 0 && childFields.length === 0 && parentFields.length === 0) {
      return { update: function () {}, destroy: function () {} };
    }

    var unbinds = [];

    toggleFields.forEach(function (field) {
      unbinds.push(bindPress(field, function () { toggleCheckbox(field); }));
    });

    childFields.forEach(function (field) {
      unbinds.push(bindPress(field, function () {
        toggleCheckbox(field);
        updateParent(field.getAttribute('data-checkbox-child'));
      }));
    });

    var parentGroups = {};
    parentFields.forEach(function (field) {
      var groupName = field.getAttribute('data-checkbox-parent');
      parentGroups[groupName] = true;
      unbinds.push(bindPress(field, function () {
        var childFieldsInGroup = document.querySelectorAll('[data-checkbox-child="' + groupName + '"]');
        if (!childFieldsInGroup.length) return;
        var shouldCheckAll = !isChecked(field.querySelector('.checkbox')) || isIndeterminate(field.querySelector('.checkbox'));
        childFieldsInGroup.forEach(function (childField) {
          var cb = childField.querySelector('.checkbox');
          if (!cb || cb.classList.contains('checkbox--disabled')) return;
          if (shouldCheckAll) {
            setChecked(cb);
            syncFieldState(childField, 'true');
          } else {
            setUnchecked(cb);
            syncFieldState(childField, 'false');
          }
        });
        updateParent(groupName);
      }));
      updateParent(groupName);
    });

    return {
      update: function () { Object.keys(parentGroups).forEach(updateParent); },
      destroy: function () { unbinds.forEach(function (fn) { fn(); }); }
    };
  }

  window.WegoCheckbox = {
    bind: bind,
    toggleCheckbox: toggleCheckbox,
    updateParent: updateParent,
    setChecked: setChecked,
    setUnchecked: setUnchecked,
    setIndeterminate: setIndeterminate
  };
})();
