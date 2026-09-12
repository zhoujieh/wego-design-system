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

function branchDiffNames() {
  for (const base of ['origin/main', 'main']) {
    const existsResult = spawnSync('git', ['rev-parse', '--verify', '--quiet', base], { cwd: process.cwd(), encoding: 'utf8' });
    if (existsResult.status !== 0) continue;
    const result = spawnSync('git', ['-c', 'core.quotepath=false', 'diff', '--name-only', `${base}...HEAD`], { cwd: process.cwd(), encoding: 'utf8' });
    if (result.status === 0) {
      return (result.stdout || '').split('\n').map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function changedFiles() {
  return [...new Set([
    ...branchDiffNames(),
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
    const normalize = (items, severity) => (items || []).map(item => (
      typeof item === 'string'
        ? { code: `${name}.${severity}`, message: item }
        : item
    ));
    return {
      errors: normalize(parsed.errors, 'error'),
      warnings: normalize(parsed.warnings, 'warning'),
      info: normalize(parsed.info, 'info'),
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
const experienceReport = parse(run('scripts/refine-experience.mjs', ['--check', '--json']), 'experience');
const runExperienceQualitySelfTest = ['system', 'full'].includes(requestedScope);
const experienceQualitySelfTestReport = runExperienceQualitySelfTest
  ? parse(run('scripts/refine-experience.mjs', ['--self-test-quality']), 'experience-quality-self-test')
  : { errors: [], warnings: [], info: [], metrics: { skipped: true } };
const runParity = ['system', 'full'].includes(requestedScope)
  || (requestedScope === 'changed' && changedFiles().some(affectsComponentParity));
const parityReport = runParity
  ? parse(run('scripts/validate-component-contract-parity.mjs', []), 'parity')
  : { errors: [], warnings: [], info: [], metrics: { skipped: true } };
const runDocDrift = ['system', 'full'].includes(requestedScope) || args.includes('--strict');
const docDriftReport = runDocDrift
  ? parse(run('scripts/validate-doc-drift.mjs', []), 'doc-drift')
  : { errors: [], warnings: [], info: [], metrics: { skipped: true } };

const report = {
  ok: experienceReport.errors.length + experienceQualitySelfTestReport.errors.length + parityReport.errors.length + coreReport.errors.length + docDriftReport.errors.length === 0,
  scope: requestedScope,
  errors: [...experienceReport.errors, ...experienceQualitySelfTestReport.errors, ...parityReport.errors, ...coreReport.errors, ...docDriftReport.errors],
  warnings: [...experienceReport.warnings, ...experienceQualitySelfTestReport.warnings, ...parityReport.warnings, ...coreReport.warnings, ...docDriftReport.warnings],
  info: [...experienceReport.info, ...experienceQualitySelfTestReport.info, ...parityReport.info, ...coreReport.info, ...docDriftReport.info],
  metrics: {
    ...coreReport.metrics,
    experience: experienceReport.metrics,
    experienceQualitySelfTest: experienceQualitySelfTestReport.metrics,
    componentParity: parityReport.metrics,
    docDrift: docDriftReport.metrics
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
