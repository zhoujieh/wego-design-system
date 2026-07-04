(function initWegoApp() {
  var shell = document.querySelector('[data-host-shell="true"]');
  if (!shell) return;

  var panels = Array.from(document.querySelectorAll('[data-host-tab]'));
  var tabTriggers = Array.from(document.querySelectorAll('[data-host-tab-trigger]'));
  var sceneLayer = document.querySelector('[data-scene-layer]');
  var overlayLayer = document.querySelector('[data-overlay-layer]');
  var toastEl = document.querySelector('[data-toast]');
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
  var toastTimer = 0;

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

  // 弹出 push 栈顶场景（带退场动画）。
  // - afterCallback: 可选，退场动画结束后执行（用于清空 hash 等）
  // - 如果栈内还有下层场景，下层场景会自然显露（DOM 未销毁），其 init 不重新调用
  // - 如果栈空，隐藏 sceneLayer，回到宿主
  function popSceneLayer(afterCallback) {
    var top = sceneStack[sceneStack.length - 1];
    if (!top) {
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
  window.addEventListener('popstate', function () {
    if (overlayHistoryActive && !overlayLayer.hidden) {
      overlayHistoryActive = false;
      closeOverlay(true);
    }
  });

  function openOverlay(type, template, options) {
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
  function closeOverlay(skipHistory) {
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

  function toast(message) {
    if (!message) return;
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastTimer = window.setTimeout(function () {
      toastEl.hidden = true;
      toastEl.textContent = '';
    }, 1800);
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
        popSceneLayer();
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
        // routeId 在栈中但非栈顶：侧滑返回到中间层级，弹一层
        popSceneLayer();
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

  mountRouteEntries();
  bindRouteEntries();
  setActiveTab('my');
  var initialRoute = routeFromHash();
  if (initialRoute) openRoute(initialRoute);
})();
