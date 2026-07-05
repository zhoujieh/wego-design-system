# InputText

Demo 页 page 名称：`KuiklyInputTextPage`

## 概览

InputText 是文本输入框分子级组件，基于 [InputSimple](https://slowisfast.feishu.cn/wiki/Q820w4scxirGKpkgZ7jcfxPSnVe) 封装。支持单行 / 多行、报错状态等功能，可高度自定义化。

```Kotlin
InputText {
    attr {
        width(160f)
        placeHolder = "请输入姓名"
    }
    event {
        textDidChange { text -> /* ... */ }
    }
}
```

组件结构：

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=MDhjZGUxMDlhMTBjNGMxNzcyY2I5M2Q3ZWQzYmI0YWFfZzRCY3NWY0M2V2xobnlJV21EY3dnY0VrY2piZ2ozaTNfVG9rZW46R1JxNGJCemhHb05mTzV4MWdFNmNaVEtGbmljXzE3NzY1MTIwMjM6MTc3NjUxNTYyM19WNA)

单行默认 36pt / 多行默认 58pt 高度，圆角 6f；默认有 `bg_gray_03_pack` 浅灰底色 + `bg_line_08` 细边框。进入报错状态后叠加 `red_10` 背景色 + `red_100` 红边框。

## API

### InputText 属性（`InputTextViewAttr`）

| **name**                                | **type**                      | **功能**                                                    | **default value** |
| --------------------------------------- | ----------------------------- | ----------------------------------------------------------- | ----------------- |
| `multiline`🌟                            | `Boolean`                     | 是否使用多行（TextArea）模式                                | `false`           |
| `customHeight`                          | `Float?`                      | 自定义容器高度；`null` 时单行 36pt，多行 58pt               | `null`            |
| `containerWidth` / `width(Float)`       | `Float?`                      | 固定容器宽度；`null` 时 `flex(1f)` 撑满                     | `null`            |
| `background` / `backgroundColor(Color)` | `Color`                       | 容器背景色                                                  | `bg_gray_03_pack` |
| `observableText`***响应式**🌟            | `String`                      | 外部注入文本；修改该值可程序化更新输入框内容                | `""`              |
| `placeHolder`                           | `String`                      | 占位提示文本                                                | `""`              |
| `errorState`***响应式**🌟                | `Boolean`                     | 控制报错状态（红色背景 + 红边框）                           | `false`           |
| `preventDefaultErrorBehavior`           | `Boolean`                     | 禁用聚焦 / 输入新文本后自动清错行为，完全由外部控制         | `false`           |
| `blurOnReturn`                          | `Boolean`                     | 按下回车键自动失焦                                          | `false`           |
| `tintColor`                             | `Color?`                      | 光标及选中高亮颜色；`null` 使用默认品牌绿                   | `null`            |
| `errorBackground`                       | `Color`                       | 自定义报错背景色                                            | `red_10`          |
| `errorBorderColor`                      | `Color`                       | 自定义报错边框颜色                                          | `red_100`         |
| `maxTextLength`                         | `Pair<Int, LengthLimitType>?` | 最大字符数限制；`null` 时不限制                             | `null`            |
| `additionalInputAttributes`             | `InputAttr.() -> Unit`        | 注入单行 `Input` 的额外属性（仅 `multiline = false` 生效）  | `{}`              |
| `additionalTextAreaAttributes`          | `TextAreaAttr.() -> Unit`     | 注入多行 `TextArea` 的额外属性（仅 `multiline = true`生效） | `{}`              |

### InputText 事件（`InputTextViewEvent`）

| **name**         | **type**           | **功能**                       |
| ---------------- | ------------------ | ------------------------------ |
| `textDidChange`🌟 | `(String) -> Unit` | 文本变化                       |
| `onReturn`       | `() -> Unit`       | 按下回车键                     |
| `onFocus`        | `() -> Unit`       | 获得焦点                       |
| `onFocusLost`    | `() -> Unit`       | 失去焦点                       |
| `onExceedLimit`  | `() -> Unit`       | 输入字符数超过 `maxTextLength` |

### 公开方法

通过 `ref` 获取 `InputTextView` 实例后可调用：

| **方法**                | **功能**     |
| ----------------------- | ------------ |
| `focus()`               | 聚焦输入框   |
| `blur()`                | 失焦输入框   |
| `setCursorIndex(index)` | 设置光标位置 |

## 参考代码

### 基础单行输入

```Kotlin
InputText {
    attr {
        width(160f)
        placeHolder = "请输入..."
    }
    event {
        textDidChange { text -> /* ... */ }
        onReturn { /* 回车 */ }
    }
}
```

### 多行输入（TextArea）

```Kotlin
InputText {
    attr {
        multiline = true
        placeHolder = "请输入内容..."
    }
    event {
        textDidChange { text -> /* ... */ }
    }
}
```

### 多行 + 自定义高度

```Kotlin
InputText {
    attr {
        multiline = true
        customHeight = 120f
        placeHolder = "请输入较长的描述..."
    }
    event {
        textDidChange { text -> /* ... */ }
    }
}
```

### 外部控制报错（preventDefaultErrorBehavior）

禁用默认的聚焦/输入自动清错行为，由外部按钮控制：

```Kotlin
private var errorState by observable(false)

// ...body
InputText {
    attr {
        width(160f)
        placeHolder = "任意文本"
        preventDefaultErrorBehavior = true
        errorState = ctx.errorState
    }
    event {
        textDidChange { /* ... */ }
    }
}

WGButton {
    attr { text = "开启报错" }
    event { onClick { ctx.errorState = true } }
}
```

### 程序化聚焦 / 设置光标

```Kotlin
private var inputRef: ViewRef<InputTextView>? = null

// ...body
InputText {
    ref { ctx.inputRef = it }
    attr {
        width(160f)
        placeHolder = "Hello World"
    }
}

WGButton {
    attr { text = "聚焦并设光标到开头" }
    event {
        onClick {
            ctx.inputRef?.view?.focus()
            ctx.inputRef?.view?.setCursorIndex(0)
        }
    }
}
```

### 外部注入文本（observableText）

```Kotlin
private var textValue by observable("Hello!")

// ...body
InputText {
    attr {
        width(160f)
        observableText = ctx.textValue
        placeHolder = "文本"
    }
    event {
        textDidChange { ctx.textValue = it }
    }
}

WGButton {
    attr { text = "设为 Hello!" }
    event { onClick { ctx.textValue = "Hello!" } }
}

WGButton {
    attr { text = "清空" }
    event { onClick { ctx.textValue = "" } }
}
```

### 最大字符数限制

```Kotlin
InputText {
    attr {
        width(160f)
        placeHolder = "最多 20 字符"
        maxTextLength = 20 to LengthLimitType.CHAR
    }
    event {
        onExceedLimit {
            // 用户输入超过 20 字符
        }
    }
}
```

### 注入底层属性（如键盘回车键类型）

```Kotlin
InputText {
    attr {
        placeHolder = "搜索"
        additionalInputAttributes = {
            returnKeyTypeSearch()  // 回车键显示为"搜索"
        }
    }
}
```

## 组件特性

### 单行 vs 多行切换

由 `multiline` 控制。内部会根据此值选择 `InputPreset`：

- `multiline = false` → 使用 `H_32`，底层渲染为 `Input`
- `multiline = true` → 使用 `MULTI_LINE`，底层渲染为 `TextArea`

`additionalInputAttributes` 只在单行模式下生效，`additionalTextAreaAttributes` 只在多行模式下生效。

### 错误行为

和 `InputNumber` 不同，`InputText` 主要通过外部（`errorState`）控制报错行为。

默认情况下，以下两个动作会清除 `errorState`：

1. **文本变化**：用户开始修改内容
2. **获得焦点**：用户点击进入输入框

设置 `preventDefaultErrorBehavior = true` 可完全禁用这些自动行为，`errorState` 仅由外部控制。

### 宽度规则

不设置 `containerWidth`（或调用 `width(Float)`）时，组件会 `flex(1f)` 撑满父容器的剩余空间。配合 `flexDirectionRow()` 布局时这是常见用法。

### 默认高度

| 模式 | 默认高度 |
| ---- | -------- |
| 单行 | 36pt     |
| 多行 | 58pt     |

通过 `customHeight` 可覆盖默认值。

### 与 InputNumber 的区别

见 [InputNumber](https://slowisfast.feishu.cn/wiki/PQIUw4MYUi1xUdkJVLJcwHvgnMh) 的对比表。