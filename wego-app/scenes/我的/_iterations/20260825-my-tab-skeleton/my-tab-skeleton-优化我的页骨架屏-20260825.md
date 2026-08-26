# 优化我的页骨架屏 需求规格说明

## 元信息

- **迭代 ID**：my-tab-skeleton
- **主场景**：我的
- **关联场景**：无
- **创建日期**：2026-08-25
- **状态**：prototyping
- **输入来源**：用户需求（对话确认）

---

## 目标（goal）

重构「我的」页骨架屏，使其符合常规加载范式：先显示与真实布局一一对应的骨架占位，内容就绪后原位渐显过渡；骨架按真实 DOM 结构语义化绘制，替换当前 41 个绝对定位百分比裸色块覆盖层。

---

## 纳入范围（included）

- 骨架屏改为按真实结构绘制：navbar（头像圆 + 昵称/角色两行 + 设置/分享 icon）、会员中心卡、数据资产卡（网格入口）、内容管理区（搜索栏 + tab + 九宫格/列表占位）
- 复用设计系统 .wg-skeleton 原子块（circle/text/rect）+ 布局类，对齐动态页 album-feed__skeleton 的语义化写法
- 保留『先骨架→内容渐显』时序：进入页首帧显示结构骨架，init 同步渲染内容后骨架移除、内容 scene-fade-in 渐显
- 骨架模式由 explicit 全页覆盖改为只覆盖内容区（navbar 等模板静态结构常驻不闪），内容区用 region 模式 setRegion 淡入
- 内容区切换产品/笔记/直播 tab 时，content region 重新 setRegion 淡入而非全页骨架
- 数据产生通道沿用现有发布流程（发布产品/笔记/直播 → 写入我的页内容管理），本次仅改造骨架呈现层，不新增数据通道

---

## 排除范围（excluded）

- 动态、好友、帮卖等其他 tab 的骨架屏（本次只改「我的」页）
- 真实内容布局与业务逻辑改动（仅骨架呈现层）
- 内容区失败态/空状态的模板新增（若当前无对应模板，不在本次范围；仅保证加载态骨架正确）

---

## 入口（entry_points）

- 底部 Tab「我的」直挂（host-tab），进入即触发骨架

---

## 关键路径（critical_paths）

- 进入我的页（host-tab 直挂）：首帧显示结构化骨架（navbar 常驻 + 内容区按区块占位）→ init 同步渲染真实内容 → 骨架移除、内容 scene-fade-in 渐显，无全页闪烁 [P1]
- 内容区切换产品/笔记/直播 tab：content region 重新 setRegion 淡入新内容，不触发全页骨架

---

## 原型边界（prototype_boundaries）

| flow_id | mode | visible_result |
|---|---|---|
| enter-my-tab | functional | 用户看到结构对齐的骨架渐变为真实内容 |
| switch-content-tab | functional | 用户切换内容 tab 看到内容区淡入 |

---

## 页面状态（states）

- default：进入「我的」页且内容就绪 → 完整显示 navbar（头像/昵称/角色/设置/分享）+ 会员中心卡 + 数据资产卡 + 内容管理区（真实内容）
- loading：进入页首帧或内容区数据未就绪 → 显示按真实结构绘制的骨架占位（navbar 常驻，内容区按区块骨架），随后内容 scene-fade-in 渐显
- loaded：init 同步渲染完成 → 骨架移除，真实内容淡入显示
- failed：内容区加载/渲染失败 → 显示失败提示 + 重试入口（沿用现有 loadFailedTemplate 模式）
- empty：内容区某 tab 无数据 → 显示空结果引导（沿用现有空态，本次仅保证骨架不覆盖该态）
- search-empty：内容区搜索无匹配 → 显示搜索空结果引导（沿用现有空态）

---

## 数据契约（data_contract）

- source: prototype-db（真实字段，无静态种子降级）
- note: 骨架本身不依赖业务数据，纯结构占位；真实内容由 init 从 prototype-db 读取后渲染

---

## 假设（assumptions）

- 框架 setRegion 已内置 scene-fade-in 淡入与骨架移除机制，内容区改用 region 模式即可复用，无需自写过渡
- navbar 作为模板静态结构挂载即显示，不进骨架（符合常规 App 体验）

---

## 待定问题（open_questions）

无
