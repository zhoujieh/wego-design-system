Demo 页 page 名称：`KSelectPage`

> `PopViewSelect` 是气泡型组件，相对某个视图弹出；`ActionSheet` 是底部弹窗型组件，都是可选择的列表。它们分别替代了设计稿里 Select 和 ActionSheet 的部分职责，都支持选择模式（设计稿里的 Select）和非选择模式（设计稿里的 ActionSheet）。

## 概览

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=ZmMwNjg5ZDg3YTRjMTJiNGYzYjdjMDU1ZTJmMTc0M2FfTmI3eHNGMWxRbEl2TWhBalppV3dpTEEzdFRPd1VuZUFfVG9rZW46V0tNOWJRZFRtb2xacXp4ZGZZdmNHOEpybm9lXzE3NzY0ODMyOTM6MTc3NjQ4Njg5M19WNA)

PopViewSelect - 相对目标视图弹出的下拉选择器

```Kotlin
// 最简单的用法：在任意 ViewContainer 上调用扩展函数
this@View.createPopViewSelect(
    location = PopViewLocation.BOTTOM,
    items = listOf(
        PopViewItemData(title = "全部", index = 0）,
        PopViewItemData(title = "待处理", index = 1),
        PopViewItemData(title = "已完成", index = 2)
    ),
    selectedIndex = 0,
    onActionClick = { index, item ->
        wg.logI("PopView", "选择了：${item.title}")
    }
)
```

支持 4 个弹出方向：`BOTTOM`、`TOP`、`LEFT`、`RIGHT`

支持 3 种水平对齐方式（仅 BOTTOM/TOP 生效）：`LEFT`、`CENTER`、`RIGHT`

支持 2 种工作模式：

- `selectMode` = `true`：**选择模式**，类似单选下拉，选中项右侧**显示绿色对勾**，标题加粗
- `selectMode` = `false`：**操作模式**，没有右侧图标，类似右键菜单

> 组件会自动检测底部溢出并翻转到 Top。其它方向（Top/Left/Right）目前不会翻转。

## 两种使用方式

### 方式一：快捷扩展函数（推荐用于一次性场景）

调用 `ViewContainer.createPopViewSelect()`，气泡消失后自动清理，**不需要**手动管理生命周期：

```Kotlin
targetRef.view.createPopViewSelect(
    location = PopViewLocation.BOTTOM,
    items = myItems,
    selectedIndex = currentIndex,
    onActionClick = { index, item ->
        currentIndex = index
    }
)
```

默认 `destroyAfterDisappear = true`，气泡消失后控制器自动销毁。

### 方式二：PopViewSelectController（推荐用于需要多次复用的场景）

当页面需要反复显示同一个选择器，或者需要配合滚动自动隐藏时：

```Kotlin
class MyPage : BasePager() {
    private val popViewController = PopViewSelectController.create(this)

    override fun created() {
        super.created()
        // 绑定滚动监听：滚动时自动隐藏
        popViewController.setupScrollHandler { scrollOffsetY }
    }

    override fun pageWillDestroy() {
        super.pageWillDestroy()
        PopViewSelectController.destroy(this) // 必须手动销毁！
    }

    private fun handleClick(targetView: ViewContainer<*, *>) {
        popViewController.showPopViewSelect(
            targetView = targetView,
            location = PopViewLocation.BOTTOM,
            items = myItems,
            selectedIndex = currentIndex,
            onActionClick = { index, item -> currentIndex = index }
        )
    }
}
```

> 使用 `PopViewSelectController` 时，**务必在** **`pageWillDestroy()`** **中调用** **`PopViewSelectController.destroy(this)`**，否则会内存泄漏。

## API

### createPopViewSelect 扩展函数参数

`ViewContainer<*, *>.createPopViewSelect(...)` 和 `controller.showPopViewSelect(...)` 的参数列表基本一致。

| **name**                  | **type**                            | **功能**                                                     | **default value**  |
| ------------------------- | ----------------------------------- | ------------------------------------------------------------ | ------------------ |
| `targetView`🌟             | `ViewContainer<*, *>`               | 下拉菜单指向的目标视图                                       | `this`（扩展函数） |
| `popItemWidth`🌟           | `Float`                             | 选项单元的宽度                                               | `180f`*（必填）*   |
| `location`🌟               | `PopViewLocation`                   | 弹出方向：`BOTTOM` / `TOP` / `LEFT`/ `RIGHT`                 | *(必填)*           |
| `horizontalAlign`         | `PopViewHorizontalAlign`            | 水平对齐（仅 BOTTOM/TOP 生效）：`LEFT` / `CENTER` / `RIGHT`  | `CENTER`           |
| `items`🌟                  | `List<PopViewItemData>`             | 选项列表                                                     | *(必填)*           |
| `selectedIndex`           | `Int`                               | 当前选中项索引（selectMode 下显示绿色对勾 ✔️）                | `0`                |
| `selectMode`              | `Boolean`                           | 选择模式（`true`=显示选中勾，`false`=纯操作模式）            | `true`             |
| `cancelByClickingItem`    | `Boolean`                           | 点击选项后是否关闭                                           | `true`             |
| `cancelByClickingOutside` | `Boolean`                           | 点击外部区域是否关闭                                         | `true`             |
| `fadeInDuration`          | `Float?`                            | 淡入动画时长（秒），`null` 表示使用默认值 0.2                | `null`             |
| `zIndex`                  | `Int`                               | 层级（越大越靠前）                                           | `4000`             |
| `onActionClick`           | `((Int, PopViewItemData) -> Unit)?` | 点击某项的回调（index + item）                               | `null`             |
| `onVisibilityChange`      | `((Boolean) -> Unit)?`              | 可见性变化回调（`true`=显示，`false`=隐藏）                  | `null`             |
| `onAnimComplete`          | `((Boolean) -> Unit)?`              | 淡入动画完成的回调（不触发淡出回调）                         | `null`             |
| `destroyAfterDisappear`   | `Boolean`                           | 气泡消失后是否自动销毁控制器（`showPopViewSelect` 中默认 false） | `true`             |

### PopViewSelectController 方法

| **方法**                                    | **功能**                                              |
| ------------------------------------------- | ----------------------------------------------------- |
| `PopViewSelectController.create(view)`      | 获取或创建给定 ViewContainer 的控制器实例（单例缓存） |
| `PopViewSelectController.destroy(view)`     | 销毁指定 ViewContainer 的控制器（防止泄漏）           |
| `controller.showPopViewSelect(...)`         | 显示下拉菜单（参数见上方表格）                        |
| `controller.hide()`                         | 隐藏当前下拉菜单                                      |
| `controller.isVisible()`                    | 查询当前是否可见                                      |
| `controller.setupScrollHandler { scrollY }` | 绑定滚动监听，滚动时自动隐藏                          |
| `controller.updateScrollOffset(offset)`     | 手动更新滚动偏移（效果同上）                          |

### 数据类 `PopViewItemData`

| **name**         | **type**       | **功能**                                                     |
| ---------------- | -------------- | ------------------------------------------------------------ |
| `title`          | `String`       | 选项文本                                                     |
| `index`          | `Int`          | 业务自定义索引（非必填，仅供外部使用）**此处本应使用 “****`id`****”命名，但由于历史原因没有修改** |
| `leftIcon`       | `String?`      | 可选的左侧 iconfont 名称（20f 图标 + 8f 间距，左边距 12f；为 null 时左边距 16f） |
| `customLeftView` | `ViewBuilder?` | 自定义左侧 View（建议宽 20px 保持对齐），优先级低于 `leftIcon` |
| `badge`          | `String`       | 徽章文本（*已废弃，不生效*）                                 |
| `subtitle`       | `String`       | 副标题（*已废弃，不生效*）                                   |
| `isShowRecommen` | `Boolean`      | 是否显示推荐标签（*已废弃，不生效*）                         |

> 当前版本的 PopViewSelect 列表渲染只使用了 `title` / `leftIcon` / `customLeftView` 三个字段。其它字段是数据模型的保留字段，暂不影响显示。如果你需要徽章、副标题等信息，请使用 [ActionSheet](https://slowisfast.feishu.cn/wiki/MB5tw6M03iNIsOkmCCHczYhEn6e)。

### 枚举类 `PopViewLocation`

| 值       | 说明                                       |
| -------- | ------------------------------------------ |
| `BOTTOM` | 在目标下方弹出（底部溢出时自动翻转到 Top） |
| `TOP`    | 在目标上方弹出                             |
| `LEFT`   | 在目标左侧弹出                             |
| `RIGHT`  | 在目标右侧弹出                             |

### 枚举类 `PopViewHorizontalAlign`

仅在 `BOTTOM` / `TOP` 位置生效。

| 值       | 说明                                     |
| -------- | ---------------------------------------- |
| `LEFT`   | 对齐目标左边缘（超出屏幕时贴左边缘 8dp） |
| `CENTER` | 相对目标中心居中（默认）                 |
| `RIGHT`  | 对齐目标右边缘（超出屏幕时贴左边缘 8dp） |

## 参考代码

### 选择模式（selectMode = true）

```Kotlin
var selectedIndex by observable(0)
val items = listOf(
    PopViewItemData().apply { title = "全部" },
    PopViewItemData().apply { title = "已处理" },
    PopViewItemData().apply { title = "未处理" }
)

targetRef.view.createPopViewSelect(
    location = PopViewLocation.BOTTOM,
    horizontalAlign = PopViewHorizontalAlign.RIGHT, // 对齐目标右边缘
    items = items,
    selectedIndex = ctx.selectedIndex,
    onActionClick = { index, item ->
        ctx.selectedIndex = index // 这里的 index 是列表顺序中的 index，不是 item 中的 index
    }
)
```

### 操作菜单（selectMode = false）

常见于右键菜单或“更多”按钮：

```Kotlin
val actions = listOf(
    PopViewItemData().apply { title = "分享"; leftIcon = "fenxiang" },
    PopViewItemData().apply { title = "复制"; leftIcon = "fuzhi" },
    PopViewItemData().apply { title = "删除"; leftIcon = "shanchu" }
)

moreButtonRef.view.createPopViewSelect(
    location = PopViewLocation.BOTTOM,
    items = actions,
    selectMode = false, // 没有右侧的选中勾
    popItemWidth = 160f,
    onActionClick = { _, item ->
        when (item.title) {
            "分享" -> doShare()
            "复制" -> doCopy()
            "删除" -> doDelete()
        }
    }
)
```

### 带自定义左侧图标

```Kotlin
val items = listOf(
    PopViewItemData().apply {
        title = "红色"
        customLeftView = {
            View {
                attr {
                    size(16f, 16f)
                    backgroundColor(Color.RED)
                    borderRadius(8f)
                }
            }
        }
    },
    PopViewItemData().apply {
        title = "蓝色"
        customLeftView = {
            View {
                attr {
                    size(16f, 16f)
                    backgroundColor(Color.BLUE)
                    borderRadius(8f)
                }
            }
        }
    }
)
```

### 四个方向与对齐方式

```Kotlin
// 顶部居中
targetRef.view.createPopViewSelect(
    location = PopViewLocation.TOP,
    horizontalAlign = PopViewHorizontalAlign.CENTER,
    items = items
)

// 底部左对齐
targetRef.view.createPopViewSelect(
    location = PopViewLocation.BOTTOM,
    horizontalAlign = PopViewHorizontalAlign.LEFT,
    items = items
)

// 右侧（Left/Right 忽略 horizontalAlign）
targetRef.view.createPopViewSelect(
    location = PopViewLocation.RIGHT,
    items = items
)
```

### 使用 PopViewSelectController（复用场景 + 滚动自动隐藏）

```Kotlin
class FilterPage : BasePager() {

    private var buttonRef: ViewRef<DivView>? = nullprivate val popViewController = PopViewSelectController.create(this)

    private var selectedIndex by observable(0)

    override fun created() {
        super.created()
        // 页面滚动时，自动隐藏下拉菜单
        popViewController.setupScrollHandler { scrollOffsetY }
    }

    override fun pageWillDestroy() {
        super.pageWillDestroy()
        PopViewSelectController.destroy(this) // 别忘了！
    }

    override fun body(): ViewBuilder {
        val ctx = thisreturn {
            DialogContainer { // PopViewSelect 需要 DialogContainer 作为宿主
                Scroller {
                    event {
                        scroll { position ->
                            ctx.popViewController.updateScrollOffset(position.offsetY)
                        }
                    }

                    View {
                        ref { ctx.buttonRef = it }
                        attr {
                            size(120f, 40f)
                            backgroundColor(Color(0xFFF5F5F5))
                            allCenter()
                        }
                        Text { attr { text("筛选") } }
                        event {
                            click {
                                ctx.popViewController.showPopViewSelect(
                                    targetView = ctx.buttonRef!!.view as ViewContainer<*, *>,
                                    location = PopViewLocation.BOTTOM,
                                    items = ctx.buildFilterItems(),
                                    selectedIndex = ctx.selectedIndex,
                                    onActionClick = { i, _ -> ctx.selectedIndex = i }
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    private var scrollOffsetY by observable(0f)
    private fun buildFilterItems(): List<PopViewItemData> = listOf(
        PopViewItemData().apply { title = "全部" },
        PopViewItemData().apply { title = "进行中" },
        PopViewItemData().apply { title = "已完成" }
    )
}
```

## 组件特性

### 依赖 DialogContainer

PopViewSelect 通过 `DialogContainer` 实现覆盖层渲染。使用 `PopViewSelectController` 或 `createPopViewSelect` 时，确保你的页面 `body()` 中包裹了 `DialogContainer`。

### 无自动宽度

**需要通过** **`popItemWidth`** **显式声明宽度。**

### 自动边界检测

当 `location = BOTTOM` 且目标距底部的空间不足以容纳整个选项列表时，组件会自动翻转到目标上方（`TOP`）。判定时会考虑底部 20dp 安全区。

> 目前仅 `BOTTOM` 方向支持翻转到 `TOP`。`TOP` / `LEFT` / `RIGHT` 方向不会翻转。

水平方向也会做边界保护：如果列表靠近屏幕左/右边缘，会自动贴向边缘并保留 8dp 的间距。

### 滚动自动隐藏

配合 `PopViewSelectController` 使用时，可以绑定滚动监听，让用户滚动页面时自动隐藏：

```Kotlin
// 方式一：通过 setupScrollHandler 绑定响应式变量
popViewController.setupScrollHandler { scrollOffsetY }

// 方式二：在滚动回调中手动更新
event {
    scroll { position ->
        popViewController.updateScrollOffset(position.offsetY)
    }
}
```

### 淡入动画与平移效果

默认启用 0.2s 的淡入动画，同时会有一点根据方向的平移效果（BOTTOM 从上往下展开、TOP 从下往上展开、LEFT/RIGHT 对应水平方向）。淡出时不使用动画，直接消失。

可通过 `fadeInDuration` 参数自定义淡入时长。

### 内存管理

- **`createPopViewSelect`** **扩展函数**：默认 `destroyAfterDisappear = true`，气泡消失后自动清理，无需额外操作。
- **`PopViewSelectController`**：需要在页面销毁时手动调用 `PopViewSelectController.destroy(this)`。
- 内部通过 `controllerCache` 确保每个 ViewContainer 只有一个控制器实例。