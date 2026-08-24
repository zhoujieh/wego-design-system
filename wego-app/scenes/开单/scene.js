(function () {
  var CUSTOMERS = [
    { id: 'c1', name: '玛尼轰', phone: '玛尼大吉', mobile: '13800138001', address: '广东省深圳市南山区科技园18号', tag: '老客 · 微信好友、回头客', priceType: '8.5折', factor: 0.85, lastDelivery: 'express', lastAddress: { name: '玛尼大吉', phone: '13800138001', detail: '广东省深圳市南山区科技园18号' }, avatar: './scenes/开单/assets/customer-picker/customer-mani.png', number: '99812', level: 'V3', balance: 4000, points: 132, amount: '¥800.00', pieces: '2250', contact: '玛尼大吉', employee: '员工名称' },
    { id: 'c2', name: 'HZP-广州', phone: '刘嘿嘿', mobile: '13600136002', address: '广东省广州市越秀区站西路57号', tag: '老客 · 微信好友、回头客', priceType: '9.5折', factor: 0.95, lastDelivery: 'pickup', lastAddress: null, avatar: './scenes/开单/assets/customer-picker/customer-mani.png', number: '12345', level: 'V1', balance: 0, points: 100, amount: '¥0.00', pieces: '210', contact: '刘嘿嘿', employee: '员工名称' },
    { id: 'c3', name: '3857-简静', phone: '旺仔小馒头', mobile: '13583084433', address: '浙江省杭州市余杭区财富大厦3楼', tag: '老客 · 微信好友、回头客', priceType: '9.5折', factor: 0.95, lastDelivery: 'freight', lastAddress: { name: '旺仔小馒头', phone: '13583084433', detail: '浙江省杭州市余杭区财富大厦3楼' }, avatar: './scenes/开单/assets/customer-picker/customer-flower.jpg', number: '3857', level: 'V1', balance: 50, points: 100, amount: '¥50.00', pieces: '1030', contact: '旺仔小馒头', employee: '员工名称' }
  ];

  var RECENT_CUSTOMERS = [
    { name: 'Chen', avatar: './scenes/开单/assets/customer-picker/recent-chen.png', customerId: 'c3' },
    { name: '玛尼轰', avatar: './scenes/开单/assets/customer-picker/customer-mani.png', customerId: 'c1' },
    { name: '-FJW-', avatar: './scenes/开单/assets/customer-picker/recent-fjw.png', customerId: 'c2' },
    { name: 'A元气爬宠', avatar: './scenes/开单/assets/customer-picker/recent-pet.jpg', customerId: 'c3' },
    { name: '浮光记', avatar: './scenes/开单/assets/customer-picker/recent-light.jpg', customerId: 'c2' },
    { name: '🌸123FA', avatar: './scenes/开单/assets/customer-picker/customer-flower.jpg', customerId: 'c3' }
  ];

  var PRODUCTS = [
    { id: 'p1', code: 'TS-2408', name: '韩版休闲T恤', category: '上衣', tags: ['T恤'], source: '微购相册', listPrice: 89, costPrice: 42.72, lastDiscountPrice: 80, freightTemplate: { requiresRealName: true }, image: './lib/assets/image/clothing/clothing_2/clothing_2_1.jpg.jpg', specs: ['白色/S', '白色/M', '白色/L', '白色/XL', '黑色/S', '黑色/M', '黑色/L', '黑色/XL'] },
    { id: 'p2', code: 'JK-1082', name: '高腰牛仔短裤', category: '裤装', tags: ['牛仔'], source: '采购入库', listPrice: 129, image: './lib/assets/image/clothing/clothing_4/1663741015641_38566.jpg', specs: ['蓝色/27', '蓝色/28', '蓝色/29', '蓝色/30', '黑色/28', '黑色/30'] },
    { id: 'p3', code: 'DR-3610', name: '碎花连衣裙', category: '裙装', tags: ['连衣裙'], source: '微购相册', listPrice: 259, image: './lib/assets/image/clothing/clothing_5/1663741067252_48951.jpg', specs: ['粉色/S', '粉色/M', '粉色/L', '绿色/S', '绿色/M', '绿色/L'] },
    { id: 'p4', code: 'CT-2290', name: '羊毛针织开衫', category: '上衣', tags: ['针织'], source: '手动创建', listPrice: 199, image: './lib/assets/image/clothing/clothing_7/1663741042726_75173.jpg', specs: ['米白/M', '米白/L', '燕麦色/M', '燕麦色/L', '藏青/M', '藏青/L'] },
    { id: 'p5', code: 'JE-3507', name: '高腰直筒牛仔裤', category: '裤装', tags: ['牛仔'], source: '微购相册', listPrice: 159, image: './lib/assets/image/clothing/clothing_1/clothing_1_6.jpg', specs: ['浅蓝/27', '浅蓝/28', '浅蓝/29', '深蓝/28', '深蓝/29', '深蓝/30'] },
    { id: 'p6', code: 'JK-6631', name: '阔腿牛仔裤', category: '裤装', tags: ['牛仔'], source: '采购入库', listPrice: 179, image: './lib/assets/image/clothing/clothing_3/1663741004075_93363.jpg', specs: ['牛仔蓝/S', '牛仔蓝/M', '牛仔蓝/L', '黑色/S', '黑色/M', '黑色/L'] },
    { id: 'p7', code: 'DR-8812', name: '法式收腰连衣裙', category: '裙装', tags: ['连衣裙'], source: '微购相册', listPrice: 299, image: './lib/assets/image/clothing/clothing_13/1664276865081_87837.jpg', specs: ['杏色/S', '杏色/M', '杏色/L', '黑色/S', '黑色/M', '黑色/L'] },
    { id: 'p8', code: 'JK-9205', name: '休闲短款夹克', category: '上衣', tags: ['夹克'], source: '手动创建', listPrice: 249, image: './lib/assets/image/clothing/clothing_11/1663741015636_38129.jpg', specs: ['卡其/M', '卡其/L', '卡其/XL', '黑色/M', '黑色/L', '黑色/XL'] },
    { id: 'p9', code: 'JK-1180', name: '复古牛仔外套', category: '上衣', tags: ['牛仔', '外套'], source: '采购入库', listPrice: 269, image: './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092843_7820_16.jpg.jpg', specs: ['浅蓝/M', '浅蓝/L', '深蓝/M', '深蓝/L', '深蓝/XL'] },
    { id: 'p10', code: 'CT-6602', name: '气质长款大衣', category: '上衣', tags: ['大衣'], source: '微购相册', listPrice: 399, image: './lib/assets/image/clothing/clothing_15/1664277250602_34448.jpg', specs: ['驼色/M', '驼色/L', '黑色/M', '黑色/L', '黑色/XL'] },
    { id: 'p11', code: 'WS-3901', name: '简约连帽卫衣', category: '上衣', tags: ['卫衣'], source: '手动创建', listPrice: 189, image: './lib/assets/image/clothing/clothing_9/1663740558495_35610.jpg', specs: ['灰色/M', '灰色/L', '藏蓝/M', '藏蓝/L', '藏蓝/XL'] },
    { id: 'p12', code: 'DR-5516', name: '优雅中长裙', category: '裙装', tags: ['连衣裙'], source: '微购相册', listPrice: 329, image: './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092843_8369_2.jpg.jpg', specs: ['米色/S', '米色/M', '黑色/S', '黑色/M', '黑色/L'] }
  ];

  var PHONE_PRODUCTS = [
    { id: 'm1', code: 'APL-IP16P-OB-8-256', name: 'Apple iPhone 16 Pro 曜石黑 8GB+256GB', category: 'Apple', tags: ['Apple'], source: '采购入库', listPrice: 4299, stock: 1, image: './scenes/开单/assets/phones/phone-black.png', specs: ['标准规格'] },
    { id: 'm2', code: 'HW-M70-GB-12-256', name: 'HUAWEI Mate 70 冰川蓝 12GB+256GB', category: 'HUAWEI', tags: ['HUAWEI'], source: '采购入库', listPrice: 3699, stock: 1, image: './scenes/开单/assets/phones/phone-blue.png', specs: ['标准规格'] },
    { id: 'm3', code: 'HONOR-MV3-MS-16-512', name: 'HONOR Magic V3 月影银 16GB+512GB', category: 'HONOR', tags: ['HONOR'], source: '手动创建', listPrice: 7999, stock: 1, image: './scenes/开单/assets/phones/phone-fold.png', specs: ['标准规格'] },
    { id: 'm4', code: 'MI-15P-SG-16-512', name: 'Xiaomi 15 Pro 松林绿 16GB+512GB', category: 'Xiaomi', tags: ['Xiaomi'], source: '采购入库', listPrice: 5999, stock: 1, image: './scenes/开单/assets/phones/phone-green.png', specs: ['标准规格'] },
    { id: 'm5', code: 'OPPO-R14-OB-12-256', name: 'OPPO Reno14 曜石黑 12GB+256GB', category: 'OPPO', tags: ['OPPO'], source: '手动创建', listPrice: 2299, stock: 1, image: './scenes/开单/assets/phones/phone-black.png', specs: ['标准规格'] },
    { id: 'm6', code: 'VIVO-X200-GB-12-256', name: 'vivo X200 冰川蓝 12GB+256GB', category: 'vivo', tags: ['vivo'], source: '采购入库', listPrice: 6599, stock: 1, image: './scenes/开单/assets/phones/phone-fold.png', specs: ['标准规格'] }
  ];

  var MERCHANT_RECENT_PRODUCT_IDS = ['p3', 'p1', 'p2', 'p4'];

  var CATALOG_CATEGORIES = ['全部', '上衣', '裤装', '裙装', 'T恤', '牛仔', '针织', '连衣裙'];

  var USER_INDUSTRY = '服鞋箱包';
  var CURRENT_CLERK = { id: 'clerk-xiaowei', name: '小微' };
  var GUIDES = [
    { id: 'g1', name: '小林' },
    { id: 'g2', name: '小周' },
    { id: 'g3', name: '小陈' }
  ];

  var WAREHOUSES = [
    { id: 'w1', name: '默认仓库A', scope: '默认出货仓', stock: '可售 1,286 件' },
    { id: 'w2', name: '杭州九堡仓', scope: '直营网点常用', stock: '可售 842 件' },
    { id: 'w3', name: '广州十三行仓', scope: '批发备货仓', stock: '可售 2,130 件' }
  ];

  var PICKUP_POINTS = [
    { id: 'pp1', name: '南山科技园自提点', address: '深圳市南山区科技园18号一楼' },
    { id: 'pp2', name: '福田中心自提点', address: '深圳市福田区福华一路88号' }
  ];

  var PAYMENT_METHODS = [
    { id: 'wechat', label: '微信', icon: 'icon-weixin-mian' },
    { id: 'balance', label: '余额', icon: 'icon-qianbao-mian' },
    { id: 'alipay', label: '支付宝', icon: 'icon-zhifubao' },
    { id: 'bankcard', label: '银行卡', icon: 'icon-yinhangka-mian' },
    { id: 'scanpay', label: '扫码付款', icon: 'icon-shoukuan-mian' },
    { id: 'qrpay', label: '出示收款码', icon: 'icon-shoukuanma' },
    { id: 'cash', label: '现金', icon: 'icon-qian' }
  ];

  function storedDisplayMode() {
    try {
      var saved = window.localStorage.getItem('wego-order-display-mode');
      return saved === 'grouped' || saved === 'flat' ? saved : 'flat';
    } catch (error) {
      return 'flat';
    }
  }

  function storedCatalogCollapsed() {
    try {
      return window.localStorage.getItem('wego-order-catalog-collapsed') === 'true';
    } catch (error) {
      return false;
    }
  }

  function storedCatalogViewMode() {
    try {
      var saved = window.localStorage.getItem('wego-order-catalog-view-mode');
      if (saved === 'grid' || saved === 'list') return saved;
    } catch (error) {}
    return USER_INDUSTRY === '服鞋箱包' ? 'grid' : 'list';
  }

  function storedAddMode() {
    try {
      var saved = window.localStorage.getItem('wego-order-merchant-add-mode');
      return saved === 'single' || saved === 'batch' ? saved : 'single';
    } catch (error) {
      return 'single';
    }
  }

  function storedBatchPattern() {
    try {
      var saved = JSON.parse(window.localStorage.getItem('wego-order-merchant-batch-pattern') || 'null');
      return Array.isArray(saved) ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function rememberAddMode(mode) {
    try { window.localStorage.setItem('wego-order-merchant-add-mode', mode); } catch (error) {}
  }

  function rememberBatchPattern(draft) {
    try {
      window.localStorage.setItem('wego-order-merchant-batch-pattern', JSON.stringify(draft.product.specs.map(function (spec) { return Number(draft.skuQty[spec] || 0); })));
    } catch (error) {}
  }

  function storedPaymentPreference() {
    try {
      var saved = JSON.parse(window.localStorage.getItem('wego-order-payment-preference') || 'null');
      if (!saved || ['unpaid', 'private', 'debt'].indexOf(saved.kind) < 0) return null;
      return {
        kind: saved.kind,
        mode: saved.mode === 'combo' ? 'combo' : 'single',
        method: PAYMENT_METHODS.some(function (method) { return method.id === saved.method; }) ? saved.method : ''
      };
    } catch (error) {
      return null;
    }
  }

  function rememberPaymentPreference(draft) {
    if (!draft || !draft.kind) return;
    try {
      window.localStorage.setItem('wego-order-payment-preference', JSON.stringify({
        kind: draft.kind,
        mode: draft.mode,
        method: draft.mode === 'single' ? draft.method : ''
      }));
    } catch (error) {}
  }

  function localDateKey(date) {
    date = date || new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  function clerkDailyTotalStorageKey(dateKey) {
    return 'wego-order-clerk-daily-total:' + (dateKey || localDateKey()) + ':' + CURRENT_CLERK.id;
  }

  function storedClerkDailyTotal() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(clerkDailyTotalStorageKey()) || 'null');
      if (!saved || saved.date !== localDateKey() || saved.clerkId !== CURRENT_CLERK.id) return { count: 0, amount: 0 };
      return { count: Math.max(0, Number(saved.count || 0)), amount: Math.max(0, Number(saved.amount || 0)) };
    } catch (error) {
      return { count: 0, amount: 0 };
    }
  }

  function recordClerkDailyTotal(amount) {
    var current = storedClerkDailyTotal();
    var next = {
      date: localDateKey(),
      clerkId: CURRENT_CLERK.id,
      count: current.count + 1,
      amount: Math.round((current.amount + Math.max(0, Number(amount || 0))) * 100) / 100
    };
    try { window.localStorage.setItem(clerkDailyTotalStorageKey(next.date), JSON.stringify(next)); } catch (error) {}
    state.clerkDailyTotal = { count: next.count, amount: next.amount };
  }

  function dailyTotalAmount(value) {
    var amount = Math.max(0, Number(value || 0));
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  }

  var state = {
    customer: null,
    warehouse: WAREHOUSES[0],
    guide: GUIDES[0],
    guidePickerOpen: false,
    industry: 'clothing',
    industryMenuOpen: false,
    draftCount: 9,
    products: [],
    delivery: 'none',
    deliveryDraft: null,
    address: null,
    guestDeliveryPreference: {
      delivery: 'none',
      address: null,
      pickupPointId: PICKUP_POINTS[0] ? PICKUP_POINTS[0].id : null,
      pickupContact: null
    },
    pickupPointId: PICKUP_POINTS[0] ? PICKUP_POINTS[0].id : null,
    pickupContact: null,
    realNameInfo: null,
    deliveryRealNameAttention: false,
    senderMode: 'default',
    senderInfo: { name: '何小小', phone: '13690809124' },
    orderNoteMerchant: '',
    orderNoteBuyer: '',
    orderNoteOpen: false,
    selectedRow: null,
    displayMode: storedDisplayMode(),
    catalogCollapsed: storedCatalogCollapsed(),
    tabletCatalogAutoCollapsed: false,
    catalogWidth: null,
    catalogResizePointerId: null,
    catalogViewMode: storedCatalogViewMode(),
    catalogCategory: '全部',
    catalogScopeType: 'all',
    catalogScopeValue: '',
    catalogFilterOpen: false,
    catalogSidebarFilterOpen: false,
    discount: 100,
    freight: 0,
    rounding: 0,
    freightEditOpen: false,
    memberDiscount: 100,
    couponDiscount: 0,
    pointsUsed: 0,
    pointsMode: null,
    promotionDiscount: 0,
    quickOp: null,
    saveStatus: '已自动保存 18:26',
    draftAvailable: true,
    panel: null,
    panelPayload: null,
    customerPopoverClosing: false,
    customerPopoverCloseTimer: null,
    catalogKeyword: '',
    desktopProductKeyword: '',
    desktopCatalogSearchActive: false,
    desktopSearchResultsOpen: false,
    imageSearchFileName: '',
    scannerConnected: true,
    customerKeyword: '',
    addDraft: null,
    paymentDraft: null,
    paymentStatus: 'idle',
    orderNo: '',
    paymentSummary: '',
    clerkDailyTotal: storedClerkDailyTotal(),
    dailyTotalRecorded: false,
    previewImageIndex: null,
    confirmClearOrder: false,
    productEditDraft: null,
    productEditReturnPanel: null,
    productCreateDraft: null,
    catalogCreateMenuOpen: false,
    rowContextMenu: null,
    saveTimer: null
  };

  var activeContext = null;

  function activeCatalogProducts() {
    return state.industry === 'phone' ? PHONE_PRODUCTS : PRODUCTS;
  }

  function allCatalogProducts() {
    return PRODUCTS.concat(PHONE_PRODUCTS);
  }

  function money(value) {
    return '¥' + Number(value || 0).toFixed(2);
  }

  function splitSpec(spec) {
    var parts = String(spec || '').split('/');
    return { color: parts[0] || '默认', size: parts.slice(1).join('/') || '均码' };
  }

  function addProductMatrix(product) {
    var colors = [];
    var sizes = [];
    product.specs.forEach(function (spec) {
      var pair = splitSpec(spec);
      if (colors.indexOf(pair.color) < 0) colors.push(pair.color);
      if (sizes.indexOf(pair.size) < 0) sizes.push(pair.size);
    });
    return { colors: colors, sizes: sizes };
  }

  function specKey(product, color, size) {
    return product.specs.find(function (spec) {
      var pair = splitSpec(spec);
      return pair.color === color && pair.size === size;
    }) || '';
  }

  function specStock(product, spec) {
    var index = product.specs.indexOf(spec);
    if (index < 0) return 0;
    return index === product.specs.length - 1 ? 0 : 18 + index * 11;
  }

  function addDraftTotal(draft) {
    return Object.keys(draft.skuQty).reduce(function (sum, key) { return sum + Number(draft.skuQty[key] || 0); }, 0);
  }

  function isSkuMode(mode) {
    return mode === 'single' || mode === 'batch' || mode === 'precise';
  }

  function totals() {
    var productAmount = state.products.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
    var effectiveMemberRate = Number(state.memberDiscount || 100) / 100;
    var memberDiscountAmount = 0;
    var memberAmount = state.products.reduce(function (sum, item) {
      if (item.manualPrice) return sum + item.price * item.qty;
      memberDiscountAmount += (item.listPrice - item.listPrice * effectiveMemberRate) * item.qty;
      return sum + item.listPrice * effectiveMemberRate * item.qty;
    }, 0);
    var discountAmount = memberAmount * (100 - state.discount) / 100;
    var pointsAmount = Number(state.pointsUsed || 0) / 100;
    var couponAmount = Number(state.couponDiscount || 0);
    var promotionAmount = Number(state.promotionDiscount || 0);
    var freight = Number(state.freight || 0);
    var freightIncluded = state.delivery === 'express' || state.delivery === 'freight';
    var payableBeforeRounding = Math.max(memberAmount - discountAmount - pointsAmount - couponAmount - promotionAmount + (freightIncluded ? freight : 0), 0);
    var roundingAmount = Math.min(Number(state.rounding || 0), payableBeforeRounding);
    var payable = Math.max(payableBeforeRounding - roundingAmount, 0);
    return {
      productAmount: productAmount,
      memberAmount: memberAmount,
      memberDiscountAmount: memberDiscountAmount,
      discountAmount: discountAmount,
      pointsAmount: pointsAmount,
      couponAmount: couponAmount,
      promotionAmount: promotionAmount,
      roundingAmount: roundingAmount,
      totalDiscount: memberDiscountAmount + discountAmount + pointsAmount + couponAmount + promotionAmount + roundingAmount,
      freight: freight,
      payable: payable,
      pieces: state.products.reduce(function (sum, item) { return sum + item.qty; }, 0),
      styles: state.products.length
    };
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function customerPrice(product) {
    var factor = Number(state.memberDiscount || 100) / 100;
    return Number((product.listPrice * factor).toFixed(2));
  }

  function productCostPrice(product) {
    var cost = product.costPrice == null ? Number(product.listPrice || 0) * 0.48 : Number(product.costPrice);
    return Math.round(cost * 100) / 100;
  }

  function productLastDiscountPrice(product) {
    if (product.lastDiscountPrice != null) return Number(product.lastDiscountPrice);
    return Math.max(0, Math.round(customerPrice(product) * 0.9));
  }

  function addDraftUnitPrice(draft) {
    return Number(draft && draft.unitPrice != null ? draft.unitPrice : customerPrice(draft.product));
  }

  function recalculateCustomerPrices() {
    state.products.forEach(function (item) {
      if (!item.manualPrice) item.price = customerPrice(item);
    });
  }

  function applyCustomer(customer) {
    state.customer = customer || null;
    state.memberDiscount = state.customer && state.customer.factor ? Math.round(state.customer.factor * 10000) / 100 : 100;
    recalculateCustomerPrices();
  }

  function applyDeliveryPreference(preference) {
    preference = preference || {};
    state.delivery = preference.delivery || 'none';
    state.address = preference.address ? Object.assign({}, preference.address) : null;
    state.pickupPointId = preference.pickupPointId || (PICKUP_POINTS[0] ? PICKUP_POINTS[0].id : null);
    state.pickupContact = preference.pickupContact ? Object.assign({}, preference.pickupContact) : null;
    state.deliveryDraft = null;
  }

  function guestDeliveryPreference() {
    return state.guestDeliveryPreference || {};
  }

  function customerDeliveryPreference(customer) {
    if (!customer || !customer.lastDelivery) return { delivery: 'none', address: null, pickupPointId: PICKUP_POINTS[0] ? PICKUP_POINTS[0].id : null, pickupContact: null };
    var isAddressDelivery = customer.lastDelivery === 'express' || customer.lastDelivery === 'freight';
    return {
      delivery: customer.lastDelivery,
      address: isAddressDelivery && customer.lastAddress ? customer.lastAddress : null,
      pickupPointId: customer.lastPickupPointId || (PICKUP_POINTS[0] ? PICKUP_POINTS[0].id : null),
      pickupContact: customer.lastDelivery === 'pickup'
        ? (customer.lastPickupContact || { name: customer.contact || customer.name || '', phone: customer.mobile || '' })
        : null
    };
  }

  function rememberCurrentDeliveryPreference() {
    if (!state.customer) {
      state.guestDeliveryPreference = {
        delivery: state.delivery,
        address: null,
        pickupPointId: state.pickupPointId,
        pickupContact: null
      };
      return;
    }
    state.customer.lastDelivery = state.delivery;
    state.customer.lastAddress = state.address ? Object.assign({}, state.address) : null;
    state.customer.lastPickupPointId = state.pickupPointId;
    state.customer.lastPickupContact = state.pickupContact ? Object.assign({}, state.pickupContact) : null;
  }

  function markDirty(ctx) {
    state.saveStatus = '保存中…';
    renderActive();
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(function () {
      var now = new Date();
      state.saveStatus = '已自动保存 ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      renderActive();
    }, 450);
  }

  function isDesktopWorkbench() {
    return window.innerWidth >= 768;
  }

  var isRendering = false;
  function renderActive() {
    if (isRendering) return;
    if (activeContext && activeContext.root && activeContext.root.isConnected) {
      isRendering = true;
      try {
        renderWorkbench(activeContext.root, activeContext);
      } finally {
        isRendering = false;
      }
    }
  }

  function renderPaymentPreservingScroll(root) {
    var selector = isDesktopWorkbench()
      ? '.order-desktop-modal--checkout .order-desktop-modal__body'
      : '.order-v2-modal .order-v2-modal__body';
    var currentBody = root && root.querySelector ? root.querySelector(selector) : null;
    var scrollTop = currentBody ? currentBody.scrollTop : 0;
    renderActive();
    var nextBody = root && root.querySelector ? root.querySelector(selector) : null;
    if (nextBody) nextBody.scrollTop = scrollTop;
  }

  function focusDesktopProductSearch() {
    if (!activeContext || !isDesktopWorkbench()) return;
    var input = activeContext.root.querySelector('[data-header-catalog-search]');
    if (!input) return;
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
  }

  function focusProductEditDialog() {
    if (!activeContext || !activeContext.root) return;
    var closeButton = activeContext.root.querySelector('.order-product-edit-modal [data-close-panel]');
    if (closeButton) closeButton.focus({ preventScroll: true });
  }

  function focusCatalogCreateTrigger() {
    if (!activeContext || !activeContext.root) return;
    var trigger = activeContext.root.querySelector('[data-toggle-product-create-menu]');
    if (trigger) trigger.focus({ preventScroll: true });
  }

  function focusCatalogCreateMenuItem(position) {
    if (!activeContext || !activeContext.root) return;
    var items = activeContext.root.querySelectorAll('.order-catalog-create-menu [role="menuitem"]');
    if (!items.length) return;
    items[position === 'last' ? items.length - 1 : 0].focus({ preventScroll: true });
  }

  function focusProductCreateControl(selector) {
    if (!activeContext || !activeContext.root) return;
    var control = activeContext.root.querySelector(selector);
    if (control) control.focus({ preventScroll: true });
  }

  function productCodeExists(code) {
    return allCatalogProducts().some(function (item) { return item.code === code; })
      || state.products.some(function (item) { return item.code === code; });
  }

  function createUniqueProductCode() {
    var code = '';
    do {
      code = 'SP-' + String(Date.now() + Math.floor(Math.random() * 100000)).slice(-8);
    } while (productCodeExists(code));
    return code;
  }

  function restoreProductEditFocus(productId) {
    if (!activeContext || !activeContext.root || !productId) return;
    var editButton = Array.from(activeContext.root.querySelectorAll('[data-edit-catalog-product]')).find(function (button) {
      return button.dataset.editCatalogProduct === productId;
    });
    if (editButton) editButton.focus({ preventScroll: true });
  }

  function button(label, emphasis, size, attrs) {
    return '<button type="button" class="btn btn--' + emphasis + ' btn--' + size + '" data-component-slug="button" ' + (attrs || '') + '>' + label + '</button>';
  }

  function image(product, className) {
    return '<span class="wg-image wg-image--rounded-md ' + (className || '') + '" data-component-slug="image"><img class="wg-image__src is-loaded" src="' + product.image + '" alt="' + escapeHtml(product.name) + '"></span>';
  }

  function clickableImage(product, className, attrs) {
    return '<button type="button" class="order-product-image-button" ' + (attrs || '') + ' aria-label="查看' + escapeHtml(product.name) + '大图"><span class="wg-image wg-image--rounded-md wg-image--clickable ' + (className || '') + '" data-component-slug="image"><img class="wg-image__src is-loaded" src="' + product.image + '" alt="' + escapeHtml(product.name) + '"><span class="wg-image__overlay"></span></span></button>';
  }

  function navbar() {
    return ''
      + '<nav class="navbar order-v2__navbar" data-component-slug="navbar">'
      +   '<div class="navbar__body">'
      +     '<div class="navbar__left"><button type="button" class="navbar__left-btn" data-back aria-label="返回"><i class="wego-iconfont-s icon-fanhui" aria-hidden="true"></i></button></div>'
      +     '<div class="navbar__center"><span class="navbar__title">开销售单</span></div>'
      +     '<div class="navbar__right navbar__right--icon"><button type="button" class="navbar__action" data-order-settings aria-label="开单设置"><span class="navbar__action-icon"><i class="wego-iconfont-s icon-shezhi" aria-hidden="true"></i></span><span class="navbar__action-label">设置</span></button><button type="button" class="navbar__action" data-open-panel="drafts" aria-label="草稿箱"><span class="navbar__action-icon"><i class="wego-iconfont-s icon-caogaoxiang" aria-hidden="true"></i></span><span class="navbar__action-label">草稿箱</span></button></div>'
      +   '</div>'
      + '</nav>';
  }

  function currentPickupPoint(pickupPointId) {
    var selectedId = pickupPointId == null ? state.pickupPointId : pickupPointId;
    return PICKUP_POINTS.find(function (item) { return item.id === selectedId; }) || PICKUP_POINTS[0] || null;
  }

  function pickupContactValues(contact) {
    return contact || { name: '', phone: '' };
  }

  function orderRequiresRealName() {
    return state.products.some(function (item) {
      return item.freightTemplate && item.freightTemplate.requiresRealName;
    });
  }

  function realNameComplete(info) {
    return Boolean(info && (info.mode === 'group' || (info.name && /^[1-9]\d{5}(?:18|19|20)?\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(info.idCard))));
  }

  function realNameIdCardValid(value) {
    return /^[1-9]\d{5}(?:18|19|20)?\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(String(value || '').trim());
  }

  function focusDeliveryRealName(root) {
    if (!state.deliveryRealNameAttention || !root) return;
    window.requestAnimationFrame(function () {
      var section = root.querySelector('.order-desktop-modal--delivery .order-real-name-fields, .order-v2-modal .order-real-name-fields');
      if (!section) return;
      var scroller = section.closest('.order-delivery-panel__scroll');
      if (scroller) {
        var choices = scroller.querySelector('.order-delivery-choices');
        scroller.scrollTo({
          top: Math.max(0, section.offsetTop - (choices ? choices.offsetHeight : 0) - 8),
          behavior: 'smooth'
        });
      } else {
        section.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
      var firstInvalid = section.querySelector('.form-body--error input');
      if (firstInvalid) firstInvalid.focus({ preventScroll: true });
    });
  }

  function deliveryDraftFromState() {
    return {
      delivery: state.delivery || 'none',
      address: state.address ? Object.assign({}, state.address) : null,
      pickupPointId: state.pickupPointId,
      pickupContact: state.pickupContact ? Object.assign({}, state.pickupContact) : null,
      realNameInfo: state.realNameInfo ? Object.assign({}, state.realNameInfo) : null,
      senderMode: state.senderMode || 'default',
      senderInfo: state.senderInfo ? Object.assign({}, state.senderInfo) : null
    };
  }

  function activeDeliveryDraft() {
    if (!state.deliveryDraft) state.deliveryDraft = deliveryDraftFromState();
    return state.deliveryDraft;
  }

  function deliverySummaryText() {
    var label = ({ express: '快递', freight: '快运', pickup: '自提', none: '现场取货' })[state.delivery] || '发货方式 无';
    if ((state.delivery === 'express' || state.delivery === 'freight') && state.address) {
      return label + ' · ' + state.address.name + ' ' + state.address.phone + ' · ' + state.address.detail;
    }
    if (state.delivery === 'pickup') {
      var pickupPoint = currentPickupPoint();
      var pickupContact = pickupContactValues(state.pickupContact);
      var contactText = pickupContact.name && pickupContact.phone
        ? pickupContact.name + ' ' + pickupContact.phone
        : '请填写提货人信息';
      return '自提 · ' + (pickupPoint ? pickupPoint.name + ' · ' + pickupPoint.address + ' · ' : '') + contactText;
    }
    return label;
  }

  function deliverySummaryParts() {
    var label = ({ express: '快递', freight: '快运', pickup: '自提', none: '现场取货' })[state.delivery] || '发货方式';
    var requiresRealName = orderRequiresRealName() && (state.delivery === 'express' || state.delivery === 'freight');
    var realNameText = requiresRealName
      ? (realNameComplete(state.realNameInfo)
        ? '实名信息：' + (state.realNameInfo.mode === 'group' ? '拼邮' : state.realNameInfo.name + ' ' + state.realNameInfo.idCard)
        : '实名信息待完善')
      : '';
    if ((state.delivery === 'express' || state.delivery === 'freight') && state.address) {
      return { label: label, primary: state.address.name + ' ' + state.address.phone, secondary: state.address.detail, meta: realNameText, realNamePending: requiresRealName && !realNameComplete(state.realNameInfo) };
    }
    if (state.delivery === 'express' || state.delivery === 'freight') {
      var missingRealName = requiresRealName && !realNameComplete(state.realNameInfo);
      return { label: label, primary: '', secondary: missingRealName ? '暂无收货信息和实名信息' : '暂无收货信息', meta: requiresRealName ? realNameText : '', realNamePending: missingRealName };
    }
    if (state.delivery === 'pickup') {
      var pickupPoint = currentPickupPoint();
      var pickupContact = pickupContactValues(state.pickupContact);
      var contactText = pickupContact.name && pickupContact.phone
        ? pickupContact.name + ' ' + pickupContact.phone
        : '暂无提货人信息';
      return pickupPoint
        ? { label: '自提', primary: pickupPoint.name, secondary: '', meta: contactText, missingPickupContact: !pickupContact.name || !pickupContact.phone }
        : { label: '自提', primary: contactText, secondary: '' };
    }
    if (state.delivery === 'none') {
      return { label: '现场取货', primary: '', secondary: '' };
    }
    return { label: '发货方式', primary: '无', secondary: '' };
  }

  function mobileDeliveryControl() {
    var needsInlineAddress = (state.delivery === 'express' || state.delivery === 'freight') && !state.address;
    if (needsInlineAddress) {
      return ''
        + '<div class="cell cell--single cell--bg-white order-mobile-delivery-inline">'
        +   '<button type="button" data-open-panel="delivery"><small>发货方式 ' + (state.delivery === 'express' ? '快递' : '快运') + '</small><strong>收货信息 无</strong></button>'
        +   '<input type="text" aria-label="粘贴收件信息" placeholder="粘贴收件信息" data-inline-address-paste>'
        +   '<button type="button" class="btn btn--medium btn--sm" data-component-slug="button" data-inline-recognize-address>识别</button>'
        + '</div>';
    }
    var mobilePickupContact = pickupContactValues(state.pickupContact);
    if (state.delivery === 'pickup' && (!mobilePickupContact.name || !mobilePickupContact.phone)) {
      var mobilePickupPoint = currentPickupPoint();
      return ''
        + '<div class="cell cell--single cell--bg-white order-mobile-delivery-inline order-mobile-delivery-inline--pickup">'
        +   '<button type="button" data-open-panel="delivery"><small>自提' + (mobilePickupPoint ? ' · ' + escapeHtml(mobilePickupPoint.name) : '') + '</small></button>'
        +   '<strong class="order-inline-pickup-label">填写提货人信息</strong>'
        +   '<input type="text" aria-label="粘贴提货人信息" placeholder="粘贴姓名和手机号" data-inline-pickup-paste>'
        +   '<button type="button" class="btn btn--medium btn--sm" data-component-slug="button" data-inline-recognize-pickup>识别</button>'
        + '</div>';
    }
    return ''
      + '<button type="button" class="cell cell--single cell--bg-white cell--clickable" data-component-slug="cell" data-open-panel="delivery" title="' + escapeHtml(deliverySummaryText()) + '">'
      +   '<div class="cell__body"><div class="cell__content"><div class="cell__title-row"><span class="cell__title">发货信息</span></div></div><div class="cell__action"><span class="cell__action-text">' + escapeHtml(deliverySummaryText()) + '</span><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div></div>'
      + '</button>';
  }

  function contextSection() {
    var customerCell = state.customer
      ? ''
        + '<div class="cell cell--double cell--divider-right-edge cell--bg-white order-v2__selected-customer" data-component-slug="cell">'
        +   '<div class="cell__avatar"><div class="avatar avatar--40 avatar--image"><img src="' + state.customer.avatar + '" alt=""></div></div>'
        +   '<div class="cell__body">'
        +     '<div class="cell__content" data-clickable data-open-panel="customer" role="button" tabindex="0" aria-label="更换客户">'
        +       '<div class="cell__title-row"><span class="cell__title">' + escapeHtml(state.customer.name) + '</span><em class="order-customer-vip order-customer-vip--' + state.customer.level.toLowerCase() + '"><b>' + escapeHtml(state.customer.level) + '</b><span>' + escapeHtml(state.customer.priceType) + '</span></em></div>'
        +       '<div class="cell__subtitle">余额：' + money(state.customer.balance) + ' <button type="button" class="link link--12 link--inline" data-component-slug="link" data-recharge>充值</button></div>'
        +     '</div>'
        +   '</div>'
        + '</div>'
      : ''
        + '<button type="button" class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-component-slug="cell" data-open-panel="customer">'
        +   '<div class="cell__body"><div class="cell__content"><div class="cell__title-row"><span class="cell__title">客户</span></div></div><div class="cell__action"><span class="cell__action-text">选择或新建客户</span></div></div>'
        + '</button>';
    return ''
      + '<section class="cell-group order-v2__context">'
      +   '<div class="cell-group__content">'
      +   customerCell
      +   '<button type="button" class="cell cell--single cell--divider-right-edge cell--bg-white cell--clickable" data-component-slug="cell" data-open-panel="warehouse">'
      +     '<div class="cell__body"><div class="cell__content"><div class="cell__title-row"><span class="cell__title">仓库</span></div></div><div class="cell__action"><span class="cell__action-text">' + escapeHtml(state.warehouse.name) + '</span><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div></div>'
      +   '</button>'
      +   mobileDeliveryControl()
      +   '</div>'
      + '</section>';
  }

  function entryTools() {
    return ''
      + '<section class="order-v2__entry order-surface">'
      +   '<button type="button" class="order-entry-primary" data-open-panel="products"><i class="wego-iconfont-s icon-jia16"></i><span>选择商品</span></button>'
      +   '<div class="order-entry-tools">'
      +     '<button type="button" data-open-panel="products"><i class="wego-iconfont-s icon-sousuo"></i><span>搜索</span></button>'
      +     '<button type="button" data-scan><img src="./scenes/开单/assets/icon-barcode.svg" alt=""><span>扫条码</span></button>'
      +     '<button type="button" data-ai-entry><i class="wego-iconfont-s icon-tupian"></i><span>AI开单</span><small>即将开放</small></button>'
      +   '</div>'
      + '</section>';
  }

  function lineMeta(item) {
    if (isSkuMode(item.mode)) {
      return Object.keys(item.skuQty).filter(function (key) { return item.skuQty[key] !== 0; })
        .map(function (key) { return key + '×' + item.skuQty[key]; }).join('，');
    }
    return '快速数量 · 共' + item.qty + '件';
  }

  function orderLine(item, index, desktop) {
    return ''
      + '<article class="' + (desktop ? 'order-desktop-line' : 'order-mobile-line') + '" data-line-index="' + index + '">'
      +   image(item, desktop ? 'order-desktop-line__image' : 'order-mobile-line__image')
      +   '<div class="order-line-main">'
      +     '<div class="order-line-title"><strong>' + escapeHtml(item.name) + '</strong><span>' + escapeHtml(item.code) + '</span></div>'
      +     '<small>' + escapeHtml(lineMeta(item)) + '</small>'
      +     (item.note ? '<em>备注：' + escapeHtml(item.note) + '</em>' : '')
      +     '<div class="order-line-price"><button type="button" class="link link--14" data-component-slug="link" data-edit-price="' + index + '">' + money(item.price) + '</button><span>× ' + item.qty + '</span><b>' + money(item.price * item.qty) + '</b></div>'
      +   '</div>'
      +   '<div class="order-line-actions">'
      +     '<div class="counter" data-component-slug="counter"><div class="counter__body">'
      +       '<button type="button" class="counter__btn counter__btn--minus" data-minus="' + index + '" aria-label="减少"><i class="counter__icon icon-jian16"></i></button>'
      +       '<input class="counter__value" value="' + item.qty + '" readonly aria-label="数量">'
      +       '<button type="button" class="counter__btn counter__btn--plus" data-plus="' + index + '" aria-label="增加"><i class="counter__icon icon-jia16"></i></button>'
      +     '</div><div class="counter__message counter__hint"></div><div class="counter__message counter__error"></div></div>'
      +     '<button type="button" class="link link--12 text-danger" data-component-slug="link" data-delete="' + index + '">删除</button>'
      +   '</div>'
      + '</article>';
  }

  function itemSpecRows(item) {
    if (isSkuMode(item.mode)) {
      var rows = Object.keys(item.skuQty).filter(function (spec) { return item.skuQty[spec] !== 0; }).map(function (spec, index) {
        return { spec: spec, qty: item.skuQty[spec], stock: 16 + index * 7 };
      });
      if (rows.length) return rows;
    }
    return [{ spec: '未选规格', qty: item.qty, stock: 20 }];
  }

  function desktopQuantityCounter(itemIndex, qty, spec, hint) {
    var specAttr = spec ? ' data-qty-spec="' + encodeURIComponent(spec) + '"' : '';
    return ''
      + '<div class="counter is-hint" data-component-slug="counter" data-counter data-counter-min="1">'
      +   '<div class="counter__body">'
      +     '<button type="button" class="counter__btn counter__btn--minus" data-row-qty-delta="-1" data-item-index="' + itemIndex + '"' + specAttr + ' aria-label="减少"><i class="counter__icon icon-jian16"></i></button>'
      +     '<input class="counter__value" type="text" inputmode="numeric" maxlength="7" value="' + qty + '" data-row-qty data-item-index="' + itemIndex + '"' + specAttr + ' aria-label="商品数量">'
      +     '<button type="button" class="counter__btn counter__btn--plus" data-row-qty-delta="1" data-item-index="' + itemIndex + '"' + specAttr + ' aria-label="增加"><i class="counter__icon icon-jia16"></i></button>'
      +   '</div>'
      +   '<div class="counter__message counter__hint">' + escapeHtml(hint) + '</div>'
      +   '<div class="counter__message counter__error"></div>'
      + '</div>';
  }

  function desktopProductRow(item, itemIndex, row, grouped) {
    var specs = itemSpecRows(item);
    if (grouped) {
      var groupedSpecs = specs.map(function (entry) {
        return '<span class="order-desktop-grouped-sku-line" title="' + escapeHtml(entry.spec) + '">' + escapeHtml(entry.spec) + '</span>';
      }).join('');
      var groupedPrices = specs.map(function () {
        return '<span class="order-desktop-grouped-sku-line"><button type="button" class="link link--14 order-desktop-product-price" data-component-slug="link" data-edit-price="' + itemIndex + '">' + money(item.price) + '</button></span>';
      }).join('');
      var groupedQuantities = specs.map(function (entry) {
        return '<span class="order-desktop-grouped-sku-line">' + desktopQuantityCounter(itemIndex, entry.qty, entry.spec, '库存' + entry.stock) + '</span>';
      }).join('');
      return ''
        + '<article class="order-desktop-product-row order-desktop-product-row--grouped' + (isRowSelected(itemIndex, '') ? ' is-selected' : '') + '" data-item-index="' + itemIndex + '" data-row-select="' + itemIndex + '">'
        +   '<div class="order-desktop-product-name"><strong>' + escapeHtml(item.code) + '</strong><span>' + escapeHtml(item.name) + '</span><small>' + specs.length + '个SKU</small></div>'
        +   clickableImage(item, 'order-desktop-product-image', 'data-preview-image="' + itemIndex + '"')
        +   '<div class="order-desktop-grouped-sku-stack order-desktop-grouped-sku-stack--spec">' + groupedSpecs + '</div>'
        +   '<div class="order-desktop-grouped-sku-stack order-desktop-grouped-sku-stack--price">' + groupedPrices + '</div>'
        +   '<div class="order-desktop-grouped-sku-stack order-desktop-grouped-sku-stack--qty">' + groupedQuantities + '</div>'
        +   '<strong class="order-desktop-product-total order-desktop-product-total--grouped"><small>共' + item.qty + '件 · 金额合计</small><span data-product-total-value>' + money(item.price * item.qty) + '</span></strong>'
        +   '<button type="button" class="link link--14 order-desktop-product-note ' + (item.note ? 'has-note' : '') + '" data-component-slug="link" data-edit-spu-note="' + itemIndex + '">' + escapeHtml(item.note || '添加备注') + '</button>'
        +   '<button type="button" class="order-desktop-row-delete" data-delete-row="' + itemIndex + '" aria-label="删除' + escapeHtml(item.name) + '"><i class="wego-iconfont-s icon-cha16" aria-hidden="true"></i></button>'
        + '</article>';
    }
    var specText = grouped
      ? (specs.length === 1 ? specs[0].spec : specs.map(function (entry) { return entry.spec; }).join('、'))
      : row.spec;
    var qty = grouped ? item.qty : row.qty;
    var specKey = grouped ? '' : row.spec;
    var hint = grouped ? (specs.length + '个SKU · 共' + item.qty + '件') : ('库存' + row.stock);
    return ''
      + '<article class="order-desktop-product-row' + (isRowSelected(itemIndex, row.spec) ? ' is-selected' : '') + '" data-item-index="' + itemIndex + '" data-row-select="' + itemIndex + '" data-row-spec="' + encodeURIComponent(row.spec) + '">'
      +   '<div class="order-desktop-product-name"><strong>' + escapeHtml(item.code) + '</strong><span>' + escapeHtml(item.name) + '</span></div>'
      +   clickableImage(item, 'order-desktop-product-image', 'data-preview-image="' + itemIndex + '"')
      +   '<span class="order-desktop-product-spec" title="' + escapeHtml(specText) + '">' + escapeHtml(specText) + '</span>'
      +   '<button type="button" class="link link--14 order-desktop-product-price" data-component-slug="link" data-edit-price="' + itemIndex + '">' + money(item.price) + '</button>'
      +   '<div class="order-desktop-product-qty">' + desktopQuantityCounter(itemIndex, qty, specKey, hint) + '</div>'
      +   '<strong class="order-desktop-product-total"><span data-product-total-value>' + money(item.price * qty) + '</span></strong>'
      +   '<button type="button" class="link link--14 order-desktop-product-note ' + (item.note ? 'has-note' : '') + '" data-component-slug="link" data-edit-spu-note="' + itemIndex + '">' + escapeHtml(item.note || '添加备注') + '</button>'
      +   '<button type="button" class="order-desktop-row-delete" data-delete-row="' + itemIndex + '" data-delete-row-spec="' + encodeURIComponent(specKey) + '" aria-label="删除' + escapeHtml(item.name) + '"><i class="wego-iconfont-s icon-cha16" aria-hidden="true"></i></button>'
      + '</article>';
  }

  function desktopProductRows() {
    return state.products.map(function (item, itemIndex) {
      if (state.displayMode === 'grouped') return desktopProductRow(item, itemIndex, itemSpecRows(item)[0], true);
      return itemSpecRows(item).map(function (row) { return desktopProductRow(item, itemIndex, row, false); }).join('');
    }).join('');
  }

  function isRowSelected(itemIndex, spec) {
    return !!(state.selectedRow && state.selectedRow.itemIndex === itemIndex && (state.selectedRow.spec || '') === (spec || ''));
  }

  function toggleRowSelection(itemIndex, spec) {
    if (isRowSelected(itemIndex, spec)) {
      state.selectedRow = null;
    } else {
      state.selectedRow = { itemIndex: itemIndex, spec: spec || '' };
    }
    renderActive();
  }

  function removeOrderRow(itemIndex, spec) {
    var item = state.products[itemIndex];
    if (!item) return;
    if (isSkuMode(item.mode) && spec) {
      item.skuQty[spec] = 0;
      item.qty = Object.keys(item.skuQty).reduce(function (sum, key) { return sum + Number(item.skuQty[key] || 0); }, 0);
      if (!item.qty) state.products.splice(itemIndex, 1);
    } else {
      state.products.splice(itemIndex, 1);
    }
    state.selectedRow = null;
  }

  function openOrderRowContextMenu(itemIndex, spec, x, y) {
    if (!state.products[itemIndex]) return false;
    state.selectedRow = { itemIndex: itemIndex, spec: spec || '' };
    state.rowContextMenu = { itemIndex: itemIndex, spec: spec || '', x: x, y: y };
    renderActive();
    if (activeContext && activeContext.root) {
      var firstAction = activeContext.root.querySelector('.order-row-context-menu [role="menuitem"]');
      if (firstAction) firstAction.focus({ preventScroll: true });
    }
    return true;
  }

  function orderRowContextMenu() {
    var menu = state.rowContextMenu;
    if (!menu) return '';
    return ''
      + '<div class="card card--surface order-row-context-menu" data-component-slug="card" role="menu" aria-label="商品行操作" style="left:' + menu.x + 'px;top:' + menu.y + 'px">'
      +   '<button type="button" role="menuitem" data-context-edit-order-row>编辑商品</button>'
      +   '<button type="button" class="is-danger" role="menuitem" data-context-delete-order-row>删除</button>'
      + '</div>';
  }

  function mobileLines() {
    if (!state.products.length) {
      return '<section class="order-empty"><strong>还没有商品</strong><span>从上方选择、搜索或扫码加入商品</span></section>';
    }
    return ''
      + '<section class="order-list-head"><strong>订单商品</strong><div><button type="button" class="order-mode-btn ' + (state.displayMode === 'grouped' ? 'is-active' : '') + '" data-display="grouped">按商品</button><button type="button" class="order-mode-btn ' + (state.displayMode === 'flat' ? 'is-active' : '') + '" data-display="flat">按规格</button></div></section>'
      + '<section class="order-mobile-lines">' + state.products.map(function (item, index) { return orderLine(item, index, false); }).join('') + '</section>';
  }

  function mobileFooter() {
    var t = totals();
    var blocked = !state.products.length;
    return ''
      + '<footer class="order-v2__footer">'
      +   '<div class="order-footer-total"><span>应收</span><strong>' + money(t.payable) + '</strong><small>' + t.styles + '款 ' + t.pieces + '件</small></div>'
      +   '<div class="order-footer-actions">'
      +     button('存草稿', 'weak', 'md', 'data-save-draft')
      +     '<button type="button" class="btn btn--strong btn--md ' + (blocked ? 'btn--disabled' : '') + '" data-component-slug="button" data-checkout ' + (blocked ? 'disabled' : '') + '>去结算</button>'
      +   '</div>'
      + '</footer>';
  }

  function mobileView() {
    return ''
      + '<section class="order-v2-mobile" aria-label="移动端开单">'
      +   navbar()
      +   '<main class="order-v2-mobile__scroll">'
      +     contextSection()
      +     entryTools()
      +     mobileLines()
      +     orderNoteEntry()
      +   '</main>'
      +   mobileFooter()
      + '</section>';
  }

  function orderNoteEntry() {
    if (!state.products.length) return '';
    var hasNote = !!(state.orderNoteMerchant || state.orderNoteBuyer);
    var preview = '';
    if (hasNote) {
      var lines = [];
      if (state.orderNoteMerchant) lines.push('<span class="order-note-bar__line"><span class="order-note-bar__label">商家备注</span>' + escapeHtml(state.orderNoteMerchant) + '</span>');
      if (state.orderNoteBuyer) lines.push('<span class="order-note-bar__line"><span class="order-note-bar__label">买家备注</span>' + escapeHtml(state.orderNoteBuyer) + '</span>');
      preview = '<p class="order-note-bar__preview">' + lines.join('') + '</p>';
    }
    return ''
      + '<section class="order-note-bar" aria-label="订单备注">'
      +   '<div class="order-note-bar__row' + (hasNote ? ' order-note-bar__row--filled' : '') + '"' + (hasNote ? ' data-clickable data-toggle-order-note role="button" tabindex="0" aria-label="编辑整单备注"' : '') + '>'
      +     (hasNote
            ? '<div class="order-note-bar__note">' + preview + '<span class="order-note-bar__edit"><i class="wego-iconfont-s icon-bianji16" aria-hidden="true"></i>编辑</span></div>'
            : '<button type="button" class="link link--14 order-note-bar__toggle" data-component-slug="link" data-toggle-order-note>添加备注</button>')
      +   '</div>'
      + '</section>';
  }

  function orderNoteModal() {
    if (!state.orderNoteOpen) return '';
    var hasNote = !!(state.orderNoteMerchant || state.orderNoteBuyer);
    return ''
      + '<div class="order-note-modal" role="dialog" aria-modal="true" aria-label="整单备注" data-state="open">'
      +   '<div class="order-note-modal__panel">'
      +     '<div class="order-note-modal__head"><strong>' + (hasNote ? '编辑备注' : '添加备注') + '</strong></div>'
      +     '<div class="order-note-modal__body">'
      +       '<div class="input-group input-group--surface-white" data-component-slug="input"><label class="field-label" for="order-note-merchant">商家备注</label><textarea id="order-note-merchant" placeholder="请输入文字，商家备注仅你可见" data-order-note-merchant>' + escapeHtml(state.orderNoteMerchant) + '</textarea></div>'
      +       '<div class="input-group input-group--surface-white" data-component-slug="input"><label class="field-label" for="order-note-buyer">买家备注</label><textarea id="order-note-buyer" placeholder="请输入文字，买家备注双方可见" data-order-note-buyer>' + escapeHtml(state.orderNoteBuyer) + '</textarea></div>'
      +     '</div>'
      +     '<div class="order-note-modal__actions">'
      +       button('取消', 'weak', 'md', 'data-note-cancel')
      +       button('确定', 'strong', 'md', 'data-note-confirm')
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function freightEditModal() {
    if (!state.freightEditOpen) return '';
    return ''
      + '<div class="order-note-modal order-freight-edit-modal" role="dialog" aria-modal="true" aria-label="设置运费" data-state="open">'
      +   '<div class="order-note-modal__panel">'
      +     '<div class="order-note-modal__head"><strong>设置运费</strong></div>'
      +     '<div class="order-note-modal__body">'
      +       '<div class="input-group input-group--surface-white" data-component-slug="input"><label class="field-label" for="freight-edit-value">运费</label><div class="number-input" data-component-slug="input"><input class="number-input__field" id="freight-edit-value" type="text" inputmode="decimal" value="' + escapeHtml(String(state.freight || '')) + '" placeholder="请输入运费金额" data-freight-edit-value><span class="number-input__suffix">元</span></div></div>'
      +     '</div>'
      +     '<div class="order-note-modal__actions">'
      +       button('取消', 'weak', 'md', 'data-freight-edit-cancel')
      +       button('确定', 'strong', 'md', 'data-freight-edit-confirm')
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function catalogList(manualDesktop, sourceRows) {
    var editable = arguments.length > 2 ? Boolean(arguments[2]) : false;
    var keyword = manualDesktop ? '' : state.catalogKeyword.trim();
    var rows = (sourceRows || activeCatalogProducts()).filter(function (item) {
      var scopeMatched = manualDesktop || state.catalogScopeType === 'all' || item[state.catalogScopeType] === state.catalogScopeValue;
      var keywordMatched = !keyword || item.name.indexOf(keyword) >= 0 || item.code.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
      return scopeMatched && keywordMatched;
    });
    if (!rows.length) return '<div class="order-catalog-empty">没有匹配商品</div>';
    return rows.map(function (item) {
      var content = ''
        +   '<span class="order-catalog-item__media">' + image(item, 'order-catalog-item__image') + '<span class="order-catalog-item__code">' + escapeHtml(item.code) + '</span></span>'
        +   '<span class="order-catalog-item__detail"><strong>' + escapeHtml(item.name) + '</strong><small>' + escapeHtml(item.code) + (item.stock != null ? ' · 库存 ' + item.stock + ' 台' : ' · ' + item.specs.length + '个规格') + '</small><b>' + money(customerPrice(item)) + '</b></span>'
        +   '<i class="wego-iconfont-s icon-jia16" aria-hidden="true"></i>';
      if (!editable) {
        return '<button type="button" class="order-catalog-item' + (manualDesktop ? ' card card--surface' : '') + '"' + (manualDesktop ? ' data-component-slug="card"' : '') + ' data-product-id="' + item.id + '">' + content + '</button>';
      }
      return ''
        + '<article class="order-catalog-item card card--surface order-catalog-item--editable" data-component-slug="card">'
        +   '<button type="button" class="order-catalog-item__select" data-product-id="' + item.id + '" aria-label="添加' + escapeHtml(item.name) + '">' + content + '</button>'
        +   '<button type="button" class="order-catalog-item__edit" data-edit-catalog-product="' + item.id + '" aria-label="编辑' + escapeHtml(item.name) + '" title="编辑商品"><i class="wego-iconfont-s icon-bianji16" aria-hidden="true"></i></button>'
        + '</article>';
    }).join('');
  }

  function merchantRecentProducts() {
    if (state.industry === 'phone') return [];
    return MERCHANT_RECENT_PRODUCT_IDS.map(function (productId) {
      return PRODUCTS.find(function (item) { return item.id === productId; });
    }).filter(Boolean);
  }

  function catalogCategoryTabs() {
    var categories = state.industry === 'phone' ? ['全部', 'Apple', 'HUAWEI', 'HONOR', 'Xiaomi', 'OPPO', 'vivo'] : CATALOG_CATEGORIES;
    return '<div class="order-catalog-category-tabs" aria-label="商品标签分类">' + categories.map(function (category) {
      var selected = state.catalogCategory === category;
      return '<button type="button" class="tag tag--28 ' + (selected ? 'tag--brand tag--selected' : 'tag--white tag--normal') + '" data-component-slug="tag" aria-pressed="' + selected + '" data-catalog-category="' + escapeHtml(category) + '"><span class="tag__label">' + escapeHtml(category) + '</span></button>';
    }).join('') + '</div>';
  }

  function catalogSidebarFilterMenu() {
    if (!state.catalogSidebarFilterOpen) return '';
    var options = [
      { value: '', label: '全部来源' },
      { value: '微购相册', label: '微购相册' },
      { value: '采购入库', label: '采购入库' },
      { value: '手动创建', label: '手动创建' }
    ];
    return '<div class="order-catalog-sidebar-filter-menu" role="dialog" aria-label="筛选商品来源"><small>商品来源</small><div>' + options.map(function (option) {
      var active = option.value ? state.catalogScopeType === 'source' && state.catalogScopeValue === option.value : state.catalogScopeType === 'all';
      return '<button type="button" class="tag tag--28 ' + (active ? 'tag--brand tag--selected' : 'tag--gray tag--normal') + '" data-component-slug="tag" data-sidebar-catalog-source="' + escapeHtml(option.value) + '"><span class="tag__label">' + option.label + '</span></button>';
    }).join('') + '</div></div>';
  }

  function catalogScopeLabel() {
    return state.catalogScopeType === 'all' ? '全部商品' : state.catalogScopeValue;
  }

  function desktopProductMatches(keyword) {
    var normalized = String(keyword || '').trim().toLowerCase();
    if (!normalized) return [];
    return activeCatalogProducts().filter(function (item) {
      var scopeMatched = state.catalogScopeType === 'all' || item[state.catalogScopeType] === state.catalogScopeValue;
      var keywordMatched = item.name.toLowerCase().indexOf(normalized) >= 0 || item.code.toLowerCase().indexOf(normalized) >= 0;
      return scopeMatched && keywordMatched;
    });
  }

  function desktopCodeMatches(keyword) {
    var normalized = String(keyword || '').trim().toLowerCase();
    if (!normalized) return [];
    return activeCatalogProducts().filter(function (item) {
      return item.code.toLowerCase().indexOf(normalized) >= 0;
    });
  }

  function desktopSearchResultDropdown() {
    var matches = desktopCodeMatches(state.desktopProductKeyword);
    if (!state.desktopSearchResultsOpen || matches.length < 2) return '';
    return ''
      + '<div class="order-desktop-search-results card card--surface" role="listbox" aria-label="搜索商品结果">'
      +   '<div class="order-desktop-search-results__list order-desktop__catalog-list order-desktop__catalog-list--list">'
      +     catalogList(true, matches, false)
      +   '</div>'
      + '</div>';
  }

  function resetDesktopProductSearch() {
    state.desktopProductKeyword = '';
    state.desktopCatalogSearchActive = false;
    state.desktopSearchResultsOpen = false;
  }

  function applyDesktopSearch(keyword, ctx) {
    var codeMatches = desktopCodeMatches(keyword);
    if (codeMatches.length >= 2) {
      state.desktopSearchResultsOpen = state.catalogCollapsed;
      state.desktopCatalogSearchActive = !state.catalogCollapsed;
      renderActive();
      focusDesktopProductSearch();
      return true;
    }
    state.desktopSearchResultsOpen = false;
    state.desktopCatalogSearchActive = false;
    if (!openDesktopSearchMatch(keyword, false, ctx)) return false;
    return true;
  }

  function openDesktopSearchMatch(keyword, exactOnly, ctx) {
    var normalized = String(keyword || '').trim().toLowerCase();
    var matches = desktopProductMatches(keyword);
    var product = exactOnly
      ? matches.find(function (item) { return item.name.toLowerCase() === normalized || item.code.toLowerCase() === normalized; })
      : matches[0];
    if (!product) return false;
    state.desktopProductKeyword = '';
    state.desktopCatalogSearchActive = false;
    state.desktopSearchResultsOpen = false;
    if (product.specs.length === 1) {
      addSingleSpecProduct(product.id, ctx);
      focusDesktopProductSearch();
    } else {
      startAdd(product.id);
    }
    return true;
  }

  function catalogFilterMenu() {
    if (!state.catalogFilterOpen) return '';
    var groups = [
      { title: '商品范围', options: [{ type: 'all', value: '', label: '全部商品' }] },
      { title: '商品分类', options: ['上衣', '裤装', '裙装'].map(function (value) { return { type: 'category', value: value, label: value }; }) },
      { title: '商品来源', options: ['微购相册', '采购入库', '手动创建'].map(function (value) { return { type: 'source', value: value, label: value }; }) }
    ];
    return '<div class="order-desktop-search-filter__menu" role="dialog" aria-label="筛选商品">' + groups.map(function (group) {
      return '<section><small>' + group.title + '</small><div>' + group.options.map(function (option) {
        var active = state.catalogScopeType === option.type && state.catalogScopeValue === option.value;
        return '<button type="button" class="tag tag--28 ' + (active ? 'tag--brand tag--selected' : 'tag--gray tag--normal') + '" data-component-slug="tag" data-catalog-scope-type="' + option.type + '" data-catalog-scope-value="' + escapeHtml(option.value) + '"><span class="tag__label">' + option.label + '</span></button>';
      }).join('') + '</div></section>';
    }).join('') + '</div>';
  }

  function desktopProductSearch(inCatalog) {
    var scannerConnectedClass = state.scannerConnected ? 'is-connected' : 'is-disconnected';
    var sidebarFilterButton = '<div class="order-catalog-filter-anchor order-catalog-filter-anchor--search"><button type="button" class="btn btn--weak btn--sm" data-component-slug="button" data-toggle-sidebar-catalog-filter aria-haspopup="dialog" aria-expanded="' + state.catalogSidebarFilterOpen + '"><i class="btn__icon icon-shaixuan" aria-hidden="true"></i>筛选</button>' + catalogSidebarFilterMenu() + '</div>';
    return ''
      + '<div class="order-desktop-product-search' + (inCatalog ? ' order-desktop-product-search--catalog' : '') + '">'
      +   '<div class="order-desktop-product-search__row">'
      +     (inCatalog ? '' : '<div class="order-desktop-search-filter"><button type="button" class="btn btn--weak btn--sm" data-component-slug="button" data-toggle-catalog-filter aria-haspopup="dialog" aria-expanded="' + state.catalogFilterOpen + '"><span>' + escapeHtml(catalogScopeLabel()) + '</span><i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i></button>' + catalogFilterMenu() + '</div>')
      +     '<div class="input-group input-group--surface-white order-desktop-context-search" data-component-slug="input"><label class="field-label" for="order-v2-context-search">搜索商品</label><div class="input-wrapper"><input id="order-v2-context-search" type="text" value="' + escapeHtml(state.desktopProductKeyword) + '" placeholder="使用扫码枪或搜索商品名称、货号" enterkeyhint="search" autocomplete="off" data-header-catalog-search><button type="button" class="input-clear" aria-label="清空搜索" data-clear-header-search><i class="icon-yuancha-mian" aria-hidden="true"></i></button><button type="button" class="order-desktop-inline-image-search" data-trigger-image-search aria-label="图搜" title="图搜"><i class="wego-iconfont-s icon-tupian" aria-hidden="true"></i></button></div></div>'
      +     '<input type="file" accept="image/*" data-header-image-input hidden>'
      +     (inCatalog ? '' : '<button type="button" class="btn btn--medium btn--sm order-desktop-product-search__submit" data-component-slug="button" data-submit-header-search ' + (state.desktopProductKeyword.trim() ? '' : 'hidden') + '>搜索</button>')
      +     (inCatalog ? sidebarFilterButton : '')
      +     '<button type="button" class="btn btn--weak btn--sm btn--icon-only order-desktop-barcode-search is-active ' + scannerConnectedClass + '" data-component-slug="button" data-scan aria-label="扫条码" title="扫条码"><img class="btn__icon" src="./scenes/开单/assets/icon-barcode.svg" alt="" aria-hidden="true"></button>'
      +   '</div>'
      +   (inCatalog ? '' : desktopSearchResultDropdown())
      + '</div>';
  }

  function desktopCatalog() {
    if (state.catalogCollapsed) {
      return ''
        + '<aside class="order-desktop__catalog order-desktop__catalog--collapsed">'
        +   '<button type="button" class="btn btn--weak btn--sm order-desktop-catalog-toggle order-desktop-catalog-toggle--expand" data-component-slug="button" data-toggle-catalog aria-label="展开商品库">'
        +     '<i class="btn__icon icon-zuojiantou16" aria-hidden="true"></i>展开商品库'
        +   '</button>'
        + '</aside>';
    }
    var historyProducts = merchantRecentProducts();
    var searchMatches = desktopCodeMatches(state.desktopProductKeyword);
    var showingSearchResults = state.desktopCatalogSearchActive && searchMatches.length >= 2;
    var allProducts = (showingSearchResults ? searchMatches : activeCatalogProducts()).filter(function (item) {
      if (showingSearchResults) return true;
      var categoryMatched = state.catalogCategory === '全部' || item.category === state.catalogCategory || (item.tags || []).indexOf(state.catalogCategory) >= 0;
      var scopeMatched = state.catalogScopeType === 'all' || item[state.catalogScopeType] === state.catalogScopeValue;
      return categoryMatched && scopeMatched;
    });
    return ''
      + '<aside class="order-desktop__catalog">'
      +   '<button type="button" class="btn btn--weak btn--sm order-desktop-catalog-toggle order-desktop-catalog-toggle--collapse" data-component-slug="button" data-toggle-catalog aria-label="收起商品库"><i class="btn__icon icon-youjiantou16" aria-hidden="true"></i>收起商品库</button>'
      +   '<header class="order-catalog-header"><div class="order-catalog-header__title"><strong>商品库</strong><div class="order-catalog-view-switch" aria-label="商品库显示模式"><button type="button" class="' + (state.catalogViewMode === 'grid' ? 'is-active' : '') + '" data-catalog-view="grid">大图</button><button type="button" class="' + (state.catalogViewMode === 'list' ? 'is-active' : '') + '" data-catalog-view="list">列表</button></div></div><div class="order-catalog-create-anchor"><button type="button" class="btn btn--weak btn--sm order-catalog-publish" data-component-slug="button" data-toggle-product-create-menu aria-haspopup="menu" aria-expanded="' + state.catalogCreateMenuOpen + '"><i class="btn__icon icon-jia16" aria-hidden="true"></i>创建</button>' + (state.catalogCreateMenuOpen ? '<div class="card card--surface order-catalog-create-menu" data-component-slug="card" role="menu" aria-label="功能选项面板"><button type="button" role="menuitem" data-create-product-type="product">创建商品</button><button type="button" role="menuitem" data-create-product-type="temporary">创建临时商品</button></div>' : '') + '</div></header>'
      +   desktopProductSearch(true)
      +   '<div class="order-desktop__catalog-scroll">'
      +   (!showingSearchResults && historyProducts.length ? '<section class="order-catalog-history" aria-label="最近成交商品"><div class="order-catalog-history__list">' + catalogList(true, historyProducts, false) + '</div><div class="order-catalog-history__actions"><button type="button" class="btn btn--weak btn--sm order-catalog-history__more" data-component-slug="button" data-scroll-history>更多</button></div></section>' : '')
      +   '<section class="order-catalog-products">'
      +     (showingSearchResults ? '' : '<div class="order-catalog-toolbar">' + catalogCategoryTabs() + '</div>')
      +     '<div class="order-catalog-products__body"><div class="order-desktop__catalog-list order-desktop__catalog-list--' + state.catalogViewMode + '">' + catalogList(true, allProducts, true) + '</div></div>'
      +   '</section>'
      +   '</div>'
      + '</aside>';
  }

  function desktopOrder() {
    var t = totals();
    var checkoutBlocked = !state.products.length;
    return ''
      + '<main class="order-desktop__order">'
      +   '<div class="order-desktop__context' + (state.panel === 'customer' ? ' order-desktop__context--customer-open' : '') + '">'
      +     desktopCustomerAnchor()
      +     desktopDeliveryCard()
      +     (state.catalogCollapsed ? desktopProductSearch(false) : '')
      +   '</div>'
      +   '<section class="order-desktop__list-card" aria-labelledby="order-desktop-list-title">'
      +     '<div class="order-desktop__table">'
      +       '<div class="order-desktop__table-title"><strong id="order-desktop-list-title">已添加</strong><div class="order-display-switch"><button class="' + (state.displayMode === 'grouped' ? 'is-active' : '') + '" data-display="grouped">按商品</button><button class="' + (state.displayMode === 'flat' ? 'is-active' : '') + '" data-display="flat">按规格</button></div>' + (state.products.length ? '<button type="button" class="btn btn--weak btn--sm order-desktop-clear-order" data-component-slug="button" data-clear-order>清空整单</button>' : '') + '</div>'
      +       '<div class="order-desktop__table-head"><span>货号／名称</span><span>商品图</span><span>颜色／规格</span><span>单价</span><span>数量</span><span>合计</span><span>备注</span><span aria-hidden="true"></span></div>'
      +       '<div class="order-desktop__lines">' + (state.products.length ? desktopProductRows() : '<div class="order-empty"><strong>当前订单暂无商品</strong><span>从右侧商品库添加商品</span></div>') + orderNoteEntry() + '</div>'
      +     '</div>'
      +   '</section>'
      +   '<footer class="order-desktop__summary">'
      +     quickOps()
      +     desktopSummaryDetails()
      +     '<div class="order-desktop__summary-actions">' + '<button type="button" class="btn btn--strong btn--md ' + (checkoutBlocked ? 'btn--disabled' : '') + '" data-component-slug="button" data-open-checkout ' + (checkoutBlocked ? 'disabled' : '') + '>去结算</button>' + button('存草稿', 'weak', 'md', 'data-save-draft') + '</div>'
      +   '</footer>'
      + '</main>';
  }

  function summaryDetailRow(label, valueHtml, className) {
    return '<div class="order-summary-row' + (className ? ' ' + className : '') + '"><span class="order-summary-row__label">' + label + '</span><span class="order-summary-row__value">' + valueHtml + '</span></div>';
  }

  function discountDetailText(t) {
    return [
      ['会员优惠', t.memberDiscountAmount],
      ['积分抵扣', t.pointsAmount],
      ['优惠券', t.couponAmount],
      ['满减优惠', t.promotionAmount],
      ['整单优惠', t.discountAmount],
      ['抹零', t.roundingAmount]
    ].filter(function (item) {
      return item[1] > 0;
    }).map(function (item) {
      var amount = (Math.round(item[1] * 100) / 100).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
      return item[0] + amount + '元';
    }).join('，');
  }

  function desktopSummaryDetails() {
    var t = totals();
    var deduction = function (amount) { return amount > 0 ? '-' + money(amount) : money(0); };
    var discountText = discountDetailText(t);
    var showFreight = state.delivery === 'express' || state.delivery === 'freight';
    return ''
      + '<div class="order-desktop__summary-details" aria-label="本单金额明细">'
      +   summaryDetailRow('商品总价', '<em class="order-summary-row__meta" data-summary-meta>共' + t.pieces + '件</em><strong data-summary-product-amount>' + money(t.productAmount) + '</strong>')
      +   '<div class="order-summary-row order-summary-row--deduction">'
      +     '<span class="order-summary-row__label">优惠</span>'
      +     '<span class="order-summary-row__value order-summary-discount">'
      +       '<strong data-summary-discount-total>' + deduction(t.totalDiscount) + '</strong>'
      +       '<span class="order-summary-discount__detail" data-summary-discount-detail' + (discountText ? '' : ' hidden') + '>' + escapeHtml(discountText) + '</span>'
      +     '</span>'
      +   '</div>'
      +   (showFreight ? summaryDetailRow('运费', '<strong data-summary-freight>' + money(t.freight) + '</strong><button type="button" class="order-summary-row__edit" data-component-slug="button" data-edit-freight aria-label="编辑运费"><i class="wego-iconfont-s icon-bianji16" aria-hidden="true"></i></button>') : '')
      +   summaryDetailRow('订单总价', '<strong data-summary-payable>' + money(t.payable) + '</strong>', 'order-summary-row--total')
      + '</div>';
  }

  function refreshDesktopSummary(root, t) {
    t = t || totals();
    var nodes = {
      meta: root.querySelector('[data-summary-meta]'),
      product: root.querySelector('[data-summary-product-amount]'),
      discountTotal: root.querySelector('[data-summary-discount-total]'),
      discountDetail: root.querySelector('[data-summary-discount-detail]'),
      freight: root.querySelector('[data-summary-freight]'),
      payable: root.querySelector('[data-summary-payable]')
    };
    if (nodes.meta) nodes.meta.textContent = '共' + t.pieces + '件';
    if (nodes.product) nodes.product.textContent = money(t.productAmount);
    if (nodes.discountTotal) nodes.discountTotal.textContent = t.totalDiscount > 0 ? '-' + money(t.totalDiscount) : money(0);
    if (nodes.discountDetail) {
      nodes.discountDetail.textContent = discountDetailText(t);
      nodes.discountDetail.hidden = !nodes.discountDetail.textContent;
    }
    if (nodes.freight) nodes.freight.textContent = money(t.freight);
    if (nodes.payable) nodes.payable.textContent = money(t.payable);
  }

  function desktopCustomerSummary() {
    if (!state.customer) {
      return ''
        + '<div class="order-desktop-customer-empty">'
        +   '<button type="button" class="order-desktop-customer-select" data-open-panel="customer" aria-haspopup="dialog" aria-expanded="' + (state.panel === 'customer' && !state.customerPopoverClosing) + '" aria-controls="order-desktop-customer-popover"><span class="avatar avatar--40 avatar--image" data-component-slug="avatar"><img src="./lib/assets/image/avatar-defult.png" alt="默认头像"></span><span class="order-desktop-customer-entry"><strong>选择客户</strong><i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i></span></button>'
        +   '<button type="button" class="link order-desktop-customer-add" data-component-slug="link" data-open-panel="customer-create"><i class="wego-iconfont-s icon-yuanjia" aria-hidden="true"></i>新建客户</button>'
        + '</div>';
    }
    var customerTags = String(state.customer.tag || '').replace(/\s*·\s*/g, '、');
    return ''
      + '<div class="order-desktop-customer-summary">'
      +   '<div class="order-desktop-customer-summary__main">'
      +     '<span class="order-desktop-customer-avatar"><span class="avatar avatar--40 avatar--image" data-component-slug="avatar"><img src="' + state.customer.avatar + '" alt="' + escapeHtml(state.customer.name) + '"></span><span class="order-desktop-customer-number">' + escapeHtml(state.customer.number) + '</span></span>'
      +     '<span class="order-desktop-customer-summary__content"><button type="button" class="order-desktop-customer-summary__top" data-open-panel="customer" aria-haspopup="dialog" aria-expanded="' + (state.panel === 'customer' && !state.customerPopoverClosing) + '" aria-controls="order-desktop-customer-popover"><strong>' + escapeHtml(state.customer.name) + '</strong><em class="order-customer-vip order-customer-vip--' + state.customer.level.toLowerCase() + '"><b>' + escapeHtml(state.customer.level) + '</b><span>' + escapeHtml(state.customer.priceType) + '</span></em><span class="order-desktop-customer-tags">' + escapeHtml(customerTags) + '</span></button><span class="order-desktop-customer-summary__bottom"><span class="order-desktop-customer-balance">余额：' + money(state.customer.balance) + '</span><button type="button" class="link" data-component-slug="link" data-recharge>充值</button><span class="order-desktop-customer-divider" aria-hidden="true"></span><span class="order-desktop-customer-points">积分：' + Number(state.customer.points || 0) + '</span></span></span>'
      +   '</div>'
      +   '<button type="button" class="btn btn--weak btn--sm btn--icon-only order-desktop-customer-clear" data-component-slug="button" data-clear-customer aria-label="移除已选客户"><i class="btn__icon icon-yuancha-mian" aria-hidden="true"></i></button>'
      + '</div>';
  }

  function desktopDeliveryControl() {
    var needsInlineAddress = (state.delivery === 'express' || state.delivery === 'freight') && !state.address && !realNameComplete(state.realNameInfo);
    if (needsInlineAddress) {
      var inlineRequiresRealName = orderRequiresRealName();
      return ''
        + '<div class="order-desktop-delivery-inline">'
        +   '<button type="button" data-open-panel="delivery"' + (inlineRequiresRealName ? ' data-real-name-pending' : '') + '><small><i class="wego-iconfont-s icon-che" aria-hidden="true"></i>' + (state.delivery === 'express' ? '快递' : '快运') + '</small><strong>' + (inlineRequiresRealName ? '暂无收货信息和实名信息' : '暂无收货信息') + '</strong><i class="wego-iconfont-s icon-youjiantou16" aria-hidden="true"></i></button>'
        +   '<div class="input-group order-desktop-delivery-inline__input" data-component-slug="input"><div class="input-wrapper"><input type="text" aria-label="粘贴收件信息" placeholder="' + (inlineRequiresRealName ? '粘贴姓名、手机号、收件地址及身份证号' : '粘贴姓名、手机号及收件地址') + '" data-inline-address-paste></div></div>'
        +   '<button type="button" class="btn btn--medium btn--sm btn--disabled" data-component-slug="button" data-inline-recognize-address disabled>识别</button>'
        + '</div>';
    }
    var desktopPickupContact = pickupContactValues(state.pickupContact);
    if (state.delivery === 'pickup' && (!desktopPickupContact.name || !desktopPickupContact.phone)) {
      var desktopPickupPoint = currentPickupPoint();
      return ''
        + '<div class="order-desktop-delivery-inline order-desktop-delivery-inline--pickup">'
        +   '<button type="button" data-open-panel="delivery"><small><i class="wego-iconfont-s icon-daohang" aria-hidden="true"></i>' + (desktopPickupPoint ? '自提点：' + escapeHtml(desktopPickupPoint.name) : '自提') + '</small><strong>暂无提货人信息</strong><i class="wego-iconfont-s icon-youjiantou16" aria-hidden="true"></i></button>'
        +   '<div class="input-group order-desktop-delivery-inline__input" data-component-slug="input"><div class="input-wrapper"><input type="text" aria-label="粘贴提货人信息" placeholder="粘贴姓名和手机号" data-inline-pickup-paste></div></div>'
        +   '<button type="button" class="btn btn--medium btn--sm btn--disabled" data-component-slug="button" data-inline-recognize-pickup disabled>识别</button>'
        + '</div>';
    }
    var summary = deliverySummaryText();
    var summaryParts = deliverySummaryParts();
    var singleLine = !summaryParts.secondary && !summaryParts.meta && (!state.delivery || state.delivery === 'none');
    var addressLine = (state.delivery === 'express' || state.delivery === 'freight') && (state.address || realNameComplete(state.realNameInfo));
    var pickupLine = state.delivery === 'pickup' && summaryParts.meta;
    var emptyLine = !state.delivery;
    var deliveryIcon = state.delivery === 'pickup' ? 'icon-daohang' : 'icon-che';
    var deliveryIconMarkup = state.delivery === 'none'
      ? '<img class="order-desktop-site-pickup-icon" src="./scenes/开单/assets/site-pickup.svg" alt="">'
      : '<i class="wego-iconfont-s ' + deliveryIcon + '" aria-hidden="true"></i>';
    var deliveryContent = singleLine
      ? '<small>' + deliveryIconMarkup + escapeHtml(summaryParts.label) + '</small><span class="order-desktop-delivery-tail"><strong>' + escapeHtml(summaryParts.primary) + '</strong><i class="wego-iconfont-s icon-youjiantou16" aria-hidden="true"></i></span>'
      : '<small>' + deliveryIconMarkup + escapeHtml(summaryParts.label) + '</small><span class="order-desktop-delivery-summary"><strong>' + escapeHtml(summaryParts.primary) + '</strong>' + (summaryParts.secondary ? '<em title="' + escapeHtml(summaryParts.secondary) + '">' + escapeHtml(summaryParts.secondary) + '</em>' : '') + (summaryParts.meta ? '<b class="' + (summaryParts.realNamePending ? 'is-warning' : '') + '">' + (summaryParts.realNamePending ? '<i class="wego-iconfont-s icon-tanhao" aria-hidden="true"></i>' : '') + escapeHtml(summaryParts.meta) + '</b>' : '') + '</span><i class="wego-iconfont-s icon-youjiantou16" aria-hidden="true"></i>';
    return ''
      + '<button type="button" class="order-desktop-customer-delivery ' + (singleLine ? 'order-desktop-customer-delivery--single' : '') + (addressLine ? ' order-desktop-customer-delivery--address' : '') + (pickupLine ? ' order-desktop-customer-delivery--pickup' : '') + (emptyLine ? ' order-desktop-customer-delivery--empty' : '') + '" data-open-panel="delivery"' + (summaryParts.realNamePending ? ' data-real-name-pending' : '') + ' title="' + escapeHtml(summary) + '">'
      +   deliveryContent
      + '</button>';
  }

  function desktopCustomerAnchor() {
    return ''
      + '<div class="order-desktop-customer-anchor ' + (state.customer ? 'order-desktop-customer-anchor--selected' : 'order-desktop-customer-anchor--empty') + '">'
      +   desktopCustomerSummary()
      +   (state.panel === 'customer' ? '<div id="order-desktop-customer-popover" class="order-desktop-customer-popover' + (state.customerPopoverClosing ? ' is-closing' : '') + '" role="dialog" aria-label="选择或新建客户">' + desktopCustomerModalContent() + '</div>' : '')
      + '</div>';
  }

  function desktopDeliveryCard() {
    return '<div class="order-desktop-delivery-card">' + desktopDeliveryControl() + '</div>';
  }

  var QUICK_OP_DEFS = {
    freight: { title: '运费', unit: '元', inputmode: 'decimal', hint: '输入本单运费金额', get: function () { return state.freight; }, apply: function (value) { state.freight = value; } },
    member: { title: '会员折扣', unit: '%', inputmode: 'decimal', hint: '已自动带入当前会员等级折扣，可手动修改并以本次输入为准', get: function () { return state.memberDiscount; }, apply: function (value) { state.memberDiscount = Math.min(Math.max(Math.round(value * 100) / 100, 0), 100); recalculateCustomerPrices(); } },
    points: { title: '积分抵扣', unit: '分', inputmode: 'numeric', hint: '100 积分抵 1 元，填 500 即抵 5 元', get: function () { return state.pointsUsed; }, apply: function (value) { state.pointsUsed = Math.min(availablePoints(), Math.max(0, Math.round(value))); } },
    coupon: { title: '优惠券', unit: '元', inputmode: 'decimal', hint: '输入本单优惠券抵扣金额', get: function () { return state.couponDiscount; }, apply: function (value) { state.couponDiscount = Math.round(value * 100) / 100; } },
    promotion: { title: '满减促销', unit: '元', inputmode: 'decimal', hint: '输入本单满减活动优惠金额', get: function () { return state.promotionDiscount; }, apply: function (value) { state.promotionDiscount = Math.round(value * 100) / 100; } },
    discount: { title: '整单优惠', unit: '%', inputmode: 'decimal', hint: '填 90 表示整单 9 折', get: function () { return state.discount; }, apply: function (value) { state.discount = Math.min(Math.round(value), 100); } },
    rounding: { title: '整单抹零', unit: '元', inputmode: 'decimal', hint: '输入本单抹零金额，直接减免订单零头', get: function () { return state.rounding; }, apply: function (value) { state.rounding = Math.max(0, Math.round(value * 100) / 100); } }
  };

  function freightPopover() {
    var def = QUICK_OP_DEFS.freight;
    return ''
      + '<div class="order-freight-popover" role="dialog" aria-label="设置运费">'
      +   '<header><strong>设置运费</strong><button type="button" class="btn btn--weak btn--sm btn--icon-only" data-component-slug="button" data-close-panel aria-label="关闭"><i class="btn__icon icon-cha16" aria-hidden="true"></i></button></header>'
      +   '<div class="order-quick-edit">'
      +     '<label>运费<div class="number-input" data-component-slug="input"><input class="number-input__field" type="text" inputmode="decimal" value="' + def.get() + '" data-quick-op-value aria-label="运费"><span class="number-input__suffix">元</span></div></label>'
      +     '<small>' + def.hint + '</small>'
      +   '</div>'
      +   '<div class="order-side-actions">' + button('清除', 'weak', 'md', 'data-clear-quick-op') + button('确定', 'strong', 'md', 'data-apply-quick-op') + '</div>'
      + '</div>';
  }

  function availablePoints() {
    var customerPoints = state.customer ? Number(state.customer.pieces || 0) : 0;
    return Math.max(0, Math.floor(customerPoints));
  }

  function pointsDeduction(points) {
    return Math.round(Math.max(0, Number(points || 0))) / 100;
  }

  function pointsOption(mode, label, selected) {
    return '<button type="button" class="order-points-option' + (selected ? ' is-selected' : '') + '" role="radio" aria-checked="' + selected + '" data-points-mode="' + mode + '"><span>' + label + '</span><i class="wego-iconfont-s icon-gou16 order-points-option__check" aria-hidden="true"' + (selected ? '' : ' hidden') + '></i></button>';
  }

  function pointsPopover() {
    var maxPoints = availablePoints();
    var currentPoints = Math.min(maxPoints, Math.max(0, Math.round(Number(state.pointsUsed || 0))));
    var currentMode = state.pointsMode || (currentPoints > 0 ? (currentPoints === maxPoints ? 'max' : 'custom') : 'max');
    var draftPoints = currentMode === 'max' ? maxPoints : (currentMode === 'none' ? 0 : currentPoints);
    return ''
      + '<div class="order-points-popover" role="dialog" aria-label="积分抵扣">'
      +   '<header><strong>积分(剩余' + maxPoints + ')</strong><button type="button" class="btn btn--weak btn--sm btn--icon-only" data-component-slug="button" data-close-panel aria-label="关闭"><i class="btn__icon icon-cha16" aria-hidden="true"></i></button></header>'
      +   '<div class="order-points-options" role="radiogroup" aria-label="积分使用方式">'
      +     pointsOption('none', '暂不使用积分', false)
      +     pointsOption('max', '最高可使用' + maxPoints + '积分，抵扣<span class="order-points-amount">' + money(pointsDeduction(maxPoints)) + '</span>', currentMode === 'max')
      +     pointsOption('custom', '自行输入想用的积分', currentMode === 'custom')
      +   '</div>'
      +   '<div class="order-points-custom' + (currentMode === 'custom' ? ' is-active' : '') + '"' + (currentMode === 'custom' ? '' : ' hidden') + '>'
      +     '<span>使用</span><div class="number-input" data-component-slug="input"><input class="number-input__field" type="text" inputmode="numeric" value="' + (draftPoints || '') + '" placeholder="请输入" data-points-custom-input data-quick-op-value aria-label="使用积分"><span class="number-input__suffix">积分</span></div>'
      +     '<span>抵扣<strong class="order-points-amount" data-points-deduction>' + money(pointsDeduction(draftPoints)) + '</strong></span>'
      +   '</div>'
      +   '<div class="order-side-actions">' + button('取消', 'weak', 'md', 'data-close-panel') + button('确定', 'strong', 'md', 'data-apply-quick-op') + '</div>'
      + '</div>';
  }

  function quickOpButton(icon, label, op) {
    var trigger = '<button type="button" class="order-quick-op' + (quickOpUsed(op) ? ' is-used' : '') + '" data-open-panel="quick" data-quick-op="' + op + '" aria-haspopup="dialog" aria-expanded="' + (state.panel === 'quick' && state.quickOp === op) + '"><i class="wego-iconfont-s ' + icon + '" aria-hidden="true"></i><span>' + label + '</span></button>';
    if (op === 'freight') return '<div class="order-quick-op-anchor order-quick-op-anchor--freight">' + trigger + (state.panel === 'quick' && state.quickOp === 'freight' ? freightPopover() : '') + '</div>';
    if (op === 'points') return '<div class="order-quick-op-anchor order-quick-op-anchor--points">' + trigger + (state.panel === 'quick' && state.quickOp === 'points' ? pointsPopover() : '') + '</div>';
    return trigger;
  }

  function quickOpUsed(op) {
    var t = totals();
    return {
      freight: t.freight > 0,
      member: t.memberDiscountAmount > 0,
      points: t.pointsAmount > 0,
      coupon: t.couponAmount > 0,
      promotion: t.promotionAmount > 0,
      discount: t.discountAmount > 0,
      rounding: t.roundingAmount > 0
    }[op] || false;
  }

  function quickOps() {
    return '<div class="order-desktop__quick-ops" aria-label="快捷优惠操作">'
      + quickOpButton('icon-dianpuhuiyuan', '会员折扣', 'member')
      + quickOpButton('icon-jifen1', '积分抵扣', 'points')
      + quickOpButton('icon-quan', '优惠券', 'coupon')
      + quickOpButton('icon-youhuigou', '满减促销', 'promotion')
      + quickOpButton('icon-youhui', '整单优惠', 'discount')
      + quickOpButton('icon-mopi', '整单抹零', 'rounding')
      + '</div>';
  }

  function quickOpPanel() {
    var op = state.quickOp && QUICK_OP_DEFS[state.quickOp] ? state.quickOp : 'member';
    var def = QUICK_OP_DEFS[op];
    return ''
      + '<div class="order-side-panel__head"><strong>' + def.title + '</strong><button class="link link--12" data-component-slug="link" data-close-panel>关闭</button></div>'
      + '<div class="order-quick-edit">'
      +   '<label>' + def.title + '<div class="number-input" data-component-slug="input"><input class="number-input__field" type="text" inputmode="' + def.inputmode + '" value="' + def.get() + '" data-quick-op-value aria-label="' + def.title + '"><span class="number-input__suffix">' + def.unit + '</span></div></label>'
      +   '<small>' + def.hint + '</small>'
      + '</div>'
      + '<div class="order-side-actions">' + button('清除', 'weak', 'md', 'data-clear-quick-op') + button('确定', 'strong', 'md', 'data-apply-quick-op') + '</div>';
  }

  function checkoutPanel() {
    var draft = state.paymentDraft;
    var t = totals();
    if (!draft) return '';
    var addressRequired = state.delivery === 'express' || state.delivery === 'freight';
    var isPrivatePayment = draft.kind === 'private';
    var received = paymentReceivedAmount(draft);
    var difference = Math.round((received - t.payable) * 100) / 100;
    var hasPaymentAmount = draft.mode === 'single' ? Boolean(draft.method) : comboFilledMethods().length > 0;
    var paymentDifference = '';
    if (isPrivatePayment && hasPaymentAmount && difference < -0.01) {
      paymentDifference = '<div class="order-payment-balance-note order-payment-balance-note--debt">欠款 ' + money(Math.abs(difference)) + (state.customer ? '，将计入客户余额' : '，请补足金额') + '</div>';
    } else if (isPrivatePayment && hasPaymentAmount && difference > 0.01) {
      paymentDifference = '<div class="order-payment-overage"><span>超收 ' + difference.toFixed(2) + ' 元</span>'
        + paymentHandlingOption('change', '找零', draft.overpaymentHandling === 'change')
        + (state.customer ? paymentHandlingOption('balance', '计入客户余额', draft.overpaymentHandling === 'balance') : '')
        + '</div>';
    }
    return ''
      + '<div class="order-payment-total"><span>本单应收</span><strong>' + money(t.payable) + '</strong><small>' + (state.customer ? state.customer.name : '散客 · 零售价') + '</small></div>'
      + (!state.delivery && state.customer ? '<div class="order-inline-error">请先选择发货方式</div>' : (addressRequired && !state.address ? '<div class="order-inline-error">快递／快运需要先填写收货地址</div>' : ''))
      + '<div class="order-payment-kind' + (state.customer ? '' : ' order-payment-kind--guest') + '" role="radiogroup" aria-label="收款状态">'
      +   paymentKindOption('unpaid', '暂不收款', draft.kind === 'unpaid')
      +   paymentKindOption('private', '立即收款', isPrivatePayment)
      +   (state.customer ? paymentKindOption('debt', '记欠款', draft.kind === 'debt') : '')
      + '</div>'
      + (isPrivatePayment
        ? '<div class="order-payment-channel">'
          + '<div class="order-payment-channel__head"><strong>支付方式</strong><div class="order-segment"><button class="' + (draft.mode === 'single' ? 'is-active' : '') + '" data-payment-mode="single">单一支付</button><button class="' + (draft.mode === 'combo' ? 'is-active' : '') + '" data-payment-mode="combo">组合支付</button></div></div>'
          + (draft.mode === 'single'
            ? '<div class="order-option-grid order-option-grid--pay">' + PAYMENT_METHODS.map(function (method) {
                var selected = draft.method === method.id;
                var unavailable = method.id === 'balance' && !state.customer;
                if (!selected) return '<button type="button" class="order-option order-payment-method-card' + (unavailable ? ' is-disabled' : '') + '" data-payment-method="' + method.id + '"' + (unavailable ? ' aria-disabled="true"' : '') + '><i class="wego-iconfont-s ' + method.icon + '" aria-hidden="true"></i><span>' + method.label + '</span></button>';
                return '<div class="order-option order-payment-method-card is-active"><button type="button" data-payment-method="' + method.id + '"><i class="wego-iconfont-s ' + method.icon + '" aria-hidden="true"></i><span>' + method.label + '实收金额</span></button><label><input type="text" inputmode="decimal" value="' + escapeHtml(draft.singleAmount) + '" data-single-payment-amount aria-label="' + method.label + '实收金额"></label></div>';
              }).join('') + '</div>'
            : '<div class="order-payment-split">'
              + PAYMENT_METHODS.map(function (method) { return paymentInput(method.label, method.id, draft[method.id]); }).join('')
              + '</div>')
          + paymentDifference
          + '</div>'
        : (draft.kind === 'debt' ? '<div class="order-payment-balance-note order-payment-balance-note--debt">欠款' + money(t.payable) + '，将记入客户账单</div>' : ''))
      + '<div class="order-payment-options">'
      +   paymentCheckbox(draft.autoPrintReceipt, 'auto-print-receipt', '自动打印小票')
      +   paymentCheckbox(draft.autoDispatch, 'auto-dispatch', '自动打单发货', draft.kind === 'unpaid')
      + '</div>'
      + '<div class="order-payment-note"><label><input type="text" class="order-payment-note__input" value="' + escapeHtml(draft.note || '') + '" placeholder="点击输入收款备注" data-payment-note aria-label="收款备注"><button type="button" class="order-payment-note__camera" aria-label="添加收款凭证"><i class="wego-iconfont-s icon-xiangji" aria-hidden="true"></i></button></label></div>'
      + '<div class="order-side-actions order-side-actions--pay">' + button('取消', 'weak', 'md', 'data-close-panel') + '<button type="button" class="btn btn--strong btn--md ' + (state.paymentStatus === 'processing' || !draft.kind ? 'btn--disabled' : '') + '" data-component-slug="button" data-confirm-payment ' + (state.paymentStatus === 'processing' || !draft.kind ? 'disabled' : '') + '>' + (state.paymentStatus === 'processing' ? '正在确认…' : '确认') + '</button></div>';
  }

  function paymentKindOption(kind, label, selected) {
    return '<button type="button" class="order-payment-kind__option' + (selected ? ' is-active' : '') + '" role="radio" aria-checked="' + selected + '" data-payment-kind="' + kind + '"><span>' + label + '</span></button>';
  }

  function paymentHandlingOption(value, label, selected) {
    return '<button type="button" class="order-payment-handling' + (selected ? ' is-active' : '') + '" role="radio" aria-checked="' + selected + '" data-overpayment-handling="' + value + '"><span class="radio ' + (selected ? 'radio--checked' : '') + '"><span class="radio__inner"></span><span class="radio__dot"></span></span>' + label + '</button>';
  }

  function paymentCheckbox(checked, attr, label, disabled) {
    return '<label class="checkbox-field' + (disabled ? ' is-disabled' : '') + '" role="checkbox" tabindex="' + (disabled ? '-1' : '0') + '" aria-checked="' + (checked ? 'true' : 'false') + '"' + (disabled ? ' aria-disabled="true"' : '') + ' data-clickable data-' + attr + '><span class="checkbox ' + (checked ? 'checkbox--checked' : '') + '"><span class="checkbox__inner"></span>' + (checked ? '<span class="checkbox__icon"><img class="checkbox__asset" src="./lib/assets/icons/checkbox-check.svg" alt=""></span>' : '') + '</span><span class="checkbox-field__text">' + label + '</span></label>';
  }

  function customerPanel() {
    return ''
      + '<div class="order-side-panel__head"><strong>选择客户</strong><button class="link link--12" data-component-slug="link" data-close-panel>关闭</button></div>'
      + '<button type="button" class="order-customer-option ' + (!state.customer ? 'is-active' : '') + '" data-customer-id="guest"><strong>散客／不选客户</strong><small>使用零售价</small></button>'
      + CUSTOMERS.map(function (item) {
          return '<button type="button" class="order-customer-option ' + (state.customer && state.customer.id === item.id ? 'is-active' : '') + '" data-customer-id="' + item.id + '"><strong>' + item.name + '</strong><small>' + item.phone + ' · ' + item.tag + ' · ' + item.priceType + '</small></button>';
        }).join('');
  }

  function customerAvatar(item, className) {
    return '<span class="order-customer-avatar ' + (className || '') + '" aria-hidden="true"><img src="' + item.avatar + '" alt=""></span>';
  }

  function customerRow(item) {
    return ''
      + '<button type="button" class="order-customer-person" data-customer-id="' + item.id + '">'
      +   '<span class="order-customer-person__avatar">' + customerAvatar(item) + '<b>' + escapeHtml(item.number) + '</b></span>'
      +   '<span class="order-customer-person__content">'
      +     '<span class="order-customer-person__title"><strong>' + escapeHtml(item.name) + '</strong><em class="order-customer-vip order-customer-vip--' + item.level.toLowerCase() + '"><b>' + item.level + '</b><span>' + escapeHtml(item.priceType) + '</span></em></span>'
      +     '<span class="order-customer-person__metrics"><small>' + escapeHtml(item.amount) + '</small><small>' + escapeHtml(item.pieces) + '</small><span>' + escapeHtml(item.contact) + '</span></span>'
      +     '<span class="order-customer-person__tags"><small class="order-customer-employee"><img src="./scenes/开单/assets/customer-picker/icon-employee.svg" alt="">' + escapeHtml(item.employee) + '</small><span>老客</span><span>微信好友、回头客</span></span>'
      +   '</span>'
      + '</button>';
  }

  function mobileCustomerPanel() {
    var keyword = state.customerKeyword.trim().toLowerCase();
    var rows = CUSTOMERS.filter(function (item) {
      return !keyword || [item.name, item.phone, item.mobile, item.number, item.contact].some(function (value) { return String(value || '').toLowerCase().indexOf(keyword) >= 0; });
    });
    var recent = RECENT_CUSTOMERS.filter(function (item) {
      return !keyword || item.name.toLowerCase().indexOf(keyword) >= 0;
    });
    return ''
      + '<section class="order-customer-picker">'
      +   '<div class="order-customer-picker__search">'
      +     '<span>客户</span>'
      +     '<div class="input-group input-group--surface-white order-customer-picker__input" data-component-slug="input"><div class="input-wrapper"><input type="search" value="' + escapeHtml(state.customerKeyword) + '" placeholder="选择 / 新建客户" enterkeyhint="search" autocomplete="off" data-customer-search aria-label="搜索客户"><button type="button" class="input-clear" aria-label="清空客户搜索" data-clear-customer-search><i class="icon-yuancha-mian" aria-hidden="true"></i></button></div></div>'
      +     '<button type="button" class="link link--14" data-component-slug="link" data-close-panel>取消</button>'
      +   '</div>'
      +   '<div class="order-customer-picker__scroll">'
      +     '<section class="order-customer-recent"><div>'
      +       (recent.length ? recent.map(function (item) { return '<button type="button" data-customer-id="' + item.customerId + '">' + customerAvatar(item) + '<span>' + escapeHtml(item.name) + '</span></button>'; }).join('') : '<small>没有匹配客户</small>')
      +     '</div></section>'
      +     '<section class="order-customer-all"><header><h3>全部</h3><button type="button" data-new-customer><img src="./scenes/开单/assets/customer-picker/icon-add-circle.svg" alt=""><span>新建</span></button></header>'
      +       '<div class="order-customer-all__list">'
      +         (rows.length ? rows.map(customerRow).join('') : '<div class="order-customer-empty"><span>没有找到“' + escapeHtml(state.customerKeyword.trim()) + '”</span>' + button('新建客户', 'medium', 'md', 'data-new-customer') + '</div>')
      +       '</div>'
      +     '</section>'
      +   '</div>'
      + '</section>';
  }

  function customerPickerNavbar() {
    return ''
      + '<nav class="navbar order-v2__navbar" data-component-slug="navbar">'
      +   '<div class="navbar__body">'
      +     '<div class="navbar__left"><button type="button" class="navbar__left-btn" data-close-panel aria-label="返回开单"><i class="wego-iconfont-s icon-fanhui" aria-hidden="true"></i></button></div>'
      +     '<div class="navbar__center"><span class="navbar__title">开销售单</span></div>'
      +     '<div class="navbar__right navbar__right--icon"><button type="button" class="navbar__action" data-order-settings aria-label="开单设置"><span class="navbar__action-icon"><i class="wego-iconfont-s icon-shezhi" aria-hidden="true"></i></span><span class="navbar__action-label">设置</span></button><button type="button" class="navbar__action" data-open-panel="drafts" aria-label="草稿箱"><span class="navbar__action-icon"><i class="wego-iconfont-s icon-caogaoxiang" aria-hidden="true"></i></span><span class="navbar__action-label">草稿箱</span></button></div>'
      +   '</div>'
      + '</nav>';
  }

  function newCustomerField(label, field, value, placeholder, options) {
    options = options || {};
    var required = options.required ? '<span class="order-customer-create__required">*</span>' : '';
    var prefix = options.prefix ? '<span class="order-customer-create__prefix">' + escapeHtml(options.prefix) + '</span>' : '';
    return ''
      + '<div class="cell cell--single ' + (options.last ? '' : 'cell--divider-right-edge ') + 'cell--bg-white" data-component-slug="cell">'
      +   '<div class="cell__body">'
      +     '<div class="cell__content"><div class="cell__title-row"><span class="cell__title">' + escapeHtml(label) + required + '</span></div></div>'
      +     '<div class="cell__action order-customer-create__field">' + prefix + '<input type="' + (options.type || 'text') + '" inputmode="' + (options.inputmode || 'text') + '" value="' + escapeHtml(value || '') + '" placeholder="' + escapeHtml(placeholder || '') + '" data-new-customer-' + field + ' aria-label="' + escapeHtml(label) + '"></div>'
      +   '</div>'
      + '</div>';
  }

  function newCustomerTemplate(prefillName) {
    return ''
      + '<section class="order-customer-create" data-bg="page">'
      +   '<nav class="navbar order-customer-create__navbar" data-component-slug="navbar"><div class="navbar__body">'
      +     '<div class="navbar__left navbar__left--text"><button type="button" class="navbar__left-btn" data-cancel-new-customer>取消</button></div>'
      +     '<div class="navbar__center"><span class="navbar__title">新建客户</span></div>'
      +     '<div class="navbar__right navbar__right--text">' + button('保存', 'strong', 'sm', 'data-save-new-customer') + '</div>'
      +   '</div></nav>'
      +   '<main class="order-customer-create__body">'
      +     '<section class="cell-group order-customer-create__group" data-component-slug="cell"><div class="cell-group__content">'
      +       newCustomerField('名称', 'name', prefillName, '请输入客户名称', { required: true })
      +       newCustomerField('手机号', 'phone', '', '请输入手机号', { prefix: '+86', inputmode: 'tel' })
      +       newCustomerField('会员编号', 'number', '', '输入4~7位数字', { inputmode: 'numeric' })
      +       newCustomerField('微信号', 'wechat', '', '输入微信号', { last: true })
      +     '</div></section>'
      +     '<section class="cell-group order-customer-create__group" data-component-slug="cell"><div class="cell-group__content">'
      +       newCustomerField('初始余额', 'balance', '', '0', { prefix: '¥', inputmode: 'decimal' })
      +       newCustomerField('赠送金额', 'gift', '', '0', { prefix: '¥', inputmode: 'decimal' })
      +       newCustomerField('积分', 'points', '', '输入数字', { inputmode: 'numeric', last: true })
      +     '</div></section>'
      +   '</main>'
      + '</section>';
  }

  function createCustomerFromForm(formRoot, ctx) {
    var name = formRoot.querySelector('[data-new-customer-name]').value.trim();
    var phone = formRoot.querySelector('[data-new-customer-phone]').value.trim();
    var number = formRoot.querySelector('[data-new-customer-number]').value.trim();
    var wechat = formRoot.querySelector('[data-new-customer-wechat]').value.trim();
    var balance = Number(formRoot.querySelector('[data-new-customer-balance]').value || 0);
    var gift = Number(formRoot.querySelector('[data-new-customer-gift]').value || 0);
    var points = Number(formRoot.querySelector('[data-new-customer-points]').value || 0);
    if (!name) {
      ctx.toast('请输入客户名称');
      formRoot.querySelector('[data-new-customer-name]').focus();
      return false;
    }
    if (number && !/^\d{4,7}$/.test(number)) {
      ctx.toast('会员编号请输入4~7位数字');
      formRoot.querySelector('[data-new-customer-number]').focus();
      return false;
    }
    var createdBalance = Math.max(0, balance + gift);
    var created = {
      id: 'c' + Date.now(), name: name, phone: phone || '未填写手机号', mobile: phone || '未填写手机号', address: '暂未填写收货地址', tag: '新客户', priceType: '零售价', factor: 1,
      lastDelivery: null, lastAddress: null, avatar: './scenes/开单/assets/customer-picker/customer-flower.jpg', number: number || '新客',
      level: 'V1', balance: createdBalance, amount: money(createdBalance), pieces: String(Math.max(0, points)),
      contact: wechat || '未填写微信号', employee: '当前员工'
    };
    CUSTOMERS.unshift(created);
    applyCustomer(created);
    applyDeliveryPreference(customerDeliveryPreference(created));
    state.customerKeyword = '';
    state.panel = null;
    markDirty(ctx);
    return true;
  }

  function openNewCustomer(ctx) {
    var prefillName = state.customerKeyword.trim();
    if (isDesktopWorkbench()) {
      state.panel = 'customer-create';
      renderActive();
      var desktopNameInput = activeContext.root.querySelector('[data-new-customer-name]');
      if (desktopNameInput) {
        desktopNameInput.focus({ preventScroll: true });
        desktopNameInput.setSelectionRange(desktopNameInput.value.length, desktopNameInput.value.length);
      }
      return;
    }
    ctx['openFullScreen' + 'Modal'](newCustomerTemplate(prefillName), {
      label: '新建客户',
      init: function (overlayCtx) {
        var overlayRoot = overlayCtx.root;
        overlayRoot.querySelector('[data-cancel-new-customer]')?.addEventListener('click', function () {
          overlayCtx.close();
        });
        overlayRoot.querySelector('[data-save-new-customer]')?.addEventListener('click', function () {
          if (!createCustomerFromForm(overlayRoot, overlayCtx)) return;
          overlayCtx.close();
          overlayCtx.toast('客户已新建并选中');
        });
      }
    });
  }

  function warehousePanel() {
    return ''
      + '<div class="order-side-panel__head"><strong>选择仓库</strong><button class="link link--12" data-component-slug="link" data-close-panel>关闭</button></div>'
      + WAREHOUSES.map(function (item) {
          return '<button type="button" class="order-customer-option ' + (state.warehouse.id === item.id ? 'is-active' : '') + '" data-warehouse-id="' + item.id + '"><strong>' + item.name + '</strong><small>' + item.scope + ' · ' + item.stock + '</small></button>';
        }).join('');
  }

  function draftsPanel() {
    return ''
      + '<div class="order-side-panel__head"><strong>草稿箱</strong><button class="link link--12" data-component-slug="link" data-close-panel>关闭</button></div>'
      + (state.draftAvailable
        ? '<div class="cell-group" data-component-slug="cell"><div class="cell-group__content"><button type="button" class="cell cell--double cell--bg-white cell--clickable" data-component-slug="cell" data-restore-draft><div class="cell__body"><div class="cell__content"><div class="cell__title-row"><span class="cell__title">李四批发部</span></div><div class="cell__subtitle">2款3件 · 18:12 保存</div></div><div class="cell__action"><span class="cell__action-text">恢复</span><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div></div></button></div></div>'
        : '<div class="order-panel-note">暂无未完成草稿</div>');
  }

  function catalogPanel() {
    return ''
      + '<div class="order-side-panel__head"><strong>选择商品</strong><button class="link link--12" data-component-slug="link" data-close-panel>关闭</button></div>'
      + '<div class="input-group order-panel-search" data-component-slug="input"><label class="field-label" for="order-mobile-search">搜索商品</label><div class="input-wrapper"><input id="order-mobile-search" type="text" value="' + escapeHtml(state.catalogKeyword) + '" placeholder="商品名称或货号" data-catalog-search><button type="button" class="input-clear" aria-label="清空搜索" data-clear-search><i class="icon-yuancha-mian"></i></button></div></div>'
      + '<div class="order-panel-catalog">' + catalogList() + '</div>';
  }

  function deliveryChoices() {
    var draft = activeDeliveryDraft();
    return ''
      + '<section class="cell-group order-delivery-choices" data-component-slug="cell"><div class="cell-group__content">'
      + [['express', '快递'], ['freight', '快运'], ['pickup', '自提'], ['none', '现场取货']].map(function (item) {
          var selected = draft.delivery === item[0];
          return ''
            + '<button type="button" class="cell cell--single cell--bg-white cell--clickable order-delivery-option ' + (selected ? 'is-selected' : '') + '" data-component-slug="cell" data-delivery-id="' + item[0] + '" aria-pressed="' + selected + '">'
            +   '<div class="cell__body"><div class="cell__content"><div class="cell__title-row"><span class="cell__title">' + item[1] + '</span></div></div>'
            +     (selected ? '<i class="wego-iconfont-s icon-gou16 order-delivery-option__check" aria-hidden="true"></i>' : '')
            +   '</div>'
            + '</button>';
        }).join('')
      + '</div></section>';
  }

  function cleanRecipientPart(value) {
    return String(value || '')
      .replace(/^(?:收件人|姓名|联系人|手机号|手机|电话|详细地址|收货地址|地址)\s*[:：]?\s*/i, '')
      .replace(/^[,，;；\s]+|[,，;；\s]+$/g, '')
      .trim();
  }

  function parseRecipientText(value) {
    var source = String(value || '').replace(/\r/g, '').trim();
    if (!source) return { name: '', phone: '', detail: '', idCard: '' };

    var phoneMatch = source.match(/(?:\+?86[\s-]?)?(1[3-9]\d{9})/);
    var phone = phoneMatch ? phoneMatch[1] : '';
    var nameMatch = source.match(/(?:收件人|姓名|联系人)\s*[:：]\s*([^\n,，;；]+)/i);
    var addressMatch = source.match(/(?:详细地址|收货地址|地址)\s*[:：]\s*([\s\S]+)/i);
    var name = nameMatch ? cleanRecipientPart(nameMatch[1]) : '';
    var detail = addressMatch ? cleanRecipientPart(addressMatch[1].split(/\n(?:手机号|手机|电话)\s*[:：]/i)[0]) : '';

    if (!name || !detail) {
      var remainder = source
        .replace(/(?:收件人|姓名|联系人|手机号|手机|电话|详细地址|收货地址|地址)\s*[:：]?/gi, ' ')
        .replace(/(?:\+?86[\s-]?)?1[3-9]\d{9}/, ' ')
        .replace(/[,，;；|]/g, '\n');
      var parts = remainder.split(/\n+/).map(cleanRecipientPart).filter(Boolean);
      if (parts.length < 2) parts = remainder.trim().split(/\s+/).map(cleanRecipientPart).filter(Boolean);
      if (!name && parts.length) name = parts.shift();
      if (!detail && parts.length) detail = parts.join('');
    }

    var idCardMatch = source.match(/(?:身份证号?|证件号?)\s*[:：]?\s*([1-9]\d{5}(?:18|19|20)?\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx])/i)
      || source.match(/\b([1-9]\d{5}(?:18|19|20)?\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx])\b/);
    if (idCardMatch && detail) detail = cleanRecipientPart(detail.replace(idCardMatch[0], '').replace(/(?:身份证号?|证件号?)\s*[:：]?\s*/i, ''));
    return { name: name, phone: phone, detail: detail, idCard: idCardMatch ? idCardMatch[1].toUpperCase() : '' };
  }

  function fillRecognizedAddress(scope, text, ctx) {
    var parsed = parseRecipientText(text);
    if (!parsed.name || !parsed.phone || !parsed.detail) {
      ctx.toast('请粘贴完整的收件人、手机号和详细地址');
      return false;
    }
    var nameInput = scope.querySelector('[data-address-name]');
    var phoneInput = scope.querySelector('[data-address-phone]');
    var detailInput = scope.querySelector('[data-address-detail]');
    if (nameInput) nameInput.value = parsed.name;
    if (phoneInput) phoneInput.value = parsed.phone;
    if (detailInput) detailInput.value = parsed.detail;
    var realNameInput = scope.querySelector('[data-real-name]');
    var idCardInput = scope.querySelector('[data-id-card]');
    if (realNameInput && parsed.name) realNameInput.value = parsed.name;
    if (idCardInput && parsed.idCard) idCardInput.value = parsed.idCard;
    updateInputClearButtons(scope);
    ctx.toast('已识别收件信息');
    return true;
  }

  function applyInlineRecipientText(text, ctx) {
    var parsed = parseRecipientText(text);
    if (!parsed.name || !parsed.phone || !parsed.detail) {
      ctx.toast('请粘贴完整的收件人、手机号和详细地址');
      return false;
    }
    state.address = { name: parsed.name, phone: parsed.phone, detail: parsed.detail };
    if (orderRequiresRealName() && parsed.idCard) state.realNameInfo = { name: parsed.name, idCard: parsed.idCard, mode: 'direct' };
    rememberCurrentDeliveryPreference();
    markDirty(ctx);
    ctx.toast('已识别收件信息');
    return true;
  }

  function parsePickupContactText(value) {
    var source = String(value || '').replace(/\r/g, '').trim();
    var phoneMatch = source.match(/(?:\+?86[\s-]?)?(1[3-9]\d{9})/);
    var phone = phoneMatch ? phoneMatch[1] : '';
    var nameMatch = source.match(/(?:提货人|姓名|联系人)\s*[:：]\s*([^\n,，;；]+)/i);
    var nameSource = nameMatch ? nameMatch[1] : source;
    var name = cleanRecipientPart(nameSource.replace(phoneMatch ? phoneMatch[0] : '', ''));
    return { name: name, phone: phone };
  }

  function applyInlinePickupContactText(text, ctx) {
    var parsed = parsePickupContactText(text);
    if (!parsed.name || !parsed.phone) {
      ctx.toast('请粘贴完整的提货人姓名和手机号');
      return false;
    }
    state.pickupContact = { name: parsed.name, phone: parsed.phone };
    rememberCurrentDeliveryPreference();
    markDirty(ctx);
    ctx.toast('已识别提货人信息');
    return true;
  }

  function pickupForm() {
    var draft = activeDeliveryDraft();
    var selectedPoint = currentPickupPoint(draft.pickupPointId);
    var contact = pickupContactValues(draft.pickupContact);
    return ''
      + '<div class="order-panel-form order-pickup-form">'
      +   (PICKUP_POINTS.length ? ''
        + '<section class="order-pickup-points"><div class="order-pickup-points__head"><strong>选择提货点</strong><button type="button" class="link link--14" data-component-slug="link" data-add-pickup-point><i class="wego-iconfont-s icon-jia16" aria-hidden="true"></i>新增</button></div><div class="order-pickup-points__list">'
        +   PICKUP_POINTS.map(function (point) {
              var selected = selectedPoint && selectedPoint.id === point.id;
              return '<button type="button" class="order-pickup-point ' + (selected ? 'is-selected' : '') + '" data-pickup-point-id="' + point.id + '" aria-pressed="' + selected + '"><span><b>' + escapeHtml(point.name) + '</b><small>' + escapeHtml(point.address) + '</small></span>' + (selected ? '<i class="wego-iconfont-s icon-gou16 order-delivery-option__check" aria-hidden="true"></i>' : '') + '</button>';
            }).join('')
        + '</div></section>' : '')
      +   '<section class="order-pickup-contact"><strong>提货人信息</strong><div class="order-delivery-address-fields">'
      +     '<div class="input-group input-group--surface-white" data-component-slug="input"><label class="field-label" for="pickup-name">姓名</label><div class="input-wrapper"><input id="pickup-name" type="text" value="' + escapeHtml(contact.name) + '" placeholder="请输入提货人姓名" data-pickup-name></div></div>'
      +     '<div class="input-group input-group--surface-white" data-component-slug="input"><label class="field-label" for="pickup-phone">手机号</label><div class="input-wrapper"><input id="pickup-phone" type="text" inputmode="tel" value="' + escapeHtml(contact.phone) + '" placeholder="请输入手机号" data-pickup-phone></div></div>'
      +   '</div></section>'
      + '</div>';
  }

  function addressForm() {
    var draft = activeDeliveryDraft();
    var address = draft.address;
    var realName = draft.realNameInfo || state.realNameInfo;
    var requiresRealName = orderRequiresRealName();
    var realNameMode = realName && realName.mode === 'group' ? 'group' : 'direct';
    var realNameValue = realName ? String(realName.name || '') : '';
    var realNameIdCardValue = realName ? String(realName.idCard || '') : '';
    var showRealNameError = state.deliveryRealNameAttention && realNameMode === 'direct';
    var realNameErrorClass = showRealNameError && !realNameValue.trim() ? ' form-body--error' : '';
    var idCardErrorClass = showRealNameError && !realNameIdCardValid(realNameIdCardValue) ? ' form-body--error' : '';
    var senderMode = draft.senderMode || 'default';
    var senderInfo = draft.senderInfo || state.senderInfo || {};
    return ''
      + '<div class="order-panel-form order-delivery-address-form">'
      +   '<section class="order-delivery-form-section"><header><strong>收货信息</strong><button type="button" class="link link--14" data-component-slug="link" data-history-address>历史地址</button></header>'
      +   '<div class="order-address-paste"><div class="order-address-paste__control"><textarea id="receiver-paste" rows="1" placeholder="粘贴地址，可自动识别并填入" data-address-paste></textarea><button type="button" class="link link--14" data-component-slug="link" data-recognize-address>粘贴并识别</button></div></div>'
      +   '<div class="order-delivery-form-list">'
      +     '<div class="form-body" data-component-slug="form"><div class="form-body__label"><span class="form-body__label-text">收货人</span></div><div class="form-body__action"><input id="receiver-name" type="text" value="' + escapeHtml(address ? address.name : '') + '" placeholder="请输入姓名" data-address-name></div></div>'
      +     '<div class="form-body" data-component-slug="form"><div class="form-body__label"><span class="form-body__label-text">手机号码</span></div><div class="form-body__action"><input id="receiver-phone" type="text" inputmode="tel" value="' + escapeHtml(address ? address.phone : '') + '" placeholder="请输入手机号" data-address-phone></div></div>'
      +     '<button type="button" class="form-body form-body--clickable" data-component-slug="form" data-address-region><div class="form-body__label"><span class="form-body__label-text">地区信息</span></div><div class="form-body__action"><div class="form-body__select"><span class="form-body__select-text">省/市/区/县</span><i class="form-body__select-arrow wego-iconfont-s icon-youjiantou16" aria-hidden="true"></i></div></div></button>'
      +     '<div class="form-body form-body--align-top" data-component-slug="form"><div class="form-body__label"><span class="form-body__label-text">详细地址</span></div><div class="form-body__action"><textarea id="receiver-address" rows="2" placeholder="小区楼栋/乡村名称" data-address-detail>' + escapeHtml(address ? address.detail : '') + '</textarea></div></div>'
      +   '</div>'
      +   '</section>'
      +   (requiresRealName ? '<section class="order-real-name-fields"><header><strong>实名信息 <em>*</em></strong><div><button type="button" class="order-delivery-radio ' + (realNameMode === 'direct' ? 'is-selected' : '') + '" data-real-name-mode="direct"><i class="wego-iconfont-s icon-gou16" aria-hidden="true"></i>跨境直邮</button><button type="button" class="order-delivery-radio ' + (realNameMode === 'group' ? 'is-selected' : '') + '" data-real-name-mode="group"><i class="wego-iconfont-s icon-gou16" aria-hidden="true"></i>拼邮</button></div></header>' + (realNameMode === 'direct' ? '<div class="order-real-name-card form-group__content"><div class="form-body form-body--label-w80' + realNameErrorClass + '" data-component-slug="form"><label class="form-body__label" for="receiver-real-name">姓名</label><div class="form-body__action"><input id="receiver-real-name" type="text" value="' + escapeHtml(realNameValue) + '" placeholder="请输入姓名" data-real-name' + (realNameErrorClass ? ' aria-invalid="true" aria-describedby="receiver-real-name-error"' : '') + '><span id="receiver-real-name-error" class="form-body__error">姓名不能为空</span></div></div><div class="form-body form-body--label-w80' + idCardErrorClass + '" data-component-slug="form"><label class="form-body__label" for="receiver-id-card">身份证号</label><div class="form-body__action"><input id="receiver-id-card" type="text" value="' + escapeHtml(realNameIdCardValue) + '" placeholder="请输入身份证号" data-id-card' + (idCardErrorClass ? ' aria-invalid="true" aria-describedby="receiver-id-card-error"' : '') + '><span id="receiver-id-card-error" class="form-body__error">身份证号格式错误</span></div></div></div>' : '') + '</section>' : '')
      +   '<section class="order-sender-fields"><header><strong>发件人</strong><div><button type="button" class="order-delivery-radio ' + (senderMode === 'default' ? 'is-selected' : '') + '" data-sender-mode="default"><i class="wego-iconfont-s icon-gou16" aria-hidden="true"></i>默认</button><button type="button" class="order-delivery-radio ' + (senderMode === 'proxy' ? 'is-selected' : '') + '" data-sender-mode="proxy"><i class="wego-iconfont-s icon-gou16" aria-hidden="true"></i>代发</button></div></header>' + (senderMode === 'proxy' ? '<div class="order-sender-card order-sender-card--proxy"><div class="input-group" data-component-slug="input"><label class="field-label" for="sender-name">姓名</label><div class="input-wrapper"><input id="sender-name" value="' + escapeHtml(senderInfo.name || '') + '" placeholder="请输入发件人姓名" data-sender-name></div></div><div class="input-group" data-component-slug="input"><label class="field-label" for="sender-phone">手机号</label><div class="input-wrapper"><input id="sender-phone" value="' + escapeHtml(senderInfo.phone || '') + '" placeholder="请输入手机号" data-sender-phone></div></div></div>' : '<div class="order-sender-card"><span><strong>' + escapeHtml(senderInfo.name || '何小小') + ' ' + escapeHtml(senderInfo.phone || '13690809124') + '</strong></span><button type="button" class="link link--14" data-component-slug="link" data-edit-sender>编辑</button></div>') + '</section>'
      + '</div>';
  }

  function deliveryPanel() {
    var draft = activeDeliveryDraft();
    var addressRequired = draft.delivery === 'express' || draft.delivery === 'freight';
    var detailContent = addressRequired ? addressForm() : (draft.delivery === 'pickup' ? pickupForm() : '');
    var detail = detailContent
      ? '<div class="order-delivery-detail order-delivery-detail--' + draft.delivery + '">' + detailContent + '</div>'
      : '';
    return ''
      + '<div class="order-side-panel__head"><strong>选择发货方式</strong><button class="link link--12" data-component-slug="link" data-close-panel>关闭</button></div>'
      + '<div class="order-delivery-panel">'
      +   '<div class="order-delivery-panel__scroll">' + deliveryChoices() + detail + '</div>'
      +   '<div class="order-side-actions order-delivery-actions">' + button('取消', 'weak', 'md', 'data-close-panel') + button('确定', 'strong', 'md', 'data-save-delivery') + '</div>'
      + '</div>';
  }

  function addressPanel() {
    return ''
      + '<div class="order-side-panel__head"><strong>填写收件地址</strong><button class="link link--12" data-component-slug="link" data-close-panel>关闭</button></div>'
      + '<div class="order-delivery-panel"><div class="order-delivery-panel__scroll">' + addressForm() + '</div>'
      + '<div class="order-side-actions">' + button('保存地址', 'strong', 'md', 'data-save-delivery') + '</div></div>';
  }

  function addSinglePicker(draft) {
    var product = draft.product;
    var matrix = addProductMatrix(product);
    var selectedColor = draft.selectedColor || '';
    var selectedSize = draft.selectedSize || '';
    var availableSizes = selectedColor ? matrix.sizes.filter(function (size) {
      return Boolean(specKey(product, selectedColor, size));
    }) : matrix.sizes;
    var spec = selectedColor && selectedSize ? specKey(product, selectedColor, selectedSize) : '';
    var quantity = spec ? Number(draft.skuQty[spec] || 0) : 0;
    var stock = spec ? specStock(product, spec) : 0;
    return ''
      + '<div class="order-single-picker">'
      +   '<section><small>颜色</small><div class="order-add-choice-list order-add-choice-list--colors">' + matrix.colors.map(function (color) {
            return '<button type="button" class="btn btn--weak btn--sm ' + (selectedColor === color ? 'is-selected' : '') + '" data-component-slug="button" data-add-color="' + encodeURIComponent(color) + '">' + escapeHtml(color) + '</button>';
          }).join('') + '</div></section>'
      +   '<section><small>规格</small><div class="order-add-choice-list">' + availableSizes.map(function (size) {
            return '<button type="button" class="btn btn--weak btn--sm ' + (selectedSize === size ? 'is-selected' : '') + '" data-component-slug="button" data-add-size="' + encodeURIComponent(size) + '">' + escapeHtml(size) + '</button>';
          }).join('') + '</div></section>'
      +   '<section class="order-single-qty">'
      +     '<small>购买数量</small>'
      +     '<div class="counter" data-component-slug="counter"><div class="counter__body">'
      +       '<button type="button" class="counter__btn counter__btn--minus" data-single-qty-delta="-1" data-single-spec="' + encodeURIComponent(spec) + '" aria-label="减少购买数量" ' + (spec && quantity <= 0 ? 'disabled' : '') + '><i class="counter__icon icon-jian16"></i></button>'
      +       '<input class="counter__value" type="text" inputmode="numeric" maxlength="5" value="' + quantity + '" data-single-qty-input aria-label="购买数量">'
      +       '<button type="button" class="counter__btn counter__btn--plus" data-single-qty-delta="1" data-single-spec="' + encodeURIComponent(spec) + '" aria-label="增加购买数量" ' + (spec && quantity >= stock ? 'disabled' : '') + '><i class="counter__icon icon-jia16"></i></button>'
      +     '</div><div class="counter__message counter__hint"></div><div class="counter__message counter__error"></div></div>'
      +   '</section>'
      + '</div>';
  }

  function addBatchPicker(draft) {
    var product = draft.product;
    var matrix = addProductMatrix(product);
    return ''
      + '<div class="order-batch-picker">'
      +   '<div class="order-batch-tools">'
      +     button('每色每码 ×1', 'weak', 'sm', 'data-batch-fill="1"')
      +     button('每色每码 ×2', 'weak', 'sm', 'data-batch-fill="2"')
      +     button('复制上次', 'weak', 'sm', 'data-batch-copy')
      +     button('清空', 'danger', 'sm', 'data-batch-clear')
      +   '</div>'
      +   '<div class="order-batch-matrix-wrap"><table class="order-batch-matrix"><thead><tr><th>颜色／尺码</th>' + matrix.sizes.map(function (size) { return '<th><button type="button" data-batch-col-fill="' + encodeURIComponent(size) + '">' + escapeHtml(size) + '</button></th>'; }).join('') + '</tr></thead><tbody>'
      +     matrix.colors.map(function (color) {
              var cells = matrix.sizes.map(function (size) {
                var spec = specKey(product, color, size);
                var stock = specStock(product, spec);
                var qty = Number(draft.skuQty[spec] || 0);
                return '<td>' + (spec && stock > 0 ? '<input type="text" inputmode="numeric" maxlength="5" value="' + qty + '" data-batch-qty="' + encodeURIComponent(spec) + '" aria-label="' + escapeHtml(color + ' ' + size) + '数量"><small>库存' + stock + '</small>' : '<span class="order-batch-unavailable">—</span>') + '</td>';
              }).join('');
              return '<tr><th><button type="button" data-batch-row-fill="' + encodeURIComponent(color) + '">' + escapeHtml(color) + '</button></th>' + cells + '</tr>';
            }).join('')
      +   '</tbody></table></div>'
      +   '<div class="order-batch-hint">点击颜色或尺码标题，可将对应可售规格快速配 1 件</div>'
      + '</div>';
  }

  function addPanel() {
    var draft = state.addDraft;
    if (!draft) return '';
    var product = draft.product;
    var total = addDraftTotal(draft);
    var unitPrice = addDraftUnitPrice(draft);
    var lastDiscountPrice = Number(draft.lastDiscountPrice || 0);
    return ''
      + '<div class="order-add-scroll">'
      +   '<div class="order-side-panel__head"><strong>添加商品</strong><button class="link link--12" data-component-slug="link" data-close-panel>关闭</button></div>'
      +   '<div class="order-add-product order-add-product--pricing">' + image(product, 'order-add-product__image')
      +     '<div class="order-add-product__content"><div><strong>' + escapeHtml(product.name) + '</strong><small>' + escapeHtml(product.code) + '</small></div>'
      +       '<div class="order-add-product__actions">'
      +         '<strong class="order-add-current-price">' + money(unitPrice) + '</strong>'
      +         '<button type="button" data-toggle-add-discount aria-expanded="' + String(Boolean(draft.discountOpen)) + '"><i class="wego-iconfont-s icon-youhui" aria-hidden="true"></i>优惠</button>'
      +         '<button type="button" data-edit-add-product><i class="wego-iconfont-s icon-bianji16" aria-hidden="true"></i>编辑商品</button>'
      +         '<button type="button" data-add-purchase-history><i class="wego-iconfont-s icon-shijian" aria-hidden="true"></i>采购记录</button>'
      +       '</div>'
      +       (draft.lastDiscountTipVisible ? '<div class="order-add-last-price">上次优惠价 ' + money(lastDiscountPrice) + '<button type="button" data-use-last-discount>使用</button></div>' : '')
      +     '</div></div>'
      +   '<fieldset class="order-add-price-modes" aria-label="开单价格">'
      +     '<span class="order-add-price-option tag tag--28 ' + (draft.priceMode === 'cost' ? 'tag--brand tag--selected' : 'tag--white tag--normal') + '" data-component-slug="tag"><button type="button" class="order-add-cost-visibility" data-toggle-cost-price aria-label="' + (draft.costPriceVisible ? '隐藏拿货价' : '显示拿货价') + '"><i class="wego-iconfont-s ' + (draft.costPriceVisible ? 'icon-xianshi' : 'icon-yincang') + '" aria-hidden="true"></i></button><button type="button" class="order-add-price-select" data-add-price-mode="cost" aria-pressed="' + String(draft.priceMode === 'cost') + '"><span class="tag__label">拿货价 ' + (draft.costPriceVisible ? money(productCostPrice(product)) : '***') + '</span></button></span>'
      +     '<button type="button" class="tag tag--28 ' + (draft.priceMode !== 'cost' ? 'tag--brand tag--selected' : 'tag--white tag--normal') + '" data-component-slug="tag" data-add-price-mode="retail" aria-pressed="' + String(draft.priceMode !== 'cost') + '"><span class="tag__label">' + (draft.priceMode === 'discount' ? '优惠价 ' + money(unitPrice) : '售价 ' + money(customerPrice(product))) + '</span></button>'
      +   '</fieldset>'
      +   (draft.discountOpen ? '<div class="order-add-discount-editor"><label for="order-add-discount-value">优惠后单价</label><input id="order-add-discount-value" type="text" inputmode="decimal" value="' + escapeHtml(draft.discountValue) + '" placeholder="请输入金额" data-add-discount-value><button type="button" data-apply-add-discount>应用</button></div>' : '')
      +   '<div class="order-segment order-add-mode-switch"><button class="' + (draft.mode === 'single' ? 'is-active' : '') + '" data-add-mode="single">单买</button><button class="' + (draft.mode === 'batch' ? 'is-active' : '') + '" data-add-mode="batch">多买</button></div>'
      +   (draft.mode === 'batch' ? addBatchPicker(draft) : addSinglePicker(draft))
      +   '<div class="order-add-note-entry"><button type="button" class="link link--14" data-component-slug="link" data-toggle-add-note>' + (draft.note ? '编辑备注' : '添加备注') + '</button>'
      +     (draft.noteOpen ? '<div class="input-group input-group--surface-white order-note-input" data-component-slug="input"><textarea id="product-note" placeholder="例如：单独打包、缺码先联系" data-add-note>' + escapeHtml(draft.note) + '</textarea></div>' : '')
      +   '</div>'
      + '</div>'
      + '<div class="order-add-footer"><span>合计：<b data-add-total-qty>' + total + '</b> 件 <strong data-add-total-amount>' + money(total * unitPrice) + '</strong></span><div class="order-add-footer__actions">' + button('取消', 'weak', 'md', 'data-close-panel') + button('添加', 'strong', 'md', 'data-confirm-add') + '</div></div>';
  }

  function pricePanel() {
    var index = state.panelPayload;
    var item = state.products[index];
    if (!item) return '';
    return ''
      + '<div class="order-side-panel__head"><strong>修改单价</strong><button class="link link--12" data-component-slug="link" data-close-panel>关闭</button></div>'
      + '<div class="order-add-product">' + image(item, 'order-add-product__image') + '<span><strong>' + item.name + '</strong><small>当前价格可直接修改</small></span></div>'
      + '<div class="number-input order-price-input" data-component-slug="input"><input class="number-input__field" type="text" inputmode="decimal" value="' + item.price + '" data-price-value aria-label="商品单价"><span class="number-input__suffix">元</span></div>'
      + '<div class="order-side-actions">' + button('保存价格', 'strong', 'md', 'data-save-price') + '</div>';
  }

  function spuNotePanel() {
    var item = state.products[Number(state.panelPayload)];
    if (!item) return '';
    return ''
      + '<div class="order-side-panel__head"><strong>商品备注</strong><button class="link link--12" data-component-slug="link" data-close-panel>关闭</button></div>'
      + '<div class="order-spu-note-product"><strong>' + escapeHtml(item.name) + '</strong><small>' + escapeHtml(item.code) + ' · 备注按商品生效</small></div>'
      + '<div class="input-group input-group--surface-white order-spu-note-input" data-component-slug="input"><label class="field-label" for="spu-note-value">备注</label><textarea id="spu-note-value" placeholder="例如：发M码、单独打包" data-spu-note-value>' + escapeHtml(item.note || '') + '</textarea></div>'
      + '<div class="order-side-actions">' + button('保存备注', 'strong', 'md', 'data-save-spu-note') + '</div>';
  }

  function paymentInput(label, key, value) {
    return '<label data-clickable data-combo-fill="' + key + '"><span>' + label + '</span><div class="number-input" data-component-slug="input"><input class="number-input__field" type="text" inputmode="decimal" value="' + value + '" data-split="' + key + '" aria-label="' + label + '金额"><span class="number-input__suffix">元</span></div></label>';
  }

  function recoveryPanel(type) {
    var orderFailed = type === 'order-failed';
    return ''
      + '<div class="order-side-panel__head"><strong>' + (orderFailed ? '订单待生成' : '正在确认收款结果') + '</strong></div>'
      + '<div class="order-recovery-state"><i class="wego-iconfont-s icon-shijian"></i><strong>' + (orderFailed ? '款项已收到，订单尚未生成' : '请勿重复付款') + '</strong><span>' + (orderFailed ? '支付凭证和订单快照已保留，可安全重试生成订单。' : '系统正在查询原支付结果，订单内容已保留。') + '</span></div>'
      + '<div class="order-side-actions">' + button(orderFailed ? '重新生成订单' : '查询支付结果', 'strong', 'md', 'data-recover-payment="' + type + '"') + '</div>';
  }

  function sidePanelContent() {
    if (state.panel === 'catalog') return catalogPanel();
    if (state.panel === 'customer') return customerPanel();
    if (state.panel === 'warehouse') return warehousePanel();
    if (state.panel === 'drafts') return draftsPanel();
    if (state.panel === 'delivery') return deliveryPanel();
    if (state.panel === 'address') return addressPanel();
    if (state.panel === 'add') return addPanel();
    if (state.panel === 'price') return pricePanel();
    if (state.panel === 'note') return spuNotePanel();
    if (state.panel === 'checkout' || state.panel === 'payment') return checkoutPanel();
    if (state.panel === 'quick') return quickOpPanel();
    if (state.panel === 'unknown' || state.panel === 'order-failed') return recoveryPanel(state.panel);
    return '';
  }

  function highlightCustomerMatch(value, keyword) {
    var text = String(value || '');
    var query = String(keyword || '');
    var index = text.toLowerCase().indexOf(query.toLowerCase());
    if (!query || index < 0) return escapeHtml(text);
    return escapeHtml(text.slice(0, index)) + '<mark>' + escapeHtml(text.slice(index, index + query.length)) + '</mark>' + escapeHtml(text.slice(index + query.length));
  }

  function desktopCustomerSearchRow(item, keyword) {
    return ''
      + '<button type="button" class="order-desktop-customer-result" data-customer-id="' + item.id + '">'
      +   '<span class="avatar avatar--40 avatar--image"><img src="' + item.avatar + '" alt=""></span>'
      +   '<span><strong>' + highlightCustomerMatch(item.name, keyword) + '</strong><small>' + highlightCustomerMatch(item.mobile, keyword) + '　' + highlightCustomerMatch(item.address, keyword) + '</small></span>'
      + '</button>';
  }

  function desktopCustomerModalContent() {
    var keyword = state.customerKeyword.trim();
    var lowerKeyword = keyword.toLowerCase();
    var rows = CUSTOMERS.filter(function (item) {
      return !lowerKeyword || [item.name, item.phone, item.mobile, item.number, item.contact, item.address].some(function (value) { return String(value || '').toLowerCase().indexOf(lowerKeyword) >= 0; });
    });
    var body = keyword
      ? ''
        + '<div class="order-desktop-customer-search-results">'
        +   '<button type="button" class="btn btn--medium btn--md order-desktop-customer-new" data-component-slug="button" data-new-customer><i class="btn__icon icon-jia16" aria-hidden="true"></i>新建客户【' + escapeHtml(keyword) + '】</button>'
        +   (rows.length ? rows.map(function (item) { return desktopCustomerSearchRow(item, keyword); }).join('') : '<div class="order-desktop-customer-no-match">没有匹配客户，可直接新建“' + escapeHtml(keyword) + '”</div>')
        + '</div>'
      : ''
        + '<section class="order-desktop-customer-recent"><div>'
        +   RECENT_CUSTOMERS.map(function (item) { return '<button type="button" data-customer-id="' + item.customerId + '">' + customerAvatar(item) + '<span>' + escapeHtml(item.name) + '</span></button>'; }).join('')
        + '</div></section>'
        + '<section class="order-desktop-customer-all"><header><h3>全部客户</h3><button type="button" class="btn btn--medium btn--sm" data-component-slug="button" data-new-customer><i class="btn__icon icon-jia16" aria-hidden="true"></i>新建</button></header><div>'
        +   CUSTOMERS.map(customerRow).join('')
        + '</div></section>';
    return ''
      + '<div class="input-group order-desktop-customer-search" data-component-slug="input"><div class="input-wrapper"><input type="text" value="' + escapeHtml(state.customerKeyword) + '" placeholder="输入客户姓名、手机号、会员编号或微信号" autocomplete="off" data-customer-search aria-label="搜索客户"><button type="button" class="input-clear" aria-label="清空客户搜索" data-clear-customer-search><i class="icon-yuancha-mian" aria-hidden="true"></i></button></div></div>'
      + '<div class="order-desktop-customer-modal__scroll">' + body + '</div>';
  }

  function desktopNewCustomerModalContent() {
    return ''
      + '<div class="order-desktop-customer-create">'
      +   '<div class="order-desktop-customer-create__scroll">'
      +     '<section class="cell-group order-customer-create__group" data-component-slug="cell"><div class="cell-group__content">'
      +       newCustomerField('名称', 'name', state.customerKeyword.trim(), '请输入客户名称', { required: true })
      +       newCustomerField('手机号', 'phone', '', '请输入手机号', { prefix: '+86', inputmode: 'tel' })
      +       newCustomerField('会员编号', 'number', '', '输入4~7位数字', { inputmode: 'numeric' })
      +       newCustomerField('微信号', 'wechat', '', '输入微信号', { last: true })
      +     '</div></section>'
      +     '<section class="cell-group order-customer-create__group" data-component-slug="cell"><div class="cell-group__content">'
      +       newCustomerField('初始余额', 'balance', '', '0', { prefix: '¥', inputmode: 'decimal' })
      +       newCustomerField('赠送金额', 'gift', '', '0', { prefix: '¥', inputmode: 'decimal' })
      +       newCustomerField('积分', 'points', '', '输入数字', { inputmode: 'numeric', last: true })
      +     '</div></section>'
      +     '<button type="button" class="order-customer-create-invite" data-invite-customer-qr><i class="wego-iconfont-s icon-erweima" aria-hidden="true"></i><span>邀请客户扫码</span></button>'
      +   '</div>'
      +   '<footer class="order-desktop-customer-create__actions">' + button('保存', 'strong', 'md', 'data-save-desktop-new-customer') + '</footer>'
      + '</div>';
  }

  function desktopRightPanel() {
    if (desktopShowsCatalog()) return desktopCatalog();
    return '<aside class="order-desktop__side">' + sidePanelContent() + '</aside>';
  }

  function desktopShowsCatalog() {
    return !state.panel || state.panel === 'add' || state.panel === 'customer' || state.panel === 'customer-create' || state.panel === 'delivery' || state.panel === 'address' || state.panel === 'note' || state.panel === 'checkout' || state.panel === 'payment' || state.panel === 'product-edit' || state.panel === 'product-create' || state.panel === 'product-temp-create' || (state.panel === 'quick' && (state.quickOp === 'freight' || state.quickOp === 'points'));
  }

  function desktopWorkspaceStyle() {
    return '';
  }

  function productEditField(label, field, value, options) {
    options = options || {};
    var inputId = 'order-product-edit-' + field;
    var suffixId = inputId + '-suffix';
    return ''
      + '<div class="order-product-edit-field' + (options.multiline ? ' order-product-edit-field--multiline' : '') + '">'
      +   '<label for="' + inputId + '">' + label + '</label>'
      +   (options.multiline
            ? '<textarea id="' + inputId + '" data-product-edit-field="' + field + '" rows="2">' + escapeHtml(value) + '</textarea>'
            : '<input id="' + inputId + '" type="' + (options.type || 'text') + '" inputmode="' + (options.inputmode || 'text') + '" value="' + escapeHtml(value) + '" placeholder="' + escapeHtml(options.placeholder || '') + '" data-product-edit-field="' + field + '"' + (options.suffix ? ' aria-describedby="' + suffixId + '"' : '') + '>')
      +   (options.suffix ? '<em id="' + suffixId + '">' + options.suffix + '</em>' : '')
      +   (options.action ? '<button type="button" class="link link--12 order-product-edit-field__action" data-component-slug="link" ' + options.action.attrs + '>' + options.action.label + '</button>' : '')
      + '</div>';
  }

  function beginProductEdit(productId, orderItemIndex) {
    var catalogProduct = allCatalogProducts().find(function (item) { return item.id === productId; });
    var orderItem = Number.isInteger(orderItemIndex) ? state.products[orderItemIndex] : null;
    var product = catalogProduct || orderItem;
    if (!product) return false;
    var productSpecs = product.specs || Object.keys(product.skuQty || {});
    if (!productSpecs.length) productSpecs = ['默认/均码'];
    var colors = [];
    var sizes = [];
    productSpecs.forEach(function (spec) {
      var pair = splitSpec(spec);
      var color = pair.color;
      if (colors.indexOf(color) < 0) colors.push(color);
      if (sizes.indexOf(pair.size) < 0) sizes.push(pair.size);
    });
    state.productEditDraft = {
      productId: catalogProduct ? catalogProduct.id : '',
      orderItemIndex: orderItem ? orderItemIndex : null,
      image: product.image,
      name: product.name,
      listPrice: String(product.listPrice),
      costPrice: String(product.costPrice == null ? Math.round(product.listPrice * 0.48 * 100) / 100 : product.costPrice),
      code: product.code,
      specs: sizes.join('、'),
      colors: (product.colors && product.colors.length ? product.colors : colors).join('、'),
      weight: String(product.weight || ''),
      inventory: product.inventory == null && product.stock == null ? '' : String(product.inventory == null ? product.stock : product.inventory)
    };
    state.panel = 'product-edit';
    state.panelPayload = product.id;
    renderActive();
    focusProductEditDialog();
    return true;
  }

  function productEditModal() {
    var draft = state.productEditDraft;
    if (!draft) return '';
    return ''
      + '<div class="order-product-edit-modal" role="dialog" aria-modal="true" aria-label="编辑商品">'
      +   '<div class="order-product-edit-modal__panel">'
      +     '<header class="order-product-edit-modal__head"><strong>编辑商品</strong><button type="button" class="btn btn--weak btn--sm btn--icon-only" data-component-slug="button" data-close-panel aria-label="关闭"><i class="btn__icon icon-cha16" aria-hidden="true"></i></button></header>'
      +     '<div class="order-product-edit-modal__body">'
      +       '<section class="order-product-edit-images" aria-label="商品图片"><span>图片</span><div><span class="wg-image wg-image--rounded-md" data-component-slug="image"><img class="wg-image__src is-loaded" src="' + draft.image + '" alt="' + escapeHtml(draft.name) + '主图"></span><button type="button" class="order-product-edit-images__add" data-product-edit-more aria-label="添加商品图片"><i class="wego-iconfont-s icon-jia16" aria-hidden="true"></i></button></div></section>'
      +       '<div class="order-product-edit-fields">'
      +         productEditField('产品名', 'name', draft.name, { multiline: true })
      +         productEditField('售价', 'listPrice', draft.listPrice, { type: 'text', inputmode: 'decimal', suffix: '元' })
      +         productEditField('拿货价', 'costPrice', draft.costPrice, { type: 'text', inputmode: 'decimal', suffix: '元' })
      +         productEditField('货号', 'code', draft.code, { action: { label: '自动生成', attrs: 'data-generate-product-code' } })
      +         productEditField('规格', 'specs', draft.specs, { placeholder: '多个规格用、分隔' })
      +         productEditField('颜色', 'colors', draft.colors, { placeholder: '多个颜色用、分隔' })
      +         productEditField('重量', 'weight', draft.weight, { inputmode: 'decimal', placeholder: '请输入重量', suffix: 'kg' })
      +         productEditField('库存', 'inventory', draft.inventory, { inputmode: 'numeric', placeholder: '默认不限库存' })
      +       '</div>'
      +       '<section class="order-product-edit-meta"><div><button type="button" class="tag tag--28 tag--white tag--normal" data-component-slug="tag" data-product-edit-more><span class="tag__label">加来源</span></button><span class="tag tag--28 tag--white tag--normal" data-component-slug="tag"><span class="tag__label">所有粉丝可见</span></span></div><button type="button" class="link link--14" data-component-slug="link" data-product-edit-more>编辑更多</button></section>'
      +     '</div>'
      +     '<footer class="order-product-edit-modal__actions"><button type="button" class="link link--14" data-component-slug="link" data-product-edit-more>编辑更多</button><div>' + button('取消', 'weak', 'md', 'data-close-panel') + button('保存', 'strong', 'md', 'data-save-product-edit') + '</div></footer>'
      +   '</div>'
      + '</div>';
  }

  function beginProductCreate(type) {
    var temporary = type === 'temporary';
    state.catalogCreateMenuOpen = false;
    state.productCreateDraft = {
      type: temporary ? 'temporary' : 'product',
      image: '',
      imageName: '',
      name: '',
      listPrice: '',
      costPrice: '',
      code: '',
      specs: '',
      colors: '',
      weight: '',
      inventory: ''
    };
    state.panel = temporary ? 'product-temp-create' : 'product-create';
    renderActive();
    focusProductEditDialog();
  }

  function productCreateField(label, field, value, options) {
    options = options || {};
    var inputId = 'order-product-create-' + field;
    return ''
      + '<div class="order-product-edit-field">'
      +   '<label for="' + inputId + '">' + label + '</label>'
      +   '<input id="' + inputId + '" type="text" inputmode="' + (options.inputmode || 'text') + '" value="' + escapeHtml(value) + '" data-product-create-field="' + field + '" placeholder="' + escapeHtml(options.placeholder || '') + '"' + (options.required ? ' required aria-required="true"' : '') + '>'
      +   (options.note ? '<em>' + options.note + '</em>' : '')
      +   (options.action ? '<button type="button" class="link link--12 order-product-edit-field__action" data-component-slug="link" ' + options.action.attrs + '>' + options.action.label + '</button>' : '')
      + '</div>';
  }

  function productCreateModal() {
    var draft = state.productCreateDraft;
    if (!draft) return '';
    var temporary = draft.type === 'temporary';
    var title = temporary ? '创建临时商品' : '创建商品';
    var imageHtml = draft.image
      ? '<span class="wg-image wg-image--rounded-md" data-component-slug="image"><img class="wg-image__src is-loaded" src="' + draft.image + '" alt="' + escapeHtml(draft.name || '待创建商品') + '主图"></span>'
      : '';
    return ''
      + '<div class="order-product-edit-modal" role="dialog" aria-modal="true" aria-label="' + title + '">'
      +   '<div class="order-product-edit-modal__panel">'
      +     '<header class="order-product-edit-modal__head"><strong>' + title + '</strong><button type="button" class="btn btn--weak btn--sm btn--icon-only" data-component-slug="button" data-close-panel aria-label="关闭"><i class="btn__icon icon-cha16" aria-hidden="true"></i></button></header>'
      +     '<div class="order-product-edit-modal__body' + (temporary ? ' order-product-create-modal__body--temporary' : '') + '">'
      +       '<section class="order-product-edit-images" aria-label="商品图片"><span>图片</span><div>' + imageHtml + '<button type="button" class="order-product-edit-images__add" data-trigger-product-create-image aria-label="选择商品图片"><i class="wego-iconfont-s icon-jia16" aria-hidden="true"></i></button><input type="file" accept="image/*" data-product-create-image hidden></div></section>'
      +       '<div class="order-product-edit-fields">'
      +         productCreateField('简称', 'name', draft.name, { placeholder: '请输入', required: true })
      +         productCreateField('售价', 'listPrice', draft.listPrice, { inputmode: 'decimal', placeholder: '选填', action: temporary ? null : { label: '设置', attrs: 'data-product-create-price-setting' } })
      +         productCreateField('拿货价', 'costPrice', draft.costPrice, { inputmode: 'decimal', placeholder: '用于计算利润', note: '仅自己可见' })
      +         productCreateField('货号', 'code', draft.code, { placeholder: '选填', action: { label: '自动生成', attrs: 'data-generate-product-create-code' } })
      +         productCreateField('规格', 'specs', draft.specs, { placeholder: '默认（空格隔开录入多个）' })
      +         productCreateField('颜色', 'colors', draft.colors, { placeholder: '默认（空格隔开录入多个）' })
      +         (temporary ? '' : productCreateField('重量', 'weight', draft.weight, { inputmode: 'decimal', placeholder: '选填' }) + productCreateField('库存', 'inventory', draft.inventory, { inputmode: 'numeric', placeholder: '默认不限库存' }))
      +       '</div>'
      +       (temporary ? '<div class="order-product-create-spacer" aria-hidden="true"></div>' : '<section class="order-product-edit-meta"><div><button type="button" class="tag tag--28 tag--white tag--normal" data-component-slug="tag" data-product-create-more><span class="tag__label">加来源</span></button><button type="button" class="tag tag--28 tag--white tag--normal" data-component-slug="tag" data-product-create-more><span class="tag__label">所有粉丝可见</span></button></div><button type="button" class="link link--14" data-component-slug="link" data-product-create-more>编辑更多</button></section>')
      +     '</div>'
      +     '<footer class="order-product-edit-modal__actions">' + (temporary ? '<span></span>' : '<button type="button" class="link link--14" data-component-slug="link" data-product-create-more>编辑更多</button>') + '<div>' + button('取消', 'weak', 'md', 'data-close-panel') + '<button type="button" class="btn btn--strong btn--md" data-component-slug="button" data-publish-product-create ' + (String(draft.name || '').trim() ? '' : 'disabled') + '>发布</button></div></footer>'
      +   '</div>'
      + '</div>';
  }

  function desktopModal() {
    if (state.panel === 'product-edit') return productEditModal();
    if (state.panel === 'product-create' || state.panel === 'product-temp-create') return productCreateModal();
    if (state.panel !== 'add' && state.panel !== 'customer-create' && state.panel !== 'delivery' && state.panel !== 'note' && state.panel !== 'checkout' && state.panel !== 'payment') return '';
    var isCustomerCreate = state.panel === 'customer-create';
    var isDelivery = state.panel === 'delivery';
    var isNote = state.panel === 'note';
    var isCheckout = state.panel === 'checkout' || state.panel === 'payment';
    // Exception: 宿主 modal 当前只有全宽面板，无法承载 PC 中宽新建客户、发货方式与商品录入；此处仅回退承载层，内容仍消费正式组件。
    return ''
      + '<div class="order-desktop-modal ' + (isCustomerCreate || isDelivery ? 'order-desktop-modal--customer' : '') + (isDelivery ? ' order-desktop-modal--delivery' : '') + (isNote ? ' order-desktop-modal--note' : (isCheckout ? ' order-desktop-modal--checkout' : ' order-desktop-modal--add')) + '" role="dialog" aria-modal="true" aria-labelledby="order-desktop-modal-title" data-state="open">'
      +   '<div class="order-desktop-modal__panel">'
      +     '<div class="order-desktop-modal__head"><strong id="order-desktop-modal-title">' + (isCustomerCreate ? '新建客户' : (isDelivery ? '选择发货方式' : (isNote ? '商品备注' : (isCheckout ? '支付结算' : '添加商品')))) + '</strong><button type="button" class="btn btn--weak btn--sm btn--icon-only" data-component-slug="button" data-close-panel aria-label="关闭"><i class="btn__icon ' + (isDelivery ? 'icon-cha-cu' : 'icon-cha16') + '" aria-hidden="true"></i></button></div>'
      +     '<div class="order-desktop-modal__body">' + (isCustomerCreate ? desktopNewCustomerModalContent() : (isDelivery ? deliveryPanel() : (isNote ? spuNotePanel() : (isCheckout ? checkoutPanel() : addPanel())))) + '</div>'
      +   '</div>'
      + '</div>';
  }

  function desktopView() {
    state.clerkDailyTotal = storedClerkDailyTotal();
    var catalogCollapsedClass = desktopShowsCatalog() && state.catalogCollapsed ? ' order-desktop__workspace--catalog-collapsed' : '';
    var catalogResizableClass = desktopShowsCatalog() && !state.catalogCollapsed ? ' order-desktop__workspace--with-resizer' : '';
    var catalogResizeHandle = desktopShowsCatalog() && !state.catalogCollapsed
      ? '<div class="order-desktop__catalog-resizer" role="separator" aria-orientation="vertical" aria-label="拖动调整商品库宽度" data-catalog-resizer></div>'
      : '';
    var modalBackgroundAttrs = state.panel === 'product-edit' || state.panel === 'product-create' || state.panel === 'product-temp-create' ? ' inert aria-hidden="true"' : '';
    return ''
      + '<section class="order-v2-desktop" aria-label="桌面端开单"' + modalBackgroundAttrs + '>'
      +   '<header class="order-desktop__header">'
      +     '<div class="order-desktop__header-left"><button type="button" class="btn btn--weak btn--sm order-desktop-back" data-component-slug="button" data-back><i class="btn__icon icon-zuojiantou16" aria-hidden="true"></i>返回</button><span class="order-desktop__title-anchor"><h1 class="order-desktop__title">收银开单</h1><button type="button" class="order-desktop-warehouse" data-open-panel="warehouse"><span>' + escapeHtml(state.warehouse.name) + '</span><i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i></button></span></div>'
      +     '<div class="order-desktop__header-center"></div>'
      +     '<div class="order-desktop__header-right"><div class="order-industry-switch"><button type="button" class="btn btn--weak btn--sm" data-component-slug="button" data-toggle-industry-menu aria-haspopup="menu" aria-expanded="' + state.industryMenuOpen + '">切换行业<i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i></button>' + (state.industryMenuOpen ? '<div class="order-industry-menu" role="menu" aria-label="切换行业"><button type="button" role="menuitemradio" aria-checked="' + (state.industry === 'clothing') + '" data-industry="clothing"><span>服装</span>' + (state.industry === 'clothing' ? '<i class="wego-iconfont-s icon-gou16" aria-hidden="true"></i>' : '') + '</button><button type="button" role="menuitemradio" aria-checked="' + (state.industry === 'phone') + '" data-industry="phone"><span>手机</span>' + (state.industry === 'phone' ? '<i class="wego-iconfont-s icon-gou16" aria-hidden="true"></i>' : '') + '</button></div>' : '') + '</div><button type="button" class="btn btn--weak btn--sm" data-component-slug="button" data-open-panel="drafts"><i class="btn__icon icon-caogaoxiang" aria-hidden="true"></i>草稿箱 (' + state.draftCount + ')</button><button type="button" class="btn btn--weak btn--sm order-desktop-history" data-component-slug="button"><i class="btn__icon icon-dingdan" aria-hidden="true"></i>历史订单</button><div class="order-desktop-guide-anchor"><button type="button" class="btn btn--weak btn--sm order-desktop-guide-selector" data-component-slug="button" data-toggle-guide aria-haspopup="dialog" aria-expanded="' + state.guidePickerOpen + '">导购员：' + escapeHtml(state.guide.name) + '<i class="wego-iconfont-s icon-xiajiantou16" aria-hidden="true"></i></button>' + (state.guidePickerOpen ? '<div class="order-desktop-guide-menu" role="dialog" aria-label="选择导购员">' + GUIDES.map(function (guide) { return '<button type="button" class="btn btn--weak btn--sm" data-component-slug="button" data-guide-id="' + guide.id + '" aria-pressed="' + (state.guide.id === guide.id) + '">' + escapeHtml(guide.name) + '</button>'; }).join('') + '</div>' : '') + '</div><div class="order-desktop-clerk-summary"><span class="order-desktop-clerk">开单员：' + escapeHtml(CURRENT_CLERK.name) + '</span><span class="order-desktop-clerk-divider" aria-hidden="true"></span><span class="order-desktop-daily-total">今日合计：' + state.clerkDailyTotal.count + '单 ' + dailyTotalAmount(state.clerkDailyTotal.amount) + '元</span></div></div>'
      +   '</header>'
      +   '<div class="order-desktop__workspace' + catalogCollapsedClass + catalogResizableClass + '"' + desktopWorkspaceStyle() + '>'
      +     desktopOrder()
      +     catalogResizeHandle
      +     desktopRightPanel()
      +     clearOrderConfirm()
      +   '</div>'
      + '</section>';
  }

  function clearOrderConfirm() {
    if (!state.confirmClearOrder) return '';
    return ''
      + '<div class="order-clear-confirm" role="dialog" aria-modal="true" aria-labelledby="order-clear-confirm-title" data-state="open">'
      +   '<div class="order-clear-confirm__panel">'
      +     '<strong id="order-clear-confirm-title">确定清空已添加商品</strong>'
      +     '<div class="order-clear-confirm__actions">'
      +       button('取消', 'weak', 'md', 'data-clear-cancel')
      +       button('确定', 'strong', 'md', 'data-clear-confirm')
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function mobileModal() {
    if (!state.panel) return '';
    // Exception: 现有开单面板依赖场景内统一状态重绘，宿主 overlay 暂不支持该状态回灌；本轮沿用原承载层并补齐全屏与关闭行为。
    if (state.panel === 'customer') {
      return ''
        + '<div class="modal modal--frame-x order-v2-modal order-v2-modal--customer" role="dialog" aria-modal="true" aria-label="选择或新建客户" data-state="open">'
        +   '<div class="modal__panel">' + customerPickerNavbar() + '<div class="modal__body order-v2-modal__body">' + mobileCustomerPanel() + '</div></div>'
        + '</div>';
    }
    if (state.panel === 'delivery' || state.panel === 'address') {
      return ''
        + '<div class="modal modal--frame-x modal--has-actions order-v2-modal order-v2-modal--sheet" role="dialog" aria-modal="true" data-state="open" data-component-slug="modal">'
        +   '<div class="modal__panel">'
        +     '<div class="modal__title modal__title--default"><nav class="navbar" data-component-slug="navbar"><div class="navbar__body"><div class="navbar__left"></div><div class="navbar__center"><span class="navbar__title">' + panelTitle() + '</span></div><div class="navbar__right navbar__right--text"><button type="button" class="navbar__action navbar__action--text" data-close-panel><span class="navbar__action-label">取消</span></button></div></div></nav></div>'
        +     '<div class="modal__body order-v2-modal__body">' + (state.panel === 'delivery' ? deliveryChoices() : addressPanel()) + '</div>'
        +   '</div>'
        + '</div>';
    }
    return ''
      + '<div class="modal modal--frame-x modal--has-actions order-v2-modal' + (state.panel === 'add' ? ' order-v2-modal--add' : '') + '" role="dialog" aria-modal="true" data-state="open" data-component-slug="modal">'
      +   '<div class="modal__panel">'
      +     '<div class="modal__title modal__title--default"><nav class="navbar" data-component-slug="navbar"><div class="navbar__body"><div class="navbar__left"><button type="button" class="navbar__left-btn navbar__left-btn--circle" data-close-panel aria-label="收起"><i class="wego-iconfont-s icon-xiajiantou16"></i></button></div><div class="navbar__center"><span class="navbar__title">' + panelTitle() + '</span></div><div class="navbar__right"></div></div></nav></div>'
      +     '<div class="modal__body order-v2-modal__body">' + sidePanelContent() + '</div>'
      +   '</div>'
      + '</div>';
  }

  function panelTitle() {
    return ({ catalog: '选择商品', customer: '选择客户', warehouse: '选择仓库', drafts: '草稿箱', delivery: '选择发货方式', address: '填写收件地址', add: '添加商品', price: '修改单价', note: '商品备注', checkout: '支付结算', payment: '支付结算', unknown: '确认支付结果', 'order-failed': '订单待生成' })[state.panel] || '订单设置';
  }

  function productImagePreview() {
    if (state.previewImageIndex == null) return '';
    var item = state.products[Number(state.previewImageIndex)];
    if (!item) return '';
    // Exception: 当前正式 Image 组件提供 clickable 状态，但未提供业务大图查看器；此处仅补场景承载层，图片本体继续使用正式 Image DOM。
    return ''
      + '<div class="order-image-preview" role="dialog" aria-modal="true" aria-label="' + escapeHtml(item.name) + '商品大图">'
      +   '<button type="button" class="order-image-preview__backdrop" data-close-image aria-label="关闭商品大图"></button>'
      +   '<div class="order-image-preview__panel">'
      +     '<button type="button" class="order-image-preview__close" data-close-image aria-label="关闭"><i class="wego-iconfont-s icon-cha16"></i></button>'
      +     '<span class="wg-image wg-image--rounded-lg wg-image--contain order-image-preview__image" data-component-slug="image"><img class="wg-image__src is-loaded" src="' + item.image + '" alt="' + escapeHtml(item.name) + '"></span>'
      +     '<strong>' + escapeHtml(item.name) + '</strong><small>' + escapeHtml(item.code) + '</small>'
      +   '</div>'
      + '</div>';
  }

  function rootTemplate() {
    return '<div class="order-v2-page" data-bg="page">' + mobileView() + desktopView() + desktopModal() + mobileModal() + orderNoteModal() + freightEditModal() + productImagePreview() + orderRowContextMenu() + '</div>';
  }

  function renderWorkbench(root, ctx) {
    root.innerHTML = rootTemplate();
    updateInputClearButtons(root);
    syncCatalogCategoryTabs(root);
  }

  function catalogResizeLimits(workspace) {
    var workspaceWidth = workspace ? workspace.getBoundingClientRect().width : window.innerWidth;
    var minCatalog = Math.min(360, Math.max(300, workspaceWidth * 0.26));
    var minOrder = workspaceWidth * 0.5;
    var resizerWidth = 8;
    var maxCatalog = Math.max(minCatalog, workspaceWidth - minOrder - resizerWidth);
    return { min: minCatalog, max: maxCatalog, workspaceWidth: workspaceWidth };
  }

  function applyCatalogWidth(root, nextWidth) {
    var workspace = root && root.querySelector ? root.querySelector('.order-desktop__workspace') : null;
    if (!workspace) return;
    var limits = catalogResizeLimits(workspace);
    var clamped = Math.max(limits.min, Math.min(limits.max, Number(nextWidth || 0)));
    state.catalogWidth = clamped;
    workspace.style.gridTemplateColumns = 'minmax(0,1fr) var(--spacer-8) minmax(300px,' + Math.round(clamped) + 'px)';
  }

  function beginCatalogResize(event, root) {
    var handle = event.target.closest('[data-catalog-resizer]');
    if (!handle || !isDesktopWorkbench() || state.catalogCollapsed) return false;
    var workspace = handle.closest('.order-desktop__workspace');
    var catalog = workspace ? workspace.querySelector('.order-desktop__catalog') : null;
    if (!workspace || !catalog) return false;
    event.preventDefault();
    event.stopPropagation();
    var catalogBounds = catalog.getBoundingClientRect();
    state.catalogResizePointerId = event.pointerId;
    state.catalogResizeStartX = event.clientX;
    state.catalogResizeStartWidth = catalogBounds.width;
    workspace.classList.add('is-catalog-resizing');
    document.body.dataset.orderCatalogResizing = 'true';
    try { handle.setPointerCapture(event.pointerId); } catch (error) {}
    return true;
  }

  function updateCatalogResize(event, root) {
    if (state.catalogResizePointerId !== event.pointerId) return;
    event.preventDefault();
    var delta = state.catalogResizeStartX - event.clientX;
    applyCatalogWidth(root, Number(state.catalogResizeStartWidth || 0) + delta);
  }

  function endCatalogResize(event, root) {
    if (state.catalogResizePointerId !== event.pointerId) return;
    var handle = event.target.closest('[data-catalog-resizer]');
    var workspace = root && root.querySelector ? root.querySelector('.order-desktop__workspace') : null;
    if (workspace) workspace.classList.remove('is-catalog-resizing');
    delete document.body.dataset.orderCatalogResizing;
    if (handle) {
      try { handle.releasePointerCapture(event.pointerId); } catch (error) {}
    }
    state.catalogResizePointerId = null;
    state.catalogResizeStartX = null;
    state.catalogResizeStartWidth = null;
  }

  function syncCatalogCategoryTabs(root) {
    var tabs = root.querySelector('.order-catalog-category-tabs');
    if (!tabs) return;
    window.requestAnimationFrame(function () {
      if (!tabs.isConnected) return;
      var selected = tabs.querySelector('.tag[aria-pressed="true"]');
      if (!selected) return;
      selected.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }

  function updateInputClearButtons(root) {
    root.querySelectorAll('.input-group input[type="text"], .input-group input[type="search"]').forEach(function (input) {
      var clear = input.parentElement.querySelector('.input-clear');
      if (clear) clear.style.display = input.value ? 'block' : 'none';
    });
    var desktopProductInput = root.querySelector('[data-header-catalog-search]');
    var desktopProductSubmit = root.querySelector('[data-submit-header-search]');
    if (desktopProductSubmit) desktopProductSubmit.hidden = !desktopProductInput || !desktopProductInput.value.trim();
  }

  function openPanel(type, payload) {
    if (type === 'customer') {
      if (state.customerPopoverCloseTimer) window.clearTimeout(state.customerPopoverCloseTimer);
      state.customerPopoverCloseTimer = null;
      state.customerPopoverClosing = false;
    }
    state.panel = type === 'products' ? 'catalog' : type;
    state.panelPayload = payload == null ? null : payload;
    renderActive();
  }

  function closeDesktopCustomerPopover() {
    if (state.panel !== 'customer' || state.customerPopoverClosing) return;
    state.customerPopoverClosing = true;
    renderActive();
    state.customerPopoverCloseTimer = window.setTimeout(function () {
      state.customerPopoverCloseTimer = null;
      state.customerPopoverClosing = false;
      if (state.panel === 'customer') state.panel = null;
      renderActive();
    }, 150);
  }

  function panelScope(target, root) {
    return target.closest('.order-desktop__side, .order-desktop-modal__body, .order-v2-modal__body') || root;
  }

  function startAdd(productId) {
    var product = activeCatalogProducts().find(function (item) { return item.id === productId; });
    if (!product) return;
    var skuQty = {};
    product.specs.forEach(function (spec) { skuQty[spec] = 0; });
    state.addDraft = {
      product: product,
      mode: storedAddMode(),
      priceMode: 'retail',
      unitPrice: customerPrice(product),
      lastDiscountPrice: productLastDiscountPrice(product),
      lastDiscountTipVisible: true,
      costPriceVisible: false,
      discountOpen: false,
      discountValue: '',
      skuQty: skuQty,
      selectedColor: '',
      selectedSize: '',
      note: '',
      noteOpen: false
    };
    state.panel = 'add';
    renderActive();
  }

  function addSingleSpecProduct(productId, ctx) {
    var product = activeCatalogProducts().find(function (item) { return item.id === productId; });
    if (!product || product.specs.length !== 1) return false;
    var skuQty = {};
    skuQty[product.specs[0]] = 1;
    mergeProductIntoOrder(product, skuQty, 'single', '');
    markDirty(ctx);
    ctx.toast('已加入开单清单');
    return true;
  }

  function mergeProductIntoOrder(product, skuQty, mode, note, pricing) {
    state.selectedRow = null;
    var priceMode = pricing && pricing.priceMode ? pricing.priceMode : 'retail';
    var unitPrice = pricing && pricing.unitPrice != null ? Number(pricing.unitPrice) : customerPrice(product);
    var existing = state.products.find(function (item) {
      return item.code === product.code && (item.priceMode || 'retail') === priceMode && Number(item.price) === unitPrice;
    });
    if (existing) {
      Object.keys(skuQty).forEach(function (spec) {
        existing.skuQty[spec] = Number(existing.skuQty[spec] || 0) + Number(skuQty[spec] || 0);
      });
      existing.qty = Object.keys(existing.skuQty).reduce(function (sum, spec) {
        return sum + Number(existing.skuQty[spec] || 0);
      }, 0);
      if (note && !existing.note) existing.note = note;
      return existing;
    }
    var created = {
      id: product.id + '-' + Date.now(),
      code: product.code,
      name: product.name,
      listPrice: product.listPrice,
      price: unitPrice,
      priceMode: priceMode,
      image: product.image,
      freightTemplate: product.freightTemplate ? Object.assign({}, product.freightTemplate) : { requiresRealName: false },
      qty: Object.keys(skuQty).reduce(function (sum, spec) { return sum + Number(skuQty[spec] || 0); }, 0),
      mode: mode,
      skuQty: Object.assign({}, skuQty),
      note: note || '',
      manualPrice: priceMode !== 'retail'
    };
    state.products.push(created);
    return created;
  }

  function updateAddDraftTotals(root) {
    var draft = state.addDraft;
    if (!draft) return;
    var total = addDraftTotal(draft);
    root.querySelectorAll('[data-add-total-qty]').forEach(function (node) { node.textContent = total; });
    root.querySelectorAll('[data-add-total-amount]').forEach(function (node) { node.textContent = money(total * addDraftUnitPrice(draft)); });
  }

  function restoreDraft(ctx) {
    state.delivery = CUSTOMERS[0].lastDelivery;
    state.address = { name: '陈小姐', phone: '138****6688', detail: '浙江省杭州市上城区九堡街道新江花园12幢' };
    state.products = [
      { id: 'p1', code: 'TS-2408', name: '韩版休闲T恤', listPrice: 89, price: 72.98, image: PRODUCTS[0].image, freightTemplate: Object.assign({}, PRODUCTS[0].freightTemplate), qty: 2, mode: 'single', skuQty: { '白色/M': 2 }, note: '白色优先' },
      { id: 'p2', code: 'JK-1082', name: '高腰牛仔短裤', listPrice: 129, price: 105.78, image: PRODUCTS[1].image, qty: 1, mode: 'batch', skuQty: { '蓝色/28': 1 }, note: '' }
    ];
    applyCustomer(CUSTOMERS[0]);
    state.draftAvailable = false;
    state.panel = null;
    state.saveStatus = '已恢复草稿 · 18:12';
    renderActive();
    ctx.toast('草稿已恢复');
  }

  function validateCheckout(ctx) {
    if (!state.products.length) {
      ctx.toast('请先添加商品');
      return false;
    }
    if (!state.delivery && state.customer) {
      state.panel = 'delivery';
      renderActive();
      ctx.toast('请选择发货方式');
      return false;
    }
    if ((state.delivery === 'express' || state.delivery === 'freight') && orderRequiresRealName() && !realNameComplete(state.realNameInfo)) {
      state.deliveryRealNameAttention = true;
      state.deliveryDraft = deliveryDraftFromState();
      state.panel = 'delivery';
      renderActive();
      ctx.toast('请完善必填的实名信息');
      focusDeliveryRealName(activeContext && activeContext.root);
      return false;
    }
    if (state.delivery === 'pickup' && (!state.pickupContact || !state.pickupContact.name || !state.pickupContact.phone)) {
      state.panel = 'delivery';
      renderActive();
      ctx.toast('请填写提货人姓名和手机号');
      return false;
    }
    return true;
  }

  function beginPayment(ctx) {
    if (!validateCheckout(ctx)) return;
    var payable = totals().payable;
    var preference = storedPaymentPreference();
    if (preference && preference.kind === 'debt' && !state.customer) preference = null;
    if (preference && preference.method === 'balance' && !state.customer) preference.method = '';
    state.paymentDraft = {
      kind: preference ? preference.kind : null,
      mode: preference ? preference.mode : 'single',
      method: preference ? preference.method : '',
      singleAmount: '',
      overpaymentHandling: state.customer ? 'balance' : 'change',
      autoPrintReceipt: true,
      autoDispatch: false,
      note: ''
    };
    PAYMENT_METHODS.forEach(function (method) { state.paymentDraft[method.id] = ''; });
    if (state.paymentDraft.kind === 'private' && state.paymentDraft.mode === 'single' && state.paymentDraft.method) {
      state.paymentDraft.singleAmount = payable.toFixed(2);
    }
    state.paymentStatus = 'idle';
    state.panel = 'checkout';
    renderActive();
  }

  function paymentReceivedAmount(draft) {
    if (!draft || draft.kind !== 'private') return 0;
    if (draft.mode === 'single') return Math.max(0, Number(draft.singleAmount || 0));
    return PAYMENT_METHODS.reduce(function (sum, method) {
      return sum + Math.max(0, Number(draft[method.id] || 0));
    }, 0);
  }

  function comboFilledMethods(excludeKey) {
    return PAYMENT_METHODS.filter(function (method) {
      if (excludeKey && method.id === excludeKey) return false;
      return Number(state.paymentDraft[method.id] || 0) > 0;
    });
  }

  function focusComboInput(key) {
    if (!activeContext || !activeContext.root) return;
    var inputs = activeContext.root.querySelectorAll('[data-split="' + key + '"]');
    var visible = null;
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].getClientRects().length > 0) { visible = inputs[i]; break; }
    }
    var el = visible || (inputs[0] || null);
    if (!el) return;
    el.focus({ preventScroll: true });
    var len = el.value.length;
    try { el.setSelectionRange(len, len); } catch (err) {}
  }

  function activateComboChannel(ctx, key) {
    var draft = state.paymentDraft;
    if (!draft) return;
    if (Number(draft[key] || 0) > 0) {
      focusComboInput(key);
      return;
    }
    var filled = comboFilledMethods(key);
    if (filled.length >= 2) {
      setTimeout(function () { ctx.toast('仅支持两种方式组合收款'); }, 0);
      return;
    }
    if (filled.length === 1) {
      var payable = totals().payable;
      var remaining = Math.max(payable - Number(draft[filled[0].id] || 0), 0);
      draft[key] = remaining > 0 ? remaining.toFixed(2) : '0';
      renderActive();
    }
    focusComboInput(key);
  }

  function confirmPayment(ctx) {
    var draft = state.paymentDraft;
    var payable = totals().payable;
    if (!draft || !draft.kind) {
      ctx.toast('请选择结算方式');
      return;
    }
    if (draft.kind === 'debt' && !state.customer) {
      ctx.toast('请先选择客户');
      return;
    }
    if (draft.kind !== 'private') {
      state.paymentStatus = 'processing';
      renderActive();
      setTimeout(function () { finishOrder(ctx); }, 350);
      return;
    }
    if (draft.mode === 'single' && !draft.method) {
      ctx.toast('请选择收款方式');
      return;
    }
    var received = paymentReceivedAmount(draft);
    if (received <= 0) {
      ctx.toast('请输入收款金额');
      return;
    }
    var shortage = Math.max(0, Math.round((payable - received) * 100) / 100);
    var excess = Math.max(0, Math.round((received - payable) * 100) / 100);
    if (shortage > 0 && !state.customer) {
      ctx.toast('收款金额不足，请补足后再确认');
      return;
    }
    if (excess > 0 && draft.overpaymentHandling === 'balance' && !state.customer) {
      ctx.toast('请先选择客户');
      return;
    }
    draft.receivedAmount = received;
    draft.shortage = shortage;
    draft.excess = excess;
    if (!draft.balanceApplied && state.customer) {
      if (shortage > 0) state.customer.balance = Math.round((Number(state.customer.balance || 0) - shortage) * 100) / 100;
      if (excess > 0 && draft.overpaymentHandling === 'balance') state.customer.balance = Math.round((Number(state.customer.balance || 0) + excess) * 100) / 100;
      draft.balanceApplied = true;
    }
    state.paymentStatus = 'processing';
    renderActive();
    setTimeout(function () { finishOrder(ctx); }, 650);
  }

  function finishOrder(ctx) {
    state.paymentStatus = 'success';
    state.orderNo = 'SO' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + String(Math.floor(Math.random() * 9000) + 1000);
    var paymentKind = state.paymentDraft ? state.paymentDraft.kind : 'private';
    rememberPaymentPreference(state.paymentDraft);
    state.paymentSummary = paymentKind === 'unpaid'
      ? '未收款'
      : (paymentKind === 'debt'
        ? '记欠款'
        : (state.paymentDraft && state.paymentDraft.shortage > 0
          ? '部分收款 · 欠款' + money(state.paymentDraft.shortage)
          : (state.paymentDraft && state.paymentDraft.mode === 'combo' ? '组合收款' : ((PAYMENT_METHODS.find(function (item) { return item.id === state.paymentDraft.method; }) || {}).label || '已收款'))));
    if (!state.dailyTotalRecorded) {
      var receivedAmount = paymentKind === 'private' ? Math.min(Number(state.paymentDraft && state.paymentDraft.receivedAmount || 0), totals().payable) : 0;
      recordClerkDailyTotal(receivedAmount);
      state.dailyTotalRecorded = true;
    }
    state.panel = null;
    ctx.navigate('workspace-order-success');
  }

  function setProductQuantity(itemIndex, spec, nextQty) {
    var item = state.products[itemIndex];
    if (!item) return;
    var value = Math.max(1, Math.min(9999999, Number(nextQty || 1)));
    if (isSkuMode(item.mode) && spec) {
      item.skuQty[spec] = value;
      item.qty = Object.keys(item.skuQty).reduce(function (sum, key) { return sum + Number(item.skuQty[key] || 0); }, 0);
      return;
    }
    if (isSkuMode(item.mode)) {
      var activeSpecs = Object.keys(item.skuQty).filter(function (key) { return item.skuQty[key] > 0; });
      var primarySpec = activeSpecs[0] || Object.keys(item.skuQty)[0];
      if (primarySpec) {
        var otherQty = activeSpecs.reduce(function (sum, key) { return key === primarySpec ? sum : sum + Number(item.skuQty[key] || 0); }, 0);
        item.skuQty[primarySpec] = Math.max(1, value - otherQty);
        item.qty = Object.keys(item.skuQty).reduce(function (sum, key) { return sum + Number(item.skuQty[key] || 0); }, 0);
        return;
      }
    }
    item.qty = value;
  }

  function handleClick(event, root, ctx) {
    var target = event.target.closest('button, [data-clickable]');
    if (!target || !root.contains(target)) return;

    if (target.matches('[data-back]')) {
      delete document.body.dataset.orderLayout;
      ctx.back();
      return;
    }
    if (target.matches('[data-order-settings]')) {
      ctx.toast('开单设置入口已保留，本期不展开');
      return;
    }
    if (target.matches('[data-toggle-industry-menu]')) {
      state.industryMenuOpen = !state.industryMenuOpen;
      renderActive();
      return;
    }
    if (target.matches('[data-industry]')) {
      var nextIndustry = target.dataset.industry;
      var industryChanged = nextIndustry !== state.industry;
      if (industryChanged) {
        state.industry = nextIndustry;
        state.products = [];
        state.selectedRow = null;
        state.catalogViewMode = nextIndustry === 'phone' ? 'list' : 'grid';
        state.catalogCategory = '全部';
        state.catalogScopeType = 'all';
        state.catalogScopeValue = '';
        state.panel = null;
        state.saveStatus = '已切换行业，开单清单已清空';
      }
      state.industryMenuOpen = false;
      renderActive();
      ctx.toast(industryChanged ? '已切换为' + (state.industry === 'phone' ? '手机' : '服装') + '行业，开单清单已清空' : '当前已是' + (state.industry === 'phone' ? '手机' : '服装') + '行业');
      return;
    }
    if (target.matches('[data-toggle-guide]')) {
      state.guidePickerOpen = !state.guidePickerOpen;
      renderActive();
      return;
    }
    if (target.matches('[data-trigger-image-search]')) {
      var localImageInput = root.querySelector('[data-header-image-input]');
      if (localImageInput) localImageInput.click();
      return;
    }
    if (target.matches('[data-guide-id]')) {
      var nextGuide = GUIDES.find(function (guide) { return guide.id === target.dataset.guideId; });
      if (nextGuide) state.guide = nextGuide;
      state.guidePickerOpen = false;
      renderActive();
      ctx.toast('已切换导购员：' + state.guide.name);
      return;
    }
    if (target.matches('[data-save-draft]')) {
      state.saveStatus = '已手动保存';
      renderActive();
      ctx.toast('草稿已保存');
      return;
    }
    if (target.matches('[data-restore-draft]')) {
      restoreDraft(ctx);
      return;
    }
    if (target.matches('[data-discard-draft]')) {
      state.draftAvailable = false;
      renderActive();
      ctx.toast('已放弃旧草稿');
      return;
    }
    if (target.matches('[data-ai-entry]')) {
      ctx.toast('AI开单将在后续版本开放');
      return;
    }
    if (target.matches('[data-toggle-product-create-menu]')) {
      state.catalogCreateMenuOpen = !state.catalogCreateMenuOpen;
      renderActive();
      if (state.catalogCreateMenuOpen) focusCatalogCreateMenuItem('first');
      return;
    }
    if (target.matches('[data-create-product-type]')) {
      beginProductCreate(target.dataset.createProductType);
      return;
    }
    if (target.matches('[data-toggle-catalog]')) {
      state.catalogCollapsed = !state.catalogCollapsed;
      resetDesktopProductSearch();
      try { window.localStorage.setItem('wego-order-catalog-collapsed', String(state.catalogCollapsed)); } catch (error) {}
      renderActive();
      return;
    }
    if (target.matches('[data-toggle-catalog-filter]')) {
      state.catalogFilterOpen = !state.catalogFilterOpen;
      renderActive();
      return;
    }
    if (target.matches('[data-toggle-sidebar-catalog-filter]')) {
      state.catalogSidebarFilterOpen = !state.catalogSidebarFilterOpen;
      renderActive();
      return;
    }
    if (target.matches('[data-sidebar-catalog-source]')) {
      state.catalogScopeType = target.dataset.sidebarCatalogSource ? 'source' : 'all';
      state.catalogScopeValue = target.dataset.sidebarCatalogSource || '';
      state.catalogSidebarFilterOpen = false;
      resetDesktopProductSearch();
      renderActive();
      return;
    }
    if (target.matches('[data-scroll-history]')) {
      var historyList = target.closest('.order-catalog-history')?.querySelector('.order-catalog-history__list');
      var historyCard = historyList?.querySelector('.order-catalog-item');
      if (historyList && historyCard) {
        var reachedHistoryEnd = historyList.scrollLeft + historyList.clientWidth >= historyList.scrollWidth - 2;
        var historyGap = Number.parseFloat(window.getComputedStyle(historyList).columnGap) || 0;
        historyList.scrollTo({ left: reachedHistoryEnd ? 0 : historyList.scrollLeft + historyCard.offsetWidth + historyGap, behavior: 'smooth' });
      }
      return;
    }
    if (target.matches('[data-catalog-scope-type]')) {
      state.catalogScopeType = target.dataset.catalogScopeType;
      state.catalogScopeValue = target.dataset.catalogScopeValue || '';
      state.catalogFilterOpen = false;
      resetDesktopProductSearch();
      renderActive();
      return;
    }
    if (target.matches('[data-catalog-view]')) {
      state.catalogViewMode = target.dataset.catalogView;
      try { window.localStorage.setItem('wego-order-catalog-view-mode', state.catalogViewMode); } catch (error) {}
      renderActive();
      return;
    }
    if (target.matches('[data-catalog-category]')) {
      state.catalogCategory = target.dataset.catalogCategory || '全部';
      resetDesktopProductSearch();
      renderActive();
      var selectedCatalogTab = activeContext.root.querySelector('.order-catalog-category-tabs .tag[aria-pressed="true"]');
      if (selectedCatalogTab) selectedCatalogTab.scrollIntoView({ block: 'nearest', inline: 'center' });
      return;
    }
    if (target.matches('[data-preview-image]')) {
      state.previewImageIndex = Number(target.dataset.previewImage);
      renderActive();
      return;
    }
    if (target.matches('[data-close-image]')) {
      state.previewImageIndex = null;
      renderActive();
      return;
    }
    if (target.matches('[data-scan]')) {
      ctx.toast(state.scannerConnected ? '扫码枪已连接' : '暂未连接扫码枪');
      return;
    }
    if (target.matches('[data-open-panel]')) {
      var type = target.dataset.openPanel;
      if (type === 'customer' && isDesktopWorkbench() && state.panel === 'customer') {
        closeDesktopCustomerPopover();
        return;
      }
      if (type === 'quick' && target.dataset.quickOp === 'points' && !state.customer) {
        ctx.toast('请先选择客户');
        return;
      }
      if (type === 'products') {
        if (!isDesktopWorkbench()) {
          openPanel('catalog');
        } else {
          var search = root.querySelector('[data-catalog-search]');
          if (search) search.focus();
        }
      } else {
        if (type === 'quick') state.quickOp = target.dataset.quickOp || 'member';
        if (type === 'delivery') {
          state.deliveryDraft = deliveryDraftFromState();
          state.deliveryRealNameAttention = target.hasAttribute('data-real-name-pending');
        }
        openPanel(type);
        if (type === 'customer') {
          var customerSearch = root.querySelector(isDesktopWorkbench() ? '.order-desktop-customer-popover [data-customer-search]' : '.order-v2-modal--customer [data-customer-search]');
          if (customerSearch) {
            customerSearch.focus({ preventScroll: true });
            customerSearch.setSelectionRange(customerSearch.value.length, customerSearch.value.length);
          }
        } else if (type === 'quick' && (state.quickOp === 'freight' || state.quickOp === 'points') && isDesktopWorkbench()) {
          var anchoredQuickInput = root.querySelector((state.quickOp === 'freight' ? '.order-freight-popover' : '.order-points-popover') + ' [data-quick-op-value]');
          if (anchoredQuickInput) {
            anchoredQuickInput.focus({ preventScroll: true });
            anchoredQuickInput.select();
          }
        } else if (type === 'delivery') {
          focusDeliveryRealName(root);
        }
      }
      return;
    }
    if (target.matches('[data-points-mode]')) {
      var pointsMode = target.dataset.pointsMode;
      var pointsInput = root.querySelector('[data-points-custom-input]');
      var nextPoints = pointsMode === 'max' ? availablePoints() : (pointsMode === 'none' ? 0 : Math.min(availablePoints(), Math.max(0, Number(pointsInput?.value || 0))));
      root.querySelectorAll('[data-points-mode]').forEach(function (option) {
        var selected = option === target;
        option.classList.toggle('is-selected', selected);
        option.setAttribute('aria-checked', String(selected));
        var check = option.querySelector('.order-points-option__check');
        if (check) check.hidden = !selected;
      });
      var customBox = root.querySelector('.order-points-custom');
      if (customBox) {
        customBox.classList.toggle('is-active', pointsMode === 'custom');
        customBox.hidden = pointsMode !== 'custom';
      }
      if (pointsInput) pointsInput.value = nextPoints || '';
      var pointsAmount = root.querySelector('[data-points-deduction]');
      if (pointsAmount) pointsAmount.textContent = money(pointsDeduction(nextPoints));
      if (pointsMode === 'custom' && pointsInput) {
        pointsInput.focus({ preventScroll: true });
        pointsInput.select();
      }
      return;
    }
    if (target.matches('[data-apply-quick-op]')) {
      var quickInput = root.querySelector('[data-quick-op-value]');
      var rawQuick = quickInput ? String(quickInput.value).trim() : '';
      var opType = state.quickOp && QUICK_OP_DEFS[state.quickOp] ? state.quickOp : null;
      if (!opType) return;
      if (opType === 'points') {
        var selectedPointsMode = root.querySelector('[data-points-mode][aria-checked="true"]');
        state.pointsMode = selectedPointsMode ? selectedPointsMode.dataset.pointsMode : 'max';
      }
      var numQuick = parseFloat(rawQuick);
      if (rawQuick === '') {
        QUICK_OP_DEFS[opType].apply(opType === 'member' || opType === 'discount' ? 100 : 0);
        state.panel = null;
        markDirty(ctx);
        renderActive();
        ctx.toast('已清除' + QUICK_OP_DEFS[opType].title);
        return;
      }
      if (isNaN(numQuick) || numQuick < 0) {
        ctx.toast('请输入有效数字');
        return;
      }
      QUICK_OP_DEFS[opType].apply(numQuick);
      state.panel = null;
      markDirty(ctx);
      renderActive();
      ctx.toast(QUICK_OP_DEFS[opType].title + '已应用');
      return;
    }
    if (target.matches('[data-clear-quick-op]')) {
      var clearOp = state.quickOp && QUICK_OP_DEFS[state.quickOp] ? state.quickOp : null;
      if (clearOp) {
        QUICK_OP_DEFS[clearOp].apply(clearOp === 'member' || clearOp === 'discount' ? 100 : 0);
      }
      state.panel = null;
      markDirty(ctx);
      renderActive();
      ctx.toast('已清除');
      return;
    }
    if (target.matches('[data-close-panel]')) {
      var closingAddPanel = state.panel === 'add';
      var closingProductEdit = state.panel === 'product-edit';
      var closingProductCreate = state.panel === 'product-create' || state.panel === 'product-temp-create';
      var closingDelivery = state.panel === 'delivery';
      var closingProductId = closingProductEdit && state.productEditDraft ? state.productEditDraft.productId : '';
      if (closingAddPanel) {
        state.desktopProductKeyword = '';
        state.addDraft = null;
      }
      var productEditReturnPanel = closingProductEdit ? state.productEditReturnPanel : null;
      if (closingProductEdit) {
        state.productEditDraft = null;
        state.productEditReturnPanel = null;
      }
      if (closingProductCreate) {
        if (state.productCreateDraft && state.productCreateDraft.objectUrl && window.URL && window.URL.revokeObjectURL) window.URL.revokeObjectURL(state.productCreateDraft.objectUrl);
        state.productCreateDraft = null;
      }
      if (closingDelivery) {
        state.deliveryDraft = null;
        state.deliveryRealNameAttention = false;
      }
      state.panel = productEditReturnPanel || null;
      renderActive();
      if (closingAddPanel) focusDesktopProductSearch();
      if (closingProductEdit && !productEditReturnPanel) restoreProductEditFocus(closingProductId);
      if (closingProductCreate) focusCatalogCreateTrigger();
      return;
    }
    if (target.matches('[data-context-edit-order-row]')) {
      var editContext = state.rowContextMenu;
      var editOrderItem = editContext && state.products[editContext.itemIndex];
      if (!editOrderItem) return;
      var catalogMatch = PRODUCTS.find(function (item) { return item.id === editOrderItem.id || item.code === editOrderItem.code; });
      state.rowContextMenu = null;
      beginProductEdit(catalogMatch ? catalogMatch.id : '', editContext.itemIndex);
      return;
    }
    if (target.matches('[data-context-delete-order-row]')) {
      var deleteContext = state.rowContextMenu;
      if (!deleteContext) return;
      removeOrderRow(deleteContext.itemIndex, deleteContext.spec);
      state.rowContextMenu = null;
      markDirty(ctx);
      ctx.toast('已删除选中商品行');
      return;
    }
    if (target.matches('[data-edit-catalog-product]')) {
      beginProductEdit(target.dataset.editCatalogProduct);
      return;
    }
    if (target.matches('[data-edit-add-product]') && state.addDraft) {
      state.productEditReturnPanel = 'add';
      beginProductEdit(state.addDraft.product.id);
      return;
    }
    if (target.matches('[data-product-edit-more]')) {
      ctx.toast('更多商品资料编辑入口已保留');
      return;
    }
    if (target.matches('[data-product-create-more]')) {
      ctx.toast('更多商品资料设置入口已保留');
      return;
    }
    if (target.matches('[data-product-create-price-setting]')) {
      ctx.toast('售价设置入口已保留');
      return;
    }
    if (target.matches('[data-trigger-product-create-image]')) {
      var createImageInput = root.querySelector('[data-product-create-image]');
      if (createImageInput) createImageInput.click();
      return;
    }
    if (target.matches('[data-generate-product-code]') && state.productEditDraft) {
      state.productEditDraft.code = 'SP-' + String(Date.now()).slice(-6);
      renderActive();
      ctx.toast('已自动生成货号');
      return;
    }
    if (target.matches('[data-generate-product-create-code]') && state.productCreateDraft) {
      state.productCreateDraft.code = createUniqueProductCode();
      renderActive();
      focusProductCreateControl('[data-generate-product-create-code]');
      ctx.toast('已自动生成货号');
      return;
    }
    if (target.matches('[data-save-product-edit]')) {
      var editDraft = state.productEditDraft;
      var editedProduct = editDraft && allCatalogProducts().find(function (item) { return item.id === editDraft.productId; });
      var editedOrderItem = editDraft && Number.isInteger(editDraft.orderItemIndex) ? state.products[editDraft.orderItemIndex] : null;
      if (!editedProduct && !editedOrderItem) return;
      var nextName = String(editDraft.name || '').trim();
      var nextPrice = Number(editDraft.listPrice);
      var nextCode = String(editDraft.code || '').trim() || (editedProduct ? editedProduct.code : editedOrderItem.code);
      var costRaw = String(editDraft.costPrice || '').trim();
      var weightRaw = String(editDraft.weight || '').trim();
      var inventoryRaw = String(editDraft.inventory || '').trim();
      var nextCost = costRaw === '' ? 0 : Number(costRaw);
      var nextWeight = weightRaw === '' ? 0 : Number(weightRaw);
      var nextInventory = inventoryRaw === '' ? null : Number(inventoryRaw);
      if (!nextName) {
        ctx.toast('请输入产品名');
        return;
      }
      if (!Number.isFinite(nextPrice) || nextPrice < 0) {
        ctx.toast('请输入有效售价');
        return;
      }
      if (!Number.isFinite(nextCost) || nextCost < 0) {
        ctx.toast('请输入有效拿货价');
        return;
      }
      if (!Number.isFinite(nextWeight) || nextWeight < 0) {
        ctx.toast('请输入有效重量');
        return;
      }
      if (nextInventory !== null && (!Number.isFinite(nextInventory) || nextInventory < 0 || !Number.isInteger(nextInventory))) {
        ctx.toast('请输入有效库存');
        return;
      }
      var duplicateCatalogCode = allCatalogProducts().some(function (item) { return item.code === nextCode && (!editedProduct || item.id !== editedProduct.id); });
      var duplicateOrderCode = state.products.some(function (item, index) { return item.code === nextCode && (!editedOrderItem || index !== editDraft.orderItemIndex); });
      if (duplicateCatalogCode || duplicateOrderCode) {
        ctx.toast('货号已存在，请更换货号');
        return;
      }
      var nextSizes = String(editDraft.specs || '').split(/[、,，\s]+/).map(function (item) { return item.trim(); }).filter(Boolean);
      var nextColors = String(editDraft.colors || '').split(/[、,，\s]+/).map(function (item) { return item.trim(); }).filter(Boolean);
      if (editedProduct) {
        editedProduct.name = nextName;
        editedProduct.listPrice = Math.round(nextPrice * 100) / 100;
        editedProduct.costPrice = Math.round(nextCost * 100) / 100;
        editedProduct.code = nextCode;
        if (nextSizes.length && nextColors.length) {
          editedProduct.specs = [];
          nextColors.forEach(function (color) {
            nextSizes.forEach(function (size) { editedProduct.specs.push(color + '/' + size); });
          });
        }
        editedProduct.colors = nextColors;
        editedProduct.weight = nextWeight;
        editedProduct.inventory = nextInventory;
        if (editedProduct.stock != null) editedProduct.stock = nextInventory == null ? editedProduct.stock : nextInventory;
      }
      if (editedOrderItem) {
        editedOrderItem.name = nextName;
        editedOrderItem.code = nextCode;
        editedOrderItem.listPrice = Math.round(nextPrice * 100) / 100;
        if (!editedOrderItem.manualPrice) editedOrderItem.price = customerPrice({ listPrice: editedOrderItem.listPrice });
      }
      var savedProductId = editDraft.productId;
      var returnToAdd = state.productEditReturnPanel === 'add';
      if (returnToAdd && state.addDraft) {
        var validSpecs = {};
        editedProduct.specs.forEach(function (spec) { validSpecs[spec] = Number(state.addDraft.skuQty[spec] || 0); });
        state.addDraft.skuQty = validSpecs;
        if (state.addDraft.priceMode === 'retail') state.addDraft.unitPrice = customerPrice(editedProduct);
        if (state.addDraft.priceMode === 'cost') state.addDraft.unitPrice = productCostPrice(editedProduct);
        state.addDraft.lastDiscountPrice = productLastDiscountPrice(editedProduct);
      }
      state.productEditDraft = null;
      state.productEditReturnPanel = null;
      state.panel = returnToAdd ? 'add' : null;
      renderActive();
      if (!returnToAdd) restoreProductEditFocus(savedProductId);
      ctx.toast('商品已保存');
      return;
    }
    if (target.matches('[data-publish-product-create]')) {
      var createDraft = state.productCreateDraft;
      if (!createDraft) return;
      var createName = String(createDraft.name || '').trim();
      var createPriceRaw = String(createDraft.listPrice || '').trim();
      var createCostRaw = String(createDraft.costPrice || '').trim();
      var createWeightRaw = String(createDraft.weight || '').trim();
      var createInventoryRaw = String(createDraft.inventory || '').trim();
      var createPrice = createPriceRaw === '' ? 0 : Number(createPriceRaw);
      var createCost = createCostRaw === '' ? 0 : Number(createCostRaw);
      var createWeight = createWeightRaw === '' ? 0 : Number(createWeightRaw);
      var createInventory = createInventoryRaw === '' ? null : Number(createInventoryRaw);
      if (!createName) {
        ctx.toast('请输入简称');
        return;
      }
      if (!Number.isFinite(createPrice) || createPrice < 0) {
        ctx.toast('请输入有效售价');
        return;
      }
      if (!Number.isFinite(createCost) || createCost < 0) {
        ctx.toast('请输入有效拿货价');
        return;
      }
      if (!Number.isFinite(createWeight) || createWeight < 0) {
        ctx.toast('请输入有效重量');
        return;
      }
      if (createInventory !== null && (!Number.isFinite(createInventory) || createInventory < 0 || !Number.isInteger(createInventory))) {
        ctx.toast('请输入有效库存');
        return;
      }
      var createSizes = String(createDraft.specs || '').split(/[、,，\s]+/).map(function (item) { return item.trim(); }).filter(Boolean);
      var createColors = String(createDraft.colors || '').split(/[、,，\s]+/).map(function (item) { return item.trim(); }).filter(Boolean);
      if (!createSizes.length) createSizes = ['均码'];
      if (!createColors.length) createColors = ['默认'];
      var createSpecs = [];
      createColors.forEach(function (color) {
        createSizes.forEach(function (size) { createSpecs.push(color + '/' + size); });
      });
      var requestedCode = String(createDraft.code || '').trim();
      if (requestedCode && productCodeExists(requestedCode)) {
        ctx.toast('货号已存在，请更换货号');
        focusProductCreateControl('[data-product-create-field="code"]');
        return;
      }
      var newProduct = {
        id: (createDraft.type === 'temporary' ? 'temp-' : 'p-created-') + Date.now(),
        code: requestedCode || createUniqueProductCode(),
        name: createName,
        category: '其他',
        tags: [],
        source: createDraft.type === 'temporary' ? '临时商品' : '手动创建',
        listPrice: Math.round(createPrice * 100) / 100,
        costPrice: Math.round(createCost * 100) / 100,
        image: createDraft.image || './lib/assets/icons/default-diagram.svg',
        specs: createSpecs,
        colors: createColors,
        weight: createWeight,
        inventory: createInventory
      };
      if (createDraft.type === 'temporary') {
        var temporarySkuQty = {};
        temporarySkuQty[createSpecs[0]] = 1;
        mergeProductIntoOrder(newProduct, temporarySkuQty, 'single', '');
      } else {
        PRODUCTS.unshift(newProduct);
        state.catalogCategory = '全部';
        state.catalogScopeType = 'all';
        state.catalogScopeValue = '';
        state.catalogSidebarFilterOpen = false;
      }
      state.productCreateDraft = null;
      state.panel = null;
      if (createDraft.type === 'temporary') markDirty(ctx);
      else renderActive();
      focusCatalogCreateTrigger();
      ctx.toast(createDraft.type === 'temporary' ? '临时商品已加入开单清单' : '商品已发布');
      return;
    }
    if (target.matches('[data-product-id]')) {
      var selectedProduct = activeCatalogProducts().find(function (item) { return item.id === target.dataset.productId; });
      if (!selectedProduct) return;
      resetDesktopProductSearch();
      if (selectedProduct.specs.length === 1) {
        addSingleSpecProduct(selectedProduct.id, ctx);
      } else {
        startAdd(selectedProduct.id);
      }
      return;
    }
    if (target.matches('[data-customer-id]')) {
      applyCustomer(target.dataset.customerId === 'guest' ? null : CUSTOMERS.find(function (item) { return item.id === target.dataset.customerId; }));
      applyDeliveryPreference(customerDeliveryPreference(state.customer));
      state.panel = null;
      state.customerKeyword = '';
      markDirty(ctx);
      ctx.toast(state.customer ? '已切换客户并带入发货信息' : '已设为散客，使用零售价');
      return;
    }
    if (target.matches('[data-clear-customer]')) {
      applyCustomer(null);
      applyDeliveryPreference(guestDeliveryPreference());
      state.panel = null;
      markDirty(ctx);
      ctx.toast('已移除客户，恢复零售价');
      return;
    }
    if (target.matches('[data-new-customer]')) {
      openNewCustomer(ctx);
      return;
    }
    if (target.matches('[data-invite-customer-qr]')) {
      ctx.toast('已生成客户扫码邀请');
      return;
    }
    if (target.matches('[data-save-desktop-new-customer]')) {
      var customerCreateScope = target.closest('.order-desktop-customer-create');
      if (!createCustomerFromForm(customerCreateScope, ctx)) return;
      ctx.toast('客户已新建并选中');
      return;
    }
    if (target.matches('[data-recharge]')) {
      ctx.toast('充值入口已保留，本期暂不展开');
      return;
    }
    if (target.matches('[data-warehouse-id]')) {
      state.warehouse = WAREHOUSES.find(function (item) { return item.id === target.dataset.warehouseId; }) || WAREHOUSES[0];
      state.panel = null;
      markDirty(ctx);
      ctx.toast('已切换为' + state.warehouse.name);
      return;
    }
    if (target.matches('[data-delivery-id]')) {
      var deliveryDraft = activeDeliveryDraft();
      deliveryDraft.delivery = target.dataset.deliveryId;
      var requiresAddress = deliveryDraft.delivery === 'express' || deliveryDraft.delivery === 'freight';
      if (requiresAddress && !deliveryDraft.address && state.customer && state.customer.lastAddress) {
        deliveryDraft.address = Object.assign({}, state.customer.lastAddress);
      }
      if (deliveryDraft.delivery === 'pickup') {
        if (PICKUP_POINTS[0] && !deliveryDraft.pickupPointId) deliveryDraft.pickupPointId = PICKUP_POINTS[0].id;
        if (!deliveryDraft.pickupContact && state.customer) {
          deliveryDraft.pickupContact = { name: state.customer.contact || state.customer.name || '', phone: state.customer.mobile || '' };
        }
      }
      renderActive();
      return;
    }
    if (target.matches('[data-real-name-mode]')) {
      var realNameDraft = activeDeliveryDraft();
      var nextRealNameMode = target.dataset.realNameMode;
      realNameDraft.realNameInfo = Object.assign({}, realNameDraft.realNameInfo || state.realNameInfo || {}, { mode: nextRealNameMode });
      renderActive();
      return;
    }
    if (target.matches('[data-sender-mode]')) {
      activeDeliveryDraft().senderMode = target.dataset.senderMode;
      renderActive();
      return;
    }
    if (target.matches('[data-history-address], [data-edit-sender], [data-add-pickup-point]')) {
      ctx.toast('该入口已保留，本期暂不展开');
      return;
    }
    if (target.matches('[data-address-region]')) {
      ctx.toast('地区选择入口已保留，本期暂不展开');
      return;
    }
    if (target.matches('[data-pickup-point-id]')) {
      activeDeliveryDraft().pickupPointId = target.dataset.pickupPointId;
      renderActive();
      return;
    }
    if (target.matches('[data-recognize-address]')) {
      var recognizeScope = panelScope(target, root);
      var pasteInput = recognizeScope.querySelector('[data-address-paste]');
      fillRecognizedAddress(recognizeScope, pasteInput ? pasteInput.value : '', ctx);
      return;
    }
    if (target.matches('[data-inline-recognize-address]')) {
      var inlineScope = target.closest('.order-desktop-delivery-inline, .order-mobile-delivery-inline') || root;
      var inlinePasteInput = inlineScope.querySelector('[data-inline-address-paste]');
      applyInlineRecipientText(inlinePasteInput ? inlinePasteInput.value : '', ctx);
      return;
    }
    if (target.matches('[data-inline-recognize-pickup]')) {
      var inlinePickupScope = target.closest('.order-desktop-delivery-inline, .order-mobile-delivery-inline') || root;
      var inlinePickupInput = inlinePickupScope.querySelector('[data-inline-pickup-paste]');
      applyInlinePickupContactText(inlinePickupInput ? inlinePickupInput.value : '', ctx);
      return;
    }
    if (target.matches('[data-save-delivery]')) {
      var deliveryScope = panelScope(target, root);
      var saveDraft = activeDeliveryDraft();
      if (!saveDraft.delivery) {
        ctx.toast('请选择发货方式');
        return;
      }
      if (saveDraft.delivery === 'express' || saveDraft.delivery === 'freight') {
        var name = deliveryScope.querySelector('[data-address-name]')?.value.trim();
        var phone = deliveryScope.querySelector('[data-address-phone]')?.value.trim();
        var detail = deliveryScope.querySelector('[data-address-detail]')?.value.trim();
        var hasAnyRecipientInfo = Boolean(name || phone || detail);
        if (hasAnyRecipientInfo && (!name || !phone || !detail)) {
          ctx.toast('请完整填写收货信息，或清空后保存');
          return;
        }
        saveDraft.address = hasAnyRecipientInfo ? { name: name, phone: phone, detail: detail } : null;
        if (orderRequiresRealName()) {
          var selectedRealNameMode = saveDraft.realNameInfo && saveDraft.realNameInfo.mode === 'group' ? 'group' : 'direct';
          if (selectedRealNameMode === 'group') {
            saveDraft.realNameInfo = { name: '', idCard: '', mode: 'group' };
          } else {
            var realName = deliveryScope.querySelector('[data-real-name]')?.value.trim();
            var idCard = deliveryScope.querySelector('[data-id-card]')?.value.trim().toUpperCase();
            if (!realNameComplete({ name: realName, idCard: idCard })) {
              state.deliveryRealNameAttention = true;
              var realNameBody = deliveryScope.querySelector('[data-real-name]')?.closest('.form-body');
              var idCardBody = deliveryScope.querySelector('[data-id-card]')?.closest('.form-body');
              if (realNameBody) realNameBody.classList.toggle('form-body--error', !realName);
              if (idCardBody) idCardBody.classList.toggle('form-body--error', !realNameIdCardValid(idCard));
              ctx.toast('请填写正确的实名姓名和身份证号');
              focusDeliveryRealName(root);
              return;
            }
            saveDraft.realNameInfo = { name: realName, idCard: idCard, mode: 'direct' };
          }
        }
      }
      if (saveDraft.delivery === 'pickup') {
        var pickupName = deliveryScope.querySelector('[data-pickup-name]')?.value.trim();
        var pickupPhone = deliveryScope.querySelector('[data-pickup-phone]')?.value.trim();
        if (!pickupName || !pickupPhone) {
          ctx.toast('请完整填写提货人姓名和手机号');
          return;
        }
        if (PICKUP_POINTS.length && !currentPickupPoint(saveDraft.pickupPointId)) saveDraft.pickupPointId = PICKUP_POINTS[0].id;
        saveDraft.pickupContact = { name: pickupName, phone: pickupPhone };
      }
      var savesAddressDelivery = saveDraft.delivery === 'express' || saveDraft.delivery === 'freight';
      if (savesAddressDelivery && saveDraft.senderMode === 'proxy') {
        var senderName = deliveryScope.querySelector('[data-sender-name]')?.value.trim();
        var senderPhone = deliveryScope.querySelector('[data-sender-phone]')?.value.trim();
        if (!senderName || !senderPhone) {
          ctx.toast('请完整填写代发人姓名和手机号');
          return;
        }
        saveDraft.senderInfo = { name: senderName, phone: senderPhone };
      }
      state.delivery = saveDraft.delivery;
      state.deliveryRealNameAttention = false;
      if (saveDraft.delivery === 'express' || saveDraft.delivery === 'freight') state.address = saveDraft.address ? Object.assign({}, saveDraft.address) : null;
      if (saveDraft.delivery === 'express' || saveDraft.delivery === 'freight') state.realNameInfo = saveDraft.realNameInfo ? Object.assign({}, saveDraft.realNameInfo) : state.realNameInfo;
      if (savesAddressDelivery) state.senderMode = saveDraft.senderMode || state.senderMode;
      if (savesAddressDelivery) state.senderInfo = saveDraft.senderInfo ? Object.assign({}, saveDraft.senderInfo) : state.senderInfo;
      if (saveDraft.delivery === 'pickup') {
        state.pickupPointId = saveDraft.pickupPointId;
        state.pickupContact = saveDraft.pickupContact ? Object.assign({}, saveDraft.pickupContact) : null;
      }
      rememberCurrentDeliveryPreference();
      state.deliveryDraft = null;
      state.panel = null;
      markDirty(ctx);
      ctx.toast('发货信息已保存');
      return;
    }
    if (target.matches('[data-add-mode]')) {
      var activeNote = panelScope(target, root).querySelector('[data-add-note]');
      if (activeNote) state.addDraft.note = activeNote.value.trim();
      var nextAddMode = target.dataset.addMode;
      if (nextAddMode !== state.addDraft.mode) {
        state.addDraft.mode = nextAddMode;
        state.addDraft.selectedColor = '';
        state.addDraft.selectedSize = '';
        state.addDraft.product.specs.forEach(function (spec) { state.addDraft.skuQty[spec] = 0; });
      }
      rememberAddMode(state.addDraft.mode);
      renderActive();
      return;
    }
    if (target.matches('[data-add-price-mode]') && state.addDraft) {
      state.addDraft.priceMode = target.dataset.addPriceMode;
      state.addDraft.unitPrice = state.addDraft.priceMode === 'cost' ? productCostPrice(state.addDraft.product) : customerPrice(state.addDraft.product);
      state.addDraft.discountOpen = false;
      renderActive();
      return;
    }
    if (target.matches('[data-toggle-cost-price]') && state.addDraft) {
      state.addDraft.costPriceVisible = !state.addDraft.costPriceVisible;
      renderActive();
      return;
    }
    if (target.matches('[data-toggle-add-discount]') && state.addDraft) {
      state.addDraft.discountOpen = !state.addDraft.discountOpen;
      if (state.addDraft.discountOpen && !state.addDraft.discountValue) state.addDraft.discountValue = String(state.addDraft.unitPrice);
      renderActive();
      return;
    }
    if (target.matches('[data-use-last-discount]') && state.addDraft) {
      state.addDraft.priceMode = 'discount';
      state.addDraft.unitPrice = Number(state.addDraft.lastDiscountPrice || 0);
      state.addDraft.discountValue = String(state.addDraft.unitPrice);
      state.addDraft.discountOpen = false;
      state.addDraft.lastDiscountTipVisible = false;
      renderActive();
      return;
    }
    if (target.matches('[data-apply-add-discount]') && state.addDraft) {
      var discountPrice = Number(state.addDraft.discountValue);
      if (!Number.isFinite(discountPrice) || discountPrice < 0) {
        ctx.toast('请输入有效优惠价');
        return;
      }
      state.addDraft.priceMode = 'discount';
      state.addDraft.unitPrice = Math.round(discountPrice * 100) / 100;
      state.addDraft.discountOpen = false;
      renderActive();
      return;
    }
    if (target.matches('[data-add-purchase-history]') && state.addDraft) {
      return;
    }
    if (target.matches('[data-add-color]')) {
      state.addDraft.selectedColor = decodeURIComponent(target.dataset.addColor);
      state.addDraft.selectedSize = '';
      renderActive();
      return;
    }
    if (target.matches('[data-add-size]')) {
      state.addDraft.selectedSize = decodeURIComponent(target.dataset.addSize);
      renderActive();
      return;
    }
    if (target.matches('[data-single-qty-delta]')) {
      var draftNow = state.addDraft;
      var singleSpec = decodeURIComponent(target.dataset.singleSpec || '');
      if (!draftNow.selectedColor || !draftNow.selectedSize) {
        ctx.toast('请先选择颜色规格');
        return;
      }
      if (!singleSpec) {
        ctx.toast('该颜色暂无此规格');
        return;
      }
      var singleStock = specStock(draftNow.product, singleSpec);
      if (Number(target.dataset.singleQtyDelta) > 0) {
        Object.keys(draftNow.skuQty).forEach(function (key) {
          if (key !== singleSpec) draftNow.skuQty[key] = 0;
        });
      }
      draftNow.skuQty[singleSpec] = Math.max(0, Math.min(singleStock, Number(draftNow.skuQty[singleSpec] || 0) + Number(target.dataset.singleQtyDelta)));
      renderActive();
      return;
    }
    if (target.matches('[data-batch-fill]')) {
      var batchFill = Number(target.dataset.batchFill);
      state.addDraft.product.specs.forEach(function (spec) { state.addDraft.skuQty[spec] = specStock(state.addDraft.product, spec) > 0 ? batchFill : 0; });
      renderActive();
      return;
    }
    if (target.matches('[data-batch-copy]')) {
      var lastPattern = storedBatchPattern();
      if (!lastPattern) {
        ctx.toast('暂无上次批量配码记录');
        return;
      }
      state.addDraft.product.specs.forEach(function (spec, index) {
        state.addDraft.skuQty[spec] = Math.min(specStock(state.addDraft.product, spec), Number(lastPattern[index] || 0));
      });
      renderActive();
      return;
    }
    if (target.matches('[data-batch-clear]')) {
      state.addDraft.product.specs.forEach(function (spec) { state.addDraft.skuQty[spec] = 0; });
      renderActive();
      return;
    }
    if (target.matches('[data-batch-row-fill], [data-batch-col-fill]')) {
      var rowColor = target.dataset.batchRowFill ? decodeURIComponent(target.dataset.batchRowFill) : '';
      var columnSize = target.dataset.batchColFill ? decodeURIComponent(target.dataset.batchColFill) : '';
      state.addDraft.product.specs.forEach(function (spec) {
        var pair = splitSpec(spec);
        if ((rowColor && pair.color === rowColor) || (columnSize && pair.size === columnSize)) {
          state.addDraft.skuQty[spec] = specStock(state.addDraft.product, spec) > 0 ? 1 : 0;
        }
      });
      renderActive();
      return;
    }
    if (target.matches('[data-toggle-add-note]')) {
      var noteField = panelScope(target, root).querySelector('[data-add-note]');
      if (noteField) state.addDraft.note = noteField.value.trim();
      state.addDraft.noteOpen = !state.addDraft.noteOpen;
      renderActive();
      if (state.addDraft.noteOpen) activeContext.root.querySelector('[data-add-note]')?.focus({ preventScroll: true });
      return;
    }
    if (target.closest('[data-toggle-order-note]')) {
      state.orderNoteOpen = true;
      renderActive();
      var noteField = activeContext.root.querySelector('[data-order-note-merchant]');
      if (noteField) noteField.focus({ preventScroll: true });
      return;
    }
    if (target.matches('[data-edit-freight]')) {
      state.freightEditOpen = true;
      renderActive();
      var freightField = activeContext.root.querySelector('[data-freight-edit-value]');
      if (freightField) freightField.focus({ preventScroll: true });
      return;
    }
    if (target.matches('[data-freight-edit-cancel]')) {
      state.freightEditOpen = false;
      renderActive();
      return;
    }
    if (target.matches('[data-freight-edit-confirm]')) {
      var freightScope = target.closest('.order-freight-edit-modal');
      var freightInput = freightScope ? freightScope.querySelector('[data-freight-edit-value]') : null;
      state.freight = Math.max(0, Math.round(Number(freightInput ? freightInput.value : state.freight) * 100) / 100 || 0);
      state.freightEditOpen = false;
      markDirty(ctx);
      renderActive();
      ctx.toast('运费已更新');
      return;
    }
    if (target.matches('[data-note-cancel]')) {
      state.orderNoteOpen = false;
      renderActive();
      return;
    }
    if (target.matches('[data-note-confirm]')) {
      var noteScope = target.closest('.order-note-modal');
      var merchantField = noteScope ? noteScope.querySelector('[data-order-note-merchant]') : null;
      var buyerField = noteScope ? noteScope.querySelector('[data-order-note-buyer]') : null;
      if (merchantField) state.orderNoteMerchant = merchantField.value.trim();
      if (buyerField) state.orderNoteBuyer = buyerField.value.trim();
      state.orderNoteOpen = false;
      markDirty(ctx);
      renderActive();
      ctx.toast('整单备注已保存');
      return;
    }
    if (target.matches('[data-confirm-add]')) {
      var draft = state.addDraft;
      var qty = addDraftTotal(draft);
      if (!qty) {
        ctx.toast('请至少选择一件商品');
        return;
      }
      var addScope = panelScope(target, root);
      var noteInput = addScope.querySelector('[data-add-note]');
      draft.note = noteInput ? noteInput.value.trim() : draft.note;
      if (draft.mode === 'batch') rememberBatchPattern(draft);
      mergeProductIntoOrder(draft.product, draft.skuQty, draft.mode, draft.note, { priceMode: draft.priceMode, unitPrice: draft.unitPrice });
      state.panel = null;
      state.addDraft = null;
      state.desktopProductKeyword = '';
      markDirty(ctx);
      focusDesktopProductSearch();
      setTimeout(focusDesktopProductSearch, 500);
      ctx.toast('商品已加入订单');
      return;
    }
    if (target.matches('[data-plus], [data-minus]')) {
      var index = Number(target.dataset.plus != null ? target.dataset.plus : target.dataset.minus);
      var delta = target.dataset.plus != null ? 1 : -1;
      setProductQuantity(index, '', state.products[index].qty + delta);
      markDirty(ctx);
      return;
    }
    if (target.matches('[data-row-qty-delta]')) {
      var quantityIndex = Number(target.dataset.itemIndex);
      var quantitySpec = target.dataset.qtySpec ? decodeURIComponent(target.dataset.qtySpec) : '';
      var currentItem = state.products[quantityIndex];
      var currentQty = quantitySpec && isSkuMode(currentItem.mode) ? Number(currentItem.skuQty[quantitySpec] || 1) : currentItem.qty;
      setProductQuantity(quantityIndex, quantitySpec, currentQty + Number(target.dataset.rowQtyDelta));
      markDirty(ctx);
      return;
    }
    if (target.matches('[data-delete]')) {
      var deleteIndex = Number(target.dataset.delete);
      state.products.splice(deleteIndex, 1);
      state.selectedRow = null;
      markDirty(ctx);
      ctx.toast('商品已删除');
      return;
    }
    if (target.matches('[data-delete-row]')) {
      removeOrderRow(Number(target.dataset.deleteRow), target.dataset.deleteRowSpec ? decodeURIComponent(target.dataset.deleteRowSpec) : '');
      markDirty(ctx);
      ctx.toast('已删除商品行');
      return;
    }
    if (target.matches('[data-delete-selected]')) {
      if (!state.selectedRow) return;
      removeOrderRow(state.selectedRow.itemIndex, state.selectedRow.spec);
      markDirty(ctx);
      ctx.toast('已删除选中商品行');
      return;
    }
    if (target.matches('[data-clear-order]')) {
      state.confirmClearOrder = true;
      renderActive();
      return;
    }
    if (target.matches('[data-clear-cancel]')) {
      state.confirmClearOrder = false;
      renderActive();
      return;
    }
    if (target.matches('[data-clear-confirm]')) {
      state.products = [];
      state.selectedRow = null;
      state.confirmClearOrder = false;
      markDirty(ctx);
      renderActive();
      ctx.toast('已清空整单商品');
      return;
    }
    if (target.matches('[data-edit-price]')) {
      openPanel('price', Number(target.dataset.editPrice));
      return;
    }
    if (target.matches('[data-edit-spu-note]')) {
      openPanel('note', Number(target.dataset.editSpuNote));
      return;
    }
    if (target.matches('[data-save-spu-note]')) {
      var noteItem = state.products[Number(state.panelPayload)];
      var noteScope = panelScope(target, root);
      var noteValue = noteScope.querySelector('[data-spu-note-value]')?.value.trim() || '';
      state.products.forEach(function (item) {
        if (noteItem && item.code === noteItem.code) item.note = noteValue;
      });
      state.panel = null;
      markDirty(ctx);
      ctx.toast(noteValue ? '商品备注已保存' : '商品备注已清空');
      return;
    }
    if (target.matches('[data-save-price]')) {
      var priceScope = panelScope(target, root);
      var price = Number(priceScope.querySelector('[data-price-value]')?.value || 0);
      if (price <= 0) {
        ctx.toast('请输入有效单价');
        return;
      }
      var priceItem = state.products[Number(state.panelPayload)];
      priceItem.price = price;
      priceItem.manualPrice = true;
      state.panel = null;
      markDirty(ctx);
      ctx.toast('单价已修改');
      return;
    }
    if (target.matches('[data-display]')) {
      state.displayMode = target.dataset.display;
      state.selectedRow = null;
      try { window.localStorage.setItem('wego-order-display-mode', state.displayMode); } catch (error) {}
      renderActive();
      return;
    }
    if (target.matches('[data-open-checkout]')) {
      beginPayment(ctx);
      return;
    }
    if (target.matches('[data-start-payment]')) {
      beginPayment(ctx);
      return;
    }
    if (target.matches('[data-checkout]')) {
      beginPayment(ctx);
      return;
    }
    if (target.matches('[data-payment-kind]')) {
      if (target.dataset.paymentKind === 'debt' && !state.customer) {
        ctx.toast('请先选择客户');
        return;
      }
      state.paymentDraft.kind = target.dataset.paymentKind;
      if (state.paymentDraft.kind === 'unpaid') state.paymentDraft.autoDispatch = false;
      state.paymentStatus = 'idle';
      renderActive();
      return;
    }
    if (target.matches('[data-payment-mode]')) {
      state.paymentDraft.mode = target.dataset.paymentMode;
      if (state.paymentDraft.mode === 'combo') {
        PAYMENT_METHODS.forEach(function (method) { state.paymentDraft[method.id] = ''; });
      } else if (state.paymentDraft.method) {
        state.paymentDraft.singleAmount = totals().payable.toFixed(2);
      }
      renderActive();
      return;
    }
    if (target.matches('[data-payment-method]')) {
      if (target.dataset.paymentMethod === 'balance' && !state.customer) {
        ctx.toast('请先选择客户');
        return;
      }
      state.paymentDraft.method = target.dataset.paymentMethod;
      state.paymentDraft.singleAmount = totals().payable.toFixed(2);
      state.paymentDraft.balanceApplied = false;
      renderPaymentPreservingScroll(root);
      return;
    }
    if (target.matches('[data-overpayment-handling]')) {
      if (target.dataset.overpaymentHandling === 'balance' && !state.customer) {
        ctx.toast('请先选择客户');
        return;
      }
      state.paymentDraft.overpaymentHandling = target.dataset.overpaymentHandling;
      state.paymentDraft.balanceApplied = false;
      renderActive();
      return;
    }
    if (target.matches('[data-auto-print-receipt]')) {
      if (state.paymentDraft) { state.paymentDraft.autoPrintReceipt = !state.paymentDraft.autoPrintReceipt; renderPaymentPreservingScroll(root); }
      return;
    }
    if (target.matches('[data-auto-dispatch]')) {
      if (state.paymentDraft && state.paymentDraft.kind !== 'unpaid') { state.paymentDraft.autoDispatch = !state.paymentDraft.autoDispatch; renderPaymentPreservingScroll(root); }
      return;
    }
    if (target.matches('[data-confirm-payment]')) {
      confirmPayment(ctx);
      return;
    }
    if (target.matches('[data-recover-payment]')) {
      state.paymentStatus = 'processing';
      renderActive();
      setTimeout(function () { finishOrder(ctx); }, 600);
      return;
    }
    if (target.matches('[data-clear-search]')) {
      state.catalogKeyword = '';
      renderActive();
      return;
    }
    if (target.matches('[data-clear-header-search]')) {
      resetDesktopProductSearch();
      renderActive();
      var headerSearch = activeContext.root.querySelector('[data-header-catalog-search]');
      if (headerSearch) headerSearch.focus({ preventScroll: true });
      return;
    }
    if (target.matches('[data-submit-header-search]')) {
      if (!applyDesktopSearch(state.desktopProductKeyword, ctx)) ctx.toast('没有找到匹配商品，请检查名称或货号');
      return;
    }
    if (target.matches('[data-clear-customer-search]')) {
      state.customerKeyword = '';
      renderActive();
      var customerInput = activeContext.root.querySelector('[data-customer-search]');
      if (customerInput) customerInput.focus({ preventScroll: true });
    }
  }

  function handleInput(event, root, ctx) {
    var target = event.target;
    if (state.panel === 'delivery' && target.matches('[data-real-name], [data-id-card]')) {
      var inputRealNameDraft = activeDeliveryDraft();
      inputRealNameDraft.realNameInfo = Object.assign({}, inputRealNameDraft.realNameInfo || { mode: 'direct' });
      if (target.matches('[data-real-name]')) inputRealNameDraft.realNameInfo.name = target.value;
      if (target.matches('[data-id-card]')) inputRealNameDraft.realNameInfo.idCard = target.value;
      if (state.deliveryRealNameAttention) {
        var realNameFieldBody = target.closest('.form-body');
        var validRealNameField = target.matches('[data-real-name]')
          ? Boolean(target.value.trim())
          : realNameIdCardValid(target.value);
        if (realNameFieldBody) realNameFieldBody.classList.toggle('form-body--error', !validRealNameField);
        target.toggleAttribute('aria-invalid', !validRealNameField);
      }
      return;
    }
    if (state.panel === 'delivery' && target.matches('[data-address-name], [data-address-phone], [data-address-detail]')) {
      var inputAddressDraft = activeDeliveryDraft();
      inputAddressDraft.address = Object.assign({}, inputAddressDraft.address || {});
      if (target.matches('[data-address-name]')) inputAddressDraft.address.name = target.value;
      if (target.matches('[data-address-phone]')) inputAddressDraft.address.phone = target.value;
      if (target.matches('[data-address-detail]')) inputAddressDraft.address.detail = target.value;
      return;
    }
    if (state.panel === 'delivery' && target.matches('[data-sender-name], [data-sender-phone]')) {
      var inputSenderDraft = activeDeliveryDraft();
      inputSenderDraft.senderInfo = Object.assign({}, inputSenderDraft.senderInfo || {});
      if (target.matches('[data-sender-name]')) inputSenderDraft.senderInfo.name = target.value;
      if (target.matches('[data-sender-phone]')) inputSenderDraft.senderInfo.phone = target.value;
      return;
    }
    if (target.matches('[data-inline-address-paste], [data-inline-pickup-paste]')) {
      var inlineRecognizeButton = target.closest('.order-desktop-delivery-inline, .order-mobile-delivery-inline')?.querySelector('[data-inline-recognize-address], [data-inline-recognize-pickup]');
      if (inlineRecognizeButton) {
        var inlineHasValue = Boolean(String(target.value || '').trim());
        inlineRecognizeButton.disabled = !inlineHasValue;
        inlineRecognizeButton.classList.toggle('btn--disabled', !inlineHasValue);
      }
      return;
    }
    if (target.matches('[data-product-edit-field]') && state.productEditDraft) {
      state.productEditDraft[target.dataset.productEditField] = target.value;
      return;
    }
    if (target.matches('[data-product-create-field]') && state.productCreateDraft) {
      state.productCreateDraft[target.dataset.productCreateField] = target.value;
      if (target.dataset.productCreateField === 'name') {
        var publishCreateButton = root.querySelector('[data-publish-product-create]');
        if (publishCreateButton) publishCreateButton.disabled = !String(target.value || '').trim();
      }
      return;
    }
    if (target.matches('[data-product-create-image]') && state.productCreateDraft) {
      var productImageFile = target.files && target.files[0];
      if (!productImageFile) return;
      if (productImageFile.type && productImageFile.type.indexOf('image/') !== 0) {
        ctx.toast('请选择图片文件');
        target.value = '';
        return;
      }
      if (state.productCreateDraft.objectUrl && window.URL && window.URL.revokeObjectURL) window.URL.revokeObjectURL(state.productCreateDraft.objectUrl);
      var objectUrl = window.URL && window.URL.createObjectURL ? window.URL.createObjectURL(productImageFile) : '';
      state.productCreateDraft.image = objectUrl;
      state.productCreateDraft.objectUrl = objectUrl;
      state.productCreateDraft.imageName = productImageFile.name;
      renderActive();
      focusProductCreateControl('[data-trigger-product-create-image]');
      ctx.toast('已添加商品图片');
      return;
    }
    if (target.matches('[data-header-image-input]')) {
      var imageFile = target.files && target.files[0];
      if (!imageFile) return;
      if (imageFile.type && imageFile.type.indexOf('image/') !== 0) {
        ctx.toast('请选择图片文件');
        return;
      }
      state.imageSearchFileName = imageFile.name;
      ctx.toast('已选择图片：' + imageFile.name + '，正在识别相似商品');
      return;
    }
    if (target.matches('[data-points-custom-input]')) {
      var rawPoints = String(target.value || '').replace(/\D/g, '').slice(0, 7);
      var nextPoints = rawPoints ? Math.min(availablePoints(), Number(rawPoints)) : 0;
      target.value = rawPoints ? String(nextPoints) : '';
      var pointsOptions = root.querySelectorAll('[data-points-mode]');
      pointsOptions.forEach(function (option) {
        var selected = option.dataset.pointsMode === 'custom';
        option.classList.toggle('is-selected', selected);
        option.setAttribute('aria-checked', String(selected));
        var check = option.querySelector('.order-points-option__check');
        if (check) check.hidden = !selected;
      });
      var customBox = root.querySelector('.order-points-custom');
      if (customBox) {
        customBox.classList.add('is-active');
        customBox.hidden = false;
      }
      var deductionNode = root.querySelector('[data-points-deduction]');
      if (deductionNode) deductionNode.textContent = money(pointsDeduction(nextPoints));
      return;
    }
    if (target.matches('[data-row-qty]')) {
      var rawQuantity = target.value.replace(/\D/g, '').slice(0, 7);
      target.value = rawQuantity;
      if (rawQuantity) {
        var directItemIndex = Number(target.dataset.itemIndex);
        setProductQuantity(directItemIndex, target.dataset.qtySpec ? decodeURIComponent(target.dataset.qtySpec) : '', Number(rawQuantity));
        var directItem = state.products[directItemIndex];
        var directProductRow = target.closest('.order-desktop-product-row');
        var directRowTotal = directProductRow?.querySelector('[data-product-total-value]');
        if (directRowTotal) directRowTotal.textContent = money(directItem.price * (directProductRow.classList.contains('order-desktop-product-row--grouped') ? directItem.qty : Number(rawQuantity)));
        var liveTotals = totals();
        refreshDesktopSummary(root, liveTotals);
      }
      if (event.type === 'change') {
        if (!rawQuantity) setProductQuantity(Number(target.dataset.itemIndex), target.dataset.qtySpec ? decodeURIComponent(target.dataset.qtySpec) : '', 1);
        markDirty(ctx);
      }
      return;
    }
    if (target.matches('[data-catalog-search]')) {
      state.catalogKeyword = target.value;
      renderActive();
      var next = activeContext.root.querySelector('[data-catalog-search]');
      if (next) {
        next.focus();
        next.setSelectionRange(next.value.length, next.value.length);
      }
      return;
    }
    if (target.matches('[data-header-catalog-search]')) {
      state.desktopProductKeyword = target.value;
      var headerCodeMatches = desktopCodeMatches(target.value);
      var wasCatalogSearchActive = state.desktopCatalogSearchActive;
      state.desktopSearchResultsOpen = state.catalogCollapsed && headerCodeMatches.length >= 2;
      state.desktopCatalogSearchActive = !state.catalogCollapsed && headerCodeMatches.length >= 2;
      var headerClear = target.parentElement.querySelector('.input-clear');
      if (headerClear) headerClear.style.display = target.value ? 'block' : 'none';
      var headerSubmit = activeContext.root.querySelector('[data-submit-header-search]');
      if (headerSubmit) headerSubmit.hidden = !target.value.trim();
      if (state.catalogCollapsed || state.desktopCatalogSearchActive || wasCatalogSearchActive || !target.value.trim()) {
        renderActive();
        focusDesktopProductSearch();
      }
      return;
    }
    if (target.matches('[data-customer-search]')) {
      state.customerKeyword = target.value;
      renderActive();
      var nextCustomerSearch = activeContext.root.querySelector('[data-customer-search]');
      if (nextCustomerSearch) {
        nextCustomerSearch.focus({ preventScroll: true });
        nextCustomerSearch.setSelectionRange(nextCustomerSearch.value.length, nextCustomerSearch.value.length);
      }
      return;
    }
    if (target.matches('[data-discount]')) {
      state.discount = Math.min(100, Math.max(0, Number(target.value || 0)));
      if (event.type === 'change') markDirty(ctx);
      return;
    }
    if (target.matches('[data-freight]')) {
      state.freight = Math.max(0, Number(target.value || 0));
      if (event.type === 'change') markDirty(ctx);
      return;
    }
    if (target.matches('[data-single-qty-input]') && state.addDraft) {
      var singleDraft = state.addDraft;
      var singleRaw = String(target.value || '').replace(/[^\d-]/g, '');
      var singleNegative = singleRaw.charAt(0) === '-' ? '-' : '';
      var singleDigits = singleRaw.replace(/-/g, '').slice(0, 4);
      var singleParsed = (singleNegative || singleDigits) ? Number(singleNegative + singleDigits) : 0;
      if (Number.isNaN(singleParsed)) singleParsed = 0;
      var singleMissing = !singleDraft.selectedColor || !singleDraft.selectedSize;
      var singleInputSpec = singleMissing ? '' : specKey(singleDraft.product, singleDraft.selectedColor, singleDraft.selectedSize);
      if (singleMissing || !singleInputSpec) {
        if (event.type === 'input') ctx.toast(singleMissing ? '请先选择颜色规格' : '该颜色暂无此规格');
        target.value = 0;
        if (event.type === 'change') renderActive();
        return;
      }
      if (singleNegative && !singleDigits && event.type === 'input') {
        target.value = '-';
        return;
      }
      var singleInputStock = specStock(singleDraft.product, singleInputSpec);
      singleParsed = Math.max(-9999, Math.min(singleInputStock, singleParsed));
      target.value = singleParsed;
      Object.keys(singleDraft.skuQty).forEach(function (key) {
        if (key !== singleInputSpec) singleDraft.skuQty[key] = 0;
      });
      singleDraft.skuQty[singleInputSpec] = singleParsed;
      updateAddDraftTotals(root);
      if (event.type === 'change') {
        var singlePickerNode = target.closest('.order-single-picker');
        if (singlePickerNode) {
          var singleMinusNode = singlePickerNode.querySelector('[data-single-qty-delta="-1"]');
          var singlePlusNode = singlePickerNode.querySelector('[data-single-qty-delta="1"]');
          if (singleMinusNode) singleMinusNode.disabled = singleParsed <= 0;
          if (singlePlusNode) singlePlusNode.disabled = singleParsed >= singleInputStock;
        }
      }
      return;
    }
    if (target.matches('[data-batch-qty]') && state.addDraft) {
      var batchSpec = decodeURIComponent(target.dataset.batchQty);
      var batchStock = specStock(state.addDraft.product, batchSpec);
      var batchRaw = String(target.value || '').replace(/[^\d-]/g, '');
      var batchNegative = batchRaw.charAt(0) === '-' ? '-' : '';
      var batchDigits = batchRaw.replace(/-/g, '').slice(0, 4);
      var batchQuantity = Number((batchNegative + batchDigits) || 0);
      batchQuantity = Math.max(-9999, Math.min(batchStock, batchQuantity));
      target.value = batchQuantity;
      state.addDraft.skuQty[batchSpec] = batchQuantity;
      updateAddDraftTotals(root);
      return;
    }
    if (target.matches('[data-add-note]') && state.addDraft) {
      state.addDraft.note = target.value;
      return;
    }
    if (target.matches('[data-order-note-merchant]')) {
      state.orderNoteMerchant = target.value;
      return;
    }
    if (target.matches('[data-order-note-buyer]')) {
      state.orderNoteBuyer = target.value;
      return;
    }
    if (target.matches('[data-add-discount-value]') && state.addDraft) {
      state.addDraft.discountValue = String(target.value || '').replace(/[^\d.]/g, '');
      target.value = state.addDraft.discountValue;
      return;
    }
    if (target.matches('[data-split]') && state.paymentDraft) {
      state.paymentDraft[target.dataset.split] = target.value.replace(/[^\d.]/g, '');
      state.paymentDraft.balanceApplied = false;
      if (event.type === 'change') renderPaymentPreservingScroll(root);
      return;
    }
    if (target.matches('[data-single-payment-amount]') && state.paymentDraft) {
      state.paymentDraft.singleAmount = target.value.replace(/[^\d.]/g, '');
      target.value = state.paymentDraft.singleAmount;
      state.paymentDraft.balanceApplied = false;
      if (event.type === 'change') renderPaymentPreservingScroll(root);
      return;
    }
    if (target.matches('[data-payment-note]') && state.paymentDraft) {
      state.paymentDraft.note = target.value;
      return;
    }
    if (target.matches('[data-payment-outcome]') && state.paymentDraft) {
      state.paymentDraft.outcome = target.value;
    }
  }

  function initWorkbench(root, ctx) {
    activeContext = { root: root, navigate: ctx.navigate, back: ctx.back, toast: ctx.toast, dialog: ctx.dialog };
    document.body.dataset.orderLayout = isDesktopWorkbench() ? 'landscape' : 'mobile';
    renderWorkbench(root, ctx);
    root.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      if (beginCatalogResize(event, root)) return;
      var comboLabel = event.target.closest('[data-combo-fill]');
      if (comboLabel && state.paymentDraft && state.paymentDraft.mode === 'combo') {
        var comboKey = comboLabel.dataset.comboFill;
        if (event.target.closest('input') && Number(state.paymentDraft[comboKey] || 0) > 0) return;
        event.preventDefault();
        activateComboChannel(ctx, comboKey);
        return;
      }
      if (event.target.closest('button, input, textarea, select, [data-clickable], [data-counter]')) return;
      var rowEl = event.target.closest('[data-row-select]');
      if (!rowEl) return;
      toggleRowSelection(Number(rowEl.dataset.rowSelect), rowEl.dataset.rowSpec ? decodeURIComponent(rowEl.dataset.rowSpec) : '');
    });
    root.addEventListener('pointermove', function (event) {
      updateCatalogResize(event, root);
    });
    root.addEventListener('pointerup', function (event) {
      endCatalogResize(event, root);
    });
    root.addEventListener('pointercancel', function (event) {
      endCatalogResize(event, root);
    });
    root.addEventListener('contextmenu', function (event) {
      if (!isDesktopWorkbench()) return;
      var row = event.target.closest('[data-row-select]');
      if (!row) return;
      event.preventDefault();
      var bounds = root.getBoundingClientRect();
      var menuWidth = 144;
      var menuHeight = 96;
      var x = Math.max(8, Math.min(event.clientX - bounds.left, bounds.width - menuWidth - 8));
      var y = Math.max(8, Math.min(event.clientY - bounds.top, bounds.height - menuHeight - 8));
      openOrderRowContextMenu(Number(row.dataset.rowSelect), row.dataset.rowSpec ? decodeURIComponent(row.dataset.rowSpec) : '', x, y);
    });
    root.addEventListener('click', function (event) {
      var shouldCloseCustomerPopover = isDesktopWorkbench()
        && state.panel === 'customer'
        && !event.target.closest('.order-desktop-customer-anchor');
      var shouldCloseFreightPopover = isDesktopWorkbench()
        && state.panel === 'quick'
        && state.quickOp === 'freight'
        && !event.target.closest('.order-quick-op-anchor--freight');
      var shouldClosePointsPopover = isDesktopWorkbench()
        && state.panel === 'quick'
        && state.quickOp === 'points'
        && !event.target.closest('.order-quick-op-anchor--points');
      var shouldCloseCatalogFilter = isDesktopWorkbench()
        && state.catalogFilterOpen
        && !event.target.closest('.order-desktop-search-filter');
      var shouldCloseDesktopSearchResults = isDesktopWorkbench()
        && state.desktopSearchResultsOpen
        && !event.target.closest('.order-desktop-product-search');
      var shouldCloseSidebarCatalogFilter = isDesktopWorkbench()
        && state.catalogSidebarFilterOpen
        && !event.target.closest('.order-catalog-filter-anchor');
      var shouldCloseGuidePicker = isDesktopWorkbench()
        && state.guidePickerOpen
        && !event.target.closest('.order-desktop-guide-anchor');
      var shouldCloseProductCreateMenu = isDesktopWorkbench()
        && state.catalogCreateMenuOpen
        && !event.target.closest('.order-catalog-create-anchor');
      var shouldCloseRowContextMenu = isDesktopWorkbench()
        && state.rowContextMenu
        && !event.target.closest('.order-row-context-menu');
      handleClick(event, root, ctx);
      if (shouldCloseCustomerPopover && state.panel === 'customer') {
        closeDesktopCustomerPopover();
      } else if (shouldCloseFreightPopover && state.panel === 'quick' && state.quickOp === 'freight') {
        state.panel = null;
        renderActive();
      } else if (shouldClosePointsPopover && state.panel === 'quick' && state.quickOp === 'points') {
        state.panel = null;
        renderActive();
      } else if (shouldCloseCatalogFilter && state.catalogFilterOpen) {
        state.catalogFilterOpen = false;
        renderActive();
      } else if (shouldCloseDesktopSearchResults && state.desktopSearchResultsOpen) {
        resetDesktopProductSearch();
        renderActive();
      } else if (shouldCloseSidebarCatalogFilter && state.catalogSidebarFilterOpen) {
        state.catalogSidebarFilterOpen = false;
        renderActive();
      } else if (shouldCloseGuidePicker && state.guidePickerOpen) {
        state.guidePickerOpen = false;
        renderActive();
      } else if (shouldCloseProductCreateMenu && state.catalogCreateMenuOpen) {
        state.catalogCreateMenuOpen = false;
        renderActive();
      } else if (shouldCloseRowContextMenu && state.rowContextMenu) {
        state.rowContextMenu = null;
        renderActive();
      }
    });
    root.addEventListener('input', function (event) { handleInput(event, root, ctx); });
    root.addEventListener('change', function (event) { handleInput(event, root, ctx); });
    root.addEventListener('paste', function (event) {
      var inlinePasteTarget = event.target.closest && event.target.closest('[data-inline-address-paste], [data-inline-pickup-paste]');
      if (inlinePasteTarget) {
        var inlinePastedText = event.clipboardData && event.clipboardData.getData('text');
        if (!inlinePastedText) return;
        event.preventDefault();
        inlinePasteTarget.value = inlinePastedText;
        if (inlinePasteTarget.matches('[data-inline-pickup-paste]')) applyInlinePickupContactText(inlinePastedText, ctx);
        else applyInlineRecipientText(inlinePastedText, ctx);
        return;
      }
      var pasteTarget = event.target.closest && event.target.closest('[data-address-paste]');
      if (!pasteTarget) return;
      var pastedText = event.clipboardData && event.clipboardData.getData('text');
      if (!pastedText) return;
      event.preventDefault();
      pasteTarget.value = pastedText;
      fillRecognizedAddress(panelScope(pasteTarget, root), pastedText, ctx);
    });
    root.addEventListener('focusin', function (event) {
      var target = event.target;
      if (!target.matches('[data-split]')) return;
      if (!state.paymentDraft || state.paymentDraft.mode !== 'combo') return;
      var key = target.dataset.split;
      if (Number(state.paymentDraft[key] || 0) > 0) return;
      if (comboFilledMethods(key).length >= 2) {
        target.blur();
      }
    });
    root.addEventListener('blur', function (event) {
      if (event.target.matches('[data-add-note]') && state.addDraft) {
        state.addDraft.note = event.target.value.trim();
        state.addDraft.noteOpen = false;
        renderActive();
        return;
      }
      if (!event.target.matches('[data-row-qty]')) return;
      if (!event.target.value) setProductQuantity(Number(event.target.dataset.itemIndex), event.target.dataset.qtySpec ? decodeURIComponent(event.target.dataset.qtySpec) : '', 1);
      markDirty(ctx);
    }, true);
    root.addEventListener('keydown', function (event) {
      var rowContextMenuItem = event.target.closest && event.target.closest('.order-row-context-menu [role="menuitem"]');
      if (rowContextMenuItem && ['ArrowDown', 'ArrowUp', 'Home', 'End'].indexOf(event.key) >= 0) {
        event.preventDefault();
        var rowContextMenuItems = Array.from(root.querySelectorAll('.order-row-context-menu [role="menuitem"]'));
        var currentRowContextIndex = rowContextMenuItems.indexOf(rowContextMenuItem);
        var nextRowContextIndex = event.key === 'Home'
          ? 0
          : (event.key === 'End'
            ? rowContextMenuItems.length - 1
            : (currentRowContextIndex + (event.key === 'ArrowDown' ? 1 : -1) + rowContextMenuItems.length) % rowContextMenuItems.length);
        rowContextMenuItems[nextRowContextIndex].focus();
        return;
      }
      if (event.key === 'Escape' && state.rowContextMenu) {
        state.rowContextMenu = null;
        renderActive();
        return;
      }
      var createMenuItem = event.target.closest && event.target.closest('.order-catalog-create-menu [role="menuitem"]');
      if (createMenuItem && ['ArrowDown', 'ArrowUp', 'Home', 'End'].indexOf(event.key) >= 0) {
        event.preventDefault();
        var createMenuItems = Array.from(root.querySelectorAll('.order-catalog-create-menu [role="menuitem"]'));
        var currentCreateMenuIndex = createMenuItems.indexOf(createMenuItem);
        var nextCreateMenuIndex = event.key === 'Home'
          ? 0
          : (event.key === 'End'
            ? createMenuItems.length - 1
            : (currentCreateMenuIndex + (event.key === 'ArrowDown' ? 1 : -1) + createMenuItems.length) % createMenuItems.length);
        createMenuItems[nextCreateMenuIndex].focus();
        return;
      }
      if (event.key === 'Tab' && (state.panel === 'product-edit' || state.panel === 'product-create' || state.panel === 'product-temp-create')) {
        var editDialog = root.querySelector('.order-product-edit-modal__panel');
        var focusable = editDialog ? Array.from(editDialog.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(function (element) {
          return !element.hidden && element.offsetParent !== null;
        }) : [];
        if (focusable.length) {
          var firstFocusable = focusable[0];
          var lastFocusable = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
          } else if (!event.shiftKey && document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
        }
      }
      if (event.key === 'Escape' && state.panel === 'product-edit') {
        var escapedProductId = state.productEditDraft ? state.productEditDraft.productId : '';
        var escapedReturnPanel = state.productEditReturnPanel;
        state.productEditDraft = null;
        state.productEditReturnPanel = null;
        state.panel = escapedReturnPanel || null;
        renderActive();
        if (!escapedReturnPanel) restoreProductEditFocus(escapedProductId);
        return;
      }
      if (event.key === 'Escape' && (state.panel === 'product-create' || state.panel === 'product-temp-create')) {
        if (state.productCreateDraft && state.productCreateDraft.objectUrl && window.URL && window.URL.revokeObjectURL) window.URL.revokeObjectURL(state.productCreateDraft.objectUrl);
        state.productCreateDraft = null;
        state.panel = null;
        renderActive();
        focusCatalogCreateTrigger();
        return;
      }
      if (event.key === 'Escape' && state.catalogCreateMenuOpen) {
        state.catalogCreateMenuOpen = false;
        renderActive();
        focusCatalogCreateTrigger();
        return;
      }
      if ((event.target.matches('[data-row-qty]') || event.target.matches('[data-single-qty-input]')) && event.key === 'Enter') event.target.blur();
      if (event.target.matches('[data-toggle-order-note]') && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); event.target.click(); }
      if (event.target.matches('[data-header-catalog-search]') && event.key === 'Enter') {
        event.preventDefault();
        if (!applyDesktopSearch(event.target.value, ctx)) ctx.toast('没有找到匹配商品，请检查名称或货号');
      }
    });
  }

  function successTemplate() {
    var t = totals();
    var isUnpaid = state.paymentSummary === '未收款';
    var isDebt = state.paymentSummary === '记欠款';
    var resultTitle = isUnpaid ? '订单已生成，待收款' : (isDebt ? '订单已生成，已记欠款' : '收款成功，订单已生成');
    var paymentState = isUnpaid ? '未收款' : (isDebt ? '已记欠款' : '已收款');
    return ''
      + '<section class="order-success-v2" data-bg="page">'
      +   '<nav class="navbar" data-component-slug="navbar"><div class="navbar__body"><div class="navbar__left"></div><div class="navbar__center"><span class="navbar__title">开单完成</span></div><div class="navbar__right"></div></div></nav>'
      +   '<main class="order-success-v2__body">'
      +     '<div class="order-success-v2__icon" aria-hidden="true">✓</div>'
      +     '<h1>' + resultTitle + '</h1>'
      +     '<p>' + escapeHtml(state.paymentSummary || '已收款') + ' · ' + money(t.payable) + '</p>'
      +     '<dl><div><dt>订单号</dt><dd>' + escapeHtml(state.orderNo) + '</dd></div><div><dt>客户</dt><dd>' + escapeHtml(state.customer ? state.customer.name : '散客') + '</dd></div><div><dt>仓库</dt><dd>' + escapeHtml(state.warehouse.name) + '</dd></div><div><dt>商品</dt><dd>' + t.styles + '款 ' + t.pieces + '件</dd></div><div><dt>收款状态</dt><dd>' + paymentState + '</dd></div></dl>'
      +     '<div class="order-success-v2__actions">' + button('继续开单', 'strong', 'lg', 'data-new-order') + button('查看订单', 'weak', 'lg', 'data-view-order') + '</div>'
      +     '<small>配货、发货等后续流程不在本期原型范围内</small>'
      +   '</main>'
      + '</section>';
  }

  function resetOrder() {
    applyCustomer(null);
    state.warehouse = WAREHOUSES[0];
    state.products = [];
    state.realNameInfo = null;
    applyDeliveryPreference(guestDeliveryPreference());
    state.orderNoteMerchant = '';
    state.orderNoteBuyer = '';
    state.orderNoteOpen = false;
    state.freightEditOpen = false;
    state.selectedRow = null;
    state.discount = 100;
    state.freight = 0;
    state.rounding = 0;
    state.orderNo = '';
    state.paymentStatus = 'idle';
    state.paymentDraft = null;
    state.dailyTotalRecorded = false;
    state.saveStatus = '新订单';
  }

  window.WegoApp.registerScene({
    routeId: 'workspace-order-create',
    title: '开销售单',
    presentation: { type: 'push', transition: 'slide-left', coversTabBar: true },
    template: `<div class="order-v2-mount" data-surface-id="workspace-order-create" data-route-id="workspace-order-create" data-layout-mode="composed"><main class="migration-scroll-root"></main></div>`,
    init: function (ctx) {
      initWorkbench(ctx.root.querySelector('.order-v2-mount') || ctx.root, ctx);
    }
  });

  window.WegoApp.registerScene.call(window.WegoApp, {
    routeId: 'workspace-order-success',
    title: '开单完成',
    presentation: { type: 'full-screen-modal', transition: 'slide-up-enter, slide-down-exit', coversTabBar: true },
    template: '<div class="order-success-v2-mount" data-surface-id="workspace-order-success" data-route-id="workspace-order-success" data-layout-mode="composed"></div>',
    init: function (ctx) {
      var successRoot = ctx.root.querySelector('.order-success-v2-mount') || ctx.root;
      successRoot.innerHTML = successTemplate();
      successRoot.querySelector('[data-new-order]')?.addEventListener('click', function () {
        resetOrder();
        ctx.back();
        setTimeout(renderActive, 0);
      });
      successRoot.querySelector('[data-view-order]')?.addEventListener('click', function () {
        ctx.toast('订单详情入口已保留，本期不展开');
      });
    }
  });
})();
