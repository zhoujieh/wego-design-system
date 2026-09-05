/* 代理商帮卖弹窗场景（agent-resale）
   - 本场景为「帮卖弹窗」可复用组件的演示入口：选择不同样例数据，拉起同一套帮卖弹窗。
   - 弹窗逻辑已抽到全局业务运行时 wego-app/js/agent-resale-popup.js（window.WegoApp.openAgentResalePopup），
     任意业务场景（动态流、发布页等）均可直接调用，本场景只负责样例数据与入口。 */

(function () {
  'use strict';

  // ── 场景样例数据 ──
  // 商品图片和标题取自 window.WEGO_PROTOTYPE_DB,帮卖配置为场景特定样例数据
  var SCENE_SAMPLES = [
    {
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
    },
    {
      key: 'first-resale-free-range',
      label: '初次帮卖 · 自由定价 · 区间价格',
      group: '自由定价',
      badge: { text: '区间价', type: 'free' },
      desc: 'SKU供货价80/100/120 · 区间80~120',
      product_id: 'prod-clothing-002',
      distribution_type: 1,
      supply_price: [80, 120],
      skus: [
        { id: 'sku-1', supply_price: 80 },
        { id: 'sku-2', supply_price: 100 },
        { id: 'sku-3', supply_price: 120 }
      ],
      distribution_config: { amountType: 2, rate: 0.3 },
      my_item: false,
      from_page: 'normal'
    },
    {
      key: 'edit-free-single',
      label: '编辑 · 自由定价',
      group: '编辑',
      badge: { text: '编辑', type: 'free' },
      desc: '回显售价150 · 加价+50',
      product_id: 'prod-clothing-003',
      distribution_type: 1,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: true,
      current_price: 150,
      current_add_price_type: 1,
      current_add_price_value: 50,
      from_page: 'normal'
    },
    {
      key: 'edit-fixed-rebate',
      label: '编辑 · 固定佣金',
      group: '编辑',
      badge: { text: '固定佣金', type: 'fixed' },
      desc: '售价208.5 · 佣金30 · 只读',
      product_id: 'prod-clothing-005',
      distribution_type: 2,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: true,
      current_price: 208.5,
      commission: 30,
      from_page: 'normal'
    },
    {
      key: 'live-room-free',
      label: '直播间 · 自由定价',
      group: '直播间',
      badge: { text: '直播', type: 'live' },
      desc: '同初次帮卖 · 来源直播间 · 遮罩可关',
      product_id: 'prod-clothing-006',
      distribution_type: 1,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: false,
      from_page: 'live'
    },
    {
      key: 'live-room-fixed',
      label: '直播间 · 固定佣金',
      group: '直播间',
      badge: { text: '直播', type: 'live' },
      desc: '固定佣金 · 底部仅"我知道了"',
      product_id: 'prod-clothing-007',
      distribution_type: 2,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: false,
      current_price: 200,
      commission: 100,
      from_page: 'live'
    },
    {
      key: 'wholesale-hidden',
      label: '批发价隐藏',
      group: '异常',
      badge: { text: '异常', type: 'error' },
      desc: '批发价被隐藏 · 模态框确认公开',
      product_id: 'prod-clothing-008',
      distribution_type: 1,
      supply_price: null,
      error_code: 'wholesale_hidden',
      from_page: 'normal'
    },
    {
      key: 'all-price-hidden',
      label: '所有价格隐藏',
      group: '异常',
      badge: { text: '异常', type: 'error' },
      desc: '所有价格被隐藏 · 引导跳转价格管理',
      product_id: 'prod-clothing-009',
      distribution_type: 1,
      supply_price: null,
      error_code: 'all_price_hidden',
      from_page: 'normal'
    },
    {
      key: 'loading-state',
      label: '加载中',
      group: '异常',
      badge: { text: '异常', type: 'error' },
      desc: '弹窗加载中 · 居中加载图标',
      product_id: 'prod-clothing-001',
      distribution_type: 1,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: false,
      state: 'loading',
      from_page: 'normal'
    },
    {
      key: 'load-failed-state',
      label: '加载失败',
      group: '异常',
      badge: { text: '异常', type: 'error' },
      desc: '获取帮卖信息失败 · 点击请重试',
      product_id: 'prod-clothing-001',
      distribution_type: 1,
      supply_price: 100,
      skus: [{ id: 'sku-1', supply_price: 100 }],
      distribution_config: { amountType: 1, value: 100 },
      my_item: false,
      state: 'load-failed',
      from_page: 'normal'
    }
  ];

  // ── 挂载场景选择页 ──
  function mountSelection(ctx) {
    var root = ctx.root;

    var cards = root.querySelectorAll('[data-scene-key]:not([data-dom-id])');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var key = card.getAttribute('data-scene-key');
        var sample = SCENE_SAMPLES.find(function (s) { return s.key === key; });
        if (!sample) return;
        window.WegoApp.openAgentResalePopup(ctx, { sample: sample });
      });
    });
  }

  window.WegoApp.registerScene({
    routeId: 'agent-resale',
    title: '代理商帮卖弹窗',
    template: `
<div class="layout-page" data-bg="page" data-component-slug="layout-page" data-surface-id="agent-resale" data-route-id="agent-resale" data-layout-mode="composed">
  <div class="layout-page__top">
    <div class="navbar" data-component-slug="navbar">
      <div class="navbar__body navbar__body--spaced">
        <div class="navbar__left">
          <div class="navbar__left-btn navbar__left-btn--circle" data-back-btn><i class="wego-iconfont-s icon-zuojiantou16"></i></div>
        </div>
        <div class="navbar__center"><span class="navbar__title">代理商帮卖弹窗</span></div>
        <div class="navbar__right"></div>
      </div>
    </div>
  </div>
  <div class="layout-page__body">
    <div class="layout-scroll" data-component-slug="layout-scroll">
      <div class="agent-resale-scene__intro">
        <p class="agent-resale-scene__intro-title">帮卖分销原型</p>
        <p class="agent-resale-scene__intro-desc">点击下方场景卡片进入对应帮卖弹窗实例,覆盖自由定价/固定佣金、单一价/区间价、普通/直播间来源以及价格隐藏异常。</p>
      </div>
      <div class="agent-resale-scene__group">
        <div class="agent-resale-scene__group-title">自由定价</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-dom-id="open-resale-popup" data-scene-key="first-resale-free-single">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">初次帮卖 · 自由定价 · 单一价格</span>
                </div>
                <div class="cell__subtitle">供货价178.5 · 默认加价+30 · 售价208.5</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--free">自由定价</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="first-resale-free-range">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">初次帮卖 · 自由定价 · 区间价格</span>
                </div>
                <div class="cell__subtitle">SKU供货价80/100/120 · 区间80~120</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--free">区间价</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="agent-resale-scene__group">
        <div class="agent-resale-scene__group-title">编辑</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="edit-free-single">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">编辑 · 自由定价</span>
                </div>
                <div class="cell__subtitle">回显售价150 · 加价+50</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--free">编辑</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="edit-fixed-rebate">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">编辑 · 固定佣金</span>
                </div>
                <div class="cell__subtitle">售价208.5 · 佣金30 · 只读</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--fixed">固定佣金</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="agent-resale-scene__group">
        <div class="agent-resale-scene__group-title">直播间</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="live-room-free">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">直播间 · 自由定价</span>
                </div>
                <div class="cell__subtitle">同初次帮卖 · 来源直播间 · 遮罩可关</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--live">直播</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="live-room-fixed">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">直播间 · 固定佣金</span>
                </div>
                <div class="cell__subtitle">固定佣金 · 底部仅"我知道了"</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--live">直播</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="agent-resale-scene__group">
        <div class="agent-resale-scene__group-title">异常</div>
        <div class="cell-group__content">
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="wholesale-hidden">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">批发价隐藏</span>
                </div>
                <div class="cell__subtitle">批发价被隐藏 · 模态框确认公开</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--error">异常</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="all-price-hidden">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">所有价格隐藏</span>
                </div>
                <div class="cell__subtitle">所有价格被隐藏 · 引导跳转价格管理</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--error">异常</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="loading-state">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">加载中</span>
                </div>
                <div class="cell__subtitle">弹窗加载中 · 居中加载图标</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--error">异常</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
          <div class="cell cell--double cell--bg-white cell--clickable cell--divider-center" data-component-slug="cell" data-scene-key="load-failed-state">
            <div class="cell__body">
              <div class="cell__content">
                <div class="cell__title-row">
                  <span class="cell__title">加载失败</span>
                </div>
                <div class="cell__subtitle">获取帮卖信息失败 · 点击请重试</div>
              </div>
              <div class="cell__action">
                <span class="agent-resale-scene__card-badge agent-resale-scene__card-badge--error">异常</span>
                <i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
    presentation: { type: 'push', coversTabBar: true },
    init: function (ctx) {
      var root = ctx.root;
      var backBtn = root.querySelector('[data-back-btn]');
      if (backBtn) {
        backBtn.addEventListener('click', function () {
          ctx.back();
        });
      }
      var entryCard = root.querySelector('[data-dom-id="open-resale-popup"]');
      if (entryCard) {
        entryCard.addEventListener('click', function () {
          var sample = SCENE_SAMPLES.find(function (s) { return s.key === 'first-resale-free-single'; });
          if (sample) window.WegoApp.openAgentResalePopup(ctx, { sample: sample });
        });
      }
      mountSelection(ctx);
    }
  });
})();
