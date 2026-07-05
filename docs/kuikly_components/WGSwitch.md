# WGSwitch

Demo 页 page 名称：`KuiklySwitchPage`

## 概览

WGSwitch —— iOS 风格开关组件，默认 44×24，白色滑块，开启时为绿色轨道，关闭时灰色轨道。

```Kotlin
WGSwitch {
    attr {
        isOn = true
        disabled = false
    }
    event {
        onChange { newState ->
            // 状态变化时立即触发
        }
        onSwitchAnimComplete { finalState ->
            // 切换后 300ms 且状态未变时触发
        }
    }
}
```

支持禁用态，禁用时滑块和轨道颜色自动降低不透明度。

## API

### WGSwitch 属性（`WGSwitchAttr`）

| **name**              | **type**  | **功能**                                     | **default value** |
| --------------------- | --------- | -------------------------------------------- | ----------------- |
| `isOn` (*响应式*)     | `Boolean` | 开关是否开启，变化时触发 UI 更新             | `false`           |
| `disabled` (*响应式*) | `Boolean` | 开关是否禁用（不可交互），变化时触发 UI 更新 | `false`           |
| `width`               | `Float`   | 开关宽度                                     | `44f`             |
| `height`              | `Float`   | 开关高度                                     | `24f`             |
| `thumbColor`          | `Color`   | 滑块颜色，禁用时自动调整不透明度             | `Color.WHITE`     |
| `onColor`             | `Color`   | 开启时轨道颜色                               | `green_1_100`     |
| `unOnColor`           | `Color`   | 关闭时轨道颜色                               | `bg_gray_06`      |
| `disabledOnColor`     | `Color`   | 禁用且开启时轨道颜色                         | `green_1_20`      |

### WGSwitch 事件（`WGSwitchEvent`）

| **name**               | **type**            | **功能**                                                     |
| ---------------------- | ------------------- | ------------------------------------------------------------ |
| `onChange`🌟            | `(Boolean) -> Unit` | 开关状态变化时立即触发，参数为新状态                         |
| `onSwitchAnimComplete` | `(Boolean) -> Unit` | 状态变化后 300ms 触发（仅当该时刻状态与变化时一致），参数为稳定后的状态 |

### 公开方法（`WGSwitchView`）

通过 `ref` 获取视图实例后可调用以下方法：

| **方法**    | **返回值** | **功能**                           |
| ----------- | ---------- | ---------------------------------- |
| `toggle()`  | `Boolean`  | 切换开关状态，返回切换**前**的状态 |
| `turnOn()`  | `Boolean`  | 打开开关，返回打开**前**的状态     |
| `turnOff()` | `Boolean`  | 关闭开关，返回关闭**前**的状态     |

> 以上方法均会触发 `onChange` 和 `onSwitchAnimComplete` 事件。

## 参考代码

### 基础用法

最简单的开关，监听状态变化：

```Kotlin
WGSwitch {
    attr {
        isOn = false
    }
    event {
        onChange { newState ->
            // newState: 新的开关状态
        }
    }
}
```

### 禁用状态

```Kotlin
// 禁用且开启
WGSwitch {
    attr {
        isOn = true
        disabled = true
    }
}
```

### 自定义颜色

```Kotlin
WGSwitch {
    attr {
        isOn = true
        onColor = Color(0, 122, 255, 1f)       // 蓝色轨道
        unOnColor = Color(255, 149, 0, 1f)      // 橙色轨道
        thumbColor = Color(255, 255, 255, 1f)
    }
    event {
        onChange { /* ... */ }
    }
}
```

### 外部控制状态

通过 `observable` 变量双向绑定开关状态：

```Kotlin
private var switchIsOn by observable(false)

// ...body
WGSwitch {
    attr {
        isOn = ctx.switchIsOn
    }
    event {
        onChange { newState ->
            ctx.switchIsOn = newState
        }
    }
}
```

### 命令式控制（ref）

使用 `ref` 获取实例，通过方法直接操控开关：

```Kotlin
private var switchView: WGSwitchView? = null// ...body
WGSwitch(ref = { switchView = it }) {
    attr { isOn = false }
    event {
        onChange { newState -> /* ... */ }
    }
}

// 在按钮或其他地方调用
switchView?.toggle()   // 切换
switchView?.turnOn()   // 打开
switchView?.turnOff()  // 关闭
```

## 组件特性

### 动画完成事件

`onSwitchAnimComplete` 在状态变化后延迟 300ms 触发。如果在 300ms 内开关状态再次变化，则该次事件不会触发——这可以用来做"用户确认切换后"的操作（如网络请求），避免快速连续点击导致多次请求。

### 禁用态行为

- 禁用时开关不响应用户触摸。
- 滑块不透明度自动降低：开启态 0.9，关闭态 0.6。
- 轨道颜色切换为 `disabledOnColor`（默认 `green_1_20`）。