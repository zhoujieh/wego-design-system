# 微购设计系统资产地图

> 角色：资产定位。读取条件：需要定位正式设计系统来源时；不复制组件、Token 或 UI Kit 规则正文。

仅在确认设计资源位置、维护技能包目录或检查同步边界时读取。

| 层级 | 权威来源 | 用途 |
| --- | --- | --- |
| Token | `../colors_and_type.css`、`../css.json` | 颜色、字号、间距、圆角、阴影、动效和尺寸 |
| 组件 | `../components/index.json`、`../components/{slug}.json`、`../preview/component-{slug}.html` | 组件注册、DOM、变体、状态和边界 |
| 页面范式 | `../uikit-plan.json`、`../ui_kits/*` | 页面骨架、槽位、组合约束、fallback 和 presentation |
| 消费规则 | `../library-consumption.json`、`../SKILL.md` | 读取顺序、复制边界、输出和门禁 |
| 输出资源 | `../assets/*` | 字体、图标、图片等可复制资产 |
| 确定性脚本 | `../scripts/*` | 样式提取等重复操作 |

`components.css` 是生成聚合物，`wego-app/lib/` 是部署副本，均不得作为首要修改源。`specs/*.md` 是自动生成的人工检查文档，不参与运行时决策。

组件和 UI Kit 实际清单分别以 `components/index.json` 与 `uikit-plan.json` 为准，不在本文件复制静态清单。
