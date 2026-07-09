#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.env.WEGO_REPO_ROOT || process.cwd());
const LEGACY_OUT = path.join(ROOT, '.codex/skills/wego-design/specs');
const DOCS_OUT = path.join(ROOT, 'docs/specs');

const remapGeneratedSpecsPath = value => {
  if (typeof value !== 'string') return value;
  const resolved = path.resolve(value);
  if (resolved === LEGACY_OUT) return DOCS_OUT;
  if (resolved.startsWith(`${LEGACY_OUT}${path.sep}`)) return path.join(DOCS_OUT, path.relative(LEGACY_OUT, resolved));
  return value;
};

for (const name of ['mkdirSync', 'writeFileSync', 'existsSync', 'readFileSync', 'readdirSync']) {
  const original = fs[name].bind(fs);
  fs[name] = (target, ...args) => original(remapGeneratedSpecsPath(target), ...args);
}

await import('./specs-core.mjs');
