# 工作流迭代

适用于 `工作流迭代模式`：经验沉淀、规则补充、流程优化、场景类型注册。

组件迭代和审查见 `workflow.md`；组件级判断原则见 `judgment-principles.md`；同步范围见 `sync-matrix.md` 的“工作流迭代”场景。

## 1. 入口判断

遇到以下请求时进入工作流迭代模式：

- 复盘问题后需要补充规则
- 审查发现规则缺失或冲突
- 新需求暴露流程缺口
- 用户要求优化工作流 / 沉淀经验
- AGENTS.md 或任一 SKILL.md 的规则需要调整

不进入工作流迭代模式的情况：

- 只是改组件样式/契约 → 迭代模式
- 只是检查组件是否合理 → 审查模式
- 只是改 UI Kit 演示 → 迭代模式（改 UI Kit 子流程）
- 审查发现问题需要沉淀规则 → 先出 findings，再转入工作流迭代模式

## 2. 经验沉淀通用化原则（核心）

工作流迭代的核心入口。所有经验沉淀必须先经过“经验抽象漏斗”，再按四段式落地：

经验抽象漏斗 → 工作流环节归属 → 场景类型识别 → 判断条件定义 → 决策动作落地

### 2.0 经验抽象漏斗（必须先做）

任何来自单个页面、单个组件、单次失败或用户反馈的经验，不能直接写成具体页面规则、具体尺寸补丁或具体组件特例。必须先完成以下 5 步：

1. **问题复盘**：先写清楚“这次哪里不好”，只描述现象和影响，不急着写规则
2. **业务名词剥离**：把具体业务名词替换成抽象对象，例如“仓库列表”替换成“对象管理列表”，“仓库图片/地址/编辑删除”替换成“对象识别物/关键摘要/列表操作”
3. **范式命名**：判断这是页面范式、组件消费、交互实现、验收标准还是工作流方法问题；范式名必须能覆盖多个业务，不用具体业务名
4. **反例验证**：至少用 2 个同类但不同业务的例子验证，例如仓库/商品/员工；如果换业务后规则失效，说明抽象不够
5. **归并判断**：落规则前必须检查已有场景类型、pagePattern、fallback blueprint、组件契约和 specs，判断是新增、合并、补充、例外还是冲突

输出到权威文件时，只写抽象后的范式、判断条件和决策动作；具体业务名只能作为例子或验证证据，不能成为规则主体。

### 2.0.1 相似/重复规则归并

新增规则前，必须把新经验和已有规则分成 5 类处理：

| 类型 | 判断 | 处理方式 |
|---|---|---|
| 完全重复 | 只是换了业务名，判断条件和动作相同 | 不新增规则；可在原规则补一个例子或验证点 |
| 同类补充 | 属于同一范式，但新增触发条件或补充动作 | 合并到原规则的判断条件、layoutRules、usageHints 或验收项 |
| 同类例外 | 大部分相同，但少数条件下走不同动作 | 在原规则下增加 allowWhen / avoidWhen / fallback，而不是新开平级规则 |
| 规则冲突 | 新旧规则给出相反决策 | 暂停落地，先复盘冲突来源；保留一个权威规则，删除或改写另一个 |
| 一次性个案 | 只能服务当前页面，无法泛化 | 只写入当前业务 page_spec / design_consumption_plan / scene 实现，不进入设计系统规则 |

同一类问题重复出现 3 次以上，默认说明上层范式抽象不足，应优先升级原范式定义或新增场景类型，不继续堆零散补丁。

### 2.1 四段式定义

1. **工作流环节归属**：先回答“这个问题归属 4 段流水线的哪个环节？”(wego-product / wego-design / wego-ux / wego-tests)——环节归属决定经验回流到哪个技能文档
2. **场景类型识别**：回答“这是什么类型的决策？”——类型必须是“一类问题”的抽象，不能用具体组件名作为类型名
3. **判断条件定义**：定义“什么条件触发什么决策”——条件必须是结构特征/语义特征/宿主特征，不能是“组件名+修饰类名”
4. **决策动作落地**：明确“落到哪个文件的哪个字段”——落地位置由第一段环节归属决定

### 2.2 工作流环节回流映射

- `wego-product` 类问题 → 回流到 wego-product/SKILL.md 或 page_spec 字段定义
- `wego-design` 类问题 → 回流到 wego-design/SKILL.md / library-consumption.json / uikit-plan.json
- `wego-ux` 类问题 → 回流到 wego-ux/SKILL.md 或 templates/
- `wego-tests` 类问题 → 回流到 wego-tests/SKILL.md 或 acceptance_report 字段定义
- 跨环节问题标注 primaryWorkflowStage(主)+ secondaryWorkflowStages(次)，规则主体落主要环节，次要环节只放执行引用

### 2.2.1 全局预览外壳与 App 宿主归属

- App 宿主归属 `wego-ux`：正式产物维护在 `wego-app/`，`wego-ux/templates/host-shell.*` 只作为宿主基线来源，不注册为 UI Kit
- UI Kit 只负责业务页面 Showcase；不能把 `app` 放回 `wego-design/ui_kits/` 作为下游复制源
- 手机外壳归属全局预览能力：`wego-app/index.html` 支持同链接响应式预览，电脑端显示手机壳，移动端隐藏外壳视觉
- 业务内容不得依赖 `.uikit-shell`、`.phone-frame`、`.phone-screen` 等外壳类；它们只服务预览
- 业务场景统一落在 `wego-app/scenes/{中文业务场景}/`，通过 `scene.js` 注册 route、template、presentation 和交互；不再为每个任务创建独立原型文件夹
- 预览以 Vercel 固定链接为主，同时必须支持本地直接打开；运行时不得依赖 `fetch()`/`XHR` 读取本地 HTML 片段

### 2.3 通用化验证标准

每条新规则沉淀后，必须通过以下验证：

- 环节归属明确性：是否标注了 primaryWorkflowStage？跨环节问题是否标注了 secondaryWorkflowStages？
- 同类复用性：规则能否适用于同类的新组件？
- 组件名独立性：规则是否依赖具体组件名作为唯一判断依据？
- 判断vs定义：规则是否描述了“如何判断”而非“是什么”？
- 抽象完整性：是否完成业务名词剥离、范式命名和反例验证？
- 归并准确性：是否检查过已有规则，确认不是重复、同类补充、同类例外或冲突？
- 可执行性：决策动作是否指明了具体的文件和字段？
- 位置归属：规则是否落在了正确的权威来源？
- 回流准确性：规则是否回流到了第一段标注的工作流环节对应的技能文档？

### 2.4 场景类型注册表

通用场景类型注册表位于 `.codex/skills/wego-design/library-consumption.json` 的 `scenarioTypeRegistry` 字段。新增经验沉淀时，必须先标注工作流环节归属，再匹配已有类型；若无匹配，先新增类型再沉淀规则。

### 2.5 禁止事项

- 不允许跳过经验抽象漏斗直接写规则
- 不允许把单个业务页面的表现问题直接写成具体尺寸、具体业务字段或具体组件特例
- 不允许发现相似规则后继续新增平级规则，必须先归并或裁决冲突
- 不允许用一次性个案污染设计系统规则；无法泛化时只留在当前业务规格或实现里
- 不允许跳过工作流环节归属直接写规则
- 不允许以具体组件名作为场景类型名（如不能叫“CellFormBoundary”）
- 不允许把具体组件名作为判断条件的唯一依据
- 不允许只停在文档描述而不指明落地字段
- 不允许在下游技能文档中重复存放已沉淀到契约的规则
- 不允许把规则回流到错误的工作流环节（如 design 类问题回流到 wego-ux/SKILL.md）

## 3. 固定读取顺序

工作流迭代的读取顺序与组件迭代不同：

1. 本文件（经验沉淀通用化原则）
2. `.codex/skills/wego-design/library-consumption.json` 的 `scenarioTypeRegistry`（场景类型注册表 + workflowStageDefinitions）
3. 按环节归属补读对应 SKILL.md：
   - product 类 → `.codex/skills/wego-product/SKILL.md`
   - design 类 → `.codex/skills/wego-design/SKILL.md`
   - ux 类 → `.codex/skills/wego-ux/SKILL.md`
   - tests 类 → `.codex/skills/wego-tests/SKILL.md`
4. 按环节归属补读对应契约/计划文件：
   - design 类 → components/{slug}.json / uikit-plan.json
   - ux 类 → wego-ux/templates/
5. `references/sync-matrix.md` 的“工作流迭代”场景（确认同步范围）

## 4. 工作流迭代标准步骤

### 步骤 1：执行经验抽象漏斗

先完成问题复盘、业务名词剥离、范式命名、反例验证和归并判断。若无法通过反例验证，不能进入设计系统规则沉淀，只能留在当前业务规格或实现约束里。

### 步骤 2：识别工作流环节归属

回答“这个问题归属 4 段流水线的哪个环节？”。环节定义见 `library-consumption.json` 的 `scenarioTypeRegistry.workflowStageDefinitions`。跨环节问题标注 primaryWorkflowStage(主) + secondaryWorkflowStages(次)。

### 步骤 3：识别场景类型

到 `library-consumption.json` 的 `scenarioTypeRegistry.types[]` 匹配已有类型。若无匹配，先新增类型到注册表（必须标注 primaryWorkflowStage），再沉淀规则。**不要在本文档硬编码类型 id**——类型列表以 library-consumption.json 为准。

### 步骤 4：定义判断条件

条件必须是结构特征/语义特征/宿主特征，不能是“组件名+修饰类名”。验证方法：把规则里的具体组件名替换成“组件A/组件B”后，逻辑是否仍然成立。

### 步骤 5：决策动作落地

落地位置由步骤 1 的环节归属决定，优先级：组件契约 > 消费契约 > 组合约束 > SKILL.md 文档。

- product 类 → wego-product/SKILL.md 或 page_spec 字段定义
- design 类 → wego-design/SKILL.md / library-consumption.json / uikit-plan.json / components/{slug}.json
- ux 类 → wego-ux/SKILL.md 或 templates/
- tests 类 → wego-tests/SKILL.md 或 acceptance_report 字段定义

### 步骤 6：通用化验证

按 2.3 节验证清单逐条验证。

### 步骤 7：同步相关文件

按 `sync-matrix.md` 的“工作流迭代”场景执行同步。

### 步骤 8：递增 version（若涉及设计系统本体）

若变更涉及 library-consumption.json / uikit-plan.json / components/*.json，递增 metadata.json.version。

### 步骤 9：验证并汇报

运行守门脚本，按 SKILL.md 输出约定汇报。

## 5. 常见拦截

### 5.1 规则直接写死针对单个组件

当用户要求“给 Cell 补一条 xxx 规则”时：

1. 拦截，提示“经验沉淀必须按四段式通用化”
2. 引导用户先识别场景类型（到 scenarioTypeRegistry.types[] 匹配）
3. 把具体组件名作为规则实例，不能作为场景类型名
4. 判断条件不能依赖组件名作为唯一依据

### 5.2 规则回流到错误的工作流环节

当用户要求把 design 类规则写到 wego-ux/SKILL.md 时：

1. 拦截，提示“环节归属决定回流位置”
2. design 类规则应回流到 library-consumption.json / uikit-plan.json / components/{slug}.json
3. wego-ux/SKILL.md 只放执行引用

### 5.3 跳过环节归属直接写规则

当用户直接说“在 SKILL.md 补一条规则”时：

1. 拦截，要求先回答“这个问题归属哪个工作流环节”
2. 确认环节归属后再决定回流位置

### 5.4 规则只停在文档描述

当用户要求“在 SKILL.md 写明应该用默认尺寸”时：

1. 拦截，提示“决策动作必须指明落地文件和字段”
2. 引导用户把规则落到 components/{slug}.json 的 variantDimensions 或 uikit-plan.json 的 compositionConstraints
3. SKILL.md 只放读取要求，不放具体规则

### 5.5 在 SKILL.md 堆砌具体规则

当工作流迭代导致 SKILL.md 持续膨胀时：

1. 拦截，提示“SKILL.md 只作为入口与顶层规则定义”
2. 具体规则拆到 references/ 子文件或权威数据文件
3. SKILL.md 只保留引用

### 5.6 把工作流迭代规则写到 AGENTS.md

当用户要求“在 AGENTS.md 补一条工作流迭代规则”时：

1. 拦截，提示“AGENTS.md 只承载顶层仓库关键信息与仓库偏好规则”
2. 工作流迭代规则回流到 workflow-iteration.md 或对应环节的 SKILL.md
3. AGENTS.md 只在“仓库级约束”承接影响所有技能的硬约束

## 6. 经验沉淀案例

### 案例：已有场景迭代一致性（existing-scene-iteration-governance）

**问题复盘**：已有页面迭代开发时，agent 默认直接改 scene.js/scene.css，不触发 wego-ux 技能，也不做偏差判定。3 轮近期内存会话（6a4b6d76/6a4b7836/6a4b7c36）显示 agent 全部直接改文件，无一触发技能。同时，归档机制执行率低（仅 33%），Token 硬编码和组件类发明无守门拦截。

**业务名词剥离**：不绑定“仓库管理”或“快捷发布产品”等具体业务，抽象为“已有场景迭代偏差判定与技能触发强制化”。

**范式命名**：`existing-scene-iteration-governance`（已有场景迭代治理）

**反例验证**：任意已有业务场景（如仓库管理、系统设置、库存管理）的迭代需求，都应先经过偏差判定；换场景后判定逻辑不变。

**归并判断**：这个范式的核心规则是：已有场景迭代必须先调 wego-ux 技能做偏差判定，再决定改产物或回工作流。与现有 `host-shell-route-binding`（后续迭代按 route_id 更新）互补但不冲突。

**四段式定义**：

1. **工作流环节归属**：primaryWorkflowStage = `wego-ux`（技能触发 + 偏差判定）；secondaryWorkflowStages = `wego-product`、`wego-design`、`wego-tests`（有偏差时回退）

2. **场景类型识别**：类型 = `existing-scene-iteration`（已有场景迭代）

3. **判断条件定义**：
   - 偏差判定三步：①内容是否在 page_surfaces[] 范围内 → 否=内容偏差；②组件变化是否在 component_mapping 范围内 → 否=组件偏差；③展示方式是否与 page_presentation 一致 → 否=展示偏差
   - 无偏差 → 直接改产物
   - 有偏差 → 
