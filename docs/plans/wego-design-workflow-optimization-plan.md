# 历史归档文档 - wego 设计工作流优化计划

> **归档说明**：本文档为历史工作流计划，已不再作为当前重构依据。当前设计系统演进依据为 `docs/plans/wego-design-workflow-final-plan.md`。

> 基于 solo-design 与 wego-design 深度对比分析，针对"双次翻译 + 文本中介"结构性问题提出的系统性优化方案。

---

## 一、问题诊断摘要

### 1.1 根本断层

| # | 断层 | 影响 |
|---|------|------|
| 1 | **双次翻译**：wego-design 读契约出文本 → wego-ux 读文本出 HTML，每次翻译都有信息衰减 | Token 绑定错误、class 拼写错误、DOM 结构与 Preview 不一致 |
| 2 | **文本中介**：`design_plan` 是自然语言规格，无类型检查、无变量校验、无自动注入 | 约束对 wego-ux 是"建议"而非"硬约束" |
| 3 | **Gap 阻塞**：设计系统覆盖不了就卡死链路 | 新场景交付被设计系统完备度绑架 |
| 4 | **验收后置**：Token/class 错误要等到 wego-tests 验收才发现 | 修正成本高，反馈周期长 |
| 5 | **约束外置**：设计约束放在外部文件中，uwego-ux 需要"自行查找"而非"即时可见" | AI 容易跳过约束文件直接凭记忆实现 |

### 1.2 与 solo-design 的关键差异

solo-design 稳定的原因：
- Preview HTML **优先**于契约 JSON → 学习实际 DOM 而非抽象描述
- 单次翻译：一个 Agent 读 Preview 后直接生成 HTML
- 程序化绑定：`fill-html-head.mjs` 自动注入 CSS，Token 白名单硬性约束
- 无 gap 阻塞：覆盖不了就自由发挥
- 约束内联：`styleContinuityAnchors` + `actualTokenNameReference` 作为硬约束嵌入 Task Prompt

---

## 二、优化方案全景

| 优先级 | 方案 | 解决断层 | 复杂度 | 效果预估 |
|--------|------|---------|--------|---------|
| **P0** | A-约束内联到 UX Prompt | 断层 2、5 | 低 | Token/class 错误减少 70% |
| **P0** | B-Token/Class 自动化守卫脚本 | 断层 4 | 低 | 错误发现前置到生成时刻 |
| **P1** | C-原型阶段合并 design + ux | 断层 1（核心） | 中 | 消除双次翻译根本问题 |
| **P1** | D-Gap 旁路（DDR 机制） | 断层 3 | 中 | 消除 gap 阻塞瓶颈 |
| **P2** | E-正式阶段规格分层 | 断层 1（辅助） | 低 | 减轻元数据维护负担 |

---

## 三、P0 方案详细设计

### 3.1 方案 A：约束内联到 UX Prompt

**目标**：将设计约束从"外部文件引用"改为"Task Prompt 内联硬约束"，让 wego-ux 在写 HTML 时即时可见，无需猜测。

**改动范围**：
- `wego-ux/SKILL.md`：修改场景生成任务的 dispatch 格式
- `wego-design/references/design-plan.md`：增加 `prompt_contract` 产出字段

**具体变更**：

**3.1.1 新增 `prompt_contract` 产出（wego-design 侧）**

`design_plan` 增加一个面向 prompt 的紧凑字段，专用于嵌入 wego-ux 的 Task：

```yaml
prompt_contract:
  token_whitelist:
    - "--brand-primary"
    - "--brand-background"
    - "--body-md-font-size"
    - "--heading-xs-font-size"
    - "--heading-sm-font-size"
    - "--text-primary"
    - "--text-secondary"
    - "--text-tertiary"
    - "--state-danger"
    - "--state-success"
    - "--state-warning"
    - "--state-promotion"
    - "--radius-sm"
    - "--radius-md"
    - "--spacing-xs"
    - "--spacing-sm"
    - "--spacing-md"
    - "--spacing-lg"
    - "--button-primary-background"
  token_bindings:
    - purpose: "用户姓名 / 对象名称"
      token: "--heading-xs-font-size"
      color: "--text-primary"
    - purpose: "店铺描述 / 辅助正文"
      token: "--body-md-font-size"
      color: "--text-secondary"
    - purpose: "页面标题"
      token: "--heading-sm-font-size"
      color: "--text-primary"
    - purpose: "辅助信息（时间/状态/计数）"
      token: "--body-sm-font-size"
      color: "--text-tertiary"
    - purpose: "操作按钮背景"
      token: "--button-primary-background"
    - purpose: "成功/正面状态"
      token: "--state-success"
    - purpose: "危险/删除操作"
      token: "--state-danger"
    - purpose: "促销/营销场景"
      token: "--state-promotion"
  component_bindings:
    - slot: cell
      slug: cell
      variant: avatar-description
      class_root: wego-cell wego-cell--avatar-description
    - slot: primary_button
      slug: button
      variant: primary
      class_root: wego-btn wego-btn--primary
    - slot: tag_price
      slug: tag
      variant: promotion
      class_root: wego-tag wego-tag--promotion
  hard_rules:
    - "禁止硬编码颜色值（如 color: #333）"
    - "禁止造不在 token_whitelist 中的 CSS 变量"
    - "禁止使用 Tailwind 语义色类"
    - "border-radius 不超过 8px"
    - "一页仅一处使用 font-weight: 600"
  forbidden_components: ["layout", "space"]
```

**3.1.2 Ux Task Prompt 格式变更（wego-ux 侧）**

当前格式（弱约束）：
```
请按 design_plan 实现场景 xxx 的页面。
相关文件路径：
  - .codex/skills/wego-design/colors_and_type.css
  - wego-app/lib/components.css
```

优化后格式（强约束，内联到 Prompt）：
```
### 设计系统硬约束（必须遵守）
Token 白名单（只能使用以下变量）：
  --brand-primary, --brand-background, --body-md-font-size, --heading-xs-font-size, ...

Token 绑定映射：
  - 用户姓名/对象名称 → var(--heading-xs-font-size) + var(--text-primary)
  - 店铺描述/辅助正文 → var(--body-md-font-size) + var(--text-secondary)
  ...

组件映射：
  - cell → 类名: wego-cell wego-cell--avatar-description
  - 主按钮 → 类名: wego-btn wego-btn--primary
  ...

硬性规则：
  - 禁止硬编码颜色值
  - 禁止造不在白名单中的 CSS 变量
  - border-radius 不超过 8px
  - 一页仅一处 font-weight: 600

约束文件（补充参考，非首要来源）：
  - {path}/components/cell.json
  - {path}/preview/component-cell.html
  - {path}/colors_and_type.css
```

**3.1.3 实现步骤**

1. 修改 `wego-design/SKILL.md`：在 `design_plan` 产出中增加 `prompt_contract` 字段定义
2. 修改 `wego-design/references/design-plan.md`：添加 `prompt_contract` 结构说明
3. 修改 `wego-ux/SKILL.md`：在场景生成任务的 dispatch 格式中，规定从 wego-design 接收 `prompt_contract` 并嵌入 Prompt
4. 编写 `scripts/validate-prompt-contract.mjs`：校验 wego-design 产的 `prompt_contract` 是否包含所有必需字段

**效果指标**：
- Token 拼写错误降至接近零（硬白名单约束）
- class 名错误降至接近零（组件 class 直接给出）
- 圆角/字重违规大幅减少（硬性数字规则）

---

### 3.2 方案 B：Token/Class 自动化守卫脚本

**目标**：在 wego-ux 生成 HTML 后**立即自动校验**，将错误发现前置到"生成时刻"，而非等到验收阶段。

**改动范围**：
- 新增 `scripts/validate-token-usage.mjs`
- wego-ux 实现步骤中增加校验调用

**3.2.1 脚本设计**

```bash
node scripts/validate-token-usage.mjs <场景HTML路径> <设计系统索引路径> [--fix]
```

**校验规则**：

| 校验项 | 实现方式 | 严格度 |
|--------|---------|--------|
| 已知 CSS 变量 | 提取 HTML 中所有 `var(--xxx)`，与 `css.json` 注册变量比对 | error（不允许未知变量） |
| 已知 wego class | 提取 class 中带 `wego-` 前缀的类名，校验是否在组件索引中注册 | error（不允许未注册组件的 class） |
| 禁止裸颜色值 | 扫描 `style` 属性中的 `color`、`background`、`border-color` 等，发现 hex/rgb/hsl 裸值报警 | warning（建议改为 Token 引用） |
| 圆角上限 | 扫描 `style` 属性中 `border-radius` 值是否 > 8px 或 < 0px | error |
| 组件结构完整度 | 对 component_bindings 中声明的组件，校验其必需子元素是否存在（只检测结构标记，不做完整 DOM 匹配） | warning |
| font-weight 数量 | 统计 `style` 中 `font-weight: 600` 出现次数，超过 1 处警告 | warning |

**3.2.2 集成时机**

在 wego-ux 完成场景 HTML 生成后、提交之前，作为**必要步骤**执行：

```
wego-ux 生成 HTML
  → 运行 validate-token-usage.mjs
  → 有 error 级违规 → 修复 → 重新运行直到通过
  → 有 warning 级违规 → 记录到 implementation_refs
  → 无违规 → 提交
```

**3.2.3 死线绑定权衡**

守卫脚本的严格度可以调节。初始版本建议：
- `error` 级别：不允许绕过，必须修复
- `warning` 级别：允许绕过，但记录在 `implementation_refs` 中，wego-tests 会关注

后续可根据实际运行数据调整（如果某个 warning 频繁出现且实际没有造成问题，降级为 info）。

**效果指标**：
- 已知 Token 错误在生成后 5 秒内被发现，而非等到验收
- 组件 class 错误零容忍
- 圆角越界零容忍

---

## 四、P1 方案详细设计

### 4.1 方案 C：原型阶段合并 wego-design + wego-ux

**目标**：消除"双次翻译"这个核心断层，让设计决策直接到 HTML，不经过文本中介。

**4.1.1 流程变化**

```
当前原型期：
  wego-design → 写 text design_plan
              → wego-ux 读 plan 转 HTML
              两次推理，信息衰减

优化后原型期：
  wego-design → 读设计系统 + prototype_brief
              → 直接生成 annotated HTML prototype
              一次推理到 HTML，信息零衰减
```

**4.1.2 HTML 标注方案**

设计决策嵌入到 HTML 的 `data-*` 属性中，替代独立的 `design_plan` 文本：

```html
<li class="wego-cell wego-cell--avatar-description"
    data-dd-id="dd-003"
    data-rule-source="cell.json/variant:avatar-description"
    data-surface-id="surface-member-list"
    data-region-id="region-member-item">
  <img class="wego-cell__avatar" src="..."
       data-token-binding="avatar-size: --spacing-xl" />
  <div class="wego-cell__content">
    <div class="wego-cell__title"
         style="font-size: var(--heading-xs-font-size); color: var(--text-primary)"
         data-token-binding="font-size: heading-xs-font-size; color: text-primary"
         data-content-role="user-name">
      张三
    </div>
    <div class="wego-cell__description"
         style="font-size: var(--body-md-font-size); color: var(--text-secondary)"
         data-token-binding="font-size: body-md-font-size; color: text-secondary"
         data-content-role="description">
      金牌供应商 · 本月销售额 ¥12.8w
    </div>
  </div>
</li>
```

**4.1.3 设计决策提取工具**

新增 `scripts/extract-design-decisions.mjs`：

```bash
node scripts/extract-design-decisions.mjs <原型HTML路径> --output <json路径>
```

从 `data-*` 属性中提取完整的决策链：

```json
{
  "prototype_html": "scenes/member-list/index.html",
  "extracted_at": "2026-07-12T10:00:00Z",
  "decisions": [
    {
      "dd_id": "dd-003",
      "rule_source": "cell.json/variant:avatar-description",
      "surface_id": "surface-member-list",
      "region_id": "region-member-item",
      "component_slug": "cell",
      "variant": "avatar-description",
      "token_bindings": [
        { "element": ".wego-cell__title", "token": "heading-xs-font-size", "role": "user-name" },
        { "element": ".wego-cell__description", "token": "body-md-font-size", "role": "description" }
      ]
    }
  ],
  "hard_rules_verified": {
    "no_hardcoded_colors": true,
    "no_unknown_tokens": true,
    "radius_within_limit": true,
    "font_weight_count": 1
  }
}
```

**4.1.4 正式阶段的规格生成**

原型确认后，从标注的 HTML 中**自动生成**正式 `design_plan`：

```bash
node scripts/extract-design-decisions.mjs scenes/member-list/index.html --output scenes/member-list/design-decisions.json
node scripts/generate-formal-plan.mjs scenes/member-list/ --output scenes/member-list/design_plan.json
```

这解决了"正式阶段需要补全规格"的问题——规格不再是手写的，而是从原型产物自动反向提取的。

**4.1.5 实现步骤**

1. 修改 `wego-design/SKILL.md`：原型阶段增加"生成 annotated HTML prototype"能力
2. 新增 `scripts/extract-design-decisions.mjs`：从 HTML `data-*` 提取决策链
3. 新增 `scripts/generate-formal-plan.mjs`：从决策链生成正式 `design_plan`
4. 修改 `wego-ux/SKILL.md`：明确区分"原型期从零生成"和"正式期精化已有原型"
5. 修改 `高保真原型基线.md`：更新原型定稿条件（验证标注完整性）

**效果指标**：
- 用户从需求确认到看到原型的时间缩短 50%+
- Token/class 不一致率降低 90%+（消除了二次翻译）
- 规格从"手写"变为"自动提取"

---

### 4.2 方案 D：Gap 旁路（DDR 机制）

**目标**：将设计系统 gap 从"阻塞事件"变为"旁路事件"，先交付再批量补规则。

**4.2.1 DDR Schema**

```yaml
# .codex/design-deviations/ddr-001.yaml
record_id: "ddr-001"
status: "open"  # open | resolved | wontfix
gap_type: "variant-not-implemented"
gap_detail: "cell 组件 'compact-slim' 变体在 components.css 未实现样式规则"
affected_surface: "surface-order-list"
affected_iteration: "iter-003"
workaround:
  strategy: "use-base-class-plus-spacing"
  description: "使用 wego-cell 基础 class + 业务类 wego-cell--compact 压缩内边距"
  html_example: |
    <li class="wego-cell wego-cell--compact"
        style="padding: var(--spacing-xs) var(--spacing-sm)">
  risk: "与正式变体样式可能存在细微视觉差异"
created_by: "wego-design"
created_at: "2026-07-12T10:00:00Z"
needs_system_review: true
hint_for_review: "建议在 cell.json 和 components.css 中增加 compact-slim 变体"
expires_at: "iter-005"  # 两个迭代内需处理
```

**4.2.2 流程变化**

```
发现 gap ──→ 创建 DDR
          → 在 design_plan 的 implementation_constraints 中记录 workaround
          → wego-ux 按 workaround 实现
          → 继续交付
          ↓
迭代结束后：
    wego-uxsystem-iterate 批量审查 DDRs
    → 升级到正式规则 OR close-as-wontfix
```

**4.2.3 批量审查流程**

```bash
node scripts/review-ddr.mjs  # 列出所有 open 状态的 DDR
```

审查结果：
- `resolved`：DDR 对应的规则已升级到设计系统，DDR 关闭
- `wontfix`：该 gap 是场景特有场景，不需要通用化，DDR 关闭
- `extend`：需要更多场景验证，延长期限

**4.2.4 收敛规则**

- 同一 gap_type 出现 3 次以上 → 自动标记 `needs_system_review: high`
- DDR 到期未审查 → wego-tests 验收时输出 warning
- 同一 DDR 延期超过 2 次 → 升级为正式 issue

**4.2.5 实现步骤**

1. 确定 DDR 存储位置（建议 `.codex/design-deviations/`）
2. 定义 DDR YAML schema
3. 修改 `wego-design/SKILL.md`：gap 时新增"创建 DDR"分支，不再阻塞
4. 修改 `wego-uxsystem-iterate/SKILL.md`：迭代模式增加"批量审查 DDR"步骤
5. 新增 `scripts/review-ddr.mjs`：DDR 列表与状态管理

**效果指标**：
- gap 导致链路阻塞的次数降至接近零
- 设计系统升级的驱动力从"人工发现"变为"自动积累"
- 每次迭代末有明确的 DDR 审查节奏

---

## 五、P2 方案概要

### 5.1 方案 E：正式阶段规格分层

**目标**：区分"必须手写"和"可自动生成"的规格内容，降低元数据维护负担。

**分层方案**：

| 层级 | 内容 | 生成方式 | 适用场景 |
|------|------|---------|---------|
| layer-1（核心） | `rule_sources_used` + `component_mapping` + `implementation_constraints` | 必须手写 | 所有场景 |
| layer-2a（结构） | `flow_to_surface_decisions` + `region_composition` | 新场景手写，已有场景可从原型自动提取 | 新场景 / 跨页面重构 |
| layer-2b（策略） | `page_strategy` + `page_presentation` | 可从原型自动提取 | 新场景 / 复杂场景 |

**自动化提取**：方案 C 落地后，`design_plan` 除了 `layer-1` 的核心字段外，其他均可从标注 HTML 自动生成。

---

## 六、实施路线图

### 6.1 阶段一（2-3 天）：P0 落地

```
Day 1:
  - 修改 wego-design SKILL.md：design_plan 增加 prompt_contract 产出
  - 修改 design-plan.md 参考文件：定义 prompt_contract 结构
  - 编写 validate-prompt-contract.mjs

Day 2:
  - 修改 wego-ux SKILL.md：Task Prompt 格式改为内联硬约束
  - 编写 validate-token-usage.mjs（v1：已知变量 + 已知 class + 禁止裸颜色）
  - 集成到 wego-ux 生成步骤中

Day 3:
  - validate-token-usage.mjs v2（圆角上限 + font-weight 数量 + 组件结构）
  - 端到端测试：选择一个已有场景，验证约束内联 + 守卫拦截效果
  - 修复发现的问题
```

### 6.2 阶段二（4-5 天）：P1 核心优化

```
Day 4-5:
  - 方案 C 实现
    - 修改 wego-design 产出 annotated HTML prototype 的能力
    - 编写 extract-design-decisions.mjs
    - 编写 generate-formal-plan.mjs

Day 6-7:
  - 方案 D 实现
    - 定义 DDR schema
    - 修改 wego-design gap 分支
    - 修改 wego-uxsystem-iterate 迭代模式

Day 8:
  - 端到端测试：完整跑一个新场景链路
  - 验证 gap 旁路 + design→html 直达
  - 修复问题
```

### 6.3 阶段三（1-2 天）：P2 + 收尾

```
Day 9:
  - 方案 E：正式阶段规格分层定义
  - 完善 extract-design-decisions.mjs → 支持自动提取 layer-2

Day 10:
  - 回归测试已有场景
  - 更新相关文档（specs/ 目录下的生成文档）
  - 初始化 DDR 存储目录
```

### 6.4 验证标准

| 验证项 | 通过条件 |
|--------|---------|
| 约束内联 | 新的 Task Prompt 格式包含 `prompt_contract`，不依赖外部文件路径 |
| Token 守卫 | 故意写错 Token 名时脚本报 error，阻止提交 |
| Gap 旁路 | 遇到未实现变体时，DDR 被创建且链路继续运行 |
| 原型直达 | wego-design 生成 HTML 而非纯文本规格，HTML 包含完整 `data-*` 标注 |
| 规格反向提取 | 从标注 HTML 提取的 `design_plan` 与手写版本无遗漏 |
| 回归不退化 | 已有场景通过验收 |

---

## 七、风险与应对

| 风险 | 概率 | 影响 | 应对 |
|------|------|------|------|
| wego-design 生成 HTML 的质量参差不齐 | 中 | 高 | 先通过 validate-token-usage.mjs 做质量门禁；原型阶段允许人工修正后再标注 |
| DDR 机制增加了管理负担 | 中 | 中 | DDR 数量少时人工管理；数量增长后（>20）开发 review-ddr 管理脚本 |
| 约束内联使 Prompt 变长 | 高 | 低 | prompt_contract 是结构化短字段（~30 行），不会导致 Token 溢出 |
| 现有场景需要回迁兼容 | 低 | 中 | 只要求新场景走新流程；已有场景在下次修改时逐步迁移 |
| 自动提取规格精度不够 | 中 | 中 | 自动提取结果作为 draft，人工校验后生效 |

---

## 八、关联文件清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `.codex/skills/wego-design/SKILL.md` | 修改 | design_plan 增加 prompt_contract；原型期支持 annotated HTML 产出 |
| `.codex/skills/wego-design/references/design-plan.md` | 修改 | 增加 prompt_contract 结构定义 |
| `.codex/skills/wego-ux/SKILL.md` | 修改 | Task Prompt 格式改为内联约束；集成 validate-token-usage 步骤 |
| `.codex/skills/wego-uxsystem-iterate/SKILL.md` | 修改 | 迭代模式增加 DDR 批量审查 |
| `.codex/wego-uxsystem-iterate/references/high-fidelity-prototype-baseline.md` | 修改 | 更新原型定稿条件 |
| `scripts/validate-token-usage.mjs` | 新增 | Token/class 自动化守卫 |
| `scripts/validate-prompt-contract.mjs` | 新增 | prompt_contract 完整性校验 |
| `scripts/extract-design-decisions.mjs` | 新增 | 从标注 HTML 提取决策链 |
| `scripts/generate-formal-plan.mjs` | 新增 | 从决策链生成正式 design_plan |
| `scripts/review-ddr.mjs` | 新增 | DDR 批量审查列表 |
| `docs/specs/*.md` | 重生成 | `node scripts/specs.mjs generate` 更新生成文档 |

---

## 附录：优化前后流程对比

### 原型期流程对比

**当前**：
```
User need → wego-product(简报) → wego-design(纯文本 plan) → wego-ux(转 HTML) → 用户看
```

**优化后**：
```
User need → wego-product(简报) → wego-design(标注 HTML) → 用户看
                                → (需要精化时) wego-ux 接续精化
```

### Gap 处理对比

**当前**：
```
发现 gap → 标记 gap → 阻塞 → 通知 wego-uxsystem-iterate → 修设计系统 → 继续
```

**优化后**：
```
发现 gap → 创建 DDR + 记录 workaround → 继续交付
          ↘ 迭代末 → 批量审查 DDR → 修设计系统
```

### 规格与实现关系对比

**当前**：
```
规格(手写) → 实现(手写) → 验收(对比) → 发现偏差 → 修正
```

**优化后**：
```
实现(标注 HTML) → 自动提取规格 → 验收(自动比对标注) → 低偏差
```
