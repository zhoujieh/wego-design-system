/*!
 * wego-app 走查工具 (Walkthrough Tool) - MVP
 * 权威源：.codex/skills/wego-design/runtime/walkthrough-tool.js
 * 基于 Web Components + Shadow DOM 实现
 */
(function () {
  'use strict';

  // ============================================================
  // 工具函数
  // ============================================================

  /** 简单事件总线 */
  class EventBus {
    constructor() {
      this._listeners = {};
    }
    on(event, callback) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(callback);
      return () => this.off(event, callback);
    }
    off(event, callback) {
      if (!this._listeners[event]) return;
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }
    emit(event, detail) {
      if (!this._listeners[event]) return;
      this._listeners[event].forEach(cb => {
        try { cb(detail); } catch (e) { console.error('[Walkthrough] event handler error:', e); }
      });
    }
  }

  /** 全局事件总线 */
  const bus = new EventBus();

  /** 全局状态 */
  const state = {
    walkthroughMode: false,
    annotationMode: false,
    selectedElement: null,
    changes: [],
    annotations: [],
    currentRoute: '',
    originalStyles: {}, // selector -> { 'css-property': 原始计算值 }
    pseudoStyles: {}, // "selector||before|after" -> { 'css-property': 值 }（注入 <head> 的规则）
    orderBaselines: {}, // 顺序移动：容器 selector -> 首次移动前的显示顺序快照（净零往返判断）
  };

  /** 变更记录 id → 元素引用（会话内存映射，不参与持久化）。
   *  还原时优先命中实际被改动的元素，避免 sticky 克隆/重复结构下 selector 解析歧义还原到错误的同构元素 */
  const changeElRefs = new Map();

  // ============================================================
  // 调试日志系统（用于移动端排查键盘不弹出、气泡不显示等问题）
  // ============================================================
  const debugLog = {
    entries: [],
    maxEntries: 300,
    add(type, message) {
      const now = new Date();
      const time = now.toLocaleTimeString('zh-CN', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
      this.entries.push({ time, type, message });
      if (this.entries.length > this.maxEntries) this.entries.shift();
      // 实时更新日志面板（如果已打开）
      try {
        const app = document.querySelector('wego-walkthrough');
        if (app && app._components && app._components.debugPanel && !app._components.debugPanel.hasAttribute('hidden')) {
          app._refreshDebugLog();
        }
      } catch (e) {}
    },
    format() {
      return this.entries.map(e => `[${e.time}] [${e.type}] ${e.message}`).join('\n');
    },
    clear() {
      this.entries = [];
    },
  };

  // ============================================================
  // Liaison 风格图标集（1.5px 线宽，圆角端点，20×20 视口）
  // ============================================================
const ICON_SVG = 'width="16" height="16" viewBox="0 0 256 256" fill="currentColor"';
  const ICONS = {
    pointer: `<svg ${ICON_SVG}><path d="M168,132.69,214.08,115l.33-.13A16,16,0,0,0,213,85.07L52.92,32.8A15.95,15.95,0,0,0,32.8,52.92L85.07,213a15.82,15.82,0,0,0,14.41,11l.78,0a15.84,15.84,0,0,0,14.61-9.59l.13-.33L132.69,168,184,219.31a16,16,0,0,0,22.63,0l12.68-12.68a16,16,0,0,0,0-22.63ZM195.31,208,144,156.69a16,16,0,0,0-26,4.93c0,.11-.09.22-.13.32l-17.65,46L48,48l159.85,52.2-45.95,17.64-.32.13a16,16,0,0,0-4.93,26h0L208,195.31Z"/></svg>`,
    chevronLeft: `<svg ${ICON_SVG}><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/></svg>`,
    chevronRight: `<svg ${ICON_SVG}><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/></svg>`,
    list: `<svg ${ICON_SVG}><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/></svg>`,
    more: `<svg ${ICON_SVG}><path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z"/></svg>`,
    database: `<svg ${ICON_SVG}><path d="M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64ZM69.61,53.08C85.07,44.65,105.81,40,128,40s42.93,4.65,58.39,13.08C200.12,60.57,208,70.38,208,80s-7.88,19.43-21.61,26.92C170.93,115.35,150.19,120,128,120s-42.93-4.65-58.39-13.08C55.88,99.43,48,89.62,48,80S55.88,60.57,69.61,53.08ZM186.39,202.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z"/></svg>`,
    close: `<svg ${ICON_SVG}><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>`,
    layoutColumn: `<svg ${ICON_SVG}><path d="M208,136H48a16,16,0,0,0-16,16v40a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V152A16,16,0,0,0,208,136Zm0,56H48V152H208v40Zm0-144H48A16,16,0,0,0,32,64v40a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V64A16,16,0,0,0,208,48Zm0,56H48V64H208v40Z"/></svg>`,
    layoutRow: `<svg ${ICON_SVG}><path d="M104,32H64A16,16,0,0,0,48,48V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,104,32Zm0,176H64V48h40ZM192,32H152a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,192,32Zm0,176H152V48h40Z"/></svg>`,
    gap: `<svg ${ICON_SVG}><path d="M237.66,133.66l-32,32a8,8,0,0,1-11.32-11.32L212.69,136H43.31l18.35,18.34a8,8,0,0,1-11.32,11.32l-32-32a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,11.32L43.31,120H212.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,237.66,133.66Z"/></svg>`,
    padding: `<svg ${ICON_SVG}><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z"/></svg>`,
    margin: `<svg ${ICON_SVG}><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z"/></svg>`,
    width: `<svg ${ICON_SVG}><path d="M237.66,133.66l-32,32a8,8,0,0,1-11.32-11.32L212.69,136H43.31l18.35,18.34a8,8,0,0,1-11.32,11.32l-32-32a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,11.32L43.31,120H212.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,237.66,133.66Z"/></svg>`,
    height: `<svg ${ICON_SVG}><path d="M117.66,170.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L72,188.69V48a8,8,0,0,1,16,0V188.69l18.34-18.35A8,8,0,0,1,117.66,170.34Zm96-96-32-32a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L168,67.31V208a8,8,0,0,0,16,0V67.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z"/></svg>`,
    fontSize: `<svg ${ICON_SVG}><path d="M87.24,52.59a8,8,0,0,0-14.48,0l-64,136a8,8,0,1,0,14.48,6.81L39.9,160h80.2l16.66,35.4a8,8,0,1,0,14.48-6.81ZM47.43,144,80,74.79,112.57,144ZM200,96c-12.76,0-22.73,3.47-29.63,10.32a8,8,0,0,0,11.26,11.36c3.8-3.77,10-5.68,18.37-5.68,13.23,0,24,9,24,20v3.22A42.76,42.76,0,0,0,200,128c-22.06,0-40,16.15-40,36s17.94,36,40,36a42.73,42.73,0,0,0,24-7.25,8,8,0,0,0,16-.75V132C240,112.15,222.06,96,200,96Zm0,88c-13.23,0-24-9-24-20s10.77-20,24-20,24,9,24,20S213.23,184,200,184Z"/></svg>`,
    fontWeight: `<svg ${ICON_SVG}><path d="M178.48,115.7A44,44,0,0,0,148,40H80a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8h80a48,48,0,0,0,18.48-92.3ZM88,56h60a28,28,0,0,1,0,56H88Zm72,136H88V128h72a32,32,0,0,1,0,64Z"/></svg>`,
    lineHeight: `<svg ${ICON_SVG}><path d="M208,56V200a8,8,0,0,1-16,0V136H64v64a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0v64H192V56a8,8,0,0,1,16,0Z"/></svg>`,
    alignLeft: `<svg ${ICON_SVG}><path d="M32,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H40A8,8,0,0,1,32,64Zm8,48H168a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16Zm176,24H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm-48,40H40a8,8,0,0,0,0,16H168a8,8,0,0,0,0-16Z"/></svg>`,
    alignCenter: `<svg ${ICON_SVG}><path d="M32,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H40A8,8,0,0,1,32,64ZM64,96a8,8,0,0,0,0,16H192a8,8,0,0,0,0-16Zm152,40H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm-24,40H64a8,8,0,0,0,0,16H192a8,8,0,0,0,0-16Z"/></svg>`,
    alignRight: `<svg ${ICON_SVG}><path d="M32,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H40A8,8,0,0,1,32,64ZM216,96H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,40H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,40H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/></svg>`,
    opacity: `<svg ${ICON_SVG}><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,16.37a86.4,86.4,0,0,1,16,3V212.67a86.4,86.4,0,0,1-16,3Zm32,9.26a87.81,87.81,0,0,1,16,10.54V195.83a87.81,87.81,0,0,1-16,10.54ZM40,128a88.11,88.11,0,0,1,80-87.63V215.63A88.11,88.11,0,0,1,40,128Zm160,50.54V77.46a87.82,87.82,0,0,1,0,101.08Z"/></svg>`,
    radius: `<svg ${ICON_SVG}><path d="M216,48V88a8,8,0,0,1-16,0V56H168a8,8,0,0,1,0-16h40A8,8,0,0,1,216,48ZM88,200H56V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H88a8,8,0,0,0,0-16Zm120-40a8,8,0,0,0-8,8v32H168a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,208,160ZM88,40H48a8,8,0,0,0-8,8V88a8,8,0,0,0,16,0V56H88a8,8,0,0,0,0-16Z"/></svg>`,
    stroke: `<svg ${ICON_SVG}><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z"/></svg>`,
    shadow: `<svg ${ICON_SVG}><path d="M120,208H72a8,8,0,0,1,0-16h48a8,8,0,0,1,0,16Zm64-16H160a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Zm-24,32H104a8,8,0,0,0,0,16h56a8,8,0,0,0,0-16Zm72-124a76.08,76.08,0,0,1-76,76H76A52,52,0,0,1,76,72a53.26,53.26,0,0,1,8.92.76A76.08,76.08,0,0,1,232,100Zm-16,0A60.06,60.06,0,0,0,96,96.46a8,8,0,0,1-16-.92q.21-3.66.77-7.23A38.11,38.11,0,0,0,76,88a36,36,0,0,0,0,72h80A60.07,60.07,0,0,0,216,100Z"/></svg>`,
    token: `<svg ${ICON_SVG}><path d="M223.68,66.15,135.68,18h0a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM216,175.82,128,224,40,175.82V80.18L128,32h0l88,48.17Z"/></svg>`,
    eyedropper: `<svg ${ICON_SVG}><path d="M224,67.3a35.79,35.79,0,0,0-11.26-25.66c-14-13.28-36.72-12.78-50.62,1.13L142.8,62.2a24,24,0,0,0-33.14.77l-9,9a16,16,0,0,0,0,22.64l2,2.06-51,51a39.75,39.75,0,0,0-10.53,38l-8,18.41A13.68,13.68,0,0,0,36,219.3a15.92,15.92,0,0,0,17.71,3.35L71.23,215a39.89,39.89,0,0,0,37.06-10.75l51-51,2.06,2.06a16,16,0,0,0,22.62,0l9-9a24,24,0,0,0,.74-33.18l19.75-19.87A35.75,35.75,0,0,0,224,67.3ZM97,193a24,24,0,0,1-24,6,8,8,0,0,0-5.55.31l-18.1,7.91L57,189.41a8,8,0,0,0,.25-5.75A23.88,23.88,0,0,1,63,159l51-51,33.94,34ZM202.13,82l-25.37,25.52a8,8,0,0,0,0,11.3l4.89,4.89a8,8,0,0,1,0,11.32l-9,9L112,83.26l9-9a8,8,0,0,1,11.31,0l4.89,4.89a8,8,0,0,0,11.33,0l24.94-25.09c7.81-7.82,20.5-8.18,28.29-.81a20,20,0,0,1,.39,28.7Z"/></svg>`,
    annotation: `<svg ${ICON_SVG}><path d="M88,96a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,96Zm8,40h64a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16Zm32,16H96a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16ZM224,48V156.69A15.86,15.86,0,0,1,219.31,168L168,219.31A15.86,15.86,0,0,1,156.69,224H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM48,208H152V160a8,8,0,0,1,8-8h48V48H48Zm120-40v28.7L196.69,168Z"/></svg>`,
    bug: `<svg ${ICON_SVG}><path d="M160,96a32,32,0,0,0-64,0v8H56a8,8,0,0,0,0,16H88.4A47.61,47.61,0,0,0,80,144v8H56a8,8,0,0,0,0,16H80v16a8,8,0,0,0,16,0V168h64v16a8,8,0,0,0,16,0V168h24a8,8,0,0,0,0-16H176v-8a47.61,47.61,0,0,0-8.4-24H200a8,8,0,0,0,0-16H160Zm-48,0a16,16,0,0,1,32,0v8H112Zm8,56a8,8,0,1,1,8-8A8,8,0,0,1,120,152Zm40,0a8,8,0,1,1,8-8A8,8,0,0,1,160,152Z"/></svg>`,
  };

  /** 获取当前场景路由 ID（用于 localStorage 数据隔离，保持稳定不变）
   *  wego-app 主 tab 切换会清空 hash，所以无 hash 时从当前激活的 panel 映射 routeId */
  function getCurrentRoute() {
    // 优先从 hash 获取子场景/弹窗路由（如代理商帮卖弹窗、全部应用等）
    const hash = window.location.hash || '';
    const match = hash.match(/#\/(.+)/);
    if (match) return match[1];
    // 无 hash 时，从当前激活的主 tab panel 获取场景（动态/好友/我的/工作台）
    try {
      const activePanel = document.querySelector('.host-shell-page__panel--active');
      if (activePanel && activePanel.dataset.hostTab) {
        const hostTab = activePanel.dataset.hostTab;
        const routes = window.WEGO_APP_ROUTES || [];
        const route = routes.find(r => r.entry && r.entry.type === 'host-tab' && r.entry.tab === hostTab);
        if (route) return route.routeId;
      }
    } catch (e) { /* DOM 或路由配置不可用时降级为 default */ }
    return 'default';
  }

  /** 获取场景显示名称（用于 Prompt 标题展示）
   *  优先用 entry.label；主 tab 场景（动态/好友/我的/工作台）没有 label，从 style 路径提取场景目录名；
   *  都没有时降级为路由 ID。
   *  @param {string} [routeId] 可选，不传时用当前路由 */
  function getRouteLabel(routeId) {
    const id = routeId || getCurrentRoute();
    if (id === 'default') return '首页';
    try {
      const routes = window.WEGO_APP_ROUTES || [];
      const route = routes.find(r => r.routeId === id);
      if (route) {
        // 优先用 entry.label（弹窗、工具类场景）
        if (route.entry && route.entry.label) return route.entry.label;
        // 主 tab 场景从 style 路径提取场景目录名（如 ./scenes/shop/动态/scene.css → 动态）
        if (route.style) {
          const match = route.style.match(/\/scenes\/[^/]+\/([^/]+)\//);
          if (match) return match[1];
        }
      }
    } catch (e) { /* 路由配置不可用时降级为 routeId */ }
    return id;
  }

  /** 获取当前场景显示名称（兼容旧调用） */
  function getCurrentRouteLabel() {
    return getRouteLabel();
  }

  /** 从预览 URL 解析 PR 号（GitHub Pages 预览路径固定为 /previews/pr-<N>/；本地预览无此路径返回 null） */
  function getCurrentPrNumber() {
    try {
      const m = (window.location.pathname || '').match(/\/previews\/pr-(\d+)\//);
      if (m && m[1]) return Number(m[1]);
    } catch (e) { /* ignore */ }
    return null;
  }

  /** 生成工单头部环境/PR 元信息：在线预览输出 PR 号；本地预览输出环境标记（便于 Agent 区分定位路径） */
  function getPreviewMetaLine() {
    const pr = getCurrentPrNumber();
    if (pr) return `**PR:** #${pr}`;
    return `**环境：本地预览（无 PR）**`;
  }

  /** 判断元素是否属于走查工具自身（包括 Shadow DOM 内部） */
  function isWalkthroughElement(el) {
    if (!el) return false;
    // 检查 Light DOM 中的祖先
    const lightTags = 'wego-walkthrough,wego-wt-style-panel,wego-wt-overview-panel,wego-wt-color-picker,wego-wt-toast,wego-wt-overlay,wego-wt-highlight';
    if (el.closest && el.closest(lightTags)) return true;
    // 检查 Shadow DOM：元素的根节点是否为走查工具的 shadowRoot
    try {
      const root = el.getRootNode ? el.getRootNode() : null;
      if (root && root.host && root.host.tagName === 'WEGO-WALKTHROUGH') return true;
    } catch (e) { /* ignore */ }
    return false;
  }

  /** 移动端 UA 判定（模块级，供面板定位等类方法使用） */
  const IS_MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  /** 选择器中应剔除的易变状态类（激活/展开/选中等运行时态，场景重建后会变化导致选择器失效） */
  const VOLATILE_CLASS_RE = /(^|--|-)(active|open|closed|hidden|visible|selected|current|focus|focused|hover|pressed|dragging|expanded|collapsed|disabled|loading|entering|leaving|shown|show)$/i;
  function isStableSelectorClass(c) {
    return !!c && !c.startsWith('wt-') && !c.startsWith('wego-') && !c.startsWith('data-wt') && !VOLATILE_CLASS_RE.test(c);
  }
  /** 提取元素完整稳定类列表（保留全部业务/组件类，供施工单区分组件类与业务类；易变状态类剔除） */
  function getStableClasses(el) {
    try {
      if (!el || !el.className || typeof el.className !== 'string') return [];
      return el.className.trim().split(/\s+/).filter(isStableSelectorClass);
    } catch (e) { return []; }
  }
  /** 取首个稳定类（历史兼容：elementClass 单类字段的取值来源） */
  function getFirstStableClass(el) {
    return getStableClasses(el)[0] || '';
  }
  /** 设计系统通用组件根类（业务类判定时排除，避免 btn/icon/card 等基类被误当业务类标注） */
  const GENERIC_COMPONENT_CLASSES = new Set([
    'btn','icon','card','cell','tag','badge','avatar','switch','input','search','checkbox','radio',
    'stack','navbar','dialog','modal','actionsheet','popmenu','popover','toast','metric','skeleton',
    'loading','result','layout-page','layout-scroll','layout-section','layout-flow','layout-split',
    'layout-grid','layout-scroll-row','sticky-region','bottom-nav','bottom-action-bar','counter',
    'numeric-keypad','tabs','form','image','link','field','label','title','content','footer','header',
  ]);
  /** 是否为通用组件基类（精确匹配根类，或 -- 变体属于通用组件） */
  function isGenericComponentClass(c) {
    if (!c) return true;
    const base = c.split('--')[0].split('__')[0];
    return GENERIC_COMPONENT_CLASSES.has(base) || GENERIC_COMPONENT_CLASSES.has(c);
  }
  /** 按记录的选择器找元素；精确匹配失败时剔除易变状态类后重试，兼容历史数据 */
  function queryTargetEl(selector) {
    if (!selector) return null;
    let el = null;
    try { el = document.querySelector(selector); } catch (e) { return null; }
    if (el) return el;
    try {
      const relaxed = selector.replace(/\.([A-Za-z0-9_-]+)/g, (m, cls) => VOLATILE_CLASS_RE.test(cls) ? '' : m);
      if (relaxed !== selector) {
        const list = document.querySelectorAll(relaxed);
        if (list.length) return list[0];
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  /** 从元素最近的 host-tab 面板映射 routeId（用于 default 残留数据的场景归属迁移）；
   *  元素不在任何 host-tab 面板内（如 hash 子场景/弹窗）时返回 null */
  function routeIdFromHostPanel(el) {
    if (!el || !el.closest) return null;
    try {
      const panel = el.closest('.host-shell-page__panel');
      if (panel && panel.dataset.hostTab) {
        const hostTab = panel.dataset.hostTab;
        const routes = window.WEGO_APP_ROUTES || [];
        const route = routes.find(r => r.entry && r.entry.type === 'host-tab' && r.entry.tab === hostTab);
        if (route) return route.routeId;
      }
    } catch (e) { /* 结构或路由配置异常时按未命中处理 */ }
    return null;
  }

  /** 纯 nth 兜底链（原逻辑，用于优雅降级） */
  function buildNthChain(el) {
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== document.body) {
      let part = node.tagName.toLowerCase();
      if (node.className && typeof node.className === 'string') {
        const classes = node.className.trim().split(/\s+/).filter(c => isStableSelectorClass(c));
        if (classes.length) part += '.' + classes.slice(0, 4).join('.');
      }
      const parent = node.parentNode;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === node.tagName);
        if (siblings.length > 1) {
          const idx = siblings.indexOf(node) + 1;
          part += `:nth-of-type(${idx})`;
        }
      }
      parts.unshift(part);
      if (node.id && document.querySelectorAll('#' + CSS.escape(node.id)).length === 1) {
        parts[0] = '#' + node.id;
        break;
      }
      node = node.parentNode;
    }
    return parts.join(' > ');
  }

  /** 执行一轮 default 残留数据迁移（模块级，walkthrough 与 overview-panel 共用）
   *  修复前主 tab 切换清空 hash，getCurrentRoute() 一直返回 default，所有主 tab 的变更/批注
   *  都混在 default 下无法自动拆分。此函数逐条按 selector 在 DOM 中定位元素 →
   *  routeIdFromHostPanel 映射 routeId → 归并到正确场景 key；全部迁移（或无可迁移）后清空 default，
   *  未命中的元素（场景未挂载/已不存在）保留在 default 等待下次调用补迁。
   *  注：用户在某一主 tab 录过数据即访问过该场景（场景内容已挂载并保留在 DOM），故可定位。
   *  @returns {{ migratedCount:number, allMigrated:boolean }} 本轮迁移条数 & 是否已全部迁移 */
  function migrateLegacyDefaultData() {
    const KEY = 'wego.walkthrough.data.default';
    let migratedCount = 0;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { migratedCount: 0, allMigrated: true }; // 无残留
      const data = JSON.parse(raw);
      const changes = (data.changes || []).filter(c => c.newValue !== '' && c.newValue != null);
      const annotations = (data.annotations || []).filter(a => a.text && String(a.text).trim());
      if (!changes.length && !annotations.length) {
        localStorage.removeItem(KEY); // 空残留直接清理
        return { migratedCount: 0, allMigrated: true };
      }
      // 按 routeId 归集；无法定位的元素保留在 default
      const perRoute = {};
      const rest = { changes: [], annotations: [] };
      const pushRec = (routeId, kind, item) => {
        if (!perRoute[routeId]) perRoute[routeId] = { changes: [], annotations: [] };
        perRoute[routeId][kind].push(item);
        migratedCount++;
      };
      const resolveRoute = (selector) => {
        if (!selector) return null;
        let el = null;
        try { el = queryTargetEl(selector); } catch (e) { el = null; }
        if (!el || !el.isConnected) return null;
        return routeIdFromHostPanel(el);
      };
      changes.forEach(c => {
        const rid = resolveRoute(c.selector);
        if (rid) pushRec(rid, 'changes', c);
        else rest.changes.push(c);
      });
      annotations.forEach(a => {
        const rid = resolveRoute(a.selector);
        if (rid) pushRec(rid, 'annotations', a);
        else rest.annotations.push(a);
      });
      // 归并到目标场景 key（追加，不覆盖已有数据；同元素同属性已有记录时去重跳过，避免重复）
      Object.entries(perRoute).forEach(([routeId, rec]) => {
        if (!rec.changes.length && !rec.annotations.length) return;
        const targetKey = `wego.walkthrough.data.${routeId}`;
        let target = {};
        try { target = JSON.parse(localStorage.getItem(targetKey) || '{}'); } catch (e) { target = {}; }
        const existingChanges = target.changes || [];
        const keyOf = (item) => `${item.selector}||${item.target || ''}||${item.property}`;
        const existingKeys = new Set(existingChanges.map(keyOf));
        rec.changes.forEach(c => {
          if (existingKeys.has(keyOf(c))) return; // 目标场景已有同元素同属性记录，跳过避免重复
          existingChanges.push(c);
        });
        const existingAnn = target.annotations || [];
        const annKeyOf = (item) => `${item.selector}||${(item.text || '').trim()}`;
        const existingAnnKeys = new Set(existingAnn.map(annKeyOf));
        rec.annotations.forEach(a => {
          if (existingAnnKeys.has(annKeyOf(a))) return;
          existingAnn.push(a);
        });
        target.changes = existingChanges;
        target.annotations = existingAnn;
        target.lastModified = Date.now();
        if (!target.sceneRoute) target.sceneRoute = routeId;
        localStorage.setItem(targetKey, JSON.stringify(target));
      });
      const allMigrated = rest.changes.length === 0 && rest.annotations.length === 0;
      if (allMigrated) {
        localStorage.removeItem(KEY);
      } else if (migratedCount > 0) {
        // 部分迁移成功：写回 default 剩余数据，等待下次调用补迁
        localStorage.setItem(KEY, JSON.stringify({
          sceneRoute: 'default',
          lastModified: Date.now(),
          changes: rest.changes,
          annotations: rest.annotations,
        }));
      }
      return { migratedCount, allMigrated };
    } catch (e) {
      debugLog.add('MIGRATE', `default 数据迁移异常: ${e.message}`);
      return { migratedCount: 0, allMigrated: false };
    }
  }

  /**
   * 意图→语义类映射规则表（通用、可扩展）
   * 每条规则：{ klass, note, test(el, rec) }
   *   test 命中即认为"该改动应在源码加 klass 而非内联 CSS"
   * 未来新增套路（如 sticky-region 显隐、card--outlined 变体）只需追加一条。
   */
  const CLASS_INTENTS = [
    {
      klass: 'card--vertical',
      note: '卡片内"标题/网格"等段落需上下竖排，建议加 card--vertical 语义类，而非内联 flex-direction',
      test: (el, rec) => {
        if (!el || !el.className) return false;
        const cls = (' ' + el.className + ' ').replace(/\s+/g, ' ');
        const isCard = /(^| )card(-|--)/.test(cls.trim());
        return isCard && rec.property === 'flex-direction' && /column/.test(rec.newValue || '');
      },
    },
  ];

  /** 运行意图识别，返回 { intent, intentClass, skipCss, note } */
  function deriveIntent(rec, el) {
    for (const rule of CLASS_INTENTS) {
      try {
        if (rule.test(el, rec)) {
          return { intent: 'add-class', intentClass: rule.klass, skipCss: true, note: rule.note || '' };
        }
      } catch (e) { /* 规则异常不影响主流程 */ }
    }
    return { intent: 'css', intentClass: '', skipCss: false, note: '' };
  }

  /** 生成 CSS 选择器 */
  function generateSelector(el) {
    if (!el || el.nodeType !== 1) return '';
    // 1. 唯一 id
    if (el.id && document.querySelectorAll('#' + CSS.escape(el.id)).length === 1) {
      return '#' + el.id;
    }
    // 2. 稳定 data-* 属性
    const stableAttrs = ['data-component-slug', 'data-dom-id', 'data-scene-id'];
    for (const attr of stableAttrs) {
      const val = el.getAttribute(attr);
      if (val) {
        const selfCls = (el.className && typeof el.className === 'string')
          ? el.className.trim().split(/\s+/).filter(c => isStableSelectorClass(c))[0]
          : '';
        const selector = `${el.tagName.toLowerCase()}[${attr}="${val}"]${selfCls ? '.' + selfCls : ''}`;
        if (document.querySelectorAll(selector).length === 1) return selector;
      }
    }
    // 3. 语义锚点 + 类名链（弱化 nth，提升跨顺序稳定性）
    // 3a. 沿祖先向上找稳定锚点：唯一 id / data-component-slug / 强语义类（含下划线设计系统类）
    const STABLE_CLASS = /(__|\b(card|navbar|section|dialog|panel|list|grid|tab|form|page|app|home)\b)/i;
    let anchor = null;
    let anchorNode = el;
    while (anchorNode && anchorNode.nodeType === 1 && anchorNode !== document.body) {
      if (anchorNode.id && document.querySelectorAll('#' + CSS.escape(anchorNode.id)).length === 1) {
        anchor = '#' + anchorNode.id; break;
      }
      const slug = anchorNode.getAttribute && anchorNode.getAttribute('data-component-slug');
      if (slug) { anchor = `${anchorNode.tagName.toLowerCase()}[data-component-slug="${slug}"]`; break; }
      if (anchorNode.className && typeof anchorNode.className === 'string' && STABLE_CLASS.test(anchorNode.className)) {
        const cls = anchorNode.className.trim().split(/\s+/).filter(c => isStableSelectorClass(c))[0];
        const sel = cls ? '.' + cls : anchorNode.tagName.toLowerCase();
        if (document.querySelectorAll(sel).length === 1) { anchor = sel; break; }
        anchor = sel;
      }
      anchorNode = anchorNode.parentNode;
    }
    // 3b. 从目标到锚点（不含锚）拼接类名链，仅在不唯一时才加 nth
    const classesOf = (n) => (n.className && typeof n.className === 'string')
      ? n.className.trim().split(/\s+/).filter(c => isStableSelectorClass(c))
      : [];
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== document.body) {
      if (anchor && (node === anchorNode || node.id || (node.getAttribute && node.getAttribute('data-component-slug')))) break;
      let part = node.tagName.toLowerCase();
      const nodeClasses = classesOf(node);
      if (nodeClasses.length) part += '.' + nodeClasses.slice(0, 4).join('.');
      const parent = node.parentNode;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === node.tagName);
        if (siblings.length > 1 && nodeClasses.length === 0) {
          const idx = siblings.indexOf(node) + 1;
          part += `:nth-of-type(${idx})`;
        }
      }
      parts.unshift(part);
      node = node.parentNode;
    }
    let selector;
    if (anchor && parts.length) selector = anchor + ' > ' + parts.join(' > ');
    else if (parts.length) selector = parts.join(' > ');
    else selector = anchor || el.tagName.toLowerCase();
    // 验证唯一性：唯一则直接用，否则回退到完整 nth 链
    try {
      if (document.querySelectorAll(selector).length === 1) return selector;
    } catch (e) { /* ignore */ }
    return buildNthChain(el);
  }

  // ============================================================
  // 样式解析工具函数
  // ============================================================

  /** rgb/rgba 转 hex（不含透明度） */
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  }

  /** hsl(h, s, l) → [r, g, b]，h 为 0-360，s/l 为 0-1 */
  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [r * 255, g * 255, b * 255];
  }

  /** 解析颜色字符串为 {hex, opacity} */
  function parseColor(colorStr) {
    if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') {
      return { hex: '#FFFFFF', opacity: 0 };
    }
    // rgba(r, g, b, a)
    const rgbaMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1]);
      const g = parseInt(rgbaMatch[2]);
      const b = parseInt(rgbaMatch[3]);
      const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
      return { hex: rgbToHex(r, g, b), opacity: Math.round(a * 100) };
    }
    // hsla(h, s%, l%, a) — 部分 CSS 变量或过渡态可能返回此格式
    const hslMatch = colorStr.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (hslMatch) {
      const h = parseFloat(hslMatch[1]);
      const s = parseFloat(hslMatch[2]) / 100;
      const l = parseFloat(hslMatch[3]) / 100;
      const a = hslMatch[4] !== undefined ? parseFloat(hslMatch[4]) : 1;
      const [r, g, b] = hslToRgb(h, s, l);
      return { hex: rgbToHex(r, g, b), opacity: Math.round(a * 100) };
    }
    // #RRGGBB or #RGB
    const hexMatch = colorStr.match(/#([0-9A-Fa-f]{3,8})/);
    if (hexMatch) {
      let hex = hexMatch[1];
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      }
      if (hex.length === 8) {
        const alpha = parseInt(hex.substring(6, 8), 16);
        return { hex: '#' + hex.substring(0, 6).toUpperCase(), opacity: Math.round(alpha / 255 * 100) };
      }
      return { hex: '#' + hex.toUpperCase(), opacity: 100 };
    }
    return { hex: '#FFFFFF', opacity: 100 };
  }

  /** hex + opacity 转 rgba 字符串 */
  function hexOpacityToRgba(hex, opacity) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    const a = opacity / 100;
    if (a >= 1) return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  /** HTML 转义：页面文案/选择器/样式值插入 innerHTML 前必须转义，避免引号或尖括号破坏面板结构 */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** 判断值是否为 CSS 变量引用格式 var(--xxx) */
  function isTokenValue(value) {
    return /^var\(--[a-zA-Z0-9-]+\)$/.test(String(value || '').trim());
  }

  /** 解析 CSS 表达式（含 var()）的实际计算值，用临时元素让浏览器完成计算 */
  function resolveCssValue(expr, property) {
    if (!expr) return '';
    try {
      const el = document.createElement('div');
      el.style.display = 'none';
      el.style.setProperty(property || 'color', expr);
      document.body.appendChild(el);
      const computed = getComputedStyle(el).getPropertyValue(property || 'color');
      document.body.removeChild(el);
      return computed.trim();
    } catch (e) {
      return '';
    }
  }

  /** 解析数值（去掉单位） */
  function parseNumeric(value) {
    if (!value) return 0;
    const match = String(value).match(/^([\d.-]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /** 宽/高是否为语义值（非固定 px） */
  function isSemanticSize(value) {
    return /^(100%|auto|fit-content|min-content|max-content|inherit|initial|unset)$/i.test(String(value || '').trim());
  }
  function isSemanticWidth(v) { return isSemanticSize(v); }
  function isSemanticHeight(v) { return isSemanticSize(v); }

  /** 解析 box-shadow 字符串为图层数组 */
  function parseBoxShadow(shadowStr) {
    if (!shadowStr || shadowStr === 'none') return [];
    const layers = [];
    // 简单解析：按逗号分割，但 rgba 中的逗号不能分割
    const parts = [];
    let current = '';
    let parenDepth = 0;
    for (const ch of shadowStr) {
      if (ch === '(') parenDepth++;
      if (ch === ')') parenDepth--;
      if (ch === ',' && parenDepth === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) parts.push(current.trim());

    for (const part of parts) {
      const inset = part.startsWith('inset ');
      const rest = inset ? part.substring(6) : part;
      const tokens = rest.split(/\s+/);
      const colorToken = tokens.find(t => t.startsWith('#') || t.startsWith('rgb') || t.startsWith('hsl'));
      const nums = tokens.filter(t => !t.startsWith('#') && !t.startsWith('rgb') && !t.startsWith('hsl')).map(parseNumeric);
      layers.push({
        inset,
        x: nums[0] || 0,
        y: nums[1] || 0,
        blur: nums[2] || 0,
        spread: nums[3] || 0,
        ...parseColor(colorToken || 'rgba(0,0,0,0)'),
      });
    }
    return layers;
  }

  /**
   * 读取元素某个 CSS 属性的原始声明值（specified value），而非 getComputedStyle 返回的计算像素值。
   * 优先级：内联 style → 匹配的样式表规则 → 空字符串（调用方 fallback 到计算值）。
   * 用于 width/height 的尺寸模式判断：getComputedStyle 总是返回 px，无法区分 auto/100%/fit-content。
   */
  function getSpecifiedValue(el, prop) {
    // 1. 内联样式优先
    const inline = el.style.getPropertyValue(prop);
    if (inline) return inline.trim();
    // 2. 遍历同源样式表规则，找最后一个匹配的声明
    try {
      let result = '';
      for (const sheet of document.styleSheets) {
        if (sheet.disabled) continue;
        let rules;
        try { rules = sheet.cssRules; } catch (e) { continue; } // 跨域跳过
        if (!rules) continue;
        for (const rule of rules) {
          if (rule.type !== 1) continue; // 只看 STYLE_RULE
          try {
            if (el.matches(rule.selectorText)) {
              const v = rule.style.getPropertyValue(prop);
              if (v) result = v.trim(); // 后匹配的覆盖先匹配的（CSS 层叠顺序）
            }
          } catch (e) { /* selectorText 可能非法，跳过 */ }
        }
      }
      if (result) return result;
    } catch (e) { /* ignore */ }
    return '';
  }

  /** 从元素读取样式，转换为面板数据（target: '' | 'before' | 'after'） */
  function getElementStyleData(el, target) {
    const cs = getComputedStyle(el, target ? '::' + target : null);
    const color = parseColor(cs.color);
    const bgColor = parseColor(cs.backgroundColor);
    const borderColor = parseColor(cs.borderColor);
    const shadows = parseBoxShadow(cs.boxShadow);
    const shadow = shadows[0] || { inset: false, x: 0, y: 0, blur: 0, spread: 0, hex: '#000000', opacity: 0 };

    // 布局方向
    const display = cs.display;
    const isFlex = display === 'flex' || display === 'inline-flex';
    const layoutMode = isFlex ? (cs.flexDirection === 'row' || cs.flexDirection === 'row-reverse' ? 'row' : 'column') : 'column';

    // 对齐矩阵映射
    const jc = cs.justifyContent;
    const ai = cs.alignItems;
    const alignPreset = `${jc}|${ai}`;

    // 宽高：推导尺寸模式（fixed 固定 / auto 适应 / fill 填充），固定值去掉 px 只留数值回显
    // 优先用 CSS 原始声明值判断模式（getComputedStyle 总是返回 px，无法区分 auto/100%/fit-content）；
    // 无显式声明时：flex 子项按 flex-grow/basis 判断（拉伸→填充），块级默认填充，inline/绝对定位适应
    const sizeModeOf = (v) => {
      const s = String(v || '').trim().toLowerCase();
      if (s.includes('%')) return 'fill';
      if (/^(auto|fit-content|min-content|max-content|inherit|initial|unset)$/.test(s)) return 'auto';
      return 'fixed';
    };
    const sizeInputOf = (v, specified, mode) => {
      if (mode === 'fixed') return String(parseNumeric(v));
      return String(specified || '').trim();
    };
    const specifiedWidth = getSpecifiedValue(el, 'width');
    const specifiedHeight = getSpecifiedValue(el, 'height');
    const flexChild = isFlexChild(el);
    const widthMode = inferSizeMode(specifiedWidth, flexChild, cs, 'width');
    const heightMode = inferSizeMode(specifiedHeight, flexChild, cs, 'height');

    return {
      // 自动布局
      layoutMode,
      justifyContent: jc,
      alignItems: ai,
      alignPreset,
      layoutGap: parseNumeric(cs.gap || cs.rowGap),
      paddingTop: parseNumeric(cs.paddingTop),
      paddingRight: parseNumeric(cs.paddingRight),
      paddingBottom: parseNumeric(cs.paddingBottom),
      paddingLeft: parseNumeric(cs.paddingLeft),
      marginTop: parseNumeric(cs.marginTop),
      marginRight: parseNumeric(cs.marginRight),
      marginBottom: parseNumeric(cs.marginBottom),
      marginLeft: parseNumeric(cs.marginLeft),
      widthMode,
      heightMode,
      width: sizeInputOf(cs.width, specifiedWidth, widthMode),   // 固定值回显计算像素数值；语义值（auto/100%）原样保留
      height: sizeInputOf(cs.height, specifiedHeight, heightMode),
      display,
      position: cs.position,
      zIndex: parseNumeric(cs.zIndex),
      // 字体
      fontSize: parseNumeric(cs.fontSize),
      fontWeight: cs.fontWeight,
      colorHex: color.hex,
      colorOpacity: color.opacity,
      lineHeight: cs.lineHeight === 'normal' ? 1.4 : parseNumeric(cs.lineHeight),
      textAlign: cs.textAlign,
      // 外观
      layerOpacity: Math.round(parseNumeric(cs.opacity) * 100),
      borderRadiusAll: parseNumeric(cs.borderTopLeftRadius),
      // 填充（背景）
      fillHex: bgColor.hex,
      fillOpacity: bgColor.opacity,
      hasFill: bgColor.opacity > 0,
      // 描边
      strokeWidth: parseNumeric(cs.borderTopWidth),
      strokeHex: borderColor.hex,
      strokeOpacity: borderColor.opacity,
      strokePosition: 'outside', // CSS 默认外描边
      hasStroke: parseNumeric(cs.borderTopWidth) > 0,
      // 投影
      shadowInset: shadow.inset,
      shadowX: shadow.x,
      shadowY: shadow.y,
      shadowBlur: shadow.blur,
      shadowSpread: shadow.spread,
      shadowHex: shadow.hex,
      shadowOpacity: shadow.opacity,
      hasShadow: shadow.blur > 0 || shadow.x !== 0 || shadow.y !== 0,
    };
  }

  /** 应用单个属性到元素，返回 {property, oldValue, newValue} */
  function applyStyleProperty(el, property, value) {
    const oldValue = getComputedStyle(el)[property];
    el.style[property] = value;
    return { property, oldValue, newValue: value };
  }

  // ============================================================
  // 样式同步（共享元素模式）：编辑某属性时，若该属性为公共样式
  // （页面上多个元素共用同一属性值且由自身声明），自动同步应用到全部命中元素。
  // 对齐竞品 Liaison「共享元素模式」思路，但按「共用属性值」匹配，并强化防误判。
  // ============================================================

  /** 自动同步的命中数上限（含当前元素）；超过视为页面级基础样式/全局横扫，不自动同步。
   *  校准依据：真实场景探测显示公共属性命中多在 30~220（字号 219、行高 143、颜色 122、左边距 39、宽高比 46），
   *  上限过小（如 8）会让"公共样式同步"在真实页面上几乎不触发；60 可覆盖常见组件组（卡片/按钮/网格），
   *  同时挡住页级基础 Token 的静默全局改写。待用户侧增加"是否自动同步"开关后可再行放开。 */
  const MAX_SHARED_STYLE_COUNT = 60;

  /** 不参与自动同步的属性（结构性/元素专属，跨元素同步极易误改，如定位与层叠；尺寸在同类组件下放开同步） */
  const SHARED_SYNC_EXCLUDED_PROPS = new Set(['display', 'position', 'z-index']);

  /** 同类组件下放开声明检查的「布局/外观」属性：这些是"同类统一视觉/布局"的公共样式，
   *  即使未在 CSS 显式声明（CSS 默认值，如容器 justify-content/align-items 默认、按钮 flex 默认），
   *  同类组件也应一起同步成一致的最终值；仍以「同类 + 计算值一致」双校验兜底防误判。 */
  const LAYOUT_SYNC_EXEMPT_PROPS = new Set([
    'width', 'height', 'flex', 'order',
    'justify-content', 'align-items', 'align-self', 'align-content',
    'gap', 'row-gap', 'column-gap',
    'flex-direction', 'flex-wrap',
    'text-align',
  ]);

  /** CSS 值归一化（与 _cssValueEqual 的 norm 对齐），用于公共样式值匹配 */
  function normalizeCssValue(v) {
    return String(v == null ? '' : v).trim().replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').toLowerCase();
  }

  /** 把一组变更中的宽度/高度记录合并为一行「尺寸」，其余属性原样保留。
   *  宽高都改：显示 "尺寸 40px × 40px → 44px × 44px"；
   *  只改宽/只改高：显示 "尺寸·宽 40px → 48px" / "尺寸·高 40px → 48px"。 */
  function mergeSizeRows(changes) {
    const w = changes.filter(c => c.property === 'width');
    const h = changes.filter(c => c.property === 'height');
    if (!w.length && !h.length) return changes;
    const rest = changes.filter(c => c.property !== 'width' && c.property !== 'height');
    const wc = w[0], hc = h[0];
    const o = (c, s) => (c ? (s === 'old' ? c.oldValue : c.newValue) : null);
    const wOld = o(wc, 'old'), wNew = o(wc, 'new'), hOld = o(hc, 'old'), hNew = o(hc, 'new');
    if (wc && hc) {
      return [{ property: '尺寸', oldValue: `${wOld} × ${hOld}`, newValue: `${wNew} × ${hNew}` }, ...rest];
    }
    if (wc) return [{ property: '尺寸·宽', oldValue: wOld, newValue: wNew }, ...rest];
    return [{ property: '尺寸·高', oldValue: hOld, newValue: hNew }, ...rest];
  }

  /** 属性名展示文案（尺寸组显示为中文"尺寸"，flex 表达宽度模式显示为"宽度"，order 表达顺序显示为"顺序"） */
  function propertyLabel(p) {
    if (p === 'size') return '尺寸';
    if (p === 'flex') return '宽度';
    if (p === 'order') return '顺序';
    return p;
  }

  /** flex 值展示美化：尺寸模式下 fill/auto/fixed 的可读文案 */
  function formatFlexValue(v) {
    const s = String(v || '').trim();
    if (s === '1 1 0%') return '填充（拉伸占满）';
    if (s === '0 1 auto') return '适应（内容宽度）';
    const m = s.match(/^0 0 ([\d.]+)px$/);
    if (m) return '固定宽 ' + m[1] + 'px';
    return s;
  }

  /** 判断元素是否为 flex 容器的直接子项（决定尺寸模式切换用 flex 表达还是 width 表达） */
  function isFlexChild(el) {
    if (!el || el.nodeType !== 1) return false;
    const parent = el.parentElement;
    if (!parent) return false;
    try {
      const pcs = getComputedStyle(parent);
      return pcs.display === 'flex' || pcs.display === 'inline-flex';
    } catch (e) { return false; }
  }

  /** 容器内参与 flex 布局的直接子元素（跳过 display:none） */
  function flexItems(parent) {
    if (!parent) return [];
    try {
      return Array.from(parent.children).filter(ch => {
        const d = getComputedStyle(ch).display;
        return d !== 'none';
      });
    } catch (e) { return []; }
  }

  /** 元素的 order 计算值（未显式设置时浏览器返回 0） */
  function computedOrder(el) {
    try { return Number(getComputedStyle(el).order) || 0; } catch (e) { return 0; }
  }

  /** 父 flex 容器的显示顺序快照（order 升序、同 order 按 DOM 序），元素用 selector 标识；
   *  供顺序移动的净零往返判断（容器显示顺序回到首次移动前即视为无净变更）。 */
  function displaySeq(parent) {
    return flexItems(parent)
      .map((ch, i) => ({ ch, i }))
      .sort((a, b) => computedOrder(a.ch) - computedOrder(b.ch) || a.i - b.i)
      .map(x => generateSelector(x.ch));
  }

  /** 两个显示顺序快照是否一致 */
  function seqEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  /** 在主轴方向把元素向前/向后移动一位（用 CSS order 表达显示顺序，不改 DOM 结构）。
   *  dir: 'left'|'right'|'up'|'down'；仅主轴方向有效（row → 左右，column → 上下），
   *  交叉轴方向无顺序可调返回 null。
   *  返回 null 表示不可移动（非 flex 子项 / 交叉轴方向 / 已在边界）。
   *  返回 { el, neighbor, elOrder, elNew, nbOrder, nbNew, idxOld, idxNew }。
   *  移动规则：相邻两元素 order 相同（都未显式设置，默认 0）时，仅把目标元素设为相对值
   *  （前移 -1 / 后移 +1），兄弟不动；已显式设置且不同则互换两者。同类元素一起同步时各容器显示一致。
   *  注意：位置判断一律基于「显示顺序」（order 升序、同 order 按 DOM 顺序），
   *  因为 order 已表达显示顺序，DOM 顺序可能不再与视觉顺序一致。 */
  function moveFlexItem(el, dir) {
    if (!el || el.nodeType !== 1) return null;
    const parent = el.parentElement;
    if (!parent) return null;
    let pcs;
    try { pcs = getComputedStyle(parent); } catch (e) { return null; }
    if (!/flex/.test(pcs.display)) return null;
    const fd = pcs.flexDirection || 'row';
    const isColumn = fd.indexOf('column') === 0;
    const reverse = fd.indexOf('reverse') > 0;
    const onMainAxis = (dir === 'left' || dir === 'right') === !isColumn;
    if (!onMainAxis) return null;
    const ordered = flexItems(parent)
      .map((ch, i) => ({ ch, i }))
      .sort((a, b) => computedOrder(a.ch) - computedOrder(b.ch) || a.i - b.i)
      .map(x => x.ch);
    const idx = ordered.indexOf(el);
    if (idx < 0) return null;
    // 前 = 主轴起点方向（row 的 left / column 的 up；reverse 布局则相反）
    const fwd = (dir === 'left' || dir === 'up') !== reverse;
    const neighbor = fwd ? ordered[idx - 1] : ordered[idx + 1];
    if (!neighbor) return null;
    const elOrder = computedOrder(el);
    const nbOrder = computedOrder(neighbor);
    let elNew = elOrder, nbNew = nbOrder;
    if (elOrder === nbOrder) {
      elNew = fwd ? elOrder - 1 : elOrder + 1;
    } else {
      elNew = nbOrder; nbNew = elOrder;
    }
    if (elNew !== elOrder) el.style.order = String(elNew);
    if (nbNew !== nbOrder) neighbor.style.order = String(nbNew);
    return { el, neighbor, elOrder, elNew, nbOrder, nbNew, idxOld: idx, idxNew: fwd ? idx - 1 : idx + 1 };
  }

  /** 元素在父 flex 容器内的主轴显示位次（1-based，供顺序记录友好展示）；非 flex 子项返回 0 */
  function flexPositionOf(el) {
    if (!el || el.nodeType !== 1) return 0;
    const parent = el.parentElement;
    if (!parent) return 0;
    let pcs;
    try { pcs = getComputedStyle(parent); } catch (e) { return 0; }
    if (!/flex/.test(pcs.display)) return 0;
    const ordered = flexItems(parent)
      .map((ch, i) => ({ ch, i }))
      .sort((a, b) => computedOrder(a.ch) - computedOrder(b.ch) || a.i - b.i)
      .map(x => x.ch);
    const idx = ordered.indexOf(el);
    return idx < 0 ? 0 : idx + 1;
  }

  /** 推断元素的尺寸模式（fill 填充 / auto 适应 / fixed 固定）：
   *  1) 有显式声明：百分比→填充，auto/fit-content→适应，像素→固定；
   *  2) 无显式声明且为 flex 子项：flex-grow>0 或 basis=0 → 填充，basis 具体值 → 固定，否则适应；
   *  3) 无显式声明的非 flex 子项：块级宽度默认占满（100%）→ 填充、块级高度默认内容自适应 → 适应；
   *     inline/绝对定位 → 适应。 */
  function inferSizeMode(specified, flexChild, cs, axis) {
    if (specified) {
      const s = String(specified).trim().toLowerCase();
      if (s.includes('%')) return 'fill';
      if (/^(auto|fit-content|min-content|max-content|inherit|initial|unset)$/.test(s)) return 'auto';
      return 'fixed';
    }
    if (flexChild) {
      const grow = parseFloat(cs.flexGrow) || 0;
      const basis = cs.flexBasis;
      if (grow > 0 || basis === '0%' || basis === '0px') return 'fill';
      if (basis && basis !== 'auto') return 'fixed';
      return 'auto';
    }
    const display = cs.display;
    if (display === 'inline' || display === 'inline-block' || display === 'inline-flex' || display === 'inline-grid') return 'auto';
    if (cs.position === 'absolute' || cs.position === 'fixed') return 'auto';
    return axis === 'height' ? 'auto' : 'fill';
  }

  /** 判断元素是否由自身（内联样式或命中的样式规则）声明了该属性；
   *  继承自祖先、浏览器默认值、@import 不可读样式表等一律视为未声明 → 不参与同步 */
  function declaresProperty(el, property) {
    if (!el || el.nodeType !== 1 || !property) return false;
    // 内联样式直接声明
    try {
      if (el.style && typeof el.style.getPropertyValue === 'function' && el.style.getPropertyValue(property)) return true;
    } catch (e) {}
    // 命中样式规则（含 @media / @supports 嵌套规则）声明
    const ruleDeclares = (rule) => {
      try {
        if (!rule) return false;
        if (rule.type === 1) {
          if (rule.selectorText && rule.style && rule.style.getPropertyValue(property) && el.matches(rule.selectorText)) return true;
        } else if (rule.cssRules) {
          for (let i = 0; i < rule.cssRules.length; i++) {
            if (ruleDeclares(rule.cssRules[i])) return true;
          }
        }
      } catch (e) { /* 跨域/非法规则跳过 */ }
      return false;
    };
    try {
      for (let i = 0; i < document.styleSheets.length; i++) {
        try { if (ruleDeclares(document.styleSheets[i])) return true; } catch (e) {}
      }
    } catch (e) {}
    return false;
  }

  /** 读取元素该属性的「源码声明信息」：判定属性是否由样式表规则声明，并返回命中的源码原文。
   *  sourceValue 保留 token 原文（如 var(--body-md-strong-font-size)）而非计算像素值，供施工单展示。
   *  只查样式表规则、不查内联样式：走查工具的所有修改都以内联注入（el.style）落地，
   *  查内联必然读到工具改后的值，无法回溯源码；场景自身用内联设置样式的属性不计为源码声明。 */
  function readSourceDeclaration(el, property) {
    if (!el || el.nodeType !== 1 || !property) return { declared: false, sourceValue: '' };
    const ruleDeclares = (rule) => {
      try {
        if (!rule) return null;
        if (rule.type === 1) {
          if (rule.selectorText && rule.style && el.matches(rule.selectorText)) {
            const v = rule.style.getPropertyValue(property);
            if (v) return { declared: true, sourceValue: String(v).trim() };
          }
        } else if (rule.cssRules) {
          for (let i = 0; i < rule.cssRules.length; i++) {
            const hit = ruleDeclares(rule.cssRules[i]);
            if (hit) return hit;
          }
        }
      } catch (e) { /* 跨域/非法规则跳过 */ }
      return null;
    };
    try {
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        try {
          if (sheet.ownerNode && sheet.ownerNode.id === 'wego-wt-pseudo-styles') continue;
          const hit = ruleDeclares(sheet);
          if (hit) return hit;
        } catch (e) {}
      }
    } catch (e) {}
    return { declared: false, sourceValue: '' };
  }

  /** 提取目标元素的「组件类」：作为「同一条样式控制」该元素的标识。
   *  取稳定类中在页面可见元素出现 ≥2 次、类名字符串最长（BEM 块元素/场景组件类通常最具体）的那个；
   *  没有可共享的组件类则返回 ''（表示无同类可同步）。
   *  例：转发按钮 .btn.btn--strong.btn--md.album-feed__primary → 取 album-feed__primary；
   *      正文 .album-feed__text → 取 album-feed__text（昵称 .album-feed__publisher 不含此 class，不同步）。 */
  function pickComponentClass(el) {
    if (!el || el.nodeType !== 1) return '';
    const classes = (el.className && typeof el.className === 'string')
      ? el.className.trim().split(/\s+/).filter(isStableSelectorClass)
      : [];
    let best = '';
    for (const c of classes) {
      if (!c) continue;
      let n = 0;
      try {
        const list = document.querySelectorAll('.' + CSS.escape(c));
        for (let i = 0; i < list.length; i++) {
          const it = list[i];
          if (it.isConnected && it.getClientRects && it.getClientRects().length) n++;
        }
      } catch (e) { continue; }
      if (n < 2) continue;                    // 单实例类不算共享
      if (c.length > best.length) best = c;   // 越具体（越长）优先，避免通用基类(btn/avatar)跨组件误连
    }
    return best;
  }

  /** 找出与目标元素「被同一条样式（同一组件类）控制」的其它元素（自动同步目标集）。
   *  仅当该属性确为「公共样式」时返回命中列表，否则返回 []（不自动同步，只改当前元素）。
   *  防误判规则：
   *   - 结构/层叠类属性（display/position/z-index）不同步；尺寸、flex 及同类布局视觉属性（对齐/间距/文字对齐）放开；
   *   - 目标自身未声明该属性（继承/默认值）→ 属局部覆盖，不同步（上述布局视觉属性除外：同类统一外观/布局）；
   *   - 只认「同类组件」：与目标共享同一组件类（如所有头像/所有转发按钮/所有正文标题），
   *     值碰巧相同的不同元素（如正文与昵称字号相同）不会被误判为同类；
   *   - 同类内再按「该属性计算值一致」过滤，避免同组件不同尺寸/颜色变体被误改；
   *   - 仅扫描当前可见场景（未布局/隐藏 tab/未挂载元素跳过）；
   *   - 命中数（含当前）超过上限 → 视为页面级基础，不同步。 */
  function findSharedStyleElements(targetEl, property, oldValue) {
    if (!targetEl || !property || !oldValue || SHARED_SYNC_EXCLUDED_PROPS.has(property)) return [];
    // 尺寸（宽/高）、flex（宽度布局）与同类布局视觉属性（对齐/间距/文字对齐等）是"同类组件统一外观/布局"的
    // 公共样式：目标与被改同类即使未显式声明（如 flex 拉伸撑满、内容自适应、容器对齐默认值）也应同步成一致的
    // 固定值；其余属性仍要求目标自身声明，避免把继承/默认值当成公共样式误同步
    const isExempt = LAYOUT_SYNC_EXEMPT_PROPS.has(property);
    if (!isExempt && !declaresProperty(targetEl, property)) return [];
    const componentClass = pickComponentClass(targetEl);
    if (!componentClass) return [];
    const targetNorm = normalizeCssValue(oldValue);
    const candidates = [];
    try {
      const list = document.querySelectorAll('.' + CSS.escape(componentClass));
      for (let i = 0; i < list.length; i++) {
        const el = list[i];
        if (el === targetEl || isWalkthroughElement(el)) continue;
        if (!el.isConnected || !el.getClientRects || !el.getClientRects().length) continue;
        // order（顺序移动）的共享同步排除同一父容器的兄弟元素：兄弟的 order 已由
        // moveFlexItem 移动逻辑处理，若把兄弟也同步成与目标相同的 order 值（如同容器内
        // 同类 action 全设 -1），会导致容器内同类元素 order 一致、按 DOM 序排列 → 视觉上
        // 移动恢复原位。跨容器（其他卡片/实例）的同款元素仍正常同步。
        if (property === 'order' && el.parentElement === targetEl.parentElement) continue;
        let val = '';
        try { val = getComputedStyle(el).getPropertyValue(property); } catch (e) { continue; }
        if (normalizeCssValue(val) === targetNorm) candidates.push(el);
      }
    } catch (e) {}
    if (candidates.length === 0) return [];
    if (candidates.length + 1 > MAX_SHARED_STYLE_COUNT) return [];
    return candidates.filter(el => isExempt || declaresProperty(el, property));
  }

  /** 快照元素（或伪元素）的计算样式原始值，用于「改回即无变更」判定 */
  function snapshotStyle(cs) {
    return {
      'flex-direction': cs.flexDirection,
      'justify-content': cs.justifyContent,
      'align-items': cs.alignItems,
      'gap': cs.gap,
      'padding-left': cs.paddingLeft,
      'padding-right': cs.paddingRight,
      'padding-top': cs.paddingTop,
      'padding-bottom': cs.paddingBottom,
      'margin-left': cs.marginLeft,
      'margin-right': cs.marginRight,
      'margin-top': cs.marginTop,
      'margin-bottom': cs.marginBottom,
      'width': cs.width,
      'height': cs.height,
      'font-size': cs.fontSize,
      'font-weight': cs.fontWeight,
      'color': cs.color,
      'line-height': cs.lineHeight,
      'text-align': cs.textAlign,
      'opacity': cs.opacity,
      'border-radius': cs.borderRadius,
      'background-color': cs.backgroundColor,
      'border': cs.border,
      'box-shadow': cs.boxShadow,
      'order': cs.order,
    };
  }

  /** 伪元素 key */
  function pseudoKey(selector, pseudo) {
    return selector + '||' + pseudo;
  }

  /** 判断元素的 ::before / ::after 是否真实渲染。
   *  注意：content:""（空字符串）也是真实渲染（如分割线占位），
   *  getComputedStyle 对其返回 ""，不能用 !!cs.content 判断；
   *  仅 content 为 none / normal 才算未渲染。 */
  function isPseudoRendered(el, pseudo) {
    try {
      const cs = getComputedStyle(el, '::' + pseudo);
      const c = cs.content;
      let rendered;
      if (!c) rendered = false;            // 取不到 / 空
      else if (c === 'none' || c === 'normal') rendered = false;
      else rendered = true;               // 包括 "" 空内容（占位分割线）
      return rendered;
    } catch (e) { return false; }
  }

  /** 重建注入到 <head> 的伪元素样式规则 */
  function rebuildPseudoStyleElement() {
    let el = document.getElementById('wego-wt-pseudo-styles');
    if (!el) {
      el = document.createElement('style');
      el.id = 'wego-wt-pseudo-styles';
      (document.head || document.documentElement).appendChild(el);
    }
    let css = '';
    for (const k in state.pseudoStyles) {
      const parts = k.split('||');
      const selector = parts[0];
      const pseudo = parts[1];
      const props = state.pseudoStyles[k];
      if (!props) continue;
      // 加 !important：走查工具伪元素编辑是"覆盖式调参"，必须压过场景原始规则（特异性可能更高）
      const entries = Object.keys(props).map(p => `${p}: ${props[p]} !important;`).join(' ');
      if (entries) css += `${selector}::${pseudo} { ${entries} }
`;
    }
    el.textContent = css;
  }

  /** 设置/删除某元素伪元素的单个样式属性（空值=删除） */
  function applyPseudoStyle(selector, pseudo, property, value) {
    const k = pseudoKey(selector, pseudo);
    if (!state.pseudoStyles[k]) state.pseudoStyles[k] = {};
    if (value === '' || value == null) {
      delete state.pseudoStyles[k][property];
    } else {
      state.pseudoStyles[k][property] = value;
    }
    if (Object.keys(state.pseudoStyles[k]).length === 0) delete state.pseudoStyles[k];
    rebuildPseudoStyleElement();
  }

  // ============================================================
  // wego-wt-toast: 操作结果提示
  // ============================================================
  class WegoWtToast extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._timer = null;
    }
    connectedCallback() {
      this._render();
    }
    show(message, duration = 2000) {
      this._message = message;
      this._render();
      this.style.display = 'flex';
      this.style.opacity = '1';
      this.style.transform = 'translateX(-50%) translateY(0)';
      if (this._timer) clearTimeout(this._timer);
      this._timer = setTimeout(() => this.hide(), duration);
    }
    hide() {
      this.style.opacity = '0';
      this.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => { this.style.display = 'none'; }, 200);
    }
    _render() {
      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            bottom: 160px;
            left: 50%;
            transform: translateX(-50%) translateY(10px);
            z-index: 9800;
            display: none;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            font-size: 13px;
            line-height: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif;
            opacity: 0;
            transition: opacity 0.2s ease, transform 0.2s ease;
            pointer-events: none;
            white-space: nowrap;
          }
        </style>
        <span>${this._message || ''}</span>
      `;
    }
  }

  // ============================================================
  // wego-wt-overlay: 覆盖层（元素信息气泡）
  // ============================================================
  class WegoWtOverlay extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._targetEl = null;
      this._rafId = null;
    }
    connectedCallback() {
      this._render();
    }
    disconnectedCallback() {
      this._stopTracking();
    }
    showForElement(el) {
      this._targetEl = el;
      this._updatePosition();
      this._startTracking();
    }
    hide() {
      this._targetEl = null;
      this._stopTracking();
      this.style.display = 'none';
    }
    _startTracking() {
      this._stopTracking();
      const update = () => {
        if (this._targetEl) {
          this._updatePosition();
          this._rafId = requestAnimationFrame(update);
        }
      };
      this._rafId = requestAnimationFrame(update);
    }
    _stopTracking() {
      if (this._rafId) {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
      }
    }
    _updatePosition() {
      if (!this._targetEl) return;
      const rect = this._targetEl.getBoundingClientRect();
      const bubble = this._shadow.querySelector('.bubble');
      if (!bubble) return;
      // 更新内容
      const tag = this._targetEl.tagName.toLowerCase();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      bubble.querySelector('.bubble-text').textContent = `${tag} · ${w}×${h}`;
      // 计算位置：优先在元素上方
      const bubbleRect = bubble.getBoundingClientRect();
      const bw = bubbleRect.width || 100;
      const bh = bubbleRect.height || 24;
      let top = rect.top - bh - 6;
      let left = rect.left + rect.width / 2 - bw / 2;
      // 元素靠近顶部，显示在下方
      if (top < 40) {
        top = rect.bottom + 6;
      }
      // 水平边界
      left = Math.max(8, Math.min(left, window.innerWidth - bw - 8));
      bubble.style.top = top + 'px';
      bubble.style.left = left + 'px';
      this.style.display = 'block';
    }
    _render() {
      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            inset: 0;
            z-index: 9550;
            pointer-events: none;
            display: none;
          }
          .bubble {
            position: absolute;
            padding: 3px 8px;
            border-radius: 6px;
            background: rgba(30, 30, 30, 0.88);
            color: #fff;
            font-size: 11px;
            line-height: 16px;
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif;
            white-space: nowrap;
            pointer-events: none;
          }
        </style>
        <div class="bubble">
          <span class="bubble-text"></span>
        </div>
      `;
    }
  }

  // ============================================================
  // wego-wt-highlight: 视口级固定高亮框（替代 outline，避免祖先 overflow 裁切）
  // 支持 hover（虚线预览）与 selected（实线+8手柄）双模式，对齐 Liaison 视觉
  // ============================================================
  class WegoWtHighlight extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._targetEl = null;
      this._label = '';
      this._mode = 'selected'; // 'hover' | 'selected'
      this._rafId = null;
    }
    connectedCallback() {
      this._render();
    }
    disconnectedCallback() {
      this._stopTracking();
    }
    setMode(mode) {
      this._mode = mode === 'hover' ? 'hover' : 'selected';
      this._applyMode();
    }
    showForElement(el, label) {
      this._targetEl = el;
      this._label = label || '';
      this._update();
      this._startTracking();
    }
    hide() {
      this._targetEl = null;
      this._stopTracking();
      this.style.display = 'none';
    }
    _startTracking() {
      this._stopTracking();
      const update = () => {
        if (this._targetEl) {
          this._update();
          this._rafId = requestAnimationFrame(update);
        }
      };
      this._rafId = requestAnimationFrame(update);
    }
    _stopTracking() {
      if (this._rafId) {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
      }
    }
    _applyMode() {
      const box = this._shadow.querySelector('.box');
      const handles = this._shadow.querySelector('.handles');
      const labelEl = this._shadow.querySelector('.label');
      if (!box) return;
      box.classList.toggle('box--hover', this._mode === 'hover');
      box.classList.toggle('box--selected', this._mode === 'selected');
      if (handles) handles.style.display = this._mode === 'selected' ? 'block' : 'none';
      if (labelEl) {
        labelEl.style.background = this._mode === 'hover'
          ? 'var(--wt-hover-color)'
          : 'var(--wt-selected-color)';
      }
    }
    _update() {
      if (!this._targetEl) return;
      const rect = this._targetEl.getBoundingClientRect();
      const box = this._shadow.querySelector('.box');
      if (!box) return;
      box.style.top = rect.top + 'px';
      box.style.left = rect.left + 'px';
      box.style.width = Math.max(0, rect.width) + 'px';
      box.style.height = Math.max(0, rect.height) + 'px';

      // 标签：固定在左上角，空间不足时嵌入框内顶部
      const tag = this._targetEl.tagName.toLowerCase();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      const labelEl = this._shadow.querySelector('.label');
      if (labelEl) {
        labelEl.textContent = this._mode === 'hover'
          ? `${w}×${h}`
          : `${this._label ? this._label + '  ' : ''}${tag} · ${w}×${h}`;
        const labelH = 18;
        if (rect.top >= labelH + 2) {
          labelEl.style.top = (rect.top - labelH) + 'px';
        } else {
          labelEl.style.top = rect.top + 'px';
        }
        labelEl.style.left = rect.left + 'px';
      }
      this.style.display = 'block';
    }
    _render() {
      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            inset: 0;
            z-index: 9540;
            pointer-events: none;
            display: none;
            --wt-hover-color: hsl(267, 100%, 58%);
            --wt-selected-color: #ff00ff;
          }
          @supports (color: color(display-p3 1 0 1)) {
            :host { --wt-selected-color: color(display-p3 1 0 1); }
          }
          .box {
            position: absolute;
            box-sizing: border-box;
            border-radius: 2px;
          }
          .box--hover {
            border: 1px dashed var(--wt-hover-color);
          }
          .box--selected {
            border: 2px solid var(--wt-selected-color);
            box-shadow: 0 0 0 1px rgba(0,0,0,0.12);
          }
          .handles {
            position: absolute;
            inset: 0;
            display: none;
          }
          .handle {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #fff;
            border: 1px solid var(--wt-selected-color);
            border-radius: 1px;
            box-sizing: border-box;
          }
          .handle--tl { top: -4px; left: -4px; cursor: nwse-resize; }
          .handle--tc { top: -4px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
          .handle--tr { top: -4px; right: -4px; cursor: nesw-resize; }
          .handle--mr { top: 50%; right: -4px; transform: translateY(-50%); cursor: ew-resize; }
          .handle--br { bottom: -4px; right: -4px; cursor: nwse-resize; }
          .handle--bc { bottom: -4px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
          .handle--bl { bottom: -4px; left: -4px; cursor: nesw-resize; }
          .handle--ml { top: 50%; left: -4px; transform: translateY(-50%); cursor: ew-resize; }
          .label {
            position: absolute;
            padding: 1px 6px;
            border-radius: 4px;
            color: #fff;
            font-size: 11px;
            line-height: 16px;
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif;
            white-space: nowrap;
          }
        </style>
        <div class="box box--selected">
          <div class="handles">
            <div class="handle handle--tl"></div>
            <div class="handle handle--tc"></div>
            <div class="handle handle--tr"></div>
            <div class="handle handle--mr"></div>
            <div class="handle handle--br"></div>
            <div class="handle handle--bc"></div>
            <div class="handle handle--bl"></div>
            <div class="handle handle--ml"></div>
          </div>
        </div>
        <div class="label"></div>
      `;
      this._applyMode();
    }
  }

  // ============================================================
  // wego-wt-color-picker: 颜色选择器
  // ============================================================
  class WegoWtColorPicker extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._callback = null;
      this._hex = '#000000';
      this._opacity = 100;
      this._hsv = { h: 0, s: 0, v: 0 };
      this._format = 'hex'; // hex | rgb | hsb
      this._dragType = null;
    }
    connectedCallback() {
      this._render();
    }
    open(triggerEl, hex, opacity, callback) {
      // token 值（var(--xxx)）需要解析成实际 hex
      let resolvedHex = hex || '#000000';
      if (isTokenValue(resolvedHex)) {
        const rgb = resolveCssValue(resolvedHex, 'color');
        const match = rgb && rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          resolvedHex = '#' + [1, 2, 3].map(i => parseInt(match[i], 10).toString(16).padStart(2, '0')).join('').toUpperCase();
        } else {
          resolvedHex = '#000000';
        }
      }
      this._hex = resolvedHex;
      this._opacity = opacity !== undefined ? opacity : 100;
      this._hsv = this._hexToHsv(this._hex);
      this._callback = callback;
      // 先关闭旧实例，移除上一轮 document mousedown/touchstart 监听器，避免累积泄漏
      this.close();
      this._render();
      // 先显示以测量实际尺寸，再定位到触发按钮附近，优先下方，空间不足翻上方
      this.removeAttribute('hidden');
      const rect = triggerEl.getBoundingClientRect();
      const pickerWidth = this.offsetWidth || 260;
      const pickerHeight = this.offsetHeight || 300;
      let left = rect.left;
      let top = rect.bottom + 6;
      if (left + pickerWidth > window.innerWidth - 8) left = window.innerWidth - pickerWidth - 8;
      if (left < 8) left = 8;
      if (top + pickerHeight > window.innerHeight - 8) top = rect.top - pickerHeight - 6;
      if (top < 8) top = 8;
      this.style.left = left + 'px';
      this.style.top = top + 'px';
      // 点击外部关闭（用 composedPath 穿透 shadow DOM 边界判断，避免事件重定向误判）
      this._outsideHandler = (e) => {
        const path = e.composedPath ? e.composedPath() : [];
        const inPicker = path.includes(this);
        const inTrigger = e.target === triggerEl || triggerEl.contains(e.target);
        if (!inPicker && !inTrigger) {
          this.close();
        }
      };
      setTimeout(() => document.addEventListener('mousedown', this._outsideHandler, true), 0);
      setTimeout(() => document.addEventListener('touchstart', this._outsideHandler, true), 0);
    }
    close() {
      this.setAttribute('hidden', '');
      this._dragType = null;
      if (this._outsideHandler) {
        document.removeEventListener('mousedown', this._outsideHandler, true);
        document.removeEventListener('touchstart', this._outsideHandler, true);
        this._outsideHandler = null;
      }
    }

    // ── 颜色转换（HSV 模型） ─────────────────────────────
    _hexToHsv(hex) {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const d = max - min;
      let h, s, v = max;
      s = max === 0 ? 0 : d / max;
      if (max === min) {
        h = 0;
      } else {
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
    }
    _hsvToHex(h, s, v) {
      h /= 360; s /= 100; v /= 100;
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);
      let r, g, b;
      switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
      }
      const toHex = x => {
        const val = Math.round(x * 255).toString(16);
        return val.length === 1 ? '0' + val : val;
      };
      return '#' + toHex(r) + toHex(g) + toHex(b);
    }
    _hexToRgb(hex) {
      return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
      };
    }
    _rgbToHex(r, g, b) {
      const toHex = x => {
        const val = Math.round(x).toString(16);
        return val.length === 1 ? '0' + val : val;
      };
      return '#' + toHex(r) + toHex(g) + toHex(b);
    }
    _getFormatValue() {
      const { h, s, v } = this._hsv;
      const rgb = this._hexToRgb(this._hex);
      switch (this._format) {
        case 'rgb': return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
        case 'hsb': return `${h}, ${s}%, ${v}%`;
        default: return this._hex.toUpperCase();
      }
    }

    // ── 渲染 ──────────────────────────────────────────────
    _render() {
      const { h } = this._hsv;
      const formatValue = this._getFormatValue();
      const hasEyedropper = typeof window !== 'undefined' && 'EyeDropper' in window;

      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            z-index: 9700;
            width: 260px;
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif;
            --bg-surface: rgba(30, 30, 30, 0.82);
            --bg-subtle: rgba(255, 255, 255, 0.03);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-default: #fff;
            --text-secondary: rgba(255, 255, 255, 0.6);
            --text-tertiary: rgba(255, 255, 255, 0.42);
            --text-brand: #00b96b;
            color: #fff;
            backdrop-filter: blur(18px) saturate(140%);
            -webkit-backdrop-filter: blur(18px) saturate(140%);
          }
          :host(:not([hidden])) {
            display: block;
            animation: wt-panel-in 200ms cubic-bezier(0.22, 0.9, 0.32, 1) both;
          }
          @keyframes wt-panel-in {
            from { opacity: 0; transform: translateY(6px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .picker {
            box-sizing: border-box;
            width: 100%;
            padding: 10px 10px 8px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            background: var(--bg-surface);
            box-shadow: 0 12px 40px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .title { font-size: 13px; font-weight: 600; color: var(--text-default); }
          .close-btn {
            width: 24px; height: 24px; border: none; background: transparent;
            color: var(--text-tertiary); font-size: 18px; cursor: pointer;
            display: flex; align-items: center; justify-content: center; padding: 0;
            border-radius: 6px;
          }
          .close-btn:hover { background: rgba(255,255,255,0.06); color: var(--text-default); }

          /* SV 二维取色面板 — 裁剪超出圆角的内容 */
          .sv-panel {
            position: relative; width: 100%; height: 150px;
            border-radius: 8px; cursor: crosshair;
            overflow: hidden;
            user-select: none; -webkit-user-select: none;
            touch-action: none;
          }
          .sv-layer { position: absolute; inset: 0; pointer-events: none; border-radius: 8px; }
          .sv-white { background: linear-gradient(to right, #fff, rgba(255,255,255,0)); }
          .sv-black { background: linear-gradient(to top, #000, rgba(0,0,0,0)); }
          .sv-cursor {
            position: absolute; width: 14px; height: 14px;
            border: 2px solid #fff; border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3);
            pointer-events: none;
          }

          /* 色相条 — 不裁剪 */
          .hue-slider {
            position: relative; width: 100%; height: 10px;
            border-radius: 5px; cursor: pointer;
            background: linear-gradient(to right,
              #ff0000 0%, #ffff00 17%, #00ff00 33%,
              #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);
            user-select: none; -webkit-user-select: none;
            touch-action: none;
          }
          .hue-cursor {
            position: absolute; top: 50%; width: 14px; height: 14px;
            border: 2px solid #fff; border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3);
            pointer-events: none;
          }

          /* 不透明度 — 不裁剪，选点可超出边缘 */
          .opacity-wrap { display: flex; flex-direction: column; gap: 4px; }
          .opacity-label {
            display: flex; align-items: center; justify-content: space-between;
            font-size: 11px; color: var(--text-tertiary);
          }
          .opacity-num-wrap { display: flex; align-items: center; gap: 2px; }
          .opacity-num {
            width: 34px; height: 20px; padding: 0 4px;
            border: 1px solid var(--border-color); border-radius: 5px;
            background: var(--bg-subtle); color: var(--text-default);
            font-size: 11px; text-align: center; outline: none;
            box-sizing: border-box;
          }
          .opacity-num:focus { border-color: var(--text-brand); }
          .opacity-unit { font-size: 11px; color: var(--text-tertiary); }
          .opacity-slider {
            position: relative; width: 100%; height: 10px;
            border-radius: 5px; cursor: pointer;
            user-select: none; -webkit-user-select: none;
            touch-action: none;
          }
          .opacity-checker {
            position: absolute; inset: 0; border-radius: 5px;
            background-image:
              linear-gradient(45deg, #555 25%, transparent 25%),
              linear-gradient(-45deg, #555 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #555 75%),
              linear-gradient(-45deg, transparent 75%, #555 75%);
            background-size: 8px 8px;
            background-position: 0 0, 0 4px, 4px -4px, -4px 0;
          }
          .opacity-fill {
            position: absolute; inset: 0; border-radius: 5px; pointer-events: none;
          }
          .opacity-cursor {
            position: absolute; top: 50%; width: 14px; height: 14px;
            border: 2px solid #fff; border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3);
            pointer-events: none;
          }

          /* 格式行 */
          .format-row {
            display: flex; align-items: center; gap: 6px;
          }
          .format-select-wrap { position: relative; flex-shrink: 0; }
          .format-select {
            height: 28px; padding: 0 22px 0 8px;
            border: 1px solid var(--border-color); border-radius: 7px;
            background: var(--bg-subtle); color: var(--text-default);
            font-size: 11px; font-weight: 500; outline: none;
            cursor: pointer; appearance: none; -webkit-appearance: none;
          }
          .format-select:focus { border-color: var(--text-brand); }
          .format-select-wrap::after {
            content: '▾'; position: absolute; right: 8px; top: 50%;
            transform: translateY(-50%); font-size: 9px;
            color: var(--text-tertiary); pointer-events: none;
          }
          .format-input {
            flex: 1; height: 28px; padding: 0 8px;
            border: 1px solid var(--border-color); border-radius: 7px;
            background: var(--bg-subtle); color: var(--text-default);
            font-size: 12px; font-family: "SF Mono", Menlo, monospace;
            outline: none; text-transform: uppercase; box-sizing: border-box;
            min-width: 0;
          }
          .format-input:focus { border-color: var(--text-brand); }
          .eyedropper-btn {
            width: 28px; height: 28px; flex-shrink: 0;
            border: 1px solid var(--border-color); border-radius: 7px;
            background: var(--bg-subtle); color: var(--text-secondary);
            cursor: pointer; display: flex; align-items: center;
            justify-content: center; padding: 0;
          }
          .eyedropper-btn:hover { background: rgba(255,255,255,0.06); color: var(--text-default); }
          .eyedropper-btn:active { background: rgba(255,255,255,0.1); }
        </style>
        <div class="picker">
          <div class="header">
            <span class="title">颜色</span>
            <button class="close-btn" type="button" data-action="close">${ICONS.close}</button>
          </div>

          <!-- SV 二维取色面板 -->
          <div class="sv-panel" data-sv-panel style="background:hsl(${h},100%,50%);">
            <div class="sv-layer sv-white"></div>
            <div class="sv-layer sv-black"></div>
            <div class="sv-cursor" data-sv-cursor style="left:${this._hsv.s}%;top:${100 - this._hsv.v}%;"></div>
          </div>

          <!-- 色相条 -->
          <div class="hue-slider" data-hue-slider>
            <div class="hue-cursor" data-hue-cursor style="left:${h / 360 * 100}%;"></div>
          </div>

          <!-- 不透明度 -->
          <div class="opacity-wrap">
            <div class="opacity-label">
              <span>不透明度</span>
              <span class="opacity-num-wrap">
                <input class="opacity-num" type="text" value="${this._opacity}" data-opacity-num inputmode="numeric" />
                <span class="opacity-unit">%</span>
              </span>
            </div>
            <div class="opacity-slider" data-opacity-slider>
              <div class="opacity-checker"></div>
              <div class="opacity-fill" data-opacity-fill style="background:linear-gradient(to right, transparent, ${this._hex});"></div>
              <div class="opacity-cursor" data-opacity-cursor style="left:${this._opacity}%;"></div>
            </div>
          </div>

          <!-- 格式切换 + 输入 + 吸管 -->
          <div class="format-row">
            <div class="format-select-wrap">
              <select class="format-select" data-format-select>
                <option value="hex" ${this._format === 'hex' ? 'selected' : ''}>HEX</option>
                <option value="rgb" ${this._format === 'rgb' ? 'selected' : ''}>RGB</option>
                <option value="hsb" ${this._format === 'hsb' ? 'selected' : ''}>HSB</option>
              </select>
            </div>
            <input class="format-input" type="text" value="${formatValue}" data-format-input spellcheck="false" />
            ${hasEyedropper ? `
            <button class="eyedropper-btn" type="button" data-eyedropper title="从页面取色">
              ${ICONS.eyedropper}
            </button>` : ''}
          </div>
        </div>
      `;
      this._bindEvents();
    }

    // ── 事件绑定 ──────────────────────────────────────────
    _bindEvents() {
      this._shadow.querySelector('[data-action="close"]').addEventListener('click', () => this.close());

      // SV 面板拖动
      this._setupDrag(this._shadow.querySelector('[data-sv-panel]'), 'sv', (clientX, clientY, rect) => {
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        this._hsv.s = Math.round(x * 100);
        this._hsv.v = Math.round((1 - y) * 100);
        this._hex = this._hsvToHex(this._hsv.h, this._hsv.s, this._hsv.v);
        this._syncFromHsv();
        this._emitChange();
      });

      // 色相条拖动
      this._setupDrag(this._shadow.querySelector('[data-hue-slider]'), 'hue', (clientX, clientY, rect) => {
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        this._hsv.h = Math.round(x * 360);
        this._hex = this._hsvToHex(this._hsv.h, this._hsv.s, this._hsv.v);
        this._syncFromHsv();
        this._emitChange();
      });

      // 不透明度拖动
      this._setupDrag(this._shadow.querySelector('[data-opacity-slider]'), 'opacity', (clientX, clientY, rect) => {
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        this._opacity = Math.round(x * 100);
        this._syncOpacity();
        this._emitChange();
      });

      // 不透明度数值输入
      const opacityNum = this._shadow.querySelector('[data-opacity-num]');
      opacityNum.addEventListener('change', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = this._opacity;
        val = Math.max(0, Math.min(100, val));
        this._opacity = val;
        this._syncOpacity();
        this._emitChange();
      });
      opacityNum.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
      });

      // 格式切换
      this._shadow.querySelector('[data-format-select]').addEventListener('change', (e) => {
        this._format = e.target.value;
        this._updateFormatInput();
      });

      // 格式输入
      const formatInput = this._shadow.querySelector('[data-format-input]');
      formatInput.addEventListener('change', (e) => this._parseFormatInput(e.target.value));
      formatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
      });

      // 吸管
      const eyedropperBtn = this._shadow.querySelector('[data-eyedropper]');
      if (eyedropperBtn) {
        eyedropperBtn.addEventListener('click', async () => {
          try {
            const eyeDropper = new window.EyeDropper();
            const result = await eyeDropper.open();
            if (result && result.sRGBHex) {
              this._hex = result.sRGBHex.toUpperCase();
              this._hsv = this._hexToHsv(this._hex);
              this._syncFromHsv();
              this._emitChange();
            }
          } catch (err) { /* 用户取消取色 */ }
        });
      }
    }

    _setupDrag(el, type, onMove) {
      const onPointerDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._dragType = type;
        const rect = el.getBoundingClientRect();
        onMove(e.clientX, e.clientY, rect);
        const onPointerMove = (ev) => {
          if (this._dragType !== type) return;
          ev.preventDefault();
          onMove(ev.clientX, ev.clientY, rect);
        };
        const onPointerUp = () => {
          if (this._dragType === type) this._dragType = null;
          document.removeEventListener('pointermove', onPointerMove);
          document.removeEventListener('pointerup', onPointerUp);
          document.removeEventListener('pointercancel', onPointerUp);
        };
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
      };
      el.addEventListener('pointerdown', onPointerDown);
    }

    // ── 格式输入解析 ──────────────────────────────────────
    _parseFormatInput(val) {
      val = (val || '').trim();
      try {
        if (this._format === 'hex') {
          if (!val.startsWith('#')) val = '#' + val;
          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            this._hex = val.toUpperCase();
            this._hsv = this._hexToHsv(this._hex);
            this._syncFromHsv();
            this._emitChange();
            return;
          }
        } else if (this._format === 'rgb') {
          const m = val.match(/(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)/);
          if (m) {
            const r = Math.max(0, Math.min(255, parseInt(m[1], 10)));
            const g = Math.max(0, Math.min(255, parseInt(m[2], 10)));
            const b = Math.max(0, Math.min(255, parseInt(m[3], 10)));
            this._hex = this._rgbToHex(r, g, b);
            this._hsv = this._hexToHsv(this._hex);
            this._syncFromHsv();
            this._emitChange();
            return;
          }
        } else if (this._format === 'hsb') {
          const m = val.match(/(\d+)\s*[, ]\s*(\d+)%?\s*[, ]\s*(\d+)%?/);
          if (m) {
            const h = Math.max(0, Math.min(360, parseInt(m[1], 10)));
            const s = Math.max(0, Math.min(100, parseInt(m[2], 10)));
            const v = Math.max(0, Math.min(100, parseInt(m[3], 10)));
            this._hsv = { h, s, v };
            this._hex = this._hsvToHex(h, s, v);
            this._syncFromHsv();
            this._emitChange();
            return;
          }
        }
      } catch (e) { /* ignore */ }
      // 解析失败，恢复当前值
      this._updateFormatInput();
    }

    // ── UI 同步 ───────────────────────────────────────────
    _syncFromHsv() {
      // SV 面板背景（色相）
      const svPanel = this._shadow.querySelector('[data-sv-panel]');
      if (svPanel) svPanel.style.background = `hsl(${this._hsv.h},100%,50%)`;
      // SV 选点 — X=饱和度, Y=100-明度
      const svCursor = this._shadow.querySelector('[data-sv-cursor]');
      if (svCursor) {
        svCursor.style.left = this._hsv.s + '%';
        svCursor.style.top = (100 - this._hsv.v) + '%';
      }
      // 色相选点
      const hueCursor = this._shadow.querySelector('[data-hue-cursor]');
      if (hueCursor) hueCursor.style.left = (this._hsv.h / 360 * 100) + '%';
      // 不透明度填充条颜色
      this._updateOpacityFill();
      // 格式输入
      this._updateFormatInput();
    }
    _syncOpacity() {
      const opacityCursor = this._shadow.querySelector('[data-opacity-cursor]');
      if (opacityCursor) opacityCursor.style.left = this._opacity + '%';
      const opacityNum = this._shadow.querySelector('[data-opacity-num]');
      if (opacityNum) opacityNum.value = this._opacity;
    }
    _updateOpacityFill() {
      const fill = this._shadow.querySelector('[data-opacity-fill]');
      if (fill) fill.style.background = `linear-gradient(to right, transparent, ${this._hex})`;
    }
    _updateFormatInput() {
      const input = this._shadow.querySelector('[data-format-input]');
      if (input && document.activeElement !== input) {
        input.value = this._getFormatValue();
      }
    }
    _emitChange() {
      if (this._callback) {
        this._callback(this._hex, this._opacity);
      }
    }
  }

  // ============================================================
  // wego-wt-overview-panel: 配置列表面板
  // ============================================================
  class WegoWtOverviewPanel extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._changes = [];
      this._annotations = [];
      this._route = '';
    }
    connectedCallback() {
      this._render();
    }
    open(changes, route, anchorEl, annotations) {
      this._changes = changes || [];
      this._annotations = annotations || [];
      this._route = route || '';
      this._render();
      this._bindEvents();
      if (anchorEl) {
        // 绑定到工具条锚点：优先下方展开，空间不够翻上方；水平与锚点右对齐
        const rect = anchorEl.getBoundingClientRect();
        const panelWidth = 320;
        const gap = 8;
        let left = rect.right - panelWidth;
        if (left < 8) left = 8;
        if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;
        // 先显示以测量真实高度
        this.style.left = left + 'px';
        this.style.top = rect.bottom + gap + 'px';
        this.removeAttribute('hidden');
        void this.offsetHeight;
        const panelHeight = this.getBoundingClientRect().height;
        let top = rect.bottom + gap;
        if (top + panelHeight > window.innerHeight - 8) top = rect.top - panelHeight - gap;
        if (top < 8) top = 8;
        this.style.top = top + 'px';
      } else {
        // 兜底：居中显示
        const left = Math.max(8, (window.innerWidth - 320) / 2);
        this.style.left = left + 'px';
        this.style.top = '60px';
        this.removeAttribute('hidden');
      }
    }
    close() {
      this.setAttribute('hidden', '');
    }
    _render() {
      const changes = this._changes || [];
      const annotations = this._annotations || [];
      const route = this._route || '';
      // 按选择器分组（元素本体与 ::before/::after 变更合并为同一元素分组，避免重复卡片）；
      // 共享同步的变更按 sharedKey 合并为一组（同一公共样式），展示为一条「共享 N 个元素」
      const groups = {};
      changes.forEach(c => {
        const gkey = c.sharedKey || c.selector;
        if (!groups[gkey]) {
          groups[gkey] = {
            selector: c.selector,
            target: c.target || '',
            elementTag: c.elementTag,
            elementText: c.elementText,
            changes: [],
            shared: !!c.sharedKey,
            sharedKey: c.sharedKey || '',
            annotation: '',
            annotationId: '',
          };
        }
        groups[gkey].changes.push(c);
      });
      annotations.forEach(a => {
        if (!a.text || !a.text.trim()) return;
        if (!groups[a.selector]) {
          groups[a.selector] = {
            selector: a.selector,
            target: '',
            elementTag: a.elementTag,
            elementText: a.elementText,
            changes: [],
            shared: false,
            sharedKey: '',
            annotation: a.text,
            annotationId: a.id,
          };
        } else {
          groups[a.selector].annotation = a.text;
          groups[a.selector].annotationId = a.id;
          if (!groups[a.selector].elementText && a.elementText) {
            groups[a.selector].elementText = a.elementText;
          }
          if (!groups[a.selector].elementTag && a.elementTag) {
            groups[a.selector].elementTag = a.elementTag;
          }
        }
      });
      // 共享组：全部记录一致时合并为一行展示；不一致（后续单元素再编辑）则逐条展示。
      // 尺寸组（sharedKey 以 ::size 结尾）：宽度/高度合并为一行「尺寸」，共享数按去重元素数计
      const groupList = Object.values(groups).map(g => {
        if (g.shared && g.changes.length) {
          const first = g.changes[0];
          const isSizeGroup = !!g.sharedKey && g.sharedKey.endsWith('::size');
          g.sharedCount = new Set(g.changes.map(c => c.selector)).size;
          if (isSizeGroup) {
            g.sharedRows = mergeSizeRows(g.changes);
          } else {
            const allSame = g.changes.every(c => c.property === first.property && c.newValue === first.newValue);
            g.sharedRows = allSame ? [first] : g.changes;
          }
        }
        return g;
      });
      const changeGroupCount = new Set(changes.map(c => c.sharedKey || c.selector)).size;
      const totalCount = changeGroupCount + annotations.filter(a => a.text && a.text.trim()).length;
      // 跨场景提示：扫描其它场景是否还有修改（当前场景之外），提示条展示并支持点击跳转
      let otherScenes = [];
      try {
        const all = this._loadAllScenesChanges();
        otherScenes = all.filter(s => s.routeId !== route);
      } catch (e) { /* 跨场景扫描失败不影响面板渲染 */ }

      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            z-index: 9600;
            width: 320px;
            max-width: calc(100vw - 16px);
            transform-origin: top right;
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif;
            /* 暗色毛玻璃主题，与工具条/样式面板统一 */
            --bg-surface: rgba(30, 30, 30, 0.82);
            --bg-subtle: rgba(255, 255, 255, 0.03);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-default: #fff;
            --text-secondary: rgba(255, 255, 255, 0.6);
            --text-tertiary: rgba(255, 255, 255, 0.42);
            --text-disabled: rgba(255, 255, 255, 0.35);
            --text-brand: #00b96b;
            color: #fff;
            backdrop-filter: blur(18px) saturate(140%);
            -webkit-backdrop-filter: blur(18px) saturate(140%);
          }
          :host(:not([hidden])) {
            /* 统一面板打开动画：透明度 + 轻微上浮 + 缩放，200ms 同一缓动 */
            animation: wt-panel-in-top 200ms cubic-bezier(0.22, 0.9, 0.32, 1) both;
            pointer-events: auto;
          }
          @keyframes wt-panel-in-top {
            from { opacity: 0; transform: translateY(-6px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .panel {
            box-sizing: border-box;
            width: 100%;
            max-height: calc(100vh - 120px);
            display: flex;
            flex-direction: column;
            border-radius: 14px;
            border: 1px solid var(--border-color, rgba(255,255,255,0.08));
            background: var(--bg-surface, rgba(30,30,30,0.82));
            box-shadow: 0 12px 40px rgba(0,0,0,0.25);
            overflow: hidden;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 10px 12px;
            border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08));
            flex-shrink: 0;
          }
          .header-title {
            font-size: 12px;
            font-weight: 600;
            color: rgba(255,255,255,0.5);
          }
          .header-count {
            font-size: 12px;
            color: var(--text-tertiary, #888);
            margin-left: 4px;
          }
          .header-actions {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          /* 底部操作按钮：与调试日志面板底部按钮统一（描边 + 半透明底 + 6px 圆角） */
          .copy-btn,
          .reset-btn {
            flex: 1;
            height: 30px;
            padding: 0 12px;
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 6px;
            background: rgba(255,255,255,0.06);
            color: #fff;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }
          .copy-btn:hover,
          .reset-btn:hover { background: rgba(255,255,255,0.12); }
          .copy-btn:active,
          .reset-btn:active { background: rgba(255,255,255,0.18); }
          .close-btn {
            width: 28px;
            height: 28px;
            border: none;
            border-radius: 8px;
            background: transparent;
            color: var(--text-tertiary, #888);
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
          }
          .close-btn:hover { background: rgba(255,255,255,0.06); }
          .list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch; /* iOS 惯性滚动 */
            max-height: calc(100vh - 280px);
            padding: 10px 12px;
            flex: 1;
          }
          .list::-webkit-scrollbar { width: 0; height: 0; display: none; }
          .list { scrollbar-width: none; -ms-overflow-style: none; }
          .item {
            padding: 10px;
            border-radius: 10px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.06);
          }
          .item-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 6px;
          }
          .item-selector {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-default, #1a1a1a);
            cursor: pointer;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
            min-width: 0;
          }
          .item-selector:hover { color: var(--text-brand, #00b96b); }
          .shared-badge {
            flex-shrink: 0;
            font-size: 10px;
            color: #00b96b;
            background: rgba(0, 185, 107, 0.12);
            border: 1px solid rgba(0, 185, 107, 0.25);
            padding: 1px 6px;
            border-radius: 999px;
            white-space: nowrap;
          }
          .item-text {
            font-size: 11px;
            color: var(--text-tertiary, #888);
            margin-top: 2px;
          }
          .change-row {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 0;
            font-size: 11px;
          }
          .change-prop {
            color: var(--text-tertiary, #888);
            flex-shrink: 0;
            min-width: 70px;
          }
          .change-old {
            color: var(--text-tertiary, #888);
            text-decoration: line-through;
            max-width: 60px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .change-arrow {
            color: var(--text-tertiary, #666);
            flex-shrink: 0;
          }
          .change-new {
            color: var(--text-brand, #00b96b);
            font-weight: 500;
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .change-delete {
            width: 20px;
            height: 20px;
            border: none;
            background: transparent;
            color: var(--text-tertiary, #aaa);
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            flex-shrink: 0;
            border-radius: 4px;
          }
          .change-delete:hover { color: var(--text-error, #e53935); background: rgba(255,255,255,0.06); }
          .empty {
            text-align: center;
            padding: 32px 12px;
            color: var(--text-tertiary, #888);
            font-size: 12px;
            line-height: 1.6;
            flex: 1;
          }
          .footer {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            border-top: 1px solid var(--border-color, rgba(255,255,255,0.08));
            flex-shrink: 0;
          }
          .annotation-row {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 6px 0;
            border-bottom: 1px solid rgba(255,255,255,0.04);
          }
          .annotation-label {
            flex-shrink: 0;
            font-size: 11px;
            color: #ff6b35;
            background: rgba(255,107,53,0.12);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 500;
          }
          .annotation-text {
            flex: 1;
            min-width: 0;
            font-size: 12px;
            color: rgba(255,255,255,0.85);
            line-height: 1.5;
            word-break: break-all;
          }
          .annotation-delete {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            border: none;
            background: transparent;
            color: var(--text-tertiary, #aaa);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border-radius: 4px;
          }
          .annotation-delete:hover { color: #e53935; background: rgba(255,255,255,0.06); }
          .annotation-delete svg { width: 12px; height: 12px; }
          .scene-hint {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin: 10px 12px 2px;
            padding: 8px 10px;
            border-radius: 8px;
            background: rgba(255, 184, 77, 0.12);
            border: 1px solid rgba(255, 184, 77, 0.35);
          }
          .scene-hint-label { font-size: 12px; color: #ffb84d; line-height: 1.5; }
          .scene-hint-list { display: flex; flex-wrap: wrap; gap: 6px; }
          .scene-hint-jump {
            border: 1px solid rgba(255, 255, 255, 0.16);
            background: rgba(255, 255, 255, 0.06);
            color: #fff;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 999px;
            cursor: pointer;
            line-height: 1.6;
          }
          .scene-hint-jump:hover { background: rgba(255,255,255,0.14); }
        </style>
        <div class="panel">
          <div class="header">
            <div>
              <span class="header-title">配置列表</span>
              <span class="header-count">${totalCount} 项</span>
            </div>
            <div class="header-actions">
              <button class="close-btn" type="button" data-action="close" title="关闭">${ICONS.close}</button>
            </div>
          </div>
          ${otherScenes.length > 0 ? `
            <div class="scene-hint">
              <span class="scene-hint-label">⚠️ 还有 ${otherScenes.length} 个场景有修改</span>
              <span class="scene-hint-list">${otherScenes.map(s => `<button type="button" class="scene-hint-jump" data-jump-scene="${escapeHtml(s.routeId)}">${escapeHtml(s.routeLabel)}</button>`).join('')}</span>
            </div>
          ` : ''}
          ${groupList.length === 0 ? `
            <div class="empty">
              当前还没有配置修改或批注<br/>
              选中元素后在样式面板中修改，或开启批注模式添加批注
            </div>
          ` : `
            <div class="list">
              ${groupList.map((g, gi) => `
                <div class="item">
                  <div class="item-top">
                    <span class="item-selector" data-selector="${escapeHtml(g.selector)}" data-gi="${gi}">${g.shared
                      ? '共享样式 · ' + escapeHtml(propertyLabel(g.sharedRows && g.sharedRows[0] ? g.sharedRows[0].property : (g.changes[0] ? g.changes[0].property : '')))
                      : escapeHtml(g.elementTag || '') + (g.elementText ? ' · ' + escapeHtml(g.elementText) : '')}</span>
                    ${g.shared ? `<span class="shared-badge">共享 ${g.sharedCount} 个元素</span>` : ''}
                  </div>
                  ${g.annotation ? `
                    <div class="annotation-row">
                      <span class="annotation-label">备注</span>
                      <span class="annotation-text">${escapeHtml(g.annotation)}</span>
                      <button class="annotation-delete" type="button" data-delete-annotation="${g.annotationId}" title="删除批注">${ICONS.close}</button>
                    </div>
                  ` : ''}
                  ${(g.shared ? (g.sharedRows || g.changes) : g.changes).map((c) => `
                    <div class="change-row">
                      <span class="change-prop">${escapeHtml(propertyLabel(c.property))}${c.target ? ' · ' + escapeHtml(c.target) : ''}</span>
                      <span class="change-old" title="${escapeHtml(c.oldValue)}">${escapeHtml(c.property === 'flex' ? formatFlexValue(c.oldValue) : (c.displayOld || c.oldValue || '-'))}</span>
                      <span class="change-arrow">→</span>
                      <span class="change-new" title="${escapeHtml(c.newValue)}">${escapeHtml(c.property === 'flex' ? formatFlexValue(c.newValue) : (c.displayNew || c.newValue || '-'))}</span>
                      ${g.shared && g.sharedRows && g.sharedRows.length === 1
                        ? `<button class="change-delete" type="button" data-delete-group="${escapeHtml(g.sharedKey)}" title="删除整组共享变更">${ICONS.close}</button>`
                        : `<button class="change-delete" type="button" data-delete="${c.id}" title="删除此变更">${ICONS.close}</button>`}
                    </div>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          `}
          ${groupList.length > 0 ? `
            <div class="footer">
              <button class="reset-btn" type="button" data-action="reset">重置所有修改</button>
              <button class="copy-btn" type="button" data-action="copy">复制 Prompt</button>
            </div>
          ` : ''}
        </div>
      `;
    }

    _bindEvents() {
      // 复制 Prompt
      const copyBtn = this._shadow.querySelector('[data-action="copy"]');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          this._copyPrompt();
        });
      }
      // 点击元素选择器 → 跳转选中
      this._shadow.querySelectorAll('[data-selector]').forEach(el => {
        el.addEventListener('click', () => {
          const selector = el.dataset.selector;
          bus.emit('jump-to-element', { selector });
        });
      });
      // 点击跨场景提示条的场景按钮 → 跳转到对应场景查看其修改
      this._shadow.querySelectorAll('[data-jump-scene]').forEach(btn => {
        btn.addEventListener('click', () => {
          const route = btn.dataset.jumpScene;
          if (route) window.location.hash = '#/' + route;
        });
      });
      // 单条删除
      this._shadow.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.delete;
          bus.emit('delete-change', { id });
        });
      });
      // 共享组整组删除（合并展示的一条公共样式变更，一次性还原全部命中元素）
      this._shadow.querySelectorAll('[data-delete-group]').forEach(btn => {
        btn.addEventListener('click', () => {
          const sharedKey = btn.dataset.deleteGroup;
          bus.emit('delete-change-group', { sharedKey });
        });
      });
      // 单条批注删除（含元素已失效、标记不显示的孤儿批注）
      this._shadow.querySelectorAll('[data-delete-annotation]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.deleteAnnotation;
          bus.emit('delete-annotation', { id });
        });
      });
      // 关闭面板
      const closeBtn = this._shadow.querySelector('[data-action="close"]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.close();
        });
      }
      // 重置
      const resetBtn = this._shadow.querySelector('[data-action="reset"]');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.close();
          bus.emit('reset-changes');
        });
      }
    }

    _copyPrompt() {
      const prompt = this._buildAllScenesPrompt();
      // 复制到剪贴板
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(prompt).then(() => {
          bus.emit('toast', { message: '已复制 Prompt' });
        }).catch(() => {
          this._fallbackCopy(prompt);
        });
      } else {
        this._fallbackCopy(prompt);
      }
    }

    _fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        bus.emit('toast', { message: '已复制 Prompt' });
      } catch (e) {
        bus.emit('toast', { message: '复制失败，请手动复制' });
      }
      document.body.removeChild(textarea);
    }

    _buildPrompt() {
      const route = this._route || 'default';
      const routeLabel = getCurrentRouteLabel();
      const viewport = `${window.innerWidth}×${window.innerHeight}`;
      const changes = this._changes || [];
      const annotations = this._annotations || [];
      if (changes.length === 0 && annotations.length === 0) {
        const metaLine = getPreviewMetaLine();
        return `## 走查变更单 #/${routeLabel}\n${metaLine}\n**Viewport:** ${viewport}\n\n当前还没有记录到任何配置修改或批注。`;
      }
      // 分组逻辑：共享样式按组件类（sharedKey 去掉 ::属性名）分组，同一组件类的所有属性合并为一条；
      // 非共享样式按 selector 分组，同一元素的多个属性合并为一条。
      const groups = {};
      changes.forEach(c => {
        const componentClass = c.sharedKey ? c.sharedKey.split('::')[0] : '';
        const gkey = c.sharedKey ? componentClass : c.selector;
        if (!groups[gkey]) {
          groups[gkey] = {
            selector: c.selector,
            elementTag: c.elementTag,
            elementText: c.elementText,
            elementClass: c.elementClass || '',
            elementClasses: c.elementClasses || [],
            changes: [],
            shared: !!c.sharedKey,
            componentClass,
            annotation: '',
          };
        }
        groups[gkey].changes.push(c);
      });
      // 批注归组：有样式变更的并入对应组，纯备注单独成组
      const pureAnnotations = [];
      annotations.forEach(a => {
        if (!a.text || !a.text.trim()) return;
        // 尝试匹配已有组（按 selector 或 componentClass）
        const aComponentClass = (a.elementClass || '').split(/\s+/)[0] || '';
        let matched = null;
        for (const g of Object.values(groups)) {
          if (g.selector === a.selector) { matched = g; break; }
          if (g.componentClass && aComponentClass && g.componentClass === aComponentClass) { matched = g; break; }
        }
        if (matched) {
          matched.annotation = a.text;
          if (!matched.elementText && a.elementText) matched.elementText = a.elementText;
          if (!matched.elementTag && a.elementTag) matched.elementTag = a.elementTag;
        } else {
          pureAnnotations.push(a);
        }
      });
      // 计算共享数：不同属性的共享数可能不同，取去重元素数的最大值
      const groupList = Object.values(groups).map(g => {
        if (g.shared && g.changes.length) {
          const propCounts = {};
          g.changes.forEach(c => {
            const pk = c.property + '||' + c.newValue;
            if (!propCounts[pk]) propCounts[pk] = new Set();
            propCounts[pk].add(c.selector);
          });
          g.sharedCount = Math.max(...Object.values(propCounts).map(s => s.size));
        }
        return g;
      });
      // 辅助：提取类名锚点
      const getClassAnchor = (g) => {
        if (g.componentClass) return g.componentClass;
        if (g.elementClass) return g.elementClass.split(/\s+/)[0];
        const m = g.selector.match(/\.([a-zA-Z0-9_-]+)\s*$/) || g.selector.match(/\[data-component-slug="[^"]+"\]\.([a-zA-Z0-9_-]+)/);
        return m ? m[1] : '';
      };
      // 辅助：提取业务类锚点（组件类之外的业务类；从完整稳定类列表挑"非组件类且非通用组件基类"的类）
      const getBusinessClass = (g) => {
        const componentClass = g.componentClass;
        const classes = (g.elementClasses && g.elementClasses.length) ? g.elementClasses : (g.elementClass ? [g.elementClass] : []);
        if (!classes.length) return '';
        // 业务类 = 非组件类、非通用组件基类（btn/icon/card…）的类；组件类与业务类同元素时才能区分
        const biz = classes.find(c => c !== componentClass && !isGenericComponentClass(c));
        if (biz) return biz;
        // 全部是通用组件类或与组件类相同 → 无独立业务类，返回空避免误标
        return '';
      };
      // 辅助：格式化 flex 值为友好描述
      const formatFlexLabel = (v) => {
        if (!v) return '-';
        if (v === '0 1 auto') return '适应（内容宽度）';
        if (v === '1 1 0%' || v === '1 1 0') return '填充（剩余空间）';
        const fixedMatch = v.match(/^0 0 (\d+px)$/);
        if (fixedMatch) return `固定 ${fixedMatch[1]}`;
        return v;
      };
      const metaLine = getPreviewMetaLine();
      const lines = [
        `## 走查变更单 #/${routeLabel}`,
        metaLine,
        `**Viewport:** ${viewport}`,
        '',
        '> 施工单：按最终效果整理，改法优先用设计系统语义类；主定位用组件类，完整选择器见文末备选。',
        '',
      ];
      const machine = [];
      const fullSelectors = [];
      // 样式变更组
      const styleGroups = groupList.filter(g => g.changes.length > 0);
      const noteOnlyGroups = pureAnnotations;
      if (styleGroups.length) {
        lines.push(`### 样式变更（${styleGroups.length} 组）`);
        lines.push('');
      }
      styleGroups.forEach((g, i) => {
        const anchor = (g.elementText || '').replace(/\s+/g, ' ').trim();
        const shortAnchor = anchor.length > 16 ? anchor.slice(0, 16) + '…' : anchor;
        const classAnchor = getClassAnchor(g);
        const role = shortAnchor || classAnchor || g.elementTag;
        // 标题行
        let title = `#### ${i + 1}. ${role}`;
        if (classAnchor) title += ` · .${classAnchor}`;
        if (g.shared) title += `（共享 ${g.sharedCount} 个元素）`;
        lines.push(title);
        // 变更列表
        const addClassChanges = g.changes.filter(c => c.intent === 'add-class');
        const cssMap = new Map();
        g.changes.filter(c => !c.skipCss).forEach(c => {
          const k = c.property + '||' + c.newValue;
          if (!cssMap.has(k)) cssMap.set(k, c);
        });
        const cssChanges = Array.from(cssMap.values());
        const orderChanges = cssChanges.filter(c => c.property === 'order');
        const otherChanges = cssChanges.filter(c => c.property !== 'order');
        const changeLines = [];
        // 加类
        addClassChanges.forEach(c => {
          changeLines.push(`- 加结构类 \`${c.intentClass}\``);
        });
        // 顺序移动
        orderChanges.forEach(c => {
          const posTxt = (c.displayOld && c.displayNew) ? `${c.displayOld} → ${c.displayNew}` : `order ${c.oldValue} → ${c.newValue}`;
          const orderTxt = (c.orderValue || c.newValue) ? `（order: ${c.oldValue || 0} → ${c.orderValue || c.newValue}）` : '';
          changeLines.push(`- 顺序：${posTxt}${orderTxt}`);
        });
        // 其他样式
        otherChanges.forEach(c => {
          const propLabel = c.property === 'flex' ? '宽度' : c.property;
          const valLabel = c.property === 'flex' ? formatFlexLabel(c.newValue) : (c.newValue || '-');
          // 源码是否已声明：未声明 → 标注"新增"；已声明 → 展示源码值（优先 token 原文，其次原值）
          const srcDeclared = !!c.sourceDeclared;
          const srcVal = c.sourceValue || c.oldValue;
          const curLabel = srcDeclared
            ? (c.property === 'flex' ? formatFlexLabel(srcVal) : (srcVal || '-'))
            : '（未声明）';
          const tag = srcDeclared ? '' : '新增 ';
          changeLines.push(`- ${tag}${propLabel}：${curLabel} → ${valLabel}（\`${c.property}: ${c.newValue || '-'}\`）`);
        });
        if (changeLines.length) {
          lines.push('- 变更：');
          changeLines.forEach(l => lines.push('  ' + l));
        }
        // 改法
        const cssSnippet = otherChanges.map(c => `${c.property}: ${c.newValue || '-'}`).join('; ');
        const orderSnippet = orderChanges.length ? `order: ${orderChanges[0].orderValue || orderChanges[0].newValue}` : '';
        const addSnippet = addClassChanges.map(c => c.intentClass).join(' ');
        let fixLine = '- 改法：';
        if (classAnchor) {
          const businessClass = getBusinessClass(g);
          fixLine += `修改 \`.${classAnchor}\``;
          if (businessClass && businessClass !== classAnchor) fixLine += `（业务类 \`.${businessClass}\`）`;
          if (cssSnippet || orderSnippet) fixLine += `：\`${[cssSnippet, orderSnippet].filter(Boolean).join('; ')}\``;
          if (addSnippet) fixLine += `，加类 \`${addSnippet}\``;
        } else {
          fixLine += `在源码对应 CSS 中设置：\`${[cssSnippet, orderSnippet].filter(Boolean).join('; ')}\``;
        }
        lines.push(fixLine);
        // 组内备注
        if (g.annotation) {
          lines.push(`- 备注：${g.annotation}`);
        }
        lines.push('');
        // 完整选择器备选
        fullSelectors.push({ idx: i + 1, classAnchor, selector: g.selector });
        // machine JSON（保持向后兼容）
        machine.push({
          selector: g.selector,
          elementText: anchor,
          role,
          adds: addClassChanges.map(c => c.intentClass).filter(Boolean),
          css: cssChanges.map(c => ({ property: c.property, value: c.property === 'order' ? (c.orderValue || c.newValue) : c.newValue, sourceDeclared: !!c.sourceDeclared, sourceValue: c.sourceValue || '' })),
          annotation: g.annotation || '',
          shared: g.shared || false,
          sharedCount: g.shared ? (g.sharedCount || g.changes.length) : 0,
        });
      });
      // 纯备注（无样式变更）
      if (noteOnlyGroups.length) {
        lines.push(`### 备注（${noteOnlyGroups.length} 条）`);
        lines.push('');
        noteOnlyGroups.forEach((a, i) => {
          const anchor = (a.elementText || '').replace(/\s+/g, ' ').trim();
          const shortAnchor = anchor.length > 16 ? anchor.slice(0, 16) + '…' : anchor;
          const aClass = (a.elementClass || '').split(/\s+/)[0] || '';
          const role = shortAnchor || aClass || a.elementTag;
          lines.push(`${i + 1}. ${role}：${a.text}`);
          fullSelectors.push({ idx: '备注' + (i + 1), classAnchor: aClass, selector: a.selector });
        });
        lines.push('');
      }
      // 完整定位选择器备选（折叠区）
      if (fullSelectors.length) {
        lines.push('<details><summary>完整定位选择器（备选，主定位失效时使用）</summary>');
        lines.push('');
        fullSelectors.forEach(f => {
          lines.push(`${f.idx}. ${f.classAnchor ? '.' + f.classAnchor + ' → ' : ''}\`${f.selector}\``);
        });
        lines.push('');
        lines.push('</details>');
        lines.push('');
      }
      lines.push('<!-- WEGo_CHANGES_JSON ' + JSON.stringify(machine) + ' -->');
      return lines.join('\n');
    }

    /** 从 localStorage 收集所有有变更的场景数据 */
    _loadAllScenesChanges() {
      // 兜底迁移：页面已完全渲染时同步补迁一轮 default 残留（若加载时场景未就绪而未迁完）
      migrateLegacyDefaultData();
      const scenes = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key || !key.startsWith('wego.walkthrough.data.')) continue;
          const routeId = key.replace('wego.walkthrough.data.', '');
          try {
            const raw = localStorage.getItem(key);
            const data = raw ? JSON.parse(raw) : {};
            const changes = (data.changes || []).filter(c => c.newValue !== '' && c.newValue != null);
            const annotations = (data.annotations || []).filter(a => a.text && String(a.text).trim());
            if (changes.length > 0 || annotations.length > 0) {
              scenes.push({ routeId, routeLabel: getRouteLabel(routeId), prNumber: data.prNumber || null, changes, annotations });
            }
          } catch (e) { /* 单个场景解析失败不影响其他场景 */ }
        }
      } catch (e) { /* localStorage 不可用时返回空 */ }
      // 按场景名称排序，当前场景排第一
      const currentRoute = getCurrentRoute();
      scenes.sort((a, b) => {
        if (a.routeId === currentRoute) return -1;
        if (b.routeId === currentRoute) return 1;
        return a.routeLabel.localeCompare(b.routeLabel, 'zh-CN');
      });
      return scenes;
    }

    /** 生成跨场景汇总 Prompt（按场景分组输出） */
    _buildAllScenesPrompt() {
      const viewport = `${window.innerWidth}×${window.innerHeight}`;
      const scenes = this._loadAllScenesChanges();
      if (scenes.length === 0) {
        const metaLine = getPreviewMetaLine();
        return `## 走查变更单（跨场景汇总）\n${metaLine}\n**Viewport:** ${viewport}\n\n当前还没有记录到任何配置修改或批注。`;
      }
      // 只有一个场景时，直接用单场景格式
      if (scenes.length === 1) {
        const s = scenes[0];
        const savedChanges = this._changes;
        const savedAnnotations = this._annotations;
        const savedRoute = this._route;
        this._changes = s.changes;
        this._annotations = s.annotations;
        this._route = s.routeId;
        // 临时覆盖 getCurrentRouteLabel 用场景名
        const prompt = this._buildPrompt();
        this._changes = savedChanges;
        this._annotations = savedAnnotations;
        this._route = savedRoute;
        return prompt;
      }
      // 多场景：按场景分组输出（PR 号取场景数据中的记录，优先当前场景；无记录时回退 URL 解析，均无则标本地预览）
      const scenePr = scenes.find(s => s.prNumber)?.prNumber || getCurrentPrNumber();
      const metaLine = scenePr ? `**PR:** #${scenePr}` : getPreviewMetaLine();
      const lines = [
        `## 走查变更单（跨场景汇总，共 ${scenes.length} 个场景）`,
        metaLine,
        `**Viewport:** ${viewport}`,
        '',
        '> 施工单：按最终效果整理，改法优先用设计系统语义类；主定位用组件类，完整选择器见文末备选。',
        '',
      ];
      const allMachine = [];
      const allFullSelectors = [];
      // 辅助函数（复用 _buildPrompt 中的逻辑）
      const getClassAnchor = (g) => {
        if (g.componentClass) return g.componentClass;
        if (g.elementClass) return g.elementClass.split(/\s+/)[0];
        const m = g.selector.match(/\.([a-zA-Z0-9_-]+)\s*$/) || g.selector.match(/\[data-component-slug="[^"]+"\]\.([a-zA-Z0-9_-]+)/);
        return m ? m[1] : '';
      };
      const formatFlexLabel = (v) => {
        if (!v) return '-';
        if (v === '0 1 auto') return '适应（内容宽度）';
        if (v === '1 1 0%' || v === '1 1 0') return '填充（剩余空间）';
        const fixedMatch = v.match(/^0 0 (\d+px)$/);
        if (fixedMatch) return `固定 ${fixedMatch[1]}`;
        return v;
      };
      const getBusinessClass = (g) => {
        const componentClass = g.componentClass;
        const classes = (g.elementClasses && g.elementClasses.length) ? g.elementClasses : (g.elementClass ? [g.elementClass] : []);
        if (!classes.length) return '';
        const biz = classes.find(c => c !== componentClass && !isGenericComponentClass(c));
        if (biz) return biz;
        return '';
      };
      scenes.forEach((scene, sceneIdx) => {
        lines.push(`### 场景 ${sceneIdx + 1}：${scene.routeLabel}（#/${scene.routeId}）`);
        lines.push('');
        // 分组逻辑（同 _buildPrompt）
        const groups = {};
        scene.changes.forEach(c => {
          const componentClass = c.sharedKey ? c.sharedKey.split('::')[0] : '';
          const gkey = c.sharedKey ? componentClass : c.selector;
          if (!groups[gkey]) {
            groups[gkey] = { selector: c.selector, elementTag: c.elementTag, elementText: c.elementText, elementClass: c.elementClass || '', elementClasses: c.elementClasses || [], changes: [], shared: !!c.sharedKey, componentClass, annotation: '' };
          }
          groups[gkey].changes.push(c);
        });
        const pureAnnotations = [];
        scene.annotations.forEach(a => {
          if (!a.text || !a.text.trim()) return;
          const aComponentClass = (a.elementClass || '').split(/\s+/)[0] || '';
          let matched = null;
          for (const g of Object.values(groups)) {
            if (g.selector === a.selector) { matched = g; break; }
            if (g.componentClass && aComponentClass && g.componentClass === aComponentClass) { matched = g; break; }
          }
          if (matched) {
            matched.annotation = a.text;
            if (!matched.elementText && a.elementText) matched.elementText = a.elementText;
            if (!matched.elementTag && a.elementTag) matched.elementTag = a.elementTag;
          } else {
            pureAnnotations.push(a);
          }
        });
        const groupList = Object.values(groups).map(g => {
          if (g.shared && g.changes.length) {
            const propCounts = {};
            g.changes.forEach(c => {
              const pk = c.property + '||' + c.newValue;
              if (!propCounts[pk]) propCounts[pk] = new Set();
              propCounts[pk].add(c.selector);
            });
            g.sharedCount = Math.max(...Object.values(propCounts).map(s => s.size));
          }
          return g;
        });
        const styleGroups = groupList.filter(g => g.changes.length > 0);
        const noteOnlyGroups = pureAnnotations;
        if (styleGroups.length) {
          lines.push(`#### 样式变更（${styleGroups.length} 组）`);
          lines.push('');
        }
        styleGroups.forEach((g, i) => {
          const anchor = (g.elementText || '').replace(/\s+/g, ' ').trim();
          const shortAnchor = anchor.length > 16 ? anchor.slice(0, 16) + '…' : anchor;
          const classAnchor = getClassAnchor(g);
          const role = shortAnchor || classAnchor || g.elementTag;
          let title = `##### ${i + 1}. ${role}`;
          if (classAnchor) title += ` · .${classAnchor}`;
          if (g.shared) title += `（共享 ${g.sharedCount} 个元素）`;
          lines.push(title);
          const addClassChanges = g.changes.filter(c => c.intent === 'add-class');
          const cssMap = new Map();
          g.changes.filter(c => !c.skipCss).forEach(c => {
            const k = c.property + '||' + c.newValue;
            if (!cssMap.has(k)) cssMap.set(k, c);
          });
          const cssChanges = Array.from(cssMap.values());
          const orderChanges = cssChanges.filter(c => c.property === 'order');
          const otherChanges = cssChanges.filter(c => c.property !== 'order');
          const changeLines = [];
          addClassChanges.forEach(c => { changeLines.push(`- 加结构类 \`${c.intentClass}\``); });
          orderChanges.forEach(c => {
            const posTxt = (c.displayOld && c.displayNew) ? `${c.displayOld} → ${c.displayNew}` : `order ${c.oldValue} → ${c.newValue}`;
            const orderTxt = (c.orderValue || c.newValue) ? `（order: ${c.oldValue || 0} → ${c.orderValue || c.newValue}）` : '';
            changeLines.push(`- 顺序：${posTxt}${orderTxt}`);
          });
          otherChanges.forEach(c => {
            const propLabel = c.property === 'flex' ? '宽度' : c.property;
            const valLabel = c.property === 'flex' ? formatFlexLabel(c.newValue) : (c.newValue || '-');
            // 源码是否已声明：未声明 → 标注"新增"；已声明 → 展示源码值（优先 token 原文，其次原值）
            const srcDeclared = !!c.sourceDeclared;
            const srcVal = c.sourceValue || c.oldValue;
            const curLabel = srcDeclared
              ? (c.property === 'flex' ? formatFlexLabel(srcVal) : (srcVal || '-'))
              : '（未声明）';
            const tag = srcDeclared ? '' : '新增 ';
            changeLines.push(`- ${tag}${propLabel}：${curLabel} → ${valLabel}（\`${c.property}: ${c.newValue || '-'}\`）`);
          });
          if (changeLines.length) {
            lines.push('- 变更：');
            changeLines.forEach(l => lines.push('  ' + l));
          }
          const cssSnippet = otherChanges.map(c => `${c.property}: ${c.newValue || '-'}`).join('; ');
          const orderSnippet = orderChanges.length ? `order: ${orderChanges[0].orderValue || orderChanges[0].newValue}` : '';
          const addSnippet = addClassChanges.map(c => c.intentClass).join(' ');
          let fixLine = '- 改法：';
          if (classAnchor) {
            const businessClass = getBusinessClass(g);
            fixLine += `修改 \`.${classAnchor}\``;
            if (businessClass && businessClass !== classAnchor) fixLine += `（业务类 \`.${businessClass}\`）`;
            if (cssSnippet || orderSnippet) fixLine += `：\`${[cssSnippet, orderSnippet].filter(Boolean).join('; ')}\``;
            if (addSnippet) fixLine += `，加类 \`${addSnippet}\``;
          } else {
            fixLine += `在源码对应 CSS 中设置：\`${[cssSnippet, orderSnippet].filter(Boolean).join('; ')}\``;
          }
          lines.push(fixLine);
          if (g.annotation) lines.push(`- 备注：${g.annotation}`);
          lines.push('');
          allFullSelectors.push({ scene: scene.routeLabel, idx: i + 1, classAnchor, selector: g.selector });
          allMachine.push({
            routeId: scene.routeId,
            routeLabel: scene.routeLabel,
            selector: g.selector,
            elementText: anchor,
            role,
            adds: addClassChanges.map(c => c.intentClass).filter(Boolean),
            css: cssChanges.map(c => ({ property: c.property, value: c.property === 'order' ? (c.orderValue || c.newValue) : c.newValue, sourceDeclared: !!c.sourceDeclared, sourceValue: c.sourceValue || '' })),
            annotation: g.annotation || '',
            shared: g.shared || false,
            sharedCount: g.shared ? (g.sharedCount || g.changes.length) : 0,
          });
        });
        if (noteOnlyGroups.length) {
          lines.push(`#### 备注（${noteOnlyGroups.length} 条）`);
          lines.push('');
          noteOnlyGroups.forEach((a, i) => {
            const anchor = (a.elementText || '').replace(/\s+/g, ' ').trim();
            const shortAnchor = anchor.length > 16 ? anchor.slice(0, 16) + '…' : anchor;
            const aClass = (a.elementClass || '').split(/\s+/)[0] || '';
            const role = shortAnchor || aClass || a.elementTag;
            lines.push(`${i + 1}. ${role}：${a.text}`);
            allFullSelectors.push({ scene: scene.routeLabel, idx: '备注' + (i + 1), classAnchor: aClass, selector: a.selector });
          });
          lines.push('');
        }
      });
      // 完整定位选择器备选（折叠区，按场景分组）
      if (allFullSelectors.length) {
        lines.push('<details><summary>完整定位选择器（备选，主定位失效时使用）</summary>');
        lines.push('');
        const byScene = {};
        allFullSelectors.forEach(f => {
          if (!byScene[f.scene]) byScene[f.scene] = [];
          byScene[f.scene].push(f);
        });
        Object.entries(byScene).forEach(([sceneName, sels]) => {
          lines.push(`**${sceneName}**`);
          sels.forEach(f => {
            lines.push(`${f.idx}. ${f.classAnchor ? '.' + f.classAnchor + ' → ' : ''}\`${f.selector}\``);
          });
          lines.push('');
        });
        lines.push('</details>');
        lines.push('');
      }
      lines.push('<!-- WEGo_CHANGES_JSON ' + JSON.stringify(allMachine) + ' -->');
      return lines.join('\n');
    }

    refresh(changes, route, annotations) {
      this._changes = changes || [];
      this._annotations = annotations || this._annotations || [];
      this._route = route || '';
      if (!this.hasAttribute('hidden')) {
        this._render();
        this._bindEvents();
      }
    }
  }

  // ============================================================
  // 设计系统 Token 数据（颜色 / 字号）
  // ============================================================
  const COLOR_TOKEN_GROUPS = [
    {
      label: '文字色',
      tokens: [
        { name: 'text-default', var: '--text-default', label: '默认', desc: '主要正文文字' },
        { name: 'text-secondary', var: '--text-secondary', label: '次要', desc: '次级说明文字' },
        { name: 'text-tertiary', var: '--text-tertiary', label: '三级', desc: '辅助/占位文字' },
        { name: 'text-disabled', var: '--text-disabled', label: '禁用', desc: '不可用状态文字' },
        { name: 'text-placeholder', var: '--text-placeholder', label: '占位', desc: '输入框占位文字' },
        { name: 'text-inverse', var: '--text-inverse', label: '反白', desc: '深色背景上的文字' },
        { name: 'text-brand', var: '--text-brand', label: '品牌', desc: '品牌色/可点击文字' },
        { name: 'text-link', var: '--text-link', label: '链接', desc: '蓝色文字链接' },
        { name: 'text-promotion', var: '--text-promotion', label: '促销', desc: '价格/促销强调文字' },
        { name: 'text-promotion-strong', var: '--text-promotion-strong', label: '强促销', desc: '强促销红色文字' },
      ],
    },
    {
      label: '背景色',
      tokens: [
        { name: 'bg-surface', var: '--bg-surface', label: '表面', desc: '卡片/容器背景' },
        { name: 'bg-panel', var: '--bg-panel', label: '面板', desc: '浮层/面板背景' },
        { name: 'bg-muted', var: '--bg-muted', label: '弱化', desc: '次级区域背景' },
        { name: 'bg-subtle', var: '--bg-subtle', label: '微弱', desc: '分割/微弱背景' },
        { name: 'bg-active', var: '--bg-active', label: '激活', desc: '按下/选中背景' },
        { name: 'bg-inverse', var: '--bg-inverse', label: '反色', desc: '深色背景' },
        { name: 'bg-brand', var: '--bg-brand', label: '品牌', desc: '品牌色背景' },
        { name: 'bg-page', var: '--bg-page', label: '页面', desc: '页面底色' },
      ],
    },
    {
      label: '边框色',
      tokens: [
        { name: 'border-brand', var: '--border-brand', label: '品牌', desc: '品牌色边框' },
        { name: 'border-danger', var: '--border-danger', label: '危险', desc: '错误/危险边框' },
        { name: 'border-info', var: '--border-info', label: '信息', desc: '信息提示边框' },
        { name: 'border-success', var: '--border-success', label: '成功', desc: '成功状态边框' },
        { name: 'border-warning', var: '--border-warning', label: '警告', desc: '警告状态边框' },
        { name: 'border-control', var: '--border-control', label: '控件', desc: '输入框/控件边框' },
      ],
    },
    {
      label: '状态色',
      tokens: [
        { name: 'status-success', var: '--status-success-default', label: '成功', desc: '成功状态指示' },
        { name: 'status-warning', var: '--status-warning-default', label: '警告', desc: '警告状态指示' },
        { name: 'status-danger', var: '--status-danger-default', label: '危险', desc: '危险/错误状态' },
        { name: 'status-info', var: '--status-info-default', label: '信息', desc: '信息状态指示' },
        { name: 'status-promotion', var: '--status-promotion-default', label: '促销', desc: '促销活动色' },
      ],
    },
    {
      label: '强调色',
      tokens: [
        { name: 'accent-yellow', var: '--accent-yellow', label: '黄', desc: '黄色强调' },
        { name: 'accent-green', var: '--accent-green', label: '绿', desc: '绿色强调' },
        { name: 'accent-purple', var: '--accent-purple', label: '紫', desc: '紫色强调' },
        { name: 'accent-gold', var: '--accent-gold', label: '金', desc: '金色强调' },
      ],
    },
  ];

  // 字号 Token（设计系统语义化排版 token）
  const FONT_SIZE_TOKEN_GROUPS = [
    {
      label: '正文',
      tokens: [
        { name: 'body-xs', var: '--body-xs-font-size', label: 'XS', desc: '极小正文 10px', value: '10px' },
        { name: 'body-sm', var: '--body-sm-font-size', label: 'SM', desc: '小正文 12px', value: '12px' },
        { name: 'body-md', var: '--body-md-font-size', label: 'MD', desc: '正文默认 14px', value: '14px' },
        { name: 'body-lg', var: '--body-lg-font-size', label: 'LG', desc: '大正文 16px', value: '16px' },
        { name: 'body-xl', var: '--body-xl-font-size', label: 'XL', desc: '特大正文 18px', value: '18px' },
      ],
    },
    {
      label: '标题',
      tokens: [
        { name: 'heading-xs', var: '--heading-xs-font-size', label: 'HXS', desc: '小标题 16px', value: '16px' },
        { name: 'heading-sm', var: '--heading-sm-font-size', label: 'HSM', desc: '中小标题 18px', value: '18px' },
        { name: 'heading-md', var: '--heading-md-font-size', label: 'HMD', desc: '中标题 22px', value: '22px' },
        { name: 'heading-lg', var: '--heading-lg-font-size', label: 'HLG', desc: '大标题 24px', value: '24px' },
      ],
    },
    {
      label: '数字',
      tokens: [
        { name: 'number-lg', var: '--number-lg-font-size', label: 'NLG', desc: '大数字 16px', value: '16px' },
        { name: 'number-xl', var: '--number-xl-font-size', label: 'NXL', desc: '特大数字 20px', value: '20px' },
        { name: 'number-xxl', var: '--number-xxl-font-size', label: 'NXXL', desc: '超大数字 24px', value: '24px' },
        { name: 'number-display', var: '--number-display-font-size', label: 'DSP', desc: '展示数字 32px', value: '32px' },
      ],
    },
  ];

  // 字重 Token
  const FONT_WEIGHT_TOKEN_GROUPS = [
    {
      label: '字重',
      tokens: [
        { name: 'font-weight-regular', var: '--font-weight-regular', label: 'Regular', desc: '常规 400', value: '400' },
        { name: 'font-weight-medium', var: '--font-weight-medium', label: 'Medium', desc: '中等 500', value: '500' },
        { name: 'font-weight-semibold', var: '--font-weight-semibold', label: 'Semibold', desc: '半粗 600', value: '600' },
      ],
    },
  ];

  // 行高 Token（设计系统语义化排版 token）
  const LINE_HEIGHT_TOKEN_GROUPS = [
    {
      label: '正文',
      tokens: [
        { name: 'body-xs-lh', var: '--body-xs-line-height', label: 'XS', desc: '极小正文 14px', value: '14px' },
        { name: 'body-sm-lh', var: '--body-sm-line-height', label: 'SM', desc: '小正文 18px', value: '18px' },
        { name: 'body-md-lh', var: '--body-md-line-height', label: 'MD', desc: '正文默认 22px', value: '22px' },
        { name: 'body-lg-lh', var: '--body-lg-line-height', label: 'LG', desc: '大正文 24px', value: '24px' },
        { name: 'body-xl-lh', var: '--body-xl-line-height', label: 'XL', desc: '特大正文 26px', value: '26px' },
      ],
    },
    {
      label: '标题',
      tokens: [
        { name: 'heading-xs-lh', var: '--heading-xs-line-height', label: 'HXS', desc: '小标题 24px', value: '24px' },
        { name: 'heading-sm-lh', var: '--heading-sm-line-height', label: 'HSM', desc: '中小标题 28px', value: '28px' },
        { name: 'heading-md-lh', var: '--heading-md-line-height', label: 'HMD', desc: '中标题 32px', value: '32px' },
        { name: 'heading-lg-lh', var: '--heading-lg-line-height', label: 'HLG', desc: '大标题 34px', value: '34px' },
      ],
    },
    {
      label: '数字',
      tokens: [
        { name: 'number-sm-lh', var: '--number-sm-line-height', label: 'NSM', desc: '小数字 16px', value: '16px' },
        { name: 'number-md-lh', var: '--number-md-line-height', label: 'NMD', desc: '中数字 18px', value: '18px' },
        { name: 'number-lg-lh', var: '--number-lg-line-height', label: 'NLG', desc: '大数字 20px', value: '20px' },
        { name: 'number-xl-lh', var: '--number-xl-line-height', label: 'NXL', desc: '特大数字 24px', value: '24px' },
        { name: 'number-xxl-lh', var: '--number-xxl-line-height', label: 'NXXL', desc: '超大数字 30px', value: '30px' },
        { name: 'number-display-lh', var: '--number-display-line-height', label: 'DSP', desc: '展示数字 38px', value: '38px' },
      ],
    },
  ];

  // 类型 → Token 组映射
  const TOKEN_GROUPS_MAP = {
    color: COLOR_TOKEN_GROUPS,
    fontSize: FONT_SIZE_TOKEN_GROUPS,
    fontWeight: FONT_WEIGHT_TOKEN_GROUPS,
    lineHeight: LINE_HEIGHT_TOKEN_GROUPS,
  };

  // ============================================================
  // wego-wt-style-panel: 样式编辑浮动面板
  // ============================================================
  class WegoWtStylePanel extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._targetEl = null;
      this._selector = '';
      this._data = null;
      this._target = ''; // '' | 'before' | 'after'
      this._commitTimer = null;
      this._tokenPanel = { open: false, type: '', trigger: null };
    }
    connectedCallback() {
      this._render();
      this._bindEvents();
    }
    disconnectedCallback() {
      this._targetEl = null;
    }

    /** 切换编辑目标（元素本体 / ::before / ::after） */
    setTarget(target) {
      if (!this._targetEl || target === this._target) return;
      this._target = target;
      // 伪元素：从已注入的 state.pseudoStyles 读取当前值，无则取计算值快照
      this._data = getElementStyleData(this._targetEl, target);
      this._render();
      this._bindEvents();
      this.removeAttribute('hidden');
      this._updatePosition();
      this._updateMoveControls();
    }

    openForElement(el, selector, target) {
      this._targetEl = el;
      this._selector = selector;
      this._target = target || '';
      this._data = getElementStyleData(el, this._target);
      this._render();
      this._bindEvents();
      this.removeAttribute('hidden');
      this._updatePosition();
      this._updateMoveControls();
    }

    close() {
      this._targetEl = null;
      this.setAttribute('hidden', '');
    }

    /** 根据选中元素在父 flex 容器中的显示位置，更新顺序移动按钮可用性（不可移动方向置灰）。
     *  row 布局只有左/右可移动（上/下置灰），column 布局只有上/下可移动（左/右置灰）；
     *  已在容器边界或非 flex 子项时对应方向置灰；伪元素编辑目标一律置灰。 */
    _updateMoveControls() {
      const btns = this._shadow.querySelectorAll('[data-move]');
      if (!btns.length) return;
      const disableAll = () => btns.forEach(b => { b.disabled = true; });
      const el = this._targetEl;
      if (!el || this._target) { disableAll(); return; }
      const parent = el.parentElement;
      if (!parent) { disableAll(); return; }
      let pcs;
      try { pcs = getComputedStyle(parent); } catch (e) { disableAll(); return; }
      if (!/flex/.test(pcs.display)) { disableAll(); return; }
      const items = flexItems(parent)
        .map((ch, i) => ({ ch, i }))
        .sort((a, b) => computedOrder(a.ch) - computedOrder(b.ch) || a.i - b.i)
        .map(x => x.ch);
      const idx = items.indexOf(el);
      if (idx < 0) { disableAll(); return; }
      const fd = pcs.flexDirection || 'row';
      const isColumn = fd.indexOf('column') === 0;
      const reverse = fd.indexOf('reverse') > 0;
      const hasPrev = idx > 0;
      const hasNext = idx < items.length - 1;
      const avail = { up: false, down: false, left: false, right: false };
      if (isColumn) {
        avail.up = reverse ? hasNext : hasPrev;
        avail.down = reverse ? hasPrev : hasNext;
      } else {
        avail.left = reverse ? hasNext : hasPrev;
        avail.right = reverse ? hasPrev : hasNext;
      }
      btns.forEach(b => { b.disabled = !avail[b.dataset.move]; });
    }

    /** 顺序移动：按方向把选中元素在父 flex 容器中前/后移动一位，并同类同步 + 记录 */
    _moveSelected(dir) {
      const el = this._targetEl;
      if (!el || this._target) return;
      const parent = el.parentElement;
      // 首次对某容器做顺序移动前，记录该容器的初始显示顺序基线（供净零往返判断）
      let baseKey = null;
      if (parent) {
        baseKey = 'orderBase::' + generateSelector(parent);
        if (!state.orderBaselines[baseKey]) {
          state.orderBaselines[baseKey] = displaySeq(parent);
        }
      }
      const mv = moveFlexItem(el, dir);
      if (!mv) { this._updateMoveControls(); return; }
      // 记录目标元素（位置：第X位 → 第Y位；真实 order 值见 orderValue）
      this._recordMoveChange(mv.el, mv, false);
      // 若与兄弟交换了 order（已显式不同），兄弟也记录
      if (mv.nbNew !== mv.nbOrder) this._recordMoveChange(mv.neighbor, mv, true);
      // 共享同步：目标元素与兄弟元素分别以各自元素为基准，同类元素（如其它卡片的同款按钮）一起换位。
      // 必须分别传入各自 targetEl（order 属性相同），否则防抖合并会把其中一个的同步覆盖掉
      this._scheduleSharedSync({ property: 'order', oldValue: String(mv.elOrder), newValue: String(mv.elNew) }, mv.el);
      if (mv.nbNew !== mv.nbOrder) {
        this._scheduleSharedSync({ property: 'order', oldValue: String(mv.nbOrder), newValue: String(mv.nbNew) }, mv.neighbor);
      }
      // 净零往返：容器显示顺序回到首次移动前的基线（如"右移→左移"快速改回）→ 无净变更，
      // 整体还原本次容器内的顺序移动（本地目标/兄弟记录 + 已落地的共享同步 + 残留 DOM），
      // 避免施工单留下 order 0→0 / 兄弟 0→1 这类无视觉变化的脏条目。
      if (baseKey && state.orderBaselines[baseKey] && seqEqual(displaySeq(parent), state.orderBaselines[baseKey])) {
        this._rollbackContainerOrder(parent, baseKey);
      }
      this._updateMoveControls();
    }

    /** 净零往返还原：容器显示顺序已回到首次移动前基线，还原该容器全部顺序移动产物 */
    _rollbackContainerOrder(parent, baseKey) {
      // 1. 取消防抖窗口内未执行的共享同步（order 相关），避免后续再落地无效果同步
      if (this._sharedSyncTimer) { clearTimeout(this._sharedSyncTimer); this._sharedSyncTimer = null; }
      if (this._sharedSyncPending) {
        this._sharedSyncPending = this._sharedSyncPending.filter(p => !(p.result && p.result.property === 'order'));
        if (!this._sharedSyncPending.length) this._sharedSyncPending = null;
      }
      // 2. 还原并移除该容器的顺序移动记录：本容器直接子元素的记录（el 经 changeElRefs 关联），
      //    以及由本容器组件同步出去的共享记录（sharedKey 命中本容器组件类，el 在其他同构容器内）。
      //    注意：只用「直接子元素」归属判断（relEl.parentElement === parent），不能用 parent.contains
      //    （任意后代）——否则会把嵌套子容器内用户已确认的顺序修改（如 product-info 内移动 product-name）
      //    当作本容器的记录一并还原，导致无关修改被重置。
      const compClasses = [];
      Array.from(parent.children).forEach(ch => {
        const cc = pickComponentClass(ch);
        if (cc && !compClasses.includes(cc)) compClasses.push(cc);
      });
      const related = state.changes.filter(c => {
        if (c.property !== 'order') return false;
        const relEl = changeElRefs.get(c.id);
        if (relEl && relEl.parentElement === parent) return true;
        if (c.shared && c.sharedKey) {
          const [cc] = String(c.sharedKey).split('::');
          return compClasses.includes(cc);
        }
        return false;
      });
      const app = document.querySelector('wego-walkthrough');
      if (app && typeof app._revertChange === 'function') {
        related.forEach(c => app._revertChange(c));
      }
      state.changes = state.changes.filter(c => !related.includes(c));
      // 3. 兜底清掉容器内残留的 order 内联（恢复到基线无 order 状态）
      Array.from(parent.children).forEach(ch => { try { ch.style.removeProperty('order'); } catch (e) {} });
      // 4. 清基线：容器已回初始，后续新移动重新建立基线
      delete state.orderBaselines[baseKey];
      if (app && app._syncAfterRecordsChanged) app._syncAfterRecordsChanged();
    }

    /** 记录一次顺序移动变更（property='order'；oldValue/newValue 存真实 order 值供同步匹配与还原，
     *  displayOld/displayNew 存友好位次供配置列表展示） */
    _recordMoveChange(el, mv, isNeighbor) {
      const elNewPos = flexPositionOf(mv.el);
      const elOldPos = mv.idxOld + 1;
      const oldPos = isNeighbor ? elNewPos : elOldPos;
      const newPos = isNeighbor ? elOldPos : elNewPos;
      const oldVal = String(isNeighbor ? mv.nbOrder : mv.elOrder);
      const newVal = String(isNeighbor ? mv.nbNew : mv.elNew);
      bus.emit('style-change', {
        selector: generateSelector(el),
        elementTag: el.tagName.toLowerCase(),
        elementText: (el.textContent || '').trim().substring(0, 50),
        elementClass: (el.className && typeof el.className === 'string')
          ? el.className.trim().split(/\s+/).filter(c => isStableSelectorClass(c))[0] || ''
          : '',
        property: 'order',
        oldValue: oldVal,
        newValue: newVal,
        orderValue: newVal,
        displayOld: '第' + oldPos + '位',
        displayNew: '第' + newPos + '位',
        initPos: isNeighbor ? 0 : (mv.idxOld + 1),
        el,
        shared: false,
        sharedKey: '',
      });
    }

    _updatePosition() {
      // 用户手动拖拽面板后锁定位置（_dragLocks 置位），不再跟随元素
      if (this._dragLocks) return;
      if (!this._targetEl) return;
      const rect = this._targetEl.getBoundingClientRect();
      const panelWidth = 300;
      const gap = 12;
      // 强制 reflow 确保读取到实际高度（面板刚渲染时 offsetHeight 可能为 0）
      void this.offsetHeight;
      const panelHeight = this.getBoundingClientRect().height || this.offsetHeight || 400;
      // 水平方向：优先右侧，不够则左侧，再不够则居中
      let left = rect.right + gap;
      if (left + panelWidth > window.innerWidth - 8) {
        left = rect.left - panelWidth - gap;
        if (left < 8) {
          left = Math.max(8, (window.innerWidth - panelWidth) / 2);
        }
      }
      // 垂直方向：顶部对齐元素顶部，底部超出视口时自动上移
      let top = rect.top;
      const viewportBottom = window.innerHeight - 8;
      if (top + panelHeight > viewportBottom) {
        top = viewportBottom - panelHeight;
      }
      if (top < 40) top = 40;
      this.style.left = left + 'px';
      this.style.top = top + 'px';
    }

    /** 面板拖拽：header 按住拖动（对齐 Liaison 浮动面板可拖拽） */
    _initPanelDrag() {
      this._dragLocks = false;
      const header = this._shadow.querySelector('.header');
      if (!header) return;
      header.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button, select, input')) return;
        e.preventDefault();
        const startX = e.clientX, startY = e.clientY;
        const origLeft = parseInt(this.style.left, 10) || 0;
        const origTop = parseInt(this.style.top, 10) || 0;
        const move = (ev) => {
          const dx = ev.clientX - startX, dy = ev.clientY - startY;
          this.style.left = Math.max(0, Math.min(origLeft + dx, window.innerWidth - 40)) + 'px';
          this.style.top = Math.max(0, Math.min(origTop + dy, window.innerHeight - 40)) + 'px';
        };
        const up = () => {
          this._dragLocks = true;
          header.classList.remove('is-dragging');
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
        };
        header.classList.add('is-dragging');
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });
    }

    _render() {
      const d = this._data || {};
      const tag = this._targetEl ? this._targetEl.tagName.toLowerCase() : '';
      const text = this._targetEl ? (this._targetEl.textContent || '').trim().substring(0, 20) : '';
      const t = this._target || '';
      const hasBefore = this._targetEl ? isPseudoRendered(this._targetEl, 'before') : false;
      const hasAfter = this._targetEl ? isPseudoRendered(this._targetEl, 'after') : false;
      // 颜色 token 模式判断
      const colorIsToken = isTokenValue(d.colorHex);
      const colorTokenName = colorIsToken ? d.colorHex.match(/var\((--[^)]+)\)/)[1].replace(/^--/, '') : '';
      const colorSwatchBg = colorIsToken
        ? (resolveCssValue(d.colorHex, 'color') || 'transparent')
        : hexOpacityToRgba(d.colorHex || '#000000', d.colorOpacity ?? 100);
      // 填充/描边/投影 token 模式判断
      const fillIsToken = isTokenValue(d.fillHex);
      const fillTokenName = fillIsToken ? d.fillHex.match(/var\((--[^)]+)\)/)[1].replace(/^--/, '') : '';
      const strokeIsToken = isTokenValue(d.strokeHex);
      const strokeTokenName = strokeIsToken ? d.strokeHex.match(/var\((--[^)]+)\)/)[1].replace(/^--/, '') : '';
      const shadowIsToken = isTokenValue(d.shadowHex);
      const shadowTokenName = shadowIsToken ? d.shadowHex.match(/var\((--[^)]+)\)/)[1].replace(/^--/, '') : '';
      // 字号/字重/行高 token 模式判断
      const fontSizeIsToken = isTokenValue(d.fontSize);
      const fontSizeTokenName = fontSizeIsToken ? d.fontSize.match(/var\((--[^)]+)\)/)[1].replace(/^--/, '') : '';
      const fontWeightIsToken = isTokenValue(d.fontWeight);
      const fontWeightTokenName = fontWeightIsToken ? d.fontWeight.match(/var\((--[^)]+)\)/)[1].replace(/^--/, '') : '';
      const lineHeightIsToken = isTokenValue(d.lineHeight);
      const lineHeightTokenName = lineHeightIsToken ? d.lineHeight.match(/var\((--[^)]+)\)/)[1].replace(/^--/, '') : '';
      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            z-index: 9600;
            width: 300px;
            max-width: calc(100vw - 16px);
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif;
            /* Liaison 暗色主题：面板内所有 var(--bg-surface) / 文字变量自动变暗 */
            --bg-surface: rgba(30, 30, 30, 0.78);
            --bg-subtle: rgba(255, 255, 255, 0.03);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-default: #fff;
            --text-secondary: rgba(255, 255, 255, 0.6);
            --text-tertiary: rgba(255, 255, 255, 0.42);
            --text-disabled: rgba(255, 255, 255, 0.35);
            --text-brand: #00b96b;
            color: #fff;
            backdrop-filter: blur(18px) saturate(140%);
            -webkit-backdrop-filter: blur(18px) saturate(140%);
          }
          :host(:not([hidden])) {
            display: block;
            animation: wt-panel-in 200ms cubic-bezier(0.22, 0.9, 0.32, 1) both;
          }
          @keyframes wt-panel-in {
            from { opacity: 0; transform: translateY(6px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .panel {
            box-sizing: border-box;
            width: 100%;
            max-height: 70vh;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            border-radius: 16px;
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
            background: var(--bg-surface, rgba(30, 30, 30, 0.78));
            box-shadow: 0 20px 100px rgba(0, 0, 0, 0.12);
          }
          .panel-body {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch; /* iOS 惯性滚动 */
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding-right: 4px;
            margin-right: -4px;
          }
          .panel-body::-webkit-scrollbar { width: 0; height: 0; display: none; }
          .panel-body { scrollbar-width: none; -ms-overflow-style: none; }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            cursor: grab;
            user-select: none;
            -webkit-user-select: none;
            padding: 2px 0;
            border-radius: 8px;
          }
          .header.is-dragging {
            cursor: grabbing;
          }
          .header-info {
            flex: 1;
            min-width: 0;
          }
          .header-tag {
            display: flex;
            align-items: baseline;
            gap: 8px;
            font-size: 13px;
            font-weight: 600;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .header-selector {
            font-size: 11px;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.45);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .header-text {
            font-size: 11px;
            color: var(--text-tertiary, #888);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 2px;
          }
          .close-btn {
            width: 28px;
            height: 28px;
            border: none;
            border-radius: 8px;
            background: transparent;
            color: var(--text-tertiary, #888);
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            flex-shrink: 0;
          }
          .close-btn:hover { background: rgba(0,0,0,0.05); }
          .section {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .section-title {
            margin: 0;
            font-size: 12px;
            font-weight: 500;
            color: #fff;
          }
          .sub-label {
            margin: 10px 0 4px;
            font-size: 10px;
            font-weight: 500;
            color: var(--text-tertiary, #999);
          }
          .layout-row {
            display: flex;
            gap: 8px;
            align-items: center;
          }
          .layout-row .layout-tabs { flex: 1; min-width: 0; }
          .move-grid {
            display: flex;
            gap: 4px;
            flex-shrink: 0;
          }
          .move-btn {
            width: 26px;
            height: 26px;
            border: 1px solid rgba(255,255,255,0.14);
            border-radius: 7px;
            background: rgba(255,255,255,0.06);
            color: var(--text-default, #fff);
            font-size: 13px;
            line-height: 1;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background .15s ease, border-color .15s ease, opacity .15s ease;
          }
          .move-btn:not(:disabled):hover {
            background: rgba(255,255,255,0.14);
            border-color: rgba(0,185,107,0.7);
          }
          .move-btn:not(:disabled):active { transform: translateY(1px); }
          .move-btn:disabled {
            opacity: 0.32;
            cursor: not-allowed;
            color: rgba(255,255,255,0.45);
          }
          .target-switch {
            display: flex;
            gap: 3px;
            padding: 3px;
            margin-top: 2px;
            border-radius: 8px;
            background: rgba(0,0,0,0.04);
          }
          .target-switch button {
            flex: 1;
            height: 24px;
            border: none;
            border-radius: 6px;
            background: transparent;
            color: var(--text-tertiary, #888);
            font-size: 11px;
            cursor: pointer;
          }
          .target-switch button.active {
            background: var(--bg-surface, #fff);
            color: var(--text-brand, #00b96b);
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
          }
          .target-switch button:disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }
          .field-row {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .field-row.two-col {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 130px));
            gap: 8px;
          }
          .field-row.three-col {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 6px;
          }
          .field {
            box-sizing: border-box;
            min-width: 0;
            min-height: 32px;
            display: flex;
            align-items: center;
            gap: 4px;
            flex: 1;
            padding: 4px 12px 4px 4px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid transparent;
          }
          .field-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: var(--text-tertiary, rgba(255,255,255,0.6));
            flex-shrink: 0;
          }
          .text-input {
            all: unset;
            flex: 1;
            min-width: 0;
            min-height: 20px;
            font-family: inherit;
            font-size: 12px;
            line-height: 20px;
            font-weight: 400;
            color: #fff;
            box-sizing: border-box;
          }
          .text-input::placeholder {
            color: rgba(255, 255, 255, 0.35);
          }
          .text-input:focus {
            outline: 1px solid var(--text-brand, #00b96b);
            outline-offset: -1px;
            border-radius: 4px;
          }
          .text-input.opacity-input {
            flex: 0 0 48px;
            width: 48px;
            text-align: right;
          }
          .text-input:disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }
          .token-btn {
            flex-shrink: 0;
            min-width: 28px;
            height: 24px;
            padding: 0 6px;
            border: 1px solid var(--border-color, rgba(255,255,255,0.1));
            border-radius: 6px;
            background: rgba(255,255,255,0.04);
            color: var(--text-tertiary, rgba(255,255,255,0.5));
            font-size: 10px;
            font-weight: 500;
            font-family: inherit;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 80px;
            transition: all 0.15s;
          }
          .token-btn:hover {
            border-color: var(--text-brand, #00b96b);
            color: var(--text-brand, #00b96b);
          }
          .token-btn.active {
            border-color: var(--text-brand, #00b96b);
            background: rgba(0,185,107,0.12);
            color: var(--text-brand, #00b96b);
          }
          /* Token 选择弹出面板 — 分层毛玻璃（与主面板 :host+.panel 结构一致） */
          .token-panel {
            position: absolute;
            z-index: 9650;
            width: 288px;
            border-radius: 14px;
            /* 外层只负责模糊，不设背景色 */
            backdrop-filter: blur(20px) saturate(160%);
            -webkit-backdrop-filter: blur(20px) saturate(160%);
            display: none;
          }
          .token-panel.open {
            display: block;
            animation: wt-panel-in-top 200ms cubic-bezier(0.22, 0.9, 0.32, 1) both;
          }
          @keyframes wt-panel-in-top {
            from { opacity: 0; transform: translateY(-6px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .token-panel-inner {
            max-height: 360px;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch; /* iOS 惯性滚动 */
            padding: 14px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            /* 内层负责半透明背景色 */
            background: rgba(30, 30, 30, 0.78);
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
          }
          .token-panel-inner::-webkit-scrollbar { width: 0; }
          .token-group-title {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-tertiary, rgba(255,255,255,0.5));
            margin: 12px 0 8px;
            letter-spacing: 0.3px;
          }
          .token-group-title:first-child { margin-top: 0; }
          .token-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 8px;
          }
          .token-item {
            position: relative;
            width: 100%;
            aspect-ratio: 1;
            padding: 0;
            border: 2px solid transparent;
            border-radius: 6px;
            background: transparent;
            cursor: pointer;
            transition: border-color 0.12s, transform 0.12s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .token-item:hover {
            transform: scale(1.12);
            z-index: 2;
          }
          .token-item.selected {
            border-color: var(--text-brand, #00b96b);
          }
          .token-swatch {
            width: 100%;
            height: 100%;
            border-radius: 4px;
            border: 1px solid rgba(255,255,255,0.12);
          }
          /* 非颜色类型的数值预览（字号/字重/行高） */
          .token-value {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 400;
            color: var(--text-default, #fff);
            border-radius: 4px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.04);
            overflow: hidden;
            white-space: nowrap;
          }
          /* 独立 tooltip 容器（在 token-panel 外部，不受 overflow 裁剪） */
          .token-tooltip-root {
            position: absolute;
            z-index: 9700;
            display: flex;
            flex-direction: column;
            gap: 3px;
            padding: 8px 10px;
            border-radius: 8px;
            background: rgba(18, 18, 20, 0.92);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 8px 24px rgba(0,0,0,0.35);
            max-width: 200px;
            pointer-events: none;
          }
          .token-tooltip-root[hidden] { display: none; }
          .token-tooltip-name {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-default, #fff);
            font-family: "SF Mono", Menlo, Consolas, monospace;
            white-space: nowrap;
          }
          .token-tooltip-desc {
            font-size: 10px;
            color: var(--text-tertiary, rgba(255,255,255,0.55));
            line-height: 1.4;
            word-break: break-word;
          }
          .layout-tabs {
            display: flex;
            gap: 4px;
            padding: 3px;
            border-radius: 8px;
            background: rgba(0,0,0,0.04);
          }
          .layout-tab {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            padding: 6px 4px;
            border: none;
            border-radius: 6px;
            background: transparent;
            color: var(--text-tertiary, #888);
            font-size: 11px;
            cursor: pointer;
          }
          .layout-tab.active {
            background: var(--bg-surface, #fff);
            color: var(--text-brand, #00b96b);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .layout-tab .icon { font-size: 14px; }
          .alignment-matrix {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            gap: 2px;
            width: 60px;
            height: 60px;
            padding: 4px;
            border-radius: 8px;
            background: rgba(0,0,0,0.04);
          }
          .matrix-dot {
            border: none;
            background: transparent;
            padding: 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .matrix-dot::after {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--text-disabled, #ccc);
          }
          .matrix-dot.active::after {
            background: var(--text-brand, #00b96b);
            width: 8px;
            height: 8px;
          }
          .color-button {
            width: 28px;
            height: 28px;
            border: 1px solid var(--border-color, rgba(0,0,0,0.1));
            border-radius: 50%;
            padding: 0;
            cursor: pointer;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
          }
          .color-button .swatch {
            position: absolute;
            inset: 0;
            border-radius: 50%;
          }
          .btn-group {
            display: flex;
            gap: 2px;
            padding: 2px;
            border-radius: 7px;
            background: rgba(0,0,0,0.04);
          }
          .btn-group button {
            flex: 1;
            height: 26px;
            border: none;
            background: transparent;
            border-radius: 5px;
            font-size: 11px;
            color: var(--text-tertiary, #888);
            cursor: pointer;
            padding: 0 4px;
          }
          .btn-group button.active {
            background: var(--bg-surface, #fff);
            color: var(--text-brand, #00b96b);
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
          }
          .field.metric-field {
            padding: 0 4px 0 0;
          }
          .field-select-wrap {
            position: relative;
            flex: 0 0 auto;
            min-width: 28px;
            height: 20px;
            margin-left: 4px;
            display: inline-flex;
            align-items: center;
            align-self: center;
          }
          .field-select-trigger {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            font-size: 12px;
            line-height: 12px;
            color: rgba(255, 255, 255, 0.72);
            pointer-events: none;
          }
          .field-select {
            appearance: none;
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
          }
          .field-select option {
            color: #111;
          }
          select.text-input {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 8px center;
            padding-right: 24px;
          }
        </style>
        <div class="panel">
          <div class="header" title="按住可拖动面板">
            <div class="header-info">
              <div class="header-tag">${tag || '—'}${this._selector ? `<span class="header-selector">${escapeHtml(this._selector.substring(0, 40))}</span>` : ''}</div>
              ${text ? `<div class="header-text">${escapeHtml(text)}</div>` : ''}
            </div>
            <button class="close-btn" type="button" data-action="close">${ICONS.close}</button>
          </div>

          <div class="panel-body">
          ${hasBefore || hasAfter ? `
          <div class="target-switch" data-target-switch>
            <button type="button" data-target="" class="${t === '' ? 'active' : ''}">元素</button>
            <button type="button" data-target="before" ${hasBefore ? '' : 'disabled'} class="${t === 'before' ? 'active' : ''}">::before</button>
            <button type="button" data-target="after" ${hasAfter ? '' : 'disabled'} class="${t === 'after' ? 'active' : ''}">::after</button>
          </div>
          ` : ''}

          <!-- 定位栏暂屏蔽：display/position/zIndex 文本输入体验差，走查场景不常用，后续补全 top/right/bottom/left 后再恢复
          <div class="section">
            <p class="section-title">定位</p>
            <div class="field-row three-col">
              <div class="field"><span class="field-icon">◈</span><input class="text-input" type="text" value="${d.display || ''}" data-field="display" placeholder="display" /></div>
              <div class="field"><span class="field-icon">◎</span><input class="text-input" type="text" value="${d.position || ''}" data-field="position" placeholder="position" /></div>
              <div class="field"><span class="field-icon">Z</span><input class="text-input" type="text" value="${d.zIndex || ''}" data-field="zIndex" inputmode="numeric" placeholder="z" /></div>
            </div>
          </div>
          -->

          <!-- 自动布局 -->
          <div class="section">
            <p class="section-title">自动布局</p>
            <div class="layout-row">
              <div class="layout-tabs">
                <button class="layout-tab ${d.layoutMode === 'column' ? 'active' : ''}" data-field="layoutMode" data-value="column">
                  <span class="icon">${ICONS.layoutColumn}</span><span>纵向</span>
                </button>
                <button class="layout-tab ${d.layoutMode === 'row' ? 'active' : ''}" data-field="layoutMode" data-value="row">
                  <span class="icon">${ICONS.layoutRow}</span><span>横向</span>
                </button>
              </div>
              <div class="move-grid" title="顺序（调整在父容器中的位置）">
                <button type="button" class="move-btn" data-move="up" title="上移" aria-label="上移"><span class="move-arrow">↑</span></button>
                <button type="button" class="move-btn" data-move="left" title="左移" aria-label="左移"><span class="move-arrow">←</span></button>
                <button type="button" class="move-btn" data-move="right" title="右移" aria-label="右移"><span class="move-arrow">→</span></button>
                <button type="button" class="move-btn" data-move="down" title="下移" aria-label="下移"><span class="move-arrow">↓</span></button>
              </div>
            </div>
            <div class="field-row">
              <div class="alignment-matrix" data-align-matrix>
                ${this._renderAlignMatrix(d)}
              </div>
              <div class="field">
                <span class="field-icon">${ICONS.gap}</span>
                <input class="text-input" type="text" value="${d.layoutGap || ''}" data-field="layoutGap" inputmode="numeric" placeholder="gap" />
              </div>
            </div>
            <p class="sub-label">内边距 padding</p>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">L</span><input class="text-input" type="text" value="${d.paddingLeft || ''}" data-field="paddingLeft" inputmode="numeric" placeholder="左" /></div>
              <div class="field"><span class="field-icon">T</span><input class="text-input" type="text" value="${d.paddingTop || ''}" data-field="paddingTop" inputmode="numeric" placeholder="上" /></div>
            </div>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">R</span><input class="text-input" type="text" value="${d.paddingRight || ''}" data-field="paddingRight" inputmode="numeric" placeholder="右" /></div>
              <div class="field"><span class="field-icon">B</span><input class="text-input" type="text" value="${d.paddingBottom || ''}" data-field="paddingBottom" inputmode="numeric" placeholder="下" /></div>
            </div>
            <p class="sub-label">外边距 margin</p>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">L</span><input class="text-input" type="text" value="${d.marginLeft || ''}" data-field="marginLeft" inputmode="numeric" placeholder="左" /></div>
              <div class="field"><span class="field-icon">T</span><input class="text-input" type="text" value="${d.marginTop || ''}" data-field="marginTop" inputmode="numeric" placeholder="上" /></div>
            </div>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">R</span><input class="text-input" type="text" value="${d.marginRight || ''}" data-field="marginRight" inputmode="numeric" placeholder="右" /></div>
              <div class="field"><span class="field-icon">B</span><input class="text-input" type="text" value="${d.marginBottom || ''}" data-field="marginBottom" inputmode="numeric" placeholder="下" /></div>
            </div>
            <div class="field-row two-col">
              <label class="field metric-field">
                <span class="field-icon">${ICONS.width}</span>
                <input class="text-input" type="text" value="${d.width || ''}" data-field="width" inputmode="numeric" placeholder="—" />
                <span class="field-select-wrap" title="宽度模式">
                  <span class="field-select-trigger">${d.widthMode === 'auto' ? '适应' : (d.widthMode === 'fill' ? '填充' : '固定')}</span>
                  <select class="field-select" data-field="widthMode">
                    <option value="fixed" ${d.widthMode !== 'auto' && d.widthMode !== 'fill' ? 'selected' : ''}>固定宽度</option>
                    <option value="auto" ${d.widthMode === 'auto' ? 'selected' : ''}>自适应宽度</option>
                    <option value="fill" ${d.widthMode === 'fill' ? 'selected' : ''}>填充</option>
                  </select>
                </span>
              </label>
              <label class="field metric-field">
                <span class="field-icon">${ICONS.height}</span>
                <input class="text-input" type="text" value="${d.height || ''}" data-field="height" inputmode="numeric" placeholder="—" />
                <span class="field-select-wrap" title="高度模式">
                  <span class="field-select-trigger">${d.heightMode === 'auto' ? '适应' : (d.heightMode === 'fill' ? '填充' : '固定')}</span>
                  <select class="field-select" data-field="heightMode">
                    <option value="fixed" ${d.heightMode !== 'auto' && d.heightMode !== 'fill' ? 'selected' : ''}>固定高度</option>
                    <option value="auto" ${d.heightMode === 'auto' ? 'selected' : ''}>自适应高度</option>
                    <option value="fill" ${d.heightMode === 'fill' ? 'selected' : ''}>填充</option>
                  </select>
                </span>
              </label>
            </div>
          </div>

          <!-- 字体 -->
          <div class="section">
            <p class="section-title">字体</p>
            <div class="field-row">
              <span class="field-icon">${ICONS.fontSize}</span>
              <input class="text-input" type="text" value="${d.fontSize || ''}" data-field="fontSize" inputmode="numeric" placeholder="字号" />
              <button class="token-btn ${fontSizeIsToken ? 'active' : ''}" type="button" data-token-trigger="fontSize" data-field="fontSize" title="选择设计系统 Token">
                ${fontSizeIsToken ? fontSizeTokenName : ICONS.token}
              </button>
            </div>
            <div class="field-row">
              <span class="field-icon">${ICONS.fontWeight}</span>
              <select class="text-input" data-field="fontWeight">
                <option value="normal" ${d.fontWeight === 'normal' ? 'selected' : ''}>normal</option>
                <option value="300" ${d.fontWeight === '300' ? 'selected' : ''}>300</option>
                <option value="400" ${d.fontWeight === '400' ? 'selected' : ''}>400</option>
                <option value="500" ${d.fontWeight === '500' ? 'selected' : ''}>500</option>
                <option value="600" ${d.fontWeight === '600' ? 'selected' : ''}>600</option>
                <option value="700" ${d.fontWeight === '700' ? 'selected' : ''}>700</option>
                <option value="bold" ${d.fontWeight === 'bold' ? 'selected' : ''}>bold</option>
              </select>
              <button class="token-btn ${fontWeightIsToken ? 'active' : ''}" type="button" data-token-trigger="fontWeight" data-field="fontWeight" title="选择设计系统 Token">
                ${fontWeightIsToken ? fontWeightTokenName : ICONS.token}
              </button>
            </div>
            <div class="field-row">
              <button class="color-button" type="button" data-field="colorHex" data-color-trigger>
                <span class="swatch" style="background:${colorSwatchBg}"></span>
              </button>
              <input class="text-input" type="text" value="${d.colorHex || ''}" data-field="colorHex" />
              <input class="text-input opacity-input" type="text" value="${d.colorOpacity ?? 100}" data-field="colorOpacity" inputmode="numeric" ${colorIsToken ? 'disabled' : ''} />
              <button class="token-btn ${colorIsToken ? 'active' : ''}" type="button" data-token-trigger="color" data-field="colorHex" title="选择设计系统 Token">
                ${colorIsToken ? colorTokenName : ICONS.token}
              </button>
            </div>
            <div class="field-row">
              <span class="field-icon">${ICONS.lineHeight}</span>
              <input class="text-input" type="text" value="${d.lineHeight || ''}" data-field="lineHeight" inputmode="decimal" placeholder="行高" />
              <button class="token-btn ${lineHeightIsToken ? 'active' : ''}" type="button" data-token-trigger="lineHeight" data-field="lineHeight" title="选择设计系统 Token">
                ${lineHeightIsToken ? lineHeightTokenName : ICONS.token}
              </button>
            </div>
            <div class="field-row two-col">
              <div class="btn-group">
                <button data-field="textAlign" data-value="left" class="${d.textAlign === 'left' ? 'active' : ''}">左</button>
                <button data-field="textAlign" data-value="center" class="${d.textAlign === 'center' ? 'active' : ''}">中</button>
                <button data-field="textAlign" data-value="right" class="${d.textAlign === 'right' ? 'active' : ''}">右</button>
              </div>
            </div>
          </div>

          <!-- 外观 -->
          <div class="section">
            <p class="section-title">外观</p>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">${ICONS.opacity}</span><input class="text-input" type="text" value="${d.layerOpacity ?? 100}" data-field="layerOpacity" inputmode="numeric" placeholder="透明" /></div>
              <div class="field"><span class="field-icon">${ICONS.radius}</span><input class="text-input" type="text" value="${d.borderRadiusAll || ''}" data-field="borderRadiusAll" inputmode="numeric" placeholder="圆角" /></div>
            </div>
          </div>

          <!-- 填充 -->
          <div class="section">
            <p class="section-title">填充</p>
            <div class="field-row">
              <button class="color-button" type="button" data-field="fillHex" data-color-trigger>
                <span class="swatch" style="background:${fillIsToken ? (resolveCssValue(d.fillHex, 'color') || 'transparent') : hexOpacityToRgba(d.fillHex || '#FFFFFF', d.fillOpacity ?? 0)}"></span>
              </button>
              <input class="text-input" type="text" value="${d.fillHex || ''}" data-field="fillHex" />
              <input class="text-input opacity-input" type="text" value="${d.fillOpacity ?? 0}" data-field="fillOpacity" inputmode="numeric" ${fillIsToken ? 'disabled' : ''} />
              <button class="token-btn ${fillIsToken ? 'active' : ''}" type="button" data-token-trigger="color" data-field="fillHex" title="选择设计系统 Token">
                ${fillIsToken ? fillTokenName : ICONS.token}
              </button>
            </div>
          </div>

          <!-- 描边 -->
          <div class="section">
            <p class="section-title">描边</p>
            <div class="field-row">
              <button class="color-button" type="button" data-field="strokeHex" data-color-trigger>
                <span class="swatch" style="background:${strokeIsToken ? (resolveCssValue(d.strokeHex, 'color') || 'transparent') : hexOpacityToRgba(d.strokeHex || '#000000', d.strokeOpacity ?? 0)}"></span>
              </button>
              <input class="text-input" type="text" value="${d.strokeHex || ''}" data-field="strokeHex" />
              <input class="text-input opacity-input" type="text" value="${d.strokeOpacity ?? 0}" data-field="strokeOpacity" inputmode="numeric" ${strokeIsToken ? 'disabled' : ''} />
              <button class="token-btn ${strokeIsToken ? 'active' : ''}" type="button" data-token-trigger="color" data-field="strokeHex" title="选择设计系统 Token">
                ${strokeIsToken ? strokeTokenName : ICONS.token}
              </button>
            </div>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">${ICONS.stroke}</span><input class="text-input" type="text" value="${d.strokeWidth || ''}" data-field="strokeWidth" inputmode="numeric" placeholder="宽度" /></div>
              <div class="field">
                <select class="text-input" data-field="strokePosition">
                  <option value="outside" ${d.strokePosition === 'outside' ? 'selected' : ''}>外描边</option>
                  <option value="inside" ${d.strokePosition === 'inside' ? 'selected' : ''}>内描边</option>
                  <option value="center" ${d.strokePosition === 'center' ? 'selected' : ''}>居中</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 投影 -->
          <div class="section">
            <p class="section-title">投影</p>
            <div class="field-row">
              <button class="color-button" type="button" data-field="shadowHex" data-color-trigger>
                <span class="swatch" style="background:${shadowIsToken ? (resolveCssValue(d.shadowHex, 'color') || 'transparent') : hexOpacityToRgba(d.shadowHex || '#000000', d.shadowOpacity ?? 0)}"></span>
              </button>
              <input class="text-input" type="text" value="${d.shadowHex || ''}" data-field="shadowHex" />
              <input class="text-input opacity-input" type="text" value="${d.shadowOpacity ?? 0}" data-field="shadowOpacity" inputmode="numeric" ${shadowIsToken ? 'disabled' : ''} />
              <button class="token-btn ${shadowIsToken ? 'active' : ''}" type="button" data-token-trigger="color" data-field="shadowHex" title="选择设计系统 Token">
                ${shadowIsToken ? shadowTokenName : ICONS.token}
              </button>
            </div>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">X</span><input class="text-input" type="text" value="${d.shadowX || ''}" data-field="shadowX" inputmode="numeric" placeholder="X" /></div>
              <div class="field"><span class="field-icon">Y</span><input class="text-input" type="text" value="${d.shadowY || ''}" data-field="shadowY" inputmode="numeric" placeholder="Y" /></div>
            </div>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">B</span><input class="text-input" type="text" value="${d.shadowBlur || ''}" data-field="shadowBlur" inputmode="numeric" placeholder="模糊" /></div>
              <div class="field"><span class="field-icon">S</span><input class="text-input" type="text" value="${d.shadowSpread || ''}" data-field="shadowSpread" inputmode="numeric" placeholder="扩散" /></div>
            </div>
            <div class="btn-group">
              <button data-field="shadowInset" data-value="false" class="${!d.shadowInset ? 'active' : ''}">外阴影</button>
              <button data-field="shadowInset" data-value="true" class="${d.shadowInset ? 'active' : ''}">内阴影</button>
            </div>
          </div>
          </div>
          <!-- Token 选择弹出面板（分层毛玻璃：外层 backdrop-filter，内层背景色，与主面板一致） -->
          <div class="token-panel" data-token-panel>
            <div class="token-panel-inner">
              <div data-token-list></div>
            </div>
          </div>
          <!-- Token tooltip（独立容器，避免被 token-panel overflow 裁剪） -->
          <div class="token-tooltip-root" data-token-tooltip hidden>
            <div class="token-tooltip-name"></div>
            <div class="token-tooltip-desc"></div>
          </div>
        </div>
      `;
    }

    _renderAlignMatrix(d) {
      const jcMap = { 'flex-start': 0, 'center': 1, 'flex-end': 2, 'space-between': 1, 'space-around': 1 };
      const aiMap = { 'flex-start': 0, 'center': 1, 'flex-end': 2, 'stretch': 1, 'baseline': 1 };
      const col = jcMap[d.justifyContent] ?? 1;
      const row = aiMap[d.alignItems] ?? 1;
      let html = '';
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const active = r === row && c === col;
          const jcVal = ['flex-start', 'center', 'flex-end'][c];
          const aiVal = ['flex-start', 'center', 'flex-end'][r];
          html += `<button class="matrix-dot ${active ? 'active' : ''}" data-align-preset="${jcVal}|${aiVal}"></button>`;
        }
      }
      return html;
    }

    _bindEvents() {
      // 面板拖拽（header 按住移动）
      this._initPanelDrag();
      // 滚动样式面板时关闭 token 选择面板和颜色选择器
      const panelBody = this._shadow.querySelector('.panel-body');
      if (panelBody) {
        panelBody.addEventListener('scroll', () => {
          this._closeTokenPanel();
          bus.emit('close-color-picker');
        });
      }
      // 关闭按钮
      const closeBtn = this._shadow.querySelector('[data-action="close"]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          bus.emit('close-style-panel');
        });
      }
      // 伪元素目标切换
      const switchEl = this._shadow.querySelector('[data-target-switch]');
      if (switchEl) {
        switchEl.querySelectorAll('[data-target]').forEach(btn => {
          if (btn.disabled) return;
          btn.addEventListener('click', () => {
            const target = btn.dataset.target || '';
            this.setTarget(target);
            const app = document.querySelector('wego-walkthrough');
            if (app && typeof app._onTargetChanged === 'function') app._onTargetChanged(target);
          });
        });
      }
      // 所有 data-field 控件
      this._shadow.querySelectorAll('[data-field]').forEach(el => {
        const field = el.dataset.field;
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
          el.addEventListener('change', () => this._onFieldChange(field, el.value));
          el.addEventListener('blur', () => this._onFieldChange(field, el.value));
        } else if (el.tagName === 'BUTTON') {
          el.addEventListener('click', () => {
            if (el.dataset.value !== undefined) {
              this._onFieldChange(field, el.dataset.value);
            }
          });
        }
      });
      // 自动布局：顺序移动（上下左右，按 flex 主轴方向前后移动一位，不可移动方向置灰）
      this._shadow.querySelectorAll('[data-move]').forEach(btn => {
        btn.addEventListener('click', () => this._moveSelected(btn.dataset.move));
      });
      // Liaison 式宽高交互：数值输入（blur/Enter 自动回 fixed 模式 + commit）+ 模式 select（commit）
      const sizeFields = ['width', 'height'];      sizeFields.forEach(field => {
        const input = this._shadow.querySelector(`[data-field="${field}"]`);
        if (!input) return;
        input.addEventListener('input', () => {
          input.value = input.value.replace(/[^\d]/g, '');
        });
        const commit = () => {
          // 输入数值 ⇒ 自动回 fixed 模式（对齐 Liaison ensureFixedSizeMode）
          const modeSel = this._shadow.querySelector(`[data-field="${field}Mode"]`);
          if (modeSel && modeSel.value !== 'fixed') {
            modeSel.value = 'fixed';
            this._updateSizeModeTrigger(field);
            this._onFieldChange(field + 'Mode', 'fixed');
          }
          this._onFieldChange(field, input.value || '');
        };
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { commit(); input.blur(); }
        });
        // 数值上下步进（对齐 Liaison stepper）
        input.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const cur = parseInt(input.value, 10) || 0;
            const next = e.key === 'ArrowUp' ? cur + 1 : cur - 1;
            input.value = String(Math.max(0, next));
            commit();
          }
        });
      });
      // 模式 select change：走 widthMode/heightMode 字段，由 _applyField 按"父容器是否 flex"分派
      // （flex 子项用 flex 表达填充/适应/固定，普通块级用 width 表达），切换结果进配置列表可一键还原
      this._shadow.querySelectorAll('[data-field="widthMode"], [data-field="heightMode"]').forEach(sel => {
        sel.addEventListener('change', () => {
          const modeField = sel.dataset.field; // widthMode / heightMode
          const axis = modeField.replace(/Mode$/, ''); // width / height
          this._updateSizeModeTrigger(axis);
          this._onFieldChange(modeField, sel.value);
        });
      });
      // 对齐矩阵
      this._shadow.querySelectorAll('[data-align-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
          const [jc, ai] = btn.dataset.alignPreset.split('|');
          this._onFieldChange('justifyContent', jc);
          this._onFieldChange('alignItems', ai);
        });
      });
      // 颜色按钮 → 打开自定义颜色选择器
      this._shadow.querySelectorAll('[data-color-trigger]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const field = btn.dataset.field;
          const opacityField = field.replace('Hex', 'Opacity');
          const hex = this._data[field] || '#000000';
          const opacity = this._data[opacityField] ?? 100;
          bus.emit('open-color-picker', {
            trigger: btn,
            hex,
            opacity,
            callback: (newHex, newOpacity) => {
              this._onFieldChange(field, newHex);
              this._onFieldChange(opacityField, String(newOpacity));
            },
          });
        });
      });
      // Token 按钮 → 打开 Token 选择面板
      this._shadow.querySelectorAll('[data-token-trigger]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const type = btn.dataset.tokenTrigger;
          const field = btn.dataset.field;
          if (this._tokenPanel.open && this._tokenPanel.field === field) {
            this._closeTokenPanel();
          } else {
            this._openTokenPanel(btn, type, field);
          }
        });
      });
    }

    _onFieldChange(field, value) {
      if (!this._targetEl || !this._data) return;
      // 输入守门：拦截负数尺寸、非 flex 容器布局方向等非法操作（伪元素与普通元素路径统一），
      // 必须在写 _data 之前拦截，避免污染面板数据
      const guard = this._validateFieldValue(field, value);
      if (!guard.ok) {
        bus.emit('toast', { message: guard.reason });
        return;
      }
      this._data[field] = value;
      // 伪元素目标：编辑通过注入 <head> 的样式规则生效，property 写为 css-property
      if (this._target) {
        const cssProp = this._fieldToCssProp(field);
        let cssVal = this._fieldToCssValue(field);
        // 清空输入 = 移除该伪元素属性注入（数值字段的 0 兜底不适用此场景）
        if (value === '' || value == null) cssVal = '';
        applyPseudoStyle(this._selector, this._target, cssProp, cssVal);
        bus.emit('style-change', {
          selector: this._selector,
          target: this._target,
          elementTag: this._targetEl.tagName.toLowerCase(),
          elementText: (this._targetEl.textContent || '').trim().substring(0, 50),
          elementClass: getFirstStableClass(this._targetEl),
          elementClasses: getStableClasses(this._targetEl),
          property: cssProp,
          oldValue: '',
          newValue: cssVal,
          el: this._targetEl,
        });
        return;
      }
      // 应用到元素（本体）
      const result = this._applyField(field, value);
      if (result) {
        // 无效果守卫：目标新值与当前计算值归一化相等 → 本次改动无视觉差异，撤销已写入 inline，
        // 不记录、不触发共享同步，避免空元素/默认值被共享同步写成无效果的脏施工单。
        // layoutMode 附带 display:flex 副作用：仅当元素已处于 flex/grid 时才真正无效果。
        const _noopSame = normalizeCssValue(result.oldValue) === normalizeCssValue(result.newValue);
        const _noop = _noopSame && (result.property !== 'flex-direction' || (() => {
          const d = getComputedStyle(this._targetEl).display;
          return d === 'flex' || d === 'grid';
        })());
        if (_noop) {
          // 撤销已写入的 inline 样式，保持页面原样
          try { this._targetEl.style.setProperty(result.property, ''); } catch (e) {}
        } else {
          // 记录当前元素变更（若后续命中公共样式同步，由 _applySharedSync 补标 shared 标记）
          bus.emit('style-change', {
            selector: this._selector,
            elementTag: this._targetEl.tagName.toLowerCase(),
            elementText: (this._targetEl.textContent || '').trim().substring(0, 50),
            elementClass: getFirstStableClass(this._targetEl),
            elementClasses: getStableClasses(this._targetEl),
            property: result.property,
            oldValue: result.oldValue,
            newValue: result.newValue,
            el: this._targetEl,
            shared: false,
            sharedKey: '',
          });
          // 样式同步（共享元素模式）：高频输入（颜色拖动等）下防抖，停顿后按最终值执行一次同步扫描，
          // 避免每帧全页扫描卡顿、避免中途值把共享元素改错
          this._scheduleSharedSync(result);
          // 伴随属性（如切尺寸模式时关闭拉伸/写入固定宽）：只记录当前元素；需同步类同的才 schedule 共享同步
          if (result.extra && result.extra.length) {
            result.extra.forEach(extra => {
              bus.emit('style-change', {
                selector: this._selector,
                elementTag: this._targetEl.tagName.toLowerCase(),
                elementText: (this._targetEl.textContent || '').trim().substring(0, 50),
                elementClass: getFirstStableClass(this._targetEl),
                elementClasses: getStableClasses(this._targetEl),
                property: extra.property,
                oldValue: extra.oldValue,
                newValue: extra.newValue,
                el: this._targetEl,
                shared: false,
                sharedKey: '',
              });
              if (extra.sync !== false) this._scheduleSharedSync(extra);
            });
          }
        }
      }
      // 更新 UI（按钮 active 态等）
      this._updateActiveStates();
      // 手动输入宽度/高度数值 → 该轴模式应显示为「固定」（flex 子项用 flex-basis 表达，普通元素用 width/height）
      if (field === 'width' || field === 'height') {
        const v = String(value || '').trim();
        const isSemantic = /^(100%|auto|fit-content|min-content|max-content|inherit|initial|unset)$/i.test(v);
        if (v && !isSemantic) {
          const modeField = field + 'Mode';
          this._data[modeField] = 'fixed';
          const sel = this._shadow.querySelector(`[data-field="${modeField}"]`);
          if (sel && sel.value !== 'fixed') sel.value = 'fixed';
          this._updateSizeModeTrigger(field);
        }
      }
      // 尺寸模式切换后：同步面板宽度/高度输入框的回显，保证界面与元素实际样式一致
      if (field === 'widthMode' || field === 'heightMode') {
        const axis = field.replace(/Mode$/, '');
        const input = this._shadow.querySelector(`[data-field="${axis}"]`);
        if (input && this._targetEl) {
          if (value === 'fixed') {
            const csAxis = getComputedStyle(this._targetEl)[axis];
            input.value = String(parseNumeric(csAxis));
          } else if (result && result.property === 'flex') {
            input.value = ''; // flex 子项的填充/适应：宽度由 flex 表达，输入框无固定数值
          } else if (result) {
            input.value = result.newValue; // 普通块级：100% / fit-content / auto
          }
          this._data[axis] = input.value;
        }
      }
    }

    /** 样式同步防抖调度：高频输入（颜色拖动/步进）只同步最终值。
     *  同一元素同一属性的多次输入只保留最后一次；不同属性/不同元素在停顿后各自执行一次同步。
     *  targetEl 可选：默认当前选中元素；顺序移动等一次改动多个元素（目标+兄弟）时分别传入各自元素，
     *  避免同属性被合并覆盖导致其中一个元素的同类同步丢失。 */
    _scheduleSharedSync(result, targetEl) {
      const el = targetEl || this._targetEl;
      if (!el || !result || !result.property) return;
      if (!this._sharedSyncPending) this._sharedSyncPending = [];
      const idx = this._sharedSyncPending.findIndex(p => p.targetEl === el && p.result.property === result.property);
      if (idx >= 0) {
        // 同一元素同一属性在防抖窗口内连续触发（change+blur/步进等）：保留最早 oldValue（编辑起点），
        // 只更新最终 newValue，避免 oldValue 被第二次读成"改后值"导致找不到共享同类、同步失效
        const existing = this._sharedSyncPending[idx];
        this._sharedSyncPending[idx] = { targetEl: el, result: { ...existing.result, newValue: result.newValue } };
      } else {
        this._sharedSyncPending.push({ targetEl: el, result });
      }
      if (this._sharedSyncTimer) clearTimeout(this._sharedSyncTimer);
      this._sharedSyncTimer = setTimeout(() => {
        this._sharedSyncTimer = null;
        const pending = this._sharedSyncPending;
        this._sharedSyncPending = null;
        if (!pending) return;
        pending.forEach(p => {
          if (!p.targetEl || !p.targetEl.isConnected) return;
          this._applySharedSync(p.result, p.targetEl);
        });
      }, 160);
    }

    /** 执行共享样式同步：按最终值扫描命中元素并批量应用 + 记录（含目标元素补标共享） */
    _applySharedSync(result, targetEl) {
      // 无效果兜底守卫：共享同步结果已是无效果值（old===new 归一化相等）时跳过，
      // 拦截防抖合并产生的 no-op（用户快速改回原值时，_scheduleSharedSync 合并成 old===new，
      // 会绕过 _onFieldChange 入口守卫，把无效果值写到已是同值的共享元素上产生脏施工单）。
      if (result && result.oldValue !== undefined && normalizeCssValue(result.oldValue) === normalizeCssValue(result.newValue)) {
        return;
      }
      const synced = findSharedStyleElements(targetEl, result.property, result.oldValue);
      if (!synced.length) return;
      const componentClass = pickComponentClass(targetEl);
      if (!componentClass) return;
      // 尺寸（宽度/高度）归入同一「size」共享组：配置列表合并为一条「尺寸」记录
      const sharedKey = componentClass + '::' + ((result.property === 'width' || result.property === 'height') ? 'size' : result.property);
      const sharedCount = synced.length + 1;
      synced.forEach(el => {
        let applied = false;
        try { applyStyleProperty(el, result.property, result.newValue); applied = true; } catch (e) {}
        if (!applied) return;
        // 命中元素各自记录一条变更（带共享标记），保证可单独还原、刷新后回放一致
        bus.emit('style-change', {
          selector: generateSelector(el),
          elementTag: el.tagName.toLowerCase(),
          elementText: (el.textContent || '').trim().substring(0, 50),
          elementClass: (el.className && typeof el.className === 'string')
            ? el.className.trim().split(/\s+/).filter(c => isStableSelectorClass(c))[0] || ''
            : '',
          property: result.property,
          oldValue: result.oldValue,
          newValue: result.newValue,
          el,
          shared: true,
          sharedKey,
        });
      });
      // 目标元素补标共享：仅当对应变更记录仍存在时补标（避免误新增记录）
      const tSel = (targetEl === this._targetEl) ? this._selector : generateSelector(targetEl);
      const existingTarget = state.changes.find(c => c.selector === tSel && !c.target && c.property === result.property);
      if (existingTarget) {
        bus.emit('style-change', {
          selector: tSel,
          elementTag: targetEl.tagName.toLowerCase(),
          elementText: (targetEl.textContent || '').trim().substring(0, 50),
          elementClass: (targetEl.className && typeof targetEl.className === 'string')
            ? targetEl.className.trim().split(/\s+/).filter(c => isStableSelectorClass(c))[0] || ''
            : '',
          property: result.property,
          oldValue: result.oldValue,
          newValue: result.newValue,
          el: targetEl,
          shared: true,
          sharedKey,
        });
      }
      bus.emit('toast', { message: `该样式为公共样式，已自动同步 ${sharedCount} 个元素` });
    }

    /** 组合内描边（inset 环）+ 投影为单一 box-shadow 值，避免两处编辑互相覆盖同一条 CSS */
    _combineBoxShadow() {
      const d = this._data || {};
      const num = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
      const parts = [];
      // 内描边：inset 0 0 0 Npx color
      if (d.strokePosition === 'inside') {
        const w = num(d.strokeWidth) || 1;
        const strokeHex = d.strokeHex || '#000000';
        const color = isTokenValue(strokeHex) ? strokeHex : hexOpacityToRgba(strokeHex, d.strokeOpacity ?? 100);
        parts.push(`inset 0 0 0 ${w}px ${color}`);
      }
      // 投影
      const hex = d.shadowHex || '#000000';
      const x = num(d.shadowX);
      const y = num(d.shadowY);
      const blur = num(d.shadowBlur);
      const spread = num(d.shadowSpread);
      const inset = d.shadowInset === true || d.shadowInset === 'true';
      const hasOffset = blur > 0 || x !== 0 || y !== 0 || spread !== 0;
      if (hasOffset) {
        if (isTokenValue(hex)) {
          parts.push(`${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${hex}`);
        } else {
          const op = d.shadowOpacity ?? 0;
          if (op > 0) parts.push(`${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${hexOpacityToRgba(hex, op)}`);
        }
      }
      return parts.length ? parts.join(', ') : 'none';
    }

    /** 面板字段名 → CSS 属性名 */
    _fieldToCssProp(field) {
      const map = {
        layoutMode: 'flex-direction',
        justifyContent: 'justify-content',
        alignItems: 'align-items',
        layoutGap: 'gap',
        paddingLeft: 'padding-left',
        paddingRight: 'padding-right',
        paddingTop: 'padding-top',
        paddingBottom: 'padding-bottom',
        marginTop: 'margin-top',
        marginRight: 'margin-right',
        marginBottom: 'margin-bottom',
        marginLeft: 'margin-left',
        width: 'width',
        height: 'height',
        display: 'display',
        position: 'position',
        zIndex: 'z-index',
        fontSize: 'font-size',
        fontWeight: 'font-weight',
        colorHex: 'color',
        colorOpacity: 'color',
        lineHeight: 'line-height',
        textAlign: 'text-align',
        layerOpacity: 'opacity',
        borderRadiusAll: 'border-radius',
        fillHex: 'background-color',
        fillOpacity: 'background-color',
        strokeHex: 'border',
        strokeOpacity: 'border',
        strokeWidth: 'border',
        strokePosition: 'box-shadow',
        shadowHex: 'box-shadow',
        shadowOpacity: 'box-shadow',
        shadowX: 'box-shadow',
        shadowY: 'box-shadow',
        shadowBlur: 'box-shadow',
        shadowSpread: 'box-shadow',
        shadowInset: 'box-shadow',
      };
      return map[field] || field;
    }

    /** 面板字段名 → 当前 CSS 值（从 _data 推导） */
    _fieldToCssValue(field) {
      const d = this._data || {};
      const num = (v) => (isNaN(parseFloat(v)) ? '' : parseFloat(v));
      switch (field) {
        case 'width':
        case 'height': {
          const raw = (d[field] || '').toString().trim();
          // 支持语义值：100% / auto / fit-content / min-content 等非纯数值
          if (/^(100%|auto|fit-content|min-content|max-content|inherit|initial|unset)$/i.test(raw)) return raw;
          const n = parseFloat(raw);
          return isNaN(n) ? '' : n + 'px';
        }
        case 'colorHex':
        case 'colorOpacity': {
          const hex = d.colorHex || '#000000';
          // Token 模式：直接返回 var(--xxx)
          if (isTokenValue(hex)) return hex;
          const op = d.colorOpacity ?? 100;
          return hexOpacityToRgba(hex, op);
        }
        case 'fillHex':
        case 'fillOpacity': {
          const hex = d.fillHex || '#FFFFFF';
          if (isTokenValue(hex)) return hex;
          const op = d.fillOpacity ?? 0;
          return op > 0 ? hexOpacityToRgba(hex, op) : 'transparent';
        }
        case 'strokeHex':
        case 'strokeOpacity':
        case 'strokeWidth': {
          const hex = d.strokeHex || '#000000';
          const op = d.strokeOpacity ?? 0;
          const w = num(d.strokeWidth);
          if (isTokenValue(hex)) return w > 0 ? `${w}px solid ${hex}` : 'none';
          return op > 0 && w > 0 ? `${w}px solid ${hexOpacityToRgba(hex, op)}` : 'none';
        }
        case 'strokePosition':
        case 'shadowHex':
        case 'shadowOpacity':
        case 'shadowX':
        case 'shadowY':
        case 'shadowBlur':
        case 'shadowSpread':
        case 'shadowInset':
          // 内描边与投影共用 box-shadow，统一组合输出，避免互相覆盖
          return this._combineBoxShadow();
        case 'fontSize':
        case 'paddingLeft':
        case 'paddingRight':
        case 'paddingTop':
        case 'paddingBottom':
        case 'marginLeft':
        case 'marginRight':
        case 'marginTop':
        case 'marginBottom':
        case 'borderRadiusAll':
        case 'layoutGap':
          if (isTokenValue(d[field])) return d[field];
          return num(d[field]) ? num(d[field]) + 'px' : '';
        case 'layerOpacity':
          return d.layerOpacity != null ? (num(d.layerOpacity) / 100).toString() : '';
        case 'lineHeight':
          return d.lineHeight || '';
        case 'layoutMode':
          return d.layoutMode || '';
        case 'justifyContent':
          return d.justifyContent || '';
        case 'alignItems':
          return d.alignItems || '';
        case 'textAlign':
          return d.textAlign || '';
        case 'fontWeight':
          return d.fontWeight || '';
        default:
          return d[field] != null ? d[field] : '';
      }
    }

    /** 输入守门：拦截会污染施工单的非法操作 */
    _validateFieldValue(field, value) {
      // Token 值（var(--xxx)）跳过数值验证
      if (isTokenValue(value)) return { ok: true };
      // 空值 = 清除该属性覆盖（下游会移除变更记录），不做非法拦截
      if (value === '' || value == null) return { ok: true };
      const el = this._targetEl;
      const numVal = parseFloat(value);
      const display = getComputedStyle(el).display;
      const isFlexOrGrid = display === 'flex' || display === 'grid';
      switch (field) {
        case 'layoutGap':
          if (isNaN(numVal) || numVal < 0) return { ok: false, reason: '间距（gap）不能为空或负数' };
          break;
        case 'paddingLeft':
        case 'paddingRight':
        case 'paddingTop':
        case 'paddingBottom':
        case 'marginLeft':
        case 'marginRight':
        case 'marginTop':
        case 'marginBottom':
        case 'width':
        case 'height':
        case 'fontSize':
        case 'borderRadiusAll': {
          const raw = String(value || '').trim();
          const isSemantic = /^(100%|auto|fit-content|min-content|max-content|inherit|initial|unset)$/i.test(raw);
          if (isSemantic) break;
          if (isNaN(numVal) || numVal < 0) return { ok: false, reason: '尺寸/间距不能为空或负数' };
          break;
        }
        case 'layoutMode':
          if (!isFlexOrGrid && display !== 'block' && display !== 'inline-block') {
            return { ok: false, reason: '该元素不是 block/flex/grid 容器，无法调整布局方向' };
          }
          break;
        case 'justifyContent':
        case 'alignItems':
          if (!isFlexOrGrid) return { ok: false, reason: 'justify/align 仅对 flex/grid 容器有效，当前元素不是' };
          break;
        default:
          break;
      }
      return { ok: true };
    }

    _applyField(field, value) {
      const el = this._targetEl;
      const numVal = parseFloat(value);
      const cs = () => getComputedStyle(el);
      // 输入守门：拦截会污染施工单的非法操作（返回 null → 调用方跳过记录）
      const guard = this._validateFieldValue(field, value);
      if (!guard.ok) {
        bus.emit('toast', { message: '已拦截：' + guard.reason });
        return null;
      }
      switch (field) {
        case 'layoutMode': {
          const oldValue = cs().flexDirection;
          el.style.display = 'flex';
          el.style.flexDirection = value;
          return { property: 'flex-direction', oldValue, newValue: value };
        }
        case 'justifyContent': {
          const oldValue = cs().justifyContent;
          el.style.justifyContent = value;
          return { property: 'justify-content', oldValue, newValue: value };
        }
        case 'alignItems': {
          const oldValue = cs().alignItems;
          el.style.alignItems = value;
          return { property: 'align-items', oldValue, newValue: value };
        }
        case 'layoutGap': {
          const oldValue = cs().gap;
          el.style.gap = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'gap', oldValue, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        }
        case 'paddingLeft': {
          const oldValue = cs().paddingLeft;
          el.style.paddingLeft = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'padding-left', oldValue, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        }
        case 'paddingRight': {
          const oldValue = cs().paddingRight;
          el.style.paddingRight = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'padding-right', oldValue, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        }
        case 'paddingTop': {
          const oldValue = cs().paddingTop;
          el.style.paddingTop = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'padding-top', oldValue, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        }
        case 'paddingBottom': {
          const oldValue = cs().paddingBottom;
          el.style.paddingBottom = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'padding-bottom', oldValue, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        }
        case 'width': {
          const oldValue = cs().width;
          const SEM = /^(100%|auto|fit-content|min-content|max-content|inherit|initial|unset)$/i;
          const trimmed = String(value).trim();
          const flexChild = isFlexChild(this._targetEl);
          // flex 子项的宽度由 flex-basis 控制：输入数值 → 写 flex 0 0 Npx（自动关闭拉伸，单一属性表达，
          // 无 width inline 残留）；语义值（auto/100%/fit-content）走普通 width 逻辑
          if (flexChild && !SEM.test(trimmed)) {
            const oldFlex = cs().flex;
            const hadWidth = !!el.style.getPropertyValue('width');
            const n = parseFloat(trimmed);
            if (isNaN(n)) { // 清空 = 清除该元素 flex 覆盖（下游按空值撤销记录）
              if (hadWidth) el.style.width = '';
              el.style.flex = '';
              return { property: 'flex', oldValue: oldFlex, newValue: '' };
            }
            el.style.flex = '0 0 ' + n + 'px';
            let extra = [];
            if (hadWidth) { const ow = cs().width; el.style.width = ''; extra = [{ property: 'width', oldValue: ow, newValue: '', sync: false }]; }
            return { property: 'flex', oldValue: oldFlex, newValue: '0 0 ' + n + 'px', extra };
          }
          const out = SEM.test(trimmed) ? trimmed : (isNaN(numVal) ? '' : numVal + 'px');
          el.style.width = out;
          return { property: 'width', oldValue, newValue: out };
        }
        case 'height': {
          const oldValue = cs().height;
          const SEM = /^(100%|auto|fit-content|min-content|max-content|inherit|initial|unset)$/i;
          const out = SEM.test(String(value).trim()) ? value.trim() : (isNaN(numVal) ? '' : numVal + 'px');
          el.style.height = out;
          return { property: 'height', oldValue, newValue: out };
        }
        case 'widthMode':
        case 'heightMode': {
          // 尺寸模式切换（fill 填充 / auto 适应 / fixed 固定），参考 Figma Auto Layout：
          // - 宽度轴 flex 子项：fill→flex:1 1 0%、auto→flex:0 1 auto、fixed→flex:0 0 Npx（basis 表达固定宽），
          //   单一 flex 属性表达、无 width inline 残留、切回填充/适应无需额外清理；
          //   非 flex 子项：fill→width:100%、auto→width:fit-content、fixed→width:Npx；
          // - 高度轴统一用 height 表达（fill→100%、auto→auto、fixed→Npx）。
          const axis = field === 'widthMode' ? 'width' : 'height';
          const flexChild = isFlexChild(this._targetEl);
          const oldAxis = cs()[axis];
          const cur = String(parseNumeric(oldAxis));
          // 仅接受纯数字输入作为固定值（parseNumeric('') 会返回 0，需避免把空输入当 0px 写入）
          const rawAxis = this._data ? String(this._data[axis] || '') : '';
          const inputVal = /^\d+(\.\d+)?$/.test(rawAxis) ? String(parseNumeric(rawAxis)) : '';
          const useVal = inputVal || cur || '';
          const num = useVal || cur || '0';
          // 固定：写入固定值（有输入用输入值，无输入回填当前计算值，避免视觉坍塌）
          if (value === 'fixed') {
            if (axis === 'width' && flexChild) {
              const oldFlex = cs().flex;
              const hadWidth = !!el.style.getPropertyValue('width');
              el.style.flex = '0 0 ' + num + 'px';
              let extra = [];
              if (hadWidth) { const ow = cs().width; el.style.width = ''; extra = [{ property: 'width', oldValue: ow, newValue: '', sync: false }]; }
              return { property: 'flex', oldValue: oldFlex, newValue: '0 0 ' + num + 'px', extra };
            }
            const nv = num + 'px';
            el.style[axis] = nv;
            return { property: axis, oldValue: oldAxis, newValue: nv };
          }
          // 填充 / 适应：flex 子项用 flex 表达，非 flex 子项用 width 表达
          if (axis === 'width' && flexChild) {
            const oldFlex = cs().flex;
            const hadWidth = !!el.style.getPropertyValue('width');
            el.style.flex = value === 'fill' ? '1 1 0%' : '0 1 auto';
            let extra = [];
            if (hadWidth) {
              const oldW = cs().width;
              el.style.width = '';   // 清历史残留固定宽（空值会触发已有 width 记录的撤销；仅当前元素，不联动同类）
              extra = [{ property: 'width', oldValue: oldW, newValue: '', sync: false }];
            }
            return { property: 'flex', oldValue: oldFlex, newValue: value === 'fill' ? '1 1 0%' : '0 1 auto', extra };
          }
          if (value === 'fill') {
            el.style[axis] = '100%';
            return { property: axis, oldValue: oldAxis, newValue: '100%' };
          }
          const outAuto = axis === 'width' ? 'fit-content' : 'auto';
          el.style[axis] = outAuto;
          return { property: axis, oldValue: oldAxis, newValue: outAuto };
        }
        case 'fontSize': {
          const oldValue = cs().fontSize;
          if (isTokenValue(value)) {
            el.style.fontSize = value;
            return { property: 'font-size', oldValue, newValue: value };
          }
          el.style.fontSize = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'font-size', oldValue, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        }
        case 'fontWeight': {
          const oldValue = cs().fontWeight;
          el.style.fontWeight = value;
          return { property: 'font-weight', oldValue, newValue: value };
        }
        case 'colorHex':
        case 'colorOpacity': {
          const oldValue = cs().color;
          const hex = this._data.colorHex || '#000000';
          const isTok = isTokenValue(hex);
          // Token 模式：直接应用 var(--xxx)，忽略 opacity
          if (isTok) {
            el.style.color = hex;
            return { property: 'color', oldValue, newValue: hex };
          }
          const opacity = this._data.colorOpacity ?? 100;
          const rgba = hexOpacityToRgba(hex, opacity);
          el.style.color = rgba;
          return { property: 'color', oldValue, newValue: rgba };
        }
        case 'lineHeight': {
          const oldValue = cs().lineHeight;
          el.style.lineHeight = value || '';
          return { property: 'line-height', oldValue, newValue: value || '' };
        }        case 'textAlign': {
          const oldValue = cs().textAlign;
          el.style.textAlign = value;
          return { property: 'text-align', oldValue, newValue: value };
        }
        case 'layerOpacity': {
          const oldValue = cs().opacity;
          el.style.opacity = isNaN(numVal) ? '' : (numVal / 100).toString();
          return { property: 'opacity', oldValue, newValue: isNaN(numVal) ? '' : (numVal / 100).toString() };
        }
        case 'borderRadiusAll': {
          const oldValue = cs().borderRadius;
          el.style.borderRadius = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'border-radius', oldValue, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        }
        case 'fillHex':
        case 'fillOpacity': {
          const oldValue = cs().backgroundColor;
          const hex = this._data.fillHex || '#FFFFFF';
          if (isTokenValue(hex)) {
            el.style.backgroundColor = hex;
            return { property: 'background-color', oldValue, newValue: hex };
          }
          const opacity = this._data.fillOpacity ?? 0;
          const rgba = opacity > 0 ? hexOpacityToRgba(hex, opacity) : 'transparent';
          el.style.backgroundColor = rgba;
          return { property: 'background-color', oldValue, newValue: rgba };
        }
        case 'strokeHex':
        case 'strokeOpacity':
        case 'strokeWidth': {
          const oldValue = cs().border;
          const hex = this._data.strokeHex || '#000000';
          const width = parseFloat(this._data.strokeWidth) || 0;
          if (isTokenValue(hex)) {
            el.style.borderWidth = width > 0 ? width + 'px' : '';
            el.style.borderStyle = width > 0 ? 'solid' : '';
            el.style.borderColor = hex;
            return { property: 'border', oldValue, newValue: width > 0 ? `${width}px solid ${hex}` : '' };
          }
          const opacity = this._data.strokeOpacity ?? 0;
          const color = opacity > 0 && width > 0 ? hexOpacityToRgba(hex, opacity) : 'transparent';
          el.style.borderWidth = width > 0 ? width + 'px' : '';
          el.style.borderStyle = width > 0 ? 'solid' : '';
          el.style.borderColor = color;
          return { property: 'border', oldValue, newValue: width > 0 ? `${width}px solid ${color}` : '' };
        }
        case 'strokePosition':
        case 'shadowHex':
        case 'shadowOpacity':
        case 'shadowX':
        case 'shadowY':
        case 'shadowBlur':
        case 'shadowSpread':
        case 'shadowInset': {
          // 内描边与投影共用 box-shadow：任一字段变化都重新组合整体值，保证两者可共存、记录只有一条
          const oldValue = cs().boxShadow;
          const out = this._combineBoxShadow();
          el.style.boxShadow = out === 'none' ? '' : out;
          return { property: 'box-shadow', oldValue, newValue: out };
        }
        case 'display': {
          const oldValue = cs().display;
          el.style.display = value || '';
          return { property: 'display', oldValue, newValue: value || '' };
        }
        case 'position': {
          const oldValue = cs().position;
          el.style.position = value || '';
          return { property: 'position', oldValue, newValue: value || '' };
        }
        case 'zIndex': {
          const oldValue = cs().zIndex;
          const out = isNaN(numVal) ? '' : String(Math.round(numVal));
          el.style.zIndex = out;
          return { property: 'z-index', oldValue, newValue: out };
        }
        default:
          return null;
      }
    }

    /** 更新宽高模式 trigger 文字（固定/适应/填充） */
    _updateSizeModeTrigger(axis) {
      const sel = this._shadow.querySelector(`[data-field="${axis}Mode"]`);
      const trigger = this._shadow.querySelector(`[data-field="${axis}"] + .field-select-wrap .field-select-trigger`);
      if (!sel || !trigger) return;
      const v = sel.value;
      trigger.textContent = v === 'auto' ? '适应' : (v === 'fill' ? '填充' : '固定');
    }

    _updateActiveStates() {
      const d = this._data;
      // layout tabs
      this._shadow.querySelectorAll('[data-field="layoutMode"]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === d.layoutMode);
      });
      // text align
      this._shadow.querySelectorAll('[data-field="textAlign"]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === d.textAlign);
      });
      // shadow inset
      this._shadow.querySelectorAll('[data-field="shadowInset"]').forEach(btn => {
        const isActive = (btn.dataset.value === 'true') === (d.shadowInset === true || d.shadowInset === 'true');
        btn.classList.toggle('active', isActive);
      });
      // 颜色色块更新
      this._shadow.querySelectorAll('[data-color-trigger]').forEach(btn => {
        const field = btn.dataset.field;
        const opacityField = field.replace('Hex', 'Opacity');
        const val = d[field] || '#000000';
        const opacity = d[opacityField] ?? 100;
        const swatch = btn.querySelector('.swatch');
        if (swatch) {
          swatch.style.background = isTokenValue(val)
            ? (resolveCssValue(val, 'color') || 'transparent')
            : hexOpacityToRgba(val, opacity);
        }
      });
      // 颜色 Token 按钮状态 + opacity 输入框联动 + 输入框回显（统一处理4个颜色字段）
      const colorFields = ['colorHex', 'fillHex', 'strokeHex', 'shadowHex'];
      colorFields.forEach(field => {
        const opacityField = field.replace('Hex', 'Opacity');
        const val = d[field] || '';
        const isTok = isTokenValue(val);
        // T 按钮状态
        const tokenBtn = this._shadow.querySelector(`[data-token-trigger="color"][data-field="${field}"]`);
        if (tokenBtn) {
          tokenBtn.classList.toggle('active', isTok);
          if (isTok) {
            const tokName = val.match(/var\((--[^)]+)\)/)[1].replace(/^--/, '');
            if (tokenBtn.textContent.trim() !== tokName) tokenBtn.textContent = tokName;
          } else {
            if (tokenBtn.innerHTML.trim() !== ICONS.token.trim()) tokenBtn.innerHTML = ICONS.token;
          }
        }
        // opacity 输入框禁用 + 值回显
        const opacityInput = this._shadow.querySelector(`input[data-field="${opacityField}"]`);
        if (opacityInput) {
          opacityInput.disabled = isTok;
          const opacityVal = d[opacityField] ?? 100;
          if (opacityInput.value !== String(opacityVal)) {
            opacityInput.value = opacityVal;
          }
        }
        // hex 输入框值回显（用 input 限定，避免匹配到颜色色块按钮）
        const hexInput = this._shadow.querySelector(`input[data-field="${field}"]`);
        if (hexInput && hexInput.value !== val) {
          hexInput.value = val;
        }
      });
      // 字号/字重/行高 Token 按钮状态 + 输入框回显
      const textFields = ['fontSize', 'fontWeight', 'lineHeight'];
      textFields.forEach(field => {
        const val = d[field] || '';
        const isTok = isTokenValue(val);
        const tokenBtn = this._shadow.querySelector(`[data-token-trigger="${field}"][data-field="${field}"]`);
        if (tokenBtn) {
          tokenBtn.classList.toggle('active', isTok);
          if (isTok) {
            const tokName = val.match(/var\((--[^)]+)\)/)[1].replace(/^--/, '');
            if (tokenBtn.textContent.trim() !== tokName) tokenBtn.textContent = tokName;
          } else {
            if (tokenBtn.innerHTML.trim() !== ICONS.token.trim()) tokenBtn.innerHTML = ICONS.token;
          }
        }
        // 输入框值回显（用 input/select 限定，避免匹配到 Token 按钮；fontWeight 是 select）
        const input = this._shadow.querySelector(`input[data-field="${field}"], select[data-field="${field}"]`);
        if (input && input.value !== val) {
          input.value = val;
        }
      });
      // 对齐矩阵
      this._shadow.querySelectorAll('[data-align-preset]').forEach(btn => {
        const [jc, ai] = btn.dataset.alignPreset.split('|');
        btn.classList.toggle('active', jc === d.justifyContent && ai === d.alignItems);
      });
    }

    // ── Token 选择面板 ──────────────────────────────────────
    _openTokenPanel(trigger, type, field) {
      const panel = this._shadow.querySelector('[data-token-panel]');
      if (!panel) return;
      this._tokenPanel = { open: true, type, field, trigger };
      this._renderTokenList(type);
      panel.classList.add('open');
      // 定位到触发按钮下方，下方空间不够时自动上翻
      const rect = trigger.getBoundingClientRect();
      const panelRect = this.getBoundingClientRect();
      const panelWidth = 288;
      const panelHeight = panel.offsetHeight || 200;
      let left = rect.left - panelRect.left;
      // 水平方向：优先左对齐触发按钮，超出则右移
      if (left + panelWidth > panelRect.width - 8) {
        left = panelRect.width - panelWidth - 8;
      }
      if (left < 8) left = 8;
      // 垂直方向：优先下方，下方空间不够则上方
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      let top;
      if (spaceBelow >= panelHeight) {
        top = rect.bottom - panelRect.top + 6;
      } else {
        top = rect.top - panelRect.top - panelHeight - 6;
      }
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
      // 阻止面板和触发按钮内部 mousedown/touchstart 冒泡，避免 shadow DOM 事件重定向导致外部关闭逻辑误关
      this._tokenPanelStopProp = (e) => e.stopPropagation();
      panel.addEventListener('mousedown', this._tokenPanelStopProp);
      panel.addEventListener('touchstart', this._tokenPanelStopProp);
      trigger.addEventListener('mousedown', this._tokenPanelStopProp);
      trigger.addEventListener('touchstart', this._tokenPanelStopProp);
      // 点击外部关闭（用 composedPath 穿透 shadow DOM 边界判断，避免事件重定向误判）
      this._tokenOutsideHandler = (e) => {
        const path = e.composedPath ? e.composedPath() : [];
        const inPanel = path.includes(panel);
        const inTrigger = path.includes(trigger);
        if (!inPanel && !inTrigger) {
          this._closeTokenPanel();
        }
      };
      setTimeout(() => document.addEventListener('mousedown', this._tokenOutsideHandler, true), 0);
      setTimeout(() => document.addEventListener('touchstart', this._tokenOutsideHandler, true), 0);
    }

    _closeTokenPanel() {
      this._hideTokenTooltip();
      const panel = this._shadow.querySelector('[data-token-panel]');
      if (panel) panel.classList.remove('open');
      // 移除阻止冒泡监听
      if (this._tokenPanelStopProp) {
        panel.removeEventListener('mousedown', this._tokenPanelStopProp);
        panel.removeEventListener('touchstart', this._tokenPanelStopProp);
        if (this._tokenPanel.trigger) {
          this._tokenPanel.trigger.removeEventListener('mousedown', this._tokenPanelStopProp);
          this._tokenPanel.trigger.removeEventListener('touchstart', this._tokenPanelStopProp);
        }
        this._tokenPanelStopProp = null;
      }
      this._tokenPanel = { open: false, type: '', trigger: null };
      if (this._tokenOutsideHandler) {
        document.removeEventListener('mousedown', this._tokenOutsideHandler, true);
        document.removeEventListener('touchstart', this._tokenOutsideHandler, true);
        this._tokenOutsideHandler = null;
      }
    }

    _renderTokenList(type) {
      const listEl = this._shadow.querySelector('[data-token-list]');
      if (!listEl) return;
      const field = this._tokenPanel.field || 'colorHex';
      const currentVal = this._data ? (this._data[field] || '') : '';
      const groups = TOKEN_GROUPS_MAP[type] || [];
      let html = '';
      groups.forEach(group => {
        html += `<div class="token-group-title">${group.label}</div>`;
        html += `<div class="token-grid">`;
        group.tokens.forEach(token => {
          const varExpr = `var(${token.var})`;
          const selected = currentVal === varExpr;
          // 颜色类型显示色块，其他类型显示数值预览（统一固定字号，避免大字号溢出）
          let previewHtml;
          if (type === 'color') {
            const color = resolveCssValue(varExpr, 'color') || 'transparent';
            previewHtml = `<span class="token-swatch" style="background:${color}"></span>`;
          } else {
            previewHtml = `<span class="token-value">${token.label}</span>`;
          }
          html += `
            <button class="token-item ${selected ? 'selected' : ''}" type="button"
              data-token-value="${varExpr}" data-token-name="${token.name}"
              data-token-var="${token.var}" data-token-desc="${token.label} · ${token.desc || ''}">
              ${previewHtml}
            </button>`;
        });
        html += `</div>`;
      });
      listEl.innerHTML = html;
      // 绑定 token 项事件：click 选择 + mouseenter/mouseleave 显示 tooltip
      listEl.querySelectorAll('.token-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const value = item.dataset.tokenValue;
          this._onFieldChange(field, value);
          this._hideTokenTooltip();
          this._closeTokenPanel();
        });
        item.addEventListener('mouseenter', () => this._showTokenTooltip(item));
        item.addEventListener('mouseleave', () => this._hideTokenTooltip());
      });
    }

    _showTokenTooltip(item) {
      const tooltip = this._shadow.querySelector('[data-token-tooltip]');
      if (!tooltip) return;
      tooltip.querySelector('.token-tooltip-name').textContent = item.dataset.tokenVar || '';
      tooltip.querySelector('.token-tooltip-desc').textContent = item.dataset.tokenDesc || '';
      tooltip.hidden = false;
      // 定位到色块上方居中
      const itemRect = item.getBoundingClientRect();
      const hostRect = this.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      let left = itemRect.left - hostRect.left + itemRect.width / 2 - tooltipRect.width / 2;
      let top = itemRect.top - hostRect.top - tooltipRect.height - 8;
      // 边界保护：左侧不超出，右侧不超出
      if (left < 4) left = 4;
      if (left + tooltipRect.width > hostRect.width - 4) left = hostRect.width - tooltipRect.width - 4;
      // 上方空间不够时显示在色块下方
      if (top < 4) top = itemRect.bottom - hostRect.top + 8;
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    }

    _hideTokenTooltip() {
      const tooltip = this._shadow.querySelector('[data-token-tooltip]');
      if (tooltip) tooltip.hidden = true;
    }
  }

  // ============================================================
  // wego-walkthrough: 主应用根元素
  // ============================================================
  // wego-walkthrough: 主应用根元素（统一入口）
  // ============================================================
  class WegoWalkthrough extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._collapsed = true;
      this._drag = { active: false, moved: false, pointerId: null, startX: 0, startY: 0, origX: 0, origY: 0 };
      this._walkthroughMode = false;
      this._faultState = { load: false, save: false, delete: false, slow: false };
      this._subpanelOpen = null;
      this._components = {};
      this._suppressClick = false;
      this._anchorDir = null; // 展开时确定的锚点方向，收起时复用，避免展开态中心偏移导致方向误判
    }

    connectedCallback() {
      this._render();
      this._initComponents();
      this._bindEvents();
      this._restorePosition();
      this._restoreFaultState();
      state.currentRoute = getCurrentRoute();
      window.addEventListener('hashchange', this._onHashChange);
      // 主 tab 切换会清空 hash（hashchange 不触发），用 MutationObserver 监听激活 panel 变化
      this._tabObserver = new MutationObserver(() => {
        clearTimeout(this._tabChangeTimer);
        this._tabChangeTimer = setTimeout(() => this._handleRouteChange(), 100);
      });
      try {
        const hostPage = document.querySelector('.host-shell-page') || document.body;
        this._tabObserver.observe(hostPage, { subtree: true, attributes: true, attributeFilter: ['class'] });
      } catch (e) { /* 监听目标不可用时降级，仅靠 hashchange */ }
      // 离开页面前把防抖窗口内未落盘的最后修改立即写入
      window.addEventListener('pagehide', this._onPageHide);
      this._loadChanges();
      // 迁移修复前遗留的 default 场景残留数据（主 tab 识别修复前的历史数据）：
      // 按选择器在 DOM 中定位元素 → 从 host-tab 面板映射 routeId → 归并到正确场景。
      // 场景为异步渲染，未命中的变更会在方法内延时重试补迁。
      this._migrateLegacyDefaultData();
      // 暴露失败注入 API（兼容现有场景代码）
      window.WegoApp = window.WegoApp || {};
      window.WegoApp.faultInjection = {
        isEnabled: (key) => !!this._faultState[key],
        setEnabled: (key, on) => { this._faultState[key] = !!on; this._persistFaultState(); this._updateFaultSwitches(); this._updateToolbarState(); },
      };
    }

    disconnectedCallback() {
      this._cleanupDrag();
      // 移除全局监听器，避免组件销毁后闭包持有 this 造成泄漏、重建后事件重复处理
      window.removeEventListener('hashchange', this._onHashChange);
      window.removeEventListener('pagehide', this._onPageHide);
      document.removeEventListener('pointerdown', this._onDocPointerDown, true);
      document.removeEventListener('keydown', this._onDocKeyDown);
      if (this._tabObserver) { this._tabObserver.disconnect(); this._tabObserver = null; }
      if (this._tabChangeTimer) { clearTimeout(this._tabChangeTimer); this._tabChangeTimer = null; }
      if (this._migrateTimer) { clearTimeout(this._migrateTimer); this._migrateTimer = null; }
    }

    // ── 渲染 ──────────────────────────────────────────────
    _render() {
      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            z-index: 9999;
            display: block;
            color: #fff;
            font-family: "PingFang SC", "SF Pro Text", "Segoe UI", sans-serif;
            --toolbar-spring: ease-out;
            overflow: visible;
            -webkit-tap-highlight-color: transparent;
            touch-action: none;
            /* Liaison 暗色风格：面板容器保持暗色，但强调色沿用设计系统绿色 */
            --text-brand: #00b96b;
            user-select: none;
            -webkit-user-select: none;
          }
          :host([hidden]) { display: none; }

          .toolbar-container {
            box-sizing: border-box;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 48px;
            padding: 3px;
            border-radius: 999px;
            background: rgba(30, 30, 30, 0.76);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
            backdrop-filter: blur(18px) saturate(145%);
            -webkit-backdrop-filter: blur(18px) saturate(145%);
            white-space: nowrap;
            overflow: hidden;
            will-change: width;
            transition: width 300ms var(--toolbar-spring);
            cursor: grab;
          }
          .toolbar-container.is-dragging {
            cursor: grabbing;
            transition: none;
          }
          .toolbar-container.is-collapsed {
            width: 48px;
          }
          .toolbar-container.is-expanded {
            width: auto;
          }

          .toolbar-clip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: 999px;
          }

          .collapse-btn {
            width: 40px;
            height: 40px;
            border: 0;
            border-radius: 999px;
            background: transparent;
            color: rgba(255,255,255,0.7);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            flex-shrink: 0;
            transition: background-color 140ms ease, color 140ms ease;
          }
          .collapse-btn:active { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.92); }

          .toolbar-main {
            display: inline-flex;
            align-items: center;
            gap: 0;
            min-width: 0;
            padding: 0 2px;
          }

          .tool-btn {
            width: 40px;
            height: 40px;
            border: 0;
            border-radius: 999px;
            background: transparent;
            color: rgba(255,255,255,0.7);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            flex-shrink: 0;
            transition: background-color 140ms ease, color 140ms ease, transform 140ms ease;
            position: relative;
          }
          .tool-btn:active { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.92); }
          .tool-btn[data-active="true"] { background: rgba(255,255,255,0.12); color: #fff; }
          .tool-btn .badge-dot {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ff383c;
            border: 2px solid rgba(30,30,30,0.76);
            display: none;
          }
          .tool-btn[data-has-changes="true"] .badge-dot { display: block; }
          .tool-btn .tool-icon { display: inline-flex; align-items: center; justify-content: center; }
          .tool-btn .tool-count {
            display: none;
            font-size: 12px;
            font-weight: 600;
            color: #fff;
            line-height: 1;
            white-space: nowrap;
          }
          .tool-btn[data-has-count="true"] .tool-icon { display: none; }
          .tool-btn[data-has-count="true"] .tool-count { display: inline-flex; }
          .tool-btn .count-bubble {
            position: absolute;
            top: 2px;
            right: 2px;
            min-width: 16px;
            height: 16px;
            padding: 0 4px;
            border-radius: 8px;
            background: #ff6b35;
            color: #fff;
            font-size: 10px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            border: 2px solid rgba(30,30,30,0.85);
            pointer-events: none;
          }

          .count-btn {
            min-width: 40px;
            height: 40px;
            padding: 0 10px;
            border: 0;
            border-radius: 999px;
            background: transparent;
            color: #fff;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            flex-shrink: 0;
            transition: background-color 140ms ease;
            position: relative;
          }
          .count-btn:active { background: rgba(255,255,255,0.12); }
          .count-btn .count-icon { font-size: 14px; }
          .count-btn .count-bubble {
            position: absolute;
            top: 2px;
            right: 2px;
            min-width: 16px;
            height: 16px;
            padding: 0 4px;
            border-radius: 8px;
            background: #ff6b35;
            color: #fff;
            font-size: 10px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            border: 2px solid rgba(30,30,30,0.85);
            pointer-events: none;
          }

          .divider {
            width: 1px;
            height: 20px;
            margin: 0 4px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 999px;
            flex-shrink: 0;
          }

          /* 收起态的圆形按钮 */
          .fab-btn {
            width: 48px;
            height: 48px;
            border: 0;
            border-radius: 50%;
            background: transparent;
            color: rgba(255,255,255,0.9);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 20px;
            padding: 0;
            position: relative;
          }
          .fab-btn:active { background: rgba(255,255,255,0.1); }
          /* hover 反馈仅作用于可悬停设备（鼠标），避免移动端触摸后残留状态背景 */
          @media (hover: hover) and (pointer: fine) {
            .collapse-btn:hover,
            .tool-btn:hover,
            .count-btn:hover,
            .fab-btn:hover { background: rgba(255,255,255,0.06); }
          }
          .fab-btn .fab-dot {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ff383c;
            display: none;
          }
          .fab-btn[data-has-indicator="true"] .fab-dot { display: block; }
          .fab-btn .fab-icon { display: inline-flex; align-items: center; justify-content: center; }
          .fab-btn .fab-count {
            display: none;
            font-size: 15px;
            font-weight: 600;
            color: #fff;
            line-height: 1;
            white-space: nowrap;
          }
          .fab-btn[data-has-count="true"] .fab-icon { display: none; }
          .fab-btn[data-has-count="true"] .fab-count { display: inline-flex; }

          /* 子面板 */
          .subpanel {
            position: absolute;
            top: calc(100% + 8px);
            width: 180px;
            border-radius: 12px;
            background: rgba(30, 30, 30, 0.82);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(18px) saturate(145%);
            -webkit-backdrop-filter: blur(18px) saturate(145%);
            opacity: 0;
            transform: translateY(-6px) scale(0.97);
            transform-origin: top center;
            transition: opacity 220ms cubic-bezier(0.34, 1.4, 0.64, 1), transform 220ms cubic-bezier(0.34, 1.4, 0.64, 1);
            pointer-events: none;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .subpanel.is-open {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
          }
          .subpanel-header {
            padding: 10px 12px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            flex-shrink: 0;
          }
          .subpanel-title {
            font-size: 12px;
            color: rgba(255,255,255,0.5);
            font-weight: 600;
          }
          .subpanel-content {
            padding: 8px 12px;
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
            max-height: 50vh;
          }
          .subpanel-content::-webkit-scrollbar { width: 0; height: 0; display: none; }
          .subpanel-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 9px 0;
            border: 0;
            border-radius: 8px;
            background: transparent;
            font-size: 13px;
            color: #fff;
            cursor: pointer;
            text-align: left;
            font-family: inherit;
          }
          .subpanel-item:hover { background: rgba(255,255,255,0.06); }
          .subpanel-item.is-disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }
          .subpanel-item .item-label { display: flex; align-items: center; gap: 6px; }
          .subpanel-item .dev-tag {
            font-size: 10px;
            padding: 1px 5px;
            border-radius: 4px;
            background: rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.6);
          }
          .switch {
            width: 34px;
            height: 20px;
            border-radius: 999px;
            background: rgba(255,255,255,0.2);
            position: relative;
            transition: background 150ms ease;
            flex-shrink: 0;
          }
          .switch::after {
            content: "";
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #fff;
            transition: transform 150ms ease;
          }
          .switch.is-on { background: #0088ff; }
          .switch.is-on::after { transform: translateX(14px); }
          .subpanel-sep { height: 1px; margin: 6px 8px; background: rgba(255,255,255,0.08); }
          .subpanel-arrow { color: rgba(255,255,255,0.4); font-size: 14px; }
          /* 批注标记层 */
          .annotation-marker-layer { position: fixed; inset: 0; pointer-events: none; z-index: 9300; }
          .annotation-marker-layer[hidden] { display: none; }
          .annotation-marker {
            position: fixed; width: 24px; height: 24px;
            border-radius: 8px 8px 8px 2px; /* 左下角圆角小一些 */
            background: #ff6b35; color: #fff;
            border: 2px solid #fff; box-shadow: 0 4px 12px rgba(255,107,53,0.4);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; pointer-events: auto;
            transition: transform 150ms ease, box-shadow 150ms ease;
            z-index: 9301;
          }
          .annotation-marker:hover { transform: scale(1.1); box-shadow: 0 6px 16px rgba(255,107,53,0.5); }
          .annotation-marker svg { width: 14px; height: 14px; }
          /* 批注气泡 */
          .annotation-bubble {
            position: fixed; width: 280px; z-index: 9650;
            /* 统一毛玻璃：与工具条/配置列表/样式面板同一套材质 */
            background: rgba(30, 30, 30, 0.82);
            backdrop-filter: blur(18px) saturate(140%);
            -webkit-backdrop-filter: blur(18px) saturate(140%);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            padding: 10px 12px; box-sizing: border-box;
            animation: wt-bubble-in 200ms cubic-bezier(0.22, 0.9, 0.32, 1) both;
          }
          @keyframes wt-bubble-in {
            from { opacity: 0; transform: translateY(6px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          /* 移动端底部输入条：从键盘方向上浮，统一时长与缓动 */
          .annotation-bubble--sheet {
            border-radius: 14px;
            animation-name: wt-sheet-in;
          }
          @keyframes wt-sheet-in {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
          /* 移动端输入框字号 ≥16px，避免 iOS 聚焦时页面自动放大 */
          .annotation-bubble--sheet .annotation-bubble-input { font-size: 16px; min-height: 96px; }
          .annotation-bubble[hidden] { display: none; }
          .count-bubble[hidden] { display: none; }
          .annotation-bubble-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
          .annotation-bubble-title { color: rgba(255,255,255,0.75); font-size: 12px; font-weight: 600; line-height: 18px; }
          .annotation-bubble-close {
            background: none; border: none; color: rgba(255,255,255,0.5);
            cursor: pointer; padding: 2px; border-radius: 4px;
            display: flex; align-items: center; justify-content: center;
          }
          .annotation-bubble-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
          .annotation-bubble-close svg { width: 13px; height: 13px; }
          .annotation-bubble-input {
            width: 100%; min-height: 72px; max-height: 200px;
            background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px; color: #fff; font-size: 13px; line-height: 1.5;
            padding: 8px 10px; resize: vertical; outline: none;
            font-family: inherit; box-sizing: border-box;
          }
          .annotation-bubble-input:focus { border-color: #ff6b35; background: rgba(255,255,255,0.08); }
          .annotation-bubble-input::placeholder { color: rgba(255,255,255,0.3); }
          .annotation-bubble-delete {
            margin-top: 6px; background: none; border: none;
            color: #ff6b6b; font-size: 12px; cursor: pointer;
            padding: 4px 8px; border-radius: 4px;
          }
          .annotation-bubble-delete:hover { background: rgba(255,107,107,0.1); }
          .annotation-bubble-delete[hidden] { display: none; }
          /* 调试日志面板（暗色毛玻璃主题，与工具条/子面板/overview 统一） */
          .debug-panel {
            position: fixed; z-index: 9700;
            width: 320px; max-height: 60vh;
            background: rgba(30, 30, 30, 0.82);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(18px) saturate(145%);
            -webkit-backdrop-filter: blur(18px) saturate(145%);
            display: flex; flex-direction: column; overflow: hidden;
            transform-origin: top right;
          }
          .debug-panel:not([hidden]) {
            /* 统一面板打开动画：透明度 + 轻微上浮 + 缩放，200ms 同一缓动 */
            animation: wt-panel-in-top 200ms cubic-bezier(0.22, 0.9, 0.32, 1) both;
          }
          .debug-panel[hidden] { display: none; }
          @keyframes wt-panel-in-top {
            from { opacity: 0; transform: translateY(-6px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .debug-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .debug-panel-title { color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 600; }
          .debug-panel-close { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
          .debug-panel-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
          .debug-panel-close svg { width: 14px; height: 14px; }
          .debug-panel-content { flex: 1; overflow-y: auto; margin: 0; padding: 10px 12px; font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 11px; line-height: 1.5; color: rgba(255,255,255,0.8); white-space: pre-wrap; word-break: break-all; max-height: 40vh; scrollbar-width: none; -ms-overflow-style: none; }
          .debug-panel-content::-webkit-scrollbar { width: 0; height: 0; display: none; }
          .debug-panel-footer { display: flex; gap: 8px; padding: 10px 12px; border-top: 1px solid rgba(255,255,255,0.08); }
          .debug-panel-btn { flex: 1; padding: 6px 12px; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; background: rgba(255,255,255,0.06); color: #fff; font-size: 12px; cursor: pointer; }
          .debug-panel-btn:hover { background: rgba(255,255,255,0.12); }
          .debug-panel-btn:active { background: rgba(255,255,255,0.18); }
        </style>
        <div class="toolbar-container is-collapsed" data-toolbar>
          <div class="toolbar-clip">
            <!-- 收起态：圆形按钮 -->
            <button class="fab-btn" data-fab-btn data-has-indicator="false" data-has-count="false">
              <span class="fab-icon">${ICONS.pointer}</span>
              <span class="fab-count" data-fab-count hidden>0</span>
              <span class="fab-dot"></span>
            </button>
            <!-- 展开态：工具条内容 -->
            <div class="toolbar-main" data-toolbar-main style="display:none;">
              <button class="collapse-btn" data-collapse-btn title="收起">${ICONS.chevronLeft}</button>
              <button class="tool-btn" data-tool="walkthrough" data-active="false" title="走查模式">
                ${ICONS.pointer}
              </button>
              <button class="tool-btn" data-tool="annotation" data-active="false" title="批注模式">
                ${ICONS.annotation}
              </button>
              <button class="tool-btn" data-tool="datamock" data-active="false" title="数据模拟">
                ${ICONS.database}
                <span class="badge-dot"></span>
              </button>
              <div class="divider"></div>
              <button class="tool-btn" data-tool="overview" data-has-count="false" title="配置列表">
                <span class="tool-icon" data-overview-icon>${ICONS.list}</span>
                <span class="tool-count" data-overview-count hidden>0</span>
              </button>
              <div class="divider"></div>
              <button class="tool-btn" data-action="debug-log" title="调试日志">
                ${ICONS.bug}
              </button>
              <button class="tool-btn" data-tool="more" title="更多">
                ${ICONS.more}
              </button>
            </div>
          </div>
        </div>
        <!-- 数据模拟子面板 -->
        <div class="subpanel" data-subpanel="datamock">
          <div class="subpanel-header">
            <span class="subpanel-title">数据模拟</span>
          </div>
          <div class="subpanel-content">
            <button class="subpanel-item" data-fault="load">
              <span>加载失败</span>
              <span class="switch" data-fault-switch="load"></span>
            </button>
            <button class="subpanel-item" data-fault="save">
              <span>新增保存失败</span>
              <span class="switch" data-fault-switch="save"></span>
            </button>
            <button class="subpanel-item" data-fault="delete">
              <span>删除失败</span>
              <span class="switch" data-fault-switch="delete"></span>
            </button>
            <div class="subpanel-sep"></div>
            <button class="subpanel-item" data-fault="slow">
              <span>慢加载(约9s)</span>
              <span class="switch" data-fault-switch="slow"></span>
            </button>
          </div>
        </div>
        <!-- 更多菜单 -->
        <div class="subpanel" data-subpanel="more">
          <div class="subpanel-header">
            <span class="subpanel-title">更多</span>
          </div>
          <div class="subpanel-content">
            <button class="subpanel-item" data-nav="scene-manager">
              <span>场景管理</span>
              <span class="subpanel-arrow">${ICONS.chevronRight}</span>
            </button>
            <button class="subpanel-item" data-nav="component-preview">
              <span>组件库</span>
              <span class="subpanel-arrow">${ICONS.chevronRight}</span>
            </button>
          </div>
        </div>
        <!-- 子组件（走查模式相关） -->
        <wego-wt-highlight hidden></wego-wt-highlight>
        <wego-wt-style-panel hidden></wego-wt-style-panel>
        <wego-wt-color-picker hidden></wego-wt-color-picker>
        <wego-wt-overview-panel hidden></wego-wt-overview-panel>
        <wego-wt-toast></wego-wt-toast>
        <!-- 批注标记层 -->
        <div class="annotation-marker-layer" data-annotation-marker-layer hidden></div>
        <!-- 批注气泡（单例） -->
        <div class="annotation-bubble" data-annotation-bubble hidden>
          <div class="annotation-bubble-header">
            <span class="annotation-bubble-title">批注</span>
            <button class="annotation-bubble-close" data-annotation-close title="关闭">${ICONS.close}</button>
          </div>
          <textarea class="annotation-bubble-input" data-annotation-input placeholder="输入批注内容，自动保存..."></textarea>
          <button class="annotation-bubble-delete" data-annotation-delete>删除批注</button>
        </div>
        <!-- 调试日志面板 -->
        <div class="debug-panel" data-debug-panel hidden>
          <div class="debug-panel-header">
            <span class="debug-panel-title">调试日志</span>
            <button class="debug-panel-close" data-debug-close title="关闭">${ICONS.close}</button>
          </div>
          <pre class="debug-panel-content" data-debug-content></pre>
          <div class="debug-panel-footer">
            <button class="debug-panel-btn" data-debug-clear>清空</button>
            <button class="debug-panel-btn" data-debug-copy>复制日志</button>
          </div>
        </div>
      `;
    }

    _initComponents() {
      this._components.highlight = this._shadow.querySelector('wego-wt-highlight');
      this._components.stylePanel = this._shadow.querySelector('wego-wt-style-panel');
      this._components.colorPicker = this._shadow.querySelector('wego-wt-color-picker');
      this._components.overviewPanel = this._shadow.querySelector('wego-wt-overview-panel');
      this._components.toast = this._shadow.querySelector('wego-wt-toast');
      this._components.toolbar = this._shadow.querySelector('[data-toolbar]');
      this._components.toolbarMain = this._shadow.querySelector('[data-toolbar-main]');
      this._components.fabBtn = this._shadow.querySelector('[data-fab-btn]');
      this._components.overviewCount = this._shadow.querySelector('[data-overview-count]');
      this._components.fabCount = this._shadow.querySelector('[data-fab-count]');
      this._components.annotationMarkerLayer = this._shadow.querySelector('[data-annotation-marker-layer]');
      this._components.annotationBubble = this._shadow.querySelector('[data-annotation-bubble]');
      this._components.annotationInput = this._shadow.querySelector('[data-annotation-input]');
      this._components.annotationClose = this._shadow.querySelector('[data-annotation-close]');
      this._components.annotationDelete = this._shadow.querySelector('[data-annotation-delete]');
      this._components.debugPanel = this._shadow.querySelector('[data-debug-panel]');
      this._components.debugContent = this._shadow.querySelector('[data-debug-content]');
      this._components.debugClose = this._shadow.querySelector('[data-debug-close]');
      this._components.debugCopy = this._shadow.querySelector('[data-debug-copy]');
      this._components.debugClear = this._shadow.querySelector('[data-debug-clear]');
    }

    _bindEvents() {
      const toolbar = this._components.toolbar;
      // 拖动
      toolbar.addEventListener('pointerdown', (e) => this._startDrag(e, toolbar));
      // 收起态按钮点击展开
      this._components.fabBtn.addEventListener('click', (e) => {
        if (this._suppressClick) { e.preventDefault(); e.stopPropagation(); this._suppressClick = false; return; }
        this.setCollapsed(false);
      });
      // 收起按钮
      this._shadow.querySelector('[data-collapse-btn]').addEventListener('click', (e) => {
        if (this._suppressClick) { e.preventDefault(); e.stopPropagation(); this._suppressClick = false; return; }
        this.setCollapsed(true);
        this._closeAllPanels();
      });
      // 工具条按钮
      this._shadow.querySelectorAll('[data-tool]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (this._suppressClick) { e.preventDefault(); e.stopPropagation(); this._suppressClick = false; return; }
          e.stopPropagation();
          this._onToolClick(btn.dataset.tool, btn);
        });
      });
      // 失败注入开关
      this._shadow.querySelectorAll('[data-fault]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const key = btn.dataset.fault;
          this._toggleFault(key);
        });
      });
      // 导航
      this._shadow.querySelectorAll('[data-nav]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const route = btn.dataset.nav;
          this._closeSubpanels();
          this.setCollapsed(true);
          if (typeof window.WegoApp?.navigate === 'function') {
            window.WegoApp.navigate(route);
          } else if (typeof navigate === 'function') {
            navigate(route);
          } else {
            window.location.hash = '#/' + route;
          }
        });
      });
      // 调试日志入口（toggle：已打开则关闭；打开时与其他功能面板互斥）
      const debugLogBtn = this._shadow.querySelector('[data-action="debug-log"]');
      if (debugLogBtn) {
        debugLogBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this._components.debugPanel && !this._components.debugPanel.hasAttribute('hidden')) {
            this._closeDebugPanel();
          } else {
            this._closeAllPanels();
            this._openDebugPanel();
          }
        });
      }
      // 调试日志面板事件
      if (this._components.debugClose) {
        this._components.debugClose.addEventListener('click', (e) => {
          e.stopPropagation();
          this._closeDebugPanel();
        });
      }
      if (this._components.debugCopy) {
        this._components.debugCopy.addEventListener('click', (e) => {
          e.stopPropagation();
          const text = debugLog.format();
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(() => this._fallbackCopy(text));
          } else {
            this._fallbackCopy(text);
          }
        });
      }
      if (this._components.debugClear) {
        this._components.debugClear.addEventListener('click', (e) => {
          e.stopPropagation();
          debugLog.clear();
          this._refreshDebugLog();
        });
      }
      // 点击外部关闭子面板、配置列表和调试日志面板
      document.addEventListener('pointerdown', this._onDocPointerDown, true);

      // 批注气泡事件
      this._components.annotationClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this._closeAnnotationBubble();
      });
      this._components.annotationDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        this._deleteCurrentAnnotation();
      });
      this._components.annotationInput.addEventListener('input', (e) => {
        if (this._currentAnnotation) {
          this._currentAnnotation.text = e.target.value;
          this._currentAnnotation.timestamp = Date.now();
          this._components.annotationDelete.hidden = !e.target.value.trim();
          this._saveChanges();
          // 角标计数实时跟随输入变化，不等气泡关闭
          this._updateChangeCount();
        }
      });
      this._components.annotationBubble.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });

      // 事件总线
      bus.on('style-change', (change) => this._recordChange(change));
      bus.on('open-color-picker', ({ trigger, hex, opacity, callback }) => {
        this._components.colorPicker.open(trigger, hex, opacity, callback);
      });
      bus.on('close-color-picker', () => {
        this._components.colorPicker.close();
      });
      bus.on('close-style-panel', () => this._clearSelection());
      bus.on('close-overview', () => this._components.overviewPanel.close());
      bus.on('jump-to-element', ({ selector }) => this._jumpToElement(selector));
      bus.on('delete-change', ({ id }) => this._deleteChange(id));
      bus.on('delete-change-group', ({ sharedKey }) => this._deleteChangeGroup(sharedKey));
      bus.on('delete-annotation', ({ id }) => this._deleteAnnotation(id));
      bus.on('reset-changes', () => this._resetChanges());
      bus.on('toast', ({ message }) => this._showToast(message));
      bus.on('element-selected', ({ element, selector, target }) => {
        this._components.stylePanel.openForElement(element, selector, target || '');
      });
      bus.on('element-deselected', () => this._components.stylePanel.close());

      // ESC 键：按层级优先级逐级关闭面板，全部关闭后退出走查模式
      document.addEventListener('keydown', this._onDocKeyDown);
    }

    // 全局监听器（类字段箭头函数，保证 disconnected 时能 removeEventListener）
    _onHashChange = () => this._handleRouteChange();
    _onPageHide = () => this._flushSave();
    _onDocPointerDown = (e) => {
      if (!e.target.closest) return;
      if (isWalkthroughElement(e.target)) return; // 工具自身 UI 内的 pointerdown 不关闭
      if (!e.target.closest('wego-walkthrough')) {
        this._closeSubpanels();
        if (this._components.overviewPanel && !this._components.overviewPanel.hasAttribute('hidden')) {
          this._components.overviewPanel.close();
        }
        this._closeDebugPanel();
      }
    };
    _onDocKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      // 1. 颜色选择器（最上层）
      const cp = this._components.colorPicker;
      if (cp && !cp.hasAttribute('hidden')) { cp.close(); return; }
      // 2. 批注气泡
      const ab = this._components.annotationBubble;
      if (ab && !ab.hasAttribute('hidden')) { this._closeAnnotationBubble(); return; }
      // 3. Token 选择面板（样式面板内部浮层）
      const sp = this._components.stylePanel;
      if (sp && sp._tokenPanel && sp._tokenPanel.open) { sp._closeTokenPanel(); return; }
      // 4. 样式编辑面板（有选中元素）
      if (state.selectedElement) { this._clearSelection(); return; }
      // 5. 调试日志面板
      if (this._components.debugPanel && !this._components.debugPanel.hasAttribute('hidden')) { this._closeDebugPanel(); return; }
      // 6. 配置列表面板
      const ov = this._components.overviewPanel;
      if (ov && !ov.hasAttribute('hidden')) { ov.close(); return; }
      // 7. 工具条子面板（数据模拟 / 更多）
      const anySubpanel = this._shadow.querySelector('[data-subpanel].is-open');
      if (anySubpanel) { this._closeSubpanels(); return; }
      // 8. 走查模式
      if (this._walkthroughMode) { this._setWalkthroughMode(false); return; }
      // 9. 批注模式
      if (this._annotationMode) { this._setAnnotationMode(false); return; }
    };

    // ── 拖动 ──────────────────────────────────────────────
    _startDrag(e, toolbar) {
      if (e.button !== undefined && e.button !== 0) return;
      // 记录拖动起始状态。不在此处 setPointerCapture：
      // setPointerCapture 会把后续 click 事件重定向到 toolbar，
      // 导致 FAB 按钮/工具按钮的真实点击（pointer 序列）不派发到按钮本身，点击失效。
      this._drag.active = true;
      this._drag.moved = false;
      this._drag.pointerId = e.pointerId;
      this._drag.startX = e.clientX;
      this._drag.startY = e.clientY;
      const rect = this.getBoundingClientRect();
      this._drag.origX = rect.left;
      this._drag.origY = rect.top;
      this.style.transition = 'none';
      toolbar.classList.add('is-dragging');

      const onMove = (ev) => {
        if (!this._drag.active || ev.pointerId !== this._drag.pointerId) return;
        ev.stopPropagation();
        const dx = ev.clientX - this._drag.startX;
        const dy = ev.clientY - this._drag.startY;
        if (!this._drag.moved && Math.hypot(dx, dy) > 4) {
          this._drag.moved = true;
          this._suppressClick = true;
          this._closeSubpanels();
          this._closeDebugPanel();
        }
        if (this._drag.moved) {
          ev.preventDefault();
          const x = Math.max(16, Math.min(this._drag.origX + dx, window.innerWidth - this.offsetWidth - 16));
          const y = Math.max(0, Math.min(this._drag.origY + dy, window.innerHeight - this.offsetHeight));
          this.style.left = x + 'px';
          this.style.top = y + 'px';
          this.style.right = 'auto';
          this.style.bottom = 'auto';
          this._updateSubpanelPosition();
        }
      };
      const onUp = (ev) => {
        if (!this._drag.active || ev.pointerId !== this._drag.pointerId) return;
        this._drag.active = false;
        toolbar.classList.remove('is-dragging');
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
        if (this._drag.moved) {
          ev.preventDefault();
          ev.stopPropagation();
          // 自动吸附边缘：根据中心位置判断吸附到左/右边缘，带平滑过渡
          const rect = this.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const snapX = centerX < window.innerWidth / 2
            ? 16
            : window.innerWidth - this.offsetWidth - 16;
          this.style.transition = 'left 250ms cubic-bezier(0.22, 0.9, 0.32, 1)';
          this.style.left = snapX + 'px';
          // 过渡结束后保存位置
          const saveAfterSnap = () => {
            this._savePosition();
            this.style.transition = '';
            this.removeEventListener('transitionend', saveAfterSnap);
          };
          this.addEventListener('transitionend', saveAfterSnap);
          // 兜底：250ms 后如果 transitionend 没触发（如属性未变化），也保存
          setTimeout(() => { if (this.style.transition) saveAfterSnap(); }, 300);
        } else {
          this.style.transition = '';
        }
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    }

    _cleanupDrag() {
      this._drag.active = false;
    }

    _savePosition() {
      const rect = this.getBoundingClientRect();
      try {
        localStorage.setItem('wego.wgf-position', JSON.stringify({ x: rect.left, y: rect.top }));
      } catch (e) {}
    }

    _restorePosition() {
      try {
        const raw = localStorage.getItem('wego.wgf-position');
        if (raw) {
          const p = JSON.parse(raw);
          if (typeof p.x === 'number' && typeof p.y === 'number') {
            const x = Math.max(16, Math.min(p.x, window.innerWidth - 48 - 16));
            const y = Math.max(0, Math.min(p.y, window.innerHeight - 48));
            this.style.left = x + 'px';
            this.style.top = y + 'px';
            this.style.right = 'auto';
            this.style.bottom = 'auto';
            return;
          }
        }
      } catch (e) {}
      // 默认位置：左下角（左右边距 16px，与发布入口一致）
      this.style.left = '16px';
      this.style.bottom = '96px';
      this.style.top = 'auto';
      this.style.right = 'auto';
    }

    _getExpandDirection() {
      const rect = this.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      return centerX < window.innerWidth / 2 ? 'right' : 'left';
    }

    // ── 展开收起 ──────────────────────────────────────────
    setCollapsed(collapsed) {
      const toolbar = this._components.toolbar;
      const main = this._components.toolbarMain;
      const fab = this._components.fabBtn;
      if (!toolbar || !main || !fab || this._collapsed === collapsed) return;

      // 移除已有 transitionend 监听器，避免上一次残留干扰本次
      if (this._collapsedTransitionEnd) {
        toolbar.removeEventListener('transitionend', this._collapsedTransitionEnd);
        this._collapsedTransitionEnd = null;
      }

      // 1. 记录起始态（切换内容前，确保拿到真实的起始宽度和位置）
      const startHostRect = this.getBoundingClientRect();
      const startWidth = toolbar.getBoundingClientRect().width;
      // 展开时基于当前位置判断方向并保存；收起时复用展开时保存的方向，
      // 避免展开态中心比收起态偏左导致方向误判（收起后位置偏移）
      let dir;
      if (!collapsed) {
        dir = this._getExpandDirection();
        this._anchorDir = dir;
      } else {
        dir = this._anchorDir || this._getExpandDirection();
      }

      // 2. 切换内容显示与 class
      this._collapsed = collapsed;
      toolbar.classList.toggle('is-collapsed', collapsed);
      toolbar.classList.toggle('is-expanded', !collapsed);
      if (collapsed) {
        fab.style.display = 'inline-flex';
        main.style.display = 'none';
      } else {
        fab.style.display = 'none';
        main.style.display = 'inline-flex';
        main.style.flexDirection = dir === 'left' ? 'row-reverse' : 'row';
        // 收起按钮箭头方向：右侧展开(row-reverse，按钮在最右)显示向右箭头，左侧展开显示向左箭头
        const collapseBtn = this._shadow.querySelector('[data-collapse-btn]');
        if (collapseBtn) collapseBtn.innerHTML = dir === 'left' ? ICONS.chevronRight : ICONS.chevronLeft;
      }

      // 3. 测量目标态宽度
      //    收起态宽度由 CSS .is-collapsed { width: 48px } 确定，直接用 48，
      //    避免切 auto 测量时因 padding 算得 56px，与最终 48px 不一致导致收起后位置偏移；
      //    展开态宽度由内容决定，需切 auto 测量
      toolbar.style.transition = 'none';
      let endWidth;
      if (collapsed) {
        endWidth = 48;
      } else {
        toolbar.style.width = 'auto';
        void toolbar.offsetHeight;
        endWidth = toolbar.getBoundingClientRect().width || 233;
      }

      // 4. 计算 left 起始/目标值
      //    右侧(dir=left)：以起始态右边缘为锚点，展开向左扩展、收起向右收缩
      //    左侧(dir=right)向右展开：边界检查，避免右侧超出视口
      let startLeft = null, endLeft = null;
      if (dir === 'left') {
        const rightEdge = startHostRect.left + startWidth;
        startLeft = rightEdge - startWidth;
        endLeft = Math.max(8, rightEdge - endWidth);
      } else if (!collapsed) {
        const maxLeft = window.innerWidth - endWidth - 8;
        if (startHostRect.left + endWidth > window.innerWidth - 8 && startHostRect.left > maxLeft) {
          startLeft = Math.max(8, maxLeft);
          endLeft = startLeft;
        }
      }

      // 5. 设置起始态（关闭过渡，强制重排确保起点被接受）
      toolbar.style.width = startWidth + 'px';
      if (startLeft != null) {
        this.style.transition = 'none';
        this.style.left = startLeft + 'px';
        this.style.right = 'auto';
      }
      void toolbar.offsetHeight;

      // 6. 开过渡（带回弹缓冲，参考 Liaison/Figma 浮动工具条动效）
      const easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
      toolbar.style.transition = `width 320ms ${easing}`;
      if (startLeft != null) {
        this.style.transition = `left 320ms ${easing}`;
      }

      // 7. 下一帧写目标态
      requestAnimationFrame(() => {
        toolbar.style.width = endWidth + 'px';
        if (endLeft != null) {
          this.style.left = endLeft + 'px';
        }
      });

      // 8. 子面板位置
      this._updateSubpanelPosition();

      // 9. 过渡结束清理
      const onEnd = (e) => {
        if (e.target !== toolbar || e.propertyName !== 'width') return;
        toolbar.style.width = collapsed ? '48px' : '';
        toolbar.style.transition = '';
        this.style.transition = '';
        toolbar.removeEventListener('transitionend', onEnd);
        if (this._collapsedTransitionEnd === onEnd) this._collapsedTransitionEnd = null;
      };
      this._collapsedTransitionEnd = onEnd;
      toolbar.addEventListener('transitionend', onEnd);

      // 展开自动激活走查模式；收起时两种模式都退出并清除选中，
      // 避免收起后批注模式仍拦截页面点击、标记层残留
      if (!collapsed) {
        this._setWalkthroughMode(true);
      } else {
        this._setWalkthroughMode(false);
        this._setAnnotationMode(false);
      }
      this._updateToolbarState();
    }



    // ── 工具条按钮 ────────────────────────────────────────
    _onToolClick(tool, btn) {
      switch (tool) {
        case 'walkthrough':
          this._closeAllPanels();
          this._setWalkthroughMode(!this._walkthroughMode);
          break;
        case 'annotation':
          this._closeAllPanels();
          this._setAnnotationMode(!this._annotationMode);
          break;
        case 'datamock':
          this._toggleSubpanel('datamock');
          break;
        case 'overview':
          if (this._components.overviewPanel && !this._components.overviewPanel.hasAttribute('hidden')) {
            this._components.overviewPanel.close();
          } else {
            this._openOverview();
          }
          break;
        case 'more':
          this._toggleSubpanel('more');
          break;
      }
    }

    _toggleSubpanel(name) {
      const panel = this._shadow.querySelector(`[data-subpanel="${name}"]`);
      if (!panel) return;
      const isOpen = panel.classList.contains('is-open');
      this._closeAllPanels();
      if (!isOpen) {
        panel.classList.add('is-open');
        this._updateSubpanelPosition();
        // 更新失败开关状态
        if (name === 'datamock') this._updateFaultSwitches();
      }
    }

    _closeSubpanels() {
      this._shadow.querySelectorAll('[data-subpanel]').forEach(p => p.classList.remove('is-open'));
    }

    _closeAllPanels() {
      this._closeSubpanels();
      if (this._components.overviewPanel && !this._components.overviewPanel.hasAttribute('hidden')) {
        this._components.overviewPanel.close();
      }
      this._closeAnnotationBubble();
      this._closeDebugPanel();
    }

    _updateSubpanelPosition() {
      const dir = this._getExpandDirection();
      const toolbarRect = this._components.toolbar.getBoundingClientRect();

      this._shadow.querySelectorAll('[data-subpanel]').forEach(panel => {
        // 左右定位
        if (dir === 'left') {
          panel.style.left = '0';
          panel.style.right = 'auto';
        } else {
          panel.style.left = 'auto';
          panel.style.right = '0';
        }

        // 上下定位：判断底部是否放得下
        // 先临时显示以测量真实高度
        const wasHidden = !panel.classList.contains('is-open');
        if (wasHidden) {
          panel.style.visibility = 'hidden';
          panel.style.display = 'block';
        }
        const panelHeight = panel.offsetHeight || 180;
        if (wasHidden) {
          panel.style.display = '';
          panel.style.visibility = '';
        }

        const gap = 8;
        const spaceBelow = window.innerHeight - toolbarRect.bottom - gap;
        const spaceAbove = toolbarRect.top - gap;

        if (spaceBelow >= panelHeight || spaceBelow >= spaceAbove) {
          // 下方显示
          panel.style.top = 'calc(100% + 8px)';
          panel.style.bottom = 'auto';
        } else {
          // 上方显示
          panel.style.top = 'auto';
          panel.style.bottom = 'calc(100% + 8px)';
        }
      });
    }

    // ── 走查模式 ──────────────────────────────────────────
    _setWalkthroughMode(enabled) {
      this._walkthroughMode = enabled;
      state.walkthroughMode = enabled;
      if (enabled) {
        this._setAnnotationMode(false);
        document.body.setAttribute('data-walkthrough-mode', 'true');
        this._bindTouchEvents();
      } else {
        document.body.removeAttribute('data-walkthrough-mode');
        this._unbindTouchEvents();
        this._clearSelection();
        // 退出走查模式时一并关闭颜色选择器和 Token 面板，避免浮层脱离选中元素残留
        if (this._components.colorPicker) this._components.colorPicker.close();
        if (this._components.stylePanel && this._components.stylePanel._closeTokenPanel) {
          this._components.stylePanel._closeTokenPanel();
        }
      }
      this._updateToolbarState();
    }

    // ── 批注模式 ──────────────────────────────────────────
    _setAnnotationMode(enabled) {
      this._annotationMode = enabled;
      state.annotationMode = enabled;
      debugLog.add('ANNOTATION', `批注模式切换: ${enabled ? '开启' : '关闭'}`);
      if (enabled) {
        this._setWalkthroughMode(false);
        document.body.setAttribute('data-annotation-mode', 'true');
        this._bindAnnotationEvents();
        this._components.annotationMarkerLayer.removeAttribute('hidden');
        this._syncAnnotationMarkers();
        // 场景内部 tab/折叠/弹层等显隐切换不会触发 scroll/resize，
        // 监听 class/style/hidden 变化，让标记在目标重新可见时自动补绘
        if (typeof MutationObserver !== 'undefined' && !this._annotationDomObserver) {
          this._annotationDomObserver = new MutationObserver((mutations) => {
            const layer = this._components.annotationMarkerLayer;
            const bubble = this._components.annotationBubble;
            const fromTool = mutations.every(m =>
              (layer && layer.contains(m.target)) || (bubble && bubble.contains(m.target)));
            if (!fromTool) this._onAnnotationScroll();
          });
          this._annotationDomObserver.observe(document, {
            subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden']
          });
        }
      } else {
        document.body.removeAttribute('data-annotation-mode');
        this._unbindAnnotationEvents();
        this._components.annotationMarkerLayer.setAttribute('hidden', '');
        this._closeAnnotationBubble();
        if (this._annotationDomObserver) {
          this._annotationDomObserver.disconnect();
          this._annotationDomObserver = null;
        }
        // 取消待处理的滚动 rAF，避免模式关闭后仍执行
        if (this._annotationScrollRaf) {
          cancelAnimationFrame(this._annotationScrollRaf);
          this._annotationScrollRaf = null;
        }
      }
      this._updateToolbarState();
    }

    _bindAnnotationEvents() {
      document.addEventListener('pointerdown', this._onAnnotationPointerDown, true);
      document.addEventListener('pointermove', this._onAnnotationPointerMove, true);
      document.addEventListener('pointerup', this._onAnnotationPointerUp, true);
      document.addEventListener('click', this._onAnnotationClickCapture, true);
      window.addEventListener('scroll', this._onAnnotationScroll, true);
      window.addEventListener('resize', this._onAnnotationScroll);
    }

    _unbindAnnotationEvents() {
      document.removeEventListener('pointerdown', this._onAnnotationPointerDown, true);
      document.removeEventListener('pointermove', this._onAnnotationPointerMove, true);
      document.removeEventListener('pointerup', this._onAnnotationPointerUp, true);
      document.removeEventListener('click', this._onAnnotationClickCapture, true);
      window.removeEventListener('scroll', this._onAnnotationScroll, true);
      window.removeEventListener('resize', this._onAnnotationScroll);
    }

    // 批注模式：pointerdown 记录起始位置，不立即触发；区分点击与滑动（与走查模式一致）
    _onAnnotationPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (isWalkthroughElement(e.target)) return;
      this._annotationPending = true;
      this._annotationStartX = e.clientX;
      this._annotationStartY = e.clientY;
      this._annotationTarget = e.target;
    };

    _onAnnotationPointerMove = (e) => {
      if (!this._annotationPending) return;
      const dx = e.clientX - this._annotationStartX;
      const dy = e.clientY - this._annotationStartY;
      // 移动超过 10px 判定为滑动，取消待触发的批注，让页面正常滚动
      if (Math.hypot(dx, dy) > 10) {
        this._annotationPending = false;
        this._annotationTarget = null;
      }
    };

    _onAnnotationPointerUp = (e) => {
      if (!this._annotationPending) return;
      this._annotationPending = false;
      const el = this._annotationTarget;
      this._annotationTarget = null;
      if (!el || isWalkthroughElement(el)) return;
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      this._clearHover();
      if (el === document.body || el === document.documentElement) {
        // 点页面空白处：关闭并保存当前气泡
        this._closeAnnotationBubble();
      } else {
        this._openAnnotationForElement(el);
      }
    };

    _onAnnotationClickCapture = (e) => {
      if (this._annotationMode && !isWalkthroughElement(e.target)) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    _onAnnotationScroll = () => {
      // rAF 节流：scroll 高频触发，避免每次都 innerHTML='' 重建标记导致闪烁
      if (this._annotationScrollRaf) return;
      this._annotationScrollRaf = requestAnimationFrame(() => {
        this._annotationScrollRaf = null;
        this._syncAnnotationMarkers();
        if (!this._components.annotationBubble.hasAttribute('hidden')) {
          this._updateAnnotationBubblePosition();
        }
      });
    };

    _syncAnnotationMarkers() {
      const layer = this._components.annotationMarkerLayer;
      if (!layer || layer.hasAttribute('hidden')) return;
      layer.innerHTML = '';
      state.annotations.forEach((ann) => {
        try {
          const el = queryTargetEl(ann.selector);
          if (!el || !el.isConnected) return;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          const marker = document.createElement('div');
          marker.className = 'annotation-marker';
          marker.dataset.annotationId = ann.id;
          marker.style.left = Math.max(4, rect.left - 8) + 'px';
          marker.style.top = Math.max(4, rect.top - 8) + 'px';
          marker.innerHTML = ICONS.annotation;
          marker.title = ann.text ? ann.text.slice(0, 30) : '批注';
          // 点标记重新打开对应批注；点击时实时取 rect，避免滚动后用了缓存坐标
          marker.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            let currentRect = rect;
            try {
              const target = queryTargetEl(ann.selector);
              if (target && target.isConnected) currentRect = target.getBoundingClientRect();
            } catch (err) {}
            this._openAnnotationBubble(ann, currentRect);
          });
          layer.appendChild(marker);
        } catch (err) {}
      });
    }

    /** 为页面元素创建（或复用）批注并打开气泡 */
    _openAnnotationForElement(el) {
      const selector = this._resolveCanonicalSelector(el, generateSelector(el));
      // 同一元素的气泡已打开时直接无操作，避免先关再开的闪烁与焦点抖动
      if (this._currentAnnotation && this._currentAnnotation.selector === selector &&
          !this._components.annotationBubble.hasAttribute('hidden')) return;
      let ann = state.annotations.find(a => a.selector === selector);
      if (!ann) {
        ann = {
          id: 'ann-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          selector: selector,
          elementTag: el.tagName.toLowerCase(),
          elementText: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50),
          text: '',
          timestamp: Date.now(),
        };
        state.annotations.push(ann);
        this._saveChanges();
      }
      this._openAnnotationBubble(ann, el.getBoundingClientRect());
      this._syncAnnotationMarkers();
    }

    _openAnnotationBubble(ann, rect) {
      // 先写回并关闭上一个气泡
      this._closeAnnotationBubble();
      this._currentAnnotation = ann;
      const bubble = this._components.annotationBubble;
      const input = this._components.annotationInput;
      // 先填值定位、再显示并聚焦，聚焦后不再移动输入框容器
      input.value = ann.text || '';
      this._components.annotationDelete.hidden = !(ann.text && ann.text.trim());
      this._annotationBubbleRect = rect;
      // 移动端：同一个面板切换为底部输入条形态（贴键盘上沿）；桌面端保持贴元素气泡
      bubble.classList.toggle('annotation-bubble--sheet', IS_MOBILE_UA);
      bubble.removeAttribute('hidden');
      this._updateAnnotationBubblePosition();
      if (IS_MOBILE_UA) this._bindSheetViewport();
      try {
        input.focus({ preventScroll: true });
        const len = input.value.length;
        input.setSelectionRange(len, len); // 光标落到内容末尾
      } catch (e) { /* 聚焦失败不阻塞批注流程 */ }
    }


    _updateAnnotationBubblePosition() {
      const bubble = this._components.annotationBubble;
      // 移动端底部输入条：锚定可视视口底部（键盘弹起时由 visualViewport 事件驱动跟随）
      if (IS_MOBILE_UA) { this._positionMobileSheet(); return; }
      let rect = this._annotationBubbleRect;
      // 滚动/resize 时根据当前批注的 selector 重新获取元素位置，避免使用打开时缓存的过时 rect
      if (this._currentAnnotation) {
        try {
          const el = queryTargetEl(this._currentAnnotation.selector);
          if (el && el.isConnected) {
            rect = el.getBoundingClientRect();
            this._annotationBubbleRect = rect;
          }
        } catch (e) {}
      }
      if (!rect) return;
      const bubbleWidth = 280;
      const bubbleHeight = bubble.offsetHeight || 160;
      const gap = 8;
      // 优先显示在元素右侧
      let left = rect.right + gap;
      let top = rect.top;
      // 右侧空间不够，显示在左侧
      if (left + bubbleWidth > window.innerWidth - 8) {
        left = rect.left - bubbleWidth - gap;
      }
      // 左侧也不够，显示在元素下方
      if (left < 8) {
        left = Math.max(8, rect.left);
        top = rect.bottom + gap;
      }
      // 垂直方向不超出屏幕
      if (top + bubbleHeight > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - bubbleHeight - 8);
      }
      if (top < 8) top = 8;
      bubble.style.left = left + 'px';
      bubble.style.top = top + 'px';
    }

    // 移动端底部输入条定位：横向铺满、底边贴可视视口（键盘上沿）上方 8px
    _positionMobileSheet() {
      const bubble = this._components.annotationBubble;
      const vv = window.visualViewport;
      const vw = vv ? vv.width : window.innerWidth;
      const vLeft = vv ? vv.offsetLeft : 0;
      const vTop = vv ? vv.offsetTop : 0;
      const vH = vv ? vv.height : window.innerHeight;
      const h = bubble.offsetHeight || 160;
      bubble.style.width = Math.max(0, vw - 16) + 'px';
      bubble.style.left = (vLeft + 8) + 'px';
      bubble.style.top = Math.max(8, vTop + vH - h - 8) + 'px';
    }

    // 监听可视视口：键盘弹起时输入条跟随上移，键盘收起时直接关闭面板（内容自动保存）
    _bindSheetViewport() {
      const vv = window.visualViewport;
      if (!vv) return;
      if (!this._vvFullHeight) this._vvFullHeight = vv.height;
      this._onSheetResize = () => {
        if (this._components.annotationBubble.hasAttribute('hidden')) return;
        // 记录见过的最大可视高度作为"无键盘"基准（规避地址栏伸缩干扰）
        this._vvFullHeight = Math.max(this._vvFullHeight, vv.height);
        if (this._vvFullHeight - vv.height > 120) {
          // 键盘弹起：贴键盘上沿，取消可能挂起的手动收起定时器
          clearTimeout(this._sheetCloseTimer);
          this._sheetCloseTimer = null;
          this._positionMobileSheet();
        } else {
          // 键盘收起：防抖 200ms 确认，避免地址栏伸缩或键盘动画瞬态抖动误关气泡
          clearTimeout(this._sheetCloseTimer);
          this._sheetCloseTimer = setTimeout(() => {
            this._sheetCloseTimer = null;
            this._closeAnnotationBubble();
          }, 200);
        }
      };
      this._onSheetScroll = () => {
        if (!this._components.annotationBubble.hasAttribute('hidden')) this._positionMobileSheet();
      };
      vv.addEventListener('resize', this._onSheetResize);
      vv.addEventListener('scroll', this._onSheetScroll);
    }

    _unbindSheetViewport() {
      const vv = window.visualViewport;
      if (vv && this._onSheetResize) vv.removeEventListener('resize', this._onSheetResize);
      if (vv && this._onSheetScroll) vv.removeEventListener('scroll', this._onSheetScroll);
      clearTimeout(this._sheetCloseTimer);
      this._sheetCloseTimer = null;
      this._onSheetResize = null;
      this._onSheetScroll = null;
    }

    _closeAnnotationBubble() {
      if (this._currentAnnotation) {
        // 自动保存输入内容
        const input = this._components.annotationInput;
        if (input && this._currentAnnotation.text !== input.value) {
          this._currentAnnotation.text = input.value;
          this._currentAnnotation.timestamp = Date.now();
        }
        const ann = this._currentAnnotation;
        this._currentAnnotation = null;
        // 空批注清理：未输入内容的批注不保留标记和持久化数据，避免残留空标记
        const isEmpty = !ann.text || !ann.text.trim();
        if (isEmpty) {
          state.annotations = state.annotations.filter(a => a.id !== ann.id);
        }
        this._flushSave();
        this._syncAnnotationMarkers();
        this._updateChangeCount();
      }
      this._unbindSheetViewport();
      this._components.annotationBubble.setAttribute('hidden', '');
    }

    _deleteCurrentAnnotation() {
      if (!this._currentAnnotation) return;
      this._deleteAnnotation(this._currentAnnotation.id, { closeBubble: true });
    }

    /** 删除单条批注（气泡删除按钮 / 配置列表删除共用），同步标记、角标、列表与存储 */
    _deleteAnnotation(id, options) {
      const ann = state.annotations.find(a => a.id === id);
      if (!ann) return;
      state.annotations = state.annotations.filter(a => a.id !== id);
      const bubbleIsCurrent = this._currentAnnotation && this._currentAnnotation.id === id;
      if (bubbleIsCurrent || (options && options.closeBubble)) {
        this._currentAnnotation = null;
        this._components.annotationBubble.setAttribute('hidden', '');
        this._components.annotationInput.value = '';
      }
      this._flushSave();
      this._syncAnnotationMarkers();
      this._updateChangeCount();
      if (this._components.overviewPanel && !this._components.overviewPanel.hasAttribute('hidden')) {
        this._components.overviewPanel.refresh(state.changes, state.currentRoute, state.annotations);
      }
    }

    // ── 调试日志面板 ──────────────────────────────────────
    _openDebugPanel() {
      const panel = this._components.debugPanel;
      if (!panel) return;
      this._refreshDebugLog();
      // 绑定到虫子按钮锚点：右对齐、优先下方展开，空间不够翻上方；高度按视口可用空间动态计算
      const anchor = this._shadow.querySelector('[data-action="debug-log"]');
      const panelWidth = 320;
      const gap = 8;
      const margin = 8;
      if (!anchor) {
        // 兜底：居中显示
        panel.style.left = Math.max(8, (window.innerWidth - panelWidth) / 2) + 'px';
        panel.style.top = '60px';
        panel.style.bottom = 'auto';
        panel.style.maxHeight = '60vh';
        panel.removeAttribute('hidden');
        debugLog.add('DEBUG', '调试日志面板已打开');
        return;
      }
      const rect = anchor.getBoundingClientRect();
      // 水平：右对齐，越界时 clamp 到视口内
      let left = rect.right - panelWidth;
      if (left < 8) left = 8;
      if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;
      panel.style.left = left + 'px';
      // 垂直：比较上下可用空间，动态计算高度自适应视口
      // - 显示在工具条下方：以顶部锚定，从顶部往下自适应高度
      // - 显示在工具条上方：以底部锚定，从底部往上自适应高度
      const viewportH = window.innerHeight;
      const spaceBelow = viewportH - rect.bottom - gap - margin;
      const spaceAbove = rect.top - gap - margin;
      if (spaceBelow >= spaceAbove) {
        panel.style.top = (rect.bottom + gap) + 'px';
        panel.style.bottom = 'auto';
        panel.style.maxHeight = Math.max(0, spaceBelow) + 'px';
      } else {
        panel.style.top = 'auto';
        panel.style.bottom = (viewportH - rect.top + gap) + 'px';
        panel.style.maxHeight = Math.max(0, spaceAbove) + 'px';
      }
      panel.removeAttribute('hidden');
      debugLog.add('DEBUG', '调试日志面板已打开');
    }

    _closeDebugPanel() {
      if (this._components.debugPanel) {
        this._components.debugPanel.setAttribute('hidden', '');
      }
    }

    _refreshDebugLog() {
      if (this._components.debugContent) {
        this._components.debugContent.textContent = debugLog.format() || '（暂无日志）';
        // 滚动到底部
        this._components.debugContent.scrollTop = this._components.debugContent.scrollHeight;
      }
    }

    /** 复制失败兜底：创建临时 textarea + execCommand('copy') */
    _fallbackCopy(text) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) { /* 静默失败 */ }
    }

    _bindTouchEvents() {
      this._ptStartX = 0;
      this._ptStartY = 0;
      this._ptStartTime = 0;
      this._isSwiping = false;
      this._pointerActive = false;
      this._hoveredElement = null;
      document.addEventListener('pointerdown', this._onPointerDown, true);
      document.addEventListener('pointermove', this._onPointerMove, true);
      document.addEventListener('pointerup', this._onPointerUp, true);
      document.addEventListener('click', this._onClickCapture, true);
    }

    _unbindTouchEvents() {
      document.removeEventListener('pointerdown', this._onPointerDown, true);
      document.removeEventListener('pointermove', this._onPointerMove, true);
      document.removeEventListener('pointerup', this._onPointerUp, true);
      document.removeEventListener('click', this._onClickCapture, true);
      this._pointerActive = false;
    }

    // 走查模式：在捕获阶段最早吞掉页面元素的指针事件，避免误触发其自身监听；
    // 但不在 pointerdown 调 preventDefault，保留原生滚动（滑动手势放行）。
    _onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return; // 仅主键
      if (isWalkthroughElement(e.target)) return;          // 工具自身 UI 放行
      e.stopPropagation();                                 // 阻断页面元素监听器
      this._clearHover();
      this._pointerActive = true;
      this._ptStartX = e.clientX;
      this._ptStartY = e.clientY;
      this._ptStartTime = Date.now();
      this._isSwiping = false;
    };
    _onPointerMove = (e) => {
      if (this._pointerActive) {
        const dx = Math.abs(e.clientX - this._ptStartX);
        const dy = Math.abs(e.clientY - this._ptStartY);
        if (dx > 10 || dy > 10) this._isSwiping = true;
        return;
      }
      // 非点击/滑动过程中：hover 预览元素布局（仅在无选中元素时生效）
      if (state.selectedElement) return;
      this._updateHover(e.clientX, e.clientY);
    };
    _onPointerUp = (e) => {
      if (!this._pointerActive) return;
      this._pointerActive = false;
      if (this._isSwiping) return;                          // 滑动：放行页面滚动
      if (Date.now() - this._ptStartTime >= 500) return;    // 长按：MVP 不处理
      this._handlePointSelection(e.clientX, e.clientY, e);
    };
    // 拦截走查模式下落到页面元素的合成 click，避免误触发（如导航跳转）
    _onClickCapture = (e) => {
      if (this._walkthroughMode && !isWalkthroughElement(e.target)) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    _updateHover(clientX, clientY) {
      const el = document.elementFromPoint(clientX, clientY);
      if (!el || el === document.body || el === document.documentElement || isWalkthroughElement(el)) {
        this._clearHover();
        return;
      }
      if (this._hoveredElement === el) return;
      this._hoveredElement = el;
      this._components.highlight.setMode('hover');
      this._components.highlight.removeAttribute('hidden');
      this._components.highlight.showForElement(el);
    }

    _clearHover() {
      if (this._hoveredElement) {
        this._hoveredElement = null;
        if (!state.selectedElement && this._components.highlight) {
          this._components.highlight.hide();
          this._components.highlight.setAttribute('hidden', '');
        }
      }
    }

    _handlePointSelection(clientX, clientY, event) {
      const el = document.elementFromPoint(clientX, clientY);
      if (!el) return;
      if (el === document.body || el === document.documentElement) {
        this._clearSelection();
        return;
      }
      if (event && event.cancelable) event.preventDefault();
      this._selectElement(el);
    }

    /**
     * 选择器归一化：同一元素可能因 sticky 克隆等渲染差异在不同时刻生成不同选择器
     * （短类名选择器 vs 完整 nth-of-type 链）。若已有变更/批注记录的选择器当前恰好
     * 指向该元素，复用记录中的选择器，保证同一元素的后续编辑并入同一条记录。
     */
    _resolveCanonicalSelector(el, generated) {
      const seen = new Set();
      const candidates = [];
      state.changes.forEach(c => { if (c.selector && !seen.has(c.selector)) { seen.add(c.selector); candidates.push(c.selector); } });
      state.annotations.forEach(a => { if (a.selector && !seen.has(a.selector)) { seen.add(a.selector); candidates.push(a.selector); } });
      for (const sel of candidates) {
        if (queryTargetEl(sel) === el) return sel;
      }
      return generated;
    }

    _selectElement(el) {
      this._clearSelection();
      state.selectedElement = el;
      this._components.highlight.setMode('selected');
      this._components.highlight.removeAttribute('hidden');
      this._components.highlight.showForElement(el);
      const selector = this._resolveCanonicalSelector(el, generateSelector(el));
      state.selectedSelector = selector;
      state.selectedTarget = '';
      // 快照元素原始样式（走查态进入前的计算值），用于「改回原值即视为无变更」
      // 关键：用 route::selector 作 key，且仅在首次选中时建立一次，后续重新选中不覆盖，
      // 否则关闭面板再打开时元素已带 inline 修改，getComputedStyle 读到的是污染值。
      const snapKey = state.currentRoute + '::' + selector;
      if (!state.originalStyles[snapKey]) {
        const cs = getComputedStyle(el);
        state.originalStyles[snapKey] = snapshotStyle(cs);
      }
      // 为已渲染的伪元素建立原始样式快照（key 含 ::before/::after），
      // 使伪元素样式改回原值时也能自动删除变更记录。
      ['before', 'after'].forEach(pseudo => {
        if (isPseudoRendered(el, pseudo)) {
          const pKey = state.currentRoute + '::' + selector + '::' + pseudo;
          if (!state.originalStyles[pKey]) {
            const cs = getComputedStyle(el, '::' + pseudo);
            state.originalStyles[pKey] = snapshotStyle(cs);
          }
        }
      });
      bus.emit('element-selected', { element: el, selector, target: '' });
    }

    _clearSelection() {
      if (state.selectedElement) {
        state.selectedElement = null;
      }
      this._hoveredElement = null;
      if (this._components.highlight) {
        this._components.highlight.hide();
        this._components.highlight.setAttribute('hidden', '');
      }
      state.selectedSelector = '';
      state.selectedTarget = '';
      bus.emit('element-deselected');
    }

    /** 样式面板切换伪元素目标时，更新高亮层标注（伪元素无法量几何，仅框宿主+标注） */
    _onTargetChanged(target) {
      state.selectedTarget = target || '';
      if (this._components.highlight && state.selectedElement) {
        const label = target ? '::' + target : '';
        this._components.highlight.showForElement(state.selectedElement, label);
      }
    }

    _jumpToElement(selector) {
      let el;
      el = queryTargetEl(selector);
      this._components.overviewPanel.close();
      if (!el) {
        return;
      }
      const hasStyleChange = state.changes.some(c => c.selector === selector);
      if (hasStyleChange) {
        // 含样式修改：进入走查模式并选中元素，打开样式面板
        if (!this._walkthroughMode) this._setWalkthroughMode(true);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          if (this._walkthroughMode && el.isConnected) this._selectElement(el);
        }, 300);
      } else {
        // 纯批注：留在批注模式，滚动定位后直接打开该元素的批注气泡
        if (!this._annotationMode) this._setAnnotationMode(true);
        const ann = state.annotations.find(a => a.selector === selector);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          if (!ann || !el.isConnected) return;
          this._openAnnotationBubble(ann, el.getBoundingClientRect());
        }, 300);
      }
    }

    // ── 配置列表 ──────────────────────────────────────────
    _openOverview() {
      // 与其他功能面板互斥：打开配置列表前关闭子面板/调试日志/批注气泡
      this._closeAllPanels();
      const countBtn = this._shadow.querySelector('[data-tool="overview"]');
      this._components.overviewPanel.open(state.changes, state.currentRoute, countBtn, state.annotations);
      this._clearSelection();
    }

    // ── 失败注入 ──────────────────────────────────────────
    _restoreFaultState() {
      try {
        const raw = localStorage.getItem('wego.fault-switch.enabled');
        if (raw) {
          const p = JSON.parse(raw);
          this._faultState.load = !!p.load;
          this._faultState.save = !!p.save;
          this._faultState['delete'] = !!p['delete'];
          this._faultState.slow = !!p.slow;
        }
      } catch (e) {}
      this._updateFaultSwitches();
      this._updateToolbarState();
    }

    _persistFaultState() {
      try {
        localStorage.setItem('wego.fault-switch.enabled', JSON.stringify(this._faultState));
      } catch (e) {}
    }

    _toggleFault(key) {
      this._faultState[key] = !this._faultState[key];
      this._persistFaultState();
      this._updateFaultSwitches();
      this._updateToolbarState();
    }

    _updateFaultSwitches() {
      ['load', 'save', 'delete', 'slow'].forEach(key => {
        const sw = this._shadow.querySelector(`[data-fault-switch="${key}"]`);
        if (sw) sw.classList.toggle('is-on', !!this._faultState[key]);
      });
    }

    // ── 变更记录 ──────────────────────────────────────────
    /** CSS 值等价判断：归一化空格/逗号/大小写；'' / 0 / 0px / normal 视为等价（清除覆盖 = 原始零值） */
    _cssValueEqual(a, b) {
      const norm = (v) => String(v == null ? '' : v).trim().replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').toLowerCase();
      const na = norm(a), nb = norm(b);
      if (na === nb) return true;
      const zeroish = (s) => s === '' || s === '0' || s === '0px' || s === 'normal';
      return zeroish(na) && zeroish(nb);
    }

    /** 变更写入后的统一同步：防抖落盘、刷新角标、配置列表打开时同步刷新 */
    _syncAfterRecordsChanged() {
      this._saveChanges();
      this._updateChangeCount();
      if (this._components.overviewPanel && !this._components.overviewPanel.hasAttribute('hidden')) {
        this._components.overviewPanel.refresh(state.changes, state.currentRoute, state.annotations);
      }
    }

    _recordChange(change) {
      const isPseudo = !!change.target;
      // 伪元素使用独立的 snapKey（含 ::before/::after），与 _selectElement 中建立的伪元素快照对应
      const snapKey = isPseudo
        ? state.currentRoute + '::' + change.selector + '::' + change.target
        : state.currentRoute + '::' + change.selector;
      const original = state.originalStyles[snapKey];
      const matchExisting = (c) => c.selector === change.selector && c.property === change.property && (c.target || '') === (change.target || '');
      // —— 统一净变更守卫（所有属性、所有路径、首次+后续都判）——
      // 修改后与元素初始快照值等价 = 净变更为零 → 还原已有记录且不新增（避免 X→X / 往返残留等脏记录）。
      // 例外：
      //  - order（顺序移动）：值回初始不等于顺序未变（真交换时位置变了），需显示位置也回到初始位置；
      //  - flex-direction（layoutMode）：对非 flex 容器设 row 会带 display:flex 副作用，
      //    仅当元素当前已是 flex/grid 时才真正无效果。
      const isOrderMove = change.property === 'order';
      const isLayoutDir = change.property === 'flex-direction';
      let netZero = false;
      if (!isPseudo && original && (change.property in original)) {
        const valBack = this._cssValueEqual(change.newValue, original[change.property]);
        if (valBack) {
          if (isOrderMove) {
            const existing0 = state.changes.find(matchExisting);
            const initPos = existing0 ? (existing0.initPos || 0) : (Number(change.initPos) || 0);
            const curPos = change.el ? flexPositionOf(change.el) : 0;
            netZero = initPos > 0 && curPos === initPos;
          } else if (isLayoutDir && change.el) {
            let d = '';
            try { d = getComputedStyle(change.el).display; } catch (e) {}
            netZero = d === 'flex' || d === 'grid';
          } else {
            netZero = true;
          }
        }
      }
      const backToOriginal = netZero;
      // 清空输入 = 撤销该属性：还原样式并移除已有记录，且不允许新增空值脏记录
      const isCleared = change.newValue === '' || change.newValue == null;
      if (backToOriginal || isCleared) {
        const existing = state.changes.find(matchExisting);
        if (existing) {
          this._revertChange(existing);
          state.changes = state.changes.filter(c => c.id !== existing.id);
          changeElRefs.delete(existing.id);
          this._syncAfterRecordsChanged();
        }
        return;
      }
      const existing = state.changes.find(matchExisting);
      if (existing) {
        existing.newValue = change.newValue;
        existing.timestamp = Date.now();
        existing.elementText = change.elementText;
        existing.elementClasses = change.elementClasses || existing.elementClasses || [];
        existing.shared = !!change.shared;
        existing.sharedKey = change.sharedKey || '';
        existing.orderValue = change.orderValue || existing.orderValue || '';
        existing.displayOld = change.displayOld || existing.displayOld || '';
        existing.displayNew = change.displayNew || existing.displayNew || '';
        Object.assign(existing, deriveIntent(existing, change.el));
        if (change.el) changeElRefs.set(existing.id, change.el);
      } else {
        const srcInfo = (change.el && !change.target)
          ? readSourceDeclaration(change.el, change.property)
          : { declared: false, sourceValue: '' };
        const rec = {
          id: 'change-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          selector: change.selector,
          target: change.target || '',
          elementTag: change.elementTag,
          elementText: change.elementText,
          elementClasses: change.elementClasses || [],
          property: change.property,
          oldValue: change.oldValue,
          newValue: change.newValue,
          orderValue: change.orderValue || '',
          displayOld: change.displayOld || '',
          displayNew: change.displayNew || '',
          initPos: Number(change.initPos) || 0,
          shared: !!change.shared,
          sharedKey: change.sharedKey || '',
          sourceDeclared: srcInfo.declared,
          sourceValue: srcInfo.sourceValue,
          timestamp: Date.now(),
        };
        Object.assign(rec, deriveIntent(rec, change.el));
        state.changes.push(rec);
        if (change.el) changeElRefs.set(rec.id, change.el);
      }
      this._syncAfterRecordsChanged();
    }

    /** 还原单条变更（本体=清 inline；伪元素=清注入规则） */
    _revertChange(change) {
      if (change.target) {
        applyPseudoStyle(change.selector, change.target, change.property, '');
        return;
      }
      try {
        // 优先还原会话内实际改动的那个元素（避免 sticky 克隆等重复结构下 selector 歧义命中错误元素）；
        // 元素已不在文档中（如刷新后）则退回按 selector 解析
        let el = changeElRefs.get(change.id);
        if (!el || !el.isConnected) el = queryTargetEl(change.selector);
        // 用 setProperty 兼容 kebab-case 属性名（如 flex-direction）
        if (el) el.style.setProperty(change.property, '');
      } catch (e) {}
      changeElRefs.delete(change.id);
    }

    _deleteChange(id) {
      const change = state.changes.find(c => c.id === id);
      if (change) {
        this._revertChange(change);
        state.changes = state.changes.filter(c => c.id !== id);
        this._flushSave();
        this._updateChangeCount();
        if (this._components.overviewPanel && !this._components.overviewPanel.hasAttribute('hidden')) {
          this._components.overviewPanel.refresh(state.changes, state.currentRoute, state.annotations);
        }
      }
    }

    /** 删除整组共享同步变更：还原全部命中元素并移除记录（配置列表合并展示的「共享 N 个元素」一条） */
    _deleteChangeGroup(sharedKey) {
      if (!sharedKey) return;
      const group = state.changes.filter(c => c.sharedKey === sharedKey);
      if (!group.length) return;
      group.forEach(c => this._revertChange(c));
      state.changes = state.changes.filter(c => c.sharedKey !== sharedKey);
      this._flushSave();
      this._updateChangeCount();
      if (this._components.overviewPanel && !this._components.overviewPanel.hasAttribute('hidden')) {
        this._components.overviewPanel.refresh(state.changes, state.currentRoute, state.annotations);
      }
    }

    /** 清空当前场景的所有修改（还原 DOM + 清 state + 落盘） */
    _resetCurrentSceneChanges() {
      if (state.changes.length === 0 && state.annotations.length === 0) {
        return;
      }
      // 先关气泡（把输入框内容写回逻辑走完），再统一还原与清空
      this._closeAnnotationBubble();
      state.changes.forEach(c => this._revertChange(c));
      state.changes = [];
      state.annotations = [];
      // 伪元素注入池整体清空并重建，避免其它场景的注入规则残留
      state.pseudoStyles = {};
      rebuildPseudoStyleElement();
      this._syncAnnotationMarkers();
      this._flushSave();
      this._updateChangeCount();
      debugLog.add('RESET', `当前场景还原完成: changes=${state.changes.length} annotations=${state.annotations.length}`);
      if (this._components.overviewPanel && !this._components.overviewPanel.hasAttribute('hidden')) {
        this._components.overviewPanel.refresh(state.changes, state.currentRoute, state.annotations);
      }
    }

    /** 跨场景一键重置：清空所有场景的修改（含 localStorage 中其它场景的记录，不二次确认） */
    _resetChanges() {
      debugLog.add('RESET', '跨场景重置开始');
      // 先清理其它场景的 localStorage 记录（其 DOM 不在当前视口，切到该场景时 _loadChanges 读到空即干净）
      const currentKey = `wego.walkthrough.data.${state.currentRoute}`;
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('wego.walkthrough.data.') && key !== currentKey) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (e) { /* localStorage 不可用时忽略 */ }
      // 再清当前场景
      this._resetCurrentSceneChanges();
      debugLog.add('RESET', '跨场景重置完成');
    }

    /** 路由切换统一收尾：旧场景落盘与浮层清理 → 新场景数据加载 → 标记重绘 */
    _handleRouteChange() {
      const nextRoute = getCurrentRoute();
      // 同路由的 hash 抖动（锚点、历史记录写回等）不做收尾与重载，避免误关正在输入的批注气泡、误清回放
      if (nextRoute === state.currentRoute) return;
      // 1. 旧场景收尾：关闭批注气泡（写回输入）、选中态、工具条子面板、样式面板、颜色选择器，
      //    避免持有已销毁的旧场景节点
      this._closeAnnotationBubble();
      this._closeAllPanels();
      this._clearSelection();
      if (this._components.stylePanel) {
        if (this._components.stylePanel._closeTokenPanel) this._components.stylePanel._closeTokenPanel();
        this._components.stylePanel.close();
      }
      if (this._components.colorPicker) this._components.colorPicker.close();
      // 2. 立即落盘旧场景，防止防抖窗口内的延迟保存把旧场景数据错存到新场景 key
      this._flushSave();
      if (this._replayTimer) { clearTimeout(this._replayTimer); this._replayTimer = null; }
      // 3. 切换路由并加载新场景数据（内部会重建伪元素注入、快照并回放内联样式）
      state.currentRoute = nextRoute;
      this._loadChanges();
      // 4. 批注标记按新场景重绘
      if (this._annotationMode) this._syncAnnotationMarkers();
      this._updateToolbarState();
    }

    _loadChanges() {
      try {
        const key = `wego.walkthrough.data.${state.currentRoute}`;
        const raw = localStorage.getItem(key);
        const data = raw ? JSON.parse(raw) : {};
        // 兼容旧版本残留：丢弃新值为空的脏变更记录、没有正文的空批注
        state.changes = (data.changes || []).filter(c => c.newValue !== '' && c.newValue != null);
        state.annotations = (data.annotations || []).filter(a => a.text && String(a.text).trim());
        // 新场景加载的记录来自持久化，无会话内元素引用，清空引用映射避免残留指向旧场景节点
        changeElRefs.clear();
        debugLog.add('LOAD', `_loadChanges: route=${state.currentRoute} changes=${state.changes.length} annotations=${state.annotations.length}`);
        // 伪元素注入池与原始值快照都按路由隔离：先清空上一场景残留再整体重建，
        // 否则 A 场景的注入规则会带到 B 场景，污染通用类名元素
        state.pseudoStyles = {};
        state.originalStyles = {};
        // 批量收集伪元素变更到 state.pseudoStyles，循环结束后统一重建一次，
        // 避免 applyPseudoStyle 内部每次都 rebuildPseudoStyleElement 导致 N+1 次 DOM 操作。
        state.changes.forEach(c => {
          if (c.target && c.property && c.newValue) {
            const k = pseudoKey(c.selector, c.target);
            if (!state.pseudoStyles[k]) state.pseudoStyles[k] = {};
            state.pseudoStyles[k][c.property] = c.newValue;
          }
        });
        rebuildPseudoStyleElement();
        // 用记录中的 oldValue 重建原始值快照，保证回放后"改回原值自动消记录"仍可用
        this._rebuildOriginalSnapshots();
        // 普通元素内联样式回放到页面，保证页面效果/样式面板/配置列表/角标四处一致
        this._replayInlineChanges();
        this._updateChangeCount();
      } catch (e) {
        debugLog.add('LOAD', `_loadChanges 异常: ${e.message}`);
      }
    }

    /** 迁移修复前遗留的 default 场景残留数据到正确场景
     *  根因：修复前主 tab 切换会清空 hash，getCurrentRoute() 一直返回 default，
     *  所有主 tab 的变更/批注都混在 default 下无法自动拆分，导致施工单错误显示「首页」且混场景。
     *  此方法包装模块级 migrateLegacyDefaultData()：逐条按 selector 在 DOM 中定位元素 →
     *  host-tab 面板映射 routeId → 归并到正确场景 key；场景异步渲染时未命中的元素延时重试补迁。
     *  @param {number} round 重试轮次（最多 10 次约 3s） */
    _migrateLegacyDefaultData(round) {
      round = round || 0;
      const { migratedCount, allMigrated } = migrateLegacyDefaultData();
      // 未全部迁移且有进展 → 延时重试（补迁异步渲染后命中的元素）
      if (!allMigrated && migratedCount > 0 && round < 10) {
        if (this._migrateTimer) clearTimeout(this._migrateTimer);
        this._migrateTimer = setTimeout(() => this._migrateLegacyDefaultData(round + 1), 300);
      }
      // 迁移可能把数据并入当前场景 key：若当前场景有数据则刷新加载，保证配置列表/施工单即时正确
      if (migratedCount > 0 && state.currentRoute && state.currentRoute !== 'default') {
        const curKey = `wego.walkthrough.data.${state.currentRoute}`;
        if (localStorage.getItem(curKey)) {
          this._loadChanges();
          this._updateChangeCount();
        }
      }
    }

    /** 依据变更记录的 oldValue 重建原始样式快照（仅记录首个 oldValue，即首次修改前的原值） */
    _rebuildOriginalSnapshots() {
      state.changes.forEach(c => {
        if (!c.property || c.oldValue === undefined || c.oldValue === null) return;
        const snapKey = c.target
          ? state.currentRoute + '::' + c.selector + '::' + c.target
          : state.currentRoute + '::' + c.selector;
        if (!state.originalStyles[snapKey]) state.originalStyles[snapKey] = {};
        if (!(c.property in state.originalStyles[snapKey])) {
          state.originalStyles[snapKey][c.property] = c.oldValue;
        }
      });
    }

    /** 把普通元素变更回放到页面 DOM；场景为异步渲染（骨架屏→真实内容），未命中时短重试 */
    _replayInlineChanges(round) {
      round = round || 0;
      const pending = state.changes.filter(c =>
        !c.target && c.property && c.newValue !== '' && c.newValue != null && !c.skipCss
      );
      let matched = 0;
      pending.forEach(c => {
        let el = null;
        try { el = queryTargetEl(c.selector); } catch (e) { el = null; }
        if (!el || !el.isConnected) return;
        matched++;
        try { el.style.setProperty(c.property, c.newValue); } catch (e) {}
      });
      // 批注标记随回放重试一起重绘：场景脚本异步挂载/内部面板激活时，首次同步可能还找不到可见锚点
      let annMatched = 0;
      if (this._annotationMode) {
        state.annotations.forEach(a => {
          const aEl = queryTargetEl(a.selector);
          if (aEl && aEl.isConnected) {
            const ar = aEl.getBoundingClientRect();
            if (ar.width > 0 && ar.height > 0) annMatched++;
          }
        });
        this._syncAnnotationMarkers();
      }
      // 最多重试 10 次（约 2s），覆盖场景脚本异步渲染完成的时机
      if ((matched < pending.length || annMatched < state.annotations.length) && round < 10) {
        if (this._replayTimer) clearTimeout(this._replayTimer);
        this._replayTimer = setTimeout(() => this._replayInlineChanges(round + 1), 200);
      }
    }

    /** 自动保存（300ms 防抖）：颜色拖动等高频交互不再每帧写 localStorage */
    _saveChanges() {
      if (this._saveTimer) clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => {
        this._saveTimer = null;
        this._persistChanges();
        // 落盘后刷新角标：保证净零还原/清空等内存态变化最终与持久化一致，
        // 避免角标停留在防抖窗口内的旧计数
        this._updateChangeCount();
      }, 300);
    }

    /** 立即落盘：关闭气泡/删除/重置/切场景/离开页面等关键节点调用 */
    _flushSave() {
      if (this._saveTimer) {
        clearTimeout(this._saveTimer);
        this._saveTimer = null;
      }
      this._persistChanges();
    }

    _persistChanges() {
      try {
        const key = `wego.walkthrough.data.${state.currentRoute}`;
        localStorage.setItem(key, JSON.stringify({
          sceneRoute: state.currentRoute,
          lastModified: Date.now(),
          prNumber: getCurrentPrNumber(),
          changes: state.changes,
          annotations: state.annotations,
        }));
      } catch (e) {}
    }

    /** 统计所有场景（含当前场景）的变更/批注组数，供角标与提示使用 */
    /** 扫描所有场景的修改（遍历 localStorage 中所有 wego.walkthrough.data.* 记录） */
    _loadAllScenesChanges() {
      const scenes = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key || !key.startsWith('wego.walkthrough.data.')) continue;
          const routeId = key.replace('wego.walkthrough.data.', '');
          try {
            const raw = localStorage.getItem(key);
            const data = raw ? JSON.parse(raw) : {};
            const changes = (data.changes || []).filter(c => c.newValue !== '' && c.newValue != null);
            const annotations = (data.annotations || []).filter(a => a.text && String(a.text).trim());
            if (changes.length > 0 || annotations.length > 0) {
              scenes.push({ routeId, routeLabel: getRouteLabel(routeId), prNumber: data.prNumber || null, changes, annotations });
            }
          } catch (e) { /* 单个场景解析失败不影响其他场景 */ }
        }
      } catch (e) { /* localStorage 不可用时返回空 */ }
      const currentRoute = getCurrentRoute();
      scenes.sort((a, b) => {
        if (a.routeId === currentRoute) return -1;
        if (b.routeId === currentRoute) return 1;
        return a.routeLabel.localeCompare(b.routeLabel, 'zh-CN');
      });
      return scenes;
    }

    _countAllScenesChanges() {
      let total = 0;
      try {
        const all = this._loadAllScenesChanges();
        all.forEach(s => {
          // 当前场景以内存态为权威：避免防抖落盘窗口内读到旧 localStorage，
          // 导致净零还原/清空后角标残留旧计数（需等下次打开才刷新）
          if (s.routeId === state.currentRoute) return;
          const changeGroupCount = new Set(s.changes.map(c => c.sharedKey || c.selector)).size;
          total += changeGroupCount + s.annotations.filter(a => a.text && String(a.text).trim()).length;
        });
      } catch (e) { /* 跨场景统计失败时退回当前场景 */ }
      // 当前场景内存态（实时准确，与配置列表同源）
      const curGroupCount = new Set(state.changes.map(c => c.sharedKey || c.selector)).size;
      total += curGroupCount + state.annotations.filter(a => a.text && a.text.trim()).length;
      return total;
    }

    _updateChangeCount() {
      // 角标显示跨场景总数（所有场景的修改合计），避免切换场景后遗漏其它场景的修改
      const count = this._countAllScenesChanges();
      // 配置列表按钮数字（有数据时直接显示数字，替换图标；无数据时显示图标）
      if (this._components.overviewCount) {
        this._components.overviewCount.textContent = count > 99 ? '99+' : count;
        this._components.overviewCount.hidden = count === 0;
        const ovBtn = this._shadow.querySelector('[data-tool="overview"]');
        if (ovBtn) ovBtn.setAttribute('data-has-count', String(count > 0));
      }
      // 收起态 FAB 数字（有数据时直接显示数字，替换图标；无数据时显示图标）
      if (this._components.fabCount) {
        this._components.fabCount.textContent = count > 99 ? '99+' : count;
        this._components.fabCount.hidden = count === 0;
        if (this._components.fabBtn) this._components.fabBtn.setAttribute('data-has-count', String(count > 0));
      }
      // 收起态红点
      const hasIndicator = count > 0 || this._walkthroughMode || this._annotationMode || this._faultState.load || this._faultState.save || this._faultState['delete'] || this._faultState.slow;
      this._components.fabBtn.setAttribute('data-has-indicator', String(hasIndicator));
      // 走查模式按钮激活态
      const wtBtn = this._shadow.querySelector('[data-tool="walkthrough"]');
      if (wtBtn) wtBtn.setAttribute('data-active', String(this._walkthroughMode));
      // 批注模式按钮激活态
      const annBtn = this._shadow.querySelector('[data-tool="annotation"]');
      if (annBtn) annBtn.setAttribute('data-active', String(this._annotationMode));
      // 数据模拟按钮：有开关打开时只显示红点（badge-dot），不高亮（选中态只留给走查/批注）
      const dmBtn = this._shadow.querySelector('[data-tool="datamock"]');
      if (dmBtn) dmBtn.setAttribute('data-has-changes', String(this._faultState.load || this._faultState.save || this._faultState['delete'] || this._faultState.slow));
      // 配置列表按钮变更标记
      const ovBtn = this._shadow.querySelector('[data-tool="overview"]');
      if (ovBtn) ovBtn.setAttribute('data-has-changes', String(count > 0));
    }

    _updateToolbarState() {
      this._updateChangeCount();
    }

    _showToast(message) {
      this._components.toast.show(message);
    }
  }


  function register() {
    if (!customElements.get('wego-wt-toast')) customElements.define('wego-wt-toast', WegoWtToast);
    if (!customElements.get('wego-wt-overlay')) customElements.define('wego-wt-overlay', WegoWtOverlay);
    if (!customElements.get('wego-wt-highlight')) customElements.define('wego-wt-highlight', WegoWtHighlight);
    if (!customElements.get('wego-wt-style-panel')) customElements.define('wego-wt-style-panel', WegoWtStylePanel);
    if (!customElements.get('wego-wt-color-picker')) customElements.define('wego-wt-color-picker', WegoWtColorPicker);
    if (!customElements.get('wego-wt-overview-panel')) customElements.define('wego-wt-overview-panel', WegoWtOverviewPanel);
    if (!customElements.get('wego-walkthrough')) customElements.define('wego-walkthrough', WegoWalkthrough);
  }

  // ============================================================
  // 初始化
  // ============================================================
  function init() {
    register();
    // 注入主元素
    if (!document.querySelector('wego-walkthrough')) {
      const app = document.createElement('wego-walkthrough');
      document.body.appendChild(app);
    }
    // 暴露 API
    window.WegoApp = window.WegoApp || {};
    window.WegoApp.Walkthrough = {
      version: '1.0.0-mvp',
      getState: () => ({ ...state }),
      showToast: (msg) => {
        const app = document.querySelector('wego-walkthrough');
        if (app) app._showToast(msg);
      },
    };
    // 记录环境信息，便于排查移动端键盘问题
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    debugLog.add('INIT', `走查工具初始化: 移动端=${isMobile} 触摸=${isTouch} UA=${navigator.userAgent.slice(0, 80)}`);
    console.log('[Walkthrough] MVP initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
