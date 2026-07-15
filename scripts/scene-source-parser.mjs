const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

function findMatchingDelimiter(masked, start, open = '{', close = '}') {
  let depth = 0;
  for (let index = start; index < masked.length; index += 1) {
    if (masked[index] === open) depth += 1;
    else if (masked[index] === close && --depth === 0) return index;
  }
  return -1;
}

function splitCallArguments(source, masked, openParen) {
  const closeParen = findMatchingDelimiter(masked, openParen, '(', ')');
  if (closeParen < 0) throw new Error('registerScene 调用缺少右括号');
  const ranges = [];
  let start = openParen + 1;
  let roundDepth = 0;
  let squareDepth = 0;
  let braceDepth = 0;
  for (let index = start; index < closeParen; index += 1) {
    const char = masked[index];
    if (char === '(') roundDepth += 1;
    else if (char === ')') roundDepth = Math.max(0, roundDepth - 1);
    else if (char === '[') squareDepth += 1;
    else if (char === ']') squareDepth = Math.max(0, squareDepth - 1);
    else if (char === '{') braceDepth += 1;
    else if (char === '}') braceDepth = Math.max(0, braceDepth - 1);
    else if (char === ',' && roundDepth === 0 && squareDepth === 0 && braceDepth === 0) {
      ranges.push([start, index]);
      start = index + 1;
    }
  }
  ranges.push([start, closeParen]);
  return {
    closeParen,
    arguments: ranges.map(([from, to]) => source.slice(from, to).trim()).filter(Boolean)
  };
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

function parseObjectMembers(objectSource) {
  const masked = maskJavaScript(objectSource);
  const open = masked.indexOf('{');
  const close = open >= 0 ? findMatchingDelimiter(masked, open) : -1;
  if (open < 0 || close < 0 || masked.slice(close + 1).trim()) throw new Error('registerScene 参数必须是单一对象字面量');
  const members = [];
  let index = open + 1;
  while (index < close) {
    while (index < close && /[\s,]/.test(masked[index])) index += 1;
    if (index >= close) break;
    let key = null;
    let keyEnd = index;
    if (/[A-Za-z_$]/.test(masked[index])) {
      const match = /^[A-Za-z_$][\w$]*/.exec(masked.slice(index));
      key = match?.[0] || null;
      keyEnd = index + (match?.[0].length || 0);
    } else if (sourceQuote(objectSource[index])) {
      const end = stringLiteralEnd(objectSource, index);
      if (end >= 0) {
        key = staticStringValue(objectSource.slice(index, end + 1));
        keyEnd = end + 1;
      }
    }
    if (!key) throw new Error('registerScene 对象包含无法静态解析的成员');
    let cursor = keyEnd;
    while (/\s/.test(masked[cursor] || '')) cursor += 1;
    if (masked[cursor] === ':') {
      const valueStart = cursor + 1;
      const valueEnd = memberValueEnd(masked, valueStart, close);
      members.push({ key, kind: 'property', source: objectSource.slice(valueStart, valueEnd).trim() });
      index = valueEnd + 1;
      continue;
    }
    if (masked[cursor] === '(') {
      const paramsClose = findMatchingDelimiter(masked, cursor, '(', ')');
      let bodyOpen = paramsClose + 1;
      while (/\s/.test(masked[bodyOpen] || '')) bodyOpen += 1;
      if (paramsClose < 0 || masked[bodyOpen] !== '{') throw new Error(`registerScene.${key} 方法无法静态解析`);
      const bodyClose = findMatchingDelimiter(masked, bodyOpen);
      if (bodyClose < 0) throw new Error(`registerScene.${key} 方法缺少右花括号`);
      members.push({ key, kind: 'method', body: objectSource.slice(bodyOpen + 1, bodyClose) });
      index = bodyClose + 1;
      continue;
    }
    members.push({ key, kind: 'shorthand', source: key });
    index = memberValueEnd(masked, cursor, close) + 1;
  }
  return members;
}

function sourceQuote(value) { return value === '"' || value === "'"; }

function decodeTemplateLiteral(expression) {
  const source = String(expression || '').trim();
  if (!source.startsWith('`')) return null;
  let output = '';
  for (let index = 1; index < source.length; index += 1) {
    const char = source[index];
    if (char === '`') {
      if (source.slice(index + 1).trim()) return null;
      return output;
    }
    if (char === '$' && source[index + 1] === '{') throw new Error('registerScene.template 不得包含动态插值');
    if (char !== '\\') {
      output += char;
      continue;
    }
    const next = source[++index];
    if (next === undefined) return null;
    if (next === '\n') continue;
    if (next === '\r' && source[index + 1] === '\n') { index += 1; continue; }
    const simple = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', '0': '\0', '\\': '\\', '`': '`', '$': '$' };
    if (Object.hasOwn(simple, next)) { output += simple[next]; continue; }
    if (next === 'x' && /^[0-9a-fA-F]{2}$/.test(source.slice(index + 1, index + 3))) {
      output += String.fromCodePoint(Number.parseInt(source.slice(index + 1, index + 3), 16));
      index += 2;
      continue;
    }
    if (next === 'u') {
      const braced = /^\{([0-9a-fA-F]{1,6})\}/.exec(source.slice(index + 1));
      if (braced) {
        output += String.fromCodePoint(Number.parseInt(braced[1], 16));
        index += braced[0].length;
        continue;
      }
      const hex = source.slice(index + 1, index + 5);
      if (/^[0-9a-fA-F]{4}$/.test(hex)) {
        output += String.fromCodePoint(Number.parseInt(hex, 16));
        index += 4;
        continue;
      }
    }
    output += next;
  }
  return null;
}

function findConstInitializers(source, name, beforeIndex) {
  const masked = maskJavaScript(source);
  const pattern = new RegExp(`\\bconst\\s+${escapeRegex(name)}\\s*=`, 'g');
  const matches = [];
  for (const match of masked.matchAll(pattern)) {
    if (match.index >= beforeIndex) continue;
    let roundDepth = 0;
    let squareDepth = 0;
    let braceDepth = 0;
    for (let index = 0; index < match.index; index += 1) {
      const char = masked[index];
      if (char === '(') roundDepth += 1;
      else if (char === ')') roundDepth = Math.max(0, roundDepth - 1);
      else if (char === '[') squareDepth += 1;
      else if (char === ']') squareDepth = Math.max(0, squareDepth - 1);
      else if (char === '{') braceDepth += 1;
      else if (char === '}') braceDepth = Math.max(0, braceDepth - 1);
    }
    if (roundDepth || squareDepth || braceDepth) continue;
    const valueStart = match.index + match[0].length;
    roundDepth = 0;
    squareDepth = 0;
    braceDepth = 0;
    let valueEnd = masked.length;
    for (let index = valueStart; index < masked.length; index += 1) {
      const char = masked[index];
      if (char === '(') roundDepth += 1;
      else if (char === ')') roundDepth = Math.max(0, roundDepth - 1);
      else if (char === '[') squareDepth += 1;
      else if (char === ']') squareDepth = Math.max(0, squareDepth - 1);
      else if (char === '{') braceDepth += 1;
      else if (char === '}') braceDepth = Math.max(0, braceDepth - 1);
      else if (char === ';' && roundDepth === 0 && squareDepth === 0 && braceDepth === 0) { valueEnd = index; break; }
    }
    matches.push(source.slice(valueStart, valueEnd).trim());
  }
  return matches;
}

function callableBody(expression) {
  const source = String(expression || '').trim();
  const masked = maskJavaScript(source);
  if (/^(?:async\s+)?function\b/.test(masked)) {
    const open = masked.indexOf('{');
    const close = open >= 0 ? findMatchingDelimiter(masked, open) : -1;
    return close >= 0 && !masked.slice(close + 1).trim() ? source.slice(open + 1, close) : null;
  }
  const arrow = masked.indexOf('=>');
  if (arrow < 0) return null;
  let bodyStart = arrow + 2;
  while (/\s/.test(masked[bodyStart] || '')) bodyStart += 1;
  if (masked[bodyStart] !== '{') return source.slice(bodyStart).trim() || null;
  const close = findMatchingDelimiter(masked, bodyStart);
  return close >= 0 && !masked.slice(close + 1).trim() ? source.slice(bodyStart + 1, close) : null;
}

export function parseRegisteredSceneSource(source, expectedRouteId = null) {
  const input = String(source || '');
  const masked = maskJavaScript(input);
  const calls = [];
  const pattern = /(?<![\w$.])\bwindow\s*\.\s*WegoApp\s*\.\s*registerScene\s*\(/g;
  for (const match of masked.matchAll(pattern)) {
    const openParen = masked.indexOf('(', match.index);
    const call = splitCallArguments(input, masked, openParen);
    calls.push({ index: match.index, ...call });
  }
  if (calls.length !== 1) throw new Error(`scene.js 必须且只能真实调用一次 window.WegoApp.registerScene，当前为 ${calls.length} 次`);
  const call = calls[0];
  if (call.arguments.length !== 1 || !call.arguments[0].startsWith('{')) throw new Error('registerScene 必须接收单一对象字面量');
  const objectSource = call.arguments[0];
  const members = parseObjectMembers(objectSource);
  const member = key => {
    const matches = members.filter(item => item.key === key);
    if (matches.length !== 1) throw new Error(`registerScene.${key} 必须且只能声明一次`);
    return matches[0];
  };

  const routeMember = member('routeId');
  const routeId = routeMember.kind === 'property' ? staticStringValue(routeMember.source) : null;
  if (!routeId) throw new Error('registerScene.routeId 必须是静态字符串');
  if (expectedRouteId !== null && routeId !== expectedRouteId) throw new Error(`registerScene.routeId 必须等于合同 route_id：${expectedRouteId}`);

  const templateMember = member('template');
  let templateExpression = templateMember.kind === 'shorthand' ? templateMember.source : templateMember.kind === 'property' ? templateMember.source : null;
  if (!templateExpression) throw new Error('registerScene.template 必须是静态模板或静态模板标识符');
  let template = decodeTemplateLiteral(templateExpression);
  if (template === null && /^[A-Za-z_$][\w$]*$/.test(templateExpression)) {
    const initializers = findConstInitializers(input, templateExpression, call.index);
    if (initializers.length !== 1) throw new Error(`registerScene.template 标识符 ${templateExpression} 必须指向注册前唯一的 const 初始化`);
    template = decodeTemplateLiteral(initializers[0]);
  }
  if (template === null) throw new Error('registerScene.template 只允许静态反引号模板或其唯一 const 标识符');

  const initMember = member('init');
  const initBody = initMember.kind === 'method' ? initMember.body : initMember.kind === 'property' ? callableBody(initMember.source) : null;
  if (initBody === null) throw new Error('registerScene.init 必须是可静态解析的方法或函数');

  return { objectSource, routeId, template, initBody };
}

function parseAttributes(source) {
  const attrs = {};
  const names = new Set();
  const input = String(source || '');
  let cursor = 0;
  while (cursor < input.length) {
    while (/\s/.test(input[cursor] || '')) cursor += 1;
    if (cursor >= input.length) break;
    if (input[cursor] === '/' && !input.slice(cursor + 1).trim()) break;
    const nameMatch = /^([:\w-]+)/.exec(input.slice(cursor));
    if (!nameMatch) throw new Error(`template 元素属性语法无法静态解析：${input.slice(cursor).trim()}`);
    const name = nameMatch[1].toLowerCase();
    cursor += nameMatch[0].length;
    while (/\s/.test(input[cursor] || '')) cursor += 1;
    let value = '';
    if (input[cursor] === '=') {
      cursor += 1;
      while (/\s/.test(input[cursor] || '')) cursor += 1;
      const quote = input[cursor];
      if (quote !== '"' && quote !== "'") throw new Error(`template 属性 ${name} 必须使用引号包裹静态值`);
      const close = input.indexOf(quote, cursor + 1);
      if (close < 0) throw new Error(`template 属性 ${name} 缺少闭合引号`);
      value = input.slice(cursor + 1, close);
      cursor = close + 1;
    }
    if (names.has(name)) throw new Error(`template 元素属性重复：${name}`);
    names.add(name);
    attrs[name] = value;
  }
  return attrs;
}

function stripHtmlComments(source) {
  const input = String(source || '');
  let output = '';
  let cursor = 0;
  while (cursor < input.length) {
    const open = input.indexOf('<!--', cursor);
    if (open < 0) return output + input.slice(cursor);
    output += input.slice(cursor, open);
    const close = input.indexOf('-->', open + 4);
    if (close < 0) throw new Error('registerScene.template 包含未闭合 HTML 注释');
    cursor = close + 3;
  }
  return output;
}

function tagEnd(source, start) {
  let quote = null;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '>') return index;
  }
  return -1;
}

function flatten(node, output = []) {
  for (const child of node.children || []) {
    output.push(child);
    flatten(child, output);
  }
  return output;
}

export function parseSceneTemplate(source) {
  const html = stripHtmlComments(source);
  const fragment = { tag: '#fragment', attrs: {}, children: [] };
  const stack = [fragment];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
  let cursor = 0;
  while (cursor < html.length) {
    const open = html.indexOf('<', cursor);
    const text = html.slice(cursor, open < 0 ? html.length : open);
    if (stack.length === 1 && text.trim()) throw new Error('registerScene.template 顶层只能包含一个元素根节点');
    if (open < 0) break;
    if (!/[A-Za-z/]/.test(html[open + 1] || '')) {
      cursor = open + 1;
      continue;
    }
    const end = tagEnd(html, open + 1);
    if (end < 0) throw new Error('registerScene.template 包含未闭合标签');
    const raw = html.slice(open, end + 1);
    const closing = /^<\//.test(raw);
    const tagMatch = raw.match(/^<\/?\s*([A-Za-z][\w-]*)/);
    if (!tagMatch) { cursor = end + 1; continue; }
    const tag = tagMatch[1].toLowerCase();
    if (closing) {
      if (stack.length === 1 || stack.at(-1).tag !== tag) throw new Error(`registerScene.template 标签闭合顺序错误：${tag}`);
      stack.pop();
    } else {
      const attrStart = raw.indexOf(tagMatch[1]) + tagMatch[1].length;
      const node = { tag, attrs: parseAttributes(raw.slice(attrStart, -1)), children: [] };
      stack.at(-1).children.push(node);
      if (!/\/\s*>$/.test(raw) && !voidTags.has(tag)) stack.push(node);
    }
    cursor = end + 1;
  }
  if (stack.length !== 1) throw new Error(`registerScene.template 标签未闭合：${stack.at(-1).tag}`);
  if (fragment.children.length !== 1) throw new Error(`registerScene.template 必须且只能包含一个顶层元素，当前为 ${fragment.children.length} 个`);
  const root = fragment.children[0];
  return { root, nodes: [root, ...flatten(root)] };
}
