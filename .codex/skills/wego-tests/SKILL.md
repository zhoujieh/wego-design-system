---
name: wego-tests
description: 验收产品原型项目并输出 acceptance_report 的技能。用于原型已经由 wego-ux 技能产出后，检查需求承接、场景判断、设计系统消费、任务文件夹约束、构建部署可用性，以及文案/布局/交互是否符合 wego-design 规范。
---

# Wego Tests

只做验收，不做原型生成。

## 输入前提

开始前必须已经有：

- `page_spec`，且已落盘到 `{task-folder}/_spec/page_spec.json`
- `design_consumption_plan`，且已落盘到 `{task-folder}/_spec/design_consumption_plan.json`
- 最终原型项目文件夹

## 输出要求

必须输出 `acceptance_report`，至少包含这些字段：

```json
{
  "requirement_coverage": [],
  "scene_judgement_check": {},
  "surface_design_check": {},
  "uikit_consumption_check": {},
  "component_discipline_check": {},
  "spec_ref_check": {},
  "copy_check": {},
  "interaction_check": {},
  "layout_check": {},
  "prototype_folder_check": {},
  "deployment_readiness_check": {},
  "automated_checks": {
    "script": "node scripts/validate-wego-design.mjs --scope=full",
    "exit_code": 0,
    "errors": [],
    "warnings_count": 0,
    "key_findings": []
  },
  "risk_log": [],
  "manual_verify_items": [],
  "final_status": "pass | pass-with-risk | fail"
}
```

默认验收不要求真实浏览器验证。验收依据以 `page_spec`、`design_consumption_plan`、任务级文件夹结构、静态资源检查和守门脚本结果为准；只有用户当次明确要求时，才把浏览器验证作为附加核对项记录到 `manual_verify_items`。

## 必查项

- 需求是否被页面完整承接
- 是否正确命中 `biz-rule-config` 或其他目标场景
- 是否逐 `surface_designs[]` 验证每个页面/页面片段都有设计依据
- 是否按 `design_consumption_plan` 消费了 UI Kit 和组件
- 是否误复制 Showcase 外壳
- 是否遵守单一预览外壳规则：只有 `index.html` 显示手机壳，后续内容都在同一个 `.phone-screen` 内展示
- 带 `host_container + route_id` 的任务是否直接复制固定 App 宿主模板，而不是重画宿主 App
- 是否发明了不该发明的组件类或修饰类
- 是否按 `spec_refs` 执行了文案、布局、交互、视觉规则
- 原型是否位于任务级文件夹
- 同一任务是否复用了原文件夹
- 新任务文件夹是否使用中文业务语义命名；已有英文或其他命名的历史目录复用不判失败
- 项目是否具备基本构建和部署条件
- 必须运行守门脚本，把脚本输出写入 `automated_checks`，不能仅靠自述结论
- 未执行浏览器验证不构成失败项，除非用户当次明确要求做这一步

### navbar 与布局回归检查(必查)

- navbar 是否使用 sticky 定位(默认,禁止在普通业务页用 fixed/absolute 脱离文档流;由 components.css 自动提供,page.css 不重复)
- `data-bg="page"` 时 navbar 是否保持灰底、`data-bg="surface"` 时 navbar 是否保持白底；若任务级样式额外覆盖导致不一致，直接判实现问题
- 深色/图片背景场景是否使用 `.navbar--fixed-transparent` 修饰类(透明背景 + 文字反白 --text-inverse + page-body 加 padding-top: 56px 让位)
- 短内容页面是否避免强制滚动条(检查 `.page-body` 是否误用 `min-height: 100vh` 与 navbar 高度叠加;内容应自然撑高,不写 min-height)
- modal-overlay 是否挂载并限制在 `.phone-screen` 内，不能覆盖整个浏览器 viewport
- navbar 中 `<button>` 元素是否被正确重置(无原生 border/background/padding 泄漏;依赖 colors_and_type.css 的全局 button 重置,不再需要 biz-plain-button 等内部重置类)
- 模态页（`.modal-overlay`）和 push 页（`.push-screen`）是否避让顶部电池栏：避让由 `host-shell.css` 模板统一提供 `padding-top: var(--safe-area-top, 0px)`；任务级 `page.css` 不得引用 `--safe-area-top` Token（守门脚本会拦截）；若 navbar 被电池栏视觉覆盖或任务级 `page.css` 引用了 `--safe-area-top`，判实现问题，归因到 `wego-ux`，`final_status` 不能为 `pass`

### 单一预览外壳验收(必查)

- 每个任务文件夹只能有一套 `.preview-shell` / `.phone-frame` / `.phone-screen`，且只能位于任务入口 `index.html`
- `pages/*.html` 若存在，只能作为 fragment/source；不得包含 `.preview-shell` / `.phone-frame` / `.phone-screen`，也不得作为顶层浏览器跳转目标直接打开
- `index.html` 指向 `pages/*.html` 的入口必须使用壳内加载标记（如 `data-route`、`data-screen-src`、`data-open-modal`）和 JS 处理；普通 `<a href="./pages/xxx.html">` 判失败
- CSS 必须包含移动端 media query，使 `index.html` 同一个链接在手机端隐藏外壳视觉，内容铺满真实 viewport
- 业务页面内容不得依赖外壳类表达布局、分组、状态或交互；外壳类只服务桌面预览
- `.phone-status` 和 `.phone-indicator` 只允许作为最外层预览安全区；`.uikit-shell`、`.phone-body` 等 Showcase 内部内容容器不得进入任务产物
- 若 `page_spec` 声明 `host_container + route_id`，`index.html` 必须来自固定 App 宿主模板，保留宿主 Tab、工作台、我的页、默认入口、UI 和基础交互；只允许按 `route_id` 增量更新目标入口、业务页链接和状态回填
- 若宿主 App 被大面积删减、重画或替换成 AI 自创内容，归因到 `wego-ux`，`final_status` 不能为 `pass`
- 若点击设置页、业务页、二级选择页后顶层浏览器离开 `index.html` 或出现铺满浏览器的新页面，归因到 `wego-ux`，`final_status` 不能为 `pass`
- `index.html` 内的 `.phone-status` 和 `.phone-indicator` 必须按 absolute 悬浮方案实现（`position: absolute` + 透明背景 + 不占布局空间），内容区通过自身 padding 避让安全区；若给父屏幕容器加 padding-top/padding-bottom 导致绝对定位错乱，判实现问题，归因到 `wego-ux`
- `page.css` / `host-shell.css` 必须在 `.phone-screen` 内定义 `--safe-area-top: 44px` 和 `--safe-area-bottom: 34px` 模拟值，并在移动端 @media 内重置 Token 为 0 联动隐藏安全区；若逐个重置 phone-status / phone-indicator / 固定元素样式而不通过 Token 重置联动，判实现问题，归因到 `wego-ux`
- 页面底部固定元素（bottom-nav、固定操作栏、固定按钮栏）必须预留 `--safe-area-bottom` 间距（已注册组件由 components.css 统一提供；任务级自创操作栏由 page.css 业务样式声明）；若固定元素底部未预留安全区导致内容被 phone-indicator 遮挡，判实现问题，归因到 `wego-ux`

### 页面打开方式验收(必查)

- `design_consumption_plan.page_presentation` 缺失时，若已有 surface 命中带 `presentation` 的 pagePattern，归因到 `wego-design`
- `page_presentation.type = push` 时，检查入口是否为壳内 push：更新 `.phone-screen` 内 screen，可配合 `history.pushState`，但不能普通跳转到 `pages/*.html`
- `page_presentation.type = full-screen-modal` 时，必须检查 `index.html` 的 `.phone-screen` 内存在 `#modal-overlay.modal-overlay[hidden]`
- `page_presentation.type = full-screen-modal` 时，入口触发必须使用 `data-open-modal` 或等价 JS modal trigger；若主业务页只通过普通 `<a href>` push 打开，归因到 `wego-ux`
- `page_presentation.type = full-screen-modal` 时，CSS 必须体现壳内 overlay：`.phone-screen` 提供定位上下文，`.modal-overlay` 使用 `position: absolute; inset: 0` 或等价方式覆盖手机屏；若使用浏览器级 `position: fixed; inset: 0` 直接铺满 viewport，判失败
- `page_presentation.type = full-screen-modal` 时，CSS 必须包含 `transform: translateY(100%)`、打开态 `translateY(0)` 或等价规则
- `page_presentation.covers_tab_bar = true` 时，overlay z-index 必须高于 bottom-nav；若层级不足导致 Tab 仍可见或可点，归因到 `wego-ux`
- `interaction_check` 必须记录 page presentation 验收结论；不一致时 `final_status` 不能为 `pass`

### 稳定场景回归检查(必查)

- 是否对已命中的稳定场景做了二次拆解，例如把宿主场景重新拆成“行结构 + 局部控件 + 说明文字”分别实现
- 是否擅自改写稳定场景内部关联控件的尺寸、对齐或间距
- 父项选中后才出现的补充内容，是否被错误拆成独立平级 section，而不是作为父场景延展
- helper 是否仅重复结构、摘要、选中态、禁用条件或跳转语义已表达的信息；若是，判为冗余实现
- 连续行式组件（如 cell）是否用已注册分组容器类（`.cell-group`）包裹，是否发明任务级 `xxx-page__group` 自定义类替代；若发现任务级自定义类替代已注册分组容器，判实现问题，归因到 `wego-ux`，`final_status` 不能为 `pass`

## 守门脚本引用规则

验收前必须先运行守门脚本：

```bash
node scripts/validate-wego-design.mjs --scope=full
```

把脚本输出归档到 `automated_checks`：

- `script`：实际执行的命令
- `exit_code`：脚本退出码（0 为通过）
- `errors`：脚本报出的 error 清单（code + message + file）
- `warnings_count`：脚本报出的 warning 数量
- `key_findings`：摘要关键发现（如外壳泄漏、safe-area Token 违规、组件契约缺失等）

`final_status` 判定规则：

- `automated_checks.errors.length > 0` 时，`final_status` 不能为 `pass`
- `automated_checks.errors.length === 0` 且 `warnings_count` 可接受时，可为 `pass` 或 `pass-with-risk`
- 任何 error 必须在 `risk_log` 中记录对应修复建议

### surface_designs 验收规则（必查）

- `design_consumption_plan.surface_designs[]` 必须覆盖 `page_spec.page_surfaces[]` 中的全部 `id`
- 每个 HTML 页面或动态页面片段必须能归属到一个 surface；不能只用总的 `matched_uikit` 代替逐页依据
- `match_status = exact | near`：检查是否按对应 pagePattern/UI Kit 约束生成
- `match_status = fallback`：检查是否按 `matched_blueprint` 生成，并在 `risk_log` 记录“使用兜底蓝图”作为低风险项
- `match_status = gap`：验收必须失败，归因到 `wego-design`
- `allowed_page_styles` 之外的大量业务 class、内部说明文案、或自造页面结构，归因到 `wego-ux`

## 验收顺序

1. 运行守门脚本，归档输出到 `automated_checks`
2. 先对照 `page_spec`
3. 再对照 `design_consumption_plan`
4. 再检查原型项目结构
5. 再检查规范引用执行结果
6. 最后给出 `final_status`（受 `automated_checks.errors` 约束）

不要把“缺少浏览器能力”本身记为风险；只有用户明确要求浏览器验证且该要求未完成时，才在 `manual_verify_items` 或 `risk_log` 中如实记录。

## 结果归因

如果不通过，要明确问题属于哪一层：

- `wego-product`：需求理解或场景判断问题
- `wego-design`：设计系统消费决策问题
- `wego-ux`：原型实现或项目结构问题

不要只给笼统结论。

### 场景类型验证与环节归因（必读）

验收时，必须按 `library-consumption.json` 的 `scenarioTypeRegistry` 中的场景类型逐类验证：

- **组件消费决策类**：检查 component_mapping 是否标注了场景类型和判断条件；检查修饰类/尺寸/状态是否符合契约
- **组件消费决策类**：若 design 已命中稳定场景，检查实现是否整体复用该场景，而不是继续拆出内嵌关联控件、父子结构或 helper 做二次实现
- **无 UI Kit 页面构成类**：检查 `fallback` surface 是否引用并遵守 `fallbackPageBlueprints`；检查 `gap` 是否阻止交付
- **UI Kit 到生产转换类**：检查生产页面是否残留演示外壳类；检查 section 是否语义化封装；检查任务是否只有 `index.html` 保留单一预览外壳，后续内容是否都在 `.phone-screen` 内展示
- **页面打开方式绑定类**：检查 `page_presentation.type` 与入口触发、overlay DOM、CSS 动画和覆盖层级是否一致
- **原型交付标准类**：检查状态持久化是否实现；检查保存后回填和反馈闭环
- **宿主模板路径绑定类**：检查带 `host_container + route_id` 的任务是否直接复制固定 App 宿主模板，并只按 `route_id` 增量更新入口、业务页链接和状态回填

结果归因时，必须标注工作流环节归属：
- 归因到 `wego-product` 时，问题在需求理解或场景判断
- 归因到 `wego-design` 时，问题在消费决策或组件映射
- 归因到 `wego-ux` 时，问题在原型生成或交互实现
- 归因到 `wego-tests` 时，问题在验收项定义或归因规则

禁止：
- 不按场景类型逐类验收
- 归因时不标注工作流环节
- 把规则回流到错误的工作流环节
