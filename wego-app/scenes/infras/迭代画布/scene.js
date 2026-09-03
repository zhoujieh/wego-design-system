// 迭代画布 · 系统工具场景（MVP v2：iframe 平铺 + 真无限画布）
// 数据源：MVP 内置样例迭代（publish-product 发布产品），权威源后续接迭代目录 iteration.json
// 能力：
//  - 每个关键路径节点以 iframe 平铺真实页面（index.html#/routeId），横向排列 + 连线
//  - 无限画布：单指拖拽平移 + 双指捏合缩放 + 滚轮缩放 + 缩放控件（- / + / 适配）
//  - 范围区：纳入 included / 不纳入 excluded / 受影响场景

const iterationCanvasTemplate = `
  <section class="iter-canvas-page" data-surface-id="iteration-canvas" data-route-id="iteration-canvas" data-layout-mode="composed" data-bg="page">
    <div class="navbar iter-canvas-page__navbar" data-component-slug="navbar">
      <div class="navbar__body">
        <div class="navbar__left"><button type="button" class="navbar__left-btn" data-dom-id="iter-canvas-back" aria-label="返回"><i class="wego-iconfont-s icon-fanhui"></i></button></div>
        <div class="navbar__center"><span class="navbar__title">迭代画布</span></div>
        <div class="navbar__right"></div>
      </div>
    </div>
    <div class="iter-canvas-page__toolbar" data-region="toolbar">
      <div class="iter-canvas-page__zoomctl">
        <button type="button" class="iter-canvas-page__zb" data-action="zoom-out" aria-label="缩小">−</button>
        <span class="iter-canvas-page__zval" data-dom-id="zoom-value">100%</span>
        <button type="button" class="iter-canvas-page__zb" data-action="zoom-in" aria-label="放大">+</button>
        <button type="button" class="iter-canvas-page__zb" data-action="zoom-fit" aria-label="适配视图">适配</button>
      </div>
      <div class="iter-canvas-page__hint">拖动平移 · 双指缩放 · 点击连线看流程</div>
    </div>
    <div class="iter-canvas-page__viewport" data-region="viewport" data-touch-action="none">
      <div class="iter-canvas-page__world" data-region="world">
        <div class="iter-canvas-page__info" data-region="info"></div>
        <div class="iter-canvas-page__scope" data-region="scope"></div>
        <div class="iter-canvas-page__entry" data-region="entry"></div>
        <div class="iter-canvas-page__flows" data-region="flows"></div>
      </div>
    </div>
  </section>
`;

(function () {
  // ── MVP 样例迭代数据（取自 wego-app/scenes/shop/发布产品/_iterations/20260825-publish-product-发布产品/iteration.json）──
  var SAMPLE_ITERATION = {
    identity: {
      iteration_id: 'publish-product',
      title: '发布产品',
      date: '2026-08-25',
      primary_scene: '发布产品',
      related_scenes: []
    },
    status: 'prototyping',
    goal: '让店主在微购相册快速发布产品：录入产品名、售价、货号、规格、颜色、重量、库存、标签、来源，上传产品图片并设置可见范围，可选通过「帮卖分销」入口打开已有帮卖设置弹窗完成帮卖方式与加价规则设置；发布后新产品出现在动态流中，并支持后续重新编辑。',
    entry_points: [
      '动态流顶部「发布」入口：进入发布产品场景',
      '动态流或产品详情的「编辑」入口：进入重新编辑已发布产品'
    ],
    included: [
      '产品基础字段：产品名、商品简称、货号（可自动生成）',
      '价格字段：拿货价、售价、拼团价、批发价、打包价，各价格带「公开」可见切换',
      '多值字段：规格、颜色、标签、来源支持一次录入多个',
      '上传产品图片、设置可见范围（谁可以看）',
      '帮卖分销入口：点击打开已有帮卖设置弹窗，设置帮卖方式与加价规则',
      '发布后新产品出现在动态流（含「可帮卖」标识）',
      '支持后续重新编辑已发布产品'
    ],
    excluded: [
      '评论、点赞等社交互动',
      '帮卖 / 邀请帮卖的具体功能实现（帮卖设置弹窗复用已有，不下钻）',
      '真实后端接口与远程持久化（仅 localStorage）',
      '视频动态的播放行为'
    ],
    affected_scenes: ['发布产品'],
    affected_runtime: [],
    flows: [
      {
        id: 'publish-product',
        title: '发布产品',
        priority: 'P1',
        desc: '动态流「发布」入口 → 空状态 → 填写中 → 填完整 → 发布完成，新产品出现在动态流（按需求规格 empty-form / publish-success）',
        nodes: [
          { label: '动态流', routeId: 'album-product-feed', tab: 'dongtai',
            states: [{ name: '「发布」入口', sub: 'entry' }] },
          { label: '发布表单', routeId: 'publish-product',
            states: [{ name: '空状态', sub: 'empty-form' }] },
          { label: '发布表单', routeId: 'publish-product',
            states: [{ name: '填写中', sub: '录入基础字段',
              prepare: [
                { action: 'fill', selector: 'input[placeholder*="请输入产品名"]', value: '荷叶边方领短袖上衣' },
                { action: 'fill', selector: 'input[placeholder*="请输入售价"]', value: '139' },
                { action: 'fill', selector: 'input[placeholder*="请输入货号"]', value: 'HYB-012' }
              ] }] },
          { label: '发布表单', routeId: 'publish-product',
            states: [{ name: '填完整', sub: '全部字段已填写',
              prepare: [
                { action: 'fill', selector: 'input[placeholder*="请输入产品名"]', value: '荷叶边方领短袖上衣' },
                { action: 'fill', selector: 'input[placeholder*="请输入商品简称"]', value: '荷叶边方领短袖' },
                { action: 'fill', selector: 'input[placeholder*="请输入货号"]', value: 'HYB-012' },
                { action: 'fill', selector: 'input[placeholder*="请输入拿货价"]', value: '89' },
                { action: 'fill', selector: 'input[placeholder*="请输入售价"]', value: '139' },
                { action: 'fill', selector: 'input[placeholder*="请输入拼团价"]', value: '129' },
                { action: 'fill', selector: 'input[placeholder*="请输入批发价"]', value: '99' },
                { action: 'fill', selector: 'input[placeholder*="请输入打包价"]', value: '119' },
                { action: 'fill', selector: 'input[placeholder*="请输入库存"]', value: '200' },
                { action: 'fill', selector: 'input[placeholder*="请输入商品重量"]', value: '0.35' },
                { action: 'fill', selector: 'input[placeholder*="请输入运费模板"]', value: '包邮模板' },
                { action: 'fill', selector: 'input[placeholder*="请输入备注"]', value: '新款短袖，棉质亲肤' },
                { action: 'fill', selector: 'input[placeholder*="请输入子账号"]', value: '小助手' }
              ] }] },
          { label: '动态流', routeId: 'album-product-feed', tab: 'dongtai',
            states: [{ name: '发布完成', sub: 'publish-success · 新产品出现' }] }
        ]
      },
      {
        id: 'resale-setup',
        title: '发布并开启帮卖（子流程）',
        priority: 'P1',
        desc: '发布表单点击「帮卖分销」→ 蒙层下发布页 + 蒙层上帮卖设置弹窗 → 完成回到表单 → 提交后动态流带「可帮卖」标识（resale-popup-open）',
        nodes: [
          { label: '发布表单', routeId: 'publish-product',
            states: [{ name: '点击「帮卖分销」', sub: 'resale 入口' }] },
          { label: '发布页 + 帮卖弹窗', routeId: 'publish-product',
            overlay: { type: 'resale', sampleKey: 'first-resale-free-single' },
            states: [{ name: '帮卖设置弹窗', sub: 'resale-popup-open · 蒙层下为发布页' }] },
          { label: '发布表单', routeId: 'publish-product',
            states: [{ name: '完成回到表单', sub: '帮卖已设置' }] },
          { label: '动态流', routeId: 'album-product-feed', tab: 'dongtai',
            states: [{ name: '带「可帮卖」标识', sub: '发布成功' }] }
        ]
      },
      {
        id: 'product-edit',
        title: '重新编辑',
        priority: 'P1',
        desc: '动态流「编辑」入口 → 回显已填字段 → 修改保存 → 动态流同步更新（edit-form）',
        nodes: [
          { label: '动态流', routeId: 'album-product-feed', tab: 'dongtai',
            states: [{ name: '「编辑」入口', sub: 'edit' }] },
          { label: '发布表单', routeId: 'publish-product',
            states: [{ name: '回显已填字段', sub: 'edit-form' }] },
          { label: '发布表单', routeId: 'publish-product',
            states: [{ name: '修改后保存', sub: 'edit' }] },
          { label: '动态流', routeId: 'album-product-feed', tab: 'dongtai',
            states: [{ name: '对应动态同步更新', sub: 'edit' }] }
        ]
      },
      {
        id: 'multi-value',
        title: '多值字段录入',
        priority: '—',
        desc: '规格 / 颜色 / 标签 / 来源 → 一次录入多个值 → 实时展示已录入项 → 可增删（multi-value-entry）',
        nodes: [
          { label: '发布表单', routeId: 'publish-product',
            states: [{ name: '多值字段录入', sub: 'multi-value-entry' }] },
          { label: '发布表单', routeId: 'publish-product',
            states: [{ name: '已录入项实时展示', sub: 'multi-value-entry' }] }
        ]
      }
    ]
  };

  var STATUS_TEXT = { 'in-development': '开发中', prototyping: '原型中', frozen: '已冻结' };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\x22/g, '&quot;')
      .replace(/\x27/g, '&#39;');
  }

  function infoMarkup(it) {
    var status = STATUS_TEXT[it.status] || it.status;
    var related = (it.identity.related_scenes || []).length ? it.identity.related_scenes.join('、') : '—';
    return ''
      + '<div class="iter-canvas-page__card iter-canvas-page__card--head">'
      +   '<div class="iter-canvas-page__card-title-row">'
      +     '<span class="iter-canvas-page__card-title">' + esc(it.identity.title) + '</span>'
      +     '<span class="iter-canvas-page__status iter-canvas-page__status--' + esc(it.status) + '">' + esc(status) + '</span>'
      +   '</div>'
      +   '<div class="iter-canvas-page__idline">' + esc(it.identity.iteration_id) + ' · ' + esc(it.identity.date) + '</div>'
      +   '<div class="iter-canvas-page__goal">' + esc(it.goal) + '</div>'
      +   '<div class="iter-canvas-page__meta">'
      +     '<span>主场景：<b>' + esc(it.identity.primary_scene) + '</b></span>'
      +     '<span>关联场景：' + esc(related) + '</span>'
      +     '<span>受影响：' + esc((it.affected_scenes || []).join('、') || '—') + '</span>'
      +   '</div>'
      + '</div>';
  }

  function scopeMarkup(it) {
    var inc = (it.included || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    var exc = (it.excluded || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    return ''
      + '<div class="iter-canvas-page__card iter-canvas-page__card--scope">'
      +   '<div class="iter-canvas-page__card-subtitle">本次范围</div>'
      +   '<div class="iter-canvas-page__scope-cols">'
      +     '<div class="iter-canvas-page__scope-col iter-canvas-page__scope-col--inc"><div class="iter-canvas-page__scope-head">纳入范围 included</div><ul class="iter-canvas-page__scope-list">' + (inc || '<li>—</li>') + '</ul></div>'
      +     '<div class="iter-canvas-page__scope-col iter-canvas-page__scope-col--exc"><div class="iter-canvas-page__scope-head">不纳入 excluded</div><ul class="iter-canvas-page__scope-list">' + (exc || '<li>—</li>') + '</ul></div>'
      +   '</div>'
      + '</div>';
  }

  function entryMarkup(it) {
    var entries = (it.entry_points || []).map(function (s, i) {
      return '<div class="iter-canvas-page__entry-item"><span class="iter-canvas-page__entry-idx">' + (i + 1) + '</span><span class="iter-canvas-page__entry-text">' + esc(s) + '</span></div>';
    }).join('');
    return ''
      + '<div class="iter-canvas-page__card iter-canvas-page__card--entry">'
      +   '<div class="iter-canvas-page__card-subtitle">迭代入口 Entry Points</div>'
      +   (entries || '<div class="iter-canvas-page__entry-item">—</div>')
      + '</div>';
  }

  // 每个流程 = 一排"功能节点"，节点内部是多个状态块横排，节点之间连线
  // 返回 { html, blocks }；blocks 供渲染阶段按序找到每个状态块的 routeId 与 prepare
  function flowMarkup(flow, flowIdx) {
    var blocks = [];
    var nodeHtml = flow.nodes.map(function (node, nodeIdx) {
      var states = (node.states && node.states.length) ? node.states : [{ name: node.sub || node.label, routeId: node.routeId }];
      var stateHtml = states.map(function (st, si) {
        var routeId = st.routeId || node.routeId;
        var key = 'f' + flowIdx + '-n' + nodeIdx + '-s' + si;
        blocks.push({ key: key, routeId: routeId, prepare: st.prepare || [], overlay: node.overlay || null, tab: node.tab || null });
        return ''
          + '<div class="iter-canvas-page__state">'
          +   '<div class="iter-canvas-page__state-label">' + esc(st.name) + '</div>'
          +   '<div class="iter-canvas-page__frame-wrap">'
          +     '<div class="iter-canvas-page__frame-label">'
          +       '<span class="iter-canvas-page__frame-name">' + esc(node.label) + '</span>'
          +       (st.sub ? '<span class="iter-canvas-page__frame-sub">' + esc(st.sub) + '</span>' : '')
          +     '</div>'
          +     '<div class="iter-canvas-page__scene-host" data-route-id="' + esc(routeId) + '"></div>'
          +     '<div class="iter-canvas-page__frame-route">' + esc(routeId) + '</div>'
          +     '<div class="iter-canvas-page__resize-handle" data-role="resize"><i class="wego-iconfont-s icon-tuodong"></i>拖拽调高度</div>'
          +   '</div>'
          + '</div>';
      }).join('');
      return ''
        + '<div class="iter-canvas-page__node">'
        +   '<div class="iter-canvas-page__node-states">' + stateHtml + '</div>'
        +   (nodeIdx < flow.nodes.length - 1 ? '<div class="iter-canvas-page__link" aria-hidden="true"><i class="wego-iconfont-s icon-youjiantou16"></i></div>' : '')
        + '</div>';
    }).join('');
    return {
      html: ''
        + '<div class="iter-canvas-page__flow">'
        +   '<div class="iter-canvas-page__flow-head">'
        +     '<span class="iter-canvas-page__flow-priority iter-canvas-page__flow-priority--' + (flow.priority === 'P1' ? 'p1' : 'p0') + '">' + esc(flow.priority) + '</span>'
        +     '<span class="iter-canvas-page__flow-title">' + esc(flow.title) + '</span>'
        +   '</div>'
        +   '<div class="iter-canvas-page__flow-desc">' + esc(flow.desc) + '</div>'
        +   '<div class="iter-canvas-page__flow-chain">' + nodeHtml + '</div>'
        + '</div>',
      blocks: blocks
    };
  }

  // ── 状态脚本：在渲染出的真实场景 DOM 上执行指令，驱动到目标状态 ──
  function runPrepare(host, prepare) {
    (prepare || []).forEach(function (step) {
      if (!step || !step.action) return;
      try {
        if (step.action === 'fill') { prepareFill(host, step); }
        else if (step.action === 'click') { prepareClick(host, step); }
        else if (step.action === 'scrollTo') { prepareScrollTo(host, step); }
        else { console.warn('[iter-canvas] unknown prepare action:', step.action); }
      } catch (e) {
        console.warn('[iter-canvas] prepare step failed:', step, e);
      }
    });
  }

  function prepareFill(host, step) {
    var el = host.querySelector(step.selector);
    if (!el) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      var proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, step.value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      el.textContent = step.value;
    }
  }

  function prepareClick(host, step) {
    var el = host.querySelector(step.selector);
    if (el) el.click();
  }

  function prepareScrollTo(host, step) {
    var el = host.querySelector(step.selector);
    if (!el) return;
    var h = host.getBoundingClientRect().height || host.clientHeight;
    var top = el.getBoundingClientRect().top - host.getBoundingClientRect().top;
    host.scrollTop = top - (step.pos === 'top' ? 0 : Math.max(0, (h / 2) - 40));
  }

  // 将迭代内每个状态块渲染到画布对应容器（真实场景 DOM，页面保持可交互）
  // 每个状态块独立渲染一次（各自绑定事件），渲染后执行 prepare 驱动到目标状态
  // 关键：运行时直接调用场景渲染，业务场景改动后画布重新加载即为最新内容（实时投影，非快照）
  function renderSceneIntoHosts(root, blocks) {
    var hosts = Array.prototype.slice.call(root.querySelectorAll('.iter-canvas-page__scene-host'));
    hosts.forEach(function (host, i) {
      var block = blocks[i];
      if (!block) return;
      host.classList.add('iter-canvas-page__scene-host--loading');
      window.WegoApp.renderSceneTo(block.routeId, host).then(function () {
        host.classList.remove('iter-canvas-page__scene-host--loading');
        host.classList.add('iter-canvas-page__scene-host--ready');
        if (block.tab) mountBottomTab(host, block.tab);
        if (block.overlay) mountOverlay(host, block.overlay);
        runPrepare(host, block.prepare);
      });
    });
  }

  // ── 底部全局导航（host-tab 页面如动态流）：全局 bottom-nav 属宿主外壳，
  //    不随场景模板渲染，画布平铺时按需补在画板底部 ──
  var BOTTOM_TABS = [
    { id: 'dongtai', label: '动态', icon: 'tab-dongtai.svg', iconActive: 'tab-active-dongtai.svg' },
    { id: 'haoyou', label: '好友', icon: 'tab-haoyou.svg', iconActive: 'tab-active-haoyou.svg' },
    { id: 'workspace', label: '工作台', icon: 'tab-gongzuotai.svg', iconActive: 'tab-active-gongzuotai.svg' },
    { id: 'xiaoxi', label: '消息', icon: 'tab-xiaoxi.svg', iconActive: 'tab-active-xiaoxi.svg' },
    { id: 'my', label: '我的', icon: 'tab-wode.svg', iconActive: 'tab-active-wode.svg' }
  ];

  function bottomNavHtml(activeId) {
    return '<nav class="bottom-nav" aria-label="底部导航">'
      + BOTTOM_TABS.map(function (t) {
        var active = t.id === activeId;
        return '<button type="button" class="bottom-nav__item' + (active ? ' active' : '') + '" aria-label="' + t.label + '">'
          + '<span class="bottom-nav__icon"><img src="./lib/assets/icons/' + (active ? t.iconActive : t.icon) + '" alt="" /></span>'
          + '<span class="bottom-nav__label">' + t.label + '</span>'
          + '</button>';
      }).join('')
      + '</nav>';
  }

  function mountBottomTab(host, tabId) {
    if (host.querySelector('.bottom-nav')) return;
    host.classList.add('iter-canvas-page__scene-host--tabbed');
    host.insertAdjacentHTML('beforeend', bottomNavHtml(tabId));
  }

  // ── 子流程弹窗平铺：用伪造 ctx 复用真实弹窗运行时，渲染出「蒙层下发布页 + 蒙层上弹窗」的真实层叠 ──
  var RESALE_SAMPLES = {
    'first-resale-free-single': {
      key: 'first-resale-free-single',
      label: '初次帮卖 · 自由定价 · 单一价格',
      group: '自由定价',
      badge: { text: '自由定价', type: 'free' },
      desc: '供货价178.5 · 默认加价+30 · 售价208.5',
      product_id: 'prod-clothing-001',
      distribution_type: 1,
      supply_price: 178.5,
      skus: [{ id: 'sku-1', supply_price: 178.5 }],
      distribution_config: { amountType: 1, value: 30 },
      my_item: false,
      from_page: 'normal'
    }
  };

  function noop() {}

  function mountOverlay(host, overlay) {
    if (!window.WegoApp || typeof window.WegoApp.openAgentResalePopup !== 'function') return;
    var sample = RESALE_SAMPLES[overlay.sampleKey];
    if (!sample) return;
    // 伪造一个宿主 ctx：openSheet 把弹窗渲染进当前画板（而非全局 overlay 层），
    // 其余动作（关闭/提示/对话框）在画布平铺态安全忽略
    var fakeCtx = {
      openSheet: function (template, opts) {
        var temp = document.createElement('div');
        temp.innerHTML = template;
        var root = temp.firstElementChild;
        if (!root) return;
        if (root.matches('.actionsheet, .modal')) root.setAttribute('data-state', 'open');
        host.appendChild(root);
        if (opts && typeof opts.init === 'function') {
          opts.init({ root: root, closeOverlay: noop, toast: noop, back: noop });
        }
      },
      openFullScreenModal: function (template, opts) { fakeCtx.openSheet(template, opts); },
      closeOverlay: noop,
      toast: noop,
      dialog: noop
    };
    window.WegoApp.openAgentResalePopup(fakeCtx, { sample: sample, mode: 'resale' });
  }

  function deactivateHost(host) {
    host.classList.remove('iter-canvas-page__scene-host--active');
    var wrap = host.closest('.iter-canvas-page__frame-wrap');
    if (wrap) wrap.classList.remove('iter-canvas-page__frame-wrap--active');
  }

  function activateHost(host) {
    host.classList.add('iter-canvas-page__scene-host--active');
    var wrap = host.closest('.iter-canvas-page__frame-wrap');
    if (wrap) wrap.classList.add('iter-canvas-page__frame-wrap--active');
  }

  // 激活页面后，若底部高度把手超出视口，自动平移世界让把手可见
  function ensureHandleVisible(host, canvas) {
    if (!canvas || !host) return;
    var vp = host.closest('.iter-canvas-page__viewport');
    if (!vp) return;
    var vr = vp.getBoundingClientRect();
    var wrap = host.closest('.iter-canvas-page__frame-wrap');
    var handle = wrap ? wrap.querySelector('[data-role="resize"]') : null;
    var ref = (handle && getComputedStyle(handle).display !== 'none') ? handle : host;
    var rb = ref.getBoundingClientRect();
    var overflowY = rb.bottom - vr.bottom + 12;
    if (overflowY > 0) canvas.panBy(0, -overflowY);
  }

  // 点选页面 → 进入编辑态（解锁该页面交互）；点空白 → 回到浏览态。
  // 编辑态页面内部的点击/滚动/输入不退出编辑态。
  function bindSceneHostSelection(viewport, world, canvas) {
    viewport.addEventListener('click', function (e) {
      var activeHost = world.querySelector('.iter-canvas-page__scene-host--active');
      if (activeHost && activeHost.contains(e.target)) return; // 在编辑态页面内操作，保持
      var hosts = world.querySelectorAll('.iter-canvas-page__scene-host');
      var hit = null;
      for (var i = 0; i < hosts.length; i++) {
        var r = hosts[i].getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          hit = hosts[i];
          break;
        }
      }
      if (activeHost) deactivateHost(activeHost);
      if (hit) {
        activateHost(hit);
        ensureHandleVisible(hit, canvas);
      }
    });
  }

  // 编辑态下拖拽高度把手调整页面块高度（默认 iPhone 15 Pro 视口 393×852）
  function bindResize(world, canvas) {
    world.querySelectorAll('[data-role="resize"]').forEach(function (handle) {
      handle.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var wrap = handle.closest('.iter-canvas-page__frame-wrap');
        var host = wrap.querySelector('.iter-canvas-page__scene-host');
        if (!host) return;
        var startY = e.clientY;
        var startH = host.offsetHeight;
        var scale = canvas.getScale();
        function onMove(ev) {
          var dy = (ev.clientY - startY) / scale;
          var h = Math.max(200, Math.min(2200, startH + dy));
          host.style.height = Math.round(h) + 'px';
        }
        function onUp() {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
        }
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
      });
    });
  }

  function renderStatic(root, it) {
    root.querySelector('[data-region="info"]').innerHTML = infoMarkup(it);
    root.querySelector('[data-region="scope"]').innerHTML = scopeMarkup(it);
    root.querySelector('[data-region="entry"]').innerHTML = entryMarkup(it);
    var flowHtml = '';
    var blocks = [];
    (it.flows || []).forEach(function (f, fi) {
      var r = flowMarkup(f, fi);
      flowHtml += r.html;
      blocks = blocks.concat(r.blocks);
    });
    root.querySelector('[data-region="flows"]').innerHTML = flowHtml;
    renderSceneIntoHosts(root, blocks);
  }

  // ── 无限画布：单指拖拽平移 + 双指捏合缩放 + 滚轮缩放（CSS transform，零依赖）──
  function createCanvas(viewport, world, zoomValueEl) {
    var scale = 1;
    var tx = 0;
    var ty = 0;
    var MIN = 0.06;
    var MAX = 10;

    function apply() {
      world.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + scale + ')';
      if (zoomValueEl) zoomValueEl.textContent = Math.round(scale * 100) + '%';
    }

    function fit() {
      var vw = viewport.clientWidth || 320;
      var vh = viewport.clientHeight || 400;
      // 以流程链（内容主体）实际宽度为基准，而非整个 world 宽度
      var chains = world.querySelectorAll('.iter-canvas-page__flow-chain');
      var firstW = chains.length ? chains[0].scrollWidth : 0;
      var contentW = 0;
      for (var i = 0; i < chains.length; i++) {
        contentW = Math.max(contentW, chains[i].scrollWidth);
      }
      var cards = world.querySelectorAll('.iter-canvas-page__card');
      for (var j = 0; j < cards.length; j++) {
        contentW = Math.max(contentW, cards[j].scrollWidth);
      }
      contentW = Math.max(contentW, 320);
      var wh = world.scrollHeight || 900;
      // 初始聚焦第一条流程链，保证页面平铺清晰可读；「适配」则看全貌
      var baseW = firstW || contentW;
      scale = Math.max(0.55, Math.min(1, Math.min(vw / baseW, vh / wh) * 0.98));
      tx = (vw - baseW * scale) / 2;
      ty = 12;
      apply();
    }

    function zoomAt(px, py, factor) {
      var ns = Math.max(MIN, Math.min(MAX, scale * factor));
      var wx = (px - tx) / scale;
      var wy = (py - ty) / scale;
      tx = px - wx * ns;
      ty = py - wy * ns;
      scale = ns;
      apply();
    }

    function zoomCenter(factor) {
      zoomAt((viewport.clientWidth || 0) / 2, (viewport.clientHeight || 0) / 2, factor);
    }

    // 滚轮缩放（桌面端，以光标为锚点）
    viewport.addEventListener('wheel', function (e) {
      e.preventDefault();
      var rect = viewport.getBoundingClientRect();
      var px = e.clientX - rect.left;
      var py = e.clientY - rect.top;
      var factor = Math.pow(1.002, -e.deltaY);
      zoomAt(px, py, factor);
    }, { passive: false });

    // 指针状态：单指拖拽平移，双指捏合缩放
    var pointers = {};
    var gesture = null; // { mode: 'pan' | 'pinch', ... }

    function activePointers() {
      return Object.keys(pointers).map(function (id) { return pointers[id]; });
    }

    function onDown(e) {
      if (e.target.closest('iframe')) return; // iframe 内交互交给页面自身
      // 编辑态页面内部交互不触发画布拖拽
      if (e.target.closest && e.target.closest('.iter-canvas-page__scene-host--active')) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (Object.keys(pointers).length === 1) {
        gesture = { mode: 'pan', startX: e.clientX, startY: e.clientY, origX: tx, origY: ty };
      } else if (Object.keys(pointers).length === 2) {
        var pts = activePointers();
        gesture = {
          mode: 'pinch',
          dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
          midX: (pts[0].x + pts[1].x) / 2,
          midY: (pts[0].y + pts[1].y) / 2,
          scale: scale,
          tx: tx,
          ty: ty
        };
      }
      if (viewport.setPointerCapture) {
        try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
      }
    }

    function onMove(e) {
      if (!gesture) return;
      if (!pointers[e.pointerId]) return;
      var prev = pointers[e.pointerId];
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };

      if (gesture.mode === 'pan' && Object.keys(pointers).length === 1) {
        tx = gesture.origX + (e.clientX - gesture.startX);
        ty = gesture.origY + (e.clientY - gesture.startY);
        apply();
      } else if (gesture.mode === 'pinch' && Object.keys(pointers).length === 2) {
        var pts = activePointers();
        var dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        var midX = (pts[0].x + pts[1].x) / 2;
        var midY = (pts[0].y + pts[1].y) / 2;
        if (gesture.dist > 0) {
          var ns = Math.max(MIN, Math.min(MAX, gesture.scale * (dist / gesture.dist)));
          // 以双指中心为锚点缩放 + 平移跟随
          var rect = viewport.getBoundingClientRect();
          var cx = midX - rect.left;
          var cy = midY - rect.top;
          var wx = (cx - gesture.tx) / gesture.scale;
          var wy = (cy - gesture.ty) / gesture.scale;
          tx = cx - wx * ns;
          ty = cy - wy * ns;
          scale = ns;
          apply();
        }
      }
    }

    function onUp(e) {
      delete pointers[e.pointerId];
      var remaining = Object.keys(pointers).length;
      if (remaining === 0) {
        gesture = null;
      } else if (remaining === 1) {
        var pt = activePointers()[0];
        gesture = { mode: 'pan', startX: pt.x, startY: pt.y, origX: tx, origY: ty };
      }
    }

    viewport.addEventListener('pointerdown', onDown);
    viewport.addEventListener('pointermove', onMove);
    ['pointerup', 'pointercancel'].forEach(function (name) {
      viewport.addEventListener(name, onUp);
    });
    // 防止画布内手势触发页面滚动
    viewport.addEventListener('touchmove', function (e) {
      if (gesture) e.preventDefault();
    }, { passive: false });

    return {
      fit: fit,
      zoomCenter: zoomCenter,
      apply: apply,
      getScale: function () { return scale; },
      panBy: function (dx, dy) { tx += dx; ty += dy; apply(); }
    };
  }

  window.WegoApp.registerScene({
    routeId: 'iteration-canvas',
    title: '迭代画布',
    presentation: { type: 'push', transition: 'slide-left', coversTabBar: true },
    template: iterationCanvasTemplate,
    init: function (ctx) {
      var root = ctx.root;
      var backButton = root.querySelector('[data-dom-id="iter-canvas-back"]');
      var viewport = root.querySelector('[data-region="viewport"]');
      var world = root.querySelector('[data-region="world"]');
      var zoomValueEl = root.querySelector('[data-dom-id="zoom-value"]');

      backButton.addEventListener('click', function () { ctx.back(); });

      renderStatic(root, SAMPLE_ITERATION);

      var canvas = createCanvas(viewport, world, zoomValueEl);

      // 点选页面进入编辑态（解锁交互），激活时自动平移露出高度把手
      bindSceneHostSelection(viewport, world, canvas);

      // 编辑态下拖拽把手调整页面块高度
      bindResize(world, canvas);

      // 等场景渲染完成后 fit
      setTimeout(function () { canvas.fit(); }, 150);

      root.querySelector('[data-action="zoom-in"]').addEventListener('click', function () { canvas.zoomCenter(1.25); });
      root.querySelector('[data-action="zoom-out"]').addEventListener('click', function () { canvas.zoomCenter(0.8); });
      root.querySelector('[data-action="zoom-fit"]').addEventListener('click', function () { canvas.fit(); });
    }
  });
})();
