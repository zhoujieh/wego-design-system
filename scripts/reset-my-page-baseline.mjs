/**
 * 重置「我的」Tab 页面为完全空白基线
 *
 * 保留：仅 scene 根节点
 * 清空：NavBar、滚动容器、FAB 栈、所有内容和交互
 * 更新：scene.css 仅保留根节点样式
 * 更新：contract 反映完全空白基线
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCENE_DIR = resolve(__dirname, '..', 'wego-app', 'scenes', '我的');

// ─── 读取 design_system_version ───
// 从已有 contract 中提取版本号
function extractDSVersion(js) {
  const m = js.match(/"design_system_version"\s*:\s*(\d+)/);
  return m ? parseInt(m[1], 10) : 476;
}

// ─── 写入 scene.css ───
const CSS_CONTENT = `/* ── 「我的」Tab 完全空白基线 ── */

.my-page {
  position: absolute;
  inset: 0;
  background: var(--bg-page);
}
`;

// ─── 构建完全空白 JS 模板 ───
function buildBlankJS(dsv) {
  return `/* wego-design-contract:
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
    "design_system_version": ${dsv},
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
`;
}

// ─── 主流程 ───
function main() {
  const jsPath = resolve(SCENE_DIR, 'scene.js');
  const cssPath = resolve(SCENE_DIR, 'scene.css');

  // 读取现有 JS 以获取 design_system_version
  const oldJS = readFileSync(jsPath, 'utf-8');
  const dsv = extractDSVersion(oldJS);

  // 写入空白 CSS
  writeFileSync(cssPath, CSS_CONTENT, 'utf-8');
  console.log('[ok] scene.css 已重置为空白基线');

  // 写入空白 JS
  writeFileSync(jsPath, buildBlankJS(dsv), 'utf-8');
  console.log('[ok] scene.js 已重置为空白基线');

  console.log('');
  console.log('「我的」Tab 已重置为完全空白基线。');
  console.log('保留：仅 scene 根节点 <section>');
  console.log('清空：NavBar、滚动容器、FAB 栈、所有内容、交互、contract seed');
  console.log('Contract 已更新为完全空白基线');
}

main();
