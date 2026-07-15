---
version: "alpha"
name: "Wego"
description: "微购移动端中文电商与工具场景的独立视觉规范测试文件。"
colors:
  primary: "#03c160"
  on-primary: "#ffffff"
  primary-hover: "rgba(3, 193, 96, 0.80)"
  primary-disabled: "rgba(3, 193, 96, 0.60)"
  primary-surface-l1: "rgba(3, 193, 96, 0.10)"
  primary-surface-l2: "rgba(3, 193, 96, 0.20)"
  page: "#ededed"
  surface: "#ffffff"
  panel: "#f6f6f6"
  subtle: "#f8f9fa"
  muted: "#f2f3f6"
  active: "#e9eaef"
  inverse: "#1e2028"
  text-primary: "#1e2028"
  text-secondary: "#6e7382"
  text-tertiary: "#9097a3"
  text-disabled: "#b7bec5"
  text-inverse: "#ffffff"
  text-inverse-secondary: "rgba(255, 255, 255, 0.70)"
  text-brand: "#03c160"
  text-link: "#285b9a"
  text-promotion: "#fa5051"
  border-subtle: "rgba(32, 47, 100, 0.03)"
  border-default: "rgba(32, 47, 100, 0.08)"
  border-strong: "rgba(32, 47, 100, 0.10)"
  border-brand: "#03c160"
  pressed: "rgba(32, 47, 100, 0.06)"
  selected: "rgba(32, 47, 100, 0.10)"
  overlay-l1: "rgba(32, 47, 100, 0.03)"
  overlay-l2: "rgba(32, 47, 100, 0.06)"
  mask: "rgba(30, 32, 40, 0.60)"
  success: "#03c160"
  success-surface: "rgba(3, 193, 96, 0.10)"
  warning: "#fa9d3b"
  warning-surface: "rgba(250, 157, 59, 0.10)"
  danger: "#fa5051"
  danger-surface: "rgba(250, 80, 81, 0.10)"
  info: "#208bf1"
  info-surface: "rgba(32, 139, 241, 0.10)"
  promotion: "#ff6045"
  promotion-surface: "rgba(255, 96, 69, 0.10)"
typography:
  body-xs:
    fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: "14px"
  body-sm:
    fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
  body-md:
    fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22px"
  body-lg:
    fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  heading-xs:
    fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
  heading-sm:
    fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "28px"
  heading-md:
    fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: "32px"
  heading-lg:
    fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "34px"
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  xxl: "16px"
  full: "999px"
spacing:
  0: "0px"
  2: "2px"
  4: "4px"
  6: "6px"
  8: "8px"
  10: "10px"
  12: "12px"
  14: "14px"
  16: "16px"
  20: "20px"
  24: "24px"
  32: "32px"
  40: "40px"
  48: "48px"
  72: "72px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.primary-surface-l1}"
    textColor: "{colors.text-brand}"
    rounded: "{rounded.md}"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.16}"
  avatar:
    rounded: "{rounded.full}"
  tag:
    backgroundColor: "{colors.subtle}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
  bottom-nav:
    backgroundColor: "{colors.surface}"
    height: "56px"
  bottom-action-bar:
    backgroundColor: "{colors.surface}"
    padding: "{spacing.12}"
  input:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    height: "44px"
  search:
    backgroundColor: "{colors.subtle}"
    rounded: "{rounded.md}"
    height: "36px"
  counter:
    rounded: "{rounded.sm}"
    size: "32px"
  badge:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.full}"
  cell:
    backgroundColor: "{colors.surface}"
    padding: "{spacing.16}"
    height: "56px"
  checkbox:
    rounded: "{rounded.sm}"
    size: "20px"
  form:
    backgroundColor: "{colors.surface}"
    padding: "{spacing.16}"
  image:
    rounded: "{rounded.md}"
  link:
    textColor: "{colors.text-link}"
  radio:
    rounded: "{rounded.full}"
    size: "20px"
  stack:
    backgroundColor: "{colors.subtle}"
    rounded: "{rounded.md}"
  tabs:
    backgroundColor: "{colors.surface}"
    height: "44px"
  switch:
    rounded: "{rounded.full}"
    width: "44px"
    height: "24px"
  navbar:
    backgroundColor: "{colors.page}"
    height: "56px"
  toast:
    backgroundColor: "rgba(63, 67, 71, 0.96)"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.md}"
  dialog:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.24}"
  actionsheet:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xxl}"
  modal:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xxl}"
  popmenu:
    backgroundColor: "{colors.inverse}"
    textColor: "{colors.text-inverse}"
    rounded: "{rounded.md}"
  metric:
    typography: "{typography.heading-xs}"
---

## Overview

Wego 是面向微信生态、电商与工具场景的中文移动端界面。视觉应简洁、干净、淡雅、克制；不做营销落地页、桌面后台或独立网页。

所有设计决策按以下顺序裁决：**清晰 > 一致 > 效率 > 美观 > 创新**。页面必须基于已确认的业务目标、入口、关键路径与状态；信息不足时，不自行补造业务事实或交互。

每一页先回答三个问题：用户正在看什么、最重要的信息是什么、下一步能做什么。只保留一个明确的页面级强调焦点，避免多个标题、按钮或色块竞争注意力。

## Colors

以中性色表面承载内容，`primary` 绿色只承担品牌强调和主行动。文本、图标、边框、背景与状态必须使用其语义颜色，不按外观猜测用途。

状态色只用于成功、警告、危险、信息或促销等局部反馈；不可大面积铺底。禁止渐变、玻璃拟态和与中性基调冲突的强装饰背景。

## Typography

关键对象名称、页面标题使用 `heading-*`；正文、字段值与主要说明使用 `body-*`；时间、提示与低优先级元数据使用更小的 `body-*`。同一页面只能有一个 semibold 视觉焦点。

中文文本优先使用 `PingFang SC` 系统字体栈。金额和统计数字应突出数值本身，货币符号、单位和小数位不得与整数混为同一视觉层级。

## Layout

先按业务交互模式、信息层级和状态选择布局；连续列表与表单保持连续分组节奏。页面只可采用通栏白底、灰底卡片分组或明确沉浸式展示三类边距策略，不能在同页随意混用。

场景间距只使用 `spacing`。滚动页面同一时刻只保留一个主要 sticky 层；只有高频筛选或一级切换才可吸顶。内容流、操作区和浮层必须清晰分层，不能遮挡或压叠。

## Elevation & Depth

通过中性色表面、细边框、分组和信息层级建立深度。连续内容不额外套只为白底、圆角或阴影存在的容器。

阴影仅服务于必要的浮层与临时悬浮关系，保持轻薄克制；卡片、弹层、遮罩和固定操作区使用已定义组件语义，不以厚阴影制造层级。

## Shapes

圆角、控件高度、边框形态和内部留白遵循 `rounded`、`spacing` 与正式组件定义。不要在同一页面混用无意义的圆角风格。

头像、开关、单选和角标使用完整圆角；表面、输入和常规按钮使用小到中等圆角。不得以圆形底按钮、夸张胶囊形或自造形态强化普通操作。

## Components

优先使用已定义的组件语义：主操作用按钮，列表项用 cell，表单字段用 form/input，状态反馈用 toast、dialog、actionsheet 或 modal。稳定组件存在时，不重画等价控件。

组件只承担其已定义角色：头像用于身份，内容图片用于商品与内容，功能图标用于操作入口。不要用头像替代功能图标，也不要用商品图替代功能入口。

独立控件（switch、radio、checkbox、button）由自身响应；进入下一层、跳转或展开选择面板的行才可整行点击。每个可见变化都要给出状态、反馈或回退结果。

## Do's and Don'ts

**Do**：使用语义 Token；保持信息层级、文字密度与分组节奏；为加载、空、错误、保存、取消和删除提供真实可见反馈；让图片、图标、头像和数据各自承担正确语义。

**Don't**：硬编码新的视觉值；使用未定义颜色、间距、圆角或组件形态；复制营销页风格；大面积使用状态色；堆叠卡片和阴影；重复 section 标题；把视觉美化置于清晰、一致和效率之前。
