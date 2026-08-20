(function () {
  'use strict';

  var SUPPORTED_POLICIES = new Set([
    'always',
    'direction-reveal',
    'compact-on-scroll',
    'pin-after-threshold',
    'elevate-after-scroll'
  ]);

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function number(value, fallback) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }

  function composeBottomClearance(base, obstruction) {
    return Math.max(0, number(base, 0)) + Math.max(0, number(obstruction, 0));
  }

  function decideDirectionReveal(snapshot) {
    // 内容不足以滚动时（maxScrollTop 接近 0）强制保持可见，
    // 避免 direction-reveal 隐藏后触发 updateStacks 布局变化与 ResizeObserver 重新 measure 形成抖动循环。
    // 契约：顶部强制显示、底部布局校正与尺寸变化不触发反向切换。
    if (snapshot.currentMax <= snapshot.tolerance) {
      return { state: 'visible', direction: 0, distance: 0, top: 0, max: snapshot.currentMax };
    }
    var currentTop = clamp(snapshot.currentTop, 0, snapshot.currentMax);
    var delta = currentTop - snapshot.lastTop;
    var wasAtBottom = Math.abs(snapshot.lastMax - snapshot.lastTop) <= snapshot.tolerance;
    if (snapshot.layoutTransitioning && wasAtBottom) {
      delta -= snapshot.currentMax - snapshot.lastMax;
    }
    if (currentTop <= snapshot.tolerance) {
      return { state: 'visible', direction: 0, distance: 0, top: currentTop, max: snapshot.currentMax };
    }
    if (Math.abs(delta) <= snapshot.tolerance) {
      return { state: null, direction: 0, distance: 0, top: currentTop, max: snapshot.currentMax };
    }
    var direction = delta > 0 ? 1 : -1;
    var distance = snapshot.direction === direction ? snapshot.distance : 0;
    distance += Math.abs(delta);
    return {
      state: distance >= snapshot.threshold ? (direction > 0 ? 'hidden' : 'visible') : null,
      direction: direction,
      distance: distance >= snapshot.threshold ? 0 : distance,
      top: currentTop,
      max: snapshot.currentMax
    };
  }

  function resolveElement(root, value, label) {
    if (value && value.nodeType === 1) return value;
    var element = typeof value === 'string' ? root.querySelector(value) : null;
    if (!element) throw new Error('[WegoScrollLayout] 未找到' + label + '：' + String(value));
    return element;
  }

  function bind(options) {
    options = options || {};
    var scopeRoot = options.root && options.root.nodeType === 1 ? options.root : document;
    var scrollRoot = options.scrollRoot
      ? resolveElement(scopeRoot, options.scrollRoot, '主滚动区')
      : scopeRoot.querySelector('.layout-scroll');
    if (!scrollRoot) throw new Error('[WegoScrollLayout] 未找到主滚动区：未声明 scrollRoot 且未发现 .layout-scroll');
    var tolerance = number(options.boundaryTolerance, 1);
    var threshold = number(options.directionThreshold, 16);
    var activationRoot = options.activationRoot ? resolveElement(scopeRoot, options.activationRoot, '激活区域') : null;
    var destroyed = false;
    var frame = 0;
    var lastTop = clamp(scrollRoot.scrollTop, 0, Math.max(0, scrollRoot.scrollHeight - scrollRoot.clientHeight));
    var lastMax = Math.max(0, scrollRoot.scrollHeight - scrollRoot.clientHeight);
    var pendingTop = lastTop;
    var direction = 0;
    var directionDistance = 0;
    var layoutTransitioning = false;
    var previousScrollPaddingTop = scrollRoot.style.scrollPaddingTop;
    var previousScrollPaddingBottom = scrollRoot.style.scrollPaddingBottom;
    var previousPaddingTop = scrollRoot.style.paddingTop;
    var previousPaddingBottom = scrollRoot.style.paddingBottom;
    var initialComputedStyle = getComputedStyle(scrollRoot);
    var basePaddingTop = parseFloat(initialComputedStyle.paddingTop) || 0;
    var basePaddingBottom = parseFloat(initialComputedStyle.paddingBottom) || 0;
    var baseScrollPaddingBottom = parseFloat(initialComputedStyle.scrollPaddingBottom) || 0;

    var regionConfigs = options.regions && options.regions.length
      ? options.regions
      : Array.prototype.map.call(scopeRoot.querySelectorAll('.sticky-region'), function (el) {
          return { element: el };
        });
    var regions = regionConfigs.map(function (config, index) {
      var element = resolveElement(scopeRoot, config.element || config.selector, 'sticky 区域');
      var motion = element.querySelector('.sticky-region__motion') || element;
      var policy = config.policy || element.dataset.visibility || 'always';
      var edge = config.edge || element.dataset.edge || 'top';
      var essential = config.essential === true;
      if (!SUPPORTED_POLICIES.has(policy)) throw new Error('[WegoScrollLayout] 不支持策略：' + policy);
      if (essential && policy === 'direction-reveal') throw new Error('[WegoScrollLayout] 首要导航或主操作不得自动隐藏');
      element.dataset.visibility = policy;
      element.dataset.edge = edge;
      if (!element.dataset.state) element.dataset.state = 'visible';
      return {
        element: element,
        motion: motion,
        policy: policy,
        edge: edge,
        essential: essential,
        threshold: number(config.threshold, threshold),
        compactSize: number(config.compactSize, 0),
        stackOrder: number(config.stackOrder, index),
        expandedSize: 0,
        afterGap: 0
      };
    });

    var fixedRegions = (options.fixedRegions || []).map(function (config) {
      return {
        element: resolveElement(scopeRoot, config.element || config.selector, '固定区域'),
        edge: config.edge || 'bottom',
        gap: number(config.gap, 0)
      };
    });

    function maxScrollTop() {
      return Math.max(0, scrollRoot.scrollHeight - scrollRoot.clientHeight);
    }

    function setState(region, state) {
      if (region.element.contains(document.activeElement) && state === 'hidden') return;
      if (region.element.dataset.state === state) return;
      region.element.dataset.state = state;
      region.element.setAttribute('aria-hidden', state === 'hidden' ? 'true' : 'false');
      layoutTransitioning = true;
    }

    function measureRegion(region) {
      var size = region.edge === 'bottom' ? region.motion.scrollHeight : region.motion.scrollHeight;
      if (!size) size = region.motion.getBoundingClientRect().height;
      region.expandedSize = Math.max(0, Math.ceil(size));
      region.afterGap = parseFloat(getComputedStyle(region.element).marginBottom) || 0;
      region.element.style.setProperty('--sticky-region-expanded-size', region.expandedSize + 'px');
      if (region.compactSize > 0) region.element.style.setProperty('--sticky-region-compact-size', region.compactSize + 'px');
    }

    function activeSize(region) {
      var state = region.element.dataset.state;
      if (state === 'hidden') return region.afterGap;
      if (state === 'compact' && region.compactSize > 0) return region.compactSize + region.afterGap;
      return region.expandedSize + region.afterGap;
    }

    function updateStacks() {
      var top = 0;
      var bottom = 0;
      var fixedTop = 0;
      regions.slice().sort(function (a, b) { return a.stackOrder - b.stackOrder; }).forEach(function (region) {
        var offset = region.edge === 'bottom' ? bottom : top;
        region.element.style.setProperty('--sticky-region-offset', offset + 'px');
        if (region.edge === 'bottom') bottom += activeSize(region);
        else top += activeSize(region);
      });
      fixedRegions.forEach(function (region) {
        var size = Math.ceil(region.element.getBoundingClientRect().height) + region.gap;
        if (region.edge === 'top') { top += size; fixedTop += size; }
        else bottom += size;
      });
      scrollRoot.style.scrollPaddingTop = top + 'px';
      scrollRoot.style.scrollPaddingBottom = composeBottomClearance(Math.max(basePaddingBottom, baseScrollPaddingBottom), bottom) + 'px';
      if (fixedTop > 0) scrollRoot.style.paddingTop = basePaddingTop + fixedTop + 'px';
      scrollRoot.style.paddingBottom = composeBottomClearance(basePaddingBottom, bottom) + 'px';
      scrollRoot.style.setProperty('--scroll-layout-top-occlusion', top + 'px');
      scrollRoot.style.setProperty('--scroll-layout-bottom-clearance', bottom + 'px');
    }

    function measure() {
      regions.forEach(measureRegion);
      updateStacks();
      lastTop = clamp(scrollRoot.scrollTop, 0, maxScrollTop());
      lastMax = maxScrollTop();
    }

    function applyPolicy(region, currentTop, directionDecision) {
      if (region.policy === 'always') return setState(region, 'visible');
      if (region.policy === 'direction-reveal') {
        if (directionDecision.state) setState(region, directionDecision.state);
        return;
      }
      if (region.policy === 'compact-on-scroll') return setState(region, currentTop > region.threshold ? 'compact' : 'visible');
      if (region.policy === 'pin-after-threshold') return setState(region, currentTop > region.threshold ? 'pinned' : 'visible');
      if (region.policy === 'elevate-after-scroll') {
        setState(region, 'visible');
        region.element.dataset.elevated = currentTop > region.threshold ? 'true' : 'false';
      }
    }

    function applyScroll() {
      frame = 0;
      if (destroyed) return;
      var currentMax = maxScrollTop();
      var decision = decideDirectionReveal({
        currentTop: pendingTop,
        currentMax: currentMax,
        lastTop: lastTop,
        lastMax: lastMax,
        direction: direction,
        distance: directionDistance,
        layoutTransitioning: layoutTransitioning,
        tolerance: tolerance,
        threshold: threshold
      });
      direction = decision.direction;
      directionDistance = decision.distance;
      regions.forEach(function (region) { applyPolicy(region, decision.top, decision); });
      lastTop = decision.top;
      lastMax = decision.max;
      updateStacks();
      if (typeof options.onScroll === 'function') options.onScroll(decision.top);
    }

    function onScroll() {
      pendingTop = scrollRoot.scrollTop;
      if (!frame) frame = requestAnimationFrame(applyScroll);
    }

    function onTransitionEnd(event) {
      if (!event.target.classList.contains('sticky-region')) return;
      if (event.propertyName !== 'max-height') return;
      layoutTransitioning = false;
      measure();
    }

    function reset() {
      pendingTop = clamp(scrollRoot.scrollTop, 0, maxScrollTop());
      direction = 0;
      directionDistance = 0;
      if (pendingTop <= tolerance) {
        // 回顶恢复 visible 时禁用过渡，避免 max-height 从 0 展开的动画
        regions.forEach(function (region) {
          if (region.element.dataset.state === 'hidden') {
            region.element.style.transition = 'none';
            setState(region, 'visible');
            requestAnimationFrame(function () {
              region.element.style.removeProperty('transition');
            });
          } else {
            setState(region, 'visible');
          }
        });
      }
      measure();
    }

    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
    regions.forEach(function (region) { region.element.addEventListener('transitionend', onTransitionEnd); });

    var resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(function () {
      // 布局变化时禁用过渡，避免 max-height 从 0 或旧值过渡到新值
      regions.forEach(function (region) {
        region.element.style.transition = 'none';
      });
      layoutTransitioning = true;
      measure();
      requestAnimationFrame(function () {
        regions.forEach(function (region) {
          region.element.style.removeProperty('transition');
        });
        layoutTransitioning = false;
      });
    }) : null;
    if (resizeObserver) {
      regions.forEach(function (region) { resizeObserver.observe(region.motion); });
      fixedRegions.forEach(function (region) { resizeObserver.observe(region.element); });
    }

    var activationObserver = activationRoot && typeof MutationObserver === 'function' ? new MutationObserver(function () {
      if (!activationRoot.hidden) reset();
    }) : null;
    if (activationObserver) activationObserver.observe(activationRoot, { attributes: true, attributeFilter: ['hidden', 'class'] });

    // 初始测量前禁用过渡，避免 max-height 从 0 展开的动画
    regions.forEach(function (region) {
      region.element.style.transition = 'none';
    });
    measure();
    requestAnimationFrame(function () {
      regions.forEach(function (region) {
        region.element.style.removeProperty('transition');
      });
    });

    return {
      reset: reset,
      measure: measure,
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        if (frame) cancelAnimationFrame(frame);
        scrollRoot.removeEventListener('scroll', onScroll);
        regions.forEach(function (region) { region.element.removeEventListener('transitionend', onTransitionEnd); });
        if (resizeObserver) resizeObserver.disconnect();
        if (activationObserver) activationObserver.disconnect();
        scrollRoot.style.scrollPaddingTop = previousScrollPaddingTop;
        scrollRoot.style.scrollPaddingBottom = previousScrollPaddingBottom;
        scrollRoot.style.paddingTop = previousPaddingTop;
        scrollRoot.style.paddingBottom = previousPaddingBottom;
        scrollRoot.style.removeProperty('--scroll-layout-top-occlusion');
        scrollRoot.style.removeProperty('--scroll-layout-bottom-clearance');
      }
    };
  }

  window.WegoScrollLayout = {
    bind: bind,
    decideDirectionReveal: decideDirectionReveal,
    composeBottomClearance: composeBottomClearance
  };
})();
