#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validatePromotedRuleTargets } from './validate-skill-entry-boundary.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-skill-entry-'));
const designFile = '.codex/skills/wego-design/references/design-decisions.md';
const sceneFile = '.codex/skills/wego-design/references/scene-contract.md';

function write(relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function pool(candidate) {
  return { candidates: [candidate] };
}

const valid = {
  id: 'exp-valid',
  status: 'promoted',
  rule_ownership: {
    canonical: {
      file: designFile,
      locator: 'rule-id: design-rule',
      rule_id: 'design-rule'
    }
  },
  promotion_landing: {
    file: sceneFile,
    locator: 'rule-id: scene-rule',
    rule_id: 'scene-rule'
  }
};

write(designFile, '<!-- rule-id: design-rule; source-ref: source.json -->\n');
write(sceneFile, '<!-- rule-id: scene-rule -->\n');
assert.deepEqual(validatePromotedRuleTargets(root, pool(valid)), []);

const falseLocator = structuredClone(valid);
falseLocator.rule_ownership.canonical.locator = '设计原则';
assert.match(validatePromotedRuleTargets(root, pool(falseLocator)).join('\n'), /canonical 必须精确定位 rule_id/);

const missingCanonical = structuredClone(valid);
missingCanonical.rule_ownership.canonical.rule_id = 'missing-rule';
missingCanonical.rule_ownership.canonical.locator = 'rule-id: missing-rule';
assert.match(validatePromotedRuleTargets(root, pool(missingCanonical)).join('\n'), /canonical rule_id 未落地/);

const missingLanding = structuredClone(valid);
missingLanding.promotion_landing.rule_id = 'missing-rule';
missingLanding.promotion_landing.locator = 'rule-id: missing-rule';
assert.match(validatePromotedRuleTargets(root, pool(missingLanding)).join('\n'), /promotion_landing rule_id 未落地/);

const awaiting = structuredClone(missingCanonical);
awaiting.status = 'awaiting-confirmation';
assert.deepEqual(validatePromotedRuleTargets(root, pool(awaiting)), []);

fs.rmSync(root, { recursive: true, force: true });
console.log('Skill 入口与经验规则追溯测试通过。');
