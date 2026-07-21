/* wego-design-contract:
{
  "surface_id": "album-product-feed",
  "route_id": "album-product-feed",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "host-tab",
    "transition": "none",
    "dismissAction": "tab-switch",
    "overlayLevel": "inline",
    "coversTabBar": false,
    "source": "library-consumption.json#/appRuntime/presentationTypes"
  },
  "prompt_contract": {
    "design_system_version": 418,
    "token_bindings": [
      { "selector": ".album-feed", "content_role": "页面边距", "css_property": "padding-inline", "token": "var(--layout-page-margin-m0)" },
      { "selector": ".album-feed", "content_role": "页面顶部安全区", "css_property": "padding-top", "token": "var(--safe-area-top)" },
      { "selector": ".album-feed", "content_role": "页面背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".album-feed", "content_role": "页面文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".album-feed", "content_role": "页面字体", "css_property": "font-family", "token": "var(--body-md-font-family)" },
      { "selector": ".album-feed__scroll", "content_role": "内容节奏", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".album-feed__scroll", "content_role": "内容底部留白", "css_property": "padding-bottom", "token": "var(--spacer-24)" },
      { "selector": ".album-feed__header", "content_role": "搜索区纵向留白", "css_property": "padding-block", "token": "var(--spacer-8)" },
      { "selector": ".album-feed__header", "content_role": "搜索区横向留白", "css_property": "padding-inline", "token": "var(--spacer-16)" },
      { "selector": ".album-feed__header", "content_role": "搜索区背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".album-feed__friends", "content_role": "好友入口区纵向留白", "css_property": "padding-block", "token": "var(--spacer-12)" },
      { "selector": ".album-feed__friends", "content_role": "好友入口区背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".album-feed__friends-scroll", "content_role": "好友入口横向节奏", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".album-feed__friends-scroll", "content_role": "好友入口横向留白", "css_property": "padding-inline", "token": "var(--spacer-16)" },
      { "selector": ".album-feed__friend-chip", "content_role": "好友头像与名称节奏", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".album-feed__friend-name", "content_role": "好友昵称颜色", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".album-feed__friend-name", "content_role": "好友昵称字号", "css_property": "font-size", "token": "var(--body-xs-font-size)" },
      { "selector": ".album-feed__friend-name", "content_role": "好友昵称行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".album-feed__filter-bar", "content_role": "过滤栏节奏", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".album-feed__filter-bar", "content_role": "过滤栏纵向留白", "css_property": "padding-block", "token": "var(--spacer-12)" },
      { "selector": ".album-feed__filter-bar", "content_role": "过滤栏横向留白", "css_property": "padding-inline", "token": "var(--spacer-16)" },
      { "selector": ".album-feed__filter-bar", "content_role": "过滤栏背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".album-feed__filter-text", "content_role": "过滤文案颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".album-feed__filter-text", "content_role": "过滤文案字号", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".album-feed__filter-text", "content_role": "过滤文案行高", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".album-feed__list", "content_role": "动态列表节奏", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".album-feed__card", "content_role": "动态卡片节奏", "css_property": "gap", "token": "var(--spacer-12)" },
      { "selector": ".album-feed__card", "content_role": "动态卡片留白", "css_property": "padding", "token": "var(--spacer-16)" },
      { "selector": ".album-feed__card", "content_role": "动态卡片背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".album-feed__author", "content_role": "作者行节奏", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".album-feed__author-info", "content_role": "作者信息节奏", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".album-feed__author-name", "content_role": "作者名称颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".album-feed__author-name", "content_role": "作者名称字号", "css_property": "font-size", "token": "var(--body-md-strong-font-size)" },
      { "selector": ".album-feed__author-name", "content_role": "作者名称字重", "css_property": "font-weight", "token": "var(--body-md-strong-font-weight)" },
      { "selector": ".album-feed__author-name", "content_role": "作者名称行高", "css_property": "line-height", "token": "var(--body-md-strong-line-height)" },
      { "selector": ".album-feed__time", "content_role": "发布时间颜色", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".album-feed__time", "content_role": "发布时间字号", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".album-feed__time", "content_role": "发布时间行高", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".album-feed__copy", "content_role": "动态正文颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".album-feed__copy", "content_role": "动态正文字号", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".album-feed__copy", "content_role": "动态正文行高", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".album-feed__media", "content_role": "图片网格节奏", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".album-feed__product", "content_role": "商品卡片上间距", "css_property": "margin-top", "token": "var(--spacer-12)" },
      { "selector": ".album-feed__product-title", "content_role": "商品名称颜色", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".album-feed__product-title", "content_role": "商品名称字号", "css_property": "font-size", "token": "var(--body-md-strong-font-size)" },
      { "selector": ".album-feed__product-title", "content_role": "商品名称字重", "css_property": "font-weight", "token": "var(--body-md-strong-font-weight)" },
      { "selector": ".album-feed__product-title", "content_role": "商品名称行高", "css_property": "line-height", "token": "var(--body-md-strong-line-height)" },
      { "selector": ".album-feed__product-meta", "content_role": "商品说明颜色", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".album-feed__product-meta", "content_role": "商品说明字号", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".album-feed__product-meta", "content_role": "商品说明行高", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".album-feed__product-price", "content_role": "商品价格颜色", "css_property": "color", "token": "var(--text-promotion)" },
      { "selector": ".album-feed__product-price", "content_role": "商品价格字号", "css_property": "font-size", "token": "var(--body-lg-font-size)" },
      { "selector": ".album-feed__product-price", "content_role": "商品价格字重", "css_property": "font-weight", "token": "var(--font-weight-semibold)" },
      { "selector": ".album-feed__product-price", "content_role": "商品价格行高", "css_property": "line-height", "token": "var(--body-lg-line-height)" },
      { "selector": ".album-feed__actions", "content_role": "操作区节奏", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".album-feed__actions", "content_role": "操作区上间距", "css_property": "margin-top", "token": "var(--spacer-12)" },
      { "selector": ".album-feed__empty", "content_role": "空状态间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".album-feed__empty", "content_role": "空状态留白", "css_property": "padding", "token": "var(--spacer-24)" },
      { "selector": ".album-feed__empty-icon", "content_role": "空状态图标字号", "css_property": "font-size", "token": "var(--size-48)" },
      { "selector": ".album-feed__empty-icon", "content_role": "空状态图标颜色", "css_property": "color", "token": "var(--text-disabled)" },
      { "selector": ".album-feed__empty-icon", "content_role": "空状态图标行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".album-feed__empty-text", "content_role": "空状态文字颜色", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".album-feed__empty-text", "content_role": "空状态文字字号", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".album-feed__empty-text", "content_role": "空状态文字行高", "css_property": "line-height", "token": "var(--body-md-line-height)" }
    ],
    "component_bindings": [
      { "binding_id": "feed-search", "slug": "search", "reason": "顶部固定搜索入口，支持按好友、商品、动态文案实时过滤", "variant_dimensions": { "size": "md", "surface": "white", "mode": "text", "state": "empty", "hostPattern": "inline", "internalActions": "clear" } },
      { "binding_id": "feed-tabs", "slug": "tabs", "reason": "顶部内容分类标签，切换全部、好友上新、图文动态", "variant_dimensions": { "size": "standard", "layout": "divide", "icon": "none", "state": "default" } },
      { "binding_id": "feed-clear-filter-action", "slug": "button", "reason": "清除好友过滤", "variant_dimensions": { "emphasis": "weak", "size": "sm", "iconMode": "text-only", "state": "default" } },
      { "binding_id": "feed-more-action", "slug": "button", "reason": "动态卡片更多操作入口，打开底部 actionsheet 展示分享/复制链接/收藏/举报", "variant_dimensions": { "emphasis": "weak", "size": "sm", "iconMode": "text-only", "state": "default" } },
      { "binding_id": "feed-more-sheet", "slug": "actionsheet", "reason": "动态卡片更多操作底部面板，通过 ctx.openSheet 消费；渲染完整 .actionsheet 根节点 + .actionsheet__panel 及子内容，关闭行为覆盖 cancel 与 mask", "variant_dimensions": { "mode": "action", "header": "none", "item": "text", "state": "open" } }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "页面首要任务是连续浏览商品动态，采用通栏卡片减少阅读中断；顶部搜索、横向好友入口与标签栏帮助用户快速定位内容。",
      "page_edge_mode": "M0",
      "mutable_regions": [".album-feed__scroll", ".album-feed__card", ".album-feed__media", ".album-feed__product"]
    },
    "interaction_contract": [
      { "dom_id": "search-input", "target": "state:searching" },
      { "dom_id": "search-clear", "target": "state:feed-ready" },
      { "dom_id": "tab-all", "target": "state:feed-ready" },
      { "dom_id": "tab-new", "target": "state:feed-new" },
      { "dom_id": "tab-photo", "target": "state:feed-photo" },
      { "dom_id": "clear-filter", "target": "state:feed-ready" },
      { "dom_id": "more-{post_id}", "target": "overlay:sheet" }
    ],
    "state_contract": [
      { "state_id": "feed-ready", "initial": true, "trigger": "进入动态主 tab 或切换到全部标签/清除搜索过滤", "visible_result": "展示全部动态、顶部搜索、横向好友入口与标签栏", "fallback": "保留当前可浏览的动态内容", "persistence": "memory" },
      { "state_id": "searching", "initial": false, "trigger": "在搜索框输入关键词", "visible_result": "实时过滤好友、商品与动态文案，隐藏好友入口与标签栏", "fallback": "清空关键词回到 feed-ready", "persistence": "memory" },
      { "state_id": "feed-new", "initial": false, "trigger": "点击好友上新标签", "visible_result": "只展示好友上新类型动态", "fallback": "切换到全部标签", "persistence": "memory" },
      { "state_id": "feed-photo", "initial": false, "trigger": "点击图文动态标签", "visible_result": "只展示图文动态类型", "fallback": "切换到全部标签", "persistence": "memory" },
      { "state_id": "friend-filter", "initial": false, "trigger": "点击好友快捷入口", "visible_result": "只展示所选好友的动态", "fallback": "清除过滤回到 feed-ready", "persistence": "memory" }
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-20T12:00:00.000Z",
    "checks": { "horizontal_overflow": true, "overlap": true, "clipping": true, "action_legibility": true, "primary_focus": true, "state_feedback": true }
  }
}
*/

/* 微购动态（相册动态重做）场景 */

/* ── 数据与常量 ── */
var FEED_TAG_ALL = 'all';
var FEED_TAG_NEW = 'new';
var FEED_TAG_PHOTO = 'photo';

var FEED_PRODUCT_NAMES = [
  '云感垂坠针织短袖 · 夏日通勤基础款',
  '复古高腰直筒牛仔裤 · 显瘦显高',
  '法式温柔碎花连衣裙 · 度假通勤两穿',
  '透气速干运动套装 · 晨跑瑜伽必备',
  '纯棉基础款白 T · 三件装更划算',
  '轻熟风西装外套 · 面试通勤皆可',
  '软糯羊毛开衫 · 空调房护肩',
  '高腰 A 字半身裙 · 梨形身材友好',
  '复古英伦风小皮鞋 · 百搭耐穿',
  '极简通勤托特包 · 大容量轻便',
  '防晒冰丝袖套 · 夏日出行必备',
  '舒适无痕内衣 · 裸感贴身',
  '儿童纯棉家居服 · 亲肤透气',
  '男士商务休闲裤 · 免烫易打理',
  '情侣款潮牌卫衣 · oversize 版型'
];

var FEED_COPY_TEMPLATES = [
  '今日上新，面料柔软、颜色很衬夏天，推荐给大家～',
  '这组单品最近问的人很多，统一回复一下，详情看下图。',
  '客户返图太好看啦，随手发一发，喜欢的可以私信。',
  '刚到店的新款，先拍几张图分享给老朋友们。',
  '限时优惠中，数量有限，先到先得哦。',
  '搭配好了直接上身，省心又好看。',
  '夏日清爽穿搭，轻薄不透，日常通勤无压力。',
  '老朋友复购率很高的一款，口碑说明一切。',
  '新到的颜色太正了，实拍无滤镜，放心入。',
  '一组轻便通勤单品，柔软舒适，夏天穿刚好。'
];

var FEED_IMAGE_POOL = [
  './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092896_1960_1.jpg.jpg',
  './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092896_1518_0.jpg.jpg',
  './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092843_8406_8.jpg.jpg',
  './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092843_7820_16.jpg.jpg',
  './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092843_5886_4.jpg.jpg',
  './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092843_5385_10.jpg.jpg',
  './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092843_3687_15.jpg.jpg',
  './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092817_7765_8.jpg.jpg',
  './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092817_7404_0.jpg.jpg',
  './lib/assets/image/clothing/clothing_6/img_1708defc_20240216_i1708092817_2182_1.jpg.jpg',
  './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092877_8943_0.jpg.jpg',
  './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092860_9030_2.jpg.jpg',
  './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092860_4169_4.jpg.jpg',
  './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092843_9294_21.jpg.jpg',
  './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092843_8369_2.jpg.jpg',
  './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092843_6586_19.jpg.jpg',
  './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092843_3991_3.jpg.jpg',
  './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092843_3910_9.jpg.jpg',
  './lib/assets/image/clothing/clothing_8/img_1708defc_20240216_i1708092817_8695_6.jpg.jpg'
];

var FEED_NICKNAME_PREFIXES = ['阿', '安', '白', '冰', '晨', '大', '东', '芳', '光', '海', '红', '华', '静', '俊', '可', '兰', '丽', '亮', '林', '龙', '美', '明', '娜', '鹏', '强', '青', '秋', '然', '瑞', '山', '婷', '伟', '文', '雯', '霞', '小', '欣', '雪', '雅', '燕', '洋', '怡', '颖', '宇', '玉', '媛', '月', '云', '泽', '志'];
var FEED_NICKNAME_SUFFIXES = ['哥', '姐', '总', '老板', '老板娘', '代理', '客户', '分销', '店主', '朋友', '同学', '邻居', '亲戚', '同事', '合作方'];

function getFallbackPyInitial(char) {
  var map = {
    '阿': 'A', '安': 'A', '白': 'B', '冰': 'B', '晨': 'C', '大': 'D', '东': 'D',
    '芳': 'F', '光': 'G', '海': 'H', '红': 'H', '华': 'H', '静': 'J', '俊': 'J',
    '可': 'K', '兰': 'L', '丽': 'L', '亮': 'L', '林': 'L', '龙': 'L', '美': 'M',
    '明': 'M', '娜': 'N', '鹏': 'P', '强': 'Q', '青': 'Q', '秋': 'Q', '然': 'R',
    '瑞': 'R', '山': 'S', '婷': 'T', '伟': 'W', '文': 'W', '雯': 'W', '霞': 'X',
    '小': 'X', '欣': 'X', '雪': 'X', '雅': 'Y', '燕': 'Y', '洋': 'Y', '怡': 'Y',
    '颖': 'Y', '宇': 'Y', '玉': 'Y', '媛': 'Y', '月': 'Y', '云': 'Y', '泽': 'Z',
    '志': 'Z', '老': 'L', '总': 'Z', '代': 'D', '客': 'K', '分': 'F', '店': 'D',
    '朋': 'P', '同': 'T', '邻': 'L', '亲': 'Q', '合': 'H'
  };
  return map[char] || '#';
}

function generateFallbackFriends(count) {
  var friends = [];
  var groups = ['g-vip', 'g-normal', 'g-follow'];
  for (var i = 0; i < count; i++) {
    var prefix = FEED_NICKNAME_PREFIXES[i % FEED_NICKNAME_PREFIXES.length];
    var suffix = FEED_NICKNAME_SUFFIXES[Math.floor(i / FEED_NICKNAME_PREFIXES.length) % FEED_NICKNAME_SUFFIXES.length];
    var nickname = prefix + suffix + (i < FEED_NICKNAME_PREFIXES.length ? '' : Math.floor(i / FEED_NICKNAME_PREFIXES.length / FEED_NICKNAME_SUFFIXES.length));
    var pyInitial = getFallbackPyInitial(nickname.charAt(0));
    var groupId = groups[i % groups.length];
    var avatarIndex = (i % 100) + 1;
    friends.push({
      friend_id: 'f' + String(i + 1).padStart(3, '0'),
      nickname: nickname,
      py_initial: pyInitial,
      group_id: groupId,
      new_count: (i * 7) % 10,
      product_total: (i * 13) % 100 + 1,
      avatar: './lib/assets/image/avatar/avatar_' + String(avatarIndex).padStart(3, '0') + '.jpg'
    });
  }
  return friends;
}

function getFriendsData() {
  if (typeof window.FRIENDS_DATA !== 'undefined' && Array.isArray(window.FRIENDS_DATA) && window.FRIENDS_DATA.length > 0) {
    return window.FRIENDS_DATA;
  }
  return generateFallbackFriends(100);
}

function pickImages(seed, count) {
  var images = [];
  var max = Math.min(count, FEED_IMAGE_POOL.length);
  for (var i = 0; i < max; i++) {
    var idx = (seed + i * 7) % FEED_IMAGE_POOL.length;
    images.push(FEED_IMAGE_POOL[idx]);
  }
  return images;
}

function formatTime(seed) {
  var labels = ['刚刚', '5 分钟前', '12 分钟前', '30 分钟前', '今天 09:20', '今天 11:05', '昨天', '昨天 18:40', '2 天前', '3 天前', '本周一', '本周二'];
  return labels[seed % labels.length];
}

function generateFeedPosts(friends) {
  var posts = [];
  var friendCount = Math.min(30, friends.length);
  var id = 0;
  for (var i = 0; i < friendCount; i++) {
    var friend = friends[i];
    var postCount = 1 + (i % 2);
    for (var j = 0; j < postCount; j++) {
      var seed = id + 1;
      var type = (seed % 3 === 0) ? 'photo' : 'new';
      var imageCount = type === 'new' ? (1 + (seed % 4)) : (1 + (seed % 6));
      var product = null;
      if (type === 'new') {
        product = {
          name: FEED_PRODUCT_NAMES[seed % FEED_PRODUCT_NAMES.length],
          desc: '多色可选｜' + (seed % 2 === 0 ? '轻薄不透' : '柔软亲肤') + '｜支持七天换码',
          price: 49 + (seed * 11) % 250
        };
      }
      posts.push({
        post_id: 'p' + String(seed).padStart(4, '0'),
        author_id: friend.friend_id,
        author_name: friend.nickname,
        author_avatar: friend.avatar,
        type: type,
        content: FEED_COPY_TEMPLATES[seed % FEED_COPY_TEMPLATES.length],
        images: pickImages(seed, imageCount),
        product: product,
        published_at: formatTime(seed)
      });
      id++;
    }
  }
  return posts;
}

/* ── 模板函数 ── */
function feedImageTemplate(imageSrc, index, postId) {
  return ''
    + '<button type="button" class="wg-image wg-image--rounded-md wg-image--clickable" data-dd-id="feed-image-' + postId + '-' + index + '" data-component-slug="image" data-component-binding="feed-image" data-dom-id="view-image-' + postId + '-' + index + '" aria-label="查看图片">'
    +   '<img class="wg-image__src is-loaded" src="' + imageSrc + '" alt="">'
    +   '<span class="wg-image__overlay"></span>'
    + '</button>';
}

function feedCardTemplate(post) {
  var imageCount = post.images.length;
  var mediaClass = 'album-feed__media';
  if (imageCount === 1) mediaClass += ' album-feed__media--single';
  else if (imageCount === 2) mediaClass += ' album-feed__media--two';

  var imagesHtml = post.images.map(function(src, idx) {
    return feedImageTemplate(src, idx, post.post_id);
  }).join('');

  var productHtml = '';
  if (post.product) {
    productHtml = ''
      + '<button type="button" class="card card--outlined album-feed__product" data-dd-id="product-' + post.post_id + '" data-component-slug="card" data-component-binding="feed-product-card" data-dom-id="open-product-' + post.post_id + '">'
      +   '<span class="card__content">'
      +     '<span class="card__header album-feed__product-title">' + escapeHtml(post.product.name) + '</span>'
      +     '<span class="card__body album-feed__product-meta">' + escapeHtml(post.product.desc) + '</span>'
      +     '<span class="album-feed__product-price">¥' + post.product.price + '</span>'
      +   '</span>'
      + '</button>';
  }

  return ''
    + '<article class="album-feed__card" data-post-id="' + post.post_id + '" data-post-type="' + post.type + '">'
    +   '<header class="album-feed__author">'
    +     '<div class="avatar avatar--40 avatar--image" data-dd-id="author-' + post.post_id + '" data-component-slug="avatar" data-component-binding="feed-author-avatar">'
    +       '<img src="' + post.author_avatar + '" alt="' + escapeHtml(post.author_name) + '">'
    +     '</div>'
    +     '<div class="album-feed__author-info">'
    +       '<p class="album-feed__author-name">' + escapeHtml(post.author_name) + '</p>'
    +       '<p class="album-feed__time">' + escapeHtml(post.published_at) + '</p>'
    +     '</div>'
    +   '</header>'
    +   '<p class="album-feed__copy">' + escapeHtml(post.content) + '</p>'
    +   '<div class="' + mediaClass + '">' + imagesHtml + '</div>'
    +   productHtml
    +   '<div class="album-feed__actions">'
    +     '<button type="button" class="btn btn--strong btn--sm" data-dd-id="forward-' + post.post_id + '" data-component-slug="button" data-component-binding="feed-forward-action" data-dom-id="forward-' + post.post_id + '">转发</button>'
    +     '<button type="button" class="btn btn--medium btn--sm" data-dd-id="download-' + post.post_id + '" data-component-slug="button" data-component-binding="feed-download-action" data-dom-id="download-' + post.post_id + '">下载图片</button>'
    +     '<button type="button" class="btn btn--weak btn--sm album-feed__more" data-dd-id="more-' + post.post_id + '" data-component-slug="button" data-component-binding="feed-more-action" data-dom-id="more-' + post.post_id + '">更多</button>'
    +   '</div>'
    + '</article>';
}

function friendChipTemplate(friend) {
  return ''
    + '<button type="button" class="album-feed__friend-chip" data-friend-id="' + friend.friend_id + '" data-dd-id="friend-chip-' + friend.friend_id + '" data-component-slug="avatar" data-component-binding="feed-friend-avatar">'
    +   '<div class="avatar avatar--40 avatar--image">'
    +     '<img src="' + friend.avatar + '" alt="' + escapeHtml(friend.nickname) + '">'
    +   '</div>'
    +   '<span class="album-feed__friend-name">' + escapeHtml(friend.nickname) + '</span>'
    + '</button>';
}

function emptyStateTemplate() {
  return ''
    + '<div class="album-feed__empty">'
    +   '<i class="wego-iconfont-s icon-sousuo album-feed__empty-icon" aria-hidden="true"></i>'
    +   '<p class="album-feed__empty-text">未找到相关动态</p>'
    +   '<button type="button" class="btn btn--medium btn--sm" data-dd-id="empty-clear" data-component-slug="button" data-component-binding="feed-empty-clear-action" data-dom-id="empty-clear">清除搜索</button>'
    + '</div>';
}

function escapeHtml(text) {
  var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text || '').split('').map(function(c) { return map[c] || c; }).join('');
}

/* ── 主模板 ── */
const albumProductFeedTemplate = `
  <section class="album-feed" data-surface-id="album-product-feed" data-route-id="album-product-feed" data-route-bound="true" data-layout-mode="composed" data-page-edge-mode="M0" data-bg="page">
    <div class="album-feed__scroll">
      <header class="album-feed__header">
        <div class="searchbox searchbox--md searchbox--white" data-dd-id="feed-search" data-component-slug="search" data-component-binding="feed-search">
          <span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>
          <div class="searchbox__input">
            <input class="searchbox__field" type="search" placeholder="搜索好友、商品或动态" aria-label="搜索好友、商品或动态" data-dom-id="search-input">
          </div>
          <div class="searchbox__actions">
            <button class="searchbox__action searchbox__clear wego-iconfont-s icon-yuancha-mian" type="button" aria-label="清除" data-dom-id="search-clear" hidden></button>
          </div>
        </div>
      </header>

      <div class="album-feed__friends">
        <div class="album-feed__friends-scroll" data-region="friends-scroll"></div>
      </div>

      <div class="album-feed__tabs">
        <div class="wg-tabs wg-tabs--standard wg-tabs--divide" role="tablist" data-dd-id="feed-tabs" data-component-slug="tabs" data-component-binding="feed-tabs">
          <div class="wg-tabs__scroll">
            <button class="wg-tabs__item" role="tab" aria-selected="true" type="button" data-tag="all" data-dom-id="tab-all">
              <span class="wg-tabs__content"><span class="wg-tabs__label">全部</span></span>
            </button>
            <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-tag="new" data-dom-id="tab-new">
              <span class="wg-tabs__content"><span class="wg-tabs__label">好友上新</span></span>
            </button>
            <button class="wg-tabs__item" role="tab" aria-selected="false" type="button" data-tag="photo" data-dom-id="tab-photo">
              <span class="wg-tabs__content"><span class="wg-tabs__label">图文动态</span></span>
            </button>
            <span class="wg-tabs__active-indicator" aria-hidden="true"></span>
          </div>
        </div>
      </div>

      <div class="album-feed__filter-bar" data-region="filter-bar" hidden>
        <span class="album-feed__filter-text" data-region="filter-text"></span>
        <button type="button" class="btn btn--weak btn--sm" data-dd-id="clear-filter" data-component-slug="button" data-component-binding="feed-clear-filter-action" data-dom-id="clear-filter">清除过滤</button>
      </div>

      <div class="album-feed__list" data-region="feed-list"></div>
      <div class="album-feed__empty-host" data-region="empty-host" hidden></div>
    </div>
  </section>
`;

/* ── 场景逻辑 ── */
window.WegoApp.registerScene({
  routeId: 'album-product-feed',
  title: '动态',
  template: albumProductFeedTemplate,
  presentation: { type: 'host-tab', transition: 'none', dismissAction: 'tab-switch', overlayLevel: 'inline', coversTabBar: false },
  init: function initAlbumProductFeed(ctx) {
  var root = ctx.root;
  var friends = getFriendsData();
  var allPosts = generateFeedPosts(friends);

  var state = {
    query: '',
    tag: FEED_TAG_ALL,
    friendId: null
  };
  var suppressClearClick = false;

  var searchBox = root.querySelector('[data-component-binding="feed-search"]');
  var searchField = root.querySelector('[data-dom-id="search-input"]');
  var searchClear = root.querySelector('[data-dom-id="search-clear"]');
  var tabAll = root.querySelector('[data-dom-id="tab-all"]');
  var tabNew = root.querySelector('[data-dom-id="tab-new"]');
  var tabPhoto = root.querySelector('[data-dom-id="tab-photo"]');
  var clearFilter = root.querySelector('[data-dom-id="clear-filter"]');

  var els = {
    friendsScroll: root.querySelector('[data-region="friends-scroll"]'),
    tabs: root.querySelector('[data-component-binding="feed-tabs"]'),
    tabItems: Array.from(root.querySelectorAll('[data-tag]')),
    indicator: root.querySelector('.wg-tabs__active-indicator'),
    filterBar: root.querySelector('[data-region="filter-bar"]'),
    filterText: root.querySelector('[data-region="filter-text"]'),
    feedList: root.querySelector('[data-region="feed-list"]'),
    emptyHost: root.querySelector('[data-region="empty-host"]')
  };

  function renderFriends() {
    var max = Math.min(12, friends.length);
    var html = '';
    for (var i = 0; i < max; i++) {
      html += friendChipTemplate(friends[i]);
    }
    els.friendsScroll.innerHTML = html;
  }

  function updateTabsIndicator() {
    var scroll = els.tabs.querySelector('.wg-tabs__scroll');
    var selected = els.tabs.querySelector('.wg-tabs__item[aria-selected="true"] .wg-tabs__content');
    if (!scroll || !selected || !els.indicator) return;
    var scrollRect = scroll.getBoundingClientRect();
    var selectedRect = selected.getBoundingClientRect();
    var x = selectedRect.left - scrollRect.left + scroll.scrollLeft;
    els.indicator.style.setProperty('--_tabs-indicator-x', x + 'px');
    els.indicator.style.setProperty('--_tabs-indicator-width', selectedRect.width + 'px');
  }

  function setActiveTag(tag) {
    state.tag = tag;
    els.tabItems.forEach(function(item) {
      var selected = item.dataset.tag === tag;
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    updateTabsIndicator();
  }

  function getFilteredPosts() {
    var result = allPosts.slice();
    if (state.friendId) {
      result = result.filter(function(p) { return p.author_id === state.friendId; });
    }
    if (state.tag === FEED_TAG_NEW) {
      result = result.filter(function(p) { return p.type === 'new'; });
    } else if (state.tag === FEED_TAG_PHOTO) {
      result = result.filter(function(p) { return p.type === 'photo'; });
    }
    if (state.query) {
      var kw = state.query.toLowerCase();
      result = result.filter(function(p) {
        if (p.author_name.toLowerCase().indexOf(kw) !== -1) return true;
        if (p.content.toLowerCase().indexOf(kw) !== -1) return true;
        if (p.product && p.product.name.toLowerCase().indexOf(kw) !== -1) return true;
        return false;
      });
    }
    return result;
  }

  function renderFeed() {
    var posts = getFilteredPosts();
    if (posts.length === 0) {
      els.feedList.innerHTML = '';
      els.emptyHost.innerHTML = emptyStateTemplate();
      els.emptyHost.hidden = false;
    } else {
      els.emptyHost.hidden = true;
      els.emptyHost.innerHTML = '';
      els.feedList.innerHTML = posts.map(feedCardTemplate).join('');
    }
  }

  function updateSearchUI() {
    var hasQuery = searchField.value.length > 0;
    var isFocused = document.activeElement === searchField;
    searchClear.hidden = !hasQuery;
    if (searchBox) {
      searchBox.classList.toggle('is-inputting', hasQuery && isFocused);
      searchBox.classList.toggle('is-text-result', hasQuery && !isFocused);
    }
    root.querySelector('.album-feed__friends').hidden = hasQuery;
    root.querySelector('.album-feed__tabs').hidden = hasQuery;
  }

  function clearSearch() {
    searchField.value = '';
    state.query = '';
    ctx.state['searching'] = false;
    ctx.state['feed-ready'] = true;
    applyState();
    searchField.focus();
  }

  function handleClearPointerDown(event) {
    suppressClearClick = true;
    event.preventDefault();
    clearSearch();
    setTimeout(function() {
      suppressClearClick = false;
    }, 0);
  }

  function handleClearClick(event) {
    if (suppressClearClick) {
      event.preventDefault();
      return;
    }
    clearSearch();
  }

  function updateFilterBar() {
    if (state.friendId) {
      var friend = friends.find(function(f) { return f.friend_id === state.friendId; });
      els.filterText.textContent = '只看 ' + (friend ? friend.nickname : '该好友') + ' 的动态';
      els.filterBar.hidden = false;
    } else {
      els.filterBar.hidden = true;
    }
  }

  function applyState() {
    updateSearchUI();
    updateFilterBar();
    renderFeed();
    bindCardEvents();
  }

  function bindCardEvents() {
    els.feedList.querySelectorAll('.album-feed__card').forEach(function(card) {
      var postId = card.dataset.postId;

      card.querySelectorAll('[data-dom-id^="view-image-"]').forEach(function(btn) {
        btn.addEventListener('click', function() { ctx.toast('图片预览开发中'); });
      });

      var productBtn = card.querySelector('[data-dom-id="open-product-' + postId + '"]');
      if (productBtn) {
        productBtn.addEventListener('click', function() { ctx.toast('商品详情开发中'); });
      }

      var forwardBtn = card.querySelector('[data-dom-id="forward-' + postId + '"]');
      if (forwardBtn) {
        forwardBtn.addEventListener('click', function() { ctx.toast('已生成转发文案'); });
      }

      var downloadBtn = card.querySelector('[data-dom-id="download-' + postId + '"]');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', function() { ctx.toast('图片已保存'); });
      }

      var moreBtn = card.querySelector('[data-dom-id="more-' + postId + '"]');
      if (moreBtn) {
        moreBtn.addEventListener('click', function() { openMoreSheet(postId); });
      }
    });
  }

  function openMoreSheet(postId) {
    var sheetHtml = ''
      + '<div class="actionsheet actionsheet--action" role="dialog" aria-modal="true" data-state="closed" data-dd-id="feed-more-sheet" data-component-slug="actionsheet" data-component-binding="feed-more-sheet">'
      +   '<div class="actionsheet__panel">'
      +     '<div class="actionsheet__list">'
      +       '<div class="actionsheet__item" data-action="share"><div class="actionsheet__item-main"><div class="actionsheet__item-title">分享</div></div></div>'
      +       '<div class="actionsheet__item" data-action="copy"><div class="actionsheet__item-main"><div class="actionsheet__item-title">复制链接</div></div></div>'
      +       '<div class="actionsheet__item" data-action="collect"><div class="actionsheet__item-main"><div class="actionsheet__item-title">收藏</div></div></div>'
      +       '<div class="actionsheet__item" data-action="report"><div class="actionsheet__item-main"><div class="actionsheet__item-title">举报</div></div></div>'
      +     '</div>'
      +     '<div class="actionsheet__cancel-gap"></div>'
      +     '<button type="button" class="actionsheet__cancel" data-close-more-sheet>取消</button>'
      +   '</div>'
      + '</div>';
    ctx.openSheet(sheetHtml, {
      label: '更多操作',
      init: function(api) {
        api.root.querySelectorAll('.actionsheet__item').forEach(function(item) {
          item.addEventListener('click', function() {
            var action = item.dataset.action;
            var messages = { share: '分享面板开发中', copy: '链接已复制', collect: '已收藏', report: '举报已提交' };
            ctx.toast(messages[action] || '操作完成');
            api.close();
          });
        });
        var cancelBtn = api.root.querySelector('[data-close-more-sheet]');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', function() { api.close(); });
        }
        // mask 关闭：点击 actionsheet 根节点（蒙层）非面板区域关闭面板，符合 actionsheet closeByMask 默认行为
        api.root.addEventListener('click', function(event) {
          if (event.target === api.root) api.close();
        });
      }
    });
  }

  /* 搜索 */
  searchField.addEventListener('input', function() {
    state.query = searchField.value.trim();
    ctx.state['searching'] = Boolean(state.query);
    applyState();
  });
  searchField.addEventListener('focus', updateSearchUI);
  searchField.addEventListener('blur', updateSearchUI);
  searchClear.addEventListener('pointerdown', handleClearPointerDown);
  searchClear.addEventListener('click', handleClearClick);

  /* 好友快捷入口 */
  els.friendsScroll.addEventListener('click', function(e) {
    var chip = e.target.closest('[data-friend-id]');
    if (!chip) return;
    state.friendId = chip.dataset.friendId;
    state.query = '';
    searchField.value = '';
    ctx.state['friend-filter'] = true;
    setActiveTag(FEED_TAG_ALL);
    applyState();
  });

  /* 标签切换 */
  tabAll.addEventListener('click', function() {
    setActiveTag(FEED_TAG_ALL);
    ctx.state['feed-ready'] = true;
    ctx.state['feed-new'] = false;
    ctx.state['feed-photo'] = false;
    applyState();
  });

  tabNew.addEventListener('click', function() {
    setActiveTag(FEED_TAG_NEW);
    ctx.state['feed-ready'] = false;
    ctx.state['feed-new'] = true;
    ctx.state['feed-photo'] = false;
    applyState();
  });

  tabPhoto.addEventListener('click', function() {
    setActiveTag(FEED_TAG_PHOTO);
    ctx.state['feed-ready'] = false;
    ctx.state['feed-new'] = false;
    ctx.state['feed-photo'] = true;
    applyState();
  });

  /* 清除过滤 */
  clearFilter.addEventListener('click', function() {
    state.friendId = null;
    ctx.state['feed-ready'] = true;
    applyState();
  });

  /* 空状态清除 */
  els.emptyHost.addEventListener('click', function(e) {
    var clearBtn = e.target.closest('[data-dom-id="empty-clear"]');
    if (!clearBtn) return;
    searchField.value = '';
    state.query = '';
    state.friendId = null;
    state.tag = FEED_TAG_ALL;
    ctx.state['searching'] = false;
    ctx.state['feed-ready'] = true;
    setActiveTag(FEED_TAG_ALL);
    applyState();
  });

  /* 窗口尺寸变化时重算指示条 */
  window.addEventListener('resize', updateTabsIndicator);

  /* 初始化渲染 */
  ctx.state['feed-ready'] = true;
  renderFriends();
  setActiveTag(FEED_TAG_ALL);
  applyState();

  /* 首次挂载后延迟更新指示条，确保布局完成 */
  requestAnimationFrame(function() {
    updateTabsIndicator();
  });
  }
});
