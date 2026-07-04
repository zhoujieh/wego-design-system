(function () {
  // 内存状态：9 个 switch 的初始态（按用户提供的参考结构）
  var STATE = {
    showProduct: true,
    showNote: true,
    smartPrice: true,
    textPriceOrder: true,
    keepAlbumOrder: false,
    hdUpload: true,
    hdTransfer: true,
    filterContact: true,
    foldDetail: false
  };

  // 四组设置项数据
  var GROUPS = [
    {
      title: '',
      items: [
        { id: 'show-product', title: '在个人主页展示产品', type: 'switch', switchKey: 'showProduct' },
        { id: 'show-note', title: '在个人主页展示笔记', type: 'switch', switchKey: 'showNote' },
        { id: 'tag-manage', title: '标签管理', subtitle: '可快速实现产品分类设置', type: 'navigate' },
        { id: 'album-organize', title: '整理相册', subtitle: '批量删除、批量上下架、云空间清理都在这里', type: 'navigate' }
      ]
    },
    {
      title: '商品',
      items: [
        { id: 'price-manage', title: '价格管理', type: 'navigate' },
        { id: 'smart-price', title: '智能识别价格', subtitle: '从文案中提取价格自动填充至售价', type: 'switch', switchKey: 'smartPrice' },
        { id: 'text-price-order', title: '支持以文案价下单', subtitle: '开启后，买家能以文案价下单购买', type: 'switch', switchKey: 'textPriceOrder' },
        { id: 'auto-markup', title: '产品自动加价', subtitle: '转发/分享时按价格或比例自动加价', detailLink: true, type: 'navigate', actionText: '开' },
        { id: 'auto-sku', title: '自动生成货号与规格编码', type: 'navigate', actionText: '开' },
        { id: 'keep-album-order', title: '编辑产品和笔记不改相册顺序', subtitle: '编辑产品和笔记后在相册位置不会变化', type: 'switch', switchKey: 'keepAlbumOrder' }
      ]
    },
    {
      title: '发布/转发',
      items: [
        { id: 'hd-upload', title: '高清上图', subtitle: '上传图片最大5M、视频最大300M', type: 'switch', switchKey: 'hdUpload' },
        { id: 'hd-transfer', title: '高清转图', subtitle: '支持转上家的高清图到你的相册', type: 'switch', switchKey: 'hdTransfer' },
        { id: 'filter-contact', title: '转发过滤手机号/微信号/二维码', type: 'switch', switchKey: 'filterContact' },
        { id: 'filter-friends', title: '选择要过滤的好友', type: 'navigate', actionText: '全部好友' }
      ]
    },
    {
      title: '其他',
      items: [
        { id: 'fold-detail', title: '个人主页折叠详情图', subtitle: '开启后，浏览列表默认折叠详情图', type: 'switch', switchKey: 'foldDetail' }
      ]
    }
  ];

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function switchMarkup(key) {
    var on = !!STATE[key];
    var stateClass = on ? 'switch--on' : 'switch--off';
    return ''
      + '<div class="switch ' + stateClass + '" data-switch-key="' + esc(key) + '" role="switch" aria-checked="' + (on ? 'true' : 'false') + '" tabindex="0">'
      +   '<div class="switch__thumb"></div>'
      + '</div>';
  }

  function subtitleMarkup(item) {
    if (!item.subtitle) return '';
    var html = '<div class="cell__subtitle">' + esc(item.subtitle);
    if (item.detailLink) {
      html += '<a class="product-note__detail-link" data-action="detail" href="javascript:void(0)">详情</a>';
    }
    html += '</div>';
    return html;
  }

  function actionMarkup(item) {
    if (item.type === 'switch') {
      return switchMarkup(item.switchKey);
    }
    // navigate：action-text（可选）+ arrow
    var html = '';
    if (item.actionText) {
      html += '<span class="cell__action-text">' + esc(item.actionText) + '</span>';
    }
    html += '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>';
    return html;
  }

  function cellMarkup(item, isLastInGroup) {
    var density = item.subtitle ? 'cell--double' : 'cell--single';
    var divider = isLastInGroup ? '' : ' cell--divider-right-edge';
    var subtitle = subtitleMarkup(item);
    var action = actionMarkup(item);

    if (item.type === 'switch') {
      // 静态行：整行不可点击，由 switch 承担热区
      return ''
        + '<div class="cell ' + density + ' cell--bg-white' + divider + '">'
        +   '<div class="cell__body">'
        +     '<div class="cell__content">'
        +       '<div class="cell__title-row"><span class="cell__title">' + esc(item.title) + '</span></div>'
        +       subtitle
        +     '</div>'
        +     '<div class="cell__action">'
        +       action
        +     '</div>'
        +   '</div>'
        + '</div>';
    }

    // navigate：整行 clickable
    return ''
      + '<button type="button" class="cell ' + density + ' cell--bg-white cell--clickable' + divider + '" data-entry-id="' + esc(item.id) + '" role="button">'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + esc(item.title) + '</span></div>'
      +       subtitle
      +     '</div>'
      +     '<div class="cell__action">'
      +       action
      +     '</div>'
      +   '</div>'
      + '</button>';
  }

  function groupMarkup(group) {
    var total = group.items.length;
    var rows = group.items.map(function (item, idx) {
      return cellMarkup(item, idx === total - 1);
    }).join('');
    var title = group.title
      ? '<div class="cell-group__title">' + esc(group.title) + '</div>'
      : '';
    return ''
      + '<div class="cell-group">'
      +   title
      +   '<div class="cell-group__content">'
      +     rows
      +   '</div>'
      + '</div>';
  }

  function pageTemplate() {
    var groups = GROUPS.map(function (g) { return groupMarkup(g); }).join('');
    return ''
      + '<section class="product-note-page" data-bg="page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<div class="navbar__left-btn" data-action="back" role="button" aria-label="返回"><i class="wego-iconfont-s icon-fanhui"></i></div>'
      +       '</div>'
      +       '<div class="navbar__center">'
      +         '<span class="navbar__title">产品与笔记</span>'
      +       '</div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="phone-body product-note-body">'
      +     groups
      +   '</div>'
      + '</section>';
  }

  window.WegoApp.registerScene({
    routeId: 'my-product-note',
    title: '产品与笔记',
    presentation: {
      type: 'push',
      transition: 'slide-left',
      coversTabBar: true
    },
    template: '',
    init: function (ctx) {
      function render() {
        ctx.root.innerHTML = pageTemplate();
        bind();
      }

      function bind() {
        var root = ctx.root;

        var backBtn = root.querySelector('[data-action="back"]');
        if (backBtn) {
          backBtn.addEventListener('click', function () {
            ctx.back();
          });
        }

        // switch 即时切换
        root.querySelectorAll('[data-switch-key]').forEach(function (sw) {
          sw.addEventListener('click', function () {
            var key = sw.dataset.switchKey;
            STATE[key] = !STATE[key];
            var on = !!STATE[key];
            sw.classList.toggle('switch--on', on);
            sw.classList.toggle('switch--off', !on);
            sw.setAttribute('aria-checked', on ? 'true' : 'false');
          });
        });

        // 导航行：toast 提示
        root.querySelectorAll('[data-entry-id]').forEach(function (row) {
          row.addEventListener('click', function () {
            ctx.toast('该功能尚未接入原型');
          });
        });

        // 副标题内『详情』链接：独立 click + stopPropagation
        root.querySelectorAll('[data-action="detail"]').forEach(function (link) {
          link.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            ctx.toast('查看详情');
          });
        });
      }

      render();
    }
  });
})();
