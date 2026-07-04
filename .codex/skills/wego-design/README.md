# 微购设计系统

## 定位

`wego-design` 是面向移动端、微信生态、电商 / 工具场景的中文设计系统。

方向固定为：

- 简洁
- 干净
- 淡雅
- 克制

设计优先级固定为：

- 清晰 > 一致 > 效率 > 美观 > 创新

## 当前职责

这个目录同时承担两层角色：

1. 设计系统本体
2. `wego-design` 本地技能的消费根目录

它不负责原始需求理解，也不负责最终原型项目输出。

## 核心文件

- `colors_and_type.css`
  权威 Token 源
- `css.json`
  Token 机器可读投影
- `components/index.json`
  已发布组件注册表
- `components/{slug}.json`
  单组件契约
- `preview/component-{slug}.html`
  组件预览与真实 HTML 结构
- `library-consumption.json`
  消费读取顺序与复制边界
- `uikit-plan.json`
  UI Kit、页面范式、固定槽位与蓝图
- `metadata.json`
  设计系统版本与已发布 UI Kit 索引
- `ui_kits/biz-rule-config/`
  业务规则配置页 Showcase
- `specs/*.md`
  规范正文唯一事实来源

## 当前组件

稳定组件共 17 个：

- `button`
- `card`
- `avatar`
- `tag`
- `bottom-nav`
- `input`
- `counter`
- `badge`
- `cell`
- `checkbox`
- `form`
- `image`
- `link`
- `radio`
- `stack`
- `switch`
- `navbar`

## 当前 UI Kit

- `biz-rule-config`
  用于观察业务规则配置 / 业务数据编辑页的页面范式

`biz-rule-config` 的重点是：

- 编辑型二级页导航
- 通栏内容布局
- 规则块分组
- 页面级主操作统一收口

它不是泛“系统设置页”。

## 消费原则

- 先读 `library-consumption.json`
- 再读 `uikit-plan.json`
- 再按命中的组件去读 `components/*.json` 和 `preview/*.html`
- 文案、布局、交互、视觉规则只引用 `specs/*.md`
- UI Kit 只看结构和节奏，不复制 Showcase 外壳
- `cell` / `form` 分组标题与卡片圆角已内建到组件正式结构；不要再自造 `uikit-section-title`、额外白底壳或圆角包裹层
- 固定宿主 App 正式维护在 `wego-app/`，`wego-ux/templates/host-shell.*` 只作为宿主基线来源；它不属于 `wego-design` UI Kit 或页面范式
- 手机外壳是 `wego-app/index.html` 的全局预览能力：电脑端显示，移动端同链接隐藏并铺满 viewport；`phone-status` / `phone-indicator` 默认 absolute 悬浮不占位，业务场景不能依赖外壳类

## 原型交接

- 需求理解交给 `wego-product`
- 设计系统消费交给 `wego-design`
- `wego-app` 场景原型输出交给 `wego-ux`
- 当前任务范围验收交给 `wego-tests`
