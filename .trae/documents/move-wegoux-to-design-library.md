# 将 wegoux 移入 .design_library 计划

## 概述

将 `wegoux/` 设计系统整体迁入 `.design_library/wegoux/`，使 TRAE 能够自动识别并读取项目内的设计系统。保留原有内部目录结构，同步修复所有外部引用路径。

## 当前状态分析

- **源位置**：`/Users/baobei/CODE/wego-design-system/wegoux/`
- **目标位置**：`/Users/baobei/CODE/wego-design-system/.design_library/wegoux/`
- **内部结构**：wegoux 内部全部使用相对路径（`../colors_and_type.css`、`../../components.css` 等），内部移动后无需修改
- **全局设计库已有旧副本**：`~/.trae-cn/design_libraries/O0AA1DR-DGOQCS/`（version 117，远落后于 workspace 的 version 191）
- **`.gitignore`**：当前仅排除 `.DS_Store`、`.uploads/`，无需添加 `.design_library/`
- **`metadata.json` id 冲突**：项目内 `.design_library/wegoux/` 与全局 `O0AA1DR-DGOQCS/` 共用相同 id，但 TRAE 优先读取项目内 `.design_library/`，冲突风险低

## 变更清单

### Step 1：创建 `.design_library/` 并复制 wegoux

- `mkdir -p .design_library`
- `cp -r wegoux/ .design_library/wegoux/`
- 内部 19 个组件 JSON、17 个预览页 HTML、2 个 UI Kit、`colors_and_type.css`、`css.json`、`components.css`、`iconfont.css`、`scaffold.css`、`typography.css`、`scripts/`、`specs/`、`assets/` 全部保留原样

### Step 2：修复 `AGENTS.md`

更新所有 `wegoux/xxx` 路径为 `.design_library/wegoux/xxx`（共约 12 处）：

| 原文 | 修改为 |
|------|--------|
| `wegoux/SKILL.md` | `.design_library/wegoux/SKILL.md` |
| `wegoux/README.md` | `.design_library/wegoux/README.md` |
| `wegoux/library-consumption.json` | `.design_library/wegoux/library-consumption.json` |
| `wegoux/uikit-plan.json` | `.design_library/wegoux/uikit-plan.json` |
| `wegoux/colors_and_type.css` | `.design_library/wegoux/colors_and_type.css` |
| `wegoux/css.json` | `.design_library/wegoux/css.json` |
| `wegoux/components/index.json` | `.design_library/wegoux/components/index.json` |
| `wegoux/ui_kits/app/index.html` | `.design_library/wegoux/ui_kits/app/index.html` |
| `wegoux/iconfont.css` | `.design_library/wegoux/iconfont.css` |
| `wegoux/specs/*/*.md` | `.design_library/wegoux/specs/*/*.md` |
| `wegoux/metadata.json` | `.design_library/wegoux/metadata.json` |

「wegoux」作为设计系统名称出现的位置（如「先理解 wegoux 设计系统」「不把 wegoux 改成 TRAE」）保持不变。

### Step 3：修复 `scripts/validate-wegoux.mjs`

| 行号 | 变更 |
|------|------|
| 30 | `'wegoux'` → `'.design_library/wegoux'`（默认 libraryRoot） |
| 710 | `wegoux/scripts/extract-components-css.mjs` → `.design_library/wegoux/scripts/extract-components-css.mjs` |

其余「wegoux」为设计系统名称或错误消息中的标识，保持不变。

### Step 4：修复 `.design_library/wegoux/README.md`

文件清单根路径从 `wegoux/` 更新为 `.design_library/wegoux/`：
- 第 162 行：`wegoux/` → `.design_library/wegoux/`

### Step 5：修复 `wegoux-trae-architecture-audit-plan.md`

更新文档中涉及 `wegoux/` 路径的引用（约 4 处），使其指向 `.design_library/wegoux/`。

### Step 6：更新 `metadata.json` 版本号

`.design_library/wegoux/metadata.json` 的 `version` 从 `191` 递增到 `192`（符合 AGENTS.md 正式迭代规则）。

### Step 7：删除旧 `wegoux/` 目录

验证 `.design_library/wegoux/` 完整后，删除原始 `wegoux/` 目录。

### Step 8：验证

- 运行 `node scripts/extract-components-css.mjs .design_library/wegoux` 确认 CSS 生成正常
- 运行 `node scripts/validate-wegoux.mjs --scope=full` 确认无错误
- 抽查一个预览页 HTML 确认 `../colors_and_type.css` 等相对路径仍然有效
- 确认 `.design_library/wegoux/metadata.json` 可被正确解析

## 假设与决策

- 不移除旧 `wegoux/` 中的内容——直接整体搬迁，避免遗漏
- 不修改 `metadata.json` 的 `id` 字段——项目内 `.design_library/` 具有更高优先级，TRAE 不会混淆
- 不修改 `.gitignore`——`.design_library/` 应被 Git 跟踪以便团队共享
- `AGENTS.md` 中作为设计系统「名称」的 `wegoux`（非路径前缀）保持不变

## 不涉及的文件

- `参考trae/` — 独立于 wegoux，无需修改
- `.trae/documents/*.md` — 历史计划文档，无需同步更新
- `参考trae/` 下的 `css.json` 和 `metadata.json` — 对应 TRAE 内置库，不涉及
- 全局 `~/.trae-cn/design_libraries/O0AA1DR-DGOQCS/` — 旧副本，不需要操作
