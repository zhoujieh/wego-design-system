# WGFont（字体样式系统）

## 概览

`WGFont` 是统一的字体样式系统，通过工厂方法返回 `TextStyle` 对象，配合 `applyTextStyle()` 扩展函数应用到 `Text` 组件的 attr，避免手动拼装 `fontSize` + `fontWeight` + `lineHeight`。

```Kotlin
import com.truedian.wg.core.components.constants.WGFont

// ...body
Text {
    attr {
        text("正文内容")
        applyTextStyle(WGFont.body())
        color(ColorManager.text_100)
    }
}
```

## 设计规范

| 级别     | 方法                              | 字号 | 字重            | 设计行高 (150%) |
| -------- | --------------------------------- | ---- | --------------- | --------------- |
| 大标题   | `largeTitle()`                    | 22f  | Medium (500)    | 33dp            |
| 导航标题 | `navTitle()` / `navTitleMedium()` | 18f  | Normal / Medium | 27dp            |
| 标题     | `title()` / `titleMedium()`       | 16f  | Normal / Medium | 24dp            |
| 正文     | `body()` / `bodyMedium()`         | 14f  | Normal / Medium | 21dp            |
| 辅助说明 | `caption()` / `captionMedium()`   | 12f  | Normal / Medium | 18dp            |
| 小文字   | `small()` / `smallMedium()`       | 10f  | Normal / Medium | 14dp            |

> 由于 Kuikly 的行高可能导致一些问题，使用默认设置行高和字体大小相等（ `sameHeight = true`）。传 `false` 可使用设计规范的 150% 行高，适合多行文本场景。

### 自定义字号方法

| 方法                                     | 字重         | 用途                 |
| ---------------------------------------- | ------------ | -------------------- |
| `normal(fontSize)`                       | Normal (400) | 自定义字号，正常字重 |
| `medium(fontSize)`                       | Medium (500) | 自定义字号，中等字重 |
| `iconFont(fontSize, code?, compensate?)` | Normal       | IconFont 图标字体    |

**`iconFont`** **参数：**

| 参数                               | 类型     | 说明                                      |
| ---------------------------------- | -------- | ----------------------------------------- |
| `fontSize`                         | `Float`  | 图标字号                                  |
| `code`                             | `String` | 图标名称（可选，设置后自动调用 `text()`） |
| `customMarginTopErrorCompensation` | `Float?` | iOS 端 marginTop 偏移补偿（可选）         |

> 不建议直接使用 WGFont.iconFont, 建议直接使用 [Icon](https://slowisfast.feishu.cn/wiki/DAhVwBX3QiBwIwkTs2fcHvrEnkf) 组件

### 字号常量

可直接引用字号数值（不含字重/行高信息）：

| 常量                    | 值   |
| ----------------------- | ---- |
| `WGFont.TEXT_LARGE`     | 22f  |
| `WGFont.TEXT_NAV_TITLE` | 18f  |
| `WGFont.TEXT_TITLE`     | 16f  |
| `WGFont.TEXT_BODY`      | 14f  |
| `WGFont.TEXT_CAPTION`   | 12f  |
| `WGFont.TEXT_SMALL`     | 10f  |

### 扩展函数

| 方法                    | 作用于                  | 返回值                   | 推荐     |
| ----------------------- | ----------------------- | ------------------------ | -------- |
| `applyTextStyle(style)` | `TextAttr` / `TextSpan` | `Unit`                   | 推荐使用 |
| `textStyle(style)`      | `TextAttr`              | `TextAttr`（可链式调用） | 备选     |

## 参考代码

### 基础文字样式

```Kotlin
// 正文（14f, Normal）
Text {
    attr {
        text("正文内容")
        applyTextStyle(WGFont.body())
        color(ColorManager.text_100)
    }
}

// 标题（16f, Medium）
Text {
    attr {
        text("标题")
        applyTextStyle(WGFont.titleMedium())
        color(ColorManager.text_100)
    }
}

// 辅助说明（12f, Normal）
Text {
    attr {
        text("辅助说明")
        applyTextStyle(WGFont.caption())
        color(ColorManager.text_80)
    }
}

// 小文字（10f, Normal）
Text {
    attr {
        text("小文字")
        applyTextStyle(WGFont.small())
        color(ColorManager.text_60)
    }
}
```

### 自定义字号

```Kotlin
// 自定义字号（Medium 字重）
Text {
    attr {
        text("自定义")
        applyTextStyle(WGFont.medium(14f))
        color(ColorManager.text_100)
    }
}

// 自定义字号（Normal 字重）
Text {
    attr {
        text("自定义")
        applyTextStyle(WGFont.normal(13f))
        color(ColorManager.text_80)
    }
}
```

### IconFont 图标

```Kotlin
// 带图标名称（自动设置 text）
Text {
    attr {
        applyTextStyle(WGFont.iconFont(16f, "youjiantou16"))
        color(ColorManager.text_30)
    }
}

// 不指定 code，手动设置 text
Text {
    attr {
        text(IconUnicodeManager.getIcon("shanchu"))
        applyTextStyle(WGFont.iconFont(20f))
        color(ColorManager.red_100)
    }
}

// 条件判断：iconFont vs normal
Text {
    attr {
        text(btnInfo.iconText)
        if (IconUnicodeManager.iconMap.containsValue(btnInfo.iconText)) {
            applyTextStyle(WGFont.iconFont(btnInfo.fontSize))
        } else {
            applyTextStyle(WGFont.normal(btnInfo.fontSize))
        }
        color(btnInfo.iconColor)
    }
}
```

> 注意：图标推荐优先使用 `Icon` 组件而非直接使用 `WGFont.iconFont()`。

### 多行文本（使用设计规范行高）

```Kotlin
// sameHeight = false → 行高为 150% 设计值
Text {
    attr {
        text("多行正文内容，需要正确的行间距")
        applyTextStyle(WGFont.body(false))
        color(ColorManager.text_100)
        lines(3)
    }
}
```

### 在 TextSpan（富文本）中使用

```Kotlin
Text {
    attr {
        applyTextStyle(WGFont.body())
        color(ColorManager.text_100)
    }
    Span {
        text("普通文字 ")
        applyTextStyle(WGFont.body())
        color(ColorManager.text_80)
    }
    Span {
        text("加粗文字")
        applyTextStyle(WGFont.bodyMedium())
        color(ColorManager.text_100)
    }
}
```

### 综合示例

一个典型的列表项，结合 WGFont 和 ColorManager：

```Kotlin
View {
    attr {
        flexDirectionRow()
        padding(12f)
        backgroundColor(ColorManager.bg_white_100)
        borderBottom(Border(0.5f, BorderStyle.SOLID, ColorManager.bg_line_08))
    }

    // 标题
    Text {
        attr {
            flex(1f)
            text("商品名称")
            applyTextStyle(WGFont.titleMedium())
            color(ColorManager.text_100)
        }
    }

    // 价格
    Text {
        attr {
            text("¥99.00")
            applyTextStyle(WGFont.body())
            color(ColorManager.green_1_100)
        }
    }

    // 箭头图标
    Text {
        attr {
            applyTextStyle(WGFont.iconFont(16f, "youjiantou16"))
            color(ColorManager.text_30)
            marginLeft(8f)
            alignSelfCenter()
        }
    }
}
```