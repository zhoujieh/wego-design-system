#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const HEADINGS = ['触发与职责边界', '必要输入与运行时入口', '输出契约与跨技能交接'];
const ENTRY_SCOPES = new Set(['trigger', 'responsibility', 'input', 'output', 'handoff']);
const FORBIDDEN = /案例|最佳实践|经验复盘|检查清单|组件规则|页面规则/u;
const CATEGORIES = new Set(['skill-entry', 'skill-runtime-flow', 'component-contract', 'design-system', 'ui-kit', 'token', 'library-consumption', 'agents', 'script', 'test']);
const BASELINE_REL = '.codex/skills/wego-uxsystem-iterate/references/high-fidelity-prototype-baseline.md';
const BASELINE_LINK = '../wego-uxsystem-iterate/references/high-fidelity-prototype-baseline.md';

const read = (root, rel, errors) => {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) { errors.push(`缺少文件：${rel}`); return ''; }
  return fs.readFileSync(file, 'utf8');
};
const matches = (value, pattern) => new RegExp(`^${pattern.split('*').map(part => part.replace(/[|\\{}()[\]^$+?.]/gu, '\\$&')).join('[^/]*')}$`, 'u').test(value);
const jsonPointerExists = (value, pointer) => {
  if (!pointer.startsWith('/')) return false;
  for (const key of pointer.slice(1).split('/')) {
    if (value === null || value === undefined || !Object.hasOwn(value, key)) return false;
    value = value[key];
  }
  return true;
};
function locatorExists(root, file, locator, errors) {
  const content = read(root, file, errors);
  if (!content) return false;
  if (file.endsWith('.json') && locator.startsWith('/')) {
    try { return jsonPointerExists(JSON.parse(content), locator); }
    catch { return false; }
  }
  return content.includes(locator);
}

export function validateSkillEntryBoundary(root = process.cwd()) {
  const errors = [];
  const baseline = read(root, BASELINE_REL, errors);
  for (const phrase of ['wego-product → wego-design → wego-ux → wego-tests', 'prototype_brief', '不得补造业务事实', '不得发明组件', '禁止兼容、回退、双轨字段和旧入口', '变更门禁']) {
    if (!baseline.includes(phrase)) errors.push(`高保真原型基线缺少不可变规则：${phrase}`);
  }
  const skillsRoot = path.join(root, '.codex/skills');
  if (!fs.existsSync(skillsRoot)) return ['缺少 .codex/skills 目录'];
  const skills = fs.readdirSync(skillsRoot, { withFileTypes: true }).filter(item => item.isDirectory() && item.name.startsWith('wego-')).map(item => item.name).sort();
  for (const name of skills) {
    const rel = `.codex/skills/${name}`;
    const absolute = path.join(root, rel);
    const entries = fs.readdirSync(absolute, { withFileTypes: true });
    const runtime = entries.filter(item => item.isFile() && /^SKILL(?:\.(?:runtime|core|override))?\.md$/u.test(item.name)).map(item => item.name);
    if (runtime.length !== 1 || runtime[0] !== 'SKILL.md') errors.push(`${rel} 必须且只能保留 SKILL.md 入口`);
    const content = read(root, `${rel}/SKILL.md`, errors);
    if (!content) continue;
    if (['wego-product', 'wego-design', 'wego-ux', 'wego-tests'].includes(name) && !content.includes(BASELINE_LINK)) errors.push(`${rel}/SKILL.md 必须引用高保真原型基线`);
    if (name === 'wego-uxsystem-iterate' && !content.includes('references/high-fidelity-prototype-baseline.md')) errors.push(`${rel}/SKILL.md 必须引用高保真原型基线`);
    if (content.split(/\r?\n/u).length > 120) errors.push(`${rel}/SKILL.md 超出入口信息预算`);
    if (FORBIDDEN.test(content)) errors.push(`${rel}/SKILL.md 包含禁止的经验、案例或领域规则内容`);
    const headings = [...content.matchAll(/^##\s+(.+)$/gmu)].map(match => match[1].trim());
    if (headings.length !== HEADINGS.length || headings.some((heading, index) => heading !== HEADINGS[index])) errors.push(`${rel}/SKILL.md 只能包含入口白名单章节`);
    if (/^#{3,}/mu.test(content)) errors.push(`${rel}/SKILL.md 不得扩展三级标题`);
    const links = new Set([...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/gu)].map(match => match[1].split('#')[0]).filter(Boolean));
    for (const link of links) if (!/^(?:https?:|mailto:)/u.test(link) && !fs.existsSync(path.resolve(absolute, link))) errors.push(`${rel}/SKILL.md 链接不存在：${link}`);
    const referenceDir = path.join(absolute, 'references');
    if (fs.existsSync(referenceDir)) for (const file of fs.readdirSync(referenceDir).filter(file => file.endsWith('.md'))) if (!links.has(`references/${file}`)) errors.push(`${rel}/references/${file} 未由 SKILL.md 直接链接`);
  }

  const registryRel = '.codex/skills/wego-uxsystem-iterate/experience/authority-registry.json';
  const candidatesRel = '.codex/skills/wego-uxsystem-iterate/experience/candidates.json';
  let registry, pool;
  try { registry = JSON.parse(read(root, registryRel, errors)); } catch { errors.push(`${registryRel} JSON 无法解析`); }
  try { pool = JSON.parse(read(root, candidatesRel, errors)); } catch { errors.push(`${candidatesRel} JSON 无法解析`); }
  if (!registry || !pool) return errors;
  if (registry.schemaVersion !== 2) errors.push('经验归属注册表必须使用 schemaVersion 2');
  const categories = new Set(Object.keys(registry.categories || {}));
  if (categories.size !== CATEGORIES.size || [...CATEGORIES].some(category => !categories.has(category))) errors.push('经验归属注册表必须且只能定义十类正式归属');
  if (pool.schemaVersion !== 2 || !Array.isArray(pool.candidates)) return [...errors, '经验候选池必须使用当前 schemaVersion 2 和 candidates 数组'];
  const ids = new Set(), keys = new Set(), ruleIds = new Set();
  for (const [index, item] of pool.candidates.entries()) {
    const at = `candidates[${index}]`;
    for (const field of ['id', 'normalized_key', 'title', 'status', 'primary_owner', 'ownership_reason', 'created_at', 'updated_at']) if (typeof item?.[field] !== 'string' || !item[field].trim()) errors.push(`${at}.${field} 必须为非空字符串`);
    if (ids.has(item?.id)) errors.push(`${at}.id 重复：${item.id}`); ids.add(item?.id);
    if (keys.has(item?.normalized_key)) errors.push(`${at}.normalized_key 重复：${item.normalized_key}`); keys.add(item?.normalized_key);
    if (!Array.isArray(item?.secondary_owners) || !Array.isArray(item?.evidence)) errors.push(`${at} 缺少 secondary_owners 或 evidence 数组`);
    if (!Number.isInteger(item?.occurrence_count) || item.occurrence_count < 1 || !Number.isInteger(item?.threshold) || item.threshold < 1) errors.push(`${at} 次数或阈值非法`);
    if (!['observing', 'awaiting-confirmation', 'promoted', 'rejected'].includes(item?.status)) errors.push(`${at}.status 非法`);
    if (item?.status === 'observing' && item.occurrence_count >= item.threshold) errors.push(`${at} 达到阈值后必须等待确认或处理`);
    if (item?.status === 'awaiting-confirmation' && item.occurrence_count < item.threshold) errors.push(`${at} 未达到阈值不能等待确认`);
    if (item?.status === 'promoted' && item.occurrence_count < item.threshold) errors.push(`${at} 已升级但未达到阈值`);
    const ownership = item?.rule_ownership, canonical = ownership?.canonical, category = ownership?.category;
    if (!categories.has(category) || !canonical?.file || !canonical?.locator || !canonical?.rule_id) { errors.push(`${at}.rule_ownership 不完整或归属类别非法`); continue; }
    if (ruleIds.has(canonical.rule_id)) errors.push(`${at} 与其他候选重复 rule_id：${canonical.rule_id}`); ruleIds.add(canonical.rule_id);
    const rule = registry.categories[category];
    if (!rule.paths.some(pattern => matches(canonical.file, pattern))) errors.push(`${at} 将 ${category} 写入错误正式来源：${canonical.file}`);
    if (!locatorExists(root, canonical.file, canonical.locator, errors)) errors.push(`${at} 的正式定位无效：${canonical.file}#${canonical.locator}`);
    if (category === 'skill-entry') {
      if (!ENTRY_SCOPES.has(ownership.entry_scope)) errors.push(`${at} 修改 SKILL.md 时必须声明五项入口白名单`);
    } else if (ownership.entry_scope) errors.push(`${at} 非 skill-entry 归属不得声明入口白名单`);
    if (JSON.stringify(item).includes('migration_exception_reason') || JSON.stringify(item).includes('formal_rule')) errors.push(`${at} 含已废弃的迁移或双重正式规则字段`);
    const reach = item?.runtime_reachability;
    if (!reach || ['consumer_skill', 'output_field', 'downstream_consumer', 'acceptance_check'].some(field => typeof reach[field] !== 'string' || !reach[field])) errors.push(`${at}.runtime_reachability 不完整`);
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = validateSkillEntryBoundary();
  if (errors.length) {
    console.error('Skill 入口与经验归属校验失败：');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('Skill 入口与经验归属校验通过。');
}
