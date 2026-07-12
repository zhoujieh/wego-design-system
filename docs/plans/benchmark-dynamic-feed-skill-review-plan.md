# 动态商品流 Benchmark Skill 审查与 Design 回归方案

> 历史归档文档（不参与当前技能、规则或运行时判断）：本文记录的是重构前的审查过程，其中的 `wego-ux`、`wego-tests`、`design_plan` 与 `specs` 路径均已删除。当前唯一权威来源是 `AGENTS.md`、`.codex/skills/README.md` 与各现行 `SKILL.md`。

## 背景

本次会话围绕 `docs/benchmark/002-动态商品流.md` 对当前生成结果进行了 Skill 级审查，目标不是修复单个页面，而是找出会重复影响未来页面生成的通用问题，并判断是否应参考 `wego-design` 最早版本中“AI 如何消费设计系统”的方案来重构当前设计消费链路。

审查对象包括：

- Benchmark 需求：`docs/benchmark/002-动态商品流.md`
- 当前生成结果：
  - `wego-app/scenes/动态商品流/_spec/interaction_spec.json`
  - `wego-app/scenes/动态商品流/_spec/design_plan.json`
  - `wego-app/scenes/动态商品流/scene.js`
  - `wego-app/scenes/动态商品流/scene.css`
- 当前 Skill 与规则：
  - `.codex/skills/wego-design/SKILL.md`
  - `.codex/skills/wego-design/references/design-decisions.md`
  - `.codex/skills/wego-design/references/design-plan.md`
  - `.codex/skills/wego-design/uikit-plan.json`
  - `.codex/skills/wego-ux/references/interaction-implementation.md`
  - `.codex/skills/wego-tests/references/acceptance-checks.md`
  - `scripts/iteration-record.mjs`
  - `scripts/validate-wego-design-core.mjs`

## 本次审查的核心结论

### 1. 当前问题主要不在“单页实现质量”，而在 Skill 主链路变碎

当前 `wego-design` 保留了很多后续增强能力，比如：

- `interaction_spec → design_plan → implementation` 主链路
- `layout_contract` 等可结构化传递的设计约束
- `validate-wego-design`、`iteration-record` 等守门闭环

但最早版本中“AI 如何消费设计系统”的主线已经被拆散到多个文件和多个抽象层，导致模型容易出现：

- 知道很多规则，但不知道先用哪条
- `design_plan` 表面命中设计系统，但实现没有真实消费
- 出现导览文案、原型提示、解释性说明等任务外内容
- 对连续内容流这类复杂页面，虽然有 blueprint，但下游消费不够硬

### 2. Benchmark 暴露出的通用问题有 5 类

#### 问题 A：任务外说明层过度生成

现象：

- 首屏自动生成总览卡、导览文案、标签说明
- 页面增加“刷新说明”
- toast 直接告诉用户“当前为静态原型”或“原型中以 toast 模拟”

为什么是问题：

- 连续内容流页面应直接服务浏览任务
- 这类说明会推迟用户进入主任务
- 违反“页面文案只表达业务信息、状态和动作”的正式要求

根本原因：

- 模型在信息不确定时，倾向先补“导览层/说明层”
- 当前 `continuous-content-feed-page` 对这类行为限制不够硬

归类：

- `AI Rules`

范围：

- 通用问题，会影响其他连续内容流页面

#### 问题 B：可选内容缺失时，模型会补解释文案，而不是折叠结构

现象：

- 正文为空时，页面补“本条动态未填写文字说明”
- 详情页补“店主只发布了商品信息”等解释文案

为什么是问题：

- 需求只要求“空内容时布局稳定”
- 不要求显式告诉用户“这里没有文案”
- 这会制造噪音，破坏扫读节奏

根本原因：

- 规则没有把“可选块为空时默认折叠”明确成通用实现策略

归类：

- `Design Principles`

范围：

- 通用问题，会影响所有带可选区块的页面

#### 问题 C：设计层声明消费正式组件，但实现层仍在发明业务壳组件

现象：

- `design_plan.surface_designs` 声明命中了 `navbar/avatar/card/metric/tag/link/button/actionsheet`
- 运行时主体仍是 `.dynamic-post`、`.dynamic-product-card`、`.dynamic-detail-section`、`.dynamic-icon-button` 等自造结构

为什么是问题：

- 这会让“命中设计系统”停留在文档层
- 实现层仍可绕过正式组件 anatomy
- 后续验收也容易失真

根本原因：

- 当前工作流只检查 plan 有没有写组件引用
- 没有检查实现是否真的消费对应正式结构

归类：

- `Components`

范围：

- 通用问题，会影响大多数页面

#### 问题 D：`layout_contract` 已结构化，但仍不够可执行

现象：

- `design_plan` 已声明 `page_edge_mode=M8`、`media_priority=supporting`
- 但实现仍然可能落成明显卡片化内容流、较大的单图比例和偏强的媒体存在感
- 当前守门仍然可以通过

为什么是问题：

- 说明 `layout_contract` 还只是方向性约束
- 还没有形成足够硬的实现和验收闭环

根本原因：

- 结构化字段还不够下游可消费
- 验收也只校验“有这个字段”，没有校验“真正消费到了什么程度”

归类：

- `Workflow`

范围：

- 通用问题，会影响所有连续内容流页面

#### 问题 E：规格追踪仍然是符号化，不是可验证闭环

现象：

- `iteration.json.traceability[].implementation_refs` 使用了语义化锚点，如 `#registerFeedScene`、`#feed-layout`
- 这些引用并不会被脚本验证是否真实存在
- 规格内容和实际文案也可能不完全一致，但状态仍可推进到 `implemented`

为什么是问题：

- 有 traceability 不等于可验收
- 这会让“规格-设计-实现”闭环流于形式

根本原因：

- 当前脚本只校验追踪字段非空
- 不校验引用可解析性和关键语义对齐

归类：

- `Workflow`

范围：

- 通用问题，会影响所有页面

## 通用优化建议

### 建议新增的规则

#### 规则 1：可选内容缺失时默认折叠结构

建议修改文件：

- `.codex/skills/wego-ux/references/interaction-implementation.md`

为什么改这里最合理：

- 这是实现层规则源
- 最适合规定“缺内容时怎么落地”

建议规则方向：

- 当正文、说明、补充文案、附加图片区等属于可选信息时，默认折叠对应结构
- 只有“缺失本身是业务状态”时，才允许显示状态文案
- 不自动补“未填写/暂无/仅发布了商品信息”这类解释性 helper

是否与现有规则重复或冲突：

- 不冲突
- 是对连续内容流和页面文案规则的下游实现化

是否能提升所有页面：

- 能

#### 规则 2：禁止生成任务外导览层和原型说明层

建议修改文件：

- `.codex/skills/wego-design/uikit-plan.json`

为什么改这里最合理：

- `continuous-content-feed-page` 是连续内容流的正式 blueprint
- 应在 blueprint 层直接约束首屏不允许出现的说明性结构

建议规则方向：

- 禁止默认生成总览卡、导览卡、浏览说明、刷新说明、原型说明、面向评审文案
- 页面首屏只表达业务对象、状态、动作和任务直接相关摘要

是否与现有规则重复或冲突：

- 是对现有“页面首屏文案必须直接服务用户任务”的强化
- 不冲突

是否能提升所有页面：

- 能，尤其是内容流和列表页

#### 规则 3：实现层必须真实消费正式组件结构

建议修改文件：

- `.codex/skills/wego-ux/references/interaction-implementation.md`
- `scripts/validate-wego-design-core.mjs`

为什么改这里最合理：

- 前者定义实现义务
- 后者负责把义务变成守门

建议规则方向：

- 当 `design_plan.surface_designs/component_mapping` 已声明消费正式组件时，实现层必须能追溯到对应正式 anatomy 或稳定变体
- 不允许只在 `design_plan` 里写命中组件，代码里却完全以自造业务壳实现

是否与现有规则重复或冲突：

- 不重复
- 当前只有设计层声明，没有实现层硬校验

是否能提升所有页面：

- 能

#### 规则 4：追踪引用必须可解析

建议修改文件：

- `scripts/iteration-record.mjs`
- `.codex/skills/wego-tests/references/acceptance-checks.md`

为什么改这里最合理：

- `iteration-record.mjs` 是状态推进门禁
- 验收清单负责定义“通过”的具体标准

建议规则方向：

- `spec_refs/design_refs/implementation_refs` 必须是可解析路径
- 若使用锚点，必须存在明确命名规则或解析机制
- 不允许只写语义标签占位

是否与现有规则重复或冲突：

- 不冲突
- 现有规则只要求非空，没有真实性校验

是否能提升所有页面：

- 能

### 建议修改的规则

#### 规则 5：强化连续内容流的 `layout_contract`

建议修改文件：

- `.codex/skills/wego-design/uikit-plan.json`
- `.codex/skills/wego-tests/references/acceptance-checks.md`

为什么改这里最合理：

- 契约源头在 blueprint
- 验收闭环在 `wego-tests`

建议规则方向：

- `page_edge_mode` 不只输出结论，还要增加下游可消费的结构化判断依据
- `media_priority=supporting` 不只写说明，还要有更明确的实现/验收约束
- 让 `wego-ux` 和 `wego-tests` 能判断是否真的避免了“媒体压过文字和对象摘要”

是否与现有规则重复或冲突：

- 不冲突
- 是把已存在的 promoted 经验继续做实

是否能提升所有页面：

- 能，主要提升连续内容流页面

## 不建议写规则的问题

以下问题更适合交给模型推理，不建议沉淀成长期规则：

- 商品详情页具体应该外露“立即下单 / 联系店主 / 转发客户”中的哪一个动作
- 示例数据该选哪类商品、哪类标签、哪类文案风格

原因：

- 这类内容强依赖业务语境
- 沉淀成规则容易变成僵化模板

## 关于是否参考最早版本重新优化 `wego-design`

### 结论

可以参考，而且值得参考，但不建议“整包回退到最早版本”。

最合理的方式是：

- 回归最早版本的“单主线消费模型”
- 保留现在的结构化闭环能力
- 重整信息架构，而不是回退旧字段格式

### 最早版本的核心价值

最早版本的 `wego-design` 有几个明显优点：

1. 明确只负责“设计系统消费”
2. 有固定读取顺序
3. 有单一输出物
4. 有清楚的禁止事项

这使得模型更容易沿一条路径完成：

- 读什么
- 先判断什么
- 最后产出什么

### 当前版本的主要问题

当前版本不是能力不足，而是主线变碎了：

- `SKILL.md` 太薄，只剩边界说明
- 决策流程散在 `design-decisions.md / design-plan.md / uikit-plan.json / specs`
- 后期增强能力保留了，但“AI 应该如何一路消费这些能力”没有保持单主线

### 推荐的回归式优化方案

#### 方案 1：恢复 `SKILL.md` 的单入口消费说明

建议优先重建：

- 输入前提
- 固定读取顺序
- 输出主干
- 禁止事项

注意：

- 不回退到旧的 `design_consumption_plan`
- 仍保持现在的 `prototype_design / design_plan`

#### 方案 2：把当前规则重组为“主决策层 + 支撑细则层”

建议职责分工：

- `SKILL.md`：消费主流程
- `references/design-decisions.md`：判断顺序与回退条件
- `references/design-plan.md`：输出结构
- `uikit-plan.json`：蓝图、契约、组件和可机器消费字段

目标：

- 减少重复说明
- 降低模型在多个规则源之间跳转的成本

#### 方案 3：用早期“单一输出思路”整理当前 `design_plan`

建议把 `design_plan` 的主干收紧为固定链路：

1. 命中什么 pattern / blueprint
2. 为什么命中
3. 页面承载方式
4. 区域结构
5. 组件映射
6. 实现约束

目标：

- 保留现有结构化字段
- 恢复早期那种“一眼能看懂设计消费结果”的可读性

#### 方案 4：把“组件消费真实性”补成硬闭环

建议形成完整链路：

- `SKILL.md` 先讲清
- `design-decisions.md` 限制自由组合边界
- `validate-wego-design-core.mjs` 增加守门

这样可以直接解决本次 Benchmark 中“plan 里说用了组件，代码里还是自造壳”的问题。

#### 方案 5：把连续内容流等后期增强能力挂回主线

建议原则：

- 不把后期增强当补丁规则堆积
- 要纳入同一条消费链：
  - 先判断是否命中 blueprint
  - 再输出必须消费的结构化契约
  - 最后由 `wego-ux` 和 `wego-tests` 接力验证

## 建议的后续改造顺序

1. `.codex/skills/wego-design/SKILL.md`
   - 重建单主线消费说明

2. `.codex/skills/wego-design/references/design-decisions.md`
   - 收敛判断顺序

3. `.codex/skills/wego-design/references/design-plan.md`
   - 固定 `design_plan` 主干

4. `.codex/skills/wego-design/uikit-plan.json`
   - 保留结构化成果，按主线重新梳理字段优先级

5. `scripts/validate-wego-design-core.mjs`
   - 把上面几步真正落成守门

## 最终判断

本次会话的最终共识是：

- 未来应优先优化 Skill，而不是针对当前页面继续加特例
- `wego-design` 确实应该参考最早版本的消费方式重新整理
- 但应回归“认知结构”，不应回退“旧输出格式”
- 后续改造应先整理信息架构，再修改具体规则内容，否则会继续越修越碎
