/* wego-design-contract:
{
  "surface_id": "publish-product",
  "route_id": "publish-product",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "full-screen-modal",
    "modalVariant": "fullscreen",
    "modalTitle": "default",
    "consumesModalComponent": true,
    "transition": "slide-up-enter, slide-down-exit",
    "dismissAction": "page-level-save",
    "overlayLevel": "overlay",
    "coversTabBar": true,
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
      { "binding_id": "publish-navbar", "slug": "navbar", "reason": "发布产品顶部导航：左侧取消文本、中间标题、右侧发布强按钮（entity-form 全屏模态）", "variant_dimensions": { "leftControl": "cancel", "titleAlignment": "center", "actions": "button", "rightActionType": "button", "spacing": "default", "pageTransition": "present", "position": "sticky" } }
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
   - 发布后写入 localStorage，新产品出现在动态流（动态流场景读取） */

(function () {
  'use strict';

  var DB = window.WEGO_PROTOTYPE_DB || {};
  var CURRENT_USER = DB.currentUser || {};
  var PRODUCTS = DB.products || [];

  var PUBLISHED_KEY = 'wego.album-feed.published';

  var ASSET_IMAGES = [];
  PRODUCTS.forEach(function (p) {
    if (p.image_list && p.image_list[0] && ASSET_IMAGES.indexOf(p.image_list[0]) < 0) {
      ASSET_IMAGES.push(p.image_list[0]);
    }
  });

  function loadPublished() {
    try {
      var raw = window.localStorage.getItem(PUBLISHED_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* 忽略 */ }
    return [];
  }

  function savePublished(list) {
    try {
      window.localStorage.setItem(PUBLISHED_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }

  function defaultForm() {
    return {
      name: '', shortName: '', sku: '', takePrice: '', salePrice: '', groupPrice: '',
      wholesalePrice: '', packPrice: '', specs: [], colors: [], stock: '', weight: '',
      tags: [], source: [], freight: '', remark: '', subAccount: '', images: [], resale: null
    };
  }

  var formState = defaultForm();

  function esc(s) {
    return String(s == null ? '' : s)
      .split('&').join('&amp;')
      .split('<').join('&lt;')
      .split('>').join('&gt;')
      .split('"').join('&quot;')
      .split("'").join('&#39;');
  }

  /* ── 运行时局部刷新模板（用于标签、图片、帮卖摘要的动态更新）── */
  function tagsHtml(key) {
    var list = formState[key] || [];
    return list.map(function (v) {
      return '<span class="tag publish-product__tag" data-component-slug="tag">' + esc(v)
        + '<button type="button" class="publish-product__tag-remove" data-remove-value="' + esc(v) + '" data-tag-of="' + key + '" aria-label="删除">×</button></span>';
    }).join('');
  }

  function imagesHtml() {
    return formState.images.map(function (src, idx) {
      return '<div class="publish-product__img-item"><img src="' + esc(src) + '" alt="" /><button type="button" class="publish-product__img-remove" data-remove-img="' + idx + '" aria-label="移除">×</button></div>';
    }).join('');
  }

  function resaleSummary() {
    if (!formState.resale || !formState.resale.distribution_type) return '未开启';
    var type = formState.resale.distribution_type === 2 ? '固定佣金' : '自由定价';
    var cfg = formState.resale.distribution_config || {};
    var add = cfg.amountType === 2 ? ((cfg.rate || 0) * 100) + '%' : ('+' + (cfg.value || 0));
    return type + ' · ' + add;
  }

  /* ── 主模板已内联至 registerScene.template ── */

  /* ── 帮卖设置弹窗（半屏 sheet，运行时打开）── */
  function resaleSheetTemplate() {
    var resale = formState.resale || { distribution_type: 1, distribution_config: { amountType: 1, value: 30 } };
    var amount = resale.distribution_config && resale.distribution_config.amountType === 1;
    var amountVal = resale.distribution_config ? (resale.distribution_config.value || '') : '';
    var rateVal = resale.distribution_config && resale.distribution_config.rate != null ? (resale.distribution_config.rate * 100) : '30';

    return '<div class="actionsheet publish-product__resale-sheet" role="dialog" aria-modal="true" data-component-slug="actionsheet">'
      + '<div class="actionsheet__panel">'
      + '<div class="actionsheet__header">帮卖设置</div>'
      + '<div class="publish-product__resale-body">'
      + '<div class="publish-product__resale-label">帮卖方式</div>'
      + '<div class="publish-product__resale-options">'
      + '<button type="button" class="publish-product__resale-option' + (resale.distribution_type === 1 ? ' is-selected' : '') + '" data-resale-type="1"><span class="publish-product__resale-option-title">自由定价</span><span class="publish-product__resale-option-desc">代理商可自行设置加价</span></button>'
      + '<button type="button" class="publish-product__resale-option' + (resale.distribution_type === 2 ? ' is-selected' : '') + '" data-resale-type="2"><span class="publish-product__resale-option-title">固定佣金</span><span class="publish-product__resale-option-desc">按固定佣金结算</span></button>'
      + '</div>'
      + '<div class="publish-product__resale-label">加价规则</div>'
      + '<div class="publish-product__resale-amount">'
      + '<button type="button" class="publish-product__resale-tab' + (amount ? ' is-on' : '') + '" data-amount-tab="1">按金额</button>'
      + '<button type="button" class="publish-product__resale-tab' + (!amount ? ' is-on' : '') + '" data-amount-tab="2">按比例</button>'
      + '</div>'
      + '<div class="publish-product__resale-input-row">'
      + '<input class="publish-product__resale-input" type="number" data-amount-input value="' + (amount ? amountVal : rateVal) + '" />'
      + '<span class="publish-product__resale-unit" data-amount-unit>' + (amount ? '元' : '%') + '</span>'
      + '</div>'
      + '</div>'
      + '<div class="publish-product__resale-footer">'
      + '<button type="button" class="btn btn--strong btn--lg publish-product__resale-save" data-component-slug="button" data-dom-id="resale-save">保存</button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  function imagePickerTemplate() {
    var html = '<div class="actionsheet" role="dialog" aria-modal="true" data-component-slug="actionsheet">'
      + '<div class="actionsheet__panel">'
      + '<div class="actionsheet__header">选择商品图片</div>'
      + '<div class="publish-product__picker-grid">';
    ASSET_IMAGES.forEach(function (src) {
      html += '<button type="button" class="publish-product__picker-item" data-pick-image="' + esc(src) + '"><img src="' + esc(src) + '" alt="" /></button>';
    });
    html += '</div>'
      + '<button type="button" class="actionsheet__cancel" data-dom-id="close-picker">取 消</button>'
      + '</div></div>';
    return html;
  }

  window.WegoApp.registerScene({
    routeId: 'publish-product',
    template: `
<div class="modal modal--fullscreen publish-product" data-surface-id="publish-product" data-route-id="publish-product" data-component-slug="modal" data-state="open" role="dialog" aria-modal="true" aria-label="发布产品" style="--modal-panel-bg: var(--bg-page)">
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
    <div class="modal__body modal__body--safe-bottom publish-product__scroll" data-component-slug="layout-scroll">

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
</div>`,
    presentation: { type: 'full-screen-modal', transition: 'slide-left', coversTabBar: true },
    init: function initPublish(ctx) {
      var root = ctx.root;
      var scroll = root.querySelector('.publish-product__scroll');

      var backBtn = root.querySelector('[data-dom-id="publish-cancel"]');
      var submitBtn = root.querySelector('[data-dom-id="publish-submit"]');
      var autoSku = root.querySelector('[data-dom-id="auto-sku"]');
      var addImageBtn = root.querySelector('[data-dom-id="open-image-picker"]');
      var resaleEntryEl = root.querySelector('[data-dom-id="open-resale-sheet"]');

      function getVal(id) {
        var el = root.querySelector('[data-form-field="' + id + '"]');
        return el ? el.value.trim() : '';
      }

      function collectForm() {
        formState.name = getVal('f-name');
        formState.shortName = getVal('f-shortName');
        formState.sku = getVal('f-sku');
        formState.takePrice = getVal('f-takePrice');
        formState.salePrice = getVal('f-salePrice');
        formState.groupPrice = getVal('f-groupPrice');
        formState.wholesalePrice = getVal('f-wholesalePrice');
        formState.packPrice = getVal('f-packPrice');
        formState.stock = getVal('f-stock');
        formState.weight = getVal('f-weight');
        formState.freight = getVal('f-freight');
        formState.remark = getVal('f-remark');
        formState.subAccount = getVal('f-subAccount');
      }

      function refreshTagList(key) {
        var list = root.querySelector('[data-tag-list="' + key + '"]');
        if (list) list.innerHTML = tagsHtml(key);
      }

      function refreshImages() {
        var wrap = root.querySelector('[data-image-list]');
        if (wrap) wrap.innerHTML = imagesHtml();
      }

      function refreshResale() {
        var v = root.querySelector('[data-resale-value]');
        if (v) v.textContent = resaleSummary();
      }

      function doPublish() {
        collectForm();
        if (!formState.name) { ctx.toast('请填写产品名'); return; }
        if (!formState.salePrice) { ctx.toast('请填写售价'); return; }
        if (window.WegoApp.faultInjection && window.WegoApp.faultInjection.isEnabled('save')) {
          ctx.toast('发布失败，请稍后重试');
          return;
        }

        var ts = Date.now();
        var productId = 'pub-prod-' + ts;
        var published = loadPublished();
        var maxOrder = 0;
        (DB.dynamics || []).concat(published).forEach(function (d) { if (Number(d.published_order) > maxOrder) maxOrder = Number(d.published_order); });

        var newDynamic = {
          dynamic_id: 'dyn-pub-' + ts,
          publisher_id: CURRENT_USER.user_id,
          published_at: '刚刚',
          published_order: maxOrder + 1,
          content_type: 'product',
          text_content: formState.remark || '',
          media_list: formState.images.map(function (src) { return { media_id: 'm-' + ts, media_type: 'image', poster_or_src: src }; }),
          related_product_ids: [productId],
          resale: formState.resale && formState.resale.distribution_type ? formState.resale : null,
          _product: {
            product_id: productId,
            name: formState.name,
            price: Number(formState.salePrice) || 0,
            currency: 'CNY',
            unit: '件',
            selling_points: formState.tags || [],
            detail_sections: [],
            image_list: formState.images.slice(),
            feed_text: formState.remark || ''
          }
        };

        published.unshift(newDynamic);
        savePublished(published);
        ctx.toast('发布成功');
        ctx.navigate('album-product-feed');
      }

      /* 事件委托 */
      scroll.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('[data-dom-id],[data-remove-value],[data-remove-img],[data-public-toggle]') : null;
        if (!t) return;

        if (t.hasAttribute('data-remove-value')) {
          var key = t.getAttribute('data-tag-of');
          var val = t.getAttribute('data-remove-value');
          formState[key] = (formState[key] || []).filter(function (x) { return x !== val; });
          refreshTagList(key);
        } else if (t.hasAttribute('data-remove-img')) {
          formState.images.splice(Number(t.getAttribute('data-remove-img')), 1);
          refreshImages();
        } else if (t.hasAttribute('data-public-toggle')) {
          var isPublic = t.textContent === '公开';
          t.textContent = isPublic ? '隐藏' : '公开';
          t.classList.toggle('is-hidden', isPublic);
        }
      });

      scroll.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var input = e.target.closest ? e.target.closest('[data-tag-input]') : null;
          if (input) {
            e.preventDefault();
            var key = input.getAttribute('data-tag-input');
            var val = input.value.trim();
            if (!val) return;
            var list = formState[key] || [];
            if (list.indexOf(val) < 0) list.push(val);
            formState[key] = list;
            input.value = '';
            refreshTagList(key);
          }
        }
      });

      if (backBtn) backBtn.addEventListener('click', function () { ctx.navigate('album-product-feed'); });
      if (submitBtn) submitBtn.addEventListener('click', doPublish);
      if (autoSku) autoSku.addEventListener('click', function () {
        var skuEl = root.querySelector('[data-form-field="f-sku"]');
        if (skuEl) skuEl.value = 'SP' + String(Date.now()).slice(-6);
      });
      if (addImageBtn) addImageBtn.addEventListener('click', function () { openImagePicker(); });
      if (resaleEntryEl) resaleEntryEl.addEventListener('click', function () { openResaleSheet(); });

      function openResaleSheet() {
        ctx.openSheet(resaleSheetTemplate(), {
          label: '帮卖设置',
          init: function (sheetCtx) {
            var sheetRoot = sheetCtx.root;
            var currentType = (formState.resale && formState.resale.distribution_type) || 1;
            var currentCfg = (formState.resale && formState.resale.distribution_config) || { amountType: 1, value: 30 };

            function renderAmount() {
              var isAmount = currentCfg.amountType === 1;
              var input = sheetRoot.querySelector('[data-amount-input]');
              var unit = sheetRoot.querySelector('[data-amount-unit]');
              if (input) input.value = isAmount ? (currentCfg.value || '') : ((currentCfg.rate || 0) * 100);
              if (unit) unit.textContent = isAmount ? '元' : '%';
            }

            sheetRoot.querySelectorAll('[data-resale-type]').forEach(function (b) {
              b.addEventListener('click', function () {
                currentType = Number(b.getAttribute('data-resale-type'));
                sheetRoot.querySelectorAll('[data-resale-type]').forEach(function (x) { x.classList.toggle('is-selected', x === b); });
              });
            });
            sheetRoot.querySelectorAll('[data-amount-tab]').forEach(function (b) {
              b.addEventListener('click', function () {
                currentCfg.amountType = Number(b.getAttribute('data-amount-tab'));
                sheetRoot.querySelectorAll('[data-amount-tab]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
                renderAmount();
              });
            });
            var saveBtn = sheetRoot.querySelector('[data-dom-id="resale-save"]');
            if (saveBtn) saveBtn.addEventListener('click', function () {
              var input = sheetRoot.querySelector('[data-amount-input]');
              var raw = input ? input.value : '';
              if (currentCfg.amountType === 2) {
                currentCfg.rate = Number(raw) / 100;
                delete currentCfg.value;
              } else {
                currentCfg.value = Number(raw);
                delete currentCfg.rate;
              }
              formState.resale = { distribution_type: currentType, distribution_config: currentCfg };
              ctx.closeOverlay();
              refreshResale();
              ctx.toast('帮卖设置已保存');
            });
          }
        });
      }

      function openImagePicker() {
        ctx.openSheet(imagePickerTemplate(), {
          label: '选择商品图片',
          init: function (pickerCtx) {
            var pRoot = pickerCtx.root;
            pRoot.querySelectorAll('[data-pick-image]').forEach(function (b) {
              b.addEventListener('click', function () {
                var src = b.getAttribute('data-pick-image');
                if (formState.images.indexOf(src) < 0) formState.images.push(src);
                ctx.closeOverlay();
                refreshImages();
              });
            });
            var cancel = pRoot.querySelector('[data-dom-id="close-picker"]');
            if (cancel) cancel.addEventListener('click', function () { ctx.closeOverlay(); });
          }
        });
      }
    }
  });
})();
