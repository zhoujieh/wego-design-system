# CheckBox & Radio

Demo 页 page 名称：`KuiklyCheckBox`（CheckBox）、`KuiklyRadioDemo`（Radio）

## 概览

CheckBox 和 Radio 是选择类基础组件，共享同一个底层实现（`WGCheckBoxView`）。CheckBox 显示为圆形勾选框，Radio 显示为圆形单选按钮。

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=N2VkMWZkYTU3N2E3NjhkZTcyMjNiYmJjMzIyNzNjYmVfZmJNMk9Ld2EwaHJ5MWUyYk9VR2hBZXk2Y3pQVWs4czBfVG9rZW46RzdGOGIybmtLbzI2Vmt4Z05IVGNXdWIwbnloXzE3NzY2ODY5NzA6MTc3NjY5MDU3MF9WNA)![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDYwMzNhNTk4YmE5ZTQxYjhjZjU4NmIxZDBlZGY4YjBfd3dQNEFEVVNvbW9VWU8zNno2NXRVdFJVNUhaUkNIb1BfVG9rZW46WEhuRGJQbFhBb0k2M2R4d0VmcWNZVUFsblJWXzE3NzY2ODY5NzA6MTc3NjY5MDU3MF9WNA)

```Kotlin
WGCheckBox {
    attr {
        checked = true
        disabled = false
        size = 24f
    }
    event {
        onCheckChange { checked ->
            // 处理状态变化
        }
    }
}
Radio {
    attr {
        checked = ctx.selectedOption
        autoCheck = false
    }
    event {
        onCheckChange {
            ctx.selectedOption = true
        }
    }
}
```

## API

### DSL 工厂函数

| 函数         | 说明                                             |
| ------------ | ------------------------------------------------ |
| `WGCheckBox` | 创建 CheckBox 组件                               |
| `Radio`      | 创建 Radio 组件（内部自动设置 `isRadio = true`） |

> `RadioView`、`RadioAttr`、`RadioEvent` 分别是 `WGCheckBoxView`、`WGCheckBoxAttr`、`WGCheckBoxEvent` 的类型别名，API 完全一致。

### 属性（`WGCheckBoxAttr`）

| **name**                       | **type**       | **功能**                                                     | **default value**    |
| ------------------------------ | -------------- | ------------------------------------------------------------ | -------------------- |
| `checked` ****响应式*** 🌟      | `Boolean`      | 是否选中                                                     | `false`              |
| `autoCheck` 🌟                  | `Boolean`      | 点击后是否自动切换选中状态；设为 `false` 时需在回调中手动控制 | `true`               |
| `disabled` ********响应式*** 🌟 | `Boolean`      | 是否禁用（不响应点击）                                       | `false`              |
| `isDarkMode` ********响应式*** | `Boolean`      | 是否使用深色模式样式                                         | `false`              |
| `isRadio`                      | `Boolean`      | 是否使用 Radio 样式（由 `Radio {}` 工厂函数自动设置，一般无需手动设置） | `false`              |
| `size`                         | `Float`        | 组件尺寸（宽高相同）                                         | `24f`                |
| `customHighlightColor`         | `Color`        | 选中态的高亮颜色                                             | `Color(green_1_100)` |
| `number` *响应式*              | `String?`      | 若设置，选中时将对勾替换为该数字文本                         | `null`               |
| `iconFont`                     | `String?`      | 若设置为 `"-"`，显示减号图标；其它值则显示对应 iconFont 图标 | `null`               |
| `customInnerView`              | `ViewBuilder?` | 完全自定义选中时的内部视图                                   | `null`               |

### 事件（`WGCheckBoxEvent`）

| **name**          | **type**            | **功能**                                                     |
| ----------------- | ------------------- | ------------------------------------------------------------ |
| `onCheckChange` 🌟 | `(Boolean) -> Unit` | 状态变化回调；`autoCheck = true` 时参数为新状态，`autoCheck = false` 时参数为当前 `checked` 值 |

## 参考代码

### 基础用法

```Kotlin
private var isChecked by observable(false)

// ...body
WGCheckBox {
    attr {
        checked = ctx.isChecked
    }
    event {
        onCheckChange { checked ->
            ctx.isChecked = checked
        }
    }
}
```

### 禁用状态

```Kotlin
// 禁用且未选中
WGCheckBox {
    attr {
        checked = false
        disabled = true
    }
}

// 禁用且选中
WGCheckBox {
    attr {
        checked = true
        disabled = true
    }
}
```

### 深色模式

在深色背景上使用时，设置 `isDarkMode = true` 可切换描边和背景配色：

```Kotlin
View {
    attr {
        backgroundColor(Color(0xFF1C1C1E))
        borderRadius(8f)
        padding(4f)
    }
    WGCheckBox {
        attr {
            isDarkMode = true
            checked = ctx.darkChecked
        }
        event {
            onCheckChange { checked -> ctx.darkChecked = checked }
        }
    }
}
```

### 自定义高亮颜色

```Kotlin
// 蓝色高亮
WGCheckBox {
    attr {
        checked = true
        customHighlightColor = Color(0xFF0A84FF)
    }
    event {
        onCheckChange { checked -> /* ... */ }
    }
}

// 红色高亮
WGCheckBox {
    attr {
        checked = true
        customHighlightColor = Color(0xFFFF3B30)
    }
}
```

### 手动控制选中态（autoCheck = false）

适用于需要先做校验再切换状态的场景：

```Kotlin
private var manualChecked by observable(false)

// ...body
WGCheckBox {
    attr {
        autoCheck = false
        checked = ctx.manualChecked
    }
    event {
        onCheckChange {
            // 手动切换
            ctx.manualChecked = !ctx.manualChecked
        }
    }
}
```

### 数字替代对勾

选中时显示数字而非对勾，适合排序、编号场景：

```Kotlin
WGCheckBox {
    attr {
        checked = true
        number = "3"
    }
    event {
        onCheckChange { checked -> /* ... */ }
    }
}
```

### 减号图标 / 自定义 iconFont

```Kotlin
// 减号（半选状态）
WGCheckBox {
    attr {
        checked = true
        iconFont = "-"
    }
}

// 自定义 iconFont 图标
WGCheckBox {
    attr {
        checked = true
        iconFont = "gou"
    }
}
```

### 自定义内部视图

完全替换选中时的内部内容：

```Kotlin
WGCheckBox {
    attr {
        checked = ctx.customViewChecked
        customHighlightColor = Color(0xFFFFCC00)
        customInnerView = {
            Text {
                attr {
                    text("★")
                    fontSize(14f)
                    color(Color.WHITE)
                }
            }
        }
    }
    event {
        onCheckChange { checked -> ctx.customViewChecked = checked }
    }
}
```

### 自定义尺寸

```Kotlin
// 小尺寸
WGCheckBox {
    attr {
        size = 16f
        checked = ctx.size16Checked
    }
    event {
        onCheckChange { checked -> ctx.size16Checked = checked }
    }
}

// 大尺寸
WGCheckBox {
    attr {
        size = 32f
        checked = ctx.size32Checked
    }
    event {
        onCheckChange { checked -> ctx.size32Checked = checked }
    }
}
```

### Radio 基础用法

```Kotlin
private var radioSelected by observable(false)

// ...body
Radio {
    attr {
        checked = ctx.radioSelected
    }
    event {
        onCheckChange { checked ->
            ctx.radioSelected = checked
        }
    }
}
```

### Radio 单选组（垂直排列）

使用 `autoCheck = false` 搭配多个 Radio 实现互斥选择：

```Kotlin
private var groupA by observable(true)
private var groupB by observable(false)
private var groupC by observable(false)

// ...body
Radio {
    attr {
        autoCheck = false
        checked = ctx.groupA
    }
    event {
        onCheckChange {
            ctx.groupA = true; ctx.groupB = false; ctx.groupC = false
        }
    }
}
Radio {
    attr {
        autoCheck = false
        checked = ctx.groupB
    }
    event {
        onCheckChange {
            ctx.groupA = false; ctx.groupB = true; ctx.groupC = false
        }
    }
}
Radio {
    attr {
        autoCheck = false
        checked = ctx.groupC
    }
    event {
        onCheckChange {
            ctx.groupA = false; ctx.groupB = false; ctx.groupC = true
        }
    }
}
```

### Radio 单选组（水平排列）

```Kotlin
View {
    attr {
        flexDirectionRow()
        alignItemsCenter()
    }

    Radio {
        attr { autoCheck = false; checked = ctx.hGroupA }
        event {
            onCheckChange {
                ctx.hGroupA = true; ctx.hGroupB = false; ctx.hGroupC = false
            }
        }
    }
    Text {
        attr { text("One"); fontSize(14f); margin(left = 6f, right = 24f) }
    }

    Radio {
        attr { autoCheck = false; checked = ctx.hGroupB }
        event {
            onCheckChange {
                ctx.hGroupA = false; ctx.hGroupB = true; ctx.hGroupC = false
            }
        }
    }
    Text {
        attr { text("Two"); fontSize(14f); margin(left = 6f, right = 24f) }
    }

    Radio {
        attr { autoCheck = false; checked = ctx.hGroupC }
        event {
            onCheckChange {
                ctx.hGroupA = false; ctx.hGroupB = false; ctx.hGroupC = true
            }
        }
    }
    Text {
        attr { text("Three"); fontSize(14f); margin(left = 6f) }
    }
}
```

## 组件特性

### 深色模式

| 状态          | 普通模式                              | 深色模式                      |
| ------------- | ------------------------------------- | ----------------------------- |
| 未选中        | 描边 `text_30`                        | 背景 `bg_gray_10` + 描边白色  |
| 选中          | 高亮色背景（默认绿色）                | 同普通模式                    |
| 禁用 + 未选中 | 背景 `bg_gray_03` + 描边 `bg_line_08` | 背景 白色 20% + 描边 白色 40% |
| 禁用 + 选中   | 背景 `bg_line_08`                     | 背景 白色 20% + 内容 白色 40% |

内部符号（对勾 / - / 数字）永远是白色。

### autoCheck 行为

- `autoCheck = true`（默认）：点击时组件自动切换 `checked` 值，`onCheckChange` 回调参数为切换后的新状态。
- `autoCheck = false`：点击时组件不修改 `checked`，仅触发 `onCheckChange` 回调（参数为当前 `checked` 值）。需要在回调中手动赋值 `checked`。**单选组**场景通常使用此模式。

### 尺寸

默认尺寸 24f。内部各元素大小基于 `size` 计算偏移量：

- 无描边背景：`size - 4.5f`（默认 19.5f）
- 有描边背景/描边：`size - 6f`（默认 18f）
- Radio 内圆点：`size - 13f`（默认 11f）