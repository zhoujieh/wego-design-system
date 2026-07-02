/* 多仓配货规则 - 交互逻辑(入口页与业务页共用) */

(function () {
  'use strict';

  // ============ Toast ============
  const toast = document.getElementById('toast');
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('toast--visible');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('toast--visible');
    }, 1500);
  }

  // ============ 模态开关(仅入口页有) ============
  const modalOverlay = document.getElementById('modal-overlay');
  const openTrigger = document.getElementById('open-delivery-rule');
  const modalCancel = document.getElementById('modal-cancel');
  const modalSave = document.getElementById('modal-save');

  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('modal-overlay--active');
    // 重置滚动位置
    const body = modalOverlay.querySelector('.modal-body');
    if (body) body.scrollTop = 0;
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('modal-overlay--active');
  }

  if (openTrigger) openTrigger.addEventListener('click', openModal);
  if (modalCancel) modalCancel.addEventListener('click', closeModal);

  // ============ 单选组互斥 ============
  // 用 data-radio-group 标记同组 cell,点击 cell 整行切换 radio 选中态
  function setupRadioGroup(groupName) {
    const cells = document.querySelectorAll(`[data-radio-group="${groupName}"]`);
    if (!cells.length) return;

    cells.forEach((cell) => {
      cell.addEventListener('click', (event) => {
        // 排除点击 cell 内子级 switch / 链接 / 按钮的情况
        const nested = event.target.closest('.cell--sub, button, a, .switch');
        if (nested && nested !== cell) return;

        cells.forEach((c) => {
          c.setAttribute('aria-checked', 'false');
          const radio = c.querySelector('.radio');
          if (radio) radio.classList.remove('radio--checked');
        });

        cell.setAttribute('aria-checked', 'true');
        const radio = cell.querySelector('.radio');
        if (radio) radio.classList.add('radio--checked');

        updateConditionalAreas(groupName);
      });

      // 键盘可访问性
      cell.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        cell.click();
      });
    });
  }

  // ============ 子级条件区域联动 ============
  function updateConditionalAreas(groupName) {
    if (groupName === 'stock-order') {
      // 库存扣减顺序:选"默认顺序"时显示"调整仓库顺序"子级 cell
      const checked = document.querySelector('[data-radio-group="stock-order"][aria-checked="true"]');
      const sub = document.getElementById('sub-warehouse-order');
      if (!sub) return;
      const value = checked ? checked.dataset.value : '';
      sub.hidden = value !== 'default';
    }

    if (groupName === 'single-shortage') {
      // 单仓不足策略:选"根据仓库自动拆单"时显示"启用自动拆单"子级 switch
      const checked = document.querySelector('[data-radio-group="single-shortage"][aria-checked="true"]');
      const sub = document.getElementById('sub-auto-split');
      if (!sub) return;
      const value = checked ? checked.dataset.value : '';
      if (value === 'split') {
        sub.hidden = false;
        sub.classList.remove('cell--disabled');
      } else {
        sub.hidden = true;
        sub.classList.add('cell--disabled');
        // 重置子级开关为关闭态
        const subSwitch = sub.querySelector('.switch');
        if (subSwitch) {
          subSwitch.classList.remove('switch--on');
          subSwitch.classList.add('switch--off');
        }
        sub.setAttribute('aria-checked', 'false');
      }
    }
  }

  setupRadioGroup('stock-order');
  setupRadioGroup('single-shortage');

  // ============ Switch 切换 ============
  document.querySelectorAll('.cell[role="switch"]').forEach((cell) => {
    cell.addEventListener('click', (event) => {
      // 子级 switch 容器禁用时不响应
      if (cell.classList.contains('cell--disabled')) return;
      // 排除点击嵌套的可交互元素
      const nested = event.target.closest('button, a');
      if (nested && nested !== cell) return;

      const switchEl = cell.querySelector('.switch');
      if (!switchEl) return;

      const checked = cell.getAttribute('aria-checked') === 'true';
      cell.setAttribute('aria-checked', String(!checked));
      switchEl.classList.toggle('switch--on', !checked);
      switchEl.classList.toggle('switch--off', checked);
    });

    cell.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      cell.click();
    });
  });

  // ============ 保存交互 ============
  function handleSave() {
    showToast('已保存多仓配货规则');
    if (modalOverlay) {
      window.setTimeout(closeModal, 300);
    }
  }

  if (modalSave) modalSave.addEventListener('click', handleSave);

  // 业务页(独立)保存按钮
  const standaloneSave = document.getElementById('standalone-save');
  if (standaloneSave) {
    standaloneSave.addEventListener('click', handleSave);
  }

  // 业务页(独立)取消按钮:返回入口页
  const standaloneCancel = document.getElementById('standalone-cancel');
  if (standaloneCancel) {
    standaloneCancel.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  }

  // ============ 入口页"调整仓库顺序"提示 ============
  const adjustOrderCell = document.getElementById('sub-warehouse-order');
  if (adjustOrderCell) {
    adjustOrderCell.addEventListener('click', () => {
      showToast('仓库排序面板待接入');
    });
  }

  // ============ 单仓不足策略:选"自动调拨"时,目标仓库选择 ============
  const targetWarehouseCell = document.getElementById('target-warehouse');
  if (targetWarehouseCell) {
    targetWarehouseCell.addEventListener('click', () => {
      showToast('目标仓库选择面板待接入');
    });
  }

  // 初始化子级区域可见性(根据默认选中项)
  function initConditionalAreas() {
    const stockChecked = document.querySelector('[data-radio-group="stock-order"][aria-checked="true"]');
    if (stockChecked) updateConditionalAreas('stock-order');
    const shortageChecked = document.querySelector('[data-radio-group="single-shortage"][aria-checked="true"]');
    if (shortageChecked) updateConditionalAreas('single-shortage');
  }

  initConditionalAreas();
})();
