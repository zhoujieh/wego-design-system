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

## 落盘规则（硬约束）

`page_spec` 必须落盘到任务文件夹，不允许只在对话上下文中存在：

- 路径：`{task-folder}/_spec/page_spec.json`
- 任务文件夹不存在时，先在仓库根目录创建 `{task-folder}/_spec/` 目录
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
