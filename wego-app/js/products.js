(function initWegoProducts() {
  var STORAGE_KEY = 'wego.quickPublish.products.v1';
  var memoryProducts = [];
  var lastPublishedId = '';

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function readProducts() {
    // 演示数据(本会话内存,见 seedDemoProducts)不写 localStorage,
    // 避免污染用户真实发布数据;刷新后回到真实空态。
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return memoryProducts.slice();
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return memoryProducts.slice();
      // 有真实数据时,以真实数据为准(demo 仅用于无数据演示态)
      if (parsed.length === 0) return memoryProducts.slice();
      memoryProducts = parsed;
      return parsed.slice();
    } catch (error) { return memoryProducts.slice(); }
  }

  function writeProducts(products) {
    memoryProducts = products.slice();
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }
    catch (error) { /* 受限环境使用当前会话内存。 */ }
  }

  function uid() { return 'product-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }

  function fieldData(product, fieldId) {
    return product && product.fields && product.fields[fieldId] ? product.fields[fieldId] : { rawText: '', items: [] };
  }

  function fieldText(product, fieldId) { return String(fieldData(product, fieldId).rawText || '').trim(); }

  function structuredValues(product, fieldId) {
    var field = fieldData(product, fieldId);
    var items = Array.isArray(field.items) ? field.items : [];
    var values = [];
    var seen = {};
    items.forEach(function (item) {
      if (item.status !== 'recognized') return;
      var value = String(item.normalizedValue || item.value || '').trim();
      var valueKey = value.toLocaleLowerCase();
      if (!value || seen[valueKey]) return;
      seen[valueKey] = true;
      values.push(value);
    });
    return values;
  }

  function formatTime(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    var now = new Date();
    var sameDay = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
    if (sameDay) return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
    return (date.getMonth() + 1) + '月' + date.getDate() + '日';
  }

  function productSummary(product) {
    var parts = [];
    var specs = structuredValues(product, 'spec');
    var colors = structuredValues(product, 'color');
    if (specs.length) parts.push('规格 ' + specs.slice(0, 3).join('、'));
    if (colors.length) parts.push('颜色 ' + colors.slice(0, 3).join('、'));
    return parts.join(' · ');
  }

  function productSourceSummary(product) {
    var parts = [];
    var source = structuredValues(product, 'source');
    var tags = structuredValues(product, 'tag');
    if (source.length) parts.push('来源 ' + source.slice(0, 2).join('、'));
    if (tags.length) parts.push('标签 ' + tags.slice(0, 2).join('、'));
    return parts.join(' · ');
  }

  function productCardMarkup(product) {
    var title = fieldText(product, 'productName') || '未命名产品';
    var price = fieldText(product, 'price');
    var summary = productSummary(product);
    var secondary = productSourceSummary(product);
    var visibility = product.visibility === 'private' ? '仅自己可见' : '';
    var time = formatTime(product.createdAt || product.updatedAt);
    var image = '<span aria-hidden="true">' + esc(title.slice(0, 1) || '商') + '</span>';
    var meta = [summary, secondary, visibility, time].filter(Boolean);

    return ''
      + '<article class="card card--surface dynamic-product-card" data-product-id="' + esc(product.id) + '" role="button" tabindex="0" aria-label="编辑' + esc(title) + '">'
      +   '<div class="card__content dynamic-product-card__content">'
      +     '<div class="dynamic-product-card__media">' + image + '</div>'
      +     '<div class="dynamic-product-card__main">'
      +       '<div class="dynamic-product-card__primary">'
      +         '<h2 class="dynamic-product-card__title">' + esc(title) + '</h2>'
      +         (price ? '<p class="dynamic-product-card__price">¥' + esc(price) + '</p>' : '')
      +       '</div>'
      +       '<div class="dynamic-product-card__meta">'
      +         (meta.length ? meta.map(function (item, index) {
                  var className = index === meta.length - 1 && item === time ? 'dynamic-product-card__time' : 'dynamic-product-card__summary';
                  return '<span class="' + className + '">' + esc(item) + '</span>';
                }).join('') : '<span class="dynamic-product-card__summary dynamic-product-card__empty">暂无补充信息</span>')
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</article>';
  }

  function getProducts() {
    return readProducts().sort(function (a, b) {
      return new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime();
    });
  }

  function getProduct(id) {
    var products = readProducts();
    for (var i = 0; i < products.length; i++) if (products[i].id === id) return clone(products[i]);
    return null;
  }

  function ensureDynamicHost() {
    var body = document.querySelector('.host-dongtai-body');
    if (!body) return null;
    var list = body.querySelector('[data-dynamic-products]');
    if (!list) {
      body.innerHTML = '<div class="dynamic-product-list" data-dynamic-products aria-live="polite"></div><p class="host-shell-empty" data-dynamic-empty>还没有发布产品</p>';
      list = body.querySelector('[data-dynamic-products]');
    }
    return list;
  }

  function bindHostPublishButton() {
    var button = document.querySelector('.host-dongtai-navbar .btn');
    if (button) button.setAttribute('onclick', 'WegoProducts.startCreate()');
  }

  function render() {
    var list = ensureDynamicHost();
    var empty = document.querySelector('[data-dynamic-empty]');
    if (!list) return;
    var products = getProducts();
    list.innerHTML = products.map(productCardMarkup).join('');
    if (empty) empty.hidden = products.length > 0;
  }

  function ensurePublishSceneState() {
    if (!window.WegoApp) return null;
    var appState = window.WegoApp.getState();
    if (!appState.sceneState['quick-publish-product']) appState.sceneState['quick-publish-product'] = {};
    return appState.sceneState['quick-publish-product'];
  }

  function startCreate() {
    var state = ensurePublishSceneState();
    if (state) { state.editingProductId = ''; state.formState = null; }
    window.WegoApp.navigate('quick-publish-product');
  }

  function startEdit(productId) {
    if (!getProduct(productId)) return;
    var state = ensurePublishSceneState();
    if (state) { state.editingProductId = productId; state.formState = null; }
    window.WegoApp.navigate('quick-publish-product');
  }

  function saveProduct(payload) {
    var products = readProducts();
    var now = new Date().toISOString();
    var productId = payload && payload.id ? payload.id : uid();
    var existingIndex = -1;
    for (var i = 0; i < products.length; i++) if (products[i].id === productId) { existingIndex = i; break; }
    var existing = existingIndex >= 0 ? products[existingIndex] : null;
    var saved = {
      id: productId,
      fields: clone(payload.fields || {}),
      visibility: payload.visibility === 'private' ? 'private' : 'public',
      createdAt: existing && existing.createdAt ? existing.createdAt : now,
      updatedAt: now
    };
    if (existingIndex >= 0) products[existingIndex] = saved; else products.unshift(saved);
    writeProducts(products);
    lastPublishedId = saved.id;
    render();
    return clone(saved);
  }

  function showDynamic(productId) {
    lastPublishedId = productId || lastPublishedId;
    render();
    if (window.WegoApp) { window.WegoApp.setActiveTab('dongtai'); window.WegoApp.closeTopLayer(); }
  }

  document.addEventListener('click', function (event) {
    var card = event.target.closest('[data-product-id]');
    if (card) startEdit(card.dataset.productId);
  });

  document.addEventListener('keydown', function (event) {
    var card = event.target.closest && event.target.closest('[data-product-id]');
    if (!card || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    startEdit(card.dataset.productId);
  });

  window.addEventListener('storage', function (event) { if (event.key === STORAGE_KEY) render(); });

  function buildDemoProduct(seed) {
    return {
      id: 'demo-' + seed.id,
      fields: {
        productName: { rawText: seed.title, items: [] },
        price: { rawText: seed.price, items: [] },
        spec: { rawText: '', items: seed.specs.map(function (v) { return { value: v, normalizedValue: v, status: 'recognized' }; }) },
        color: { rawText: '', items: seed.colors.map(function (v) { return { value: v, normalizedValue: v, status: 'recognized' }; }) },
        source: { rawText: '', items: [{ value: seed.source, normalizedValue: seed.source, status: 'recognized' }] },
        tag: { rawText: '', items: seed.tags.map(function (v) { return { value: v, normalizedValue: v, status: 'recognized' }; }) }
      },
      visibility: 'public',
      createdAt: seed.createdAt,
      updatedAt: seed.createdAt
    };
  }

  function demoProducts() {
    var now = Date.now();
    return [
      buildDemoProduct({
        id: 'shirt',
        title: '基础纯棉长袖衬衫',
        price: '128.00',
        specs: ['L', 'XL'],
        colors: ['白色', '燕麦'],
        source: '自营工厂',
        tags: ['新品', '主推'],
        createdAt: new Date(now - 1000 * 60 * 4).toISOString()
      }),
      buildDemoProduct({
        id: 'jacket',
        title: '轻量户外机能夹克',
        price: '299.00',
        specs: ['M', 'L', 'XL'],
        colors: ['深灰', '军绿'],
        source: '联合开发',
        tags: ['上新'],
        createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString()
      }),
      buildDemoProduct({
        id: 'pants',
        title: '高腰直筒休闲长裤',
        price: '168.00',
        specs: ['S', 'M', 'L'],
        colors: ['黑色', '燕麦', '深咖'],
        source: '自营工厂',
        tags: ['主推'],
        createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString()
      })
    ];
  }

  function seedDemoProducts() {
    // 会话级 mock:仅当无任何已发布产品时,在内存里追加演示数据,
    // 不写 localStorage(避免污染用户真实发布数据,刷新后回到真实空态)。
    // 调用方(动态 Tab 增强脚本)需自行用 dataset 等机制确保本会话只调一次。
    if (readProducts().length > 0) return false;
    var demos = demoProducts();
    for (var i = 0; i < demos.length; i++) memoryProducts.unshift(demos[i]);
    return true;
  }

  window.WegoProducts = {
    getProducts: getProducts,
    getProduct: getProduct,
    saveProduct: saveProduct,
    render: render,
    startCreate: startCreate,
    startEdit: startEdit,
    showDynamic: showDynamic,
    seedDemoProducts: seedDemoProducts
  };

  bindHostPublishButton();
  render();
})();