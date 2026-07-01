# 变更同步矩阵

## 只改契约

必看：

- `wegoux/components/index.json`
- `wegoux/components/{slug}.json`
- `wegoux/preview/component-{slug}.html`

必改：

- `wegoux/components/{slug}.json`

按需改：

- `wegoux/preview/component-{slug}.html`：当契约变化影响结构、状态、变体示例时
- `wegoux/README.md`、`wegoux/SKILL.md`：当边界或清单说明变化时

通常不需要：

- `wegoux/components.css`
- `wegoux/css.json`

## 只改样式

必看：

- `wegoux/components/{slug}.json`
- `wegoux/preview/component-{slug}.html`

必改：

- `wegoux/preview/component-{slug}.html`

必做：

- 运行 `node wegoux/scripts/extract-components-css.mjs wegoux`

按需改：

- `wegoux/components/{slug}.json`：当状态、Token 消费、尺寸或边界变化时

提取后补查：

- 如果 `components.css` 额外出现非目标组件 diff，先暂停提交，回查对应 preview 和工作区历史；确认来源前不要把无关生成结果一起收下

## 契约 + 样式一起收敛

必看：

- `wegoux/SKILL.md`
- `wegoux/components/index.json`
- `wegoux/components/{slug}.json`
- `wegoux/preview/component-{slug}.html`

必改：

- `wegoux/components/{slug}.json`
- `wegoux/preview/component-{slug}.html`

必做：

- 运行 `node wegoux/scripts/extract-components-css.mjs wegoux`
- 递增 `wegoux/metadata.json.version`

按需改：

- `wegoux/README.md`
- `wegoux/SKILL.md`
- `wegoux/library-consumption.json`
- `wegoux/ui_kits/app/index.html`
- `wegoux/ui_kits/app/quality-report.json`

适用场景：

- 删除冗余变体，重建少数稳定公开类型
- 明确默认挂载、定位或宿主边界
- 把 preview 中的 inline style 语义收回正式 class
- 新增或调整公开 CSS 变量、自定义宽度或颜色覆盖能力
- 取消一个原本误认为独立的场景，并把它并回现有场景
- 调整父子联动、成组选择、嵌套调用等会影响示例语义的结构
- 暗色模式从 preview 专用覆盖收回组件级 `.dark` 规则或正式 Token 消费

## 改 Token

必看：

- `wegoux/colors_and_type.css`
- `wegoux/css.json`
- 受影响组件契约
- 受影响 preview

必改：

- `wegoux/colors_and_type.css`
- `wegoux/css.json`

按需改：

- `wegoux/components/{slug}.json`
- `wegoux/preview/component-{slug}.html`
- `wegoux/README.md`
- `wegoux/SKILL.md`

必做：

- 执行 `python3 -c "import json; json.load(open('wegoux/css.json'))"`
- 如组件核心 CSS 同时变化，再执行 `node wegoux/scripts/extract-components-css.mjs wegoux`

补充判断：

- 如果只是单个组件临时补暗色可见性，且没有形成公共语义，可先落组件 `.dark` 规则
- 如果多个组件开始重复相同暗色边框、底色、禁用态数值，应升级为 Token 变更，不要让局部硬编码继续扩散

## 改图标

必看：

- `wegoux/iconfont.css`
- `wegoux/assets/fonts/`
- `wegoux/assets/icons/`
- 受影响组件契约与 preview

必改：

- 受影响预览页或组件引用

按需改：

- `wegoux/iconfont.css`
- `wegoux/library-consumption.json`
- `wegoux/SKILL.md`
- `wegoux/README.md`：当存在 iconfont 规则例外或下游复制边界变化时
- 调用该组件的 preview / UI Kit：当它们仍在使用旧图标、内联 SVG 或旧 helper

限制：

- 不为了临时需求引入 Lucide、第三方 CDN 或内联 SVG
- 如果设计稿指定随库 SVG 资产，必须把它作为固定资产引用，不要改回 iconfont
- 扫描调用方，确认同一语义没有同时存在 iconfont、内联 SVG、SVG asset 三套实现

## 改 UI Kit

必看：

- `wegoux/ui_kits/app/index.html`
- 对应 `quality-report.json`
- `wegoux/uikit-plan.json`

必改：

- UI Kit 入口文件
- 对应 `quality-report.json`

按需改：

- `wegoux/uikit-plan.json`
- 相关组件契约与 preview

限制：

- 不把 `.uikit-shell`、`.phone-*`、`biz-*` 演示样式误升级成通用组件

## 新增组件

必看：

- `wegoux/components/index.json`
- `wegoux/uikit-plan.json`
- `wegoux/library-consumption.json`
- `wegoux/README.md`
- `wegoux/SKILL.md`

必改：

- `wegoux/components/{slug}.json`
- `wegoux/preview/component-{slug}.html`
- `wegoux/components/index.json`
- `wegoux/uikit-plan.json`
- `wegoux/library-consumption.json`
- `wegoux/README.md`
- `wegoux/SKILL.md`

必做：

- 运行 `node wegoux/scripts/extract-components-css.mjs wegoux`
- 递增 `wegoux/metadata.json.version`

按需改：

- `wegoux/ui_kits/app/index.html`
- `wegoux/ui_kits/app/quality-report.json`

## 每次正式迭代共同项

无论哪类正式迭代，都要检查：

- 是否仍符合移动端、微信生态、电商/工具场景
- 是否仍保持简洁、干净、淡雅、克制
- 是否误手改 `wegoux/components.css`
- 是否需要递增 `wegoux/metadata.json.version`
- 是否把 inline style 中承载的组件语义收回正式 class
- 如果组件本身带交互，交互是否已经并回原场景示例，而不是新增独立“交互演示”模块
- 如果保留了 inline style，是否只是演示已公开的 CSS 变量覆盖
- 是否补齐了契约已经承诺的关键宿主场景
- 是否对圆角、偏移、滚动这类视觉细节做过真实渲染核对
- 如果涉及暗色模式，是否确认修复落在组件 `.dark` 或正式 Token，而不是只靠 preview 专用 class
- 是否对照过同类稳定组件的暗色策略，避免同类控件各写各的
- 是否顺序运行提取脚本后再扫描 `components.css`，避免读到旧聚合输出
- 如果提取脚本带出无关组件 diff，是否已经定位来源并明确说明为什么保留或为什么不纳入本轮
- 如果浏览器核对失败，是否已经按统一规则完成静态服务探活，并在内置浏览器与 Playwright 间做了正确切换或记录阻塞原因
- 是否清理了已取消场景的旧文案、旧 class、旧契约字段和旧消费说明
- 回复里是否明确写出“改了什么、验证了什么、剩余风险”
- 如果没有真实剩余风险，是否明确写“无明显剩余风险”，而不是编造模板化风险
