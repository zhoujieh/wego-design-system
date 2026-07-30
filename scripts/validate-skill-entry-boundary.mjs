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
    if (candidate.status !== 'superseded' && (!fs.existsSync(target) || !locatorExists(root, canonical.file, canonical.locator))) {
      errors.push(`候选 ${candidate.id} 的 canonical 定位无效：${canonical.file}#${canonical.locator}`);
    }
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

export function validateProductGenerationInputContract(root = process.cwd()) {
  const errors = [];
  const relativeFiles = {
    repository: 'AGENTS.md',
    routing: '.codex/skills/README.md',
    productSkill: '.codex/skills/wego-product/SKILL.md',
    productAgent: '.codex/skills/wego-product/agents/openai.yaml',
    workflow: '.codex/skills/wego-product/references/iteration-workflow.md',
    scope: '.codex/skills/wego-product/references/scope-and-boundaries.md',
    designSkill: '.codex/skills/wego-design/SKILL.md',
    designMethod: '.codex/skills/wego-design/references/interaction-prototype-design.md',
    principles: '.codex/skills/shared/references/design-decisions.md',
    guide: 'docs/ai-design-input-and-generation-workflow.md',
    stateMachine: 'scripts/iteration-record.mjs'
  };
  const contents = {};
  for (const [name, relative] of Object.entries(relativeFiles)) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) {
      errors.push(`多来源生成输入合同缺少文件：${relative}`);
      contents[name] = '';
    } else {
      contents[name] = fs.readFileSync(file, 'utf8');
    }
  }

  const removedWireframeFiles = [
    '.codex/skills/wego-product/references/conversation-wireframe.md',
    '.codex/skills/wego-product/references/conversation-wireframe-trae.md',
    '.codex/skills/wego-product/references/conversation-wireframe-codex.md'
  ];
  for (const relative of removedWireframeFiles) {
    if (fs.existsSync(path.join(root, relative))) errors.push(`系统生成线框的已删除文件仍存在：${relative}`);
  }

  const requireAll = (name, content, requirements) => {
    for (const [label, tokens] of requirements) {
      if (!tokens.every(token => content.includes(token))) errors.push(`${name} 缺少${label}合同`);
    }
  };

  requireAll('仓库主链路', contents.repository, [
    ['文字简报确认', ['`submit-brief → confirm-brief`', '展示文字摘要', '用户明确确认']],
    ['线框边界', ['系统不生成线框图或文本分镜', '用户主动提供的线框图只作为设计阶段的结构输入']],
    ['生成输入', ['临时 `generation_packet`', '精确范式/自主组合裁决']]
  ]);
  requireAll('技能路由', contents.routing, [
    ['文字简报确认', ['submit-brief 绑定当前范围', '展示文字简报摘要', '用户确认 prototype_brief']],
    ['线框边界', ['系统不生成线框图或文本分镜', '用户主动提供的参考图、线框图或高保真 Figma']],
    ['生成输入', ['wego-design 编译 generation_packet', '临时 `generation_packet`']]
  ]);
  requireAll('产品技能入口', contents.productSkill, [
    ['文字简报确认', ['展示文字摘要', '`submit-brief`', '`confirm-brief`', '`open_questions` 清空']],
    ['视觉输入边界', ['参考图、用户线框图和高保真 Figma', '不作为产品阶段补造业务事实的来源']]
  ]);
  requireAll('产品 Agent', contents.productAgent, [
    ['文字简报确认', ['present a concise text summary', 'explicit confirmation']],
    ['线框边界', ['Do not generate a wireframe or text storyboard']]
  ]);
  requireAll('业务迭代状态机文档', contents.workflow, [
    ['当前 Schema', ['`schemaVersion: 5`', '"brief_submission": null', '未知字段']],
    ['提交快照', ['`submit-brief`', '`brief_submission.scope_sha256`', '当前范围写入 `brief_submission` 快照', '文字摘要']],
    ['失效语义', ['清空简报提交、简报确认和原型确认']],
    ['生成输入交接', ['可选参考图、用户线框图或高保真 Figma', '临时生成输入']]
  ]);
  requireAll('产品范围边界', contents.scope, [
    ['提交快照', ['`submit-brief`', '`invalidate --stage=brief`', '提交后任何范围内容变化都会使快照失效', '简短文字摘要']],
    ['线框职责', ['用户提供的线框图可在设计阶段作为结构输入', '不能自动升级为产品指令']],
    ['设计系统冲突回退', ['必须停止实现', '更新并重新确认简报后才能实现', '回退不改变已确认指令和结果时']]
  ]);
  requireAll('设计技能入口', contents.designSkill, [
    ['生成输入', ['临时 `generation_packet`', '参考图、线框图或高保真 Figma']],
    ['线框职责', ['系统不生成线框图或文本分镜', '用户主动提供的线框图只作为结构输入']]
  ]);
  requireAll('交互原型设计方法', contents.designMethod, [
    ['规则落点', ['rule-id: multi-source-generation-input-authority', '临时 `generation_packet`']],
    ['输入职责', ['自然语言中的业务事实', '参考图', '用户主动提供的线框图', '高保真 Figma']],
    ['线框职责', ['只形成 `structure_profile`', '系统不主动生成线框图或文本分镜']],
    ['冲突优先级', ['业务事实以 `prototype_brief` 为准', '高保真 Figma、用户线框图、参考图、微购系统基线依次降级']],
    ['保证边界', ['只能保证显式约束一致', '不得宣称能够命中用户未表达的审美答案']]
  ]);
  requireAll('共享设计决策', contents.principles, [
    ['多来源边界', ['rule-id: wego-multi-source-generation-input-boundary', '系统不生成线框图或文本分镜', '临时 `generation_packet`']],
    ['输入职责', ['参考图只约束视觉方向', '用户线框图只约束结构', '高保真 Figma 约束指定 Frame 的结构视觉']],
    ['保证边界', ['只能承诺显式约束一致', '不得宣称能够命中用户未表达的审美答案']]
  ]);
  requireAll('工作流说明文档', contents.guide, [
    ['输入场景', ['自然语言', '参考图', '用户线框图', '高保真 Figma']],
    ['生成输入', ['`generation_packet`', '`business_contract`', '`structure_contract`', '`visual_contract`', '`component_plan`', '`layout_contract`']],
    ['线框边界', ['系统不主动生成线框图或文本分镜', '用户主动提供的线框图仍是合法结构输入']],
    ['保证边界', ['能够保证', '不能保证', '不能推断用户尚未表达的审美答案']],
    ['UI Kit 边界', ['UI Kit 继续只用于参考明确页面范式如何组合正式能力', '不因本流程改变职责']]
  ]);
  requireAll('业务迭代状态机实现', contents.stateMachine, [
    ['Schema v5', ['record.schemaVersion !== 5', 'schemaVersion: 5', 'brief_submission']],
    ['简报提交快照', ['record.brief_submission = createBriefSubmission(record)', '简报提交后范围已漂移']],
    ['失效清理', ['record.brief_submission = null']]
  ]);

  const combined = Object.values(contents).join('\n');
  for (const forbidden of [
    '--wireframe-generated-for-revision',
    '必须生成会话线框',
    '必须生成参考线框',
    '共同展示简报与线框',
    '文本分镜降级'
  ]) {
    if (combined.includes(forbidden)) errors.push(`多来源生成输入合同仍包含旧系统线框口径：${forbidden}`);
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
  errors.push(...validateProductGenerationInputContract(root));
  errors.push(...validateUxIterationContract(root));
  if (!productSkill.includes('../shared/references/design-decisions.md')) errors.push('wego-product/SKILL.md 必须直接引用共享设计决策原则');
  if (!designSkill.includes('../shared/references/design-decisions.md')) errors.push('wego-design/SKILL.md 必须直接引用共享设计决策原则');
  if (!designSkill.includes('临时 `generation_packet`') || !designSkill.includes('系统不生成线框图或文本分镜') || !designSkill.includes('用户主动提供的线框图只作为结构输入')) {
    errors.push('wego-design/SKILL.md 必须明确多来源生成输入和用户线框职责');
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
