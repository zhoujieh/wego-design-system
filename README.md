# wego-design-system

微购中文静态 App 原型与设计系统仓库。用户提供业务需求，AI 通过固定技能链路生成符合微购设计语言的移动端交互原型。

## 当前产物

- App 项目：`wego-app/`
- 唯一入口：`wego-app/index.html`
- 业务场景：`wego-app/scenes/{中文业务场景}/`
- 路由：hash `route_id`
- 电脑端：手机壳预览
- 移动端：同链接铺满真实 viewport
- 部署预览：Vercel 固定链接，同时支持本地直接打开

## 技能闭环

1. `wego-product`：理解原始需求，输出 `interaction_spec`。
2. `wego-design`：消费设计系统，输出 `design_plan`。
3. `wego-ux`：更新 `wego-app` 和对应场景。
4. `wego-tests`：验收当前任务，输出 `acceptance_report`。
5. `wego-uxsystem-iterate`：负责组件、UI Kit、工作流迭代和审查。

统一技能路由见 `.codex/skills/README.md`，仓库级约束见 `AGENTS.md`。

## 设计系统权威来源

- Token：`.codex/skills/wego-design/colors_and_type.css`、`css.json`
- 组件：`components/index.json`、`components/{slug}.json`、`preview/component-{slug}.html`
- 页面范式与组合：`uikit-plan.json`
- 消费边界：`library-consumption.json`
- 技能职责和交接：各技能 `SKILL.md` 与 references
- 仓库级硬约束：`AGENTS.md`

`docs/specs/*.md` 由正式规则来源自动生成，只用于人工检查，不是运行时权威来源，也不得直接修改。

## 经验沉淀

只有用户明确要求沉淀经验、补充规则、复盘形成经验或优化工作流时，才进入候选流程：

- 一次审查最多记录一条经验。
- 同类经验累计，不因业务名不同重复新增。
- 出现 3 次后先询问用户，未确认不升级正式规则。
- 候选池位于 `.codex/skills/wego-uxsystem-iterate/experience/`。
- `scenarioTypeRegistry` 只保存成熟的正式场景类型。

## 验证

```bash
node scripts/specs.mjs generate
node scripts/specs.mjs check
node scripts/specs.mjs test
node scripts/validate-wego-design.mjs
node scripts/validate-wego-design.mjs --scope=full --strict
```

`validate-wego-design.mjs` 会先检查自动生成规则文档与权威来源是否一致，再执行原有设计系统和 App 守门。
