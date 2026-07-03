(function () {
  var STORAGE_KEY = "wego-price-visibility-state";
  var PAGE_PATHS = {
    root: "pages/price-permission.html",
    autoTime: "pages/auto-publish-time.html",
    partial: "pages/group-picker-visible.html",
    hidden: "pages/group-picker-hidden.html",
    create: "pages/group-create.html"
  };
  var GROUP_TAG_OPTIONS = ["高复购", "新人粉", "近7天互动", "直播间成交", "企业采购", "沉睡待唤醒"];
  var state = {
    saved: null,
    draft: null,
    modalStack: [],
    standalone: false,
    toastTimer: null,
    createContext: "partial"
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getDefaultState() {
    return {
      visibilityMode: "public",
      autoPublishAt: "",
      partialGroupIds: ["vip"],
      hiddenGroupIds: [],
      availableGroups: [
        {
          id: "vip",
          name: "高净值会员",
          count: 128,
          description: "近30天复购且客单价高于店铺均值",
          tags: ["高复购", "企业采购"]
        },
        {
          id: "newcomer",
          name: "新人首单粉",
          count: 342,
          description: "近7天首次关注并完成首单",
          tags: ["新人粉", "近7天互动"]
        },
        {
          id: "live",
          name: "直播间成交粉",
          count: 86,
          description: "最近3场直播至少成交一次",
          tags: ["直播间成交"]
        }
      ],
      lastSavedAt: ""
    };
  }

  function loadSavedState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return getDefaultState();
      }
      var parsed = JSON.parse(raw);
      return Object.assign(getDefaultState(), parsed);
    } catch (error) {
      return getDefaultState();
    }
  }

  function saveSavedState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.saved));
  }

  function getModeLabel(mode) {
    var labels = {
      public: "公开",
      private: "私密",
      partial: "部分可见",
      hidden: "不给谁看"
    };
    return labels[mode] || "未设置";
  }

  function getModeSubtitle(mode) {
    var subtitles = {
      public: "所有访客都能直接看到价格。",
      private: "价格默认隐藏，仅你自己可见。",
      partial: "仅命中的粉丝分组可见价格。",
      hidden: "除命中的粉丝分组外，其余人可见价格。"
    };
    return subtitles[mode] || "";
  }

  function getWorkingState() {
    return state.draft || state.saved || getDefaultState();
  }

  function getGroupsByIds(ids) {
    return getWorkingState().availableGroups.filter(function (group) {
      return ids.indexOf(group.id) > -1;
    });
  }

  function formatGroupSummary(ids) {
    if (!ids.length) {
      return "未选择分组";
    }
    return getGroupsByIds(ids)
      .map(function (group) {
        return group.name;
      })
      .join("、");
  }

  function formatDateValue(value) {
    if (!value) {
      return "未设置";
    }
    return value;
  }

  function getSavedDetail() {
    if (!state.saved) {
      return "--";
    }
    if (state.saved.visibilityMode === "private") {
      return state.saved.autoPublishAt ? "自动公开：" + state.saved.autoPublishAt : "保持私密，不自动公开";
    }
    if (state.saved.visibilityMode === "partial") {
      return formatGroupSummary(state.saved.partialGroupIds);
    }
    if (state.saved.visibilityMode === "hidden") {
      return formatGroupSummary(state.saved.hiddenGroupIds);
    }
    return "无需附加条件";
  }

  function renderHostSummary() {
    var mode = document.getElementById("summary-mode");
    var detail = document.getElementById("summary-detail");
    var time = document.getElementById("summary-time");
    var tags = document.getElementById("summary-tags");
    if (!mode || !detail || !time || !tags || !state.saved) {
      return;
    }
    mode.textContent = getModeLabel(state.saved.visibilityMode);
    detail.textContent = getSavedDetail();
    time.textContent = state.saved.lastSavedAt || "尚未保存";
    tags.innerHTML = "";
    tags.appendChild(buildTag(getModeLabel(state.saved.visibilityMode), "32", "brand", "selected"));
    if (state.saved.visibilityMode === "partial") {
      appendSummaryTags(tags, state.saved.partialGroupIds);
    } else if (state.saved.visibilityMode === "hidden") {
      appendSummaryTags(tags, state.saved.hiddenGroupIds);
    } else if (state.saved.visibilityMode === "private" && state.saved.autoPublishAt) {
      tags.appendChild(buildTag(state.saved.autoPublishAt, "28", "white", "normal"));
    }
  }

  function appendSummaryTags(container, ids) {
    getDefaultList(ids).forEach(function (label) {
      container.appendChild(buildTag(label, "28", "white", "normal"));
    });
  }

  function getDefaultList(ids) {
    if (!ids.length) {
      return ["未选择分组"];
    }
    return getGroupsByIds(ids).map(function (group) {
      return group.name;
    });
  }

  function buildTag(label, size, theme, stateName) {
    var tag = document.createElement("div");
    tag.className = "tag tag--" + size + " tag--" + theme + " tag--" + stateName;
    var tagLabel = document.createElement("span");
    tagLabel.className = "tag__label";
    tagLabel.textContent = label;
    tag.appendChild(tagLabel);
    return tag;
  }

  function showToast(message) {
    var toast = document.getElementById("app-toast");
    if (!toast) {
      return;
    }
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 1800);
  }

  function openRootModal() {
    state.draft = clone(state.saved);
    state.modalStack = [];
    pushModal(PAGE_PATHS.root, {});
  }

  function pushModal(path, context) {
    state.modalStack.push({
      path: path,
      context: context || {}
    });
    loadModalPage(state.modalStack[state.modalStack.length - 1]);
  }

  function replaceTopModal(path, context) {
    state.modalStack[state.modalStack.length - 1] = {
      path: path,
      context: context || {}
    };
    loadModalPage(state.modalStack[state.modalStack.length - 1]);
  }

  function goBackModal() {
    if (state.standalone) {
      window.history.back();
      return;
    }
    if (state.modalStack.length <= 1) {
      closeModal();
      return;
    }
    state.modalStack.pop();
    loadModalPage(state.modalStack[state.modalStack.length - 1]);
  }

  function closeModal() {
    if (state.standalone) {
      return;
    }
    var overlay = document.getElementById("modal-overlay");
    if (!overlay) {
      return;
    }
    overlay.classList.remove("modal-overlay--active");
    window.setTimeout(function () {
      overlay.hidden = true;
      overlay.innerHTML = "";
      state.modalStack = [];
      state.draft = null;
    }, 250);
  }

  function discardDraft() {
    state.draft = null;
    closeModal();
  }

  function commitDraft() {
    state.draft.lastSavedAt = new Date().toLocaleString("zh-CN", {
      hour12: false
    }).replace(/-/g, "/");
    state.saved = clone(state.draft);
    saveSavedState();
    renderHostSummary();
    showToast("价格权限已保存");
    closeModal();
  }

  function loadModalPage(entry) {
    if (state.standalone) {
      renderStandalonePage();
      return;
    }
    var overlay = document.getElementById("modal-overlay");
    if (!overlay) {
      return;
    }
    fetch(entry.path)
      .then(function (response) {
        return response.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var root = doc.querySelector("[data-modal-root]");
        overlay.innerHTML = root ? root.outerHTML : html;
        overlay.hidden = false;
        window.requestAnimationFrame(function () {
          overlay.classList.add("modal-overlay--active");
        });
        renderCurrentPage();
      });
  }

  function renderStandalonePage() {
    if (!state.draft) {
      state.draft = clone(state.saved);
    }
    renderCurrentPage();
  }

  function getCurrentRoot() {
    if (state.standalone) {
      return document.querySelector("[data-modal-root]");
    }
    var overlay = document.getElementById("modal-overlay");
    return overlay ? overlay.querySelector("[data-modal-root]") : null;
  }

  function renderCurrentPage() {
    var root = getCurrentRoot();
    if (!root) {
      return;
    }
    var page = root.getAttribute("data-page");
    bindCommonActions(root);
    if (page === "price-permission") {
      renderPermissionPage(root);
    } else if (page === "auto-publish-time") {
      renderAutoTimePage(root);
    } else if (page === "group-picker-visible") {
      renderGroupPicker(root, "partial");
    } else if (page === "group-picker-hidden") {
      renderGroupPicker(root, "hidden");
    } else if (page === "group-create") {
      renderGroupCreate(root);
    }
  }

  function bindCommonActions(root) {
    root.querySelectorAll("[data-action='cancel-root']").forEach(function (node) {
      node.onclick = discardDraft;
    });
    root.querySelectorAll("[data-action='save-root']").forEach(function (node) {
      node.onclick = commitDraft;
    });
    root.querySelectorAll("[data-action='back']").forEach(function (node) {
      node.onclick = goBackModal;
    });
  }

  function renderPermissionPage(root) {
    var slot = root.querySelector("[data-page-slot='price-permission']");
    if (!slot) {
      return;
    }
    slot.innerHTML = [
      '<p class="price-visibility-section-title">价格对谁可见</p>',
      '<div class="section-group">',
      buildModeCell("public", "公开", "所有访客都可见价格。", true),
      buildModeCell("private", "私密", state.draft.autoPublishAt ? "仅你自己可见，" + state.draft.autoPublishAt + " 后自动公开。" : "仅你自己可见，可额外设置自动公开时间。", true),
      state.draft.visibilityMode === "private" ? buildChildEntry("auto-time", "自动公开时间", formatDateValue(state.draft.autoPublishAt), true) : "",
      buildModeCell("partial", "部分可见", formatGroupSummary(state.draft.partialGroupIds), true),
      state.draft.visibilityMode === "partial" ? buildChildEntry("partial-groups", "选择可见分组", formatGroupSummary(state.draft.partialGroupIds), true) : "",
      buildModeCell("hidden", "不给谁看", formatGroupSummary(state.draft.hiddenGroupIds), false),
      state.draft.visibilityMode === "hidden" ? buildChildEntry("hidden-groups", "选择不给谁看的分组", formatGroupSummary(state.draft.hiddenGroupIds), false) : "",
      "</div>",
      '<div class="price-visibility-helper">主规则为单选逻辑。只有命中的选项会展开子级条件区，未命中的条件不会参与保存。</div>'
    ].join("");

    slot.querySelectorAll("[data-mode]").forEach(function (node) {
      node.onclick = function () {
        var mode = node.getAttribute("data-mode");
        state.draft.visibilityMode = mode;
        renderPermissionPage(root);
      };
    });

    var autoTimeEntry = slot.querySelector("[data-entry='auto-time']");
    if (autoTimeEntry) {
      autoTimeEntry.onclick = function () {
        pushModal(PAGE_PATHS.autoTime, {});
      };
    }
    var partialEntry = slot.querySelector("[data-entry='partial-groups']");
    if (partialEntry) {
      partialEntry.onclick = function () {
        pushModal(PAGE_PATHS.partial, {});
      };
    }
    var hiddenEntry = slot.querySelector("[data-entry='hidden-groups']");
    if (hiddenEntry) {
      hiddenEntry.onclick = function () {
        pushModal(PAGE_PATHS.hidden, {});
      };
    }
  }

  function buildModeCell(mode, title, subtitle, divider) {
    var checked = state.draft.visibilityMode === mode;
    return [
      '<div class="cell cell--double ',
      divider ? "cell--divider-right-edge " : "",
      'cell--bg-white cell--clickable" data-mode="',
      mode,
      '" role="radio" aria-checked="',
      checked ? "true" : "false",
      '"><div class="cell__select"><div class="radio',
      checked ? " radio--checked" : "",
      '"><div class="radio__inner"></div><div class="radio__dot"></div></div></div><div class="cell__body"><div class="cell__content"><div class="cell__title-row"><span class="cell__title">',
      title,
      '</span></div><div class="cell__subtitle">',
      subtitle,
      "</div></div></div></div>"
    ].join("");
  }

  function buildChildEntry(entryType, title, value, divider) {
    return [
      '<div class="cell cell--single ',
      divider ? "cell--divider-right-edge " : "",
      'cell--bg-white cell--clickable" data-entry="',
      entryType,
      '"><div class="cell__backspace"></div><div class="cell__select"><div class="radio radio--sm radio--checked"><div class="radio__inner"></div><div class="radio__dot"></div></div></div><div class="cell__body"><div class="cell__content"><div class="cell__title-row"><span class="cell__title">',
      title,
      '</span></div></div><div class="cell__action"><span class="cell__action-text">',
      value,
      '</span><i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i></div></div></div>'
    ].join("");
  }

  function renderAutoTimePage(root) {
    var slot = root.querySelector("[data-page-slot='auto-publish-time']");
    if (!slot) {
      return;
    }
    slot.innerHTML = [
      '<div class="price-visibility-form-card">',
      '<div class="price-visibility-toolbar__header"><p class="price-visibility-toolbar__title">私密多久后自动公开</p><p class="price-visibility-toolbar__desc">输入规范时间，格式使用 `YYYY/MM/DD HH:MM`。留空表示保持私密，不自动公开。</p></div>',
      '<div class="input-group">',
      '<label class="field-label" for="auto-publish-input">自动公开时间</label>',
      '<div class="input-wrapper"><input id="auto-publish-input" type="text" value="',
      state.draft.autoPublishAt,
      '" placeholder="例如 2026/07/05 10:00"></div>',
      '<span class="field-error">示例输入：2026/07/05 10:00</span>',
      "</div>",
      '<div class="price-visibility-quick-actions"><span class="price-visibility-quick-actions__label">快捷建议</span><div class="price-visibility-chip-list" id="auto-time-suggestions"></div></div>',
      '<div class="price-visibility-link-row"><button type="button" class="link" id="clear-auto-time">设为不自动公开</button></div>',
      "</div>",
      '<div class="price-visibility-helper price-visibility-helper--tight">当主规则切回公开、部分可见或不给谁看时，这个时间不会生效，但会保留在草稿中，方便再次切回私密时继续编辑。</div>'
    ].join("");

    var suggestions = buildAutoTimeSuggestions();
    var suggestionContainer = slot.querySelector("#auto-time-suggestions");
    suggestions.forEach(function (item) {
      var tag = buildTag(item, "28", "white", "normal");
      tag.classList.add("price-visibility-chip");
      tag.onclick = function () {
        slot.querySelector("#auto-publish-input").value = item;
      };
      suggestionContainer.appendChild(tag);
    });

    slot.querySelector("#clear-auto-time").onclick = function () {
      slot.querySelector("#auto-publish-input").value = "";
    };

    root.querySelector("[data-action='save-auto-time']").onclick = function () {
      state.draft.autoPublishAt = slot.querySelector("#auto-publish-input").value.trim();
      goBackModal();
    };
  }

  function buildAutoTimeSuggestions() {
    return ["2026/07/04 09:00", "2026/07/05 20:00", "2026/07/10 10:30"];
  }

  function renderGroupPicker(root, mode) {
    var slotName = mode === "partial" ? "group-picker-visible" : "group-picker-hidden";
    var slot = root.querySelector("[data-page-slot='" + slotName + "']");
    if (!slot) {
      return;
    }
    var selectedIds = mode === "partial" ? state.draft.partialGroupIds : state.draft.hiddenGroupIds;
    slot.innerHTML = [
      '<div class="price-visibility-toolbar">',
      '<div class="price-visibility-toolbar__header"><p class="price-visibility-toolbar__title">',
      mode === "partial" ? "选择可见分组" : "选择不给谁看的分组",
      '</p><p class="price-visibility-toolbar__desc">',
      mode === "partial" ? "可多选，只有命中的粉丝分组能看到价格。" : "可多选，命中的粉丝分组看不到价格。",
      "</p></div>",
      '<div class="price-visibility-chip-list" id="selected-group-tags"></div>',
      '<button type="button" class="btn btn--medium btn--md" id="create-group-entry"><i class="btn__icon icon-jia16"></i>新增粉丝分组</button>',
      "</div>",
      '<p class="price-visibility-section-title">按粉丝分组选择</p>',
      '<div class="section-group" id="group-list"></div>',
      '<div class="price-visibility-helper">新建分组后会自动回到当前页，并默认勾选到当前规则里。</div>'
    ].join("");

    var tags = slot.querySelector("#selected-group-tags");
    if (!selectedIds.length) {
      tags.innerHTML = '<span class="price-visibility-empty">还没有选中任何分组</span>';
    } else {
      getGroupsByIds(selectedIds).forEach(function (group) {
        tags.appendChild(buildTag(group.name, "28", "brand", "selected"));
      });
    }

    var list = slot.querySelector("#group-list");
    state.draft.availableGroups.forEach(function (group, index) {
      var checked = selectedIds.indexOf(group.id) > -1;
      var cell = document.createElement("div");
      cell.className = "cell cell--double " + (index === state.draft.availableGroups.length - 1 ? "" : "cell--divider-right-edge ") + "cell--bg-white cell--clickable";
      cell.setAttribute("data-group-id", group.id);
      cell.innerHTML = [
        '<div class="cell__select"><div class="checkbox',
        checked ? " checkbox--checked" : "",
        '"><div class="checkbox__inner"></div><div class="checkbox__icon"><img class="checkbox__asset" src="',
        getCheckboxAssetPath(),
        '" alt=""></div></div></div>',
        '<div class="cell__body"><div class="cell__content"><div class="cell__title-row"><span class="cell__title">',
        group.name,
        '</span></div><div class="cell__subtitle">',
        group.description,
        '</div><div class="price-visibility-group-meta">',
        group.tags.map(function (tag) {
          return buildTagMarkup(tag);
        }).join(""),
        "</div></div><div class=\"cell__action\"><span class=\"cell__action-text\">",
        String(group.count),
        '人</span></div></div>'
      ].join("");
      cell.onclick = function () {
        toggleGroupSelection(mode, group.id);
        renderGroupPicker(root, mode);
      };
      list.appendChild(cell);
    });

    slot.querySelector("#create-group-entry").onclick = function () {
      state.createContext = mode;
      pushModal(PAGE_PATHS.create, {
        mode: mode
      });
    };

    root.querySelector("[data-action='save-group-picker']").onclick = function () {
      goBackModal();
    };
  }

  function getCheckboxAssetPath() {
    return state.standalone ? "../lib/icons/checkbox-check.svg" : "./lib/icons/checkbox-check.svg";
  }

  function toggleGroupSelection(mode, groupId) {
    var key = mode === "partial" ? "partialGroupIds" : "hiddenGroupIds";
    var target = state.draft[key];
    var index = target.indexOf(groupId);
    if (index > -1) {
      target.splice(index, 1);
    } else {
      target.push(groupId);
    }
  }

  function buildTagMarkup(label) {
    return '<div class="tag tag--20 tag--gray"><span class="tag__label">' + label + "</span></div>";
  }

  function renderGroupCreate(root) {
    var slot = root.querySelector("[data-page-slot='group-create']");
    if (!slot) {
      return;
    }
    slot.innerHTML = [
      '<div class="price-visibility-form-card">',
      '<div class="input-group">',
      '<label class="field-label" for="group-name-input">分组名称</label>',
      '<div class="input-wrapper"><input id="group-name-input" type="text" placeholder="例如 高意向批发客户"></div>',
      '<span class="field-error">建议 4~10 个字，便于在上级页面回填摘要。</span>',
      "</div>",
      '<div class="price-visibility-quick-actions"><span class="price-visibility-quick-actions__label">命中标签</span><div class="price-visibility-chip-list" id="group-tag-options"></div></div>',
      '<div class="price-visibility-helper price-visibility-helper--tight">这是一个示例型新增流程：创建后系统会按你选择的标签生成一个演示分组，并自动加入当前规则。</div>',
      "</div>"
    ].join("");

    var selectedTags = [];
    var container = slot.querySelector("#group-tag-options");
    GROUP_TAG_OPTIONS.forEach(function (label) {
      var tag = buildTag(label, "32", "white", "normal");
      tag.classList.add("price-visibility-chip");
      tag.onclick = function () {
        var index = selectedTags.indexOf(label);
        if (index > -1) {
          selectedTags.splice(index, 1);
          tag.className = "tag tag--32 tag--white tag--normal price-visibility-chip";
        } else {
          selectedTags.push(label);
          tag.className = "tag tag--32 tag--brand tag--selected price-visibility-chip";
        }
      };
      container.appendChild(tag);
    });

    root.querySelector("[data-action='save-group-create']").onclick = function () {
      var input = slot.querySelector("#group-name-input");
      var name = input.value.trim();
      if (!name) {
        input.focus();
        return;
      }
      var tagList = selectedTags.length ? selectedTags.slice(0, 3) : ["新人粉"];
      var newGroup = {
        id: "group-" + Date.now(),
        name: name,
        count: 60 + tagList.length * 24,
        description: "由当前页面新建，示例命中 " + tagList.join("、"),
        tags: tagList
      };
      state.draft.availableGroups.push(newGroup);
      var key = state.createContext === "hidden" ? "hiddenGroupIds" : "partialGroupIds";
      state.draft[key].push(newGroup.id);
      if (state.standalone) {
        showToast("已创建示例分组");
        return;
      }
      goBackModal();
    };
  }

  function initIndexPage() {
    var trigger = document.getElementById("open-permission-settings");
    if (trigger) {
      trigger.onclick = openRootModal;
    }
    renderHostSummary();
  }

  function initStandalone() {
    state.standalone = true;
    renderStandalonePage();
  }

  function boot() {
    state.saved = loadSavedState();
    var standalonePage = document.body.getAttribute("data-standalone-page");
    if (standalonePage) {
      initStandalone();
      return;
    }
    initIndexPage();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
