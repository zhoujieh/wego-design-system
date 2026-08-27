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
    originalStyles: {}, // selector -> { 'css-property': 原始计算值 }
    pseudoStyles: {}, // "selector||before|after" -> { 'css-property': 值 }（注入 <head> 的规则）
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
    const lightTags = 'wego-walkthrough,wego-wt-style-panel,wego-wt-overview-panel,wego-wt-color-picker,wego-wt-toast,wego-wt-overlay,wego-wt-highlight';
    if (el.closest && el.closest(lightTags)) return true;
    // 检查 Shadow DOM：元素的根节点是否为走查工具的 shadowRoot
    try {
      const root = el.getRootNode ? el.getRootNode() : null;
      if (root && root.host && root.host.tagName === 'WEGO-WALKTHROUGH') return true;
    } catch (e) { /* ignore */ }
    return false;
  }

  /** 纯 nth 兜底链（原逻辑，用于优雅降级） */
  function buildNthChain(el) {
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== document.body) {
      let part = node.tagName.toLowerCase();
      if (node.className && typeof node.className === 'string') {
        const classes = node.className.trim().split(/\s+/).filter(c => c && !c.startsWith('wt-') && !c.startsWith('wego-') && !c.startsWith('data-wt'));
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
          ? el.className.trim().split(/\s+/).filter(c => c && !c.startsWith('wt-') && !c.startsWith('wego-') && !c.startsWith('data-wt'))[0]
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
        const cls = anchorNode.className.trim().split(/\s+/).filter(c => c && !c.startsWith('wt-') && !c.startsWith('wego-') && !c.startsWith('data-wt'))[0];
        const sel = cls ? '.' + cls : anchorNode.tagName.toLowerCase();
        if (document.querySelectorAll(sel).length === 1) { anchor = sel; break; }
        anchor = sel;
      }
      anchorNode = anchorNode.parentNode;
    }
    // 3b. 从目标到锚点（不含锚）拼接类名链，仅在不唯一时才加 nth
    const classesOf = (n) => (n.className && typeof n.className === 'string')
      ? n.className.trim().split(/\s+/).filter(c => c && !c.startsWith('wt-') && !c.startsWith('wego-') && !c.startsWith('data-wt'))
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
      width: cs.width,        // 保留原始字符串：px / 100% / auto / fit-content
      height: cs.height,
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
          resolvedHex = '#' + [1, 2, 3].map(i => parseInt(match[i], 10).toString(16).padStart(2, '0')).join('');
        } else {
          resolvedHex = '#000000';
        }
      }
      this._hex = resolvedHex;
      this._opacity = opacity !== undefined ? opacity : 100;
      this._hsv = this._hexToHsv(this._hex);
      this._callback = callback;
      this._render();
      // 定位到触发按钮附近，优先下方，空间不足翻上方
      const rect = triggerEl.getBoundingClientRect();
      const pickerWidth = 260;
      const pickerHeight = 380;
      let left = rect.left;
      let top = rect.bottom + 6;
      if (left + pickerWidth > window.innerWidth - 8) left = window.innerWidth - pickerWidth - 8;
      if (left < 8) left = 8;
      if (top + pickerHeight > window.innerHeight - 8) top = rect.top - pickerHeight - 6;
      if (top < 8) top = 8;
      this.style.left = left + 'px';
      this.style.top = top + 'px';
      this.removeAttribute('hidden');
      // 点击外部关闭
      this._outsideHandler = (e) => {
        if (!this.contains(e.target) && e.target !== triggerEl && !triggerEl.contains(e.target)) {
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
          :host(:not([hidden])) { display: block; }
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

          /* SV 二维取色面板 — 不裁剪，选点可超出边缘 */
          .sv-panel {
            position: relative; width: 100%; height: 150px;
            border-radius: 8px; cursor: crosshair;
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
            <button class="close-btn" type="button" data-action="close">×</button>
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
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 22l4-1 11-11-3-3L3 18l-1 4z"/>
                <path d="M14 7l3 3"/>
                <path d="M17 4l3 3"/>
              </svg>
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
      this._route = '';
      this._activeTab = 'all'; // all | config
    }
    connectedCallback() {
      this._render();
    }
    open(changes, route, anchorEl) {
      this._changes = changes || [];
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
      const changes = this._changes;
      // 按选择器分组
      const groups = {};
      changes.forEach(c => {
        const gkey = c.selector + (c.target ? '::' + c.target : '');
        if (!groups[gkey]) {
          groups[gkey] = {
            selector: c.selector,
            target: c.target || '',
            elementTag: c.elementTag,
            elementText: c.elementText,
            changes: [],
          };
        }
        groups[gkey].changes.push(c);
      });
      const groupList = Object.values(groups);

      this._shadow.innerHTML = `
        <style>
          :host {
            position: fixed;
            z-index: 9600;
            width: 320px;
            max-width: calc(100vw - 16px);
            display: none;
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
          :host(:not([hidden])) { display: block; }
          .panel {
            box-sizing: border-box;
            width: 100%;
            max-height: calc(100vh - 120px);
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            border-radius: 14px;
            border: 1px solid var(--border-color, rgba(255,255,255,0.08));
            background: var(--bg-surface, rgba(30,30,30,0.82));
            box-shadow: 0 12px 40px rgba(0,0,0,0.25);
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .header-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-default, #1a1a1a);
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
          .copy-btn {
            height: 30px;
            padding: 0 12px;
            border: none;
            border-radius: 8px;
            background: var(--text-brand, #00b96b);
            color: #fff;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .copy-btn:active { opacity: 0.8; }
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
          .tabs {
            display: flex;
            gap: 4px;
            padding: 3px;
            border-radius: 9px;
            background: rgba(255,255,255,0.04);
          }
          .tab {
            flex: 1;
            height: 30px;
            border: none;
            background: transparent;
            border-radius: 7px;
            font-size: 12px;
            color: var(--text-tertiary, rgba(255,255,255,0.42));
            cursor: pointer;
          }
          .tab.active {
            background: var(--bg-surface, rgba(30,30,30,0.82));
            color: var(--text-brand, #00b96b);
            font-weight: 500;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          }
          .list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            overflow-y: auto;
            max-height: calc(100vh - 280px);
            padding-right: 4px;
          }
          .list::-webkit-scrollbar { width: 4px; }
          .list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
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
            padding: 32px 16px;
            color: var(--text-tertiary, #888);
            font-size: 12px;
            line-height: 1.6;
          }
          .footer {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
            padding-top: 4px;
            border-top: 1px solid rgba(255,255,255,0.06);
          }
          .reset-btn {
            height: 28px;
            padding: 0 10px;
            border: none;
            background: transparent;
            color: var(--text-error, #e53935);
            font-size: 12px;
            cursor: pointer;
            border-radius: 6px;
          }
          .reset-btn:hover { background: rgba(229,57,53,0.06); }
        </style>
        <div class="panel">
          <div class="header">
            <div>
              <span class="header-title">配置列表</span>
              <span class="header-count">${changes.length} 项变更</span>
            </div>
          </div>
          <div class="tabs">
            <button class="tab ${this._activeTab === 'all' ? 'active' : ''}" data-tab="all">全部</button>
            <button class="tab ${this._activeTab === 'config' ? 'active' : ''}" data-tab="config">配置</button>
          </div>
          ${groupList.length === 0 ? `
            <div class="empty">
              当前还没有配置修改<br/>
              选中元素后在样式面板中修改
            </div>
          ` : `
            <div class="list">
              ${groupList.map((g, gi) => `
                <div class="item">
                  <div class="item-top">
                    <span class="item-selector" data-selector="${g.selector}" data-gi="${gi}">${g.elementTag}${g.elementText ? ' · ' + g.elementText : ''}</span>
                  </div>
                  ${g.changes.map((c, ci) => `
                    <div class="change-row">
                      <span class="change-prop">${c.property}${c.target ? ' · ' + c.target : ''}</span>
                      <span class="change-old" title="${c.oldValue}">${c.oldValue || '-'}</span>
                      <span class="change-arrow">→</span>
                      <span class="change-new" title="${c.newValue}">${c.newValue || '-'}</span>
                      <button class="change-delete" type="button" data-delete="${c.id}" title="删除此变更">×</button>
                    </div>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          `}
          ${groupList.length > 0 ? `
            <div class="footer">
              <button class="copy-btn" type="button" data-action="copy">复制 Prompt</button>
              <button class="reset-btn" type="button" data-action="reset">重置所有修改</button>
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
      // Tab 切换
      this._shadow.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
          this._activeTab = btn.dataset.tab;
          this._render();
          this._bindEvents();
        });
      });
      // 点击元素选择器 → 跳转选中
      this._shadow.querySelectorAll('[data-selector]').forEach(el => {
        el.addEventListener('click', () => {
          const selector = el.dataset.selector;
          bus.emit('jump-to-element', { selector });
        });
      });
      // 单条删除
      this._shadow.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.delete;
          bus.emit('delete-change', { id });
        });
      });
      // 重置
      const resetBtn = this._shadow.querySelector('[data-action="reset"]');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          bus.emit('reset-changes');
        });
      }
    }

    _copyPrompt() {
      const prompt = this._buildPrompt();
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
      const viewport = `${window.innerWidth}×${window.innerHeight}`;
      const changes = this._changes;
      if (changes.length === 0) {
        return `## Page Feedback: ${route}\n**Viewport:** ${viewport}\n\n当前还没有记录到任何配置修改。`;
      }
      // 按选择器分组（同一元素的所有改动归一条）
      const groups = {};
      changes.forEach(c => {
        if (!groups[c.selector]) {
          groups[c.selector] = {
            selector: c.selector,
            elementTag: c.elementTag,
            elementText: c.elementText,
            elementClass: c.elementClass || '',
            changes: [],
          };
        }
        groups[c.selector].changes.push(c);
      });
      const groupList = Object.values(groups);
      const lines = [
        `## Page Feedback: ${route}`,
        `**Viewport:** ${viewport}`,
        '',
        '> 施工单：按你调好的最终效果整理，可直接照做。改法优先用设计系统语义类；定位用稳定标识。',
        '',
      ];
      const machine = [];
      groupList.forEach((g, i) => {
        // 业务锚点：取首段有意义文案（截断，不再整段糊）
        const anchor = (g.elementText || '').replace(/\s+/g, ' ').trim();
        const shortAnchor = anchor.length > 12 ? anchor.slice(0, 12) + '…' : anchor;
        // 语义类名锚点：优先 elementClass，缺失时从 selector 末段提取（如 .business-home__quick-card）
        const classAnchor = (() => {
          if (g.elementClass) return g.elementClass.split(/\s+/)[0];
          const m = g.selector.match(/\.([a-zA-Z0-9_-]+)\s*$/) || g.selector.match(/\[data-component-slug="[^"]+"\]\.([a-zA-Z0-9_-]+)/);
          return m ? m[1] : '';
        })();
        const role = shortAnchor || classAnchor || g.elementTag;
        const addClassChanges = g.changes.filter(c => c.intent === 'add-class');
        const cssChanges = g.changes.filter(c => !c.skipCss);
        const lines2 = [];
        lines2.push(`### ${i + 1}. ${g.elementTag} · ${role}`);
        lines2.push(`**定位:** \`${g.selector}\``);
        if (anchor) lines2.push(`**业务锚点:** ${anchor}`);
        if (addClassChanges.length) {
          const clsNote = addClassChanges.map(c => c.note).filter(Boolean)[0] || '';
          const want = addClassChanges.map(c => `加结构类 \`${c.intentClass}\``).join('；');
          lines2.push(`**你要的:** ${want}`);
          lines2.push(`**改法:** ${(classAnchor ? '在类 `' + classAnchor + '` 上加 ' : '元素加 ') + addClassChanges.map(c => '`' + c.intentClass + '`').join(' ')}`);
          if (clsNote) lines2.push(`**提醒:** ${clsNote}`);
        }
        if (cssChanges.length) {
          const wantCsv = cssChanges.map(c => `${c.property} → ${c.newValue || '-'}`).join('；');
          lines2.push(`**你要的:** 调整样式 ${wantCsv}`);
          lines2.push(`**改法:** 在源码对应 CSS 中设置：${cssChanges.map(c => `${c.property}: ${c.newValue || '-'}`).join('; ')}`);
        }
        lines2.push('');
        lines.push(...lines2);
        machine.push({
          selector: g.selector,
          elementText: anchor,
          role,
          adds: addClassChanges.map(c => c.intentClass).filter(Boolean),
          css: cssChanges.map(c => ({ property: c.property, value: c.newValue })),
        });
      });
      lines.push('<!-- WEGo_CHANGES_JSON ' + JSON.stringify(machine) + ' -->');
      return lines.join('\n');
    }

    refresh(changes, route) {
      this._changes = changes || [];
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
        { name: 'text-inverse', var: '--text-inverse', label: '反白', desc: '深色背景上的文字' },
        { name: 'text-brand', var: '--text-brand', label: '品牌', desc: '品牌色/可点击文字' },
        { name: 'text-promotion', var: '--text-promotion', label: '促销', desc: '价格/促销强调文字' },
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
    }

    close() {
      this._targetEl = null;
      this.setAttribute('hidden', '');
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
          :host(:not([hidden])) { display: block; }
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
            width: 260px;
            border-radius: 14px;
            /* 外层只负责模糊，不设背景色 */
            backdrop-filter: blur(20px) saturate(160%);
            -webkit-backdrop-filter: blur(20px) saturate(160%);
            display: none;
          }
          .token-panel.open { display: block; }
          .token-panel-inner {
            max-height: 340px;
            overflow-y: auto;
            padding: 12px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            /* 内层负责半透明背景色 */
            background: rgba(30, 30, 30, 0.78);
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
          }
          .token-panel-inner::-webkit-scrollbar { width: 0; }
          .token-group-title {
            font-size: 10px;
            font-weight: 600;
            color: var(--text-tertiary, rgba(255,255,255,0.5));
            margin: 10px 0 6px;
            letter-spacing: 0.3px;
          }
          .token-group-title:first-child { margin-top: 0; }
          .token-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 6px;
            padding-right: 2px;
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
              <div class="header-tag">${tag || '—'}${this._selector ? `<span class="header-selector">${this._selector.substring(0, 40)}</span>` : ''}</div>
              ${text ? `<div class="header-text">${text}</div>` : ''}
            </div>
            <button class="close-btn" type="button" data-action="close">×</button>
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
                <span class="field-icon">W</span>
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
                <span class="field-icon">H</span>
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
                <span class="swatch" style="background:${colorSwatchBg}"></span>
              </button>
              <input class="text-input" type="text" value="${d.colorHex || ''}" data-field="colorHex" />
              <input class="text-input opacity-input" type="text" value="${d.colorOpacity ?? 100}" data-field="colorOpacity" inputmode="numeric" ${colorIsToken ? 'disabled' : ''} />
              <button class="token-btn ${colorIsToken ? 'active' : ''}" type="button" data-token-trigger="color" title="选择设计系统 Token">
                ${colorIsToken ? colorTokenName : 'T'}
              </button>
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

          <!-- 填充 -->
          <div class="section">
            <p class="section-title">填充</p>
            <div class="field-row">
              <button class="color-button" type="button" data-field="fillHex" data-color-trigger>
                <span class="swatch" style="background:${hexOpacityToRgba(d.fillHex || '#FFFFFF', d.fillOpacity ?? 0)}"></span>
              </button>
              <input class="text-input" type="text" value="${d.fillHex || ''}" data-field="fillHex" />
              <input class="text-input opacity-input" type="text" value="${d.fillOpacity ?? 0}" data-field="fillOpacity" inputmode="numeric" />
            </div>
          </div>

          <!-- 描边 -->
          <div class="section">
            <p class="section-title">描边</p>
            <div class="field-row">
              <button class="color-button" type="button" data-field="strokeHex" data-color-trigger>
                <span class="swatch" style="background:${hexOpacityToRgba(d.strokeHex || '#000000', d.strokeOpacity ?? 0)}"></span>
              </button>
              <input class="text-input" type="text" value="${d.strokeHex || ''}" data-field="strokeHex" />
              <input class="text-input opacity-input" type="text" value="${d.strokeOpacity ?? 0}" data-field="strokeOpacity" inputmode="numeric" />
            </div>
            <div class="field-row two-col">
              <div class="field"><span class="field-icon">▢</span><input class="text-input" type="text" value="${d.strokeWidth || ''}" data-field="strokeWidth" inputmode="numeric" placeholder="宽度" /></div>
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
                <span class="swatch" style="background:${hexOpacityToRgba(d.shadowHex || '#000000', d.shadowOpacity ?? 0)}"></span>
              </button>
              <input class="text-input" type="text" value="${d.shadowHex || ''}" data-field="shadowHex" />
              <input class="text-input opacity-input" type="text" value="${d.shadowOpacity ?? 0}" data-field="shadowOpacity" inputmode="numeric" />
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
      // 滚动样式面板时关闭 token 选择面板
      const panelBody = this._shadow.querySelector('.panel-body');
      if (panelBody) {
        panelBody.addEventListener('scroll', () => this._closeTokenPanel());
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
      // Liaison 式宽高交互：数值输入（blur/Enter 自动回 fixed 模式 + commit）+ 模式 select（commit）
      const sizeFields = ['width', 'height'];
      sizeFields.forEach(field => {
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
      // 模式 select change：根据模式直接改 width/height 的 CSS 值（fixed=保留数值 / auto=auto / fill=100%）
      this._shadow.querySelectorAll('[data-field="widthMode"], [data-field="heightMode"]').forEach(sel => {
        sel.addEventListener('change', () => {
          const modeField = sel.dataset.field; // widthMode / heightMode
          const axis = modeField.replace(/Mode$/, ''); // width / height
          this._updateSizeModeTrigger(axis);
          const mode = sel.value;
          const input = this._shadow.querySelector(`[data-field="${axis}"]`);
          if (mode === 'auto') {
            this._onFieldChange(axis, 'auto');
            if (input) input.value = 'auto';
          } else if (mode === 'fill') {
            this._onFieldChange(axis, '100%');
            if (input) input.value = '100%';
          } else if (input) {
            // fixed：若之前是 auto/100%，清空让用户重填数值
            const cur = String(input.value || '').trim();
            if (/^(auto|100%)$/.test(cur)) input.value = '';
          }
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
          if (this._tokenPanel.open && this._tokenPanel.type === type) {
            this._closeTokenPanel();
          } else {
            this._openTokenPanel(btn, type);
          }
        });
      });
    }

    _onFieldChange(field, value) {
      if (!this._targetEl || !this._data) return;
      this._data[field] = value;
      // 伪元素目标：编辑通过注入 <head> 的样式规则生效，property 写为 css-property
      if (this._target) {
        const cssProp = this._fieldToCssProp(field);
        const cssVal = this._fieldToCssValue(field);
        applyPseudoStyle(this._selector, this._target, cssProp, cssVal);
        bus.emit('style-change', {
          selector: this._selector,
          target: this._target,
          elementTag: this._targetEl.tagName.toLowerCase(),
          elementText: (this._targetEl.textContent || '').trim().substring(0, 50),
          elementClass: (this._targetEl.className && typeof this._targetEl.className === 'string')
            ? this._targetEl.className.trim().split(/\s+/).filter(c => c && !c.startsWith('wt-') && !c.startsWith('wego-') && !c.startsWith('data-wt'))[0] || ''
            : '',
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
        // 记录变更
        bus.emit('style-change', {
          selector: this._selector,
          elementTag: this._targetEl.tagName.toLowerCase(),
          elementText: (this._targetEl.textContent || '').trim().substring(0, 50),
          elementClass: (this._targetEl.className && typeof this._targetEl.className === 'string')
            ? this._targetEl.className.trim().split(/\s+/).filter(c => c && !c.startsWith('wt-') && !c.startsWith('wego-') && !c.startsWith('data-wt'))[0] || ''
            : '',
          property: result.property,
          oldValue: result.oldValue,
          newValue: result.newValue,
          el: this._targetEl,
        });
      }
      // 更新 UI（按钮 active 态等）
      this._updateActiveStates();
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
          const op = d.fillOpacity ?? 0;
          return op > 0 ? hexOpacityToRgba(hex, op) : 'transparent';
        }
        case 'strokeHex':
        case 'strokeOpacity':
        case 'strokeWidth': {
          const hex = d.strokeHex || '#000000';
          const op = d.strokeOpacity ?? 0;
          const w = num(d.strokeWidth);
          return op > 0 && w > 0 ? `${w}px solid ${hexOpacityToRgba(hex, op)}` : 'none';
        }
        case 'strokePosition':
          return d.strokePosition === 'inside' ? `inset 0 0 0 ${num(d.strokeWidth) || 1}px ${hexOpacityToRgba(d.strokeHex || '#000000', d.strokeOpacity ?? 100)}` : 'none';
        case 'shadowHex':
        case 'shadowOpacity':
        case 'shadowX':
        case 'shadowY':
        case 'shadowBlur':
        case 'shadowSpread':
        case 'shadowInset': {
          const hex = d.shadowHex || '#000000';
          const op = d.shadowOpacity ?? 0;
          const x = num(d.shadowX);
          const y = num(d.shadowY);
          const blur = num(d.shadowBlur);
          const spread = num(d.shadowSpread);
          const inset = d.shadowInset === true || d.shadowInset === 'true';
          if (op > 0 && (blur > 0 || x !== 0 || y !== 0 || spread !== 0)) {
            return `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${hexOpacityToRgba(hex, op)}`;
          }
          return 'none';
        }
        case 'width':
        case 'height':
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
        this._showToast('已拦截：' + guard.reason);
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
          const out = SEM.test(String(value).trim()) ? value.trim() : (isNaN(numVal) ? '' : numVal + 'px');
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
        case 'fontSize': {
          const oldValue = cs().fontSize;
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
            const computedAfter = getComputedStyle(el).color;
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
        }
        case 'textAlign': {
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
          const opacity = this._data.strokeOpacity ?? 0;
          const width = parseFloat(this._data.strokeWidth) || 0;
          const color = opacity > 0 && width > 0 ? hexOpacityToRgba(hex, opacity) : 'transparent';
          el.style.borderWidth = width > 0 ? width + 'px' : '';
          el.style.borderStyle = width > 0 ? 'solid' : '';
          el.style.borderColor = color;
          return { property: 'border', oldValue, newValue: width > 0 ? `${width}px solid ${color}` : '' };
        }
        case 'strokePosition': {
          const oldValue = cs().boxShadow;
          if (value === 'inside') {
            el.style.boxShadow = 'inset 0 0 0 ' + (parseFloat(this._data.strokeWidth) || 1) + 'px ' + hexOpacityToRgba(this._data.strokeHex || '#000000', this._data.strokeOpacity ?? 100);
          } else {
            el.style.boxShadow = '';
          }
          return { property: 'box-shadow', oldValue, newValue: value === 'inside' ? el.style.boxShadow : '' };
        }
        case 'shadowHex':
        case 'shadowOpacity':
        case 'shadowX':
        case 'shadowY':
        case 'shadowBlur':
        case 'shadowSpread':
        case 'shadowInset': {
          const oldValue = cs().boxShadow;
          const hex = this._data.shadowHex || '#000000';
          const opacity = this._data.shadowOpacity ?? 0;
          const x = parseFloat(this._data.shadowX) || 0;
          const y = parseFloat(this._data.shadowY) || 0;
          const blur = parseFloat(this._data.shadowBlur) || 0;
          const spread = parseFloat(this._data.shadowSpread) || 0;
          const inset = this._data.shadowInset === true || this._data.shadowInset === 'true';
          if (opacity > 0 && (blur > 0 || x !== 0 || y !== 0 || spread !== 0)) {
            const color = hexOpacityToRgba(hex, opacity);
            const shadowStr = `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}`;
            el.style.boxShadow = shadowStr;
            return { property: 'box-shadow', oldValue, newValue: shadowStr };
          } else {
            el.style.boxShadow = 'none';
            return { property: 'box-shadow', oldValue, newValue: 'none' };
          }
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
      // 颜色 Token 按钮状态 + opacity 输入框联动
      const colorTokenBtn = this._shadow.querySelector('[data-token-trigger="color"]');
      const colorOpacityInput = this._shadow.querySelector('[data-field="colorOpacity"]');
      const colorVal = d.colorHex || '';
      if (colorTokenBtn) {
        const isTok = isTokenValue(colorVal);
        colorTokenBtn.classList.toggle('active', isTok);
        if (isTok) {
          const tokName = colorVal.match(/var\((--[^)]+)\)/)[1].replace(/^--/, '');
          if (colorTokenBtn.textContent.trim() !== tokName) colorTokenBtn.textContent = tokName;
        } else {
          if (colorTokenBtn.textContent.trim() !== 'T') colorTokenBtn.textContent = 'T';
        }
      }
      if (colorOpacityInput) {
        colorOpacityInput.disabled = isTokenValue(colorVal);
      }
      // 颜色输入框值回显（统一同步，不依赖焦点状态）
      const colorInput = this._shadow.querySelector('[data-field="colorHex"]');
      if (colorInput) {
        if (colorInput.value !== colorVal) {
          colorInput.value = colorVal;
        }
      } else {
      }
      // 对齐矩阵
      this._shadow.querySelectorAll('[data-align-preset]').forEach(btn => {
        const [jc, ai] = btn.dataset.alignPreset.split('|');
        btn.classList.toggle('active', jc === d.justifyContent && ai === d.alignItems);
      });
    }

    // ── Token 选择面板 ──────────────────────────────────────
    _openTokenPanel(trigger, type) {
      const panel = this._shadow.querySelector('[data-token-panel]');
      if (!panel) return;
      this._tokenPanel = { open: true, type, trigger };
      this._renderTokenList(type);
      panel.classList.add('open');
      // 定位到触发按钮下方，下方空间不够时自动上翻
      const rect = trigger.getBoundingClientRect();
      const panelRect = this.getBoundingClientRect();
      const panelWidth = 260;
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
      const currentVal = this._data ? (this._data.colorHex || '') : '';
      const tooltip = this._shadow.querySelector('[data-token-tooltip]');
      let html = '';
      if (type === 'color') {
        COLOR_TOKEN_GROUPS.forEach(group => {
          html += `<div class="token-group-title">${group.label}</div>`;
          html += `<div class="token-grid">`;
          group.tokens.forEach(token => {
            const varExpr = `var(${token.var})`;
            const selected = currentVal === varExpr;
            const color = resolveCssValue(varExpr, 'color') || 'transparent';
            html += `
              <button class="token-item ${selected ? 'selected' : ''}" type="button"
                data-token-value="${varExpr}" data-token-name="${token.name}"
                data-token-var="${token.var}" data-token-desc="${token.label} · ${token.desc || ''}">
                <span class="token-swatch" style="background:${color}"></span>
              </button>`;
          });
          html += `</div>`;
        });
      }
      listEl.innerHTML = html;
      // 绑定 token 项事件：click 选择 + mouseenter/mouseleave 显示 tooltip
      listEl.querySelectorAll('.token-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const value = item.dataset.tokenValue;
          if (this._tokenPanel.type === 'color') {
            this._onFieldChange('colorHex', value);
          }
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
      window.addEventListener('hashchange', () => {
        state.currentRoute = getCurrentRoute();
        this._loadChanges();
      });
      this._loadChanges();
      // 暴露失败注入 API（兼容现有场景代码）
      window.WegoApp = window.WegoApp || {};
      window.WegoApp.faultInjection = {
        isEnabled: (key) => !!this._faultState[key],
        setEnabled: (key, on) => { this._faultState[key] = !!on; this._persistFaultState(); this._updateFaultSwitches(); this._updateToolbarState(); },
      };
    }

    disconnectedCallback() {
      this._cleanupDrag();
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
            padding: 4px;
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
          .collapse-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.92); }

          .toolbar-main {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            min-width: 0;
            overflow: hidden;
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
          .tool-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.92); }
          .tool-btn[data-active="true"] { background: rgba(255,255,255,0.1); color: #fff; }
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

          .count-btn {
            min-width: 40px;
            height: 40px;
            padding: 0 10px;
            border: 0;
            border-radius: 999px;
            background: rgba(255,255,255,0.08);
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
          }
          .count-btn:hover { background: rgba(255,255,255,0.14); }
          .count-btn .count-icon { font-size: 14px; }

          .divider {
            width: 1px;
            height: 24px;
            margin: 0 6px;
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

          /* 子面板 */
          .subpanel {
            position: absolute;
            top: calc(100% + 8px);
            width: 180px;
            padding: 8px;
            border-radius: 12px;
            background: rgba(30, 30, 30, 0.82);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(18px) saturate(145%);
            -webkit-backdrop-filter: blur(18px) saturate(145%);
            display: none;
            z-index: 10000;
          }
          .subpanel.is-open { display: block; }
          .subpanel-title {
            font-size: 12px;
            color: rgba(255,255,255,0.5);
            padding: 4px 8px 8px;
            font-weight: 600;
          }
          .subpanel-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 9px 8px;
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
        </style>
        <div class="toolbar-container is-collapsed" data-toolbar>
          <div class="toolbar-clip">
            <!-- 收起态：圆形按钮 -->
            <button class="fab-btn" data-fab-btn data-has-indicator="false">
              <span>◎</span>
              <span class="fab-dot"></span>
            </button>
            <!-- 展开态：工具条内容 -->
            <div class="toolbar-main" data-toolbar-main style="display:none;">
              <button class="collapse-btn" data-collapse-btn title="收起">‹</button>
              <button class="tool-btn" data-tool="walkthrough" data-active="false" title="走查模式">
                <span>◆</span>
              </button>
              <button class="tool-btn" data-tool="datamock" data-active="false" title="数据模拟">
                <span>⚠</span>
                <span class="badge-dot"></span>
              </button>
              <div class="divider"></div>
              <button class="count-btn" data-tool="overview" title="配置列表">
                <span class="count-value" data-count-value>0</span>
                <span class="count-icon">≡</span>
              </button>
              <button class="tool-btn" data-tool="more" title="更多">
                <span>⋯</span>
              </button>
            </div>
          </div>
        </div>
        <!-- 数据模拟子面板 -->
        <div class="subpanel" data-subpanel="datamock">
          <div class="subpanel-title">数据模拟</div>
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
        <!-- 更多菜单 -->
        <div class="subpanel" data-subpanel="more">
          <div class="subpanel-title">更多</div>
          <button class="subpanel-item" data-nav="scene-manager">
            <span>场景管理</span>
            <span class="subpanel-arrow">›</span>
          </button>
          <button class="subpanel-item" data-nav="component-preview">
            <span>组件库</span>
            <span class="subpanel-arrow">›</span>
          </button>
        </div>
        <!-- 子组件（走查模式相关） -->
        <wego-wt-highlight hidden></wego-wt-highlight>
        <wego-wt-style-panel hidden></wego-wt-style-panel>
        <wego-wt-color-picker hidden></wego-wt-color-picker>
        <wego-wt-overview-panel hidden></wego-wt-overview-panel>
        <wego-wt-toast></wego-wt-toast>
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
      this._components.countValue = this._shadow.querySelector('[data-count-value]');
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
      // 点击外部关闭子面板和配置列表
      document.addEventListener('pointerdown', (e) => {
        if (!e.target.closest) return;
        if (isWalkthroughElement(e.target)) return; // 工具自身 UI 内的 pointerdown 不关闭
        if (!e.target.closest('wego-walkthrough')) {
          this._closeSubpanels();
          if (this._components.overviewPanel && !this._components.overviewPanel.hasAttribute('hidden')) {
            this._components.overviewPanel.close();
          }
        }
      }, true);

      // 事件总线
      bus.on('style-change', (change) => this._recordChange(change));
      bus.on('open-color-picker', ({ trigger, hex, opacity, callback }) => {
        this._components.colorPicker.open(trigger, hex, opacity, callback);
      });
      bus.on('close-style-panel', () => this._clearSelection());
      bus.on('close-overview', () => this._components.overviewPanel.close());
      bus.on('jump-to-element', ({ selector }) => this._jumpToElement(selector));
      bus.on('delete-change', ({ id }) => this._deleteChange(id));
      bus.on('reset-changes', () => this._resetChanges());
      bus.on('toast', ({ message }) => this._showToast(message));
      bus.on('element-selected', ({ element, selector, target }) => {
        this._components.stylePanel.openForElement(element, selector, target || '');
      });
      bus.on('element-deselected', () => this._components.stylePanel.close());
    }

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
        }
        if (this._drag.moved) {
          ev.preventDefault();
          const x = Math.max(0, Math.min(this._drag.origX + dx, window.innerWidth - this.offsetWidth));
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
          this._savePosition();
          this.style.transition = '';
          this.getBoundingClientRect();
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
            const x = Math.max(0, Math.min(p.x, window.innerWidth - 48));
            const y = Math.max(0, Math.min(p.y, window.innerHeight - 48));
            this.style.left = x + 'px';
            this.style.top = y + 'px';
            this.style.right = 'auto';
            this.style.bottom = 'auto';
            return;
          }
        }
      } catch (e) {}
      // 默认位置：左下角
      this.style.left = '12px';
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
        // 收起按钮箭头方向：右侧展开(row-reverse，按钮在最右)显示向右箭头›，左侧展开显示向左箭头‹
        const collapseBtn = this._shadow.querySelector('[data-collapse-btn]');
        if (collapseBtn) collapseBtn.textContent = dir === 'left' ? '›' : '‹';
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

      this._updateToolbarState();
    }



    // ── 工具条按钮 ────────────────────────────────────────
    _onToolClick(tool, btn) {
      switch (tool) {
        case 'walkthrough':
          this._closeAllPanels();
          this._setWalkthroughMode(!this._walkthroughMode);
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
      if (enabled) {
        document.body.setAttribute('data-walkthrough-mode', 'true');
        this._bindTouchEvents();
      } else {
        document.body.removeAttribute('data-walkthrough-mode');
        this._unbindTouchEvents();
        this._clearSelection();
      }
      this._updateToolbarState();
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

    _selectElement(el) {
      this._clearSelection();
      state.selectedElement = el;
      this._components.highlight.setMode('selected');
      this._components.highlight.removeAttribute('hidden');
      this._components.highlight.showForElement(el);
      const selector = generateSelector(el);
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
      try {
        const el = document.querySelector(selector);
        if (el) {
          this._components.overviewPanel.close();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            if (this._walkthroughMode) this._selectElement(el);
          }, 300);
        }
      } catch (e) {}
    }

    // ── 配置列表 ──────────────────────────────────────────
    _openOverview() {
      this._closeSubpanels();
      const countBtn = this._shadow.querySelector('[data-tool="overview"]');
      this._components.overviewPanel.open(state.changes, state.currentRoute, countBtn);
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
    _recordChange(change) {
      const snapKey = state.currentRoute + '::' + change.selector;
      const original = state.originalStyles[snapKey];
      const isPseudo = !!change.target;
      const matchExisting = (c) => c.selector === change.selector && c.property === change.property && (c.target || '') === (change.target || '');
      // 改回原始值 = 净变更为零，删除该属性的变更记录（而非保留 X→X）
      if (original && change.property in original && change.newValue === original[change.property]) {
        const existing = state.changes.find(matchExisting);
        if (existing) {
          this._revertChange(existing);
          state.changes = state.changes.filter(c => c.id !== existing.id);
          this._saveChanges();
          this._updateChangeCount();
          if (this._components.overviewPanel && !this._components.overviewPanel.hasAttribute('hidden')) {
            this._components.overviewPanel.refresh(state.changes, state.currentRoute);
          }
        }
        return;
      }
      const existing = state.changes.find(matchExisting);
      if (existing) {
        existing.newValue = change.newValue;
        existing.timestamp = Date.now();
        existing.elementText = change.elementText;
        Object.assign(existing, deriveIntent(existing, change.el));
      } else {
        const rec = {
          id: 'change-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          selector: change.selector,
          target: change.target || '',
          elementTag: change.elementTag,
          elementText: change.elementText,
          property: change.property,
          oldValue: change.oldValue,
          newValue: change.newValue,
          timestamp: Date.now(),
        };
        Object.assign(rec, deriveIntent(rec, change.el));
        state.changes.push(rec);
      }
      this._saveChanges();
      this._updateChangeCount();
      if (this._components.overviewPanel && !this._components.overviewPanel.hasAttribute('hidden')) {
        this._components.overviewPanel.refresh(state.changes, state.currentRoute);
      }
    }

    /** 还原单条变更（本体=清 inline；伪元素=清注入规则） */
    _revertChange(change) {
      if (change.target) {
        applyPseudoStyle(change.selector, change.target, change.property, '');
        return;
      }
      try {
        const el = document.querySelector(change.selector);
        if (el) el.style[change.property] = '';
      } catch (e) {}
    }

    _deleteChange(id) {
      const change = state.changes.find(c => c.id === id);
      if (change) {
        this._revertChange(change);
        state.changes = state.changes.filter(c => c.id !== id);
        this._saveChanges();
        this._updateChangeCount();
        this._components.overviewPanel.refresh(state.changes, state.currentRoute);
      }
    }

    _resetChanges() {
      if (state.changes.length === 0) {
        this._showToast('当前没有修改');
        return;
      }
      state.changes.forEach(c => this._revertChange(c));
      state.changes = [];
      this._saveChanges();
      this._updateChangeCount();
      this._showToast('已重置所有修改');
      if (this._components.overviewPanel && !this._components.overviewPanel.hasAttribute('hidden')) {
        this._components.overviewPanel.refresh(state.changes, state.currentRoute);
      }
    }

    _loadChanges() {
      try {
        const key = `wego.walkthrough.data.${state.currentRoute}`;
        const raw = localStorage.getItem(key);
        state.changes = raw ? (JSON.parse(raw).changes || []) : [];
        // 同步持久化的伪元素变更到注入规则，刷新后保持生效
        state.changes.forEach(c => {
          if (c.target && c.property) {
            applyPseudoStyle(c.selector, c.target, c.property, c.newValue || '');
          }
        });
        rebuildPseudoStyleElement();
        this._updateChangeCount();
      } catch (e) {}
    }

    _saveChanges() {
      try {
        const key = `wego.walkthrough.data.${state.currentRoute}`;
        localStorage.setItem(key, JSON.stringify({
          sceneRoute: state.currentRoute,
          lastModified: Date.now(),
          changes: state.changes,
        }));
      } catch (e) {}
    }

    _updateChangeCount() {
      const count = state.changes.length;
      if (this._components.countValue) this._components.countValue.textContent = count > 99 ? '99+' : count;
      // 收起态红点
      const hasIndicator = count > 0 || this._walkthroughMode || this._faultState.load || this._faultState.save || this._faultState['delete'] || this._faultState.slow;
      this._components.fabBtn.setAttribute('data-has-indicator', String(hasIndicator));
      // 走查模式按钮激活态
      const wtBtn = this._shadow.querySelector('[data-tool="walkthrough"]');
      if (wtBtn) wtBtn.setAttribute('data-active', String(this._walkthroughMode));
      // 数据模拟按钮激活态
      const dmBtn = this._shadow.querySelector('[data-tool="datamock"]');
      if (dmBtn) dmBtn.setAttribute('data-active', String(this._faultState.load || this._faultState.save || this._faultState['delete'] || this._faultState.slow));
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
    console.log('[Walkthrough] MVP initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
