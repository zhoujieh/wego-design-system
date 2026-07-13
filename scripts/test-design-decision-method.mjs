#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const source = path.join(root, '.codex/skills/wego-design/references/design-decisions.md');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-design-decisions-'));
const temp = path.join(tempRoot, 'design-decisions.md');
const candidateSource = path.join(root, '.codex/skills/wego-uxsystem-iterate/experience/candidates.json');
const candidateTemp = path.join(tempRoot, 'candidates.json');
const run = (file, candidates = candidateSource) => spawnSync(process.execPath, ['scripts/validate-design-decision-method.mjs', '--file', file, '--candidates', candidates], { cwd: root, encoding: 'utf8' });

try {
  fs.copyFileSync(source, temp);
  if (run(temp).status !== 0) throw new Error('有效设计决策文档应通过守卫');
  fs.writeFileSync(temp, fs.readFileSync(source, 'utf8').replace('## Colors', '## Palette'));
  if (run(temp).status === 0) throw new Error('章节错序应被守卫拦截');
  fs.writeFileSync(temp, fs.readFileSync(source, 'utf8').replace('source-ref: colors_and_type.css', 'source-ref: colors-and-type-missing.css'));
  if (run(temp).status === 0) throw new Error('失效规则来源应被守卫拦截');
  fs.writeFileSync(temp, fs.readFileSync(source, 'utf8').replace('    component_css: "components.css"\n', ''));
  if (run(temp).status === 0) throw new Error('完整 prompt_contract 模板缺字段应被守卫拦截');
  fs.writeFileSync(temp, fs.readFileSync(source, 'utf8').replace('`references/scene-contract.md`', '`scene-contract.md`'));
  if (run(temp).status === 0) throw new Error('读取顺序缺少 scene-contract 应被守卫拦截');
  fs.copyFileSync(source, temp);
  const candidates = JSON.parse(fs.readFileSync(candidateSource, 'utf8'));
  candidates.candidates.find(item => item.id === 'exp-component-visual-usage-must-consume-registered-component').promotion_landing.rule_id = 'missing-rule-id';
  fs.writeFileSync(candidateTemp, `${JSON.stringify(candidates, null, 2)}\n`);
  if (run(temp, candidateTemp).status === 0) throw new Error('候选与规则 ID 断链应被守卫拦截');
  console.log('设计决策方法守卫测试通过。');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
