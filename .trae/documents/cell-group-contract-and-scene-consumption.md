# cell 与 form 分组容器契约对齐方案

## 摘要

cell 组件缺少分组容器契约层，导致 AI 在任务产物里自由拼凑分组容器类名（如 `inventory-settings-page__group`、`host-shell-list`）。本方案为 cell 新增 `.cell-group` 分组容器契约，同步为 form 新增 `.form-group`（与 cell-group 命名对称，`.form` 保留兼容），让 cell 和 form 的成组规则保持一致；同时澄清 `section-group` 的脚手架边界，清理契约文档中对脚手架术语的误引用，让 AI 按组件场景维度消费分组结构，不再自由拼凑。

## 当前状态分析

### 问题 1：cell 缺少分组容器契约层

- **form 组件**有显式的两层结构：`.form`（container，字段分组容器）+ `.form-body`（root，字段行），见 [form.json#L134-L144](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/form.json#L134-L144)
- **cell 组件**只有 root 层 `.cell`，没有 container 层，见 [cell.json#L79-L100](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/cell.json#L79-L100)
- 后果：AI 在 [库存规则设置/index.html#L190](file:///Users/baobei/CODE/wego-design-system/库存规则设置/index.html#L190) 自创了 `inventory-settings-page__group`、`inventory-rule-page__group`、`host-shell-list` 等任务级类名作为分组容器，违反"不发明组件子元素类"原则

### 问题 2：契约文档误用脚手架术语 section-group

- `section-group` 是 [scaffold.css#L90](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/scaffold.css#L90) 的预览脚手架容器（白色背景），不是组件契约
- 但 [cell.json#L126](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/cell.json#L126) usageHints 用 "section-group" 描述组件分组行为，混淆了契约层和脚手架层
- [uikit-plan.json#L373](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/uikit-plan.json#L373) 和 [uikit-plan.json#L531](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/uikit-plan.json#L531) 的 compositionConstraints 也引用 "section-group"
- 用户反馈："section-group 语义上也不好理解"

### 问题 3：form 的分组容器命名与 cell 不对称

- form 的 `.form` 是 container（字段分组容器），但命名上没有 "group" 字样，与即将新增的 cell-group 命名不对称
- 用户反馈："form 这里写的也不是 form_group，感觉也可以优化"；"cell 和 form 的成组规则保持一致"
- 需要为 form 新增 `.form-group` 作为推荐分组容器类，与 `.cell-group` 命名对称；`.form` 保留兼容（现有任务产物在用）

### 问题 4：分组消费规则散落在契约文档多处，无统一权威源

- cell 的分组消费规则散落在 cell.json usageHints（第 126 行）、uikit-plan.json compositionConstraints（第 373、531 行）
- 规则表述不一致（cell.json 用 "section-group"，uikit-plan.json 也用 "section-group"），且引用了脚手架术语
- 本轮把分组消费规则统一沉淀在 cell.json structurePatterns/usageHints + form.json structurePatterns + uikit-plan.json compositionConstraints 里，不动 specs/（specs 由用户维护）

## 提议变更

### 变更 1：cell.json 新增分组容器契约（核心）

**文件**：[.codex/skills/wego-design/components/cell.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/cell.json)

**改什么**：
1. `anatomy` 数组首位新增 container 层：
   ```json
   {
     "name": "container",
     "selector": ".cell-group",
     "role": "列表分组容器，承接同组连续 cell 的分割线节奏与组间留白"
   }
   ```
2. `domAnatomy` 新增字段：
   ```json
   "containerSelector": ".cell-group",
   "containerModifiers": [".cell-group--titled"]
   ```
3. `structurePatterns` 新增 2 条分组规则：
   - "成组出现的 cell 必须用 .cell-group 包裹，不发明任务级 xxx-page__group 自定义类。"
   - ".cell-group 内连续 cell 除最后一行外均加分割线修饰类；孤立单行 cell 不加分割线。"
4. `usageHints` 第 126 行把 "section-group" 替换为 "cell-group"
5. `designTokens` 新增 `groupGap: "8px"`（组间距，与 scaffold 的 section-gap 对齐）

**为什么**：补齐 cell 缺失的 container 层，让 AI 有标准分组容器类可用，不再自创。

### 变更 2：form.json 新增 .form-group 分组容器（与 cell 对称）

**文件**：[.codex/skills/wego-design/components/form.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/form.json)

**改什么**：
1. `anatomy` 第 1 项 container 的 selector 从 `.form` 改为 `.form-group`（推荐）+ `.form`（兼容），role 强化为 "字段分组容器，承接同组连续 form-body 的分割线节奏与组间留白；成组出现的 form 必须用 .form-group 包裹，不发明任务级 xxx-page__group"
2. `domAnatomy` 的 `containerModifiers` 从 [".form--no-divider", ".form--right-align"] 改为 [".form-group--no-divider", ".form-group--right-align"]（.form--* 保留兼容）
3. `structurePatterns` 新增 1 条："成组出现的 form 必须用 .form-group 包裹，不发明任务级 xxx-page__group 自定义类。"
4. `usageHints` 补充："成组 form 优先用 .form-group；.form 仅为兼容历史任务产物，新任务不再使用。"

**为什么**：让 form 的分组容器命名与 cell-group 对称，成组规则保持一致；`.form` 保留兼容避免破坏现有任务产物。

### 变更 3：components.css 新增 .cell-group 与 .form-group 样式

**文件**：[.codex/skills/wego-design/components.css](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components.css)

**改什么**：
1. 在 `/* ── Cell ── */` 注释后、`.cell` 定义前新增：
   ```css
   .cell-group{background:var(--bg-surface);width:100%}
   .cell-group--titled{padding-top:0}
   ```
2. 在 `.form` 定义处（第 392 行）把 `.form` 与 `.form-group` 合并为群组选择器，保持样式一致：
   ```css
   .form,.form-group{width:100%;background:var(--bg-surface)}
   .form-group--no-divider .form-body::after{display:none}
   .form-group--right-align .form-body:not(.form-body--preserve-content-align) .form-body__action{display:flex;align-items:center;justify-content:flex-end}
   ```
   （`.form--no-divider` / `.form--right-align` 保留兼容，新增 `.form-group--*` 对应类）

**为什么**：提供 cell-group 和 form-group 对称的分组容器样式；form-group 与现有 .form 样式完全一致，仅命名规范化。

### 变更 4：scaffold.css 与预览脚手架规范澄清边界

**文件**：
- [.codex/skills/wego-design/scaffold.css](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/scaffold.css#L85-L97)
- [.codex/skills/wego-design/specs/预览页脚手架规范.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/specs/预览页脚手架规范.md)

**改什么**：
1. scaffold.css 保留 `.section-group` 不动（预览脚手架容器，仅供 preview/ui_kits 使用）
2. 预览页脚手架规范.md 在 `.section-group` 定义后补一句澄清："`.section-group` 是预览脚手架级容器，仅供 preview/ 和 ui_kits/ 使用；任务产物（wego-ux 输出）中成组 cell 必须用组件契约层的 `.cell-group`，不用 `.section-group`。"

**为什么**：明确 section-group 与 cell-group 的层级边界，消除"section-group 是不是组件"的歧义。

### 变更 5：uikit-plan.json 清理 section-group 引用

**文件**：[.codex/skills/wego-design/uikit-plan.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/uikit-plan.json)

**改什么**：
1. 第 373 行 compositionConstraints 文案 "父级 radio/checkbox 所在 cell 和子级 cell 应在同一 section-group 内连续排列" 改为 "同一 .cell-group 内连续排列"
2. 第 531 行 layoutRules "选择项使用 section-group + cell 组织" 改为 "选择项使用 .cell-group + cell 组织"

**为什么**：组件组合约束层不再引用脚手架术语，统一用组件契约层的 `.cell-group`。

### 变更 6：preview/component-cell.html 与 ui_kits 示例同步

**文件**：
- [.codex/skills/wego-design/preview/component-cell.html](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/preview/component-cell.html)
- [.codex/skills/wego-design/ui_kits/biz-rule-config/index.html](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/ui_kits/biz-rule-config/index.html)

**改什么**：
1. preview/component-cell.html：预览页外层仍可用 `.section-group`（脚手架），但组件 markup 示例区改为用 `.cell-group` 演示分组
2. ui_kits/biz-rule-config/index.html：把 `.uikit-section-group` 改为 `.cell-group`（uikit-section-group 本就是 section-group 的 uikit 变体，应统一到组件契约类名）

**为什么**：让预览示例与组件契约一致，AI 从预览页复制 markup 时直接拿到 `.cell-group`。

### 变更 7：metadata.json version 递增

**文件**：[.codex/skills/wego-design/metadata.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/metadata.json)

**改什么**：version 递增（按本轮变更幅度，建议 patch 或 minor 递增，需读取当前 version 后决定）

**为什么**：组件契约变更必须递增 metadata version（AGENTS.md 仓库级约束）。

## 假设与决策

1. **cell-group / form-group 不独立成组件**：对标 form 现有的 container 层，cell-group 和 form-group 是各自组件自身的容器层，不独立注册到 components/index.json。理由：分组容器与组件强绑定，独立成组件会引入不必要的组合复杂度。
2. **.form 保留兼容，.form-group 为推荐类名**：form 的 `.form` 在现有任务产物中使用，保留避免破坏；新任务优先用 `.form-group`，与 `.cell-group` 命名对称。components.css 用群组选择器让二者样式完全一致。
3. **section-group 保留作脚手架容器**：不废弃 section-group，因为它在 preview/ui_kits 中有实际用途（模拟移动端列表页分组）。只在文档层澄清它与 cell-group / form-group 的层级差异。
4. **组间距 8px 由宿主控制**：不在 .cell-group 内塞 margin/gap，组间距由页面级 page-body 的 padding 控制，与现有 section-gap 节奏一致。
5. **不回归修改库存规则设置任务**：本轮只改设计系统本体，不动已生成的任务产物。下次生成新任务时自然消费 cell-group。
6. **specs/ 由用户维护，本轮不动**：分组消费规则沉淀在 cell.json structurePatterns/usageHints + form.json structurePatterns + uikit-plan.json compositionConstraints 里，不新增/修改 specs/ 下任何文件。

## 验证步骤

1. 运行 `node scripts/validate-wego-design.mjs`，确认通过守门（JSON 格式、Token 同步、组件三向对齐、components.css 完整性、UI Kit 成对、过期路径、禁止文件、metadata version）
2. 确认 cell.json 的 anatomy / domAnatomy / structurePatterns / usageHints 一致性（container 层、.cell-group 选择器、分组规则文案）
3. 确认 components.css 中 `.cell-group` 样式存在且与 cell.json domAnatomy 对齐
4. grep `section-group` 在 .codex/skills/wego-design/components/ 和 uikit-plan.json 中应 0 匹配（已全部改为 cell-group）
5. grep `section-group` 在 scaffold.css、specs/预览页脚手架规范.md、preview/ 中仍存在（脚手架层保留）
6. 确认 metadata.json version 已递增
7. 人工检查：模拟一个新任务消费 cell-group，确认 AI 能直接用 `.cell-group` 包裹连续 cell，不再自创 `xxx-page__group`

## 风险与边界

- **风险 1**：preview/component-cell.html 的改动幅度较大（多处 `<div class="section-group">`），需逐处判断是保留作脚手架还是改为组件示例。执行时需读完整文件再改。
- **风险 2**：ui_kits/biz-rule-config/index.html 用了 React 的 `className` 而非 `class`，且类名是 `uikit-section-group`（带 uikit- 前缀），需确认是否要同步去掉前缀。
- **边界**：本轮不改 wego-ux/SKILL.md（消费指引通过引用 wego-design 契约间接生效，契约改了 wego-ux 自然受益）；不改已生成的库存规则设置任务产物；不动 specs/ 下任何文件（由用户维护）。
