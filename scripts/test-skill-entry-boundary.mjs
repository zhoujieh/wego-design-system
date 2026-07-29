#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateExperienceRegistry, validateProductWireframeContract, validatePromotedRuleTargets, validateUxIterationContract } from './validate-skill-entry-boundary.mjs';

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

const registry = JSON.parse(fs.readFileSync(path.join(repositoryRoot, '.codex/skills/wego-uxsystem-iterate/experience/authority-registry.json'), 'utf8'));
const candidatePool = JSON.parse(fs.readFileSync(path.join(repositoryRoot, '.codex/skills/wego-uxsystem-iterate/experience/candidates.json'), 'utf8'));
assert.deepEqual(validateExperienceRegistry(repositoryRoot, registry, candidatePool), [], '完整经验候选池应通过');

const ambiguousRegistry = structuredClone(registry);
ambiguousRegistry.categories['skill-runtime-flow'].paths.push('.codex/skills/*/references/*.md');
assert.match(validateExperienceRegistry(repositoryRoot, ambiguousRegistry, candidatePool).join('\n'), /经验归属路径重叠/, '归属路径重叠应失败');

const missingPromotion = structuredClone(candidatePool);
delete missingPromotion.candidates.find(candidate => candidate.status === 'promoted').promoted_at;
assert.match(validateExperienceRegistry(repositoryRoot, registry, missingPromotion).join('\n'), /promoted_at 必须为严格 UTC 时间/, 'promoted 候选缺少升级时间应失败');

const genericJsonLanding = structuredClone(candidatePool);
const componentCandidate = genericJsonLanding.candidates.find(candidate => candidate.id === 'exp-modal-mask-opacity-must-not-live-on-overlay-root');
componentCandidate.rule_ownership.canonical.locator = '/runtimeTokens';
componentCandidate.promotion_landing.locator = '/runtimeTokens';
assert.match(validateExperienceRegistry(repositoryRoot, registry, genericJsonLanding).join('\n'), /必须定位 JSON 内的精确规则节点/, 'promoted JSON 候选使用泛化定位应失败');

const mismatchedLanding = structuredClone(candidatePool);
mismatchedLanding.candidates.find(candidate => candidate.status === 'promoted').promotion_landing.rule_id = 'other-rule';
assert.match(validateExperienceRegistry(repositoryRoot, registry, mismatchedLanding).join('\n'), /promotion_landing 必须与 canonical 精确一致/, '升级落点与 canonical 不一致应失败');

const invalidAcceptance = structuredClone(candidatePool);
invalidAcceptance.candidates.find(candidate => candidate.status === 'promoted').runtime_reachability.acceptance_check = 'wego-design';
assert.match(validateExperienceRegistry(repositoryRoot, registry, invalidAcceptance).join('\n'), /必须指向可执行验收守卫/, 'promoted 候选使用不可执行验收标签应失败');

const wrongOwner = structuredClone(candidatePool);
wrongOwner.candidates.find(candidate => candidate.rule_ownership.category === 'component-contract').primary_owner = 'wego-design';
assert.match(validateExperienceRegistry(repositoryRoot, registry, wrongOwner).join('\n'), /primary_owner 与权威类别不一致/, '设计系统候选归给运行时消费者应失败');

const uxContractRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-system-iteration-contract-'));
const uxContractFiles = [
  '.codex/skills/wego-uxsystem-iterate/SKILL.md',
  '.codex/skills/wego-uxsystem-iterate/agents/openai.yaml',
  '.codex/skills/wego-uxsystem-iterate/references/workflow.md',
  '.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md',
  '.codex/skills/wego-uxsystem-iterate/references/sync-matrix.runtime.md',
  '.codex/skills/wego-uxsystem-iterate/references/experience-candidates.md'
];
function resetUxContractFixture() {
  for (const relative of uxContractFiles) {
    const target = path.join(uxContractRoot, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(repositoryRoot, relative), target);
  }
}
function mutateUxContractFixture(relative, transform) {
  const file = path.join(uxContractRoot, relative);
  fs.writeFileSync(file, transform(fs.readFileSync(file, 'utf8')));
}
resetUxContractFixture();
assert.deepEqual(validateUxIterationContract(uxContractRoot), [], '完整 UX 系统迭代合同应通过');

mutateUxContractFixture(uxContractFiles[1], content => content.replaceAll('三技能', '五技能').replace('three-skill', 'five-skill'));
assert.match(validateUxIterationContract(uxContractRoot).join('\n'), /仍引用已删除的五技能结构/, 'UX Agent 恢复五技能描述应失败');

resetUxContractFixture();
mutateUxContractFixture(uxContractFiles[0], content => content.replace('严格按资源同步矩阵只同步该变更类型命中的', '一律同步'));
assert.match(validateUxIterationContract(uxContractRoot).join('\n'), /UX 系统迭代入口 合同漂移/, 'UX 入口恢复全量机械同步应失败');

resetUxContractFixture();
mutateUxContractFixture(uxContractFiles[3], content => content.replace('原生 Schema', '统一扩展字段'));
assert.match(validateUxIterationContract(uxContractRoot).join('\n'), /经验升级方法 合同漂移/, '经验升级要求平行字段应失败');

const wireframeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-product-wireframe-'));
const wireframeFiles = [
  '.codex/skills/wego-product/SKILL.md',
  '.codex/skills/wego-product/references/conversation-wireframe.md',
  '.codex/skills/wego-product/references/conversation-wireframe-trae.md',
  '.codex/skills/wego-product/references/conversation-wireframe-codex.md',
  '.codex/skills/wego-product/references/iteration-workflow.md',
  '.codex/skills/wego-product/references/scope-and-boundaries.md',
  '.codex/skills/shared/references/design-decisions.md',
  'scripts/iteration-record.mjs',
  'AGENTS.md',
  '.codex/skills/README.md',
  '.codex/skills/wego-product/agents/openai.yaml'
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

resetWireframeFixture();
mutateWireframeFixture(wireframeFiles[1], content => content.replace('每个进入 `submit-brief → confirm-brief` 的简报版本都必须生成，不得跳过', '页面变化较大时可以生成'));
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /简报后必生成门禁/, '线框降级为可选流程应失败');

resetWireframeFixture();
mutateWireframeFixture(wireframeFiles[1], content => `${content}\n用户明确不要线框时可以跳过。\n`);
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /不得保留按需触发或跳过线框/, '恢复用户跳过线框门禁应失败');

resetWireframeFixture();
mutateWireframeFixture(wireframeFiles[1], content => content.replace('再从当前简报生成对应线框', '随后生成对应线框'));
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /必须先形成完整 prototype_brief/, '缺少 brief 先于线框的顺序合同应失败');

resetWireframeFixture();
mutateWireframeFixture(wireframeFiles[9], content => content.replace('→ 必须生成会话线框', '→ 必要时生成会话线框'));
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /技能路由线框规则\s+缺少简报后必生成合同/, '技能路由恢复可选线框应失败');

resetWireframeFixture();
mutateWireframeFixture(wireframeFiles[4], content => content.replace('--wireframe-generated-for-revision <scope_revision>', '--wireframe-ready'));
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /业务迭代线框状态机文档\s+缺少提交快照合同/, '状态机文档丢失线框版本凭据应失败');

resetWireframeFixture();
mutateWireframeFixture(wireframeFiles[5], content => content.replaceAll('必须停止实现', '先按设计系统能力实现'));
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /产品范围边界\s+缺少设计系统冲突回退合同/, '产品边界恢复先实现后确认应失败');

resetWireframeFixture();
mutateWireframeFixture(wireframeFiles[7], content => content.replaceAll('record.brief_submission = createBriefSubmission(record);', 'record.brief_submission = null;'));
assert.match(validateProductWireframeContract(wireframeRoot).join('\n'), /业务迭代状态机实现\s+缺少线框提交凭据合同/, '状态机实现移除简报提交快照应失败');

fs.rmSync(root, { recursive: true, force: true });
fs.rmSync(uxContractRoot, { recursive: true, force: true });
fs.rmSync(wireframeRoot, { recursive: true, force: true });
console.log('Skill 入口、产品线框合同与经验规则追溯测试通过。');
