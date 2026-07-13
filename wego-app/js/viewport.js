(function initWegoVisualViewport() {
  var root = document.documentElement;
  var viewport = window.visualViewport;
  var mobileQuery = window.matchMedia && window.matchMedia('(max-width: 767px)');
  var rafId = 0;
  var retryTimers = [];

  function isMobile() {
    return !mobileQuery || mobileQuery.matches;
  }

  function clearRetryTimers() {
    retryTimers.forEach(function (timer) { clearTimeout(timer); });
    retryTimers = [];
  }

  function clearViewportVariables() {
    root.style.removeProperty('--wego-visual-viewport-width');
    root.style.removeProperty('--wego-visual-viewport-height');
    root.style.removeProperty('--wego-visual-viewport-top');
    root.style.removeProperty('--wego-visual-viewport-left');
  }

  function px(value) {
    var rounded = Math.round(Number(value || 0) * 100) / 100;
    return rounded + 'px';
  }

  function updateViewport() {
    rafId = 0;

    if (!isMobile()) {
      clearViewportVariables();
      return;
    }

    var width = viewport ? viewport.width : window.innerWidth;
    var height = viewport ? viewport.height : window.innerHeight;
    var top = viewport ? viewport.offsetTop : 0;
    var left = viewport ? viewport.offsetLeft : 0;

    if (!width || !height) return;

    root.style.setProperty('--wego-visual-viewport-width', px(width));
    root.style.setProperty('--wego-visual-viewport-height', px(height));
    root.style.setProperty('--wego-visual-viewport-top', px(top));
    root.style.setProperty('--wego-visual-viewport-left', px(left));
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
    viewport.addEventListener('scroll', scheduleUpdate);
  }

  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  window.addEventListener('orientationchange', function () {
    scheduleSettledUpdates([0, 100, 300]);
  });

  document.addEventListener('focusin', function (event) {
    var target = event.target;
    if (!(target && target.matches && target.matches('input, textarea, select, [contenteditable="true"], [contenteditable=""]'))) {
      return;
    }
    scheduleSettledUpdates([0, 100, 300]);
  });

  document.addEventListener('focusout', function () {
    scheduleSettledUpdates([0, 100, 300, 500]);
  });

  if (mobileQuery) {
    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', scheduleUpdate);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(scheduleUpdate);
    }
  }

  scheduleUpdate();
})();
