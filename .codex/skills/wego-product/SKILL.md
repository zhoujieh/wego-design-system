---
name: wego-product
description: 将原始中文业务需求转换为页面规格 page_spec 的产品理解技能。用于开始任何页面、原型、规则配置或业务编辑任务时，先判断 task_type、scene_category、interaction_mode、information_blocks、宿主入口和 App 场景落点，再决定是否进入 wego-design 技能的设计系统消费流程。
---

# Wego Product

先做需求理解，再做设计消费。

## 何时必须触发本技能

- 用户给的是原始业务需求、页面需求、业务编辑需求、新场景需求
- 用户说“帮我做这个页面 / 原型 / 场景”，但还没有 `page_spec`
- 用户只描述业务目标，还没明确 UI Kit、组件映射和打开方式

不要误用场景:

- 已经有完整 `page_spec`，此时转入 `wego-design`
- 当前目标是改组件、改 UI Kit、补规则、修工作流，转入 `wego-uxsystem-iterate`

## 工作流

1. 读取原始需求
2. 判断任务类型
3. 判断页面场景
4. 拆出信息块和关键交互
5. 引用需要遵循的规范
6. 输出 `page_spec`

如果需求本身仍不完整，可以指出缺口；但不要提前生成页面结构或原型项目。

## 信息块提取原则

`information_blocks` **必须只从原始业务需求中提取**，不得因以下来源追加信息块：

- UI Kit 参考页的演示内容（如 biz-summary 摘要区、BottomNav 导航栏）
- 同类页面的惯例（如"所有设置页都有方案名称"）
- 组件预览页的结构

如果原始需求没有某个信息块，`page_spec` 就不能包含它。例如：用户只描述了三个规则 section，就不要自行追加"方案摘要区"。

## 输出要求

必须输出 `page_spec`，至少包含这些字段：

```json
{
  "task_type": "design-system-consumption | design-system-maintenance | general-engineering",
  "scene_category": "biz-rule-config | system-setting | list | detail | form-edit",
  "business_goal": "一句话说明页面要完成什么业务动作",
  "interaction_mode": "edit-then-save | instant-apply | view-only | select",
  "app_target": {
    "mode": "wego-app-scene",
    "app_root": "wego-app",
    "scene_folder": "wego-app/scenes/权限管理",
    "runtime_entry": "scene.js",
    "route_mode": "hash"
  },
  "information_blocks": [
    "按页面顺序列出信息块"
  ],
  "page_surfaces": [
    {
      "id": "host-entry",
      "role": "host-entry | primary-task-page | secondary-task-page | result-summary",
      "information_blocks": ["只引用本 surface 承接的信息块"],
      "interaction_mode": "edit-then-save | instant-apply | view-only | select",
      "purpose": "这个页面/页面片段在任务中的职责"
    }
  ],
  "host_container": {
    "tab": "my | workspace | dongtai | xiaoxi | haoyou",
    "entry_label": "宿主中的一级入口名称",
    "subentry_label": "宿主中的二级入口名称；一级页可为空字符串。leaf_level > 1 时必须配合 page_surfaces[host-entry] 结构化声明父子层级，不能只靠此字段",
    "leaf_level": 1,
    "entry_type": "cell | grid-entry",
    "needs_host_entry_surface": true
  },
  "route_id": "my-settings-price-rule",
  "component_intent": [
    "每个信息块希望承接什么组件能力"
  ],
  "spec_refs": {
    "copy": ".codex/skills/wego-design/specs/文案与数据规范.md",
    "layout": ".codex/skills/wego-design/specs/布局与间距规范.md",
    "interaction": ".codex/skills/wego-design/specs/交互设计原则.md",
    "visual": ".codex/skills/wego-design/specs/设计风格与品牌原则.md",
    "motion": ".codex/skills/wego-design/specs/动效与视觉效果.md"
  },
  "delivery_hint": "next-step"
}
```

> 注：`scene_folder` 使用中文业务语义命名；`route_id` 使用 kebab-case 稳定键。`leaf_level > 1` 时，`page_surfaces[host-entry]` 必须拆分父子入口信息块并在 `purpose` 中声明视觉从属，详见下方"宿主挂载路径"章节的"二级入口层级声明"。

### App 场景落点（必填）

所有业务需求默认落到固定静态 App：`wego-app/`。

- `app_target.mode` 固定为 `wego-app-scene`
- `app_target.app_root` 固定为 `wego-app`
- `app_target.scene_folder` 固定落在 `wego-app/scenes/{中文业务场景}/`
- `app_target.runtime_entry` 固定为 `scene.js`
- `app_target.route_mode` 固定为 `hash`

命名规则：

- 新场景目录必须使用中文业务语义命名，例如 `wego-app/scenes/权限管理/`、`wego-app/scenes/商品管理列表/`
- 同一业务场景迭代时复用原 `scene_folder`，不因文案微调新建目录
- `route_id` 是 App 内 hash route 的稳定键，例如 `my-permission-management`，对应 URL 形态为 `#/my-permission-management`
- 不再创建仓库根目录下的独立任务原型文件夹

### 宿主挂载路径（App 场景必填）

当任务需要挂在 `wego-app` 固定宿主中时，`page_spec` 必须额外输出：

- `host_container`
  - `tab`：固定五项 Tab 之一，枚举值 `my | workspace | dongtai | xiaoxi | haoyou`
  - `entry_label`：一级入口名称，例如 `设置`
  - `subentry_label`：二级入口名称；当前任务直接挂一级页时可为空字符串
  - `leaf_level`：当前目标页在宿主路径中的层级，使用 `1 | 2 | 3`
  - `entry_type`：入口承载方式，使用 `cell | grid-entry`
  - `needs_host_entry_surface`：是否需要宿主页入口与结果回填，App 场景默认 `true`
- `route_id`
  - 用于稳定标识这条宿主挂载路径，例如 `my-settings-price-rule`
  - 同一任务内保持稳定；后续只要仍是同一入口路径，就不要因文案微调随意改动
  - 主要给 `wego-ux` 在同场景迭代时定位旧入口、hash route 和 scene 注册，避免重复插入

如果任务挂在 `wego-app` 内，`route_id`、`host_container` 和 `app_target` 要一起输出；不能只写自然语言描述。

**二级入口层级声明（必读）**：当 `leaf_level > 1` 时，`host_container` 的 `entry_label`/`subentry_label`/`leaf_level` 只是数据字段，不足以让下游 wego-design/wego-ux 理解父子入口的页面层级关系。`page_surfaces[host-entry]` 必须结构化声明父子入口层级：

- `information_blocks` 必须把一级入口和二级入口拆成独立信息块，不能把整个路径塞进一条。例如：`"一级入口：设置（点击进入设置页）"`、`"二级入口：价格权限设置（挂在设置下，点击打开主任务页）"` 两条独立信息块
- `purpose` 必须明确说明"本入口是某一级入口下的二级入口，需要在宿主页中视觉从属展示（缩进或嵌套）"，不能只写"作为宿主中的入口承载"
- 不能只靠 `host_container.leaf_level` 数字让下游自行推断父子关系

### 页面角色拆分（必填）

`page_surfaces` 用来把一个任务里的不同页面角色拆开，交给 `wego-design` 逐页判断 UI Kit/pagePattern 是否命中。常用角色：

- `host-entry`：App 宿主页、入口页、结果摘要页；通常只承接入口、摘要、状态回填，不等同业务编辑主页面
- `primary-task-page`：主要业务操作页；承接核心编辑、配置、选择或查看任务
- `secondary-task-page`：二级选择页、创建页、补充设置页；由主流程下钻打开
- `result-summary`：保存后结果、回填状态、只读摘要

规则：

- 每个 `information_blocks[]` 至少被一个 surface 引用；不要因为 UI Kit 示例或同类惯例新增信息块
- surface 只描述页面职责和信息块归属，不提前决定组件、页面结构或 UI Kit
- 如果原始需求只有一个页面，也要输出一个 `primary-task-page`
- 如果任务需要 App 宿主页承接打开入口或结果回填，必须显式输出 `host-entry`，避免后续把宿主页误当成已命中的业务范式
- 如果声明了 `host_container.needs_host_entry_surface = true`，必须显式输出 `host-entry`
- 当 `host_container.leaf_level > 1` 时，`host-entry` surface 必须在 `information_blocks` 和 `purpose` 中明确声明父子入口层级关系（见"宿主挂载路径"章节的"二级入口层级声明"），否则下游 wego-ux 会把二级入口与一级入口 DOM 平级排列

## 落盘规则（硬约束）

`page_spec` 必须落盘到 App 场景目录，不允许只在对话上下文中存在：

- 路径：`wego-app/scenes/{中文业务场景}/_spec/page_spec.json`
- 场景目录不存在时，先创建 `wego-app/scenes/{中文业务场景}/_spec/`
- 新建 `{中文业务场景}` 必须使用中文业务语义命名；已有场景目录继续复用原名称，不重命名
- 同一业务场景迭代时复用原 `_spec/` 目录，按版本归档保留历史，便于回溯决策链路：
  - 最新版本始终写入 `_spec/page_spec.json`
  - 每次迭代时把上一版复制为 `_spec/archive/page_spec.{YYYYMMDD-HHmm}.json`
- `wego-design`、`wego-ux`、`wego-tests` 都通过读取该文件确认前置条件已满足

## 任务类型判断

- `design-system-consumption`
  用现有 `wego-design` Token、组件、UI Kit 去完成页面或模块
- `design-system-maintenance`
  修改设计系统本体，例如 Token、组件、UI Kit、规范、消费契约
- `general-engineering`
  与当前设计系统无强约束的普通工程实现

## 场景判断

优先区分下面两类：

- `biz-rule-config`
  业务规则配置、业务参数编辑、权限管理、库存/发货规则、业务数据编辑
- `system-setting`
  系统偏好、平台能力开关、即时生效设置

判断时重点看：

- 是否是业务对象本身的规则或数据编辑
- 是否需要统一保存后生效
- 是否属于平台层通用偏好

## 规范引用原则

- 只输出 `spec_refs`
- 不在技能里复制完整规范正文
- 文案、布局、交互、视觉的详细规则都交给 `wego-design/specs/*.md`

## 交接规则

- `task_type = design-system-consumption` 时，把 `page_spec` 交给 `wego-design`
- `task_type = design-system-maintenance` 时，转入设计系统维护任务
- `task_type = general-engineering` 时，不强行走设计系统消费链路
