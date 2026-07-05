---
name: wego-tests
description: 验收 wego-app 静态 App 原型中的当前业务场景，并输出 acceptance_report。用于检查需求承接、场景判断、设计系统消费、App 路由注册、交互流程、适配和部署可用性；默认只验当前任务与用户指定范围。
---

# Wego Tests

只做验收，不做原型生成。

## 何时必须触发本技能

- 用户要求验收、检查、回归、review 当前业务场景
- 用户要核对需求承接、路由注册、交互闭环、部署准备状态
- 用户明确要求输出 `acceptance_report`

不要误用场景:

- 当前目标是原型实现，转入 `wego-ux`
- 当前目标是设计系统消费，转入 `wego-design`
- 当前目标是组件 / UI Kit / 工作流本体迭代，转入 `wego-uxsystem-iterate`

## 输入前提

开始前必须已经有：

- `page_spec`，且已落盘到 `wego-app/scenes/{中文业务场景}/_spec/page_spec.json`
- `design_consumption_plan`，且已落盘到 `wego-app/scenes/{中文业务场景}/_spec/design_consumption_plan.json`
- 当前业务场景已生成到 `wego-app/scenes/{中文业务场景}/`
- 当前 `route_id` 已注册到 `wego-app/js/routes.js` 或等价路由注册机制

## 验收范围

默认只验当前任务范围：

- 当前 `scene_folder`
- 当前 `route_id`
- 当前入口挂载位置
- 当前任务改动过的 `wego-app/index.html`、`wego-app/js/*`、`wego-app/css/*`
- 当前任务改动过的设计系统文件

只有用户明确要求时，才做全量 App 回归、全部历史场景回归或追加真实浏览器 / Vercel 页面访问验收。

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
  "route_check": {},
  "interaction_check": {},
  "layout_check": {},
  "app_scene_check": {},
  "deployment_readiness_check": {
    "push_attempted": true,
    "push_commit_hash": "",
    "deploy_status": "success | degraded-local | not-run",
    "production_domain": "",
    "fallback_local_entry": "wego-app/index.html",
    "errors": []
  },
  "automated_checks": {
    "script": "node scripts/validate-wego-design.mjs --scope=changed",
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

默认验收不要求真实浏览器验证。验收依据以 `page_spec`、`design_consumption_plan`、当前场景文件、App 路由注册、静态资源检查、部署结果记录和守门脚本结果为准；只有用户当次明确要求时，才把浏览器验证或额外的 Vercel 链接访问验证作为附加核对项。

## 必查项

- 需求是否被当前场景完整承接
- 是否正确判断业务场景，例如权限管理、商品管理列表、业务规则配置、系统设置等
- `surface_designs[]` 是否覆盖 `page_spec.page_surfaces[]`
- 是否按 `design_consumption_plan` 消费 UI Kit、组件和 fallback blueprint
- 当前 `scene_folder` 是否位于 `wego-app/scenes/{中文业务场景}/`
- 当前 `route_id` 是否唯一、稳定、kebab-case，并已注册为 hash route
- 当前入口是否挂在 `host_container` 指定的 Tab / 分组 / 父子层级
- 点击入口是否在 `wego-app/index.html` 的 `.phone-screen` 内打开场景，不离开 App
- 页面打开方式是否符合 `page_presentation.type`
- 交互是否体现真实业务数据状态和流程闭环
- 是否默认没有强制 localStorage；只有需求要求刷新保留时才做持久化
- 是否误复制 UI Kit Showcase 外壳或第二套宿主壳
- 是否发明了未注册组件类、子元素类或修饰类
- 是否按 `spec_refs` 执行文案、布局、交互、视觉规则
- `wego-app/lib/` 是否包含部署所需设计系统资源，且与 `.codex/skills/wego-design/` 源资源保持同步；不得出现只改副本不改源文件的漂移
- 是否具备 Vercel 静态部署条件（`wego-app/vercel.json` 完整、`wego-app/index.html` 存在）
- 本轮是否执行了 `git push origin main` 触发 GitHub → Vercel 自动部署
- 是否记录了本次推送的 commit hash 供 Vercel 控制台追踪
- 若 push 失败或 Vercel 构建失败，是否明确降级到本地入口 `wego-app/index.html`

## 部署结果验收

- 默认检查 `deployment_readiness_check.push_attempted=true`，除非本轮被明确中止在部署前
- 默认检查 `deployment_readiness_check.push_commit_hash` 是否记录了本次推送到 `origin/main` 的 commit hash
- 默认检查 `deployment_readiness_check.deploy_status` 取值是否为 `success` / `degraded-local` / `not-run` 之一
- 当 `deploy_status=success` 时，必须有 `production_domain`（Vercel 项目固定 Production Domain）
- 当 `deploy_status=degraded-local` 时，必须有失败原因（push 失败或 Vercel 构建失败），且 `fallback_local_entry` 必须为 `wego-app/index.html`
- 当 `deploy_status=not-run` 时，必须说明未执行原因（用户明确要求不部署或本轮被中止）
- 默认不强制点击线上链接，只检查部署结果字段是否完整；用户当次明确要求时，才追加 Vercel 控制台部署状态或线上页面访问验证

## 页面布局模式一致性验收

- [ ] `layout_pattern` 声明检查：`design_consumption_plan.json` 的 `layout_pattern` 是否显式声明"通栏模式 M1"或"卡片模式 M2"，禁止 `[+--card]` 条件性记法
- [ ] biz-rule-config 通栏检查：命中 biz-rule-config 的 surface 是否默认通栏 M1（phone-body 0px 横向 padding + cell-group__content 无 --card）；若实际为卡片 M2，必须归因到 surface 角色为 host-entry
- [ ] 横向 padding 取值检查：scene.css 的横向 padding 是否为 M1（0px）或 M2（16px），禁止 12px 等非 4N 倍数值；引用 `specs/布局与间距规范.md#页面边距`
- [ ] 移动端视觉一致性检查：移动端 scene 内容横向边距是否与桌面端一致（cell 内容 16px 横向边距由 cell__body padding 承担），不因 phone-frame border 消失而变小

**归因规则**：若以上检查不通过，归因到 `wego-design`（layout_pattern / allowed_page_styles 决策问题）或 `wego-ux`（scene.css 实现偏离声明模式）。

## 对象管理列表验收

当 `design_consumption_plan` 命中 `object-management-list-composition` 或 `matched_blueprint=object-management-list-page` 时，追加以下检查：

- [ ] 字段取舍检查：列表只展示对象识别、关键状态、1-2 条摘要和必要操作；完整地址、联系人、备注、配置明细、长文本等详情字段不得摊满列表卡片
- [ ] 列表方向检查：默认优先横向主结构（左识别图，右标题/状态/摘要/操作）；若使用纵向结构，`scene_fit_reason` 或 `implementation_constraints` 必须说明原因
- [ ] 图片层级检查：对象识别图应使用真实业务图片、对象缩略图或低饱和占位；不得用大面积高饱和渐变图抢占列表视觉
- [ ] 操作承载检查：1-2 个高频安全操作可在列表内外露；3 个及以上或危险/低频操作必须收纳到已注册菜单、sheet、详情/编辑页或 dialog 确认流程；若使用场景级临时气泡菜单，必须能在 `design_consumption_plan` 中找到“用户明确要求列表内直接操作并允许临时气泡菜单”的依据，且不得把它注册成通用组件类，危险操作仍必须二次确认
- [ ] 新增入口检查：导航栏右侧新增/新建入口默认是加号图标+文字；若为纯文字，必须能在 `design_consumption_plan` 中找到降级原因
- [ ] 表单对齐检查：同一创建/编辑页存在多组 form/cell 时，对齐策略必须一致；默认左对齐，若使用 right-align，应整页或同类分组统一
- [ ] 开关动画检查：switch 切换应更新 `switch--on` / `switch--off` 和 `aria-checked`，保留 `.switch` / `.switch__thumb` transition；若整组重渲染导致无滑块动画，归因到 `wego-ux`

## App 场景验收

- `wego-app/index.html` 必须是唯一宿主入口，包含 `.preview-shell` / `.phone-frame` / `.phone-screen`
- `wego-app/index.html` 必须在电脑端显示手机壳、移动端隐藏手机壳视觉并铺满真实 viewport
- `scene.js` 必须通过 `window.WegoApp.registerScene()` 注册当前 `route_id`
- `scene.css` 只能写当前业务场景样式，不覆盖宿主壳核心盒模型
- 场景文件不得包含 `.preview-shell`、`.phone-frame`、`.phone-screen`、`.phone-status`、`.phone-indicator`、`.uikit-shell`、`.phone-body`
- 运行时不得依赖 `fetch()` / `XHR` 读取本地 HTML 片段
- 不得通过普通 `<a href="./scenes/...">` 或 `location.href` 顶层跳转离开 App

## 页面打开方式验收

- `push`：检查是否在 `.phone-screen` 内打开二级页面；hash route 可变化；不得跳到独立 HTML；场景级 push 必须盖住 bottom-nav（`.app-scene-layer--cover-tab` 已应用）
- `modal`：检查是否为当前场景上的 dialog 层；关闭后回到原状态；场景级 modal 必须盖住 bottom-nav
- `sheet`：检查是否从底部进入；高度、遮罩、关闭方式清晰；场景级 sheet 必须盖住 bottom-nav
- `full-screen-modal`：检查是否覆盖手机屏；转场为底部进入；`covers_tab_bar=true` 时必须盖住 bottom-nav
- `page_presentation.type` 与入口触发、DOM 容器、动画和覆盖层级不一致时，归因到 `wego-ux`
- **一致性检查**：`coversTabBar` 实现值与 `design_consumption_plan.page_presentation.covers_tab_bar` 必须一致；`wego-app/scenes/` 下场景若 `coversTabBar=false`，必须归因到 `wego-design` 或 `wego-ux`（`host-entry` surface 除外）

## component_mapping 规格传递验收

- 每条 `component_mapping` 必须有 `consumption_mode` 字段；缺失归因到 `wego-design`
- `consumption_mode` 与 `selected` 写法匹配检查：`stable-variant` 必须是维度值组合（不得是完整 DOM 路径，也不得是自然语言描述）；`composition-constraint` 和 `free-composition` 必须是完整 DOM 路径（含分组容器类、修饰类、内嵌控件状态修饰类、图标资产路径）
- 禁止"结构同构"引用写法检查：`selected` 不得出现『与...结构同构』『同构』等引用词，每条必须独立给出完整 DOM 或维度值组合

## navbar leftControl 实现一致性验收

- `stable-variant` 模式下 navbar `leftControl` 实现与维度值一致：`leftControl=back-icon` 时实现必须是 `navbar__left-btn > i.wego-iconfont-s.icon-fanhui`；`leftControl=text-cancel` 时实现必须是 `navbar__left-text` 且文案为「取消」（不得为「返回」）；`leftControl=close-icon` 时实现必须是 `navbar__left-btn > i.wego-iconfont-s.icon-cha`
- 实现与 `selected` 维度值不一致时归因到 `wego-ux`；`selected` 写法与 `consumption_mode` 不匹配时归因到 `wego-design`

## 真实交互验收

- 选择、开关、输入、筛选、批量操作等状态必须有可见变化
- 保存、完成、取消、删除等操作必须有反馈
- 业务摘要或宿主入口回填按需求更新
- 空态、禁用态、错误态、成功态按业务必要性出现
- 不要求刷新后保留状态，除非需求明确要求

## 守门脚本引用规则

默认验收运行当前变更范围：

```bash
node scripts/validate-wego-design.mjs --scope=changed
```

用户明确要求全量验收时运行：

```bash
node scripts/validate-wego-design.mjs --scope=full
```

把脚本输出归档到 `automated_checks`：

- `script`：实际执行的命令
- `exit_code`：脚本退出码
- `errors`：脚本报出的 error 清单
- `warnings_count`：脚本 warning 数量
- `key_findings`：摘要关键发现

`automated_checks.errors.length > 0` 时，`final_status` 不能为 `pass`。

## 设计系统资源副本验收

- `wego-app/lib/` 只作为部署副本，不作为样式、Token、iconfont 或资产源文件
- 若本轮改动涉及 `.codex/skills/wego-design/colors_and_type.css`、`components.css`、`iconfont.css` 或 `assets/`，必须确认已运行 `node scripts/sync-wego-app-lib.mjs`
- 若本轮直接出现 `wego-app/lib/` diff，必须检查对应 `.codex/skills/wego-design/` 源文件是否同步变更；没有源文件变更时归因为 `wego-ux` 资源同步问题
- 验收时运行 `node scripts/validate-wego-design.mjs`；其中 `app.lib.out_of_sync` 错误必须阻止通过

## 结果归因

如果不通过，要明确问题属于哪一层：

- `wego-product`：需求理解、场景判断、入口路径、route_id 或 scene_folder 问题
- `wego-design`：设计系统消费、组件映射、页面打开方式或 fallback 判断问题
- `wego-ux`：App 路由注册、场景实现、交互、样式、资源同步或宿主改动问题
- `wego-tests`：验收项定义、范围选择或归因规则问题

禁止：

- 默认全量回归所有历史场景
- 只看页面截图不检查 `_spec` 和 `design_consumption_plan`
- 不按场景类型逐类验收
- 归因时不标注工作流环节
