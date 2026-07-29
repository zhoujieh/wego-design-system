# 组件与 UI Kit 迭代

> 角色：组件、Preview、UI Kit、Token 与消费契约的唯一迭代流程。读取条件：用户要求修改或新增设计系统本体；不用于普通业务场景。

## 1. 判定与权威边界

- 组件 DOM、变体、状态、`runtimeTokens`、`localTokens`、`previewOnlyTokens`、规则引用：`components/{slug}.json`。
- 组件实际 DOM、class、样式与交互展示：`preview/component-{slug}.html`。
- 聚合组件样式：`components.css`，只能由提取脚本生成。
- 组件注册与 Preview 路径：`components/index.json`。
- 明确页面范式、范式候选组件与 UI Kit：`uikit-plan.json` 与 `ui_kits/*`；组件允许范围以 `components/index.json` 为唯一来源。
- Token 实际名称：`colors_and_type.css`；`css.json` 仅为结构索引。

命中普通业务场景、文案、入口或数据时停止，改走 `wego-product → wego-design`。

## 2. 组件迭代步骤

1. 读取组件契约、Preview、`components.css`、索引、引用该组件的 UI Kit 和受影响场景。
2. DOM、变体、状态、Token 或交互行为变化时必须同时修改 Preview 与契约的唯一当前 Schema；只调整不改变实现表面的消费提示时可仅改契约，但必须复核 Preview 和聚合 CSS 仍满足新语义。不得直接修改 `components.css` 或 `wego-app/lib/`。
3. 组件 CSS 中的全局变量写入 `runtimeTokens`，内部参数写入 `localTokens`，展示页专属变量写入 `previewOnlyTokens`。
4. root、必需节点、alternatives、modifier 必须都在 Preview 和聚合 CSS 中可达。新增或修改变体维度时，每个新增或修改值至少要有一个 Preview 示例和对应 `representativeVariants` 证据；替代结构使用结构化 `alternatives`，不得保留不可解析的复杂 selector 字符串。
5. 数值组件必须把可缩放的数值语义拆到正式子节点：整数、小数、货币符号、单位和区间两端不得混入同一个文本节点。纯整数省略小数节点，不创建空节点。
6. 按同步矩阵条件更新消费者：注册、Preview 路径或代表变体变化时更新组件索引；组件可用范围变化时更新引用该组件的明确范式；新增或删除组件时同步索引、明确范式和 Preview 导航。不得为未受影响项制造机械改动。
7. 运行 CSS 提取、组件一致性守卫、资源同步和受影响场景回归。

## 3. UI Kit 迭代步骤

1. UI Kit 仅展示页面组合，不得成为 App 宿主、通用组件或业务场景模板。
2. 每个 UI Kit 只能使用已注册组件与业务区域胶水；不得使用旧技能路径、自动生成规则文档、未注册 class 或自造组件。
3. 更新明确 pagePattern、范式候选组件、presentation、组合约束和质量报告；报告必须使用当前 schema 和设计系统版本，记录通过的组件一致性检查与非空质量门禁。
4. 场景设计统一使用 `../../wego-design/references/interaction-prototype-design.md`：先形成设计意图和语义区域，精确命中范式时读取对应 UI Kit，未命中时走 composed；页面结构确定后再按 `library-consumption.json` Preview-first 映射组件。只有组件、变体或 presentation 无法覆盖时才提交最小缺口说明，禁止选择近似 UI Kit、拼接多个 UI Kit，或因缺口在 UI Kit/场景临时造组件。

## 4. 必跑守卫

```bash
node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design
node scripts/validate-component-contract-parity.mjs
node scripts/sync-wego-app-lib.mjs
node scripts/validate-wego-design.mjs --scope=system --strict
```

Token、组件、Preview、UI Kit 或消费契约改变时递增 `metadata.json.version`。守卫失败必须修正源文件后重跑，不能用缺口说明掩盖已知实现错误。
