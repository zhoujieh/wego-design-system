# 完整交互原型工作流兼容规则

> 历史归档文档（不参与当前技能、规则或运行时判断）：仓库已进入唯一当前版本，不保留本文所述兼容读取、旧规格或旧技能。当前唯一权威来源是 `AGENTS.md`、`.codex/skills/README.md` 与各现行 `SKILL.md`。

## 1. 当前状态

完整交互原型工作流已经完成真实场景的新格式迁移，`wego-app` 中有效业务场景均应优先使用：

```text
interaction_spec.json
design_plan.json
```

旧格式进入兼容期，只作为只读迁移来源和历史回退来源：

```text
page_spec.json
design_consumption_plan.json
```

## 2. 读取优先级

所有技能、脚本、校验和验收逻辑必须使用同一套读取顺序。

### 2.1 产品/交互规格读取

```text
1. 优先读取 _spec/interaction_spec.json
2. 不存在时，才回退读取 _spec/page_spec.json
```

### 2.2 设计方案读取

```text
1. 优先读取 _spec/design_plan.json
2. 不存在时，才回退读取 _spec/design_consumption_plan.json
```

## 3. 写入规则

### 3.1 新任务

新任务只能写入新格式：

```text
_spec/interaction_spec.json
_spec/design_plan.json
```

不得再新建：

```text
_spec/page_spec.json
_spec/design_consumption_plan.json
```

### 3.2 已迁移场景

已迁移场景只允许继续维护新格式。

旧文件如仍存在，只能用于：

- 对比迁移前内容；
- 兼容读取回退；
- 审查历史判断来源；
- 删除旧格式前的人工核对。

不得继续编辑旧文件，也不得让新旧文件表达不同业务语义。

### 3.3 未迁移场景

如果发现仍只有旧格式的有效场景：

1. 先读取旧格式作为迁移来源；
2. 生成对应新格式；
3. 新格式通过静态校验后，后续只维护新格式；
4. 旧格式进入只读兼容状态。

## 4. 删除旧格式的条件

当前阶段不删除旧格式支持。

只有同时满足以下条件，才允许进入删除阶段：

1. 仓库内不存在仍依赖旧规格的有效场景；
2. `wego-product` 不再生成 `page_spec.json`；
3. `wego-design` 不再生成 `design_consumption_plan.json`；
4. `wego-ux` 已优先消费 `interaction_spec.json` 和 `design_plan.json`；
5. `wego-tests` 已按新验收结构读取和验收；
6. 所有脚本、模板、README、AGENTS 和生成文档已切换；
7. 真实浏览器端到端回归验证通过。

## 5. 技能职责兼容规则

### 5.1 wego-product

- 输入：用户需求、已有新格式规格；必要时兼容读取旧 `page_spec.json`。
- 输出：只输出 `interaction_spec.json`。
- 禁止：继续把 `page_spec.json` 当作新任务产物。

### 5.2 wego-design

- 输入：优先读取 `interaction_spec.json`；必要时兼容读取旧 `page_spec.json`。
- 输出：只输出 `design_plan.json`。
- 禁止：继续把 `design_consumption_plan.json` 当作新任务产物。

### 5.3 wego-ux

- 输入：优先读取 `interaction_spec.json` + `design_plan.json`。
- 回退：只有新格式缺失时，才允许读旧 `page_spec.json` + `design_consumption_plan.json`。
- 实现：不得因为旧文件存在而覆盖新格式决策。

### 5.4 wego-tests

- 输入：优先读取新格式规格和设计方案。
- 验收：按完整任务路径验收，而不是只验单页面。
- 报告：使用 `acceptance_report.json` 或场景级/全局验收报告记录：
  - `flow_coverage`
  - `transition_check`
  - `state_handoff_check`
  - `back_restore_check`
  - `prototype_boundary_check`
  - `end_to_end_paths`

## 6. 校验规则

最低校验项：

1. 新格式存在时不得读取旧格式作为主输入；
2. 新旧格式同时存在时，新格式为唯一有效编辑目标；
3. `design_plan` 只能引用 `interaction_spec` 中存在的对象；
4. `functional` 节点必须有设计覆盖；
5. `stub` 节点必须有明确反馈；
6. `blocked` 节点不得进入实现；
7. 设计计划不得新增业务流程和业务内容；
8. 实现中必须保留稳定节点标识；
9. 验收报告必须覆盖完整路径、状态回填和返回恢复；
10. 旧文件删除前必须通过真实浏览器回归。

## 7. 当前推荐执行口径

当前项目进入以下口径：

```text
新格式：主用、维护、验收依据
旧格式：只读、回退、迁移来源
删除旧格式：暂缓，等真实回归和脚本切换全部完成后再执行
```

## 8. 与迁移记录的关系

`wego-app/_spec/legacy_spec_archive_manifest.json` 用于记录旧格式只读归档状态。

`wego-app/_spec/interaction_workflow_acceptance_report.json` 用于记录当前静态迁移验收和待执行的浏览器运行时验收。
