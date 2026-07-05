# WGButton

Demo 页 page 名称：`KuiklyButtonDemo`

## 概览

WGButton - 公司品牌风格的按钮样式

```Kotlin
WGButton {
    attr {
        text = "默认按钮"
    }
    event {
        onClick {
            // 处理点击事件
        }
    }
}
```

支持以下 3 种默认风格和自定义风格：

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=YTE4MjRkMzQ3MDRhZDE3OGVlYjFjMTRlNjY5N2I2ZTlfdk5rRGJDWGgwejB1TnUwM1FkZHp2RXVCTHdwd0thZTVfVG9rZW46TW9mR2I1NzRGb3I2a2R4NEpSbWNYVTJ2bktoXzE3NzU3Mzc0NzQ6MTc3NTc0MTA3NF9WNA)

> ⚠️ 由于 kuikly 框架限制，暂不支持 hover。

支持 3 种默认尺寸（高度 48、高度 40、高度 32）：

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MzIzYjVjMmI4NjQxNmI0NWZlM2YyZDcyMTE5NDRmNWFfWkhhSk1HakV1MkhTNWR1UmFpNGRLalVtMmVhMTc5amdfVG9rZW46VzJlMmJudVJyb1FpanZ4bEpGVWN3TThobkZlXzE3NzU3Mzc0NzQ6MTc3NTc0MTA3NF9WNA)

## API

### WGButton 属性（`WGButtonAttr`）

| **name**               | **type**                          | **功能**                                                     | **default value**        |
| ---------------------- | --------------------------------- | ------------------------------------------------------------ | ------------------------ |
| `type`                 | `WGButtonType`                    | 按钮的颜色方案，见下方枚举说明**默认为 绿色 + 白字（PRIMARY）** | `WGButtonType.PRIMARY`   |
| `scale`                | `WGButtonScale`                   | 按钮的尺寸方案，见下方枚举说明**默认高度 40、宽度自适应**    | `WGButtonScale.SCALE_40` |
| `icon` ***响应式**     | `String` (图标的 iconFont 字符串) | **左侧**显示的图标的名字参考值：`"saoyisao"` `"jia"`         | `""` (空字符串)          |
| `text` ***响应式**     | `String`                          | 按钮文本                                                     | `""` (空字符串)          |
| `textColor`            | `Color?`                          | 自定义文字颜色（覆盖 type）                                  | `null`                   |
| `backgroundColor`      | `Color?`                          | 自定义背景色（覆盖 type）                                    | `null`                   |
| `adaptiveWidth`        | `Boolean?`                        | 是否自适应宽度                                               | `null`                   |
| `customContent`        | `ViewBuilder?`                    | 自定义按钮内部内容                                           | `null`                   |
| `disabled` ***响应式** | `Boolean`                         | 是否禁用选择按钮                                             | `false`                  |
| `gradient`             | `WGButtonGradient?`               | 渐变底色配置                                                 | `null`                   |
| `advancedConfig`       | `WGButtonAdvancedConfig?`         | 高级配置（通常不需要配置此项）                               | `null`                   |

### WGButton 事件（`WGButtonEvent`）

| **name**  | **type**          | **功能**                                           |
| --------- | ----------------- | -------------------------------------------------- |
| `onClick` | `Boolean -> Unit` | 点击事件回调参数 1 (`Boolean`): 当前是否是禁用状态 |

### 枚举类 `WGButtonType`

| 值                           | 描述                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| **`WGButtonType.PRIMARY`**   | **品牌绿底色 + 白文字**背景颜色：green_1_100文字颜色：纯白色 |
| **`WGButtonType.SECONDARY`** | **浅灰底色 + 黑文字**背景颜色：bg_gray_03文字颜色：text_100  |
| **`WGButtonType.LIGHT`**     | **浅灰底色 + 品牌绿文字**背景颜色：bg_gray_03文字颜色：green_1_100 |

### 枚举类 `WGButtonScale`

| 值                                 | 描述                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| **`WGButtonScale.SCALE_48`**       | 高度：48默认宽度：144文字大小：16图标大小：20                |
| **`WGButtonScale.SCALE_48_W_180`** | 高度：48默认宽度：180文字大小：16图标大小：20                |
| **`WGButtonScale.SCALE_40`**       | 高度：40默认宽度：160文字大小：16图标大小：20                |
| **`WGButtonScale.SCALE_32`**       | 高度：32默认宽度：***无（自适应）***文字大小：14图标大小：16 |

## 参考代码

### 简单使用

默认颜色和尺寸（PRIMARY, SCALE_40）

```Kotlin
WGButton {
    attr {
        text = "默认按钮"
    }
}
```

### 带图标

```Kotlin
WGButton {
    attr {
        scale = WGButtonScale.SCALE_48
        icon = "jia"
        text = "大按钮，带图标"
    }
}
```

### 自定义颜色

```Kotlin
WGButton {
    attr {
        scale = WGButtonScale.SCALE_32
        text = "自定义颜色按钮"
        textColor = Color(0x88FFFFFF) // 半透明白色
        backgroundColor = ColorManager.green_1_100
    }
}
```

### 渐变背景颜色

```Kotlin
WGButton {
    attr {
        scale = WGButtonScale.SCALE_48
        text = "渐变按钮"
        textColor = Color.WHITE
        gradient = WGButtonGradient(
            direction = Direction.TO_RIGHT,
            colors = listOf(
                ColorStop(Color(255, 148, 51, 1f), 0f),
                ColorStop(Color(254, 54, 52, 1f), 1f)
            ),
            // 可以自定义 pressedColors，但默认也会处理
            pressedColors = listOf(
                ColorStop(Color(255, 148, 51, 0.6f), 0f),
                ColorStop(Color(254, 54, 52, 0.6f), 1f)
            )
        )
    }
}
```

### 禁用态处理

```Kotlin
private var isDisabled by observable(false)

// ...body
WGButton {
    attr {
        type = WGButtonType.PRIMARY
        scale = WGButtonScale.SCALE_40
        text = if (ctx.isDisabled) "已禁用" else "可点击"
        disabled = ctx.isDisabled
    }
    event {
        onClick { isDisabled ->
            // 即使被禁用，也会触发。isDisabled 告知当前是否被禁用
        }
    }
}

WGButton {
    attr {
        type = WGButtonType.SECONDARY
        scale = WGButtonScale.SCALE_32
        text = if (ctx.isDisabled) "启用上方" else "禁用上方"
    }
    event {
        onClick { _ ->
            ctx.isDisabled = !ctx.isDisabled
        }
    }
}
```

## 组件特性

### 宽度自适应设置

如果`adaptiveWidth`使用默认值`null`，则使用当前`scale`对应的默认宽度方案（即：`SCALE_48` 默认固定宽度，`SCALE_40` 以下默认宽度自适应）

| 按钮尺寸                       | 默认自适应 | 默认宽度                        |
| ------------------------------ | ---------- | ------------------------------- |
| `WGButtonScale.SCALE_48`       | no         | 144px                           |
| `WGButtonScale.SCALE_48_W_180` | no         | 180px                           |
| `WGButtonScale.SCALE_40`       | YES        | 160px                           |
| `WGButtonScale.SCALE_32`       | YES        | 无（设置`adaptiveWidth`没有用） |

### 仅图标

每个按钮都支持仅图标。若没赋值 text 字段，则展示为仅图标样式，此时左右 padding 对称。

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MGVjODU4OWQ4YTFmNDg2OGQ2ZDQ2YzA3YzVjMTE1YmJfVkdyNThsOTlzWEc0N1psdDlkajhmc1FrbXdDT3czSm1fVG9rZW46VE5aU2JrZkVPb3plODB4a1M0ZWNpZnpxblpjXzE3NzU3Mzc0NzQ6MTc3NTc0MTA3NF9WNA)

### 禁用态

所有按钮禁用态的颜色均一致：

- 背景颜色： bg_gray_03
- 文字颜色： text_30。

**禁用态****`disabled`****是响应式变量。**

> text、icon **也是响应式变量**，但其它的都不是**。**

### 自定义化

`WGButton` 组件可高度自定义化。

- 可以通过 `textColor`、`backgroundColor`、`gradient` 覆盖颜色默认值；
- 此外，`advancedConfig` 中提供了更多的可自定义的间距参数，方便你根据需要定制按钮样式。

### 点击态背景颜色默认处理

WGButton 会正确处理点击态的背景颜色。

若覆盖了默认的颜色方案且没有定义点击颜色：

- 传入`backgroundColor`
- 或者传入`gradient`但没有赋值`pressedColors`

则点击态的背景颜色为正常背景颜色的 0.6 倍不透明度。