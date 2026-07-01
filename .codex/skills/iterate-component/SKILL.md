---
name: "iterate-component"
description: "用于迭代或审查 wegoux 已注册组件。适用于组件契约、preview 标记区样式、components.css 生成链路和正式守门。"
---

# 组件迭代 Skill

用于 `wegoux` 组件的正式工作。目标只有两个：

1. 不要只改一个文件就结束
2. 不要把技能写成无限膨胀的经验仓库

这个技能保留少数稳定规则，把具体同步步骤交给 `references/`。

## 适用场景

- 迭代已注册组件
- 审查组件改动是否合理
- 发布新组件
- 拦截“直接改 components.css”这类错误入口

## 工作模式

先判断当前请求属于哪一种：

- `迭代模式`
  适用于“改样式、补场景、修契约、同步 preview、发布组件”。
- `审查模式`
  适用于“review、看看是否合理、要不要新做组件、契约有没有漂移”。

默认规则：

- 用户要求修改文件，走 `迭代模式`
- 用户只要求检查或评估，走 `审查模式`
- 如果是“先审查再修”，先出 findings，再进入 `迭代模式`

## 固定读取顺序

每次开始前按这个顺序读取：

1. `wegoux/SKILL.md`
2. `wegoux/README.md`
3. `wegoux/library-consumption.json`
4. `wegoux/uikit-plan.json`
5. `wegoux/components/index.json`
6. `wegoux/components/{slug}.json`
7. `wegoux/preview/component-{slug}.html`

按任务补读：

- 涉及 Token：`wegoux/colors_and_type.css`、`wegoux/css.json`
- 涉及新增组件：`wegoux/preview/index.html`
- 涉及 UI Kit：`wegoux/ui_kits/app/index.html`、对应 `quality-report.json`
- 涉及图标：`wegoux/iconfont.css`、`wegoux/assets/icons/`
- 涉及规范：`wegoux/specs/*`

## 最小守门

只保留这些硬约束：

- 禁止直接手改 `wegoux/components.css`
- 组件核心样式只改 `preview/component-{slug}.html` 的标记区
- 契约、preview、聚合样式必须同步
- 正式迭代后要重跑提取脚本：`node wegoux/scripts/extract-components-css.mjs wegoux`
- 涉及 Token 时必须同步 `wegoux/css.json` 并校验 JSON
- 正式迭代必须递增 `wegoux/metadata.json.version`

## 稳定判断原则

只保留最常复用的判断，不堆零散技巧：

- 先判断这是“现有组件扩展”还是“需要新组件”
- 语义不变、交互原语不变、只是宿主结构或排版扩展时，优先留在原组件
- 只要组件本身带交互，优先把点击、展开、切换、互斥、父子联动等行为直接并入原场景示例，不新增独立“交互演示”模块
- preview 里如果靠 inline style 才成立组件语义，优先收回正式 class 或契约
- 契约如果公开了某个场景，`variantDimensions`、`representativeVariants`、preview 示例要一致
- 宿主包装层不要误写成控件本体子节点；必要时单独描述 `hostPatterns`
- 取消场景时，要反向删除示例、class、契约字段和聚合残留

## 浏览器核对

只有在视觉结果有明显不确定性时，才做真实浏览器核对，例如：

- 圆角、偏移、滚动、遮挡、暗色可见性
- 长文案换行或移动端溢出

固定顺序：

1. 本地静态服务探活
2. 当前 agent 自带内置浏览器
3. Playwright

如果被工具阻塞，要如实记录，并退回静态扫描、脚本校验和资源检查，不把工具问题误记成组件问题。

## 任务分流

- 详细步骤：读 `references/workflow.md`
- 同步范围：读 `references/sync-matrix.md`

技能本体只负责分流和守门，不重复展开所有步骤。

## 输出约定

无论迭代还是审查，回复都保持这 3 句：

- 改了什么：
- 验证了什么：
- 剩余风险：

额外规则：

- `审查模式` 先给 findings，再补这 3 句
- 没有真实风险时写“无明显剩余风险”

## 特别提醒

- `wegoux/components/index.json` 是已发布组件权威来源
- `wegoux/preview/index.html` 只用于人工聚合验收，不替代单组件契约
- 若用户要求直接改 `wegoux/components.css`，必须拦截并改走 preview 标记区 + 提取脚本
- `button` 的参考案例见 `references/button-example.md`
