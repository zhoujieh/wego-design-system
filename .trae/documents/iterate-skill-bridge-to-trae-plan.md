# 桥接 iterate-component Skill 到 .trae/ —— 实施计划

## 需求

把 `.codex/skills/iterate-component/` 以符号链接方式桥接到 `.trae/skills/iterate-component/`，使 Trae 将其识别为项目级技能。后续只需修改 `.codex/` 源文件，Trae 侧自动同步。

## 变更范围

- `.trae/skills/iterate-component/` — 新建目录 + 2 个符号链接
- `wegoux/SKILL.md` — 第 114、208 行引用路径更新
- 不复制/不修改 `.codex/` 下任何文件

---

## 现状

- Trae 项目级技能发现规则：`.trae/skills/<name>/SKILL.md`，YAML frontmatter（name + description）+ markdown body
- Codex SKILL.md 已有兼容的 YAML frontmatter（`name: "iterate-component"`、`description`），无需改造内容
- Codex `agents/openai.yaml` 是 Codex 专属配置，不参与桥接
- `wegoux/SKILL.md` 第 114、208 行引用 `.codex/skills/iterate-component/`

---

## 拟议变更

### 1. 建立目录级符号链接（一个命令搞定）

```bash
cd .trae/skills
ln -s ../../.codex/skills/iterate-component iterate-component
```

### 2. 更新 wegoux/SKILL.md 引用

- **第 114 行**：`.codex/skills/iterate-component/SKILL.md` → `.trae/skills/iterate-component/SKILL.md`
- **第 208 行**：`.codex/skills/iterate-component/` → `.trae/skills/iterate-component/`

### 3. 最终目录结构（已实施）

```
.trae/
├── skills/
│   └── iterate-component -> ../../.codex/skills/iterate-component   (目录级符号链接)
│       ├── SKILL.md
│       ├── agents/            (Trae 忽略此目录)
│       └── references/
│           ├── workflow.md
│           ├── sync-matrix.md
│           └── button-example.md
└── documents/
```

---

## 备选方案

如果 Trae 不支持目录级符号链接（references/），改为逐个文件链接：

```bash
mkdir -p .trae/skills/iterate-component/references
cd .trae/skills/iterate-component/references
ln -s ../../../../.codex/skills/iterate-component/references/workflow.md workflow.md
ln -s ../../../../.codex/skills/iterate-component/references/sync-matrix.md sync-matrix.md
ln -s ../../../../.codex/skills/iterate-component/references/button-example.md button-example.md
```

---

## 假设与决策

1. **符号链接用相对路径**：`../../../.codex/...`，不依赖绝对路径，跨环境可移植
2. **不链接 `agents/`**：`openai.yaml` 是 Codex 专属配置，泄露到 Trae 无意义
3. **Git 原生追踪符号链接**：macOS Git 会存符号链接本身而非目标内容，这正是期望行为
4. **不递增版本号**：属于仓库管理类变更

---

## 验证步骤

1. `ls -la .trae/skills/iterate-component/` 确认符号链接指向正确
2. `head -5 .trae/skills/iterate-component/SKILL.md` 确认可读
3. `ls .trae/skills/iterate-component/references/` 确认 references 文件可达
4. `grep -rn "codex/skills/iterate-component" wegoux/` 确认引用已全部更新
5. 在 Trae 中测试 `iterate-component` skill 是否被正确识别和加载

---

## 实施顺序

1. 创建目录 + 符号链接
2. 更新 `wegoux/SKILL.md` 引用
3. grep 验证无遗漏 `.codex/` 引用
4. Git 提交
