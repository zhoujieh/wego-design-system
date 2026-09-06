(function initHostTabScrollReset() {
  var hostContent = document.querySelector('[data-host-content]');
  var bottomNav = document.querySelector('[data-bottom-nav]');
  var panels = Array.from(document.querySelectorAll('[data-host-tab]'));
  var contentScrollSelector = [
    '[data-tab-scroll]',
    '.album-feed__scroll',
    '.my-page__scroll'
  ].join(', ');
  if (!hostContent || !bottomNav || !panels.length) return;

  var activeCycle = null;
  var scheduledFrames = [];

  function uniqueTargets(targets) {
    return Array.from(new Set(targets.filter(Boolean)));
  }

  function allScrollTargets() {
    var targets = [];
    panels.forEach(function (panel) {
      panel.querySelectorAll(contentScrollSelector).forEach(function (target) {
        targets.push(target);
      });
    });
    return uniqueTargets(targets);
  }

  function activeScrollTargets() {
    var activePanel = panels.find(function (panel) {
      return !panel.hidden && panel.classList.contains('host-shell-page__panel--active');
    });
    if (!activePanel) return [];
    return uniqueTargets(Array.from(activePanel.querySelectorAll(contentScrollSelector)));
  }

  function resetTarget(target) {
    if (!target) return;
    target.scrollTop = 0;
    target.scrollLeft = 0;
    if (typeof target.scrollTo === 'function') {
      try { target.scrollTo(0, 0); } catch (error) {}
    }
  }

  function rebuildScrollLayer(target) {
    var parent = target && target.parentNode;
    if (!parent) {
      resetTarget(target);
      return;
    }

    // iOS 的动量滚动由原生 UIScrollView 异步驱动；单写 scrollTop/scrollTo
    // 不能保证中断它。把同一个内容节点暂时移出再原位插回，保留节点状态与
    // 事件监听，同时销毁旧滚动层，让重新创建的滚动层从 0 开始。
    var marker = document.createComment('host-tab-scroll-reset');
    parent.replaceChild(marker, target);
    resetTarget(target);
    parent.replaceChild(target, marker);
    target.getBoundingClientRect();
    resetTarget(target);
  }

  function rebuildScrollLayers(targets) {
    targets.forEach(rebuildScrollLayer);
  }

  function forceScrollLayout() {
    // 读取布局让 overflow 切换在下一步回滚前提交，终止 WebKit 异步滚动层。
    hostContent.getBoundingClientRect();
  }

  function rememberInlineProperty(target, property) {
    return {
      property: property,
      value: target.style.getPropertyValue(property),
      priority: target.style.getPropertyPriority(property)
    };
  }

  function restoreInlineProperty(target, snapshot) {
    if (snapshot.value) {
      target.style.setProperty(snapshot.property, snapshot.value, snapshot.priority);
    } else {
      target.style.removeProperty(snapshot.property);
    }
  }

  function suspendMomentum(target) {
    var snapshots = [
      rememberInlineProperty(target, 'scroll-behavior'),
      rememberInlineProperty(target, 'overflow-y')
    ];
    target.style.setProperty('scroll-behavior', 'auto', 'important');
    target.style.setProperty('overflow-y', 'hidden', 'important');
    return function restoreMomentumStyles() {
      snapshots.forEach(function (snapshot) {
        restoreInlineProperty(target, snapshot);
      });
    };
  }

  function cancelScheduledFrames() {
    scheduledFrames.forEach(function (frameId) {
      window.cancelAnimationFrame(frameId);
    });
    scheduledFrames = [];
  }

  function releaseCycle(cycle, shouldReset) {
    if (!cycle || cycle.released) return;
    cycle.released = true;
    window.clearTimeout(cycle.safetyTimer);
    if (shouldReset) rebuildScrollLayers(cycle.targets);
    cycle.restoreStyles.forEach(function (restore) { restore(); });
    forceScrollLayout();
    if (shouldReset) rebuildScrollLayers(activeScrollTargets());
    if (activeCycle === cycle) activeCycle = null;
  }

  function beginCycle(trigger, shouldReset) {
    if (activeCycle && !activeCycle.released && activeCycle.trigger === trigger) {
      if (shouldReset) {
        activeCycle.committed = true;
        rebuildScrollLayers(activeCycle.targets);
        forceScrollLayout();
      }
      return activeCycle;
    }

    if (activeCycle) releaseCycle(activeCycle, activeCycle.committed);
    cancelScheduledFrames();

    var targets = allScrollTargets();
    var cycle = {
      trigger: trigger,
      targets: targets,
      restoreStyles: targets.map(suspendMomentum),
      committed: Boolean(shouldReset),
      released: false,
      safetyTimer: null
    };
    activeCycle = cycle;
    forceScrollLayout();
    if (shouldReset) rebuildScrollLayers(targets);
    cycle.safetyTimer = window.setTimeout(function () {
      var committed = cycle.committed;
      releaseCycle(cycle, committed);
      if (committed) scheduleActiveReset();
    }, 600);
    return cycle;
  }

  function scheduleActiveReset() {
    cancelScheduledFrames();
    scheduledFrames.push(window.requestAnimationFrame(function () {
      rebuildScrollLayers(activeScrollTargets());
      scheduledFrames = [];
    }));
  }

  function finishCycle(cycle) {
    scheduledFrames.push(window.requestAnimationFrame(function () {
      if (cycle.released) return;
      releaseCycle(cycle, true);
      scheduleActiveReset();
    }));
  }

  function eventTrigger(event) {
    var target = event.target && event.target.nodeType === 1
      ? event.target
      : event.target && event.target.parentElement;
    var trigger = target && target.closest('[data-host-tab-trigger]');
    return trigger && bottomNav.contains(trigger) ? trigger : null;
  }

  function prepareForPress(event) {
    var trigger = eventTrigger(event);
    if (trigger) beginCycle(trigger, false);
  }

  function commitSwitch(event) {
    var trigger = eventTrigger(event);
    if (!trigger) return;
    var cycle = beginCycle(trigger, true);
    // 宿主 click 监听器在本次事件的冒泡阶段完成切换；下一帧再恢复滚动能力。
    finishCycle(cycle);
  }

  function cancelPress() {
    if (activeCycle && !activeCycle.committed) releaseCycle(activeCycle, false);
  }

  bottomNav.addEventListener('pointerdown', prepareForPress, { capture: true, passive: true });
  bottomNav.addEventListener('touchstart', prepareForPress, { capture: true, passive: true });
  bottomNav.addEventListener('click', commitSwitch, { capture: true });
  bottomNav.addEventListener('pointercancel', cancelPress, { capture: true, passive: true });
  bottomNav.addEventListener('touchcancel', cancelPress, { capture: true, passive: true });

  panels.forEach(function (panel) {
    var observer = new MutationObserver(function () {
      if (activeCycle && activeCycle.committed) {
        rebuildScrollLayers(allScrollTargets());
        return;
      }
      if (!activeCycle && !panel.hidden && panel.classList.contains('host-shell-page__panel--active')) {
        scheduleActiveReset();
      }
    });
    // direct childList 覆盖场景首次异步挂载；hidden 覆盖每次宿主切换。
    observer.observe(panel, { attributes: true, attributeFilter: ['hidden'], childList: true });
  });
})();
