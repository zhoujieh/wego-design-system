# wegoux Skill 开发守则

## 沟通要求

- 始终用简洁、通俗易懂的中文沟通。
- 先理解 `wegoux` 设计系统，再修改文件；不要只改一个文件就结束。
- 每次回复都要说明本轮改了什么、验证了什么、还有什么风险。

## 固定方向

`wegoux` 是面向移动端、微信生态、电商/工具场景的中文设计系统。

必须保持以下方向：

- 风格：简洁、干净、淡雅、克制。
- 优先级：清晰 > 一致 > 效率 > 美观 > 创新。
- 主色：微信绿 `#03C160`，克制用于主操作、选中态、成功反馈和品牌识别。
- 默认场景：移动应用、微信生态、电商、工具、社交相关界面。
- 默认密度：移动端高信息密度，避免营销页式大留白。

禁止方向漂移：

- 不把 `wegoux` 改成 TRAE / Nimbus / 桌面 IDE 设计系统。
- 不把默认方向改成桌面后台、营销大屏、强视觉活动页或暗色优先系统。
- 不照搬 TRAE 的暗色、硬朗、开发者工具组件和图标语义。
- TRAE 只能作为结构完整性参考，不能迁移视觉风格和产品定位。
- 不新增高饱和渐变、大面积插画、重阴影、装饰性背景或复杂动效。

## 每次开发前的读取顺序

先读：

1. `.design_library/wegoux/SKILL.md`
2. `.design_library/wegoux/README.md`
3. `.design_library/wegoux/library-consumption.json`
4. `.design_library/wegoux/uikit-plan.json`

按任务继续读：

- 改 Token：读 `.design_library/wegoux/colors_and_type.css` 和 `.design_library/wegoux/css.json`。
- 改组件：读 `.design_library/wegoux/components/index.json`、对应 `components/{slug}.json`、对应 `preview/component-{slug}.html`。
- 改 UI Kit：读 `.design_library/wegoux/ui_kits/app/index.html` 和 `quality-report.json`。
- 改图标：读 `.design_library/wegoux/iconfont.css`、`assets/fonts/`、`assets/icons/`。
- 改规范或文案：读 `.design_library/wegoux/specs/*.md` 中对应文件。
- 对照 TRAE：只读 `参考trae/` 和审查报告中的结构建议，不复制其视觉方向。

## 技能分工

- 已注册组件迭代、新增组件发布、组件契约/预览页/聚合样式同步，优先使用 `.codex/skills/iterate-component/SKILL.md`。
- `AGENTS.md` 只保留仓库级总则和硬约束；组件级操作步骤、经验守门、预检清单和输出格式以组件迭代技能为准。
- 如果组件迭代技能与旧经验写法冲突，以技能里的最新流程为准，并在需要时同步回仓库文档。

## 组件发布规则

- 已发布组件只以 `.design_library/wegoux/components/index.json` 为准。
- 当前稳定组件为 17 个：`button`、`card`、`avatar`、`tag`、`bottom-nav`、`input`、`counter`、`badge`、`cell`、`checkbox`、`form`、`image`、`link`、`radio`、`stack`、`switch`、`navbar`。
- `navbar` 右侧操作区是组件内部样式场景，使用 `.navbar__action` 与 `.navbar__right--icon` / `.navbar__right--text` / `.navbar__right--button` 组合，不再注册独立组件。
- UI Kit 中的 `biz-*`、`.phone-*`、`.uikit-shell`、`.phone-frame`、`.phone-screen` 都是 Showcase 演示外壳或业务样式，不是通用组件。
- 组件正式迭代时，不在这里重复展开细流程，直接按 `.codex/skills/iterate-component/SKILL.md` 执行。
- 新增或发布组件时，必须同步组件契约、预览页、预览聚合页 `preview/index.html`、注册表、聚合样式、消费契约和文档；具体顺序与守门细节以组件迭代技能为准。

## 变更同步矩阵

改 Token：

- 优先改 `colors_and_type.css`。
- 必须同步 `css.json`，避免机器可读 Token 落后。
- 如果新增语义 Token、暗色 Token、状态色分层、品牌色阶、排版别名或数字工具类，需要同步 `README.md`、`SKILL.md` 和受影响组件契约。
- 不随意硬编码色值、字号、间距、圆角、阴影和动效；优先使用 CSS 变量。
- **`css.json` shadow 格式必须使用 TRAE 官方对象格式**（基于内置 minimalist 库反推），不能用 CSS 字符串。
  - 单层阴影：`{ "xOffset", "yOffset", "blur", "spread", "color": { "hex", "opacity" } }`
  - 多层阴影：`{ "layers": [{ "xOffset", "yOffset", "blur", "spread", "color": { "hex", "opacity" } }] }`
  - `shadow-none` 不能用字符串 `"none"`，用 `{ "xOffset": "0px", "yOffset": "0px", "blur": "0px", "spread": "0px", "color": { "hex": "transparent", "opacity": "0" } }`
  - 渲染器用 `'layers' in value` 判断多层/单层，传入字符串会触发 `TypeError: Cannot use 'in' operator to search for 'layers' in none`。
- **`css.json` 必须使用 TRAE 官方嵌套分组格式**，不能使用 `public`/`reference`/`compatibility` 三层结构，也不能将 color 拍平为一级键。
  - `color`：按语义二级嵌套分组，如 `palette-green`、`bg-brand`、`text`、`border`、`status-success` 等，每组内为 `{ "token-name": { "hex": "#xxx", "opacity": "1" } }`。禁止使用 `var(--wg-*)` 字符串。
  - `font`：分为 `{ family, size, weight, lineHeight }` 四个子分组，值为已解析的字符串（如 `"PingFang SC, ..."`, `"14px"`, `"500"`）。禁止使用 `var()` 引用。
  - `radius`、`spacing`、`size`：扁平键值对，值为已解析的字符串（如 `"8px"`）。禁止使用 `var()` 引用。
  - 三层 Token 管理体系（public/reference/compatibility）只保留在 `colors_and_type.css` 中，`css.json` 是纯粹的 TRAE 渲染数据，不承载内部架构。
  - 每次改 `colors_and_type.css` 新增/修改 Token 后，必须同步解析并更新 `css.json` 中的对应值。
- 每次修改 `css.json` 后，必须用 `python3 -c "import json; json.load(open('css.json'))"` 验证 JSON 合法性。

改组件样式：

- 具体步骤、经验守门和预检清单以 `.codex/skills/iterate-component/SKILL.md` 为准。
- 优先改对应 `preview/component-*.html` 的组件样式块，再同步 `components/{slug}.json`，最后运行 `node scripts/extract-components-css.mjs .` 重新生成 `components.css`。
- **严禁直接手动编辑 `components.css`**——它是自动聚合输出，文件头部已标注 `DO NOT EDIT MANUALLY`。任何直接修改都会在下一次重新生成时丢失。
- 需要真实浏览器核对时，优先在 `.design_library/wegoux/` 根目录启动本地静态服务，再访问 `http://127.0.0.1:<port>/preview/...` 或 `http://127.0.0.1:<port>/ui_kits/...`；不要把应用内浏览器对 `file://` 的安全拦截误判成组件样式失效。

改脚手架：

- 修改 `scaffold.css` 后，需确认所有 `preview/component-*.html` 和 `ui_kits/*.html` 正常引用。
- 脚手架样式只用于预览页和 UI Kit，不得出现在生产组件样式中。
- 详见 `specs/预览页脚手架规范.md`。

改 UI Kit：

- 同步 `ui_kits/app/index.html` 和 `ui_kits/app/quality-report.json`。
- 尽量提高已注册组件 class 复用率。
- 不把 Showcase 外壳复制成真实页面模板。
- UI Kit 中如出现 Lucide/CDN 图标，只能视为待替换占位；生产组件必须回到 `iconfont.css` 或随库 SVG 资产。

改图标：

- 预览页和组件优先使用 `<i class="wego-iconfont-s icon-{name}"></i>`。
- 必须引入 `iconfont.css` 和随库字体文件。
- 不为了临时需求接入 Lucide、第三方 CDN 或内联 SVG。
- 缺图时先复用语义接近的已有图标；确实缺失时再规划更新 iconfont。

改规范：

- 更新 `specs/*.md` 后，如果影响全局方向、读取顺序或组件边界，必须同步 `SKILL.md` 和 `README.md`。
- 文案、金额、日期、时间、空数据、省略规则以 `微购设计规范 - 文案与数据规范` 为准。

每次正式迭代：

- 递增 `.design_library/wegoux/metadata.json` 的 `version`。
- 只有仓库管理类变更可以不递增版本，例如只改根目录 `AGENTS.md`、`.gitignore` 或 Git 配置。

## 设计质量门禁

提交前检查：

- 是否仍符合移动端、微信生态、电商/工具场景。
- 是否仍保持简洁、干净、淡雅、克制。
- 是否遵守 4N 间距节奏和移动端信息密度。
- 品牌绿是否克制使用，没有大面积铺满。
- 阴影是否轻量，优先使用底色、描边和分组建立层级。
- 动效是否只用于说明出现、消失、变化路径，且足够轻快。
- 图标是否优先使用 `iconfont.css`。
- 中文文案是否短、准、自然。
- 金额、数字、日期、时间是否符合规范。

## 文件完整性检查

提交前必须确认：

- `colors_and_type.css` 与 `css.json` 没有明显不同步。
- 组件注册表、组件契约、预览页、预览聚合页、聚合样式没有漏改。
- **`components.css` 通过 `scripts/extract-components-css.mjs` 重新生成过**，不是手动编辑的。
- 如果做过预览核对，优先记录 `http://127.0.0.1:<port>` 本地静态服务验证结果，不把 `file://` 拦截当成组件缺陷。
- `uikit-plan.json` 和 `library-consumption.json` 与当前组件状态一致。
- `README.md` 和 `SKILL.md` 没有过期组件数量、状态或读取路径。
- `quality-report.json` 与 UI Kit 当前状态一致。
- 不提交 `.DS_Store`。
- 不提交 `.uploads/`。

## 当前已知技术债

这些问题不要在普通迭代里忽略：

- `css.json` 需要补齐对新增 Token 的机器可读投影。
- UI Kit 仍有 Lucide/CDN 图标和 `biz-*` 演示样式，后续应降低发明组件比例。
- `ui_kits/app/quality-report.json` 当前组件复用率偏低，后续改 UI Kit 时要同步提升。

## Git 与发布

- 默认使用 `main` 分支。
- 提交前用显式路径 `git add`，不要无脑 `git add -A`。
- 推送前先确认远端状态；如果远端已有分支，不强推，先停下来重新评估。
- 提交信息用简短中文动词短语，例如 `初始化 wego 设计系统`。
