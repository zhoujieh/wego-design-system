# 历史归档文档 - wego 优化：实施规格

> **归档说明**：本文档为历史工作流计划，已不再作为当前重构依据。当前设计系统演进依据为 `docs/plans/wego-design-workflow-final-plan.md`。

> 只搬运 solo-design 中**上下文无关**的核心机制，去掉 wego 不存在的环节。
>
> wego 与 solo-design 的根本差异：
> - wego **没有**"选择 Design Library"环节——始终绑定微购设计系统
> - wego **没有**设备类型选择——始终移动端、微信生态
> - wego **没有** `.design` 画布项目——场景在 `wego-app/scenes/` 下
> - wego **没有**多 Agent 并行分发——技能间串行交接
> - wego **没有**独立 HTML 骨架脚本——场景在宿主壳内加载，CSS 引用由宿主保证
>
> 以下只包含 wego 确实需要、且能直接落地的东西。

---

## 对标一览（删减后）

| # | solo-design 可搬运的机制 | 搬运方式 | 改动 | 是否修改 SKILL.md |
|---|-------------------------|---------|------|-------------------|
| 1 | **Preview HTML 优先于 JSON 契约** | wego-design 消费组件时先读 Preview | 修改 `design-decisions.md` 消费顺序 | 是 |
| 2 | **Token 白名单内联** | design_plan 新增 `token_whitelist` | wego-design 增加产出 | 是 |
| 3 | **组件 class 直接给出，而非语义描述** | design_plan 新增 `component_class_map` | wego-design 增加产出 | 是 |
| 4 | **标注 HTML 替代纯文本 design_plan（原型期）** | wego-design 原型期出 data-\* 标注 HTML | wego-design 增加产出能力 | 是 |
| 5 | **后置守卫脚本检查 Token/class** | 新增 `validate-token-usage.mjs` | 新脚本 + wego-ux 集成 | 是 |
| 6 | **Gap 不阻塞（DDR）** | gap 时创建 DDR 记录，继续交付 | wego-design gap 分支修改 | 是 |

**不加的**（wego 没有对应环节）：
- 不搬 `dispatch-schema.md`（wego 无多 Agent 分发）
- 不搬 `fill-html-head.mjs`（场景在宿主壳内，CSS 由 host-shell 引用）
- 不搬 `orchestration-summary.json`（wego 无生成树/多页共享壳）
- 不搬 `styleContinuityAnchors`（始终 library-bound，无跨项目风格漂移风险）
- 不搬设计库解析步骤（微购设计系统固定，无选择/版本切换）
- 不搬 `page-generation-template.md`（wego-ux 已有 `interaction-implementation.md`）

---

## 1. Preview HTML 优先（不改 SKILL.md 也能生效）

### solo-design 做了什么

`dispatch-schema.md §3` + `sub-agent-hard-rules.md` 规定：

```
Component Plan 中每个组件必须包含 previewFile。
Sub-Agent 必须：
  1. [FIRST] 读 previewFile → 获取实际 DOM 结构、class 名、var(--xxx) 用法
  2. [THEN] 读 contractFile → 确认变体、状态、组合约束
```

为什么有效：Preview HTML 展示了**浏览器最终渲染的样子**——哪个元素用什么 class、哪里用 `var(--xxx)`、间距怎么铺。这些信息在 JSON 契约里只有语义描述"显示头像+昵称+描述"，AI 需要自行脑补成 DOM。

### wego 当前行为

`design-decisions.md` 上写的是"读取组件契约与 Preview"，但**不规定顺序**。实践中 AI 先读 JSON 契约（因为要写 design_plan 的组件映射），Preview 只作为"参考"。

结果：design_plan 写出"使用 cell avatar-description 变体，姓名 heading-xs"——wee-wego-ux 需要自己脑补这个组件的完整 DOM 结构。

### 改动

**改 `wego-design/references/design-decisions.md`**，在组件消费章节开头增加：

```markdown
## 组件读取顺序（硬约束）

| 顺序 | 来源 | 用途 |
|------|------|------|
| 1（强制先读） | `preview/component-{slug}.html` | 获取实际 DOM 结构、CSS class 名、Token 使用方式 |
| 2（后读） | `components/{slug}.json` | 确认变体列表、状态边界、组合约束 |

- 【强制】写 design_plan 的 component_mapping 前，必须先读 Preview HTML
- 【禁止】不读 Preview 就直接写组件映射
- component_mapping 中的 class 名必须来源于 Preview 中实际使用的 class
- 如果 Preview 展示的 class 结构与 JSON 契约的 anatomy 描述不一致 → 标记 gap 并创建 DDR
```

**改 `wego-design/SKILL.md`**，在"组件消费"步骤中增加一行引用：

```yaml
# 组件消费步骤中增加：
- 读取 Preview HTML 作为首要来源（规则见 design-decisions.md §组件读取顺序）
```

---

## 2. prompt_contract — Token 白名单 + 组件 class 直接给出

### solo-design 做了什么

`dispatch-schema.md §3` 的 `Actual Token Name Reference` 是一个表格：

```
Semantic Purpose | Actual tokenName
Primary bg       | brand-background  → 使用格式: var(--brand-background)
Body text        | body-md-font-size → 使用格式: var(--body-md-font-size)
```

**Sub-Agent 只能使用这个表格里的变量名，猜变量名是禁止的。**

`solo-design` 的 componentPlan 还给出每个组件的 `previewFile`，Sub-Agent 读 Preview 时直接看到 class 名和 DOM 结构，不需要猜测。

### wego 当前行为

`design-decisions.md` 第 6 条写：

```
.feed-item__author-name → --heading-xs-font-size，附内容角色和规则来源
```

这是**文本描述**。wego-ux 需要：
1. 读到这段文本
2. 记住 `--heading-xs-font-size` 这个变量名
3. 写 HTML 时拼成 `var(--heading-xs-font-size)`

没有白名单。没有禁止猜测。如果 wego-ux 写成了 `var(--heading-sm-font-size)`、`font-size: 16px` 或者 `var(--body-md-font-size)`，没有任何机制拦住它。

### 改动

**改 `wego-design/SKILL.md`**：design_plan 的 `surface_designs[]` 下新增 `prompt_contract` 字段：

```yaml
surface_designs:
  - surface_id: "surface-member-list"
    page_pattern: "object-list-page"
    
    # ↓↓↓ 新增 ↓↓↓
    prompt_contract:
      # 变量白名单（ux 必须遵守）
      token_whitelist:
        - var(--brand-primary)
        - var(--text-primary)
        - var(--text-secondary)
        - var(--text-tertiary)
        - var(--body-md-font-size)
        - var(--body-sm-font-size)
        - var(--heading-xs-font-size)
        - var(--heading-sm-font-size)
        - var(--state-danger)
        - var(--state-success)
        - var(--state-promotion)
        - var(--spacing-xs)
        - var(--spacing-sm)
        - var(--spacing-md)
        - var(--spacing-lg)
        - var(--radius-sm)
        - var(--radius-md)
      
      # 内容角色到 Token 的绑定映射
      token_bindings:
        - content_role: "用户姓名/对象名称"
          font_size: var(--heading-xs-font-size)
          color: var(--text-primary)
        - content_role: "描述/正文"
          font_size: var(--body-md-font-size)
          color: var(--text-secondary)
        - content_role: "页面标题"
          font_size: var(--heading-sm-font-size)
          color: var(--text-primary)
        - content_role: "辅助信息（时间/状态/计数）"
          font_size: var(--body-sm-font-size)
          color: var(--text-tertiary)
        - content_role: "促销价格"
          font_size: var(--heading-xs-font-size)
          color: var(--state-promotion)
        - content_role: "危险操作"
          color: var(--state-danger)
      
      # 组件 class 映射（class 名来自 Preview HTML，不是编的）
      component_class_map:
        - layout_slot: "成员列表项"
          class: "wego-cell wego-cell--avatar-description"
          variant: "avatar-description"
        - layout_slot: "主操作按钮"
          class: "wego-btn wego-btn--primary"
          variant: "primary"
        - layout_slot: "促销标签"
          class: "wego-tag wego-tag--promotion"
          variant: "promotion"
      
      # 硬性规则
      hard_rules:
        - "禁止硬编码颜色值——所有颜色用 token_whitelist 中的变量"
        - "禁止使用白名单之外的 CSS 变量"
        - "border-radius ≤ var(--radius-md)（8px）"
        - "一页仅一处 font-weight: 600"
```

**改 `wego-ux/SKILL.md`**：规定 UX 收到 Task 时，`prompt_contract` 必须展开在 Prompt 中，格式为：

```
### 设计约束（必须遵守）

Token 白名单：
  var(--brand-primary), var(--text-primary), var(--body-md-font-size), ...

Token 绑定（按场景使用，不可替换）：
  - 用户姓名 → font-size: var(--heading-xs-font-size), color: var(--text-primary)
  - 描述     → font-size: var(--body-md-font-size), color: var(--text-secondary)

组件 class（直接使用）：
  - 成员 cell    → wego-cell wego-cell--avatar-description
  - 主操作按钮   → wego-btn wego-btn--primary

硬性规则：
  - 禁止硬编码颜色值
  - border-radius ≤ 8px
  - 一页仅一处 font-weight: 600
```

---

## 3. 标注 HTML 原型（核心改动）

### solo-design 做了什么

`orchestration-summary.json` 的 `pages[]` 中，每页有 `visualNorthStar`、`compositionPattern`、`componentPlan`、`imagePlan`、`wiringPlan`。Main Agent 构建这些数据后分发给 Sub-Agent，Sub-Agent 直接生成 HTML。

关键：**设计决策（plan）和 HTML 生成在同一个 Agent 里完成**，没有"先写规格再转译"的步骤。

### wego 当前行为

```
prototype_brief（product）→ design_plan 纯文本（design）→ wego-ux 读 plan 写 HTML
                                                           ↑ 这里是信息衰减点
```

wego-ux 需要把自然语言规格（"使用 cell avatar-description 变体，姓名 heading-xs"）翻译成实际 DOM（`<div class="wego-cell wego-cell--avatar-description">...`）。每一次翻译都是衰减。

### 改动

**原型期**：wego-design 直接生成标注 HTML prototype，替代纯文本 `design_plan` 的产出。

**改 `wego-design/SKILL.md`**：

```yaml
## 原型期产出

原型期 wego-design 产出标注 HTML prototype，不再产出纯文本 design_plan。
标注 HTML 在已有场景模板基础上生成，包含以下 data-* 属性：

### data-* 标注属性

| 属性 | 必填 | 来源 | 示例 |
|------|------|------|------|
| `data-route-id` | 是 | prototype_brief | `member-list` |
| `data-surface-id` | 是 | prototype_brief.surfaces[].id | `surface-member-list` |
| `data-page-pattern` | 推荐 | uikit-plan.json pagePatterns[].slug | `object-list-page` |
| `data-dd-id` | 每个组件实例 | wego-design 自增编号 | `dd-003` |
| `data-rule-source` | 每个组件实例 | 组件名 + variant | `cell.json/variant:avatar-description` |
| `data-token-binding` | 每个 Token 绑定元素 | 语义:token | `font-size:heading-xs-font-size` |
| `data-region-id` | 每个 region | design 自定 | `region-list` |
| `data-region-role` | 每个 region | list/form/header/detail | `list` |

### HTML 标注示例

```html
<section data-surface-id="surface-member-list" data-route-id="member-list" data-page-pattern="object-list-page">
  <div data-region-id="region-search" data-region-role="search">
    <!-- 搜索区域 -->
  </div>
  <div data-region-id="region-list" data-region-role="list">
    <div class="wego-cell wego-cell--avatar-description"
         data-dd-id="dd-001"
         data-rule-source="cell.json/variant:avatar-description">
      <img class="wego-cell__avatar" src="" data-token-binding="size:spacing-xl" />
      <div class="wego-cell__content">
        <div class="wego-cell__title"
             style="font-size: var(--heading-xs-font-size); color: var(--text-primary)"
             data-token-binding="font-size:heading-xs-font-size;color:text-primary"
             data-content-role="user-name">
          {user_name}
        </div>
        <div class="wego-cell__description"
             style="font-size: var(--body-md-font-size); color: var(--text-secondary)"
             data-token-binding="font-size:body-md-font-size;color:text-secondary"
             data-content-role="description">
          {description}
        </div>
      </div>
      <span class="wego-icon-arrow-right"></span>
    </div>
  </div>
</section>
```

### 原型定稿条件

1. `data-*` 属性在关键元素上完整
2. 所有 Token 引用可用 `validate-token-usage.mjs` 校验通过
3. 所有组件 class 来源于正式组件索引
4. 无 `TODO`/`FIXME`/`lorem`/占位文案残留

### 正式阶段的规格生成

原型确认后，用 `extract-design-decisions.mjs` 从标注 HTML 自动提取决策链，自动补齐正式 `design_plan`：

```bash
node scripts/extract-design-decisions.mjs scenes/member-list/index.html --output scenes/member-list/design-decisions.json
```

`extract-design-decisions.mjs` 提取的内容：

```json
{
  "surface_id": "surface-member-list",
  "route_id": "member-list",
  "page_pattern": "object-list-page",
  "decisions": [
    {
      "dd_id": "dd-001",
      "rule_source": "cell.json/variant:avatar-description",
      "class_used": "wego-cell wego-cell--avatar-description",
      "token_bindings": [
        {"element": "user-name", "token_var": "var(--heading-xs-font-size)", "role": "识别信息"},
        {"element": "description", "token_var": "var(--body-md-font-size)", "role": "正文"}
      ]
    }
  ]
}
```

### wego-ux 原型精化流程

原型确认后，如果 UX 需要精化（完善交互、数据绑定、状态处理）：

1. UX 收到的输入是：**标注 HTML + design-decisions.json**（不是纯文本 plan）
2. UX 直接在标注 HTML 基础上精化，保留 `data-*` 属性
3. UX 生成后运行 `validate-token-usage.mjs`
4. 正式 design_plan 由 `extract-design-decisions.mjs` 从精化后的 HTML 自动提取
```

---

## 4. validate-token-usage.mjs — 后置守卫脚本

### solo-design 做了什么

`page-generation-quality-gate.md` 定义了 11+ 道门禁，Sub-Agent 生成页面后必须逐项自检。Main Agent 最后运行 `scan-design-directory.mjs` 做最终校验。

关键是：**错误在生成后即刻发现**，不是等到第三方验收。

### wego 当前行为

错误要到 wego-tests 验收才发现。反馈周期 = UX 生成 → wego-tests 验收。如果 wego-tests 移除，就没有任何兜底了。

### 改动

**新增 `scripts/validate-token-usage.mjs`**：

```javascript
// 用法: node scripts/validate-token-usage.mjs <场景HTML路径> [--css-index <css.json路径>] [--component-index <index.json路径>]
//
// 如果不传索引路径，默认使用:
//   css.json → .codex/skills/wego-design/css.json
//   component index → .codex/skills/wego-design/components/index.json
//
// 退出码: 0 = 通过, 1 = 有 error 级违规

// 校验规则（伪代码，实际约 200 行）:

// Rule 1: 未知 CSS 变量 [error]
// 提取 HTML 中所有 var(--xxx) 的引用
// 与 css.json 中的变量注册表比对
// 不在注册表中的 → error
// 示例出错: var(--heading-xs) 但正确是 var(--heading-xs-font-size)

// Rule 2: 未知 wego class [error]
// 提取所有 class 中以 wego- 开头的类名
// 与 components/index.json 中的组件 class 比对
// 不在注册表中的 → error
// 示例出错: wego-cell__avatar---wrong（多余横线）

// Rule 3: 裸颜色值 [warning]
// 扫描 style="color: #..." / background: #... / border-color: rgb(...)
// 发现裸 hex/rgb/hsl → warning
// 豁免: rgba(0,0,0,xxx), transparent, currentColor, inherit
// 此规则只报警告，因为有些场景确实需要裸值（如遮罩层透明度）

// Rule 4: 圆角越界 [error]
// 扫描 style 属性中的 border-radius 值
// > 8px → error
// 微购设计系统圆角上限为 8px（var(--radius-md)）

// Rule 5: font-weight 600 次数 [warning]
// 统计 font-weight: 600|bold|700 出现次数
// > 1 → warning（"一页一加粗"原则）

// Rule 6: 占位残留 [error]
// 扫描 TODO, FIXME, lorem, ipsum, "静态原型", "设计说明", "刷新说明"
// 发现 → error
```

**集成时机**：在 wego-ux 生成场景 HTML 后、提交前执行。

**改 `wego-ux/SKILL.md`**，在实现步骤末尾增加：

```yaml
## 生成后校验（必须执行）

场景 HTML 生成后，运行守卫脚本：
  node scripts/validate-token-usage.mjs scenes/{场景路径}/index.html

结果处理：
  - error 违规 → 修复后重新运行直到通过
  - warning 违规 → 记录到 scene.js 的 implementation_refs
  - 全部通过 → 提交
```

---

## 5. DDR — Gap 不阻塞

### solo-design 做了什么

遇到设计系统覆盖不了的地方 → **直接自由发挥**（free-explore 模式或按美学指南）。从不卡住。

### wego 当前行为

`design-decisions.md` 说"仍无法覆盖时标记 gap，不自由设计"。然后整条链路卡住，等修设计系统。

问题：设计系统永远不可能提前覆盖所有场景。每次迭代都可能遇到新 gap。每次都卡住不行。

### 改动

**改 `wego-design/SKILL.md`**，gap 处理分支改为：

```yaml
## Gap 处理

当 design_plan 的 surface 匹配遇到以下情况时：

| 场景 | 处理 |
|------|------|
| 无匹配 pagePattern/blueprint | 创建 DDR + 选择最近似的 pagePattern 作为临时方案 |
| 组件变体在 components.css 未实现样式 | 创建 DDR + 使用组件基础 class + 业务布局类调整 |
| 组件变体参数不适用当前布局 | 创建 DDR + 改用基础 class + 业务类提供尺寸 |
| 需要的组件完全不存在 | 创建 DDR + 使用 Tailwind utilities 实现基本布局 |

### DDR 记录格式

DDR 存储在 `.codex/design-deviations/` 下，YAML 格式：

```yaml
# .codex/design-deviations/ddr-003.yaml
record_id: "ddr-003"
status: "open"  # open | resolved | wontfix
gap_type: "variant-not-implemented"
gap_detail: "cell variant:compact-slim 在 components.css 未实现样式规则"
affected_surface: "surface-order-list"
affected_iteration: "iter-004"
workaround:
  strategy: "use-base-class-plus-spacing"
  description: "使用 wego-cell 基础 class + wego-cell--compact 压缩内边距"
  html_example: |
    <li class="wego-cell wego-cell--compact"
        style="padding: var(--spacing-xs) var(--spacing-sm)">
  risk: "与正式变体样式可能存在细微视觉差异"
created_by: "wego-design"
created_at: "2026-07-12"
needs_system_review: true
hint_for_review: "建议在 cell.json 和 components.css 中增加 compact-slim 变体"
expires_at: "iter-006"
```

### 流程变化

```
发现 gap
  → 创建 DDR（记录 gap 类型 + workaround 方案）
  → 在 design_plan 的 design_gaps[] 中记录 DDR ID
  → 继续交付，不阻塞
  ↓
迭代末:
  wego-uxsystem-iterate 审查所有 open DDR
    → resolved: 升级到正式规则
    → wontfix: 场景特有，关闭
    → extend: 再观察一轮
```

### 收敛规则

- 同一 gap_type 出现 3 次以上 → 自动标记 `needs_system_review: high`
- DDR 到期未审查 → 在迭代末报告中输出 warning
- 同一 DDR 延期超过 2 次 → 升级为正式 issue
```

---

## 实施清单（按执行顺序）

### 第一步：改 design_decisions.md

| 文件 | 改动 |
|------|------|
| `wego-design/references/design-decisions.md` | 组件消费章节开头增加"组件读取顺序"表格，规定 Preview HTML 优先 |

### 第二步：改 wego-design SKILL.md

| 改动项 | 内容 |
|--------|------|
| surface_designs 增加 prompt_contract | token_whitelist、token_bindings、component_class_map、hard_rules |
| 原型期产出改为标注 HTML | 定义 data-* 属性规范、定稿条件 |
| Gap 处理改为 DDR | 不再阻塞，创建 DDR + workaround 后继续 |

### 第三步：新增 validate-token-usage.mjs

| 方法 | 内容 |
|------|------|
| 编写脚本 | 6 条校验规则（未知 Token / 未知 class / 裸颜色 / 圆角越界 / font-weight 过多 / 占位残留） |
| 改 wego-ux SKILL.md | 实现步骤末尾集成此脚本 |

### 第四步：移除 wego-tests

| 操作 | 内容 |
|------|------|
| 删除 wego-tests/ 目录 | SKILL.md + 引用文件 |
| 更新 AGENTS.md | 路由表移除 wego-tests |

### 第五步：收尾

| 操作 | 命令 |
|------|------|
| DDR 存储目录初始化 | 创建 `.codex/design-deviations/` |
| 更新 specs 生成文档 | `node scripts/specs.mjs generate` |
| 完整验证 | `node scripts/validate-wego-design.mjs --scope=full --strict` |

---

## 这个东西到底解决了什么

| 问题 | 原因 | 怎么解决 |
|------|------|---------|
| Token 写错 | UX 凭记忆拼 var(--xxx) | prompt_contract.token_whitelist 给出确定的变量名 + 守卫脚本检查 |
| class 写错 | UX 凭记忆拼 wego-xxx | component_class_map 给出确定的 class 字符串 + 守卫脚本检查 |
| 组件结构不对 | UX 没读 Preview 脑补 DOM | 强制先读 Preview 再读契约 |
| 设计到实现信息衰减 | design 写文本 → ux 重新翻译 | 原型期 design 直接出标注 HTML，无需翻译 |
| Gap 卡住 | 标记 gap 后停止等待修系统 | DDR 旁路，先记后修 |
| 错误后置发现 | 错误要等验收才知道 | 守卫脚本生成后即刻拦截 |

不搬 solo-design 的：dispatch schema、fill-html-head.mjs、styleContinuityAnchors、orchestration-summary、设计库解析——这些 wego 要么没有对应环节，要么已有等效物，搬运只会增加无意义的复杂度。
