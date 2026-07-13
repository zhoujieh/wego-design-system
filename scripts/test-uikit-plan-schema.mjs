#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, '.codex/skills/wego-design/uikit-plan.json');
const valid = JSON.parse(fs.readFileSync(file, 'utf8'));

function errorsFor(plan) {
  const errors = [];
  if (plan.schemaVersion !== 5 || !Array.isArray(plan.pagePatterns) || !plan.pagePatterns.length) errors.push('schema');
  const ids = new Set();
  for (const pattern of plan.pagePatterns || []) {
    if (!pattern.id || ids.has(pattern.id)) errors.push('id');
    ids.add(pattern.id);
    if (!pattern.uiKit?.entry || !pattern.uiKit?.qualityReport) errors.push('uiKit');
    if (!Array.isArray(pattern.componentCandidates) || !pattern.componentCandidates.length) errors.push('componentCandidates');
    if (!pattern.presentation || !['type', 'transition', 'dismissAction', 'overlayLevel'].every(field => typeof pattern.presentation[field] === 'string' && pattern.presentation[field]) || typeof pattern.presentation.coversTabBar !== 'boolean') errors.push('presentation');
  }
  for (const legacy of ['fallbackPageBlueprints', 'allowedComponents', 'corePreviewComponents', 'supportEvidenceComponents', 'slotAssignments', 'hostShell', 'pageEdgeModes', 'presentationPrimitives']) if (Object.hasOwn(plan, legacy)) errors.push(`legacy:${legacy}`);
  return errors;
}

if (errorsFor(valid).length) throw new Error(`当前 UI Kit schema 无效：${errorsFor(valid).join(', ')}`);
const duplicate = structuredClone(valid);
duplicate.pagePatterns.push(structuredClone(duplicate.pagePatterns[0]));
if (!errorsFor(duplicate).includes('id')) throw new Error('重复页面范式 id 应被拦截');
const legacy = structuredClone(valid);
legacy.fallbackPageBlueprints = [];
if (!errorsFor(legacy).includes('legacy:fallbackPageBlueprints')) throw new Error('旧 fallback 字段应被拦截');
console.log('UI Kit schema 测试通过。');
