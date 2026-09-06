/**
 * form 运行时
 *
 * 负责组件契约 behavior.inputSanitizing / behavior.validation / behavior.layout 中的运行时部分：
 * - data-sanitize 输入清洗（digits/phone/money），失焦触发字段校验
 * - data-validate 字段校验（text-required/number-required/phone/money-range/textarea-counter）
 * - 金额货币符号 has-value 切换、textarea 计数槽位刷新
 * - 嵌入的 counter 组件复用 runtime/counter.js，另按 form 习惯在失焦时把值夹紧到 [min,max]
 *
 * counter 复用：场景需先加载 runtime/counter.js，本运行时调用 WegoCounter.bind(root) 完成步进、
 * 输入清洗与 Enter 失焦；form 在此之上补一个 blur 监听做范围夹紧（form 计数器不使用 counter 自带的错误/提示槽位）。
 *
 * 场景调用：
 *   var handle = WegoForm.bind(root);   // root 默认 document
 *   handle.update();                      // 重新校验已触碰字段并刷新计数与货币符号
 *   handle.destroy();                     // 卸载
 *
 * 演示或宿主提交校验可直接调用 WegoForm.validateFormBody(body, true) 强制校验单个字段，
 * WegoForm.updateMoneySymbol(input) 刷新货币符号，WegoForm.updateCounter(body) 刷新计数。
 */
(function () {
  'use strict';

  function sanitizeValue(input) {
    var type = input.getAttribute('data-sanitize');
    if (!type) return input.value;
    if (type === 'digits' || type === 'phone') return input.value.replace(/\D/g, '');
    if (type === 'money') return input.value.replace(/[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1');
    return input.value;
  }

  function updateMoneySymbol(input) {
    var money = input.closest('.form-body__money');
    if (!money) return;
    var symbol = money.querySelector('.form-body__money-symbol');
    if (symbol) symbol.classList.toggle('has-value', input.value.trim().length > 0);
  }

  function updateCounter(body) {
    if (!body) return;
    var textarea = body.querySelector('textarea[maxlength]');
    var counter = body.querySelector('.form-body__counter');
    if (!textarea || !counter) return;
    var maxLength = parseInt(textarea.getAttribute('maxlength') || '0', 10);
    counter.textContent = textarea.value.length + '/' + maxLength;
  }

  function validateFormBody(body, force) {
    var rule = body.getAttribute('data-validate');
    if (!rule) return true;
    if (!force && body.getAttribute('data-touched') !== 'true' && !body.classList.contains('form-body--error')) {
      updateCounter(body);
      return true;
    }
    var textInput = body.querySelector('.form-body__action > input:not(.form-body__phone-input):not(.form-body__money-input)');
    var textarea = body.querySelector('textarea');
    var phoneInput = body.querySelector('.form-body__phone-input');
    var moneyInput = body.querySelector('.form-body__money-input');
    var valid = true;

    if (rule === 'text-required' && textInput) valid = textInput.value.trim().length > 0;
    if (rule === 'number-required' && textInput) valid = textInput.value.trim().length > 0 && Number(textInput.value) > 0;
    if (rule === 'phone' && phoneInput) valid = /^\d{11}$/.test(phoneInput.value.trim());
    if (rule === 'money-range' && moneyInput) {
      var value = parseFloat(moneyInput.value);
      valid = moneyInput.value.trim().length > 0 && !isNaN(value) && value > 0 && value <= 50000;
    }
    if (rule === 'textarea-counter' && textarea) {
      var maxLength = parseInt(textarea.getAttribute('maxlength') || '0', 10);
      var valueLength = textarea.value.trim().length;
      valid = valueLength > 0 && (maxLength === 0 || valueLength <= maxLength);
    }

    body.classList.toggle('form-body--error', !valid);
    updateCounter(body);
    return valid;
  }

  function bind(options) {
    options = options || {};
    var scopeRoot = options.root && options.root.nodeType === 1 ? options.root : document;

    var listeners = [];
    function add(el, type, fn) {
      el.addEventListener(type, fn);
      listeners.push({ el: el, type: type, fn: fn });
    }

    // 嵌入 counter：复用 runtime/counter.js 的步进、输入清洗与 Enter 失焦
    var counterHandle = window.WegoCounter
      ? window.WegoCounter.bind({ root: scopeRoot })
      : { update: function () {}, destroy: function () {} };

    // form 习惯：计数器失焦时把值夹紧到 [min,max]（form 计数器不使用 counter 自带错误/提示槽位）
    var counters = scopeRoot.querySelectorAll('[data-counter]');
    for (var i = 0; i < counters.length; i++) {
      (function (counter) {
        var valueEl = counter.querySelector('.counter__value');
        if (!valueEl) return;
        var max = parseInt(counter.getAttribute('data-counter-max'), 10) || Infinity;
        var min = parseInt(counter.getAttribute('data-counter-min'), 10) || -Infinity;
        function normalize() {
          var raw = valueEl.value.replace(/\D/g, '');
          var value = raw === '' ? 0 : parseInt(raw, 10);
          if (value < min) valueEl.value = String(min);
          else if (value > max) valueEl.value = String(max);
        }
        add(valueEl, 'blur', normalize);
      })(counters[i]);
    }

    // data-sanitize 输入清洗 + 失焦校验
    var sanitizeInputs = scopeRoot.querySelectorAll('[data-sanitize]');
    for (var s = 0; s < sanitizeInputs.length; s++) {
      (function (input) {
        function onInput() {
          var sanitized = sanitizeValue(input);
          if (sanitized !== input.value) input.value = sanitized;
          if (input.classList.contains('form-body__money-input')) updateMoneySymbol(input);
          var body = input.closest('.form-body');
          if (body) validateFormBody(body);
        }
        function onBlur() {
          var body = input.closest('.form-body');
          if (body) {
            body.setAttribute('data-touched', 'true');
            validateFormBody(body, true);
          }
        }
        add(input, 'input', onInput);
        add(input, 'blur', onBlur);
      })(sanitizeInputs[s]);
    }

    // textarea 计数 + 校验
    var textareas = scopeRoot.querySelectorAll('.form-body textarea');
    for (var t = 0; t < textareas.length; t++) {
      (function (textarea) {
        function onInput() {
          var body = textarea.closest('.form-body');
          updateCounter(body);
          validateFormBody(body);
        }
        function onBlur() {
          var body = textarea.closest('.form-body');
          body.setAttribute('data-touched', 'true');
          validateFormBody(body, true);
        }
        add(textarea, 'input', onInput);
        add(textarea, 'blur', onBlur);
        updateCounter(textarea.closest('.form-body'));
      })(textareas[t]);
    }

    // 金额货币符号初始态
    var moneyInputs = scopeRoot.querySelectorAll('.form-body__money-input');
    for (var m = 0; m < moneyInputs.length; m++) {
      updateMoneySymbol(moneyInputs[m]);
    }

    return {
      update: function () {
        var validated = scopeRoot.querySelectorAll('[data-validate]');
        for (var v = 0; v < validated.length; v++) {
          var body = validated[v];
          if (body.getAttribute('data-touched') === 'true' || body.classList.contains('form-body--error')) {
            validateFormBody(body, true);
          } else {
            updateCounter(body);
          }
        }
        var symbols = scopeRoot.querySelectorAll('.form-body__money-input');
        for (var n = 0; n < symbols.length; n++) updateMoneySymbol(symbols[n]);
        counterHandle.update();
      },
      destroy: function () {
        for (var k = 0; k < listeners.length; k++) {
          var l = listeners[k];
          l.el.removeEventListener(l.type, l.fn);
        }
        counterHandle.destroy();
      }
    };
  }

  window.WegoForm = {
    bind: bind,
    validateFormBody: validateFormBody,
    updateMoneySymbol: updateMoneySymbol,
    updateCounter: updateCounter,
    sanitizeValue: sanitizeValue
  };
})();
