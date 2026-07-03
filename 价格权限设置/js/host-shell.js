/*
 * 固定宿主模板交互基线
 *
 * 规则:
 * - 宿主 Tab 切换和 route_id 回填只在首次套壳后初始化一次
 * - 同任务迭代时按 route_id 定位旧入口;不要按文案模糊匹配
 * - 业务页打开方式仍由 design_consumption_plan.page_presentation.type 决定
 */

(function initHostShell() {
  const shell = document.querySelector('[data-host-shell="true"]');
  if (!shell) return;

  const STORAGE_KEY = 'wego-host-shell-state';
  const panels = Array.from(document.querySelectorAll('[data-host-tab]'));
  const triggers = Array.from(document.querySelectorAll('[data-host-tab-trigger]'));

  function readState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function writeState(next) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function setActiveTab(tab) {
    panels.forEach(panel => {
      const active = panel.dataset.hostTab === tab;
      panel.hidden = !active;
      panel.classList.toggle('host-shell-page__panel--active', active);
    });
    triggers.forEach(trigger => {
      const active = trigger.dataset.hostTabTrigger === tab;
      trigger.classList.toggle('active', active);
    });
    const next = readState();
    next.activeTab = tab;
    writeState(next);
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

  restore();

  window.wegoHostShell = {
    getState: readState,
    setActiveTab,
    upsertRouteEntry(routeId, payload) {
      return { routeId, payload };
    }
  };
})();
