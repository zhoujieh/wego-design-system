(function initWegoApp() {
  var shell = document.querySelector('[data-host-shell="true"]');
  if (!shell) return;

  // iOS standalone 模式键盘弹起时，env(safe-area-inset-bottom) 不会变为 0
  // 检测键盘状态，键盘弹起时将 --keyboard-safe-bottom 设为 0px
  var initialHeight = window.innerHeight;
  function syncKeyboardState() {
    var vv = window.visualViewport;
    var currentHeight = vv ? vv.height : window.innerHeight;
    // 可视高度小于初始高度的 80% 时认为键盘弹起
    var isKeyboardOpen = currentHeight < initialHeight * 0.8;
    var safeBottom = isKeyboardOpen ? '0px' : 'env(safe-area-inset-bottom, 0px)';
    document.documentElement.style.setProperty('--keyboard-safe-bottom', safeBottom);
  }
  syncKeyboardState();
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncKeyboardState);
  }
  window.addEventListener('resize', syncKeyboardState);

  var panels = Array.from(document.querySelectorAll('[data-host-tab]'));
  var tabTriggers = Array.from(document.querySelectorAll('[data-host-tab-trigger]'));
  var sceneLayer = document.querySelector('[data-scene-layer]');
  var overlayLayer = document.querySelector('[data-overlay-layer]');
  var toastHost = document.querySelector('[data-toast-host]');
  var dialogHost = document.querySelector('[data-dialog-host]');
  var bottomNav = document.querySelector('[data-bottom-nav]');
  var hostContent = document.querySelector('[data-host-content]');

  var validTabs = new Set(panels.map(function (panel) { return panel.dataset.hostTab; }));
  var routes = Array.isArray(window.WEGO_APP_ROUTES) ? window.WEGO_APP_ROUTES : [];
  var routeConfigs = new Map(routes.map(function (route) { return [route.routeId, route]; }));
  var hostTabSceneRoutes = new Map();
  routes.forEach(function (route) {
    if (route && route.routeId && route.entry && route.entry.type === 'host-tab' && route.entry.tab) {
      hostTabSceneRoutes.set(route.entry.tab, route);
    }
  });
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
    var current = img.getAttribute('src') || './lib/assets/icons/tab-dongtai.svg';
    var prefix = current.slice(0, current.lastIndexOf('/') + 1);
    return prefix + 'tab-' + (active ? 'active-' : '') + iconName + '.svg';
  }

  function resetHostTabScrollPositions() {
    // 主内容层不再承担滚动；仍回顶一次，清除旧实现或浏览器恢复的残留位置。
    if (hostContent) hostContent.scrollTop = 0;
    // 主 Tab 面板及显式标记的页内滚动区都要回顶，避免隐藏页面保留旧位置。
    panels.forEach(function (panel) {
      panel.scrollTop = 0;
      panel.scrollLeft = 0;
      panel.querySelectorAll('[data-tab-scroll]').forEach(function (scrollTarget) {
        scrollTarget.scrollTop = 0;
        scrollTarget.scrollLeft = 0;
      });
    });
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
    resetHostTabScrollPositions();

    tabTriggers.forEach(function (trigger) {
      var active = trigger.dataset.hostTabTrigger === nextTab;
      trigger.classList.toggle('active', active);
      trigger.setAttribute('aria-selected', active ? 'true' : 'false');
      var img = trigger.querySelector('[data-tab-icon]');
      var iconName = (img && img.dataset.tabIcon) || tabIconNames[trigger.dataset.hostTabTrigger];
      if (img && iconName) img.src = iconSrcFor(img, iconName, active);
    });
    mountHostTabScene(nextTab);
  }

  function routeFromHash() {
    var raw = window.location.hash || '';
    var match = raw.match(/^#\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function navigate(routeId) {
    if (!routeId) return;
    dismissToasts({ immediate: true });
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
    // 同时清空 overlay 栈（不触发退场动画）：每个 entry 的 history 状态一次性 replaceState 清掉
    if (overlayStack.length > 0) {
      try { history.replaceState(null, document.title, window.location.href); } catch (e) {}
      overlayStack.slice().forEach(function (entry) {
        if (entry.componentRoot.parentNode) entry.componentRoot.parentNode.removeChild(entry.componentRoot);
      });
      overlayStack = [];
      overlayLayer.hidden = true;
      overlayLayer.className = 'app-overlay-layer';
      overlayLayer.replaceChildren();
      overlayClosing = false;
    }
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
      dialog: dialog,
      updateEntrySummary: updateEntrySummary
    };
  }

  function mountHostTabScene(tab) {
    var config = hostTabSceneRoutes.get(tab);
    if (!config) return;
    var panel = document.querySelector('[data-host-tab="' + CSS.escape(tab) + '"]');
    if (!panel) return;
    if (panel.dataset.hostSceneRouteId === config.routeId) return;
    ensureStyle(config.style);
    ensureScript(config.routeId, config.script).then(function () {
      var scene = scenes.get(config.routeId);
      if (!scene) {
        toast('功能开发中');
        return;
      }
      renderTemplate(panel, scene.template);
      panel.classList.remove('host-shell-page__panel--blank');
      panel.dataset.hostSceneRouteId = config.routeId;
      if (typeof scene.init === 'function') scene.init(sceneContext(scene, panel));
      bindRouteEntries(panel);
    }).catch(function () {
      toast('场景脚本加载失败');
    });
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

  // overlay 栈：bottom-to-top 顺序，每个 entry = { type, componentRoot, historyPushed, closing }
  // type 取自 'sheet' | 'full-screen-modal'；栈顶是当前可见的最上层 overlay
  // 栈深度上限 OVERLAY_MAX_DEPTH（超过时强制关闭最旧的，保持栈顶不变）
  // 底层 overlay 不被销毁，DOM 与滚动位置都保留，新 overlay 直接叠加在它上方
  var overlayStack = [];
  var OVERLAY_MAX_DEPTH = 3;
  // 全局重入保护：任意 overlay 处于关闭动画中时，后续 openOverlay 调用会清空残留态
  var overlayClosing = false;
  // 用户主动关闭栈顶时置 true：closeOverlayEntry 内部 history.back() 触发的 popstate
  // 必须丢弃，否则栈顶已 splice，新栈顶（如下层 modal）会被 popstate 误关
  var closingTopByUser = false;

  // overlay 打开时 push 一条 history state（不改变 hash），使侧滑返回先关模态再返回上一页
  // 栈式 overlay：每层都独立 push 一条 history，popstate 按栈顶关闭
  function pushOverlayHistoryState(type) {
    if (type !== 'sheet' && type !== 'full-screen-modal') return;
    var state = { wegoOverlay: type };
    try {
      history.pushState(state, document.title, window.location.href);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 侧滑/返回键触发 popstate 时，如果栈顶 overlay 占了一条 history，就关闭它
  // 传 animated=false：iOS 侧滑返回时系统已完成页面过渡，JS 不再叠加 CSS 退场动画
  // closingTopByUser 防重入：用户主动关闭栈顶时 history.back() 触发的 popstate 必须丢弃
  window.addEventListener('popstate', function () {
    if (closingTopByUser) {
      closingTopByUser = false;
      return;
    }
    var top = overlayStack[overlayStack.length - 1];
    if (top && top.historyPushed) {
      top.historyPushed = false;
      closeOverlayEntry(top, true, false);
    }
  });

  function openOverlay(type, template, options) {
    clearAllPressStates();
    options = options || {};

    // 栈深度上限：超过时强制关闭最旧一层（保留栈顶 OVERLAY_MAX_DEPTH - 1 槽位给新 overlay）
    while (overlayStack.length >= OVERLAY_MAX_DEPTH) {
      console.warn('[wego-app] overlay stack exceeded max depth ' + OVERLAY_MAX_DEPTH + ', closing oldest');
      closeOverlayEntry(overlayStack[0], false, false);
    }

    overlayClosing = false;
    if (overlayStack.length === 0) {
      overlayLayer.hidden = false;
      overlayLayer.className = 'app-overlay-layer app-overlay-layer--' + type;
    } else {
      // 嵌套：组件根节点直接叠加挂载，overlayLayer 类名追加新的 type 标记
      overlayLayer.classList.add('app-overlay-layer--' + type);
    }

    // 模板直接挂载到 overlayLayer，第一个子元素即组件根节点（.actionsheet / .modal）；
    // 不再创建 .app-overlay-panel 包裹层，蒙层视觉与动画均由组件自身承担
    var temp = document.createElement('div');
    renderTemplate(temp, template);
    var componentRoot = temp.firstElementChild;
    if (!componentRoot) {
      if (overlayStack.length === 0) {
        overlayLayer.hidden = true;
        overlayLayer.className = 'app-overlay-layer';
      }
      return;
    }
    // 入场动画：组件根节点先设 closed，挂载后下一帧改 open 触发组件 CSS 过渡
    if (componentRoot.matches('.actionsheet, .modal')) {
      componentRoot.setAttribute('data-state', 'closed');
    }
    if (options.label) componentRoot.setAttribute('aria-label', options.label);
    overlayLayer.appendChild(componentRoot);

    // 旧栈顶（非最旧）变 under，新入栈的为 top
    var prevTop = overlayStack[overlayStack.length - 1];
    if (prevTop && prevTop.componentRoot) {
      prevTop.componentRoot.classList.remove('is-overlay-top');
      prevTop.componentRoot.classList.add('is-overlay-under');
    }
    componentRoot.classList.add('is-overlay-top');

    var entry = { type: type, componentRoot: componentRoot, historyPushed: false, closing: false };
    overlayStack.push(entry);

    // 栈式 history：每层独立 push 一条，侧滑返回逐层关闭
    if (pushOverlayHistoryState(type)) {
      entry.historyPushed = true;
    }

    if (typeof options.init === 'function') {
      options.init({
        root: componentRoot,
        // close 回调：始终关闭当前 entry（即 init 时所在的那一层），不影响下层
        close: function () { closeOverlayEntry(entry, false); },
        toast: toast,
        dialog: dialog,
        updateEntrySummary: updateEntrySummary,
        navigate: navigate
      });
    }
    if (componentRoot.matches('.actionsheet, .modal')) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          componentRoot.setAttribute('data-state', 'open');
        });
      });
    }
  }

  // skipHistory：由 popstate 触发关闭时传 true，不再回退 history（state 已被消费）
  // animated：可选，默认 true 带退场动画；popstate/侧滑返回传 false 无动画
  //   （iOS 系统侧滑返回已有系统级动画，JS 再叠加 CSS 退场会导致 panel "先重新出现再滑出"闪烁）
  // 外部 API：关闭栈顶 overlay
  function closeOverlay(skipHistory, animated) {
    if (overlayStack.length === 0) return;
    closeOverlayEntry(overlayStack[overlayStack.length - 1], skipHistory, animated);
  }

  // 关闭指定 entry（栈式 overlay 内部使用）
  // - 立即从栈中移除（防止后续 close 误关到该 entry，并让 newTop 立即恢复为栈顶视觉）
  // - 组件根节点保留在 DOM 中跑退场动画，动画结束后再摘除
  // - 同 entry 重复关闭会直接返回（closing 自旋保护）
  function closeOverlayEntry(entry, skipHistory, animated) {
    if (!entry || entry.closing) return;
    clearAllPressStates();
    var isSheet = entry.type === 'sheet';
    var isFullScreenModal = entry.type === 'full-screen-modal';
    if (!(isSheet || isFullScreenModal)) {
      // 非 sheet / full-screen-modal 类型不参与栈，外部兼容默认走原始清理
      if (entry.componentRoot.parentNode) entry.componentRoot.parentNode.removeChild(entry.componentRoot);
      return;
    }
    entry.closing = true;
    if (!skipHistory && entry.historyPushed) {
      // 用户主动关闭栈顶：history.back() 会触发 popstate，关闭流程内已把 entry splice 出去，
      // 新栈顶会被 popstate 误关。这里设标志让 popstate 丢弃本次事件。
      if (overlayStack[overlayStack.length - 1] === entry) {
        closingTopByUser = true;
        // 兜底：如果 popstate 因异常未触发（例如 iOS 系统限制），300ms 后清标志，避免影响后续 popstate
        setTimeout(function () {
          if (closingTopByUser) {
            console.warn('[wego-app] closingTopByUser 未被 popstate 消费，已自动清零');
            closingTopByUser = false;
          }
        }, 300);
      }
      // 用户主动关闭：先清 flag 再 history.back()，避免 popstate 再次触发
      entry.historyPushed = false;
      try { history.back(); } catch (e) {}
    }

    // 立即从栈中移除（保留 DOM 跑退场动画），并把新的栈顶恢复为 top 视觉
    var idx = overlayStack.indexOf(entry);
    if (idx !== -1) overlayStack.splice(idx, 1);
    var newTop = overlayStack[overlayStack.length - 1];
    if (newTop) {
      // overlayLayer 类名同步为新栈顶 type；新栈顶从 under 变回 top，蒙层透明度恢复
      overlayLayer.className = 'app-overlay-layer app-overlay-layer--' + newTop.type;
      newTop.componentRoot.classList.remove('is-overlay-under');
      newTop.componentRoot.classList.add('is-overlay-top');
    }

    if (animated === false) {
      finalizeCloseOverlayEntry(entry);
      // 与 popSceneLayer 对称：侧滑返回后强制重绘 host 入口，
      // 清除 iOS Safari 可能残留的 :active 合成层缓存
      forceHostEntriesRepaint();
      return;
    }
    overlayClosing = true;
    // 退场动画：组件根节点设 closed，触发组件 CSS 过渡（蒙层 opacity + 面板 translateY 同步退场）
    if (entry.componentRoot.matches('.actionsheet, .modal')) {
      entry.componentRoot.setAttribute('data-state', 'closed');
    }
    // 等待退场动画完成后清理（与 dialog 的 DIALOG_REMOVE_DELAY 一致，纯 setTimeout 更稳定，
    // 不依赖 transitionend 冒泡；actionsheet 根节点 opacity 过渡，modal-fullscreen 面板 transform 过渡，
    // transitionend 来源不一致，setTimeout 统一处理避免事件漏触发）
    var removeDelay = 280; // 250ms 过渡 + 30ms 缓冲
    setTimeout(function () { finalizeCloseOverlayEntry(entry); }, removeDelay);
  }

  // 实际摘除 entry 并维护容器（无动画与动画完成两个路径共用）
  // entry 已在 closeOverlayEntry 阶段从栈中移除，这里只做 DOM 摘除 + 容器收尾
  function finalizeCloseOverlayEntry(entry) {
    if (entry.componentRoot.parentNode) {
      entry.componentRoot.parentNode.removeChild(entry.componentRoot);
    }
    entry.closing = false;
    if (overlayStack.length === 0) {
      overlayLayer.hidden = true;
      overlayLayer.className = 'app-overlay-layer';
      overlayClosing = false;
    }
    // 栈非空：容器状态已在 closeOverlayEntry 时维护（newTop 切回 top），这里不动
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

  function getToastNodes() {
    return toastHost ? Array.from(toastHost.querySelectorAll('.toast')) : [];
  }

  function dismissToasts(options) {
    options = options || {};
    clearToastTimers();
    var toastNodes = getToastNodes();
    if (!currentToast && toastNodes.length === 0) return;
    currentToast = null;

    if (options.immediate) {
      toastNodes.forEach(function (node) { node.remove(); });
      return;
    }

    toastNodes.forEach(function (node) {
      node.classList.remove('is-visible');
      node.classList.add('is-leaving');
    });
    toastRemoveTimer = setTimeout(function () {
      toastNodes.forEach(function (node) { node.remove(); });
    }, TOAST_LEAVE_DURATION);
  }

  function removeCurrentToast() {
    dismissToasts();
  }

  function dismissToastForPageAction(event) {
    if (event && event.target && event.target.closest && event.target.closest('.toast')) return;
    dismissToasts({ immediate: true });
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

    // 同屏互斥：新 toast 出现前同步移除当前与离场中的旧 toast，避免短时并存。
    dismissToasts({ immediate: true });

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
        dismissToasts({ immediate: true });
        if (typeof opts.onAction === 'function') {
          try { opts.onAction(); } catch (err) {}
        }
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
          dismissToasts({ immediate: true });
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

  // ── Dialog API ──
  // 入参形态：
  //   dialog({ variant, title, content, icon, inputPlaceholder, buttons, onClose, closeByMask })
  //     - variant: 'text' | 'status' | 'title' | 'input'，默认 'text'
  //     - title:   必选，标题文案
  //     - content: 可选，正文文案（可含 HTML，如 <a class="link link--inline">）
  //     - icon:    仅 status 生效，'success' | 'warning' | 'danger'
  //     - inputPlaceholder: 仅 input 生效
  //     - buttons: [{ label, tone:'default'|'dismiss'|'confirm'|'danger'|'weak', onClick? }]，1-3 个
  //                未传 tone 时按 'default' 处理（一级文本 text-default）。
  //                同一 dialog 只能有一个主按钮（confirm 或 danger），其余按钮须使用 default/dismiss/weak。
  //     - onClose: 关闭后回调，可选
  //     - closeByMask: 默认 false（不点击遮罩关闭）。只有业务明确要求时才传 true，
  //                    由宿主在 scene.js 调用时显式声明，不在组件默认行为里开启。
  var DIALOG_REMOVE_DELAY = 250;
  var currentDialog = null;
  var dialogRemoveTimer = 0;
  var dialogLastFocus = null;

  function clearDialogTimer() {
    if (dialogRemoveTimer) { clearTimeout(dialogRemoveTimer); dialogRemoveTimer = 0; }
  }

  function removeCurrentDialog() {
    if (!currentDialog) return;
    var old = currentDialog;
    currentDialog = null;
    old.setAttribute('data-state', 'closed');
    var ref = old;
    var onClose = ref._onClose;
    dialogRemoveTimer = setTimeout(function () {
      if (ref.parentNode) ref.parentNode.removeChild(ref);
      if (dialogLastFocus) { try { dialogLastFocus.focus(); } catch (e) {} dialogLastFocus = null; }
      if (typeof onClose === 'function') { try { onClose(); } catch (e) {} }
    }, DIALOG_REMOVE_DELAY);
  }

  function getDialogIconClass(mode) {
    if (mode === 'success') return 'icon-gou';
    if (mode === 'warning' || mode === 'danger') return 'icon-tanhao';
    return '';
  }

  function bindDialogInputClear(wrapper) {
    var input = wrapper.querySelector('input');
    var clearBtn = wrapper.querySelector('.input-clear');
    if (!input || !clearBtn) return;
    function update() {
      clearBtn.style.display = input.value ? 'inline-flex' : 'none';
    }
    input.addEventListener('input', update);
    input.addEventListener('focus', update);
    clearBtn.addEventListener('click', function () {
      input.value = '';
      input.focus();
      update();
    });
    update();
  }

  function dialog(options) {
    if (!options || !options.title || !dialogHost) return;
    var variant = options.variant === 'status' || options.variant === 'title' || options.variant === 'input'
      ? options.variant : 'text';
    var buttons = Array.isArray(options.buttons) ? options.buttons.slice(0, 3) : [];
    if (buttons.length === 0) buttons = [{ label: '知道了', tone: 'default' }];

    // 同屏互斥：新 dialog 出现前同步移除当前与离场中的旧 dialog
    clearDialogTimer();
    if (currentDialog) {
      currentDialog.remove();
      currentDialog = null;
    }

    dialogLastFocus = document.activeElement;

    var dlg = document.createElement('div');
    dlg.className = 'dialog dialog--' + variant;
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('data-state', 'closed');
    dlg._onClose = options.onClose;

    var card = document.createElement('div');
    card.className = 'dialog__card';

    // body：信息区包装层
    var body = document.createElement('div');
    body.className = 'dialog__body';

    // header
    var header = document.createElement('div');
    header.className = 'dialog__header';
    if (variant === 'status' && options.icon) {
      var icon = document.createElement('span');
      icon.className = 'dialog__icon dialog__icon--' + options.icon + ' ' + getDialogIconClass(options.icon);
      icon.setAttribute('aria-hidden', 'true');
      header.appendChild(icon);
    }
    var title = document.createElement('h3');
    title.className = 'dialog__title';
    title.textContent = options.title;
    header.appendChild(title);
    body.appendChild(header);

    // content（可选，支持 HTML）
    if (options.content) {
      var content = document.createElement('div');
      content.className = 'dialog__content';
      if (typeof options.content === 'string' && options.content.indexOf('<') >= 0) {
        content.innerHTML = options.content;
      } else {
        content.textContent = options.content;
      }
      body.appendChild(content);
    }

    // input 变体
    if (variant === 'input') {
      var inputWrap = document.createElement('div');
      inputWrap.className = 'dialog__input';
      var wrapper = document.createElement('div');
      wrapper.className = 'input-wrapper';
      var input = document.createElement('input');
      input.type = 'text';
      input.placeholder = options.inputPlaceholder || '';
      input.setAttribute('aria-label', options.title);
      wrapper.appendChild(input);
      var clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'input-clear';
      clearBtn.setAttribute('aria-label', '清空');
      clearBtn.style.display = 'none';
      var clearIcon = document.createElement('i');
      clearIcon.className = 'icon-yuancha-mian';
      clearIcon.setAttribute('aria-hidden', 'true');
      clearBtn.appendChild(clearIcon);
      wrapper.appendChild(clearBtn);
      inputWrap.appendChild(wrapper);
      body.appendChild(inputWrap);
      bindDialogInputClear(wrapper);
    }

    card.appendChild(body);

    // actions
    var actions = document.createElement('div');
    actions.className = 'dialog__actions';
    var buttonsWrap = document.createElement('div');
    var buttonCount = buttons.length;
    var buttonsClass = 'dialog__buttons';
    if (buttonCount === 2) buttonsClass += ' dialog__buttons--dual';
    else if (buttonCount === 3) buttonsClass += ' dialog__buttons--triple';
    buttonsWrap.className = buttonsClass;

    buttons.forEach(function (b, idx) {
      if (idx > 0) {
        var divider = document.createElement('span');
        divider.className = 'dialog__divider';
        buttonsWrap.appendChild(divider);
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      var toneClass = 'dialog__btn';
      // 按 dialog 契约 5 种语义 tone 显式映射；未传 tone 时按 --default 处理（一级文本 text-default）
      if (b.tone === 'danger') toneClass += ' dialog__btn--danger';
      else if (b.tone === 'weak') toneClass += ' dialog__btn--weak';
      else if (b.tone === 'confirm') toneClass += ' dialog__btn--confirm';
      else if (b.tone === 'dismiss') toneClass += ' dialog__btn--dismiss';
      else toneClass += ' dialog__btn--default';
      btn.className = toneClass;
      btn.textContent = b.label;
      btn.addEventListener('click', function () {
        if (typeof b.onClick === 'function') {
          try { b.onClick({ close: removeCurrentDialog }); } catch (e) {}
        }
        removeCurrentDialog();
      });
      buttonsWrap.appendChild(btn);
    });
    actions.appendChild(buttonsWrap);
    card.appendChild(actions);

    dlg.appendChild(card);

    // closeByMask 默认 false：点击 overlay 空白处不关闭（与 dialog 契约一致）
    // 只有业务在 options 显式传 closeByMask: true 时才允许点击遮罩关闭
    dlg.addEventListener('click', function (e) {
      if (options.closeByMask === true && e.target === dlg) {
        removeCurrentDialog();
        return;
      }
      // 链接默认不关闭
      if (e.target.closest && e.target.closest('[data-link]')) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    dialogHost.appendChild(dlg);
    currentDialog = dlg;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        dlg.setAttribute('data-state', 'open');
        if (variant === 'input') {
          var inp = dlg.querySelector('input');
          if (inp) {
            setTimeout(function () { inp.focus(); }, 50);
            inp.addEventListener('keydown', function (e) {
              if (e.key === 'Enter') {
                e.preventDefault();
                var btns = dlg.querySelectorAll('.dialog__btn');
                if (btns.length > 0) btns[btns.length - 1].click();
              }
            });
          }
        }
      });
    });
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
    if (presentation.type === 'host-tab') {
      var config = routeConfigs.get(scene.routeId);
      var tab = config && config.entry && config.entry.tab;
      if (tab) setActiveTab(tab);
      return;
    }
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
    dismissToasts({ immediate: true });
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
      toast('功能开发中');
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
    var icon = entry.icon || './lib/assets/icons/app-center/标签管理.svg';
    return ''
      + '<button type="button" class="host-shell-grid-entry" data-route-id="' + route.routeId + '" data-entry-label="' + label + '">'
      +   '<img src="' + icon + '" alt="" class="host-shell-grid-entry__icon" />'
      +   '<span class="host-shell-grid-entry__label">' + label + '</span>'
      + '</button>';
  }

  function mountRouteEntries() {
    routes.forEach(function (route) {
      if (!route || !route.routeId) return;
      if (!route.entry) return;
      if (route.entry.type === 'host-tab') return;
      if (document.querySelector('[data-route-id="' + CSS.escape(route.routeId) + '"]')) return;
      var entry = route.entry;
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
      dismissToasts({ immediate: true });
      closeOverlay();
      clearSceneLayer();
      setActiveTab(trigger.dataset.hostTabTrigger);
    });
  });

  document.addEventListener('click', dismissToastForPageAction, { capture: true });

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
    // toast 由宿主全局管理，不跟随路由变化清理；保留给 toast 自身的 4s 自动关闭、
    // 互斥逻辑（toast 函数内部 dismissToasts）和下一次操作（dismissToastForPageAction）处理。
    // 前进导航（navigate）和切换 Tab（tabTriggers）仍会主动清理 toast。

    // hash 变空：返回到宿主（iOS 侧滑 / history.back 最常见场景）
    if (!routeId) {
      if (overlayStack.length > 0) {
        // hashchange 触发的关闭：iOS 侧滑返回时系统已完成页面过渡动画，
        // JS 不再叠加 CSS 退场动画，也不回退 history（state 已被消费）
        // 与 popstate 路径保持一致，避免 overlay 退场动画期间与 host 同时可见
        var top = overlayStack[overlayStack.length - 1];
        if (top.historyPushed) top.historyPushed = false;
        closeOverlay(true, false);
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
      '.form-body__upload', '.form-body__icon-action',
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
  setActiveTab('dongtai');
  var initialRoute = routeFromHash();
  if (initialRoute) openRoute(initialRoute);
})();
