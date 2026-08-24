---
name: prototype-ui-defect-triage
description: 用户报告原型页面显示缺陷（裂图、错位、样式丢失）时使用：定位路径与设计系统常见 CSS 陷阱。
---

# 原型视觉缺陷定位

用户报"这里显示有问题"并附截图时的定位流程与已知陷阱。适用于静态原型仓库（微购 wego-design-system 等）。

## 定位流程

1. 截图无法查看（vision_analyze 报 401 等）时不要卡住：请用户用文字描述「位置 + 现象 + 触发操作」。
2. 根据描述 grep 场景模板中对应元素的写法（`hidden`、`src`、`alt`、class），再查全局/组件 css 是否覆盖了浏览器默认行为。
3. 修复后让用户在预览面板手动刷新复核；自动化预览常点不开模态表单，不要死循环重试。

## 已知陷阱

### `hidden` 属性被作者样式覆盖 → 空图裂图 + alt 文案可见

现象：本应隐藏的 `<img>` 占位显示为 alt 文字 + 裂图图标。

原因：设计系统常有 `img { display:block }` 一类作者样式，特异性高于浏览器对 `[hidden]` 的 UA 默认 `display:none`，导致 `hidden` 失效。

修法：在场景 css 显式声明：

```css
.target-preview[hidden] {
  display: none;
}
```

JS 切换 `hidden` 显示预览的正常路径不受影响。凡是用 HTML `hidden` 控制显隐的元素，若全局样式设置了同属性的 display 值，都要补这条规则。
