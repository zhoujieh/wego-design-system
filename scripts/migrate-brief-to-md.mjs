#!/usr/bin/env node

/**
 * 现有迭代迁移脚本：
 * 1. 把 iteration.json 中的 prototype_brief 导出为 spec.md
 * 2. 增加 brief_file 字段
 * 3. 状态 awaiting-brief-confirmation → in-development
 *
 * 用法：node scripts/migrate-brief-to-md.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dryRun = process.argv.includes('--dry-run');

function findIterations(baseDir) {
  const results = [];
  if (!fs.existsSync(baseDir)) return results;
  for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
    const target = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_iterations') {
        for (const iterEntry of fs.readdirSync(target, { withFileTypes: true })) {
          if (iterEntry.isDirectory()) {
            const iterFile = path.join(target, iterEntry.name, 'iteration.json');
            if (fs.existsSync(iterFile)) results.push(iterFile);
          }
        }
      } else {
        results.push(...findIterations(target));
      }
    }
  }
  return results;
}

function briefToMarkdown(record) {
  const brief = record.prototype_brief || {};
  const id = record.identity?.iteration_id || 'unknown';
  const title = record.identity?.title || '未命名';
  const date = record.identity?.date || new Date().toISOString().slice(0, 10);
  const scene = record.identity?.primary_scene || '';
  const related = (record.identity?.related_scenes || []).join('、') || '无';

  const lines = [];
  lines.push(`# ${title} 需求规格说明`);
  lines.push('');
  lines.push('## 元信息');
  lines.push('');
  lines.push(`- **迭代 ID**：${id}`);
  lines.push(`- **主场景**：${scene}`);
  lines.push(`- **关联场景**：${related}`);
  lines.push(`- **创建日期**：${date}`);
  lines.push(`- **状态**：${record.status}`);
  lines.push('- **输入来源**：');
  lines.push('');
  lines.push('---');
  lines.push('');

  // goal
  lines.push('## 目标（goal）');
  lines.push('');
  lines.push(brief.goal || '');
  lines.push('');
  lines.push('---');
  lines.push('');

  // included
  lines.push('## 纳入范围（included）');
  lines.push('');
  if (Array.isArray(brief.included) && brief.included.length) {
    brief.included.forEach(item => lines.push(`- ${item}`));
  } else {
    lines.push('- {待填写}');
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // excluded
  lines.push('## 不纳入范围（excluded）');
  lines.push('');
  if (Array.isArray(brief.excluded) && brief.excluded.length) {
    brief.excluded.forEach(item => lines.push(`- ${item}`));
  } else {
    lines.push('- {待填写}');
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // entry_points
  lines.push('## 入口（entry_points）');
  lines.push('');
  if (Array.isArray(brief.entry_points) && brief.entry_points.length) {
    brief.entry_points.forEach(item => lines.push(`- ${item}`));
  } else {
    lines.push('- {待填写}');
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // critical_paths
  lines.push('## 关键路径（critical_paths）');
  lines.push('');
  if (Array.isArray(brief.critical_paths) && brief.critical_paths.length) {
    brief.critical_paths.forEach(item => lines.push(`- ${item}`));
  } else {
    lines.push('- {待填写}');
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // prototype_boundaries
  lines.push('## 原型边界（prototype_boundaries）');
  lines.push('');
  if (Array.isArray(brief.prototype_boundaries) && brief.prototype_boundaries.length) {
    brief.prototype_boundaries.forEach(b => {
      lines.push(`### ${b.flow_id}`);
      lines.push('');
      lines.push(`- mode: ${b.mode}`);
      lines.push(`- visible_result: ${b.visible_result}`);
      lines.push('');
    });
  } else {
    lines.push('### {flow-id}');
    lines.push('');
    lines.push('- mode: functional');
    lines.push('- visible_result: {待填写}');
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  // states
  lines.push('## 状态（states）');
  lines.push('');
  if (Array.isArray(brief.states) && brief.states.length) {
    brief.states.forEach(item => lines.push(`- ${item}`));
  } else {
    lines.push('- 默认主态：{进入条件} → {可感知结果}');
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // data_contract
  lines.push('## 数据契约（data_contract）');
  lines.push('');
  if (brief.data_contract && typeof brief.data_contract === 'object' && Object.keys(brief.data_contract).length) {
    for (const [entityName, entityData] of Object.entries(brief.data_contract)) {
      lines.push(`### ${entityName}`);
      lines.push('');
      if (typeof entityData === 'object' && entityData !== null) {
        for (const [key, val] of Object.entries(entityData)) {
          lines.push(`- ${key}: ${typeof val === 'object' ? JSON.stringify(val) : val}`);
        }
      } else {
        lines.push(`- 值: ${entityData}`);
      }
      lines.push('');
    }
  } else {
    lines.push('### {数据实体}');
    lines.push('');
    lines.push('- 字段: {待填写}');
    lines.push('- 产生入口: {待填写}');
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  // assumptions
  lines.push('## 假设（assumptions）');
  lines.push('');
  if (Array.isArray(brief.assumptions) && brief.assumptions.length) {
    brief.assumptions.forEach(item => lines.push(`- ${item}`));
  } else {
    lines.push('- {待填写}');
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // open_questions
  lines.push('## 待确认问题（open_questions）');
  lines.push('');
  if (Array.isArray(brief.open_questions) && brief.open_questions.length) {
    brief.open_questions.forEach(item => lines.push(`- ${item}`));
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Clarifications
  lines.push('## 澄清记录（Clarifications）');
  lines.push('');
  lines.push('<!-- 迁移自 JSON 简报，无澄清记录 -->');
  lines.push('');

  return lines.join('\n');
}

function migrateIteration(iterFile) {
  const dir = path.dirname(iterFile);
  const record = JSON.parse(fs.readFileSync(iterFile, 'utf8'));
  const id = record.identity?.iteration_id || 'unknown';
  const title = record.identity?.title || '未命名';
  const date = record.identity?.date || new Date().toISOString().slice(0, 10);
  const dateCompact = date.replace(/-/g, '');
  const briefFileName = `${id}-${title}-${dateCompact}.md`;
  const briefFilePath = path.join(dir, briefFileName);

  let changed = false;

  // 1. 生成 spec.md（如果不存在）
  if (!fs.existsSync(briefFilePath)) {
    const mdContent = briefToMarkdown(record);
    if (!dryRun) {
      fs.writeFileSync(briefFilePath, mdContent);
    }
    console.log(`  生成 spec.md: ${briefFileName}`);
    changed = true;
  } else {
    console.log(`  spec.md 已存在，跳过: ${briefFileName}`);
  }

  // 2. 更新 iteration.json
  if (!record.brief_file) {
    record.brief_file = briefFileName;
    changed = true;
    console.log(`  增加 brief_file: ${briefFileName}`);
  }

  // 3. 状态改名
  if (record.status === 'awaiting-brief-confirmation') {
    record.status = 'in-development';
    changed = true;
    console.log(`  状态改名: awaiting-brief-confirmation → in-development`);
  }

  if (changed && !dryRun) {
    fs.writeFileSync(iterFile, `${JSON.stringify(record, null, 2)}\n`);
  }

  return changed;
}

// 主流程
const scenesDir = path.join(root, 'wego-app', 'scenes');
const iterations = findIterations(scenesDir);

console.log(`找到 ${iterations.length} 个迭代${dryRun ? '（dry-run 模式，不写入）' : ''}`);
console.log('');

let totalChanged = 0;
for (const iterFile of iterations) {
  const relative = path.relative(root, iterFile);
  console.log(`处理: ${relative}`);
  const changed = migrateIteration(iterFile);
  if (changed) totalChanged++;
  console.log('');
}

console.log(`迁移完成：${iterations.length} 个迭代，${totalChanged} 个有变更${dryRun ? '（dry-run）' : ''}`);
