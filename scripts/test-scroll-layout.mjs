#!/usr/bin/env node

import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('wego-app/js/scroll-layout.js', 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const decide = context.window.WegoScrollLayout?.decideDirectionReveal;
if (typeof decide !== 'function') throw new Error('滚动运行时必须暴露纯方向裁决函数');

const base = {
  currentTop: 0,
  currentMax: 200,
  lastTop: 0,
  lastMax: 200,
  direction: 0,
  distance: 0,
  layoutTransitioning: false,
  tolerance: 1,
  threshold: 16
};

function expect(name, input, expected) {
  const actual = decide({ ...base, ...input });
  for (const [field, value] of Object.entries(expected)) {
    if (actual[field] !== value) throw new Error(`${name}.${field} 应为 ${value}，实际为 ${actual[field]}`);
  }
}

expect('顶部强制显示', { currentTop: 0, lastTop: 20 }, { state: 'visible', direction: 0, distance: 0 });
expect('向下累计到阈值隐藏', { currentTop: 20, lastTop: 0 }, { state: 'hidden', direction: 1, distance: 0 });
expect('向上累计到阈值显示', { currentTop: 40, lastTop: 60 }, { state: 'visible', direction: -1, distance: 0 });
expect('边界微动不切换', { currentTop: 60.5, lastTop: 60 }, { state: null, direction: 0, distance: 0 });
expect('底部布局校正不反向闪烁', {
  currentTop: 84,
  currentMax: 84,
  lastTop: 100,
  lastMax: 100,
  layoutTransitioning: true
}, { state: null, direction: 0, distance: 0 });
expect('回弹位置钳制', { currentTop: -12, lastTop: 0 }, { state: 'visible', top: 0 });

console.log('滚动布局运行时测试通过。');
