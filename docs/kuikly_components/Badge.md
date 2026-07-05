# Badge

## 概览

Badge - 红点组件，支持三种形态：**红点、数字/文字徽章、气泡标签**。常用于列表项、标签页、按钮等的未读提示或新功能提示。

```Kotlin
// 红点
Badge {}

// 数字徽章
Badge {
    attr {
        type = BadgeType.NUMBER
        text = "99"
    }
}

// 气泡标签
Badge {
    attr {
        type = BadgeType.BUBBLE
        text = "NEW"
    }
}
```

三种形态对比：

| 类型     | 默认背景            | 默认尺寸                      | 默认圆角                       | 典型用途              |
| -------- | ------------------- | ----------------------------- | ------------------------------ | --------------------- |
| `DOT`    | 红色                | 6 × 6                         | 3（圆形）                      | 无文字的小红点提示    |
| `NUMBER` | 红色                | 16 × 16（单字符）/ 自适应宽度 | 8（圆形/胶囊）                 | 消息数、未读数        |
| `BUBBLE` | 绿色（green_1_100） | 16 高度 / 自适应宽度          | 左上、右上、右下 8，**左下 1** | 推荐、NEW、热门等标签 |

## API

### Badge 属性（`BadgeAttr`）

| **name**             | **type**            | **功能**                                                     | **default value** |
| -------------------- | ------------------- | ------------------------------------------------------------ | ----------------- |
| `type`🌟              | `BadgeType`         | Badge 类型，见下方枚举说明                                   | `BadgeType.DOT`   |
| `text`               | `String`            | 显示的文字（仅 `NUMBER` 和 `BUBBLE` 生效）                   | `""` (空字符串)   |
| `badgeColor`         | `Color?`            | 自定义背景色，覆盖默认颜色                                   | `null`            |
| `textColor`          | `Color?`            | 自定义文字颜色，覆盖默认颜色                                 | `null`            |
| `customBorderRadius` | `BorderRectRadius?` | 自定义圆角，覆盖默认圆角规则                                 | `null`            |
| `customContent`      | `ViewBuilder?`      | 自定义内容，设置后会替换默认的 `Text`（仅 `NUMBER` 和 `BUBBLE` 生效） | `null`            |

### Badge 事件（`BadgeEvent`）

Badge 组件本身不提供事件。如需点击行为，请将其包裹在 `View` 或其他支持 `click` 事件的容器中。

### 枚举类 `BadgeType`

| 值       | 含义             | 是否显示文字 |
| -------- | ---------------- | ------------ |
| `DOT`    | 纯红点，无文字   | ❌            |
| `NUMBER` | 红色圆形数字徽章 | ✅            |
| `BUBBLE` | 绿色气泡标签     | ✅            |

## 参考代码

### 红点

```Kotlin
Badge {}
// 由于默认的 type 是 BadgeType.DOT，所以无需声明其它的
```

### 数字徽章

单字符时宽高相等呈圆形，多字符时自动撑开呈胶囊形：

```Kotlin
// 单字符 - 圆形
Badge {
    attr {
        type = BadgeType.NUMBER
        text = "3"
    }
}

// 多字符 - 胶囊形，自动 padding
Badge {
    attr {
        type = BadgeType.NUMBER
        text = "99+"
    }
}
```

### 气泡标签

```Kotlin
Badge {
    attr {
        type = BadgeType.BUBBLE
        text = "推荐"
    }
}
```

### 自定义颜色

```Kotlin
// 自定义红点颜色
Badge {
    attr {
        type = BadgeType.DOT
        badgeColor = Color(WGColor.green_1_100)
    }
}

// 自定义气泡颜色
Badge {
    attr {
        type = BadgeType.BUBBLE
        text = "HOT"
        badgeColor = Color(0xFFFF6B35)
        textColor = Color.WHITE
    }
}
```

### 自定义圆角

徽章可以用于盖在某个组件上方，例如下方使用`positionAbsolute`，并且只有左下角是圆角

```Kotlin
Badge {
    attr {
        positionAbsolute()
        right(0f)
        top(0f)
        type = BadgeType.BUBBLE
        text = "NEW"
        customBorderRadius = BorderRectRadius(
            topLeftCornerRadius = 0f,
            topRightCornerRadius = 0f,
            bottomLeftCornerRadius = 4f,
            bottomRightCornerRadius = 0f
        )
    }
}
```

### 自定义内容

使用 `customContent` 在徽章内部放置任意内容（仅 `NUMBER` 和 `BUBBLE` 生效），此时 `text` 被忽略：

```Kotlin
Badge {
    attr {
        type = BadgeType.BUBBLE
        customContent = {
            View {
                attr {
                    flexDirectionRow()
                    allCenter()
                }
                Icon {
                    attr {
                        iconName = "star16"
                        iconSize = 12f
                        iconColor = Color.WHITE
                    }
                }
                Spacer(2f)
                Text {
                    attr {
                        text("精选")
                        color(Color.WHITE)
                        fontSize(10f)
                    }
                }
            }
        }
    }
}
```

## 组件特性

### 尺寸与 padding 规则

- **DOT**：固定 6 × 6，不响应 `text`。
- **NUMBER**：
  - 当 `text` 长度为 1 且未设置 `customContent` 时，宽度锁定为 16（正圆）；
  - 否则宽度自适应内容，左右 padding 为 4。
  - 字体固定使用 `WegoKeyboardN9-Medium`，字号 12，非 H5 环境下会有轻微的垂直位移以视觉居中。
- **BUBBLE**：高度固定 16，宽度自适应内容，左右 padding 为 4，字号 10。

### 默认圆角

- **DOT** 和 **NUMBER** 默认为尺寸一半的圆角（圆形）。
- **BUBBLE** 默认为特殊的气泡圆角（左上/右上/右下 8px，左下 1px），形成类似对话气泡的视觉效果。可通过 `customBorderRadius` 覆盖。

### 与 Cell 等组件的集成

`Badge` 已被 Cell 等业务组件集成，可通过 `showTitleBadge`、`showActionBadge` 等属性直接配合使用，无需单独声明。例如：

```Kotlin
Cell {
    attr {
        title = "消息"
        showActionBadge = BadgeType.NUMBER
        actionBadgeContent = "99"
    }
}
```