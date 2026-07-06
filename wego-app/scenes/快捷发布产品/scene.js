(function () {
  var FIELDS = [
    { id: 'productName', label: '产品名', placeholder: '选填', smart: false },
    { id: 'price', label: '售价', placeholder: '选填', smart: false, type: 'price' },
    { id: 'sku', label: '货号', placeholder: '选填', smart: false },
    { id: 'spec', label: '规格', placeholder: '默认', smart: true },
    { id: 'color', label: '颜色', placeholder: '默认', smart: true },
    { id: 'weight', label: '重量', placeholder: '选填', smart: false, type: 'number' },
    { id: 'stock', label: '库存', placeholder: '默认不限库存', smart: false, type: 'number' }
  ];

  var SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '均码'];

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

  function placeCaretAtEnd(el) {
    if (!el) return;
    el.focus();
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function getCaretOffset(el) {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;
    var range = sel.getRangeAt(0);
    var pre = range.cloneRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.endContainer, range.endOffset);
    return pre.toString().length;
  }

  function setCaretOffset(el, offset) {
    if (!el) return;
    var range = document.createRange();
    var sel = window.getSelection();
    var node = el.firstChild || el;
    var max = node.length || 0;
    range.setStart(node, Math.min(offset, max));
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function renderInlineTags(editorEl) {
    var text = editorEl.textContent || '';

    if (!text.trim()) {
      editorEl.innerHTML = '';
      return;
    }

    var expanded = expandSizeRange(text);
    if (expanded !== null && expanded !== text) {
      text = expanded;
    }

    var existingTags = [];
    Array.from(editorEl.querySelectorAll('.quick-publish__tag')).forEach(function (tag) {
      var t = (tag.textContent || '').trim();
      if (t) existingTags.push(t);
    });

    var parts = text.split(/(\s+)/);
    var html = '';
    var seen = {};

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        html += ' ';
        continue;
      }
      var next = parts[i + 1];
      var followedBySpace = next && /^\s+$/.test(next);
      if (followedBySpace) {
        if (!seen[part]) {
          seen[part] = true;
          var isNew = existingTags.indexOf(part) === -1;
          var cls = 'quick-publish__tag' + (isNew ? ' quick-publish__tag--flash' : '');
          html += '<span class="' + cls + '">' + esc(part) + '</span> ';
        } else {
          html += esc(part) + ' ';
        }
        i++; // 跳过紧跟的空格
      } else {
        html += esc(part);
      }
    }

    editorEl.innerHTML = html;
    placeCaretAtEnd(editorEl);
  }

  function sanitizeNumber(text, allowDecimal) {
    if (allowDecimal) {
      var hasDot = false;
      var result = '';
      for (var i = 0; i < text.length; i++) {
        var c = text[i];
        if (c >= '0' && c <= '9') {
          result += c;
        } else if (c === '.' && !hasDot) {
          hasDot = true;
          result += c;
        }
      }
      return result;
    }
    return text.replace(/[^0-9]/g, '');
  }

  function isPriceValid(text) {
    if (!text) return true;
    return /^\d{0,7}(\.\d{0,2})?$/.test(text) && !/^0\d+/.test(text);
  }

  function editorRowMarkup(field, idx) {
    var editableCls = 'quick-publish__editor-field' + (field.smart ? ' quick-publish__editor-field--smart' : '');
    if (field.type === 'price' || field.type === 'number') {
      editableCls += ' quick-publish__editor-field--number';
    }
    return ''
      + '<div class="quick-publish__row" data-field="' + esc(field.id) + '">'
      +   '<label class="quick-publish__label" for="qp-' + esc(field.id) + '">' + esc(field.label) + '</label>'
      +   '<div class="quick-publish__input-wrap">'
      +     '<div class="' + editableCls + '" id="qp-' + esc(field.id) + '" contenteditable="true" data-index="' + idx + '" data-placeholder="' + esc(field.placeholder) + '" data-type="' + esc(field.type || '') + '" role="textbox" aria-multiline="true"></div>'
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
      +       '<div class="quick-publish__action-btn quick-publish__action-btn--editable" data-action="tag" role="button" tabindex="0" data-default="标签"><i class="wego-iconfont-s icon-jia"></i><span class="quick-publish__action-text" contenteditable="true" data-placeholder="标签" data-default="标签">标签</span></div>'
      +       '<div class="quick-publish__action-btn quick-publish__action-btn--editable" data-action="source" role="button" tabindex="0" data-default="来源"><i class="wego-iconfont-s icon-jia"></i><span class="quick-publish__action-text" contenteditable="true" data-placeholder="来源" data-default="来源">来源</span></div>'
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
      type: 'full-screen-modal'
    },
    template: '',
    init: function (ctx) {
      function render() {
        ctx.root.innerHTML = pageTemplate();
        bind();
      }

      function bind() {
        var root = ctx.root;
        var editors = Array.from(root.querySelectorAll('.quick-publish__editor-field'));

        // 键盘导航：Enter 下一行，Backspace 空行时上一行
        editors.forEach(function (editor) {
          editor.addEventListener('keydown', function (e) {
            var idx = parseInt(editor.dataset.index, 10);

            if (e.key === 'Enter') {
              e.preventDefault();
              var next = editors[idx + 1];
              if (next) next.focus();
              return;
            }

            if (e.key === 'Backspace' && (editor.textContent || '').trim() === '') {
              e.preventDefault();
              var prev = editors[idx - 1];
              if (prev) {
                prev.focus();
                placeCaretAtEnd(prev);
              }
              return;
            }

            // 阻止 contenteditable 富文本格式快捷键
            if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'i' || e.key === 'u')) {
              e.preventDefault();
            }
          });

          // 粘贴纯文本
          editor.addEventListener('paste', function (e) {
            e.preventDefault();
            var text = (e.clipboardData || window.clipboardData).getData('text/plain');
            document.execCommand('insertText', false, text);
          });
        });

        // 智能识别与数字输入过滤
        FIELDS.forEach(function (field) {
          var editor = root.querySelector('#qp-' + field.id);
          if (!editor) return;

          editor.addEventListener('input', function () {
            if (field.type === 'price' || field.type === 'number') {
              handleNumberInput(editor, field);
            } else if (field.smart) {
              renderInlineTags(editor);
            }
            ensurePlaceholder(editor);
          });
        });

        // 可编辑操作按钮（标签、来源）
        var editableActions = Array.from(root.querySelectorAll('.quick-publish__action-btn--editable'));
        editableActions.forEach(function (btn) {
          var textEl = btn.querySelector('.quick-publish__action-text');
          if (!textEl) return;

          btn.addEventListener('click', function (e) {
            if (e.target !== textEl && !textEl.contains(e.target)) {
              e.preventDefault();
              textEl.focus();
              placeCaretAtEnd(textEl);
            }
          });

          textEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              textEl.blur();
              return;
            }
            // 阻止富文本格式快捷键
            if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'i' || e.key === 'u')) {
              e.preventDefault();
            }
          });

          textEl.addEventListener('paste', function (e) {
            e.preventDefault();
            var text = (e.clipboardData || window.clipboardData).getData('text/plain');
            document.execCommand('insertText', false, text);
          });

          textEl.addEventListener('input', function () {
            renderInlineTags(textEl);
            ensurePlaceholder(textEl);
          });

          textEl.addEventListener('focus', function () {
            btn.classList.add('is-editing');
          });

          textEl.addEventListener('blur', function () {
            btn.classList.remove('is-editing');
            var value = (textEl.textContent || '').trim();
            if (!value) {
              textEl.textContent = textEl.dataset.default || '';
              btn.classList.remove('has-value');
            } else {
              // 识别后统一展示为纯文本，避免内联标签在按钮里换行撑开
              textEl.textContent = value.replace(/\s+/g, ' ').trim();
              btn.classList.add('has-value');
            }
          });
        });

        // 操作按钮事件委托
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
              var editor = root.querySelector('#qp-' + field.id);
              var value = editor ? (editor.textContent || '').trim() : '';
              result[field.id] = value;
              titleLines.push(field.label + ' ' + (value || field.placeholder));
            });
            // 收集标签/来源
            var tagText = root.querySelector('[data-action="tag"] .quick-publish__action-text');
            var sourceText = root.querySelector('[data-action="source"] .quick-publish__action-text');
            result.tag = tagText && tagText.textContent !== tagText.dataset.default ? tagText.textContent.trim() : '';
            result.source = sourceText && sourceText.textContent !== sourceText.dataset.default ? sourceText.textContent.trim() : '';

            var title = titleLines.join('\n');
            // eslint-disable-next-line no-console
            console.log('快捷发布产品结果:', result);
            // eslint-disable-next-line no-console
            console.log('产品标题:', title);
            // 延迟 50ms 显示 toast，避开当前 click 事件链中可能触发的 dismiss
            setTimeout(function () { ctx.toast('发布成功'); }, 50);
            return;
          }

          if (['visibility', 'upload'].indexOf(action) !== -1) {
            e.preventDefault();
            setTimeout(function () { ctx.toast('该功能尚未接入原型'); }, 50);
          }
        });
      }

      function handleNumberInput(editor, field) {
        var raw = editor.textContent || '';
        var caret = getCaretOffset(editor);
        var lastValid = editor.dataset.lastValid || '';
        var sanitized = field.type === 'price' ? sanitizeNumber(raw, true) : sanitizeNumber(raw, false);

        if (field.type === 'price' && !isPriceValid(sanitized)) {
          editor.textContent = lastValid;
          setCaretOffset(editor, lastValid.length);
          ctx.toast('售价最多输入 7 位整数和 2 位小数');
          return;
        }

        if (editor.textContent !== sanitized) {
          editor.textContent = sanitized;
          setCaretOffset(editor, Math.min(caret, sanitized.length));
        }

        editor.dataset.lastValid = sanitized;
      }

      function ensurePlaceholder(el) {
        if ((el.textContent || '').trim() === '') {
          el.innerHTML = '';
        }
      }

      render();
    }
  });
})();
