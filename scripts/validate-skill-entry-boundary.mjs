#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const expectedSkills = new Set(['wego-product', 'wego-design', 'wego-uxsystem-iterate']);
const requiredHeadings = ['触发与职责边界', '必要输入与运行时入口', '输出契约与跨技能交接'];
const categories = new Set([
  'skill-entry', 'skill-runtime-flow', 'shared-principle', 'product-workflow', 'scene-contract', 'design-consumption',
  'component-contract', 'design-system', 'ui-kit', 'token', 'preview', 'agents', 'script', 'test'
]);

function pathMatches(file, pattern) {
  const patternRegex = `^${pattern.split('*').map(part => part.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')).join('[^/]*')}$`;
  return new RegExp(patternRegex).test(file);
}
function read(root, relative, errors) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) { errors.push(`缺少文件：${relative}`); return ''; }
  return fs.readFileSync(file, 'utf8');
}
function locatorExists(root, relative, locator) {
  const content = fs.readFileSync(path.join(root, relative), 'utf8');
  if (relative.endsWith('.json') && locator.startsWith('/')) {
    let value = JSON.parse(content);
    for (const part of locator.slice(1).split('/')) { if (!Object.hasOwn(value, part)) return false; value = value[part]; }
    return true;
  }
  return content.includes(locator);
}

function markdownRuleIds(content) {
  return new Set([...content.matchAll(/<!--\s*rule-id:\s*([a-z0-9][a-z0-9._-]*)\b/giu)].map(match => match[1]));
}
function isIsoTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) return false;
  try { return new Date(value).toISOString().replace('.000Z', 'Z') === value; }
  catch { return false; }
}

export function validatePromotedRuleTargets(root, pool) {
  const errors = [];
  for (const candidate of pool.candidates || []) {
    if (candidate.status !== 'promoted') continue;
    const targets = [
      ['canonical', candidate.rule_ownership?.canonical],
      ['promotion_landing', candidate.promotion_landing]
    ];
    for (const [kind, target] of targets) {
      if (!target) {
        errors.push(`候选 ${candidate.id} 缺少 ${kind}`);
        continue;
      }
      const file = path.join(root, target.file || '');
      if (target.file?.endsWith('.md')) {
        const expectedLocator = `rule-id: ${target.rule_id}`;
        if (!target.rule_id || target.locator !== expectedLocator) {
          errors.push(`候选 ${candidate.id} 的 ${kind} 必须精确定位 rule_id：${target.file}#${expectedLocator}`);
          continue;
        }
        if (!fs.existsSync(file) || !markdownRuleIds(fs.readFileSync(file, 'utf8')).has(target.rule_id)) {
          errors.push(`候选 ${candidate.id} 的 ${kind} rule_id 未落地：${target.file}#${target.rule_id}`);
        }
      } else if (target.file?.endsWith('.json')) {
        if (!/^\/[^/]+\/.+/.test(target.locator || '') || ['/runtimeTokens', '/globalConsumptionRules', '/pagePatterns'].includes(target.locator)) {
          errors.push(`候选 ${candidate.id} 的 ${kind} 必须定位 JSON 内的精确规则节点`);
        }
      } else if (/^(?:validate|check|test)$/u.test(target.locator || '')) {
        errors.push(`候选 ${candidate.id} 的 ${kind} 不得使用泛化脚本定位：${target.locator}`);
      }
    }
  }
  return errors;
}

export function validateExperienceRegistry(root, registry, pool) {
  const errors = [];
  if (registry?.schemaVersion !== 3 || !Array.isArray(registry?.entryWhitelist)) errors.push('经验归属注册表必须使用 schemaVersion 3');
  if (new Set(Object.keys(registry?.categories || {})).size !== categories.size || [...categories].some(category => !registry?.categories?.[category])) errors.push('经验归属注册表必须定义当前十四类归属');
  if (pool?.schemaVersion !== 3 || !Array.isArray(pool?.candidates)) errors.push('经验候选池必须使用 schemaVersion 3 和 candidates 数组');
  if (!registry || !pool) return errors;

  const patterns = Object.entries(registry.categories || {}).flatMap(([category, rule]) => (rule.paths || []).map(pattern => ({ category, pattern })));
  for (let leftIndex = 0; leftIndex < patterns.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < patterns.length; rightIndex += 1) {
      const left = patterns[leftIndex];
      const right = patterns[rightIndex];
      const leftSample = left.pattern.replaceAll('*', 'sample');
      const rightSample = right.pattern.replaceAll('*', 'sample');
      if (pathMatches(leftSample, right.pattern) || pathMatches(rightSample, left.pattern)) {
        errors.push(`经验归属路径重叠：${left.category}:${left.pattern} ↔ ${right.category}:${right.pattern}`);
      }
    }
  }

  const seenIds = new Set();
  const seenKeys = new Set();
  for (const candidate of pool.candidates || []) {
    if (!candidate?.id || seenIds.has(candidate.id)) errors.push(`候选 id 缺失或重复：${candidate?.id || '未定义'}`);
    if (!candidate?.normalized_key || seenKeys.has(candidate.normalized_key)) errors.push(`候选 normalized_key 缺失或重复：${candidate?.normalized_key || '未定义'}`);
    seenIds.add(candidate.id);
    seenKeys.add(candidate.normalized_key);
    if (!['awaiting-confirmation', 'promoted', 'superseded'].includes(candidate.status)) errors.push(`候选 ${candidate.id} 状态非法：${candidate.status}`);
    if (!Number.isInteger(candidate.occurrence_count) || !Number.isInteger(candidate.threshold) || candidate.occurrence_count < 1 || candidate.threshold < 1) errors.push(`候选 ${candidate.id} 的 occurrence_count/threshold 必须为正整数`);
    if (!Array.isArray(candidate.evidence) || !candidate.evidence.length || candidate.evidence.some(item => typeof item !== 'string' || !item.trim())) errors.push(`候选 ${candidate.id} 必须包含非空证据`);
    const secondaryOwners = candidate.secondary_owners || [];
    if (!Array.isArray(secondaryOwners) || new Set(secondaryOwners).size !== secondaryOwners.length || secondaryOwners.includes(candidate.primary_owner)) errors.push(`候选 ${candidate.id} 的 secondary_owners 必须去重且不得重复 primary_owner`);

    const ownership = candidate.rule_ownership;
    const canonical = ownership?.canonical;
    if (!categories.has(ownership?.category) || !canonical?.file || !canonical?.locator || !canonical?.rule_id) {
      errors.push(`候选 ${candidate.id} 缺少有效 rule_ownership`);
      continue;
    }
    const matchingCategories = Object.entries(registry.categories)
      .filter(([, rule]) => rule.paths.some(pattern => pathMatches(canonical.file, pattern)))
      .map(([category]) => category);
    if (matchingCategories.length !== 1) errors.push(`候选 ${candidate.id} 的权威路径必须且只能命中一个归属，实际：${matchingCategories.join('、') || '无'}`);
    else if (matchingCategories[0] !== ownership.category) errors.push(`候选 ${candidate.id} 指向错误归属路径：${canonical.file}`);
    const systemOwnedCategories = new Set(['component-contract', 'design-consumption', 'design-system', 'ui-kit', 'token', 'preview', 'agents', 'script', 'test']);
    const expectedPrimaryOwner = systemOwnedCategories.has(ownership.category)
      ? 'wego-uxsystem-iterate'
      : ownership.category === 'product-workflow'
        ? 'wego-product'
        : ownership.category === 'scene-contract'
          ? 'wego-design'
          : ownership.category === 'skill-runtime-flow'
            ? canonical.file.includes('/wego-uxsystem-iterate/') ? 'wego-uxsystem-iterate' : 'wego-design'
            : ownership.category === 'skill-entry'
              ? canonical.file.includes('/wego-product/') ? 'wego-product' : canonical.file.includes('/wego-design/') ? 'wego-design' : 'wego-uxsystem-iterate'
              : null;
    if (expectedPrimaryOwner && candidate.primary_owner !== expectedPrimaryOwner) errors.push(`候选 ${candidate.id} 的 primary_owner 与权威类别不一致，应为 ${expectedPrimaryOwner}`);
    if (canonical.file === '.codex/skills/shared/references/design-decisions.md' && ownership.category !== 'shared-principle') errors.push(`候选 ${candidate.id} 指向设计原则时必须使用 shared-principle 归属`);
    if (ownership.category === 'shared-principle' && canonical.file !== '.codex/skills/shared/references/design-decisions.md') errors.push(`候选 ${candidate.id} 的 shared-principle 归属只能落到共享设计原则`);
    const target = path.join(root, canonical.file);
    if (!fs.existsSync(target) || !locatorExists(root, canonical.file, canonical.locator)) errors.push(`候选 ${candidate.id} 的 canonical 定位无效：${canonical.file}#${canonical.locator}`);
    if (registry.categories[ownership.category]?.requiresEntryScope && !registry.entryWhitelist.includes(candidate.entry_scope)) errors.push(`候选 ${candidate.id} 的 skill-entry 归属缺少合法 entry_scope`);
    if (/wego-ux(?!system-iterate)|wego-tests|specs\/|interaction[_-]spec|design[_-]plan|design-decisions\.surface_designs|acceptance_report|acceptance-checks|browser-verification/.test(JSON.stringify(candidate))) errors.push(`候选 ${candidate.id} 仍引用已删除的工作流或规则字段`);

    if (candidate.status === 'promoted') {
      const landing = candidate.promotion_landing;
      if (candidate.occurrence_count < candidate.threshold) errors.push(`候选 ${candidate.id} 未达到阈值不得 promoted`);
      if (!isIsoTimestamp(candidate.promoted_at)) errors.push(`候选 ${candidate.id} 的 promoted_at 必须为严格 UTC 时间`);
      if (!landing || landing.file !== canonical.file || landing.locator !== canonical.locator || landing.rule_id !== canonical.rule_id) errors.push(`候选 ${candidate.id} 的 promotion_landing 必须与 canonical 精确一致`);
      if (!landing?.constraint_area?.trim?.() || !landing?.description?.trim?.()) errors.push(`候选 ${candidate.id} 的 promotion_landing 必须含约束区域与说明`);
      const acceptance = candidate.runtime_reachability?.acceptance_check;
      if (typeof acceptance !== 'string' || !/^scripts\/[a-z0-9-]+\.mjs$/u.test(acceptance) || !fs.existsSync(path.join(root, acceptance))) errors.push(`候选 ${candidate.id} 必须指向可执行验收守卫`);
      for (const key of ['consumer_skill', 'output_field', 'downstream_consumer']) {
        if (typeof candidate.runtime_reachability?.[key] !== 'string' || !candidate.runtime_reachability[key].trim()) errors.push(`候选 ${candidate.id} 缺少 runtime_reachability.${key}`);
      }
    } else if (candidate.status === 'superseded' && !candidate.supersession_reason && !candidate.superseded_by) {
      errors.push(`候选 ${candidate.id} 的 superseded 状态缺少替代关系或原因`);
    }
  }
  errors.push(...validatePromotedRuleTargets(root, pool));
  return errors;
}

export function validateUxIterationContract(root = process.cwd()) {
  const errors = [];
  const files = {
    skill: '.codex/skills/wego-uxsystem-iterate/SKILL.md',
    agent: '.codex/skills/wego-uxsystem-iterate/agents/openai.yaml',
    workflow: '.codex/skills/wego-uxsystem-iterate/references/workflow.md',
    iteration: '.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md',
    runtimeMatrix: '.codex/skills/wego-uxsystem-iterate/references/sync-matrix.runtime.md',
    experience: '.codex/skills/wego-uxsystem-iterate/references/experience-candidates.md'
  };
  const contents = {};
  for (const [name, relative] of Object.entries(files)) contents[name] = read(root, relative, errors);
  const requireAll = (name, content, tokens) => {
    if (!tokens.every(token => content.includes(token))) errors.push(`${name} 合同漂移`);
  };
  requireAll('UX 系统迭代入口', contents.skill, ['严格按资源同步矩阵只同步该变更类型命中的', '正式设计系统源变化必须递增版本', '不得把未受影响的索引、范式或质量报告一律改写']);
  requireAll('UX 系统 Agent', contents.agent, ['三技能主链路', 'three-skill workflow']);
  if (/五技能|five-skill/iu.test(contents.agent)) errors.push('UX 系统 Agent 仍引用已删除的五技能结构');
  requireAll('组件迭代方法', contents.workflow, ['DOM、变体、状态、Token 或交互行为变化时必须同时修改 Preview 与契约', '只调整不改变实现表面的消费提示时可仅改契约', '不得为未受影响项制造机械改动']);
  requireAll('设计系统同步矩阵', contents.runtimeMatrix, ['组件契约语义或消费提示', '组件可用范围变化时才同步', '不因任一类型变化机械改写全部索引、范式或质量报告']);
  requireAll('经验升级方法', contents.iteration, ['原生 Schema', '`usageHints`', '`doNotInvent`', '`appliesWhen`', '`excludeWhen`', '不得为了经验升级发明平行字段']);
  requireAll('经验候选 Schema', contents.experience, ['"schemaVersion": 3', '路径必须且只能命中注册表的一类', '严格 UTC `promoted_at`', '与 canonical 完全一致的 `promotion_landing`', '实际可执行的守卫脚本']);
  return errors;
}

export function validateProductWireframeContract(root = process.cwd()) {
  const errors = [];
  const productRoot = '.codex/skills/wego-product';
  const relativeFiles = {
    repository: 'AGENTS.md',
    routing: '.codex/skills/README.md',
    skill: `${productRoot}/SKILL.md`,
    agent: `${productRoot}/agents/openai.yaml`,
    workflow: `${productRoot}/references/iteration-workflow.md`,
    scope: `${productRoot}/references/scope-and-boundaries.md`,
    method: `${productRoot}/references/conversation-wireframe.md`,
    trae: `${productRoot}/references/conversation-wireframe-trae.md`,
    codex: `${productRoot}/references/conversation-wireframe-codex.md`,
    principles: '.codex/skills/shared/references/design-decisions.md',
    stateMachine: 'scripts/iteration-record.mjs'
  };
  const contents = {};
  for (const [name, relative] of Object.entries(relativeFiles)) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) {
      errors.push(`产品线框合同缺少文件：${relative}`);
      contents[name] = '';
    } else {
      contents[name] = fs.readFileSync(file, 'utf8');
    }
  }

  for (const reference of ['conversation-wireframe.md', 'conversation-wireframe-trae.md', 'conversation-wireframe-codex.md']) {
    if (!contents.skill.includes(`](./references/${reference})`)) errors.push(`wego-product/SKILL.md 必须直接链接 ${reference}`);
  }

  const requireAll = (name, content, requirements) => {
    for (const [label, tokens] of requirements) {
      if (!tokens.every(token => content.includes(token))) errors.push(`${name} 缺少${label}合同`);
    }
  };

  requireAll('产品线框方法', contents.method, [
    ['简报后必生成门禁', ['简报后必生成门禁', '形成完整的 `prototype_brief` 草案', '解决全部 `open_questions`', '每个进入 `submit-brief → confirm-brief` 的简报版本都必须生成', '不得跳过', 'submit-brief --wireframe-generated-for-revision <scope_revision>']],
    ['最小业务事实', ['用户目标', '业务入口', '页面首要任务', '主要操作', '用户可见结果', '必要状态']],
    ['临时模型', ['只存在于当前产品阶段上下文', '"schema_version": 1', '"flow_id"', '"control"', '"frames"']],
    ['单一控制概念', ['只能是 `stepper`、`tabs` 或 `toggle` 之一', '必须使用且只使用一个控制概念', '不组合 stepper、tabs']],
    ['拆帧边界', ['2–6 个', '超过 6 帧', '`target_frame_id` 必须引用当前模型中的帧']],
    ['更新门禁', ['线框失效', '先更新简报', '重新生成', '`submit-brief` 前和用户确认时', '不得增加“线框已确认”', '--wireframe-generated-for-revision <scope_revision>', '`invalidate --stage=brief`']],
    ['双宿主', ['Trae 宿主', 'Codex 宿主', '共享本文件定义的临时模型']],
    ['无渲染器降级', ['没有可用渲染器', '不提示安装插件', '紧凑文本分镜', '[1/3 商品列表·默认]']],
    ['简报确认交接', ['`included` / `excluded`', '`entry_points`', '`critical_paths`', '`prototype_boundaries`', '`states`', '`data_contract`', '`assumptions`', '`open_questions`', '共同展示简报摘要和对应线框', '用户明确确认后才能运行 `confirm-brief`']],
    ['参考边界', ['简报确认参考', '不得机械照搬', '正式确认对象仍绑定 `prototype_brief`']]
  ]);
  requireAll('仓库主链路线框规则', contents.repository, [
    ['简报后必生成', ['完成 `prototype_brief` 草案后', '必须生成参考线框', '共同展示简报与线框']],
    ['更新与确认', ['简报修改都会使线框失效', '必须重新生成后再提交确认', '不新增线框确认状态']]
  ]);
  requireAll('技能路由线框规则', contents.routing, [
    ['简报后必生成', ['→ prototype_brief 草案', '→ 必须生成会话线框', '→ 共同展示简报与线框', '→ 用户确认 prototype_brief']],
    ['反馈更新', ['反馈先更新简报，再重新生成线框']]
  ]);
  requireAll('产品 Agent 线框规则', contents.agent, [
    ['简报后必生成', ['form a complete prototype brief first', 'always render a reference conversation wireframe', 'presenting both to the user for confirmation', 'regenerate the wireframe']]
  ]);
  requireAll('业务迭代线框状态机文档', contents.workflow, [
    ['当前 Schema', ['`schemaVersion: 5`', '"brief_submission": null', '未知字段']],
    ['提交快照', ['--wireframe-generated-for-revision <scope_revision>', '`brief_submission.scope_sha256`', '提交后修改简报']],
    ['失效语义', ['清空简报提交、简报确认和原型确认']]
  ]);
  requireAll('产品范围边界', contents.scope, [
    ['提交快照', ['submit-brief --wireframe-generated-for-revision <scope_revision>', '`invalidate --stage=brief`', '提交后任何范围内容变化都会使快照失效']],
    ['设计系统冲突回退', ['必须停止实现', '更新简报、重新生成线框并确认后才能实现', '回退不改变已确认指令和结果时']]
  ]);
  requireAll('共享设计决策', contents.principles, [
    ['设计系统冲突回退', ['回退若改变已确认产品指令或用户可见结果', '必须停止实现并退回 `wego-product`', '线框重生成与确认后再实现']]
  ]);
  requireAll('业务迭代状态机实现', contents.stateMachine, [
    ['Schema v5', ['record.schemaVersion !== 5', 'schemaVersion: 5', 'brief_submission']],
    ['线框提交凭据', ["value('--wireframe-generated-for-revision')", 'record.brief_submission = createBriefSubmission(record)', '线框展示并提交后范围已漂移']],
    ['失效清理', ['record.brief_submission = null']]
  ]);

  requireAll('Trae 适配', contents.trae, [
    ['能力检测', ['`dynamic-ui`', '`PureShowWidget`', '`micro-interaction`', '`visual-tokens`']],
    ['静态骨架与交互', ['`explanation-panel`', 'JavaScript 执行前', '一个脚本', '宿主主题合同', '键盘可操作']],
    ['单一控制概念', ['只使用一种控制概念', 'stepper', 'tabs', 'toggle']],
    ['运行边界', ['多页 router', '调用接口', '持久化状态', '不得把 Trae 模板、Token']],
    ['可选能力', ['不是 `wego-product` 的硬依赖', '退回文本分镜']]
  ]);

  requireAll('Codex 适配', contents.codex, [
    ['能力检测', ['`visualize`', 'HTML fragment', 'visualization 目录', '`::codex-inline-vis`']],
    ['画布与可访问性', ['一个当前页面画布', '只使用一种控制概念', '320–736px', '键盘操作']],
    ['本地交互边界', ['本地临时状态', '`fetch`', 'XHR', '真正路由', '持久化']],
    ['可选能力', ['不是 `wego-product` 的硬依赖', '退回文本分镜']],
    ['双宿主一致性', ['业务帧、操作和可见结果语义一致', '不要求像素一致']]
  ]);

  const combined = Object.values(contents).join('\n');
  if (/\/Users\/[^/\s]+\//mu.test(combined)) {
    errors.push('产品线框合同不得包含本机绝对路径');
  }
  if (/用户明确不要线框|用户明确要求线框|用户未明确要求|触发与跳过门禁/u.test(combined)) {
    errors.push('产品线框合同不得保留按需触发或跳过线框的旧门禁');
  }
  const briefFirst = contents.method.indexOf('形成完整的 `prototype_brief` 草案');
  const wireframeAfter = contents.method.indexOf('再从当前简报生成对应线框');
  if (briefFirst < 0 || wireframeAfter < 0 || briefFirst >= wireframeAfter) {
    errors.push('产品线框合同必须先形成完整 prototype_brief，再生成对应线框');
  }
  const routingBrief = contents.routing.indexOf('→ prototype_brief 草案');
  const routingWireframe = contents.routing.indexOf('→ 必须生成会话线框');
  if (routingBrief < 0 || routingWireframe < 0 || routingBrief >= routingWireframe) {
    errors.push('技能路由必须先生成 prototype_brief，再生成必需线框');
  }
  for (const line of combined.split(/\r?\n/)) {
    const mentionsRendererDependency = /(?:PureShowWidget|dynamic-ui|visualize)/iu.test(line) && /(?:必须安装|硬依赖|required dependency)/iu.test(line);
    if (mentionsRendererDependency && !/(?:不是|不得|禁止)/u.test(line)) {
      errors.push('PureShowWidget、dynamic-ui 或 visualize 不得声明为硬依赖');
    }
    if (/线框[^\n]{0,40}直接(?:运行\s*)?`?confirm-brief`?/u.test(line) && !/(?:不得|不能|禁止)/u.test(line)) {
      errors.push('线框不得直接确认 brief，必须继续现有 submit-brief → confirm-brief 门禁');
    }
  }
  for (const forbidden of ['prototype_brief.wireframe', 'prototype_brief.wireframe_model', 'prototype_brief.wireframe_confirmation']) {
    if (combined.includes(forbidden)) errors.push(`产品线框合同不得扩展正式 Schema：${forbidden}`);
  }
  if (/(?:_iterations|iteration\.json)\/?[^\n`]*wireframe/iu.test(combined)) errors.push('产品线框合同不得新增迭代持久化路径');
  if (!/不得保存临时线框模型、HTML、CSS、JavaScript/u.test(contents.method)) errors.push('产品线框方法必须明确临时模型和运行时内容不持久化');
  if (!/线框不是正式产物或确认状态/u.test(contents.skill)) errors.push('wego-product/SKILL.md 必须明确线框仅为参考且不是正式确认状态');
  if (!/完整 `prototype_brief` 草案形成后必须读取/u.test(contents.skill) || !/不得跳过线框/u.test(contents.skill)) {
    errors.push('wego-product/SKILL.md 必须声明简报形成后必生成线框');
  }

  return errors;
}

export function validateSkillEntryBoundary(root = process.cwd()) {
  const errors = [];
  const skillsRoot = path.join(root, '.codex/skills');
  const actual = fs.readdirSync(skillsRoot, { withFileTypes: true }).filter(entry => entry.isDirectory() && entry.name.startsWith('wego-')).map(entry => entry.name);
  for (const name of actual) if (!expectedSkills.has(name)) errors.push(`已删除技能仍存在：.codex/skills/${name}`);
  for (const name of expectedSkills) if (!actual.includes(name)) errors.push(`缺少当前技能：.codex/skills/${name}`);
  for (const name of expectedSkills) {
    const skillDir = path.join(skillsRoot, name);
    if (!fs.existsSync(skillDir)) continue;
    const entries = fs.readdirSync(skillDir, { withFileTypes: true });
    const entryFiles = entries.filter(entry => entry.isFile() && /^SKILL(?:\.(?:runtime|core|override))?\.md$/.test(entry.name)).map(entry => entry.name);
    if (entryFiles.length !== 1 || entryFiles[0] !== 'SKILL.md') errors.push(`${name} 必须且只能有 SKILL.md 入口`);
    const content = read(root, `.codex/skills/${name}/SKILL.md`, errors);
    const headings = [...content.matchAll(/^##\s+(.+)$/gmu)].map(match => match[1].trim());
    if (headings.length !== requiredHeadings.length || headings.some((heading, index) => heading !== requiredHeadings[index])) errors.push(`${name}/SKILL.md 必须且只能包含三项入口章节`);
    if (content.split(/\r?\n/).length > 120) errors.push(`${name}/SKILL.md 超出入口信息预算`);
    if (/wego-ux(?!system-iterate)|wego-tests|specs\/|interaction[_-]spec/.test(content)) errors.push(`${name}/SKILL.md 包含旧技能、废弃业务规格或生成规则路径`);
    const links = new Set([...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(match => match[1].split('#')[0].replace(/^\.\//, '')).filter(Boolean));
    for (const link of links) if (!/^(?:https?:|mailto:)/.test(link) && !fs.existsSync(path.resolve(skillDir, link))) errors.push(`${name}/SKILL.md 链接不存在：${link}`);
    const references = path.join(skillDir, 'references');
    if (fs.existsSync(references)) for (const entry of fs.readdirSync(references).filter(file => file.endsWith('.md'))) if (!links.has(`references/${entry}`)) errors.push(`${name}/references/${entry} 未由 SKILL.md 直接引用`);
  }
  const productSkill = read(root, '.codex/skills/wego-product/SKILL.md', errors);
  const designSkill = read(root, '.codex/skills/wego-design/SKILL.md', errors);
  errors.push(...validateProductWireframeContract(root));
  errors.push(...validateUxIterationContract(root));
  if (!productSkill.includes('../shared/references/design-decisions.md')) errors.push('wego-product/SKILL.md 必须直接引用共享设计决策原则');
  if (!designSkill.includes('../shared/references/design-decisions.md')) errors.push('wego-design/SKILL.md 必须直接引用共享设计决策原则');
  if (!designSkill.includes('产品阶段临时线框由 `prototype_brief` 派生') || !designSkill.includes('只用于用户确认，不进入设计输入链')) {
    errors.push('wego-design/SKILL.md 必须明确线框由 brief 派生且不是设计输入');
  }
  if (fs.existsSync(path.join(root, '.codex/skills/wego-design/references/design-decisions.md'))) errors.push('设计决策原则不得保留在 wego-design 私有 references 下');
  if (fs.existsSync(path.join(root, '.codex/skills/wego-uxsystem-iterate/references/high-fidelity-prototype-baseline.md'))) errors.push('重复的原型基线 reference 必须删除');
  const registryFile = '.codex/skills/wego-uxsystem-iterate/experience/authority-registry.json';
  const candidatesFile = '.codex/skills/wego-uxsystem-iterate/experience/candidates.json';
  let registry, pool;
  try { registry = JSON.parse(read(root, registryFile, errors)); } catch { errors.push('经验归属注册表 JSON 无法解析'); }
  try { pool = JSON.parse(read(root, candidatesFile, errors)); } catch { errors.push('经验候选池 JSON 无法解析'); }
  if (!registry || !pool) return errors;
  errors.push(...validateExperienceRegistry(root, registry, pool));
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = validateSkillEntryBoundary();
  if (errors.length) { console.error(errors.map(error => `- ${error}`).join('\n')); process.exit(1); }
  console.log('Skill 入口与经验归属校验通过。');
}
