(function initWegoApp() {
  var shell = document.querySelector('[data-host-shell="true"]');
  if (!shell) return;

  var panels = Array.from(document.querySelectorAll('[data-host-tab]'));
  var tabTriggers = Array.from(document.querySelectorAll('[data-host-tab-trigger]'));
  var sceneLayer = document.querySelector('[data-scene-layer]');
  var overlayLayer = document.querySelector('[data-overlay-layer]');
  var toastHost = document.querySelector('[data-toast-host]');
  var bottomNav = document.querySelector('[data-bottom-nav]');
  var validTabs = new Set(panels.map(function (panel) { return panel.dataset.hostTab; }));
  var routes = Array.isArray(window.WEGO_APP_ROUTES) ? window.WEGO_APP_ROUTES : [];
  var routeConfigs = new Map(routes.map(function (route) { return [route.routeId, route]; }));
  var scenes = new Map();
  var loadingScripts = new Map();
  var loadedStyles = new Set();
  // push 场景栈：bottom-to-top 顺序，每个 entry = { routeId, host, scene }
  // host 为承载该场景内容的 DOM 元素（.app-scene-layer__panel）
  // 顶层 entry 始终是当前可见的 push 场景；空数组表示回到宿主
  var sceneStack = [];
  var appState = {
    activeTab: 'my',
    currentRouteId: '',
    sceneState: Object.create(null)
  };
  // 由 initTouchPressState 注入，用于页面切换时兜底清理按压态
  var clearAllPressStates = function () {};
  // 由 initTouchPressState 维护，当前按压态元素（openPushScene 读取以做 forward 预防）
  var pressedEl = null;

  var tabIconNames = {
    dongtai: 'dongtai',
    haoyou: 'haoyou',
    workspace: 'gongzuotai',
    xiaoxi: 'xiaoxi',
    my: 'wode'
  };

  function iconSrcFor(img, iconName, active) {
    var current = img.getAttribute('src') || './lib/icons/tab-dongtai.svg';
    var prefix = current.slice(0, current.lastIndexOf('/') + 1);
    return prefix + 'tab-' + (active ? 'active-' : '') + iconName + '.svg';
  }

  function setActiveTab(tab) {
    clearAllPressStates();
    var nextTab = validTabs.has(tab) ? tab : 'my';
    appState.activeTab = nextTab;
    panels.forEach(function (panel) {
      var active = panel.dataset.hostTab === nextTab;
      panel.hidden = !active;
      panel.classList.toggle('host-shell-page__panel--active', active);
    });
    tabTriggers.forEach(function (trigger) {
      var active = trigger.dataset.hostTabTrigger === nextTab;
      trigger.classList.toggle('active', active);
      trigger.setAttribute('aria-selected', active ? 'true' : 'false');
      var img = trigger.querySelector('[data-tab-icon]');
      var iconName = (img && img.dataset.tabIcon) || tabIconNames[trigger.dataset.hostTabTrigger];
      if (img && iconName) img.src = iconSrcFor(img, iconName, active);
    });
  }

  function routeFromHash() {
    var raw = window.location.hash || '';
    var match = raw.match(/^#\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function navigate(routeId) {
    if (!routeId) return;
    if (window.location.hash === '#/' + routeId) {
      openRoute(routeId);
      return;
    }
    window.location.hash = '#/' + routeId;
  }

  function normalizePresentation(scene) {
    var pres = (scene && scene.presentation) || {};
    return {
      type: pres.type || 'push',
      transition: pres.transition || 'none',
      coversTabBar: Boolean(pres.coversTabBar)
    };
  }

  function ensureStyle(href) {
    if (!href || loadedStyles.has(href)) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.sceneStyle = href;
    document.head.appendChild(link);
    loadedStyles.add(href);
  }

  function ensureScript(routeId, src) {
    if (!src || scenes.has(routeId)) return Promise.resolve();
    if (loadingScripts.has(src)) return loadingScripts.get(src);
    var promise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('scene script load failed: ' + src)); };
      document.body.appendChild(script);
    });
    loadingScripts.set(src, promise);
    return promise;
  }

  // 弹出 push 栈顶场景。
  // - afterCallback: 可选，退场结束后执行（用于清空 hash 等）
  // - animated: 可选，默认 true 带退场动画；hashchange/侧滑返回传 false 无动画
  //   （iOS 系统侧滑返回已有系统级动画，JS 再叠加 CSS 退场会导致 panel "先重现再退出"闪烁）
  // - 如果栈内还有下层场景，下层场景会自然显露（DOM 未销毁），其 init 不重新调用
  // - 如果栈空，隐藏 sceneLayer，回到宿主
  function popSceneLayer(afterCallback, animated) {
    var top = sceneStack[sceneStack.length - 1];
    if (!top) {
      if (typeof afterCallback === 'function') afterCallback();
      return;
    }
    // 防止系统侧滑与代码返回重复触发退场
    if (!top.host.parentNode || top.host.classList.contains('app-scene-layer__panel--exit')) {
      if (typeof afterCallback === 'function') afterCallback();
      return;
    }
    clearAllPressStates();

    if (animated === false) {
      // 无动画：直接移除 panel（用于 hashchange/侧滑返回，系统动画已完成）
      top.host.remove();
      sceneStack.pop();
      if (sceneStack.length === 0) {
        sceneLayer.hidden = true;
        sceneLayer.className = 'app-scene-layer';
        appState.currentRouteId = '';
      } else {
        appState.currentRouteId = sceneStack[sceneStack.length - 1].routeId;
      }
      // 侧滑返回后，host 页面重新可见，强制重绘入口
      // 清除 iOS Safari 可能残留的 :active 合成层缓存，避免按压态视觉残留
      forceHostEntriesRepaint();
      if (typeof afterCallback === 'function') afterCallback();
      return;
    }

    top.host.classList.add('app-scene-layer__panel--exit');
    var onTransitionEnd = function () {
      top.host.removeEventListener('transitionend', onTransitionEnd);
      top.host.remove();
      sceneStack.pop();
      if (sceneStack.length === 0) {
        sceneLayer.hidden = true;
        sceneLayer.className = 'app-scene-layer';
        appState.currentRouteId = '';
      } else {
        var newTop = sceneStack[sceneStack.length - 1];
        appState.currentRouteId = newTop.routeId;
      }
      if (typeof afterCallback === 'function') afterCallback();
    };
    top.host.addEventListener('transitionend', onTransitionEnd);
  }

  // 清空整个 push 栈（无动画），用于切 Tab、打开 overlay 场景前重置
  function clearSceneLayer() {
    clearAllPressStates();
    sceneStack.forEach(function (entry) { entry.host.remove(); });
    sceneStack = [];
    sceneLayer.hidden = true;
    sceneLayer.className = 'app-scene-layer';
    sceneLayer.replaceChildren();
    appState.currentRouteId = '';
  }

  function renderTemplate(target, template) {
    if (template instanceof HTMLTemplateElement) {
      target.replaceChildren(template.content.cloneNode(true));
      return;
    }
    target.innerHTML = String(template || '');
  }

  function sceneContext(scene, host) {
    var routeId = scene.routeId;
    if (!appState.sceneState[routeId]) appState.sceneState[routeId] = Object.create(null);
    return {
      routeId: routeId,
      root: host,
      state: appState.sceneState[routeId],
      appState: appState,
      navigate: navigate,
      back: function () { closeTopLayer(); },
      openModal: function (template, options) { openOverlay('modal', template, options || {}); },
      openSheet: function (template, options) { openOverlay('sheet', template, options || {}); },
      openFullScreenModal: function (template, options) { openOverlay('full-screen-modal', template, options || {}); },
      closeOverlay: closeOverlay,
      toast: toast,
      updateEntrySummary: updateEntrySummary
    };
  }

  function openPushScene(scene) {
    // 保存 pressedEl 引用，clearAllPressStates 会清空它
    var entryEl = pressedEl;
    clearAllPressStates();
    var presentation = normalizePresentation(scene);
    sceneLayer.hidden = false;
    sceneLayer.className = 'app-scene-layer';
    sceneLayer.classList.toggle('app-scene-layer--cover-tab', presentation.coversTabBar);

    // 为新场景创建独立的栈层 panel
    var panel = document.createElement('div');
    panel.className = 'app-scene-layer__panel app-scene-layer__panel--enter';
    if (presentation.coversTabBar) panel.classList.add('app-scene-layer__panel--cover-tab');
    renderTemplate(panel, scene.template);
    sceneLayer.appendChild(panel);

    // scene panel 已覆盖 host，此时 host 不可见，对原入口强制重绘
    // 预防 iOS Safari :active 卡住导致的侧滑返回按压态残留
    // 此时 reflow 安全无闪烁（host 被 scene panel 遮挡）
    if (entryEl) {
      forceHostEntriesRepaint(entryEl);
    }

    sceneStack.push({ routeId: scene.routeId, host: panel, scene: scene });
    appState.currentRouteId = scene.routeId;
    if (typeof scene.init === 'function') scene.init(sceneContext(scene, panel));
  }

  var overlayHistoryActive = false;
  var overlayClosing = false;

  // overlay 打开时 push 一条 history state（不改变 hash），使侧滑返回先关模态再返回上一页
  function pushOverlayHistoryState(type) {
    if (type !== 'sheet' && type !== 'full-screen-modal') return;
    if (overlayHistoryActive) return;
    var state = { wegoOverlay: type };
    try {
      history.pushState(state, document.title, window.location.href);
      overlayHistoryActive = true;
    } catch (e) {}
  }

  // 侧滑/返回键触发 popstate 时，如果当前 overlay 占了一条 history，就关闭它
  // 传 animated=false：iOS 侧滑返回时系统已完成页面过渡，JS 不再叠加 CSS 退场动画
  window.addEventListener('popstate', function () {
    if (overlayHistoryActive && !overlayLayer.hidden) {
      overlayHistoryActive = false;
      closeOverlay(true, false);
    }
  });

  function openOverlay(type, template, options) {
    clearAllPressStates();
    options = options || {};
    // 打开新 overlay 前先清掉旧的（含历史记录）
    if (!overlayLayer.hidden) {
      if (overlayHistoryActive) {
        overlayHistoryActive = false;
        try { history.back(); } catch (e) {}
      }
      overlayLayer.hidden = true;
      overlayLayer.className = 'app-overlay-layer';
      overlayLayer.replaceChildren();
    }
    overlayClosing = false;
    overlayLayer.hidden = false;
    overlayLayer.className = 'app-overlay-layer app-overlay-layer--' + type;
    var panel = document.createElement('div');
    panel.className = 'app-overlay-panel';
    panel.setAttribute('role', type === 'modal' ? 'dialog' : 'region');
    if (options.label) panel.setAttribute('aria-label', options.label);
    renderTemplate(panel, template);
    overlayLayer.replaceChildren(panel);
    pushOverlayHistoryState(type);
    if (typeof options.init === 'function') {
      options.init({
        root: panel,
        close: closeOverlay,
        toast: toast,
        updateEntrySummary: updateEntrySummary,
        navigate: navigate
      });
    }
  }

  // skipHistory：由 popstate 触发关闭时传 true，不再回退 history（state 已被消费）
  // animated：可选，默认 true 带退场动画；popstate/侧滑返回传 false 无动画
  //   （iOS 系统侧滑返回已有系统级动画，JS 再叠加 CSS 退场会导致 panel "先重新出现再滑出"闪烁）
  function closeOverlay(skipHistory, animated) {
    clearAllPressStates();
    if (overlayClosing) return;
    var panel = overlayLayer.querySelector('.app-overlay-panel');
    var isSheet = overlayLayer.classList.contains('app-overlay-layer--sheet');
    var isFullScreenModal = overlayLayer.classList.contains('app-overlay-layer--full-screen-modal');
    if (panel && (isSheet || isFullScreenModal)) {
      if (!skipHistory && overlayHistoryActive) {
        // 用户主动关闭：先清 flag 再 history.back()，避免 popstate 再次触发
        overlayHistoryActive = false;
        try { history.back(); } catch (e) {}
      }
      if (animated === false) {
        // 无动画：直接清除（用于 popstate/侧滑返回，系统动画已完成）
        overlayLayer.hidden = true;
        overlayLayer.className = 'app-overlay-layer';
        overlayLayer.replaceChildren();
        overlayClosing = false;
        return;
      }
      overlayClosing = true;
      panel.classList.add('app-overlay-panel--exit');
      var onTransitionEnd = function () {
        panel.removeEventListener('transitionend', onTransitionEnd);
        overlayLayer.hidden = true;
        overlayLayer.className = 'app-overlay-layer';
        overlayLayer.replaceChildren();
        overlayClosing = false;
      };
      panel.addEventListener('transitionend', onTransitionEnd);
      return;
    }
    overlayLayer.hidden = true;
    overlayLayer.className = 'app-overlay-layer';
    overlayLayer.replaceChildren();
  }

  function closeTopLayer() {
    if (!overlayLayer.hidden) {
      closeOverlay();
      return;
    }
    // push 场景栈式返回：只弹顶层，下层自然显露
    popSceneLayer(function () {
      if (sceneStack.length === 0 && window.location.hash) {
        history.pushState('', document.title, window.location.pathname + window.location.search);
      }
    });
  }

  // toast 自动关闭时长，与 toast 组件规范一致
  var TOAST_DEFAULT_DURATION = 4000;
  var TOAST_GUIDE_DURATION = 4500;
  var TOAST_LEAVE_DURATION = 200;
  // 引导 toast 允许的 4 种图标（与 toast.json 契约一致，禁止自定义）
  var TOAST_GUIDE_ICONS = ['icon-goutoast', 'icon-chatoast', 'icon-tanhao', 'icon-shijian'];
  var currentToast = null;
  var toastLeaveTimer = 0;
  var toastRemoveTimer = 0;

  function clearToastTimers() {
    if (toastLeaveTimer) { clearTimeout(toastLeaveTimer); toastLeaveTimer = 0; }
    if (toastRemoveTimer) { clearTimeout(toastRemoveTimer); toastRemoveTimer = 0; }
  }

  function removeCurrentToast() {
    if (!currentToast) return;
    var old = currentToast;
    currentToast = null;
    old.classList.remove('is-visible');
    old.classList.add('is-leaving');
    var ref = old;
    toastRemoveTimer = setTimeout(function () {
      if (ref.parentNode) ref.parentNode.removeChild(ref);
    }, TOAST_LEAVE_DURATION);
  }

  // 入参形态：
  //   toast('文本')                                   → 默认变体，纯文本居中
  //   toast({ variant:'guide', icon, text, action, onAction, duration })
  //     - variant: 'default' | 'guide'，默认 'default'
  //     - icon:    仅 guide 生效，限定 TOAST_GUIDE_ICONS 四种
  //     - text:    必选，主文案
  //     - action:  { label, mode:'weak'|'strong' }，可选
  //     - onAction: 点击 action 时的回调，可选；执行后立即隐藏 toast
  function toast(message) {
    if (!message) return;
    var opts = (typeof message === 'string') ? { variant: 'default', text: message } : message;
    if (!opts || !opts.text) return;
    var variant = opts.variant === 'guide' ? 'guide' : 'default';
    var isGuide = variant === 'guide';

    clearToastTimers();
    // 清理残留的淡出中 toast（避免 onAction 链式调用 ctx.toast 时旧 toast DOM 残留）
    var leavingToasts = toastHost.querySelectorAll('.toast.is-leaving');
    leavingToasts.forEach(function (t) { t.remove(); });
    removeCurrentToast();

    var el = document.createElement('div');
    el.className = 'toast toast--' + variant + ' is-floating';

    // 引导 toast 可选图标（限定 4 种）
    if (isGuide && opts.icon && TOAST_GUIDE_ICONS.indexOf(opts.icon) !== -1) {
      var icon = document.createElement('span');
      icon.className = 'toast__icon ' + opts.icon;
      el.appendChild(icon);
    }

    var text = document.createElement('span');
    text.className = 'toast__text';
    text.textContent = opts.text;
    el.appendChild(text);

    // 引导 toast 可选操作按钮（weak 带右箭头，strong 不带）
    if (isGuide && opts.action && opts.action.label) {
      var mode = opts.action.mode === 'strong' ? 'strong' : 'weak';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toast__action toast__action--' + mode;
      var btnText = document.createElement('span');
      btnText.className = 'toast__action-text';
      btnText.textContent = opts.action.label;
      btn.appendChild(btnText);
      if (mode === 'weak') {
        var arrow = document.createElement('span');
        arrow.className = 'toast__action-arrow icon-youjiantou16';
        btn.appendChild(arrow);
      }
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (typeof opts.onAction === 'function') {
          try { opts.onAction(); } catch (err) {}
        }
        removeCurrentToast();
      });
      el.appendChild(btn);
    }

    // 引导 toast 整体热区：点击任意位置触发 action 的点击行为；无 action 直接隐藏
    if (isGuide) {
      el.addEventListener('click', function () {
        var actionBtn = el.querySelector('.toast__action');
        if (actionBtn) {
          actionBtn.click();
        } else {
          removeCurrentToast();
        }
      });
    }

    toastHost.appendChild(el);
    currentToast = el;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('is-visible');
      });
    });
    var duration = typeof opts.duration === 'number' ? opts.duration
      : (isGuide ? TOAST_GUIDE_DURATION : TOAST_DEFAULT_DURATION);
    toastLeaveTimer = setTimeout(function () { removeCurrentToast(); }, duration);
  }

  function updateEntrySummary(routeId, summary) {
    var entries = document.querySelectorAll('[data-route-id="' + CSS.escape(routeId) + '"]');
    entries.forEach(function (entry) {
      var summaryEl = entry.querySelector('[data-entry-summary]');
      if (!summaryEl) {
        summaryEl = document.createElement('span');
        summaryEl.className = 'cell__action-text';
        summaryEl.dataset.entrySummary = '';
        var action = entry.querySelector('.cell__action');
        if (action) action.prepend(summaryEl);
      }
      summaryEl.textContent = summary || '';
    });
  }

  function openScene(scene) {
    var presentation = normalizePresentation(scene);
    if (presentation.type === 'push') {
      closeOverlay();
      openPushScene(scene);
      return;
    }
    var template = scene.template || '';
    var init = function (ctx) {
      if (typeof scene.init === 'function') scene.init(sceneContext(scene, ctx.root));
    };
    openOverlay(presentation.type, template, { label: scene.title, init: init });
  }

  function openRoute(routeId) {
    if (!routeId) return;
    var config = routeConfigs.get(routeId);
    if (config) {
      ensureStyle(config.style);
      ensureScript(routeId, config.script).then(function () {
        runScene(routeId);
      }).catch(function () {
        toast('场景脚本加载失败');
      });
      return;
    }
    runScene(routeId);
  }

  function runScene(routeId) {
    var scene = scenes.get(routeId);
    if (!scene) {
      toast('该入口尚未接入原型');
      return;
    }
    openScene(scene);
  }

  function cellEntryMarkup(route) {
    var entry = route.entry || {};
    var label = entry.label || route.scene || route.routeId;
    var parent = entry.parentEntry || '';
    var indent = parent ? ' cell--indent' : '';
    var parentAttr = parent ? ' data-parent-entry="' + parent + '"' : '';
    return ''
      + '<button type="button" class="cell cell--single cell--bg-white cell--clickable cell--divider-center' + indent + '" data-route-id="' + route.routeId + '" data-entry-label="' + label + '"' + parentAttr + '>'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + label + '</span></div>'
      +     '</div>'
      +     '<div class="cell__action">'
      +       '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>'
      +     '</div>'
      +   '</div>'
      + '</button>';
  }

  function gridEntryMarkup(route) {
    var entry = route.entry || {};
    var label = entry.label || route.scene || route.routeId;
    var icon = entry.icon || './lib/icons/app-center/标签管理.svg';
    return ''
      + '<button type="button" class="host-shell-grid-entry" data-route-id="' + route.routeId + '" data-entry-label="' + label + '">'
      +   '<img src="' + icon + '" alt="" class="host-shell-grid-entry__icon" />'
      +   '<span class="host-shell-grid-entry__label">' + label + '</span>'
      + '</button>';
  }

  function mountRouteEntries() {
    routes.forEach(function (route) {
      if (!route || !route.routeId) return;
      if (document.querySelector('[data-route-id="' + CSS.escape(route.routeId) + '"]')) return;
      var entry = route.entry || {};
      var groupName = entry.group || (entry.tab === 'workspace' ? 'workspace-tools' : 'my-settings');
      var group = document.querySelector('[data-entry-group="' + CSS.escape(groupName) + '"]');
      if (!group) return;
      group.insertAdjacentHTML('beforeend', entry.type === 'grid-entry' ? gridEntryMarkup(route) : cellEntryMarkup(route));
    });
  }

  function bindRouteEntries(root) {
    root = root || document;
    var entries = root.querySelectorAll('[data-route-id]');
    entries.forEach(function (entry) {
      if (entry.dataset.routeBound === 'true') return;
      entry.dataset.routeBound = 'true';
      entry.addEventListener('click', function (event) {
        event.preventDefault();
        var routeId = entry.dataset.routeId;
        if (!routeId) return;
        var config = routeConfigs.get(routeId);
        if (config && config.entry && config.entry.tab) setActiveTab(config.entry.tab);
        navigate(routeId);
      });
    });
  }

  tabTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      closeOverlay();
      clearSceneLayer();
      // Tab 切换意味着用户离开当前功能模块，toast 不跨 Tab 保持
      clearToastTimers();
      removeCurrentToast();
      setActiveTab(trigger.dataset.hostTabTrigger);
    });
  });

  // 判断 routeId 是否已在 push 栈中（用于区分侧滑返回与前进导航）
  function isRouteInStack(routeId) {
    return sceneStack.some(function (entry) { return entry.routeId === routeId; });
  }

  // hashchange 处理：区分前进（navigate 触发）与后退（侧滑 / history.back 触发）
  // - 前进：routeId 不在栈中 → openRoute 打开新场景
  // - 后退到宿主：hash 变空 → 关闭顶层（overlay 或 push 场景）
  // - 后退到中间层级：routeId 在栈中但非栈顶 → popSceneLayer 弹一层，下层自然显露
  // - 栈顶已匹配：无操作（避免重复打开）
  window.addEventListener('hashchange', function () {
    var routeId = routeFromHash();

    // hash 变空：返回到宿主（iOS 侧滑 / history.back 最常见场景）
    if (!routeId) {
      if (!overlayLayer.hidden) {
        closeOverlay();
      } else if (sceneStack.length > 0) {
        // hashchange 触发的返回无动画：iOS 侧滑返回时系统已完成页面过渡动画，
        // JS 再叠加 CSS 退场会导致 panel "先重现再退出"闪烁
        popSceneLayer(null, false);
      }
      return;
    }

    if (sceneStack.length > 0) {
      var topEntry = sceneStack[sceneStack.length - 1];
      if (topEntry.routeId === routeId) {
        // 栈顶已匹配，无需重复打开
        return;
      }
      if (isRouteInStack(routeId)) {
        // routeId 在栈中但非栈顶：侧滑返回到中间层级，弹一层（无动画）
        popSceneLayer(null, false);
        return;
      }
    }

    // 前进或栈空时的初始路由：打开新场景
    openRoute(routeId);
  });

  window.WegoApp = {
    registerScene: function (scene) {
      if (!scene || !scene.routeId) return;
      scenes.set(scene.routeId, scene);
    },
    navigate: navigate,
    openRoute: openRoute,
    closeTopLayer: closeTopLayer,
    closeOverlay: closeOverlay,
    toast: toast,
    updateEntrySummary: updateEntrySummary,
    setActiveTab: setActiveTab,
    getState: function () { return appState; }
  };

  // 由 initTouchPressState 注入，用于侧滑返回后 / forward 导航时强制重绘 host 入口
  // 清除 iOS Safari 可能残留的 :active 合成层缓存
  var forceHostEntriesRepaint = function () {};

  // ── Global touch press state for mobile active feedback ──
  (function initTouchPressState() {
    if (!('ontouchstart' in window)) return;

    var pressSelector = [
      'button', '[role="button"]', '[role="radio"]', '[role="checkbox"]',
      '.btn', '.cell--clickable', '.navbar__left-btn', '.navbar__left-text',
      '.navbar__action', '.bottom-nav__item', '.form-body--clickable',
      '.form-body__select', '.form-body__upload', '.form-body__icon-action',
      '.counter__btn', '.icon-text-btn', '.wg-image--clickable', '.link',
      '.host-shell-grid-entry', '.host-shell-link-button', '[data-route-id]'
    ].join(', ');

    var startX = 0;
    var startY = 0;
    var moveThreshold = 10;
    var activeTouch = null;
    var suppressNextClick = false;

    function isDisabled(el) {
      if (el.disabled) return true;
      var closestDisabled = el.closest('[disabled], [aria-disabled="true"], [data-no-press]');
      return !!closestDisabled;
    }

    function clearPress() {
      if (pressedEl) {
        var el = pressedEl;
        el.classList.remove('is-pressed');
        // 强制同步样式重新计算，确保 :active 覆盖立即生效
        // 否则 touchend → click 之间无 paint 机会，按压态视觉上会持续到页面切换
        getComputedStyle(el).backgroundColor;
        pressedEl = null;
      }
    }

    // 兜底清理所有按压态，注入外部变量供页面切换调用
    clearAllPressStates = function () {
      document.querySelectorAll('.is-pressed').forEach(function (el) {
        el.classList.remove('is-pressed');
      });
      clearPress();
      activeTouch = null;
      suppressNextClick = false;
    };

    // 强制重绘 host 页面入口，清除 iOS Safari 可能残留的 :active 合成层缓存
    // 用于侧滑返回后 / forward 导航时，触发合成层重建，丢弃旧按压帧
    forceHostEntriesRepaint = function (targetEl) {
      if (targetEl) {
        // 精准重绘单个元素（forward 导航时 pressedEl 已知）
        try { targetEl.blur(); } catch (e) {}
        void targetEl.offsetWidth;  // 强制 layout，触发合成层重建
        return;
      }
      // 兜底：重绘所有 host 入口（侧滑返回时 pressedEl 已清空）
      var entries = document.querySelectorAll('[data-entry-group] [data-route-id]');
      for (var i = 0; i < entries.length; i++) {
        var el = entries[i];
        try { el.blur(); } catch (e) {}
        void el.offsetWidth;
      }
    };

    function findPressTarget(el) {
      if (!(el && el.closest)) return null;
      var target = el.closest(pressSelector);
      if (!target) return null;
      return isDisabled(target) ? null : target;
    }

    document.addEventListener('touchstart', function (event) {
      var touch = event.touches && event.touches[0];
      if (!touch) return;

      activeTouch = { x: touch.clientX, y: touch.clientY, moved: false };
      suppressNextClick = false;

      var target = findPressTarget(event.target);
      if (!target) return;
      clearPress();
      target.classList.add('is-pressed');
      pressedEl = target;
      startX = touch.clientX;
      startY = touch.clientY;
    }, { passive: true, capture: true });

    document.addEventListener('touchmove', function (event) {
      var touch = event.touches && event.touches[0];
      if (!touch || !activeTouch) return;

      if (!activeTouch.moved &&
          (Math.abs(touch.clientX - activeTouch.x) > moveThreshold ||
           Math.abs(touch.clientY - activeTouch.y) > moveThreshold)) {
        activeTouch.moved = true;
        clearPress();
      }
    }, { passive: true, capture: true });

    document.addEventListener('touchend', function () {
      clearPress();
      if (activeTouch && activeTouch.moved) {
        suppressNextClick = true;
      }
      activeTouch = null;
    }, { passive: true, capture: true });

    document.addEventListener('touchcancel', function () {
      clearPress();
      activeTouch = null;
      suppressNextClick = false;
    }, { passive: true, capture: true });

    // 抑制由滑动/侧滑返回产生的幽灵 click，避免误触设置入口等可点击元素
    document.addEventListener('click', function (event) {
      if (suppressNextClick) {
        suppressNextClick = false;
        event.preventDefault();
        event.stopPropagation();
      }
    }, { capture: true });

    // 页面隐藏时兜底清理，防止切回后残留按压态
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearAllPressStates();
    });
  })();

  mountRouteEntries();
  bindRouteEntries();
  setActiveTab('my');
  var initialRoute = routeFromHash();
  if (initialRoute) openRoute(initialRoute);
})();
