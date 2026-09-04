/** 导出报价单场景（shop244）：选品 → 预览编辑 → 分享导出 → 报价记录 全闭环。
 *  阶段A骨架：路由注册 + 页面根框架；交互能力随阶段B起逐步落地。 */
const quoteExportTemplate = `<div class="layout-page quote-export-page" data-surface-id="quote-export" data-route-id="quote-export" data-layout-mode="composed" data-bg="page" data-component-slug="layout-page">
  <div class="layout-page__body">
    <div class="layout-scroll quote-export-scroll" data-component-slug="layout-scroll"></div>
  </div>
</div>`;

window.WegoApp.registerScene({
  routeId: 'quote-export',
  template: quoteExportTemplate,
  presentation: { type: 'push', transition: 'slide-left', coversTabBar: true },
  init(ctx) {}
});
