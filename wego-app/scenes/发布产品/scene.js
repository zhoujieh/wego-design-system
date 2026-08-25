/* wego-design-contract:
{
  "surface_id": "publish-product",
  "route_id": "publish-product",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "full-screen-modal",
    "modalVariant": "sheet",
    "modalTitle": "default",
    "consumesModalComponent": true,
    "transition": "slide-up-enter, slide-down-exit",
    "dismissAction": "page-level-save",
    "overlayLevel": "overlay",
    "coversTabBar": false,
    "source": "uikit-plan.json#/pagePatterns/entity-form"
  },
  "prompt_contract": {
    "design_system_version": 416,
    "token_bindings": [
      { "selector": ".publish-product", "content_role": "页面背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".publish-product", "content_role": "页面文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".publish-product", "content_role": "页面字体", "css_property": "font-family", "token": "var(--body-md-font-family)" }
    ],
    "component_bindings": [
      { "binding_id": "publish-navbar", "slug": "navbar", "reason": "发布产品顶部导航：左侧取消文本、中间标题、右侧发布强按钮（entity-form 底部 sheet 模态）", "variant_dimensions": { "leftControl": "cancel", "titleAlignment": "center", "actions": "button", "rightActionType": "button", "spacing": "default", "pageTransition": "present", "position": "sticky" } }
    ],
    "layout_contract": {
      "mode": "composed",
      "page_edge_mode": "M0",
      "mutable_regions": [".publish-product__scroll"]
    },
    "interaction_contract": [
      { "dom_id": "publish-submit", "target": "state:publish-success" },
      { "dom_id": "open-resale-sheet", "target": "overlay:sheet" }
    ],
    "state_contract": [
      { "state_id": "empty-form", "initial": true, "trigger": "进入发布产品场景", "visible_result": "展示完整发布字段待填写", "fallback": "保留已填内容", "persistence": "memory" }
    ]
  }
}
*/

/* 发布产品场景（publish-product）
   - 独立发布场景：录入产品字段（对齐真实发布页 goods_edit）
   - 「帮卖分销」入口打开帮卖设置弹窗（半屏 sheet，对齐帮卖分销场景 distribution_type + distribution_config 契约）
   - 发布后写入 localStorage，新产品出现在动态流（动态流场景读取）
   - 入口机制：作为 overlay 模态打开（与「点搜索」同源），来源页（动态/我的）保持挂载、内容不卸载、
     底部 sheet 露出来源页内容；取消/关闭原地返回来源页。 */


/* 发布产品场景（直链 #/publish-product 注册）
   实际实现已抽离到 lib/js/publish-product-modal.js（全局加载），
   本文件仅注册直链路由，init 复用全局 WegoApp.initPublishProduct。 */

(function () {
  'use strict';

  window.WegoApp.registerScene({
    routeId: 'publish-product',
    template: window.WegoApp.PUBLISH_TEMPLATE,
    presentation: { type: 'full-screen-modal', transition: 'slide-up-enter, slide-down-exit', coversTabBar: false },
    init: function (ctx) { window.WegoApp.initPublishProduct(ctx, null); }
  });
})();
