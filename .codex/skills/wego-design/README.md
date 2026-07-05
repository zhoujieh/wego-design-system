# 微购设计系统

## 定位与职责

`wego-design` 是面向移动端、微信生态、电商 / 工具场景的中文设计系统，也是 `wego-design` 技能做设计消费时使用的根目录。

它只负责一件事：基于已经明确的 `page_spec`，选择合适的页面范式、UI Kit、组件组合和规范引用，并产出 `design_consumption_plan`。

它不负责：

- 重新理解原始业务需求
- 跳过 `page_spec` 直接做场景判断
- 直接生成最终 `wego-app` 原型

设计方向固定为：

- 简洁
- 干净
- 淡雅
- 克制

设计优先级固定为：

- 清晰 > 一致 > 效率 > 美观 > 创新

## 什么时候该看这个文档

当你已经有 `page_spec`，准备进入设计系统消费阶段时，就该看这份 README。

典型场景包括：

- 判断当前业务页面命中哪个 UI Kit / 页面范式
- 给 `page_spec` 选择组件映射、导航方式、布局模式
- 准备产出 `design_consumption_plan`

如果还没有 `page_spec`，先回到 `wego-product`，不要在这里直接开始做设计消费。

## 设计库包含什么

以下路径都相对于当前设计库根目录 `{WEGO_DESIGN_ROOT}`：

```text
{WEGO_DESIGN_ROOT}/
├── colors_and_type.css
├── css.json
├── scaffold.css
├── components.css
├── iconfont.css
├── library-consumption.json
├── uikit-plan.json
├── metadata.json
├── assets/
├── components/
├── preview/
├── ui_kits/
├── specs/
└── SKILL.md
```

可以把这里的资产理解成 4 层：

| 层 | 主要文件 | 用途 | 是否直接复制 |
|---|---|---|---|
| Token 层 | `colors_and_type.css`、`css.json` | 颜色、字号、圆角、间距等设计语言 | 可以引用 |
| 组件层 | `components/{slug}.json`、`preview/component-{slug}.html`、`components/index.json` | 看组件契约、真实结构和稳定组合方式 | 可以按契约消费 |
| 页面范式层 | `uikit-plan.json`、`ui_kits/*` | 看页面骨架、固定槽位、命中的 page pattern | 只看结构，不整页照搬 |
| 规则层 | `library-consumption.json`、`specs/*.md`、`SKILL.md` | 看读取顺序、边界、规范正文、输出硬约束 | 必须遵守 |

补充说明：

- `colors_and_type.css` 是权威 Token 源
- `css.json` 是 Token 的机器可读投影
- `components/index.json` 是已发布组件注册表
- `components/{slug}.json` 是单组件契约
- `preview/component-{slug}.html` 是组件预览和真实 HTML 结构
- `uikit-plan.json` 是页面范式、蓝图、固定槽位和约束来源
- `library-consumption.json` 是消费读取顺序和复制边界来源
- `specs/*.md` 是文案、布局、交互、视觉规则的正文来源
- `SKILL.md` 负责 `design_consumption_plan` 的输出结构和硬约束

## 正确消费顺序

不要凭感觉直接挑组件，建议按这个顺序往下读：

1. 先看 `library-consumption.json`  
明确全局消费边界、读取顺序、哪些层可以复制、哪些层只能参考。

2. 再看 `uikit-plan.json`  
判断当前业务页面命中的 UI Kit、页面范式、固定槽位、fallback 蓝图和页面打开方式来源。

3. 再看命中的组件契约  
按需读取 `components/index.json`、`components/{slug}.json`，确认有哪些稳定组件、变体和组合约束可用。

4. 再看对应 preview  
去 `preview/component-{slug}.html` 看真实结构、DOM 关系和已注册 class 的落法。

5. 最后回到规范正文和 `SKILL.md`  
`specs/*.md` 负责解释文案、布局、交互、视觉规则；`SKILL.md` 负责约束 `design_consumption_plan` 最终该怎么写、怎么落盘。

一句话记忆：先定页面范式，再定组件组合，最后把判断写进 `design_consumption_plan`。

## 三层消费边界

这套设计系统不是让你“整包照搬”的，要按层消费。

| 你现在要做什么 | 应该看什么 | 不该怎么做 |
|---|---|---|
| 用设计语言 | `colors_and_type.css`、`css.json` | 不自己发明新 Token 名或新数值 |
| 选组件和结构 | `components/*.json`、`preview/component-*.html` | 不跳过契约，只凭视觉感觉拼结构 |
| 判断页面范式 | `uikit-plan.json`、`ui_kits/*` | 不把 UI Kit 当最终页面模板整页照搬 |

重点提醒：

- Token 层是设计语言来源，可以引用，但不要改名、不要随意扩写
- 组件层是结构和组合来源，应该按契约和 preview 消费
- UI Kit 层是页面级 Showcase，只负责给你看结构、节奏和槽位，不是业务页面母版

## 正确消费方式示例

如果你要做一个“业务规则配置”类页面，正确方式是：

1. 先看 `uikit-plan.json`，判断它是不是命中 `biz-rule-config` 或其他 page pattern
2. 再看命中的 `components/{slug}.json`，确认该信息块应该落到哪个稳定组件或组合约束
3. 再去 `preview/component-{slug}.html` 看真实结构和 class 组成
4. 最后把这些判断写进 `design_consumption_plan`

错误方式通常有这几种：

- 直接打开 `ui_kits/*`，把整个 Showcase 外壳当成业务页面模板复制
- 把 `.uikit-shell`、`.phone-frame`、`.phone-screen` 这种预览外壳当成业务结构
- 不看 `uikit-plan.json`，直接凭感觉选几个组件让 `wego-ux` 再次判断

要点可以记成一句话：

看 UI Kit，是为了理解页面骨架；看组件契约和 preview，才是为了落真实页面结构。

## 硬边界

下面这些边界是必须守住的：

- 固定宿主 App 正式维护在 `wego-app/`
- `wego-ux/templates/host-shell.*` 只是宿主基线来源，不属于 `wego-design` 的 UI Kit 或页面范式
- `.uikit-shell`、`.phone-frame`、`.phone-screen` 这类展示壳层，不能当业务页面结构
- 设计消费只决定页面结构、组件映射、打开方式，不负责产出最终原型
- `design_consumption_plan` 的详细输出格式、字段要求、落盘规则，以 `SKILL.md` 为准

## 当前组件

稳定组件共 19 个：

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
- `toast`
- `dialog`

## 当前 UI Kit

- `biz-rule-config`
  用于观察业务规则配置 / 业务数据编辑页的页面范式
- `system-settings`
  用于观察系统设置 / 应用设置页的页面范式

## README 和 SKILL 的分工

这份 README 只负责：

- 总定位
- 消费顺序
- 资产层级
- 使用边界
- 常见误用提醒

`SKILL.md` 继续负责：

- 何时触发本技能
- `design_consumption_plan` 的完整输出结构
- 字段级硬约束
- 落盘规则
- 禁止事项

如果你已经进入实际产出阶段，不要只看 README，必须继续看 `SKILL.md`。

## 原型交接关系

这套链路的分工固定如下：

- 原始需求理解交给 `wego-product`
- 设计系统消费交给 `wego-design`
- `wego-app` 场景原型输出交给 `wego-ux`
- 当前任务范围验收交给 `wego-tests`

所以 `wego-design` 的任务不是把页面直接做完，而是把“该怎么消费设计系统”这件事判断清楚，并稳定交给下一环。
