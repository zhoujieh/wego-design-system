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

限制：

- 不为了临时需求引入 Lucide、第三方 CDN 或内联 SVG

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
- 如果保留了 inline style，是否只是演示已公开的 CSS 变量覆盖
- 是否补齐了契约已经承诺的关键宿主场景
- 是否对圆角、偏移、滚动这类视觉细节做过真实渲染核对
- 回复里是否明确写出“改了什么、验证了什么、剩余风险”
