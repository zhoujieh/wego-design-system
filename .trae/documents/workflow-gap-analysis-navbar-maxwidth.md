# 工作流纰漏分析:navbar 背景色 & 页面 max-width 768(修订版)

## 一、结论先行(修订)

| 问题 | 根因归属 | 性质 |
|------|---------|------|
| navbar 缺少背景色 | **wego-design 规则缺陷**:navbar `backgroundRule` 错误地声明为"透明",非深色场景应显式设置与背景同色 | 设计系统规则错误 |
| 页面缺少 max-width 768 | **wego-design 缺失规则** + **wego-ux 规则错误**:设计系统未定义页面外层容器 max-width: 768px,wego-ux 模板错误使用 670px | 规则缺失 + 数值错误 |

**核心判断**:这不是"消费时漏了规则",而是**设计系统规则本身有缺陷/缺失**,且流水线四段都没有拦截这些缺陷:
- wego-design 的 navbar `backgroundRule` 写的是"透明",本身就是错的
- 768px 外层容器约束规则在设计系统中根本不存在
- wego-ux 模板用了错误的 670px
- wego-tests 对照着错误规则做验收,自然全过

---

## 二、设计系统规则缺陷定位

### 缺陷 1:navbar 背景色规则——错误声明为"透明"

**用户明确要求**:导航栏不能设置透明,除非深色场景;非深色场景必须显式设置与背景色相同的颜色。

**设计系统现状(错误)**:

| 文件 | 行号 | 错误内容 |
|------|------|---------|
| [navbar.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/navbar.json) | 130 | `backgroundRule`: "导航栏背景**透明**,透出父容器/页面背景色" |
| [navbar.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/navbar.json) | 144 | usageHints: "导航栏背景自动跟随页面背景色,**不需要单独设置背景色**" |
| [components.css](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components.css) | 660 | `.navbar { width: 375px; background: transparent; flex-shrink: 0; }` |
| [components.css](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components.css) | 656-658 | 注释:"导航栏背景**透明**,透出父容器/页面背景色" |
| [布局与间距规范.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/specs/布局与间距规范.md) | 22-23 | "导航栏背景色跟随页面背景色联动" |
| [布局与间距规范.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/specs/布局与间距规范.md) | 31 | "导航栏背景色自动跟随页面背景色,**不需要单独设置**" |
| [wego-ux/page-shell.html](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-ux/templates/page-shell.html) | 14 | "navbar 自带 **transparent** 背景,不需要额外 padding-top" |

**应该是什么**:非深色场景下,navbar 必须显式设置 `background: var(--bg-page)` 或 `var(--bg-surface)`(与页面 `data-bg` 声明的背景色一致),不能用 `transparent`。

**为什么 transparent 是错的**:
- sticky 定位 + transparent 背景在滚动时会出现内容穿透、视觉错位
- 模态层覆盖时,transparent navbar 会让底层内容透出
- 显式背景色才能保证 navbar 作为独立视觉层的稳定性

### 缺陷 2:navbar width: 375px 泄漏到生产组件库

[components.css](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components.css) 第 660 行:`.navbar { width: 375px; ... }`

**用户明确要求**:页面内容必须宽度 100%,不要固定写死宽度。

**问题**:`width: 375px` 是预览用的固定宽度,却写在了生产组件库 `components.css` 里(不是 `scaffold.css`)。[navbar.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/navbar.json) 第 145 行虽然用 usageHints 提醒"真实页面中必须覆盖为 width: 100%",但:
- usageHints 是软提示,不是硬约束
- 把预览值写进生产 CSS 本身就是设计错误——预览值应该只存在于 `scaffold.css` 或 `preview/*.html` 的 scoped 样式中
- 项目实际结果:入口页 navbar 漏了覆盖,继承了 375px(见 [index.html](file:///Users/baobei/CODE/wego-design-system/multi-warehouse-rule-config/index.html) 第 15-23 行)

### 缺陷 3:768px 外层容器 max-width 规则缺失

**用户明确要求**:外层容器要约束最大宽度 768px,内容 100% 宽度。

**设计系统现状**:

| 检查项 | 结果 |
|--------|------|
| wego-design 中是否有 768px 规则 | ❌ 不存在(grep `768` 仅命中 iconfont 码点) |
| wego-design 中是否有页面级 max-width 规则 | ❌ 不存在(只有组件级宽度,如 navbar 预览 375px) |
| wego-ux 中的 max-width 规则 | ❌ 错误:[page.css](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-ux/templates/page.css) 第 31 行 `max-width: 670px` |
| wego-ux SKILL.md 中的描述 | ❌ 错误:第 83 行"默认业务页 670px" |
| wego-ux page-shell.html 中的注释 | ❌ 错误:第 10 行"默认 670px" |

**应该是什么**:
- wego-design 的 `specs/布局与间距规范.md` 应增加"页面外层容器"章节,定义 `max-width: 768px`
- wego-ux 模板 `page.css` 应改为 `max-width: 768px`
- 约束应放在外层容器(不一定是 body),内容区域宽度 100%

---

## 三、工作流纰漏逐层归因(修订)

### 纰漏 1:wego-design——规则缺陷 + 规则缺失(根因)

**这是问题的源头。** wego-design 作为设计系统本体,存在三处规则问题:

1. **navbar backgroundRule 错误**:7 个位置一致地把"透明"写成规则,从规范正文到组件契约到 CSS 实现全链条错误。这不是某个人消费时漏了,而是**规则本身就是错的**
2. **navbar width: 375px 放错了文件**:预览值写进了生产 components.css,靠 usageHints 软提示弥补,不够
3. **768px 页面宽度规则完全缺失**:wego-design 没有定义页面级宽度约束,把这件事完全甩给了 wego-ux,而 wego-ux 用了错误的 670px

### 纰漏 2:design_consumption_plan 未落盘(wego-design 阶段)

**硬约束要求**:[wego-design/SKILL.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/SKILL.md) 第 102-111 行明确要求落盘到 `{task-folder}/_spec/design_consumption_plan.json`。

**实际**:`_spec/` 目录不存在(Glob 确认)。

**影响**:即使消费阶段发现了 navbar 透明规则有问题,也没有任何文件记录这个决策或标记这个风险。`implementation_constraints` 字段丢失,navbar 宽度覆盖、页面宽度约束这些关键实现约束全部没有显式记录。

### 纰漏 3:wego-ux——盲目信任设计系统规则,未做二次校验

**问题**:
- wego-ux [SKILL.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-ux/SKILL.md) 第 12-17 行要求"找不到 page_spec 和 design_consumption_plan 时不进入原型生成",但实际在文件缺失的情况下直接生成了原型
- wego-ux 模板 [page.css](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-ux/templates/page.css) 第 31 行自带了错误的 `max-width: 670px`,这个值从模板直接复制到了项目
- wego-ux 模板 [page-shell.html](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-ux/templates/page-shell.html) 第 14 行注释"navbar 自带 transparent 背景",引导消费者不加背景色
- wego-ux 把 navbar `width: 375px` 的覆盖责任甩给项目 page.css,但模板里没有预置 `.navbar { width: 100%; }` 的默认覆盖

### 纰漏 4:wego-tests——对照错误规则验收,全绿通过

**问题**:
- [acceptance_report.md](file:///Users/baobei/CODE/wego-design-system/multi-warehouse-rule-config/acceptance_report.md) 第 38 行:"背景:透明,跟随页面背景联动(未硬编码)"——把错误的 transparent 当成正确规则来验收
- 第 73 行:"navbar 背景透明联动 ✓ 未硬编码,透出父容器背景"——同上
- 验收时 `_spec/` 目录不存在,无法对照 page_spec 和 design_consumption_plan,但四个阶段全标 ✓
- [wego-tests/SKILL.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-tests/SKILL.md) 要求"运行守门脚本",但守门脚本 `validate-wego-design.mjs` 校验的是"组件三向对齐、Token 同步"等结构性问题,不校验"navbar 背景规则是否合理""页面宽度数值是否正确"这类语义问题

---

## 四、问题归因总结(修订)

### 问题 1:navbar 缺少背景色

**不是消费漏了规则,是规则本身错了。**

- wego-design 的 navbar `backgroundRule` 在 7 个位置一致声明"透明",这是设计系统层面的规则缺陷
- wego-ux 模板 page-shell.html 注释引导"navbar 自带 transparent 背景"
- 项目按规则实现了 transparent,验收按规则确认了 transparent
- **整条流水线都在正确执行一条错误的规则**

### 问题 2:页面缺少 max-width 768

**不是消费漏了 768 规则,是设计系统根本没有这条规则,而 wego-ux 用了错误的 670px。**

- wego-design 没有定义页面级 max-width(只定义组件级宽度)
- wego-ux 模板自带的 670px 是错误值(来源不明,无设计依据)
- 项目从模板复制了 670px,验收未质疑数值来源
- **规则缺失 + 模板数值错误 + 验收不校验语义 = 错误传播到产物**

---

## 五、流水线断裂链路图

```
wego-design (规则源头)
  ├─ navbar backgroundRule = "透明" ← 错误规则
  ├─ navbar width: 375px in components.css ← 预览值泄漏到生产
  └─ 页面 max-width: 768px ← 规则缺失
        │
        ▼ (规则有缺陷/缺失,但下游不知道)
wego-design (消费阶段)
  ├─ design_consumption_plan 未落盘 ← 无法审计是否发现规则问题
  └─ implementation_constraints 丢失 ← navbar 宽度覆盖、页面宽度约束未记录
        │
        ▼ (无消费清单可读,凭记忆消费)
wego-ux (原型生成)
  ├─ 跳过前置文件检查,直接生成
  ├─ 从模板复制了错误的 max-width: 670px
  ├─ 模板注释引导"navbar transparent 不用加背景"
  └─ 入口页 navbar 漏了 width: 375px → 100% 的覆盖
        │
        ▼ (对照错误规则验收)
wego-tests (验收)
  ├─ _spec/ 不存在,无法对照 page_spec / design_consumption_plan
  ├─ 把 transparent navbar 当正确规则验收 ✓
  ├─ 未质疑 670px 数值来源
  └─ 守门脚本只校验结构,不校验语义
        │
        ▼
  产物:navbar 无显式背景 + 页面 670px 而非 768px
```

---

## 六、执行计划(用户确认范围)

**本次执行范围**:P0 修复(wego-design 规则缺陷 + wego-ux 模板错误)。P1 流水线拦截暂不做。

**执行方式**:设计系统内容(navbar.json、components.css、specs/*.md)的修改通过 `iterate-component` 技能完成;wego-ux 模板修改直接编辑。

### 步骤 1:调用 iterate-component 技能修复 navbar 组件(设计系统本体)

通过 iterate-component 技能完成以下 navbar 组件迭代,需同步更新组件契约、CSS、preview、规范正文,并递增 metadata.json version:

| 修复项 | 文件 | 内容 |
|--------|------|------|
| 修正 navbar backgroundRule | [navbar.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/navbar.json) 第 130 行 | 改为"非深色场景必须显式设置与页面背景色相同的背景色;深色场景可用 transparent" |
| 修正 navbar usageHints | [navbar.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components/navbar.json) 第 144 行 | 删除"不需要单独设置背景色",改为"必须显式设置与页面 data-bg 声明的背景色一致" |
| 修正 navbar CSS 背景 | [components.css](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components.css) 第 660 行 | `background: transparent` → 通过 `[data-bg="page"] .navbar { background: var(--bg-page); }` 等选择器映射,或直接 `background: var(--bg-page)` |
| 修正 navbar CSS 宽度 | [components.css](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components.css) 第 660 行 | 删除 `width: 375px`,改为 `width: 100%`;预览用的 375px 只保留在 scaffold.css |
| 修正 components.css 注释 | [components.css](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/components.css) 第 656-658 行 | 删除"透明"描述,改为"显式设置与页面背景色一致" |
| 修正规范正文 | [布局与间距规范.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/specs/布局与间距规范.md) 第 22-23、31 行 | 删除"不需要单独设置",改为"必须显式设置与页面背景色一致" |
| 新增 768px 规则 | [布局与间距规范.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/specs/布局与间距规范.md) | 增加"页面外层容器"章节:`max-width: 768px; margin-inline: auto;` 内容 width: 100% |
| 同步 preview/component-navbar.html | [preview/component-navbar.html](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/preview/component-navbar.html) | 如有 transparent 引导需同步修正 |
| 递增 metadata.json version | [metadata.json](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-design/metadata.json) | 按本轮变更递增 version |

### 步骤 2:修复 wego-ux 模板(直接编辑)

| 修复项 | 文件 | 内容 |
|--------|------|------|
| 修正 max-width | [wego-ux/templates/page.css](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-ux/templates/page.css) 第 29-33 行 | `670px` → `768px`,注释同步 |
| 修正 SKILL.md | [wego-ux/SKILL.md](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-ux/SKILL.md) 第 83 行 | `670px` → `768px` |
| 修正 page-shell.html | [wego-ux/templates/page-shell.html](file:///Users/baobei/CODE/wego-design-system/.codex/skills/wego-ux/templates/page-shell.html) 第 10、14 行 | 第 10 行 `670px` → `768px`;第 14 行删除"navbar 自带 transparent 背景",改为"navbar 已有显式背景色" |

### 步骤 3:运行守门脚本验证

```bash
node scripts/validate-wego-design.mjs
```

确认:JSON 格式、Token 同步、组件三向对齐、components.css 完整性、UI Kit 成对、过期路径、禁止文件、metadata version 全部通过。

### 不在本次范围

- P1 流水线拦截(_spec/ 落盘、wego-ux 前置校验、wego-tests 必查项、守门脚本语义校验)——用户明确暂不做
- multi-warehouse-rule-config 项目代码——用户明确不改项目代码

---

## 七、验证方式

本分析为只读诊断,不涉及代码改动。验证方式:

1. 确认 navbar transparent 规则链:读取上述 7 个文件位置,确认全部声明为"透明"
2. 确认 768px 缺失:全仓库 grep `768` 仅命中 iconfont 码点 `\e768`
3. 确认 670px 错误来源:wego-ux/templates/page.css 第 31 行
4. 确认 _spec/ 不存在:`ls multi-warehouse-rule-config/_spec/`(应报错)
5. 确认入口页 navbar 未覆盖宽度:[index.html](file:///Users/baobei/CODE/wego-design-system/multi-warehouse-rule-config/index.html) 第 15-23 行在 [page.css](file:///Users/baobei/CODE/wego-design-system/multi-warehouse-rule-config/css/page.css) 中无对应 width 覆盖
