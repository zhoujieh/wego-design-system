(function () {
  var FIELDS = [
    { id: 'productName', label: '产品名', placeholder: '选填', smart: false },
    { id: 'price', label: '售价', placeholder: '选填', smart: false },
    { id: 'sku', label: '货号', placeholder: '选填', smart: false },
    { id: 'spec', label: '规格', placeholder: '默认', smart: true, smartType: 'spec' },
    { id: 'color', label: '颜色', placeholder: '默认', smart: true, smartType: 'color' },
    { id: 'weight', label: '重量', placeholder: '选填', smart: false },
    { id: 'stock', label: '库存', placeholder: '默认不限库存', smart: false }
  ];

  var SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '均码'];
  var SPEC_KEYWORDS = ['大码', '中码', '小码', '均码', '加小', '加大', '特大', '标准'];
  var COLOR_KEYWORDS = [
    '黑色', '白色', '红色', '黄色', '蓝色', '绿色', '浅绿色', '粉色', '紫色',
    '灰色', '米色', '卡其色', '驼色', '藏青色', '橙色', '棕色'
  ];

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sizeIndex(size) {
    return SIZE_ORDER.indexOf(size.toUpperCase());
  }

  function normalizeSize(size) {
    var upper = size.toUpperCase();
    if (upper === 'XL' || upper === 'XXL' || upper === 'XXXL' || upper === 'XS') return upper;
    return size;
  }

  function expandSizeRange(text) {
    var match = text.match(/([a-zA-Z均码]+)\s*~\s*([a-zA-Z均码]+)/);
    if (!match) return null;
    var start = normalizeSize(match[1]);
    var end = normalizeSize(match[2]);
    var sIdx = sizeIndex(start);
    var eIdx = sizeIndex(end);
    if (sIdx === -1 || eIdx === -1 || sIdx >= eIdx) return null;
    var expanded = SIZE_ORDER.slice(sIdx, eIdx + 1).join(' ');
    return text.replace(match[0], expanded);
  }

  function extractKeywords(text, type) {
    var keywords = type === 'spec' ? SPEC_KEYWORDS : COLOR_KEYWORDS;
    var found = [];
    var parts = text.split(/\s+/);
    parts.forEach(function (part) {
      if (!part) return;
      if (keywords.indexOf(part) !== -1 && found.indexOf(part) === -1) {
        found.push(part);
      }
    });
    return found;
  }

  function editorRowMarkup(field, idx) {
    var tagsHtml = field.smart
      ? '<div class="quick-publish__tags" data-tags-for="' + esc(field.id) + '"></div>'
      : '';
    return ''
      + '<div class="quick-publish__row" data-field="' + esc(field.id) + '">'
      +   '<label class="quick-publish__label" for="qp-' + esc(field.id) + '">' + esc(field.label) + '</label>'
      +   '<div class="quick-publish__input-wrap">'
      +     '<input type="text" class="quick-publish__input" id="qp-' + esc(field.id) + '" data-index="' + idx + '" placeholder="' + esc(field.placeholder) + '" />'
      +     tagsHtml
      +   '</div>'
      + '</div>';
  }

  function pageTemplate() {
    var rows = FIELDS.map(function (f, idx) { return editorRowMarkup(f, idx); }).join('');
    return ''
      + '<section class="quick-publish-page" data-bg="surface">'
      +   '<div class="navbar">'
      +     '<div class="navbar__body navbar__body--spaced">'
      +       '<div class="navbar__left">'
      +         '<span class="navbar__left-text" data-action="cancel" role="button" aria-label="取消">取消</span>'
      +       '</div>'
      +       '<div class="navbar__center">'
      +         '<span class="navbar__title">快捷发布产品</span>'
      +       '</div>'
      +       '<div class="navbar__right navbar__right--button">'
      +         '<div class="navbar__action navbar__action--button" data-action="publish">'
      +           '<button type="button" class="btn btn--strong btn--sm">发布</button>'
      +         '</div>'
      +       '</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="quick-publish__body">'
      +     '<div class="quick-publish__editor">'
      +       rows
      +     '</div>'
      +     '<div class="quick-publish__actions">'
      +       '<button type="button" class="quick-publish__action-btn" data-action="tag"><i class="wego-iconfont-s icon-jia"></i><span>标签</span></button>'
      +       '<button type="button" class="quick-publish__action-btn" data-action="source"><i class="wego-iconfont-s icon-jia"></i><span>来源</span></button>'
      +       '<button type="button" class="quick-publish__action-btn" data-action="visibility"><i class="wego-iconfont-s icon-fensi"></i><span>所有粉丝可见</span></button>'
      +     '</div>'
      +     '<div class="quick-publish__upload">'
      +       '<button type="button" class="quick-publish__upload-btn" data-action="upload" aria-label="上传图片"><i class="wego-iconfont-s icon-jia"></i></button>'
      +     '</div>'
      +   '</div>'
      + '</section>';
  }

  window.WegoApp.registerScene({
    routeId: 'quick-publish-product',
    title: '快捷发布产品',
    presentation: {
      type: 'push',
      transition: 'slide-left',
      coversTabBar: true
    },
    template: '',
    init: function (ctx) {
      function render() {
        ctx.root.innerHTML = pageTemplate();
        bind();
      }

      function bind() {
        var root = ctx.root;
        var inputs = Array.from(root.querySelectorAll('.quick-publish__input'));

        // 回车跳转到下一行输入框
        inputs.forEach(function (input) {
          input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              var idx = parseInt(input.dataset.index, 10);
              var next = inputs[idx + 1];
              if (next) next.focus();
            }
          });
        });

        // 规格/颜色智能识别
        FIELDS.forEach(function (field) {
          if (!field.smart) return;
          var input = root.querySelector('#qp-' + field.id);
          var tagsEl = root.querySelector('[data-tags-for="' + field.id + '"]');
          if (!input || !tagsEl) return;

          input.addEventListener('input', function () {
            var val = input.value;
            var expanded = expandSizeRange(val);
            if (expanded !== null && expanded !== val) {
              input.value = expanded;
              val = expanded;
            }
            var keywords = extractKeywords(val, field.smartType);
            tagsEl.innerHTML = keywords.map(function (k) {
              return '<span class="quick-publish__tag">' + esc(k) + '</span>';
            }).join('');
          });
        });

        // 通过事件委托处理所有操作按钮，避免单独绑定受渲染时机影响
        root.addEventListener('click', function (e) {
          var actionEl = e.target.closest('[data-action]');
          if (!actionEl) return;
          var action = actionEl.dataset.action;

          if (action === 'cancel') {
            e.preventDefault();
            ctx.back();
            return;
          }

          if (action === 'publish') {
            e.preventDefault();
            var result = {};
            var titleLines = [];
            FIELDS.forEach(function (field) {
              var input = root.querySelector('#qp-' + field.id);
              var value = input ? input.value.trim() : '';
              result[field.id] = value;
              titleLines.push(field.label + ' ' + (value || field.placeholder));
            });
            var title = titleLines.join('\n');
            // eslint-disable-next-line no-console
            console.log('快捷发布产品结果:', result);
            // eslint-disable-next-line no-console
            console.log('产品标题:', title);
            ctx.toast('发布成功');
            return;
          }

          // 其余入口占位提示
          if (['tag', 'source', 'visibility', 'upload'].indexOf(action) !== -1) {
            e.preventDefault();
            ctx.toast('该功能尚未接入原型');
          }
        });
      }

      render();
    }
  });
})();
