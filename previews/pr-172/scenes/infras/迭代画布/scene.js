// 迭代画布 · 系统工具场景（真实 DOM 投影 + 无限画布）
// 数据源：预研内置样例迭代（publish-product 发布产品），权威源后续接迭代目录 iteration.json
// 能力：
//  - 三类状态块：整页状态块（393×852 真实场景）、局部状态块（整页渲染后 clip 聚焦目标区域）、
//    规格占位卡（spec 声明但业务场景未实现 UI 的状态，不伪造，兼作缺口清单）
//  - 真实投影：window.WegoApp.renderSceneTo 把业务场景真实 DOM 渲染进画板，prepare 指令驱动到目标状态
//  - 懒加载：状态块滚入视口才渲染真实场景，避免一次实例化过多页面
//  - 无限画布：单指拖拽平移 + 双指捏合缩放 + 滚轮缩放 + 缩放控件（- / + / 适配）
//  - 范围区：纳入 included / 不纳入 excluded / 受影响场景；顶部汇总本迭代 UI 缺口清单

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
        <span class="iter-canvas-page__zval" data-role="zoom-value">100%</span>
        <button type="button" class="iter-canvas-page__zb" data-action="zoom-in" aria-label="放大">+</button>
        <button type="button" class="iter-canvas-page__zb" data-action="zoom-fit" aria-label="适配视图">适配</button>
      </div>
      <div class="iter-canvas-page__hint">拖动平移 · 双指缩放 · 点页面解锁交互</div>
    </div>
    <div class="iter-canvas-page__viewport" data-region="viewport" data-touch-action="none">
      <div class="iter-canvas-page__world" data-region="world">
        <div class="iter-canvas-page__info" data-region="info"></div>
        <div class="iter-canvas-page__scope" data-region="scope"></div>
        <div class="iter-canvas-page__entry" data-region="entry"></div>
        <div class="iter-canvas-page__gaps" data-region="gaps" data-flow-id="__gaps"></div>
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
      },
      {
        // 预研：局部状态块（整页渲染后 clip 聚焦目标区域）+ 规格占位卡（spec 声明、场景未实现 UI）
        id: 'field-and-exception',
        title: '字段级局部状态与异常缺口（局部块 · 占位卡）',
        priority: '—',
        desc: '局部块=整页渲染后裁剪聚焦价格区/入口行（保留整页宽度上下文）；占位卡=spec states 已声明（field-validation/load-failed/publish-failed）但发布场景尚无对应 UI，显式标缺口、不伪造',
        nodes: [
          { label: '价格区（局部）', routeId: 'publish-product',
            states: [{ name: '多价格已填写', sub: 'clip · 价格分组',
              prepare: [
                { action: 'fill', selector: 'input[placeholder*="请输入拿货价"]', value: '89' },
                { action: 'fill', selector: 'input[placeholder*="请输入售价"]', value: '139' },
                { action: 'fill', selector: 'input[placeholder*="请输入拼团价"]', value: '129' },
                { action: 'fill', selector: 'input[placeholder*="请输入批发价"]', value: '99' },
                { action: 'fill', selector: 'input[placeholder*="请输入打包价"]', value: '119' }
              ],
              clip: { selector: '[data-form-field="f-salePrice"]', closest: '.form-group', pad: 10 } }] },
          { label: '帮卖入口行（局部）', routeId: 'publish-product',
            states: [{ name: '帮卖分销入口', sub: 'clip · 单行字段',
              clip: { selector: '.publish-product__resale', pad: 10 } }] },
          { label: '发布表单', routeId: 'publish-product',
            states: [{ name: '必填/格式校验提示', sub: 'field-validation',
              placeholder: { ref: 'states.field-validation', note: '必填未填或格式非法时的字段级报错与阻断提交，发布场景尚未实现该校验 UI' } }] },
          { label: '发布表单', routeId: 'publish-product',
            states: [{ name: '读取失败 · 重试', sub: 'load-failed',
              placeholder: { ref: 'states.load-failed', note: '表单数据读取失败的失败提示与「重试/关闭」，发布场景尚未实现' } }] },
          { label: '发布表单', routeId: 'publish-product',
            states: [{ name: '保存失败 · 重试', sub: 'publish-failed',
              placeholder: { ref: 'states.publish-failed', note: '提交保存失败提示与重试、数据保持原状，发布场景尚未实现' } }] }
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

  // 规格占位卡：spec 声明但业务场景未实现 UI 的状态——不伪造内容，显式标缺口
  function placeholderMarkup(st) {
    var p = st.placeholder || {};
    return ''
      + '<div class="iter-canvas-page__placeholder">'
      +   '<span class="iter-canvas-page__placeholder-dot" aria-hidden="true">!</span>'
      +   '<div class="iter-canvas-page__placeholder-badge">待业务场景补充 UI</div>'
      +   (p.ref ? '<div class="iter-canvas-page__placeholder-ref">' + esc(p.ref) + '</div>' : '')
      +   (p.note ? '<div class="iter-canvas-page__placeholder-note">' + esc(p.note) + '</div>' : '')
      + '</div>';
  }

  // 每个流程 = 一排"功能节点"，节点内部是多个状态块横排，节点之间连线
  // 返回 { html, blocks, gaps }；blocks 供懒加载按 key 找到 routeId/prepare/clip，gaps 汇总占位卡
  function flowMarkup(flow, flowIdx) {
    var blocks = [];
    var gaps = [];
    var nodeHtml = flow.nodes.map(function (node, nodeIdx) {
      var states = (node.states && node.states.length) ? node.states : [{ name: node.sub || node.label, routeId: node.routeId }];
      var stateHtml = states.map(function (st, si) {
        var key = 'f' + flowIdx + '-n' + nodeIdx + '-s' + si;
        // ① 规格占位卡：不渲染真实场景，仅登记缺口
        if (st.placeholder) {
          gaps.push({ flow: flow.title, name: st.name, ref: (st.placeholder || {}).ref || '', sub: st.sub || '' });
          return ''
            + '<div class="iter-canvas-page__state iter-canvas-page__state--gap">'
            +   '<div class="iter-canvas-page__state-label">' + esc(st.name)
            +     '<span class="iter-canvas-page__frame-tag iter-canvas-page__frame-tag--gap">规格缺口</span>'
            +   '</div>'
            +   placeholderMarkup(st)
            + '</div>';
        }
        // ② 真实状态块（整页 / 局部 clip）
        var routeId = st.routeId || node.routeId;
        var isLocal = !!st.clip;
        blocks.push({
          key: key, routeId: routeId, prepare: st.prepare || [],
          overlay: node.overlay || null, tab: node.tab || null, clip: st.clip || null
        });
        return ''
          + '<div class="iter-canvas-page__state">'
          +   '<div class="iter-canvas-page__state-label">' + esc(st.name)
          +     (isLocal ? '<span class="iter-canvas-page__frame-tag iter-canvas-page__frame-tag--local">局部</span>' : '')
          +   '</div>'
          +   '<div class="iter-canvas-page__frame-wrap' + (isLocal ? ' iter-canvas-page__frame-wrap--local' : '') + '">'
          +     '<div class="iter-canvas-page__frame-label">'
          +       '<span class="iter-canvas-page__frame-name">' + esc(node.label) + '</span>'
          +       (st.sub ? '<span class="iter-canvas-page__frame-sub">' + esc(st.sub) + '</span>' : '')
          +     '</div>'
          // 未进入视口前为 pending 骨架，懒加载命中后再渲染真实场景
          +     '<div class="iter-canvas-page__scene-host iter-canvas-page__scene-host--pending" data-block-key="' + esc(key) + '" data-route-id="' + esc(routeId) + '"></div>'
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
        + '<div class="iter-canvas-page__flow" data-flow-id="' + esc(flow.id) + '">'
        +   '<div class="iter-canvas-page__flow-head">'
        +     '<span class="iter-canvas-page__flow-priority iter-canvas-page__flow-priority--' + (flow.priority === 'P1' ? 'p1' : 'p0') + '">' + esc(flow.priority) + '</span>'
        +     '<span class="iter-canvas-page__flow-title">' + esc(flow.title) + '</span>'
        +   '</div>'
        +   '<div class="iter-canvas-page__flow-desc">' + esc(flow.desc) + '</div>'
        +   '<div class="iter-canvas-page__flow-chain">' + nodeHtml + '</div>'
        + '</div>',
      blocks: blocks,
      gaps: gaps
    };
  }

  // 缺口清单卡：汇总全部规格占位卡（spec 声明、场景未实现），兼作本迭代 UI 缺口排查清单
  function gapsMarkup(gaps) {
    if (!gaps || !gaps.length) return '';
    var items = gaps.map(function (g, i) {
      return '<li class="iter-canvas-page__gap-item">'
        + '<span class="iter-canvas-page__gap-idx">' + (i + 1) + '</span>'
        + '<span class="iter-canvas-page__gap-body"><b>' + esc(g.name) + '</b>'
        +   '<span class="iter-canvas-page__gap-meta">' + esc(g.flow) + (g.ref ? ' · ' + esc(g.ref) : '') + '</span></span>'
        + '</li>';
    }).join('');
    return ''
      + '<div class="iter-canvas-page__card iter-canvas-page__gap-card">'
      +   '<div class="iter-canvas-page__card-title-row">'
      +     '<span class="iter-canvas-page__gap-title">UI 缺口清单（规格占位卡汇总）</span>'
      +     '<span class="iter-canvas-page__gap-count">' + gaps.length + ' 项待补</span>'
      +   '</div>'
      +   '<ul class="iter-canvas-page__gap-list">' + items + '</ul>'
      + '</div>';
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

  // 局部状态块：整页已渲染的前提下，只做"展示裁剪"——把目标区域平移到画板顶部并收缩高度，
  // 不改动业务场景状态、不产生新状态（clip 是纯视觉投影）。保留整页宽度，左右上下文不丢。
  function applyClip(host, clip) {
    if (!clip || !clip.selector) return;
    var pad = typeof clip.pad === 'number' ? clip.pad : 10;
    function measure() {
      var anchor = host.querySelector(clip.selector);
      var target = anchor ? (clip.closest ? anchor.closest(clip.closest) : anchor) : null;
      if (!target) {
        // 选择器失效要显性可见，不允许静默留白
        host.classList.add('iter-canvas-page__scene-host--clip-miss');
        console.warn('[iter-canvas] clip target not found:', clip.selector);
        return;
      }
      var sceneRoot = host.firstElementChild; // renderSceneTo 后场景模板根即 host 直接子节点
      // 复位外层位移，保证多次重算幂等（不被上一次结果污染）
      if (sceneRoot) sceneRoot.style.transform = '';
      // 目标常位于业务场景的内部滚动容器中（如 .layout-scroll，内容远高于可视区）：
      // 仅移动外层无法穿过滚动容器自身的裁剪，必须先让目标在每一层内部纵向滚动祖先里
      // 滚到可视顶。手动只设 scrollTop（不使用 scrollIntoView，避免其 inline 方向引入
      // 横向偏移、也避免带动外层画布视口），并把横向 scrollLeft 锁零。
      var outer = host.closest('.iter-canvas-page__viewport');
      var savedOuterScroll = outer ? outer.scrollTop : 0;
      var scEl = target.parentElement;
      var innerScrollers = [];
      while (scEl && scEl !== host) {
        var oy = getComputedStyle(scEl).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && scEl.scrollHeight > scEl.clientHeight + 1) {
          innerScrollers.push(scEl);
        }
        scEl = scEl.parentElement;
      }
      innerScrollers.reverse().forEach(function (scroller) {
        scroller.scrollLeft = 0;
        var rel = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
        scroller.scrollTop = Math.max(0, rel - pad);
      });
      if (outer) outer.scrollTop = savedOuterScroll;
      // 再把场景根整体上移，使目标对齐到 host 顶部留 pad，并把 host 裁到目标高度
      var hr = host.getBoundingClientRect();
      var tr = target.getBoundingClientRect();
      var delta = tr.top - hr.top;
      if (sceneRoot) sceneRoot.style.transform = 'translateY(' + (-(delta - pad)) + 'px)';
      host.style.height = Math.round(target.offsetHeight + pad * 2) + 'px';
      host.classList.add('iter-canvas-page__scene-host--clip');
    }
    requestAnimationFrame(function () { requestAnimationFrame(measure); });
    // 场景运行时 init / 字体 / 图片可能晚于挂载就绪，多个时点重算直到布局稳定收敛
    setTimeout(measure, 160);
    setTimeout(measure, 420);
  }

  // 挂载单个状态块：真实场景 DOM → tab/overlay → prepare 驱动状态 → 局部块 clip
  function mountHost(host, block) {
    if (!block || host.dataset.mounted === '1') return;
    host.dataset.mounted = '1';
    host.classList.remove('iter-canvas-page__scene-host--pending');
    host.classList.add('iter-canvas-page__scene-host--loading');
    window.WegoApp.renderSceneTo(block.routeId, host).then(function () {
      host.classList.remove('iter-canvas-page__scene-host--loading');
      host.classList.add('iter-canvas-page__scene-host--ready');
      if (block.tab) mountBottomTab(host, block.tab);
      if (block.overlay) mountOverlay(host, block.overlay);
      runPrepare(host, block.prepare);
      if (block.clip) applyClip(host, block.clip);
    });
  }

  // 懒加载：状态块进入视口附近才渲染真实场景（一次），避免一次实例化过多页面；平移/缩放由 IO 命中
  function mountHostsLazy(root, blocks, viewport) {
    var map = {};
    blocks.forEach(function (b) { map[b.key] = b; });
    var hosts = Array.prototype.slice.call(root.querySelectorAll('.iter-canvas-page__scene-host'));
    if (!('IntersectionObserver' in window)) {
      hosts.forEach(function (h) { mountHost(h, map[h.dataset.blockKey]); }); // 降级：直接全量
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var host = entry.target;
        mountHost(host, map[host.dataset.blockKey]);
        io.unobserve(host);
      });
    }, { root: viewport, rootMargin: '500px 300px', threshold: 0 });
    hosts.forEach(function (h) { io.observe(h); });
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

  function renderStatic(root, it, viewport) {
    root.querySelector('[data-region="info"]').innerHTML = infoMarkup(it);
    root.querySelector('[data-region="scope"]').innerHTML = scopeMarkup(it);
    root.querySelector('[data-region="entry"]').innerHTML = entryMarkup(it);
    var flowHtml = '';
    var blocks = [];
    var gaps = [];
    (it.flows || []).forEach(function (f, fi) {
      var r = flowMarkup(f, fi);
      flowHtml += r.html;
      blocks = blocks.concat(r.blocks);
      gaps = gaps.concat(r.gaps || []);
    });
    root.querySelector('[data-region="gaps"]').innerHTML = gapsMarkup(gaps);
    root.querySelector('[data-region="flows"]').innerHTML = flowHtml;
    mountHostsLazy(root, blocks, viewport);
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
      // 绝对缩放（以视口中心为锚），供预览定位参数 ?scale= 使用
      zoomTo: function (s) { if (s > 0) { zoomCenter(s / scale); } },
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
      var zoomValueEl = root.querySelector('[data-role="zoom-value"]');

      backButton.addEventListener('click', function () { ctx.back(); });

      renderStatic(root, SAMPLE_ITERATION, viewport);

      var canvas = createCanvas(viewport, world, zoomValueEl);

      // 点选页面进入编辑态（解锁交互），激活时自动平移露出高度把手
      bindSceneHostSelection(viewport, world, canvas);

      // 编辑态下拖拽把手调整页面块高度
      bindResize(world, canvas);

      // 等场景渲染完成后 fit；支持预览定位参数 ?scale=&flow=（预研验收与未来技能直达定位用）
      var previewQuery = new URLSearchParams(window.location.search);
      var previewScale = parseFloat(previewQuery.get('scale'));
      var previewFlow = previewQuery.get('flow');
      setTimeout(function () {
        if (previewScale > 0) {
          canvas.zoomTo(previewScale);
        } else {
          canvas.fit();
        }
        if (previewFlow) {
          var flowEl = viewport.querySelector('[data-flow-id="' + previewFlow + '"]');
          if (flowEl) { viewport.scrollTop = Math.max(0, flowEl.offsetTop - 56); }
        }
      }, 150);

      root.querySelector('[data-action="zoom-in"]').addEventListener('click', function () { canvas.zoomCenter(1.25); });
      root.querySelector('[data-action="zoom-out"]').addEventListener('click', function () { canvas.zoomCenter(0.8); });
      root.querySelector('[data-action="zoom-fit"]').addEventListener('click', function () { canvas.fit(); });
    }
  });
})();
