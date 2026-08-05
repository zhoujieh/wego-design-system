#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const requestedScope = (args.find(arg => arg.startsWith('--scope=')) || '--scope=changed').slice('--scope='.length);

function gitNames(gitArgs) {
  const result = spawnSync('git', ['-c', 'core.quotepath=false', ...gitArgs], { cwd: process.cwd(), encoding: 'utf8' });
  return result.status === 0
    ? (result.stdout || '').split('\n').map(item => item.trim()).filter(Boolean)
    : [];
}

function changedFiles() {
  return [...new Set([
    ...gitNames(['diff', '--name-only']),
    ...gitNames(['diff', '--cached', '--name-only']),
    ...gitNames(['ls-files', '--others', '--exclude-standard'])
  ])];
}

function affectsComponentParity(file) {
  return [
    '.codex/skills/wego-design/assets/',
    '.codex/skills/wego-design/components/',
    '.codex/skills/wego-design/preview/',
    '.codex/skills/wego-design/ui_kits/'
  ].some(prefix => file.startsWith(prefix))
    || new Set([
      '.codex/skills/wego-design/colors_and_type.css',
      '.codex/skills/wego-design/components.css',
      '.codex/skills/wego-design/css.json',
      '.codex/skills/wego-design/library-consumption.json',
      '.codex/skills/wego-design/page-layers.json',
      '.codex/skills/wego-design/scaffold.css',
      '.codex/skills/wego-design/uikit-plan.json',
      '.codex/skills/wego-design/scripts/extract-components-css.mjs',
      'scripts/validate-component-contract-parity.mjs'
    ]).has(file);
}

function run(script, scriptArgs) {
  return spawnSync(process.execPath, [script, ...scriptArgs, '--json'], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
}

function parse(result, name) {
  try {
    const parsed = JSON.parse(result.stdout || '{}');
    if (result.status !== 0 && !(parsed.errors || []).length) {
      parsed.errors = [{ code: `${name}.failed`, message: result.stderr || `${name} 执行失败` }];
    }
    return {
      errors: parsed.errors || [],
      warnings: parsed.warnings || [],
      info: parsed.info || [],
      metrics: parsed.metrics || {}
    };
  } catch {
    return {
      errors: [{
        code: `${name}.invalid_output`,
        message: (result.stderr || result.stdout || '守门未输出 JSON').trim()
      }],
      warnings: [],
      info: [],
      metrics: {}
    };
  }
}

const coreArgs = args.filter(arg => arg !== '--json');
const coreReport = parse(run('scripts/validate-wego-design-core.mjs', coreArgs), 'core');
const experienceReport = parse(run('scripts/validate-experience-records.mjs', []), 'experience');
const runParity = ['system', 'full'].includes(requestedScope)
  || (requestedScope === 'changed' && changedFiles().some(affectsComponentParity));
const parityReport = runParity
  ? parse(run('scripts/validate-component-contract-parity.mjs', []), 'parity')
  : { errors: [], warnings: [], info: [], metrics: { skipped: true } };

const report = {
  ok: experienceReport.errors.length + parityReport.errors.length + coreReport.errors.length === 0,
  scope: requestedScope,
  errors: [...experienceReport.errors, ...parityReport.errors, ...coreReport.errors],
  warnings: [...experienceReport.warnings, ...parityReport.warnings, ...coreReport.warnings],
  info: [...experienceReport.info, ...parityReport.info, ...coreReport.info],
  metrics: {
    ...coreReport.metrics,
    experience: experienceReport.metrics,
    componentParity: parityReport.metrics
  }
};

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(report.ok ? 'wego-design 守门验证通过' : 'wego-design 守门验证失败');
  console.log(`错误：${report.errors.length}，警告：${report.warnings.length}`);
  for (const item of report.errors) console.error(`- [${item.code}] ${item.file ? `${item.file}：` : ''}${item.message}`);
  for (const item of report.warnings) console.warn(`- [${item.code}] ${item.file ? `${item.file}：` : ''}${item.message}`);
}

process.exit(report.ok ? 0 : 1);
