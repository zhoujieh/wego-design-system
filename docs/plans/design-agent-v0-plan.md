# Design Agent V0 验证计划

> 状态：已确认启动
> 日期：2026-09-04
> 定位：通用 Design Agent 产品；微购是第一个真实用户与验证项目，不是产品本体。

## 1. 目标

V0 不以“搭建完整 Design Agent Platform”为目标，只验证一个核心问题：

> 基于真实产品上下文、正式组件和设计判断约束的 Design Agent，能否比当前 `wego-design-system + Codex` 工作流更懂产品、更少错用组件、更少返工，并通过 Chat + Live Prototype 形成更高效的设计迭代方式。

只有 V0 明显优于当前基线，才进入 Knowledge Engine、Project Learning、多项目、Figma、GitHub、SaaS 等平台化建设。

## 2. 三个必须验证的产品假设

### H1：Product Context 有明显价值

Agent 读取项目上下文后，对业务对象、入口、主路径、状态和结果的理解错误应明显减少。

### H2：Real Component + Semantic Registry 有明显价值

正式代码组件与 `UI Intent → Candidate Component + Constraint` 机制，应显著减少：

- 组件选错；
- 组件结构被重写；
- 已有正式组件被业务自造 UI 绕过；
- Variant / Token / 行为不一致。

### H3：Chat + Live Prototype 有明显价值

用户应能在同一任务中通过自然语言持续修改真实可操作原型，并以更少轮次达到验收标准。

## 3. 批判性审查后的方案修正

### 3.1 不先建设完整 Knowledge Engine

V0 先采用文件化 Project Context，按真实任务需要读取。暂不建设完整 Ontology、知识图谱、向量数据库和 Knowledge Center。

知识结构只在真实任务反复证明必要后再抽象。

### 3.2 Page Design Model 保持极轻

V0 只保留四类信息：

- `Goal`
- `Regions`
- `States`
- `Intent`

禁止先建设复杂 Page DSL、Implementation Model 或多层 JSON Contract。

### 3.3 Component Resolver 不做巨大规则树

Resolver 的职责是给出候选与约束，而不是替代设计判断。

示例：

```text
Intent: empty-state
Preferred: Result
Allowed: project-defined fallback
Avoid: Card
```

### 3.4 真正组件化属于可靠性基础设施

组件系统重要，但不是产品价值本身。优先级固定为：

```text
产品理解 > 设计判断 > 反馈修改体验 > 组件可靠性 > 自动学习
```

### 3.5 DeepSeek Harness 只是可替换 Runtime

DeepSeek Harness 当前仍是 Developer Preview，因此 Design Agent Core 不得依赖其内部数据模型。

边界固定为：

```text
Design Agent Core
        ↓
AgentRuntime Adapter
        ↓
DeepSeek Harness
```

V0 可以使用 DSH 作为现成 Agent/Web 外壳，但核心 Project Context、Design Model、Component Registry、Resolver、Validator 必须保持独立。

### 3.6 通用 Core，单客户验证

代码边界按通用产品设计，但 V0 只服务微购一个 Project。

暂不做通用 Project Import、Design System 自动导入、多租户和企业管理。

## 4. V0 最小范围

V0 只包含以下能力：

1. **Agent Shell**：项目/任务、Agent 对话、Live Prototype、Design Review。
2. **WeGo Project Context**：极简项目背景、核心产品能力和当前任务 Flow。
3. **8 个正式组件**：`Button`、`Cell`、`Search`、`Tag`、`Switch`、`Checkbox`、`Result`、`BottomActionBar`。
4. **Component Registry**：组件 API、适用 Intent、优先/避免关系。
5. **极简 Design Skill**：需求理解 → Goal / Regions / States / Intent。
6. **Component Resolver**：根据 Intent 输出候选与约束。
7. **Live Prototype**：真实 React 页面，可点击、输入、滚动和切换状态。
8. **Semantic Review**：检查组件选择、自造 UI、状态遗漏、主行动和基础运行问题。
9. **Benchmark**：与当前工作流做固定输入、重复执行的 A/B 对比。

## 5. V0 明确不做

以下能力全部推迟，除非 V0 验证结果证明其为必要条件：

- 完整 Knowledge DB / pgvector / Knowledge Graph；
- Knowledge Center；
- Experience 自动学习与 Pattern Graduation；
- Figma 同步；
- GitHub Delivery 产品化；
- 多 Project；
- 通用 Design System Importer；
- SaaS / 登录 / 多人协作；
- 自动企业知识抓取；
- 完整视觉 AI Review；
- 复杂多 Agent 编排。

## 6. 推荐新仓库边界

新仓库暂定：`design-agent`。

```text
design-agent/
├─ app/                    # Design Agent 产品 UI
├─ runtime/                # AgentRuntime Adapter；DSH 只在这里接入
├─ design/
│  ├─ design-skill.md
│  └─ principles.md
├─ ui/                     # 真正代码组件
├─ registry/               # Component Registry / Resolver
├─ projects/
│  └─ wego/
│     ├─ context.md
│     ├─ product.md
│     ├─ flows/
│     └─ assets/
├─ prototype/              # Live Prototype Runtime
└─ review/                 # Semantic / Runtime Review
```

约束：微购专有知识只能进入 `projects/wego/`；通用 Core 不得出现微购业务概念。

## 7. 最小运行链路

```text
用户需求
   ↓
Project Context Retrieval
   ↓
Design Skill
   ↓
Page Design Model
Goal / Regions / States / Intent
   ↓
Component Resolver
   ↓
正式 Component Tree
   ↓
Live Prototype
   ↓
Semantic Review
   ↓
用户反馈继续迭代
```

禁止退化为：

```text
需求 → 直接生成 TSX
```

## 8. 分阶段执行

### Phase 0：基线与边界固化（当前步骤）

产物：

- 本计划；
- Design Agent V0 Benchmark 评价规则；
- 固定第一条 Benchmark：`docs/benchmark/001-快捷发布产品.md`；
- 固定 A/B 对照口径。

完成标准：后续架构变更均可通过同一 Benchmark 判断是否真的提高设计质量。

### Phase 1：新仓库 + Runtime Shell

- 创建 `design-agent` 新仓库；
- 接入 DSH，但只通过 `AgentRuntime Adapter`；
- 复用三栏结构：Project / Conversation / Details；
- Details 先能承载空 Prototype Surface。

完成标准：输入消息后 Agent 可执行一次任务，右侧 Prototype Surface 可独立刷新。

### Phase 2：WeGo Project Context v0

只迁移第一条 Benchmark 必需信息：

- 微购是什么；
- 当前业务对象；
- 快捷发布产品目标、入口、路径、状态；
- 已确认设计原则；
- 必要素材/数据。

完成标准：Agent 不依赖旧仓库全量上下文即可准确解释 Benchmark 业务。

### Phase 3：8 个正式组件

实现真实 React 组件及 Agent 可读 Definition。

完成标准：业务页面不得复制组件内部 DOM / class；正式组件 API 是唯一消费入口。

### Phase 4：Design Model + Resolver

- 产生 `Goal / Regions / States / Intent`；
- Resolver 输出候选组件和约束；
- 先覆盖第一条 Benchmark 所需关系。

完成标准：页面实现前可以明确看到 Intent 与正式组件的选择关系。

### Phase 5：Live Prototype + Review

- Vite/HMR 实时原型；
- 可输入、滚动、交互；
- Reviewer 检查组件语义、状态、主行动、运行错误和基础视口问题。

完成标准：用户可以仅通过对话完成至少一轮可见修改并即时验证。

### Phase 6：A/B Benchmark

A：当前 `wego-design-system + Codex`。

B：Design Agent V0。

固定使用 `001-快捷发布产品.md`，两边均使用全新会话、干净产物环境、相同原始提示词，至少各重复 3 次。

根据 `docs/benchmark/design-agent-v0-evaluation.md` 评分。

## 9. V0 成功门槛

V0 不是“能跑起来”就算成功。

必须同时满足：

1. B 方案业务理解错误数低于 A；
2. B 方案组件错用 + 自造 UI 数显著低于 A；
3. B 方案关键状态遗漏不高于 A；
4. B 方案达到用户验收标准的对话轮数低于 A；
5. 用户主观判断新工作方式明显优于“Codex + 浏览器来回切换”。

若 B 没有明显胜出，不进入平台化阶段，先定位 Product Context、Design Skill、Resolver 或交互外壳的真实瓶颈。

## 10. 当前仓库可复用资产

V0 只提取经过真实使用验证的内容，不整体迁移旧架构：

- `docs/benchmark/`：现有固定测试集；
- `wego-app/data/prototype-db.js`：业务对象与统一数据事实源思路；
- `.codex/skills/wego-design/references/design-principles.md`：已确认设计原则；
- 现有 Component Contract 中的 `semanticTypeCandidates / usageHints / doNotInvent`：作为新 Component Definition 的输入，而不是直接复制旧 Contract；
- Experience 体系的质量门：保留为未来学习机制参考，V0 不实现自动学习。

## 11. 架构决策红线

V0 开发期间出现以下情况必须停止扩展并回到本计划审查：

- 为未来客户提前建设当前 Benchmark 用不到的通用能力；
- 新增一层 Model/Schema 但不能说明它解决了哪个已观察到的失败；
- Agent 重新获得直接手写正式组件内部 DOM 的能力；
- 微购知识进入通用 Core；
- DSH 类型或 Session 模型泄漏到 Project Knowledge / Component Registry；
- 为提高“一次生成看起来漂亮”而绕过正式组件或 Reviewer；
- 没有 Benchmark 数据就宣布架构优于当前工作流。

## 12. 当前执行状态

- [x] 方案批判性审查完成
- [x] V0 范围收缩完成
- [x] 第一条 Benchmark 已存在：`docs/benchmark/001-快捷发布产品.md`
- [x] Phase 0 启动
- [x] V0 评价规则落盘
- [x] Phase 0 基线与边界固化完成
- [ ] 创建独立 `design-agent` 仓库
- [ ] Phase 1：Runtime Shell
