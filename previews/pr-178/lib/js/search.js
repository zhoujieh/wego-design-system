/**
 * search 运行时
 *
 * 负责组件契约 behavior.input / behavior.clear / behavior.imageSearch：
 * - clear 按钮动态创建/移除：输入值或图搜 token 非空时显示，空态隐藏
 * - 点击 clear 清空文本、移除图搜 token、重新聚焦输入框
 * - blur 时若有文搜内容且存在图搜 token，移除图搜 token 切回文搜结果
 * - 带 data-state-tag 的搜索框同步 empty / inputting / text-result 状态类
 *
 * 场景调用：
 *   var handle = WegoSearch.bind(root);   // root 默认 document
 *   handle.update();                       // 重新渲染所有搜索框动作区
 *   handle.destroy();                      // 卸载
 *
 * 图搜 token 与文搜内容互斥：输入过程中保留 token，失焦执行搜索后才移除。
 */
(function () {
  'use strict';

  function initSearchBox(box) {
    var field = box.querySelector(".searchbox__field");
    var actions = box.querySelector(".searchbox__actions");
    if (!field || !actions) return { update: function () {}, destroy: function () {} };

    var hasImageToken = box.querySelector(".searchbox__image-token") !== null;
    var initialClearVisible = !!actions.querySelector(".searchbox__clear");

    function clearAll() {
      field.value = "";
      box.querySelectorAll(".searchbox__image-token").forEach(function (token) { token.remove(); });
      hasImageToken = false;
      renderActions();
      field.focus();
    }

    function ensureClear() {
      var existing = actions.querySelector(".searchbox__clear");
      if (existing) return existing;
      var clear = document.createElement("button");
      clear.className = "searchbox__action searchbox__clear wego-iconfont-s icon-yuancha-mian";
      clear.type = "button";
      clear.setAttribute("aria-label", "清除");
      clear.addEventListener("click", clearAll);
      actions.insertBefore(clear, actions.firstChild);
      return clear;
    }

    function removeClear() {
      var existing = actions.querySelector(".searchbox__clear");
      if (existing) existing.remove();
    }

    function renderActions() {
      var value = field.value.trim();
      if (value || hasImageToken) {
        ensureClear();
      } else {
        removeClear();
      }

      if (box.hasAttribute("data-state-tag")) {
        var stateTag = document.querySelector("[data-state-tag]");
        if (stateTag) {
          if (document.activeElement === field && value) {
            stateTag.textContent = "inputting 输入中";
            box.classList.remove("is-text-result");
            box.classList.add("is-inputting");
          } else if (value) {
            stateTag.textContent = "text-result 文搜结果态";
            box.classList.remove("is-inputting");
            box.classList.add("is-text-result");
          } else {
            stateTag.textContent = "empty 空态";
            box.classList.remove("is-inputting", "is-text-result");
          }
        }
      }
    }

    function onBlur() {
      var value = field.value.trim();
      if (value && hasImageToken) {
        box.querySelectorAll(".searchbox__image-token").forEach(function (token) { token.remove(); });
        hasImageToken = false;
      }
      renderActions();
    }

    field.addEventListener("input", renderActions);
    field.addEventListener("focus", renderActions);
    field.addEventListener("blur", onBlur);

    var staticClears = Array.prototype.slice.call(actions.querySelectorAll(".searchbox__action.searchbox__clear"));
    staticClears.forEach(function (action) {
      action.addEventListener("click", clearAll);
    });

    if (!initialClearVisible) {
      removeClear();
    }

    return {
      update: renderActions,
      destroy: function () {
        field.removeEventListener("input", renderActions);
        field.removeEventListener("focus", renderActions);
        field.removeEventListener("blur", onBlur);
        actions.querySelectorAll(".searchbox__action.searchbox__clear").forEach(function (action) {
          action.removeEventListener("click", clearAll);
        });
      }
    };
  }

  function bind(options) {
    options = options || {};
    var scopeRoot = options.root && options.root.nodeType === 1 ? options.root : document;
    var boxes = Array.prototype.slice.call(scopeRoot.querySelectorAll(".searchbox"));
    if (boxes.length === 0) return { update: function () {}, destroy: function () {} };

    var handles = boxes.map(initSearchBox);

    return {
      update: function () { handles.forEach(function (h) { h.update(); }); },
      destroy: function () { handles.forEach(function (h) { h.destroy(); }); }
    };
  }

  window.WegoSearch = {
    bind: bind
  };
})();
