# wego-design-system

> 微购中文产品原型与设计系统仓库。以本地技能驱动，不依赖特定 agent 运行时，面向移动端、微信生态、电商与工具场景。

## 技能闭环

仓库统一采用 4 个本地技能闭环，全部位于 `.codex/skills/`：

1. `wego-product`
   负责理解原始需求并输出 `page_spec`
2. `wego-design`
   负责消费设计系统并输出 `design_consumption_plan`
3. `wego-ux`
   负责正式输出产品原型项目
4. `wego-tests`
   负责验收原型并输出 `acceptance_report`

这 4 段职责分开，避免一个技能同时承担需求理解、设计消费、原型生成和验收。

## 当前设计系统位置

设计系统本体位于：

- [.codex/skills/wego-design/SKILL.md](.codex/skills/wego-design/SKILL.md)
- [.codex/skills/wego-design/README.md](.codex/skills/wego-design/README.md)
- [.codex/skills/wego-design/library-consumption.json](.codex/skills/wego-design/library-consumption.json)
- [.codex/skills/wego-design/uikit-plan.json](.codex/skills/wego-design/uikit-plan.json)

旧目录已退出当前执行链路，不再作为权威路径。

## 核心目录

- `.codex/skills/wego-product/`：产品需求理解技能
- `.codex/skills/wego-design/`：设计系统本体与消费技能
- `.codex/skills/wego-ux/`：原型项目输出技能
- `.codex/skills/wego-tests/`：验收技能
- `.codex/skills/wego-uxsystem-iterate/`：项目级别迭代技能
- `docs/`：计划文档、历史审查文档、参考资料
- `scripts/validate-wego-design.mjs`：当前设计系统守门脚本

## 原型输出规则

- 正式输出产品原型的环节固定为 `wego-ux`
- 原型必须是任务级项目文件夹，不能把文件直接丢在仓库根目录
- 同一任务的迭代必须复用原有任务文件夹
- 默认原型骨架为静态 HTML/CSS/JS 单预览壳多页面交互项目，`index.html` 是唯一预览外壳和启动入口，不是唯一业务页面
- 默认目标是浏览器直接打开即可预览,可在手机浏览器中独立查看,无需构建、无需依赖

## 设计系统方向

- 风格：简洁、干净、淡雅、克制
- 优先级：清晰 > 一致 > 效率 > 美观 > 创新
- 主色：微信绿 `#03C160`
- 默认场景：移动端、微信生态、电商、工具、社交
- 默认密度：移动端高信息密度

禁止方向漂移：

- 不把系统改成桌面 IDE、后台工作台或营销大屏
- 不把 Showcase 外壳当作生产页面模板

## 常用入口

- 根规则：[AGENTS.md](AGENTS.md)
- 设计系统技能：[.codex/skills/wego-design/SKILL.md](.codex/skills/wego-design/SKILL.md)
- 项目级别迭代技能：[.codex/skills/wego-uxsystem-iterate/SKILL.md](.codex/skills/wego-uxsystem-iterate/SKILL.md)
- 闭环计划：[docs/wego-local-skills-closed-loop-plan.md](docs/wego-local-skills-closed-loop-plan.md)

## 验证

当前设计系统守门脚本：

```bash
node scripts/validate-wego-design.mjs
node scripts/validate-wego-design.mjs --scope=full --strict
```

组件样式聚合脚本：

```bash
node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design
```
