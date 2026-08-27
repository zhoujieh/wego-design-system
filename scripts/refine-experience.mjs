#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const candidatePath = '.codex/skills/wego-uxsystem-iterate/experience/candidates.json';
const outputPath = '.codex/skills/wego-uxsystem-iterate/experience/EXPERIENCE.md';
const CHAR_LIMIT = 3000;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseDate(value) {
  if (!isNonEmptyString(value)) return 0;
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

function main() {
  const root = process.cwd();
  const candidateFile = path.join(root, candidatePath);
  const outputFile = path.join(root, outputPath);

  if (!fs.existsSync(candidateFile)) {
    console.error('candidates.json 不存在');
    process.exit(1);
  }

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(candidateFile, 'utf8'));
  } catch (error) {
    console.error(`candidates.json 解析失败：${error.message}`);
    process.exit(1);
  }

  const candidates = Array.isArray(doc.candidates) ? doc.candidates : [];

  // 过滤 stale 和 obsolete
  const active = candidates.filter(item =>
    item.status === 'observing' || item.status === 'proposed' || item.status === 'upgraded'
  );

  // 排序：occurrenceCount 降序 → lastObserved 降序 → 跨场景优先
  active.sort((a, b) => {
    if (b.occurrenceCount !== a.occurrenceCount) return b.occurrenceCount - a.occurrenceCount;
    const dateA = parseDate(a.lastObserved);
    const dateB = parseDate(b.lastObserved);
    if (dateB !== dateA) return dateB - dateA;
    return 0;
  });

  if (active.length === 0) {
    const empty = `# 经验视图

> 从经验库自动提炼的高频高价值经验，会话前置读取。手动编辑会被下次提炼覆盖。

_暂无经验_
`;
    fs.writeFileSync(outputFile, empty);
    console.log('EXPERIENCE.md 已更新（暂无经验）');
    return;
  }

  const classLabel = {
    'workflow-lesson': '工作流',
    'design-knowledge': '设计'
  };

  let lines = [
    '# 经验视图',
    '',
    '> 从经验库自动提炼的高频高价值经验，会话前置读取。手动编辑会被下次提炼覆盖。',
    ''
  ];

  let charCount = lines.join('\n').length;
  let included = 0;
  let truncated = false;

  for (const item of active) {
    const label = classLabel[item.class] || item.class;
    const count = item.occurrenceCount;
    const last = item.lastObserved ? item.lastObserved.slice(0, 10) : '';
    const line = `- [${label}] ${item.title}：${item.action}（${count}次，最近${last}）`;
    const lineLen = line.length + 1; // +1 for newline

    if (charCount + lineLen > CHAR_LIMIT) {
      truncated = true;
      break;
    }

    lines.push(line);
    charCount += lineLen;
    included++;
  }

  if (truncated) {
    lines.push('');
    lines.push(`_仅显示前 ${included} 条，共 ${active.length} 条活跃经验_`);
  }

  lines.push('');
  const content = lines.join('\n');
  fs.writeFileSync(outputFile, content);
  console.log(`EXPERIENCE.md 已更新（${included}/${active.length} 条，${content.length} 字符）`);
}

main();
