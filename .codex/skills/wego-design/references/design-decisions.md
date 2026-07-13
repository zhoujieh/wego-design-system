# 设计决策方法

> 角色：生成场景前的页面级约束合同。读取条件：每个新场景、已有场景结构/交互/样式修改；不定义业务事实或修改设计系统源。

## 1. 输入与失败条件

先读取已确认 `prototype_brief`。它必须给出场景目标、入口、关键路径、所需状态、业务数据和场景目录语义；缺少任何影响页面结构或交互的信息时退回 `wego-product`。

设计系统输入固定为：

1. `library-consumption.json`：资源边界和消费规则。
2. `uikit-plan.json`：页面范式、fallback blueprint、presentation 和本页组件计划。
3. `components/index.json`：可选组件清单。
4. 本页命中组件的 Preview：实际 DOM、class、Token、间距和状态。
5. 同一组件的契约：变体、语义、行为、可访问性、`runtimeTokens` 和结构边界。

禁止读取或引用已删除的规则投影、旧技能、废弃设计计划文件或历史实现来替代以上输入。

## 2. Preview-first 选择过程

1. 按业务交互模式、surface 角色和状态匹配 `pagePatterns`；未命中时匹配正式 fallback blueprint。
2. 从 `componentPlan` 选出本页实际需要的 3–6 个组件。每项记录 slug、选择原因、Preview、契约和 UI Kit 来源。
3. 先读 Preview，再读契约；只使用 Preview 中存在且契约允许的根 class、子节点和 modifier。
4. 有稳定变体时直接消费；没有稳定变体但能在 `domAnatomy` 允许范围内组合时记录 `free-composition`；都不能覆盖时创建 DDR，选择最近似正式结构继续完成原型。
5. 禁止自造完整组件、猜 Token、猜 iconfont 名称、复制 UI Kit 外壳或用业务 class 覆盖组件内部样式。
6. 当页面元素的视觉用途与已注册组件匹配时（标签→tag、角标→badge、操作按钮→button、列表行→cell、头像→avatar），必须消费对应正式组件，不得用场景 CSS 复刻组件视觉模式（圆角、背景色、字号、字重等）。场景 CSS 只负责区域布局（flex/grid/gap/padding）和区域间纵向节奏。badge 的角标定位必须基于设了 `position: relative` 的宿主元素，不得相对于外层容器绝对定位。

## 3. prompt_contract

每个 surface 必须生成以下结构并由同一任务直接消费：

```yaml
prompt_contract:
  design_system_snapshot:
    version: 0
    component_inputs:
      - slug: "cell"
        preview_file: "preview/component-cell.html"
        contract_file: "components/cell.json"
  token_whitelist:
    - "var(--text-default)"
  token_bindings:
    - content_role: "page-title"
      css_property: "font-size"
      token: "var(--heading-sm-font-size)"
      rule_ref: "components/navbar.json#/runtimeTokens"
  component_bindings:
    - slot: "settings-row"
      slug: "cell"
      root_class: "cell cell--single"
      required_structure: [".cell__body", ".cell__content"]
      modifiers: ["cell--clickable"]
      source: "preview/component-cell.html"
      contract_file: "components/cell.json"
  layout_contract:
    source: "uikit-plan.json#/pagePatterns"
    rules: ["连续列表使用正式 group 结构"]
    mutable_regions: [".scene-content"]
  interaction_contract: []
  state_contract: []
  hard_rules:
    - "禁止硬编码颜色"
    - "禁止使用白名单之外的 Token"
```

`token_whitelist` 只能来自本页命中组件的 `runtimeTokens`、场景允许的基础 Token 和 `colors_and_type.css` 的实际变量。组件 `localTokens` 仅服务组件内部参数，场景不得直接绑定或猜测。`css.json` 只帮助理解 Token 关系，不能推导变量名。

`layout_contract` 必须把选中的页面范式或 fallback 的布局规则写成当前页面直接消费的 `rules`，以 `source` 指向 `uikit-plan.json` 或其他权威来源；`mutable_regions` 明确状态变化时允许改变的区域。不得把布局决定只留在 UI Kit 的自然语言说明中。

## 4. 页面、状态与交互

- 选择 presentation 时同时记录 type、transition、dismiss action、overlay level 和 `coversTabBar`。
- 每个可见变化必须有 `state_contract`：初始值、触发器、可见结果、空/加载/错误状态、回退动作和持久化策略。
- 新场景必须明确入口和目标 `route_id`；已有场景必须复用 route，不得重复注册。
- 组件右侧独立控件承担自身交互；只有带箭头、进入下一层或展开选择面板的 row 才可整行点击。
- 动态数据、状态、保存、取消、删除和回填必须体现真实业务路径，默认使用内存状态。

## 5. 视觉约束

- 识别信息使用语义 heading Token；正文使用 body Token；辅助信息使用 small Token。字重只允许一处页面级 semibold 焦点。
- 连续列表和表单优先使用 `.cell-group`、`.form-group` 的正式结构；避免额外白底壳、圆角容器和重复 section 标题。
- 页面横向边距、固定栏、安全区和组件内部样式遵循命中组件与页面范式；业务 CSS 只负责区域布局。
- 生成后按 375px、393px 检查溢出、重叠、裁切、按钮换行、首屏密度、容器嵌套、右侧操作数量和分隔策略。
- 禁止大面积彩色背景和渐变背景。`--status-*-surface-l1` 等状态色 Token 只用于点缀和提示，不作为区域级背景大面积铺设；区域背景使用 `--bg-surface`/`--bg-page`/`--bg-subtle` 等中性 Token。
- 功能入口图标优先使用 `assets/icons/app-center/` 中的 SVG 资源（通过 `<img src="lib/assets/icons/app-center/{名称}.svg">` 引用），按业务语义匹配对应 SVG 文件名；app-center 无对应 SVG 时才使用 iconfont，且必须从 iconfont.css 查证类名。

## 6. DDR

可记录的 DDR 仅限正式设计系统无法覆盖的 pattern、variant、参数或组件缺口。错误 Token、错误 class、未读 Preview、缺少路由或未实现交互不是 DDR，必须直接修复。

DDR 使用 `open → extended → resolved | wontfix | escalated`；`extended` 最多两次。`resolved` 时必须同步修复设计系统源、Preview、契约、聚合 CSS 与守卫。
