#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const appRoot = path.join(root, 'wego-app');
const destinationArg = process.argv[2];

if (!destinationArg) {
  console.error('用法：node scripts/build-pages-artifact.mjs <系统临时目录>');
  process.exit(1);
}

const destination = path.resolve(destinationArg);
const rootPrefix = `${root}${path.sep}`;
if (destination === root || destination.startsWith(rootPrefix)) {
  console.error('Pages 产物必须写入仓库外的系统临时目录。');
  process.exit(1);
}

if (fs.existsSync(destination)) {
  if (!fs.statSync(destination).isDirectory() || fs.readdirSync(destination).length > 0) {
    console.error(`Pages 产物目录必须为空：${destination}`);
    process.exit(1);
  }
} else {
  fs.mkdirSync(destination, { recursive: true });
}

function resolveAppPath(relative) {
  const source = path.resolve(appRoot, relative);
  if (source !== appRoot && !source.startsWith(`${appRoot}${path.sep}`)) {
    throw new Error(`运行时路径越界：${relative}`);
  }
  if (!fs.existsSync(source)) throw new Error(`运行时资源不存在：${relative}`);
  return source;
}

function copyFile(relative) {
  const source = resolveAppPath(relative);
  const target = path.join(destination, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDirectory(relative) {
  const source = resolveAppPath(relative);
  const target = path.join(destination, relative);
  fs.cpSync(source, target, {
    recursive: true,
    filter: sourcePath => path.basename(sourcePath) !== '.DS_Store'
  });
}

copyFile('index.html');
for (const directory of ['css', 'js', 'lib']) copyDirectory(directory);
copyFile('data/prototype-db.js');

const routesSource = fs.readFileSync(resolveAppPath('js/routes.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(routesSource, sandbox, { filename: 'wego-app/js/routes.js' });
const routes = Array.isArray(sandbox.window.WEGO_APP_ROUTES) ? sandbox.window.WEGO_APP_ROUTES : [];
// 空白基线允许 routes 为空

for (const route of routes) {
  for (const field of ['script', 'style']) {
    if (typeof route[field] !== 'string' || route[field].length === 0) {
      throw new Error(`路由 ${route.routeId || 'unknown'} 缺少 ${field}。`);
    }
    copyFile(route[field]);
  }
}

fs.writeFileSync(path.join(destination, '.nojekyll'), '');

const publishedFiles = [];
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(target);
    else if (entry.isFile()) publishedFiles.push(path.relative(destination, target).split(path.sep).join('/'));
  }
}
collect(destination);

for (const forbidden of ['design-decisions.json', 'iteration.json', 'freeze.json']) {
  if (publishedFiles.some(file => file.endsWith(forbidden))) {
    throw new Error(`Pages 产物包含禁止公开的文件：${forbidden}`);
  }
}
if (publishedFiles.some(file => file.includes('/_iterations/'))) {
  throw new Error('Pages 产物不得包含业务迭代记录。');
}

console.log(JSON.stringify({
  destination,
  routes: routes.length,
  files: publishedFiles.length
}, null, 2));
