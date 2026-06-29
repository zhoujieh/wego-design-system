#!/usr/bin/env node

/**
 * validate-wegoux.mjs
 *
 * Automated guard checks for the wegoux design system. The default mode blocks
 * hard integrity failures and reports known debt as warnings. Use --strict to
 * promote debt warnings to failures as the library matures.
 *
 * Usage:
 *   node scripts/validate-wegoux.mjs
 *   node scripts/validate-wegoux.mjs --scope=changed --staged
 *   node scripts/validate-wegoux.mjs --scope=changed --base=origin/main
 *   node scripts/validate-wegoux.mjs --scope=full
 *   node scripts/validate-wegoux.mjs --scope=full --strict
 *   node scripts/validate-wegoux.mjs --json
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const strict = args.has('--strict');
const jsonOutput = args.has('--json');
const repoRoot = process.cwd();
const rootArg = rawArgs.find(arg => arg.startsWith('--root='));
const libraryRoot = path.resolve(repoRoot, rootArg ? rootArg.slice('--root='.length) : '.design_library/wegoux');
const rootRel = path.relative(repoRoot, libraryRoot) || '.';
const scopeArg = rawArgs.find(arg => arg.startsWith('--scope='));
const requestedScope = args.has('--full')
  ? 'full'
  : args.has('--changed')
    ? 'changed'
    : scopeArg
      ? scopeArg.slice('--scope='.length)
      : 'changed';
const baseArg = rawArgs.find(arg => arg.startsWith('--base='));
const diffBase = baseArg ? baseArg.slice('--base='.length) : null;
const stagedOnly = args.has('--staged');

const REQUIRED_ROOT_FILES = [
  'SKILL.md',
  'README.md',
  'colors_and_type.css',
  'css.json',
  'components.css',
  'iconfont.css',
  'library-consumption.json',
  'uikit-plan.json',
  'metadata.json',
  'scripts/extract-components-css.mjs',
];

const REQUIRED_TOKEN_VARS = [
  '--color-brand',
  '--color-bg-page',
  '--color-bg-surface',
  '--color-text-primary',
  '--color-text-secondary',
  '--font-family-text',
  '--font-family-number',
  '--font-size-14',
  '--space-16',
  '--radius-md',
  '--duration-fast',
  '--ease-standard',
  '--touch-min',
  '--touch-default',
  '--z-index-modal',
];

const REQUIRED_CSS_JSON_BUCKETS = [
  'color',
  'font',
  'shadow',
  'radius',
  'spacing',
  'size',
  'layout',
  'motion',
  'stroke',
  'touch',
  'zIndex',
];

const INTERACTIVE_COMPONENTS = new Set([
  'button',
  'link',
  'cell',
  'bottom-nav',
  'navbar',
  'navbar-action-button',
  'input',
  'counter',
  'checkbox',
  'radio',
  'switch',
  'form',
  'stack',
]);

const EMBEDDED_PREVIEWS = {
  'navbar-action-button': 'component-navbar.html',
};

const PREVIEW_SCAFFOLD_SELECTORS = [
  'body',
  'html',
  '.row',
  '.label',
  '.section-title',
  '.sub-label',
  '.demo-',
  '.toast',
  '.setting-row',
  '.dark-strip',
];

const DRIFT_PATTERNS = [
  /\bNimbus\b/i,
  /\bTRAE\b/i,
  /\bworkbench\b/i,
  /\beditor-tabs\b/i,
  /\bfile-tree\b/i,
  /\bterminal\b/i,
  /\bJetBrains Mono\b/i,
  /--code-editor-/,
  /--bg-base-default/,
  /@dark-only/,
  /\bdesktop-sidebar\b/i,
  /\bmarketing-hero\b/i,
  /\blarge-gradient-hero\b/i,
  /\bdecorative-orb\b/i,
];

const DRIFT_SCAN_DIRS = ['components', 'preview', 'ui_kits', 'specs'];

const ALLOWED_UIKIT_SHELL_CLASSES = new Set([
  'uikit-shell',
  'uikit-main',
  'uikit-toolbar',
  'uikit-sidebar',
  'uikit-responsive-grid',
  'uikit-table-wrap',
  'uikit-truncate',
  'uikit-nowrap',
  'uikit-action-cell',
  'uikit-action',
  'phone-frame',
  'phone-screen',
  'phone-status',
  'phone-header',
  'phone-header-back',
  'phone-header-title',
  'phone-body',
  'phone-indicator',
  'phone-indicator-bar',
]);

const report = {
  root: rootRel,
  mode: strict ? 'strict' : 'baseline',
  scope: requestedScope,
  errors: [],
  warnings: [],
  info: [],
  metrics: {},
};

function add(severity, code, message, file = null, details = null) {
  const item = { code, message };
  if (file) item.file = path.relative(repoRoot, file);
  if (details) item.details = details;
  if (severity === 'error' || (strict && severity === 'debt')) {
    report.errors.push(item);
  } else if (severity === 'warn' || severity === 'debt') {
    report.warnings.push(item);
  } else {
    report.info.push(item);
  }
}

function exists(rel) {
  return fs.existsSync(path.join(libraryRoot, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(libraryRoot, rel), 'utf8');
}

function readJson(rel) {
  try {
    return JSON.parse(read(rel));
  } catch (error) {
    add('error', 'json.parse', `JSON 解析失败：${error.message}`, path.join(libraryRoot, rel));
    return null;
  }
}

function listFiles(dir, predicate = () => true) {
  const abs = path.join(libraryRoot, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  const walk = current => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (predicate(full)) {
        out.push(full);
      }
    }
  };
  walk(abs);
  return out.sort();
}

function run(command, argsList, options = {}) {
  return spawnSync(command, argsList, {
    cwd: repoRoot,
    encoding: 'utf8',
    ...options,
  });
}

function git(argsList) {
  const result = run('git', argsList);
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function splitLines(text) {
  return text ? text.split('\n').map(line => line.trim()).filter(Boolean) : [];
}

function relToLibrary(file) {
  if (file === rootRel) return '';
  return file.startsWith(rootRel + '/') ? file.slice(rootRel.length + 1) : null;
}

function componentSlugsFromLibraryPath(rel) {
  let match = rel.match(/^components\/([^/]+)\.json$/);
  if (match && match[1] !== 'index') return [match[1]];
  match = rel.match(/^preview\/component-(.+)\.html$/);
  if (match) {
    const previewName = `component-${match[1]}.html`;
    const slugs = new Set([match[1]]);
    for (const [slug, preview] of Object.entries(EMBEDDED_PREVIEWS)) {
      if (preview === previewName) slugs.add(slug);
    }
    return [...slugs];
  }
  return [];
}

function collectChangedFiles() {
  if (requestedScope === 'full') return [];

  const files = new Set();
  if (diffBase) {
    const primary = git(['diff', '--name-only', '--diff-filter=ACMRT', `${diffBase}...HEAD`]);
    const fallback = primary && primary.length > 0
      ? primary
      : git(['diff', '--name-only', '--diff-filter=ACMRT', diffBase]);
    splitLines(fallback).forEach(file => files.add(file));
  } else if (stagedOnly) {
    splitLines(git(['diff', '--cached', '--name-only', '--diff-filter=ACMRT'])).forEach(file => files.add(file));
  } else {
    splitLines(git(['diff', '--name-only', '--diff-filter=ACMRT', 'HEAD'])).forEach(file => files.add(file));
    splitLines(git(['ls-files', '--others', '--exclude-standard'])).forEach(file => files.add(file));
  }
  return [...files].sort();
}

function createContext(allSlugs = []) {
  const changedFiles = collectChangedFiles();
  const relFiles = changedFiles.map(file => ({ file, rel: relToLibrary(file) })).filter(item => item.rel !== null);
  const changedSlugs = new Set();
  const changedKits = new Set();
  let tokenChanged = false;
  let registryChanged = false;
  let componentsCssChanged = false;
  let consumptionChanged = false;
  let validatorChanged = false;
  let extractorChanged = false;
  let metadataChanged = false;
  let previewChanged = false;
  let componentContractChanged = false;

  for (const file of changedFiles) {
    if (file === 'scripts/validate-wegoux.mjs') validatorChanged = true;
  }

  for (const { rel } of relFiles) {
    for (const slug of componentSlugsFromLibraryPath(rel)) changedSlugs.add(slug);

    if (rel === 'components/index.json') registryChanged = true;
    if (/^components\/[^/]+\.json$/.test(rel) && rel !== 'components/index.json') componentContractChanged = true;
    if (/^preview\/component-.+\.html$/.test(rel)) previewChanged = true;
    if (rel === 'colors_and_type.css' || rel === 'css.json') tokenChanged = true;
    if (rel === 'components.css') componentsCssChanged = true;
    if (rel === 'library-consumption.json' || rel === 'uikit-plan.json' || rel === 'README.md' || rel === 'SKILL.md') {
      consumptionChanged = true;
    }
    if (rel === 'scripts/extract-components-css.mjs') extractorChanged = true;
    if (rel === 'metadata.json') metadataChanged = true;

    const kitMatch = rel.match(/^ui_kits\/([^/]+)\//);
    if (kitMatch) changedKits.add(kitMatch[1]);
  }

  const effectiveScope = requestedScope === 'full' || validatorChanged || extractorChanged ? 'full' : 'changed';
  if (registryChanged || tokenChanged) {
    allSlugs.forEach(slug => changedSlugs.add(slug));
  }

  return {
    requestedScope,
    effectiveScope,
    changedFiles,
    libraryChangedFiles: relFiles.map(item => item.rel),
    changedSlugs,
    changedKits,
    tokenChanged,
    registryChanged,
    componentsCssChanged,
    consumptionChanged,
    validatorChanged,
    extractorChanged,
    metadataChanged,
    previewChanged,
    componentContractChanged,
    anyDesignChange: relFiles.length > 0,
  };
}

function extractCssVars(css) {
  const vars = new Set();
  const regex = /--([\w\u4e00-\u9fff\u3400-\u4dbf-]+)\s*:/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    vars.add(`--${match[1]}`);
  }
  return vars;
}

function extractUsedVars(css) {
  const vars = new Set();
  const regex = /var\(\s*(--[\w\u4e00-\u9fff\u3400-\u4dbf-]+)/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    vars.add(match[1]);
  }
  return vars;
}

function flattenJsonKeys(value, keys = new Set()) {
  if (!value || typeof value !== 'object') return keys;
  if (Array.isArray(value)) {
    for (const item of value) flattenJsonKeys(item, keys);
    return keys;
  }
  for (const [key, child] of Object.entries(value)) {
    keys.add(key);
    flattenJsonKeys(child, keys);
  }
  return keys;
}

function extractStyleBlocks(html) {
  const blocks = [];
  const regex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    blocks.push(match[1]);
  }
  return blocks.join('\n');
}

function extractComponentBlock(html) {
  const style = extractStyleBlocks(html);
  const start = '/* @component-css-start */';
  const end = '/* @component-css-end */';
  const startIndex = style.indexOf(start);
  const endIndex = style.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) return null;
  return style.slice(startIndex + start.length, endIndex).trim();
}

function countMarkers(html) {
  return {
    start: (html.match(/@component-css-start/g) || []).length,
    end: (html.match(/@component-css-end/g) || []).length,
  };
}

function rawColorMatches(css) {
  const matches = [];
  const colorRegex = /#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/g;
  let match;
  while ((match = colorRegex.exec(css)) !== null) {
    matches.push(match[0]);
  }
  return matches;
}

function selectorLikelyPresent(css, selector) {
  if (selector.endsWith('-')) {
    return css.includes(selector);
  }
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (selector.startsWith('.')) {
    return new RegExp(`(^|[}\\n,\\s])${escaped}(?=[:\\s,{.#>\\[])`).test(css);
  }
  return new RegExp(`(^|[}\\n,\\s])${escaped}(?=[:\\s,{])`).test(css);
}

function usesIconFontMarkup(html) {
  return /class(?:Name)?=["'][^"']*\bwego-iconfont-s\b/.test(html) ||
    /class(?:Name)?=["'][^"']*\bicon-[a-zA-Z0-9_-]+\b/.test(html);
}

function hasLegacyIconsPath(text) {
  return /(^|[^a-zA-Z0-9_-])icons\//.test(text.replace(/assets\/icons\//g, 'assets-icons-normalized/'));
}

function classNamesFromHtml(html) {
  const classes = new Set();
  const regex = /\bclass(?:Name)?=(?:"([^"]+)"|'([^']+)'|\{`([^`]+)`\}|\{"([^"]+)"\})/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const raw = match[1] || match[2] || match[3] || match[4] || '';
    for (const token of raw.split(/\s+/)) {
      const clean = token.trim().replace(/[{}"'`,]/g, '');
      if (clean && /^[a-zA-Z0-9_-]+$/.test(clean)) classes.add(clean);
    }
  }
  return classes;
}

function classesFromCss(css) {
  const classes = new Set();
  const regex = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    classes.add(match[1]);
  }
  return classes;
}

function firstLines(items, limit = 8) {
  return items.slice(0, limit).join(', ') + (items.length > limit ? ` 等 ${items.length} 项` : '');
}

function checkRequiredFiles() {
  if (!fs.existsSync(libraryRoot)) {
    add('error', 'root.missing', '找不到 wegoux 设计系统根目录', libraryRoot);
    return;
  }
  for (const rel of REQUIRED_ROOT_FILES) {
    if (!exists(rel)) add('error', 'file.missing', `缺少必需文件 ${rel}`, path.join(libraryRoot, rel));
  }
  for (const rel of ['components', 'preview', 'ui_kits', 'specs', 'assets/fonts', 'assets/icons']) {
    if (!exists(rel)) add('error', 'dir.missing', `缺少必需目录 ${rel}`, path.join(libraryRoot, rel));
  }
}

function checkComponentFiles(options = {}) {
  const { full = true, changedSlugs = new Set() } = options;
  const index = readJson('components/index.json');
  if (!index || !Array.isArray(index.components)) {
    add('error', 'components.index.invalid', 'components/index.json 必须包含 components 数组', path.join(libraryRoot, 'components/index.json'));
    return [];
  }

  const seen = new Set();
  const slugs = [];
  for (const component of index.components) {
    const slug = component.slug;
    if (!slug) {
      add('error', 'component.slug.missing', '组件注册项缺少 slug', path.join(libraryRoot, 'components/index.json'));
      continue;
    }
    if (seen.has(slug)) {
      add('error', 'component.slug.duplicate', `组件 slug 重复：${slug}`, path.join(libraryRoot, 'components/index.json'));
    }
    seen.add(slug);
    slugs.push(slug);

    if (!full && !changedSlugs.has(slug)) continue;

    const contractRel = `components/${slug}.json`;
    if (!exists(contractRel)) {
      add('error', 'component.contract.missing', `注册组件缺少契约文件：${contractRel}`, path.join(libraryRoot, contractRel));
    }

    const previewFile = EMBEDDED_PREVIEWS[slug] || `component-${slug}.html`;
    const previewRel = `preview/${previewFile}`;
    if (!exists(previewRel)) {
      const severity = EMBEDDED_PREVIEWS[slug] ? 'error' : 'error';
      add(severity, 'component.preview.missing', `注册组件缺少预览页：${previewRel}`, path.join(libraryRoot, previewRel));
    }
  }

  if (full) {
    const contractFiles = listFiles('components', file => file.endsWith('.json') && path.basename(file) !== 'index.json')
      .map(file => path.basename(file, '.json'));
    for (const slug of contractFiles) {
      if (!seen.has(slug)) {
        add('debt', 'component.contract.unregistered', `存在未注册组件契约：components/${slug}.json`, path.join(libraryRoot, 'components', `${slug}.json`));
      }
    }

    const previewFiles = listFiles('preview', file => /^component-.+\.html$/.test(path.basename(file)))
      .map(file => path.basename(file).replace(/^component-/, '').replace(/\.html$/, ''));
    for (const slug of previewFiles) {
      if (!seen.has(slug) && !Object.values(EMBEDDED_PREVIEWS).includes(`component-${slug}.html`)) {
        add('debt', 'component.preview.unregistered', `存在未注册组件预览页：preview/component-${slug}.html`, path.join(libraryRoot, 'preview', `component-${slug}.html`));
      }
    }
  }

  report.metrics.registeredComponents = slugs.length;
  return slugs;
}

function checkPreviewPages(slugs, declaredVars, options = {}) {
  const { full = true, changedSlugs = new Set() } = options;
  const allPreviewFiles = listFiles('preview', file => /^component-.+\.html$/.test(path.basename(file)));
  const previewFiles = full
    ? allPreviewFiles
    : [...new Set([...changedSlugs].map(slug => {
      const previewName = EMBEDDED_PREVIEWS[slug] || `component-${slug}.html`;
      return path.join(libraryRoot, 'preview', previewName);
    }))].filter(file => fs.existsSync(file));
  report.metrics.previewPages = previewFiles.length;

  for (const file of previewFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const markers = countMarkers(html);
    if (markers.start !== 1 || markers.end !== 1) {
      add('error', 'preview.markers.invalid', `预览页 CSS 提取标记数量异常：start=${markers.start}, end=${markers.end}`, file);
      continue;
    }

    const block = extractComponentBlock(html);
    if (!block) {
      add('error', 'preview.block.missing', '无法提取组件核心 CSS 标记块', file);
      continue;
    }

    const usedVars = extractUsedVars(block);
    for (const used of usedVars) {
      if (!declaredVars.has(used)) {
        add('error', 'preview.var.undefined', `组件 CSS 使用了未定义 Token：${used}`, file);
      }
    }

    const scaffoldHits = PREVIEW_SCAFFOLD_SELECTORS.filter(selector => selectorLikelyPresent(block, selector));
    if (scaffoldHits.length > 0) {
      add('debt', 'preview.scaffold.in_block', `组件 CSS 标记块内疑似混入预览脚手架样式：${scaffoldHits.join(', ')}`, file);
    }

    const rawColors = rawColorMatches(block);
    if (rawColors.length > 0) {
      add('debt', 'preview.raw_color', `组件核心 CSS 含硬编码颜色：${firstLines([...new Set(rawColors)])}`, file);
    }

    if (!html.includes('../colors_and_type.css')) {
      add('error', 'preview.token_css.missing', '预览页必须引入 ../colors_and_type.css', file);
    }

    const usesIconFont = usesIconFontMarkup(html);
    if (usesIconFont && !html.includes('../iconfont.css')) {
      add('error', 'preview.iconfont_css.missing', '使用 iconfont 的预览页必须引入 ../iconfont.css', file);
    }

    if (/lucide|unpkg\.com\/lucide/i.test(html)) {
      add('error', 'preview.lucide.forbidden', '组件预览页禁止引入 Lucide/CDN 图标', file);
    }

    if (/<svg[\s>]/i.test(html) && !/assets\/icons|checkbox-check|radio-dot|stack-check/.test(html)) {
      add('debt', 'preview.inline_svg', '预览页存在 inline SVG；常规图标应优先使用 iconfont 或随库资产', file);
    }

    const slug = path.basename(file).replace(/^component-/, '').replace(/\.html$/, '');
    const contractSlug = Object.entries(EMBEDDED_PREVIEWS).find(([, preview]) => preview === path.basename(file))?.[0] || slug;
    const contractPath = path.join(libraryRoot, 'components', `${contractSlug}.json`);
    if (/<script[\s>]/i.test(html) && fs.existsSync(contractPath)) {
      const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
      if (!contract.behavior) {
        add('debt', 'preview.script_without_behavior', '预览页有交互脚本，但组件契约缺少 behavior 字段', file);
      }
    }
  }

  if (full) {
    const expectedPreviewCount = slugs.filter(slug => !EMBEDDED_PREVIEWS[slug]).length;
    if (allPreviewFiles.length < expectedPreviewCount) {
      add('error', 'preview.count.low', `独立预览页数量少于注册组件要求：${allPreviewFiles.length}/${expectedPreviewCount}`);
    }
  }
}

function checkComponentsCss(options = {}) {
  const { shouldRegenerate = true } = options;
  const cssPath = path.join(libraryRoot, 'components.css');
  if (!fs.existsSync(cssPath)) return;

  const css = fs.readFileSync(cssPath, 'utf8');
  if (!/DO NOT EDIT MANUALLY/.test(css)) {
    add('error', 'components_css.header.missing', 'components.css 缺少 DO NOT EDIT MANUALLY 自动生成声明', cssPath);
  }

  if (!shouldRegenerate) return;

  const tmpParent = fs.mkdtempSync(path.join(os.tmpdir(), 'wegoux-validate-'));
  const tmpRoot = path.join(tmpParent, 'wegoux');
  try {
    fs.cpSync(libraryRoot, tmpRoot, {
      recursive: true,
      filter: source => !source.includes(`${path.sep}.DS_Store`),
    });
    const scriptPath = path.join(tmpRoot, 'scripts/extract-components-css.mjs');
    const result = run(process.execPath, [scriptPath, tmpRoot], { cwd: tmpRoot });
    if (result.status !== 0) {
      add('error', 'components_css.regenerate.failed', '临时目录重新生成 components.css 失败', scriptPath, {
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
      });
      return;
    }
    let generatedReport = null;
    try {
      generatedReport = JSON.parse(result.stdout);
    } catch {
      // Keep this as a warning because the file compare below is the hard gate.
      add('debt', 'components_css.generator_output.unparseable', 'CSS 生成脚本输出不是可解析 JSON', scriptPath);
    }
    if (generatedReport?.warnings?.length) {
      add('debt', 'components_css.generator_warnings', `CSS 生成脚本存在 warning：${firstLines(generatedReport.warnings)}`, scriptPath);
    }
    const generated = fs.readFileSync(path.join(tmpRoot, 'components.css'), 'utf8');
    if (generated !== css) {
      add('error', 'components_css.stale', 'components.css 与预览页重新生成结果不一致，请运行 .design_library/wegoux/scripts/extract-components-css.mjs');
    }
  } finally {
    fs.rmSync(tmpParent, { recursive: true, force: true });
  }
}

function checkTokens(options = {}) {
  const { projection = true } = options;
  const css = read('colors_and_type.css');
  const cssVars = extractCssVars(css);
  report.metrics.cssVariableCount = cssVars.size;

  for (const required of REQUIRED_TOKEN_VARS) {
    if (!cssVars.has(required)) {
      add('error', 'token.required_missing', `缺少关键 Token：${required}`, path.join(libraryRoot, 'colors_and_type.css'));
    }
  }

  if (!/--Brand-color-brand:\s*#03c160/i.test(css) && !/--color-brand:\s*var\(--Brand-color-brand\)/.test(css)) {
    add('error', 'token.brand.invalid', '品牌绿 Token 未保持为 #03C160 体系', path.join(libraryRoot, 'colors_and_type.css'));
  }

  if (!projection) return;

  const cssJson = readJson('css.json');
  if (cssJson) {
    for (const bucket of REQUIRED_CSS_JSON_BUCKETS) {
      if (!(bucket in cssJson)) {
        add('error', 'css_json.bucket_missing', `css.json 缺少顶层分组：${bucket}`, path.join(libraryRoot, 'css.json'));
      }
    }
    const jsonKeys = flattenJsonKeys(cssJson);
    const missingProjection = REQUIRED_TOKEN_VARS
      .map(token => token.slice(2))
      .filter(name => !jsonKeys.has(name));
    if (missingProjection.length > 0) {
      add('debt', 'css_json.required_projection_missing', `关键 Token 未在 css.json 中找到机器投影：${missingProjection.join(', ')}`, path.join(libraryRoot, 'css.json'));
    }
  }
}

function checkComponentContracts(slugs) {
  for (const slug of slugs) {
    const rel = `components/${slug}.json`;
    if (!exists(rel)) continue;
    const file = path.join(libraryRoot, rel);
    const contract = readJson(rel);
    if (!contract) continue;

    for (const field of ['slug', 'name', 'sourceKind', 'confidence', 'description']) {
      if (!(field in contract)) {
        add('error', 'contract.required_field_missing', `组件契约缺少基础字段：${field}`, file);
      }
    }
    if (contract.slug !== slug) {
      add('error', 'contract.slug_mismatch', `组件契约 slug 与文件名不一致：${contract.slug} !== ${slug}`, file);
    }
    if (!contract.designTokens && !contract.tokensConsumed) {
      add('error', 'contract.tokens_missing', '组件契约必须声明 designTokens 或 tokensConsumed', file);
    }

    for (const field of ['usageHints', 'doNotInvent', 'provenance']) {
      if (!(field in contract)) {
        add('debt', 'contract.future_field_missing', `组件契约建议补齐字段：${field}`, file);
      }
    }

    if (INTERACTIVE_COMPONENTS.has(slug)) {
      if (!contract.behavior) {
        add('debt', 'contract.behavior_missing', `可交互组件缺少 behavior 字段：${slug}`, file);
      }
      if (!contract.accessibility) {
        add('debt', 'contract.accessibility_missing', `可交互组件建议补齐 accessibility 字段：${slug}`, file);
      }
    }

    const serialized = JSON.stringify(contract);
    const hardcodedColors = serialized.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) || [];
    if (hardcodedColors.length > 0) {
      add('debt', 'contract.raw_color', `组件契约中含硬编码颜色，建议改为 Token：${firstLines([...new Set(hardcodedColors)])}`, file);
    }

    checkComponentMotion(slug, contract, file);
  }
}

function checkComponentMotion(slug, contract, file) {
  const previewName = EMBEDDED_PREVIEWS[slug] || `component-${slug}.html`;
  const previewRel = `preview/${previewName}`;
  const previewPath = path.join(libraryRoot, previewRel);
  const block = exists(previewRel) ? extractComponentBlock(read(previewRel)) || '' : '';
  const serialized = JSON.stringify(contract);
  const contractMentionsMotion = /transition|animation|duration|easing|ease|动效|动画|过渡/.test(serialized);
  const previewHasMotion = /\b(?:transition|animation)(?:-[a-z-]+)?\s*:/.test(block);

  if (!contractMentionsMotion && !previewHasMotion) return;

  if (contractMentionsMotion && !previewHasMotion) {
    add('debt', 'motion.contract_without_css', '组件契约声明了动效，但预览页核心 CSS 未发现 transition/animation 落地', file);
  }

  if (previewHasMotion) {
    if (!/var\(--duration-[^)]+\)/.test(block) && /\b\d+(?:ms|s)\b/.test(block)) {
      add('debt', 'motion.raw_duration', '组件动效时长应优先使用 --duration-* Token', previewPath);
    }
    if (!/var\(--ease-[^)]+\)/.test(block) && /cubic-bezier|linear|ease(?:-in|-out|-in-out)?/.test(block)) {
      add('debt', 'motion.raw_easing', '组件动效缓动应优先使用 --ease-* Token', previewPath);
    }
    if (INTERACTIVE_COMPONENTS.has(slug) && !contract.behavior) {
      add('debt', 'motion.behavior_missing', '含动效的交互组件应在契约 behavior 中说明状态变化规则', file);
    }
  }
}

function checkConsumptionContracts() {
  const consumption = readJson('library-consumption.json');
  const plan = readJson('uikit-plan.json');
  if (!consumption || !plan) return;

  const pathRefs = [];
  const collect = value => {
    if (Array.isArray(value)) {
      value.forEach(collect);
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(collect);
    } else if (typeof value === 'string') {
      if (/\.(json|css|html|md|svg|woff2?|ttf)$|\*$/.test(value)) pathRefs.push(value);
    }
  };
  collect(consumption);
  collect(plan);

  for (const ref of pathRefs) {
    if (ref.includes('{slug}') || ref.includes('*') || ref.includes('#')) continue;
    if (!fs.existsSync(path.join(libraryRoot, ref))) {
      add('debt', 'contract.path_missing', `消费契约或 UI Kit 计划引用了不存在的路径：${ref}`);
    }
  }

  const actualKitDirs = fs.existsSync(path.join(libraryRoot, 'ui_kits'))
    ? fs.readdirSync(path.join(libraryRoot, 'ui_kits'), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort()
    : [];
  const listedKits = new Set(consumption.uiKits || []);
  for (const kit of actualKitDirs) {
    if (!listedKits.has(kit)) {
      add('debt', 'consumption.uikit_missing', `library-consumption.json 未列出现有 UI Kit：${kit}`, path.join(libraryRoot, 'library-consumption.json'));
    }
  }

  const selectedFrames = plan.productContext?.selectedFrameNames || [];
  for (const frame of selectedFrames) {
    if (!fs.existsSync(path.join(libraryRoot, frame))) {
      add('error', 'uikit_plan.selected_frame_missing', `uikit-plan.json selectedFrameNames 路径不存在：${frame}`, path.join(libraryRoot, 'uikit-plan.json'));
    }
  }

  const textFiles = ['SKILL.md', 'README.md', 'library-consumption.json'];
  for (const rel of textFiles) {
    if (!exists(rel)) continue;
    const text = read(rel);
    if (hasLegacyIconsPath(text) && !exists('icons')) {
      add('debt', 'asset.path_legacy_icons', `文档仍引用 icons/，实际资产目录是 assets/icons/`, path.join(libraryRoot, rel));
    }
  }
}

function checkUiKits(componentClassSet, options = {}) {
  const { full = true, changedKits = new Set() } = options;
  const uiRoot = path.join(libraryRoot, 'ui_kits');
  if (!fs.existsSync(uiRoot)) return;
  const kitDirs = fs.readdirSync(uiRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .filter(entry => full || changedKits.has(entry.name));
  report.metrics.uiKits = kitDirs.map(entry => entry.name);

  for (const entry of kitDirs) {
    const kit = entry.name;
    const kitDir = path.join(uiRoot, kit);
    const indexPath = path.join(kitDir, 'index.html');
    const reportPath = path.join(kitDir, 'quality-report.json');
    if (!fs.existsSync(indexPath)) {
      add('error', 'uikit.index_missing', `UI Kit 缺少 index.html：${kit}`, indexPath);
      continue;
    }
    if (!fs.existsSync(reportPath)) {
      add('error', 'uikit.quality_missing', `UI Kit 缺少 quality-report.json：${kit}`, reportPath);
    }

    const html = fs.readFileSync(indexPath, 'utf8');
    if (!html.includes('../../colors_and_type.css') || !html.includes('../../components.css')) {
      add('error', 'uikit.css_links_missing', 'UI Kit 必须同时引入 colors_and_type.css 和 components.css', indexPath);
    }
    if (/lucide|unpkg\.com\/lucide/i.test(html)) {
      add('debt', 'uikit.lucide', 'UI Kit 仍使用 Lucide/CDN 图标，后续应替换为 iconfont 或随库资产', indexPath);
    }
    if (/<svg[\s>]/i.test(html)) {
      add('debt', 'uikit.inline_svg', 'UI Kit 存在 inline SVG，后续应回到组件或随库资产', indexPath);
    }

    const classes = classNamesFromHtml(html);
    const relevant = [...classes].filter(name => {
      if (ALLOWED_UIKIT_SHELL_CLASSES.has(name)) return false;
      if (/^(section|phone|uikit)-/.test(name)) return false;
      return true;
    });
    const reused = relevant.filter(name => componentClassSet.has(name));
    const measuredReuse = relevant.length ? reused.length / relevant.length : 1;

    let quality = null;
    if (fs.existsSync(reportPath)) {
      quality = readJson(path.relative(libraryRoot, reportPath));
      if (quality) {
        const threshold = strict ? 0.8 : 0.5;
        if (typeof quality.previewClassReuseRate === 'number' && quality.previewClassReuseRate < threshold) {
          add(strict ? 'error' : 'debt', 'uikit.reuse_rate_low', `UI Kit 组件复用率偏低：${quality.previewClassReuseRate} < ${threshold}`, reportPath);
        }
        if (typeof quality.previewClassReuseRate === 'number' && Math.abs(quality.previewClassReuseRate - measuredReuse) > 0.25) {
          add('debt', 'uikit.reuse_rate_drift', `quality-report 复用率与脚本估算差异较大：report=${quality.previewClassReuseRate}, measured=${measuredReuse.toFixed(2)}`, reportPath);
        }
        const invented = quality.inventedComponents || [];
        const nonShell = invented.filter(name => !ALLOWED_UIKIT_SHELL_CLASSES.has(name));
        if (nonShell.length > 0) {
          add('debt', 'uikit.invented_components', `UI Kit 质量报告中仍有非外壳发明组件：${nonShell.join(', ')}`, reportPath);
        } else if (invented.length > 0) {
          add('debt', 'uikit.shell_components', `UI Kit 仍记录 Showcase 外壳类：${invented.join(', ')}`, reportPath);
        }
      }
    }

    report.metrics[`uikit:${kit}:measuredReuseRate`] = Number(measuredReuse.toFixed(3));
  }
}

function checkDirectionDrift(options = {}) {
  const { full = true, changedLibraryFiles = [] } = options;
  const files = full
    ? DRIFT_SCAN_DIRS.flatMap(dir => listFiles(dir, candidate => /\.(json|html|css|md)$/.test(candidate)))
    : changedLibraryFiles
      .filter(rel => DRIFT_SCAN_DIRS.some(dir => rel.startsWith(`${dir}/`)))
      .filter(rel => /\.(json|html|css|md)$/.test(rel))
      .map(rel => path.join(libraryRoot, rel))
      .filter(file => fs.existsSync(file));

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of DRIFT_PATTERNS) {
      if (pattern.test(text)) {
        add('error', 'direction.drift', `发现可能导致方向漂移的 TRAE/桌面/IDE 语义：${pattern}`, file);
        break;
      }
    }
  }
}

function checkTrackedJunk() {
  const tracked = git(['ls-files']);
  if (tracked === null) return;
  const junk = tracked.split('\n').filter(file => /(^|\/)\.DS_Store$|^\.uploads\//.test(file));
  if (junk.length > 0) {
    add('error', 'git.tracked_junk', `禁止提交 .DS_Store 或 .uploads：${junk.join(', ')}`);
  }
}

function checkMetadataVersionGate(context) {
  const designChanges = context.changedFiles.filter(file => file.startsWith(rootRel + '/'));
  if (designChanges.length === 0) return;
  const metadataPath = `${rootRel}/metadata.json`;
  if (!designChanges.includes(metadataPath)) {
    add('error', 'metadata.version_required', `.design_library/wegoux 有变更但 metadata.json 未变更；正式迭代需要递增 version`);
  }
}

function main() {
  if (!['changed', 'full'].includes(requestedScope)) {
    add('error', 'args.scope_invalid', `--scope 只能是 changed 或 full，当前为：${requestedScope}`);
    return finish();
  }

  checkRequiredFiles();
  if (report.errors.length > 0) return finish();

  let slugs = checkComponentFiles({ full: false });
  const context = createContext(slugs);
  const full = context.effectiveScope === 'full';
  const scopedSlugs = full ? slugs : [...context.changedSlugs].filter(slug => slugs.includes(slug));

  report.scope = context.effectiveScope;
  report.metrics.changedFiles = context.changedFiles.length;
  report.metrics.changedComponents = scopedSlugs.length;
  report.metrics.changedUiKits = context.changedKits.size;
  if (context.validatorChanged || context.extractorChanged) {
    add('info', 'scope.promoted_full', '验证脚本或 CSS 抽取脚本发生变更，本次自动提升为 full 范围');
  }
  if (!full && context.changedFiles.length === 0) {
    add('info', 'scope.no_changes', '未检测到变更文件，仅执行全局硬门禁');
  }

  if (full || context.registryChanged || scopedSlugs.length > 0) {
    slugs = checkComponentFiles({ full, changedSlugs: new Set(scopedSlugs) });
  }

  const tokenCss = exists('colors_and_type.css') ? read('colors_and_type.css') : '';
  const declaredVars = extractCssVars(tokenCss);
  checkTokens({ projection: full || context.tokenChanged });

  if (full || context.tokenChanged || context.previewChanged || scopedSlugs.length > 0) {
    checkPreviewPages(slugs, declaredVars, { full, changedSlugs: new Set(scopedSlugs) });
  }

  checkComponentsCss({
    shouldRegenerate: full || context.tokenChanged || context.previewChanged || context.componentsCssChanged,
  });

  if (full || context.componentContractChanged || context.previewChanged || scopedSlugs.length > 0) {
    checkComponentContracts(full ? slugs : scopedSlugs);
  }

  if (full || context.consumptionChanged || context.registryChanged || context.tokenChanged || context.changedKits.size > 0) {
    checkConsumptionContracts();
  }

  const componentsCss = exists('components.css') ? read('components.css') : '';
  const componentClassSet = classesFromCss(componentsCss);
  report.metrics.componentCssClassCount = componentClassSet.size;
  if (full || context.changedKits.size > 0) {
    checkUiKits(componentClassSet, { full, changedKits: context.changedKits });
  }

  checkDirectionDrift({ full, changedLibraryFiles: context.libraryChangedFiles });
  checkTrackedJunk();
  checkMetadataVersionGate(context);

  finish();
}

function finish() {
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const title = report.errors.length === 0 ? 'wegoux 守门验证通过' : 'wegoux 守门验证失败';
    console.log(`\n${title}`);
    console.log(`模式：${report.mode} / 范围：${report.scope}`);
    console.log(`错误：${report.errors.length}，警告：${report.warnings.length}`);
    if (Object.keys(report.metrics).length > 0) {
      console.log(`指标：${JSON.stringify(report.metrics)}`);
    }
    if (report.errors.length > 0) {
      console.log('\n错误：');
      for (const item of report.errors) {
        console.log(`- [${item.code}] ${item.file ? item.file + '：' : ''}${item.message}`);
      }
    }
    if (report.warnings.length > 0) {
      console.log('\n警告：');
      for (const item of report.warnings) {
        console.log(`- [${item.code}] ${item.file ? item.file + '：' : ''}${item.message}`);
      }
    }
  }
  process.exit(report.errors.length > 0 ? 1 : 0);
}

main();
