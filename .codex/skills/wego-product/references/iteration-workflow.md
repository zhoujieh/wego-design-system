# 业务迭代工作流

> 创建、提交、确认、失效或冻结迭代时只读对应章节。状态与指纹由 `scripts/iteration-record.mjs` 维护，不手写内部治理字段。

## 迭代位置

```text
wego-app/scenes/{分类}/{主业务场景}/_iterations/{iteration_id}-{title}-{YYYYMMDD}/
├── iteration.json
├── {iteration_id}-{title}-{YYYYMMDD}.md   # spec.md 需求规格说明（唯一需求源）
└── freeze.json   # 仅明确冻结后存在
```

迭代 ID 格式：`{分类}{3位数字}[-{修订号}]`，如 `shop001`、`bcg003-2`。分类代码：`shop`（相册云）、`bcg`（生意云）、`customer`（客户云）、`infras`（基础）。

`init` 时 `--iteration-id` 可选：不传则根据场景自动判断分类并按分类内最大编号+1 自动生成（可用 `suggest-id --scene <场景>` 预查询）；用户主动指定时直接使用，支持 `-1`、`-2` 等修订号后缀。场景分类映射表维护在 `scripts/iteration-record.mjs` 的 `sceneCategoryMap`，新增场景时补充。

同一需求在本地迭代、正式验收和反馈期间复用当前未冻结迭代。只有原迭代已冻结、已终止或用户明确开始独立需求时新建。

## AI 维护的内容

`iteration.json` 使用 `schemaVersion: 6`。AI 只直接维护：

- `identity` 中的迭代标识、标题、主场景和关联场景。
- `brief_file`：指向 spec.md 的文件名。
- `affected_scenes`。
- 确有场景外运行时改动时维护 `affected_runtime`。

`prototype_brief` 是 `submit-brief` 时从 spec.md 解析生成的**快照缓存**，用户不手写，用于漂移检测和校验。

`brief_submission`、`brief_confirmation`、`prototype_submission`、`prototype_confirmation`、`stage_outputs`、`change_log`、`freeze`、范围哈希和文件指纹全部由脚本维护，不直接编辑。

## spec.md 字段

spec.md 按[简报模板](./brief-template.md)填写，包含以下业务字段（标题中括号内为字段名）：

- `goal`：目标和用户价值。
- `included` / `excluded`：本次做与不做的范围。
- `entry_points`：入口归属、位置和触发条件。
- `critical_paths`：用户完成目标的关键路径。
- `prototype_boundaries`：各流程的原型深度和可见结果（用 ### 子标题）。
- `states`：必要业务状态、进入条件和用户可感知结果。
- `data_contract`：必须展示、读取或修改的数据及约束（用 ### 子标题）。
- `assumptions`：低风险、可逆且已写明影响的假设。
- `open_questions`：提交前必须解决的问题。

提交前，目标、纳入范围、入口、关键路径、原型边界和状态必须非空，`data_contract` 必须是非空对象，`open_questions` 必须为空。`flow_id` 使用唯一 kebab-case；`mode` 只能是 `functional`、`simulated` 或 `stub`。

## 命令与状态

```text
draft
  → 写好需求规格说明 → submit-brief（自动解析 MD、校验、算哈希）
in-development（开发中，需求规格说明可随时修改后重新 submit-brief）
  → 用户说"验收完成" → 5 维度一致性校验 → 用户确认 → confirm-brief
prototyping
  → 用户明确验收通过 → submit-prototype（场景验证 + 固化指纹 + 确认 + 冻结，一步完成）
frozen
```

暂停或终止状态为 `blocked | cancelled | superseded`。

`in-development` 承载简报开放开发：浏览本地预览、修改需求规格说明、重新 submit-brief、完成一次修改、通过轻量检查，都不改变状态，也不触发 confirm。只有用户明确说"验收完成"并通过一致性校验后才执行 confirm-brief。

所有命令都通过统一脚本执行：

```bash
node scripts/iteration-record.mjs suggest-id --scene {场景}

node scripts/iteration-record.mjs init \
  --file wego-app/scenes/{分类}/{场景}/_iterations/{迭代}/iteration.json \
  --title {标题} --scene {场景} [--iteration-id {id}]

node scripts/iteration-record.mjs submit-brief --file {iteration.json}
node scripts/iteration-record.mjs confirm-brief --file {iteration.json} \
  --user-confirmed-brief {iteration_id}
node scripts/iteration-record.mjs submit-prototype --file {iteration.json} \
  --user-confirmed-prototype {iteration_id}
node scripts/iteration-record.mjs migrate --file {iteration.json}
node scripts/iteration-record.mjs invalidate --stage=brief --file {iteration.json}
node scripts/iteration-record.mjs invalidate --stage=prototype --file {iteration.json}
node scripts/iteration-record.mjs check --file {iteration.json}
```

- `suggest-id`：根据场景名预查询建议的迭代 ID（自动判断分类+递增编号），不创建任何文件。
- `init`：创建迭代，自动生成需求规格说明空模板和 iteration.json。`--iteration-id` 可选，不传则自动生成；用户主动指定时直接使用，支持 `-1`、`-2` 等修订号后缀。
- `submit-brief`：从需求规格说明解析 prototype_brief 快照，运行充分性守门，固定范围哈希；从 draft 或 in-development 状态均可执行。
- `confirm-brief`：只能在用户明确表达"验收完成"且 5 维度一致性校验通过后执行，命令中的迭代 ID 必须与当前记录一致。执行后进入 `prototyping`。
- `submit-prototype`：用户明确验收通过后执行，一步完成场景验证、固化原型指纹、确认原型和冻结归档。必须传 `--user-confirmed-prototype {iteration_id}`。源码验证失败时不得进入 frozen；执行后生成 freeze.json 快照，状态变为 `frozen`。
- Agent 不得因为实现完成、检查通过、用户查看了本地页面，或自己判断"可以交付"而执行 `submit-prototype`。
- `migrate` 只迁移 schemaVersion 5 的历史记录。旧的待验收原型因没有提交指纹会回到 `prototyping`，必须重新获得提交授权并提交后再请求用户验收；不得借迁移伪造验收。

## 本地迭代与验收反馈

- 在 `in-development` 中收到已确认范围内的视觉、布局、组件、Token、路由或交互调整，直接修改需求规格说明并重新 submit-brief，不执行 invalidate。
- 在 `prototyping` 中收到已确认范围内的视觉、布局、组件、Token、路由或交互调整，直接继续修改，不执行 `invalidate`。
- 在 `frozen` 中收到上述调整，先执行 `invalidate --stage=prototype` 回到 `prototyping`（自动删除 freeze.json），在本地累计完成新一轮修改；只有用户再次明确表达"验收通过"时，才重新执行 `submit-prototype`。
- 用户反馈改变目标、范围、入口、关键路径、状态、数据或可见结果时，无论当前处于哪个阶段，都先 `invalidate --stage=brief`，更新需求规格说明并重新提交确认。

失效在原迭代中继续，不自动新建迭代。

## 冻结

<!-- rule-id: business-iteration-explicit-user-freeze -->
验收完成时，`submit-prototype` 一步完成确认与冻结，最终状态为 `frozen`，并生成同目录 `freeze.json` 快照。

```bash
node scripts/iteration-record.mjs submit-prototype \
  --file {iteration.json} \
  --user-confirmed-prototype {iteration_id}
```

确认、测试、验收、交付、提交、部署或时间经过都不能单独推断冻结意图；冻结必须与验收收口连续执行。目标迭代不明确时保持 `prototype-confirmed` 并询问用户。

冻结指纹由脚本自动覆盖：

- 每个受影响场景的 `scene.js` 和 `scene.css`。
- 该场景在 `routes.js` 中的实际路由语义。
- `affected_runtime` 中确有必要的文件。

脚本生成 `freeze.json` 并禁止覆盖。冻结后的记录是历史快照，不再为场景修改提供有效迭代绑定；后续变化必须进入新的或仍有效的未冻结迭代。
