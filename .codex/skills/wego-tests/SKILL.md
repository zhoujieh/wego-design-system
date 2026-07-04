---
name: wego-tests
description: 验收 wego-app 静态 App 原型中的当前业务场景，并输出 acceptance_report。用于检查需求承接、场景判断、设计系统消费、App 路由注册、交互流程、适配和部署可用性；默认只验当前任务与用户指定范围。
---

# Wego Tests

只做验收，不做原型生成。

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

只有用户明确要求时，才做全量 App 回归、全部历史场景回归或真实 Vercel 部署验收。

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
  "deployment_readiness_check": {},
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

默认验收不要求真实浏览器验证。验收依据以 `page_spec`、`design_consumption_plan`、当前场景文件、App 路由注册、静态资源检查和守门脚本结果为准；只有用户当次明确要求时，才把浏览器验证或 Vercel 部署验证作为附加核对项。

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
- `wego-app/lib/` 是否包含部署所需设计系统资源
- 是否具备 Vercel 静态部署条件

## App 场景验收

- `wego-app/index.html` 必须是唯一宿主入口，包含 `.preview-shell` / `.phone-frame` / `.phone-screen`
- `wego-app/index.html` 必须在电脑端显示手机壳、移动端隐藏手机壳视觉并铺满真实 viewport
- `scene.js` 必须通过 `window.WegoApp.registerScene()` 注册当前 `route_id`
- `scene.css` 只能写当前业务场景样式，不覆盖宿主壳核心盒模型
- 场景文件不得包含 `.preview-shell`、`.phone-frame`、`.phone-screen`、`.phone-status`、`.phone-indicator`、`.uikit-shell`、`.phone-body`
- 运行时不得依赖 `fetch()` / `XHR` 读取本地 HTML 片段
- 不得通过普通 `<a href="./scenes/...">` 或 `location.href` 顶层跳转离开 App

## 页面打开方式验收

- `push`：检查是否在 `.phone-screen` 内打开二级页面；hash route 可变化；不得跳到独立 HTML
- `modal`：检查是否为当前场景上的 dialog 层；关闭后回到原状态
- `sheet`：检查是否从底部进入；高度、遮罩、关闭方式清晰
- `full-screen-modal`：检查是否覆盖手机屏；转场为底部进入；`covers_tab_bar=true` 时必须盖住 bottom-nav
- `page_presentation.type` 与入口触发、DOM 容器、动画和覆盖层级不一致时，归因到 `wego-ux`

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
