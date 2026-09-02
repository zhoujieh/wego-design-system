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
    { key: 'copy', name: '复制链接', icon: 'icon-fuzhi', iconSvg: null, group: 2, supportTextOnly: true, miniprogramOnly: true },
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
    var content = opts.content || {};
    var channels = config.channels || CHANNELS.filter(function (c) { return !c.miniprogramOnly; }).map(function (c) { return c.key; });
    var showHeaderActions = config.showHeaderActions !== false;
    var configItems = config.configItems || [
      { key: 'miniprogram', type: 'checkbox', label: '小程序码', defaultValue: true },
      { key: 'textLink', type: 'checkbox', label: '文案带链接', defaultValue: false },
      { key: 'customerTag', type: 'button', label: '给客户打标' }
    ];
    /* 数据状态：S2 纯文字（无图无视频）时隐藏「保存图片」按钮；S3 视频为主（有视频无图片）时保存按钮文案改为「保存视频」 */
    var hasImages = content.images && content.images.length > 0;
    var hasVideos = content.videos && content.videos.length > 0;
    var isTextOnly = !hasImages && !hasVideos;
    var isVideoOnly = hasVideos && !hasImages;
    var actions = (config.actions || [
      { key: 'miniprogramLink', label: '小程序链接', icon: 'icon-lianjie', style: 'icon-text' },
      { key: 'saveImages', label: '保存图片', icon: 'icon-xiazai', style: 'icon-text' },
      { key: 'barcode', label: '打商品条码', icon: 'icon-dayinshangpintiaoma', style: 'icon-text' }
    ]).map(function (a) {
      if (a.key === 'saveImages') {
        if (isTextOnly) return null;
        if (isVideoOnly) return { key: 'saveImages', label: '保存视频', icon: a.icon, style: a.style };
      }
      return a;
    }).filter(Boolean);

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

    /* 配置栏：checkbox 独立多选；配置项为空时不渲染、不占位 */
    var configHtml = '';
    if (configItems.length > 0) {
      /* 配置栏左右分区：左侧 checkbox 多选（小程序码/文案带链接），右侧 button（给客户打标）右对齐 */
      var leftItems = configItems.filter(function (item) { return item.type === 'checkbox'; });
      var rightItems = configItems.filter(function (item) { return item.type === 'button'; });
      configHtml = '<div class="share-panel__config">';
      if (leftItems.length > 0) {
        configHtml += '<div class="share-panel__config-row">';
        leftItems.forEach(function (item) {
          var checked = !!item.defaultValue;
          configHtml += '<label class="checkbox-field share-panel__config-option" role="checkbox" aria-checked="' + checked + '" data-config-key="' + item.key + '" data-config-value="' + item.key + '">'
            + '<span class="checkbox checkbox--sm' + (checked ? ' checkbox--checked' : '') + '">'
            + '<span class="checkbox__inner"></span>'
            + (checked ? '<span class="checkbox__icon"><img class="checkbox__asset" src="./lib/assets/icons/checkbox-check.svg" alt=""></span>' : '')
            + '</span>'
            + '<span class="checkbox-field__text' + (checked ? ' is-active' : '') + '">' + item.label + '</span>'
            + '</label>';
        });
        configHtml += '</div>';
      }
      if (rightItems.length > 0) {
        configHtml += '<div class="share-panel__config-actions">';
        rightItems.forEach(function (item) {
          configHtml += '<button type="button" class="share-panel__config-link" data-action="config-btn" data-config-key="' + item.key + '">'
            + '<span>' + item.label + '</span>'
            + '<i class="wego-iconfont-s icon-youjiantou16" aria-hidden="true"></i>'
            + '</button>';
        });
        configHtml += '</div>';
      }
      configHtml += '</div>';
    }

    /* 其他操作栏：单行横向滚动，样式与分享渠道一致（52px 图标框 + 下方文字），图标用 iconfont；无操作项时不渲染容器 */
    var actionsHtml = '';
    if (actions.length > 0) {
      actionsHtml = '<div class="share-panel__actions layout-scroll-row">';
      actions.forEach(function (a) {
        actionsHtml += '<button type="button" class="share-panel__action-item" data-component-slug="button" data-action="' + a.key + '">'
          + '<span class="share-panel__action-icon"><i class="wego-iconfont-s ' + a.icon + '" aria-hidden="true"></i></span>'
          + '<span class="share-panel__action-name">' + a.label + '</span>'
          + '</button>';
      });
      actionsHtml += '</div>';
    }

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

  /* ═══════════════════════════════════════════════════════════════
     居中浮层加载（复用 Loading 组件 usage=overlay 形态，外壳同 Toast）
     - 不带进度：三点 + 单行文案；带进度：白色进度环 + 状态文案 + 百分比
     - 结果态：勾(icon-goutoast)/叉(icon-chatoast) + 单行结果文案，停留后自动消失
     - 挂载到 toast 宿主，z-index 与 Toast 同层（--z-toast）
     ═══════════════════════════════════════════════════════════════ */
  function getOverlayHost() {
    return document.querySelector('[data-toast-host]') || document.body;
  }

  function mountOverlay(innerHtml) {
    var host = getOverlayHost();
    var el = document.createElement('div');
    el.className = 'loading-overlay';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = innerHtml;
    host.appendChild(el);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('is-visible');
      });
    });
    return el;
  }

  function removeOverlay(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  /* 不带进度浮层：三点 + 单行文案；返回关闭函数 */
  function showOverlayLoading(label) {
    var el = mountOverlay(
      '<span class="loading loading--24 loading-overlay__indicator" role="img" aria-label="加载中">'
      + '<span class="loading__icon"><span class="loading__dot loading__dot--1"></span><span class="loading__dot loading__dot--2"></span><span class="loading__dot loading__dot--3"></span></span>'
      + '</span>'
      + '<div class="loading-overlay__text"><span class="loading-overlay__label">' + (label || '正在加载') + '</span></div>'
    );
    return function () { removeOverlay(el); };
  }

  /* 带进度浮层：白色进度环 + 状态文案 + 百分比；返回 { update(pct), done() } */
  function showOverlayProgress(label) {
    var el = mountOverlay(
      '<svg class="loading-ring" viewBox="0 0 48 48" role="img" aria-label="加载中" style="--progress:0">'
      + '<circle class="loading-ring__track" cx="24" cy="24" r="20"></circle>'
      + '<circle class="loading-ring__bar" cx="24" cy="24" r="20"></circle>'
      + '</svg>'
      + '<div class="loading-overlay__text">'
      + '<span class="loading-overlay__label">' + (label || '正在下载') + '</span>'
      + '<span class="loading-overlay__percent">0%</span>'
      + '</div>'
    );
    var ring = el.querySelector('.loading-ring');
    var percentEl = el.querySelector('.loading-overlay__percent');
    return {
      update: function (pct) {
        var p = Math.max(0, Math.min(100, Math.round(pct || 0)));
        if (ring) ring.style.setProperty('--progress', p);
        if (percentEl) percentEl.textContent = p + '%';
      },
      done: function () { removeOverlay(el); }
    };
  }

  /* 居中结果提示：复用 loading-overlay 外壳（勾/叉图标 + 单行结果文案），停留后自动消失；
     同屏互斥：先移除宿主内残留 toast，避免与居中结果叠加 */
  function showOverlayResult(icon, text, duration, onDone) {
    var host = getOverlayHost();
    Array.prototype.slice.call(host.querySelectorAll('.toast')).forEach(function (n) { n.remove(); });
    var el = mountOverlay(
      '<span class="loading-overlay__result-icon ' + icon + '"></span>'
      + '<div class="loading-overlay__text"><span class="loading-overlay__label">' + (text || '') + '</span></div>'
    );
    setTimeout(function () {
      removeOverlay(el);
      if (onDone) onDone();
    }, typeof duration === 'number' ? duration : 1500);
    return function () { removeOverlay(el); };
  }

  /* 分享完成：居中结果「分享成功」+ 回调 */
  function completeShare(callbacks) {
    showOverlayResult('icon-goutoast', '分享成功', 1500, function () {
      if (callbacks && callbacks.onSuccess) callbacks.onSuccess();
    });
  }

  /* 分享加载：居中浮层（不带进度）→ 完成后居中结果「分享成功」 */
  function runShareWithLoading(label, delay, callbacks) {
    var hide = showOverlayLoading(label);
    setTimeout(function () {
      hide();
      completeShare(callbacks);
    }, delay);
  }

  /* ═══════════════════════════════════════════════════════════════
     分享流程模拟
     ═══════════════════════════════════════════════════════════════ */
  /* 数据状态判定：S1 完整商品（图+标题，可含视频）/ S2 纯文字（仅标题）/ S3 视频为主（视频+标题，无图） */
  function resolveDataState(content) {
    var hasImages = content && content.images && content.images.length > 0;
    var hasVideos = content && content.videos && content.videos.length > 0;
    if (!hasImages && !hasVideos) return 'S2';
    if (hasVideos && !hasImages) return 'S3';
    return 'S1';
  }

  function simulateShare(ctx, channelKey, content, callbacks) {
    var channel = getChannel(channelKey);
    if (!channel) return;

    var state = resolveDataState(content);
    var hasImages = content && content.images && content.images.length > 0;
    var hasVideos = content && content.videos && content.videos.length > 0;

    /* 数据状态 × 渠道交互差异（场景管理重构） */
    if (state === 'S2') {
      /* 纯文字：仅标题，无图无视频 */
      if (channelKey === 'moments' || channelKey === 'poster') {
        ctx.toast('暂无图片');
        return;
      }
      if (channelKey === 'channels') {
        ctx.toast('暂不支持');
        return;
      }
      if (channelKey === 'wechat') {
        ctx.toast('复制成功');
        setQuickChannel(channelKey);
        if (callbacks && callbacks.onSuccess) callbacks.onSuccess();
        return;
      }
      /* 其他渠道（第三方平台等）：仅文案校验，微博例外 */
      if (!channel.supportTextOnly) {
        ctx.toast('请选择图片/视频分享');
        return;
      }
    }

    if (state === 'S3' && channelKey === 'poster') {
      ctx.toast('暂无图片');
      return;
    }

    /* 更新快捷分享记录 */
    setQuickChannel(channelKey);

    /* 更多渠道：拉起系统分享 */
    if (channelKey === 'more') {
      runShareWithLoading('正在分享…', 800, callbacks);
      return;
    }

    /* 海报分享：模拟流程 */
    if (channelKey === 'poster') {
      runShareWithLoading('正在生成海报…', 1000, callbacks);
      return;
    }

    /* 微信好友：直接模拟分享 */
    if (channelKey === 'wechat') {
      runShareWithLoading('正在分享…', 800, callbacks);
      return;
    }

    /* 朋友圈：下载9图分享 */
    if (channelKey === 'moments') {
      simulateDownload(ctx, content, function () {
        ctx.toast({
          variant: 'guide',
          icon: 'icon-goutoast',
          text: '下载成功，文字已复制',
          action: { label: '去微信分享', mode: 'strong' }
        });
        if (callbacks && callbacks.onSuccess) callbacks.onSuccess();
      });
      return;
    }

    /* 复制链接（小程序链接二级面板渠道）：直接复制 */
    if (channelKey === 'copy') {
      ctx.toast('复制成功');
      if (callbacks && callbacks.onSuccess) callbacks.onSuccess();
      return;
    }

    /* 第三方平台：下载 → 分享至 XX 弹窗 → 跳转 */
    var hideThird = showOverlayLoading('正在分享…');
    setTimeout(function () {
      hideThird();
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
    /* 下载进度：居中浮层带进度（白色进度环 + 百分比），按素材数推进 */
    var progress = showOverlayProgress('正在下载');
    var current = 0;
    var timer = setInterval(function () {
      current++;
      progress.update((current / total) * 100);
      if (current >= total) {
        clearInterval(timer);
        setTimeout(function () {
          progress.done();
          if (onComplete) onComplete();
        }, 300);
      }
    }, 300);
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
            /* 只关闭本面板，不关闭底层页面（发布页分享时保持当前页继续编辑） */
            sheetCtx.close();
            ctx.toast('跳转' + channelName + '（模拟）');
            setTimeout(function () {
              showOverlayResult('icon-goutoast', '分享成功');
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
    var contentType = options.contentType || 'panel';
    /* 内部机制：二级面板（如小程序链接）取消/遮罩时恢复主分享面板，由上层在 options._reopenMain 注入 */
    var reopenMain = options._reopenMain || null;

    var handler = SHARE_TYPES[contentType] || SHARE_TYPES.panel;
    ctx.openSheet(handler.render({ title: title, config: config, content: content }), {
      label: title,
      init: function (sheetCtx) {
        var root = sheetCtx.root;
        var mainPanel = root;

        /* 渠道点击 */
        root.querySelectorAll('[data-channel]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var channelKey = btn.getAttribute('data-channel');
            /* 只关闭本分享面板，不关闭底层页面（发布页分享时保持当前页继续编辑） */
            sheetCtx.close();
            simulateShare(ctx, channelKey, content, {
              onSuccess: function () {
                if (callbacks.onChannelSelect) callbacks.onChannelSelect(channelKey);
                if (callbacks.onSuccess) callbacks.onSuccess();
              }
            });
          });
        });

        /* 配置栏 checkbox 独立多选切换：每项独立勾选，互不影响 */
        root.querySelectorAll('.share-panel__config-option').forEach(function (option) {
          option.addEventListener('click', function () {
            var configKey = option.getAttribute('data-config-key');
            var value = option.getAttribute('data-config-value');
            var isChecked = option.getAttribute('aria-checked') === 'true';
            var newChecked = !isChecked;
            /* 当前项切换选中态 */
            option.setAttribute('aria-checked', String(newChecked));
            var checkbox = option.querySelector('.checkbox');
            var text = option.querySelector('.checkbox-field__text');
            if (newChecked) {
              if (checkbox) checkbox.classList.add('checkbox--checked');
              var iconEl = checkbox.querySelector('.checkbox__icon');
              if (checkbox && !iconEl) {
                iconEl = document.createElement('span');
                iconEl.className = 'checkbox__icon';
                iconEl.innerHTML = '<img class="checkbox__asset" src="./lib/assets/icons/checkbox-check.svg" alt="">';
                checkbox.appendChild(iconEl);
              }
              if (text) text.classList.add('is-active');
            } else {
              if (checkbox) checkbox.classList.remove('checkbox--checked');
              var iconEl2 = checkbox.querySelector('.checkbox__icon');
              if (iconEl2) iconEl2.remove();
              if (text) text.classList.remove('is-active');
            }
          });
        });

        /* 其他操作 */
        root.querySelectorAll('[data-action]').forEach(function (btn) {
          var action = btn.getAttribute('data-action');
          if (action === 'cancel') {
            btn.addEventListener('click', function () {
              /* 只关闭本分享面板，不关闭底层页面（发布页分享时取消分享保持当前页继续编辑） */
              sheetCtx.close();
              /* 二级面板取消：关闭并恢复主面板；主面板取消：仅关闭 */
              if (reopenMain) reopenMain();
              else if (callbacks.onClose) callbacks.onClose();
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
              /* 只关闭本分享面板，不关闭底层页面 */
              sheetCtx.close();
              simulateDownload(ctx, content, function () {
                ctx.toast({
                  variant: 'guide',
                  icon: 'icon-goutoast',
                  text: '下载成功，文字已复制',
                  action: { label: '去微信分享', mode: 'strong' }
                });
                if (callbacks.onSaveImages) callbacks.onSaveImages();
              });
            });
          } else if (action === 'miniprogramLink') {
            btn.addEventListener('click', function () {
              /* 只关闭本分享面板，从底部重新弹出「分享小程序链接」二级面板（组件化复用：同一 openProductShare 入口 + sharePanelTemplate 渲染） */
              sheetCtx.close();
              setTimeout(function () {
                openProductShare(ctx, {
                  contentType: 'miniprogram',
                  title: '分享小程序链接',
                  config: {
                    channels: ['wechat', 'moments', 'copy'],
                    showHeaderActions: false,
                    configItems: [],
                    actions: []
                  },
                  callbacks: callbacks,
                  /* 取消/遮罩二级面板时自动恢复主分享面板 */
                  _reopenMain: function () {
                    openProductShare(ctx, {
                      title: title,
                      content: content,
                      config: config,
                      callbacks: callbacks
                    });
                  }
                });
              }, 200);
            });
          } else if (action === 'barcode') {
            btn.addEventListener('click', function () {
              ctx.toast('打商品条码（演示）');
            });
          }
        });

        /* 渠道栏：动态分组 + 组宽按屏幕计算（item 68px，每行 N=可用宽/68，组宽=N×68）+ 指示器 thumb 按分组数动态宽度 + 视口变化实时重算 */
        var channelScroll = root.querySelector('[data-channel-scroll]');
        var indicatorThumb = root.querySelector('.share-panel__indicator-thumb');
        var indicatorEl = root.querySelector('.share-panel__indicator');
        if (channelScroll) {
          /* 保存所有渠道项引用，重分组时复用 */
          var allItems = Array.prototype.slice.call(channelScroll.querySelectorAll('.share-panel__channel-item'));
          var currentGroupCount = 1;

          var layoutChannels = function () {
            var available = channelScroll.clientWidth;
            var perRow = Math.max(1, Math.floor(available / 68));
            var perGroup = perRow * 2;
            var groupWidth = perRow * 68;

            /* 移除旧分组 */
            channelScroll.querySelectorAll('.share-panel__channel-group').forEach(function (g) {
              g.parentNode.removeChild(g);
            });

            /* 重新分组 */
            currentGroupCount = Math.max(1, Math.ceil(allItems.length / perGroup));
            var groupEls = [];
            for (var gi = 0; gi < currentGroupCount; gi++) {
              var gEl = document.createElement('div');
              gEl.className = 'share-panel__channel-group';
              gEl.style.flexBasis = groupWidth + 'px';
              gEl.style.minWidth = groupWidth + 'px';
              channelScroll.appendChild(gEl);
              groupEls.push(gEl);
            }
            allItems.forEach(function (item, idx) {
              groupEls[Math.min(currentGroupCount - 1, Math.floor(idx / perGroup))].appendChild(item);
            });

            /* 指示器显隐 */
            if (indicatorEl) {
              indicatorEl.style.display = currentGroupCount > 1 ? '' : 'none';
            }
          };

          /* 指示器：thumb 宽度 = 100% / 分组数（两组 50%、三组 33.3%），位置随滚动进度 */
          var updateThumb = function () {
            if (!indicatorThumb) return;
            var maxScroll = channelScroll.scrollWidth - channelScroll.clientWidth;
            if (maxScroll <= 0 || currentGroupCount <= 1) {
              indicatorThumb.style.width = '100%';
              indicatorThumb.style.transform = 'translateX(0)';
              return;
            }
            var track = indicatorThumb.parentElement;
            var trackW = track.clientWidth;
            var thumbW = trackW / currentGroupCount;
            var maxTrack = trackW - thumbW;
            var x = maxTrack * (channelScroll.scrollLeft / maxScroll);
            indicatorThumb.style.width = thumbW + 'px';
            indicatorThumb.style.transform = 'translateX(' + x + 'px)';
          };

          layoutChannels();
          updateThumb();
          channelScroll.addEventListener('scroll', updateThumb, { passive: true });

          /* 视口宽度变化时实时重算分组与指示器（防抖 150ms） */
          var resizeTimer = null;
          var onResize = function () {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
              layoutChannels();
              updateThumb();
            }, 150);
          };
          window.addEventListener('resize', onResize);
        }

        /* 遮罩点击关闭：二级面板点遮罩关闭并恢复主面板；主面板点遮罩仅关闭（只关本面板，不关底层页面） */
        root.addEventListener('click', function (e) {
          if (e.target === root) {
            sheetCtx.close();
            if (reopenMain) reopenMain();
            else if (callbacks.onClose) callbacks.onClose();
          }
        });
      }
    });
  }

  /* SHARE_TYPES 分享类型注册表：新增内容类型（列表页/个人主页/单据/海报/订单等）在此注册 render + config，
     业务层 openProductShare 按 contentType 分发，不改核心逻辑。 */
  var SHARE_TYPES = {
    panel: { label: '产品分享', render: sharePanelTemplate },
    miniprogram: { label: '分享小程序链接', render: sharePanelTemplate }
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
