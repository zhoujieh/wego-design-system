Demo 页 page 名称：`KActionSheetPage`（操作模式）、`KActionSheetSelectPage`（选择模式）

> `PopViewSelect` 是气泡型组件，相对某个视图弹出；`ActionSheet` 是底部弹窗型组件，都是可选择的列表。它们分别替代了设计稿里 Select 和 ActionSheet 的部分职责，都支持选择模式（设计稿里的 Select）和非选择模式（设计稿里的 ActionSheet）。

## 概览

ActionSheet - 底部弹出操作表单，有选择模式和非选择模式。用于列出一组操作或选项，底部带固定“取消”按钮。

```Kotlin
BaseVisuals.showActionSheet(
    pageId = ctx.pagerId,
    actionSheetDataList = listOf(
        ActionSheetItemData(title = "拍照"),
        ActionSheetItemData(title = "从相册选择")
    ),
    description = "请选择图片来源",
    onActionClick = { index, item ->
        BaseVisuals.showSimpleSuccessToast(ctx.pagerId, "选择了：${item.title}")
    }
)
```

ActionSheet 是一个纯 UI 组件，通过 `BaseVisuals` 提供的两个工具方法来调用：

- `BaseVisuals.showActionSheet(...)`：**操作模式**。文本居中，不显示选中状态。适合“分享/复制/删除”等并列操作。
- `BaseVisuals.showActionSheetSelect(...)`：**选择模式**。文本左对齐，**右侧显示绿色对勾**。适合“全部 / 已处理 / 未处理”这类单选场景。

> `showActionSheetSelect` 内部其实就是 `selectMode = true` 的 ActionSheet。两个方法接收几乎相同的参数，差别在前者多了 `selectedIndex`（初始选中的 index）参数。

ActionSheet 自适应高度。它从上到下的结构是：

1. **头部描述区**（可选）— 支持左侧图标、描述文本、右侧链接
2. **选项列表** — 每项支持图标、标题、副标题、徽章、推荐标签
3. **空白间隔** — 8dp 的灰色分隔
4. **取消按钮** — 自动适配底部安全区

## API

### BaseVisuals.showActionSheet 参数（操作模式）

| **name**               | **type**                             | **功能**                                                     | **default value**     |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------ | --------------------- |
| `pageId`🌟              | `String`                             | 页面 ID（必填）                                              | /                     |
| `actionSheetDataList`🌟 | `List<ActionSheetItemData>`          | 选项列表（必填）                                             | /                     |
| `description`🌟         | `String`                             | header 描述文本                                              | `""`                  |
| `iconUri`              | `String`                             | header 左侧图标（iconfont 字符 / 本地 assets 路径 / http URL） | `""`                  |
| `descriptionLink`      | `String`                             | header 右侧链接文本；非空时头部变为左对齐 + 右对齐布局       | `""`                  |
| `bottomHeight`         | `Float?`                             | 底部额外的高度；`null` 时使用 iOS 底部安全区高度             | `null`                |
| `closeAfterClick`      | `Boolean`                            | 点击选项后是否关闭                                           | `true`                |
| `zIndex`               | `Int`                                | 弹窗层级                                                     | 默认 actionSheet 层级 |
| `onActionClick`        | `(Int, ActionSheetItemData) -> Unit` | 点击选项的回调（index + item）                               | `{ _, _ -> }`         |
| `onLinkClick`          | `(() -> Unit)?`                      | 点击头部链接的回调，需要配合 `descriptionLink` 使用          | `null`                |
| `onClose`              | `(() -> Unit)?`                      | 关闭回调（点击取消 / 点击选项后关闭均会触发）                | `null`                |

返回 `DialogId`，可用于手动关闭：

```Kotlin
val dialogId = BaseVisuals.showActionSheet(...)
DialogUtil.cancelDialog(pageId, dialogId)
```

### BaseVisuals.showActionSheetSelect 参数（选择模式）

在 `showActionSheet` 的基础上多了一个 `selectedIndex` 参数，并且内部固定 `selectMode = true`：

| **name**         | **type** | **功能**                                           | **default** |
| ---------------- | -------- | -------------------------------------------------- | ----------- |
| `selectedIndex`🌟 | `Int`    | 当前选中项的索引（选中项右侧显示绿色勾，文字加粗） | `0`         |

其它参数与 `showActionSheet` 完全一致。

> 选择模式下，无论传入多少 `isCenter`，文本都会强制左对齐（以给右侧的绿色勾留位置）。

### 数据类 `ActionSheetItemData`

| **name**             | **type**  | **功能**                                                     | **default** |
| -------------------- | --------- | ------------------------------------------------------------ | ----------- |
| `id`                 | `Int`     | 业务唯一标识（非必填，供外部使用）                           | `0`         |
| `title`🌟             | `String`  | 选项文本                                                     | `""`        |
| `leftImageUri`       | `String`  | 左侧图标：iconfont Unicode 字符 / 本地 `assets/...` 路径 / `http(s)://` 图片 URL | `""`        |
| `badge`              | `String`  | 徽章文本；**值为** **`"-1"`** **时显示红点（不带数字），其它字符串显示为数字徽章** | `""`        |
| `showRecommendation` | `Boolean` | 是否显示气泡型推荐标签                                       | `false`     |
| `recommendationText` | `String?` | 推荐标签文本；为 `null` 时默认显示「推荐」                   | `null`      |
| `subtitle`           | `String`  | 副标题（出现在 title 下方，12sp 深灰）                       | `""`        |
| `disabled`           | `Boolean` | 是否禁用（禁用项不响应点击，文本变浅）                       | `false`     |
| `borderBottomHeight` | `Float`   | 分割线高度                                                   | `0.6f`      |
| `borderBottomColor`  | `Long`    | 分割线颜色                                                   | 默认浅灰    |

### 图标路径规则（`iconUri` / `leftImageUri`）

组件通过字符串内容判断如何渲染：

- 包含 `"assets"` / `"http"` / `"https"` → 当作图片地址，使用 `Image` 渲染（圆形裁剪）
- 否则 → 当作 iconfont 的 Unicode 字符，使用 `Text` + iconfont 渲染

所以一般写法是：

```Kotlin
leftImageUri = IconUnicodeManager.getIcon("fenxiang")                 // iconfont
leftImageUri = ImageUri.commonAssets("homepage/live/left_arrow.png")  // 本地图片
leftImageUri = "https://cdn.example.com/share.png"                    // 远程图片
```

## 参考代码

### 基础：纯文本列表

```Kotlin
BaseVisuals.showActionSheet(
    pageId = ctx.pagerId,
    actionSheetDataList = listOf(
        ActionSheetItemData(title = "选项 1"),
        ActionSheetItemData(title = "选项 2"),
        ActionSheetItemData(title = "选项 3")
    ),
    onActionClick = { index, item ->
        BaseVisuals.showSimpleSuccessToast(ctx.pagerId, "选择了：${item.title}")
    }
)
```

### 带头部描述

```Kotlin
BaseVisuals.showActionSheet(
    pageId = ctx.pagerId,
    actionSheetDataList = items,
    description = "请选择图片来源",
    iconUri = IconUnicodeManager.getIcon("xiangji"),
    onActionClick = { _, item -> /* ... */ }
)
```

### 带图标的列表

```Kotlin
val items = listOf(
    ActionSheetItemData(
        title = "分享给好友",
        leftImageUri = IconUnicodeManager.getIcon("fenxiang")
    ),
    ActionSheetItemData(
        title = "复制链接",
        leftImageUri = IconUnicodeManager.getIcon("fuzhi")
    ),
    ActionSheetItemData(
        title = "收藏",
        leftImageUri = IconUnicodeManager.getIcon("shoucang")
    )
)

BaseVisuals.showActionSheet(
    pageId = ctx.pagerId,
    actionSheetDataList = items,
    description = "更多操作",
    onActionClick = { _, item -> /* ... */ }
)
```

### 徽章、推荐标签和副标题

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MDA5MDE3NDM2MjBkNTk1MWM2Mjk2MzIzY2E3Y2VjM2ZfVk9MZWZjUzZlS3Bqejl0a3hoQ3l5NEdteUxzdm8yTEZfVG9rZW46TmdmbGJSME9Sb2laOFd4dzcwVWNiUjNabm9kXzE3NzY0ODMwOTI6MTc3NjQ4NjY5Ml9WNA)![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=N2U5M2I4OGYzNTJmZGU3NzYwOWY4NjNhMDY5NGQ4MjJfc21Ua0tSdjFNRDFocTZHSkJwZjdubnFNRjFtWmpBUllfVG9rZW46VGd2WGJpQ3J6b0pQRDJ4WU94WmNCQzc0blZkXzE3NzY0ODMwOTI6MTc3NjQ4NjY5Ml9WNA)

```Kotlin
val items = listOf(
    ActionSheetItemData(
        title = "直播",
        subtitle = "开启直播间",
        leftImageUri = IconUnicodeManager.getIcon("zhibo"),
        showRecommendation = true,          // 绿色气泡型“推荐”标签
        recommendationText = "推荐"          // 自定义标签文本
    ),
    ActionSheetItemData(
        title = "消息通知",
        leftImageUri = IconUnicodeManager.getIcon("xiaoxi-mian"),
        badge = "5"                         // 数字徽章
    ),
    ActionSheetItemData(
        title = "我的订单",
        leftImageUri = IconUnicodeManager.getIcon("dingdan"),
        badge = "-1"                        // 红点（不带数字）
    )
)

BaseVisuals.showActionSheet(
    pageId = ctx.pagerId,
    actionSheetDataList = items,
    description = "权益中心",
    onActionClick = { _, item -> /* ... */ }
)
```

### 头部带链接

`descriptionLink` 非空时，头部从居中布局切换为「左边图标+文本，右边链接」的两端布局

```Kotlin
BaseVisuals.showActionSheet(
    pageId = ctx.pagerId,
    actionSheetDataList = items,
    description = "请选择一项",
    descriptionLink = "查看帮助",
    onLinkClick = {
        wg.toKuiklyPage("helpPage")
    },
    onActionClick = { _, item -> /* ... */ }
)
```

### 选择模式（showActionSheetSelect）

选择模式下，文本左对齐、选中项右侧显示绿色对勾

```Kotlin
var selectedIndex by observable(0)

val items = listOf(
    ActionSheetItemData(title = "按时间排序"),
    ActionSheetItemData(title = "按热度排序"),
    ActionSheetItemData(title = "按点赞数排序")
)

BaseVisuals.showActionSheetSelect(
    pageId = ctx.pagerId,
    actionSheetDataList = items,
    selectedIndex = ctx.selectedIndex,
    description = "排序方式",
    onActionClick = { index, item ->
        ctx.selectedIndex = index
        BaseVisuals.showSimpleSuccessToast(ctx.pagerId, "已选择：${item.title}")
    }
)
```

### 禁用某一项

`disabled = true` 的项目文本会变浅，并且不响应点击、按压态和 `onActionClick` 回调。

```Kotlin
val items = listOf(
    ActionSheetItemData(
        title = "标准功能",
        subtitle = "所有用户可用",
        leftImageUri = IconUnicodeManager.getIcon("kaisuo")
    ),
    ActionSheetItemData(
        title = "高级功能",
        subtitle = "需要 VIP 权限",
        leftImageUri = IconUnicodeManager.getIcon("suo"),
        badge = "VIP",
        disabled = true
    )
)

BaseVisuals.showActionSheetSelect(
    pageId = ctx.pagerId,
    actionSheetDataList = items,
    selectedIndex = ctx.selectedIndex,
    onActionClick = { index, _ -> ctx.selectedIndex = index }
)
```

### 手动关闭

默认情况下，点击选项会自动关闭 ActionSheet（`closeAfterClick = true`）。如果要在点击后执行异步操作，保留弹窗继续显示，可以关闭这个行为：

```Kotlin
val dialogId = BaseVisuals.showActionSheet(
    pageId = ctx.pagerId,
    actionSheetDataList = items,
    closeAfterClick = false,
    onActionClick = { _, item ->
        async {
            val ok = doSomething(item)
            if (ok) DialogUtil.cancelDialog(ctx.pagerId, dialogId) // 手动关闭
        }
    }
)
```

## 组件特性

### 选择模式

| 特性         | `showActionSheet`（操作模式） | `showActionSheetSelect`（选择模式） |
| ------------ | ----------------------------- | ----------------------------------- |
| 文本对齐     | 由 `isCenter` 控制            | **强制左对齐**                      |
| 右侧选中指示 | 无                            | 选中项显示绿色勾                    |
| 选中项加粗   | 无                            | 选中项 `fontWeight500`              |
| 适用场景     | 操作按钮组（分享 / 删除 ...） | 单选切换（筛选 / 排序 ...）         |
| 额外参数     | —                             | `selectedIndex`                     |

### 头部 description 的三种布局

- **无图标 无链接** → 纯文本居中
- **有图标 无链接** → 图标 + 文本整体居中
- **有链接（不管有没有图标）** → 左边（图标 + 文本）+ 右边（链接），两端对齐

### 底部安全区适配

取消按钮底部会自动增加 iOS 的底部安全区高度。也可以通过 `bottomHeight` 参数手动指定。

### 自定义选项底部的 border

可以自定义`ActionSheetItemData` 的 `borderBottomHeight` 和 `borderBottomColor` 实现分区效果：

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=YTQ1OTNiYTc5MmNmZmQ0ZGNlMTM4NTY5MWMwZWJjOGVfU0xJcmYyRkNkblJ6ekpWRWg0dUFOMGJHN1Z5aGhjS2ZfVG9rZW46SFVLQmJheVpTb3A2YmF4QUFnM2M1U3ZMbnFmXzE3NzY0ODMwOTI6MTc3NjQ4NjY5Ml9WNA)

```Kotlin
// 批量发布
add(ActionSheetItemData(
    id = PublishGoodsActionType.BATCH_PUBLISH.index,
    title = PublishGoodsActionType.BATCH_PUBLISH.title,
    subtitle = PublishGoodsActionType.BATCH_PUBLISH.subtitle ?: "",
    borderBottomHeight = 8f,
    borderBottomColor = WGColor.bg_gray_03_pack,
)
```

### DialogContainer 依赖

ActionSheet 通过 `DialogContainer` + `DialogUtil` 系统展示，所以页面 `body()` 中需要包一层 `DialogContainer` 才能正确渲染。大多数业务页继承 `BasePager` 后直接套上 `DialogContainer` 即可。

### 自动关闭行为

- 点击选项 → 默认关闭（`closeAfterClick = true`）
  - 先触发 `onActionClick`，再触发 `onClose`
- 点击取消按钮 → 始终关闭
  - 只触发 `onClose`

### 与 PopViewSelect 的区别

| 场景                       | 推荐组件                                                     |
| -------------------------- | ------------------------------------------------------------ |
| 底部弹出的选项列表         | **ActionSheet**                                              |
| 相对目标视图弹出的下拉菜单 | [PopViewSelect](https://slowisfast.feishu.cn/wiki/F6GNwo9sCiWLA9k2lVnc2Pp5n7g) |
| 需要气泡箭头指向目标       | [PopOver](https://slowisfast.feishu.cn/wiki/WE9zwQv9JiEZR3kSV6GcybiFnLh) |