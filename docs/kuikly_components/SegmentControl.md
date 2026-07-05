# SegmentControl

Demo 页 page 名称：`KSegmentControlPage`

## 概览

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MzViMzdmYzIyOTg3MDM5ZGI2YzA5ZWQyMzYyMmEzYWFfbm5LMDhocHh6S3hpMmlvMW9zSjJtVldVcFdtY0JhSE1fVG9rZW46RDZjcWJyOUdyb2Z6MXp4TzJGemN5d01FbmZjXzE3NzY3NjEwNDE6MTc3Njc2NDY0MV9WNA)

SegmentControl - 分段控制器组件，带滑块的多段 Tab 切换器。

```Kotlin
private var tabItems by observableList<SegmentItemData>()

// ...createdfor (i in 0..2) tabItems.add(SegmentItemData().apply {
    id = i
    title = "标签 $i"
})

// ...body
SegmentControl {
    attr {
        tabDataList = ctx.tabItems
        mode = SegmentControlMode.FILL
        totalWidth = pagerData.pageViewWidth - 32f
    }
    event {
        onSegmentClick { index, item ->
            // 切换到新标签
        }
        onReClick { index, item ->
            // 重复点击当前标签
        }
    }
}
```

SegmentControl 外观规格：

- 容器：高度 32f、圆角 6f、背景色 `bg_gray_03`，左右 padding 各 4f
- 指示器（indicator）：高度 28f、圆角 4f、白色背景，绝对定位覆盖当前选中 item
- 每个 item 默认文本字号 14f，选中时文字变为 Medium 字重 + `text_100` 色，未选中为 Normal + `text_80` 色（带 0.3s 颜色过渡）

支持两种布局模式：

| 模式                      | 说明                                                         |
| ------------------------- | ------------------------------------------------------------ |
| `SegmentControlMode.FILL` | 填充模式：将水平空间平分为 n 份，由调用者通过 `totalWidth` / `itemWidth` 控制整体宽度 |
| `SegmentControlMode.HUG`  | 自适应模式：每个 item 宽度由 `itemWidth` 指定，包括水平 padding 各 6f |

## API

### SegmentControl 属性（`SegmentControlAttr`）

| **name**               | **type**                          | **功能**                                                     | **default value**         |
| ---------------------- | --------------------------------- | ------------------------------------------------------------ | ------------------------- |
| `tabDataList` 🌟        | `ObservableList<SegmentItemData>` | Tab 数据列表                                                 | `observableList()`        |
| `mode` 🌟               | `SegmentControlMode`              | 布局模式：`FILL` / `HUG`                                     | `SegmentControlMode.FILL` |
| `totalWidth` 🌟         | `Float?`                          | FILL 模式下容器总宽度（用于自动计算 `itemWidth = (totalWidth - 8f) / itemCount`）；若 `itemWidth` 已指定则无效 | `null`                    |
| `itemWidth` 🌟          | `Float?`                          | 各 item 的固定宽度（HUG 必填，FILL 可选）                    | `null`                    |
| `scrollBySelf`         | `Boolean`                         | 是否由组件内部自行驱动 indicator 动画（内嵌不可见 PageList） | `true`                    |
| `manualSwipeLockTimer` | `Int`                             | 手动点击后 indicator 锁定时间（毫秒），防止外部滑动回调覆盖手动选中 | `300`                     |

#### 属性方法

| **方法**                     | **功能**                                                     |
| ---------------------------- | ------------------------------------------------------------ |
| `scrollParams(scrollParams)` | 传入外部 PageList 的 `ScrollParams`（仅当 `scrollBySelf = false` 时使用） |

### SegmentControl 事件（`SegmentControlEvent`）

| **name**           | **type**                         | **功能**                                          |
| ------------------ | -------------------------------- | ------------------------------------------------- |
| `onSegmentClick` 🌟 | `(Int, SegmentItemData) -> Unit` | 点击一个非当前选中的 segment 触发（切换到新标签） |
| `onReClick` 🌟      | `(Int, SegmentItemData) -> Unit` | 已经在当前 segment 的情况下重复点击触发           |

### Tab 项数据类（SegmentItemData）

| **name**     | **type**                            | **功能**                                                     | **default value** |
| ------------ | ----------------------------------- | ------------------------------------------------------------ | ----------------- |
| `id` 🌟       | `Int`                               | 唯一标识符（事件回调根据此值匹配索引）                       | `0`               |
| `title`      | `String`                            | Tab 文字                                                     | `""`              |
| `leftIcon`   | `String?`                           | 左侧 iconFont 名称（便捷方式，自动创建 Icon 组件）           | `null`            |
| `rightIcon`  | `String?`                           | 右侧 iconFont 名称（便捷方式，自动创建 Icon 组件）           | `null`            |
| `leftView`   | `(ViewContainer<*, *>.() -> Unit)?` | 左侧自定义视图（优先级高于 `leftIcon`）                      | `null`            |
| `rightView`  | `(ViewContainer<*, *>.() -> Unit)?` | 右侧自定义视图（优先级高于 `rightIcon`）                     | `null`            |
| `customView` | `(ViewContainer<*, *>.() -> Unit)?` | 完全自定义视图；若设置，忽略 `title` / `leftView` / `rightView` / `leftIcon` / `rightIcon` | `null`            |
| `data`       | `Any?`                              | 附带的业务数据                                               | `null`            |

### 公开方法

通过 ref 获取 SegmentControlView 后调用：

| **方法**          | **功能**                                                     |
| ----------------- | ------------------------------------------------------------ |
| `setIndex(index)` | 手动设置选中的索引。会触发对应的 `onSegmentClick`/ `onReClick` 回调 |
| `getTabItems()`   | 获取所有 `TabItem` 的 `ViewRef`                              |

## 参考代码

### 基础用法：FILL 模式 + totalWidth

把整个 `totalWidth` 等分给若干 item。最常见的场景：全宽分段器：

```Kotlin
private var fillItems by observableList<SegmentItemData>()

// ...createdfor (i in 0..2) fillItems.add(SegmentItemData().apply {
    id = i
    title = "标签 $i"
})

// ...body
SegmentControl {
    attr {
        tabDataList = ctx.fillItems
        mode = SegmentControlMode.FILL
        totalWidth = pagerData.pageViewWidth - 32f
    }
    event {
        onSegmentClick { index, item ->
            // 切换
        }
    }
}
```

### FILL 模式 + 左侧图标

通过 `leftIcon` 直接指定 iconFont 名称，组件自动创建 Icon 组件，选中/未选中时颜色自动切换：

```Kotlin
for (i in 0..2) iconItems.add(SegmentItemData().apply {
    id = i
    title = "标签 $i"
    leftIcon = "shangcheng"
})

SegmentControl {
    attr {
        tabDataList = ctx.iconItems
        mode = SegmentControlMode.FILL
        totalWidth = pagerData.pageViewWidth - 32f
    }
}
```

### 仅图标（无文字）

当 item 没有 `title` 且只有图标时，图标尺寸会自动从 14f 变为 20f：

```Kotlin
for (i in 0..2) iconOnlyItems.add(SegmentItemData().apply {
    id = i
    leftIcon = if (i == 1) "xiajiantou-mian16" else "shangcheng"
})

SegmentControl {
    attr {
        tabDataList = ctx.iconOnlyItems
        mode = SegmentControlMode.FILL
        totalWidth = pagerData.pageViewWidth - 32f
    }
}
```

### HUG 模式

HUG 模式必须通过 `itemWidth` 指定每个 item 的固定宽度。整体宽度由 item 数量决定，适合紧凑的筛选切换：

```Kotlin
for (i in 0..3) hugItems.add(SegmentItemData().apply {
    id = i
    title = "标签 $i"
})

SegmentControl {
    attr {
        tabDataList = ctx.hugItems
        mode = SegmentControlMode.HUG
        itemWidth = 56f
    }
}
```

### HUG 模式 + 右侧图标

常见于带下拉箭头的筛选器（注意：SegmentControl 自身不处理下拉菜单逻辑，需要通过 `onSegmentClick` 或 `onReClick` 自行拉起 [PopViewSelect](https://slowisfast.feishu.cn/wiki/F6GNwo9sCiWLA9k2lVnc2Pp5n7g)）：

```Kotlin
for (i in 0..2) hugIconItems.add(SegmentItemData().apply {
    id = i
    title = "标签 $i"
    rightIcon = if (i != 1) "xiajiantou-mian16" else null
})

SegmentControl {
    attr {
        tabDataList = ctx.hugIconItems
        mode = SegmentControlMode.HUG
        itemWidth = 72f
    }
    event {
        onReClick { index, _ ->
            val tabItemList = this@SegmentControl.getTabItems()
            tabItemList.getOrNull(index)?.let {
                it.view?.createPopViewSelect(
                    location = PopViewLocation.BOTTOM,
                    horizontalAlign = PopViewHorizontalAlign.LEFT,
                    items = listOf(
                        PopViewItemData(index = 0, title = "hey girl"),
                        PopViewItemData(index = 1, title = "Man! What can I say")
                    )
                )
            }
        }
    }
}
```

### 自定义 item 视图（customView）

当文字 + 图标的组合无法满足需求时，用 `customView` 完全接管 item 内容。注意 `customView` 一旦设置，会**忽略** `title` / `leftView` / `rightView` / `leftIcon` / `rightIcon`：

```Kotlin
for (i in 0..2) customItems.add(SegmentItemData().apply {
    id = i
    title = "标签 $i"
    customView = {
        Text {
            attr {
                text("✦ 自定义 $i")
                fontSize(13f)
                color(ColorManager.text_80)
            }
        }
    }
})

SegmentControl {
    attr {
        tabDataList = ctx.customItems
        mode = SegmentControlMode.FILL
        itemWidth = 100f
    }
}
```

> `customView` 不能直接响应选中态 —— 若需要让自定义视图根据选中与否变化，只能通过外部的 `selectedIndex` observable 变量配合 `vbind` 手动处理。推荐只在选中态样式不重要的场景使用。

### 与外部 PageList 联动（scrollBySelf = false）

默认 `scrollBySelf = true` 时，组件内嵌一个高度为 0 的不可见 PageList 驱动 indicator 动画，完全自闭环。

如果你需要和页面上已有的 PageList 联动（比如 Tabs 风格的页签滑动），关闭 `scrollBySelf` 并手动转发 `ScrollParams`：

```Kotlin
private var segmentRef: ViewRef<SegmentControlView>? = nullprivate var pageListRef: ViewRef<PageListView<*, *>>? = null// ...body
SegmentControl {
    ref { ctx.segmentRef = it }
    attr {
        tabDataList = ctx.items
        mode = SegmentControlMode.FILL
        totalWidth = pagerData.pageViewWidth - 32f
        scrollBySelf = false
    }
    event {
        onSegmentClick { index, _ ->
            ctx.pageListRef?.view?.scrollToPageIndex(index, animated = true)
        }
    }
}

PageList {
    ref { ctx.pageListRef = it }
    attr {
        flexDirectionRow()
        pageItemWidth(pagerData.pageViewWidth)
        pageItemHeight(400f)
        defaultPageIndex(0)
    }
    event {
        scroll { params ->
            // 把 PageList 的 ScrollParams 转发给 SegmentControl 驱动 indicator
            ctx.segmentRef?.view?.getViewAttr()?.scrollParams(params)
        }
    }
    // ...
}
```

## 组件特性

### 两种布局模式对比

| 特性               | `FILL` 模式                             | `HUG` 模式                        |
| ------------------ | --------------------------------------- | --------------------------------- |
| 整体宽度           | `totalWidth`或 `itemWidth × count + 8f` | `itemWidth × count + 8f`          |
| item 宽度          | 自动均分                                | 必须显式指定 `itemWidth`          |
| 首尾 item 左右边距 | 4f                                      | 4f + 各自 item 的 6f 水平 padding |
| 典型场景           | 全宽切换（视图 Tab）                    | 紧凑筛选（例如表头筛选条）        |

`FILL` 模式下 `itemWidth` 和 `totalWidth` 的优先级：

1. 明确指定 `itemWidth` → 直接使用
2. 未指定 `itemWidth`，指定 `totalWidth` → 自动计算 `itemWidth = (totalWidth - 8f) / itemCount`
3. 两者均未指定 → item 使用 `flex(1f)`（需放在带明确宽度的容器中）

### indicator 动画

SegmentControl 底层使用 Kuikly 的 `Tabs` + `indicatorInTabItem` 机制实现 indicator，通过 `ScrollParams` 驱动平滑过渡。

- 默认动画使用 `SpringAnimation(durationMs = 300, damping = 0.85f, velocity = 1.2f)`，带轻微弹性效果
- `scrollBySelf = true` 时：组件内嵌一个高度 0、绝对定位的不可见 PageList，点击时通过 `scrollToPageIndex()` 驱动动画
- `scrollBySelf = false` 时：由外部传入 `ScrollParams` 驱动

### 防冲突的滑动锁

当用户手动点击 item 时，组件会启动一个 `manualSwipeLockTimer`（默认 300ms）的锁。锁定期间，外部传入的 `ScrollParams` 触发的 `bindValueChange({ state.selected })` 回调不会再改写 `selectedIndex`，避免 "点击后 indicator 跳回旧位置再滑过去" 的视觉 bug。

如果有新的点击发生在上次锁还没释放时，会通过 `timerPreempted` 标记让旧的 timer 失效、等新 timer 结束。

### 文字颜色过渡

item 的文字颜色（`text_80` ↔ `text_100`）切换时使用 `Animation.linear(0.3f)`。字重（400 ↔ 500）切换没有过渡（Kuikly 限制）。

### customView 的局限

设置 `customView` 的 item 不会自动响应选中态：

- 颜色切换、字重切换、图标颜色切换都**不再生效**
- indicator 仍然会正常滑动覆盖 customView

如果需要 customView 随选中态变化，需要在外部维护 `selectedIndex`，并在 `customView` 里用 `vbind({ ctx.selectedIndex })` 自行判断当前 item 的 id 是否等于选中项。