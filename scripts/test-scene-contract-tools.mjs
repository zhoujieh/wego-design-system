#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const validator = path.join(root, 'scripts/validate-scene-contract.mjs');

function run(scene, routes = null) {
  const args = [validator, scene, '--json'];
  if (routes) args.push('--routes', routes);
  return spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' });
}

function report(result, label) {
  assert.ok(result.stdout.trim(), `${label} 未输出 JSON：${result.stderr}`);
  try {
    return JSON.parse(result.stdout);
  } catch {
    assert.fail(`${label} 输出无法解析：${result.stdout}\n${result.stderr}`);
  }
}

function expectPass(result, label) {
  const value = report(result, label);
  assert.equal(result.status, 0, `${label} 应通过：${JSON.stringify(value.errors)}`);
  assert.equal(value.ok, true, `${label} 应返回 ok=true`);
  assert.deepEqual(value.warnings, [], `${label} 不应产生低价值 warning`);
}

function expectFailureCode(result, code, label) {
  const value = report(result, label);
  assert.notEqual(result.status, 0, `${label} 应失败`);
  assert.equal(value.ok, false, `${label} 应返回 ok=false`);
  assert.ok(value.errors.some(error => error.code === code), `${label} 应包含 ${code}：${JSON.stringify(value.errors)}`);
}

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-scene-static-guard-'));
const sceneName = '静态守卫夹具';
const sceneRoot = path.join(fixtureRoot, 'infras', sceneName);
const sceneJs = path.join(sceneRoot, 'scene.js');
const sceneCss = path.join(sceneRoot, 'scene.css');
const routesFile = path.join(fixtureRoot, 'routes.js');

const validJs = `
window.WegoApp.registerScene({
  routeId: 'guard-fixture',
  presentation: {
    type: 'push',
    transition: 'slide-left-enter, slide-right-exit',
    dismissAction: 'navigation-back',
    overlayLevel: 'scene',
    coversTabBar: true
  },
  template: \`
    <div class="guard-fixture" data-surface-id="guard-fixture" data-route-id="guard-fixture" data-layout-mode="composed">
      <main class="guard-fixture__scroll">
        <button type="button" class="btn btn--weak btn--md" data-component-slug="button" data-dom-id="confirm">确认</button>
      </main>
    </div>
  \`,
  init(ctx) {
    ctx.root.querySelector('[data-dom-id="confirm"]').addEventListener('click', () => {
      ctx.toast('已确认');
    });
  }
});
`;

const validCss = `
.guard-fixture {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-page);
}

.guard-fixture__scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: var(--safe-area-bottom-content);
}
`;

const validRoutes = `
window.WEGO_APP_ROUTES = [
  {
    routeId: 'guard-fixture',
    scene: '${sceneName}',
    script: 'scenes/infras/${sceneName}/scene.js',
    style: 'scenes/infras/${sceneName}/scene.css'
  }
];
`;

function writeFixture({ js = validJs, css = validCss, routes = validRoutes } = {}) {
  fs.mkdirSync(sceneRoot, { recursive: true });
  fs.writeFileSync(sceneJs, js);
  fs.writeFileSync(sceneCss, css);
  fs.writeFileSync(routesFile, routes);
}

try {
  writeFixture();
  expectPass(run(sceneRoot, routesFile), '最小源码夹具');
  assert.deepEqual(fs.readdirSync(sceneRoot).sort(), ['scene.css', 'scene.js'], '通过不应依赖额外人工产物');

  writeFixture({ js: validJs.replace('data-component-slug="button"', 'data-component-slug="missing-component"') });
  expectFailureCode(run(sceneRoot, routesFile), 'scene.component_unknown', '不存在的组件');

  writeFixture({ css: validCss.replace('background: var(--bg-page)', 'background: #fff') });
  expectFailureCode(run(sceneRoot, routesFile), 'scene.raw_color', '硬编码颜色');

  writeFixture({ routes: validRoutes.replace("routeId: 'guard-fixture'", "routeId: 'wrong-route'") });
  expectFailureCode(run(sceneRoot, routesFile), 'scene.route', '错误路由');

  for (const scene of ['微购相册动态', '微购相册我的']) {
    const realScene = path.join(root, 'wego-app/scenes', scene);
    if (!fs.existsSync(path.join(realScene, 'scene.js'))) continue;
    expectPass(run(realScene), `真实场景 ${scene}`);
  }
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log('场景静态守卫高价值回归通过。');
