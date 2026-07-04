(function initInventoryRuleDemo() {
  const RULE_STORAGE_KEY = 'wego-inventory-rule-demo-state';
  const pushScreen = document.getElementById('push-screen');
  const modalOverlay = document.getElementById('modal-overlay');
  const toast = document.getElementById('app-toast');

  const templateMap = {
    'my-settings': 'template-settings-screen',
    'inventory-rule': 'template-inventory-rule-screen'
  };

  const defaultState = {
    enabled: true,
    freezeOversold: true,
    shareAcrossChannels: false,
    deductMode: 'pay',
    holdMinutes: 30,
    safeStock: 8,
    warningStock: 3,
    syncStrategy: 'realtime',
    channels: ['wechat', 'video'],
    receivers: ['owner', 'buyer'],
    excludedCount: 12
  };

  let toastTimer = null;

  function readState() {
    try {
      const raw = window.localStorage.getItem(RULE_STORAGE_KEY);
      if (!raw) return { ...defaultState };
      return { ...defaultState, ...JSON.parse(raw) };
    } catch {
      return { ...defaultState };
    }
  }

  function writeState(nextState) {
    try {
      window.localStorage.setItem(RULE_STORAGE_KEY, JSON.stringify(nextState));
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

  function deductLabel(value) {
    return {
      pay: '付款减库存',
      lock: '下单锁库存',
      ship: '发货减库存'
    }[value] || '付款减库存';
  }

  function getSummary(state) {
    if (!state.enabled) {
      return {
        status: '未启用',
        copy: '当前未启用库存保护，订单不会自动锁库和触发预警',
        alerts: `${state.receivers.length} 人待接收`
      };
    }

    const protectionCount = [
      state.freezeOversold,
      state.shareAcrossChannels,
      Number(state.safeStock) > 0,
      Number(state.warningStock) > 0
    ].filter(Boolean).length;

    return {
      status: '已启用',
      copy: `已启用 ${protectionCount} 项保护，${state.channels.length} 个渠道参与可售库存同步`,
      alerts: `${state.receivers.length} 人接收`
    };
  }

  function updateSettingsSummary(root, state) {
    if (!root) return;
    const summary = getSummary(state);
    const statusNode = root.querySelector('[data-summary-status] .badge__text');
    const copyNode = root.querySelector('[data-summary-copy]');
    const deductNode = root.querySelector('[data-summary-deduct]');
    const alertsNode = root.querySelector('[data-summary-alerts]');
    if (statusNode) statusNode.textContent = summary.status;
    if (copyNode) copyNode.textContent = summary.copy;
    if (deductNode) deductNode.textContent = deductLabel(state.deductMode);
    if (alertsNode) alertsNode.textContent = summary.alerts;
  }

  function setSwitchVisual(node, isOn) {
    if (!node) return;
    node.classList.toggle('switch--on', isOn);
    node.classList.toggle('switch--off', !isOn);
  }

  function setRadioVisual(group, value) {
    document.querySelectorAll(`[data-radio-control="${group}"]`).forEach((radio) => {
      radio.classList.toggle('radio--checked', radio.dataset.radioValue === value);
    });
  }

  function setStackVisual(root, value) {
    root.querySelectorAll('[data-stack-option]').forEach((option) => {
      option.classList.toggle('stack--selected', option.dataset.stackValue === value);
    });
  }

  function setTagVisual(root, values) {
    root.querySelectorAll('[data-tag-option]').forEach((tag) => {
      const selected = values.includes(tag.dataset.tagValue);
      tag.classList.toggle('tag--brand', selected);
      tag.classList.toggle('tag--selected', selected);
      tag.classList.toggle('tag--white', !selected);
      tag.classList.toggle('tag--normal', !selected);
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

  function syncReceiverVisual(root, receivers) {
    const allValues = ['owner', 'buyer', 'warehouse'];
    root.querySelectorAll('[data-checkbox-child="receivers"]').forEach((checkbox) => {
      const checked = receivers.includes(checkbox.dataset.checkboxValue);
      setCheckboxNode(checkbox, checked ? 'checked' : 'unchecked');
    });
    const parent = root.querySelector('[data-checkbox-parent="receivers"]');
    if (!parent) return;
    if (receivers.length === 0) {
      setCheckboxNode(parent, 'unchecked');
    } else if (receivers.length === allValues.length) {
      setCheckboxNode(parent, 'checked');
    } else {
      setCheckboxNode(parent, 'indeterminate');
    }
  }

  function fillRuleForm(root, state) {
    root.querySelectorAll('[data-switch-control]').forEach((node) => {
      setSwitchVisual(node, Boolean(state[node.dataset.switchControl]));
    });
    setRadioVisual('deductMode', state.deductMode);
    root.querySelectorAll('[data-number-key]').forEach((input) => {
      input.value = state[input.dataset.numberKey];
    });
    const stackRoot = root.querySelector('[data-stack-group="syncStrategy"]');
    if (stackRoot) setStackVisual(stackRoot, state.syncStrategy);
    const tagRoot = root.querySelector('[data-tag-group="channels"]');
    if (tagRoot) setTagVisual(tagRoot, state.channels);
    syncReceiverVisual(root, state.receivers);
    const exclude = root.querySelector('[data-exclude-copy]');
    if (exclude) {
      exclude.textContent = `已排除 ${state.excludedCount} 个 SKU，不参与自动锁库`;
    }
  }

  function collectRuleForm(root) {
    const state = readState();
    root.querySelectorAll('[data-switch-control]').forEach((node) => {
      state[node.dataset.switchControl] = node.classList.contains('switch--on');
    });
    const checkedRadio = root.querySelector('[data-radio-control="deductMode"].radio--checked');
    state.deductMode = checkedRadio ? checkedRadio.dataset.radioValue : state.deductMode;
    root.querySelectorAll('[data-number-key]').forEach((input) => {
      const cleaned = input.value.replace(/[^\d]/g, '');
      state[input.dataset.numberKey] = cleaned ? Number(cleaned) : 0;
    });
    const activeStack = root.querySelector('[data-stack-option].stack--selected');
    state.syncStrategy = activeStack ? activeStack.dataset.stackValue : state.syncStrategy;
    state.channels = Array.from(root.querySelectorAll('[data-tag-option].tag--selected')).map((tag) => tag.dataset.tagValue);
    state.receivers = Array.from(root.querySelectorAll('[data-checkbox-child="receivers"].checkbox--checked')).map((node) => node.dataset.checkboxValue);
    return state;
  }

  function validateState(state) {
    if (!state.enabled) return true;
    if (state.safeStock <= state.warningStock) {
      showToast('预警阈值必须小于安全库存');
      return false;
    }
    if (state.holdMinutes <= 0) {
      showToast('预占时长至少为 1 分钟');
      return false;
    }
    if (state.channels.length === 0) {
      showToast('至少选择 1 个生效渠道');
      return false;
    }
    if (state.receivers.length === 0) {
      showToast('至少选择 1 个预警接收人');
      return false;
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

    const switchRow = event.target.closest('[data-switch-row]');
    if (switchRow) {
      const key = switchRow.dataset.settingSwitch;
      const control = switchRow.querySelector(`[data-switch-control="${key}"]`);
      const isOn = control.classList.contains('switch--on');
      setSwitchVisual(control, !isOn);
      return;
    }

    const radioOption = event.target.closest('[data-radio-option]');
    if (radioOption) {
      setRadioVisual(radioOption.dataset.radioGroup, radioOption.dataset.radioValue);
      return;
    }

    const stackOption = event.target.closest('[data-stack-option]');
    if (stackOption) {
      const root = stackOption.closest('[data-stack-group]');
      setStackVisual(root, stackOption.dataset.stackValue);
      return;
    }

    const tagOption = event.target.closest('[data-tag-option]');
    if (tagOption) {
      const root = tagOption.closest('[data-tag-group]');
      const selected = tagOption.classList.contains('tag--selected');
      tagOption.classList.toggle('tag--brand', !selected);
      tagOption.classList.toggle('tag--selected', !selected);
      tagOption.classList.toggle('tag--white', selected);
      tagOption.classList.toggle('tag--normal', selected);
      root.dataset.dirty = 'true';
      return;
    }

    const checkboxChildRow = event.target.closest('[data-checkbox-child-row]');
    if (checkboxChildRow) {
      const group = checkboxChildRow.dataset.checkboxGroup;
      const value = checkboxChildRow.dataset.checkboxValue;
      const checkbox = checkboxChildRow.querySelector(`[data-checkbox-child="${group}"][data-checkbox-value="${value}"]`);
      const receivers = Array.from(document.querySelectorAll('[data-checkbox-child="receivers"].checkbox--checked')).map((node) => node.dataset.checkboxValue);
      const nextSet = new Set(receivers);
      if (checkbox.classList.contains('checkbox--checked')) {
        nextSet.delete(value);
      } else {
        nextSet.add(value);
      }
      syncReceiverVisual(document, Array.from(nextSet));
      return;
    }

    const checkboxParentRow = event.target.closest('[data-checkbox-parent-row]');
    if (checkboxParentRow) {
      const allValues = ['owner', 'buyer', 'warehouse'];
      const parent = checkboxParentRow.querySelector('[data-checkbox-parent="receivers"]');
      const allChecked = parent.classList.contains('checkbox--checked');
      syncReceiverVisual(document, allChecked ? [] : allValues);
      return;
    }

    const inlineAction = event.target.closest('[data-inline-action]');
    if (inlineAction) {
      showToast('排除商品清单已内置为 12 个 SKU');
      return;
    }

    const saveButton = event.target.closest('[data-save-rule]');
    if (saveButton) {
      const state = collectRuleForm(modalOverlay);
      if (!validateState(state)) return;
      writeState(state);
      updateSettingsSummary(pushScreen, state);
      closeModal();
      showToast('库存规则已保存');
    }
  });

  document.addEventListener('input', (event) => {
    const target = event.target.closest('[data-number-key]');
    if (!target) return;
    const cleaned = target.value.replace(/[^\d]/g, '');
    if (cleaned !== target.value) target.value = cleaned;
  });
})();
