(function () {
  var FIELDS = [
    { id: 'productName', label: '产品名', placeholder: '选填', mode: 'none' },
    { id: 'price', label: '售价', placeholder: '选填', mode: 'single', type: 'price' },
    { id: 'sku', label: '货号', placeholder: '选填', mode: 'single' },
    { id: 'spec', label: '规格', placeholder: '默认', mode: 'multi' },
    { id: 'color', label: '颜色', placeholder: '默认', mode: 'multi' },
    { id: 'weight', label: '重量', placeholder: '选填', mode: 'single', type: 'number' },
    { id: 'stock', label: '库存', placeholder: '默认不限库存', mode: 'single', type: 'number' },
    { id: 'tag', label: '标签', placeholder: '标签', mode: 'multi', action: true },
    { id: 'source', label: '来源', placeholder: '来源', mode: 'multi', action: true }
  ];
  var SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '均码'];
  var flashTimers = new WeakMap();

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function text(value) { return String(value == null ? '' : value).replace(/\u00a0/g, ' '); }
  function key(value) { return text(value).trim().replace(/\s+/g, ' ').toLocaleLowerCase(); }

  function normalized(value) {
    var valueText = text(value).trim().replace(/\s+/g, ' ');
    var upper = valueText.toUpperCase();
    return SIZE_ORDER.indexOf(upper) >= 0 ? upper : valueText;
  }

  function id(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }

  function tokens(value) {
    var result = [];
    var source = text(value);
    var matcher = /[^\s]+/g;
    var match;
    while ((match = matcher.exec(source))) result.push({ value: match[0], start: match.index, end: match.index + match[0].length });
    return result;
  }

  function tokenAt(value, offset) {
    var list = tokens(value);
    var caret = Math.max(0, Math.min(offset, value.length));
    var i;
    for (i = 0; i < list.length; i++) {
      if (caret > list[i].start && caret <= list[i].end) return list[i];
      if (caret === list[i].start && i > 0) return list[i - 1];
    }
    for (i = list.length - 1; i >= 0; i--) if (list[i].end <= caret) return list[i];
    return list[0] || null;
  }

  function emptyField() { return { rawText: '', items: [] }; }

  function emptyForm() {
    var fields = {};
    FIELDS.forEach(function (field) { fields[field.id] = emptyField(); });
    return { fields: fields, visibility: 'public', editingProductId: '' };
  }

  function restoreForm(product) {
    var form = emptyForm();
    if (!product) return form;
    FIELDS.forEach(function (field) {
      var stored = product.fields && product.fields[field.id];
      if (!stored) return;
      form.fields[field.id] = { rawText: text(stored.rawText || ''), items: Array.isArray(stored.items) ? clone(stored.items) : [] };
    });
    form.visibility = product.visibility === 'private' ? 'private' : 'public';
    form.editingProductId = product.id || '';
    return form;
  }

  function selection(el) {
    var selected = window.getSelection();
    var length = text(el.textContent).length;
    if (!selected || !selected.rangeCount || !el.contains(selected.anchorNode)) return { start: length, end: length };
    var range = selected.getRangeAt(0);
    var before = range.cloneRange();
    before.selectNodeContents(el);
    before.setEnd(range.startContainer, range.startOffset);
    var through = range.cloneRange();
    through.selectNodeContents(el);
    through.setEnd(range.endContainer, range.endOffset);
    return { start: before.toString().length, end: through.toString().length };
  }

  function position(root, offset) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    var remaining = Math.max(0, offset);
    var last = null;
    while ((node = walker.nextNode())) {
      last = node;
      if (remaining <= node.nodeValue.length) return { node: node, offset: remaining };
      remaining -= node.nodeValue.length;
    }
    if (!last) { last = document.createTextNode(''); root.appendChild(last); }
    return { node: last, offset: last.nodeValue.length };
  }

  function setSelection(el, start, end, focus) {
    var length = text(el.textContent).length;
    var safeStart = Math.max(0, Math.min(start, length));
    var safeEnd = Math.max(safeStart, Math.min(end == null ? safeStart : end, length));
    var from = position(el, safeStart);
    var to = position(el, safeEnd);
    var range = document.createRange();
    range.setStart(from.node, from.offset);
    range.setEnd(to.node, to.offset);
    var selected = window.getSelection();
    if (!selected) return;
    if (focus) {
      try { el.focus({ preventScroll: true }); } catch (error) { el.focus(); }
    }
    selected.removeAllRanges();
    selected.addRange(range);
  }

  function caretEnd(el) { var length = text(el.textContent).length; setSelection(el, length, length, true); }

  function unwrapFlashes(el) {
    var focused = document.activeElement === el;
    var current = focused ? selection(el) : null;
    el.querySelectorAll('[data-recognition-flash]').forEach(function (node) {
      node.replaceWith(document.createTextNode(node.textContent || ''));
    });
    el.normalize();
    if (focused && current) setSelection(el, current.start, current.end, false);
  }

  function flash(el, start, end) {
    var timer = flashTimers.get(el);
    if (timer) window.clearTimeout(timer);
    unwrapFlashes(el);
    var source = text(el.textContent);
    if (start < 0 || end <= start || end > source.length) return;
    var focused = document.activeElement === el;
    var current = focused ? selection(el) : null;
    var mark = document.createElement('span');
    mark.dataset.recognitionFlash = 'true';
    mark.className = 'quick-publish__tag--flash';
    mark.textContent = source.slice(start, end);
    el.replaceChildren(document.createTextNode(source.slice(0, start)), mark, document.createTextNode(source.slice(end)));
    if (focused && current) setSelection(el, current.start, current.end, false);
    flashTimers.set(el, window.setTimeout(function () {
      unwrapFlashes(el);
      flashTimers.delete(el);
    }, 820));
  }

  function reconcileMulti(state, raw) {
    var list = tokens(raw);
    var old = Array.isArray(state.items) ? state.items : [];
    var used = {};
    state.items = list.map(function (token, index) {
      var matchIndex = -1;
      var best = Infinity;
      old.forEach(function (item, oldIndex) {
        if (used[oldIndex] || key(item.value) !== key(token.value)) return;
        var distance = Math.abs((item.start || 0) - token.start);
        if (distance < best) { best = distance; matchIndex = oldIndex; }
      });
      if (matchIndex < 0) old.forEach(function (item, oldIndex) {
        if (used[oldIndex] || matchIndex >= 0) return;
        if (token.start < item.end && token.end > item.start) matchIndex = oldIndex;
      });
      if (matchIndex < 0 && old[index] && !used[index]) matchIndex = index;
      var previous = matchIndex >= 0 ? old[matchIndex] : null;
      if (matchIndex >= 0) used[matchIndex] = true;
      var unchanged = previous && key(previous.value) === key(token.value);
      return {
        id: previous && previous.id ? previous.id : id('recognized'),
        value: token.value,
        normalizedValue: unchanged ? (previous.normalizedValue || normalized(token.value)) : normalized(token.value),
        start: token.start,
        end: token.end,
        status: unchanged && previous.status === 'recognized' ? 'recognized' : 'pending'
      };
    });
    state.rawText = raw;
    return state.items;
  }

  function reconcileSingle(state, raw) {
    var value = text(raw);
    var trimmed = value.trim();
    var previous = state.items && state.items[0];
    state.rawText = value;
    state.items = trimmed ? [{
      id: previous && previous.id ? previous.id : id('recognized'), value: trimmed,
      normalizedValue: normalized(trimmed), start: value.indexOf(trimmed), end: value.indexOf(trimmed) + trimmed.length,
      status: previous && key(previous.value) === key(trimmed) && previous.status === 'recognized' ? 'recognized' : 'pending'
    }] : [];
  }

  function removeDuplicate(el, state, item, ctx) {
    var source = text(el.textContent);
    var before = source.slice(0, item.start);
    var after = source.slice(item.end);
    if (/\s$/.test(before) && /^\s/.test(after)) after = after.slice(1);
    var next = before + after;
    el.textContent = next;
    reconcileMulti(state, next);
    var caret = Math.min(item.start, next.length);
    setSelection(el, caret, caret, true);
    ctx.toast('已选择「' + item.value + '」请重新输入');
  }

  function sizeRange(value) {
    var match = /^([a-zA-Z]+)~([a-zA-Z]+)$/.exec(value.trim());
    if (!match) return null;
    var start = SIZE_ORDER.indexOf(match[1].toUpperCase());
    var end = SIZE_ORDER.indexOf(match[2].toUpperCase());
    return start >= 0 && end > start ? SIZE_ORDER.slice(start, end + 1) : null;
  }

  function pageTemplate(editing) {
    var rows = FIELDS.filter(function (field) { return !field.action; }).map(function (field, index) {
      var wrapClass = 'quick-publish__input-wrap' + (field.type === 'price' ? ' quick-publish__input-wrap--price' : '');
      var editorClass = 'quick-publish__editor-field' + (field.mode === 'multi' ? ' quick-publish__editor-field--smart' : '');
      return '<div class="quick-publish__row" data-field="' + field.id + '" data-content-id="field-' + field.id + '"><label class="quick-publish__label" for="qp-' + field.id + '">' + field.label + '</label><div class="' + wrapClass + '">'
        + (field.type === 'price' ? '<span class="quick-publish__currency">¥</span>' : '')
        + '<div id="qp-' + field.id + '" class="' + editorClass + '" contenteditable="true" role="textbox" aria-multiline="false" data-field-id="' + field.id + '" data-index="' + index + '" data-placeholder="' + esc(field.placeholder) + '"></div></div></div>';
    }).join('');
    var actionOffset = FIELDS.filter(function (field) { return !field.action; }).length;
    return '<section class="quick-publish-page" data-bg="surface" data-surface-id="quick-publish-form"><div class="navbar"><div class="navbar__body navbar__body--spaced">'
      + '<div class="navbar__left"><span class="navbar__left-text" data-action="cancel" data-content-id="navbar-cancel" role="button">取消</span></div>'
      + '<div class="navbar__center"><span class="navbar__title">' + (editing ? '编辑产品' : '快捷发布产品') + '</span></div>'
      + '<div class="navbar__right navbar__right--button"><div class="navbar__action navbar__action--button" data-action="publish" data-content-id="navbar-publish-action"><button type="button" class="btn btn--strong btn--sm">发布</button></div></div></div></div>'
      + '<div class="quick-publish__body"><div class="quick-publish__editor">' + rows + '</div><div class="quick-publish__actions">'
      + '<div class="quick-publish__action-btn quick-publish__action-btn--editable" data-content-id="field-tag" role="button"><i class="wego-iconfont-s icon-jia"></i><span class="quick-publish__action-text" contenteditable="true" role="textbox" aria-multiline="false" data-field-id="tag" data-index="' + actionOffset + '" data-placeholder="标签"></span></div>'
      + '<div class="quick-publish__action-btn quick-publish__action-btn--editable" data-content-id="field-source" role="button"><i class="wego-iconfont-s icon-jia"></i><span class="quick-publish__action-text" contenteditable="true" role="textbox" aria-multiline="false" data-field-id="source" data-index="' + (actionOffset + 1) + '" data-placeholder="来源"></span></div>'
      + '<button type="button" class="quick-publish__action-btn" data-action="visibility" data-content-id="visibility-toggle" data-visibility="public"><i class="wego-iconfont-s icon-suo"></i><span>所有粉丝可见</span></button></div>'
      + '<div class="quick-publish__upload"><button type="button" class="quick-publish__upload-btn" data-action="upload" data-content-id="image-upload-placeholder" aria-label="上传图片"><i class="wego-iconfont-s icon-jia"></i></button></div></div></section>';
  }

  window.WegoApp.registerScene({
    routeId: 'quick-publish-product',
    title: '快捷发布产品',
    presentation: { type: 'full-screen-modal', transition: 'slide-up', coversTabBar: true },
    template: '',
    init: function (ctx) {
      var product = ctx.state.editingProductId && window.WegoProducts ? window.WegoProducts.getProduct(ctx.state.editingProductId) : null;
      var form = restoreForm(product);

      function definition(fieldId) { return FIELDS.find(function (field) { return field.id === fieldId; }); }
      function state(fieldId) { if (!form.fields[fieldId]) form.fields[fieldId] = emptyField(); return form.fields[fieldId]; }

      function normalizeWhitespace(el) {
        var raw = el.textContent;
        if (!raw) return '';
        var cleaned = raw.replace(/\u00a0/g, ' ');
        if (cleaned !== raw) {
          var focused = document.activeElement === el;
          var current = focused ? selection(el) : null;
          el.textContent = cleaned;
          if (focused && current) setSelection(el, current.start, current.end, false);
        }
        return text(cleaned);
      }

      function sync(el, field) {
        unwrapFlashes(el);
        var raw = normalizeWhitespace(el);
        if (field.mode === 'multi') reconcileMulti(state(field.id), raw);
        else if (field.mode === 'single') reconcileSingle(state(field.id), raw);
        else { state(field.id).rawText = raw; state(field.id).items = []; }
      }

      function expandRange(el, field, token, caret) {
        if (field.id !== 'spec') return null;
        var expanded = sizeRange(token.value);
        if (!expanded) return null;
        var source = text(el.textContent);
        var replacement = expanded.join(' ');
        el.textContent = source.slice(0, token.start) + replacement + source.slice(token.end);
        var nextCaret = caret + replacement.length - token.value.length;
        setSelection(el, nextCaret, nextCaret, true);
        reconcileMulti(state(field.id), text(el.textContent));
        var affected = state(field.id).items.filter(function (item) { return item.start >= token.start && item.end <= token.start + replacement.length; });
        affected.forEach(function (item) { item.status = 'recognized'; });
        flash(el, token.start, token.start + replacement.length);
        return affected[affected.length - 1] || null;
      }

      function recognizeMulti(el, field, caret, animate) {
        unwrapFlashes(el);
        var raw = normalizeWhitespace(el);
        var currentToken = tokenAt(raw, caret);
        if (!currentToken) { reconcileMulti(state(field.id), raw); return false; }
        var expanded = expandRange(el, field, currentToken, caret);
        if (expanded) return true;
        var items = reconcileMulti(state(field.id), raw);
        var item = items.find(function (candidate) { return candidate.start === currentToken.start && candidate.end === currentToken.end; });
        if (!item) return false;
        var duplicate = items.find(function (candidate) { return candidate.id !== item.id && key(candidate.value) === key(item.value); });
        if (duplicate) { removeDuplicate(el, state(field.id), item, ctx); return false; }
        item.normalizedValue = normalized(item.value);
        item.status = 'recognized';
        if (animate !== false) flash(el, item.start, item.end);
        return true;
      }

      function recognizeAll(el, field) {
        unwrapFlashes(el);
        var raw = normalizeWhitespace(el);
        var items = reconcileMulti(state(field.id), raw);
        var seen = {};
        var duplicate = null;
        items.forEach(function (item) {
          var itemKey = key(item.value);
          if (seen[itemKey] && !duplicate) duplicate = item;
          seen[itemKey] = true;
          item.normalizedValue = normalized(item.value);
          item.status = 'recognized';
        });
        if (duplicate) removeDuplicate(el, state(field.id), duplicate, ctx);
      }

      function recognizeSingle(el, field, animate) {
        unwrapFlashes(el);
        var raw = normalizeWhitespace(el);
        var previous = state(field.id).items[0];
        reconcileSingle(state(field.id), raw);
        var item = state(field.id).items[0];
        if (!item) return;
        var wasRecognized = previous && previous.status === 'recognized' && key(previous.value) === key(item.value);
        item.status = 'recognized';
        item.normalizedValue = normalized(item.value);
        if (field.type === 'price') el.parentElement.classList.add('has-recognized');
        if (animate !== false && !wasRecognized) flash(el, item.start, item.end);
      }

      function allowedNumberKey(event, field, current) {
        if (event.ctrlKey || event.metaKey || event.altKey) return true;
        if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab', 'Escape', 'Enter'].indexOf(event.key) >= 0) return true;
        if (/^\d$/.test(event.key)) return true;
        return field.type === 'price' && event.key === '.' && current.indexOf('.') < 0;
      }

      function sanitizeNumber(el, field) {
        var current = text(el.textContent);
        var caret = selection(el).start;
        var cleaned = field.type === 'price' ? current.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1') : current.replace(/\D/g, '');
        if (field.type === 'price' && (!/^\d{0,7}(\.\d{0,2})?$/.test(cleaned) || /^0\d+/.test(cleaned))) {
          cleaned = el.dataset.lastValid || '';
          ctx.toast('售价最多输入 7 位整数和 2 位小数');
        }
        if (current !== cleaned) {
          el.textContent = cleaned;
          setSelection(el, Math.min(caret, cleaned.length), Math.min(caret, cleaned.length), true);
        }
        el.dataset.lastValid = cleaned;
        reconcileSingle(state(field.id), cleaned);
        if (field.type === 'price' && !cleaned) el.parentElement.classList.remove('has-recognized');
      }

      function updateAction(el) {
        var button = el.closest('.quick-publish__action-btn--editable');
        if (button) button.classList.toggle('has-value', Boolean(text(el.textContent).trim()));
      }

      function focusEditor(editors, index) {
        var target = editors[index];
        if (!target) return false;
        window.requestAnimationFrame(function () { if (target.isConnected) caretEnd(target); });
        return true;
      }

      function bindEditor(el, field, editors) {
        var composing = false;
        var scheduled = false;
        function schedule() {
          if (scheduled || composing || field.mode !== 'multi') return;
          scheduled = true;
          window.setTimeout(function () {
            scheduled = false;
            if (el.isConnected && document.activeElement === el) recognizeMulti(el, field, selection(el).start, true);
          }, 0);
        }
        el.addEventListener('compositionstart', function () { composing = true; });
        el.addEventListener('compositionend', function () {
          composing = false; sync(el, field); updateAction(el);
          var caret = selection(el).start;
          if (caret && /\s/.test(text(el.textContent).charAt(caret - 1))) schedule();
        });
        el.addEventListener('keydown', function (event) {
          var index = Number(el.dataset.index);
          if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            if (composing) return;
            if (field.mode === 'multi') recognizeMulti(el, field, selection(el).start, true);
            else if (field.mode === 'single') recognizeSingle(el, field, true);
            else sync(el, field);
            updateAction(el);
            el.dataset.skipNextBlur = 'true';
            if (!focusEditor(editors, index + 1)) el.blur();
            return;
          }
          if (event.key === 'Backspace' && !text(el.textContent).trim() && editors[index - 1]) {
            event.preventDefault(); focusEditor(editors, index - 1); return;
          }
          if ((field.type === 'price' || field.type === 'number') && !allowedNumberKey(event, field, text(el.textContent))) {
            event.preventDefault(); return;
          }
          if (event.key === ' ' && field.mode === 'multi') schedule();
          if ((event.ctrlKey || event.metaKey) && ['b', 'i', 'u'].indexOf(event.key) >= 0) event.preventDefault();
        });
        el.addEventListener('input', function (event) {
          if (field.type === 'price' || field.type === 'number') sanitizeNumber(el, field); else sync(el, field);
          updateAction(el);
          var caret = selection(el).start;
          if (!composing && field.mode === 'multi' && ((event.data && /\s/.test(event.data)) || (caret && /\s/.test(text(el.textContent).charAt(caret - 1))))) schedule();
        });
        el.addEventListener('paste', function (event) {
          event.preventDefault();
          document.execCommand('insertText', false, (event.clipboardData || window.clipboardData).getData('text/plain'));
        });
        el.addEventListener('blur', function () {
          if (el.dataset.skipNextBlur) {
            delete el.dataset.skipNextBlur;
            return;
          }
          if (field.mode === 'single' && text(el.textContent).trim()) recognizeSingle(el, field, true);
          else sync(el, field);
          updateAction(el);
        });
      }

      function hydrate(root) {
        root.querySelectorAll('[data-field-id]').forEach(function (el) {
          var field = definition(el.dataset.fieldId);
          var fieldState = state(field.id);
          el.textContent = fieldState.rawText || '';
          el.dataset.lastValid = fieldState.rawText || '';
          updateAction(el);
          if (field.type === 'price' && fieldState.items && fieldState.items[0] && fieldState.items[0].status === 'recognized') {
            el.parentElement.classList.add('has-recognized');
          }
        });
        var visibility = root.querySelector('[data-action="visibility"]');
        if (form.visibility === 'private') {
          visibility.dataset.visibility = 'private';
          visibility.querySelector('i').className = 'wego-iconfont-s icon-suo-mian';
          visibility.querySelector('span').textContent = '仅自己可见';
        }
      }

      function payload(root) {
        root.querySelectorAll('[data-field-id]').forEach(function (el) {
          var field = definition(el.dataset.fieldId);
          if (field.mode === 'multi') recognizeAll(el, field);
          else if (field.mode === 'single') recognizeSingle(el, field, false);
          else sync(el, field);
        });
        return { id: form.editingProductId, fields: clone(form.fields), visibility: form.visibility };
      }

      ctx.root.innerHTML = pageTemplate(Boolean(product));
      hydrate(ctx.root);
      var editors = Array.from(ctx.root.querySelectorAll('[data-field-id]')).sort(function (a, b) { return Number(a.dataset.index) - Number(b.dataset.index); });
      editors.forEach(function (el) { bindEditor(el, definition(el.dataset.fieldId), editors); });
      ctx.root.querySelectorAll('.quick-publish__action-btn--editable').forEach(function (button) {
        var el = button.querySelector('[contenteditable]');
        button.addEventListener('click', function (event) { if (event.target !== el) { event.preventDefault(); caretEnd(el); } });
        el.addEventListener('focus', function () { button.classList.add('is-editing'); });
        el.addEventListener('blur', function () { button.classList.remove('is-editing'); });
      });
      ctx.root.addEventListener('click', function (event) {
        var action = event.target.closest('[data-action]');
        if (!action) return;
        if (action.dataset.action === 'cancel') { event.preventDefault(); ctx.back(); return; }
        if (action.dataset.action === 'upload') { event.preventDefault(); ctx.toast('该功能尚未接入原型'); return; }
        if (action.dataset.action === 'visibility') {
          event.preventDefault();
          form.visibility = form.visibility === 'public' ? 'private' : 'public';
          action.dataset.visibility = form.visibility;
          action.querySelector('i').className = form.visibility === 'private' ? 'wego-iconfont-s icon-suo-mian' : 'wego-iconfont-s icon-suo';
          action.querySelector('span').textContent = form.visibility === 'private' ? '仅自己可见' : '所有粉丝可见';
          return;
        }
        if (action.dataset.action === 'publish') {
          event.preventDefault();
          var button = action.querySelector('button');
          if (button.disabled) return;
          button.disabled = true;
          var data = payload(ctx.root);
          if (!window.WegoProducts) { button.disabled = false; ctx.toast('产品数据模块加载中，请重试'); return; }
          var saved = window.WegoProducts.saveProduct(data);
          ctx.state.editingProductId = '';
          // toast 先弹出，再切回动态页；toast 由宿主全局管理，不跟随页面退出消失。
          ctx.toast('发布成功');
          window.setTimeout(function () { window.WegoProducts.showDynamic(saved.id); }, 120);
        }
      });
    }
  });
})();