# scripts 目录说明

不是每个脚本都需要在每次任务中运行。该目录按职责分为四类；统一验证优先使用 `validate-wego-design.mjs`，不要手工串行执行所有测试。

## 工作流入口

| 脚本 | 使用时机 |
| --- | --- |
| `validate-wego-design.mjs` | 统一验证入口；内部组合组件一致性与核心守卫 |
| `iteration-record.mjs` | 创建、确认、失效、冻结或检查业务迭代 |
| `extract-design-decisions.mjs` | 场景源码变化后重新提取 `design-decisions.json` |
| `validate-scene-contract.mjs` | 验证单个业务场景 |
| `sync-wego-app-lib.mjs` | 设计系统源变化后同步部署副本 |
| `validate-component-contract-parity.mjs` | 验证组件契约、Preview、索引与生成 CSS 一致性 |

## 按需维护工具

| 脚本 | 使用时机 |
| --- | --- |
| `reset-wego-app-baseline.mjs` | 清空全部业务场景，或通过 `--scene` 清理指定场景 |
| `cleanup-task-artifacts.mjs` | 清理 `.uploads/`、`output/`、`.playwright-cli/` 临时产物 |
| `generate-scene-skeleton.mjs` | 仅在需要重新采样显式骨架模板时运行 |

这些脚本不是每次业务迭代的固定步骤。

## 内部模块

- `prompt-contract-schema.mjs`
- `route-source-parser.mjs`
- `scene-source-parser.mjs`
- `validate-wego-design-core.mjs`

它们被入口脚本导入或编排，不作为普通人工命令。

## 自动守卫与回归测试

- `validate-design-decision-method.mjs`
- `validate-skill-entry-boundary.mjs`
- 所有 `test-*.mjs`

这些文件由 `validate-wego-design.mjs` 自动调用，用于防止 Schema、解析器、同步和技能边界回退；不要求每次手工逐个运行，但属于当前工作流必需的可执行守卫。
