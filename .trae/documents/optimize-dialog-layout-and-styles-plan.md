# 优化 dialog 组件内容布局与样式

## Summary

基于 Figma 设计稿（[wegoo 组件库 / Dialog_Text 节点 12977:13585](https://www.figma.com/design/gPGzasBhEboOcHM1b6TUsN/%F0%9F%93%98-wegoo-%E7%BB%84%E4%BB%B6%E5%BA%93?node-id=12977-13585)）对 dialog 组件做全面的视觉与结构对齐：

- 保留 `.dialog` 命名空间与 `.dialog__content` 类名（按用户此前决策）。
- 新增 `.dialog__body` 作为信息区包装层，统一控制信息区内边距与 12px 垂直间距。
- 调整标题、正文、按钮字号/字重/颜色，使其与设计稿一致。
- 重构按钮区：`.dialog__actions` 作为外层，内部用 `.dialog__buttons` 容器，并通过 `--dual` / `--triple` 控制布局；引入 `--dismiss` / `--confirm` / `--danger` / `--weak` 语义修饰类。
- 按钮区顶部增加 0.5px 内阴影分隔线，按钮间分隔线改为 0.5px。
- 保留 text / status / title / input 及扩展结构（链接、勾选项、自定义区）等全部现有变体。
- 同步更新契约、preview 示例、wego-app JS API、components.css 与 wego-app/lib 部署副本，递增 metadata version 并跑守门脚本。

## Current State Analysis

当前 dialog 已完成前序一轮架构重构（见 `.trae/documents/optimize-dialog-component-styles.md`）：

- `.dialog` 自身是 overlay 定位容器，`data-state="open/closed"` 状态机。
- `.dialog__card` 承载 300px 宽卡片、圆角 12px、阴影 xl，统一 padding 24px 20px。
- 内部结构为 `.dialog__header`（margin-bottom 12px）→ `.dialog__content`（margin-bottom 16px，14px text-secondary）→ `.dialog__input` → `.dialog__custom` → `.dialog__check` → `.dialog__actions`（margin-top 4px，直接包按钮）。
- `.dialog__title` 为 18px / semibold(600) / text-default。
- `.dialog__btn` 色调修饰类为 `--default`（text-default）、`--danger`（status-danger-default）、`--weak`（text-tertiary）。
- `wego-app/js/app.js` 已暴露 `dialog()` API 并生成上述 DOM。
- `metadata.json` version 当前为 `327`。

### Figma 设计稿关键规格

从 `get_design_context` 与截图提取：

- 卡片宽度 300px，圆角 12px，背景纯白。
- 信息区（标题+描述+自定义区）padding 24px 20px，flex 列布局，gap 12px，居中对齐。
- 标题：18px / Medium(500) / `#1E2028`（text_100）。
- 描述：16px / Regular(400) / `#1E2028`（text_100），line-height 1.5，支持内联链接 `#285b9a`（text_link_100）。
- 自定义区：保持开放 slot，不定义占位样式；"不再提示" checkbox 与 input 变体是自定义内容的标准使用场景。
- 按钮区：高度 48px，顶部有 0.5px 分隔线 `rgba(32,47,100,0.08)`（即 `--border-neutral-l2`）。
- 双按钮：左右等分，中间 0.5px 竖线；左侧"取消" `#1E2028`，右侧"确定" `#285b9a`。
- 三按钮：每个按钮通栏，按钮间 0.5px 横线；首个按钮为链接蓝，其余为 `#1E2028`。
- 单按钮：通栏居中。

### 当前实现与设计稿的核心差异

| 项目 | 当前实现 | 设计稿 |
|------|---------|--------|
| 标题字重 | 600 (semibold) | 500 (medium) |
| 描述字号 | 14px (body-md) | 16px (body-lg) |
| 描述颜色 | text-secondary (#6e7382) | text-default (#1e2028) |
| 信息区布局 | 各子元素 margin-bottom | flex column gap 12px |
| 信息区/按钮区分隔 | 无显式分隔，靠 margin | 0.5px 顶部内阴影分隔线 |
| 主操作按钮色 | text-default / status-danger | text-link (#285b9a) |
| 按钮分隔线 | 1px solid border-neutral-l2 | 0.5px |
| 三按钮布局 | 横向等分 | 纵向通栏 |

## Proposed Changes

### 1. `.codex/skills/wego-design/preview/component-dialog.html`

**What/Why/How：**

- **CSS 标记区（`@component-css-start` 与 `@component-css-end` 之间）：**
  - `.dialog__card`：移除统一 padding，改为 `overflow:hidden`（确保子元素不超出圆角），保持 `display:flex; flex-direction:column; align-items:center;`。
  - 新增 `.dialog__body`：
    - `width:100%; box-sizing:border-box;`
    - `padding: var(--spacer-24) var(--spacer-20);`
    - `display:flex; flex-direction:column; align-items:center; gap:var(--spacer-12);`
    - 内部所有直接子元素（`.dialog__header`、`.dialog__content`、`.dialog__input`、`.dialog__custom`、`.dialog__check`）去掉 `margin-bottom`，宽度 100%。
  - `.dialog__header`：去掉 `margin-bottom`，保持 `width:100%; justify-content:center; gap:8px;`。
  - `.dialog__title`：字重从 `--font-weight-semibold` 改为 `--font-weight-medium`。
  - `.dialog__content`：
    - 字号从 `--body-md-font-size` 改为 `--body-lg-font-size`（16px）。
    - 颜色从 `--text-secondary` 改为 `--text-default`。
    - 去掉 `margin-bottom`。
    - 保持 `line-height:1.5; text-align:center;`。
  - `.dialog__input` / `.dialog__custom` / `.dialog__check`：去掉 `margin-bottom`。
  - 不新增 `.dialog__custom--placeholder` 等占位样式：自定义区 `.dialog__custom` 保持开放 slot，由业务侧填充内容；"不再提示" checkbox 与 input 变体即为自定义内容的标准使用场景。
  - `.dialog__actions`：
    - 去掉 `margin-top`，改为 `width:100%;`。
    - 增加顶部内阴影分隔线：`box-shadow: inset 0 0.5px 0 0 var(--border-neutral-l2);`。
    - 保持 flex 容器属性，但按钮排列交由内部 `.dialog__buttons`。
  - 新增 `.dialog__buttons`：
    - `width:100%; display:flex; flex-direction:row; align-items:center; justify-content:center;`
    - 单按钮时按钮 `width:100%`。
  - `.dialog__buttons--dual`：子元素等分 `flex:1 0 0`，保持横向排列。
  - `.dialog__buttons--triple`：`flex-direction:column;` 每个子元素 `width:100%;`。
  - `.dialog__btn`：
    - 高度 48px，字号 `--body-lg-font-size`，字重 `--font-weight-medium`。
    - 单按钮容器下 `width:100%;`。
    - 双/三按钮容器下 `flex:1 0 0;`（三按钮时因容器是 column，flex-basis 控制高度，宽度已由容器 100% 决定）。
    - 保持 `:hover/:active` 背景反馈（`--bg-state-hover` / `--bg-state-pressed`）。
  - 新增语义修饰类：
    - `.dialog__btn--dismiss`：`color: var(--text-default);`（取消/关闭/否定）。
    - `.dialog__btn--confirm`：`color: var(--text-link);`（确定/提交/肯定，设计稿主操作蓝）。
    - `.dialog__btn--danger`：保留 `color: var(--status-danger-default);`（危险操作）。
    - `.dialog__btn--weak`：保留 `color: var(--text-tertiary);`（弱化操作）。
    - 保留 `.dialog__btn--default` 作为 `--dismiss` 的别名，确保旧示例兼容。
  - `.dialog__divider`：
    - 宽度从 1px 改为 0.5px；背景色保持 `--border-neutral-l2`。
    - 在三按钮容器下改为横向：`width:100%; height:0.5px;`。

- **HTML 示例：**
  - 所有示例的 `.dialog__card` 内部改为：`.dialog__body`（header + content/input/custom/check）→ `.dialog__actions` → `.dialog__buttons`（按钮 + 分隔线）。
  - text 双按钮示例：按钮区用 `.dialog__buttons.dialog__buttons--dual`，左侧按钮 `.dialog__btn.dialog__btn--dismiss`，右侧按钮 `.dialog__btn.dialog__btn--confirm`。
  - text 危险确认示例：右侧按钮 `.dialog__btn.dialog__btn--confirm.dialog__btn--danger`。
  - text 单按钮示例：`.dialog__buttons` 无修饰类，按钮 `.dialog__btn.dialog__btn--confirm`。
  - text 三按钮示例：`.dialog__buttons.dialog__buttons--triple`。
  - status/title/input 等变体同步调整。
  - 带链接正文示例保持 `.link.link--inline`，链接颜色已继承 `--text-link`。
  - 自定义区示例保持开放 slot 展示，不添加占位样式。

- **交互演示脚本：**
  - 更新 `showDialog` 生成逻辑：
    - 创建 `.dialog__body` 并把 header、content、input 等 append 到 body。
    - 创建 `.dialog__actions` → `.dialog__buttons`（带数量修饰类）→ 按钮 + 分隔线。
  - 按钮类名映射（按设计稿语义）：
    - `tone === 'danger'` → `.dialog__btn--danger`。
    - `tone === 'weak'` → `.dialog__btn--weak`。
    - 默认（主操作）→ `.dialog__btn--confirm`。
    - 如需要取消/关闭语义，可后续在 API 增加 `role` 参数；本次先保持 tone 映射，并在双按钮示例中左侧用 `--dismiss`、右侧用 `--confirm`。
  - 保留现有点击、遮罩、链接、input 自动聚焦、回车触发主按钮逻辑。

### 2. `.codex/skills/wego-design/components/dialog.json`

**What/Why/How：**

- **anatomy：**
  - 新增 `body` 项：`selector: ".dialog__body"`，`role: "信息区包装层，承载 header/content/input/custom/check，控制 24px 20px 内边距与 12px 垂直间距。"`
  - 新增 `buttons` 项：`selector: ".dialog__buttons"`，`role: "按钮容器，通过 --dual/--triple 控制横向双按钮或纵向三按钮布局。"`
  - 更新 `actions` 项 `role` 为："操作区外层，承载 `.dialog__buttons`，顶部有 0.5px 分隔线。"
  - 更新 `title` 项 `role` 补充："18px Medium，颜色 text-default。"
  - 更新 `content` 项 `role` 补充："16px Regular，颜色 text-default，line-height 1.5，支持内联链接。"
  - 更新 `btn` 项 `role` 补充："支持语义修饰类 --dismiss（text-default）、--confirm（text-link）、--danger（red）、--weak（text-tertiary）。"
  - 更新 `divider` 项 `role` 补充："0.5px，颜色 border-neutral-l2；在 --triple 容器下为横线。"

- **structurePatterns：**
  - 更新第 2 条为：".dialog__card 内部从上到下：`.dialog__body`（含 header + content + input + custom + check）→ `.dialog__actions`（含 `.dialog__buttons`）。"
  - 追加：".dialog__body 使用 flex column gap 12px 控制信息区内部间距，不再依赖各子元素 margin-bottom。"
  - 追加：".dialog__actions 与信息区之间通过 `box-shadow: inset 0 0.5px 0 0 var(--border-neutral-l2)` 形成顶部分隔线。"
  - 追加：".dialog__actions 内部必须包含 `.dialog__buttons`；按钮和分隔线放在该容器内。"
  - 追加："单按钮时 `.dialog__buttons` 不带修饰类；双按钮用 `.dialog__buttons--dual` 横向等分；三按钮用 `.dialog__buttons--triple` 纵向通栏。"
  - 追加："语义修饰类使用规则：--dismiss 用于取消/关闭/否定（text-default）；--confirm 用于确定/提交/肯定（text-link 蓝色）；--danger 用于危险操作；--weak 用于弱化操作。"
  - 保留其他规则（状态机、链接、input、自定义区、勾选项等）。

- **variantDimensions.buttonTone：**
  - 更新为 `["default", "danger", "weak", "confirm"]` 或保持 `["default", "danger", "weak"]` 但增加语义说明。
  - 推荐做法：保留 `buttonTone` 为 `["default", "danger", "weak"]`，新增 `buttonRole` 维度 `["dismiss", "confirm"]` 用于语义；但为简化，本次将 `--confirm` 作为 `--default` 在主操作场景下的语义别名，不新增维度。

- **representativeVariants：**
  - 无需新增/删除变体，但更新注释说明每个变体的按钮语义用法。

- **designTokens：**
  - 更新 `titleFont` 为 `var(--heading-sm-font-size) / var(--font-weight-medium) / var(--font-family-system)`。
  - 更新 `contentFont` 为 `var(--body-lg-font-size) / var(--font-family-system)`。
  - 更新 `contentColor` 为 `var(--text-default)`。
  - 更新 `btnColorDefault` 描述为"取消/关闭语义，对应 --dismiss"，颜色保持 `var(--text-default)`。
  - 新增 `btnColorConfirm`：`var(--text-link)`，"确定/提交语义，对应 --confirm"。
  - 新增 `actionsDividerShadow`：`inset 0 0.5px 0 0 var(--border-neutral-l2)`。
  - 新增/调整 `bodyPadding`：`var(--spacer-24) var(--spacer-20)`。
  - 新增 `bodyGap`：`var(--spacer-12)`。

- **domAnatomy.optionalChildren：**
  - 新增 `.dialog__body`、`.dialog__buttons`、`.dialog__buttons--dual`、`.dialog__buttons--triple`、`.dialog__btn--dismiss`、`.dialog__btn--confirm`。

- **tokensConsumed：**
  - 确认已包含 `--text-link`、`--border-neutral-l2`、`--font-weight-medium`、`--body-lg-font-size` 等；如缺失则补充。

### 3. `wego-app/js/app.js`

**What/Why/How：**

- 更新 `dialog()` 函数内部 DOM 构造：
  - 创建 `.dialog__body` 并把 header、content、input 等 append 到 body，再把 body append 到 card。
  - 创建 `.dialog__actions` → `.dialog__buttons`（带数量修饰类）→ 按钮 + 分隔线，再把 actions append 到 card。
- 按钮类名生成逻辑：
  - `tone === 'danger'` → `.dialog__btn--danger`。
  - `tone === 'weak'` → `.dialog__btn--weak`。
  - 默认 → `.dialog__btn--confirm`。
  - 如需取消语义，未来可扩展 `role: 'dismiss'`；本次保持默认映射。
- 更新选择器：回车触发主按钮从 `.dialog__btn` 查找不变。

### 4. `.codex/skills/wego-design/metadata.json`

**What/Why/How：**

- `version` 从 `327` 递增到 `328`（组件视觉与结构对齐设计稿，属于正式迭代）。

### 5. `.codex/skills/wego-design/components.css`

**What/Why/How：**

- 通过提取脚本重新生成，把 `preview/component-dialog.html` 标记区的新 CSS 写入 `components.css` 的 dialog 块。
- 不直接手改。

### 6. `wego-app/lib/components.css`

**What/Why/How：**

- 通过 `node scripts/sync-wego-app-lib.mjs` 同步 `.codex/skills/wego-design/components.css` 到部署副本。
- 不直接手改 lib 文件。

### 7. `wego-app/css/app.css`

**What/Why/How：**

- 检查 `.app-dialog-host .dialog` 规则是否需要调整；因根节点 `.dialog` 类名不变，该覆盖规则保持不变。
- 如 `.dialog__actions` / `.dialog__buttons` 在 phone-frame 内有特殊定位需求，按需补充覆盖（预计无需新增）。

## Assumptions & Decisions

1. **保留 `.dialog` 命名空间**：用户此前明确选择保留现有 `.dialog` 前缀，不迁移到 `wg-dialog`。
2. **保留 `.dialog__content` 类名**：正文区保持现有类名；不引入 `__description` 替代。
3. **按设计稿引入 `.dialog__body`**：为了精确复现设计稿的信息区内边距（24px 20px）与按钮区全宽顶部分隔线，必须新增 `.dialog__body` 包装层，把 `.dialog__card` 的统一 padding 下放到 body。
4. **主操作按钮使用蓝色（text-link）**：设计稿中"确定"按钮为 `#285b9a`，对应现有 token `--text-link`；通过新增 `.dialog__btn--confirm` 表达。
5. **危险操作仍保留红色**：设计稿未展示危险操作，但现有业务场景（删除/清空）需要，保留 `--danger`。
6. **取消/关闭语义映射 `--dismiss`**：颜色同 `--default`（text-default），作为取消/关闭类操作的语义表达。
7. **分隔线统一 0.5px**：按钮区顶部分隔线和按钮间分隔线均使用 0.5px，颜色 `--border-neutral-l2`。
8. **三按钮布局改为纵向通栏**：设计稿中三按钮为每个按钮占满一行，与当前横向等分不同。
9. **自定义区保持开放 slot**：不在组件 CSS 中定义占位样式；"不再提示" checkbox 与 input 变体是自定义内容的标准使用场景。
10. **保留全部现有变体**：text / status / title / input 及链接、勾选项等扩展结构全部保留，只调整布局与样式。

## Verification Steps

1. **修改 preview 与契约后**，在仓库根执行：
   ```bash
   node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design
   ```
2. **同步部署副本**：
   ```bash
   node scripts/sync-wego-app-lib.mjs
   ```
3. **守门验证**：
   ```bash
   node scripts/validate-wego-design.mjs
   ```
4. **静态检查**：
   - 确认 `preview/component-dialog.html` 所有示例使用了 `.dialog__body` + `.dialog__actions > .dialog__buttons` 结构。
   - 确认双按钮示例带 `.dialog__buttons--dual`，三按钮示例带 `.dialog__buttons--triple`。
   - 确认标题字重为 medium、描述字号为 16px 且颜色为 text-default。
   - 确认 `.dialog__actions` 有顶部内阴影分隔线，`.dialog__divider` 为 0.5px。
   - 确认 `components/dialog.json` anatomy / structurePatterns / domAnatomy / designTokens 已同步新选择器与 token。
   - 确认 `metadata.json` version 已递增。
5. **功能回归**：
   - 在浏览器打开 `preview/component-dialog.html`，检查所有静态 demo 展示正常，视觉贴近 Figma 设计稿。
   - 检查交互演示：点击触发按钮后 dialog 正常弹出，点击遮罩/按钮关闭，input 变体自动聚焦且回车触发主按钮。
6. **wego-app 回归**：
   - 打开 `wego-app/index.html`，在控制台执行：
     ```js
     window.wegoApp.dialog({
       variant: 'text',
       title: '标题',
       content: '弹窗内容，告知当前状态、信息和解决方法。',
       buttons: [
         { label: '取消', tone: 'default' },
         { label: '确定', tone: 'default' }
       ]
     });
     ```
   - 验证标题 18px medium、描述 16px text-default、主操作按钮蓝色、双按钮等分+分隔线、三按钮纵向通栏均正常。
