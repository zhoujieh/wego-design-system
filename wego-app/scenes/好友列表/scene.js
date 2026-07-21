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
    "design_system_version": 417,
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
      { "selector": ".friend-list__index", "content_role": "索引区右侧安全间距", "css_property": "right", "token": "var(--spacer-2)" },
      { "selector": ".friend-list__index", "content_role": "索引项紧凑间距", "css_property": "gap", "token": "var(--spacer-2)" },
      { "selector": ".friend-list__index", "content_role": "索引区层级", "css_property": "z-index", "token": "var(--z-sticky)" },
      { "selector": ".friend-list__index-item", "content_role": "索引项字号", "css_property": "font-size", "token": "var(--body-xs-font-size)" },
      { "selector": ".friend-list__index-item", "content_role": "索引项行高", "css_property": "line-height", "token": "var(--body-xs-line-height)" },
      { "selector": ".friend-list__index-item", "content_role": "索引项颜色", "css_property": "color", "token": "var(--text-secondary)" },
      { "selector": ".friend-list__index-item", "content_role": "索引项最小宽高", "css_property": "min-width", "token": "var(--size-16)" },
      { "selector": ".friend-list__index-item:active", "content_role": "索引项按压颜色", "css_property": "color", "token": "var(--text-brand)" },
      { "selector": ".friend-list__index-item.is-pressed", "content_role": "索引项按压颜色", "css_property": "color", "token": "var(--text-brand)" },
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
      { "selector": ".friend-add-form__body", "content_role": "全屏模态表单容器背景", "css_property": "background", "token": "var(--bg-page)" },
      { "selector": ".friend-add-form__body", "content_role": "全屏模态表单容器文字", "css_property": "color", "token": "var(--text-default)" },
      { "selector": ".friend-add-form__body", "content_role": "全屏模态表单容器字体", "css_property": "font-family", "token": "var(--body-md-font-family)" }
    ],
    "component_bindings": [
      { "binding_id": "friend-navbar", "slug": "navbar", "reason": "承载好友页面左对齐大标题、新建好友与排序切换入口", "variant_dimensions": { "leftControl": "none", "titleAlignment": "left-wide", "actions": "icon", "rightActionType": "icon", "spacing": "default", "pageTransition": "push", "position": "sticky" } },
      { "binding_id": "friend-search", "slug": "search", "reason": "提供好友昵称搜索入口，白底搜索框放在灰底页面上，输入后显示清除并支持继续输入", "variant_dimensions": { "size": "md", "surface": "white", "mode": "text", "state": "empty", "hostPattern": "inline", "internalActions": "clear" } },
      { "binding_id": "friend-add-form-modal", "slug": "modal", "reason": "新建好友全屏模态容器，fullscreen 变体，通过 ctx.openFullScreenModal 消费；内含 navbar + 表单 body，蒙层与动画由组件自身承担；modal__body 无默认 padding，本场景无底部 action/cancel，body 必须加 modal__body--safe-bottom 预留 40px + safe-area-bottom；表单走 entity-form 范式（M0 通栏白底、form-group__content 不加 --card）", "variant_dimensions": { "variant": "fullscreen", "title": "default", "action": "none", "state": "open" } },
      { "binding_id": "friend-group-sheet", "slug": "actionsheet", "reason": "选择好友分组底部面板，通过 ctx.openSheet 消费；渲染完整 .actionsheet 根节点 + .actionsheet__panel 及子内容，关闭行为覆盖 cancel 与 mask", "variant_dimensions": { "mode": "select", "header": "text", "item": "text", "state": "open" } },
      { "binding_id": "friend-source-sheet", "slug": "actionsheet", "reason": "选择好友来源渠道底部面板，通过 ctx.openSheet 消费；渲染完整 .actionsheet 根节点 + .actionsheet__panel 及子内容，关闭行为覆盖 cancel 与 mask", "variant_dimensions": { "mode": "select", "header": "text", "item": "text", "state": "open" } }
    ],
    "layout_contract": {
      "mode": "composed",
      "source": "references/design-decisions.md",
      "selection_reason": "好友列表以连续浏览为主，采用通栏白底行减少阅读中断；搜索固定在顶部，索引固定悬浮在右侧中间。新建好友全屏模态内部走 entity-form 范式（M0 通栏白底、form-group__title 与 form-body 共享 16px 起点节奏、不挂 --card）。",
      "page_edge_mode": "M0",
      "mutable_regions": [".friend-list__scroll", ".friend-list__group", ".friend-list__index"]
    },
    "interaction_contract": [
      { "dom_id": "sort-toggle", "target": "state:sort-by-letter" },
      { "dom_id": "friend-search-input", "target": "state:searching" },
      { "dom_id": "friend-search-clear", "target": "state:list-ready" },
      { "dom_id": "add-friend-entry", "target": "overlay:full-screen-modal" },
      { "dom_id": "select-friend-group", "target": "overlay:sheet" },
      { "dom_id": "select-friend-source", "target": "overlay:sheet" }
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
    "checked_at": "2026-07-21T08:00:00.000Z",
    "scope": "好友列表主页 + 新建好友全屏模态表单层（modal fullscreen safe-area-top 恢复 inherit、modal__body 默认 padding 移除、entity-form 范式 M0 通栏白底无 --card）",
    "checks": { "horizontal_overflow": true, "overlap": true, "clipping": true, "action_legibility": true, "primary_focus": true, "state_feedback": true }
  }
}
*/

/* 好友列表场景 */

/* ── 内置数据 ── */
var FRIEND_GROUPS = [
  { group_id: 'g-vip', group_name: 'VIP 客户' },
  { group_id: 'g-normal', group_name: '普通客户' },
  { group_id: 'g-follow', group_name: '待跟进' }
];

var NICKNAME_PREFIXES = ['阿', '安', '白', '冰', '晨', '大', '东', '芳', '光', '海', '红', '华', '静', '俊', '可', '兰', '丽', '亮', '林', '龙', '美', '明', '娜', '鹏', '强', '青', '秋', '然', '瑞', '山', '婷', '伟', '文', '雯', '霞', '小', '欣', '雪', '雅', '燕', '洋', '怡', '颖', '宇', '玉', '媛', '月', '云', '泽', '志'];
var NICKNAME_SUFFIXES = ['哥', '姐', '总', '老板', '老板娘', '代理', '客户', '分销', '店主', '朋友', '同学', '邻居', '亲戚', '同事', '合作方'];

function generateFriends(count) {
  var friends = [];
  var groups = ['g-vip', 'g-normal', 'g-follow'];
  for (var i = 0; i < count; i++) {
    var prefix = NICKNAME_PREFIXES[i % NICKNAME_PREFIXES.length];
    var suffix = NICKNAME_SUFFIXES[Math.floor(i / NICKNAME_PREFIXES.length) % NICKNAME_SUFFIXES.length];
    var nickname = prefix + suffix + (i < NICKNAME_PREFIXES.length ? '' : Math.floor(i / NICKNAME_PREFIXES.length / NICKNAME_SUFFIXES.length));
    var pyInitial = getPyInitial(nickname.charAt(0));
    var groupId = groups[i % groups.length];
    var avatarIndex = (i % 100) + 1;
    friends.push({
      friend_id: 'f' + String(i + 1).padStart(3, '0'),
      nickname: nickname,
      py_initial: pyInitial,
      group_id: groupId,
      new_count: Math.floor(Math.random() * 10),
      product_total: Math.floor(Math.random() * 100) + 1,
      avatar: './lib/assets/image/avatar/avatar_' + String(avatarIndex).padStart(3, '0') + '.jpg'
    });
  }
  return friends;
}

function getPyInitial(char) {
  var map = {
    '阿': 'A', '安': 'A', '白': 'B', '冰': 'B', '晨': 'C', '大': 'D', '东': 'D',
    '芳': 'F', '光': 'G', '海': 'H', '红': 'H', '华': 'H', '静': 'J', '俊': 'J',
    '可': 'K', '兰': 'L', '丽': 'L', '亮': 'L', '林': 'L', '龙': 'L', '美': 'M',
    '明': 'M', '娜': 'N', '鹏': 'P', '强': 'Q', '青': 'Q', '秋': 'Q', '然': 'R',
    '瑞': 'R', '山': 'S', '婷': 'T', '伟': 'W', '文': 'W', '雯': 'W', '霞': 'X',
    '小': 'X', '欣': 'X', '雪': 'X', '雅': 'Y', '燕': 'Y', '洋': 'Y', '怡': 'Y',
    '颖': 'Y', '宇': 'Y', '玉': 'Y', '媛': 'Y', '月': 'Y', '云': 'Y', '泽': 'Z',
    '志': 'Z', '老': 'L', '总': 'Z', '代': 'D', '客': 'K', '分': 'F', '店': 'D',
    '朋': 'P', '同': 'T', '邻': 'L', '亲': 'Q', '合': 'H', '0': '#', '1': '#',
    '2': '#', '3': '#', '4': '#', '5': '#', '6': '#', '7': '#', '8': '#', '9': '#'
  };
  return map[char] || '#';
}

var FRIENDS_DATA = generateFriends(100);

/* ── 工具函数 ── */
function getGroupName(groupId) {
  var g = FRIEND_GROUPS.find(function (x) { return x.group_id === groupId; });
  return g ? g.group_name : '未分组';
}

function buildLetterGroups(friends) {
  var map = {};
  friends.forEach(function (f) {
    var key = f.py_initial || '#';
    if (!map[key]) map[key] = [];
    map[key].push(f);
  });
  var keys = Object.keys(map).sort(function (a, b) {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a < b ? -1 : 1;
  });
  return keys.map(function (k) {
    var items = map[k].slice().sort(function (a, b) {
      return a.nickname < b.nickname ? -1 : a.nickname > b.nickname ? 1 : 0;
    });
    return { key: k, friends: items };
  });
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
function friendCellTemplate(friend, bindingId) {
  var newCountHtml = friend.new_count > 0
    ? '<span class="friend-list__meta-text friend-list__new-count">上新 ' + friend.new_count + '</span>'
    : '';
  return ''
    + '<div class="cell cell--double cell--bg-white cell--clickable" data-friend-id="' + friend.friend_id + '">'
    +   '<div class="cell__avatar">'
    +     '<div class="avatar avatar--40 avatar--image" data-dd-id="friend-avatar-' + friend.friend_id + '" data-component-slug="avatar" data-component-binding="' + bindingId + '">'
    +       '<img src="' + friend.avatar + '" alt="' + friend.nickname + '">'
    +     '</div>'
    +   '</div>'
    +   '<div class="cell__body">'
    +     '<div class="cell__content">'
    +       '<div class="cell__title-row"><span class="cell__title">' + friend.nickname + '</span></div>'
    +       '<div class="friend-list__meta">'
    +         newCountHtml
    +         '<span class="friend-list__meta-text">产品 ' + friend.product_total + '</span>'
    +       '</div>'
    +     '</div>'
    +   '</div>'
    + '</div>';
}

function letterGroupTemplate(group, cellBindingId, avatarBindingId) {
  return ''
    + '<div class="cell-group friend-list__group" data-group-key="' + group.key + '">'
    +   '<div class="friend-list__group-title">' + group.key + '</div>'
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
    return '<button type="button" class="friend-list__index-item" data-index-key="' + item.key + '" data-dom-id="friend-index-item" aria-label="定位到 ' + item.label + '">' + item.label + '</button>';
  }).join('');
}

function emptyTemplate(text) {
  return ''
    + '<div class="friend-list__empty">'
    +   '<div class="friend-list__empty-icon wego-iconfont-s icon-kongzhuangtai"></div>'
    +   '<p class="friend-list__empty-text">' + text + '</p>'
    + '</div>';
}

/* ── 添加好友表单模板 ── */
function addFriendFormTemplate() {
  return ''
    + '<div class="modal modal--fullscreen" data-state="closed" data-dd-id="friend-add-form-modal" data-component-slug="modal" data-component-binding="friend-add-form-modal" role="dialog" aria-modal="true" aria-label="添加好友">'
    +   '<div class="modal__panel" style="--modal-panel-bg: var(--bg-page);">'
    +     '<div class="modal__title modal__title--default">'
    +       '<div class="navbar" data-dd-id="friend-add-form-navbar" data-component-slug="navbar" data-component-binding="friend-add-form-navbar">'
    +         '<div class="navbar__body navbar__body--spaced">'
    +           '<div class="navbar__left"><span class="navbar__left-text" data-close-add-form>取消</span></div>'
    +           '<div class="navbar__center"><span class="navbar__title">添加好友</span></div>'
    +           '<div class="navbar__right navbar__right--button">'
    +             '<div class="navbar__action navbar__action--button">'
    +               '<button class="btn btn--strong btn--sm" data-dom-id="submit-add-friend">保存</button>'
    +             '</div>'
    +           '</div>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="modal__body modal__body--safe-bottom">'
    +       '<div class="friend-add-form__body">'
    +         '<div class="form-group">'
    +           '<div class="form-group__title">基本信息</div>'
    +           '<div class="form-group__content">'
    +             '<div class="form-body form-body--preserve-content-align">'
    +               '<div class="form-body__label form-body__label--required"><span class="form-body__label-text">头像</span><span class="form-body__required">*</span></div>'
    +               '<div class="form-body__action">'
    +                 '<div class="form-body__upload" data-upload-avatar>'
    +                   '<div class="form-body__upload-icon wego-iconfont-s icon-jia16"></div>'
    +                   '<span class="form-body__upload-text">上传</span>'
    +                 '</div>'
    +               '</div>'
    +             '</div>'
    +             '<div class="form-body">'
    +               '<div class="form-body__label form-body__label--required"><span class="form-body__label-text">昵称</span><span class="form-body__required">*</span></div>'
    +               '<div class="form-body__action"><input type="text" placeholder="请输入好友昵称" data-form-field="nickname" maxlength="20" /></div>'
    +             '</div>'
    +             '<div class="form-body form-body--preserve-content-align">'
    +               '<div class="form-body__label"><span class="form-body__label-text">账号/手机号</span></div>'
    +               '<div class="form-body__action">'
    +                 '<div class="form-body__phone">'
    +                   '<span class="form-body__phone-prefix">+86</span>'
    +                   '<span class="form-body__phone-divider"></span>'
    +                   '<input class="form-body__phone-input" type="tel" placeholder="请输入账号或手机号" data-form-field="account_or_phone" />'
    +                 '</div>'
    +               '</div>'
    +             '</div>'
    +           '</div>'
    +         '</div>'
    +         '<div class="form-group">'
        +   '<div class="form-group__title">分组与标签</div>'
        +   '<div class="form-group__content">'
        +     '<div class="form-body form-body--clickable" data-dom-id="select-friend-group">'
        +       '<div class="form-body__label"><span class="form-body__label-text">分组</span></div>'
        +       '<div class="form-body__action">'
        +         '<div class="form-body__select">'
        +           '<span class="form-body__select-text" data-group-select-text>请选择分组</span>'
        +           '<span class="form-body__select-arrow wego-iconfont-s icon-xiajiantou16"></span>'
        +         '</div>'
        +       '</div>'
        +     '</div>'
        +     '<div class="form-body">'
        +       '<div class="form-body__label"><span class="form-body__label-text">标签</span></div>'
        +       '<div class="form-body__action"><input type="text" placeholder="多个标签用逗号分隔" data-form-field="tags" /></div>'
        +     '</div>'
        +   '</div>'
        + '</div>'
        + '<div class="form-group">'
        +   '<div class="form-group__title">来源与验证</div>'
        +   '<div class="form-group__content">'
        +     '<div class="form-body form-body--clickable" data-dom-id="select-friend-source">'
        +       '<div class="form-body__label"><span class="form-body__label-text">来源渠道</span></div>'
        +       '<div class="form-body__action">'
        +         '<div class="form-body__select">'
        +           '<span class="form-body__select-text" data-source-select-text>请选择来源</span>'
        +           '<span class="form-body__select-arrow wego-iconfont-s icon-xiajiantou16"></span>'
        +         '</div>'
        +       '</div>'
        +     '</div>'
    +             '<div class="form-body">'
    +               '<div class="form-body__label"><span class="form-body__label-text">备注</span></div>'
    +               '<div class="form-body__action"><input type="text" placeholder="添加备注信息" data-form-field="remark" maxlength="50" /></div>'
    +             '</div>'
    +             '<div class="form-body form-body--vertical form-body--fixed-height">'
    +               '<div class="form-body__label"><span class="form-body__label-text">验证消息</span></div>'
    +               '<div class="form-body__action"><textarea placeholder="发送给好友的验证消息" data-form-field="verify_message"></textarea></div>'
    +             '</div>'
    +           '</div>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
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
      +     '<div class="actionsheet__item-check-slot"><i class="wego-iconfont-s icon-gou-jiacu actionsheet__item-check"></i></div>'
      +   '</div>'
      + '</button>';
  }).join('');
  return ''
    + '<div class="actionsheet actionsheet--select" role="dialog" aria-modal="true" data-state="closed" data-dd-id="friend-group-sheet" data-component-slug="actionsheet" data-component-binding="friend-group-sheet">'
    +   '<div class="actionsheet__panel">'
    +     '<div class="actionsheet__header actionsheet__header--text"><span class="actionsheet__header-text">选择分组</span></div>'
    +     '<div class="actionsheet__list">' + items + '</div>'
    +     '<div class="actionsheet__cancel-gap"></div>'
    +     '<button type="button" class="actionsheet__cancel" data-close-group-sheet>取 消</button>'
    +   '</div>'
    + '</div>';
}

function sourceSelectTemplate(selectedSource) {
  var sources = ['搜索导入', '名片扫码', '群聊添加', '手机通讯录', '手动输入'];
  var items = sources.map(function (s) {
    var selected = s === selectedSource ? ' actionsheet__item--selected' : '';
    return ''
      + '<button type="button" class="actionsheet__item' + selected + '" data-select-source="' + s + '">'
      +   '<div class="actionsheet__item-row">'
      +     '<div class="actionsheet__item-main"><span class="actionsheet__item-title">' + s + '</span></div>'
      +     '<div class="actionsheet__item-check-slot"><i class="wego-iconfont-s icon-gou-jiacu actionsheet__item-check"></i></div>'
      +   '</div>'
      + '</button>';
  }).join('');
  return ''
    + '<div class="actionsheet actionsheet--select" role="dialog" aria-modal="true" data-state="closed" data-dd-id="friend-source-sheet" data-component-slug="actionsheet" data-component-binding="friend-source-sheet">'
    +   '<div class="actionsheet__panel">'
    +     '<div class="actionsheet__header actionsheet__header--text"><span class="actionsheet__header-text">选择来源</span></div>'
    +     '<div class="actionsheet__list">' + items + '</div>'
    +     '<div class="actionsheet__cancel-gap"></div>'
    +     '<button type="button" class="actionsheet__cancel" data-close-source-sheet>取 消</button>'
    +   '</div>'
    + '</div>';
}

/* ── 场景模板 ── */
const friendListTemplate = `
  <section class="friend-list" data-surface-id="friend-list" data-route-id="friend-list" data-route-bound="true" data-layout-mode="composed" data-page-edge-mode="M0" data-bg="page">
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
    <div class="friend-list__search">
      <div class="searchbox searchbox--md searchbox--white" data-dd-id="friend-search" data-component-slug="search" data-component-binding="friend-search">
        <span class="searchbox__icon wego-iconfont-s icon-sousuo" aria-hidden="true"></span>
        <div class="searchbox__input">
          <input class="searchbox__field" type="search" placeholder="搜索好友昵称" aria-label="搜索好友昵称" data-dom-id="friend-search-input" />
        </div>
        <div class="searchbox__actions">
          <button class="searchbox__action searchbox__clear wego-iconfont-s icon-yuancha-mian" type="button" aria-label="清除" data-dom-id="friend-search-clear" hidden></button>
        </div>
      </div>
    </div>
    <div class="friend-list__scroll" data-friend-scroll data-tab-scroll></div>
    <div class="friend-list__index" data-friend-index hidden aria-label="快速定位：点按字母立即定位；按住后上下滑动，松手定位当前字母"></div>
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
    var searchClear = root.querySelector('[data-dom-id="friend-search-clear"]');
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
          return friendCellTemplate(f, AVATAR_BINDING);
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
        var targetTop = target.getBoundingClientRect().top;
        var scrollTop = scrollEl.getBoundingClientRect().top;
        scrollEl.scrollTo({ top: scrollEl.scrollTop + targetTop - scrollTop, behavior: 'auto' });
      }
    }

    function setActiveIndexItem(btn) {
      if (!btn) return;
      indexEl.querySelectorAll('.friend-list__index-item').forEach(function (el) {
        el.classList.toggle('friend-list__index-item--active', el === btn);
      });
    }

    var suppressNextIndexClick = false;

    function handleIndexClick(e) {
      if (suppressNextIndexClick) {
        suppressNextIndexClick = false;
        return;
      }
      var btn = e.target.closest('[data-index-key]');
      if (!btn) return;
      var key = btn.getAttribute('data-index-key');
      scrollToGroup(key);
      setActiveIndexItem(btn);
    }

    /* 点按仍由 click 即时定位；按住滑动时只更新候选项，松手后再定位。 */
    var indexPointer = { id: null, startY: 0, isSliding: false, candidate: null };

    function getIndexItemAt(clientY) {
      var items = Array.prototype.slice.call(indexEl.querySelectorAll('[data-index-key]'));
      if (!items.length) return null;
      return items.reduce(function (nearest, item) {
        var rect = item.getBoundingClientRect();
        var distance = Math.abs(clientY - (rect.top + rect.height / 2));
        return !nearest || distance < nearest.distance ? { item: item, distance: distance } : nearest;
      }, null).item;
    }

    function handleIndexPointerDown(e) {
      if (e.pointerType !== 'touch') return;
      var btn = e.target.closest('[data-index-key]');
      if (!btn) return;
      indexPointer = { id: e.pointerId, startY: e.clientY, isSliding: false, candidate: btn };
      indexEl.setPointerCapture(e.pointerId);
    }

    function handleIndexPointerMove(e) {
      if (e.pointerId !== indexPointer.id) return;
      if (Math.abs(e.clientY - indexPointer.startY) > 6) indexPointer.isSliding = true;
      if (!indexPointer.isSliding) return;
      var candidate = getIndexItemAt(e.clientY);
      if (candidate) {
        indexPointer.candidate = candidate;
        setActiveIndexItem(candidate);
      }
    }

    function handleIndexPointerEnd(e) {
      if (e.pointerId !== indexPointer.id) return;
      var pointer = indexPointer;
      if (indexEl.hasPointerCapture(e.pointerId)) indexEl.releasePointerCapture(e.pointerId);
      indexPointer = { id: null, startY: 0, isSliding: false, candidate: null };
      if (!pointer.isSliding || !pointer.candidate) return;
      suppressNextIndexClick = true;
      setTimeout(function () { suppressNextIndexClick = false; }, 0);
      scrollToGroup(pointer.candidate.getAttribute('data-index-key'));
      setActiveIndexItem(pointer.candidate);
    }

    function handleSearch() {
      state.keyword = searchInput.value;
      ctx.state['searching'] = Boolean(state.keyword);
      searchClear.hidden = !searchInput.value;
      renderList();
    }

    function clearSearch() {
      searchInput.value = '';
      state.keyword = '';
      ctx.state['searching'] = false;
      ctx.state['list-ready'] = true;
      searchClear.hidden = true;
      renderList();
      searchInput.focus();
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
          var sourceSelect = formRoot.querySelector('[data-dom-id="select-friend-source"]');
          var sourceSelectText = formRoot.querySelector('[data-source-select-text]');
          var uploadBtn = formRoot.querySelector('[data-upload-avatar]');

          if (closeBtn) {
            closeBtn.addEventListener('click', function () { overlay.close(); });
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
                  // mask 关闭：点击 actionsheet 根节点（蒙层）非面板区域关闭面板，符合 actionsheet closeByMask 默认行为
                  sheet.root.addEventListener('click', function (event) {
                    if (event.target === sheet.root) sheet.close();
                  });
                }
              });
            });
          }

          if (sourceSelect) {
            sourceSelect.addEventListener('click', function () {
              ctx.openSheet(sourceSelectTemplate(formState.source), {
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
                  // mask 关闭：点击 actionsheet 根节点（蒙层）非面板区域关闭面板，符合 actionsheet closeByMask 默认行为
                  sheet.root.addEventListener('click', function (event) {
                    if (event.target === sheet.root) sheet.close();
                  });
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
            var newFriend = {
              friend_id: 'f' + Date.now(),
              nickname: nickname.value.trim(),
              py_initial: nickname.value.trim().charAt(0).toUpperCase(),
              group_id: formState.groupId || 'g-normal',
              new_count: 0,
              product_total: 0,
              avatar: './lib/assets/image/avatar-defult.png'
            };
            if (!/[A-Z]/.test(newFriend.py_initial)) {
              newFriend.py_initial = '#';
            }
            FRIENDS_DATA.push(newFriend);
            overlay.close();
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
    searchClear.addEventListener('click', clearSearch);
    addBtn.addEventListener('click', openAddForm);
    indexEl.addEventListener('click', handleIndexClick);
    indexEl.addEventListener('pointerdown', handleIndexPointerDown);
    indexEl.addEventListener('pointermove', handleIndexPointerMove);
    indexEl.addEventListener('pointerup', handleIndexPointerEnd);
    indexEl.addEventListener('pointercancel', function (e) {
      if (e.pointerId === indexPointer.id) indexPointer = { id: null, startY: 0, isSliding: false, candidate: null };
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
        for (var i = 0; i < groups.length; i++) {
          var top = groups[i].getBoundingClientRect().top - scrollRect.top;
          if (top <= 10) {
            activeKey = groups[i].getAttribute('data-group-key');
          } else {
            break;
          }
        }
        if (activeKey) {
          setActiveIndexItem(indexEl.querySelector('[data-index-key="' + CSS.escape(activeKey) + '"]'));
        }
      }, 80);
    });

    /* 初始化渲染 */
    updateSortLabel();
    searchClear.hidden = true;
    renderList();
  }
});
