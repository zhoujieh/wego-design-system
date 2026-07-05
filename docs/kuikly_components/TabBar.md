# TabBar

Demo 页 page 名称：`KTabBarPage`

## 概览

TabBar - 选项卡栏组件，必须与 `PageList` 联动实现页签切换效果。支持标准（STANDARD）和迷你（MINI）两种尺寸；支持等分布局和滚动布局。

```Kotlin
TabBar {
    attr {
        tabDataList = ctx.tabDataList
    }
    event {
        onTagClick { index, item ->
            // 处理选中事件
        }
    }
}
```

布局模式：

- **等分型**：Tab 数量 <= `maxSize`（默认 5）时，各 Tab 等宽平分整行宽度。
- **滑动型**：Tab 数量 > `maxSize` 时，自动启用水平滚动。

无论哪种布局模式，组件都会占整个屏幕的宽度。

## API

### DSL 工厂函数

| 函数             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| `TabBar { }`     | 创建标准 TabBar（`TabBarType.STANDARD`）                     |
| `TabBarMini { }` | 创建迷你 TabBar（`TabBarType.MINI`），等价于 `TabBar { attr { tabBarType = TabBarType.MINI } }` |

### TabBar 属性（`TabBarAttr`）

| **name**               | **type**                      | **功能**                                                     | **default value**            |
| ---------------------- | ----------------------------- | ------------------------------------------------------------ | ---------------------------- |
| `tabDataList` 🌟        | `ObservableList<TabItemData>` | Tab 数据列表                                                 | 空列表                       |
| `tabBarType`           | `TabBarType`                  | TabBar 类型（STANDARD / MINI）                               | `TabBarType.STANDARD`        |
| `maxSize`              | `Int`                         | 最大等分数量，超过则启用滚动模式                             | `5`                          |
| `height`               | `Float`                       | TabBar 高度                                                  | STANDARD: `56f`，MINI: `48f` |
| `manualSwipeLockTimer` | `Int`                         | 手动点击后的滑动锁定时间（ms），防止 PageList 滑动回调覆盖手动选中 | `300`                        |

#### 属性方法

| **方法**            | **功能**                                                |
| ------------------- | ------------------------------------------------------- |
| `useScroll()`🌟      | 强制使用滑动型布局（无论 Tab 数量多少）                 |
| `useDivide()`🌟      | 强制使用等分型布局（无论 Tab 数量多少）                 |
| `scrollParams(sp)`🌟 | 传入 PageList 的 `ScrollParams`，用于联动时同步滚动位置 |

### TabItemData（Tab 项数据类）

| **name**     | **type**                            | **功能**                                                     | **default value** |
| ------------ | ----------------------------------- | ------------------------------------------------------------ | ----------------- |
| `id` 🌟       | `Int`                               | 唯一标识符（点击回调根据此值匹配索引）                       | `0`               |
| `tabTitle` 🌟 | `String`                            | Tab 文字                                                     | `""`              |
| `leftIcon`   | `String?`                           | 左侧图标名（iconFont 名称），传入后自动创建 Icon 组件        | `null`            |
| `rightIcon`  | `String?`                           | 右侧图标名（iconFont 名称），传入后自动创建 Icon 组件        | `null`            |
| `leftView`   | `(ViewContainer<*, *>.() -> Unit)?` | 左侧自定义视图的构建 lambda（与 `leftIcon` 二选一，优先级更高） | `null`            |
| `rightView`  | `(ViewContainer<*, *>.() -> Unit)?` | 右侧自定义视图的构建 lambda（与 `rightIcon` 二选一，优先级更高） | `null`            |
| `data`       | `Any?`                              | 附带的业务数据                                               | `null`            |

### TabBar 事件（`TabBarEvent`）

| **name**      | **type**                     | **功能**                                                |
| ------------- | ---------------------------- | ------------------------------------------------------- |
| `onTagClick`🌟 | `(Int, TabItemData) -> Unit` | 新标签选中的回调，参数为 `index` 和对应的 `TabItemData` |
| `onReClick`🌟  | `(Int, TabItemData) -> Unit` | 已选中标签再次点击的回调                                |

> 请勿使用原生的 click 方法。

### TabBarView 公开方法

| **方法**          | **功能**                                        |
| ----------------- | ----------------------------------------------- |
| `setIndex(index)` | 手动设置选中的 Tab 索引，会触发对应的事件回调   |
| `scrollParams`    | 可直接赋值 `ScrollParams`，用于与 PageList 联动 |

## 参考代码

### 基础用法（与 PageList 联动）

TabBar + PageList，通过 `scrollParams` 实现滑动联动。

```Kotlin
private var tabDataList by observableList<TabItemData>()
private var tabBarRef: ViewRef<TabBarView>? = nullprivate var pageListRef: ViewRef<PageListView<*, *>>? = nulloverride fun created() {
    super.created()
    for (i in 0..2) {
        tabDataList.add(TabItemData(
            tabTitle = "标签$i"
            id = i
        ))
    }
}

override fun body(): ViewBuilder {
    val ctx = thisreturn {
        TabBar {
            ref { ctx.tabBarRef = it }
            attr {
                tabDataList = ctx.tabDataList
            }
            event {
                onTagClick { index, item ->
                    ctx.pageListRef?.view?.scrollToPageIndex(
                        index, animated = true, TabBarConstants.defaultAnimation
                    )
                }
                onReClick { index, item ->
                    // 已选中标签再次点击
                }
            }
        }

        PageList {
            attr {
                flexDirectionRow()
                pageItemWidth(pagerData.pageViewWidth)
                pageItemHeight(300f)
                defaultPageIndex(0)
                offscreenPageLimit(1)
            }
            ref { ctx.pageListRef = it }
            event {
                scroll {
                    ctx.tabBarRef?.view?.scrollParams = it
                }
            }
            vfor({ ctx.tabDataList }) { item ->
                View {
                    attr { allCenter() }
                    Text {
                        attr { text("Page ${item.id}") }
                    }
                }
            }
        }
    }
}
```

### 带图标的 Tab

通过 `leftIcon` 和 `rightIcon` 为 Tab 项添加图标：

```Kotlin
for (i in 0..2) {
    tabDataList.add(TabItemData(
        tabTitle = "标签$i"
        id = i
        leftIcon = "shangcheng"
        rightIcon = if (i != 2) "xiajiantou-mian16" else null
    ))
}
```

### 强制滑动型布局

即使 Tab 数量少于 `maxSize`，也使用滚动布局：

```Kotlin
TabBar {
    attr {
        useScroll()
        tabDataList = ctx.tabDataList
    }
    event {
        onTagClick { index, item ->
            ctx.pageListRef?.view?.scrollToPageIndex(
                index, animated = true, TabBarConstants.defaultAnimation
            )
        }
    }
}
```

### 迷你 TabBar

使用 `TabBarMini` 工厂函数快速创建迷你样式：

```Kotlin
TabBarMini {
    attr {
        tabDataList = ctx.tabDataList
    }
    event {
        onReClick { index, item ->
            // 处理重复点击
        }
    }
}
```

### 大量 Tab（自动滚动）

当 Tab 数量超过 `maxSize`（默认 5）时自动启用滚动模式：

```Kotlin
for (i in 0..10) {
    tabDataList.add(TabItemData().apply {
        tabTitle = "标签$i"
        id = i
    })
}

// TabBar 会自动变为可滚动
TabBar {
    attr {
        tabDataList = ctx.tabDataList
    }
    event {
        onTagClick { index, item ->
            // 处理选中
        }
    }
}
```

## 组件特性

### MINI 类型

- 高度固定为 48px（标准为 56px）。
- 字号为 14px（标准为 16px）。
- **始终使用滑动布局**，第一个 Tab 左侧 padding 为 16px，其余为 8px。

### 布局模式

- **等分型**：Tab 数量 <= `maxSize` 时，每个 Tab 宽度 = `pageViewWidth / tabCount`，指示器根据首个文本宽度居中。
- **滑动型**：Tab 数量 > `maxSize` 或调用 `useScroll()` 后，Tab 按内容宽度排列，可水平滚动。MINI 类型始终使用滑动型。

### 指示器

选中的 Tab 底部显示绿色指示器（高度 3px，颜色 `green_1_100`）。

- 等分型下，指示器根据首个文本宽度居中定位。
- 滑动型下，指示器贴合 Tab 项两侧内边距。

### 联动机制

TabBar 与 PageList 的联动通过 `ScrollParams` 实现：

1. PageList 的 `scroll` 事件将 `ScrollParams` 传给 TabBar 的 `scrollParams`，驱动指示器跟随滑动。
2. TabBar 的 `onTagClick` 中调用 `pageListRef?.view?.scrollToPageIndex()` 驱动 PageList 翻页。
3. 内置滑动锁机制（`manualSwipeLockTimer`，默认 300ms），防止手动点击后被 PageList 的滑动回调覆盖选中状态。