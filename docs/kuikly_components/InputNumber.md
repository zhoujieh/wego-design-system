# InputNumber

Demo 页 page 名称：`KuiklyInputNumberPage`

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=YTRhZGY0YzgzN2ExZmUyZmE2YzQyYWNlMzYzMTU1NmRfRzduNHFzclRNMVI0ZXFWTXVTOXUxMThkN3pFWG90NWlfVG9rZW46V0dJQ2JrMmtwb0xDMkN4Rkc1NGN1Z0cwbk5oXzE3NzY1MTIxMDY6MTc3NjUxNTcwNl9WNA)

## 概览

InputNumber 是数字输入框分子级组件，基于 [InputSimple](https://slowisfast.feishu.cn/wiki/Q820w4scxirGKpkgZ7jcfxPSnVe) 封装。默认仅允许输入整数、文字居中加粗，支持最大值限制、自动报错、右侧单位文本等功能。

```Kotlin
InputNumber {
    attr {
        placeHolder = "≤ 100"
        maxNumber = 100
        unitText = "元"
    }
    event {
        textDidChange { text -> /* ... */ }
        onExceedLimit { /* 超出 100 自动回写并报错 */ }
    }
}
```

组件结构：

```Plain
┌─────────────────────────────────────────┐
│  [居中数字输入]        [单位文本(可选)]     │  ← 高度固定 32pt，圆角 6f
└─────────────────────────────────────────┘
```

默认有 `bg_gray_03_pack` 浅灰底色 + `bg_line_08` 细边框。进入报错状态后叠加 `red_10` 背景色 + `red_100` 红边框。

## API

### InputNumber 属性（`InputNumberViewAttr`）

| **name**                                | **type**                | **功能**                                                     | **default value**                  |
| --------------------------------------- | ----------------------- | ------------------------------------------------------------ | ---------------------------------- |
| `width` / `width(Float)`                | `Float`                 | 容器宽度（设计稿范围：最小 80，最大 128）                    | `128f`                             |
| `background` / `backgroundColor(Color)` | `Color`                 | 容器背景色                                                   | `bg_gray_03_pack`                  |
| `observableText`****响应式*** 🌟         | `String`                | 外部注入文本；修改该值可程序化更新输入框内容                 | `""`                               |
| `placeHolder`                           | `String`                | 占位提示文本                                                 | `""`                               |
| `unitText`🌟                             | `String`                | 右侧固定单位文本（如"元"）；非空时才显示                     | `""`                               |
| `errorState`****响应式***               | `Boolean`               | 报错状态（显示红色背景 + 红边框）                            | `false`                            |
| `maxNumber`🌟                            | `Int`                   | 最大允许整数值；超出时自动回写上限并触发报错                 | `Int.MAX_VALUE`                    |
| `preventDefaultErrorBehavior`           | `Boolean`               | 禁用默认的 触发过滤自动报错、聚焦自动清错的行为，由外部完全控制 | `false`                            |
| `customFilter`🌟                         | `((String) -> String)?` | 自定义输入过滤规则（见下方说明）；设为 `null` 可关闭过滤。默认过滤保留非负整数 | `InputSimpleView.filterOnlyNumber` |
| `blurOnReturn`                          | `Boolean`               | 按下回车键是否自动失焦                                       | `true`                             |
| `tintColor`                             | `Color?`                | 光标及选中高亮颜色；`null` 使用默认品牌绿                    | `null`                             |
| `errorBackground`                       | `Color`                 | 自定义报错背景色                                             | `red_10`                           |
| `errorBorderColor`                      | `Color`                 | 自定义报错边框颜色                                           | `red_100`                          |
| `additionalInputAttributes`             | `InputAttr.() -> Unit`  | 注入底层 `Input` 的额外属性，如 `autoFocus(true)`            | `{}`                               |

### InputNumber 事件（`InputNumberViewEvent`）

| **name**         | **type**           | **功能**                                            |
| ---------------- | ------------------ | --------------------------------------------------- |
| `textDidChange`🌟 | `(String) -> Unit` | 文本变化，参数为**过滤后**的文本                    |
| `onExceedLimit`🌟 | `() -> Unit`       | 输入值超过 `maxNumber` 限制（自动截断至上限后触发） |
| `onReturn`       | `() -> Unit`       | 按下回车键                                          |
| `onFocus`        | `() -> Unit`       | 获得焦点                                            |
| `onFocusLost`    | `() -> Unit`       | 失去焦点                                            |

### 公开方法

通过 `ref` 获取 `InputNumberView` 实例后可调用：

| **方法**                | **功能**     |
| ----------------------- | ------------ |
| `focus()`               | 聚焦输入框   |
| `blur()`                | 失焦输入框   |
| `setCursorIndex(index)` | 设置光标位置 |

## 参考代码

### 基础用法

```Kotlin
InputNumber {
    attr {
        placeHolder = "0"
    }
    event {
        textDidChange { text -> /* ... */ }
    }
}
```

### 带最大值限制（超出自动报错）

```Kotlin
InputNumber {
    attr {
        placeHolder = "≤ 100"
        maxNumber = 100
    }
    event {
        textDidChange { text -> /* ... */ }
        onExceedLimit {
            // 超出 100 时触发，值已被截断至 100，errorState 已置 true
        }
    }
}
```

### 带右侧单位文本

```Kotlin
InputNumber {
    attr {
        placeHolder = "0"
        unitText = "元"
    }
    event {
        textDidChange { text -> /* ... */ }
    }
}
```

### 外部手动控制报错（preventDefaultErrorBehavior）

禁用默认的聚焦清错/超限报错行为，完全由外部控制：

```Kotlin
private var errorState by observable(false)

// ...body
InputNumber {
    attr {
        placeHolder = "任意数字"
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

### 自定义过滤规则（仅允许小数）

设为 `null` 可关闭默认的纯数字过滤，结合 `customFilter` 实现更复杂的规则：

```Kotlin
val typingRegex = Regex("""^-?\d*(\.\d*)?$""")

InputNumber {
    attr {
        placeHolder = "0.0"
        customFilter = { input ->
            val trimmed = input.trim()
            if (typingRegex.matches(trimmed)) {
                this@InputNumber.getViewAttr().errorState = false
                trimmed
            } else {
                this@InputNumber.getViewAttr().errorState = true
                ctx.previousValue  // 回退到上一次合法值
            }
        }
    }
}
```

> **注意**：一旦设置了非默认的 `customFilter`，`maxNumber` 的自动校验和 `onExceedLimit` 将**不再**触发（需要在 filter 内自己实现）。

### 程序化聚焦 / 光标控制

```Kotlin
private var inputRef: ViewRef<InputNumberView>? = null// ...body
InputNumber {
    ref { ctx.inputRef = it }
    attr { placeHolder = "12345" }
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
private var textValue by observable("42")

// ...body
InputNumber {
    attr {
        observableText = ctx.textValue
        placeHolder = "0"
    }
    event {
        textDidChange { ctx.textValue = it }
    }
}

WGButton {
    attr { text = "设为 999" }
    event { onClick { ctx.textValue = "999" } }
}
```

## 组件特性

### 默认过滤行为

- `customFilter` 默认使用 `InputSimpleView.filterOnlyNumber`，自动过滤掉所有非数字字符。
- 设为 `null` 可关闭过滤，接受任意字符。
- 设为 `CounterView.filterIntRange` 允许负整数（含单独的 "-" 中间态） 

### 最大值校验逻辑

`maxNumber` **仅在使用默认的** **`filterOnlyNumber`** **过滤时生效。**流程：

1. 用户输入任意数字
2. 组件尝试 `toInt()` 解析文本
3. 超出 `maxNumber` 时：
   1. 强制回写 `maxNumber` 字符串
   2. `errorState` 置为 `true`（除非 `preventDefaultErrorBehavior = true`）
   3. 触发 `onExceedLimit` 回调
4. 未超出时：清除 `errorState`（除非有 errorGuard 保护，见下）

### errorGuard 机制

当超限触发报错后，下一次 `textDidChange`（来自强制回写的 `maxNumber` 值）会正常执行清错逻辑。为了**保留这次纠正后的报错视觉效果**，组件内部使用 `errorGuard` 标记消耗一次清错机会，避免用户看到"报错闪一下就消失"。

### 聚焦自动清错

默认情况下，获得焦点时会清除 `errorState`——用户开始输入意味着要修改错误内容。设置 `preventDefaultErrorBehavior = true` 可禁用此行为。

### 与 InputText 的区别

| 组件                  | `InputNumber`         | `InputText` [InputText](https://slowisfast.feishu.cn/wiki/PUtowSvZ3iYZECkZmSkc5K3DnAe) |
| --------------------- | --------------------- | ------------------------------------------------------------ |
| 文字对齐              | **居中**              | **左对齐**                                                   |
| 文字加粗              | 是                    | 否                                                           |
| 默认宽度              | 128pt（有限制范围）   | `flex(1f)` 撑满                                              |
| 默认高度              | 固定 32pt             | 单行 36pt / 多行 58pt                                        |
| 默认过滤              | 仅数字                | 无                                                           |
| 多行支持              | 不支持                | 支持                                                         |
| 最大值校验            | 内置 `maxNumber` 支持 | 无                                                           |
| 单位文本              | 支持右侧单位          | 无                                                           |
| `blurOnReturn` 默认值 | `true`                | `false`                                                      |