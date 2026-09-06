/**
 * input 运行时
 *
 * 负责组件契约 behavior.focus / behavior.error / behavior.clear / behavior.numberSanitizing：
 * - 数字输入（[data-number-input]）：focus/blur 切换 is-focus，输入过滤非数字字符与多余小数点，
 *   空值时进入 is-error
 * - 文本输入（.input-group input[type="text"]）：有值时显示清除按钮，禁用态隐藏；
 *   data-validate="phone" 时按 /^1\d{10}$/ 校验并同步 is-error / aria-invalid / aria-describedby
 * - 清除按钮点击后清空内容并重新聚焦
 *
 * 场景调用：
 *   var handle = WegoInput.bind(root);   // root 默认 document
 *   handle.update();                      // 重新刷新清除按钮显隐与校验态
 *   handle.destroy();                     // 卸载
 */
(function () {
  'use strict';

  function bindNumberInput(wrapper) {
    var field = wrapper.querySelector('.number-input__field');
    if (!field) return { update: function () {}, destroy: function () {} };

    function updateNumberErrorState() {
      wrapper.classList.toggle('is-error', field.value.trim().length === 0);
    }

    function onInput() {
      var sanitized = field.value
        .replace(/[^\d.]/g, '')
        .replace(/(\..*?)\..*/g, '$1');
      if (sanitized !== field.value) {
        field.value = sanitized;
      }
      updateNumberErrorState();
    }

    function onFocus() { wrapper.classList.add('is-focus'); }

    function onBlur() {
      wrapper.classList.remove('is-focus');
      updateNumberErrorState();
    }

    field.addEventListener('focus', onFocus);
    field.addEventListener('blur', onBlur);
    field.addEventListener('input', onInput);

    return {
      update: updateNumberErrorState,
      destroy: function () {
        field.removeEventListener('focus', onFocus);
        field.removeEventListener('blur', onBlur);
        field.removeEventListener('input', onInput);
      }
    };
  }

  function bindTextInput(input) {
    var clearBtn = input.parentElement.querySelector('.input-clear');
    var group = input.closest ? input.closest('.input-group') : null;
    var errorMessage = group ? group.querySelector('.field-error') : null;
    if (!clearBtn) return { update: function () {}, destroy: function () {} };

    function isPhoneValid(value) {
      return /^1\d{10}$/.test(value.trim());
    }

    function updateErrorState() {
      if (!group || group.getAttribute('data-validate') !== 'phone') return;
      if (input.value && isPhoneValid(input.value)) {
        group.classList.remove('is-error');
        input.removeAttribute('aria-invalid');
        if (errorMessage) {
          input.removeAttribute('aria-describedby');
        }
        return;
      }
      group.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
      if (errorMessage && errorMessage.id) {
        input.setAttribute('aria-describedby', errorMessage.id);
      }
    }

    function updateClear() {
      if (input.disabled) {
        clearBtn.style.display = 'none';
      } else {
        clearBtn.style.display = input.value ? 'block' : 'none';
      }
    }

    function onInput() {
      updateClear();
      updateErrorState();
    }

    function onFocus() { updateClear(); }

    function onBlur() {
      updateClear();
      updateErrorState();
    }

    function onClear(event) {
      event.preventDefault();
      input.value = '';
      updateClear();
      input.focus();
    }

    input.addEventListener('input', onInput);
    input.addEventListener('focus', onFocus);
    input.addEventListener('blur', onBlur);
    clearBtn.addEventListener('click', onClear);

    updateClear();
    updateErrorState();

    return {
      update: function () { updateClear(); updateErrorState(); },
      destroy: function () {
        input.removeEventListener('input', onInput);
        input.removeEventListener('focus', onFocus);
        input.removeEventListener('blur', onBlur);
        clearBtn.removeEventListener('click', onClear);
      }
    };
  }

  function bind(options) {
    options = options || {};
    var scopeRoot = options.root && options.root.nodeType === 1 ? options.root : document;
    var numberWrappers = Array.prototype.slice.call(scopeRoot.querySelectorAll('[data-number-input]'));
    var textInputs = Array.prototype.slice.call(scopeRoot.querySelectorAll('.input-group input[type="text"]'));
    if (numberWrappers.length === 0 && textInputs.length === 0) {
      return { update: function () {}, destroy: function () {} };
    }

    var handles = numberWrappers.map(bindNumberInput).concat(textInputs.map(bindTextInput));

    return {
      update: function () { handles.forEach(function (h) { h.update(); }); },
      destroy: function () { handles.forEach(function (h) { h.destroy(); }); }
    };
  }

  window.WegoInput = {
    bind: bind
  };
})();
