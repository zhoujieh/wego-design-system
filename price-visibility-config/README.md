# 价格权限设置原型

任务目录：`price-visibility-config/`

直接打开 `index.html` 即可预览。页面会模拟从商品编辑页打开“价格权限”全屏模态，并覆盖以下链路：

- 单选主规则：公开、私密、部分可见、不给谁看
- 私密条件：设置自动公开时间
- 分组条件：在二级页按粉丝分组多选
- 新增分组：在二级页继续创建新粉丝分组
- 保存闭环：localStorage 持久化、宿主页摘要回填、保存提示

页面结构：

- `index.html`：宿主页入口
- `pages/price-permission.html`：主设置页
- `pages/auto-publish-time.html`：私密自动公开时间页
- `pages/group-picker-visible.html`：部分可见分组页
- `pages/group-picker-hidden.html`：不给谁看分组页
- `pages/group-create.html`：新增粉丝分组页

设计系统资源已复制到 `lib/`，无需构建、无需安装依赖。
