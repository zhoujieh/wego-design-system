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
    target.scrollTop = 0;
    target.scrollLeft = 0;
    if (typeof target.scrollTo === 'function') {
      try { target.scrollTo(0, 0); } catch (error) {}
    }
  }

  function resetTargets(targets) {
    targets.forEach(resetTarget);
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
      rememberInlineProperty(target, '-webkit-overflow-scrolling'),
      rememberInlineProperty(target, 'overflow-y')
    ];
    target.style.setProperty('scroll-behavior', 'auto', 'important');
    target.style.setProperty('-webkit-overflow-scrolling', 'auto', 'important');
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
    if (shouldReset) resetTargets(cycle.targets);
    cycle.restoreStyles.forEach(function (restore) { restore(); });
    forceScrollLayout();
    if (shouldReset) resetTargets(cycle.targets);
    if (activeCycle === cycle) activeCycle = null;
  }

  function beginCycle(trigger, shouldReset) {
    if (activeCycle && !activeCycle.released && activeCycle.trigger === trigger) {
      if (shouldReset) {
        activeCycle.committed = true;
        resetTargets(activeCycle.targets);
        forceScrollLayout();
        resetTargets(activeCycle.targets);
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
    if (shouldReset) resetTargets(targets);
    cycle.safetyTimer = window.setTimeout(function () {
      var committed = cycle.committed;
      releaseCycle(cycle, committed);
      if (committed) scheduleActiveReset();
    }, 600);
    return cycle;
  }

  function scheduleActiveReset() {
    cancelScheduledFrames();
    var remainingFrames = 3;
    function resetOnFrame() {
      resetTargets(activeScrollTargets());
      remainingFrames -= 1;
      if (remainingFrames > 0) {
        scheduledFrames.push(window.requestAnimationFrame(resetOnFrame));
      }
    }
    scheduledFrames.push(window.requestAnimationFrame(resetOnFrame));
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
        resetTargets(allScrollTargets());
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
