# 好友列表恢复 需求规格说明

## 元信息

- **迭代 ID**：friend-list-restore
- **主场景**：好友列表
- **关联场景**：无
- **创建日期**：2026-08-19
- **状态**：prototyping
- **输入来源**：

---

## 目标（goal）

恢复好友 tab 功能，让好友列表场景在最新代码里重新可用。复用 7月16日已删除的完整好友列表代码（设计系统412），实现阶段适配最新设计系统版本。

---

## 纳入范围（included）

- 好友列表主页面（haoyou tab 宿主面板）
- 字母排序：按拼音首字母 A-Z + # 分组
- 自定义分组排序：VIP客户/普通客户/待跟进等分组聚合
- 排序模式切换：导航栏右侧入口切换字母/分组排序
- 搜索过滤：按昵称实时过滤
- 右侧悬浮索引：字母或分组名快速定位
- 添加好友全屏表单
- 提交成功 toast 反馈
- 空状态：列表空与搜索无结果

---

## 不纳入范围（excluded）

- 好友详情页
- 好友相册浏览
- 后端持久化（用 localStorage 本地模拟）
- 其他 tab 场景

---

## 入口（entry_points）

- 底部导航栏「好友」tab（haoyou），点击进入好友列表主页面

---

## 关键路径（critical_paths）

- 浏览好友列表：进入好友 tab → 默认字母排序展示列表 → 右侧悬浮索引定位
- 切换排序：点击导航栏右侧排序入口 → 字母/分组排序切换 → 列表重新分组
- 搜索好友：搜索框输入关键词 → 实时过滤匹配昵称 → 清空回到列表
- 添加好友：点击搜索框右侧加号 → 全屏表单 → 填写提交 → 成功 toast + 列表新增

---

## 原型边界（prototype_boundaries）

### friend-list-browse

- mode: functional
- visible_result: 用户进入好友 tab 看到好友列表，可切换排序、搜索、右侧索引定位

### friend-add

- mode: functional
- visible_result: 用户提交添加好友表单后看到成功 toast 且列表新增好友

---

## 状态（states）

- list-ready：进入好友 tab，默认字母排序展示好友列表+右侧索引
- sort-by-letter：字母排序，A-Z + # 分组
- sort-by-group：分组排序，自定义分组聚合
- searching：输入关键词实时过滤
- search-empty：搜索无结果空状态
- add-form：打开添加好友全屏表单
- submit-success：提交成功，toast + 列表新增

---

## 数据契约（data_contract）

### friend

- 值: friend_id, nickname, py_initial(拼音首字母), group_id, new_count(上新数), product_total(总商品数)

### group

- 值: group_id, group_name

### persistence

- 值: localStorage 本地模拟，无后端

---

## 假设（assumptions）

- 复用7月16日好友列表代码（设计系统412），实现阶段适配最新设计系统版本（可能更新 token/组件契约）
- 数据用内置种子 + localStorage 模拟，无后端
- 好友头像用现有 avatar 资源或占位图

---

## 待确认问题（open_questions）


---

## 澄清记录（Clarifications）

<!-- 迁移自 JSON 简报，无澄清记录 -->
