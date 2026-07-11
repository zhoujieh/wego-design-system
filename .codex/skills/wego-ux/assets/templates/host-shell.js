/*
 * 固定宿主模板交互基线
 *
 * 规则:
 * - 宿主 Tab 切换和 route_id 回填作为 wego-app 基线能力维护
 * - 同场景迭代时按 route_id 定位旧入口;不要按文案模糊匹配
 * - 业务页打开方式仍由 design_plan.page_presentation.type 决定
 */

(function initHostShell() {
  const shell = document.querySelector('[data-host-shell="true"]');
  if (!shell) return;

  const STORAGE_KEY = 'wego-host-shell-state';
  let memoryState = {};
  const panels = Array.from(document.querySelectorAll('[data-host-tab]'));
  const triggers = Array.from(document.querySelectorAll('[data-host-tab-trigger]'));
  const routeEntries = Array.from(document.querySelectorAll('[data-route-id]'));
  const validTabs = new Set(panels.map(panel => panel.dataset.hostTab));
  const triggerIconNames = {
    dongtai: 'dongtai',
    haoyou: 'haoyou',
    workspace: 'gongzuotai',
    xiaoxi: 'xiaoxi',
    my: 'wode'
  };

  function readState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : memoryState;
    } catch {
      return memoryState;
    }
  }

  function writeState(next) {
    memoryState = { ...next };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 静态文件预览或隐私模式可能禁用 localStorage，宿主仍需可点击。
    }
  }

  function iconSrcFor(img, iconName, active) {
    const current = img.getAttribute('src') || './lib/icons/tab-dongtai.svg';
    const prefix = current.slice(0, current.lastIndexOf('/') + 1);
    return `${prefix}tab-${active ? 'active-' : ''}${iconName}.svg`;
  }

  function setActiveTab(tab) {
    const nextTab = validTabs.has(tab) ? tab : 'my';
    panels.forEach(panel => {
      const active = panel.dataset.hostTab === nextTab;
      panel.hidden = !active;
      panel.classList.toggle('host-shell-page__panel--active', active);
    });
    triggers.forEach(trigger => {
      const active = trigger.dataset.hostTabTrigger === nextTab;
      trigger.classList.toggle('active', active);
      trigger.setAttribute('aria-selected', active ? 'true' : 'false');
      const img = trigger.querySelector('[data-tab-icon]');
      const iconName = img?.dataset.tabIcon || triggerIconNames[trigger.dataset.hostTabTrigger];
      if (img && iconName) {
        img.src = iconSrcFor(img, iconName, active);
      }
    });
    const next = readState();
    next.activeTab = nextTab;
    writeState(next);
  }

  function openEntry(entry) {
    const routeId = entry.dataset.routeId;
    if (!routeId) return;
    const payload = {
      routeId,
      entryLabel: entry.dataset.entryLabel || '',
      screenSrc: entry.dataset.screenSrc || '',
      parentEntry: entry.dataset.parentEntry || ''
    };
    const next = readState();
    next.lastEntry = payload;
    writeState(next);
    shell.dispatchEvent(new CustomEvent('wego:host-route', { detail: payload }));
  }

  function restore() {
    const state = readState();
    setActiveTab(state.activeTab || 'my');
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      setActiveTab(trigger.dataset.hostTabTrigger);
    });
  });

  routeEntries.forEach(entry => {
    entry.addEventListener('click', event => {
      if (entry.dataset.screenSrc) {
        event.preventDefault();
      }
      openEntry(entry);
    });
  });

  restore();

  window.wegoHostShell = {
    getState: readState,
    setActiveTab,
    openEntryByRouteId(routeId) {
      const entry = routeEntries.find(item => item.dataset.routeId === routeId);
      if (!entry) return null;
      openEntry(entry);
      return readState().lastEntry || null;
    },
    upsertRouteEntry(routeId, payload) {
      return { routeId, payload };
    }
  };
})();
