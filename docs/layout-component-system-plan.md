# Layout 组件系统改造计划

## 1. 背景

当前 `wego-design` 已经具备页面层级、主滚动区、sticky/fixed 避让、UI Kit 页面范式、正式组件契约和 Token 消费能力，但页面的大型空间关系仍可能由场景 CSS 临时实现。

这会导致 AI 在未精确命中 UI Kit 时，虽然能够判断页面包含哪些语义区域，却不能稳定产出可直接实施的页面信息框架，例如：

- 页面是否包含顶部导航、主内容区和底部固定区域；
- 哪个区域拥有主滚动；
- 哪些区域固定、吸顶、滚动后压缩或动态显隐；
- 主内容区从上到下划分为几层；
- 每层采用纵向、横向、比例分栏、多栏网格还是横向滚动；
- 各区域如何使用统一的页面边距、间距和滚动避让。

本次改造的目标不是增加抽象规则，而是让 AI 在填入业务内容和组件前，先通过正式 Layout 组件搭建一棵 2–3 层的页面信息框架。

#### 缺口证据（迭代工作流要求）

按 `wego-uxsystem-iterate`「收到设计系统缺口时先验证缺口，再采用正式能力」，本次新增 7 个组件应基于可观察的缺口证据，而非预判。阶段 1 启动前需补充：至少 2 个现有场景中因场景 CSS 临时实现页面布局导致返工或验收失败的具体案例（场景名、失败现象、根因），作为正式升级的触发证据，避免单场景特例或预判被泛化为全局组件。

---

## 2. 改造目标

### 2.1 核心目标

所有场景级页面布局必须由正式 Layout 组件搭建。

AI 的页面生成顺序调整为：

1. 确认页面必须承载的信息；
2. 判断是否精确命中 UI Kit 页面范式；
3. 获得或搭建 2–3 层 Layout 组件树；
4. 将信息分配到 Layout 槽位；
5. 再定位业务组件、Preview、契约和 Token；
6. 接入 App 宿主并执行源码与浏览器验证。

### 2.2 预期结果

完成后，AI 应能够在组件选择前先形成类似以下结构：

```text
LayoutPage
├── Navbar
├── LayoutScroll
│   ├── LayoutSection
│   │   └── LayoutSplit ratio="2:1"
│   ├── LayoutSection
│   │   └── LayoutGrid columns="3"
│   ├── StickyRegion
│   │   └── LayoutScrollRow
│   └── LayoutSection
│       └── LayoutFlow direction="vertical"
└── BottomActionBar
```

该阶段只确定大型信息框架，不继续拆解标题、图标、按钮、文字等内容组件内部结构。

---

## 3. 设计边界

### 3.1 Layout 负责

- 页面顶部、正文、底部的整体框架；
- 页面唯一主纵向滚动区域；
- 大型信息区域的纵向分段；
- 区域通栏、内容宽度和页面边距；
- 区域之间的间距关系；
- 区域内部的横向、纵向、比例分栏和多栏网格；
- 横向滚动区域；
- sticky、fixed 和动态显示区域的结构关系；
- 与安全区、顶部遮挡和底部遮挡的避让。

### 3.2 Layout 不负责

- 标题、说明、图标、头像、按钮等内容细节；
- 正式业务组件内部布局；
- 业务文案和业务数据；
- 列表项内部的信息层级；
- 任意视觉装饰；
- 页面范式的业务判断。

### 3.3 布局拆分深度

Layout 规划只允许拆分 2–3 层：

1. 页面整体框架；
2. 主内容区的大型信息分区；
3. 每个分区内部的主要排列方式。

到第三层后停止继续拆分，后续由业务组件承担内容结构。

---

## 4. 最终 Layout 组件体系

第一阶段新增 7 个 Layout 组件，并复用现有 `sticky-region`。

### 4.1 `layout-page`

场景内的页面总框架。

#### 职责

- 提供顶部、正文、底部三个槽位；
- 占满当前场景挂载面板；
- 正文自适应剩余高度；
- 禁止产生第二个页面外层滚动；
- 统一顶部和底部区域与正文的空间关系。

#### 与 App 宿主的 DOM 边界

真实场景挂载点是宿主提供的面板，不是抽象的 `scene-root`：

- push 场景挂载于 `.app-scene-layer__panel`；
- host-tab 场景挂载于 `.host-shell-page__panel`；
- 两者当前自带 `overflow-y: auto`（见 `wego-app/css/app.css`）。

`layout-page` 与面板的滚动权归属规则（实施前已定死）：

1. `layout-page` 只做骨架，不自带 `overflow-y`；
2. 主纵向滚动由 `layout-scroll` 承担，唯一一个；
3. 面板（`.app-scene-layer__panel` / `.host-shell-page__panel`）在接入 `layout-scroll` 后必须关闭自身 `overflow-y`（改为 `overflow: hidden`），把滚动权交给 `layout-scroll`，禁止双层滚动；
4. `layout-page` 不接管全局路由、Overlay 和底部导航，只存在于场景面板内部。

#### 与现有 `scene-contract.md` 的冲突与重写

现有 `scene-contract.md` 的两条 `rule-id` 规则与本计划直接冲突，必须同步重写，不能只新增 Layout 规则而保留旧约束：

- 现有「场景样式只负责根作用域内的区域关系、语义分组、滚动和业务胶水」→ 改为「场景样式只负责业务状态类、非结构性内容表现、Layout 组件公开变量和少量业务胶水」，区域关系/滚动职责移交 Layout 组件；
- 现有「页面根使用 `position: absolute; inset: 0` 并保持通栏」→ `layout-page` 替代该根约束：`layout-page` 作为场景面板内第一个子级铺满面板，原 `position:absolute;inset:0` 由 `layout-page` 的铺满样式承担，场景根不再单独声明绝对定位。

`page-layers.json` 和组件契约中的 `mountHost: "scene-root"` 只是抽象挂载标识，守卫与契约引用时必须映射到上述真实面板选择器，不得引用不存在的 `.scene-root` 类。

#### 建议结构

```html
<div class="layout-page" data-component-slug="layout-page">
  <div class="layout-page__top"></div>
  <div class="layout-page__body"></div>
  <div class="layout-page__bottom"></div>
</div>
```

`top`、`bottom` 可选，`body` 必须存在。

---

### 4.2 `layout-scroll`

页面唯一主纵向滚动区域。

#### 职责

- 提供主 `overflow-y`；
- 禁止横向溢出；
- 隔离滚动链；
- 处理基础底部空间；
- 与 `WegoScrollLayout` 绑定；
- 接收 sticky 和 fixed 区域的实际遮挡补偿。

#### 约束

- 一个页面默认只能存在一个 `layout-scroll`；
- 场景不得自行创建第二个纵向滚动容器；
- 横向滚动必须使用 `layout-scroll-row`；
- 主滚动区保持通栏，不承担统一业务内容边距。

#### modal 与 overlay 的滚动豁免

唯一 `layout-scroll` 约束只针对场景主页面。`full-screen-modal`（如 `biz-rule-config`、`entity-form`）和其它 overlay 内部承载的是独立的模态层，不属于场景主页面：

- `layout-scroll` 唯一性约束的范围是单个场景面板内部；
- modal 组件内部若需要滚动，由 modal 组件自身约定，不计入"第二个 `layout-scroll`"；
- 守卫判断 `layout-scroll` 数量时，必须排除处于 `modal`、`dialog`、`actionsheet`、`overlay` 宿主内部的节点。

---

### 4.3 `layout-section`

页面主滚动区中的大型信息分区。

#### 职责

- 表达一整段信息区域的边界；
- 管理页面边距模式；
- 管理 Section 前后间距；
- 表达通栏或内容宽度；
- 为内部 Layout 或业务组件提供槽位。

#### 第一阶段属性

- `edge`: `M0 | M8 | M32`
- `width`: `full | content`
- `gap-before`: 正式 Spacer Token
- `gap-after`: 正式 Spacer Token

沿用现有页面边距 Token，不新增第二套边距体系。

---

### 4.4 `layout-flow`

同一区域中的线性排列组件。

#### 职责

- 纵向排列；
- 横向排列；
- 子项对齐；
- 子项间距；
- 是否换行；
- 主轴分布。

#### 第一阶段属性

- `direction`: `vertical | horizontal`
- `gap`: 正式 Spacer Token
- `align`: `start | center | end | stretch`
- `justify`: `start | center | end | between`
- `wrap`: `nowrap | wrap`

不得使用 `stack` 命名，因为当前仓库中的 `stack` 已经是方块式选择组件。

#### 与 `form` 组件的边界

`form` 组件已承载表单字段的纵向分组与排列，`layout-flow direction="vertical"` 会与之职责重叠。边界约定：

- 表单字段的分组排列用 `form`，不使用 `layout-flow`；
- 非表单信息（说明区、操作区、多卡片堆叠等）的纵向排列用 `layout-flow`；
- 一个 Section 内部不应同时出现 `form` 与 `layout-flow` 重复承担纵向分组。

---

### 4.5 `layout-split`

具有明确主次关系的双区分栏。

#### 职责

- 表达左右双区；
- 表达主次比例；
- 管理双区间距与对齐；
- 在小空间下按正式规则转为上下排列。

#### 第一阶段属性

- `ratio`: `1-1 | 2-1 | 1-2`
- `gap`: 正式 Spacer Token
- `align`: `start | center | end | stretch`
- `collapse`: `none | vertical`

第一阶段不开放任意比例。

---

### 4.6 `layout-grid`

多个同类信息区域的多栏布局。

#### 职责

- 等宽 2、3、4 栏；
- 管理行列间距；
- 管理子项对齐；
- 小空间下按正式变体换行。

#### 第一阶段属性

- `columns`: `2 | 3 | 4`
- `column-gap`: 正式 Spacer Token
- `row-gap`: 正式 Spacer Token
- `align`: `start | center | stretch`

第一阶段不开放任意 `grid-template-columns`、跨栏和自由列宽。

---

### 4.7 `layout-scroll-row`

页面内部的横向滚动信息区。

#### 职责

- 横向滚动；
- 触控惯性；
- 子项间距；
- 是否露出下一项；
- Scroll Snap；
- 保持页面纵向主滚动所有权。

#### 第一阶段属性

- `item-size`: `auto | compact | medium | wide`
- `gap`: 正式 Spacer Token
- `snap`: `none | start`
- `peek`: `none | next`

适用于分类、卡片预览、媒体条目等同类信息，不用于必须一次看全的核心数据。

---

### 4.8 复用 `sticky-region`

现有 `sticky-region` 继续负责：

- 始终吸顶；
- 达到阈值后吸顶；
- 滚动压缩；
- 滚动方向显隐；
- 滚动后提升层级；
- 多个 sticky 区域的偏移和遮挡计算。

不新增 `layout-sticky`。

---

## 5. 第一阶段明确不新增的组件

### 5.1 不新增通用 `Box`

通用 Box 自由度过高，容易让 AI 通过属性重新发明页面结构。场景级容器统一使用 `layout-section`。

### 5.2 不新增 `layout-fixed-region`

页面固定区域只能来自正式能力：

- `navbar`；
- `bottom-nav`；
- `bottom-action-bar`；
- `sticky-region`；
- App Overlay 宿主。

禁止业务场景自行创建通用 fixed 区域。

### 5.3 暂不新增 `layout-list`

列表包含对象结构、状态、操作和加载行为，不只是几何布局。第一阶段使用：

```text
layout-section
└── layout-flow direction="vertical"
    └── 正式列表项或业务对象组件
```

### 5.4 暂不新增 `layout-bleed`

第一阶段优先通过 `layout-section edge="M0"` 表达通栏区域。只有真实场景出现“同一 Section 内局部突破边距”的稳定需求后再新增。

---

## 6. AI 布局决策流程

### 6.1 页面整体框架

AI 先判断：

- 是否有顶部导航或顶部工具区；
- 是否有底部导航或底部操作栏；
- 哪个区域是主滚动区；
- 是否存在 sticky、动态显示或 Overlay。

输出第一层 `layout-page` 结构。

### 6.2 主内容区纵向分段

AI 将 `layout-scroll` 从上到下拆分为 2–6 个大型 `layout-section`，确定：

- 区域顺序；
- 页面边距模式；
- Section 间距；
- 是否跟随滚动；
- 是否由 `sticky-region` 承载。

### 6.3 Section 内部主要排列

每个 Section 只能从以下大型排列中选择：

- 单向连续排列：`layout-flow`；
- 双区主次排列：`layout-split`；
- 多个同类区域：`layout-grid`；
- 横向浏览区域：`layout-scroll-row`。

完成第三层后停止拆分，再将业务信息和正式组件填入槽位。

### 6.4 `sticky-region` 与 Section 的嵌套关系

`sticky-region` 不属于 Section 内部排列，而是 `layout-scroll` 内部、Section 之间的同级通栏元素：

- `sticky-region` 必须通栏（见 `sticky-region.json`），禁止放进带横向边距的 Section；
- 正确位置：`layout-scroll` 的直接子级，位于两个 `layout-section` 之间；
- `layout-section` 的 `edge=M8/M32` 边距只作用于业务内容，不包裹 `sticky-region`；
- `layout-scroll` 内部允许出现的直接子级只有：`layout-section` 与 `sticky-region` 两类。

```text
layout-scroll
├── layout-section
├── sticky-region        ← 通栏，与 section 同级
├── layout-section
└── sticky-region
```

---

## 7. UI Kit 改造

### 7.1 UI Kit 与 Layout 的关系

UI Kit 负责沉淀已验证的页面范式和布局经验；Layout 组件负责实现这些页面结构。

- 精确命中 UI Kit：继承 UI Kit 已验证的 Layout 组件树；
- 未精确命中 UI Kit：AI 使用正式 Layout 组件自主搭建 2–3 层信息框架；
- 不允许先自由布局，再选择“最接近”的 UI Kit；
- 不允许组合多个 UI Kit。

### 7.2 `uikit-plan.json` 增加 `layoutTree`

每个页面范式登记机器可读的 2–3 层 Layout 结构，例如：

```json
{
  "layoutTree": {
    "component": "layout-page",
    "children": [
      { "component": "navbar" },
      {
        "component": "layout-scroll",
        "children": [
          {
            "component": "layout-section",
            "children": [
              { "component": "layout-flow", "variant": { "direction": "vertical" } }
            ]
          }
        ]
      }
    ]
  }
}
```

### 7.3 UI Kit 迁移要求

- 将现有 UI Kit HTML 改为正式 Layout 组件树；
- `layoutTree` 必须与真实 HTML 结构一致；
- 页面范式只登记 2–3 层大框架，不登记业务组件内部细节；
- 页面范式命中后，AI不得自行改变主滚动、Section 顺序和主要分栏关系，除非正式约束证明其不可用。

---

## 8. 设计消费链改造

将现有消费链调整为：

```text
已确认 prototype_brief
→ 设计原则
→ 交互原型设计方法
→ 明确页面必须承载的信息
→ 精确判断是否命中 UI Kit

命中：
→ 继承 UI Kit 的正式 Layout 组件树

未命中：
→ 使用正式 Layout 组件搭建 2–3 层大型信息框架

→ 将信息分配到 Layout 槽位
→ 定位业务组件
→ 读取组件 Preview 与契约
→ 查询实际 Token
→ 接入唯一 App 宿主
→ 读取 scene-contract
→ 执行源码与真实浏览器验证
```

原有“建立语义区域顺序、确定滚动固定关系”应升级为：

> 获得或搭建正式 Layout 组件树，并将页面信息分配到布局槽位。

---

## 9. 文件改造范围

### 9.1 新增组件资产

每个新 Layout 组件需要新增：

- `.codex/skills/wego-design/components/{slug}.json`
- `.codex/skills/wego-design/preview/component-{slug}.html`
- `.codex/skills/wego-design/components.css` 中的正式实现
- `wego-app/lib/components.css` 的交付副本

组件清单：

- `layout-page`
- `layout-scroll`
- `layout-section`
- `layout-flow`
- `layout-split`
- `layout-grid`
- `layout-scroll-row`

#### Spacer Token 白名单

计划中所有 `gap`、`column-gap`、`row-gap`、`gap-before`、`gap-after` 值只能取自 `colors_and_type.css` 中实际声明的 `--spacer-*` Token。阶段 1 合同必须列出可用枚举（如 `--spacer-0`、`--spacer-4`、`--spacer-8`、`--spacer-12`、`--spacer-16`、`--spacer-24`、`--spacer-32`），AI 不得按名称猜测或自造数值。

### 9.2 更新索引与消费规则

需要修改：

- `.codex/skills/wego-design/components/index.json`
- `.codex/skills/wego-design/library-consumption.json`
- `.codex/skills/wego-design/references/interaction-prototype-design.md`
- `.codex/skills/wego-design/references/scene-contract.md`
- `.codex/skills/wego-design/uikit-plan.json`
- `.codex/skills/wego-design/page-layers.json`（仅补充与 Layout 组件的职责映射，不改变层级模型）
- `.codex/skills/wego-design/SKILL.md`

#### 版本递增（同步矩阵要求）

按 `sync-matrix.runtime.md`「正式设计系统源变化必须递增 metadata 版本」，本次改动必须递增受影响资源的 `schemaVersion`：

- `components/index.json`（当前 4）
- `components/index.json` 的 `componentContractSchemaVersion`（当前 4，若组件契约 Schema 未变则不动）
- `uikit-plan.json`（当前 5，新增 `layoutTree` 字段）
- `library-consumption.json`（当前 7，新增 Layout 组件消费层与守卫规则）
- `page-layers.json` 仅补充职责映射，若不改 Schema 可不递增，但需在变更说明中标注。

### 9.3 更新验证脚本

重点涉及：

- `scripts/validate-scene-contract.mjs`
- `scripts/validate-scene-runtime.mjs`
- 组件索引、Preview 和契约相关测试脚本
- `WegoScrollLayout` 相关测试

#### 同步脚本文档与定向回归测试

按 `sync-matrix.md`「工作流守卫调整 | 实际执行脚本 | 统一验证入口与脚本文档 | 对应回归测试」，除主守卫外还必须同步：

- `scripts/README.md`：登记新增的 Layout 守卫与运行时机；
- `scripts/test-scroll-layout.mjs`：`layout-scroll` 接入 `WegoScrollLayout` 后补回归；
- `scripts/test-scene-contract-tools.mjs`：场景守卫新增 `layout-page` 唯一、`layout-scroll` 唯一、CSS 禁止项后补回归；
- `scripts/test-sync-wego-app-lib.mjs`：新增 7 个组件交付副本同步后补回归。

### 9.4 迁移现有资产

- 三个已登记 UI Kit；
- 现有业务场景中的页面外层布局；
- 现有场景 CSS 中直接定义的页面级 Flex、Grid、滚动、sticky 和 fixed 结构。

---

## 10. 源码守卫

### 10.1 必须检查

1. 场景根必须使用 `layout-page`；
2. 页面必须存在且只能存在一个主 `layout-scroll`；
3. 主滚动区中的大型内容分区必须使用 `layout-section`；
4. 场景级横向、纵向、分栏、Grid 和横向滚动必须使用正式 Layout 组件；
5. sticky 必须使用 `sticky-region`；
6. UI Kit 页面实际 DOM 必须匹配登记的 `layoutTree`；
7. 主滚动区必须正确避让顶部、sticky 和底部固定区域；
8. 375px 和 393px 视口不得出现横向溢出；
9. Layout 组件实例必须声明正确的 `data-component-slug`；
10. Layout 变体必须符合对应组件契约。

### 10.2 场景 CSS 禁止项

守卫只拦截**场景根直接子级、且未声明任何 `data-component-slug` 的容器**。对这类场景级容器，禁止直接声明：

```css
display: flex;
display: grid;
grid-template-columns: ...;
grid-template-rows: ...;
flex-direction: ...;
flex-wrap: ...;
gap: ...;
position: sticky;
position: fixed;
overflow-x: auto;
overflow-y: auto;
```

判断边界与豁免：

- 已声明 `data-component-slug` 的正式组件（包括业务组件与 Layout 组件）内部 CSS 不受此限制；
- 挂载在 `modal`、`dialog`、`actionsheet`、`overlay` 宿主内部的容器按各自组件约定，不计入场景级容器；
- 守卫按 DOM 所属的 `data-component-slug` 判定边界，不靠选择器名称猜测，避免误伤卡片内部、cell 行内等合法局部 flex。

#### 守卫落地方式

现有 `validate-scene-contract.mjs` 是「CSS 文本扫描 + HTML 模板解析」混合，已有扫描 `overflow`/`sticky` 声明的先例，但**无法从 CSS 选择器文本反推该规则是否落在已声明 `data-component-slug` 的组件 DOM 内部**（CSS 选择器不携带组件边界信息）。因此 10.2 守卫落地退化为：

- 只拦截「场景根模板直接子级容器」对应的 CSS 选择器（即 scene.css 中作用于模板根直接子级的规则）；
- 不尝试按 slug 反查组件内部 CSS 边界；
- 正式组件自身的 CSS 由 `validate-component-contract-parity.mjs` 在组件层校验，不归场景守卫。

### 10.3 场景 CSS 保留职责

场景 CSS 仅负责：

- 业务状态类；
- 非结构性内容表现；
- Layout 组件公开的正式变量；
- 少量不可组件化的业务胶水。

页面区域关系、主滚动、分栏、网格、横向滚动、sticky 和 fixed 不再属于场景 CSS 职责。

---

## 11. 实施阶段

### 阶段 1：定义合同

- 完成 7 个 Layout 组件的职责、结构、变体和禁止项；
- 确认 Layout 与 `page-layers.json`、`WegoScrollLayout`、App 宿主的关系；
- 明确 Layout 规划只拆 2–3 层。

#### 完成标准

- 每个组件均有稳定职责；
- 不存在组件职责重叠；
- 不开放任意 CSS 式属性；
- 现有 `sticky-region` 和固定组件职责不被重复实现。

### 阶段 2：实现组件

- 创建 Preview、契约和 CSS；
- 加入组件索引；
- 更新交付副本；
- 为 Layout 组件补齐 DOM 和变体验证；
- **先落地守卫基础版**：至少实现「场景根必须使用 `layout-page`」和「页面只能存在一个 `layout-scroll`」两条红灯，迁移前先有约束。

#### 完成标准

- 所有组件 Preview 可独立运行；
- 组件 DOM 与契约一致；
- 375px 和 393px 下无横向溢出；
- Layout 组件可组合形成完整页面框架。

### 阶段 3：接通滚动架构

- `layout-scroll` 接入 `WegoScrollLayout`；
- 统一 sticky 和 fixed 区域注册方式；
- 验证安全区、顶部遮挡和底部遮挡。

#### 完成标准

- 页面只有一个主纵向滚动区；
- 多 sticky 区域偏移正确；
- 底部固定栏不遮挡正文；
- 动态高度变化后滚动避让仍正确。

### 阶段 4：改造设计方法和消费链

- 更新 `SKILL.md`；
- 更新 `interaction-prototype-design.md`；
- 更新 `library-consumption.json`；
- 明确 UI Kit 匹配发生在自主 Layout 规划之前。

#### 完成标准

- AI 在组件选择前先生成 Layout 树；
- 未命中 UI Kit 时只拆 2–3 层；
- Layout 树完成后才定位业务组件和 Token。

### 阶段 5：迁移 UI Kit

- 为三个现有页面范式增加 `layoutTree`；
- 将 UI Kit HTML 迁移为正式 Layout 组件；
- 增加 `layoutTree` 与真实 DOM 一致性校验。

#### 完成标准

- 精确命中 UI Kit 后可直接继承布局；
- UI Kit 不再依赖场景级自由布局 CSS；
- 页面范式只登记大框架，不越权登记业务组件内部布局。

### 阶段 6：迁移现有业务场景

- 扫描场景 CSS 中的页面级 Flex、Grid、滚动、sticky 和 fixed；
- 按 Layout 组件职责逐步迁移；
- 删除被 Layout 组件替代的场景布局 CSS。

#### 完成标准

- 所有现有场景均使用 `layout-page`；
- 每个页面只有一个 `layout-scroll`；
- 大型信息区域均由 `layout-section` 划分；
- 场景 CSS 不再拥有页面布局结构。

### 阶段 7：补齐守卫和压力测试

- 更新源码验证；
- 更新浏览器运行时验证；
- 选择复杂信息首页作为未命中 UI Kit 的压力测试；
- 使用已有表单、设置等页面验证 UI Kit 命中路径。

#### 完成标准

- 非法场景布局 CSS 能被阻止；
- 非法多滚动容器能被发现；
- UI Kit `layoutTree` 不一致能被发现；
- AI 能只使用正式 Layout 组件完成复杂信息首页的 2–3 层框架。

---

## 12. 验收标准

### 12.1 结构验收

- 页面所有大型布局由正式 Layout 组件实现；
- 每个场景有且只有一个主纵向滚动区；
- 页面整体结构最多规划 3 层；
- Section 内部只使用受支持的正式 Layout 组件；
- 业务组件内部布局不被 Layout 系统接管。

### 12.2 AI 输出验收

给定一个未命中 UI Kit 的复杂信息首页需求，AI 必须先输出：

- 页面顶部、正文、底部结构；
- 主滚动范围；
- 固定、吸顶和动态区域；
- 主内容区纵向分段；
- 每段的主要横向或纵向布局；
- 对应 Layout 组件树。

AI 不得在该阶段继续拆解标题、图标、按钮和文案细节。

### 12.3 运行时验收

- 375px、393px 视口无横向溢出；
- sticky、fixed 和底部栏不遮挡正文；
- 横向滚动不抢占页面纵向滚动；
- 安全区只有一个所有者；
- 页面切换和动态高度变化后布局仍稳定。

### 12.4 维护验收

- 新增页面不需要在场景 CSS 中重新实现页面布局；
- 新的稳定布局需求优先扩展现有 Layout 组件变体；
- 只有出现无法被现有组件表达且在多个场景复用的结构时，才新增 Layout 组件；
- 单一业务页面的特殊结构不得直接升级为通用 Layout 组件。

---

## 13. 风险与控制

### 13.1 过度禁止场景 CSS

风险：业务组件内部或局部内容排列可能被误判为页面布局。

控制：守卫只检查场景级容器和明确的页面结构选择器；正式组件内部 CSS 不受限制。必要时根据 DOM 所属的 `data-component-slug` 判断边界。

### 13.2 Layout 属性过于自由

风险：Layout 组件退化成组件化 CSS 工具，AI仍可任意拼装。

控制：第一阶段只提供有限枚举，不开放任意比例、任意列模板和任意数值。

### 13.3 Layout 属性过少

风险：真实页面无法表达，场景再次回退到自由 CSS。

控制：先用复杂信息首页、表单页、设置页和对象列表页做压力测试；仅根据真实缺口增加受控变体。

### 13.4 与现有宿主结构重复

风险：`layout-page` 与 `host-shell-page`、`scene-root` 职责重叠。

控制（已定结论）：`layout-page` 只存在于场景面板内部，不创建第二个宿主，不接管全局路由和 Overlay。真实边界见 4.1「与 App 宿主的 DOM 边界」：`layout-page` 套在 `.app-scene-layer__panel` / `.host-shell-page__panel` 内，面板关闭自身 `overflow-y`，滚动权交给唯一 `layout-scroll`。三者 DOM 边界为：宿主 shell → 场景面板（承载 + 滚动权移交）→ `layout-page`（骨架）→ `layout-scroll`（主滚动）。

### 13.5 UI Kit 迁移后过度固化

风险：页面范式的 `layoutTree` 过细，限制业务内容适配。

控制：`layoutTree` 只登记 2–3 层大型结构和滚动关系，不登记业务组件内部结构。

---

## 14. 后续跟进清单

- [ ] 确认 `layout-page` 与现有 App 宿主 DOM 的最终边界；
- [ ] 完成 7 个 Layout 组件合同；
- [ ] 完成 7 个 Layout 组件 Preview；
- [ ] 完成 Layout CSS 正式实现；
- [ ] 更新组件索引；
- [ ] 更新 `library-consumption.json`；
- [ ] 更新 `interaction-prototype-design.md`；
- [ ] 更新 `SKILL.md`；
- [ ] 更新 `scene-contract.md`（重写区域关系/滚动职责与场景根定位规则）；
- [ ] 递增 `index.json`/`uikit-plan.json`/`library-consumption.json` 的 `schemaVersion`；
- [ ] 补充至少 2 个场景布局缺口证据；
- [ ] 更新 `scripts/README.md` 与三个定向回归测试；
- [ ] 列出 Layout 组件可用的 Spacer Token 白名单；
- [ ] 守卫基础版（layout-page 唯一、layout-scroll 唯一）随阶段 2 落地；
- [ ] 迁移三个现有 UI Kit；
- [ ] 扫描并迁移现有场景布局；
- [ ] 增加非法布局 CSS 守卫（仅拦截未声明 `data-component-slug` 的场景级容器）；
- [ ] 增加唯一主滚动区守卫（排除 modal/overlay 内部）；
- [ ] 增加 UI Kit Layout Tree 一致性守卫；
- [ ] 增加 375px、393px 浏览器验证；
- [ ] 使用复杂信息首页完成未命中 UI Kit 压力测试；
- [ ] 使用现有表单或设置页完成 UI Kit 命中路径验证。

---

## 15. 完成定义

本计划完成的标志不是新增了若干 CSS 类，而是满足以下结果：

1. AI 在填充内容前能够先产出明确的 2–3 层页面信息框架；
2. 该框架完全由正式 Layout 组件表达；
3. UI Kit 和自主布局使用同一套 Layout 实现语言；
4. 场景 CSS 不再承担页面布局结构；
5. 页面滚动、固定、吸顶、安全区和遮挡避让能够通过统一合同与守卫验证；
6. 新增复杂页面时，不需要再次自由发明页面骨架；
7. 场景面板自身不再保留 `overflow-y`，滚动权唯一归属于 `layout-scroll`。
