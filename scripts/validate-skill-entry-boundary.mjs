#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const expectedSkills = new Set(['wego-product', 'wego-design', 'wego-uxsystem-iterate']);
const requiredHeadings = ['触发与职责边界', '必要输入与运行时入口', '输出契约与跨技能交接'];
const categories = new Set(['skill-entry', 'skill-runtime-flow', 'component-contract', 'design-system', 'ui-kit', 'token', 'library-consumption', 'agents', 'script', 'test']);
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
    const links = new Set([...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(match => match[1].split('#')[0]).filter(Boolean));
    for (const link of links) if (!/^(?:https?:|mailto:)/.test(link) && !fs.existsSync(path.resolve(skillDir, link))) errors.push(`${name}/SKILL.md 链接不存在：${link}`);
    const references = path.join(skillDir, 'references');
    if (fs.existsSync(references)) for (const entry of fs.readdirSync(references).filter(file => file.endsWith('.md'))) if (!links.has(`references/${entry}`)) errors.push(`${name}/references/${entry} 未由 SKILL.md 直接引用`);
  }
  const productSkill = read(root, '.codex/skills/wego-product/SKILL.md', errors);
  const designSkill = read(root, '.codex/skills/wego-design/SKILL.md', errors);
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
  if (new Set(Object.keys(registry.categories || {})).size !== categories.size || [...categories].some(category => !registry.categories?.[category])) errors.push('经验归属注册表必须定义当前十类归属');
  if (pool.schemaVersion !== 2 || !Array.isArray(pool.candidates)) errors.push('经验候选池必须使用 schemaVersion 2 和 candidates 数组');
  for (const candidate of pool.candidates || []) {
    const ownership = candidate.rule_ownership;
    const canonical = ownership?.canonical;
    if (!categories.has(ownership?.category) || !canonical?.file || !canonical?.locator || !canonical?.rule_id) { errors.push(`候选 ${candidate.id} 缺少有效 rule_ownership`); continue; }
    const rule = registry.categories[ownership.category];
    if (!rule.paths.some(pattern => pathMatches(canonical.file, pattern))) errors.push(`候选 ${candidate.id} 指向错误归属路径：${canonical.file}`);
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
