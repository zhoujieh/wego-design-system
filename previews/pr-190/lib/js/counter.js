/**
 * counter 运行时
 *
 * 负责组件契约 behavior.step / behavior.input / behavior.disabled：
 * - 点击减号/加号按最小步长增减，尊重 data-counter-min 与 data-counter-max
 * - 输入框只接受 0-9 数字字符，最长 7 位；Enter 触发 blur
 * - blur 或步进后校验：超过最大值进入错误态，否则恢复提示或默认态
 * - 禁用态 (.is-disabled) 不带 data-counter，自动跳过绑定
 *
 * 场景调用：
 *   var handle = WegoCounter.bind(root);   // root 默认 document
 *   handle.update();                        // 重新校验所有计数器
 *   handle.destroy();                       // 卸载
 *
 * 提示与错误文案通过 data-counter-hinttext / data-counter-errortext 配置。
 */
(function () {
  'use strict';

  function bindCounter(counter) {
    var valueEl = counter.querySelector('.counter__value');
    var minusBtn = counter.querySelector('.counter__btn--minus');
    var plusBtn = counter.querySelector('.counter__btn--plus');
    var hintEl = counter.querySelector('.counter__hint');
    var errorEl = counter.querySelector('.counter__error');
    var max = parseInt(counter.getAttribute('data-counter-max'), 10) || Infinity;
    var min = parseInt(counter.getAttribute('data-counter-min'), 10) || -Infinity;
    var errorText = counter.getAttribute('data-counter-errortext') || '';
    var hintText = counter.getAttribute('data-counter-hinttext') || '';

    if (!valueEl || !minusBtn || !plusBtn) return { update: function () {}, destroy: function () {} };

    function getValue() {
      var raw = valueEl.value.replace(/\D/g, '');
      return raw === '' ? 0 : parseInt(raw, 10);
    }

    function validate() {
      var value = getValue();
      if (errorText && value > max) {
        counter.classList.add('is-error');
        counter.classList.remove('is-hint');
        errorEl.textContent = errorText;
      } else if (hintText) {
        counter.classList.remove('is-error');
        counter.classList.add('is-hint');
        hintEl.textContent = hintText;
      } else {
        counter.classList.remove('is-error');
        counter.classList.remove('is-hint');
      }
    }

    function onInput() {
      var raw = valueEl.value.replace(/\D/g, '');
      if (raw.length > 7) raw = raw.slice(0, 7);
      valueEl.value = raw;
    }

    function onKeydown(event) {
      if (event.key === 'Enter') valueEl.blur();
    }

    function onMinus() {
      var value = getValue();
      if (value > min) { valueEl.value = value - 1; validate(); }
    }

    function onPlus() {
      var value = getValue();
      if (value < max) { valueEl.value = value + 1; validate(); }
    }

    valueEl.addEventListener('input', onInput);
    valueEl.addEventListener('blur', validate);
    valueEl.addEventListener('keydown', onKeydown);
    minusBtn.addEventListener('click', onMinus);
    plusBtn.addEventListener('click', onPlus);

    return {
      update: validate,
      destroy: function () {
        valueEl.removeEventListener('input', onInput);
        valueEl.removeEventListener('blur', validate);
        valueEl.removeEventListener('keydown', onKeydown);
        minusBtn.removeEventListener('click', onMinus);
        plusBtn.removeEventListener('click', onPlus);
      }
    };
  }

  function bind(options) {
    options = options || {};
    var scopeRoot = options.root && options.root.nodeType === 1 ? options.root : document;
    var counters = Array.prototype.slice.call(scopeRoot.querySelectorAll('[data-counter]'));
    if (counters.length === 0) return { update: function () {}, destroy: function () {} };

    var handles = counters.map(bindCounter);

    return {
      update: function () { handles.forEach(function (h) { h.update(); }); },
      destroy: function () { handles.forEach(function (h) { h.destroy(); }); }
    };
  }

  window.WegoCounter = {
    bind: bind
  };
})();
