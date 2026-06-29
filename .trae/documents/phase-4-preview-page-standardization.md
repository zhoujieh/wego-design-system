# 阶段 4：规范预览页 — 实施计划

## 摘要

规范所有 17 个预览页（`preview/component-*.html`），使其成为可靠的组件 CSS 权威来源。阶段 2 已完成标记块内硬编码色值的清理，本阶段聚焦：**沉淀预览页脚手架规范与 scaffold.css**（先做，出范例确认）、**精简预览页布局与内容**（参考 TRAE 结构但保持 wegoux 移动端定位）、**内联 SVG 改为 iconfont/随库资产**、**统一 CSS 引入方式**、**消除跨组件 CSS 重复**。

## 当前状态（阶段 2 完成后）

- 17 个预览页全部有 `@component-css-start/end` 标记，覆盖率 100%。
- **标记块内硬编码色值：已全部清理**（阶段 2 完成），`components.css` 已重新生成，`css.json` 已同步。
- **内联 SVG 问题仍存在**：bottom-nav（约 20 个 SVG）、checkbox（约 12 处 + JS 常量，勾选保留内联 SVG）、cell（约 6 处，勾选和退格保留内联 SVG）、form（counter/radio/dropdown 约 6 处）、tag（tag__close 约 12 处）。
- **CSS 引入不统一**：7 个文件引入了 `components.css`（部分应移除），7 个文件缺少 `iconfont.css`（应补充），无 scaffold.css。
- **form 预览页**在标记块外复制了完整的 button CSS（第 17-38 行），存在同步风险。
- **预览页脚手架样式重复**：`body`、`.section-title`、`.row`、`.label`、`.divider` 在各页面中重复定义，值不完全一致（如 `.row` gap 有 `var(--space-8)` 和 `20px` 两种，`.label` font-size 有 `12` 和 `10` 两种）。
- **预览页布局无统一结构**：没有页面级标题（pv-header），分区靠手动 `<hr class="divider">`，部分页面 demo 样式过重（switch 约 15 个 scaffold 选择器 + 50 行 HTML + 20 行 JS）。

## 组件命名

- **chip → tag**：组件 slug 从 `chip` 统一改为 `tag`，涉及文件：
  - `preview/component-chip.html` → `preview/component-tag.html`
  - `components/chip.json` → `components/tag.json`
  - `components/index.json` 中 `chip` → `tag`
  - `components.css` 中的 `/* ── chip ── */` → `/* ── tag ── */`（由脚本重新生成，无需手动改）
  - 其他引用 `chip` 的文件（README、SKILL、uikit-plan、library-consumption 等）

## 实施步骤

### ~~步骤 1：补齐缺失语义 Token~~ ✅ 已在阶段 2 完成

### ~~步骤 2：清理标记块内硬编码色值~~ ✅ 已在阶段 2 完成

### 步骤 3：沉淀预览页脚手架规范与布局规范（先做，出范例确认）

**背景**：参考 TRAE 的 `scaffold.css` + `pv-header/pv-section` 结构模式，但保持 wegoux 浅色移动端定位。不照搬 TRAE 的暗色 IDE 视觉、桌面字号、`text-transform: uppercase`、`clamp()` 响应式。

#### 3.1 审计现有脚手架样式

扫描 17 个预览页的标记块外 CSS，归纳 scaffold 选择器和使用频率：
- `body`（17/17）、`.row`（~14）、`.label`（~14）、`.section-title`（~12）、`.divider`（~10）
- `.page`（cell）、`.section-group`（cell）、`.section-gap`（cell）、`.preview-phone`（navbar/bottom-nav）、`.dark-strip`（switch）

#### 3.2 撰写预览页规范

新建 `specs/预览页规范.md`，涵盖两部分：

**A. 预览页脚手架规范**
- 每个 scaffold 选择器的用途、统一后的样式值
- 明确约束：只用于预览页和 UI Kit，不用于生产组件
- 不包含真实组件样式，不引入暗色 IDE 视觉

**B. 预览页布局规范（参考 TRAE 最佳实践）**
- 统一 DOM 结构模式：
  ```
  <body>
    <div class="pv-header">
      <h1>组件名</h1>
      <p>一句话说明</p>
    </div>
    <div class="pv-section">
      <div class="pv-section__title">分区标题</div>
      <!-- 组件样本 -->
    </div>
  </body>
  ```
- 分区间距靠 `pv-section` 的 margin 自动分隔，取消手动 `<hr class="divider">`
- `.pv-header` 提供组件名称和描述，有底线分隔
- 标记外 demo 样式克制化：交互 JS 作为可选增强，demo 模拟 UI（如 switch 的 `.setting-row`）需精简
- 预览内容精简原则：
  - 同一变体不在多个分区重复展示
  - 优先结构化矩阵展示（variant × state × size），而非逐行列出
  - demo 业务场景展示最多 1 个分区，不占主体

#### 3.3 创建 `scaffold.css`

新建 `.design_library/wegoux/scaffold.css`：
- 提供 `pv-header`、`pv-section`、`pv-section__title`、`pv-section__sub`、`.row`、`.label`、`.page`、`.preview-phone` 等
- 使用 `var()` 引用 Token，不 `@import` colors_and_type.css
- 不含组件样式
- 文件头注释说明用途和约束

#### 3.4 改造范例预览页

选择 `component-button.html` 作为范例：
- 引入 `scaffold.css`，删除标记块外的 scaffold CSS
- 应用新的 `pv-header/pv-section` 布局结构
- 精简重复展示内容（去掉与前面分区重复的"完整矩阵"）

**范例通过用户确认后**再批量迁移。

### 步骤 4：chip → tag 组件重命名

批量重命名涉及的文件和引用。

### 步骤 5：内联 SVG 替换

#### 内联 SVG 替换优先级规则（按优先级从高到低）

1. **`assets/icons/` 中有对应 SVG 文件** → 改为 `<img src="../assets/icons/xxx.svg">` 引用
2. **iconfont 中有对应图标** → 改为 `<i class="wego-iconfont-s icon-xxx"></i>`
3. **`assets/icons/` 和 iconfont 都没有** → 保留内联 SVG 不动
4. **checkbox 勾选 / cell 退格减号** → 用户明确要求保留内联 SVG，无论 iconfont 是否有对应图标

**注意**：radio 圆点 SVG（含硬编码 `#03C160`）属于特殊情况——不是替换图标问题，而是消除硬编码色值。改为 CSS pseudo-element 方案处理。

#### 5.1 bottom-nav Tab 图标

`assets/icons/` 中已有 5 对专用 SVG，符合优先级 1。
- HTML 中内联 SVG → `<img>` 引用
- JS 中 ICONS 对象 → 路径映射，动态替换 `img.src`

#### 5.2 cell 中的内联 SVG

- checkbox 勾选 → **保留内联 SVG**（优先级 4）
- radio 圆点 → CSS pseudo-element（消除 `#03C160` 硬编码）
- 退格减号 → **保留内联 SVG**（优先级 4）

#### 5.3 form 中的内联 SVG

- counter 加减 → iconfont `icon-jian16` / `icon-jia16`（优先级 2）
- radio 圆点 → CSS pseudo-element
- dropdown 勾选 → iconfont `icon-gou16`（优先级 2）

#### 5.4 tag tag__close

- `.tag__close` SVG → iconfont `icon-cha16`（优先级 2）
- `.tag__icon-left` 加号 SVG → iconfont `icon-jia16`（优先级 2）

### 步骤 6：统一 CSS 引入方式

- **移除 `components.css`**：badge, switch, stack, checkbox（4 个）
- **保留 `components.css`**：cell, form, bottom-nav（3 个，复用跨组件样式）
- **新增 `iconfont.css`**：avatar, card, tag, image, input, link, bottom-nav（7 个）

### 步骤 7：消除 form 预览页 button CSS 重复副本

form 保留 `components.css` 引入，删除第 17-38 行的 button CSS 副本。

### 步骤 8：重新生成 `components.css` 并验证

1. 运行 `node scripts/extract-components-css.mjs .`
2. 验证 `components.css` 文件头保留 `DO NOT EDIT MANUALLY`
3. 验证标记块内无 raw hex

### 步骤 9：同步组件契约 + 文档 + 递增版本

- 同步步骤 5-7 中有改动组件的 `components/{slug}.json`
- 同步 README.md、SKILL.md、AGENTS.md
- 递增 `metadata.json` version

## 迭代守门规则

为避免方向漂移，后续对预览页的任何修改都需遵守以下规则：

### 禁止方向

- 不把 scaffold 样式放回预览页内联（必须引入 `scaffold.css`）
- 不新增硬编码色值到标记块内（必须用 `var()` Token）
- 不在 scaffold.css 中放真实组件样式
- 不照搬 TRAE 的暗色背景、桌面字号、IDE 视觉
- 不新增 `components.css` 引入到自身组件预览页（如 badge 预览不应引入 `components.css`）
- 不新增复杂的 demo 模拟 UI（标记外 demo 样式应克制）
- 不在预览页中使用 Lucide/CDN 图标（只用 iconfont 或 `assets/icons/`）

### 必须方向

- 新增预览页必须引入 `scaffold.css` + `colors_and_type.css` + `iconfont.css`
- 新增预览页必须使用 `pv-header/pv-section` 结构
- 组件 CSS 必须在 `@component-css-start/end` 标记块内
- 标记块外的样式只能用 `pv-*`、`.row`、`.label`、`.page`、`.preview-phone`、`.dark-strip` 等 scaffold 选择器
- 内联 SVG 遵循 4 级优先级替换规则
- 修改 `components/{slug}.json` 后必须同步 `components/index.json`、`uikit-plan.json`、`library-consumption.json`

### 提交前检查

- `colors_and_type.css` 与 `css.json` 同步
- `components.css` 通过脚本重新生成（非手动编辑）
- `AGENTS.md` 中的组件发布规则遵守
- 组件数量与 `components/index.json` 一致

## 不做的事

- 不修改 UI Kit（阶段 6 任务）
- 不升级组件契约 schema（阶段 3 任务）
- 不统一 Token 命名体系（`--wg-*` 与 `--color-*` 混用保留）
- 不修改标记块内的 CSS（已在阶段 2 清理完毕）
- 不增强提取脚本（本次不改动 `extract-components-css.mjs`）
- 不修改 `components.css` 中 `@anatomy` 注释（步骤 11 推迟）
- 不将 checkbox 勾选改为 iconfont（保留内联 SVG）
- 不将 cell 退格减号改为 iconfont（保留内联 SVG）

## 风险与决策

1. **步骤 3 先出范例**：scaffold.css 的具体样式值、布局结构需通过范例预览页确认后再批量迁移。

2. **chip → tag 重命名**：涉及文件较多，需在 scaffold 范例确认后批量执行，避免遗漏引用。

3. **cell/form/bottom-nav 保留 `components.css`**：这些页面实际依赖跨组件样式，移除会导致样式断裂。

4. **预览页精简内容**：部分预览页（switch、form）有较重的 demo 模拟 UI，精简后可能损失一些上下文。保持核心展示，去掉冗余即可。

5. **scaffold.css 不 `@import` Token 文件**：假设 Token 已通过预览页 `<link>` 加载，scaffold.css 只使用 `var()`。

## 验证清单

- [ ] `specs/预览页规范.md` 已创建（含脚手架规范 + 布局规范）
- [ ] `scaffold.css` 已创建
- [ ] 范例预览页（button）已改造并通过用户确认
- [ ] chip → tag 重命名完成
- [ ] 所有预览页引入 `scaffold.css` + `colors_and_type.css` + `iconfont.css`
- [ ] 不需要 `components.css` 的 4 个预览页已移除引入
- [ ] bottom-nav 内联 SVG 改为 `<img>` 引用 `assets/icons/`
- [ ] cell 中 checkbox 勾选和退格减号保留内联 SVG，radio 圆点改 CSS pseudo-element
- [ ] form 中 counter/dropdown SVG 改 iconfont，radio 圆点改 CSS pseudo-element
- [ ] tag tag__close 和加号 SVG 改 iconfont
- [ ] form 中 button CSS 副本已删除
- [ ] `components.css` 已重新生成
- [ ] 组件契约、README、SKILL、AGENTS 已同步
- [ ] `metadata.json` version 已递增
