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
        desc: '动态流「发布」入口 → 填写字段 → 上传图片+可见范围 → 提交 → 新产品出现在动态流',
        nodes: [
          { label: '动态流', sub: '「发布」入口', routeId: 'album-product-feed' },
          { label: '发布产品表单', sub: '填写基础字段', routeId: 'publish-product' },
          { label: '发布产品表单', sub: '上传图片 + 可见范围', routeId: 'publish-product' },
          { label: '动态流', sub: '新产品出现', routeId: 'album-product-feed' }
        ]
      },
      {
        id: 'resale-setup',
        title: '发布并开启帮卖',
        priority: 'P1',
        desc: '发布表单 → 打开帮卖设置弹窗 → 设置帮卖方式与加价规则 → 完成回到表单 → 提交',
        nodes: [
          { label: '发布产品表单', sub: '点击「帮卖分销」', routeId: 'publish-product' },
          { label: '帮卖设置弹窗', sub: '自由定价 / 固定佣金', routeId: 'agent-resale' },
          { label: '发布产品表单', sub: '完成回到表单', routeId: 'publish-product' },
          { label: '动态流', sub: '带「可帮卖」标识', routeId: 'album-product-feed' }
        ]
      },
      {
        id: 'product-edit',
        title: '重新编辑',
        priority: 'P1',
        desc: '动态流「编辑」入口 → 回显已填字段 → 修改 → 保存 → 动态流同步更新',
        nodes: [
          { label: '动态流', sub: '「编辑」入口', routeId: 'album-product-feed' },
          { label: '发布产品表单', sub: '回显已填字段', routeId: 'publish-product' },
          { label: '发布产品表单', sub: '修改后保存', routeId: 'publish-product' },
          { label: '动态流', sub: '对应动态同步更新', routeId: 'album-product-feed' }
        ]
      },
      {
        id: 'multi-value',
        title: '多值字段录入',
        priority: '—',
        desc: '规格 / 颜色 / 标签 / 来源 → 一次录入多个值 → 实时展示已录入项 → 可增删',
        nodes: [
          { label: '发布产品表单', sub: '多值字段录入', routeId: 'publish-product' },
          { label: '发布产品表单', sub: '已录入项实时展示', routeId: 'publish-product' }
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

  // iframe 加载同一宿主应用的真实页面；src 相对当前 index.html 解析
  function frameSrc(routeId) {
    return './index.html#/' + encodeURIComponent(routeId);
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

  // 每个流程 = 一排 iframe 平铺页面，横向排列 + 连线
  function flowMarkup(flow) {
    var nodeHtml = flow.nodes.map(function (node, i) {
      var isSameAsPrev = i > 0 && flow.nodes[i - 1].routeId === node.routeId;
      return ''
        + '<div class="iter-canvas-page__node">'
        +   '<div class="iter-canvas-page__frame-wrap">'
        +     '<div class="iter-canvas-page__frame-label">'
        +       '<span class="iter-canvas-page__frame-name">' + esc(node.label) + '</span>'
        +       '<span class="iter-canvas-page__frame-sub">' + esc(node.sub) + '</span>'
        +     '</div>'
        +     '<iframe class="iter-canvas-page__frame" src="' + frameSrc(node.routeId) + '" title="' + esc(node.label) + '" loading="lazy"></iframe>'
        +     '<div class="iter-canvas-page__frame-route">' + esc(node.routeId) + (isSameAsPrev ? ' · 复用' : '') + '</div>'
        +   '</div>'
        +   (i < flow.nodes.length - 1 ? '<div class="iter-canvas-page__link" aria-hidden="true"><i class="wego-iconfont-s icon-youjiantou16"></i></div>' : '')
        + '</div>';
    }).join('');
    return ''
      + '<div class="iter-canvas-page__flow">'
      +   '<div class="iter-canvas-page__flow-head">'
      +     '<span class="iter-canvas-page__flow-priority iter-canvas-page__flow-priority--' + (flow.priority === 'P1' ? 'p1' : 'p0') + '">' + esc(flow.priority) + '</span>'
      +     '<span class="iter-canvas-page__flow-title">' + esc(flow.title) + '</span>'
      +   '</div>'
      +   '<div class="iter-canvas-page__flow-desc">' + esc(flow.desc) + '</div>'
      +   '<div class="iter-canvas-page__flow-chain">' + nodeHtml + '</div>'
      + '</div>';
  }

  function renderStatic(root, it) {
    root.querySelector('[data-region="info"]').innerHTML = infoMarkup(it);
    root.querySelector('[data-region="scope"]').innerHTML = scopeMarkup(it);
    root.querySelector('[data-region="entry"]').innerHTML = entryMarkup(it);
    var flows = (it.flows || []).map(flowMarkup).join('');
    root.querySelector('[data-region="flows"]').innerHTML = flows;
  }

  // ── 无限画布：单指拖拽平移 + 双指捏合缩放 + 滚轮缩放（CSS transform，零依赖）──
  function createCanvas(viewport, world, zoomValueEl) {
    var scale = 1;
    var tx = 0;
    var ty = 0;
    var MIN = 0.35;
    var MAX = 3;

    function apply() {
      world.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + scale + ')';
      if (zoomValueEl) zoomValueEl.textContent = Math.round(scale * 100) + '%';
    }

    function fit() {
      var vw = viewport.clientWidth || 320;
      var vh = viewport.clientHeight || 400;
      var ww = world.scrollWidth || 1600;
      var wh = world.scrollHeight || 900;
      // 初始视图尽量铺满视口，保证能看清整体布局
      scale = Math.max(MIN, Math.min(1, Math.min(vw / ww, vh / wh) * 0.98));
      // 垂直方向：让内容顶部对齐视口（信息/范围/流程依次向下排布）
      tx = (vw - ww * scale) / 2;
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
      apply: apply
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
      // 等 iframe 布局稳定后再 fit
      setTimeout(function () { canvas.fit(); }, 60);

      root.querySelector('[data-action="zoom-in"]').addEventListener('click', function () { canvas.zoomCenter(1.25); });
      root.querySelector('[data-action="zoom-out"]').addEventListener('click', function () { canvas.zoomCenter(0.8); });
      root.querySelector('[data-action="zoom-fit"]').addEventListener('click', function () { canvas.fit(); });
    }
  });
})();
