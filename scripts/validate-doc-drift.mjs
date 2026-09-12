#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const testing = args.includes('test');

const errors = [];
const warnings = [];

// 扫描的文档目录
const docDirs = [
  'AGENTS.md',
  'README.md',
  'scripts/README.md',
  'docs/微购工作流流程图.html',
  '.github/workflows/sync-open-prs.yml',
  '.codex/skills/wego-design/library-consumption.json',
  '.codex/skills/wego-uxsystem-iterate/',
  '.codex/skills/wego-design/',
  '.codex/skills/wego-product/',
  '.codex/skills/wego-github-delivery/'
];

function collectMdFiles(root, dirOrFile, result = []) {
  const full = path.join(root, dirOrFile);
  if (!fs.existsSync(full)) return result;
  const stat = fs.statSync(full);
  if (stat.isFile() && /\.(?:md|html|json|ya?ml)$/.test(dirOrFile)) {
    result.push(dirOrFile);
  } else if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(full)) {
      collectMdFiles(root, path.join(dirOrFile, entry), result);
    }
  }
  return result;
}

function extractFilePaths(content) {
  // 匹配反引号中的路径，如 `.codex/skills/...`、`scripts/...`、`./xxx`、`../xxx`
  const paths = new Set();
  const regex = /`([^`]+\.(?:md|mjs|js|css|json|yml|yaml|html))`/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const p = match[1].trim();
    // 跳过通配符和模板路径
    if (p.includes('*') || p.includes('{') || p.includes('}')) continue;
    // .tasks/ 是运行时工作目录（gitignore，交付单元运行时才生成），不做静态存在性校验
    if (p.startsWith('.tasks/')) continue;
    if (p.startsWith('.') || p.startsWith('scripts/') || p.startsWith('.codex/') || p.startsWith('wego-app/') || p === 'AGENTS.md' || p.startsWith('.github/')) {
      paths.add(p);
    }
  }
  return paths;
}

function extractRuleIds(content) {
  const ids = new Set();
  const regex = /<!--\s*rule-id:\s*([\w-]+)\s*-->/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.add(match[1]);
  }
  return ids;
}

function extractReferencedRuleIds(content) {
  // 先移除 HTML 注释，避免匹配到定义本身
  const withoutComments = content.replace(/<!--[\s\S]*?-->/g, '');
  // 匹配文本中引用的 rule-id，如 `rule-id: xxx` 或 `relatedRuleId: "xxx"`
  const ids = new Set();
  const regex = /(?:rule-id|relatedRuleId)[:\s]+["']?([\w-]+)["']?/g;
  let match;
  while ((match = regex.exec(withoutComments)) !== null) {
    const id = match[1];
    if (id.length > 2) ids.add(id); // 排除 -- 等误匹配
  }
  return ids;
}

// 状态词一致性：从迭代脚本提取合法状态/命令/参数词表，拦截文档引用脚本中不存在的幽灵状态
const stateMorphemes = ['confirm', 'development', 'prototyp', 'frozen', 'block', 'cancel', 'supersede', 'await', 'terminat', 'resum', 'draft'];
function extractIterationVocabulary(scriptSource) {
  const vocabulary = new Set();
  const statusesMatch = scriptSource.match(/const statuses = new Set\(\[([^\]]*)\]\)/);
  if (statusesMatch) {
    for (const [, word] of statusesMatch[1].matchAll(/'([^']+)'/g)) vocabulary.add(word);
  }
  for (const [, word] of scriptSource.matchAll(/case '([a-z-]+)'/g)) vocabulary.add(word);
  for (const [, word] of scriptSource.matchAll(/--([a-z][a-z-]+)/g)) vocabulary.add(word);
  return vocabulary;
}
function extractStateWordIssues(content, vocabulary) {
  const issues = [];
  const seen = new Set();
  for (const [, raw] of content.matchAll(/`([^`\n]+)`/g)) {
    const token = raw.trim();
    if (!/^[a-z][a-z-]*$/.test(token)) continue;
    if (!stateMorphemes.some(morpheme => token.includes(morpheme))) continue;
    if (vocabulary.has(token) || seen.has(token)) continue;
    seen.add(token);
    issues.push(`引用了迭代脚本中不存在的状态/命令/参数词：\`${token}\`（词表来自 scripts/iteration-record.mjs 的 statuses 与命令定义）`);
  }
  return issues;
}

// 固定四个技能目录之外，动态纳入经验毕业产生的 wego-scene-* 场景技能目录
function collectDocDirs(root) {
  const dirs = [...docDirs];
  const skillsRoot = path.join(root, '.codex/skills');
  if (fs.existsSync(skillsRoot)) {
    for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith('wego-scene-')) {
        dirs.push(path.join('.codex/skills', entry.name));
      }
    }
  }
  return dirs;
}

function validate() {
  const root = process.cwd();
  const mdFiles = [];
  for (const dir of collectDocDirs(root)) {
    collectMdFiles(root, dir, mdFiles);
  }

  const allRuleIds = new Set();
  const fileContents = new Map();

  // 第一遍：收集所有 rule-id 和文件内容
  for (const file of mdFiles) {
    const content = fs.readFileSync(path.join(root, file), 'utf8');
    fileContents.set(file, content);
    for (const id of extractRuleIds(content)) {
      allRuleIds.add(id);
    }
  }

  // 第二遍：检查文件路径存在性和 rule-id 引用
  for (const [file, content] of fileContents) {
    const fileDir = path.dirname(file);
    // 检查引用的文件路径
    for (const refPath of extractFilePaths(content)) {
      let fullPath;
      if (refPath.startsWith('./') || refPath.startsWith('../')) {
        // 相对路径相对于引用文件所在目录
        fullPath = path.join(root, fileDir, refPath);
      } else {
        fullPath = path.join(root, refPath);
      }
      if (!fs.existsSync(fullPath)) {
        errors.push({ code: 'doc-drift.path-missing', file, message: `引用的文件不存在：${refPath}` });
      }
    }

    // 检查引用的 rule-id 是否存在
    for (const refId of extractReferencedRuleIds(content)) {
      if (!allRuleIds.has(refId)) {
        warnings.push({ code: 'doc-drift.rule-id-missing', file, message: `引用的 rule-id 未找到定义：${refId}` });
      }
    }
  }

  // 第三遍：状态词一致性（文档反引号引用的迭代状态/命令必须存在于迭代脚本）
  const iterationScriptPath = path.join(root, 'scripts/iteration-record.mjs');
  if (fs.existsSync(iterationScriptPath)) {
    const vocabulary = extractIterationVocabulary(fs.readFileSync(iterationScriptPath, 'utf8'));
    for (const [file, content] of fileContents) {
      for (const message of extractStateWordIssues(content, vocabulary)) {
        errors.push({ code: 'doc-drift.state-word-unknown', file, message });
      }
    }
  }

  const consumptionFile = '.codex/skills/wego-design/library-consumption.json';
  if (fileContents.has(consumptionFile)) {
    try {
      const consumption = JSON.parse(fileContents.get(consumptionFile));
      if (consumption.appRuntime?.sceneDirectory !== 'wego-app/scenes/{分类}/{中文业务场景}') {
        errors.push({
          code: 'doc-drift.scene-directory',
          file: consumptionFile,
          message: 'appRuntime.sceneDirectory 必须与分类场景目录结构一致'
        });
      }
    } catch (error) {
      errors.push({ code: 'doc-drift.json-invalid', file: consumptionFile, message: `JSON 无法解析：${error.message}` });
    }
  }

  return {
    errors,
    warnings,
    info: [],
    metrics: {
      filesScanned: mdFiles.length,
      ruleIdsFound: allRuleIds.size
    }
  };
}

if (testing) {
  const fixture = fs.mkdtempSync(os.tmpdir() + '/doc-drift-');
  try {
    // 创建测试文件
    fs.mkdirSync(path.join(fixture, '.codex/skills/wego-uxsystem-iterate'), { recursive: true });
    fs.writeFileSync(path.join(fixture, 'AGENTS.md'), '<!-- rule-id: test-rule -->\n引用 `scripts/exists.mjs` 和 `scripts/missing.mjs`');
    fs.writeFileSync(path.join(fixture, '.codex/skills/wego-uxsystem-iterate/SKILL.md'), '引用 rule-id: test-rule 和 rule-id: missing-rule');
    fs.mkdirSync(path.join(fixture, 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(fixture, 'scripts/exists.mjs'), '// exists');
    fs.writeFileSync(path.join(fixture, 'scripts/iteration-record.mjs'), "const statuses = new Set(['draft', 'in-development']);\ncase 'block': break;\n");
    fs.mkdirSync(path.join(fixture, '.codex/skills/wego-product'), { recursive: true });
    fs.writeFileSync(path.join(fixture, '.codex/skills/wego-product/SKILL.md'), '状态 `draft` 合法，`prototype-confirmed` 是幽灵状态');

    const originalCwd = process.cwd();
    process.chdir(fixture);
    const report = validate();
    process.chdir(originalCwd);

    if (!report.errors.some(e => e.message.includes('missing.mjs'))) throw new Error('应检测到缺失文件');
    if (!report.warnings.some(w => w.message.includes('missing-rule'))) throw new Error('应检测到缺失 rule-id');
    if (!report.errors.some(e => e.code === 'doc-drift.state-word-unknown' && e.message.includes('prototype-confirmed'))) throw new Error('应检测到幽灵状态词');
    console.log('文档漂移检查测试通过');
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
  process.exit(0);
}

const report = validate();
if (jsonOutput) {
  console.log(JSON.stringify({ ...report, ok: report.errors.length === 0 }, null, 2));
} else {
  console.log(report.errors.length ? '文档漂移检查失败' : '文档漂移检查通过');
  for (const item of report.errors) console.error(`- [${item.code}] ${item.file}：${item.message}`);
  for (const item of report.warnings) console.warn(`- [${item.code}] ${item.file}：${item.message}`);
}
process.exit(report.errors.length ? 1 : 0);
