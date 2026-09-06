# 新增 dialog 组件计划

> 修订说明：本版根据用户反馈调整 5 处：①蒙层默认 30%（原 60%）；②title/content 不限制行数，改为引用通用文案精简规则；③状态图标在标题前方同行显示（不独占一行）；④新增 `input` 变体（单行输入场景，用于快速新建标签、来源等）；⑤删除"持续显示超过 10s"错误规则（dialog 是阻断式常驻，用户必须操作后才消失）。

## Summary

为 wego-design 设计系统新增 `dialog` 组件（居中确认弹窗），覆盖确认操作、重要提示、危险二次确认、单行快速输入场景。设计依据：Figma 设计稿（node 45:335）+ kuikly `Dialog.md` API 规格。归类为 `feedback` 类（与 toast 同类），与现有 toast（瞬时非阻塞提示）形成互补：dialog 是模态阻塞式确认，toast 是瞬时非阻塞告知。dialog 是阻断式常驻弹窗，用户必须通过按钮操作后才会消失，不设置自动关闭时长。

## Current State Analysis

### 现有体系
- wego-design 现有 18 个稳定组件，`feedback` 类只有 `toast` 一个
- `toast` 是瞬时浮层（z-toast=700，4s 自动消失），不阻塞用户
- 缺少**模态阻塞式确认弹窗**能力，业务场景里的"确认删除""确认提交""风险提示""快速新建"目前无组件可消费
- `uikit-plan.json` 的 `presentationPrimitives` 里 `modal` 类型描述了"当前页面上的轻量弹窗，用于确认、短提示"，但缺少对应的 DOM 组件契约
- `specs/文案与数据规范.md` 已有标点、着重、日期、数据格式等通用规则，但**没有"文案精简"通用原则**，需要本次顺便补充

### 设计稿分析（Figma 45:335）
Figma metadata 显示 Dialog 组件包含以下变体维度：
- **三种类型**：Dialog_Text（标题+正文+按钮）、Dialog_Status（标题+状态图标+正文+按钮）、Dialog_Title（仅标题+按钮）
- **按钮数量**：1 个 / 2 个 / 3 个（3 个标注"尽可能不用"）
- **按钮变体**：弱化（false/true）、危险（false/true）
- **蒙层深度**：30% / 60% / 80%
- **勾选项**：sfDialog 勾选项（"不再提示"类场景）
- **自定义区域**：sfXarea 自定义区域占位效果

### kuikly Dialog.md 关键规格
- 居中弹出，宽度固定 300f
- 结构：标题行（含可选状态图标 绿/红/黄）+ 内容区（可选，富文本，支持至多 2 处可点击链接）+ 自定义区（可选）+ 按钮行
- 按钮：左/右双按钮 或 仅右侧单按钮
- 按钮颜色预设：蓝（#285B9A）、绿（#03C160）、黑（#1E2028）、红（#FA5051）
- 关闭行为：点击遮罩（可选）、点击按钮（默认关闭）、点击链接（默认不关闭）
- conflicting 单例控制（默认 false，允许多开叠加）
- 默认遮罩半透明黑、动画 0.2s、zIndex 2000

### Token 与资源对齐
- `--bg-mask-light` (30%) / `--bg-mask-modal` (60%) / `--bg-mask-strong` (80%) — 蒙层三档已就位
- `--text-link` (#285b9a) — 蓝色链接，对应 kuikly BLUE
- `--text-brand` (#03c160) — 绿色，对应 kuikly GREEN
- `--text-default` (#1e2028) — 黑色，对应 kuikly BLACK
- `--status-danger-default` (#fa5051) — 红色，对应 kuikly RED
- `--z-modal` (600) — 模态层级（低于 toast 700，高于 overlay 500）
- iconfont 已有 `icon-gou`（对勾，success）、`icon-tanhao`（感叹号，warning/danger），无需引入新 SVG 资产
- `--radius-12` (12px) — 卡片圆角
- input 组件契约已有 `.input-wrapper > input` 结构，dialog 的 input 变体直接复用

## Proposed Changes

### 1. 新增组件契约 `.codex/skills/wego-design/components/dialog.json`

**核心字段设计：**

- `slug`: `dialog`
- `name`: `对话框`
- `category`: `feedback`
- `status`: `stable`
- `description`: 居中模态确认弹窗，用于确认关键操作、提示重要信息、展示带链接的说明文本或快速单行输入新建。模态阻塞式常驻，用户必须通过按钮操作后才会消失，不自动关闭；与 toast（瞬时非阻塞）互补。

- `variantDimensions`:
  - `variant`: `text` / `status` / `title` / `input`（对应 Figma 三类 + wego 扩展 input 类）
    - `text`: 标题 + 正文 + 按钮
    - `status`: 标题 + 状态图标 + 正文 + 按钮（图标在标题前方同行）
    - `title`: 仅标题 + 按钮（无正文）
    - `input`: 标题 + 单行输入框 + 按钮（用于快速新建标签、来源等简单业务数据）
  - `buttonCount`: `1` / `2` / `3`（`3` 标注"尽量避免"）
  - `buttonTone`: `default` / `danger` / `weak`
    - `default`: 黑色文字按钮（确认/取消）
    - `danger`: 红色文字按钮（删除/清空等危险操作）
    - `weak`: 灰色弱化按钮（次要操作）
  - `maskDepth`: `30` / `60` / `80`（**默认 `30`**）
  - `state`: `initial` / `visible` / `leaving`

- `representativeVariants`（10 个核心组合）:
  1. text + 2 按钮 + default（标准确认）
  2. text + 2 按钮 + danger（危险确认，如删除）
  3. text + 1 按钮 + default（单按钮告知，如"知道了"）
  4. status + 2 按钮 + default（带状态图标确认）
  5. status + 1 按钮 + default（带状态图标告知）
  6. status + 2 按钮 + danger（带状态图标危险确认）
  7. title + 2 按钮 + default（仅标题确认）
  8. text + 3 按钮 + default（三按钮，标注"尽量避免"）
  9. input + 2 按钮 + default（快速新建，如新建标签）
  10. input + 1 按钮 + default（快速新建单按钮，如"创建"）

- `anatomy`:
  - `root` `.dialog` — 浮层容器，承载遮罩 + 居中卡 + 定位 + 动画
  - `mask` `.dialog__mask` — 半透明遮罩，点击可关闭（受 maskClosable 控制）
  - `card` `.dialog__card` — 居中卡片容器，宽度 300px
  - `header` `.dialog__header` — 头部区，横向布局，含状态图标（可选）+ 标题
  - `icon` `.dialog__icon` — 状态图标（仅 status 变体），位于标题前方同行，success/warning/danger 三色
  - `title` `.dialog__title` — 标题文本，居中加粗
  - `content` `.dialog__content` — 正文区（可选），居中，支持富文本
  - `link` `.dialog__link` — 正文内可点击链接（至多 2 处）
  - `input` `.dialog__input` — 单行输入框（仅 input 变体），复用 input 组件的 `.input-wrapper > input` 结构
  - `custom` `.dialog__custom` — 自定义区域（可选 slot），位于正文下方
  - `check` `.dialog__check` — 勾选项（可选，"不再提示"场景），复用 checkbox 组件
  - `actions` `.dialog__actions` — 按钮行
  - `btn` `.dialog__btn` — 单个按钮
  - `divider` `.dialog__divider` — 多按钮之间的竖线分隔

- `structurePatterns`:
  - 根节点 `.dialog` 始终包含 `.dialog__mask` 与 `.dialog__card` 两个子节点
  - `.dialog__card` 内部从上到下：`.dialog__header`（含 icon + title）→ `.dialog__content`（可选）→ `.dialog__input`（仅 input 变体）→ `.dialog__custom`（可选）→ `.dialog__check`（可选）→ `.dialog__actions`
  - `.dialog__header` 采用横向布局（flex-direction: row），状态图标 `.dialog__icon` 与标题 `.dialog__title` 在同一行水平排列，图标在标题前方；无图标时标题独占一行居中
  - 状态图标尺寸 24px，与标题文字垂直居中对齐，图标与标题间距 8px
  - 正文链接通过 `.dialog__link` 标记，至多 2 处，蓝色文字
  - input 变体的 `.dialog__input` 复用 input 组件结构：`.input-wrapper > input[type=text]`，支持清除按钮；input 不带 `.field-label` 标签（标题已是上下文），placeholder 承担输入提示
  - 自定义区域 `.dialog__custom` 是开放 slot，可放置卡片、说明、预览等内容
  - 勾选项 `.dialog__check` 位于按钮行上方，复用 checkbox 组件结构
  - 单按钮通栏，双按钮左右等分 + 中间竖线分隔，三按钮左中右等分（尽量避免）
  - 按钮文字颜色由 `.dialog__btn--default` / `--danger` / `--weak` 修饰类控制

- `behavior`:
  - `closeByMask`: 默认 `true`，点击遮罩关闭；可通过修饰类 `--mask-unclosable` 关闭
  - `closeByButton`: 默认 `true`，点击任意按钮后自动关闭
  - `closeByLink`: 默认 `false`，点击链接默认不关闭（与 kuikly 一致）
  - `persistence`: **阻断式常驻，不自动关闭**，用户必须通过按钮操作后才会消失；不设置自动关闭时长（与 toast 的 4s 自动消失形成对比）
  - `conflicting`: 默认 `true`，同屏仅展示一个 dialog（新 dialog 出现时立即替换旧 dialog）
  - `position`: 居中悬浮，垂直水平双向居中
  - `animation`: 入场 fade + scale(0.95→1)，时长 var(--duration-normal)，缓动 var(--ease-enter)；出场反向 fade + scale(1→0.95)，时长 var(--duration-fast)，缓动 var(--ease-exit)
  - `zIndex`: var(--z-modal)=600，高于 overlay(500)，低于 toast(700) 和 critical(900)
  - `inputFocus`: input 变体打开时自动聚焦输入框，回车键触发主按钮（右侧按钮）点击

- `accessibility`:
  - `role`: `dialog`，`aria-modal="true"`
  - `labelRule`: 标题作为 dialog 的可访问名称，正文作为可访问描述
  - `focusTrap`: 打开时焦点锁定在 dialog 内，关闭后焦点返回触发元素
  - `textRule`: 标题和正文**默认不限制显示行数**，但文案应精简表达（参见 `specs/文案与数据规范.md#文案精简原则`）；dialog 不对文本做截断处理，由业务侧保证文案质量

- `usageHints`:
  - 用于确认关键操作（删除、清空、提交、扣费）或展示必须阅读的重要信息
  - 危险操作（删除/清空/停用）使用 `buttonTone: danger` 红色按钮
  - 状态图标选择：success 用于成功告知，warning 用于注意/中性提示，danger 用于警告/危险
  - 单按钮用于纯告知（"知道了""好的"），双按钮用于确认/取消，三按钮尽量避免（如需三按钮考虑用 ActionSheet）
  - input 变体用于快速新建标签、来源、分类等简单业务数据；多字段表单或复杂编辑场景使用 full-screen-modal 而非 dialog
  - 与 toast 的区别：dialog 阻塞用户必须选择，toast 瞬时自动消失；需要用户决策用 dialog，只需告知用 toast
  - 与 sheet 的区别：sheet 是底部弹层用于筛选/选择器，dialog 是居中弹窗用于确认
  - 与 full-screen-modal 的区别：full-screen-modal 用于复杂编辑流程，dialog 用于轻量确认和快速输入

- `doNotInvent`:
  - 不要在 dialog 内放置多字段表单、多选列表、上传等复杂交互组件（那是 modal/sheet/full-screen-modal 的职责）；单行 input 仅用于快速新建标签、来源等简单业务数据
  - 不要超过 3 个按钮；3 个按钮尽量避免，优先用 ActionSheet
  - 不要自定义按钮颜色，仅允许 default/danger/weak 三种预设
  - 不要持久化 dialog 状态到 localStorage
  - 不要给 dialog 设置自动关闭时长（dialog 是阻断式常驻，必须由用户操作触发关闭）

- `tokensConsumed`:
  - `--bg-mask-light`, `--bg-mask-modal`, `--bg-mask-strong`（蒙层三档）
  - `--bg-surface`（卡片背景）
  - `--text-default`, `--text-secondary`, `--text-link`, `--text-brand`, `--text-tertiary`
  - `--status-success-default`, `--status-warning-default`, `--status-danger-default`
  - `--font-family-icon`, `--font-family-system`
  - `--heading-sm-font-size`, `--body-lg-font-size`, `--body-md-font-size`
  - `--font-weight-semibold`, `--font-weight-medium`
  - `--spacer-16`, `--spacer-20`, `--spacer-24`, `--spacer-12`, `--spacer-8`
  - `--radius-12`, `--radius-8`, `--radius-6`（input 复用）
  - `--stroke-hairline`, `--border-neutral-l2`
  - `--shadow-lg`
  - `--duration-normal`, `--duration-fast`, `--ease-enter`, `--ease-exit`
  - `--z-modal`
  - `--size-24`（图标尺寸）
  - input 变体额外消费：`--bg-muted`, `--text-placeholder`, `--border-neutral-l2`（复用 input 组件 Token）

- `designTokens`:
  - `cardWidth`: `300px`（对应 kuikly 300f）
  - `cardRadius`: `var(--radius-12)`
  - `cardBg`: `var(--bg-surface)`
  - `cardShadow`: `var(--shadow-lg)`
  - `cardPadding`: `var(--spacer-24) var(--spacer-20)`（上下 24，左右 20）
  - `maskBg`: `var(--bg-mask-light)`（**默认 30%**）
  - `titleFont`: `var(--heading-sm-font-size) / var(--font-weight-semibold) / var(--font-family-system)`
  - `titleColor`: `var(--text-default)`
  - `contentFont`: `var(--body-md-font-size) / var(--font-family-system)`
  - `contentColor`: `var(--text-secondary)`
  - `linkColor`: `var(--text-link)`
  - `iconSize`: `var(--size-24)`
  - `iconTitleGap`: `var(--spacer-8)`（图标与标题间距）
  - `iconColorSuccess`: `var(--status-success-default)`
  - `iconColorWarning`: `var(--status-warning-default)`
  - `iconColorDanger`: `var(--status-danger-default)`
  - `btnColorDefault`: `var(--text-default)`
  - `btnColorDanger`: `var(--status-danger-default)`
  - `btnColorWeak`: `var(--text-tertiary)`
  - `btnFont`: `var(--body-lg-font-size) / var(--font-weight-medium)`
  - `btnHeight`: `48px`
  - `dividerColor`: `var(--border-neutral-l2)`
  - `enterScale`: `0.95`
  - `leaveScale`: `0.95`
  - `enterDuration`: `var(--duration-normal)`
  - `leaveDuration`: `var(--duration-fast)`
  - `enterEase`: `var(--ease-enter)`
  - `leaveEase`: `var(--ease-exit)`

- `cssCustomProperties`:
  - `--dialog-width`: `300px`（卡片宽度，业务可覆盖）
  - `--dialog-mask-depth`: `var(--bg-mask-light)`（蒙层深度，默认 30%，可覆盖为 modal/strong）
  - `--dialog-enter-scale`: `0.95`（入场缩放起点）
  - `--dialog-mask-closable`: `1`（是否允许点击遮罩关闭，0=禁止）

- `specRefs`:
  - `specs/交互设计原则.md`（modal primitive 定义）
  - `specs/文案与数据规范.md`（文案精简原则）

- `domAnatomy`:
  - `root`: `.dialog`
  - `modifiers`:
    - `.dialog--text`, `.dialog--status`, `.dialog--title`, `.dialog--input`（变体）
    - `.dialog--mask-unclosable`（禁止点击遮罩关闭）
    - `.dialog.is-floating`, `.dialog.is-visible`, `.dialog.is-leaving`（状态）
  - `optionalChildren`:
    - `.dialog__mask`, `.dialog__card`, `.dialog__header`, `.dialog__icon`, `.dialog__title`
    - `.dialog__content`, `.dialog__link`
    - `.dialog__input`（input 变体专用，内部复用 `.input-wrapper > input`）
    - `.dialog__custom`, `.dialog__check`
    - `.dialog__actions`, `.dialog__btn`, `.dialog__divider`
    - `.dialog__icon--success`, `.dialog__icon--warning`, `.dialog__icon--danger`
    - `.dialog__btn--default`, `.dialog__btn--danger`, `.dialog__btn--weak`

- `provenance`:
  - `preview`: `preview/component-dialog.html`
  - `cssSource`: `preview/component-dialog.html`
  - `embedded`: false
  - `hostComponent`: null

### 2. 新增 preview `.codex/skills/wego-design/preview/component-dialog.html`

参考 `component-toast.html` 的演示模式：

- **头部**：引入 colors_and_type.css、scaffold.css、iconfont.css
- **静态展示区**：
  - 文本对话框（text 变体）：1 按钮 / 2 按钮 default / 2 按钮 danger / 3 按钮
  - 状态对话框（status 变体）：success 图标 / warning 图标 / danger 图标（图标在标题前方同行）
  - 仅标题对话框（title 变体）：2 按钮 default / 1 按钮
  - 输入对话框（input 变体）：新建标签（2 按钮）/ 新建来源（1 按钮）
  - 带链接正文：单链接 / 双链接
  - 带自定义区域：扣费提示示例
  - 带勾选项："不再提示"示例
- **交互演示区**：
  - 多个触发按钮，点击后弹出真实 dialog
  - 演示同屏互斥（conflicting）
  - 演示点击遮罩关闭、点击按钮关闭、点击链接不关闭
  - 演示 input 变体自动聚焦、回车触发主按钮
- **组件 CSS** 在 `/* @component-css-start */` 与 `/* @component-css-end */` 标记区内
- **JS 逻辑**：参考 toast 的 is-floating/is-visible/is-leaving 状态机，实现 dialog 打开/关闭动画；input 变体额外实现自动聚焦和回车触发

### 3. 注册到 `.codex/skills/wego-design/components/index.json`

在 `components` 数组追加：
```json
{
  "slug": "dialog",
  "name": "对话框",
  "category": "feedback",
  "status": "stable",
  "preview": "preview/component-dialog.html"
}
```

### 4. 同步 `.codex/skills/wego-design/library-consumption.json`

- `supportComponents` 数组追加 `"dialog"`
- `allowedComponents`（在 uikit-plan.json 中）追加 `"dialog"`
- `downstreamScenarios.buildMobileAppPage.copyFiles` 不变（dialog 是组件，不是资产）

### 5. 同步 `.codex/skills/wego-design/uikit-plan.json`

- `allowedComponents` 追加 `"dialog"`
- `supportEvidenceComponents` 追加：
  ```json
  {
    "slug": "dialog",
    "reason": "居中模态确认弹窗，用于确认操作、风险提示、重要信息告知和快速单行输入新建。",
    "evidenceFile": "components/dialog.json",
    "previewFile": "preview/component-dialog.html",
    "priority": 18,
    "slot": "confirmation-overlay"
  }
  ```

### 6. 同步 `.codex/skills/wego-design/README.md`

- "当前组件"章节：`稳定组件共 18 个` → `稳定组件共 19 个`
- 组件清单追加 `- dialog`

### 7. 同步 `.codex/skills/wego-design/SKILL.md`

- 无需大改，SKILL.md 不维护组件清单（清单在 README.md 和 index.json）

### 8. 同步 `.codex/skills/wego-design/specs/文案与数据规范.md`（新增通用文案精简原则）

在文件末尾新增"文案精简原则"章节（通用规则，不单指 dialog）：

```markdown
## 文案精简原则

移动端屏幕空间有限，所有 UI 文案应遵循精简原则，确保用户快速理解核心信息：

| 场景 | 规则 | 示例 |
|------|------|------|
| 标题 | 用动词或短语直接表达核心动作或结果，避免长句 | "确认删除？" 而非 "您是否确认要执行删除操作？" |
| 正文 | 仅保留用户决策必需的信息，背景和细节交给上下文 | "删除后无法恢复" 而非 "请注意，删除操作执行后将无法恢复数据" |
| 按钮 | 用 2-4 字动词短语，避免名词或长句 | "删除"、"取消"、"知道了" 而非 "确认删除"、"取消操作" |
| 链接 | 用专有名词或简短词组，不加"点击查看"等引导语 | "服务协议" 而非 "点击查看服务协议" |
| 提示 | 优先用结构（图标、状态、分组）表达，不重复说明 | 避免在禁用项旁补"此项不可选"说明 |

精简不等于省略：用户决策必需的风险、时效、不可逆后果等信息必须保留，只删除冗余修饰词和重复表达。
```

### 9. 递增 `.codex/skills/wego-design/metadata.json`

- `version`: `325` → `326`

### 10. 运行提取脚本

```bash
node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design
```

生成 `.codex/skills/wego-design/components.css` 中 dialog 组件的聚合样式。

### 11. 运行守门验证

```bash
node scripts/validate-wego-design.mjs
```

确认 JSON 格式、Token 同步、组件三向对齐、components.css 完整性、metadata version 等通过。

## Assumptions & Decisions

1. **状态图标用现有 iconfont**：`icon-gou`（对勾）= success，`icon-tanhao`（感叹号）= warning/danger，通过 CSS 颜色区分（绿/黄/红），不引入新 SVG 资产
2. **状态图标在标题前方同行显示**：`.dialog__header` 采用横向 flex 布局，icon + title 同行水平排列，图标在标题前方，间距 8px，垂直居中对齐；无图标时标题独占一行居中
3. **按钮颜色收敛为 3 种预设**：`default`（黑色）、`danger`（红色）、`weak`（灰色），与 button 组件 emphasis 体系对齐；kuikly 的 4 色中蓝色对应 wego 的 default（黑色为主操作），绿色较少用于确认按钮，故不单独开放
4. **勾选项纳入契约**：Figma 明确有 sfDialog 勾选项 symbol，支持"不再提示"场景，复用 checkbox 组件结构
5. **自定义区域纳入契约**：kuikly 支持 customContent，通过 `.dialog__custom` slot 开放
6. **蒙层默认 30%**：用 `--bg-mask-light`，开放 `--dialog-mask-depth` CSS 变量覆盖到 60%/80%
7. **宽度 300px**：对应 kuikly 300f，开放 `--dialog-width` 覆盖
8. **z-index 用 --z-modal (600)**：高于 overlay(500)，低于 toast(700)，与 specs/交互设计原则.md 的 modal primitive 定义一致
9. **3 按钮变体纳入契约但标注"尽量避免"**：Figma 明确有这个变体，使用场景如"保存草稿/不保存/取消"
10. **preview 用 JS 演示真实交互**：参考 toast 的 is-floating/is-visible/is-leaving 状态机，不新增独立"交互演示"模块，交互并回原有变体示例
11. **conflicting 默认 true**：与 toast 一致，同屏互斥，新 dialog 替换旧 dialog
12. **点击链接默认不关闭**：与 kuikly 一致，避免用户误触丢失上下文
13. **不引入新的页面范式**：dialog 是组件，不是 pagePattern；它服务于现有 pagePattern 的确认场景
14. **input 变体是 wego 扩展**：Figma/kuikly 没有 dialog 内置 input 变体（kuikly 靠 customContent 承载），wego 将其收敛为独立稳定变体 `input`，复用 input 组件的 `.input-wrapper > input` 结构，不带 field-label（标题已是上下文）
15. **title/content 不限制行数**：dialog 不做文本截断，由业务侧遵循 `specs/文案与数据规范.md#文案精简原则` 保证文案质量；该原则是通用规则，本次顺便回流到 specs
16. **dialog 阻断式常驻，不自动关闭**：删除原"持续显示超过 10s"错误规则；dialog 必须由用户操作（按钮/遮罩）触发关闭，不设置自动关闭时长

## Verification Steps

1. **静态扫描**：
   - 确认 `components/dialog.json` 字段完整且与 toast.json 结构对齐
   - 确认 `preview/component-dialog.html` 标记区外样式只服务演示壳
   - 确认 `components/index.json`、`library-consumption.json`、`uikit-plan.json`、`README.md` 中 dialog 信息一致
   - 确认 `specs/文案与数据规范.md` 已新增"文案精简原则"章节
2. **运行提取脚本**：`node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`，确认 `components.css` 带出 dialog 样式且无无关组件 diff
3. **运行守门**：`node scripts/validate-wego-design.mjs` 通过
4. **确认 metadata.json.version 已递增**：325 → 326
5. **确认没有直接编辑 components.css**：所有组件样式只改 preview 标记区
6. **确认 iconfont 引用**：preview 中状态图标使用 `icon-gou` / `icon-tanhao`，不引入新 SVG 或 CDN
7. **确认 Token 消费**：所有颜色、间距、字号、圆角、动画时长均引用 var(--token)，不硬编码 hex/rem
8. **确认交互演示并回原场景**：不新增独立"交互演示"面板，触发按钮在原有变体示例区
9. **确认状态图标布局**：preview 中 status 变体的图标在标题前方同行显示，不独占一行
10. **确认 input 变体**：preview 中 input 变体复用 `.input-wrapper > input` 结构，不带 field-label，自动聚焦且回车触发主按钮
11. **确认蒙层默认 30%**：preview 中默认 dialog 蒙层使用 `--bg-mask-light`（30%）
12. **确认无自动关闭规则**：契约和 preview 都不设置 dialog 自动关闭时长
