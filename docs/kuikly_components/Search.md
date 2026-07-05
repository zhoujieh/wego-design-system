# Search

Demo 页 page 名称：`KuiklyNavBarSearchPage`

## 概览

Search 是搜索输入框组件，通常在 NavBar 的搜索模式下使用，也可以独立使用。它提供了文本输入搜索、图片列表显示、清除按钮、图片选择按钮、扫一扫按钮等功能，并内置了右侧按钮的状态机动画。

最简单的用法是通过 NavBar 的搜索模式间接使用（NavBar 会帮你透传所有属性和事件）：

```Kotlin
NavBar {
    attr {
        showSearchBar = true
        searchPlaceholder = "搜索商品"
        blurInputOnReturn = true
    }
    event {
        searchTextDidChange { text -> /* 处理搜索 */ }
        searchInputReturn { /* 回车搜索 */ }
    }
}
```

如果你需要直接使用 Search 组件（不通过 NavBar），可以这样写：

```Kotlin
Search {
    attr {
        placeholder = "搜索"
        blurOnReturn = true
    }
    event {
        textDidChange { text -> /* 处理搜索 */ }
        inputReturn { /* 回车 */ }
    }
}
```

## 内部结构

Search 组件的布局从左到右依次为：

```
[ 搜索图标 | 图片区域(可选) | 输入框 | 清除/图片/扫描按钮(可选) ]
```

其中右侧按钮区域有两种渲染模式：
- **静态模式**（`showSelectImageButton = false` 或 `showScanButton = true`）：清除按钮有淡入动画，但不涉及复杂状态机
- **动画模式**（`showSelectImageButton = true` 且 `showScanButton = false`）：右侧按钮通过状态机驱动，在清除按钮和图片按钮之间有淡入淡出 + 滑动动画

## API

### Search 属性（`SearchAttr`）

| **name**                | **type**                  | **功能**                                                    | **default** |
| ----------------------- | ------------------------- | ----------------------------------------------------------- | ----------- |
| `placeholder`           | `String?`                 | 输入框占位文字                                              | `null`（显示"搜索"） |
| `autoHidePlaceHolder`   | `Boolean`                 | 有图搜（`picList` 非空）时自动隐藏 `placeholder`，列表清空后恢复 | `false`     |
| `showSelectImageButton` | `Boolean`                 | 是否显示图片按钮（启用后激活右侧按钮状态机动画）            | `false`     |
| `showScanButton`        | `Boolean`                 | 是否显示扫一扫按钮                                          | `false`     |
| `picList`               | `ObservableList<String>`  | 左侧显示的图片列表（URL 字符串），有图片时会显示缩略图和数量 | `[]`        |
| `blurOnReturn`          | `Boolean`                 | 回车后是否自动失焦                                          | `false`     |
| `inputAttrConfig`       | `(InputAttr.() -> Unit)?` | 自定义输入框属性（如 `returnKeyTypeSearch()`）              | `null`      |

> **注意**：通过 NavBar 间接使用时，属性名会加上 `search` 前缀或有轻微差异。比如 `placeholder` 在 NavBar 里叫 `searchPlaceholder`，`blurOnReturn` 叫 `blurInputOnReturn`。详见 [NavBar.md](./NavBar.md) 的搜索模式属性表。

### Search 事件（`SearchEvent`）

| **name**               | **type**             | **功能**         |
| ---------------------- | -------------------- | ---------------- |
| `textDidChange`        | `(String) -> Unit`   | 文本变化         |
| `textClearClick`       | `() -> Unit`         | 清除按钮点击     |
| `pictureClick`         | `() -> Unit`         | 图片按钮点击     |
| `scanClick`            | `() -> Unit`         | 扫一扫按钮点击   |
| `keyboardHeightChange` | `(Float) -> Unit`    | 键盘高度变化     |
| `inputReturn`          | `() -> Unit`         | 输入框回车       |
| `inputBlur`            | `() -> Unit`         | 输入框失焦       |
| `inputFocus`           | `() -> Unit`         | 输入框聚焦       |

### 公开方法

如果你需要在外部控制搜索框（比如通过 NavBar 的 `searchBarRefCreated` 拿到引用），`SearchView` 提供了以下方法：

| **方法**                          | **功能**                              |
| --------------------------------- | ------------------------------------- |
| `handleSetInputText(text: String)` | 设置输入框文本                        |
| `setPicList(imageUrls: List<String>)` | 设置图片列表（替换整个列表）       |
| `setFocusState(focus: Boolean)`    | 聚焦或失焦输入框                      |

此外，`inputRef` 是输入框的 `ViewRef<InputView>`，可以直接操作底层 Input 组件。

## 参考代码

### 基础搜索框（无额外按钮）

最简单的搜索框，没有图片按钮也没有扫一扫。输入时会触发 `textDidChange`，有输入内容时会显示清除按钮。

```Kotlin
NavBar {
    attr {
        blurInputOnReturn = true
        showSearchBar = true
        showSelectImageButton = false
        searchPlaceholder = "搜索商品"
    }
    event {
        searchTextDidChange { text -> /* 处理文本变化 */ }
        searchInputReturn { /* 回车搜索 */ }
    }
}
```

### 带图片按钮（状态机动画）

开启 `showSelectImageButton` 后，搜索框右侧会出现图片按钮。这个按钮和清除按钮之间有三种状态的动画转换：

- **EMPTY** — 无输入，只显示图片按钮
- **INPUTTING** — 有输入且聚焦，只显示清除按钮（图片按钮被清除按钮替换，有动画）
- **RESULT** — 有输入且失焦，同时显示清除和图片按钮

```Kotlin
NavBar {
    attr {
        blurInputOnReturn = true
        leftButtonType = NavBarLeftButtonType.BACK
        showSearchBar = true
        showSelectImageButton = true
    }
    event {
        backClick { /* 返回 */ }
        searchTextDidChange { text -> /* 处理文本变化 */ }
        searchTextClearClick { /* 清除 */ }
        searchPictureClick { /* 选图 */ }
        searchInputReturn { /* 回车搜索 */ }
    }
}
```

### 带图片列表

当有图片时（通过 `picsList` 传入），搜索图标右侧会显示第一张图片的缩略图和"共N张"的文字，有淡入动画。

```Kotlin
val picsList = ObservableList<String>()
picsList.add("https://picsum.photos/seed/a/200")
picsList.add("https://picsum.photos/seed/b/200")

NavBar {
    attr {
        blurInputOnReturn = true
        leftButtonType = NavBarLeftButtonType.BACK
        showSearchBar = true
        showSelectImageButton = true
        this.picsList = picsList
    }
    event {
        backClick { /* 返回 */ }
        searchTextDidChange { text -> /* 处理文本变化 */ }
        searchTextClearClick { /* 清除 */ }
        searchPictureClick { /* 选图 */ }
    }
}
```

### 有图搜时自动隐藏占位符

当用户已经通过 `picList` 添加了搜索图后，搜索框的图片本身已经表明搜索意图，文字占位符（"搜索商品"等）就显得多余。开启 `autoHidePlaceHolder = true` 后，`picList` 非空时会自动把 `placeholder` 设为空字符串，列表清空后再恢复原来的占位符。

```Kotlin
val picsList = ObservableList<String>()

NavBar {
    attr {
        blurInputOnReturn = true
        leftButtonType = NavBarLeftButtonType.BACK
        showSearchBar = true
        showSelectImageButton = true
        autoHidePlaceHolder = true
        searchPlaceholder = "搜索商品（有图时隐藏）"
        this.picsList = picsList
    }
    event {
        searchTextDidChange { /* ... */ }
        searchPictureClick {
            picsList.add("https://picsum.photos/seed/x/200")
            // 添加图片后，placeholder 自动变为 ""
        }
        searchTextClearClick {
            picsList.clear()
            // 清空图片后，placeholder 自动恢复为 "搜索商品（有图时隐藏）"
        }
    }
}
```

> 默认 `autoHidePlaceHolder = false`，行为不变；只有显式开启后才会响应 `picList` 变化。

### 带扫一扫按钮

`showScanButton` 可以在右侧出现扫一扫按钮。注意：当 `showScanButton = true` 时，即使 `showSelectImageButton = true`，也会使用静态模式（没有状态机动画，但两个按钮都会显示）。

```Kotlin
NavBar {
    attr {
        blurInputOnReturn = true
        leftButtonType = NavBarLeftButtonType.BACK
        showSearchBar = true
        showScanButton = true
        searchPlaceholder = "商品名/货号/条码"
        searchInputAttrConfig = { returnKeyTypeSearch() }
    }
    event {
        backClick { /* 返回 */ }
        searchTextDidChange { text -> /* 处理搜索 */ }
        searchTextClearClick { /* 清除 */ }
        searchScanClick { /* 扫码 */ }
        searchInputReturn { /* 回车搜索 */ }
    }
}
```

### 搜索框 + 右侧操作按钮

搜索模式下也可以在 NavBar 右侧加操作按钮。注意这个操作按钮是 NavBar 层面的，不是搜索框内部的按钮。

```Kotlin
NavBar {
    attr {
        showSearchBar = true
        leftButtonType = NavBarLeftButtonType.BACK
        showSelectImageButton = true
        actionComponent1 = {
            NavBarActionButton {
                attr {
                    actionType = NavBarActionType.TEXT
                    navBarActionButtonConfig = NavBarActionButtonConfig(
                        text = "发布",
                        onClick = { /* 发布 */ }
                    )
                }
            }
        }
    }
    event {
        backClick { /* 返回 */ }
        searchTextDidChange { text -> /* 处理搜索 */ }
        searchPictureClick { /* 选图 */ }
    }
}
```

## 组件特性

### 右侧按钮状态机

当 `showSelectImageButton = true` 且 `showScanButton = false` 时，Search 组件内置了一套状态机来管理清除按钮和图片按钮的动画转换：

| 状态 | 触发条件 | 显示的按钮 |
| --- | --- | --- |
| EMPTY | 无输入且无图片 | 仅图片按钮 |
| INPUTTING | 有输入且聚焦 | 仅清除按钮 |
| RESULT | 有输入/有图片且失焦 | 清除按钮 + 图片按钮 |

按钮之间的切换带有 fade + scale 动画和滑动效果，过渡很自然。状态变化通过 50ms 防抖来避免频繁触发。

### 图片区域

当 `picList` 不为空时，搜索图标右侧会显示：
- 第一张图片的 24x24 缩略图
- "共N张"的文字标签

图片区域出现时有 0.15s 的淡入动画。

### 清除行为

点击清除按钮会同时清空输入框文本，并触发 `textClearClick` 事件。如果你同时需要清除图片列表，需要在 `textClearClick` 的回调中手动调用 `setPicList(emptyList())`。

### 输入框属性定制

通过 `inputAttrConfig`（NavBar 里叫 `searchInputAttrConfig`）可以自定义输入框的属性，比如改变键盘回车键类型：

```Kotlin
searchInputAttrConfig = { returnKeyTypeSearch() } // 回车键显示为"搜索"
```
