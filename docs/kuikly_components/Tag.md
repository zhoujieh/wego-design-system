# Tag

Demo 页 page 名称：`KTagPage`

## 概览

Tag - 标签组件，默认灰底，选中后会变绿

```Kotlin
Tag {
    attr {
        text = "标签"
        tagSize = TagSize.TAG_32
        colorPreset = TagColorPreset.GREY
    }
    event {
        onTagClick { isSelected ->
            // 处理点击事件
        }
    }
}
```

支持 4 种尺寸：

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=N2E4OTU4ZGQ0ZTljMTgxYWQ0NzI0YjQ1NTdhMDY2MmJfNGtRSm9lNFdPOEs1NXVKalJyMUhPNnNMbGVMSXlwZUNfVG9rZW46TFp5RGIyQnVSb2hpR214RzBSNmNQMFhRbnpoXzE3NzU4MDk1Mzg6MTc3NTgxMzEzOF9WNA)

| 尺寸     | 高度 | 可选中 | 可点击 | 支持图标 |
| -------- | ---- | ------ | ------ | -------- |
| `TAG_32` | 32px | ✅      | ✅      | ✅        |
| `TAG_28` | 28px | ✅      | ✅      | ✅        |
| `TAG_24` | 24px | ❌      | ✅      | ❌        |
| `TAG_20` | 20px | ❌      | ❌      | ❌        |

支持 3 种颜色预设：`GREY`（灰底）、`WHITE`（白底带边框）、`GREEN`（白底绿边框绿文字）。

## API

### Tag 属性（`TagAttr`）

| **name**                  | **type**                 | **功能**                                                     | **default value**     |
| ------------------------- | ------------------------ | ------------------------------------------------------------ | --------------------- |
| `text`🌟                   | `String`                 | 标签文本                                                     | `""` (空字符串)       |
| `tagSize`🌟                | `TagSize`                | 标签尺寸，决定高度、padding、字号、是否可选中/可点击/支持图标 | `TagSize.TAG_32`      |
| `colorPreset`             | `TagColorPreset`         | 颜色预设方案，见下方枚举说明                                 | `TagColorPreset.GREY` |
| `pressToSelect`           | `Boolean`                | 点击时是否自动切换选中态（仅 TAG_32 和 TAG_28 生效）         | `false`               |
| `iconPreset`              | `TagIconPreset?`         | 图标预设（自带图标名、位置和默认颜色），见下方枚举说明       | `null`                |
| `icon`                    | `String`                 | 自定义图标名（iconFont 字符串），与 `iconPreset` 二选一      | `""` (空字符串)       |
| `iconPosition`            | `IconPosition?`          | 图标位置（LEFT / RIGHT），`null` 时使用 `iconPreset` 的默认位置 | `null`                |
| `additionalIconAttr`      | `(TextAttr.() -> Unit)?` | 对图标 Text 追加自定义属性的 lambda                          | `null`                |
| `maxWidth`                | `Float?`                 | 标签最大宽度，超出时文本省略（注意，这是变量不是方法）           | `null`                |
| `customColorConfig`       | `TagCustomColorConfig?`  | （高级）自定义颜色配置，覆盖预设颜色                         | `null`                |
| `isClickable`             | `Boolean?`               | 是否可点击，`null` 时使用 `tagSize` 的默认值                 | `null`                |
| `isPressed` (*响应式)*    | `Boolean`                | 当前按下状态                                                 | `false`               |
| `isSelected` (*响应式) 🌟* | `Boolean`                | 当前选中状态                                                 | `false`               |

### Tag 事件（`TagEvent`）

| **name**      | **type**            | **功能**                                                  |
| ------------- | ------------------- | --------------------------------------------------------- |
| `onTagClick`  | `(Boolean) -> Unit` | 标签点击回调，参数为当前 `isSelected`状态                 |
| `onIconClick` | `(Boolean) -> Unit` | 图标独立点击回调（图标区域单独响应），参数为 `isSelected` |

> ⚠️ 请勿使用 原生的 click 方法

### 枚举类 `TagSize`

| 值       | 高度 | 最小宽度 | 默认 padding | 图标 padding | 字号 | 可选中 | 可点击 | 支持图标 | 圆角 |
| -------- | ---- | -------- | ------------ | ------------ | ---- | ------ | ------ | -------- | ---- |
| `TAG_32` | 32   | 52       | 12           | 8            | 14   | ✅      | ✅      | ✅        | 16   |
| `TAG_28` | 28   | 48       | 12           | 8            | 12   | ✅      | ✅      | ✅        | 16   |
| `TAG_24` | 24   | 40       | 8            | 8            | 12   | ❌      | ✅      | ❌        | 16   |
| `TAG_20` | 20   | 36       | 8            | 8            | 12   | ❌      | ❌      | ❌        | 4    |

### 枚举类 `TagColorPreset`

| 值      | 默认背景   | 选中背景   | 默认文字颜色 | 选中文字颜色 | 边框        |
| ------- | ---------- | ---------- | ------------ | ------------ | ----------- |
| `GREY`  | bg_gray_03 | green_1_10 | text_80      | green_1_100  | 无          |
| `WHITE` | 纯白       | green_1_10 | text_80      | green_1_100  | bg_line_08  |
| `GREEN` | 纯白       | green_1_10 | green_1_100  | green_1_100  | green_1_100 |

### 枚举类 `TagIconPreset`

| 值        | 图标名         | 默认位置 | 默认颜色 | 说明           |
| --------- | -------------- | -------- | -------- | -------------- |
| `CLOSE`   | `cha16`        | RIGHT    | text_30  | 关闭（×）图标  |
| `ADD`     | `jia16`        | LEFT     | text_80  | 添加（+）图标  |
| `JUMP_TO` | `youjiantou16` | RIGHT    | text_30  | 右箭头跳转图标 |
| `EDIT`    | `bianji16`     | LEFT     | text_80  | 编辑图标       |

### 自定义颜色配置（`TagCustomColorConfig`）

当预设无法满足需求时，可以通过 `customColorConfig` 逐项覆盖颜色。**只需要传你想改的字段**，其余仍使用预设值（详见源码）。

## 参考代码

### 基础用法

最简单的 Tag，灰底色，点击可选中：

```Kotlin
Tag {
    attr {
        text = "标签"
        tagSize = TagSize.TAG_32
        colorPreset = TagColorPreset.GREY
        pressToSelect = true
    }
    event {
        onTagClick { isSelected ->
            // isSelected: 当前选中状态
        }
    }
}
```

### 带图标

使用 `iconPreset` 快速添加图标，图标位置和颜色由预设决定：

```Kotlin
// 左侧添加图标
Tag {
    attr {
        text = "添加标签"
        tagSize = TagSize.TAG_32
        colorPreset = TagColorPreset.GREY
        iconPreset = TagIconPreset.ADD
        pressToSelect = true
    }
}

// 右侧关闭图标，支持图标独立点击
Tag {
    attr {
        text = "可关闭"
        tagSize = TagSize.TAG_32
        colorPreset = TagColorPreset.GREY
        iconPreset = TagIconPreset.CLOSE
        pressToSelect = true
    }
    event {
        onTagClick { isSelected ->
            // 点击标签本体
        }
        onIconClick { isSelected ->
            // 点击关闭图标（独立事件，不会触发 onTagClick）
        }
    }
}
```

### 白色带边框

```Kotlin
Tag {
    attr {
        text = "White"
        tagSize = TagSize.TAG_28
        colorPreset = TagColorPreset.WHITE
        pressToSelect = true
    }
}
```

### 限制最大宽度（文本省略）

```Kotlin
Tag {
    attr {
        text = "这是一个很长的标签文本"
        tagSize = TagSize.TAG_32
        colorPreset = TagColorPreset.GREY
        maxWidth = 120f
    }
}
```

### 小尺寸 Tag（TAG_24 / TAG_20）

TAG_24 不可选中、不支持图标，但可点击：

```Kotlin
Tag {
    attr {
        text = "小标签"
        tagSize = TagSize.TAG_24
        colorPreset = TagColorPreset.GREY
    }
    event {
        onTagClick { /* 可点击 */ }
    }
}
```

TAG_20 既不可选中也不可点击，常用于纯展示场景，文字颜色固定为灰色（GREEN 预设除外）：

```Kotlin
Tag {
    attr {
        text = "展示"
        tagSize = TagSize.TAG_20
        colorPreset = TagColorPreset.GREY
    }
}

// TAG_20 绿色预设文字为绿色
Tag {
    attr {
        text = "GREEN"
        tagSize = TagSize.TAG_20
        colorPreset = TagColorPreset.GREEN
    }
}
```

### 外部控制选中态

不使用 `pressToSelect`，手动控制选中状态：

```Kotlin
private var tagSelected by observable(false)

// ...body
Tag {
    attr {
        text = "受控标签"
        tagSize = TagSize.TAG_32
        pressToSelect = false
        isSelected = ctx.tagSelected
    }
    event {
        onTagClick {
            ctx.tagSelected = !ctx.tagSelected
        }
    }
}
```

### （高级）自定义颜色

只覆盖想改的字段，其余仍用预设值：

```Kotlin
Tag {
    attr {
        text = "自定义橙色"
        tagSize = TagSize.TAG_32
        pressToSelect = true
        customColorConfig = TagCustomColorConfig(
            selectedBgColor = Color(255, 243, 230, 1f),
            selectedAndPressedBgColor = Color(255, 230, 200, 1f),
            selectedFontColor = Color(255, 140, 0, 1f)
        )
    }
}
```

## 组件特性

### 选中态行为

- 只有 `TAG_32` 和 `TAG_28` 支持选中态（`isSelectable = true`）。
- 设置 `pressToSelect = true` 后，点击会自动切换 `isSelected`。
- 也可以不设 `pressToSelect`，通过外部 `observable` 手动控制 `isSelected`。

### 图标支持

- 只有 `TAG_32` 和 `TAG_28` 支持图标（`supportsIcon = true`）。
- 图标有两种使用方式：
  - **`iconPreset`**：使用预定义的图标（CLOSE、ADD、JUMP_TO、EDIT），自带位置和颜色。
  - **`icon`** **+** **`iconPosition`**：自定义图标名和位置。
- 图标可以通过 `onIconClick` 单独响应点击事件，不会触发 `onTagClick`。

### 点击态

Tag 的按下态由组件内部自动处理，按下时背景颜色会变深。各预设的按下态颜色：

| 预设    | 默认点击态 | 已选中点击态 |
| ------- | ---------- | ------------ |
| `GREY`  | bg_gray_10 | green_1_20   |
| `WHITE` | bg_gray_06 | green_1_20   |
| `GREEN` | bg_gray_06 | green_1_20   |

### TAG_20 的特殊行为

`TAG_20` 是最小的尺寸，有几个与其他尺寸不同的特性：

- **不可选中、不可点击**（纯展示用途）。
- **文字颜色固定**为灰色 `#969AA0`，不受 `colorPreset` 影响——但 `GREEN` 预设除外，此时文字为绿色。
- **圆角为 4px**（其他尺寸均为 16px）。

### 最大宽度限制

设置 `maxWidth` 后，当标签实际宽度超过该值时，文本会自动省略（ellipsis）。未超过时不受影响。