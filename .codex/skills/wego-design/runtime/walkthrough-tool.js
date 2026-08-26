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
    selectedElement: null,
    changes: [],
    currentRoute: '',
  };

  /** 获取当前场景路由 */
  function getCurrentRoute() {
    const hash = window.location.hash || '';
    const match = hash.match(/#\/(.+)/);
    return match ? match[1] : 'default';
  }

  /** 判断元素是否属于走查工具自身（包括 Shadow DOM 内部） */
  function isWalkthroughElement(el) {
    if (!el) return false;
    // 检查 Light DOM 中的祖先
    const lightTags = 'wego-walkthrough,wego-wt-fab,wego-wt-bottom-bar,wego-wt-banner,wego-wt-style-panel,wego-wt-overview-panel,wego-wt-color-picker,wego-wt-toast,wego-wt-overlay';
    if (el.closest && el.closest(lightTags)) return true;
    // 检查 Shadow DOM：元素的根节点是否为走查工具的 shadowRoot
    try {
      const root = el.getRootNode ? el.getRootNode() : null;
      if (root && root.host && root.host.tagName === 'WEGO-WALKTHROUGH') return true;
    } catch (e) { /* ignore */ }
    return false;
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
        const selector = `${el.tagName.toLowerCase()}[${attr}="${val}"]`;
        if (document.querySelectorAll(selector).length === 1) return selector;
      }
    }
    // 3. tagname.class:nth-child(n) 路径链
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== document.body) {
      let part = node.tagName.toLowerCase();
      if (node.className && typeof node.className === 'string') {
        const classes = node.className.trim().split(/\s+/).filter(c => c && !c.startsWith('wt-') && !c.startsWith('wego-'));
        if (classes.length) part += '.' + classes.slice(0, 2).join('.');
      }
      // nth-child
      const parent = node.parentNode;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === node.tagName);
        if (siblings.length > 1) {
          const idx = siblings.indexOf(node) + 1;
          part += `:nth-of-type(${idx})`;
        }
      }
      parts.unshift(part);
      // 遇到稳定祖先就停止
      if (node.id && document.querySelectorAll('#' + CSS.escape(node.id)).length === 1) {
        parts[0] = '#' + node.id;
        break;
      }
      node = node.parentNode;
    }
    const selector = parts.join(' > ');
    // 验证唯一性
    try {
      if (document.querySelectorAll(selector).length === 1) return selector;
    } catch (e) { /* ignore */ }
    return selector;
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
      this.style.transform = 'translateY(0)';
      if (this._timer) clearTimeout(this._timer);
      this._timer = setTimeout(() => this.hide(), duration);
    }
    hide() {
      this.style.opacity = '0';
      this.style.transform = 'translateY(10px)';
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
  // wego-wt-banner: 走查模式顶部横幅
  // ============================================================
  class WegoWtBanner extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
      this._render();
    }
    _render() {
      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 28px;
            z-index: 9000;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: var(--text-brand, #00b96b);
            color: #fff;
            font-size: 12px;
            line-height: 1;
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif;
            font-weight: 500;
          }
          .close-btn {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            border: none;
            background: transparent;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
          }
        </style>
        <span>走查模式 · 触摸元素选中</span>
        <button class="close-btn" type="button" aria-label="关闭走查模式">×</button>
      `;
      this._shadow.querySelector('.close-btn').addEventListener('click', () => {
        bus.emit('walkthrough-mode-toggle', { enabled: false });
      });
    }
  }

  // ============================================================
  // wego-wt-bottom-bar: 底部工具条
  // ============================================================
  class WegoWtBottomBar extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._moreOpen = false;
    }
    connectedCallback() {
      this._render();
    }
    setChangeCount(count) {
      this._changeCount = count;
      const badge = this._shadow.querySelector('.badge');
      if (badge) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }
    }
    setWalkthroughMode(enabled) {
      this._walkthroughMode = enabled;
      const btn = this._shadow.querySelector('[data-action="walkthrough"]');
      if (btn) {
        btn.classList.toggle('active', enabled);
        btn.querySelector('.btn-label').textContent = enabled ? '退出走查' : '走查模式';
      }
    }
    _render() {
      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            right: 12px;
            bottom: 156px;
            z-index: 9400;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
          }
          .more-menu {
            display: none;
            flex-direction: column;
            gap: 4px;
            padding: 6px;
            border-radius: 12px;
            background: var(--bg-surface, #fff);
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
            border: 1px solid var(--border-color, rgba(0,0,0,0.08));
            min-width: 120px;
          }
          .more-menu.open { display: flex; }
          .more-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border: none;
            background: transparent;
            border-radius: 8px;
            font-size: 13px;
            color: var(--text-default, #1a1a1a);
            cursor: pointer;
            text-align: left;
            font-family: inherit;
          }
          .more-item:hover { background: rgba(0,0,0,0.05); }
          .more-item.danger { color: var(--text-error, #e53935); }
          .toolbar {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px;
            border-radius: 14px;
            background: var(--bg-surface, #fff);
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
            border: 1px solid var(--border-color, rgba(0,0,0,0.08));
          }
          .tool-btn {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            min-width: 56px;
            height: 48px;
            padding: 4px 8px;
            border: none;
            border-radius: 10px;
            background: transparent;
            color: var(--text-tertiary, #888);
            font-size: 11px;
            cursor: pointer;
            font-family: inherit;
          }
          .tool-btn:hover { background: rgba(0,0,0,0.04); }
          .tool-btn.active {
            background: var(--text-brand, #00b96b);
            color: #fff;
          }
          .tool-btn .icon { font-size: 18px; line-height: 1; }
          .tool-btn .btn-label { font-size: 11px; line-height: 1.2; }
          .badge {
            position: absolute;
            top: 2px;
            right: 4px;
            min-width: 16px;
            height: 16px;
            padding: 0 4px;
            border-radius: 8px;
            background: var(--text-error, #e53935);
            color: #fff;
            font-size: 10px;
            line-height: 16px;
            text-align: center;
            display: none;
            align-items: center;
            justify-content: center;
          }
        </style>
        <div class="more-menu" data-more-menu>
          <button class="more-item danger" type="button" data-action="reset">重置修改</button>
        </div>
        <div class="toolbar">
          <button class="tool-btn active" type="button" data-action="walkthrough">
            <span class="icon">◎</span>
            <span class="btn-label">走查模式</span>
          </button>
          <button class="tool-btn" type="button" data-action="overview">
            <span class="icon">≡</span>
            <span class="btn-label">配置列表</span>
            <span class="badge">0</span>
          </button>
          <button class="tool-btn" type="button" data-action="more">
            <span class="icon">⋯</span>
            <span class="btn-label">更多</span>
          </button>
        </div>
      `;

      this._shadow.querySelector('[data-action="walkthrough"]').addEventListener('click', () => {
        bus.emit('walkthrough-mode-toggle', { enabled: !state.walkthroughMode });
      });
      this._shadow.querySelector('[data-action="overview"]').addEventListener('click', () => {
        bus.emit('open-overview');
      });
      this._shadow.querySelector('[data-action="more"]').addEventListener('click', (e) => {
        e.stopPropagation();
        this._moreOpen = !this._moreOpen;
        this._shadow.querySelector('[data-more-menu]').classList.toggle('open', this._moreOpen);
      });
      this._shadow.querySelector('[data-action="reset"]').addEventListener('click', () => {
        this._moreOpen = false;
        this._shadow.querySelector('[data-more-menu]').classList.remove('open');
        bus.emit('reset-changes');
      });

      // 点击外部关闭更多菜单
      document.addEventListener('click', () => {
        if (this._moreOpen) {
          this._moreOpen = false;
          this._shadow.querySelector('[data-more-menu]').classList.remove('open');
        }
      });
    }
  }

  // ============================================================
  // wego-wt-fab: 悬浮入口按钮
  // ============================================================
  class WegoWtFab extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._expanded = false;
    }
    connectedCallback() {
      this._render();
    }
    setExpanded(expanded) {
      this._expanded = expanded;
      this._updateVisual();
    }
    setHasChanges(has) {
      this._hasChanges = has;
      const dot = this._shadow.querySelector('.dot');
      if (dot) dot.style.display = has ? 'block' : 'none';
    }
    setWalkthroughMode(enabled) {
      this._walkthroughMode = enabled;
      const btn = this._shadow.querySelector('.fab');
      if (btn) btn.classList.toggle('mode-active', enabled);
    }
    _updateVisual() {
      const btn = this._shadow.querySelector('.fab');
      const icon = this._shadow.querySelector('.fab-icon');
      if (btn) btn.classList.toggle('expanded', this._expanded);
      if (icon) icon.textContent = this._expanded ? '×' : '◎';
    }
    _render() {
      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            right: 12px;
            bottom: 96px;
            z-index: 9500;
          }
          .fab {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: none;
            background: var(--bg-surface, #fff);
            color: var(--text-brand, #00b96b);
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            border: 1px solid var(--border-color, rgba(0,0,0,0.08));
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            transition: transform 0.2s ease, background 0.2s ease;
            padding: 0;
          }
          .fab:active { transform: scale(0.92); }
          .fab.mode-active {
            background: var(--text-brand, #00b96b);
            color: #fff;
          }
          .fab.expanded { transform: rotate(45deg); }
          .fab.expanded.mode-active { transform: rotate(45deg); }
          .dot {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: var(--text-error, #e53935);
            border: 2px solid var(--bg-surface, #fff);
            display: none;
          }
        </style>
        <button class="fab" type="button" aria-label="走查工具">
          <span class="fab-icon">◎</span>
        </button>
        <span class="dot"></span>
      `;
      this._shadow.querySelector('.fab').addEventListener('click', () => {
        bus.emit('fab-toggle');
      });
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
  // wego-walkthrough: 主应用根元素
  // ============================================================
  class WegoWalkthrough extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._components = {};
    }

    connectedCallback() {
      this._render();
      this._initComponents();
      this._bindEvents();
      state.currentRoute = getCurrentRoute();
      // 监听路由变化
      window.addEventListener('hashchange', () => {
        state.currentRoute = getCurrentRoute();
        this._loadChanges();
      });
      this._loadChanges();
    }

    _render() {
      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            inset: 0;
            z-index: 8999;
            pointer-events: none;
          }
          :host > * { pointer-events: auto; }
        </style>
        <wego-wt-banner hidden></wego-wt-banner>
        <wego-wt-overlay hidden></wego-wt-overlay>
        <wego-wt-toast></wego-wt-toast>
        <wego-wt-bottom-bar hidden></wego-wt-bottom-bar>
        <wego-wt-fab></wego-wt-fab>
      `;
    }

    _initComponents() {
      this._components.banner = this._shadow.querySelector('wego-wt-banner');
      this._components.overlay = this._shadow.querySelector('wego-wt-overlay');
      this._components.toast = this._shadow.querySelector('wego-wt-toast');
      this._components.bottomBar = this._shadow.querySelector('wego-wt-bottom-bar');
      this._components.fab = this._shadow.querySelector('wego-wt-fab');
    }

    _bindEvents() {
      // 悬浮按钮展开/收起
      bus.on('fab-toggle', () => {
        const bar = this._components.bottomBar;
        const isHidden = bar.hasAttribute('hidden');
        if (isHidden) {
          bar.removeAttribute('hidden');
          this._components.fab.setExpanded(true);
        } else {
          bar.setAttribute('hidden', '');
          this._components.fab.setExpanded(false);
        }
      });

      // 走查模式切换
      bus.on('walkthrough-mode-toggle', ({ enabled }) => {
        this._setWalkthroughMode(enabled);
      });

      // 重置修改
      bus.on('reset-changes', () => {
        this._resetChanges();
      });

      // 打开配置列表（M5 实现）
      bus.on('open-overview', () => {
        this._showToast('配置列表功能开发中');
      });
    }

    _setWalkthroughMode(enabled) {
      state.walkthroughMode = enabled;
      if (enabled) {
        document.body.setAttribute('data-walkthrough-mode', 'true');
        this._components.banner.removeAttribute('hidden');
        this._bindTouchEvents();
      } else {
        document.body.removeAttribute('data-walkthrough-mode');
        this._components.banner.setAttribute('hidden', '');
        this._unbindTouchEvents();
        // 取消选中
        this._clearSelection();
      }
      this._components.bottomBar.setWalkthroughMode(enabled);
      this._components.fab.setWalkthroughMode(enabled);
    }

    _bindTouchEvents() {
      this._touchStartX = 0;
      this._touchStartY = 0;
      this._touchStartTime = 0;
      this._isSwiping = false;
      document.addEventListener('touchstart', this._onTouchStart, { passive: true });
      document.addEventListener('touchmove', this._onTouchMove, { passive: true });
      document.addEventListener('touchend', this._onTouchEnd, { passive: false });
      // 桌面端鼠标点击支持
      document.addEventListener('mousedown', this._onMouseDown, true);
    }

    _unbindTouchEvents() {
      document.removeEventListener('touchstart', this._onTouchStart);
      document.removeEventListener('touchmove', this._onTouchMove);
      document.removeEventListener('touchend', this._onTouchEnd);
      document.removeEventListener('mousedown', this._onMouseDown, true);
    }

    _onTouchStart = (e) => {
      const touch = e.touches[0];
      this._touchStartX = touch.clientX;
      this._touchStartY = touch.clientY;
      this._touchStartTime = Date.now();
      this._isSwiping = false;
    }

    _onTouchMove = (e) => {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - this._touchStartX);
      const dy = Math.abs(touch.clientY - this._touchStartY);
      if (dx > 10 || dy > 10) {
        this._isSwiping = true;
      }
    }

    _onTouchEnd = (e) => {
      if (this._isSwiping) return;
      const duration = Date.now() - this._touchStartTime;
      if (duration >= 500) return; // 长按不处理（MVP）
      const touch = e.changedTouches[0];
      this._handlePointSelection(touch.clientX, touch.clientY, e);
    }

    _onMouseDown = (e) => {
      // 桌面端：左键点击选中
      if (e.button !== 0) return;
      // 延迟到 mouseup 判断是否为点击（避免拖拽时选中）
      this._mouseDownX = e.clientX;
      this._mouseDownY = e.clientY;
      const onMouseUp = (ev) => {
        document.removeEventListener('mouseup', onMouseUp, true);
        const dx = Math.abs(ev.clientX - this._mouseDownX);
        const dy = Math.abs(ev.clientY - this._mouseDownY);
        if (dx > 5 || dy > 5) return; // 拖拽，不选中
        this._handlePointSelection(ev.clientX, ev.clientY, ev);
      };
      document.addEventListener('mouseup', onMouseUp, true);
    }

    _handlePointSelection(clientX, clientY, event) {
      // 检查点击的是否是工具自身元素
      const el = document.elementFromPoint(clientX, clientY);
      if (!el) return;
      if (isWalkthroughElement(el)) return;
      // 点击空白处（body/html）取消选中
      if (el === document.body || el === document.documentElement) {
        this._clearSelection();
        return;
      }
      // 阻止默认行为（避免链接跳转等）
      if (event && event.cancelable) event.preventDefault();
      this._selectElement(el);
    }

    _selectElement(el) {
      // 取消之前的选中
      this._clearSelection();
      // 设置新选中
      state.selectedElement = el;
      el.setAttribute('data-wt-selected', 'true');
      // 显示信息气泡
      this._components.overlay.removeAttribute('hidden');
      this._components.overlay.showForElement(el);
      // 生成选择器（用于变更记录）
      state.selectedSelector = generateSelector(el);
      // 触发事件（M3 样式面板监听）
      bus.emit('element-selected', { element: el, selector: state.selectedSelector });
    }

    _clearSelection() {
      if (state.selectedElement) {
        state.selectedElement.removeAttribute('data-wt-selected');
        state.selectedElement = null;
      }
      if (this._components.overlay) {
        this._components.overlay.hide();
        this._components.overlay.setAttribute('hidden', '');
      }
      state.selectedSelector = '';
      bus.emit('element-deselected');
    }

    _resetChanges() {
      if (state.changes.length === 0) {
        this._showToast('当前没有修改');
        return;
      }
      // 恢复所有元素样式
      const bySelector = {};
      state.changes.forEach(c => {
        if (!bySelector[c.selector]) bySelector[c.selector] = [];
        bySelector[c.selector].push(c);
      });
      Object.keys(bySelector).forEach(selector => {
        try {
          const el = document.querySelector(selector);
          if (el) {
            bySelector[selector].forEach(c => {
              el.style[c.property] = '';
            });
          }
        } catch (e) { /* ignore */ }
      });
      state.changes = [];
      this._saveChanges();
      this._updateChangeCount();
      this._showToast('已重置所有修改');
    }

    _loadChanges() {
      try {
        const key = `wego.walkthrough.data.${state.currentRoute}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          state.changes = data.changes || [];
        } else {
          state.changes = [];
        }
        this._updateChangeCount();
      } catch (e) {
        console.error('[Walkthrough] load changes error:', e);
      }
    }

    _saveChanges() {
      try {
        const key = `wego.walkthrough.data.${state.currentRoute}`;
        const data = {
          sceneRoute: state.currentRoute,
          lastModified: Date.now(),
          changes: state.changes,
        };
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error('[Walkthrough] save changes error:', e);
      }
    }

    _updateChangeCount() {
      const count = state.changes.length;
      this._components.bottomBar.setChangeCount(count);
      this._components.fab.setHasChanges(count > 0);
    }

    _showToast(message, duration) {
      this._components.toast.show(message, duration);
    }
  }

  // ============================================================
  // 注册自定义元素
  // ============================================================
  function register() {
    if (!customElements.get('wego-wt-toast')) customElements.define('wego-wt-toast', WegoWtToast);
    if (!customElements.get('wego-wt-banner')) customElements.define('wego-wt-banner', WegoWtBanner);
    if (!customElements.get('wego-wt-overlay')) customElements.define('wego-wt-overlay', WegoWtOverlay);
    if (!customElements.get('wego-wt-bottom-bar')) customElements.define('wego-wt-bottom-bar', WegoWtBottomBar);
    if (!customElements.get('wego-wt-fab')) customElements.define('wego-wt-fab', WegoWtFab);
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
    console.log('[Walkthrough] MVP initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
