# Breadcrumb

Demo 页 page 名称：`KuiklyBreadcrumbDemo`

## 概览

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=NDdlM2JmZmVkYTEyM2I0NTBkM2I5MDA1ZGZlOGFhMjNfSTVVQWhLNjVwbUQwcTRHWUpwbVJpaXdMSm5jdHVLckdfVG9rZW46SEtHQmJSN0hqb2lzRFh4SHRrRGNiWG5HbkZkXzE3NzY2ODY5MTA6MTc3NjY5MDUxMF9WNA)

Breadcrumb 是面包屑导航组件，用于展示层级路径，支持点击聚焦、自动回退和水平滚动。

```Kotlin
private var breadcrumbRef: ViewRef<BreadcrumbView>? = null// ...body
Breadcrumb {
    ref { ctx.breadcrumbRef = it }
    attr {
        initialStack = listOf(
            BreadcrumbItem("1", "Home",     level = 0),
            BreadcrumbItem("2", "Category", level = 1),
            BreadcrumbItem("3", "Sub",      level = 2),
        )
        autoFocus = true
        autoBack  = false
        maxChars  = 10
    }
    event {
        onClick  { item -> /* 点击了非聚焦的面包屑 */ }
        onReClick{ item -> /* 点击了已聚焦的面包屑 */ }
    }
}

// 动态操作
ctx.breadcrumbRef?.view?.push(BreadcrumbItem("4", "Detail", level = 3))
ctx.breadcrumbRef?.view?.pop()
```

面包屑内部使用水平 `Scroller`，当面包屑数量超出可视区域时可左右滚动。每个面包屑之间以右箭头（`youjiantou16`）分隔。

## API

### BreadcrumbItem

| **name**  | **type** | **功能**                                 |
| --------- | -------- | ---------------------------------------- |
| `id` 🌟    | `String` | 唯一标识符                               |
| `name` 🌟  | `String` | 显示标签                                 |
| `level` 🌟 | `Int`    | 语义深度（用于 `autoBack` 时的比较判断） |

### Breadcrumb 属性（`BreadcrumbAttr`）

| **name**         | **type**               | **功能**                                                     | **default value** |
| ---------------- | ---------------------- | ------------------------------------------------------------ | ----------------- |
| `initialStack` 🌟 | `List<BreadcrumbItem>` | 初始面包屑栈，在 `created()` 时加载                          | `emptyList()`     |
| `autoFocus` 🌟    | `Boolean`              | 点击非聚焦面包屑时是否自动将焦点移到该面包屑。若 `autoBack` 为 true，忽略此项 | `true`            |
| `autoBack` 🌟     | `Boolean`              | 点击 level 低于当前聚焦的面包屑的项时，是否自动删除其后所有面包屑并聚焦到被点击项 | `false`           |
| `maxChars`       | `Int`                  | 每个面包屑标签的最大显示字符数，超出部分截断并追加 "…"       | `12`              |
| `maxWidth`       | `Float?`               | 单个面包屑文本的最大宽度（样式约束），超出部分省略           | `null`            |

### Breadcrumb 事件（`BreadcrumbEvent`）

| **name**      | **type**                   | **功能**                   |
| ------------- | -------------------------- | -------------------------- |
| `onClick` 🌟   | `(BreadcrumbItem) -> Unit` | 点击非当前聚焦面包屑时触发 |
| `onReClick` 🌟 | `(BreadcrumbItem) -> Unit` | 点击已聚焦的面包屑时触发   |

### 公开属性和方法

通过 `ref` 获取 `BreadcrumbView` 实例后可调用：

| **方法**                                  | **功能**                                                     |
| ----------------------------------------- | ------------------------------------------------------------ |
| `push(item: BreadcrumbItem)` 🌟            | 在栈顶追加一个面包屑并自动聚焦                               |
| `pop()` 🌟                                 | 移除栈顶面包屑；若移除的是聚焦项，焦点回退到新的栈顶         |
| `changeAt(index, item)` 🌟                 | 替换指定位置的面包屑                                         |
| `dump(count)` 🌟                           | 从栈尾移除 `count` 个面包屑；若聚焦项被移除，焦点回退到新的栈顶 |
| **属性**                                  | **功能**                                                     |
| `stack` (`mutableListOf<BreadcrumbItem>`) | 组件当前的 stack                                             |

## 参考代码

### 基础用法（autoFocus ON, autoBack OFF）

点击任意面包屑会聚焦它，但不会删除后续面包屑：

```Kotlin
Breadcrumb {
    attr {
        initialStack = listOf(
            BreadcrumbItem("1", "Home",     level = 0),
            BreadcrumbItem("2", "Category", level = 1),
            BreadcrumbItem("3", "Sub",      level = 2),
        )
        autoFocus = true
        autoBack  = false
    }
    event {
        onClick  { item -> /* 切换聚焦，不删除面包屑 */ }
        onReClick{ item -> /* 重复点击已聚焦项 */ }
    }
}
```

### 自动回退模式（autoBack ON）

点击前面的面包屑时，自动删除其后所有面包屑并聚焦到被点击项：

```Kotlin
Breadcrumb {
    attr {
        initialStack = listOf(
            BreadcrumbItem("a", "Root",    level = 0),
            BreadcrumbItem("b", "Level 1", level = 1),
            BreadcrumbItem("c", "Level 2", level = 2),
            BreadcrumbItem("d", "Level 3", level = 3),
        )
        autoFocus = true
        autoBack  = true
        maxChars  = 8
    }
    event {
        onClick  { item -> /* 自动回退到此面包屑 */ }
        onReClick{ item -> /* 重复点击 */ }
    }
}
```

### 动态操作（push / pop / dump / changeAt）

通过 `ref` 获取 `BreadcrumbView` 实例后，使用公开方法动态修改面包屑栈：

```Kotlin
private var breadcrumbRef: ViewRef<BreadcrumbView>? = nullprivate var pushCounter = 3// ...body
Breadcrumb {
    ref { ctx.breadcrumbRef = it }
    attr {
        initialStack = listOf(
            BreadcrumbItem("1", "Home",     level = 0),
            BreadcrumbItem("2", "Category", level = 1),
            BreadcrumbItem("3", "Sub",      level = 2),
        )
    }
    event {
        onClick  { item -> /* ... */ }
        onReClick{ item -> /* ... */ }
    }
}

// 追加面包屑
WGButton {
    attr { text = "Push" }
    event {
        onClick {
            ctx.pushCounter++
            ctx.breadcrumbRef?.view?.push(
                BreadcrumbItem(
                    id    = ctx.pushCounter.toString(),
                    name  = "Item ${ctx.pushCounter}",
                    level = ctx.pushCounter
                )
            )
        }
    }
}

// 移除栈顶
WGButton {
    attr { text = "Pop" }
    event { onClick { ctx.breadcrumbRef?.view?.pop() } }
}

// 移除末尾 2 个
WGButton {
    attr { text = "Dump 2" }
    event { onClick { ctx.breadcrumbRef?.view?.dump(2) } }
}

// 替换指定位置
WGButton {
    attr { text = "Change[1]" }
    event {
        onClick {
            ctx.breadcrumbRef?.view?.changeAt(
                1, BreadcrumbItem("2", "Changed!", level = 1)
            )
        }
    }
}
```

### 长标签

标签较长时会自动省略。此外，若标签行超出容器宽度，可以滚动。

```Kotlin
Breadcrumb {
    attr {
        initialStack = listOf(
            BreadcrumbItem("p", "Very Long Name Here",   level = 0),
            BreadcrumbItem("q", "Another Lengthy Label", level = 1),
            BreadcrumbItem("r", "Even More Text",        level = 2),
            BreadcrumbItem("s", "Short",                 level = 3),
        )
        autoFocus = true
        maxChars  = 6  // 超过 6 个字符截断为 "XXXXX…"
    }
}
```

## 组件特性

### 焦点机制

- 组件内部维护一个 `focusedIndex`，表示当前聚焦的面包屑索引。
- 初始化时自动聚焦最后一个面包屑。
- 聚焦的面包屑文字颜色为 `text_100`（深色），非聚焦为 `text_80`（浅色）。

### autoBack 行为

当 `autoBack = true` 时，点击一个索引小于 `focusedIndex` 的面包屑会触发以下操作：

1. 计算需要移除的面包屑数量：`stack.size - 1 - clickedIndex`
2. 调用 `dump()` 移除这些面包屑
3. 聚焦到新的栈顶（即被点击的面包屑）
4. 触发 `onClick` 回调

此行为覆盖 `autoFocus` 设置。

### 标签截断

当面包屑名称长度超过 `maxChars` 时，会截断为前 `maxChars - 1` 个字符并追加 "…"。也可以通过 `maxWidth` 设置像素级宽度限制，由组件内部在布局完成后动态约束。

### 样式规格

| 属性           | 值                      |
| -------------- | ----------------------- |
| 容器高度       | 48                      |
| 左右内边距     | 16                      |
| 面包屑字号     | 16                      |
| 面包屑字重     | Medium                  |
| 分隔符图标     | `youjiantou16`（16x16） |
| 分隔符颜色     | `text_30`               |
| 分隔符左右间距 | 各 8                    |

### 滚动行为

组件外层是一个水平 `Scroller`，关闭了弹性效果（`bouncesEnable(false)`）和滚动指示器（`showScrollerIndicator(false)`）。当面包屑总宽度超出容器时可左右滑动。