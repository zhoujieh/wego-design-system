# 优化 AGENTS.md 并修正陈旧引用

## 任务背景

用户今天对整体工作流做了较大调整(原型交付从 Next.js/Vercel 改为静态 HTML/CSS/JS 多页面项目),但 AGENTS.md 定位仍停留在"已入门 agent 的规则提醒",且多份文件残留 Next.js/Vercel 引用,与当前工作流矛盾。

用户目标:**任何用户复制本仓库,给任意 AI agent 发需求,即可按步骤生成微购产品交互原型**。

## 当前状态分析

### AGENTS.md 的问题
1. **定位错位**:开篇直接是"沟通要求""固定方向",没有告诉新 agent"这个仓库是什么、收到需求后第一步做什么"。
2. **未体现"复制即可用"**:缺少标准流水线的入口说明,新 agent 不知道从哪开始。
3. **技能闭环漏列**:只列 4 段流水线,`iterate-component` 仅以侧注出现,实际它是第 5 个正式技能。
4. **方向约束与操作规则混杂**:高阶方向(品牌绿、密度)和底层脚本命令(extract-components-css.mjs)混在同一层,不利于快速理解。

### 跨文件陈旧引用(与静态 HTML 工作流矛盾)
经 Grep 确认,以下文件仍保留 Next.js/Vercel 残留,与 `wego-ux/SKILL.md`(静态 HTML/CSS/JS)和 `uikit-plan.json`(`deliveryMode: "static-multi-page"`)矛盾:

| 文件 | 行号 | 陈旧内容 |
|------|------|----------|
| `README.md` | 46-47 | "默认原型骨架为 Next.js App Router" / "可部署到 Vercel" |
| `.codex/skills/wego-design/library-consumption.json` | 196 | `"defaultDeliveryMode": "deployable-project"` |
| `.codex/skills/wego-design/library-consumption.json` | 84-108 | `buildDeployableProject` 场景,deliverables 含"npm 包元信息/构建配置/Vercel" |
| `.codex/skills/wego-ux/agents/openai.yaml` | 4 | `default_prompt` 写 "Next.js App Router structure for Vercel" |

### 其他项目结构观察(仅记录,本轮不改)
- `.trae/documents/` 累积了 15 份历史计划文档,未在 `.gitignore` 中。这些是本地工作文档,建议后续加入 `.gitignore` 或定期清理,本轮不动以免影响现有计划追踪。
- `docs/参考trae/` 是结构参考材料,已明确标注不复制视觉方向,无需改动。

## 改动方案

### 改动 1:重写 AGENTS.md(入口工作流指南定位)

**文件**:`/Users/dk/Documents/code/wego-design-system/AGENTS.md`
**改什么**:按"入口指南"重组结构,开篇即回答"仓库是什么 + 收到需求怎么做"。
**为什么**:让任意 agent 复制仓库后即可上手,无需额外引导。
**怎么改**:新结构如下(保留原有硬约束,只调整顺序与框架):

```
# wego 设计系统

## 这个仓库是什么
微购(WeGo)中文产品原型与设计系统仓库。复制即可用——给 AI 发送业务需求,
按 4 段流水线即可输出可在浏览器直接预览的移动端产品原型(静态 HTML/CSS/JS,
无需构建、无需依赖)。

## 如何开始(标准流水线)
收到业务需求后,按顺序走 4 段,每段入口是对应 SKILL.md:
1. wego-product → 输出 page_spec(需求理解、任务分类、场景判断)
2. wego-design → 输出 design_consumption_plan(设计系统消费、UI Kit 映射)
3. wego-ux → 输出原型项目(静态 HTML 任务级文件夹,浏览器直接打开)
4. wego-tests → 输出 acceptance_report(验收)
组件迭代/新增/契约同步走第 5 个技能 iterate-component。
没有 page_spec 时不直接进入设计消费;没有 design_consumption_plan 时不直接生成原型。

## 技能闭环
(5 个技能,含 iterate-component,每个说明职责与产物)

## 设计系统方向
(原"固定方向"+"禁止方向漂移",原样保留)

## 设计系统边界
(原"设计系统边界",原样保留)

## 每次开发前的读取顺序
(原"读取顺序",精简:先按任务类型选入口 SKILL.md,再按 wego-design 固定顺序)

## 原型输出规则
(原"原型输出规则",明确静态 HTML/CSS/JS、任务级文件夹、浏览器直接打开)

## 变更同步矩阵
(原"变更同步矩阵",原样保留)

## 设计质量门禁
(原"设计质量门禁",原样保留)

## 文件完整性检查
(原"文件完整性检查",原样保留)

## Git 与发布
(原"Git 与发布",原样保留)
```

**保留不删的硬约束**:固定方向、禁止漂移、4N 间距、品牌绿克制、components.css 禁止手改、extract 脚本命令、metadata.json 版本递增、显式 git add、不提交 .DS_Store/.uploads/ 等全部保留,只调整其归属章节。

### 改动 2:修正 README.md 陈旧引用

**文件**:`/Users/dk/Documents/code/wego-design-system/README.md`
**改什么**:第 46-47 行的"原型输出规则"。
**为什么**:与 wego-ux SKILL.md 的静态 HTML 工作流矛盾。
**怎么改**:
- "默认原型骨架为 Next.js App Router" → "默认原型骨架为静态 HTML/CSS/JS 多页面项目"
- "默认目标是可部署到 Vercel、可在手机浏览器中独立预览" → "默认目标是浏览器直接打开即可预览,可在手机浏览器中独立查看,无需构建、无需依赖"

### 改动 3:修正 library-consumption.json 陈旧字段

**文件**:`/Users/dk/Documents/code/wego-design-system/.codex/skills/wego-design/library-consumption.json`
**改什么**:
1. 第 196 行 `"defaultDeliveryMode": "deployable-project"` → `"defaultDeliveryMode": "static-multi-page"`(与 `uikit-plan.json` 的 `deliveryMode` 一致)
2. 第 84-108 行 `buildDeployableProject` 场景:删除 npm/Vercel/构建配置语义,改为描述静态多页面项目(浏览器直接打开、无框架依赖、可被任意静态服务器托管)
**为什么**:`defaultDeliveryMode` 与 `uikit-plan.json` 不一致;`buildDeployableProject` 的 deliverables( npm 包元信息、构建配置、Vercel 基线)与静态 HTML 方案矛盾。
**怎么改**:
- `consume` 字段改为:"默认输出静态多页面 HTML 项目,不依赖前端框架;浏览器直接打开 index.html 即可预览,也可被任意静态服务器(Vercel/Netlify/nginx)托管,无需安装与构建。"
- `deliverables` 改为:`["项目源码目录", "页面路由入口(index.html)", "全局样式与 Token 引入", "静态资源目录", "运行说明"]`(删除 npm/构建配置)
- `vercelBaseline` 改为 `staticHostBaseline`:`["存在可直接打开的 index.html","页面不是孤立单文件","样式和资源路径为相对路径","可作为静态站点部署"]`
- 修改后必须执行 `python3 -c "import json; json.load(open('.codex/skills/wego-design/library-consumption.json'))"` 校验

### 改动 4:修正 wego-ux/agents/openai.yaml 陈旧 prompt

**文件**:`/Users/dk/Documents/code/wego-design-system/.codex/skills/wego-ux/agents/openai.yaml`
**改什么**:第 4 行 `default_prompt`。
**为什么**:仍写 "Next.js App Router structure for Vercel",与 SKILL.md 矛盾。
**怎么改**:
`"Use $wego-ux to turn page_spec and design_consumption_plan into a task-folder prototype project with the standard static multi-page HTML/CSS/JS structure for browser and mobile preview."`

### 改动 5:递增 metadata.json 版本

**文件**:`/Users/dk/Documents/code/wego-design-system/.codex/skills/wego-design/metadata.json`
**改什么**:`version` 262 → 263。
**为什么**:AGENTS.md 方向性调整 + library-consumption.json 契约字段修正属于正式迭代,按 AGENTS.md 规定递增版本。

## 假设与决策

1. **AGENTS.md 保留中文沟通要求**:用户 profile 偏好中文,且仓库面向微购中文场景,不改为英文。
2. **不删除 `buildDeployableProject` 场景键名**:只修正其内容,避免潜在引用断裂;键名改为静态多页面语义。
3. **不改动 wego-ux/SKILL.md**:它已是当前事实来源(静态 HTML),无需改。
4. **不改动 .gitignore**:`.trae/documents/` 历史计划是否纳入 gitignore 留待用户决定,本轮只在风险中提示。
5. **AGENTS.md 的"读取顺序""变更同步矩阵""质量门禁"等操作规则保留**:这些是稳定硬约束,只是从开篇移到中段,不删减内容。

## 验证步骤

1. **AGENTS.md 可读性**:改后通读,确认新 agent 只看此文件即可理解"收到需求 → 走 4 段 → 出原型"的完整路径。
2. **JSON 合法性**:执行 `python3 -c "import json; json.load(open('.codex/skills/wego-design/library-consumption.json'))"` 确认改动后 JSON 仍合法。
3. **一致性扫描**:改后执行 Grep `Next\.js|Vercel|deployable-project|npm 包元信息|构建配置`,确认仓库内不再残留(除 `docs/参考trae/` 和历史 plan 文档外)。
4. **YAML 合法性**:确认 `wego-ux/agents/openai.yaml` 仍为合法 YAML。
5. **版本递增**:确认 `metadata.json` version 已递增到 263。
6. **守门脚本**:执行 `node scripts/validate-wego-design.mjs` 确认设计系统守门仍通过。

## 风险提示

- `.trae/documents/` 下 15 份历史计划文档未纳入 `.gitignore`,会随仓库一起被复制。建议后续单独清理或加入 gitignore,但不在本轮范围。
- `library-consumption.json` 的 `buildDeployableProject` 键名保留但语义已变,若有外部脚本按字符串"deployable-project"做分派需同步检查(当前仓库内未见此类分派)。
- AGENTS.md 结构调整较大,其他技能 SKILL.md 内若有"详见 AGENTS.md 某章节"的引用,需在实施时顺带核对(当前未见此类硬引用)。
