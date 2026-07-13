# 设计系统同步矩阵

| 改动 | 必改来源 | 必同步 | 必验收 |
| --- | --- | --- | --- |
| 组件契约 | `components/{slug}.json` | Preview、索引、引用该组件的明确范式 | 组件一致性守卫 |
| Preview 或组件样式 | 对应 Preview | 重新生成 `components.css`、部署副本 | 提取脚本、组件一致性、资源同步 |
| Token | `colors_and_type.css`、`css.json` | 受影响契约、Preview、UI Kit、部署副本 | 组件一致性、全量设计系统验证 |
| 图标或资产 | `assets/`、`iconfont.css` | Preview、UI Kit、部署副本 | 资源同步、链接检查 |
| UI Kit 或明确页面范式 | `uikit-plan.json`、`ui_kits/*` | 范式候选组件、质量报告、受影响场景合同 | 组件一致性、受影响场景回归 |
| 消费规则 | `library-consumption.json` | wego-design、系统迭代入口和守卫 | 全量验证 |
| 宿主运行规则 | `wego-app/*` 与消费契约 | 场景合同、路由、资源副本 | 场景合同、交互与视觉检查 |

每次正式设计系统迭代都必须递增 metadata 版本，运行 CSS 提取、组件一致性、同步与严格系统验证。自动生成规则文档和旧技能不是同步对象。
