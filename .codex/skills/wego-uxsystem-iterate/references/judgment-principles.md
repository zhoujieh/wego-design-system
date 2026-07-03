# 组件级稳定判断原则

适用于迭代模式和审查模式。工作流迭代模式见 `workflow-iteration.md`。

## 扩展还是新建

- 先判断这是“现有组件扩展”还是“需要新组件”
- 语义不变、交互原语不变、只是宿主结构或排版扩展时，优先留在原组件

## 交互与语义

- 只要组件本身带交互，优先把点击、展开、切换、互斥、父子联动等行为直接并入原场景示例，不新增独立“交互演示”模块
- preview 里如果靠 inline style 才成立组件语义，优先收回正式 class 或契约

## 契约一致性

- 契约如果公开了某个场景，`variantDimensions`、`representativeVariants`、preview 示例要一致
- 宿主包装层不要误写成控件本体子节点；必要时单独描述 `hostPatterns`

## 清理

- 取消场景时，要反向删除示例、class、契约字段和聚合残留

## 组件级守门

- 禁止直接手改 `.codex/skills/wego-design/components.css`
- 组件核心样式只改 `preview/component-{slug}.html` 的标记区
- 契约、preview、聚合样式必须同步
- 正式迭代后要重跑提取脚本：`node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`
- 涉及 Token 时必须同步 `.codex/skills/wego-design/css.json` 并校验 JSON
