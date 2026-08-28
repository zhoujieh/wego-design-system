/**
 * numeric-keypad 运行时
 *
 * 通用数字键盘组件，用于价格、加价金额、比例等数值输入。
 * - 三种模式：price（纯键盘无头部）、amount（加价金额，带分段切换）、rate（加价比例，带分段切换）
 * - 数字输入、小数点（最多两位小数）、逐位删除（支持长按连续删除）
 * - 金额/比例分段切换
 * - 通过回调通知调用方，不执行业务校验
 *
 * 调用方式：
 *   var html = WegoNumericKeypad.template('amount');
 *   ctx.openSheet(html, {
 *     label: '数字键盘',
 *     init: function(overlayCtx) {
 *       var keypad = WegoNumericKeypad.init(overlayCtx.root, {
 *         mode: 'amount',
 *         initialValue: '',
 *         onChange: function(value, mode) { ... },
 *         onConfirm: function(value, mode) { ... }
 *       });
 *     }
 *   });
 */
(function () {
  'use strict';

  var VALID_MODES = ['price', 'amount', 'rate'];

  function cleanValue(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[^0-9.]/g, '');
  }

  /**
   * 生成键盘 HTML 模板（含 modal 外壳，可直接传给 openSheet）
   * @param {string} mode - 'price' | 'amount' | 'rate'
   * @returns {string} HTML 字符串
   */
  function template(mode) {
    if (VALID_MODES.indexOf(mode) === -1) mode = 'amount';
    var isPrice = mode === 'price';
    var isAmount = mode === 'amount';
    var segClass = isAmount ? 'is-amount' : 'is-rate';
    var labelText = isPrice ? '' : (isAmount ? '加价(元)' : '加价(%)');
    var placeholder = isAmount ? '0.00' : '0';
    var rootClass = 'numeric-keypad ' + (isPrice ? 'numeric-keypad--price' : segClass);

    var headerHtml = '';
    if (!isPrice) {
      headerHtml = ''
        + '<div class="numeric-keypad__header">'
        +   '<span class="numeric-keypad__label" data-keypad-label>' + labelText + '</span>'
        +   '<div class="numeric-keypad__value-wrap">'
        +     '<input class="numeric-keypad__input" data-keypad-display type="text" inputmode="none" placeholder="' + placeholder + '" aria-label="数值输入">'
        +   '</div>'
        +   '<div class="numeric-keypad__seg ' + segClass + '">'
        +     '<div class="numeric-keypad__seg-thumb"></div>'
        +     '<div class="numeric-keypad__seg-item ' + (isAmount ? 'is-active' : '') + '" data-keypad-tab="amount">按金额</div>'
        +     '<div class="numeric-keypad__seg-item ' + (!isAmount ? 'is-active' : '') + '" data-keypad-tab="rate">按比例</div>'
        +   '</div>'
        + '</div>';
    }

    var keysHtml = ''
      + '<div class="numeric-keypad__keys">'
      +   '<div class="numeric-keypad__key" data-key="1">1</div>'
      +   '<div class="numeric-keypad__key" data-key="2">2</div>'
      +   '<div class="numeric-keypad__key" data-key="3">3</div>'
      +   '<div class="numeric-keypad__key numeric-keypad__key--delete" data-key="delete"><i class="wego-iconfont-s icon-tuige" aria-hidden="true"></i></div>'
      +   '<div class="numeric-keypad__key" data-key="4">4</div>'
      +   '<div class="numeric-keypad__key" data-key="5">5</div>'
      +   '<div class="numeric-keypad__key" data-key="6">6</div>'
      +   '<button class="numeric-keypad__key numeric-keypad__key--confirm" data-keypad-confirm type="button">确定</button>'
      +   '<div class="numeric-keypad__key" data-key="7">7</div>'
      +   '<div class="numeric-keypad__key" data-key="8">8</div>'
      +   '<div class="numeric-keypad__key" data-key="9">9</div>'
      +   '<div class="numeric-keypad__key numeric-keypad__key--zero" data-key="0">0</div>'
      +   '<div class="numeric-keypad__key" data-key=".">.</div>'
      + '</div>';

    return ''
      + '<div class="modal modal--frame modal--no-mask" role="dialog" aria-modal="true" data-state="closed" data-numeric-keypad-overlay data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="' + rootClass + '" data-numeric-keypad data-mode="' + mode + '">'
      +       headerHtml
      +       keysHtml
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  /**
   * 初始化键盘交互
   * @param {HTMLElement} root - 键盘所在的 overlay 根元素（或 .numeric-keypad 元素本身）
   * @param {Object} options
   * @param {string} options.mode - 'price' | 'amount' | 'rate'
   * @param {string} [options.initialValue=''] - 初始值
   * @param {Function} [options.onChange] - 值变化回调 (value, mode)
   * @param {Function} [options.onConfirm] - 确定回调 (value, mode)
   * @returns {Object} 控制方法 { getValue, setValue, getMode, destroy }
   */
  function init(root, options) {
    options = options || {};

    // 支持传入 overlay 根元素或 .numeric-keypad 元素本身
    var keypadEl = root.classList && root.classList.contains('numeric-keypad')
      ? root
      : root.querySelector('.numeric-keypad');
    if (!keypadEl) return { getValue: function () { return ''; }, setValue: function () {}, getMode: function () { return options.mode || 'amount'; }, destroy: function () {} };

    var mode = options.mode || keypadEl.getAttribute('data-mode') || 'amount';
    if (VALID_MODES.indexOf(mode) === -1) mode = 'amount';
    var isPriceMode = mode === 'price';
    var currentMode = isPriceMode ? 'amount' : mode;
    var currentValue = cleanValue(options.initialValue);

    var displayEl = keypadEl.querySelector('[data-keypad-display]');
    var labelEl = keypadEl.querySelector('[data-keypad-label]');
    var segEl = keypadEl.querySelector('.numeric-keypad__seg');
    var tabEls = keypadEl.querySelectorAll('[data-keypad-tab]');
    var keyEls = keypadEl.querySelectorAll('[data-key]');
    var confirmBtn = keypadEl.querySelector('[data-keypad-confirm]');

    function fireChange() {
      if (typeof options.onChange === 'function') {
        options.onChange(currentValue, currentMode);
      }
    }

    function updateDisplay() {
      if (isPriceMode) {
        // price 模式无内部输入框，通过 onChange 通知调用方回显
        fireChange();
      } else {
        var isAmount = currentMode === 'amount';
        if (labelEl) labelEl.textContent = isAmount ? '加价(元)' : '加价(%)';
        if (displayEl) {
          displayEl.value = currentValue;
          displayEl.placeholder = isAmount ? '0.00' : '0';
        }
        fireChange();
      }
    }

    // 禁止原生输入框的键盘输入
    if (displayEl) {
      displayEl.addEventListener('beforeinput', function (e) { e.preventDefault(); });
      displayEl.addEventListener('input', function (e) { e.preventDefault(); });
    }

    function handleKey(k) {
      if (k === 'delete') {
        currentValue = currentValue.slice(0, -1);
      } else if (k === '.') {
        if (currentValue.indexOf('.') === -1 && currentValue !== '') {
          currentValue += '.';
        }
      } else {
        var dotIndex = currentValue.indexOf('.');
        if (dotIndex !== -1 && currentValue.length - dotIndex - 1 >= 2) {
          return;
        }
        currentValue += k;
      }
      updateDisplay();
    }

    // 数字键点击
    var keyHandlers = [];
    keyEls.forEach(function (key) {
      var handler = function () {
        var k = key.getAttribute('data-key');
        handleKey(k);
      };
      key.addEventListener('click', handler);
      keyHandlers.push({ el: key, type: 'click', fn: handler });

      // 删除键长按连续删除
      if (key.getAttribute('data-key') === 'delete') {
        var pressTimer = null;
        var intervalTimer = null;
        var startPress = function (e) {
          e.preventDefault();
          pressTimer = setTimeout(function () {
            intervalTimer = setInterval(function () { handleKey('delete'); }, 100);
          }, 500);
        };
        var endPress = function () {
          if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
          if (intervalTimer) { clearInterval(intervalTimer); intervalTimer = null; }
        };
        key.addEventListener('touchstart', startPress, { passive: false });
        key.addEventListener('touchend', endPress);
        key.addEventListener('touchcancel', endPress);
        key.addEventListener('mousedown', startPress);
        key.addEventListener('mouseup', endPress);
        key.addEventListener('mouseleave', endPress);
        keyHandlers.push({ el: key, type: 'touchstart', fn: startPress });
        keyHandlers.push({ el: key, type: 'touchend', fn: endPress });
        keyHandlers.push({ el: key, type: 'touchcancel', fn: endPress });
        keyHandlers.push({ el: key, type: 'mousedown', fn: startPress });
        keyHandlers.push({ el: key, type: 'mouseup', fn: endPress });
        keyHandlers.push({ el: key, type: 'mouseleave', fn: endPress });
      }
    });

    // 分段切换
    var tabHandlers = [];
    tabEls.forEach(function (tab) {
      var handler = function () {
        var newMode = tab.getAttribute('data-keypad-tab');
        if (newMode === currentMode) return;
        currentValue = '';
        currentMode = newMode;
        tabEls.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        if (segEl) {
          segEl.classList.toggle('is-amount', currentMode === 'amount');
          segEl.classList.toggle('is-rate', currentMode === 'rate');
        }
        keypadEl.classList.toggle('is-amount', currentMode === 'amount');
        keypadEl.classList.toggle('is-rate', currentMode === 'rate');
        updateDisplay();
      };
      tab.addEventListener('click', handler);
      tabHandlers.push({ el: tab, type: 'click', fn: handler });
    });

    // 确定按钮
    var confirmHandler = null;
    if (confirmBtn) {
      confirmHandler = function () {
        if (typeof options.onConfirm === 'function') {
          options.onConfirm(currentValue, currentMode);
        }
      };
      confirmBtn.addEventListener('click', confirmHandler);
    }

    // 初始展示
    updateDisplay();

    return {
      getValue: function () { return currentValue; },
      setValue: function (v) { currentValue = cleanValue(v); updateDisplay(); },
      getMode: function () { return currentMode; },
      destroy: function () {
        keyHandlers.forEach(function (h) { h.el.removeEventListener(h.type, h.fn); });
        tabHandlers.forEach(function (h) { h.el.removeEventListener(h.type, h.fn); });
        if (confirmBtn && confirmHandler) confirmBtn.removeEventListener('click', confirmHandler);
      }
    };
  }

  window.WegoNumericKeypad = {
    template: template,
    init: init
  };
})();
