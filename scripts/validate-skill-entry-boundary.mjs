#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const skillsRoot = path.join(root, '.codex', 'skills');
const workflowSkillPath = path.join(skillsRoot, 'wego-uxsystem-iterate', 'SKILL.md');
const workflowReferencePath = path.join(
  skillsRoot,
  'wego-uxsystem-iterate',
  'references',
  'workflow-iteration.md',
);

const errors = [];

function fail(message) {
  errors.push(message);
}

function read(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`缺少文件: ${path.relative(root, filePath)}`);
    return '';
  }
  return fs.readFileSync(filePath, 'utf8');
}

if (!fs.existsSync(skillsRoot)) {
  fail('缺少 .codex/skills 目录');
} else {
  for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const skillDir = path.join(skillsRoot, entry.name);
    const runtimeEntries = fs
      .readdirSync(skillDir, { withFileTypes: true })
      .filter(
        (item) =>
          item.isFile() &&
          /^SKILL(?:\.(?:runtime|core|override))?\.md$/u.test(item.name),
      )
      .map((item) => item.name);

    if (runtimeEntries.length !== 1 || runtimeEntries[0] !== 'SKILL.md') {
      fail(
        `${path.relative(root, skillDir)} 必须且只能保留一个运行时入口 SKILL.md，当前为: ${runtimeEntries.join(', ') || '无'}`,
      );
    }

    const skillPath = path.join(skillDir, 'SKILL.md');
    if (!fs.existsSync(skillPath)) continue;

    const content = read(skillPath);
    const lineCount = content.split(/\r?\n/u).length;
    if (lineCount >= 500) {
      fail(`${path.relative(root, skillPath)} 共 ${lineCount} 行，必须少于 500 行`);
    }

    const forbiddenHeading = /^#{2,6}\s+.*(?:案例|最佳实践|经验复盘|详细检查清单|同步矩阵)/gmu;
    const matches = [...content.matchAll(forbiddenHeading)].map((match) => match[0]);
    if (matches.length > 0) {
      fail(
        `${path.relative(root, skillPath)} 包含应迁移到 references 的章节: ${matches.join('；')}`,
      );
    }
  }
}

const workflowSkill = read(workflowSkillPath);
const requiredSkillMarkers = [
  '## SKILL.md 写入白名单',
  '触发条件',
  '职责边界',
  '必要输入',
  '输出契约',
  '跨技能交接',
  '经验正式升级时默认不得修改任何 `SKILL.md`',
];
for (const marker of requiredSkillMarkers) {
  if (!workflowSkill.includes(marker)) {
    fail(`wego-uxsystem-iterate/SKILL.md 缺少入口边界规则: ${marker}`);
  }
}

const workflowReference = read(workflowReferencePath);
const requiredReferenceMarkers = [
  '正式经验默认不得修改 `SKILL.md`',
  '对应技能的 `SKILL.md`',
  '对应技能中由 `SKILL.md` 直接引用的 `references/*.md`',
  '无法命中五项白名单时，禁止修改 `SKILL.md`',
];
for (const marker of requiredReferenceMarkers) {
  if (!workflowReference.includes(marker)) {
    fail(`workflow-iteration.md 缺少经验落点边界: ${marker}`);
  }
}

if (errors.length > 0) {
  console.error('Skill 入口权威边界校验失败：');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Skill 入口权威边界校验通过。');
