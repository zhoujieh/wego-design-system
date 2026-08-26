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
  // 样式解析工具函数
  // ============================================================

  /** rgb/rgba 转 hex（不含透明度） */
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
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

  /** 解析数值（去掉单位） */
  function parseNumeric(value) {
    if (!value) return 0;
    const match = String(value).match(/^([\d.-]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

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

  /** 从元素读取样式，转换为面板数据 */
  function getElementStyleData(el) {
    const cs = getComputedStyle(el);
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
      width: parseNumeric(cs.width),
      height: parseNumeric(cs.height),
      display,
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
  // wego-wt-style-panel: 样式编辑浮动面板
  // ============================================================
  class WegoWtStylePanel extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._targetEl = null;
      this._selector = '';
      this._data = null;
      this._commitTimer = null;
    }
    connectedCallback() {
      this._render();
      this._bindEvents();
    }
    disconnectedCallback() {
      this._targetEl = null;
    }

    openForElement(el, selector) {
      this._targetEl = el;
      this._selector = selector;
      this._data = getElementStyleData(el);
      this._render();
      this._bindEvents();
      this._updatePosition();
      this.removeAttribute('hidden');
    }

    close() {
      this._targetEl = null;
      this.setAttribute('hidden', '');
    }

    _updatePosition() {
      if (!this._targetEl) return;
      const rect = this._targetEl.getBoundingClientRect();
      const panelWidth = 300;
      const gap = 12;
      // 优先显示在右侧
      let left = rect.right + gap;
      if (left + panelWidth > window.innerWidth - 8) {
        // 右侧空间不够，显示在左侧
        left = rect.left - panelWidth - gap;
        if (left < 8) {
          // 左右都不够，居中显示在元素下方
          left = Math.max(8, (window.innerWidth - panelWidth) / 2);
        }
      }
      // 垂直方向：顶部对齐元素顶部，不超出视口
      let top = rect.top;
      const panelHeight = this.offsetHeight || 400;
      if (top + panelHeight > window.innerHeight - 8) {
        top = window.innerHeight - panelHeight - 8;
      }
      if (top < 40) top = 40;
      this.style.left = left + 'px';
      this.style.top = top + 'px';
    }

    _render() {
      const d = this._data || {};
      const tag = this._targetEl ? this._targetEl.tagName.toLowerCase() : '';
      const text = this._targetEl ? (this._targetEl.textContent || '').trim().substring(0, 20) : '';
      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            z-index: 9600;
            width: 300px;
            max-width: calc(100vw - 16px);
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", sans-serif;
          }
          :host(:not([hidden])) { display: block; }
          .panel {
            box-sizing: border-box;
            width: 100%;
            max-height: 70vh;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            overflow-y: auto;
            overflow-x: hidden;
            border-radius: 14px;
            border: 1px solid var(--border-color, rgba(0,0,0,0.08));
            background: var(--bg-surface, #fff);
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          }
          .panel::-webkit-scrollbar { width: 4px; }
          .panel::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 2px; }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .header-info {
            flex: 1;
            min-width: 0;
          }
          .header-tag {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-default, #1a1a1a);
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
            font-size: 11px;
            font-weight: 600;
            color: var(--text-tertiary, #888);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .field-row {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .field-row.two-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }
          .field {
            display: flex;
            align-items: center;
            gap: 4px;
            flex: 1;
            min-width: 0;
          }
          .field-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: var(--text-tertiary, #888);
            flex-shrink: 0;
          }
          .text-input {
            flex: 1;
            min-width: 0;
            height: 30px;
            padding: 0 8px;
            border: 1px solid var(--border-color, rgba(0,0,0,0.1));
            border-radius: 7px;
            font-size: 12px;
            color: var(--text-default, #1a1a1a);
            background: var(--bg-surface, #fff);
            outline: none;
            box-sizing: border-box;
          }
          .text-input:focus {
            border-color: var(--text-brand, #00b96b);
          }
          .text-input.opacity-input {
            flex: 0 0 48px;
            width: 48px;
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
          select.text-input {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 8px center;
            padding-right: 24px;
          }
        </style>
        <div class="panel">
          <div class="header">
            <div class="header-info">
              <div class="header-tag">${tag}${this._selector ? ' · ' + this._selector.substring(0, 30) : ''}</div>
              ${text ? `<div class="header-text">${text}</div>` : ''}
            </div>
            <button class="close-btn" type="button" data-action="close">×</button>
          </div>

          <!-- 自动布局 -->
          <div class="section">
            <p class="section-title">自动布局</p>
            <div class="layout-tabs">
              <button class="layout-tab ${d.layoutMode === 'column' ? 'active' : ''}" data-field="layoutMode" data-value="column">
                <span class="icon">↕</span><span>纵向</span>
              </button>
              <button class="layout-tab ${d.layoutMode === 'row' ? 'active' : ''}" data-field="layoutMode" data-value="row">
                <span class="icon">↔</span><span>横向</span>
              </button>
            </div>
            <div class="field-row">
              <div class="alignment-matrix" data-align-matrix>
                ${this._renderAlignMatrix(d)}
              </div>
              <div class="field">
                <span class="field-icon">⇔</span>
                <input class="text-input" type="text" value="${d.layoutGap || ''}" data-field="layoutGap" inputmode="numeric" placeholder="gap" />
              </div>
            </div>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">L</span><input class="text-input" type="text" value="${d.paddingLeft || ''}" data-field="paddingLeft" inputmode="numeric" placeholder="左" /></div>
              <div class="field"><span class="field-icon">T</span><input class="text-input" type="text" value="${d.paddingTop || ''}" data-field="paddingTop" inputmode="numeric" placeholder="上" /></div>
            </div>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">R</span><input class="text-input" type="text" value="${d.paddingRight || ''}" data-field="paddingRight" inputmode="numeric" placeholder="右" /></div>
              <div class="field"><span class="field-icon">B</span><input class="text-input" type="text" value="${d.paddingBottom || ''}" data-field="paddingBottom" inputmode="numeric" placeholder="下" /></div>
            </div>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">W</span><input class="text-input" type="text" value="${d.width || ''}" data-field="width" inputmode="numeric" placeholder="宽" /></div>
              <div class="field"><span class="field-icon">H</span><input class="text-input" type="text" value="${d.height || ''}" data-field="height" inputmode="numeric" placeholder="高" /></div>
            </div>
          </div>

          <!-- 字体 -->
          <div class="section">
            <p class="section-title">字体</p>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">A</span><input class="text-input" type="text" value="${d.fontSize || ''}" data-field="fontSize" inputmode="numeric" placeholder="字号" /></div>
              <div class="field">
                <select class="text-input" data-field="fontWeight">
                  <option value="normal" ${d.fontWeight === 'normal' ? 'selected' : ''}>normal</option>
                  <option value="300" ${d.fontWeight === '300' ? 'selected' : ''}>300</option>
                  <option value="400" ${d.fontWeight === '400' ? 'selected' : ''}>400</option>
                  <option value="500" ${d.fontWeight === '500' ? 'selected' : ''}>500</option>
                  <option value="600" ${d.fontWeight === '600' ? 'selected' : ''}>600</option>
                  <option value="700" ${d.fontWeight === '700' ? 'selected' : ''}>700</option>
                  <option value="bold" ${d.fontWeight === 'bold' ? 'selected' : ''}>bold</option>
                </select>
              </div>
            </div>
            <div class="field-row">
              <button class="color-button" type="button" data-field="colorHex" data-color-trigger>
                <span class="swatch" style="background:${hexOpacityToRgba(d.colorHex || '#000000', d.colorOpacity ?? 100)}"></span>
              </button>
              <input class="text-input" type="text" value="${d.colorHex || ''}" data-field="colorHex" />
              <input class="text-input opacity-input" type="text" value="${d.colorOpacity ?? 100}" data-field="colorOpacity" inputmode="numeric" />
            </div>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">LH</span><input class="text-input" type="text" value="${d.lineHeight || ''}" data-field="lineHeight" inputmode="decimal" placeholder="行高" /></div>
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
              <div class="field"><span class="field-icon">○</span><input class="text-input" type="text" value="${d.layerOpacity ?? 100}" data-field="layerOpacity" inputmode="numeric" placeholder="透明" /></div>
              <div class="field"><span class="field-icon">⌐</span><input class="text-input" type="text" value="${d.borderRadiusAll || ''}" data-field="borderRadiusAll" inputmode="numeric" placeholder="圆角" /></div>
            </div>
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
      // 关闭按钮
      const closeBtn = this._shadow.querySelector('[data-action="close"]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          bus.emit('close-style-panel');
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
      // 对齐矩阵
      this._shadow.querySelectorAll('[data-align-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
          const [jc, ai] = btn.dataset.alignPreset.split('|');
          this._onFieldChange('justifyContent', jc);
          this._onFieldChange('alignItems', ai);
        });
      });
      // 颜色按钮（M3 先用原生 input color，M4 替换为自定义颜色选择器）
      this._shadow.querySelectorAll('[data-color-trigger]').forEach(btn => {
        btn.addEventListener('click', () => {
          const field = btn.dataset.field;
          const currentHex = this._data[field] || '#000000';
          const input = document.createElement('input');
          input.type = 'color';
          input.value = currentHex;
          input.style.position = 'fixed';
          input.style.opacity = '0';
          input.style.pointerEvents = 'none';
          document.body.appendChild(input);
          input.addEventListener('input', () => {
            this._onFieldChange(field, input.value.toUpperCase());
          });
          input.addEventListener('change', () => {
            document.body.removeChild(input);
          });
          input.click();
        });
      });
    }

    _onFieldChange(field, value) {
      if (!this._targetEl || !this._data) return;
      this._data[field] = value;
      // 应用到元素
      const result = this._applyField(field, value);
      if (result) {
        // 记录变更
        bus.emit('style-change', {
          selector: this._selector,
          elementTag: this._targetEl.tagName.toLowerCase(),
          elementText: (this._targetEl.textContent || '').trim().substring(0, 50),
          property: result.property,
          oldValue: result.oldValue,
          newValue: result.newValue,
        });
      }
      // 更新 UI（按钮 active 态等）
      this._updateActiveStates();
    }

    _applyField(field, value) {
      const el = this._targetEl;
      const numVal = parseFloat(value);
      switch (field) {
        case 'layoutMode':
          el.style.display = 'flex';
          el.style.flexDirection = value;
          return { property: 'flex-direction', oldValue: getComputedStyle(el).flexDirection, newValue: value };
        case 'justifyContent':
          el.style.justifyContent = value;
          return { property: 'justify-content', oldValue: getComputedStyle(el).justifyContent, newValue: value };
        case 'alignItems':
          el.style.alignItems = value;
          return { property: 'align-items', oldValue: getComputedStyle(el).alignItems, newValue: value };
        case 'layoutGap':
          el.style.gap = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'gap', oldValue: getComputedStyle(el).gap, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        case 'paddingLeft':
          el.style.paddingLeft = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'padding-left', oldValue: getComputedStyle(el).paddingLeft, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        case 'paddingRight':
          el.style.paddingRight = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'padding-right', oldValue: getComputedStyle(el).paddingRight, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        case 'paddingTop':
          el.style.paddingTop = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'padding-top', oldValue: getComputedStyle(el).paddingTop, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        case 'paddingBottom':
          el.style.paddingBottom = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'padding-bottom', oldValue: getComputedStyle(el).paddingBottom, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        case 'width':
          el.style.width = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'width', oldValue: getComputedStyle(el).width, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        case 'height':
          el.style.height = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'height', oldValue: getComputedStyle(el).height, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        case 'fontSize':
          el.style.fontSize = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'font-size', oldValue: getComputedStyle(el).fontSize, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        case 'fontWeight':
          el.style.fontWeight = value;
          return { property: 'font-weight', oldValue: getComputedStyle(el).fontWeight, newValue: value };
        case 'colorHex':
        case 'colorOpacity': {
          const hex = this._data.colorHex || '#000000';
          const opacity = this._data.colorOpacity ?? 100;
          const rgba = hexOpacityToRgba(hex, opacity);
          el.style.color = rgba;
          return { property: 'color', oldValue: getComputedStyle(el).color, newValue: rgba };
        }
        case 'lineHeight':
          el.style.lineHeight = value || '';
          return { property: 'line-height', oldValue: getComputedStyle(el).lineHeight, newValue: value || '' };
        case 'textAlign':
          el.style.textAlign = value;
          return { property: 'text-align', oldValue: getComputedStyle(el).textAlign, newValue: value };
        case 'layerOpacity':
          el.style.opacity = isNaN(numVal) ? '' : (numVal / 100).toString();
          return { property: 'opacity', oldValue: getComputedStyle(el).opacity, newValue: isNaN(numVal) ? '' : (numVal / 100).toString() };
        case 'borderRadiusAll':
          el.style.borderRadius = isNaN(numVal) ? '' : numVal + 'px';
          return { property: 'border-radius', oldValue: getComputedStyle(el).borderRadius, newValue: isNaN(numVal) ? '' : numVal + 'px' };
        default:
          return null;
      }
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
      // 颜色色块更新
      this._shadow.querySelectorAll('[data-color-trigger]').forEach(btn => {
        const field = btn.dataset.field;
        const opacityField = field.replace('Hex', 'Opacity');
        const hex = d[field] || '#000000';
        const opacity = d[opacityField] ?? 100;
        const swatch = btn.querySelector('.swatch');
        if (swatch) swatch.style.background = hexOpacityToRgba(hex, opacity);
      });
      // 对齐矩阵
      this._shadow.querySelectorAll('[data-align-preset]').forEach(btn => {
        const [jc, ai] = btn.dataset.alignPreset.split('|');
        btn.classList.toggle('active', jc === d.justifyContent && ai === d.alignItems);
      });
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
        <wego-wt-style-panel hidden></wego-wt-style-panel>
        <wego-wt-toast></wego-wt-toast>
        <wego-wt-bottom-bar hidden></wego-wt-bottom-bar>
        <wego-wt-fab></wego-wt-fab>
      `;
    }

    _initComponents() {
      this._components.banner = this._shadow.querySelector('wego-wt-banner');
      this._components.overlay = this._shadow.querySelector('wego-wt-overlay');
      this._components.stylePanel = this._shadow.querySelector('wego-wt-style-panel');
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

      // 元素选中 → 打开样式面板
      bus.on('element-selected', ({ element, selector }) => {
        this._components.stylePanel.openForElement(element, selector);
      });

      // 元素取消选中 → 关闭样式面板
      bus.on('element-deselected', () => {
        this._components.stylePanel.close();
      });

      // 关闭样式面板 → 取消选中
      bus.on('close-style-panel', () => {
        this._clearSelection();
      });

      // 样式变更 → 记录
      bus.on('style-change', (change) => {
        this._recordChange(change);
      });
    }

    _recordChange(change) {
      // 同一元素同一属性的修改合并
      const existing = state.changes.find(c =>
        c.selector === change.selector && c.property === change.property
      );
      if (existing) {
        existing.newValue = change.newValue;
        existing.timestamp = Date.now();
        existing.elementText = change.elementText;
      } else {
        state.changes.push({
          id: 'change-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          selector: change.selector,
          elementTag: change.elementTag,
          elementText: change.elementText,
          property: change.property,
          oldValue: change.oldValue,
          newValue: change.newValue,
          timestamp: Date.now(),
        });
      }
      this._saveChanges();
      this._updateChangeCount();
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
    if (!customElements.get('wego-wt-style-panel')) customElements.define('wego-wt-style-panel', WegoWtStylePanel);
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
