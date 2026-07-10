# 微购设计系统

## 定位

`wego-design` 是面向移动端、微信生态、电商、工具与社交场景的中文设计系统。在已有 `page_spec` 的前提下，它负责选择页面范式、UI Kit、组件组合、布局方式和页面打开方式，并输出 `design_consumption_plan`。

它不负责重新理解原始需求，也不直接生成最终原型。设计方向固定为：简洁、干净、淡雅、克制。判断优先级固定为：清晰 > 一致 > 效率 > 美观 > 创新。

## 运行时入口

`.codex/skills/wego-design/SKILL.md` 是本技能唯一运行时权威入口。

- 不存在第二份 `SKILL.runtime.md` 或覆盖文件。
- 详细设计事实分别由 Token、组件契约、Preview、页面范式和消费边界承载。
- `specs/*.md` 只用于人工检查，不参与运行时决策。

## 四层资产

| 层级 | 权威来源 | 用途 |
| --- | --- | --- |
| Token | `colors_and_type.css`、`css.json` | 颜色、字号、间距、圆角、阴影、动效和尺寸 |
| 组件 | `components/index.json`、`components/{slug}.json`、`preview/component-{slug}.html` | 稳定组件、真实 DOM、变体、状态和使用边界 |
| 页面范式 | `uikit-plan.json`、`ui_kits/*` | 页面骨架、固定槽位、组合约束、fallback 和打开方式 |
| 消费规则 | `library-consumption.json`、`SKILL.md` | 读取顺序、复制边界、输出字段和运行时门禁 |

## 正确消费顺序

1. 读取唯一 `SKILL.md`，确认职责、门禁和输出结构。
2. 读取已落盘的 `page_spec`。
3. 读取 `library-consumption.json`，确认全局消费边界。
4. 读取 `uikit-plan.json`，判断 pagePattern、fallback 和 presentation。
5. 读取 `colors_and_type.css` 与 `css.json`，确认 Token。
6. 读取 `components/index.json`，确认可用组件。
7. 读取命中的组件契约与 Preview。
8. 输出 `design_consumption_plan`，用 `rule_sources_used` 记录真实决策来源。

禁止读取 `specs/*.md` 辅助运行时决策。历史数据中若仍存在指向 `specs` 的兼容字段，也不得加入本轮规则来源。

## 组件与 UI Kit 边界

- Token 可以引用，不得随意改名或发明新数值。
- 组件必须按契约和 Preview 消费，不凭视觉感觉发明结构、子元素类或修饰类。
- UI Kit 只用于理解页面骨架、组合节奏和固定槽位，不能整页复制。
- `.uikit-shell`、`.phone-frame`、`.phone-screen` 等展示外壳不得进入业务页面结构。
- 固定宿主 App 正式维护在 `wego-app/`，不属于 UI Kit。
- 未命中 pagePattern 时优先使用 fallback blueprint；仍无法覆盖时标记 `gap`，不得交给实现阶段临时决定。

## 当前稳定组件

组件清单以 `components/index.json` 为唯一注册表。当前包括：

`button`、`card`、`avatar`、`tag`、`bottom-nav`、`input`、`search`、`counter`、`badge`、`cell`、`checkbox`、`form`、`image`、`link`、`radio`、`stack`、`tabs`、`switch`、`navbar`、`toast`、`dialog`、`actionsheet`、`modal`、`popmenu`。

## 当前 UI Kit

- `biz-rule-config`：业务规则配置与业务数据编辑页面范式。
- `system-settings`：系统设置与应用设置页面范式。

实际清单以 `uikit-plan.json` 为准。

## 自动生成规则文档

生成文档位于 `specs/`，只用于人工审查：

```bash
node scripts/specs.mjs generate
node scripts/specs.mjs check
node scripts/specs.mjs test
```

- 不直接修改生成文档。
- 修改权威来源后重新生成。
- 提交前必须通过一致性检查。
- 生成文档与权威来源冲突时，以权威来源为准。

## 交接关系

- 原始需求理解：`wego-product`
- 设计系统消费：`wego-design`
- 原型实现：`wego-ux`
- 验收与回归：`wego-tests`
- 组件、UI Kit 和工作流本体迭代：`wego-uxsystem-iterate`
