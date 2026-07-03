---
name: wego-product
description: 将原始中文业务需求转换为页面规格 page_spec 的产品理解技能。用于开始任何页面、原型、规则配置或业务编辑任务时，先判断 task_type、scene_category、interaction_mode、information_blocks 和 spec_refs，再决定是否进入 wego-design 技能的设计系统消费流程。
---

# Wego Product

先做需求理解，再做设计消费。

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
    "subentry_label": "宿主中的二级入口名称；一级页可为空字符串",
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

### 宿主挂载路径（固定宿主模板任务必填）

当任务需要挂在 `wego-ux` 的固定宿主模板中时，`page_spec` 必须额外输出：

- `host_container`
  - `tab`：固定五项 Tab 之一，枚举值 `my | workspace | dongtai | xiaoxi | haoyou`
  - `entry_label`：一级入口名称，例如 `设置`
  - `subentry_label`：二级入口名称；当前任务直接挂一级页时可为空字符串
  - `leaf_level`：当前目标页在宿主路径中的层级，使用 `1 | 2 | 3`
  - `entry_type`：入口承载方式，使用 `cell | grid-entry`
  - `needs_host_entry_surface`：是否需要宿主页入口与保存回填，固定宿主模板任务默认 `true`
- `route_id`
  - 用于稳定标识这条宿主挂载路径，例如 `my-settings-price-rule`
  - 同一任务内保持稳定；后续只要仍是同一入口路径，就不要因文案微调随意改动
  - 主要给 `wego-ux` 在同任务迭代时定位旧入口、避免重复插入

如果任务挂在固定宿主模板内，`route_id` 和 `host_container` 要一起输出；不能只写自然语言描述。

### 页面角色拆分（必填）

`page_surfaces` 用来把一个任务里的不同页面角色拆开，交给 `wego-design` 逐页判断 UI Kit/pagePattern 是否命中。常用角色：

- `host-entry`：宿主页、入口页、结果摘要页；通常只承接入口、摘要、状态回填，不等同业务编辑主页面
- `primary-task-page`：主要业务操作页；承接核心编辑、配置、选择或查看任务
- `secondary-task-page`：二级选择页、创建页、补充设置页；由主流程下钻打开
- `result-summary`：保存后结果、回填状态、只读摘要

规则：

- 每个 `information_blocks[]` 至少被一个 surface 引用；不要因为 UI Kit 示例或同类惯例新增信息块
- surface 只描述页面职责和信息块归属，不提前决定组件、页面结构或 UI Kit
- 如果原始需求只有一个页面，也要输出一个 `primary-task-page`
- 如果任务需要宿主页承接打开入口或保存回填，必须显式输出 `host-entry`，避免后续把宿主页误当成已命中的业务范式
- 如果声明了 `host_container.needs_host_entry_surface = true`，必须显式输出 `host-entry`

## 落盘规则（硬约束）

`page_spec` 必须落盘到任务文件夹，不允许只在对话上下文中存在：

- 路径：`{task-folder}/_spec/page_spec.json`
- 任务文件夹不存在时，先在仓库根目录创建 `{task-folder}/_spec/` 目录
- 新建 `{task-folder}` 必须使用中文业务语义命名；已有任务目录继续复用原名称，不重命名
- 同一任务迭代时复用原 `_spec/` 目录，按版本归档保留历史，便于回溯决策链路：
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
