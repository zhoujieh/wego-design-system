# wegoux 规则优化计划（基于业务设置 UIKit 问题反馈）

## 背景

基于业务设置 UIKit 页面（`ui_kits/biz-settings/index.html`）暴露出的 5 个问题，梳理并确认了 wegoux 设计系统中 4 项需要优化的规则。本计划在用户确认规则方向后执行。

---

## 已确认的规则方向

### 1. Navbar 全屏模态模式化（问题 1）

**结论**：全屏模态页面只有 2 种固定的导航模式，写死成模式让 AI 直接调用，避免组合错误。

| 模式 | 左侧控件 | 右侧操作 | 适用场景 |
|------|----------|----------|----------|
| 模式 A：取消 + 按钮 | 文本"取消" | 实心按钮（如"保存"、"完成"） | 底部弹出的表单/设置页 |
| 模式 B：叉 + 图标 | 关闭叉图标 | 图标操作（可多个） | 底部弹出的浏览/选择页 |

**当前问题**：
- biz-settings 页用了 `navbar__right--text`（文本保存），但按模式 A 应该用 `navbar__right--button` + `btn--strong`

**优化内容**：
- 在 navbar 组件契约的 `representativeVariants` 和 `behavior` 中明确这两种全屏模态模式
- 在 navbar 预览页的示例中明确标注"全屏模态模式 A / 模式 B"
- 更新 `usageHints`，强调"全屏模态页直接调用模式，不要自由组合左右控件"

---

### 2. 导航栏背景色与页面背景联动（问题 2）

**结论**：导航栏背景色必须跟随页面背景色联动（页面灰则导航栏灰，页面白则导航栏白）。规则需要通过 UI Kit 场景让 AI 学习到。

**联动机制**：
- navbar 背景色不再硬编码 `--bg-surface`，改为继承或跟随页面背景变量
- 页面通过 `data-bg` 属性声明背景类型（`surface` = 白 / `page` = 灰）
- navbar 根据页面 `data-bg` 自动适配背景色

**页面背景色选择规则**（需要在 UI Kit 中通过场景体现）：
- 列表页、设置页、表单页：灰色背景（`bg-page`），内容区块用白色卡片
- 详情页、空白页、入口页：白色背景（`bg-surface`）
- 每个页面单独定义背景色，不做二级页面继承约束

**优化内容**：
- navbar 组件新增背景色自适应机制（通过 `data-bg` 属性选择器）
- 在 `colors_and_type.css` 中完善页面背景相关的 CSS 变量体系
- 后续通过新增场景 UI Kit（灰色背景列表页、白色背景详情页等）让 AI 学习
- 在 `specs/布局与间距规范.md` 中补充页面背景选择规则

---

### 3. cell / form 对齐方式（问题 3）

**结论**：不需要页面级统一，cell 和 form 各自决定对齐方式。

**说明**：
- 问题 3 不是规则漏洞，而是 biz-settings 页面自身的实现需要调整
- form 组件已有 `right-align` 变体及其规则（前缀字段、成组选项等场景自动回退左对齐）
- cell 组件暂无对齐变体需求

**后续动作**：无组件规则变更，仅调整 biz-settings 页面实现。

---

### 4. 安全区统一处理（问题 4 + 问题 5）

**结论**：顶部状态栏（phone-status）和底部指示器（phone-indicator）统一改为悬浮透明、不占位；内容区需加安全间距；状态栏背景跟随导航栏透出。

**PC 预览与手机端统一策略**：
- 设计系统 Token 统一使用 `env(safe-area-inset-*, 44px)` 带 fallback 值的写法
- **手机端真机运行**：自动使用系统动态获取的安全区高度（由 `env()` 生效）
- **PC 预览**：fallback 到默认值（top: 44px, bottom: 34px），同时 scaffold.css 里的模拟 status bar / indicator 仅作为视觉展示
- 这样用设计系统生成的页面，无论在 PC 还是手机上都能正确工作，不需要两套规则

#### 顶部安全区（phone-status）
- `position: absolute` 悬浮在顶部，不占布局空间
- 背景透明，由下方导航栏/页面背景透出颜色
- 高度 Token：`--safe-area-top: env(safe-area-inset-top, 44px)`
- navbar 组件顶部不内置 status-bar 间距，由页面外壳统一处理
- 页面内容顶部安全间距 = `--safe-area-top` + navbar 高度

#### 底部安全区（phone-indicator）
- `position: absolute` 悬浮在底部，不占布局空间
- 背景透明
- 高度 Token：`--safe-area-bottom: env(safe-area-inset-bottom, 34px)`
- 可滚动内容底部安全间距：`40px + var(--safe-area-bottom)`
- 底部固定元素（如 bottom-nav、固定按钮）底部 padding 增加 `var(--safe-area-bottom)`

#### 新增安全区 Token
- `--safe-area-top: env(safe-area-inset-top, 44px)`
- `--safe-area-bottom: env(safe-area-inset-bottom, 34px)`
- `--safe-area-bottom-content: calc(40px + var(--safe-area-bottom))`（内容底部推荐间距）

**优化内容**：
- 更新 `scaffold.css`：phone-status、phone-indicator 改为悬浮透明模式
- 新增安全区 CSS Token 到 `colors_and_type.css`
- 更新 `specs/预览页脚手架规范.md`：补充安全区规则
- 同步更新所有 UI Kit 页面（biz-settings、app 等）的安全区处理

---

## 执行步骤

### 阶段一：Token 与规范层
1. 在 `colors_and_type.css` 中新增安全区相关 Token
2. 更新 `css.json` 同步机器可读投影
3. 在 `specs/布局与间距规范.md` 补充页面背景选择规则
4. 更新 `specs/预览页脚手架规范.md` 补充安全区规则

### 阶段二：组件层
5. 更新 navbar 组件：
   - 新增全屏模态两种模式的说明
   - 新增背景色自适应（通过 `data-bg` 或 CSS 变量）
   - 更新组件契约 `navbar.json`
   - 更新预览页 `preview/component-navbar.html`
6. 重新生成 `components.css`

### 阶段三：脚手架与 UI Kit
7. 更新 `scaffold.css`：phone-status / phone-indicator 改为悬浮透明模式
8. 更新 `ui_kits/biz-settings/index.html`：
   - 导航栏改为模态模式 A（取消+按钮）
   - 导航栏背景跟随页面（灰色背景页→灰色导航栏）
   - 安全区改为悬浮模式
9. 检查并更新 `ui_kits/app/index.html` 的安全区处理

### 阶段四：同步与验证
10. 同步 `library-consumption.json` 和 `uikit-plan.json`
11. 同步 `README.md` / `SKILL.md` 如有影响
12. 递增 `metadata.json` 版本号
13. 本地静态服务验证预览页和 UI Kit 显示正常

---

## 涉及文件清单

| 文件 | 变更类型 |
|------|----------|
| `colors_and_type.css` | 新增安全区 Token |
| `css.json` | 同步 Token |
| `scaffold.css` | 安全区改为悬浮模式 |
| `specs/布局与间距规范.md` | 补充页面背景规则 |
| `specs/预览页脚手架规范.md` | 补充安全区规则 |
| `components/navbar.json` | 新增模态模式、背景色自适应 |
| `preview/component-navbar.html` | 新增模式示例、背景色变体 |
| `components.css` | 重新生成 |
| `ui_kits/biz-settings/index.html` | 修正 navbar 样式 + 安全区 |
| `ui_kits/app/index.html` | 安全区适配 |
| `metadata.json` | 版本递增 |

---

## 风险说明

1. **UI Kit 改造范围**：安全区改为悬浮模式后，所有 UI Kit 页面的内容布局都需要调整底部间距，避免内容被指示器遮挡。
2. **navbar 背景色兼容性**：改背景色为自适应后，需确保所有引用 navbar 的地方都有正确的页面背景上下文，避免出现背景色丢失。
3. **现有预览页影响**：component 预览页的 navbar 示例可能也需要同步调整背景色展示方式。
