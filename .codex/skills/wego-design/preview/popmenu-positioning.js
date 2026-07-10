(function () {
  function measureOpenRect(popmenu) {
    var previousState = popmenu.getAttribute("data-state");
    var previousVisibility = popmenu.style.visibility;
    var previousPointerEvents = popmenu.style.pointerEvents;
    var previousTransition = popmenu.style.transition;
    var previousTransform = popmenu.style.transform;

    popmenu.setAttribute("data-state", "open");
    popmenu.style.visibility = "hidden";
    popmenu.style.pointerEvents = "none";
    popmenu.style.transition = "none";
    popmenu.style.transform = "scale(1)";

    var rect = popmenu.getBoundingClientRect();

    popmenu.setAttribute("data-state", previousState || "closed");
    popmenu.style.visibility = previousVisibility;
    popmenu.style.pointerEvents = previousPointerEvents;
    popmenu.style.transition = previousTransition;
    popmenu.style.transform = previousTransform;

    return rect;
  }

  function getGap(popmenu) {
    return parseFloat(getComputedStyle(popmenu).getPropertyValue("--popmenu-gap")) || 4;
  }

  function position(popmenu, trigger) {
    if (!popmenu || !trigger) {
      return false;
    }

    var triggerRect = trigger.getBoundingClientRect();
    var gap = getGap(popmenu);
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    var menuRect = measureOpenRect(popmenu);
    var align = triggerRect.left + triggerRect.width / 2 > viewportWidth / 2 ? "end" : "start";
    var left = align === "end" ? triggerRect.right - menuRect.width : triggerRect.left;
    var canFitWidth = menuRect.width <= viewportWidth - gap * 2;

    if (align === "start" && left + menuRect.width > viewportWidth - gap) {
      align = "end";
      left = triggerRect.right - menuRect.width;
    } else if (align === "end" && left < gap) {
      align = "start";
      left = triggerRect.left;
    }

    left = Math.max(gap, Math.min(left, viewportWidth - menuRect.width - gap));

    function place(placement, x, y, nextAlign) {
      popmenu.setAttribute("data-placement", placement);
      popmenu.setAttribute("data-align", nextAlign || align);
      popmenu.style.left = x + "px";
      popmenu.style.top = y + "px";
      return true;
    }

    if (canFitWidth && triggerRect.bottom + gap + menuRect.height <= viewportHeight - gap) {
      return place("bottom", left, triggerRect.bottom + gap, align);
    }

    if (canFitWidth && triggerRect.top - gap - menuRect.height >= gap) {
      return place("top", left, triggerRect.top - gap - menuRect.height, align);
    }

    var top = Math.max(gap, Math.min(triggerRect.top, viewportHeight - menuRect.height - gap));
    var preferRight = triggerRect.left + triggerRect.width / 2 <= viewportWidth / 2;

    if (preferRight && triggerRect.right + gap + menuRect.width <= viewportWidth - gap) {
      return place("right", triggerRect.right + gap, top, "start");
    }

    if (triggerRect.left - gap - menuRect.width >= gap) {
      return place("left", triggerRect.left - gap - menuRect.width, top, "end");
    }

    if (triggerRect.right + gap + menuRect.width <= viewportWidth - gap) {
      return place("right", triggerRect.right + gap, top, "start");
    }

    return false;
  }

  window.WegoPreviewPopmenu = {
    measureOpenRect: measureOpenRect,
    position: position
  };
})();
