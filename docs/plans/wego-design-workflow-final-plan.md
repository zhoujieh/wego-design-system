# wego 设计工作流最终重构方案

> 目标：对齐 Trae Solo Design 中可迁移的设计库消费、约束下发与质量闭环能力。微购保留自己的静态 App 宿主和中文移动端设计语言；不引入 Trae Canvas、`.design` 文件、图片生成或 Trae 专属子代理运行时。

## 1. 重构边界与唯一版本

### 1.1 新链路

```text
wego-product → wego-design → wego-uxsystem-iterate（仅设计系统迭代与 DDR 审查）
```

- `wego-design` 合并原 `wego-design + wego-ux`：在一次任务中完成设计系统消费、场景实现、路由接入、状态交互、守卫和决策提取。
- 删除 `wego-tests`：其 Token/Class 检查、契约一致性、场景路由和交互检查由可执行守卫承担；视觉和状态验收进入 `wego-design` 完成门禁。
- 删除 `wego-ux`：其场景实现职责并入 `wego-design`。
- `wego-uxsystem-iterate` 不实现普通业务场景，只维护设计系统、组件/UI Kit 守门和 DDR 收敛。

### 1.2 本次硬规则

- 不保留兼容层、旧字段回退、旧命令别名、旧五技能引用或双写路径。
- 新旧 Schema 不并存；发现旧场景或旧规格时明确报错并迁移。
- 业务场景继续使用唯一宿主 `wego-app/index.html`、`hash route` 与 `window.WegoApp.registerScene`；不得复制第二套宿主。
- 场景目录继续使用 `wego-app/scenes/{中文业务场景}/`；稳定 `route_id` 仅作为路由键，不得用作场景目录名。
- 场景模板在 `scene.js` 中注册，业务样式在 `scene.css` 中维护；不新增 `scenes/{route_id}/index.html` 或 `style.css` 的并行产物模型。

## 2. 移除自动生成 specs 体系（前置）

设计系统技能、组件契约和运行时只消费唯一权威来源，不再生成或读取 `specs/*.md` 规则投影。

### 2.1 删除范围

- 删除 `scripts/specs.mjs`、`scripts/specs-core.mjs` 及其测试、检查、source manifest 和调用方。
- 删除 `docs/specs/` 与 `.codex/skills/wego-design/specs/` 的所有生成产物。
- 清除 `AGENTS.md`、各技能、验证器、同步矩阵和 README 中的 `specs generate/check/test` 规则。
- 删除组件契约中全部 `specRefs: ["specs/..."]`；不得以另一个生成文档替代。

### 2.2 规则归位

| 规则类别 | 唯一权威来源 |
| --- | --- |
| Token 名称与取值 | `colors_and_type.css`、`css.json` |
| 组件 DOM、变体、状态、边界 | `components/{slug}.json` 与对应 Preview |
| 组件部署样式 | 从 Preview 提取的 `components.css` |
| 页面范式、组合与 presentation | `uikit-plan.json` 与 `ui_kits/*/index.html` |
| 设计库读取与宿主边界 | `library-consumption.json` |
| 技能入口、输入输出与门禁 | 对应 `SKILL.md` 和直接引用的 references |
| 可自动判断的问题 | `scripts/*.mjs` |

组件契约若需要追溯规则，只允许使用可解析的 `ruleRefs`：指向上述权威文件的稳定定位符。外部来源只能放入 `provenance.externalSources[]`，必须含名称以及 URL、版本或真实存在的 `sourceFile`；本地 `sourceFile` 用于已随仓库保存的外部原始资料，守卫必须验证其存在。`components/search.json` 的 `docs/kuikly_components/Search.md` 是这种可验证来源，不得误判为缺失。

## 3. Solo 对标后保留的核心机制

### 3.1 页面级约束合同

每个 surface 在生成前必须形成并直接消费 `prompt_contract`，不得只把下游指向某个文件路径。

```yaml
prompt_contract:
  design_system_snapshot:
    version: "{metadata.version}"
    token_css: "colors_and_type.css"
    component_css: "components.css"
    component_inputs: []
  token_whitelist: []
  token_bindings: []
  component_bindings: []
  layout_contract:
    source: "uikit-plan.json#/pagePatterns"
    rules: []
    mutable_regions: []
  interaction_contract: []
  state_contract: []
  hard_rules: []
```

- `token_whitelist` 仅包含该场景可用的实际 `var(--token)` 名称。
- `token_bindings` 必须声明内容角色、CSS 属性、实际 Token 和权威来源。
- `component_bindings` 必须声明组件 slug、命中原因、Preview 路径、契约路径、实际根 class、必需结构、允许 modifier 与所用变体维度。
- 禁止凭语义猜 CSS 变量、组件 class、子元素 class 或 modifier。

### 3.2 Preview-first 组件消费

组件消费顺序固定为：

```text
library-consumption.json
→ uikit-plan.json（选出本页 componentPlan）
→ components/index.json
→ preview/component-{slug}.html
→ components/{slug}.json
→ colors_and_type.css / css.json（按需核实）
```

- Preview 是实际 DOM、class、Token、间距和状态展示的实现主依据。
- 契约是变体、语义、行为、可访问性和边界的补充依据。
- 每页只选择实际使用的组件；不得把全量组件索引或泛化规则交给场景生成。
- 命中组件已有稳定结构时，禁止重新发明等价业务组件。

### 3.3 场景运行时合同

新建场景必须同时更新：

```text
wego-app/js/routes.js
wego-app/scenes/{中文业务场景}/scene.js
wego-app/scenes/{中文业务场景}/scene.css
```

- 新建场景：注册新的 `route_id`、script、style 和 `registerScene`。
- 修改场景：稳定复用已有 `route_id`，不得重复注册或重画宿主。
- `scene.js` 中的 template 根节点必须带设计决策标注；`scene.css` 只写业务区域布局和业务作用域胶水，不覆盖正式组件内部样式。
- 交互必须有明确的触发元素、目标 route/overlay、状态变化、反馈和回退动作。

### 3.4 状态与视觉一致性

每个有视觉变化的交互必须进入 `state_contract`：初始状态、触发器、可见变化、空/加载/错误状态、回退动作和持久化策略。默认使用内存状态，只有需求明确时才持久化。

对比页或同一状态组的多个画面必须复用共享壳和不可变区域，只允许修改声明的 `mutable_regions`；不得因状态变化重写导航、间距、字号、组件语言或宿主壳。

## 4. 设计系统文件的重构清单

### 4.1 技能与工作流文件

| 文件 | 改动 |
| --- | --- |
| `.codex/skills/wego-design/SKILL.md` | 完整重写为合并后的场景技能：输入、Preview-first、prompt_contract、场景产物、DDR、守卫、修复边界和交接。移除 `design_plan → wego-ux`。 |
| `.codex/skills/wego-design/agents/openai.yaml` | 更新默认提示，使其指向新场景输出和守卫，不再要求 `design_plan`。 |
| `references/design-decisions.md` | 改为页面级 componentPlan、prompt_contract、状态合同和 DDR 判断方法；不再以旧 registry 或 gap 阻断场景交付。 |
| `references/design-plan.md` | 删除；其可执行信息迁移为 `design-decisions.json` Schema。 |
| `references/library-map.md` | 保留资产定位职责，更新为新场景运行时、守卫、DDR 和无 specs 架构。 |

### 4.2 `library-consumption.json`

该文件收敛为四类可机器消费信息：

1. 设计资源索引：Token、组件契约、Preview、UI Kit、图标和部署副本路径。
2. 页面消费规则：Preview-first、组件选择、实际 Token、禁止自造和 UI Kit 边界。
3. App 运行边界：唯一宿主、中文场景目录、route、scene.js/scene.css、资源同步。
4. 成熟场景注册表：只保留仍会被运行时消费的类型。

必须删除：

- 所有 `wego-ux`、`wego-tests`、旧五技能阶段和旧宿主模板路径。
- “gap 阻止进入 wego-ux”的规则，改为 DDR 旁路。
- 生成 `specs` 的读取、引用和说明。

必须新增：

- `componentPlan` 的字段定义与每页 3–6 个预选组件边界。
- `actualTokenNameReference` 的生成输入：只从 `colors_and_type.css` 的实际 CSS 自定义属性得到名称，`css.json` 仅用于理解 Token 结构。
- `componentContractKind`、`previewFile`、`contractFile`、`runtimeTokens`、`previewOnlyTokens` 的消费规则。
- `allowedComponents` 与 `components/index.json` 的一致性规则。当前 `popmenu` 已注册却不在 allowed 列表、`toast` 已允许却不在支持组件清单，必须统一。

### 4.3 `uikit-plan.json`

- `hostShell.managedBy`、`templateFiles`、选择规则和所有文字规则改为新 wego-design 与 `wego-app/`，删除 `../wego-ux/assets/templates/*`。
- `fallbackAndGap` 改为：无法覆盖时创建 DDR，选择最近似的正式结构继续生成；不得临时发明组件。
- 场景交付路径固定为 `routes.js + scene.js + scene.css`。
- `popmenu` 必须进入允许和支持组件清单；`toast` 明确为运行时反馈组件并进入相应清单。
- `.cell--indent` 必须与组件契约、Preview、`components.css`、UI Kit 和宿主逻辑统一；未统一前不得被 pagePattern 引用。
- UI Kit 的 `quality-report.json` 在规则修改后重新生成，必须记录当前设计系统版本、组件一致性检查结果和质量门禁；报告不再引用旧技能或生成 specs。

### 4.4 组件契约、Preview 与聚合 CSS

所有 26 个 `components/{slug}.json` 升级为新的唯一 Schema；不保留旧字段兼容。

新增或明确以下字段：

```yaml
provenance:
  preview: "preview/component-{slug}.html"
  cssSource: "preview/component-{slug}.html"
  externalSources: []
ruleRefs: []
runtimeTokens: []
localTokens: []
previewOnlyTokens: []
domAnatomy:
  root: ".component"
  requiredChildren: []
  alternatives: []
  modifierClasses: []
```

- `ruleRefs` 只能指向权威源；删除全部 `specRefs`。
- `runtimeTokens` 是组件 CSS 中来自 `colors_and_type.css` 的全局 Token；`localTokens` 是组件 CSS 自身声明的内部参数；`previewOnlyTokens` 仅允许 Preview 脚手架、展示容器或演示变量使用。
- 删除没有运行时消费者且与上述三分法不一致的 `tokensConsumed`；当前组件 Token 只能由 `runtimeTokens`、`localTokens`、`previewOnlyTokens` 表达。
- 删除以 `cssCustomProperties` 隐式开放业务覆盖的旧字段；`localTokens` 默认只服务组件内部参数，若未来需要可覆盖参数，必须先设计独立、可守卫的公开契约，不能以描述文字绕过场景 Token 白名单。
- 删除重复存放 CSS 取值的 `designTokens`；Token 名称和实际值只以 `colors_and_type.css` 为准，组件契约只记录已验证的使用范围。
- 不得把 Preview 全文 Token 机械写入运行时 Token。必须按 `@component-css-start/end` 与正式组件实例范围区分。
- `requiredChildren` 不得保存无法解析的复杂 CSS 字符串。input、search、counter、stack、tabs 等含替代结构的组件改用结构化 `alternatives`。
- 组件契约列出的 root、必需子节点、modifier 和运行时 Token 必须在 Preview 与 `components.css` 中可验证。
- `cell--indent` 是现有明确不一致项：要么补齐正式 CSS，要么从 cell 契约、Preview、UI Kit 和宿主动态 class 中一次性删除。
- `components.css` 是生成物，禁止直接编辑；修改 Preview 后运行提取脚本重新生成。
- `components/index.json` 只维护组件注册，必须与组件文件、Preview、`allowedComponents`、核心/支持组件清单一一对应；不得重复维护 UI Kit，UI Kit 唯一来源是 `uikit-plan.json`。

### 4.5 Preview、CSS、资源与生成脚本

| 范围 | 处理 |
| --- | --- |
| `preview/component-*.html` | 保留现有 marker；补齐组件根、运行时 Token 与 Preview 专属 Token 的可识别边界。 |
| `preview/index.html` | 当前与组件索引一致；后续改为由 `components/index.json` 校验或生成，防止手工目录漂移。 |
| `preview/popmenu-positioning.js`、`scaffold.css` | 仅 Preview/UI Kit 脚手架，保留，不得作为业务场景运行时规则。 |
| `colors_and_type.css`、`css.json`、`iconfont.css`、`assets/**` | 不因本次流程重构修改视觉内容；以 CSS `:root` 为实际变量名来源。 |
| `scripts/extract-components-css.mjs` | 保留 CSS 提取职责，不混入场景校验。 |
| `components.css` | 只由提取脚本生成；Preview/组件更新后重生成。 |

## 5. 新增守卫与完成门禁

### 5.1 组件与 UI Kit 守卫

新增 `scripts/validate-component-contract-parity.mjs`，由 `wego-uxsystem-iterate` 在新增或迭代组件、Preview、UI Kit 时强制执行。

检查项：

1. 组件索引、契约、Preview、聚合 CSS 是否一一存在。
2. 契约的 root、必需结构、替代结构、modifier 是否在 Preview 与 `components.css` 可达。
3. Preview 中组件范围的运行时 Token 是否全部列入 `runtimeTokens`，而展示专属 Token 是否显式列入 `previewOnlyTokens`。
4. `runtimeTokens` 是否都在 `colors_and_type.css` 定义。
5. `ruleRefs` 是否只指向权威来源；禁止 `specs/`、不存在的相对路径和旧技能路径。
6. `allowedComponents`、核心/支持组件、页面蓝图与组件索引是否一致。
7. UI Kit 是否只使用注册组件和允许的业务区域胶水，不引用旧宿主模板、生成 specs 或旧技能；质量报告必须与当前系统版本和质量门禁一致。

### 5.2 场景守卫

新增或扩展现有验证器，使场景目录为唯一输入：

```text
node scripts/validate-scene-contract.mjs wego-app/scenes/{中文业务场景}
```

必须同时解析 `scene.js` template 与 `scene.css`，检查：

- 未知或不在本场景 `prompt_contract.token_whitelist` 的 Token。
- 裸颜色、越权 Token、Preview/UI Kit 宿主 class、临时占位文案。
- `data-*` 设计决策标注、组件绑定和实际 DOM/Token 是否一致。
- route 是否存在、script/style 是否注册、`registerScene` 是否使用正确 route。
- 触发器、目标 route/overlay、状态合同和反馈是否完整。

新增 `extract-design-decisions.mjs` 时，输入也必须是场景目录，从 `scene.js + scene.css` 提取，不得假定存在独立 `index.html`。

### 5.3 视觉完成门禁

每个场景必须在固定移动端视口完成渲染检查，至少覆盖 375px 与 393px：

- 无横向溢出、重叠、裁切和按钮换行。
- 首屏信息层级、容器嵌套、操作列数、列表右操作和分隔策略通过拥挤检查。
- 状态变化不改变未声明的共享壳、导航、间距、字号或组件语言。

视觉检查结果写入 `design-decisions.json.generation_evidence.visualCheck`，与规则和交互守卫一起构成完成条件。

## 6. 设计决策、证据与 DDR

### 6.1 `design-decisions.json`

由场景目录自动提取，至少保存：

- `surface_id`、`route_id`、页面范式和 presentation。
- 完整 `prompt_contract` 与设计系统版本快照。
- 组件绑定、实际 class、Token 绑定、规则来源和读取过的 Preview/契约。
- `layout_contract`、`state_contract`、交互守卫、视觉检查、修复次数、源码哈希和生成证据。
- `crowdingCheck`、当前基线标识及可变范围。

任何场景源码变化都必须重新提取该文件；提取器写入源码哈希，旧文件不能以“纯文案替换”绕过一致性检查。

### 6.2 DDR

DDR 使用唯一状态机：

```text
open → extended → resolved | wontfix | escalated
```

- `extended` 最多两次；超过后变为 `escalated`。
- `resolved` 必须同时修改对应设计系统源、Preview、组件契约和守卫，不得只关单。
- DDR 只允许记录正式系统未覆盖的真实缺口；不能用 DDR 掩盖错误 class、错误 Token、缺路由或未读 Preview。
- `affected_iteration` 必须引用实际存在的业务迭代；不得使用孤立字符串模拟迭代生命周期。

## 7. `wego-uxsystem-iterate` 的新增长期约束

组件、Preview、UI Kit、Token 或消费契约发生任何新增/修改时，必须：

1. 先判定改动属于组件契约、Preview、Token、UI Kit、消费规则或场景实现；普通场景实现不进入本技能。
2. 修改唯一权威源；禁止直接改 `wego-app/lib/` 或 `components.css`。
3. 同步检查组件索引、允许列表、核心/支持组件、页面蓝图和 UI Kit 报告。
4. 运行 `extract-components-css.mjs` 和 `validate-component-contract-parity.mjs`。
5. 若影响运行时资源，运行同步脚本并验证 `wego-app/lib/` 一致。
6. 若规则变化影响业务场景，按影响范围运行场景合同、交互和视觉回归。
7. 修改设计系统本体后递增 `metadata.json.version`。

该约束必须写入 `wego-uxsystem-iterate/SKILL.md` 与其直接引用的组件/UI Kit 迭代 reference；不得仅存在于本计划文档。

## 8. 文件变更总表

### 删除

- `.codex/skills/wego-ux/`
- `.codex/skills/wego-tests/`
- `.codex/skills/wego-design/references/design-plan.md`
- `.codex/skills/wego-product/references/interaction-spec.md`
- `scripts/specs.mjs`
- `scripts/specs-core.mjs`
- `docs/specs/`
- `.codex/skills/wego-design/specs/`

### 新增

- `scripts/validate-component-contract-parity.mjs`
- `scripts/validate-scene-contract.mjs`
- `scripts/extract-design-decisions.mjs`
- `scripts/test-scene-contract-tools.mjs`
- `.codex/skills/wego-design/references/scene-contract.md`

### 修改

- `AGENTS.md`
- `.codex/skills/README.md`
- `.codex/skills/wego-design/SKILL.md`
- `.codex/skills/wego-design/agents/openai.yaml`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/uikit-plan.json`
- `.codex/skills/wego-design/components/index.json`
- 所有 `.codex/skills/wego-design/components/*.json`
- 命中的 `preview/component-*.html`
- `.codex/skills/wego-design/references/design-decisions.md`
- `.codex/skills/wego-design/references/library-map.md`
- `.codex/skills/wego-design/metadata.json`
- `.codex/skills/wego-uxsystem-iterate/SKILL.md` 及其组件/UI Kit 迭代 references
- `scripts/validate-wego-design*.mjs`、技能边界验证器和所有删除 specs/旧技能路径的调用方

## 9. 实施与验证顺序

1. 删除 specs 体系并把规则归位；先让运行时不存在生成文档依赖。
2. 重写 wego-design 与 wego-uxsystem-iterate 的入口、references 和 agents 配置。
3. 升级组件契约 Schema，处理 `cell--indent`、search 外部来源、Token 范围和结构化 alternatives。
4. 更新 Preview、重新生成 `components.css`、同步组件索引与 UI Kit 清单。
5. 更新 `library-consumption.json`、`uikit-plan.json` 和 App 宿主规则。
6. 新增组件一致性、场景合同、交互、决策提取和视觉门禁。
7. 删除 wego-ux / wego-tests 及所有引用；全仓执行零旧路径扫描。
8. 同步 `wego-app/lib/`，更新设计系统版本，执行严格全量验证。

最少验证集：

```bash
node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design
node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design --check
node scripts/validate-component-contract-parity.mjs
node scripts/test-scene-contract-tools.mjs
node scripts/validate-skill-entry-boundary.mjs
node scripts/sync-wego-app-lib.mjs --check
node scripts/validate-wego-design.mjs --scope=system --strict
node scripts/validate-wego-design.mjs --scope=full --strict
rg -n 'wego-ux(?!system-iterate)|wego-tests|specs\.mjs|specs/' AGENTS.md .codex scripts wego-app --hidden --pcre2
```

最后一条除明确的历史归档外必须无运行时命中。所有场景还必须通过各自的场景合同、交互和固定视口视觉检查。
