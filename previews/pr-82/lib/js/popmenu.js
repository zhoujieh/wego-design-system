/**
 * popmenu 运行时
 *
 * 负责组件契约 behavior.position / behavior.dismiss / behavior.animation：
 * - 锚定目标元素计算 placement/align，fallback 顺序固定 bottom → top → right → left
 * - 与触发元素固定间隔 var(--popmenu-gap) 4px，四侧均无法完整容纳时不打开
 * - 同屏仅展示一个 popmenu，新 popmenu 出现时立即替换旧（由调用方通过 beforeShow 协调）
 * - 点击外部、焦点切换、滚动或视口变化时立即关闭，不阻断原页面事件
 * - 关闭不做退场动画，立即隐藏；入场使用 opacity + scale 淡入（由 CSS 承担）
 *
 * 场景调用：
 *   var handle = WegoPopmenu.bind(trigger, popmenu, {
 *     beforeShow: function() {},            // 可选，show 前回调（用于关闭同屏其它 popmenu）
 *     onItemClick: function(item, event) {},  // 可选，item 点击回调
 *     closeAfterClick: true,               // 可选，默认 true，点击 item 后关闭
 *     dismissOnOutsideClick: true,         // 可选，默认 true
 *     dismissOnScroll: true,               // 可选，默认 true
 *     dismissOnResize: true                // 可选，默认 true
 *   });
 *   handle.show();                         // 定位并打开
 *   handle.hide();                         // 关闭
 *   handle.toggle();                       // 切换显隐
 *   handle.destroy();                      // 卸载
 *
 * 也可单独调用 WegoPopmenu.position(popmenu, trigger) 仅做定位。
 */
(function () {
  'use strict';

  function measureOpenRect(popmenu) {
    var previousState = popmenu.getAttribute('data-state');
    var previousVisibility = popmenu.style.visibility;
    var previousPointerEvents = popmenu.style.pointerEvents;
    var previousTransition = popmenu.style.transition;
    var previousTransform = popmenu.style.transform;

    popmenu.setAttribute('data-state', 'open');
    popmenu.style.visibility = 'hidden';
    popmenu.style.pointerEvents = 'none';
    popmenu.style.transition = 'none';
    popmenu.style.transform = 'scale(1)';

    var rect = popmenu.getBoundingClientRect();

    popmenu.setAttribute('data-state', previousState || 'closed');
    popmenu.style.visibility = previousVisibility;
    popmenu.style.pointerEvents = previousPointerEvents;
    popmenu.style.transition = previousTransition;
    popmenu.style.transform = previousTransform;

    return rect;
  }

  function getGap(popmenu) {
    return parseFloat(getComputedStyle(popmenu).getPropertyValue('--popmenu-gap')) || 4;
  }

  function position(popmenu, trigger) {
    if (!popmenu || !trigger) return false;

    var triggerRect = trigger.getBoundingClientRect();
    var gap = getGap(popmenu);
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    var menuRect = measureOpenRect(popmenu);
    var align = triggerRect.left + triggerRect.width / 2 > viewportWidth / 2 ? 'end' : 'start';
    var left = align === 'end' ? triggerRect.right - menuRect.width : triggerRect.left;
    var canFitWidth = menuRect.width <= viewportWidth - gap * 2;

    if (align === 'start' && left + menuRect.width > viewportWidth - gap) {
      align = 'end';
      left = triggerRect.right - menuRect.width;
    } else if (align === 'end' && left < gap) {
      align = 'start';
      left = triggerRect.left;
    }

    left = Math.max(gap, Math.min(left, viewportWidth - menuRect.width - gap));

    function place(placement, x, y, nextAlign) {
      popmenu.setAttribute('data-placement', placement);
      popmenu.setAttribute('data-align', nextAlign || align);
      popmenu.style.left = x + 'px';
      popmenu.style.top = y + 'px';
      return true;
    }

    // 默认先尝试底部，空间不够再向上；上下均不能完整容纳时才改放到目标左右侧
    if (canFitWidth && triggerRect.bottom + gap + menuRect.height <= viewportHeight - gap) {
      return place('bottom', left, triggerRect.bottom + gap, align);
    }

    if (canFitWidth && triggerRect.top - gap - menuRect.height >= gap) {
      return place('top', left, triggerRect.top - gap - menuRect.height, align);
    }

    var top = Math.max(gap, Math.min(triggerRect.top, viewportHeight - menuRect.height - gap));
    var preferRight = triggerRect.left + triggerRect.width / 2 <= viewportWidth / 2;

    if (preferRight && triggerRect.right + gap + menuRect.width <= viewportWidth - gap) {
      return place('right', triggerRect.right + gap, top, 'start');
    }

    if (triggerRect.left - gap - menuRect.width >= gap) {
      return place('left', triggerRect.left - gap - menuRect.width, top, 'end');
    }

    if (triggerRect.right + gap + menuRect.width <= viewportWidth - gap) {
      return place('right', triggerRect.right + gap, top, 'start');
    }

    return false;
  }

  function bind(trigger, popmenu, options) {
    if (!trigger || !popmenu) return { show: function () {}, hide: function () {}, toggle: function () {}, destroy: function () {} };
    options = options || {};
    var closeAfterClick = options.closeAfterClick !== false;
    var dismissOnOutsideClick = options.dismissOnOutsideClick !== false;
    var dismissOnScroll = options.dismissOnScroll !== false;
    var dismissOnResize = options.dismissOnResize !== false;

    var listeners = [];
    function add(el, type, fn, opts) {
      el.addEventListener(type, fn, opts);
      listeners.push({ el: el, type: type, fn: fn, opts: opts });
    }

    function show() {
      if (popmenu.getAttribute('data-state') === 'open') return;
      if (options.beforeShow) options.beforeShow();
      if (!position(popmenu, trigger)) return;
      requestAnimationFrame(function () {
        popmenu.setAttribute('data-state', 'open');
      });
    }

    function hide() {
      popmenu.setAttribute('data-state', 'closed');
    }

    function toggle() {
      if (popmenu.getAttribute('data-state') === 'open') hide();
      else show();
    }

    function onTriggerClick(e) {
      e.stopPropagation();
      toggle();
    }

    function isInside(node) {
      return node && (node === trigger || trigger.contains(node) ||
        (node.closest && node.closest('.popmenu')));
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

    // item 点击：回调 + 按需延时关闭
    var items = popmenu.querySelectorAll('.popmenu__item');
    for (var i = 0; i < items.length; i++) {
      (function (item) {
        add(item, 'click', function (e) {
          e.stopPropagation();
          if (options.onItemClick) options.onItemClick(item, e);
          if (closeAfterClick) setTimeout(hide, 150);
        });
      })(items[i]);
    }

    return {
      show: show,
      hide: hide,
      toggle: toggle,
      position: function () { return position(popmenu, trigger); },
      destroy: function () {
        for (var j = 0; j < listeners.length; j++) {
          var l = listeners[j];
          l.el.removeEventListener(l.type, l.fn, l.opts);
        }
      }
    };
  }

  window.WegoPopmenu = {
    bind: bind,
    position: position,
    measureOpenRect: measureOpenRect
  };
})();
