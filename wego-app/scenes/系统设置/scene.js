(function () {
  var ENTRIES = [
    {
      group: 'account',
      items: [
        {
          id: 'phone-login',
          title: '手机号登录',
          subtitle: '通过手机号和密码实现多人同时登录',
          double: true,
          trailing: 'text-arrow',
          actionText: '去设置'
        }
      ]
    },
    {
      group: 'business',
      items: [
        {
          id: 'product-note',
          title: '产品与笔记',
          subtitle: '标签管理、批量上下架、产品清理等',
          double: true,
          trailing: 'dot-arrow',
          dot: true
        },
        {
          id: 'search-share',
          title: '搜索与分享',
          subtitle: '分享设置、以图搜图、开启搜索码等',
          double: true,
          trailing: 'arrow'
        },
        {
          id: 'fan-setting',
          title: '粉丝设置',
          subtitle: '设置粉丝资料、生命周期、标签等',
          double: true,
          trailing: 'arrow'
        },
        {
          id: 'team-staff',
          title: '团队与员工',
          subtitle: '员工业绩归属模式',
          double: true,
          trailing: 'arrow'
        },
        {
          id: 'trade-setting',
          title: '交易设置',
          double: false,
          trailing: 'arrow'
        },
        {
          id: 'chat-notify',
          title: '聊天与通知',
          double: false,
          trailing: 'arrow'
        }
      ]
    },
    {
      group: 'system',
      items: [
        {
          id: 'security-center',
          title: '安全中心',
          double: false,
          trailing: 'arrow'
        },
        {
          id: 'about',
          title: '关于',
          double: false,
          trailing: 'arrow',
          last: true
        }
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

  function trailingMarkup(item) {
    if (item.trailing === 'text-arrow') {
      return ''
        + '<span class="cell__action-text">' + esc(item.actionText || '') + '</span>'
        + '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>';
    }
    if (item.trailing === 'dot-arrow') {
      return ''
        + '<span class="badge badge--inline badge--dot" aria-hidden="true"></span>'
        + '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>';
    }
    return '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>';
  }

  function cellMarkup(item, isLastInGroup) {
    var density = item.double ? 'cell--double' : 'cell--single';
    var divider = isLastInGroup ? '' : ' cell--divider-right-edge';
    var subtitle = item.subtitle
      ? '<div class="cell__subtitle">' + esc(item.subtitle) + '</div>'
      : '';
    return ''
      + '<button type="button" class="cell ' + density + ' cell--bg-white cell--clickable' + divider + '" data-entry-id="' + esc(item.id) + '" role="button">'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + esc(item.title) + '</span></div>'
      +       subtitle
      +     '</div>'
      +     '<div class="cell__action">'
      +       trailingMarkup(item)
      +     '</div>'
      +   '</div>'
      + '</button>';
  }

  function groupMarkup(group) {
    var total = group.items.length;
    var rows = group.items.map(function (item, idx) {
      return cellMarkup(item, idx === total - 1);
    }).join('');
    return ''
      + '<div class="cell-group">'
      +   '<div class="cell-group__content">'
      +     rows
      +   '</div>'
      + '</div>';
  }

  function pageTemplate() {
    var groups = ENTRIES.map(function (g) { return groupMarkup(g); }).join('');
    return ''
      + '<section class="system-settings-page" data-bg="page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<div class="navbar__left-btn" data-action="back" role="button" aria-label="返回"><i class="wego-iconfont-s icon-fanhui"></i></div>'
      +       '</div>'
      +       '<div class="navbar__center">'
      +         '<span class="navbar__title">设置</span>'
      +       '</div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="system-settings-body">'
      +     groups
      +     '<div class="system-settings-logout">'
      +       '<button type="button" class="btn btn--medium btn--md system-settings-logout__btn" data-action="logout">退出登录</button>'
      +     '</div>'
      +     '<div class="system-settings-service">'
      +       '<button type="button" class="link link--default" data-action="service">客服教我</button>'
      +     '</div>'
      +   '</div>'
      + '</section>';
  }

  window.WegoApp.registerScene({
    routeId: 'my-system-settings',
    title: '系统设置',
    presentation: {
      type: 'push',
      transition: 'slide-left',
      coversTabBar: true
    },
    template: '',
    init: function (ctx) {
      function render() {
        ctx.root.innerHTML = pageTemplate();
        bindInteractions();
      }

      function bindInteractions() {
        var root = ctx.root;

        var backBtn = root.querySelector('[data-action="back"]');
        if (backBtn) {
          backBtn.addEventListener('click', function () {
            ctx.back();
          });
        }

        root.querySelectorAll('[data-entry-id]').forEach(function (row) {
          row.addEventListener('click', function () {
            var id = row.dataset.entryId;
            if (id === 'product-note') {
              ctx.navigate('my-product-note');
              return;
            }
            ctx.toast('该功能尚未接入原型');
          });
        });

        var logoutBtn = root.querySelector('[data-action="logout"]');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', function () {
            ctx.toast('退出登录');
          });
        }

        var serviceBtn = root.querySelector('[data-action="service"]');
        if (serviceBtn) {
          serviceBtn.addEventListener('click', function () {
            // 引导 toast 示例：带查询图标 + weak 操作按钮（自动追加右箭头）
            ctx.toast({
              variant: 'guide',
              icon: 'icon-chatoast',
              text: '正在为您接通客服，是否继续？',
              action: { label: '继续', mode: 'weak' },
              onAction: function () {
                ctx.toast('已为您接入客服，请稍候');
              }
            });
          });
        }
      }

      render();
    }
  });
})();
