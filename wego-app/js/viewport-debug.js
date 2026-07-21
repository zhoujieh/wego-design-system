(function initWegoViewportDebugModule() {
  var VERSION = 'ios-keyboard-debug-v1';
  var SETTLED_DELAYS = [0, 120, 320, 700];
  var MAX_RECORDS = 160;

  function noop() {}

  function isEnabled() {
    try {
      return new URLSearchParams(window.location.search).get('viewport-debug') === '1';
    } catch (error) {
      return /(?:^|[?&])viewport-debug=1(?:&|$)/.test(window.location.search);
    }
  }

  function round(value) {
    return typeof value === 'number' && Number.isFinite(value)
      ? Math.round(value * 100) / 100
      : null;
  }

  function readRect(element) {
    if (!element || !element.getBoundingClientRect) return null;
    var rect = element.getBoundingClientRect();
    return {
      top: round(rect.top),
      right: round(rect.right),
      bottom: round(rect.bottom),
      left: round(rect.left),
      width: round(rect.width),
      height: round(rect.height)
    };
  }

  function activeElementLabel() {
    var active = document.activeElement;
    if (!active) return null;
    return {
      tag: active.tagName ? active.tagName.toLowerCase() : '',
      type: active.getAttribute ? active.getAttribute('type') : null,
      name: active.getAttribute ? active.getAttribute('name') : null,
      placeholder: active.getAttribute ? active.getAttribute('placeholder') : null,
      ariaLabel: active.getAttribute ? active.getAttribute('aria-label') : null,
      contentEditable: Boolean(active.isContentEditable)
    };
  }

  function create(options) {
    if (!isEnabled()) {
      return {
        enabled: false,
        record: noop,
        schedule: noop
      };
    }

    var root = document.documentElement;
    var shell = options && options.shell;
    var viewport = window.visualViewport;
    var records = [];
    var sequence = 0;
    var startedAt = performance.now();
    var statusResetTimer = 0;
    var statusMessage = '';

    var dvhProbe = document.createElement('div');
    dvhProbe.className = 'viewport-debug-probe';
    dvhProbe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dvhProbe);

    var panel = document.createElement('details');
    panel.className = 'viewport-debug-panel';
    panel.open = true;
    panel.innerHTML = [
      '<summary>视口日志 <span class="viewport-debug-panel__status" data-viewport-debug-status>已开启</span></summary>',
      '<div class="viewport-debug-panel__actions">',
      '<button type="button" data-viewport-debug-action="sample">采样</button>',
      '<button type="button" data-viewport-debug-action="copy">复制全部</button>',
      '<button type="button" data-viewport-debug-action="clear">清空</button>',
      '</div>',
      '<pre class="viewport-debug-panel__output" data-viewport-debug-output></pre>'
    ].join('');
    document.body.appendChild(panel);

    var output = panel.querySelector('[data-viewport-debug-output]');
    var status = panel.querySelector('[data-viewport-debug-status]');

    function snapshot(eventName, details) {
      var phoneScreen = document.querySelector('[data-phone-screen]');
      var modal = document.querySelector('.modal');
      var modalBody = document.querySelector('.modal__body');
      var scrollingElement = document.scrollingElement || root;
      var shellStyle = shell ? getComputedStyle(shell) : null;
      var phoneStyle = phoneScreen ? getComputedStyle(phoneScreen) : null;

      return {
        sequence: ++sequence,
        elapsedMs: round(performance.now() - startedAt),
        timestamp: new Date().toISOString(),
        event: eventName,
        details: details || null,
        standalone: {
          navigator: window.navigator.standalone === true,
          displayMode: Boolean(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
        },
        window: {
          innerWidth: round(window.innerWidth),
          innerHeight: round(window.innerHeight),
          outerWidth: round(window.outerWidth),
          outerHeight: round(window.outerHeight),
          scrollX: round(window.scrollX),
          scrollY: round(window.scrollY)
        },
        visualViewport: viewport ? {
          width: round(viewport.width),
          height: round(viewport.height),
          offsetTop: round(viewport.offsetTop),
          offsetLeft: round(viewport.offsetLeft),
          pageTop: round(viewport.pageTop),
          pageLeft: round(viewport.pageLeft),
          scale: round(viewport.scale)
        } : null,
        document: {
          visibilityState: document.visibilityState,
          rootClientHeight: round(root.clientHeight),
          rootScrollHeight: round(root.scrollHeight),
          bodyClientHeight: document.body ? round(document.body.clientHeight) : null,
          bodyScrollHeight: document.body ? round(document.body.scrollHeight) : null,
          scrollingTop: round(scrollingElement.scrollTop),
          scrollingLeft: round(scrollingElement.scrollLeft)
        },
        screen: {
          width: round(window.screen && window.screen.width),
          height: round(window.screen && window.screen.height),
          availWidth: round(window.screen && window.screen.availWidth),
          availHeight: round(window.screen && window.screen.availHeight),
          orientation: window.screen && window.screen.orientation
            ? window.screen.orientation.type
            : window.orientation
        },
        rects: {
          root: readRect(root),
          body: readRect(document.body),
          shell: readRect(shell),
          phoneScreen: readRect(phoneScreen),
          modal: readRect(modal),
          modalBody: readRect(modalBody),
          dvhProbe: readRect(dvhProbe)
        },
        css: {
          shellHeight: shellStyle ? shellStyle.height : null,
          shellMinHeight: shellStyle ? shellStyle.minHeight : null,
          shellTransform: shellStyle ? shellStyle.transform : null,
          legacyVvHeight: getComputedStyle(root).getPropertyValue('--vv-height').trim(),
          safeAreaBottom: phoneStyle ? phoneStyle.getPropertyValue('--safe-area-bottom').trim() : null
        },
        focus: activeElementLabel()
      };
    }

    function render(record) {
      if (!output || !record) return;
      var visual = record.visualViewport;
      var shellRect = record.rects.shell;
      var phoneRect = record.rects.phoneScreen;
      var detailLines = [
        '#' + record.sequence + ' ' + record.event + ' +' + record.elapsedMs + 'ms',
        'inner=' + record.window.innerHeight + ' root=' + record.document.rootClientHeight + ' dvh=' + (record.rects.dvhProbe && record.rects.dvhProbe.height),
        'vv=' + (visual ? visual.height + ' top=' + visual.offsetTop + ' pageTop=' + visual.pageTop : 'none'),
        'shell=' + (shellRect ? shellRect.top + '..' + shellRect.bottom + ' h=' + shellRect.height : 'none'),
        'phone=' + (phoneRect ? phoneRect.top + '..' + phoneRect.bottom + ' h=' + phoneRect.height : 'none'),
        'scroll=' + record.window.scrollY + '/' + record.document.scrollingTop,
        'focus=' + (record.focus && (record.focus.ariaLabel || record.focus.placeholder || record.focus.tag)),
        'details=' + JSON.stringify(record.details || {})
      ];
      output.textContent = detailLines.join('\n');
      if (!statusMessage) status.textContent = '#' + record.sequence;
    }

    function record(eventName, details) {
      var item = snapshot(eventName, details);
      records.push(item);
      if (records.length > MAX_RECORDS) records.splice(0, records.length - MAX_RECORDS);
      render(item);
      console.info('[wego viewport debug]', item);
      return item;
    }

    function schedule(eventName, details) {
      SETTLED_DELAYS.forEach(function (delay) {
        setTimeout(function () {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              record(eventName + ':settled', Object.assign({ delay: delay }, details || {}));
            });
          });
        }, delay);
      });
    }

    function showStatus(message) {
      statusMessage = message;
      status.textContent = message;
      clearTimeout(statusResetTimer);
      statusResetTimer = setTimeout(function () {
        statusMessage = '';
        status.textContent = records.length ? '#' + records[records.length - 1].sequence : '已开启';
      }, 1800);
    }

    function exportPayload() {
      return JSON.stringify({
        version: VERSION,
        href: window.location.href,
        userAgent: window.navigator.userAgent,
        records: records
      }, null, 2);
    }

    function fallbackCopy(text) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.className = 'viewport-debug-copy-source';
      document.body.appendChild(textarea);
      textarea.select();
      var copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    }

    function copyRecords() {
      var text = exportPayload();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showStatus('已复制');
        }).catch(function () {
          showStatus(fallbackCopy(text) ? '已复制' : '复制失败');
        });
        return;
      }
      showStatus(fallbackCopy(text) ? '已复制' : '复制失败');
    }

    panel.addEventListener('click', function (event) {
      var button = event.target.closest('[data-viewport-debug-action]');
      if (!button) return;
      var action = button.dataset.viewportDebugAction;
      if (action === 'sample') record('debug:manual-sample');
      if (action === 'copy') copyRecords();
      if (action === 'clear') {
        records.length = 0;
        sequence = 0;
        record('debug:cleared');
      }
    });

    function observe(target, eventName, label, capture) {
      if (!target || !target.addEventListener) return;
      target.addEventListener(eventName, function (event) {
        var details = eventName === 'pageshow' ? { persisted: Boolean(event.persisted) } : null;
        record('event:' + label, details);
        schedule('event:' + label, details);
      }, Boolean(capture));
    }

    observe(document, 'focusin', 'focusin', true);
    observe(document, 'focusout', 'focusout', true);
    observe(document, 'visibilitychange', 'visibilitychange');
    observe(window, 'resize', 'window-resize');
    observe(window, 'scroll', 'window-scroll');
    observe(window, 'pageshow', 'pageshow');
    observe(window, 'orientationchange', 'orientationchange');
    if (viewport) {
      observe(viewport, 'resize', 'visual-resize');
      observe(viewport, 'scroll', 'visual-scroll');
    }

    var api = {
      enabled: true,
      version: VERSION,
      records: records,
      record: record,
      schedule: schedule,
      export: exportPayload,
      clear: function () {
        records.length = 0;
        sequence = 0;
      }
    };
    window.WegoViewportDebugSession = api;
    record('debug:init', { version: VERSION });
    schedule('debug:init', { version: VERSION });
    return api;
  }

  window.WegoViewportDebug = {
    version: VERSION,
    create: create
  };
})();
