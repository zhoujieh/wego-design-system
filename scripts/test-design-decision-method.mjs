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
  fs.writeFileSync(temp, original.replace('rule-id: wego-multi-source-generation-input-boundary', 'rule-id: removed-multi-source-generation-input-boundary'));
  if (run(temp).status === 0) throw new Error('删除多输入生成边界必需规则应被守卫拦截');
  fs.writeFileSync(temp, original.replace('rule-id: wego-multi-source-generation-input-boundary; source-ref: ../../wego-design/references/interaction-prototype-design.md', 'rule-id: wego-multi-source-generation-input-boundary; source-ref: ../../wego-product/references/iteration-workflow.md'));
  if (run(temp).status === 0) throw new Error('多输入生成边界指向其他真实来源也应被守卫拦截');
  fs.writeFileSync(temp, `${original}\n\`\`\`yaml\nprompt_contract:\n\`\`\`\n`);
  if (run(temp).status === 0) throw new Error('重复合同模板应被守卫拦截');
  fs.writeFileSync(temp, original);
  const candidates = JSON.parse(fs.readFileSync(candidateSource, 'utf8'));
  const candidate = candidates.candidates.find(item => item.id === 'exp-font-size-weight-decision-by-content-role');
  candidate.rule_ownership.canonical.rule_id = 'missing-rule-id';
  candidate.rule_ownership.canonical.locator = 'rule-id: missing-rule-id';
  fs.writeFileSync(candidateTemp, `${JSON.stringify(candidates, null, 2)}\n`);
  if (run(temp, candidateTemp).status === 0) throw new Error('候选与规则 ID 断链应被守卫拦截');
  const generationInputCandidates = JSON.parse(fs.readFileSync(candidateSource, 'utf8'));
  const generationInputCandidate = generationInputCandidates.candidates.find(item => item.id === 'exp-multi-source-generation-input-boundary');
  generationInputCandidate.rule_ownership.canonical.rule_id = 'missing-generation-input-rule';
  generationInputCandidate.rule_ownership.canonical.locator = 'rule-id: missing-generation-input-rule';
  generationInputCandidate.promotion_landing.rule_id = 'missing-generation-input-rule';
  generationInputCandidate.promotion_landing.locator = 'rule-id: missing-generation-input-rule';
  fs.writeFileSync(candidateTemp, `${JSON.stringify(generationInputCandidates, null, 2)}\n`);
  if (run(temp, candidateTemp).status === 0) throw new Error('多输入生成经验与正式规则断链应被守卫拦截');
  console.log('设计决策原则守卫测试通过。');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
