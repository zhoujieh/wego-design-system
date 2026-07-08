# 组件与 UI Kit 使用规则

本文档由系统规则自动生成，用于人工检查。请勿直接修改；如需调整规则，应修改对应权威来源后重新生成。

## 当前组件

按钮（button）、卡片（card）、头像（avatar）、标签（tag）、底部导航（bottom-nav）、输入框（input）、计数器（counter）、角标（badge）、列表单元格（cell）、复选框（checkbox）、表单容器（form）、图片（image）、链接（link）、单选（radio）、选项卡（stack）、开关（switch）、导航栏（navbar）、提示（toast）、对话框（dialog）、底部操作表单（actionsheet）

## 组件与 UI Kit 边界

- Token 可以引用，不得随意改名或发明新数值。
- 组件必须按契约和 Preview 消费，不凭视觉感觉发明结构、子元素类或修饰类。
- UI Kit 只用于理解页面骨架、组合节奏和固定槽位，不能整页复制。
- `.uikit-shell`、`.phone-frame`、`.phone-screen` 等展示外壳不得进入业务页面结构。
- 固定宿主 App 正式维护在 `wego-app/`，不属于 UI Kit。
- 未命中现有 pagePattern 时，优先使用 `uikit-plan.json` 的 fallback blueprint；仍无法覆盖时标记 `gap`，不得交给实现阶段临时决定。

## 当前 UI Kit

当前登记：biz-rule-config、system-settings。实际清单以 uikit-plan.json 为准。

<!-- generated-by: scripts/specs.mjs@2 -->
<!-- source-fingerprint: c13d81515184cb81bc392d333dac64147fa4b53388d3cfc071154501e8f32eaa -->
