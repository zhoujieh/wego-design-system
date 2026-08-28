/* 产品分享场景（shop243 鸿蒙1.3分享能力升级）
   - WegoApp.db 统一数据层（渐进式接入，不碰现有 key）
   - 通用分享面板组件 window.WegoApp.openSharePanel
   - 转发编辑页（复用发布产品页，发布按钮改转发）
   - 灰度升级弹窗
   - 分享流程模拟（下载进度、第三方跳转、小程序链接等） */

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
    { key: 'moments', name: '朋友圈', icon: 'icon-pengyouquan', group: 1, supportTextOnly: false },
    { key: 'poster', name: '海报分享', icon: 'icon-haibao', group: 1, supportTextOnly: true },
    { key: 'wechat', name: '微信好友', icon: 'icon-weixin', group: 1, supportTextOnly: true },
    { key: 'channels', name: '视频号', icon: 'icon-shipinhao', group: 1, supportTextOnly: false },
    { key: 'xianyu', name: '闲鱼', icon: 'icon-xianyu', group: 1, supportTextOnly: false },
    { key: 'xiaohongshu', name: '小红书', icon: 'icon-xiaohongshu', group: 1, supportTextOnly: false },
    { key: 'kuaishou', name: '快手', icon: 'icon-kuaishou', group: 1, supportTextOnly: false },
    { key: 'douyin', name: '抖音', icon: 'icon-douyin', group: 1, supportTextOnly: false },
    { key: 'weibo', name: '微博', icon: 'icon-weibo', group: 1, supportTextOnly: true },
    { key: 'zhuanzhuan', name: '转转', icon: 'icon-zhuanzhuan', group: 2, supportTextOnly: false },
    { key: 'more', name: '更多', icon: 'icon-gengduo', group: 2, supportTextOnly: true }
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
     灰度弹窗状态
     ═══════════════════════════════════════════════════════════════ */
  function shouldShowGrayPopup(type) {
    var key = 'wego.gray-popup.' + type;
    var record = DB.get(key);
    var today = new Date().toISOString().slice(0, 10);
    if (type === 'dismissible') {
      return !record || record.lastShownDate !== today;
    } else {
      return !record || !record.shown;
    }
  }
  function markGrayPopupShown(type) {
    var key = 'wego.gray-popup.' + type;
    var today = new Date().toISOString().slice(0, 10);
    if (type === 'dismissible') {
      DB.set(key, { lastShownDate: today });
    } else {
      DB.set(key, { shown: true });
    }
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

    /* 渠道栏：按 group 分组渲染 */
    var group1 = CHANNELS.filter(function (c) { return c.group === 1 && channels.indexOf(c.key) >= 0; });
    var group2 = CHANNELS.filter(function (c) { return c.group === 2 && channels.indexOf(c.key) >= 0; });
    var hasMultipleGroups = group1.length > 0 && group2.length > 0;

    function renderChannelGroup(group) {
      var html = '<div class="share-panel__channel-group">';
      group.forEach(function (c) {
        html += '<button type="button" class="share-panel__channel-item" data-component-slug="button" data-channel="' + c.key + '">'
          + '<span class="share-panel__channel-icon"><i class="wego-iconfont-s ' + c.icon + '" aria-hidden="true"></i></span>'
          + '<span class="share-panel__channel-name">' + c.name + '</span>'
          + '</button>';
      });
      html += '</div>';
      return html;
    }

    /* 配置栏 */
    var configHtml = '<div class="share-panel__config">';
    configItems.forEach(function (item) {
      if (item.type === 'radio') {
        configHtml += '<div class="share-panel__config-row">';
        item.options.forEach(function (opt) {
          var checked = opt.value === item.defaultValue ? ' checked' : '';
          configHtml += '<label class="share-panel__config-option">'
            + '<input type="radio" name="share-config-' + item.key + '" value="' + opt.value + '"' + checked + ' data-config-key="' + item.key + '" />'
            + '<span>' + opt.label + '</span>'
            + '</label>';
        });
        configHtml += '</div>';
      } else if (item.type === 'button') {
        configHtml += '<button type="button" class="share-panel__config-btn" data-action="config-btn" data-config-key="' + item.key + '">' + item.label + '</button>';
      }
    });
    configHtml += '</div>';

    /* 其他操作栏 */
    var actionsHtml = '<div class="share-panel__actions">';
    actions.forEach(function (a) {
      actionsHtml += '<button type="button" class="share-panel__action-item" data-component-slug="button" data-action="' + a.key + '">'
        + '<span class="share-panel__action-icon"><i class="wego-iconfont-s ' + a.icon + '" aria-hidden="true"></i></span>'
        + '<span class="share-panel__action-name">' + a.label + '</span>'
        + '</button>';
    });
    actionsHtml += '</div>';

    /* 滚动指示器 */
    var indicatorHtml = '';
    if (hasMultipleGroups) {
      indicatorHtml = '<div class="share-panel__indicator">'
        + '<span class="share-panel__indicator-dot share-panel__indicator-dot--active"></span>'
        + '<span class="share-panel__indicator-dot"></span>'
        + '</div>';
    }

    return '<div class="share-panel" role="dialog" aria-modal="true" aria-label="' + title + '">'
      + '<div class="share-panel__panel">'
      + '<div class="share-panel__header">'
      + '<span class="share-panel__title">' + title + '</span>'
      + (showHeaderActions ? '<div class="share-panel__header-actions">'
        + '<button type="button" class="share-panel__header-btn" data-action="display-mode" aria-label="展示方式"><i class="wego-iconfont-s icon-zhanshi" aria-hidden="true"></i></button>'
        + '<button type="button" class="share-panel__header-btn" data-action="share-settings" aria-label="分享设置"><i class="wego-iconfont-s icon-shezhi" aria-hidden="true"></i></button>'
        + '</div>' : '')
      + '</div>'
      + configHtml
      + '<div class="share-panel__channels" data-channel-scroll>'
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

  /* 灰度弹窗 */
  function grayPopupTemplate(type) {
    var isForced = type === 'forced';
    return '<div class="modal modal--fullscreen gray-popup-modal" data-component-slug="modal" data-state="open" role="dialog" aria-modal="true" aria-label="发现新版本">'
      + '<div class="modal__panel gray-popup__panel">'
      + '<div class="gray-popup__header"></div>'
      + '<div class="gray-popup__body">'
      + '<ol class="gray-popup__list">'
      + '<li>浏览相册更流畅，无需等待体验更好</li>'
      + '<li>动态顶部显示上新好友，方便看款转图</li>'
      + '<li>可开启微商相册输入法，和客户边聊天边推款</li>'
      + '<li>修复已知问题</li>'
      + '</ol>'
      + '</div>'
      + '<div class="gray-popup__actions">'
      + '<button type="button" class="gray-popup__confirm" data-action="gray-confirm">立即体验</button>'
      + (isForced ? '' : '<button type="button" class="gray-popup__later" data-action="gray-later">近期不再提醒</button>')
      + '</div>'
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
     公开 API：openSharePanel
     ═══════════════════════════════════════════════════════════════ */
  function openSharePanel(ctx, options) {
    options = options || {};
    var content = options.content || {};
    var config = options.config || {};
    var callbacks = options.callbacks || {};
    var title = options.title || '分享产品';

    ctx.openSheet(sharePanelTemplate({ title: title, config: config }), {
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

  /* ═══════════════════════════════════════════════════════════════
     灰度弹窗
     ═══════════════════════════════════════════════════════════════ */
  function openGrayPopup(ctx, type) {
    if (!shouldShowGrayPopup(type)) return;
    markGrayPopupShown(type);

    ctx.openFullScreenModal(grayPopupTemplate(type), {
      label: '灰度升级',
      init: function (overlayCtx) {
        var root = overlayCtx.root;
        var confirmBtn = root.querySelector('[data-action="gray-confirm"]');
        var laterBtn = root.querySelector('[data-action="gray-later"]');

        if (confirmBtn) {
          confirmBtn.addEventListener('click', function () {
            ctx.closeOverlay();
            ctx.toast('跳转应用市场（模拟）');
          });
        }
        if (laterBtn) {
          laterBtn.addEventListener('click', function () {
            ctx.closeOverlay();
          });
        }
        /* 点击遮罩关闭（仅可关闭型） */
        if (type !== 'forced') {
          root.addEventListener('click', function (e) {
            if (e.target === root) ctx.closeOverlay();
          });
        }
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     转发编辑页（复用发布产品页，发布按钮改转发）
     ═══════════════════════════════════════════════════════════════ */
  function openForwardEditor(ctx, product, onForward) {
    /* 复用发布产品模态，传入 forward 模式 */
    if (window.WegoApp.openPublishProductModal) {
      window.WegoApp.openPublishProductModal(ctx, {
        mode: 'forward',
        product: product,
        onForward: function (forwardedProduct) {
          addForwardedProduct(forwardedProduct);
          ctx.toast('转发成功');
          if (onForward) onForward(forwardedProduct);
        }
      });
    } else {
      /* fallback：简单模拟 */
      ctx.toast('转发编辑页（演示）');
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     暴露公开 API
     ═══════════════════════════════════════════════════════════════ */
  window.WegoApp.openSharePanel = openSharePanel;
  window.WegoApp.openGrayPopup = openGrayPopup;
  window.WegoApp.openForwardEditor = openForwardEditor;
  window.WegoApp.getQuickChannel = getQuickChannel;
  window.WegoApp.setQuickChannel = setQuickChannel;
  window.WegoApp.getForwardedProducts = getForwardedProducts;
  window.WegoApp.addForwardedProduct = addForwardedProduct;
  window.WegoApp.simulateShare = simulateShare;
  window.WegoApp.simulateDownload = simulateDownload;

})();
