---
name: "wego-product"
description: 将原始中文业务需求转换为 page_spec 的产品理解技能。任何新页面、原型、场景或业务编辑任务，都必须先在这里确认目标、范围、状态、异常流程、宿主路径和交接条件。
---

# Wego Product

本文件是 `wego-product` 的唯一运行时权威入口。只负责把用户需求整理成可确认、可落盘、可交接的 `page_spec`；不提前选择 UI Kit、组件、布局或实现方式。

## 何时触发

- 用户提出新的业务页面、原型、场景、流程或业务编辑需求。
- 用户说“帮我做这个页面 / 原型 / 场景”，但当前场景还没有完整 `page_spec`。
- 已有场景发生内容范围、页面层级、业务状态、异常流程、宿主入口或打开目标变化。

不要误用：

- 已有完整且仍适用的 `page_spec`，只需要做设计系统消费：转入 `wego-design`。
- 只修改组件、Token、UI Kit、Preview、守门或工作流：转入 `wego-uxsystem-iterate`。
- 只修复不改变需求和交互模式的实现问题：先交给 `wego-ux` 做偏差判定。

## 输入与权威来源

按以下优先级理解需求：

1. 用户本轮明确表达的目标、限制和确认结果。
2. 当前业务场景已经落盘的 `_spec/page_spec.json`，仅用于同场景迭代对比，不得覆盖用户的新要求。
3. `AGENTS.md` 中跨技能仓库级硬约束。
4. 本文件中的产品理解、输出和交接规则。

`.codex/skills/wego-design/specs/*.md` 是自动生成的人工检查文档，不得读取、引用或用于补充业务需求。历史页面、UI Kit 示例、组件 Preview 和同类页面惯例也不能替用户发明字段、状态或流程。

## 核心规则

- 自动生成的 `specs/*.md` 不得作为运行时规则来源，也不得补充或改变用户需求。
- 页面信息、状态、异常流程和宿主路径只能来自用户需求、已有业务事实与本技能的结构化判断，不能凭模板或惯例发明。
- 影响页面范围、核心流程、数据含义、保存方式或宿主层级的关键歧义，必须在进入 `wego-design` 前得到用户确认。
- `page_spec` 只记录真实判断依据，使用 `rule_sources`，不得输出 `spec_refs` 或引用生成文档。
- 需求确认完成后必须先落盘 `page_spec` 再交接；没有落盘文件不得进入 `wego-design`。

## 工作流

1. 读取完整原始需求和已有场景上下文。
2. 判断任务类型与当前是否已有可复用 `page_spec`。
3. 提炼业务目标、用户动作、页面范围和完成标准。
4. 拆分页面角色、信息块、状态、异常流程和关键交互。
5. 判断 App 场景落点、宿主入口层级和稳定 `route_id`。
6. 区分已确认事实、合理结构化判断、待确认问题；不得把假设写成事实。
7. 向用户确认会改变核心结果的关键歧义。轻微文案或工程细节不阻塞确认。
8. 输出并落盘 `page_spec`，完成自检后交给下一技能。

## 需求确认门禁

以下任一项不清楚时，不得进入 `wego-design`：

- 页面要帮助谁完成什么业务动作。
- 本次包含哪些页面或页面片段，哪些明确不包含。
- 核心操作是即时生效、统一保存、只读查看还是选择后返回。
- 主要信息从哪里来、哪些字段必须展示或编辑。
- 成功、失败、空数据、禁用、中断或取消后应发生什么。
- 场景挂在哪个宿主 Tab、一级入口或二级入口。
- 同一业务场景是否复用已有目录和 `route_id`。

若用户已明确授权按最佳判断推进，可把非关键缺口记录到 `assumptions`，但不能擅自改变用户明确的产品要求。

## 信息提取原则

### 信息块

`information_blocks` 只描述业务需要呈现或操作的内容，不描述具体组件和视觉结构。

不得因为以下来源追加信息块：

- UI Kit 演示内容，例如摘要区、导航栏或示例说明。
- 同类页面惯例，例如“设置页通常有方案名称”。
- 组件 Preview 的结构或字段。
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
- `list_summary_fields`：只保留 1–2 条影响当前判断的摘要信息。
- `detail_fields`：完整地址、联系人、备注、配置明细和长文本等详情或编辑字段。
- `operation_fields`：新增、编辑、删除、启停、更多等动作，并标明高频、低频和危险操作。

字段只能来自用户需求或已有业务事实，不得为了匹配列表样式新增。

## 页面角色拆分

`page_surfaces` 用于描述任务中不同页面或页面片段的职责：

- `host-entry`：宿主页入口、摘要或结果回填区域。
- `primary-task-page`：承接核心业务操作的主页面。
- `secondary-task-page`：选择、创建、详情或补充设置等下钻页面。
- `result-summary`：保存后结果或只读摘要。

规则：

- 每个 `information_blocks[]` 至少被一个 surface 引用。
- surface 只描述职责、信息归属、状态和交互模式，不提前决定组件、布局或 UI Kit。
- 原始需求只有一个页面时，也必须有一个 `primary-task-page`。
- `host_container.needs_host_entry_surface = true` 时必须显式输出 `host-entry`。
- `leaf_level > 1` 时，`host-entry` 必须把父入口和子入口拆成独立信息块，并在 `purpose` 中说明视觉与导航从属关系，不能只靠层级数字推断。

## App 场景与宿主路径

所有业务页面默认落到固定静态 App：

- `app_target.mode = wego-app-scene`
- `app_target.app_root = wego-app`
- `app_target.scene_folder = wego-app/scenes/{中文业务场景}`
- `app_target.runtime_entry = scene.js`
- `app_target.route_mode = hash`

命名规则：

- 新场景目录使用中文业务语义命名。
- 同一业务场景迭代复用原目录，不因文案微调新建目录。
- `route_id` 使用稳定 kebab-case；同一路径迭代不得随意更换。
- 不在仓库根目录创建独立任务原型文件夹。

`host_container` 必须包含：

- `tab`：`my | workspace | dongtai | xiaoxi | haoyou`
- `entry_label`：一级入口名称。
- `subentry_label`：二级入口名称；一级页可为空字符串。
- `leaf_level`：`1 | 2 | 3`
- `entry_type`：`cell | grid-entry`
- `needs_host_entry_surface`：是否需要宿主页入口与结果回填。

如果任务挂在 `wego-app` 内，`app_target`、`host_container` 和 `route_id` 必须一起输出。

## 输出要求

必须输出 `page_spec`，至少包含：

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
      "source": "user-requirement | existing-page-spec | AGENTS.md | wego-product/SKILL.md",
      "supports": ["具体字段或判断"]
    }
  ],
  "delivery_hint": "next-step"
}
```

`component_intent` 只能表达信息块需要的能力，例如“互斥选择”“可编辑文本”“危险删除确认”，不能提前指定组件类或 DOM。

## 落盘规则

路径固定为：

`wego-app/scenes/{中文业务场景}/_spec/page_spec.json`

同一场景迭代时：

- 最新版本始终写入 `_spec/page_spec.json`。
- 覆盖前把上一版归档到 `_spec/archive/page_spec.{YYYYMMDD-HHmm}.json`。
- 已有目录继续复用，不重命名。

落盘前自检：

- 所有关键歧义已确认或明确记录为非关键假设。
- `information_blocks`、状态和异常流程没有来自模板或生成文档的虚构内容。
- 每个信息块都被 surface 承接。
- 宿主路径、`scene_folder` 和 `route_id` 完整且稳定。
- 没有组件、UI Kit、布局和视觉实现决策。
- `rule_sources` 能追溯每个关键判断，且不存在 `spec_refs`。

## 任务类型与交接

- `design-system-consumption`：落盘后交给 `wego-design`。
- `design-system-maintenance`：转入 `wego-uxsystem-iterate`，不得进入普通页面链路。
- `general-engineering`：按普通工程任务处理，不强制消费设计系统。

没有通过确认门禁和落盘自检时，不得交接。
