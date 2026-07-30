# wego-app AI UXDesign 工作流

微购中文移动端原型与设计系统仓库。业务原型固定经过需求确认、设计实现、自动验证和用户验收；精简文档或守卫不得绕过这条链路。

## 权威入口

- 技能路由：`.codex/skills/README.md`
- 设计原则：`.codex/skills/shared/references/design-principles.md`
- 产品、设计和系统维护方法：对应技能直接引用的 `references/`

本文件只定义跨任务硬约束。按任务进入一个技能，再按需读取其引用，不预读完整工作流。

## 固定产物与边界

- `wego-app/index.html` 是唯一 App 入口和预览宿主；桌面端显示手机预览壳，移动端铺满 viewport。
- 业务场景位于 `wego-app/scenes/{中文业务场景}/`，通过稳定 kebab-case `#/route-id` 访问；路由登记在 `wego-app/js/routes.js`。
- 场景只维护 `scene.js` 和 `scene.css`，通过 `window.WegoApp.registerScene` 注册；原型产物不得散落到仓库根目录。
- `wego-app/lib/` 和生成的 `components.css` 禁止直接编辑。先修改 `.codex/skills/wego-design/` 权威源，再运行同步或生成脚本。
- `.trae/skills/*` 是 `.codex/skills/*` 的符号链接，不作为独立副本维护。

## 三技能主链路

- 新需求或业务范围变化：`wego-product` 形成并确认 `prototype_brief`。
- 已确认范围内的页面设计与实现：`wego-design`。
- 组件、Token、Preview、UI Kit、消费规则、守卫和工作流维护：`wego-uxsystem-iterate`。

业务需求必须属于有效迭代。简报提交、确认、失效和明确冻结的规则以 `.codex/skills/wego-product/references/iteration-workflow.md` 为唯一权威；确认、测试、交付、提交或时间经过均不等于冻结。

已确认简报即设计授权。`wego-design` 不补造业务事实、不建立第二次设计确认门禁，也不修改设计系统本体；正式能力不足时只交接最小缺口。页面质量以源码一致性、真实交互和浏览器视口检查为准，不要求人工合同、自证字段或设计决策镜像。

## Git、临时产物与验证

- 默认在 `main` 开发；除非用户要求，不自行创建分支或 PR。
- 只暂存本次任务的显式路径，不执行 `git add -A`，不强推已有远端分支。
- `.uploads/`、`output/` 和 `.playwright-cli/` 只用于短期输入或诊断，不提交；按需使用 `node scripts/cleanup-task-artifacts.mjs clean`。
- 普通改动运行 `node scripts/validate-wego-design.mjs`。
- 设计系统或工作流改动运行 `node scripts/validate-wego-design.mjs --scope=system --strict`。
- 正式合并前按需运行 `node scripts/validate-wego-design.mjs --scope=full --strict`。

<!-- rule-id: local-server-must-auto-exit -->
本地验证服务必须自动退出；任务结束前确认没有遗留监听进程。
