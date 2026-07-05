# NavBar

> p.s. 这是组件库里最复杂的组件。

Demo 页 page 名称：`KuiklyNavBar3Page`

## 概览

NavBar 是页面顶部的导航栏组件，负责承载标题、返回/关闭按钮、以及右侧操作区。它是几乎每个页面都会用到的基础组件。

```Kotlin
NavBar {
    attr {
        leftButtonType = NavBarLeftButtonType.BACK
        text = "页面标题"
    }
    event {
        backClick {
            // 处理返回
        }
    }
}
```

> **注意**：NavBar 本身不包含状态栏高度的占位，你需要在 NavBar 上方自己加一个 `View { attr { height(ctx.pageData.statusBarHeight) } }`。

NavBar 有三种主要布局模式：

1. **标准模式** — 有左侧按钮 + 居中标题 + 右侧操作区 

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=N2MwNmRiOTkyZmY0ZGJlNmM5ZDljNTQyZDY2NDAxM2FfS2pWdzZqNnhhbG1hbVRrcnZtc0c2alNUSVJzdGxFYkpfVG9rZW46WUFZcmJlT1hvb1FHMHd4OGpCdWNhY2N2blBkXzE3NzU3Mzg1NDI6MTc3NTc0MjE0Ml9WNA)

2. **无按钮模式** — 仅标题区，可选择左对齐或居中 
![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDUxMWMzZDQ4N2RjMjBlNGE2MzI4ZGRlZDU4M2RiNzZfYlBBeXpSRnh6Y1dLOUU1emtRTWhjcG15YnQ4ZXpPOTJfVG9rZW46VW12c2I5Rkl1b1RIOHh4cFNvVWNaczVFbjliXzE3NzU3Mzg1NDI6MTc3NTc0MjE0Ml9WNA) 

3. **搜索模式** — 左侧可选按钮 + 搜索框 + 可选右侧操作区（搜索框的详细文档见 [Search.md](./Search.md)）
![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=YTBhMWNkYjMxYzZhYjAxMmUxYzBhNTYwYjczOTA5MDdfY1dWd1VscnpSUWFBWnQxdjlQZWc2SUVtRzE2TmYzMzhfVG9rZW46TlpFZWJSb0FGbzU5QUR4bWJvdGNXa0ZEblRoXzE3NzU3Mzg1NDI6MTc3NTc0MjE0Ml9WNA)


> 不包括顶部安全区和背景色。

## API

### NavBar 属性（`NavBarAttr`）

#### 左侧按钮

| **name**         | **type**               | **功能**                                                    | **default** |
| ---------------- | ---------------------- | ----------------------------------------------------------- | ----------- |
| `leftButtonType` | `NavBarLeftButtonType` | 左侧按钮类型，见下方枚举                                   | `NONE`      |
| `leftButtonText` | `String`               | 左侧文字按钮（仅当 `leftButtonType = NONE` 时生效）        | `""`        |

`leftButtonType` 和 `leftButtonText` 是互斥的：如果设置了 `leftButtonType`，`leftButtonText` 就不会显示。如果两者都不设置，则没有左侧按钮，标题区可以选择左对齐或居中。

#### 主题区（Theme）

标题区的显示配置。简单用法直接设 `text` 就够了，复杂场景用 `ThemeConfig`。

| **name**             | **type**       | **功能**                                         | **default**     |
| -------------------- | -------------- | ------------------------------------------------ | --------------- |
| `text`               | `String`       | 标题文字（快捷方式，会覆盖 themeConfig 里的值）  | `""`            |
| `isCenter`           | `Boolean`      | 无左侧按钮时，标题是否居中（有按钮时始终居中）   | `false`         |
| `themeConfig`        | `ThemeConfig`  | 详细的标题区配置，见下方说明                     | `ThemeConfig()` |
| `customThemeContent` | `ViewBuilder?` | 完全自定义标题区内容（覆盖 themeConfig）         | `null`          |

#### 右侧操作区

右侧最多可以放 3 个操作按钮，通常使用 `NavBarActionButton` 组件（详见 [NavBarActionButton.md](./NavBarActionButton.md)）。

| **name**           | **type**       | **功能**                 | **default** |
| ------------------ | -------------- | ------------------------ | ----------- |
| `actionComponent1` | `ViewBuilder?` | 右侧第一个操作按钮（左） | `null`      |
| `actionComponent2` | `ViewBuilder?` | 右侧第二个操作按钮       | `null`      |
| `actionComponent3` | `ViewBuilder?` | 右侧第三个操作按钮（右） | `null`      |

#### 搜索模式

开启搜索模式后，标题区会被替换为搜索框。搜索框本身是一个独立的 `Search` 组件（详见 [Search.md](./Search.md)），NavBar 只是把搜索相关的属性和事件透传给它。

| **name**                | **type**                  | **功能**                              | **default**          |
| ----------------------- | ------------------------- | ------------------------------------- | -------------------- |
| `showSearchBar`         | `Boolean`                 | 是否显示搜索框（开启后进入搜索模式）  | `false`              |
| `searchPlaceholder`     | `String?`                 | 搜索框占位文字                        | `null`（显示"搜索"） |
| `autoHidePlaceHolder`   | `Boolean`                 | 有图搜时（`picsList` 非空）自动隐藏占位符，清空后恢复 | `false`              |
| `showSelectImageButton` | `Boolean`                 | 搜索框是否显示图片按钮                | `false`              |
| `showScanButton`        | `Boolean`                 | 搜索框是否显示扫一扫按钮              | `false`              |
| `picsList`              | `ObservableList<String>`  | 搜索框左侧显示的图片列表（URL）       | `[]`                 |
| `blurInputOnReturn`     | `Boolean`                 | 回车后是否自动失焦                    | `false`              |
| `searchInputAttrConfig` | `(InputAttr.() -> Unit)?` | 自定义输入框属性（如 `returnKeyType`）| `null`               |

#### ModalFrame 联动属性

在 ModalFrame / ModalFrameX 内使用时，设置这些属性可以让 NavBar 和弹窗联动。

| **name**             | **type**  | **功能**                                                | **default** |
| -------------------- | --------- | ------------------------------------------------------- | ----------- |
| `linkToParentNavBar` | `Boolean` | 是否联动父级 ModalFrame（点击返回按钮时自动关闭 Modal） | `false`     |
| `linkDefaultButtons` | `Boolean` | 联动时是否使用默认按钮（下拉→叉号自动切换）             | `true`      |

### NavBar 事件（`NavBarEvent`）

| **name**                     | **type**                      | **功能**             |
| ---------------------------- | ----------------------------- | -------------------- |
| `backClick`                  | `() -> Unit`                  | 左侧按钮点击事件     |
| `searchBarRefCreated`        | `ViewRef<SearchView> -> Unit` | 传出搜索组件的引用   |
| `searchTextDidChange`        | `(String) -> Unit`            | 搜索框文本变化       |
| `searchTextClearClick`       | `() -> Unit`                  | 搜索框清除按钮点击   |
| `searchPictureClick`         | `() -> Unit`                  | 搜索框图片按钮点击   |
| `searchScanClick`            | `() -> Unit`                  | 搜索框扫一扫按钮点击 |
| `searchInputReturn`          | `() -> Unit`                  | 搜索框回车           |
| `searchInputFocus`           | `() -> Unit`                  | 搜索框聚焦           |
| `searchInputBlur`            | `() -> Unit`                  | 搜索框失焦           |
| `searchKeyboardHeightChange` | `(Float) -> Unit`             | 键盘高度变化         |

### `NavBarLeftButtonType` 枚举

| **值**        | **描述**                                       |
| ------------- | ---------------------------------------------- |
| `NONE`        | 无左侧按钮                                     |
| `BACK`        | 返回箭头（fanhui 图标）                        |
| `CLOSE`       | 叉号（cha 图标，较大）                         |
| `CLOSE_ROUND` | 圆形叉号（灰底圆形背景）                       |
| `DROP`        | 下拉箭头（圆形背景，用于 ModalFrame 下拉关闭） |

### `ThemeConfig` 配置

`ThemeConfig` 控制标题区的详细样式。大部分场景用 `text` 属性就够了，需要副标题、图标这些额外功能时才用到这个配置。

| **name**                  | **type**       | **功能**                                              | **default** |
| ------------------------- | -------------- | ----------------------------------------------------- | ----------- |
| `text`                    | `String`       | 主标题文字                                            | `""`        |
| `leftIcon`                | `String`       | 标题左侧图标（iconFont 名称）                         | `""`        |
| `leftIconUrl`             | `String`       | 标题左侧图标（图片 URL）                              | `""`        |
| `leftIconCommonAssetPath` | `String`       | 标题左侧图标（common asset 路径）                     | `""`        |
| `leftIconPageAssetPath`   | `String`       | 标题左侧图标（page asset 路径）                       | `""`        |
| `leftIconSize`            | `Float`        | 左侧图标大小                                          | `24f`       |
| `rightIcon`               | `String`       | 标题右侧图标（iconFont 名称）                         | `""`        |
| `rightIconSize`           | `Float`        | 右侧图标大小                                          | `16f`       |
| `paratext`                | `String`       | 副标题文字（显示在主标题下方）                        | `""`        |
| `maxTextLength`           | `Int`          | 主标题最大字符数（超出截断）                          | `10`        |
| `themeContent`            | `ViewBuilder?` | 完全自定义标题区内容，如果不为 `null`，会覆盖整个主题区 | `null`      |

## 参考代码

### 简单返回导航栏

最常见的用法。一个返回按钮 + 标题，点击返回关闭页面。

```Kotlin
View {
    attr { height(ctx.pageData.statusBarHeight) }
}
NavBar {
    attr {
        leftButtonType = NavBarLeftButtonType.BACK
        text = "页面标题"
    }
    event {
        backClick {
            getPager().acquireModule<RouterModule>(RouterModule.MODULE_NAME).closePage()
        }
    }
}
```

### 带右侧操作按钮

标题右边可以放操作按钮，最多 3 个。用 `actionComponent1/2/3` 传入 `NavBarActionButton`。

```Kotlin
NavBar {
    attr {
        leftButtonType = NavBarLeftButtonType.BACK
        themeConfig = ThemeConfig(text = "主题区", rightIcon = "wenhao")
        actionComponent1 = {
            NavBarActionButton {
                attr {
                    actionType = NavBarActionType.TEXT
                    navBarActionButtonConfig = NavBarActionButtonConfig(
                        text = "操作区",
                        onClick = { /* 处理点击 */ }
                    )
                }
            }
        }
    }
}
```

### 多个右侧按钮（不同类型混搭）

图标按钮 + 图标文字按钮的组合。

```Kotlin
NavBar {
    attr {
        leftButtonType = NavBarLeftButtonType.BACK
        themeConfig = ThemeConfig(
            paratext = "辅助说明文本",
            rightIcon = "wenhao",
            text = "主题区"
        )
        actionComponent1 = {
            NavBarActionButton {
                attr {
                    navBarActionButtonConfig = NavBarActionButtonConfig(
                        iconCommonAssetPath = "component/test2.png"
                    )
                    actionType = NavBarActionType.ICON
                }
            }
        }
        actionComponent2 = {
            NavBarActionButton {
                attr {
                    navBarActionButtonConfig = NavBarActionButtonConfig(
                        iconCommonAssetPath = "component/test.png",
                        iconHorizontalPadding = 4f,
                        text = "带icon操作区"
                    )
                    actionType = NavBarActionType.ICON_TEXT
                }
            }
        }
    }
}
```

### 三个图标按钮

```Kotlin
NavBar {
    attr {
        leftButtonType = NavBarLeftButtonType.CLOSE
        text = "主题区"
        actionComponent1 = {
            NavBarActionButton {
                attr {
                    navBarActionButtonConfig = NavBarActionButtonConfig(icon = "sandian16")
                    actionType = NavBarActionType.ICON
                }
            }
        }
        actionComponent2 = {
            NavBarActionButton {
                attr {
                    navBarActionButtonConfig = NavBarActionButtonConfig(icon = "yuanjia")
                    actionType = NavBarActionType.ICON
                }
            }
        }
        actionComponent3 = {
            NavBarActionButton {
                attr {
                    navBarActionButtonConfig = NavBarActionButtonConfig(icon = "fangkejilu")
                    actionType = NavBarActionType.ICON
                }
            }
        }
    }
}
```

### 带副标题和左侧图标

```Kotlin
NavBar {
    attr {
        leftButtonType = NavBarLeftButtonType.BACK
        themeConfig = ThemeConfig(
            text = "带icon主题区",
            leftIconCommonAssetPath = "component/test.png",
            paratext = "辅助说明文本",
            rightIcon = "wenhao"
        )
    }
}
```

### 左侧文字按钮 + 右侧 Button 样式

```Kotlin
NavBar {
    attr {
        leftButtonText = "取消"
        text = "主题区"
        actionComponent1 = {
            NavBarActionButton {
                attr {
                    navBarActionButtonConfig = NavBarActionButtonConfig(text = "确认收货")
                    actionType = NavBarActionType.BUTTON
                }
            }
        }
    }
}
```

### 搜索模式

搜索模式的详细用法见 [Search.md](./Search.md)，这里只列通过 NavBar 使用搜索框的方法。

```Kotlin
NavBar {
    attr {
        leftButtonType = NavBarLeftButtonType.BACK
        showSearchBar = true
        searchPlaceholder = "搜索商品"
        blurInputOnReturn = true
    }
    event {
        backClick { /* 返回 */ }
        searchTextDidChange { text -> /* 处理搜索 */ }
        searchInputReturn { /* 回车搜索 */ }
    }
}
```

### 在 ModalFrame 中使用

在弹窗里使用时，设置 `linkToParentNavBar = true`，NavBar 会自动处理关闭逻辑。

```Kotlin
BaseVisuals.showModalFrameX(
    pageId = ctx.pagerId,
    modalHeight = ctx.pagerData.pageViewHeight * 0.5f,
    titleBar = {
        NavBar {
            attr {
                leftButtonType = NavBarLeftButtonType.CLOSE
                linkToParentNavBar = true
                themeConfig = ThemeConfig(text = "弹窗标题")
            }
        }
    },
    content = {
        // 弹窗内容
    }
)
```

设置 `linkToParentNavBar = true` 后，NavBar 会自动：
- 点击返回/关闭按钮时关闭 ModalFrame（无需手动设置 `backClick`）
- 支持从 NavBar 区域下拉关闭 Modal
- 在 ModalFrameX 吸顶后，自动将下拉按钮切换为叉号（需要 `linkDefaultButtons = true`，默认就是 true）

## 组件特性

### 默认高度

标准模式默认高度 44px，在 ModalFrame 联动模式下默认 64px（吸顶后会切回 44px）。可以通过 `barHeight` 自定义，但不建议（请和设计沟通）。

### 标题自动居中

当左侧有按钮时，NavBar 会自动计算左右两侧的宽度差，通过补偿空间确保标题始终视觉居中。

### 标题截断

`ThemeConfig.maxTextLength` 默认为 10 个字符，超出会自动截断。

### 便捷函数

除了 `NavBar` 本身，还有几个带预设的快捷函数：

- `NavBarWithBackButton` — 自动设置 `leftButtonType = BACK`
- `NavBarWithCloseButton` — 自动设置 `leftButtonType = CLOSE`
- `NavBarWithSearchButton` — 自动设置 `showSearchBar = true`

用哪个都行，本质上都是同一个 `NavBarView`。
