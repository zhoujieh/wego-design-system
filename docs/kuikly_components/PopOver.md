# PopOver

Demo 页 page 名称：`KPopOverPage`

## 概览

PopOver - 气泡弹出框组件，用于在目标元素附近显示提示信息或操作选项。

```Kotlin
// 最简单的用法：在任意 ViewContainer 上调用扩展函数
WGButton {
    attr {
        text = "点我"
    }
    event {
        onClick {
            this@WGButton.createPopover(
                location = PopupLocation.Bottom,
                popType = PopType.NORMAL,
                text = "水晶花破裂时的真挚颤抖",
                cancelByClickingItem = true
            )
        }
    }
}
```

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=NmFiODE1NzM1ZDU0ZDI5N2ZlYzBmMjQ0ZDZmMzBlMmFfTGJJV1lROElvS3hlYUVYZHJjWkh0QkFycHRIcWpGZE9fVG9rZW46TzlZaWJuYkxqb1RZVmR4WmIxc2MzclRqbnJlXzE3NzU4MDY0MDY6MTc3NTgxMDAwNl9WNA)

支持 3 种内容类型：`NORMAL`（普通文本气泡）、`ACTION`（选择气泡）、`INPUT`（输入样式气泡）

支持 4 个弹出方向（均相对于目标居中对齐）：`Top`、`Bottom`、`Left`、`Right`

> 组件会自动检测上下边界溢出并翻转方向。例如指定 `Bottom` 时如果底部空间不够，会自动翻转到 `Top`。

## 两种使用方式

PopOver 提供两种使用模式，根据场景选择：

### 方式一：快捷扩展函数（推荐用于一次性场景）

调用 `ViewContainer.createPopover()`，气泡消失后自动清理，**不需要**手动管理生命周期：

```Kotlin
buttonRef.view.createPopover(
    location = PopupLocation.Top,
    popType = PopType.NORMAL,
    text = "珍惜当下",
    duration = 3000 // 3秒后自动关闭
)
```

也可以通过 `BaseVisuals` 调用（效果一致）：

```Kotlin
BaseVisuals.createPopover(
    targetView = buttonRef.view as ViewContainer<*, *>,
    location = PopupLocation.Bottom,
    popType = PopType.NORMAL,
    text = "无平不陂"
)
```

### 方式二：PopOverController（推荐用于需要多次复用的场景）

当你需要在同一个页面反复显示/隐藏 PopOver，或者需要联动滚动自动隐藏时，使用 `PopOverController`：

```Kotlin
class MyPage : BasePager() {
    private val popOverController = PopOverController.create(this)

    override fun pageWillDestroy() {
        super.pageWillDestroy()
        PopOverController.destroy(this) // 必须手动销毁！
    }

    // 在事件中调用private fun handleClick() {
        popOverController.showPopover(
            targetView = targetViewRef.view as ViewContainer<*, *>,
            location = PopupLocation.Bottom,
            popType = PopType.NORMAL,
            text = "Hello"
        )
    }
}
```

> 使用 `PopOverController` 时，**务必在** **`pageWillDestroy()`** **中调用** **`PopOverController.destroy(this)`**，否则会内存泄漏。

## API

### createPopover 扩展函数参数

`ViewContainer<*,*>.createPopover(...)` 和 `BaseVisuals.createPopover(...)` 的参数列表一致：

| **name**                  | **type**                            | **功能**                                              | **default value**  |
| ------------------------- | ----------------------------------- | ----------------------------------------------------- | ------------------ |
| `targetView`🌟             | `ViewContainer<*, *>`               | PopOver 指向的目标视图                                | `this`（扩展函数） |
| `location`🌟               | `PopupLocation`                     | 弹出方向：`Top` / `Bottom` / `Left` / `Right`         | *(必填)*           |
| `popType`🌟                | `PopType`                           | 气泡类型：`NORMAL` / `ACTION` / `INPUT`               | *(必填)*           |
| `text`🌟                   | `String`                            | 显示文本（非 ACTION 类型）                            | `""`               |
| `cancelByClickingItem`    | `Boolean`                           | 点击气泡内容是否关闭                                  | `false`            |
| `cancelByClickingOutside` | `Boolean`                           | 点击气泡外部是否关闭                                  | `false`            |
| `duration`                | `Int?`                              | 自动关闭延迟（毫秒），`null` = 不自动关闭             | `null`             |
| `actionItems`🌟            | `ObservableList<PopOverItemData>?`  | ACTION 类型的操作项列表                               | `null`             |
| `leftIconUri`             | `String`                            | 左侧图标的 iconFont 字符串（INPUT 类型可用）          | `""`               |
| `rightIconUri`            | `String`                            | 右侧图标的 iconFont 字符串（NORMAL 类型可用）         | `""`               |
| `zIndex`                  | `Int`                               | 层级（越大越靠前）                                    | `4000`             |
| `maxItemWidth`            | `Float?`                            | 单项内容的最大宽度（NORMAL 整段 / ACTION 单 item），超过则文本以省略号尾部截断 | `null`             |
| `onPopClick`              | `((String) -> Unit)?`               | 点击气泡文本内容的回调                                | `null`             |
| `onPopImgClick`           | `((String) -> Unit)?`               | 点击气泡图标的回调                                    | `null`             |
| `onActionClick`           | `((Int, PopOverItemData) -> Unit)?` | ACTION 类型中点击某项的回调（index + item）           | `null`             |
| `onVisibilityChange`      | `((Boolean) -> Unit)?`              | 可见性变化回调（`true` = 显示，`false` = 隐藏）       | `null`             |
| `onAnimComplete`          | `((Boolean) -> Unit)?`              | 动画完成回调（`true` = 淡入完成，`false` = 淡出完成） | `null`             |
| `popOverAttr`             | `(PopOverAttr.() -> Unit)?`         | 高级属性配置块（见下方高级属性表）                    | `null`             |
| `destroyAfterDisappear`   | `Boolean`                           | 气泡消失后是否自动销毁控制器                          | `true`             |

### PopOverController 方法

| **方法**                                    | **功能**                                                     |
| ------------------------------------------- | ------------------------------------------------------------ |
| `PopOverController.create(view)`            | 获取或创建给定 ViewContainer 的控制器实例                    |
| `PopOverController.destroy(view)`           | 销毁指定 ViewContainer 的控制器（防止泄漏）                  |
| `controller.showPopover(...)`               | 显示气泡（参数同上方表格，无 `destroyAfterDisappear` 默认 `false`） |
| `controller.hide()`                         | 隐藏当前气泡                                                 |
| `controller.isVisible()`                    | 查询当前气泡是否可见                                         |
| `controller.setupScrollHandler { scrollY }` | 绑定滚动监听，滚动时自动隐藏气泡                             |
| `controller.updateScrollOffset(offset)`     | 手动更新滚动偏移（效果同上）                                 |

### 枚举类 `PopType`

| 值       | 说明                                                  |
| -------- | ----------------------------------------------------- |
| `NORMAL` | 普通文本气泡：深色圆角背景 + 白色文字                 |
| `ACTION` | 操作列表气泡：横排显示多个操作按钮，带分隔线          |
| `INPUT`  | 输入样式气泡：白色背景 + 灰色文字（暂不支持实际输入） |

### 枚举类 `PopupLocation`

| 值       | 说明                       |
| -------- | -------------------------- |
| `Top`    | 在目标上方弹出（箭头朝下） |
| `Bottom` | 在目标下方弹出（箭头朝上） |
| `Left`   | 在目标左侧弹出（箭头朝右） |
| `Right`  | 在目标右侧弹出（箭头朝左） |

### 数据类 `PopOverItemData`

用于 `ACTION` 类型的操作项：

| **name**  | **type**        | **功能**         |
| --------- | --------------- | ---------------- |
| `title`   | `String`        | 操作项的文本     |
| `onClick` | `(() -> Unit)?` | 操作项的点击回调 |

### 高级属性（`PopOverAttr`）

通过 `popOverAttr` 参数配置，适用于需要精细控制的场景：

| **name**                    | **type**  | **功能**                                    | **default value**                |
| --------------------------- | --------- | ------------------------------------------- | -------------------------------- |
| `useSlowCancelAnimation`    | `Boolean` | 手动关闭 / 外部控制时是否使用慢速淡出       | `true`                           |
| `fadeInDuration`            | `Float?`  | 自定义淡入动画时长（秒）                    | `null`（默认 0.1s）              |
| `clickFadeDuration`         | `Float?`  | 自定义点击关闭的淡出时长（秒）              | `null`（默认 0s，即立即消失）    |
| `expireFadeDuration`        | `Float?`  | 自定义自动关闭的淡出时长（秒）              | `null`（默认 0.1s）              |
| `reuseAnimation`            | `Boolean` | 相同文本(`attr.text`)再次显示时跳过淡入动画 | `false`                          |
| `additionalTopRectBound`    | `Float`   | 影响顶部翻转判断的额外距离                  | `NavBarConstants.DEFAULT_HEIGHT` |
| `additionalBottomRectBound` | `Float`   | 影响底部翻转判断的额外距离                  | `0f`                             |
| `fullHeightDivider`         | `Boolean` | ACTION 类型中分隔线是否撑满全高             | `true`                           |

## 参考代码

### 普通文本气泡（最简用法）

```Kotlin
// 在某个 View 上显示一个普通气泡，3秒后自动消失
targetView.createPopover(
    location = PopupLocation.Top,
    popType = PopType.NORMAL,
    text = "操作成功"，
    duration = 3000
)
```

### 四个方向

```Kotlin
// 顶部
targetView.createPopover(
    location = PopupLocation.Top,
    popType = PopType.NORMAL,
    text = "顶部弹窗"
)

// 底部
targetView.createPopover(
    location = PopupLocation.Bottom,
    popType = PopType.NORMAL,
    text = "底部弹窗"
)

// 左侧
targetView.createPopover(
    location = PopupLocation.Left,
    popType = PopType.NORMAL,
    text = "左侧弹窗"
)

// 右侧
targetView.createPopover(
    location = PopupLocation.Right,
    popType = PopType.NORMAL,
    text = "右侧弹窗"
)
```

### ACTION 类型（操作列表）

```Kotlin
// 准备操作项列表private var actionList by observableList<PopOverItemData>()

override fun created() {
    super.created()
    actionList.add(PopOverItemData().apply { title = "复制" })
    actionList.add(PopOverItemData().apply { title = "编辑" })
    actionList.add(PopOverItemData().apply { title = "删除" })
}

// 显示
targetView.createPopover(
    location = PopupLocation.Bottom,
    popType = PopType.ACTION,
    text = "请选择操作",
    cancelByClickingItem = true, // 点击操作项后自动关闭
    actionItems = actionList,
    onActionClick = { index, item ->
        wg.logI("PopOver", "点击了: ${item.title}")
    }
)
```

### INPUT 类型（带左侧图标）

```Kotlin
targetView.createPopover(
    location = PopupLocation.Bottom,
    popType = PopType.INPUT,
    text = "搜索商品",
    leftIconUri = IconUnicodeManager.getIcon("shangcheng"),
    cancelByClickingItem = true
)
```

### NORMAL 类型（带右侧关闭图标）

```Kotlin
targetView.createPopover(
    location = PopupLocation.Top,
    popType = PopType.NORMAL,
    text = "带右侧关闭图标",
    rightIconUri = IconUnicodeManager.getIcon("cha"),
    onPopImgClick = {
        // 点击图标时手动关闭（需配合 PopOverController 使用）
    }
)
```

### 各种关闭方式

```Kotlin
// 自动关闭（3秒后）
targetView.createPopover(
    location = PopupLocation.Top,
    popType = PopType.NORMAL,
    text = "3秒后自动关闭...",
    duration = 3000
)

// 点击外部关闭
targetView.createPopover(
    location = PopupLocation.Top,
    popType = PopType.NORMAL,
    text = "点击任意处关闭",
    cancelByClickingOutside = true
)

// 点击内容关闭
targetView.createPopover(
    location = PopupLocation.Top,
    popType = PopType.NORMAL,
    text = "点击内容区域关闭",
    cancelByClickingItem = true
)
```

### 使用 PopOverController（复用场景）

适用于页面内需要多次显示气泡的情况：

```Kotlin
class MyPage : BasePager() {

    private var targetViewRef: ViewRef<DivView>? = nullprivate val popOverController = PopOverController.create(this)

    override fun created() {
        super.created()
        // 绑定滚动监听：滚动时自动隐藏气泡
        popOverController.setupScrollHandler { scrollOffsetY }
    }

    override fun pageWillDestroy() {
        super.pageWillDestroy()
        PopOverController.destroy(this) // 必须调用！
    }

    override fun body(): ViewBuilder {
        val ctx = thisreturn {
            DialogContainer { // PopOver 需要 DialogContainer 作为宿主
                Scroller {
                    event {
                        scroll { scrollPosition ->
                            ctx.popOverController.updateScrollOffset(scrollPosition.offsetY)
                        }
                    }

                    View {
                        ref { ctx.targetViewRef = it }
                        attr {
                            size(100f, 40f)
                            backgroundColor(Color(0xFF3F8CFF))
                            allCenter()
                        }
                        Text { attr { text("点我") } }
                        event {
                            click {
                                ctx.popOverController.showPopover(
                                    targetView = ctx.targetViewRef!!.view as ViewContainer<*, *>,
                                    location = PopupLocation.Bottom,
                                    popType = PopType.NORMAL,
                                    text = "Hello World",
                                    cancelByClickingOutside = true
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
```

### 高级属性配置

```Kotlin
targetView.createPopover(
    location = PopupLocation.Bottom,
    popType = PopType.NORMAL,
    text = "自定义动画时长",
    duration = 5000,
    popOverAttr = {
        fadeInDuration = 0.3f         // 淡入 0.3 秒
        expireFadeDuration = 0.5f     // 自动关闭时淡出 0.5 秒
        clickFadeDuration = 0.2f      // 点击关闭时淡出 0.2 秒
        reuseAnimation = true         // 相同文本再次显示时跳过淡入
    }
)
```

### 最大宽度（maxItemWidth）

当 `maxItemWidth` 被设置后，组件会在气泡首次完成布局时测量自身宽度：

- **NORMAL 类型**：测量整段气泡宽度。超过 `maxItemWidth` 时，整段文本会以省略号尾部截断。
- **ACTION 类型**：测量每个 item 的宽度。任意一个 item 超过 `maxItemWidth` 时，所有 item 的文本都启用省略号尾部截断模式。

```Kotlin
// NORMAL：长文本会自动以 "..." 尾部截断
targetView.createPopover(
    location = PopupLocation.Bottom,
    popType = PopType.NORMAL,
    text = "这是一段非常非常长的提示文本",
    maxItemWidth = 160f
)

// ACTION：长标题项会自动以 "..." 尾部截断
targetView.createPopover(
    location = PopupLocation.Bottom,
    popType = PopType.ACTION,
    cancelByClickingItem = true,
    actionItems = longActionList,
    maxItemWidth = 90f
)
```

> 内部实现：在内容容器的 `layoutFrameDidChange` 回调中比较测得宽度与 `maxItemWidth`，超过则置内部状态 `limitMaxWidth = true`，触发 Text 重新渲染：追加 `flex(1f)` + `textOverFlowTail()`（配合既有的 `lines(1)`）形成尾部省略号。

## 组件特性

### 自动边界检测

气泡会自动检测是否超出屏幕边界。指定 `Bottom` 但底部空间不够时，会自动翻转到 `Top`（反之亦然）。检测时会考虑状态栏高度、导航栏高度和安全区距离。

你可以通过 `additionalTopRectBound` 和 `additionalBottomRectBound` 调整翻转的判定阈值。

### 单实例管理

同一个 `ViewContainer`（通常是一个 Page）下只能同时存在**一个** PopOver。调用 `showPopover` 时，如果已有气泡显示，会先销毁旧的再创建新的。这避免了页面上出现多个气泡重叠的问题。

### 滚动自动隐藏

配合 `PopOverController` 使用时，可以绑定滚动监听，让用户滚动页面时自动隐藏气泡：

```Kotlin
// 方式一：通过 setupScrollHandler 绑定响应式变量
popOverController.setupScrollHandler { scrollOffsetY }

// 方式二：在滚动回调中手动更新
event {
    scroll { scrollPosition ->
        popOverController.updateScrollOffset(scrollPosition.offsetY)
    }
}
```

（p.s. 这个方法其实很鸡肋，其实可以直接在监听到响应后直接调用 controller.hide() 关闭气泡）

### DialogContainer 依赖

PopOver 内部通过 `DialogContainer` 实现覆盖层渲染。使用 `PopOverController` 或 `createPopover` 时，确保你的页面 `body()` 中包裹了 `DialogContainer`。

### 淡入淡出动画

气泡默认带有淡入动画（0.1s），淡出行为取决于关闭方式：

- **自动关闭（****`duration`****）**：默认慢速淡出（0.1s），可通过 `expireFadeDuration` 自定义
- **点击关闭（内容 / 图标）**：默认无淡出动画（立即消失），可通过 `clickFadeDuration` 自定义
- `useSlowCancelAnimation` = `false`: 完全没有淡出动画

### 内存管理

- **`createPopover`** **扩展函数**：默认 `destroyAfterDisappear = true`，气泡消失后自动清理，无需额外操作。
- **`PopOverController`**：需要在页面销毁时手动调用 `PopOverController.destroy(this)`。
- 内部通过 `controllerCache` 确保每个 ViewContainer 只有一个控制器实例，避免重复创建。