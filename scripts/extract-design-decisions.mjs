#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { validatePromptContractShape } from './prompt-contract-schema.mjs';
import { parseRegisteredSceneSource, parseSceneTemplate } from './scene-source-parser.mjs';

const [sceneDirectory, ...args] = process.argv.slice(2);
if (!sceneDirectory) {
  console.error('用法：node scripts/extract-design-decisions.mjs wego-app/scenes/{中文业务场景} [--output path] [--check]');
  process.exit(2);
}

const root = process.cwd();
const sceneRoot = path.resolve(root, sceneDirectory);
const sceneJs = path.join(sceneRoot, 'scene.js');
const sceneCss = path.join(sceneRoot, 'scene.css');
const outputFlag = args.indexOf('--output');
if (outputFlag >= 0 && !args[outputFlag + 1]) {
  console.error('--output 必须指定 design-decisions.json 路径');
  process.exit(2);
}
const output = outputFlag >= 0 ? path.resolve(root, args[outputFlag + 1]) : path.join(sceneRoot, 'design-decisions.json');
const checkOnly = args.includes('--check');

function fail(message) { console.error(message); process.exit(1); }
if (!fs.existsSync(sceneJs) || !fs.existsSync(sceneCss)) fail('场景目录必须同时包含 scene.js 与 scene.css');
const js = fs.readFileSync(sceneJs, 'utf8');
const css = fs.readFileSync(sceneCss, 'utf8');
const match = js.match(/\/\*\s*wego-design-contract:\s*([\s\S]*?)\*\//);
if (!match) fail('scene.js 缺少 /* wego-design-contract: {...} */ 合同注释');
let contract;
try { contract = JSON.parse(match[1].trim()); }
catch (error) { fail(`wego-design-contract 不是合法 JSON：${error.message}`); }
const runtimeJs = js.replace(match[0], '');
const allowedContractFields = new Set(['surface_id', 'route_id', 'layout_mode', 'page_pattern', 'presentation', 'prompt_contract', 'visual_check']);
for (const field of Object.keys(contract)) if (!allowedContractFields.has(field)) fail(`wego-design-contract.${field} 不是当前 Schema 字段`);
const prompt = contract.prompt_contract;
if (!contract.surface_id || !contract.route_id || !['pattern', 'composed'].includes(contract.layout_mode) || !prompt || typeof prompt !== 'object' || Array.isArray(prompt)) {
  fail('wego-design-contract 必须包含 surface_id、route_id、layout_mode 和对象形式的 prompt_contract');
}
if (typeof contract.route_id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(contract.route_id)) fail('wego-design-contract.route_id 必须是稳定 kebab-case');
if (contract.layout_mode === 'pattern' && (typeof contract.page_pattern !== 'string' || !contract.page_pattern)) fail('pattern 模式必须声明非空 page_pattern');
if (contract.layout_mode === 'composed' && contract.page_pattern !== null) fail('composed 模式的 page_pattern 必须为 null');
if (!contract.presentation || typeof contract.presentation !== 'object' || Array.isArray(contract.presentation)) fail('wego-design-contract 必须包含对象形式的 presentation');
const promptErrors = validatePromptContractShape(prompt);
if (promptErrors.length) fail(promptErrors.map(item => `${item.path} ${item.message}`).join('\n'));

let registeredScene;
let templateTree;
try {
  registeredScene = parseRegisteredSceneSource(runtimeJs, contract.route_id);
  templateTree = parseSceneTemplate(registeredScene.template);
} catch (error) { fail(error.message); }
const rootNode = templateTree.root;
if (rootNode.attrs['data-surface-id'] !== contract.surface_id || rootNode.attrs['data-route-id'] !== contract.route_id || rootNode.attrs['data-layout-mode'] !== contract.layout_mode) {
  fail('template 根节点的 data-surface-id、data-route-id、data-layout-mode 必须与 wego-design-contract 一致');
}
if (rootNode.attrs['data-page-edge-mode'] !== prompt.layout_contract.page_edge_mode) fail('template 根节点的 data-page-edge-mode 必须与 layout_contract.page_edge_mode 一致');
if (contract.layout_mode === 'pattern' && rootNode.attrs['data-page-pattern'] !== contract.page_pattern) fail('pattern 模式根节点的 data-page-pattern 必须与 wego-design-contract 一致');
if (contract.layout_mode === 'composed' && Object.hasOwn(rootNode.attrs, 'data-page-pattern')) fail('composed 模式根节点不得声明 data-page-pattern');
const componentNodes = templateTree.nodes
  .map(node => ({
    dd_id: node.attrs['data-dd-id'] || null,
    binding_id: node.attrs['data-component-binding'] || null,
    component_slug: node.attrs['data-component-slug'] || null
  }))
  .filter(node => node.dd_id || node.binding_id || node.component_slug);
for (const node of componentNodes) {
  if (!node.dd_id || !node.binding_id || !node.component_slug) fail('每个正式组件实例必须同时包含 data-dd-id、data-component-binding、data-component-slug');
}
const staticDomIds = templateTree.nodes.map(node => node.attrs['data-dom-id']).filter(Boolean);
// 动态列表项 dom_id 提取：扫描 scene.js 源码中 data-dom-id="prefix${...}suffix" 形式的模板拼接，
// 归一化为占位符形式 "prefix-{placeholder}-suffix" 加入 dom_ids，让场景合同守卫可对照 interaction_contract 的占位符声明。
const dynamicDomIdPattern = /data-dom-id\s*=\s*["']([^"'\\]*?)\$\{[^}]+\}([^"']*?)["']/g;
const dynamicDomIds = new Set();
for (const match of js.matchAll(dynamicDomIdPattern)) {
  const prefix = match[1];
  const suffix = match[2];
  dynamicDomIds.add(`${prefix}{placeholder}${suffix}`);
}
const domIds = [...staticDomIds, ...dynamicDomIds];
const result = {
  schemaVersion: 2,
  scene: path.basename(sceneRoot),
  surface_id: contract.surface_id,
  route_id: contract.route_id,
  layout_mode: contract.layout_mode,
  page_pattern: contract.page_pattern,
  presentation: contract.presentation,
  prompt_contract: prompt,
  decisions: componentNodes,
  generation_evidence: {
    scene_js: path.relative(root, sceneJs).replaceAll(path.sep, '/'),
    scene_css: path.relative(root, sceneCss).replaceAll(path.sep, '/'),
    source_sha256: createHash('sha256').update(js).update('\u0000').update(css).digest('hex'),
    dom_ids: domIds,
    component_count: componentNodes.length,
    visualCheck: contract.visual_check || null
  }
};
const serialized = `${JSON.stringify(result, null, 2)}\n`;
if (checkOnly) {
  if (!fs.existsSync(output)) fail(`缺少已提取的设计决策文件：${path.relative(root, output).replaceAll(path.sep, '/')}`);
  if (fs.readFileSync(output, 'utf8') !== serialized) fail('design-decisions.json 已过期；请在场景源码修改后重新运行提取脚本');
} else fs.writeFileSync(output, serialized);
console.log(JSON.stringify({ ok: true, output: path.relative(root, output).replaceAll(path.sep, '/'), decisions: result.decisions.length, cssBytes: css.length }));
