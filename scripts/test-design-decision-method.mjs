#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const source = path.join(root, '.codex/skills/shared/references/design-decisions.md');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-design-principles-'));
const temp = path.join(tempRoot, 'design-decisions.md');
const candidateSource = path.join(root, '.codex/skills/wego-uxsystem-iterate/experience/candidates.json');
const candidateTemp = path.join(tempRoot, 'candidates.json');
const run = (file, candidates = candidateSource) => spawnSync(process.execPath, ['scripts/validate-design-decision-method.mjs', '--file', file, '--candidates', candidates], { cwd: root, encoding: 'utf8' });
const original = fs.readFileSync(source, 'utf8');

try {
  fs.writeFileSync(temp, original);
  if (run(temp).status !== 0) throw new Error('有效设计决策原则应通过守卫');
  fs.writeFileSync(temp, original.replace('清晰 > 高效 > 一致 > 美观', '清晰 > 一致 > 高效 > 美观'));
  if (run(temp).status === 0) throw new Error('错误优先级应被守卫拦截');
  fs.writeFileSync(temp, original.replace('## 组件消费', '## 组件方案'));
  if (run(temp).status === 0) throw new Error('缺少关键章节应被守卫拦截');
  fs.writeFileSync(temp, original.replace('source-ref: ../../wego-design/colors_and_type.css', 'source-ref: ../../wego-design/colors-and-type-missing.css'));
  if (run(temp).status === 0) throw new Error('失效规则来源应被守卫拦截');
  fs.writeFileSync(temp, `${original}\n\`\`\`yaml\nprompt_contract:\n\`\`\`\n`);
  if (run(temp).status === 0) throw new Error('重复合同模板应被守卫拦截');
  fs.writeFileSync(temp, original);
  const candidates = JSON.parse(fs.readFileSync(candidateSource, 'utf8'));
  const candidate = candidates.candidates.find(item => item.id === 'exp-component-visual-usage-must-consume-registered-component');
  candidate.promotion_landing.rule_id = 'missing-rule-id';
  fs.writeFileSync(candidateTemp, `${JSON.stringify(candidates, null, 2)}\n`);
  if (run(temp, candidateTemp).status === 0) throw new Error('候选与规则 ID 断链应被守卫拦截');
  console.log('设计决策原则守卫测试通过。');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
