/* wego-design-contract:
{
  "surface_id": "dongtai-feed",
  "route_id": "dongtai",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "host-tab",
    "transition": "none",
    "dismissAction": "none",
    "overlayLevel": "none",
    "source": "library-consumption.json#/appRuntime/presentationTypes",
    "coversTabBar": false
  },
  "prompt_contract": {
    "design_system_snapshot": {
      "version": 410,
      "token_css": "colors_and_type.css",
      "component_css": "components.css",
      "component_inputs": [
        {
          "slug": "avatar",
          "preview_file": "preview/component-avatar.html",
          "contract_file": "components/avatar.json"
        },
        {
          "slug": "image",
          "preview_file": "preview/component-image.html",
          "contract_file": "components/image.json"
        },
        {
          "slug": "button",
          "preview_file": "preview/component-button.html",
          "contract_file": "components/button.json"
        },
        {
          "slug": "navbar",
          "preview_file": "preview/component-navbar.html",
          "contract_file": "components/navbar.json"
        },
        {
          "slug": "metric",
          "preview_file": "preview/component-metric.html",
          "contract_file": "components/metric.json"
        }
      ]
    },
    "token_whitelist": [
      "var(--bg-page)",
      "var(--bg-surface)",
      "var(--bg-subtle)",
      "var(--bg-placeholder)",
      "var(--bg-overlay-l1)",
      "var(--bg-overlay-l2)",
      "var(--bg-fill-strong)",
      "var(--bg-brand)",
      "var(--z-sticky)",
      "var(--text-default)",
      "var(--text-secondary)",
      "var(--text-tertiary)",
      "var(--heading-xs-font-size)",
      "var(--heading-xs-font-weight)",
      "var(--heading-xs-line-height)",
      "var(--body-sm-font-size)",
      "var(--body-sm-font-weight)",
      "var(--body-sm-line-height)",
      "var(--body-sm-strong-font-size)",
      "var(--body-sm-strong-font-weight)",
      "var(--body-sm-strong-line-height)",
      "var(--body-md-font-size)",
      "var(--body-md-font-weight)",
      "var(--body-md-line-height)",
      "var(--body-md-strong-font-size)",
      "var(--body-md-strong-font-weight)",
      "var(--body-md-strong-line-height)",
      "var(--body-xs-font-size)",
      "var(--body-xs-line-height)",
      "var(--status-promotion-default)",
      "var(--spacer-2)",
      "var(--spacer-4)",
      "var(--spacer-8)",
      "var(--spacer-12)",
      "var(--spacer-16)",
      "var(--spacer-40)",
      "var(--border-neutral-l1)",
      "var(--radius-full)",
      "var(--radius-12)",
      "var(--radius-8)",
      "var(--radius-6)",
      "var(--size-16)",
      "var(--size-32)",
      "var(--size-36)",
      "var(--size-40)"
    ],
    "token_bindings": [
      {
        "selector": ".dongtai-feed",
        "content_role": "场景根容器背景",
        "css_property": "background",
        "token": "var(--bg-page)",
        "rule_ref": "colors_and_type.css#bg-page"
      },
      {
        "selector": ".feed-card",
        "content_role": "动态卡片背景",
        "css_property": "background",
        "token": "var(--bg-surface)",
        "rule_ref": "colors_and_type.css#bg-surface"
      },
      {
        "selector": ".feed-card__product",
        "content_role": "产品信息区背景",
        "css_property": "background",
        "token": "var(--bg-subtle)",
        "rule_ref": "colors_and_type.css#bg-subtle"
      },
      {
        "selector": ".feed-card__publisher-name",
        "content_role": "发布者名称文字",
        "css_property": "color",
        "token": "var(--text-default)",
        "rule_ref": "colors_and_type.css#text-default"
      },
      {
        "selector": ".feed-card__publish-time",
        "content_role": "发布时间文字",
        "css_property": "color",
        "token": "var(--text-tertiary)",
        "rule_ref": "colors_and_type.css#text-tertiary"
      },
      {
        "selector": ".feed-card__text",
        "content_role": "动态正文文字",
        "css_property": "color",
        "token": "var(--text-default)",
        "rule_ref": "colors_and_type.css#text-default"
      },
      {
        "selector": ".dongtai-feed__topbar",
        "content_role": "顶部搜索栏层级",
        "css_property": "z-index",
        "token": "var(--z-sticky)",
        "rule_ref": "colors_and_type.css#z-sticky"
      },
      {
        "selector": ".dongtai-feed__search-entry:active",
        "content_role": "搜索入口按压态背景",
        "css_property": "background",
        "token": "var(--bg-overlay-l1)",
        "rule_ref": "colors_and_type.css#bg-overlay-l1"
      },
      {
        "selector": ".feed-card__product:active",
        "content_role": "产品卡按压态背景",
        "css_property": "background",
        "token": "var(--bg-overlay-l1)",
        "rule_ref": "colors_and_type.css#bg-overlay-l1"
      },
      {
        "selector": ".feed-card__image-item",
        "content_role": "图片项背景占位",
        "css_property": "background",
        "token": "var(--bg-placeholder)",
        "rule_ref": "colors_and_type.css#bg-placeholder"
      }
    ],
    "component_bindings": [
      {
        "slot": "发布者头像",
        "slug": "avatar",
        "reason": "每条动态头部展示发布者头像，使用 image 类型 40 尺寸",
        "root_class": "avatar",
        "source": "preview/component-avatar.html",
        "contract_file": "components/avatar.json",
        "required_structure": [".avatar--image img"],
        "modifiers": [".avatar--40", ".avatar--image"],
        "variant_dimensions": { "type": "image", "size": "40" }
      },
      {
        "slot": "动态图片与产品缩略图",
        "slug": "image",
        "reason": "展示动态中的商品图片和产品缩略图，使用 rounded-md 圆角",
        "root_class": "wg-image",
        "source": "preview/component-image.html",
        "contract_file": "components/image.json",
        "required_structure": [".wg-image__src"],
        "modifiers": [".wg-image--rounded-sm", ".wg-image--rounded-md"],
        "variant_dimensions": { "fit": "cover", "radius": "rounded-md" }
      },
      {
        "slot": "一键转发按钮",
        "slug": "button",
        "reason": "每条动态的核心操作按钮，使用 strong 强调引导转发",
        "root_class": "btn",
        "source": "preview/component-button.html",
        "contract_file": "components/button.json",
        "required_structure": [".btn__icon"],
        "modifiers": [".btn--strong", ".btn--md"],
        "variant_dimensions": { "emphasis": "strong", "size": "md", "iconMode": "leading-icon" }
      },
      {
        "slot": "产品详情导航栏",
        "slug": "navbar",
        "reason": "产品详情 push 页顶部导航，返回图标+居中标题",
        "root_class": "navbar",
        "source": "preview/component-navbar.html",
        "contract_file": "components/navbar.json",
        "required_structure": [".navbar__body", ".navbar__left", ".navbar__center", ".navbar__title"],
        "modifiers": [],
        "variant_dimensions": { "leftControl": "back-icon", "titleAlignment": "center", "actions": "none", "spacing": "default", "pageTransition": "push", "position": "sticky" }
      },
      {
        "slot": "产品价格展示",
        "slug": "metric",
        "reason": "动态卡片和产品详情中的价格展示，使用营销橙主题 14 号",
        "root_class": "metric",
        "source": "preview/component-metric.html",
        "contract_file": "components/metric.json",
        "required_structure": [".metric__main", ".metric__symbol", ".metric__value", ".metric__integer"],
        "modifiers": [".metric--14", ".metric--marketing"],
        "variant_dimensions": { "size": "14", "theme": "marketing" }
      }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "动态商品流为连续内容浏览场景，不匹配 biz-rule-config 或 system-settings 范式，采用 composed 模式自主组合",
      "page_edge_mode": "M8",
      "page_edge_mode_reason": "灰底白卡分组布局，外层保留 8px 留白，卡片间 12px 间距，符合连续内容流的视觉节奏",
      "rules": [
        "页面根背景 var(--bg-page)，卡片背景 var(--bg-surface)",
        "顶部搜索栏 sticky 吸顶，背景与页面一致",
        "动态卡片纵向排列，间距 var(--spacer-12)",
        "每条卡片内部：头部→正文→图片→产品信息→操作栏",
        "产品详情 push 页：navbar + hero 图 + 信息区 + 底部操作栏"
      ],
      "mutable_regions": [
        "dongtai-feed__list：动态列表区域，由 JS 动态渲染卡片",
        "feed-card__images：图片网格区域，根据图片数量自适应布局",
        "dongtai-product__info：产品详情信息区，由 JS 填充"
      ]
    },
    "interaction_contract": [
      {
        "dom_id": "search-entry",
        "target": "toast:搜索功能开发中"
      },
      {
        "dom_id": "forward-action",
        "target": "toast:已加入转发队列"
      },
      {
        "dom_id": "copy-text-action",
        "target": "clipboard+toast:文案已复制"
      },
      {
        "dom_id": "more-action",
        "target": "sheet:more-actions"
      },
      {
        "dom_id": "product-entry",
        "target": "route:dongtai-product"
      },
      {
        "dom_id": "image-click",
        "target": "full-screen-modal:image-viewer"
      },
      {
        "dom_id": "product-back",
        "target": "back:dongtai"
      },
      {
        "dom_id": "product-forward",
        "target": "toast:已加入转发队列"
      }
    ],
    "state_contract": [
      {
        "state_id": "feed_loaded",
        "initial": true,
        "trigger": "场景挂载后自动加载本地模拟数据",
        "visible_result": "动态列表展示 5 条模拟动态，每条含发布者、时间、文案（可选）、图片（0-4 张）和产品信息",
        "fallback": "数据为空时展示空状态文案",
        "persistence": "session"
      },
      {
        "state_id": "feed_empty",
        "initial": false,
        "trigger": "模拟数据为空数组",
        "visible_result": "列表区域展示空状态提示文案",
        "fallback": "不适用，空状态即终态",
        "persistence": "session"
      },
      {
        "state_id": "item_with_text_and_product",
        "initial": false,
        "trigger": "动态数据 content 非空且 product 存在",
        "visible_result": "卡片展示文案段落和产品信息卡，文案在图片上方",
        "fallback": "content 为空时省略文案段落",
        "persistence": "session"
      },
      {
        "state_id": "item_product_only",
        "initial": false,
        "trigger": "动态数据 content 为空字符串且 product 存在",
        "visible_result": "卡片省略文案段落，仅展示产品信息卡",
        "fallback": "不适用，产品信息即主内容",
        "persistence": "session"
      },
      {
        "state_id": "item_images_varied",
        "initial": false,
        "trigger": "动态数据 images 数组长度为 0、1、2、3 或 4+",
        "visible_result": "0 张时省略图片网格；1 张时 4:3 大图；2 张时 1:1 双列；3 张时 1:1 三列；4+ 张时 1:1 三列网格",
        "fallback": "图片加载失败时显示骨架占位",
        "persistence": "session"
      },
      {
        "state_id": "product_detail_entered",
        "initial": false,
        "trigger": "点击动态卡片中的产品信息区",
        "visible_result": "push 进入产品详情页，展示 hero 图、产品名称、价格和描述，底部展示转发按钮",
        "fallback": "返回动态流",
        "persistence": "session"
      },
      {
        "state_id": "operation_triggered",
        "initial": false,
        "trigger": "点击一键转发、复制文案、更多操作等入口",
        "visible_result": "转发和复制触发 toast 反馈；更多操作弹出 actionsheet 展示分享、收藏、下载、编辑、复制动态入口",
        "fallback": "toast 或 actionsheet 关闭后回到动态流",
        "persistence": "none"
      }
    ],
    "hard_rules": [
      "每条动态必须稳定呈现发布者头像、发布者名称、发布时间三项头部信息",
      "动态文案为空时省略文案段落，不影响产品信息展示",
      "图片数量为 0 时省略图片网格区域",
      "一键转发为 strong 按钮，是每条动态的核心操作",
      "产品详情为 push 场景，本地模拟数据展示",
      "所有操作入口仅提供 stub 级反馈（toast 或 actionsheet），不下钻功能实现"
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-14"
  },
  "crowding_check": {
    "status": "passed",
    "items": [
      "顶部搜索栏高度 44px，不遮挡动态卡片",
      "动态卡片间距 12px，卡片内边距 16px，节奏清晰",
      "图片网格 1/2/3 张采用不同布局，不超过 3 列",
      "产品信息行高 56px，缩略图 40px，文字与箭头对齐",
      "操作区按钮间距 8px，主按钮与次操作层级分明",
      "底部留白 32px，最后一条动态不贴底"
    ]
  }
}
*/

(function () {
  'use strict';

  // ── 模拟数据 ──
  var FEED_DATA = [
    {
      id: 'dt001',
      publisher: { name: '微购优选', avatar: './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg' },
      publish_time: '2026-07-14T10:30:00',
      content: '今日上新！法式复古碎花连衣裙，面料柔软透气，版型显瘦。限时特惠，喜欢的朋友不要错过～',
      images: [
        './lib/assets/image/clothing/clothing_1/clothing_1_2.jpg',
        './lib/assets/image/clothing/clothing_1/clothing_1_3.jpg',
        './lib/assets/image/clothing/clothing_1/clothing_1_4.jpg'
      ],
      product: {
        id: 'p001',
        name: '法式复古碎花连衣裙 夏季新款收腰显瘦长裙',
        price: 129.90,
        description: '面料：100%人造棉。版型：A字收腰。适合场景：日常、约会、度假。洗涤说明：30度以下轻柔机洗。',
        thumb: './lib/assets/image/clothing/clothing_1/clothing_1_5.jpg',
        hero: './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg'
      }
    },
    {
      id: 'dt002',
      publisher: { name: '微购优选', avatar: './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg' },
      publish_time: '2026-07-14T09:15:00',
      content: '',
      images: [
        './lib/assets/image/clothing/clothing_2/clothing_2_2.jpg'
      ],
      product: {
        id: 'p002',
        name: '纯棉简约白T恤 基础款短袖上衣',
        price: 59.00,
        description: '面料：100%纯棉。版型：宽松直筒。',
        thumb: './lib/assets/image/clothing/clothing_2/clothing_2_2.jpg',
        hero: './lib/assets/image/clothing/clothing_2/clothing_2_2.jpg'
      }
    },
    {
      id: 'dt003',
      publisher: { name: '微购优选', avatar: './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg' },
      publish_time: '2026-07-13T16:45:00',
      content: '这条裙子真的太好看了！上身效果满分，客户反馈都很满意。推荐大家转发～',
      images: [
        './lib/assets/image/clothing/clothing_3/1663740989357_27184.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989358_96529.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989359_87304.jpg',
        './lib/assets/image/clothing/clothing_3/1663740989360_60487.jpg'
      ],
      product: {
        id: 'p003',
        name: '韩系温柔风半身裙 春秋新款高腰百褶裙',
        price: 89.90,
        description: '面料：聚酯纤维混纺。版型：高腰A字百褶。',
        thumb: './lib/assets/image/clothing/clothing_3/1663740989357_27184.jpg',
        hero: './lib/assets/image/clothing/clothing_3/1663740989357_27184.jpg'
      }
    },
    {
      id: 'dt004',
      publisher: { name: '微购优选', avatar: './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg' },
      publish_time: '2026-07-13T11:20:00',
      content: '秋冬新款针织开衫，柔软亲肤，百搭不挑人。',
      images: [],
      product: {
        id: 'p004',
        name: '慵懒风针织开衫外套 秋冬新款宽松毛衣外套',
        price: 159.00,
        description: '面料：腈纶混纺。版型：宽松落肩。',
        thumb: './lib/assets/image/clothing/clothing_4/1663741015639_25492.jpg',
        hero: './lib/assets/image/clothing/clothing_4/1663741015639_25492.jpg'
      }
    },
    {
      id: 'dt005',
      publisher: { name: '微购优选', avatar: './lib/assets/image/clothing/clothing_1/clothing_1_1.jpg' },
      publish_time: '2026-07-12T15:30:00',
      content: '夏日清凉必备！冰丝阔腿裤，透气不闷热，垂感十足。',
      images: [
        './lib/assets/image/clothing/clothing_5/1663741055068_1251.jpg',
        './lib/assets/image/clothing/clothing_5/1663741055070_59070.jpg'
      ],
      product: {
        id: 'p005',
        name: '冰丝阔腿裤女 夏季薄款垂感直筒长裤',
        price: 69.90,
        description: '面料：冰丝。版型：高腰阔腿。',
        thumb: './lib/assets/image/clothing/clothing_5/1663741055068_1251.jpg',
        hero: './lib/assets/image/clothing/clothing_5/1663741055068_1251.jpg'
      }
    }
  ];

  // ── 辅助函数 ──

  function formatTime(iso) {
    var d = new Date(iso);
    var now = new Date('2026-07-14T12:00:00');
    var diff = (now - d) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
    if (diff < 172800) return '昨天';
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    var hh = String(d.getHours()).padStart(2, '0');
    var mi = String(d.getMinutes()).padStart(2, '0');
    return mm + '月' + dd + '日 ' + hh + ':' + mi;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function splitPrice(price) {
    var s = String(price);
    var dot = s.indexOf('.');
    if (dot < 0) return { integer: s, decimal: '' };
    return { integer: s.slice(0, dot), decimal: s.slice(dot + 1) };
  }

  function metricHtml(price, ddId) {
    var parts = splitPrice(price);
    var decimalHtml = parts.decimal
      ? '<span class="metric__decimal">.' + parts.decimal + '</span>'
      : '';
    return '<span class="metric metric--14 metric--marketing" data-dd-id="metric-' + ddId + '" data-component-slug="metric" data-rule-source="preview/component-metric.html" data-token-binding="color:var(--status-promotion-default)">'
      + '<span class="metric__main">'
      + '<span class="metric__symbol">¥</span>'
      + '<span class="metric__value">'
      + '<span class="metric__integer">' + parts.integer + '</span>'
      + decimalHtml
      + '</span>'
      + '</span>'
      + '</span>';
  }

  function wgImageHtml(src, alt, ddId, modifier) {
    var mod = modifier || 'wg-image--rounded-md';
    return '<div class="wg-image ' + mod + '" data-dd-id="img-' + ddId + '" data-component-slug="image" data-rule-source="preview/component-image.html">'
      + '<img class="wg-image__src" src="' + src + '" alt="' + escapeHtml(alt) + '">'
      + '</div>';
  }

  function bindImageLoad(root) {
    var imgs = root.querySelectorAll('.wg-image__src');
    imgs.forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('is-loaded');
      } else {
        img.addEventListener('load', function () {
          img.classList.add('is-loaded');
        });
        img.addEventListener('error', function () {
          img.closest('.wg-image').classList.add('wg-image--error');
        });
      }
    });
  }

  function imagesGridClass(count) {
    if (count === 1) return 'feed-card__images--1';
    if (count === 2) return 'feed-card__images--2';
    if (count === 3) return 'feed-card__images--3';
    return 'feed-card__images--multi';
  }

  function renderFeedCard(item) {
    var avatarHtml = '<div class="avatar avatar--40 avatar--image" data-dd-id="avatar-' + item.id + '" data-component-slug="avatar" data-rule-source="preview/component-avatar.html" data-token-binding="background:var(--bg-fill-strong)">'
      + '<img src="' + item.publisher.avatar + '" alt="' + escapeHtml(item.publisher.name) + '">'
      + '</div>';

    var textHtml = item.content
      ? '<p class="feed-card__text">' + escapeHtml(item.content) + '</p>'
      : '';

    var imagesHtml = '';
    if (item.images.length > 0) {
      var gridCls = imagesGridClass(item.images.length);
      var items = item.images.map(function (img, i) {
        return ''
          + '<div class="feed-card__image-item" data-dom-id="image-click" data-item-id="' + item.id + '" data-image-index="' + i + '">'
          +   wgImageHtml(img, '动态图片', 'image-' + item.id + '-' + i, 'wg-image--rounded-md')
          + '</div>';
      }).join('');
      imagesHtml = '<div class="feed-card__images ' + gridCls + '">' + items + '</div>';
    }

    var productHtml = '';
    if (item.product) {
      productHtml = ''
        + '<div class="feed-card__product" data-dom-id="product-entry" data-item-id="' + item.id + '">'
        +   '<div class="feed-card__product-thumb">'
        +     wgImageHtml(item.product.thumb, item.product.name, 'image-product-' + item.id, 'wg-image--rounded-sm')
        +   '</div>'
        +   '<div class="feed-card__product-info">'
        +     '<span class="feed-card__product-name">' + escapeHtml(item.product.name) + '</span>'
        +     '<div class="feed-card__product-meta">'
        +       metricHtml(item.product.price, 'metric-price-' + item.id)
        +     '</div>'
        +   '</div>'
        +   '<i class="feed-card__product-arrow wego-iconfont-s icon-youjiantou16"></i>'
        + '</div>';
    }

    var actionsHtml = ''
      + '<div class="feed-card__actions">'
      +   '<button type="button" class="btn btn--strong btn--md feed-card__forward-btn" data-dd-id="btn-forward-' + item.id + '" data-component-slug="button" data-rule-source="preview/component-button.html" data-token-binding="background:var(--bg-brand)" data-dom-id="forward-action" data-item-id="' + item.id + '">'
      +     '<i class="btn__icon wego-iconfont-s icon-zhuan"></i>'
      +     '一键转发'
      +   '</button>'
      +   '<div class="feed-card__action-entry" data-dom-id="copy-text-action" data-item-id="' + item.id + '">'
      +     '<i class="feed-card__action-entry-icon wego-iconfont-s icon-fuzhi"></i>'
      +     '<span class="feed-card__action-entry-text">复制文案</span>'
      +   '</div>'
      +   '<div class="feed-card__more-trigger" data-dom-id="more-action" data-item-id="' + item.id + '">'
      +     '<i class="feed-card__more-trigger-icon wego-iconfont-s icon-sandian16"></i>'
      +   '</div>'
      + '</div>';

    return ''
      + '<article class="feed-card" data-item-id="' + item.id + '">'
      +   '<header class="feed-card__header">'
      +     avatarHtml
      +     '<div class="feed-card__publisher">'
      +       '<span class="feed-card__publisher-name">' + escapeHtml(item.publisher.name) + '</span>'
      +       '<span class="feed-card__publish-time">' + formatTime(item.publish_time) + '</span>'
      +     '</div>'
      +   '</header>'
      +   textHtml
      +   imagesHtml
      +   productHtml
      +   actionsHtml
      + '</article>';
  }

  // ── Actionsheet 模板（更多操作） ──
  function moreActionsheetTemplate(item) {
    return ''
      + '<div class="actionsheet__panel">'
      +   '<div class="actionsheet__list">'
      +     '<div class="actionsheet__group">'
      +       '<div class="actionsheet__item" data-more-action="share">'
      +         '<div class="actionsheet__item-main">'
      +           '<span class="actionsheet__item-title">分享</span>'
      +         '</div>'
      +       '</div>'
      +       '<div class="actionsheet__item" data-more-action="favorite">'
      +         '<div class="actionsheet__item-main">'
      +           '<span class="actionsheet__item-title">收藏</span>'
      +         '</div>'
      +       '</div>'
      +       '<div class="actionsheet__item" data-more-action="download">'
      +         '<div class="actionsheet__item-main">'
      +           '<span class="actionsheet__item-title">下载图片</span>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="actionsheet__group">'
      +       '<div class="actionsheet__item" data-more-action="edit">'
      +         '<div class="actionsheet__item-main">'
      +           '<span class="actionsheet__item-title">编辑</span>'
      +         '</div>'
      +       '</div>'
      +       '<div class="actionsheet__item" data-more-action="copy-dynamic">'
      +         '<div class="actionsheet__item-main">'
      +           '<span class="actionsheet__item-title">复制动态</span>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="actionsheet__cancel-gap"></div>'
      +   '<div class="actionsheet__cancel">取消</div>'
      + '</div>';
  }

  // ── 图片查看器模板 ──
  function imageViewerTemplate(src) {
    return ''
      + '<div class="dongtai-image-viewer" data-dom-id="image-viewer-close">'
      +   '<img class="dongtai-image-viewer__img" src="' + src + '" alt="图片大图">'
      + '</div>';
  }

  // ── 动态流模板 ──
  var dongtaiTemplate = ''
    + '<div class="dongtai-feed" data-surface-id="dongtai-feed" data-route-id="dongtai" data-layout-mode="composed" data-bg="page">'
    +   '<div class="dongtai-feed__topbar">'
    +     '<div class="dongtai-feed__search-entry" data-dom-id="search-entry">'
    +       '<i class="dongtai-feed__search-icon wego-iconfont-s icon-sousuo"></i>'
    +       '<span class="dongtai-feed__search-placeholder">搜索动态</span>'
    +     '</div>'
    +   '</div>'
    +   '<div class="dongtai-feed__list" data-dom-id="feed-list"></div>'
    + '</div>';

  // ── 动态流初始化 ──
  function initDongtai(ctx) {
    var root = ctx.root;
    var list = root.querySelector('[data-dom-id="feed-list"]');

    // 渲染动态列表
    if (FEED_DATA.length === 0) {
      list.innerHTML = ''
        + '<div class="dongtai-feed__empty">'
        +   '<span class="dongtai-feed__empty-text">暂无动态</span>'
        + '</div>';
    } else {
      list.innerHTML = FEED_DATA.map(renderFeedCard).join('');
    }

    // 绑定图片加载态
    bindImageLoad(root);

    // 搜索入口
    var searchEntry = root.querySelector('[data-dom-id="search-entry"]');
    if (searchEntry) {
      searchEntry.addEventListener('click', function () {
        ctx.toast('搜索功能开发中');
      });
    }

    // 列表事件委托
    list.addEventListener('click', function (e) {
      // 一键转发
      var forwardBtn = e.target.closest('[data-dom-id="forward-action"]');
      if (forwardBtn) {
        e.preventDefault();
        ctx.toast('已加入转发队列');
        return;
      }

      // 复制文案
      var copyBtn = e.target.closest('[data-dom-id="copy-text-action"]');
      if (copyBtn) {
        e.preventDefault();
        var itemId = copyBtn.getAttribute('data-item-id');
        var item = FEED_DATA.find(function (d) { return d.id === itemId; });
        var text = (item && item.content) ? item.content : '';
        if (text && navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            ctx.toast('文案已复制');
          }).catch(function () {
            ctx.toast('文案已复制');
          });
        } else {
          ctx.toast('文案已复制');
        }
        return;
      }

      // 更多操作
      var moreBtn = e.target.closest('[data-dom-id="more-action"]');
      if (moreBtn) {
        e.preventDefault();
        var moreItemId = moreBtn.getAttribute('data-item-id');
        var moreItem = FEED_DATA.find(function (d) { return d.id === moreItemId; });
        ctx.openSheet(moreActionsheetTemplate(moreItem), {
          label: '更多操作',
          init: function (overlayCtx) {
            var panel = overlayCtx.root.querySelector('.actionsheet__panel');
            if (!panel) return;
            panel.addEventListener('click', function (ev) {
              var actionItem = ev.target.closest('[data-more-action]');
              if (actionItem) {
                var action = actionItem.getAttribute('data-more-action');
                var msgMap = {
                  share: '分享功能开发中',
                  favorite: '已收藏',
                  download: '图片下载中',
                  edit: '编辑功能开发中',
                  'copy-dynamic': '动态已复制'
                };
                overlayCtx.toast(msgMap[action] || '操作完成');
                overlayCtx.close();
                return;
              }
              if (ev.target.closest('.actionsheet__cancel')) {
                overlayCtx.close();
              }
            });
          }
        });
        return;
      }

      // 产品详情入口
      var productEntry = e.target.closest('[data-dom-id="product-entry"]');
      if (productEntry) {
        e.preventDefault();
        var pItemId = productEntry.getAttribute('data-item-id');
        ctx.state.selectedItemId = pItemId;
        ctx.navigate('dongtai-product');
        return;
      }

      // 图片点击看大图
      var imageItem = e.target.closest('[data-dom-id="image-click"]');
      if (imageItem) {
        e.preventDefault();
        var imgItemId = imageItem.getAttribute('data-item-id');
        var imgIndex = parseInt(imageItem.getAttribute('data-image-index'), 10);
        var imgItem = FEED_DATA.find(function (d) { return d.id === imgItemId; });
        if (imgItem && imgItem.images[imgIndex]) {
          ctx.openFullScreenModal(imageViewerTemplate(imgItem.images[imgIndex]), {
            label: '图片查看',
            init: function (overlayCtx) {
              var viewer = overlayCtx.root.querySelector('[data-dom-id="image-viewer-close"]');
              if (viewer) {
                viewer.addEventListener('click', function () {
                  overlayCtx.close();
                });
              }
            }
          });
        }
        return;
      }
    });
  }

  // ── 产品详情模板 ──
  var dongtaiProductTemplate = ''
    + '<div class="dongtai-product" data-surface-id="dongtai-product" data-route-id="dongtai-product" data-layout-mode="composed" data-bg="page">'
    +   '<nav class="navbar" data-dd-id="navbar-product" data-component-slug="navbar" data-rule-source="preview/component-navbar.html" data-bg="page">'
    +     '<div class="navbar__body">'
    +       '<div class="navbar__left">'
    +         '<button type="button" class="navbar__left-btn" data-dom-id="product-back" aria-label="返回">'
    +           '<i class="wego-iconfont-s icon-fanhui"></i>'
    +         '</button>'
    +       '</div>'
    +       '<div class="navbar__center">'
    +         '<span class="navbar__title">产品详情</span>'
    +       '</div>'
    +       '<div class="navbar__right"></div>'
    +     '</div>'
    +   '</nav>'
    +   '<div class="dongtai-product__body">'
    +     '<div class="dongtai-product__hero" id="product-hero"></div>'
    +     '<div class="dongtai-product__info" id="product-info"></div>'
    +   '</div>'
    +   '<div class="dongtai-product__bottom-bar">'
    +     '<button type="button" class="btn btn--strong btn--md"'
    +     ' data-dd-id="btn-product-forward" data-component-slug="button" data-rule-source="preview/component-button.html"'
    +     ' data-token-binding="background:var(--bg-brand)"'
    +     ' data-dom-id="product-forward">'
    +       '<i class="btn__icon wego-iconfont-s icon-zhuan"></i>'
    +       '一键转发'
    +     '</button>'
    +   '</div>'
    + '</div>';

  // ── 产品详情初始化 ──
  function initDongtaiProduct(ctx) {
    var root = ctx.root;
    var itemId = ctx.state.selectedItemId || ctx.appState.sceneState.dongtai && ctx.appState.sceneState.dongtai.selectedItemId;
    var item = FEED_DATA.find(function (d) { return d.id === itemId; });

    if (!item || !item.product) {
      item = FEED_DATA[0];
    }

    // 填充 hero 图
    var hero = root.querySelector('#product-hero');
    if (hero && item.product) {
      hero.innerHTML = wgImageHtml(item.product.hero, item.product.name, 'image-product-hero', 'wg-image--rounded-lg');
    }

    // 填充产品信息
    var info = root.querySelector('#product-info');
    if (info && item.product) {
      var parts = splitPrice(item.product.price);
      var decimalHtml = parts.decimal
        ? '<span class="metric__decimal">.' + parts.decimal + '</span>'
        : '';
      info.innerHTML = ''
        + '<div class="dongtai-product__price-row">'
        +   '<span class="metric metric--20 metric--marketing"'
        +   ' data-dd-id="metric-product-price" data-component-slug="metric" data-rule-source="preview/component-metric.html"'
        +   ' data-token-binding="color:var(--status-promotion-default)"'
        +   '>'
        +     '<span class="metric__main">'
        +       '<span class="metric__symbol">¥</span>'
        +       '<span class="metric__value">'
        +         '<span class="metric__integer">' + parts.integer + '</span>'
        +         decimalHtml
        +       '</span>'
        +     '</span>'
        +   '</span>'
        + '</div>'
        + '<h1 class="dongtai-product__name">' + escapeHtml(item.product.name) + '</h1>'
        + '<div class="dongtai-product__desc-section">'
        +   '<span class="dongtai-product__desc-title">产品描述</span>'
        +   '<p class="dongtai-product__desc">' + escapeHtml(item.product.description) + '</p>'
        + '</div>';
    }

    // 绑定图片加载
    bindImageLoad(root);

    // 返回按钮
    var backBtn = root.querySelector('[data-dom-id="product-back"]');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        ctx.back();
      });
    }

    // 转发按钮
    var forwardBtn = root.querySelector('[data-dom-id="product-forward"]');
    if (forwardBtn) {
      forwardBtn.addEventListener('click', function () {
        ctx.toast('已加入转发队列');
      });
    }
  }

  // ── 注册场景 ──
  window.WegoApp.registerScene({
    routeId: 'dongtai',
    template: dongtaiTemplate,
    presentation: { type: 'host-tab', transition: 'none', coversTabBar: false },
    init: initDongtai
  });

  window.WegoApp.registerScene({
    routeId: 'dongtai-product',
    template: dongtaiProductTemplate,
    presentation: { type: 'push', transition: 'slide', coversTabBar: true },
    init: initDongtaiProduct
  });
})();
