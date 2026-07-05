# WGColor & ColorManager（颜色系统）

设计规范参考：[设计规范-颜色&字体对照表](https://slowisfast.feishu.cn/wiki/G014wTsCLiaz38kTQlDcokwonLf)

## 概览

有两个颜色工具，定义**同一套色彩面板**：

| 工具           | 类型                                | 包路径                                                  |
| -------------- | ----------------------------------- | ------------------------------------------------------- |
| `WGColor`      | `const val Long`（ARGB 格式的 hex） | `com.truedian.wg.core.components.constants.WGColor`     |
| `ColorManager` | `Color(r, g, b, alpha)` 对象        | `com.truedian.wg.core.components.managers.ColorManager` |

例如，`WGColor.bg_100` 和 `ColorManager.bg_100` 是同一个颜色，但前者是 `Long` 类型，后者是 `Color` 类型。

### 如何选择

| **场景**                                    | **推荐**       | **原因**                      |
| ------------------------------------------- | -------------- | ----------------------------- |
| `companion object` 默认值                   | `WGColor`      | `const val` 要求编译期常量    |
| 数据类默认参数                              | `WGColor`      | 同上                          |
| `color()` / `backgroundColor()` 等 DSL 调用 | `ColorManager` | 直接传入，无需 `Color()` 包裹 |
| 条件表达式切换颜色                          | `ColorManager` | 代码更简洁                    |
| 需要 `Long` 类型的 API                      | `WGColor`      | 类型匹配                      |

```Kotlin
// WGColor：编译期常量，DSL 中需包裹 Color()
companion object {
    const val BORDER_COLOR = WGColor.bg_line_08
}

color(Color(WGColor.text_100))

// ColorManager：运行时对象，DSL 中直接使用
color(ColorManager.text_100)
backgroundColor(ColorManager.bg_white_100) 
// p.s. backgroundColor 也可以使用 WGColor，因为其支持 Long 类型
```

## 颜色分类

### 灰度（文字 & 背景）

| 常量名         | WGColor 值   | 语义          |
| -------------- | ------------ | ------------- |
| `text_100`     | `0xFF1E2028` | 一级文字      |
| `text_80`      | `0xFF6E7382` | 二级文字      |
| `text_30`      | `0xFFB7BEC5` | 失效/占位文字 |
| `bg_line_08`   | `0x14202F64` | 线条/分割线   |
| `bg_100`       | `0xFFEDEDED` | 灰色背景      |
| `bg_white_100` | `0xFFFFFFFF` | 纯白背景      |
| `bg_white_40`  | `0x66FFFFFF` | 40% 透明白    |
| `bg_white_10`  | `0x1AFFFFFF` | 10% 透明白    |

### 灰度交互态

| 常量名       | WGColor 值   | 语义       |
| ------------ | ------------ | ---------- |
| `bg_gray_03` | `0x08202F64` | 1 级 hover |
| `bg_gray_06` | `0x0F202F64` | 1 级点击   |
| `bg_gray_10` | `0x1A202F64` | 2 级点击   |
| `bg_gray_36` | `0x5C0C213F` | 深灰遮罩   |

### 灰度组合（实色，不含透明度）

| 常量名            | WGColor 值   | 语义               |
| ----------------- | ------------ | ------------------ |
| `bg_gray_03_pack` | `0xFFF8F9FA` | 1 级 hover（实色） |
| `bg_gray_06_pack` | `0xFFF2F3F6` | 1 级点击（实色）   |
| `bg_gray_10_pack` | `0xFFE9EAEF` | 2 级点击（实色）   |

### 固定搭配

| 常量名          | WGColor 值   | 语义         |
| --------------- | ------------ | ------------ |
| `bg_bar_80`     | `0xCCF6F6F6` | 工具栏毛玻璃 |
| `bg_bar_100`    | `0xFFF6F6F6` | 工具栏实底   |
| `bg_toast_96`   | `0xF53F4347` | Toast 背景   |
| `bg_modal_30`   | `0x4D1E2028` | 遮罩 30%     |
| `bg_modal_40`   | `0x661E2028` | 遮罩 40%     |
| `bg_modal_60`   | `0x991E2028` | 遮罩 60%     |
| `bg_modal_80`   | `0xCC1E2028` | 遮罩 80%     |
| `bg_shadow_08`  | `0x141E2028` | 阴影背景     |
| `text_link_100` | `0xFF285B9A` | 链接文字     |

### 彩色

| 色系                   | 100            | 80            | 60            | 20            | 10            |
| ---------------------- | -------------- | ------------- | ------------- | ------------- | ------------- |
| 绿 1（品牌） `#03C160` | `green_1_100`  | `green_1_80`  | `green_1_60`  | `green_1_20`  | `green_1_10`  |
| 黄 1（提示） `#FA9D3B` | `yellow_1_100` | `yellow_1_80` | `yellow_1_60` | `yellow_1_20` | `yellow_1_10` |
| 红（警告） `#FA5051`   | `red_100`      | `red_80`      | `red_60`      | `red_20`      | `red_10`      |
| 橙 `#FF6045`           | `orange_100`   | `orange_80`   | `orange_60`   | `orange_20`   | `orange_10`   |
| 黄 2 `#FFC300`         | `yellow_2_100` | `yellow_2_80` | `yellow_2_60` | `yellow_2_20` | `yellow_2_10` |
| 绿 2 `#00C777`         | `green_2_100`  | `green_2_80`  | `green_2_60`  | `green_2_20`  | `green_2_10`  |
| 天蓝 `#208BF1`         | `blue_100`     | `blue_80`     | `blue_60`     | `blue_20`     | `blue_10`     |
| 紫 `#6367F0`           | `purple_100`   | `purple_80`   | `purple_60`   | `purple_20`   | `purple_10`   |
| 金 `#C79A56`           | `gold_100`     | `gold_80`     | `gold_60`     | `gold_20`     | `gold_10`     |

## 参考代码 🌟

### 文字颜色

```Kotlin
// ColorManager（推荐）
Text {
    attr {
        color(ColorManager.text_100)
    }
}

// WGColor（需包裹 Color()）
Text {
    attr {
        color(Color(WGColor.text_100))
    }
}
```

### 背景颜色

```Kotlin
View {
    attr {
        backgroundColor(ColorManager.bg_white_100)
    }
}
```

### 图标颜色

```Kotlin
Icon {
    attr {
        iconColor(ColorManager.green_1_100)
    }
}
```

### 边框 & 分割线

```Kotlin
View {
    attr {
        border(Border(0.5f, BorderStyle.SOLID, ColorManager.bg_line_08))
        // 或仅底部边框
        borderBottom(Border(0.5f, BorderStyle.SOLID, ColorManager.bg_gray_08))
    }
}
```

### 条件切换（选中态 / 按下态）

```Kotlin
// 选中态文字颜色
Text {
    attr {
        color(if (state.selected) ColorManager.text_100 else ColorManager.text_80)
    }
}

// 按下态背景
View {
    attr {
        backgroundColor(if (isPressed) ColorManager.bg_gray_10 else ColorManager.transparent)
    }
}
```

### 渐变

```Kotlin
View {
    attr {
        backgroundLinearGradient(
            Direction.TO_BOTTOM,
            ColorStop(ColorManager.bg_black_00, 0f),
            ColorStop(ColorManager.bg_black_20, 1f)
        )
    }
}
```

### 阴影

```Kotlin
// 盒阴影
View {
    attr {
        boxShadow(BoxShadow(0f, 4f, 12f, ColorManager.bg_modal_4))
    }
}

// 文字阴影
Text {
    attr {
        textShadow(0f, 1f, 1f, ColorManager.bg_black_30)
    }
}
```

### 透明度修改

```Kotlin
val bgColor = ColorManager.bg_white_100.opacity(0.88f)
```

### 在 companion object 为组件声明默认值

```Kotlin
companion object {
    const val BORDER_COLOR = WGColor.bg_line_08
    const val DEFAULT_BACKGROUND = WGColor.bg_gray_03_pack
    const val ERROR_BORDER = WGColor.red_100
    const val DEFAULT_HIGHLIGHT_COLOR = WGColor.green_1_100
}
```

