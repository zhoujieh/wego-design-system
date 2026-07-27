/* wego-design-contract:
{
  "surface_id": "my-page",
  "route_id": "my-page",
  "layout_mode": "composed",
  "page_pattern": null,
  "presentation": {
    "type": "host-tab",
    "transition": "none",
    "dismissAction": "tab-switch",
    "overlayLevel": "inline",
    "coversTabBar": false,
    "source": "library-consumption.json#/appRuntime/presentationTypes"
  },
  "prompt_contract": {
    "design_system_version": 476,
    "token_bindings": [
      {
        "selector": ".my-page",
        "content_role": "场景根背景色",
        "css_property": "background",
        "token": "var(--bg-page)"
      }
    ],
    "component_bindings": [],
    "layout_contract": {
      "mode": "composed",
      "source": "../../.codex/skills/shared/references/design-decisions.md",
      "selection_reason": "空白基线，待开发",
      "page_edge_mode": "M0",
      "mutable_regions": []
    },
    "interaction_contract": [],
    "state_contract": []
  },
  "visual_check": {
    "status": "pending",
    "viewports": [375, 393],
    "checked_at": null,
    "checks": {}
  }
}
*/
(function () {
  'use strict';

  window.WegoApp.registerScene({
    routeId: 'my-page',
    template: '<section class="my-page" data-surface-id="my-page" data-route-id="my-page" data-layout-mode="composed" data-page-edge-mode="M0" data-bg="page" data-route-bound="true"></section>',
    presentation: {
      type: 'host-tab',
      transition: 'none',
      dismissAction: 'tab-switch',
      overlayLevel: 'inline',
      coversTabBar: false
    },
    init: function () {}
  });
})();
