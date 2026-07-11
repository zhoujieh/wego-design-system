#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const specsScript = process.env.WEGO_SPECS_SCRIPT || path.join(repoRoot, 'scripts/specs.mjs');
const coreScript = process.env.WEGO_VALIDATOR_CORE || path.join(repoRoot, 'scripts/validate-wego-design-core.mjs');

function printHuman(report) {
  const title = report.errors.length === 0 ? 'wego-design 守门验证通过' : 'wego-design 守门验证失败';
  console.log(`\n${title}`);
  console.log(`模式：${report.mode} / 范围：${report.scope}`);
  console.log(`错误：${report.errors.length}，警告：${report.warnings.length}`);
  if (Object.keys(report.metrics || {}).length > 0) console.log(`指标：${JSON.stringify(report.metrics)}`);
  if (report.errors.length > 0) {
    console.log('\n错误：');
    for (const item of report.errors) console.log(`- [${item.code}] ${item.file ? item.file + '：' : ''}${item.message}`);
  }
  if (report.warnings.length > 0) {
    console.log('\n警告：');
    for (const item of report.warnings) console.log(`- [${item.code}] ${item.file ? item.file + '：' : ''}${item.message}`);
  }
  if ((report.info || []).length > 0) {
    console.log('\n信息：');
    for (const item of report.info) console.log(`- [${item.code}] ${item.message}`);
  }
}

function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  const output = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) output.push(...listFiles(target));
    else if (entry.isFile()) output.push(target);
  }
  return output;
}

function compatibilityErrors() {
  const roots = [
    path.join(repoRoot, 'AGENTS.md'),
    path.join(repoRoot, '.codex/skills'),
    path.join(repoRoot, 'scripts'),
  ];
  const files = roots.flatMap(root => fs.existsSync(root) && fs.statSync(root).isDirectory() ? listFiles(root) : fs.existsSync(root) ? [root] : []);
  const textFiles = files.filter(file => /\.(?:md|mjs|js|json|yaml|yml)$/.test(file));
  const checks = [
    { code: 'compat.schema_v1', pattern: /schemaVersion\s*["']?\s*[:=]\s*1\b|--schema=1\b|\bV1_[A-Z_]+\b|\bisV1\s*\(/g, message: '仍存在 schema v1 运行时分支' },
    { code: 'compat.old_commands', pattern: /\bconfirm-scope\b|\bcheck-base\b|commands\s*\[["']scope["']\]|['"]scope['"]\s*:/g, message: '仍存在旧状态机命令' },
    { code: 'compat.old_specs', pattern: /page_spec\.json|design_consumption_plan\.json/g, message: '仍存在旧规格文件运行时引用' },
    { code: 'compat.old_fields', pattern: /page_surfaces|回退顶层\s*`?route_id`?|fallback.*route_id/gi, message: '仍存在旧字段回退逻辑' },
    { code: 'compat.dual_track', pattern: /v1\s*(?:继续|兼容|状态机|流程)|v2\s*(?:且|原型期|状态机).*v1/gi, message: '仍存在 v1/v2 双轨表述或逻辑' },
  ];
  const allowed = new Set([
    path.join(repoRoot, 'AGENTS.md'),
    path.join(repoRoot, '.codex/skills/README.md'),
    path.join(repoRoot, '.codex/skills/wego-product/SKILL.md'),
    path.join(repoRoot, '.codex/skills/wego-design/SKILL.md'),
    path.join(repoRoot, '.codex/skills/wego-ux/SKILL.md'),
    path.join(repoRoot, '.codex/skills/wego-tests/SKILL.md'),
    path.join(repoRoot, '.codex/skills/wego-product/references/iteration-workflow.md'),
    path.join(repoRoot, 'scripts/validate-wego-design.mjs'),
    path.join(repoRoot, 'scripts/iteration-record.mjs'),
  ]);
  const errors = [];
  for (const file of textFiles) {
    const content = fs.readFileSync(file, 'utf8');
    for (const check of checks) {
      check.pattern.lastIndex = 0;
      if (!check.pattern.test(content)) continue;
      if (allowed.has(file) && /禁止|不支持|拒绝|直接失败|必须停止/.test(content)) continue;
      errors.push({
        code: check.code,
        file: path.relative(repoRoot, file).split(path.sep).join('/'),
        message: check.message,
      });
    }
  }
  return errors;
}

const specs = spawnSync(process.execPath, [specsScript, 'check', '--json'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

if (specs.status !== 0) {
  let details;
  try {
    details = JSON.parse(specs.stdout || '{}');
  } catch {
    details = { errors: [specs.stderr || specs.stdout || '规则文档一致性检查失败'] };
  }
  const report = {
    root: '.codex/skills/wego-design',
    mode: args.includes('--strict') ? 'strict' : 'baseline',
    scope: 'preflight',
    errors: [{ code: 'specs.out_of_sync', message: details.message || '规则文档一致性检查失败', details: details.errors || [] }],
    warnings: [],
    info: [],
    metrics: { specsChecked: true, compatibilityChecked: false },
  };
  if (jsonOutput) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else printHuman(report);
  process.exit(1);
}

const coreArgs = args.includes('--json') ? args : [...args, '--json'];
const core = spawnSync(process.execPath, [coreScript, ...coreArgs], {
  cwd: repoRoot,
  encoding: 'utf8',
});

if (core.error) {
  console.error(`无法运行守门逻辑：${core.error.message}`);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(core.stdout || '{}');
} catch {
  console.error('守门逻辑未返回可解析的 JSON：');
  console.error(core.stderr || core.stdout || '无输出');
  process.exit(1);
}

report.errors = report.errors || [];
report.warnings = report.warnings || [];
report.info = report.info || [];
const compatibility = compatibilityErrors();
report.errors.push(...compatibility);
report.metrics = {
  ...(report.metrics || {}),
  specsChecked: true,
  compatibilityChecked: true,
  compatibilityErrors: compatibility.length,
};
if (compatibility.length === 0) {
  report.info.push({ code: 'compat.clean', message: '未发现旧 Schema、旧命令、旧规格文件或双轨兼容逻辑。' });
}

if (jsonOutput) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
else printHuman(report);
process.exit(report.errors.length > 0 ? 1 : 0);
