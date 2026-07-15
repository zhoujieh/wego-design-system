# 微购设计系统资产地图

> 角色：定位唯一权威来源。读取条件：需要读取或修改设计系统资源、场景运行时或守卫；不承载业务需求或生成规则投影。

| 领域 | 权威来源 | 使用方式 |
| --- | --- | --- |
| 设计决策原则 | `design-decisions.md` | 所有设计输出先据此裁决清晰、高效、一致与美观。 |
| 实际 CSS 变量 | `../colors_and_type.css` | `:root` 中已声明的变量名是唯一可用 Token 名称。 |
| Token 结构 | `../css.json` | 仅用于理解 palette、语义和层级，不推导 CSS 变量名。 |
| 组件注册 | `../components/index.json` | 已注册组件及其 Preview 路径的唯一清单。 |
| 组件运行时契约 | `../components/{slug}.json` | DOM、变体、状态、Token、规则引用和边界。 |
| 组件实现参考 | `../preview/component-{slug}.html` | Preview-first 的 DOM、class、Token、间距与状态依据。 |
| 聚合组件样式 | `../components.css` | 从 Preview 生成；只读，禁止手工修改。 |
| 明确页面范式 | `../uikit-plan.json`、`../ui_kits/*/index.html` | 仅在明确命中时选择 pagePattern、范式 presentation 与候选组件；未命中按设计决策原则自主组合。 |
| 设计库消费边界 | `../library-consumption.json` | 组件计划、页面边距模式与 Token 映射、Token 允许范围、宿主和部署副本规则；不重复维护技能读取顺序。 |
| 图标、字体、图片 | `../assets/*`、`../iconfont.css` | 仅使用已交付资产和已注册图标。 |
| 场景宿主 | `../../../../wego-app/index.html`、`../../../../wego-app/js/routes.js` | 唯一宿主和 hash route 注册。 |
| 场景模块 | `../../../../wego-app/scenes/{中文业务场景}/scene.js`、`scene.css` | 场景模板、交互和业务布局。 |
| 可执行守卫 | `../../../../scripts/*.mjs` | 组件一致性、场景合同、同步和全量验证。 |

不得建立、读取或引用自动生成规则文档；运行时只读取本表中的权威来源。
