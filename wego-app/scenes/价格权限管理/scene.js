(function () {
  // 内存静态数据：默认价格类型与粉丝分组
  var DEFAULT_PRICE_TYPES = [
    { id: 'take', label: '拿货价' },
    { id: 'sale', label: '售价' },
    { id: 'wholesale', label: '批发价' },
    { id: 'dropship', label: '代发价' },
    { id: 'bundle', label: '打包价' }
  ];

  var FAN_GROUPS = [
    { id: 'vip', label: 'VIP 客户' },
    { id: 'new', label: '新客' },
    { id: 'agent', label: '分销代理' },
    { id: 'wholesale', label: '批发商' },
    { id: 'old', label: '老客' }
  ];

  // 权限类型常量
  var PERM_PUBLIC = 'public';
  var PERM_PRIVATE = 'private';
  var PERM_PARTIAL = 'partial';
  var PERM_EXCLUDE = 'exclude';

  var PERM_OPTIONS = [
    { value: PERM_PUBLIC, label: '公开', desc: '所有人可见此价格' },
    { value: PERM_PRIVATE, label: '私密', desc: '仅自己可见此价格' },
    { value: PERM_PARTIAL, label: '部分可见', desc: '选中的粉丝分组可见' },
    { value: PERM_EXCLUDE, label: '不给谁看', desc: '选中的粉丝分组不可见' }
  ];

  // 各价格类型权限配置状态（key = 价格类型 id）
  var defaultPermissionState = function () {
    return {
      take: { type: PERM_PUBLIC, groups: [] },
      sale: { type: PERM_PUBLIC, groups: [] },
      wholesale: { type: PERM_PARTIAL, groups: ['vip', 'wholesale'] },
      dropship: { type: PERM_PRIVATE, groups: [] },
      bundle: { type: PERM_EXCLUDE, groups: ['new'] }
    };
  };

  // 工具：权限摘要文案
  function permSummary(perm) {
    if (!perm) return '未设置';
    if (perm.type === PERM_PUBLIC) return '公开';
    if (perm.type === PERM_PRIVATE) return '私密';
    var count = (perm.groups || []).length;
    if (perm.type === PERM_PARTIAL) {
      return count ? '部分可见 · ' + count + ' 个分组' : '部分可见 · 未选分组';
    }
    if (perm.type === PERM_EXCLUDE) {
      return count ? '不给谁看 · ' + count + ' 个分组' : '不给谁看 · 未选分组';
    }
    return '';
  }

  // 工具：HTML 转义
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 列表页：价格类型行 markup（最后一行不加分割线修饰类）
  function priceTypeRowMarkup(priceType, perm, isLast) {
    var divider = isLast ? '' : ' cell--divider-right-edge';
    return ''
      + '<button type="button" class="cell cell--single cell--bg-white cell--clickable' + divider + '" data-price-type="' + esc(priceType.id) + '" role="button">'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + esc(priceType.label) + '</span></div>'
      +     '</div>'
      +     '<div class="cell__action">'
      +       '<span class="cell__action-text">' + esc(permSummary(perm)) + '</span>'
      +       '<i class="cell__arrow wego-iconfont-s icon-youjiantou16"></i>'
      +     '</div>'
      +   '</div>'
      + '</button>';
  }

  // 列表页 template
  function listPageTemplate(state) {
    var total = DEFAULT_PRICE_TYPES.length;
    var rows = DEFAULT_PRICE_TYPES.map(function (pt, idx) {
      return priceTypeRowMarkup(pt, state[pt.id], idx === total - 1);
    }).join('');
    return ''
      + '<section class="price-list-page" data-bg="page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body">'
      +       '<div class="navbar__left">'
      +         '<div class="navbar__left-btn" data-action="back" role="button" aria-label="返回"><i class="wego-iconfont-s icon-fanhui"></i></div>'
      +       '</div>'
      +       '<div class="navbar__center">'
      +         '<span class="navbar__title">价格管理</span>'
      +       '</div>'
      +       '<div class="navbar__right"></div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="phone-body price-list-body">'
      +     '<div class="cell-group">'
      +       '<div class="cell-group__title">默认价格类型</div>'
      +       '<div class="cell-group__content">'
      +         rows
      +       '</div>'
      +     '</div>'
      +   '</div>'
      + '</section>';
  }

  // 权限设置页：单选项行（最后一行不加分割线修饰类）
  function permOptionRowMarkup(option, checked, isLast) {
    var radioClass = 'radio' + (checked ? ' radio--checked' : '');
    var dot = checked ? '<div class="radio__dot"></div>' : '';
    var divider = isLast ? '' : ' cell--divider-right-edge';
    return ''
      + '<div class="cell cell--single cell--bg-white cell--clickable' + divider + '" role="radio" aria-checked="' + (checked ? 'true' : 'false') + '" data-perm-option="' + esc(option.value) + '" tabindex="0">'
      +   '<div class="cell__select">'
      +     '<div class="' + radioClass + '">'
      +       '<div class="radio__inner"></div>'
      +       dot
      +     '</div>'
      +   '</div>'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + esc(option.label) + '</span></div>'
      +       '<div class="cell__subtitle">' + esc(option.desc) + '</div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // 权限设置页：粉丝分组子项行（最后一行不加分割线修饰类）
  function fanGroupChildRowMarkup(group, checked, isLast) {
    var checkboxClass = 'checkbox' + (checked ? ' checkbox--checked' : '');
    var icon = checked ? '<div class="checkbox__icon"><img class="checkbox__asset" src="./lib/icons/checkbox-check.svg" alt=""></div>' : '';
    var divider = isLast ? '' : ' cell--divider-center';
    return ''
      + '<div class="cell cell--single cell--bg-white cell--indent' + divider + '" role="checkbox" aria-checked="' + (checked ? 'true' : 'false') + '" data-fan-group="' + esc(group.id) + '" tabindex="0">'
      +   '<div class="cell__select">'
      +     '<div class="' + checkboxClass + '">'
      +       '<div class="checkbox__inner"></div>'
      +       icon
      +     '</div>'
      +   '</div>'
      +   '<div class="cell__body">'
      +     '<div class="cell__content">'
      +       '<div class="cell__title-row"><span class="cell__title">' + esc(group.label) + '</span></div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  // 权限设置页 template
  function editPageTemplate(priceType, working) {
    var permTotal = PERM_OPTIONS.length;
    var optionRows = PERM_OPTIONS.map(function (opt, idx) {
      return permOptionRowMarkup(opt, working.type === opt.value, idx === permTotal - 1);
    }).join('');

    var needGroups = working.type === PERM_PARTIAL || working.type === PERM_EXCLUDE;
    var groupRows = '';
    if (needGroups) {
      var groupTotal = FAN_GROUPS.length;
      groupRows = FAN_GROUPS.map(function (g, idx) {
        return fanGroupChildRowMarkup(g, working.groups.indexOf(g.id) > -1, idx === groupTotal - 1);
      }).join('');
    }

    var groupTitle = working.type === PERM_PARTIAL ? '可见粉丝分组' : (working.type === PERM_EXCLUDE ? '不可见粉丝分组' : '');

    var groupBlockMarkup = '';
    if (needGroups) {
      groupBlockMarkup = ''
        + '<div class="cell-group price-perm-groups" data-fan-group-block>'
        +   '<div class="cell-group__title">' + esc(groupTitle) + '</div>'
        +   '<div class="cell-group__content" data-fan-groups>'
        +     groupRows
        +   '</div>'
        + '</div>';
    }

    return ''
      + '<section class="price-perm-page" data-bg="page">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body navbar__body--spaced">'
      +       '<div class="navbar__left">'
      +         '<button type="button" class="navbar__left-text" data-action="cancel">取消</button>'
      +       '</div>'
      +       '<div class="navbar__center">'
      +         '<span class="navbar__title">' + esc(priceType.label) + ' · 权限设置</span>'
      +       '</div>'
      +       '<div class="navbar__right navbar__right--button">'
      +         '<div class="navbar__action navbar__action--button">'
      +           '<button type="button" class="btn btn--strong btn--sm" data-action="save">保存</button>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="phone-body price-perm-body">'
      +     '<div class="cell-group">'
      +       '<div class="cell-group__title">权限类型</div>'
      +       '<div class="cell-group__content" data-perm-options>'
      +         optionRows
      +       '</div>'
      +     '</div>'
      +     groupBlockMarkup
      +   '</div>'
      + '</section>';
  }

  // 场景注册
  window.WegoApp.registerScene({
    routeId: 'my-price-management',
    title: '价格管理',
    presentation: {
      type: 'push',
      transition: 'slide-left',
      coversTabBar: true
    },
    template: '',
    init: function (ctx) {
      var state = ctx.state;
      if (!state.permissions) state.permissions = defaultPermissionState();

      // 渲染列表页
      function renderList() {
        ctx.root.innerHTML = listPageTemplate(state.permissions);
        bindListInteractions();
      }

      // 列表页交互：点击行打开权限设置页
      function bindListInteractions() {
        var root = ctx.root;
        root.querySelector('[data-action="back"]').addEventListener('click', function () {
          ctx.back();
        });
        root.querySelectorAll('[data-price-type]').forEach(function (row) {
          row.addEventListener('click', function () {
            var ptId = row.dataset.priceType;
            var pt = DEFAULT_PRICE_TYPES.find(function (p) { return p.id === ptId; });
            if (!pt) return;
            openEdit(pt);
          });
        });
      }

      // 打开权限设置页（full-screen-modal）
      function openEdit(priceType) {
        var working = JSON.parse(JSON.stringify(state.permissions[priceType.id]));

        function renderEdit() {
          var html = editPageTemplate(priceType, working);
          ctx.openFullScreenModal(html, {
            label: priceType.label + ' 权限设置',
            init: function (overlayCtx) {
              bindEditInteractions(overlayCtx.root);
            }
          });
        }

        function bindEditInteractions(overlayRoot) {
          // 取消
          var cancelBtn = overlayRoot.querySelector('[data-action="cancel"]');
          if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
              ctx.closeOverlay();
            });
          }

          // 保存
          var saveBtn = overlayRoot.querySelector('[data-action="save"]');
          if (saveBtn) {
            saveBtn.addEventListener('click', function () {
              // 切换到部分可见/不给谁看但未选分组时给提示
              if ((working.type === PERM_PARTIAL || working.type === PERM_EXCLUDE) && working.groups.length === 0) {
                ctx.toast('请至少选择一个粉丝分组');
                return;
              }
              state.permissions[priceType.id] = JSON.parse(JSON.stringify(working));
              ctx.closeOverlay();
              ctx.toast('已保存「' + priceType.label + '」权限设置');
              // 回填列表摘要
              ctx.updateEntrySummary('my-price-management', '已配置 5 项价格权限');
              // 重新渲染列表，刷新摘要
              renderList();
            });
          }

          // 权限类型单选
          var optionsContainer = overlayRoot.querySelector('[data-perm-options]');
          if (optionsContainer) {
            optionsContainer.querySelectorAll('[data-perm-option]').forEach(function (row) {
              row.addEventListener('click', function () {
                var val = row.dataset.permOption;
                if (working.type === val) return; // 不可取消已选项
                working.type = val;
                // 切换到公开/私密时清空分组
                if (val !== PERM_PARTIAL && val !== PERM_EXCLUDE) {
                  working.groups = [];
                }
                // 重新渲染（保持滚动位置不追求严格保留）
                renderEditOverlay();
              });
            });
          }

          // 粉丝分组多选
          bindFanGroupToggle(overlayRoot);

          function renderEditOverlay() {
            // 重新打开 overlay 时需要保留 working
            var overlayLayer = document.querySelector('[data-overlay-layer]');
            if (!overlayLayer) return;
            var panel = overlayLayer.querySelector('.app-overlay-panel');
            if (!panel) return;
            panel.innerHTML = editPageTemplate(priceType, working);
            bindEditInteractions(panel);
          }
        }

        function bindFanGroupToggle(overlayRoot) {
          var container = overlayRoot.querySelector('[data-fan-groups]');
          if (!container) return;
          container.querySelectorAll('[data-fan-group]').forEach(function (row) {
            row.addEventListener('click', function () {
              var gid = row.dataset.fanGroup;
              var idx = working.groups.indexOf(gid);
              if (idx > -1) {
                working.groups.splice(idx, 1);
              } else {
                working.groups.push(gid);
              }
              // 局部更新该行选中态，避免整体重渲染
              var checkbox = row.querySelector('.checkbox');
              if (!checkbox) return;
              var checked = idx === -1;
              checkbox.classList.toggle('checkbox--checked', checked);
              var iconWrapper = checkbox.querySelector('.checkbox__icon');
              if (checked && !iconWrapper) {
                var icon = document.createElement('div');
                icon.className = 'checkbox__icon';
                var img = document.createElement('img');
                img.className = 'checkbox__asset';
                img.src = './lib/icons/checkbox-check.svg';
                img.alt = '';
                icon.appendChild(img);
                checkbox.appendChild(icon);
              } else if (!checked && iconWrapper) {
                iconWrapper.remove();
              }
              row.setAttribute('aria-checked', checked ? 'true' : 'false');
            });
          });
        }

        renderEdit();
      }

      renderList();
    }
  });
})();
