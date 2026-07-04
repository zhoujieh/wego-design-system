(function initPriceVisibilityDemo() {
  const STORAGE_KEY = 'wego-price-visibility-state';
  const pushScreen = document.getElementById('push-screen');
  const modalOverlay = document.getElementById('modal-overlay');
  const toast = document.getElementById('app-toast');

  const templateMap = {
    'my-settings': 'template-settings-screen',
    'price-visibility': 'template-price-visibility-screen'
  };

  const FAN_GROUP_LABELS = {
    all: '全部粉丝',
    new: '新客',
    vip: '老客VIP',
    agent: '代理分销',
    staff: '员工内购',
    silent: '沉默用户'
  };
  const FAN_GROUP_VALUES = Object.keys(FAN_GROUP_LABELS);

  const MODE_LABELS = {
    private: '私密',
    public: '公开',
    allow: '谁可以看',
    deny: '不给谁看'
  };

  const defaultState = {
    mode: 'private',
    groups: []
  };

  let toastTimer = null;

  function readState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState };
      return { ...defaultState, ...JSON.parse(raw) };
    } catch {
      return { ...defaultState };
    }
  }

  function writeState(nextState) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // 静态预览允许失败降级
    }
  }

  function renderTemplate(templateId) {
    const template = document.getElementById(templateId);
    if (!template) return null;
    return template.content.firstElementChild.cloneNode(true);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    toast.classList.add('app-toast--show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('app-toast--show');
      window.setTimeout(() => {
        toast.hidden = true;
      }, 180);
    }, 1600);
  }

  function getSummary(state) {
    const mode = state.mode || 'private';
    if (mode === 'private') {
      return { status: MODE_LABELS.private, copy: '仅自己可见' };
    }
    if (mode === 'public') {
      return { status: MODE_LABELS.public, copy: '所有人可见' };
    }
    const count = state.groups.length;
    if (mode === 'allow') {
      return {
        status: MODE_LABELS.allow,
        copy: count === 0 ? '未选择分组' : `${count} 个分组可见`
      };
    }
    return {
      status: MODE_LABELS.deny,
      copy: count === 0 ? '未选择分组' : `${count} 个分组不可见`
    };
  }

  function getPageSummary(state) {
    const mode = state.mode || 'private';
    const count = state.groups.length;
    if (mode === 'private') return '当前为私密，仅自己可见价格。';
    if (mode === 'public') return '当前为公开，所有人可见价格。';
    if (mode === 'allow') {
      return count === 0
        ? '当前为谁可以看，未选择分组。'
        : `当前为谁可以看，${count} 个分组可见价格。`;
    }
    return count === 0
      ? '当前为不给谁看，未选择分组。'
      : `当前为不给谁看，${count} 个分组看不到价格。`;
  }

  function getFanGroupTitle(mode) {
    return mode === 'deny' ? '选择不可见的粉丝分组' : '选择可见的粉丝分组';
  }

  function updateMySummary(state) {
    const summary = getSummary(state);
    const node = document.querySelector('[data-my-summary]');
    if (node) node.textContent = summary.copy;
  }

  function updateSettingsSummary(root, state) {
    if (!root) return;
    const summary = getSummary(state);
    const statusNode = root.querySelector('[data-summary-status] .badge__text');
    const copyNode = root.querySelector('[data-summary-copy]');
    if (statusNode) statusNode.textContent = summary.status;
    if (copyNode) copyNode.textContent = summary.copy;
  }

  function setRadioVisual(group, value) {
    document.querySelectorAll(`[data-radio-control="${group}"]`).forEach((radio) => {
      radio.classList.toggle('radio--checked', radio.dataset.radioValue === value);
    });
  }

  function setCheckboxNode(node, state) {
    node.classList.remove('checkbox--checked', 'checkbox--indeterminate');
    const icon = node.querySelector('.checkbox__icon');
    const minus = node.querySelector('.checkbox__minus');
    if (icon) icon.hidden = state !== 'checked';
    if (minus) minus.hidden = state !== 'indeterminate';
    if (state === 'checked') node.classList.add('checkbox--checked');
    if (state === 'indeterminate') node.classList.add('checkbox--indeterminate');
  }

  function syncFanGroupVisual(root, groups) {
    root.querySelectorAll('[data-checkbox-child="fanGroups"]').forEach((checkbox) => {
      const checked = groups.includes(checkbox.dataset.checkboxValue);
      setCheckboxNode(checkbox, checked ? 'checked' : 'unchecked');
    });
  }

  function updateFanGroupVisibility(root, mode) {
    const list = root.querySelector('[data-fan-group-list]');
    if (!list) return;
    const shouldShow = mode === 'allow' || mode === 'deny';
    list.hidden = !shouldShow;
    const titleNode = root.querySelector('[data-fan-group-title]');
    if (titleNode) titleNode.textContent = getFanGroupTitle(mode);
  }

  function updatePageSummary(root, state) {
    const node = root.querySelector('[data-visibility-summary]');
    if (node) node.textContent = getPageSummary(state);
  }

  function fillRuleForm(root, state) {
    setRadioVisual('visibilityMode', state.mode);
    syncFanGroupVisual(root, state.groups);
    updateFanGroupVisibility(root, state.mode);
    updatePageSummary(root, state);
  }

  function collectRuleForm(root) {
    const state = readState();
    const checkedRadio = root.querySelector('[data-radio-control="visibilityMode"].radio--checked');
    state.mode = checkedRadio ? checkedRadio.dataset.radioValue : state.mode;
    state.groups = Array.from(root.querySelectorAll('[data-checkbox-child="fanGroups"].checkbox--checked')).map((node) => node.dataset.checkboxValue);
    return state;
  }

  function validateState(state) {
    if (state.mode === 'allow' || state.mode === 'deny') {
      if (state.groups.length === 0) {
        showToast(state.mode === 'allow' ? '请至少选择 1 个可见分组' : '请至少选择 1 个不可见分组');
        return false;
      }
    }
    return true;
  }

  function openPushScreen(routeId) {
    const node = renderTemplate(templateMap[routeId]);
    if (!node) return;
    pushScreen.innerHTML = '';
    pushScreen.appendChild(node);
    updateSettingsSummary(node, readState());
    pushScreen.hidden = false;
    window.requestAnimationFrame(() => {
      pushScreen.classList.add('push-screen--active');
    });
  }

  function closePushScreen() {
    pushScreen.classList.remove('push-screen--active');
    window.setTimeout(() => {
      pushScreen.hidden = true;
      pushScreen.innerHTML = '';
    }, 250);
  }

  function openModal(routeId) {
    const node = renderTemplate(templateMap[routeId]);
    if (!node) return;
    modalOverlay.innerHTML = '';
    modalOverlay.appendChild(node);
    fillRuleForm(node, readState());
    modalOverlay.hidden = false;
    window.requestAnimationFrame(() => {
      modalOverlay.classList.add('modal-overlay--active');
    });
  }

  function closeModal() {
    modalOverlay.classList.remove('modal-overlay--active');
    window.setTimeout(() => {
      modalOverlay.hidden = true;
      modalOverlay.innerHTML = '';
    }, 250);
  }

  // 初始化宿主页"我的"入口摘要回填
  updateMySummary(readState());

  document.body.addEventListener('wego:host-route', (event) => {
    const routeId = event.detail && event.detail.routeId;
    if (routeId === 'my-settings') {
      openPushScreen(routeId);
      return;
    }
    showToast('该入口本轮只保留宿主占位');
  });

  document.addEventListener('click', (event) => {
    const closeScreen = event.target.closest('[data-close-screen]');
    if (closeScreen) {
      closePushScreen();
      return;
    }

    const openModalTrigger = event.target.closest('[data-open-modal]');
    if (openModalTrigger) {
      openModal(openModalTrigger.dataset.openModal);
      return;
    }

    const closeModalTrigger = event.target.closest('[data-close-modal]');
    if (closeModalTrigger) {
      closeModal();
      return;
    }

    const radioOption = event.target.closest('[data-radio-option]');
    if (radioOption) {
      const group = radioOption.dataset.radioGroup;
      const value = radioOption.dataset.radioValue;
      setRadioVisual(group, value);
      const root = radioOption.closest('[data-visibility-group]');
      if (root) {
        updateFanGroupVisibility(root, value);
        const state = collectRuleForm(root);
        updatePageSummary(root, state);
      }
      return;
    }

    const checkboxChildRow = event.target.closest('[data-checkbox-child-row]');
    if (checkboxChildRow) {
      const group = checkboxChildRow.dataset.checkboxGroup;
      const value = checkboxChildRow.dataset.checkboxValue;
      const checkbox = checkboxChildRow.querySelector(`[data-checkbox-child="${group}"][data-checkbox-value="${value}"]`);
      if (!checkbox) return;
      const root = checkboxChildRow.closest('[data-visibility-group]');
      if (!root) return;
      const current = Array.from(root.querySelectorAll('[data-checkbox-child="fanGroups"].checkbox--checked')).map((node) => node.dataset.checkboxValue);
      const nextSet = new Set(current);
      if (checkbox.classList.contains('checkbox--checked')) {
        nextSet.delete(value);
      } else {
        nextSet.add(value);
      }
      syncFanGroupVisual(root, Array.from(nextSet));
      const state = collectRuleForm(root);
      updatePageSummary(root, state);
      return;
    }

    const saveButton = event.target.closest('[data-save-rule]');
    if (saveButton) {
      const state = collectRuleForm(modalOverlay);
      if (!validateState(state)) return;
      writeState(state);
      updateSettingsSummary(pushScreen, state);
      updateMySummary(state);
      closeModal();
      showToast('价格权限已保存');
    }
  });
})();
