# Counter

Demo 页 page 名称：`KuiklyCounterDemoPage`

## 概览

![img](https://slowisfast.feishu.cn/space/api/box/stream/download/asynccode/?code=ZWY2ZjNiNDk3Y2UwYjM0MWZkYmY5N2IzZjkzZjZhMWJfT1VGWXhMVmxOcXo0TmFZdVpEQlJpcVZLbnBZblFCZzZfVG9rZW46Sm9jeWJVODlrbzlBV0N4c3V1NGNpZkJYbkhnXzE3NzY2NTI5MzY6MTc3NjY1NjUzNl9WNA)

Counter 是带加减按钮的数字计数器组件，基于 [InputSimple](https://slowisfast.feishu.cn/wiki/Q820w4scxirGKpkgZ7jcfxPSnVe) 封装。由左侧减号按钮 + 中间数字输入框 + 右侧加号按钮组成。默认仅允许正整数、点击按钮自动 ±1，支持最大/最小值限制、自动报错等功能。

```Kotlin
Counter {
    attr {
        minNumber = 0
        maxNumber = 10
        placeholder = "0"
    }
    event {
        textDidChange { text -> /* ... */ }
        onExceedLimit { isMax ->
            // isMax: true = 超最大值, false = 超最小值
        }
    }
}
```

组件布局：

```Plain
┌──────────────────────────────┐  
│  [−]   [  数字输入  ]   [+]   │
│  28×28     36×28      28×28  │
└──────────────────────────────┘
```

整体 96×32，内边距 2pt，圆角 4pt。默认有 `bg_gray_03` 浅灰背景色，加减按钮为白底细边框。进入报错状态后叠加 `red_10` 背景色 + `red_100` 红边框。

## API

### Counter 属性（`CounterViewAttr`）

| **name**                      | **type**                | **功能**                                                     | **default value**                  |
| ----------------------------- | ----------------------- | ------------------------------------------------------------ | ---------------------------------- |
| `observableText`*响应式🌟      | `String`                | 外部注入文本；修改该值可程序化更新输入框内容                 | `""`                               |
| `placeholder`                 | `String`                | 占位提示文本                                                 | `"0"`                              |
| `errorState`*响应式🌟          | `Boolean`               | 报错状态（红色背景 + 红边框）                                | `false`                            |
| `maxNumber`🌟                  | `Int`                   | 最大允许整数值                                               | `999`                              |
| `minNumber`🌟                  | `Int`                   | 最小允许整数值                                               | `Int.MIN_VALUE`                    |
| `customFilter`                | `((String) -> String)?` | 自定义输入过滤规则（见下方说明）；默认仅允许正整数。设为 `null` 可关闭过滤 | `InputSimpleView.filterOnlyNumber` |
| `autoCount`🌟                  | `Boolean`               | 点击 ±按钮时是否自动对当前值 ±1，而非外部控制                | `true`                             |
| `blurOnReturn`                | `Boolean`               | 按下回车键自动失焦                                           | `true`                             |
| `preventDefaultErrorBehavior` | `Boolean`               | 禁用默认的"超限自动报错 / 聚焦自动清错"行为，由外部完全控制  | `false`                            |
| `errorBackground`             | `Color`                 | 自定义报错背景色                                             | `red_10`                           |
| `errorBorderColor`            | `Color`                 | 自定义报错边框颜色                                           | `red_100`                          |

### Counter 事件（`CounterViewEvent`）

| **name**         | **type**            | **功能**                                             |
| ---------------- | ------------------- | ---------------------------------------------------- |
| `textDidChange`🌟 | `(String) -> Unit`  | 文本变化，参数为**过滤后**的文本                     |
| `onMinusClick`   | `() -> Unit`        | 点击减号按钮                                         |
| `onPlusClick`    | `() -> Unit`        | 点击加号按钮                                         |
| `onExceedLimit`🌟 | `(Boolean) -> Unit` | 超出限制，参数 `true` = 超最大值，`false` = 超最小值 |
| `onReturn`       | `() -> Unit`        | 按下回车键                                           |
| `onFocus`        | `() -> Unit`        | 获得焦点                                             |
| `onFocusLost`    | `() -> Unit`        | 失去焦点                                             |

### 公开方法

| **方法**                       | **功能**                          |
| ------------------------------ | --------------------------------- |
| `CounterView.filterOnlyNumber` | 过滤除了正整数以外的其它数        |
| `CounterView.filterIntRange`   | 允许负整数（含单独的 "-" 中间态） |
| `focus()`                      | 聚焦输入框                        |
| `blur()`                       | 失焦输入框                        |
| `setCursorIndex(index)`        | 设置光标位置                      |
| `setText(text)`                | 程序化设置输入框文本              |

## 参考代码

### 基础用法

```Kotlin
Counter {
    event {
        textDidChange { text -> /* ... */ }
        onMinusClick { /* 点击减号 */ }
        onPlusClick { /* 点击加号 */ }
    }
}
```

### 自定义范围（0 ≤ n ≤ 10）

```Kotlin
Counter {
    attr {
        minNumber = 0
        maxNumber = 10
        placeholder = "0"
    }
    event {
        onExceedLimit { isMax ->
            // isMax=true: 超出 10 / isMax=false: 低于 0
        }
    }
}
```

### 允许负整数

```Kotlin
private var counterText by observable("")

// ... body
Counter {
    attr {
        customFilter = CounterView.filterIntRange
        placeholder = "0"
        minNumber = -999 // 需要设置最小值
    }
    event {
        textDidChange { text -> 
            ctx.counterText = text
        }
        onFocusLost = {
            if(ctx.counterText == "-") {
                this@Counter.getViewAttr().errorState = true // 在仅有一个 "-" 的时候报错
            }
        }
    }
}
```

### 自定义报错颜色

```Kotlin
Counter {
    attr {
        maxNumber = 5
        placeholder = "≤ 5"
        errorBackground = ColorManager.orange_10
        errorBorderColor = ColorManager.orange_100
    }
}
```

### 外部控制报错（preventDefaultErrorBehavior）

```Kotlin
private var errorState by observable(false)

// ...body
Counter {
    attr {
        preventDefaultErrorBehavior = true
        errorState = ctx.errorState
    }
}

WGButton {
    attr { text = "开启报错" }
    event { onClick { ctx.errorState = true } }
}
```

### autoCount = false（按钮只回调，不自动增减）

用于需要完全自定义 ±按钮行为的场景（例如：点击 ± 追加/删除字符串、弹出选择器等）：

```Kotlin
private var text by observable("")

// ...body
Counter {
    attr {
        autoCount = false
        customFilter = null  // 关闭数字过滤，接受任意字符
        placeholder = ""
    }
    event {
        textDidChange { ctx.text = it }
        onPlusClick {
            // 每次追加 "x"
            val next = ctx.text + "x"this@Counter.setText(next)
            ctx.text = next
        }
        onMinusClick {
            // 每次删除最后一个字符
            if (ctx.text.isNotEmpty()) {
                val next = ctx.text.dropLast(1)
                this@Counter.setText(next)
                ctx.text = next
            }
        }
    }
}
```

### 外部注入文本（observableText）

```Kotlin
private var counterValue by observable("42")

// ...body
Counter {
    attr { observableText = ctx.counterValue }
    event {
        textDidChange { ctx.counterValue = it }
    }
}

WGButton {
    attr { text = "注入 99" }
    event { onClick { ctx.counterValue = "99" } }
}
```

### 程序化聚焦 / 光标控制

```Kotlin
private var counterRef: ViewRef<CounterView>? = null

// ...body
Counter {
    ref { ctx.counterRef = it }
}

WGButton {
    attr { text = "聚焦并设光标到开头" }
    event {
        onClick {
            ctx.counterRef?.view?.focus()
            ctx.counterRef?.view?.setCursorIndex(0)
        }
    }
}
```

## 组件特性

### 默认过滤行为

- `customFilter` 默认使用 `CounterView.filterOnlyNumber`，自动过滤掉所有非数字字符。
- 设为 `null` 可关闭过滤，接受任意字符。
- 设为 `.filterIntRange` 允许负整数（含单独的 "-" 中间态） 。**建议**：在输入框失去聚焦时检验是否仅有一个“-” 并手动触发 `errorState` 报错

### autoCount 工作方式

`autoCount = true`（默认）时，点击 ±按钮会：

1. 读取当前文本（空字符串视为 0）
2. 对整数值 ±1
3. 若结果超出 `[minNumber, maxNumber]`：触发 `onExceedLimit(isMax)` 并设置 `errorState`

设置 `autoCount = false` 时，±按钮**只触发** `onMinusClick` / `onPlusClick` 回调，不做任何值变化。此时你需要在回调里调用 `setText()` 或者赋值 `observableText` 手动更新值。

### 最大/最小值校验逻辑

`maxNumber` / `minNumber` 只在 `customFilter` 使用内置的 `filterOnlyNumber` 或 `filterIntRange` 时生效。流程与 [InputNumber](https://slowisfast.feishu.cn/wiki/PQIUw4MYUi1xUdkJVLJcwHvgnMh#VBAYdX0Wpotg43xrqMccWxd4nfd) 类似：

1. 用户输入或点击按钮导致文本变化
2. 组件尝试 `toIntOrNull()` 解析
3. 超出范围时：
   1. 如果是通过键盘赋值：
      1. 首先触发一次 `textDidChange`，包含超出范围的值
      2. 触发一次 `onExceedLimit(isMax)`
      3. 然后会强制回写边界值、并设置`errorState = true`、然后再触发一次包含边界值的 textDidChange
   2. 如果是通过 “-” “+” 按钮赋值：
      1. 不会回写边界值，只触发 onExceedLimit。
      2. 由于没有对内部输入框赋值，所以不会触发错误值的 `textDidChange`，也不会触发边界值的`textDidChange`。

### errorGuard 机制

与 [InputNumber](https://slowisfast.feishu.cn/wiki/PQIUw4MYUi1xUdkJVLJcwHvgnMh) 相同：超限触发报错并回写边界值后，下一次由回写产生的 `textDidChange` 会正常执行清错逻辑。为保留视觉报错效果，组件内部用 `errorGuard` 标记消耗一次清错机会。

### 聚焦自动清错

默认情况下，获得焦点时会清除 `errorState`。设置 `preventDefaultErrorBehavior = true` 可禁用此行为。

### 与 InputNumber 的区别

|                  | Counter                        | [InputNumber](https://slowisfast.feishu.cn/wiki/PQIUw4MYUi1xUdkJVLJcwHvgnMh) |
| ---------------- | ------------------------------ | ------------------------------------------------------------ |
| 布局             | 减号 + 输入 + 加号             | 输入 + 单位文本（可选）                                      |
| 整体尺寸         | 固定 96×32                     | 宽 80~128（默认 128）× 高 32                                 |
| 默认 `maxNumber` | 999                            | `Int.MAX_VALUE`                                              |
| 默认 `minNumber` | 0                              | /                                                            |
| 负数支持         | 通过 `filterIntRange` 支持     | 不支持                                                       |
| 单位文本         | 不支持                         | 支持右侧单位                                                 |
| ±按钮            | 自带                           | 无                                                           |
| 按钮回调         | `onMinusClick` / `onPlusClick` | /                                                            |
| `autoCount`      | 支持                           | /                                                            |