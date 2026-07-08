#!/usr/bin/env node

import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const specsScript = path.join(repoRoot, 'scripts/specs.mjs');
const coreScript = path.join(repoRoot, 'scripts/validate-wego-design-core.mjs');

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

  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify({
      root: '.codex/skills/wego-design',
      mode: args.includes('--strict') ? 'strict' : 'baseline',
      scope: 'preflight',
      errors: [{
        code: 'specs.out_of_sync',
        message: details.message || '规则文档一致性检查失败',
        details: details.errors || [],
      }],
      warnings: [],
      info: [],
      metrics: { specsChecked: true },
    }, null, 2)}\n`);
  } else {
    console.error('\nwego-design 守门验证失败');
    console.error('规则文档一致性检查未通过：');
    for (const error of details.errors || []) console.error(`- ${error}`);
  }
  process.exit(1);
}

const core = spawnSync(process.execPath, [coreScript, ...args], {
  cwd: repoRoot,
  stdio: 'inherit',
});

if (core.error) {
  console.error(`无法运行原有守门逻辑：${core.error.message}`);
  process.exit(1);
}

process.exit(core.status ?? 1);
