#!/usr/bin/env node
/**
 * 需求简报 spec 生成脚本
 *
 * 读取某迭代的 iteration.json，将其中 prototype_brief 渲染成一份结构化贴 spec 风格的
 * Markdown 文档（元数据头 + 分节 + 表格），落盘到该迭代目录。
 *
 * 指标：数据源唯一 —— 文档内容完全来自 iteration.json 的 prototype_brief；
 * JSON 简报改动后重跑本脚本即可同步，不引入独立于 JSON 的游离内容。
 *
 * 用法：
 *   node scripts/gen-brief-spec.mjs --file <iteration.json>            # 打印到 stdout
 *   node scripts/gen-brief-spec.mjs --file <iteration.json> --write    # 写入迭代目录
 *
 * 输出：
 *   默认打印到 stdout；--write 写入 {迭代目录}/{iteration_id}-{title}-需求简报spec.md
 *   同时打印生成的文件路径。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

function fail(message) {
  console.error(`[error] ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { file: null, write: false };
  for (const item of argv.slice(2)) {
    if (item === '--write') args.write = true;
    else if (item.startsWith('--file=')) args.file = item.slice(7);
    else if (item === '--file') args.file = argv[argv.indexOf(item) + 1];
    else if (item === '-h' || item === '--help') {
      console.log('用法：node scripts/gen-brief-spec.mjs [--file <iteration.json>] [--write]');
      process.exit(0);
    }
  }
  if (!args.file) fail('缺少 --file 参数');
  return args;
}

const NON_EMPTY_TEXT = ['goal'];
const TEXT_LIST = ['included', 'excluded', 'entry_points', 'critical_paths', 'states', 'assumptions', 'open_questions'];
const BOUNDARY_FIELD = 'prototype_boundaries';
const DATA_CONTRACT_FIELD = 'data_contract';

function code(value) {
  return `\`${String(value)}\``;
}

function renderTextList(title, items, intro = '') {
  if (!Array.isArray(items) || !items.length) return '';
  const body = items.map(item => `- ${item}`).join('\n');
  return `### ${title}\n\n${intro ? `${intro}\n\n` : ''}${body}\n`;
}

function renderObjectListAsTable(title, items) {
  if (!Array.isArray(items) || !items.length) return '';
  const pairs = items.filter(item => typeof item === 'string' && item.trim());
  if (!pairs.length) return '';
  const rows = pairs.map(item => {
    const idx = item.indexOf(':');
    if (idx === -1) return `| ${code(item)} | ${code(item)} |`;
    return `| ${code(item.slice(0, idx).trim())} | ${item.slice(idx + 1).trim()} |`;
  });
  return `### ${title}\n\n| 项 | 说明 |\n| --- | --- |\n${rows.join('\n')}\n`;
}

function renderBoundaries(boundaries) {
  if (!Array.isArray(boundaries) || !boundaries.length) return '';
  const rows = boundaries.map(b => {
    const flow = b && typeof b.flow_id === 'string' ? b.flow_id : '';
    const mode = b && b.mode ? b.mode : '';
    const visible = b && typeof b.visible_result === 'string' ? b.visible_result : '';
    return `| ${code(flow)} | ${code(mode)} | ${visible} |`;
  });
  return `### 原型边界\n\n| flow_id | 模式 | 可见结果 |\n| --- | --- | --- |\n${rows.join('\n')}\n`;
}

// data_contract 可能是扁平的 {key: 描述} 或 {实体: {fields: {...}}} 的多层结构
function flattenDataContract(contract, depth = 0) {
  const out = [];
  if (contract == null || typeof contract !== 'object') return out;
  for (const [key, value] of Object.entries(contract)) {
    const indent = '  '.repeat(depth);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const sub = flattenDataContract(value, depth + 1);
      if (sub.length) {
        out.push(`${indent}${indent.trim() ? '' : ''}[${key}]`);
        out.push(...sub);
      } else {
        out.push(`${indent}${key}：${JSON.stringify(value)}`);
      }
    } else if (value == null || String(value) === '') {
      out.push(`${indent}${key}`);
    } else {
      out.push(`${indent}${code(key)}：${value}`);
    }
  }
  return out;
}

function renderDataContract(contract) {
  if (!contract || typeof contract !== 'object' || Array.isArray(contract) || !Object.keys(contract).length) return '';
  const lines = flattenDataContract(contract);
  if (!lines.length) return '';
  return `### 数据契约\n\n${lines.map(line => `- ${line}`).join('\n')}\n`;
}

function buildSpec(record) {
  const brief = record.prototype_brief || {};
  const identity = record.identity || {};
  const title = identity.title || record.scene || '未命名迭代';
  const date = identity.date || '';
  const iterationId = identity.iteration_id || '';

  const parts = [];
  parts.push(`# 需求简报 spec：${title}\n`);
  parts.push(`**迭代ID**：${code(iterationId)}`);
  parts.push(`**创建日期**：${date}`);
  parts.push(`**主场景**：${identity.primary_scene || ''}`);
  parts.push(`**关联场景**：${Array.isArray(identity.related_scenes) && identity.related_scenes.length ? identity.related_scenes.join('、') : '无'}`);
  parts.push(`**状态**：${record.status || ''}`);
  parts.push('');

  if (typeof brief.goal === 'string' && brief.goal.trim()) {
    parts.push(`## 目标\n\n${brief.goal.trim()}\n`);
  }

  parts.push(renderTextList('纳入范围（做）', brief.included));
  parts.push(renderTextList('排除范围（不做）', brief.excluded));
  parts.push(renderTextList('入口', brief.entry_points));
  parts.push(renderTextList('关键路径', brief.critical_paths));
  parts.push(renderBoundaries(brief[BOUNDARY_FIELD]));
  parts.push(renderTextList('状态', brief.states, '每个状态需明确「进入条件 + 可感知结果」，覆盖加载态 / 空态 / 失败态等交互状态。'));
  parts.push(renderDataContract(brief[DATA_CONTRACT_FIELD]));
  parts.push(renderTextList('假设', brief.assumptions));
  parts.push(renderTextList('待确认问题', brief.open_questions, '提交前必须清空。'));

  const cleaned = parts.filter(Boolean).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return `${cleaned}\n`;
}

function resolveFile(fileArg) {
  const resolved = path.isAbsolute(fileArg) ? fileArg : path.resolve(REPO_ROOT, fileArg);
  if (!fs.existsSync(resolved)) fail(`迭代文件不存在：${resolved}`);
  return resolved;
}

function renderTitle(title) {
  return String(title).replace(/[\\/:*?"<>|]/g, '-').trim();
}

const args = parseArgs(process.argv);
const file = resolveFile(args.file);
let record;
try {
  record = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (error) {
  fail(`迭代 JSON 无法解析：${error.message}`);
}

const markdown = buildSpec(record);

if (args.write) {
  const identity = record.identity || {};
  const fileName = `${identity.iteration_id || 'iteration'}-${renderTitle(identity.title || '迭代')}-需求简报spec.md`;
  const outFile = path.join(path.dirname(file), fileName);
  fs.writeFileSync(outFile, markdown);
  console.log(`已写入：${path.relative(REPO_ROOT, outFile)}`);
} else {
  process.stdout.write(markdown);
}