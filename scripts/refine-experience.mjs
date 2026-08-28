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
 *   4. 容量检查：总字符数不超过 3000
 *
 * Usage:
 *   node scripts/refine-experience.mjs --check
 *   node scripts/refine-experience.mjs --json
 */

import fs from 'node:fs';
import path from 'node:path';

const experienceDir = '.codex/skills/wego-uxsystem-iterate/experience';
const evidencePath = path.join(experienceDir, 'evidence.json');
const experiencePath = path.join(experienceDir, 'EXPERIENCE.md');
const CHAR_LIMIT = 3000;

const args = new Set(process.argv.slice(2));
const jsonOutput = args.has('--json');
// 默认就是 check 模式，--check 参数保留为显式声明
const checkOnly = true;

const report = {
  valid: true,
  errors: [],
  warnings: [],
  stats: { evidenceCount: 0, experienceCount: 0, charCount: 0 },
};

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
    const events = Array.isArray(doc.events) ? doc.events : [];
    report.stats.evidenceCount = events.length;
    return events;
  } catch (error) {
    fail(`evidence.json 解析失败：${error.message}`);
    return null;
  }
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
    fail(`EXPERIENCE.md 超过字符上限：${charCount}/${CHAR_LIMIT}（需 AI 合并或淘汰经验）`);
  } else if (charCount > CHAR_LIMIT * 0.8) {
    warn(`EXPERIENCE.md 容量接近上限：${charCount}/${CHAR_LIMIT}`);
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

  checkCapacity(content);

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
      console.log(`✓ 经验校验通过（${report.stats.experienceCount} 条经验，${report.stats.evidenceCount} 条事实，${report.stats.charCount} 字符）`);
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

main();
