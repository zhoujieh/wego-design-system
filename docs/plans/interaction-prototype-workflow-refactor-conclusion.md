# 完整交互原型工作流重构结论

> 历史归档文档（不参与当前技能、规则或运行时判断）：本文描述的旧技能链路、`design_plan`、验收报告和兼容策略均已废止。当前唯一权威来源是 `AGENTS.md`、`.codex/skills/README.md` 与各现行 `SKILL.md`。

## 1. 背景与目标

当前项目的最终交付物不是单页面，而是能够在 `wego-app` 中完整走通的交互原型。一次需求可能包含多个页面、Sheet、Modal、下钻页面、返回路径、状态回填和结果反馈。

因此，现有工作流不应继续围绕“单页面规格”组织，而应围绕“完整交互任务”组织。

本次重构目标：

- 准确表达一次需求对应的完整交互范围；
- 明确产品、设计、实现、验收四个技能的职责边界；
- 避免上下游反复复制和重新解释需求；
- 支持复杂页面、多路由、多层级交互和跨页面状态；
- 在需求不清晰时既不盲目补全，也不让整个任务无条件停滞；
- 保持结构轻量，不建设重复、沉重的层层数据模型。

---

## 2. 最终技能链路

```text
wego-product
→ interaction_spec.json

wego-design
→ design_plan.json

wego-ux
→ 完整交互原型实现

wego-tests
→ acceptance_report.json
```

现有四个技能继续保留，不合并，也不新增中间技能。

---

## 3. 产物命名调整

### 3.1 `page_spec.json` 改为 `interaction_spec.json`

中文名称：**交互规格**。

不使用 `page_spec`，因为一次需求通常不是单页面。

也不建议使用 `interaction_flow_spec`，因为完整原型除了流程，还包括：

- 界面节点；
- 内容；
- 状态；
- 转移关系；
- 数据回填；
- 返回恢复；
- 原型实现边界。

`interaction_spec` 的范围更准确。

### 3.2 `design_consumption_plan.json` 改为 `design_plan.json`

中文名称：**设计方案**。

不再强调“消费设计系统”，因为该产物实际承担的是完整设计决策，包括：

- 流程如何转化为界面；
- 页面与弹层如何划分；
- 页面区域如何编排；
- 使用什么页面范式和组件模式；
- 复杂页面如何组织首屏、内容优先级和滚动结构。

---

## 4. 四个技能的最终职责

## 4.1 `wego-product`：定义完整交互规格

负责回答：

> 用户要完成什么任务，整个交互过程如何发生？

主要职责：

- 明确用户目标和业务范围；
- 确定入口和出口；
- 定义主流程、分支流程、异常流程和中断流程；
- 定义流程节点；
- 定义每个节点需要的内容、状态和结果；
- 定义节点之间的转移关系；
- 定义跨页面数据传递、回填和恢复；
- 定义原型实现深度；
- 识别假设、待确认问题和任务 readiness。

不负责：

- 选择具体组件；
- 定义页面布局；
- 输出 DOM、CSS 类或 Token；
- 决定具体视觉形式。

## 4.2 `wego-design`：输出完整设计方案

负责回答：

> 已确认的交互规格应该如何被界面化？

主要职责：

- 判断哪些流程节点合并在同一页面；
- 判断哪些节点使用独立页面、Sheet、Modal、Dialog 或内联展开；
- 定义页面范式和打开方式；
- 定义页面区域、信息层级、布局和组合关系；
- 定义组件模式和交互模式；
- 对复杂页面定义首屏目标、区域优先级、内容密度和滚动节奏；
- 判断是否存在设计系统缺口；
- 引用正式设计系统规则来源。

不负责：

- 输出完整 DOM 路径；
- 拼接 CSS 类；
- 重复组件契约中的实现结构；
- 生成业务实现代码；
- 重新解释或改写上游业务内容。

## 4.3 `wego-ux`：实现完整交互原型

负责回答：

> 如何严格按照交互规格和设计方案，把完整原型实现出来？

主要职责：

- 生成场景 DOM 和 CSS；
- 绑定状态、事件和反馈；
- 注册路由；
- 实现 push、modal、sheet、full-screen-modal；
- 实现跨页面数据回填；
- 实现返回恢复和重入行为；
- 实现移动端视口、键盘、滚动和安全区；
- 保留稳定节点标识供验收使用。

不得：

- 自行补充高风险业务规则；
- 二次设计页面；
- 新增未在交互规格中定义的业务流程；
- 用实现细节掩盖上游规格缺失。

## 4.4 `wego-tests`：按完整任务路径验收

负责回答：

> 用户能否从入口到结果完整走通任务？

主要职责：

- 检查交互规格覆盖；
- 检查设计方案覆盖；
- 检查路由和页面层级；
- 检查跨页面数据和状态；
- 检查返回恢复；
- 检查原型边界；
- 检查正常、失败、中断和重复操作路径；
- 按最早产生错误的环节归因。

验收单位不再只是单页面，而是完整用户路径。

---

## 5. `interaction_spec` 推荐结构

```text
interaction_spec
├── goal
├── scope
├── actors
├── entry_points
├── flows
├── flow_nodes
├── surfaces
├── content_blocks
├── states
├── transitions
├── data_handoffs
├── exit_results
├── prototype_boundaries
├── assumptions
├── open_questions
└── readiness
```

## 5.1 `flows`

定义完整任务路径：

- 主流程；
- 分支流程；
- 异常流程；
- 中断和恢复流程。

## 5.2 `flow_nodes`

定义交互过程中的业务节点，例如：

- 进入发布入口；
- 编辑产品信息；
- 选择分类；
- 选择运费模板；
- 提交发布；
- 发布成功。

每个节点需要稳定 `node_id`。

## 5.3 `surfaces`

Surface 是流程节点的界面承载，不等同于页面。

可以是：

- 宿主页局部区域；
- 独立页面；
- Sheet；
- Modal；
- Dialog；
- 内联区域；
- 结果界面。

每个 Surface 使用稳定 `surface_id`。

## 5.4 `content_blocks`

定义具体业务内容和交互意图，例如：

```json
{
  "id": "balance-accounting",
  "content": "客户余额记账",
  "group": "零售",
  "interaction": "toggle",
  "default_state": "on"
}
```

每个内容块使用稳定 `content_id`。

产品规格中不出现组件、DOM、CSS 类和布局规则。

## 5.5 `transitions`

必须明确节点之间的关系：

```json
{
  "id": "open-category-selector",
  "from": "publish-main",
  "trigger": "select-category",
  "to": "category-select",
  "data_in": [],
  "result_out": ["selected-category"],
  "return_to": "publish-main"
}
```

交互规格只描述业务转移意图，不提前决定一定使用 push、sheet 还是 modal。

## 5.6 `data_handoffs`

定义跨页面数据关系：

- 子页面返回什么；
- 回填到哪里；
- 返回后更新什么状态；
- 成功后是否重置；
- 取消后是否保留草稿；
- 再次进入是否复用旧状态。

## 5.7 `prototype_boundaries`

每个流程节点应明确原型实现深度：

- `functional`：需要真实可操作并完成状态变化；
- `simulated`：使用本地模拟数据走完整流程；
- `stub`：只提供入口和明确反馈；
- `excluded`：本次不包含。

该字段用于控制范围，避免两种极端：

- 所有下级能力无限展开；
- 页面画出来但关键交互全部不可用。

---

## 6. 多页面和多路由支持

完整需求不能继续使用单一 `route_id` 表达。

一个交互规格可以包含：

- 多个 route；
- 多层 push；
- 多个 overlay；
- 宿主页入口；
- 子页面返回和状态回填。

建议使用：

```json
{
  "prototype_target": {
    "app_root": "wego-app",
    "scenario_folder": "wego-app/scenes/发布产品",
    "routes": [
      {
        "id": "product-publish",
        "surface_ref": "publish-main"
      },
      {
        "id": "product-category-select",
        "surface_ref": "category-select"
      }
    ]
  }
}
```

不要求每个 Surface 都必须是独立 route，具体承载方式由 `wego-design` 决定。

---

## 7. `design_plan` 推荐结构

```text
design_plan
├── flow_to_surface_decisions
├── page_strategy
├── region_composition
├── component_patterns
├── page_presentation
├── design_gaps
└── rule_sources
```

## 7.1 `flow_to_surface_decisions`

负责定义：

- 哪些流程节点合并；
- 哪些节点独立；
- 哪些使用页面；
- 哪些使用 Sheet、Modal、Dialog 或内联交互；
- 返回和完成反馈如何表达。

## 7.2 `page_strategy`

定义页面级设计策略：

- 页面目标；
- 页面范式；
- 主滚动方向；
- 页面密度；
- 首屏优先级；
- 固定区与滚动区关系。

## 7.3 `region_composition`

负责复杂页面的区域编排，例如：

- 搜索区；
- 核心入口区；
- 运营区；
- 推荐流；
- 吸顶区；
- 底部操作区。

需要表达：

- 区域角色；
- 优先级；
- 顺序；
- 布局；
- 宽度；
- 滚动行为；
- 区域之间的关系。

该结构只在复杂页面中强制使用。

## 7.4 `component_patterns`

设计方案不再复制业务文案，也不写完整 DOM。

使用上游 ID 引用：

```json
{
  "applies_to": [
    "inventory-setting",
    "freight-template",
    "shipping-setting"
  ],
  "component_pattern": "single-arrow-entry"
}
```

允许多个业务内容共享同一个设计模式，但必须保留完整 ID 引用。

## 7.5 组件映射和页面组合必须分开

以下内容不能再混在同一个 `component_mapping` 中：

- 单个业务内容使用什么组件；
- 多个业务内容如何组成分组；
- 页面整体使用什么区域结构。

至少拆分为：

- `component_patterns`；
- `region_composition`。

## 7.6 删除多义实现字段

不再使用一个字段同时承载：

- 变体值；
- DOM 路径；
- CSS 类；
- 状态类；
- 组合关系。

设计方案只表达设计模式、变体意图和正式规则引用。

---

## 8. 页面复杂度分级

不是所有页面都需要淘宝首页级别的设计结构。

建议分为：

### `simple`

适用于：

- 简单设置页；
- 单一表单；
- 基础详情页。

需要：

- 页面范式；
- 布局模式；
- 组件模式；
- 打开方式。

### `structured`

适用于：

- 多分组设置页；
- 管理列表；
- 多区块工作台。

增加：

- 分组结构；
- 区域组合；
- 信息优先级。

### `complex`

适用于：

- 首页；
- 内容流；
- 营销页；
- 类似淘宝首页的多模块页面。

增加：

- 首屏目标；
- 区域优先级；
- 内容密度；
- 滚动节奏；
- 固定、吸顶和连续内容关系；
- 视觉竞争控制。

---

## 9. 稳定 ID 规则

不要把所有对象都统一叫 `block_id`。

建议区分：

- `node_id`：流程节点；
- `surface_id`：界面承载节点；
- `content_id`：具体业务内容；
- `transition_id`：节点转移；
- `flow_id`：完整路径。

关系如下：

```text
flow
→ flow node
→ surface
→ content blocks
```

下游只能引用上游 ID，不得重新复制、合并或改写上游业务内容。

---

## 10. 模糊需求处理规则

需求不清晰时，不能一律停止，也不能让 AI 自行补全。

采用分级处理。

## 10.1 低风险、可逆问题

例如：

- 次要文案；
- 非核心默认值；
- 低影响空态；
- 可随时调整的局部细节。

处理方式：

- 允许合理假设；
- 继续设计和实现；
- 必须记录在 `assumptions`；
- 标记影响等级和可逆性。

## 10.2 影响核心流程的问题

例如：

- 发布成功后去哪里；
- 删除是否需要确认；
- 是否支持多选；
- 返回时草稿是否保留；
- 子流程是否需要真实实现。

处理方式：

- 必须进入 `open_questions`；
- 阻止受影响节点进入设计和实现；
- 不允许 AI 自行决定。

## 10.3 只影响局部流程的问题

处理方式：

- 已确认部分继续；
- 未确认节点标记为 `pending`；
- 根据情况设为 `stub` 或 `excluded`；
- 不阻塞整个任务。

## 10.4 readiness 状态

`interaction_spec` 必须输出：

- `ready`：关键流程、状态和结果明确；
- `ready-with-assumptions`：只有低风险可逆假设；
- `partially-ready`：主流程可继续，局部节点待确认；
- `blocked`：核心目标、流程或结果不清晰。

工作流规则：

- `ready`：正常进入设计；
- `ready-with-assumptions`：可进入设计，实现时保留假设记录；
- `partially-ready`：只处理已确认范围；
- `blocked`：停止进入 `wego-design`，先追问。

---

## 11. 轻量自动校验

不建设沉重的全量 Schema，但必须有关键守门。

至少检查：

1. 所有 ID 在各自类型内唯一；
2. Flow 引用的 Node 存在；
3. Node 引用的 Surface 存在；
4. Surface 引用的 Content 存在；
5. Transition 的 `from`、`to`、`return_to` 存在；
6. `design_plan` 只能引用 `interaction_spec` 中存在的对象；
7. 每个 `functional` 节点必须有设计覆盖；
8. `stub` 节点必须有明确反馈；
9. `blocked` 节点不得进入实现；
10. 设计计划不得新增业务流程和业务内容；
11. 实现中必须保留稳定节点标识；
12. 复杂页面必须存在区域编排；
13. 组件模式必须能追溯到正式设计系统来源；
14. 实现不得绕过设计计划自行二次设计。

---

## 12. 实现层标识要求

实现中需要保留上游稳定 ID，便于验收。

建议：

```html
<section data-surface-id="publish-main">
  <div data-content-id="product-title"></div>
</section>
```

路由和场景状态使用稳定 `route_id`。

不需要让 `wego-ux` 再生成一份新的映射规格。

---

## 13. 验收升级

`acceptance_report` 需要在现有页面、组件和路由检查之外增加：

```text
flow_coverage
transition_check
state_handoff_check
back_restore_check
prototype_boundary_check
end_to_end_paths
```

重点验收：

- 能否从真实入口进入；
- 主流程能否完整完成；
- 子页面选择后能否正确回填；
- 返回后下层页面和状态是否恢复；
- 取消、失败、中断是否符合规格；
- 成功后列表、摘要或宿主状态是否更新；
- 重复操作是否产生重复监听或脏状态；
- `stub` 是否按定义反馈；
- `excluded` 是否没有被误实现。

页面单独通过，不代表完整交互原型通过。

---

## 14. 不需要做的事情

本次重构不建议：

- 合并 `wego-design` 和 `wego-ux`；
- 为四个技能分别维护完整重复模型；
- 为每个字段增加大量工程属性；
- 让 `wego-design` 输出完整 DOM；
- 让 `wego-tests` 复制一套完整规格；
- 让所有页面都强制填写复杂区域模型；
- 因为一个局部问题不清楚就阻塞整个任务；
- 让 AI 自行补全高风险业务规则。

---

## 15. 实施优先级

建议按以下顺序实施：

### 第一阶段：重构产物和职责

1. `page_spec.json` 改为 `interaction_spec.json`；
2. `design_consumption_plan.json` 改为 `design_plan.json`；
3. 更新四个技能中的输入、输出和回退链路；
4. 更新 README、AGENTS、脚本和生成文档中的旧名称。

### 第二阶段：补齐完整原型能力

1. 增加 Flow、Node、Surface、Transition 和 Data Handoff；
2. 支持一个需求包含多个 route 和 overlay；
3. 增加原型实现边界；
4. 增加 readiness、assumptions 和 open_questions。

### 第三阶段：收缩 Design 越界

1. 删除完整 DOM 路径；
2. 删除 CSS 类拼装；
3. 拆分组件模式和区域组合；
4. 增加页面复杂度分级；
5. 保留正式规则来源追溯。

### 第四阶段：完善守门和验收

1. 增加跨文件 ID 引用校验；
2. 增加完整路径验收；
3. 增加状态回填和返回恢复检查；
4. 增加原型边界校验；
5. 使用现有真实场景做回归测试。

---

## 16. 兼容迁移与运行风险控制

当前仅新增本结论文档，不会影响 `wego-app` 运行、现有路由、页面交互或部署结果。真正实施重构时，不能一次性删除旧格式，否则会影响已有场景的迭代、设计消费、自动校验和验收。

### 16.1 迁移原则

1. 先增加新格式支持，再迁移已有场景；
2. 新旧格式在过渡期并行读取；
3. 新任务只生成新格式；
4. 已有场景逐个迁移并回归；
5. 所有场景迁移完成后，才删除旧格式支持；
6. 任一阶段不得破坏现有 `scene.js`、`scene.css`、路由和宿主运行。

### 16.2 兼容读取优先级

过渡期统一采用以下读取顺序：

```text
优先读取 interaction_spec.json
不存在时回退读取 page_spec.json

优先读取 design_plan.json
不存在时回退读取 design_consumption_plan.json
```

四个技能、校验脚本和生成脚本必须使用同一套兼容读取规则，不能各自判断。

### 16.3 分阶段实施计划

#### 阶段 A：建立兼容层

- 在 `wego-product`、`wego-design`、`wego-ux`、`wego-tests` 中加入新旧格式兼容读取；
- 更新规格发现逻辑，但不删除旧文件名；
- 更新校验脚本，使旧场景继续通过原有校验；
- 新增新格式基础校验；
- 验证现有全部场景无需迁移也能继续运行和验收。

#### 阶段 B：新任务切换到新格式

- `wego-product` 新任务只生成 `interaction_spec.json`；
- `wego-design` 新任务只生成 `design_plan.json`；
- `wego-ux` 和 `wego-tests` 同时支持新旧格式；
- 禁止同一场景同时维护两份语义不同的新旧规格；
- 若需要并存，旧文件只作为迁移来源，不再继续编辑。

#### 阶段 C：迁移真实场景

- 选择一个结构简单的真实场景作为首个迁移样本；
- 再选择一个多页面或多状态场景验证完整流程能力；
- 每迁移一个场景，都必须检查规格、设计、实现、路由和验收；
- 迁移前归档旧规格；
- 迁移完成后确认页面运行结果和交互行为没有回退；
- 不进行全仓一次性批量替换。

#### 阶段 D：移除旧格式

仅当满足以下条件时执行：

- 仓库内不存在仍依赖旧规格的有效场景；
- 四个技能已不再生成旧格式；
- 所有脚本、模板、README、AGENTS 和生成文档已切换；
- 全量规格校验通过；
- 全量场景回归通过；
- 本地直开和部署入口验证通过。

完成后才删除：

- `page_spec.json` 读取兼容；
- `design_consumption_plan.json` 读取兼容；
- 旧字段、旧示例和旧校验逻辑。

### 16.4 必须同步修改的范围

实施时至少检查并同步：

- `.codex/skills/wego-product/SKILL.md`；
- `.codex/skills/wego-design/SKILL.md`；
- `.codex/skills/wego-ux/SKILL.md`；
- `.codex/skills/wego-tests/SKILL.md`；
- `AGENTS.md`；
- 仓库 README 和技能路由说明；
- `scripts/specs.mjs`；
- `scripts/validate-wego-design.mjs`；
- 模板、示例、自动生成规范和同步矩阵；
- 已有场景 `_spec/` 目录；
- 任何硬编码旧文件名或旧字段的脚本。

### 16.5 运行影响边界

规格重构通常不会直接让已部署页面打不开，因为 `wego-app` 运行主要依赖：

- `scene.js`；
- `scene.css`；
- 路由注册；
- 宿主运行时。

但错误迁移会影响：

- 后续需求迭代；
- 设计计划生成；
- 偏差判定；
- 自动校验；
- 验收报告；
- 场景新增和修改。

因此，不能以“现有页面还能打开”作为迁移成功标准。

### 16.6 回归门禁

每个迁移阶段至少执行：

1. 规格文件存在性和解析检查；
2. 新旧格式兼容读取测试；
3. 跨文件 ID 引用检查；
4. `node scripts/specs.mjs check`；
5. `node scripts/specs.mjs test`；
6. `node scripts/validate-wego-design.mjs`；
7. 真实场景入口、路由、返回和交互回归；
8. `wego-app/index.html` 本地直开检查；
9. 无关已有场景不受影响检查。

未实际执行的命令不得报告为通过。

### 16.7 回滚策略

- 每个阶段使用独立分支或独立提交；
- 兼容层、技能修改、场景迁移分开提交；
- 迁移前保留旧规格归档；
- 发现新格式影响现有场景时，优先回滚当前迁移，不删除兼容层；
- 未完成全量迁移前，不允许删除旧读取能力；
- 回滚后必须恢复到现有场景可继续生成、实现和验收的状态。

### 16.8 迁移完成判定

只有同时满足以下条件，才能认定迁移完成：

- 新任务完整使用 `interaction_spec.json` 和 `design_plan.json`；
- 已有有效场景全部迁移或明确冻结；
- 四个技能职责和输入输出一致；
- 所有自动校验通过；
- 完整交互路径回归通过；
- 旧格式不再被任何有效流程读取；
- 删除旧兼容后再次执行全量回归仍通过。

---

## 17. 最终原则

1. 一次需求的核心对象是完整交互任务，不是单页面。
2. `interaction_spec` 定义事实、流程、状态和边界。
3. `design_plan` 定义这些流程如何被界面化。
4. `wego-ux` 只负责实现，不二次设计。
5. `wego-tests` 按完整用户路径验收。
6. 下游只能引用上游稳定 ID，不重新描述上游内容。
7. 低风险问题可带假设继续，高风险问题必须追问。
8. 局部不明确只阻塞局部，不阻塞整个任务。
9. 复杂页面增加区域编排，简单页面保持轻量。
10. 整个工作流目标是稳定输出可完整走通、可检查、可迭代的交互原型。
11. 重构必须采用兼容迁移，不能通过一次性替换破坏现有工作流。
