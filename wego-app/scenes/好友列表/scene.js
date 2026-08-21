/* wego-design-contract:
{
  "surface_id": "friend-list",
  "route_id": "friend-list",
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
    "design_system_version": 416,
    "token_bindings": [
      { "selector": ".friend-list", "content_role": "页面背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".friend-list", "content_role": "页面文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".friend-list", "content_role": "页面字体", "css_property": "font-family", "token": "var(--body-md-font-family)" },
      { "selector": ".friend-list", "content_role": "页面边距", "css_property": "padding-inline", "token": "var(--layout-page-margin-m0)" },
      { "selector": ".friend-list__navbar", "content_role": "导航栏背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".friend-list__search", "content_role": "搜索区背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".friend-list__search", "content_role": "搜索区留白", "css_property": "padding", "token": "var(--spacer-8)" },
      { "selector": ".friend-list__scroll", "content_role": "列表底部留白", "css_property": "padding-bottom", "token": "var(--spacer-24)" },
      { "selector": ".friend-list__group-title", "content_role": "分组标题顶部留白", "css_property": "padding-top", "token": "var(--spacer-16)" },
      { "selector": ".friend-list__group-title", "content_role": "分组标题横向留白", "css_property": "padding-inline", "token": "var(--spacer-16)" },
      { "selector": ".friend-list__group-title", "content_role": "分组标题底部留白", "css_property": "padding-bottom", "token": "var(--spacer-8)" },
      { "selector": ".friend-list__group-title", "content_role": "分组标题字号", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".friend-list__group-title", "content_role": "分组标题字重", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".friend-list__group-title", "content_role": "分组标题行高", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".friend-list__group-title", "content_role": "分组标题颜色", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".friend-list__meta", "content_role": "好友元信息间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".friend-list__meta", "content_role": "好友元信息上间距", "css_property": "margin-top", "token": "var(--spacer-4)" },
      { "selector": ".friend-list__meta-text", "content_role": "好友元信息字号", "css_property": "font-size", "token": "var(--body-sm-font-size)" },
      { "selector": ".friend-list__meta-text", "content_role": "好友元信息行高", "css_property": "line-height", "token": "var(--body-sm-line-height)" },
      { "selector": ".friend-list__meta-text", "content_role": "好友元信息颜色", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".friend-list__new-count", "content_role": "上新数量颜色", "css_property": "color", "token": "var(--text-brand)" },
      { "selector": ".friend-list__index", "content_role": "索引区背景", "css_property": "background", "token": "var(--bg-surface)" },
      { "selector": ".friend-list__index", "content_role": "索引区圆角", "css_property": "border-radius", "token": "var(--radius-12)" },
      { "selector": ".friend-list__index", "content_role": "索引区间距", "css_property": "gap", "token": "var(--spacer-4)" },
      { "selector": ".friend-list__index", "content_role": "索引区纵向留白", "css_property": "padding-block", "token": "var(--spacer-8)" },
      { "selector": ".friend-list__index", "content_role": "索引区横向留白", "css_property": "padding-inline", "token": "var(--spacer-4)" },
      { "selector": ".friend-list__index", "content_role": "索引区阴影", "css_property": "box-shadow", "token": "var(--shadow-xs)" },
      { "selector": ".friend-list__index", "content_role": "索引区层级", "css_property": "z-index", "token": "var(--z-sticky)" },
      { "selector": ".friend-list__index-item", "content_role": "索引项字号", "css_property": "font-size", "token": "var(--body-xs-font-size)" },
      { "selector": ".friend-list__index-item", "content_role": "索引项行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".friend-list__index-item", "content_role": "索引项颜色", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".friend-list__index-item", "content_role": "索引项最小宽高", "css_property": "min-width", "token": "var(--size-20)" },
      { "selector": ".friend-list__index-item", "content_role": "索引项留白", "css_property": "padding", "token": "var(--spacer-4)" },
      { "selector": ".friend-list__index-item", "content_role": "索引项圆角", "css_property": "border-radius", "token": "var(--radius-6)" },
      { "selector": ".friend-list__index-item:active", "content_role": "索引项按压背景", "css_property": "background", "token": "var(--bg-state-pressed)" },
      { "selector": ".friend-list__index-item.is-pressed", "content_role": "索引项按压背景", "css_property": "background", "token": "var(--bg-state-pressed)" },
      { "selector": ".friend-list__index-item--active", "content_role": "索引项激活背景", "css_property": "background", "token": "var(--bg-state-pressed)" },
      { "selector": ".friend-list__index-item--active", "content_role": "索引项激活颜色", "css_property": "color", "token": "var(--text-brand)" },
      { "selector": ".friend-list__index-item--active", "content_role": "索引项激活字重", "css_property": "font-weight", "token": "var(--font-weight-medium)" },
      { "selector": ".friend-list__empty", "content_role": "空状态留白", "css_property": "padding", "token": "var(--spacer-24)" },
      { "selector": ".friend-list__empty", "content_role": "空状态间距", "css_property": "gap", "token": "var(--spacer-8)" },
      { "selector": ".friend-list__empty-icon", "content_role": "空状态图标字号", "css_property": "font-size", "token": "var(--size-48)" },
      { "selector": ".friend-list__empty-icon", "content_role": "空状态图标行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".friend-list__empty-icon", "content_role": "空状态图标颜色", "css_property": "color", "token": "var(--text-disabled)" },
      { "selector": ".friend-list__empty-text", "content_role": "空状态文字颜色", "css_property": "color", "token": "var(--text-tertiary)" },
      { "selector": ".friend-list__empty-text", "content_role": "空状态文字字号", "css_property": "font-size", "token": "var(--body-md-font-size)" },
      { "selector": ".friend-list__empty-text", "content_role": "空状态文字行高", "css_property": "line-height", "token": "var(--body-md-line-height)" },
      { "selector": ".friend-add-form", "content_role": "表单页背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".friend-add-form", "content_role": "表单页文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".friend-add-form", "content_role": "表单页字体", "css_property": "font-family", "token": "var(--body-md-font-family)" },
      { "selector": ".friend-add-form__body", "content_role": "表单内容底部留白", "css_property": "padding-bottom", "token": "var(--spacer-24)" }
    ],
    "component_bindings": [
      { "binding_id": "friend-navbar", "slug": "navbar", "reason": "承载好友页面左对齐大标题、新建好友与排序切换入口", "variant_dimensions": { "leftControl": "none", "titleAlignment": "left-wide", "actions": "icon", "rightActionType": "icon", "spacing": "default", "pageTransition": "push", "position": "sticky" } },
      { "binding_id": "friend-search", "slug": "search", "reason": "提供好友昵称搜索入口，白底搜索框放在灰底页面上", "variant_dimensions": { "size": "md", "surface": "white", "mode": "text", "state": "empty", "hostPattern": "inline" } }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "好友列表以连续浏览为主，采用通栏白底行减少阅读中断；搜索固定在顶部，索引固定悬浮在右侧中间。",
      "page_edge_mode": "M0",
      "mutable_regions": [".friend-list__scroll", ".friend-list__group", ".friend-list__index"]
    },
    "interaction_contract": [
      { "dom_id": "sort-toggle", "target": "state:sort-by-letter" },
      { "dom_id": "friend-search-input", "target": "state:searching" },
      { "dom_id": "add-friend-entry", "target": "overlay:full-screen-modal" }
    ],
    "state_contract": [
      { "state_id": "list-ready", "initial": true, "trigger": "进入好友主 tab", "visible_result": "默认字母排序展示好友列表，右侧悬浮字母索引", "fallback": "保留当前可浏览的好友列表", "persistence": "memory" },
      { "state_id": "sort-by-letter", "initial": false, "trigger": "点击导航栏右侧排序切换（目标为字母）", "visible_result": "按拼音首字母 A-Z + # 分组，右侧索引显示字母", "fallback": "保持当前排序", "persistence": "memory" },
      { "state_id": "sort-by-group", "initial": false, "trigger": "点击导航栏右侧排序切换（目标为分组）", "visible_result": "按自定义分组聚合，组内按拼音排序，右侧索引显示分组名", "fallback": "保持当前排序", "persistence": "memory" },
      { "state_id": "searching", "initial": false, "trigger": "在搜索框输入关键词", "visible_result": "实时过滤匹配昵称的好友，隐藏分组标题与索引", "fallback": "清空关键词回到列表", "persistence": "memory" },
      { "state_id": "search-empty", "initial": false, "trigger": "搜索无匹配结果", "visible_result": "展示搜索无结果空状态", "fallback": "清空关键词回到列表", "persistence": "memory" },
      { "state_id": "add-form", "initial": false, "trigger": "点击导航栏右侧新建好友入口", "visible_result": "打开添加好友全屏表单", "fallback": "取消关闭表单", "persistence": "memory" },
      { "state_id": "submit-success", "initial": false, "trigger": "提交添加好友表单", "visible_result": "关闭表单，显示成功 toast，列表新增好友", "fallback": "回到列表", "persistence": "memory" }
    ]
  },
  "visual_check": {
    "status": "passed",
    "viewports": [375, 393],
    "checked_at": "2026-07-17T02:30:00.000Z",
    "scope": "好友列表主页 + 新建好友全屏模态表单层",
    "checks": { "horizontal_overflow": true, "overlap": true, "clipping": true, "action_legibility": true, "primary_focus": true, "state_feedback": true }
  }
}
*/

/* 好友列表场景 */

/* ── 数据源（取自原型数据库 + localStorage 落盘）── */
var PROTOTYPE_DB = window.WEGO_PROTOTYPE_DB || {};
var FRIEND_GROUPS = (PROTOTYPE_DB.friendGroups || []).slice();

/* FriendStore：好友数据的 localStorage 持久层
   不预载任何初始好友数据：首次进入且无 localStorage 记录时为空列表，
   进入默认空状态；好友数据一律由添加好友表单真实创建后写入 localStorage，刷新保留。 */
var FRIEND_STORE_KEY = 'wego.friend-list.friends';
var FriendStore = (function () {
  function load() {
    try {
      var raw = window.localStorage.getItem(FRIEND_STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* 解析失败回退空列表 */ }
    return [];
  }
  function save(list) {
    try {
      window.localStorage.setItem(FRIEND_STORE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  }
  return { load: load, save: save };
})();

var FRIENDS_DATA = FriendStore.load();

/* ── 工具函数 ── */
function getGroupName(groupId) {
  var g = FRIEND_GROUPS.find(function (x) { return x.group_id === groupId; });
  return g ? g.group_name : '未分组';
}

function buildLetterGroups(friends) {
  var starred = friends.filter(function (f) {
    return (f.statuses || []).indexOf('starred') !== -1;
  }).slice().sort(function (a, b) {
    return a.nickname < b.nickname ? -1 : a.nickname > b.nickname ? 1 : 0;
  });
  var rest = friends.filter(function (f) {
    return (f.statuses || []).indexOf('starred') === -1;
  });
  var map = {};
  rest.forEach(function (f) {
    var key = f.py_initial || '#';
    if (!map[key]) map[key] = [];
    map[key].push(f);
  });
  var keys = Object.keys(map).sort(function (a, b) {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a < b ? -1 : 1;
  });
  var groups = keys.map(function (k) {
    var items = map[k].slice().sort(function (a, b) {
      return a.nickname < b.nickname ? -1 : a.nickname > b.nickname ? 1 : 0;
    });
    return { key: k, friends: items };
  });
  if (starred.length > 0) {
    groups.unshift({ key: '__star__', label: '星标', friends: starred });
  }
  return groups;
}

function buildCustomGroups(friends) {
  var map = {};
  FRIEND_GROUPS.forEach(function (g) { map[g.group_id] = []; });
  friends.forEach(function (f) {
    if (!map[f.group_id]) map[f.group_id] = [];
    map[f.group_id].push(f);
  });
  return FRIEND_GROUPS.map(function (g) {
    var items = (map[g.group_id] || []).slice().sort(function (a, b) {
      return a.nickname < b.nickname ? -1 : a.nickname > b.nickname ? 1 : 0;
    });
    return { key: g.group_id, label: g.group_name, friends: items };
  }).filter(function (grp) { return grp.friends.length > 0; });
}

function searchFriends(keyword) {
  var kw = (keyword || '').trim().toLowerCase();
  if (!kw) return FRIENDS_DATA.slice();
  return FRIENDS_DATA.filter(function (f) {
    return f.nickname.toLowerCase().indexOf(kw) !== -1;
  });
}

/* ── 模板函数 ── */
function escapeHtml(str) {
  return String(str).replace(new RegExp("[&<>\"']", 'g'), function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}

function highlightNickname(nickname, keyword) {
  var safeName = escapeHtml(nickname);
  var kw = (keyword || '').trim();
  if (!kw) return safeName;
  var safeKw = escapeHtml(kw);
  var escapedKw = safeKw.replace(new RegExp("[.*+?^${}()|[\\]\\\\]", 'g'), '\\$&');
  return safeName.replace(new RegExp('(' + escapedKw + ')', 'gi'), '<span class="friend-list__match">$1</span>');
}

function friendCellTemplate(friend, bindingId, keyword) {
  var newCountHtml = friend.new_count > 0
    ? '<span class="friend-list__meta-text friend-list__new-count">上新 ' + friend.new_count + '</span>'
    : '';
  var nameHtml = keyword ? highlightNickname(friend.nickname, keyword) : escapeHtml(friend.nickname);
  return ''
    + '<div class="cell cell--double cell--bg-white cell--clickable" data-component-slug="cell" data-friend-id="' + friend.friend_id + '">'
    +   '<div class="cell__avatar">'
    +     '<div class="avatar avatar--40 avatar--image" data-dd-id="friend-avatar-' + friend.friend_id + '" data-component-slug="avatar" data-component-binding="' + bindingId + '">'
    +       '<img src="' + friend.avatar + '" alt="' + escapeHtml(friend.nickname) + '">'
    +     '</div>'
    +   '</div>'
    +   '<div class="cell__body">'
    +     '<div class="cell__content">'
    +       '<div class="cell__title-row"><span class="cell__title">' + nameHtml + '</span></div>'
    +       '<div class="friend-list__meta">'
    +         newCountHtml
    +         '<span class="friend-list__meta-text">产品 ' + friend.product_total + '</span>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';
}

function letterGroupTemplate(group, cellBindingId, avatarBindingId) {
  var titleHtml = group.key === '__star__'
    ? '<i class="wego-iconfont-s icon-wujiaoxing friend-list__group-star"></i>星标好友'
    : group.key;
  return ''
    + '<div class="cell-group friend-list__group" data-group-key="' + group.key + '">'
    +   '<div class="friend-list__group-title">' + titleHtml + '</div>'
    +   '<div class="cell-group__content">'
    +     group.friends.map(function (f) { return friendCellTemplate(f, avatarBindingId); }).join('')
    +   '</div>'
    + '</div>';
}

function customGroupTemplate(group, cellBindingId, avatarBindingId) {
  return ''
    + '<div class="cell-group friend-list__group" data-group-key="' + group.key + '">'
    +   '<div class="friend-list__group-title">' + group.label + '</div>'
    +   '<div class="cell-group__content">'
    +     group.friends.map(function (f) { return friendCellTemplate(f, avatarBindingId); }).join('')
    +   '</div>'
    + '</div>';
}

function indexTemplate(items) {
  return items.map(function (item) {
    if (item.key === '__star__') {
      return '<button type="button" class="friend-list__index-item friend-list__index-item--star" data-index-key="__star__"><i class="wego-iconfont-s icon-wujiaoxing"></i></button>';
    }
    return '<button type="button" class="friend-list__index-item" data-index-key="' + item.key + '">' + item.label + '</button>';
  }).join('');
}

function emptyTemplate(text) {
  return ''
    + '<div class="friend-list__empty">'
    +   '<div class="friend-list__empty-icon wego-iconfont-s icon-kongzhuangtai"></div>'
    +   '<p class="friend-list__empty-text">' + text + '</p>'
    +   '<button type="button" class="btn btn--strong friend-list__empty-action" data-dom-id="empty-add-friend" data-component-slug="button">新建好友</button>'
    + '</div>';
}

/* ── 添加好友表单模板 ── */
function addFriendFormTemplate() {
  return ''
    + '<div class="modal modal--fullscreen" data-component-slug="modal" data-state="open" role="dialog" aria-modal="true" aria-label="添加好友">'
    +   '<div class="modal__panel">'
    +     '<div class="modal__title modal__title--default">'
    +       '<div class="navbar" data-component-slug="navbar">'
    +         '<div class="navbar__body navbar__body--spaced">'
    +           '<div class="navbar__left"><button type="button" class="navbar__left-text" data-dom-id="close-add-form" data-close-add-form>取消</button></div>'
    +           '<div class="navbar__center"><span class="navbar__title">添加好友</span></div>'
    +           '<div class="navbar__right navbar__right--button">'
    +             '<div class="navbar__action navbar__action--button">'
    +               '<button type="button" class="btn btn--strong btn--sm" data-component-slug="button" data-dom-id="submit-add-friend">保存</button>'
    +             '</div>'
    +           '</div>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="modal__body modal__body--safe-bottom">'
    +     '<div class="form-group">'
    +       '<div class="form-group__title">基本信息</div>'
    +       '<div class="form-group__content">'
    +         '<div class="form-body" data-component-slug="form">'
    +           '<div class="form-body__label form-body__label--required"><span class="form-body__label-text">头像</span><span class="form-body__required">*</span></div>'
    +           '<div class="form-body__action">'
    +             '<div class="form-body__upload" data-upload-avatar>'
    +               '<div class="form-body__upload-icon wego-iconfont-s icon-jia16"></div>'
    +               '<span class="form-body__upload-text">上传</span>'
    +             '</div>'
    +           '</div>'
    +         '</div>'
    +         '<div class="form-body" data-component-slug="form">'
    +           '<div class="form-body__label form-body__label--required"><span class="form-body__label-text">昵称</span><span class="form-body__required">*</span></div>'
    +           '<div class="form-body__action"><input type="text" placeholder="请输入好友昵称" data-form-field="nickname" maxlength="20" /></div>'
    +         '</div>'
    +         '<div class="form-body" data-component-slug="form">'
    +           '<div class="form-body__label"><span class="form-body__label-text">账号/手机号</span></div>'
    +           '<div class="form-body__action">'
    +             '<div class="form-body__phone">'
    +               '<span class="form-body__phone-prefix">+86</span>'
    +               '<span class="form-body__phone-divider"></span>'
    +               '<input class="form-body__phone-input" type="tel" placeholder="请输入账号或手机号" data-form-field="account_or_phone" />'
    +             '</div>'
    +           '</div>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="form-group">'
    +       '<div class="form-group__title">分组与标签</div>'
    +       '<div class="form-group__content">'
    +         '<div class="form-body" data-component-slug="form">'
    +           '<div class="form-body__label"><span class="form-body__label-text">分组</span></div>'
    +           '<div class="form-body__action">'
    +             '<div class="form-body__select" data-dom-id="select-friend-group">'
    +               '<span class="form-body__select-text" data-group-select-text>请选择分组</span>'
    +               '<span class="form-body__select-arrow wego-iconfont-s icon-xiajiantou16"></span>'
    +             '</div>'
    +           '</div>'
    +         '</div>'
    +         '<div class="form-body" data-component-slug="form">'
    +           '<div class="form-body__label"><span class="form-body__label-text">标签</span></div>'
    +           '<div class="form-body__action"><input type="text" placeholder="多个标签用逗号分隔" data-form-field="tags" /></div>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="form-group">'
    +       '<div class="form-group__title">来源与验证</div>'
    +       '<div class="form-group__content">'
    +         '<div class="form-body" data-component-slug="form">'
    +           '<div class="form-body__label"><span class="form-body__label-text">来源渠道</span></div>'
    +           '<div class="form-body__action">'
    +             '<div class="form-body__select" data-source-select>'
    +               '<span class="form-body__select-text" data-source-select-text>请选择来源</span>'
    +               '<span class="form-body__select-arrow wego-iconfont-s icon-xiajiantou16"></span>'
    +             '</div>'
    +           '</div>'
    +         '</div>'
    +         '<div class="form-body" data-component-slug="form">'
    +           '<div class="form-body__label"><span class="form-body__label-text">备注</span></div>'
    +           '<div class="form-body__action"><input type="text" placeholder="添加备注信息" data-form-field="remark" maxlength="50" /></div>'
    +         '</div>'
    +         '<div class="form-body form-body--align-top" data-component-slug="form">'
    +           '<div class="form-body__label"><span class="form-body__label-text">验证消息</span></div>'
    +           '<div class="form-body__action"><textarea placeholder="发送给好友的验证消息" data-form-field="verify_message"></textarea></div>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';
}

/* ── 长按删除操作面板 actionsheet 模板 ── */
function friendActionSheetTemplate(friendName) {
  return ''
    + '<div class="actionsheet actionsheet--action" role="dialog" aria-modal="true" data-component-slug="actionsheet">'
    +   '<div class="actionsheet__panel">'
    +     '<div class="actionsheet__header actionsheet__header--text"><span class="actionsheet__header-text">' + escapeHtml(friendName) + '</span></div>'
    +     '<div class="actionsheet__list">'
    +       '<button type="button" class="actionsheet__item" data-component-slug="actionsheet-item" data-delete-friend>'
    +         '<i class="wego-iconfont-s icon-shanchu actionsheet__item-icon" aria-hidden="true"></i>'
    +         '<div class="actionsheet__item-main">'
    +           '<div class="actionsheet__item-title">删除该好友</div>'
    +           '<div class="actionsheet__item-subtitle">删除后无法恢复</div>'
    +         '</div>'
    +       '</button>'
    +     '</div>'
    +     '<div class="actionsheet__cancel-gap"></div>'
    +     '<button type="button" class="actionsheet__cancel" data-close-action-sheet>取 消</button>'
    +   '</div>'
    + '</div>';
}

/* ── 分组选择 actionsheet 模板 ── */
function groupSelectTemplate(selectedId) {
  var items = FRIEND_GROUPS.map(function (g) {
    var selected = g.group_id === selectedId ? ' actionsheet__item--selected' : '';
    return ''
      + '<button type="button" class="actionsheet__item' + selected + '" data-select-group="' + g.group_id + '">'
      +   '<div class="actionsheet__item-row">'
      +     '<div class="actionsheet__item-main"><span class="actionsheet__item-title">' + g.group_name + '</span></div>'
      +     '<i class="wego-iconfont-s icon-gou-jiacu actionsheet__item-check"></i>'
      +   '</div>'
      +   '<div class="actionsheet__item-check-slot"></div>'
      + '</button>';
  }).join('');
  return ''
    + '<div class="actionsheet__panel">'
    +   '<div class="actionsheet__header actionsheet__header--text"><span class="actionsheet__header-text">选择分组</span></div>'
    +   '<div class="actionsheet__list">' + items + '</div>'
    +   '<div class="actionsheet__cancel-gap"></div>'
    +   '<button type="button" class="actionsheet__cancel" data-dom-id="close-group-sheet" data-close-group-sheet>取 消</button>'
    + '</div>';
}

function sourceSelectTemplate() {
  var sources = ['搜索导入', '名片扫码', '群聊添加', '手机通讯录', '手动输入'];
  var items = sources.map(function (s) {
    return ''
      + '<button type="button" class="actionsheet__item" data-select-source="' + s + '">'
      +   '<div class="actionsheet__item-main"><span class="actionsheet__item-title">' + s + '</span></div>'
      + '</button>';
  }).join('');
  return ''
    + '<div class="actionsheet__panel">'
    +   '<div class="actionsheet__header actionsheet__header--text"><span class="actionsheet__header-text">选择来源</span></div>'
    +   '<div class="actionsheet__list">' + items + '</div>'
    +   '<div class="actionsheet__cancel-gap"></div>'
    +   '<button type="button" class="actionsheet__cancel" data-dom-id="close-source-sheet" data-close-source-sheet>取 消</button>'
    + '</div>';
}

/* ── 场景模板 ── */
const friendListTemplate = `
  <section class="friend-list" data-surface-id="friend-list" data-route-id="friend-list" data-route-bound="true" data-layout-mode="composed" data-bg="page">
    <div class="navbar friend-list__navbar" data-dd-id="friend-navbar" data-component-slug="navbar" data-component-binding="friend-navbar">
      <div class="navbar__body">
        <div class="navbar__left"></div>
        <div class="navbar__center navbar__center--wide"><span class="navbar__title">好友</span></div>
        <div class="navbar__right navbar__right--wide navbar__right--icon">
          <div class="navbar__action" data-dom-id="add-friend-entry">
            <div class="navbar__action-icon"><i class="wego-iconfont-s icon-yuanjia"></i></div>
            <span class="navbar__action-label">新建</span>
          </div>
          <div class="navbar__action" data-dom-id="sort-toggle">
            <div class="navbar__action-icon"><i class="wego-iconfont-s icon-paixu"></i></div>
            <span class="navbar__action-label" data-sort-label>分组</span>
          </div>
        </div>
      </div>
    </div>
    <div class="sticky-region friend-list__search-sticky" data-component-slug="sticky-region" data-component-binding="friend-search-sticky" data-edge="top" data-visibility="direction-reveal" data-state="visible">
      <div class="sticky-region__motion">
        <div class="sticky-region__inner">
          <div class="friend-list__search">
            <div class="searchbox searchbox--md searchbox--white" data-friend-search data-dd-id="friend-search" data-component-slug="search" data-component-binding="friend-search">
              <span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>
              <div class="searchbox__input">
                <input class="searchbox__field" type="search" placeholder="搜索好友昵称" data-dom-id="friend-search-input" />
              </div>
              <div class="searchbox__actions"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="friend-list__scroll" data-friend-scroll data-tab-scroll></div>
    <div class="friend-list__index" data-friend-index data-surface-transparent hidden></div>
  </section>
`;

/* ── 注册场景 ── */
window.WegoApp.registerScene({
  routeId: 'friend-list',
  title: '好友',
  template: friendListTemplate,
  presentation: { type: 'host-tab', transition: 'none', dismissAction: 'tab-switch', overlayLevel: 'inline', coversTabBar: false },
  init: function initFriendList(ctx) {
    var root = ctx.root;
    var scrollEl = root.querySelector('[data-friend-scroll]');
    var indexEl = root.querySelector('[data-friend-index]');
    var sortToggleBtn = root.querySelector('[data-dom-id="sort-toggle"]');
    var sortLabel = root.querySelector('[data-sort-label]');
    var searchInput = root.querySelector('[data-dom-id="friend-search-input"]');
    var searchActions = root.querySelector('[data-friend-search] .searchbox__actions');
    var addBtn = root.querySelector('[data-dom-id="add-friend-entry"]');

    var CELL_BINDING = 'friend-cell';
    var AVATAR_BINDING = 'friend-avatar';

    var state = {
      sortMode: 'letter',
      keyword: ''
    };

    function getCurrentFriends() {
      return searchFriends(state.keyword);
    }

    function renderList() {
      var friends = getCurrentFriends();
      if (friends.length === 0) {
        var text = state.keyword ? '未找到匹配的好友' : '还没有好友';
        scrollEl.innerHTML = emptyTemplate(text);
        indexEl.hidden = true;
        return;
      }
      if (state.keyword) {
        scrollEl.innerHTML = friends.map(function (f) {
          return friendCellTemplate(f, AVATAR_BINDING, state.keyword);
        }).join('');
        indexEl.hidden = true;
        return;
      }
      if (state.sortMode === 'letter') {
        var groups = buildLetterGroups(friends);
        scrollEl.innerHTML = groups.map(function (g) {
          return letterGroupTemplate(g, CELL_BINDING, AVATAR_BINDING);
        }).join('');
        var indexItems = groups.map(function (g) { return { key: g.key, label: g.key }; });
        indexEl.innerHTML = indexTemplate(indexItems);
        indexEl.hidden = false;
      } else {
        var customGroups = buildCustomGroups(friends);
        scrollEl.innerHTML = customGroups.map(function (g) {
          return customGroupTemplate(g, CELL_BINDING, AVATAR_BINDING);
        }).join('');
        var customIndexItems = customGroups.map(function (g) {
          return { key: g.key, label: g.label.charAt(0) };
        });
        indexEl.innerHTML = indexTemplate(customIndexItems);
        indexEl.hidden = false;
      }
    }

    function updateSortLabel() {
      sortLabel.textContent = state.sortMode === 'letter' ? '分组' : '字母';
    }

    function toggleSort() {
      state.sortMode = state.sortMode === 'letter' ? 'group' : 'letter';
      ctx.state['sort-by-letter'] = state.sortMode === 'letter' ? 1 : 0;
      updateSortLabel();
      renderList();
      scrollEl.scrollTop = 0;
    }

    function scrollToGroup(key) {
      var target = scrollEl.querySelector('[data-group-key="' + CSS.escape(key) + '"]');
      if (target) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }

    function setActiveIndexItem(btn) {
      if (!btn) return;
      indexEl.querySelectorAll('.friend-list__index-item').forEach(function (el) {
        el.classList.toggle('friend-list__index-item--active', el === btn);
      });
    }

    function handleIndexClick(e) {
      var btn = e.target.closest('[data-index-key]');
      if (!btn) return;
      var key = btn.getAttribute('data-index-key');
      scrollToGroup(key);
      setActiveIndexItem(btn);
    }

    function updateClearButton() {
      if (!searchActions) return;
      var hasValue = Boolean(searchInput.value);
      var existing = searchActions.querySelector('.searchbox__clear');
      if (hasValue && !existing) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'searchbox__action searchbox__clear wego-iconfont-s icon-yuancha-mian';
        btn.setAttribute('aria-label', '清除');
        btn.setAttribute('data-dom-id', 'clear-search');
        btn.addEventListener('click', function () {
          searchInput.value = '';
          searchInput.focus();
          handleSearch();
        });
        searchActions.appendChild(btn);
      } else if (!hasValue && existing) {
        existing.remove();
      }
    }

    function handleSearch() {
      state.keyword = searchInput.value;
      ctx.state['searching'] = Boolean(state.keyword);
      updateClearButton();
      renderList();
    }

    /* ── 全局失败注入消费（读取运行时故障开关） ── */
    function fault(key) {
      return !!(window.WegoApp && window.WegoApp.faultInjection && window.WegoApp.faultInjection.isEnabled(key));
    }

    /* ── 加载态与加载失败 ── */
    var LOAD_DEMO_DELAY = 600;
    function loadingTemplate() {
      var rows = '';
      for (var i = 0; i < 6; i++) rows += '<div class="friend-list__skeleton-row"></div>';
      return '<div class="friend-list__loading">' + rows + '</div>';
    }
    function loadFailedTemplate() {
      return ''
        + '<div class="friend-list__state">'
        +   '<div class="result">'
        +     '<div class="result__icon" aria-hidden="true"><i class="wego-iconfont-s icon-tanhao-mian"></i></div>'
        +     '<div class="result__title">好友列表加载失败，<a class="link link--inline" href="javascript:void(0)" data-retry-load>请重试</a></div>'
        +   '</div>'
        + '</div>';
    }
    function renderLoading() {
      scrollEl.innerHTML = loadingTemplate();
      indexEl.hidden = true;
    }
    function renderLoadFailed() {
      scrollEl.innerHTML = loadFailedTemplate();
      indexEl.hidden = true;
      var retry = scrollEl.querySelector('[data-retry-load]');
      if (retry) retry.addEventListener('click', function () { startLoad(); });
    }
    function startLoad() {
      if (fault('load')) {
        renderLoadFailed();
      } else {
        renderLoading();
        setTimeout(function () {
          updateSortLabel();
          renderList();
        }, LOAD_DEMO_DELAY);
      }
    }

    /* ── 删除好友（长按唤起） ── */
    function persistFriends() {
      return FriendStore.save(FRIENDS_DATA);
    }

    function removeFriendById(friendId) {
      FRIENDS_DATA = FRIENDS_DATA.filter(function (f) { return f.friend_id !== friendId; });
      persistFriends();
    }

    function findFriendById(friendId) {
      for (var i = 0; i < FRIENDS_DATA.length; i++) {
        if (FRIENDS_DATA[i].friend_id === friendId) return FRIENDS_DATA[i];
      }
      return null;
    }

    // 长按检测：按压超过长按阈值后触发，移动/松开阈值内取消
    var LONG_PRESS_MS = 500;
    var longPressTimer = null;
    var longPressFired = false;
    var longPressStart = { x: 0, y: 0 };
    var MOVE_TOLERANCE = 10;

    function clearLongPress() {
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      longPressFired = false;
    }

    function beginLongPress(cell, friendId, clientX, clientY) {
      clearLongPress();
      longPressStart.x = clientX;
      longPressStart.y = clientY;
      longPressFired = false;
      longPressTimer = setTimeout(function () {
        longPressFired = true;
        longPressFiredOn = true;
        cell.classList.add('is-nav-prepress');
        var friend = findFriendById(friendId);
        openFriendActionSheet(friend);
      }, LONG_PRESS_MS);
    }
    var longPressFiredOn = false;

    function cancelLongPress(cell) {
      clearLongPress();
      if (cell) cell.classList.remove('is-nav-prepress');
    }

    function openFriendActionSheet(friend) {
      if (!friend) return;
      ctx.openSheet(friendActionSheetTemplate(friend.nickname), {
        label: '好友操作',
        init: function (sheet) {
          var sheetRoot = sheet.root;
          var deleteBtn = sheetRoot.querySelector('[data-delete-friend]');
          var closeBtn = sheetRoot.querySelector('[data-close-action-sheet]');
          if (closeBtn) {
            closeBtn.addEventListener('click', function () { sheet.close(); });
          }
          if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
              sheet.close();
              confirmDeleteFriend(friend);
            });
          }
        }
      });
    }

    function confirmDeleteFriend(friend) {
      ctx.dialog({
        variant: 'text',
        title: '删除好友',
        content: '确定要删除 <strong>' + escapeHtml(friend.nickname) + '</strong> 吗？删除后无法恢复该好友关系。',
        buttons: [
          { label: '取 消', tone: 'dismiss' },
          { label: '删除', tone: 'danger', onClick: function () { doDeleteFriend(friend); } }
        ]
      });
    }

    function doDeleteFriend(friend) {
      if (fault('delete')) {
        ctx.toast('删除失败，请稍后重试');
        return;
      }
      var list = FRIENDS_DATA.map(function (f) { return f; });
      var idx = -1;
      for (var i = 0; i < list.length; i++) { if (list[i].friend_id === friend.friend_id) { idx = i; break; } }
      if (idx === -1) {
        ctx.toast('该好友已不在列表中');
        renderList();
        return;
      }
      var removed = list.splice(idx, 1)[0];
      FRIENDS_DATA = list;
      if (!persistFriends()) {
        FRIENDS_DATA.push(removed);
        ctx.toast('删除失败，请稍后重试');
        renderList();
        return;
      }
      renderList();
      ctx.toast('已删除好友 ' + friend.nickname);
    }

    /* ── 添加好友表单 ── */
    function openAddForm() {
      var formState = { groupId: '', groupName: '', source: '' };
      ctx.openFullScreenModal(addFriendFormTemplate(), {
        label: '添加好友',
        init: function (overlay) {
          var formRoot = overlay.root;
          var closeBtn = formRoot.querySelector('[data-close-add-form]');
          var saveBtns = formRoot.querySelectorAll('[data-dom-id="submit-add-friend"]');
          var groupSelect = formRoot.querySelector('[data-dom-id="select-friend-group"]');
          var groupSelectText = formRoot.querySelector('[data-group-select-text]');
          var sourceSelect = formRoot.querySelector('[data-source-select]');
          var sourceSelectText = formRoot.querySelector('[data-source-select-text]');
          var uploadBtn = formRoot.querySelector('[data-upload-avatar]');

          if (closeBtn) {
            closeBtn.addEventListener('click', function () { ctx.closeOverlay(); });
          }

          if (uploadBtn) {
            uploadBtn.addEventListener('click', function () {
              ctx.toast('已打开头像选择入口');
            });
          }

          if (groupSelect) {
            groupSelect.addEventListener('click', function () {
              ctx.openSheet(groupSelectTemplate(formState.groupId), {
                label: '选择分组',
                init: function (sheet) {
                  sheet.root.querySelectorAll('[data-select-group]').forEach(function (item) {
                    item.addEventListener('click', function () {
                      formState.groupId = item.getAttribute('data-select-group');
                      formState.groupName = getGroupName(formState.groupId);
                      groupSelectText.textContent = formState.groupName;
                      groupSelectText.classList.add('has-value');
                      sheet.close();
                    });
                  });
                  var cancelBtn = sheet.root.querySelector('[data-close-group-sheet]');
                  if (cancelBtn) {
                    cancelBtn.addEventListener('click', function () { sheet.close(); });
                  }
                }
              });
            });
          }

          if (sourceSelect) {
            sourceSelect.addEventListener('click', function () {
              ctx.openSheet(sourceSelectTemplate(), {
                label: '选择来源',
                init: function (sheet) {
                  sheet.root.querySelectorAll('[data-select-source]').forEach(function (item) {
                    item.addEventListener('click', function () {
                      formState.source = item.getAttribute('data-select-source');
                      sourceSelectText.textContent = formState.source;
                      sourceSelectText.classList.add('has-value');
                      sheet.close();
                    });
                  });
                  var cancelBtn = sheet.root.querySelector('[data-close-source-sheet]');
                  if (cancelBtn) {
                    cancelBtn.addEventListener('click', function () { sheet.close(); });
                  }
                }
              });
            });
          }

          function submitForm() {
            var nickname = formRoot.querySelector('[data-form-field="nickname"]');
            if (!nickname || !nickname.value.trim()) {
              ctx.toast('请输入好友昵称');
              return;
            }
            if (fault('save')) {
              ctx.toast('保存失败，请稍后重试');
              return;
            }
            var accountInput = formRoot.querySelector('[data-form-field="account_or_phone"]');
            var tagsInput = formRoot.querySelector('[data-form-field="tags"]');
            var remarkInput = formRoot.querySelector('[data-form-field="remark"]');
            var verifyInput = formRoot.querySelector('[data-form-field="verify_message"]');
            var nicknameVal = nickname.value.trim();
            var pyInitial = nicknameVal.charAt(0).toUpperCase();
            // 数据对齐真实场景 friendFromUser 结构：可采集字段取表单值，
            // 表单不采集的商家维度字段给与真实结构一致的默认/空值，不编造假数据
            var newFriend = {
              friend_id: 'f' + Date.now(),
              user_id: 'user-' + Date.now(),
              merchant_id: 'merchant-' + Date.now(),
              nickname: nicknameVal,
              merchant_name: nicknameVal,
              display_name: nicknameVal,
              avatar: './lib/assets/image/avatar-defult.png',
              py_initial: /[A-Z]/.test(pyInitial) ? pyInitial : '#',
              group_id: formState.groupId || 'g-follow',
              new_count: 0,
              product_total: 0,
              merchant_type: '',
              region: '',
              main_categories: [],
              account_type: 'merchant',
              statuses: [],
              relation_type: 'merchant_friend',
              relation_status: 'active',
              account_or_phone: accountInput ? accountInput.value.trim() : '',
              tags: tagsInput ? tagsInput.value.trim() : '',
              remark: remarkInput ? remarkInput.value.trim() : '',
              verify_message: verifyInput ? verifyInput.value.trim() : ''
            };
            FRIENDS_DATA.push(newFriend);
            if (!persistFriends()) {
              ctx.toast('保存失败，请稍后重试');
              return;
            }
            ctx.closeOverlay();
            ctx.toast('已添加好友 ' + newFriend.nickname);
            renderList();
          }

          saveBtns.forEach(function (btn) {
            btn.addEventListener('click', submitForm);
          });
        }
      });
    }

    /* ── 绑定事件 ── */
    sortToggleBtn.addEventListener('click', toggleSort);
    searchInput.addEventListener('input', handleSearch);
    addBtn.addEventListener('click', openAddForm);
    indexEl.addEventListener('click', handleIndexClick);
    // 空态「新建好友」按钮经事件委托触发（renderList 动态渲染于 scrollEl）
    scrollEl.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-dom-id="empty-add-friend"]')) {
        openAddForm();
      }
    });

    /* 滚动时更新索引激活态 */
    var scrollTimer = null;
    scrollEl.addEventListener('scroll', function () {
      if (state.keyword || indexEl.hidden) return;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var groups = scrollEl.querySelectorAll('.friend-list__group');
        var scrollRect = scrollEl.getBoundingClientRect();
        var activeKey = null;
        var atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 1;
        if (atBottom) {
          activeKey = groups[groups.length - 1].getAttribute('data-group-key');
        } else {
          for (var i = 0; i < groups.length; i++) {
            var top = groups[i].getBoundingClientRect().top - scrollRect.top;
            if (top <= 10) {
              activeKey = groups[i].getAttribute('data-group-key');
            } else {
              break;
            }
          }
        }
        if (activeKey) {
          setActiveIndexItem(indexEl.querySelector('[data-index-key="' + CSS.escape(activeKey) + '"]'));
        }
      }, 80);
    });

    /* 长按列表项唤起操作面板：事件委托，兼容触控与桌面指针 */
    function pressStart(e) {
      var cell = e.target && e.target.closest ? e.target.closest('[data-friend-id]') : null;
      if (!cell) return;
      var isMouse = typeof e.pointerType === 'string' && e.pointerType !== 'touch';
      var pt = isMouse ? e : ((e.touches && e.touches[0]) || e);
      beginLongPress(cell, cell.getAttribute('data-friend-id'), pt.clientX, pt.clientY);
    }
    function pressMove(e) {
      if (longPressTimer === null) return;
      var cell = e.target && e.target.closest ? e.target.closest('[data-friend-id]') : null;
      var pt = (e.touches && e.touches[0]) || e;
      if (Math.abs(pt.clientX - longPressStart.x) > MOVE_TOLERANCE ||
          Math.abs(pt.clientY - longPressStart.y) > MOVE_TOLERANCE) {
        cancelLongPress(cell);
      }
    }
    function pressEnd(e) {
      var cell = e.target && e.target.closest ? e.target.closest('[data-friend-id]') : null;
      cancelLongPress(cell);
    }
    scrollEl.addEventListener('touchstart', pressStart, { passive: true });
    scrollEl.addEventListener('touchmove', pressMove, { passive: true });
    scrollEl.addEventListener('touchend', pressEnd, { passive: true });
    scrollEl.addEventListener('touchcancel', pressEnd, { passive: true });
    scrollEl.addEventListener('pointerdown', pressStart);
    scrollEl.addEventListener('pointermove', pressMove, { passive: true });
    scrollEl.addEventListener('pointerup', pressEnd);
    scrollEl.addEventListener('pointercancel', pressEnd);

    /* 注册滚动布局：搜索框上滑隐藏/下滑显示 */
    ctx.bindScrollLayout({
      scrollRoot: '.friend-list__scroll',
      regions: [
        { selector: '.friend-list__search-sticky', policy: 'direction-reveal', edge: 'top', essential: false, threshold: 8 }
      ]
    });

    /* 初始化渲染：先呈现加载态（本地演示延迟），再渲染列表 */
    startLoad();
  }
});
