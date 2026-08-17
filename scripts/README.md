# scripts 目录说明

统一验证优先使用 `validate-wego-design.mjs`。普通任务不手工串行运行全部脚本，工具与回归测试按改动范围触发。

## 常用入口

| 脚本 | 使用时机 |
| --- | --- |
| `validate-wego-design.mjs` | 仓库统一验证；默认 `changed`，支持 `--scope=changed|system|full` 和 `--strict` |
| `validate-scene-contract.mjs` | 从源码验证单个场景的路由、组件、Token、交互和布局硬约束；含 `layout-page` 唯一、`layout-scroll` 唯一（modal/overlay 内部豁免）、`position:absolute` 兼容 `layout-page` 等 Layout 守卫 |
| `validate-scene-runtime.mjs` | 自动启动临时服务，用 Playwright 检查单场景或 `--all` 场景的 375/393 运行结果 |
| `iteration-record.mjs` | 创建、提交、确认、失效、冻结或检查业务迭代；`prototyping` 承载本地迭代，明确提交授权后才执行 `submit-prototype` |
| `resolve-delivery-unit.mjs` | 开工前从全部 worktree 核对场景认领、未冻结迭代和可选开放 PR；单一候选即接手，允许本地迭代阶段尚未创建 PR |
| `validate-component-contract-parity.mjs` | 验证组件契约、Preview、索引与生成 CSS 一致性 |
| `sync-wego-app-lib.mjs` | 设计系统源变化后同步部署副本 |
| `build-routes.mjs` | 由各场景 `route.json` 汇总生成 `wego-app/js/routes.js`；`--check` 校验一致性 |
| `validate-claims.mjs` | 校验 `claims/` 下场景认领无冲突；CI 结合 PR base/head 与 branch 强制每个场景目录变更都有对应认领 |
| `build-pages-artifact.mjs` | 构建 GitHub Pages 发布产物；只在正式业务验收阶段使用 PR 在线预览 |

场景源码变化后直接运行静态和运行时守卫，无需生成中间证据文件；浏览器证据不写回场景。本地迭代阶段只运行与改动相称的检查，获得明确提交授权后再进入完整严格验证。

## 按需维护工具

| 脚本 | 使用时机 |
| --- | --- |
| `reset-wego-app-baseline.mjs` | 清空全部业务场景、释放活跃场景认领并重建空白路由；支持 `--check` 与 `--dry-run` |
| `cleanup-task-artifacts.mjs` | 清理 `.uploads/`、`output/`、`.tasks/`、`.playwright-cli/` 临时产物；不得删除仍处于本地迭代或正式验收的预览服务记录 |
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
- `validate-claims.mjs test`
- `resolve-delivery-unit.mjs test`

守卫只验证 Schema、源码或真实运行结果，不检查文档标题、固定句子、引用顺序或人工自证字段。
