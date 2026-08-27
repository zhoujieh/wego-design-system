#!/usr/bin/env node

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
import { parseRegisteredSceneSource } from './scene-source-parser.mjs';

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const validateAll = args.includes('--all');
const positional = args.filter(arg => !arg.startsWith('--'));
if ((!validateAll && positional.length !== 1) || (validateAll && positional.length > 0)) {
  console.error('用法：node scripts/validate-scene-runtime.mjs wego-app/scenes/{分类}/{中文业务场景} [--json]，或使用 --all');
  process.exit(2);
}

const root = process.cwd();
const appRoot = path.join(root, 'wego-app');
const scenesRoot = path.join(appRoot, 'scenes');
const componentRoot = path.join(root, '.codex/skills/wego-design/components');
const errors = [];
const warnings = [];
const metrics = { scenes: 0, viewports: [375, 393], component_checks: 0, layout_regions: 0, overlay_checks: 0 };
const addError = (code, message, file = null, scene = null, viewport = null) => {
  errors.push({ code, message, ...(file ? { file } : {}), ...(scene ? { scene } : {}), ...(viewport ? { viewport } : {}) });
};

function loadComponentRules() {
  const indexFile = path.join(componentRoot, 'index.json');
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  if (!Array.isArray(index.components)) throw new Error('components/index.json 缺少 components');
  return index.components.map(item => {
    const contractFile = path.join(componentRoot, `${item.slug}.json`);
    const contract = JSON.parse(fs.readFileSync(contractFile, 'utf8'));
    const anatomy = contract.domAnatomy || {};
    const bodySelector = Array.isArray(contract.anatomy)
      ? contract.anatomy.find(part => part.name === 'body')?.selector || null
      : null;
    return {
      slug: item.slug,
      roots: String(anatomy.root || '').split('|').map(value => value.trim()).filter(Boolean),
      requiredChildren: anatomy.requiredChildren || [],
      bodyChildren: anatomy.bodyChildren || [],
      bodySelector,
      repeatingChild: anatomy.repeatingChild || null,
      itemChildren: anatomy.itemChildren || [],
      alternatives: anatomy.alternatives || [],
      variantRules: anatomy.variantRules || {}
    };
  });
}

let componentRules = [];
try {
  componentRules = loadComponentRules();
} catch (error) {
  addError('runtime.component_authority', `无法加载组件索引或契约：${error.message}`, componentRoot);
}

function discoverScenes() {
  if (!validateAll) return [path.resolve(root, positional[0])];
  if (!fs.existsSync(scenesRoot)) return [];
  const directories = [];
  for (const category of fs.readdirSync(scenesRoot, { withFileTypes: true })) {
    if (!category.isDirectory() || category.name.startsWith('_')) continue;
    const categoryRoot = path.join(scenesRoot, category.name);
    for (const entry of fs.readdirSync(categoryRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
      const directory = path.join(categoryRoot, entry.name);
      if (fs.existsSync(path.join(directory, 'scene.js'))) directories.push(directory);
    }
  }
  return directories;
}

function contentType(file) {
  const extension = path.extname(file).toLowerCase();
  return {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
  }[extension] || 'application/octet-stream';
}

function createServer() {
  return http.createServer((request, response) => {
    let pathname = '/';
    try {
      pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    } catch {
      response.writeHead(400).end('Bad Request');
      return;
    }
    const relative = pathname.replace(/^\/+/, '') || 'index.html';
    let target = path.resolve(appRoot, relative);
    if (target !== appRoot && !target.startsWith(`${appRoot}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      response.writeHead(404).end('Not Found');
      return;
    }
    response.writeHead(200, {
      'content-type': contentType(target),
      'cache-control': 'no-store'
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    fs.createReadStream(target).pipe(response);
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve(server.address().port);
    });
  });
}

function closeServer(server) {
  return new Promise(resolve => {
    if (!server.listening) {
      resolve();
      return;
    }
    server.close(() => resolve());
    server.closeAllConnections?.();
  });
}

async function inspectSurface(page, routeId) {
  return page.evaluate(expectedRouteId => {
    const rootNode = document.querySelector(`[data-surface-id][data-route-id="${expectedRouteId}"]`);
    if (!rootNode) return { missing: true };
    const viewportWidth = document.documentElement.clientWidth;
    const documentWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth || 0
    );
    const rootRect = rootNode.getBoundingClientRect();
    const nodes = [rootNode, ...rootNode.querySelectorAll('[data-dom-id]')]
      .filter(node => node.hasAttribute('data-dom-id'));
    const ids = nodes.map(node => node.getAttribute('data-dom-id')).filter(Boolean);
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    const withoutListener = nodes
      .filter(node => !node.getAttribute('data-runtime-listeners'))
      .map(node => node.getAttribute('data-dom-id'))
      .filter(Boolean);
    return {
      missing: false,
      documentWidth,
      viewportWidth,
      rootWidth: rootNode.scrollWidth,
      rootClientWidth: rootNode.clientWidth,
      rootLeft: rootRect.left,
      rootRight: rootRect.right,
      duplicates,
      withoutListener,
      domIds: ids
    };
  }, routeId);
}

async function inspectComponents(page, scopeKind, routeId) {
  return page.evaluate(({ rules, kind, expectedRouteId }) => {
    const scope = kind === 'overlay'
      ? document.querySelector('[data-overlay-layer]:not([hidden])')?.firstElementChild
      : document.querySelector(`[data-surface-id][data-route-id="${expectedRouteId}"]`);
    if (!scope) return { missing: true, checked: 0, errors: [] };

    const failures = [];
    const bySlug = new Map(rules.map(rule => [rule.slug, rule]));
    const allNodes = [scope, ...scope.querySelectorAll('*')];
    const safeMatches = (node, selector) => {
      try { return node.matches(selector); } catch { return false; }
    };
    const exists = (node, selector) => safeMatches(node, selector) || (() => {
      try { return Boolean(node.querySelector(selector)); } catch { return false; }
    })();
    const descendantsMatch = (node, selector) => {
      try { return Boolean(node.querySelector(selector)); } catch { return false; }
    };
    const label = (node, slug = null) => {
      const domId = node.getAttribute('data-dom-id');
      const classes = [...node.classList].slice(0, 3).map(value => `.${value}`).join('');
      return domId ? `${slug || 'component'}[${domId}]` : `${slug || node.tagName.toLowerCase()}${classes}`;
    };
    const selectorList = value => Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
    const constraintsMatch = (node, constraints) => {
      const rootAll = selectorList(constraints?.rootAllOf);
      const rootOne = selectorList(constraints?.rootOneOf);
      const rootNone = selectorList(constraints?.rootNoneOf);
      const descendantAll = selectorList(constraints?.descendantAllOf);
      const descendantOne = selectorList(constraints?.descendantOneOf);
      const descendantNone = selectorList(constraints?.descendantNoneOf);
      return rootAll.every(selector => safeMatches(node, selector))
        && (!rootOne.length || rootOne.some(selector => safeMatches(node, selector)))
        && rootNone.every(selector => !safeMatches(node, selector))
        && descendantAll.every(selector => descendantsMatch(node, selector))
        && (!descendantOne.length || descendantOne.some(selector => descendantsMatch(node, selector)))
        && descendantNone.every(selector => !descendantsMatch(node, selector));
    };

    const missingAnnotations = new Set();
    for (const rule of rules) {
      for (const node of allNodes) {
        if (!rule.roots.some(selector => safeMatches(node, selector))) continue;
        if (node.hasAttribute('data-component-slug')) continue;
        missingAnnotations.add(`${label(node, rule.slug)} 命中正式组件根但缺少 data-component-slug`);
      }
    }
    failures.push(...missingAnnotations);

    const instances = allNodes.filter(node => node.hasAttribute('data-component-slug'));
    for (const node of instances) {
      const slug = String(node.getAttribute('data-component-slug') || '').trim();
      if (!slug) {
        failures.push(`${label(node)} 的 data-component-slug 不能为空`);
        continue;
      }
      const rule = bySlug.get(slug);
      if (!rule) {
        failures.push(`${label(node, slug)} 使用未注册组件 slug`);
        continue;
      }
      if (!rule.roots.length || !rule.roots.some(selector => safeMatches(node, selector))) {
        failures.push(`${label(node, slug)} 未命中组件根 ${rule.roots.join(' | ') || '未声明'}`);
        continue;
      }
      const missingRequired = rule.requiredChildren.filter(selector => !exists(node, selector));
      if (missingRequired.length) failures.push(`${label(node, slug)} 缺少 requiredChildren：${missingRequired.join('、')}`);

      if (rule.bodyChildren.length) {
        const bodies = rule.bodySelector
          ? allNodes.filter(candidate => candidate !== scope && node.contains(candidate) && safeMatches(candidate, rule.bodySelector))
          : [node];
        if (!bodies.length) failures.push(`${label(node, slug)} 缺少 body：${rule.bodySelector}`);
        for (const body of bodies) {
          const missing = rule.bodyChildren.filter(selector => !exists(body, selector));
          if (missing.length) failures.push(`${label(node, slug)} 的 body 缺少：${missing.join('、')}`);
        }
      }

      if (rule.itemChildren.length) {
        let items = [];
        try { items = rule.repeatingChild ? [...node.querySelectorAll(rule.repeatingChild)] : []; } catch { items = []; }
        if (!items.length) failures.push(`${label(node, slug)} 缺少 repeatingChild：${rule.repeatingChild || '未声明'}`);
        for (const item of items) {
          const missing = rule.itemChildren.filter(selector => !exists(item, selector));
          if (missing.length) failures.push(`${label(node, slug)} 的 repeatingChild 缺少：${missing.join('、')}`);
        }
      }

      for (const alternative of rule.alternatives) {
        const missingAll = selectorList(alternative?.allOf).filter(selector => !exists(node, selector));
        if (missingAll.length) failures.push(`${label(node, slug)} 缺少 alternatives.allOf：${missingAll.join('、')}`);
        const branches = Array.isArray(alternative?.oneOf) ? alternative.oneOf : [];
        const branchComplete = branch => {
          const selectors = Array.isArray(branch) ? branch : selectorList(branch?.allOf);
          return selectors.length > 0 && selectors.every(selector => exists(node, selector));
        };
        if (branches.length && !branches.some(branchComplete)) failures.push(`${label(node, slug)} 未命中 alternatives.oneOf 的完整结构`);
      }

      for (const [dimension, variantRule] of Object.entries(rule.variantRules || {})) {
        const matches = Object.entries(variantRule?.values || {})
          .filter(([, constraints]) => constraintsMatch(node, constraints))
          .map(([value]) => value);
        if (variantRule?.required === true && matches.length !== 1) {
          failures.push(`${label(node, slug)} 无法唯一推导必需变体 ${dimension}（命中：${matches.join('、') || '无'}）`);
        } else if (variantRule?.exclusive === true && matches.length > 1) {
          failures.push(`${label(node, slug)} 同时命中互斥变体 ${dimension}：${matches.join('、')}`);
        }
      }
    }
    return { missing: false, checked: instances.length, errors: [...new Set(failures)] };
  }, { rules: componentRules, kind: scopeKind, expectedRouteId: routeId });
}

async function inspectLayout(page, routeId) {
  return page.evaluate(async expectedRouteId => {
    const rootNode = document.querySelector(`[data-surface-id][data-route-id="${expectedRouteId}"]`);
    if (!rootNode) return { missing: true, checked: 0, errors: [] };
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const rootRect = rootNode.getBoundingClientRect();
    const allNodes = [...rootNode.querySelectorAll('*')];
    const visible = node => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity) > 0
        && rect.width > 0
        && rect.height > 0
        && rect.bottom > rootRect.top
        && rect.top < rootRect.bottom;
    };
    const alpha = color => {
      const value = String(color);
      if (value === 'transparent') return 0;
      const numbers = value.match(/[\d.]+/g)?.map(Number) || [];
      if (value.startsWith('rgba(') && numbers.length >= 4) return numbers[3];
      if (value.includes('/') && numbers.length) return numbers.at(-1);
      return 1;
    };
    const opaqueBackground = node => {
      const style = getComputedStyle(node);
      return alpha(style.backgroundColor) >= 0.98 || style.backgroundImage !== 'none';
    };
    const label = node => {
      const domId = node.getAttribute('data-dom-id');
      const slug = node.getAttribute('data-component-slug');
      const classes = [...node.classList].slice(0, 3).map(value => `.${value}`).join('');
      return domId ? `[data-dom-id="${domId}"]` : slug ? `${slug}${classes}` : `${node.tagName.toLowerCase()}${classes}`;
    };
    const scrollRoots = allNodes.filter(node => {
      const overflow = getComputedStyle(node).overflowY;
      return visible(node) && /^(?:auto|scroll)$/.test(overflow) && node.clientHeight > 0;
    });
    const regions = allNodes.filter(node => {
      if (!visible(node)) return false;
      const style = getComputedStyle(node);
      if (style.position === 'sticky' || style.position === 'fixed') return true;
      if (node.getAttribute('data-component-slug') === 'badge') return false;
      return style.position === 'absolute'
        && style.bottom !== 'auto'
        && (node.parentElement === rootNode || node.hasAttribute('data-component-slug'));
    });
    const failures = [];
    for (const region of regions) {
      const style = getComputedStyle(region);
      // 声明式豁免:轻量辅助控件（字母索引、滚动指示器等，data-surface-role="auxiliary"）
      // 或明确要求彻底透明背景的悬浮控件（data-surface-transparent）跳过不透明度检查。
      // 守卫不强制要求这两类控件有不透明底，避免与"不要背景"的业务需求冲突。
      const allowTransparent = region.hasAttribute('data-surface-transparent')
        || region.getAttribute('data-surface-role') === 'auxiliary';
      if (!allowTransparent && !opaqueBackground(region)) failures.push(`${label(region)} 的 ${style.position} surface 背景不透明度不足`);
      const isBottom = style.bottom !== 'auto' && (style.position === 'fixed' || style.position === 'absolute' || style.position === 'sticky');
      if (!isBottom) continue;
      const regionRect = region.getBoundingClientRect();
      if (regionRect.bottom < rootRect.bottom - 96) continue;
      const scrollRoot = scrollRoots.find(candidate => {
        if (candidate.contains(region)) return false;
        const rect = candidate.getBoundingClientRect();
        return Math.min(rect.right, regionRect.right) > Math.max(rect.left, regionRect.left);
      });
      if (!scrollRoot) {
        failures.push(`${label(region)} 位于底部但未找到承担避让的主滚动区`);
        continue;
      }
      const scrollStyle = getComputedStyle(scrollRoot);
      const measuredClearance = parseFloat(scrollStyle.getPropertyValue('--scroll-layout-bottom-clearance')) || 0;
      const paddingBottom = parseFloat(scrollStyle.paddingBottom) || 0;
      const required = Math.ceil(regionRect.height);
      if (measuredClearance + 1 < required || paddingBottom + 1 < required) {
        failures.push(`${label(region)} 底部遮挡未被主滚动区实测避让（需要 ${required}px，clearance ${Math.round(measuredClearance)}px，padding ${Math.round(paddingBottom)}px）`);
      }
    }
    return { missing: false, checked: regions.length, errors: [...new Set(failures)] };
  }, routeId);
}

async function inspectOverlay(page) {
  return page.evaluate(() => {
    const host = document.querySelector('[data-overlay-layer]:not([hidden])');
    const overlay = host?.firstElementChild || null;
    if (!overlay) return { open: false };
    const nodes = [overlay, ...overlay.querySelectorAll('[data-dom-id]')]
      .filter(node => node.hasAttribute('data-dom-id'));
    const ids = nodes.map(node => node.getAttribute('data-dom-id')).filter(Boolean);
    return {
      open: true,
      overflow: overlay.scrollWidth > overlay.clientWidth + 1,
      duplicates: [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))],
      withoutListener: nodes
        .filter(node => !node.getAttribute('data-runtime-listeners'))
        .map(node => node.getAttribute('data-dom-id'))
        .filter(Boolean),
      closeIds: ids.filter(id => /(?:close|cancel|dismiss|back|sheet)/i.test(id))
    };
  });
}

async function exerciseOverlay(page, routeId, sceneName, sceneFile, viewport) {
  const ids = await page.evaluate(expectedRouteId => {
    const rootNode = document.querySelector(`[data-surface-id][data-route-id="${expectedRouteId}"]`);
    if (!rootNode) return [];
    return [...rootNode.querySelectorAll('[data-dom-id]')]
      .filter(node => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      })
      .map(node => node.getAttribute('data-dom-id'))
      .filter(Boolean)
      .sort((left, right) => {
        const score = value => /(?:open|comment|sheet|modal|select|picker)/i.test(value) ? 0 : 1;
        return score(left) - score(right);
      });
  }, routeId);

  for (const id of ids) {
    const trigger = page.locator(`[data-surface-id][data-route-id="${routeId}"] [data-dom-id="${id}"]`).first();
    try {
      await trigger.scrollIntoViewIfNeeded({ timeout: 800 });
      await trigger.click({ timeout: 800 });
      await page.waitForTimeout(120);
    } catch {
      continue;
    }
    const overlay = await inspectOverlay(page);
    if (!overlay.open) continue;
    metrics.overlay_checks += 1;
    if (overlay.overflow) addError('runtime.overlay_overflow', 'overlay 出现横向溢出', sceneFile, sceneName, viewport);
    if (overlay.duplicates.length) addError('runtime.dom_id_duplicate', `overlay 的 data-dom-id 重复：${overlay.duplicates.join('、')}`, sceneFile, sceneName, viewport);
    if (overlay.withoutListener.length) addError('runtime.interaction_handler', `overlay 交互节点未绑定事件：${overlay.withoutListener.join('、')}`, sceneFile, sceneName, viewport);
    const overlayComponents = await inspectComponents(page, 'overlay', routeId);
    metrics.component_checks += overlayComponents.checked;
    if (overlayComponents.missing) addError('runtime.overlay_component_scope', '无法读取已打开 overlay 的组件树', sceneFile, sceneName, viewport);
    for (const failure of overlayComponents.errors) addError('runtime.component_dom', failure, sceneFile, sceneName, viewport);

    let closed = false;
    for (const closeId of overlay.closeIds) {
      try {
        await page.locator(`[data-overlay-layer] [data-dom-id="${closeId}"]`).first().click({ timeout: 800 });
        await page.waitForFunction(() => {
          const host = document.querySelector('[data-overlay-layer]');
          return !host || host.hidden || !host.firstElementChild;
        }, null, { timeout: 1500 });
        closed = true;
        break;
      } catch {
        // 继续尝试其它显式关闭入口。
      }
    }
    if (!closed) addError('runtime.overlay_close', 'overlay 已打开，但未能通过显式关闭入口关闭', sceneFile, sceneName, viewport);
    return true;
  }
  return false;
}

async function validateViewport(browser, baseUrl, scene) {
  for (const viewport of metrics.viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport, height: viewport === 375 ? 812 : 852 },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
    });
    const page = await context.newPage();
    const browserProblems = [];
    await page.addInitScript(() => {
      const original = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function trackedAddEventListener(type, listener, options) {
        if (this instanceof Element && this.hasAttribute('data-dom-id')) {
          const current = new Set((this.getAttribute('data-runtime-listeners') || '').split(',').filter(Boolean));
          current.add(String(type));
          this.setAttribute('data-runtime-listeners', [...current].join(','));
        }
        return original.call(this, type, listener, options);
      };
    });
    page.on('console', message => {
      if (message.type() === 'error' || (message.type() === 'warning' && /\berror\b/i.test(message.text()))) {
        browserProblems.push(`console.${message.type()}: ${message.text()}`);
      }
    });
    page.on('pageerror', error => browserProblems.push(`pageerror: ${error.message}`));
    page.on('requestfailed', request => browserProblems.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`.trim()));
    page.on('response', response => {
      if (response.status() >= 400) browserProblems.push(`response ${response.status()}: ${response.url()}`);
    });

    try {
      await page.goto(`${baseUrl}/index.html#/${scene.routeId}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.locator(`[data-surface-id][data-route-id="${scene.routeId}"]`).waitFor({ state: 'visible', timeout: 8000 });
      await page.waitForTimeout(350);
      const surface = await inspectSurface(page, scene.routeId);
      if (surface.missing) {
        addError('runtime.scene_missing', `未渲染 route ${scene.routeId}`, scene.file, scene.name, viewport);
      } else {
        if (surface.documentWidth > surface.viewportWidth + 1 || surface.rootWidth > surface.rootClientWidth + 1 || surface.rootLeft < -1 || surface.rootRight > surface.viewportWidth + 1) {
          addError('runtime.horizontal_overflow', `视口 ${viewport}px 出现横向溢出（document ${surface.documentWidth}/${surface.viewportWidth}，scene ${surface.rootWidth}/${surface.rootClientWidth}）`, scene.file, scene.name, viewport);
        }
        if (surface.duplicates.length) addError('runtime.dom_id_duplicate', `data-dom-id 重复：${surface.duplicates.join('、')}`, scene.file, scene.name, viewport);
        if (surface.withoutListener.length) addError('runtime.interaction_handler', `data-dom-id 未绑定实际事件：${surface.withoutListener.join('、')}`, scene.file, scene.name, viewport);
      }
      const components = await inspectComponents(page, 'scene', scene.routeId);
      metrics.component_checks += components.checked;
      if (components.missing) addError('runtime.component_scope', '无法读取场景组件树', scene.file, scene.name, viewport);
      for (const failure of components.errors) addError('runtime.component_dom', failure, scene.file, scene.name, viewport);

      const layout = await inspectLayout(page, scene.routeId);
      metrics.layout_regions += layout.checked;
      if (layout.missing) addError('runtime.layout_scope', '无法读取场景布局树', scene.file, scene.name, viewport);
      for (const failure of layout.errors) addError('runtime.layout', failure, scene.file, scene.name, viewport);

      if (viewport === 393 && scene.hasOverlayApi) {
        const exercised = await exerciseOverlay(page, scene.routeId, scene.name, scene.file, viewport);
        if (!exercised) addError('runtime.overlay_not_exercised', '源码使用 overlay API，但本次 smoke 未找到可触发的可见入口', scene.file, scene.name, viewport);
      }
      for (const problem of [...new Set(browserProblems)]) addError('runtime.browser_error', problem, scene.file, scene.name, viewport);
    } catch (error) {
      addError('runtime.load', error.message, scene.file, scene.name, viewport);
    } finally {
      await context.close();
    }
  }
}

const sceneDirectories = discoverScenes();
const scenes = [];
for (const directory of sceneDirectories) {
  const name = path.basename(directory);
  const sceneFile = path.join(directory, 'scene.js');
  const sceneCss = path.join(directory, 'scene.css');
  if (!fs.existsSync(sceneFile) || !fs.existsSync(sceneCss)) {
    addError('runtime.scene_files', '场景必须包含 scene.js 与 scene.css', directory, name);
    continue;
  }
  try {
    const source = fs.readFileSync(sceneFile, 'utf8');
    const registration = parseRegisteredSceneSource(source);
    scenes.push({
      name,
      file: sceneFile,
      routeId: registration.routeId,
      hasOverlayApi: /\bctx\s*\.\s*(?:openSheet|openModal|openFullScreenModal)\s*\(/.test(source)
    });
  } catch (error) {
    addError('runtime.registration', error.message, sceneFile, name);
  }
}
metrics.scenes = scenes.length;

let server = null;
let browser = null;
try {
  if (scenes.length) {
    server = createServer();
    const port = await listen(server);
    browser = await chromium.launch({ headless: true });
    for (const scene of scenes) await validateViewport(browser, `http://127.0.0.1:${port}`, scene);
  }
} catch (error) {
  addError('runtime.infrastructure', error.message);
} finally {
  if (browser) await browser.close();
  if (server) await closeServer(server);
}

const report = { ok: errors.length === 0, errors, warnings, metrics };
if (jsonOutput) console.log(JSON.stringify(report, null, 2));
else {
  if (report.ok) console.log(`场景运行时通过：${scenes.map(scene => scene.name).join('、')}`);
  for (const item of errors) console.error(`[error] ${item.code}: ${item.message}`);
  for (const item of warnings) console.warn(`[warning] ${item.code}: ${item.message}`);
}
process.exit(report.ok ? 0 : 1);
