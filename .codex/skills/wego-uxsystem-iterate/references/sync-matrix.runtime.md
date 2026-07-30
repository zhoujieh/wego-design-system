# 设计系统同步矩阵

| 改动 | 权威来源 | 仅在受影响时同步 | 验证 |
| --- | --- | --- | --- |
| 组件结构、变体、状态或消费语义 | `components/{slug}.json`、目标 Preview | 索引项、生成 CSS、明确引用的 UI Kit 和场景 | 组件一致性、受影响场景 |
| Preview 或组件样式 | 目标 Preview | `components.css`、部署副本 | CSS 提取、组件一致性、资源同步 |
| Token | `colors_and_type.css`、`css.json` | 使用该 Token 的契约、Preview、UI Kit 和部署副本 | 未知 Token、组件一致性、受影响视图 |
| 图标或资产 | `assets/`、`iconfont.css` | 使用该资源的 Preview、UI Kit 和部署副本 | 资源与链接 |
| UI Kit 或页面范式 | `uikit-plan.json`、`ui_kits/*` | 受影响的读取提示和消费者 | 正式组件存在、实际页面回归 |
| 消费规则 | `library-consumption.json` | 直接消费者和守卫 | 严格系统验证 |
| 宿主能力 | `wego-app/*` 与消费契约 | 路由、场景合同和部署副本 | 源码、交互和浏览器检查 |

正式设计系统源变化必须递增 metadata 版本；同步只覆盖受影响项，UI Kit 正确性由正式组件一致性和实际页面验证。
