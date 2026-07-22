#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { validatePromptContractShape } from './prompt-contract-schema.mjs';
import { parseRegisteredSceneSource, parseSceneTemplate } from './scene-source-parser.mjs';
import { parseRouteRegistrySource } from './route-source-parser.mjs';

const args = process.argv.slice(2);
const sceneDirectory = args[0];
const jsonOutput = args.includes('--json');
const routesFlag = args.indexOf('--routes');
if (!sceneDirectory) {
  console.error('用法：node scripts/validate-scene-contract.mjs wego-app/scenes/{中文业务场景} [--json] [--routes 路径]');
  process.exit(2);
}
if (routesFlag >= 0 && !args[routesFlag + 1]) {
  console.error('--routes 必须指定 routes.js 路径');
  process.exit(2);
}

const root = process.cwd();
const libraryRoot = path.join(root, '.codex/skills/wego-design');
const sharedDesignDecisionsFile = path.join(root, '.codex/skills/shared/references/design-decisions.md');
const sceneRoot = path.resolve(root, sceneDirectory);
const sceneJs = path.join(sceneRoot, 'scene.js');
const sceneCss = path.join(sceneRoot, 'scene.css');
const decisionsFile = path.join(sceneRoot, 'design-decisions.json');
const routesFile = routesFlag >= 0 ? path.resolve(root, args[routesFlag + 1]) : path.join(root, 'wego-app/js/routes.js');
const tokenCssFile = path.join(libraryRoot, 'colors_and_type.css');
const metadataFile = path.join(libraryRoot, 'metadata.json');
const consumptionFile = path.join(libraryRoot, 'library-consumption.json');
const componentIndexFile = path.join(libraryRoot, 'components/index.json');
const uikitPlanFile = path.join(libraryRoot, 'uikit-plan.json');
const errors = [];
const warnings = [];
const add = (code, message, file = null) => errors.push({ code, message, file });
const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

function flatten(node, out = []) {
  for (const child of node.children || []) { out.push(child); flatten(child, out); }
  return out;
}

function classSet(node) { return new Set(String(node.attrs.class || '').split(/\s+/).filter(Boolean)); }
function isPlainObject(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function selectorMatchesNode(selector, node) {
  const value = String(selector || '').trim();
  if (!value || /[\s>+~]/.test(value)) return false;
  const withoutPseudo = value.replace(/:{1,2}[\w-]+(?:\([^)]*\))?/g, '');
  const tag = withoutPseudo.match(/^[A-Za-z][\w-]*/)?.[0]?.toLowerCase() || null;
  const id = withoutPseudo.match(/#([\w-]+)/)?.[1] || null;
  const classes = [...withoutPseudo.matchAll(/\.([\w-]+)/g)].map(match => match[1]);
  if (!tag && !id && !classes.length) return false;
  return (!tag || node.tag === tag) && (!id || node.attrs.id === id) && classes.every(className => classSet(node).has(className));
}

function strictSimpleSelectorMatchesNode(selector, node) {
  let value = String(selector || '').trim();
  if (!value || /[\s>+~:]/.test(value)) return false;
  const attributes = [];
  value = value.replace(/\[([:\w-]+)(?:\s*=\s*(["'])(.*?)\2)?\]/g, (raw, name, quote, expected) => {
    attributes.push({ name, expected: quote ? expected : null });
    return '';
  });
  if (/[\[\]]/.test(value)) return false;
  const tag = value.match(/^[A-Za-z][\w-]*/)?.[0]?.toLowerCase() || null;
  const idMatches = [...value.matchAll(/#([\w-]+)/g)].map(match => match[1]);
  const classes = [...value.matchAll(/\.([\w-]+)/g)].map(match => match[1]);
  const remainder = value
    .replace(/^[A-Za-z][\w-]*/, '')
    .replace(/#[\w-]+/g, '')
    .replace(/\.[\w-]+/g, '');
  if (remainder || idMatches.length > 1 || (!tag && !idMatches.length && !classes.length && !attributes.length)) return false;
  return (!tag || node.tag === tag)
    && (!idMatches.length || node.attrs.id === idMatches[0])
    && classes.every(className => classSet(node).has(className))
    && attributes.every(attribute => Object.hasOwn(node.attrs, attribute.name) && (attribute.expected === null || node.attrs[attribute.name] === attribute.expected));
}

function selectorTargetsNode(selector, node) {
  const withoutPseudo = String(selector || '').replace(/:{1,2}[\w-]+(?:\([^)]*\))?/g, '');
  const target = withoutPseudo.trim().split(/[\s>+~]+/).filter(Boolean).at(-1) || '';
  return strictSimpleSelectorMatchesNode(target, node);
}

function selectorExistsInScope(rootNode, selector) {
  const scope = [rootNode, ...flatten(rootNode, [])];
  return String(selector || '').split('|').map(value => value.trim()).filter(Boolean).some(value => scope.some(node => selectorMatchesNode(value, node)));
}

function selectorNodesInScope(rootNode, selector) {
  const scope = [rootNode, ...flatten(rootNode, [])];
  return scope.filter(node => String(selector || '').split('|').map(value => value.trim()).filter(Boolean).some(value => selectorMatchesNode(value, node)));
}

function validateVariantDomRules(bindingId, binding, contract, node, reportError) {
  const rules = contract.domAnatomy?.variantRules;
  if (!isPlainObject(rules)) return;
  const descendants = flatten(node, []);
  const matchesRoot = selector => strictSimpleSelectorMatchesNode(selector, node);
  const matchesDescendant = selector => descendants.some(descendant => strictSimpleSelectorMatchesNode(selector, descendant));
  const selectorList = value => Array.isArray(value) ? value.filter(selector => typeof selector === 'string') : [];
  const positiveFields = ['rootAllOf', 'rootOneOf', 'descendantAllOf', 'descendantOneOf'];
  for (const [dimension, rule] of Object.entries(rules)) {
    const hasValue = Object.hasOwn(binding.variant_dimensions || {}, dimension);
    if (rule?.required === true && !hasValue) {
      reportError('scene.component_variant_required', `组件 ${bindingId} 必须声明可验证维度：${dimension}`);
      continue;
    }
    if (!hasValue) continue;
    const value = binding.variant_dimensions[dimension];
    const constraints = rule?.values?.[value];
    if (!isPlainObject(constraints)) {
      reportError('scene.component_variant_mapping', `组件 ${bindingId}.${dimension}=${value} 缺少 DOM 约束映射`);
      continue;
    }
    const failures = [];
    const rootAllOf = selectorList(constraints.rootAllOf);
    const rootOneOf = selectorList(constraints.rootOneOf);
    const rootNoneOf = selectorList(constraints.rootNoneOf);
    const descendantAllOf = selectorList(constraints.descendantAllOf);
    const descendantOneOf = selectorList(constraints.descendantOneOf);
    const descendantNoneOf = selectorList(constraints.descendantNoneOf);
    if (rootAllOf.some(selector => !matchesRoot(selector))) failures.push(`根缺少 ${rootAllOf.filter(selector => !matchesRoot(selector)).join('、')}`);
    if (rootOneOf.length && !rootOneOf.some(matchesRoot)) failures.push(`根未命中任一 ${rootOneOf.join('、')}`);
    if (rootNoneOf.some(matchesRoot)) failures.push(`根包含禁用 selector ${rootNoneOf.filter(matchesRoot).join('、')}`);
    if (descendantAllOf.some(selector => !matchesDescendant(selector))) failures.push(`后代缺少 ${descendantAllOf.filter(selector => !matchesDescendant(selector)).join('、')}`);
    if (descendantOneOf.length && !descendantOneOf.some(matchesDescendant)) failures.push(`后代未命中任一 ${descendantOneOf.join('、')}`);
    if (descendantNoneOf.some(matchesDescendant)) failures.push(`后代包含禁用 selector ${descendantNoneOf.filter(matchesDescendant).join('、')}`);
    if (rule.exclusive === true) {
      const selectedPositive = new Set(positiveFields.flatMap(field => selectorList(constraints[field])));
      for (const [otherValue, otherConstraints] of Object.entries(isPlainObject(rule.values) ? rule.values : {})) {
        if (otherValue === value || !isPlainObject(otherConstraints)) continue;
        const conflictingRoot = [...selectorList(otherConstraints.rootAllOf), ...selectorList(otherConstraints.rootOneOf)].filter(selector => !selectedPositive.has(selector) && matchesRoot(selector));
        const conflictingDescendants = [...selectorList(otherConstraints.descendantAllOf), ...selectorList(otherConstraints.descendantOneOf)].filter(selector => !selectedPositive.has(selector) && matchesDescendant(selector));
        if (conflictingRoot.length || conflictingDescendants.length) failures.push(`同时命中互斥值 ${otherValue}`);
      }
    }
    if (failures.length) reportError('scene.component_variant_dom', `组件 ${bindingId}.${dimension}=${value} 与实际 DOM 不一致：${[...new Set(failures)].join('；')}`);
  }
}

function normalizeCssSelector(selector) {
  return String(selector || '').trim().replace(/\s+/g, ' ').replace(/\s*([>+~])\s*/g, '$1');
}

function splitCssTopLevel(source, delimiter) {
  const parts = [];
  let start = 0;
  let quote = null;
  let depth = 0;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth = Math.max(0, depth - 1);
    else if (char === delimiter && depth === 0) { parts.push(source.slice(start, index)); start = index + 1; }
  }
  parts.push(source.slice(start));
  return parts;
}

function findCssBrace(source, start) {
  let quote = null;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '{') return index;
  }
  return -1;
}

function findMatchingDelimiter(source, start, open = '{', close = '}') {
  let quote = null;
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (char === open) depth += 1;
    else if (char === close && --depth === 0) return index;
  }
  return -1;
}

function parseCssDeclarations(body) {
  const declarations = [];
  for (const source of splitCssTopLevel(body, ';')) {
    let quote = null;
    let depth = 0;
    let colon = -1;
    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (quote) {
        if (char === '\\') index += 1;
        else if (char === quote) quote = null;
        continue;
      }
      if (char === '"' || char === "'") { quote = char; continue; }
      if (char === '(' || char === '[') depth += 1;
      else if (char === ')' || char === ']') depth = Math.max(0, depth - 1);
      else if (char === ':' && depth === 0) { colon = index; break; }
    }
    if (colon < 0) continue;
    const property = source.slice(0, colon).trim().toLowerCase();
    const value = source.slice(colon + 1).trim();
    if (property && value) declarations.push({ property, value });
  }
  return declarations;
}

function stripCssComments(source) {
  return String(source || '').replace(/\/\*[\s\S]*?\*\//g, '');
}

function parseCssRules(source) {
  const rules = [];
  rules.nestedSelectors = [];
  const clean = stripCssComments(source);
  function walk(segment, atRules = []) {
    let cursor = 0;
    while (cursor < segment.length) {
      const open = findCssBrace(segment, cursor);
      if (open < 0) break;
      const close = findMatchingDelimiter(segment, open);
      if (close < 0) break;
      const headerStart = Math.max(segment.lastIndexOf('}', open - 1), segment.lastIndexOf(';', open - 1)) + 1;
      const header = segment.slice(Math.max(cursor, headerStart), open).trim();
      const body = segment.slice(open + 1, close);
      if (header.startsWith('@')) {
        if (body.includes('{')) walk(body, [...atRules, header]);
      } else if (header) {
        const selectors = splitCssTopLevel(header, ',').map(normalizeCssSelector).filter(Boolean);
        if (selectors.length) {
          if (findCssBrace(body, 0) >= 0) rules.nestedSelectors.push(...selectors);
          else rules.push({ selectors, declarations: parseCssDeclarations(body), atRules });
        }
      }
      cursor = close + 1;
    }
  }
  walk(clean);
  return rules;
}

function cssVariables(value) {
  return [...String(value || '').matchAll(/var\(\s*(--[\w-]+)/g)].map(match => `var(${match[1]})`);
}

const spacingProperties = /^(?:margin(?:-(?:top|right|bottom|left|inline|inline-start|inline-end|block|block-start|block-end))?|padding(?:-(?:top|right|bottom|left|inline|inline-start|inline-end|block|block-start|block-end))?|gap|row-gap|column-gap)$/;
const radiusProperties = /^(?:border-radius|border-(?:top|right|bottom|left)-(?:left|right)-radius|border-(?:start|end)-(?:start|end)-radius)$/;
const borderShorthandProperties = /^(?:border|border-(?:top|right|bottom|left|inline|inline-start|inline-end|block|block-start|block-end))$/;
const shadowProperties = new Set(['box-shadow', 'text-shadow']);
const typographyProperties = new Set(['font', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing']);
function isVisualBindingProperty(property) {
  return property === 'color' || property === 'fill' || property === 'stroke' || property.startsWith('background') || property.startsWith('border') || typographyProperties.has(property) || shadowProperties.has(property) || spacingProperties.test(property) || radiusProperties.test(property);
}

function hasNonZeroDimensionLiteral(value) {
  const withoutVariables = String(value).replace(/var\([^)]*\)/g, '');
  const units = '(?:px|r?em|%|v(?:w|h|min|max|i|b)|(?:s|l|d)v(?:w|h|min|max|i|b)|cq(?:w|h|i|b|min|max)|r?lh|ch|ex|cap|ic|cm|mm|in|pt|pc)';
  return [...withoutVariables.matchAll(new RegExp(`(?:^|[^\\w-])(-?(?:\\d+\\.?\\d*|\\.\\d+))${units}(?![\\w-])`, 'gi'))].some(match => Number(match[1]) !== 0);
}

function hasNonZeroNumberLiteral(value) {
  const withoutVariables = String(value).replace(/var\([^)]*\)/g, '');
  return [...withoutVariables.matchAll(/(?:^|[^\w-])(-?(?:\d+\.?\d*|\.\d+))(?![\w-])/g)].some(match => Number(match[1]) !== 0);
}

function hasRawDesignValue(property, value) {
  const normalized = String(value).replace(/\s*!important\s*$/i, '').trim();
  if (spacingProperties.test(property) || radiusProperties.test(property)) return hasNonZeroDimensionLiteral(normalized);
  if (['font', 'font-family', 'font-size', 'font-weight'].includes(property)) {
    if (/^(?:inherit|initial|unset)$/.test(normalized)) return false;
    return !/^var\(\s*--[\w-]+\s*\)$/.test(normalized);
  }
  if (['line-height', 'letter-spacing'].includes(property)) {
    const withoutVariables = normalized.replace(/var\([^)]*\)/g, '').trim();
    return hasNonZeroDimensionLiteral(withoutVariables) || hasNonZeroNumberLiteral(withoutVariables);
  }
  if (shadowProperties.has(property)) return !/^(?:none|inherit|initial|unset|var\(\s*--[\w-]+\s*\))$/.test(normalized);
  if (borderShorthandProperties.test(property)) {
    const remainder = normalized
      .replace(/var\([^)]*\)/g, '')
      .replace(/-?(?:\d+\.?\d*|\.\d+)(?:px|r?em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)?/gi, '')
      .replace(/\b(?:none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|transparent|currentColor|inherit|initial|unset)\b/gi, '')
      .replace(/[\s,\/]+/g, '');
    return remainder.length > 0;
  }
  const colorProperty = property === 'color' || property === 'fill' || property === 'stroke' || property === 'border-color' || /^border-(?:top|right|bottom|left)-color$/.test(property) || property.startsWith('background');
  if (!colorProperty) return false;
  const remainder = normalized
    .replace(/var\([^)]*\)/g, '')
    .replace(/\b(?:transparent|currentColor|none|inherit|initial|unset)\b/gi, '')
    .replace(/[\s,\/]+/g, '');
  return remainder.length > 0;
}

function hasCssVariableFallback(value) {
  return /var\(\s*--[\w-]+\s*,/i.test(String(value || ''));
}

function sanitizeJavaScript(source, preserveTemplateContent = false) {
  const input = String(source || '');
  const output = input.split('');
  let quote = null;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (lineComment) {
      if (char === '\n') lineComment = false;
      else output[index] = ' ';
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') { output[index] = output[index + 1] = ' '; index += 1; blockComment = false; }
      else if (char !== '\n') output[index] = ' ';
      continue;
    }
    if (quote) {
      const preserve = preserveTemplateContent && quote === '`';
      if (char === '\\') {
        if (!preserve) output[index] = ' ';
        if (index + 1 < input.length && !preserve) output[index + 1] = ' ';
        index += 1;
      }
      else {
        if (char === quote) quote = null;
        if (!preserve && char !== '\n') output[index] = ' ';
      }
      continue;
    }
    if (char === '/' && next === '/') { output[index] = output[index + 1] = ' '; index += 1; lineComment = true; continue; }
    if (char === '/' && next === '*') { output[index] = output[index + 1] = ' '; index += 1; blockComment = true; continue; }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      if (!(preserveTemplateContent && char === '`')) output[index] = ' ';
    }
  }
  return output.join('');
}

function maskJavaScript(source) { return sanitizeJavaScript(source, false); }

function findReferencedDomId(source, knownIds) {
  const normalized = String(source || '').replace(/\\(["'])/g, '$1');
  if (!normalized.includes('data-dom-id')) return null;
  let found = null;
  let foundAt = -1;
  for (const id of knownIds) {
    const matches = [...normalized.matchAll(new RegExp(`data-dom-id\\s*=\\s*["']${escapeRegex(id)}["']`, 'g'))];
    const position = matches.at(-1)?.index ?? -1;
    if (position > foundAt) { found = id; foundAt = position; }
  }
  return found;
}

function splitCallArguments(source, openParen) {
  const masked = maskJavaScript(source);
  const closeParen = findMatchingDelimiter(masked, openParen, '(', ')');
  if (closeParen < 0) return [];
  const ranges = [];
  let start = openParen + 1;
  let depth = 0;
  for (let index = start; index < closeParen; index += 1) {
    const char = masked[index];
    if (char === '(' || char === '[' || char === '{') depth += 1;
    else if (char === ')' || char === ']' || char === '}') depth = Math.max(0, depth - 1);
    else if (char === ',' && depth === 0) { ranges.push([start, index]); start = index + 1; }
  }
  ranges.push([start, closeParen]);
  return ranges.map(([from, to]) => source.slice(from, to).trim());
}

function findStatementEnd(masked, start) {
  let depth = 0;
  for (let index = start; index < masked.length; index += 1) {
    const char = masked[index];
    if (char === '(' || char === '[' || char === '{') depth += 1;
    else if (char === ')' || char === ']' || char === '}') depth = Math.max(0, depth - 1);
    else if (char === ';' && depth === 0) return index;
  }
  return masked.length;
}

function collectVariableInitializers(source) {
  const masked = maskJavaScript(source);
  const variables = new Map();
  for (const match of masked.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g)) {
    const expressionStart = match.index + match[0].length;
    const expressionEnd = findStatementEnd(masked, expressionStart);
    variables.set(match[1], source.slice(expressionStart, expressionEnd).trim());
  }
  return variables;
}

function callableBody(expression) {
  const source = String(expression || '').trim();
  const masked = maskJavaScript(source);
  if (/^(?:async\s+)?function\b/.test(masked)) {
    const open = masked.indexOf('{');
    const close = open >= 0 ? findMatchingDelimiter(masked, open) : -1;
    return close >= 0 ? source.slice(open + 1, close) : '';
  }
  const arrow = masked.indexOf('=>');
  if (arrow < 0) return '';
  const bodyStart = masked.slice(arrow + 2).search(/\S/) + arrow + 2;
  if (bodyStart < arrow + 2) return '';
  if (masked[bodyStart] === '{') {
    const close = findMatchingDelimiter(masked, bodyStart);
    return close >= 0 ? source.slice(bodyStart + 1, close) : '';
  }
  return source.slice(bodyStart).trim();
}

function collectLocalCallables(source) {
  const masked = maskJavaScript(source);
  const callables = new Map();
  for (const match of masked.matchAll(/\b(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
    const paramsOpen = masked.indexOf('(', match.index);
    const paramsClose = findMatchingDelimiter(masked, paramsOpen, '(', ')');
    const bodyOpen = paramsClose >= 0 ? masked.indexOf('{', paramsClose) : -1;
    const bodyClose = bodyOpen >= 0 ? findMatchingDelimiter(masked, bodyOpen) : -1;
    if (bodyClose >= 0) callables.set(match[1], source.slice(bodyOpen + 1, bodyClose));
  }
  for (const [name, expression] of collectVariableInitializers(source)) {
    const body = callableBody(expression);
    if (body) callables.set(name, body);
  }
  return callables;
}

function expandHandlerSource(expression, callables) {
  const name = String(expression || '').trim();
  const body = /^[A-Za-z_$][\w$]*$/.test(name) ? callables.get(name) || '' : callableBody(expression);
  if (!body) return '';
  const masked = maskJavaScript(body);
  const expanded = [body];
  for (const [helperName, helperBody] of callables) {
    if (helperBody === body) continue;
    if (new RegExp(`(?:^|[^\\w$.])${escapeRegex(helperName)}\\s*\\(`).test(masked)) expanded.push(helperBody);
  }
  return expanded.join('\n');
}

function findReceiverStart(masked, methodIndex) {
  let round = 0;
  let square = 0;
  for (let index = methodIndex - 1; index >= 0; index -= 1) {
    const char = masked[index];
    if (char === ')') round += 1;
    else if (char === '(' && round > 0) round -= 1;
    else if (char === ']') square += 1;
    else if (char === '[' && square > 0) square -= 1;
    else if (round === 0 && square === 0 && (char === ';' || char === '{' || char === '}')) return index + 1;
  }
  return 0;
}

function interactionHandlersByDomId(source, initBody, domIds) {
  const maskedInit = maskJavaScript(initBody);
  const callables = collectLocalCallables(source);
  // 构造占位符 dom_id 的匹配正则：支持 "more-{post_id}" 这类声明匹配 "more-' + variable + '" 或 "more-${...}" 拼接
  const patternMatchers = domIds
    .filter(id => /\{[^}]+\}/.test(id))
    .map(id => {
      const parts = id.split(/(\{[^}]+\})/);
      const literalParts = parts.map(part => {
        if (/^\{[^}]+\}$/.test(part)) return '\\$\\{[^}]+\\}';
        return escapeRegex(part);
      });
      const concatParts = parts.map(part => {
        if (/^\{[^}]+\}$/.test(part)) return '[\\s\\S]*?';
        return escapeRegex(part);
      });
      return {
        id,
        literalRegex: new RegExp(`data-dom-id\\s*=\\s*["'][^"']*${literalParts.join('')}[^"']*["']`),
        concatRegex: new RegExp(`data-dom-id\\s*=\\s*["']${concatParts.join('')}["']`)
      };
    });
  const findDomIdWithPattern = (expression) => {
    const exact = findReferencedDomId(expression, domIds);
    if (exact) return exact;
    for (const { id, literalRegex, concatRegex } of patternMatchers) {
      if (literalRegex.test(expression) || concatRegex.test(expression)) return id;
    }
    return null;
  };
  const variableIds = new Map();
  for (const [name, expression] of collectVariableInitializers(initBody)) {
    const id = findDomIdWithPattern(expression);
    if (id && /\bquerySelector\s*\(/.test(maskJavaScript(expression))) variableIds.set(name, id);
  }
  const handlers = new Map(domIds.map(id => [id, []]));
  for (const match of maskedInit.matchAll(/(?:\?\.|\.)\s*addEventListener\s*\(/g)) {
    const methodIndex = match.index;
    const receiver = initBody.slice(findReceiverStart(maskedInit, methodIndex), methodIndex).trim();
    const variable = maskJavaScript(receiver).match(/([A-Za-z_$][\w$]*)\s*$/)?.[1];
    const id = variableIds.get(variable) || findDomIdWithPattern(receiver);
    if (!id) continue;
    const openParen = maskedInit.indexOf('(', methodIndex);
    const handlerExpression = splitCallArguments(initBody, openParen)[1] || '';
    const handler = expandHandlerSource(handlerExpression, callables);
    if (handler) handlers.get(id).push(handler);
  }
  return handlers;
}

function contextCallArguments(source, method) {
  const masked = maskJavaScript(source);
  const calls = [];
  const pattern = new RegExp(`\\bctx\\s*(?:\\?\\.\\s*|\\.\\s*)${escapeRegex(method)}\\s*\\(`, 'g');
  for (const match of masked.matchAll(pattern)) {
    const openParen = masked.indexOf('(', match.index);
    calls.push(splitCallArguments(source, openParen));
  }
  return calls;
}

function staticStringValue(source) {
  const value = String(source || '').trim();
  const quote = value[0];
  if ((quote !== '"' && quote !== "'") || value.at(-1) !== quote || value.slice(1, -1).includes('\\')) return null;
  return value.slice(1, -1);
}

function staticStringAt(source, start) {
  let index = start;
  while (/\s/.test(source[index] || '')) index += 1;
  const quote = source[index];
  if (quote !== '"' && quote !== "'") return null;
  let end = index + 1;
  while (end < source.length) {
    if (source[end] === '\\') { end += 2; continue; }
    if (source[end] === quote) return staticStringValue(source.slice(index, end + 1));
    end += 1;
  }
  return null;
}

function stringLiteralEnd(source, start) {
  const quote = source[start];
  if (quote !== '"' && quote !== "'") return -1;
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === '\\') { index += 1; continue; }
    if (source[index] === quote) return index;
  }
  return -1;
}

function topLevelObjectPropertySource(source, property) {
  const masked = maskJavaScript(source);
  const open = masked.indexOf('{');
  if (open < 0) return null;
  const close = findMatchingDelimiter(masked, open);
  if (close < 0) return null;
  let braceDepth = 0;
  let roundDepth = 0;
  let squareDepth = 0;
  for (let index = open; index < close; index += 1) {
    const char = masked[index];
    if (char === '{') { braceDepth += 1; continue; }
    if (char === '}') { braceDepth -= 1; continue; }
    if (char === '(') { roundDepth += 1; continue; }
    if (char === ')') { roundDepth = Math.max(0, roundDepth - 1); continue; }
    if (char === '[') { squareDepth += 1; continue; }
    if (char === ']') { squareDepth = Math.max(0, squareDepth - 1); continue; }
    if (braceDepth !== 1 || roundDepth || squareDepth) continue;
    let key = null;
    let keyEnd = index;
    if (/[A-Za-z_$]/.test(char)) {
      const match = /^[A-Za-z_$][\w$]*/.exec(masked.slice(index));
      key = match?.[0] || null;
      keyEnd = index + (match?.[0].length || 0);
    } else if (source[index] === '"' || source[index] === "'") {
      const end = stringLiteralEnd(source, index);
      if (end >= 0) { key = staticStringValue(source.slice(index, end + 1)); keyEnd = end + 1; }
    }
    if (key === null) continue;
    let colon = keyEnd;
    while (/\s/.test(source[colon] || '')) colon += 1;
    if (masked[colon] !== ':') continue;
    if (key !== property) { index = Math.max(index, keyEnd - 1); continue; }
    let valueStart = colon + 1;
    while (/\s/.test(source[valueStart] || '')) valueStart += 1;
    let nestedBrace = 0;
    let nestedRound = 0;
    let nestedSquare = 0;
    for (let valueEnd = valueStart; valueEnd <= close; valueEnd += 1) {
      const valueChar = masked[valueEnd];
      if (valueChar === '{') nestedBrace += 1;
      else if (valueChar === '}') {
        if (nestedBrace === 0 && nestedRound === 0 && nestedSquare === 0) return source.slice(valueStart, valueEnd).trim();
        nestedBrace = Math.max(0, nestedBrace - 1);
      } else if (valueChar === '(') nestedRound += 1;
      else if (valueChar === ')') nestedRound = Math.max(0, nestedRound - 1);
      else if (valueChar === '[') nestedSquare += 1;
      else if (valueChar === ']') nestedSquare = Math.max(0, nestedSquare - 1);
      else if (valueChar === ',' && nestedBrace === 0 && nestedRound === 0 && nestedSquare === 0) return source.slice(valueStart, valueEnd).trim();
    }
    return null;
  }
  return null;
}

function topLevelObjectStringValue(source, property) {
  return staticStringValue(topLevelObjectPropertySource(source, property));
}

function methodCallArguments(source, method) {
  const masked = maskJavaScript(source);
  const calls = [];
  const pattern = new RegExp(`(?:\\?\\.|\\.)\\s*${escapeRegex(method)}\\s*\\(`, 'g');
  for (const match of masked.matchAll(pattern)) {
    const openParen = masked.indexOf('(', match.index);
    calls.push(splitCallArguments(source, openParen));
  }
  return calls;
}

function mutatesVisibleState(source, targetState) {
  const masked = maskJavaScript(source);
  const stateRef = /\bctx\s*(?:\?\.\s*|\.\s*)(?:state|appState)\b/g;
  const assignment = /^\s*(?:\+\+|--|(?:\?\?|&&|\|\||[+\-*/%&|^])?=(?!=))/;
  for (const match of masked.matchAll(stateRef)) {
    const afterState = match.index + match[0].length;
    const suffix = masked.slice(afterState);
    const dotMember = /^\s*\.\s*([A-Za-z_$][\w$]*)/.exec(suffix);
    if (dotMember && ['set', 'delete'].includes(dotMember[1])) {
      const methodEnd = afterState + dotMember[0].length;
      const callStart = /^\s*\(/.exec(masked.slice(methodEnd));
      const openParen = callStart ? methodEnd + callStart[0].lastIndexOf('(') : -1;
      if (openParen >= 0 && staticStringValue(splitCallArguments(source, openParen)[0]) === targetState) return true;
      continue;
    }
    let memberName = dotMember?.[1] || null;
    let memberEnd = dotMember ? afterState + dotMember[0].length : afterState;
    if (!memberName) {
      const bracket = /^\s*\[/.exec(suffix);
      if (!bracket) continue;
      const bracketOpen = afterState + bracket[0].lastIndexOf('[');
      const bracketClose = findMatchingDelimiter(masked, bracketOpen, '[', ']');
      if (bracketClose < 0) continue;
      memberName = staticStringValue(source.slice(bracketOpen + 1, bracketClose));
      memberEnd = bracketClose + 1;
    }
    if (memberName !== targetState) continue;
    const prefix = masked.slice(Math.max(0, match.index - 16), match.index);
    if (/\bdelete\s*$|(?:\+\+|--)\s*$/.test(prefix) || assignment.test(masked.slice(memberEnd))) return true;
  }
  return false;
}

function isStrictIsoTimestamp(value) {
  if (typeof value !== 'string') return false;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= days[month - 1] && Number.isFinite(Date.parse(value));
}

let js = '';
let css = '';
let decision = null;
if (!fs.existsSync(sceneJs) || !fs.existsSync(sceneCss)) add('scene.files', '场景必须包含 scene.js 与 scene.css', sceneRoot);
if (fs.existsSync(sceneJs)) js = fs.readFileSync(sceneJs, 'utf8');
if (fs.existsSync(sceneCss)) css = fs.readFileSync(sceneCss, 'utf8');
const cleanCss = stripCssComments(css);
const cssRules = parseCssRules(css);
const declaredDesignTokens = fs.existsSync(tokenCssFile) ? new Set([...fs.readFileSync(tokenCssFile, 'utf8').matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1])) : new Set();
const runtimeJs = js.replace(/\/\*\s*wego-design-contract:\s*[\s\S]*?\*\//, '');
let registeredScene = null;
let templateTree = null;
try {
  registeredScene = parseRegisteredSceneSource(runtimeJs);
  templateTree = parseSceneTemplate(registeredScene.template);
} catch (error) { add('scene.registration', error.message, sceneJs); }
const domNodes = templateTree?.nodes || [];
const activeTemplate = registeredScene?.template || '';
const extraction = spawnSync(process.execPath, ['scripts/extract-design-decisions.mjs', sceneDirectory, '--check'], { cwd: root, encoding: 'utf8' });
if (extraction.status !== 0) add('scene.contract', (extraction.stderr || extraction.stdout || '设计合同提取失败').trim(), sceneJs);
if (fs.existsSync(decisionsFile)) {
  try { decision = readJson(decisionsFile); }
  catch (error) { add('scene.decisions_json', `design-decisions.json 无法解析：${error.message}`, decisionsFile); }
} else add('scene.decisions_missing', '场景必须存在 design-decisions.json', decisionsFile);

const rawColors = [...new Set([...`${activeTemplate}\n${cleanCss}`.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(/g)].map(match => match[0]))];
if (rawColors.length) add('scene.raw_color', `禁止硬编码颜色：${rawColors.join(', ')}`, sceneRoot);
if (cssRules.nestedSelectors.length) add('scene.css_nesting', `scene.css 禁止原生 CSS nesting：${[...new Set(cssRules.nestedSelectors)].join(', ')}`, sceneCss);
if (hasCssVariableFallback(cleanCss)) add('scene.token_fallback', 'scene.css 的 var() 禁止声明 fallback，必须直接使用现存正式 Token', sceneCss);
const runtimeSetProperties = new Set(methodCallArguments(runtimeJs, 'setProperty').map(call => staticStringValue(call[0])).filter(Boolean));
for (const token of declaredDesignTokens) {
  const literalDeclaration = new RegExp(`${escapeRegex(token)}\\s*:`);
  if (literalDeclaration.test(activeTemplate) || runtimeSetProperties.has(token)) add('scene.token_redefinition', `场景运行时不得重定义设计系统 Token：${token}`, sceneJs);
}
for (const rule of cssRules) {
  for (const declaration of rule.declarations) {
    if (declaredDesignTokens.has(declaration.property)) add('scene.token_redefinition', `场景不得重定义设计系统 Token：${rule.selectors.join(', ')} ${declaration.property}`, sceneCss);
    if (hasRawDesignValue(declaration.property, declaration.value)) add('scene.raw_design_value', `场景样式必须使用正式 Token：${rule.selectors.join(', ')} ${declaration.property}: ${declaration.value}`, sceneCss);
  }
}
if (/\b(?:TODO|FIXME|lorem|静态原型|设计说明|刷新说明)\b/i.test(`${activeTemplate}\n${cleanCss}`)) add('scene.placeholder', '场景存在占位或内部说明文案', sceneRoot);
const previewShellClasses = [...domNodes.flatMap(node => [...classSet(node)]), ...[...cleanCss.matchAll(/\.((?:phone|uikit|biz)-[\w-]+)/g)].map(match => match[1])].filter(value => /^(?:phone|uikit|biz)-/.test(value));
if (previewShellClasses.length) add('scene.preview_shell_class', `场景不得复制 Preview 或 UI Kit 宿主 class：${[...new Set(previewShellClasses)].join(', ')}`, sceneRoot);

if (decision) {
  const prompt = decision.prompt_contract || {};
  for (const item of validatePromptContractShape(prompt)) add('scene.prompt_contract_schema', `${item.path} ${item.message}`, decisionsFile);
  let metadata = null;
  let consumption = null;
  let index = null;
  let plan = null;
  try { metadata = readJson(metadataFile); } catch (error) { add('scene.metadata', `无法读取设计系统版本：${error.message}`, metadataFile); }
  try { consumption = readJson(consumptionFile); } catch (error) { add('scene.consumption_source', `无法读取消费契约：${error.message}`, consumptionFile); }
  try { index = readJson(componentIndexFile); } catch (error) { add('scene.component_index', `无法读取组件索引：${error.message}`, componentIndexFile); }
  try { plan = readJson(uikitPlanFile); } catch (error) { add('scene.uikit_source', `无法读取 UI Kit 计划：${error.message}`, uikitPlanFile); }
  const indexedComponents = new Map((index?.components || []).map(component => [component.slug, component]));
  const pagePatterns = Array.isArray(plan?.pagePatterns) ? plan.pagePatterns : [];
  if (decision.schemaVersion !== 2 || decision.scene !== path.basename(sceneRoot)) add('scene.decisions_schema', 'design-decisions.json 必须使用 schemaVersion 2 且 scene 与目录一致', decisionsFile);
  if (consumption?.schemaVersion !== 5) add('scene.consumption_schema', 'library-consumption.json 必须使用 schemaVersion 5', consumptionFile);
  if (plan?.schemaVersion !== 5 || !Array.isArray(plan?.pagePatterns)) add('scene.uikit_schema', 'uikit-plan.json 必须使用 schemaVersion 5 且包含 pagePatterns', uikitPlanFile);

  const layout = prompt.layout_contract || {};
  const layoutSource = String(layout.source || '').split('#')[0];
  const layoutSourceFile = layoutSource === 'references/design-decisions.md' ? sharedDesignDecisionsFile : path.join(libraryRoot, layoutSource || '');
  if (!layoutSource || !fs.existsSync(layoutSourceFile)) add('scene.layout_source', 'layout_contract.source 必须指向现存页面范式或设计原则', decisionsFile);
  if (!['pattern', 'composed'].includes(decision.layout_mode) || layout.mode !== decision.layout_mode) add('scene.layout_mode', '设计决策与 layout_contract 必须使用相同且合法的 layout_mode', decisionsFile);
  for (const selector of layout.mutable_regions || []) {
    if (!domNodes.some(node => selectorMatchesNode(selector, node)) && !css.includes(selector)) add('scene.mutable_region', `mutable_regions 未命中实际 DOM 或 CSS：${selector}`, decisionsFile);
  }
  const pageEdgeToken = consumption?.pageEdgeTokens?.[layout.page_edge_mode];
  const surfaceRoot = templateTree?.root || null;
  if (!surfaceRoot || surfaceRoot.attrs['data-surface-id'] !== decision.surface_id) add('scene.page_edge_root', 'template 唯一顶层根必须匹配 surface_id', sceneJs);
  else {
    if (surfaceRoot.attrs['data-page-edge-mode'] !== layout.page_edge_mode) add('scene.page_edge_annotation', '根节点 data-page-edge-mode 必须与 layout_contract.page_edge_mode 一致', sceneJs);
    if (typeof pageEdgeToken !== 'string' || !/^--layout-page-margin-[\w-]+$/.test(pageEdgeToken)) add('scene.page_edge_source', `页面边距模式 ${layout.page_edge_mode || '未声明'} 未映射正式 Token`, consumptionFile);
    else {
      const expectedValue = `var(${pageEdgeToken})`;
      const edgeDeclarations = cssRules
        .filter(rule => rule.atRules.length === 0 && rule.selectors.some(selector => strictSimpleSelectorMatchesNode(selector, surfaceRoot)))
        .flatMap(rule => rule.declarations.filter(declaration => declaration.property === 'padding-inline'));
      const expectedPattern = new RegExp(`^var\\(\\s*${escapeRegex(pageEdgeToken)}\\s*\\)$`);
      const edgeApplied = edgeDeclarations.length > 0 && edgeDeclarations.every(declaration => expectedPattern.test(declaration.value.replace(/\s*!important\s*$/i, '').trim()));
      if (!edgeApplied) add('scene.page_edge_runtime', `场景根 padding-inline 必须直接使用 ${expectedValue}`, sceneCss);
      const horizontalOverrides = new Set(['padding', 'padding-left', 'padding-right', 'padding-inline-start', 'padding-inline-end']);
      const hasHorizontalOverride = cssRules.some(rule => rule.selectors.some(selector => selectorTargetsNode(selector, surfaceRoot)) && rule.declarations.some(declaration => {
        if (horizontalOverrides.has(declaration.property)) return true;
        if (declaration.property !== 'padding-inline') return false;
        return !expectedPattern.test(declaration.value.replace(/\s*!important\s*$/i, '').trim());
      }));
      if (hasHorizontalOverride) add('scene.page_edge_override', '场景根不得用 padding 简写或横向长属性覆盖页面边距 Token', sceneCss);
    }
  }

  const presentation = decision.presentation || {};
  const presentationTypes = consumption?.appRuntime?.presentationTypes;
  for (const field of ['type', 'transition', 'dismissAction', 'overlayLevel', 'source']) if (typeof presentation[field] !== 'string' || !presentation[field]) add('scene.presentation_field', `presentation.${field} 必须是非空字符串`, decisionsFile);
  if (typeof presentation.coversTabBar !== 'boolean') add('scene.presentation_field', 'presentation.coversTabBar 必须是布尔值', decisionsFile);
  if (!Array.isArray(presentationTypes) || !presentationTypes.includes(presentation.type)) add('scene.presentation_type', 'presentation.type 必须来自消费契约', decisionsFile);
  const activeRegistration = registeredScene?.objectSource || '';
  const presentationBlock = topLevelObjectPropertySource(activeRegistration, 'presentation') || '';
  for (const [field, value] of Object.entries(presentation)) {
    if (field === 'source') continue;
    const runtimeValueSource = topLevelObjectPropertySource(presentationBlock, field);
    const runtimeValue = typeof value === 'string' ? staticStringValue(runtimeValueSource) : runtimeValueSource?.trim() === 'true' ? true : runtimeValueSource?.trim() === 'false' ? false : null;
    if (runtimeValue !== value) add('scene.presentation_runtime', `registerScene.presentation.${field} 必须与合同一致`, sceneJs);
  }
  if (decision.layout_mode === 'pattern') {
    const pattern = pagePatterns.find(item => item.id === decision.page_pattern);
    if (!pattern) add('scene.page_pattern', `page_pattern 未命中明确范式：${decision.page_pattern || '未声明'}`, decisionsFile);
    else {
      if (layoutSource !== 'uikit-plan.json' || !String(layout.source).endsWith(`/pagePatterns/${pattern.id}`)) add('scene.pattern_source', 'pattern 模式 layout_contract.source 必须指向命中范式', decisionsFile);
      for (const [field, value] of Object.entries(pattern.presentation || {})) if (presentation[field] !== value) add('scene.presentation_pattern', `presentation.${field} 必须与范式 ${pattern.id} 一致`, decisionsFile);
      if (presentation.source !== `uikit-plan.json#/pagePatterns/${pattern.id}/presentation`) add('scene.presentation_source', 'pattern 模式 presentation.source 必须指向命中范式', decisionsFile);
      const candidates = new Set(pattern.componentCandidates || []);
      for (const binding of prompt.component_bindings || []) if (!candidates.has(binding.slug)) add('scene.pattern_component', `范式 ${pattern.id} 不允许组件：${binding.slug}`, decisionsFile);
    }
  } else {
    if (decision.page_pattern !== null) add('scene.composed_pattern', 'composed 模式的 page_pattern 必须为 null', decisionsFile);
    if (layoutSource !== 'references/design-decisions.md') add('scene.composed_source', 'composed 模式必须以设计决策原则作为 layout_contract.source', decisionsFile);
    if (presentation.source !== 'library-consumption.json#/appRuntime/presentationTypes') add('scene.presentation_source', 'composed 模式 presentation.source 必须指向运行时 presentation 类型', decisionsFile);
  }

  const bindings = new Map((prompt.component_bindings || []).map(binding => [binding.binding_id, binding]));
  const contracts = new Map();
  const allowedComponentTokens = new Set();
  const registeredRoots = new Map();
  for (const [slug] of indexedComponents) {
    const contractFile = path.join(libraryRoot, 'components', `${slug}.json`);
    if (!fs.existsSync(contractFile)) continue;
    try {
      const componentContract = readJson(contractFile);
      for (const rootClass of String(componentContract.domAnatomy?.root || '').split('|').map(value => value.trim().replace(/^\./, '')).filter(Boolean)) registeredRoots.set(rootClass, slug);
    } catch { /* 组件一致性守卫负责报告损坏契约。 */ }
  }
  for (const binding of prompt.component_bindings || []) {
    const indexed = indexedComponents.get(binding.slug);
    const contractFile = path.join(libraryRoot, 'components', `${binding.slug}.json`);
    if (!indexed || indexed.preview !== `preview/component-${binding.slug}.html` || !fs.existsSync(path.join(libraryRoot, indexed?.preview || '')) || !fs.existsSync(contractFile)) {
      add('scene.component_authority', `组件 ${binding.slug} 必须来自索引、Preview 和对应契约`, decisionsFile);
      continue;
    }
    try {
      const contract = readJson(contractFile);
      contracts.set(binding.binding_id, contract);
      for (const token of contract.runtimeTokens || []) allowedComponentTokens.add(token);
      for (const [dimension, value] of Object.entries(binding.variant_dimensions || {})) {
        const allowed = contract.variantDimensions?.[dimension];
        if (!Array.isArray(allowed) || !allowed.includes(value)) add('scene.component_variant', `组件绑定使用未登记变体：${binding.binding_id}.${dimension}=${value}`, decisionsFile);
      }
    } catch (error) { add('scene.component_contract', `无法读取组件契约：${error.message}`, contractFile); }
  }

  for (const node of domNodes) {
    const matchedRoots = [...classSet(node)].filter(className => registeredRoots.has(className));
    if (matchedRoots.length && (!node.attrs['data-dd-id'] || !node.attrs['data-component-binding'] || !node.attrs['data-component-slug'])) add('scene.component_unannotated', `正式组件根节点缺少完整标注：${matchedRoots.map(className => registeredRoots.get(className)).join('、')}`, sceneJs);
  }
  const annotatedNodes = domNodes.filter(node => node.attrs['data-dd-id'] || node.attrs['data-component-binding'] || node.attrs['data-component-slug']);
  const ddIds = new Set();
  const usedBindings = new Set();
  for (const node of annotatedNodes) {
    const ddId = node.attrs['data-dd-id'];
    const bindingId = node.attrs['data-component-binding'];
    const slug = node.attrs['data-component-slug'];
    if (!ddId || !bindingId || !slug) { add('scene.component_annotation', '正式组件实例必须同时声明 data-dd-id、data-component-binding、data-component-slug', sceneJs); continue; }
    if (ddIds.has(ddId)) add('scene.component_id', `data-dd-id 重复：${ddId}`, sceneJs);
    ddIds.add(ddId);
    const binding = bindings.get(bindingId);
    if (!binding) { add('scene.component_binding_missing', `DOM 引用未知 binding：${bindingId}`, sceneJs); continue; }
    usedBindings.add(bindingId);
    if (binding.slug !== slug) add('scene.component_binding_slug', `DOM slug 与 binding 不一致：${bindingId}`, sceneJs);
    const contract = contracts.get(bindingId);
    if (!contract) continue;
    const roots = String(contract.domAnatomy?.root || '').split('|').map(value => value.trim()).filter(Boolean);
    if (!roots.some(rootSelector => selectorMatchesNode(rootSelector, node))) add('scene.component_root', `组件 ${bindingId} 根节点必须匹配契约：${roots.join(' | ')}`, sceneJs);
    for (const child of contract.domAnatomy?.requiredChildren || []) {
      if (!selectorExistsInScope(node, child)) add('scene.component_anatomy', `组件 ${bindingId} 缺少 requiredChildren 结构：${child}`, sceneJs);
    }
    const bodyChildren = contract.domAnatomy?.bodyChildren || [];
    if (bodyChildren.length) {
      const bodySelector = contract.anatomy?.find(item => item.name === 'body')?.selector;
      const bodyNodes = bodySelector ? selectorNodesInScope(node, bodySelector) : [node];
      if (!bodyNodes.length) add('scene.component_anatomy', `组件 ${bindingId} 缺少 body 容器：${bodySelector}`, sceneJs);
      for (const bodyNode of bodyNodes) {
        for (const child of bodyChildren) if (!selectorExistsInScope(bodyNode, child)) add('scene.component_anatomy', `组件 ${bindingId} 的 body 缺少结构：${child}`, sceneJs);
      }
    }
    const itemChildren = contract.domAnatomy?.itemChildren || [];
    if (itemChildren.length) {
      const repeatingSelector = contract.domAnatomy?.repeatingChild;
      const itemNodes = repeatingSelector ? selectorNodesInScope(node, repeatingSelector) : [];
      if (!itemNodes.length) add('scene.component_anatomy', `组件 ${bindingId} 缺少 repeatingChild：${repeatingSelector || '未声明'}`, sceneJs);
      for (const itemNode of itemNodes) {
        for (const child of itemChildren) if (!selectorExistsInScope(itemNode, child)) add('scene.component_anatomy', `组件 ${bindingId} 的 repeatingChild 缺少结构：${child}`, sceneJs);
      }
    }
    for (const alternative of contract.domAnatomy?.alternatives || []) {
      const missingAll = (alternative.allOf || []).filter(selector => !selectorExistsInScope(node, selector));
      if (missingAll.length) add('scene.component_anatomy', `组件 ${bindingId} 缺少 alternatives.allOf 结构：${missingAll.join('、')}`, sceneJs);
      const branches = Array.isArray(alternative.oneOf) ? alternative.oneOf : [];
      const applicableBranches = branches.filter(branch => {
        if (Array.isArray(branch)) return true;
        if (!branch || typeof branch !== 'object' || !Array.isArray(branch.allOf)) return false;
        return Object.entries(branch.when || {}).every(([dimension, value]) => binding.variant_dimensions?.[dimension] === value);
      });
      const branchComplete = branch => {
        const selectors = Array.isArray(branch) ? branch : branch.allOf;
        const branchRoot = Array.isArray(branch) ? null : selectors.find(selector => roots.includes(selector));
        return (!branchRoot || selectorMatchesNode(branchRoot, node)) && selectors.every(selector => selectorExistsInScope(node, selector));
      };
      if (branches.length && (!applicableBranches.length || !applicableBranches.some(branchComplete))) {
        add('scene.component_anatomy', `组件 ${bindingId} 未命中当前变体对应的 alternatives.oneOf 完整结构`, sceneJs);
      }
    }
    validateVariantDomRules(bindingId, binding, contract, node, (code, message) => add(code, message, sceneJs));
  }
  for (const bindingId of bindings.keys()) if (!usedBindings.has(bindingId)) {
    // overlay 类组件（actionsheet、dialog、modal、form 等）通过 ctx.openSheet / ctx.openModal / ctx.openFullScreenModal 运行时注入，
    // 不在静态 template DOM 里；动态列表项里的组件（如卡片里的按钮）也在列表渲染函数里通过字符串拼接注入。
    // 这两类组件通过扫描 scene.js 源码（排除主 template 字符串，避免 HTML 注释里的组件被误判为使用）中的 binding_id 引用来确认使用；
    // 其他组件必须出现在静态 template DOM 里。
    const binding = bindings.get(bindingId);
    const isOverlayOrDynamicComponent = binding && ['actionsheet', 'dialog', 'modal', 'form', 'button', 'avatar', 'image', 'card'].includes(binding.slug);
    const sourceWithoutTemplate = isOverlayOrDynamicComponent ? runtimeJs.replace(activeTemplate, '') : '';
    const referencedInSource = isOverlayOrDynamicComponent && new RegExp(`data-component-binding=["']${escapeRegex(bindingId)}["']`).test(sourceWithoutTemplate);
    if (referencedInSource) {
      usedBindings.add(bindingId);
    } else {
      add('scene.component_binding_unused', `component binding 未被实际 DOM 使用：${bindingId}`, decisionsFile);
    }
  }

  const declaredTokens = declaredDesignTokens;
  const tokenPolicy = consumption?.sceneTokenPolicy;
  if (!tokenPolicy || !Array.isArray(tokenPolicy.baseTokens) || !Array.isArray(tokenPolicy.baseTokenPrefixes)) add('scene.token_policy', '消费契约必须声明 sceneTokenPolicy', consumptionFile);
  const isAllowedToken = token => allowedComponentTokens.has(token) || Boolean(tokenPolicy && (tokenPolicy.baseTokens.includes(token) || tokenPolicy.baseTokenPrefixes.some(prefix => token.startsWith(prefix))));
  const sourceTokens = [...new Set([...`${activeTemplate}\n${cleanCss}`.matchAll(/var\(\s*(--[\w-]+)/g)].map(match => match[1]))];
  const allowedPageEdgeTokens = new Set(Object.values(consumption?.pageEdgeTokens || {}));
  for (const token of sourceTokens) {
    if (!declaredTokens.has(token)) add('scene.token_unknown', `场景使用未声明 Token：${token}`, sceneRoot);
    else if (!isAllowedToken(token)) add('scene.token_scope', `场景使用非当前组件或基础策略 Token：${token}`, sceneRoot);
    if (token.startsWith('--layout-page-margin-') && !allowedPageEdgeTokens.has(token)) add('scene.page_edge_token', `场景不得使用未映射的页面边距 Token：${token}`, sceneRoot);
  }
  const tokenBindingKeys = new Set();
  const tokenBindingTriples = new Set();
  for (const binding of prompt.token_bindings || []) {
    const selector = normalizeCssSelector(binding.selector);
    const property = String(binding.css_property || '').toLowerCase();
    const key = `${selector}\u0000${property}`;
    if (tokenBindingKeys.has(key)) add('scene.token_binding_duplicate', `Token 绑定重复：${binding.selector} ${binding.css_property}`, decisionsFile);
    tokenBindingKeys.add(key);
    tokenBindingTriples.add(`${selector}\u0000${property}\u0000${binding.token}`);
    const tokenName = String(binding.token || '').match(/^var\((--[\w-]+)\)$/)?.[1];
    if (!tokenName || !declaredTokens.has(tokenName)) add('scene.token_binding_source', `token_bindings 使用未声明变量：${binding.token}`, decisionsFile);
    else if (!isAllowedToken(tokenName)) add('scene.token_binding_scope', `token_bindings 使用越权变量：${binding.token}`, decisionsFile);
    const applied = cssRules.some(rule => rule.selectors.includes(selector) && rule.declarations.some(declaration => declaration.property === property && cssVariables(declaration.value).includes(binding.token)));
    if (!applied) add('scene.token_binding_application', `Token 绑定未在指定 selector 实际使用：${binding.selector} ${binding.css_property}`, sceneRoot);
  }
  for (const rule of cssRules) {
    for (const declaration of rule.declarations) {
      if (!isVisualBindingProperty(declaration.property)) continue;
      for (const token of cssVariables(declaration.value)) {
        for (const selector of rule.selectors) {
          if (!tokenBindingTriples.has(`${selector}\u0000${declaration.property}\u0000${token}`)) add('scene.token_binding_missing', `场景视觉声明缺少 token_bindings：${selector} ${declaration.property}`, decisionsFile);
        }
      }
    }
  }
  for (const node of domNodes) {
    const declarations = parseCssDeclarations(node.attrs.style || '');
    if (declarations.some(declaration => isVisualBindingProperty(declaration.property) || hasRawDesignValue(declaration.property, declaration.value))) add('scene.inline_visual_style', '场景排版和颜色必须在 scene.css 中声明并进入 token_bindings，不得使用 inline style', sceneJs);
  }

  const interactions = new Map((prompt.interaction_contract || []).map(item => [item.dom_id, item]));
  // 动态列表项 dom_id 占位符支持：dom_id 形如 "more-{post_id}" 表示运行时由列表渲染函数拼接生成。
  // 占位符 dom_id 不会出现在静态 template DOM 里，守卫通过把占位符模式转成正则，匹配 scene.js 中的三种拼接形式：
  //   1. 模板字面量：data-dom-id="more-${post.post_id}"
  //   2. 字符串拼接：data-dom-id="more-' + post.post_id + '"
  //   3. 字符串拼接（无引号闭合）：data-dom-id="more-' + postId + '"
  // 提取器 extract-design-decisions.mjs 会把模板字面量形式归一化为 "prefix-{placeholder}suffix" 写入 dom_ids；
  // 这里支持 contract 直接写 "more-{post_id}" 等带语义占位符。
  const patternInteractions = new Map();
  for (const item of prompt.interaction_contract || []) {
    const domId = String(item.dom_id || '');
    if (!/\{[^}]+\}/.test(domId)) continue;
    // 把 "more-{post_id}" 拆为 prefix "more-" 和 suffix ""，构造匹配三种形式的正则
    const parts = domId.split(/(\{[^}]+\})/);
    const literalParts = parts.map(part => {
      if (/^\{[^}]+\}$/.test(part)) return '\\$\\{[^}]+\\}';
      return escapeRegex(part);
    });
    const concatParts = parts.map(part => {
      if (/^\{[^}]+\}$/.test(part)) return "[\\s\\S]*?";
      return escapeRegex(part);
    });
    patternInteractions.set(domId, {
      // 模板字面量形式：data-dom-id="more-${post.post_id}"
      literalRegex: new RegExp(`data-dom-id\\s*=\\s*["'][^"']*${literalParts.join('')}[^"']*["']`),
      // 字符串拼接形式：data-dom-id="more-' + post.post_id + '"
      concatRegex: new RegExp(`data-dom-id\\s*=\\s*["']${concatParts.join('')}["']`),
      item
    });
  }
  const domInteractionIds = domNodes.map(node => node.attrs['data-dom-id']).filter(Boolean);
  for (const id of new Set(domInteractionIds)) {
    if (domInteractionIds.filter(value => value === id).length !== 1) add('scene.interaction_dom_duplicate', `data-dom-id 必须唯一：${id}`, sceneJs);
    if (!interactions.has(id) && !patternInteractions.has(id)) add('scene.interaction_contract_missing', `DOM 交互未进入 interaction_contract：${id}`, sceneJs);
  }
  const stateIds = new Set((prompt.state_contract || []).map(state => state.state_id));
  const routesSource = fs.existsSync(routesFile) ? fs.readFileSync(routesFile, 'utf8') : '';
  let routeRecords = [];
  try { routeRecords = parseRouteRegistrySource(routesSource); }
  catch (error) {
    const code = error.message.includes('routeId 必须全局唯一')
      ? 'scene.route_id_duplicate'
      : error.message.includes('host-tab entry.tab 必须全局唯一')
        ? 'scene.host_tab_duplicate'
        : 'scene.routes_registration';
    add(code, error.message, routesFile);
  }
  const handlersByDomId = interactionHandlersByDomId(runtimeJs, registeredScene?.initBody || '', [...interactions.keys()]);
  for (const interaction of prompt.interaction_contract || []) {
    const isPattern = patternInteractions.has(interaction.dom_id);
    // 反向校验：dom_id 必须在静态 template DOM 出现，或在 scene.js 源码的字符串模板中出现
    // （动态列表项占位符模式或 overlay 子页面模板字符串）
    if (!domInteractionIds.includes(interaction.dom_id)) {
      if (isPattern) {
        const pattern = patternInteractions.get(interaction.dom_id);
        const found = pattern.literalRegex.test(runtimeJs) || pattern.concatRegex.test(runtimeJs);
        if (!found) add('scene.interaction_dom', `交互合同占位符 dom_id 在 scene.js 中未找到对应模板拼接：${interaction.dom_id}`, sceneJs);
      } else {
        // 检查是否在 scene.js 源码的模板字符串里（如 overlay 子页面模板）
        const sourcePattern = new RegExp(`data-dom-id\\s*=\\s*["']${escapeRegex(interaction.dom_id)}["']`);
        if (!sourcePattern.test(runtimeJs)) {
          add('scene.interaction_dom', `交互合同缺少 DOM 触发器：${interaction.dom_id}`, sceneJs);
        }
      }
    }
    const handlers = handlersByDomId.get(interaction.dom_id) || [];
    // 对动态列表项占位符 dom_id，handler 校验放宽：允许 init 中通过 querySelector('[data-dom-id="more-' + postId + '"]') 等模式逐项绑定 listener
    if (!handlers.length && !isPattern) add('scene.interaction_handler', `交互触发器未在 init 中绑定具体 listener：${interaction.dom_id}`, sceneJs);
    if (isPattern && !handlers.length) {
      const prefix = String(interaction.dom_id || '').replace(/\{[^}]+\}.*$/, '');
      const prefixPattern = new RegExp(`querySelector(?:All)?\\s*\\(\\s*["'][^"']*data-dom-id[^"']*${escapeRegex(prefix)}`);
      if (!prefixPattern.test(runtimeJs)) add('scene.interaction_handler', `动态列表项交互未在 init 中通过 querySelector 绑定 listener：${interaction.dom_id}`, sceneJs);
    }
    const handlerSource = handlers.join('\n');
    const [scheme, value] = String(interaction.target || '').split(':');
    if (scheme === 'route' && !routeRecords.some(record => record.routeId === value)) add('scene.interaction_target', `目标路由不存在：${value}`, routesFile);
    if (scheme === 'state' && !stateIds.has(value)) add('scene.interaction_target', `目标状态不存在：${value}`, decisionsFile);
    const runtimeApi = {
      'feedback:toast': 'ctx.toast', 'feedback:dialog': 'ctx.dialog',
      'overlay:modal': 'ctx.openModal', 'overlay:sheet': 'ctx.openSheet', 'overlay:full-screen-modal': 'ctx.openFullScreenModal', 'overlay:close': 'ctx.closeOverlay',
      'navigation:back': 'ctx.back', 'route': 'ctx.navigate'
    };
    const expectedApi = scheme === 'route' ? runtimeApi.route : runtimeApi[interaction.target];
    if (scheme === 'route') {
      const navigatesToTarget = contextCallArguments(handlerSource, 'navigate').some(call => staticStringValue(call[0]) === value);
      if (!navigatesToTarget) add('scene.interaction_runtime', `交互 ${interaction.dom_id} 的 handler 未导航到 ${value}`, sceneJs);
    } else if (scheme === 'state') {
      if (!mutatesVisibleState(handlerSource, value)) add('scene.interaction_runtime', `交互 ${interaction.dom_id} 的 handler 未写入或删除目标状态 ${value}`, sceneJs);
    } else if (expectedApi && !contextCallArguments(handlerSource, expectedApi.split('.').at(-1)).length) add('scene.interaction_runtime', `交互 ${interaction.dom_id} 的 handler 未调用 ${expectedApi}`, sceneJs);
  }

  // 逆向校验：scene.js 中的 overlay API 调用必须都在 interaction_contract 中登记。
  // 防止 wego-design 跳过 component_bindings 与 interaction_contract，直接用 ctx.openSheet 等注入 overlay 组件。
  const overlayApiToTarget = {
    openSheet: 'overlay:sheet',
    openModal: 'overlay:modal',
    openFullScreenModal: 'overlay:full-screen-modal'
  };
  const declaredOverlayTargets = new Set(
    (prompt.interaction_contract || [])
      .map(item => String(item.target || ''))
      .filter(target => target.startsWith('overlay:'))
  );
  for (const [api, target] of Object.entries(overlayApiToTarget)) {
    const callCount = contextCallArguments(runtimeJs, api).length;
    if (callCount > 0 && !declaredOverlayTargets.has(target)) {
      add('scene.overlay_consumption_unlisted', `scene.js 调用了 ctx.${api}() ${callCount} 次，但 interaction_contract 未声明 ${target}；overlay 类组件消费必须登记对应 interaction_contract 与 component_bindings`, sceneJs);
    }
  }

  const visual = decision.generation_evidence?.visualCheck;
  const requiredChecks = ['horizontal_overflow', 'overlap', 'clipping', 'action_legibility', 'primary_focus', 'state_feedback'];
  const viewports = new Set(visual?.viewports || []);
  if (visual?.status !== 'passed' || viewports.size !== 2 || !viewports.has(375) || !viewports.has(393) || !isStrictIsoTimestamp(visual?.checked_at)) add('scene.visual_check', '视觉检查必须仅记录 375px、393px 均通过且带严格 ISO checked_at', decisionsFile);
  for (const check of requiredChecks) if (visual?.checks?.[check] !== true) add('scene.visual_check', `视觉检查未通过：${check}`, decisionsFile);
  if (Object.keys(visual?.checks || {}).some(check => !requiredChecks.includes(check))) add('scene.visual_check', '视觉检查包含未知检查项', decisionsFile);

  const routeId = decision.route_id;
  if (routeId) {
    if (registeredScene?.routeId !== routeId) add('scene.registration_route', `registerScene 未使用合同 route_id：${routeId}`, sceneJs);
    if (!fs.existsSync(routesFile)) add('scene.routes_missing', '缺少 routes.js', routesFile);
    else {
      const routeRecord = routeRecords.find(record => record.routeId === routeId);
      if (!routeRecord) add('scene.route', `routes.js 未注册 route_id：${routeId}`, routesFile);
      const sceneRelative = `scenes/${path.basename(sceneRoot)}`;
      for (const [field, suffix] of [['script', 'scene.js'], ['style', 'scene.css']]) {
        if (!routeRecord || routeRecord[field] !== `${sceneRelative}/${suffix}`) add('scene.route_asset', `routes.js 当前 route 未声明正确 ${suffix}`, routesFile);
      }
      if (routeRecord && presentation.type === 'host-tab' && routeRecord.entry.type !== 'host-tab') add('scene.route_entry', 'host-tab 场景路由必须声明 entry.type=host-tab', routesFile);
      if (routeRecord && presentation.type !== 'host-tab' && routeRecord.entry.type === 'host-tab') add('scene.route_entry', '非 host-tab 场景不得注册为 host-tab 入口', routesFile);
    }
  }
}

const report = { ok: errors.length === 0, errors, warnings, metrics: { scene: path.basename(sceneRoot) } };
if (jsonOutput) console.log(JSON.stringify(report, null, 2));
else {
  if (report.ok) console.log(`场景合同通过：${path.basename(sceneRoot)}`);
  for (const item of errors) console.error(`[error] ${item.code}: ${item.message}`);
  for (const item of warnings) console.warn(`[warning] ${item.code}: ${item.message}`);
}
process.exit(report.ok ? 0 : 1);
