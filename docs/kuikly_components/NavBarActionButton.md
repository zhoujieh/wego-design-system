# NavBarActionButton

Demo 页 page 名称：`KuiklyNavBar2Page`、`KuiklyNavBar3Page`

## 概览

`NavBarActionButton` 是导航栏右侧操作区的按钮组件，配合 NavBar 的 `actionComponent1/2/3` 使用。支持多种样式：纯文字、图标、图标+文字、按钮样式、图片、以及完全自定义。

```Kotlin
NavBar {
    attr {
        leftButtonType = NavBarLeftButtonType.BACK
        text = "页面标题"
        actionComponent1 = {
            NavBarActionButton {
                attr {
                    actionType = NavBarActionType.TEXT
                    navBarActionButtonConfig = NavBarActionButtonConfig(
                        text = "发布",
                        onClick = { /* 处理点击 */ }
                    )
                }
            }
        }
    }
}
```

一个 NavBar 最多可以放 3 个 `NavBarActionButton`，分别放在 `actionComponent1`、`actionComponent2`、`actionComponent3` 中。它们从左到右排列。

搭配 NavBar UI 示例：
![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=NTJjYmQ1YjJiZjA1ZDhkNTU4YTQyODVlYmZmM2Q4MThfQ1pObElmdW8yTEp5TkhqOGhjMk9iTlFEMEZpOFgwVGdfVG9rZW46VWhOVGJTNTV6b1B5M3N4YkliRWM3MlBUbkFkXzE3NzU3NDAyNjI6MTc3NTc0Mzg2Ml9WNA)


## API

### `NavBarActionButtonAttr`

| **name**                   | **type**                   | **功能**                     | **default**                  |
| -------------------------- | -------------------------- | ---------------------------- | ---------------------------- |
| `actionType`               | `NavBarActionType`         | 按钮类型，决定渲染方式       | `PICTURE`                    |
| `navBarActionButtonConfig` | `NavBarActionButtonConfig` | 按钮的详细配置               | `NavBarActionButtonConfig()` |

### `NavBarActionType` 枚举

| **值**      | **描述**                                                                 |
| ----------- | ------------------------------------------------------------------------ |
| `TEXT`      | 纯文字按钮（最多 4 个字，超出截断）                                      |
| `ICON`      | 图标按钮 — 自动判断：iconFont 名称渲染为 Icon 组件，URL/asset 路径渲染为图片 |
| `ICON_TEXT` | 图标 + 文字（上下排列），图标判断逻辑同 `ICON`                            |
| `BUTTON`    | WGButton 样式按钮（SCALE_32，绿色填充按钮）                              |
| `PICTURE`   | 图片按钮（通过 WGImage 渲染，适合需要精确控制图片尺寸的场景）            |
| `CUSTOM`    | 完全自定义内容（通过 `operateContent` 传入 ViewBuilder）                 |

> `ICON` 和 `PICTURE` 的区别：`ICON` 会根据传入的值自动判断是 iconFont 还是图片并选择对应的渲染方式；`PICTURE` 总是用 WGImage 渲染。一般用 `ICON` 就够了。

### `NavBarActionButtonConfig` 配置

| **name**                | **type**        | **功能**                        | **default** |
| ----------------------- | --------------- | ------------------------------- | ----------- |
| `text`                  | `String`        | 按钮文字                        | `""`        |
| `icon`                  | `String`        | 图标 iconFont 名称              | `""`        |
| `textColor`             | `Color`         | 文字和图标（iconFont）的颜色    | `ColorManager.text_100` |
| `iconUrl`               | `String`        | 图标图片 URL                    | `""`        |
| `iconCommonAssetPath`   | `String`        | 图标 common asset 路径          | `""`        |
| `iconPageAssetPath`     | `String`        | 图标 page asset 路径            | `""`        |
| `onClick`               | `(() -> Unit)?` | 点击回调                        | `null`      |
| `iconHorizontalPadding` | `Float`         | 按钮左右 padding                | `8f`        |
| `iconSize`              | `Float?`        | 自定义图标大小（不设置则使用默认值） | `null`  |
| `textSize`              | `Float?`        | 自定义字体大小（不设置则使用默认值） | `null`  |
| `operateContent`        | `ViewBuilder?`  | 自定义内容（`CUSTOM` 类型时使用） | `null`    |

图标来源有多种方式，优先级：`icon`（iconFont）> `iconUrl`（网络图片）> `iconCommonAssetPath`（本地 common 资源）> `iconPageAssetPath`（页面资源）。如果是 iconFont 名称，会渲染为 Icon 组件；如果是图片路径/URL，会渲染为 WGImage 组件。

## 参考代码

### 纯文字按钮

最常见的操作按钮，比如"发布"、"保存"、"操作区"这类。

```Kotlin
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
```

### 图标按钮（iconFont）

使用 iconFont 名称显示图标。

```Kotlin
actionComponent1 = {
    NavBarActionButton {
        attr {
            navBarActionButtonConfig = NavBarActionButtonConfig(icon = "sandian16")
            actionType = NavBarActionType.ICON
        }
    }
}
```

### 图标按钮（图片资源）

使用本地 common asset 图片作为图标。

```Kotlin
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
```

### 图标 + 文字

上面是图标，下面是文字。

```Kotlin
actionComponent1 = {
    NavBarActionButton {
        attr {
            navBarActionButtonConfig = NavBarActionButtonConfig(
                iconCommonAssetPath = "component/test.png",
                iconHorizontalPadding = 4f,
                text = "创建"
            )
            actionType = NavBarActionType.ICON_TEXT
        }
    }
}
```

### Button 样式

渲染为填充色的 WGButton，适合强调型操作。

```Kotlin
actionComponent1 = {
    NavBarActionButton {
        attr {
            navBarActionButtonConfig = NavBarActionButtonConfig(text = "确认收货")
            actionType = NavBarActionType.BUTTON
        }
    }
}
```

### 在 ModalFrame 弹窗中使用

在 ModalFrameX 的 titleBar 中放操作按钮：

```Kotlin
BaseVisuals.showModalFrameX(
    pageId = ctx.pagerId,
    modalHeight = ctx.pagerData.pageViewHeight * 0.6f,
    titleBar = {
        NavBar {
            attr {
                leftButtonType = NavBarLeftButtonType.CLOSE
                linkToParentNavBar = true
                themeConfig = ThemeConfig(text = "商品详情")
                actionComponent1 = {
                    NavBarActionButton {
                        attr {
                            navBarActionButtonConfig = NavBarActionButtonConfig(
                                operateIcon = "fenxiang",
                                onClick = { /* 分享 */ }
                            )
                            actionType = NavBarActionType.ICON
                        }
                    }
                }
                actionComponent2 = {
                    NavBarActionButton {
                        attr {
                            navBarActionButtonConfig = NavBarActionButtonConfig(
                                operateIcon = "sandian16",
                                onClick = { /* 更多 */ }
                            )
                            actionType = NavBarActionType.ICON
                        }
                    }
                }
            }
        }
    },
    content = { /* 弹窗内容 */ }
)
```

## 组件特性

### 点击态

按下时会降低透明度到 0.6，松手恢复。

### 文字截断

`TEXT` 和 `ICON_TEXT` 类型的文字最多显示 4 个字符，超出会自动截断。

### 默认尺寸

不同类型的默认图标大小：
- `ICON`：24f
- `ICON_TEXT`：20f（图标缩小，给下方文字留空间）
- `PICTURE`：24f

默认字体大小：
- `TEXT`：16f
- `ICON_TEXT`：10f

可以通过 `iconSize` 和 `textSize` 自定义。
