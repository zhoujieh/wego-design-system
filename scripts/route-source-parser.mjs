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

function findMatchingDelimiter(masked, start, open, close) {
  let depth = 0;
  for (let index = start; index < masked.length; index += 1) {
    if (masked[index] === open) depth += 1;
    else if (masked[index] === close && --depth === 0) return index;
  }
  return -1;
}

function staticStringValue(source) {
  const value = String(source || '').trim();
  const quote = value[0];
  if ((quote !== '"' && quote !== "'") || value.at(-1) !== quote || value.slice(1, -1).includes('\\')) return null;
  return value.slice(1, -1);
}

function memberValueEnd(masked, start, objectClose) {
  let roundDepth = 0;
  let squareDepth = 0;
  let braceDepth = 0;
  for (let index = start; index < objectClose; index += 1) {
    const char = masked[index];
    if (char === '(') roundDepth += 1;
    else if (char === ')') roundDepth = Math.max(0, roundDepth - 1);
    else if (char === '[') squareDepth += 1;
    else if (char === ']') squareDepth = Math.max(0, squareDepth - 1);
    else if (char === '{') braceDepth += 1;
    else if (char === '}') braceDepth = Math.max(0, braceDepth - 1);
    else if (char === ',' && roundDepth === 0 && squareDepth === 0 && braceDepth === 0) return index;
  }
  return objectClose;
}

function parseStaticObject(source, label, allowedFields) {
  const input = String(source || '').trim();
  const masked = maskJavaScript(input);
  const open = masked.indexOf('{');
  const close = open >= 0 ? findMatchingDelimiter(masked, open, '{', '}') : -1;
  if (open !== 0 || close < 0 || masked.slice(close + 1).trim()) throw new Error(`${label} 必须是静态对象字面量`);
  const members = new Map();
  let index = open + 1;
  while (index < close) {
    while (index < close && /\s/.test(masked[index])) index += 1;
    if (index >= close) break;
    const keyMatch = /^[A-Za-z_$][\w$]*/.exec(masked.slice(index));
    if (!keyMatch) throw new Error(`${label} 只允许静态标识符字段，不得使用展开、计算属性或动态成员`);
    const key = keyMatch[0];
    if (!allowedFields.has(key)) throw new Error(`${label} 包含未登记字段：${key}`);
    index += key.length;
    while (/\s/.test(masked[index] || '')) index += 1;
    if (masked[index] !== ':') throw new Error(`${label}.${key} 必须显式声明静态值`);
    const valueStart = index + 1;
    const valueEnd = memberValueEnd(masked, valueStart, close);
    const value = input.slice(valueStart, valueEnd).trim();
    if (!value) throw new Error(`${label}.${key} 不能为空`);
    if (members.has(key)) throw new Error(`${label}.${key} 不得重复声明`);
    members.set(key, value);
    index = valueEnd + 1;
  }
  return members;
}

function staticMemberString(members, field, label, required = false) {
  if (!members.has(field)) {
    if (required) throw new Error(`${label}.${field} 必须声明非空静态字符串`);
    return null;
  }
  const value = staticStringValue(members.get(field));
  if (!value) throw new Error(`${label}.${field} 必须声明非空静态字符串`);
  return value;
}

function normalizeRoutePath(value) {
  return typeof value === 'string' ? value.replace(/^(?:\.\/)+/, '') : null;
}

const routeFields = new Set(['routeId', 'scene', 'script', 'style', 'entry']);
const entryFields = new Set(['type', 'tab', 'group', 'label', 'icon', 'parentEntry']);
const entryTypes = new Set(['host-tab', 'grid-entry', 'cell-entry']);

function parseRouteObject(source, index) {
  const label = `routes.js 路由[${index}]`;
  const members = parseStaticObject(source, label, routeFields);
  const routeId = staticMemberString(members, 'routeId', label, true);
  if (!/^[a-z][a-z0-9-]*$/.test(routeId)) throw new Error(`${label}.routeId 必须是稳定 kebab-case`);
  const script = normalizeRoutePath(staticMemberString(members, 'script', label, true));
  const style = normalizeRoutePath(staticMemberString(members, 'style', label, true));
  const scene = staticMemberString(members, 'scene', label, false);
  const scriptScene = /^scenes\/([^/\\]+)\/scene\.js$/.exec(script)?.[1] || null;
  const styleScene = /^scenes\/([^/\\]+)\/scene\.css$/.exec(style)?.[1] || null;
  const safeSceneSegment = value => Boolean(value) && value === value.trim() && value !== '.' && value !== '..' && !value.includes('\0');
  if (!safeSceneSegment(scriptScene) || !safeSceneSegment(styleScene) || scriptScene !== styleScene) throw new Error(`${label}.script/style 必须指向同一单层场景目录下的 scene.js 与 scene.css`);
  if (scene && scene !== scriptScene) throw new Error(`${label}.scene 必须与 script/style 场景目录一致`);
  const entry = {};
  if (members.has('entry')) {
    const entryMembers = parseStaticObject(members.get('entry'), `${label}.entry`, entryFields);
    entry.type = staticMemberString(entryMembers, 'type', `${label}.entry`, true);
    if (!entryTypes.has(entry.type)) throw new Error(`${label}.entry.type 只能是 host-tab、grid-entry 或 cell-entry`);
    if (!entryMembers.has('tab')) {
      if (entry.type === 'host-tab') throw new Error(`host-tab 路由必须声明非空 entry.tab：${routeId}`);
      throw new Error(`${label}.entry.tab 必须声明入口所属宿主 tab`);
    }
    entry.tab = staticMemberString(entryMembers, 'tab', `${label}.entry`, true);
    for (const field of ['group', 'label', 'icon', 'parentEntry']) entry[field] = staticMemberString(entryMembers, field, `${label}.entry`, false);
    entry.icon = normalizeRoutePath(entry.icon);
  } else {
    for (const field of entryFields) entry[field] = null;
  }
  return { routeId, scene, script, style, entry };
}

function arrayItemRanges(masked, start, end) {
  const ranges = [];
  let itemStart = start;
  let roundDepth = 0;
  let squareDepth = 0;
  let braceDepth = 0;
  for (let index = start; index < end; index += 1) {
    const char = masked[index];
    if (char === '(') roundDepth += 1;
    else if (char === ')') roundDepth = Math.max(0, roundDepth - 1);
    else if (char === '[') squareDepth += 1;
    else if (char === ']') squareDepth = Math.max(0, squareDepth - 1);
    else if (char === '{') braceDepth += 1;
    else if (char === '}') braceDepth = Math.max(0, braceDepth - 1);
    else if (char === ',' && roundDepth === 0 && squareDepth === 0 && braceDepth === 0) {
      ranges.push([itemStart, index]);
      itemStart = index + 1;
    }
  }
  ranges.push([itemStart, end]);
  return ranges;
}

export function parseRouteRegistrySource(source) {
  const input = String(source || '');
  const masked = maskJavaScript(input);
  const pattern = /(?<![\w$.])\bwindow\s*\.\s*WEGO_APP_ROUTES\s*=\s*\[/g;
  const assignments = [...masked.matchAll(pattern)];
  if (assignments.length !== 1) throw new Error(`routes.js 必须且只能真实赋值一次 window.WEGO_APP_ROUTES，当前为 ${assignments.length} 次`);
  const arrayOpen = masked.indexOf('[', assignments[0].index);
  const arrayClose = findMatchingDelimiter(masked, arrayOpen, '[', ']');
  if (arrayClose < 0) throw new Error('window.WEGO_APP_ROUTES 缺少数组闭合符号');
  const residual = `${masked.slice(0, assignments[0].index)}${' '.repeat(arrayClose + 1 - assignments[0].index)}${masked.slice(arrayClose + 1)}`;
  if (/(?<![\w$.])\bwindow\s*\.\s*WEGO_APP_ROUTES\b/.test(residual)) throw new Error('routes.js 不得在静态赋值之外再次读取或修改 WEGO_APP_ROUTES');
  const records = [];
  const ranges = arrayItemRanges(masked, arrayOpen + 1, arrayClose);
  const arrayBody = masked.slice(arrayOpen + 1, arrayClose).trim();
  for (const [rangeIndex, [start, end]] of ranges.entries()) {
    const itemMasked = masked.slice(start, end).trim();
    if (!itemMasked) {
      const emptyArray = ranges.length === 1 && !arrayBody;
      const trailingComma = rangeIndex === ranges.length - 1 && arrayBody.endsWith(',');
      if (emptyArray || trailingComma) continue;
      throw new Error('window.WEGO_APP_ROUTES 不得包含空路由项');
    }
    const itemSource = input.slice(start, end).trim();
    if (!itemMasked.startsWith('{')) throw new Error('window.WEGO_APP_ROUTES 只允许直接包含静态路由对象');
    records.push(parseRouteObject(itemSource, records.length));
  }
  const routeIds = records.map(record => record.routeId);
  const duplicateRouteId = routeIds.find((routeId, index) => routeIds.indexOf(routeId) !== index);
  if (duplicateRouteId) throw new Error(`routes.js 的 routeId 必须全局唯一：${duplicateRouteId}`);
  const hostTabs = records.filter(record => record.entry.type === 'host-tab');
  const tabs = hostTabs.map(record => record.entry.tab);
  const duplicateTab = tabs.find((tab, index) => tabs.indexOf(tab) !== index);
  if (duplicateTab) throw new Error(`routes.js 的 host-tab entry.tab 必须全局唯一：${duplicateTab}`);
  return records;
}
