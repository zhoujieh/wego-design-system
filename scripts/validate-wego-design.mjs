#!/usr/bin/env node

/**
 * validate-wego-design.mjs
 *
 * Automated guard checks for the wego-design design system. The default mode blocks
 * hard integrity failures and reports known debt as warnings. Use --strict to
 * promote debt warnings to failures as the library matures.
 *
 * Usage:
 *   node scripts/validate-wego-design.mjs
 *   node scripts/validate-wego-design.mjs --scope=changed --staged
 *   node scripts/validate-wego-design.mjs --scope=changed --base=origin/main
 *   node scripts/validate-wego-design.mjs --scope=full
 *   node scripts/validate-wego-design.mjs --scope=full --strict
 *   node scripts/validate-wego-design.mjs --json
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
const libraryRoot = path.resolve(repoRoot, rootArg ? rootArg.slice('--root='.length) : '.codex/skills/wego-design');
const rootRel = path.relative(repoRoot, libraryRoot) || '.';
const APP_ROOT_REL = 'wego-app';
const APP_ROOT = path.join(repoRoot, APP_ROOT_REL);
const SCENES_ROOT = path.join(APP_ROOT, 'scenes');
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
  '--palette-green-500',
  '--bg-brand',
  '--bg-page',
  '--bg-surface',
  '--text-default',
  '--text-secondary',
  '--body-md-font-family',
  '--number-md-font-family',
  '--body-md-font-size',
  '--spacer-16',
  '--radius-8',
  '--duration-fast',
  '--ease-standard',
  '--touch-min',
  '--touch-default',
  '--z-modal',
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

const REQUIRED_COMPONENT_CONTRACT_FIELDS = [
  'schemaVersion',
  'slug',
  'name',
  'category',
  'status',
  'sourceKind',
  'confidence',
  'description',
  'semanticTypeCandidates',
  'variantDimensions',
  'representativeVariants',
  'anatomy',
  'structurePatterns',
  'behavior',
  'accessibility',
  'usageHints',
  'doNotInvent',
  'tokensConsumed',
  'designTokens',
  'specRefs',
  'domAnatomy',
  'provenance',
  'unknowns',
];

const ALLOWED_OPTIONAL_CONTRACT_FIELDS = [
  'cssCustomProperties',
  'fixedTabs',
  'assets',
  'assetUsage',
];

const REQUIRED_PROVENANCE_FIELDS = [
  'preview',
  'cssSource',
  'embedded',
  'hostComponent',
];

const DOM_REQUIRED_COMPONENTS = new Set([
  'cell',
  'form',
  'navbar',
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
  'preview-shell',
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

// wego-app 场景模块禁止使用的 UI Kit Showcase 外壳类
const FORBIDDEN_PROTOTYPE_SHELL_CLASSES = new Set([
  'uikit-shell',
  'phone-header',
  'phone-header-back',
  'phone-header-title',
  'phone-body',
]);

const PREVIEW_SHELL_CLASSES = new Set([
  'preview-shell',
  'phone-frame',
  'phone-screen',
  'phone-status',
  'phone-indicator',
  'phone-indicator-bar',
]);

function hasResponsivePreviewShellRule(text) {
  const startsResponsiveRule = /@media\s*\([^)]*max-width\s*:\s*(?:640|767)px[^)]*\)/i.test(text);
  if (!startsResponsiveRule) return false;
  return /@media[\s\S]*\.phone-frame[\s\S]*border\s*:\s*none/i.test(text)
    && /@media[\s\S]*\.phone-frame[\s\S]*border-radius\s*:\s*0/i.test(text)
    && /@media[\s\S]*\.phone-frame[\s\S]*box-shadow\s*:\s*none/i.test(text)
    && /@media[\s\S]*\.phone-screen[\s\S]*border-radius\s*:\s*0/i.test(text);
}

const SURFACE_MATCH_STATUSES = new Set(['exact', 'near', 'fallback', 'gap']);
const PRESENTATION_TYPES = new Set(['push', 'modal', 'sheet', 'full-screen-modal']);
const HOST_CONTAINER_TABS = new Set(['my', 'workspace', 'dongtai', 'xiaoxi', 'haoyou']);
const HOST_ENTRY_TYPES = new Set(['cell', 'grid-entry']);

const INTERNAL_PROTOTYPE_COPY_PATTERNS = [
  /工作流验证任务/,
  /按\s*[`'"“”]?[\w-]+[`'"“”]?\s*范式/,
  /验证微购.*工作流/,
  /验证.*保存回填.*本地持久化/,
];

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

function stripFragment(ref) {
  return typeof ref === 'string' ? ref.split('#')[0] : ref;
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
    if (file === 'scripts/validate-wego-design.mjs') validatorChanged = true;
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

function parseHtmlAttrs(rawAttrs) {
  const attrs = {};
  const regex = /([:@a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = regex.exec(rawAttrs)) !== null) {
    const name = match[1];
    attrs[name] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attrs;
}

function htmlStartTags(html, tagName) {
  const tags = [];
  const regex = new RegExp(`<${tagName}\\b([^>]*)>`, 'gi');
  let match;
  while ((match = regex.exec(html)) !== null) {
    tags.push({ raw: match[0], attrs: parseHtmlAttrs(match[1] || '') });
  }
  return tags;
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

function stripCssComments(css) {
  // 移除 /* ... */ 注释，避免注释中提到的类名/变量被误判为实际使用
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function firstLines(items, limit = 8) {
  return items.slice(0, limit).join(', ') + (items.length > limit ? ` 等 ${items.length} 项` : '');
}

function checkRequiredFiles() {
  if (!fs.existsSync(libraryRoot)) {
    add('error', 'root.missing', '找不到 wego-design 设计系统根目录', libraryRoot);
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

  if (index.schemaVersion !== 3) {
    add('error', 'components.index.schema_version', `components/index.json schemaVersion 必须为 3，当前为 ${index.schemaVersion}`, path.join(libraryRoot, 'components/index.json'));
  }
  if (index.componentContractSchemaVersion !== 3) {
    add('error', 'components.index.contract_schema_version', `components/index.json componentContractSchemaVersion 必须为 3，当前为 ${index.componentContractSchemaVersion}`, path.join(libraryRoot, 'components/index.json'));
  }
  if (index.library !== 'wego-design') {
    add('error', 'components.index.library', `components/index.json library 必须为 wego-design，当前为 ${index.library}`, path.join(libraryRoot, 'components/index.json'));
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

    // 将组件 CSS 块内的局部 --xxx: 声明加入允许集
    const localVars = extractCssVars(block);
    for (const localVar of localVars) declaredVars.add(localVar);

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

  const tmpParent = fs.mkdtempSync(path.join(os.tmpdir(), 'wego-design-validate-'));
  const tmpRoot = path.join(tmpParent, 'wego-design');
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
      add('error', 'components_css.stale', 'components.css 与预览页重新生成结果不一致，请运行 .codex/skills/wego-design/scripts/extract-components-css.mjs');
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

  if (!/--palette-green-500:\s*#03c160/i.test(css) || !/--bg-brand:\s*var\(--palette-green-500\)/i.test(css)) {
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

    for (const field of REQUIRED_COMPONENT_CONTRACT_FIELDS) {
      if (!(field in contract)) {
        add('error', 'contract.required_field_missing', `组件契约缺少基础字段：${field}`, file);
      }
    }

    const actualKeys = Object.keys(contract);
    const missingFields = REQUIRED_COMPONENT_CONTRACT_FIELDS.filter(field => !(field in contract));
    const extraFields = actualKeys.filter(field => !REQUIRED_COMPONENT_CONTRACT_FIELDS.includes(field) && !ALLOWED_OPTIONAL_CONTRACT_FIELDS.includes(field));
    if (missingFields.length > 0) {
      add('error', 'contract.schema_missing_fields', `组件契约缺少 schemaVersion 3 规定字段：${missingFields.join(', ')}`, file);
    }
    if (extraFields.length > 0) {
      add('error', 'contract.schema_extra_fields', `组件契约仍含旧字段或未登记字段：${extraFields.join(', ')}`, file);
    }
    if (contract.schemaVersion !== 3) {
      add('error', 'contract.schema_version', `组件契约 schemaVersion 必须为 3，当前为 ${contract.schemaVersion}`, file);
    }
    if (contract.slug !== slug) {
      add('error', 'contract.slug_mismatch', `组件契约 slug 与文件名不一致：${contract.slug} !== ${slug}`, file);
    }
    if (!Array.isArray(contract.tokensConsumed) || contract.tokensConsumed.length === 0) {
      add('error', 'contract.tokens_missing', '组件契约必须声明非空 tokensConsumed', file);
    }
    for (const field of ['usageHints', 'doNotInvent', 'specRefs']) {
      if (!Array.isArray(contract[field]) || contract[field].length === 0) {
        add('error', 'contract.array_missing', `组件契约字段必须为非空数组：${field}`, file);
      }
    }
    if (!Array.isArray(contract.unknowns)) {
      add('error', 'contract.unknowns_invalid', '组件契约 unknowns 必须为数组', file);
    }
    if (!contract.designTokens || typeof contract.designTokens !== 'object' || Array.isArray(contract.designTokens)) {
      add('error', 'contract.design_tokens_invalid', '组件契约 designTokens 必须为对象', file);
    }
    if (!contract.variantDimensions || typeof contract.variantDimensions !== 'object' || Array.isArray(contract.variantDimensions)) {
      add('error', 'contract.variant_dimensions_invalid', '组件契约 variantDimensions 必须为对象', file);
    }
    if (!Array.isArray(contract.representativeVariants)) {
      add('error', 'contract.representative_variants_invalid', '组件契约 representativeVariants 必须为数组', file);
    }
    if (!Array.isArray(contract.anatomy) || contract.anatomy.length === 0) {
      add('error', 'contract.anatomy_invalid', '组件契约 anatomy 必须为非空数组', file);
    }
    if (!Array.isArray(contract.structurePatterns) || contract.structurePatterns.length === 0) {
      add('error', 'contract.structure_patterns_invalid', '组件契约 structurePatterns 必须为非空数组', file);
    }
    if (!contract.domAnatomy || typeof contract.domAnatomy !== 'object' || Array.isArray(contract.domAnatomy)) {
      add('error', 'contract.dom_anatomy_invalid', '组件契约 domAnatomy 必须为对象', file);
    }

    if (!contract.provenance || typeof contract.provenance !== 'object' || Array.isArray(contract.provenance)) {
      add('error', 'contract.provenance_invalid', '组件契约 provenance 必须为对象', file);
    } else {
      for (const field of REQUIRED_PROVENANCE_FIELDS) {
        if (!(field in contract.provenance)) {
          add('error', 'contract.provenance_missing_field', `组件契约 provenance 缺少字段：${field}`, file);
        }
      }
      if (typeof contract.provenance.preview !== 'string' || !contract.provenance.preview) {
        add('error', 'contract.provenance_preview_invalid', '组件契约 provenance.preview 必须为非空字符串', file);
      } else if (!exists(stripFragment(contract.provenance.preview))) {
        add('error', 'contract.provenance_preview_missing', `组件契约 provenance.preview 路径不存在：${contract.provenance.preview}`, file);
      }
      if (typeof contract.provenance.cssSource !== 'string' || !contract.provenance.cssSource) {
        add('error', 'contract.provenance_css_source_invalid', '组件契约 provenance.cssSource 必须为非空字符串', file);
      } else if (!exists(stripFragment(contract.provenance.cssSource))) {
        add('error', 'contract.provenance_css_source_missing', `组件契约 provenance.cssSource 路径不存在：${contract.provenance.cssSource}`, file);
      }
      if (typeof contract.provenance.embedded !== 'boolean') {
        add('error', 'contract.provenance_embedded_invalid', '组件契约 provenance.embedded 必须为布尔值', file);
      }
      if (contract.provenance.embedded && typeof contract.provenance.hostComponent !== 'string') {
        add('error', 'contract.provenance_host_required', '嵌入式组件必须声明字符串类型的 provenance.hostComponent', file);
      }
      if (!contract.provenance.embedded && contract.provenance.hostComponent !== null) {
        add('error', 'contract.provenance_host_null', '非嵌入式组件 provenance.hostComponent 必须为 null', file);
      }
    }

    if (INTERACTIVE_COMPONENTS.has(slug)) {
      if (!contract.behavior || typeof contract.behavior !== 'object' || Array.isArray(contract.behavior) || Object.keys(contract.behavior).length === 0) {
        add('error', 'contract.behavior_missing', `可交互组件缺少非空 behavior 字段：${slug}`, file);
      }
      if (!contract.accessibility || typeof contract.accessibility !== 'object' || Array.isArray(contract.accessibility) || Object.keys(contract.accessibility).length === 0) {
        add('error', 'contract.accessibility_missing', `可交互组件缺少非空 accessibility 字段：${slug}`, file);
      }
    }
    if (DOM_REQUIRED_COMPONENTS.has(slug) && Object.keys(contract.domAnatomy || {}).length === 0) {
      add('error', 'contract.dom_anatomy_required', `组合组件必须补齐 domAnatomy：${slug}`, file);
    }

    const serialized = JSON.stringify(contract);
    const hardcodedColors = serialized.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) || [];
    if (hardcodedColors.length > 0) {
      add('error', 'contract.raw_color', `组件契约中含硬编码颜色，应改为 Token：${firstLines([...new Set(hardcodedColors)])}`, file);
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
  const componentIndex = readJson('components/index.json');
  const metadata = readJson('metadata.json');
  if (!consumption || !plan || !metadata) return;

  if (consumption.schemaVersion !== 3) {
    add('error', 'consumption.schema_version', `library-consumption.json schemaVersion 必须为 3，当前为 ${consumption.schemaVersion}`, path.join(libraryRoot, 'library-consumption.json'));
  }
  if (consumption.componentContractSchemaVersion !== 3) {
    add('error', 'consumption.contract_schema_version', `library-consumption.json componentContractSchemaVersion 必须为 3，当前为 ${consumption.componentContractSchemaVersion}`, path.join(libraryRoot, 'library-consumption.json'));
  }
  if (plan.schemaVersion !== 3) {
    add('error', 'uikit_plan.schema_version', `uikit-plan.json schemaVersion 必须为 3，当前为 ${plan.schemaVersion}`, path.join(libraryRoot, 'uikit-plan.json'));
  }
  if (plan.componentContractSchemaVersion !== 3) {
    add('error', 'uikit_plan.contract_schema_version', `uikit-plan.json componentContractSchemaVersion 必须为 3，当前为 ${plan.componentContractSchemaVersion}`, path.join(libraryRoot, 'uikit-plan.json'));
  }

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
    if (/\s/.test(ref)) continue;
    const base = ref.startsWith(`${APP_ROOT_REL}/`) ? repoRoot : libraryRoot;
    if (!fs.existsSync(path.join(base, ref))) {
      add('debt', 'contract.path_missing', `消费契约或 UI Kit 计划引用了不存在的路径：${ref}`);
    }
  }

  const actualKitDirs = fs.existsSync(path.join(libraryRoot, 'ui_kits'))
    ? fs.readdirSync(path.join(libraryRoot, 'ui_kits'), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort()
    : [];
  const actualKitSet = new Set(actualKitDirs);
  const consumptionKits = new Set(consumption.uiKits || []);
  const planKits = new Set((plan.uiKits || []).map(kit => kit?.slug).filter(Boolean));
  const componentIndexKits = new Set((componentIndex?.uiKits || []).map(kit => kit?.slug).filter(Boolean));
  if (!Array.isArray(metadata.uiKits)) {
    add('error', 'metadata.uikits_missing', 'metadata.json 必须包含 uiKits 数组，供 UI Kit 迭代确认全集', path.join(libraryRoot, 'metadata.json'));
  }
  const metadataKits = new Set((metadata.uiKits || []).map(kit => kit?.slug).filter(Boolean));
  const registrySources = [
    ['metadata.json', metadataKits],
    ['library-consumption.json', consumptionKits],
    ['uikit-plan.json', planKits],
    ['components/index.json', componentIndexKits],
  ];

  const sameSet = (a, b) => a.size === b.size && [...a].every(item => b.has(item));

  for (const [source, listedKits] of registrySources) {
    for (const kit of actualKitDirs) {
      if (!listedKits.has(kit)) {
        add('error', 'uikit.registry_missing', `${source} 未列出现有 UI Kit：${kit}`, path.join(libraryRoot, source));
      }
    }
    for (const kit of listedKits) {
      if (!actualKitSet.has(kit)) {
        add('error', 'uikit.registry_stale', `${source} 登记了不存在的 UI Kit：${kit}`, path.join(libraryRoot, source));
      }
    }
  }

  if (!sameSet(consumptionKits, planKits) || !sameSet(consumptionKits, componentIndexKits)) {
    add('error', 'uikit.registry_mismatch', 'library-consumption.json、uikit-plan.json、components/index.json 的 UI Kit 清单必须保持一致', path.join(libraryRoot, 'library-consumption.json'));
  }
  if (!sameSet(consumptionKits, metadataKits)) {
    add('error', 'uikit.metadata_registry_mismatch', 'metadata.json、library-consumption.json、uikit-plan.json、components/index.json 的 UI Kit 清单必须保持一致', path.join(libraryRoot, 'metadata.json'));
  }

  for (const kit of metadata.uiKits || []) {
    if (!kit?.slug || typeof kit.slug !== 'string') {
      add('error', 'metadata.uikit_slug_missing', 'metadata.json uiKits[] 每项必须包含 slug', path.join(libraryRoot, 'metadata.json'));
      continue;
    }
    for (const field of ['entry', 'qualityReport']) {
      if (typeof kit[field] !== 'string' || !kit[field]) {
        add('error', 'metadata.uikit_ref_missing', `metadata.json 中 ${kit.slug} 缺少 ${field}`, path.join(libraryRoot, 'metadata.json'));
      } else if (!fs.existsSync(path.join(libraryRoot, kit[field]))) {
        add('error', 'metadata.uikit_ref_path_missing', `metadata.json 中 ${kit.slug}.${field} 路径不存在：${kit[field]}`, path.join(libraryRoot, 'metadata.json'));
      }
    }
  }

  const deliveryGuardrails = Array.isArray(consumption.deliveryGuardrails) ? consumption.deliveryGuardrails : [];
  const hasPositiveTopLevelLinkRule = deliveryGuardrails.some(line =>
    /页面间通过\s*<a>|<a>\s*标签跳转/i.test(line) && !/禁止|不得|不能/.test(line)
  );
  if (hasPositiveTopLevelLinkRule) {
    add('error', 'delivery.guardrail_top_level_link', 'deliveryGuardrails 不能要求通过普通 <a> 跳转 scenes/*.html；wego-app 必须使用 hash route、scene.js 注册或 overlay trigger', path.join(libraryRoot, 'library-consumption.json'));
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

  if (!pathRefs.some(ref => ref === 'assets/icons/app-center/*.svg')) {
    add('error', 'asset.app_center_icons_missing', 'library-consumption.json 必须显式登记 assets/icons/app-center/*.svg', path.join(libraryRoot, 'library-consumption.json'));
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
    const hasPreviewShell = /\b(?:uikit-shell|preview-shell|phone-frame|phone-screen)\b/.test(html);
    if (hasPreviewShell && !hasResponsivePreviewShellRule(html)) {
      add('error', 'uikit.preview_shell_responsive_missing',
        'UI Kit 使用手机预览外壳时，必须包含移动端隐藏外壳视觉的 media query',
        indexPath);
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

function checkSingleShellRuleConflicts(context) {
  const ruleFiles = [
    path.join(libraryRoot, 'library-consumption.json'),
    path.join(libraryRoot, 'uikit-plan.json'),
    path.join(libraryRoot, 'specs/交互设计原则.md'),
    path.join(libraryRoot, '..', 'wego-ux', 'SKILL.md'),
    path.join(libraryRoot, '..', 'wego-ux', 'templates/page-shell.html'),
    path.join(libraryRoot, '..', 'wego-ux', 'templates/page.css'),
    path.join(libraryRoot, '..', 'wego-tests', 'SKILL.md'),
  ].map(file => path.resolve(file));
  const changedAbs = new Set(context.changedFiles.map(file => path.resolve(repoRoot, file)));
  const full = context.effectiveScope === 'full';
  const isNegated = line => /禁止|不得|不能|不允许|避免|不要/.test(line);

  for (const file of ruleFiles) {
    if (!fs.existsSync(file)) continue;
    if (!full && !changedAbs.has(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const rel = path.relative(repoRoot, file);
    const lines = text.split('\n');

    lines.forEach((line, index) => {
      if (/页面间通过\s*<a>|<a>\s*标签跳转|<a>`?\s*标签或\s*`?location\.href|目标页为独立 HTML 文档|浏览器原生导航/.test(line) && !isNegated(line)) {
        add('error', 'single_shell.top_level_navigation_rule', `单预览壳规则禁止把页面切换定义为浏览器顶层跳转：${line.trim()}`, file, { line: index + 1, file: rel });
      }
      if (/壳内 overlay \+ fetch|fetch 内容片段|JS 动态加载业务片段|通过 JS 动态加载到 overlay/.test(line) && !isNegated(line)) {
        add('error', 'single_shell.fetch_fragment_rule', `file:// 兼容规则禁止把 modal 依赖 fetch/XHR 加载本地片段：${line.trim()}`, file, { line: index + 1, file: rel });
      }
    });

    if (/模态层[^。\n]*position:\s*fixed[^。\n]*不要用 position:\s*absolute/.test(text)
      || /overlay 样式[^。\n`]*`position:\s*fixed;\s*inset:\s*0/.test(text)
      || /\.modal-overlay\s*\{[\s\S]{0,160}position:\s*fixed/.test(text)) {
      add('error', 'single_shell.fixed_modal_rule', 'modal-overlay 必须限制在 .phone-screen 内，不能使用浏览器级 position: fixed; inset: 0', file);
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

  const physicalJunk = [];
  const walk = current => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const full = path.join(current, entry.name);
      const rel = path.relative(repoRoot, full);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/(^|\/)\.DS_Store$|^\.uploads\//.test(rel)) {
        physicalJunk.push(rel);
      }
    }
  };
  walk(repoRoot);
  if (physicalJunk.length > 0) {
    add('error', 'repo.junk_file', `工作区禁止保留 .DS_Store 或 .uploads 文件：${firstLines(physicalJunk)}`);
  }
}

function getSceneFoldersFromChangedFiles(changedFiles) {
  const scenes = new Set();
  for (const file of changedFiles) {
    const parts = file.split('/');
    if (parts[0] === APP_ROOT_REL && parts[1] === 'scenes' && parts[2]) {
      const scenePath = path.join(SCENES_ROOT, parts[2]);
      if (fs.existsSync(scenePath) && fs.statSync(scenePath).isDirectory()) {
        scenes.add(parts[2]);
      }
    }
  }
  return [...scenes].sort();
}

function getAllSceneFolders() {
  if (!fs.existsSync(SCENES_ROOT)) return [];
  return fs.readdirSync(SCENES_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
    .map(entry => entry.name)
    .sort();
}

function listFilesInDir(abs, extensions = null, options = {}) {
  if (!fs.existsSync(abs)) return [];
  const { skipLib = false, skipScenes = false } = options;
  const out = [];
  const walk = current => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = path.join(current, entry.name);
      const rel = path.relative(abs, full);
      if (entry.isDirectory() && skipLib && rel === 'lib') continue;
      if (entry.isDirectory() && skipScenes && rel === 'scenes') continue;
      if (entry.isDirectory()) {
        walk(full);
      } else if (!extensions || extensions.has(path.extname(entry.name))) {
        out.push(full);
      }
    }
  };
  walk(abs);
  return out.sort();
}

function listSceneFiles(scene, extensions = null) {
  return listFilesInDir(path.join(SCENES_ROOT, scene), extensions, { skipLib: true });
}

function listAppShellFiles(extensions = null) {
  return listFilesInDir(APP_ROOT, extensions, { skipLib: true, skipScenes: true });
}

function readJsonFile(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    add('error', 'json.invalid', 'JSON 文件无法解析', file);
    return null;
  }
}

function checkPrototypeSurfaceDesigns(context) {
  const scenes = context.effectiveScope === 'full'
    ? getAllSceneFolders()
    : getSceneFoldersFromChangedFiles(context.changedFiles);
  if (scenes.length === 0) return;

  const uikitPlan = readJson('uikit-plan.json') || {};
  const pagePatternIds = new Set((uikitPlan.pagePatterns || []).map(item => item.slug).filter(Boolean));
  const fallbackBlueprintIds = new Set((uikitPlan.fallbackPageBlueprints || []).map(item => item.id).filter(Boolean));
  const routesPath = path.join(APP_ROOT, 'js/routes.js');
  const registeredRoutes = fs.existsSync(routesPath) ? fs.readFileSync(routesPath, 'utf8') : '';
  let checkedPlans = 0;
  for (const scene of scenes) {
    const scenePath = path.join(SCENES_ROOT, scene);
    const specDir = path.join(scenePath, '_spec');
    const pageSpecPath = path.join(specDir, 'page_spec.json');
    const planPath = path.join(specDir, 'design_consumption_plan.json');
    if (!fs.existsSync(pageSpecPath) || !fs.existsSync(planPath)) {
      add('error', 'app_scene.spec_missing',
        'App 场景必须包含 _spec/page_spec.json 和 _spec/design_consumption_plan.json',
        scenePath);
      continue;
    }

    const pageSpec = readJsonFile(pageSpecPath);
    const routeId = pageSpec?.route_id;
    const appTarget = pageSpec?.app_target;
    if (!appTarget || appTarget.mode !== 'wego-app-scene') {
      add('error', 'app_scene.target_missing',
        'page_spec.app_target.mode 必须为 wego-app-scene',
        pageSpecPath);
    }
    if (appTarget?.app_root && appTarget.app_root !== APP_ROOT_REL) {
      add('error', 'app_scene.app_root_invalid',
        `page_spec.app_target.app_root 必须为 ${APP_ROOT_REL}`,
        pageSpecPath);
    }
    if (appTarget?.scene_folder && path.normalize(appTarget.scene_folder) !== path.normalize(`${APP_ROOT_REL}/scenes/${scene}`)) {
      add('error', 'app_scene.folder_mismatch',
        `page_spec.app_target.scene_folder 必须指向当前场景目录：${APP_ROOT_REL}/scenes/${scene}`,
        pageSpecPath);
    }
    if (appTarget?.route_mode && appTarget.route_mode !== 'hash') {
      add('error', 'app_scene.route_mode_invalid',
        'page_spec.app_target.route_mode 必须为 hash',
        pageSpecPath);
    }
    if (routeId && !registeredRoutes.includes(routeId)) {
      add('error', 'app_scene.route_not_registered',
        `route_id 未在 wego-app/js/routes.js 注册：${routeId}`,
        routesPath);
    }

    const sceneJsPath = path.join(scenePath, 'scene.js');
    if (!fs.existsSync(sceneJsPath)) {
      add('error', 'app_scene.scene_js_missing', 'App 场景必须包含 scene.js', sceneJsPath);
    } else {
      const sceneJs = fs.readFileSync(sceneJsPath, 'utf8');
      if (!/WegoApp\.registerScene\s*\(/.test(sceneJs)) {
        add('error', 'app_scene.register_missing', 'scene.js 必须调用 window.WegoApp.registerScene()', sceneJsPath);
      }
      if (routeId && !sceneJs.includes(routeId)) {
        add('error', 'app_scene.route_id_missing_in_scene', `scene.js 必须包含当前 route_id：${routeId}`, sceneJsPath);
      }
    }

    checkedPlans++;
    const plan = readJsonFile(planPath);
    if (!plan) continue;
    if (plan.app_target?.route_id && routeId && plan.app_target.route_id !== routeId) {
      add('error', 'app_scene.plan_route_mismatch',
        `design_consumption_plan.app_target.route_id 与 page_spec.route_id 不一致：${plan.app_target.route_id} !== ${routeId}`,
        planPath);
    }
    const presentationType = plan.page_presentation?.type;
    if (presentationType && !PRESENTATION_TYPES.has(presentationType)) {
      add('error', 'prototype.presentation_type_invalid',
        `page_presentation.type 必须是 push/modal/sheet/full-screen-modal，当前为 ${presentationType}`,
        planPath);
    }
    const surfaces = Array.isArray(plan.surface_designs) ? plan.surface_designs : null;
    if (!surfaces || surfaces.length === 0) {
      add('error', 'prototype.surface_designs_missing',
        'design_consumption_plan.json 必须包含 surface_designs[]，逐页面声明 exact/near/fallback/gap 设计依据',
        planPath);
      continue;
    }

    const seen = new Set();
    for (const surface of surfaces) {
      const id = surface?.surface_id;
      if (!id || typeof id !== 'string') {
        add('error', 'prototype.surface_id_missing', 'surface_designs[] 每项必须包含 surface_id', planPath);
        continue;
      }
      if (seen.has(id)) {
        add('error', 'prototype.surface_id_duplicate', `surface_id 重复：${id}`, planPath);
      }
      seen.add(id);

      if (!SURFACE_MATCH_STATUSES.has(surface.match_status)) {
        add('error', 'prototype.surface_match_status_invalid',
          `surface ${id} 的 match_status 必须是 exact/near/fallback/gap`,
          planPath);
      }
      if ((surface.match_status === 'exact' || surface.match_status === 'near') && !surface.matched_page_pattern) {
        add('error', 'prototype.surface_page_pattern_missing',
          `surface ${id} 为 ${surface.match_status} 时必须声明 matched_page_pattern`,
          planPath);
      }
      if ((surface.match_status === 'exact' || surface.match_status === 'near') && surface.matched_page_pattern && !pagePatternIds.has(surface.matched_page_pattern)) {
        add('error', 'prototype.surface_page_pattern_unknown',
          `surface ${id} 引用了不存在的 pagePattern：${surface.matched_page_pattern}`,
          planPath);
      }
      if (surface.match_status === 'fallback' && !surface.matched_blueprint) {
        add('error', 'prototype.surface_blueprint_missing',
          `surface ${id} 为 fallback 时必须声明 matched_blueprint`,
          planPath);
      }
      if (surface.match_status === 'fallback' && surface.matched_blueprint && !fallbackBlueprintIds.has(surface.matched_blueprint)) {
        add('error', 'prototype.surface_blueprint_unknown',
          `surface ${id} 引用了不存在的 fallback blueprint：${surface.matched_blueprint}`,
          planPath);
      }
      if (surface.match_status === 'gap' && !surface.design_gap) {
        add('error', 'prototype.surface_gap_reason_missing',
          `surface ${id} 为 gap 时必须声明 design_gap`,
          planPath);
      }
      if (surface.match_status === 'gap') {
        add('error', 'prototype.surface_gap_present',
          `surface ${id} 仍是 gap，不能进入原型交付；请先补齐 blueprint/UI Kit/组件契约`,
          planPath);
      }
      if (!Array.isArray(surface.component_mapping)) {
        add('error', 'prototype.surface_component_mapping_missing',
          `surface ${id} 必须包含 component_mapping[]`,
          planPath);
      }
      if (!Array.isArray(surface.allowed_page_styles)) {
        add('error', 'prototype.surface_allowed_styles_missing',
          `surface ${id} 必须包含 allowed_page_styles[]`,
          planPath);
      }
    }

    if (pageSpec) {
      const pageSurfaces = Array.isArray(pageSpec?.page_surfaces) ? pageSpec.page_surfaces : [];
    if (pageSurfaces.length === 0) {
        add('error', 'prototype.page_surfaces_missing',
          'page_spec.json 必须包含 page_surfaces[]，供 design_consumption_plan.surface_designs[] 覆盖',
          pageSpecPath);
      }
      for (const pageSurface of pageSurfaces) {
        const id = pageSurface?.id;
        if (id && !seen.has(id)) {
          add('error', 'prototype.surface_not_covered',
            `page_spec.page_surfaces[] 中的 ${id} 未被 design_consumption_plan.surface_designs[] 覆盖`,
            planPath);
        }
      }

      const hostContainer = pageSpec?.host_container;
      const routeId = pageSpec?.route_id;
      if ((hostContainer && !routeId) || (!hostContainer && routeId)) {
        add('error', 'prototype.host_route_pair_required',
          'page_spec.json 中 host_container 和 route_id 必须成对出现',
          pageSpecPath);
      }
      if (hostContainer) {
        if (typeof hostContainer !== 'object' || Array.isArray(hostContainer)) {
          add('error', 'prototype.host_container_invalid', 'page_spec.host_container 必须为对象', pageSpecPath);
        } else {
          if (!HOST_CONTAINER_TABS.has(hostContainer.tab)) {
            add('error', 'prototype.host_container_tab_invalid',
              'page_spec.host_container.tab 必须是 my/workspace/dongtai/xiaoxi/haoyou 之一',
              pageSpecPath);
          }
          if (typeof hostContainer.entry_label !== 'string' || !hostContainer.entry_label.trim()) {
            add('error', 'prototype.host_container_entry_missing',
              'page_spec.host_container.entry_label 必须为非空字符串',
              pageSpecPath);
          }
          if (typeof hostContainer.subentry_label !== 'string') {
            add('error', 'prototype.host_container_subentry_invalid',
              'page_spec.host_container.subentry_label 必须为字符串，可为空',
              pageSpecPath);
          }
          if (![1, 2, 3].includes(hostContainer.leaf_level)) {
            add('error', 'prototype.host_container_leaf_level_invalid',
              'page_spec.host_container.leaf_level 必须为 1/2/3',
              pageSpecPath);
          }
          if (!HOST_ENTRY_TYPES.has(hostContainer.entry_type)) {
            add('error', 'prototype.host_container_entry_type_invalid',
              'page_spec.host_container.entry_type 必须为 cell 或 grid-entry',
              pageSpecPath);
          }
          if (typeof hostContainer.needs_host_entry_surface !== 'boolean') {
            add('error', 'prototype.host_container_host_entry_flag_invalid',
              'page_spec.host_container.needs_host_entry_surface 必须为布尔值',
              pageSpecPath);
          }
          if (hostContainer.needs_host_entry_surface) {
            const hasHostEntry = pageSurfaces.some(surface => surface?.role === 'host-entry' || surface?.id === 'host-entry');
            if (!hasHostEntry) {
              add('error', 'prototype.host_container_host_entry_missing',
                '声明 host_container.needs_host_entry_surface=true 时，page_surfaces[] 必须包含 host-entry',
                pageSpecPath);
            }
          }
        }
      }
      if (routeId && (typeof routeId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(routeId))) {
        add('error', 'prototype.route_id_invalid',
          'page_spec.route_id 必须为 kebab-case 稳定键，例如 my-settings-price-rule',
          pageSpecPath);
      }
    }
  }

  report.metrics.prototypeSurfacePlans = checkedPlans;
}

function checkPrototypeJunkAndInternalCopy(context) {
  const scenes = context.effectiveScope === 'full'
    ? getAllSceneFolders()
    : getSceneFoldersFromChangedFiles(context.changedFiles);
  const scanRoots = scenes.map(scene => path.join(SCENES_ROOT, scene));
  if (context.effectiveScope === 'full' || context.changedFiles.some(file => file.startsWith(`${APP_ROOT_REL}/`) && !file.startsWith(`${APP_ROOT_REL}/lib/`))) {
    scanRoots.push(APP_ROOT);
  }

  let scannedTextFiles = 0;
  for (const root of scanRoots) {
    const allFiles = listFilesInDir(root, null, { skipLib: true });
    for (const file of allFiles) {
      if (path.basename(file) === '.DS_Store') {
        add('error', 'prototype.junk_file', 'wego-app 场景禁止包含 .DS_Store', file);
      }
    }

    const textFiles = listFilesInDir(root, new Set(['.html', '.js']), { skipLib: true });
    for (const file of textFiles) {
      scannedTextFiles++;
      const text = fs.readFileSync(file, 'utf8');
      if (/\bfetch\s*\(|XMLHttpRequest\b/.test(text)) {
        add('error', 'app_scene.fetch_forbidden',
          'wego-app 运行时禁止依赖 fetch()/XHR 读取本地 HTML 片段；请通过 scene.js 注册 template',
          file);
      }
      for (const pattern of INTERNAL_PROTOTYPE_COPY_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
          add('error', 'prototype.internal_copy',
            `原型用户可见文案疑似包含内部工作流说明：${match[0]}`,
            file);
          break;
        }
      }
    }
  }

  report.metrics.prototypeTextFilesScanned = scannedTextFiles;
}

function checkPrototypeShellLeakage(context) {
  const scenes = context.effectiveScope === 'full'
    ? getAllSceneFolders()
    : getSceneFoldersFromChangedFiles(context.changedFiles);

  let scannedFiles = 0;
  let hasResponsivePreviewCss = false;
  for (const file of listAppShellFiles(new Set(['.css']))) {
    if (hasResponsivePreviewShellRule(fs.readFileSync(file, 'utf8'))) hasResponsivePreviewCss = true;
  }
  for (const scene of scenes) {
    for (const file of listSceneFiles(scene, new Set(['.html', '.css', '.js']))) {
      scannedFiles++;
      const ext = path.extname(file);
      const content = fs.readFileSync(file, 'utf8');
      let classes = new Set();
      let cssText = '';
      if (ext === '.html') {
        classes = classNamesFromHtml(content);
        cssText = stripCssComments(extractStyleBlocks(content));
      } else if (ext === '.css') {
        classes = classesFromCss(stripCssComments(content));
        cssText = stripCssComments(content);
      } else {
        classes = classNamesFromHtml(content);
      }
      const shellHits = [...classes].filter(name => FORBIDDEN_PROTOTYPE_SHELL_CLASSES.has(name) || PREVIEW_SHELL_CLASSES.has(name));
      if (shellHits.length > 0) {
        add('error', 'app_scene.shell_leakage',
          `业务场景不得包含预览外壳或 UI Kit Showcase 内部模拟类：${shellHits.join(', ')}`,
          file);
      }
      if (ext === '.css' && /\.modal-overlay\b[\s\S]*?\{[\s\S]*?position\s*:\s*fixed\s*;[\s\S]*?inset\s*:\s*0\s*;/.test(cssText)) {
        add('error', 'prototype.modal_overlay.viewport_fixed',
          'App 场景中的 modal-overlay 必须限制在 .phone-screen 内；不要使用浏览器级 position: fixed; inset: 0',
          file);
      }
    }
  }
  if (fs.existsSync(APP_ROOT) && !hasResponsivePreviewCss) {
    add('error', 'prototype.preview_shell_responsive_missing',
      'wego-app 使用手机预览外壳时，必须包含移动端隐藏外壳视觉的 media query',
      path.join(APP_ROOT, 'css/app.css'));
  }
  report.metrics.prototypeScannedFiles = scannedFiles;
  report.metrics.prototypeScenes = scenes.length;
}

function checkPrototypeSinglePreviewShellRouting(context) {
  const indexPath = path.join(APP_ROOT, 'index.html');
  if (!fs.existsSync(indexPath)) {
    add('error', 'app.index_missing', '缺少 wego-app/index.html 唯一宿主入口', indexPath);
    return;
  }

  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const indexClasses = classNamesFromHtml(indexHtml);
  for (const requiredClass of ['preview-shell', 'phone-frame', 'phone-screen']) {
    if (!indexClasses.has(requiredClass)) {
      add('error', 'prototype.preview_shell.index_missing',
        `wego-app/index.html 必须包含唯一手机壳容器 .${requiredClass}`,
        indexPath);
    }
  }

  const appHtmlFiles = listFilesInDir(APP_ROOT, new Set(['.html']), { skipLib: true });
  const nonIndexShellFiles = appHtmlFiles.filter(file => file !== indexPath)
    .filter(file => [...classNamesFromHtml(fs.readFileSync(file, 'utf8'))].some(name => PREVIEW_SHELL_CLASSES.has(name)));
  if (nonIndexShellFiles.length > 0) {
    add('error', 'prototype.preview_shell.multiple',
      `wego-app 只能有 index.html 一套手机壳，其他含外壳页面：${nonIndexShellFiles.map(file => path.relative(APP_ROOT, file)).join(', ')}`,
      APP_ROOT);
  }

  for (const tag of htmlStartTags(indexHtml, 'a')) {
    const href = tag.attrs.href || '';
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)) {
      continue;
    }
    const resolved = path.normalize(path.resolve(path.dirname(indexPath), href.split(/[?#]/)[0]));
    const pointsToSceneHtml = resolved.startsWith(SCENES_ROOT + path.sep) && path.extname(resolved) === '.html';
    if (pointsToSceneHtml) {
      add('error', 'prototype.route.top_level_scene_link',
        `wego-app/index.html 禁止普通链接跳到 scenes/*.html；应使用 hash route + scene.js 注册：${href}`,
        indexPath);
    }
  }
}

function checkPrototypeHostShellUniqueness(context) {
  if (!fs.existsSync(APP_ROOT)) return;
  const htmlFiles = listFilesInDir(APP_ROOT, new Set(['.html']), { skipLib: true });
  const hostShellFiles = htmlFiles.filter(file => fs.readFileSync(file, 'utf8').includes('data-host-shell="true"'));
  const indexPath = path.join(APP_ROOT, 'index.html');
  if (hostShellFiles.length !== 1 || hostShellFiles[0] !== indexPath) {
    add('error', 'prototype.host_shell.invalid',
      'wego-app 只能在 index.html 存在一套 data-host-shell=\"true\" 宿主壳',
      APP_ROOT);
  }
}

function checkWegoAppStructure(context) {
  const appTouched = context.effectiveScope === 'full' || context.changedFiles.some(file => file.startsWith(`${APP_ROOT_REL}/`));
  if (!appTouched && !fs.existsSync(APP_ROOT)) return;
  const required = [
    'index.html',
    'css/app.css',
    'js/app.js',
    'js/routes.js',
    'lib/colors_and_type.css',
    'lib/components.css',
    'lib/iconfont.css',
    'lib/fonts',
    'lib/icons',
    'lib/image',
  ];
  for (const rel of required) {
    const target = path.join(APP_ROOT, rel);
    if (!fs.existsSync(target)) {
      add('error', 'app.required_missing', `wego-app 缺少必需路径：${rel}`, target);
    }
  }
}

function checkMetadataVersionGate(context) {
  const designChanges = context.changedFiles.filter(file => file.startsWith(rootRel + '/'));
  if (designChanges.length === 0) return;
  const metadataPath = `${rootRel}/metadata.json`;
  if (!designChanges.includes(metadataPath)) {
    add('error', 'metadata.version_required', `wego-design 有变更但 metadata.json 未变更；正式迭代需要递增 version`);
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

  if (full || context.consumptionChanged || context.registryChanged || context.tokenChanged || context.changedKits.size > 0 || context.metadataChanged) {
    checkConsumptionContracts();
  }

  const componentsCss = exists('components.css') ? read('components.css') : '';
  const componentClassSet = classesFromCss(componentsCss);
  report.metrics.componentCssClassCount = componentClassSet.size;
  if (full || context.changedKits.size > 0) {
    checkUiKits(componentClassSet, { full, changedKits: context.changedKits });
  }

  checkDirectionDrift({ full, changedLibraryFiles: context.libraryChangedFiles });
  checkSingleShellRuleConflicts(context);
  checkTrackedJunk();
  checkWegoAppStructure(context);
  checkPrototypeSurfaceDesigns(context);
  checkPrototypeJunkAndInternalCopy(context);
  checkPrototypeShellLeakage(context);
  checkPrototypeSinglePreviewShellRouting(context);
  checkPrototypeHostShellUniqueness(context);
  checkMetadataVersionGate(context);

  finish();
}

function finish() {
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const title = report.errors.length === 0 ? 'wego-design 守门验证通过' : 'wego-design 守门验证失败';
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
