# 组件与 UI Kit 使用规则

本文档由系统规则自动生成，用于人工检查。请勿直接修改；如需调整规则，应修改对应权威来源后重新生成。

## 什么时候使用

页面结构已经确定，需要选择稳定组件、组合方式或页面示例时使用。

## 应该怎么做

### 组件与 UI Kit 总览

- 当前稳定组件包括：按钮、卡片、头像、标签、底部导航、输入框、搜索框、计数器、角标、列表单元格、复选框、表单容器、图片、链接、单选、选项卡、标签栏、开关、导航栏、提示、对话框、底部操作表单、底部模态框、气泡菜单。
- 当前页面示例包括：业务规则配置、系统设置。
- 先看组件契约和真实示例，再决定结构、状态和组合。
- 页面示例只用于理解骨架、节奏和固定位置，业务内容必须按当前需求重新组织。

### UI Kit 选择决策树

1. **页面是否有页面级保存按钮（或需要统一提交后生效）？**
   - yes：选择 biz-rule-config（编辑后统一保存，full-screen-modal 打开）
   - no：继续判断
2. **页面主要内容是导航入口（箭头跳转）还是编辑控件（表单、单选、多选等）？**
   - navigation-majority：选择 system-settings（层级导航，push 打开）
   - edit-majority：选择 biz-rule-config（规则配置，full-screen-modal 打开）
3. **导航入口和编辑控件混合且占比相近时？**
   - no-save-button：选择 system-settings（无保存按钮意味着即时生效或层级导航为主）
   - has-save-button：选择 biz-rule-config（有保存按钮意味着需要统一提交）

**快速对照：**
- system-settings：层级导航列表页，push 打开，无保存按钮，以箭头入口为主，允许包含即时生效的开关
- biz-rule-config：规则配置编辑页，full-screen-modal 打开，有保存按钮，以表单/选择控件为主

**例外：**当页面名称或主题与交互模式冲突时，以交互模式为准。例如：'库存预警设置'虽然叫'设置'，但如果是表单编辑页（有保存按钮），应选择 biz-rule-config；'交易设置'虽然叫'设置'，但如果是层级导航列表（无保存按钮），应选择 system-settings。

### 各页面范式适用场景速查

#### 业务规则配置（biz-rule-config）

- **适用场景：**业务规则配置、业务参数编辑、权限管理、库存规则维护、发货规则维护、业务数据编辑
- **交互模式：**编辑后统一保存，页面级主操作收口，不在内容区和底部重复堆叠保存动作
- **默认打开方式：**full-screen-modal
- **主要组件：**navbar、form、cell、checkbox、switch、radio、tag、link

#### 系统设置（system-settings）

- **适用场景：**系统设置、应用设置、账号设置、通用设置、App 设置
- **交互模式：**层级导航,从右侧 push 进入,返回按钮收口;设置项按账号/业务/系统三组分类,整行点击进入下一层
- **默认打开方式：**push
- **主要组件：**navbar、cell

### 兜底蓝图适用场景

#### 移动端宿主页入口（mobile-host-entry）

**适用条件：**
- 页面角色为 host-entry
- 页面只承接打开入口、当前状态摘要、保存回填或结果概览
- 没有精确命中的 pagePattern，但可用移动端基础组件安全组成

- **允许组件：**navbar、cell、button、tag、card、link

#### 对象管理列表页（object-management-list-page）

**适用条件：**
- 页面角色为 primary-task-page
- 主任务是管理一组可新增、编辑、删除、启停或进入详情的业务对象
- 列表项包含对象识别物、名称、关键状态、摘要和至少一个操作
- 现有 UI Kit/pagePattern 无精确范式，但可由已注册组件和页面级业务样式安全组成

- **允许组件：**navbar、search、card、image、tag、button、link、dialog、toast

#### 通用移动任务页（generic-mobile-task-page）

**适用条件：**
- 页面角色为 primary-task-page
- 现有 UI Kit/pagePattern 无精确范式
- 任务可由已注册组件、section 分组和规范约束完成

- **允许组件：**navbar、search、form、cell、input、button、tag、link、switch、radio、checkbox

#### 二级选择列表页（selection-list-page）

**适用条件：**
- 页面角色为 secondary-task-page
- 核心任务是单选、多选、创建后回填或列表选择
- 没有独立 UI Kit，但可由 cell + radio/checkbox/tag 承接

- **允许组件：**navbar、cell、radio、checkbox、tag、button、link、input

### 组件组合约束

#### 业务规则配置 组合约束

1. **触发条件：**多选项互斥单选（选项≥3 或单条文案>4字）
   - 推荐：cell + cell__select + radio
   - 避免：form-body--preserve-content-align + radio-field-group
   - 原因：form 右侧 radio-group 在移动端窄屏存在适配风险：label 固定 96px 后右侧空间仅约 255px，3 项以上或长文案容易溢出。cell 竖排不受此限制。
   - 例外：2 选项短文案（单条 ≤4 字）时 form 仍可用，如 UI Kit 中「统计口径」示例

2. **触发条件：**主互斥配置项命中已注册稳定场景，且内嵌选择控件、标题/副标题和间距已由该场景承接
   - 推荐：完整消费命中的稳定场景，不再拆出内嵌选择控件做二次规格判断
   - 避免：在 wego-ux 阶段单独改小 radio/checkbox、重写偏移或追加局部说明去补结构
   - 原因：组件稳定场景已经定义了内嵌控件规格、对齐和信息节奏；继续拆开判断会造成尺寸漂移和关系失真。
   - 例外：只有设计系统明确开放新的可变维度，并已回流权威契约后，才允许偏离原场景

3. **触发条件：**父项选中后才出现补充字段、跳转入口、筛选范围或排除条件
   - 推荐：把补充内容视为父场景延展，和父项保持同组连续结构
   - 避免：拆成独立平级 section，或依赖 helper 文案解释父子关联
   - 原因：这类信息的核心是从属关系，必须由结构直接表达；平级 section 和冗余 helper 会削弱选中态与条件区之间的可感知关联。
   - 例外：仅当补充内容已经升级为独立任务块、与父项不再存在显式从属关系时，才允许脱离原场景单独成组

4. **触发条件：**helper 文案仅重复摘要、选中态、禁用条件、跳转语义或结构已表达的信息
   - 推荐：删除冗余 helper，优先用标题、副标题、摘要、禁用态和同组结构表达
   - 避免：把 helper 当成默认兜底说明层
   - 原因：规则配置页需要高信息密度和连续设置节奏，冗余 helper 会掩盖结构主次并放大场景拆解问题。
   - 例外：只有结构无法承载且业务必须提醒风险、时效或不可逆后果时，才保留 helper

5. **触发条件：**section 由连续 cell 或连续 form-body 组成，且标题与内容属于同一业务分组
   - 推荐：使用 `.cell-group` / `.form-group` 的正式标题节点 + 内容容器结构；biz-rule-config 命中页面默认通栏 M0（cell-group__content 不开 --card），仅当 surface 角色为 host-entry 时才开卡片修饰 M16
   - 避免：复用 `.uikit-section-title`、手写 section 间距，或额外包一层只为白底圆角存在的容器
   - 原因：分组标题、内容区表面和卡片圆角已经收敛为组件正式能力；是否开卡片修饰由宿主内容层是否承担横向留白决定，继续放在页面层拼接会造成节奏、圆角和复制边界漂移。
   - 例外：仅当 surface 角色为 host-entry（宿主入口列表）时，才改为卡片模式 M16（开 --card 修饰 + phone-body 16px 横向 padding）；其他 biz-rule-config 命中页面一律通栏 M0

6. **触发条件：**行内主语义是进入下一层选择/跳转/展开，且右侧存在箭头或等价的下一步指示
   - 推荐：给 cell / form-body 保留整行 clickable 标记和按压反馈
   - 避免：把 switch、radio-group、checkbox-group、button、upload、icon actions 这类独立控件行也做成整行热区
   - 原因：整行点击只服务于进入下一步的行式交互；独立控件需要清晰边界，否则容易和状态切换、焦点顺序冲突。
   - 例外：只有行内交互本身就是打开选择面板、进入下一级页面或展开补充内容时，才保留整行 clickable

7. **触发条件：**surface 命中 biz-rule-config pagePattern，且 surface 角色不是 host-entry
   - 推荐：通栏模式 M0：phone-body 0px 横向 padding + cell-group__content 不开 --card 修饰；cell 横向边距由 cell__body 自带 16px padding 承担
   - 避免：给 phone-body 加 12px/16px 横向 padding 后再开 cell-group__content--card（双重 padding 浪费空间，且违反 M0 规范）
   - 原因：biz-rule-config UI Kit 范式 BizSettingsContent 已明确示范通栏模式：phone-body 无横向 padding + cell-group__content 无 --card，cell 横向边距由 cell__body padding 承担。这是 biz-rule-config 范式的稳定结构，AI 不得自决策改为卡片模式。通栏模式下移动端与桌面端视觉一致（cell 内容都有 16px 横向边距），不会出现移动端边距变小问题。
   - 例外：仅当 surface 角色为 host-entry（宿主入口列表）时，才改为卡片模式 M16

#### 系统设置 组合约束

1. **触发条件：**section 由连续 cell 组成,且标题与内容属于同一业务分组(账号/业务/系统)
   - 推荐：使用 .cell-group 的正式标题节点(cell-group__title) + 内容容器(cell-group__content);通栏模式 M0(cell-group__content 不开 --card 修饰)
   - 避免：复用 .uikit-section-title、手写 section 间距,或额外包一层只为白底圆角存在的容器
   - 原因：分组标题、内容区表面和卡片圆角已经收敛为组件正式能力;通栏模式下 cell 横向边距由 cell__body padding 承担,继续放在页面层拼接会造成节奏、圆角和复制边界漂移。
   - 例外：仅当 surface 角色为 host-entry(宿主入口列表)时,才改为卡片模式 M16(开 --card 修饰 + phone-body 16px 横向 padding)

2. **触发条件：**设置项需要展示副标题或补充说明
   - 推荐：cell--double + cell__subtitle 承接副标题
   - 避免：在 cell 外部补 helper 文案或自定义说明栏
   - 原因：cell--double 的 subtitle 已经是组件正式能力,不需要额外发明说明层。
   - 例外：只有结构无法承载且业务必须提醒风险、时效或不可逆后果时,才保留 helper

3. **触发条件：**设置项需要展示状态或操作入口
   - 推荐：trailing 变体:text-arrow(状态文字+箭头)、dot-arrow(红点+箭头)、arrow(纯箭头)
   - 避免：发明自定义 trailing 样式或未定义修饰类
   - 原因：trailing 变体已经收敛为 cell 组件正式能力,直接消费已注册变体即可。
   - 例外：只有当业务需要新的 trailing 类型且已回流组件契约后,才允许扩展

### 布局模式判断（通栏 M1 / 卡片 M2）

- biz-rule-config 命中页面默认通栏模式 M0（phone-body 0px 横向 padding + cell-group__content 不开 --card 修饰），cell 横向边距由 cell__body 自带 16px padding 承担，避免双重 padding。仅当 surface 角色为 host-entry（宿主入口列表）时才改为卡片模式 M16（phone-body 16px 横向 padding + cell-group__content--card 修饰）。判断依据是 surface 语义角色，不是组件名+修饰类名。
- 通栏模式 M0:phone-body 0px 横向 padding + cell-group__content 不开 --card 修饰;cell 横向边距由 cell__body 自带 16px padding 承担


## 不能怎么做

- 不能复制手机壳、展示外框或演示业务内容作为正式页面。
- 不能发明未登记的组件、子结构或修饰方式。
- 不能直接修改 App 中的设计系统副本。

## 完成后如何检查

组件已在注册表中存在，结构与状态符合契约，页面示例只用于结构参考，设计系统源文件与部署副本保持一致。

<!-- generated-by: scripts/specs.mjs@5 -->
<!-- source-fingerprint: 7df1c7665d66ad5dd138183a79329133b7fb432f8b3ef9922511bb3c3c22e107 -->
