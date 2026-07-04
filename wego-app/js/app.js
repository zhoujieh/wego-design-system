(function initWegoApp() {
  const shell = document.querySelector('[data-host-shell="true"]');
  if (!shell) return;

  const panels = Array.from(document.querySelectorAll('[data-host-tab]'));
  const tabTriggers = Array.from(document.querySelectorAll('[data-host-tab-trigger]'));
  const sceneLayer = document.querySelector('[data-scene-layer]');
  const overlayLayer = document.querySelector('[data-overlay-layer]');
  const toastEl = document.querySelector('[data-toast]');
  const bottomNav = document.querySelector('[data-bottom-nav]');
  const validTabs = new Set(panels.map(panel => panel.dataset.hostTab));
  const routes = Array.isArray(window.WEGO_APP_ROUTES) ? window.WEGO_APP_ROUTES : [];
  const routeConfigs = new Map(routes.map(route => [route.routeId, route]));
  const scenes = new Map();
  const loadingScripts = new Map();
  const loadedStyles = new Set();
  const appState = {
    activeTab: 'my',
    currentRouteId: '',
    sceneState: Object.create(null)
  };
  let toastTimer = 0;

  const tabIconNames = {
    dongtai: 'dongtai',
    haoyou: 'haoyou',
    workspace: 'gongzuotai',
    xiaoxi: 'xiaoxi',
    my: 'wode'
  };

  function iconSrcFor(img, iconName, active) {
    const current = img.getAttribute('src') || './lib/icons/tab-dongtai.svg';
    const prefix = current.slice(0, current.lastIndexOf('/') + 1);
    return `${prefix}tab-${active ? 'active-' : ''}${iconName}.svg`;
  }

  function setActiveTab(tab) {
    const nextTab = validTabs.has(tab) ? tab : 'my';
    appState.activeTab = nextTab;
    panels.forEach(panel => {
      const active = panel.dataset.hostTab === nextTab;
      panel.hidden = !active;
      panel.classList.toggle('host-shell-page__panel--active', active);
    });
    tabTriggers.forEach(trigger => {
      const active = trigger.dataset.hostTabTrigger === nextTab;
      trigger.classList.toggle('active', active);
      trigger.setAttribute('aria-selected', active ? 'true' : 'false');
      const img = trigger.querySelector('[data-tab-icon]');
      const iconName = img?.dataset.tabIcon || tabIconNames[trigger.dataset.hostTabTrigger];
      if (img && iconName) img.src = iconSrcFor(img, iconName, active);
    });
  }

  function routeFromHash() {
    const raw = window.location.hash || '';
    const match = raw.match(/^#\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function navigate(routeId) {
    if (!routeId) return;
    if (window.location.hash === `#/${routeId}`) {
      openRoute(routeId);
      return;
    }
    window.location.hash = `#/${routeId}`;
  }

  function normalizePresentation(scene) {
    return {
      type: scene?.presentation?.type || 'push',
      transition: scene?.presentation?.transition || 'none',
      coversTabBar: Boolean(scene?.presentation?.coversTabBar)
    };
  }

  function ensureStyle(href) {
    if (!href || loadedStyles.has(href)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.sceneStyle = href;
    document.head.appendChild(link);
    loadedStyles.add(href);
  }

  function ensureScript(routeId, src) {
    if (!src || scenes.has(routeId)) return Promise.resolve();
    if (loadingScripts.has(src)) return loadingScripts.get(src);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`scene script load failed: ${src}`));
      document.body.appendChild(script);
    });
    loadingScripts.set(src, promise);
    return promise;
  }

  function clearSceneLayer() {
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
    const routeId = scene.routeId;
    if (!appState.sceneState[routeId]) appState.sceneState[routeId] = Object.create(null);
    return {
      routeId,
      root: host,
      state: appState.sceneState[routeId],
      appState,
      navigate,
      back() {
        closeTopLayer();
      },
      openModal(template, options = {}) {
        openOverlay('modal', template, options);
      },
      openSheet(template, options = {}) {
        openOverlay('sheet', template, options);
      },
      openFullScreenModal(template, options = {}) {
        openOverlay('full-screen-modal', template, options);
      },
      closeOverlay,
      toast,
      updateEntrySummary
    };
  }

  function openPushScene(scene) {
    const presentation = normalizePresentation(scene);
    sceneLayer.hidden = false;
    sceneLayer.className = 'app-scene-layer app-scene-layer--enter';
    sceneLayer.classList.toggle('app-scene-layer--cover-tab', presentation.coversTabBar);
    renderTemplate(sceneLayer, scene.template);
    appState.currentRouteId = scene.routeId;
    scene.init?.(sceneContext(scene, sceneLayer));
  }

  function openOverlay(type, template, options = {}) {
    overlayLayer.hidden = false;
    overlayLayer.className = `app-overlay-layer app-overlay-layer--${type}`;
    const panel = document.createElement('div');
    panel.className = 'app-overlay-panel';
    panel.setAttribute('role', type === 'modal' ? 'dialog' : 'region');
    if (options.label) panel.setAttribute('aria-label', options.label);
    renderTemplate(panel, template);
    overlayLayer.replaceChildren(panel);
    options.init?.({
      root: panel,
      close: closeOverlay,
      toast,
      updateEntrySummary,
      navigate
    });
  }

  function closeOverlay() {
    overlayLayer.hidden = true;
    overlayLayer.className = 'app-overlay-layer';
    overlayLayer.replaceChildren();
  }

  function closeTopLayer() {
    if (!overlayLayer.hidden) {
      closeOverlay();
      return;
    }
    clearSceneLayer();
    if (window.location.hash) history.pushState('', document.title, window.location.pathname + window.location.search);
  }

  function toast(message) {
    if (!message) return;
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastTimer = window.setTimeout(() => {
      toastEl.hidden = true;
      toastEl.textContent = '';
    }, 1800);
  }

  function updateEntrySummary(routeId, summary) {
    document.querySelectorAll(`[data-route-id="${CSS.escape(routeId)}"]`).forEach(entry => {
      let summaryEl = entry.querySelector('[data-entry-summary]');
      if (!summaryEl) {
        summaryEl = document.createElement('span');
        summaryEl.className = 'cell__action-text';
        summaryEl.dataset.entrySummary = '';
        const action = entry.querySelector('.cell__action');
        if (action) action.prepend(summaryEl);
      }
      summaryEl.textContent = summary || '';
    });
  }

  function openScene(scene) {
    const presentation = normalizePresentation(scene);
    if (presentation.type === 'push') {
      closeOverlay();
      openPushScene(scene);
      return;
    }
    const template = scene.template || '';
    const init = ctx => scene.init?.(sceneContext(scene, ctx.root));
    openOverlay(presentation.type, template, { label: scene.title, init });
  }

  async function openRoute(routeId) {
    if (!routeId) return;
    const config = routeConfigs.get(routeId);
    if (config) {
      ensureStyle(config.style);
      try {
        await ensureScript(routeId, config.script);
      } catch {
        toast('场景脚本加载失败');
        return;
      }
    }
    const scene = scenes.get(routeId);
    if (!scene) {
      toast('该入口尚未接入原型');
      return;
    }
    openScene(scene);
  }

  function cellEntryMarkup(route) {
    const label = route.entry?.label || route.scene || route.routeId;
    const parent = route.entry?.parentEntry || '';
    const indent = parent ? ' cell--indent' : '';
    return `
      <button type="button" class="cell cell--single cell--bg-white cell--clickable cell--divider-center${indent}" data-route-id="${route.routeId}" data-entry-label="${label}"${parent ? ` data-parent-entry="${parent}"` : ''}>
        <div class="cell__body">
          <div class="cell__content">
            <div class="cell__title-row"><span class="cell__title">${label}</span></div>
          </div>
          <div class="cell__action">
            <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
          </div>
        </div>
      </button>
    `;
  }

  function gridEntryMarkup(route) {
    const label = route.entry?.label || route.scene || route.routeId;
    const icon = route.entry?.icon || './lib/icons/app-center/标签管理.svg';
    return `
      <button type="button" class="host-shell-grid-entry" data-route-id="${route.routeId}" data-entry-label="${label}">
        <img src="${icon}" alt="" class="host-shell-grid-entry__icon" />
        <span class="host-shell-grid-entry__label">${label}</span>
      </button>
    `;
  }

  function mountRouteEntries() {
    routes.forEach(route => {
      if (!route?.routeId || document.querySelector(`[data-route-id="${CSS.escape(route.routeId)}"]`)) return;
      const entry = route.entry || {};
      const groupName = entry.group || (entry.tab === 'workspace' ? 'workspace-tools' : 'my-settings');
      const group = document.querySelector(`[data-entry-group="${CSS.escape(groupName)}"]`);
      if (!group) return;
      group.insertAdjacentHTML('beforeend', entry.type === 'grid-entry' ? gridEntryMarkup(route) : cellEntryMarkup(route));
    });
  }

  function bindRouteEntries(root = document) {
    root.querySelectorAll('[data-route-id]').forEach(entry => {
      if (entry.dataset.routeBound === 'true') return;
      entry.dataset.routeBound = 'true';
      entry.addEventListener('click', event => {
        event.preventDefault();
        const routeId = entry.dataset.routeId;
        if (!routeId) return;
        const config = routeConfigs.get(routeId);
        if (config?.entry?.tab) setActiveTab(config.entry.tab);
        navigate(routeId);
      });
    });
  }

  tabTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      closeOverlay();
      clearSceneLayer();
      setActiveTab(trigger.dataset.hostTabTrigger);
    });
  });

  window.addEventListener('hashchange', () => openRoute(routeFromHash()));

  window.WegoApp = {
    registerScene(scene) {
      if (!scene?.routeId) return;
      scenes.set(scene.routeId, scene);
    },
    navigate,
    openRoute,
    closeTopLayer,
    closeOverlay,
    toast,
    updateEntrySummary,
    setActiveTab,
    getState() {
      return appState;
    }
  };

  mountRouteEntries();
  bindRouteEntries();
  setActiveTab('my');
  const initialRoute = routeFromHash();
  if (initialRoute) openRoute(initialRoute);
})();
