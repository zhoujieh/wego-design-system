# wego-app AI UXDesign 工作流

微购中文静态 App 原型与设计系统仓库。用户提供业务需求，AI 通过固定技能链路生成符合微购设计语言的移动端交互原型。

## 当前产物

- App 项目：`wego-app/`
- 唯一入口：`wego-app/index.html`
- 业务场景：`wego-app/scenes/{中文业务场景}/`
- 业务迭代：`wego-app/scenes/{主业务场景}/_iterations/{日期}-{iteration_id}-{标题}/`
- 路由：稳定 kebab-case `route_id`，通过 `#/route-id` 访问
- 电脑端：手机壳预览
- 移动端：同链接铺满真实 viewport
- 部署预览：Vercel 固定链接，同时支持本地直接打开

## 技能闭环

1. `wego-product`：创建业务迭代，确认范围、原型边界与 `prototype_brief`。
2. `wego-design`：先遵循唯一设计决策原则，再 Preview-first 地消费设计系统并实现、验证场景。
3. `wego-uxsystem-iterate`：负责组件、UI Kit、Token、设计系统缺口、工作流迭代和审查。

统一技能路由见 `.codex/skills/README.md`，仓库级约束见 `AGENTS.md`。

每个技能以单一 `SKILL.md` 为入口，详细 schema、迁移和专项流程按条件放在 `references/`；可复制模板和资源进入 `assets/`，确定性操作进入 `scripts/`。设计系统组件、Preview、Token 和 UI Kit 保留机器消费所需的专用目录。

## 设计系统权威来源

- 设计决策原则：`.codex/skills/wego-design/references/design-decisions.md`
- Token：`.codex/skills/wego-design/colors_and_type.css`、`.codex/skills/wego-design/css.json`
- 组件：`.codex/skills/wego-design/components/index.json`、`.codex/skills/wego-design/components/{slug}.json`、`.codex/skills/wego-design/preview/component-{slug}.html`
- 明确页面范式：`.codex/skills/wego-design/uikit-plan.json`（未命中时按设计决策原则自主组合）
- 消费边界：`.codex/skills/wego-design/library-consumption.json`
- 技能职责和交接：各技能 `SKILL.md` 与其直接引用的 `references/`
- 仓库级硬约束：`AGENTS.md`

## 经验沉淀

只有用户明确要求沉淀经验、补充规则、复盘形成经验或优化工作流时，才进入候选流程：

- 同类经验累计，不因业务名不同重复新增。
- 生效阈值与迭代模式以候选池顶层配置为准；达到生效阈值后先询问用户，未确认不升级正式规则。
- 候选数据位于 `.codex/skills/wego-uxsystem-iterate/experience/candidates.json`，字段和流程见 `.codex/skills/wego-uxsystem-iterate/references/experience-candidates.md`。
- `scenarioTypeRegistry` 只保存成熟的正式场景类型。

## 验证

```bash
node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design
node scripts/validate-component-contract-parity.mjs
node scripts/iteration-record.mjs test
node scripts/validate-wego-design.mjs
node scripts/validate-wego-design.mjs --scope=full --strict
```

`validate-wego-design.mjs` 会先检查组件契约一致性，再执行设计系统、场景和 App 守门。

`iteration-record.mjs` 负责业务迭代状态机、范围确认、原型失效和冻结；历史场景无需补录，后续再次修改时必须创建有效迭代。

只修改设计系统或工作流本体时，可使用 `node scripts/validate-wego-design.mjs --scope=system --strict`；该范围跳过业务场景产物，`--strict` 会把警告视为失败。涉及设计系统部署资源时，再运行 `node scripts/sync-wego-app-lib.mjs --check`。
