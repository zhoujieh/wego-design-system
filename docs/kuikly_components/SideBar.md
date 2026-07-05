Demo 页 page 名称：`SideBarDemoPage`

## 概览

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MzdmYzljMDkxMmYxYWQyMTIwZGQxYTc4N2UyNWM2NTNfMTlUOVk1YXN4V0xxNXZRUVdlZWdVUEVOZXRnSUpWNW1fVG9rZW46T1VhV2JUb0tSb3UyaXF4TVUyRGMzUW9Tbk1HXzE3NzY3NzM5NDA6MTc3Njc3NzU0MF9WNA)

SideBar —— 左侧可滚动标签栏 + 右侧滚动同步内容区的双栏布局组件，常用于分类浏览、目录导航等场景（如商品分类、通讯录字母索引、设置页目录等）。

```Kotlin
SideBar {
    attr {
        sidebarHeight = 500f
        sections = listOf(
            SideBarSection(
                id = "fruits",
                label = "Fruits",
                contentView = { section ->
                    // 渲染右侧内容行
                }
            ),
            SideBarSection(
                id = "vegetables",
                label = "Vegetables",
                contentView = { section -> /* ... */ }
            )
        )
    }
    event {
        onSectionChange { index, section -> /* ... */ }
    }
}
```

### 滚动同步机制

组件内部实现了双向滚动同步：

- **点击侧边栏 → 右侧滚动**：点击左侧标签后，右侧内容区自动滚动到对应区块顶部，并在 `SIDEBAR_TAP_DEBOUNCE_MS`（默认 200ms）内屏蔽右侧滚动回调，避免反向同步产生反馈循环。
- **右侧滚动 → 侧边栏高亮**：用户滚动右侧内容时，组件根据当前滚动偏移量定位可见区块，高亮对应侧边栏 item 并滚动侧边栏保持其可见（通过 `sideBarItemActiveIndexAnchor` 控制激活项锚点位置）。

### 高度测量的两种模式

SideBar 需要知道每个区块的高度才能正确实现滚动同步。支持两种模式：

| 模式         | 触发条件                          | 高度计算                                                 |
| ------------ | --------------------------------- | -------------------------------------------------------- |
| **动态模式** | `sectionItemHeight == 0f`（默认） | 每个区块的内容区通过 `layoutFrameDidChange` 上报实际高度 |
| **固定模式** | `sectionItemHeight > 0f`          | 按 `section.itemCount × sectionItemHeight` 计算          |

> **推荐**：如果每个标签对应的右侧内容有固定高度（如所有行 60f），使用固定模式可以跳过布局测量，**性能更好**；如果行高不确定（含图片、可变高度文本等），使用动态模式。

## API

### SideBarSection（区块数据模型）

| **name**        | **type**                                                   | **功能**                                                     | **default value**         |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------------------ | ------------------------- |
| `id` 🌟          | `String`                                                   | 区块唯一标识（滚动同步的 key）                               | `"${Random.nextFloat()}"` |
| `label` 🌟       | `String`                                                   | 左侧标签栏显示的文本，也是**默认标题的文本**                 | *(必填)*                  |
| `itemCount`     | `Int`                                                      | 内容行数，仅在固定高度模式（`sectionItemHeight > 0`）时用于计算区块高度 | `0`                       |
| `headerView`    | `(ViewContainer<*, *>.(section: SideBarSection) -> Unit)?` | 自定义区块标题（渲染为 sticky header），为 `null` 时使用默认文本标题 | `null`                    |
| `contentView` 🌟 | `ViewContainer<*, *>.(section: SideBarSection) -> Unit`    | 区块内容的渲染 lambda，参数为区块自身数据                    | `{}`                      |

### SideBar 属性（`SideBarViewAttr`）

#### 数据

| **name**             | **type**                         | **功能**             | **default value**  |
| -------------------- | -------------------------------- | -------------------- | ------------------ |
| `sections` 🌟*响应式* | `ObservableList<SideBarSection>` | 要展示的区块列表     | `observableList()` |
| `activeIndex`        | `Int`                            | 初始激活的侧边栏索引 | `0`                |

#### 布局

| **name**               | **type** | **功能**                         | **default value** |
| ---------------------- | -------- | -------------------------------- | ----------------- |
| `sidebarWidth`         | `Float`  | 左侧标签栏宽度                   | `108f`            |
| `sidebarHeight` 🌟      | `Float`  | 整体高度（必传）                 | `0f`              |
| `sidebarPaddingBottom` | `Float`  | 左侧标签栏底部内边距（如安全区） | `60f`             |
| `contentPaddingBottom` | `Float`  | 右侧内容区底部内边距（如安全区） | `300f`            |

#### 侧边栏 item 外观

| **name**                         | **type**  | **功能**                                     | **default value**          |
| -------------------------------- | --------- | -------------------------------------------- | -------------------------- |
| `sidebarBgColor`                 | `Color`   | 左侧标签栏背景色                             | `ColorManager.bg_100`      |
| `sidebarItemMinHeight`           | `Float`   | 每个 item 的最小高度                         | `44f`                      |
| `sidebarItemActiveBgColor`       | `Color`   | 激活 item 背景色                             | `Color.WHITE`              |
| `sidebarItemInactiveBgColor`     | `Color`   | 未激活 item 背景色                           | `ColorManager.bg_100`      |
| `sidebarItemActiveTextColor`     | `Color`   | 激活 item 文字颜色                           | `ColorManager.text_100`    |
| `sidebarItemInactiveTextColor`   | `Color`   | 未激活 item 文字颜色                         | `ColorManager.text_80`     |
| `sidebarItemFontSize`            | `Float`   | item 文字大小                                | `14f`                      |
| `showSidebarItemIndicator`       | `Boolean` | 是否显示激活 item 左侧的绿色指示条           | `false`                    |
| `sidebarItemIndicatorColor`      | `Color`   | 指示条颜色                                   | `ColorManager.green_1_100` |
| `sideBarItemActiveIndexAnchor` 🌟 | `Int`     | 滚动长列表时激活 item 保持在视口中的锚点位置 | `8`                        |

> `sideBarItemActiveIndexAnchor`：当右侧滚动切换到第 N 个区块时，侧边栏会滚动到使 `N - anchor` 项处于中间，从而保持激活项始终可见。

#### 右侧内容区外观

| **name**               | **type**  | **功能**                                                   | **default value**   |
| ---------------------- | --------- | ---------------------------------------------------------- | ------------------- |
| `contentBgColor`       | `Color`   | 右侧内容区背景色                                           | `Color.WHITE`       |
| `enableHover`🌟         | `Boolean` | 是否启用区块标题的 Hover 吸顶效果（H5 默认关闭）           | `!AppConfig.isH5()` |
| `sectionHeaderHeight`  | `Float`   | 默认标题高度（仅在未提供 `headerView` 时生效）             | `44f`               |
| `sectionHeaderBgColor` | `Color?`  | 默认标题背景色（为 null 时使用 `contentBgColor`）          | `null`              |
| `sectionItemHeight`    | `Float`   | 内容行固定高度（见上方"高度测量的两种模式"）；0 = 动态测量 | `0f`                |

### SideBar 事件（`SideBarViewEvent`）

| **name**            | **type**                                        | **功能**                                       |
| ------------------- | ----------------------------------------------- | ---------------------------------------------- |
| `onSectionChange` 🌟 | `(index: Int, section: SideBarSection) -> Unit` | 激活区块变化（点击侧边栏或滚动内容区都会触发） |
| `onScroll`          | `(scrollParams: ScrollParams) -> Unit`          | 右侧内容区滚动事件                             |

## 参考代码

### 基础用法：默认标题

最简用法。每个区块渲染一个默认文本标题 + 自定义内容：

```Kotlin
private var sections by observableList<SideBarSection>()

// ...created
sections.addAll(
    listOf("Fruits", "Vegetables", "Dairy", "Meat").mapIndexed { i, label ->
        SideBarSection(
            id = "sec_$i",
            label = label,
            contentView = { section ->
                repeat(5) { rowIndex ->
                    View {
                        attr {
                            height(52f)
                            flexDirectionRow()
                            alignItemsCenter()
                            paddingLeft(16f)
                            paddingRight(16f)
                        }
                        Text {
                            attr {
                                text("${section.label} — item ${rowIndex + 1}")
                                fontSize(14f)
                                color(ColorManager.text_100)
                            }
                        }
                    }
                }
            }
        )
    }
)

// ...body
SideBar {
    attr {
        sidebarHeight = 420f
        sections = ctx.sections
    }
    event {
        onSectionChange { index, section ->
            // 激活区块变化
        }
    }
}
```

### 使用 activeIndex 锚定初始激活项

在进入页面时默认激活第二个区块：

```Kotlin
SideBar {
    attr {
        sidebarHeight = 420f
        activeIndex = 1
        sections = ctx.sections
    }
}
```

### 自定义标题（headerView）

通过 `headerView` 自定义 sticky header。典型场景：带彩色强调条的分类标题、带操作按钮的 section 头、带数量徽章等：

```Kotlin
SideBarSection(
    id = "electronics",
    label = "Electronics",
    itemCount = 4,
    headerView = { section ->
        View {
            attr {
                flexDirectionRow()
                alignItemsCenter()
                backgroundColor(Color.WHITE)
                height(48f)
                paddingLeft(12f)
                paddingRight(12f)
                flex(1f)
            }
            // 彩色强调条
            View {
                attr {
                    width(4f)
                    height(20f)
                    borderRadius(2f)
                    backgroundColor(ColorManager.green_1_100)
                    marginRight(10f)
                }
            }
            Text {
                attr {
                    text(section.label)
                    fontSize(14f)
                    fontWeightBold()
                    color(ColorManager.text_100)
                    flex(1f)
                }
            }
            Text {
                attr {
                    text("4")
                    fontSize(11f)
                    color(ColorManager.text_80)
                }
            }
        }
    },
    contentView = { section -> /* ... */ }
)
```

### 固定行高模式（`sectionItemHeight`）

当所有内容行高度一致时，使用固定模式跳过布局测量，性能更好：

```Kotlin
SideBar {
    attr {
        sidebarHeight = 480f
        sectionItemHeight = 60f           // ← 固定行高
        sections = ctx.sections.map { section ->
            section.copy(itemCount = 4)   // ← 配合 itemCount 计算高度
        }
    }
}
```

> 固定模式下务必正确填写每个 section 的 `itemCount`，否则滚动同步会偏移。

### 显示激活 item 左侧指示条

开启后，激活的侧边栏 item 左侧会显示一条绿色竖条：

```Kotlin
SideBar {
    attr {
        sidebarHeight = 500f
        showSidebarItemIndicator = true
        sidebarItemIndicatorColor = ColorManager.green_1_100
        sections = ctx.sections
    }
}
```

### 定制侧边栏样式（颜色、宽度、item 高度）

```Kotlin
SideBar {
    attr {
        sidebarHeight = 500f
        sidebarWidth = 96f                                  // 更窄的侧边栏
        sidebarItemMinHeight = 48f                          // 更高的 item
        sidebarBgColor = ColorManager.bg_gray_06_pack
        sidebarItemInactiveBgColor = ColorManager.bg_gray_06_pack
        sidebarItemActiveBgColor = Color.WHITE
        sidebarItemActiveTextColor = ColorManager.green_1_100
        sidebarItemFontSize = 13f
        sections = ctx.sections
    }
}
```

### 自定义内容区背景 & 标题背景

默认情况下标题的背景色与 `contentBgColor` 一致，可以单独配置让标题与内容区有视觉区分：

```Kotlin
SideBar {
    attr {
        sidebarHeight = 500f
        contentBgColor = Color.WHITE
        sectionHeaderBgColor = ColorManager.bg_gray_03_pack   // 灰底标题
        sectionHeaderHeight = 36f
        sections = ctx.sections
    }
}
```

### 嵌入到 Scroller 中时关闭 Hover

当 SideBar 嵌入到可滚动的父容器时，`Hover` 的吸顶效果可能与外部 Scroller 冲突。此时应关闭 `enableHover`：

```Kotlin
Scroller {
    attr { flex(1f) }
    SideBar {
        attr {
            sidebarHeight = 480f
            enableHover = false    // ← 关闭 sticky header
            sections = ctx.sections
        }
    }
}
```

> H5 平台 `enableHover` 的默认值就是 `false`，因为 H5 对 Hover 组件支持有限。

### 监听激活区块变化

可用于在页面其它位置显示当前区块、埋点、更新面包屑等：

```Kotlin
private var currentSectionLabel by observable("")

// ...body
SideBar {
    attr {
        sidebarHeight = 420f
        sections = ctx.sections
    }
    event {
        onSectionChange { index, section ->
            ctx.currentSectionLabel = section.label
            // 可选：埋点// wg.logI("SideBar", "active changed to ${section.label}")
        }
        onScroll { scrollParams ->
            // 处理原始滚动事件（滚动方向、速度等）
        }
    }
}
```

### 带内容适配的安全区 padding

当 SideBar 位于页面底部（例如配合 BottomBar 使用），可以通过底部 padding 为安全区 / 底部操作栏留出空间：

```Kotlin
SideBar {
    attr {
        sidebarHeight = pagerData.pageViewHeight - navBarHeight - bottomBarHeight
        sidebarPaddingBottom = 80f      // 侧边栏底部留白（如按钮遮挡区域）
        contentPaddingBottom = 200f     // 内容区底部留白（避免最后一个 section 被遮挡）
        sections = ctx.sections
    }
}
```

## 组件特性

### 标题渲染逻辑

- `section.headerView == null`：使用组件内置的默认文本标题：
  - 高度： `sectionHeaderHeight`
  - 文字： `section.label`
  - 字号： `SECTION_HEADER_FONT_SIZE`（16f）
  - 居左对齐，水平 padding 12f
  - 背景色： `sectionHeaderBgColor ?: contentBgColor`
- `section.headerView != null`：完全由你的 lambda 决定渲染内容，组件内部通过 `layoutFrameDidChange` 自动测量实际高度用于滚动同步（因此高度可以任意，不需要手动告知）。

### Hover 吸顶

当 `enableHover = true`（非 H5 默认值）时，每个区块标题会被包裹在一层 `Hover` 组件中，向上滚动时吸附在内容区顶部。需要注意两点：

1. SideBar 内部的 `List` 自身是独立滚动的，`Hover` 只作用于这个内部 List 的滚动
2. 如果 SideBar 外部又被包裹在滚动容器中，Hover 可能出现表现异常，此时应该关闭

### 双向滚动同步的细节

- **点击侧边栏的防抖**：点击后 `isSidebarDriven` 置 true，并在 `SIDEBAR_TAP_DEBOUNCE_MS`（200ms）内阻断右侧滚动事件的激活同步处理。这是为了避免程序化滚动触发的 `scroll` 回调倒过来修改 `activeIndex`，产生闪烁。
- **右侧滚动定位激活项**：每次滚动事件中，组件按 `offsetY` 从头遍历 sections，累加 `headerHeightFor + contentHeightFor` 直到找到当前可见区块。
- **侧边栏滚动跟随**：右侧滚动导致激活项切换时，侧边栏自动调用 `scrollToPosition((newIndex - anchor).coerceAtLeast(0))` 保持激活项可见。

### 高度缓存

- `sectionContentHeights`（`HashMap<String, Float>`）：以 `section.id` 为 key 存储动态模式下的内容高度。
- `sectionHeaderHeights`：同上，用于存储自定义 `headerView` 的实测高度。
- `sections.size` 变化时自动清空 `sectionContentHeights`（但不会清空 `sectionHeaderHeights`）。如果你在运行时替换 section 的 `headerView`，可能需要手动处理。

### 与其他组件的区别

| 组件                                                         | 典型场景           | 特点                     |
| ------------------------------------------------------------ | ------------------ | ------------------------ |
| **SideBar**                                                  | 分类浏览、目录导航 | 左右双栏，滚动同步       |
| [TabBar](https://slowisfast.feishu.cn/wiki/AqatwD457i1S4IkQDH9cbzRQnRh) | 页签切换           | 横向 Tab + PageList 联动 |
| [SegmentControl](https://slowisfast.feishu.cn/wiki/KVsYwWPdSi7ZLKk5YfucvJcAnWb) | 状态切换、筛选     | 紧凑的横向分段器         |
| [Stepper](https://slowisfast.feishu.cn/wiki/BKbzwGn8Eiwf7Ck1jjmcE242nIe) | 流程进度           | 线性的步骤指示器         |