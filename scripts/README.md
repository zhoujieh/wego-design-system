# scripts 目录说明

统一验证优先使用 `validate-wego-design.mjs`。普通任务不手工串行运行全部脚本，工具与回归测试按改动范围触发。

## 常用入口

| 脚本 | 使用时机 |
| --- | --- |
| `validate-wego-design.mjs` | 仓库统一验证；默认 `changed`，支持 `--scope=changed|system|full` 和 `--strict` |
| `validate-scene-contract.mjs` | 从源码验证单个场景的路由、组件、Token、交互和布局硬约束；含 `layout-page` 唯一、`layout-scroll` 唯一（modal/overlay 内部豁免）、`position:absolute` 兼容 `layout-page` 等 Layout 守卫 |
| `validate-scene-runtime.mjs` | 用 Playwright 检查场景 375/393 运行结果；统一静态验证不全库调用，业务场景每轮按 `wego-scene-app-test` 对本次受影响场景定向执行 |
| `iteration-record.mjs` | 创建、提交、确认、失效、冻结或检查业务迭代；`in-development` 承载原型循环，终局材料确认后由 `prototyping` 连续进入冻结 |
| `resolve-delivery-unit.mjs` | 开工前从分类场景目录、全部 worktree、本地分支与远端开放 PR 核对当前分支实际承载的未冻结迭代；匹配主场景、关联场景和 affected_scenes |
| `validate-component-contract-parity.mjs` | 验证组件契约、Preview、索引与生成 CSS 一致性 |
| `sync-wego-app-lib.mjs` | 设计系统源变化后同步部署副本 |
| `build-routes.mjs` | 由各场景 `route.json` 汇总生成 `wego-app/js/routes.js`；`--check` 校验一致性 |
| `build-pages-artifact.mjs` | 构建 GitHub Pages 发布产物；仅在用户明确要求 PR/在线预览或合并阶段使用 PR 在线预览 |
| `refine-experience.mjs` | 经验只读查询与守门；`--related` 查相关因果事实，`--check` 从 `qualityGateSince` 起强制校验 observation/mechanism/rule/scope/verification/novelty，`--self-test-quality` 验证质量门能放行合格结构并拒绝需求记录/缺失机制记录 |

场景源码变化后直接运行静态守卫，无需生成中间证据文件。本地迭代阶段只运行与改动相称的检查；用户验收通过后的合并阶段运行完整静态验证。

## 按需维护工具

| 脚本 | 使用时机 |
| --- | --- |
| `reset-wego-app-baseline.mjs` | 清空全部业务场景并重建空白路由；支持 `--check` 与 `--dry-run` |
| `cleanup-task-artifacts.mjs` | 清理普通临时产物；永久排除 `.tasks/experience-inbox.json` 与 `.tasks/preview-servers/`，两者只由对应收口流程处理 |
| `generate-scene-skeleton.mjs` | 仅在需要重新采样显式骨架模板时运行 |

## 内部模块与定向回归

`route-source-parser.mjs`、`scene-source-parser.mjs` 和 `validate-wego-design-core.mjs` 由入口脚本调用，不作为普通人工命令。

以下回归测试只在对应实现变化时运行，不进入普通验证的无条件主链；工作流相关测试会由 system/full 验证统一触发：

- `test-scene-contract-tools.mjs`
- `test-reset-wego-app-baseline.mjs`
- `test-sync-wego-app-lib.mjs`
- `test-scroll-layout.mjs`
- `iteration-record.mjs test`
- `validate-scene-iteration-binding.mjs test`
- `resolve-delivery-unit.mjs test`

守卫只验证 Schema、源码或结构化数据，不检查文档标题、固定句子或引用顺序。经验质量门强制结构化因果字段存在，字段内容仍由 AI 结合事实判断，不以长度或关键词冒充语义质量。
