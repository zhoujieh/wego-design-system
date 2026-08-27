/* wego-design-contract:
{
  "surface_id": "publish-product",
  "route_id": "publish-product",
  "layout_mode": "composed",
  "implementation": "global",
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

const PUBLISH_TEMPLATE = `
<div class="modal modal--fullscreen publish-product" data-surface-id="publish-product" data-route-id="publish-product" data-layout-mode="composed" data-component-slug="modal" data-state="open" role="dialog" aria-modal="true" aria-label="发布产品" style="--modal-panel-bg: var(--bg-page)">
  <div class="modal__panel">
    <div class="modal__title modal__title--default">
      <div class="navbar" data-component-slug="navbar">
        <div class="navbar__body navbar__body--spaced">
          <div class="navbar__left"><button type="button" class="navbar__left-text" data-dom-id="publish-cancel" aria-label="取消">取消</button></div>
          <div class="navbar__center"><span class="navbar__title">发布产品</span></div>
          <div class="navbar__right navbar__right--button">
            <div class="navbar__action navbar__action--button">
              <button type="button" class="btn btn--strong btn--sm" data-component-slug="button" data-dom-id="publish-submit">发布</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal__body modal__body--safe-bottom layout-scroll publish-product__scroll" data-component-slug="layout-scroll">

      <div class="form-group">
        <div class="form-group__title">商品图片</div>
        <div class="form-group__content"><div class="publish-product__image-wrap">
          <div class="publish-product__images" data-image-list></div>
          <button type="button" class="publish-product__img-add" data-dom-id="open-image-picker" aria-label="添加图片"><i class="wego-iconfont-s icon-shangchuantupian" aria-hidden="true"></i><span>添加图片</span></button>
        </div></div>
      </div>

      <div class="form-group">
        <div class="form-group__title">商品信息</div>
        <div class="form-group__content">
          <div class="form-body" data-component-slug="form"><div class="form-body__label">产品名</div><div class="form-body__action"><input class="publish-product__input" type="text" placeholder="请输入产品名" data-form-field="f-name" /></div></div>
          <div class="form-body" data-component-slug="form"><div class="form-body__label">商品简称</div><div class="form-body__action"><input class="publish-product__input" type="text" placeholder="请输入商品简称" data-form-field="f-shortName" /></div></div>
          <div class="form-body" data-component-slug="form"><div class="form-body__label">货号</div><div class="form-body__action"><input class="publish-product__input" type="text" placeholder="请输入货号" data-form-field="f-sku" /></div><button type="button" class="publish-product__auto" data-dom-id="auto-sku">自动生成</button></div>
        </div>
      </div>

      <div class="form-group">
        <div class="form-group__title">价格</div>
        <div class="form-group__content">
          <div class="form-body" data-component-slug="form"><div class="form-body__label">拿货价</div><div class="form-body__action"><div class="form-body__money"><span class="form-body__money-symbol">¥</span><input class="publish-product__input" type="number" placeholder="请输入拿货价" data-form-field="f-takePrice" /></div></div><button type="button" class="publish-product__public" data-public-toggle="f-takePrice">公开</button></div>
          <div class="form-body" data-component-slug="form"><div class="form-body__label">售价</div><div class="form-body__action"><div class="form-body__money"><span class="form-body__money-symbol">¥</span><input class="publish-product__input" type="number" placeholder="请输入售价" data-form-field="f-salePrice" /></div></div><button type="button" class="publish-product__public" data-public-toggle="f-salePrice">公开</button></div>
          <div class="form-body" data-component-slug="form"><div class="form-body__label">拼团价</div><div class="form-body__action"><div class="form-body__money"><span class="form-body__money-symbol">¥</span><input class="publish-product__input" type="number" placeholder="请输入拼团价" data-form-field="f-groupPrice" /></div></div><button type="button" class="publish-product__public" data-public-toggle="f-groupPrice">公开</button></div>
          <div class="form-body" data-component-slug="form"><div class="form-body__label">批发价</div><div class="form-body__action"><div class="form-body__money"><span class="form-body__money-symbol">¥</span><input class="publish-product__input" type="number" placeholder="请输入批发价" data-form-field="f-wholesalePrice" /></div></div><button type="button" class="publish-product__public" data-public-toggle="f-wholesalePrice">公开</button></div>
          <div class="form-body" data-component-slug="form"><div class="form-body__label">打包价</div><div class="form-body__action"><div class="form-body__money"><span class="form-body__money-symbol">¥</span><input class="publish-product__input" type="number" placeholder="请输入打包价" data-form-field="f-packPrice" /></div></div><button type="button" class="publish-product__public" data-public-toggle="f-packPrice">公开</button></div>
        </div>
      </div>

      <div class="form-group">
        <div class="form-group__title">规格与库存</div>
        <div class="form-group__content">
          <div class="form-body form-body--align-top" data-component-slug="form"><div class="form-body__label">规格</div><div class="form-body__action"><div class="publish-product__tags" data-tag-list="f-specs"></div><div class="publish-product__tag-input-row"><input class="publish-product__input publish-product__tag-input" type="text" placeholder="输入后回车添加" data-tag-input="f-specs" /></div></div></div>
          <div class="form-body form-body--align-top" data-component-slug="form"><div class="form-body__label">颜色</div><div class="form-body__action"><div class="publish-product__tags" data-tag-list="f-colors"></div><div class="publish-product__tag-input-row"><input class="publish-product__input publish-product__tag-input" type="text" placeholder="输入后回车添加" data-tag-input="f-colors" /></div></div></div>
          <div class="form-body" data-component-slug="form"><div class="form-body__label">库存</div><div class="form-body__action"><input class="publish-product__input" type="number" placeholder="请输入库存" data-form-field="f-stock" /></div></div>
          <div class="form-body" data-component-slug="form"><div class="form-body__label">重量/kg</div><div class="form-body__action"><input class="publish-product__input" type="number" placeholder="请输入商品重量" data-form-field="f-weight" /></div></div>
        </div>
      </div>

      <div class="form-group">
        <div class="form-group__title">标签与来源</div>
        <div class="form-group__content">
          <div class="form-body form-body--align-top" data-component-slug="form"><div class="form-body__label">标签</div><div class="form-body__action"><div class="publish-product__tags" data-tag-list="f-tags"></div><div class="publish-product__tag-input-row"><input class="publish-product__input publish-product__tag-input" type="text" placeholder="输入后回车添加" data-tag-input="f-tags" /></div></div></div>
          <div class="form-body form-body--align-top" data-component-slug="form"><div class="form-body__label">来源</div><div class="form-body__action"><div class="publish-product__tags" data-tag-list="f-source"></div><div class="publish-product__tag-input-row"><input class="publish-product__input publish-product__tag-input" type="text" placeholder="输入后回车添加" data-tag-input="f-source" /></div></div></div>
        </div>
      </div>

      <div class="form-group">
        <div class="form-group__title">其他</div>
        <div class="form-group__content">
          <div class="form-body" data-component-slug="form"><div class="form-body__label">运费模板</div><div class="form-body__action"><input class="publish-product__input" type="text" placeholder="请输入运费模板" data-form-field="f-freight" /></div></div>
          <div class="form-body" data-component-slug="form"><div class="form-body__label">备注</div><div class="form-body__action"><input class="publish-product__input" type="text" placeholder="请输入备注" data-form-field="f-remark" /></div></div>
          <div class="form-body" data-component-slug="form"><div class="form-body__label">子账号</div><div class="form-body__action"><input class="publish-product__input" type="text" placeholder="请输入子账号" data-form-field="f-subAccount" /></div></div>
        </div>
      </div>

      <div class="form-group">
        <div class="form-group__content">
          <div class="form-body form-body--clickable publish-product__resale" data-component-slug="form" data-dom-id="open-resale-sheet" role="button" tabindex="0">
            <span class="form-body__label">帮卖分销</span>
            <span class="form-body__action"><span class="publish-product__resale-value" data-resale-value>未开启</span></span>
            <i class="wego-iconfont-s icon-youjiantou16 publish-product__arrow" aria-hidden="true"></i>
          </div>
        </div>
      </div>

      <div class="publish-product__bottom-space"></div>
    </div>
  </div>
</div>`;

(function () {
  'use strict';

  window.WegoApp.registerScene({
    routeId: 'publish-product',
    template: PUBLISH_TEMPLATE,
    presentation: { type: 'full-screen-modal', transition: 'slide-up-enter, slide-down-exit', coversTabBar: false },
    init: function (ctx) { window.WegoApp.initPublishProduct(ctx, null); }
  });
})();
