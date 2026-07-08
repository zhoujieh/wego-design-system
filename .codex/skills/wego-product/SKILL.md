---
name: "wego-product"
description: 将原始中文业务需求转换为 interaction_spec 的产品理解技能。任何新页面、原型、场景或业务编辑任务，都必须先在这里确认目标、范围、状态、异常流程、宿主路径和交接条件。
---

# Wego Product

本文件是 `wego-product` 的唯一运行时权威入口。只负责把用户需求整理成可确认、可落盘、可交接的 `interaction_spec`；不提前选择 UI Kit、组件、布局或实现方式。

## 何时触发

- 用户提出新的业务页面、原型、场景、流程或业务编辑需求。
- 用户说“帮我做这个页面 / 原型 / 场景”，但当前场景还没有完整 `interaction_spec`。
- 已有场景发生内容范围、页面层级、业务状态、异常流程、宿主入口或打开目标变化。

不要误用：

- 已有完整且仍适用的 `interaction_spec`，只需要做设计系统消费：转入 `wego-design`。
- 只修改组件、Token、UI Kit、Preview、守门或工作流：转入 `wego-uxsystem-iterate`。
- 只修复不改变需求和交互模式的实现问题：先交给 `wego-ux` 做偏差判定。

## 输入与权威来源

按以下优先级理解需求：

1. 用户本轮明确表达的目标、限制和确认结果。
2. 当前业务场景已经落盘的 `_spec/interaction_spec.json`，仅用于同场景迭代对比，不得覆盖用户的新要求。
3. `AGENTS.md` 中跨技能仓库级硬约束。
4. 本文件中的产品理解、输出和交接规则。

`.codex/skills/wego-design/specs/*.md` 是自动生成的人工检查文档，不得读取、引用或用于补充业务需求。历史页面、UI Kit 示例、组件 Preview 和同类页面惯例也不能替用户发明字段、状态或流程。

## 核心规则

- 自动生成的 `specs/*.md` 不得作为运行时规则来源，也不得补充或改变用户需求。
- 页面信息、状态、异常流程和宿主路径只能来自用户需求、已有业务事实与本技能的结构化判断，不能凭模板或惯例发明。
- 影响页面范围、核心流程、数据含义、保存方式或宿主层级的关键歧义，必须在进入 `wego-design` 前得到用户确认。
- `interaction_spec` 只记录真实判断依据，使用 `rule_sources`，不得输出 `spec_refs` 或引用生成文档。
- 需求确认完成后必须先落盘 `interaction_spec` 再交接；没有落盘文件不得进入 `wego-design`。

## 工作流

1. 读取完整原始需求和已有场景上下文。
2. 判断任务类型与当前是否已有可复用 `interaction_spec`。
3. 提炼业务目标、用户动作、页面范围和完成标准。
4. 拆分页面角色、信息块、状态、异常流程和关键交互。
5. 判断 App 场景落点、宿主入口层级和稳定 `route_id`。
6. 区分已确认事实、合理结构化判断、待确认问题；不得把假设写成事实。
7. 向用户确认会改变核心结果的关键歧义。轻微文案或工程细节不阻塞确认。
8. 输出并落盘 `interaction_spec`，完成自检后交给下一技能。

## 需求确认门禁

以下任一项不清楚时，不得进入 `wego-design`：

- 页面要帮助谁完成什么业务动作。
- 本次包含哪些页面或页面片段，哪些明确不包含。
- 核心操作是即时生效、统一保存、只读查看还是选择后返回。
- 主要信息从哪里来、哪些字段必须展示或编辑。
- 成功、失败、空数据、禁用、中断或取消后应发生什么。
- 场景挂在哪个宿主 Tab、一级入口或二级入口。
- 同一业务场景是否复用已有目录和 `route_id`。

若用户已明确授权按最佳判断推进，可把非关键缺口记录到 `assumptions`，但不能擅自改变用户明确的产品要求。

## 信息提取原则

### 信息块

`information_blocks` 只描述业务需要呈现或操作的内容，不描述具体组件和视觉结构。

不得因为以下来源追加信息块：

- UI Kit 演示内容，例如摘要区、导航栏或示例说明。
- 同类页面惯例，例如“设置页通常有方案名称”。
- 组件 Preview 的结构或字段。
- 为了让页面更丰富而补充的业务内容。

每个信息块应说明：

- 业务内容是什么。
- 用户为什么需要它。
- 是否可编辑、可选择、可删除或只读。
- 对应的关键状态与异常情况。

### 状态和异常流程

按需求必要性识别：

- 初始态、已有数据态、空态。
- 编辑态、禁用态、加载态。
- 保存成功、保存失败、删除确认、取消或返回。
- 重复输入、无效输入、超长内容、权限不足或数据冲突。

只记录业务上真实需要的状态，不机械补齐所有状态枚举。

### 对象管理列表字段分级

当需求是仓库、商品、员工、客户、门店等业务对象列表，且包含新增、编辑、删除、启停或进入详情时，必须先做字段分级：

- `list_required_fields`：列表识别对象和关键状态所必需的字段。
- `list_summary_fields`：只保留 1–2 条影响当前判断的摘要信息。
- `detail_fields`：完整地址、联系人、备注、配置明细和长文本等详情或编辑字段。
- `operation_fields`：新增、编辑、删除、启停、更多等动作，并标明高频、低频和危险操作。

字段只能来自用户需求或已有业务事实，不得为了匹配列表样式新增。

## 页面角色拆分

为了兼容旧版本，本技能仍允许在 `interaction_spec` 中使用 `page_surfaces` 字段，但推荐在新规范下使用 `surfaces` 字段。二者含义一致：描述任务中不同界面承载的职责，不提前决定组件、布局或 UI Kit。

`page_surfaces`/`surfaces` 包含以下角色：

- `host-entry`：宿主页入口、摘要或结果回填区域。
- `primary-task-page`：承接核心业务操作的主页面。
- `secondary-task-page`：选择、创建、详情或补充设置等下钻页面。
- `result-summary`：保存后结果或只读摘要。

规则：

- 每个 `information_blocks[]` 至少被一个 surface 引用。
- surface 只描述职责、信息归属、状态和交互模式，不提前决定组件、布局或 UI Kit。
- 原始需求只有一个页面时，也必须有一个 `primary-task-page`。
- `host_container.needs_host_entry_surface = true` 时必须显式输出 `host-entry`。
- `leaf_level > 1` 时，`host-entry` 必须把父入口和子入口拆成独立信息块，并在 `purpose` 中说明视觉与导航从属关系，不能只靠层级数字推断。

## App 场景与宿主路径

所有业务页面默认落到固定静态 App：

- `app_target.mode = wego-app-scene`
- `app_target.app_root = wego-app`
- `app_target.scene_folder = wego-app/scenes/{中文业务场景}`
- `app_target.runtime_entry = scene.js`
- `app_target.route_mode = hash`

命名规则：

- 新场景目录使用中文业务语义命名。
- 同一业务场景迭代复用原目录，不因文案微调新建目录。
- `route_id` 使用稳定 kebab-case；同一路径迭代不得随意更换。
- 不在仓库根目录创建独立任务原型文件夹。

`host_container` 必须包含：

- `tab`：`my | workspace | dongtai | xiaoxi | haoyou`
- `entry_label`：一级入口名称。
- `subentry_label`：二级入口名称；一级页可为空字符串。
- `leaf_level`：`1 | 2 | 3`
- `entry_type`：`cell | grid-entry`
- `needs_host_entry_surface`：是否需要宿主页入口与结果回填。

如果任务挂在 `wego-app` 内，`app_target`、`host_container` 和 `route_id` 必须一起输出。

## 输出要求

必须输出 `interaction_spec`，至少包含下列基础字段。老版本的示例结构仍然提供，用于帮助理解现有场景，但推荐使用后续“Stage 2 扩展规范”中的新字段和结构：

```json
{
  "task_type": "design-system-consumption | design-system-maintenance | general-engineering",
  "scene_category": "biz-rule-config | system-setting | list | detail | form-edit | other",
  "business_goal": "一句话说明用户要完成的业务动作",
  "scope": {
    "included": [],
    "excluded": []
  },
  "interaction_mode": "edit-then-save | instant-apply | view-only | select",
  "app_target": {
    "mode": "wego-app-scene",
    "app_root": "wego-app",
    "scene_folder": "wego-app/scenes/权限管理",
    "runtime_entry": "scene.js",
    "route_mode": "hash"
  },
  "information_blocks": [],
  "states": [],
  "edge_cases": [],
  "page_surfaces": [
    {
      "id": "primary-task-page",
      "role": "host-entry | primary-task-page | secondary-task-page | result-summary",
      "information_blocks": [],
      "interaction_mode": "edit-then-save | instant-apply | view-only | select",
      "purpose": "页面职责",
      "states": []
    }
  ],
  "host_container": {
    "tab": "my | workspace | dongtai | xiaoxi | haoyou",
    "entry_label": "",
    "subentry_label": "",
    "leaf_level": 1,
    "entry_type": "cell | grid-entry",
    "needs_host_entry_surface": true
  },
  "route_id": "my-permission-management",
  "component_intent": [],
  "assumptions": [],
  "open_questions": [],
  "rule_sources": [
    {
      "source": "user-requirement | existing-interaction-spec | AGENTS.md | wego-product/SKILL.md",
      "supports": ["具体字段或判断"]
    }
  ],
  "delivery_hint": "next-step"
}
```

`component_intent` 只能表达信息块需要的能力，例如“互斥选择”“可编辑文本”“危险删除确认”，不能提前指定组件类或 DOM。

## Stage 2：交互规格扩展

为支持复杂任务路径、完整用户旅程和可验证原型，`interaction_spec` 需要新增几个核心概念和结构。这一阶段的扩展不影响旧字段的兼容性，但鼓励在新场景中全面使用。

### 推荐整体结构

根据《交互原型工作流重构结论》，新版 `interaction_spec` 推荐以下结构层次【108†L54-L74】：

```text
interaction_spec
├── goal                # 总体业务目标
├── scope               # 包含和排除的业务范围
├── actors             # 参与者角色
├── entry_points        # 入口说明
├── flows               # 完整任务路径列表
├── flow_nodes          # 任务节点定义
├── surfaces            # 界面承载节点
├── content_blocks      # 业务内容块
├── states              # 共用状态定义
├── transitions         # 节点转移关系
├── data_handoffs       # 跨界面数据传递关系
├── exit_results        # 任务完成后的结果
├── prototype_boundaries # 原型实现深度
├── assumptions         # 合理假设
├── open_questions      # 待确认问题
└── readiness           # 任务 readiness 评估
```

#### flows

`flows` 定义完整的任务路径，可以包含主流程、分支流程、异常流程以及中断和恢复流程【109†L52-L64】。每个流程使用稳定 `flow_id`，并描述起点、关键节点序列和完成条件。

#### flow_nodes

`flow_nodes` 定义交互过程中的业务节点，例如“进入发布入口”“编辑产品信息”“选择分类”等【109†L5-L17】。每个节点必须有稳定 `node_id`，并声明需要的输入内容、预期输出和关键状态。

#### surfaces

`surfaces` 替代旧的 `page_surfaces`，表示流程节点的界面承载【109†L18-L33】。Surface 不等同于页面，它可以是宿主页的一部分、独立页面、Sheet、Modal、Dialog、内联区域或结果界面等。每个 surface 使用稳定 `surface_id`，并声明其承担的节点、承载方式以及交互模式。

#### content_blocks

`content_blocks` 取代旧的 `information_blocks`，用于定义具体业务内容和交互意图【109†L34-L50】。每个内容块包含 `content_id`、描述、业务分组、交互类型（例如 `toggle`、`input` 等）以及默认状态，不出现组件名称或 DOM 结构。

#### transitions

`transitions` 必须明确节点之间的关系【109†L52-L69】。每个转移包含 `transition_id`、来源节点 `from`、触发条件 `trigger`、目标节点 `to`、传入数据 `data_in`、输出结果 `result_out` 以及回流目标 `return_to`。转移只描述业务意图，不提前决定使用 push、sheet 还是 modal。

#### data_handoffs

`data_handoffs` 定义跨页面或跨 surface 的数据交接，例如子页面返回什么、回填到哪里、返回后更新什么状态、成功后是否重置、取消后是否保留草稿等【109†L70-L79】。

#### prototype_boundaries

每个流程节点应明确原型实现深度【109†L82-L90】：

- `functional`：需要真实可操作并完成状态变化。
- `simulated`：使用本地模拟数据走完整流程。
- `stub`：只提供入口和明确反馈。
- `excluded`：本次不包含。

该字段用于控制原型范围，避免过度实现或过度简化。

#### assumptions、open_questions 与 readiness

保持旧版字段 `assumptions` 和 `open_questions`，用于记录合理假设和待确认问题。新增字段 `readiness` 用于综合评估任务是否准备好进入下游设计阶段，可采用枚举值如 `blocked`、`needs-clarification`、`ready` 等，并指出原因。

### 多路由与原型目标

复杂交互往往需要多个路由、多个 overlay 层和宿主页入口【110†L1-L27】。新版 `interaction_spec` 推荐使用 `prototype_target` 对象替代单一 `route_id`：

```json
{
  "prototype_target": {
    "app_root": "wego-app",
    "scenario_folder": "wego-app/scenes/发布产品",
    "routes": [
      { "id": "product-publish", "surface_ref": "publish-main" },
      { "id": "product-category-select", "surface_ref": "category-select" }
    ]
  }
}
```

`routes[]` 允许定义多个 route，每个 route 绑定到具体的 `surface_ref`。不是所有 surface 都必须是独立 route，具体承载方式由 `wego-design` 决定。

### 稳定 ID 规则

为了避免含糊不清的 `block_id`，新版规范建议按照不同对象类型使用不同 ID【112†L43-L53】：

- `flow_id`：完整任务路径。
- `node_id`：流程节点。
- `surface_id`：界面承载节点。
- `content_id`：业务内容块。
- `transition_id`：节点转移关系。

下游只能引用上游 ID，不得重新复制、合并或改写上游业务内容【112†L55-L63】。

### 兼容性与迁移

为了平滑过渡，现有场景仍允许保留旧字段 `page_surfaces`、`information_blocks`、`route_id` 等。系统读取时应优先尝试新字段，若不存在则回退到旧字段。新任务必须使用上述扩展字段，以便支持完整流程和原型验证。

## 落盘规则

路径固定为：

`wego-app/scenes/{中文业务场景}/_spec/interaction_spec.json`

同一场景迭代时：

- 最新版本始终写入 `_spec/interaction_spec.json`。
- 覆盖前把上一版归档到 `_spec/archive/interaction_spec.{YYYYMMDD-HHmm}.json`。
- 已有目录继续复用，不重命名。

落盘前自检：

- 所有关键歧义已确认或明确记录为非关键假设。
- `content_blocks`（或旧字段 `information_blocks`）、状态和异常流程没有来自模板或生成文档的虚构内容。
- 每个内容块都由某个 surface 承接。
- 宿主路径、`scene_folder` 和 `prototype_target.routes[]` （或 `route_id`）完整且稳定。
- 没有组件、UI Kit、布局和视觉实现决策。
- `rule_sources` 能追溯每个关键判断，且不存在 `spec_refs`。

## 任务类型与交接

- `design-system-consumption`：落盘后交给 `wego-design`。
- `design-system-maintenance`：转入 `wego-uxsystem-iterate`，不得进入普通页面链路。
- `general-engineering`：按普通工程任务处理，不强制消费设计系统。

没有通过确认门禁和落盘自检时，不得交接.
