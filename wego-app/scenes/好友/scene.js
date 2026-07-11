(function () {
  var STORAGE_KEY = 'wego-friends-data';

  var SEED_FRIENDS = [
    { id: 'f001', name: '陈雅琴', nickname: '雅琴', shopName: '雅琴女装铺', avatar: '', relationType: '粉丝与客户', isVip: true, isVerified: true, newProductCount: 12, totalProductCount: 86, addedAt: 1 },
    { id: 'f002', name: '林志远', nickname: '志远', shopName: '志远数码', avatar: '', relationType: '帮卖代理', isVip: false, isVerified: true, newProductCount: 5, totalProductCount: 42, addedAt: 2 },
    { id: 'f003', name: '王淑芬', nickname: '芬姐', shopName: '芬姐美妆', avatar: '', relationType: '供应商', isVip: true, isVerified: false, newProductCount: 0, totalProductCount: 128, addedAt: 3 },
    { id: 'f004', name: '赵明辉', nickname: '老赵', shopName: '老赵百货', avatar: '', relationType: '推广员', isVip: false, isVerified: false, newProductCount: 8, totalProductCount: 56, addedAt: 4 },
    { id: 'f005', name: '黄丽华', nickname: '丽华', shopName: '丽华童装', avatar: '', relationType: '粉丝与客户', isVip: true, isVerified: true, newProductCount: 3, totalProductCount: 34, addedAt: 5 },
    { id: 'f006', name: '吴俊杰', nickname: '杰哥', shopName: '杰哥潮鞋', avatar: '', relationType: '帮卖代理', isVip: false, isVerified: true, newProductCount: 15, totalProductCount: 72, addedAt: 6 },
    { id: 'f007', name: '张秀英', nickname: '秀英', shopName: '秀英家纺', avatar: '', relationType: '供应商', isVip: false, isVerified: false, newProductCount: 0, totalProductCount: 95, addedAt: 7 },
    { id: 'f008', name: '刘文斌', nickname: '文斌', shopName: '文斌零食', avatar: '', relationType: '粉丝与客户', isVip: true, isVerified: true, newProductCount: 7, totalProductCount: 48, addedAt: 8 }
  ];

  var SORT_MODES = {
    ADDED: 'added',
    ALPHA: 'alpha'
  };

  var SORT_LABELS = {
    added: '按新增顺序',
    alpha: '按字母排序'
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadFriends() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // 读取失败，回退到种子数据
    }
    saveFriends(SEED_FRIENDS);
    return SEED_FRIENDS.slice();
  }

  function saveFriends(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      // 持久化失败，静默处理
    }
  }

  function sortFriends(list, mode) {
    var copy = list.slice();
    if (mode === SORT_MODES.ALPHA) {
      copy.sort(function (a, b) {
        return a.name.localeCompare(b.name, 'zh-Hans-CN');
      });
    } else {
      copy.sort(function (a, b) {
        return a.addedAt - b.addedAt;
      });
    }
    return copy;
  }

  function filterFriends(list, keyword) {
    if (!keyword) return list;
    var kw = keyword.trim().toLowerCase();
    if (!kw) return list;
    return list.filter(function (item) {
      return (
        (item.name && item.name.toLowerCase().indexOf(kw) !== -1) ||
        (item.nickname && item.nickname.toLowerCase().indexOf(kw) !== -1) ||
        (item.shopName && item.shopName.toLowerCase().indexOf(kw) !== -1)
      );
    });
  }

  function relationTag(item) {
    if (!item.relationType) return '';
    return '<span class="tag tag--20 tag--white"><span class="tag__label">' + esc(item.relationType) + '</span></span>';
  }

  function statusTags(item) {
    var tags = '';
    if (item.isVip) {
      tags += '<span class="tag tag--20 tag--brand"><span class="tag__label">VIP</span></span>';
    }
    if (item.isVerified) {
      tags += '<span class="tag tag--20 tag--brand-stroke"><span class="tag__label">已认证</span></span>';
    }
    return tags;
  }

  function friendCell(item, isLast) {
    var dividerClass = isLast ? '' : ' cell--divider-right-edge';
    var subtitle = '上新 ' + item.newProductCount + ' 件 · 共 ' + item.totalProductCount + ' 件';
    var tags = statusTags(item);

    return ''
      + '<div class="cell cell--double cell--bg-white' + dividerClass + '" data-friend-id="' + esc(item.id) + '">'
      +   '<div class="cell__avatar"><div class="avatar avatar--40 avatar--image">'
      +     '<img src="./lib/image/avatar-defult.png" alt="' + esc(item.name) + '">'
      +   '</div></div>'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row">'
      +         '<span class="cell__title">' + esc(item.name) + '</span>'
      +         tags
      +       '</div>'
      +       '<div class="cell__subtitle">' + esc(subtitle) + '</div>'
      +     '</div>'
      +     '<div class="cell__action">'
      +       relationTag(item)
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function friendsListMarkup(list) {
    if (list.length === 0) return '';
    var cells = list.map(function (item, index) {
      return friendCell(item, index === list.length - 1);
    }).join('');
    return ''
      + '<div class="cell-group friends-list__group">'
      +   '<div class="cell-group__content">' + cells + '</div>'
      + '</div>';
  }

  function emptyStateMarkup(hasFriends, keyword) {
    if (keyword && hasFriends) {
      return ''
        + '<div class="friends-empty" data-content-id="search-empty">'
        +   '<p class="friends-empty__text">无搜索结果</p>'
        + '</div>';
    }
    return ''
      + '<div class="friends-empty" data-content-id="no-friends">'
      +   '<p class="friends-empty__text">暂无好友</p>'
      + '</div>';
  }

  function friendsTemplate() {
    return ''
      + '<div class="friends-page" data-bg="page" data-surface-id="friends-home-main">'
      +   '<div class="navbar" data-bg="page">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__center"><span class="navbar__title">好友</span></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="friends-search" data-content-id="friends-search">'
      +       '<div class="searchbox searchbox--md searchbox--gray">'
      +         '<span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>'
      +         '<div class="searchbox__input">'
      +           '<input class="searchbox__field" type="search" placeholder="搜索好友" aria-label="搜索好友" data-search-input>'
      +         '</div>'
      +         '<div class="searchbox__actions"></div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="friends-sortbar" data-content-id="friends-sortbar">'
      +       '<span class="friends-sortbar__count" data-friend-count></span>'
      +       '<a class="link link--standalone link--12" href="javascript:void(0)" data-sort-toggle>'
      +         '<span data-sort-label>' + esc(SORT_LABELS.added) + '</span>'
      +       '</a>'
      +     '</div>'
      +     '<div class="friends-list" data-content-id="friends-list"></div>'
      + '</div>';
  }

  function bindFriends(ctx) {
    var root = ctx.root;
    var allFriends = loadFriends();
    var sortMode = SORT_MODES.ADDED;
    var keyword = '';

    var searchInput = root.querySelector('[data-search-input]');
    var sortToggle = root.querySelector('[data-sort-toggle]');
    var sortLabel = root.querySelector('[data-sort-label]');
    var countEl = root.querySelector('[data-friend-count]');
    var listEl = root.querySelector('[data-content-id="friends-list"]');

    function updateCount(filtered) {
      if (keyword) {
        countEl.textContent = '搜索到 ' + filtered + ' 个好友';
      } else {
        countEl.textContent = '';
      }
    }

    function render() {
      var sorted = sortFriends(allFriends, sortMode);
      var filtered = filterFriends(sorted, keyword);
      var hasFriends = allFriends.length > 0;

      if (filtered.length > 0) {
        listEl.innerHTML = friendsListMarkup(filtered);
      } else {
        listEl.innerHTML = emptyStateMarkup(hasFriends, keyword);
      }
      updateCount(filtered.length);
    }

    function setSearchPlaceholder() {
      searchInput.placeholder = '搜索 ' + allFriends.length + ' 个好友';
    }

    setSearchPlaceholder();
    render();

    searchInput.addEventListener('input', function () {
      keyword = searchInput.value;
      render();
    });

    sortToggle.addEventListener('click', function () {
      sortMode = sortMode === SORT_MODES.ADDED ? SORT_MODES.ALPHA : SORT_MODES.ADDED;
      sortLabel.textContent = SORT_LABELS[sortMode];
      render();
    });
  }

  window.WegoApp.registerScene({
    routeId: 'friends',
    title: '好友',
    presentation: {
      type: 'host-tab',
      transition: 'none',
      coversTabBar: false
    },
    template: friendsTemplate(),
    init: bindFriends
  });
})();
