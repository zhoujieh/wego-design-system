#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateProductWireframeContract, validatePromotedRuleTargets } from './validate-skill-entry-boundary.mjs';

const repositoryRoot = process.cwd();
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-skill-entry-'));
const designFile = '.codex/skills/shared/references/design-decisions.md';
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

const wireframeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-product-wireframe-'));
const wireframeFiles = [
  '.codex/skills/wego-product/SKILL.md',
  '.codex/skills/wego-product/references/conversation-wireframe.md',
  '.codex/skills/wego-product/references/conversation-wireframe-trae.md',
  '.codex/skills/wego-product/references/conversation-wireframe-codex.md'
];
function resetWireframeFixture() {
  for (const relative of wireframeFiles) {
    const target = path.join(wireframeRoot, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(repositoryRoot, relative), target);
  }
}
function mutateWireframeFixture(relative, transform) {
  const file = path.join(wireframeRoot, relative);
  fs.writeFileSync(file, transform(fs.readFileSync(file, 'utf8')));
}

resetWireframeFixture();
assert.deepEqual(validateProductWireframeContract(wireframeRoot), [], '完整产品线框合同应通过');

fs.rmSync(path.join(wireframeRoot, wireframeFiles[2]));
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /缺少文件.*conversation-wireframe-trae\.md/, '缺少 Trae 适配应失败');

resetWireframeFixture();
fs.rmSync(path.join(wireframeRoot, wireframeFiles[3]));
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /缺少文件.*conversation-wireframe-codex\.md/, '缺少 Codex 适配应失败');

resetWireframeFixture();
mutateWireframeFixture(wireframeFiles[1], content => content.replace('没有可用渲染器', '没有可用展示能力'));
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /无渲染器降级合同/, '缺少无渲染器回退应失败');

resetWireframeFixture();
mutateWireframeFixture(wireframeFiles[2], content => `${content}\n来源：/Users/dk/.trae-cn/builtin/global/skills/dynamic-ui\n`);
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /不得包含本机.*绝对路径/, '机器绝对路径应失败');

resetWireframeFixture();
mutateWireframeFixture(wireframeFiles[1], content => `${content}\n将模型保存到 prototype_brief.wireframe。\n`);
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /不得扩展正式 Schema/, '写入正式 brief Schema 应失败');

resetWireframeFixture();
mutateWireframeFixture(wireframeFiles[1], content => `${content}\n线框展示后直接运行 \`confirm-brief\`。\n`);
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /不得直接确认 brief/, '线框直接确认 brief 应失败');

fs.rmSync(root, { recursive: true, force: true });
fs.rmSync(wireframeRoot, { recursive: true, force: true });
console.log('Skill 入口、产品线框合同与经验规则追溯测试通过。');
