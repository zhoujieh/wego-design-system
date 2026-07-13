# Readiness 与原型边界

> 角色：范围判断方法。读取条件：需求存在歧义或需要控制原型深度时；不替代规格字段定义。

仅在需求存在歧义、局部未确认或需要决定原型实现深度时读取。业务事实只能来自用户原始需求及其明确确认；不得从 UI Kit、组件 Preview、同类页面惯例或 AI 推测补充页面、字段、状态、流程、文案和操作。

## 提交简报与确认

每个业务需求都必须先提交极简 `prototype_brief`，内容只包括：目标、纳入范围、排除范围、入口、关键路径、原型边界、低风险假设和待确认问题。不得在此阶段输出组件、布局、页面范式、打开方式或正式规格。

向用户确认时，使用简短摘要逐项列出“本次要做什么、不做什么、从哪里进入、关键操作如何完成、原型模拟到什么程度”。必须由用户明确确认后才能运行 `confirm-brief` 并交给 `wego-design`。

## UI 假设与入口归属

`prototype_brief` 的产品阶段字段必须用业务语言描述，不得带入任何 UI 假设倾向，以免误导下游设计决策。

### UI 假设的禁止表现

`prototype_brief` 的 `goal`、`included`、`excluded`、`entry_points`、`critical_paths`、`prototype_boundaries`、`assumptions`、`open_questions` 字段中，不得出现以下内容：

- 组件名或 CSS 类（如 navbar、cell、card、tab、search、actionsheet、`wg-image`、`.cell-group`）。
- 页面范式或布局结构（如“顶部导航栏”“底部 Tab”“卡片列表”“表单分组”“左图右文”“宽幅矩形图”）。
- 视觉位置或排版描述（如“居中”“靠右”“固定底部”“悬浮”“铺满”“横向滚动”）。
- 交互控件类型（如“开关”“单选”“多选”“计数器”“标签筛选”“底部弹层”）。
- 动画或打开方式（如“slide-up”“push”“modal”“sheet”“全屏弹窗”）。
- 字号、颜色、间距、圆角、阴影等 Token 级视觉属性。

### 业务入口归属属于产品决策

`entry_points` 字段必须明确声明每个入口的业务归属位置，由 `wego-product` 决定，不由 `wego-design` 推断：

- 入口属于哪个宿主区域或主 tab（如“动态主 tab”“工作台 tab 下页面入口”“我的页设置入口”）。
- 入口从哪个业务页面或业务流程节点进入（如“从商品详情页底部操作区进入”“从相册列表页长按进入”）。
- 入口在业务流程中的触发条件（如“店主身份可见”“商品上架后出现”）。

需要区分两个概念：

- **业务入口归属**（在哪个 tab、哪个宿主区域、从哪个页面进入）→ `wego-product` 决定，写入 `entry_points`。
- **入口的视觉呈现和打开方式**（用什么组件、什么动画、什么布局）→ `wego-design` 决定，写入场景设计合同与决策证据。

### 正面规则

`prototype_brief` 字段应该用业务语言描述：

- `goal`：业务目标和用户价值（如“让店主连续发布商品动态”）。
- `entry_points`：业务入口归属（如“动态主 tab”“工作台 tab 下页面入口”）。
- `critical_paths`：业务关键路径（如“浏览动态 → 查看详情 → 一键转发”）。
- `prototype_boundaries`：原型实现深度（如“一键转发 functional，搜索 stub”）。
- `assumptions`：低风险可逆的业务假设（如“假设店主默认已登录”）。
- `open_questions`：待确认的业务问题（如“是否需要支持未登录访客浏览”）。

## 风险分级

- 低风险、可逆：记录到 `assumptions`，标记 `impact_level: low`、`reversible: true`，可继续。
- 影响局部流程：记录到 `open_questions`，关联 `node_id` 或 `flow_id`；已确认范围继续，未确认节点设为 `stub` 或 `excluded`。
- 影响核心目标、主流程或完成结果：必须询问用户，设置 `readiness = blocked`。

下列不确定项一律属于必须询问：业务目标、纳入或排除范围、入口、主路径、完成结果、不可逆业务规则、影响多个 surface 的状态。不得把这些问题降级为 assumption。

## readiness

- `ready`：关键流程、状态和结果明确。
- `ready-with-assumptions`：只有低风险可逆假设。
- `partially-ready`：主流程可继续，局部节点待确认。
- `blocked`：核心目标、流程或结果不清晰。

每个 readiness 必须有 `reason` 和受影响范围。`partially-ready` 只把已确认范围交给设计；`blocked` 不得交接。

进入 `wego-design` 前，本轮交付范围必须整体达到 `ready` 或 `ready-with-assumptions`；`partially-ready` 只能继续停留在产品阶段拆分延期或排除范围，不得交给场景实现。

## 边界选择

- 用户必须真实操作并看到状态变化：`functional`。
- 无后端但需要完整体验：`simulated`。
- 只需表达入口和边界：`stub`，必须有用户可见反馈。
- 明确不在本次范围：`excluded`。

不得用 `stub` 回避已经明确要求的核心路径，也不得实现 `excluded` 节点。
