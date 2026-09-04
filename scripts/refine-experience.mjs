#!/usr/bin/env node

/**
 * refine-experience.mjs
 *
 * 经验一致性校验工具（不生成内容）。
 *
 * EXPERIENCE.md 由 wego-uxsystem-iterate 技能内的 AI 基于 evidence.json
 * 事实推理维护，本脚本只做校验：
 *   1. 事实追溯：每条经验引用的 evidence ID 必须存在于 evidence.json
 *   2. 表述一致性：经验描述不得与对应事实存在明显矛盾
 *   3. 格式合规：用 § 分隔，每条非空，头部说明完整
 *   4. 容量检查：核心摘要总字符数不超过 CHAR_LIMIT（细节应毕业到场景技能）
 *   5. 经验质量门：qualityGateSince 起的新事实必须具备结构化因果与验证字段
 *   6. 场景技能：.codex/skills/wego-scene-* 必须具备合规 frontmatter，
 *      且正文中引用的 evidence ID 必须存在
 *
 * 另提供只读查询，供沉淀时按关键词取相关事实、避免全量读取 evidence.json：
 *   node scripts/refine-experience.mjs --related <关键词...>
 *
 * Usage:
 *   node scripts/refine-experience.mjs --check
 *   node scripts/refine-experience.mjs --json
 *   node scripts/refine-experience.mjs --related 设计稿 modal
 */

import fs from 'node:fs';
import path from 'node:path';

const skillsRoot = '.codex/skills';
const experienceDir = path.join(skillsRoot, 'wego-uxsystem-iterate', 'experience');
const evidencePath = path.join(experienceDir, 'evidence.json');
const experiencePath = path.join(experienceDir, 'EXPERIENCE.md');
const CHAR_LIMIT = 1500;
// 指针上限：L2 摘要正文（不含 ev ID 与次数/日期计数）超过该长度视为展开细节，
// 若该主题已毕业到场景技能则报错要求降载。
const POINTER_LIMIT = 60;
const SCENE_SKILL_PREFIX = 'wego-scene-';

const rawArgs = process.argv.slice(2);

// ───────────────────────── 只读查询：--related ─────────────────────────

function runRelated(keywords) {
  if (!fs.existsSync(evidencePath)) {
    console.error(`evidence.json 不存在：${evidencePath}`);
    process.exit(1);
  }
  let events;
  try {
    events = JSON.parse(fs.readFileSync(evidencePath, 'utf8')).events || [];
  } catch (error) {
    console.error(`evidence.json 解析失败：${error.message}`);
    process.exit(1);
  }
  const kws = keywords.map((k) => k.toLowerCase());
  const matched = events.filter((e) => {
    const haystack = [e.summary, e.scene, ...(e.tags || [])]
      .filter(Boolean).join(' ').toLowerCase();
    return kws.some((k) => haystack.includes(k));
  });
  if (matched.length === 0) {
    console.log(`无匹配事实事件（关键词：${keywords.join('、')}），全库共 ${events.length} 条。`);
    return;
  }
  console.log(`匹配 ${matched.length}/${events.length} 条事实事件：\n`);
  for (const e of matched) {
    console.log(`- ${e.id}｜${e.date}｜${e.source}｜scene: ${e.scene || '-'}`);
    console.log(`  ${e.summary}`);
    if (e.mechanism) console.log(`  机制: ${e.mechanism}`);
    if (e.rule) console.log(`  规则: ${e.rule}`);
    if (e.scope?.length) console.log(`  边界: ${e.scope.join(', ')}`);
    if (e.verification?.length) console.log(`  验证: ${e.verification.join('；')}`);
    if (e.novelty) console.log(`  去重: ${e.novelty}`);
    if (e.tags?.length) console.log(`  tags: ${e.tags.join(', ')}`);
    console.log('');
  }
}

const relatedIndex = rawArgs.indexOf('--related');
if (relatedIndex !== -1) {
  const keywords = rawArgs.slice(relatedIndex + 1)
    .filter((a) => !a.startsWith('--'));
  if (keywords.length === 0) {
    console.error('--related 需要至少一个关键词');
    process.exit(1);
  }
  runRelated(keywords);
  process.exit(0);
}

// ───────────────────────── 校验模式 ─────────────────────────

const args = new Set(rawArgs);
const jsonOutput = args.has('--json');
// 默认就是 check 模式，--check 参数保留为显式声明
const checkOnly = true;

const report = {
  valid: true,
  errors: [],
  warnings: [],
  stats: { evidenceCount: 0, qualityGatedCount: 0, experienceCount: 0, charCount: 0, sceneSkillCount: 0 },
};
let evidenceDocument = null;

function fail(message) {
  report.valid = false;
  report.errors.push(message);
}

function warn(message) {
  report.warnings.push(message);
}

function loadEvidence() {
  if (!fs.existsSync(evidencePath)) {
    fail(`evidence.json 不存在：${evidencePath}`);
    return null;
  }
  try {
    const doc = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    evidenceDocument = doc;
    const events = Array.isArray(doc.events) ? doc.events : [];
    report.stats.evidenceCount = events.length;
    return events;
  } catch (error) {
    fail(`evidence.json 解析失败：${error.message}`);
    return null;
  }
}

function eventOrdinal(id) {
  const match = String(id || '').match(/^ev-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function experienceQualityIssues(event) {
  const issues = [];
  if (event.kind !== 'experience') issues.push('kind 必须为 experience，需求/普通缺陷不得进入 evidence');
  for (const field of ['observation', 'mechanism', 'rule', 'novelty']) {
    if (typeof event[field] !== 'string' || event[field].trim().length < 8) issues.push(`缺少有效质量字段 ${field}`);
  }
  for (const field of ['scope', 'verification']) {
    if (!Array.isArray(event[field]) || event[field].length === 0 || event[field].some(item => typeof item !== 'string' || !item.trim())) {
      issues.push(`缺少有效质量字段 ${field}[]`);
    }
  }
  return issues;
}

/** qualityGateSince 起只接受可验证的结构化因果经验；脚本校验字段，不代替 AI 的语义判断。 */
function checkExperienceQuality(events) {
  const ids = new Set();
  for (const event of events) {
    if (!event.id || ids.has(event.id)) fail(`evidence ID 缺失或重复：${event.id || '(empty)'}`);
    ids.add(event.id);
  }
  const sinceId = evidenceDocument && evidenceDocument.qualityGateSince;
  if (!sinceId) {
    warn('evidence.json 未设置 qualityGateSince；历史 schema 兼容，但新经验不会执行结构化质量门');
    return;
  }
  const since = eventOrdinal(sinceId);
  if (since === null || !ids.has(sinceId)) {
    fail(`qualityGateSince 无效或未命中事件：${sinceId}`);
    return;
  }
  const gated = events.filter(event => {
    const ordinal = eventOrdinal(event.id);
    return ordinal !== null && ordinal >= since;
  });
  report.stats.qualityGatedCount = gated.length;
  gated.forEach(event => {
    const label = event.id || '(unknown)';
    experienceQualityIssues(event).forEach(issue => fail(`${label} ${issue}`));
  });
}

function runQualitySelfTest() {
  const valid = {
    kind: 'experience',
    observation: '同类失败在独立任务中可以被观察和复现',
    mechanism: '失败由稳定且可解释的机制触发',
    rule: '命中该条件时必须执行可操作的预防动作',
    scope: ['跨任务测试场景'],
    verification: ['修复前失败且修复后通过'],
    novelty: '已查询现有权威源且没有同义规则',
  };
  const requirementOnly = { ...valid, kind: 'requirement' };
  const missingMechanism = { ...valid, mechanism: '' };
  const failures = [];
  if (experienceQualityIssues(valid).length !== 0) failures.push('合格结构化经验被错误拒绝');
  if (experienceQualityIssues(requirementOnly).length === 0) failures.push('需求记录未被拒绝');
  if (experienceQualityIssues(missingMechanism).length === 0) failures.push('缺少机制的记录未被拒绝');
  if (jsonOutput) {
    console.log(JSON.stringify({
      errors: failures.map(message => ({ code: 'experience.quality_self_test', message })),
      warnings: [],
      info: [],
      metrics: { cases: 3, passed: 3 - failures.length },
    }, null, 2));
  } else {
    console.log(failures.length ? `✗ 经验质量门自测失败：${failures.join('；')}` : '✓ 经验质量门自测通过（合格经验放行、需求记录与缺失机制记录拒绝）');
  }
  process.exit(failures.length ? 1 : 0);
}

function loadExperience() {
  if (!fs.existsSync(experiencePath)) {
    fail(`EXPERIENCE.md 不存在：${experiencePath}`);
    return null;
  }
  return fs.readFileSync(experiencePath, 'utf8');
}

function parseEntries(content) {
  // 去掉头部说明（第一个 § 之前的内容），按 § 分隔
  const sections = content.split('§').map((s) => s.trim()).filter(Boolean);
  // 第一个 section 是头部说明，后面的是经验条目
  if (sections.length === 0) return [];
  return sections.slice(1);
}

function extractEvidenceIds(entry) {
  // 支持 [ev-001] 和 [ev-001, ev-002] 两种格式
  const bracketMatches = entry.match(/\[([^\]]+)\]/g);
  if (!bracketMatches) return [];
  const ids = [];
  for (const bracket of bracketMatches) {
    const inner = bracket.slice(1, -1);
    const parts = inner.split(',').map((s) => s.trim());
    for (const part of parts) {
      if (/^ev-\d+$/.test(part)) ids.push(part);
    }
  }
  return ids;
}

// 摘要正文：去掉 ev ID 引用段，只取「教训」本体
function pointerBody(entry) {
  const idx = entry.indexOf('[ev-');
  if (idx === -1) return entry.trim();
  return entry.slice(0, idx).trim();
}

// 收集已存在场景技能引用的 ev ID（用于"固化即降载"判断）
function collectSceneSkillEvIds() {
  const map = new Map();
  if (!fs.existsSync(skillsRoot)) return map;
  const dirs = fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith(SCENE_SKILL_PREFIX));
  for (const d of dirs) {
    const skillPath = path.join(skillsRoot, d.name, 'SKILL.md');
    if (!fs.existsSync(skillPath)) continue;
    const body = fs.readFileSync(skillPath, 'utf8');
    const ids = [...new Set([...body.matchAll(/ev-\d+/g)].map((m) => m[0]))];
    map.set(d.name, new Set(ids));
  }
  return map;
}

function checkFormat(content) {
  if (!content.trim()) {
    fail('EXPERIENCE.md 为空');
    return;
  }
  if (!content.includes('§')) {
    fail('EXPERIENCE.md 缺少 § 分隔符（无经验条目时也应保留头部说明）');
  }
  if (!content.startsWith('# 经验视图')) {
    fail('EXPERIENCE.md 头部缺少「# 经验视图」标题');
  }
  if (!content.includes('evidence.json')) {
    warn('EXPERIENCE.md 头部说明未提及 evidence.json（建议说明经验基于事实事件维护）');
  }
}

function checkEvidenceTrace(entries, events) {
  const validIds = new Set(events.map((e) => e.id));
  entries.forEach((entry, index) => {
    const ids = extractEvidenceIds(entry);
    if (ids.length === 0) {
      fail(`经验条目 #${index + 1} 未引用任何 evidence ID（格式：[ev-001]）`);
      return;
    }
    ids.forEach((id) => {
      if (!validIds.has(id)) {
        fail(`经验条目 #${index + 1} 引用了不存在的 evidence ID：${id}`);
      }
    });
  });
}

function checkConsistency(entries, events) {
  const eventMap = new Map(events.map((e) => [e.id, e]));
  entries.forEach((entry, index) => {
    const ids = extractEvidenceIds(entry);
    ids.forEach((id) => {
      const event = eventMap.get(id);
      if (!event) return; // 已在 checkEvidenceTrace 中报错
      // 简单矛盾检测：经验中出现"禁止/不要/不得"但事实中明确说"允许/可以/应该"
      const negativeWords = ['禁止', '不要', '不得', '不能', '错误', '失败'];
      const positiveWords = ['允许', '可以', '应该', '正确', '成功'];
      const entryNeg = negativeWords.some((w) => entry.includes(w));
      const eventPos = positiveWords.some((w) => event.summary.includes(w));
      if (entryNeg && eventPos) {
        warn(`经验条目 #${index + 1} 与事实 ${id} 可能存在表述矛盾，建议人工复核`);
      }
    });
  });
}

function checkCapacity(content) {
  const charCount = content.length;
  report.stats.charCount = charCount;
  if (charCount > CHAR_LIMIT) {
    fail(`EXPERIENCE.md 超过核心摘要上限：${charCount}/${CHAR_LIMIT}（细节应毕业到 wego-scene-* 场景技能或合并同类条目）`);
  } else if (charCount > CHAR_LIMIT * 0.8) {
    warn(`EXPERIENCE.md 摘要容量接近上限：${charCount}/${CHAR_LIMIT}；先检查已固化条目（场景技能/正式规则）是否已从摘要降载，再考虑合并同类`);
  }
}

// 固化即降载：主题已毕业到场景技能时，L2 摘要必须是指针形式（正文 ≤ POINTER_LIMIT）
function checkSceneSkillDownshift(entries) {
  const sceneSkills = collectSceneSkillEvIds();
  if (sceneSkills.size === 0) return;
  entries.forEach((entry, index) => {
    const ids = extractEvidenceIds(entry);
    for (const [skillName, skillIds] of sceneSkills) {
      const overlap = ids.filter((id) => skillIds.has(id));
      if (overlap.length === 0) continue;
      const body = pointerBody(entry);
      if (body.length > POINTER_LIMIT) {
        fail(`经验条目 #${index + 1} 已固化到场景技能 ${skillName}（ev: ${overlap.join(', ')}），摘要正文 ${body.length} 字符超过指针上限 ${POINTER_LIMIT}；请压缩为「…，详见 ${skillName}」指针，细节留在场景技能`);
      }
    }
  });
}

// 场景技能校验：结构合规 + evidence 追溯（当前无场景技能时自然跳过）
function checkSceneSkills(validIds) {
  if (!fs.existsSync(skillsRoot)) return;
  const sceneDirs = fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith(SCENE_SKILL_PREFIX))
    .map((d) => d.name);
  report.stats.sceneSkillCount = sceneDirs.length;
  for (const dir of sceneDirs) {
    const skillPath = path.join(skillsRoot, dir, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      fail(`场景技能 ${dir} 缺少 SKILL.md`);
      continue;
    }
    const body = fs.readFileSync(skillPath, 'utf8');
    const fm = body.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) {
      fail(`场景技能 ${dir}/SKILL.md 缺少 frontmatter（name/description）`);
      continue;
    }
    if (!/^name:\s*.+/m.test(fm[1])) fail(`场景技能 ${dir} frontmatter 缺少 name`);
    if (!/^description:\s*.+/m.test(fm[1])) fail(`场景技能 ${dir} frontmatter 缺少 description（可观察触发信号）`);
    const ids = [...body.matchAll(/ev-\d+/g)].map((m) => m[0]);
    for (const id of new Set(ids)) {
      if (!validIds.has(id)) fail(`场景技能 ${dir} 引用了不存在的 evidence ID：${id}`);
    }
  }
}

function main() {
  const events = loadEvidence();
  const content = loadExperience();

  if (events === null || content === null) {
    return finish(1);
  }

  checkFormat(content);
  const entries = parseEntries(content);
  report.stats.experienceCount = entries.length;

  if (entries.length > 0) {
    checkEvidenceTrace(entries, events);
    checkConsistency(entries, events);
  }

  checkExperienceQuality(events);
  checkCapacity(content);
  checkSceneSkills(new Set(events.map((e) => e.id)));
  checkSceneSkillDownshift(entries);

  return finish(report.valid ? 0 : 1);
}

function finish(code) {
  if (jsonOutput) {
    // 兼容 validate-wego-design.mjs 的 parse 格式
    console.log(JSON.stringify({
      errors: report.errors,
      warnings: report.warnings,
      info: [],
      metrics: report.stats,
    }, null, 2));
  } else {
    if (report.valid) {
      console.log(`✓ 经验校验通过（${report.stats.experienceCount} 条摘要，${report.stats.evidenceCount} 条事实，其中 ${report.stats.qualityGatedCount} 条通过结构化质量门，${report.stats.sceneSkillCount} 个场景技能，${report.stats.charCount} 字符）`);
    } else {
      console.log(`✗ 经验校验失败（${report.errors.length} 个错误）`);
      report.errors.forEach((e) => console.log(`  - ${e}`));
    }
    if (report.warnings.length > 0) {
      console.log(`\n⚠ ${report.warnings.length} 个警告：`);
      report.warnings.forEach((w) => console.log(`  - ${w}`));
    }
  }
  process.exit(code);
}

if (args.has('--self-test-quality')) runQualitySelfTest();
main();
