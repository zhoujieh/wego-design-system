#!/usr/bin/env node

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
    metrics: { specsChecked: true },
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
  console.error(`无法运行原有守门逻辑：${core.error.message}`);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(core.stdout || '{}');
} catch {
  console.error('原有守门逻辑未返回可解析的 JSON：');
  console.error(core.stderr || core.stdout || '无输出');
  process.exit(1);
}

const ignored = [];
const keep = item => {
  const legacyGeneratedSpec = item?.code === 'contract.path_missing' && /(?:^|[：\s])specs\//.test(item?.message || '');
  if (legacyGeneratedSpec) ignored.push(item);
  return !legacyGeneratedSpec;
};
report.errors = (report.errors || []).filter(keep);
report.warnings = (report.warnings || []).filter(keep);
report.info = report.info || [];
report.metrics = { ...(report.metrics || {}), specsChecked: true };
if (ignored.length > 0) {
  report.info.push({
    code: 'specs.legacy_reference_ignored',
    message: `忽略 ${ignored.length} 条旧 specs 路径缺失记录；自动生成规则文档已由 scripts/specs.mjs 单独校验，不属于运行时依赖。`,
  });
}

if (jsonOutput) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
else printHuman(report);
process.exit(report.errors.length > 0 ? 1 : 0);
