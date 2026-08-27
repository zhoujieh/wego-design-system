const orderQueryTemplate = `
  <section class="layout-page order-query-page" data-component-slug="layout-page" data-surface-id="order-query" data-route-id="workspace-order-query" data-layout-mode="composed" data-bg="page">
    <div class="layout-page__top">
      <div class="navbar" data-component-slug="navbar">
        <div class="navbar__body">
          <div class="navbar__left">
            <button type="button" class="navbar__left-btn" data-dom-id="order-query-back" aria-label="返回"><i class="wego-iconfont-s icon-fanhui" aria-hidden="true"></i></button>
          </div>
          <div class="navbar__center"><span class="navbar__title">订单查询</span></div>
          <div class="navbar__right"></div>
        </div>
      </div>
    </div>
    <div class="layout-page__body">
      <main class="layout-scroll order-query-page__scroll" data-component-slug="layout-scroll">
        <section class="layout-section order-query-page__section" data-component-slug="layout-section" data-edge="M8" data-width="content">
          <div class="layout-flow order-query-page__flow" data-component-slug="layout-flow" data-direction="vertical" data-align="stretch">
            <div class="order-query-page__intro">
              <h1 class="order-query-page__heading">输入订单号查询</h1>
              <p class="order-query-page__description">查询订单当前状态，未找到时可重新输入。</p>
            </div>

            <form class="card card--surface card--vertical order-query-page__form-card" data-component-slug="card" data-dom-id="order-query-form" novalidate>
              <div class="card__content order-query-page__form-content">
                <div class="input-group" data-component-slug="input" data-field="order-query-input-group">
                  <label class="field-label" for="order-query-number">订单号</label>
                  <div class="input-wrapper">
                    <input id="order-query-number" data-dom-id="order-query-number" type="text" placeholder="请输入完整订单号" autocomplete="off" autocapitalize="characters" spellcheck="false" enterkeyhint="search" maxlength="32" aria-describedby="order-query-number-error">
                    <button type="button" class="input-clear" data-dom-id="order-query-clear" aria-label="清空订单号"><i class="icon-yuancha-mian" aria-hidden="true"></i></button>
                  </div>
                  <span id="order-query-number-error" class="field-error">请输入订单号</span>
                </div>
                <button type="submit" class="btn btn--strong btn--lg order-query-page__submit" data-component-slug="button" data-action="order-query-submit">查询订单</button>
              </div>
            </form>

            <div class="order-query-page__result-region" data-region="query-result" aria-live="polite" aria-atomic="true"></div>
          </div>
        </section>
      </main>
    </div>
  </section>
`;

(function () {
  'use strict';

  var QUERY_DELAY = 650;
  var ORDER_NUMBER_PATTERN = /^SO\d{12}$/i;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\x22/g, '&quot;')
      .replace(/\x27/g, '&#39;');
  }

  function loadingMarkup() {
    return ''
      + '<div class="order-query-page__loading-state" role="status">'
      +   '<span class="loading loading--32" data-component-slug="loading" aria-label="正在查询">'
      +     '<span class="loading__icon"><span class="loading__dot loading__dot--1"></span><span class="loading__dot loading__dot--2"></span><span class="loading__dot loading__dot--3"></span></span>'
      +   '</span>'
      +   '<span class="order-query-page__loading-text">正在查询订单</span>'
      + '</div>';
  }

  function successMarkup(orderNo) {
    return ''
      + '<section class="card card--surface card--vertical order-query-page__success-card" data-component-slug="card" role="status" aria-label="查询成功">'
      +   '<div class="card__content order-query-page__success-content">'
      +     '<div class="order-query-page__success-heading">'
      +       '<span class="order-query-page__success-icon" aria-hidden="true"><i class="wego-iconfont-s icon-goutoast"></i></span>'
      +       '<div><div class="card__header">查询成功</div><div class="card__body">已找到该订单</div></div>'
      +     '</div>'
      +     '<div class="order-query-page__order-number"><span>订单号</span><strong>' + escapeHtml(orderNo) + '</strong></div>'
      +   '</div>'
      + '</section>';
  }

  function notFoundMarkup() {
    return ''
      + '<div class="order-query-page__result-state">'
      +   '<div class="result" data-component-slug="result" role="group" aria-label="未找到订单">'
      +     '<div class="result__icon" aria-hidden="true"><i class="wego-iconfont-s icon-tanhao-mian"></i></div>'
      +     '<div class="result__title">未找到该订单</div>'
      +   '</div>'
      +   '<p class="order-query-page__result-note">请检查订单号后重新查询</p>'
      + '</div>';
  }

  function failureMarkup() {
    return ''
      + '<div class="order-query-page__result-state">'
      +   '<div class="result" data-component-slug="result" role="group" aria-label="查询失败">'
      +     '<div class="result__icon" aria-hidden="true"><i class="wego-iconfont-s icon-tanhao-mian"></i></div>'
      +     '<div class="result__title">查询失败，<button type="button" class="link link--inline" data-component-slug="link" data-action="retry">请重试</button></div>'
      +   '</div>'
      +   '<p class="order-query-page__result-note">请检查网络连接后重试</p>'
      + '</div>';
  }

  window.WegoApp.registerScene({
    routeId: 'workspace-order-query',
    title: '订单查询',
    presentation: { type: 'push', transition: 'slide-left', coversTabBar: true },
    template: orderQueryTemplate,
    init: function (ctx) {
      var root = ctx.root;
      var state = ctx.state;
      var form = root.querySelector('[data-dom-id="order-query-form"]');
      var inputGroup = root.querySelector('[data-field="order-query-input-group"]');
      var input = root.querySelector('[data-dom-id="order-query-number"]');
      var clearButton = root.querySelector('[data-dom-id="order-query-clear"]');
      var submitButton = root.querySelector('[data-action="order-query-submit"]');
      var resultRegion = root.querySelector('[data-region="query-result"]');
      var timer = 0;

      state.orderNo = '';
      state.status = 'idle';
      state.retryCount = 0;
      input.value = '';

      function updateClearButton() {
        clearButton.style.display = !input.disabled && input.value ? 'block' : 'none';
      }

      function clearValidation() {
        inputGroup.classList.remove('is-error');
        input.removeAttribute('aria-invalid');
      }

      function showValidation() {
        inputGroup.classList.add('is-error');
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', 'order-query-number-error');
        input.focus();
      }

      function setBusy(isBusy) {
        input.disabled = isBusy;
        clearButton.disabled = isBusy;
        submitButton.disabled = isBusy;
        submitButton.classList.toggle('btn--disabled', isBusy);
        submitButton.textContent = isBusy ? '查询中' : '查询订单';
        updateClearButton();
      }

      function renderStatus(status) {
        state.status = status;
        if (status === 'loading') {
          resultRegion.innerHTML = loadingMarkup();
        } else if (status === 'success') {
          resultRegion.innerHTML = successMarkup(state.orderNo);
        } else if (status === 'not-found') {
          resultRegion.innerHTML = notFoundMarkup();
        } else if (status === 'failure') {
          resultRegion.innerHTML = failureMarkup();
        } else {
          resultRegion.innerHTML = '';
        }
      }

      function finishQuery() {
        timer = 0;
        setBusy(false);
        if (!navigator.onLine) {
          renderStatus('failure');
          return;
        }
        renderStatus(ORDER_NUMBER_PATTERN.test(state.orderNo) ? 'success' : 'not-found');
      }

      function queryOrder(isRetry) {
        var orderNo = (isRetry ? state.orderNo : input.value).trim();
        if (!orderNo) {
          showValidation();
          return;
        }
        clearValidation();
        state.orderNo = orderNo;
        state.retryCount = isRetry ? state.retryCount + 1 : 0;
        input.value = orderNo;
        setBusy(true);
        renderStatus('loading');
        window.clearTimeout(timer);
        timer = window.setTimeout(finishQuery, QUERY_DELAY);
      }

      root.querySelector('[data-dom-id="order-query-back"]').addEventListener('click', function () {
        ctx.back();
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        queryOrder(false);
      });

      input.addEventListener('input', function () {
        clearValidation();
        state.orderNo = input.value;
        state.retryCount = 0;
        renderStatus('idle');
        updateClearButton();
      });

      clearButton.addEventListener('click', function () {
        input.value = '';
        state.orderNo = '';
        state.retryCount = 0;
        clearValidation();
        renderStatus('idle');
        updateClearButton();
        input.focus();
      });

      resultRegion.addEventListener('click', function (event) {
        var retry = event.target.closest('[data-action="retry"]');
        if (!retry) return;
        event.preventDefault();
        queryOrder(true);
      });

      updateClearButton();
      ctx.onDestroy(function () {
        window.clearTimeout(timer);
        state.orderNo = '';
        state.status = 'idle';
        state.retryCount = 0;
        input.value = '';
        renderStatus('idle');
      });
    }
  });
})();
