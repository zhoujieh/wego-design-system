(function initWegoVisualViewport() {
  var root = document.documentElement;
  var viewport = window.visualViewport;
  var mobileQuery = window.matchMedia && window.matchMedia('(max-width: 767px)');
  var editableSelector = 'input, textarea, select, [contenteditable="true"], [contenteditable=""]';
  var rafId = 0;
  var retryTimers = [];
  var stableHeight = 0;
  var keyboardOpen = false;

  function isMobile() {
    return !mobileQuery || mobileQuery.matches;
  }

  function isEditableFocused() {
    var active = document.activeElement;
    return !!(active && active.matches && active.matches(editableSelector));
  }

  function clearRetryTimers() {
    retryTimers.forEach(function (timer) { clearTimeout(timer); });
    retryTimers = [];
  }

  function getViewportHeight() {
    return viewport ? viewport.height : window.innerHeight;
  }

  function getLayoutHeight() {
    return Math.max(
      window.innerHeight || 0,
      document.documentElement.clientHeight || 0,
      viewport ? viewport.height + viewport.offsetTop : 0
    );
  }

  function closeKeyboardViewport() {
    keyboardOpen = false;
    root.classList.remove('wego-keyboard-open');
    root.style.removeProperty('--wego-keyboard-viewport-height');
  }

  function updateViewport() {
    rafId = 0;

    if (!isMobile()) {
      stableHeight = 0;
      closeKeyboardViewport();
      return;
    }

    var visualHeight = getViewportHeight();
    var layoutHeight = getLayoutHeight();
    var focused = isEditableFocused();

    if (!visualHeight || !layoutHeight) return;

    /* 只在非键盘状态更新基准高度，避免键盘弹起后的缩小值污染基准。 */
    if (!focused || !keyboardOpen) {
      stableHeight = Math.max(stableHeight, layoutHeight, visualHeight);
    }

    var heightLoss = stableHeight - visualHeight;

    /* 使用不同的开启/关闭阈值形成滞回，避免键盘动画过程中反复切换造成抖动。 */
    if (!keyboardOpen) {
      if (focused && heightLoss > 140) {
        keyboardOpen = true;
      }
    } else if (!focused || heightLoss < 80) {
      closeKeyboardViewport();
      return;
    }

    if (keyboardOpen) {
      root.classList.add('wego-keyboard-open');
      root.style.setProperty('--wego-keyboard-viewport-height', Math.round(visualHeight) + 'px');
    } else {
      closeKeyboardViewport();
    }
  }

  function scheduleUpdate() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateViewport);
  }

  function scheduleSettledUpdates(delays) {
    clearRetryTimers();
    delays.forEach(function (delay) {
      retryTimers.push(setTimeout(scheduleUpdate, delay));
    });
  }

  if (viewport) {
    viewport.addEventListener('resize', scheduleUpdate);
  }

  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', function () {
    stableHeight = 0;
    scheduleSettledUpdates([0, 100]);
  });
  window.addEventListener('orientationchange', function () {
    stableHeight = 0;
    closeKeyboardViewport();
    scheduleSettledUpdates([100, 300]);
  });

  document.addEventListener('focusin', function (event) {
    var target = event.target;
    if (!(target && target.matches && target.matches(editableSelector))) return;
    scheduleSettledUpdates([80, 240]);
  });

  document.addEventListener('focusout', function () {
    scheduleSettledUpdates([80, 280]);
  });

  if (mobileQuery) {
    var onMediaChange = function () {
      stableHeight = 0;
      scheduleUpdate();
    };
    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', onMediaChange);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(onMediaChange);
    }
  }

  scheduleUpdate();
})();
