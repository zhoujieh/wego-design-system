# 工作流迭代与经验沉淀

> 角色：用户明确要求时的经验候选与正式规则升级流程。

## 1. 入口门禁

只有用户明确要求审查并沉淀经验、补充规则、复盘形成经验或优化工作流，才允许更新候选池。普通修复只修改权威源和守卫，不自动沉淀经验。

## 2. 归属

按“问题首次产生 → 应做正确决定的技能 → 唯一权威源 → 运行时消费者 → 验收守卫”判断。

- 业务目标、范围、状态、入口：wego-product。
- 场景设计消费、组件计划、路由、交互、状态、视觉：wego-design。
- 组件、Preview、Token、UI Kit、DDR、消费规则与守卫：wego-uxsystem-iterate。

## 3. 候选与升级

候选只写 `experience/candidates.json`。同类问题累计证据；达到阈值后变为 `awaiting-confirmation`，用户确认前不得修改正式规则。

确认后必须写清 `applies_when`、`avoid_when`、`exceptions`、`fallback`、唯一落点、运行时消费者和验证守卫。规则升级后更新候选状态为 `promoted`，并运行：

```bash
node scripts/validate-component-contract-parity.mjs
node scripts/validate-skill-entry-boundary.mjs
node scripts/validate-wego-design.mjs
```

## 4. scenarioTypeRegistry

仅登记成熟且被运行时消费的类型。候选、历史技能职责、次数和单场景特例不得进入注册表。
