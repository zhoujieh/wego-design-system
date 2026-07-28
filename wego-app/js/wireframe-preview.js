(function initWireframePreview() {
  var params = new URLSearchParams(window.location.search);
  if (params.get('mode') !== 'wireframe' || window.location.hash !== '#demo') return;

  var body = document.body;
  var preview = document.querySelector('[data-wireframe-preview]');
  var host = document.querySelector('[data-host-shell="true"]');
  if (!body || !preview) return;

  body.setAttribute('data-render-mode', 'wireframe');
  if (host) host.setAttribute('data-host-shell', 'false');
  preview.hidden = false;
  document.title = '临时线框测试';

  var frames = Array.from(preview.querySelectorAll('[data-wireframe-frame]'));
  var steps = Array.from(preview.querySelectorAll('.wireframe-preview__step[data-wireframe-target]'));

  function showFrame(frameId) {
    frames.forEach(function (frame) {
      frame.hidden = frame.dataset.wireframeFrame !== frameId;
    });
    steps.forEach(function (step) {
      var active = step.dataset.wireframeTarget === frameId;
      step.classList.toggle('is-active', active);
      step.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  preview.querySelectorAll('[data-wireframe-target]').forEach(function (control) {
    control.addEventListener('click', function () {
      showFrame(control.dataset.wireframeTarget);
    });
  });
})();
