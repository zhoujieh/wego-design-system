/* 产品编辑页（统一产品编辑，业务组件，全局加载）
   - 业务场景：产品发布/编辑/转发——统一产品信息编辑入口，发布/转发/编辑三模式共用。
   - 适用场景：动态页（FAB 发布/转发/编辑）、我的页（发布/编辑）、发布产品（直链 #/publish-product）。
   - 消费方式：window.WegoApp.openProductEditor(ctx, options)；options.mode 为 publish/forward/edit。
   - 直链场景 #/publish-product 仍由 scenes/发布产品/scene.js 注册，其 init 调用 WegoApp.initProductEditor。
   - 依赖：window.WegoApp（app.js）、window.WEGO_PROTOTYPE_DB（prototype-db.js）、
     window.WegoApp.openResalePopup（resale-popup.js，需在其后加载）。 */

(function () {
  'use strict';

  var WegoApp = (window.WegoApp = window.WegoApp || {});


  var DB = window.WEGO_PROTOTYPE_DB || {};
  var CURRENT_USER = DB.currentUser || {};
  var PRODUCTS = DB.products || [];

  var PUBLISHED_KEY = 'wego.album-feed.published';

  /* 微购相册素材库：收集全部种子产品的所有图片（去重），供「从微购相册选」展示 */
  var ASSET_IMAGES = [];
  PRODUCTS.forEach(function (p) {
    (p.image_list || []).forEach(function (src) {
      if (src && ASSET_IMAGES.indexOf(src) < 0) ASSET_IMAGES.push(src);
    });
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
      tags: [], source: [], freight: '', remark: '', subAccount: '', images: [], videos: [], resale: null
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
    var html = formState.images.map(function (src, idx) {
      return '<div class="publish-product__img-item"><img src="' + esc(src) + '" alt="" /><button type="button" class="publish-product__img-remove" data-remove-img="' + idx + '" aria-label="移除">×</button></div>';
    }).join('');
    html += formState.videos.map(function (src, idx) {
      return '<div class="publish-product__img-item"><video class="publish-product__img-video" src="' + esc(src) + '" controls muted playsinline></video><button type="button" class="publish-product__img-remove" data-remove-video="' + idx + '" aria-label="移除">×</button></div>';
    }).join('');
    /* 添加入口与已选图片同网格布局、永远在最后 */
    html += '<button type="button" class="publish-product__img-add" data-dom-id="open-image-picker" aria-label="添加图片"><i class="wego-iconfont-s icon-shangchuantupian" aria-hidden="true"></i><span>添加图片</span></button>';
    return html;
  }

  function resaleSummary() {
    if (!formState.resale || !formState.resale.distribution_type) return '未开启';
    var type = formState.resale.distribution_type === 2 ? '固定佣金' : '自由定价';
    var cfg = formState.resale.distribution_config || {};
    var add = cfg.amountType === 2 ? ((cfg.rate || 0) * 100) + '%' : ('+' + (cfg.value || 0));
    return type + ' · ' + add;
  }

  /* ── 主模板（全屏模态：modal--fullscreen 满屏覆盖、无遮罩，来源页被完全盖住；背景由 --modal-panel-bg 提供）── */
  var PUBLISH_TEMPLATE = `
<div class="modal modal--fullscreen publish-product" data-surface-id="publish-product" data-route-id="publish-product" data-component-slug="modal" data-state="open" role="dialog" aria-modal="true" aria-label="发布产品" style="--modal-panel-bg: var(--bg-page)">
  <div class="modal__panel">
    <div class="modal__title modal__title--default">
      <div class="navbar" data-component-slug="navbar">
        <div class="navbar__body navbar__body--spaced">
          <div class="navbar__left"><button type="button" class="navbar__left-text" data-dom-id="publish-cancel" aria-label="取消">取消</button></div>
          <div class="navbar__center"></div>
          <div class="navbar__right navbar__right--custom">
            <button type="button" class="btn btn--weak btn--sm btn--icon-only" data-component-slug="button" data-dom-id="quick-share" aria-label="快捷分享">
              <i class="btn__icon icon-pengyouquan" data-quick-share-icon aria-hidden="true"></i>
            </button>
            <button type="button" class="btn btn--weak btn--sm" data-component-slug="button" data-dom-id="publish-share">分享</button>
            <button type="button" class="btn btn--strong btn--sm" data-component-slug="button" data-dom-id="publish-submit" data-publish-submit-label>发布</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal__body modal__body--safe-bottom publish-product__scroll" data-component-slug="layout-scroll">

      <div class="form-group">
        <div class="form-group__title">商品图片</div>
        <div class="form-group__content"><div class="publish-product__image-wrap">
          <div class="publish-product__images" data-image-list></div>
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

  /* 选图来源 actionsheet：从手机相册选 / 从微购相册选 */
  function pickerSourceTemplate() {
    return '<div class="actionsheet" role="dialog" aria-modal="true" data-component-slug="actionsheet">'
      + '<div class="actionsheet__panel">'
      + '<div class="actionsheet__header actionsheet__header--text"><span class="actionsheet__header-text">选择商品图片</span></div>'
      + '<div class="publish-product__picker-source">'
      + '<button type="button" class="publish-product__picker-source-item" data-dom-id="pick-phone"><span>从手机相册选</span><i class="publish-product__picker-arrow" aria-hidden="true">›</i></button>'
      + '<button type="button" class="publish-product__picker-source-item" data-dom-id="pick-album"><span>从微购相册选</span><i class="publish-product__picker-arrow" aria-hidden="true">›</i></button>'
      + '</div>'
      + '<div class="actionsheet__cancel-gap"></div>'
      + '<button type="button" class="actionsheet__cancel" data-dom-id="close-source">取 消</button>'
      + '</div></div>';
  }

  /* 微购相册选图面板：展示全部种子图片，多选 + 底部确定 */
  function albumPickerTemplate() {
    var html = '<div class="actionsheet" role="dialog" aria-modal="true" data-component-slug="actionsheet">'
      + '<div class="actionsheet__panel publish-product__album-panel">'
      + '<div class="actionsheet__header actionsheet__header--text"><span class="actionsheet__header-text">从微购相册选择</span></div>'
      + '<div class="publish-product__album-grid" data-album-grid>';
    ASSET_IMAGES.forEach(function (src) {
      html += '<button type="button" class="publish-product__album-item" data-pick-album="' + esc(src) + '" aria-pressed="false"><img src="' + esc(src) + '" alt="" loading="lazy" decoding="async" /></button>';
    });
    html += '</div>'
      + '<div class="publish-product__album-footer">'
      + '<button type="button" class="actionsheet__cancel publish-product__album-cancel" data-dom-id="close-album">取 消</button>'
      + '<button type="button" class="btn btn--strong publish-product__album-confirm" data-dom-id="album-confirm">确定(<span data-album-count>0</span>)</button>'
      + '</div>'
      + '</div></div>';
    return html;
  }

  /* 发布产品初始化（场景直链 / overlay 模态 共用）
     - ctx：场景上下文或 overlay 上下文（overlay 模式下由 openProductEditor 补齐 openSheet/closeOverlay API）
     - triggerCtx：拉起本模态的来源场景上下文（用于发布成功后跳转 album-product-feed）；overlay 模式必传 */
  function initProductEditor(ctx, triggerCtx) {
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
      if (wrap) {
        wrap.innerHTML = imagesHtml();
        /* 添加入口由 imagesHtml 动态渲染在网格末尾，每次渲染后重新绑定点击 */
        var addBtn = wrap.querySelector('[data-dom-id="open-image-picker"]');
        if (addBtn) addBtn.addEventListener('click', function () { openImagePicker(); });
      }
    }

    function refreshResale() {
      var v = root.querySelector('[data-resale-value]');
      if (v) v.textContent = resaleSummary();
    }

    /* 发布前校验 + 保存当前产品（不关闭页面、不提示成功）。
       分享/快捷分享前置复用：校验通过后才保存并继续分享，取消分享保持页面继续编辑。
       校验规则：标题与图片（含视频）至少填一项即可保存；都为空时提示。售价等其余字段非必填。 */
    function saveProduct() {
      collectForm();
      var hasMedia = !!(formState.images && formState.images.length) || !!(formState.videos && formState.videos.length);
      if (!formState.name && !hasMedia) { ctx.toast('请填写标题或选择图片'); return false; }
      if (window.WegoApp.faultInjection && window.WegoApp.faultInjection.isEnabled('save')) {
        ctx.toast('发布失败，请稍后重试');
        return false;
      }

      var ts = Date.now();
      var productId = 'pub-prod-' + ts;
      var published = loadPublished();
      var maxOrder = 0;
      (DB.dynamics || []).concat(published).forEach(function (d) { if (Number(d.published_order) > maxOrder) maxOrder = Number(d.published_order); });

      var mediaList = formState.images.map(function (src) {
        return { media_id: 'm-' + ts, media_type: 'image', poster_or_src: src };
      }).concat(formState.videos.map(function (src) {
        return { media_id: 'mv-' + ts, media_type: 'video', poster_or_src: src };
      }));

      var newDynamic = {
        dynamic_id: 'dyn-pub-' + ts,
        publisher_id: CURRENT_USER.user_id,
        published_at: '刚刚',
        published_order: maxOrder + 1,
        content_type: 'product',
        text_content: formState.remark || '',
        media_list: mediaList,
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
      window.dispatchEvent(new CustomEvent('wego:product-published'));
      return true;
    }

    function doPublish() {
      if (!saveProduct()) return;
      var successMsg = mode === 'forward' ? '转发成功' : (mode === 'edit' ? '保存成功' : '发布成功');
      ctx.toast(successMsg);
      ctx.closeOverlay();
      /* overlay 模式：标记待跳转，等本模态退场（onDestroy）后再 navigate，
         避开 closeOverlay(history.back) 与 navigate 的历史竞争（与类型选择面板同款处理） */
      if (triggerCtx && typeof ctx.requestGoToFeed === 'function') {
        ctx.requestGoToFeed();
      } else {
        ctx.navigate('album-product-feed');
      }
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
      } else if (t.hasAttribute('data-remove-video')) {
        formState.videos.splice(Number(t.getAttribute('data-remove-video')), 1);
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

    if (backBtn) backBtn.addEventListener('click', function () { ctx.closeOverlay(); });
    if (submitBtn) submitBtn.addEventListener('click', doPublish);

    /* 分享和快捷分享按钮 */
    var shareBtn = root.querySelector('[data-dom-id="publish-share"]');
    var quickShareBtn = root.querySelector('[data-dom-id="quick-share"]');
    var quickShareIcon = quickShareBtn ? quickShareBtn.querySelector('[data-quick-share-icon]') : null;
    var submitLabel = root.querySelector('[data-publish-submit-label]');

    /* 根据模式更新提交按钮文案（发布/编辑不显示导航栏标题） */
    var mode = ctx._publishMode || 'publish';
    if (mode === 'forward') {
      if (submitLabel) submitLabel.textContent = '转发';
    } else if (mode === 'edit') {
      if (submitLabel) submitLabel.textContent = '保存';
    }

    /* 更新快捷分享按钮图标（纯图标正方形按钮，样式与「分享」按钮一致）
       - 图标复用分享面板（product-share.js CHANNELS）同一套渠道图标：有 iconSvg 用 SVG 品牌图标（与分享面板渠道栏一致），
         无 iconSvg（如更多）退回 iconfont 字形
       - 只关联渠道栏内的内容：miniprogramOnly 渠道（如复制链接）不在主分享面板渠道栏，回退默认朋友圈 */
    function refreshQuickShare() {
      if (!window.WegoApp || !window.WegoApp.getChannel) return;
      var ch = window.WegoApp.getQuickChannel();
      var info = window.WegoApp.getChannel(ch);
      if (!info || info.miniprogramOnly) info = window.WegoApp.getChannel('moments');
      if (quickShareIcon) {
        if (info.iconSvg) {
          quickShareIcon.className = 'btn__icon btn__icon--quick';
          quickShareIcon.innerHTML = '<img class="btn__icon-img" src="' + info.iconSvg + '" alt="' + info.name + '" />';
        } else {
          quickShareIcon.className = 'btn__icon ' + info.icon;
          quickShareIcon.innerHTML = '';
        }
      }
      if (quickShareBtn) quickShareBtn.setAttribute('aria-label', '快捷分享到' + info.name);
    }
    refreshQuickShare();

    /* 收集当前产品数据用于分享 */
    function collectShareContent() {
      collectForm();
      return {
        id: 'pub-' + Date.now(),
        title: formState.name || '',
        images: formState.images.slice(),
        videos: formState.videos.slice(),
        isOwn: true
      };
    }

    /* 分享完成后的处理：关闭页面，弹对应提示 */
    function onShareComplete() {
      var successMsg = mode === 'forward' ? '转发成功' : (mode === 'edit' ? '保存成功' : '发布成功');
      ctx.toast(successMsg);
      ctx.closeOverlay();
      if (triggerCtx && typeof ctx.requestGoToFeed === 'function') {
        ctx.requestGoToFeed();
      } else {
        ctx.navigate('album-product-feed');
      }
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        /* 发布前校验 + 保存（不关闭页面）；通过后才拉起分享面板，取消分享保持当前页继续编辑 */
        if (!saveProduct()) return;
        if (window.WegoApp && window.WegoApp.openProductShare) {
          window.WegoApp.openProductShare(ctx, {
            content: collectShareContent(),
            callbacks: {
              onSuccess: function () {
                refreshQuickShare();
                onShareComplete();
              }
              /* 取消/关闭分享面板：无 onClose 处理 → 保持当前发布页 */
            }
          });
        }
      });
    }

    if (quickShareBtn) {
      quickShareBtn.addEventListener('click', function () {
        /* 快捷分享：先只做表单校验（不入库），分享成功后才保存入库；
           避免分享因「暂无图片」等失败时产品已写入动态（B8） */
        collectForm();
        var hasMedia = !!(formState.images && formState.images.length) || !!(formState.videos && formState.videos.length);
        if (!formState.name && !hasMedia) { ctx.toast('请填写标题或选择图片'); return; }
        if (window.WegoApp.faultInjection && window.WegoApp.faultInjection.isEnabled('save')) {
          ctx.toast('发布失败，请稍后重试');
          return;
        }
        if (window.WegoApp && window.WegoApp.simulateShare) {
          var ch = window.WegoApp.getQuickChannel();
          window.WegoApp.simulateShare(ctx, ch, collectShareContent(), {
            onSuccess: function () {
              /* 分享完成才视为发布，入库后收口 */
              if (!saveProduct()) return;
              onShareComplete();
            }
          });
        }
      });
    }
    if (autoSku) autoSku.addEventListener('click', function () {
      var skuEl = root.querySelector('[data-form-field="f-sku"]');
      if (skuEl) skuEl.value = 'SP' + String(Date.now()).slice(-6);
    });
    /* 添加入口由 refreshImages 动态渲染并绑定（见 refreshImages），此处不再重复绑定 */
    if (resaleEntryEl) resaleEntryEl.addEventListener('click', function () { openResaleSheet(); });

    function openResaleSheet() {
      var resale = formState.resale || { distribution_type: 1, distribution_config: { amountType: 1, value: 30 } };
      var supplyPrice = Number(formState.takePrice) || Number(formState.wholesalePrice) || 0;
      window.WegoApp.openResalePopup(ctx, {
        mode: 'configure',
        sample: {
          product_id: 'pub-product',
          distribution_type: resale.distribution_type,
          distribution_config: resale.distribution_config,
          supply_price: supplyPrice,
          skus: [{ id: 'sku-1', supply_price: supplyPrice }],
          my_item: false,
          from_page: 'normal'
        },
        onResult: function (cfg) {
          formState.resale = { distribution_type: cfg.distribution_type, distribution_config: cfg.distribution_config };
          refreshResale();
          ctx.toast('帮卖设置已保存');
        }
      });
    }

    /* 手机相册：真实调用系统相册（file input，图片+视频多选），点击后直接拉起不再二次选择。
       选取后先以 objectURL 立即预览，再转 base64 用于发布持久化（图片压缩本期不处理）。 */
    function openPhonePicker() {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      input.multiple = true;
      input.addEventListener('change', function () {
        var files = input.files;
        if (!files || !files.length) return;
        Array.prototype.forEach.call(files, function (file) {
          if (!file.type) return;
          var isVideo = file.type.indexOf('video/') === 0;
          var isImage = file.type.indexOf('image/') === 0;
          if (!isVideo && !isImage) return;
          var objectUrl = URL.createObjectURL(file);
          var list = isVideo ? formState.videos : formState.images;
          if (list.indexOf(objectUrl) >= 0) return;
          list.push(objectUrl);
          /* 转 base64：替换 objectURL，保证刷新后仍可预览、发布可持久化 */
          var reader = new FileReader();
          reader.onload = function () {
            var target = isVideo ? formState.videos : formState.images;
            var i = target.indexOf(objectUrl);
            if (i >= 0) {
              target[i] = reader.result;
              refreshImages();
            }
          };
          reader.onerror = function () {
            var target = isVideo ? formState.videos : formState.images;
            var i = target.indexOf(objectUrl);
            if (i >= 0) { target.splice(i, 1); refreshImages(); }
          };
          reader.readAsDataURL(file);
        });
        refreshImages();
      });
      input.click();
    }

    /* 微购相册选图面板：展示全部种子图片，多选 + 底部「确定(n)」合并 */
    function openAlbumPicker() {
      var selected = [];
      ctx.openSheet(albumPickerTemplate(), {
        label: '从微购相册选择',
        init: function (pickerCtx) {
          var pRoot = pickerCtx.root;
          var countEl = pRoot.querySelector('[data-album-count]');
          function refreshCount() {
            if (countEl) countEl.textContent = selected.length;
          }
          pRoot.querySelectorAll('[data-pick-album]').forEach(function (b) {
            b.addEventListener('click', function () {
              var src = b.getAttribute('data-pick-album');
              var i = selected.indexOf(src);
              if (i >= 0) {
                selected.splice(i, 1);
                b.classList.remove('is-selected');
                b.setAttribute('aria-pressed', 'false');
              } else {
                selected.push(src);
                b.classList.add('is-selected');
                b.setAttribute('aria-pressed', 'true');
              }
              refreshCount();
            });
          });
          var confirm = pRoot.querySelector('[data-dom-id="album-confirm"]');
          if (confirm) confirm.addEventListener('click', function () {
            selected.forEach(function (src) {
              if (formState.images.indexOf(src) < 0) formState.images.push(src);
            });
            pickerCtx.close();
            refreshImages();
          });
          var cancel = pRoot.querySelector('[data-dom-id="close-album"]');
          if (cancel) cancel.addEventListener('click', function () { pickerCtx.close(); });
        }
      });
    }

    function openImagePicker() {
      ctx.openSheet(pickerSourceTemplate(), {
        label: '选择商品图片',
        init: function (pickerCtx) {
          var pRoot = pickerCtx.root;
          var phoneBtn = pRoot.querySelector('[data-dom-id="pick-phone"]');
          if (phoneBtn) phoneBtn.addEventListener('click', function () { pickerCtx.close(); openPhonePicker(); });
          var albumBtn = pRoot.querySelector('[data-dom-id="pick-album"]');
          if (albumBtn) albumBtn.addEventListener('click', function () { pickerCtx.close(); openAlbumPicker(); });
          var cancel = pRoot.querySelector('[data-dom-id="close-source"]');
          if (cancel) cancel.addEventListener('click', function () { pickerCtx.close(); });
        }
      });
    }

    /* 初始化渲染图片网格（含末位添加入口），保证空态也有添加按钮 */
    refreshImages();
  }

  /* 公共入口：作为 overlay 模态打开发布产品（与「点搜索」同源机制），来源页（动态/我的）保持挂载、内容不卸载。
     triggerCtx：来源场景上下文，需提供 openFullScreenModal / openSheet / navigate。
     在 overlay 上下文中补齐嵌套 openSheet / closeOverlay 所需 API（overlay 原生 init 上下文不携带这些方法）。 */
  window.WegoApp.openProductEditor = function (triggerCtx, options) {
    if (!triggerCtx || typeof triggerCtx.openFullScreenModal !== 'function') {
      console.warn('[wego-app] openProductEditor 需要有效的场景 ctx');
      return;
    }
    options = options || {};
    var mode = options.mode || 'publish';
    var pendingGoToFeed = false;
    triggerCtx.openFullScreenModal(PUBLISH_TEMPLATE, {
      label: mode === 'forward' ? '转发产品' : (mode === 'edit' ? '编辑产品' : '发布产品'),
      init: function (overlayCtx) {
        var api = Object.assign({}, overlayCtx, {
          openSheet: triggerCtx.openSheet,
          openFullScreenModal: triggerCtx.openFullScreenModal,
          closeOverlay: overlayCtx.close,
          back: overlayCtx.close,
          requestGoToFeed: function () { pendingGoToFeed = true; }
        });
        api._publishMode = mode;
        api._publishOptions = options;
        initProductEditor(api, triggerCtx);

        /* forward 模式：预填充产品数据 */
        if (mode === 'forward' && options.product) {
          var p = options.product;
          setTimeout(function () {
            var nameEl = api.root.querySelector('[data-form-field="f-name"]');
            if (nameEl && p.name) nameEl.value = p.name;
            if (p.image_list && p.image_list.length) {
              formState.images = p.image_list.slice();
              var wrap = api.root.querySelector('[data-image-list]');
              if (wrap) wrap.innerHTML = imagesHtml();
            }
            if (p.price) {
              var priceEl = api.root.querySelector('[data-form-field="f-salePrice"]');
              if (priceEl) priceEl.value = p.price;
            }
          }, 100);
        }
      },
      onDestroy: function () {
        if (pendingGoToFeed) {
          pendingGoToFeed = false;
          triggerCtx.navigate('album-product-feed');
        }
      }
    });
  };

  
  // 暴露给直链场景 init 与全局入口
  WegoApp.initProductEditor = initProductEditor;
  WegoApp.PUBLISH_TEMPLATE = PUBLISH_TEMPLATE;
})();
