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
  '.codex/skills/wego-uxsystem-iterate/',
  '.codex/skills/wego-design/',
  '.codex/skills/wego-product/',
  '.codex/skills/wego-github-delivery/'
];

function collectMdFiles(root, dirOrFile, result = []) {
  const full = path.join(root, dirOrFile);
  if (!fs.existsSync(full)) return result;
  const stat = fs.statSync(full);
  if (stat.isFile() && dirOrFile.endsWith('.md')) {
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

    const originalCwd = process.cwd();
    process.chdir(fixture);
    const report = validate();
    process.chdir(originalCwd);

    if (!report.errors.some(e => e.message.includes('missing.mjs'))) throw new Error('应检测到缺失文件');
    if (!report.warnings.some(w => w.message.includes('missing-rule'))) throw new Error('应检测到缺失 rule-id');
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
