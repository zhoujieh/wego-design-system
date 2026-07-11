# 本次读取的仓库文件列表

本次 MVP 分析基于以下 3 个仓库文件，均为只读访问，未做任何修改。

## 1. wego-app/js/routes.js

- 类型：路由注册表
- 作用：定义全部业务场景的 routeId、scene 名称、script/style 路径、入口配置
- 仓库管理相关内容：
  - routeId: `my-warehouse-management`
  - scene: `仓库管理`
  - script: `./scenes/仓库管理/scene.js`
  - style: `./scenes/仓库管理/scene.css`
  - entry: tab=`my`、group=`my-app-center`、label=`仓库管理`、type=`grid-entry`、icon=`./lib/icons/app-center/配货管理.svg`

## 2. wego-app/scenes/仓库管理/scene.js

- 类型：场景逻辑文件（746 行）
- 作用：定义仓库管理场景的全部状态、模板、交互绑定与场景注册
- 关键内容：
  - STATE 对象：openMenuId、warehouses 数组（3 条模拟数据）
  - 选项枚举：TYPE_OPTIONS、SERVICE_SCOPE_OPTIONS、SHIPPING_AGING_OPTIONS、TEMP_OPTIONS、COVER_TONES
  - 模板函数：warehouseListTemplate（列表页）、editorTemplate（新增/编辑页）
  - 核心函数：createDraft、validateDraft、persistWarehouse、openWarehouseEditor、confirmDelete、bindWarehousePage
  - 场景注册：routeId=`my-warehouse-management`、presentation={type:push, transition:slide-left, coversTabBar:true}

## 3. wego-app/scenes/仓库管理/scene.css

- 类型：场景样式文件（327 行）
- 作用：定义仓库列表页与编辑页的视觉布局
- 关键内容：
  - 列表页：warehouse-page、warehouse-page__summary、warehouse-list、warehouse-card、warehouse-action-menu、warehouse-empty
  - 编辑页：warehouse-editor、warehouse-editor__body、warehouse-editor__cover-field
  - 状态徽章：warehouse-card__badge（is-highlight/is-enabled/is-disabled）
  - 空状态：warehouse-empty__icon/title/desc
