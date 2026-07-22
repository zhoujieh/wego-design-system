# 业务迭代契约

> 角色：业务范围确认与原型冻结的唯一状态机。读取条件：创建、确认、失效或冻结业务迭代；不承载组件、UI Kit 或场景实现规则。

## 1. 当前 Schema

迭代固定使用 `schemaVersion: 4`。旧 Schema、旧命令、废弃设计计划文件、实现追踪、验收报告和自动生成规则文档均不是当前输入；发现后必须停止并显式迁移。

```json
{
  "schemaVersion": 4,
  "identity": {
    "iteration_id": "shop001",
    "title": "快捷发布",
    "date": "2026-07-12",
    "primary_scene": "快捷发布产品",
    "related_scenes": []
  },
  "status": "draft",
  "scope_revision": 1,
  "prototype_brief": {
    "goal": "",
    "included": [],
    "excluded": [],
    "entry_points": [],
    "critical_paths": [],
    "prototype_boundaries": [
      {
        "flow_id": "publish-product",
        "mode": "functional",
        "visible_result": "用户完成发布并看到成功结果"
      }
    ],
    "states": [],
    "data_contract": {
      "product": { "required": ["title"] }
    },
    "assumptions": [],
    "open_questions": []
  },
  "brief_confirmation": null,
  "prototype_confirmation": null,
  "affected_scenes": ["快捷发布产品"],
  "affected_runtime": [],
  "stage_outputs": {
    "product": { "valid": false },
    "design": { "valid": false }
  },
  "change_log": [],
  "freeze": null
}
```

`prototype_brief` 只允许上例中的 10 个字段；`readiness` 或其他旧字段必须删除或显式迁移，不得作为兼容输入继续流转。字段内容可附带交互视觉描述（布局位置、控件类型、视觉强调、打开方式倾向等），但提交前必须先符合共享设计决策原则；由 `wego-design` 严格遵循。具体组件名、CSS 类、Token、动画名等正式规格仍由设计阶段在设计系统范围内决定。

## 2. 状态机

```text
draft → awaiting-brief-confirmation → prototyping → awaiting-prototype-confirmation → prototype-confirmed
验收反馈：awaiting-prototype-confirmation | prototype-confirmed → invalidate → prototyping
冻结：prototype-confirmed → 用户明确指定迭代并要求冻结 → frozen
```

暂停或终止状态：`blocked | cancelled | superseded`。

- `submit-brief`：产品提交非空的目标、范围、入口、关键路径、原型边界、状态和数据合同；`data_contract` 必须是至少包含一个键的普通对象，此时不得遗留 `open_questions`。
- `confirm-brief`：用户确认范围，确认对象绑定当前 `scope_revision` 和范围哈希，交给 `wego-design`。
- `submit-prototype`：场景、决策证据和守卫均已完成；命令会实际运行每个受影响场景的场景合同，全部通过后才可等待用户定稿。
- `confirm-prototype`：先重新运行受影响场景合同，再让确认对象绑定当前 `scope_revision`、`affected_scenes`、场景源码、场景自身路由条目、决策证据和 `affected_runtime` 的 SHA-256。该状态仍可失效后继续验收修改，不代表冻结。
- `freeze`：仅在用户明确指定当前迭代并要求“冻结”后执行；命令必须携带 `--user-confirmed-freeze <iteration_id>`。命令会先确认原型确认后的文件没有漂移，再在 `iteration.json.freeze` 与同目录 `freeze.json` 同时记录设计系统版本、当前范围版本和完整指纹；已有 `freeze.json` 禁止覆盖。
- `invalidate --stage=brief|prototype`：在对应产物修改前失效确认；命令同时支持 `--stage prototype` 与 `--stage=prototype`，其他带值参数同理。

<!-- rule-id: business-iteration-explicit-user-freeze -->
### 显式冻结与验收复用

- `applies_when`：同一需求仍在验收和反馈修改中，且当前迭代未冻结。必须复用该迭代；业务目标、范围、入口、关键路径、状态或数据变化时失效 brief，视觉、交互或实现变化时失效 prototype，完成后再次提交验收。
- `avoid_when`：用户没有明确说“冻结”时不得执行 `freeze`。“验收通过”、“没问题”、“完成”、原型确认、守卫通过、交付、提交、部署和时间经过均不得推断为冻结意图。
- `exceptions`：`cancelled` 和 `superseded` 是终止状态，不得代替冻结或伪造冻结快照。已冻结迭代仍不得解冻、覆盖或失效。
- `fallback`：无法确定用户是否要求冻结或目标迭代不明时，保持当前非 `frozen` 状态并向用户确认，不得代为执行 `freeze`。

主链路状态的确认矩阵固定如下，不允许提前写入或漏写确认：

| 状态 | `brief_confirmation` | `prototype_confirmation` |
| --- | --- | --- |
| `draft` | `null` | `null` |
| `awaiting-brief-confirmation` | `null` | `null` |
| `prototyping` | 当前 `scope_revision` 的确认对象 | `null` |
| `awaiting-prototype-confirmation` | 当前 `scope_revision` 的确认对象 | `null` |
| `prototype-confirmed` | 当前 `scope_revision` 的确认对象 | 当前源码指纹确认对象 |
| `frozen` | 当前 `scope_revision` 的确认对象 | 当前源码指纹确认对象 |

范围哈希 `scope_sha256` 稳定覆盖 `identity.primary_scene`、`prototype_brief`、`affected_scenes` 和 `affected_runtime`。`invalidate --stage=brief` 会递增 `scope_revision` 并清空两类确认；`invalidate --stage=prototype` 只清空原型确认，不改变已经确认的业务范围版本。两类失效都在原迭代内形成新的验收轮次，不自动新建迭代。直接修改范围版本、已确认范围内容或原型确认后的指纹目标，会在下一次检查或冻结前被拦截。

## 3. 所有权

- `wego-product`：创建迭代、确认范围、维护 `prototype_brief` 和业务事实。
- `wego-design`：消费已确认简报，在同一任务中实现已登记场景、生成决策证据、场景合同和视觉检查。
- `wego-uxsystem-iterate`：只处理设计系统缺口和系统规则；不实现业务场景。

## 4. 原型边界

`prototype_boundaries` 必须是非空数组，每个纳入原型的流程写一项：

```json
{
  "flow_id": "publish-product",
  "mode": "functional",
  "visible_result": "用户完成发布并看到成功结果"
}
```

- `flow_id`：稳定且非空的业务流程标识，同一简报内不得重复。
- `mode`：只能是 `functional`、`simulated` 或 `stub`。
- `visible_result`：用户在原型中实际可见的结果，可包含交互视觉描述（如"用户完成转发并看到成功提示，转发按钮高亮"）。
- `excluded` 中的事项不得再次写入 `prototype_boundaries`；排除范围不实现，也不使用 `stub` 占位。

## 5. 目录与冻结

```text
wego-app/scenes/{主业务场景}/_iterations/{YYYYMMDD}-{iteration_id}-{title}/
├── iteration.json
├── {iteration_id}-{title}-范围确认.md
└── freeze.json
```

活动迭代的 `affected_scenes` 必须是非空、去重的单层场景名并包含 `identity.primary_scene`，禁止 `/`、`\`、`.` 和 `..`。`affected_runtime` 的每一项必须是非空、去重的仓库相对安全路径，禁止绝对路径、反斜杠以及 `.`、`..` 路径段。所有命令的 `--file` 必须固定指向 `wego-app/scenes/{identity.primary_scene}/_iterations/{迭代目录}/iteration.json`，禁止仓库外路径、错场景目录、非 `_iterations` 位置和符号链接跳转。

冻结记录必须完整包含 `at`、`design_system_version`、`scope_revision` 和非空 `fingerprints`。指纹键集合必须恰好等于 `affected_runtime`、每个场景的 `scene.js`、`scene.css`、`design-decisions.json` 和该场景的虚拟路由条目键。路由指纹只计算真实全局 `window.WEGO_APP_ROUTES` 注册中属于本场景的完整路由集合；该全局变量必须且只能静态赋值一次，数组直接包含静态路由对象。指纹覆盖运行时消费的 `routeId`、`scene`、`script`、`style` 以及 `entry.type/tab/group/label/icon/parentEntry`，同场景多条路由按完整语义稳定排序。整个真实路由数组中的 `routeId` 必须非空且全局唯一；`host-tab` 必须声明非空 `entry.tab`，同一 tab 只能注册一次，避免宿主 `Map` 被后项静默覆盖。格式、顺序、注释和其他场景路由变化不影响旧冻结记录，伪造的对象属性注册、删除或修改本场景任一路由语义则视为漂移。即使 `affected_runtime` 显式包含 `wego-app/js/routes.js`，也只使用分场景路由指纹，不冻结整个路由文件。其余文件会确认存在并重算 SHA-256。`freeze.json` 必须与 `iteration.json.freeze` 一致，冻结后任一目标漂移都会失败。同一需求在迭代已冻结或终止后再变化时建立新迭代；用户明确开始独立需求时也可建立新迭代；验收期反馈复用当前未冻结迭代。设计系统迭代不建立业务迭代。

## 6. 修改边界

- 目标、范围、入口、关键路径、状态或数据变化：失效 brief，回到 `wego-product`。
- 组件、布局、presentation、Token、路由或场景交互变化：失效 prototype，回到 `wego-design`。
- 组件、Preview、UI Kit、Token 或消费规则缺口：记录缺失能力、受影响 surface、是否阻断和正式回退，转交 `wego-uxsystem-iterate`；最小缺口说明不可替代业务范围确认。
