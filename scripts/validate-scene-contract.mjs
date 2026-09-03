#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { parseRegisteredSceneSource, parseSceneTemplate } from './scene-source-parser.mjs';
import { parseRouteRegistrySource } from './route-source-parser.mjs';

const args = process.argv.slice(2);
const sceneArgument = args.find(argument => !argument.startsWith('--'));
const jsonOutput = args.includes('--json');
const routesFlag = args.indexOf('--routes');

if (!sceneArgument) {
  console.error('用法：node scripts/validate-scene-contract.mjs wego-app/scenes/{分类}/{中文业务场景} [--json] [--routes 路径]');
  process.exit(2);
}
if (routesFlag >= 0 && !args[routesFlag + 1]) {
  console.error('--routes 必须指定 routes.js 路径');
  process.exit(2);
}

const root = process.cwd();
const libraryRoot = path.join(root, '.codex/skills/wego-design');
const sceneRoot = path.resolve(root, sceneArgument);
const sceneJs = path.join(sceneRoot, 'scene.js');
const sceneCss = path.join(sceneRoot, 'scene.css');
const routesFile = routesFlag >= 0
  ? path.resolve(root, args[routesFlag + 1])
  : path.join(root, 'wego-app/js/routes.js');
const tokenCssFile = path.join(libraryRoot, 'colors_and_type.css');
const consumptionFile = path.join(libraryRoot, 'library-consumption.json');
const componentIndexFile = path.join(libraryRoot, 'components/index.json');
const uikitPlanFile = path.join(libraryRoot, 'uikit-plan.json');

const errors = [];
const warnings = [];
const add = (code, message, file = null) => errors.push({ code, message, file });
const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function readJson(file, code, label) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    add(code, `${label}无法读取：${error.message}`, file);
    return null;
  }
}

function flatten(node, out = []) {
  for (const child of node?.children || []) {
    out.push(child);
    flatten(child, out);
  }
  return out;
}

function containsNode(parent, target) {
  return (parent?.children || []).some(child => child === target || containsNode(child, target));
}

function classSet(node) {
  return new Set(String(node?.attrs?.class || '').split(/\s+/).filter(Boolean));
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
  const ids = [...value.matchAll(/#([\w-]+)/g)].map(match => match[1]);
  const classes = [...value.matchAll(/\.([\w-]+)/g)].map(match => match[1]);
  const remainder = value
    .replace(/^[A-Za-z][\w-]*/, '')
    .replace(/#[\w-]+/g, '')
    .replace(/\.[\w-]+/g, '');
  if (remainder || ids.length > 1 || (!tag && !ids.length && !classes.length && !attributes.length)) return false;
  return (!tag || node?.tag === tag)
    && (!ids.length || node?.attrs?.id === ids[0])
    && classes.every(className => classSet(node).has(className))
    && attributes.every(attribute => Object.hasOwn(node?.attrs || {}, attribute.name)
      && (attribute.expected === null || node.attrs[attribute.name] === attribute.expected));
}

function selectorParts(selector) {
  return String(selector || '').split('|').map(value => value.trim()).filter(Boolean);
}

function selectorTargetsNode(selector, node) {
  const withoutPseudo = String(selector || '').replace(/:{1,2}[\w-]+(?:\([^)]*\))?/g, '');
  const target = withoutPseudo.trim().split(/[\s>+~]+/).filter(Boolean).at(-1) || '';
  return strictSimpleSelectorMatchesNode(target, node);
}

function selectorExistsInScope(rootNode, selector) {
  const scope = [rootNode, ...flatten(rootNode, [])];
  return selectorParts(selector).some(part => scope.some(node => strictSimpleSelectorMatchesNode(part, node)));
}

function selectorNodesInScope(rootNode, selector) {
  const scope = [rootNode, ...flatten(rootNode, [])];
  return scope.filter(node => selectorParts(selector).some(part => strictSimpleSelectorMatchesNode(part, node)));
}

function normalizeCssSelector(selector) {
  return String(selector || '').trim().replace(/\s+/g, ' ').replace(/\s*([>+~])\s*/g, '$1');
}

function splitTopLevel(source, delimiter) {
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
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth = Math.max(0, depth - 1);
    else if (char === delimiter && depth === 0) {
      parts.push(source.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(source.slice(start));
  return parts;
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
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === open) depth += 1;
    else if (char === close && --depth === 0) return index;
  }
  return -1;
}

function parseCssDeclarations(body) {
  const declarations = [];
  for (const source of splitTopLevel(body, ';')) {
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
      if (char === '"' || char === "'") {
        quote = char;
        continue;
      }
      if (char === '(' || char === '[') depth += 1;
      else if (char === ')' || char === ']') depth = Math.max(0, depth - 1);
      else if (char === ':' && depth === 0) {
        colon = index;
        break;
      }
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
      const open = segment.indexOf('{', cursor);
      if (open < 0) break;
      const close = findMatchingDelimiter(segment, open);
      if (close < 0) break;
      const headerStart = Math.max(segment.lastIndexOf('}', open - 1), segment.lastIndexOf(';', open - 1)) + 1;
      const header = segment.slice(Math.max(cursor, headerStart), open).trim();
      const body = segment.slice(open + 1, close);
      if (header.startsWith('@')) {
        if (body.includes('{')) walk(body, [...atRules, header]);
      } else if (header) {
        const selectors = splitTopLevel(header, ',').map(normalizeCssSelector).filter(Boolean);
        if (selectors.length) {
          if (body.includes('{')) rules.nestedSelectors.push(...selectors);
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
  return [...String(value || '').matchAll(/var\(\s*(--[\w-]+)/g)].map(match => match[1]);
}

const spacingProperties = /^(?:margin(?:-(?:top|right|bottom|left|inline|inline-start|inline-end|block|block-start|block-end))?|padding(?:-(?:top|right|bottom|left|inline|inline-start|inline-end|block|block-start|block-end))?|gap|row-gap|column-gap)$/;
const radiusProperties = /^(?:border-radius|border-(?:top|right|bottom|left)-(?:left|right)-radius|border-(?:start|end)-(?:start|end)-radius)$/;
const borderShorthandProperties = /^(?:border|border-(?:top|right|bottom|left|inline|inline-start|inline-end|block|block-start|block-end))$/;
const shadowProperties = new Set(['box-shadow', 'text-shadow']);
const typographyProperties = new Set(['font', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing']);

function isVisualProperty(property) {
  return property === 'color'
    || property === 'fill'
    || property === 'stroke'
    || property.startsWith('background')
    || property.startsWith('border')
    || typographyProperties.has(property)
    || shadowProperties.has(property)
    || spacingProperties.test(property)
    || radiusProperties.test(property);
}

function hasNonZeroDimensionLiteral(value) {
  const withoutVariables = String(value).replace(/var\([^)]*\)/g, '');
  const units = '(?:px|r?em|%|v(?:w|h|min|max|i|b)|(?:s|l|d)v(?:w|h|min|max|i|b)|cq(?:w|h|i|b|min|max)|r?lh|ch|ex|cap|ic|cm|mm|in|pt|pc)';
  return [...withoutVariables.matchAll(new RegExp(`(?:^|[^\\w-])(-?(?:\\d+\\.?\\d*|\\.\\d+))${units}(?![\\w-])`, 'gi'))]
    .some(match => Number(match[1]) !== 0);
}

function hasNonZeroNumberLiteral(value) {
  const withoutVariables = String(value).replace(/var\([^)]*\)/g, '');
  return [...withoutVariables.matchAll(/(?:^|[^\w-])(-?(?:\d+\.?\d*|\.\d+))(?![\w-])/g)]
    .some(match => Number(match[1]) !== 0);
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
  if (shadowProperties.has(property)) {
    return !/^(?:none|inherit|initial|unset|var\(\s*--[\w-]+\s*\))$/.test(normalized);
  }
  if (borderShorthandProperties.test(property)) {
    const remainder = normalized
      .replace(/var\([^)]*\)/g, '')
      .replace(/-?(?:\d+\.?\d*|\.\d+)(?:px|r?em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)?/gi, '')
      .replace(/\b(?:none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|transparent|currentColor|inherit|initial|unset)\b/gi, '')
      .replace(/[\s,\/]+/g, '');
    return remainder.length > 0;
  }
  const colorProperty = property === 'color'
    || property === 'fill'
    || property === 'stroke'
    || property === 'border-color'
    || /^border-(?:top|right|bottom|left)-color$/.test(property)
    || property.startsWith('background');
  if (!colorProperty) return false;
  const remainder = normalized
    .replace(/var\([^)]*\)/g, '')
    .replace(/\b(?:transparent|currentColor|none|inherit|initial|unset)\b/gi, '')
    .replace(/[\s,\/]+/g, '');
  return remainder.length > 0;
}

function maskJavaScript(source) {
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
      if (char === '*' && next === '/') {
        output[index] = output[index + 1] = ' ';
        index += 1;
        blockComment = false;
      } else if (char !== '\n') output[index] = ' ';
      continue;
    }
    if (quote) {
      if (char === '\\') {
        output[index] = ' ';
        if (index + 1 < input.length && input[index + 1] !== '\n') output[index + 1] = ' ';
        index += 1;
      } else {
        if (char === quote) quote = null;
        if (char !== '\n') output[index] = ' ';
      }
      continue;
    }
    if (char === '/' && next === '/') {
      output[index] = output[index + 1] = ' ';
      index += 1;
      lineComment = true;
      continue;
    }
    if (char === '/' && next === '*') {
      output[index] = output[index + 1] = ' ';
      index += 1;
      blockComment = true;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      output[index] = ' ';
    }
  }
  return output.join('');
}

function stripJavaScriptComments(source) {
  const input = String(source || '');
  let output = '';
  let quote = null;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (lineComment) {
      if (char === '\n') {
        lineComment = false;
        output += '\n';
      } else output += ' ';
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        output += '  ';
        index += 1;
        blockComment = false;
      } else output += char === '\n' ? '\n' : ' ';
      continue;
    }
    if (quote) {
      output += char;
      if (char === '\\') {
        if (index + 1 < input.length) output += input[++index];
      } else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') {
      output += '  ';
      index += 1;
      lineComment = true;
      continue;
    }
    if (char === '/' && next === '*') {
      output += '  ';
      index += 1;
      blockComment = true;
      continue;
    }
    output += char;
    if (char === '"' || char === "'" || char === '`') quote = char;
  }
  return output;
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
    else if (char === ',' && depth === 0) {
      ranges.push([start, index]);
      start = index + 1;
    }
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
  const relativeStart = masked.slice(arrow + 2).search(/\S/);
  if (relativeStart < 0) return '';
  const bodyStart = arrow + 2 + relativeStart;
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

function findReferencedDomId(source, knownIds) {
  const normalized = String(source || '').replace(/\\(["'])/g, '$1');
  for (const id of knownIds) {
    if (new RegExp(`data-dom-id\\s*=\\s*["']${escapeRegex(id)}["']`).test(normalized)) return id;
  }
  return null;
}

function interactionHandlersByDomId(source, initBody, domIds) {
  const maskedInit = maskJavaScript(initBody);
  const callables = collectLocalCallables(source);
  const variableIds = new Map();
  for (const [name, expression] of collectVariableInitializers(initBody)) {
    const id = findReferencedDomId(expression, domIds);
    if (id && /\bquerySelector\s*\(/.test(maskJavaScript(expression))) variableIds.set(name, id);
  }
  const handlers = new Map(domIds.map(id => [id, []]));
  for (const match of maskedInit.matchAll(/(?:\?\.|\.)\s*addEventListener\s*\(/g)) {
    const methodIndex = match.index;
    const receiver = initBody.slice(findReceiverStart(maskedInit, methodIndex), methodIndex).trim();
    const variable = maskJavaScript(receiver).match(/([A-Za-z_$][\w$]*)\s*$/)?.[1];
    const id = variableIds.get(variable) || findReferencedDomId(receiver, domIds);
    if (!id) continue;
    const openParen = maskedInit.indexOf('(', methodIndex);
    const handlerExpression = splitCallArguments(initBody, openParen)[1] || '';
    const handler = expandHandlerSource(handlerExpression, callables);
    if (handler) handlers.get(id)?.push(handler);
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

function stringLiteralEnd(source, start) {
  const quote = source[start];
  if (quote !== '"' && quote !== "'") return -1;
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === '\\') index += 1;
    else if (source[index] === quote) return index;
  }
  return -1;
}

function topLevelObjectPropertySource(source, property) {
  const masked = maskJavaScript(source);
  const open = masked.indexOf('{');
  const close = open >= 0 ? findMatchingDelimiter(masked, open) : -1;
  if (open < 0 || close < 0) return null;
  let braceDepth = 0;
  let roundDepth = 0;
  let squareDepth = 0;
  for (let index = open; index < close; index += 1) {
    const char = masked[index];
    if (char === '{') {
      braceDepth += 1;
      continue;
    }
    if (char === '}') {
      braceDepth -= 1;
      continue;
    }
    if (char === '(') {
      roundDepth += 1;
      continue;
    }
    if (char === ')') {
      roundDepth = Math.max(0, roundDepth - 1);
      continue;
    }
    if (char === '[') {
      squareDepth += 1;
      continue;
    }
    if (char === ']') {
      squareDepth = Math.max(0, squareDepth - 1);
      continue;
    }
    if (braceDepth !== 1 || roundDepth || squareDepth) continue;
    let key = null;
    let keyEnd = index;
    if (/[A-Za-z_$]/.test(char)) {
      const match = /^[A-Za-z_$][\w$]*/.exec(masked.slice(index));
      key = match?.[0] || null;
      keyEnd = index + (match?.[0].length || 0);
    } else if (source[index] === '"' || source[index] === "'") {
      const end = stringLiteralEnd(source, index);
      if (end >= 0) {
        key = staticStringValue(source.slice(index, end + 1));
        keyEnd = end + 1;
      }
    }
    if (key === null) continue;
    let colon = keyEnd;
    while (/\s/.test(source[colon] || '')) colon += 1;
    if (masked[colon] !== ':') continue;
    if (key !== property) {
      index = Math.max(index, keyEnd - 1);
      continue;
    }
    let valueStart = colon + 1;
    while (/\s/.test(source[valueStart] || '')) valueStart += 1;
    let nestedBrace = 0;
    let nestedRound = 0;
    let nestedSquare = 0;
    for (let valueEnd = valueStart; valueEnd <= close; valueEnd += 1) {
      const valueChar = masked[valueEnd];
      if (valueChar === '{') nestedBrace += 1;
      else if (valueChar === '}') {
        if (nestedBrace === 0 && nestedRound === 0 && nestedSquare === 0) {
          return source.slice(valueStart, valueEnd).trim();
        }
        nestedBrace = Math.max(0, nestedBrace - 1);
      } else if (valueChar === '(') nestedRound += 1;
      else if (valueChar === ')') nestedRound = Math.max(0, nestedRound - 1);
      else if (valueChar === '[') nestedSquare += 1;
      else if (valueChar === ']') nestedSquare = Math.max(0, nestedSquare - 1);
      else if (valueChar === ',' && nestedBrace === 0 && nestedRound === 0 && nestedSquare === 0) {
        return source.slice(valueStart, valueEnd).trim();
      }
    }
  }
  return null;
}

function constraintsMatch(constraints, node) {
  if (!constraints || typeof constraints !== 'object') return false;
  const descendants = flatten(node, []);
  const rootMatches = selector => strictSimpleSelectorMatchesNode(selector, node);
  const descendantMatches = selector => descendants.some(descendant => strictSimpleSelectorMatchesNode(selector, descendant));
  const list = field => Array.isArray(constraints[field]) ? constraints[field] : [];
  return list('rootAllOf').every(rootMatches)
    && (!list('rootOneOf').length || list('rootOneOf').some(rootMatches))
    && !list('rootNoneOf').some(rootMatches)
    && list('descendantAllOf').every(descendantMatches)
    && (!list('descendantOneOf').length || list('descendantOneOf').some(descendantMatches))
    && !list('descendantNoneOf').some(descendantMatches);
}

function validateComponentNode(node, slug, contract) {
  const label = `${slug}${node.attrs['data-dom-id'] ? `(${node.attrs['data-dom-id']})` : ''}`;
  const roots = selectorParts(contract?.domAnatomy?.root);
  if (!roots.some(selector => strictSimpleSelectorMatchesNode(selector, node))) {
    add('scene.component_root', `组件 ${label} 根节点必须匹配契约：${roots.join(' | ')}`, sceneJs);
    return;
  }

  for (const selector of contract.domAnatomy?.requiredChildren || []) {
    if (!selectorExistsInScope(node, selector)) {
      add('scene.component_anatomy', `组件 ${label} 缺少结构：${selector}`, sceneJs);
    }
  }

  const bodyChildren = contract.domAnatomy?.bodyChildren || [];
  if (bodyChildren.length) {
    const bodySelector = contract.anatomy?.find(item => item.name === 'body')?.selector;
    const bodies = bodySelector ? selectorNodesInScope(node, bodySelector) : [node];
    if (!bodies.length) add('scene.component_anatomy', `组件 ${label} 缺少 body：${bodySelector}`, sceneJs);
    for (const body of bodies) {
      for (const selector of bodyChildren) {
        if (!selectorExistsInScope(body, selector)) {
          add('scene.component_anatomy', `组件 ${label} 的 body 缺少结构：${selector}`, sceneJs);
        }
      }
    }
  }

  const itemChildren = contract.domAnatomy?.itemChildren || [];
  if (itemChildren.length) {
    const repeatingSelector = contract.domAnatomy?.repeatingChild;
    const items = repeatingSelector ? selectorNodesInScope(node, repeatingSelector) : [];
    if (!items.length) add('scene.component_anatomy', `组件 ${label} 缺少 repeatingChild：${repeatingSelector}`, sceneJs);
    for (const item of items) {
      for (const selector of itemChildren) {
        if (!selectorExistsInScope(item, selector)) {
          add('scene.component_anatomy', `组件 ${label} 的重复项缺少结构：${selector}`, sceneJs);
        }
      }
    }
  }

  const inferredVariants = new Map();
  for (const [dimension, rule] of Object.entries(contract.domAnatomy?.variantRules || {})) {
    const matches = Object.entries(rule?.values || {})
      .filter(([, constraints]) => constraintsMatch(constraints, node))
      .map(([value]) => value);
    if (rule?.required === true && !matches.length) {
      add('scene.component_variant', `组件 ${label} 未命中必需变体维度：${dimension}`, sceneJs);
    }
    if (rule?.exclusive === true && matches.length !== 1) {
      add('scene.component_variant', `组件 ${label} 的互斥维度 ${dimension} 命中 ${matches.length} 个值`, sceneJs);
    }
    if (matches.length === 1) inferredVariants.set(dimension, matches[0]);
  }

  for (const alternative of contract.domAnatomy?.alternatives || []) {
    for (const selector of alternative.allOf || []) {
      if (!selectorExistsInScope(node, selector)) {
        add('scene.component_anatomy', `组件 ${label} 缺少 alternatives.allOf：${selector}`, sceneJs);
      }
    }
    const branches = Array.isArray(alternative.oneOf) ? alternative.oneOf : [];
    if (!branches.length) continue;
    const eligible = branches.filter(branch => {
      if (Array.isArray(branch)) return true;
      const conditions = branch?.when || {};
      return Object.entries(conditions).every(([dimension, value]) => {
        return !inferredVariants.has(dimension) || inferredVariants.get(dimension) === value;
      });
    });
    const complete = branch => {
      const selectors = Array.isArray(branch) ? branch : branch?.allOf || [];
      return selectors.every(selector => roots.includes(selector)
        ? strictSimpleSelectorMatchesNode(selector, node)
        : selectorExistsInScope(node, selector));
    };
    if (!eligible.some(complete)) {
      add('scene.component_anatomy', `组件 ${label} 未命中任何合法 alternatives.oneOf 结构`, sceneJs);
    }
  }
}

let js = '';
let css = '';
if (!fs.existsSync(sceneJs) || !fs.existsSync(sceneCss)) {
  add('scene.files', '场景必须包含 scene.js 与 scene.css', sceneRoot);
}
if (fs.existsSync(sceneJs)) js = fs.readFileSync(sceneJs, 'utf8');
if (fs.existsSync(sceneCss)) css = fs.readFileSync(sceneCss, 'utf8');

// 解析 scene.js 开头的 wego-design-contract 注释，识别实现模式。
// implementation: "global" 表示模板与交互逻辑均由外部全局模块（wego-app/js/*.js）提供，
// scene.js 仅做路由注册与 init 转发；此时跳过依赖完整 init 字面逻辑的检查（页面根定位、交互绑定）。
function parseContractAnnotation(source) {
  const match = source.match(/\/\*\s*wego-design-contract\s*:\s*([\s\S]*?)\*\//);
  if (!match) return {};
  try { return JSON.parse(match[1]); } catch { return {}; }
}
const contractAnnotation = parseContractAnnotation(js);
const globalImplementation = contractAnnotation.implementation === 'global';

const cleanCss = stripCssComments(css);
const cssRules = parseCssRules(css);
const consumption = readJson(consumptionFile, 'scene.consumption_source', '消费契约');
const componentIndex = readJson(componentIndexFile, 'scene.component_index', '组件索引');
const uikitPlan = readJson(uikitPlanFile, 'scene.uikit_source', 'UI Kit 范式');
const tokenSource = fs.existsSync(tokenCssFile) ? fs.readFileSync(tokenCssFile, 'utf8') : '';
if (!tokenSource) add('scene.token_source', '无法读取正式 Token 源', tokenCssFile);
const declaredTokens = new Set([...tokenSource.matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1]));

let registeredScene = null;
let templateTree = null;
try {
  registeredScene = parseRegisteredSceneSource(js);
  templateTree = parseSceneTemplate(registeredScene.template);
} catch (error) {
  add('scene.registration', error.message, sceneJs);
}

const surfaceRoot = templateTree?.root || null;
const domNodes = templateTree?.nodes || [];
const activeTemplate = registeredScene?.template || '';
const routeId = registeredScene?.routeId || null;

let routeRecords = [];
if (!fs.existsSync(routesFile)) {
  add('scene.routes_missing', '缺少 routes.js', routesFile);
} else {
  try {
    routeRecords = parseRouteRegistrySource(fs.readFileSync(routesFile, 'utf8'));
  } catch (error) {
    add('scene.routes_registration', error.message, routesFile);
  }
}

if (registeredScene && surfaceRoot) {
  const surfaceId = surfaceRoot.attrs['data-surface-id'];
  const rootRouteId = surfaceRoot.attrs['data-route-id'];
  const layoutMode = surfaceRoot.attrs['data-layout-mode'];
  if (!surfaceId) add('scene.layout_root', 'template 根必须声明非空 data-surface-id', sceneJs);
  if (rootRouteId !== routeId) add('scene.layout_root', 'template 根 data-route-id 必须与 registerScene.routeId 一致', sceneJs);
  if (!['pattern', 'composed'].includes(layoutMode)) {
    add('scene.layout_mode', 'template 根 data-layout-mode 只能是 pattern 或 composed', sceneJs);
  }
  if (layoutMode === 'pattern') {
    const patternId = surfaceRoot.attrs['data-page-pattern'];
    if (!patternId || !(uikitPlan?.pagePatterns || []).some(pattern => pattern.id === patternId)) {
      add('scene.page_pattern', 'pattern 页面必须声明现存 data-page-pattern', sceneJs);
    }
  } else if (Object.hasOwn(surfaceRoot.attrs, 'data-page-pattern')) {
    add('scene.page_pattern', 'composed 页面不得声明 data-page-pattern', sceneJs);
  }
  if (Object.hasOwn(surfaceRoot.attrs, 'data-page-edge-mode')) {
    add('scene.layout_root', '页面根不得声明旧 data-page-edge-mode', sceneJs);
  }

  const presentationSource = topLevelObjectPropertySource(registeredScene.objectSource, 'presentation');
  const presentationType = staticStringValue(topLevelObjectPropertySource(presentationSource, 'type'));
  const allowedPresentationTypes = consumption?.appRuntime?.presentationTypes || [];
  if (!presentationType || !allowedPresentationTypes.includes(presentationType)) {
    add('scene.presentation_type', 'registerScene.presentation.type 必须是正式运行时类型', sceneJs);
  }

  const routeRecord = routeRecords.find(record => record.routeId === routeId);
  if (!routeRecord) {
    add('scene.route', `routes.js 未注册 routeId：${routeId}`, routesFile);
  } else {
    const appRoot = path.join(root, 'wego-app');
    const relToApp = path.relative(appRoot, sceneRoot).split(path.sep).join('/');
    let expectedBase;
    if (relToApp.startsWith('scenes/') && !relToApp.includes('..')) {
      expectedBase = relToApp;
    } else {
      // 测试夹具等仓库外场景：若父目录是合法分类代号则使用两层路径，否则回退 basename
      const parent = path.basename(path.dirname(sceneRoot));
      expectedBase = ['shop', 'bcg', 'customer', 'infras'].includes(parent)
        ? `scenes/${parent}/${path.basename(sceneRoot)}`
        : `scenes/${path.basename(sceneRoot)}`;
    }
    if (routeRecord.script !== `${expectedBase}/scene.js` || routeRecord.style !== `${expectedBase}/scene.css`) {
      add('scene.route_asset', `route ${routeId} 必须指向当前场景 scene.js 与 scene.css`, routesFile);
    }
    if (presentationType === 'host-tab' && routeRecord.entry.type !== 'host-tab') {
      add('scene.route_entry', 'host-tab presentation 必须对应 host-tab 路由入口', routesFile);
    }
    if (presentationType !== 'host-tab' && routeRecord.entry.type === 'host-tab') {
      add('scene.route_entry', '非 host-tab presentation 不得占用 host-tab 入口', routesFile);
    }
  }
}

const indexedComponents = new Map((componentIndex?.components || []).map(component => [component.slug, component]));
const contracts = new Map();
const registeredRoots = [];
for (const [slug, indexed] of indexedComponents) {
  const contractFile = path.join(libraryRoot, 'components', `${slug}.json`);
  const previewFile = path.join(libraryRoot, indexed.preview || '');
  if (!fs.existsSync(contractFile) || !fs.existsSync(previewFile)) continue;
  try {
    const contract = JSON.parse(fs.readFileSync(contractFile, 'utf8'));
    contracts.set(slug, contract);
    registeredRoots.push({ slug, selectors: selectorParts(contract.domAnatomy?.root) });
  } catch {
    // 组件一致性守卫负责报告损坏的正式契约；场景守卫只消费可读来源。
  }
}

const sourceSlugs = new Set([...js.matchAll(/data-component-slug\s*=\s*["']([\w-]+)["']/g)].map(match => match[1]));
for (const slug of sourceSlugs) {
  const indexed = indexedComponents.get(slug);
  const contractFile = path.join(libraryRoot, 'components', `${slug}.json`);
  if (!indexed || indexed.preview !== `preview/component-${slug}.html`
    || !fs.existsSync(path.join(libraryRoot, indexed?.preview || ''))
    || !fs.existsSync(contractFile)) {
    add('scene.component_unknown', `data-component-slug 必须指向正式组件：${slug}`, sceneJs);
  }
}

for (const node of domNodes) {
  const declaredSlug = node.attrs['data-component-slug'];
  const matchingRoots = registeredRoots
    .filter(item => item.selectors.some(selector => strictSimpleSelectorMatchesNode(selector, node)))
    .map(item => item.slug);
  if (matchingRoots.length && !declaredSlug) {
    add('scene.component_unannotated', `正式组件根缺少 data-component-slug：${matchingRoots.join('、')}`, sceneJs);
  }
  if (!declaredSlug) continue;
  const contract = contracts.get(declaredSlug);
  if (contract) validateComponentNode(node, declaredSlug, contract);
}

const rawColors = [...new Set([...`${js}\n${cleanCss}`.matchAll(/(?<!&)#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(/g)].map(match => match[0]))];
if (rawColors.length) add('scene.raw_color', `禁止硬编码颜色：${rawColors.join(', ')}`, sceneRoot);
if (cssRules.nestedSelectors.length) {
  add('scene.css_nesting', `scene.css 禁止原生 CSS nesting：${[...new Set(cssRules.nestedSelectors)].join(', ')}`, sceneCss);
}
if (/var\(\s*--[\w-]+\s*,/i.test(cleanCss)) {
  add('scene.token_fallback', 'scene.css 的 var() 禁止 fallback，必须使用现存正式 Token', sceneCss);
}

const runtimeSetProperties = new Set();
for (const match of maskJavaScript(js).matchAll(/(?:\?\.|\.)\s*setProperty\s*\(/g)) {
  const openParen = maskJavaScript(js).indexOf('(', match.index);
  const property = staticStringValue(splitCallArguments(js, openParen)[0]);
  if (property) runtimeSetProperties.add(property);
}
for (const token of declaredTokens) {
  if (runtimeSetProperties.has(token)) {
    add('scene.token_redefinition', `场景运行时不得重定义正式 Token：${token}`, sceneJs);
  }
}

for (const rule of cssRules) {
  for (const declaration of rule.declarations) {
    if (declaredTokens.has(declaration.property)) {
      add('scene.token_redefinition', `场景不得重定义正式 Token：${declaration.property}`, sceneCss);
    }
    if (hasRawDesignValue(declaration.property, declaration.value)) {
      add('scene.raw_design_value', `场景样式必须使用正式 Token：${rule.selectors.join(', ')} ${declaration.property}: ${declaration.value}`, sceneCss);
    }
    if (['width', 'min-width', 'max-width'].includes(declaration.property) && /\b100vw\b/.test(declaration.value)) {
      add('scene.horizontal_risk', `场景内容不得用 100vw 制造横向溢出风险：${rule.selectors.join(', ')}`, sceneCss);
    }
  }
}

const usedTokenNames = new Set([...`${js}\n${cleanCss}`.matchAll(/var\(\s*(--[\w-]+)/g)].map(match => match[1]));
const allowedPageEdgeTokens = new Set(Object.values(consumption?.pageEdgeTokens || {}));
for (const token of usedTokenNames) {
  if (!declaredTokens.has(token)) add('scene.token_unknown', `场景使用未声明 Token：${token}`, sceneRoot);
  if (token.startsWith('--layout-page-margin-') && !allowedPageEdgeTokens.has(token)) {
    add('scene.page_edge_token', `场景使用未映射页面边距 Token：${token}`, sceneRoot);
  }
}

for (const node of domNodes) {
  for (const declaration of parseCssDeclarations(node.attrs.style || '')) {
    if (isVisualProperty(declaration.property) && !declaration.property.startsWith('--')) {
      add('scene.inline_visual_style', '视觉声明必须位于 scene.css，不得写 inline style', sceneJs);
    }
  }
}

if (surfaceRoot) {
  const layoutPageNodes = domNodes.filter(node => node.attrs['data-component-slug'] === 'layout-page');
  const layoutScrollNodes = domNodes.filter(node => node.attrs['data-component-slug'] === 'layout-scroll');
  const hasLayoutPage = layoutPageNodes.length > 0;

  if (hasLayoutPage && layoutPageNodes.length > 1) {
    add('scene.layout_page_unique', '页面只能存在一个 layout-page', sceneJs);
  }

  const overlaySlugsForScroll = new Set(['actionsheet', 'dialog', 'modal', 'popover', 'popmenu']);
  const scrollNodesInOverlay = layoutScrollNodes.filter(node => {
    let parent = node.parent;
    while (parent) {
      if (parent.attrs['data-component-slug'] && overlaySlugsForScroll.has(parent.attrs['data-component-slug'])) return true;
      parent = parent.parent;
    }
    return false;
  });
  const primaryLayoutScrollNodes = layoutScrollNodes.filter(node => !scrollNodesInOverlay.includes(node));
  if (hasLayoutPage && primaryLayoutScrollNodes.length !== 1) {
    add('scene.layout_scroll_unique', `使用 layout-page 的页面必须存在且只存在一个主 layout-scroll（modal/overlay 内部豁免），当前为 ${primaryLayoutScrollNodes.length}`, sceneJs);
  }

  const directRootRules = cssRules.filter(rule => rule.atRules.length === 0
    && rule.selectors.some(selector => strictSimpleSelectorMatchesNode(selector, surfaceRoot)));
  const rootDeclarations = directRootRules.flatMap(rule => rule.declarations);
  if (!hasLayoutPage && !globalImplementation) {
    if (!rootDeclarations.some(declaration => declaration.property === 'position' && declaration.value === 'absolute')) {
      add('scene.layout_root_position', '页面根必须直接声明 position: absolute 或使用 layout-page', sceneCss);
    }
    const insetZero = rootDeclarations.some(declaration => declaration.property === 'inset' && declaration.value === '0');
    const fourEdges = ['top', 'right', 'bottom', 'left'].every(property => {
      return rootDeclarations.some(declaration => declaration.property === property && declaration.value === '0');
    });
    if (!insetZero && !fourEdges) add('scene.layout_root_inset', '页面根必须直接声明 inset: 0 或使用 layout-page', sceneCss);
  }
  const horizontalPadding = new Set(['padding', 'padding-inline', 'padding-left', 'padding-right', 'padding-inline-start', 'padding-inline-end']);
  if (rootDeclarations.some(declaration => horizontalPadding.has(declaration.property))) {
    add('scene.layout_root_padding', '页面根必须通栏，不得承担内容横向边距', sceneCss);
  }
  if (rootDeclarations.some(declaration => declaration.property === 'padding-top')) {
    add('scene.safe_area_owner', '页面根不得承担顶部安全区', sceneCss);
  }

  const declarationsForNode = node => cssRules
    .filter(rule => rule.selectors.some(selector => selectorTargetsNode(selector, node)))
    .flatMap(rule => rule.declarations);
  const verticalScrollNodes = domNodes.filter(node => {
    const declarations = declarationsForNode(node);
    return declarations.some(declaration => declaration.property === 'overflow-y' && /\b(?:auto|scroll)\b/.test(declaration.value))
      || declarations.some(declaration => declaration.property === 'overflow' && /\b(?:auto|scroll)\b/.test(declaration.value));
  });
  const primaryScrollNodes = verticalScrollNodes.filter(node => {
    return !verticalScrollNodes.some(other => other !== node && containsNode(other, node));
  });
  if (primaryScrollNodes.length !== 1) {
    add('scene.primary_scroll', `页面必须能从 CSS 推导出唯一主纵向滚动区，当前为 ${primaryScrollNodes.length}`, sceneCss);
  } else {
    const primary = primaryScrollNodes[0];
    const declarations = declarationsForNode(primary);
    if (declarations.some(declaration => horizontalPadding.has(declaration.property))) {
      add('scene.primary_scroll_padding', '主滚动区必须通栏，不得承担内容横向边距', sceneCss);
    }
    const bottomToken = consumption?.layoutContract?.scrollBottomRule?.baseToken?.match(/--[\w-]+/)?.[0];
    const bottomDeclarations = declarations.filter(declaration => {
      return ['padding-bottom', 'padding-block', 'padding-block-end'].includes(declaration.property);
    });
    if (!bottomToken || !bottomDeclarations.some(declaration => cssVariables(declaration.value).includes(bottomToken))) {
      add('scene.scroll_bottom_clearance', `主滚动区必须使用 ${bottomToken || '正式底部避让 Token'}`, sceneCss);
    }
    const horizontalOverflow = declarations.filter(declaration => ['overflow-x', 'overflow'].includes(declaration.property));
    const containsHorizontal = horizontalOverflow.some(declaration => {
      if (declaration.property === 'overflow-x') return /\b(?:hidden|clip)\b/.test(declaration.value);
      return /^(?:hidden|clip)(?:\s|$)/.test(declaration.value);
    });
    if (!containsHorizontal) {
      add('scene.horizontal_risk', '主滚动区必须明确阻止页面级横向溢出', sceneCss);
    }
  }

  const maskedJs = maskJavaScript(js);
  const bindCalls = contextCallArguments(js, 'bindScrollLayout').flat().join('\n');
  const hasBindScrollLayout = /\bbindScrollLayout\s*\(/.test(maskedJs);
  const hasExplicitRegions = /\bregions\s*:/.test(bindCalls);
  for (const node of domNodes.filter(item => item.attrs['data-component-slug'] === 'sticky-region')) {
    const sceneClass = [...classSet(node)].find(className => className !== 'sticky-region');
    const selector = sceneClass ? `.${sceneClass}` : '.sticky-region';
    if (!hasBindScrollLayout) {
      add('scene.sticky_binding', `sticky-region 必须进入 bindScrollLayout：${selector}`, sceneJs);
    } else if (hasExplicitRegions && !new RegExp(`selector\\s*:\\s*["']${escapeRegex(selector)}["']`).test(bindCalls)) {
      add('scene.sticky_binding', `sticky-region 已显式声明 regions 但未包含：${selector}`, sceneJs);
    }
  }

  for (const node of domNodes) {
    const declarations = declarationsForNode(node);
    if (!declarations.some(declaration => declaration.property === 'position' && declaration.value === 'sticky')) continue;
    if (!declarations.some(declaration => ['top', 'bottom', 'inset-block-start', 'inset-block-end'].includes(declaration.property))) {
      add('scene.sticky_edge', 'position: sticky 必须声明吸附边缘', sceneCss);
    }
    const backgrounds = declarations.filter(declaration => declaration.property === 'background' || declaration.property === 'background-color');
    if (!backgrounds.length || backgrounds.every(declaration => /^(?:transparent|none)$/.test(declaration.value))) {
      add('scene.sticky_background', 'sticky 区域必须声明不透明背景', sceneCss);
    }
    if (declarations.some(declaration => declaration.property === 'opacity')) {
      add('scene.sticky_opacity', 'sticky 显隐不得依赖 opacity', sceneCss);
    }
  }

  for (const rule of cssRules) {
    const positioned = rule.declarations.some(declaration => declaration.property === 'position' && ['fixed', 'absolute'].includes(declaration.value));
    const bottomAnchored = rule.declarations.some(declaration => ['bottom', 'inset-block-end'].includes(declaration.property));
    if (!positioned || !bottomAnchored) continue;
    for (const selector of rule.selectors) {
      const target = domNodes.find(node => selectorTargetsNode(selector, node));
      if (!target || target === surfaceRoot) continue;
      const normalized = normalizeCssSelector(selector);
      if (!/\bbindScrollLayout\s*\(/.test(maskedJs)
        || !/\bfixedRegions\s*:/.test(bindCalls)
        || !new RegExp(`selector\\s*:\\s*["']${escapeRegex(normalized)}["']`).test(bindCalls)) {
        add('scene.fixed_obstruction', `底部固定区域必须进入 bindScrollLayout.fixedRegions：${normalized}`, sceneJs);
      }
    }
  }
}

const staticDomIds = domNodes.map(node => node.attrs['data-dom-id']).filter(Boolean);
for (const id of new Set(staticDomIds)) {
  if (staticDomIds.filter(value => value === id).length > 1) {
    add('scene.interaction_duplicate', `data-dom-id 必须唯一：${id}`, sceneJs);
  }
}
if (registeredScene && staticDomIds.length) {
  const handlers = interactionHandlersByDomId(js, registeredScene.initBody, [...new Set(staticDomIds)]);
  /* 豁免：发布 FAB 为公共组件（publish-fab.js 的 createPublishFab），其 open-publish-sheet
     节点的 click listener 在外部模块运行时绑定，场景 init 不持字面绑定；场景调用
     createPublishFab 即视为合规消费，跳过该 dom-id 的 listener 校验。 */
  const usesPublishFab = /\bcreatePublishFab\s*\(/.test(js);
  const fabDomId = 'open-publish-sheet';
  for (const id of new Set(staticDomIds)) {
    if (id === fabDomId && usesPublishFab) continue;
    if (globalImplementation) continue;
    if (!(handlers.get(id) || []).length) {
      add('scene.interaction_handler', `data-dom-id 未绑定实际 listener：${id}`, sceneJs);
    }
  }
}

const overlayOpenMethods = ['openSheet', 'openModal', 'openFullScreenModal'];
const overlayCalls = overlayOpenMethods.flatMap(method => contextCallArguments(js, method).map(call => ({ method, call })));
if (overlayCalls.length) {
  const overlaySlugs = new Set(['actionsheet', 'dialog', 'modal']);
  if (![...sourceSlugs].some(slug => overlaySlugs.has(slug))) {
    add('scene.overlay_component', 'overlay API 必须提供正式 overlay 组件根', sceneJs);
  }
  if (!contextCallArguments(js, 'closeOverlay').length) {
    add('scene.overlay_close', 'overlay 必须实现可执行的 closeOverlay 关闭逻辑', sceneJs);
  }
}

const uncommentedJs = stripJavaScriptComments(js);
if (/\bfetch\s*\(\s*(?:["'`])[^"'`]*\.html(?:[?#][^"'`]*)?(?:["'`])/i.test(uncommentedJs)
  || /\.open\s*\(\s*["'](?:GET|POST)["']\s*,\s*["'][^"']*\.html(?:[?#][^"']*)?["']/i.test(uncommentedJs)) {
  add('scene.local_html_fetch', '业务场景不得通过 fetch/XHR 读取本地 HTML', sceneJs);
}

const report = {
  ok: errors.length === 0,
  errors,
  warnings,
  metrics: {
    scene: path.basename(sceneRoot),
    routeId,
    components: sourceSlugs.size,
    interactions: new Set(staticDomIds).size,
    tokens: usedTokenNames.size,
  },
};

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
} else {
  if (report.ok) console.log(`场景静态守卫通过：${path.basename(sceneRoot)}`);
  for (const item of errors) console.error(`[error] ${item.code}: ${item.message}`);
}
process.exit(report.ok ? 0 : 1);
