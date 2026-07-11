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
 *   node scripts/validate-wego-design.mjs --scope=system --strict
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
const APP_LIB_SYNC_MAP = [
  { src: 'colors_and_type.css', dest: 'lib/colors_and_type.css', type: 'file' },
  { src: 'components.css', dest: 'lib/components.css', type: 'file' },
  { src: 'iconfont.css', dest: 'lib/iconfont.css', type: 'file' },
  { src: 'assets/fonts', dest: 'lib/fonts', type: 'dir' },
  { src: 'assets/icons', dest: 'lib/icons', type: 'dir' },
  { src: 'assets/image', dest: 'lib/image', type: 'dir' },
];
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
  'references/library-map.md',
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
const PRESENTATION_TYPES = new Set(['push', 'modal', 'sheet', 'full-screen-modal', 'host-tab', 'host-fixed-tab']);
const HOST_CONTAINER_TABS = new Set(['my', 'workspace', 'dongtai', 'xiaoxi', 'haoyou']);
const HOST_ENTRY_TYPES = new Set(['cell', 'grid-entry', 'host-tab']);
const PAGE_EDGE_MODES = new Set(['M0', 'M8', 'M16', 'M32']);
const MEDIA_PRIORITY_MODES = new Set(['supporting', 'balanced']);

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
    const primary = git(['diff', '--name-only', '--diff-filter=ACDMRT', `${diffBase}...HEAD`]);
    const fallback = primary && primary.length > 0
      ? primary
      : git(['diff', '--name-only', '--diff-filter=ACDMRT', diffBase]);
    splitLines(fallback).forEach(file => files.add(file));
  } else if (stagedOnly) {
    splitLines(git(['diff', '--cached', '--name-only', '--diff-filter=ACDMRT'])).forEach(file => files.add(file));
  } else {
    splitLines(git(['diff', '--name-only', '--diff-filter=ACDMRT', 'HEAD'])).forEach(file => files.add(file));
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
    if (['scripts/validate-wego-design.mjs', 'scripts/validate-wego-design-core.mjs', 'scripts/iteration-record.mjs'].includes(file)) validatorChanged = true;
  }

  for (const { rel } of relFiles) {
    for (const slug of componentSlugsFromLibraryPath(rel)) changedSlugs.add(slug);

    if (rel === 'components/index.json') registryChanged = true;
    if (/^components\/[^/]+\.json$/.test(rel) && rel !== 'components/index.json') componentContractChanged = true;
    if (/^preview\/component-.+\.html$/.test(rel)) previewChanged = true;
    if (rel === 'colors_and_type.css' || rel === 'css.json') tokenChanged = true;
    if (rel === 'components.css') componentsCssChanged = true;
    if (rel === 'library-consumption.json' || rel === 'uikit-plan.json' || rel === 'references/library-map.md' || rel === 'SKILL.md') {
      consumptionChanged = true;
    }
    if (rel === 'scripts/extract-components-css.mjs') extractorChanged = true;
    if (rel === 'metadata.json') metadataChanged = true;

    const kitMatch = rel.match(/^ui_kits\/([^/]+)\//);
    if (kitMatch) changedKits.add(kitMatch[1]);
  }

  const effectiveScope = requestedScope === 'system'
    ? 'system'
    : requestedScope === 'full' || validatorChanged || extractorChanged
      ? 'full'
      : 'changed';
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
  const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  if (selector.endsWith('-')) {
    return cssWithoutComments.includes(selector);
  }
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (selector.startsWith('.')) {
    return new RegExp(`(^|[}\\n,\\s])${escaped}(?=[:\\s,{.#>\\[])`).test(cssWithoutComments);
  }
  return new RegExp(`(^|[}\\n,\\s])${escaped}(?=[:\\s,{])`).test(cssWithoutComments);
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

  const cssWithoutComments = stripCssComments(css);
  if (/\.modal\s*\{[^}]*\bopacity\s*:/.test(cssWithoutComments)
    || /\.modal\[data-state[^\]]+\]\s*\{[^}]*\bopacity\s*:/.test(cssWithoutComments)) {
    add('error', 'components_css.modal_root_opacity',
      'modal 根节点不得设置 opacity；遮罩淡入淡出必须放在 .modal::before，避免面板被父级 opacity 一起变透明',
      cssPath);
  }
  if (/\.modal__panel(?:\[[^\]]+\])?\s*\{[^}]*\bopacity\s*:/.test(cssWithoutComments)
    || /\.modal\[data-state[^\]]+\]\s+\.modal__panel\s*\{[^}]*\bopacity\s*:/.test(cssWithoutComments)) {
    add('error', 'components_css.modal_panel_opacity',
      'modal 面板不得设置 opacity；面板打开/关闭只能使用 transform 位移动画',
      cssPath);
  }
  if (/\.modal\b/.test(cssWithoutComments) && !/\.modal::before\s*\{/.test(cssWithoutComments)) {
    add('error', 'components_css.modal_mask_layer_missing',
      'modal 必须用 .modal::before 作为独立遮罩视觉层，不能用根节点 opacity 承担遮罩淡入淡出',
      cssPath);
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
  const registrySources = [
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

  const textFiles = ['SKILL.md', 'references/library-map.md', 'library-consumption.json'];
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
    path.join(libraryRoot, '..', 'wego-ux', 'assets/templates/page-shell.html'),
    path.join(libraryRoot, '..', 'wego-ux', 'assets/templates/page.css'),
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

function resolveSceneSpecFiles(scene) {
  const scenePath = path.join(SCENES_ROOT, scene);
  const specDir = path.join(scenePath, '_spec');
  const interactionSpecPath = path.join(specDir, 'interaction_spec.json');
  const designPlanPath = path.join(specDir, 'design_plan.json');
  return { scenePath, specDir, specPath: fs.existsSync(interactionSpecPath) ? interactionSpecPath : null, planPath: fs.existsSync(designPlanPath) ? designPlanPath : null, interactionSpecPath, designPlanPath };
}

function isV2PrototypeOnlyScene(scene) {
  const root = path.join(SCENES_ROOT, scene, '_iterations');
  if (!fs.existsSync(root)) return false;
  const prototypeStatuses = new Set(['prototyping', 'awaiting-prototype-confirmation']);
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(root, entry.name, 'iteration.json');
    if (!fs.existsSync(file)) continue;
    const record = readJsonFile(file);
    if (record?.schemaVersion === 2 && prototypeStatuses.has(record.status) && (record.affected_scenes || []).some(item => (typeof item === 'string' ? item : item?.scene) === scene)) return true;
  }
  return false;
}

function extractRouteIdFromSpec(spec) {
  return spec?.prototype_target?.routes?.[0]?.id || null;
}

function extractAppTargetFromSpec(spec) {
  const pt = spec?.prototype_target;
  return pt ? { mode: 'wego-app-scene', app_root: pt.app_root, scene_folder: pt.scenario_folder, route_mode: pt.route_mode || 'hash' } : null;
}

function extractSurfacesFromSpec(spec) {
  return (spec?.surfaces || []).map(s => ({ id: s?.surface_id, role: null }));
}

function checkPrototypeSurfaceDesigns(context) {
  const scenes = context.effectiveScope === 'full'
    ? getAllSceneFolders()
    : getSceneFoldersFromChangedFiles(context.changedFiles);
  if (scenes.length === 0) return;

  const uikitPlan = readJson('uikit-plan.json') || {};
  const pagePatternIds = new Set((uikitPlan.pagePatterns || []).map(item => item.slug).filter(Boolean));
  const fallbackBlueprintIds = new Set((uikitPlan.fallbackPageBlueprints || []).map(item => item.id).filter(Boolean));
  const uiKitIds = new Set((uikitPlan.uiKits || []).map(item => item.slug).filter(Boolean));
  const allowedComponents = new Set(uikitPlan.allowedComponents || []);
  const routesPath = path.join(APP_ROOT, 'js/routes.js');
  const registeredRoutes = fs.existsSync(routesPath) ? fs.readFileSync(routesPath, 'utf8') : '';
  let checkedPlans = 0;
  for (const scene of scenes) {
    const resolved = resolveSceneSpecFiles(scene);
    const { scenePath, specDir, specPath, planPath } = resolved;
    if (!specPath || !planPath) {
      if (isV2PrototypeOnlyScene(scene)) continue;
      add('error', 'app_scene.spec_missing',
        'App 场景必须包含 _spec/interaction_spec.json 和 _spec/design_plan.json',
        scenePath);
      continue;
    }

    const pageSpec = readJsonFile(specPath);
    const routeId = extractRouteIdFromSpec(pageSpec);
    const appTarget = extractAppTargetFromSpec(pageSpec);
    if (!appTarget || appTarget.mode !== 'wego-app-scene') {
      add('error', 'app_scene.target_missing',
        'spec 的 app_target.mode（或 prototype_target）必须为 wego-app-scene',
        specPath);
    }
    if (appTarget?.app_root && appTarget.app_root !== APP_ROOT_REL) {
      add('error', 'app_scene.app_root_invalid',
        `spec 的 app_target.app_root 必须为 ${APP_ROOT_REL}`,
        specPath);
    }
    if (appTarget?.scene_folder && path.normalize(appTarget.scene_folder) !== path.normalize(`${APP_ROOT_REL}/scenes/${scene}`)) {
      add('error', 'app_scene.folder_mismatch',
        `spec 的 app_target.scene_folder 必须指向当前场景目录：${APP_ROOT_REL}/scenes/${scene}`,
        specPath);
    }
    if (appTarget?.route_mode && appTarget.route_mode !== 'hash') {
      add('error', 'app_scene.route_mode_invalid',
        'spec 的 app_target.route_mode 必须为 hash',
        specPath);
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
      if (sceneJs.includes('.codex/skills/')) {
        add('error', 'app_scene.source_asset_reference_forbidden',
          'scene.js 不得引用 .codex/skills/wego-design 源目录资源；运行时只能引用 wego-app/lib/ 或场景内可部署资源',
          sceneJsPath);
      }
    }

    const sceneCssPath = path.join(scenePath, 'scene.css');
    if (fs.existsSync(sceneCssPath)) {
      const sceneCss = fs.readFileSync(sceneCssPath, 'utf8');
      if (sceneCss.includes('.codex/skills/')) {
        add('error', 'app_scene.source_asset_reference_forbidden',
          'scene.css 不得引用 .codex/skills/wego-design 源目录资源；运行时只能引用 wego-app/lib/ 或场景内可部署资源',
          sceneCssPath);
      }
    }

    checkedPlans++;
    const plan = readJsonFile(planPath);
    if (!plan) continue;
    const presentationEntries = [];
    if (plan.page_presentation && typeof plan.page_presentation === 'object' && typeof plan.page_presentation.type === 'string') {
      presentationEntries.push({ key: 'page_presentation', value: plan.page_presentation });
    } else if (plan.page_presentation && typeof plan.page_presentation === 'object') {
      for (const [key, value] of Object.entries(plan.page_presentation)) {
        if (value && typeof value === 'object') presentationEntries.push({ key, value });
      }
    }
    for (const entry of presentationEntries) {
      const presentationType = entry.value?.type;
      if (presentationType && !PRESENTATION_TYPES.has(presentationType)) {
        add('error', 'prototype.presentation_type_invalid',
          `${entry.key}.type 必须是 push/modal/sheet/full-screen-modal/host-tab/host-fixed-tab，当前为 ${presentationType}`,
          planPath);
      }
    }
    if (plan.page_strategy?.page_pattern && !pagePatternIds.has(plan.page_strategy.page_pattern)) {
      add('error', 'prototype.page_strategy_pattern_unknown',
        `page_strategy.page_pattern 引用了不存在的 pagePattern：${plan.page_strategy.page_pattern}`,
        planPath);
    }
    const surfaces = Array.isArray(plan.surface_designs) ? plan.surface_designs : null;
    if (!surfaces || surfaces.length === 0) {
      add('error', 'prototype.surface_designs_missing',
        'design_plan.json 必须包含 surface_designs[]，逐页面声明 exact/near/fallback/gap 设计依据',
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
      if (surface.matched_ui_kit && !uiKitIds.has(surface.matched_ui_kit)) {
        add('error', 'prototype.surface_uikit_unknown',
          `surface ${id} 引用了不存在的 UI Kit slug：${surface.matched_ui_kit}`,
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
      if (Array.isArray(surface.component_refs)) {
        for (const ref of surface.component_refs) {
          if (!allowedComponents.has(ref)) {
            add('error', 'prototype.surface_component_ref_unknown',
              `surface ${id} 的 component_refs[] 引用了未注册组件：${ref}`,
              planPath);
          }
        }
      } else {
        add('error', 'prototype.surface_component_refs_missing',
          `surface ${id} 必须包含 component_refs[]`,
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
      if (surface.matched_blueprint === 'continuous-content-feed-page') {
        const layoutContract = surface.layout_contract;
        if (!layoutContract || typeof layoutContract !== 'object') {
          add('error', 'prototype.surface_layout_contract_missing',
            `surface ${id} 命中 continuous-content-feed-page 时必须声明 layout_contract`,
            planPath);
        } else {
          if (!PAGE_EDGE_MODES.has(layoutContract.page_edge_mode)) {
            add('error', 'prototype.surface_layout_edge_mode_invalid',
              `surface ${id} 的 layout_contract.page_edge_mode 必须是 M0/M8/M16/M32，当前为 ${layoutContract.page_edge_mode || '空'}`,
              planPath);
          }
          if (typeof layoutContract.page_edge_mode_reason !== 'string' || !layoutContract.page_edge_mode_reason.trim()) {
            add('error', 'prototype.surface_layout_edge_reason_missing',
              `surface ${id} 必须说明 layout_contract.page_edge_mode_reason`,
              planPath);
          }
          if (!MEDIA_PRIORITY_MODES.has(layoutContract.media_priority)) {
            add('error', 'prototype.surface_layout_media_priority_invalid',
              `surface ${id} 的 layout_contract.media_priority 必须是 supporting/balanced，当前为 ${layoutContract.media_priority || '空'}`,
              planPath);
          }
          if (typeof layoutContract.media_priority_reason !== 'string' || !layoutContract.media_priority_reason.trim()) {
            add('error', 'prototype.surface_layout_media_reason_missing',
              `surface ${id} 必须说明 layout_contract.media_priority_reason`,
              planPath);
          }
        }
      }
    }

    if (pageSpec) {
      const specSurfaces = extractSurfacesFromSpec(pageSpec);
      if (specSurfaces.length === 0) {
        add('error', 'prototype.surfaces_missing',
          'spec 必须包含 surfaces[]，供 surface_designs[] 覆盖',
          specPath);
      }
      for (const specSurface of specSurfaces) {
        const id = specSurface?.id;
        if (id && !seen.has(id)) {
          add('error', 'prototype.surface_not_covered',
            `spec 中的 ${id} 未被 surface_designs[] 覆盖`,
            planPath);
        }
      }

      const hostContainer = pageSpec?.host_container;
      const hostRouteId = extractRouteIdFromSpec(pageSpec);
      if ((hostContainer && !hostRouteId) || (!hostContainer && hostRouteId)) {
        add('error', 'prototype.host_route_pair_required',
          'spec 中 host_container 和 route_id 必须成对出现',
          specPath);
      }
      if (hostContainer) {
        if (typeof hostContainer !== 'object' || Array.isArray(hostContainer)) {
          add('error', 'prototype.host_container_invalid', 'spec 的 host_container 必须为对象', specPath);
        } else {
          if (!HOST_CONTAINER_TABS.has(hostContainer.tab)) {
            add('error', 'prototype.host_container_tab_invalid',
              'host_container.tab 必须是 my/workspace/dongtai/xiaoxi/haoyou 之一',
              specPath);
          }
          if (typeof hostContainer.entry_label !== 'string' || !hostContainer.entry_label.trim()) {
            add('error', 'prototype.host_container_entry_missing',
              'host_container.entry_label 必须为非空字符串',
              specPath);
          }
          if (typeof hostContainer.subentry_label !== 'string') {
            add('error', 'prototype.host_container_subentry_invalid',
              'host_container.subentry_label 必须为字符串，可为空',
              specPath);
          }
          if (![1, 2, 3].includes(hostContainer.leaf_level)) {
            add('error', 'prototype.host_container_leaf_level_invalid',
              'host_container.leaf_level 必须为 1/2/3',
              specPath);
          }
          if (!HOST_ENTRY_TYPES.has(hostContainer.entry_type)) {
            add('error', 'prototype.host_container_entry_type_invalid',
              'host_container.entry_type 必须为 cell、grid-entry 或 host-tab',
              specPath);
          }
          if (typeof hostContainer.needs_host_entry_surface !== 'boolean') {
            add('error', 'prototype.host_container_host_entry_flag_invalid',
              'host_container.needs_host_entry_surface 必须为布尔值',
              specPath);
          }
          if (hostContainer.needs_host_entry_surface) {
            const hasHostEntry = (pageSpec?.prototype_target?.routes || []).length > 0;
            if (!hasHostEntry) {
              add('error', 'prototype.host_container_host_entry_missing',
                '声明 needs_host_entry_surface=true 时，spec 必须包含 prototype_target.routes[]',
                specPath);
            }
          }
        }
      }
      if (hostRouteId && (typeof hostRouteId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(hostRouteId))) {
        add('error', 'prototype.route_id_invalid',
          'route_id 必须为 kebab-case 稳定键，例如 my-settings-price-rule',
          specPath);
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

// P1：归档强制检查
// 拦截多次迭代但未归档的问题
function checkPrototypeSpecArchive(context) {
  const scenes = context.effectiveScope === 'full'
    ? getAllSceneFolders()
    : getSceneFoldersFromChangedFiles(context.changedFiles);
  if (scenes.length === 0) return;

  let checkedScenes = 0;
  for (const scene of scenes) {
    const resolved = resolveSceneSpecFiles(scene);
    const { specDir, specPath, planPath } = resolved;
    const archiveDir = path.join(specDir, 'archive');
    if (!specPath || !planPath) continue;

    // 检查 _spec 在 git 历史中有过修改（新旧格式文件都计入）
    const specFiles = [resolved.interactionSpecPath, resolved.pageSpecPath, resolved.designPlanPath, resolved.consumptionPlanPath]
      .filter(f => fs.existsSync(f));
    let totalCommits = 0;
    for (const specFile of specFiles) {
      const relPath = path.relative(repoRoot, specFile);
      const result = git(['log', '--oneline', '--', relPath]);
      if (result) {
        const lines = result.split('\n').filter(Boolean);
        totalCommits += lines.length;
      }
    }

    // 首次创建场景不要求归档（_spec 只有 1 个 commit）
    if (totalCommits <= 1) continue;

    // _spec 有过迭代，必须存在 archive 目录且有归档文件
    if (!fs.existsSync(archiveDir)) {
      add('error', 'app_scene.spec_archive_missing',
        `_spec 已迭代 ${totalCommits} 次但 _spec/archive/ 目录不存在；违反 wego-ux/SKILL.md "按版本归档"要求`,
        specDir);
      continue;
    }
    const archiveFiles = fs.readdirSync(archiveDir).filter(name => name.endsWith('.json'));
    if (archiveFiles.length === 0) {
      add('error', 'app_scene.spec_archive_empty',
        `_spec 已迭代 ${totalCommits} 次但 _spec/archive/ 目录为空；必须归档上一版本`,
        archiveDir);
    }
    checkedScenes++;
  }
  report.metrics.prototypeSpecArchive = checkedScenes;
}

// P1：Token 硬编码检测（扩展到场景文件）
// 拦截 scene.js/scene.css 中硬编码 hex/rgb/hsl 颜色
function checkPrototypeTokenHardcoding(context) {
  const scenes = context.effectiveScope === 'full'
    ? getAllSceneFolders()
    : getSceneFoldersFromChangedFiles(context.changedFiles);
  if (scenes.length === 0) return;

  // 白名单：插画调色板、SVG 图形资源允许硬编码颜色
  const ALLOWED_CONTEXTS = [
    /palette\s*[:=]\s*\{[\s\S]*?(?:start|end|plate)\s*:/,
    /stop-color\s*=\s*"/,
    /<(?:rect|path|circle|ellipse|line|polygon|polyline|stop|text)\b[^>]*\bfill\s*=\s*"/,
    /<(?:rect|path|circle|ellipse|line|polygon|polyline|stop|text)\b[^>]*\bstroke\s*=\s*"/,
  ];

  let scannedFiles = 0;
  for (const scene of scenes) {
    const scenePath = path.join(SCENES_ROOT, scene);
    const filesToScan = [
      path.join(scenePath, 'scene.css'),
      path.join(scenePath, 'scene.js'),
    ].filter(f => fs.existsSync(f));

    for (const file of filesToScan) {
      scannedFiles++;
      const ext = path.extname(file);
      let content = fs.readFileSync(file, 'utf8');
      if (ext === '.css') {
        content = stripCssComments(content);
      } else if (ext === '.js') {
        content = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
      }

      const colors = rawColorMatches(content);
      if (colors.length === 0) continue;

      const uniqueColors = [...new Set(colors)];

      // 预定位 SVG 块范围
      const svgRanges = [];
      const svgOpenRegex = /<svg\b/g;
      const svgCloseRegex = /<\/svg>/g;
      let svgMatch;
      while ((svgMatch = svgOpenRegex.exec(content)) !== null) {
        const openIdx = svgMatch.index;
        svgCloseRegex.lastIndex = openIdx;
        const closeMatch = svgCloseRegex.exec(content);
        if (closeMatch) {
          svgRanges.push([openIdx, closeMatch.index + closeMatch[0].length]);
        }
      }
      const isInSvg = idx => svgRanges.some(([s, e]) => idx >= s && idx <= e);

      // 预定位 palette 对象范围
      const paletteRanges = [];
      const paletteRegex = /palette\s*[:=]\s*\{/g;
      let paletteMatch;
      while ((paletteMatch = paletteRegex.exec(content)) !== null) {
        const openIdx = paletteMatch.index;
        let depth = 0;
        let endIdx = openIdx;
        for (let i = openIdx; i < content.length; i++) {
          if (content[i] === '{') depth++;
          else if (content[i] === '}') {
            depth--;
            if (depth === 0) { endIdx = i + 1; break; }
          }
        }
        paletteRanges.push([openIdx, endIdx]);
      }
      const isInPalette = idx => paletteRanges.some(([s, e]) => idx >= s && idx <= e);

      const violations = [];
      for (const color of uniqueColors) {
        const colorIndex = content.indexOf(color);
        if (colorIndex === -1) continue;
        if (isInSvg(colorIndex) || isInPalette(colorIndex)) continue;
        const start = Math.max(0, colorIndex - 120);
        const contextWindow = content.slice(start, colorIndex + color.length + 40);
        const isAllowed = ALLOWED_CONTEXTS.some(regex => regex.test(contextWindow));
        if (!isAllowed) {
          violations.push(color);
        }
      }

      if (violations.length > 0) {
        add('error', 'app_scene.token_hardcoded',
          `场景文件禁止硬编码颜色，应使用 Token：${firstLines(violations)}；参见 library-consumption.json:145-152`,
          file);
      }
    }
  }
  report.metrics.prototypeTokenHardcoding = scannedFiles;
}

// P2：组件类发明检测
// 拦截 scene.js/scene.css 中使用未在 components.css 注册的组件类
function checkPrototypeComponentClassInvention(context) {
  const scenes = context.effectiveScope === 'full'
    ? getAllSceneFolders()
    : getSceneFoldersFromChangedFiles(context.changedFiles);
  if (scenes.length === 0) return;

  const componentsCssPath = path.join(libraryRoot, 'components.css');
  if (!fs.existsSync(componentsCssPath)) return;
  const componentClassSet = classesFromCss(fs.readFileSync(componentsCssPath, 'utf8'));

  // 组件根 slug 集合（用于放行 cell--indent、link--default 等修饰扩展）
  const componentRootSlugs = new Set();
  for (const cls of componentClassSet) {
    const root = cls.split(/__[--]/)[0].split(/--/)[0];
    if (root) componentRootSlugs.add(root);
  }

  // 宿主 App 通用工具类白名单
  const HOST_UTILITY_CLASSES = new Set([
    'phone-screen', 'phone-frame', 'preview-shell', 'phone-status', 'phone-indicator',
    'phone-indicator-bar', 'phone-body', 'uikit-shell',
    'host-shell', 'host-shell-page', 'host-shell-tab', 'host-shell-grid',
    'host-shell-grid-entry', 'host-shell-grid-entry__icon', 'host-shell-grid-entry__label',
    'bottom-nav', 'bottom-nav__item', 'bottom-nav__icon', 'bottom-nav__label',
    'app-tabbar', 'app-tabbar__item',
  ]);

  // 场景目录名拼音映射（用于识别业务前缀类）
  const SCENE_PREFIX_MAP = {
    '仓库管理': ['warehouse', 'warehouse-page'],
    '价格权限管理': ['price', 'price-rule', 'price-page'],
    '产品与笔记': ['product', 'note', 'product-page', 'note-page'],
    '库存管理': ['stock', 'inventory', 'stock-page'],
    '快捷发布产品': ['quick-publish', 'publish', 'quick-publish-page'],
    '系统设置': ['system', 'settings', 'system-page'],
  };

  function isBusinessPrefix(className, scene) {
    if (!className) return false;
    if (/-page__(?:[\w-]+)$/.test(className) || /-page--[\w-]+$/.test(className)) return true;
    if (/^(?:host-shell|wego-app|app-)/.test(className)) return true;
    const prefixes = SCENE_PREFIX_MAP[scene] || [];
    for (const prefix of prefixes) {
      if (className === prefix) return true;
      if (className.startsWith(prefix + '-') || className.startsWith(prefix + '__') || className.startsWith(prefix + '--')) return true;
    }
    return false;
  }

  // 过滤 JS 变量名误提取
  function filterRealCssClasses(classNames) {
    const filtered = [];
    const COMMON_JS_VARS = new Set([
      'cls', 'density', 'divider', 'tone', 'state', 'on', 'off',
      'icon', 'class', 'className', 'style', 'id', 'key', 'value',
      'label', 'title', 'text', 'content', 'children', 'props',
    ]);
    for (const name of classNames) {
      if (/^icon-[\w-]+$/.test(name)) continue;
      if (/^[a-z][a-zA-Z0-9]*$/.test(name) && /[a-z][A-Z]/.test(name)) continue;
      if (COMMON_JS_VARS.has(name)) continue;
      filtered.push(name);
    }
    return filtered;
  }

  const STYLE_UTILITY_PATTERNS = /^(?:is-|has-|js-|no-|with-|without-)/;
  const COMMON_HTML_CLASSES = new Set([
    'active', 'disabled', 'hidden', 'visible', 'open', 'closed', 'selected',
    'current', 'loading', 'error', 'success', 'warning', 'default',
  ]);

  let checkedScenes = 0;
  for (const scene of scenes) {
    const scenePath = path.join(SCENES_ROOT, scene);
    const sceneJsPath = path.join(scenePath, 'scene.js');
    const sceneCssPath = path.join(scenePath, 'scene.css');
    if (!fs.existsSync(sceneJsPath)) continue;

    const sceneJsContent = fs.readFileSync(sceneJsPath, 'utf8');
    const sceneCssContent = fs.existsSync(sceneCssPath) ? fs.readFileSync(sceneCssPath, 'utf8') : '';
    const sceneJsClasses = new Set(filterRealCssClasses([...classNamesFromHtml(sceneJsContent)]));
    const sceneCssClasses = classesFromCss(stripCssComments(sceneCssContent));
    const allSceneClasses = new Set([...sceneJsClasses, ...sceneCssClasses]);

    const inventedClasses = [];
    for (const name of allSceneClasses) {
      if (componentClassSet.has(name)) continue;
      if (HOST_UTILITY_CLASSES.has(name)) continue;
      if (FORBIDDEN_PROTOTYPE_SHELL_CLASSES.has(name) || PREVIEW_SHELL_CLASSES.has(name)) continue;
      if (isBusinessPrefix(name, scene)) continue;
      if (STYLE_UTILITY_PATTERNS.test(name)) continue;
      if (COMMON_HTML_CLASSES.has(name)) continue;
      // 放行对已注册组件的修饰扩展（如 cell--indent、link--default）
      const nameRoot = name.split(/--/)[0].split(/__/)[0];
      if (componentRootSlugs.has(nameRoot)) continue;
      inventedClasses.push(name);
    }

    if (inventedClasses.length > 0) {
      add('error', 'app_scene.component_class_invented',
        `场景文件发明了未注册组件类：${firstLines([...new Set(inventedClasses)])}；应使用已注册组件类（参见 wego-app/lib/components.css）或声明为业务前缀类`,
        sceneJsPath);
    }
    checkedScenes++;
  }
  report.metrics.prototypeComponentClassInvention = checkedScenes;
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

function listRelativeFiles(root) {
  const out = [];
  const walk = (dir, base = '') => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = base ? `${base}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, rel);
      } else {
        out.push(rel);
      }
    }
  };
  walk(root);
  return out.sort();
}

function filesEqualBinary(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return false;
  const sa = fs.statSync(a);
  const sb = fs.statSync(b);
  if (sa.size !== sb.size) return false;
  return fs.readFileSync(a).equals(fs.readFileSync(b));
}

function dirsEqualBinary(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return false;
  const af = listRelativeFiles(a);
  const bf = listRelativeFiles(b);
  if (af.length !== bf.length) return false;
  for (let i = 0; i < af.length; i += 1) {
    if (af[i] !== bf[i]) return false;
    if (!filesEqualBinary(path.join(a, af[i]), path.join(b, bf[i]))) return false;
  }
  return true;
}

function checkWegoAppLibSync(context) {
  const syncRelevant = context.effectiveScope === 'full'
    || context.changedFiles.some(file =>
      file.startsWith(`${APP_ROOT_REL}/lib/`)
      || file === 'scripts/sync-wego-app-lib.mjs'
      || file === `${rootRel}/colors_and_type.css`
      || file === `${rootRel}/components.css`
      || file === `${rootRel}/iconfont.css`
      || file.startsWith(`${rootRel}/assets/`)
    );
  if (!syncRelevant || !fs.existsSync(APP_ROOT)) return;

  for (const item of APP_LIB_SYNC_MAP) {
    const src = path.join(libraryRoot, item.src);
    const dest = path.join(APP_ROOT, item.dest);
    const equal = item.type === 'dir' ? dirsEqualBinary(src, dest) : filesEqualBinary(src, dest);
    if (!equal) {
      add('error', 'app.lib.out_of_sync',
        `wego-app/${item.dest} 与设计系统源 ${rootRel}/${item.src} 不一致；不要直接修改 wego-app/lib/ 副本，请改源文件后运行 node scripts/sync-wego-app-lib.mjs`,
        dest);
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

// 第四阶段：新格式（interaction_spec / design_plan）跨文件 ID 引用校验
// 仅在场景存在 interaction_spec.json 时执行；旧格式场景不受影响。
function checkInteractionSpecAndDesignPlanReferences(context) {
  const scenes = context.effectiveScope === 'full'
    ? getAllSceneFolders()
    : getSceneFoldersFromChangedFiles(context.changedFiles);
  if (scenes.length === 0) return;

  let checkedNewFormat = 0;
  for (const scene of scenes) {
    const specDir = path.join(SCENES_ROOT, scene, '_spec');
    const interactionSpecPath = path.join(specDir, 'interaction_spec.json');
    if (!fs.existsSync(interactionSpecPath)) continue;

    checkedNewFormat++;
    const spec = readJsonFile(interactionSpecPath);
    if (!spec) continue;

    // 收集各类 ID 并检查唯一性
    const flowIds = new Set();
    const nodeIds = new Set();
    const surfaceIds = new Set();
    const contentIds = new Set();
    const transitionIds = new Set();
    const handoffIds = new Set();

    const checkUnique = (items, idField, set, code) => {
      for (const item of (items || [])) {
        const id = item?.[idField];
        if (!id || typeof id !== 'string') {
          add('error', `spec.${code}_missing`, `${idField} 缺失`, interactionSpecPath);
          continue;
        }
        if (set.has(id)) {
          add('error', `spec.${code}_duplicate`, `${idField} 重复：${id}`, interactionSpecPath);
        }
        set.add(id);
      }
    };

    checkUnique(spec.flows, 'flow_id', flowIds, 'flow_id');
    checkUnique(spec.flow_nodes, 'node_id', nodeIds, 'node_id');
    checkUnique(spec.surfaces, 'surface_id', surfaceIds, 'surface_id');
    checkUnique(spec.content_blocks, 'content_id', contentIds, 'content_id');
    checkUnique(spec.transitions, 'transition_id', transitionIds, 'transition_id');
    checkUnique(spec.data_handoffs, 'handoff_id', handoffIds, 'handoff_id');

    // 2. Flow 引用的 Node 存在
    for (const flow of (spec.flows || [])) {
      if (flow?.entry_node && !nodeIds.has(flow.entry_node)) {
        add('error', 'spec.flow_entry_node_ref_missing',
          `flow ${flow.flow_id} 的 entry_node 引用了不存在的 node_id：${flow.entry_node}`,
          interactionSpecPath);
      }
      for (const step of (flow?.steps || [])) {
        if (step && !nodeIds.has(step)) {
          add('error', 'spec.flow_step_ref_missing',
            `flow ${flow.flow_id} 的 steps 引用了不存在的 node_id：${step}`,
            interactionSpecPath);
        }
      }
    }

    // 3. Node 引用的 Surface 存在
    for (const node of (spec.flow_nodes || [])) {
      if (node?.surface_ref && !surfaceIds.has(node.surface_ref)) {
        add('error', 'spec.node_surface_ref_missing',
          `flow_node ${node.node_id} 的 surface_ref 引用了不存在的 surface_id：${node.surface_ref}`,
          interactionSpecPath);
      }
    }

    // 4. Surface 引用的 Content 和 Node 存在
    for (const surface of (spec.surfaces || [])) {
      for (const ref of (surface?.content_refs || [])) {
        if (ref && !contentIds.has(ref)) {
          add('error', 'spec.surface_content_ref_missing',
            `surface ${surface.surface_id} 的 content_refs 引用了不存在的 content_id：${ref}`,
            interactionSpecPath);
        }
      }
      for (const ref of (surface?.node_refs || [])) {
        if (ref && !nodeIds.has(ref)) {
          add('error', 'spec.surface_node_ref_missing',
            `surface ${surface.surface_id} 的 node_refs 引用了不存在的 node_id：${ref}`,
            interactionSpecPath);
        }
      }
    }

    // 5. Transition 的 from/to/return_to 存在
    for (const trans of (spec.transitions || [])) {
      if (trans?.from && !nodeIds.has(trans.from)) {
        add('error', 'spec.transition_from_missing',
          `transition ${trans.transition_id} 的 from 引用了不存在的 node_id：${trans.from}`,
          interactionSpecPath);
      }
      if (trans?.to && !nodeIds.has(trans.to)) {
        add('error', 'spec.transition_to_missing',
          `transition ${trans.transition_id} 的 to 引用了不存在的 node_id：${trans.to}`,
          interactionSpecPath);
      }
      if (trans?.return_to && !nodeIds.has(trans.return_to)) {
        add('error', 'spec.transition_return_to_missing',
          `transition ${trans.transition_id} 的 return_to 引用了不存在的 node_id：${trans.return_to}`,
          interactionSpecPath);
      }
    }

    // data_handoffs 引用校验
    for (const handoff of (spec.data_handoffs || [])) {
      if (handoff?.transition_id && !transitionIds.has(handoff.transition_id)) {
        add('error', 'spec.handoff_transition_ref_missing',
          `data_handoff ${handoff.handoff_id} 的 transition_id 引用了不存在的 transition：${handoff.transition_id}`,
          interactionSpecPath);
      }
      if (handoff?.source_node && !nodeIds.has(handoff.source_node)) {
        add('error', 'spec.handoff_source_node_ref_missing',
          `data_handoff ${handoff.handoff_id} 的 source_node 引用了不存在的 node_id：${handoff.source_node}`,
          interactionSpecPath);
      }
      if (handoff?.target_node && !nodeIds.has(handoff.target_node)) {
        add('error', 'spec.handoff_target_node_ref_missing',
          `data_handoff ${handoff.handoff_id} 的 target_node 引用了不存在的 node_id：${handoff.target_node}`,
          interactionSpecPath);
      }
      for (const ref of (handoff?.payload_content_refs || [])) {
        if (ref && !contentIds.has(ref)) {
          add('error', 'spec.handoff_payload_ref_missing',
            `data_handoff ${handoff.handoff_id} 的 payload_content_refs 引用了不存在的 content_id：${ref}`,
            interactionSpecPath);
        }
      }
    }

    // prototype_target.routes[].surface_ref 存在
    const routes = spec?.prototype_target?.routes || [];
    for (const route of routes) {
      if (route?.surface_ref && !surfaceIds.has(route.surface_ref)) {
        add('error', 'spec.route_surface_ref_missing',
          `prototype_target.routes[] 的 surface_ref 引用了不存在的 surface_id：${route.surface_ref}`,
          interactionSpecPath);
      }
    }

    // 7-9. prototype_boundaries 校验
    const boundaries = new Map();
    for (const b of (spec.prototype_boundaries || [])) {
      const nodeId = b?.node_id;
      if (!nodeId) {
        add('error', 'spec.boundary_node_id_missing', 'prototype_boundaries[] 每项必须包含 node_id', interactionSpecPath);
        continue;
      }
      if (!nodeIds.has(nodeId)) {
        add('error', 'spec.boundary_node_ref_missing',
          `prototype_boundaries 引用了不存在的 node_id：${nodeId}`,
          interactionSpecPath);
      }
      const depth = b?.depth;
      if (!['functional', 'simulated', 'stub', 'excluded'].includes(depth)) {
        add('error', 'spec.boundary_depth_invalid',
          `prototype_boundaries node ${nodeId} 的 depth 必须为 functional/simulated/stub/excluded`,
          interactionSpecPath);
      }
      // 规则 8：stub 节点必须有明确反馈
      if (depth === 'stub') {
        if (!b.feedback || typeof b.feedback !== 'string' || !b.feedback.trim()) {
          add('error', 'spec.stub_feedback_missing',
            `stub 节点 ${nodeId} 必须包含 feedback 字段描述用户可见反馈`,
            interactionSpecPath);
        }
      }
      boundaries.set(nodeId, depth);
    }

    // functional 节点必须有 surface 承接
    for (const node of (spec.flow_nodes || [])) {
      const depth = boundaries.get(node.node_id);
      if (depth === 'functional' && !node.surface_ref) {
        add('error', 'spec.functional_node_no_surface',
          `functional 节点 ${node.node_id} 必须有 surface_ref`,
          interactionSpecPath);
      }
    }

    // excluded 节点不得出现在 flows 主路径中
    for (const flow of (spec.flows || [])) {
      if (flow?.entry_node && boundaries.get(flow.entry_node) === 'excluded') {
        add('error', 'spec.excluded_in_flow_entry',
          `flow ${flow.flow_id} 的 entry_node ${flow.entry_node} 是 excluded，不得出现在 flows 主路径中`,
          interactionSpecPath);
      }
      for (const step of (flow?.steps || [])) {
        if (step && boundaries.get(step) === 'excluded') {
          add('error', 'spec.excluded_in_flow_steps',
            `flow ${flow.flow_id} 的 steps 包含 excluded 节点 ${step}`,
            interactionSpecPath);
        }
      }
    }

    // readiness 校验（支持字符串和对象两种格式）
    const readinessRaw = spec?.readiness;
    const readinessValue = typeof readinessRaw === 'object' && readinessRaw !== null ? readinessRaw.status : readinessRaw;
    if (!readinessRaw) {
      add('error', 'spec.readiness_missing',
        'interaction_spec 必须包含 readiness 字段',
        interactionSpecPath);
    } else if (!['ready', 'ready-with-assumptions', 'partially-ready', 'blocked'].includes(readinessValue)) {
      add('error', 'spec.readiness_invalid',
        `readiness 必须为 ready/ready-with-assumptions/partially-ready/blocked`,
        interactionSpecPath);
    }

    // 校验 design_plan.json 与 interaction_spec 的一致性
    const designPlanPath = path.join(specDir, 'design_plan.json');
    if (!fs.existsSync(designPlanPath)) continue;
    const plan = readJsonFile(designPlanPath);
    if (!plan) continue;

    // 6. design_plan 只能引用 interaction_spec 中存在的对象
    const planSurfaceIds = new Set();
    for (const sd of (plan.surface_designs || [])) {
      const id = sd?.surface_id;
      if (!id || typeof id !== 'string') {
        add('error', 'plan.surface_id_missing', 'surface_designs[] 每项必须包含 surface_id', designPlanPath);
        continue;
      }
      if (planSurfaceIds.has(id)) {
        add('error', 'plan.surface_id_duplicate', `surface_designs 的 surface_id 重复：${id}`, designPlanPath);
      }
      planSurfaceIds.add(id);
      if (!surfaceIds.has(id)) {
        add('error', 'plan.surface_ref_unknown',
          `surface_designs 引用了 interaction_spec 中不存在的 surface_id：${id}`,
          designPlanPath);
      }
    }

    // 所有 interaction_spec surfaces 必须被 design_plan 覆盖
    for (const sid of surfaceIds) {
      if (!planSurfaceIds.has(sid)) {
        add('error', 'plan.surface_not_covered',
          `interaction_spec 的 surface ${sid} 未被 design_plan.surface_designs 覆盖`,
          designPlanPath);
      }
    }

    // flow_to_surface_decisions 引用校验
    const decisions = plan.flow_to_surface_decisions || [];
    const coveredNodeIds = new Set();
    for (const decision of decisions) {
      const nodeRefs = Array.isArray(decision?.node_refs)
        ? decision.node_refs
        : (decision?.node_id ? [decision.node_id] : []);
      for (const ref of nodeRefs) {
        coveredNodeIds.add(ref);
        if (ref && !nodeIds.has(ref)) {
          add('error', 'plan.decision_node_ref_unknown',
            `flow_to_surface_decisions 引用了不存在的 node_id：${ref}`,
            designPlanPath);
        }
      }
      const surfaceRef = decision?.surface_ref || decision?.surface_id;
      if (surfaceRef && !surfaceIds.has(surfaceRef)) {
        add('error', 'plan.decision_surface_ref_unknown',
          `flow_to_surface_decisions 引用了不存在的 surface_id：${surfaceRef}`,
          designPlanPath);
      }
    }

    // 7. functional/simulated 节点必须被 flow_to_surface_decisions 覆盖（structured/complex）
    const complexity = plan.complexity_level;
    if (complexity && complexity !== 'simple') {
      for (const node of (spec.flow_nodes || [])) {
        const depth = boundaries.get(node.node_id);
        if ((depth === 'functional' || depth === 'simulated') && !coveredNodeIds.has(node.node_id)) {
          add('error', 'plan.node_not_covered_by_decision',
            `节点 ${node.node_id}（${depth}）未被 flow_to_surface_decisions 覆盖`,
            designPlanPath);
        }
      }
    }

    // component_patterns.applies_to 引用校验
    for (const pattern of (plan.component_patterns || [])) {
      for (const ref of (pattern?.applies_to || [])) {
        if (ref && !contentIds.has(ref) && !surfaceIds.has(ref)) {
          add('error', 'plan.pattern_ref_unknown',
            `component_patterns ${pattern.pattern_id} 的 applies_to 引用了不存在的 ID：${ref}`,
            designPlanPath);
        }
      }
    }

    // 12. 复杂页面必须存在区域编排
    if (complexity === 'structured' || complexity === 'complex') {
      if (!Array.isArray(plan.region_composition) || plan.region_composition.length === 0) {
        add('error', 'plan.region_composition_missing',
          `complexity_level=${complexity} 的页面必须有 region_composition`,
          designPlanPath);
      } else {
        const patternIds = new Set((plan.component_patterns || []).map(p => p?.pattern_id).filter(Boolean));
        const mappingBlocks = new Set((plan.component_mapping || []).map(m => m?.block).filter(Boolean));
        for (const region of plan.region_composition) {
          for (const ref of (region?.component_refs || [])) {
            if (ref && !patternIds.has(ref) && !mappingBlocks.has(ref)) {
              add('error', 'plan.region_ref_unknown',
                `region_composition ${region.region_id} 的 component_refs 引用了不存在的 ID：${ref}`,
                designPlanPath);
            }
          }
        }
      }
    }

    // complex 页面必须有 page_strategy 扩展字段
    if (complexity === 'complex') {
      const ps = plan.page_strategy || {};
      if (!ps.first_screen_priority && !ps.first_screen_goal) {
        add('error', 'plan.complex_first_screen_missing',
          `complex 页面必须有 page_strategy.first_screen_priority 或 first_screen_goal`,
          designPlanPath);
      }
      if (!ps.region_priority) {
        add('error', 'plan.complex_region_priority_missing',
          `complex 页面必须有 page_strategy.region_priority`,
          designPlanPath);
      }
    }

    // 10. design_plan 不得新增业务流程和业务内容
    // component_mapping.block 必须引用已存在的 content_id
    for (const mapping of (plan.component_mapping || [])) {
      const block = mapping?.block;
      if (block && !contentIds.has(block)) {
        add('error', 'plan.mapping_block_unknown',
          `component_mapping.block 引用了不存在的 content_id：${block}；设计计划不得新增业务内容`,
          designPlanPath);
      }
    }
  }
  report.metrics.interactionSpecChecked = checkedNewFormat;
}

function checkBusinessIterationWorkflow(context) {
  const script = path.join(repoRoot, 'scripts/iteration-record.mjs');
  if (!fs.existsSync(script)) {
    add('error', 'iteration.script_missing', '缺少业务迭代状态机脚本 scripts/iteration-record.mjs', script);
    return;
  }
  const claimFiles = context.effectiveScope === 'system' ? [] : context.changedFiles;
  const commandArgs = [script, 'check', ...claimFiles.map(file => `--changed-file=${file}`)];
  const checked = spawnSync(process.execPath, commandArgs, { cwd: repoRoot, encoding: 'utf8' });
  if (checked.status !== 0) {
    add('error', 'iteration.check_failed', (checked.stderr || checked.stdout || '业务迭代检查失败').trim(), script);
  } else {
    report.metrics.businessIterations = Number(checked.stdout.match(/(\d+) 个迭代/)?.[1] || 0);
  }
  if (context.validatorChanged || context.effectiveScope === 'system' || context.effectiveScope === 'full') {
    const tested = spawnSync(process.execPath, [script, 'test'], { cwd: repoRoot, encoding: 'utf8' });
    if (tested.status !== 0) add('error', 'iteration.tests_failed', (tested.stderr || tested.stdout || '业务迭代状态机回归失败').trim(), script);
  }
}

function main() {
  if (!['changed', 'system', 'full'].includes(requestedScope)) {
    add('error', 'args.scope_invalid', `--scope 只能是 changed、system 或 full，当前为：${requestedScope}`);
    return finish();
  }

  checkRequiredFiles();
  if (report.errors.length > 0) return finish();

  let slugs = checkComponentFiles({ full: false });
  const context = createContext(slugs);
  const full = context.effectiveScope === 'full' || context.effectiveScope === 'system';
  const includePrototypeOutputs = context.effectiveScope !== 'system';
  const scopedSlugs = full ? slugs : [...context.changedSlugs].filter(slug => slugs.includes(slug));

  report.scope = context.effectiveScope;
  report.metrics.changedFiles = context.changedFiles.length;
  report.metrics.changedComponents = scopedSlugs.length;
  report.metrics.changedUiKits = context.changedKits.size;
  checkBusinessIterationWorkflow(context);
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
  checkWegoAppLibSync(context);
  if (includePrototypeOutputs) {
    checkWegoAppStructure(context);
    checkPrototypeSurfaceDesigns(context);
    checkPrototypeJunkAndInternalCopy(context);
    checkPrototypeShellLeakage(context);
    checkPrototypeSpecArchive(context);
    checkPrototypeTokenHardcoding(context);
    checkPrototypeComponentClassInvention(context);
    checkPrototypeSinglePreviewShellRouting(context);
    checkPrototypeHostShellUniqueness(context);
    checkInteractionSpecAndDesignPlanReferences(context);
  } else {
    add('info', 'scope.prototype_outputs_skipped', 'system 范围只验证设计系统与工作流本体，已跳过 wego-app 业务场景产物。');
  }
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
