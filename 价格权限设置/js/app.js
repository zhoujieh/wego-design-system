/* wego-ux 价格权限设置 - 共享交互逻辑
 * 规则:
 * - 不依赖前端框架,原生 DOM 操作
 * - 状态使用 localStorage 持久化,打开时回填
 * - 模态层 full-screen-modal:fetch 内容片段 + 两段式动画
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'wego-price-permission';
  var GROUPS_KEY = 'wego-fan-groups';

  var MODE_LABELS = {
    public: '公开',
    private: '私密',
    partial: '部分可见',
    exclude: '不给谁看'
  };

  /* ============ 数据层 ============ */
  function readState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { mode: 'public', autoPublic: false, autoPublicTime: '', partialGroups: [], excludeGroups: [] };
    } catch (e) {
      return { mode: 'public', autoPublic: false, autoPublicTime: '', partialGroups: [], excludeGroups: [] };
    }
  }

  function writeState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function readGroups() {
    try {
      var raw = localStorage.getItem(GROUPS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var defaults = [
      { id: 'g1', name: '老客户', count: 128 },
      { id: 'g2', name: 'VIP 会员', count: 36 },
      { id: 'g3', name: '批发商', count: 12 },
      { id: 'g4', name: '新粉丝', count: 89 },
      { id: 'g5', name: '待跟进', count: 24 }
    ];
    localStorage.setItem(GROUPS_KEY, JSON.stringify(defaults));
    return defaults;
  }

  function writeGroups(groups) {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  }

  function summaryText(groups) {
    if (!groups || !groups.length) return '未选择';
    if (groups.length === 1) return groups[0].name;
    return '已选 ' + groups.length + ' 个分组';
  }

  function showToast(text) {
    var toast = document.querySelector('[data-toast]');
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    setTimeout(function () { toast.hidden = true; }, 1600);
  }

  /* ============ 模态层(full-screen-modal) ============ */
  function openModal(url) {
    var overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    fetch(url)
      .then(function (res) { return res.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        overlay.innerHTML = '';
        Array.prototype.forEach.call(doc.body.children, function (node) {
          overlay.appendChild(document.importNode(node, true));
        });
        overlay.hidden = false;
        requestAnimationFrame(function () {
          overlay.classList.add('modal-overlay--active');
        });
        bindModalClose(overlay);
        initPageLogic(overlay);
      })
      .catch(function () {
        showToast('页面加载失败');
      });
  }

  function closeModal() {
    var overlay = document.getElementById('modal-overlay');
    if (!overlay || overlay.hidden) return;
    overlay.classList.remove('modal-overlay--active');
    var onEnd = function () {
      overlay.removeEventListener('transitionend', onEnd);
      overlay.innerHTML = '';
      overlay.hidden = true;
    };
    overlay.addEventListener('transitionend', onEnd);
    setTimeout(function () {
      if (!overlay.hidden) {
        overlay.innerHTML = '';
        overlay.hidden = true;
      }
    }, 400);
  }

  function bindModalClose(scope) {
    scope.querySelectorAll('[data-action="cancel"]').forEach(function (el) {
      el.addEventListener('click', function () { closeModal(); });
    });
  }

  /* ============ 价格权限主页面逻辑 ============ */
  function initPricePermission(scope) {
    var group = scope.querySelector('[data-mode-group="price-permission"]');
    if (!group) return;

    var state = readState();

    function setMode(mode) {
      state.mode = mode;
      group.querySelectorAll('[data-mode]').forEach(function (cell) {
        var radio = cell.querySelector('.radio');
        var checked = cell.dataset.mode === mode;
        radio.classList.toggle('radio--checked', checked);
        var dot = radio.querySelector('.radio__dot');
        if (checked && !dot) {
          dot = document.createElement('div');
          dot.className = 'radio__dot';
          radio.appendChild(dot);
        } else if (!checked && dot) {
          dot.remove();
        }
      });
      scope.querySelectorAll('[data-conditional]').forEach(function (section) {
        section.hidden = section.dataset.conditional !== mode;
      });
    }

    group.querySelectorAll('[data-mode]').forEach(function (cell) {
      cell.addEventListener('click', function () {
        setMode(cell.dataset.mode);
      });
    });

    var autoSwitch = scope.querySelector('[data-auto-public-switch]');
    var timeRow = scope.querySelector('[data-auto-public-time-row]');
    var timeLabel = scope.querySelector('[data-auto-public-time-label]');
    var timePicker = scope.querySelector('[data-time-picker]');
    var timeInput = scope.querySelector('[data-time-picker-input]');

    if (autoSwitch) {
      autoSwitch.addEventListener('click', function () {
        state.autoPublic = !state.autoPublic;
        autoSwitch.classList.toggle('switch--on', state.autoPublic);
        autoSwitch.classList.toggle('switch--off', !state.autoPublic);
        if (timeRow) timeRow.hidden = !state.autoPublic;
      });
    }

    if (timeRow && timePicker) {
      timeRow.addEventListener('click', function () {
        timeInput.value = state.autoPublicTime || '';
        timePicker.hidden = false;
      });
      scope.querySelector('[data-time-picker-close]').addEventListener('click', function () {
        timePicker.hidden = true;
      });
      scope.querySelector('[data-time-picker-cancel]').addEventListener('click', function () {
        timePicker.hidden = true;
      });
      scope.querySelector('[data-time-picker-confirm]').addEventListener('click', function () {
        state.autoPublicTime = timeInput.value;
        timePicker.hidden = true;
        if (timeLabel) {
          timeLabel.textContent = formatTime(timeInput.value);
        }
      });
    }

    scope.querySelectorAll('[data-open-fan-group]').forEach(function (cell) {
      cell.addEventListener('click', function () {
        var mode = cell.dataset.openFanGroup;
        location.href = './fan-group-select.html?mode=' + mode;
      });
    });

    function formatTime(value) {
      if (!value) return '未设置';
      return value.replace('T', ' ');
    }

    function renderSummary() {
      var partialSummary = scope.querySelector('[data-fan-group-summary="partial"]');
      var excludeSummary = scope.querySelector('[data-fan-group-summary="exclude"]');
      var groups = readGroups();
      if (partialSummary) {
        var partialGroups = (state.partialGroups || []).map(function (id) {
          return groups.find(function (g) { return g.id === id; });
        }).filter(Boolean);
        partialSummary.textContent = summaryText(partialGroups);
      }
      if (excludeSummary) {
        var excludeGroups = (state.excludeGroups || []).map(function (id) {
          return groups.find(function (g) { return g.id === id; });
        }).filter(Boolean);
        excludeSummary.textContent = summaryText(excludeGroups);
      }
    }

    var saveBtn = scope.querySelector('[data-action="save"]');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        if (state.mode === 'private' && state.autoPublic && !state.autoPublicTime) {
          showToast('请选择公开时间');
          return;
        }
        if (state.mode === 'partial' && (!state.partialGroups || !state.partialGroups.length)) {
          showToast('请选择可见分组');
          return;
        }
        if (state.mode === 'exclude' && (!state.excludeGroups || !state.excludeGroups.length)) {
          showToast('请选择屏蔽分组');
          return;
        }
        writeState(state);
        showToast('已保存');
        setTimeout(function () {
          closeModal();
          fillSettingsSummary();
        }, 600);
      });
    }

    setMode(state.mode);
    if (state.autoPublic && autoSwitch) {
      autoSwitch.classList.add('switch--on');
      autoSwitch.classList.remove('switch--off');
      if (timeRow) timeRow.hidden = false;
      if (timeLabel) timeLabel.textContent = formatTime(state.autoPublicTime);
    }
    renderSummary();
  }

  /* ============ settings.html / index.html 摘要回填 ============ */
  function fillSettingsSummary() {
    var summary = document.querySelector('[data-fill="price-permission-summary"]');
    if (!summary) return;
    var state = readState();
    summary.textContent = MODE_LABELS[state.mode] || '公开';
  }

  /* ============ 粉丝分组选择页逻辑 ============ */
  function initFanGroupSelect(scope) {
    var list = scope.querySelector('[data-fan-group-list]');
    if (!list) return;

    var params = new URLSearchParams(location.search);
    var mode = params.get('mode') || 'partial';
    var state = readState();
    var selectedIds = mode === 'partial' ? (state.partialGroups || []) : (state.excludeGroups || []);
    var groups = readGroups();

    var titleEl = scope.querySelector('[data-page-title]');
    if (titleEl) titleEl.textContent = mode === 'partial' ? '选择可见分组' : '选择屏蔽分组';

    var emptyHint = scope.querySelector('[data-empty-hint]');

    function render() {
      list.innerHTML = '';
      emptyHint.hidden = groups.length > 0;
      groups.forEach(function (g, idx) {
        var cell = document.createElement('div');
        cell.className = 'cell cell--double cell--bg-white cell--clickable';
        if (idx < groups.length - 1) cell.classList.add('cell--divider-right-edge');
        var checked = selectedIds.indexOf(g.id) > -1;
        cell.innerHTML =
          '<div class="cell__select"><div class="checkbox' + (checked ? ' checkbox--checked' : '') + '"><div class="checkbox__inner"></div><div class="checkbox__icon"><img class="checkbox__asset" src="../lib/icons/checkbox-check.svg" alt=""></div></div></div>' +
          '<div class="cell__body"><div class="cell__content"><div class="cell__title-row"><span class="cell__title"></span></div><div class="cell__subtitle"></div></div></div>';
        cell.querySelector('.cell__title').textContent = g.name;
        cell.querySelector('.cell__subtitle').textContent = g.count + ' 人';
        cell.addEventListener('click', function () {
          var pos = selectedIds.indexOf(g.id);
          if (pos > -1) {
            selectedIds.splice(pos, 1);
            cell.querySelector('.checkbox').classList.remove('checkbox--checked');
          } else {
            selectedIds.push(g.id);
            cell.querySelector('.checkbox').classList.add('checkbox--checked');
          }
        });
        list.appendChild(cell);
      });
    }

    var newGroupBtn = scope.querySelector('[data-action="new-group"]');
    var dialog = scope.querySelector('[data-new-group-dialog]');
    var newInput = scope.querySelector('[data-new-group-input]');

    if (newGroupBtn && dialog) {
      newGroupBtn.addEventListener('click', function () {
        newInput.value = '';
        dialog.hidden = false;
        setTimeout(function () { newInput.focus(); }, 50);
      });
      scope.querySelectorAll('[data-dialog-close]').forEach(function (el) {
        el.addEventListener('click', function () { dialog.hidden = true; });
      });
      scope.querySelector('[data-new-group-confirm]').addEventListener('click', function () {
        var name = newInput.value.trim();
        if (!name) { showToast('请输入分组名称'); return; }
        var newGroup = { id: 'g' + Date.now(), name: name, count: 0 };
        groups.push(newGroup);
        writeGroups(groups);
        dialog.hidden = true;
        render();
        showToast('已新建分组');
      });
    }

    var doneBtn = scope.querySelector('[data-action="done"]');
    if (doneBtn) {
      doneBtn.addEventListener('click', function () {
        if (mode === 'partial') {
          state.partialGroups = selectedIds;
        } else {
          state.excludeGroups = selectedIds;
        }
        writeState(state);
        showToast('已更新分组');
        setTimeout(function () {
          location.href = './settings.html?open=price-permission';
        }, 500);
      });
    }

    render();
  }

  /* ============ 页面逻辑分派 ============ */
  function initPageLogic(scope) {
    if (scope.querySelector('[data-mode-group="price-permission"]')) {
      initPricePermission(scope);
    }
    if (scope.querySelector('[data-fan-group-list]')) {
      initFanGroupSelect(scope);
    }
  }

  function initModalTriggers() {
    document.querySelectorAll('[data-open-modal]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(el.dataset.openModal);
      });
    });
  }

  function boot() {
    fillSettingsSummary();
    initModalTriggers();
    initPageLogic(document);
    var params = new URLSearchParams(location.search);
    if (params.get('open') === 'price-permission') {
      openModal('./pages/price-permission.html');
      history.replaceState(null, '', location.pathname);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
