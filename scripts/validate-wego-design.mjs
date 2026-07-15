#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const strict = args.includes('--strict');
const run = script => spawnSync(process.execPath, [script, '--json'], { cwd: process.cwd(), encoding: 'utf8' });
const parity = run('scripts/validate-component-contract-parity.mjs');
const core = spawnSync(process.execPath, ['scripts/validate-wego-design-core.mjs', ...args.filter(arg => arg !== '--json'), '--json'], { cwd: process.cwd(), encoding: 'utf8' });

function parse(result, name) {
  try { return JSON.parse(result.stdout || '{}'); }
  catch { return { ok: false, errors: [{ code: `${name}.invalid_output`, message: result.stderr || result.stdout || '守门未输出 JSON' }], warnings: [], metrics: {} }; }
}

const parityReport = parse(parity, 'parity');
const coreReport = parse(core, 'core');
const report = {
  ...coreReport,
  errors: [...(parityReport.errors || []), ...(coreReport.errors || [])],
  warnings: [...(parityReport.warnings || []), ...(coreReport.warnings || [])],
  metrics: { ...(coreReport.metrics || {}), componentParity: parityReport.metrics || {} }
};
if (strict && report.warnings.length) {
  report.errors.push(...report.warnings.map(item => ({ ...item, code: `strict.${item.code}`, message: `严格模式不允许警告：${item.message}` })));
  report.warnings = [];
}
report.ok = report.errors.length === 0;
if (jsonOutput) console.log(JSON.stringify(report, null, 2));
else {
  console.log(report.ok ? 'wego-design 守门验证通过' : 'wego-design 守门验证失败');
  console.log(`错误：${report.errors.length}，警告：${report.warnings.length}`);
  for (const item of report.errors) console.error(`- [${item.code}] ${item.file ? `${item.file}：` : ''}${item.message}`);
  for (const item of report.warnings) console.warn(`- [${item.code}] ${item.file ? `${item.file}：` : ''}${item.message}`);
}
process.exit(report.ok ? 0 : 1);
