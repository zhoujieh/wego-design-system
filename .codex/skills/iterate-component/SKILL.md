---
name: "iterate-component"
description: "用于迭代或审查 wego-design 已注册组件。适用于组件契约、preview 标记区样式、components.css 生成链路和正式守门。"
---

# 组件迭代 Skill

用于 `wego-design` 组件的正式工作。目标只有两个：

1. 不要只改一个文件就结束
2. 不要把技能写成无限膨胀的经验仓库

这个技能保留少数稳定规则，把具体同步步骤交给 `references/`。

## 适用场景

- 迭代已注册组件
- 审查组件改动是否合理
- 发布新组件
- 改已注册 UI Kit（范式、组合、节奏、收口方式调整）
- 发布新 UI Kit
- 发现并收回散落在下游技能文档（如 wego-ux/SKILL.md）中的组件使用规则
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

**已有组件迭代**按此顺序读取：

1. `.codex/skills/wego-design/SKILL.md`
2. `.codex/skills/wego-design/README.md`
3. `.codex/skills/wego-design/library-consumption.json`
4. `.codex/skills/wego-design/uikit-plan.json`
5. `.codex/skills/wego-design/components/index.json`
6. `.codex/skills/wego-design/components/{slug}.json`
7. `.codex/skills/wego-design/preview/component-{slug}.html`

**新增组件**跳过第 6-7 步（文件尚不存在），直接进入 `references/workflow.md` 第 3 节"新增组件发布标准步骤"。

按任务补读：

- 涉及 Token：`.codex/skills/wego-design/colors_and_type.css`、`.codex/skills/wego-design/css.json`
- 涉及 UI Kit：先读 `.codex/skills/wego-design/metadata.json` 的 `uiKits` 列表确认全部已注册 UI Kit，再读命中的 `.codex/skills/wego-design/ui_kits/{slug}/index.html` 与对应 `quality-report.json`；不要默认只看 `app`
- 涉及图标：`.codex/skills/wego-design/iconfont.css`、`.codex/skills/wego-design/assets/icons/`
- 涉及规范：`.codex/skills/wego-design/specs/*`

## 最小守门

只保留这些硬约束：

- 禁止直接手改 `.codex/skills/wego-design/components.css`
- 组件核心样式只改 `preview/component-{slug}.html` 的标记区
- 契约、preview、聚合样式必须同步
- 正式迭代后要重跑提取脚本：`node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`
- 涉及 Token 时必须同步 `.codex/skills/wego-design/css.json` 并校验 JSON
- 正式迭代必须递增 `.codex/skills/wego-design/metadata.json.version`

## 稳定判断原则

只保留最常复用的判断，不堆零散技巧：

**扩展还是新建**
- 先判断这是“现有组件扩展”还是“需要新组件”
- 语义不变、交互原语不变、只是宿主结构或排版扩展时，优先留在原组件

**交互与语义**
- 只要组件本身带交互，优先把点击、展开、切换、互斥、父子联动等行为直接并入原场景示例，不新增独立“交互演示”模块
- preview 里如果靠 inline style 才成立组件语义，优先收回正式 class 或契约

**契约一致性**
- 契约如果公开了某个场景，`variantDimensions`、`representativeVariants`、preview 示例要一致
- 宿主包装层不要误写成控件本体子节点；必要时单独描述 `hostPatterns`

**清理**
- 取消场景时，要反向删除示例、class、契约字段和聚合残留

## 浏览器核对

只有在视觉结果有明显不确定性时，才做真实浏览器核对，例如：

- 圆角、偏移、滚动、遮挡、暗色可见性
- 长文案换行或移动端溢出

按可用性依次尝试：

1. 本地静态服务探活
2. 若 agent 有内置浏览器则用，否则跳过
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

- `.codex/skills/wego-design/components/index.json` 是已发布组件权威来源
- `.codex/skills/wego-design/preview/index.html` 是人工聚合验收页——AI 不读取、不修改，由人在浏览器中手动核对
- 若用户要求直接改 `.codex/skills/wego-design/components.css`，必须拦截并改走 preview 标记区 + 提取脚本
- 提交前可运行 `node scripts/validate-wego-design.mjs` 做文件完整性守门
- `button` 的参考案例见 `references/button-example.md`
