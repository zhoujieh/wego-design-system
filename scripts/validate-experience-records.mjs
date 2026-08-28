#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const testing = args.includes('test');

const candidatePath = '.codex/skills/wego-uxsystem-iterate/experience/candidates.json';
const evidencePath = '.codex/skills/wego-uxsystem-iterate/experience/evidence.json';

const classes = new Set(['workflow-lesson', 'design-knowledge']);
const ownerSkills = new Set(['wego-product', 'wego-design', 'wego-uxsystem-iterate']);
const statuses = new Set(['observing', 'proposed', 'upgraded', 'stale', 'obsolete']);
const sources = new Set(['user-correction', 'rework', 'ci-failure', 'guard-block', 'acceptance-rejection', 'user-preference']);
const proposalReasons = new Set(['explicit-upgrade', 'post-upgrade-recurrence']);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseDate(value) {
  if (!isNonEmptyString(value)) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

function validateTargetAuthority(value, label, errors, required) {
  if (value == null) {
    if (required) errors.push(`${label}.targetAuthority 必须指向唯一权威位置`);
    return;
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${label}.targetAuthority 必须是 { path, anchor } 或 null`);
    return;
  }
  if (!isNonEmptyString(value.path)) errors.push(`${label}.targetAuthority.path 不能为空`);
  if (value.anchor != null && !isNonEmptyString(value.anchor)) errors.push(`${label}.targetAuthority.anchor 必须为字符串或 null`);
}

function readJson(root, relativePath, errors) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) {
    errors.push(`缺少 ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`${relativePath} 无法解析：${error.message}`);
    return null;
  }
}

function validate(root) {
  const errors = [];
  const warnings = [];
  const candidatesDoc = readJson(root, candidatePath, errors);
  const evidenceDoc = readJson(root, evidencePath, errors);
  if (!candidatesDoc || !evidenceDoc) return { errors, warnings, metrics: {} };

  if (candidatesDoc.schemaVersion !== 3) errors.push(`${candidatePath}.schemaVersion 必须为 3`);
  if (evidenceDoc.schemaVersion !== 2) errors.push(`${evidencePath}.schemaVersion 必须为 2`);
  if (!Array.isArray(candidatesDoc.candidates)) errors.push(`${candidatePath}.candidates 必须是数组`);
  if (!Array.isArray(evidenceDoc.events)) errors.push(`${evidencePath}.events 必须是数组`);
  if (errors.length) return { errors, warnings, metrics: {} };

  const eventsById = new Map();
  for (const event of evidenceDoc.events) {
    const label = `event:${event?.id ?? '<missing>'}`;
    if (!isNonEmptyString(event?.id)) {
      errors.push(`${label}.id 不能为空`);
      continue;
    }
    if (eventsById.has(event.id)) errors.push(`重复事实事件 id：${event.id}`);
    eventsById.set(event.id, event);
    if (!parseDate(event.date)) errors.push(`${label}.date 不是有效日期`);
    if (!isNonEmptyString(event.summary)) errors.push(`${label}.summary 不能为空`);
    if (!sources.has(event.source)) errors.push(`${label}.source 无效：${event.source}`);
    if (event.scene != null && !isNonEmptyString(event.scene)) errors.push(`${label}.scene 必须为字符串或省略`);
    if (!Array.isArray(event.tags) || event.tags.some(item => !isNonEmptyString(item))) {
      errors.push(`${label}.tags 必须是字符串数组`);
    }
  }

  const candidatesById = new Map();
  const referencedEvents = new Map();

  for (const candidate of candidatesDoc.candidates) {
    const label = `candidate:${candidate?.id ?? '<missing>'}`;
    if (!isNonEmptyString(candidate?.id)) {
      errors.push(`${label}.id 不能为空`);
      continue;
    }
    if (candidatesById.has(candidate.id)) errors.push(`重复经验 id：${candidate.id}`);
    candidatesById.set(candidate.id, candidate);

    if (!classes.has(candidate.class)) errors.push(`${label}.class 无效：${candidate.class}`);
    if (!ownerSkills.has(candidate.ownerSkill)) errors.push(`${label}.ownerSkill 无效：${candidate.ownerSkill}`);
    for (const field of ['title', 'lesson', 'action']) {
      if (!isNonEmptyString(candidate[field])) errors.push(`${label}.${field} 不能为空`);
    }
    if (!statuses.has(candidate.status)) errors.push(`${label}.status 无效：${candidate.status}`);

    if (candidate.status === 'proposed') {
      if (!proposalReasons.has(candidate.proposalReason)) errors.push(`${label}.proposalReason 无效`);
    } else if (candidate.proposalReason != null) {
      errors.push(`${label}.proposalReason 仅能在 proposed 状态使用`);
    }

    if (!Array.isArray(candidate.evidenceIds) || !candidate.evidenceIds.length) {
      errors.push(`${label}.evidenceIds 必须是非空数组`);
    } else {
      const uniqueIds = new Set(candidate.evidenceIds);
      if (uniqueIds.size !== candidate.evidenceIds.length) errors.push(`${label}.evidenceIds 存在重复`);
      for (const ref of candidate.evidenceIds) {
        const event = eventsById.get(ref);
        if (!event) errors.push(`${label}.evidenceIds 引用了不存在的事件：${ref}`);
        if (referencedEvents.has(ref) && referencedEvents.get(ref) !== candidate.id) {
          errors.push(`事实事件 ${ref} 被多个经验引用`);
        } else referencedEvents.set(ref, candidate.id);
      }
    }

    if (!Number.isInteger(candidate.occurrenceCount) || candidate.occurrenceCount < 1) {
      errors.push(`${label}.occurrenceCount 必须为正整数`);
    } else if (Array.isArray(candidate.evidenceIds) && candidate.occurrenceCount !== candidate.evidenceIds.length) {
      errors.push(`${label}.occurrenceCount 必须等于独立事实事件数量`);
    }

    if (!parseDate(candidate.firstObserved)) errors.push(`${label}.firstObserved 不是有效日期`);
    if (!parseDate(candidate.lastObserved)) errors.push(`${label}.lastObserved 不是有效日期`);
    if (!Array.isArray(candidate.tags) || candidate.tags.some(item => !isNonEmptyString(item))) {
      errors.push(`${label}.tags 必须是字符串数组`);
    }
    if (candidate.relatedRuleId != null && !isNonEmptyString(candidate.relatedRuleId)) {
      errors.push(`${label}.relatedRuleId 必须为字符串或 null`);
    }

    validateTargetAuthority(candidate.targetAuthority, label, errors, ['proposed', 'upgraded'].includes(candidate.status));

    if (!Array.isArray(candidate.upgradeHistory)) {
      errors.push(`${label}.upgradeHistory 必须是数组`);
      continue;
    }

    let latestUpgradeAt = null;
    candidate.upgradeHistory.forEach((upgrade, index) => {
      const upgradeLabel = `${label}.upgradeHistory[${index}]`;
      if (upgrade.version !== index + 1) errors.push(`${upgradeLabel}.version 必须按 1 递增`);
      const upgradedAt = parseDate(upgrade.upgradedAt);
      if (!upgradedAt) errors.push(`${upgradeLabel}.upgradedAt 不是有效日期`);
      else latestUpgradeAt = Math.max(latestUpgradeAt ?? upgradedAt, upgradedAt);
      if (!Array.isArray(upgrade.evidenceIds) || !upgrade.evidenceIds.length) errors.push(`${upgradeLabel}.evidenceIds 必须是非空数组`);
      else for (const ref of upgrade.evidenceIds) {
        if (!candidate.evidenceIds.includes(ref)) errors.push(`${upgradeLabel} 引用了不属于该经验的事件：${ref}`);
      }
      validateTargetAuthority(upgrade.targetAuthority, upgradeLabel, errors, true);
      if (!Array.isArray(upgrade.ruleIds) || !upgrade.ruleIds.length || upgrade.ruleIds.some(item => !isNonEmptyString(item))) {
        errors.push(`${upgradeLabel}.ruleIds 必须是非空字符串数组`);
      }
      if (!isNonEmptyString(upgrade.summary)) errors.push(`${upgradeLabel}.summary 不能为空`);
      if (!isNonEmptyString(upgrade.commitSha) || !/^[0-9a-f]{7,40}$/i.test(upgrade.commitSha)) {
        errors.push(`${upgradeLabel}.commitSha 必须是实际修复提交 SHA`);
      }
    });

    if (candidate.status === 'upgraded' && !candidate.upgradeHistory.length) {
      errors.push(`${label} 为 upgraded 但没有 upgradeHistory`);
    }

    if (latestUpgradeAt != null && Array.isArray(candidate.evidenceIds)) {
      const hasPostUpgradeEvent = candidate.evidenceIds.some(ref => {
        const time = parseDate(eventsById.get(ref)?.date);
        return time != null && time > latestUpgradeAt;
      });
      if (hasPostUpgradeEvent && !(candidate.status === 'proposed' && candidate.proposalReason === 'post-upgrade-recurrence')) {
        errors.push(`${label} 升级后已有新事实事件，必须立即回到 proposed`);
      }
      if (!hasPostUpgradeEvent && candidate.proposalReason === 'post-upgrade-recurrence') {
        errors.push(`${label} 标记为 post-upgrade-recurrence，但没有升级后的新事实事件`);
      }
    }
  }

  for (const event of evidenceDoc.events) {
    if (!referencedEvents.has(event.id)) warnings.push(`事实事件 ${event.id} 尚未被经验引用`);
  }

  return {
    errors,
    warnings,
    metrics: {
      candidates: candidatesDoc.candidates.length,
      events: evidenceDoc.events.length,
      upgraded: candidatesDoc.candidates.filter(item => item.status === 'upgraded').length,
      proposed: candidatesDoc.candidates.filter(item => item.status === 'proposed').length,
      stale: candidatesDoc.candidates.filter(item => item.status === 'stale').length,
      obsolete: candidatesDoc.candidates.filter(item => item.status === 'obsolete').length
    }
  };
}

function writeFixture(root, { status = 'observing', occurrenceCount = 1, proposalReason = null, upgradeHistory = [], events = null } = {}) {
  const experienceDir = path.join(root, '.codex/skills/wego-uxsystem-iterate/experience');
  fs.mkdirSync(experienceDir, { recursive: true });
  const fixtureEvents = events ?? [{
    id: 'evt-1',
    date: '2026-08-01',
    summary: '事实',
    source: 'user-correction',
    scene: 'fixture',
    tags: ['fixture']
  }];
  fs.writeFileSync(path.join(root, evidencePath), `${JSON.stringify({ schemaVersion: 2, events: fixtureEvents }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, candidatePath), `${JSON.stringify({
    schemaVersion: 3,
    candidates: [{
      id: 'exp-1',
      class: 'workflow-lesson',
      title: 'fixture',
      lesson: '教训',
      action: '以后怎么做',
      ownerSkill: 'wego-uxsystem-iterate',
      evidenceIds: fixtureEvents.map(item => item.id),
      occurrenceCount,
      firstObserved: '2026-08-01',
      lastObserved: '2026-08-01',
      tags: ['fixture'],
      targetAuthority: status === 'observing' ? null : { path: 'AGENTS.md', anchor: 'fixture-rule' },
      relatedRuleId: null,
      status,
      proposalReason,
      upgradeHistory
    }]
  }, null, 2)}\n`);
}

if (testing) {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-experience-'));
  try {
    writeFixture(fixture);
    if (validate(fixture).errors.length) throw new Error('有效 observing fixture 应通过');

    writeFixture(fixture);
    const invalidClass = JSON.parse(fs.readFileSync(path.join(fixture, candidatePath), 'utf8'));
    invalidClass.candidates[0].class = 'invalid';
    fs.writeFileSync(path.join(fixture, candidatePath), JSON.stringify(invalidClass, null, 2));
    if (!validate(fixture).errors.some(item => item.includes('class 无效'))) throw new Error('必须拦截无效 class');

    const history = [{
      version: 1,
      upgradedAt: '2026-08-02',
      evidenceIds: ['evt-1'],
      targetAuthority: { path: 'AGENTS.md', anchor: 'fixture-rule' },
      ruleIds: ['fixture-rule'],
      summary: '修复',
      commitSha: 'abcdef1'
    }];
    const recurrenceEvents = [
      { id: 'evt-1', date: '2026-08-01', summary: '首次', source: 'user-correction', scene: 'fixture', tags: ['fixture'] },
      { id: 'evt-2', date: '2026-08-03', summary: '复发', source: 'rework', scene: 'fixture', tags: ['fixture'] }
    ];
    writeFixture(fixture, { status: 'upgraded', occurrenceCount: 2, upgradeHistory: history, events: recurrenceEvents });
    if (!validate(fixture).errors.some(item => item.includes('必须立即回到 proposed'))) throw new Error('升级后复发必须重新 proposed');

    writeFixture(fixture, {
      status: 'proposed',
      occurrenceCount: 2,
      proposalReason: 'post-upgrade-recurrence',
      upgradeHistory: history,
      events: recurrenceEvents
    });
    if (validate(fixture).errors.length) throw new Error(`正确的升级后复发状态应通过：${validate(fixture).errors.join('；')}`);

    writeFixture(fixture, { status: 'stale', occurrenceCount: 1 });
    if (validate(fixture).errors.length) throw new Error('stale 状态应通过');
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
  console.log('经验数据验证测试通过');
  process.exit(0);
}

const report = validate(process.cwd());
if (jsonOutput) {
  console.log(JSON.stringify({ ...report, ok: report.errors.length === 0 }, null, 2));
} else {
  console.log(report.errors.length ? '经验数据验证失败' : '经验数据验证通过');
  for (const item of report.errors) console.error(`- ${item}`);
  for (const item of report.warnings) console.warn(`- ${item}`);
}
process.exit(report.errors.length ? 1 : 0);
