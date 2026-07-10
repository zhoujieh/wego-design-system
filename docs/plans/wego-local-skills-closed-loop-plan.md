# wego本地技能闭环与旧路径清理计划

> 历史归档文档（已停止维护，不参与当前技能自动触发判断）：本计划记录了把早期技能链路迁到 `.codex/skills/` 并清理旧路径的过程，相关迁移已完成，当前以 `AGENTS.md`、`.codex/skills/README.md` 与各 `SKILL.md` 为权威来源。
>
> 下列说法都已经过时，仅保留作历史背景，不应再被 agent 当作现行规则：
> - “仓库统一采用 4 个本地技能闭环”
> - “最终产物必须是任务级项目文件夹”
> - “默认原型骨架为 Next.js App Router”
> - 任何与当前 `wego-app/` 静态 App 主链路冲突的旧描述

## Summary

以下内容是历史迁移阶段的旧方案摘要，已过时：

1. `wego-product`
   负责需求理解、任务分类、页面规格定义
2. `wego-design`
   负责设计系统消费，判断 UI Kit、组件、布局范式、规范引用
3. `wego-ux`
   负责正式输出产品原型，并生成标准化前端项目结构
4. `wego-tests`
   负责对最终原型做结果验收，形成闭环

其中：

- 正式输出产品原型的环节固定为 `wego-ux`
- 历史方案曾要求最终产物落到任务级目录，这条现已被 `wego-app/` 静态 App 主链路替代
- 历史方案曾要求同一任务复用原有任务文件夹，这条现已被场景目录复用规则替代
- 规范正文只保留在 `wego-design/specs/*.md`
- 其他技能只维护引用关系、输出结构和适用边界

## 已落地的关键决策

### 技能闭环

- `wego-product` 输出 `page_spec`
- `wego-design` 输出 `design_consumption_plan`
- `wego-ux` 输出产品原型项目
- `wego-tests` 输出 `acceptance_report`

### 设计系统路径

当前真实设计库位于：

- `.codex/skills/wego-design/`

旧目录不再作为执行链路权威路径。

### 原型输出

- 历史方案曾以 Next.js 为默认原型骨架
- 目标是可部署到 Vercel、可在手机浏览器独立预览
- 历史方案曾要求原型落在项目根目录的任务级文件夹中
- 历史方案曾要求同任务迭代复用既有文件夹

### 业务规则配置 UI Kit

- `biz-settings` 已升级为 `biz-rule-config`
- 语义固定为业务规则配置 / 业务数据编辑
- 与 `system-setting` 区分
- 示例中的页面级主操作统一收口，不在内容区和底部重复堆叠

## 本次全局清理范围

### 仓库入口文档

- `AGENTS.md`
- 根 `README.md`

处理目标：

- 同步四技能闭环
- 同步真实路径到 `.codex/skills/wego-design/`
- 更新读取顺序、原型产出与任务文件夹规则

### 设计系统本体

- `.codex/skills/wego-design/SKILL.md`
- `.codex/skills/wego-design/README.md`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/uikit-plan.json`
- `.codex/skills/wego-design/components/index.json`
- `.codex/skills/wego-design/ui_kits/*`
- `.codex/skills/wego-design/metadata.json`

处理目标：

- 把 `biz-settings` 升级为 `biz-rule-config`
- 统一消费语义
- 清理旧路径说明
- 明确当前 skill 根就是 `wego-design`

### 组件迭代技能

- `.codex/skills/iterate-component/SKILL.md`
- `.codex/skills/iterate-component/references/workflow.md`
- `.codex/skills/iterate-component/references/sync-matrix.md`
- `.codex/skills/iterate-component/references/button-example.md`
- `.codex/skills/iterate-component/agents/openai.yaml`

处理目标：

- 全部改到 `wego-design` 真实路径
- 提取脚本命令改为新的 skill 根路径
- 读取顺序与修改路径指向当前真实库位置

### 守门脚本

- `scripts/validate-wego-design.mjs`

处理目标：

- 默认根路径改到 `.codex/skills/wego-design`
- 报错提示中的脚本路径同步改掉
- 守门文案和预期 `library` 标识改为 `wego-design`

### 历史审查文档

- `docs/wegoux-trae-architecture-audit-plan.md`

处理方式：

- 保留历史命名
- 加注释说明这是历史比对文档
- 不再把其中的旧路径当现行权威路径

## 验证要求

### MVP 验证任务

只用一个场景验证闭环：

- 微购相册多仓配货规则设置页

### 验证顺序

1. `wego-product`
   - 输出 `page_spec`
   - 场景必须命中 `biz-rule-config`
2. `wego-design`
   - 输出 `design_consumption_plan`
   - 必须命中 `biz-rule-config`
   - 必须说明导航、布局、交互、组件和规范引用
3. `wego-ux`
   - 输出原型项目
   - 历史方案要求其为 Next.js 项目
   - 历史方案要求其位于任务级文件夹
   - 历史方案要求同任务迭代复用原文件夹
   - 必须能部署到 Vercel
   - 必须可在手机上预览
4. `wego-tests`
   - 输出 `acceptance_report`
   - 必须检查需求承接、设计消费、原型结构、部署可用性和任务文件夹约束

### 静态复查

活文件范围内必须满足：

- 不再命中旧权威路径
- 不再命中 `biz-settings`
- `iterate-component` 不再引用旧目录结构
- 守门脚本默认根路径指向 `.codex/skills/wego-design`
- 根入口文档读取顺序与真实目录一致

## Assumptions

- 以下假设属于历史迁移阶段，不是现行规则
- 早期方案曾按四段技能管理，后续已补入 `wego-uxsystem-iterate`
- 输出结构定义直接写在各自技能的 `SKILL.md` 中，不额外拆独立 contract 文件
- 早期方案曾默认 `wego-ux` 采用 Next.js 骨架
- 早期方案曾以项目根目录任务文件夹管理原型
- 规范正文唯一事实来源保留在 `wego-design/specs/*.md`
