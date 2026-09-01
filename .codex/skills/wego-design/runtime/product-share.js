/* 产品分享（业务组件，全局加载）
   - 业务场景：内容跨平台分发——把产品分享到第三方平台获客（微信/朋友圈/视频号/闲鱼/小红书/快手/抖音/微博/转转），
     支持小程序码/文案带链接/保存图片/系统分享；按内容类型（product/列表/主页/单据/海报/订单）扩展。
   - 适用场景：动态页（商品分享、分享流程）、我的页（我的产品分享、转发记录）。
   - 消费方式：window.WegoApp.openProductShare(ctx, options)
   - 架构：数据层（WegoApp.db 本地记录：转发记录/快捷渠道）+ UI 层（分享面板/分享至XX/下载进度/小程序链接模板）
          + 业务层（openProductShare 统一入口 + 渠道分发 + 流程模拟 + SHARE_TYPES 类型注册表，新增分享类型注册 render+config 即可）。
   - 依赖：window.WegoApp（app.js）；分享图标 ./lib/assets/icons/share/。 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     WegoApp.db 统一数据层
     命名规范：wego.{domain}.{entity}
     本次新增 key：wego.product.forwarded / wego.share.quick-channel / wego.gray-popup.*
     ═══════════════════════════════════════════════════════════════ */
  var DB = {
    get: function (key) {
      try {
        var raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) { return false; }
    },
    push: function (key, item) {
      var list = this.get(key) || [];
      if (!Array.isArray(list)) list = [];
      list.push(item);
      return this.set(key, list);
    },
    remove: function (key, id) {
      var list = this.get(key) || [];
      if (!Array.isArray(list)) return false;
      list = list.filter(function (it) { return it.id !== id && it.productId !== id && it.dynamicId !== id; });
      return this.set(key, list);
    },
    find: function (key, predicate) {
      var list = this.get(key) || [];
      if (!Array.isArray(list)) return null;
      for (var i = 0; i < list.length; i++) {
        if (predicate(list[i])) return list[i];
      }
      return null;
    },
    query: function (key, options) {
      var list = this.get(key) || [];
      if (!Array.isArray(list)) return [];
      if (options && options.filter) list = list.filter(options.filter);
      if (options && options.sort) list.sort(options.sort);
      if (options && options.limit) list = list.slice(0, options.limit);
      return list;
    }
  };
  window.WegoApp = window.WegoApp || {};
  window.WegoApp.db = DB;

  /* ═══════════════════════════════════════════════════════════════
     分享渠道配置（11个渠道分两组）
     ═══════════════════════════════════════════════════════════════ */
  var CHANNELS = [
    { key: 'moments', name: '朋友圈', icon: 'icon-pengyouquan', iconSvg: './lib/assets/icons/share/moments-you-biankuang.svg', group: 1, supportTextOnly: false },
    { key: 'poster', name: '海报分享', icon: 'icon-haibao', iconSvg: './lib/assets/icons/share/moments-you-biankuang.svg', badge: '防折叠', group: 1, supportTextOnly: true },
    { key: 'wechat', name: '微信好友', icon: 'icon-weixin', iconSvg: './lib/assets/icons/share/wechat.svg', group: 1, supportTextOnly: true },
    { key: 'channels', name: '视频号', icon: 'icon-shipinhao', iconSvg: './lib/assets/icons/share/channels.svg', group: 1, supportTextOnly: false },
    { key: 'xianyu', name: '闲鱼', icon: 'icon-xianyu', iconSvg: './lib/assets/icons/share/xianyu.svg', group: 1, supportTextOnly: false },
    { key: 'xiaohongshu', name: '小红书', icon: 'icon-xiaohongshu', iconSvg: './lib/assets/icons/share/xiaohongshu.svg', group: 1, supportTextOnly: false },
    { key: 'kuaishou', name: '快手', icon: 'icon-kuaishou', iconSvg: './lib/assets/icons/share/kuaishou.svg', group: 1, supportTextOnly: false },
    { key: 'douyin', name: '抖音', icon: 'icon-douyin', iconSvg: './lib/assets/icons/share/douyin.svg', group: 1, supportTextOnly: false },
    { key: 'weibo', name: '微博', icon: 'icon-weibo', iconSvg: './lib/assets/icons/share/weibo.svg', group: 1, supportTextOnly: true },
    { key: 'zhuanzhuan', name: '转转', icon: 'icon-zhuanzhuan', iconSvg: './lib/assets/icons/share/zhuanzhuan.svg', group: 2, supportTextOnly: false },
    { key: 'more', name: '更多', icon: 'icon-sandian16', iconSvg: null, group: 2, supportTextOnly: true }
  ];

  function getChannel(key) {
    for (var i = 0; i < CHANNELS.length; i++) {
      if (CHANNELS[i].key === key) return CHANNELS[i];
    }
    return null;
  }

  /* ═══════════════════════════════════════════════════════════════
     快捷分享记录（全局记忆）
     ═══════════════════════════════════════════════════════════════ */
  function getQuickChannel() {
    var saved = DB.get('wego.share.quick-channel');
    if (saved && saved.lastUsedChannel) return saved.lastUsedChannel;
    return 'moments';
  }
  function setQuickChannel(channelKey) {
    DB.set('wego.share.quick-channel', { lastUsedChannel: channelKey });
  }

  /* ═══════════════════════════════════════════════════════════════
     转发产品记录
     ═══════════════════════════════════════════════════════════════ */
  function getForwardedProducts() {
    return DB.query('wego.product.forwarded', {
      sort: function (a, b) { return new Date(b.forwardedAt) - new Date(a.forwardedAt); }
    });
  }
  function addForwardedProduct(product) {
    DB.push('wego.product.forwarded', product);
  }

  /* ═══════════════════════════════════════════════════════════════
     分享面板组件
     ═══════════════════════════════════════════════════════════════ */
  function sharePanelTemplate(opts) {
    var title = opts.title || '分享产品';
    var config = opts.config || {};
    var channels = config.channels || CHANNELS.map(function (c) { return c.key; });
    var showHeaderActions = config.showHeaderActions !== false;
    var configItems = config.configItems || [
      { key: 'shareType', type: 'radio', options: [
        { value: 'miniprogram', label: '小程序码' },
        { value: 'textLink', label: '文案带链接' }
      ], defaultValue: 'miniprogram' },
      { key: 'customerTag', type: 'button', label: '给客户打标' }
    ];
    var actions = config.actions || [
      { key: 'miniprogramLink', label: '小程序链接', icon: 'icon-lianjie', style: 'icon-text' },
      { key: 'saveImages', label: '保存图片', icon: 'icon-baocun', style: 'icon-text' },
      { key: 'barcode', label: '打商品条码', icon: 'icon-tiaoma', style: 'icon-text' }
    ];

    /* 渠道栏：按 group 分组渲染，每组 flex-wrap，item 固定 68px */
    var group1 = CHANNELS.filter(function (c) { return c.group === 1 && channels.indexOf(c.key) >= 0; });
    var group2 = CHANNELS.filter(function (c) { return c.group === 2 && channels.indexOf(c.key) >= 0; });
    var hasMultipleGroups = group1.length > 0 && group2.length > 0;

    function renderChannelIcon(c) {
      if (c.iconSvg) {
        return '<img class="share-panel__channel-svg" src="' + c.iconSvg + '" alt="' + c.name + '" />';
      }
      return '<i class="wego-iconfont-s ' + c.icon + '" aria-hidden="true"></i>';
    }

    function renderChannelGroup(group) {
      var html = '<div class="share-panel__channel-group">';
      group.forEach(function (c) {
        var badgeHtml = c.badge ? '<span class="share-panel__channel-badge">' + c.badge + '</span>' : '';
        html += '<button type="button" class="share-panel__channel-item" data-component-slug="button" data-channel="' + c.key + '">'
          + '<span class="share-panel__channel-icon">' + renderChannelIcon(c) + badgeHtml + '</span>'
          + '<span class="share-panel__channel-name">' + c.name + '</span>'
          + '</button>';
      });
      html += '</div>';
      return html;
    }

    /* 配置栏：checkbox 组件实现单选 */
    var configHtml = '<div class="share-panel__config">';
    configItems.forEach(function (item) {
      if (item.type === 'radio') {
        configHtml += '<div class="share-panel__config-row">';
        item.options.forEach(function (opt) {
          var checked = opt.value === item.defaultValue;
          configHtml += '<label class="checkbox-field share-panel__config-option" role="radio" aria-checked="' + checked + '" data-config-key="' + item.key + '" data-config-value="' + opt.value + '">'
            + '<span class="checkbox checkbox--sm' + (checked ? ' checkbox--checked' : '') + '">'
            + '<span class="checkbox__inner"></span>'
            + (checked ? '<span class="checkbox__icon"><img class="checkbox__asset" src="./lib/assets/icons/checkbox-check.svg" alt=""></span>' : '')
            + '</span>'
            + '<span class="checkbox-field__text' + (checked ? ' is-active' : '') + '">' + opt.label + '</span>'
            + '</label>';
        });
        configHtml += '</div>';
      } else if (item.type === 'button') {
        configHtml += '<button type="button" class="share-panel__config-link" data-action="config-btn" data-config-key="' + item.key + '">'
          + '<span>' + item.label + '</span>'
          + '<i class="wego-iconfont-s icon-youjiantou16" aria-hidden="true"></i>'
          + '</button>';
      }
    });
    configHtml += '</div>';

    /* 其他操作栏：分割线独立占位 + 单行横向滚动，样式与分享渠道一致（52px 图标框 + 下方文字），图标用 iconfont */
    var actionsHtml = '<div class="share-panel__actions-divider" aria-hidden="true"></div>';
    actionsHtml += '<div class="share-panel__actions layout-scroll-row">';
    actions.forEach(function (a) {
      actionsHtml += '<button type="button" class="share-panel__action-item" data-component-slug="button" data-action="' + a.key + '">'
        + '<span class="share-panel__action-icon"><i class="wego-iconfont-s ' + a.icon + '" aria-hidden="true"></i></span>'
        + '<span class="share-panel__action-name">' + a.label + '</span>'
        + '</button>';
    });
    actionsHtml += '</div>';

    /* 滚动指示器：滚动条式进度条（track + thumb），是否有第二组由实际分组决定（init 时控制显隐） */
    var indicatorHtml = '<div class="share-panel__indicator"><div class="share-panel__indicator-thumb"></div></div>';

    /* 标题栏右侧按钮：图标+文字 */
    var headerActionsHtml = '';
    if (showHeaderActions) {
      headerActionsHtml = '<div class="share-panel__header-actions">'
        + '<button type="button" class="share-panel__header-btn" data-action="display-mode" aria-label="展示方式">'
        + '<i class="wego-iconfont-s icon-liebiao" aria-hidden="true"></i>'
        + '<span class="share-panel__header-btn-text">展示方式</span>'
        + '</button>'
        + '<button type="button" class="share-panel__header-btn" data-action="share-settings" aria-label="分享设置">'
        + '<i class="wego-iconfont-s icon-shezhi" aria-hidden="true"></i>'
        + '<span class="share-panel__header-btn-text">分享设置</span>'
        + '</button>'
        + '</div>';
    }

    return '<div class="modal share-panel-modal" data-component-slug="modal" role="dialog" aria-modal="true" aria-label="' + title + '" style="--modal-panel-bg: var(--bg-panel);">'
      + '<div class="modal__panel share-panel__panel">'
      + '<div class="share-panel__header">'
      + '<span class="share-panel__title">' + title + '</span>'
      + headerActionsHtml
      + '</div>'
      + configHtml
      + '<div class="share-panel__channels layout-scroll-row" data-channel-scroll>'
      + renderChannelGroup(group1)
      + (hasMultipleGroups ? renderChannelGroup(group2) : '')
      + '</div>'
      + indicatorHtml
      + actionsHtml
      + '<button type="button" class="share-panel__cancel" data-component-slug="button" data-action="cancel">取消</button>'
      + '</div>'
      + '</div>';
  }

  /* 分享至 XX 弹窗 */
  function shareToChannelTemplate(channelName) {
    return '<div class="share-result-modal" role="dialog" aria-modal="true">'
      + '<div class="share-result-modal__panel">'
      + '<div class="share-result-modal__title">分享至' + channelName + '</div>'
      + '<div class="share-result-modal__body">'
      + '<div class="share-result-modal__item"><i class="wego-iconfont-s icon-duigou share-result-modal__check" aria-hidden="true"></i><span>图片已下载至手机</span></div>'
      + '<div class="share-result-modal__item"><i class="wego-iconfont-s icon-duigou share-result-modal__check" aria-hidden="true"></i><span>文案已复制</span></div>'
      + '</div>'
      + '<div class="share-result-modal__actions">'
      + '<button type="button" class="btn btn--strong btn--md share-result-modal__goto" data-action="goto-channel">去发' + channelName + '</button>'
      + '<button type="button" class="btn btn--weak btn--md share-result-modal__clean" data-action="clean-images">清理已下载图片</button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  /* 下载进度弹窗 */
  function downloadProgressTemplate() {
    return '<div class="download-progress" role="dialog" aria-modal="true">'
      + '<div class="download-progress__panel">'
      + '<div class="download-progress__header">'
      + '<span class="download-progress__title">正在下载</span>'
      + '<button type="button" class="download-progress__close" data-action="cancel-download" aria-label="取消"><i class="wego-iconfont-s icon-guanbi" aria-hidden="true"></i></button>'
      + '</div>'
      + '<div class="download-progress__body">'
      + '<div class="download-progress__filename" data-download-filename>图片 1/3</div>'
      + '<div class="download-progress__bar"><div class="download-progress__bar-fill" data-download-fill style="width:0%"></div></div>'
      + '<div class="download-progress__percent" data-download-percent>0%</div>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  /* 小程序链接二级面板 */
  function miniprogramLinkTemplate() {
    return '<div class="share-panel share-panel--miniprogram" role="dialog" aria-modal="true" aria-label="分享小程序链接">'
      + '<div class="share-panel__panel">'
      + '<div class="share-panel__header">'
      + '<span class="share-panel__title">分享小程序链接</span>'
      + '</div>'
      + '<div class="share-panel__channels">'
      + '<div class="share-panel__channel-group">'
      + '<button type="button" class="share-panel__channel-item" data-miniprogram-channel="wechat"><span class="share-panel__channel-icon"><i class="wego-iconfont-s icon-weixin" aria-hidden="true"></i></span><span class="share-panel__channel-name">微信好友</span></button>'
      + '<button type="button" class="share-panel__channel-item" data-miniprogram-channel="moments"><span class="share-panel__channel-icon"><i class="wego-iconfont-s icon-pengyouquan" aria-hidden="true"></i></span><span class="share-panel__channel-name">朋友圈</span></button>'
      + '<button type="button" class="share-panel__channel-item" data-miniprogram-channel="copy"><span class="share-panel__channel-icon"><i class="wego-iconfont-s icon-fuzhi" aria-hidden="true"></i></span><span class="share-panel__channel-name">复制链接</span></button>'
      + '</div>'
      + '</div>'
      + '<button type="button" class="share-panel__cancel" data-action="cancel-miniprogram">取消</button>'
      + '</div>'
      + '</div>';
  }
  /* ═══════════════════════════════════════════════════════════════
     分享流程模拟
     ═══════════════════════════════════════════════════════════════ */
  function simulateShare(ctx, channelKey, content, callbacks) {
    var channel = getChannel(channelKey);
    if (!channel) return;

    /* 仅文案校验（微博除外） */
    var hasImages = content && content.images && content.images.length > 0;
    var hasVideos = content && content.videos && content.videos.length > 0;
    if (!channel.supportTextOnly && !hasImages && !hasVideos) {
      ctx.toast('请选择图片/视频分享');
      return;
    }

    /* 更新快捷分享记录 */
    setQuickChannel(channelKey);

    /* 更多渠道：拉起系统分享 */
    if (channelKey === 'more') {
      ctx.toast('正在分享...');
      setTimeout(function () {
        ctx.toast('分享成功');
        if (callbacks && callbacks.onSuccess) callbacks.onSuccess();
      }, 800);
      return;
    }

    /* 海报分享：模拟流程 */
    if (channelKey === 'poster') {
      ctx.toast('正在生成海报...');
      setTimeout(function () {
        ctx.toast('分享成功');
        if (callbacks && callbacks.onSuccess) callbacks.onSuccess();
      }, 1000);
      return;
    }

    /* 微信好友：直接模拟分享 */
    if (channelKey === 'wechat') {
      ctx.toast('正在分享...');
      setTimeout(function () {
        ctx.toast('分享成功');
        if (callbacks && callbacks.onSuccess) callbacks.onSuccess();
      }, 800);
      return;
    }

    /* 朋友圈：下载9图分享 */
    if (channelKey === 'moments') {
      simulateDownload(ctx, content, function () {
        ctx.toast('下载成功，文字已复制 去微信分享');
        if (callbacks && callbacks.onSuccess) callbacks.onSuccess();
      });
      return;
    }

    /* 第三方平台：下载 → 分享至 XX 弹窗 → 跳转 */
    ctx.toast('正在分享...');
    setTimeout(function () {
      openShareToChannel(ctx, channel.name, function () {
        if (callbacks && callbacks.onSuccess) callbacks.onSuccess();
      });
    }, 600);
  }

  function simulateDownload(ctx, content, onComplete) {
    var total = (content && content.images ? content.images.length : 0) + (content && content.videos ? content.videos.length : 0);
    if (total === 0) {
      if (onComplete) onComplete();
      return;
    }
    ctx.openSheet(downloadProgressTemplate(), {
      label: '下载进度',
      init: function (sheetCtx) {
        var root = sheetCtx.root;
        var fill = root.querySelector('[data-download-fill]');
        var percent = root.querySelector('[data-download-percent]');
        var filename = root.querySelector('[data-download-filename]');
        var current = 0;
        var cancelled = false;

        var closeBtn = root.querySelector('[data-action="cancel-download"]');
        if (closeBtn) {
          closeBtn.addEventListener('click', function () {
            cancelled = true;
            ctx.closeOverlay();
            ctx.toast('已取消');
          });
        }

        var timer = setInterval(function () {
          if (cancelled) { clearInterval(timer); return; }
          current++;
          var pct = Math.round((current / total) * 100);
          if (fill) fill.style.width = pct + '%';
          if (percent) percent.textContent = pct + '%';
          if (filename) filename.textContent = '图片 ' + current + '/' + total;
          if (current >= total) {
            clearInterval(timer);
            setTimeout(function () {
              ctx.closeOverlay();
              if (onComplete) onComplete();
            }, 300);
          }
        }, 300);
      }
    });
  }

  function openShareToChannel(ctx, channelName, onGoto) {
    ctx.openSheet(shareToChannelTemplate(channelName), {
      label: '分享至' + channelName,
      init: function (sheetCtx) {
        var root = sheetCtx.root;
        var gotoBtn = root.querySelector('[data-action="goto-channel"]');
        var cleanBtn = root.querySelector('[data-action="clean-images"]');
        if (gotoBtn) {
          gotoBtn.addEventListener('click', function () {
            ctx.closeOverlay();
            ctx.toast('跳转' + channelName + '（模拟）');
            setTimeout(function () {
              ctx.toast('分享成功');
              if (onGoto) onGoto();
            }, 800);
          });
        }
        if (cleanBtn) {
          cleanBtn.addEventListener('click', function () {
            ctx.toast('已清理已下载图片（模拟）');
          });
        }
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     公开 API：openProductShare（分享类型由 SHARE_TYPES 注册表分发）
     ═══════════════════════════════════════════════════════════════ */
  function openProductShare(ctx, options) {
    options = options || {};
    var content = options.content || {};
    var config = options.config || {};
    var callbacks = options.callbacks || {};
    var title = options.title || '分享产品';

    var handler = SHARE_TYPES[options.contentType || 'panel'] || SHARE_TYPES.panel;
    ctx.openSheet(handler.render({ title: title, config: config }), {
      label: title,
      init: function (sheetCtx) {
        var root = sheetCtx.root;
        var mainPanel = root;

        /* 渠道点击 */
        root.querySelectorAll('[data-channel]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var channelKey = btn.getAttribute('data-channel');
            ctx.closeOverlay();
            simulateShare(ctx, channelKey, content, {
              onSuccess: function () {
                if (callbacks.onChannelSelect) callbacks.onChannelSelect(channelKey);
                if (callbacks.onSuccess) callbacks.onSuccess();
              }
            });
          });
        });

        /* 配置栏单选切换 */
        root.querySelectorAll('.share-panel__config-option').forEach(function (option) {
          option.addEventListener('click', function () {
            var configKey = option.getAttribute('data-config-key');
            var value = option.getAttribute('data-config-value');
            /* 同组其他选项取消选中 */
            root.querySelectorAll('.share-panel__config-option[data-config-key="' + configKey + '"]').forEach(function (other) {
              other.setAttribute('aria-checked', 'false');
              var checkbox = other.querySelector('.checkbox');
              if (checkbox) checkbox.classList.remove('checkbox--checked');
              var icon = other.querySelector('.checkbox__icon');
              if (icon) icon.remove();
              var text = other.querySelector('.checkbox-field__text');
              if (text) text.classList.remove('is-active');
            });
            /* 当前选项选中 */
            option.setAttribute('aria-checked', 'true');
            var checkbox = option.querySelector('.checkbox');
            if (checkbox) checkbox.classList.add('checkbox--checked');
            var iconEl = checkbox.querySelector('.checkbox__icon');
            if (!iconEl) {
              iconEl = document.createElement('span');
              iconEl.className = 'checkbox__icon';
              iconEl.innerHTML = '<img class="checkbox__asset" src="./lib/assets/icons/checkbox-check.svg" alt="">';
              checkbox.appendChild(iconEl);
            }
            var text = option.querySelector('.checkbox-field__text');
            if (text) text.classList.add('is-active');
          });
        });

        /* 其他操作 */
        root.querySelectorAll('[data-action]').forEach(function (btn) {
          var action = btn.getAttribute('data-action');
          if (action === 'cancel') {
            btn.addEventListener('click', function () {
              ctx.closeOverlay();
              if (callbacks.onClose) callbacks.onClose();
            });
          } else if (action === 'display-mode' || action === 'share-settings') {
            btn.addEventListener('click', function () {
              ctx.toast('已有功能（演示）');
            });
          } else if (action === 'config-btn') {
            btn.addEventListener('click', function () {
              ctx.toast('已有功能（演示）');
            });
          } else if (action === 'saveImages') {
            btn.addEventListener('click', function () {
              ctx.closeOverlay();
              simulateDownload(ctx, content, function () {
                ctx.toast('下载成功，文字已复制 去微信分享');
                if (callbacks.onSaveImages) callbacks.onSaveImages();
              });
            });
          } else if (action === 'miniprogramLink') {
            btn.addEventListener('click', function () {
              /* 主面板关闭，弹出二级面板 */
              ctx.closeOverlay();
              setTimeout(function () {
                openMiniprogramLink(ctx, callbacks);
              }, 200);
            });
          } else if (action === 'barcode') {
            btn.addEventListener('click', function () {
              ctx.toast('打商品条码（演示）');
            });
          }
        });

        /* 渠道栏：动态分组 + 组宽按屏幕计算（item 68px，每行 N=(可用宽-16)/68，组宽=N×68+16）+ 滚动条式指示器跟随 */
        var channelScroll = root.querySelector('[data-channel-scroll]');
        var indicatorThumb = root.querySelector('.share-panel__indicator-thumb');
        var indicatorEl = root.querySelector('.share-panel__indicator');
        if (channelScroll) {
          /* 每行 item 数量与组宽（减左右 8px 内边距） */
          var available = channelScroll.clientWidth - 16;
          var perRow = Math.max(1, Math.floor(available / 68));
          var perGroup = perRow * 2;
          var groupWidth = perRow * 68 + 16;

          /* 动态分组：渠道按配置顺序，每组最多 2N 个（双行），剩余进下一组 */
          var allItems = Array.prototype.slice.call(channelScroll.querySelectorAll('.share-panel__channel-item'));
          channelScroll.querySelectorAll('.share-panel__channel-group').forEach(function (g) {
            g.parentNode.removeChild(g);
          });
          var groupCount = Math.max(1, Math.ceil(allItems.length / perGroup));
          var groupEls = [];
          for (var gi = 0; gi < groupCount; gi++) {
            var gEl = document.createElement('div');
            gEl.className = 'share-panel__channel-group';
            gEl.style.flexBasis = groupWidth + 'px';
            gEl.style.minWidth = groupWidth + 'px';
            channelScroll.appendChild(gEl);
            groupEls.push(gEl);
          }
          allItems.forEach(function (item, idx) {
            groupEls[Math.min(groupCount - 1, Math.floor(idx / perGroup))].appendChild(item);
          });

          /* 指示器：仅有多组（有第二组）时显示 */
          if (indicatorEl) {
            indicatorEl.style.display = groupCount > 1 ? '' : 'none';
          }

          /* 滚动条式指示器：thumb 位置/宽度随滚动进度 */
          var updateThumb = function () {
            if (!indicatorThumb) return;
            var maxScroll = channelScroll.scrollWidth - channelScroll.clientWidth;
            if (maxScroll <= 0) {
              indicatorThumb.style.width = '100%';
              indicatorThumb.style.transform = 'translateX(0)';
              return;
            }
            var track = indicatorThumb.parentElement;
            var trackW = track.clientWidth;
            var thumbW = Math.max(16, trackW * (channelScroll.clientWidth / channelScroll.scrollWidth));
            var maxTrack = trackW - thumbW;
            var x = maxTrack * (channelScroll.scrollLeft / maxScroll);
            indicatorThumb.style.width = thumbW + 'px';
            indicatorThumb.style.transform = 'translateX(' + x + 'px)';
          };
          updateThumb();
          channelScroll.addEventListener('scroll', updateThumb, { passive: true });
        }

        /* 遮罩点击关闭 */
        root.addEventListener('click', function (e) {
          if (e.target === root) {
            ctx.closeOverlay();
            if (callbacks.onClose) callbacks.onClose();
          }
        });
      }
    });
  }

  function openMiniprogramLink(ctx, callbacks) {
    ctx.openSheet(miniprogramLinkTemplate(), {
      label: '分享小程序链接',
      init: function (sheetCtx) {
        var root = sheetCtx.root;
        var reopenMain = false;

        root.querySelectorAll('[data-miniprogram-channel]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var ch = btn.getAttribute('data-miniprogram-channel');
            ctx.closeOverlay();
            if (ch === 'copy') {
              ctx.toast('复制成功');
            } else {
              ctx.toast('分享成功');
            }
            if (callbacks.onMiniprogramShare) callbacks.onMiniprogramShare(ch);
          });
        });

        var cancelBtn = root.querySelector('[data-action="cancel-miniprogram"]');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', function () {
            reopenMain = true;
            ctx.closeOverlay();
            /* 取消时重新打开主面板 */
            setTimeout(function () {
              if (callbacks.onReopenMain) callbacks.onReopenMain();
            }, 200);
          });
        }

        root.addEventListener('click', function (e) {
          if (e.target === root) {
            ctx.closeOverlay();
            setTimeout(function () {
              if (callbacks.onReopenMain) callbacks.onReopenMain();
            }, 200);
          }
        });
      }
    });
  }


  /* SHARE_TYPES 分享类型注册表：新增内容类型（列表页/个人主页/单据/海报/订单等）在此注册 render + config，
     业务层 openProductShare 按 contentType 分发，不改核心逻辑。 */
  var SHARE_TYPES = {
    panel: { label: '产品分享', render: sharePanelTemplate }
  };

  /* 暴露公开 API */
  window.WegoApp.openProductShare = openProductShare;
  window.WegoApp.getQuickChannel = getQuickChannel;
  window.WegoApp.setQuickChannel = setQuickChannel;
  window.WegoApp.getForwardedProducts = getForwardedProducts;
  window.WegoApp.addForwardedProduct = addForwardedProduct;
  window.WegoApp.simulateShare = simulateShare;
  window.WegoApp.simulateDownload = simulateDownload;

})();
