#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

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
const prompt = contract.prompt_contract;
if (!contract.surface_id || !contract.route_id || !contract.page_pattern || !prompt || typeof prompt !== 'object' || Array.isArray(prompt)) {
  fail('wego-design-contract 必须包含 surface_id、route_id、page_pattern 和对象形式的 prompt_contract');
}
for (const field of ['token_whitelist', 'token_bindings', 'component_bindings', 'interaction_contract', 'state_contract', 'hard_rules']) {
  if (!Array.isArray(prompt[field])) fail(`prompt_contract.${field} 必须是数组`);
}
if (!prompt.design_system_snapshot || !Number.isInteger(prompt.design_system_snapshot.version) || prompt.design_system_snapshot.version < 1) {
  fail('prompt_contract.design_system_snapshot.version 必须是正整数');
}
if (!prompt.layout_contract || !Array.isArray(prompt.layout_contract.rules) || !prompt.layout_contract.rules.length || !Array.isArray(prompt.layout_contract.mutable_regions)) {
  fail('prompt_contract.layout_contract 必须包含非空 rules 数组和 mutable_regions 数组');
}

const tags = [...js.matchAll(/<[A-Za-z][^<>]*>/g)].map(item => item[0]);
const attribute = (tag, name) => tag.match(new RegExp(`${name}=["']([^"']+)["']`))?.[1] || null;
const rootTag = tags.find(tag => attribute(tag, 'data-surface-id') || attribute(tag, 'data-route-id') || attribute(tag, 'data-page-pattern'));
if (!rootTag || attribute(rootTag, 'data-surface-id') !== contract.surface_id || attribute(rootTag, 'data-route-id') !== contract.route_id || attribute(rootTag, 'data-page-pattern') !== contract.page_pattern) {
  fail('template 根节点的 data-surface-id、data-route-id、data-page-pattern 必须与 wego-design-contract 一致');
}
const componentNodes = tags
  .map(tag => ({
    dd_id: attribute(tag, 'data-dd-id'),
    component_slug: attribute(tag, 'data-component-slug'),
    rule_source: attribute(tag, 'data-rule-source'),
    token_binding: attribute(tag, 'data-token-binding'),
    class_name: attribute(tag, 'class')
  }))
  .filter(node => node.dd_id || node.component_slug || node.rule_source);
for (const node of componentNodes) {
  if (!node.dd_id || !node.component_slug || !node.rule_source) fail('每个正式组件实例必须同时包含 data-dd-id、data-component-slug、data-rule-source');
}
const domIds = tags.map(tag => attribute(tag, 'data-dom-id')).filter(Boolean);
const result = {
  schemaVersion: 1,
  scene: path.basename(sceneRoot),
  surface_id: contract.surface_id,
  route_id: contract.route_id,
  page_pattern: contract.page_pattern,
  presentation: contract.presentation || null,
  prompt_contract: prompt,
  decisions: componentNodes,
  generation_evidence: {
    scene_js: path.relative(root, sceneJs).replaceAll(path.sep, '/'),
    scene_css: path.relative(root, sceneCss).replaceAll(path.sep, '/'),
    source_sha256: createHash('sha256').update(js).update('\u0000').update(css).digest('hex'),
    dom_ids: domIds,
    component_count: componentNodes.length,
    visualCheck: contract.visual_check || null,
    crowdingCheck: contract.crowding_check || null
  },
  state_contract: prompt.state_contract || [],
  interaction_contract: prompt.interaction_contract || []
};
const serialized = `${JSON.stringify(result, null, 2)}\n`;
if (checkOnly) {
  if (!fs.existsSync(output)) fail(`缺少已提取的设计决策文件：${path.relative(root, output).replaceAll(path.sep, '/')}`);
  if (fs.readFileSync(output, 'utf8') !== serialized) fail('design-decisions.json 已过期；请在场景源码修改后重新运行提取脚本');
} else fs.writeFileSync(output, serialized);
console.log(JSON.stringify({ ok: true, output: path.relative(root, output).replaceAll(path.sep, '/'), decisions: result.decisions.length, cssBytes: css.length }));
