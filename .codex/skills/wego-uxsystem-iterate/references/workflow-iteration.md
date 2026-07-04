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

工作流迭代的核心入口。所有经验沉淀必须按四段式：

工作流环节归属 → 场景类型识别 → 判断条件定义 → 决策动作落地

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
- 可执行性：决策动作是否指明了具体的文件和字段？
- 位置归属：规则是否落在了正确的权威来源？
- 回流准确性：规则是否回流到了第一段标注的工作流环节对应的技能文档？

### 2.4 场景类型注册表

通用场景类型注册表位于 `.codex/skills/wego-design/library-consumption.json` 的 `scenarioTypeRegistry` 字段。新增经验沉淀时，必须先标注工作流环节归属，再匹配已有类型；若无匹配，先新增类型再沉淀规则。

### 2.5 禁止事项

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

### 步骤 1：识别工作流环节归属

回答“这个问题归属 4 段流水线的哪个环节？”。环节定义见 `library-consumption.json` 的 `scenarioTypeRegistry.workflowStageDefinitions`。跨环节问题标注 primaryWorkflowStage(主) + secondaryWorkflowStages(次)。

### 步骤 2：识别场景类型

到 `library-consumption.json` 的 `scenarioTypeRegistry.types[]` 匹配已有类型。若无匹配，先新增类型到注册表（必须标注 primaryWorkflowStage），再沉淀规则。**不要在本文档硬编码类型 id**——类型列表以 library-consumption.json 为准。

### 步骤 3：定义判断条件

条件必须是结构特征/语义特征/宿主特征，不能是“组件名+修饰类名”。验证方法：把规则里的具体组件名替换成“组件A/组件B”后，逻辑是否仍然成立。

### 步骤 4：决策动作落地

落地位置由步骤 1 的环节归属决定，优先级：组件契约 > 消费契约 > 组合约束 > SKILL.md 文档。

- product 类 → wego-product/SKILL.md 或 page_spec 字段定义
- design 类 → wego-design/SKILL.md / library-consumption.json / uikit-plan.json / components/{slug}.json
- ux 类 → wego-ux/SKILL.md 或 templates/
- tests 类 → wego-tests/SKILL.md 或 acceptance_report 字段定义

### 步骤 5：通用化验证

按 2.3 节验证清单逐条验证。

### 步骤 6：同步相关文件

按 `sync-matrix.md` 的“工作流迭代”场景执行同步。

### 步骤 7：递增 version（若涉及设计系统本体）

若变更涉及 library-consumption.json / uikit-plan.json / components/*.json，递增 metadata.json.version。

### 步骤 8：验证并汇报

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
