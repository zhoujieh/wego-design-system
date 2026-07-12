#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateSkillEntryBoundary } from './validate-skill-entry-boundary.mjs';

const VERSION = '8';
const ROOT = path.resolve(process.env.WEGO_REPO_ROOT || process.cwd());
const OUT = path.join(ROOT, '.codex/skills/wego-design/specs');
const CMD = process.argv[2];
const JSON_OUT = process.argv.includes('--json');
const NOTICE = '本文档由系统规则自动生成，用于人工检查。请勿直接修改；如需调整规则，应修改对应权威来源后重新生成。';
const FILES = [
  '工作流总览与优先级.md',
  '需求理解规则.md',
  '页面设计规则.md',
  '组件与UI-Kit使用规则.md',
  '原型实现规则.md',
  '验收与回归规则.md',
  '工作流迭代与经验沉淀规则.md',
];
const SKILL_DIRS = [
  '.codex/skills/wego-product',
  '.codex/skills/wego-design',
  '.codex/skills/wego-ux',
  '.codex/skills/wego-tests',
  '.codex/skills/wego-uxsystem-iterate',
];
const SCENES_ROOT = 'wego-app/scenes';

const text = rel => {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`缺少规则来源：${rel}`);
  return fs.readFileSync(file, 'utf8');
};
const json = rel => {
  try { return JSON.parse(text(rel)); }
  catch (error) { throw new Error(`${rel} JSON 解析失败：${error.message}`); }
};
const maybeJson = rel => {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { return { __parseError: error.message }; }
};
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const readMaybe = rel => exists(rel) ? fs.readFileSync(path.join(ROOT, rel), 'utf8') : '';
const blobSha = value => {
  const body = Buffer.from(value);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${body.length}\0`)).update(body).digest('hex');
};

function sources() {
  const index = json('.codex/skills/wego-design/components/index.json');
  const components = (index.components || []).map(({ slug }) => `.codex/skills/wego-design/components/${slug}.json`);
  return [
    'AGENTS.md',
    'README.md',
    '.codex/skills/README.md',
    '.codex/skills/wego-product/SKILL.md',
    '.codex/skills/wego-product/references/iteration-workflow.md',
    '.codex/skills/wego-product/references/interaction-spec.md',
    '.codex/skills/wego-product/references/readiness-and-boundaries.md',
    '.codex/skills/wego-design/SKILL.md',
    '.codex/skills/wego-design/references/library-map.md',
    '.codex/skills/wego-design/references/design-plan.md',
    '.codex/skills/wego-design/references/design-decisions.md',
    '.codex/skills/wego-design/library-consumption.json',
    '.codex/skills/wego-design/uikit-plan.json',
    '.codex/skills/wego-design/components/index.json',
    ...components,
    '.codex/skills/wego-ux/SKILL.md',
    '.codex/skills/wego-ux/references/scene-runtime.md',
    '.codex/skills/wego-ux/references/interaction-implementation.md',
    '.codex/skills/wego-ux/references/delivery.md',
    '.codex/skills/wego-tests/SKILL.md',
    '.codex/skills/wego-tests/references/acceptance-report.md',
    '.codex/skills/wego-tests/references/acceptance-checks.md',
    '.codex/skills/wego-tests/references/browser-verification.md',
    '.codex/skills/wego-uxsystem-iterate/SKILL.md',
    '.codex/skills/wego-uxsystem-iterate/references/workflow.md',
    '.codex/skills/wego-uxsystem-iterate/references/button-example.md',
    '.codex/skills/wego-uxsystem-iterate/references/case-usagehint-size-as-state.md',
    '.codex/skills/wego-uxsystem-iterate/references/judgment-principles.md',
    '.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md',
    '.codex/skills/wego-uxsystem-iterate/references/sync-matrix.md',
    '.codex/skills/wego-uxsystem-iterate/references/sync-matrix.runtime.md',
    '.codex/skills/wego-uxsystem-iterate/references/experience-candidates.md',
    '.codex/skills/wego-uxsystem-iterate/references/skill-package-structure.md',
    'scripts/validate-wego-design.mjs',
    'scripts/validate-wego-design-core.mjs',
    'scripts/iteration-record.mjs',
  ].sort();
}

function manifestFingerprint(manifest) {
  return crypto.createHash('sha256').update([`generator:${VERSION}`, ...manifest].join('\n')).digest('hex');
}

function fingerprint() {
  const manifest = sources().map(rel => `${rel}:${blobSha(text(rel))}`);
  return { value: manifestFingerprint(manifest), count: manifest.length };
}

const bullets = items => items.map(item => `- ${item}`).join('\n');
const section = (title, body) => `## ${title}\n\n${body}\n`;
const subSection = (title, body) => `### ${title}\n\n${body}\n`;
const doc = (title, body, fp) => `# ${title}\n\n${NOTICE}\n\n${body.trim()}\n\n<!-- generated-by: scripts/specs.mjs@${VERSION} -->\n<!-- source-fingerprint: ${fp} -->\n`;

function normalizeMarkdown(value, headingOffset = 2) {
  return value.replace(/^---\n[\s\S]*?\n---\n?/, '').trim()
    .replace(/^(#{1,6})\s+/gm, (_, hashes) => `${'#'.repeat(Math.min(6, hashes.length + headingOffset))} `);
}

function source(rel, label) {
  return `### ${label}\n\n来源：\`${rel}\`\n\n${normalizeMarkdown(text(rel), 3)}`;
}

function jsonSummary(rel, label, formatter) {
  return `### ${label}\n\n来源：\`${rel}\`\n\n${formatter(json(rel))}`;
}

function renderUiKitSummary(plan) {
  const patterns = (plan.pagePatterns || []).map(item =>
    `#### ${item.name}（\`${item.slug}\`）\n\n- 适用：${(item.applicableScenarios || []).join('、') || '未声明'}\n- 打开方式：${item.presentation || '未声明'}\n- 交互：${item.interactionPattern || '未声明'}\n- 组件：${(item.componentSlugs || []).join('、') || '未声明'}`);
  const fallbacks = (plan.fallbackPageBlueprints || []).map(item =>
    `#### ${item.name}（\`${item.id}\`）\n\n- 适用条件：${(item.appliesWhen || []).join('；')}\n- 允许组件：${(item.allowedComponents || []).join('、') || '未声明'}`);
  return ['#### 选择优先级', '', ...(plan.paradigmSelectionPriority?.decisionTree || []).map((item, i) => `${i + 1}. ${item.question}`), '', '#### 已登记页面范式', '', ...patterns, '', '#### 兜底蓝图', '', ...fallbacks].join('\n');
}

function render() {
  const { value: fp, count } = fingerprint();
  const docs = {};
  const shared = [
    section('阅读方式', '本目录按工作阶段编排。每个“权威规则全文”小节均标明来源；生成文档仅供阅读，不是运行时规则来源。'),
  ];

  docs[FILES[0]] = doc('工作流总览与优先级', [
    ...shared,
    section('主链路', '业务需求按 **需求理解 → 原型设计 → 原型实现 → 验收冻结** 推进；组件、Token、UI Kit 与工作流本体改动进入系统迭代。'),
    section('仓库级硬约束', source('AGENTS.md', '仓库定位、技能路由与主链路门禁')),
    section('技能入口与交接', source('.codex/skills/README.md', '五技能入口总览')),
  ].join('\n'), fp);

  docs[FILES[1]] = doc('需求理解规则', [
    ...shared,
    section('阶段目标', '确认原型简报、业务迭代范围和正式需求规格；此阶段不决定组件或视觉布局。'),
    section('权威规则全文', [
      source('.codex/skills/wego-product/SKILL.md', '技能职责、输入与交接'),
      source('.codex/skills/wego-product/references/iteration-workflow.md', '业务迭代生命周期'),
      source('.codex/skills/wego-product/references/interaction-spec.md', '交互规格结构'),
      source('.codex/skills/wego-product/references/readiness-and-boundaries.md', '就绪条件与边界'),
    ].join('\n\n')),
  ].join('\n'), fp);

  docs[FILES[2]] = doc('页面设计规则', [
    ...shared,
    section('阶段目标', '只消费已确认范围，选择页面范式、组件组合、布局和打开方式；发现缺口必须回退上游。'),
    section('权威规则全文', [
      source('.codex/skills/wego-design/SKILL.md', '技能职责、输入与交接'),
      source('.codex/skills/wego-design/references/design-plan.md', '设计计划结构与无缺口要求'),
      source('.codex/skills/wego-design/references/design-decisions.md', '设计判断方法'),
      source('.codex/skills/wego-design/references/library-map.md', '设计系统读取路径'),
    ].join('\n\n')),
  ].join('\n'), fp);

  docs[FILES[3]] = doc('组件与 UI Kit 使用规则', [
    ...shared,
    section('阶段目标', '从已登记组件、页面范式和兜底蓝图中选择，不新增未登记的结构或样式能力。'),
    section('速查', jsonSummary('.codex/skills/wego-design/uikit-plan.json', '页面范式、选择优先级与兜底蓝图', renderUiKitSummary)),
    section('权威规则全文', [
      source('.codex/skills/wego-design/library-consumption.json', '设计系统消费边界'),
      source('.codex/skills/wego-uxsystem-iterate/references/sync-matrix.runtime.md', '组件与 UI Kit 变更同步矩阵'),
    ].join('\n\n')),
  ].join('\n'), fp);

  docs[FILES[4]] = doc('原型实现规则', [
    ...shared,
    section('阶段目标', '严格按已确认的原型简报和设计约束，将场景注册到唯一 App 宿主；正式化后补齐实现追踪。'),
    section('权威规则全文', [
      source('.codex/skills/wego-ux/SKILL.md', '技能职责、输入与交接'),
      source('.codex/skills/wego-ux/references/scene-runtime.md', '场景运行时与宿主接入'),
      source('.codex/skills/wego-ux/references/interaction-implementation.md', '交互实现规则'),
      source('.codex/skills/wego-ux/references/delivery.md', '交付与实现追踪'),
    ].join('\n\n')),
  ].join('\n'), fp);

  docs[FILES[5]] = doc('验收与回归规则', [
    ...shared,
    section('阶段目标', '按 requirement_id 覆盖确认需求，比较规格、规则与实现，输出验收、开发交接并冻结迭代。'),
    section('权威规则全文', [
      source('.codex/skills/wego-tests/SKILL.md', '技能职责、输入与交接'),
      source('.codex/skills/wego-tests/references/acceptance-report.md', '验收报告结构'),
      source('.codex/skills/wego-tests/references/acceptance-checks.md', '验收检查项'),
      source('.codex/skills/wego-tests/references/browser-verification.md', '浏览器验证方法'),
    ].join('\n\n')),
  ].join('\n'), fp);

  docs[FILES[6]] = doc('工作流迭代与经验沉淀规则', [
    ...shared,
    section('阶段目标', '仅在用户明确要求时审查或优化设计系统、工作流和经验沉淀；普通业务页面不进入本流程。'),
    section('权威规则全文', [
      source('.codex/skills/wego-uxsystem-iterate/SKILL.md', '技能职责、输入与交接'),
      source('.codex/skills/wego-uxsystem-iterate/references/workflow.md', '设计系统与组件迭代流程'),
      source('.codex/skills/wego-uxsystem-iterate/references/judgment-principles.md', '设计系统审查判断原则'),
      source('.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md', '经验沉淀与规则升级流程'),
      source('.codex/skills/wego-uxsystem-iterate/references/experience-candidates.md', '候选池结构'),
      source('.codex/skills/wego-uxsystem-iterate/references/sync-matrix.md', '工作流变更同步矩阵'),
      source('.codex/skills/wego-uxsystem-iterate/references/skill-package-structure.md', '技能包结构规则'),
    ].join('\n\n')),
  ].join('\n'), fp);
  return { docs, fp, count };
}

const candidateErrors = () => [];

const idsOf = (arr, key) => new Set((Array.isArray(arr) ? arr : []).map(item => item?.[key]).filter(Boolean));
const addRefs = (errors, file, label, refs, set) => (refs || []).filter(Boolean).forEach(ref => { if (!set.has(ref)) errors.push(`${file}：${label} 引用了不存在的 ID：${ref}`); });
const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
const hasDuplicate = values => values.length !== new Set(values).size;
const selectedLooksLikeDom = value => (Array.isArray(value) ? value : [value]).some(item => typeof item === 'string' && (/<[a-z][\s>]/i.test(item) || /class\s*=/.test(item) || /\.[a-zA-Z][\w-]+/.test(item) || /\b[a-zA-Z][\w-]+__(?:[\w-]+)/.test(item) || /\b[a-zA-Z][\w-]+--(?:[\w-]+)/.test(item)));

function stage23Errors() {
  const errors = [];
  const root = path.join(ROOT, SCENES_ROOT);
  if (!fs.existsSync(root)) return errors;
  for (const entry of fs.readdirSync(root, { withFileTypes: true }).filter(item => item.isDirectory() && !item.name.startsWith('.'))) {
    const scene = entry.name;
    const specFile = `${SCENES_ROOT}/${scene}/_spec/interaction_spec.json`;
    const planFile = `${SCENES_ROOT}/${scene}/_spec/design_plan.json`;
    const acceptanceFile = `${SCENES_ROOT}/${scene}/_spec/acceptance_report.json`;
    if (!exists(specFile) || !exists(planFile)) continue;
    const spec = maybeJson(specFile), plan = maybeJson(planFile);
    if (spec?.__parseError) { errors.push(`${specFile} JSON 解析失败：${spec.__parseError}`); continue; }
    if (plan?.__parseError) { errors.push(`${planFile} JSON 解析失败：${plan.__parseError}`); continue; }
    const acceptance = exists(acceptanceFile) ? maybeJson(acceptanceFile) : null;
    if (acceptance?.__parseError) { errors.push(`${acceptanceFile} JSON 解析失败：${acceptance.__parseError}`); continue; }
    const newSpec = Array.isArray(spec?.flows) || Array.isArray(spec?.flow_nodes) || Array.isArray(spec?.surfaces) || Array.isArray(spec?.content_blocks);
    const newPlan = typeof plan?.complexity_level === 'string' || Array.isArray(plan?.component_patterns) || Array.isArray(plan?.flow_to_surface_decisions);
    if (!newSpec && !newPlan) continue;

    const flowIds = idsOf(spec?.flows, 'flow_id');
    const nodeIds = idsOf(spec?.flow_nodes, 'node_id');
    const surfaceIds = idsOf(spec?.surfaces, 'surface_id');
    const contentIds = idsOf(spec?.content_blocks, 'content_id');
    const transitionIds = idsOf(spec?.transitions, 'transition_id');
    const contexts = [spec?.iteration_context, plan?.iteration_context, acceptance?.iteration_context].filter(Boolean);
    if (contexts.length > 0) {
      if (!spec?.iteration_context || !plan?.iteration_context) errors.push(`${SCENES_ROOT}/${scene}/_spec：业务迭代场景的 interaction_spec 和 design_plan 必须同时包含 iteration_context`);
      const normalized = contexts.map(context => JSON.stringify({ iteration_id: context?.iteration_id, scope_revision: context?.scope_revision, requirement_ids: [...(context?.requirement_ids || [])].sort() }));
      if (new Set(normalized).size > 1) errors.push(`${SCENES_ROOT}/${scene}/_spec：interaction_spec、design_plan、acceptance_report 的 iteration_context 必须一致`);
    }

    if (newSpec) {
      for (const field of ['flows','flow_nodes','surfaces','content_blocks','transitions','data_handoffs','prototype_boundaries']) if (!Array.isArray(spec[field])) errors.push(`${specFile}：新格式 interaction_spec 必须包含数组字段 ${field}`);
      if (!isObject(spec.readiness)) errors.push(`${specFile}：新格式 interaction_spec 必须包含 readiness 对象`);
      if (!Array.isArray(spec?.prototype_target?.routes)) errors.push(`${specFile}：新格式 interaction_spec 必须包含 prototype_target.routes[]`);
      for (const [field, values] of Object.entries({ flows:[...flowIds], flow_nodes:[...nodeIds], surfaces:[...surfaceIds], content_blocks:[...contentIds], transitions:[...transitionIds] })) if (hasDuplicate(values)) errors.push(`${specFile}：${field} 存在重复 ID`);
      for (const flow of spec.flows || []) addRefs(errors, specFile, `flows.${flow?.flow_id}.steps[]`, flow?.steps || [], nodeIds);
      for (const node of spec.flow_nodes || []) addRefs(errors, specFile, `flow_nodes.${node?.node_id}.surface_ref`, [node?.surface_ref], surfaceIds);
      for (const surface of spec.surfaces || []) { addRefs(errors, specFile, `surfaces.${surface?.surface_id}.node_refs[]`, surface?.node_refs || [], nodeIds); addRefs(errors, specFile, `surfaces.${surface?.surface_id}.content_refs[]`, surface?.content_refs || [], contentIds); }
      for (const tr of spec.transitions || []) addRefs(errors, specFile, `transitions.${tr?.transition_id}.from/to/return_to`, [tr?.from, tr?.to, tr?.return_to], nodeIds);
      for (const h of spec.data_handoffs || []) { addRefs(errors, specFile, `data_handoffs.${h?.handoff_id}.transition_id`, [h?.transition_id], transitionIds); addRefs(errors, specFile, `data_handoffs.${h?.handoff_id}.source_node/target_node`, [h?.source_node, h?.target_node], nodeIds); addRefs(errors, specFile, `data_handoffs.${h?.handoff_id}.payload_content_refs[]`, h?.payload_content_refs || [], contentIds); }
      for (const b of spec.prototype_boundaries || []) { addRefs(errors, specFile, `prototype_boundaries.${b?.node_id}.node_id`, [b?.node_id], nodeIds); if (!['functional','simulated','stub','excluded'].includes(b?.depth)) errors.push(`${specFile}：prototype_boundaries.${b?.node_id || '?'} depth 非法`); if (b?.depth === 'stub' && !b?.feedback) errors.push(`${specFile}：stub 节点 ${b?.node_id || '?'} 必须声明 feedback`); }
      const routeIds = (spec?.prototype_target?.routes || []).map(r => r?.id).filter(Boolean); if (hasDuplicate(routeIds)) errors.push(`${specFile}：prototype_target.routes[].id 存在重复`);
      for (const route of spec?.prototype_target?.routes || []) addRefs(errors, specFile, `prototype_target.routes.${route?.id}.surface_ref`, [route?.surface_ref], surfaceIds);
    }

    if (newPlan) {
      if (!['simple','structured','complex'].includes(plan?.complexity_level)) errors.push(`${planFile}：complexity_level 必须是 simple/structured/complex`);
      for (const field of ['flow_to_surface_decisions','component_patterns','surface_designs','component_mapping','design_gaps','rule_sources_used']) if (!Array.isArray(plan?.[field])) errors.push(`${planFile}：新格式 design_plan 必须包含数组字段 ${field}`);
      for (const field of ['page_strategy','page_presentation']) if (!isObject(plan?.[field])) errors.push(`${planFile}：新格式 design_plan 必须包含对象字段 ${field}`);
      if (['structured','complex'].includes(plan?.complexity_level) && !Array.isArray(plan?.region_composition)) errors.push(`${planFile}：structured/complex 页面必须包含 region_composition[]`);
      if (plan?.complexity_level === 'complex') for (const field of ['first_screen_goal','region_priority','content_density','scroll_rhythm','fixed_vs_scroll','visual_competition']) if (!plan?.page_strategy?.[field]) errors.push(`${planFile}：complex 页面 page_strategy 缺少 ${field}`);
      const patternIds = idsOf(plan?.component_patterns, 'pattern_id');
      const mappingBlocks = idsOf(plan?.component_mapping, 'block');
      const patternOrBlock = new Set([...patternIds, ...mappingBlocks]);
      for (const d of plan?.flow_to_surface_decisions || []) { addRefs(errors, planFile, `flow_to_surface_decisions.${d?.decision_id}.node_refs[]`, d?.node_refs || [], nodeIds); addRefs(errors, planFile, `flow_to_surface_decisions.${d?.decision_id}.surface_ref`, [d?.surface_ref], surfaceIds); }
      for (const cp of plan?.component_patterns || []) addRefs(errors, planFile, `component_patterns.${cp?.pattern_id}.applies_to[]`, cp?.applies_to || [], new Set([...surfaceIds, ...contentIds]));
      for (const r of plan?.region_composition || []) addRefs(errors, planFile, `region_composition.${r?.region_id}.component_refs[]`, r?.component_refs || [], patternOrBlock);
      for (const m of plan?.component_mapping || []) if (selectedLooksLikeDom(m?.selected)) errors.push(`${planFile}：新任务 component_mapping.selected 不得包含完整 DOM 路径或 CSS 类拼装：${m?.block || '?'}`);
    }
  }
  return errors;
}

function structuralErrors() {
  const errors = [...validateSkillEntryBoundary(ROOT), ...candidateErrors(json('.codex/skills/wego-uxsystem-iterate/experience/candidates.json'))];
  const manifest = sources();
  if (manifest.some(rel => /\/SKILL\.(?!md$)/.test(rel))) errors.push('规则来源清单不得包含历史 Skill 入口');
  for (const dir of SKILL_DIRS) {
    const root = path.join(ROOT, dir);
    const skillFile = path.join(root, 'SKILL.md');
    if (!fs.existsSync(skillFile)) errors.push(`${dir} 缺少唯一 SKILL.md`);
    if (fs.existsSync(root)) for (const name of fs.readdirSync(root).filter(name => /^SKILL\..+\.md$/.test(name) && name !== 'SKILL.md')) errors.push(`${dir}/${name} 是禁止保留的并列 Skill 入口`);
    if (fs.existsSync(path.join(root, 'README.md'))) errors.push(`${dir}/README.md 是禁止保留的平级辅助文档；详细资料应进入 references/`);
    if (fs.existsSync(path.join(root, 'templates'))) errors.push(`${dir}/templates 角色不明确；输出模板应进入 assets/templates/`);
    const agentFile = path.join(root, 'agents/openai.yaml');
    if (!fs.existsSync(agentFile)) errors.push(`${dir} 缺少 agents/openai.yaml`);
    else {
      const agent = fs.readFileSync(agentFile, 'utf8');
      const shortDescription = agent.match(/^\s*short_description:\s*"([^"]+)"/m)?.[1] || '';
      const defaultPrompt = agent.match(/^\s*default_prompt:\s*"([^"]+)"/m)?.[1] || '';
      if (shortDescription.length < 25 || shortDescription.length > 64) errors.push(`${dir}/agents/openai.yaml short_description 必须为 25–64 字符`);
      if (!defaultPrompt.includes(`$${path.basename(root)}`)) errors.push(`${dir}/agents/openai.yaml default_prompt 必须显式包含 $${path.basename(root)}`);
    }
    const commonEntries = new Set(['SKILL.md','agents','references','scripts','assets']);
    const domainEntries = {
      'wego-design': new Set(['colors_and_type.css','components.css','components','css.json','iconfont.css','library-consumption.json','metadata.json','preview','scaffold.css','specs','ui_kits','uikit-plan.json']),
      'wego-uxsystem-iterate': new Set(['experience']),
    }[path.basename(root)] || new Set();
    if (fs.existsSync(root)) for (const entry of fs.readdirSync(root)) if (!commonEntries.has(entry) && !domainEntries.has(entry)) errors.push(`${dir}/${entry} 资源角色未登记；应归入 references/scripts/assets 或正式领域目录`);
    if (fs.existsSync(skillFile)) {
      const value = fs.readFileSync(skillFile, 'utf8');
      const lineCount = value.split(/\r?\n/).length;
      if (lineCount >= 500) errors.push(`${dir}/SKILL.md 共 ${lineCount} 行，必须少于 500 行并使用渐进披露`);
      const frontmatter = value.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatter) errors.push(`${dir}/SKILL.md 缺少 YAML frontmatter`);
      else {
        const fields = [...frontmatter[1].matchAll(/^([a-zA-Z0-9_-]+):/gm)].map(match => match[1]);
        for (const field of fields) if (!['name','description'].includes(field)) errors.push(`${dir}/SKILL.md frontmatter 含非标准字段 ${field}`);
        const name = frontmatter[1].match(/^name:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1]?.trim();
        if (name !== path.basename(root)) errors.push(`${dir}/SKILL.md name 必须与目录名一致`);
      }
      const linked = new Set();
      for (const match of value.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
        const target = match[1].split('#')[0];
        if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
        const resolved = path.resolve(root, target);
        if (!fs.existsSync(resolved)) errors.push(`${dir}/SKILL.md 链接不存在：${target}`);
        linked.add(path.normalize(target));
      }
      const references = path.join(root, 'references');
      if (fs.existsSync(references)) for (const entry of fs.readdirSync(references, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.md') && !linked.has(path.normalize(`references/${entry.name}`))) errors.push(`${dir}/references/${entry.name} 未由 SKILL.md 直接链接`);
      }
    }
  }
  const consumption = json('.codex/skills/wego-design/library-consumption.json');
  for (const [i, item] of (consumption.scenarioTypeRegistry?.types || []).entries()) {
    for (const key of ['occurrence_count','scene_evidence','threshold','status','normalized_key']) if (Object.hasOwn(item, key)) errors.push(`scenarioTypeRegistry.types[${i}] 含候选字段 ${key}`);
    if (/observing|awaiting-confirmation/.test(JSON.stringify(item))) errors.push(`scenarioTypeRegistry.types[${i}] 含候选状态，不得进入正式注册表`);
  }
  const runtimeFiles = ['AGENTS.md','README.md','.codex/skills/README.md','.codex/skills/wego-product/SKILL.md','.codex/skills/wego-design/SKILL.md','.codex/skills/wego-ux/SKILL.md','.codex/skills/wego-tests/SKILL.md','.codex/skills/wego-uxsystem-iterate/SKILL.md','.codex/skills/wego-design/references/library-map.md'];
  for (const rel of runtimeFiles) {
    const value = text(rel);
    if (/先读取\s*`?SKILL\.runtime\.md/.test(value)) errors.push(`${rel} 仍要求读取历史 Skill 入口`);
    for (const name of FILES) if (value.includes(name)) errors.push(`${rel} 不得引用自动生成文档 ${name}`);
  }
  const agentEntryFiles = ['.codex/skills/wego-product/agents/openai.yaml','.codex/skills/wego-design/agents/openai.yaml','.codex/skills/wego-ux/agents/openai.yaml','.codex/skills/wego-tests/agents/openai.yaml'];
  for (const rel of agentEntryFiles) {
    const value = text(rel);
    if (/page_spec|design_consumption_plan/.test(value)) errors.push(`${rel} 仍使用旧规格产物名，技能可能被错误触发或错误交接`);
  }
  const consumptionText = text('.codex/skills/wego-design/library-consumption.json');
  if (/先新增类型再沉淀规则/.test(consumptionText)) errors.push('library-consumption.json 仍允许候选先污染 scenarioTypeRegistry');
  if (/"recommendedReadOrder"[\s\S]*?specs\/\*\.md/.test(consumptionText)) errors.push('library-consumption.json 仍把自动生成 specs 加入运行时推荐读取顺序');
  errors.push(...stage23Errors());
  return errors;
}

function checkFiles(docs) {
  const errors = [];
  for (const [name, expected] of Object.entries(docs)) {
    const file = path.join(OUT, name);
    if (!fs.existsSync(file)) errors.push(`缺少自动生成文档：${name}`);
    else if (fs.readFileSync(file, 'utf8') !== expected) errors.push(`自动生成文档已过期或被手工修改：${name}`);
  }
  if (fs.existsSync(OUT)) for (const entry of fs.readdirSync(OUT, { withFileTypes: true })) if (entry.isFile() && entry.name.endsWith('.md') && !FILES.includes(entry.name)) errors.push(`specs 顶层存在未登记文档：${entry.name}`);
  return errors;
}

function output(result) {
  if (JSON_OUT) return process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  (result.ok ? console.log : console.error)(result.message);
  for (const error of result.errors || []) console.error(`- ${error}`);
  if (result.ok && result.fingerprint) console.log(`规则指纹：${result.fingerprint}`);
}

function tests() {
  const failures = [];
  const expect = (value, message) => { if (!value) failures.push(message); };
  expect(validateSkillEntryBoundary(ROOT).length === 0, 'Skill 入口和经验归属守门必须通过');
  expect(manifestFingerprint(['a:1']) !== manifestFingerprint(['a:2']), '规则源变化应改变指纹');
  expect(!sources().some(rel => rel.endsWith('/SKILL.runtime.md')), 'source manifest 不得包含历史 Skill 入口');
  for (const dir of SKILL_DIRS) expect(!fs.existsSync(path.join(ROOT, dir, 'SKILL.runtime.md')), `${dir} 不得存在 SKILL.runtime.md`);
  const workflow = text('.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md');
  expect(workflow.includes('经验候选录入') && workflow.includes('是否现在将其升级为正式规则') && workflow.includes('运行时可达性') && workflow.includes('快速迭代阶段当前阈值为 1'), '工作流门禁不完整');
  const iterationContract = text('.codex/skills/wego-product/references/iteration-workflow.md');
  expect(iterationContract.includes('iteration.json') && iterationContract.includes('feature_id') && iterationContract.includes('requirement_id') && iterationContract.includes('开发交接') && iterationContract.includes('freeze.json'), '业务迭代契约缺少范围、追踪、交接或冻结规则');
  const iterationTest = spawnSync(process.execPath, [path.join(ROOT, 'scripts/iteration-record.mjs'), 'test'], { cwd: ROOT, encoding: 'utf8' });
  expect(iterationTest.status === 0, `业务迭代状态机回归失败：${iterationTest.stderr || iterationTest.stdout}`);
  const componentWorkflow = text('.codex/skills/wego-uxsystem-iterate/references/workflow.md');
  expect(componentWorkflow.includes('共享 helper') && componentWorkflow.includes('不得复制简化算法') && componentWorkflow.includes('单组件 Preview 和组合 Preview'), '组件组合公共交互 helper 复用规则不完整');
  const rendered = render().docs;
  const expectedSources = {
    [FILES[0]]: ['AGENTS.md', '.codex/skills/README.md'],
    [FILES[1]]: ['wego-product/SKILL.md', 'iteration-workflow.md', 'interaction-spec.md', 'readiness-and-boundaries.md'],
    [FILES[2]]: ['wego-design/SKILL.md', 'design-plan.md', 'design-decisions.md', 'library-map.md'],
    [FILES[3]]: ['uikit-plan.json', 'library-consumption.json', 'sync-matrix.runtime.md'],
    [FILES[4]]: ['wego-ux/SKILL.md', 'scene-runtime.md', 'interaction-implementation.md', 'delivery.md'],
    [FILES[5]]: ['wego-tests/SKILL.md', 'acceptance-report.md', 'acceptance-checks.md', 'browser-verification.md'],
    [FILES[6]]: ['wego-uxsystem-iterate/SKILL.md', 'workflow.md', 'judgment-principles.md', 'workflow-iteration.md', 'experience-candidates.md', 'sync-matrix.md', 'skill-package-structure.md'],
  };
  for (const [name, value] of Object.entries(rendered)) {
    expect(value.includes('## 阅读方式'), `${name} 缺少阅读说明`);
    expect(value.includes('## 权威规则全文') || name === FILES[0], `${name} 缺少按来源编排的规则正文`);
    expect(value.length > 1200, `${name} 内容过短，可能遗漏权威规则`);
    expect(!/## [^\n]+\n\n\n+(?=## |<!--)/.test(value), `${name} 存在空的一级章节`);
    for (const rel of expectedSources[name]) expect(value.includes(rel), `${name} 缺少来源：${rel}`);
  }
  const componentKitDoc = rendered[FILES[3]];
  expect(componentKitDoc.includes('选择优先级') && componentKitDoc.includes('已登记页面范式') && componentKitDoc.includes('兜底蓝图'), '组件与 UI Kit 使用规则缺少选择或兜底信息');
  return failures;
}

try {
  if (!['generate','check','test'].includes(CMD)) throw new Error('用法：node scripts/specs.mjs <generate|check|test> [--json]');
  if (CMD === 'test') {
    const errors = tests();
    output({ ok: !errors.length, message: errors.length ? '规则文档与经验池测试失败' : '规则文档与经验池测试通过', errors });
    process.exit(errors.length ? 1 : 0);
  }
  const structure = structuralErrors();
  const { docs, fp, count } = render();
  if (CMD === 'generate') {
    if (structure.length) { output({ok:false,message:'正式生成前结构检查失败',errors:structure}); process.exit(1); }
    fs.mkdirSync(OUT, { recursive: true });
    for (const [name, value] of Object.entries(docs)) fs.writeFileSync(path.join(OUT, name), value);
    output({ok:true,message:`已生成 ${FILES.length} 份规则检查文档`,fingerprint:fp,source_count:count});
    process.exit(0);
  }
  const errors = [...structure, ...checkFiles(docs)];
  output({ok:!errors.length,message:errors.length?'规则文档一致性检查失败':'规则文档一致性检查通过',errors,fingerprint:fp,source_count:count});
  process.exit(errors.length ? 1 : 0);
} catch (error) {
  output({ok:false,message:'规则文档脚本执行失败',errors:[error.message]});
  process.exit(1);
}
