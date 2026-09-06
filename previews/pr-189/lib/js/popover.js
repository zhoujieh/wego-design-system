/**
 * popover 运行时
 *
 * 负责组件契约 behavior.position / behavior.dismiss / behavior.animation：
 * - 锚定目标元素计算 placement/align，fallback 顺序按 variant 区分（normal/action 纵向优先，input 横向优先）
 * - 与触发元素固定间隔 var(--popover-gap) 4px，四侧均无法完整容纳时不打开
 * - 交互式常驻变体（action/input）点击外部、焦点切换、滚动或视口变化时立即关闭，不阻断原页面事件
 * - 关闭不做退场动画，立即隐藏；入场使用 opacity + scale 淡入（由 CSS 承担）
 *
 * 场景调用：
 *   var handle = WegoPopover.bind(trigger, popover, {
 *     preferredPlacement: 'top',     // 可选，缺省按 variant 取默认（normal/action=top，input=right）
 *     beforeShow: function() {},      // 可选，show 前回调（用于关闭同屏其它 popover）
 *     onActionItemClick: function(item, event) {},  // 可选，action 变体操作项点击回调
 *     dismissOnOutsideClick: true,    // 可选，默认 true
 *     dismissOnScroll: true,          // 可选，默认 true
 *     dismissOnResize: true           // 可选，默认 true
 *   });
 *   handle.show();                    // 定位并打开
 *   handle.hide();                    // 关闭
 *   handle.toggle();                  // 切换显隐
 *   handle.destroy();                 // 卸载
 *
 * 也可单独调用 WegoPopover.position(popover, trigger, preferredPlacement) 仅做定位。
 */
(function () {
  'use strict';

  function measureOpenRect(popover) {
    var previousState = popover.getAttribute('data-state');
    var previousVisibility = popover.style.visibility;
    var previousPointerEvents = popover.style.pointerEvents;
    var previousTransition = popover.style.transition;
    var previousTransform = popover.style.transform;

    popover.setAttribute('data-state', 'open');
    popover.style.visibility = 'hidden';
    popover.style.pointerEvents = 'none';
    popover.style.transition = 'none';
    popover.style.transform = 'scale(1)';

    var rect = popover.getBoundingClientRect();

    popover.setAttribute('data-state', previousState || 'closed');
    popover.style.visibility = previousVisibility;
    popover.style.pointerEvents = previousPointerEvents;
    popover.style.transition = previousTransition;
    popover.style.transform = previousTransform;

    return rect;
  }

  function getGap(popover) {
    return parseFloat(getComputedStyle(popover).getPropertyValue('--popover-gap')) || 4;
  }

  function position(popover, trigger, preferredPlacement) {
    if (!popover || !trigger) return false;

    var triggerRect = trigger.getBoundingClientRect();
    var gap = getGap(popover);
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    var menuRect = measureOpenRect(popover);
    var canFitWidth = menuRect.width <= viewportWidth - gap * 2;
    var variant = popover.getAttribute('data-variant');
    var defaultPlacement = variant === 'input' ? 'right' : 'top';

    function alignForHorizontal(triggerCenter, vw) {
      if (triggerCenter < vw * 0.33) return 'start';
      if (triggerCenter > vw * 0.67) return 'end';
      return 'center';
    }

    function place(placement, x, y, align) {
      popover.setAttribute('data-placement', placement);
      popover.setAttribute('data-align', align || 'center');
      popover.style.left = x + 'px';
      popover.style.top = y + 'px';
      return true;
    }

    function tryBottom() {
      if (!canFitWidth) return false;
      if (triggerRect.bottom + gap + menuRect.height > viewportHeight - gap) return false;
      var align = alignForHorizontal(triggerRect.left + triggerRect.width / 2, viewportWidth);
      var left;
      if (align === 'start') left = triggerRect.left;
      else if (align === 'end') left = triggerRect.right - menuRect.width;
      else left = triggerRect.left + triggerRect.width / 2 - menuRect.width / 2;
      left = Math.max(gap, Math.min(left, viewportWidth - menuRect.width - gap));
      return place('bottom', left, triggerRect.bottom + gap, align);
    }

    function tryTop() {
      if (!canFitWidth) return false;
      if (triggerRect.top - gap - menuRect.height < gap) return false;
      var align = alignForHorizontal(triggerRect.left + triggerRect.width / 2, viewportWidth);
      var left;
      if (align === 'start') left = triggerRect.left;
      else if (align === 'end') left = triggerRect.right - menuRect.width;
      else left = triggerRect.left + triggerRect.width / 2 - menuRect.width / 2;
      left = Math.max(gap, Math.min(left, viewportWidth - menuRect.width - gap));
      return place('top', left, triggerRect.top - gap - menuRect.height, align);
    }

    function tryRight() {
      if (triggerRect.right + gap + menuRect.width > viewportWidth - gap) return false;
      var top = Math.max(gap, Math.min(
        triggerRect.top + triggerRect.height / 2 - menuRect.height / 2,
        viewportHeight - menuRect.height - gap
      ));
      return place('right', triggerRect.right + gap, top, 'center');
    }

    function tryLeft() {
      if (triggerRect.left - gap - menuRect.width < gap) return false;
      var top = Math.max(gap, Math.min(
        triggerRect.top + triggerRect.height / 2 - menuRect.height / 2,
        viewportHeight - menuRect.height - gap
      ));
      return place('left', triggerRect.left - gap - menuRect.width, top, 'center');
    }

    var defaultOrder = variant === 'input'
      ? [tryRight, tryLeft, tryBottom, tryTop]
      : [tryTop, tryBottom, tryRight, tryLeft];
    var order = {
      bottom: [tryBottom, tryTop, tryRight, tryLeft],
      top: [tryTop, tryBottom, tryRight, tryLeft],
      right: [tryRight, tryLeft, tryBottom, tryTop],
      left: [tryLeft, tryRight, tryBottom, tryTop]
    }[preferredPlacement || defaultPlacement] || defaultOrder;

    for (var i = 0; i < order.length; i++) {
      if (order[i]()) return true;
    }
    return false;
  }

  function bind(trigger, popover, options) {
    if (!trigger || !popover) return { show: function () {}, hide: function () {}, toggle: function () {}, destroy: function () {} };
    options = options || {};
    var preferredPlacement = options.preferredPlacement;
    var dismissOnOutsideClick = options.dismissOnOutsideClick !== false;
    var dismissOnScroll = options.dismissOnScroll !== false;
    var dismissOnResize = options.dismissOnResize !== false;

    var listeners = [];
    function add(el, type, fn, opts) {
      el.addEventListener(type, fn, opts);
      listeners.push({ el: el, type: type, fn: fn, opts: opts });
    }

    function show() {
      if (popover.getAttribute('data-state') === 'open') return;
      if (options.beforeShow) options.beforeShow();
      if (!position(popover, trigger, preferredPlacement)) return;
      requestAnimationFrame(function () {
        popover.setAttribute('data-state', 'open');
      });
    }

    function hide() {
      popover.setAttribute('data-state', 'closed');
    }

    function toggle() {
      if (popover.getAttribute('data-state') === 'open') hide();
      else show();
    }

    function onTriggerClick(e) {
      e.stopPropagation();
      toggle();
    }

    function isInside(node) {
      return node && (node === trigger || trigger.contains(node) ||
        (node.closest && node.closest('.popover')));
    }

    function onPointerDown(e) {
      if (!isInside(e.target)) hide();
    }

    function onFocusIn(e) {
      if (!isInside(e.target)) hide();
    }

    function onScroll() { hide(); }
    function onResize() { hide(); }

    add(trigger, 'click', onTriggerClick);
    if (dismissOnOutsideClick) {
      add(document, 'pointerdown', onPointerDown, true);
      add(document, 'focusin', onFocusIn);
    }
    if (dismissOnScroll) {
      add(document, 'scroll', onScroll, true);
      add(window, 'scroll', onScroll, { passive: true });
    }
    if (dismissOnResize) {
      add(window, 'resize', onResize);
    }

    // normal 变体右侧关闭图标
    var closeIcon = popover.querySelector('.popover__icon--close');
    if (closeIcon) {
      add(closeIcon, 'click', function (e) {
        e.stopPropagation();
        if (options.onCloseIconClick) options.onCloseIconClick(e);
        else hide();
      });
    }

    // action 变体操作项：点击后回调并延时关闭
    var actionItems = popover.querySelectorAll('.popover__action-item');
    for (var i = 0; i < actionItems.length; i++) {
      (function (item) {
        add(item, 'click', function (e) {
          e.stopPropagation();
          if (options.onActionItemClick) options.onActionItemClick(item, e);
          setTimeout(hide, 150);
        });
      })(actionItems[i]);
    }

    return {
      show: show,
      hide: hide,
      toggle: toggle,
      position: function () { return position(popover, trigger, preferredPlacement); },
      destroy: function () {
        for (var j = 0; j < listeners.length; j++) {
          var l = listeners[j];
          l.el.removeEventListener(l.type, l.fn, l.opts);
        }
      }
    };
  }

  window.WegoPopover = {
    bind: bind,
    position: position,
    measureOpenRect: measureOpenRect
  };
})();
