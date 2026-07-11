# 变更同步矩阵

> 角色：设计系统运行时同步方法。读取条件：组件、Token、图标或 UI Kit 正式迭代时；工作流经验升级读取 `sync-matrix.md`。

## 只改契约

必看：

- `.codex/skills/wego-design/components/index.json`
- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`

必改：

- `.codex/skills/wego-design/components/{slug}.json`

按需改：

- `.codex/skills/wego-design/preview/component-{slug}.html`：当契约变化影响结构、状态、变体示例时
- `.codex/skills/wego-design/references/library-map.md`、`.codex/skills/wego-design/SKILL.md`：当边界或清单说明变化时

通常不需要：

- `.codex/skills/wego-design/components.css`
- `.codex/skills/wego-design/css.json`

## 只改样式

必看：

- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`

必改：

- `.codex/skills/wego-design/preview/component-{slug}.html`

必做：

- 运行 `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`

按需改：

- `.codex/skills/wego-design/components/{slug}.json`：当状态、Token 消费、尺寸或边界变化时

提取后补查：

- 如果 `components.css` 额外出现非目标组件 diff，先暂停提交，回查对应 preview 和工作区历史；确认来源前不要把无关生成结果一起收下

## 契约 + 样式一起收敛

必看：

- `.codex/skills/wego-design/SKILL.md`
- `.codex/skills/wego-design/components/index.json`
- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`

必改：

- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`

必做：

- 运行 `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`
- 递增 `.codex/skills/wego-design/metadata.json.version`

按需改：

- `.codex/skills/wego-design/references/library-map.md`
- `.codex/skills/wego-design/SKILL.md`
- `.codex/skills/wego-design/library-consumption.json`
- 受影响 UI Kit 的 `ui_kits/{slug}/index.html` 与对应 `quality-report.json`：当契约收敛影响该 UI Kit 已有示例时
- 下游技能文档（wego-ux/SKILL.md 等）：删除已被收回的重复规则

适用场景：

- 删除冗余变体，重建少数稳定公开类型
- 明确默认挂载、定位或宿主边界
- 把 preview 中的 inline style 语义收回正式 class
- 新增或调整公开 CSS 变量、自定义宽度或颜色覆盖能力
- 取消一个原本误认为独立的场景，并把它并回现有场景
- 调整父子联动、成组选择、嵌套调用等会影响示例语义的结构
- 暗色模式从 preview 专用覆盖收回组件级 `.dark` 规则或正式 Token 消费
- 组件行为规则（DOM 结构、禁止项）从下游技能文档收回组件契约

## 改 Token

必看：

- `.codex/skills/wego-design/colors_and_type.css`
- `.codex/skills/wego-design/css.json`
- 受影响组件契约
- 受影响 preview

必改：

- `.codex/skills/wego-design/colors_and_type.css`
- `.codex/skills/wego-design/css.json`

按需改：

- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`
- `.codex/skills/wego-design/references/library-map.md`
- `.codex/skills/wego-design/SKILL.md`

必做：

- 执行 `node -e "JSON.parse(require('fs').readFileSync('.codex/skills/wego-design/css.json','utf8'))"`
- 如组件核心 CSS 同时变化，再执行 `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`

补充判断：

- 如果只是单个组件临时补暗色可见性，且没有形成公共语义，可先落组件 `.dark` 规则
- 如果多个组件开始重复相同暗色边框、底色、禁用态数值，应升级为 Token 变更，不要让局部硬编码继续扩散

## 改图标

必看：

- `.codex/skills/wego-design/iconfont.css`
- `.codex/skills/wego-design/assets/fonts/`
- `.codex/skills/wego-design/assets/icons/`
- 受影响组件契约与 preview

必改：

- 受影响预览页或组件引用

按需改：

- `.codex/skills/wego-design/iconfont.css`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/SKILL.md`
- `.codex/skills/wego-design/references/library-map.md`：当存在 iconfont 规则例外或下游复制边界变化时
- 调用该组件的 preview / UI Kit：当它们仍在使用旧图标、内联 SVG 或旧 helper

限制：

- 不为了临时需求引入 Lucide、第三方 CDN 或内联 SVG
- 如果设计稿指定随库 SVG 资产，必须把它作为固定资产引用，不要改回 iconfont
- 扫描调用方，确认同一语义没有同时存在 iconfont、内联 SVG、SVG asset 三套实现

## 改 UI Kit

先从 `.codex/skills/wego-design/uikit-plan.json` 的 `uiKits` 列表确认全部已注册 UI Kit，再定位本轮要改的 `ui_kits/{slug}/`。不要默认只处理 `app`。

必看：

- `.codex/skills/wego-design/uikit-plan.json`：确认 `uiKits` 全集与本次目标 `slug`
- 目标 `ui_kits/{slug}/index.html`
- 对应 `ui_kits/{slug}/quality-report.json`
- `.codex/skills/wego-design/uikit-plan.json`：确认该 UI Kit 对应的 `pagePatterns`、`screenBlueprints`、`productContext.selectedFrameNames`

必改：

- 目标 UI Kit 入口文件 `ui_kits/{slug}/index.html`
- 目标 `ui_kits/{slug}/quality-report.json`

按需改：

- `.codex/skills/wego-design/uikit-plan.json`：当 UI Kit 内的页面范式、组合约束、槽位分配变化时
- 相关组件契约与 preview：当 UI Kit 中暴露出组件使用问题，需要收回规则时
- `.codex/skills/wego-design/library-consumption.json`：当该 UI Kit 的复制边界、消费说明变化时
- `.codex/skills/wego-design/references/library-map.md`、`.codex/skills/wego-design/SKILL.md`：当 UI Kit 数量、清单或定位说明变化时

必做：

- 递增 `.codex/skills/wego-design/metadata.json.version`

限制：

- 不把 `.uikit-shell`、`.phone-frame`、`.phone-screen`、`biz-*` 等 Showcase 演示外壳或业务样式误升级成通用组件
- 改动落点应在 Showcase 演示层；若发现组件本体有问题，转走组件迭代流程，不在 UI Kit 里硬补组件样式
- 同一变更若影响多个 UI Kit，逐个同步各自的 `index.html` 与 `quality-report.json`，不要只改 `app`

## 新增 UI Kit

先确认它不是现有 UI Kit 的变体或页面范式扩展：

- 若只是同一套页面范式换了业务外壳（如另一类规则配置页），优先扩展现有 UI Kit 的示例区，而不是新增
- 若页面范式、组件组合节奏、固定槽位与现有 UI Kit 明显不同（例如新增大屏导购、客服会话、营销活动等范式），才走新增流程

必看：

- `.codex/skills/wego-design/metadata.json`
- `.codex/skills/wego-design/uikit-plan.json`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/references/library-map.md`
- `.codex/skills/wego-design/SKILL.md`

必改：

- 新增 `.codex/skills/wego-design/ui_kits/{slug}/index.html`
- 新增 `.codex/skills/wego-design/ui_kits/{slug}/quality-report.json`
- `.codex/skills/wego-design/uikit-plan.json`：在 `uiKits`、`productContext.selectedFrameNames` 中登记，并按需补 `pagePatterns` / `screenBlueprints` / `compositionConstraints`
- `.codex/skills/wego-design/library-consumption.json`：在 `consumptionLayers.uikit.files` 中登记新 UI Kit 入口与 quality-report，必要时更新 `downstreamScenarios.buildMobileAppPage.read`
- `.codex/skills/wego-design/references/library-map.md` 与顶层 `.codex/skills/wego-design/SKILL.md`：同步 UI Kit 清单、定位与根目录结构

必做：

- 在仓库根运行 `node scripts/validate-wego-design.mjs` 做文件完整性守门
- 递增 `.codex/skills/wego-design/metadata.json.version`

限制：

- 新 UI Kit 必须复用已注册组件契约，不发明组件类、子元素类或修饰类
- 必须保持 `.uikit-shell`、`.phone-frame`、`.phone-screen` 等演示外壳，不把它当成真实页面模板交付
- 新 UI Kit 的 `slug` 不得与现有组件、现有 UI Kit 冲突

## 新增组件

必看：

- `.codex/skills/wego-design/components/index.json`
- `.codex/skills/wego-design/uikit-plan.json`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/references/library-map.md`
- `.codex/skills/wego-design/SKILL.md`

必改：

- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`
- `.codex/skills/wego-design/components/index.json`
- `.codex/skills/wego-design/uikit-plan.json`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/references/library-map.md`
- `.codex/skills/wego-design/SKILL.md`

必做：

- 运行 `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`
- 递增 `.codex/skills/wego-design/metadata.json.version`

按需改：

- 命中页面范式的 UI Kit `ui_kits/{slug}/index.html` 与对应 `quality-report.json`：当新组件应进入该 UI Kit 展示时

## 每次正式迭代共同项

无论哪类正式迭代，都要检查：

- 是否仍符合移动端、微信生态、电商/工具场景
- 是否仍保持简洁、干净、淡雅、克制
- 是否误手改 `.codex/skills/wego-design/components.css`
- 是否需要递增 `.codex/skills/wego-design/metadata.json.version`
- 是否把 inline style 中承载的组件语义收回正式 class
- 如果组件本身带交互，交互是否已经并回原场景示例，而不是新增独立“交互演示”模块
- 如果保留了 inline style，是否只是演示已公开的 CSS 变量覆盖
- 是否补齐了契约已经承诺的关键宿主场景
- 是否对圆角、偏移、滚动这类视觉细节做过真实渲染核对
- 如果涉及暗色模式，是否确认修复落在组件 `.dark` 或正式 Token，而不是只靠 preview 专用 class
- 是否对照过同类稳定组件的暗色策略，避免同类控件各写各的
- 是否顺序运行提取脚本后再扫描 `components.css`，避免读到旧聚合输出
- 是否没有直接编辑 `wego-app/lib/` 部署副本；若设计系统运行资源变化，必须先改 `.codex/skills/wego-design/` 源文件，再运行 `node scripts/sync-wego-app-lib.mjs`
- 是否用 `node scripts/sync-wego-app-lib.mjs --check` 或 `node scripts/validate-wego-design.mjs` 确认 `wego-app/lib/` 与源资源一致
- 如果提取脚本带出无关组件 diff，是否已经定位来源并明确说明为什么保留或为什么不纳入本轮
- 若未执行浏览器验证，是否已按统一规则完成静态扫描、脚本校验、资源检查，并明确这不视为流程缺失
- 是否清理了已取消场景的旧文案、旧 class、旧契约字段和旧消费说明
- 回复里是否明确写出“改了什么、验证了什么、剩余风险”
- 如果没有真实剩余风险，是否明确写“无明显剩余风险”，而不是编造模板化风险

## 工作流迭代（经验沉淀/规则补充/流程优化）

适用于 wego-uxsystem-iterate 的“工作流迭代模式”。完整规则见 `workflow-iteration.md`。

### 经验沉淀（新增规则）

必看：
- `.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md`（经验沉淀通用化原则）
- `.codex/skills/wego-design/library-consumption.json` 的 `scenarioTypeRegistry`

必改（按环节归属）：
- product 类 → `.codex/skills/wego-product/SKILL.md`
- design 类 → `.codex/skills/wego-design/SKILL.md` 或 `library-consumption.json` 或 `uikit-plan.json` 或 `components/{slug}.json`
- ux 类 → `.codex/skills/wego-ux/SKILL.md`
- tests 类 → `.codex/skills/wego-tests/SKILL.md`

按需改：
- `AGENTS.md`（仅当规则升级为仓库级硬约束时，回流到“仓库级约束”章节）

必做：
- 通过 workflow-iteration.md 的通用化验证清单
- 若涉及设计系统本体（library-consumption.json / uikit-plan.json / components/*.json），递增 `metadata.json.version`

### 场景类型注册（新增类型）

必看：
- `.codex/skills/wego-uxsystem-iterate/references/workflow-iteration.md`（经验沉淀通用化原则）
- `.codex/skills/wego-design/library-consumption.json` 的 `scenarioTypeRegistry`

必改：
- `.codex/skills/wego-design/library-consumption.json`（新增类型到 `scenarioTypeRegistry.types[]`）

按需改：
- 对应工作流环节的 SKILL.md（补执行引用）

必做：
- 新类型必须标注 primaryWorkflowStage
- 新类型必须通过通用化验证清单
- 递增 `metadata.json.version`

### 工作流环节规则调整（改 SKILL.md）

必看：
- 目标环节的 SKILL.md
- `AGENTS.md`（确认是否与仓库级硬约束冲突）

必改：
- 目标环节的 SKILL.md

按需改：
- `AGENTS.md`（仅当规则升级为仓库级硬约束时）
- 下游环节的 SKILL.md（若规则跨环节）

必做：
- 确认规则不与已有契约/计划文件重复
- 若涉及设计系统本体，递增 `metadata.json.version`
