#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const expectedSkills = new Set(['wego-product', 'wego-design', 'wego-uxsystem-iterate']);
const requiredHeadings = ['触发与职责边界', '必要输入与运行时入口', '输出契约与跨技能交接'];
const categories = new Set([
  'skill-entry', 'skill-runtime-flow', 'shared-principle', 'product-workflow', 'scene-contract', 'design-consumption',
  'component-contract', 'design-system', 'ui-kit', 'token', 'library-consumption', 'agents', 'script', 'test'
]);
const traceableRuleFiles = new Set([
  '.codex/skills/shared/references/design-decisions.md',
  '.codex/skills/wego-design/references/scene-contract.md'
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

export function validatePromotedRuleTargets(root, pool) {
  const errors = [];
  for (const candidate of pool.candidates || []) {
    if (candidate.status !== 'promoted') continue;
    const targets = [
      ['canonical', candidate.rule_ownership?.canonical],
      ['promotion_landing', candidate.promotion_landing]
    ];
    for (const [kind, target] of targets) {
      if (!target || !traceableRuleFiles.has(target.file)) continue;
      const expectedLocator = `rule-id: ${target.rule_id}`;
      if (!target.rule_id || target.locator !== expectedLocator) {
        errors.push(`候选 ${candidate.id} 的 ${kind} 必须精确定位 rule_id：${target.file}#${expectedLocator}`);
        continue;
      }
      const file = path.join(root, target.file);
      if (!fs.existsSync(file) || !markdownRuleIds(fs.readFileSync(file, 'utf8')).has(target.rule_id)) {
        errors.push(`候选 ${candidate.id} 的 ${kind} rule_id 未落地：${target.file}#${target.rule_id}`);
      }
    }
  }
  return errors;
}

export function validateProductWireframeContract(root = process.cwd()) {
  const errors = [];
  const productRoot = '.codex/skills/wego-product';
  const relativeFiles = {
    skill: `${productRoot}/SKILL.md`,
    method: `${productRoot}/references/conversation-wireframe.md`,
    trae: `${productRoot}/references/conversation-wireframe-trae.md`,
    codex: `${productRoot}/references/conversation-wireframe-codex.md`
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
    ['触发与跳过门禁', ['用户明确不要线框', '用户明确要求线框', '用户可见结构变化', '纯文案', '后端逻辑', '设计系统变化']],
    ['最小业务事实', ['用户目标', '业务入口', '页面首要任务', '主要操作', '用户可见结果', '必要状态']],
    ['临时模型', ['只存在于当前产品阶段上下文', '"schema_version": 1', '"flow_id"', '"control"', '"frames"']],
    ['单一控制概念', ['只能是 `stepper`、`tabs` 或 `toggle` 之一', '必须使用且只使用一个控制概念', '不组合 stepper、tabs']],
    ['拆帧边界', ['2–6 个', '超过 6 帧', '`target_frame_id` 必须引用当前模型中的帧']],
    ['更新门禁', ['线框失效', '`submit-brief` 前', '不得增加“线框已确认”']],
    ['双宿主', ['Trae 宿主', 'Codex 宿主', '共享本文件定义的临时模型']],
    ['无渲染器降级', ['没有可用渲染器', '不提示安装插件', '紧凑文本分镜', '[1/3 商品列表·默认]']],
    ['简报交接', ['`included` / `excluded`', '`entry_points`', '`critical_paths`', '`prototype_boundaries`', '`states`', '`data_contract`', '`assumptions`', '`open_questions`']],
    ['参考边界', ['需求探索参考', '不得机械照搬', '只有更新后的 Markdown `prototype_brief` 经用户明确确认后']]
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
  if (!productSkill.includes('../shared/references/design-decisions.md')) errors.push('wego-product/SKILL.md 必须直接引用共享设计决策原则');
  if (!designSkill.includes('../shared/references/design-decisions.md')) errors.push('wego-design/SKILL.md 必须直接引用共享设计决策原则');
  if (fs.existsSync(path.join(root, '.codex/skills/wego-design/references/design-decisions.md'))) errors.push('设计决策原则不得保留在 wego-design 私有 references 下');
  if (fs.existsSync(path.join(root, '.codex/skills/wego-uxsystem-iterate/references/high-fidelity-prototype-baseline.md'))) errors.push('重复的原型基线 reference 必须删除');
  const registryFile = '.codex/skills/wego-uxsystem-iterate/experience/authority-registry.json';
  const candidatesFile = '.codex/skills/wego-uxsystem-iterate/experience/candidates.json';
  let registry, pool;
  try { registry = JSON.parse(read(root, registryFile, errors)); } catch { errors.push('经验归属注册表 JSON 无法解析'); }
  try { pool = JSON.parse(read(root, candidatesFile, errors)); } catch { errors.push('经验候选池 JSON 无法解析'); }
  if (!registry || !pool) return errors;
  if (registry.schemaVersion !== 2 || !Array.isArray(registry.entryWhitelist)) errors.push('经验归属注册表必须使用 schemaVersion 2');
  if (new Set(Object.keys(registry.categories || {})).size !== categories.size || [...categories].some(category => !registry.categories?.[category])) errors.push('经验归属注册表必须定义当前十四类归属');
  if (pool.schemaVersion !== 2 || !Array.isArray(pool.candidates)) errors.push('经验候选池必须使用 schemaVersion 2 和 candidates 数组');
  for (const candidate of pool.candidates || []) {
    const ownership = candidate.rule_ownership;
    const canonical = ownership?.canonical;
    if (!categories.has(ownership?.category) || !canonical?.file || !canonical?.locator || !canonical?.rule_id) { errors.push(`候选 ${candidate.id} 缺少有效 rule_ownership`); continue; }
    const rule = registry.categories[ownership.category];
    if (!rule.paths.some(pattern => pathMatches(canonical.file, pattern))) errors.push(`候选 ${candidate.id} 指向错误归属路径：${canonical.file}`);
    if (canonical.file === '.codex/skills/shared/references/design-decisions.md' && ownership.category !== 'shared-principle') errors.push(`候选 ${candidate.id} 指向设计原则时必须使用 shared-principle 归属`);
    if (ownership.category === 'shared-principle' && canonical.file !== '.codex/skills/shared/references/design-decisions.md') errors.push(`候选 ${candidate.id} 的 shared-principle 归属只能落到共享设计原则`);
    const target = path.join(root, canonical.file);
    if (!fs.existsSync(target) || !locatorExists(root, canonical.file, canonical.locator)) errors.push(`候选 ${candidate.id} 的 canonical 定位无效：${canonical.file}#${canonical.locator}`);
    if (/wego-ux(?!system-iterate)|wego-tests|specs\/|interaction[_-]spec|design[_-]plan|design-decisions\.surface_designs|acceptance_report|acceptance-checks|browser-verification/.test(JSON.stringify(candidate))) errors.push(`候选 ${candidate.id} 仍引用已删除的工作流或规则字段`);
  }
  errors.push(...validatePromotedRuleTargets(root, pool));
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = validateSkillEntryBoundary();
  if (errors.length) { console.error(errors.map(error => `- ${error}`).join('\n')); process.exit(1); }
  console.log('Skill 入口与经验归属校验通过。');
}
