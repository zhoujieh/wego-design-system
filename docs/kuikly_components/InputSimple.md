# InputSimple

## 概览

InputSimple 是对 Kuikly 原生 `Input`（单行）和 `TextArea`（多行）的薄封装，属于**原子级**组件。

它包含：

- 包含字体大小、placeHolder、初始文本等基本配置
- 处理回车失焦、过滤规则等
- **不包含**边框、背景、报错状态等外观样式——这些由上层组件负责。

```Kotlin
InputSimple {
    attr {
        inputPreset = InputPreset.H_36
        placeholder = "请输入内容"
        horizontalPadding = 12f
    }
    event {
        textDidChange { text -> /* 处理文本变化 */ }
        onReturn { /* 处理回车 */ }
    }
}
```

大多数业务场景应使用上层组件：

- [InputText](https://slowisfast.feishu.cn/wiki/PUtowSvZ3iYZECkZmSkc5K3DnAe) — 带边框和报错态的文本输入框
- [InputNumber](https://slowisfast.feishu.cn/wiki/PQIUw4MYUi1xUdkJVLJcwHvgnMh) — 只允许数字、支持最大值校验的数字输入框
- [Counter](https://slowisfast.feishu.cn/wiki/EoblwK4OFiCmwJkMNRhc0beLnDd) — 带加减按钮的计数器
- [Form / FormBody](https://slowisfast.feishu.cn/wiki/Wrb2wMTkoiCQXOknLDmcpCOonwg) — 表单容器，其 `Text` / `Number` / `Money` / `Phone` 操作区内部都使用 `InputSimple` 渲染

只有在需要完全自定义外观或者搭建新的输入类组件时，才直接使用 `InputSimple`。

## API

### InputSimple 属性（`InputSimpleViewAttr`）

#### 文本状态

| **name**                 | **type**                      | **功能**                                                     | **default value**  |
| ------------------------ | ----------------------------- | ------------------------------------------------------------ | ------------------ |
| `placeholder`🌟           | `String`                      | 占位提示文本                                                 | `""`               |
| `maxTextLength`          | `Pair<Int, LengthLimitType>?` | 最大字符数限制；`null` 时不限制                              | `null`             |
| `initialText`            | `String`                      | 初始文本，仅在 `created()` 时写入一次。后续更新请用 `setText()` | `""`               |
| `blurOnReturn`           | `Boolean`                     | 按下回车后是否自动失焦                                       | `false`            |
| `textColor`****响应式*** | `Color`                       | 文本颜色；报错时推荐使用 `ColorManager.red_100`              | `WGColor.text_100` |
| `inputFilterRule`🌟       | `((String) -> String)?`       | 输入过滤规则，详见下方说明；`null` 时不过滤                  | `null`             |

#### 样式属性

| **name**                | **type**      | **功能**                                                   | **default value**          |
| ----------------------- | ------------- | ---------------------------------------------------------- | -------------------------- |
| `inputPreset`🌟          | `InputPreset` | 高度预设，决定使用单行还是多行模式                         | `InputPreset.H_32`         |
| `centerText`            | `Boolean?`    | 文本对齐：`true` = 居中，`false` = 左对齐，`null` = 右对齐 | `false`                    |
| `boldText`              | `Boolean?`    | 是否加粗文字（`fontWeightMedium()`）                       | `false`                    |
| `customContainerHeight` | `Float?`      | 自定义容器高度，覆盖 `inputPreset` 默认值                  | `null`                     |
| `containerWidth`        | `Float?`      | 固定容器宽度；`null` 时 `flex(1f)` 撑满父容器              | `null`                     |
| `horizontalPadding`     | `Float`       | 水平内边距（左右）                                         | `8f`                       |
| `verticalPadding`       | `Float?`      | 垂直内边距（上下）；`null` 时自动决定：多行=水平值，单行=0 | `null`                     |
| `fontSize`              | `Float`       | 文本字号                                                   | `14f`                      |
| `tintColor`             | `Color`       | 光标及选中高亮颜色                                         | `ColorManager.green_1_100` |

#### 扩展配置

| **name**                       | **type**                  | **功能**                                   |
| ------------------------------ | ------------------------- | ------------------------------------------ |
| `additionalInputAttributes`    | `InputAttr.() -> Unit`    | 单行模式下注入到底层 `Input` 的额外属性    |
| `additionalTextAreaAttributes` | `TextAreaAttr.() -> Unit` | 多行模式下注入到底层 `TextArea` 的额外属性 |

### InputSimple 事件（`InputSimpleViewEvent`）

| **name**               | **type**           | **功能**                                                     |
| ---------------------- | ------------------ | ------------------------------------------------------------ |
| `textDidChange`🌟       | `(String) -> Unit` | 文本变化（参数为经过 `inputFilterRule` 过滤后的文本）        |
| `onFilterTrigger`      | `(String) -> Unit` | 过滤规则触发纠正时触发，参数为**过滤前**的原始文本（可用于埋点） |
| `onReturn`             | `() -> Unit`       | 按下回车键                                                   |
| `onFocus`              | `() -> Unit`       | 获得焦点                                                     |
| `onFocusLost`          | `() -> Unit`       | 失去焦点                                                     |
| `onExceedLimit`        | `() -> Unit`       | 输入字符数超过 `maxTextLength` 限制                          |
| `keyboardHeightChange` | `(Float) -> Unit`  | 键盘高度变化（预留接口，暂未连接）                           |

### 枚举类 `InputPreset`

| 值                     | 高度 | 渲染组件   | 说明                                     |
| ---------------------- | ---- | ---------- | ---------------------------------------- |
| `H_32`                 | 32   | `Input`    | 单行输入，常用于列表行内                 |
| `H_36`                 | 36   | `Input`    | 单行输入，表单标准高度                   |
| `MULTI_LINE`           | 58   | `TextArea` | 多行输入，固定高度（默认能放下两行文本） |
| `MULTI_LINE_AUTO_SWAP` | /    | `TextArea` | 多行输入，**不设置容器高度**，内容撑高   |

### 公开方法

通过 `ref` 获取 `InputSimpleView` 实例后可调用：

| **方法**                | **功能**             |
| ----------------------- | -------------------- |
| `focus()`               | 使输入框获得焦点     |
| `blur()`                | 使输入框失去焦点     |
| `setCursorIndex(index)` | 设置光标位置         |
| `setText(text)`         | 程序化设置输入框文本 |

此外，`inputRef` 和 `textAreaRef` 暴露了底层 `Input` / `TextArea` 的 ViewRef `inputRef` 和`textAreaRef`，可以直接操作。

## 参考代码

### 最简单的输入框

```Kotlin
InputSimple {
    attr {
        inputPreset = InputPreset.H_32
        placeholder = "请输入"
    }
    event {
        textDidChange { text -> /* ... */ }
    }
}
```

### 多行输入

```Kotlin
InputSimple {
    attr {
        inputPreset = InputPreset.MULTI_LINE
        placeholder = "请输入多行内容"
        horizontalPadding = 12f
    }
    event {
        textDidChange { text -> /* ... */ }
    }
}
```

### 仅允许数字输入

使用内置的过滤规则：

```Kotlin
InputSimple {
    attr {
        inputPreset = InputPreset.H_36
        placeholder = "数字"
        inputFilterRule = InputSimpleView.filterOnlyNumber // 一个过滤规则预设
    }
    event {
        textDidChange { text -> /* 已是纯数字 */ }
        onFilterTrigger { rawInput ->
            // 用户输入了非数字字符
        }
    }
}
```

### 自定义过滤规则（仅允许小数）

```Kotlin
val typingRegex = Regex("""^-?\d*(\.\d*)?$""")

InputSimple {
    attr {
        placeholder = "0.0"
        inputFilterRule = { input ->
            if (typingRegex.matches(input)) input else ""  // 不合法则清空
        }
    }
}
```

### 最大字符数限制

```Kotlin
InputSimple {
    attr {
        placeholder = "最多 10 字符"
        maxTextLength = 10 to LengthLimitType.CHAR
    }
    event {
        onExceedLimit {
            // 用户输入超过 10 字符
        }
    }
}
```

### 程序化控制（focus / blur / setText）

```Kotlin
private var inputRef: ViewRef<InputSimpleView>? = null// ...body
InputSimple {
    ref { ctx.inputRef = it }
    attr { placeholder = "点按钮操作我" }
}

WGButton {
    attr { text = "聚焦并设置文本" }
    event {
        onClick {
            ctx.inputRef?.view?.setText("Hello")
            ctx.inputRef?.view?.focus()
            ctx.inputRef?.view?.setCursorIndex(0)
        }
    }
}
```

### 注入底层 Input 属性

```Kotlin
InputSimple {
    attr {
        placeholder = "搜索"
        additionalInputAttributes = {
            autoFocus(true)
            returnKeyTypeSearch()  // 回车键显示为"搜索"
        }
    }
}
```

## 组件特性

### 过滤规则

`inputFilterRule` 是类型为`((String) -> String)?`的属性，在每次文本变化时都会运行一次，该lambda函数的输入为用户写入的文本，输出为经过过滤规则后的文本。文本过滤后，会自动将返回值回写到输入框。

- 若返回值与原始输入**不同**，会触发 `onFilterTrigger(原始文本)` 并强制回写纠正值，该回写**不会**触发 `textDidChange`
- 若返回值与原始输入**相同**，会正常触发 `textDidChange(文本)`

### 组件布局（高度和宽度）

`InputSimple` 的：

- 高度：固定，由 `inputPreset` 或 `customContainerHeight` 决定。
- 宽度：可以固定（由 `customContainerWidth` 决定），否则则默认撑满父容器。水平空出的间距由`horizontalPadding`决定。

### 单行、多行模式

根据 `inputPreset` 自动切换渲染组件：

- `H_32` / `H_36` → 渲染为 `Input`，通过 `inputRef` 操作
- `MULTI_LINE` / `MULTI_LINE_AUTO_SWAP` → 渲染为 `TextArea`，通过 `textAreaRef` 操作

公开方法（`focus()` / `blur()` / `setCursorIndex()` / `setText()`）会自动转发到对应的底层组件，调用方不需要关心内部用的是哪个。

### 初始文本

`initialText` 仅在 `created()` 时写入一次，**后续修改它不会更新输入框**。如果你需要响应式地从外部注入文本，应该使用上层的 [InputText](https://slowisfast.feishu.cn/wiki/PUtowSvZ3iYZECkZmSkc5K3DnAe) / [InputSimple](https://slowisfast.feishu.cn/wiki/Q820w4scxirGKpkgZ7jcfxPSnVe) 并使用它们的 `observableText` 属性，或者通过 `ref` 调用 `setText()`。