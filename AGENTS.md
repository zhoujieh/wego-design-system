# wego-app AI UXDesign 工作流

## 仓库定位

微购中文静态 App 原型与设计系统仓库。用户提供业务需求，AI 按固定链路生成符合微购设计语言的移动端交互原型。

默认面向移动端、微信生态、电商、工具场景。产品范围确认和设计输出必须先读取并遵循共享设计决策原则；本文件不重复定义设计原则。

## 固定产物

- `wego-app/index.html` 是唯一 App 入口和预览宿主。
- 业务场景统一进入 `wego-app/scenes/{中文业务场景}/`。
- 路由使用稳定 kebab-case `route_id`，访问地址使用 `#/route-id`；目录名不是 route\_id。
- 新场景必须增量维护 `wego-app/js/routes.js`、场景 `scene.js` 和 `scene.css`。模板、presentation、交互通过 `window.WegoApp.registerScene` 注册。
- 电脑端显示手机预览外壳，移动端同链接铺满真实 viewport。
- 预览以 GitHub Pages 固定链接 `https://zhoujieh.github.io/wego-design-system/` 为主，同时支持本地直接打开 `wego-app/index.html`。
- `wego-app/lib/` 是设计系统部署副本，禁止直接编辑；先改 `.codex/skills/wego-design/` 源文件，再运行 `node scripts/sync-wego-app-lib.mjs`。

## 沟通要求

- 每次会话必须按用户意图触发对应技能。
- 先理解完整工作流和影响范围，禁止按用户点名文件机械修改。
- 使用简洁、通俗的中文说明改了什么、验证了什么、还有什么风险。
- 不堆砌技术名词，不编造未执行的验证或风险。

## 技能路由

| 用户意图                                     | 必须先触发                   | 前置条件                        | 下一步                                          |
| ---------------------------------------- | ----------------------- | --------------------------- | -------------------------------------------- |
| 原始业务需求、做页面、做原型、做新场景                      | `wego-product`          | 无                           | 必须由用户确认 `prototype_brief` 后再交给 `wego-design` |
| 基于已确认原型简报设计并实现业务场景、修改已有业务场景              | `wego-design`           | 必须有用户已确认的 `prototype_brief` | 生成场景、决策证据、守卫结果与必要的最小缺口说明                   |
| 改组件、Token、Preview、UI Kit、设计库消费规则、守门或处理设计系统缺口 | `wego-uxsystem-iterate` | 目标属于设计系统本体或系统规则             | 按组件/UI Kit 同步矩阵执行                            |
| 审查并沉淀经验、补充规则、优化工作流                       | `wego-uxsystem-iterate` | 用户明确要求沉淀或优化                 | 先进入经验候选流程                                    |

统一路由入口见 `.codex/skills/README.md`。

## 主链路硬门禁

- 新业务需求或已有场景修改必须归属主业务场景 `_iterations/` 下的有效迭代；同一需求的验收与反馈修改优先复用当前未冻结迭代，只有没有可复用迭代、用户明确开始独立需求，或原迭代已冻结/终止时才新建迭代。
- 新迭代必须先由 `wego-product` 读取共享设计决策原则，再通过 `submit-brief → confirm-brief` 确认目标、范围、入口、关键路径和原型边界；确认后 `wego-design` 消费同一原则并在同一任务中完成设计系统消费与交互原型。
- `wego-product` 满足会话线框触发条件时，必须在用户目标、入口、首要任务、主要操作、可见结果和必要状态等最小事实齐备后生成参考线框；事实不足先询问，不得补造。线框不能替代 `submit-brief → confirm-brief`，也不新增线框确认状态。
- Trae 与 Codex 共用同一产品线框方法和临时业务模型，只允许按当前宿主选择不同渲染器；无渲染能力时降级为文本分镜并继续主链路。
- 已确认 `prototype_brief` 即 `wego-design` 的设计与实现授权。AI 必须先形成设计意图、精确范式/自主组合裁决和语义区域树，再选择具体组件；不得从组件清单反推布局、选择“最接近”的 UI Kit 或拼接多个 UI Kit。
- `wego-design` 在已确认范围内自主决定信息分组、布局、组件、Token、反馈和 overlay 形式，不为设计细节建立第二次确认门禁；只有缺失或冲突的业务事实会改变目标、范围、路径、状态或结果时才退回 `wego-product`。
- `wego-design` 不得定义业务事实或直接改设计系统源；设计系统缺口只记录最小缺口说明并由 `wego-uxsystem-iterate` 收敛。
- 每个场景必须有页面级 `prompt_contract`（含 `layout_contract`）、状态合同、设计决策证据、场景合同守卫、交互守卫和固定视口视觉检查；任何场景源码变化后都必须重提取决策文件。
- 页面结构确定后，组件消费必须 Preview-first：先读本页命中组件 Preview，再读契约；禁止猜 Token、class、子元素或 modifier。场景代码中的组件 DOM 结构必须逐字复制 Preview 中对应变体的 HTML，包括节点层级、class 组合、修饰类顺序和可选子元素位置；禁止"理解大意后自己写"。
- 组件、UI Kit、工作流问题不得误走普通业务开发链路。
- 原型确认、测试通过、交付、提交、部署或时间经过都不得推断冻结；只有用户明确指定某个迭代并要求“冻结”后，才能执行带用户确认门禁的 `freeze`。未冻结迭代可在验收期反复失效并修改；冻结迭代不得覆盖，后续业务变化建立新迭代。纯设计系统、工作流或仓库管理变化不建立业务迭代。
- 修改已有场景的交互或者视觉必须使用`wego-design`技能。
- 修改已有场景的需求笔记使用`wego-product`技能。

## 仓库级约束

- 原型产物不得散落在仓库根目录。
- 业务场景不得依赖 `fetch()` 或 `XHR` 读取本地 HTML 片段。
- 场景必须体现真实业务状态和流程反馈；只有需求明确要求刷新后保留时才使用持久化。
- 设计系统本体正式迭代必须递增 `.codex/skills/wego-design/metadata.json.version`。
- 不提交 `.DS_Store`、`.uploads/`。
- `.trae/skills/*` 是指向 `.codex/skills/*` 的符号链接，禁止把它当作独立副本维护。

## 临时任务产物

- `.uploads/` 只保存当前任务的上传输入，`output/` 只保存需要短暂查看或明确交付的诊断产物，`.playwright-cli/` 只保存浏览器会话快照和日志；三者都不是仓库正式产物。
- 临时截图、日志和中间文件优先写入系统临时目录。确需在仓库内生成时，只能进入上述目录，不得进入业务场景、设计系统源或仓库根目录。
- 任务结束前必须删除本任务创建的精确文件，并运行 `node scripts/cleanup-task-artifacts.mjs clean` 清理超过 24 小时的残留；不得为清理当前任务而删除其他并行任务 24 小时内的文件。
- 已确认工作区没有其他任务使用这些目录，或用户明确要求全量清理时，运行 `node scripts/cleanup-task-artifacts.mjs clean --all`。
- 用户明确要求保留的交付文件可以暂留 `output/`，交付时必须说明路径；不再需要后仍应清理。

## 页面安全区与电池栏

- 页面根节点（scene root）必须保持 `position: absolute; inset: 0` 全屏撑满，禁止在根节点上通过 `padding-top` 预留电池栏（status bar）高度。
- 页面根节点与主滚动区必须保持通栏，禁止用最外层 `padding-inline` 给全页内容一刀切设置左右边距。横向留白按语义内容组成组声明，同一组只有一个 spacing owner；导航栏、sticky surface 和底部操作栏始终通栏，内部留白由组件承担。
- 开始组件选择前必须先完成页面级 `page_layers`、`scroll_architecture`、`layout_groups` 与 `sticky_regions`。所有 sticky/fixed/scroll 区域都要登记滚动所有权、层级、背景和内容避让方式。
- Sticky surface 必须有不透明背景和 navigation 层级；动态显隐只改变尺寸与位移，不改变 opacity。顶部按实测高度维护 `scroll-padding-top`；底部固定内容按实测高度、安全区和额外间距维护 clearance 与 `scroll-padding-bottom`，确保首尾内容可完整滚出遮挡区。
- 有 NavBar 的页面：由 NavBar 组件内部通过 `padding-top: var(--safe-area-top)` 处理顶部安全区。
- 无 NavBar 但顶部有固定/吸顶元素（tabs、header 等）的页面：由该固定元素自身内部通过 `padding-top: var(--safe-area-top)` 让位。
- 无 NavBar 且无固定顶部元素的页面：由滚动内容层通过 `padding-top: var(--safe-area-top)` 让位。
- 桌面预览壳的 `.phone-status` 仅作为透明视觉覆盖层存在，不参与页面布局，禁止把它的处理职责下沉到业务场景之外的全局容器。

## 组件与 UI Kit 一致性

- 组件契约、Preview、`components.css`、组件索引、允许组件清单和 UI Kit 必须同步。
- 组件契约只引用权威源；禁止 `specRefs`、不存在的仓库路径和旧技能路径。
- Preview 中的全局 Token 必须登记为 `runtimeTokens`，组件内部参数必须登记为 `localTokens`，仅展示页使用的 Token 必须登记为 `previewOnlyTokens`。
- 每份 UI Kit 质量报告必须记录当前设计系统版本、已通过的一致性检查和非空质量门禁；报告中的组件必须已注册且允许使用。
- `components.css` 只能由 Preview 提取脚本生成，禁止直接编辑。
- 新增或修改组件、Preview、UI Kit、Token 或消费契约后，必须运行组件一致性守卫；影响场景时按影响范围回归场景合同、交互和视觉检查。

## 经验沉淀硬规则

- 只有用户明确要求“审查并沉淀经验”“补充规则”“复盘并形成经验”或“优化工作流”时，才允许更新经验候选池。
- 候选必须经归属、适用/不适用、例外、回退和运行时可达性判断；达到阈值后仍需用户确认才能升级正式规则。
- `scenarioTypeRegistry` 只保存成熟且被运行时消费的正式类型，不保存候选或历史技能职责。

## Git 与验证

- 默认目标分支为 `main`；显式路径暂存，不执行 `git add -A`。
- 除非用户明确要求单独开分支、PR 流程或风险隔离，默认直接在 `main` 开发、提交与推送；不要自行创建 `agent/*` 或其他临时分支。
- 提交信息使用简短中文动词短语；不强推已存在远端分支。
- 提交前运行：
  - `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design`
  - `node .codex/skills/wego-design/scripts/extract-components-css.mjs .codex/skills/wego-design --check`
  - `node scripts/validate-component-contract-parity.mjs`
  - `node scripts/validate-wego-design.mjs`
  - 正式合并前按需运行 `node scripts/validate-wego-design.mjs --scope=full --strict`
- 启动本地验证服务器必须自动退出或在任务结束时清理；开始与结束均用 `lsof -iTCP -sTCP:LISTEN -P | grep python` 检查残留。
- 任务开始与结束均运行 `node scripts/cleanup-task-artifacts.mjs clean`；该命令默认只清理超过 24 小时的任务产物。
