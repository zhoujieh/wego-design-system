/* 升级弹窗（业务组件，全局加载）
   - 业务场景：版本升级引导——新版本上线新能力（如鸿蒙 1.3 分享能力升级）后，用户首次进入时引导体验；
     可关闭型每天 1 次、强制型仅 1 次。
   - 适用场景：动态页（首次进入触发）。
   - 消费方式：window.WegoApp.openUpgradePopup(ctx, type)，type 为 'dismissible' | 'forced'。
   - 架构：数据层（本地记录显示状态 wego.upgrade-popup.*）+ UI 层（upgradePopupTemplate）+ 业务层（openUpgradePopup）。
   - 依赖：window.WegoApp（app.js）、插画 ./lib/assets/image/update.png。 */

(function () {
  'use strict';

  var WegoApp = (window.WegoApp = window.WegoApp || {});

  /* ═══════════════════════════════════════════════════════════════
     本地记录（优先复用 WegoApp.db，未加载时内联最小封装）
     ═══════════════════════════════════════════════════════════════ */
  var DB = (window.WegoApp && window.WegoApp.db) || {
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
    }
  };

  /* 升级弹窗显示状态 */
  /* 本地日期 YYYY-MM-DD（不用 toISOString，避免 UTC 时区导致每天 00:00-07:59 时段守卫失效） */
  function getLocalDateStr() {
    var d = new Date();
    var mm = String(d.getMonth() + 1);
    var dd = String(d.getDate());
    if (mm.length < 2) mm = '0' + mm;
    if (dd.length < 2) dd = '0' + dd;
    return d.getFullYear() + '-' + mm + '-' + dd;
  }
  function shouldShowUpgradePopup(type) {
    var key = 'wego.upgrade-popup.' + type;
    var record = DB.get(key);
    var today = getLocalDateStr();
    if (type === 'dismissible') {
      return !record || record.lastShownDate !== today;
    }
    return !record || !record.shown;
  }
  function markUpgradePopupShown(type) {
    var key = 'wego.upgrade-popup.' + type;
    var today = getLocalDateStr();
    if (type === 'dismissible') {
      DB.set(key, { lastShownDate: today });
    } else {
      DB.set(key, { shown: true });
    }
  }

  /* UI：升级弹窗模板 */
  function upgradePopupTemplate(type) {
    var isForced = type === 'forced';
    var forcedClass = isForced ? ' gray-popup-modal--forced' : '';
    return '<div class="modal modal--fullscreen gray-popup-modal' + forcedClass + '" data-component-slug="modal" data-state="open" role="dialog" aria-modal="true" aria-label="发现新版本">'
      + '<div class="modal__panel gray-popup__panel">'
      + (isForced ? '' : '<button type="button" class="gray-popup__close" data-action="gray-close" aria-label="关闭">✕</button>')
      + '<div class="gray-popup__header"><img src="./lib/assets/image/update.png" alt="" class="gray-popup__header-img"></div>'
      + '<div class="gray-popup__body">'
      + '<ol class="gray-popup__list">'
      + '<li>浏览相册更流畅，无需等待体验更好</li>'
      + '<li>动态顶部显示上新好友，方便看款转图</li>'
      + '<li>可开启微商相册输入法，和客户边聊天边推款</li>'
      + '<li>修复已知问题</li>'
      + '</ol>'
      + '</div>'
      + '<div class="gray-popup__actions">'
      + '<button type="button" data-component-slug="button" class="btn btn--strong btn--md gray-popup__confirm" data-action="gray-confirm">立即体验</button>'
      + (isForced ? '' : '<button type="button" data-component-slug="link" class="link gray-popup__later" data-action="gray-later">近期不再提醒</button>')
      + '</div>'
      + '</div>'
      + '</div>';
  }

  /* 业务层：打开升级弹窗 */
  function openUpgradePopup(ctx, type) {
    if (!shouldShowUpgradePopup(type)) return;
    markUpgradePopupShown(type);

    ctx.openFullScreenModal(upgradePopupTemplate(type), {
      label: '版本升级',
      init: function (overlayCtx) {
        var root = overlayCtx.root;
        var confirmBtn = root.querySelector('[data-action="gray-confirm"]');
        var laterBtn = root.querySelector('[data-action="gray-later"]');
        var closeBtn = root.querySelector('[data-action="gray-close"]');

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
        if (closeBtn) {
          closeBtn.addEventListener('click', function () {
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

  /* 暴露公开 API */
  window.WegoApp.openUpgradePopup = openUpgradePopup;

})();
